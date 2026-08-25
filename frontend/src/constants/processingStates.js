/**
 * Acuity — AI processing state constants
 *
 * REQ: Derived from ACUITY_REQUIREMENTS.md Section 13.
 * These are suggested UI state names. The backend contract
 * should ultimately define the actual status values.
 */

export const PROCESSING_STATES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
}
