/**
 * Acuity — User Management Modal (System Admin)
 *
 * Allows system administrators to:
 * - Edit user roles (Student, Faculty Adviser, System Admin)
 * - Update institutional tenant assignment
 * - Lock/deactivate user accounts (with confirmation)
 * - Reactivate locked accounts
 * - Permanently delete users (with self-deletion protection for active admin)
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ROLES } from '@/constants/roles'
import { useAdminStore, ROLE_LABELS } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

export default function UserManagementModal({
  isOpen,
  onClose,
  user,
  currentAdminEmail = 'admin@acuity.app',
}) {
  const updateUser = useAdminStore((s) => s.updateUser)
  const deactivateUser = useAdminStore((s) => s.deactivateUser)
  const reactivateUser = useAdminStore((s) => s.reactivateUser)
  const deleteUser = useAdminStore((s) => s.deleteUser)
  const addToast = useToastStore((s) => s.addToast)

  const [role, setRole] = useState(user?.role || ROLES.STUDENT)
  const [institution, setInstitution] = useState(user?.institution || '')
  const [name, setName] = useState(user?.name || '')
  const [confirmAction, setConfirmAction] = useState(null) // 'deactivate' | 'reactivate' | 'delete' | null
  const [isProcessing, setIsProcessing] = useState(false)

  if (!user) return null

  const isSelf = user.email?.toLowerCase() === (currentAdminEmail || '').toLowerCase()
  const isDeactivated = user.status === 'Deactivated'

  const handleSaveDetails = (e) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      updateUser(user.id, {
        name: name.trim(),
        role,
        institution: institution.trim(),
      })
      addToast(`Updated user settings for ${name || user.email}`, 'success')
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to update user', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeactivate = () => {
    setIsProcessing(true)
    try {
      deactivateUser(user.id)
      addToast(`Account for ${user.name} has been deactivated.`, 'info')
      setConfirmAction(null)
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to deactivate user', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReactivate = () => {
    setIsProcessing(true)
    try {
      reactivateUser(user.id)
      addToast(`Account for ${user.name} has been reactivated.`, 'success')
      setConfirmAction(null)
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to reactivate user', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = () => {
    if (isSelf) {
      addToast('You cannot delete your own active administrator account.', 'error')
      return
    }
    setIsProcessing(true)
    try {
      deleteUser(user.id, currentAdminEmail)
      addToast(`User ${user.name} was permanently removed.`, 'info')
      setConfirmAction(null)
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Management"
      size="lg"
    >
      <div className="p-6 space-y-6">

        {/* ── User Profile Header Card ── */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0B1F3A] text-white font-bold flex items-center justify-center text-base shadow-sm">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-surface-900">{user.name}</h3>
                {isSelf && (
                  <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    You (Current Admin)
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-500 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isDeactivated
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isDeactivated ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              {isDeactivated ? 'Locked / Deactivated' : 'Active Account'}
            </span>
            <span className="text-[11px] font-semibold text-surface-500">
              {ROLE_LABELS[user.role] || user.roleLabel}
            </span>
          </div>
        </div>

        {/* ── Confirm Deactivation Dialog Overlay ── */}
        {confirmAction === 'deactivate' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>Confirm Account Deactivation</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              Deactivating <strong>{user.name}</strong> will flag their account as inactive and disable future sign-ins.
              Their submitted projects, plates, and colony annotations will remain intact for their laboratory group.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={isProcessing}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeactivate}
                disabled={isProcessing}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Confirm Deactivation
              </Button>
            </div>
          </div>
        )}

        {/* ── Confirm Delete Dialog Overlay ── */}
        {confirmAction === 'delete' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-bold text-rose-900">
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>Permanently Delete User Account?</span>
            </div>
            <p className="text-xs leading-relaxed text-rose-800">
              Are you sure you want to delete <strong>{user.name}</strong> ({user.email})?
              This removes their account credentials from the platform directory. This simulated action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={isProcessing}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDelete}
                disabled={isProcessing}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Permanently Delete User
              </Button>
            </div>
          </div>
        )}

        {/* ── Edit Details Form ── */}
        <form onSubmit={handleSaveDetails} className="space-y-4">
          <Input
            id="manage-user-name"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isProcessing}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manage-user-role" className="block text-xs font-semibold text-surface-700 mb-1">
                Platform Role
              </label>
              <select
                id="manage-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-lg border border-surface-300 text-sm text-surface-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value={ROLES.STUDENT}>Student</option>
                <option value={ROLES.FACULTY}>Faculty Adviser</option>
                <option value={ROLES.SYSTEMADMIN}>System Admin</option>
              </select>
              <p className="text-[11px] text-surface-400 mt-1">
                Changes access permissions across Acuity modules.
              </p>
            </div>

            <div>
              <Input
                id="manage-user-institution"
                label="Institution / Academic Tenant"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g. University of Santo Tomas"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isProcessing || !name.trim()}
              className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </form>

        {/* ── Account Lifecycle & Danger Zone ── */}
        <div className="pt-4 border-t border-surface-200 space-y-3">
          <h4 className="text-xs font-bold text-surface-700 uppercase tracking-wider">
            Account Access & Danger Zone
          </h4>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-surface-200 bg-surface-50">
            <div>
              <div className="text-xs font-semibold text-surface-900">
                {isDeactivated ? 'Reactivate User Account' : 'Deactivate / Lock Account'}
              </div>
              <p className="text-[11px] text-surface-500 mt-0.5">
                {isDeactivated
                  ? 'Restore login access for this user.'
                  : 'Prevent future sign-ins while preserving research data.'}
              </p>
            </div>

            <div>
              {isDeactivated ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleReactivate}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                >
                  Reactivate Account
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmAction('deactivate')}
                  disabled={isProcessing || confirmAction === 'deactivate'}
                  className="text-xs font-semibold text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer"
                >
                  Deactivate Account
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
            <div>
              <div className="text-xs font-semibold text-rose-900">
                Permanently Delete User
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {isSelf
                  ? 'You cannot delete your own active administrator account.'
                  : 'Permanently remove this account from the platform directory.'}
              </p>
            </div>

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSelf || isProcessing || confirmAction === 'delete'}
                onClick={() => setConfirmAction('delete')}
                className="text-xs font-semibold text-rose-600 border-rose-300 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
