const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.turbo') {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file.endsWith('.md') || file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const allFiles = [
  ...walk(path.join(__dirname, '..', 'document')),
  ...walk(path.join(__dirname))
];

let totalReplaced = 0;
let filesModified = 0;

for (const fullPath of allFiles) {
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(/hội phí thường niên/gi);
    if (!matches || matches.length === 0) continue;

    content = content
      .replace(/hội phí thường niên/gi, 'hội phí thường niên')
      .replace(/hội phí thường niên/g, 'Hội Phí Thường Niên')
      .replace(/hội phí thường niên/g, 'HỘI PHÍ THƯỜNG NIÊN')
      .replace(/đóng hội phí thường niên/gi, 'đóng hội phí thường niên')
      .replace(/đóng hội phí thường niên/g, 'Đóng Hội Phí Thường Niên')
      .replace(/đóng hội phí thường niên/g, 'ĐÓNG HỘI PHÍ THƯỜNG NIÊN')
      .replace(/hạn hội phí/gi, 'hạn hội phí')
      .replace(/hạn hội phí/g, 'Hạn Hội Phí')
      .replace(/kỳ hội phí/gi, 'kỳ hội phí')
      .replace(/kỳ hội phí/g, 'Kỳ Hội Phí')
      .replace(/Hội phí thường niên/g, 'Hội phí thường niên')
      .replace(/hội phí thường niên/g, 'hội phí thường niên')
      .replace(/HỘI PHÍ THƯỜNG NIÊN/g, 'HỘI PHÍ THƯỜNG NIÊN')
      .replace(/Hội Phí Thường Niên/g, 'Hội Phí Thường Niên');

    fs.writeFileSync(fullPath, content, 'utf8');
    filesModified++;
    totalReplaced += matches.length;
    console.log(`✓ Replaced ${matches.length} in ${path.relative(path.join(__dirname, '..'), fullPath)}`);
  } catch (err) {
    // skip binary
  }
}

console.log(`\nHoàn thành! Đã quét và thay thế ${totalReplaced} từ "hội phí thường niên" trong ${filesModified} file!`);
