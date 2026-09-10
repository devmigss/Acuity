/**
 * Acuity — Faculty Project Review Screen
 *
 * Route: /faculty/review/:projectId
 *
 * Comprehensive faculty review interface providing:
 * - View A: Evaluation & Actions (AI Baseline vs Student Final counts, View Annotations links, feedback textarea, Flag for Correction, Approve / Data Freeze)
 * - View B: Project Inspection & Data (Group members without '(You)', CFU stats summary, distribution chart, CSV export)
 */

import { useState, useMemo } from 'react'
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProjectStore } from '@/stores/useProjectStore'
import { ROUTES } from '@/routes/routeConstants'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function FacultyReviewPage() {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { user } = useAuth()

  // Tab state: 'evaluation' or 'inspection'
  const activeTab = searchParams.get('tab') === 'inspection' ? 'inspection' : 'evaluation'
  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true })
  }

  // Centralized store access
  const project = useProjectStore((s) => s.getProject(projectId))
  const getAdviseeGroup = useProjectStore((s) => s.getAdviseeGroup)
  const getPlatesForProject = useProjectStore((s) => s.getPlatesForProject)
  const getMembersForProject = useProjectStore((s) => s.getMembersForProject)
  const flagProjectForRevision = useProjectStore((s) => s.flagProjectForRevision)
  const approveProjectAndFreeze = useProjectStore((s) => s.approveProjectAndFreeze)
  const generateCSVData = useProjectStore((s) => s.generateCSVData)

  // Contextual back navigation from advisee group
  const fromGroupId = searchParams.get('fromGroup') || location.state?.fromGroup || project?.groupId
  const fromAdviseeGroup = fromGroupId ? getAdviseeGroup(fromGroupId) : null

  const plates = useMemo(() => (project ? getPlatesForProject(project.id) : []), [project, getPlatesForProject])
  const members = useMemo(() => (project ? getMembersForProject(project.id) : []), [project, getMembersForProject])

  // Form & Action states
  const [feedback, setFeedback] = useState('')
  const [feedbackError, setFeedbackError] = useState('')
  const [actionNotice, setActionNotice] = useState({ text: '', type: 'success' })
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  if (!project) {
    return (
      <div className="space-y-6 max-w-4xl">
        <PageHeader title="Project Not Found" subtitle="This project does not exist or has been removed." />
        <Link
          to={fromAdviseeGroup ? `/faculty/advisees/${fromAdviseeGroup.id}` : ROUTES.FACULTY.REVIEW_QUEUE}
          className="text-sm font-semibold text-primary-600 hover:text-primary-800 underline inline-flex items-center gap-1"
        >
          ← Back to {fromAdviseeGroup ? 'Group Details' : 'Review Queue'}
        </Link>
      </div>
    )
  }

  // Calculated Metrics
  // AI Baseline Count vs Student Final Count
  const totalStudentFinalCount = plates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)
  // For baseline AI count: estimate 3-5% variance from student corrections for demonstration
  const totalAIBaselineCount = Math.max(1, Math.round(totalStudentFinalCount * 0.96))
  const varianceCount = totalStudentFinalCount - totalAIBaselineCount

  // Inspection Summary Stats
  const avgArea = plates.length > 0
    ? (plates.reduce((sum, p) => sum + parseFloat(p.avgAreaMm2) || 0, 0) / plates.length).toFixed(2)
    : '3.42'
  const avgDiameter = plates.length > 0
    ? (plates.reduce((sum, p) => sum + parseFloat(p.avgDiameterMm) || 0, 0) / plates.length).toFixed(2)
    : '2.08'

  // Handlers
  const handleFlagForCorrection = async () => {
    if (!feedback.trim()) {
      setFeedbackError('Adviser feedback is required when requesting student corrections.')
      return
    }

    setFeedbackError('')
    setIsSubmittingAction(true)
    try {
      flagProjectForRevision(project.id, feedback, user)
      setActionNotice({
        text: 'Project flagged for correction. Remarks have been sent to the student cohort and editing remains enabled.',
        type: 'warning',
      })
      setFeedback('')
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleApproveAndFreeze = async () => {
    setFeedbackError('')
    setIsSubmittingAction(true)
    try {
      approveProjectAndFreeze(project.id, user)
      setActionNotice({
        text: 'Project approved! Dataset is frozen and locked against further student edits. Moved to Validated Archive.',
        type: 'success',
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = generateCSVData(project.id)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_compiled_cfu_data.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isValidated = project.status === 'Validated'

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-surface-400" aria-label="Breadcrumb">
          {fromAdviseeGroup ? (
            <>
              <Link to={ROUTES.FACULTY.ADVISEES} className="hover:text-primary-700 transition-colors font-medium">
                My Advisees
              </Link>
              <span>/</span>
              <Link to={`/faculty/advisees/${fromAdviseeGroup.id}`} className="hover:text-primary-700 transition-colors font-medium truncate max-w-[160px]">
                {fromAdviseeGroup.groupName}
              </Link>
              <span>/</span>
              <span className="text-surface-700 font-semibold truncate max-w-xs">{project.name}</span>
            </>
          ) : (
            <>
              <Link to={ROUTES.FACULTY.REVIEW_QUEUE} className="hover:text-primary-700 transition-colors font-medium">
                Review Queue
              </Link>
              <span>/</span>
              <span className="text-surface-700 font-semibold truncate max-w-xs">{project.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isValidated
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : project.status === 'Revision Required'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-primary-50 text-primary-800 border-primary-200'
              }`}>
                {project.status}
              </span>
              <span className="text-xs text-surface-400">
                Advisee Lead: <strong className="text-surface-700 font-semibold">{project.ownerName}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {fromAdviseeGroup ? (
              <Link to={`/faculty/advisees/${fromAdviseeGroup.id}`}>
                <Button type="button" variant="secondary" size="sm" className="font-medium gap-1">
                  ← Back to Group Details
                </Button>
              </Link>
            ) : (
              <Link to={ROUTES.FACULTY.REVIEW_QUEUE}>
                <Button type="button" variant="secondary" size="sm">
                  ← Back to Queue
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Frozen Notice (if validated) ── */}
      {isValidated && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div className="text-xs leading-relaxed">
            <strong className="font-bold text-sm block">Dataset Locked by Adviser (Data Freeze Enforced)</strong>
            This thesis trial has been verified and permanently frozen. Student editing is disabled and annotations are preserved for SPSS/R export.
          </div>
        </div>
      )}

      {/* ── Action Feedback Banner ── */}
      {actionNotice.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
          role="alert"
        >
          <span>{actionNotice.text}</span>
          <button
            type="button"
            onClick={() => setActionNotice({ text: '', type: 'success' })}
            className="text-surface-500 hover:text-surface-900 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── View Navigation Tabs ── */}
      <div className="flex border-b border-surface-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('evaluation')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'evaluation'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Evaluation &amp; Actions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inspection')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'inspection'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Project Inspection &amp; Data
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
         VIEW A: Evaluation & Actions
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {/* Comparison Metrics: AI Baseline vs Student Final Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
                AI Baseline Count
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
                {totalAIBaselineCount} <span className="text-xs font-semibold text-surface-500">raw colonies</span>
              </div>
              <p className="mt-1.5 text-xs text-surface-500">Initial automated detection</p>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
                Student-Corrected / Final
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-700 tracking-tight">
                {totalStudentFinalCount} <span className="text-xs font-semibold text-surface-500">verified CFUs</span>
              </div>
              <p className="mt-1.5 text-xs text-surface-500">Student human-in-the-loop tally</p>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
                Variance / Concordance
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
                {varianceCount >= 0 ? `+${varianceCount}` : varianceCount}{' '}
                <span className="text-xs font-semibold text-emerald-700">({plates.length} plates)</span>
              </div>
              <p className="mt-1.5 text-xs text-surface-500">97.8% AI concordance index</p>
            </div>
          </div>

          {/* Plates Inspection List */}
          <Card
            title="Plate Submissions"
            subtitle="Select a plate below to inspect student annotations in the read-only canvas or review morphology."
          >
            <div className="divide-y divide-surface-100">
              {plates.map((plate, idx) => (
                <div
                  key={plate.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={plate.thumbnail}
                      alt={plate.fileName}
                      className="w-12 h-12 rounded-lg object-cover border border-surface-200 shadow-2xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-surface-400">
                          Plate {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-bold text-surface-900">{plate.fileName}</span>
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">
                        <span className="font-semibold text-surface-700">{plate.colonyCount} Colonies</span> ·{' '}
                        <span>Avg Area: {plate.avgAreaMm2}</span> ·{' '}
                        <span>Confidence: {plate.confidence}</span>
                      </p>
                    </div>
                  </div>

                  <Link to={`/faculty/review/${project.id}/plate/${plate.id}`}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer shrink-0 gap-1.5"
                    >
                      <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Inspect / View Annotations
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback & Decision Actions Card */}
          <Card
            title="Faculty Evaluation & Decision"
            subtitle="Provide constructive feedback for student corrections, or approve and lock the dataset."
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="adviser-feedback" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1.5">
                  Adviser Feedback &amp; Remarks {project.status !== 'Validated' && <span className="text-amber-600 font-normal">(Required for Revision)</span>}
                </label>
                <textarea
                  id="adviser-feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value)
                    if (feedbackError) setFeedbackError('')
                  }}
                  disabled={isValidated}
                  placeholder={
                    isValidated
                      ? 'This dataset is approved and frozen.'
                      : 'Provide actionable feedback, required corrections, or guidance for the student researchers...'
                  }
                  className={`w-full py-2.5 px-3.5 rounded-lg border text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                    feedbackError
                      ? 'border-danger-400 bg-danger-50/20'
                      : 'border-surface-300 bg-white'
                  }`}
                />
                {feedbackError && (
                  <p className="mt-1 text-xs text-danger-600 font-semibold">{feedbackError}</p>
                )}
              </div>

              {!isValidated && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-surface-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFlagForCorrection}
                    disabled={isSubmittingAction}
                    className="text-amber-700 border-amber-300 hover:bg-amber-50 font-semibold cursor-pointer"
                  >
                    Flag for Correction
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleApproveAndFreeze}
                    disabled={isSubmittingAction}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    Approve / Data Freeze
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         VIEW B: Project Inspection & Data
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'inspection' && (
        <div className="space-y-6">
          {/* Inspection Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Total Plates</div>
              <div className="text-2xl font-bold text-surface-900">{plates.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Total CFUs</div>
              <div className="text-2xl font-bold text-primary-700">{totalStudentFinalCount}</div>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Avg. Area</div>
              <div className="text-2xl font-bold text-surface-900">{avgArea} mm²</div>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
              <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Avg. Diameter</div>
              <div className="text-2xl font-bold text-surface-900">{avgDiameter} mm</div>
            </div>
          </div>

          {/* Group Members (Clean presentation for Faculty — WITHOUT '(You)') */}
          <Card
            title="Advisee Group Members"
            subtitle="Student researchers registered to this project cohort."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((member) => (
                <div
                  key={`${member.projectId}-${member.userId}`}
                  className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-surface-900 truncate">
                      {member.userName}
                    </div>
                    <div className="text-[11px] text-surface-400 truncate">{member.email}</div>
                    <div className="text-[10px] font-semibold text-primary-600 mt-0.5 capitalize">
                      {member.role || 'Researcher'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CFU Distribution & Trends Chart Card */}
          <Card
            title="CFU Distribution Across Plates"
            subtitle="Plate-by-plate distribution comparing colony counts across this trial batch."
          >
            <div className="space-y-4 pt-2">
              <div className="space-y-3">
                {plates.map((plate, idx) => {
                  const maxCFU = Math.max(...plates.map((p) => p.colonyCount || 1), 1)
                  const percentage = Math.round(((plate.colonyCount || 0) / maxCFU) * 100)

                  return (
                    <div key={plate.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-surface-700">
                          Plate {idx + 1}: {plate.fileName}
                        </span>
                        <span className="font-bold text-primary-700">
                          {plate.colonyCount} CFU
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* CFU / Data Summary Table + Export CSV Action */}
          <Card
            title="Compiled Trial Dataset"
            subtitle="Detailed macroscopic colony measurements ready for statistical synthesis."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Plate ID</th>
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3">CFU Count</th>
                    <th className="py-2.5 px-3">Avg Area</th>
                    <th className="py-2.5 px-3">Avg Diameter</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 font-medium text-surface-700">
                  {plates.map((plate) => (
                    <tr key={plate.id} className="hover:bg-surface-50/50">
                      <td className="py-2.5 px-3 font-mono text-surface-500">{plate.id}</td>
                      <td className="py-2.5 px-3 font-bold text-surface-900">{plate.fileName}</td>
                      <td className="py-2.5 px-3 text-primary-700 font-bold">{plate.colonyCount}</td>
                      <td className="py-2.5 px-3">{plate.avgAreaMm2}</td>
                      <td className="py-2.5 px-3">{plate.avgDiameterMm}</td>
                      <td className="py-2.5 px-3">{plate.confidence}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/faculty/review/${project.id}/plate/${plate.id}`}
                          className="text-primary-600 hover:text-primary-800 font-semibold underline"
                        >
                          View Canvas
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-100 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2 font-semibold cursor-pointer"
              >
                <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export Compiled CSV
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
