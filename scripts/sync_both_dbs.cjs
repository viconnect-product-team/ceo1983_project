const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DB_URLS = [
  'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
  'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app'
];

const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

async function syncDb(dbUrl) {
  console.log(`\n================ Syncing DB: ${dbUrl.split('@')[1]} ================`);
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const salt = await bcrypt.genSalt(10);
  const hash123456 = await bcrypt.hash('123456', salt);

  // 0. Ensure Association exists
  await client.query(`
    INSERT INTO public.associations (id, name, slug, landing_published, created_at, updated_at)
    VALUES ($1, 'CLB Doanh Nhân CEO 1983', 'ceo1983', true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `, [ASSOC_ID]).catch(e => console.log('Assoc insert note:', e.message));

  // 1. Update / Insert admin@viconnect.vn
  const checkAdm = await client.query("SELECT id FROM public.vione_users WHERE email IN ('admin@connect.vn', 'admin@viconnect.vn')");
  let admId = '00000000-0000-4000-8000-000000000002';
  if (checkAdm.rows.length === 0) {
    await client.query(`
      INSERT INTO public.vione_users (id, username, email, password, name, created_at, updated_at)
      VALUES ($1, 'admin@viconnect.vn', 'admin@viconnect.vn', $2, 'Quản Trị Viên Hệ Thống', NOW(), NOW())
    `, [admId, hash123456]);
  } else {
    admId = checkAdm.rows[0].id;
    await client.query(`
      UPDATE public.vione_users
      SET username = 'admin@viconnect.vn',
          email = 'admin@viconnect.vn',
          password = $1,
          name = 'Quản Trị Viên Hệ Thống',
          updated_at = NOW()
      WHERE id = $2
    `, [hash123456, admId]);
  }

  // Update members for admin
  const checkAdmMem = await client.query("SELECT id FROM public.members WHERE email IN ('admin@connect.vn', 'admin@viconnect.vn')");
  if (checkAdmMem.rows.length === 0) {
    await client.query(`
      INSERT INTO public.members (id, code, user_id, association_id, name, email, executive_role, department, status, created_at, updated_at)
      VALUES ($1, 'CEO1983-000001', $1, $2, 'Jame Nguyễn', 'admin@viconnect.vn', 'quan_tri', 'Ban Điều Hành', 'active', NOW(), NOW())
    `, [admId, ASSOC_ID]);
  } else {
    await client.query(`
      UPDATE public.members
      SET code = COALESCE(code, 'CEO1983-000001'),
          association_id = COALESCE(association_id, $2),
          email = 'admin@viconnect.vn',
          executive_role = 'quan_tri',
          department = 'Ban Điều Hành',
          status = 'active',
          updated_at = NOW()
      WHERE id = $1
    `, [checkAdmMem.rows[0].id, ASSOC_ID]);
  }

  // User roles for admin
  await client.query(`
    INSERT INTO public.user_roles (id, user_id, role, created_at)
    VALUES (gen_random_uuid(), $1::uuid, 'admin'::app_role, NOW())
    ON CONFLICT (user_id, role) DO NOTHING
  `, [admId]);

  // 2. Update / Insert info@viconnect.vn
  const checkInfo = await client.query("SELECT id FROM public.vione_users WHERE email = 'info@viconnect.vn'");
  let infoId = 'eda9cbcc-6c51-47db-968b-6dee219a59ae';
  if (checkInfo.rows.length === 0) {
    await client.query(`
      INSERT INTO public.vione_users (id, username, email, password, name, created_at, updated_at)
      VALUES ($1, 'info@viconnect.vn', 'info@viconnect.vn', $2, 'Phạm hồng Nguyên', NOW(), NOW())
    `, [infoId, hash123456]);
  } else {
    infoId = checkInfo.rows[0].id;
    await client.query(`
      UPDATE public.vione_users
      SET username = 'info@viconnect.vn',
          email = 'info@viconnect.vn',
          password = $1,
          name = 'Phạm hồng Nguyên',
          updated_at = NOW()
      WHERE id = $2
    `, [hash123456, infoId]);
  }

  // Members for info@viconnect.vn
  const checkInfoMem = await client.query("SELECT id FROM public.members WHERE email = 'info@viconnect.vn'");
  if (checkInfoMem.rows.length === 0) {
    await client.query(`
      INSERT INTO public.members (id, code, user_id, association_id, name, email, executive_role, department, status, created_at, updated_at)
      VALUES ('MBMWBR2VWN', 'CEO1983-000002', $1, $2, 'Phạm hồng Nguyên', 'info@viconnect.vn', 'truong_ban_truyen_thong', 'Ban truyền thông', 'active', NOW(), NOW())
    `, [infoId, ASSOC_ID]);
  } else {
    await client.query(`
      UPDATE public.members
      SET code = COALESCE(code, 'CEO1983-000002'),
          association_id = COALESCE(association_id, $1),
          executive_role = 'truong_ban_truyen_thong',
          department = 'Ban truyền thông',
          status = 'active',
          updated_at = NOW()
      WHERE email = 'info@viconnect.vn'
    `, [ASSOC_ID]);
  }

  // User roles for info
  await client.query(`
    INSERT INTO public.user_roles (id, user_id, role, created_at)
    VALUES (gen_random_uuid(), $1::uuid, 'admin'::app_role, NOW())
    ON CONFLICT (user_id, role) DO NOTHING
  `, [infoId]);

  // 3. Ensure vumikasa6@gmail.com
  const checkVu = await client.query("SELECT id FROM public.vione_users WHERE email = 'vumikasa6@gmail.com'");
  let vuId = '67e1bca9-94e6-4859-b13c-bf93e2b9c4c5';
  if (checkVu.rows.length === 0) {
    await client.query(`
      INSERT INTO public.vione_users (id, username, email, password, name, created_at, updated_at)
      VALUES ($1, 'vumikasa6@gmail.com', 'vumikasa6@gmail.com', $2, 'Phạm Văn Vũ', NOW(), NOW())
    `, [vuId, hash123456]);
  } else {
    vuId = checkVu.rows[0].id;
    await client.query(`
      UPDATE public.vione_users
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `, [hash123456, vuId]);
  }
  const checkVuMem = await client.query("SELECT id FROM public.members WHERE email = 'vumikasa6@gmail.com'");
  if (checkVuMem.rows.length === 0) {
    await client.query(`
      INSERT INTO public.members (id, code, user_id, association_id, name, email, executive_role, department, status, created_at, updated_at)
      VALUES ('MBMWD8P4NX', 'CEO1983-000003', $1, $2, 'Phạm Văn Vũ', 'vumikasa6@gmail.com', 'thanh_vien_ban_truyen_thong', 'Ban truyền thông', 'active', NOW(), NOW())
    `, [vuId, ASSOC_ID]);
  } else {
    await client.query(`
      UPDATE public.members
      SET code = COALESCE(code, 'CEO1983-000003'),
          association_id = COALESCE(association_id, $1),
          executive_role = 'thanh_vien_ban_truyen_thong',
          department = 'Ban truyền thông',
          status = 'active',
          updated_at = NOW()
      WHERE email = 'vumikasa6@gmail.com'
    `, [ASSOC_ID]);
  }

  // 4. Ensure vupv090120@gmail.com
  const checkNam = await client.query("SELECT id FROM public.vione_users WHERE email = 'vupv090120@gmail.com'");
  let namId = '703909a9-f21e-4ebe-b537-10da57b0cb4c';
  if (checkNam.rows.length === 0) {
    await client.query(`
      INSERT INTO public.vione_users (id, username, email, password, name, created_at, updated_at)
      VALUES ($1, 'vupv090120@gmail.com', 'vupv090120@gmail.com', $2, 'Phạm An Nam', NOW(), NOW())
    `, [namId, hash123456]);
  } else {
    namId = checkNam.rows[0].id;
    await client.query(`
      UPDATE public.vione_users
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `, [hash123456, namId]);
  }
  const checkNamMem = await client.query("SELECT id FROM public.members WHERE email = 'vupv090120@gmail.com'");
  if (checkNamMem.rows.length === 0) {
    await client.query(`
      INSERT INTO public.members (id, code, user_id, association_id, name, email, executive_role, department, status, created_at, updated_at)
      VALUES ('MBMWD8NCJH', 'CEO1983-000004', $1, $2, 'Phạm An Nam', 'vupv090120@gmail.com', 'member', 'Hội viên ceo1983', 'active', NOW(), NOW())
    `, [namId, ASSOC_ID]);
  } else {
    await client.query(`
      UPDATE public.members
      SET code = COALESCE(code, 'CEO1983-000004'),
          association_id = COALESCE(association_id, $1),
          executive_role = 'member',
          department = 'Hội viên ceo1983',
          status = 'active',
          updated_at = NOW()
      WHERE email = 'vupv090120@gmail.com'
    `, [ASSOC_ID]);
  }

  // 5. Clean other users
  const keepEmails = ['admin@viconnect.vn', 'info@viconnect.vn', 'vumikasa6@gmail.com', 'vupv090120@gmail.com'];
  await client.query(`
    DELETE FROM public.members WHERE email NOT IN ($1, $2, $3, $4) AND (email LIKE '%@ceo1983.com' OR email = 'admin@connect.vn')
  `, keepEmails);
  await client.query(`
    DELETE FROM public.vione_users WHERE email NOT IN ($1, $2, $3, $4) AND (email LIKE '%@ceo1983.com' OR email = 'admin@connect.vn')
  `, keepEmails);

  // Print results
  const resU = await client.query("SELECT id, username, email, name FROM public.vione_users");
  console.log('vione_users in DB:', resU.rows);

  const resM = await client.query("SELECT id, code, name, email, department, executive_role FROM public.members");
  console.log('members in DB:', resM.rows);

  await client.end();
}

async function main() {
  for (const url of DB_URLS) {
    try {
      await syncDb(url);
    } catch (e) {
      console.error(`Error on DB ${url}:`, e);
    }
  }
  console.log('\nALL DATABASES SYNCED SUCCESSFULLY!');
}

main();
