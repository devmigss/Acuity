/**
 * Acuity — useDebounce hook
 *
 * REC: Shared utility hook for debouncing values.
 */

import { useEffect, useState } from 'react'

/**
 * Debounce a value by the specified delay.
 * @param {any} value — The value to debounce
 * @param {number} delay — Delay in milliseconds (default: 300)
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
