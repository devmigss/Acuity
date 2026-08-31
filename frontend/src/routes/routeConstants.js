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
    SHARED: '/student/shared',
    ADVISER_REMARKS: '/student/adviser-remarks',
    PROJECT_DETAIL: '/student/projects/:projectId',
    WORKSPACE: '/student/projects/:projectId/workspace/:plateId',
    WORKSPACE_BASE: '/student/projects/:projectId/workspace',
    ANNOTATION: '/student/projects/:projectId/annotation',
    EXPORT: '/student/projects/:projectId/export',
  },

  // ── Faculty ──
  FACULTY: {
    OVERVIEW: '/faculty/overview',
    REVIEW_QUEUE: '/faculty/review-queue',
    ADVISEES: '/faculty/advisees',
    VALIDATED: '/faculty/validated',
  },

  // ── System Admin ──
  ADMIN: {
    OVERVIEW: '/admin/overview',
    USERS_TENANTS: '/admin/users-tenants',
    AUDIT_LOGS: '/admin/audit-logs',
    CONTENT: '/admin/content',
    DOCUMENTATION: '/admin/documentation',
  },

  // ── Shared Account ──
  SETTINGS: '/settings',
  PROFILE: '/settings',
}
