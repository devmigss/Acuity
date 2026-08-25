/**
 * Acuity — Auth Context
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — authentication workflows.
 * DECIDE: Backend-mediated auth pattern was confirmed.
 *
 * This provides mock auth state for Phase 1.
 * Real Cognito integration will replace the mock in Phase 9.
 *
 * IMPORTANT: The frontend must never be treated as the final
 * authorization boundary. (REQ: Section 7, 22)
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ROLES } from '@/constants/roles'

const AuthContext = createContext(null)

/**
 * Mock user for development.
 * Replace with real auth in Phase 2/9.
 */
const MOCK_USER = {
  id: 'mock-user-001',
  email: 'student@acuity.dev',
  displayName: 'Dev Student',
  role: ROLES.STUDENT,
  tenantId: 'mock-tenant-001',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!user

  /**
   * Mock login — will be replaced with real auth service call.
   */
  const login = useCallback(async (/* credentials */) => {
    setIsLoading(true)
    try {
      // TODO: Replace with authService.login(credentials) in Phase 2
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser(MOCK_USER)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout — clears auth state and tokens.
   */
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with authService.logout() in Phase 2
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth state.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
