/**
 * Acuity — System Administrator Documentation Page
 *
 * Institutional technical and policy documentation repository.
 * Supports full client-side CRUD:
 * - Search filtering across title, category, format, and description
 * - Modal file uploading (+ Upload Document)
 * - Safe document previewing without auto-download
 * - Metadata editing
 * - Archive, restore, and delete workflows with confirmation dialogs
 */

import { useState, useMemo } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useAdminStore } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'

import UploadDocModal from '@/components/admin/UploadDocModal'
import DocumentPreviewModal from '@/components/admin/DocumentPreviewModal'
import EditDocModal from '@/components/admin/EditDocModal'

export default function DocumentationPage() {
  const documents = useAdminStore((s) => s.documents)
  const archiveDocument = useAdminStore((s) => s.archiveDocument)
  const restoreDocument = useAdminStore((s) => s.restoreDocument)
  const deleteDocument = useAdminStore((s) => s.deleteDocument)
  const addToast = useToastStore((s) => s.addToast)

  // ── Search & Filter State ──
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL') // 'ALL' | 'Getting Started' | 'Technical Reference' | 'Policies' | 'Archived'

  // ── Modals State ──
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [previewingDoc, setPreviewingDoc] = useState(null)
  const [editingDoc, setEditingDoc] = useState(null)
  const [confirmArchiveDoc, setConfirmArchiveDoc] = useState(null)

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return documents.filter((doc) => {
      // Category / Archive status filter
      if (categoryFilter === 'Archived') {
        if (doc.status !== 'Archived') return false
      } else {
        if (doc.status === 'Archived') return false
        if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false
      }

      // Query filter
      if (!q) return true
      const matchesTitle = doc.title?.toLowerCase().includes(q)
      const matchesCategory = doc.category?.toLowerCase().includes(q)
      const matchesFormat = doc.format?.toLowerCase().includes(q)
      const matchesDescription = doc.description?.toLowerCase().includes(q)

      return matchesTitle || matchesCategory || matchesFormat || matchesDescription
    })
  }, [documents, searchQuery, categoryFilter])

  const handleDownload = (doc) => {
    addToast(`Downloaded "${doc.title}.${doc.format === 'PDF' ? 'pdf' : 'md'}" (${doc.size}).`, 'info')
  }

  const handleArchive = () => {
    if (!confirmArchiveDoc) return
    archiveDocument(confirmArchiveDoc.id)
    addToast(`Archived document "${confirmArchiveDoc.title}".`, 'info')
    setConfirmArchiveDoc(null)
  }

  const handleRestore = (doc) => {
    restoreDocument(doc.id)
    addToast(`Restored document "${doc.title}" to active repository.`, 'success')
  }

  const handleDeletePermanent = (doc) => {
    deleteDocument(doc.id)
    addToast(`Permanently removed document "${doc.title}".`, 'error')
    setConfirmArchiveDoc(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header with Upload Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-200">
        <PageHeader
          title="System Documentation"
          subtitle="Developer guides, microservice architecture diagrams, and capstone system specifications."
        />

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer gap-1.5 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          + Upload Document
        </Button>
      </div>

      {/* ── Search Bar & Category Filter Pills ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Getting Started', 'Technical Reference', 'Policies', 'Archived'].map((cat) => {
            const count =
              cat === 'Archived'
                ? documents.filter((d) => d.status === 'Archived').length
                : cat === 'ALL'
                ? documents.filter((d) => d.status !== 'Archived').length
                : documents.filter((d) => d.status !== 'Archived' && d.category === cat).length

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === cat
                    ? 'bg-[#0B1F3A] text-white shadow-2xs'
                    : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Active' : cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Document Repository Table / Card List ── */}
      <Card>
        {filteredDocuments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <svg
              className="w-10 h-10 text-surface-300 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <p className="text-xs font-semibold text-surface-600">
              No documentation found matching your search.
            </p>
            <p className="text-[11px] text-surface-400">
              Try adjusting your search terms or selecting a different category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-200 text-surface-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Document Title &amp; Summary</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-medium">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setPreviewingDoc(doc)}
                    className="hover:bg-surface-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Title & Description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-surface-900 group-hover:text-primary-700 transition-colors">
                        {doc.title}
                      </div>
                      {doc.description && (
                        <p className="text-[11px] text-surface-500 line-clamp-1 mt-0.5 font-normal">
                          {doc.description}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-block text-[11px] font-semibold text-surface-700 px-2 py-0.5 rounded bg-surface-100">
                        {doc.category}
                      </span>
                    </td>

                    {/* Format Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                          doc.format === 'PDF'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {doc.format}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3.5 px-3 text-surface-500 font-mono text-[11px] whitespace-nowrap">
                      {doc.size}
                    </td>

                    {/* Upload Date */}
                    <td className="py-3.5 px-3 text-surface-500 font-mono text-[11px] whitespace-nowrap">
                      {doc.uploadedAt}
                    </td>

                    {/* Actions Group (stops propagation so row click doesn't clash) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        {/* Preview (Eye Icon) */}
                        <button
                          type="button"
                          onClick={() => setPreviewingDoc(doc)}
                          title="Preview document"
                          aria-label={`Preview ${doc.title}`}
                          className="p-1.5 rounded-lg text-surface-500 hover:text-primary-700 hover:bg-surface-100 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>

                        {/* Download (Download Icon) */}
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          title="Download file"
                          aria-label={`Download ${doc.title}`}
                          className="p-1.5 rounded-lg text-surface-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </button>

                        {/* Edit Metadata (Pencil Icon) */}
                        <button
                          type="button"
                          onClick={() => setEditingDoc(doc)}
                          title="Edit metadata"
                          aria-label={`Edit ${doc.title}`}
                          className="p-1.5 rounded-lg text-surface-500 hover:text-primary-700 hover:bg-surface-100 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </button>

                        {/* Archive or Restore */}
                        {doc.status !== 'Archived' ? (
                          <button
                            type="button"
                            onClick={() => setConfirmArchiveDoc(doc)}
                            title="Archive document"
                            aria-label={`Archive ${doc.title}`}
                            className="p-1.5 rounded-lg text-surface-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestore(doc)}
                            title="Restore document"
                            aria-label={`Restore ${doc.title}`}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer text-[11px] font-bold"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Modal: Upload Document ── */}
      <UploadDocModal
        key={isUploadModalOpen ? 'open' : 'closed'}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* ── Modal: Document Preview ── */}
      <DocumentPreviewModal
        isOpen={Boolean(previewingDoc)}
        onClose={() => setPreviewingDoc(null)}
        document={previewingDoc}
      />

      {/* ── Modal: Edit Metadata ── */}
      <EditDocModal
        key={editingDoc?.id || 'none'}
        isOpen={Boolean(editingDoc)}
        onClose={() => setEditingDoc(null)}
        document={editingDoc}
      />

      {/* ── Modal: Archive / Remove Confirmation ── */}
      {confirmArchiveDoc && (
        <Modal
          isOpen={Boolean(confirmArchiveDoc)}
          onClose={() => setConfirmArchiveDoc(null)}
          title="Archive or Remove Document"
          subtitle="Manage document lifecycle in the institutional repository."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-surface-700 leading-relaxed">
              Are you sure you want to archive or remove <strong>{confirmArchiveDoc.title}</strong> from the institutional repository?
            </p>

            <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-xs text-surface-600">
              Archiving hides this file from active search and student/faculty directories while preserving its audit record.
            </div>

            <div className="pt-4 border-t border-surface-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmArchiveDoc(null)}
                className="w-full sm:w-auto text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDeletePermanent(confirmArchiveDoc)}
                className="w-full sm:w-auto text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Delete Permanently
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleArchive}
                className="w-full sm:w-auto text-xs bg-[#0B1F3A] hover:bg-[#071527] text-white"
              >
                Archive Document
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
