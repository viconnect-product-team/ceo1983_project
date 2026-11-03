const fs = require('fs');
const html = fs.readFileSync('scripts/brandbook_nen_tang.html', 'utf8');
const startIdx = html.indexOf('Các phiên bản Logo thường dùng');
const nextSectionIdx = html.indexOf('Thi công logo');
const section = html.slice(startIdx, nextSectionIdx !== -1 ? nextSectionIdx : startIdx + 30000);

const imgMatches = section.matchAll(/src=["'](https?:\/\/ceo1983\.brandbook\.vn\/wp-content\/uploads\/[^"']*)["']/g);
const imgs = [];
for (const m of imgMatches) {
  if (!imgs.includes(m[1])) imgs.push(m[1]);
}
console.log('Images in logo versions:');
imgs.forEach(i => console.log(i));

