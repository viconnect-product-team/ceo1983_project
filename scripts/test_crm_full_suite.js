process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testCrmSuite() {
  const baseUrl = 'https://14.225.217.232:5443';
  console.log(`=== Testing CRM API Full Suite on ${baseUrl} ===\n`);

  // 1. Login as Admin
  console.log('1. Logging in as Admin (admin@connect.vn)...');
  const t0 = Date.now();
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
  });
  const loginDuration = Date.now() - t0;
  console.log(`-> Login status: ${loginRes.status} (${loginDuration}ms)`);
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    return;
  }
  const loginData = await loginRes.json();
  const token = loginData.access_token || loginData.token;
  console.log(`-> User: ${loginData.user?.email}, Role: ${loginData.user?.role}`);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 2. List of endpoints to verify
  const endpoints = [
    { name: 'Users Me', url: '/api/users/me' },
    { name: 'Events List', url: '/api/events' },
    { name: 'Events Overview', url: '/api/events/overview' },
    { name: 'Members List', url: '/api/members' },
    { name: 'Members Overview', url: '/api/members/overview' },
    { name: 'Executive Directory', url: '/api/members/executives' },
    { name: 'Sponsors List', url: '/api/sponsors' },
    { name: 'Sponsor Packages', url: '/api/sponsors/packages' },
    { name: 'Voting Polls', url: '/api/voting/polls' },
    { name: 'News Articles', url: '/api/news' },
    { name: 'Documents', url: '/api/documents' },
    { name: 'Invoices', url: '/api/admin/invoices' },
  ];

  console.log('\n2. Testing Data Endpoints:');
  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(`${baseUrl}${ep.url}`, { headers });
      const duration = Date.now() - start;
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0);
      const isQuick = duration < 500 ? '⚡ FAST' : '⏳ SLOW';
      console.log(`   [${ep.name}] Status: ${res.status} | Count/Keys: ${count} | Time: ${duration}ms (${isQuick})`);
      if (ep.name === 'Events List' || ep.name === 'Members List') {
        if (Array.isArray(data) && data.length > 0) {
          const sample = data[0];
          console.log(`      Sample item: id=${sample.id}, name/title=${sample.name || sample.title || sample.code}`);
        }
      }
    } catch (e) {
      console.error(`   [${ep.name}] ERROR:`, e.message);
    }
  }

  console.log('\n=== Test Completed ===');
}

testCrmSuite();
