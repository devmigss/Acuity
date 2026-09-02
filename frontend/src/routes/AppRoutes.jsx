/**
 * Acuity — Application Routes
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 24.
 *
 * Public & Auth routes (PublicLayout, AuthLayout)
 * Authenticated role-based routes (DashboardLayout + ProtectedRoute)
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { ROLES } from '@/constants/roles'

// Layouts & Guards
import PublicLayout from '@/layouts/PublicLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Public & Auth Pages
import LandingPage from '@/pages/LandingPage'
import AboutPage from '@/pages/AboutPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import OtpPage from '@/pages/auth/OtpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Shared Authenticated Pages
import SettingsPage from '@/pages/settings/SettingsPage'

// Student Pages
import StudentDashboardPage from '@/pages/student/DashboardPage'
import StudentProjectsPage from '@/pages/student/ProjectsPage'
import StudentSharedProjectsPage from '@/pages/student/SharedProjectsPage'
import StudentAdviserRemarksPage from '@/pages/student/AdviserRemarksPage'
import AnnotationWorkspacePage from '@/pages/student/AnnotationWorkspace'

// Faculty Pages
import FacultyOverviewPage from '@/pages/faculty/OverviewPage'
import FacultyReviewQueuePage from '@/pages/faculty/ReviewQueuePage'
import FacultyAdviseesPage from '@/pages/faculty/AdviseesPage'
import FacultyValidatedArchivePage from '@/pages/faculty/ValidatedArchivePage'

// System Administrator Pages
import AdminOverviewPage from '@/pages/admin/OverviewPage'
import AdminUsersTenantsPage from '@/pages/admin/UsersTenantsPage'
import AdminAuditLogsPage from '@/pages/admin/AuditLogsPage'
import AdminContentManagementPage from '@/pages/admin/ContentManagementPage'
import AdminDocumentationPage from '@/pages/admin/DocumentationPage'

/**
 * Fallback placeholder for unmatched routes.
 */
function NotFoundPage() {
  return (
    <div className="min-h-svh flex items-center justify-center p-6 bg-surface-50">
      <div className="text-center max-w-md">
        <div className="text-4xl font-extrabold text-primary-900 mb-2">404</div>
        <h1 className="text-xl font-bold text-surface-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-surface-500 mb-6">
          The requested page does not exist or has moved.
        </p>
        <a
          href={ROUTES.HOME}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
        >
          Return Home
        </a>
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

      {/* ── Authenticated Routes (Wrapped in ProtectedRoute & DashboardLayout) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Shared Account Settings */}
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<Navigate to={ROUTES.SETTINGS} replace />} />

          {/* ── Student Role Group ── */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path={ROUTES.STUDENT.DASHBOARD} element={<StudentDashboardPage />} />
            <Route path={ROUTES.STUDENT.PROJECTS} element={<StudentProjectsPage />} />
            <Route path={ROUTES.STUDENT.SHARED} element={<StudentSharedProjectsPage />} />
            <Route path={ROUTES.STUDENT.ADVISER_REMARKS} element={<StudentAdviserRemarksPage />} />
            <Route path={ROUTES.STUDENT.WORKSPACE} element={<AnnotationWorkspacePage />} />
            {/* Redirect /workspace (no plateId) to projects for safety */}
            <Route path={ROUTES.STUDENT.WORKSPACE_BASE} element={<Navigate to={ROUTES.STUDENT.PROJECTS} replace />} />
            <Route path="/student" element={<Navigate to={ROUTES.STUDENT.DASHBOARD} replace />} />
          </Route>

          {/* ── Faculty Role Group ── */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.FACULTY]} />}>
            <Route path={ROUTES.FACULTY.OVERVIEW} element={<FacultyOverviewPage />} />
            <Route path={ROUTES.FACULTY.REVIEW_QUEUE} element={<FacultyReviewQueuePage />} />
            <Route path={ROUTES.FACULTY.ADVISEES} element={<FacultyAdviseesPage />} />
            <Route path={ROUTES.FACULTY.VALIDATED} element={<FacultyValidatedArchivePage />} />
            <Route path="/faculty" element={<Navigate to={ROUTES.FACULTY.OVERVIEW} replace />} />
            <Route path="/faculty/dashboard" element={<Navigate to={ROUTES.FACULTY.OVERVIEW} replace />} />
          </Route>

          {/* ── System Administrator Role Group ── */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.SYSTEMADMIN, ROLES.ADMIN]} />}>
            <Route path={ROUTES.ADMIN.OVERVIEW} element={<AdminOverviewPage />} />
            <Route path={ROUTES.ADMIN.USERS_TENANTS} element={<AdminUsersTenantsPage />} />
            <Route path={ROUTES.ADMIN.AUDIT_LOGS} element={<AdminAuditLogsPage />} />
            <Route path={ROUTES.ADMIN.CONTENT} element={<AdminContentManagementPage />} />
            <Route path={ROUTES.ADMIN.DOCUMENTATION} element={<AdminDocumentationPage />} />
            <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.OVERVIEW} replace />} />
            <Route path="/admin/dashboard" element={<Navigate to={ROUTES.ADMIN.OVERVIEW} replace />} />
          </Route>
        </Route>
      </Route>

      {/* ── Catch-all 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
