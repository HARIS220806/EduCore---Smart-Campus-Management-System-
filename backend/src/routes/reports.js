const router = require('express').Router();
const db = require('../db/store');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'faculty'));

// Simple exportable table: student roster with attendance % and CGPA, scoped like /users.
router.get('/academic-summary', (req, res) => {
  let students = db.users.find((u) => u.role === 'student');
  if (req.user.role === 'faculty') {
    const myCourses = db.courses.find((c) => c.facultyId === req.user.id);
    const ids = new Set();
    myCourses.forEach((c) => {
      students.filter((s) => s.departmentId === c.departmentId && Number(s.year) === Number(c.year)).forEach((s) => ids.add(s.id));
    });
    students = students.filter((s) => ids.has(s.id));
  }
  const rows = students.map((s) => {
    const sessions = db.attendance.all().filter((a) => {
      const c = db.courses.byId(a.courseId);
      return c && c.departmentId === s.departmentId && Number(c.year) === Number(s.year);
    });
    const total = sessions.length;
    const present = sessions.filter((a) => a.records.find((r) => r.studentId === s.id)?.status === 'present').length;
    const marksRows = db.marks.find((m) => m.studentId === s.id);
    const obtained = marksRows.reduce((sum, m) => sum + m.obtained, 0);
    const max = marksRows.reduce((sum, m) => sum + m.maxMarks, 0);
    return {
      studentId: s.id, name: s.name, registerNumber: s.registerNumber || '', department: db.departments.byId(s.departmentId)?.code || '',
      year: s.year, attendancePercentage: total ? Math.round((present / total) * 100) : 100,
      marksPercentage: max ? Math.round((obtained / max) * 100) : 0,
    };
  });
  res.json(rows);
});

module.exports = router;
