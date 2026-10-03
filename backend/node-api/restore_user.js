const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'juanmiguel.gonzales.cics@ust.edu.ph';
  
  console.log(`Attempting to recreate user: ${email}...`);

  // Find or create tenant matching domain
  let tenant = await prisma.tenant.findFirst({ where: { emailDomain: 'ust.edu.ph' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        institutionName: 'University of Santo Tomas',
        emailDomain: 'ust.edu.ph',
        isActive: true,
      },
    });
  }

  let role = await prisma.role.findFirst({ where: { name: 'Student' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'Student' } });
  }

  // Create the user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      cognitoId: 'manual-restore-' + Date.now(),
      firstName: 'Juan Miguel',
      lastName: 'Gonzales',
      tenantId: tenant.id,
      roleId: role.id,
      isActive: true,
    }
  });

  console.log('Successfully recreated user:');
  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
