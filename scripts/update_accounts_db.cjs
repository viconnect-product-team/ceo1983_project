const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function updateDb() {
  const client = new Client({
    connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
    ssl: false
  });
  await client.connect();
  const salt = await bcrypt.genSalt(10);
  const hash123456 = await bcrypt.hash('123456', salt);

  console.log('--- 0. Kiểm tra columns của members ---');
  const cMem = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'members'");
  console.log('members columns:', cMem.rows.map(r => r.column_name));

  console.log('--- 1. Cập nhật admin@connect.vn -> admin@viconnect.vn ---');
  // Update auth.users if exists
  await client.query(`UPDATE auth.users SET email = 'admin@viconnect.vn' WHERE email = 'admin@connect.vn'`);

  // Update vione_users
  await client.query(`
    UPDATE public.vione_users
    SET username = 'admin@viconnect.vn',
        email = 'admin@viconnect.vn',
        password = $1,
        name = COALESCE(name, 'Jame Nguyễn - Quản trị viên'),
        updated_at = NOW()
    WHERE email = 'admin@connect.vn' OR username = 'admin@connect.vn' OR email = 'admin@viconnect.vn'
  `, [hash123456]);

  // Update members
  await client.query(`
    UPDATE public.members
    SET email = 'admin@viconnect.vn',
        executive_role = 'quan_tri',
        department = 'Ban Điều Hành',
        updated_at = NOW()
    WHERE email = 'admin@connect.vn' OR email = 'admin@viconnect.vn'
  `);

  console.log('--- 2. Cập nhật info@viconnect.vn -> Trưởng Ban Truyền Thông ---');
  // Check auth.users for info@viconnect.vn
  const curAuthInfo = await client.query(`SELECT id, email FROM auth.users WHERE email = 'info@viconnect.vn'`);
  if (curAuthInfo.rows.length === 0) {
    console.log('Inserting into auth.users: info@viconnect.vn');
    await client.query(`INSERT INTO auth.users (id, email, role) VALUES (gen_random_uuid(), 'info@viconnect.vn', 'authenticated') ON CONFLICT DO NOTHING`);
  }

  // Check vione_users
  const curInfo = await client.query(`SELECT id, username, email FROM public.vione_users WHERE email = 'info@viconnect.vn' OR username = 'info@viconnect.vn'`);
  let infoUserId = null;
  if (curInfo.rows.length === 0) {
    console.log('Inserting info@viconnect.vn into vione_users');
    const ins = await client.query(`
      INSERT INTO public.vione_users (id, username, email, password, name, created_at, updated_at)
      VALUES (gen_random_uuid(), 'info@viconnect.vn', 'info@viconnect.vn', $1, 'Ban Truyền Thông CEO 1983', NOW(), NOW())
      RETURNING id
    `, [hash123456]);
    infoUserId = ins.rows[0].id;
  } else {
    infoUserId = curInfo.rows[0].id;
    await client.query(`
      UPDATE public.vione_users
      SET password = $1,
          updated_at = NOW()
      WHERE email = 'info@viconnect.vn' OR username = 'info@viconnect.vn'
    `, [hash123456]);
  }

  // Update or insert members for info@viconnect.vn
  const curInfoMem = await client.query(`SELECT id, name, email FROM public.members WHERE email = 'info@viconnect.vn'`);
  if (curInfoMem.rows.length === 0) {
    await client.query(`
      INSERT INTO public.members (id, user_id, name, email, executive_role, department, status, created_at, updated_at)
      VALUES ($1, $1, 'Ban Truyền Thông', 'info@viconnect.vn', 'truong_ban_truyen_thong', 'Ban truyền thông', 'active', NOW(), NOW())
    `, [infoUserId]);
  } else {
    await client.query(`
      UPDATE public.members
      SET executive_role = 'truong_ban_truyen_thong',
          department = 'Ban truyền thông',
          updated_at = NOW()
      WHERE email = 'info@viconnect.vn'
    `);
  }

  // user_roles
  if (infoUserId) {
    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1::uuid, 'admin'::app_role, NOW())
      ON CONFLICT (user_id, role) DO NOTHING
    `, [infoUserId]);
  }

  const uAdmin = await client.query(`SELECT id FROM public.vione_users WHERE email = 'admin@viconnect.vn'`);
  if (uAdmin.rows.length > 0) {
    const adminUserId = uAdmin.rows[0].id;
    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1::uuid, 'admin'::app_role, NOW())
      ON CONFLICT (user_id, role) DO NOTHING
    `, [adminUserId]);
  }

  // Also verify vumikasa6@gmail.com and vupv090120@gmail.com have password 123456
  console.log('--- 3. Đảm bảo vumikasa6@gmail.com & vupv090120@gmail.com pass là 123456 ---');
  await client.query(`
    UPDATE public.vione_users
    SET password = $1,
        updated_at = NOW()
    WHERE email IN ('vumikasa6@gmail.com', 'vupv090120@gmail.com')
  `, [hash123456]);

  console.log('--- 4. Kiểm tra kết quả 4 tài khoản trong CSDL ---');
  const checkUsers = await client.query(`SELECT id, username, email, name FROM public.vione_users WHERE email IN ('admin@viconnect.vn', 'info@viconnect.vn', 'vumikasa6@gmail.com', 'vupv090120@gmail.com')`);
  console.log('vione_users:', checkUsers.rows);

  const checkMembers = await client.query(`SELECT id, name, email, department, executive_role FROM public.members WHERE email IN ('admin@viconnect.vn', 'info@viconnect.vn', 'vumikasa6@gmail.com', 'vupv090120@gmail.com')`);
  console.log('members:', checkMembers.rows);

  const checkRoles = await client.query(`SELECT u.email, r.role FROM public.user_roles r JOIN public.vione_users u ON r.user_id = u.id WHERE u.email IN ('admin@viconnect.vn', 'info@viconnect.vn', 'vumikasa6@gmail.com', 'vupv090120@gmail.com')`);
  console.log('user_roles:', checkRoles.rows);

  await client.end();
  console.log('DONE updateDb successfully!');
}

updateDb().catch(e => {
  console.error('Update error:', e);
  process.exit(1);
});
