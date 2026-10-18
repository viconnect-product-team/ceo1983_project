async function checkEndpoints() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  for (const port of ['5003', '5005']) {
    const base = `http://14.225.217.232:${port}`;
    console.log(`\n=== Probing ${base} ===`);
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
    });
    const { access_token } = await loginRes.json();
    const headers = { Authorization: `Bearer ${access_token}` };

    const endpoints = [
      '/api/members/active-association-id',
      '/api/members/me',
      '/api/members/directory',
      '/api/associations',
      '/api/events',
      '/api/events/overview',
      '/api/products',
      '/api/opportunities'
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(`${base}${ep}`, { headers });
        const data = await res.json();
        const info = Array.isArray(data) ? `Array(${data.length})` : JSON.stringify(data).slice(0, 120);
        console.log(`[${res.status}] ${ep} -> ${info}`);
      } catch (e) {
        console.log(`[ERR] ${ep} -> ${e.message}`);
      }
    }
  }
}

checkEndpoints();
