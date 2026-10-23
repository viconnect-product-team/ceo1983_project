const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const dlDir = 'C:\\Users\\vumik\\Downloads';
const files = fs.readdirSync(dlDir);

const targetFiles = files.filter(f => f.includes('[UFP]') || f.includes('Trình bày tác phẩm') || f.includes('Tr?nh b'));
console.log('Found target files:', targetFiles);

async function inspectDoc(filename) {
  const filePath = path.join(dlDir, filename);
  console.log('\n======================================================');
  console.log('FILE:', filename);
  console.log('SIZE:', fs.statSync(filePath).size, 'bytes');
  
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);
  
  // List files inside docx
  const innerFiles = Object.keys(zip.files);
  const mediaFiles = innerFiles.filter(f => f.startsWith('word/media/'));
  console.log('Media count:', mediaFiles.length);
  
  if (zip.file('word/document.xml')) {
    const docXml = await zip.file('word/document.xml').async('text');
    // Extract paragraph texts
    const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
    const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    const paragraphs = [];
    let pMatch;
    while ((pMatch = pRegex.exec(docXml)) !== null) {
      const pXml = pMatch[0];
      const texts = [];
      let tMatch;
      while ((tMatch = tRegex.exec(pXml)) !== null) {
        texts.push(tMatch[1]);
      }
      if (texts.length > 0) {
        paragraphs.push(texts.join(''));
      }
    }
    console.log(`Total paragraphs with text: ${paragraphs.length}`);
    console.log('--- FIRST 20 PARAGRAPHS ---');
    paragraphs.slice(0, 20).forEach((p, idx) => console.log(`[${idx + 1}] ${p}`));
    if (paragraphs.length > 20) {
      console.log('--- LAST 10 PARAGRAPHS ---');
      paragraphs.slice(-10).forEach((p, idx) => console.log(`[${paragraphs.length - 10 + idx + 1}] ${p}`));
    }
    
    // Save full text to scratch file for complete reading
    const textDumpPath = path.join(__dirname, `dump_${filename.replace(/[^a-zA-Z0-9]/g, '_')}.txt`);
    fs.writeFileSync(textDumpPath, paragraphs.join('\n\n'), 'utf8');
    console.log(`Saved full text to: ${textDumpPath}`);
  }
}

async function run() {
  for (const f of targetFiles) {
    await inspectDoc(f);
  }
}

run().catch(console.error);
