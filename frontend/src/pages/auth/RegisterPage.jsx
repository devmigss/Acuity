/**
 * Acuity — Registration Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only prototype designed for future backend-mediated AWS Cognito integration.
 *
 * Fields:
 * - Full Name
 * - Institutional Email
 * - Password (min 8 chars, 1 number, 1 special char)
 * - Confirm Password
 *
 * Flow:
 * - On valid submission, temporarily navigates to the OTP Verification route (`/auth/otp`).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Password criteria verification
  const hasMinLength = formData.password.length >= 8
  const hasNumber = /\d/.test(formData.password)
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password)

  // Password strength calculation
  const getStrengthLevel = () => {
    if (!formData.password) return { label: 'None', score: 0, color: 'text-surface-400' }
    let score = 0
    if (hasMinLength) score++
    if (hasNumber) score++
    if (hasSpecial) score++

    if (score <= 1) return { label: 'Weak', score: 1, color: 'text-danger-500' }
    if (score === 2) return { label: 'Fair', score: 2, color: 'text-accent-500' }
    return { label: 'Strong', score: 3, color: 'text-emerald-600' }
  }

  const strength = getStrengthLevel()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Institutional email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid institutional email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required'
    } else if (formData.password !== formData.confirmPassword) {
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
      // Simulate client-side validation before temporary frontend prototype navigation
      await new Promise((resolve) => setTimeout(resolve, 400))
      navigate(ROUTES.AUTH.OTP, { state: { email: formData.email, fullName: formData.fullName } })
    } catch {
      setErrors({ form: 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Brand & Value Proposition (Top-Aligned & Centered) ── */}
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
            Create an account to automate CFU detection, review spatial boundaries interactively, and collaborate seamlessly with your research adviser.
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

      {/* ── Right Column: Registration Form Panel (Top-Aligned & Centered) ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-start items-center bg-white"
        aria-labelledby="register-heading"
      >
        <div className="fade-in-up animation-delay-225 w-full max-w-[440px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2
              id="register-heading"
              className="text-2xl sm:text-[26px] font-bold text-surface-900 tracking-tight leading-tight"
            >
              Create your account
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-surface-400">
              Join your university laboratory workspace.
            </p>
          </div>

          {/* Form Error Alert */}
          {errors.form && (
            <div
              className="mb-5 p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs sm:text-sm text-danger-700"
              role="alert"
            >
              {errors.form}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Juan Miguel Gonzales"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              autoComplete="name"
              required
            />

            {/* Institutional Email */}
            <Input
              label="Institutional Email"
              id="email"
              name="email"
              type="email"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              required
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-surface-400 hover:text-surface-600 focus:outline-none cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
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
              {formData.password && (
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
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
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

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full font-bold bg-primary-900 hover:bg-primary-800 text-white py-3 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Sign Up
              </Button>
            </div>

            {/* AWS Cognito & Domain Verification Note */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-surface-400 text-center">
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
              <span>System & AWS Cognito validate credentials and password policy.</span>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="font-semibold text-accent-500 hover:text-accent-600 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
