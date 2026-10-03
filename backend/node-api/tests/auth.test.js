const request = require('supertest');
const app = require('../server');
const { testPrisma, truncateAllTables, createTestUser } = require('./helpers/db');
const seed = require('../prisma/seed');

describe('Part 2 Authentication, Sync & Guarding Tests (auth.test.js)', () => {
  beforeAll(async () => {
    expect(process.env.DATABASE_URL).toContain('test');
  });

  beforeEach(async () => {
    await truncateAllTables(testPrisma);
    await seed.main();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it('1. Both seeded dev accounts sync successfully and seed cognitoId is linked', async () => {
    // Sync Admin seed account
    const adminRes = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-acuityadmincfu@gmail.com')
      .send({ firstName: 'Seed', lastName: 'Admin' });

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.user).toBeDefined();
    expect(adminRes.body.user.role?.name || adminRes.body.user.role).toBe('Admin');
    expect(adminRes.body.user.email).toBe('acuityadmincfu@gmail.com');

    // Verify DB cognitoId was updated from seed:acuityadmincfu@gmail.com
    const adminDb = await testPrisma.user.findUnique({
      where: { email: 'acuityadmincfu@gmail.com' },
    });
    expect(adminDb.cognitoId).toBe('cognito-mock-acuityadmincfu@gmail.com');

    // Sync Faculty seed account
    const facultyRes = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-acuityfacultycfu@gmail.com')
      .send({ firstName: 'Seed', lastName: 'Faculty' });

    expect(facultyRes.status).toBe(200);
    expect(facultyRes.body.user).toBeDefined();
    expect(facultyRes.body.user.role?.name || facultyRes.body.user.role).toBe('Faculty');
    expect(facultyRes.body.user.email).toBe('acuityfacultycfu@gmail.com');

    // Verify DB cognitoId was updated from seed:acuityfacultycfu@gmail.com
    const facultyDb = await testPrisma.user.findUnique({
      where: { email: 'acuityfacultycfu@gmail.com' },
    });
    expect(facultyDb.cognitoId).toBe('cognito-mock-acuityfacultycfu@gmail.com');
  });

  it('2. Forged req.body.email is ignored (email taken strictly from verified token)', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-acuityadmincfu@gmail.com')
      .send({
        email: 'hacker@victim.org',
        firstName: 'Impostor',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('acuityadmincfu@gmail.com');

    const victim = await testPrisma.user.findUnique({
      where: { email: 'hacker@victim.org' },
    });
    expect(victim).toBeNull();
  });

  it('3. Token without email_verified: true is rejected (401)', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-unverified-unverified@gmail.com')
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
    expect(res.body.error).toMatch(/verified/i);
  });

  it('4. Token without email claim is rejected (401)', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-noemail')
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
    expect(res.body.error).toMatch(/missing verified email/i);
  });

  it('5. Whitelisted email creates Faculty user assigned to the whitelist tenantId', async () => {
    const admin = await testPrisma.user.findUnique({ where: { email: 'acuityadmincfu@gmail.com' } });
    const tenant = await testPrisma.tenant.create({
      data: {
        institutionName: 'University of Santo Tomas',
        emailDomain: 'ust.edu.ph',
        isActive: true,
      },
    });

    const whitelist = await testPrisma.facultyWhitelist.create({
      data: {
        allowedEmail: 'prof.santos@ust.edu.ph',
        tenantId: tenant.id,
        addedByAdminId: admin.id,
        status: 'PENDING_REGISTRATION',
      },
    });

    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-prof.santos@ust.edu.ph')
      .send({ firstName: 'Maria', lastName: 'Santos' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.user.role?.name || res.body.user.role).toBe('Faculty');
    expect(res.body.user.email).toBe('prof.santos@ust.edu.ph');
    expect(res.body.user.tenantId).toBe(tenant.id);

    // Whitelist entry must be marked REGISTERED
    const updatedWhitelist = await testPrisma.facultyWhitelist.findUnique({
      where: { id: whitelist.id },
    });
    expect(updatedWhitelist.status).toBe('REGISTERED');
    expect(updatedWhitelist.registeredUserId).toBe(res.body.user.id);
    expect(updatedWhitelist.claimedAt).not.toBeNull();
  });

  it('6. Non-whitelisted email with unknown domain returns 403 UNRECOGNIZED_INSTITUTION', async () => {
    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-random@unknownuniversity.org')
      .send({ firstName: 'Stranger', lastName: 'Danger' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('UNRECOGNIZED_INSTITUTION');

    const user = await testPrisma.user.findUnique({
      where: { email: 'random@unknownuniversity.org' },
    });
    expect(user).toBeNull();
  });

  it('7. Non-whitelisted email with recognized tenant domain creates Student user', async () => {
    const tenant = await testPrisma.tenant.create({
      data: {
        institutionName: 'Ateneo de Manila University',
        emailDomain: 'admu.edu.ph',
        isActive: true,
      },
    });

    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-student1@admu.edu.ph')
      .send({ firstName: 'Juan', lastName: 'Dela Cruz' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.user.role?.name || res.body.user.role).toBe('Student');
    expect(res.body.user.email).toBe('student1@admu.edu.ph');
    expect(res.body.user.tenantId).toBe(tenant.id);
  });

  it('8. Revoked faculty whitelist returns 403 ACCESS_REVOKED', async () => {
    const admin = await testPrisma.user.findUnique({ where: { email: 'acuityadmincfu@gmail.com' } });
    const tenant = await testPrisma.tenant.create({
      data: {
        institutionName: 'De La Salle University',
        emailDomain: 'dlsu.edu.ph',
        isActive: true,
      },
    });

    await testPrisma.facultyWhitelist.create({
      data: {
        allowedEmail: 'revoked.faculty@dlsu.edu.ph',
        tenantId: tenant.id,
        addedByAdminId: admin.id,
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', 'Bearer mock-token-revoked.faculty@dlsu.edu.ph')
      .send();

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCESS_REVOKED');
  });

  it('9. Deactivated user (isActive: false) with valid token returns 403 ACCOUNT_DEACTIVATED', async () => {
    const deactivatedStudent = await createTestUser(testPrisma, 'Student', {
      isActive: false,
      email: 'deactivated.student@gmail.com',
    });

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer mock-token-${deactivatedStudent.email}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_DEACTIVATED');
  });

  it('10. User from suspended tenant returns 403 TENANT_SUSPENDED', async () => {
    const suspendedTenant = await testPrisma.tenant.create({
      data: {
        institutionName: 'Suspended College',
        emailDomain: 'suspended.edu',
        isActive: false,
      },
    });

    const student = await createTestUser(testPrisma, 'Student', {
      tenantId: suspendedTenant.id,
      email: 'student@suspended.edu',
    });

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer mock-token-${student.email}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('TENANT_SUSPENDED');
  });

  it('11. Concurrent sync requests claim whitelist atomically without duplicate users', async () => {
    const admin = await testPrisma.user.findUnique({ where: { email: 'acuityadmincfu@gmail.com' } });
    const tenant = await testPrisma.tenant.create({
      data: {
        institutionName: 'Polytechnic University',
        emailDomain: 'pup.edu.ph',
        isActive: true,
      },
    });

    await testPrisma.facultyWhitelist.create({
      data: {
        allowedEmail: 'race.faculty@pup.edu.ph',
        tenantId: tenant.id,
        addedByAdminId: admin.id,
        status: 'PENDING_REGISTRATION',
      },
    });

    // Fire 2 concurrent sync calls
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer mock-token-race.faculty@pup.edu.ph')
        .send({ firstName: 'Race', lastName: 'One' }),
      request(app)
        .post('/api/auth/sync')
        .set('Authorization', 'Bearer mock-token-race.faculty@pup.edu.ph')
        .send({ firstName: 'Race', lastName: 'Two' }),
    ]);

    // Exactly one call should claim the registration (200/201), the other may return 200/201 or 409
    const statuses = [res1.status, res2.status];
    expect(statuses.some((s) => s === 200 || s === 201)).toBe(true);
    expect(statuses.every((s) => [200, 201, 409].includes(s))).toBe(true);

    // Verify only 1 user was created in the database
    const users = await testPrisma.user.findMany({
      where: { email: 'race.faculty@pup.edu.ph' },
    });
    expect(users).toHaveLength(1);
    expect(users[0].roleId).toBeDefined();

    // Whitelist is REGISTERED and references that single user
    const wl = await testPrisma.facultyWhitelist.findUnique({
      where: { allowedEmail: 'race.faculty@pup.edu.ph' },
    });
    expect(wl.status).toBe('REGISTERED');
    expect(wl.registeredUserId).toBe(users[0].id);
  });

  it('12. Non-sync route accessed by un-synced Cognito token returns 401 NOT_SYNCED', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer mock-token-brandnew@unknown.edu');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NOT_SYNCED');
  });

  it('13. Existing user profile name is not overwritten on sync', async () => {
    const user = await createTestUser(testPrisma, 'Student', {
      email: 'custom.profile@gmail.com',
      firstName: 'ExistingFirst',
      lastName: 'ExistingLast',
    });

    const res = await request(app)
      .post('/api/auth/sync')
      .set('Authorization', `Bearer mock-token-${user.email}`)
      .send({ firstName: 'NewFirst', lastName: 'NewLast' });

    expect(res.status).toBe(200);

    const refreshed = await testPrisma.user.findUnique({
      where: { id: user.id },
    });
    expect(refreshed.firstName).toBe('ExistingFirst');
    expect(refreshed.lastName).toBe('ExistingLast');
  });
});
