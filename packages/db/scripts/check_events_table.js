const { PrismaClient } = require('../index.js');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public"
    }
  }
});

async function test() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events' 
    ORDER BY ordinal_position;
  `);
  console.log(JSON.stringify(cols, null, 2));

  const sample = await prisma.$queryRawUnsafe(`
    SELECT id, name, date, time, start_time, end_time, location, capacity, registered, sponsors, agenda, banner, image
    FROM public.events
    LIMIT 1;
  `).catch(e => {
    console.log('Sample query error:', e.message);
  });
  if (sample) console.log('Sample row:', sample);

  await prisma.$disconnect();
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
