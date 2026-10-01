const fs = require('fs');
const JSZip = require('jszip');

async function check() {
  const buf = fs.readFileSync('document/SRS_CEO1983_HE_THONG_TOAN_DIEN.docx');
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml').async('string');
  const has100 = xml.includes('w:gridCol w:w="100"');
  const count2400 = (xml.split('w:gridCol w:w="2400"').length - 1);
  const count6800 = (xml.split('w:gridCol w:w="6800"').length - 1);
  console.log('Has squished w:w="100":', has100);
  console.log('Occurrences of w:w="2400":', count2400);
  console.log('Occurrences of w:w="6800":', count6800);
}
check();
