const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';
const assocId = 'c1983000-0000-4000-8000-000000001983';

async function run() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL Database...');

  // 1. Update public.members departments to exact 6 Ban:
  // - Ban Quản trị
  // - Ban Thư ký
  // - Ban Truyền thông
  // - Ban Xúc tiến
  // - Ban Thành viên
  // - Ban Thiện nguyện
  await client.query(`
    UPDATE public.members 
    SET department = 'Ban Quản trị' 
    WHERE department IN ('Ban Điều Hành', 'Ban Quản Trị', 'Ban Công Nghệ & Chuyển Đổi Số');

    UPDATE public.members 
    SET department = 'Ban Thư ký' 
    WHERE department IN ('Ban Thư Ký & Điều Phối', 'Ban Thư ký');

    UPDATE public.members 
    SET department = 'Ban Truyền thông' 
    WHERE department IN ('Ban Truyền Thông & Sự Kiện', 'Ban Truyền thông');

    UPDATE public.members 
    SET department = 'Ban Xúc tiến' 
    WHERE department IN ('Ban Xúc Tiến Thương Mại & Đầu Tư B2B', 'Ban Xúc tiến thương mại', 'Ban Xúc Tiến', 'Ban Xúc tiến Thương mại');

    UPDATE public.members 
    SET department = 'Ban Thành viên' 
    WHERE department IN ('Ban Phát Triển Hội Viên & Thẩm Định', 'Ban Thành viên');

    UPDATE public.members 
    SET department = 'Ban Thiện nguyện' 
    WHERE department IN ('Ban Tài Chính & Pháp Chế', 'Ban Tài chính', 'Ban Đào Tạo & Chuyển Đổi Số', 'Ban Thiện nguyện & An sinh Xã hội');
  `);
  console.log('✓ Updated public.members departments.');

  // 2. Update executive roles for members transferred to Ban Thiện nguyện
  await client.query(`
    UPDATE public.members
    SET executive_role = 'Trưởng Ban Thiện Nguyện'
    WHERE code = 'M1983-011';

    UPDATE public.members
    SET executive_role = 'Phó Ban Thiện Nguyện'
    WHERE code IN ('M1983-012', 'M1983-025', 'M1983-026');

    UPDATE public.members
    SET executive_role = 'Ủy Viên Ban Thiện Nguyện'
    WHERE code IN ('M1983-019', 'M1983-020');
  `);
  console.log('✓ Updated executive roles for members.');

  // 3. Upsert user ceo.thiennguyen@ceo1983.com and update ceo.taichinh
  const oldUser = await client.query(`SELECT * FROM public.vione_users WHERE email = 'ceo.taichinh@ceo1983.com' LIMIT 1;`);
  if (oldUser.rows.length > 0) {
    const u = oldUser.rows[0];
    const thienNguyenId = 'c1983000-0000-4000-8000-000000000033';

    await client.query(`
      INSERT INTO auth.users (id, email, role)
      VALUES ($1::uuid, 'ceo.thiennguyen@ceo1983.com', 'authenticated')
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    `, [thienNguyenId]);

    await client.query(`
      INSERT INTO public.vione_users (id, username, password, email, name, email_verified, created_at, updated_at)
      VALUES ($1, 'ceo.thiennguyen@ceo1983.com', $2, 'ceo.thiennguyen@ceo1983.com', 'Vũ Thu Trang', true, now(), now())
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password = EXCLUDED.password;
    `, [thienNguyenId, u.password]);

    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role)
      VALUES (gen_random_uuid(), $1, 'admin')
      ON CONFLICT DO NOTHING;
    `, [thienNguyenId]);

    await client.query(`
      INSERT INTO public.user_profiles (user_id, display_name, company_name, professional_title, account_status)
      VALUES ($1, 'Vũ Thu Trang', 'Quỹ Thiện Nguyện CEO 1983', 'Trưởng Ban Thiện Nguyện', 'active')
      ON CONFLICT (user_id) DO UPDATE SET 
        display_name = EXCLUDED.display_name,
        company_name = EXCLUDED.company_name,
        professional_title = EXCLUDED.professional_title;
    `, [thienNguyenId]);

    await client.query(`
      INSERT INTO public.memberships (id, user_id, association_id, role, executive_role, department, is_default, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        'admin',
        'Trưởng Ban Thiện Nguyện',
        'Ban Thiện nguyện',
        true,
        now(),
        now()
      )
      ON CONFLICT DO NOTHING;
    `, [thienNguyenId, assocId]);

    // Also update existing ceo.taichinh profile & membership to Ban Thiện nguyện so either login works seamlessly
    await client.query(`
      UPDATE public.memberships
      SET department = 'Ban Thiện nguyện', executive_role = 'Trưởng Ban Thiện Nguyện'
      WHERE user_id = 'c1983000-0000-4000-8000-000000000003';

      UPDATE public.user_profiles
      SET professional_title = 'Trưởng Ban Thiện Nguyện'
      WHERE user_id = 'c1983000-0000-4000-8000-000000000003';
    `);
    console.log('✓ Configured ceo.thiennguyen@ceo1983.com and synced ceo.taichinh.');
  }

  // 4. Update ceo.member4 to Ban Thiện nguyện
  await client.query(`
    UPDATE public.memberships
    SET department = 'Ban Thiện nguyện', executive_role = 'Hội viên Ban Thiện nguyện'
    WHERE user_id = 'c1983000-0000-4000-8000-000000000009';

    UPDATE public.user_profiles
    SET professional_title = 'Hội viên Ban Thiện nguyện'
    WHERE user_id = 'c1983000-0000-4000-8000-000000000009';
  `);
  console.log('✓ Updated ceo.member4 to Ban Thiện nguyện.');

  // 5. Update other functional memberships to standardized names
  await client.query(`
    UPDATE public.memberships
    SET department = 'Ban Thư ký'
    WHERE department IN ('Ban Thư Ký', 'Ban Thư Ký & Điều Phối');

    UPDATE public.memberships
    SET department = 'Ban Thành viên'
    WHERE department IN ('Ban Thành Viên', 'Ban Phát Triển Hội Viên & Thẩm Định');

    UPDATE public.memberships
    SET department = 'Ban Truyền thông'
    WHERE department IN ('Ban Truyền Thông', 'Ban Truyền Thông & Sự Kiện');

    UPDATE public.memberships
    SET department = 'Ban Xúc tiến'
    WHERE department IN ('Ban Xúc tiến thương mại', 'Ban Xúc Tiến Thương Mại', 'Ban Xúc Tiến Thương Mại & Đầu Tư B2B');

    UPDATE public.memberships
    SET department = 'Ban Quản trị'
    WHERE department IN ('Ban Quản Trị', 'Ban Điều Hành', 'Ban Điều Hành Hệ Thống', 'Ban Công Nghệ & Chuyển Đổi Số');

    UPDATE public.memberships
    SET department = 'Ban Thiện nguyện'
    WHERE department IN ('Ban Tài Chính & Pháp Chế', 'Ban Tài chính', 'Ban Đào Tạo & Chuyển Đổi Số', 'Ban Thiện nguyện & An sinh Xã hội');
  `);
  console.log('✓ Standardized all public.memberships departments.');

  // Check results
  const res = await client.query('SELECT DISTINCT department, count(*) FROM public.members GROUP BY department ORDER BY department;');
  console.log('\n--- RESULTING DEPARTMENTS IN public.members ---');
  console.table(res.rows);

  const memsRes = await client.query('SELECT DISTINCT department, count(*) FROM public.memberships GROUP BY department ORDER BY department;');
  console.log('\n--- RESULTING DEPARTMENTS IN public.memberships ---');
  console.table(memsRes.rows);

  const fs = require('fs');
  const summaryRes = await client.query(`
    SELECT ms.department, ms.executive_role, ms.role as membership_role, u.email, u.name, 
           p.display_name, m.contact as phone, p.company_name, p.professional_title, m.code as member_code
    FROM public.memberships ms
    LEFT JOIN public.vione_users u ON u.id = ms.user_id
    LEFT JOIN public.user_profiles p ON p.user_id = ms.user_id
    LEFT JOIN public.members m ON (m.user_id = ms.user_id OR m.email = u.email)
    WHERE ms.association_id = $1
    ORDER BY ms.department, ms.role DESC, m.code ASC
  `, [assocId]);

  const departments = {};
  for (const row of summaryRes.rows) {
    const dept = row.department || 'Ban Quản trị';
    if (!departments[dept]) departments[dept] = [];
    departments[dept].push(row);
  }

  const summary = {
    totalCeo1983Memberships: summaryRes.rows.length,
    departments,
    demoSystemUsers: [
      { email: 'admin@connect.vn', name: 'Phạm Văn Vũ (Admin)', department: 'Ban Quản trị', role: 'Super Admin' },
      { email: 'admin1@connect.vn', name: 'Trần Tuấn Anh (Platform Admin)', department: 'Ban Quản trị', role: 'Platform Admin' },
      { email: 'ceo.tongthuky@ceo1983.com', name: 'Lê Hoàng Long', department: 'Ban Thư ký', role: 'Tổng Thư Ký' },
      { email: 'ceo.thanhvien@ceo1983.com', name: 'Nguyễn Văn Cường', department: 'Ban Thành viên', role: 'Trưởng Ban Thành Viên' },
      { email: 'ceo.thiennguyen@ceo1983.com', name: 'Vũ Thu Trang', department: 'Ban Thiện nguyện', role: 'Trưởng Ban Thiện Nguyện' },
      { email: 'ceo.truyenthong@ceo1983.com', name: 'Phạm Quang Huy', department: 'Ban Truyền thông', role: 'Trưởng Ban Truyền Thông' },
      { email: 'ceo.xuctien@ceo1983.com', name: 'Hoàng Minh Tuấn', department: 'Ban Xúc tiến', role: 'Trưởng Ban Xúc Tiến' },
      { email: 'ceo.member1@ceo1983.com', name: 'Đỗ Thị Mai', department: 'Ban Thành viên', role: 'Hội viên Ban Thành viên' },
      { email: 'ceo.member2@ceo1983.com', name: 'Bùi Đức Thắng', department: 'Ban Xúc tiến', role: 'Hội viên Ban Xúc tiến' },
      { email: 'ceo.member3@ceo1983.com', name: 'Ngô Bảo Anh', department: 'Ban Truyền thông', role: 'Hội viên Ban Truyền thông' },
      { email: 'ceo.member4@ceo1983.com', name: 'Đinh Trọng Hiếu', department: 'Ban Thiện nguyện', role: 'Hội viên Ban Thiện nguyện' },
      { email: 'ceo.member5@ceo1983.com', name: 'Trịnh Kim Oanh', department: 'Ban Thư ký', role: 'Hội viên Ban Thư ký' }
    ]
  };

  fs.writeFileSync('packages/db/ceo1983_accounts_summary.json', JSON.stringify(summary, null, 2), 'utf8');
  console.log('✓ Successfully updated packages/db/ceo1983_accounts_summary.json');

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
