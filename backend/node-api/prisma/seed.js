const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed blocked in production');
  }

  console.log('Seeding Acuity database...');

  // 1. Upsert roles
  const roles = ['Student', 'Faculty', 'Admin'];
  const roleMap = {};
  for (const name of roles) {
    roleMap[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Roles seeded: Student, Faculty, Admin');

  // 2. Dev tenant
  const devTenant = await prisma.tenant.upsert({
    where: { emailDomain: 'gmail.com' },
    update: {
      institutionName: 'Acuity Dev Institution',
      isActive: true,
    },
    create: {
      institutionName: 'Acuity Dev Institution',
      emailDomain: 'gmail.com',
      isActive: true,
    },
  });
  console.log(`Dev Tenant seeded: ${devTenant.institutionName} (${devTenant.emailDomain})`);

  // 3. Admin User (acuityadmincfu@gmail.com) -> tenantId is null
  const adminEmail = 'acuityadmincfu@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const adminCognitoId =
    existingAdmin?.cognitoId && !existingAdmin.cognitoId.startsWith('seed:')
      ? existingAdmin.cognitoId
      : `seed:${adminEmail}`;

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      cognitoId: adminCognitoId,
      roleId: roleMap['Admin'].id,
      tenantId: null,
      isActive: true,
    },
    create: {
      email: adminEmail,
      cognitoId: adminCognitoId,
      firstName: 'Acuity',
      lastName: 'Admin',
      roleId: roleMap['Admin'].id,
      tenantId: null,
      isActive: true,
    },
  });
  console.log(`Admin User seeded: ${adminUser.email} (tenantId = null)`);

  // 4. Faculty User (acuityfacultycfu@gmail.com) -> devTenant
  const facultyEmail = 'acuityfacultycfu@gmail.com';
  const existingFaculty = await prisma.user.findUnique({ where: { email: facultyEmail } });
  const facultyCognitoId =
    existingFaculty?.cognitoId && !existingFaculty.cognitoId.startsWith('seed:')
      ? existingFaculty.cognitoId
      : `seed:${facultyEmail}`;

  const facultyUser = await prisma.user.upsert({
    where: { email: facultyEmail },
    update: {
      cognitoId: facultyCognitoId,
      roleId: roleMap['Faculty'].id,
      tenantId: devTenant.id,
      isActive: true,
    },
    create: {
      email: facultyEmail,
      cognitoId: facultyCognitoId,
      firstName: 'Acuity',
      lastName: 'Faculty',
      roleId: roleMap['Faculty'].id,
      tenantId: devTenant.id,
      isActive: true,
    },
  });
  console.log(`Faculty User seeded: ${facultyUser.email} (tenantId = ${devTenant.id})`);

  // 5. Faculty Whitelist row -> REGISTERED status, linked to faculty user
  const whitelistRow = await prisma.facultyWhitelist.upsert({
    where: { allowedEmail: facultyEmail },
    update: {
      tenantId: devTenant.id,
      status: 'REGISTERED',
      addedByAdminId: adminUser.id,
      registeredUserId: facultyUser.id,
    },
    create: {
      allowedEmail: facultyEmail,
      tenantId: devTenant.id,
      status: 'REGISTERED',
      addedByAdminId: adminUser.id,
      registeredUserId: facultyUser.id,
    },
  });
  console.log(`Faculty Whitelist seeded: ${whitelistRow.allowedEmail} (status = ${whitelistRow.status})`);

  console.log('Seeding completed successfully.');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Error during database seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { main, prisma };
