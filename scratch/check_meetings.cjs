const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%meet%'
  `);
  console.log('Tables matching meet:', tables);

  for (const t of tables) {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${t.table_name}'
    `);
    console.log(`Columns of ${t.table_name}:`, cols.map(c => c.column_name));
    const count = await prisma.$queryRawUnsafe(`SELECT count(*)::int as c FROM public.${t.table_name}`);
    console.log(`Count of ${t.table_name}:`, count[0].c);
  }

  await prisma.$disconnect();
}
run();
