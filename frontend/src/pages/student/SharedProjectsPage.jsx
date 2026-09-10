/**
 * Acuity — Student Shared Projects Page
 *
 * Displays collaborative research projects shared by peer student groups.
 * Reads from the centralized useProjectStore — shows projects where the
 * current user is a member but NOT the owner.
 *
 * Supports accepting/declining pending invitations.
 */

import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProjectStore, INVITATION_STATUS } from '@/stores/useProjectStore'
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

export default function SharedProjectsPage() {
  const { user } = useAuth()

  const projects = useProjectStore((s) => s.projects)
  const members = useProjectStore((s) => s.members)
  const allInvitations = useProjectStore((s) => s.invitations)
  const acceptInvitation = useProjectStore((s) => s.acceptInvitation)
  const declineInvitation = useProjectStore((s) => s.declineInvitation)

  const userId = user?.id

  const sharedProjects = useMemo(() => {
    const memberProjectIds = members
      .filter((m) => m.userId === userId)
      .map((m) => m.projectId)
    return projects.filter(
      (p) => memberProjectIds.includes(p.id) && p.ownerId !== userId
    )
  }, [projects, members, userId])

  // Pending invitations for this user (by email)
  const pendingInvitations = useMemo(() => {
    const email = user?.email?.toLowerCase()
    if (!email) return []
    return allInvitations.filter(
      (i) => i.inviteeEmail.toLowerCase() === email && i.status === INVITATION_STATUS.PENDING
    )
  }, [allInvitations, user?.email])

  const handleAccept = useCallback((invId) => {
    acceptInvitation(invId, user)
    useToastStore.getState().addToast('Invitation accepted! The project is now available below.', 'success')
  }, [acceptInvitation, user])

  const handleDecline = useCallback((invId) => {
    declineInvitation(invId)
    useToastStore.getState().addToast('Invitation declined.', 'info')
  }, [declineInvitation])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared with Me"
        subtitle="Collaborate on research trials and datasets shared across student laboratory cohorts."
      />

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card title="Pending Invitations" subtitle={`${pendingInvitations.length} invitation(s) awaiting your response`}>
          <div className="space-y-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/30">
                <div>
                  <h4 className="text-sm font-semibold text-surface-900">{inv.projectName}</h4>
                  <p className="text-xs text-surface-500">
                    Invited by <span className="font-semibold text-primary-700">{inv.inviterName}</span> · {formatDate(inv.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleAccept(inv.id)}>Accept</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDecline(inv.id)}>Decline</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Shared Projects */}
      {sharedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sharedProjects.map((project) => {
            const stats = useProjectStore.getState().getProjectStats(project.id)
            const membership = useProjectStore.getState().members.find(
              (m) => m.projectId === project.id && m.userId === user?.id
            )
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-700">
                    {membership?.role || 'Collaborator'}
                  </span>
                  <span className="text-xs text-surface-400">
                    Joined {formatDate(membership?.joinedAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-surface-900 mb-2">
                  {project.name}
                </h3>
                <div className="space-y-1 text-xs text-surface-500 mb-4">
                  <p>
                    Owner: <span className="font-semibold text-surface-700">{project.ownerName}</span>
                  </p>
                  <p>
                    {stats.totalPlates} Plates · {stats.memberCount} Members
                  </p>
                  <p>Last Activity: {formatDate(project.updatedAt)}</p>
                </div>

                <div className="pt-3 border-t border-surface-100 flex justify-end">
                  <Link
                    to={`/student/projects/${project.id}`}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                  >
                    Open Shared Workspace →
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : pendingInvitations.length === 0 ? (
        <div className="flex items-center justify-center py-24 rounded-xl border border-dashed border-surface-300 bg-surface-50">
          <div className="text-center max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div className="text-base font-semibold text-surface-900">No Shared Projects</div>
            <p className="mt-1 text-sm text-surface-500">
              When other students invite you to collaborate on their projects, they will appear here.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
