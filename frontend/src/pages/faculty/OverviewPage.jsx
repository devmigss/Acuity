/**
 * Acuity — Faculty Review Overview Page
 *
 * Overview dashboard for faculty advisers and laboratory validation personnel.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import { useToastStore } from '@/store/useToastStore'

export default function FacultyOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Review Overview"
        subtitle="Review assigned student projects, validate macroscopic CFU detections, and provide feedback."
      />

      {/* Faculty Workload Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Pending Review
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            4 <span className="text-sm font-semibold text-amber-600">Submissions</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Requires adviser review & validation</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Active Advisees
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            6 <span className="text-sm font-semibold text-primary-600">Groups</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Biology thesis research cohorts</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Validated Trials
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            18 <span className="text-sm font-semibold text-emerald-700">Frozen</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Approved for statistical analysis</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Avg. AI Verification
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            93.2%
          </div>
          <p className="mt-2 text-xs text-surface-500">Human-in-the-loop accuracy F1</p>
        </div>
      </div>

      {/* Pending Review Queue Summary */}
      <Card title="Submissions Awaiting Your Review" subtitle="Inspect raw plate photos, verify bounding boxes, and approve or request revisions.">
        <div className="divide-y divide-surface-100">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-surface-900">
                Antimicrobial Efficacy of Psidium guajava Extracts — Trial 4
              </h4>
              <p className="text-xs text-surface-500 mt-0.5">
                Submitted by <span className="font-semibold text-surface-700">Group 8</span> · 3 Petri dish plates · Aug 30, 2026
              </p>
            </div>
            <button
              type="button"
              onClick={() => useToastStore.getState().addToast('Opening Faculty Review Canvas')}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer"
            >
              Start Review →
            </button>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-surface-900">
                Enumeration of Coliforms in Watershed Samples — Batch 2
              </h4>
              <p className="text-xs text-surface-500 mt-0.5">
                Submitted by <span className="font-semibold text-surface-700">Group 3</span> · 8 Petri dish plates · Aug 28, 2026
              </p>
            </div>
            <button
              type="button"
              onClick={() => useToastStore.getState().addToast('Opening Faculty Review Canvas')}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer"
            >
              Start Review →
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
