const fs = require('fs');
const path = require('path');
const { generateUserGuideMarkdown } = require('./generate_user_guide.cjs');

const content = generateUserGuideMarkdown();
const out = path.resolve('document/handover/04_HUONG_DAN_SU_DUNG_HE_THONG_CEO1983_HANOIBA.md');
fs.writeFileSync(out, content, 'utf8');
console.log('✓ 04_HUONG_DAN_SU_DUNG written successfully, size:', content.length);

