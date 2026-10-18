const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const m = await client.query("SELECT * FROM public.members WHERE name ILIKE '%Vũ%'");
  console.log('--- MEMBER VU ---');
  console.log(m.rows);

  const uCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='vione_users'");
  console.log('--- VIONE_USERS COLUMNS ---');
  console.log(uCols.rows.map(r => r.column_name));

  const u = await client.query("SELECT * FROM public.vione_users WHERE email ILIKE '%vu%' OR username ILIKE '%vu%' OR role = 'admin' LIMIT 5");
  console.log('--- USERS ---');
  console.log(u.rows);

  await client.end();
}

check().catch(console.error);
