/**
 * Acuity — Route path constants
 *
 * Central location for all client-side route paths.
 * Referenced by layouts, navigation, and AppRoutes.
 *
 * REQ: Derived from ACUITY_REQUIREMENTS.md Section 24.
 * These are recommended initial routes adapted for the
 * current frontend implementation phase.
 */

export const ROUTES = {
  // ── Public ──
  HOME: '/',
  ABOUT: '/about',

  // ── Auth ──
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    OTP: '/auth/otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // ── Student ──
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    PROJECTS: '/student/projects',
    PROJECT_DETAIL: '/student/projects/:projectId',
    WORKSPACE: '/student/projects/:projectId/workspace',
    ANNOTATION: '/student/projects/:projectId/annotation',
    EXPORT: '/student/projects/:projectId/export',
  },

  // ── Faculty ──
  FACULTY: {
    DASHBOARD: '/faculty/dashboard',
    PROJECTS: '/faculty/projects',
    REVIEW: '/faculty/projects/:projectId/review',
  },

  // ── Admin ──
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    TENANTS: '/admin/tenants',
    AUDIT_LOGS: '/admin/audit-logs',
    CONTENT: '/admin/content',
    SETTINGS: '/admin/settings',
  },

  // ── Profile ──
  PROFILE: '/profile',
}
