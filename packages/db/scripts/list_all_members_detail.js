const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

async function run() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('=== TRUY VẤN TOÀN BỘ HỘI VIÊN & TÀI KHOẢN CEO 1983 ===\n');

  const res = await client.query(`
    SELECT 
      m.id,
      m.code,
      m.name,
      m.email,
      m.phone,
      COALESCE(m.department, ms.department, 'Chưa phân ban') as department,
      COALESCE(m.executive_role, ms.executive_role, ms.role::text, 'Hội viên') as executive_role,
      m.level,
      up.company_name,
      up.professional_title,
      u.email as user_email,
      u.username,
      ms.role::text as membership_role,
      ur.role::text as app_role
    FROM public.members m
    LEFT JOIN public.vione_users u ON m.user_id = u.id
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN public.user_profiles up ON u.id = up.user_id
    LEFT JOIN public.memberships ms ON ms.user_id = m.user_id AND ms.association_id = m.association_id
    WHERE m.association_id = $1
    ORDER BY COALESCE(m.department, ms.department), m.code
  `, [ASSOC_ID]);

  console.log(`Tổng số bản ghi hội viên trong CEO 1983: ${res.rows.length}\n`);

  // Phân nhóm theo Ban
  const byDept = {};
  for (const row of res.rows) {
    const dept = row.department;
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(row);
  }

  for (const [dept, list] of Object.entries(byDept)) {
    console.log(`\n📂 [${dept}] (${list.length} tài khoản):`);
    for (const m of list) {
      console.log(`  • [${m.code}] ${m.name}`);
      console.log(`    - Email: ${m.email || m.user_email || 'Chưa có'}`);
      console.log(`    - SĐT: ${m.phone || 'Chưa có'}`);
      console.log(`    - Chức vụ: ${m.executive_role}`);
      console.log(`    - Doanh nghiệp: ${m.company_name || 'CEO 1983'}`);
    }
  }

  // Kiểm tra tài khoản trong memberships nhưng không có trong members
  const extraUsers = await client.query(`
    SELECT ms.user_id, u.email, u.name, ms.department, ms.role, ms.executive_role
    FROM public.memberships ms
    JOIN public.vione_users u ON ms.user_id = u.id
    LEFT JOIN public.members m ON m.user_id = ms.user_id AND m.association_id = ms.association_id
    WHERE ms.association_id = $1 AND m.id IS NULL
  `, [ASSOC_ID]);

  if (extraUsers.rows.length > 0) {
    console.log('\n=== TÀI KHOẢN TRONG MEMBERSHIPS NHƯNG CHƯA TẠO PROFILE HỘI VIÊN ===');
    for (const u of extraUsers.rows) {
      console.log(`  • ${u.name} | Email: ${u.email} | Ban: ${u.department} | Role: ${u.role}`);
    }
  }

  await client.end();
}

run().catch(console.error);
