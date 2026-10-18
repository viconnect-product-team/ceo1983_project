const https = require('https');

// Cho phép self-signed cert nếu có
const agent = new https.Agent({ rejectUnauthorized: false });

async function postJson(url, data, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      agent: url.startsWith('https') ? agent : undefined
    };

    const req = (url.startsWith('https') ? https : require('http')).request(options, (res) => {
      let respBody = '';
      res.on('data', chunk => respBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(respBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: respBody });
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function main() {
  console.log('1. Logging in as admin@connect.vn on https://14.225.217.232:5444/api/auth/login ...');
  const loginRes = await postJson('https://14.225.217.232:5444/api/auth/login', {
    email: 'admin@connect.vn',
    password: '123456'
  });
  console.log('Login result status:', loginRes.status);
  const token = loginRes.body?.access_token || loginRes.body?.token;
  if (!token) {
    console.error('No token returned:', loginRes.body);
    process.exit(1);
  }
  console.log('Token acquired. User role:', loginRes.body?.user?.role || loginRes.body?.user?.primaryRole);

  console.log('\n2. Testing POST /api/events with EventWizard payload ...');
  const eventPayload = {
    name: "Sự Kiện Thử Nghiệm Kết Nối Doanh Nhân CEO 1983",
    date: "2026-11-15",
    location: "Khách Sạn Melia Hà Nội - 44 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
    capacity: 200,
    type: "forum",
    status: "upcoming",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    photoGalleryUrl: "",
    ticketPrice: 500000,
    fee: 500000,
    description: "Chương trình giao lưu tọa đàm kinh tế quý 4 của CLB CEO 1983",
    qrStaff: [],
    qrScanners: [],
    sponsors: [],
    qrFields: ["registration_code"],
    tickets: [
      {
        name: "Vé Tiêu Chuẩn",
        price: 500000,
        quantity: 150,
        description: "Bao gồm tiệc trà và tài liệu"
      }
    ]
  };

  const createRes = await postJson('https://14.225.217.232:5444/api/events', eventPayload, token);
  console.log('Create Event Response Status:', createRes.status);
  console.log('Create Event Response Body:', createRes.body);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
