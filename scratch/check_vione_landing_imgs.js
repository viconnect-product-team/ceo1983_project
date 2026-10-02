const fs = require('fs');
const path = require('path');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx';
const content = fs.readFileSync(p, 'utf8');

const regex = /src=["']([^"']+)["']/g;
let m;
const imgs = [];
while ((m = regex.exec(content)) !== null) {
  imgs.push(m[1]);
}
console.log('Total images found:', imgs.length);
imgs.forEach(img => {
  const localPath = path.resolve('d:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public', img.replace(/^\//, ''));
  console.log(img, '--> exists in public?', fs.existsSync(localPath), localPath);
});
