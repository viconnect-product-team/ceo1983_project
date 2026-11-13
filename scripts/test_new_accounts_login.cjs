const http = require('http');

async function testLogin(username, password) {
  const postData = JSON.stringify({ username, password });
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing admin@viconnect.vn...');
  try {
    const res1 = await testLogin('admin@viconnect.vn', '123456');
    console.log('admin@viconnect.vn result:', res1.status, res1.body?.user);
  } catch (e) {
    console.log('Backend might not be running locally or port differs:', e.message);
  }

  console.log('Testing info@viconnect.vn...');
  try {
    const res2 = await testLogin('info@viconnect.vn', '123456');
    console.log('info@viconnect.vn result:', res2.status, res2.body?.user);
  } catch (e) {
    console.log('Backend might not be running locally or port differs:', e.message);
  }
}
run();

