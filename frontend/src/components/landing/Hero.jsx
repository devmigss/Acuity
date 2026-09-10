/**
 * Acuity — Hero Section
 *
 * Primary above-the-fold section establishing the Acuity value proposition.
 * Content derived from README.md and ACUITY_REQUIREMENTS.md Section 1.
 *
 * Design: Centered layout with headline, subtitle, stats bar, and dual CTAs.
 */

import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import { useAdminStore } from '@/stores/useAdminStore'

const DEFAULT_STATS = [
  { label: '80%+ Target detection F1' },
  { label: '40–70 Fine-tuning images' },
  { label: '1-click CSV export' },
]

export default function Hero() {
  const landingContent = useAdminStore((s) => s.publicContent?.landing)

  const headline = landingContent?.headline || 'Colony counting, without the eye strain.'
  const subtitle =
    landingContent?.subtitle ||
    'Acuity automates CFU detection and measurement on Petri dish photos, so biology thesis groups spend less time tallying and more time analyzing.'

  const stats = landingContent?.metrics
    ? landingContent.metrics.split('|').map((s) => ({ label: s.trim() })).filter((s) => s.label)
    : DEFAULT_STATS

  const heroGraphic = landingContent?.heroGraphicUrl

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* ── Headline ── */}
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-600 leading-tight">
            {headline}
          </h1>

          {/* ── Subtitle ── */}
          <p className="animate-fade-in-up animation-delay-75 mt-6 text-base sm:text-lg text-surface-500 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* ── CTAs ── */}
          <div className="animate-fade-in-up animation-delay-150 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer shadow-sm"
            >
              Get started — it&apos;s Free
            </Link>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg border-2 border-surface-300 text-surface-700 hover:border-primary-600 hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              Sign In
            </Link>
          </div>

          {/* ── Stats Bar ── */}
          <div className="animate-fade-in-up animation-delay-225 mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-surface-500">
            {stats.map((stat, idx) => (
              <span key={stat.label || idx} className="flex items-center gap-2">
                {idx > 0 && (
                  <span className="hidden sm:inline text-surface-300" aria-hidden="true">
                    |
                  </span>
                )}
                <span className="font-medium text-surface-600">{stat.label}</span>
              </span>
            ))}
          </div>

          {/* ── Optional Hero Graphic from Content Manager ── */}
          {heroGraphic && (
            <div className="mt-10 rounded-2xl overflow-hidden shadow-xl border border-surface-200 max-w-xl mx-auto">
              <img src={heroGraphic} alt="Acuity Platform Preview" className="w-full h-auto object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
