/**
 * Acuity — Admin Layout
 *
 * REQ: Section 2.3 — system administrators manage users, tenants,
 * roles, faculty roster, content, notices, and audit logs.
 *
 * Layout shell: sidebar + main content area.
 */

import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/navigation/Sidebar'
import { ROUTES } from '@/routes/routeConstants'

const ADMIN_NAV = [
  {
    label: 'Dashboard',
    path: ROUTES.ADMIN.DASHBOARD,
    end: true,
  },
  {
    label: 'Users',
    path: ROUTES.ADMIN.USERS,
  },
  {
    label: 'Tenants',
    path: ROUTES.ADMIN.TENANTS,
  },
  {
    label: 'Audit Logs',
    path: ROUTES.ADMIN.AUDIT_LOGS,
  },
  {
    label: 'Content',
    path: ROUTES.ADMIN.CONTENT,
  },
  {
    label: 'Settings',
    path: ROUTES.ADMIN.SETTINGS,
  },
  {
    label: 'Profile',
    path: ROUTES.PROFILE,
  },
]

export default function AdminLayout() {
  return (
    <div className="min-h-svh bg-surface-50">
      <Sidebar navItems={ADMIN_NAV} title="Acuity Admin" />

      <main className="ml-sidebar min-h-svh">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
