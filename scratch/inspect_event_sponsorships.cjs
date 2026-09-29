const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cols = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events'");
  console.log('events columns:', cols);

  const sampleEvent = await prisma.$queryRawUnsafe("SELECT * FROM public.events LIMIT 2");
  console.log('sample event:', sampleEvent);

  const packages = await prisma.$queryRawUnsafe("SELECT * FROM public.sponsor_packages");
  console.log('packages:', packages);
}

run().catch(console.error).finally(() => prisma.$disconnect());
