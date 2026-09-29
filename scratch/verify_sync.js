const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT code, name, department, executive_role, company_name, email, phone 
    FROM public.members 
    ORDER BY code ASC
  `;
  console.log(`Verified ${rows.length} members in DB:`);
  rows.forEach(r => {
    console.log(`[${r.code}] ${r.name} | ${r.department} | ${r.executive_role} | ${r.company_name} | ${r.email} | ${r.phone}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
