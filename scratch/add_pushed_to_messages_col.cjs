const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS pushed_to_messages boolean DEFAULT false;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.business_notifications ADD COLUMN IF NOT EXISTS pushed_to_messages boolean DEFAULT false;
  `);
  console.log('Successfully added pushed_to_messages columns');
}

run().catch(console.error).finally(() => prisma.$disconnect());
