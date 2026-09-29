const { PrismaClient } = require('@vibe/db');
const prisma = new PrismaClient();

async function run() {
  const tables = ['events', 'members', 'sponsors', 'meetings', 'polls', 'documents', 'advertisements', 'reviews'];
  for (const t of tables) {
    try {
      const rows = await prisma.$queryRawUnsafe(`SELECT id FROM public.${t} LIMIT 3`);
      console.log(`Table ${t} sample IDs:`, rows);
    } catch (e) {
      console.log(`Table ${t} error:`, e.message);
    }
  }
}

run()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
