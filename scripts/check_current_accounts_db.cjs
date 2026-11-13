const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  const users = await c.query('SELECT id, username, email, name FROM public.vione_users');
  console.log('ALL USERS:', users.rows);

  await c.end();
}

main().catch(console.error);
