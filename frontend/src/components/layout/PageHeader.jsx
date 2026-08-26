/**
 * Acuity — PageHeader component
 *
 * REC: Reusable page-level header with title and optional subtitle.
 * Used by placeholder pages during early development.
 */

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      {title && (
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="mt-1 text-sm text-surface-500">{subtitle}</p>
      )}
    </div>
  )
}
