/**
 * Acuity — System Administrator Users & Tenants Page
 *
 * Provides:
 * 1. Platform Users Directory: Searchable and filterable roster of registered users
 *    with role assignment and account lifecycle management (lock/deactivate, reactivate, delete).
 * 2. Faculty Whitelist: Pre-approved faculty roster with institutional tenant affiliations,
 *    invitation resending, and revocation workflows.
 */

import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ROLES } from '@/constants/roles'
import { useAdminStore } from '@/stores/useAdminStore'
import { useAuth } from '@/context/AuthContext'
import { useToastStore } from '@/store/useToastStore'

import UserManagementModal from '@/components/admin/UserManagementModal'
import AddUserModal from '@/components/admin/AddUserModal'
import WhitelistFacultyModal from '@/components/admin/WhitelistFacultyModal'

export default function UsersTenantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'whitelist' ? 'whitelist' : 'users'

  const setActiveTab = (tab) => {
    setSearchParams({ tab })
  }

  const { user: currentAuthUser } = useAuth()
  const users = useAdminStore((s) => s.users)
  const facultyWhitelist = useAdminStore((s) => s.facultyWhitelist)
  const resendWhitelistInvitation = useAdminStore((s) => s.resendWhitelistInvitation)
  const revokeWhitelistEntry = useAdminStore((s) => s.revokeWhitelistEntry)
  const addToast = useToastStore((s) => s.addToast)

  // ── Modals State ──
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false)
  const [editingWhitelistEntry, setEditingWhitelistEntry] = useState(null)
  const [managingUser, setManagingUser] = useState(null)
  const [revokingEntry, setRevokingEntry] = useState(null)

  // ── Filters: Users Directory ──
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')
  const [userStatusFilter, setUserStatusFilter] = useState('ALL')

  // ── Filters: Faculty Whitelist ──
  const [whitelistSearch, setWhitelistSearch] = useState('')
  const [whitelistStatusFilter, setWhitelistStatusFilter] = useState('ALL')

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim()
    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.institution && u.institution.toLowerCase().includes(q))

      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter
      const matchStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter

      return matchSearch && matchRole && matchStatus
    })
  }, [users, userSearch, userRoleFilter, userStatusFilter])

  // Filtered Whitelist
  const filteredWhitelist = useMemo(() => {
    const q = whitelistSearch.toLowerCase().trim()
    return facultyWhitelist.filter((wl) => {
      const matchSearch =
        !q ||
        wl.email.toLowerCase().includes(q) ||
        (wl.institution && wl.institution.toLowerCase().includes(q)) ||
        (wl.department && wl.department.toLowerCase().includes(q))

      const matchStatus = whitelistStatusFilter === 'ALL' || wl.status === whitelistStatusFilter

      return matchSearch && matchStatus
    })
  }, [facultyWhitelist, whitelistSearch, whitelistStatusFilter])

  const handleResendInvite = (entry) => {
    resendWhitelistInvitation(entry.id)
    addToast(`Invitation email sent to ${entry.email}.`, 'success')
  }

  const handleConfirmRevoke = () => {
    if (!revokingEntry) return
    revokeWhitelistEntry(revokingEntry.id)
    addToast(`Revoked faculty authorization for ${revokingEntry.email}`, 'info')
    setRevokingEntry(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header & Quick Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-200">
        <PageHeader
          title="Users & Tenants"
          subtitle="Manage multi-tenant academic institutions, approved faculty rosters, and user access roles."
        />
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingWhitelistEntry(null)
              setIsWhitelistModalOpen(true)
            }}
            className="text-xs font-semibold cursor-pointer gap-1.5"
          >
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            + Whitelist Faculty
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            className="bg-[#0B1F3A] hover:bg-[#071527] text-white text-xs font-semibold cursor-pointer gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
            </svg>
            + Add User
          </Button>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-4 border-b border-surface-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-[#0B1F3A] text-[#0B1F3A]'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          <span>Platform Users Directory</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'users'
              ? 'bg-[#0B1F3A] text-white'
              : 'bg-surface-100 text-surface-600'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whitelist')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'whitelist'
              ? 'border-[#0B1F3A] text-[#0B1F3A]'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          <span>Faculty Whitelist</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'whitelist'
              ? 'bg-[#0B1F3A] text-white'
              : 'bg-surface-100 text-surface-600'
          }`}>
            {facultyWhitelist.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: Platform Users Directory ── */}
      {activeTab === 'users' && (
        <Card
          title="Registered Platform Users"
          subtitle="Search, filter, and manage platform roles and account access permissions."
        >
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or institution..."
                  className="w-full py-2 pl-9 pr-3 rounded-lg border border-surface-300 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <svg className="w-4 h-4 text-surface-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-surface-300 text-xs text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value={ROLES.STUDENT}>Students</option>
                  <option value={ROLES.FACULTY}>Faculty Advisers</option>
                  <option value={ROLES.SYSTEMADMIN}>System Admins</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-surface-300 text-xs text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Deactivated">Deactivated Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-surface-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5">Name</th>
                    <th className="py-3 px-3.5">Email</th>
                    <th className="py-3 px-3.5">Role</th>
                    <th className="py-3 px-3.5">Academic Tenant / Institution</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-surface-400 italic">
                        No users found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isDeactivated = u.status === 'Deactivated'
                      return (
                        <tr key={u.id} className="hover:bg-surface-50/70 transition-colors">
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#0B1F3A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                {u.name ? u.name[0].toUpperCase() : 'U'}
                              </div>
                              <span className="font-semibold text-surface-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-surface-600 font-mono">{u.email}</td>
                          <td className="py-3 px-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                              u.role === ROLES.SYSTEMADMIN
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === ROLES.FACULTY
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-primary-50 text-primary-700 border-primary-200'
                            }`}>
                              {u.roleLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-surface-600 max-w-xs truncate" title={u.institution}>
                            {u.institution}
                          </td>
                          <td className="py-3 px-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isDeactivated
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isDeactivated ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              {isDeactivated ? 'Deactivated' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setManagingUser(u)}
                              className="text-xs font-semibold text-primary-700 hover:text-primary-900 underline cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-surface-500 pt-1">
              <span>Showing {filteredUsers.length} of {users.length} registered users</span>
              <span>Protected by PostgreSQL Row-Level Security</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── TAB 2: Faculty Whitelist ── */}
      {activeTab === 'whitelist' && (
        <Card
          title="Faculty Whitelist & Institutional Authorization"
          subtitle="Pre-approved roster of authorized academic advisers permitted to validate thesis datasets."
        >
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <input
                  type="text"
                  value={whitelistSearch}
                  onChange={(e) => setWhitelistSearch(e.target.value)}
                  placeholder="Search whitelist by email, institution, or department..."
                  className="w-full py-2 pl-9 pr-3 rounded-lg border border-surface-300 text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <svg className="w-4 h-4 text-surface-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={whitelistStatusFilter}
                  onChange={(e) => setWhitelistStatusFilter(e.target.value)}
                  className="py-1.5 px-2.5 rounded-lg border border-surface-300 text-xs text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="ALL">All Whitelist Statuses</option>
                  <option value="Claimed">Claimed / Registered</option>
                  <option value="Invitation Sent">Invitation Sent</option>
                </select>
              </div>
            </div>

            {/* Whitelist Table */}
            <div className="overflow-x-auto border border-surface-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5">Faculty Email</th>
                    <th className="py-3 px-3.5">Academic Tenant / Institution</th>
                    <th className="py-3 px-3.5">Department / Lab</th>
                    <th className="py-3 px-3.5">Whitelist Status</th>
                    <th className="py-3 px-3.5">Authorized Date</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredWhitelist.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-surface-400 italic">
                        No faculty whitelist entries match the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWhitelist.map((entry) => {
                      const isClaimed = entry.status === 'Claimed'
                      return (
                        <tr key={entry.id} className="hover:bg-surface-50/70 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-semibold text-surface-900">
                            {entry.email}
                          </td>
                          <td className="py-3 px-3.5 text-surface-700 font-medium">
                            {entry.institution}
                          </td>
                          <td className="py-3 px-3.5 text-surface-500 max-w-xs truncate" title={entry.department}>
                            {entry.department}
                          </td>
                          <td className="py-3 px-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isClaimed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isClaimed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {isClaimed ? 'Claimed · Registered' : 'Invitation Sent'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-surface-500">
                            {new Date(entry.invitedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isClaimed && (
                                <button
                                  type="button"
                                  onClick={() => handleResendInvite(entry)}
                                  className="text-[11px] font-semibold text-primary-700 hover:text-primary-900 hover:underline cursor-pointer"
                                  title="Resend invitation email to faculty member"
                                >
                                  Resend
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingWhitelistEntry(entry)
                                  setIsWhitelistModalOpen(true)
                                }}
                                className="text-[11px] font-semibold text-surface-600 hover:text-surface-900 hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setRevokingEntry(entry)}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div className="text-[11px] leading-relaxed">
                <strong className="font-semibold text-surface-800">Faculty Whitelist Security Policy:</strong> The whitelist pre-approves faculty emails on a per-institution basis.
                When a user registers or signs in with an authorized email, Acuity binds their account to the Faculty Adviser role.
                Revoking an entry prevents future faculty authorizations.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Modal: User Management ── */}
      {managingUser && (
        <UserManagementModal
          key={managingUser.id}
          isOpen={Boolean(managingUser)}
          onClose={() => setManagingUser(null)}
          user={managingUser}
          currentAdminEmail={currentAuthUser?.email || 'admin@acuity.app'}
        />
      )}

      {/* ── Modal: Add User ── */}
      {isAddUserOpen && (
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
        />
      )}

      {/* ── Modal: Whitelist Faculty ── */}
      {isWhitelistModalOpen && (
        <WhitelistFacultyModal
          key={editingWhitelistEntry ? editingWhitelistEntry.id : 'new-whitelist'}
          isOpen={isWhitelistModalOpen}
          onClose={() => {
            setIsWhitelistModalOpen(false)
            setEditingWhitelistEntry(null)
          }}
          initialEntry={editingWhitelistEntry}
        />
      )}

      {/* ── Modal: Revoke Whitelist Confirmation ── */}
      {revokingEntry && (
        <Modal
          isOpen={Boolean(revokingEntry)}
          onClose={() => setRevokingEntry(null)}
          title="Revoke Faculty Authorization"
          size="sm"
        >
          <div className="p-6 space-y-4">
            <p className="text-xs text-surface-600 leading-relaxed">
              Are you sure you want to revoke whitelist authorization for{' '}
              <strong className="text-surface-900 font-mono">{revokingEntry.email}</strong> at{' '}
              <strong>{revokingEntry.institution}</strong>?
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Warning: Revoking this authorization will prevent this email from being recognized as an authorized faculty adviser.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRevokingEntry(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmRevoke}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Revoke
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
