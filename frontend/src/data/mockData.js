// ===========================================================
// Centralized mock data store.
//
// IMPORTANT: This file is a TEMPORARY stand-in for the future
// backend/database. Nothing here should ever contain real
// secrets or real passwords. In Phase 1 only the `users` table
// is populated (auth needs it); later phases will add students,
// faculty, courses, attendance, marks, assignments,
// announcements, notifications and timetable data here — and
// ONLY here, so components never define their own ad-hoc data.
// ===========================================================

import { ROLES } from '@/constants/roles';

export const users = [
  {
    id: 'u-admin-1',
    name: 'Meera Krishnan',
    email: 'admin@educore.edu',
    password: 'admin123', // mock-only, never a real credential
    role: ROLES.ADMIN,
    avatar: null,
    department: 'Administration',
    phone: '+91 90000 00001',
  },
  {
    id: 'u-faculty-1',
    name: 'Dr. Arvind Rao',
    email: 'faculty@educore.edu',
    password: 'faculty123',
    role: ROLES.FACULTY,
    avatar: null,
    department: 'Computer Science',
    designation: 'Associate Professor',
    phone: '+91 90000 00002',
  },
  {
    id: 'u-student-1',
    name: 'Haris Ahmed',
    email: 'student@educore.edu',
    password: 'student123',
    role: ROLES.STUDENT,
    avatar: null,
    department: 'Computer Science',
    year: 3,
    section: 'A',
    registerNumber: 'CSE2023045',
    phone: '+91 90000 00003',
  },
];
