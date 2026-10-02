const fs = require('fs');
const path = require('path');

const srcDir = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione';
const targetDirs = [
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/public/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/vione_app_fe/public/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/landing_page_ceo1983'
];

const files = fs.readdirSync(srcDir);
console.log('Source files to sync:', files);

for (const targetDir of targetDirs) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('Created directory:', targetDir);
  }
  for (const f of files) {
    const srcFile = path.join(srcDir, f);
    const destFile = path.join(targetDir, f);
    fs.copyFileSync(srcFile, destFile);
  }
  console.log(`Synced ${files.length} files to ${targetDir}`);
}

console.log('All landing directories synchronized successfully!');
