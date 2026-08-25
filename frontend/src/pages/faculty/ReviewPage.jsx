/**
 * Acuity — Faculty Review Page (placeholder)
 * REQ: Section 17
 */

import { useParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

export default function ReviewPage() {
  const { projectId } = useParams()

  return (
    <div>
      <PageHeader
        title="Project Review"
        subtitle={`Reviewing project ${projectId}`}
      />
      <p className="text-sm text-surface-500">
        Faculty review workspace will be implemented in Phase 5.
      </p>
    </div>
  )
}
