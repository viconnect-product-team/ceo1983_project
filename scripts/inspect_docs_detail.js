const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VIONE_DOC = path.join(ROOT, '..', 'vione_project', 'document');

console.log('=== INSPECTING SLIDES ===');
const crmSlideHtml = fs.readFileSync(path.join(VIONE_DOC, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html'), 'utf8');
const appSlideHtml = fs.readFileSync(path.join(VIONE_DOC, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html'), 'utf8');

const crmCards = crmSlideHtml.split('id="slide-').length - 1;
const appCards = appSlideHtml.split('id="slide-').length - 1;

console.log('CRM Slide actual cards:', crmCards);
console.log('CRM Slide total var:', (crmSlideHtml.match(/const total = (\d+);/) || [])[1]);

console.log('App Slide actual cards:', appCards);
console.log('App Slide total var:', (appSlideHtml.match(/const total = (\d+);/) || [])[1]);

console.log('\n=== INSPECTING BRD ===');
const brdDocx = path.join(VIONE_DOC, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx');
const brdMd = path.join(VIONE_DOC, 'BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md');
console.log('BRD docx size:', fs.existsSync(brdDocx) ? (fs.statSync(brdDocx).size / 1024).toFixed(1) + ' KB' : 'missing');
console.log('BRD md size:', fs.existsSync(brdMd) ? (fs.statSync(brdMd).size / 1024).toFixed(1) + ' KB' : 'missing');
if (fs.existsSync(brdMd)) {
  const content = fs.readFileSync(brdMd, 'utf8');
  console.log('BRD md lines:', content.split('\n').length);
}

console.log('\n=== INSPECTING SRS ===');
const srsDocx = path.join(VIONE_DOC, 'SRS_VIONE_HE_THONG_TOAN_DIEN.docx');
const srsMd = path.join(VIONE_DOC, 'SRS_CHI_TIET_VIONE_HE_THONG_TOAN_DIEN.md');
console.log('SRS docx size:', fs.existsSync(srsDocx) ? (fs.statSync(srsDocx).size / 1024).toFixed(1) + ' KB' : 'missing');
console.log('SRS md size:', fs.existsSync(srsMd) ? (fs.statSync(srsMd).size / 1024).toFixed(1) + ' KB' : 'missing');
if (fs.existsSync(srsMd)) {
  const content = fs.readFileSync(srsMd, 'utf8');
  console.log('SRS md lines:', content.split('\n').length);
  const ucs = content.match(/### [0-9]+\.[0-9]+.*UC-[A-Z]+-[0-9]+/g) || [];
  console.log('SRS markdown UCs count:', ucs.length);
  const ucIds = content.match(/UC-[A-Z]+-[0-9]+/g) || [];
  console.log('SRS markdown unique UC IDs:', new Set(ucIds).size);
}

console.log('\n=== INSPECTING HDSD ===');
const hdsdDocx = path.join(VIONE_DOC, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.docx');
const hdsdHtml = path.join(VIONE_DOC, 'HDSD_HE_THONG_VIONE_TOAN_DIEN.html');
console.log('HDSD docx size:', fs.existsSync(hdsdDocx) ? (fs.statSync(hdsdDocx).size / 1024).toFixed(1) + ' KB' : 'missing');
console.log('HDSD html size:', fs.existsSync(hdsdHtml) ? (fs.statSync(hdsdHtml).size / 1024).toFixed(1) + ' KB' : 'missing');
