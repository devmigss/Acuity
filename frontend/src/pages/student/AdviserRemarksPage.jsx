/**
 * Acuity — Student Adviser Remarks Page
 *
 * Displays review feedback, spatial annotations, and revision requests from faculty advisers.
 * Reads from the centralized useProjectStore. Clicking a remark navigates to the
 * referenced project or plate/annotation canvas.
 *
 * Students can mark remarks as "Addressed" to signal they have acted on the feedback.
 */

import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProjectStore, REMARK_STATUS } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useToastStore } from '@/store/useToastStore'

/* ── Helper: format date ── */
function formatDate(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdviserRemarksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const projects = useProjectStore((s) => s.projects)
  const adviserRemarks = useProjectStore((s) => s.adviserRemarks)
  const updateRemarkStatus = useProjectStore((s) => s.updateRemarkStatus)

  const userId = user?.id

  const remarks = useMemo(() => {
    const ownedProjectIds = projects.filter((p) => p.ownerId === userId).map((p) => p.id)
    return adviserRemarks.filter((r) => ownedProjectIds.includes(r.projectId))
  }, [projects, adviserRemarks, userId])

  const handleMarkAddressed = useCallback((remarkId) => {
    updateRemarkStatus(remarkId, REMARK_STATUS.ADDRESSED)
    useToastStore.getState().addToast('Remark marked as addressed.', 'success')
  }, [updateRemarkStatus])

  const handleNavigate = useCallback((remark) => {
    if (remark.plateId) {
      navigate(`/student/projects/${remark.projectId}/annotate/${remark.plateId}`)
    } else {
      navigate(`/student/projects/${remark.projectId}`)
    }
  }, [navigate])

  // Group by status
  const openRemarks = useMemo(() => remarks.filter((r) => r.status === REMARK_STATUS.OPEN), [remarks])
  const addressedRemarks = useMemo(() => remarks.filter((r) => r.status === REMARK_STATUS.ADDRESSED), [remarks])
  const resolvedRemarks = useMemo(() => remarks.filter((r) => r.status === REMARK_STATUS.RESOLVED), [remarks])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adviser Remarks"
        subtitle="Review feedback, spatial annotations, and revision notes submitted by your faculty adviser."
      />

      {/* Summary counts */}
      {remarks.length > 0 && (
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {openRemarks.length} Open
          </span>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {addressedRemarks.length} Addressed
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {resolvedRemarks.length} Resolved
          </span>
        </div>
      )}

      {/* Remark List */}
      {remarks.length > 0 ? (
        <div className="space-y-4">
          {remarks.map((remark) => (
            <Card key={remark.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-100">
                <div>
                  <h3 className="text-base font-bold text-surface-900">{remark.projectName}</h3>
                  <span className="text-xs text-surface-500">
                    From: <span className="font-semibold text-primary-900">{remark.adviserName}</span> · {formatDate(remark.date)}
                  </span>
                </div>
                <span className={`self-start sm:self-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  remark.status === REMARK_STATUS.OPEN
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : remark.status === REMARK_STATUS.ADDRESSED
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {remark.status}
                </span>
              </div>

              <div className="py-4">
                <p className="text-sm text-surface-700 leading-relaxed bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                  &ldquo;{remark.comment}&rdquo;
                </p>
                {remark.plateName && (
                  <div className="mt-2 text-xs text-surface-500">
                    Referenced Plate: <span className="font-mono text-primary-700">{remark.plateName}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {remark.status === REMARK_STATUS.OPEN && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAddressed(remark.id)}>
                      Mark as Addressed
                    </Button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate(remark)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                >
                  {remark.plateId ? 'Open Plate in Annotation Canvas →' : 'Open Project Workspace →'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-24 rounded-xl border border-dashed border-surface-300 bg-surface-50">
          <div className="text-center max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.09 1.976 1.053 1.976 2.188V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            </div>
            <div className="text-base font-semibold text-surface-900">No Adviser Remarks</div>
            <p className="mt-1 text-sm text-surface-500">
              When your faculty adviser provides feedback on your research, remarks will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
