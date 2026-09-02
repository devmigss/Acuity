/**
 * Acuity — Student Adviser Remarks Page
 *
 * Displays review feedback, spatial annotations, and revision requests from faculty advisers.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

const MOCK_REMARKS = [
  {
    id: 'remark-01',
    projectTitle: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    adviser: 'Dr. Maria Santos',
    date: 'Aug 30, 2026',
    status: 'Pending Student Action',
    message:
      'Please re-verify the clustered colony bounding boxes on Plate A2 near the perimeter. Several overlapping colonies should be separated manually.',
    plateRef: 'Plate_A2_24h_100x.png',
  },
]

export default function AdviserRemarksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Adviser Remarks"
        subtitle="Review feedback, spatial annotations, and revision notes submitted by your faculty adviser."
      />

      <div className="space-y-4">
        {MOCK_REMARKS.map((remark) => (
          <Card key={remark.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-100">
              <div>
                <h3 className="text-base font-bold text-surface-900">{remark.projectTitle}</h3>
                <span className="text-xs text-surface-500">From: <span className="font-semibold text-primary-900">{remark.adviser}</span> · {remark.date}</span>
              </div>
              <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {remark.status}
              </span>
            </div>

            <div className="py-4">
              <p className="text-sm text-surface-700 leading-relaxed bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                &ldquo;{remark.message}&rdquo;
              </p>
              <div className="mt-2 text-xs text-surface-500">
                Referenced Plate: <span className="font-mono text-primary-700">{remark.plateRef}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end">
              <button
                type="button"
                onClick={() => alert(`Navigating to canvas review for ${remark.plateRef}`)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
              >
                Open Plate in Annotation Canvas →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
