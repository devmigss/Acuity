const request = require('supertest');
const sharp = require('sharp');
const app = require('../server');
const { testPrisma, truncateAllTables, createTestUser } = require('./helpers/db');

describe('Profile and Avatar Server Validation Tests (Part 3 & §7 Spec)', () => {
  let activeUser;
  let otherUser;
  let deactivatedUser;

  beforeAll(async () => {
    expect(process.env.DATABASE_URL).toContain('test');
  });

  beforeEach(async () => {
    await truncateAllTables(testPrisma);

    activeUser = await createTestUser(testPrisma, 'Student', {
      email: 'active.student@test.edu',
      cognitoId: 'cognito-active-student',
      firstName: 'OriginalFirst',
      lastName: 'OriginalLast',
      isActive: true,
    });

    otherUser = await createTestUser(testPrisma, 'Student', {
      email: 'other.student@test.edu',
      cognitoId: 'cognito-other-student',
      firstName: 'OtherFirst',
      lastName: 'OtherLast',
      isActive: true,
    });

    deactivatedUser = await createTestUser(testPrisma, 'Student', {
      email: 'deactivated.student@test.edu',
      cognitoId: 'cognito-deactivated-student',
      isActive: false,
    });
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it('1. Unauthenticated request to PATCH /api/me/profile returns 401', async () => {
    const res = await request(app)
      .patch('/api/me/profile')
      .send({ firstName: 'Test' });

    expect(res.status).toBe(401);
  });

  it('2. Deactivated user returns 403 on PATCH /api/me/profile', async () => {
    const res = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${deactivatedUser.email}`)
      .send({ firstName: 'Should', lastName: 'Fail' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_DEACTIVATED');
  });

  it("3. User cannot update someone else's profile (user resolved strictly from token)", async () => {
    const res = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        id: otherUser.id, // Attempting to target other user
        firstName: 'Hacked',
        lastName: 'Name',
      });

    // Body with 'id' is rejected as non-editable
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('FIELD_NOT_EDITABLE');

    // Confirm otherUser was NOT modified
    const untouched = await testPrisma.user.findUnique({ where: { id: otherUser.id } });
    expect(untouched.firstName).toBe('OtherFirst');
  });

  it('4. Trims and normalizes whitespace in name fields', async () => {
    const res = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: '   Juan    Carlos   ',
        lastName: '   De   La   Cruz   ',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Juan Carlos');
    expect(res.body.user.lastName).toBe('De La Cruz');

    const dbUser = await testPrisma.user.findUnique({ where: { id: activeUser.id } });
    expect(dbUser.firstName).toBe('Juan Carlos');
    expect(dbUser.lastName).toBe('De La Cruz');
  });

  it('5. Accepts Unicode names with Filipino characters, accents, hyphens, and apostrophes', async () => {
    const res = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'Ma. Cristina',
        lastName: "O'Brien-Peña",
        department: 'Biotechnology & Genetics',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Ma. Cristina');
    expect(res.body.user.lastName).toBe("O'Brien-Peña");
    expect(res.body.user.department).toBe('Biotechnology & Genetics');
  });

  it('6. Rejects digits or emojis in names with fieldErrors', async () => {
    const res = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'Juan3',
        lastName: 'Santos 🚀',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.fieldErrors).toBeDefined();
    expect(res.body.fieldErrors.firstName).toMatch(/Names can include letters/);
    expect(res.body.fieldErrors.lastName).toMatch(/Names can include letters/);
  });

  it('7. Rejects biography exceeding 500 characters and accepts 500 characters', async () => {
    // 501 characters
    const longBio = 'a'.repeat(501);
    const failRes = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'ValidFirst',
        lastName: 'ValidLast',
        biography: longBio,
      });

    expect(failRes.status).toBe(400);
    expect(failRes.body.code).toBe('VALIDATION_ERROR');
    expect(failRes.body.fieldErrors.biography).toMatch(/shorten it by 1/);

    // 500 characters exact
    const exactBio = 'b'.repeat(500);
    const passRes = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'ValidFirst',
        lastName: 'ValidLast',
        biography: exactBio,
      });

    expect(passRes.status).toBe(200);
    expect(passRes.body.user.bio).toBe(exactBio);
  });

  it('8. Rejects body containing email, role, or tenantId with 400 FIELD_NOT_EDITABLE', async () => {
    const emailRes = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'Valid',
        lastName: 'Name',
        email: 'attacker@evil.com',
      });

    expect(emailRes.status).toBe(400);
    expect(emailRes.body.code).toBe('FIELD_NOT_EDITABLE');

    const roleRes = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'Valid',
        lastName: 'Name',
        role: 'Admin',
      });

    expect(roleRes.status).toBe(400);
    expect(roleRes.body.code).toBe('FIELD_NOT_EDITABLE');

    const tenantRes = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .send({
        firstName: 'Valid',
        lastName: 'Name',
        tenantId: 'some-other-tenant',
      });

    expect(tenantRes.status).toBe(400);
    expect(tenantRes.body.code).toBe('FIELD_NOT_EDITABLE');
  });

  it('9. Rejects a .jpg file containing non-image fake bytes with 415', async () => {
    const fakeJpgBuffer = Buffer.from('NOT AN IMAGE FILE AT ALL - JUST TEXT DATA');

    const res = await request(app)
      .post('/api/me/avatar')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .attach('avatar', fakeJpgBuffer, 'avatar.jpg');

    expect(res.status).toBe(415);
    expect(res.body.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('10. Rejects an image > 5 MB with 413 FILE_TOO_LARGE', async () => {
    // 5.5 MB dummy buffer
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0);

    const res = await request(app)
      .post('/api/me/avatar')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .attach('avatar', largeBuffer, 'huge.png');

    expect(res.status).toBe(413);
    expect(res.body.code).toBe('FILE_TOO_LARGE');
  });

  it('11. Rejects an image smaller than 128x128 with 400 IMAGE_TOO_SMALL', async () => {
    const tinyBuffer = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .jpeg()
      .toBuffer();

    const res = await request(app)
      .post('/api/me/avatar')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .attach('avatar', tinyBuffer, 'tiny.jpg');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('IMAGE_TOO_SMALL');
  });

  it('12. Re-encodes valid image to square 512x512 WebP and strips EXIF metadata', async () => {
    // Create an image with EXIF metadata
    const sourceWithExif = await sharp({
      create: {
        width: 300,
        height: 200,
        channels: 3,
        background: { r: 20, g: 40, b: 80 },
      },
    })
      .withMetadata({
        exif: {
          IFD0: {
            Artist: 'Test Photographer',
            Make: 'Test Camera Corp',
          },
        },
      })
      .jpeg()
      .toBuffer();

    // Verify source has EXIF before sending
    const preMeta = await sharp(sourceWithExif).metadata();
    expect(preMeta.exif).toBeDefined();

    const res = await request(app)
      .post('/api/me/avatar')
      .set('Authorization', `Bearer mock-token-${activeUser.email}`)
      .attach('avatar', sourceWithExif, 'camera_photo.jpg');

    expect(res.status).toBe(200);
    expect(res.body.avatarUrl).toBeDefined();

    // Decode returned image
    let returnedBuffer;
    if (res.body.avatarUrl.startsWith('data:image/webp;base64,')) {
      const base64Data = res.body.avatarUrl.replace('data:image/webp;base64,', '');
      returnedBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // S3 URL in production
      expect(res.body.avatarUrl).toMatch(/\.webp$/);
      return;
    }

    const postMeta = await sharp(returnedBuffer).metadata();
    expect(postMeta.format).toBe('webp');
    expect(postMeta.width).toBe(512);
    expect(postMeta.height).toBe(512);
    // EXIF must be stripped
    expect(postMeta.exif).toBeUndefined();
  });
});
