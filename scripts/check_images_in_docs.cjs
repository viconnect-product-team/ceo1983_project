const fs = require('fs');
const path = require('path');

function checkDoc(docPath) {
  console.log(`Checking ${docPath}...`);
  const content = fs.readFileSync(docPath, 'utf8');
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let count = 0;
  let missing = 0;
  while ((match = imgRegex.exec(content)) !== null) {
    count++;
    const imgAlt = match[1];
    const imgSrc = match[2];
    // Resolve relative path from docPath
    const resolved = path.resolve(path.dirname(docPath), imgSrc.split('?')[0]);
    if (!fs.existsSync(resolved)) {
      console.log(`  [MISSING/404] alt="${imgAlt}", src="${imgSrc}" -> ${resolved}`);
      missing++;
    } else {
      // console.log(`  [OK] ${imgSrc}`);
    }
  }
  console.log(`Total images: ${count}, Missing/404: ${missing}`);
}

checkDoc('document/HUONG_DAN_SU_DUNG_WEB_CRM_CHI_TIET.md');
checkDoc('document/BO_HUONG_DAN_SU_DUNG_HE_THONG_CEO1983_TOAN_DIEN.md');

