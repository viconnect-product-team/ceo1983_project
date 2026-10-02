const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/scripts/build_all_master_slides.js';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Lines 1 to 100:\n', lines.slice(0, 100).join('\n'));
