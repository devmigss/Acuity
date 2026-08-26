/**
 * Acuity — Login Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only implementation designed for future backend-mediated AWS Cognito integration.
 *
 * Refined UI/UX:
 * - Perfectly balanced 2-column split layout with crisp vertical dividing boundary on desktop.
 * - Both left and right primary content sections are strictly TOP-ALIGNED with matching vertical baselines.
 * - Left column: Content is horizontally CENTERED within the left half of the page.
 * - Right column: Login form is horizontally CENTERED within the right half of the page with a modest 440px max-width.
 * - Subtle, performant CSS fade-in-up entrance animation with staggered delays and prefers-reduced-motion support.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [authNotice, setAuthNotice] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
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
      await login(formData)
      // Frontend redirect for development flow
      navigate(ROUTES.STUDENT.DASHBOARD)
    } catch {
      setAuthNotice('Invalid email or password. Please try again.')
    }
  }

  const handleGoogleSSO = async () => {
    setAuthNotice('')
    try {
      await login({ provider: 'google' })
      navigate(ROUTES.STUDENT.DASHBOARD)
    } catch {
      setAuthNotice('Google SSO authentication failed.')
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Value Proposition & Cohesive Metrics (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-between items-center lg:border-r border-surface-200 bg-white"
        aria-label="Acuity overview"
      >
        <div className="w-full max-w-xl mx-auto">
          {/* Main Headline */}
          <h1 className="fade-in-up text-3xl sm:text-4xl lg:text-[42px] xl:text-5xl font-extrabold text-primary-900 tracking-tight leading-[1.15]">
            Colony counting, <br />
            without the <span className="text-accent-400">eye strain</span>.
          </h1>

          {/* Subtitle / Description */}
          <p className="fade-in-up animation-delay-75 mt-5 sm:mt-6 text-sm sm:text-base text-surface-500 leading-relaxed max-w-lg">
            Upload a plate. Acuity finds every colony, measures it, and hands your adviser a dataset they can trust.
          </p>

          {/* Cohesive Metrics Component */}
          <div className="fade-in-up animation-delay-150 mt-12 sm:mt-14 lg:mt-16 grid grid-cols-3 gap-6 sm:gap-8 max-w-lg">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary-900 tracking-tight leading-none">
                85%+
              </span>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-accent-400 tracking-tight leading-snug">
                Target detection F1
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary-900 tracking-tight leading-none">
                40-70
              </span>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-accent-400 tracking-tight leading-snug">
                Fine-tuning images
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary-900 tracking-tight leading-none">
                1-click
              </span>
              <span className="mt-2 text-xs sm:text-sm font-semibold text-accent-400 tracking-tight leading-snug">
                CSV export
              </span>
            </div>
          </div>
        </div>

        {/* Institutional Footnote */}
        <div className="w-full max-w-xl mx-auto fade-in-up animation-delay-300 mt-12 lg:mt-auto pt-8 text-xs text-surface-400 border-t border-surface-100 lg:border-none">
          University of Santo Tomas · College of Information and Computing Sciences
        </div>
      </section>

      {/* ── Right Column: Authentication Panel (Top-Aligned & Centered) ── */}
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
              Authenticated via AWS Cognito.
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
            onClick={handleGoogleSSO}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-200 hover:border-surface-300 hover:bg-surface-50/80 transition-colors shadow-2xs text-surface-800 font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {/* Google 'G' Vector Icon */}
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
            <div className="flex-1 border-t border-accent-300" aria-hidden="true" />
            <span className="text-xs text-surface-400 font-normal">
              or
            </span>
            <div className="flex-1 border-t border-accent-300" aria-hidden="true" />
          </div>

          {/* Credential Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="you@labgroup.acuity.app"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
                required
              />

              <div className="mt-1.5 flex justify-end">
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="text-xs font-medium text-accent-500 hover:text-accent-600 transition-colors"
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
                className="w-full font-bold bg-primary-900 hover:bg-primary-800 text-white py-3 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Log In
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
              className="font-semibold text-accent-500 hover:text-accent-600 transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
