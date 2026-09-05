/**
 * Acuity — Reusable Role-Based Sidebar
 *
 * Provides persistent desktop navigation and responsive mobile drawer for
 * Student, Faculty, and System Administrator dashboards.
 *
 * Active state: Light blue background pill (#D5E3F7), high-contrast navy text (#0B1F3A),
 * and gold accent indicator.
 */

import { useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROLE_NAV_CONFIGS } from '@/components/navigation/roleNavigation'
import { ROLES } from '@/constants/roles'
import { useToastStore } from '@/store/useToastStore'

// Icon mapper for navigation items
function NavIcon({ id, className = 'w-5 h-5' }) {
  switch (id) {
    case 'dashboard':
    case 'overview':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      )
    case 'projects':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
      )
    case 'shared':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      )
    case 'adviser-remarks':
    case 'review-queue':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.09 1.976 1.053 1.976 2.188V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
        </svg>
      )
    case 'advisees':
    case 'users-tenants':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      )
    case 'validated':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      )
    case 'audit-logs':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    case 'content':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      )
    case 'documentation':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      )
    case 'settings':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )
    case 'support':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      )
    case 'logout':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
  }
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const currentRole = user?.role || ROLES.STUDENT
  const navConfig = ROLE_NAV_CONFIGS[currentRole] || ROLE_NAV_CONFIGS[ROLES.STUDENT]

  const handleLogout = async () => {
    if (onClose) onClose()
    await logout()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-surface-200
          flex flex-col justify-between py-5 px-3.5
          transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:top-0 lg:min-h-[calc(100vh-4rem)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Dashboard sidebar"
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* User Profile Info Header (Matching Reference Design) */}
          <div className="flex items-center gap-3 px-2 pb-4 mb-4 border-b border-surface-200/80">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-surface-200 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-200">
                {user?.displayName ? user.displayName.charAt(0) : 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-surface-900 truncate tracking-tight">
                {user?.displayName || 'Acuity User'}
              </h2>
              <p className="text-xs text-surface-500 truncate font-normal">
                {user?.title || navConfig.roleLabel}
              </p>
            </div>
          </div>

          {/* Section Header (In Acuity Gold) */}
          <div className="px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
              {navConfig.sectionTitle}
            </span>
          </div>

          {/* Role-Specific Navigation Items */}
          <nav className="space-y-1" aria-label="Main section navigation">
            {navConfig.navItems.map((item) => {
              const isActive = item.end
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={`
                    group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? 'bg-[#D5E3F7] text-[#0B1F3A] font-semibold shadow-2xs'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/80'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`
                        transition-colors
                        ${isActive ? 'text-[#0B1F3A]' : 'text-surface-400 group-hover:text-surface-600'}
                      `}
                    >
                      <NavIcon id={item.id} className="w-5 h-5 shrink-0" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Active Indicator Accent */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" aria-hidden="true" />
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* ACCOUNT Section */}
          <div className="mt-6">
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Account
              </span>
            </div>
            <nav className="space-y-1" aria-label="Account section navigation">
              {navConfig.accountItems.map((item) => {
                const isActive = location.pathname === item.path

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${
                        isActive
                          ? 'bg-[#D5E3F7] text-[#0B1F3A] font-semibold shadow-2xs'
                          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className={`
                          transition-colors
                          ${isActive ? 'text-[#0B1F3A]' : 'text-surface-400 group-hover:text-surface-600'}
                        `}
                      >
                        <NavIcon id={item.id} className="w-5 h-5 shrink-0" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" aria-hidden="true" />
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section with Divider (Support & Logout) */}
        <div className="pt-4 mt-4 border-t border-surface-200/80 space-y-1">
          <button
            type="button"
            onClick={() => {
              useToastStore.getState().addToast('Support: Contact your university faculty administrator or email support@acuity.app.')
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100/80 transition-colors cursor-pointer text-left"
          >
            <NavIcon id="support" className="w-5 h-5 text-surface-400" />
            <span>Support</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-danger-600 hover:text-danger-700 hover:bg-danger-50 transition-colors cursor-pointer text-left"
          >
            <NavIcon id="logout" className="w-5 h-5 text-danger-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
