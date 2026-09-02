/**
 * Acuity — System Administrator Content Management Page
 *
 * Manage platform notices, institution banner announcements, and public copy.
 */

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ContentManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Content Management"
          subtitle="Publish global platform notices, scheduled maintenance alerts, and institutional banners."
        />
        <Button
          type="button"
          variant="primary"
          onClick={() => alert('New Notice broadcast placeholder')}
        >
          + Publish Platform Notice
        </Button>
      </div>

      <Card title="Active System Announcements" subtitle="Notices displayed on user login and dashboard headers.">
        <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-primary-900">Scheduled Server Optimization</div>
            <p className="text-xs text-primary-700 mt-1">
              Backend AI inference queue updates scheduled for Saturday, 02:00 AM UTC. Direct-to-S3 uploads will remain unaffected.
            </p>
            <span className="inline-block text-[11px] text-primary-500 mt-2">Active until Sept 5, 2026</span>
          </div>
          <button
            type="button"
            onClick={() => alert('Editing notice')}
            className="text-xs font-semibold text-primary-700 hover:text-primary-900 underline shrink-0 cursor-pointer"
          >
            Edit
          </button>
        </div>
      </Card>
    </div>
  )
}
