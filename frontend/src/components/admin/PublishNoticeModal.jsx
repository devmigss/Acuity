/**
 * Acuity — Publish Notice Modal (System Admin)
 *
 * Modal for authoring and broadcasting global platform announcements,
 * scheduled maintenance alerts, and institutional banners.
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminStore } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

const ALERT_TYPES = ['Maintenance', 'System Alert', 'Info']
const AUDIENCE_OPTIONS = ['All Users', 'Students Only', 'Faculty Only']

export default function PublishNoticeModal({ isOpen, onClose, noticeToEdit = null }) {
  const addAnnouncement = useAdminStore((s) => s.addAnnouncement)
  const updateAnnouncement = useAdminStore((s) => s.updateAnnouncement)
  const addToast = useToastStore((s) => s.addToast)

  const [title, setTitle] = useState(noticeToEdit?.title || '')
  const [alertType, setAlertType] = useState(noticeToEdit?.alertType || 'Info')
  const [message, setMessage] = useState(noticeToEdit?.message || '')
  const [startDate, setStartDate] = useState(
    noticeToEdit?.startDate || new Date().toISOString().split('T')[0]
  )
  const [expirationDate, setExpirationDate] = useState(noticeToEdit?.expirationDate || '')
  const [audience, setAudience] = useState(noticeToEdit?.audience || 'All Users')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if (!title.trim()) {
      setError('Notice title / headline is required.')
      return false
    }
    if (!message.trim()) {
      setError('Banner message is required.')
      return false
    }
    if (startDate && expirationDate && expirationDate < startDate) {
      setError('Expiration date cannot be earlier than the start date.')
      return false
    }
    return true
  }

  const handleAction = (status) => {
    setError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        alertType,
        message: message.trim(),
        startDate: startDate || new Date().toISOString().split('T')[0],
        expirationDate: expirationDate || '',
        audience,
      }

      if (noticeToEdit) {
        updateAnnouncement(noticeToEdit.id, {
          ...payload,
          status,
        })
        addToast(`Notice "${payload.title}" updated (${status}).`, 'success')
      } else {
        addAnnouncement(payload, status)
        addToast(
          status === 'Scheduled'
            ? `Notice "${payload.title}" scheduled for publication.`
            : `Notice "${payload.title}" broadcasted live to ${payload.audience}.`,
          'success'
        )
      }
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to save announcement.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={noticeToEdit ? 'Edit Platform Notice' : 'Publish Platform Notice'}
      subtitle="Broadcast urgent maintenance alerts or general announcements to platform users."
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-700">
            {error}
          </div>
        )}

        {/* Notice Title */}
        <Input
          label="Notice Title / Headline"
          id="notice-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Scheduled Server Optimization"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Alert Type */}
          <div>
            <label htmlFor="alert-type" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Alert Type <span className="text-danger-500">*</span>
            </label>
            <select
              id="alert-type"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {ALERT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Target Audience <span className="text-danger-500">*</span>
            </label>
            <select
              id="target-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {AUDIENCE_OPTIONS.map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Banner Message */}
        <div>
          <label htmlFor="banner-message" className="block text-xs font-semibold text-surface-700 mb-1.5">
            Banner Message <span className="text-danger-500">*</span>
          </label>
          <textarea
            id="banner-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement copy displayed on user dashboard headers and login views..."
            className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            required
          />
        </div>

        {/* Date Window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="expiration-date" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Expiration Date
            </label>
            <input
              id="expiration-date"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-2 p-3 rounded-xl border border-surface-200 bg-surface-50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1.5">
            Banner Preview
          </span>
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              alertType === 'Maintenance'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : alertType === 'System Alert'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-primary-50 border-primary-200 text-primary-900'
            }`}
          >
            <span className="font-bold shrink-0">
              [{alertType}] {title || 'Untitled Notice'}:
            </span>
            <span className="truncate">{message || 'Banner message will be displayed here.'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-surface-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAction('Scheduled')}
            loading={isSubmitting}
            className="w-full sm:w-auto text-xs border-primary-200 text-primary-800 hover:bg-primary-50"
          >
            Schedule Publication
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleAction('Active')}
            loading={isSubmitting}
            className="w-full sm:w-auto text-xs bg-[#0B1F3A] hover:bg-[#071527] text-white"
          >
            Broadcast Notice
          </Button>
        </div>
      </div>
    </Modal>
  )
}
