const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function scan() {
  const docDir = path.join(__dirname, '..', 'document');
  const files = fs.readdirSync(docDir).filter(f => f.endsWith('.docx'));
  console.log(`Scanning ${files.length} docx files in ${docDir}...\n`);

  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(docDir, f));
      const zip = await JSZip.loadAsync(buf);
      const xml = await zip.file('word/document.xml').async('string');
      const badMatches = xml.match(/w:gridCol w:w="([1-9]|[1-9][0-9]|1[0-9][0-9])"/g);
      const pctMatches = xml.match(/w:type="pct"/g);
      console.log(`- ${f}:`);
      console.log(`  -> Squished columns (<200 twips): ${badMatches ? badMatches.length : 0}`);
      if (badMatches) console.log(`     Sample: ${badMatches.slice(0, 5).join(', ')}`);
      console.log(`  -> Percentage width: ${pctMatches ? pctMatches.length : 0}`);
    } catch (e) {
      console.log(`- ${f}: ERR -> ${e.message}`);
    }
  }
}

scan();
