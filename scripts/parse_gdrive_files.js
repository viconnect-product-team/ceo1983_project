const fs = require('fs');
const html = fs.readFileSync('scripts/gdrive_folder.html', 'utf8');

// Find all file items in Drive JSON payload
const matches = [...html.matchAll(/\["([0-9a-zA-Z_-]{20,})",\["([^"]+)"/g)];
console.log('Drive items:');
const seen = new Set();
for (const m of matches) {
  if (!seen.has(m[2])) {
    seen.add(m[2]);
    console.log(`- ID: ${m[1]} | Name: ${m[2]}`);
  }
}

// Search for pdf, png, ai, eps
const fileMatches = html.match(/[a-zA-Z0-9_\-\s\(\)]+\.(pdf|png|jpg|ai|eps|svg|docx|pptx)/gi);
console.log('Filenames in page:', [...new Set(fileMatches)]);

