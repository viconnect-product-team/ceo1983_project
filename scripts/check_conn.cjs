const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'user_connections' ORDER BY ordinal_position");
  console.log('user_connections columns:');
  res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type} (${r.udt_name})`));
  await client.end();
}
check().catch(console.error);

