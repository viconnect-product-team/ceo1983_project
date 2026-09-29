const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = await prisma.$queryRaw`
    SELECT m.id, m.user_id, m.role, m.department, m.executive_role, u.email, u.name 
    FROM public.memberships m
    LEFT JOIN public.vione_users u ON u.id = m.user_id
  `;
  console.log('Memberships count:', m.length);
  m.forEach(x => console.log(x));
}

main().catch(console.error).finally(() => prisma.$disconnect());
