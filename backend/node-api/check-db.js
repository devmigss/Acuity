const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'shane.cruz.cics@ust.edu.ph' },
    include: { role: true, tenant: true }
  });
  console.log("Database state for user:");
  console.log(JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
