/**
 * Acuity — Forgot Password Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only implementation designed for future backend-mediated AWS Cognito integration.
 *
 * Design features:
 * - 2-column layout matching the established Login page visual architecture and top-alignment.
 * - Left column: "Back to sign in" navigation, help illustration, "Need help?" support prompt,
 *   and institutional affiliation footnote.
 * - Right column:
 *   - Primary card: Lock badge icon, "Forgot Password?" heading, gold explanatory subtext,
 *     Email Address input with envelope icon, "Send Reset Link" submit button, and "Back to sign in" link.
 *   - Helper banner: "Didn't receive the email?" section with "Resend Email" trigger.
 * - Temporary navigation: Clicking "Send Reset Link" navigates to the Reset Password route.
 * - Subtle staggered entrance animations matching Login and Landing page conventions.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState('')
  const [supportNotice, setSupportNotice] = useState(false)

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'Email address is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
    if (resendStatus) setResendStatus('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate client-side validation before temporary frontend prototype navigation
      await new Promise((resolve) => setTimeout(resolve, 400))
      navigate(ROUTES.AUTH.RESET_PASSWORD)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter your email above to resend the reset link')
      return
    }

    setResendStatus('Resending reset link...')
    setError('')
    await new Promise((resolve) => setTimeout(resolve, 500))
    setResendStatus('A new reset link has been dispatched to your email.')
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Support & Navigation (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-between items-center lg:border-r border-surface-200 bg-white"
        aria-label="Password recovery support"
      >
        <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full">
          {/* Top: Back Navigation */}
          <div className="fade-in-up flex items-center justify-start w-full">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg py-1 px-2 -ml-2"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span>Back to sign in</span>
            </Link>
          </div>

          {/* Center: Need Help Illustration & Support Card */}
          <div className="fade-in-up animation-delay-75 flex flex-col items-center text-center my-auto py-12 sm:py-16 max-w-xs mx-auto">
            {/* Envelope & Lock Icon Illustration */}
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-50 border border-surface-200/80 flex items-center justify-center shadow-2xs">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16 text-primary-900"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="6" y="10" width="36" height="26" rx="4" fill="#1B2A4A" />
                  <path d="M6 13L24 26L42 13" stroke="#F9FAFB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 34L18 23" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M42 34L30 23" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Lock Badge in corner */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center shadow-sm text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-surface-900">
              Need help?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-surface-500 leading-relaxed">
              If you&apos;re having trouble resetting your password, contact our support team.
            </p>

            <button
              type="button"
              onClick={() => setSupportNotice((prev) => !prev)}
              className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-surface-300 text-surface-700 hover:bg-surface-50 hover:text-surface-900 text-sm font-semibold transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
            >
              Contact Support
            </button>

            {supportNotice && (
              <div className="mt-4 p-3 rounded-lg bg-surface-100 border border-surface-200 text-xs text-surface-600 animate-fade-in-up">
                For laboratory support, reach out to your university administrator or email <span className="font-semibold text-primary-900">support@acuity.app</span>.
              </div>
            )}
          </div>

          {/* Bottom: Institutional Footnote */}
          <div className="fade-in-up animation-delay-300 mt-12 lg:mt-auto pt-8 text-xs text-surface-400 border-t border-surface-100 lg:border-none text-center lg:text-left">
            University of Santo Tomas · College of Information and Computing Sciences
          </div>
        </div>
      </section>

      {/* ── Right Column: Forgot Password Form & Notification (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-start items-center bg-white"
        aria-labelledby="forgot-password-heading"
      >
        <div className="w-full max-w-[440px] mx-auto flex flex-col gap-6">
          {/* Main Card */}
          <div className="fade-in-up animation-delay-75 bg-white rounded-2xl border border-surface-200/90 p-8 sm:p-10 shadow-sm text-center flex flex-col items-center">
            {/* Top Lock Badge */}
            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-2xs mb-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </div>

            {/* Title */}
            <h1
              id="forgot-password-heading"
              className="text-2xl sm:text-[28px] font-extrabold text-surface-900 tracking-tight leading-tight mt-3"
            >
              Forgot Password?
            </h1>

            {/* Explanatory Subtitle */}
            <p className="mt-2 text-xs sm:text-sm font-medium text-accent-500 max-w-xs leading-relaxed">
              No worries! Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {resendStatus && (
              <div className="w-full mt-3 p-3 rounded-lg bg-surface-100 border border-surface-200 text-xs text-surface-700 text-left" role="status">
                {resendStatus}
              </div>
            )}

            {/* Password Reset Form */}
            <form onSubmit={handleSubmit} noValidate className="w-full mt-6 space-y-4 text-left">
              <Input
                label="Email Address"
                id="reset-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleChange}
                error={error}
                autoComplete="email"
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                }
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  className="w-full font-bold bg-primary-900 hover:bg-primary-800 text-white py-3 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Send Reset Link
                </Button>
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 border-t border-surface-200" aria-hidden="true" />
                <span className="text-xs text-surface-400 font-normal">
                  or
                </span>
                <div className="flex-1 border-t border-surface-200" aria-hidden="true" />
              </div>

              {/* Secondary Navigation */}
              <div className="text-center">
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>

          {/* Bottom Notification Banner */}
          <div className="fade-in-up animation-delay-225 w-full bg-surface-100 rounded-2xl border border-surface-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              {/* Info Circle Icon */}
              <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold leading-none">i</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900">
                  Didn&apos;t receive the email?
                </h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Check your spam folder or try again
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors hover:underline whitespace-nowrap cursor-pointer self-end sm:self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              Resend Email
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
