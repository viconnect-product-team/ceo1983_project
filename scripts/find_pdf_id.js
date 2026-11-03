const fs = require('fs');
const html = fs.readFileSync('scripts/gdrive_folder.html', 'utf8');

const idx = html.indexOf('EVENT VISUAL DESIGN-CEO1983.pdf');
if (idx !== -1) {
  console.log('Context around EVENT VISUAL DESIGN:');
  console.log(html.slice(Math.max(0, idx - 500), idx + 500));
}

