const fs = require('fs');
const path = require('path');

function check(p, base) {
  const content = fs.readFileSync(p, 'utf8');
  const regex = /src=["']([^"']+)["']/g;
  let m;
  const imgs = [];
  while ((m = regex.exec(content)) !== null) {
    imgs.push(m[1]);
  }
  console.log('=== Checking:', path.basename(p), '=== Total images found:', imgs.length);
  imgs.forEach(img => {
    const localPath = path.resolve(base, img.replace(/^\.\//, '').replace(/^\//, ''));
    console.log(img, '--> exists?', fs.existsSync(localPath), localPath);
  });
}

check(
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione/index.html',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione'
);

check(
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public/landing_web_vione/index.html',
  'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public/landing_web_vione'
);
