/**
 * Acuity — Student Shared Projects Page
 *
 * Displays collaborative research projects shared by peer student groups.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

const MOCK_SHARED = [
  {
    id: 'shared-01',
    title: 'Comparative Bacterial Density in Commercial Probiotics',
    owner: 'Group 4 — BioTech Thesis',
    role: 'Viewer & Co-Annotator',
    platesCount: 6,
    sharedDate: 'Aug 26, 2026',
  },
]

export default function SharedProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared with Me"
        subtitle="Collaborate on research trials and datasets shared across student laboratory cohorts."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOCK_SHARED.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-700">
                {item.role}
              </span>
              <span className="text-xs text-surface-400">Shared {item.sharedDate}</span>
            </div>

            <h3 className="text-base font-bold text-surface-900 mb-2">
              {item.title}
            </h3>
            <p className="text-xs text-surface-500 mb-4">
              Owner Group: <span className="font-semibold text-surface-700">{item.owner}</span> · {item.platesCount} Plates
            </p>

            <div className="pt-3 border-t border-surface-100 flex justify-end">
              <button
                type="button"
                onClick={() => alert(`Opening shared project: ${item.title}`)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
              >
                View Shared Dataset →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
