const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { wrap, httpError, need, notify } = require('../utils/helpers');

router.use(authenticate);

// audience: 'all' | 'students' | 'faculty' | a departmentId
function visibleTo(user, a) {
  if (a.audience === 'all') return true;
  if (a.audience === 'students') return user.role === 'student';
  if (a.audience === 'faculty') return user.role === 'faculty';
  return a.audience === user.departmentId;
}

router.get('/', (req, res) => {
  const list = db.announcements.all()
    .filter((a) => req.user.role === 'admin' || visibleTo(req.user, a))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((a) => ({ ...a, authorName: db.users.byId(a.authorId)?.name || a.author || 'Admin' }));
  res.json(list);
});

router.post('/', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const { title, content, audience } = req.body;
  need(req.body, ['title', 'content']);
  const row = db.announcements.insert({
    title: title.trim(), content: content.trim(), audience: audience || 'all', authorId: req.user.id,
  });
  const targets = db.users.find((u) => u.id !== req.user.id && (u.role === 'admin' || row.audience === 'all' || visibleTo(u, row)));
  notify(targets.map((u) => u.id), 'New announcement', title, '/announcements');
  res.status(201).json({ ...row, authorName: req.user.name });
}));

router.put('/:id', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const a = db.announcements.byId(req.params.id);
  if (!a) throw httpError(404, 'Announcement not found');
  if (req.user.role !== 'admin' && a.authorId !== req.user.id) throw httpError(403, 'You can only edit your own announcements');
  const patch = {};
  ['title', 'content', 'audience'].forEach((k) => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });
  res.json(db.announcements.update(a.id, patch));
}));

router.delete('/:id', authorize('admin', 'faculty'), wrap(async (req, res) => {
  const a = db.announcements.byId(req.params.id);
  if (!a) throw httpError(404, 'Announcement not found');
  if (req.user.role !== 'admin' && a.authorId !== req.user.id) throw httpError(403, 'You can only delete your own announcements');
  db.announcements.remove(a.id);
  res.json({ message: 'Announcement deleted' });
}));

module.exports = router;
