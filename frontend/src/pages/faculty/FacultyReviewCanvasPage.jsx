/**
 * Acuity — Faculty Annotation Canvas Page (Review & Archive)
 *
 * Route: /faculty/review/:projectId/plate/:plateId
 *
 * Delegates to the unified PlateAnnotationWorkspace component with mode:
 * - 'faculty_archive' if inspecting an archived/validated record (?from=archive or Validated status)
 * - 'faculty_review' for active submissions (allows spatial remarks, strictly read-only colony geometry)
 */

import { useParams, useLocation, useSearchParams } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import PlateAnnotationWorkspace from '@/components/annotation/PlateAnnotationWorkspace'

export default function FacultyReviewCanvasPage() {
  const { projectId, plateId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const project = useProjectStore((s) => s.getProject(projectId))
  const isFromArchive = searchParams.get('from') === 'archive' || location.state?.fromArchive || project?.status === 'Validated'

  const mode = isFromArchive ? 'faculty_archive' : 'faculty_review'
  const returnPath = isFromArchive ? `/faculty/archive/${projectId}` : `/faculty/review/${projectId}`
  const returnLabel = isFromArchive ? 'Back to Archived Record' : 'Back to Review Screen'

  return (
    <PlateAnnotationWorkspace
      mode={mode}
      projectId={projectId}
      plateId={plateId}
      returnPath={returnPath}
      returnLabel={returnLabel}
    />
  )
}
