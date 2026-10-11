const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need } = require('../utils/helpers');

router.use(authenticate);

const decorate = (d) => ({
  ...d,
  hodName: db.users.byId(d.hodId)?.name || null,
  studentCount: db.users.find((u) => u.role === 'student' && u.departmentId === d.id).length,
  facultyCount: db.users.find((u) => u.role === 'faculty' && u.departmentId === d.id).length,
  courseCount: db.courses.find((c) => c.departmentId === d.id).length,
});

router.get('/', wrap(async (req, res) => {
  await db.departments.sync();
  res.json(db.departments.all().map(decorate));
}));

router.post('/', authorize('admin'), wrap(async (req, res) => {
  await db.departments.sync();
  need(req.body, ['name', 'code']);
  const code = req.body.code.trim().toUpperCase();
  if (db.departments.findOne((d) => d.code === code)) throw httpError(409, 'Department code already exists');
  const row = await db.departments.insert({ name: req.body.name.trim(), code, hodId: req.body.hodId || null });
  res.status(201).json(decorate(row));
}));

router.put('/:id', authorize('admin'), wrap(async (req, res) => {
  const d = db.departments.byId(req.params.id);
  if (!d) throw httpError(404, 'Department not found');
  const patch = {};
  if (req.body.name !== undefined) patch.name = req.body.name.trim();
  if (req.body.hodId !== undefined) patch.hodId = req.body.hodId || null;
  if (req.body.code !== undefined) {
    const code = req.body.code.trim().toUpperCase();
    if (db.departments.findOne((x) => x.code === code && x.id !== d.id)) throw httpError(409, 'Department code already exists');
    patch.code = code;
  }
  const row = await db.departments.update(d.id, patch);
  res.json(decorate(row));
}));

router.delete('/:id', authorize('admin'), wrap(async (req, res) => {
  const d = db.departments.byId(req.params.id);
  if (!d) throw httpError(404, 'Department not found');
  if (db.users.findOne((u) => u.departmentId === d.id) || db.courses.findOne((c) => c.departmentId === d.id))
    throw httpError(409, 'Move or delete this department\'s users and courses first');
  await db.departments.remove(d.id);
  res.json({ message: 'Department deleted' });
}));

module.exports = router;
