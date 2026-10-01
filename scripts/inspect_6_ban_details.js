const { Client } = require('pg');

async function run() {
  const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' });
  await c.connect();
  const emails = [
    'admin@connect.vn',
    'ceo.tongthuky@ceo1983.com',
    'ceo.thanhvien@ceo1983.com',
    'ceo.thiennguyen@ceo1983.com',
    'ceo.truyenthong@ceo1983.com',
    'ceo.xuctien@ceo1983.com'
  ];
  for (const email of emails) {
    const u = await c.query('SELECT id, email, name, password FROM vione_users WHERE email = $1', [email]);
    const user = u.rows[0];
    if (!user) {
      console.log('No user for', email);
      continue;
    }
    const m = await c.query('SELECT id, code, name, department, executive_role, status, user_id FROM members WHERE email = $1 OR user_id = $2', [email, user.id]);
    const r = await c.query('SELECT * FROM user_roles WHERE user_id = $1', [user.id]);
    console.log('Account:', email);
    console.log('User:', user);
    console.log('Member:', m.rows[0]);
    console.log('Roles:', r.rows);
    console.log('-------------------');
  }
  await c.end();
}

run();
