const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`
    UPDATE public.members 
    SET department = 'Ban Quản Trị', executive_role = 'Admin Hệ Thống', company_name = 'CLB Doanh Nhân CEO 1983' 
    WHERE code = 'M1983-268'
  `;
  console.log('Updated admin member');
}

main().catch(console.error).finally(() => prisma.$disconnect());
