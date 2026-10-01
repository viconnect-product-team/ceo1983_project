const ACCOUNTS = [
  { email: 'admin@connect.vn', pass: '123456', expectedBan: 'BQT', expectedApprove: true },
  { email: 'ceo.tongthuky@ceo1983.com', pass: '123456', expectedBan: 'BTK', expectedApprove: false },
  { email: 'ceo.thanhvien@ceo1983.com', pass: '123456', expectedBan: 'BTV', expectedApprove: true },
  { email: 'ceo.thiennguyen@ceo1983.com', pass: '123456', expectedBan: 'BTN', expectedApprove: false },
  { email: 'ceo.truyenthong@ceo1983.com', pass: '123456', expectedBan: 'BTT', expectedApprove: false },
  { email: 'ceo.xuctien@ceo1983.com', pass: '123456', expectedBan: 'BXT', expectedApprove: false },
];

async function main() {
  console.log('Testing 6 Ban logins against backend at http://127.0.0.1:4000/api/auth/login ...\n');

  for (const acc of ACCOUNTS) {
    try {
      const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(`❌ FAILED login for ${acc.email}:`, data);
        continue;
      }

      console.log(`✅ SUCCESS login: ${acc.email}`);
      console.log(`   User: ${data.user?.name} (ID: ${data.user?.id})`);
      console.log(`   Token: ${data.access_token ? data.access_token.slice(0, 25) + '...' : 'NONE'}`);

      // Now fetch user details and member details with this token
      const meRes = await fetch('http://127.0.0.1:4000/api/users/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      const meData = await meRes.json();
      console.log(`   /api/users/me: roles=${JSON.stringify(meData.roles)}, department=${meData.department}`);

      // Test member approval permission on BE
      // We test checking /api/members endpoint with this token
      const membersRes = await fetch('http://127.0.0.1:4000/api/members', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      const membersData = await membersRes.json();
      console.log(`   /api/members HTTP status: ${membersRes.status} (count: ${Array.isArray(membersData) ? membersData.length : 'N/A'})`);

    } catch (err) {
      console.error(`❌ ERROR testing ${acc.email}:`, err.message);
    }
    console.log('--------------------------------------------------');
  }
}

main();
