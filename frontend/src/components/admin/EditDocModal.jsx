/**
 * Acuity — Edit Document Metadata Modal (System Admin)
 *
 * Update title, institutional category, or summary overview of existing repository documents.
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminStore } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

const CATEGORIES = ['Technical Reference', 'Getting Started', 'Policies']

export default function EditDocModal({ isOpen, onClose, document: doc }) {
  const updateDocument = useAdminStore((s) => s.updateDocument)
  const addToast = useToastStore((s) => s.addToast)

  const [title, setTitle] = useState(doc?.title || '')
  const [category, setCategory] = useState(doc?.category || 'Technical Reference')
  const [description, setDescription] = useState(doc?.description || '')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!doc) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Document title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      updateDocument(doc.id, {
        title: title.trim(),
        category,
        description: description.trim(),
      })

      addToast(`Updated document "${title.trim()}".`, 'success')
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to update document.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Document Metadata"
      subtitle={`Updating ${doc.format} file · Uploaded on ${doc.uploadedAt}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-xs text-danger-700">
            {error}
          </div>
        )}

        <Input
          label="Document Title"
          id="edit-doc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label htmlFor="edit-doc-category" className="block text-xs font-semibold text-surface-700 mb-1.5">
            Target Category <span className="text-danger-500">*</span>
          </label>
          <select
            id="edit-doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-doc-description" className="block text-xs font-semibold text-surface-700 mb-1.5">
            Summary / Overview
          </label>
          <textarea
            id="edit-doc-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          />
        </div>

        <div className="pt-4 border-t border-surface-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            className="text-xs bg-[#0B1F3A] hover:bg-[#071527] text-white font-bold"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
