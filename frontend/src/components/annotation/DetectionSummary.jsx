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

export default function DetectionSummary({ plate }) {
  const { detectionSummary, annotations } = useAnnotationStore()

  const visibleAnnotations = annotations ? annotations.filter((a) => !a.softDeleted) : []
  const totalColonies = visibleAnnotations.length > 0 ? visibleAnnotations.length : (plate?.colonyCount ?? detectionSummary.totalColonies)
  const manualCount = visibleAnnotations.filter((a) => a.source === 'manual' || a.corrected).length

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
          value={totalColonies}
        />
        <StatRow
          label="Avg. Area"
          value={plate?.avgAreaMm2 ? String(plate.avgAreaMm2).replace(' mm²', '') : detectionSummary.avgAreaMm2}
          unit="mm²"
        />
        <StatRow
          label="Avg. Diameter"
          value={plate?.avgDiameterMm ? String(plate.avgDiameterMm).replace(' mm', '') : detectionSummary.avgDiameterMm}
          unit="mm"
        />
        <StatRow
          label="Manual Corrections"
          value={manualCount}
        />
      </div>
    </div>
  )
}
