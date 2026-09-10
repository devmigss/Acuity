/**
 * Acuity — Faculty Advisees Page
 *
 * Displays student thesis research groups assigned to this faculty member.
 * Connected to centralized useProjectStore.
 */

import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdviseesPage() {
  const adviseeGroups = useProjectStore((s) => s.adviseeGroups)
  const getProjectsForGroup = useProjectStore((s) => s.getProjectsForGroup)

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="My Advisees"
        subtitle="Manage assigned biology thesis groups, view research cohorts, and inspect group project submissions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {adviseeGroups.map((group) => {
          const groupProjects = getProjectsForGroup(group.id)
          const pendingCount = groupProjects.filter(
            (p) => p.status === 'Adviser Review' || p.status === 'Pending Review'
          ).length
          const membersSummary = group.members.map((m) => m.name).join(', ')

          return (
            <Card key={group.id}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {group.status}
                  </span>
                  <span className="text-xs text-surface-400">{group.academicYear}</span>
                </div>
                <span className="text-xs font-medium text-surface-500">
                  {groupProjects.length} {groupProjects.length === 1 ? 'Project' : 'Projects'}
                  {pendingCount > 0 && (
                    <span className="ml-1.5 font-bold text-amber-600">
                      ({pendingCount} pending)
                    </span>
                  )}
                </span>
              </div>

              <Link
                to={`/faculty/advisees/${group.id}`}
                className="group inline-block"
              >
                <h3 className="text-base sm:text-lg font-bold text-surface-900 group-hover:text-primary-700 transition-colors mb-1">
                  {group.groupName}
                </h3>
              </Link>
              <p className="text-xs text-surface-500 mb-3">
                Group Lead: <span className="font-semibold text-surface-700">{group.leadName}</span>
                <span className="text-surface-400 mx-2">·</span>
                <span className="text-surface-400">{group.institution}</span>
              </p>

              <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-200 text-xs space-y-1.5 mb-4">
                <div>
                  <span className="text-surface-500 block text-[11px] uppercase tracking-wider font-semibold">Research Topic:</span>
                  <div className="font-medium text-surface-800 mt-0.5 leading-snug">{group.topic}</div>
                </div>
                <div className="pt-1 text-surface-400 text-[11px] border-t border-surface-100">
                  <strong className="text-surface-600 font-medium">Members ({group.members.length}):</strong> {membersSummary}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
                <span className="text-xs text-surface-400">
                  {group.laboratory}
                </span>
                <Link to={`/faculty/advisees/${group.id}`}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="font-semibold text-primary-700 hover:text-primary-900 border-primary-200 hover:bg-primary-50 gap-1.5 cursor-pointer"
                  >
                    View Group Details →
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
