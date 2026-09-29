const { PrismaClient } = require('@vibe/db');
const prisma = new PrismaClient();

async function run() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'app_settings' AND table_schema = 'public'
  `;
  console.log('app_settings cols:', cols);

  const data = await prisma.$queryRaw`SELECT * FROM public.app_settings LIMIT 5`;
  console.log('app_settings data:', data);
}

run()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
