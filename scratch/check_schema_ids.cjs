const { PrismaClient } = require('@vibe/db');
const prisma = new PrismaClient();

async function run() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'associations' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log('Associations cols:', cols);

  const assocs = await prisma.$queryRaw`SELECT * FROM public.associations LIMIT 5`;
  console.log('Associations data:', assocs);

  const evCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'events' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log('Events cols:', evCols);

  const events = await prisma.$queryRaw`SELECT id, name FROM public.events LIMIT 5`;
  console.log('Events sample IDs:', events);

  const memCols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'members' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log('Members cols:', memCols);

  const members = await prisma.$queryRaw`SELECT id, code, name FROM public.members LIMIT 5`;
  console.log('Members sample IDs:', members);
}

run()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
