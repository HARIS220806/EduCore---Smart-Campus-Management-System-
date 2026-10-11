const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { publicUser, wrap, httpError, need, isEmail, studentsOfCourse } = require('../utils/helpers');

router.use(authenticate);

const withDept = (u) => ({ ...publicUser(u), departmentName: db.departments.byId(u.departmentId)?.name || null });

// Admin: everyone. Faculty: only students in classes they teach.
router.get('/', authorize('admin', 'faculty'), wrap(async (req, res) => {
  await db.syncFromMongo();
  const { role, departmentId, q } = req.query;
  let list = db.users.all();
  if (req.user.role === 'faculty') {
    const mine = new Map();
    db.courses.find((c) => c.facultyId === req.user.id).forEach((c) => studentsOfCourse(c).forEach((s) => mine.set(s.id, s)));
    list = [...mine.values()];
  }
  if (role) list = list.filter((u) => u.role === role);
  if (departmentId) list = list.filter((u) => u.departmentId === departmentId);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((u) => [u.name, u.email, u.registerNumber].some((v) => (v || '').toLowerCase().includes(s)));
  }
  res.json(list.map(withDept));
}));

router.post('/', authorize('admin'), wrap(async (req, res) => {
  need(req.body, ['name', 'email', 'password', 'role']);
  const { name, email, password, role, departmentId, phone, year, section, registerNumber, designation } = req.body;
  if (!['admin', 'faculty', 'student'].includes(role)) throw httpError(400, 'Invalid role');
  if (!isEmail(email)) throw httpError(400, 'Enter a valid email address');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (db.users.findOne((u) => u.email === email.toLowerCase())) throw httpError(409, 'An account with this email already exists');
  if (departmentId && !db.departments.byId(departmentId)) throw httpError(400, 'Unknown department');
  const user = await db.users.insert({
    name: name.trim(), email: email.toLowerCase(), role, active: true,
    passwordHash: bcrypt.hashSync(password, 10),
    departmentId: departmentId || null, phone: phone || '',
    ...(role === 'student' ? { year: Number(year) || 1, section: section || 'A', registerNumber: registerNumber || '' } : {}),
    ...(role === 'faculty' ? { designation: designation || 'Assistant Professor' } : {}),
  });
  res.status(201).json(withDept(user));
}));

router.put('/:id', authorize('admin'), wrap(async (req, res) => {
  const user = db.users.byId(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  const patch = {};
  ['name', 'phone', 'departmentId', 'section', 'registerNumber', 'designation'].forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });
  if (req.body.year !== undefined) patch.year = Number(req.body.year);
  if (req.body.email !== undefined) {
    if (!isEmail(req.body.email)) throw httpError(400, 'Enter a valid email address');
    const clash = db.users.findOne((u) => u.email === req.body.email.toLowerCase() && u.id !== user.id);
    if (clash) throw httpError(409, 'That email is already in use');
    patch.email = req.body.email.toLowerCase();
  }
  if (req.body.role !== undefined) {
    if (!['admin', 'faculty', 'student'].includes(req.body.role)) throw httpError(400, 'Invalid role');
    if (user.id === req.user.id && req.body.role !== 'admin') throw httpError(400, 'You cannot remove your own admin role');
    patch.role = req.body.role;
  }
  if (req.body.active !== undefined) {
    if (user.id === req.user.id && !req.body.active) throw httpError(400, 'You cannot deactivate your own account');
    patch.active = Boolean(req.body.active);
  }
  if (req.body.password) {
    if (req.body.password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
    patch.passwordHash = bcrypt.hashSync(req.body.password, 10);
  }
  const updatedUser = await db.users.update(user.id, patch);
  res.json(withDept(updatedUser));
}));

router.delete('/:id', authorize('admin'), wrap(async (req, res) => {
  const user = db.users.byId(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  if (user.id === req.user.id) throw httpError(400, 'You cannot delete your own account');
  if (user.role === 'faculty') {
    db.courses.find((c) => c.facultyId === user.id).forEach((c) => {
      db.courses.update(c.id, { facultyId: null });
    });
    db.departments.find((d) => d.hodId === user.id).forEach((d) => {
      db.departments.update(d.id, { hodId: null });
    });
  }
  await db.users.remove(user.id);
  db.notifications.removeWhere((n) => n.userId === user.id);
  db.submissions.removeWhere((s) => s.studentId === user.id);
  db.marks.removeWhere((m) => m.studentId === user.id);
  db.attendance.all().forEach((a) => {
    const updated = (a.records || []).filter((r) => r.studentId !== user.id);
    if (updated.length !== (a.records || []).length) {
      db.attendance.update(a.id, { records: updated });
    }
  });
  res.json({ message: 'User deleted' });
}));

module.exports = router;
