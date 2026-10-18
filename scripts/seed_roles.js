const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
});

const PWD_HASH = '$2b$10$FwXJpAWcYsEPAOii4hwZVu7L6YOlT/1sb4cSM6azBs1xED6FPhBka'; // 123456
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

async function seedUser(client, { id, code, name, email, phone, company, dept, execRole }) {
  await client.query(`
    INSERT INTO public.vione_users (id, username, password, email, name, email_verified, created_at, updated_at)
    VALUES ($1::uuid, $2, $3, $2, $4, true, now(), now())
    ON CONFLICT (id) DO UPDATE 
      SET username = EXCLUDED.username, email = EXCLUDED.email, password = EXCLUDED.password, name = EXCLUDED.name;
  `, [id, email, PWD_HASH, name]);

  await client.query(`
    INSERT INTO public.user_roles (id, user_id, role)
    VALUES (gen_random_uuid(), $1::uuid, 'admin')
    ON CONFLICT DO NOTHING;
  `, [id]);

  await client.query(`
    INSERT INTO public.user_profiles (user_id, display_name, company_name, professional_title, account_status)
    VALUES ($1::uuid, $2, $3, $4, 'active')
    ON CONFLICT (user_id) DO UPDATE 
      SET display_name = EXCLUDED.display_name, company_name = EXCLUDED.company_name, professional_title = EXCLUDED.professional_title;
  `, [id, name, company, execRole]);

  await client.query(`
    INSERT INTO public.members (id, code, name, email, phone, company_name, department, executive_role, user_id, association_id, status)
    VALUES ($1::text, $2, $3, $4, $5, $6, $7, $8, $9::uuid, $10::uuid, 'active')
    ON CONFLICT (id) DO UPDATE 
      SET code = EXCLUDED.code, name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, 
          company_name = EXCLUDED.company_name, department = EXCLUDED.department, executive_role = EXCLUDED.executive_role, user_id = EXCLUDED.user_id;
  `, [id, code, name, email, phone, company, dept, execRole, id, ASSOC_ID]);

  await client.query(`
    INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
    VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 'admin', true, now(), now())
    ON CONFLICT DO NOTHING;
  `, [id, ASSOC_ID]);

  console.log(`✓ Seeded ${email} (${execRole} - ${dept})`);
}

async function seedKeyRoles() {
  const client = await pool.connect();
  try {
    console.log('Seeding accounts...');

    // 1. CHỦ TỊCH CLB: ceo.chutich@ceo1983.com
    await seedUser(client, {
      id: 'c1983000-0000-4000-8000-000000000000',
      code: 'M1983-000',
      name: 'Nguyễn Xuân Thắng',
      email: 'ceo.chutich@ceo1983.com',
      phone: '0983198300',
      company: 'CLB Doanh Nhân CEO 1983',
      dept: 'Ban Điều Hành',
      execRole: 'Chủ tịch CLB'
    });

    // 2. BAN TÀI CHÍNH: ceo.taichinh@ceo1983.com
    await seedUser(client, {
      id: 'c1983000-0000-4000-8000-000000000003',
      code: 'M1983-003',
      name: 'Trần Anh Tuấn',
      email: 'ceo.taichinh@ceo1983.com',
      phone: '0983000003',
      company: 'Công ty Tài Chính & Kiểm Toán Hà Nội',
      dept: 'Ban Tài chính',
      execRole: 'Trưởng Ban Tài Chính'
    });

    // 3. BAN SỰ KIỆN: ceo.sukien@ceo1983.com
    await seedUser(client, {
      id: 'c1983000-0000-4000-8000-000000000006',
      code: 'M1983-006',
      name: 'Đặng Quốc Việt',
      email: 'ceo.sukien@ceo1983.com',
      phone: '0983000006',
      company: 'Việt Event & Media Solutions',
      dept: 'Ban Sự kiện',
      execRole: 'Trưởng Ban Sự Kiện'
    });

  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedKeyRoles();
