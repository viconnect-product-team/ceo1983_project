const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';
const DEFAULT_PASSWORD = '123456';

const ALL_TEST_ACCOUNTS = [
  {
    code: 'TEST-1983-BQT',
    email: 'test.quantri@ceo1983.com',
    name: 'Nguyễn Văn Test (Ban Quản trị)',
    department: 'Ban Quản trị',
    executiveRole: 'Thành viên Ban Quản trị',
    appRole: 'admin',
    assocRole: 'admin',
    phone: '0983000100',
    company: 'Tập Đoàn Quản Trị Test',
    title: 'Thành viên Ban Quản trị',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Quản trị CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BDH',
    email: 'test.dieuhanh@ceo1983.com',
    name: 'Nguyễn Văn Test (Ban Điều Hành)',
    department: 'Ban Quản trị',
    executiveRole: 'Thành viên Ban Điều Hành',
    appRole: 'admin',
    assocRole: 'admin',
    phone: '0983000101',
    company: 'Tập Đoàn Điều Hành Test',
    title: 'Thành viên Ban Điều Hành',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Điều Hành / Ban Quản trị CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BTK',
    email: 'test.thuky@ceo1983.com',
    name: 'Trần Thị Test (Ban Thư ký)',
    department: 'Ban Thư ký',
    executiveRole: 'Thành viên Ban Thư ký',
    appRole: 'member',
    assocRole: 'member',
    phone: '0983000102',
    company: 'Công Ty Cổ Phần Thư Ký Test',
    title: 'Thành viên Ban Thư ký',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Thư ký CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BTV',
    email: 'test.thanhvien@ceo1983.com',
    name: 'Lê Hoàng Test (Ban Thành viên)',
    department: 'Ban Thành viên',
    executiveRole: 'Thành viên Ban Thành viên',
    appRole: 'member',
    assocRole: 'member',
    phone: '0983000103',
    company: 'Phát Triển Hội Viên Test JSC',
    title: 'Thành viên Ban Thành viên',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Thành viên CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BXT',
    email: 'test.xuctien@ceo1983.com',
    name: 'Hoàng Minh Test (Ban Xúc tiến)',
    department: 'Ban Xúc tiến',
    executiveRole: 'Thành viên Ban Xúc Tiến TM',
    appRole: 'member',
    assocRole: 'member',
    phone: '0983000104',
    company: 'Tập Đoàn Xúc Tiến B2B Test',
    title: 'Thành viên Ban Xúc Tiến TM',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Xúc Tiến Thương Mại CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BTT',
    email: 'test.truyenthong@ceo1983.com',
    name: 'Phạm Quang Test (Ban Truyền thông)',
    department: 'Ban Truyền thông',
    executiveRole: 'Thành viên Ban Truyền thông',
    appRole: 'member',
    assocRole: 'member',
    phone: '0983000105',
    company: 'Truyền Thông Số Test Media',
    title: 'Thành viên Ban Truyền thông',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Truyền thông CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BTC',
    email: 'test.taichinh@ceo1983.com',
    name: 'Đặng Thu Test (Ban Tài chính)',
    department: 'Ban Tài chính',
    executiveRole: 'Thành viên Ban Tài chính',
    appRole: 'member',
    assocRole: 'member',
    phone: '0983000106',
    company: 'Tài Chính & Kiểm Toán Test Corp',
    title: 'Thành viên Ban Tài chính',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Tài chính & Kế Toán CLB CEO 1983.'
  },
  {
    code: 'TEST-1983-BTN',
    email: 'test.thiennguyen@ceo1983.com',
    name: 'Vũ An Test (Ban Thiện nguyện)',
    department: 'Ban Thiện nguyện',
    executiveRole: 'Thành viên Ban Thiện nguyện',
    appRole: 'member',
    assocRole: 'member',
    phone: '0983000107',
    company: 'Quỹ Thiện Nguyện Tâm An Test',
    title: 'Thành viên Ban Thiện nguyện',
    about: 'Tài khoản thử nghiệm chuyên dụng phân hệ Ban Thiện nguyện & An Sinh Xã Hội CLB CEO 1983.'
  }
];

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

  for (const acc of ALL_TEST_ACCOUNTS) {
    let userId;
    const existingAuth = await client.query('SELECT id FROM auth.users WHERE email = $1', [acc.email]);
    if (existingAuth.rows.length > 0) {
      userId = existingAuth.rows[0].id;
    } else {
      userId = crypto.randomUUID();
      await client.query(`
        INSERT INTO auth.users (id, email, role)
        VALUES ($1::uuid, $2, 'authenticated')
      `, [userId, acc.email]);
    }

    // public.vione_users
    await client.query(`
      INSERT INTO public.vione_users (
        id, username, password, email, name, email_verified, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $2, $4, true, now(), now()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now()
    `, [userId, acc.email, passwordHash, acc.name]);

    // public.user_roles
    await client.query(`DELETE FROM public.user_roles WHERE user_id = $1::uuid;`, [userId]);
    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2::app_role, now());
    `, [userId, acc.appRole]);

    // public.user_profiles
    await client.query(`
      INSERT INTO public.user_profiles (
        user_id, display_name, professional_title, company_name, onboarding_status, account_status, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, 'completed'::onboarding_status, 'active'::account_status, now(), now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        professional_title = EXCLUDED.professional_title,
        company_name = EXCLUDED.company_name,
        onboarding_status = 'completed'::onboarding_status,
        account_status = 'active'::account_status,
        updated_at = now();
    `, [userId, acc.name, acc.title, acc.company]);

    // public.business_identities
    await client.query(`
      INSERT INTO public.business_identities (
        id, owner_user_id, display_name, job_title, company_name, primary_email, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2, $3, $4, $5, 'active', now(), now()
      )
      ON CONFLICT (owner_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        job_title = EXCLUDED.job_title,
        company_name = EXCLUDED.company_name,
        primary_email = EXCLUDED.primary_email,
        status = 'active',
        updated_at = now();
    `, [userId, acc.name, acc.title, acc.company, acc.email]);

    // public.members
    const existingMember = await client.query('SELECT id FROM public.members WHERE user_id = $1 OR email = $2', [userId, acc.email]);
    let memberId;
    if (existingMember.rows.length > 0) {
      memberId = existingMember.rows[0].id;
      await client.query(`
        UPDATE public.members SET
          code = $2,
          name = $3,
          contact = $4,
          email = $4,
          phone = $5,
          type = 'enterprise',
          level = 'vip',
          industry = 'Doanh nghiệp đa ngành',
          region = 'Hà Nội',
          status = 'active',
          address = 'Hà Nội, Việt Nam',
          about = $6,
          association_id = $7,
          payment_status = 'paid',
          department = $8,
          executive_role = $9,
          updated_at = now()
        WHERE id = $1;
      `, [memberId, acc.code, acc.name, acc.email, acc.phone, acc.about, ASSOC_ID, acc.department, acc.executiveRole]);
    } else {
      memberId = crypto.randomUUID();
      await client.query(`
        INSERT INTO public.members (
          id, code, name, contact, email, phone, type, level, industry, region, status,
          joined_at, fee_year, fee_paid, address, about, created_at, updated_at,
          user_id, association_id, payment_status, department, executive_role
        ) VALUES (
          $1, $2, $3, $4, $4, $5, 'enterprise', 'vip', 'Doanh nghiệp đa ngành', 'Hà Nội', 'active',
          CURRENT_DATE, 2026, true, 'Hà Nội, Việt Nam', $6, now(), now(),
          $7, $8, 'paid', $9, $10
        );
      `, [memberId, acc.code, acc.name, acc.email, acc.phone, acc.about, userId, ASSOC_ID, acc.department, acc.executiveRole]);
    }

    // public.memberships
    await client.query(`
      DELETE FROM public.memberships WHERE user_id = $1::uuid AND association_id = $2::uuid;
    `, [userId, ASSOC_ID]);
    await client.query(`
      INSERT INTO public.memberships (
        id, user_id, association_id, role, is_default, department, executive_role, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, $3::app_role, true, $4, $5, now(), now()
      );
    `, [userId, ASSOC_ID, acc.assocRole === 'admin' ? 'admin' : 'member', acc.department, acc.executiveRole]);

    // public.member_business_cards
    const cardSlug = `card-${acc.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-')}`;
    await client.query(`DELETE FROM public.member_business_cards WHERE owner_user_id = $1::uuid;`, [userId]);
    await client.query(`
      INSERT INTO public.member_business_cards (
        id, association_id, owner_user_id, member_id, display_name, company_name, professional_title,
        work_email, work_phone, bio, status, slug, card_kind, public_mode, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, 'published', $10, 'primary', 'public', now(), now()
      );
    `, [
      ASSOC_ID, userId, memberId, acc.name, acc.company, acc.title,
      acc.email, acc.phone, acc.about, cardSlug
    ]);

    console.log(`✅ [${acc.department}] ${acc.name} -> ${acc.email} (Pass: ${DEFAULT_PASSWORD})`);
  }

  // Chuẩn hóa tên ban cho anh Cao Văn Mạnh
  await client.query(`
    UPDATE public.members SET department = 'Ban Thư ký', executive_role = 'Ủy Viên BCH Ban Thư ký'
    WHERE code = 'M1983-013' AND association_id = $1::uuid;
  `, [ASSOC_ID]);

  // Đồng bộ profile member cho admin1@connect.vn nếu chưa có
  const admin1User = await client.query(`SELECT id, email, name FROM public.vione_users WHERE email = 'admin1@connect.vn'`);
  if (admin1User.rows.length > 0) {
    const a1 = admin1User.rows[0];
    const existingA1Member = await client.query(`SELECT id FROM public.members WHERE user_id = $1`, [a1.id]);
    if (existingA1Member.rows.length === 0) {
      await client.query(`
        INSERT INTO public.members (
          id, code, name, contact, email, phone, type, level, industry, region, status,
          joined_at, fee_year, fee_paid, address, about, created_at, updated_at,
          user_id, association_id, payment_status, department, executive_role
        ) VALUES (
          $1, 'M1983-000', $2, $3, $3, '0901000001', 'enterprise', 'vip', 'Công nghệ & Nền tảng', 'Hà Nội', 'active',
          CURRENT_DATE, 2026, true, 'Hà Nội, Việt Nam', 'Quản trị viên Nền tảng ViConnect', now(), now(),
          $4, $5, 'paid', 'Ban Quản trị', 'platform_admin'
        );
      `, [a1.id, a1.name, a1.email, a1.id, ASSOC_ID]);
      console.log('✅ Đã bổ sung profile member cho Trần Tuấn Anh (Platform Admin).');
    }
  }

  console.log('\n🎉 ĐỒNG BỘ HOÀN TẤT!');
  await client.end();
}

main().catch(console.error);
