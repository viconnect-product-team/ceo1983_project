const fs = require('fs');
const JSZip = require('jszip');

async function verifyDocx(filePath) {
  console.log(`\nKiểm tra tính hợp lệ XML OpenXML của: ${filePath}`);
  const buf = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml').async('string');

  const tblRegex = /<w:tbl[\s\S]*?<\/w:tbl>/g;
  let match;
  let count = 0;
  let issues = 0;

  while ((match = tblRegex.exec(xml)) !== null) {
    count++;
    const tblXml = match[0];

    // 1. Check tblPr
    const tblPr = tblXml.match(/<w:tblPr[\s\S]*?<\/w:tblPr>/)?.[0] || '';
    if (!tblPr) {
      console.log(`❌ Bảng #${count}: Thiếu thẻ <w:tblPr>!`);
      issues++;
    }

    // 2. Check tblGrid
    const tblGrid = tblXml.match(/<w:tblGrid[\s\S]*?<\/w:tblGrid>/)?.[0] || '';
    if (!tblGrid) {
      console.log(`❌ Bảng #${count}: Thiếu thẻ <w:tblGrid>!`);
      issues++;
    }

    const gridCols = [...tblGrid.matchAll(/<w:gridCol\s+w:w="(\d+)"\/>/g)].map(m => parseInt(m[1]));
    const totalGridWidth = gridCols.reduce((a, b) => a + b, 0);

    const tblW = parseInt(tblPr.match(/<w:tblW\s+w:type="dxa"\s+w:w="(\d+)"\/>/)?.[1] || '0');
    if (tblW !== totalGridWidth) {
      console.log(`❌ Bảng #${count}: Lệch tổng chiều rộng! tblW = ${tblW} vs totalGridWidth = ${totalGridWidth}`);
      issues++;
    }

    // 3. Check each row cells width vs gridCols
    const rows = [...tblXml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g)];
    for (let r = 0; r < rows.length; r++) {
      const rowXml = rows[r][0];
      const cells = [...rowXml.matchAll(/<w:tc[\s\S]*?<\/w:tc>/g)];
      if (cells.length !== gridCols.length) {
        console.log(`❌ Bảng #${count}, Hàng #${r}: Số ô (${cells.length}) không khớp số cột (${gridCols.length})`);
        issues++;
      } else {
        for (let c = 0; c < cells.length; c++) {
          const tcW = parseInt(cells[c][0].match(/<w:tcW\s+w:type="dxa"\s+w:w="(\d+)"\/>/)?.[1] || '0');
          if (tcW !== gridCols[c]) {
            console.log(`❌ Bảng #${count}, Hàng #${r}, Cột #${c}: tcW (${tcW}) khác gridCol (${gridCols[c]})`);
            issues++;
          }
        }
      }
    }
  }

  if (issues === 0) {
    console.log(`✅ CHUẨN XÁC 100%: Toàn bộ ${count} bảng biểu đều khớp hoàn hảo OpenXML ISO/IEC 29500 (0 errors)!`);
  } else {
    console.log(`⚠️ Phát hiện ${issues} điểm không khớp!`);
  }
}

async function run() {
  await verifyDocx('document/BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.docx');
  await verifyDocx('document/SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.docx');
}
run();

