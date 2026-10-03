import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    env: {
      // Stub values so cognito.js doesn't throw "Both UserPoolId and ClientId are required"
      // in CI where real env vars are absent. These are never used for actual auth.
      VITE_AWS_USER_POOL_ID: 'us-east-1_TESTONLY',
      VITE_AWS_CLIENT_ID: '1234567890abcdefTESTONLY',
    },
  },
});
