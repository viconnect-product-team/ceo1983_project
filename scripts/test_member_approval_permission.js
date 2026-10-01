const { Client } = require('pg');

async function login(email, password) {
  const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
}

async function approveMember(token, memberId) {
  const res = await fetch(`http://127.0.0.1:4000/api/members/${memberId}/approve-and-send-credentials`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('=== TESTING MEMBER APPROVAL BUSINESS RULE (BAN THÀNH VIÊN vs BAN THƯ KÝ) ===\n');

  // 1. Create a dummy pending applicant in DB
  const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable' });
  await c.connect();

  const testMemberId = 'c1983000-0000-4000-8000-000000009999';
  const testEmail = 'test.applicant.btv@gmail.com';
  const assocId = 'c1983000-0000-4000-8000-000000001983';

  await c.query(`DELETE FROM members WHERE id = $1 OR email = $2`, [testMemberId, testEmail]);
  await c.query(`DELETE FROM vione_users WHERE email = $1`, [testEmail]);

  await c.query(`
    INSERT INTO members (
      id, code, name, contact, email, phone, type, level, industry, region,
      status, joined_at, fee_year, fee_paid, payment_status, address, about,
      created_at, updated_at, association_id
    ) VALUES (
      $1, 'M1983-999', 'Ứng Viên Thử Nghiệm BTV', 'Ứng Viên Thử Nghiệm BTV', $2, '0999888777',
      'Chính thức', 'VIP', 'Công nghệ thông tin', 'Hà Nội', 'pending', CURRENT_DATE,
      2026, false, 'unpaid', 'Hà Nội', 'Hồ sơ xin gia nhập CLB CEO 1983', NOW(), NOW(), $3
    )
  `, [testMemberId, testEmail, assocId]);
  console.log('✓ Created pending member application:', testEmail);

  // 2. Login as Ban Thư Ký (ceo.tongthuky@ceo1983.com)
  const btkLogin = await login('ceo.tongthuky@ceo1983.com', '123456');
  console.log('\n--- Test 1: Ban Thư Ký attempts to approve member ---');
  const btkAttempt = await approveMember(btkLogin.access_token, testMemberId);
  console.log('Ban Thư Ký HTTP Status:', btkAttempt.status);
  console.log('Ban Thư Ký Response:', btkAttempt.data);
  if (btkAttempt.status === 403) {
    console.log('✅ PASS: Ban Thư Ký is STRICTLY REJECTED with 403 Forbidden as required by business rule!');
  } else {
    console.log('❌ FAIL: Ban Thư Ký was not rejected properly!');
  }

  // 3. Login as Ban Thành Viên (ceo.thanhvien@ceo1983.com)
  const btvLogin = await login('ceo.thanhvien@ceo1983.com', '123456');
  console.log('\n--- Test 2: Ban Thành Viên attempts to approve member ---');
  const btvAttempt = await approveMember(btvLogin.access_token, testMemberId);
  console.log('Ban Thành Viên HTTP Status:', btvAttempt.status);
  console.log('Ban Thành Viên Response:', btvAttempt.data);
  if (btvAttempt.status === 200 || btvAttempt.status === 201) {
    console.log('✅ PASS: Ban Thành Viên successfully approved member!');
  } else {
    console.log('❌ FAIL: Ban Thành Viên could not approve member!');
  }

  // Clean up
  await c.query(`DELETE FROM members WHERE id = $1 OR email = $2`, [testMemberId, testEmail]);
  await c.query(`DELETE FROM vione_users WHERE email = $1`, [testEmail]);
  await c.end();
  console.log('\n✓ Cleanup complete.');
}

main().catch(console.error);
