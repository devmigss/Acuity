/**
 * Acuity — Annotation Store (Zustand)
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 3 — human-in-the-loop correction.
 *
 * Manages annotation state for the Student Annotation Workspace.
 * Structured for future connection to the Python FastAPI AI microservice.
 *
 * IMPORTANT: Scientific measurements (area, diameter, density) are
 * DISPLAY-ONLY values. The Python FastAPI / OpenCV microservice is the
 * authoritative source for all morphology calculations.
 *
 * Real-time collaboration is deferred. See wsClient.js for future integration.
 */

import { create } from 'zustand'

/**
 * Tools available in the annotation toolbar.
 */
export const TOOLS = {
  SELECT: 'select',
  PAN:    'pan',
  ADD:    'add',
  RESIZE: 'resize',
  DELETE: 'delete',
}

/**
 * Annotation source types.
 */
export const ANNOTATION_SOURCE = {
  AI: 'ai',
  MANUAL: 'manual',
}

/**
 * Mock AI-detected colony annotations for the demonstration phase.
 * NOTE: These are static demo data only. The backend AI service will
 * provide real detections, coordinates, and confidence values later.
 */
const MOCK_AI_ANNOTATIONS = [
  { id: 'ai-01', x: 180, y: 90,  radius: 32, confidence: 0.94, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-02', x: 320, y: 155, radius: 28, confidence: 0.91, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-03', x: 430, y: 95,  radius: 30, confidence: 0.88, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-04', x: 490, y: 290, radius: 26, confidence: 0.96, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-05', x: 560, y: 190, radius: 29, confidence: 0.90, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-06', x: 570, y: 355, radius: 27, confidence: 0.85, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-07', x: 250, y: 330, radius: 31, confidence: 0.89, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-08', x: 380, y: 390, radius: 28, confidence: 0.93, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-09', x: 145, y: 250, radius: 25, confidence: 0.87, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  { id: 'ai-10', x: 430, y: 270, radius: 30, confidence: 0.92, source: ANNOTATION_SOURCE.AI,     softDeleted: false },
  // A manually added demo annotation:
  { id: 'manual-01', x: 265, y: 195, radius: 30, confidence: null, source: ANNOTATION_SOURCE.MANUAL, softDeleted: false },
]

/**
 * Mock summary statistics — display values only.
 * Will be replaced by backend-provided morphology data.
 */
const MOCK_DETECTION_SUMMARY = {
  totalColonies: 37,
  avgAreaMm2: '2.4',
  avgDiameterMm: '1.8',
  manualCorrections: 3,
}

let _nextId = 100

export const useAnnotationStore = create((set, get) => ({
  // ── State ──
  annotations: MOCK_AI_ANNOTATIONS,
  selectedAnnotationId: null,
  activeTool: TOOLS.SELECT,
  confidenceThreshold: 0.82,
  zoom: 1.0,
  stageOffset: { x: 0, y: 0 },
  isDirty: false,
  isSubmitted: false,

  // Mock display-only summary statistics (authoritative source: Python FastAPI)
  detectionSummary: MOCK_DETECTION_SUMMARY,

  // ── Tool Selection ──
  setActiveTool: (tool) => set({ activeTool: tool, selectedAnnotationId: null }),

  // ── Selection ──
  selectAnnotation: (id) => set({ selectedAnnotationId: id }),
  clearSelection: () => set({ selectedAnnotationId: null }),

  // ── Add Manual Annotation ──
  addAnnotation: (x, y) => {
    const id = `manual-${_nextId++}`
    const newAnnotation = {
      id,
      x,
      y,
      radius: 28,
      confidence: null,
      source: ANNOTATION_SOURCE.MANUAL,
      softDeleted: false,
    }
    set((state) => ({
      annotations: [...state.annotations, newAnnotation],
      selectedAnnotationId: id,
      isDirty: true,
      detectionSummary: {
        ...state.detectionSummary,
        manualCorrections: state.detectionSummary.manualCorrections + 1,
      },
    }))
  },

  // ── Resize / Move Annotation ──
  updateAnnotation: (id, updates) => {
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      isDirty: true,
    }))
  },

  // ── Soft Delete (per architectural decision: AI baseline is immutable) ──
  deleteAnnotation: (id) => {
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? { ...a, softDeleted: true } : a
      ),
      selectedAnnotationId: null,
      isDirty: true,
    }))
  },

  // ── Confidence Threshold ──
  setConfidenceThreshold: (value) => set({ confidenceThreshold: value }),

  // ── Zoom ──
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 4.0) }),
  setStageOffset: (offset) => set({ stageOffset: offset }),

  // ── Fit to View: reset zoom and center the stage ──
  resetView: () => set({ zoom: 1.0, stageOffset: { x: 0, y: 0 } }),

  // ── Draft Save (frontend-only stub) ──
  saveDraft: () => set({ isDirty: false }),

  // ── Submit for Review (frontend-only stub) ──
  submitForReview: () => set({ isSubmitted: true, isDirty: false }),

  // ── Computed: Visible Annotations (above threshold, not soft-deleted) ──
  getVisibleAnnotations: () => {
    const { annotations, confidenceThreshold } = get()
    return annotations.filter((a) => {
      if (a.softDeleted) return false
      // Manual annotations always show regardless of threshold
      if (a.source === ANNOTATION_SOURCE.MANUAL) return true
      return a.confidence >= confidenceThreshold
    })
  },
}))
