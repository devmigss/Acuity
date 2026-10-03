/**
 * Acuity — Production Admin Bootstrap CLI Script
 * 
 * Usage:
 *   node scripts/bootstrap-admin.js --email <email> [--cognitoId <id>]
 *   npm run admin:bootstrap -- --email <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  let email = null;
  let cognitoId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1].toLowerCase().trim();
      i++;
    } else if (args[i] === '--cognitoId' && args[i + 1]) {
      cognitoId = args[i + 1].trim();
      i++;
    }
  }

  if (!email) {
    console.error('Error: --email <email> is required');
    console.error('Example: node scripts/bootstrap-admin.js --email admin@example.com');
    process.exit(1);
  }

  console.log(`Bootstrapping Admin account for: ${email}`);

  // 1. Ensure Admin role exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  // 2. Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  const finalCognitoId = cognitoId || existingUser?.cognitoId || `bootstrap:${email}`;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      roleId: adminRole.id,
      tenantId: null, // Admins have global authority across tenants
      isActive: true,
      cognitoId: finalCognitoId,
    },
    create: {
      email,
      cognitoId: finalCognitoId,
      firstName: 'System',
      lastName: 'Admin',
      roleId: adminRole.id,
      tenantId: null,
      isActive: true,
      termsAcceptedAt: new Date(),
    },
    include: { role: true },
  });

  console.log('Admin account successfully bootstrapped:');
  console.log({
    id: user.id,
    email: user.email,
    role: user.role.name,
    tenantId: user.tenantId,
    cognitoId: user.cognitoId,
    isActive: user.isActive,
  });
}

main()
  .catch((err) => {
    console.error('Error bootstrapping admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
