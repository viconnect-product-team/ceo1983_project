const fs = require('fs');
const jwt = require('jsonwebtoken');

async function test() {
  const secret = 'super-secret-jwt-key';
  const token = jwt.sign({
    sub: '00000000-0000-4000-8000-000000000002',
    email: 'admin@connect.vn',
    username: 'admin@connect.vn',
    role: 'platform_admin',
    roles: ['platform_admin']
  }, secret, { expiresIn: '1h' });

  console.log('Generated admin token. Testing upload...');

  const fileBuf = fs.readFileSync('apps/ceo1983_app_fe/public/images/event/ky_niem_4_nam_vien_doanh_tri.jpg');
  const blob = new Blob([fileBuf], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, 'ky_niem_4_nam_vien_doanh_tri.jpg');
  formData.append('folder', 'events');

  const uploadRes = await fetch('https://ceo1983.viconnect.vn/api/upload/file', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  console.log('Upload status:', uploadRes.status);
  const uploadData = await uploadRes.json();
  console.log('Upload response:', uploadData);

  const uploadedUrl = uploadData.url || uploadData.filePath || uploadData.path;
  if (uploadedUrl) {
    console.log('Updating DB with URL:', uploadedUrl);
    const { Client } = require('pg');
    const client = new Client({
      connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
      ssl: false
    });
    await client.connect();
    await client.query(`
      UPDATE public.events 
      SET image = $1, banner = $1, updated_at = NOW() 
      WHERE id = 'EV-VIENDOANHTRI-2027'
    `, [uploadedUrl]);
    console.log('DB updated with uploaded URL successfully!');
    await client.end();
  }
}
test().catch(console.error);
