const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need, canManageCourse, coursesOfStudent } = require('../utils/helpers');

router.use(authenticate);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const decorate = (t) => ({
  ...t,
  day: t.dayOfWeek || t.day,
  courseName: db.courses.byId(t.courseId)?.name || null,
  courseCode: db.courses.byId(t.courseId)?.code || null,
  facultyName: db.users.byId(db.courses.byId(t.courseId)?.facultyId)?.name || null,
});

router.get('/', wrap(async (req, res) => {
  await db.timetable.sync();
  await db.courses.sync();
  let list = db.timetable.all();
  if (req.user.role === 'faculty') {
    const myCourseIds = new Set(db.courses.find((c) => c.facultyId === req.user.id).map((c) => c.id));
    list = list.filter((t) => myCourseIds.has(t.courseId));
  }
  if (req.user.role === 'student') {
    const myCourseIds = new Set(coursesOfStudent(req.user).map((c) => c.id));
    list = list.filter((t) => myCourseIds.has(t.courseId));
  }
  if (req.query.departmentId) {
    const courseIds = new Set(db.courses.find((c) => c.departmentId === req.query.departmentId).map((c) => c.id));
    list = list.filter((t) => courseIds.has(t.courseId));
  }
  res.json(list.map(decorate).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime)));
}));

router.post('/', authorize('admin'), wrap(async (req, res) => {
  await db.timetable.sync();
  await db.courses.sync();
  const { courseId, day, startTime, endTime, room } = req.body;
  need(req.body, ['courseId', 'day', 'startTime', 'endTime']);
  if (!DAYS.includes(day)) throw httpError(400, `day must be one of: ${DAYS.join(', ')}`);
  if (!db.courses.byId(courseId)) throw httpError(404, 'Course not found');
  const row = await db.timetable.insert({ courseId, dayOfWeek: day, startTime, endTime, room: room || '' });
  res.status(201).json(decorate(row));
}));

router.delete('/:id', authorize('admin'), wrap(async (req, res) => {
  await db.timetable.sync();
  const existing = db.timetable.byId(req.params.id);
  if (!existing) throw httpError(404, 'Timetable entry not found');
  await db.timetable.remove(req.params.id);
  res.json({ message: 'Timetable entry deleted' });
}));

module.exports = router;
