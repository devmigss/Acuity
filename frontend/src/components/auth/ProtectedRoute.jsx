/**
 * Acuity — Protected Route Guard
 *
 * Enforces authentication and role-based access control.
 * Unauthorized access redirects to the user's role dashboard or the login page.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/routes/routeConstants'
import { getDefaultRouteForRole } from '@/components/navigation/roleNavigation'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-surface-500 font-medium">Verifying session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
  }

  // Check role authorization if restricted
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = getDefaultRouteForRole(user.role)
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
