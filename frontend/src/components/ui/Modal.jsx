/**
 * Acuity — Modal component
 *
 * REC: Dialog overlay for confirmations, forms, and alerts.
 * Uses the native <dialog> element for accessibility.
 */

import { useEffect, useRef } from 'react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose?.()
    }
  }

  const SIZE_CLASSES = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={onClose}
      className={`
        w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
        rounded-xl border border-surface-200 bg-white
        shadow-xl p-0
        backdrop:bg-black/50 backdrop:backdrop-blur-sm
        ${className}
      `}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 transition-colors p-1 rounded-md hover:bg-surface-100"
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-3 px-5 py-3 bg-surface-50 border-t border-surface-100">
          {footer}
        </div>
      )}
    </dialog>
  )
}
