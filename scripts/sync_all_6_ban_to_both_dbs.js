const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DB_URLS = [
  { name: 'ceo1983_project', url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' },
  { name: 'vione_app', url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' }
];

const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

const ACCOUNTS = [
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'admin@connect.vn',
    name: 'Phạm Văn Vũ (Admin)',
    code: 'M1983-268',
    department: 'Ban Quản trị',
    executive_role: 'Admin Hệ Thống',
    phone: '0988888888',
  },
  {
    id: 'c1983000-0000-4000-8000-000000000001',
    email: 'ceo.tongthuky@ceo1983.com',
    name: 'Lê Hoàng Long',
    code: 'M1983-001',
    department: 'Ban Thư ký',
    executive_role: 'Tổng Thư Ký CLB',
    phone: '0912345671',
  },
  {
    id: 'c1983000-0000-4000-8000-000000000002',
    email: 'ceo.thanhvien@ceo1983.com',
    name: 'Nguyễn Văn Cường',
    code: 'M1983-002',
    department: 'Ban Thành viên',
    executive_role: 'Trưởng Ban Thành Viên',
    phone: '0912345672',
  },
  {
    id: 'c1983000-0000-4000-8000-000000000033',
    email: 'ceo.thiennguyen@ceo1983.com',
    name: 'Vũ Thu Trang',
    code: 'M1983-033',
    department: 'Ban Thiện nguyện',
    executive_role: 'Trưởng Ban Thiện Nguyện',
    phone: '0912345673',
  },
  {
    id: 'c1983000-0000-4000-8000-000000000004',
    email: 'ceo.truyenthong@ceo1983.com',
    name: 'Phạm Quang Huy',
    code: 'M1983-004',
    department: 'Ban Truyền thông',
    executive_role: 'Trưởng Ban Truyền Thông',
    phone: '0912345674',
  },
  {
    id: 'c1983000-0000-4000-8000-000000000005',
    email: 'ceo.xuctien@ceo1983.com',
    name: 'Hoàng Minh Tuấn',
    code: 'M1983-005',
    department: 'Ban Xúc tiến',
    executive_role: 'Trưởng Ban Xúc Tiến Thương Mại',
    phone: '0912345675',
  }
];

async function syncDb(dbConfig) {
  console.log(`\n================ Syncing to ${dbConfig.name} ================`);
  const client = new Client({ connectionString: dbConfig.url });
  await client.connect();

  const hashedPw = await bcrypt.hash('123456', 10);

  for (const acc of ACCOUNTS) {
    console.log(`Processing: ${acc.email} (${acc.department})`);

    // 1. Upsert vione_users
    await client.query(`
      INSERT INTO public.vione_users (id, email, username, name, password, email_verified, created_at, updated_at)
      VALUES ($1, $2, $2, $3, $4, true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE 
      SET email = EXCLUDED.email,
          username = EXCLUDED.username,
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          email_verified = true,
          updated_at = NOW();
    `, [acc.id, acc.email, acc.name, hashedPw]);

    // 1b. Upsert auth.users (to satisfy user_roles foreign key)
    try {
      await client.query(`
        INSERT INTO auth.users (id, email, role)
        VALUES ($1::uuid, $2, 'authenticated')
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
      `, [acc.id, acc.email]);
    } catch (authErr) {
      // Ignore if auth.users schema is not present in this db
    }

    // 2. Upsert user_roles
    await client.query(`
      INSERT INTO public.user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1, 'admin', NOW())
      ON CONFLICT DO NOTHING;
    `, [acc.id]);

    // Check if user already has role
    const rCheck = await client.query(`SELECT * FROM public.user_roles WHERE user_id = $1`, [acc.id]);
    if (rCheck.rows.length === 0) {
      await client.query(`INSERT INTO public.user_roles (id, user_id, role) VALUES (gen_random_uuid(), $1, 'admin')`, [acc.id]);
    }

    // 3. Upsert members
    // Check if member exists by user_id or email
    const mCheck = await client.query(`SELECT id FROM public.members WHERE user_id = $1 OR email = $2`, [acc.id, acc.email]);
    if (mCheck.rows.length > 0) {
      const existingId = mCheck.rows[0].id;
      await client.query(`
        UPDATE public.members
        SET name = $1,
            department = $2,
            executive_role = $3,
            status = 'active',
            fee_paid = true,
            payment_status = 'paid',
            phone = $4,
            user_id = $5,
            association_id = $6,
            updated_at = NOW()
        WHERE id = $7;
      `, [acc.name, acc.department, acc.executive_role, acc.phone, acc.id, ASSOC_ID, existingId]);
      console.log(`  ✓ Updated existing member: ${existingId}`);
    } else {
      await client.query(`
        INSERT INTO public.members (
          id, code, name, contact, email, phone, type, level, industry, region,
          status, joined_at, fee_year, fee_paid, payment_status, address, about,
          created_at, updated_at, user_id, association_id, department, executive_role
        ) VALUES (
          $1, $2, $3, $3, $4, $5, 'Chính thức', 'VIP', 'Đa ngành', 'Hà Nội',
          'active', CURRENT_DATE, 2026, true, 'paid', 'Hà Nội, Việt Nam', 'Thành viên Ban Điều Hành CLB CEO 1983',
          NOW(), NOW(), $6, $7, $8, $9
        );
      `, [
        acc.id,
        acc.code,
        acc.name,
        acc.email,
        acc.phone,
        acc.id,
        ASSOC_ID,
        acc.department,
        acc.executive_role
      ]);
      console.log(`  ✓ Inserted new member: ${acc.code}`);
    }
  }

  // Verify accounts in this DB
  const verify = await client.query(`
    SELECT u.email, u.name, m.department, m.executive_role, m.status, m.user_id
    FROM public.vione_users u
    LEFT JOIN public.members m ON m.user_id = u.id OR m.email = u.email
    WHERE u.email IN (${ACCOUNTS.map(a => `'${a.email}'`).join(',')})
    ORDER BY u.email
  `);
  console.log(`\nVerification in ${dbConfig.name}:`);
  console.table(verify.rows);

  await client.end();
}

async function main() {
  for (const db of DB_URLS) {
    try {
      await syncDb(db);
    } catch (err) {
      console.error(`Error syncing ${db.name}:`, err);
    }
  }
}

main().catch(console.error);
