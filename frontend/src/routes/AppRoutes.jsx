/**
 * Acuity — Application Routes
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 24 — recommended initial routes.
 *
 * Phase 1: Public landing page, about page, and auth routes wrapped in their layout shells.
 * Future phases will add student, faculty, and admin route groups
 * wrapped in their respective layout shells and auth guards.
 */

import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import AboutPage from '@/pages/AboutPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import OtpPage from '@/pages/auth/OtpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

/**
 * Lightweight placeholder for routes that don't have
 * a dedicated page component yet.
 */
function PlaceholderPage({ title }) {
  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-surface-900 mb-2">
          {title}
        </h1>
        <p className="text-surface-500">
          This page will be implemented in a future phase.
        </p>
      </div>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      </Route>

      {/* ── Auth routes wrapped in AuthLayout ── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.AUTH.OTP} element={<OtpPage />} />
        <Route
          path={ROUTES.AUTH.FORGOT_PASSWORD}
          element={<ForgotPasswordPage />}
        />
        <Route
          path={ROUTES.AUTH.RESET_PASSWORD}
          element={<ResetPasswordPage />}
        />
      </Route>

      {/*
       * ── Student routes (Phase 2+) ──
       * Will be wrapped in <StudentLayout> with auth guard.
       */}

      {/*
       * ── Faculty routes (Phase 2+) ──
       * Will be wrapped in <FacultyLayout> with auth guard.
       */}

      {/*
       * ── Admin routes (Phase 2+) ──
       * Will be wrapped in <AdminLayout> with auth guard.
       */}

      {/* ── Catch-all 404 ── */}
      <Route
        path="*"
        element={<PlaceholderPage title="Page Not Found" />}
      />
    </Routes>
  )
}
