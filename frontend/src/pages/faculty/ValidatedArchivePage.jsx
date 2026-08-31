/**
 * Acuity — Faculty Validated Archive Page
 *
 * Displays approved and frozen thesis trial datasets.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

const VALIDATED_ITEMS = [
  {
    id: 'val-01',
    project: 'Bacterial Inhibition Zone & CFU Viability Assay',
    group: 'Group 1 — Applied Biotechnology',
    approvalDate: 'Aug 15, 2026',
    plateCount: 15,
    totalCFU: 890,
    frozenStatus: 'Data Frozen · Ready for SPSS/R',
  },
]

export default function ValidatedArchivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Validated Archive"
        subtitle="Repository of faculty-approved research trials, finalized CFU enumerations, and frozen statistical datasets."
      />

      <div className="space-y-4">
        {VALIDATED_ITEMS.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.frozenStatus}
                  </span>
                  <span className="text-xs text-surface-400">Approved {item.approvalDate}</span>
                </div>
                <h3 className="text-base font-bold text-surface-900">{item.project}</h3>
                <p className="text-xs text-surface-500 mt-1">
                  Advisee: <span className="font-semibold text-surface-700">{item.group}</span> · {item.plateCount} Plates · {item.totalCFU} Total Verified CFUs
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert(`Exporting finalized dataset for ${item.project}`)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-100 text-surface-800 hover:bg-surface-200 transition-colors cursor-pointer shrink-0"
              >
                Export CSV / Summary
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
