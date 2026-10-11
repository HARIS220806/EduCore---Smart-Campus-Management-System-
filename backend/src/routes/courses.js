const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need, studentsOfCourse, coursesOfStudent, canManageCourse, publicUser } = require('../utils/helpers');

router.use(authenticate);

const decorate = (c) => ({
  ...c,
  departmentName: db.departments.byId(c.departmentId)?.name || null,
  departmentCode: db.departments.byId(c.departmentId)?.code || null,
  facultyName: db.users.byId(c.facultyId)?.name || null,
  studentCount: studentsOfCourse(c).length,
});

// Role-scoped list: admin = all, faculty = own, student = enrolled
router.get('/', wrap(async (req, res) => {
  await db.courses.sync();
  let list = db.courses.all();
  if (req.user.role === 'faculty') list = list.filter((c) => c.facultyId === req.user.id);
  if (req.user.role === 'student') list = coursesOfStudent(req.user);
  if (req.query.departmentId) list = list.filter((c) => c.departmentId === req.query.departmentId);
  res.json(list.map(decorate));
}));

router.get('/:id/students', wrap(async (req, res) => {
  const c = db.courses.byId(req.params.id);
  if (!c) throw httpError(404, 'Course not found');
  if (!canManageCourse(req.user, c)) throw httpError(403, 'You do not teach this course');
  res.json(studentsOfCourse(c).map(publicUser));
}));

const validate = (b, existingId) => {
  need(b, ['code', 'name', 'departmentId', 'year']);
  if (!db.departments.byId(b.departmentId)) throw httpError(400, 'Unknown department');
  if (b.facultyId && db.users.byId(b.facultyId)?.role !== 'faculty') throw httpError(400, 'Assigned instructor must be a faculty member');
  const code = b.code.trim().toUpperCase();
  if (db.courses.findOne((c) => c.code === code && c.id !== existingId)) throw httpError(409, 'Course code already exists');
  return {
    code, name: b.name.trim(), departmentId: b.departmentId, facultyId: b.facultyId || null,
    year: Number(b.year), semester: Number(b.semester) || 1, credits: Number(b.credits) || 3,
  };
};

router.post('/', authorize('admin'), wrap(async (req, res) => {
  await db.courses.sync();
  const row = await db.courses.insert(validate(req.body));
  res.status(201).json(decorate(row));
}));

router.put('/:id', authorize('admin'), wrap(async (req, res) => {
  const c = db.courses.byId(req.params.id);
  if (!c) throw httpError(404, 'Course not found');
  const row = await db.courses.update(c.id, validate({ ...c, ...req.body }, c.id));
  res.json(decorate(row));
}));

router.delete('/:id', authorize('admin'), wrap(async (req, res) => {
  const c = db.courses.byId(req.params.id);
  if (!c) throw httpError(404, 'Course not found');
  const assignmentIds = db.assignments.find((a) => a.courseId === c.id).map((a) => a.id);
  await db.submissions.removeWhere((s) => assignmentIds.includes(s.assignmentId));
  await db.assignments.removeWhere((a) => a.courseId === c.id);
  await db.attendance.removeWhere((a) => a.courseId === c.id);
  await db.marks.removeWhere((m) => m.courseId === c.id);
  await db.timetable.removeWhere((t) => t.courseId === c.id);
  await db.courses.remove(c.id);
  res.json({ message: 'Course deleted' });
}));

module.exports = router;
