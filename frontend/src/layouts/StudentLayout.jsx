/**
 * Acuity — Student Layout
 *
 * REQ: Section 2.1 — student users manage projects, upload images,
 * annotate, collaborate, and export.
 *
 * Layout shell: sidebar + main content area.
 */

import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/navigation/Sidebar'
import { ROUTES } from '@/routes/routeConstants'

const STUDENT_NAV = [
  {
    label: 'Dashboard',
    path: ROUTES.STUDENT.DASHBOARD,
    end: true,
  },
  {
    label: 'Projects',
    path: ROUTES.STUDENT.PROJECTS,
  },
  {
    label: 'Profile',
    path: ROUTES.PROFILE,
  },
]

export default function StudentLayout() {
  return (
    <div className="min-h-svh bg-surface-50">
      <Sidebar navItems={STUDENT_NAV} title="Acuity" />

      {/* Main content area — offset by sidebar width */}
      <main className="ml-sidebar min-h-svh">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
