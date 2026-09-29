const { PrismaClient } = require('@vibe/db');
const prisma = new PrismaClient();

async function run() {
  const tables = ['events', 'members', 'sponsors', 'meetings', 'polls', 'documents', 'advertisements', 'event_registrations', 'attendees', 'checkin_logs'];
  for (const t of tables) {
    try {
      const cols = await prisma.$queryRaw`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = ${t} AND table_schema = 'public' AND column_name IN ('id', 'event_id', 'member_id', 'user_id', 'association_id')
      `;
      console.log(`Table ${t}:`, cols);
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
