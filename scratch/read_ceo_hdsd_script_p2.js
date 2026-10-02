const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/scripts/build_master_hdsd_word.js';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');
console.log('Lines 80 to 220:\n', lines.slice(80, 220).join('\n'));
