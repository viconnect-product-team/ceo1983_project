const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCols() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events'
  `;
  console.log('Columns in public.events:');
  cols.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
}

checkCols()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
