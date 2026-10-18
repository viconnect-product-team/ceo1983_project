async function testUserMe() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  for (const port of ['5003', '5005']) {
    const base = `http://14.225.217.232:${port}`;
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
    });
    const { access_token } = await loginRes.json();
    const res = await fetch(`${base}/api/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const data = await res.json();
    console.log(`Port ${port} /api/users/me:`, JSON.stringify(data, null, 2));
  }
}

testUserMe();
