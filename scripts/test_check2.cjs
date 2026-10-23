const fs = require('fs');
const JSZip = require('jszip');

async function check() {
  const filePath = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT.docx';
  const content = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(content);
  const docXml = await zip.file('word/document.xml').async('text');
  
  // Print the first 2000 chars of the table
  const tblStart = docXml.indexOf('<w:tbl>');
  console.log(docXml.substring(tblStart, tblStart + 1500));
}
check();
