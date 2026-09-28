const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';
const assocId = 'c1983000-0000-4000-8000-000000001983';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to Database.');

  const salt = await bcrypt.genSalt(10);
  const hash123456 = await bcrypt.hash('123456', salt);

  const functionalAccounts = [
    {
      id: 'c1983000-0000-4000-8000-000000000001',
      username: 'ceo.tongthuky@ceo1983.com',
      email: 'ceo.tongthuky@ceo1983.com',
      name: 'Lê Hoàng Long',
      passwordHash: hash123456,
      appRole: 'admin',
      assocRole: 'admin',
      executiveRole: 'Tổng Thư Ký',
      department: 'Ban Thư ký',
      phone: '0983000001',
      company: 'Tập Đoàn Hoàng Long',
      title: 'Tổng Thư Ký CLB CEO 1983',
      memberCode: 'M1983-TK01'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000002',
      username: 'ceo.thanhvien@ceo1983.com',
      email: 'ceo.thanhvien@ceo1983.com',
      name: 'Nguyễn Văn Cường',
      passwordHash: hash123456,
      appRole: 'admin',
      assocRole: 'admin',
      executiveRole: 'Trưởng Ban Thành Viên',
      department: 'Ban Thành viên',
      phone: '0983000002',
      company: 'Cường Thịnh Corp',
      title: 'Trưởng Ban Thành Viên',
      memberCode: 'M1983-TV01'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000003',
      username: 'ceo.taichinh@ceo1983.com',
      email: 'ceo.taichinh@ceo1983.com',
      name: 'Vũ Thu Trang',
      passwordHash: hash123456,
      appRole: 'admin',
      assocRole: 'admin',
      executiveRole: 'Trưởng Ban Tài Chính',
      department: 'Ban Tài chính',
      phone: '0983000003',
      company: 'Kiến Vàng Capital',
      title: 'Trưởng Ban Tài Chính',
      memberCode: 'M1983-TC01'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000004',
      username: 'ceo.truyenthong@ceo1983.com',
      email: 'ceo.truyenthong@ceo1983.com',
      name: 'Phạm Quang Huy',
      passwordHash: hash123456,
      appRole: 'admin',
      assocRole: 'admin',
      executiveRole: 'Trưởng Ban Truyền Thông',
      department: 'Ban Truyền thông',
      phone: '0983000004',
      company: 'Huy Hoàng Media Group',
      title: 'Trưởng Ban Truyền Thông',
      memberCode: 'M1983-TT01'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000005',
      username: 'ceo.xuctien@ceo1983.com',
      email: 'ceo.xuctien@ceo1983.com',
      name: 'Hoàng Minh Tuấn',
      passwordHash: hash123456,
      appRole: 'admin',
      assocRole: 'admin',
      executiveRole: 'Trưởng Ban Xúc Tiến Thương Mại',
      department: 'Ban Xúc tiến thương mại',
      phone: '0983000005',
      company: 'Tuấn Minh Global Trade',
      title: 'Trưởng Ban Xúc Tiến Thương Mại',
      memberCode: 'M1983-XT01'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000006',
      username: 'ceo.member1@ceo1983.com',
      email: 'ceo.member1@ceo1983.com',
      name: 'Đỗ Thị Mai',
      passwordHash: hash123456,
      appRole: 'member',
      assocRole: 'member',
      executiveRole: 'Hội viên Ban Thành viên',
      department: 'Ban Thành viên',
      phone: '0983000006',
      company: 'EcoClean Vietnam',
      title: 'Hội viên Ban Thành viên',
      memberCode: 'M1983-TV02'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000007',
      username: 'ceo.member2@ceo1983.com',
      email: 'ceo.member2@ceo1983.com',
      name: 'Bùi Đức Thắng',
      passwordHash: hash123456,
      appRole: 'member',
      assocRole: 'member',
      executiveRole: 'Hội viên Ban Xúc tiến thương mại',
      department: 'Ban Xúc tiến thương mại',
      phone: '0983000007',
      company: 'Thắng Lợi XNK JSC',
      title: 'Hội viên Ban Xúc tiến thương mại',
      memberCode: 'M1983-XT02'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000008',
      username: 'ceo.member3@ceo1983.com',
      email: 'ceo.member3@ceo1983.com',
      name: 'Ngô Bảo Anh',
      passwordHash: hash123456,
      appRole: 'member',
      assocRole: 'member',
      executiveRole: 'Hội viên Ban Truyền thông',
      department: 'Ban Truyền thông',
      phone: '0983000008',
      company: 'MediaPro Solution',
      title: 'Hội viên Ban Truyền thông',
      memberCode: 'M1983-TT02'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000009',
      username: 'ceo.member4@ceo1983.com',
      email: 'ceo.member4@ceo1983.com',
      name: 'Đinh Trọng Hiếu',
      passwordHash: hash123456,
      appRole: 'member',
      assocRole: 'member',
      executiveRole: 'Hội viên Ban Tài chính',
      department: 'Ban Tài chính',
      phone: '0983000009',
      company: 'Tài Chính Việt An',
      title: 'Hội viên Ban Tài chính',
      memberCode: 'M1983-TC02'
    },
    {
      id: 'c1983000-0000-4000-8000-000000000010',
      username: 'ceo.member5@ceo1983.com',
      email: 'ceo.member5@ceo1983.com',
      name: 'Trịnh Kim Oanh',
      passwordHash: hash123456,
      appRole: 'member',
      assocRole: 'member',
      executiveRole: 'Hội viên Ban Thư ký',
      department: 'Ban Thư ký',
      phone: '0983000010',
      company: 'An Phát Holding',
      title: 'Hội viên Ban Thư ký',
      memberCode: 'M1983-TK02'
    }
  ];

  for (const acc of functionalAccounts) {
    // 1. auth.users
    await client.query(`
      INSERT INTO auth.users (id, email, role)
      VALUES ($1::uuid, $2, 'authenticated')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    `, [acc.id, acc.email]);

    // 2. public.vione_users
    await client.query(`
      INSERT INTO public.vione_users (
        id, username, password, email, name, email_verified, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, true, now(), now()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();
    `, [acc.id, acc.username, acc.passwordHash, acc.email, acc.name]);

    // 3. public.user_roles
    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2::app_role, now())
      ON CONFLICT DO NOTHING;
    `, [acc.id, acc.appRole]);

    // 4. public.user_profiles
    await client.query(`
      INSERT INTO public.user_profiles (
        user_id, display_name, professional_title, company_name, onboarding_status, account_status
      ) VALUES (
        $1::uuid, $2, $3, $4, 'completed'::onboarding_status, 'active'::account_status
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        professional_title = EXCLUDED.professional_title,
        company_name = EXCLUDED.company_name;
    `, [acc.id, acc.name, acc.title, acc.company]);

    // 5. public.members
    await client.query(`
      INSERT INTO public.members (
        id, code, name, contact, email, phone, type, level, industry, region, status,
        joined_at, fee_year, fee_paid, address, about, created_at, updated_at,
        avatar, association_id, user_id, department, executive_role
      ) VALUES (
        $1::uuid, $2, $3, $3, $4, $5, 'official', 'member', 'Đa ngành', 'Hà Nội', 'active',
        now(), 2026, true, 'Hà Nội', 'Hội viên CLB CEO 1983', now(), now(),
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        $6::uuid, $1::uuid, $7, $8
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        department = EXCLUDED.department,
        executive_role = EXCLUDED.executive_role,
        code = EXCLUDED.code;
    `, [acc.id, acc.memberCode, acc.name, acc.email, acc.phone, assocId, acc.department, acc.executiveRole]);

    // 6. public.memberships
    await client.query(`
      INSERT INTO public.memberships (
        id, user_id, association_id, role, is_default, created_at, updated_at, department, executive_role
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, $3, true, now(), now(), $4, $5
      )
      ON CONFLICT DO NOTHING;
    `, [acc.id, assocId, acc.assocRole, acc.department, acc.executiveRole]);

    console.log(`Seeded account: ${acc.email} (${acc.department} - ${acc.executiveRole})`);
  }

  console.log('✅ ALL FUNCTIONAL BAN ACCOUNTS SEEDED SUCCESSFULLY!');
  await client.end();
}

main().catch(console.error);
