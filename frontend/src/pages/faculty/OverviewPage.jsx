/**
 * Acuity — Faculty Review Overview Page
 *
 * Overview dashboard for faculty advisers and laboratory validation personnel.
 * Provides workload metrics and quick access to pending student project reviews.
 */

import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function FacultyOverviewPage() {
  const getPendingReviewProjects = useProjectStore((s) => s.getPendingReviewProjects)
  const getValidatedProjects = useProjectStore((s) => s.getValidatedProjects)
  const getPlatesForProject = useProjectStore((s) => s.getPlatesForProject)

  const pendingProjects = getPendingReviewProjects()
  const validatedProjects = getValidatedProjects()

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Faculty Review Overview"
        subtitle="Review assigned student projects, validate macroscopic CFU detections, and provide feedback."
      />

      {/* ── 4 Specified Faculty Workload Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Pending Review */}
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Pending Review
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {pendingProjects.length}{' '}
            <span className="text-sm font-semibold text-amber-600">Submissions</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Requires adviser review &amp; validation</p>
        </div>

        {/* Metric 2: Validated (this Month) */}
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Validated (this Month)
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {validatedProjects.length}{' '}
            <span className="text-sm font-semibold text-emerald-700">Frozen</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Approved for statistical analysis</p>
        </div>

        {/* Metric 3: Avg. Turnaround */}
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Avg. Turnaround
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            1.4 <span className="text-sm font-semibold text-primary-600">Days</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Submission to validation turnaround</p>
        </div>

        {/* Metric 4: Advised Groups */}
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Advised Groups
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            2 <span className="text-sm font-semibold text-surface-600">Cohorts</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Biology thesis research cohorts</p>
        </div>
      </div>

      {/* ── Submissions Awaiting Review ── */}
      <Card
        title="Submissions Awaiting Your Review"
        subtitle="Inspect raw plate photos, verify bounding boxes, and approve or request revisions."
      >
        {pendingProjects.length === 0 ? (
          <div className="py-8 text-center text-sm text-surface-500">
            No submissions currently awaiting review. All advisee cohorts are up to date.
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {pendingProjects.map((project) => {
              const projectPlates = getPlatesForProject(project.id)
              const totalCFUs = projectPlates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)

              return (
                <div
                  key={project.id}
                  className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {project.status}
                      </span>
                      <span className="text-xs text-surface-400">
                        {project.organism || 'Microbiology Assay'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-surface-900 leading-snug">
                      {project.name}
                    </h4>
                    <p className="text-xs text-surface-500">
                      Advisee Lead:{' '}
                      <span className="font-semibold text-surface-700">{project.ownerName}</span> ·{' '}
                      <span className="font-medium text-surface-600">
                        {projectPlates.length} Petri dish plate(s)
                      </span>{' '}
                      · Total CFUs: <span className="font-semibold text-surface-800">{totalCFUs}</span>
                    </p>
                  </div>

                  <div className="shrink-0">
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
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
