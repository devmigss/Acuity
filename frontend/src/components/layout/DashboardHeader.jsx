/**
 * Acuity — Dashboard Header (TopBar)
 *
 * Sticky top navigation bar in Deep Navy (#0B1F3A).
 * Displays official Acuity branding, mobile navigation toggle,
 * and current session identity.
 */

import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/routes/routeConstants'
import { getDefaultRouteForRole } from '@/components/navigation/roleNavigation'
import { ROLES } from '@/constants/roles'
import acuityHeaderLogo from '@/assets/branding/AcuityHeader.svg'

export default function DashboardHeader({ isMobileMenuOpen, onToggleMobileMenu }) {
  const { user } = useAuth()

  const defaultRoute = user ? getDefaultRouteForRole(user.role) : ROUTES.HOME

  const roleLabelMap = {
    [ROLES.STUDENT]: 'Student',
    [ROLES.FACULTY]: 'Faculty Adviser',
    [ROLES.SYSTEMADMIN]: 'System Admin',
  }

  const roleLabel = (user?.role && roleLabelMap[user.role]) || 'Student'

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F3A] border-b border-[#05101E]/80 shadow-xs h-16 shrink-0">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Toggle & Acuity Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 cursor-pointer"
            onClick={onToggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          {/* Acuity Brand Logo */}
          <Link
            to={defaultRoute}
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg py-1 px-1 -ml-1"
            aria-label="Acuity Dashboard"
          >
            <img
              src={acuityHeaderLogo}
              alt="Acuity"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Right: Primary Identity Block (Display Name, Role, Email, Avatar) */}
        <div className="flex items-center">
          <Link
            to={ROUTES.SETTINGS}
            className="flex items-center gap-3 p-1.5 -mr-1.5 rounded-xl hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 group cursor-pointer"
            title="Account Settings"
          >
            <div className="text-right hidden sm:flex sm:flex-col sm:items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white group-hover:text-accent-300 transition-colors">
                  {user?.displayName || 'Acuity User'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 border border-white/15 text-accent-400 tracking-wide">
                  {roleLabel}
                </span>
              </div>
              <div className="text-[11px] text-primary-200/85 leading-tight mt-0.5">
                {user?.email || 'user@acuity.app'}
              </div>
            </div>

            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-accent-400 text-[#0B1F3A] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
