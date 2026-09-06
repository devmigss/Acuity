/**
 * Acuity — Selected Colony Inspector
 *
 * Appears in the workspace sidebar when an annotation is selected.
 * Displays live geometric properties, AI confidence, correction provenance,
 * and quick actions (Revert AI baseline, Delete, Deselect).
 */

import { useAnnotationStore, ANNOTATION_SOURCE } from '@/stores/annotationStore'
import Button from '@/components/ui/Button'

export default function SelectedColonyInspector() {
  const {
    getSelectedAnnotation,
    clearSelection,
    deleteAnnotation,
    revertAnnotation,
  } = useAnnotationStore()

  const selected = getSelectedAnnotation()

  if (!selected) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-3.5 shadow-sm text-center">
        <div className="text-xs font-semibold text-surface-500 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span>No Colony Selected</span>
        </div>
        <p className="mt-1 text-[11px] text-surface-400">
          Click any colony on the dish to move, resize, or inspect AI provenance.
        </p>
      </div>
    )
  }

  const isManual = selected.source === ANNOTATION_SOURCE.MANUAL
  const isCorrected = !isManual && Boolean(selected.corrected)
  const isUntouched = !isManual && !selected.corrected

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-surface-100 flex items-center justify-between bg-surface-50/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-800">
            Colony {selected.id}
          </span>
          {isUntouched && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              AI Baseline
            </span>
          )}
          {isCorrected && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Corrected
            </span>
          )}
          {isManual && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200">
              Manual
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="text-surface-400 hover:text-surface-700 text-xs p-1 cursor-pointer transition-colors"
          title="Deselect (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Body Stats */}
      <div className="p-3.5 space-y-2.5 text-xs">
        {/* Confidence (for AI detections) */}
        {selected.confidence !== null && (
          <div className="flex items-center justify-between pb-2 border-b border-surface-100">
            <span className="text-surface-500 font-medium">Model Confidence</span>
            <span className="font-mono font-bold text-surface-900 bg-surface-100 px-2 py-0.5 rounded">
              {(selected.confidence * 100).toFixed(1)}%
              <span className="ml-1 text-[10px] text-surface-500 font-normal">({selected.confidence.toFixed(2)})</span>
            </span>
          </div>
        )}

        {/* Current Geometry */}
        <div className="grid grid-cols-2 gap-2 text-surface-600 bg-surface-50 p-2 rounded-lg border border-surface-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-400 block">Position (X, Y)</span>
            <span className="font-mono font-semibold text-surface-900">
              {Math.round(selected.x)}, {Math.round(selected.y)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-surface-400 block">Radius / Diam.</span>
            <span className="font-mono font-semibold text-surface-900">
              {Math.round(selected.radius)}px ({Math.round(selected.radius * 2)}px)
            </span>
          </div>
        </div>

        {/* Provenance Box (if human corrected) */}
        {isCorrected && selected.original && (
          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1 text-amber-800">
              <span>Original AI Baseline:</span>
            </div>
            <div className="font-mono text-[10px] text-amber-700">
              Pos: ({Math.round(selected.original.x)}, {Math.round(selected.original.y)}) · Radius: {Math.round(selected.original.radius)}px
            </div>
            <button
              type="button"
              onClick={() => revertAnnotation(selected.id)}
              className="mt-1 w-full py-1 px-2 rounded text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer transition-colors"
            >
              ↺ Revert to AI Baseline
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-1 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => deleteAnnotation(selected.id)}
            className="w-full text-danger-600 hover:bg-danger-50 hover:text-danger-700 text-xs py-1.5"
          >
            Delete Colony (Del)
          </Button>
        </div>
      </div>
    </div>
  )
}
