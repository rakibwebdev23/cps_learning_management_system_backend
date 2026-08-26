export const ROLES = {
  ADMIN: 'ADMIN',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
