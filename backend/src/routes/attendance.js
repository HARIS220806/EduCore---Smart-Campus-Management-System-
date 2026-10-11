const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need, studentsOfCourse, coursesOfStudent, canManageCourse, notify } = require('../utils/helpers');

router.use(authenticate);

// One attendance doc per (course, date) holding a `records` array of { studentId, status }.
router.get('/', wrap(async (req, res) => {
  const { courseId, date, studentId } = req.query;
  let list = db.attendance.all();

  if (req.user.role === 'faculty') {
    const myCourseIds = new Set(db.courses.find((c) => c.facultyId === req.user.id).map((c) => c.id));
    list = list.filter((a) => myCourseIds.has(a.courseId));
  }
  if (courseId) {
    const c = db.courses.byId(courseId);
    if (!c) throw httpError(404, 'Course not found');
    if (req.user.role === 'faculty' && !canManageCourse(req.user, c)) throw httpError(403, 'You do not teach this course');
    list = list.filter((a) => a.courseId === courseId);
  }
  if (date) list = list.filter((a) => a.date === date);

  if (req.user.role === 'student') {
    const myCourseIds = new Set(coursesOfStudent(req.user).map((c) => c.id));
    list = list.filter((a) => myCourseIds.has(a.courseId)).map((a) => ({
      ...a, records: a.records.filter((r) => r.studentId === req.user.id),
    }));
  } else if (studentId) {
    list = list.map((a) => ({ ...a, records: a.records.filter((r) => r.studentId === studentId) }));
  }
  res.json(list.map((a) => ({ 
    ...a, 
    courseName: db.courses.byId(a.courseId)?.name || null, 
    courseCode: db.courses.byId(a.courseId)?.code || null,
    markedByName: db.users.byId(a.markedBy)?.name || 'Unknown Faculty'
  })));
}));

// A student's attendance summary: present / total / percentage, per course and overall.
router.get('/summary/:studentId?', wrap(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  if (req.user.role === 'student' && studentId !== req.user.id) throw httpError(403, 'You can only view your own attendance');
  const student = db.users.byId(studentId);
  if (!student || student.role !== 'student') throw httpError(404, 'Student not found');

  const courses = coursesOfStudent(student);
  const perCourse = courses.map((c) => {
    const sessions = db.attendance.find((a) => a.courseId === c.id);
    const total = sessions.length;
    const present = sessions.filter((a) => a.records.find((r) => r.studentId === studentId)?.status === 'present').length;
    return { courseId: c.id, courseName: c.name, courseCode: c.code, total, present, percentage: total ? Math.round((present / total) * 100) : 100 };
  });
  const total = perCourse.reduce((s, c) => s + c.total, 0);
  const present = perCourse.reduce((s, c) => s + c.present, 0);
  res.json({ perCourse, overall: total ? Math.round((present / total) * 100) : 100, minRequired: db.getSettings().minAttendance });
}));

// Mark/replace attendance for a whole course on one date.
router.post('/', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const { courseId, date, records } = req.body;
  need(req.body, ['courseId', 'date', 'records']);
  const course = db.courses.byId(courseId);
  if (!course) throw httpError(404, 'Course not found');
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  if (!Array.isArray(records) || !records.length) throw httpError(400, 'records must be a non-empty array');
  const valid = new Set(studentsOfCourse(course).map((s) => s.id));
  const clean = records
    .filter((r) => valid.has(r.studentId))
    .map((r) => ({ studentId: r.studentId, status: r.status === 'present' ? 'present' : 'absent' }));

  const existing = db.attendance.findOne((a) => a.courseId === courseId && a.date === date);
  const row = existing
    ? db.attendance.update(existing.id, { records: clean, markedBy: req.user.id })
    : db.attendance.insert({ courseId, date, records: clean, markedBy: req.user.id });
  res.status(existing ? 200 : 201).json(row);
}));

module.exports = router;
