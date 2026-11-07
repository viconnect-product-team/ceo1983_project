const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();
  const existing = await client.query("SELECT * FROM public.vione_users WHERE email = 'vupv090120@gmail.com'");
  if (existing.rows.length === 0) {
    // Same hash as 123456: $2b$10$QQnxHAPO9GDEQjLGIJpQxODqMxIy8hkCU8ay3dwrofYyYdnCtgUpG
    const hash = '$2b$10$QQnxHAPO9GDEQjLGIJpQxODqMxIy8hkCU8ay3dwrofYyYdnCtgUpG';
    const res = await client.query(`
      INSERT INTO public.vione_users (id, username, password, email, name, email_verified, must_change_password, created_at, updated_at)
      VALUES (gen_random_uuid(), 'vupv090120@gmail.com', $1, 'vupv090120@gmail.com', 'Vũ Phạm (Doanh Nhân)', true, false, NOW(), NOW())
      RETURNING id
    `, [hash]);
    const userId = res.rows[0].id;
    console.log('Created vupv090120 in vione_users with ID:', userId);

    await client.query(`
      INSERT INTO public.user_profiles (user_id, display_name, company_name, professional_title, onboarding_status, account_status, must_change_password, created_at, updated_at)
      VALUES ($1, 'Vũ Phạm (Doanh Nhân)', 'Công ty TNHH Giải Pháp Công Nghệ ViConnect', 'Tổng Giám Đốc', 'completed', 'active', false, NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING
    `, [userId]);
    console.log('Created profile for vupv090120');

    // Also check association membership if applicable
    const assoc = await client.query("SELECT id FROM public.vba_associations LIMIT 1");
    if (assoc.rows.length > 0) {
      const assocId = assoc.rows[0].id;
      await client.query(`
        INSERT INTO public.vba_memberships (user_id, association_id, membership_role, executive_role, status, joined_at, created_at, updated_at)
        VALUES ($1, $2, 'member', 'Hội viên chính thức', 'approved', NOW(), NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [userId, assocId]).catch(err => console.log('Membership insert notice:', err.message));
    }
  } else {
    console.log('vupv090120 already exists with ID:', existing.rows[0].id);
  }
  await client.end();
}

run().catch(console.error);

