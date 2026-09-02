/**
 * Acuity — CTA Section
 *
 * Bottom call-to-action banner encouraging user registration.
 * Navy background with white text to create visual contrast.
 */

import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'

export default function CTASection() {
  return (
    <section className="bg-primary-600 border-b border-[#05101E]/60 py-16 sm:py-20" aria-labelledby="cta-heading">
      <div className="fade-in-up mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
        >
          Ready to streamline your colony counting?
        </h2>
        <p className="mt-4 text-primary-200 max-w-xl mx-auto leading-relaxed">
          Designed for biology thesis groups and academic researchers to automate CFU detection,
          verify results interactively, and export publication-ready data.
        </p>
        <div className="mt-8">
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg bg-accent-400 text-[#0B1F3A] hover:bg-accent-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 cursor-pointer"
          >
            Get Started — it&apos;s Free
          </Link>
        </div>
      </div>
    </section>
  )
}
