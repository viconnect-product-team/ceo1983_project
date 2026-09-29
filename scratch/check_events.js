const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvents() {
  const events = await prisma.$queryRaw`
    SELECT id, name, sponsors, qr_scanners FROM public.events
  `;
  console.log('Events in DB:', JSON.stringify(events, null, 2));
}

checkEvents()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
