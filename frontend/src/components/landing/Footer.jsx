/**
 * Acuity — Footer
 *
 * Minimal footer with Acuity branding and university affiliation.
 * The university credit matches the design reference.
 */

import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-surface-200" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Top Row ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            aria-label="Acuity — Home"
          >
            <svg
              className="h-6 w-6 text-accent-400"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            </svg>
            <span className="text-lg font-bold tracking-tight">Acuity</span>
          </Link>

          {/* Footer links */}
          <div className="flex items-center gap-6 text-sm text-surface-500">
            <Link
              to={ROUTES.ABOUT}
              className="hover:text-primary-600 transition-colors"
            >
              About
            </Link>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="hover:text-primary-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="hover:text-primary-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="mt-6 pt-6 border-t border-surface-100 text-center">
          <p className="text-sm text-surface-400">
            University of Santo Tomas · College of Information and Computing Sciences
          </p>
          <p className="mt-1 text-xs text-surface-400">
            © {currentYear} Acuity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
