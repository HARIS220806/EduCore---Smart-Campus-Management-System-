import { ROUTES } from './routes';
import { ROLES } from './roles';

// icon values are lucide-react component names, resolved in Sidebar.jsx
export const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'Students', to: ROUTES.ADMIN_STUDENTS, icon: 'GraduationCap' },
    { label: 'Faculty', to: ROUTES.ADMIN_FACULTY, icon: 'Users' },
    { label: 'Departments', to: ROUTES.ADMIN_DEPARTMENTS, icon: 'Building2' },
    { label: 'Courses', to: ROUTES.ADMIN_COURSES, icon: 'BookOpen' },
    { label: 'Attendance', to: ROUTES.ADMIN_ATTENDANCE, icon: 'CalendarCheck' },
    { label: 'Marks & Results', to: ROUTES.ADMIN_MARKS, icon: 'ClipboardList' },
    { label: 'Assignments', to: ROUTES.ADMIN_ASSIGNMENTS, icon: 'FileText' },
    { label: 'Announcements', to: ROUTES.ADMIN_ANNOUNCEMENTS, icon: 'Megaphone' },
    { label: 'Timetable', to: ROUTES.ADMIN_TIMETABLE, icon: 'Clock' },
    { label: 'Reports', to: ROUTES.ADMIN_REPORTS, icon: 'BarChart3' },
    { label: 'Users', to: ROUTES.ADMIN_USERS, icon: 'ShieldCheck' },
    { label: 'Settings', to: ROUTES.ADMIN_SETTINGS, icon: 'Settings' },
  ],
  [ROLES.FACULTY]: [
    { label: 'Dashboard', to: ROUTES.FACULTY_DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'My Subjects', to: ROUTES.FACULTY_SUBJECTS, icon: 'BookOpen' },
    { label: 'My Students', to: ROUTES.FACULTY_STUDENTS, icon: 'GraduationCap' },
    { label: 'Attendance', to: ROUTES.FACULTY_ATTENDANCE, icon: 'CalendarCheck' },
    { label: 'Marks & Results', to: ROUTES.FACULTY_MARKS, icon: 'ClipboardList' },
    { label: 'Assignments', to: ROUTES.FACULTY_ASSIGNMENTS, icon: 'FileText' },
    { label: 'Announcements', to: ROUTES.FACULTY_ANNOUNCEMENTS, icon: 'Megaphone' },
    { label: 'Profile', to: ROUTES.FACULTY_PROFILE, icon: 'UserCircle' },
  ],
  [ROLES.STUDENT]: [
    { label: 'Dashboard', to: ROUTES.STUDENT_DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'My Profile', to: ROUTES.STUDENT_PROFILE, icon: 'UserCircle' },
    { label: 'My Courses', to: ROUTES.STUDENT_COURSES, icon: 'BookOpen' },
    { label: 'Attendance', to: ROUTES.STUDENT_ATTENDANCE, icon: 'CalendarCheck' },
    { label: 'Marks & Results', to: ROUTES.STUDENT_MARKS, icon: 'ClipboardList' },
    { label: 'Assignments', to: ROUTES.STUDENT_ASSIGNMENTS, icon: 'FileText' },
    { label: 'Announcements', to: ROUTES.STUDENT_ANNOUNCEMENTS, icon: 'Megaphone' },
    { label: 'Timetable', to: ROUTES.STUDENT_TIMETABLE, icon: 'Clock' },
  ],
};
