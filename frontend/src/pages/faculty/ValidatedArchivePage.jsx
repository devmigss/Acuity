/**
 * Acuity — Faculty Validated Archive Page
 *
 * Repository of faculty-approved research trials, finalized CFU enumerations,
 * and frozen statistical datasets. Connected to useProjectStore.
 */

import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ValidatedArchivePage() {
  const getValidatedProjects = useProjectStore((s) => s.getValidatedProjects)
  const getPlatesForProject = useProjectStore((s) => s.getPlatesForProject)
  const generateCSVData = useProjectStore((s) => s.generateCSVData)

  const validatedProjects = getValidatedProjects()

  const handleExportCSV = (project) => {
    const csvContent = generateCSVData(project.id)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_finalized_dataset.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Validated Archive"
        subtitle="Repository of faculty-approved research trials, finalized macroscopic CFU enumerations, and frozen statistical datasets."
      />

      {validatedProjects.length === 0 ? (
        <Card>
          <div className="py-12 text-center space-y-2">
            <h3 className="text-base font-bold text-surface-900">No Validated Projects Yet</h3>
            <p className="text-xs text-surface-500">
              When student project submissions are approved in the Review Queue, they are permanently frozen and archived here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {validatedProjects.map((project) => {
            const projectPlates = getPlatesForProject(project.id)
            const totalCFU = projectPlates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)

            return (
              <Card key={project.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Data Frozen · Ready for SPSS/R
                      </span>
                      <span className="text-xs text-surface-400">
                        Validated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <Link to={`/faculty/archive/${project.id}`} className="group">
                      <h3 className="text-base font-bold text-surface-900 group-hover:text-primary-700 transition-colors">
                        {project.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-surface-500">
                      Advisee Lead: <strong className="font-semibold text-surface-700">{project.ownerName}</strong> ·{' '}
                      {projectPlates.length} Plates ·{' '}
                      <strong className="text-primary-700 font-bold">{totalCFU} Total Verified CFUs</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
                    <Link to={`/faculty/archive/${project.id}`}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="font-medium cursor-pointer"
                      >
                        View Record
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleExportCSV(project)}
                      className="bg-[#0B1F3A] hover:bg-[#071527] text-white gap-2 font-semibold shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Export CSV
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
