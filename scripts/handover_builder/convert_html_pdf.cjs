/**
 * CONVERT HTML & PDF MODULE
 * Converts Markdown to self-contained HTML with embedded base64 images & Mermaid
 * Uses Playwright Chromium to export pixel-perfect A4 vector PDFs
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const EVIDENCE_DIR = path.resolve('document/images/evidence');

// Cache base64 images
const imageCache = {};

function getBase64Image(filename) {
  if (imageCache[filename]) return imageCache[filename];
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const data = fs.readFileSync(p);
    const b64 = `data:${mime};base64,${data.toString('base64')}`;
    imageCache[filename] = b64;
    return b64;
  }
  return '';
}

function formatInline(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="doc-link">$1</a>');
}

function markdownToHtml(mdText, docInfo) {
  const lines = mdText.split(/\r?\n/);
  let bodyHtml = '';
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockBuffer = [];

  let inTable = false;
  let tableHeaderCols = [];
  let tableRows = [];

  let inList = false;
  let listType = ''; // 'ul' or 'ol'

  let inCallout = false;
  let calloutType = '';
  let calloutBuffer = [];

  function closeTable() {
    if (!inTable) return;
    bodyHtml += '<div class="table-container"><table class="doc-table">\n<thead>\n<tr>\n';
    tableHeaderCols.forEach(col => {
      bodyHtml += `  <th>${formatInline(col)}</th>\n`;
    });
    bodyHtml += '</tr>\n</thead>\n<tbody>\n';
    tableRows.forEach(row => {
      bodyHtml += '<tr>\n';
      tableHeaderCols.forEach((_, idx) => {
        const cell = row[idx] || '';
        bodyHtml += `  <td>${formatInline(cell)}</td>\n`;
      });
      bodyHtml += '</tr>\n';
    });
    bodyHtml += '</tbody>\n</table></div>\n';
    inTable = false;
    tableHeaderCols = [];
    tableRows = [];
  }

  function closeList() {
    if (!inList) return;
    bodyHtml += listType === 'ul' ? '</ul>\n' : '</ol>\n';
    inList = false;
    listType = '';
  }

  function flushCallout() {
    if (!inCallout) return;
    const calloutClass = `callout callout-${calloutType.toLowerCase()}`;
    const headerTitle = calloutType.toUpperCase();
    bodyHtml += `<div class="${calloutClass}">
      <div class="callout-header">${headerTitle}</div>
      <div class="callout-body">${calloutBuffer.map(formatInline).join('<br/>')}</div>
    </div>\n`;
    inCallout = false;
    calloutType = '';
    calloutBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks / Mermaid
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        if (codeBlockLang === 'mermaid') {
          bodyHtml += `<div class="mermaid-container">\n<pre class="mermaid">\n${codeBlockBuffer.join('\n')}\n</pre>\n</div>\n`;
        } else {
          bodyHtml += `<pre class="code-block"><code>${codeBlockBuffer.join('\n')}</code></pre>\n`;
        }
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockBuffer = [];
      } else {
        closeTable();
        closeList();
        flushCallout();
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, '').trim();
        codeBlockBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // Callouts (> [!IMPORTANT] / > [!NOTE])
    const calloutMatch = line.match(/^>\s*\[!(IMPORTANT|NOTE|TIP|WARNING|CAUTION)\]/i);
    if (calloutMatch) {
      closeTable();
      closeList();
      flushCallout();
      inCallout = true;
      calloutType = calloutMatch[1];
      continue;
    }
    if (inCallout) {
      if (line.startsWith('>')) {
        calloutBuffer.push(line.replace(/^>\s?/, ''));
        continue;
      } else {
        flushCallout();
      }
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList();
      flushCallout();
      const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        tableHeaderCols = cols;
        tableRows = [];
        // Skip separator line if next
        if (i + 1 < lines.length && lines[i + 1].includes('---')) {
          i++;
        }
      } else {
        tableRows.push(cols);
      }
      continue;
    } else {
      closeTable();
    }

    // Unordered lists
    const ulMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (ulMatch) {
      flushCallout();
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        bodyHtml += '<ul class="doc-list">\n';
      }
      bodyHtml += `<li>${formatInline(ulMatch[2])}</li>\n`;
      continue;
    }

    // Ordered lists
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      flushCallout();
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        bodyHtml += '<ol class="doc-list">\n';
      }
      bodyHtml += `<li>${formatInline(olMatch[2])}</li>\n`;
      continue;
    }

    closeList();

    // Headings
    if (line.startsWith('# ')) {
      bodyHtml += `<h1 class="heading-1">${formatInline(line.substring(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      bodyHtml += `<h2 class="heading-2">${formatInline(line.substring(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      bodyHtml += `<h3 class="heading-3">${formatInline(line.substring(4))}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      bodyHtml += `<h4 class="heading-4">${formatInline(line.substring(5))}</h4>\n`;
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      bodyHtml += '<hr class="doc-divider"/>\n';
      continue;
    }

    // Image markdown: ![alt](path)
    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const imgPath = imgMatch[2];
      const fname = path.basename(imgPath);
      const b64 = getBase64Image(fname);
      if (b64) {
        bodyHtml += `<div class="img-card">
          <div class="img-wrapper"><img src="${b64}" alt="${alt}"/></div>
          <p class="img-caption">Hình: ${alt}</p>
        </div>\n`;
      } else {
        bodyHtml += `<div class="img-card"><div class="img-placeholder">[Ảnh minh họa: ${alt}]</div></div>\n`;
      }
      continue;
    }

    // Regular paragraph
    if (line.trim().length > 0) {
      bodyHtml += `<p class="doc-para">${formatInline(line)}</p>\n`;
    }
  }

  closeTable();
  closeList();
  flushCallout();

  return wrapHtmlDocument(bodyHtml, docInfo);
}

function wrapHtmlDocument(bodyHtml, docInfo) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${docInfo.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'neutral',
        flowchart: { curve: 'basis', htmlLabels: true },
        themeVariables: {
          primaryColor: '#003B95',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#002B70',
          lineColor: '#D97706',
          secondaryColor: '#EFF6FF',
          tertiaryColor: '#FFFFFF'
        }
      });
    });
  </script>
  <style>
    :root {
      --primary: #003B95;
      --navy: #1F3864;
      --gold: #D97706;
      --dark: #0F172A;
      --muted: #475569;
      --border: #CBD5E1;
      --bg-alt: #F8FAFC;
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--dark);
      background: #FFFFFF;
      margin: 0;
      padding: 20px;
    }

    @media screen {
      body {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
        box-shadow: 0 0 20px rgba(0,0,0,0.08);
      }
    }

    @page {
      size: A4 portrait;
      margin: 15mm;
    }

    /* Cover Page */
    .cover-page {
      text-align: center;
      padding: 60px 20px;
      page-break-after: always;
      border: 3px double var(--primary);
      border-radius: 8px;
      margin-bottom: 40px;
      background: linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%);
    }
    .cover-org {
      font-size: 15pt;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .cover-sub-org {
      font-size: 13pt;
      font-weight: 600;
      color: var(--gold);
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .cover-deco {
      font-size: 18pt;
      color: var(--gold);
      margin-bottom: 40px;
    }
    .cover-title {
      font-size: 24pt;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      line-height: 1.3;
      margin-bottom: 16px;
    }
    .cover-subtitle {
      font-size: 13pt;
      color: var(--muted);
      font-style: italic;
      margin-bottom: 50px;
    }
    .cover-meta {
      width: 100%;
      max-width: 550px;
      margin: 0 auto 50px auto;
      border-collapse: collapse;
      font-size: 10.5pt;
      text-align: left;
    }
    .cover-meta th {
      background: var(--bg-alt);
      color: var(--primary);
      padding: 8px 12px;
      border: 1px solid var(--border);
      width: 38%;
      font-weight: 700;
    }
    .cover-meta td {
      padding: 8px 12px;
      border: 1px solid var(--border);
    }
    .cover-footer {
      font-size: 9.5pt;
      color: var(--muted);
      border-top: 1px solid var(--border);
      padding-top: 15px;
    }

    /* Headings */
    .heading-1 {
      font-size: 18pt;
      color: var(--primary);
      font-weight: 700;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 6px;
      margin-top: 36px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }
    .heading-2 {
      font-size: 14pt;
      color: var(--gold);
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    .heading-3 {
      font-size: 12pt;
      color: var(--navy);
      font-weight: 700;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    .heading-4 {
      font-size: 11pt;
      color: var(--dark);
      font-weight: 700;
      font-style: italic;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    .doc-para {
      margin: 8px 0;
      text-align: justify;
    }

    .doc-divider {
      border: none;
      border-top: 1px dashed var(--border);
      margin: 24px 0;
    }

    /* Tables */
    .table-container {
      width: 100%;
      margin: 16px 0;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      background: #FFFFFF;
    }
    .doc-table th {
      background: var(--primary);
      color: #FFFFFF;
      font-weight: 700;
      padding: 8px 10px;
      border: 1px solid var(--border);
      text-align: left;
    }
    .doc-table td {
      padding: 7px 10px;
      border: 1px solid var(--border);
      vertical-align: top;
    }
    .doc-table tr:nth-child(even) td {
      background: var(--bg-alt);
    }

    /* Callouts */
    .callout {
      border-radius: 6px;
      padding: 12px 16px;
      margin: 16px 0;
      border-left: 4px solid;
      page-break-inside: avoid;
    }
    .callout-important {
      background: #EFF6FF;
      border-color: #2563EB;
    }
    .callout-note {
      background: #F8FAFC;
      border-color: var(--primary);
    }
    .callout-tip {
      background: #F0FDF4;
      border-color: #16A34A;
    }
    .callout-warning, .callout-caution {
      background: #FFFBEB;
      border-color: var(--gold);
    }
    .callout-header {
      font-weight: 700;
      font-size: 10pt;
      margin-bottom: 4px;
      color: var(--primary);
    }

    /* Mermaid */
    .mermaid-container {
      margin: 20px auto;
      text-align: center;
      page-break-inside: avoid;
      background: #FAFAFA;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
    }
    .mermaid {
      display: inline-block;
      max-width: 100%;
    }

    /* Code Block */
    .code-block {
      background: #0F172A;
      color: #F8FAFC;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: Consolas, monospace;
      font-size: 9.5pt;
      overflow-x: auto;
      margin: 14px 0;
    }
    .code-inline {
      background: #F1F5F9;
      color: var(--gold);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: Consolas, monospace;
      font-size: 9.5pt;
      font-weight: 600;
    }

    /* Images */
    .img-card {
      margin: 18px auto;
      text-align: center;
      page-break-inside: avoid;
    }
    .img-wrapper {
      display: inline-block;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px;
      background: #F8FAFC;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      max-width: 100%;
    }
    .img-wrapper img {
      max-width: 100%;
      height: auto;
      max-height: 420px;
      border-radius: 4px;
      display: block;
      margin: 0 auto;
    }
    .img-caption {
      font-size: 9.5pt;
      font-style: italic;
      color: var(--muted);
      margin-top: 6px;
    }
    .img-placeholder {
      padding: 18px;
      background: #F1F5F9;
      border: 1px dashed var(--border);
      color: var(--muted);
      font-style: italic;
    }

    /* Lists */
    .doc-list {
      margin: 8px 0 8px 24px;
      padding: 0;
    }
    .doc-list li {
      margin-bottom: 4px;
    }
  </style>
</head>
<body>

  <!-- TRANG BÌA CHUYÊN NGHIỆP -->
  <div class="cover-page">
    <div class="cover-org">HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)</div>
    <div class="cover-sub-org">CLB DOANH NHÂN CEO 1983</div>
    <div class="cover-deco">❖ ❖ ❖</div>
    <h1 class="cover-title">${docInfo.systemName}</h1>
    <div class="cover-subtitle">${docInfo.subTitle}</div>

    <table class="cover-meta">
      <tr>
        <th>Mã Tài Liệu</th>
        <td><strong>${docInfo.docCode}</strong></td>
      </tr>
      <tr>
        <th>Phiên Bản</th>
        <td>${docInfo.version}</td>
      </tr>
      <tr>
        <th>Cơ Quan Chủ Quản</th>
        <td>CLB Doanh Nhân CEO 1983 (HanoiBA)</td>
      </tr>
      <tr>
        <th>Đơn Vị Phát Triển</th>
        <td>VICONNECT - Nền tảng Chuyển đổi số</td>
      </tr>
      <tr>
        <th>Ngày Bàn Giao</th>
        <td>${docInfo.date || '08/11/2026'}</td>
      </tr>
      <tr>
        <th>Trạng Thái</th>
        <td><strong style="color: #16A34A;">✓ ĐÃ THẨM ĐỊNH & NGHIỆM THU CHÍNH THỨC</strong></td>
      </tr>
    </table>

    <div class="cover-footer">
      Lưu hành nội bộ Ban Chấp Hành CLB Doanh Nhân CEO 1983 & Doanh Nghiệp Hội Viên
    </div>
  </div>

  <!-- NỘI DUNG TÀI LIỆU -->
  <div class="doc-body">
    ${bodyHtml}
  </div>

</body>
</html>`;
}

async function renderHtmlToPdf(htmlFilePath, outputPdfPath) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + path.resolve(htmlFilePath).replace(/\\/g, '/');

  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  // Wait for Mermaid SVGs to render
  await page.waitForTimeout(3000);

  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 8pt; color: #64748b; width: 100%; text-align: right; padding-right: 15mm; font-family: \'Times New Roman\', serif;">HỆ THỐNG CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>',
    footerTemplate: '<div style="font-size: 8pt; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding-left: 15mm; padding-right: 15mm; font-family: \'Times New Roman\', serif;"><span>LƯU HÀNH NỘI BỘ - BAN LÃNH ĐẠO CLB CEO 1983</span><span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
  });

  await browser.close();
  console.log(`✓ Đã xuất PDF thành công: ${outputPdfPath}`);
}

module.exports = { markdownToHtml, renderHtmlToPdf };

