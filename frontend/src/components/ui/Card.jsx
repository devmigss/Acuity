/**
 * Acuity — Card component
 *
 * REC: Generic content container with optional header and footer.
 */

export default function Card({
  children,
  title,
  subtitle,
  footer,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-surface-200
        shadow-sm overflow-hidden
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-surface-100">
          {title && (
            <h3 className="text-base font-semibold text-surface-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-surface-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-surface-50 border-t border-surface-100">
          {footer}
        </div>
      )}
    </div>
  )
}
