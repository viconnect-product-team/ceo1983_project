const { PrismaClient } = require('../index.js');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public"
    }
  }
});

async function run() {
  console.log('Adding columns to public.events if not exists...');
  await prisma.$executeRawUnsafe(`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time text;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time text;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS agenda jsonb DEFAULT '[]'::jsonb;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE public.events ADD COLUMN IF NOT EXISTS checkin_qr text;`);
  console.log('Columns added successfully.');

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name IN ('start_time', 'end_time', 'agenda', 'checkin_qr');
  `);
  console.log('Verified columns:', cols);
  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
