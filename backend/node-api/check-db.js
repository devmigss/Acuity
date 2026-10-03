const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- TENANTS ---');
  const tenants = await prisma.tenant.findMany();
  console.log(JSON.stringify(tenants, null, 2));

  console.log('--- USERS ---');
  const users = await prisma.user.findMany({
    include: { role: true, tenant: true },
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('--- FACULTY WHITELIST ---');
  const whitelist = await prisma.facultyWhitelist.findMany();
  console.log(JSON.stringify(whitelist, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
