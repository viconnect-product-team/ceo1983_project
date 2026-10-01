const { Client } = require('pg');

async function testDb(url, name) {
  try {
    const c = new Client({ connectionString: url });
    await c.connect();
    const res = await c.query('SELECT count(*) FROM vione_users');
    console.log(name, 'vione_users count:', res.rows[0].count);
    const mRes = await c.query('SELECT count(*) FROM members');
    console.log(name, 'members count:', mRes.rows[0].count);
    const sixBan = await c.query(`
      SELECT u.id, u.email, u.name, m.department, m.executive_role, m.status
      FROM vione_users u
      LEFT JOIN members m ON m.user_id = u.id OR m.email = u.email
      WHERE u.email IN (
        'admin@connect.vn',
        'ceo.tongthuky@ceo1983.com',
        'ceo.thanhvien@ceo1983.com',
        'ceo.thiennguyen@ceo1983.com',
        'ceo.truyenthong@ceo1983.com',
        'ceo.xuctien@ceo1983.com'
      )
    `);
    console.log(name, '6 ban accounts found:', sixBan.rows);
    await c.end();
  } catch (e) {
    console.error(name, 'Error:', e.message);
  }
}

async function run() {
  await testDb('postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable', 'vione_app');
  await testDb('postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable', 'ceo1983_project');
}

run();
