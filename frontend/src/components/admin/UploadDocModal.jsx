/**
 * Acuity — Upload Document Modal (System Admin)
 *
 * Provision new technical references, onboarding playbooks, or compliance policies
 * to the institutional documentation repository.
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminStore } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

const CATEGORIES = ['Technical Reference', 'Getting Started', 'Policies']
const FORMATS = ['PDF', 'Markdown']

export default function UploadDocModal({ isOpen, onClose }) {
  const addDocument = useAdminStore((s) => s.addDocument)
  const addToast = useToastStore((s) => s.addToast)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Technical Reference')
  const [format, setFormat] = useState('PDF')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('1.2 MB')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      // Format file size
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      setFileSize(`${sizeMb > 0 ? sizeMb : '0.5'} MB`)
      if (!title) {
        // Auto-suggest title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
      }
      if (file.name.endsWith('.md')) {
        setFormat('Markdown')
      } else if (file.name.endsWith('.pdf')) {
        setFormat('PDF')
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Document title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const newDoc = addDocument({
        title: title.trim(),
        category,
        format,
        size: fileSize,
        description: description.trim(),
        fileUrl: fileName ? `/docs/${fileName}` : undefined,
      })

      addToast(`Document "${newDoc.title}" added to repository.`, 'success')
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to upload document.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Institutional Document"
      subtitle="Publish reference architectures, thesis protocol guidelines, or institutional policies."
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
          id="doc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Computer Vision Inference Architecture"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doc-category" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Target Category <span className="text-danger-500">*</span>
            </label>
            <select
              id="doc-category"
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
            <label htmlFor="doc-format" className="block text-xs font-semibold text-surface-700 mb-1.5">
              Document Format <span className="text-danger-500">*</span>
            </label>
            <select
              id="doc-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Attachment */}
        <div>
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">
            File Attachment (.pdf, .md)
          </label>
          <input
            type="file"
            accept=".pdf,.md,text/markdown,application/pdf"
            onChange={handleFileChange}
            className="w-full text-xs text-surface-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-100 file:text-surface-700 hover:file:bg-surface-200 cursor-pointer"
          />
          {fileName && (
            <p className="mt-1 text-[11px] text-surface-500 font-mono">
              Selected: {fileName} ({fileSize})
            </p>
          )}
        </div>

        {/* Summary Description */}
        <div>
          <label htmlFor="doc-description" className="block text-xs font-semibold text-surface-700 mb-1.5">
            Summary / Overview
          </label>
          <textarea
            id="doc-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document contents, target audience, and revision notes..."
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
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  )
}
