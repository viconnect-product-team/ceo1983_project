async function testLogin() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  for (const port of ['5003', '5005', '5443']) {
    const base = port === '5443' ? 'https://14.225.217.232:5443' : `http://14.225.217.232:${port}`;
    console.log(`\n=== Testing on ${base} ===`);
    try {
      const loginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
      });
      console.log(`[${loginRes.status}] Login status on ${base}`);
      const data = await loginRes.json();
      const token = data.access_token || data.token;
      console.log(`User: ${data.user?.email}, Role: ${data.user?.role}, hasToken: ${!!token}`);

      if (token) {
        // Test /api/events with token
        const evRes = await fetch(`${base}/api/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const evData = await evRes.json();
        console.log(`[${evRes.status}] /api/events with token -> length: ${Array.isArray(evData) ? evData.length : JSON.stringify(evData)}`);

        // Test /api/members with token
        const memRes = await fetch(`${base}/api/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const memData = await memRes.json();
        console.log(`[${memRes.status}] /api/members with token -> length: ${Array.isArray(memData) ? memData.length : JSON.stringify(memData)}`);
      }
    } catch (e) {
      console.log(`Error on ${base}: ${e.message}`);
    }
  }
}

testLogin();
