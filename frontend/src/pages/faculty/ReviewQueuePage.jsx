/**
 * Acuity — Faculty Review Queue Page
 *
 * Displays pending research batch submissions requiring faculty verification.
 * Connected to centralized useProjectStore.
 */

import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ReviewQueuePage() {
  const getPendingReviewProjects = useProjectStore((s) => s.getPendingReviewProjects)
  const getPlatesForProject = useProjectStore((s) => s.getPlatesForProject)

  const pendingProjects = getPendingReviewProjects()

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Review Queue"
        subtitle="Pending student laboratory submissions requiring visual inspection, annotation verification, and faculty decision."
      />

      {pendingProjects.length === 0 ? (
        <Card>
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-surface-900">Review Queue Empty</h3>
            <p className="text-xs text-surface-500 max-w-md mx-auto">
              There are no pending submissions awaiting review. Newly submitted student project batches will appear here automatically.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingProjects.map((project) => {
            const projectPlates = getPlatesForProject(project.id)
            const totalCFUs = projectPlates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)

            return (
              <Card key={project.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {project.status}
                      </span>
                      <span className="text-xs text-surface-400">
                        Organism: <strong className="text-surface-700 font-medium">{project.organism || 'Microbiology'}</strong>
                      </span>
                      <span className="text-xs text-surface-400">·</span>
                      <span className="text-xs text-surface-400">
                        Updated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-surface-900 tracking-tight leading-snug">
                      {project.name}
                    </h3>

                    <p className="text-xs text-surface-500 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-surface-500 pt-1">
                      <span>
                        Advisee Lead: <strong className="text-surface-800 font-semibold">{project.ownerName}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Plates: <strong className="text-surface-800 font-semibold">{projectPlates.length}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Detected CFUs: <strong className="text-surface-800 font-semibold">{totalCFUs}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                    <Link to={`/faculty/review/${project.id}`}>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="bg-[#0B1F3A] hover:bg-[#071527] text-white px-4 font-semibold shadow-xs cursor-pointer"
                      >
                        Inspect Submission →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
