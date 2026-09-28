const { Client } = require('pg');
const fs = require('fs');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const res = await client.query(`
    SELECT 
      m.department,
      m.executive_role,
      m.role as membership_role,
      u.email,
      u.name,
      mb.phone,
      up.company_name,
      up.professional_title,
      mb.code as member_code
    FROM public.memberships m
    JOIN public.vione_users u ON m.user_id = u.id
    LEFT JOIN public.user_profiles up ON u.id = up.user_id
    LEFT JOIN public.members mb ON mb.user_id = u.id
    WHERE m.association_id = 'c1983000-0000-4000-8000-000000001983'
    ORDER BY m.department, m.executive_role, u.name
  `);

  const groups = {};
  for (const r of res.rows) {
    const d = r.department || 'Chưa phân ban';
    if (!groups[d]) groups[d] = [];
    groups[d].push(r);
  }

  // Also query demo/seed accounts if any
  const demoUsers = await client.query(`
    SELECT email, name FROM public.vione_users
    WHERE email LIKE '%ceo1983%' OR email LIKE '%vione%' OR email LIKE '%connect.vn%'
  `);

  const output = {
    totalCeo1983Memberships: res.rows.length,
    departments: groups,
    demoSystemUsers: demoUsers.rows
  };

  fs.writeFileSync('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/packages/db/ceo1983_accounts_summary.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log('Saved summary to ceo1983_accounts_summary.json. Total count:', res.rows.length);
  await client.end();
}

main().catch(console.error);
