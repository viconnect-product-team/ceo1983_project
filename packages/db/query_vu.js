const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  const res = await c.query(`
    SELECT * FROM public.members WHERE phone LIKE '%0983000000%' OR name ILIKE '%Vũ%'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await c.end();
  process.exit(0);
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
