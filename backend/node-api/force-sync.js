const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address: node force-sync.js <email>");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  console.log(`Forcing sync for Admin account: ${normalizedEmail}`);

  let role = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'Admin' } });
  }

  // Create or update user as Admin with tenantId = null
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      roleId: role.id,
      tenantId: null,
      isActive: true,
    },
    create: {
      email: normalizedEmail,
      cognitoId: 'manual-admin-' + Date.now(),
      firstName: 'Admin',
      lastName: 'User',
      tenantId: null,
      roleId: role.id,
      isActive: true,
    },
  });

  console.log("Successfully created/updated Admin user:");
  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
