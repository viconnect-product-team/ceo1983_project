const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function main() {
  const bytes = fs.readFileSync('scripts/EVENT_VISUAL_DESIGN_CEO1983.pdf');
  const pdfDoc = await PDFDocument.load(bytes);
  console.log('Page count:', pdfDoc.getPageCount());
  
  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    console.log(`Page ${i + 1}: ${width} x ${height}`);
  }
}

main().catch(console.error);

