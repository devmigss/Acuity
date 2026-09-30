const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
  }

  console.log(`Forcing sync for: ${email}`);

  // Create default tenant and role if they don't exist
  let tenant = await prisma.tenant.findFirst({ where: { name: 'Default' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: 'Default' } });
  }

  let role = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'Admin' } });
  }

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      roleId: role.id
    },
    create: {
      email,
      cognitoId: 'manual-admin-' + Date.now(),
      firstName: 'Admin',
      lastName: 'User',
      tenantId: tenant.id,
      roleId: role.id
    }
  });

  console.log("Successfully created/updated Admin user:");
  console.log(user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
