const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT u.id, u.email, u.name, m.code, m.company, m.title, m.avatar, m.association_id
    FROM public.vione_users u
    LEFT JOIN public.members m ON m.user_id = u.id
    WHERE u.name ILIKE '%Vũ%' OR u.email ILIKE '%vumik%' OR u.email ILIKE '%admin%' OR u.email ILIKE '%vupv%'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
