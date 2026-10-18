const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/vione_app?sslmode=disable'
});

const PWD_HASH = '$2b$10$FwXJpAWcYsEPAOii4hwZVu7L6YOlT/1sb4cSM6azBs1xED6FPhBka'; // 123456
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

const membersToSeed = [
  {
    id: 'c1983000-0000-4000-8000-000000000011',
    code: 'M1983-051',
    name: 'Đỗ Thị Mai',
    email: 'ceo.member1@ceo1983.com',
    phone: '0983000051',
    company: 'Công ty May Mặc & Xuất Nhập Khẩu Mai Hương',
    dept: 'Ban Thành viên',
    execRole: 'Hội viên'
  },
  {
    id: 'c1983000-0000-4000-8000-000000000012',
    code: 'M1983-052',
    name: 'Bùi Đức Thắng',
    email: 'ceo.member2@ceo1983.com',
    phone: '0983000052',
    company: 'Thắng Lợi B2B Supply Chain JSC',
    dept: 'Ban Xúc tiến',
    execRole: 'Hội viên'
  },
  {
    id: 'c1983000-0000-4000-8000-000000000013',
    code: 'M1983-053',
    name: 'Ngô Bảo Anh',
    email: 'ceo.member3@ceo1983.com',
    phone: '0983000053',
    company: 'Bảo Anh Digital Marketing Studio',
    dept: 'Ban Truyền thông',
    execRole: 'Hội viên'
  },
  {
    id: 'c1983000-0000-4000-8000-000000000014',
    code: 'M1983-054',
    name: 'Đinh Trọng Hiếu',
    email: 'ceo.member4@ceo1983.com',
    phone: '0983000054',
    company: 'Trọng Hiếu Green Energy Solutions',
    dept: 'Ban Thiện nguyện',
    execRole: 'Hội viên'
  },
  {
    id: 'c1983000-0000-4000-8000-000000000015',
    code: 'M1983-055',
    name: 'Trịnh Kim Oanh',
    email: 'ceo.member5@ceo1983.com',
    phone: '0983000055',
    company: 'Kim Oanh Luật & Dịch Vụ Doanh Nghiệp',
    dept: 'Ban Thư ký',
    execRole: 'Hội viên'
  }
];

async function seedRegularMembers() {
  const client = await pool.connect();
  try {
    console.log('Seeding regular committee members...');
    for (const m of membersToSeed) {
      await client.query(`
        INSERT INTO public.vione_users (id, username, password, email, name, email_verified, created_at, updated_at)
        VALUES ($1::uuid, $2, $3, $2, $4, true, now(), now())
        ON CONFLICT (id) DO UPDATE 
          SET username = EXCLUDED.username, email = EXCLUDED.email, password = EXCLUDED.password, name = EXCLUDED.name;
      `, [m.id, m.email, PWD_HASH, m.name]);

      await client.query(`
        INSERT INTO public.user_roles (id, user_id, role)
        VALUES (gen_random_uuid(), $1::uuid, 'member')
        ON CONFLICT DO NOTHING;
      `, [m.id]);

      await client.query(`
        INSERT INTO public.user_profiles (user_id, display_name, company_name, professional_title, account_status)
        VALUES ($1::uuid, $2, $3, $4, 'active')
        ON CONFLICT (user_id) DO UPDATE 
          SET display_name = EXCLUDED.display_name, company_name = EXCLUDED.company_name, professional_title = EXCLUDED.professional_title;
      `, [m.id, m.name, m.company, m.execRole]);

      await client.query(`
        INSERT INTO public.members (id, code, name, email, phone, company_name, department, executive_role, user_id, association_id, status)
        VALUES ($1::text, $2, $3, $4, $5, $6, $7, $8, $9::uuid, $10::uuid, 'active')
        ON CONFLICT (id) DO UPDATE 
          SET code = EXCLUDED.code, name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, 
              company_name = EXCLUDED.company_name, department = EXCLUDED.department, executive_role = EXCLUDED.executive_role, user_id = EXCLUDED.user_id;
      `, [m.id, m.code, m.name, m.email, m.phone, m.company, m.dept, m.execRole, m.id, ASSOC_ID]);

      await client.query(`
        INSERT INTO public.memberships (id, user_id, association_id, role, is_default, created_at, updated_at)
        VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 'member', true, now(), now())
        ON CONFLICT DO NOTHING;
      `, [m.id, ASSOC_ID]);

      console.log(`✓ Seeded ${m.email} (${m.name} - ${m.dept})`);
    }
  } catch (err) {
    console.error('Error seeding regular members:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedRegularMembers();
