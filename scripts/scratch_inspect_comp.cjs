const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public' } }
});

async function run() {
  const companies = await p.$queryRaw`SELECT * FROM public.companies`.catch(() => []);
  console.log('--- COMPANIES ---', companies.length);
  companies.forEach(c => console.log('  ', c.id, c.name));

  const compMems = await p.$queryRaw`SELECT * FROM public.company_members`.catch(() => []);
  console.log('--- COMPANY_MEMBERS ---', compMems.length);

  await p.$disconnect();
}
run().catch(console.error);
