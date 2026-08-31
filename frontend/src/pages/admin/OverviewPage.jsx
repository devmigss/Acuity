/**
 * Acuity — System Administrator Overview Page
 *
 * Platform administration dashboard monitoring multi-tenant institutions,
 * user cohorts, AI inference microservice health, and DynamoDB audit trails.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration Overview"
        subtitle="Monitor multi-tenant academic cohorts, AI inference queue health, and platform audit trails."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Active Tenants
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            3 <span className="text-sm font-semibold text-primary-600">Institutions</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">UST CICS, UST Bio, DLSU Bio</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Registered Users
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            48 <span className="text-sm font-semibold text-surface-500">Users</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">38 Students · 8 Faculty · 2 Admins</p>
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

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Storage (AWS S3)
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            1.4 <span className="text-sm font-semibold text-surface-500">GB</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Presigned direct-upload isolation</p>
        </div>
      </div>

      {/* Platform System Health Summary */}
      <Card title="System Services & Health Check" subtitle="Status of core microservices, databases, and authentication endpoints.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-surface-900">PostgreSQL (Amazon RDS)</div>
              <div className="text-xs text-surface-500">Multi-tenant Row-Level Security</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Healthy
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-surface-900">AI Microservice (FastAPI + OpenCV)</div>
              <div className="text-xs text-surface-500">SOD-YOLOv8 Object Detection Engine</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Healthy
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-surface-900">Amazon DynamoDB</div>
              <div className="text-xs text-surface-500">Audit Trail & Timestamped Event Stream</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Healthy
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-surface-900">Redis Task Queue</div>
              <div className="text-xs text-surface-500">Background Image Processing Broker</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Healthy
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
