/**
 * Acuity — Student Project Workspace Page
 *
 * Route: /student/projects/:projectId
 *
 * The central research environment for a specific project.
 * Contains 4 tabs: Overview, Plates/Images, Data, Members.
 *
 * The Plates tab preserves the existing "Petri Dish Photography & Batch Upload"
 * design from the original DashboardPage and adds project-aware upload, simulated
 * processing, and plate table with Inspect/Edit actions.
 *
 * All data reads from and writes to the centralized useProjectStore.
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/routes/routeConstants'
import { useProjectStore, PLATE_STATUS, INVITATION_STATUS } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useToastStore } from '@/store/useToastStore'

/* ── Constants ── */
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_FILES_PER_BATCH = 10
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'plates', label: 'Plates / Images' },
  { id: 'data', label: 'Data' },
  { id: 'members', label: 'Members' },
]

/* ── Helper: format date ── */
function formatDate(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ══════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════ */

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const projects = useProjectStore((s) => s.projects)
  const allPlates = useProjectStore((s) => s.plates)
  const allMembers = useProjectStore((s) => s.members)

  const project = useMemo(() => projects.find((p) => p.id === projectId) || null, [projects, projectId])
  const plates = useMemo(() => allPlates.filter((p) => p.projectId === projectId), [allPlates, projectId])
  const projectMembers = useMemo(() => allMembers.filter((m) => m.projectId === projectId), [allMembers, projectId])

  const stats = useMemo(() => {
    const completedPlates = plates.filter(
      (p) => p.status === PLATE_STATUS.COMPLETED || p.status === PLATE_STATUS.REVIEWED || p.status === PLATE_STATUS.PENDING_ADVISER
    )
    const totalCFU = completedPlates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)
    const avgArea = completedPlates.length > 0
      ? (completedPlates.reduce((sum, p) => sum + parseFloat(p.avgAreaMm2) || 0, 0) / completedPlates.length).toFixed(2)
      : '0.00'
    const avgDiameter = completedPlates.length > 0
      ? (completedPlates.reduce((sum, p) => sum + parseFloat(p.avgDiameterMm) || 0, 0) / completedPlates.length).toFixed(2)
      : '0.00'
    const processing = plates.filter((p) => p.status === PLATE_STATUS.PROCESSING || p.status === PLATE_STATUS.PENDING).length

    return {
      totalPlates: plates.length,
      completedPlates: completedPlates.length,
      totalCFU,
      avgArea: `${avgArea} mm²`,
      avgDiameter: `${avgDiameter} mm`,
      memberCount: projectMembers.length,
      processing,
    }
  }, [plates, projectMembers.length])

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const validTabs = useMemo(() => ['overview', 'plates', 'data', 'members'], [])

  const currentTabFromUrl = searchParams.get('tab') || location.state?.fromTab
  const initialTab = validTabs.includes(currentTabFromUrl) ? currentTabFromUrl : 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync activeTab when searchParams change (e.g. browser back/forward)
  useEffect(() => {
    const tab = searchParams.get('tab') || location.state?.fromTab
    if (tab && validTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams, location.state, activeTab, validTabs])

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', tabId)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader title="Project Not Found" subtitle="This project does not exist or you do not have access." />
        <Link to={ROUTES.STUDENT.PROJECTS} className="text-sm font-semibold text-primary-600 hover:text-primary-800 underline">
          ← Back to My Projects
        </Link>
      </div>
    )
  }

  const isOwner = project.ownerId === user?.id

  return (
    <div className="space-y-0">
      {/* ── Page Header ── */}
      <div className="mb-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-surface-400 mb-3" aria-label="Breadcrumb">
          <Link to={ROUTES.STUDENT.PROJECTS} className="hover:text-primary-700 transition-colors">
            My Projects
          </Link>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-surface-600 font-medium truncate max-w-[300px]">{project.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-xs font-semibold mb-1.5 ${
              project.status === 'Validated'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : project.status === 'Revision Required'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-primary-50 border-primary-100 text-primary-900'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                project.status === 'Validated' ? 'bg-emerald-500' : 'bg-accent-400'
              }`} />
              {project.status}
            </div>
            <PageHeader title={project.name} subtitle={project.organism ? `${project.organism} · ${project.adviser || 'No adviser'}` : project.description} />
          </div>
        </div>

        {/* Status Notices */}
        {project.status === 'Validated' && (
          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="text-xs">
              <strong className="font-bold text-sm block">Dataset Locked by Adviser (Data Freeze Enforced)</strong>
              This project has been approved and permanently frozen. Annotations cannot be edited.
            </div>
          </div>
        )}

        {project.status === 'Revision Required' && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="text-xs">
                <strong className="font-bold text-sm block">Revision Required by Faculty Adviser</strong>
                Your adviser requested corrections. Review the feedback in Adviser Remarks and update your annotations.
              </div>
            </div>
            <Link
              to={ROUTES.STUDENT.ADVISER_REMARKS}
              className="text-xs font-bold text-amber-800 underline shrink-0 hover:text-amber-950"
            >
              View Remarks →
            </Link>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-surface-200 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-900'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              {tab.label}
              {tab.id === 'plates' && plates.length > 0 && (
                <span className="ml-1.5 text-xs text-surface-400">({plates.length})</span>
              )}
              {tab.id === 'members' && (
                <span className="ml-1.5 text-xs text-surface-400">({stats.memberCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'overview' && <OverviewTab project={project} stats={stats} plates={plates} navigate={navigate} />}
      {activeTab === 'plates' && <PlatesTab projectId={projectId} project={project} plates={plates} navigate={navigate} />}
      {activeTab === 'data' && <DataTab projectId={projectId} project={project} plates={plates} navigate={navigate} />}
      {activeTab === 'members' && <MembersTab projectId={projectId} isOwner={isOwner} user={user} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Overview Tab
   ══════════════════════════════════════════════════════════════ */

function OverviewTab({ project, stats, plates }) {
  const completedPlates = plates.filter(
    (p) => p.status === PLATE_STATUS.COMPLETED || p.status === PLATE_STATUS.REVIEWED || p.status === PLATE_STATUS.PENDING_ADVISER
  )
  const allAnalyzed = plates.length > 0 && completedPlates.length === plates.length
  const pctAnalyzed = plates.length > 0 ? Math.round((completedPlates.length / plates.length) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Total Colony Count</div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {stats.totalCFU} <span className="text-sm font-semibold text-accent-600">CFUs</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Across {completedPlates.length} analyzed Petri plates</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Average Area</div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {stats.avgArea.replace(' mm²', '')} <span className="text-sm font-semibold text-surface-500">mm²</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Mean colony area across all plates</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Average Diameter</div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {stats.avgDiameter.replace(' mm', '')} <span className="text-sm font-semibold text-surface-500">mm</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Calibrated at 90mm dish standard</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">AI Inference Status</div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight flex items-center gap-2">
            {pctAnalyzed}%{' '}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              SOD-YOLOv8
            </span>
          </div>
          <p className="mt-2 text-xs text-surface-500">
            {allAnalyzed ? 'All plates analyzed' : `${completedPlates.length}/${plates.length} plates complete`}
          </p>
        </div>
      </div>

      {/* Project Details */}
      <Card title="Project Details">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-surface-500">Description</span>
            <span className="text-surface-900 font-medium text-right max-w-sm">{project.description || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Organism</span>
            <span className="text-surface-900 font-medium">{project.organism || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Adviser</span>
            <span className="text-surface-900 font-medium">{project.adviser || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Created</span>
            <span className="text-surface-900 font-medium">{formatDate(project.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Last Updated</span>
            <span className="text-surface-900 font-medium">{formatDate(project.updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Members</span>
            <span className="text-surface-900 font-medium">{stats.memberCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Total Plates</span>
            <span className="text-surface-900 font-medium">{stats.totalPlates}</span>
          </div>
        </div>
      </Card>

      {/* Recent Plates */}
      {plates.length > 0 && (
        <Card title="Recent Plates" subtitle={`${plates.length} plates in this project`}>
          <div className="space-y-2">
            {plates.slice(0, 5).map((plate) => (
              <div key={plate.id} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={plate.thumbnail} alt={plate.fileName} className="w-8 h-8 rounded-lg object-cover border border-surface-200" />
                  <div>
                    <span className="text-sm font-medium text-surface-900">{plate.fileName}</span>
                    <span className="block text-xs text-surface-400">{plate.colonyCount} CFUs · {plate.confidence}</span>
                  </div>
                </div>
                <StatusBadge status={plate.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Plates Tab — preserves existing "Petri Dish Photography & Batch Upload"
   ══════════════════════════════════════════════════════════════ */

function PlatesTab({ projectId, project, plates, navigate }) {
  const addPlates = useProjectStore((s) => s.addPlates)
  const deletePlate = useProjectStore((s) => s.deletePlate)
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const validateFiles = useCallback((files) => {
    const fileList = Array.from(files)
    if (fileList.length === 0) return null
    if (fileList.length > MAX_FILES_PER_BATCH) {
      return `Maximum ${MAX_FILES_PER_BATCH} images per batch. You selected ${fileList.length}.`
    }
    for (const file of fileList) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return `Invalid file type: ${file.name}. Only JPEG, JPG, and PNG are supported.`
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `File too large: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum 50 MB per image.`
      }
    }
    return null
  }, [])

  const handleFiles = useCallback(
    (files) => {
      setValidationError('')
      const error = validateFiles(files)
      if (error) {
        setValidationError(error)
        return
      }
      addPlates(projectId, Array.from(files))
      useToastStore.getState().addToast(`${files.length} plate(s) uploaded to ${project.name}`, 'success')
    },
    [projectId, project.name, addPlates, validateFiles]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files?.length) {
        handleFiles(e.target.files)
        e.target.value = ''
      }
    },
    [handleFiles]
  )

  const handleInspect = useCallback(
    (plateId) => {
      navigate(`/student/projects/${projectId}/annotate/${plateId}?fromTab=plates`, {
        state: { fromTab: 'plates' },
      })
    },
    [navigate, projectId]
  )

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm) {
      deletePlate(deleteConfirm.id)
      useToastStore.getState().addToast(`${deleteConfirm.fileName} deleted`, 'info')
      setDeleteConfirm(null)
    }
  }, [deleteConfirm, deletePlate])

  // Sort plates: newest first
  const sortedPlates = useMemo(
    () => [...plates].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
    [plates]
  )

  return (
    <div className="space-y-5">
      {/* Upload Zone — Preserves existing design */}
      <Card
        title="Petri Dish Photography & Batch Upload"
        subtitle={`Upload high-resolution photography (JPEG, JPG, PNG). Max ${MAX_FILES_PER_BATCH} images per batch (50 MB each).`}
      >
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowse}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center bg-surface-50/50 transition-colors cursor-pointer group ${
              dragOver
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-surface-300 hover:border-primary-500 hover:bg-surface-50'
            }`}
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-surface-800">
              Drag and drop Petri dish photos, or <span className="text-primary-600 underline">browse files</span>
            </div>
            <p className="mt-1 text-xs text-surface-500">
              Supports JPEG, JPG, PNG up to 50MB each. Spatial circular ROI masking is applied automatically.
            </p>
            <p className="mt-1 text-xs text-surface-400">
              Photos will be added to: <span className="font-semibold text-primary-700">{project.name}</span>
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpeg,.jpg,.png"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />

          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center justify-between shadow-2xs">
              <span>{validationError}</span>
              <button type="button" onClick={() => setValidationError('')} className="text-red-700 cursor-pointer">✕</button>
            </div>
          )}
        </div>
      </Card>

      {/* Plate Table */}
      {sortedPlates.length > 0 ? (
        <Card title="Processed Plates" subtitle={`${sortedPlates.length} plates in this project`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-200 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Plate Preview</th>
                  <th className="py-3 px-3">File Name</th>
                  <th className="py-3 px-3 text-center">Colonies (CFU)</th>
                  <th className="py-3 px-3">Mean Diameter</th>
                  <th className="py-3 px-3">AI Confidence</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {sortedPlates.map((plate) => (
                  <tr key={plate.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 px-3">
                      <img
                        src={plate.thumbnail}
                        alt={plate.fileName}
                        className="w-10 h-10 rounded-lg object-cover border border-surface-200 shadow-2xs"
                      />
                    </td>
                    <td className="py-3 px-3 font-medium text-surface-900">
                      {plate.fileName}
                      <span className="block text-xs text-surface-400">{plate.fileSize}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#0B1F3A]">
                      {plate.colonyCount || '—'}
                    </td>
                    <td className="py-3 px-3 text-surface-700">{plate.avgDiameterMm}</td>
                    <td className="py-3 px-3 text-surface-700">
                      {plate.confidence !== '—' ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {plate.confidence}
                        </span>
                      ) : (
                        <span className="text-xs text-surface-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={plate.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(plate.status === PLATE_STATUS.COMPLETED ||
                          plate.status === PLATE_STATUS.REVIEWED ||
                          plate.status === PLATE_STATUS.PENDING_ADVISER) && (
                          <button
                            type="button"
                            onClick={() => handleInspect(plate.id)}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                          >
                            Inspect / Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(plate)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-center py-16 rounded-xl border border-dashed border-surface-300 bg-surface-50">
          <div className="text-center max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
            <div className="text-base font-semibold text-surface-900">No Plates Yet</div>
            <p className="mt-1 text-sm text-surface-500">
              Upload Petri dish photographs above to begin AI-powered colony analysis.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Plate"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-surface-700">
          Are you sure you want to delete <strong>{deleteConfirm?.fileName}</strong>? This will also remove all associated annotations. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Data Tab
   ══════════════════════════════════════════════════════════════ */

function DataTab({ projectId, project, plates, navigate }) {
  const generateCSVData = useProjectStore((s) => s.generateCSVData)
  const [isExporting, setIsExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState('')

  const completedPlates = plates.filter(
    (p) => p.status === PLATE_STATUS.COMPLETED || p.status === PLATE_STATUS.REVIEWED || p.status === PLATE_STATUS.PENDING_ADVISER
  )

  const handleExportCSV = useCallback(() => {
    setIsExporting(true)
    setTimeout(() => {
      const csvData = generateCSVData(projectId)
      // Trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_colony_data.csv`
      link.click()
      URL.revokeObjectURL(url)

      setIsExporting(false)
      setExportNotice('CSV dataset generated (SPSS / R formatted schema).')
      setTimeout(() => setExportNotice(''), 4000)
    }, 600)
  }, [projectId, project.name, generateCSVData])

  const handleInspect = useCallback(
    (plateId) => {
      navigate(`/student/projects/${projectId}/annotate/${plateId}?fromTab=data`, {
        state: { fromTab: 'data' },
      })
    },
    [navigate, projectId]
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-900">Colony Data Summary</h3>
          <p className="text-sm text-surface-500">{completedPlates.length} plates with analysis results</p>
        </div>
        <Button type="button" variant="secondary" onClick={handleExportCSV} loading={isExporting}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span>Export CSV</span>
        </Button>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <span>{exportNotice}</span>
          <button type="button" onClick={() => setExportNotice('')} className="text-emerald-700 cursor-pointer">✕</button>
        </div>
      )}

      {completedPlates.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-200 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Plate</th>
                  <th className="py-3 px-3 text-center">CFU Count</th>
                  <th className="py-3 px-3">Avg Area</th>
                  <th className="py-3 px-3">Avg Diameter</th>
                  <th className="py-3 px-3">AI Confidence</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {completedPlates.map((plate) => (
                  <tr key={plate.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleInspect(plate.id)}
                        className="font-medium text-surface-900 hover:text-primary-700 hover:underline cursor-pointer text-left"
                        title={`Inspect annotations for ${plate.fileName}`}
                      >
                        {plate.fileName}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#0B1F3A]">{plate.colonyCount}</td>
                    <td className="py-3 px-3 text-surface-700">{plate.avgAreaMm2}</td>
                    <td className="py-3 px-3 text-surface-700">{plate.avgDiameterMm}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {plate.confidence}
                      </span>
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={plate.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleInspect(plate.id)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-center py-16 rounded-xl border border-dashed border-surface-300 bg-surface-50">
          <div className="text-center max-w-sm">
            <div className="text-base font-semibold text-surface-900">No Data Yet</div>
            <p className="mt-1 text-sm text-surface-500">
              Upload and process Petri dish photographs to generate colony analysis data.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Members Tab
   ══════════════════════════════════════════════════════════════ */

function MembersTab({ projectId, isOwner, user }) {
  const allMembers = useProjectStore((s) => s.members)
  const allInvitations = useProjectStore((s) => s.invitations)
  const inviteMember = useProjectStore((s) => s.inviteMember)
  const cancelInvitation = useProjectStore((s) => s.cancelInvitation)

  const members = useMemo(() => allMembers.filter((m) => m.projectId === projectId), [allMembers, projectId])
  const invitations = useMemo(() => allInvitations.filter((i) => i.projectId === projectId), [allInvitations, projectId])

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')

  const handleInvite = useCallback(() => {
    setInviteError('')
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      setInviteError('Please enter a valid institutional email address.')
      return
    }
    // Check if already a member
    if (members.some((m) => m.email.toLowerCase() === email)) {
      setInviteError('This user is already a member of this project.')
      return
    }
    // Check if already invited
    if (invitations.some((i) => i.inviteeEmail.toLowerCase() === email && i.status === INVITATION_STATUS.PENDING)) {
      setInviteError('An invitation is already pending for this email.')
      return
    }
    inviteMember(projectId, email, user)
    setInviteEmail('')
    useToastStore.getState().addToast(`Invitation sent to ${email}`, 'success')
  }, [inviteEmail, members, invitations, inviteMember, projectId, user])

  return (
    <div className="space-y-5">
      {/* Current Members */}
      <Card title="Project Members" subtitle={`${members.length} member(s)`}>
        <div className="space-y-3">
          {members.map((m) => {
            const isCurrentUser =
              (m.userId && user?.id && m.userId === user.id) ||
              (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
              (user?.username === 'student' && (m.userId === 'demo-student-01' || m.email === 'student@labgroup.acuity.app'))

            return (
              <div key={`${m.projectId}-${m.userId}`} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrentUser ? 'bg-primary-600 text-white shadow-2xs' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {m.userName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-surface-900">{m.userName}</span>
                    <span className="block text-xs text-surface-400">{m.email}</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                  m.role === 'Owner'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'bg-surface-100 text-surface-700 border border-surface-200'
                }`}>
                  <span>{m.role}</span>
                  {isCurrentUser && (
                    <>
                      <span className="text-surface-400 font-normal">·</span>
                      <span className="text-primary-700 font-bold">You</span>
                    </>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Invite Peer (owner only) */}
      {isOwner && (
        <Card title="Invite Peer" subtitle="Invite a lab member by their institutional email.">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="colleague@university.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                error={inviteError}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <Button type="button" variant="primary" onClick={handleInvite} className="shrink-0 self-start">
              Send Invite
            </Button>
          </div>
        </Card>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card title="Invitations" subtitle={`${invitations.filter((i) => i.status === INVITATION_STATUS.PENDING).length} pending`}>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-surface-900">{inv.inviteeName}</span>
                  <span className="block text-xs text-surface-400">{inv.inviteeEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    inv.status === INVITATION_STATUS.PENDING
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : inv.status === INVITATION_STATUS.ACCEPTED
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {inv.status}
                  </span>
                  {isOwner && inv.status === INVITATION_STATUS.PENDING && (
                    <button
                      type="button"
                      onClick={() => cancelInvitation(inv.id)}
                      className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Status Badge (shared)
   ══════════════════════════════════════════════════════════════ */

function StatusBadge({ status }) {
  let classes = 'bg-surface-100 text-surface-700'

  switch (status) {
    case PLATE_STATUS.COMPLETED:
    case PLATE_STATUS.REVIEWED:
      classes = 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      break
    case PLATE_STATUS.PENDING_ADVISER:
      classes = 'bg-amber-50 text-amber-700 border border-amber-200'
      break
    case PLATE_STATUS.PROCESSING:
      classes = 'bg-blue-50 text-blue-700 border border-blue-200'
      break
    case PLATE_STATUS.UPLOADING:
    case PLATE_STATUS.PENDING:
      classes = 'bg-surface-100 text-surface-600'
      break
    default:
      break
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {(status === PLATE_STATUS.PROCESSING || status === PLATE_STATUS.UPLOADING) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />
      )}
      {status}
    </span>
  )
}
