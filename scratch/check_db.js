const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const packages = await prisma.$queryRawUnsafe('SELECT id, tier, CAST(price AS TEXT) as price, package_type, available, sold, benefits FROM public.sponsor_packages');
    console.log('COUNT sponsor_packages:', packages.length);
    console.log('PACKAGES:', JSON.stringify(packages, null, 2));

    const sponsors = await prisma.$queryRawUnsafe('SELECT id, name, tier, CAST(amount AS TEXT) as amount FROM public.sponsors');
    console.log('COUNT sponsors:', sponsors.length);
    console.log('SPONSORS:', JSON.stringify(sponsors, null, 2));
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
