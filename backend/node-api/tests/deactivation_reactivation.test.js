const request = require('supertest');
const app = require('../server');
const { testPrisma, truncateAllTables, createTestUser } = require('./helpers/db');
const seed = require('../prisma/seed');

describe('Account Deactivation & Reactivation Requests (deactivation_reactivation.test.js)', () => {
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

  describe('1. Account Deactivation (/api/me/deactivate)', () => {
    it('rejects deactivation if confirmation text is missing or wrong (400)', async () => {
      const student = await createTestUser(testPrisma, 'Student');

      const res = await request(app)
        .post('/api/me/deactivate')
        .set('Authorization', `Bearer mock-token-${student.email}`)
        .send({ confirmation: 'deactivate' }); // lowercase is wrong

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_CONFIRMATION');

      // User remains active in DB
      const dbUser = await testPrisma.user.findUnique({ where: { id: student.id } });
      expect(dbUser.isActive).toBe(true);
    });

    it('rejects Admin self-deactivation (403 ADMIN_CANNOT_SELF_DEACTIVATE)', async () => {
      const admin = await createTestUser(testPrisma, 'Admin');

      const res = await request(app)
        .post('/api/me/deactivate')
        .set('Authorization', `Bearer mock-token-${admin.email}`)
        .send({ confirmation: 'DEACTIVATE' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ADMIN_CANNOT_SELF_DEACTIVATE');

      const dbAdmin = await testPrisma.user.findUnique({ where: { id: admin.id } });
      expect(dbAdmin.isActive).toBe(true);
    });

    it('successfully deactivates student account: sets isActive=false, deactivatedAt, deactivatedBy=SELF', async () => {
      const student = await createTestUser(testPrisma, 'Student');

      const res = await request(app)
        .post('/api/me/deactivate')
        .set('Authorization', `Bearer mock-token-${student.email}`)
        .send({ confirmation: 'DEACTIVATE' });

      expect(res.status).toBe(200);

      const dbUser = await testPrisma.user.findUnique({ where: { id: student.id } });
      expect(dbUser.isActive).toBe(false);
      expect(dbUser.deactivatedBy).toBe('SELF');
      expect(dbUser.deactivatedAt).not.toBeNull();
      expect(dbUser.sessionsValidAfter).not.toBeNull();

      // Inactive user gets 403 on normal routes
      const meRes = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer mock-token-${student.email}`);

      expect(meRes.status).toBe(403);
      expect(meRes.body.code).toBe('ACCOUNT_DEACTIVATED');

      // But gets 200 on /api/auth/status
      const statusRes = await request(app)
        .get('/api/auth/status')
        .set('Authorization', `Bearer mock-token-${student.email}`);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.state).toBe('SELF');
      expect(statusRes.body.deactivatedBy).toBe('SELF');
      expect(statusRes.body.pendingRequest).toBeNull();
    });

    it('cascades faculty deactivation: ACTIVE links -> REMOVED, PENDING -> CANCELLED, notifies project owners', async () => {
      const faculty = await createTestUser(testPrisma, 'Faculty');
      const student = await createTestUser(testPrisma, 'Student');

      // Create a project owned by student
      const project = await testPrisma.project.create({
        data: {
          code: `PRJ-${Date.now().toString(36).toUpperCase()}`,
          name: 'Cancer Cell Detection Research',
          tenantId: student.tenantId,
          ownerId: student.id,
        },
      });

      // Link faculty as ACTIVE adviser
      const activeLink = await testPrisma.projectAdviser.create({
        data: {
          projectId: project.id,
          adviserUserId: faculty.id,
          status: 'ACTIVE',
          initiatedBy: 'STUDENT',
          requestedByUserId: student.id,
        },
      });

      // Link another as PENDING
      const project2 = await testPrisma.project.create({
        data: {
          code: `PRJ2-${Date.now().toString(36).toUpperCase()}`,
          name: 'Genomic Profiling Analysis',
          tenantId: student.tenantId,
          ownerId: student.id,
        },
      });

      const pendingLink = await testPrisma.projectAdviser.create({
        data: {
          projectId: project2.id,
          adviserUserId: faculty.id,
          status: 'PENDING',
          initiatedBy: 'STUDENT',
          requestedByUserId: student.id,
        },
      });

      // Deactivate faculty
      const res = await request(app)
        .post('/api/me/deactivate')
        .set('Authorization', `Bearer mock-token-${faculty.email}`)
        .send({ confirmation: 'DEACTIVATE' });

      expect(res.status).toBe(200);

      // Verify links updated
      const updatedActive = await testPrisma.projectAdviser.findUnique({ where: { id: activeLink.id } });
      expect(updatedActive.status).toBe('REMOVED');

      const updatedPending = await testPrisma.projectAdviser.findUnique({ where: { id: pendingLink.id } });
      expect(updatedPending.status).toBe('CANCELLED');

      // Verify notifications created for project owner
      const notifications = await testPrisma.notification.findMany({
        where: { userId: student.id, type: 'ADVISER_DEACTIVATED' },
      });
      expect(notifications.length).toBe(2);
    });
  });

  describe('2. Session Revocation (/api/me/sessions/revoke)', () => {
    it('revokes sessions and invalidates tokens with iat < sessionsValidAfter (401 SESSION_REVOKED)', async () => {
      const student = await createTestUser(testPrisma, 'Student');
      const nowSeconds = Math.floor(Date.now() / 1000);

      // Token issued 100 seconds ago
      const oldTokenIat = nowSeconds - 100;
      const oldToken = `mock-token-iat-${oldTokenIat}-${student.email}`;

      // Call /api/me/sessions/revoke
      const revokeRes = await request(app)
        .post('/api/me/sessions/revoke')
        .set('Authorization', `Bearer mock-token-${student.email}`);

      expect(revokeRes.status).toBe(200);

      // Verify old token is now rejected with 401 SESSION_REVOKED
      const rejectedRes = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${oldToken}`);

      expect(rejectedRes.status).toBe(401);
      expect(rejectedRes.body.code).toBe('SESSION_REVOKED');

      // Token issued AFTER sessionsValidAfter works
      const newTokenIat = nowSeconds + 60;
      const newToken = `mock-token-iat-${newTokenIat}-${student.email}`;

      const acceptedRes = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${newToken}`);

      expect(acceptedRes.status).toBe(200);
      expect(acceptedRes.body.user.email).toBe(student.email);
    });
  });

  describe('3. Reactivation Requests (/api/auth/reactivation-request)', () => {
    it('creates a reactivation request for an inactive account and notifies admins', async () => {
      const student = await createTestUser(testPrisma, 'Student', {
        isActive: false,
        deactivatedBy: 'SELF',
        deactivatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/reactivation-request')
        .set('Authorization', `Bearer mock-token-${student.email}`)
        .send({ message: 'I need access back for my research project.' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Request sent.');
      expect(res.body.request).toBeDefined();
      expect(res.body.request.status).toBe('PENDING');
      expect(res.body.request.message).toBe('I need access back for my research project.');

      // Check admin notification
      const adminNotif = await testPrisma.notification.findFirst({
        where: { type: 'REACTIVATION_REQUESTED' },
      });
      expect(adminNotif).not.toBeNull();
    });

    it('rejects duplicate pending request (409)', async () => {
      const student = await createTestUser(testPrisma, 'Student', {
        isActive: false,
        deactivatedBy: 'SELF',
        deactivatedAt: new Date(),
      });

      // Create first pending request
      await testPrisma.reactivationRequest.create({
        data: {
          userId: student.id,
          message: 'First pending',
          status: 'PENDING',
        },
      });

      // Attempt second request
      const res = await request(app)
        .post('/api/auth/reactivation-request')
        .set('Authorization', `Bearer mock-token-${student.email}`)
        .send({ message: 'Duplicate request attempt' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('DUPLICATE_PENDING_REQUEST');
    });

    it('enforces 24-hour rate limit on reactivation requests (429)', async () => {
      const student = await createTestUser(testPrisma, 'Student', {
        isActive: false,
        deactivatedBy: 'SELF',
        deactivatedAt: new Date(),
      });

      // Existing denied request resolved 2 hours ago
      await testPrisma.reactivationRequest.create({
        data: {
          userId: student.id,
          message: 'Previous request',
          status: 'DENIED',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      });

      // Attempt another request within 24 hours
      const res = await request(app)
        .post('/api/auth/reactivation-request')
        .set('Authorization', `Bearer mock-token-${student.email}`)
        .send({ message: 'Second attempt within 24h' });

      expect(res.status).toBe(429);
      expect(res.body.code).toBe('RATE_LIMITED');
    });

    it('rejects reactivation request for ACCESS_REVOKED faculty user (403)', async () => {
      const faculty = await createTestUser(testPrisma, 'Faculty', {
        isActive: false,
        deactivatedBy: 'ADMIN',
      });

      // Whitelist entry marked REVOKED
      await testPrisma.facultyWhitelist.create({
        data: {
          allowedEmail: faculty.email,
          tenantId: faculty.tenantId,
          addedByAdminId: faculty.id,
          status: 'REVOKED',
          registeredUserId: faculty.id,
        },
      });

      const res = await request(app)
        .post('/api/auth/reactivation-request')
        .set('Authorization', `Bearer mock-token-${faculty.email}`)
        .send({ message: 'Please unrevoke my access' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCESS_REVOKED_NO_REQUEST');
    });
  });

  describe('4. Admin Approval & Denial (/api/admin/reactivation-requests)', () => {
    it('Admin approve: restores user isActive=true, clears deactivatedAt/By, and allows user to login/access routes', async () => {
      const admin = await createTestUser(testPrisma, 'Admin');
      const student = await createTestUser(testPrisma, 'Student', {
        isActive: false,
        deactivatedBy: 'SELF',
        deactivatedAt: new Date(),
      });

      const requestEntry = await testPrisma.reactivationRequest.create({
        data: {
          userId: student.id,
          message: 'Please reactivate me',
          status: 'PENDING',
        },
      });

      // Admin approves request
      const res = await request(app)
        .post(`/api/admin/reactivation-requests/${requestEntry.id}/approve`)
        .set('Authorization', `Bearer mock-token-${admin.email}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.request.status).toBe('APPROVED');

      // User in DB is restored
      const restoredUser = await testPrisma.user.findUnique({ where: { id: student.id } });
      expect(restoredUser.isActive).toBe(true);
      expect(restoredUser.deactivatedAt).toBeNull();
      expect(restoredUser.deactivatedBy).toBeNull();

      // Student can now access normal routes
      const meRes = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer mock-token-${student.email}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe(student.email);
    });

    it('Admin deny: records denyReason and keeps user account inactive', async () => {
      const admin = await createTestUser(testPrisma, 'Admin');
      const student = await createTestUser(testPrisma, 'Student', {
        isActive: false,
        deactivatedBy: 'ADMIN',
        deactivatedAt: new Date(),
      });

      const requestEntry = await testPrisma.reactivationRequest.create({
        data: {
          userId: student.id,
          message: 'Please reactivate',
          status: 'PENDING',
        },
      });

      const res = await request(app)
        .post(`/api/admin/reactivation-requests/${requestEntry.id}/deny`)
        .set('Authorization', `Bearer mock-token-${admin.email}`)
        .send({ reason: 'Graduated / term completed.' });

      expect(res.status).toBe(200);
      expect(res.body.request.status).toBe('DENIED');
      expect(res.body.request.denyReason).toBe('Graduated / term completed.');

      // User remains inactive
      const userDb = await testPrisma.user.findUnique({ where: { id: student.id } });
      expect(userDb.isActive).toBe(false);

      // Student still blocked on normal routes
      const meRes = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer mock-token-${student.email}`);

      expect(meRes.status).toBe(403);
      expect(meRes.body.code).toBe('ACCOUNT_DEACTIVATED');
    });
  });
});
