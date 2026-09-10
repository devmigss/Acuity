/**
 * Acuity — Registration Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 * Frontend-only prototype designed for future backend-mediated AWS Cognito integration.
 *
 * Registration Fields:
 * 1. Full Name (e.g., Juan Dela Cruz)
 * 2. Institutional Email (e.g., name@institution.edu)
 * 3. Password (min 8 chars, 1 number, 1 special char)
 * 4. Confirm Password
 *
 * Flow:
 * Submit Registration -> OTP Verification route (`/auth/otp`) -> Account activated -> Login
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useAuth } from '@/context/AuthContext'
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/authValidation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useAuth()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
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

    const firstNameError = validateFirstName(formData.firstName)
    if (firstNameError) newErrors.firstName = firstNameError

    const lastNameError = validateLastName(formData.lastName)
    if (lastNameError) newErrors.lastName = lastNameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (confirmError) newErrors.confirmPassword = confirmError

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions to register.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    const displayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`

    try {
      await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: displayName,
        email: formData.email,
        password: formData.password,
      })

      navigate(ROUTES.AUTH.OTP, {
        state: {
          email: formData.email,
          fullName: displayName,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        },
      })
    } catch (err) {
      setErrors({ form: err?.message || 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-2">
      {/* ── Left Column: Brand & Value Proposition ── */}
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
            Create an account to automate CFU detection, review spatial boundaries interactively, and collaborate seamlessly with your research adviser.
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

      {/* ── Right Column: Registration Form Panel ── */}
      <section
        className="px-8 py-12 sm:px-12 md:px-16 lg:px-16 xl:px-20 lg:py-16 xl:py-20 flex flex-col justify-start items-center bg-white"
        aria-labelledby="register-heading"
      >
        <div className="fade-in-up animation-delay-225 w-full max-w-[440px] mx-auto">
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

          {errors.form && (
            <div
              className="mb-5 p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs sm:text-sm text-danger-700"
              role="alert"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 1. First Name & Last Name (stacked on mobile, 2-col on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                type="text"
                placeholder="e.g., Juan"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                autoComplete="given-name"
                required
              />
              <Input
                label="Last Name"
                id="lastName"
                name="lastName"
                type="text"
                placeholder="e.g., Dela Cruz"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                autoComplete="family-name"
                required
              />
            </div>

            {/* 2. Email */}
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="e.g., juan.delacruz@university.edu"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              required
            />

            {/* 3. Password */}
            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
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

            {/* 4. Confirm Password */}
            <div>
              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                }
              />
            </div>

            {/* 5. Terms & Conditions Agreement Checkbox */}
            <div className="pt-1">
              <div className="flex items-start gap-2.5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-surface-300 text-[#0B1F3A] focus:ring-[#0B1F3A] focus:ring-offset-0 cursor-pointer"
                  aria-describedby={errors.agreeToTerms ? 'agreeToTerms-error' : undefined}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-xs sm:text-sm text-surface-600 leading-snug cursor-pointer select-none"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="font-semibold text-accent-600 hover:text-accent-700 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>{' '}
                  and acknowledge the Privacy Policy.
                </label>
              </div>
              {errors.agreeToTerms && (
                <p id="agreeToTerms-error" className="mt-1.5 text-xs text-danger-500" role="alert">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full font-bold bg-[#0B1F3A] hover:bg-[#071527] text-white py-3 rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
              >
                Sign Up
              </Button>
            </div>

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
              <span>A 6-digit verification code will be dispatched to your email.</span>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Terms & Conditions Modal ── */}
      {isTermsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
        >
          <div className="bg-white rounded-2xl border border-surface-200 p-6 max-w-lg w-full shadow-xl space-y-4 animate-scale-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <h3 id="terms-modal-title" className="text-base sm:text-lg font-bold text-surface-900">
                Terms &amp; Conditions
              </h3>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="text-surface-400 hover:text-surface-700 p-1 cursor-pointer text-lg leading-none"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 text-xs sm:text-sm text-surface-600 space-y-3 leading-relaxed">
              <p>
                <strong>1. Academic &amp; Research Integrity:</strong> Acuity is an automated CFU counting and morphological measurement platform designed for biology researchers, faculty advisers, and institutional laboratory personnel. Users agree to submit truthful research imagery and comply with their institution&apos;s research standards.
              </p>
              <p>
                <strong>2. Data Privacy &amp; Compliance:</strong> In accordance with the Philippine Data Privacy Act of 2012 (RA 10173), research datasets and personal user records are isolated and protected. Users maintain ownership of raw and processed laboratory image data.
              </p>
              <p>
                <strong>3. Human-in-the-Loop Validation:</strong> Automated AI detections provided by the platform serve as decision-support calculations. Final scientific results must be verified and approved by authorized faculty advisers before thesis export.
              </p>
              <p>
                <strong>4. Account Responsibility:</strong> Users are responsible for safeguarding login credentials and OTP verification codes.
              </p>
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsTermsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-[#0B1F3A] hover:bg-[#071527] text-white"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, agreeToTerms: true }))
                  if (errors.agreeToTerms) {
                    setErrors((prev) => ({ ...prev, agreeToTerms: undefined }))
                  }
                  setIsTermsModalOpen(false)
                }}
              >
                Accept Terms
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
