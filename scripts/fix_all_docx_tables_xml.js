const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function fixAllDocx() {
  const docDir = path.join(__dirname, '..', 'document');
  const files = fs.readdirSync(docDir).filter(f => f.endsWith('.docx'));
  console.log(`Processing ${files.length} docx files in ${docDir}...\n`);

  for (const f of files) {
    try {
      const fullPath = path.join(docDir, f);
      const buf = fs.readFileSync(fullPath);
      const zip = await JSZip.loadAsync(buf);
      let xml = await zip.file('word/document.xml').async('string');

      let modified = false;

      // 1. Replace squished gridCol values (e.g. 100, 30, 50, etc.) with proper DXA
      if (xml.match(/w:gridCol w:w="([1-9]|[1-9][0-9]|1[0-9][0-9])"/)) {
        xml = xml.replace(/<w:tblGrid>([\s\S]*?)<\/w:tblGrid>/g, (match, gridCols) => {
          const colMatches = gridCols.match(/<w:gridCol[^>]*\/>/g) || [];
          if (colMatches.length === 0) return match;
          const colW = Math.round(9200 / colMatches.length);
          const newCols = colMatches.map(() => `<w:gridCol w:w="${colW}"/>`).join('');
          return `<w:tblGrid>${newCols}</w:tblGrid>`;
        });
        modified = true;
      }

      // 2. Replace cell width percentage (e.g. w:w="30" w:type="pct" or w:w="100" w:type="pct")
      if (xml.includes('w:type="pct"')) {
        xml = xml.replace(/<w:tcW w:w="\d+" w:type="pct"\/>/g, '<w:tcW w:w="4600" w:type="dxa"/>');
        xml = xml.replace(/<w:tblW w:w="\d+" w:type="pct"\/>/g, '<w:tblW w:w="9200" w:type="dxa"/>');
        modified = true;
      }

      if (modified) {
        zip.file('word/document.xml', xml);
        const newBuf = await zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(fullPath, newBuf);
        console.log(`✓ Fixed squished tables in: ${f}`);
      } else {
        console.log(`- Already perfect: ${f}`);
      }
    } catch (e) {
      console.log(`❌ Error processing ${f}: ${e.message}`);
    }
  }
}

fixAllDocx();
