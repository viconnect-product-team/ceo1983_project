const { Client } = require('pg');

const DB_URL_14 = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable';

async function check14() {
  try {
    const c = new Client({ connectionString: DB_URL_14 });
    await c.connect();
    console.log('=== CHECK DB 14.225.217.232:5436/vione_app ===');
    
    const tables = ['opportunities', 'products', 'meetings', 'events', 'members', 'vione_users'];
    for (const t of tables) {
      try {
        const res = await c.query(`SELECT count(*)::int as count FROM public.${t}`);
        console.log(`Table ${t}: ${res.rows[0].count} records`);
      } catch (e) {
        console.log(`Table ${t}: (${e.message})`);
      }
    }
    await c.end();
  } catch (err) {
    console.log('Cannot connect to 14.225.217.232:5436:', err.message);
  }
}

check14();

