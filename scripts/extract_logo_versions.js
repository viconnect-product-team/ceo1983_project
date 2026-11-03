const fs = require('fs');
let html = fs.readFileSync('scripts/brandbook_nen_tang.html', 'utf8');

// Strip all svg
html = html.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

const startIdx = html.indexOf('Các phiên bản Logo thường dùng');
const nextSectionIdx = html.indexOf('Thi công logo');
const section = html.slice(startIdx, nextSectionIdx !== -1 ? nextSectionIdx : startIdx + 30000);

const clean = section.replace(/<[^>]+>/g, '\n')
                     .replace(/[ \t]+/g, ' ')
                     .replace(/\n\s*\n/g, '\n');

console.log(clean);

