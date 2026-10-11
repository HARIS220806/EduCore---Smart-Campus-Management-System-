const db = require('../db/store');

const publicUser = (u) => {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
};

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const httpError = (status, message) => Object.assign(new Error(message), { status });

const need = (obj, fields) => {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === '');
  if (missing.length) throw httpError(400, `Missing required field(s): ${missing.join(', ')}`);
};

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');

// Students enrolled in a course = same department + same year.
const studentsOfCourse = (course) =>
  db.users.find((u) => u.role === 'student' && u.active !== false &&
    u.departmentId === course.departmentId && Number(u.year) === Number(course.year));

const coursesOfStudent = (s) =>
  db.courses.find((c) => c.departmentId === s.departmentId && Number(c.year) === Number(s.year));

// Which courses may this user manage (faculty: own; admin: all)
const canManageCourse = (user, course) =>
  user.role === 'admin' || (user.role === 'faculty' && course.facultyId === user.id);

function notify(userIds, title, body, link) {
  [...new Set(userIds)].forEach((userId) =>
    db.notifications.insert({ userId, title, body, link: link || null, read: false }));
}

const gradePoint = (pct) => (pct >= 90 ? 10 : pct >= 80 ? 9 : pct >= 70 ? 8 : pct >= 60 ? 7 : pct >= 50 ? 6 : pct >= 40 ? 5 : 0);

module.exports = { publicUser, wrap, httpError, need, isEmail, studentsOfCourse, coursesOfStudent, canManageCourse, notify, gradePoint };
