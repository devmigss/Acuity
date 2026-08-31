/**
 * Acuity — System Administrator Users & Tenants Page
 *
 * Manage academic institutions, cohorts, and approved faculty/student rosters.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const MOCK_USERS = [
  {
    id: 'u-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@ust.edu.ph',
    role: 'Student',
    tenant: 'University of Santo Tomas',
    status: 'Active',
  },
  {
    id: 'u-2',
    name: 'Dr. Maria Santos',
    email: 'maria.santos@ust.edu.ph',
    role: 'Faculty',
    tenant: 'University of Santo Tomas',
    status: 'Active',
  },
  {
    id: 'u-3',
    name: 'Marcus Vance',
    email: 'admin@acuity.app',
    role: 'System Admin',
    tenant: 'UST · CICS',
    status: 'Active',
  },
]

export default function UsersTenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Users & Tenants"
          subtitle="Manage multi-tenant academic institutions, approved faculty rosters, and user access roles."
        />
        <Button
          type="button"
          variant="primary"
          onClick={() => alert('Invite User / Provision Tenant modal placeholder')}
        >
          + Provision User / Tenant
        </Button>
      </div>

      <Card title="Registered Platform Users" subtitle="Logical tenant isolation enforced by PostgreSQL Row-Level Security.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-surface-200 text-xs font-bold text-surface-500 uppercase tracking-wider">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Academic Tenant</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {MOCK_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50">
                  <td className="py-3 px-3 font-semibold text-surface-900">{u.name}</td>
                  <td className="py-3 px-3 text-surface-600">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-surface-600">{u.tenant}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Managing permissions for ${u.name}`)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
