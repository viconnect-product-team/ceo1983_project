const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='members'");
  console.log('MEMBERS COLUMNS:', cols.rows.map(r => r.column_name));

  const m = await client.query("SELECT * FROM public.members WHERE name ILIKE '%Vũ%' OR code = 'M1983-002' OR email ILIKE '%vu%' LIMIT 5");
  console.log('MEMBERS ROWS:', JSON.stringify(m.rows, null, 2));

  const u = await client.query("SELECT * FROM public.vione_users WHERE full_name ILIKE '%Vũ%' OR email ILIKE '%vu%' OR role = 'admin' LIMIT 5");
  console.log('VIONE_USERS ROWS:', JSON.stringify(u.rows, null, 2));

  await client.end();
}

check().catch(console.error);
