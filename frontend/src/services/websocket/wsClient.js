/**
 * Acuity — WebSocket / SSE client
 *
 * REC: Abstract wrapper that can be adapted to WebSocket or SSE
 * once the backend contract is defined.
 *
 * DECIDE: The team chose to defer the WebSocket vs SSE decision.
 * This module provides a placeholder interface.
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 6 — WebSockets/SSE identified
 * as a client-side requirement.
 */

const _WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

/**
 * Create a real-time connection for receiving server events.
 *
 * This is a placeholder. The actual implementation will be
 * chosen when the backend real-time contract is defined.
 *
 * @param {string} channel — The channel/topic to subscribe to
 * @param {object} handlers — { onMessage, onError, onOpen, onClose }
 * @returns {object} — { disconnect }
 */
export function createRealtimeConnection(channel, handlers = {}) {
  const { onMessage: _onMessage, onError: _onError, onOpen: _onOpen, onClose: _onClose } = handlers

  // TODO: Replace with actual WebSocket or SSE implementation
  // once the backend contract is defined.
  console.warn(
    `[wsClient] Real-time connection to "${channel}" is not yet implemented. ` +
    `Awaiting backend contract definition.`
  )

  return {
    disconnect: () => {
      // No-op placeholder
    },
    send: () => {
      console.warn('[wsClient] send() is not yet implemented.')
    },
  }
}
