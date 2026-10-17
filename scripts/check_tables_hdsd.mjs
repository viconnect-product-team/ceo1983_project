import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html', 'utf8');

const tables = content.match(/<table class="tb">/g);
console.log('Tổng số bảng table class="tb":', tables ? tables.length : 0);

for (let i = 1; i <= 24; i++) {
  const id = i <= 12 ? 'app-c' + i : 'crm-c' + i;
  const secRegex = new RegExp('<section class="trn-section" id="' + id + '"[\\s\\S]*?</section>');
  const m = content.match(secRegex);
  const hasTb = m && m[0].includes('<table class="tb">');
  console.log(`Chương ${i.toString().padStart(2, '0')} (${id.padEnd(8, ' ')}): ${hasTb ? 'ĐÃ CÓ BẢNG ĐẶC TẢ' : 'CHƯA CÓ BẢNG'}`);
}
