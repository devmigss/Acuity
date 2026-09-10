/**
 * Acuity — Student Annotation Workspace Page
 *
 * Route: /student/projects/:projectId/annotate/:plateId
 *
 * Delegates to the unified PlateAnnotationWorkspace component with mode:
 * - 'student_locked' if the project is Validated / Data Frozen
 * - 'student_edit' otherwise (interactive editing, moving, resizing, deleting, saving, submitting)
 */

import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import PlateAnnotationWorkspace from '@/components/annotation/PlateAnnotationWorkspace'

export default function AnnotationWorkspace() {
  const { projectId, plateId } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const fromTab = searchParams.get('fromTab') || location.state?.fromTab || 'plates'
  const returnTabLabel = fromTab === 'data' ? 'Data' : 'Plates / Images'
  const returnPath = `/student/projects/${projectId}?tab=${fromTab}`
  const returnLabel = `Back to ${returnTabLabel}`

  const projects = useProjectStore((s) => s.projects)
  const project = projects.find((p) => p.id === projectId)

  // Determine mode: Validated projects enforce Data Freeze
  const isLocked = project?.status === 'Validated'
  const mode = isLocked ? 'student_locked' : 'student_edit'

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
