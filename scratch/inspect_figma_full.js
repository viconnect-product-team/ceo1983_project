const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione/div className=w-[1440px] min-h-[102.txt';
const content = fs.readFileSync(p, 'utf8');

console.log('File size:', content.length, 'bytes');

// Find all img tags and what src they have
const imgMatches = content.match(/<img[^>]+>/g) || [];
console.log('Total <img> tags:', imgMatches.length);
imgMatches.forEach((tag, i) => {
  console.log(`[${i}] ${tag}`);
});

// Find all major section headings
const headings = content.match(/<(h[1-6]|span|div)[^>]*>([^<]{10,80})<\/\1>/g) || [];
console.log('\nSample text snippets:');
headings.slice(0, 30).forEach(h => console.log('  ', h.replace(/<[^>]+>/g, '').trim()));
