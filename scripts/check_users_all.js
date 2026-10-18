const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const m = await client.query("SELECT * FROM public.members WHERE name ILIKE '%Vũ%' OR email ILIKE '%vu%' OR phone ILIKE '%0988888888%' OR phone ILIKE '%0901201983%'");
  console.log('--- MEMBERS FOUND ---', m.rows);

  const u = await client.query("SELECT * FROM public.vione_users WHERE email ILIKE '%vu%' OR username ILIKE '%vu%' OR phone ILIKE '%0988888888%'");
  console.log('--- VIONE_USERS FOUND ---', u.rows);

  const allU = await client.query("SELECT id, username, email, phone, role FROM public.vione_users LIMIT 10");
  console.log('--- ALL VIONE_USERS ---', allU.rows);

  await client.end();
}

check().catch(console.error);
