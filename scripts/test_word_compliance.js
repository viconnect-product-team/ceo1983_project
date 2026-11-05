const fs = require('fs');
const docx = require('docx');
const JSZip = require('jszip');

const {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Packer
} = docx;

async function testDocx() {
  const TOTAL_WIDTH = 9026;
  const colWidths = [2500, 6526];

  const table = new Table({
    width: { size: TOTAL_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: colWidths[0], type: WidthType.DXA },
            shading: { fill: '1E3A8A' },
            children: [new Paragraph({ children: [new TextRun({ text: 'Thuộc tính', color: 'FFFFFF', bold: true })] })]
          }),
          new TableCell({
            width: { size: colWidths[1], type: WidthType.DXA },
            shading: { fill: '1E3A8A' },
            children: [new Paragraph({ children: [new TextRun({ text: 'Mô tả chi tiết', color: 'FFFFFF', bold: true })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: colWidths[0], type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: 'Mã Node', bold: true })] })]
          }),
          new TableCell({
            width: { size: colWidths[1], type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: '[NODE-CRM-001] Dashboard BI Realtime' })] })]
          })
        ]
      })
    ]
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Test Document', size: 28, bold: true })] }),
        table
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file('word/document.xml').async('string');
  console.log('Generated Table XML:');
  const tblMatch = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/);
  if (tblMatch) {
    console.log(tblMatch[0]);
  }
}

testDocx();

