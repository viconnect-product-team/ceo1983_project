const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/scripts/build_master_srs_word_and_md.js';
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');
console.log('Lines 580 to 747:\n', lines.slice(580).join('\n'));
