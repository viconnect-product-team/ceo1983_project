const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true"
  });
  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' AND table_name = 'users'
  `);
  console.log(cols.rows);

  const sample = await client.query("SELECT * FROM auth.users WHERE email = 'info@viconnect.vn'");
  console.log('sample row:', sample.rows[0]);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
