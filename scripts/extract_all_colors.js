const fs = require('fs');
const html = fs.readFileSync('scripts/brandbook_nen_tang.html', 'utf8');

const colorIdx = html.indexOf('Nhận diện màu sắc');
if (colorIdx !== -1) {
  const section = html.slice(colorIdx, colorIdx + 25000);
  const clean = section.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                       .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                       .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
                       .replace(/<[^>]+>/g, '\n')
                       .replace(/[ \t]+/g, ' ')
                       .replace(/\n\s*\n/g, '\n');
  console.log('--- ENTIRE COLOR SECTION ---');
  console.log(clean);
}

