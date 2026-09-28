const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('--- USERS & ROLES ---');
  const users = await client.query(`
    SELECT u.id, u.email, u.name, ur.role as app_role, up.professional_title, up.company_name
    FROM public.vione_users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN public.user_profiles up ON u.id = up.user_id
    ORDER BY u.email
  `);
  console.log('Total users:', users.rows.length);
  console.log(JSON.stringify(users.rows, null, 2));

  console.log('--- MEMBERSHIPS & DEPARTMENTS ---');
  const memberships = await client.query(`
    SELECT m.user_id, u.email, u.name, m.role, m.department, m.executive_role, m.association_id, a.name as assoc_name
    FROM public.memberships m
    JOIN public.vione_users u ON m.user_id = u.id
    LEFT JOIN public.associations a ON m.association_id = a.id
    ORDER BY m.department, u.name
  `);
  console.log(JSON.stringify(memberships.rows, null, 2));

  console.log('--- MEMBERS TABLE ---');
  const members = await client.query(`
    SELECT m.id, m.user_id, u.email, u.name, m.code, m.department, m.executive_role, m.title, m.company_name
    FROM public.members m
    LEFT JOIN public.vione_users u ON m.user_id = u.id
    ORDER BY m.department, m.code
  `);
  console.log(JSON.stringify(members.rows, null, 2));

  await client.end();
}

main().catch(console.error);
