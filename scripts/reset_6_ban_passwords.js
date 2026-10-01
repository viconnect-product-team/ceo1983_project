const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function run() {
  const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' });
  await c.connect();

  const emails = [
    'admin@connect.vn',
    'ceo.tongthuky@ceo1983.com',
    'ceo.thanhvien@ceo1983.com',
    'ceo.thiennguyen@ceo1983.com',
    'ceo.truyenthong@ceo1983.com',
    'ceo.xuctien@ceo1983.com',
    'vupv090120@gmail.com'
  ];

  const hash = await bcrypt.hash('123456', 10);
  console.log('Setting password hash to:', hash);

  for (const email of emails) {
    const res = await c.query('SELECT id, email, password FROM vione_users WHERE email = $1', [email]);
    console.log(`Email ${email} found:`, res.rows.length);
    if (res.rows.length > 0) {
      await c.query('UPDATE vione_users SET password = $1 WHERE email = $2', [hash, email]);
      console.log(`  ✓ Updated password for ${email}`);
    }
  }

  await c.end();
}

run().catch(console.error);
