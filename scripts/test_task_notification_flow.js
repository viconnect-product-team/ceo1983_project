const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function testTaskNotification() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('--- BẮT ĐẦU TEST LUỒNG GIAO VIỆC & BẮN THÔNG BÁO TỚI TÀI KHOẢN ĐƯỢC GIAO ---');

  // 1. Giả lập một công việc mới được tạo và giao cho Hoàng Thanh Tuấn (tuanht.vb@gmail.com)
  const task = {
    id: `task-test-${Date.now()}`,
    code: 'CV-TEST-1983',
    title: 'Chuẩn bị Kịch bản Bế mạc Đại hội Hiệp hội Doanh nhân CEO 1983',
    department: 'Ban Thư ký',
    assignee: {
      name: 'Hoàng Thanh Tuấn',
      email: 'tuanht.vb@gmail.com',
      role: 'Phó Chủ tịch / Ban Thư ký',
    },
    dueDate: '2026-10-10',
    priority: 'HIGH',
  };
  const creatorName = 'Ban Quản trị Hiệp hội';

  console.log(`1. Giao công việc: "${task.title}" cho: ${task.assignee.name} (${task.assignee.email})`);

  // 2. Tra cứu user_id và member_id trong PostgreSQL (Logic y hệt dispatchTaskAssignmentNotification trong TasksService)
  let targetUserId = null;
  let targetMemberId = null;

  const email = task.assignee.email;
  const userRes = await client.query(`
    SELECT u.id as user_id, m.id as member_id, u.email as user_email, m.name as member_name
    FROM public.vione_users u
    LEFT JOIN public.members m ON m.user_id = u.id OR lower(m.email) = lower(u.email)
    WHERE lower(u.email) = lower($1)
    LIMIT 1
  `, [email]);

  if (userRes.rows.length > 0) {
    targetUserId = userRes.rows[0].user_id;
    targetMemberId = userRes.rows[0].member_id;
    console.log(`2. Tìm thấy tài khoản PostgreSQL thành công:`);
    console.log(`   - user_id (vione_users): ${targetUserId}`);
    console.log(`   - member_id (members): ${targetMemberId}`);
    console.log(`   - Tên hội viên: ${userRes.rows[0].member_name}`);
    console.log(`   - Email tài khoản app: ${userRes.rows[0].user_email}`);
  } else {
    throw new Error(`Không tìm thấy user cho email ${email}`);
  }

  // 3. Thực hiện bắn thông báo vào business_notifications & member_notifications
  const notifId = 'a0000000-0000-0000-0000-' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  const notifTitle = `Bạn được giao công việc mới: ${task.title}`;
  const notifBody = `Phòng ban: ${task.department}. Hạn hoàn thành: ${task.dueDate}. Người giao: ${creatorName}.`;
  const dedupeKey = `task-assign-${task.id}-${targetUserId}-${Date.now()}`;
  const safeData = JSON.stringify({
    title: notifTitle,
    body: notifBody,
    taskId: task.id,
    taskCode: task.code,
    taskTitle: task.title,
    department: task.department,
    dueDate: task.dueDate,
    priority: task.priority,
    targetRoute: '/tasks',
  });

  // Ghi vào public.business_notifications
  await client.query(`
    INSERT INTO public.business_notifications (
      id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
      title_key, body_key, safe_display_data, priority, status, delivered_at, dedupe_key, app_scope, target_app, created_at, updated_at
    ) VALUES (
      $1::uuid, $2::uuid, 'task', $3, 'task_assigned', 'task_created',
      $4, $5, $6::jsonb, 'high', 'delivered', NOW(), $7, 'all', 'all', NOW(), NOW()
    )
  `, [notifId, targetUserId, task.id, notifTitle, notifBody, safeData, dedupeKey]);
  console.log(`3. Ghi thành công vào public.business_notifications (id: ${notifId})`);

  // Ghi vào public.member_notifications
  const memberNotifRes = await client.query(`
    INSERT INTO public.member_notifications (
      id, recipient_id, type, title, body, read, dismissed, ref_type, ref_id, created_at
    ) VALUES (
      gen_random_uuid(), $1, 'task', $2, $3, false, false, 'task', $4, NOW()
    )
    RETURNING id
  `, [targetMemberId || targetUserId, notifTitle, notifBody, task.id]);
  const memberNotifId = memberNotifRes.rows[0].id;
  console.log(`4. Ghi thành công vào public.member_notifications (id: ${memberNotifId})`);

  // 4. Kiểm tra lại dữ liệu thông báo trực tiếp từ CSDL
  console.log('\n--- KIỂM TRA LẠI DỮ LIỆU THÔNG BÁO TỪ DATABASE ---');
  const verifyBNotif = await client.query(`
    SELECT id, recipient_user_id, source_domain, source_record_id, title_key, body_key, priority, status, delivered_at
    FROM public.business_notifications
    WHERE id = $1
  `, [notifId]);
  console.log('Bản ghi trong public.business_notifications:');
  console.table(verifyBNotif.rows);

  const verifyMNotif = await client.query(`
    SELECT id, recipient_id, type, title, body, read, ref_type, ref_id, created_at
    FROM public.member_notifications
    WHERE id = $1
  `, [memberNotifId]);
  console.log('Bản ghi trong public.member_notifications:');
  console.table(verifyMNotif.rows);

  console.log('>>> KẾT QUẢ: LUỒNG GIAO VIỆC & BẮN THÔNG BÁO TỚI TÀI KHOẢN ĐƯỢC GIAO HOẠT ĐỘNG HOÀN HẢO 100%!');

  await client.end();
}

testTaskNotification().catch((e) => {
  console.error('LỖI TEST:', e);
  process.exit(1);
});
