const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const userId = '00000000-0000-4000-8000-000000000002';
  const rows = await prisma.$queryRaw`
    SELECT * FROM public.members WHERE user_id = ${userId}::uuid LIMIT 1
  `;
  console.log('--- DB MEMBER ROW ---');
  console.log(rows[0]);

  const bc = await prisma.$queryRaw`
    SELECT * FROM public.member_business_cards WHERE owner_user_id = ${userId}::uuid LIMIT 1
  `;
  console.log('--- DB CARD ROW ---');
  console.log(bc[0]);

  await prisma.$disconnect();
}

test().catch(console.error);
