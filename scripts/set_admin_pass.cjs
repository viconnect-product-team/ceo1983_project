const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  // Get hash from vumikasa6 (which is 123456)
  const res = await c.query("SELECT password FROM public.vione_users WHERE email = 'vumikasa6@gmail.com'");
  const validHash = res.rows[0].password;

  // Update admin@connect.vn
  await c.query("UPDATE public.vione_users SET password = $1 WHERE email = 'admin@connect.vn'", [validHash]);
  console.log('Successfully set password for admin@connect.vn to 123456!');

  await c.end();
}

main().catch(console.error);

