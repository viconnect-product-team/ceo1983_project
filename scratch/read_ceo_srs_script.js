const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/scripts/build_master_srs_word_and_md.js';
if (fs.existsSync(p)) {
  const content = fs.readFileSync(p, 'utf8');
  console.log('File length:', content.length);
  const lines = content.split('\n');
  console.log('Total lines:', lines.length);
  console.log('Top 120 lines:\n', lines.slice(0, 120).join('\n'));
} else {
  console.log('Not found:', p);
}
