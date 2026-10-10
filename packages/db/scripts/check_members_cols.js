const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'members' ORDER BY ordinal_position;
  `);
  console.log('members columns:', cols.rows.map(r => r.column_name));
  await client.end();
}

main().catch(console.error);
