const fs = require('fs');

function check(p) {
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, 'utf8');
  const regex = /src=["']([^"']+)["']/g;
  let m;
  console.log('=== Checking:', p, '===');
  while ((m = regex.exec(content)) !== null) {
    console.log('src:', m[1]);
  }
}

check('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/routes/auth.tsx');
check('d:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/routes/auth.tsx');
