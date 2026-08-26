/**
 * Acuity — Navigation Header
 *
 * Sticky navigation header for public-facing and authentication pages.
 * Supports two intentional variants:
 * - 'full' (default): Acuity logo + About, Sign Up, and Sign In navigation links.
 * - 'auth': Simplified header containing only the Acuity brand logo, sharing the exact
 *   same container alignment, max-width, height, and typography.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'

export default function Navbar({ variant = 'full' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const isAuth = variant === 'auth'

  return (
    <header className="sticky top-0 z-50 bg-primary-900 border-b border-primary-950">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label={isAuth ? 'Authentication navigation' : 'Main navigation'}
      >
        <div className="flex h-16 items-center justify-between">
          {/* ── Logo ── */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg"
            aria-label="Acuity — Home"
            onClick={closeMobileMenu}
          >
            {/* Lens / eye icon */}
            <svg
              className="h-8 w-8 text-accent-400 transition-colors group-hover:text-accent-300"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
              <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16 26V30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 16H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M26 16H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">
              Acuity
            </span>
          </Link>

          {/* ── Public Navigation (Hidden in Auth variant) ── */}
          {!isAuth && (
            <>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to={ROUTES.ABOUT}
                  className="text-sm font-medium text-primary-100 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="text-sm font-medium text-primary-100 hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg bg-accent-400 text-white hover:bg-accent-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 cursor-pointer"
                >
                  Sign In
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-primary-200 hover:text-white hover:bg-primary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  /* X icon */
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  /* Hamburger icon */
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        {/* ── Mobile Menu Panel (Public Only) ── */}
        {!isAuth && (
          <div
            id="mobile-menu"
            className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
              isMobileMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'
            }`}
          >
            <div className="flex flex-col gap-1 pt-2 border-t border-primary-800">
              <Link
                to={ROUTES.ABOUT}
                onClick={closeMobileMenu}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-800 transition-colors"
              >
                About
              </Link>
              <Link
                to={ROUTES.AUTH.REGISTER}
                onClick={closeMobileMenu}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:text-white hover:bg-primary-800 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to={ROUTES.AUTH.LOGIN}
                onClick={closeMobileMenu}
                className="mt-1 block text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-accent-400 text-white hover:bg-accent-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
