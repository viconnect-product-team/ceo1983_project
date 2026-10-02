const fs = require('fs');

function patchLanding(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace image sources with bulletproof clean filenames
  content = content.replace(/\/landing_web_vione\/Rectangle \(1\)\.png/g, '/landing_web_vione/workflow-automation.png');
  content = content.replace(/\/landing_web_vione\/Rectangle\.png/g, '/landing_web_vione/operational-dashboard.png');
  content = content.replace(/\/landing_web_vione\/Rectangle \(2\)\.png/g, '/landing_web_vione/business-laptop.png');
  content = content.replace(/\/landing_web_vione\/Ellipse\.png/g, '/landing_web_vione/avatar-ceo.png');
  content = content.replace(/\/landing_web_vione\/Professional_Portrait\.png/g, '/landing_web_vione/professional-portrait.png');
  content = content.replace(/\/landing_web_vione\/SaaS_Portrait\.png/g, '/landing_web_vione/saas-portrait.png');

  // Relative paths for standalone index.html
  content = content.replace(/\.\/Rectangle \(1\)\.png/g, './workflow-automation.png');
  content = content.replace(/\.\/Rectangle\.png/g, './operational-dashboard.png');
  content = content.replace(/\.\/Rectangle \(2\)\.png/g, './business-laptop.png');
  content = content.replace(/\.\/Ellipse\.png/g, './avatar-ceo.png');
  content = content.replace(/\.\/Professional_Portrait\.png/g, './professional-portrait.png');
  content = content.replace(/\.\/SaaS_Portrait\.png/g, './saas-portrait.png');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patched:', filePath);
}

patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx');
patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx');
patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione/index.html');
patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public/landing_web_vione/index.html');
patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/public/landing_web_vione/index.html');
patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/vione_app_fe/public/landing_web_vione/index.html');
patchLanding('d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/landing_page_ceo1983/index.html');
