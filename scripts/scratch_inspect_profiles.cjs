const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public' } }
});

async function run() {
  const schemas = await p.$queryRaw`
    SELECT schema_name FROM information_schema.schemata
  `;
  console.log('--- SCHEMAS ---');
  schemas.forEach(s => console.log(' ', s.schema_name));

  const authUsers = await p.$queryRaw`
    SELECT count(*)::int as count FROM auth.users
  `.catch(e => { console.log('auth.users error:', e.message); return null; });
  if (authUsers) console.log('auth.users count:', authUsers);

  await p.$disconnect();
}
run().catch(console.error);
