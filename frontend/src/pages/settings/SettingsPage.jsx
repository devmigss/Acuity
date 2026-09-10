/**
 * Acuity — Account Settings Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 11 — Profile Management:
 * - Edit display name (constructed from First Name & Last Name in responsive 2-column layout)
 * - Edit biography (multiline)
 * - Upload profile avatar
 * - Change password (current password -> new password -> confirm new password)
 * - Deactivate account with confirmation step
 *
 * Preserves mock authentication state and localStorage synchronization.
 */

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/routes/routeConstants'
import {
  validateFirstName,
  validateLastName,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/authValidation'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  const { user, updateProfile, changePassword, deactivateAccount, isLoading } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('profile')
  const [saveNotice, setSaveNotice] = useState({ text: '', type: 'success' })

  // ── Profile Form State ──
  const [prevUserId, setPrevUserId] = useState(user?.id)
  const [formData, setFormData] = useState(() => {
    const splitNames = (user?.displayName || '').trim().split(' ')
    return {
      firstName: user?.firstName || splitNames[0] || '',
      lastName: user?.lastName || splitNames.slice(1).join(' ') || '',
      email: user?.email || '',
      biography: user?.biography || '',
      avatar: user?.avatar || '',
      institution: user?.tenant || 'University of Santo Tomas',
      group: user?.group || 'Department of Biological Sciences',
    }
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // ── Password Form State ──
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // ── Deactivation Modal State ──
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [deactivateConfirmationInput, setDeactivateConfirmationInput] = useState('')
  const [isDeactivating, setIsDeactivating] = useState(false)

  // Adjust form state during rendering if user account changes
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id)
    const splitNames = (user?.displayName || '').trim().split(' ')
    setFormData({
      firstName: user?.firstName || splitNames[0] || '',
      lastName: user?.lastName || splitNames.slice(1).join(' ') || '',
      email: user?.email || '',
      biography: user?.biography || '',
      avatar: user?.avatar || '',
      institution: user?.tenant || 'University of Santo Tomas',
      group: user?.group || 'Department of Biological Sciences',
    })
  }

  // Password strength calculation
  const hasMinLength = passwordData.newPassword.length >= 8
  const hasNumber = /\d/.test(passwordData.newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordData.newPassword)

  const getStrengthLevel = () => {
    if (!passwordData.newPassword) return { label: 'None', score: 0, color: 'text-surface-400' }
    let score = 0
    if (hasMinLength) score++
    if (hasNumber) score++
    if (hasSpecial) score++

    if (score <= 1) return { label: 'Weak', score: 1, color: 'text-danger-500' }
    if (score === 2) return { label: 'Fair', score: 2, color: 'text-accent-500' }
    return { label: 'Strong', score: 3, color: 'text-emerald-600' }
  }

  const strength = getStrengthLevel()

  // ── Profile Handlers ──
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (saveNotice.text) setSaveNotice({ text: '', type: 'success' })
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSaveNotice({ text: 'Please upload a valid image file (JPEG, PNG, or WebP).', type: 'error' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveNotice({ text: 'Image file size exceeds the 5 MB limit.', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setFormData((prev) => ({ ...prev, avatar: dataUrl }))
      setSaveNotice({ text: 'Avatar uploaded. Click "Save Profile Changes" to persist.', type: 'success' })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
    setSaveNotice({ text: 'Avatar removed. Click "Save Profile Changes" to persist.', type: 'success' })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const errors = {}

    const firstErr = validateFirstName(formData.firstName)
    if (firstErr) errors.firstName = firstErr

    const lastErr = validateLastName(formData.lastName)
    if (lastErr) errors.lastName = lastErr

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    setIsSavingProfile(true)
    setProfileErrors({})

    const constructedDisplayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`

    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: constructedDisplayName,
        biography: formData.biography.trim(),
        avatar: formData.avatar,
        tenant: formData.institution.trim(),
        group: formData.group.trim(),
      })

      setSaveNotice({
        text: 'Profile updated successfully! Your display name and details are saved across your workspace.',
        type: 'success',
      })
    } catch (err) {
      setSaveNotice({ text: err?.message || 'Failed to update profile.', type: 'error' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // ── Password Handlers ──
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (saveNotice.text) setSaveNotice({ text: '', type: 'success' })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const errors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Please enter your current password.'
    }

    const newPassErr = validatePassword(passwordData.newPassword)
    if (newPassErr) errors.newPassword = newPassErr

    const confirmErr = validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword)
    if (confirmErr) errors.confirmPassword = confirmErr

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsChangingPassword(true)
    setPasswordErrors({})

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaveNotice({
        text: 'Password changed successfully! You may use your new password on your next login.',
        type: 'success',
      })
    } catch (err) {
      setPasswordErrors({ currentPassword: err?.message || 'Failed to change password.' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // ── Deactivation Handlers ──
  const handleConfirmDeactivation = async () => {
    setIsDeactivating(true)
    try {
      await deactivateAccount()
      setIsDeactivateModalOpen(false)
      navigate(ROUTES.AUTH.LOGIN, {
        replace: true,
        state: { notice: 'Your account has been deactivated.' },
      })
    } catch (err) {
      setSaveNotice({ text: err?.message || 'Deactivation failed.', type: 'error' })
      setIsDeactivating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your researcher profile, password credentials, and account security."
      />

      {/* Tabs Navigation (Preferences & Calibration removed) */}
      <div className="flex border-b border-surface-200 gap-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile')
            setSaveNotice({ text: '', type: 'success' })
          }}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('security')
            setSaveNotice({ text: '', type: 'success' })
          }}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'security'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Security &amp; Account
        </button>
      </div>

      {/* Feedback Banner */}
      {saveNotice.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            saveNotice.type === 'error'
              ? 'bg-danger-50 border-danger-200 text-danger-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
          role="alert"
        >
          <span>{saveNotice.text}</span>
          <button
            type="button"
            onClick={() => setSaveNotice({ text: '', type: 'success' })}
            className="text-surface-500 hover:text-surface-900 cursor-pointer p-1"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. Profile Tab ── */}
      {activeTab === 'profile' && (
        <Card
          title="Researcher Profile"
          subtitle="Your information visible within your research cohort and adviser review workflows."
        >
          <form onSubmit={handleProfileSubmit} noValidate className="space-y-6">
            {/* Avatar & Photo Action Area */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-surface-100">
              {/* Clickable Avatar with Subtle Hover Indicator */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-20 h-20 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 shrink-0 cursor-pointer overflow-hidden shadow-xs"
                title="Click to upload a new avatar photo"
                aria-label="Upload new avatar photo"
              >
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={user?.displayName || 'User Avatar'}
                    className="w-full h-full rounded-full object-cover border-2 border-surface-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl border-2 border-primary-200 shadow-inner">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {/* Subtle Hover Indicator */}
                <div className="absolute inset-0 bg-black/35 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <svg className="w-6 h-6 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    id="avatar-file-input"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    Upload new photo
                  </Button>

                  {formData.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 cursor-pointer"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-surface-400">
                  Recommended format: JPG, PNG, or WebP. Max cumulative size 5 MB.
                </p>
              </div>

              {/* Role Summary */}
              <div className="sm:ml-auto text-left sm:text-right">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Account Role</div>
                <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold capitalize">
                  {user?.role === 'systemadmin' ? 'System Admin' : user?.role === 'faculty' ? 'Faculty Adviser' : 'Student'}
                </div>
              </div>
            </div>

            {/* Responsive Two-Column Layout: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                id="firstName"
                name="firstName"
                type="text"
                placeholder="e.g., Juan"
                value={formData.firstName}
                onChange={handleProfileChange}
                error={profileErrors.firstName}
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
                onChange={handleProfileChange}
                error={profileErrors.lastName}
                autoComplete="family-name"
                required
              />
            </div>

            {/* Email Address (Visible, tied to authentication credentials) */}
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              helpText="Email address is tied to your login identity and cannot be edited directly."
              className="opacity-80"
            />

            {/* Biography Multiline Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="biography" className="text-sm font-medium text-surface-700">
                  Biography
                </label>
                <span className="text-xs text-surface-400">
                  {formData.biography.length} / 500 characters
                </span>
              </div>
              <textarea
                id="biography"
                name="biography"
                rows={4}
                maxLength={500}
                value={formData.biography}
                onChange={handleProfileChange}
                placeholder="Share your research focus, laboratory specialization, or thesis background..."
                className="w-full py-2.5 px-3.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y leading-relaxed"
              />
              <p className="text-xs text-surface-500">
                Brief summary displayed to advisers and collaborators on review queues and project rosters.
              </p>
            </div>

            {/* Academic Institution and Department/Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Academic Institution / Tenant"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleProfileChange}
                placeholder="e.g., University of Santo Tomas"
              />
              <Input
                label="Department / Laboratory Group"
                id="group"
                name="group"
                value={formData.group}
                onChange={handleProfileChange}
                placeholder="e.g., Department of Biological Sciences"
              />
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={isSavingProfile || isLoading}
                className="bg-[#0B1F3A] hover:bg-[#071527] text-white px-6 font-semibold shadow-xs cursor-pointer"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── 2. Security & Account Tab ── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card
            title="Change Password"
            subtitle="Follows the documented current password → new password → confirm password flow."
          >
            <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
              <Input
                label="Current Password"
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                autoComplete="current-password"
                required
                helpText="For demo users: student / faculty / systemadmin"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="New Password"
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.newPassword}
                    autoComplete="new-password"
                    required
                  />

                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                        <span>
                          Strength: <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                        <div
                          className={`h-full rounded-full transition-colors ${
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
                          className={`h-full rounded-full transition-colors ${
                            strength.score >= 2
                              ? strength.score === 2
                                ? 'bg-accent-500'
                                : 'bg-emerald-500'
                              : 'bg-surface-200'
                          }`}
                        />
                        <div
                          className={`h-full rounded-full transition-colors ${
                            strength.score >= 3 ? 'bg-emerald-500' : 'bg-surface-200'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isChangingPassword || isLoading}
                  className="bg-[#0B1F3A] hover:bg-[#071527] text-white px-6 font-semibold shadow-xs cursor-pointer"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Multi-Factor Authentication (MFA) Card */}
          <Card
            title="Multi-Factor Authentication (MFA)"
            subtitle="Protects your research projects and laboratory dataset integrity."
          >
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 border border-surface-200">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-surface-900">Email OTP Verification</div>
                <div className="text-xs text-surface-500">6-digit verification code dispatched during authentication</div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                Active
              </span>
            </div>
          </Card>

          {/* Danger Zone: Account Deactivation (Standard SaaS Treatment) */}
          <div className="bg-white rounded-xl border border-danger-200/80 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <h3 className="text-sm font-bold text-surface-900">Deactivate Account</h3>
                <p className="text-xs text-surface-500 leading-relaxed">
                  This action flags your account as inactive and disables future sign-ins. Your submitted projects and annotations will remain intact for your laboratory group.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeactivateModalOpen(true)}
                className="shrink-0 text-danger-600 border-danger-300 hover:bg-danger-50 hover:border-danger-400 hover:text-danger-700 font-semibold cursor-pointer"
              >
                Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Account Deactivation Confirmation Modal ── */}
      {isDeactivateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-modal-title"
        >
          <div className="bg-white rounded-2xl border border-surface-200 p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <h3 id="deactivate-modal-title" className="text-base font-bold text-surface-900">
                  Deactivate Your Account?
                </h3>
                <p className="text-xs text-surface-500 mt-1">
                  This action flags your account as inactive and disables future sign-ins. Your submitted projects and annotations will remain intact for your laboratory group.
                </p>
              </div>
            </div>

            <div className="p-3 bg-danger-50/60 rounded-lg border border-danger-100 text-xs text-danger-800 leading-relaxed">
              To proceed with deactivation, please type <strong className="font-mono text-danger-900">DEACTIVATE</strong> below:
            </div>

            <Input
              placeholder="Type DEACTIVATE to confirm"
              value={deactivateConfirmationInput}
              onChange={(e) => setDeactivateConfirmationInput(e.target.value)}
              className="text-xs"
              autoFocus
            />

            <div className="pt-2 flex justify-end gap-2.5 border-t border-surface-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsDeactivateModalOpen(false)
                  setDeactivateConfirmationInput('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={isDeactivating}
                disabled={deactivateConfirmationInput !== 'DEACTIVATE'}
                onClick={handleConfirmDeactivation}
              >
                Confirm Deactivation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
