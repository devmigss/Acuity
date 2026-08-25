/**
 * Acuity — Student Project Detail Page (placeholder)
 * REQ: Section 9
 */

import { useParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

export default function ProjectDetailPage() {
  const { projectId } = useParams()

  return (
    <div>
      <PageHeader
        title="Project Detail"
        subtitle={`Project ID: ${projectId}`}
      />
      <p className="text-sm text-surface-500">
        Project detail view will be implemented in Phase 3.
      </p>
    </div>
  )
}
