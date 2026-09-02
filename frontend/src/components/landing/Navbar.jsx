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
import acuityLogo from '@/assets/branding/acuity-logo.png'

export default function Navbar({ variant = 'full' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const isAuth = variant === 'auth'

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F3A] border-b border-[#05101E]/80 shadow-xs">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label={isAuth ? 'Authentication navigation' : 'Main navigation'}
      >
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* ── Logo ── */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg py-1 px-1 -ml-1"
            aria-label="Acuity — Home"
            onClick={closeMobileMenu}
          >
            <img
              src={acuityLogo}
              alt="Acuity"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* ── Public Navigation (Hidden in Auth variant) ── */}
          {!isAuth && (
            <>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to={ROUTES.ABOUT}
                  className="text-sm font-medium text-white/85 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="text-sm font-medium text-white/85 hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg bg-accent-400 text-[#0B1F3A] hover:bg-accent-300 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A] cursor-pointer"
                >
                  Sign In
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 cursor-pointer"
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
            className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${isMobileMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'
              }`}
          >
            <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
              <Link
                to={ROUTES.ABOUT}
                onClick={closeMobileMenu}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                About
              </Link>
              <Link
                to={ROUTES.AUTH.REGISTER}
                onClick={closeMobileMenu}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to={ROUTES.AUTH.LOGIN}
                onClick={closeMobileMenu}
                className="mt-1 block text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-accent-400 text-[#0B1F3A] hover:bg-accent-300 transition-colors"
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
