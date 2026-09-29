const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const upCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  `;
  console.log('user_profiles cols:', upCols.map(c => c.column_name));

  const vuCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vione_users'
  `;
  console.log('vione_users cols:', vuCols.map(c => c.column_name));

  const mCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'memberships'
  `;
  console.log('memberships cols:', mCols.map(c => c.column_name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
