const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'notifications'
    ORDER BY ordinal_position
  `;
  console.log('Columns in public.notifications:');
  cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));

  const bizCols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'business_notifications'
    ORDER BY ordinal_position
  `;
  console.log('Columns in public.business_notifications:');
  bizCols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
