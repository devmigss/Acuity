const request = require('supertest');
const app = require('../server');
const { testPrisma, truncateAllTables, createTestUser } = require('./helpers/db');
const { tenantScope } = require('../middleware/rbac');
const { generateProjectCode } = require('../utils/nanoid');
const seed = require('../prisma/seed');

describe('Part 2 RBAC & Tenant Isolation Tests (rbac.test.js)', () => {
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

  it('1. Non-admin user hitting /api/admin/* returns 403 FORBIDDEN', async () => {
    const student = await createTestUser(testPrisma, 'Student');
    const faculty = await createTestUser(testPrisma, 'Faculty');

    // Student hitting admin whitelist
    const studentRes = await request(app)
      .get('/api/admin/whitelist')
      .set('Authorization', `Bearer mock-token-${student.email}`);

    expect(studentRes.status).toBe(403);
    expect(studentRes.body.code).toBe('FORBIDDEN');

    // Faculty hitting admin whitelist
    const facultyRes = await request(app)
      .get('/api/admin/whitelist')
      .set('Authorization', `Bearer mock-token-${faculty.email}`);

    expect(facultyRes.status).toBe(403);
    expect(facultyRes.body.code).toBe('FORBIDDEN');
  });

  it('2. Non-admin user hitting /api/users returns 403 FORBIDDEN', async () => {
    const student = await createTestUser(testPrisma, 'Student');

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer mock-token-${student.email}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('3. Admin user hitting /api/admin/* and /api/users succeeds (200)', async () => {
    const adminRes = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer mock-token-acuityadmincfu@gmail.com');

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.users).toBeDefined();

    const whitelistRes = await request(app)
      .get('/api/admin/whitelist')
      .set('Authorization', 'Bearer mock-token-acuityadmincfu@gmail.com');

    expect(whitelistRes.status).toBe(200);
    expect(whitelistRes.body.whitelist).toBeDefined();
  });

  it('4. Cross-tenant project access returns 404 NOT_FOUND (masked isolation)', async () => {
    // Tenant A
    const tenantA = await testPrisma.tenant.create({
      data: { institutionName: 'Tenant A', emailDomain: 'tenanta.edu', isActive: true },
    });
    const studentA = await createTestUser(testPrisma, 'Student', { tenantId: tenantA.id });

    // Project belonging to Tenant A
    const projectA = await testPrisma.project.create({
      data: {
        code: generateProjectCode(),
        name: 'Project in Tenant A',
        ownerId: studentA.id,
        tenantId: tenantA.id,
      },
    });

    // Tenant B
    const tenantB = await testPrisma.tenant.create({
      data: { institutionName: 'Tenant B', emailDomain: 'tenantb.edu', isActive: true },
    });
    const studentB = await createTestUser(testPrisma, 'Student', { tenantId: tenantB.id });

    // Student B requests project A -> Must return 404, NOT 403 (mask existence)
    const res = await request(app)
      .get(`/api/projects/${projectA.id}`)
      .set('Authorization', `Bearer mock-token-${studentB.email}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('5. Project owner and collaborators have access; non-member in same tenant gets 403', async () => {
    const tenant = await testPrisma.tenant.create({
      data: { institutionName: 'Research Uni', emailDomain: 'runi.edu', isActive: true },
    });

    const owner = await createTestUser(testPrisma, 'Student', { tenantId: tenant.id });
    const collaborator = await createTestUser(testPrisma, 'Student', { tenantId: tenant.id });
    const outsiderSameTenant = await createTestUser(testPrisma, 'Student', { tenantId: tenant.id });

    const project = await testPrisma.project.create({
      data: {
        code: generateProjectCode(),
        name: 'Microbiology Project',
        ownerId: owner.id,
        tenantId: tenant.id,
      },
    });

    // Add collaborator to project members
    await testPrisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: collaborator.id,
        permissionLevel: 'EDITOR',
      },
    });

    // Owner access -> 200
    const ownerRes = await request(app)
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer mock-token-${owner.email}`);
    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.project.id).toBe(project.id);

    // Collaborator access -> 200
    const collabRes = await request(app)
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer mock-token-${collaborator.email}`);
    expect(collabRes.status).toBe(200);
    expect(collabRes.body.project.id).toBe(project.id);

    // Same tenant, but non-member -> 403 FORBIDDEN
    const outsiderRes = await request(app)
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer mock-token-${outsiderSameTenant.email}`);
    expect(outsiderRes.status).toBe(403);
    expect(outsiderRes.body.code).toBe('FORBIDDEN');
  });

  it('6. tenantScope helper filters by tenantId for institutional users and empty for Admin', () => {
    const studentUser = { id: 'u1', role: { name: 'Student' }, tenantId: 't-123' };
    const facultyUser = { id: 'u2', role: { name: 'Faculty' }, tenantId: 't-456' };
    const adminUser = { id: 'u3', role: { name: 'Admin' }, tenantId: null };

    expect(tenantScope(studentUser)).toEqual({ tenantId: 't-123' });
    expect(tenantScope(facultyUser)).toEqual({ tenantId: 't-456' });
    expect(tenantScope(adminUser)).toEqual({});
  });
});
