const router = require('express').Router();
const db = require('../db/store');
const { authenticate } = require('../middleware/auth');
const { httpError, wrap } = require('../utils/helpers');

router.use(authenticate);

router.get('/', (req, res) => {
  const list = db.notifications.find((n) => n.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.post('/:id/read', wrap(async (req, res) => {
  const n = db.notifications.byId(req.params.id);
  if (!n || n.userId !== req.user.id) throw httpError(404, 'Notification not found');
  res.json(db.notifications.update(n.id, { read: true }));
}));

router.post('/read-all', (req, res) => {
  db.notifications.find((n) => n.userId === req.user.id && !n.read).forEach((n) => db.notifications.update(n.id, { read: true }));
  res.json({ message: 'All notifications marked read' });
});

module.exports = router;
