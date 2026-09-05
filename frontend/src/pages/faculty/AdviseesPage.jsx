/**
 * Acuity — Faculty Advisees Page
 *
 * Displays student thesis research groups assigned to this faculty member.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import { useToastStore } from '@/store/useToastStore'

const ADVISEES = [
  {
    id: 'adv-01',
    groupName: 'Group 8 — Microbiology Cohort',
    lead: 'Alex Rivera',
    members: 'A. Rivera, C. Tan, M. Reyes',
    project: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    activeTrials: 4,
    status: 'Active',
  },
  {
    id: 'adv-02',
    groupName: 'Group 3 — Environmental Bio',
    lead: 'Sarah Gomez',
    members: 'S. Gomez, R. Aquino, L. Mendoza',
    project: 'Enumeration of Coliforms in Watershed Samples',
    activeTrials: 2,
    status: 'Active',
  },
]

export default function AdviseesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Advisees"
        subtitle="Manage assigned biology thesis groups, review trial progression, and track submission history."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ADVISEES.map((adv) => (
          <Card key={adv.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                {adv.status}
              </span>
              <span className="text-xs text-surface-400">{adv.activeTrials} Active Trials</span>
            </div>

            <h3 className="text-base font-bold text-surface-900 mb-1">{adv.groupName}</h3>
            <p className="text-xs text-surface-500 mb-3">Group Lead: <span className="font-semibold text-surface-700">{adv.lead}</span></p>

            <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-xs space-y-1 mb-4">
              <div className="text-surface-500">Research Topic:</div>
              <div className="font-medium text-surface-800">{adv.project}</div>
              <div className="text-surface-400 text-[11px] mt-1">Members: {adv.members}</div>
            </div>

            <div className="pt-2 border-t border-surface-100 flex justify-end">
              <button
                type="button"
                onClick={() => useToastStore.getState().addToast(`Viewing project overview for ${adv.groupName}`)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
              >
                View Advisee Submissions →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
