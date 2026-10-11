const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need, canManageCourse, coursesOfStudent, gradePoint, notify } = require('../utils/helpers');

router.use(authenticate);

const decorate = (m) => ({
  ...m,
  courseName: db.courses.byId(m.courseId)?.name || null,
  courseCode: db.courses.byId(m.courseId)?.code || null,
  studentName: db.users.byId(m.studentId)?.name || null,
  percentage: m.maxMarks ? Math.round((m.obtained / m.maxMarks) * 100) : 0,
});

router.get('/', wrap(async (req, res) => {
  const { courseId, studentId } = req.query;
  let list = db.marks.all();
  if (req.user.role === 'faculty') {
    const myCourseIds = new Set(db.courses.find((c) => c.facultyId === req.user.id).map((c) => c.id));
    list = list.filter((m) => myCourseIds.has(m.courseId));
  }
  if (req.user.role === 'student') list = list.filter((m) => m.studentId === req.user.id);
  if (courseId) list = list.filter((m) => m.courseId === courseId);
  if (studentId) {
    if (req.user.role === 'student' && studentId !== req.user.id) throw httpError(403, 'You can only view your own marks');
    list = list.filter((m) => m.studentId === studentId);
  }
  res.json(list.map(decorate));
}));

// CGPA-style summary across a student's courses (simple average grade point).
router.get('/summary/:studentId?', wrap(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;
  if (req.user.role === 'student' && studentId !== req.user.id) throw httpError(403, 'You can only view your own marks');
  const rows = db.marks.find((m) => m.studentId === studentId);
  const byCourse = {};
  rows.forEach((m) => {
    (byCourse[m.courseId] ||= []).push(m);
  });
  const perCourse = Object.entries(byCourse).map(([courseId, entries]) => {
    const obtained = entries.reduce((s, e) => s + e.obtained, 0);
    const max = entries.reduce((s, e) => s + e.maxMarks, 0);
    const pct = max ? Math.round((obtained / max) * 100) : 0;
    return { courseId, courseName: db.courses.byId(courseId)?.name, percentage: pct, gradePoint: gradePoint(pct) };
  });
  const cgpa = perCourse.length ? (perCourse.reduce((s, c) => s + c.gradePoint, 0) / perCourse.length).toFixed(2) : '0.00';
  res.json({ perCourse, cgpa });
}));

router.post('/', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const { courseId, studentId, examType, obtained, maxMarks } = req.body;
  need(req.body, ['courseId', 'studentId', 'examType', 'obtained', 'maxMarks']);
  const course = db.courses.byId(courseId);
  if (!course) throw httpError(404, 'Course not found');
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  const student = db.users.byId(studentId);
  if (!student || student.role !== 'student') throw httpError(404, 'Student not found');
  if (Number(obtained) > Number(maxMarks)) throw httpError(400, 'Obtained marks cannot exceed max marks');

  const existing = db.marks.findOne((m) => m.courseId === courseId && m.studentId === studentId && m.examType === examType);
  const payload = { courseId, studentId, examType, obtained: Number(obtained), maxMarks: Number(maxMarks), enteredBy: req.user.id };
  const row = existing ? db.marks.update(existing.id, payload) : db.marks.insert(payload);
  notify([studentId], 'Marks updated', `${examType} marks posted for ${course.name}: ${obtained}/${maxMarks}`, '/student/marks');
  res.status(existing ? 200 : 201).json(decorate(row));
}));

router.delete('/:id', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const m = db.marks.byId(req.params.id);
  if (!m) throw httpError(404, 'Marks entry not found');
  const course = db.courses.byId(m.courseId);
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  db.marks.remove(m.id);
  res.json({ message: 'Marks entry deleted' });
}));

module.exports = router;
