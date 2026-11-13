const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';

async function inspectData() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  console.log('=== 1. USERS & MEMBERS ===');
  const users = await c.query('SELECT id, email, name FROM public.vione_users');
  console.log('Users count:', users.rows.length);
  console.log('Users list:', users.rows);

  const members = await c.query('SELECT id, name, email, code, executive_role, department, status FROM public.members');
  console.log('Members count:', members.rows.length);
  console.log('Members list:', members.rows);

  console.log('\n=== 2. EVENTS ===');
  const eventCols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='events'");
  console.log('Events columns:', eventCols.rows.map(r => r.column_name).join(', '));
  
  const events = await c.query('SELECT * FROM public.events');
  console.log('Events count:', events.rows.length);
  console.log('Events list:', events.rows.map(e => ({
    id: e.id,
    title: e.title || e.name,
    date: e.date || e.event_date || e.start_time || e.created_at,
    location: e.location,
    status: e.status
  })));

  console.log('\n=== 3. RECORD COUNTS TO BE CLEARED ===');
  const tables = [
    'opportunities',
    'opportunity_members',
    'products',
    'meetings',
    'meeting_participants',
    'business_meetings',
    'business_meeting_participants',
    'b2b_connections',
    'feed_posts',
    'feed_comments',
    'event_registrations'
  ];

  for (const t of tables) {
    try {
      const res = await c.query(`SELECT count(*)::int as count FROM public.${t}`);
      console.log(`Table ${t}: ${res.rows[0].count} records`);
    } catch (e) {
      console.log(`Table ${t}: (${e.message})`);
    }
  }

  await c.end();
}

inspectData().catch(console.error);
