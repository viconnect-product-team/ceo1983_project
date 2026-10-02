const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/scripts/build_vione_all_master_slides.js';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Lines 40 to 180:\n', lines.slice(40, 180).join('\n'));
