const fs = require('fs');
const path = require('path');

const targetDirs = [
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/public/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/vione_app_fe/public/landing_web_vione',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/landing_page_ceo1983'
];

const aliases = [
  { src: 'Rectangle (1).png', aliases: ['rectangle-1.png', 'workflow-automation.png'] },
  { src: 'Rectangle.png', aliases: ['rectangle.png', 'operational-dashboard.png'] },
  { src: 'Rectangle (2).png', aliases: ['rectangle-2.png', 'business-laptop.png'] },
  { src: 'Professional_Portrait.png', aliases: ['professional-portrait.png'] },
  { src: 'SaaS_Portrait.png', aliases: ['saas-portrait.png'] },
  { src: 'Ellipse.png', aliases: ['ellipse.png', 'avatar-ceo.png'] },
  { src: 'Ellipse (1).svg', aliases: ['ellipse-1.svg'] },
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const item of aliases) {
    const srcPath = path.join(dir, item.src);
    if (fs.existsSync(srcPath)) {
      for (const a of item.aliases) {
        const aPath = path.join(dir, a);
        fs.copyFileSync(srcPath, aPath);
      }
    }
  }
  console.log(`Created clean aliases in ${dir}`);
}
console.log('Done!');
