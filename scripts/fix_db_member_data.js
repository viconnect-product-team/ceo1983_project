const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  // 1. Ensure columns exist on public.members
  console.log('Ensuring columns on public.members...');
  await client.query(`
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS avatar text;
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS company_logo_url text;
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS cover_url text;
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS company_name text;
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS business_card_slug text;
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS executive_role text;
    ALTER TABLE public.members ADD COLUMN IF NOT EXISTS department text;
  `);

  // 2. Ensure columns on public.vione_users
  await client.query(`
    ALTER TABLE public.vione_users ADD COLUMN IF NOT EXISTS avatar_url text;
  `);

  // 3. Update Admin account (Phạm Văn Vũ - M1983-268)
  console.log('Updating Admin account Phạm Văn Vũ (M1983-268)...');
  const vuAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80';
  const vuCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';
  const vuCompany = 'Công ty Cổ phần Công nghệ VIO CONNECT';
  const vuTitle = 'Admin Hệ Thống';
  const vuDept = 'Ban Quản trị';
  const vuPhone = '0988888888';
  const vuAddress = 'Tầng 8, Tòa nhà ViConnect, Cầu Giấy, Hà Nội';
  const vuWebsite = 'https://viconnect.vn';
  const vuIndustry = 'Công nghệ thông tin & Chuyển đổi số';

  // 3.1 Update public.members
  await client.query(`
    UPDATE public.members
    SET
      name = 'Phạm Văn Vũ',
      contact = 'Phạm Văn Vũ',
      phone = $1,
      executive_role = $2,
      department = $3,
      company_name = $4,
      about = 'Thành viên Ban Điều Hành CLB CEO 1983 • Quản trị viên Hệ thống',
      avatar_url = $5,
      avatar = $5,
      cover_url = $6,
      address = $7,
      website = $8,
      industry = $9,
      updated_at = NOW()
    WHERE code = 'M1983-268' OR id = '00000000-0000-4000-8000-000000000002' OR user_id = '00000000-0000-4000-8000-000000000002';
  `, [vuPhone, vuTitle, vuDept, vuCompany, vuAvatar, vuCover, vuAddress, vuWebsite, vuIndustry]);

  // 3.2 Update public.vione_users
  await client.query(`
    UPDATE public.vione_users
    SET
      name = 'Phạm Văn Vũ',
      avatar_url = $1,
      updated_at = NOW()
    WHERE id = '00000000-0000-4000-8000-000000000002' OR email = 'admin@connect.vn';
  `, [vuAvatar]);

  // 3.3 Update public.user_profiles
  await client.query(`
    INSERT INTO public.user_profiles (
      user_id, display_name, professional_title, company_name, avatar_url, industry, region, updated_at
    ) VALUES (
      '00000000-0000-4000-8000-000000000002'::uuid, 'Phạm Văn Vũ', $1, $2, $3, $4, 'Hà Nội', NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
      display_name = 'Phạm Văn Vũ',
      professional_title = $1,
      company_name = $2,
      avatar_url = $3,
      industry = $4,
      updated_at = NOW();
  `, [vuTitle, vuCompany, vuAvatar, vuIndustry]);

  // 3.4 Update public.member_business_cards for Admin
  await client.query(`
    UPDATE public.member_business_cards
    SET
      display_name = 'Phạm Văn Vũ',
      professional_title = $1,
      company_name = $2,
      avatar_url = $3,
      cover_url = $4,
      work_phone = $5,
      work_email = 'admin@connect.vn',
      address = $6,
      website = $7,
      bio = 'Thành viên Ban Điều Hành CLB CEO 1983 • Quản trị viên Hệ thống VIONE Platform',
      updated_at = NOW()
    WHERE owner_user_id = '00000000-0000-4000-8000-000000000002';
  `, [vuTitle, vuCompany, vuAvatar, vuCover, vuPhone, vuAddress, vuWebsite]);

  // 4. Update other key leaders in CEO 1983
  const keyLeaders = [
    {
      code: 'M1983-001',
      name: 'Lê Hoàng Long',
      role: 'Tổng Thư Ký CLB',
      dept: 'Ban Thư ký',
      company: 'Tập Đoàn Hoàng Long Holdings',
      phone: '0983000001',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      industry: 'Đầu tư & Bất động sản thương mại'
    },
    {
      code: 'M1983-002',
      name: 'Nguyễn Văn Cường',
      role: 'Trưởng Ban Thành Viên',
      dept: 'Ban Thành viên',
      company: 'Cường Thịnh Group JSC',
      phone: '0983000002',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop&q=80',
      industry: 'Sản xuất & Công nghiệp phụ trợ'
    },
    {
      code: 'M1983-004',
      name: 'Phạm Quang Huy',
      role: 'Trưởng Ban Truyền Thông',
      dept: 'Ban Truyền thông',
      company: 'Huy Hoàng Media & Entertainment',
      phone: '0983000004',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      industry: 'Truyền thông & Tiếp thị số'
    },
    {
      code: 'M1983-005',
      name: 'Hoàng Minh Tuấn',
      role: 'Trưởng Ban Xúc Tiến Thương Mại',
      dept: 'Ban Xúc tiến',
      company: 'Tuấn Minh Global Trading Corp',
      phone: '0983000005',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80',
      industry: 'Xuất nhập khẩu & Phân phối quốc tế'
    },
    {
      code: 'M1983-033',
      name: 'Vũ Thu Trang',
      role: 'Trưởng Ban Thiện Nguyện',
      dept: 'Ban Thiện nguyện',
      company: 'Quỹ Thiện Nguyện CEO 1983',
      phone: '0983000033',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
      industry: 'Tài chính & Phát triển cộng đồng'
    }
  ];

  for (const leader of keyLeaders) {
    console.log(`Updating leader [${leader.code}] ${leader.name}...`);
    await client.query(`
      UPDATE public.members
      SET
        name = $1,
        contact = $1,
        phone = $2,
        executive_role = $3,
        department = $4,
        company_name = $5,
        avatar_url = $6,
        avatar = $6,
        cover_url = $7,
        industry = $8,
        updated_at = NOW()
      WHERE code = $9;
    `, [leader.name, leader.phone, leader.role, leader.dept, leader.company, leader.avatar, leader.cover, leader.industry, leader.code]);

    // Also update vione_users if matching member user_id
    await client.query(`
      UPDATE public.vione_users
      SET name = $1, avatar_url = $2, updated_at = NOW()
      WHERE id IN (SELECT user_id FROM public.members WHERE code = $3);
    `, [leader.name, leader.avatar, leader.code]);

    // Also update user_profiles
    await client.query(`
      UPDATE public.user_profiles
      SET display_name = $1, avatar_url = $2, company_name = $3, professional_title = $4, industry = $5, updated_at = NOW()
      WHERE user_id IN (SELECT user_id FROM public.members WHERE code = $6);
    `, [leader.name, leader.avatar, leader.company, leader.role, leader.industry, leader.code]);
  }

  // Verify results
  const check = await client.query("SELECT code, name, executive_role, company_name, avatar_url, cover_url FROM public.members ORDER BY code ASC");
  console.log('\n--- VERIFICATION OF ALL MEMBERS IN DB ---');
  console.log(check.rows);

  await client.end();
  console.log('\nDatabase update completed successfully!');
}

main().catch(console.error);
