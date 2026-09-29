/**
 * Acuity — System Administrator Overview Page
 *
 * Platform administration dashboard monitoring multi-tenant institutions,
 * user directory counts, faculty pre-approval roster, AI inference microservice health,
 * and recent administrative audit events.
 */

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/routes/routeConstants'
import { ROLES } from '@/constants/roles'
import { useAdminStore } from '@/stores/useAdminStore'
import AddUserModal from '@/components/admin/AddUserModal'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminOverviewPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const users = useAdminStore((s) => s.users)
  const facultyWhitelist = useAdminStore((s) => s.facultyWhitelist)
  const activities = useAdminStore((s) => s.adminActivities)
  const fetchUsers = useAdminStore((s) => s.fetchUsers)
  const fetchWhitelist = useAdminStore((s) => s.fetchWhitelist)

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
  }, [fetchUsers, fetchWhitelist]);

  const stats = useMemo(() => {
    const institutions = new Set(users.map((u) => u.institution).filter(Boolean))
    facultyWhitelist.forEach((wl) => {
      if (wl.institution) institutions.add(wl.institution)
    })

    return {
      totalUsers: users.length,
      studentCount: users.filter((u) => u.role === ROLES.STUDENT).length,
      facultyCount: users.filter((u) => u.role === ROLES.FACULTY).length,
      adminCount: users.filter((u) => u.role === ROLES.SYSTEMADMIN || u.role === ROLES.ADMIN).length,
      activeUsers: users.filter((u) => u.status === 'Active').length,
      deactivatedUsers: users.filter((u) => u.status === 'Deactivated').length,
      totalWhitelisted: facultyWhitelist.length,
      claimedWhitelisted: facultyWhitelist.filter((w) => w.status === 'Claimed').length,
      pendingWhitelisted: facultyWhitelist.filter((w) => w.status === 'Invitation Sent').length,
      activeTenantsCount: institutions.size,
    }
  }, [users, facultyWhitelist])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header Bar with + Add User Quick Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-200">
        <PageHeader
          title="System Administration Overview"
          subtitle="Monitor multi-tenant academic cohorts, user directory health, and platform administration workflows."
        />
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to={ROUTES.ADMIN.USERS_TENANTS}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-xs font-semibold cursor-pointer"
            >
              Manage Users & Whitelist →
            </Button>
          </Link>

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

      {/* ── Metric Cards (connected to live useAdminStore) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Active Academic Tenants
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {stats.activeTenantsCount} <span className="text-sm font-semibold text-primary-600">Institutions</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">UST, DLSU, UP Manila</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Registered Platform Users
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {stats.totalUsers} <span className="text-sm font-semibold text-surface-500">Users</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">
            {stats.studentCount} Students · {stats.facultyCount} Faculty · {stats.adminCount} Admins
          </p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Faculty Whitelist
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {stats.totalWhitelisted} <span className="text-sm font-semibold text-emerald-600">Pre-approved</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">
            {stats.claimedWhitelisted} Registered · {stats.pendingWhitelisted} Pending Invite
          </p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            SOD-YOLOv8 Inference
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            Operational
          </div>
          <p className="mt-2 text-xs text-surface-500">FastAPI / Redis Queue latency: 120ms</p>
        </div>
      </div>

      {/* ── Platform Health Summary ── */}

        {/* Platform Health Summary (Right 1 col) */}
        <div className="space-y-4">
          <Card
            title="Core Service Status"
            subtitle="Microservice & database health."
          >
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-surface-900">PostgreSQL (Amazon RDS)</div>
                  <div className="text-[11px] text-surface-500">Row-Level Security Active</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Healthy
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-surface-900">AI Microservice</div>
                  <div className="text-[11px] text-surface-500">SOD-YOLOv8 Engine</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Healthy
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-surface-900">Amazon DynamoDB</div>
                  <div className="text-[11px] text-surface-500">Audit Trail Stream</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Healthy
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-surface-900">Redis Task Queue</div>
                  <div className="text-[11px] text-surface-500">Image Processing Broker</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Healthy
                </span>
              </div>
            </div>
          </Card>
        </div>

      {/* ── Modal: Add User Quick Action ── */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  )
}
