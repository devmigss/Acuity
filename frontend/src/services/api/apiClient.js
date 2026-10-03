/**
 * Acuity — Centralized API Client
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 25, 26.
 * Single source of truth for all API communication.
 * Injects Cognito ID Tokens and handles global auth states (401 NOT_SYNCED, 403 Security codes).
 */

import { userPool } from '../cognito';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Retrieve the verified ID token dynamically from AWS Cognito session.
 */
export async function getStoredToken() {
  // Check sessionStorage and localStorage fallback first if set
  const sessionToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('acuity_token') : null;
  if (sessionToken) return sessionToken;

  const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem('acuity_token') : null;
  if (localToken) return localToken;

  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }
    currentUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        resolve(null);
      } else {
        // Use ID Token (contains verified email, given_name, family_name claims)
        const idToken = session.getIdToken ? session.getIdToken().getJwtToken() : null;
        const accessToken = session.getAccessToken ? session.getAccessToken().getJwtToken() : null;
        resolve(idToken || accessToken);
      }
    });
  });
}

/**
 * Parse an error response into a structured ApiError.
 */
async function parseErrorResponse(response) {
  let message = `Request failed with status ${response.status}`;
  let details = null;

  try {
    const body = await response.json();
    message = body.message || body.error || message;
    details = body;
  } catch {
    // Response body is not JSON
  }

  const error = new Error(message);
  error.status = response.status;
  error.code = details?.code;
  error.fieldErrors = details?.fieldErrors;
  error.details = details;
  return error;
}

/**
 * Make an authenticated API request.
 *
 * @param {string} endpoint — Relative path (e.g. '/projects')
 * @param {object} options — fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} — Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const { headers: customHeaders, body, _isRetry, ...rest } = options;

  const token = await getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);

    // 1. Intercept 401 NOT_SYNCED -> trigger /api/auth/sync and retry once
    if (response.status === 401 && error.code === 'NOT_SYNCED' && !_isRetry) {
      try {
        await api.post('/auth/sync', {});
        return apiRequest(endpoint, { ...options, _isRetry: true });
      } catch (syncErr) {
        console.warn('Auto-sync retry failed:', syncErr.message);
      }
    }

    // 2. Intercept 401 SESSION_REVOKED -> dispatch session-revoked event to clear session & redirect
    if (response.status === 401 && error.code === 'SESSION_REVOKED') {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('acuity:session-revoked', {
            detail: {
              code: error.code,
              message: error.message,
            },
          })
        );
      }
    }

    // 3. Intercept 403 Security codes: ACCESS_REVOKED, UNRECOGNIZED_INSTITUTION, ACCOUNT_DEACTIVATED, TENANT_SUSPENDED
    const blockingCodes = ['ACCESS_REVOKED', 'UNRECOGNIZED_INSTITUTION', 'ACCOUNT_DEACTIVATED', 'TENANT_SUSPENDED'];
    if (response.status === 403 && blockingCodes.includes(error.code)) {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('acuity:access-denied', {
            detail: {
              code: error.code,
              message: error.message,
            },
          })
        );
      }
    }

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/** Convenience methods */
export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => apiRequest(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => apiRequest(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => apiRequest(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options }),
};
