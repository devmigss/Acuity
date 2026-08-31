/**
 * Acuity — Detection Summary Panel
 *
 * Displays mock colony detection statistics.
 *
 * IMPORTANT: These are DISPLAY-ONLY mock values.
 * The authoritative source for all morphological measurements is the
 * Python FastAPI / OpenCV / SOD-YOLOv8 AI microservice.
 * The frontend only renders backend-provided values — no calculations here.
 */

import { useAnnotationStore } from '@/stores/annotationStore'

function StatRow({ label, value, unit }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-100 last:border-none">
      <span className="text-sm text-surface-600">{label}</span>
      <span className="text-sm font-bold text-surface-900 tabular-nums">
        {value}
        {unit && <span className="ml-1 font-normal text-surface-500 text-xs">{unit}</span>}
      </span>
    </div>
  )
}

export default function DetectionSummary() {
  const { detectionSummary } = useAnnotationStore()

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent-600">
          Detection Summary
        </h3>
      </div>
      <div className="px-4 py-1">
        <StatRow
          label="Total Colonies"
          value={detectionSummary.totalColonies}
        />
        <StatRow
          label="Avg. Area"
          value={detectionSummary.avgAreaMm2}
          unit="mm²"
        />
        <StatRow
          label="Avg. Diameter"
          value={detectionSummary.avgDiameterMm}
          unit="mm"
        />
        <StatRow
          label="Manual Corrections"
          value={detectionSummary.manualCorrections}
        />
      </div>
    </div>
  )
}
