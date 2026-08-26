/**
 * Acuity — useMediaQuery hook
 *
 * REC: Shared utility for responsive behavior.
 * REQ: Section 22 — responsive behavior without sacrificing
 * desktop annotation usability.
 */

import { useEffect, useState } from 'react'

/**
 * Returns true if the given media query matches.
 * @param {string} query — CSS media query string
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
