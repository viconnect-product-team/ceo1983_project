const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function checkEnums() {
  await client.connect();
  const res = await client.query("SELECT typname FROM pg_type WHERE typname IN ('global_connection_status', 'global_connection_source_type')");
  console.log('Enums found:', res.rows);
  await client.end();
}
checkEnums().catch(console.error);

