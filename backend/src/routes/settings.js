const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', (req, res) => res.json(db.getSettings()));
router.put('/', authorize('admin'), (req, res) => res.json(db.setSettings(req.body || {})));

module.exports = router;
