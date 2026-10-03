// Vitest globals enabled in vitest.config.js: describe, it, expect, beforeAll, beforeEach, afterAll
const { testPrisma, truncateAllTables, createTestUser } = require('./helpers/db');
const { generateProjectCode } = require('../utils/nanoid');
const seed = require('../prisma/seed');

describe('Part 1 Baseline Database & Schema Tests', () => {
  beforeAll(async () => {
    // Safety verification: test database only
    expect(process.env.DATABASE_URL).toContain('test');
  });

  beforeEach(async () => {
    await truncateAllTables(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it('1. Fails when inserting a second PENDING or ACTIVE ProjectAdviser for the same project', async () => {
    const student = await createTestUser(testPrisma, 'Student');
    const faculty1 = await createTestUser(testPrisma, 'Faculty', { tenantId: student.tenantId });
    const faculty2 = await createTestUser(testPrisma, 'Faculty', { tenantId: student.tenantId });

    const project = await testPrisma.project.create({
      data: {
        code: generateProjectCode(),
        name: 'Bacterial Colony Counting Research',
        ownerId: student.id,
        tenantId: student.tenantId,
      },
    });

    // First open adviser link (PENDING)
    const firstAdviser = await testPrisma.projectAdviser.create({
      data: {
        projectId: project.id,
        adviserUserId: faculty1.id,
        status: 'PENDING',
        initiatedBy: 'STUDENT',
        requestedByUserId: student.id,
      },
    });
    expect(firstAdviser.id).toBeDefined();

    // Second open adviser link (ACTIVE) for the same project must fail due to partial unique index
    await expect(
      testPrisma.projectAdviser.create({
        data: {
          projectId: project.id,
          adviserUserId: faculty2.id,
          status: 'ACTIVE',
          initiatedBy: 'STUDENT',
          requestedByUserId: student.id,
        },
      })
    ).rejects.toThrow();

    // Second open adviser link (PENDING) for the same project must also fail
    await expect(
      testPrisma.projectAdviser.create({
        data: {
          projectId: project.id,
          adviserUserId: faculty2.id,
          status: 'PENDING',
          initiatedBy: 'STUDENT',
          requestedByUserId: student.id,
        },
      })
    ).rejects.toThrow();
  });

  it('2. Fails when attempting an UPDATE on AuditLog table (immutable trigger)', async () => {
    const log = await testPrisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        actorRole: 'Admin',
        resource: 'Auth',
        ip: '127.0.0.1',
      },
    });
    expect(log.id).toBeDefined();

    // Any UPDATE must be rejected by Postgres trigger audit_log_no_update_delete
    await expect(
      testPrisma.auditLog.update({
        where: { id: log.id },
        data: { action: 'TAMPERED_ACTION' },
      })
    ).rejects.toThrow(/AuditLog is append-only/i);
  });

  it('3. Fails when attempting a DELETE on AuditLog table (immutable trigger)', async () => {
    const log = await testPrisma.auditLog.create({
      data: {
        action: 'PROJECT_DELETED',
        actorRole: 'Admin',
        resource: 'Project',
        ip: '127.0.0.1',
      },
    });
    expect(log.id).toBeDefined();

    // Any DELETE must be rejected by Postgres trigger audit_log_no_update_delete
    await expect(
      testPrisma.auditLog.delete({
        where: { id: log.id },
      })
    ).rejects.toThrow(/AuditLog is append-only/i);
  });

  it('4. Seed script runs twice without errors and is completely idempotent', async () => {
    // Run seed first time
    await seed.main();

    // Verify initial seeded records
    const tenantsFirst = await testPrisma.tenant.findMany();
    expect(tenantsFirst).toHaveLength(1);
    expect(tenantsFirst[0].institutionName).toBe('Acuity Dev Institution');
    expect(tenantsFirst[0].emailDomain).toBe('gmail.com');

    const adminFirst = await testPrisma.user.findUnique({
      where: { email: 'acuityadmincfu@gmail.com' },
      include: { role: true },
    });
    expect(adminFirst).toBeDefined();
    expect(adminFirst.role.name).toBe('Admin');
    expect(adminFirst.tenantId).toBeNull();
    expect(adminFirst.cognitoId).toBe('seed:acuityadmincfu@gmail.com');

    const facultyFirst = await testPrisma.user.findUnique({
      where: { email: 'acuityfacultycfu@gmail.com' },
      include: { role: true },
    });
    expect(facultyFirst).toBeDefined();
    expect(facultyFirst.role.name).toBe('Faculty');
    expect(facultyFirst.tenantId).toBe(tenantsFirst[0].id);
    expect(facultyFirst.cognitoId).toBe('seed:acuityfacultycfu@gmail.com');

    const whitelistFirst = await testPrisma.facultyWhitelist.findUnique({
      where: { allowedEmail: 'acuityfacultycfu@gmail.com' },
    });
    expect(whitelistFirst).toBeDefined();
    expect(whitelistFirst.status).toBe('REGISTERED');
    expect(whitelistFirst.registeredUserId).toBe(facultyFirst.id);

    // Run seed second time (idempotency check)
    await seed.main();

    // Verify records are unchanged and count is identical
    const tenantsSecond = await testPrisma.tenant.findMany();
    expect(tenantsSecond).toHaveLength(1);

    const usersSecond = await testPrisma.user.findMany();
    expect(usersSecond).toHaveLength(2);

    const whitelistSecond = await testPrisma.facultyWhitelist.findMany();
    expect(whitelistSecond).toHaveLength(1);
  });
});
