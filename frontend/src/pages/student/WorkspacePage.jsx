/**
 * Acuity — Workspace Page (placeholder)
 * Handles upload + AI processing status within a project.
 * REQ: Section 12, 13
 */

import { useParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

export default function WorkspacePage() {
  const { projectId } = useParams()

  return (
    <div>
      <PageHeader
        title="Workspace"
        subtitle={`Upload and processing for project ${projectId}`}
      />
      <p className="text-sm text-surface-500">
        Upload and processing UI will be implemented in Phase 3.
      </p>
    </div>
  )
}
