/**
 * Acuity — Role Navigation Configurations
 *
 * Defines the navigation sections and items for each authenticated user role.
 * Derived from ACUITY_REQUIREMENTS.md Section 2 and reference designs.
 */

import { ROUTES } from '@/routes/routeConstants'
import { ROLES } from '@/constants/roles'

export const ROLE_NAV_CONFIGS = {
  [ROLES.STUDENT]: {
    sectionTitle: 'Student Dashboard',
    roleLabel: 'Thesis Researcher',
    defaultRoute: ROUTES.STUDENT.DASHBOARD,
    navItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: ROUTES.STUDENT.DASHBOARD,
        end: true,
      },
      {
        id: 'projects',
        label: 'My Projects',
        path: ROUTES.STUDENT.PROJECTS,
      },
      {
        id: 'shared',
        label: 'Shared with Me',
        path: ROUTES.STUDENT.SHARED,
      },
      {
        id: 'adviser-remarks',
        label: 'Adviser Remarks',
        path: ROUTES.STUDENT.ADVISER_REMARKS,
      },
    ],
    accountItems: [
      {
        id: 'settings',
        label: 'Settings',
        path: ROUTES.SETTINGS,
      },
    ],
  },

  [ROLES.FACULTY]: {
    sectionTitle: 'Faculty Review',
    roleLabel: 'Faculty Adviser',
    defaultRoute: ROUTES.FACULTY.OVERVIEW,
    navItems: [
      {
        id: 'overview',
        label: 'Overview',
        path: ROUTES.FACULTY.OVERVIEW,
        end: true,
      },
      {
        id: 'review-queue',
        label: 'Review Queue',
        path: ROUTES.FACULTY.REVIEW_QUEUE,
      },
      {
        id: 'advisees',
        label: 'My Advisees',
        path: ROUTES.FACULTY.ADVISEES,
      },
      {
        id: 'validated',
        label: 'Validated Archive',
        path: ROUTES.FACULTY.VALIDATED,
      },
    ],
    accountItems: [
      {
        id: 'settings',
        label: 'Settings',
        path: ROUTES.SETTINGS,
      },
    ],
  },

  [ROLES.SYSTEMADMIN]: {
    sectionTitle: 'System Administrator',
    roleLabel: 'Super User Access',
    defaultRoute: ROUTES.ADMIN.OVERVIEW,
    navItems: [
      {
        id: 'overview',
        label: 'Overview',
        path: ROUTES.ADMIN.OVERVIEW,
        end: true,
      },
      {
        id: 'users-tenants',
        label: 'User & Tenants',
        path: ROUTES.ADMIN.USERS_TENANTS,
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: ROUTES.ADMIN.AUDIT_LOGS,
      },
      {
        id: 'content',
        label: 'Content Management',
        path: ROUTES.ADMIN.CONTENT,
      },
      {
        id: 'documentation',
        label: 'Documentation',
        path: ROUTES.ADMIN.DOCUMENTATION,
      },
    ],
    accountItems: [
      {
        id: 'settings',
        label: 'Settings',
        path: ROUTES.SETTINGS,
      },
    ],
  },
}

/**
 * Returns the default dashboard path for a given role.
 */
export function getDefaultRouteForRole(role) {
  const config = ROLE_NAV_CONFIGS[role]
  return config ? config.defaultRoute : ROUTES.HOME
}
