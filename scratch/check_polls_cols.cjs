const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPolls() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'polls'
    ORDER BY ordinal_position
  `;
  console.log('Columns in public.polls:');
  cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
}

checkPolls()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
