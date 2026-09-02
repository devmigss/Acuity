/**
 * Acuity — Student Dashboard Page
 *
 * Primary research workspace view for biology students and thesis groups.
 * Provides trial/plate context, batch Petri dish image upload zone,
 * SOD-YOLOv8 AI processing status indicators, aggregated morphological data view,
 * processed plates table, and export action bar.
 *
 * NOTE: Scientific measurements and colony metrics shown here are static demonstration
 * data. Authoritative calculation formulas and AI inference will be provided by the
 * Python FastAPI/OpenCV microservice in future phases.
 */

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Mock Demonstration Data for Active Trial
const TRIAL_CONTEXT = {
  projectName: 'Antimicrobial Efficacy of Psidium guajava Extracts',
  trialName: 'Trial 04 — Staphylococcus aureus (Plate Group A)',
  dishStandard: 'Standard 90mm Petri Dish',
  calibration: '1 px = 0.082 mm (Spatial Calibration Verified)',
  status: 'In Progress · Human Review',
}

const MOCK_BATCH_FILES = [
  {
    id: 'plate-01',
    fileName: 'Plate_A1_24h_100x.png',
    size: '4.8 MB',
    colonyCount: 42,
    avgAreaMm2: '3.45 mm²',
    avgDiameterMm: '2.09 mm',
    status: 'AI Analyzed',
    confidence: '92.4%',
    thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'plate-02',
    fileName: 'Plate_A2_24h_100x.png',
    size: '5.1 MB',
    colonyCount: 56,
    avgAreaMm2: '3.38 mm²',
    avgDiameterMm: '2.07 mm',
    status: 'Reviewed',
    confidence: '94.1%',
    thumbnail: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'plate-03',
    fileName: 'Plate_A3_24h_100x.png',
    size: '4.6 MB',
    colonyCount: 50,
    avgAreaMm2: '3.42 mm²',
    avgDiameterMm: '2.08 mm',
    status: 'Pending Adviser',
    confidence: '91.8%',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=120&auto=format&fit=crop&q=80',
  },
]

export default function DashboardPage() {
  const [selectedPlate, setSelectedPlate] = useState(MOCK_BATCH_FILES[0])
  const [isExporting, setIsExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState('')

  const handleExportCSV = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setExportNotice('CSV dataset generated (SPSS / R formatted schema).')
      setTimeout(() => setExportNotice(''), 4000)
    }, 600)
  }

  const handleOpenCanvas = (plateId) => {
    alert(`Opening Interactive Annotation Canvas for plate: ${plateId} (React Konva workspace placeholder)`)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header & Trial Context ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-900 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-400" />
            Active Research Trial
          </div>
          <PageHeader
            title={TRIAL_CONTEXT.projectName}
            subtitle={`${TRIAL_CONTEXT.trialName} · ${TRIAL_CONTEXT.dishStandard}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportCSV}
            loading={isExporting}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export CSV</span>
          </Button>

          <Button
            type="button"
            variant="accent"
            onClick={() => handleOpenCanvas(selectedPlate.id)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
            <span>Open Canvas</span>
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <span>{exportNotice}</span>
          <button type="button" onClick={() => setExportNotice('')} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* ── 2. Aggregated Morphological Data Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Total Colony Count
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            148 <span className="text-sm font-semibold text-accent-600">CFUs</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Across 3 verified Petri plates in batch</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Average Area
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            3.42 <span className="text-sm font-semibold text-surface-500">mm²</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Std. Dev ± 0.31 mm²</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            Average Diameter
          </div>
          <div className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
            2.08 <span className="text-sm font-semibold text-surface-500">mm</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Calibrated at 90mm dish standard</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-2xs">
          <div className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">
            AI Inference Status
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight flex items-center gap-2">
            100% <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">SOD-YOLOv8</span>
          </div>
          <p className="mt-2 text-xs text-surface-500">Detection confidence threshold: 0.65</p>
        </div>
      </div>

      {/* ── 3. Batch Image Upload & Queue ── */}
      <Card
        title="Petri Dish Photography & Batch Upload"
        subtitle="Upload high-resolution photography (JPEG, JPG, PNG). Max 10 images per batch (Direct-to-S3 Presigned URL)."
      >
        <div className="space-y-4">
          {/* Drag and Drop Zone Placeholder */}
          <div className="border-2 border-dashed border-surface-300 hover:border-primary-500 rounded-xl p-6 sm:p-8 text-center bg-surface-50/50 hover:bg-surface-50 transition-colors cursor-pointer group">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-surface-800">
              Drag and drop Petri dish photos, or <span className="text-primary-600 underline">browse files</span>
            </div>
            <p className="mt-1 text-xs text-surface-500">
              Supports JPEG, JPG, PNG up to 50MB each. Spatial circular ROI masking is applied automatically.
            </p>
          </div>

          {/* Processed Batch Plates Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-200 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Plate Preview</th>
                  <th className="py-3 px-3">File Name</th>
                  <th className="py-3 px-3 text-center">Colonies (CFU)</th>
                  <th className="py-3 px-3">Mean Diameter</th>
                  <th className="py-3 px-3">AI Confidence</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {MOCK_BATCH_FILES.map((plate) => (
                  <tr
                    key={plate.id}
                    className={`hover:bg-surface-50 transition-colors ${
                      selectedPlate.id === plate.id ? 'bg-primary-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <img
                        src={plate.thumbnail}
                        alt={plate.fileName}
                        className="w-10 h-10 rounded-lg object-cover border border-surface-200 shadow-2xs"
                      />
                    </td>
                    <td className="py-3 px-3 font-medium text-surface-900">
                      {plate.fileName}
                      <span className="block text-xs text-surface-400">{plate.size}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#0B1F3A]">
                      {plate.colonyCount}
                    </td>
                    <td className="py-3 px-3 text-surface-700">
                      {plate.avgDiameterMm}
                    </td>
                    <td className="py-3 px-3 text-surface-700">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {plate.confidence}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          plate.status === 'Reviewed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : plate.status === 'Pending Adviser'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-primary-50 text-primary-700 border border-primary-200'
                        }`}
                      >
                        {plate.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlate(plate)
                          handleOpenCanvas(plate.id)
                        }}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer"
                      >
                        Inspect / Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
