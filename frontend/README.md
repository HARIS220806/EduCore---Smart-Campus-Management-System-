# Smart Campus Management System — Frontend

A role-based college management platform frontend (React + Vite), now
connected to a working Express backend — see `../backend/`.

## Technology stack

- React 19 + Vite
- JavaScript (no TypeScript)
- React Router v7
- Tailwind CSS v4
- Lucide React (icons)
- Axios

## Quick start

```bash
npm install
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:5005/api
npm run dev                # http://localhost:5173
```

Make sure the backend is running first (see `../backend/README.md` —
`npm install && npm run seed && npm run dev`), or logging in will fail.

## Demo accounts

| Role    | Email                      | Password     |
|---------|-----------------------------|---------------|
| Admin   | admin@smartcampus.edu       | admin123      |
| Faculty | faculty@smartcampus.edu     | faculty123    |
| Student | student@smartcampus.edu     | student123    |

Click any demo account on the login screen to autofill it.

## Frontend architecture

```
UI (pages/components)
   |
Hooks / Context (useAuth, useTheme, useToast)
   |
Service layer (services/*.js)
   |
Axios --> Express backend (../backend)
```

No component ever imports `axios` or reaches into mock data directly. Every
data operation goes through a `services/*.js` function — the same contract
this project was originally designed around, now backed by a real API
instead of mock data.

## Folder structure

```
src/
  assets/
  components/
    common/     Button, Input, Select, Badge, Card, Toast, ...
    layout/     Sidebar, Navbar, DashboardShell, PageHeader
    cards/      StatCard
    modals/     Modal, ConfirmDialog
  pages/
    auth/       Login, ForgotPassword
    admin/      AdminDashboard (live stats, student/announcement creation)
    faculty/    FacultyDashboard (live stats, today's classes, attendance)
    student/    StudentDashboard (live stats, performance by course)
    common/     NotFound, ComingSoon
  layouts/
    AuthLayout.jsx / AdminLayout.jsx / FacultyLayout.jsx / StudentLayout.jsx
  routes/
    AppRoutes.jsx / ProtectedRoute.jsx / RoleRoute.jsx
  services/
    api.js                 Centralized Axios instance (reads VITE_API_BASE_URL)
    authService.js           login/register/logout/forgot-password
    userService.js            admin user management
    departmentService.js       department CRUD
    courseService.js            course CRUD + roster
    attendanceService.js         mark + summary
    marksService.js               enter + CGPA summary
    assignmentService.js           CRUD + submit + grade
    announcementService.js          CRUD
    timetableService.js              CRUD
    notificationService.js            in-app notifications
    dashboardService.js                role dashboard aggregates
    reportService.js                    academic summary export
  context/
    AuthContext.jsx / ThemeContext.jsx / ToastContext.jsx
  hooks/
    useAuth.js / useTheme.js / useToast.js
  constants/
    roles.js / routes.js / navigation.js
  styles/
    tokens.css              Design tokens (light + dark)
  App.jsx
  main.jsx
```

## Environment variables

```
VITE_API_BASE_URL=http://localhost:5005/api
```

## Available routes

| Area | Path |
|---|---|
| Login | `/login` |
| Forgot password | `/forgot-password` |
| Admin dashboard | `/admin/dashboard` (+ students, faculty, departments, courses, attendance, marks, assignments, announcements, reports, users, settings) |
| Faculty dashboard | `/faculty/dashboard` (+ subjects, students, attendance, marks, assignments, announcements, profile) |
| Student dashboard | `/student/dashboard` (+ profile, courses, attendance, marks, assignments, announcements, timetable) |

The three dashboards and authentication are fully wired to the backend.
Other routes still render a "coming soon" placeholder — the backend already
exposes the REST endpoints they'll need (courses, attendance, marks,
assignments, announcements, timetable — see `../backend/README.md`), so
building each remaining page is a matter of UI work calling the matching
`services/*.js` function already provided.

## Authentication

`authService.js` calls the real backend:

```
POST /api/auth/login     -> { user, role, accessToken }
POST /api/auth/register  -> same shape (always creates a student)
GET  /api/auth/me
```

The access token is a signed JWT issued by the backend, stored in
`sessionStorage` (or `localStorage` if "remember me" is checked).

**Security note:** `ProtectedRoute` and `RoleRoute` only control frontend
navigation. The backend independently verifies the JWT and re-checks role
permissions on every request — see `../backend/README.md`.
