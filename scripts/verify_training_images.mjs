import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');
const content = fs.readFileSync(htmlPath, 'utf8');

const regex = /src=["']([^"']+)["']/g;
let match;
const missing = [];
const found = [];

while ((match = regex.exec(content)) !== null) {
  const imgSrc = match[1];
  if (imgSrc.startsWith('http')) continue;
  const resolved = path.resolve('docs/training', imgSrc);
  if (!fs.existsSync(resolved)) {
    missing.push(imgSrc);
  } else {
    const stats = fs.statSync(resolved);
    found.push({ src: imgSrc, size: stats.size });
  }
}

console.log('Tổng ảnh phát hiện trong tài liệu:', found.length + missing.length);
console.log('Ảnh hợp lệ tồn tại trên đĩa:', found.length);
found.forEach(item => {
  console.log(` - [OK] ${item.src} (${Math.round(item.size / 1024)} KB)`);
});

if (missing.length > 0) {
  console.error('CẢNH BÁO ẢNH BỊ THIẾU (404):', missing);
  process.exit(1);
} else {
  console.log('>>> TUYỆT VỜI: 100% ẢNH MINH CHỨNG ĐỀU TỒN TẠI TRÊN ĐĨA VỚI DUNG LƯỢNG RÕ NÉT (0 ẢNH 404)!');
}
