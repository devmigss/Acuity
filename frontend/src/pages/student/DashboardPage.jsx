/**
 * Acuity — Student Dashboard Page (Overview Hub)
 *
 * Route: /student/dashboard
 *
 * The global research overview for the student. Shows dynamic summaries
 * of active projects, recent plates, processing activity, adviser feedback,
 * and quick actions. All data reads from the centralized useProjectStore.
 *
 * NOTE: Scientific measurements and colony metrics are static demonstration
 * data. Authoritative calculation formulas will be provided by the Python
 * FastAPI/OpenCV microservice in future phases.
 */

import { useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProjectStore, PLATE_STATUS, REMARK_STATUS } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { useToastStore } from '@/store/useToastStore'

/* ── Helper: format date ── */
function formatDate(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Select stable arrays and action from store
  const projects = useProjectStore((s) => s.projects)
  const plates = useProjectStore((s) => s.plates)
  const members = useProjectStore((s) => s.members)
  const adviserRemarks = useProjectStore((s) => s.adviserRemarks)
  const activityLog = useProjectStore((s) => s.activityLog)
  const createProject = useProjectStore((s) => s.createProject)

  // Derived memoized collections
  const userId = user?.id

  const ownedProjects = useMemo(
    () => projects.filter((p) => p.ownerId === userId),
    [projects, userId]
  )

  const accessibleProjectIds = useMemo(() => {
    const memberProjectIds = members
      .filter((m) => m.userId === userId)
      .map((m) => m.projectId)
    return projects.filter((p) => memberProjectIds.includes(p.id)).map((p) => p.id)
  }, [projects, members, userId])

  const recentPlates = useMemo(
    () =>
      plates
        .filter((p) => accessibleProjectIds.includes(p.projectId))
        .slice()
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 5),
    [plates, accessibleProjectIds]
  )

  const processingPlates = useMemo(
    () =>
      plates.filter(
        (p) =>
          accessibleProjectIds.includes(p.projectId) &&
          (p.status === PLATE_STATUS.UPLOADING ||
            p.status === PLATE_STATUS.PENDING ||
            p.status === PLATE_STATUS.PROCESSING)
      ),
    [plates, accessibleProjectIds]
  )

  const remarks = useMemo(() => {
    const ownedIds = ownedProjects.map((p) => p.id)
    return adviserRemarks.filter((r) => ownedIds.includes(r.projectId))
  }, [adviserRemarks, ownedProjects])

  const recentActivity = useMemo(() => activityLog.slice(0, 6), [activityLog])

  // Quick Upload state
  const [showQuickUpload, setShowQuickUpload] = useState(false)
  const [selectedQuickUploadProjectId, setSelectedQuickUploadProjectId] = useState(null)

  const openQuickUpload = useCallback(() => {
    if (ownedProjects.length > 0) {
      setSelectedQuickUploadProjectId(ownedProjects[0].id)
      setShowQuickUpload(true)
    } else {
      setShowCreateProject(true)
    }
  }, [ownedProjects])

  const closeQuickUpload = useCallback(() => {
    setShowQuickUpload(false)
  }, [])

  const handleProceedQuickUpload = useCallback(() => {
    if (!selectedQuickUploadProjectId) return
    setShowQuickUpload(false)
    navigate(`/student/projects/${selectedQuickUploadProjectId}?tab=plates`)
  }, [selectedQuickUploadProjectId, navigate])

  // Create Project modal
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [createError, setCreateError] = useState('')

  const closeCreateProject = useCallback(() => {
    setShowCreateProject(false)
    setCreateError('')
    setNewProjectName('')
    setNewProjectDesc('')
  }, [])

  const handleCreateProject = useCallback(() => {
    setCreateError('')
    if (!newProjectName.trim()) {
      setCreateError('Project name is required.')
      return
    }
    const id = createProject(newProjectName.trim(), newProjectDesc.trim(), user)
    closeCreateProject()
    useToastStore.getState().addToast('Project created successfully!', 'success')
    navigate(`/student/projects/${id}`)
  }, [newProjectName, newProjectDesc, createProject, user, navigate, closeCreateProject])

  // Stats
  const totalPlates = useMemo(
    () =>
      ownedProjects.reduce(
        (sum, p) => sum + plates.filter((pl) => pl.projectId === p.id).length,
        0
      ),
    [ownedProjects, plates]
  )

  const openRemarks = useMemo(
    () => remarks.filter((r) => r.status === REMARK_STATUS.OPEN),
    [remarks]
  )

  // Find most recent completed plate for "Open Canvas" shortcut
  const recentCompletedPlate = useMemo(
    () =>
      recentPlates.find(
        (p) =>
          p.status === PLATE_STATUS.COMPLETED ||
          p.status === PLATE_STATUS.REVIEWED ||
          p.status === PLATE_STATUS.PENDING_ADVISER
      ),
    [recentPlates]
  )

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-900 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-400" />
            Research Overview
          </div>
          <PageHeader
            title={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Researcher'}`}
            subtitle="Your research dashboard — projects, processing activity, and adviser feedback at a glance."
          />
        </div>

        <div className="flex items-center gap-3">
          {recentCompletedPlate && (
            <Button
              type="button"
              variant="accent"
              onClick={() => navigate(`/student/projects/${recentCompletedPlate.projectId}/annotate/${recentCompletedPlate.id}`)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
              <span>Open Canvas</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setShowCreateProject(true)}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-surface-900">New Project</div>
            <div className="text-xs text-surface-500">Start a research project</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/student/projects')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-surface-900">My Projects</div>
            <div className="text-xs text-surface-500">{ownedProjects.length} active projects</div>
          </div>
        </button>

        <button
          type="button"
          onClick={openQuickUpload}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-accent-50 border border-accent-100 flex items-center justify-center text-accent-600 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-surface-900">Quick Upload</div>
            <div className="text-xs text-surface-500">Upload plates to a project</div>
          </div>
        </button>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Projects</div>
          <div className="text-2xl font-extrabold text-[#0B1F3A]">{ownedProjects.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Total Plates</div>
          <div className="text-2xl font-extrabold text-[#0B1F3A]">{totalPlates}</div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Processing</div>
          <div className="text-2xl font-extrabold text-blue-600">
            {processingPlates.length}
            {processingPlates.length > 0 && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-2" />}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Open Remarks</div>
          <div className="text-2xl font-extrabold text-amber-600">{openRemarks.length}</div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Projects */}
        <Card title="Active Projects" subtitle="Your most recent research projects">
          {ownedProjects.length > 0 ? (
            <div className="space-y-3">
              {ownedProjects.slice(0, 4).map((project) => {
                const projStats = useProjectStore.getState().getProjectStats(project.id)
                return (
                  <Link
                    key={project.id}
                    to={`/student/projects/${project.id}`}
                    className="block p-3 rounded-lg border border-surface-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-surface-900 truncate">{project.name}</h4>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {projStats.totalPlates} plates · {projStats.totalCFU} CFUs · {projStats.memberCount} member(s)
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        project.status === 'Validated'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : project.status === 'Adviser Review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-surface-100 text-surface-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </Link>
                )
              })}
              {ownedProjects.length > 4 && (
                <Link to="/student/projects" className="block text-center text-xs font-semibold text-primary-600 hover:text-primary-800 pt-2">
                  View all {ownedProjects.length} projects →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-surface-500 mb-3">No projects yet. Start your first research project!</p>
              <Button variant="primary" size="sm" onClick={() => setShowCreateProject(true)}>
                + Create Project
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Plates */}
        <Card title="Recent Plates" subtitle="Latest uploaded Petri dish photographs">
          {recentPlates.length > 0 ? (
            <div className="space-y-2">
              {recentPlates.map((plate) => {
                const project = useProjectStore.getState().getProject(plate.projectId)
                return (
                  <div key={plate.id} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <img src={plate.thumbnail} alt={plate.fileName} className="w-8 h-8 rounded-lg object-cover border border-surface-200" />
                      <div>
                        <span className="text-sm font-medium text-surface-900">{plate.fileName}</span>
                        <span className="block text-xs text-surface-400 truncate max-w-[200px]">{project?.name}</span>
                      </div>
                    </div>
                    <PlateStatusBadge status={plate.status} />
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-surface-500 py-4 text-center">No plates uploaded yet.</p>
          )}
        </Card>

        {/* Adviser Remarks */}
        <Card title="Adviser Feedback" subtitle="Recent remarks from your advisers">
          {remarks.length > 0 ? (
            <div className="space-y-3">
              {remarks.slice(0, 3).map((remark) => (
                <Link
                  key={remark.id}
                  to={remark.plateId
                    ? `/student/projects/${remark.projectId}/annotate/${remark.plateId}`
                    : `/student/projects/${remark.projectId}`}
                  className="block p-3 rounded-lg border border-surface-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary-700">{remark.adviserName}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      remark.status === REMARK_STATUS.OPEN
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : remark.status === REMARK_STATUS.ADDRESSED
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {remark.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-700 line-clamp-2">{remark.comment}</p>
                  <p className="text-xs text-surface-400 mt-1">{remark.projectName}</p>
                </Link>
              ))}
              {remarks.length > 3 && (
                <Link to="/student/adviser-remarks" className="block text-center text-xs font-semibold text-primary-600 hover:text-primary-800 pt-2">
                  View all remarks →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-surface-500 py-4 text-center">No adviser remarks yet.</p>
          )}
        </Card>

        {/* Activity Feed */}
        <Card title="Recent Activity" subtitle="Latest actions across your projects">
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-surface-50 last:border-0">
                  <ActivityIcon type={activity.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-surface-800">{activity.detail}</p>
                    <p className="text-xs text-surface-400">{activity.projectName} · {formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500 py-4 text-center">No recent activity.</p>
          )}
        </Card>
      </div>

      {/* ── Create Project Modal ── */}
      <Modal
        isOpen={showCreateProject}
        onClose={closeCreateProject}
        title="Create New Research Project"
        size="md"
        className="max-w-[460px]"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={closeCreateProject}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateProject}
              className="bg-[#0B1F3A] hover:bg-[#071527] text-white font-semibold"
            >
              Create Project
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Project Name"
              placeholder="e.g., Antimicrobial Efficacy of Plant Extracts"
              value={newProjectName}
              onChange={(e) => {
                setNewProjectName(e.target.value)
                if (createError) setCreateError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateProject()
                }
              }}
              error={createError}
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700">Description (optional)</label>
            <textarea
              placeholder="Brief description of the research objectives..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-lg border border-surface-300 text-sm bg-white text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150 resize-none"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* ── Quick Upload Modal (project picker) ── */}
      <Modal
        isOpen={showQuickUpload}
        onClose={closeQuickUpload}
        title="Quick Upload — Select Project"
        size="md"
        className="max-w-[480px]"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={closeQuickUpload}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedQuickUploadProjectId}
              onClick={handleProceedQuickUpload}
              className="bg-[#0B1F3A] hover:bg-[#071527] text-white gap-1.5 font-semibold"
            >
              <span>Continue to Upload</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </>
        }
      >
        <div>
          <p className="text-xs text-surface-500 mb-3.5">
            Select the research project to receive your batch of Petri dish photos:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {ownedProjects.length > 0 ? (
              ownedProjects.map((project) => {
                const isSelected = selectedQuickUploadProjectId === project.id
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedQuickUploadProjectId(project.id)}
                    onDoubleClick={handleProceedQuickUpload}
                    className={`
                      w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3
                      ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/50 shadow-2xs ring-1 ring-primary-600/30'
                          : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50/80 bg-white'
                      }
                    `}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-surface-900 truncate leading-snug">
                        {project.name}
                      </div>
                      <div className="text-xs text-surface-500 flex items-center gap-2 mt-1 truncate">
                        <span className="font-medium text-surface-700">{project.organism || 'Standard assay'}</span>
                        <span>·</span>
                        <span>Updated {formatDate(project.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Radio selection indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-surface-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-surface-500 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                No active projects found. Create one below to begin.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowQuickUpload(false)
                setShowCreateProject(true)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Create new project instead</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ── Status Badge ── */
function PlateStatusBadge({ status }) {
  let classes = 'bg-surface-100 text-surface-600'
  if (status === PLATE_STATUS.COMPLETED || status === PLATE_STATUS.REVIEWED) {
    classes = 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  } else if (status === PLATE_STATUS.PENDING_ADVISER) {
    classes = 'bg-amber-50 text-amber-700 border border-amber-200'
  } else if (status === PLATE_STATUS.PROCESSING) {
    classes = 'bg-blue-50 text-blue-700 border border-blue-200'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {(status === PLATE_STATUS.PROCESSING || status === PLATE_STATUS.UPLOADING) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1" />
      )}
      {status}
    </span>
  )
}

/* ── Activity Icon ── */
function ActivityIcon({ type }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center shrink-0'
  switch (type) {
    case 'plate_uploaded':
      return (
        <div className={`${base} bg-primary-50 text-primary-600`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3" />
          </svg>
        </div>
      )
    case 'plate_analyzed':
      return (
        <div className={`${base} bg-emerald-50 text-emerald-600`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
      )
    case 'remark_received':
      return (
        <div className={`${base} bg-amber-50 text-amber-600`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </div>
      )
    case 'project_created':
      return (
        <div className={`${base} bg-blue-50 text-blue-600`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      )
    default:
      return <div className={`${base} bg-surface-100 text-surface-500`} />
  }
}
