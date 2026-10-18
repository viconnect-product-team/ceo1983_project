async function inspectTokens() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  for (const port of ['5003', '5005']) {
    const base = `http://14.225.217.232:${port}`;
    console.log(`\n=== Inspecting Login on ${base} ===`);
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
    });
    const data = await loginRes.json();
    console.log('Login response:', JSON.stringify(data, null, 2));

    const token = data.access_token || data.token;
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        console.log('Decoded JWT payload:', payload);
      }
    }
  }
}

inspectTokens();
