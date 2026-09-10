/**
 * Acuity — System Administrator Overview Page
 *
 * Platform administration dashboard monitoring multi-tenant institutions,
 * user directory counts, faculty pre-approval roster, AI inference microservice health,
 * and recent administrative audit events.
 */

import { useState, useMemo } from 'react'
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

      {/* ── Platform Security & Resource Telemetry (Visual Analytics) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-surface-900 tracking-tight">
                Platform Security &amp; Resource Telemetry
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Prototype Mock Telemetry
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Frontend prototype visualization of authentication, storage, and AI processing metrics.
            </p>
          </div>
          <span className="text-[11px] font-mono text-surface-400">
            Simulated 7-Day Window
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Failed Authentication Attempts (Last 7 Days) */}
          <div className="lg:col-span-7">
            <Card
              title="Failed Authentication Attempts (Last 7 Days)"
              subtitle="Monitors anomaly spikes and rate limiting triggers across student and faculty sign-in gateways."
            >
              <div className="pt-2">
                <div className="h-64 w-full">
                  <Line
                    data={{
                      labels: ['Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8', 'Sep 9', 'Sep 10'],
                      datasets: [
                        {
                          label: 'Failed Login Attempts',
                          data: [3, 5, 2, 8, 4, 11, 2],
                          borderColor: 'rgb(225, 29, 72)',
                          backgroundColor: 'rgba(225, 29, 72, 0.08)',
                          fill: true,
                          tension: 0.35,
                          pointBackgroundColor: 'rgb(225, 29, 72)',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 2,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: '#0B1F3A',
                          titleFont: { size: 11, weight: 'bold' },
                          bodyFont: { size: 11 },
                          padding: 10,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context) => ` ${context.parsed.y} failed attempts`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: { size: 11 },
                            color: '#64748B',
                          },
                        },
                        y: {
                          beginAtZero: true,
                          suggestedMax: 14,
                          grid: {
                            color: 'rgba(226, 232, 240, 0.7)',
                          },
                          ticks: {
                            font: { size: 11 },
                            color: '#64748B',
                            stepSize: 2,
                          },
                        },
                      },
                    }}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-surface-100 flex flex-wrap items-center justify-between gap-2 text-xs text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Peak: <strong>11 attempts</strong> on Sep 9 (Rate limited automatically)</span>
                  </div>
                  <span className="font-mono text-[11px] text-surface-400">AWS Cognito Mock Stream</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart 2: Cloud Storage Allocation by Tenant */}
          <div className="lg:col-span-5">
            <Card
              title="Cloud Storage Allocation by Tenant"
              subtitle="Aggregate Amazon S3 petri dish plate image allocation across active cohorts."
            >
              <div className="pt-2">
                <div className="h-52 w-full relative flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: ['UST CICS', 'UST Biology', 'DLSU Biology'],
                      datasets: [
                        {
                          data: [3.2, 2.1, 0.9],
                          backgroundColor: ['#0B1F3A', '#1E40AF', '#F59E0B'],
                          borderWidth: 2,
                          borderColor: '#ffffff',
                          hoverOffset: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '72%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            font: { size: 11, weight: '500' },
                            color: '#334155',
                            padding: 14,
                          },
                        },
                        tooltip: {
                          backgroundColor: '#0B1F3A',
                          titleFont: { size: 11, weight: 'bold' },
                          bodyFont: { size: 11 },
                          padding: 10,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context) => ` ${context.label}: ${context.parsed} GB`,
                          },
                        },
                      },
                    }}
                  />

                  {/* Center Total Callout Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-xl font-extrabold text-[#0B1F3A] tracking-tight">6.2 GB</span>
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
                  <span>UST CICS: <strong>3.2 GB</strong> · Biology: <strong>2.1 GB</strong></span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    Quota: 24.8% Used
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Recent Admin Activity & Health Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Admin Activity Log (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Recent Administration Events"
            subtitle="Recent user lifecycle and faculty whitelist actions executed by administrators."
          >
            <div className="space-y-3">
              {activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-surface-50/70 border border-surface-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-surface-900">{act.actor}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-200 text-surface-700">
                        {act.action}
                      </span>
                    </div>
                    <p className="text-surface-600">{act.details}</p>
                  </div>
                  <span className="text-[11px] text-surface-400 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex justify-between items-center text-xs">
              <span className="text-surface-400">Showing latest administrative events</span>
              <Link
                to={ROUTES.ADMIN.USERS_TENANTS}
                className="font-semibold text-primary-700 hover:text-primary-900 hover:underline"
              >
                Go to User Directory →
              </Link>
            </div>
          </Card>
        </div>

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
      </div>

      {/* ── Modal: Add User Quick Action ── */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  )
}
