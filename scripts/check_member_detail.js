const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const m = await client.query("SELECT * FROM public.members WHERE name ILIKE '%Vũ%' OR code = 'M1983-002' OR email ILIKE '%vu%' LIMIT 2");
  console.log('--- MEMBER RECORD ---');
  console.log(m.rows[0]);

  const allM = await client.query("SELECT id, code, name, phone, email, avatar_url, cover_url, company_name, executive_role FROM public.members WHERE avatar_url IS NOT NULL LIMIT 5");
  console.log('--- MEMBERS WITH AVATAR ---');
  console.log(allM.rows);

  await client.end();
}

check().catch(console.error);
