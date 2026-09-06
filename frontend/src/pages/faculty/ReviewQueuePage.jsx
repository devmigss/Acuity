/**
 * Acuity — Faculty Review Queue Page
 *
 * Displays pending research batch submissions requiring faculty verification.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import { useToastStore } from '@/store/useToastStore'

const QUEUE_ITEMS = [
  {
    id: 'queue-01',
    project: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    trial: 'Trial 4 (Plates A1–A3)',
    group: 'Group 8 (Alex Rivera, et al.)',
    date: 'Aug 30, 2026',
    cfuCount: 148,
    status: 'Ready for Review',
  },
  {
    id: 'queue-02',
    project: 'Enumeration of Coliforms in Watershed Samples',
    trial: 'Batch 2 (Plates B1–B8)',
    group: 'Group 3 (John Doe, et al.)',
    date: 'Aug 28, 2026',
    cfuCount: 420,
    status: 'Ready for Review',
  },
]

export default function ReviewQueuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Queue"
        subtitle="Pending student laboratory submissions requiring visual inspection, annotation check, and approval."
      />

      <div className="space-y-4">
        {QUEUE_ITEMS.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {item.status}
                  </span>
                  <span className="text-xs text-surface-400">Submitted {item.date}</span>
                </div>
                <h3 className="text-base font-bold text-surface-900">{item.project}</h3>
                <p className="text-xs text-surface-500 mt-1">
                  Trial: <span className="font-semibold text-surface-700">{item.trial}</span> · Advisees: <span className="font-semibold text-surface-700">{item.group}</span> · {item.cfuCount} Total Detected CFUs
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => useToastStore.getState().addToast(`Opening inspection workspace for ${item.trial}`)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  Review Annotations
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
