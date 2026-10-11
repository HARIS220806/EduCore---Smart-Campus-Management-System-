// Document store with optional MongoDB synchronization.
// Persists synchronously to data/db.json and asynchronously syncs to MongoDB via Mongoose.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('../config');
const models = require('../models/schemas');

const COLLECTIONS = [
  'users', 'departments', 'courses', 'attendance', 'marks', 'assignments',
  'submissions', 'announcements', 'timetable', 'notifications', 'resetTokens',
];

const MODEL_MAP = {
  users: models.User,
  departments: models.Department,
  courses: models.Course,
  attendance: models.Attendance,
  marks: models.Mark,
  assignments: models.Assignment,
  submissions: models.Submission,
  announcements: models.Announcement,
  timetable: models.Timetable,
  notifications: models.Notification,
  resetTokens: models.ResetToken,
};

let data = {};
let timer = null;

function empty() {
  const d = { settings: { institutionName: 'Smart Campus College', academicYear: '2026-27', minAttendance: 75 } };
  COLLECTIONS.forEach((c) => (d[c] = []));
  return d;
}

function load() {
  try {
    data = { ...empty(), ...JSON.parse(fs.readFileSync(config.dbFile, 'utf8')) };
  } catch {
    data = empty();
  }
}

function flush() {
  try {
    fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
    fs.writeFileSync(config.dbFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn('File store notice (serverless/read-only filesystem):', err.message);
  }

  // If MongoDB is connected, push state to MongoDB
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    syncToMongo().catch((err) => console.error('MongoDB sync error:', err.message));
  }
}

async function syncToMongo() {
  for (const name of COLLECTIONS) {
    const Model = MODEL_MAP[name];
    if (Model && data[name]) {
      for (const item of data[name]) {
        await Model.updateOne({ id: item.id }, item, { upsert: true });
      }
    }
  }
  if (models.Setting && data.settings) {
    await models.Setting.updateOne({}, data.settings, { upsert: true });
  }
}

async function syncFromMongo() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) return;
  try {
    for (const name of COLLECTIONS) {
      const Model = MODEL_MAP[name];
      if (Model) {
        const docs = await Model.find({}).lean();
        if (docs.length > 0) {
          data[name] = docs.map(({ _id, __v, ...rest }) => rest);
        }
      }
    }
    const settingDoc = await models.Setting.findOne({}).lean();
    if (settingDoc) {
      const { _id, __v, ...sRest } = settingDoc;
      data.settings = { ...data.settings, ...sRest };
    }
    flush();
    console.log('Successfully synced data from MongoDB!');
  } catch (err) {
    console.error('Error reading from MongoDB:', err.message);
  }
}

function persist() {
  clearTimeout(timer);
  timer = setTimeout(flush, 100);
}

const uid = () => crypto.randomBytes(8).toString('hex');

function col(name) {
  return {
    all: () => data[name],
    find: (pred) => data[name].filter(pred),
    findOne: (pred) => data[name].find(pred),
    byId: (id) => data[name].find((x) => x.id === id),
    insert(doc) {
      const row = { id: uid(), createdAt: new Date().toISOString(), ...doc };
      data[name].push(row);
      persist();
      return row;
    },
    update(id, patch) {
      const row = data[name].find((x) => x.id === id);
      if (!row) return null;
      Object.assign(row, patch, { updatedAt: new Date().toISOString() });
      persist();
      return row;
    },
    remove(id) {
      const before = data[name].length;
      data[name] = data[name].filter((x) => x.id !== id);
      if (mongoose.connection && mongoose.connection.readyState === 1 && MODEL_MAP[name]) {
        MODEL_MAP[name].deleteOne({ id }).catch(() => {});
      }
      persist();
      return data[name].length < before;
    },
    removeWhere(pred) {
      const toDelete = data[name].filter(pred).map((x) => x.id);
      data[name] = data[name].filter((x) => !pred(x));
      if (mongoose.connection && mongoose.connection.readyState === 1 && MODEL_MAP[name] && toDelete.length > 0) {
        MODEL_MAP[name].deleteMany({ id: { $in: toDelete } }).catch(() => {});
      }
      persist();
    },
  };
}

load();

module.exports = {
  users: col('users'),
  departments: col('departments'),
  courses: col('courses'),
  attendance: col('attendance'),
  marks: col('marks'),
  assignments: col('assignments'),
  submissions: col('submissions'),
  announcements: col('announcements'),
  timetable: col('timetable'),
  notifications: col('notifications'),
  resetTokens: col('resetTokens'),
  getSettings: () => data.settings,
  setSettings: (patch) => {
    Object.assign(data.settings, patch);
    persist();
    return data.settings;
  },
  reset() {
    data = empty();
    persist();
  },
  flush,
  uid,
  syncFromMongo,
  syncToMongo,
};
