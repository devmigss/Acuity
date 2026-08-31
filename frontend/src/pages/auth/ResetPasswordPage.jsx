/**
 * Acuity — Reset Password Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only prototype designed for future backend-mediated AWS Cognito integration.
 *
 * Design features:
 * - 2-column layout matching the established Login and Forgot Password pages.
 * - Left column: "Back to sign in" navigation, envelope & lock emblem, dynamic "Password tips" checklist,
 *   "Need help?" support card, and legal footnote.
 * - Right column:
 *   - Primary card: Lock badge icon, "Reset Password" title, supporting instructions,
 *     New Password field with lock icon, eye toggle, and dynamic 3-segment strength meter,
 *     Confirm New Password field with matching validation, security guideline box,
 *     "Reset Password" submit button, divider, and "Back to sign in" link.
 * - Subtle staggered entrance animations matching Login and Forgot Password page conventions.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [supportNotice, setSupportNotice] = useState(false)

  // Password criteria verification
  const hasMinLength = formData.newPassword.length >= 8
  const hasUpperLower = /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword)
  const hasNumber = /\d/.test(formData.newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.newPassword)

  // Password strength calculation
  const getStrengthLevel = () => {
    if (!formData.newPassword) return { label: 'None', score: 0, color: 'text-surface-400' }
    let score = 0
    if (hasMinLength) score++
    if (hasUpperLower) score++
    if (hasNumber && hasSpecial) score++

    if (score <= 1) return { label: 'Weak', score: 1, color: 'text-danger-500' }
    if (score === 2) return { label: 'Fair', score: 2, color: 'text-accent-500' }
    return { label: 'Strong', score: 3, color: 'text-emerald-600' }
  }

  const strength = getStrengthLevel()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Simulate client-side password reset execution (ready for Cognito integration)
      await new Promise((resolve) => setTimeout(resolve, 600))
      setIsSuccess(true)
      setTimeout(() => {
        navigate(ROUTES.AUTH.LOGIN)
      }, 1500)
    } catch {
      setErrors({ form: 'Failed to reset password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Password Tips & Support (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-between items-center lg:border-r border-surface-200 bg-white"
        aria-label="Password guidelines and assistance"
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

          {/* Center: Illustration & Password Tips Checklist */}
          <div className="fade-in-up animation-delay-75 flex flex-col items-center sm:items-start my-auto py-8 sm:py-12 max-w-xs mx-auto w-full">
            {/* Envelope & Lock Icon Illustration */}
            <div className="relative mb-6 self-center">
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

            {/* Password Tips Header */}
            <h2 className="text-base font-bold text-surface-900 mb-3 text-left w-full">
              Password tips
            </h2>

            {/* Checklist */}
            <ul className="space-y-2.5 text-xs text-surface-600 w-full" aria-label="Password requirements">
              <li className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${hasMinLength ? 'bg-emerald-500' : 'bg-surface-300'}`}>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className={hasMinLength ? 'text-surface-800 font-medium' : 'text-surface-500'}>
                  Use at least 8 characters
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${hasUpperLower ? 'bg-emerald-500' : 'bg-surface-300'}`}>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className={hasUpperLower ? 'text-surface-800 font-medium' : 'text-surface-500'}>
                  Include upper and lower case letters
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${hasNumber ? 'bg-emerald-500' : 'bg-surface-300'}`}>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className={hasNumber ? 'text-surface-800 font-medium' : 'text-surface-500'}>
                  Include at least one number
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${hasSpecial ? 'bg-emerald-500' : 'bg-surface-300'}`}>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className={hasSpecial ? 'text-surface-800 font-medium' : 'text-surface-500'}>
                  Include at least one special character
                </span>
              </li>
            </ul>

            {/* Need Help Card */}
            <div className="mt-8 w-full rounded-2xl border border-surface-200/90 p-4 bg-surface-50/60 text-left shadow-2xs">
              <h3 className="font-bold text-xs sm:text-sm text-surface-900">
                Need help?
              </h3>
              <p className="text-[11px] sm:text-xs text-surface-500 mt-1 leading-relaxed">
                Contact our support team if you need assistance
              </p>
              <button
                type="button"
                onClick={() => setSupportNotice((prev) => !prev)}
                className="mt-3 inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Contact Support
              </button>

              {supportNotice && (
                <div className="mt-3 pt-3 border-t border-surface-200/60 text-[11px] text-surface-600">
                  Email support at <span className="font-semibold text-primary-900">support@acuity.app</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Legal & Attribution Footnote */}
          <div className="fade-in-up animation-delay-300 mt-12 lg:mt-auto pt-8 text-xs text-surface-400 border-t border-surface-100 lg:border-none text-center lg:text-left">
            <div>© 2026 Acuity. All rights reserved.</div>
            <div className="mt-1 flex items-center justify-center lg:justify-start gap-3 text-surface-500">
              <span className="hover:text-primary-600 cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-primary-600 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Column: Reset Password Form Card (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-start items-center bg-white"
        aria-labelledby="reset-password-heading"
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

            {/* Heading */}
            <h1
              id="reset-password-heading"
              className="text-2xl sm:text-[28px] font-extrabold text-surface-900 tracking-tight leading-tight mt-3"
            >
              Reset Password
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-xs sm:text-sm text-surface-500 max-w-sm leading-relaxed">
              Create a new password for your account. Make sure it&apos;s strong and secure
            </p>

            {/* Success feedback */}
            {isSuccess && (
              <div className="w-full mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 text-left animate-fade-in-up" role="status">
                <div className="font-semibold text-emerald-900 mb-0.5">Password reset successfully!</div>
                Redirecting to the login screen...
              </div>
            )}

            {/* Error feedback */}
            {errors.form && (
              <div className="w-full mt-4 p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-700 text-left" role="alert">
                {errors.form}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="w-full mt-6 space-y-4 text-left">
              {/* New Password */}
              <div>
                <Input
                  label="New Password"
                  id="new-password"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  autoComplete="new-password"
                  required
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 1 1 8 0v4" />
                    </svg>
                  }
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="text-surface-400 hover:text-surface-600 focus:outline-none cursor-pointer p-1"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        /* Eye Slash */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  }
                />

                {/* Password Strength Indicator */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-1.5">
                    <span>
                      Password strength:{' '}
                      <span className={`font-semibold ${strength.color}`}>
                        {strength.label}
                      </span>
                    </span>
                  </div>

                  {/* 3-segment bar */}
                  <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                    <div
                      className={`h-full rounded-full transition-colors duration-200 ${
                        strength.score >= 1
                          ? strength.score === 1
                            ? 'bg-danger-500'
                            : strength.score === 2
                            ? 'bg-accent-500'
                            : 'bg-emerald-500'
                          : 'bg-surface-200'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-colors duration-200 ${
                        strength.score >= 2
                          ? strength.score === 2
                            ? 'bg-accent-500'
                            : 'bg-emerald-500'
                          : 'bg-surface-200'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-colors duration-200 ${
                        strength.score >= 3 ? 'bg-emerald-500' : 'bg-surface-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <Input
                  label="Confirm New Password"
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  helpText={!errors.confirmPassword ? 'Passwords must match' : undefined}
                  autoComplete="new-password"
                  required
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 1 1 8 0v4" />
                    </svg>
                  }
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-surface-400 hover:text-surface-600 focus:outline-none cursor-pointer p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        /* Eye Slash */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>

              {/* Security Advisory Card */}
              <div className="w-full bg-surface-100/90 rounded-xl p-3.5 flex items-start gap-3 border border-surface-200/70 text-left">
                <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold leading-none">i</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-surface-900">
                    Keep your account secure
                  </h4>
                  <p className="text-[11px] text-surface-500 mt-0.5 leading-relaxed">
                    Avoid using easily guessed information such as your name, birthday, or common words.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  className="w-full font-bold bg-[#0B1F3A] hover:bg-[#071527] text-white py-3 rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Reset Password
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
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
