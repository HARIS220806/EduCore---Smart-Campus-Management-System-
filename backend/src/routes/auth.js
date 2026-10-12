const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db/store');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '633552899098-8hr55pdddvir5002n0iulk13h3v9ps62.apps.googleusercontent.com');
const { sign, authenticate } = require('../middleware/auth');
const { publicUser, wrap, httpError, need, isEmail } = require('../utils/helpers');

const session = (user) => ({ user: publicUser(user), role: user.role, accessToken: sign(user) });

// Public self-registration always creates a STUDENT. Staff accounts are created by an admin via /api/users.
router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  need(req.body, ['name', 'email', 'password']);
  if (!isEmail(email)) throw httpError(400, 'Enter a valid email address');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (db.users.findOne((u) => u.email === email.toLowerCase())) throw httpError(409, 'An account with this email already exists');
  const user = db.users.insert({
    name: name.trim(), email: email.toLowerCase(), role: 'student', active: true,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  res.status(201).json(session(user));
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  need(req.body, ['email', 'password']);
  const user = db.users.findOne((u) => u.email === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) throw httpError(401, 'Invalid email or password');
  if (user.active === false) throw httpError(403, 'This account has been deactivated. Contact an administrator.');
  db.users.update(user.id, { lastLoginAt: new Date().toISOString() });
  res.json(session(user));
}));

router.post('/google', wrap(async (req, res) => {
  const { credential } = req.body;
  need(req.body, ['credential']);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || '633552899098-8hr55pdddvir5002n0iulk13h3v9ps62.apps.googleusercontent.com',
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw httpError(401, 'Invalid Google token');
  }

  const email = payload.email.toLowerCase();
  let user = db.users.findOne((u) => u.email === email);

  if (!user) {
    user = db.users.insert({
      name: payload.name || 'Google User', 
      email: email, 
      role: 'student', 
      active: true,
      passwordHash: bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10),
    });
  } else if (user.active === false) {
    throw httpError(403, 'This account has been deactivated. Contact an administrator.');
  }

  db.users.update(user.id, { lastLoginAt: new Date().toISOString() });
  res.json(session(user));
}));

router.get('/me', authenticate, (req, res) => res.json({ user: publicUser(req.user), role: req.user.role }));

// Self-service profile update (no role/department changes here)
router.put('/me', authenticate, wrap(async (req, res) => {
  const { name, phone, email } = req.body;
  const patch = {};
  if (name !== undefined) { need({ name }, ['name']); patch.name = name.trim(); }
  if (phone !== undefined) patch.phone = phone;
  if (email !== undefined) {
    if (!isEmail(email)) throw httpError(400, 'Enter a valid email address');
    const clash = db.users.findOne((u) => u.email === email.toLowerCase() && u.id !== req.user.id);
    if (clash) throw httpError(409, 'That email is already in use');
    patch.email = email.toLowerCase();
  }
  res.json({ user: publicUser(db.users.update(req.user.id, patch)) });
}));

router.post('/change-password', authenticate, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  need(req.body, ['currentPassword', 'newPassword']);
  if (!bcrypt.compareSync(currentPassword, req.user.passwordHash)) throw httpError(400, 'Current password is incorrect');
  if (newPassword.length < 6) throw httpError(400, 'New password must be at least 6 characters');
  db.users.update(req.user.id, { passwordHash: bcrypt.hashSync(newPassword, 10) });
  res.json({ message: 'Password updated' });
}));

// Prototype: no email server, so the reset link is logged to the backend console
// and (only when NODE_ENV !== 'production') returned in the response as `devResetLink`.
router.post('/forgot-password', wrap(async (req, res) => {
  const { email } = req.body;
  need(req.body, ['email']);
  const user = db.users.findOne((u) => u.email === String(email).toLowerCase());
  const out = { message: 'If an account exists for that email, a reset link has been sent.' };
  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    db.resetTokens.removeWhere((t) => t.userId === user.id);
    db.resetTokens.insert({ userId: user.id, token, expiresAt: Date.now() + 30 * 60 * 1000 });
    const link = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`;
    console.log(`[password reset] ${user.email}: ${link}`);
    if (process.env.NODE_ENV !== 'production') out.devResetLink = link;
  }
  res.json(out);
}));

router.post('/reset-password', wrap(async (req, res) => {
  const { token, newPassword } = req.body;
  need(req.body, ['token', 'newPassword']);
  if (newPassword.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  const rec = db.resetTokens.findOne((t) => t.token === token && t.expiresAt > Date.now());
  if (!rec) throw httpError(400, 'This reset link is invalid or has expired');
  db.users.update(rec.userId, { passwordHash: bcrypt.hashSync(newPassword, 10) });
  db.resetTokens.remove(rec.id);
  res.json({ message: 'Password has been reset. You can now log in.' });
}));

module.exports = router;
