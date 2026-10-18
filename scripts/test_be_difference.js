async function test() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  console.log('--- 1. Testing GET /api/events on 5003 (Mobile BE) ---');
  try {
    const res5003 = await fetch('http://14.225.217.232:5003/api/events');
    const data5003 = await res5003.json();
    console.log('5003 events count:', data5003.length);
    console.log('5003 sample:', JSON.stringify(data5003[0], null, 2));
  } catch (e) {
    console.error('5003 error:', e.message);
  }

  console.log('\n--- 2. Testing GET /api/events on 5005 (CRM BE) ---');
  try {
    const res5005 = await fetch('http://14.225.217.232:5005/api/events');
    const data5005 = await res5005.json();
    console.log('5005 events count:', data5005.length);
    console.log('5005 response:', data5005);
  } catch (e) {
    console.error('5005 error:', e.message);
  }

  console.log('\n--- 3. Testing GET /api/members on 5003 vs 5005 ---');
  try {
    const m5003 = await (await fetch('http://14.225.217.232:5003/api/members')).json();
    console.log('5003 members count:', m5003.length);
    const m5005 = await (await fetch('http://14.225.217.232:5005/api/members')).json();
    console.log('5005 members count:', m5005.length);
  } catch (e) {
    console.error('members error:', e.message);
  }

  console.log('\n--- 4. Testing Admin Login on 5005 (CRM BE) ---');
  try {
    const loginRes = await fetch('http://14.225.217.232:5005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@connect.vn', password: 'password123' })
    });
    console.log('5005 login status:', loginRes.status);
    const loginData = await loginRes.json();
    const token = loginData.access_token || loginData.token;
    console.log('Login user:', loginData.user?.email, 'role:', loginData.user?.role, 'hasToken:', !!token);

    if (token) {
      const evAuthRes = await fetch('http://14.225.217.232:5005/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const evAuthData = await evAuthRes.json();
      console.log('5005 authenticated events count:', Array.isArray(evAuthData) ? evAuthData.length : evAuthData);

      const memAuthRes = await fetch('http://14.225.217.232:5005/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const memAuthData = await memAuthRes.json();
      console.log('5005 authenticated members count:', Array.isArray(memAuthData) ? memAuthData.length : memAuthData);
    }
  } catch (e) {
    console.error('5005 login test error:', e.message);
  }
}

test();
