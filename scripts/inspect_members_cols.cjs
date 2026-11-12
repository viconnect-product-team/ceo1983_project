const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
  ssl: false
});

async function run() {
  await client.connect();
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'members' AND table_schema = 'public'
    ORDER BY ordinal_position
  `);
  console.log('Columns of public.members:');
  console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  await client.end();
}

run().catch(console.error);

