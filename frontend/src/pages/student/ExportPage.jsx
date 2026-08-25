/**
 * Acuity — Export Page (placeholder)
 * REQ: Section 20
 */

import { useParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

export default function ExportPage() {
  const { projectId } = useParams()

  return (
    <div>
      <PageHeader
        title="Export Data"
        subtitle={`Export data for project ${projectId}`}
      />
      <p className="text-sm text-surface-500">
        CSV/PDF export UI will be implemented in Phase 6.
      </p>
    </div>
  )
}
