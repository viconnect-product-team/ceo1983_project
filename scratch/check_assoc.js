const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assocs = await prisma.$queryRaw`SELECT id, name, slug FROM public.associations`;
  console.log('Associations:', assocs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
