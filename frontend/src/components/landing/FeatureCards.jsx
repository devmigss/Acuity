/**
 * Acuity — Feature Cards Section
 *
 * Highlights four core Acuity capabilities.
 * Content derived from:
 *  - AI Colony Detection: README, REQ Sections 1, 13, 14
 *  - Human-in-the-Loop:   README, REQ Section 14
 *  - One-Click Export:    README, REQ Section 20
 *  - Multi-Tenant Security: README, REQ Section 8
 *
 * Design: Responsive 1→2→4 column card grid matching the branding reference.
 */

const FEATURES = [
  {
    title: 'AI Colony Detection',
    description:
      '80%+ Target detection F1. 40–70 Fine-tuning images. 1-click CSV export.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        <path d="M12 2a10 10 0 0 0-10 10" strokeLinecap="round" />
        <path d="M2 12a10 10 0 0 0 10 10" strokeLinecap="round" />
        <path d="M22 12a10 10 0 0 1-10 10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Human-in-the-Loop',
    description:
      'Review and correct every detection before it\'s finalized — the AI assists, you decide.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
      </svg>
    ),
  },
  {
    title: 'One-Click Export',
    description:
      'Turn verified annotations into a structured file ready for SPSS or R, instantly.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    title: 'Multi-Tenant Security',
    description:
      'Each laboratory group\'s data is fully isolated, with role-based access for students and advisers.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
]

const DELAYS = [
  'animation-delay-75',
  'animation-delay-150',
  'animation-delay-225',
  'animation-delay-300',
]

export default function FeatureCards() {
  return (
    <section className="bg-surface-50 py-16 sm:py-20 lg:py-24" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="features-heading" className="sr-only">
          Key Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {FEATURES.map((feature, idx) => (
            <article
              key={feature.title}
              className={`fade-in-up ${DELAYS[idx] || ''} flex flex-col h-full group bg-white rounded-xl border border-surface-200 p-6 shadow-xs hover:shadow-lg hover:-translate-y-2 hover:border-primary-300 transition-all duration-300 cursor-pointer`}
            >
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary-50 border border-primary-100 text-primary-600 group-hover:bg-[#0B1F3A] group-hover:text-accent-400 group-hover:border-[#0B1F3A] transition-colors duration-200">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-surface-900 mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-surface-500 leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
