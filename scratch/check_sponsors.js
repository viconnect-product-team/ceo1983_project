const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSponsors() {
  const sponsors = await prisma.$queryRaw`
    SELECT * FROM public.sponsors
  `;
  console.log('Sponsors in DB:', JSON.stringify(sponsors, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}

checkSponsors()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
