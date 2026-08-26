/**
 * Acuity — Public Layout
 *
 * Layout wrapper for public-facing pages (landing, about).
 * Provides the shared Navbar and Footer chrome.
 *
 * Authenticated layouts (Student, Faculty, Admin) use separate
 * layout shells with sidebar navigation.
 */

import { Outlet } from 'react-router-dom'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
