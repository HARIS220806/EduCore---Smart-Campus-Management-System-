# Smart Campus Management System

A full working prototype of a role-based college management platform:
**React (Vite) frontend** + **Express backend**, kept as two separate,
independently runnable projects.

```
smart-campus/
  frontend/   React 19 + Vite + Tailwind — the UI (see frontend/README.md)
  backend/    Express REST API + embedded JSON-file database (see backend/README.md)
```

## Run it (two terminals)

**Terminal 1 — backend**

```bash
cd backend
npm install
cp .env.example .env
npm run seed      # creates demo accounts + sample data (run once)
npm run dev        # http://localhost:5005
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
cp .env.example .env    # already points at http://localhost:5005/api
npm run dev               # http://localhost:5173
```

Open http://localhost:5173 and log in with any demo account:

| Role    | Email                      | Password     |
|---------|-----------------------------|---------------|
| Admin   | admin@smartcampus.edu       | admin123      |
| Faculty | faculty@smartcampus.edu     | faculty123    |
| Student | student@smartcampus.edu     | student123    |

(Click the account on the login screen to autofill it.)

## What's wired up end-to-end right now

- **Auth**: real login/register against the backend, JWT-based sessions,
  password hashing, forgot/reset password.
- **Admin dashboard**: live stats (students/faculty/courses/departments/
  attendance/active users), live student-by-department chart, live recent
  announcements, **Add Student** and **Create Announcement** buttons that
  actually write to the backend.
- **Faculty dashboard**: live stats, live attendance-by-subject bars, live
  today's classes from the timetable.
- **Student dashboard**: live stats (attendance %, CGPA, pending
  assignments, upcoming classes), live performance-by-course bars.
- **Notification bell**: live, polls the backend and marks-as-read.

The backend additionally exposes full REST endpoints for departments,
courses, attendance marking, marks entry, assignments (with submission and
grading), timetable, announcements and reports — ready for the remaining
"coming soon" pages to be built against (see `backend/README.md` for the
full endpoint list and `frontend/src/services/` for the matching client
functions, which already exist for every one of these).

## Why two separate folders?

So each can be deployed, versioned and run independently — e.g. the
frontend as a static build on a CDN, the backend as its own service —
exactly as requested, with no shared `node_modules` or build step between
them.
