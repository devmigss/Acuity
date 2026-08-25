/**
 * Acuity — Annotation Page (placeholder)
 * REQ: Section 14
 *
 * This page will host the full annotation workspace:
 * canvas, toolbar, side panels, confidence slider, etc.
 */

import { useParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

export default function AnnotationPage() {
  const { projectId } = useParams()

  return (
    <div>
      <PageHeader
        title="Annotation Workspace"
        subtitle={`Annotating project ${projectId}`}
      />
      <p className="text-sm text-surface-500">
        Annotation canvas will be implemented in Phase 4.
      </p>
    </div>
  )
}
