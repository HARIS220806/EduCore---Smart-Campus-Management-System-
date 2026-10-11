const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./db/connect');
const db = require('./db/store');
const { seedIfEmpty, seedData } = require('./db/seed');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        config.clientOrigin.includes('*') ||
        config.clientOrigin.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// Ensure MongoDB is connected and synced on serverless cold starts, auto-seed if empty
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await connectDB();
      await db.syncFromMongo();
      await seedIfEmpty();
      dbInitialized = true;
    } catch (err) {
      console.warn('DB initialization notice:', err.message);
    }
  }
  next();
});

app.get('/api/status', (req, res) =>
  res.json({
    message: 'Smart Campus backend is running',
    mongoUri: config.mongoUri ? 'configured' : 'none',
    usersCount: db.users.all().length,
    time: new Date().toISOString(),
  })
);

// Manual endpoint to trigger or reset seed data at any time
app.all('/api/seed', async (req, res) => {
  try {
    const stats = await seedData();
    res.json({
      success: true,
      message: 'Demo accounts seeded successfully!',
      stats,
      accounts: [
        { role: 'Admin', email: 'admin@educore.edu', password: 'admin123' },
        { role: 'Faculty', email: 'faculty@educore.edu', password: 'faculty123' },
        { role: 'Student', email: 'student@educore.edu', password: 'student123' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await connectDB();
  await db.syncFromMongo();
  await seedIfEmpty();
  dbInitialized = true;
  app.listen(config.port, () => {
    console.log(`Smart Campus backend listening on http://localhost:${config.port}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
