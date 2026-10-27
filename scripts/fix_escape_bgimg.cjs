const fs = require('fs');
const path = require('path');

const filePath = path.resolve('scripts/build_slide_deck_v8_wave.js');
let content = fs.readFileSync(filePath, 'utf8');

const splitToken = 'function generatePrintAllSlidesHtml()';
const parts = content.split(splitToken);

if (parts.length === 2) {
  // Thay thế tất cả ${s.bgImg} trong nửa đầu thành \${s.bgImg}
  // Chú ý: nếu đã có \${s.bgImg} thì không thay lặp
  parts[0] = parts[0].replace(/([^\\])\$\{s\.bgImg\}/g, '$1\\${s.bgImg}');
  content = parts.join(splitToken);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Đã sửa escape \\${s.bgImg} thành công!');
} else {
  console.error('Không tìm thấy splitToken!');
}
