const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

function fetchApi(baseUrl, endpoint, token = '') {
  return new Promise((resolve) => {
    const url = `${baseUrl}${endpoint}`;
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const start = Date.now();
    const req = https.get(url, { agent, headers, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, duration, error: null });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.slice(0, 100), duration, error: 'JSON_PARSE_ERROR' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, duration: Date.now() - start, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, duration: 8000, error: 'TIMEOUT' });
    });
  });
}

function login(baseUrl, email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password });
    const u = new URL(`${baseUrl}/api/auth/login`);
    const req = https.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      agent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 8000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json?.access_token || json?.token || null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function main() {
  const mobileUrl = 'https://14.225.217.232:5444';
  const crmUrl = 'https://14.225.217.232:5443';

  console.log('Logging in on both platforms...');
  const mobileToken = await login(mobileUrl, 'admin@connect.vn', '123456');
  const crmToken = await login(crmUrl, 'admin@connect.vn', '123456');

  console.log('Mobile Token acquired:', !!mobileToken);
  console.log('CRM Token acquired:', !!crmToken);

  const endpoints = [
    { name: 'Sự kiện (Events)', path: '/api/events' },
    { name: 'Danh bạ Hội viên (Members)', path: '/api/members' },
    { name: 'Sản phẩm Chợ B2B (Products)', path: '/api/marketplace/products' },
    { name: 'Cơ hội Giao thương (Opportunities)', path: '/api/opportunities' },
    { name: 'Tin tức CLB (News)', path: '/api/news' },
    { name: 'Khảo sát / Biểu quyết (Polls)', path: '/api/voting/polls' },
    { name: 'Kho Tài liệu (Documents)', path: '/api/documents' },
    { name: 'Lịch họp BCH (Meetings)', path: '/api/meetings' },
    { name: 'Khoản thu / Hóa đơn (Invoices)', path: '/api/admin/invoices' },
    { name: 'Giao việc (Tasks)', path: '/api/tasks' },
  ];

  console.log('\n========================================================================================');
  console.log('SO SÁNH ĐỒNG BỘ DỮ LIỆU GIỮA CEO1983 MOBILE (5444) VÀ WEB CRM QUẢN TRỊ (5443)');
  console.log('========================================================================================');

  for (const ep of endpoints) {
    const resMobile = await fetchApi(mobileUrl, ep.path, mobileToken);
    const resCrm = await fetchApi(crmUrl, ep.path, crmToken);

    const countMobile = Array.isArray(resMobile.data) 
      ? resMobile.data.length 
      : (resMobile.data?.items?.length ?? (resMobile.data ? 1 : 0));

    const countCrm = Array.isArray(resCrm.data) 
      ? resCrm.data.length 
      : (resCrm.data?.items?.length ?? (resCrm.data ? 1 : 0));

    const matched = countMobile === countCrm && resMobile.status === 200 && resCrm.status === 200;

    console.log(`\n📌 ${ep.name} [${ep.path}]`);
    console.log(`   - Mobile (5444): HTTP ${resMobile.status} | ${resMobile.duration}ms | Count: ${countMobile} ${resMobile.error ? `(Error: ${resMobile.error})` : ''}`);
    console.log(`   - Web CRM (5443): HTTP ${resCrm.status} | ${resCrm.duration}ms | Count: ${countCrm} ${resCrm.error ? `(Error: ${resCrm.error})` : ''}`);
    console.log(`   - Khớp dữ liệu: ${matched ? '✅ TRÙNG KHỚP 100%' : '⚠️ LỆCH HOẶC CÓ LỖI'}`);

    if (!matched) {
      console.log('     Mobile data sample:', JSON.stringify(resMobile.data || resMobile.raw || '').slice(0, 150));
      console.log('     CRM data sample:', JSON.stringify(resCrm.data || resCrm.raw || '').slice(0, 150));
    }
  }
}

main().catch(console.error);
