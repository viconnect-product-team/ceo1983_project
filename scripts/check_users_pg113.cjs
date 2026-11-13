const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  const m = await c.query("SELECT id, name, email, executive_role, department, status FROM public.members WHERE email = 'vumikasa6@gmail.com'");
  console.log('Member vumikasa6:', m.rows);

  const allM = await c.query("SELECT id, name, email, executive_role, department, status FROM public.members LIMIT 10");
  console.log('Members sample:', allM.rows);

  await c.end();
}

main().catch(console.error);
