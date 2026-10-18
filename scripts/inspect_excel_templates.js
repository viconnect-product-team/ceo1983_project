const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/vumik/Downloads/Mẫu file Excel thu chi sổ quỹ nội bộ';

function formatVal(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if (v.result !== undefined) return String(v.result);
    if (v.richText) return v.richText.map(t => t.text).join('');
    if (v.text !== undefined) return String(v.text);
    return JSON.stringify(v);
  }
  return String(v).trim();
}

async function inspectFile(file) {
  console.log('\n======================================================');
  console.log('FILE:', file);
  console.log('======================================================');
  const wb = new ExcelJS.Workbook();
  const filePath = path.join(dir, file);
  await wb.xlsx.readFile(filePath);

  wb.eachSheet((sheet) => {
    console.log(`\n--- Sheet: "${sheet.name}" (Rows: ${sheet.rowCount}, Cols: ${sheet.columnCount}) ---`);
    for (let r = 1; r <= Math.min(sheet.rowCount, 25); r++) {
      const row = sheet.getRow(r);
      const cells = [];
      for (let c = 1; c <= Math.min(sheet.columnCount || 15, 12); c++) {
        const cell = row.getCell(c);
        cells.push(formatVal(cell.value));
      }
      if (cells.some(c => c !== '')) {
        console.log(`Row ${String(r).padStart(2, '0')}: [${cells.join(' | ')}]`);
      }
    }
  });
}

async function main() {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.endsWith('.xlsx')) {
      try {
        await inspectFile(f);
      } catch (err) {
        console.log('Error inspecting', f, err.message);
      }
    }
  }
}

main();
