const fs = require('fs');

const p = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/landing_web_vione/index.html';
const content = fs.readFileSync(p, 'utf8');
console.log('index.html size:', content.length, 'bytes');

const allSections = content.match(/<!-- =+ \d+\..*?=+ -->/g) || [];
console.log('Section markers in index.html:');
allSections.forEach(s => console.log('  ', s));

const scriptMatches = content.match(/<script[\s\S]*?<\/script>/g) || [];
console.log('Scripts in index.html:', scriptMatches.length);
