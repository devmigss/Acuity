// Test environment setup
process.env.NODE_ENV = 'test';

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('test')) {
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/acuity_test?schema=public';
}

if (!process.env.DATABASE_URL.includes('test')) {
  throw new Error(`ABORT: DATABASE_URL must contain "test" to prevent touching production or dev databases! Current: ${process.env.DATABASE_URL}`);
}
