const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need, canManageCourse, coursesOfStudent, studentsOfCourse, notify } = require('../utils/helpers');

router.use(authenticate);

const decorate = (a, forStudentId) => {
  const out = {
    ...a,
    courseName: db.courses.byId(a.courseId)?.name || null,
    courseCode: db.courses.byId(a.courseId)?.code || null,
    submissionCount: db.submissions.find((s) => s.assignmentId === a.id).length,
  };
  if (forStudentId) {
    const mine = db.submissions.findOne((s) => s.assignmentId === a.id && s.studentId === forStudentId);
    out.mySubmission = mine || null;
  }
  return out;
};

router.get('/', wrap(async (req, res) => {
  let list = db.assignments.all();
  if (req.user.role === 'faculty') {
    const myCourseIds = new Set(db.courses.find((c) => c.facultyId === req.user.id).map((c) => c.id));
    list = list.filter((a) => myCourseIds.has(a.courseId));
  }
  if (req.user.role === 'student') {
    const myCourseIds = new Set(coursesOfStudent(req.user).map((c) => c.id));
    list = list.filter((a) => myCourseIds.has(a.courseId));
  }
  if (req.query.courseId) list = list.filter((a) => a.courseId === req.query.courseId);
  res.json(list.map((a) => decorate(a, req.user.role === 'student' ? req.user.id : null)));
}));

router.get('/:id/submissions', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const a = db.assignments.byId(req.params.id);
  if (!a) throw httpError(404, 'Assignment not found');
  const course = db.courses.byId(a.courseId);
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  const subs = db.submissions.find((s) => s.assignmentId === a.id);
  const roster = studentsOfCourse(course);
  res.json(roster.map((s) => {
    const sub = subs.find((x) => x.studentId === s.id);
    return { studentId: s.id, studentName: s.name, registerNumber: s.registerNumber || null, submission: sub || null };
  }));
}));

router.post('/', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const { courseId, title, description, dueDate, maxMarks } = req.body;
  need(req.body, ['courseId', 'title', 'dueDate']);
  const course = db.courses.byId(courseId);
  if (!course) throw httpError(404, 'Course not found');
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  const a = db.assignments.insert({
    courseId, title: title.trim(), description: description || '', dueDate,
    maxMarks: Number(maxMarks) || 100, createdBy: req.user.id,
  });
  notify(studentsOfCourse(course).map((s) => s.id), 'New assignment', `${title} (${course.name}) — due ${dueDate}`, '/student/assignments');
  res.status(201).json(decorate(a));
}));

router.put('/:id', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const a = db.assignments.byId(req.params.id);
  if (!a) throw httpError(404, 'Assignment not found');
  const course = db.courses.byId(a.courseId);
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  const patch = {};
  ['title', 'description', 'dueDate'].forEach((k) => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });
  if (req.body.maxMarks !== undefined) patch.maxMarks = Number(req.body.maxMarks);
  res.json(decorate(db.assignments.update(a.id, patch)));
}));

router.delete('/:id', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const a = db.assignments.byId(req.params.id);
  if (!a) throw httpError(404, 'Assignment not found');
  const course = db.courses.byId(a.courseId);
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  db.submissions.removeWhere((s) => s.assignmentId === a.id);
  db.assignments.remove(a.id);
  res.json({ message: 'Assignment deleted' });
}));

// Student submits (text/link-based — no file upload in this prototype).
router.post('/:id/submit', authorize('student'), wrap(async (req, res) => {
  const a = db.assignments.byId(req.params.id);
  if (!a) throw httpError(404, 'Assignment not found');
  const myCourseIds = new Set(coursesOfStudent(req.user).map((c) => c.id));
  if (!myCourseIds.has(a.courseId)) throw httpError(403, 'You are not enrolled in this course');
  const { content, link } = req.body;
  if (!content && !link) throw httpError(400, 'Provide submission text or a link');
  const existing = db.submissions.findOne((s) => s.assignmentId === a.id && s.studentId === req.user.id);
  const payload = {
    assignmentId: a.id, studentId: req.user.id, content: content || '', link: link || '',
    submittedAt: new Date().toISOString(), status: new Date() > new Date(a.dueDate) ? 'late' : 'on_time',
    grade: existing?.grade ?? null, feedback: existing?.feedback ?? '',
  };
  const row = existing ? db.submissions.update(existing.id, payload) : db.submissions.insert(payload);
  res.status(existing ? 200 : 201).json(row);
}));

router.post('/:id/grade/:studentId', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const a = db.assignments.byId(req.params.id);
  if (!a) throw httpError(404, 'Assignment not found');
  const course = db.courses.byId(a.courseId);
  if (!canManageCourse(req.user, course)) throw httpError(403, 'You do not teach this course');
  const { grade, feedback } = req.body;
  need(req.body, ['grade']);
  const sub = db.submissions.findOne((s) => s.assignmentId === a.id && s.studentId === req.params.studentId);
  if (!sub) throw httpError(404, 'No submission from this student yet');
  const row = db.submissions.update(sub.id, { grade: Number(grade), feedback: feedback || '' });
  notify([req.params.studentId], 'Assignment graded', `${a.title}: ${grade}/${a.maxMarks}`, '/student/assignments');
  res.json(row);
}));

module.exports = router;
