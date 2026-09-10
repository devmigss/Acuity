/**
 * Acuity — Faculty Advisee Group Detail Page
 *
 * Route: /faculty/advisees/:groupId
 *
 * Displays detailed information about a specific thesis advisee group:
 * - Group metadata & institution details
 * - Primary research topic
 * - Scoped projects & submissions with status-specific actions:
 *   • Pending Review → Inspect Submission
 *   • Revision Required → View Remarks & Feedback
 *   • Validated / Frozen → Export CSV / Summary
 *   • Draft / In Progress → Progress indicators
 * - Professional group member roster (no '(You)' tags, read-only note)
 * - Preserves contextual navigation back to My Advisees
 */

import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function AdviseeDetailPage() {
  const { groupId } = useParams()

  const getAdviseeGroup = useProjectStore((s) => s.getAdviseeGroup)
  const getProjectsForGroup = useProjectStore((s) => s.getProjectsForGroup)
  const getPlatesForProject = useProjectStore((s) => s.getPlatesForProject)
  const generateCSVData = useProjectStore((s) => s.generateCSVData)
  const adviserRemarks = useProjectStore((s) => s.adviserRemarks)

  const group = getAdviseeGroup(groupId)
  const projects = useMemo(() => (group ? getProjectsForGroup(group.id) : []), [group, getProjectsForGroup])

  const [activeTab, setActiveTab] = useState('projects') // 'projects' | 'members'
  const [selectedRemarkProject, setSelectedRemarkProject] = useState(null)

  if (!group) {
    return (
      <div className="space-y-6 max-w-4xl">
        <PageHeader
          title="Advisee Group Not Found"
          subtitle="The requested thesis research cohort does not exist or has been removed."
        />
        <Link
          to={ROUTES.FACULTY.ADVISEES}
          className="text-sm font-semibold text-primary-600 hover:text-primary-800 underline inline-flex items-center gap-1"
        >
          ← Back to My Advisees
        </Link>
      </div>
    )
  }

  // Summary Metrics
  const pendingProjects = projects.filter(
    (p) => p.status === 'Adviser Review' || p.status === 'Pending Review'
  )
  const validatedProjects = projects.filter((p) => p.status === 'Validated')

  // CSV Export handler
  const handleExportCSV = (project) => {
    const csvContent = generateCSVData(project.id)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="flex items-center gap-2 text-xs text-surface-400" aria-label="Breadcrumb">
        <Link to={ROUTES.FACULTY.ADVISEES} className="hover:text-primary-700 transition-colors font-medium">
          My Advisees
        </Link>
        <span>/</span>
        <span className="text-surface-700 font-semibold truncate max-w-md">{group.groupName}</span>
      </nav>

      {/* ── Group Header Card ── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {group.status}
              </span>
              <span className="text-xs font-medium text-surface-400">{group.academicYear}</span>
              <span className="text-xs text-surface-400">·</span>
              <span className="text-xs font-medium text-surface-500">
                Adviser: <strong className="text-surface-700 font-semibold">{group.adviser}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              {group.groupName}
            </h1>
            <p className="text-xs text-surface-500 flex flex-wrap items-center gap-2">
              <span>{group.institution}</span>
              <span>·</span>
              <span className="font-medium text-surface-700">{group.laboratory}</span>
              <span>·</span>
              <span>
                Group Lead: <strong className="text-surface-800 font-semibold">{group.leadName}</strong> ({group.leadEmail})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={ROUTES.FACULTY.ADVISEES}>
              <Button type="button" variant="secondary" size="sm" className="font-medium">
                ← All Advisees
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Research Topic Callout */}
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-200/80">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">
            Assigned Biology Research Topic
          </div>
          <div className="text-sm sm:text-base font-semibold text-[#0B1F3A] leading-snug">
            {group.topic}
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-surface-50/70 p-3 rounded-lg border border-surface-100">
            <div className="text-[11px] font-semibold text-surface-400 uppercase">Total Projects</div>
            <div className="text-lg font-extrabold text-surface-900">{projects.length}</div>
          </div>
          <div className="bg-surface-50/70 p-3 rounded-lg border border-surface-100">
            <div className="text-[11px] font-semibold text-surface-400 uppercase">Pending Review</div>
            <div className="text-lg font-extrabold text-amber-600">{pendingProjects.length}</div>
          </div>
          <div className="bg-surface-50/70 p-3 rounded-lg border border-surface-100">
            <div className="text-[11px] font-semibold text-surface-400 uppercase">Validated Batches</div>
            <div className="text-lg font-extrabold text-emerald-600">{validatedProjects.length}</div>
          </div>
          <div className="bg-surface-50/70 p-3 rounded-lg border border-surface-100">
            <div className="text-[11px] font-semibold text-surface-400 uppercase">Active Members</div>
            <div className="text-lg font-extrabold text-primary-700">{group.members.length}</div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex gap-4 border-b border-surface-200">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          <span>Projects &amp; Submissions</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'projects' ? 'bg-primary-100 text-primary-800' : 'bg-surface-100 text-surface-600'
          }`}>
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'members'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          <span>Group Members</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'members' ? 'bg-primary-100 text-primary-800' : 'bg-surface-100 text-surface-600'
          }`}>
            {group.members.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: Projects & Submissions ── */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <div className="py-10 text-center text-xs text-surface-500">
                No projects currently registered under this advisee cohort.
              </div>
            </Card>
          ) : (
            projects.map((project) => {
              const projectPlates = getPlatesForProject(project.id)
              const totalCFUs = projectPlates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)
              const analyzedPlates = projectPlates.filter(
                (p) => p.status === 'AI Analyzed' || p.status === 'Reviewed' || p.status === 'Pending Adviser'
              )

              const isPending = project.status === 'Adviser Review' || project.status === 'Pending Review'
              const isRevision = project.status === 'Revision Required'
              const isValidated = project.status === 'Validated'
              const isInProgress = project.status === 'In Progress' || project.status === 'Draft'

              // Check if remarks exist for this project
              const projectRemarks = adviserRemarks.filter((r) => r.projectId === project.id)

              return (
                <Card key={project.id}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPending && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Review
                          </span>
                        )}
                        {isRevision && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            Revision Required
                          </span>
                        )}
                        {isValidated && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Validated · Data Frozen
                          </span>
                        )}
                        {isInProgress && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-700 border border-surface-200">
                            Draft / In Progress
                          </span>
                        )}

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
                          Project Lead: <strong className="text-surface-800 font-semibold">{project.ownerName}</strong>
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

                    {/* ── Status-Specific Action ── */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-2 md:pt-0">
                      {isPending && (
                        <Link
                          to={`/faculty/review/${project.id}?fromGroup=${group.id}`}
                          state={{ fromGroup: group.id, groupName: group.groupName }}
                        >
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="bg-[#0B1F3A] hover:bg-[#071527] text-white px-4 font-semibold shadow-xs cursor-pointer gap-1.5"
                          >
                            Inspect Submission →
                          </Button>
                        </Link>
                      )}

                      {isRevision && (
                        <div className="flex items-center gap-2">
                          {projectRemarks.length > 0 && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedRemarkProject(project)}
                              className="font-medium text-xs text-amber-800 border-amber-300 hover:bg-amber-50 cursor-pointer"
                            >
                              Quick Remarks
                            </Button>
                          )}
                          <Link
                            to={`/faculty/review/${project.id}?fromGroup=${group.id}`}
                            state={{ fromGroup: group.id, groupName: group.groupName }}
                          >
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="font-semibold text-amber-800 border-amber-300 hover:bg-amber-50 cursor-pointer"
                            >
                              View Remarks &amp; Canvas →
                            </Button>
                          </Link>
                        </div>
                      )}

                      {isValidated && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to={`/faculty/archive/${project.id}?fromGroup=${group.id}`}
                            state={{ fromGroup: group.id, groupName: group.groupName }}
                          >
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="font-medium cursor-pointer"
                            >
                              View Record
                            </Button>
                          </Link>

                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleExportCSV(project)}
                            className="bg-[#0B1F3A] hover:bg-[#071527] text-white gap-2 font-semibold shadow-xs cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Export CSV
                          </Button>
                        </div>
                      )}

                      {isInProgress && (
                        <div className="text-xs text-surface-500 bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                          <span className="font-semibold text-surface-700">{analyzedPlates.length} of {projectPlates.length}</span> plates analyzed
                          <span className="block text-[11px] text-surface-400">Draft in progress by student team</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* ── TAB 2: Group Members ── */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Read-Only Disclaimer Callout */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div className="text-xs leading-relaxed">
              <strong className="font-bold text-sm block mb-0.5 text-blue-950">Read-Only Advisee Roster</strong>
              Group membership and collaboration roles are managed by the student group leader through project invitations. Faculty advisers have read-only visibility into active cohort participants.
            </div>
          </div>

          {/* Members Table / List */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-2xs">
            <div className="divide-y divide-surface-100">
              {group.members.map((member) => {
                const initials = member.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()

                return (
                  <div
                    key={member.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        member.isLeader
                          ? 'bg-[#0B1F3A] text-white shadow-xs'
                          : 'bg-surface-100 text-surface-700 border border-surface-200'
                      }`}>
                        {initials}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-surface-900">
                            {member.name}
                          </h4>
                          {member.isLeader ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200 inline-flex items-center gap-1">
                              ★ Group Leader
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 border border-surface-200">
                              {member.role || 'Research Member'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-surface-500 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          <span>{member.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Activity info */}
                    <div className="text-xs text-surface-500 sm:text-right pl-14 sm:pl-0">
                      <div>
                        Activity: <strong className="text-surface-800 font-semibold">{member.platesUploaded} {member.platesUploaded === 1 ? 'Plate' : 'Plates'}</strong> uploaded
                      </div>
                      <div className="text-surface-400 text-[11px] mt-0.5">
                        Last Active: {new Date(member.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Remarks Modal ── */}
      {selectedRemarkProject && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRemarkProject(null)}
          title={`Adviser Remarks: ${selectedRemarkProject.name}`}
        >
          <div className="space-y-4 text-xs text-surface-700">
            <p className="text-surface-500">
              Remarks submitted for revision to advisee lead <strong className="text-surface-800">{selectedRemarkProject.ownerName}</strong>:
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {adviserRemarks
                .filter((r) => r.projectId === selectedRemarkProject.id)
                .map((remark) => (
                  <div key={remark.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-amber-800 font-medium">
                      <span>{remark.plateName || 'General Project Remark'}</span>
                      <span>{new Date(remark.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p className="text-amber-950 font-normal leading-relaxed">{remark.comment}</p>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedRemarkProject(null)}
              >
                Close
              </Button>
              <Link
                to={`/faculty/review/${selectedRemarkProject.id}?fromGroup=${group.id}`}
                state={{ fromGroup: group.id, groupName: group.groupName }}
              >
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-[#0B1F3A] hover:bg-[#071527] text-white"
                >
                  Open in Project Review →
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
