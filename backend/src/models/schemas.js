const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  active: { type: Boolean, default: true },
  departmentId: { type: String, default: null },
  phone: { type: String, default: '' },
  year: { type: Number },
  section: { type: String },
  registerNumber: { type: String },
  designation: { type: String },
  lastLoginAt: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  departmentId: { type: String, required: true },
  facultyId: { type: String, default: null },
  year: { type: Number, required: true },
  semester: { type: Number, default: 1 },
  credits: { type: Number, default: 3 },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  date: { type: String, required: true },
  records: [{
    studentId: { type: String, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
  }],
  markedBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const markSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  studentId: { type: String, required: true },
  examType: { type: String, required: true },
  obtained: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  enteredBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: String, required: true },
  maxMarks: { type: Number, default: 100 },
  createdBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assignmentId: { type: String, required: true },
  studentId: { type: String, required: true },
  content: { type: String, default: '' },
  link: { type: String, default: '' },
  submittedAt: { type: String },
  status: { type: String, enum: ['on_time', 'late'], default: 'on_time' },
  grade: { type: Number, default: null },
  feedback: { type: String, default: '' },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: String, default: 'all' },
  authorId: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const timetableSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const resetTokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Number, required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true });

const settingSchema = new mongoose.Schema({
  institutionName: { type: String, default: 'Smart Campus College' },
  academicYear: { type: String, default: '2026-27' },
  minAttendance: { type: Number, default: 75 },
}, { timestamps: true });

const models = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Department: mongoose.models.Department || mongoose.model('Department', departmentSchema),
  Course: mongoose.models.Course || mongoose.model('Course', courseSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema),
  Mark: mongoose.models.Mark || mongoose.model('Mark', markSchema),
  Assignment: mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema),
  Submission: mongoose.models.Submission || mongoose.model('Submission', submissionSchema),
  Announcement: mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema),
  Timetable: mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', notificationSchema),
  ResetToken: mongoose.models.ResetToken || mongoose.model('ResetToken', resetTokenSchema),
  Setting: mongoose.models.Setting || mongoose.model('Setting', settingSchema),
};

module.exports = models;
