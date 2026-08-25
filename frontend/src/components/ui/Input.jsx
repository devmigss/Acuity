/**
 * Acuity — Input component
 *
 * REC: Shared text input with label, error state, and help text.
 */

import { useId } from 'react'

export default function Input({
  label,
  error,
  helpText,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const inputId = props.id || generatedId

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-surface-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm
          bg-white text-surface-800
          placeholder:text-surface-400
          focus:outline-none focus:ring-2 focus:ring-offset-0
          transition-colors duration-150
          ${
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-surface-300 focus:ring-primary-500 focus:border-primary-500'
          }
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger-500" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-surface-500">
          {helpText}
        </p>
      )}
    </div>
  )
}
