const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  const filtered = res.rows.map(r => r.table_name).filter(t => 
    t.includes('relation') || t.includes('friend') || t.includes('network') || t.includes('contact') || t.includes('connect') || t.includes('member') || t.includes('lead')
  );
  console.log('Filtered tables:', filtered);
  await client.end();
}
check().catch(console.error);

