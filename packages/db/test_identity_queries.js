const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  const userId = '00000000-0000-4000-8000-000000000002'; // Admin user
  console.log('Testing identity queries for user:', userId);

  // 1. SELECT from business_identities
  try {
    const identRes = await c.query('SELECT * FROM public.business_identities WHERE owner_user_id = $1::uuid', [userId]);
    console.log('1. business_identities rows:', identRes.rows);
  } catch (e) {
    console.error('1. Error querying business_identities:', e.message);
  }

  // 2. SELECT from identity_share_links
  try {
    const linkRes = await c.query("SELECT * FROM public.identity_share_links WHERE owner_user_id = $1::uuid AND status = 'active'", [userId]);
    console.log('2. identity_share_links rows:', linkRes.rows);
  } catch (e) {
    console.error('2. Error querying identity_share_links:', e.message);
  }

  // 3. Check foreign key constraints
  try {
    const fks = await c.query(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('business_identities', 'identity_share_links', 'identity_field_visibility');
    `);
    console.log('3. Foreign keys:', fks.rows);
  } catch (e) {
    console.error('3. Error checking foreign keys:', e.message);
  }

  await c.end();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
