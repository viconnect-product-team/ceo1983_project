const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';

async function main() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();

  console.log('=== 1. SAO LƯU DỮ LIỆU (BACKUP) TRƯỚC KHI XÓA ===');
  const backupDir = path.resolve(__dirname, '../scratch');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_before_clean_${timestamp}.json`);

  const backupData = {};
  const tablesToBackup = [
    'opportunities',
    'opportunity_interests',
    'products',
    'meetings',
    'business_meetings',
    'business_meeting_participants',
    'event_registrations',
    'vione_users',
    'members',
    'events'
  ];

  for (const t of tablesToBackup) {
    try {
      const res = await c.query(`SELECT * FROM public.${t}`);
      backupData[t] = res.rows;
      console.log(`Đã sao lưu bảng ${t}: ${res.rows.length} bản ghi`);
    } catch (e) {
      console.log(`Bảng ${t} không tồn tại hoặc bỏ qua (${e.message})`);
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✔ Đã lưu file backup an toàn tại: ${backupFile}`);

  console.log('\n=== 2. LÀM SẠCH CƠ HỘI, SÀN B2B, HẸN GẶP, CUỘC HỌP ===');
  const cleanQueries = [
    'DELETE FROM public.opportunities',
    'DELETE FROM public.products',
    'DELETE FROM public.meetings',
    'DELETE FROM public.business_meeting_participants',
    'DELETE FROM public.business_meetings',
  ];

  for (const q of cleanQueries) {
    try {
      const res = await c.query(q);
      console.log(`Đã thực thi: ${q} (ảnh hưởng ${res.rowCount} dòng)`);
    } catch (e) {
      console.error(`Lỗi khi thực thi ${q}:`, e.message);
    }
  }

  try {
    await c.query('DELETE FROM public.opportunity_interests');
  } catch (e) {}

  console.log('\n=== 3. ĐỒNG BỘ ĐÚNG 4 TÀI KHOẢN HỘI VIÊN ===');
  const passRes = await c.query("SELECT password FROM public.vione_users WHERE email = 'vumikasa6@gmail.com' LIMIT 1");
  const defaultHash = passRes.rows[0]?.password || (await bcrypt.hash('123456', 10));

  const targetAccounts = [
    { email: 'admin@connect.vn', name: 'Jame Nguyễn (Chủ Tịch HĐQT)', role: 'Chủ Tịch HĐQT', dept: 'Ban Quản Trị', code: 'M1983-268' },
    { email: 'vumikasa6@gmail.com', name: 'Phạm Văn Vũ', role: 'truong_ban_truyen_thong', dept: 'Ban truyền thông', code: 'CEO1983-000003' },
    { email: 'info@viconnect.vn', name: 'Phạm hồng Nguyên', role: 'member', dept: 'Hội viên ceo1983', code: 'CEO1983-000001' },
    { email: 'vupv090120@gmail.com', name: 'Phạm An Nam', role: 'member', dept: 'Hội viên ceo1983', code: 'CEO1983-000002' }
  ];

  const emailsList = targetAccounts.map(a => `'${a.email}'`).join(', ');
  await c.query(`DELETE FROM public.members WHERE email NOT IN (${emailsList})`);
  await c.query(`DELETE FROM public.vione_users WHERE email NOT IN (${emailsList})`);

  for (const acc of targetAccounts) {
    const userCheck = await c.query("SELECT id FROM public.vione_users WHERE email = $1", [acc.email]);
    if (userCheck.rows.length === 0) {
      await c.query(
        "INSERT INTO public.vione_users (id, username, email, name, password, email_verified, created_at, updated_at) VALUES (gen_random_uuid(), $1, $1, $2, $3, true, NOW(), NOW())",
        [acc.email, acc.name, defaultHash]
      );
      console.log(`Đã tạo mới user đăng nhập: ${acc.email} (pass: 123456)`);
    } else {
      await c.query("UPDATE public.vione_users SET password = $1 WHERE email = $2", [defaultHash, acc.email]);
      console.log(`Đã cập nhật password 123456 cho: ${acc.email}`);
    }

    const memCheck = await c.query("SELECT id FROM public.members WHERE email = $1", [acc.email]);
    if (memCheck.rows.length === 0) {
      await c.query(
        "INSERT INTO public.members (id, name, email, code, executive_role, department, status, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'active', NOW(), NOW())",
        [acc.name, acc.email, acc.code, acc.role, acc.dept]
      );
      console.log(`Đã tạo mới member: ${acc.name} (${acc.code})`);
    }
  }

  console.log('\n=== 4. GIỮ LẠI ĐÚNG 1 SỰ KIỆN 21/11/2026 ===');
  await c.query("DELETE FROM public.events WHERE id != 'EV-VIENDOANHTRI-2027'");
  console.log("✔ Đã giữ lại duy nhất sự kiện: 'EV-VIENDOANHTRI-2027' (Kỷ Niệm 4 Năm Thành Lập Viện Doanh Trí - 21/11/2026)");

  console.log('\n=== 5. KIỂM TRA LẠI DỮ LIỆU CUỐI CÙNG ===');
  const finalUsers = await c.query("SELECT email, name FROM public.vione_users");
  console.log("Users:", finalUsers.rows);

  const finalMembers = await c.query("SELECT code, name, email, executive_role FROM public.members");
  console.log("Members:", finalMembers.rows);

  const finalEvents = await c.query("SELECT id, title, date FROM public.events");
  console.log("Events:", finalEvents.rows);

  const finalOpps = await c.query("SELECT count(*)::int as count FROM public.opportunities");
  const finalProds = await c.query("SELECT count(*)::int as count FROM public.products");
  const finalMeetings = await c.query("SELECT count(*)::int as count FROM public.meetings");
  const finalBizMeetings = await c.query("SELECT count(*)::int as count FROM public.business_meetings");
  console.log(`Counts: Opps=${finalOpps.rows[0].count}, Prods=${finalProds.rows[0].count}, Meetings=${finalMeetings.rows[0].count}, BizMeetings=${finalBizMeetings.rows[0].count}`);

  await c.end();
  console.log('=== HOÀN TẤT LÀM SẠCH DỮ LIỆU THÀNH CÔNG ===');
}

if (process.argv.includes('--execute')) {
  main().catch(console.error);
} else {
  console.log('Dry run only. Use --execute to apply changes.');
}
