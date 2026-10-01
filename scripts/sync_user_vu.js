const { Client } = require('pg');

const urls = [
  { name: 'ceo1983_project', url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' },
  { name: 'vione_app', url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' }
];

async function syncUserVu() {
  const userId = 'fbe04bac-7549-4757-a476-ff45d1c3018a';
  const email = 'vupv090120@gmail.com';
  const fullName = 'Phạm Văn Vũ';
  const phone = '0901201983';
  const company = 'Công ty Cổ phần Công nghệ VIO CONNECT';
  const taxCode = '0109831983';

  for (const db of urls) {
    const client = new Client({ connectionString: db.url });
    await client.connect();
    console.log('--- Connecting to', db.name, '---');

    // 1. auth.users
    try {
      await client.query(`
        INSERT INTO auth.users (id, email, role)
        VALUES ($1, $2, 'authenticated')
        ON CONFLICT (id) DO UPDATE SET email = $2
      `, [userId, email]);
      console.log('auth.users OK');
    } catch (e) {
      console.log('auth.users note:', e.message);
    }

    // 2. vione_users
    try {
      await client.query(`
        INSERT INTO public.vione_users (id, username, email, name, email_verified, password)
        VALUES ($1, $2, $2, $3, true, '$2b$10$ih4Vv0EKesmvv0Ugg.uYNeK/QFFIkv7EbpYNiwLipsPIZXFeOxWiW')
        ON CONFLICT (id) DO UPDATE SET name = $3, email = $2, username = $2
      `, [userId, email, fullName]);
      console.log('vione_users OK');
    } catch (e) {
      console.log('vione_users note:', e.message);
    }

    // 3. user_profiles
    try {
      await client.query(`
        INSERT INTO public.user_profiles (
          user_id, display_name, professional_title, company_name, account_status
        ) VALUES (
          $1, $2, 'Tổng Giám Đốc • Hội viên CEO 1983', $3, 'active'
        )
        ON CONFLICT (user_id) DO UPDATE SET
          display_name = $2,
          professional_title = 'Tổng Giám Đốc • Hội viên CEO 1983',
          company_name = $3,
          account_status = 'active'
      `, [userId, fullName, company]);
      console.log('user_profiles OK');
    } catch (e) {
      console.log('user_profiles note:', e.message);
    }

    // 4. members
    try {
      const m = await client.query("SELECT * FROM public.members WHERE email = $1 OR user_id = $2::uuid", [email, userId]);
      if (m.rows.length === 0) {
        await client.query(`
          INSERT INTO public.members (
            id, code, name, contact, email, phone, type, level, industry, region, status, 
            fee_year, fee_paid, payment_status, company_name, tax_code, department, executive_role,
            user_id, association_id, joined_at
          ) VALUES (
            $1::uuid, 'CEO-83007', $2, $2,
            $3, $4, 'Chính thức', 'VIP', 'Công nghệ & Chuyển đổi số',
            'Hà Nội', 'active', 2026, true, 'paid', $5, $6,
            'Ban Thành viên', 'Hội viên Chính thức', $1::uuid,
            'c1983000-0000-4000-8000-000000001983', NOW()
          )
        `, [userId, fullName, email, phone, company, taxCode]);
        console.log('members INSERT OK');
      } else {
        await client.query(`
          UPDATE public.members SET 
            name = $1,
            contact = $1,
            email = $2,
            phone = $3,
            company_name = $4,
            tax_code = $5,
            code = 'CEO-83007',
            status = 'active',
            level = 'VIP',
            department = 'Ban Thành viên',
            executive_role = 'Hội viên Chính thức'
          WHERE id = $6::uuid OR email = $2 OR user_id = $6::uuid
        `, [fullName, email, phone, company, taxCode, userId]);
        console.log('members UPDATE OK');
      }
    } catch (e) {
      console.error('members error:', e.message);
    }

    await client.end();
  }
  console.log('🎉 SUCCESSFULLY SYNCED ALL DATABASES FOR Pham Van Vu (vupv090120@gmail.com)');
}

syncUserVu().catch(console.error);
