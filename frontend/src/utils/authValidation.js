/**
 * Acuity — Authentication Validation Utilities
 *
 * Provides shared, user-friendly validation for institutional authentication:
 * - Institutional Email validation with personal domain rejection
 * - Flexible Full Name validation without overly restrictive character rules
 * - Password and confirmation matching
 *
 * NOTE: Designed for future backend/AWS Cognito integration.
 */

// Common personal/public email providers that should not be used as institutional accounts
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
])

/**
 * Institutional domain allowlist hook.
 * Empty array indicates any non-personal domain is accepted in Phase 1 demo.
 * An institution domain (e.g. 'ust.edu.ph') can be added here once officially configured.
 */
export const APPROVED_INSTITUTIONAL_DOMAINS = []

/**
 * Checks if an email uses a known public/personal domain.
 */
export function isPersonalEmail(email) {
  if (!email || typeof email !== 'string') return false
  const parts = email.trim().toLowerCase().split('@')
  if (parts.length !== 2) return false
  return PERSONAL_EMAIL_DOMAINS.has(parts[1])
}

/**
 * Validates institutional email input.
 * Returns null if valid, or a user-friendly error message string if invalid.
 */
export function validateInstitutionalEmail(email) {
  if (!email || !email.trim()) {
    return 'Please enter your institutional email.'
  }

  const trimmed = email.trim()
  // General standard email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.'
  }

  if (isPersonalEmail(trimmed)) {
    return 'Personal email accounts are not permitted. Please use your institutional email.'
  }

  if (APPROVED_INSTITUTIONAL_DOMAINS.length > 0) {
    const domain = trimmed.toLowerCase().split('@')[1]
    if (!APPROVED_INSTITUTIONAL_DOMAINS.includes(domain)) {
      return 'Email domain is not recognized as an approved institutional domain.'
    }
  }

  return null
}

/**
 * Validates full name.
 * Accepts normal real-world names with spaces, hyphens, and apostrophes.
 * Rejects empty or whitespace-only inputs.
 */
export function validateFullName(name) {
  if (!name || !name.trim()) {
    return 'Please enter your full name.'
  }

  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.'
  }

  // Ensure it's not purely symbols/punctuation
  if (!/[\p{L}]/u.test(trimmed)) {
    return 'Please enter a valid name.'
  }

  return null
}

/**
 * Validates password criteria:
 * - At least 8 characters
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password) {
  if (!password) {
    return 'Please enter your password.'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number.'
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.'
  }

  return null
}

/**
 * Validates password confirmation.
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your password.'
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.'
  }

  return null
}
