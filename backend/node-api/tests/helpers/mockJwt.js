// Vitest global vi used for mocks

let currentMockPayload = {
  sub: 'mock-sub-123',
  email: 'test@example.com',
  email_verified: true,
  given_name: 'Mock',
  family_name: 'User',
};

function setMockJwtPayload(payload) {
  currentMockPayload = { ...currentMockPayload, ...payload };
}

function getMockJwtPayload() {
  return currentMockPayload;
}

/**
 * Creates a mock CognitoJwtVerifier instance whose verify() method returns currentMockPayload
 */
function createMockVerifier() {
  return {
    verify: vi.fn(async (token) => {
      if (token === 'invalid-token' || token === 'expired-token') {
        throw new Error('Invalid token');
      }
      return currentMockPayload;
    }),
  };
}

module.exports = {
  setMockJwtPayload,
  getMockJwtPayload,
  createMockVerifier,
};
