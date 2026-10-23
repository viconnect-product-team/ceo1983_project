const fs = require('fs');
const JSZip = require('jszip');

function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function test() {
  const data = fs.readFileSync('C:\\Users\\vumik\\Downloads\\[UFP] 01. Tờ khai.docx');
  const zip = await JSZip.loadAsync(data);
  let xml = await zip.file('word/document.xml').async('text');

  // Helper to get text inside paragraph
  function getPText(pXml) {
    const tMatches = pXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
    return tMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
  }

  // Replace paragraph text while preserving pPr
  function replacePContent(pXml, newText, isBold = false, isItalic = false) {
    const pPrMatch = pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const pPr = pPrMatch ? pPrMatch[0] : '';
    let rPr = '<w:rPr><w:lang w:val="vi-VN"/>';
    if (isBold) rPr += '<w:b/><w:bCs/>';
    if (isItalic) rPr += '<w:i/><w:iCs/>';
    rPr += '</w:rPr>';
    return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(newText)}</w:t></w:r></w:p>`;
  }

  // Check how many paragraphs
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  const paragraphs = xml.match(pRegex) || [];
  console.log('Total paragraphs in Tờ khai:', paragraphs.length);

  let newXml = xml;
  // Test replacing P 17
  paragraphs.forEach((pXml, idx) => {
    const text = getPText(pXml).trim();
    if (text.startsWith('Tên chương trình máy tính:')) {
      console.log(`Found Title at P ${idx + 1}: ${text}`);
      const newP = replacePContent(
        pXml,
        'Tên chương trình máy tính: HỆ THỐNG PHẦN MỀM QUẢN TRỊ KẾT NỐI DOANH NGHIỆP VÀ ỨNG DỤNG DI ĐỘNG CEO 1983 (CEO 1983 PLATFORM & MOBILE APP)',
        true
      );
      newXml = newXml.replace(pXml, newP);
    }
  });

  zip.file('word/document.xml', newXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('scripts/test_to_khai_mod.docx', outBuf);
  console.log('Saved test_to_khai_mod.docx, size:', outBuf.length);
}

test().catch(console.error);
