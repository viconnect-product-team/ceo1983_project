const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app' });

async function check() {
  await client.connect();
  const uRes = await client.query("SELECT id, username, email, name FROM public.vione_users WHERE username ILIKE '%admin%' OR email ILIKE '%admin%' OR name ILIKE '%Phạm Văn Vũ%'");
  console.log('Admin Users:', uRes.rows);

  const mRes = await client.query("SELECT id, code, name, user_id, phone, email FROM public.members WHERE name ILIKE '%Phạm Văn Vũ%' OR email ILIKE '%admin%'");
  console.log('Admin Members:', mRes.rows);

  await client.end();
}

check().catch(console.error);
