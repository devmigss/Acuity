/**
 * Acuity — Footer
 *
 * Minimal footer with Acuity branding and university affiliation.
 * The university credit matches the design reference.
 */

import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'
import acuityLogo from '@/assets/branding/acuity-logo.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-surface-200" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* ── Upper Section: Brand & Navigation ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg"
            aria-label="Acuity — Home"
          >
            <img
              src={acuityLogo}
              alt="Acuity"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Primary Footer Navigation */}
          <nav aria-label="Footer navigation">
            <div className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-surface-600">
              <Link
                to={ROUTES.ABOUT}
                className="hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded px-1 py-0.5"
              >
                About
              </Link>
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded px-1 py-0.5"
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.AUTH.REGISTER}
                className="hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded px-1 py-0.5"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>

        {/* ── Subtle Divider ── */}
        <div className="mt-8 pt-8 border-t border-surface-200/80">
          {/* ── Lower Section: Institutional Information & Copyright ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs sm:text-sm text-surface-500">
            <p className="font-normal text-surface-600">
              University of Santo Tomas · College of Information and Computing Sciences
            </p>
            <p className="text-xs text-surface-400">
              © {currentYear} Acuity. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
