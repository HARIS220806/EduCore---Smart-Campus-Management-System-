const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/store');

const sign = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// Verifies the Bearer token and loads the *current* user from the DB,
// so role changes / deactivation take effect immediately.
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db.users.byId(payload.sub);
    if (!user || user.active === false) return res.status(401).json({ message: 'Account not available' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to do that' });

module.exports = { sign, authenticate, authorize };
