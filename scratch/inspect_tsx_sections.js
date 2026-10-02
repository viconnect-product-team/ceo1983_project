const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/src/components/landing/ViOneLandingWebOfficial.tsx';
const content = fs.readFileSync(p, 'utf8');
console.log('ViOneLandingWebOfficial.tsx size:', content.length, 'bytes');

const allSections = content.match(/\{\/\* =+ \d+\..*?=+ \*\/\}/g) || [];
console.log('Section markers in ViOneLandingWebOfficial.tsx:');
allSections.forEach(s => console.log('  ', s));
