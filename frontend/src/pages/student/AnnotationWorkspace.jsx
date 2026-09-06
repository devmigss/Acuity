/**
 * Acuity — Student Annotation Workspace Page
 *
 * Route: /student/projects/:projectId/annotate/:plateId
 *
 * The primary interface for reviewing AI-detected bacterial colonies,
 * performing human-in-the-loop annotation corrections, adjusting confidence
 * thresholds, and submitting verified results for faculty review.
 *
 * CONNECTED: Loads plate data from useProjectStore, annotations via the
 * annotation bridge. Save/submit actions persist changes back to the store.
 *
 * IMPORTANT ARCHITECTURAL NOTES:
 * - This is FRONTEND ONLY. No backend, S3, or AI integration yet.
 * - Mock data is used for demonstration purposes only.
 * - Scientific morphology measurements (area, diameter) are display-only values.
 *   The Python FastAPI / OpenCV / SOD-YOLOv8 service will be authoritative.
 * - Real-time collaboration is deferred. See wsClient.js for the abstraction.
 * - AI baseline annotations are logically immutable. User edits are soft deletes.
 * - Annotation state is managed by Zustand (annotationStore.js).
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useAnnotationStore } from '@/stores/annotationStore'
import { useProjectStore } from '@/stores/useProjectStore'

import AnnotationCanvas from '@/components/annotation/AnnotationCanvas'
import AnnotationToolbar from '@/components/annotation/AnnotationToolbar'
import DetectionSummary from '@/components/annotation/DetectionSummary'
import ConfidenceThreshold from '@/components/annotation/ConfidenceThreshold'
import AnnotationLegend from '@/components/annotation/AnnotationLegend'
import SelectedColonyInspector from '@/components/annotation/SelectedColonyInspector'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'

const TABS = [
  { id: 'image-upload', label: 'Image Upload' },
  { id: 'data-view', label: 'Data View' },
]

export default function AnnotationWorkspace() {
  const { projectId, plateId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const fromTab = searchParams.get('fromTab') || location.state?.fromTab || 'plates'
  const returnTabLabel = fromTab === 'data' ? 'Data' : 'Plates / Images'
  const returnPath = `/student/projects/${projectId}?tab=${fromTab}`

  const [activeTab, setActiveTab] = useState('image-upload')
  const [toast, setToast] = useState(null)

  // Get project and plate data from centralized store
  const projects = useProjectStore((s) => s.projects)
  const plates = useProjectStore((s) => s.plates)
  const getAnnotationsForPlate = useProjectStore((s) => s.getAnnotationsForPlate)
  const saveAnnotationsForPlate = useProjectStore((s) => s.saveAnnotationsForPlate)

  const project = useMemo(() => projects.find((p) => p.id === projectId) || null, [projects, projectId])
  const plate = useMemo(() => plates.find((p) => p.id === plateId) || null, [plates, plateId])

  const { zoom, setZoom, stageOffset, setStageOffset, resetView, isDirty, isSubmitted,
    loadAnnotationsForPlate: loadIntoCanvas, getAnnotationSnapshot } =
    useAnnotationStore()

  // Load plate-specific annotations when the component mounts or plateId changes
  useEffect(() => {
    if (plateId) {
      const annotations = getAnnotationsForPlate(plateId)
      loadIntoCanvas(annotations)
    }
  }, [plateId, getAnnotationsForPlate, loadIntoCanvas])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Spacebar pan state lifted so toolbar reflects it ──
  const [isSpacebarPanning, setIsSpacebarPanning] = useState(false)

  // ── Zoom callbacks (defined before keyboard shortcut effect) ──
  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(zoom * 1.25, 5.0))
  }, [zoom, setZoom])

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(zoom / 1.25, 0.25))
  }, [zoom, setZoom])

  const handleFitView = useCallback(() => {
    resetView()
  }, [resetView])

  // ── Keyboard shortcuts for tools ──
  const { setActiveTool, selectedAnnotationId, deleteAnnotation, clearSelection } = useAnnotationStore()
  useEffect(() => {
    const handler = (e) => {
      // Don't fire when typing in inputs
      if (e.target.matches('input, textarea, button, [contenteditable]')) return
      switch (e.key.toLowerCase()) {
        case 'v': setActiveTool('select'); break
        case 'h': setActiveTool('pan');    break
        case 'a': setActiveTool('add');    break
        case 'r': setActiveTool('resize'); break
        case 'escape':
          clearSelection()
          break
        case 'delete':
        case 'backspace':
          if (selectedAnnotationId) {
            deleteAnnotation(selectedAnnotationId)
          }
          break
        case '0':
          resetView()
          break
        case '=':
        case '+': handleZoomIn(); break
        case '-': handleZoomOut(); break
        default: break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTool, selectedAnnotationId, deleteAnnotation, clearSelection, resetView, handleZoomIn, handleZoomOut])

  const handleSaveDraft = useCallback(() => {
    // Persist annotations back to the project store
    if (plateId) {
      const snapshot = getAnnotationSnapshot()
      saveAnnotationsForPlate(plateId, snapshot)
    }
    useAnnotationStore.getState().saveDraft()
    showToast('Draft saved successfully. Your annotations are stored locally.')
  }, [plateId, getAnnotationSnapshot, saveAnnotationsForPlate, showToast])

  const handleSubmitForReview = useCallback(() => {
    if (isSubmitted) return
    // Persist annotations back to the project store
    if (plateId) {
      const snapshot = getAnnotationSnapshot()
      saveAnnotationsForPlate(plateId, snapshot)
    }
    useAnnotationStore.getState().submitForReview()
    showToast('Submitted for faculty adviser review. You will be notified when feedback is available.', 'info')
  }, [isSubmitted, plateId, getAnnotationSnapshot, saveAnnotationsForPlate, showToast])

  // Handle missing project or plate
  if (!project || !plate) {
    return (
      <div className="space-y-6">
        <div className="mb-5">
          <nav className="flex items-center gap-1.5 text-xs text-surface-400 mb-3" aria-label="Breadcrumb">
            <Link to={ROUTES.STUDENT.PROJECTS} className="hover:text-primary-700 transition-colors">My Projects</Link>
          </nav>
          <h1 className="text-xl font-bold text-surface-900">Plate Not Found</h1>
          <p className="text-sm text-surface-500 mt-1">The plate or project you're looking for does not exist.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(projectId ? returnPath : ROUTES.STUDENT.PROJECTS)}>
          ← Back to {projectId ? returnTabLabel : 'Projects'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-0">
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

      {/* ── Page Header ── */}
      <div className="mb-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-surface-400 mb-3" aria-label="Breadcrumb">
          <Link
            to={ROUTES.STUDENT.PROJECTS}
            className="hover:text-primary-700 transition-colors"
          >
            My Projects
          </Link>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <Link
            to={returnPath}
            className="hover:text-primary-700 transition-colors truncate max-w-[200px]"
            title={`Return to ${project.name} (${returnTabLabel})`}
          >
            {project.name}
          </Link>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-surface-500">Annotation Canvas</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="mb-1.5">
              <button
                type="button"
                onClick={() => navigate(returnPath)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors cursor-pointer group"
                aria-label={`Back to ${returnTabLabel}`}
              >
                <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Back to {returnTabLabel}</span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight leading-tight">
              {plate.fileName}
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              <span className="font-medium text-surface-700">{plate.colonyCount} colonies detected</span>
              {' · '}
              <span>uploaded {new Date(plate.uploadedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              {isDirty && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {isSubmitted && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Submitted for Review
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-surface-200 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-900'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'data-view' ? (
        <DataViewPlaceholder plate={plate} />
      ) : (
        <ImageUploadTabContent
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onSaveDraft={handleSaveDraft}
          onSubmitForReview={handleSubmitForReview}
          isSubmitted={isSubmitted}
          isDirty={isDirty}
          isSpacebarPanning={isSpacebarPanning}
          onSpacebarPanChange={setIsSpacebarPanning}
        />
      )}
    </div>
  )
}

/**
 * The primary Image Upload / Annotation view tab.
 */
function ImageUploadTabContent({ zoom, onZoomIn, onZoomOut, onFitView, onSaveDraft, onSubmitForReview, isSubmitted, isDirty, isSpacebarPanning, onSpacebarPanChange }) {
  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* ── Left/Main: Toolbar + Canvas + Action Buttons ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Annotation Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <AnnotationToolbar
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onFitView={onFitView}
            isSpacebarPanning={isSpacebarPanning}
          />

          {/* Keyboard hint */}
          <span className="hidden sm:block text-xs text-surface-400">
            Scroll to zoom · H or Space to pan
          </span>
        </div>

        {/* Annotation Canvas */}
        <AnnotationCanvas onSpacebarPanChange={onSpacebarPanChange} />

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onSaveDraft}
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2m3-4H9a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-3-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 3h4v4" />
            </svg>
            Save Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onSubmitForReview}
            disabled={isSubmitted}
            className="bg-[#0B1F3A] hover:bg-[#071527] text-white gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
            </svg>
            {isSubmitted ? 'Submitted for Review' : 'Submit for Review'}
          </Button>
        </div>
      </div>

      {/* ── Right Sidebar: Inspector + Summary + Threshold + Legend ── */}
      <div className="xl:w-72 2xl:w-80 space-y-4 shrink-0">
        <SelectedColonyInspector />
        <DetectionSummary />
        <ConfidenceThreshold />
        <AnnotationLegend />
      </div>
    </div>
  )
}

/**
 * Data View tab — shows plate-specific analysis data.
 */
function DataViewPlaceholder({ plate }) {
  return (
    <div className="flex items-center justify-center py-24 rounded-xl border border-dashed border-surface-300 bg-surface-50">
      <div className="text-center max-w-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125a1.125 1.125 0 0 0 1.125-1.125v-1.5a1.125 1.125 0 0 0-1.125-1.125m0 0H2.25M3.375 15.75a1.125 1.125 0 0 1 1.125-1.125h1.5a1.125 1.125 0 0 1 1.125 1.125M6 18.375V15.75M3.375 15.75h1.5M6 18.375h12.75m-12.75 0v-2.625m12.75 2.625a1.125 1.125 0 0 0 1.125-1.125v-1.5a1.125 1.125 0 0 0-1.125-1.125m0 0H18.75M18.75 18.375V15.75" />
          </svg>
        </div>
        <div className="text-base font-semibold text-surface-900">Data View</div>
        <p className="mt-1 text-sm text-surface-500">
          Colony analysis data for <strong>{plate?.fileName}</strong> — {plate?.colonyCount} colonies, {plate?.confidence} confidence.
        </p>
        <p className="mt-3 text-xs text-surface-400">
          Measurements provided by the Python FastAPI / OpenCV microservice.
        </p>
      </div>
    </div>
  )
}
