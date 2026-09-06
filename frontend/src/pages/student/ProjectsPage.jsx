/**
 * Acuity — Student Projects Page
 *
 * Displays research projects created and managed by the student.
 * Reads from the centralized useProjectStore. Supports creating new
 * projects, searching/filtering, and navigating to project workspaces.
 */

import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useToastStore } from '@/store/useToastStore'

/* ── Helper: format date ── */
function formatDate(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const projects = useProjectStore((s) => s.projects)
  const createProject = useProjectStore((s) => s.createProject)
  const userId = user?.id

  const ownedProjects = useMemo(
    () => projects.filter((p) => p.ownerId === userId),
    [projects, userId]
  )

  // Search
  const [search, setSearch] = useState('')
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return ownedProjects
    const q = search.toLowerCase()
    return ownedProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.organism?.toLowerCase().includes(q) ||
        p.adviser?.toLowerCase().includes(q)
    )
  }, [ownedProjects, search])

  // Create Project modal
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [createError, setCreateError] = useState('')

  const handleCreate = useCallback(() => {
    setCreateError('')
    if (!newName.trim()) {
      setCreateError('Project name is required.')
      return
    }
    const id = createProject(newName.trim(), newDesc.trim(), user)
    setShowCreate(false)
    setNewName('')
    setNewDesc('')
    useToastStore.getState().addToast('Project created successfully!', 'success')
    navigate(`/student/projects/${id}`)
  }, [newName, newDesc, createProject, user, navigate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="My Projects"
          subtitle="Manage active research projects, invite lab members, and track trial batches."
        />
        <Button
          type="button"
          variant="primary"
          onClick={() => setShowCreate(true)}
        >
          + New Project
        </Button>
      </div>

      {/* Search Bar */}
      {ownedProjects.length > 0 && (
        <div className="max-w-md">
          <Input
            placeholder="Search projects by name, organism, or adviser..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const stats = useProjectStore.getState().getProjectStats(project.id)
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  {project.organism && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                      {project.organism}
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      project.status === 'Validated'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : project.status === 'Adviser Review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-surface-100 text-surface-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-surface-900 mb-2 leading-snug">
                  {project.name}
                </h3>

                <div className="space-y-1 text-xs text-surface-500 mb-4">
                  {project.adviser && (
                    <div>Adviser: <span className="font-semibold text-surface-700">{project.adviser}</span></div>
                  )}
                  <div>Plates Analyzed: <span className="font-semibold text-surface-700">{stats.totalPlates} Petri dishes</span></div>
                  <div>Members: <span className="font-semibold text-surface-700">{stats.memberCount}</span></div>
                  <div>Last Activity: {formatDate(project.updatedAt)}</div>
                </div>

                <div className="pt-3 border-t border-surface-100 flex justify-end">
                  <Link
                    to={`/student/projects/${project.id}`}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                  >
                    Open Workspace →
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : ownedProjects.length > 0 ? (
        <div className="flex items-center justify-center py-16 rounded-xl border border-dashed border-surface-300 bg-surface-50">
          <div className="text-center max-w-sm">
            <div className="text-base font-semibold text-surface-900">No matching projects</div>
            <p className="mt-1 text-sm text-surface-500">Try a different search term.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-24 rounded-xl border border-dashed border-surface-300 bg-surface-50">
          <div className="text-center max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <div className="text-base font-semibold text-surface-900">No Projects Yet</div>
            <p className="mt-1 text-sm text-surface-500">Create your first research project to start analyzing Petri dish photographs.</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
              + Create Project
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(''); setNewName(''); setNewDesc('') }}
        title="Create New Research Project"
        size="md"
        className="max-w-[460px]"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowCreate(false); setCreateError(''); setNewName(''); setNewDesc('') }}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} className="bg-[#0B1F3A] hover:bg-[#071527] text-white font-semibold">Create Project</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g., Antimicrobial Efficacy of Plant Extracts"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); if (createError) setCreateError(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              }
            }}
            error={createError}
            autoFocus
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700">Description (optional)</label>
            <textarea
              placeholder="Brief description of the research objectives..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-lg border border-surface-300 text-sm bg-white text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150 resize-none"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
