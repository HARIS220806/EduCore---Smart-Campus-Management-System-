// Seeds demo data: 3 core accounts (matching the frontend's demo login buttons)
// plus departments, courses, attendance, marks, assignments and announcements
// so every dashboard has real numbers to show out of the box.
const bcrypt = require('bcryptjs');
const db = require('./store');
const connectDB = require('./connect');

async function run() {
  await connectDB();
  db.reset();
  const hash = (p) => bcrypt.hashSync(p, 10);

  const cse = db.departments.insert({ name: 'Computer Science', code: 'CSE', hodId: null });
  const ece = db.departments.insert({ name: 'Electronics & Communication', code: 'ECE', hodId: null });
  db.departments.insert({ name: 'Mechanical Engineering', code: 'MECH', hodId: null });

  const admin = db.users.insert({
    name: 'Meera Krishnan', email: 'admin@educore.edu', passwordHash: hash('admin123'),
    role: 'admin', active: true, departmentId: null, phone: '+91 90000 00001',
  });

  const facultyMain = db.users.insert({
    name: 'Dr. Arvind Rao', email: 'faculty@educore.edu', passwordHash: hash('faculty123'),
    role: 'faculty', active: true, departmentId: cse.id, designation: 'Associate Professor', phone: '+91 90000 00002',
  });
  const facultyExtra = db.users.insert({
    name: 'Dr. Priya Menon', email: 'priya.menon@educore.edu', passwordHash: hash('faculty123'),
    role: 'faculty', active: true, departmentId: ece.id, designation: 'Assistant Professor', phone: '+91 90000 00009',
  });

  db.departments.update(cse.id, { hodId: facultyMain.id });
  db.departments.update(ece.id, { hodId: facultyExtra.id });

  const studentMain = db.users.insert({
    name: 'Haris Ahmed', email: 'student@educore.edu', passwordHash: hash('student123'),
    role: 'student', active: true, departmentId: cse.id, year: 3, section: 'A', registerNumber: 'CSE2023045', phone: '+91 90000 00003',
  });

  const extraStudentNames = [
    'Ananya Sharma', 'Rohan Gupta', 'Divya Nair', 'Karthik Subramanian', 'Sneha Reddy',
    'Vikram Iyer', 'Pooja Menon', 'Arjun Das',
  ];
  const extraStudents = extraStudentNames.map((name, i) =>
    db.users.insert({
      name, email: `${name.toLowerCase().replace(/\s+/g, '.')}@educore.edu`, passwordHash: hash('student123'),
      role: 'student', active: true, departmentId: cse.id, year: 3, section: 'A',
      registerNumber: `CSE2023${String(46 + i).padStart(3, '0')}`, phone: '',
    })
  );
  const allCseYear3Students = [studentMain, ...extraStudents];

  const courses = [
    db.courses.insert({ code: 'CS301', name: 'Data Structures II', departmentId: cse.id, facultyId: facultyMain.id, year: 3, semester: 5, credits: 4 }),
    db.courses.insert({ code: 'CS302', name: 'Database Management Systems', departmentId: cse.id, facultyId: facultyMain.id, year: 3, semester: 5, credits: 4 }),
    db.courses.insert({ code: 'CS303', name: 'Operating Systems', departmentId: cse.id, facultyId: facultyMain.id, year: 3, semester: 5, credits: 3 }),
    db.courses.insert({ code: 'CS304', name: 'Computer Networks', departmentId: cse.id, facultyId: facultyMain.id, year: 3, semester: 5, credits: 3 }),
    db.courses.insert({ code: 'EC301', name: 'Digital Signal Processing', departmentId: ece.id, facultyId: facultyExtra.id, year: 3, semester: 5, credits: 4 }),
  ];
  const [ds, dbms, os, net] = courses;

  // Timetable (Mon–Fri, for the CSE year-3 courses)
  const slots = [
    [ds, 'Monday', '09:00', '10:00', 'C-101'], [dbms, 'Monday', '10:15', '11:15', 'C-101'],
    [os, 'Tuesday', '09:00', '10:00', 'C-102'], [net, 'Tuesday', '11:15', '12:15', 'C-102'],
    [ds, 'Wednesday', '09:00', '10:00', 'C-101'], [dbms, 'Thursday', '10:15', '11:15', 'C-101'],
    [os, 'Friday', '09:00', '10:00', 'C-102'],
  ];
  slots.forEach(([c, day, startTime, endTime, room]) => db.timetable.insert({ courseId: c.id, day, startTime, endTime, room }));

  // Attendance: last 10 weekdays for each core course, ~87% present
  const today = new Date();
  const weekdays = [];
  for (let d = 0; weekdays.length < 10; d++) {
    const dt = new Date(today); dt.setDate(dt.getDate() - d);
    if (dt.getDay() !== 0 && dt.getDay() !== 6) weekdays.push(dt.toISOString().slice(0, 10));
  }
  [ds, dbms, os, net].forEach((course) => {
    weekdays.forEach((date, i) => {
      const records = allCseYear3Students.map((s, idx) => ({
        studentId: s.id, status: (idx + i) % 7 === 0 ? 'absent' : 'present',
      }));
      db.attendance.insert({ courseId: course.id, date, records, markedBy: facultyMain.id });
    });
  });

  // Marks: internal1, internal2, semester for each student in ds/dbms
  [ds, dbms].forEach((course) => {
    allCseYear3Students.forEach((s, idx) => {
      db.marks.insert({ courseId: course.id, studentId: s.id, examType: 'Internal 1', obtained: 22 + (idx % 6), maxMarks: 30, enteredBy: facultyMain.id });
      db.marks.insert({ courseId: course.id, studentId: s.id, examType: 'Internal 2', obtained: 20 + (idx % 8), maxMarks: 30, enteredBy: facultyMain.id });
      db.marks.insert({ courseId: course.id, studentId: s.id, examType: 'Semester', obtained: 55 + (idx % 20), maxMarks: 70, enteredBy: facultyMain.id });
    });
  });

  // Assignments + one sample submission
  const dueSoon = new Date(today); dueSoon.setDate(dueSoon.getDate() + 5);
  const duePast = new Date(today); duePast.setDate(duePast.getDate() - 3);
  const a1 = db.assignments.insert({ courseId: ds.id, title: 'Binary Search Trees — Problem Set', description: 'Implement insert, delete and balance-check for a BST.', dueDate: dueSoon.toISOString().slice(0, 10), maxMarks: 20, createdBy: facultyMain.id });
  const a2 = db.assignments.insert({ courseId: dbms.id, title: 'Normalization Exercise', description: 'Normalize the given schema to 3NF with justification.', dueDate: duePast.toISOString().slice(0, 10), maxMarks: 15, createdBy: facultyMain.id });
  db.assignments.insert({ courseId: os.id, title: 'Process Scheduling Simulation', description: 'Simulate FCFS, SJF and Round Robin and compare turnaround times.', dueDate: dueSoon.toISOString().slice(0, 10), maxMarks: 25, createdBy: facultyMain.id });

  db.submissions.insert({
    assignmentId: a2.id, studentId: studentMain.id, content: 'Schema normalized to 3NF — see attached reasoning.', link: '',
    submittedAt: new Date(duePast.getTime() - 86400000).toISOString(), status: 'on_time', grade: 13, feedback: 'Good decomposition, minor FD missed.',
  });

  // Announcements
  db.announcements.insert({ title: 'Semester exam schedule released', content: 'The semester exam timetable has been published on the portal. Please check your respective course pages.', audience: 'all', authorId: admin.id });
  db.announcements.insert({ title: 'Guest lecture: Distributed Systems', content: 'A guest lecture on distributed systems will be held this Friday at 3 PM in the main auditorium.', audience: 'students', authorId: facultyMain.id });
  db.announcements.insert({ title: 'Faculty meeting rescheduled', content: 'The monthly faculty meeting has been moved to next Monday, 10 AM, Conference Room B.', audience: 'faculty', authorId: admin.id });

  db.flush();
  // Wait a bit for async syncToMongo to finish since flush doesn't return a promise
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Seed complete:');
  console.log('  admin@educore.edu / admin123');
  console.log('  faculty@educore.edu / faculty123');
  console.log('  student@educore.edu / student123');
  console.log(`  + ${extraStudents.length} extra students, ${courses.length} courses, attendance, marks, assignments, announcements.`);
  process.exit(0);
}

run();
