const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/ceo1983_project?schema=public' }
  }
});

async function run() {
  const userCols = await p.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='vione_users'
  `;
  console.log('--- COLUMNS OF vione_users ---');
  userCols.forEach(c => console.log(' ', c.column_name, c.data_type));

  const users = await p.$queryRaw`SELECT * FROM public.vione_users LIMIT 20`;
  console.log('--- VIONE_USERS (first 20) ---');
  users.forEach(u => console.log('  ', u.id, u.email, u.phone, u.name || u.full_name));

  const members = await p.$queryRaw`SELECT id, code, name, email, phone, status, executive_role, department, company_name, user_id FROM public.members`;
  console.log('--- MEMBERS (' + members.length + ') ---');
  members.forEach(m => console.log('  ', m.id, m.code, m.name, m.email, m.status, m.department, m.executive_role, 'uid:', m.user_id));

  const userRoles = await p.$queryRaw`SELECT * FROM public.user_roles LIMIT 20`.catch(() => []);
  console.log('--- USER_ROLES (' + userRoles.length + ') ---');
  userRoles.forEach(r => console.log('  ', r));

  await p.$disconnect();
}
run().catch(console.error);
