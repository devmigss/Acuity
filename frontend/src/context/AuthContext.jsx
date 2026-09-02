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

const SESSION_STORAGE_KEY = 'acuity_demo_session'

/**
 * Fictional Demo Accounts (Frontend Demonstration Only)
 */
export const DEMO_USERS = {
  student: {
    id: 'demo-student-01',
    username: 'student',
    displayName: 'Alex Rivera',
    email: 'student@labgroup.acuity.app',
    role: ROLES.STUDENT,
    title: 'Thesis Researcher',
    tenant: 'UST - Department of Biological Sciences',
    group: 'Group 8 — Microbiology Cohort',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  faculty: {
    id: 'demo-faculty-01',
    username: 'faculty',
    displayName: 'Dr. Maria Santos',
    email: 'faculty@adviser.acuity.app',
    role: ROLES.FACULTY,
    title: 'Faculty Adviser',
    tenant: 'UST - Department of Biological Sciences',
    group: 'Microbiology & Applied Biotechnology',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  systemadmin: {
    id: 'demo-admin-01',
    username: 'systemadmin',
    displayName: 'System Administrator',
    email: 'admin@acuity.app',
    role: ROLES.SYSTEMADMIN,
    title: 'Super User Access',
    tenant: 'University of Santo Tomas · CICS',
    group: 'Platform Administration',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!user

  /**
   * Temporary Mock Login with validation against demo credentials.
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (!credentials) {
        throw new Error('Please enter your credentials.')
      }

      // Check username or email identifier
      const ident = (credentials.username || credentials.email || '').trim().toLowerCase()
      const pass = (credentials.password || '').trim()

      let matchedUser = null

      if ((ident === 'student' || ident.startsWith('student@')) && pass === 'student') {
        matchedUser = DEMO_USERS.student
      } else if ((ident === 'faculty' || ident.startsWith('faculty@')) && pass === 'faculty') {
        matchedUser = DEMO_USERS.faculty
      } else if ((ident === 'systemadmin' || ident === 'admin' || ident.startsWith('admin@')) && (pass === 'systemadmin' || pass === 'admin')) {
        matchedUser = DEMO_USERS.systemadmin
      } else if (credentials.provider === 'google') {
        // Mock SSO default
        matchedUser = DEMO_USERS.student
      }

      if (!matchedUser) {
        throw new Error('Invalid demo credentials. Use student/student, faculty/faculty, or systemadmin/systemadmin.')
      }

      setUser(matchedUser)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(matchedUser))
      return matchedUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Mock Logout — clears mock session.
   */
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 150))
      setUser(null)
      localStorage.removeItem(SESSION_STORAGE_KEY)
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
