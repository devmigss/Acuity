/**
 * Acuity — Shared Dashboard Layout Shell
 *
 * Unified layout shell shared by Student, Faculty, and System Administrator roles.
 * Composed of DashboardHeader, role-based Sidebar, and main content area.
 */

import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Sidebar from '@/components/navigation/Sidebar'

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-surface-50">
      {/* ── Top Dashboard Header ── */}
      <DashboardHeader
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {/* ── Body (Sidebar + Content) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Reusable Role Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
