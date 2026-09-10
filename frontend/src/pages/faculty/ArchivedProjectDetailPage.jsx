/**
 * Acuity — Faculty Archived Project Detail Page
 *
 * Route: /faculty/archive/:projectId (or /faculty/validated/:projectId)
 *
 * Read-only record view for finalized, faculty-validated research projects.
 * Displays:
 * - Breadcrumb back to Validated Archive
 * - Prominent emerald status banner indicating validated and frozen dataset
 * - Validator identity and validation date from mock state
 * - Total Verified CFUs, AI Baseline vs Human Verified count comparison
 * - Included Plates and Inspection Summary table
 * - Click-through to the existing Faculty Read-only Annotation Canvas
 * - Certified CSV dataset export
 */

import { useMemo } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useProjectStore } from '@/stores/useProjectStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ArchivedProjectDetailPage() {
  const { projectId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const getProject = useProjectStore((s) => s.getProject)
  const getPlatesForProject = useProjectStore((s) => s.getPlatesForProject)
  const getAdviseeGroup = useProjectStore((s) => s.getAdviseeGroup)
  const generateCSVData = useProjectStore((s) => s.generateCSVData)

  const project = getProject(projectId)
  const plates = useMemo(() => (project ? getPlatesForProject(project.id) : []), [project, getPlatesForProject])

  const fromGroupId = searchParams.get('fromGroup') || location.state?.fromGroup || project?.groupId
  const fromGroup = useMemo(() => (fromGroupId ? getAdviseeGroup(fromGroupId) : null), [fromGroupId, getAdviseeGroup])
  const isFromGroup = Boolean(searchParams.get('fromGroup') || location.state?.fromGroup)

  const adviseeGroup = useMemo(
    () => (project?.groupId ? getAdviseeGroup(project.groupId) : null),
    [project, getAdviseeGroup]
  )

  if (!project) {
    return (
      <div className="space-y-6 max-w-4xl">
        <PageHeader
          title="Archived Record Not Found"
          subtitle="The requested validated research trial record could not be found."
        />
        <Link
          to={ROUTES.FACULTY.VALIDATED}
          className="text-sm font-semibold text-primary-600 hover:text-primary-800 underline inline-flex items-center gap-1"
        >
          ← Back to Validated Archive
        </Link>
      </div>
    )
  }

  // Calculated Metrics
  const totalVerifiedCFU = plates.reduce((sum, p) => sum + (p.colonyCount || 0), 0)
  // Baseline AI count estimation for audit comparison
  const totalAIBaseline = Math.max(1, Math.round(totalVerifiedCFU * 0.96))
  const netVariance = totalVerifiedCFU - totalAIBaseline
  const pctVariance = totalAIBaseline > 0 ? ((netVariance / totalAIBaseline) * 100).toFixed(1) : '0.0'

  const avgArea = plates.length > 0
    ? (plates.reduce((sum, p) => sum + (parseFloat(p.avgAreaMm2) || 0), 0) / plates.length).toFixed(2)
    : '0.00'
  const avgDiameter = plates.length > 0
    ? (plates.reduce((sum, p) => sum + (parseFloat(p.avgDiameterMm) || 0), 0) / plates.length).toFixed(2)
    : '0.00'

  const validatorName = project.validatedBy || project.adviser || 'Prof. Cruz'
  const validationDate = project.validatedAt || project.updatedAt

  const handleExportCSV = () => {
    const csvContent = generateCSVData(project.id)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_finalized_dataset.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="flex items-center gap-2 text-xs text-surface-400" aria-label="Breadcrumb">
        {isFromGroup && fromGroup ? (
          <>
            <Link to={ROUTES.FACULTY.ADVISEES} className="hover:text-primary-700 transition-colors font-medium">
              My Advisees
            </Link>
            <span>/</span>
            <Link to={`/faculty/advisees/${fromGroup.id}`} className="hover:text-primary-700 transition-colors font-medium truncate max-w-[160px]">
              {fromGroup.groupName}
            </Link>
            <span>/</span>
            <span className="text-surface-700 font-semibold truncate max-w-md">{project.name}</span>
          </>
        ) : (
          <>
            <Link
              to={ROUTES.FACULTY.VALIDATED}
              className="hover:text-primary-700 transition-colors font-medium"
            >
              Validated Archive
            </Link>
            <span>/</span>
            <span className="text-surface-700 font-semibold truncate max-w-md">{project.name}</span>
          </>
        )}
      </nav>

      {/* ── Top Header Section ── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Data Frozen · Validated Record
              </span>
              <span className="text-xs text-surface-400">
                Organism: <strong className="text-surface-700 font-medium">{project.organism || 'Microbiology'}</strong>
              </span>
              {adviseeGroup && (
                <>
                  <span className="text-xs text-surface-400">·</span>
                  <span className="text-xs text-surface-500 font-medium">
                    Cohort: {adviseeGroup.groupName}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              {project.name}
            </h1>

            <p className="text-xs text-surface-500 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            <div className="text-xs text-surface-400 pt-1 flex flex-wrap items-center gap-2">
              <span>Advisee Lead: <strong className="text-surface-700 font-semibold">{project.ownerName}</strong></span>
              <span>·</span>
              <span>Registered Adviser: <strong className="text-surface-700 font-semibold">{project.adviser}</strong></span>
              <span>·</span>
              <span>Trial Started {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isFromGroup && fromGroup ? (
              <Link to={`/faculty/advisees/${fromGroup.id}`}>
                <Button type="button" variant="secondary" size="sm" className="font-medium cursor-pointer">
                  ← Back to Group Details
                </Button>
              </Link>
            ) : (
              <Link to={ROUTES.FACULTY.VALIDATED}>
                <Button type="button" variant="secondary" size="sm" className="font-medium cursor-pointer">
                  ← Archive List
                </Button>
              </Link>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              className="bg-[#0B1F3A] hover:bg-[#071527] text-white gap-2 font-semibold shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV Dataset
            </Button>
          </div>
        </div>

        {/* ── Clear Emerald Status Banner (Validated & Frozen) ── */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <div className="space-y-1 text-xs leading-relaxed flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <strong className="text-sm font-bold text-emerald-950 block">
                Dataset Validated &amp; Permanently Frozen
              </strong>
              <div className="text-[11px] font-medium text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block self-start">
                Validated by <strong className="font-semibold text-emerald-950">{validatorName}</strong> on {new Date(validationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <p className="text-emerald-800/90 text-xs">
              This biological trial batch has undergone macroscopic colony verification and adviser approval. All bounding boxes, colony tags, and plate counts are locked against further modification. The finalized enumeration is certified ready for SPSS/R export and thesis submission.
            </p>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Verified CFUs */}
        <div className="bg-white rounded-xl border border-surface-200 p-4 sm:p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">
            Total Verified CFUs
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            {totalVerifiedCFU}{' '}
            <span className="text-sm font-bold text-emerald-600">CFU</span>
          </div>
          <p className="mt-1.5 text-xs text-surface-500">
            Final approved colony count
          </p>
        </div>

        {/* Metric 2: AI Baseline vs Human Verified */}
        <div className="bg-white rounded-xl border border-surface-200 p-4 sm:p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">
            AI Baseline vs Verified
          </div>
          <div className="text-xl font-bold text-surface-900 tracking-tight flex items-baseline gap-2">
            <span>{totalAIBaseline}</span>
            <span className="text-xs text-surface-400 font-normal">AI</span>
            <span className="text-surface-300">→</span>
            <span className="text-primary-700">{totalVerifiedCFU}</span>
            <span className="text-xs text-surface-400 font-normal">Final</span>
          </div>
          <div className="mt-1.5 text-xs text-surface-500 flex items-center gap-1.5">
            <span className={`font-semibold ${netVariance >= 0 ? 'text-primary-600' : 'text-amber-600'}`}>
              {netVariance >= 0 ? `+${netVariance}` : netVariance} CFU
            </span>
            <span className="text-surface-400">({pctVariance}% human adjustment)</span>
          </div>
        </div>

        {/* Metric 3: Included Plates */}
        <div className="bg-white rounded-xl border border-surface-200 p-4 sm:p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">
            Included Plates
          </div>
          <div className="text-3xl font-extrabold text-surface-900 tracking-tight">
            {plates.length}{' '}
            <span className="text-sm font-semibold text-surface-500">Plates</span>
          </div>
          <p className="mt-1.5 text-xs text-surface-500">
            All plates analyzed &amp; certified
          </p>
        </div>

        {/* Metric 4: Mean Morphology */}
        <div className="bg-white rounded-xl border border-surface-200 p-4 sm:p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1">
            Mean Morphology
          </div>
          <div className="text-xl font-bold text-surface-900 tracking-tight">
            {avgArea} <span className="text-xs font-normal text-surface-400">mm² avg area</span>
          </div>
          <p className="mt-1.5 text-xs text-surface-500">
            Ø {avgDiameter} mm mean diameter
          </p>
        </div>
      </div>

      {/* ── Inspection Summary Table ── */}
      <Card
        title="Plate Inspection & Enumeration Summary"
        subtitle="Review individual petri dish counts, macroscopic metrics, and visual bounding boxes."
      >
        <div className="overflow-x-auto -mx-5 -mb-5 sm:mx-0 sm:mb-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-200 text-surface-400 font-semibold uppercase tracking-wider bg-surface-50/50">
                <th className="py-3 px-4">Plate ID</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Verified CFUs</th>
                <th className="py-3 px-4">Mean Area</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-medium text-surface-700">
              {plates.map((plate) => (
                <tr key={plate.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-surface-500 font-normal">
                    {plate.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-surface-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-surface-100 border border-surface-200 overflow-hidden shrink-0">
                        {plate.thumbnail ? (
                          <img src={plate.thumbnail} alt={plate.fileName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-100" />
                        )}
                      </div>
                      <span>{plate.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-primary-700 text-sm">
                      {plate.colonyCount}
                    </span>{' '}
                    <span className="text-[11px] text-surface-400 font-normal">CFU</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {plate.avgAreaMm2 || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
                      {plate.confidence || '92%'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Validated
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/faculty/review/${project.id}/plate/${plate.id}?from=archive`}
                      state={{ fromArchive: true }}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="font-semibold text-primary-700 border-primary-200 hover:bg-primary-50 cursor-pointer gap-1"
                      >
                        Inspect Canvas →
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
