/**
 * Acuity — Faculty Layout
 *
 * REQ: Section 2.2 — faculty advisers review student projects,
 * compare images, add spatial feedback, and approve/request revisions.
 *
 * Layout shell: sidebar + main content area.
 */

import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/navigation/Sidebar'
import { ROUTES } from '@/routes/routeConstants'

const FACULTY_NAV = [
  {
    label: 'Dashboard',
    path: ROUTES.FACULTY.DASHBOARD,
    end: true,
  },
  {
    label: 'Projects',
    path: ROUTES.FACULTY.PROJECTS,
  },
  {
    label: 'Profile',
    path: ROUTES.PROFILE,
  },
]

export default function FacultyLayout() {
  return (
    <div className="min-h-svh bg-surface-50">
      <Sidebar navItems={FACULTY_NAV} title="Acuity" />

      <main className="ml-sidebar min-h-svh">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
