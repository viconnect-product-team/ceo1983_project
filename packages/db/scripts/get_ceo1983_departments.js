const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('=== DANH SÁCH BAN VÀ TÀI KHOẢN CLB DOANH NHÂN CEO 1983 ===\n');

  // Query memberships
  const memberships = await client.query(`
    SELECT 
      m.department,
      m.executive_role,
      m.role as member_role,
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

  const banMap = {};
  for (const row of memberships.rows) {
    const dept = row.department || 'Chưa phân ban / Ban Chung';
    if (!banMap[dept]) {
      banMap[dept] = [];
    }
    banMap[dept].push({
      name: row.name,
      email: row.email,
      phone: row.phone,
      memberCode: row.member_code,
      role: row.executive_role || row.member_role,
      title: row.professional_title,
      company: row.company_name
    });
  }

  for (const [dept, members] of Object.entries(banMap)) {
    console.log(`\n📌 [${dept}] (${members.length} tài khoản):`);
    for (const m of members) {
      console.log(`  - Họ tên: ${m.name} | Email: ${m.email} | SĐT: ${m.phone || 'Chưa có'} | Chức vụ: ${m.role || m.title || 'Hội viên'} | Doanh nghiệp: ${m.company || 'CEO 1983'}`);
    }
  }

  // Also check all associations in database
  const assocs = await client.query(`SELECT id, name, slug FROM public.associations`);
  console.log('\n=== CÁC HIỆP HỘI TRONG HỆ THỐNG ===');
  console.log(assocs.rows);

  // Check all accounts in memberships regardless of association
  const allM = await client.query(`
    SELECT m.department, m.executive_role, m.role, u.email, u.name, a.name as assoc_name
    FROM public.memberships m
    JOIN public.vione_users u ON m.user_id = u.id
    LEFT JOIN public.associations a ON m.association_id = a.id
    ORDER BY a.name, m.department, u.name
  `);
  console.log('\n=== TOÀN BỘ PHÂN BAN & TÀI KHOẢN TRONG DATABASE ===');
  for (const row of allM.rows) {
    console.log(`[${row.assoc_name || 'N/A'}] [${row.department || 'Không có Ban'}] ${row.name} - ${row.email} (${row.executive_role || row.role})`);
  }

  await client.end();
}

main().catch(console.error);
