const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx';
const content = fs.readFileSync(p, 'utf8');
const regex = /src=["']([^"']+)["']/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('src in ceo1983_app_fe ViOneLandingWebOfficial:', m[1]);
}
