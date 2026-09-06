/**
 * Acuity — Login Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only implementation designed for future backend-mediated AWS Cognito integration.
 *
 * Authentication Methods:
 * A. Native Acuity Account: Institutional Email + Password
 * B. Continue with Google (SSO): Simulated Google authentication with strict institutional authorization check
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useAuth, DEMO_USERS } from '@/context/AuthContext'
import { validateInstitutionalEmail } from '@/utils/authValidation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [authNotice, setAuthNotice] = useState('')

  // ── Google SSO Simulation Modal State ──
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [googleEmailInput, setGoogleEmailInput] = useState('')
  const [googleError, setGoogleError] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (authNotice) setAuthNotice('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const loggedInUser = await login(formData)
      const redirectPath = loggedInUser?.role === 'faculty'
        ? ROUTES.FACULTY.OVERVIEW
        : loggedInUser?.role === 'systemadmin'
        ? ROUTES.ADMIN.OVERVIEW
        : ROUTES.STUDENT.DASHBOARD
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setAuthNotice(err?.message || 'Invalid username or password')
    }
  }

  // ── Google SSO Simulation Handler ──
  const handleOpenGoogleSSO = () => {
    setAuthNotice('')
    setGoogleError('')
    setGoogleEmailInput(DEMO_USERS.student.email)
    setIsGoogleModalOpen(true)
  }

  const handleExecuteGoogleSSO = async (emailToTest) => {
    const email = emailToTest || googleEmailInput
    setGoogleError('')
    try {
      const loggedInUser = await loginWithGoogle(email)
      setIsGoogleModalOpen(false)
      const redirectPath = loggedInUser?.role === 'faculty'
        ? ROUTES.FACULTY.OVERVIEW
        : loggedInUser?.role === 'systemadmin'
        ? ROUTES.ADMIN.OVERVIEW
        : ROUTES.STUDENT.DASHBOARD
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setGoogleError(err?.message || 'Google SSO authorization check failed.')
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Value Proposition & Cohesive Metrics ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-between items-center lg:border-r border-surface-200 bg-white"
        aria-label="Acuity overview"
      >
        <div className="w-full max-w-xl mx-auto">
          <h1 className="fade-in-up text-3xl sm:text-4xl lg:text-[42px] xl:text-5xl font-extrabold text-[#0B1F3A] tracking-tight leading-[1.15]">
            Colony counting, <br />
            without the <span className="text-accent-400">eye strain</span>.
          </h1>

          <p className="fade-in-up animation-delay-75 mt-5 sm:mt-6 text-sm sm:text-base text-surface-500 leading-relaxed max-w-lg">
            Upload a plate. Acuity finds every colony, measures it, and hands your adviser a dataset they can trust.
          </p>

          <div className="fade-in-up animation-delay-150 mt-12 sm:mt-14 lg:mt-16 grid grid-cols-3 gap-6 sm:gap-8 max-w-lg">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight leading-none">
                85%+
              </span>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-accent-600 tracking-tight leading-snug">
                Target detection F1
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight leading-none">
                40-70
              </span>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-accent-600 tracking-tight leading-snug">
                Fine-tuning images
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight leading-none">
                1-click
              </span>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-accent-600 tracking-tight leading-snug">
                CSV export
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto fade-in-up animation-delay-300 mt-12 lg:mt-auto pt-8 text-xs text-surface-400 border-t border-surface-100 lg:border-none">
          University of Santo Tomas · College of Information and Computing Sciences
        </div>
      </section>

      {/* ── Right Column: Authentication Panel ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-start items-center bg-white"
        aria-labelledby="login-heading"
      >
        <div className="fade-in-up animation-delay-225 w-full max-w-[440px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2
              id="login-heading"
              className="text-2xl sm:text-[26px] font-bold text-surface-900 tracking-tight leading-tight"
            >
              Login to your workspace
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-surface-400">
              Enter your institutional credentials to access your laboratory workspace.
            </p>
          </div>

          {/* Alert Notice */}
          {authNotice && (
            <div
              className="mb-5 p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs sm:text-sm text-danger-700"
              role="alert"
            >
              {authNotice}
            </div>
          )}

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleOpenGoogleSSO}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-200 hover:border-surface-300 hover:bg-surface-50/80 transition-colors shadow-2xs text-surface-800 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google (SSO)</span>
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-surface-200" aria-hidden="true" />
            <span className="text-xs text-surface-400 font-normal">
              or
            </span>
            <div className="flex-1 border-t border-surface-200" aria-hidden="true" />
          </div>

          {/* Native Credential Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Username or Institutional Email"
              id="username"
              name="username"
              type="text"
              placeholder="e.g., student or name@institution.edu"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              autoComplete="username"
              required
            />

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
                required
              />

              <div className="mt-1.5 flex justify-end">
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-xs font-medium text-accent-600 hover:text-accent-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="pt-1.5">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full font-bold bg-[#0B1F3A] hover:bg-[#071527] text-white py-3 rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
              >
                Sign In
              </Button>
            </div>

            {/* Rate Limiting Notice */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-surface-400">
              <svg
                className="w-4 h-4 text-surface-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
              <span>Protected by rate limiting after repeated failed attempts.</span>
            </div>
          </form>

          {/* Registration Redirect */}
          <div className="mt-8 text-center text-sm text-surface-500">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </section>

      {/* ── Google SSO Simulation Modal ── */}
      {isGoogleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-title"
        >
          <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-7 max-w-md w-full shadow-xl space-y-5 animate-scale-in">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <div>
                  <h3 id="google-modal-title" className="text-base font-bold text-surface-900">
                    Google SSO Simulation
                  </h3>
                  <p className="text-xs text-surface-500">
                    Institutional Authorization Gate
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-surface-400 hover:text-surface-700 p-1 cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-surface-600 leading-relaxed">
              Google authentication verifies identity, but Acuity verifies institutional authorization. Choose a mock account below to simulate:
            </p>

            {/* Error notice */}
            {googleError && (
              <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-700 leading-relaxed">
                {googleError}
              </div>
            )}

            {/* Quick Test Accounts */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block">
                Quick Test Options
              </span>

              {/* Authorized Student */}
              <button
                type="button"
                onClick={() => handleExecuteGoogleSSO(DEMO_USERS.student.email)}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded-xl border border-surface-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-surface-900">{DEMO_USERS.student.email}</div>
                  <div className="text-[11px] text-surface-500">Authorized Student Researcher</div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                  Authorized
                </span>
              </button>

              {/* Authorized Faculty */}
              <button
                type="button"
                onClick={() => handleExecuteGoogleSSO(DEMO_USERS.faculty.email)}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded-xl border border-surface-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-surface-900">{DEMO_USERS.faculty.email}</div>
                  <div className="text-[11px] text-surface-500">Authorized Faculty Adviser</div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                  Authorized
                </span>
              </button>

              {/* Unauthorized Personal Gmail */}
              <button
                type="button"
                onClick={() => handleExecuteGoogleSSO('researcher.test@gmail.com')}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded-xl border border-surface-200 hover:border-danger-300 hover:bg-danger-50/40 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-surface-900">researcher.test@gmail.com</div>
                  <div className="text-[11px] text-surface-500">Personal Gmail (Non-Institutional)</div>
                </div>
                <span className="text-[10px] font-semibold text-danger-700 bg-danger-100 border border-danger-200 px-2 py-0.5 rounded">
                  Access Denied
                </span>
              </button>
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-2 border-t border-surface-100">
              <label htmlFor="custom-google-email" className="text-xs font-medium text-surface-700 block mb-1.5">
                Or test with custom Google email:
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-google-email"
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="name@university.edu"
                  className="flex-1 px-3 py-2 text-xs border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={isLoading}
                  onClick={() => handleExecuteGoogleSSO()}
                  className="text-xs shrink-0"
                >
                  Verify Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
