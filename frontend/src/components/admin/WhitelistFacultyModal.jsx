/**
 * Acuity — Whitelist Faculty Modal (System Admin)
 *
 * Pre-approves faculty emails onto the authorized institutional roster,
 * assigns academic tenant affiliations, and simulates invitation dispatch.
 * Enforces duplicate email checks: "Email already whitelisted."
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminStore } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

export default function WhitelistFacultyModal({
  isOpen,
  onClose,
  initialEntry = null,
}) {
  const addFacultyWhitelist = useAdminStore((s) => s.addFacultyWhitelist)
  const updateWhitelistEntry = useAdminStore((s) => s.updateWhitelistEntry)
  const isEmailWhitelisted = useAdminStore((s) => s.isEmailWhitelisted)
  const addToast = useToastStore((s) => s.addToast)

  const isEditMode = Boolean(initialEntry)

  const [email, setEmail] = useState(initialEntry?.email || '')
  const [institution, setInstitution] = useState(initialEntry?.institution || 'University of Santo Tomas')
  const [department, setDepartment] = useState(initialEntry?.department || 'Department of Biological Sciences')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError('Faculty email address is required.')
      return
    }

    // Duplicate check for new additions
    if (!isEditMode && isEmailWhitelisted(trimmedEmail)) {
      setError('Email already whitelisted.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        updateWhitelistEntry(initialEntry.id, {
          institution: institution.trim(),
          department: department.trim(),
        })
        addToast(`Updated institution assignment for ${trimmedEmail}`, 'success')
      } else {
        addFacultyWhitelist({
          email: trimmedEmail,
          institution: institution.trim(),
          department: department.trim(),
        })
        addToast(`Invitation email sent to ${trimmedEmail}.`, 'success')
      }
      handleClose()
    } catch (err) {
      setError(err.message || 'Operation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Whitelist Institution' : 'Add Faculty to Approved Whitelist'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div>
          <Input
            id="whitelist-email"
            label="Faculty Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            required
            disabled={isEditMode || isSubmitting}
            placeholder="e.g. adviser@institution.edu.ph"
          />
          <p className="text-[11px] text-surface-400 mt-1">
            Pre-approval authorizes the faculty adviser to review and validate thesis datasets.
          </p>
        </div>

        <Input
          id="whitelist-institution"
          label="Academic Tenant / Institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
          placeholder="e.g. University of Santo Tomas"
          disabled={isSubmitting}
        />

        <Input
          id="whitelist-department"
          label="Department / Research Wing"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Department of Biological Sciences · Lab 402"
          disabled={isSubmitting}
        />

        <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-[11px] text-surface-500 leading-relaxed">
          <strong className="text-surface-700 block font-semibold mb-0.5">Authorization Principle:</strong>
          Whitelisting grants faculty authority to review and data-freeze student colony enumeration datasets.
          An academic domain alone does not grant faculty privileges without explicit whitelist authorization.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || !email.trim()}
            className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer"
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
              ? 'Update Assignment'
              : 'Add to Whitelist & Send Invite'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
