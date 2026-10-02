const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(full);
  }
  return results;
}

const files = walk('../vione_project/apps/vione_app_fe/src');
const eps = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /fetchNestApi(?:FromServer)?(?:\s*<[^>]*>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    eps.add(match[1]);
  }
}
console.log('Total unique endpoints found:', eps.size);
console.log(Array.from(eps).sort());
