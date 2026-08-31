/**
 * Acuity — OTP Verification Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only prototype designed for future backend-mediated AWS Cognito integration.
 *
 * Design features:
 * - 2-column layout matching the established Login, Register, and Recovery pages.
 * - Left column: "Back to registration" navigation, envelope & lock emblem, "Need help?" card,
 *   and institutional footnote.
 * - Right column:
 *   - Primary card: Shield/Lock icon badge, "OTP Verification" heading, email dispatch notice,
 *     6 individual interactive OTP input boxes with auto-advance, backspace navigation, and paste support,
 *     "Verify & Continue" action button, "Resend OTP" trigger, divider, and "Back to sign in" link.
 *   - Bottom helper banner: Spam folder advisory and adviser support reminder.
 * - Temporary navigation: Clicking "Verify & Continue" with a 6-digit code simulates verification and navigates to `/auth/login`.
 */

import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import Button from '@/components/ui/Button'

export default function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const userEmail = location.state?.email || 'your registered email'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resendStatus, setResendStatus] = useState('')
  const [supportNotice, setSupportNotice] = useState(false)

  const inputRefs = useRef([])

  const handleOtpChange = (index, value) => {
    // Only accept numeric characters
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue && value !== '') return

    const newOtp = [...otp]
    newOtp[index] = numericValue.slice(-1)
    setOtp(newOtp)
    if (error) setError('')
    if (resendStatus) setResendStatus('')

    // Auto-advance to next input if digit entered
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    if (error) setError('')

    // Focus the next empty box or the last box
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate client-side OTP validation before temporary prototype navigation
      await new Promise((resolve) => setTimeout(resolve, 600))
      setIsSuccess(true)
      setTimeout(() => {
        navigate(ROUTES.AUTH.LOGIN)
      }, 1400)
    } catch {
      setError('Invalid or expired verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendStatus('Resending verification code...')
    setError('')
    await new Promise((resolve) => setTimeout(resolve, 500))
    setResendStatus('A new 6-digit verification code has been dispatched to your email.')
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Support & Navigation (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-between items-center lg:border-r border-surface-200 bg-white"
        aria-label="OTP verification assistance"
      >
        <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full">
          {/* Top: Back Navigation */}
          <div className="fade-in-up flex items-center justify-start w-full">
            <Link
              to={ROUTES.AUTH.REGISTER}
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
              <span>Back to registration</span>
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
              If you&apos;re having trouble receiving your verification code, contact our support team.
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
                For account authorization, reach out to your faculty adviser or email <span className="font-semibold text-primary-900">support@acuity.app</span>.
              </div>
            )}
          </div>

          {/* Bottom: Institutional Footnote */}
          <div className="fade-in-up animation-delay-300 mt-12 lg:mt-auto pt-8 text-xs text-surface-400 border-t border-surface-100 lg:border-none text-center lg:text-left">
            University of Santo Tomas · College of Information and Computing Sciences
          </div>
        </div>
      </section>

      {/* ── Right Column: OTP Input Card (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-start items-center bg-white"
        aria-labelledby="otp-heading"
      >
        <div className="w-full max-w-[440px] mx-auto flex flex-col gap-6">
          {/* Main Card */}
          <div className="fade-in-up animation-delay-75 bg-white rounded-2xl border border-surface-200/90 p-8 sm:p-10 shadow-sm text-center flex flex-col items-center">
            {/* Top Badge */}
            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-2xs mb-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>

            {/* Title */}
            <h1
              id="otp-heading"
              className="text-2xl sm:text-[28px] font-extrabold text-surface-900 tracking-tight leading-tight mt-3"
            >
              OTP Verification
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-xs sm:text-sm text-surface-500 max-w-sm leading-relaxed">
              AWS Cognito sent a 6-digit verification code to <span className="font-semibold text-surface-800">{userEmail}</span>.
            </p>

            {/* Success Feedback */}
            {isSuccess && (
              <div className="w-full mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 text-left animate-fade-in-up" role="status">
                <div className="font-semibold text-emerald-900 mb-0.5">Account verified successfully!</div>
                Redirecting to the login screen...
              </div>
            )}

            {/* Error Feedback */}
            {error && (
              <div className="w-full mt-4 p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-700 text-left" role="alert">
                {error}
              </div>
            )}

            {/* Resend Status Feedback */}
            {resendStatus && (
              <div className="w-full mt-3 p-3 rounded-lg bg-surface-100 border border-surface-200 text-xs text-surface-700 text-left" role="status">
                {resendStatus}
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} noValidate className="w-full mt-6 space-y-6">
              {/* 6 OTP Input Boxes */}
              <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-2xs"
                    aria-label={`Digit ${idx + 1} of 6`}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={otp.join('').length < 6}
                  className="w-full font-bold bg-[#0B1F3A] hover:bg-[#071527] text-white py-3 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Verify & Continue
                </Button>
              </div>

              {/* Resend Option */}
              <div className="text-xs sm:text-sm text-surface-500">
                Didn&apos;t get a code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-accent-600 hover:text-accent-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  Resend OTP
                </button>
              </div>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
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
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>

          {/* Bottom Synchronization Note */}
          <div className="fade-in-up animation-delay-225 w-full bg-surface-100 rounded-2xl border border-surface-200/80 p-5 flex items-start gap-3 shadow-2xs text-left">
            <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold leading-none">i</span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-surface-900">
                Cognito & Database Synchronization
              </h3>
              <p className="text-[11px] sm:text-xs text-surface-500 mt-0.5 leading-relaxed">
                On success, Cognito&apos;s User ID is synced to Acuity&apos;s local PostgreSQL record and the account is ready to log in.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
