/**
 * Acuity — Token storage utility
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 6 — local/session storage
 * for short-lived authentication token handling.
 *
 * IMPORTANT: Never store server secrets here.
 * REQ: Section 26 — frontend may only hold client-safe configuration.
 */

const TOKEN_KEY = 'acuity_token'
const REFRESH_TOKEN_KEY = 'acuity_refresh_token'

/** Store the access token in sessionStorage */
export function setToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.error('[tokenStorage] Failed to store token:', e)
  }
}

/** Retrieve the access token */
export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** Remove the access token */
export function removeToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch (e) {
    console.error('[tokenStorage] Failed to remove token:', e)
  }
}

/** Store the refresh token */
export function setRefreshToken(token) {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
  } catch (e) {
    console.error('[tokenStorage] Failed to store refresh token:', e)
  }
}

/** Retrieve the refresh token */
export function getRefreshToken() {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

/** Clear all auth tokens */
export function clearTokens() {
  removeToken()
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Silently fail
  }
}
