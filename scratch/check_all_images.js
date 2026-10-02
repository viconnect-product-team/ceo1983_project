const fs = require('fs');
const path = require('path');

function checkFileImgs(filePath, baseDirs) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const imgRegex = /src=["']([^"']+)["']/g;
  let m;
  const found = [];
  while ((m = imgRegex.exec(content)) !== null) {
    found.push(m[1]);
  }
  console.log('=== Checking:', path.basename(filePath), '===');
  for (const src of found) {
    if (src.startsWith('http')) {
      console.log('  [REMOTE/PLACEHOLDER]:', src);
      continue;
    }
    let resolved = false;
    let resolvedPath = '';
    for (const b of baseDirs) {
      const p = path.resolve(b, src.replace(/^\//, ''));
      if (fs.existsSync(p)) {
        resolved = true;
        resolvedPath = p;
        break;
      }
    }
    console.log('  ', src, '->', resolved ? `EXISTS (${resolvedPath})` : '*** MISSING/BROKEN ***');
  }
}

checkFileImgs('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/landing_web_vione/index.html', [
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/apps/vione_app_fe/public'
]);

checkFileImgs('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/apps/vione_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx', [
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/apps/vione_app_fe/public'
]);

checkFileImgs('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/apps/vione_app_fe/src/routes/auth.tsx', [
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/vione_project/apps/vione_app_fe/public'
]);
