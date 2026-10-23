const fs = require('fs');
const JSZip = require('jszip');

async function check() {
  const filePath = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT.docx';
  const content = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(content);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const trs = docXml.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
  console.log('Total trs:', trs.length);
  trs.forEach((tr, i) => {
    const tcs = tr.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
    const gridSpans = (tr.match(/<w:gridSpan w:val="(\d+)"/g) || []);
    console.log(`Row ${i}: tcs count = ${tcs.length}, gridSpans = ${gridSpans.join(',')}`);
  });
}
check();
