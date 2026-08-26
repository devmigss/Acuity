/**
 * Acuity — How It Works Section
 *
 * Visual representation of the core Acuity workflow.
 * Derived from ACUITY_REQUIREMENTS.md Section 1 — Core Workflow.
 *
 * Design: Horizontal step indicators (vertical on mobile)
 * with numbered badges and connecting lines.
 */

const STEPS = [
  {
    number: '1',
    title: 'Upload',
    description: 'Drag and drop your Petri dish photos. JPEG, JPG, or PNG — up to 10 images per batch.',
  },
  {
    number: '2',
    title: 'AI Detection',
    description: 'SOD-YOLOv8 automatically detects and counts colony forming units in seconds.',
  },
  {
    number: '3',
    title: 'Review & Correct',
    description: 'Use the interactive canvas to verify, add, resize, or remove detections.',
  },
  {
    number: '4',
    title: 'Export',
    description: 'Download structured CSV or PDF reports formatted for SPSS, R, or your preferred tool.',
  },
]

const DELAYS = [
  'animation-delay-75',
  'animation-delay-150',
  'animation-delay-225',
  'animation-delay-300',
]

export default function HowItWorks() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="fade-in-up text-center mb-12 sm:mb-16">
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl font-bold text-primary-600 tracking-tight"
          >
            How Acuity Works
          </h2>
          <p className="mt-3 text-surface-500 max-w-xl mx-auto">
            From photograph to publication-ready data in four steps.
          </p>
        </div>

        {/* ── Steps Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {STEPS.map((step, idx) => (
            <div key={step.number} className={`fade-in-up ${DELAYS[idx] || ''} relative text-center lg:text-left`}>
              {/* Connecting line (desktop only, between steps) */}
              {idx < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-5 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-surface-200"
                  aria-hidden="true"
                />
              )}

              {/* Step number badge */}
              <div className="mx-auto lg:mx-0 mb-4 flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white text-sm font-bold">
                {step.number}
              </div>

              {/* Step title */}
              <h3 className="text-base font-semibold text-surface-900 mb-2">
                {step.title}
              </h3>

              {/* Step description */}
              <p className="text-sm text-surface-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
