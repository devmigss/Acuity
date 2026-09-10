/**
 * Acuity — Authentication Context & Mock Authentication Service
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 *
 * Architecture:
 * - Provides clean mock authentication state and lifecycle for Phase 1.
 * - Simulates native login, registration, OTP account activation, and Google SSO authorization check.
 * - Stores mock accounts in localStorage (`acuity_mock_accounts`) alongside active session.
 * - Real AWS Cognito and PostgreSQL integration will replace this mock layer in later phases.
 */

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { ROLES } from '@/constants/roles'
import { isPersonalEmail } from '@/utils/authValidation'

const AuthContext = createContext(null)

const SESSION_STORAGE_KEY = 'acuity_demo_session'
const MOCK_ACCOUNTS_KEY = 'acuity_mock_accounts'

/**
 * Baseline Demo Accounts for Frontend Testing
 */
export const DEMO_USERS = {
  student: {
    id: 'demo-student-01',
    username: 'student',
    firstName: 'Alex',
    lastName: 'Rivera',
    displayName: 'Alex Rivera',
    email: 'student@labgroup.acuity.app',
    biography: 'Undergraduate thesis researcher focusing on automated CFU quantification and morphological analysis in bacterial cultures.',
    role: ROLES.STUDENT,
    title: 'Student',
    tenant: 'UST - Department of Biological Sciences',
    group: 'Group 8 — Microbiology Cohort',
    authProvider: 'native',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  faculty: {
    id: 'demo-faculty-01',
    username: 'faculty',
    firstName: 'Prof.',
    lastName: 'Cruz',
    displayName: 'Prof. Cruz',
    email: 'faculty@adviser.acuity.app',
    biography: 'Associate Professor of Microbiology advising student research cohorts on macroscopic colony verification.',
    role: ROLES.FACULTY,
    title: 'Faculty Adviser',
    tenant: 'UST - Department of Biological Sciences',
    group: 'Microbiology & Applied Biotechnology',
    authProvider: 'native',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  systemadmin: {
    id: 'demo-admin-01',
    username: 'systemadmin',
    firstName: 'System',
    lastName: 'Administrator',
    displayName: 'System Administrator',
    email: 'admin@acuity.app',
    biography: 'Platform administrator for Acuity multi-tenant operations, user management, and audit log monitoring.',
    role: ROLES.SYSTEMADMIN,
    title: 'System Admin',
    tenant: 'University of Santo Tomas · CICS',
    group: 'Platform Administration',
    authProvider: 'native',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
}

/**
 * Loads mock accounts list from storage or initializes with defaults.
 */
function getStoredAccounts() {
  try {
    const data = localStorage.getItem(MOCK_ACCOUNTS_KEY)
    if (data) return JSON.parse(data)
  } catch {
    // Ignore storage parse error
  }
  // Initialize with the demo users
  const initial = [
    { ...DEMO_USERS.student, password: 'student' },
    { ...DEMO_USERS.faculty, password: 'faculty' },
    { ...DEMO_USERS.systemadmin, password: 'systemadmin' },
  ]
  try {
    localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(initial))
  } catch {
    // Ignore storage write error
  }
  return initial
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Ignore storage error
  }
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

  // Ensure mock accounts exist on mount
  useEffect(() => {
    getStoredAccounts()
  }, [])

  const isAuthenticated = Boolean(user)

  /**
   * Register a new student/researcher account.
   * New accounts start in `verified: false` until 6-digit OTP verification is completed.
   */
  const registerUser = useCallback(async ({ firstName, lastName, fullName, email, password }) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 350))

      const trimmedEmail = (email || '').trim().toLowerCase()
      const accounts = getStoredAccounts()

      const existing = accounts.find((acc) => acc.email.toLowerCase() === trimmedEmail)
      if (existing) {
        throw new Error('An account with this email already exists.')
      }

      const constructedDisplayName = (fullName || `${firstName || ''} ${lastName || ''}`).trim()

      const newAccount = {
        id: `user-${Date.now()}`,
        username: trimmedEmail.split('@')[0],
        displayName: constructedDisplayName,
        firstName: firstName ? firstName.trim() : constructedDisplayName.split(' ')[0] || '',
        lastName: lastName ? lastName.trim() : constructedDisplayName.split(' ').slice(1).join(' ') || '',
        email: trimmedEmail,
        password,
        role: ROLES.STUDENT,
        title: 'Student',
        tenant: 'University Laboratory Workspace',
        group: 'Microbiology Research Group',
        authProvider: 'native',
        verified: false,
        createdAt: new Date().toISOString(),
      }

      accounts.push(newAccount)
      saveStoredAccounts(accounts)
      return newAccount
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Verify an account using a 6-digit OTP code.
   * Mock rules:
   * - Incomplete (<6 digits) -> rejected
   * - Code '000000' -> simulated invalid/expired code
   * - Any other 6-digit numeric string (standard demo '123456') -> verified
   */
  const verifyOtp = useCallback(async (email, code) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 450))

      if (!code || code.length !== 6) {
        throw new Error('Please enter the complete 6-digit verification code.')
      }

      if (code === '000000') {
        throw new Error('Invalid or expired verification code. Please try again.')
      }

      const trimmedEmail = (email || '').trim().toLowerCase()
      const accounts = getStoredAccounts()
      const target = accounts.find((acc) => acc.email.toLowerCase() === trimmedEmail)

      if (target) {
        target.verified = true
        saveStoredAccounts(accounts)
      }

      return true
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Resend OTP simulation.
   */
  const resendOtp = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return true
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Native Sign In with Email and Password.
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 350))

      if (!credentials) {
        throw new Error('Invalid email or password')
      }

      const ident = (credentials.email || credentials.username || '').trim().toLowerCase()
      const pass = (credentials.password || '').trim()

      if (!ident || !pass) {
        throw new Error('Invalid email or password')
      }

      // Check registered accounts list
      const accounts = getStoredAccounts()
      const matched = accounts.find(
        (acc) => acc.email?.toLowerCase() === ident || acc.username?.toLowerCase() === ident
      )

      if (matched?.deactivated) {
        throw new Error('This account has been deactivated. Please contact your system administrator.')
      }

      // Check shortcuts for demo credentials
      if ((ident === 'student' || ident === 'student@labgroup.acuity.app') && pass === 'student') {
        const studentObj = { ...DEMO_USERS.student, ...(matched || {}) }
        delete studentObj.password
        setUser(studentObj)
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(studentObj))
        return studentObj
      }
      if ((ident === 'faculty' || ident === 'faculty@adviser.acuity.app') && pass === 'faculty') {
        const facultyObj = { ...DEMO_USERS.faculty, ...(matched || {}) }
        delete facultyObj.password
        setUser(facultyObj)
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(facultyObj))
        return facultyObj
      }
      if (
        (ident === 'systemadmin' || ident === 'admin' || ident === 'admin@acuity.app') &&
        (pass === 'systemadmin' || pass === 'admin')
      ) {
        const adminObj = { ...DEMO_USERS.systemadmin, ...(matched || {}) }
        delete adminObj.password
        setUser(adminObj)
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminObj))
        return adminObj
      }

      if (!matched || matched.password !== pass) {
        throw new Error('Invalid email or password')
      }

      if (!matched.verified) {
        throw new Error('Please verify your account before logging in. A verification code was sent to your email.')
      }

      // Session user object (omit password)
      const sessionUser = { ...matched }
      delete sessionUser.password

      setUser(sessionUser)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser))
      return sessionUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Google SSO Simulation with Authorization Gate.
   *
   * Security principle:
   * Having a Google/Gmail identity does NOT grant Acuity access.
   * The user must match an authorized institutional user account.
   */
  const loginWithGoogle = useCallback(async (googleEmail) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const email = (googleEmail || '').trim().toLowerCase()

      if (!email) {
        throw new Error('Please provide your institutional Google account.')
      }

      // Personal Gmail accounts are explicitly rejected
      if (isPersonalEmail(email)) {
        throw new Error(
          `Access denied. Personal accounts (${email}) are not authorized institutional accounts. Please sign in with your institutional email.`
        )
      }

      // Check against authorized accounts
      const accounts = getStoredAccounts()
      const matched = accounts.find((acc) => acc.email.toLowerCase() === email)

      if (!matched) {
        throw new Error(
          `Access denied. The account (${email}) is not registered as an authorized institutional user in Acuity. Please contact your laboratory adviser or register.`
        )
      }

      if (matched.deactivated) {
        throw new Error('This account has been deactivated. Please contact your system administrator.')
      }

      if (!matched.verified) {
        throw new Error('Your account requires email verification before accessing the workspace.')
      }

      const sessionUser = { ...matched, authProvider: 'google' }
      delete sessionUser.password

      setUser(sessionUser)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser))
      return sessionUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Reset Password Simulation.
   */
  const resetPassword = useCallback(async (email, newPassword) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const trimmedEmail = (email || '').trim().toLowerCase()
      const accounts = getStoredAccounts()
      const target = accounts.find((acc) => acc.email.toLowerCase() === trimmedEmail)
      if (target) {
        target.password = newPassword
        saveStoredAccounts(accounts)
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Sign out and clear active session.
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

  /**
   * Update profile fields (First Name, Last Name, display_name, biography, avatar, etc.)
   * Persists to active session and stored mock accounts.
   */
  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      let updatedUser = null
      setUser((prev) => {
        if (!prev) return null
        updatedUser = { ...prev, ...updates }
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser))
          const accounts = getStoredAccounts()
          const idx = accounts.findIndex(
            (acc) => acc.id === updatedUser.id || (acc.email && acc.email.toLowerCase() === updatedUser.email?.toLowerCase())
          )
          if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], ...updates }
            saveStoredAccounts(accounts)
          } else {
            accounts.push(updatedUser)
            saveStoredAccounts(accounts)
          }
        } catch {
          // ignore
        }
        return updatedUser
      })
      return updatedUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Change password flow: current password -> new password -> confirm new password.
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 350))
      const accounts = getStoredAccounts()
      const target = accounts.find(
        (acc) => acc.id === user?.id || (acc.email && acc.email.toLowerCase() === user?.email?.toLowerCase())
      )
      const defaultPass = user?.role === ROLES.STUDENT ? 'student' : user?.role === ROLES.FACULTY ? 'faculty' : 'systemadmin'
      const expectedPassword = target?.password || defaultPass
      if (currentPassword !== expectedPassword) {
        throw new Error('Current password is incorrect.')
      }
      if (target) {
        target.password = newPassword
        saveStoredAccounts(accounts)
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Deactivate account flow: marks account as inactive for future logins and ends session.
   */
  const deactivateAccount = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      if (user) {
        const accounts = getStoredAccounts()
        const target = accounts.find(
          (acc) => acc.id === user.id || (acc.email && acc.email.toLowerCase() === user.email?.toLowerCase())
        )
        if (target) {
          target.deactivated = true
          target.verified = false
          saveStoredAccounts(accounts)
        }
      }
      setUser(null)
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return true
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      loginWithGoogle,
      registerUser,
      verifyOtp,
      resendOtp,
      resetPassword,
      logout,
      updateProfile,
      changePassword,
      deactivateAccount,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      login,
      loginWithGoogle,
      registerUser,
      verifyOtp,
      resendOtp,
      resetPassword,
      logout,
      updateProfile,
      changePassword,
      deactivateAccount,
    ]
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
