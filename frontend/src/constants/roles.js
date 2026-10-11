export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.FACULTY]: 'Faculty',
  [ROLES.STUDENT]: 'Student',
};

export const ROLE_HOME_ROUTE = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.FACULTY]: '/faculty/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
};
