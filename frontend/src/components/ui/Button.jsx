/**
 * Acuity — Button component
 *
 * REC: Shared reusable button with variant support.
 */

const VARIANTS = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-primary-500 shadow-xs transition-all duration-200',
  accent:
    'bg-accent-400 text-[#0B1F3A] font-semibold hover:bg-accent-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-accent-400 shadow-xs transition-all duration-200',
  secondary:
    'bg-surface-200 text-surface-800 hover:bg-surface-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-surface-400 transition-all duration-200',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-danger-500 transition-all duration-200',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 focus-visible:ring-surface-400 transition-all duration-200',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
