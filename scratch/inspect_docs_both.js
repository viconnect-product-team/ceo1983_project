const fs = require('fs');
const path = require('path');

function listDocs(dir) {
  if (!fs.existsSync(dir)) {
    console.log('Dir not found:', dir);
    return;
  }
  console.log('=== Documents in:', dir, '===');
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (!s.isDirectory()) {
      console.log(`  ${f} - ${(s.size / 1024).toFixed(1)} KB`);
    }
  }
}

listDocs('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document');
listDocs('d:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/document');
