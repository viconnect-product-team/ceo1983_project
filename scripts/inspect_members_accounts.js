const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  
  const uCols = await c.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='vione_users'
  `);
  console.log('VIONE_USERS COLS:', uCols.rows.map(r => r.column_name));

  const membersQuery = await c.query(`
    SELECT m.id, m.code, m.name, m.email, m.phone, m.user_id,
           u.email as user_email
    FROM public.members m
    LEFT JOIN public.vione_users u ON m.user_id = u.id
    ORDER BY m.code ASC
    LIMIT 10
  `);
  console.log('MEMBERS AND LINKED USERS:');
  console.table(membersQuery.rows);

  const mSamples = await c.query(`
    SELECT id, recipient_id, type, title, ref_type, ref_id
    FROM public.member_notifications
    ORDER BY created_at DESC
    LIMIT 5
  `);
  console.log('MEMBER_NOTIFICATIONS SAMPLES:');
  console.table(mSamples.rows);

  const bNotifCols = await c.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='business_notifications'
  `);
  console.log('BUSINESS_NOTIFICATIONS COLS:', bNotifCols.rows.map(r => r.column_name));

  await c.end();
}

run().catch(console.error);
