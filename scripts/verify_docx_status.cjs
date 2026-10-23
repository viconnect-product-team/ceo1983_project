const fs = require('fs');
const JSZip = require('jszip');

async function check() {
  const p = 'document/[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN VÀ PHƯƠNG ÁN XỬ LÝ - VICONNECT (1).docx';
  const data = fs.readFileSync(p);
  const zip = await JSZip.loadAsync(data);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const rows = docXml.match(/<w:tr[\s>][\s\S]*?<\/w:tr>/g) || [];
  rows.forEach((r, idx) => {
    const tcs = r.match(/<w:tc[\s>][\s\S]*?<\/w:tc>/g) || [];
    if (tcs.length === 9 && idx > 0) {
      const sttMatches = tcs[0].match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
      const nameMatches = tcs[1].match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
      const lastTc = tcs[8];
      const fillMatch = lastTc.match(/w:fill="([^"]+)"/);
      const colorMatch = lastTc.match(/<w:color w:val="([^"]+)"/);
      const texts = [];
      const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
      let m;
      while ((m = tRegex.exec(lastTc)) !== null) {
        texts.push(m[1]);
      }
      const stt = sttMatches ? sttMatches[1] : '';
      const name = nameMatches ? nameMatches[1] : '';
      console.log(`STT ${stt.padEnd(3)} | ${name.padEnd(32)} | fill: ${(fillMatch ? fillMatch[1] : 'NONE').padEnd(8)} | color: ${(colorMatch ? colorMatch[1] : 'NONE').padEnd(8)} | ${texts.join(' // ')}`);
    }
  });
}

check().catch(console.error);
