const fs = require('fs');

const html = fs.readFileSync('scripts/brandbook_nen_tang.html', 'utf8');

// Search for colors section
const colorIdx = html.indexOf('Nhận diện màu sắc');
if (colorIdx !== -1) {
  const colorSection = html.slice(colorIdx, colorIdx + 10000);
  const clean = colorSection.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .replace(/<[^>]+>/g, '\n')
                            .replace(/[ \t]+/g, ' ')
                            .replace(/\n\s*\n/g, '\n');
  console.log('--- COLOR SECTION ---');
  console.log(clean.slice(0, 3000));
} else {
  console.log('Not found Nhận diện màu sắc');
}

// Find all hex codes in nen-tang
const hexes = html.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
console.log('\n--- HEX CODES ---', [...new Set(hexes)]);

