import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES, ROLE_HOME_ROUTE } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';
import FacultyLayout from '@/layouts/FacultyLayout';
import StudentLayout from '@/layouts/StudentLayout';

import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import NotFound from '@/pages/common/NotFound';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminFaculty from '@/pages/admin/AdminFaculty';
import AdminDepartments from '@/pages/admin/AdminDepartments';
import AdminCourses from '@/pages/admin/AdminCourses';
import AdminAttendance from '@/pages/admin/AdminAttendance';
import AdminMarks from '@/pages/admin/AdminMarks';
import AdminAssignments from '@/pages/admin/AdminAssignments';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminTimetable from '@/pages/admin/AdminTimetable';
import AdminReports from '@/pages/admin/AdminReports';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSettings from '@/pages/admin/AdminSettings';

import FacultyDashboard from '@/pages/faculty/FacultyDashboard';
import FacultySubjects from '@/pages/faculty/FacultySubjects';
import FacultyStudents from '@/pages/faculty/FacultyStudents';
import FacultyAttendance from '@/pages/faculty/FacultyAttendance';
import FacultyMarks from '@/pages/faculty/FacultyMarks';
import FacultyAssignments from '@/pages/faculty/FacultyAssignments';
import FacultyAnnouncements from '@/pages/faculty/FacultyAnnouncements';
import FacultyProfile from '@/pages/faculty/FacultyProfile';

import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import StudentCourses from '@/pages/student/StudentCourses';
import StudentAttendance from '@/pages/student/StudentAttendance';
import StudentMarks from '@/pages/student/StudentMarks';
import StudentAssignments from '@/pages/student/StudentAssignments';
import StudentAnnouncements from '@/pages/student/StudentAnnouncements';
import StudentTimetable from '@/pages/student/StudentTimetable';

import { ROUTES } from '@/constants/routes';

// Root redirect: send an authenticated user to their dashboard,
// otherwise to the login page.
function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to={ROLE_HOME_ROUTE[role]} replace />;
  return <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<RootRedirect />} />

      {/* Public / auth routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      </Route>

      {/* Protected routes — must be authenticated */}
      <Route element={<ProtectedRoute />}>
        {/* Admin */}
        <Route element={<RoleRoute role={ROLES.ADMIN} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN_STUDENTS} element={<AdminStudents />} />
            <Route path={ROUTES.ADMIN_FACULTY} element={<AdminFaculty />} />
            <Route path={ROUTES.ADMIN_DEPARTMENTS} element={<AdminDepartments />} />
            <Route path={ROUTES.ADMIN_COURSES} element={<AdminCourses />} />
            <Route path={ROUTES.ADMIN_ATTENDANCE} element={<AdminAttendance />} />
            <Route path={ROUTES.ADMIN_MARKS} element={<AdminMarks />} />
            <Route path={ROUTES.ADMIN_ASSIGNMENTS} element={<AdminAssignments />} />
            <Route path={ROUTES.ADMIN_ANNOUNCEMENTS} element={<AdminAnnouncements />} />
            <Route path={ROUTES.ADMIN_TIMETABLE} element={<AdminTimetable />} />
            <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReports />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
            <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Faculty */}
        <Route element={<RoleRoute role={ROLES.FACULTY} />}>
          <Route element={<FacultyLayout />}>
            <Route path={ROUTES.FACULTY_DASHBOARD} element={<FacultyDashboard />} />
            <Route path={ROUTES.FACULTY_SUBJECTS} element={<FacultySubjects />} />
            <Route path={ROUTES.FACULTY_STUDENTS} element={<FacultyStudents />} />
            <Route path={ROUTES.FACULTY_ATTENDANCE} element={<FacultyAttendance />} />
            <Route path={ROUTES.FACULTY_MARKS} element={<FacultyMarks />} />
            <Route path={ROUTES.FACULTY_ASSIGNMENTS} element={<FacultyAssignments />} />
            <Route path={ROUTES.FACULTY_ANNOUNCEMENTS} element={<FacultyAnnouncements />} />
            <Route path={ROUTES.FACULTY_PROFILE} element={<FacultyProfile />} />
          </Route>
        </Route>

        {/* Student */}
        <Route element={<RoleRoute role={ROLES.STUDENT} />}>
          <Route element={<StudentLayout />}>
            <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboard />} />
            <Route path={ROUTES.STUDENT_PROFILE} element={<StudentProfile />} />
            <Route path={ROUTES.STUDENT_COURSES} element={<StudentCourses />} />
            <Route path={ROUTES.STUDENT_ATTENDANCE} element={<StudentAttendance />} />
            <Route path={ROUTES.STUDENT_MARKS} element={<StudentMarks />} />
            <Route path={ROUTES.STUDENT_ASSIGNMENTS} element={<StudentAssignments />} />
            <Route path={ROUTES.STUDENT_ANNOUNCEMENTS} element={<StudentAnnouncements />} />
            <Route path={ROUTES.STUDENT_TIMETABLE} element={<StudentTimetable />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
