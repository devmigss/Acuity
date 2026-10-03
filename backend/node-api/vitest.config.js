const path = require('path');
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  resolve: {
    alias: {
      '@prisma/client': path.resolve(__dirname, './node_modules/@prisma/client'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
  },
});
