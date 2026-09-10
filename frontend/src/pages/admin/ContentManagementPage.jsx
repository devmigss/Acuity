/**
 * Acuity — System Administrator Content Management Page
 *
 * Aligned with Figures 3.17, 3.40, and 3.41 of the Capstone Project Document.
 * Provides two primary administrative sub-modules:
 * 1. System Announcements: Publish, schedule, archive, and restore broadcast notices.
 * 2. Public Page Editor: Configure copy and graphics for Landing, About, and Login public views.
 */

import { useState, useMemo, useRef } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAdminStore, SEED_PUBLIC_CONTENT } from '@/stores/useAdminStore'
import { useToastStore } from '@/store/useToastStore'
import PublishNoticeModal from '@/components/admin/PublishNoticeModal'

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('announcements') // 'announcements' | 'public-editor'
  const addToast = useToastStore((s) => s.addToast)

  // ── Centralized Admin State ──
  const announcements = useAdminStore((s) => s.announcements)
  const archiveAnnouncement = useAdminStore((s) => s.archiveAnnouncement)
  const restoreAnnouncement = useAdminStore((s) => s.restoreAnnouncement)
  const publicContent = useAdminStore((s) => s.publicContent) || SEED_PUBLIC_CONTENT
  const updatePublicContent = useAdminStore((s) => s.updatePublicContent)
  const resetPublicContent = useAdminStore((s) => s.resetPublicContent)

  // ── Announcements Tab State ──
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'Active' | 'Scheduled' | 'Archived'

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    if (statusFilter === 'ALL') return announcements
    return announcements.filter((a) => a.status === statusFilter)
  }, [announcements, statusFilter])

  const handleOpenCreateNotice = () => {
    setEditingNotice(null)
    setIsNoticeModalOpen(true)
  }

  const handleOpenEditNotice = (notice) => {
    setEditingNotice(notice)
    setIsNoticeModalOpen(true)
  }

  const handleArchiveNotice = (id, title) => {
    archiveAnnouncement(id)
    addToast(`Archived notice "${title}".`, 'info')
  }

  const handleRestoreNotice = (id, title) => {
    restoreAnnouncement(id)
    addToast(`Restored notice "${title}".`, 'success')
  }

  // ── Public Page Editor State ──
  const [selectedPage, setSelectedPage] = useState('landing') // 'landing' | 'about' | 'login'
  const [editorState, setEditorState] = useState(() => ({
    landing: { ...SEED_PUBLIC_CONTENT.landing, ...(publicContent?.landing || {}) },
    about: { ...SEED_PUBLIC_CONTENT.about, ...(publicContent?.about || {}) },
    login: { ...SEED_PUBLIC_CONTENT.login, ...(publicContent?.login || {}) },
  }))

  const fileInputRef = useRef(null)

  const handlePageChange = (pageKey) => {
    setSelectedPage(pageKey)
    // Synchronize current page edits with latest store state if untouched
    setEditorState((prev) => ({
      ...prev,
      [pageKey]: {
        ...(SEED_PUBLIC_CONTENT[pageKey] || {}),
        ...(publicContent?.[pageKey] || {}),
      },
    }))
  }

  const handleFieldChange = (pageKey, field, value) => {
    setEditorState((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value,
      },
    }))
  }

  const handleGraphicUpload = (e, pageKey, fieldName) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (PNG, JPG, SVG, WebP).', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      handleFieldChange(pageKey, fieldName, dataUrl)
      addToast(`Graphic loaded for ${pageKey} view preview.`, 'success')
    }
    reader.readAsDataURL(file)
  }

  const handleClearGraphic = (pageKey, fieldName) => {
    handleFieldChange(pageKey, fieldName, '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveAndPublish = () => {
    const pageData = editorState[selectedPage]
    updatePublicContent(selectedPage, pageData)
    addToast('Public layout updated successfully.', 'success')
  }

  const handleResetDefaults = () => {
    resetPublicContent(selectedPage)
    setEditorState((prev) => ({
      ...prev,
      [selectedPage]: { ...SEED_PUBLIC_CONTENT[selectedPage] },
    }))
    addToast(`Reset ${selectedPage} content to default specifications.`, 'info')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header with Primary Broadcast Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-200">
        <PageHeader
          title="Content Management"
          subtitle="Publish global platform notices, scheduled maintenance alerts, and institutional banners."
        />

        {activeTab === 'announcements' && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateNotice}
            className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Publish Platform Notice
          </Button>
        )}
      </div>

      {/* ── Sub-navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-surface-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          System Announcements
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface-100 text-surface-700">
            {announcements.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('public-editor')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'public-editor'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Public Page Editor
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
         SUB-TAB 1: SYSTEM ANNOUNCEMENTS
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'announcements' && (
        <div className="space-y-5">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'Active', 'Scheduled', 'Archived'].map((status) => {
              const count = status === 'ALL'
                ? announcements.length
                : announcements.filter((a) => a.status === status).length

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === status
                      ? 'bg-[#0B1F3A] text-white shadow-2xs'
                      : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  <span>{status === 'ALL' ? 'All Notices' : status}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] ${
                      statusFilter === status
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-100 text-surface-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Announcements Roster */}
          <div className="space-y-3.5">
            {filteredAnnouncements.length === 0 ? (
              <Card>
                <div className="py-12 text-center text-surface-500 text-xs">
                  No announcements found matching the &quot;{statusFilter}&quot; status filter.
                </div>
              </Card>
            ) : (
              filteredAnnouncements.map((ann) => {
                // Badge Styles
                const alertBadgeStyle =
                  ann.alertType === 'Maintenance'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : ann.alertType === 'System Alert'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'

                const statusBadgeStyle =
                  ann.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : ann.status === 'Scheduled'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-surface-100 text-surface-600 border-surface-200'

                return (
                  <div
                    key={ann.id}
                    className="p-4 sm:p-5 rounded-xl bg-white border border-surface-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left Details */}
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${alertBadgeStyle}`}>
                          {ann.alertType}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeStyle}`}>
                          ● {ann.status}
                        </span>

                        <span className="text-[11px] font-medium text-surface-500 flex items-center gap-1">
                          Audience: <strong className="text-surface-700">{ann.audience}</strong>
                        </span>

                        {ann.startDate && (
                          <span className="text-[11px] font-mono text-surface-400">
                            Window: {ann.startDate} {ann.expirationDate ? `→ ${ann.expirationDate}` : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-surface-900">{ann.title}</h3>
                      <p className="text-xs text-surface-600 leading-relaxed">{ann.message}</p>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEditNotice(ann)}
                        className="text-xs font-semibold"
                      >
                        Edit
                      </Button>

                      {ann.status !== 'Archived' ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleArchiveNotice(ann.id, ann.title)}
                          className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200"
                        >
                          Archive
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRestoreNotice(ann.id, ann.title)}
                          className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         SUB-TAB 2: PUBLIC PAGE EDITOR (Figure 3.41)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'public-editor' && (
        <div className="space-y-6">
          {/* Page Selector Tabs */}
          <div className="bg-surface-100 p-1.5 rounded-xl inline-flex flex-wrap gap-1">
            {[
              { id: 'landing', label: 'Landing Page (/)', desc: 'Hero headline, narrative, and platform highlights' },
              { id: 'about', label: 'About Page (/about)', desc: 'Mission statement, challenge overview, preview image' },
              { id: 'login', label: 'Login Screen (/login)', desc: 'Banner tagline, credential metrics, brand graphic' },
            ].map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => handlePageChange(page.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPage === page.id
                    ? 'bg-white text-primary-950 shadow-xs'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-white/50'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Content Configuration Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <Card
                title={`${
                  selectedPage === 'landing'
                    ? 'Landing Page'
                    : selectedPage === 'about'
                    ? 'About Page'
                    : 'Login Screen'
                } Content Configuration`}
                subtitle="Modify public content copy and graphics. Changes reflect immediately on public visitor views."
              >
                <div className="space-y-4 pt-2">
                  {/* ── LANDING PAGE FIELDS ── */}
                  {selectedPage === 'landing' && (
                    <>
                      <Input
                        label="Hero Headline"
                        id="landing-headline"
                        value={editorState.landing.headline}
                        onChange={(e) => handleFieldChange('landing', 'headline', e.target.value)}
                        placeholder="e.g., Colony counting, without the eye strain."
                        required
                      />

                      <div>
                        <label htmlFor="landing-subtitle" className="block text-xs font-semibold text-surface-700 mb-1.5">
                          Subtitle Description
                        </label>
                        <textarea
                          id="landing-subtitle"
                          rows={3}
                          value={editorState.landing.subtitle}
                          onChange={(e) => handleFieldChange('landing', 'subtitle', e.target.value)}
                          placeholder="Acuity automates CFU detection and measurement on Petri dish photos..."
                          className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                        />
                      </div>

                      <Input
                        label="Platform Metric Highlights (Pipe separated |)"
                        id="landing-metrics"
                        value={editorState.landing.metrics}
                        onChange={(e) => handleFieldChange('landing', 'metrics', e.target.value)}
                        placeholder="80%+ Target detection F1 | 40–70 Fine-tuning images | 1-click CSV export"
                      />

                      {/* Hero Graphic Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                          Hero Graphic (Optional Preview)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGraphicUpload(e, 'landing', 'heroGraphicUrl')}
                            className="text-xs text-surface-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-100 file:text-surface-700 hover:file:bg-surface-200 cursor-pointer"
                          />
                          {editorState.landing.heroGraphicUrl && (
                            <button
                              type="button"
                              onClick={() => handleClearGraphic('landing', 'heroGraphicUrl')}
                              className="text-xs text-danger-600 hover:text-danger-800 font-medium cursor-pointer"
                            >
                              Remove Graphic
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── ABOUT PAGE FIELDS ── */}
                  {selectedPage === 'about' && (
                    <>
                      <Input
                        label="About Headline"
                        id="about-headline"
                        value={editorState.about.headline}
                        onChange={(e) => handleFieldChange('about', 'headline', e.target.value)}
                        placeholder="e.g., Smarter colony counting for better research."
                        required
                      />

                      <div>
                        <label htmlFor="about-mission" className="block text-xs font-semibold text-surface-700 mb-1.5">
                          Mission Text
                        </label>
                        <textarea
                          id="about-mission"
                          rows={4}
                          value={editorState.about.mission}
                          onChange={(e) => handleFieldChange('about', 'mission', e.target.value)}
                          placeholder="Acuity is a web-based computer vision platform engineered to assist biology students..."
                          className="w-full text-xs p-3 rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                        />
                      </div>

                      <Input
                        label="Challenge Section Title"
                        id="about-challenge"
                        value={editorState.about.challengeTitle}
                        onChange={(e) => handleFieldChange('about', 'challengeTitle', e.target.value)}
                        placeholder="e.g., Why Manual Colony Counting Falls Short"
                        required
                      />

                      {/* Preview Graphic Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                          Platform Preview Graphic
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGraphicUpload(e, 'about', 'previewGraphicUrl')}
                            className="text-xs text-surface-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-100 file:text-surface-700 hover:file:bg-surface-200 cursor-pointer"
                          />
                          {editorState.about.previewGraphicUrl && (
                            <button
                              type="button"
                              onClick={() => handleClearGraphic('about', 'previewGraphicUrl')}
                              className="text-xs text-danger-600 hover:text-danger-800 font-medium cursor-pointer"
                            >
                              Remove Graphic
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── LOGIN SCREEN FIELDS ── */}
                  {selectedPage === 'login' && (
                    <>
                      <Input
                        label="Banner Tagline"
                        id="login-tagline"
                        value={editorState.login.tagline}
                        onChange={(e) => handleFieldChange('login', 'tagline', e.target.value)}
                        placeholder="e.g., Colony counting, without the eye strain."
                        required
                      />

                      <Input
                        label="Stat Highlights (Separated by · or |)"
                        id="login-stats"
                        value={editorState.login.stats}
                        onChange={(e) => handleFieldChange('login', 'stats', e.target.value)}
                        placeholder="85%+ Target detection F1 · 40-70 Fine-tuning images · 1-click CSV export"
                        required
                      />

                      {/* Brand Graphic Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                          Brand / Left Column Graphic
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGraphicUpload(e, 'login', 'brandGraphicUrl')}
                            className="text-xs text-surface-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-100 file:text-surface-700 hover:file:bg-surface-200 cursor-pointer"
                          />
                          {editorState.login.brandGraphicUrl && (
                            <button
                              type="button"
                              onClick={() => handleClearGraphic('login', 'brandGraphicUrl')}
                              className="text-xs text-danger-600 hover:text-danger-800 font-medium cursor-pointer"
                            >
                              Remove Graphic
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="mt-6 pt-4 border-t border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleResetDefaults}
                    className="text-xs text-surface-600 hover:text-surface-900"
                  >
                    Reset to Defaults
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAndPublish}
                    className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Save &amp; Publish Changes
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right: Live View Simulation Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card
                title="Live Visitor Preview"
                subtitle={`Simulated rendering of public ${selectedPage} viewport.`}
              >
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-3 text-xs">
                  {/* Badge */}
                  <div className="flex items-center justify-between border-b border-surface-200 pb-2">
                    <span className="font-bold text-surface-800 uppercase tracking-wider text-[10px]">
                      Target: /{selectedPage === 'landing' ? '' : selectedPage}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Synchronized
                    </span>
                  </div>

                  {/* Landing Simulation */}
                  {selectedPage === 'landing' && (
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-primary-900 text-sm leading-snug">
                        {editorState.landing.headline || 'Headline placeholder'}
                      </h4>
                      <p className="text-surface-600 text-[11px] leading-relaxed">
                        {editorState.landing.subtitle || 'Subtitle description placeholder'}
                      </p>
                      <div className="p-2 rounded bg-white border border-surface-200 text-[10px] font-semibold text-primary-800 flex flex-wrap gap-2">
                        {editorState.landing.metrics?.split('|').map((m, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-primary-50">
                            {m.trim()}
                          </span>
                        ))}
                      </div>
                      {editorState.landing.heroGraphicUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-surface-200 max-h-40">
                          <img
                            src={editorState.landing.heroGraphicUrl}
                            alt="Hero preview"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* About Simulation */}
                  {selectedPage === 'about' && (
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-primary-900 text-sm leading-snug">
                        {editorState.about.headline || 'About headline placeholder'}
                      </h4>
                      <p className="text-surface-600 text-[11px] leading-relaxed">
                        {editorState.about.mission || 'Mission statement placeholder'}
                      </p>
                      <div className="p-2 rounded bg-surface-200/50 text-[11px] font-bold text-surface-800">
                        Section: {editorState.about.challengeTitle}
                      </div>
                      {editorState.about.previewGraphicUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-surface-200 max-h-40">
                          <img
                            src={editorState.about.previewGraphicUrl}
                            alt="About preview"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Login Simulation */}
                  {selectedPage === 'login' && (
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-primary-900 text-sm leading-snug">
                        {editorState.login.tagline || 'Tagline placeholder'}
                      </h4>
                      <div className="p-2 rounded bg-white border border-surface-200 text-[10px] font-semibold text-surface-700">
                        {editorState.login.stats}
                      </div>
                      {editorState.login.brandGraphicUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-surface-200 max-h-40">
                          <img
                            src={editorState.login.brandGraphicUrl}
                            alt="Brand preview"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish / Edit Notice Modal ── */}
      <PublishNoticeModal
        key={editingNotice?.id || (isNoticeModalOpen ? 'open' : 'closed')}
        isOpen={isNoticeModalOpen}
        onClose={() => {
          setIsNoticeModalOpen(false)
          setEditingNotice(null)
        }}
        noticeToEdit={editingNotice}
      />
    </div>
  )
}
