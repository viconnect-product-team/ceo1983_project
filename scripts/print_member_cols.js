const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='members'");
  console.log('--- MEMBERS COLUMNS ---');
  console.log(cols.rows.map(r => r.column_name));

  await client.end();
}

check().catch(console.error);
