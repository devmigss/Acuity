/**
 * Acuity — Shared Plate Annotation Workspace
 *
 * Unified annotation workspace component shared between Student and Faculty workflows.
 *
 * Supported Modes:
 * - 'student_edit': Full interactive annotation editing, drafting, and submission.
 * - 'student_locked': Read-only inspection of frozen/validated datasets (Data Freeze Enforced).
 * - 'faculty_review': Read-only colony geometry inspection with active spatial remarks capability.
 * - 'faculty_archive': Strictly immutable historical record with plate navigation and CSV data export.
 *
 * Visual Consistency & Shared Structure:
 * 1. Shared Breadcrumb / Contextual Header
 * 2. Plate Metadata & Pagination Bar (Previous / Next Plate, Plate X of Y)
 * 3. Shared 1:1 Square Viewport (proportional circular Petri dish)
 * 4. Shared Annotation Toolbar (mode-permission filtered)
 * 5. Shared Right Sidebar Hierarchy:
 *    - Colony Inspection / Provenance
 *    - Detection Morphology Summary
 *    - Detection Legend & Filtering
 *    - Spatial Remarks (with active form in faculty_review)
 * 6. Shared Bottom Action Area (mode-specific primary/secondary actions)
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useAuth } from '@/context/AuthContext'
import { useAnnotationStore, TOOLS } from '@/stores/annotationStore'
import { useProjectStore } from '@/stores/useProjectStore'

import AnnotationCanvas from '@/components/annotation/AnnotationCanvas'
import AnnotationToolbar from '@/components/annotation/AnnotationToolbar'
import DetectionSummary from '@/components/annotation/DetectionSummary'
import ConfidenceThreshold from '@/components/annotation/ConfidenceThreshold'
import AnnotationLegend from '@/components/annotation/AnnotationLegend'
import SelectedColonyInspector from '@/components/annotation/SelectedColonyInspector'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function PlateAnnotationWorkspace({
  mode = 'student_edit',
  projectId,
  plateId,
  returnPath: customReturnPath,
  returnLabel: customReturnLabel,
  onNavigatePlate,
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // Mode booleans
  const isStudentEdit = mode === 'student_edit'
  const isStudentLocked = mode === 'student_locked'
  const isFacultyReview = mode === 'faculty_review'
  const isFacultyArchive = mode === 'faculty_archive'
  const isReadOnly = !isStudentEdit

  // Contextual back navigation defaults
  const fromTab = searchParams.get('fromTab') || 'plates'
  const returnTabLabel = fromTab === 'data' ? 'Data' : 'Plates / Images'

  let defaultReturnPath = `/student/projects/${projectId}?tab=${fromTab}`
  let defaultReturnLabel = `Back to ${returnTabLabel}`

  if (isFacultyReview) {
    defaultReturnPath = `/faculty/review/${projectId}`
    defaultReturnLabel = 'Back to Review Screen'
  } else if (isFacultyArchive) {
    defaultReturnPath = `/faculty/archive/${projectId}`
    defaultReturnLabel = 'Back to Archived Record'
  } else if (isStudentLocked) {
    defaultReturnPath = `/student/projects/${projectId}?tab=${fromTab}`
    defaultReturnLabel = 'Back to Workspace'
  }

  const returnPath = customReturnPath || defaultReturnPath
  const returnLabel = customReturnLabel || defaultReturnLabel

  // Centralized project store
  const projects = useProjectStore((s) => s.projects)
  const allPlates = useProjectStore((s) => s.plates)
  const getAnnotationsForPlate = useProjectStore((s) => s.getAnnotationsForPlate)
  const saveAnnotationsForPlate = useProjectStore((s) => s.saveAnnotationsForPlate)
  const allAdviserRemarks = useProjectStore((s) => s.adviserRemarks)
  const addAdviserRemark = useProjectStore((s) => s.addAdviserRemark)

  const project = useMemo(() => projects.find((p) => p.id === projectId) || null, [projects, projectId])
  const projectPlates = useMemo(
    () => allPlates.filter((p) => p.projectId === projectId),
    [allPlates, projectId]
  )

  const currentPlateIndex = projectPlates.findIndex((p) => p.id === plateId)
  const plate = currentPlateIndex >= 0 ? projectPlates[currentPlateIndex] : (projectPlates[0] || null)

  const prevPlate = currentPlateIndex > 0 ? projectPlates[currentPlateIndex - 1] : null
  const nextPlate = currentPlateIndex < projectPlates.length - 1 ? projectPlates[currentPlateIndex + 1] : null

  // Remarks on this specific plate
  const plateRemarks = useMemo(
    () => allAdviserRemarks.filter((r) => r.projectId === projectId && r.plateId === plateId),
    [allAdviserRemarks, projectId, plateId]
  )

  // Annotation store for zoom, view reset, and canvas annotations
  const {
    zoom,
    setZoom,
    resetView,
    isDirty,
    isSubmitted,
    loadAnnotationsForPlate: loadIntoCanvas,
    getAnnotationSnapshot,
    setActiveTool,
    selectedAnnotationId,
    deleteAnnotation,
    clearSelection,
    annotations,
  } = useAnnotationStore()

  // Local component states
  const [toast, setToast] = useState(null)
  const [isSpacebarPanning, setIsSpacebarPanning] = useState(false)
  const [remarkText, setRemarkText] = useState('')
  const [remarkSavedNotice, setRemarkSavedNotice] = useState(false)
  const remarkInputRef = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Sync annotations for this plate on mount or when plateId changes
  useEffect(() => {
    if (plateId) {
      const plateAnns = getAnnotationsForPlate(plateId)
      loadIntoCanvas(plateAnns)
      setActiveTool(TOOLS.SELECT)
      clearSelection()
    }
    return () => {
      clearSelection()
    }
  }, [plateId, getAnnotationsForPlate, loadIntoCanvas, setActiveTool, clearSelection])

  // Zoom handlers
  const handleZoomIn = useCallback(() => setZoom(Math.min(zoom * 1.25, 5.0)), [zoom, setZoom])
  const handleZoomOut = useCallback(() => setZoom(Math.max(zoom / 1.25, 0.25)), [zoom, setZoom])
  const handleFitView = useCallback(() => resetView(), [resetView])

  // Plate navigation handler
  const navigateToPlate = useCallback(
    (targetPlate) => {
      if (!targetPlate) return
      if (onNavigatePlate) {
        onNavigatePlate(targetPlate.id)
        return
      }

      // Auto-determine URL by mode
      if (isFacultyReview) {
        navigate(`/faculty/review/${projectId}/plate/${targetPlate.id}`)
      } else if (isFacultyArchive) {
        navigate(`/faculty/review/${projectId}/plate/${targetPlate.id}?from=archive`, {
          state: { fromArchive: true },
        })
      } else {
        navigate(`/student/projects/${projectId}/annotate/${targetPlate.id}?fromTab=${fromTab}`)
      }
    },
    [isFacultyReview, isFacultyArchive, onNavigatePlate, navigate, projectId, fromTab]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.matches('input, textarea, button, [contenteditable]')) return
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool(TOOLS.SELECT)
          break
        case 'h':
          setActiveTool(TOOLS.PAN)
          break
        case 'a':
          if (isStudentEdit) setActiveTool(TOOLS.ADD)
          break
        case 'r':
          if (isStudentEdit) setActiveTool(TOOLS.RESIZE)
          break
        case 'm':
          if (isFacultyReview && remarkInputRef.current) {
            remarkInputRef.current.focus()
          }
          break
        case 'escape':
          clearSelection()
          break
        case 'delete':
        case 'backspace':
          if (isStudentEdit && selectedAnnotationId) {
            deleteAnnotation(selectedAnnotationId)
          }
          break
        case '0':
          resetView()
          break
        case '=':
        case '+':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    isStudentEdit,
    isFacultyReview,
    setActiveTool,
    selectedAnnotationId,
    deleteAnnotation,
    clearSelection,
    resetView,
    handleZoomIn,
    handleZoomOut,
  ])

  // Student Actions
  const handleSaveDraft = useCallback(() => {
    if (!isStudentEdit) return
    if (plateId) {
      const snapshot = getAnnotationSnapshot()
      saveAnnotationsForPlate(plateId, snapshot)
    }
    useAnnotationStore.getState().saveDraft()
    showToast('Draft saved successfully. Your annotations are stored locally.')
  }, [isStudentEdit, plateId, getAnnotationSnapshot, saveAnnotationsForPlate, showToast])

  const handleSubmitForReview = useCallback(() => {
    if (!isStudentEdit || isSubmitted) return
    if (plateId) {
      const snapshot = getAnnotationSnapshot()
      saveAnnotationsForPlate(plateId, snapshot)
    }
    useAnnotationStore.getState().submitForReview()
    showToast('Submitted for faculty adviser review. You will be notified when feedback is available.', 'info')
  }, [isStudentEdit, isSubmitted, plateId, getAnnotationSnapshot, saveAnnotationsForPlate, showToast])

  // Faculty Review: Save remark
  const handlePostRemark = (e) => {
    e.preventDefault()
    if (!isFacultyReview || !remarkText.trim()) return

    addAdviserRemark(projectId, plateId, remarkText, user)
    setRemarkText('')
    setRemarkSavedNotice(true)
    setTimeout(() => setRemarkSavedNotice(false), 3500)
    showToast('Spatial remark recorded for this plate.', 'success')
  }

  // Faculty Archive: Single-plate CSV export
  const handleExportPlateData = () => {
    const visibleAnns = annotations.filter((a) => !a.softDeleted)
    const headers = ['Plate File Name', 'Colony ID', 'X (px)', 'Y (px)', 'Radius (px)', 'Model Confidence', 'Source', 'Human Corrected']
    const rows = visibleAnns.map((a) => [
      plate ? plate.fileName : 'unknown',
      a.id,
      Math.round(a.x),
      Math.round(a.y),
      Math.round(a.radius),
      a.confidence !== null ? `${Math.round(a.confidence * 100)}%` : 'N/A',
      a.source,
      a.corrected ? 'Yes' : 'No',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${(plate?.fileName || 'plate').replace(/\.[^/.]+$/, '')}_annotations.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Plate data exported: ${(plate?.fileName || 'plate')}.csv`)
  }

  // Missing plate or project safety state
  if (!project || !plate) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="mb-5">
          <nav className="flex items-center gap-1.5 text-xs text-surface-400 mb-3" aria-label="Breadcrumb">
            <Link to={returnPath} className="hover:text-primary-700 transition-colors">
              {returnLabel}
            </Link>
          </nav>
          <h1 className="text-xl font-bold text-surface-900">Plate Not Found</h1>
          <p className="text-sm text-surface-500 mt-1">The plate or project you are looking for does not exist.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(returnPath)}>
          {returnLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl shadow-lg border text-sm font-medium flex items-start gap-3 animate-slide-in
            ${toast.type === 'info'
              ? 'bg-primary-50 border-primary-200 text-primary-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          role="status"
          aria-live="polite"
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 text-current opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Navigation Bar: Breadcrumb + Back Action ── */}
      <div className="flex flex-col gap-2 pb-2 border-b border-surface-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Unified Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-surface-400" aria-label="Breadcrumb">
            {isFacultyReview ? (
              <Link to={ROUTES.FACULTY.REVIEW_QUEUE} className="hover:text-primary-700 transition-colors">
                Review Queue
              </Link>
            ) : isFacultyArchive ? (
              <Link to={ROUTES.FACULTY.ARCHIVE} className="hover:text-primary-700 transition-colors">
                Validated Archive
              </Link>
            ) : (
              <Link to={ROUTES.STUDENT.PROJECTS} className="hover:text-primary-700 transition-colors">
                My Projects
              </Link>
            )}

            <svg className="w-3 h-3 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>

            <Link
              to={returnPath}
              className="hover:text-primary-700 transition-colors truncate max-w-[220px]"
              title={project.name}
            >
              {project.name}
            </Link>

            <svg className="w-3 h-3 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>

            <span className="text-surface-700 font-semibold truncate max-w-[200px]">
              {plate.fileName}
            </span>
          </nav>

          {/* Contextual Back Button */}
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors cursor-pointer group bg-surface-50 hover:bg-surface-100 border border-surface-200 px-3 py-1.5 rounded-lg"
            aria-label={returnLabel}
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>{returnLabel}</span>
          </button>
        </div>

        {/* ── Plate Header & Unified Pagination Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-surface-200 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 tabular-nums">
                Plate {String(currentPlateIndex + 1).padStart(2, '0')} of {String(projectPlates.length).padStart(2, '0')}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-surface-900 tracking-tight">
                {plate.fileName}
              </h1>

              {/* Mode Badge */}
              {isStudentEdit && (
                <span className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  Interactive Annotation
                </span>
              )}
              {isStudentLocked && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Dataset Locked · Data Freeze Enforced
                </span>
              )}
              {isFacultyReview && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Faculty Review · Read-Only
                </span>
              )}
              {isFacultyArchive && (
                <span className="text-xs font-medium text-surface-600 bg-surface-100 px-2 py-0.5 rounded border border-surface-200">
                  Archived Record · Strictly Immutable
                </span>
              )}
            </div>

            {/* Metadata Subtitle */}
            <p className="text-xs text-surface-500">
              <span className="font-semibold text-surface-700">{plate.colonyCount} colonies detected</span>
              {' · '}
              <span>Model Confidence: {plate.confidence}</span>
              {' · '}
              <span>Avg Area: {plate.avgAreaMm2}</span>
              {isDirty && isStudentEdit && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {isSubmitted && isStudentEdit && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Submitted for Review
                </span>
              )}
            </p>
          </div>

          {/* Previous / Next Plate Pagination Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!prevPlate}
              onClick={() => navigateToPlate(prevPlate)}
              className="gap-1 text-xs cursor-pointer disabled:opacity-40"
              aria-label="Previous plate"
            >
              ← Previous
            </Button>

            <span className="text-xs font-medium text-surface-500 px-1 tabular-nums">
              {currentPlateIndex + 1} / {projectPlates.length}
            </span>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!nextPlate}
              onClick={() => navigateToPlate(nextPlate)}
              className="gap-1 text-xs cursor-pointer disabled:opacity-40"
              aria-label="Next plate"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Workspace Body: Canvas + Right-Side Inspection Sidebar ── */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">

        {/* ── Left Column: Toolbar + 1:1 Square Canvas Viewport + Bottom Action Bar ── */}
        <div className="flex-1 min-w-0 w-full space-y-3">

          {/* Shared Toolbar Component */}
          <AnnotationToolbar
            mode={mode}
            readOnly={isReadOnly}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            isSpacebarPanning={isSpacebarPanning}
            onAddRemarkPin={() => remarkInputRef.current?.focus()}
          />

          {/* Shared 1:1 Square Canvas Viewport Container */}
          <div className="w-full flex justify-center bg-surface-50/50 p-2 sm:p-4 rounded-2xl border border-surface-200">
            <AnnotationCanvas
              readOnly={isReadOnly}
              onSpacebarPanChange={setIsSpacebarPanning}
            />
          </div>

          {/* ── Shared Bottom Action Area (mode-adapted) ── */}
          <div className="p-3 bg-white rounded-xl border border-surface-200 shadow-2xs">
            {isStudentEdit && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-surface-500">
                  {isDirty ? (
                    <span className="text-amber-700 font-medium">You have unsaved annotation edits.</span>
                  ) : (
                    <span>All changes saved. Ready for submission.</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={!isDirty}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitted}
                    className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer"
                  >
                    {isSubmitted ? 'Submitted for Review' : 'Submit for Review'}
                  </Button>
                </div>
              </div>
            )}

            {isStudentLocked && (
              <div className="flex items-center gap-3 text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <div className="text-xs">
                  <p className="font-bold">Dataset Locked by Adviser (Data Freeze Enforced)</p>
                  <p className="text-amber-700 mt-0.5">
                    This project has been validated and frozen. Annotation modifications, additions, and deletions are permanently disabled.
                  </p>
                </div>
              </div>
            )}

            {isFacultyReview && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-surface-500">
                  Reviewing Plate <span className="font-bold text-surface-800">{currentPlateIndex + 1} of {projectPlates.length}</span>. Add spatial remarks below if adjustments are needed.
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(returnPath)}
                  className="text-xs font-semibold cursor-pointer"
                >
                  ← Back to Review Screen
                </Button>
              </div>
            )}

            {isFacultyArchive && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-surface-500">
                  Archived scientific record. Validation date: <span className="font-medium text-surface-700">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleExportPlateData}
                  className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export Plate Data (CSV)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Information Panels Hierarchy ── */}
        <div className="w-full xl:w-80 space-y-4 shrink-0">

          {/* 1. Colony Inspection / Provenance */}
          <SelectedColonyInspector
            mode={mode}
            readOnly={isReadOnly}
          />

          {/* 2. Detection Morphology Summary */}
          <DetectionSummary plate={plate} />

          {/* 3. Detection Filtering & Legend */}
          <AnnotationLegend />

          {/* Confidence threshold slider (interactive in student edit mode) */}
          {isStudentEdit && (
            <ConfidenceThreshold />
          )}

          {/* 4. Spatial Remarks Panel */}
          <Card
            title="Plate Spatial Remarks"
            subtitle="Adviser remarks specific to this Petri dish plate."
          >
            <div className="space-y-3">
              {/* Existing Remarks List */}
              {plateRemarks.length === 0 ? (
                <p className="text-xs text-surface-400 italic">
                  No spatial remarks recorded for this plate yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {plateRemarks.map((remark) => (
                    <div
                      key={remark.id}
                      className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800">
                        <span>{remark.adviserName || 'Faculty Adviser'}</span>
                        <span className="font-normal text-amber-700">
                          {new Date(remark.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="leading-relaxed">{remark.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Spatial Remark Form (Faculty Review Only) */}
              {isFacultyReview ? (
                <form onSubmit={handlePostRemark} className="space-y-2 pt-2 border-t border-surface-100">
                  <label htmlFor="spatial-remark-input" className="block text-xs font-semibold text-surface-700">
                    Add Remark for this Plate:
                  </label>
                  <textarea
                    id="spatial-remark-input"
                    ref={remarkInputRef}
                    rows={3}
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="e.g. Inspect perimeter colony cluster near 2 o'clock; check confidence threshold..."
                    className="w-full py-2 px-3 rounded-lg border border-surface-300 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />

                  {remarkSavedNotice && (
                    <div className="text-xs font-semibold text-emerald-600 animate-fade-in">
                      ✓ Spatial remark saved and visible to students!
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!remarkText.trim()}
                      className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Remark
                    </Button>
                  </div>
                </form>
              ) : (
                isFacultyArchive && (
                  <div className="pt-2 border-t border-surface-100 text-[11px] text-surface-400 italic">
                    Historical remarks are archived and locked.
                  </div>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
