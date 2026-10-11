const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');
const { coursesOfStudent, studentsOfCourse, gradePoint } = require('../utils/helpers');

router.use(authenticate);

router.get('/admin', authorize('admin'), (req, res) => {
  const students = db.users.find((u) => u.role === 'student');
  const faculty = db.users.find((u) => u.role === 'faculty');
  const sessions = db.attendance.all();
  const totalMarks = sessions.reduce((s, a) => s + a.records.length, 0);
  const totalPresent = sessions.reduce((s, a) => s + a.records.filter((r) => r.status === 'present').length, 0);

  const byDept = db.departments.all().map((d) => ({
    name: d.code,
    students: db.users.find((u) => u.role === 'student' && u.departmentId === d.id).length,
  }));

  res.json({
    stats: {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalCourses: db.courses.all().length,
      totalDepartments: db.departments.all().length,
      overallAttendance: totalMarks ? Math.round((totalPresent / totalMarks) * 100) : 0,
      activeUsers: db.users.find((u) => u.active !== false).length,
    },
    studentsByDepartment: byDept,
    recentAnnouncements: db.announcements.all()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      .map((a) => ({ ...a, authorName: db.users.byId(a.authorId)?.name || 'Admin' })),
  });
});

router.get('/faculty', authorize('faculty'), (req, res) => {
  const myCourses = db.courses.find((c) => c.facultyId === req.user.id);
  const studentIds = new Set();
  myCourses.forEach((c) => studentsOfCourse(c).forEach((s) => studentIds.add(s.id)));

  const today = new Date();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  const myCourseIds = new Set(myCourses.map((c) => c.id));
  const todaysClasses = db.timetable.find((t) => myCourseIds.has(t.courseId) && t.day === dayName);

  const pendingAssignments = db.assignments.find((a) => myCourseIds.has(a.courseId)).filter((a) => new Date(a.dueDate) >= today).length;

  const attendanceByCourse = myCourses.map((c) => {
    const sessions = db.attendance.find((a) => a.courseId === c.id);
    const total = sessions.reduce((s, a) => s + a.records.length, 0);
    const present = sessions.reduce((s, a) => s + a.records.filter((r) => r.status === 'present').length, 0);
    return { courseName: c.code, percentage: total ? Math.round((present / total) * 100) : 0 };
  });

  res.json({
    stats: {
      assignedSubjects: myCourses.length,
      totalStudents: studentIds.size,
      todaysClasses: todaysClasses.length,
      pendingAssignments,
    },
    attendanceByCourse,
    todaysClasses: todaysClasses.map((t) => ({ ...t, courseName: db.courses.byId(t.courseId)?.name })),
  });
});

router.get('/student', authorize('student'), (req, res) => {
  const courses = coursesOfStudent(req.user);
  const courseIds = new Set(courses.map((c) => c.id));

  const sessions = db.attendance.find((a) => courseIds.has(a.courseId));
  const total = sessions.length;
  const present = sessions.filter((a) => a.records.find((r) => r.studentId === req.user.id)?.status === 'present').length;

  const marksRows = db.marks.find((m) => m.studentId === req.user.id);
  const byCourse = {};
  marksRows.forEach((m) => { (byCourse[m.courseId] ||= []).push(m); });
  const perCourse = Object.entries(byCourse).map(([courseId, entries]) => {
    const obtained = entries.reduce((s, e) => s + e.obtained, 0);
    const max = entries.reduce((s, e) => s + e.maxMarks, 0);
    return gradePoint(max ? Math.round((obtained / max) * 100) : 0);
  });
  const cgpa = perCourse.length ? (perCourse.reduce((a, b) => a + b, 0) / perCourse.length).toFixed(2) : '0.00';

  const pendingAssignments = db.assignments.find((a) => courseIds.has(a.courseId))
    .filter((a) => new Date(a.dueDate) >= new Date() && !db.submissions.findOne((s) => s.assignmentId === a.id && s.studentId === req.user.id)).length;

  const today = new Date();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  const upcomingClasses = db.timetable.find((t) => courseIds.has(t.courseId) && t.day === dayName);

  res.json({
    stats: {
      attendance: total ? Math.round((present / total) * 100) : 100,
      cgpa,
      pendingAssignments,
      upcomingClasses: upcomingClasses.length,
    },
    performanceByCourse: Object.entries(byCourse).map(([courseId, entries]) => ({
      courseName: db.courses.byId(courseId)?.code,
      percentage: Math.round((entries.reduce((s, e) => s + e.obtained, 0) / entries.reduce((s, e) => s + e.maxMarks, 0)) * 100) || 0,
    })),
  });
});

module.exports = router;
