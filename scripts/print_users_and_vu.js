const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const m = await client.query("SELECT * FROM public.members WHERE name ILIKE '%Vũ%'");
  console.log('--- MEMBER VU DETAIL ---');
  for (const row of m.rows) {
    console.log(row);
  }

  const u = await client.query("SELECT id, username, email, name, avatar_url FROM public.vione_users");
  console.log('--- ALL VIONE_USERS ---');
  console.log(u.rows);

  await client.end();
}

check().catch(console.error);
