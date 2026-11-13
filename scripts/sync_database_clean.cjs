const { Client } = require('pg');
const crypto = require('crypto');

async function main() {
  const client = new Client({
    connectionString: "postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true"
  });
  await client.connect();

  console.log('1. Checking and creating user in auth.users and vione_users for vupv090120@gmail.com...');
  const userCheck = await client.query("SELECT id FROM vione_users WHERE LOWER(email) = 'vupv090120@gmail.com'");
  let vupvUserId = userCheck.rows[0]?.id;
  if (!vupvUserId) {
    vupvUserId = crypto.randomUUID();
    const passwordHash = '$2b$10$EEPv7J0KuOAUguc3JF9pp.A0T1IPXcc7FDNX7OCj9SsbOBsxVGlGy'; // 123456
    
    // First in auth.users
    await client.query(`
      INSERT INTO auth.users (id, email, role)
      VALUES ($1, 'vupv090120@gmail.com', 'authenticated')
      ON CONFLICT (id) DO NOTHING
    `, [vupvUserId]);

    // Then in vione_users
    await client.query(`
      INSERT INTO vione_users (id, username, email, password, name, created_at, updated_at)
      VALUES ($1, 'vupv090120@gmail.com', 'vupv090120@gmail.com', $2, 'Phạm An Nam', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [vupvUserId, passwordHash]);
    console.log(`  Created user row: ${vupvUserId}`);
  } else {
    // Ensure in auth.users as well
    await client.query(`
      INSERT INTO auth.users (id, email, role)
      VALUES ($1, 'vupv090120@gmail.com', 'authenticated')
      ON CONFLICT (id) DO NOTHING
    `, [vupvUserId]);
    console.log(`  User row already exists: ${vupvUserId}`);
  }

  console.log('2. Linking members table with users and normalizing names/roles...');
  // vupv090120@gmail.com
  await client.query(`
    UPDATE members 
    SET user_id = $1::uuid, name = 'Phạm An Nam', executive_role = 'member', department = 'Hội viên ceo1983', status = 'active', updated_at = NOW()
    WHERE email = 'vupv090120@gmail.com'
  `, [vupvUserId]);

  // admin@connect.vn
  await client.query(`
    UPDATE members 
    SET name = 'Jame Nguyễn', executive_role = 'quan_tri', department = 'Ban Điều Hành', status = 'active', updated_at = NOW()
    WHERE email = 'admin@connect.vn'
  `);

  // vumikasa6@gmail.com
  await client.query(`
    UPDATE members 
    SET name = 'Phạm Văn Vũ', executive_role = 'thanh_vien_ban_truyen_thong', department = 'Ban truyền thông', status = 'active', updated_at = NOW()
    WHERE email = 'vumikasa6@gmail.com'
  `);

  // info@viconnect.vn
  await client.query(`
    UPDATE members 
    SET name = 'Phạm hồng Nguyên', executive_role = 'member', department = 'Hội viên ceo1983', status = 'active', updated_at = NOW()
    WHERE email = 'info@viconnect.vn'
  `);

  console.log('3. Synchronizing user_roles table...');
  const users = await client.query("SELECT id, email FROM vione_users");
  for (const u of users.rows) {
    await client.query("DELETE FROM user_roles WHERE user_id = $1::uuid", [u.id]);
    const roleVal = u.email === 'admin@connect.vn' ? 'admin' : 'member';
    await client.query(`
      INSERT INTO user_roles (id, user_id, role, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2::app_role, NOW())
      ON CONFLICT (user_id, role) DO NOTHING
    `, [u.id, roleVal]);
    console.log(`  Synced user_roles for ${u.email} -> ${roleVal}`);
  }

  console.log('4. Synchronizing event_registrations for EV-VIENDOANHTRI-2027 with real data...');
  const eventId = 'EV-VIENDOANHTRI-2027';
  const assocId = 'c1983000-0000-4000-8000-000000001983';

  // Update existing registration 40001
  await client.query(`
    UPDATE event_registrations
    SET member_name = 'Phạm Văn Vũ',
        email = 'vumikasa6@gmail.com',
        phone = '0988 888 888',
        member_code = 'CEO1983-000003',
        status = 'confirmed',
        ticket_type = 'Standard',
        payment_status = 'free',
        payment_amount = 0,
        seat_assignment = 'Bàn 01 - Ghế 03',
        updated_at = NOW()
    WHERE id = '40001'
  `);

  // Add registrations for other 3 real users if not present
  const realAttendees = [
    {
      id: '40002',
      code: 'CEO1983-000001',
      name: 'Jame Nguyễn',
      email: 'admin@connect.vn',
      phone: '0988 888 888',
      ticketType: 'VIP',
      seat: 'VIP-01',
      lucky: '1983'
    },
    {
      id: '40003',
      code: 'CEO1983-000002',
      name: 'Phạm hồng Nguyên',
      email: 'info@viconnect.vn',
      phone: '0903 205 683',
      ticketType: 'Standard',
      seat: 'Bàn 02 - Ghế 05',
      lucky: '2026'
    },
    {
      id: '40004',
      code: 'CEO1983-000004',
      name: 'Phạm An Nam',
      email: 'vupv090120@gmail.com',
      phone: '0973 205 683',
      ticketType: 'Standard',
      seat: 'Bàn 02 - Ghế 06',
      lucky: '2027'
    }
  ];

  for (const att of realAttendees) {
    await client.query(`
      INSERT INTO event_registrations (
        id, event_id, member_code, member_name, email, phone,
        registered_at, status, ticket_type, association_id, payment_status,
        payment_method, payment_amount, seat_assignment, lucky_number, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        NOW()::date, 'confirmed', $7, $8::uuid, 'free',
        'direct', 0, $9, $10, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        member_name = EXCLUDED.member_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        status = 'confirmed',
        ticket_type = EXCLUDED.ticket_type,
        seat_assignment = EXCLUDED.seat_assignment,
        updated_at = NOW()
    `, [att.id, eventId, att.code, att.name, att.email, att.phone, att.ticketType, assocId, att.seat, att.lucky]);
  }

  // Update events table registered count
  await client.query(`UPDATE events SET registered = 4, updated_at = NOW() WHERE id = $1`, [eventId]);

  console.log('5. Verify updated records:');
  const finalUsers = await client.query("SELECT id, email, name FROM vione_users");
  console.log('vione_users:', finalUsers.rows);

  const finalMembers = await client.query("SELECT id, user_id, name, email, executive_role, department FROM members");
  console.log('members:', finalMembers.rows);

  const finalRegs = await client.query("SELECT id, event_id, member_name, email, status, ticket_type, seat_assignment FROM event_registrations WHERE event_id = $1", [eventId]);
  console.log('event_registrations:', finalRegs.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
