/**
 * Acuity — API client
 *
 * REC: Thin wrapper around native fetch().
 * Provides base URL configuration, auth token injection,
 * and standardized error handling.
 *
 * No external HTTP library (Axios, etc.) is used.
 * The capstone does not specify one, and fetch is sufficient.
 *
 * IMPORTANT: This file must NOT contain server secrets.
 * REQ: ACUITY_REQUIREMENTS.md Section 25, 26.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Make an authenticated API request.
 *
 * @param {string} endpoint — Relative path (e.g. '/projects')
 * @param {object} options — fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} — Parsed JSON response
 * @throws {ApiError} — On non-ok responses
 */
export async function apiRequest(endpoint, options = {}) {
  const { headers: customHeaders, body, ...rest } = options

  // Token retrieval will be wired in Phase 2 (auth integration)
  const token = getStoredToken()

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // If body is FormData, remove Content-Type to let browser set boundary
  if (body instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  })

  if (!response.ok) {
    const error = await parseErrorResponse(response)
    throw error
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

/** Convenience methods */
export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => apiRequest(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => apiRequest(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => apiRequest(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options }),
}

/**
 * Retrieve the stored auth token.
 * Placeholder — will be replaced when tokenStorage is wired.
 */
function getStoredToken() {
  try {
    return sessionStorage.getItem('acuity_token') || null
  } catch {
    return null
  }
}

/**
 * Parse an error response into a structured error.
 */
async function parseErrorResponse(response) {
  let message = `Request failed with status ${response.status}`
  let details = null

  try {
    const body = await response.json()
    message = body.message || body.error || message
    details = body
  } catch {
    // Response body is not JSON
  }

  const error = new Error(message)
  error.status = response.status
  error.details = details
  return error
}
