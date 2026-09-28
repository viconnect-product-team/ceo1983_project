const { Client } = require('pg');
const bcrypt = require('bcrypt');

const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' });

async function main() {
  await c.connect();
  const users = await c.query(`
    SELECT u.id, u.email, u.name, u.password,
           m.code as member_code, m.executive_role, m.department, m.status
    FROM public.vione_users u
    LEFT JOIN public.members m ON m.user_id = u.id OR m.email = u.email
    ORDER BY m.code ASC NULLS LAST
  `);

  console.log(`Checking ${users.rows.length} accounts...`);
  const testPasswords = ['123456', '12345678', 'password', 'Admin@123', 'admin123', 'CEO1983@2026'];

  for (const u of users.rows) {
    let matchedPass = 'Unknown / Custom';
    if (!u.password) {
      matchedPass = 'NO_PASSWORD';
    } else {
      for (const p of testPasswords) {
        if (await bcrypt.compare(p, u.password)) {
          matchedPass = p;
          break;
        }
      }
    }
    console.log(JSON.stringify({
      code: u.member_code || 'N/A',
      name: u.name,
      email: u.email,
      role: u.executive_role || 'Thành viên / Admin',
      department: u.department || 'N/A',
      status: u.status || 'N/A',
      password: matchedPass
    }));
  }

  await c.end();
}

main().catch(console.error);
