/**
 * Acuity — Modal component
 *
 * Accessible, centered application modal dialog.
 * Uses React Portal to mount at document.body, ensuring it is completely free
 * of any parent positioning, overflow, or transform stacking contexts.
 */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const modalBoxRef = useRef(null)

  // Prevent background scrolling while modal is open & restore on close
  useEffect(() => {
    if (!isOpen) return

    // Save previous overflow states
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    const mainElement = document.querySelector('main')
    const prevMainOverflow = mainElement ? mainElement.style.overflow : ''

    // Lock scrolling on all potential scroll containers
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    if (mainElement) {
      mainElement.style.overflow = 'hidden'
    }

    // Keyboard accessibility: Close on Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      if (mainElement) {
        mainElement.style.overflow = prevMainOverflow
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const SIZE_CLASSES = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  const modalNode = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* ── Fixed Backdrop covering the entire application viewport ── */}
      <div
        className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs transition-opacity animate-fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Centered Modal Container ── */}
      <div
        ref={modalBoxRef}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
          bg-white rounded-2xl border border-surface-200
          shadow-2xl overflow-hidden
          z-10 my-auto
          animate-modal-scale-in
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-surface-100">
            <h2 id="modal-title" className="text-lg font-bold text-surface-900 tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors p-1.5 rounded-lg cursor-pointer -mr-1"
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
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-surface-50 border-t border-surface-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalNode, document.body)
}
