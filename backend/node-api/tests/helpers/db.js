const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('test')) {
  throw new Error(`ABORT: DATABASE_URL must contain "test"! Current: ${process.env.DATABASE_URL}`);
}

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Truncate all public tables in test DB except _prisma_migrations.
 * Using TRUNCATE CASCADE because the AuditLog trigger forbids row DELETE.
 */
async function truncateAllTables(prisma = testPrisma) {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('test')) {
    throw new Error('Refusing to truncate non-test database!');
  }
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';
  `;
  const tables = tablenames.map(({ tablename }) => `"${tablename}"`).join(', ');
  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  }
}

/**
 * Helper to create a test user directly in the database.
 */
async function createTestUser(prisma = testPrisma, roleName = 'Student', overrides = {}) {
  // Ensure role exists
  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName },
  });

  // Ensure tenant exists if role is non-admin and tenantId not specified
  let tenantId = overrides.tenantId;
  if (tenantId === undefined && roleName !== 'Admin') {
    const tenant = await prisma.tenant.upsert({
      where: { emailDomain: 'test-institution.edu' },
      update: {},
      create: {
        institutionName: 'Test Institution',
        emailDomain: 'test-institution.edu',
        isActive: true,
      },
    });
    tenantId = tenant.id;
  }

  const idSuffix = Math.random().toString(36).substring(2, 8);
  const email = overrides.email || `test-${roleName.toLowerCase()}-${idSuffix}@test.edu`;
  const cognitoId = overrides.cognitoId || `cognito-${roleName.toLowerCase()}-${idSuffix}`;

  return await prisma.user.create({
    data: {
      email,
      cognitoId,
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || roleName,
      roleId: role.id,
      tenantId: tenantId !== undefined ? tenantId : null,
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
      termsAcceptedAt: overrides.termsAcceptedAt || null,
      avatarUrl: overrides.avatarUrl || null,
    },
    include: {
      role: true,
      tenant: true,
    },
  });
}

module.exports = {
  testPrisma,
  truncateAllTables,
  createTestUser,
};
