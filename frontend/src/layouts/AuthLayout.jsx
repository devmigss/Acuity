/**
 * Acuity — Auth Layout
 *
 * Layout shell for authentication pages (Login, Register, OTP, Forgot Password, Reset Password).
 * Reuses the shared Navbar component with variant="auth" for pixel-perfect brand and container alignment.
 */

import { Outlet } from 'react-router-dom'
import Navbar from '@/components/landing/Navbar'

export default function AuthLayout() {
  return (
    <div className="min-h-svh flex flex-col bg-white">
      {/* ── Simplified Auth Navbar with Shared Container Alignment ── */}
      <Navbar variant="auth" />

      {/* ── Main Auth Content ── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
