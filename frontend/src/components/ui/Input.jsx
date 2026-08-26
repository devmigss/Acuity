/**
 * Acuity — Input component
 *
 * REC: Shared text input with label, error state, icon support, right element (e.g. eye toggle), and help text.
 */

import { useId } from 'react'

export default function Input({
  label,
  error,
  helpText,
  icon,
  rightElement,
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
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full py-2.5 rounded-lg border text-sm
            bg-white text-surface-900
            placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-colors duration-150
            ${icon ? 'pl-10' : 'pl-3.5'}
            ${rightElement ? 'pr-11' : 'pr-3.5'}
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
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
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
