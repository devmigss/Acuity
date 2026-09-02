/**
 * Acuity — Confidence Threshold Control
 *
 * Allows the student to simulate filtering AI-detected annotations by confidence.
 *
 * NOTE: This is a FRONTEND UI SIMULATION ONLY.
 * It does NOT invoke any AI inference or backend API.
 * Changing the slider visually filters which mock AI annotations appear.
 * Real confidence threshold configuration will be handled via the backend.
 */

import { useAnnotationStore } from '@/stores/annotationStore'

export default function ConfidenceThreshold() {
  const { confidenceThreshold, setConfidenceThreshold } = useAnnotationStore()

  const handleChange = (e) => {
    setConfidenceThreshold(parseFloat(e.target.value))
  }

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent-600">
          Detection Sensitivity
        </h3>
      </div>
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-600">Confidence Threshold</span>
          <span className="text-sm font-bold text-surface-900 tabular-nums w-10 text-right">
            {confidenceThreshold.toFixed(2)}
          </span>
        </div>

        {/* Range Slider */}
        <div className="relative">
          <input
            type="range"
            min="0.50"
            max="0.99"
            step="0.01"
            value={confidenceThreshold}
            onChange={handleChange}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4A017 0%, #D4A017 ${((confidenceThreshold - 0.5) / 0.49) * 100}%, #E2E8F0 ${((confidenceThreshold - 0.5) / 0.49) * 100}%, #E2E8F0 100%)`,
              accentColor: '#D4A017',
            }}
            aria-label="Detection confidence threshold"
          />
        </div>

        <p className="text-xs text-surface-400 leading-relaxed">
          Filters which AI detections are displayed by minimum confidence score. UI simulation only — not connected to the AI microservice.
        </p>
      </div>
    </div>
  )
}
