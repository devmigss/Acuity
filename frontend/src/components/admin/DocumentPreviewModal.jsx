/**
 * Acuity — Document Preview Modal (System Admin)
 *
 * Provides a mock document / PDF reading view without triggering accidental downloads.
 * Features a dedicated download action and complete metadata breakdown.
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToastStore } from '@/store/useToastStore'

export default function DocumentPreviewModal({ isOpen, onClose, document: doc }) {
  const addToast = useToastStore((s) => s.addToast)

  if (!doc) return null

  const handleDownload = () => {
    addToast(`Downloaded "${doc.title}.${doc.format === 'PDF' ? 'pdf' : 'md'}" (${doc.size}).`, 'info')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.title}
      subtitle={`Repository Reference · ${doc.category} · ${doc.format} (${doc.size})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 pt-1">
        {/* Document Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                doc.format === 'PDF'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {doc.format}
            </span>
            <span className="font-semibold text-surface-700">{doc.category}</span>
            <span className="text-surface-400 font-mono">({doc.size})</span>
          </div>

          <span className="text-[11px] text-surface-500 font-mono">
            Uploaded: {doc.uploadedAt}
          </span>
        </div>

        {/* Mock Document Viewport */}
        <div className="p-6 rounded-xl border border-surface-200 bg-white shadow-2xs space-y-4 max-h-[55vh] overflow-y-auto font-sans text-xs text-surface-700 leading-relaxed">
          {/* Cover Header */}
          <div className="border-b border-surface-200 pb-4">
            <div className="text-[10px] font-bold text-accent-600 uppercase tracking-wider">
              Acuity Academic &amp; Research Platform Documentation
            </div>
            <h2 className="text-lg font-bold text-surface-900 mt-1">{doc.title}</h2>
            <p className="text-xs text-surface-500 mt-1">{doc.description}</p>
          </div>

          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-800">
              1. Institutional Architecture &amp; Scope
            </h3>
            <p className="text-surface-600">
              This document serves as the formal specification for biological researchers, laboratory faculty,
              and academic platform administrators utilizing the Acuity macroscopic colony quantification suite.
              All procedures conform to the University of Santo Tomas College of Information and Computing Sciences
              capstone project standards.
            </p>
          </div>

          {/* Section 2: Technical Specifications */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-800">
              2. Methodology &amp; Mathematical Baselines
            </h3>
            <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 font-mono text-[11px] text-surface-800 space-y-1">
              <div>// Standard Petri Dish Spatial Ratio</div>
              <div>Ratio = 90.0mm / PetriDish_Diameter_in_Pixels</div>
              <div>Colony_Area_mm2 = (π × r_pixels²) × (Ratio²)</div>
            </div>
            <p className="text-surface-600">
              Macroscopic detection utilizes a tailored YOLOv8 small-object-detection (SOD) engine, preprocessed with
              Gaussian adaptive thresholding and circular Hough transformation to extract the 90mm circular region of
              interest (ROI).
            </p>
          </div>

          {/* Section 3: Data Governance */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-800">
              3. Verification &amp; Data Freeze Protocol
            </h3>
            <p className="text-surface-600">
              Upon formal approval by an authorized Faculty Adviser, the project trial dataset enters an immutable
              validated state. Changes are timestamped in Amazon DynamoDB audit streams, and student editing permissions
              are permanently locked to guarantee academic integrity.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close Preview
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDownload}
            className="text-xs bg-[#0B1F3A] hover:bg-[#071527] text-white font-bold gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download {doc.format} File
          </Button>
        </div>
      </div>
    </Modal>
  )
}
