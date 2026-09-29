const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- ADDING event_id TO public.polls ---');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.polls 
      ADD COLUMN IF NOT EXISTS event_id text;
    `);
    console.log('SUCCESS: Added event_id column to public.polls!');

    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'polls'
      ORDER BY ordinal_position;
    `);
    console.log('Current columns in public.polls:');
    cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
