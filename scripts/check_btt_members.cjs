const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true' });
client.connect().then(async () => {
  const r = await client.query("SELECT id, code, name, department, executive_role FROM public.members WHERE department ILIKE '%truyền thông%' OR executive_role ILIKE '%truyền thông%' OR executive_role ILIKE '%btt%'");
  console.log('Ban truyen thong members in DB:', r.rows);
  const total = await client.query("SELECT count(*) FROM public.members");
  console.log('Total members in DB:', total.rows[0].count);
  await client.end();
}).catch(console.error);

