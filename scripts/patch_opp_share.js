const fs = require('fs');
const file = 'apps/ceo1983_app_fe/src/routes/association.opportunities.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldOppShare = 'title: o.title,';
const newOppShare = 'title: `[Cơ Hội Giao Thương B2B] ${o.title} — CLB CEO 1983`,';

if (code.includes(oldOppShare)) {
  code = code.replace(oldOppShare, newOppShare);
  fs.writeFileSync(file, code, 'utf8');
  console.log('✓ Updated opportunity share title!');
} else {
  console.log('Target not found in association.opportunities.tsx');
}

