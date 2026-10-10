const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  const res = await c.query(`
    SELECT * FROM public.business_identities 
    WHERE address ILIKE '%Trần Duy Hưng%' OR city ILIKE '%Hà Nội%'
  `);
  console.log('Matches:', res.rows.map(r => ({ id: r.id, owner_user_id: r.owner_user_id, name: r.display_name, email: r.primary_email, address: r.address, city: r.city })));

  // Cũng check xem tất cả users trong vione_users
  const allU = await c.query('SELECT id, email, name FROM public.vione_users');
  console.log('All Users:', allU.rows);

  await c.end();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
