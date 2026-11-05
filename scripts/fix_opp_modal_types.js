const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/ceo1983_app_fe/src/components/opportunities/modals/OpportunityDetailModal.tsx');
let content = fs.readFileSync(file, 'utf8');

// Thay thế các đoạn gọi selectedOpp.images bằng safe access (selectedOpp as any)?.images || (selectedOpp as any)?.image
content = content.replace(
  /const oppImg = Array\.isArray\(selectedOpp\.images\)[\s\S]*?: undefined\);/g,
  `const oppAny = selectedOpp as any;
                  const oppImg = oppAny?.image || (Array.isArray(oppAny?.images) ? oppAny.images[0] : (typeof oppAny?.images === 'string' && oppAny.images.startsWith('http') ? oppAny.images : undefined));`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully fixed oppImg in OpportunityDetailModal.tsx');

