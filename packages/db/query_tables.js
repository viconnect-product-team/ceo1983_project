const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  
  console.log('--- TABLES CHECK ---');
  const tables = await c.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('business_identities', 'identity_share_links', 'identity_field_visibility', 'user_profiles')
  `);
  console.log('Tables found:', tables.rows);

  for (const t of tables.rows) {
    const cols = await c.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = '${t.table_name}'
    `);
    console.log(`\nColumns for ${t.table_name}:`);
    console.log(cols.rows.map(r => `${r.column_name} (${r.data_type}, null=${r.is_nullable})`).join(', '));
  }

  await c.end();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
