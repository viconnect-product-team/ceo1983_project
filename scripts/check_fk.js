const { Client } = require('pg');

async function run() {
  const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' });
  await c.connect();
  const res = await c.query(`
    SELECT
      tc.constraint_name, 
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
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'members';
  `);
  console.log('user_roles foreign keys in ceo1983_project:', res.rows);

  const m = await c.query(`SELECT id, email, user_id, association_id, department, executive_role FROM members WHERE email = 'ceo.thanhvien@ceo1983.com'`);
  console.log('Member ceo.thanhvien:', m.rows);
  const u = await c.query(`SELECT id, email FROM vione_users WHERE email = 'ceo.thanhvien@ceo1983.com'`);
  console.log('User ceo.thanhvien:', u.rows);

  await c.end();
}

run().catch(console.error);
