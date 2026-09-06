/**
 * Acuity — Student Projects Page
 *
 * Displays research projects created and managed by the student research group.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useToastStore } from '@/store/useToastStore'

const MOCK_PROJECTS = [
  {
    id: 'proj-01',
    title: 'Antimicrobial Efficacy of Psidium guajava Extracts',
    organism: 'Staphylococcus aureus',
    adviser: 'Dr. Maria Santos',
    platesCount: 12,
    lastUpdated: 'Aug 29, 2026',
    status: 'In Progress',
  },
  {
    id: 'proj-02',
    title: 'Enumeration of Coliforms in Watershed Samples',
    organism: 'Escherichia coli',
    adviser: 'Dr. Maria Santos',
    platesCount: 8,
    lastUpdated: 'Aug 22, 2026',
    status: 'Adviser Review',
  },
  {
    id: 'proj-03',
    title: 'Bacterial Inhibition Zone & CFU Viability Assay',
    organism: 'Pseudomonas aeruginosa',
    adviser: 'Prof. J. Dela Cruz',
    platesCount: 15,
    lastUpdated: 'Aug 14, 2026',
    status: 'Validated',
  },
]

export default function ProjectsPage() {
  const [projects] = useState(MOCK_PROJECTS)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="My Projects"
          subtitle="Manage active research projects, invite lab members, and track trial batches."
        />
        <Button
          type="button"
          variant="primary"
          onClick={() => useToastStore.getState().addToast('New Research Project modal placeholder.')}
        >
          + New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                {project.organism}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  project.status === 'Validated'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : project.status === 'Adviser Review'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-surface-100 text-surface-700'
                }`}
              >
                {project.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-surface-900 mb-2 leading-snug">
              {project.title}
            </h3>

            <div className="space-y-1 text-xs text-surface-500 mb-4">
              <div>Adviser: <span className="font-semibold text-surface-700">{project.adviser}</span></div>
              <div>Plates Analyzed: <span className="font-semibold text-surface-700">{project.platesCount} Petri dishes</span></div>
              <div>Last Activity: {project.lastUpdated}</div>
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end">
              <Link
                to={`/student/projects/${project.id}/workspace/plate-01`}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
              >
                Open Workspace →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
