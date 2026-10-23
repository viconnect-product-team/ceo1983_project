const fs = require('fs');

const origXml = fs.readFileSync('C:/Users/vumik/.gemini/antigravity-ide/brain/bf549395-b684-4fae-a721-fbb20b80cb0c/scratch/doc.xml', 'utf8');

// Look at <w:tblPr> and <w:tblGrid> in the original docx
const tblStart = origXml.indexOf('<w:tbl');
const tblEnd = origXml.indexOf('</w:tbl>', tblStart);
const tblXml = origXml.substring(tblStart, tblEnd + 8);

// Print tblPr and tblGrid
const gridEnd = tblXml.indexOf('</w:tblGrid>');
console.log('=== ORIGINAL TABLE HEADER & GRID ===');
console.log(tblXml.substring(0, gridEnd + 12));

// Print first row <w:tr>
const tr1End = tblXml.indexOf('</w:tr>');
console.log('=== ORIGINAL FIRST ROW ===');
console.log(tblXml.substring(gridEnd + 12, tr1End + 7));

// Print group header row
const grpIdx = tblXml.indexOf('A. GIAO DIỆN');
const grpTrStart = tblXml.lastIndexOf('<w:tr', grpIdx);
const grpTrEnd = tblXml.indexOf('</w:tr>', grpIdx);
console.log('=== ORIGINAL GROUP HEADER ROW ===');
console.log(tblXml.substring(grpTrStart, grpTrEnd + 7));
