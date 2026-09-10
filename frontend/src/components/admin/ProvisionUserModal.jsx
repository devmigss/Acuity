/**
 * Acuity — Provision User Modal (System Admin)
 *
 * Aligned with Figures 3.23 and 3.39 of the Capstone Document.
 * Supports multi-tenant academic user provisioning strictly for
 * Faculty Adviser and System Admin accounts.
 * (Student/Researcher accounts are self-registered through the public student onboarding flow).
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminStore } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

const PROTOTYPE_TENANTS = [
  'University of Santo Tomas (UST)',
  'Adamson University (AdU)',
]

const PLATFORM_ROLES = [
  'Faculty Adviser',
  'System Admin',
]

export default function ProvisionUserModal({ isOpen, onClose }) {
  const addUser = useAdminStore((s) => s.addUser)
  const addToast = useToastStore((s) => s.addToast)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Faculty Adviser',
    tenant: PROTOTYPE_TENANTS[0],
  })

  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Faculty Adviser',
      tenant: PROTOTYPE_TENANTS[0],
    })
    setError(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose?.()
  }

  const handleRoleChange = (e) => {
    const newRole = e.target.value
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }))
    if (error) setError(null)
  }

  // ── Validation Checks ──
  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    isEmailFormatValid &&
    Boolean(formData.tenant?.trim())

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!isFormValid) {
      if (!isEmailFormatValid) {
        setError('Please enter a valid institutional email address (e.g., .edu or .edu.ph).')
      } else {
        setError('Please fill out all required fields before provisioning.')
      }
      return
    }

    setIsSubmitting(true)
    try {
      const newUser = {
        id: `usr_${Date.now()}`,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        tenant: formData.tenant,
        institution: formData.tenant,
        status: 'Active',
        createdAt: new Date().toISOString(),
      }

      addUser(newUser)

      addToast(
        `Provisioned ${formData.role} account for ${newUser.name} (${newUser.email}).`,
        'success'
      )

      handleClose()
    } catch (err) {
      setError(err?.message || 'Failed to provision user.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Provision New User"
      subtitle="Register an authorized faculty adviser or platform administrator to an institutional tenant."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Error Alert Pattern */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Row 1 — Name */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="provision-firstname"
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              if (error) setError(null)
            }}
            placeholder="e.g., Alex"
            disabled={isSubmitting}
          />

          <Input
            id="provision-lastname"
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              if (error) setError(null)
            }}
            placeholder="e.g., Rivera"
            disabled={isSubmitting}
          />
        </div>

        {/* Row 2 — Institutional Email */}
        <div>
          <Input
            id="provision-email"
            label="Institutional Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }))
              if (error) setError(null)
            }}
            placeholder="e.g., a.rivera@ust.edu.ph"
            helpText="Must belong to a recognized academic institution domain (.edu or .edu.ph)."
            disabled={isSubmitting}
          />
        </div>

        {/* Row 3 — Role & Academic Tenant */}
        <div className="grid grid-cols-2 gap-4">
          {/* Platform Role */}
          <div>
            <label htmlFor="provision-role" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Platform Role <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <select
                id="provision-role"
                value={formData.role}
                onChange={handleRoleChange}
                disabled={isSubmitting}
                className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-surface-300 text-xs text-surface-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none truncate"
              >
                {PLATFORM_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-surface-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Academic Tenant / Institution */}
          <div>
            <label htmlFor="provision-tenant" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Academic Tenant / Institution <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <select
                id="provision-tenant"
                value={formData.tenant}
                onChange={(e) => setFormData((prev) => ({ ...prev, tenant: e.target.value }))}
                disabled={isSubmitting}
                className="w-full py-2.5 pl-3 pr-8 rounded-lg border border-surface-300 text-xs text-surface-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none truncate"
              >
                {PROTOTYPE_TENANTS.map((tenant) => (
                  <option key={tenant} value={tenant}>
                    {tenant}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-surface-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Role-Specific Workspace Information */}
        {formData.role === 'Faculty Adviser' && (
          <div>
            <span className="block text-xs font-semibold text-surface-700 mb-1.5">
              Adviser Workspace Unit
            </span>
            <div className="py-2.5 px-3 rounded-lg border border-surface-200 bg-surface-50 text-surface-700 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Department of Biological Sciences (Adviser Workspace)</span>
            </div>
            <p className="mt-1 text-[11px] text-surface-400">
              Departmental workspace for faculty advisers to review and validate thesis datasets.
            </p>
          </div>
        )}

        {/* Footer Notice */}
        <div className="pt-2">
          <p className="text-xs text-surface-500 leading-relaxed">
            The user will receive an institutional email invitation with verification steps to activate their account.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-surface-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!isFormValid || isSubmitting}
            className={`text-xs font-medium text-white transition-all cursor-pointer ${
              !isFormValid || isSubmitting
                ? 'bg-slate-400 opacity-60 cursor-not-allowed'
                : 'bg-[#0c192c] hover:bg-slate-800 shadow-xs'
            }`}
          >
            {isSubmitting ? 'Provisioning...' : 'Provision User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

