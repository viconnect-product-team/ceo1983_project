const fs = require('fs');
const https = require('https');

const imagePath = 'C:/Users/vumik/.gemini/antigravity/brain/d9c75d33-1020-4218-8204-2ef7f8536309/.user_uploaded/media_1794423178834_96fd621b.jpg';
const fileData = fs.readFileSync(imagePath);
const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

const header = Buffer.from(
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="file"; filename="event-doanh-nghiep-viet-2027.jpg"\r\n` +
  `Content-Type: image/jpeg\r\n\r\n`
);
const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
const payload = Buffer.concat([header, fileData, footer]);

const req = https.request({
  hostname: 'crm.ceo1983.viconnect.vn',
  port: 443,
  path: '/api/upload/file?folder=events',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': payload.length,
    'User-Agent': 'NodeJS-Uploader'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Response body:', body);
  });
});

req.on('error', (err) => {
  console.error('Upload request error:', err.message);
});

req.write(payload);
req.end();

