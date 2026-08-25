/**
 * Acuity — Tenant Context
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 8 — multi-tenancy.
 * The frontend must be prepared to work with tenant context.
 *
 * This provides the current tenant scope.
 * The tenant will be derived from the authenticated user's session.
 */

import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const { user } = useAuth()

  const value = useMemo(
    () => ({
      tenantId: user?.tenantId || null,
      hasTenant: !!user?.tenantId,
    }),
    [user?.tenantId]
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

/**
 * Hook to access the current tenant context.
 */
export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
