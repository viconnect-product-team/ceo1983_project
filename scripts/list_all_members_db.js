const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const members = await client.query("SELECT id, code, name, phone, email, executive_role, department, company_name, avatar_url, cover_url FROM public.members ORDER BY code ASC");
  console.log(`TOTAL MEMBERS: ${members.rows.length}`);
  for (const m of members.rows) {
    console.log(`- [${m.code}] ${m.name} | Role: ${m.executive_role} | Dept: ${m.department} | Cty: ${m.company_name} | Avatar: ${m.avatar_url ? 'YES' : 'NULL'}`);
  }

  await client.end();
}

check().catch(console.error);
