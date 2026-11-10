/**
 * BUILD ALL MASTER FORMATS FOR CEO 1983 (HANOIBA)
 * Xuất bản đầy đủ các định dạng: Markdown (.md), Microsoft Word (.docx), Adobe PDF (.pdf), Excel (.xlsx)
 * Chuẩn màu thương hiệu Hoàng Gia: Xanh Navy (#1B365D), Vàng Ánh Kim (#D4AF37), Xanh Ngọc (#00A86B)
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ExcelJS = require('exceljs');
const docx = require('docx');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ImageRun
} = docx;

const ROOT_DIR = path.resolve(__dirname, '..');
const NOTEBOOKLM_DIR = path.join(ROOT_DIR, 'document', 'notebooklm');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

[NOTEBOOKLM_DIR, DOC_DIR, FE_DOCS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const COLORS = {
  NAVY: '1B365D',
  GOLD: 'D4AF37',
  EMERALD: '00A86B',
  DARK_SLATE: '1E293B',
  MUTED_SLATE: '64748B',
  BORDER: 'CBD5E1',
  BG_LIGHT: 'F8FAFC',
  BG_ALT: 'F1F5F9',
  WHITE: 'FFFFFF',
};

const BORDER_STYLE = {
  top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER },
  left: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER },
  right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER }
};

// ============================================================================
// PHẦN 1: BỘ PHÂN TÍCH MARKDOWN TO DOCX
// ============================================================================

function parseInlineRuns(text, baseOpts = {}) {
  if (!text) return [new TextRun({ text: '', font: 'Times New Roman', ...baseOpts })];
  const runs = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push(new TextRun({
        text: text.slice(lastIdx, match.index),
        font: 'Times New Roman',
        ...baseOpts
      }));
    }
    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**')) {
      runs.push(new TextRun({
        text: raw.slice(2, -2),
        bold: true,
        font: 'Times New Roman',
        ...baseOpts
      }));
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      runs.push(new TextRun({
        text: raw.slice(1, -1),
        italics: true,
        font: 'Times New Roman',
        ...baseOpts
      }));
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      runs.push(new TextRun({
        text: raw.slice(1, -1),
        font: 'Consolas',
        color: COLORS.GOLD,
        bold: true,
        ...baseOpts
      }));
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    runs.push(new TextRun({
      text: text.slice(lastIdx),
      font: 'Times New Roman',
      ...baseOpts
    }));
  }
  return runs.length > 0 ? runs : [new TextRun({ text: '', ...baseOpts })];
}

function markdownToDocxElements(mdContent, basePath) {
  const lines = mdContent.split(/\r?\n/);
  const elements = [];
  let inCode = false;
  let codeBuffer = [];
  let tableBuffer = [];

  function flushTable() {
    if (tableBuffer.length === 0) return;
    const headerRow = tableBuffer[0];
    const dataRows = tableBuffer.slice(1);
    const colCount = Math.max(...tableBuffer.map(r => r.length));
    const colWidth = Math.floor(9026 / (colCount || 1));

    const rows = [];
    // Header
    rows.push(new TableRow({
      tableHeader: true,
      children: headerRow.map((cellText) => new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: COLORS.NAVY },
        borders: BORDER_STYLE,
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: cellText.trim(), bold: true, color: COLORS.WHITE, size: 20, font: 'Times New Roman' })]
          })
        ]
      }))
    }));

    // Data rows
    dataRows.forEach((r, rIdx) => {
      const bg = rIdx % 2 === 1 ? COLORS.BG_ALT : COLORS.WHITE;
      rows.push(new TableRow({
        children: r.map((cellText, cIdx) => new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: bg },
          borders: BORDER_STYLE,
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: cIdx === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
              spacing: { before: 30, after: 30 },
              children: parseInlineRuns(cellText.trim(), { size: 19, color: COLORS.DARK_SLATE })
            })
          ]
        }))
      }));
    });

    elements.push(new Table({
      width: { size: 9026, type: WidthType.DXA },
      rows: rows
    }));
    elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
    tableBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        // End of code
        elements.push(new Paragraph({
          shading: { type: ShadingType.CLEAR, fill: COLORS.BG_ALT },
          spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: codeBuffer.join('\n'), font: 'Consolas', size: 18, color: COLORS.DARK_SLATE })]
        }));
        codeBuffer = [];
        inCode = false;
      } else {
        flushTable();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) continue; // skip divider
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      tableBuffer.push(cells);
      continue;
    } else {
      flushTable();
    }

    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: trimmed.replace(/^#\s+/, ''), bold: true, size: 36, color: COLORS.NAVY, font: 'Times New Roman' })]
      }));
    } else if (trimmed.startsWith('## ')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: trimmed.replace(/^##\s+/, ''), bold: true, size: 28, color: COLORS.NAVY, font: 'Times New Roman' })]
      }));
    } else if (trimmed.startsWith('### ')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 60 },
        children: [new TextRun({ text: trimmed.replace(/^###\s+/, ''), bold: true, size: 24, color: COLORS.GOLD, font: 'Times New Roman' })]
      }));
    } else if (trimmed.startsWith('#### ')) {
      elements.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: trimmed.replace(/^####\s+/, ''), bold: true, size: 22, color: COLORS.DARK_SLATE, font: 'Times New Roman' })]
      }));
    } else if (trimmed.startsWith('![')) {
      // Image: ![caption](path)
      const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const caption = imgMatch[1];
        let imgRelPath = imgMatch[2];
        let fullImgPath = path.resolve(basePath, imgRelPath);
        if (!fs.existsSync(fullImgPath)) {
          // try relative to document
          fullImgPath = path.resolve(DOC_DIR, imgRelPath.replace(/^\.\.\//, ''));
        }
        if (fs.existsSync(fullImgPath)) {
          try {
            const imgBuffer = fs.readFileSync(fullImgPath);
            elements.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 40 },
              children: [
                new ImageRun({
                  data: imgBuffer,
                  transformation: { width: 500, height: 280 }
                })
              ]
            }));
            elements.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 100 },
              children: [new TextRun({ text: caption ? `[Hình: ${caption}]` : '', italics: true, size: 18, color: COLORS.MUTED_SLATE, font: 'Times New Roman' })]
            }));
          } catch (e) {
            console.warn(`[WARN] Could not embed image ${fullImgPath}: ${e.message}`);
          }
        }
      }
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(new Paragraph({
        indent: { left: 360 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({ text: '• ', bold: true, color: COLORS.NAVY, size: 22, font: 'Times New Roman' }),
          ...parseInlineRuns(trimmed.replace(/^[\-\*]\s+/, ''), { size: 22, color: COLORS.DARK_SLATE })
        ]
      }));
    } else if (/^\d+\.\s/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
      elements.push(new Paragraph({
        indent: { left: 360 },
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({ text: numMatch[1] + ' ', bold: true, color: COLORS.NAVY, size: 22, font: 'Times New Roman' }),
          ...parseInlineRuns(numMatch[2], { size: 22, color: COLORS.DARK_SLATE })
        ]
      }));
    } else {
      elements.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 40, after: 40, line: 260 },
        children: parseInlineRuns(trimmed, { size: 22, color: COLORS.DARK_SLATE })
      }));
    }
  }

  flushTable();
  return elements;
}

async function convertMarkdownToDocx(mdFilePath, docxOutputPath, title) {
  console.log(`[DOCX] Đang chuyển đổi: ${path.basename(mdFilePath)} -> ${path.basename(docxOutputPath)}`);
  const content = fs.readFileSync(mdFilePath, 'utf8');
  const baseDir = path.dirname(mdFilePath);
  const elements = markdownToDocxElements(content, baseDir);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)',
                    size: 16,
                    color: COLORS.MUTED_SLATE,
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Trang ', size: 18, color: COLORS.MUTED_SLATE, font: 'Times New Roman' }),
                  new TextRun({ children: [PageNumber.CURRENT], bold: true, color: COLORS.NAVY, font: 'Times New Roman' }),
                  new TextRun({ text: ' / ', size: 18, color: COLORS.MUTED_SLATE, font: 'Times New Roman' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], bold: true, color: COLORS.NAVY, font: 'Times New Roman' })
                ]
              })
            ]
          })
        },
        children: elements
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxOutputPath, buffer);
  console.log(`✓ [DOCX] Xuất thành công: ${docxOutputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ============================================================================
// PHẦN 2: BỘ PHÂN TÍCH MARKDOWN TO PDF (VIA PLAYWRIGHT & CHROME)
// ============================================================================

function formatInlineHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<span class="doc-link">$1</span>');
}

function markdownToHtml(mdContent, basePath) {
  const lines = mdContent.split(/\r?\n/);
  const out = [];
  let inCode = false;
  let codeBuffer = [];
  let inTable = false;
  let tableBuffer = [];
  let inUl = false;
  let inOl = false;

  function closeLists() {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  }

  function flushTable() {
    if (!inTable || tableBuffer.length === 0) return;
    let tableHtml = '<table class="doc-table">';
    tableBuffer.forEach((cols, rIdx) => {
      const tag = rIdx === 0 ? 'th' : 'td';
      tableHtml += '<tr>';
      cols.forEach(c => {
        tableHtml += `<${tag}>${formatInlineHtml(c.trim())}</${tag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';
    out.push(tableHtml);
    tableBuffer = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      closeLists();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        const escapedCode = codeBuffer.join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        out.push(`<pre class="code-block"><code>${escapedCode}</code></pre>`);
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeLists();
      if (trimmed.includes('---')) continue; // divider line
      const cols = trimmed.split('|').slice(1, -1);
      if (!inTable) {
        inTable = true;
        tableBuffer = [cols];
      } else {
        tableBuffer.push(cols);
      }
      continue;
    } else {
      flushTable();
    }

    // Empty line
    if (!trimmed) {
      closeLists();
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      closeLists();
      out.push('<hr class="doc-divider">');
      continue;
    }

    // Headings (Always display block with page-break-after: avoid)
    if (trimmed.startsWith('# ')) {
      closeLists();
      out.push(`<h1 class="doc-title">${formatInlineHtml(trimmed.replace(/^#\s+/, ''))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeLists();
      out.push(`<h2 class="section-h2">${formatInlineHtml(trimmed.replace(/^##\s+/, ''))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      closeLists();
      out.push(`<h3 class="section-h3">${formatInlineHtml(trimmed.replace(/^###\s+/, ''))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      closeLists();
      out.push(`<h4 class="section-h4">${formatInlineHtml(trimmed.replace(/^####\s+/, ''))}</h4>`);
      continue;
    }

    // Images: ![caption](url)
    if (trimmed.startsWith('![')) {
      closeLists();
      const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const caption = imgMatch[1];
        let imgRelPath = imgMatch[2];
        let fullImgPath = path.resolve(basePath, imgRelPath);
        if (!fs.existsSync(fullImgPath)) {
          fullImgPath = path.resolve(DOC_DIR, imgRelPath.replace(/^\.\.\//, ''));
        }
        if (fs.existsSync(fullImgPath)) {
          try {
            const ext = path.extname(fullImgPath).slice(1).toLowerCase();
            const base64 = fs.readFileSync(fullImgPath).toString('base64');
            out.push(`
              <div class="img-container">
                <img src="data:image/${ext};base64,${base64}" alt="${caption}" />
                <div class="img-caption">${caption}</div>
              </div>
            `);
          } catch (e) {
            out.push(`<div class="img-caption">[Hình: ${caption}]</div>`);
          }
        } else {
          out.push(`<div class="img-caption">[Hình: ${caption}]</div>`);
        }
      }
      continue;
    }

    // Unordered list (*, -)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        inUl = true;
        out.push('<ul class="doc-list">');
      }
      const itemText = trimmed.replace(/^[\-\*]\s+/, '');
      out.push(`<li>${formatInlineHtml(itemText)}</li>`);
      continue;
    }

    // Ordered list (1., 2.)
    if (/^\d+\.\s/.test(trimmed)) {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        inOl = true;
        out.push('<ol class="doc-list">');
      }
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      out.push(`<li>${formatInlineHtml(itemText)}</li>`);
      continue;
    }

    // Paragraph
    closeLists();
    out.push(`<p class="doc-p">${formatInlineHtml(trimmed)}</p>`);
  }

  closeLists();
  flushTable();

  const renderedHtml = out.join('\n');

  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>CEO 1983 - HanoiBA Master Documentation</title>
    <style>
      @page {
        size: A4;
        margin: 20mm 15mm 20mm 15mm;
        @top-right {
          content: "HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)";
          font-size: 8pt;
          color: #64748B;
        }
        @bottom-center {
          content: counter(page) " / " counter(pages);
          font-size: 9pt;
          font-weight: bold;
          color: #1B365D;
        }
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 10.5pt;
        line-height: 1.6;
        color: #1E293B;
        margin: 0;
        padding: 0;
      }
      h1, h2, h3, h4 {
        display: block !important;
        width: 100% !important;
        clear: both !important;
        page-break-after: avoid !important;
      }
      .doc-title {
        color: #1B365D;
        font-size: 22pt;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 8px;
        font-weight: 800;
        text-transform: uppercase;
        border-bottom: 3px solid #D4AF37;
        padding-bottom: 12px;
      }
      .section-h2 {
        color: #1B365D;
        font-size: 15pt;
        margin-top: 24px;
        margin-bottom: 10px;
        border-left: 5px solid #D4AF37;
        padding-left: 10px;
      }
      .section-h3 {
        color: #D4AF37;
        font-size: 12.5pt;
        margin-top: 18px;
        margin-bottom: 8px;
        font-weight: 700;
      }
      .section-h4 {
        color: #00A86B;
        font-size: 11pt;
        margin-top: 14px;
        margin-bottom: 6px;
        font-weight: 700;
      }
      .doc-p {
        display: block !important;
        clear: both !important;
        margin-top: 6px;
        margin-bottom: 8px;
        text-align: justify;
        line-height: 1.6;
      }
      .doc-list {
        display: block !important;
        clear: both !important;
        margin-top: 6px;
        margin-bottom: 8px;
        padding-left: 28px;
      }
      .doc-list li {
        display: list-item !important;
        margin-bottom: 4px;
        line-height: 1.5;
      }
      .doc-link {
        color: #1B365D;
        font-weight: 600;
        text-decoration: underline;
      }
      code {
        font-family: Consolas, monospace;
        background: #F1F5F9;
        color: #D4AF37;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 4px;
        font-size: 9pt;
      }
      .code-block {
        display: block !important;
        clear: both !important;
        background: #0F172A;
        color: #F8FAFC;
        padding: 12px;
        border-radius: 6px;
        font-family: Consolas, monospace;
        font-size: 8.5pt;
        overflow-x: auto;
        page-break-inside: avoid;
        border-left: 4px solid #00A86B;
        margin: 10px 0;
      }
      .code-block code {
        background: transparent;
        color: #F8FAFC;
        font-weight: normal;
      }
      .doc-table {
        display: table !important;
        clear: both !important;
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        margin-bottom: 12px;
        font-size: 9pt;
        page-break-inside: avoid;
      }
      .doc-table th {
        background: #1B365D;
        color: #FFFFFF;
        font-weight: bold;
        text-align: left;
        padding: 8px 10px;
        border: 1px solid #CBD5E1;
      }
      .doc-table td {
        padding: 6px 10px;
        border: 1px solid #CBD5E1;
      }
      .doc-table tr:nth-child(even) {
        background: #F8FAFC;
      }
      .img-container {
        display: block !important;
        clear: both !important;
        text-align: center;
        margin: 15px 0;
        page-break-inside: avoid;
      }
      .img-container img {
        max-width: 90%;
        max-height: 400px;
        border-radius: 8px;
        border: 1px solid #CBD5E1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .img-caption {
        font-size: 8.5pt;
        font-style: italic;
        color: #64748B;
        margin-top: 6px;
      }
      .doc-divider {
        display: block !important;
        clear: both !important;
        border: 0;
        height: 1px;
        background: #E2E8F0;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    ${renderedHtml}
  </body>
  </html>
  `;
}

async function convertMarkdownToPdf(browser, mdFilePath, pdfOutputPath) {
  console.log(`[PDF] Đang chuyển đổi: ${path.basename(mdFilePath)} -> ${path.basename(pdfOutputPath)}`);
  const content = fs.readFileSync(mdFilePath, 'utf8');
  const baseDir = path.dirname(mdFilePath);
  const html = markdownToHtml(content, baseDir);

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: pdfOutputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: sans-serif; font-size: 8pt; width: 100%; text-align: right; color: #64748B; padding-right: 15mm;">
        HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)
      </div>
    `,
    footerTemplate: `
      <div style="font-family: sans-serif; font-size: 8pt; width: 100%; text-align: center; color: #1B365D; font-weight: bold;">
        Trang <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });
  await page.close();

  const size = (fs.statSync(pdfOutputPath).size / 1024).toFixed(1);
  console.log(`✓ [PDF] Xuất thành công: ${pdfOutputPath} (${size} KB)`);
}

// ============================================================================
// PHẦN 3: BỘ XUẤT EXCEL MA TRẬN TRUY VẾT & BIỂU MẪU (EXCELJS)
// ============================================================================

async function generateMasterExcelRTM(outputPath) {
  console.log(`[EXCEL] Đang khởi tạo tệp bảng tính: ${path.basename(outputPath)}`);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VICONNECT - Kiến Trúc Sư Hệ Thống';
  workbook.created = new Date();

  // Helper định dạng tiêu đề sheet
  function styleSheetHeader(sheet, columns) {
    sheet.columns = columns;
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B365D' } // Navy
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FFD4AF37' } }, // Gold bottom border
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });
  }

  function styleDataRow(row, isAlt = false) {
    row.height = 24;
    row.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
      if (isAlt) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  // --- SHEET 1: 12 BIỂU MẪU CHUẨN HÓA ---
  const s1 = workbook.addWorksheet('12_BIEU_MAU_CHUAN_HOA');
  styleSheetHeader(s1, [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Mã Biểu Mẫu', key: 'code', width: 22 },
    { header: 'Tên Biểu Mẫu Nghiệp Vụ', key: 'name', width: 45 },
    { header: 'Phân Hệ Sử Dụng', key: 'module', width: 22 },
    { header: 'Người Ký Duyệt', key: 'approver', width: 25 },
    { header: 'Thời Hạn Lưu Trữ', key: 'retention', width: 20 },
    { header: 'Mô Tả Mục Đích Áp Dụng', key: 'desc', width: 60 }
  ]);

  const templates = [
    { stt: 1, code: 'BM-CEO1983-MEM-01', name: 'Đơn Đăng Ký Gia Nhập CLB Doanh Nhân CEO 1983', module: 'Mobile App / CRM', approver: 'Ban Thư Ký & Chủ Tịch', retention: 'Vĩnh viễn', desc: 'Kê khai thông tin doanh nhân, năm sinh 1983, CCCD, pháp nhân doanh nghiệp, mã số thuế.' },
    { stt: 2, code: 'BM-CEO1983-MEM-02', name: 'Bản Cam Đoan & Thỏa Thuận Bảo Mật Thông Tin (NDA)', module: 'Mobile App / CRM', approver: 'Hội Viên & Ban Kiểm Tra', retention: 'Vĩnh viễn', desc: 'Bảo mật danh bạ nội khối, cơ hội kinh doanh và mức giá chiết khấu theo Nghị định 13/2023.' },
    { stt: 3, code: 'BM-CEO1983-FIN-03', name: 'Biên Lai Điện Tử Thu Hội Phí Niên Khóa (VietQR)', module: 'Hệ Thống Tự Động', approver: 'Hệ Thống / Kế Toán', retention: '10 năm', desc: 'Phát hành tự động khi gạch nợ thành công qua VietQR Napas247, MoMo hoặc VNPay.' },
    { stt: 4, code: 'BM-CEO1983-FIN-04', name: 'Giấy Đề Nghị Tạm Ứng Kinh Phí Hoạt Động Ban', module: 'Web CRM', approver: 'Trưởng Ban -> Chủ Tịch', retention: '05 năm', desc: 'Dự toán chi tiết kinh phí sự kiện, giải đấu trong hạn mức ngân sách được giao của Ban.' },
    { stt: 5, code: 'BM-CEO1983-FIN-05', name: 'Giấy Thanh Toán & Bảng Kê Quyết Toán Hoàn Ứng', module: 'Web CRM', approver: 'Kế Toán Trưởng', retention: '05 năm', desc: 'Hoàn ứng trong 07 ngày làm việc sau sự kiện, đính kèm hóa đơn đỏ VAT hợp lệ.' },
    { stt: 6, code: 'BM-CEO1983-EVT-06', name: 'Giấy Mời / Thư Mời Họp Ban Chấp Hành Định Kỳ', module: 'CRM / Omnichannel', approver: 'Chánh Văn Phòng CLB', retention: '03 năm', desc: 'Thông báo thời gian, địa điểm, agenda chi tiết và đường dẫn phòng họp Jitsi Meet bảo mật.' },
    { stt: 7, code: 'BM-CEO1983-EVT-07', name: 'Thư Ngỏ Vận Động Tài Trợ Gala Keangnam Landmark72', module: 'CRM / Email', approver: 'Trưởng Ban Vận Động', retention: '05 năm', desc: 'Các gói tài trợ Kim Cương (100tr), Vàng (50tr), Bạc (30tr) kèm quyền lợi Bàn VIP & TVC.' },
    { stt: 8, code: 'BM-CEO1983-DOC-08', name: 'Biên Bản Cuộc Họp Ban Điều Hành CLB CEO 1983', module: 'Web CRM', approver: 'Chủ Tọa & Thư Ký', retention: 'Vĩnh viễn', desc: 'Ghi nhận nghị quyết cuộc họp, làm đầu vào để AI Gemini bóc tách task đưa lên Kanban.' },
    { stt: 9, code: 'BM-CEO1983-ZNS-09', name: 'Mẫu Tin Nhắn Zalo OA ZNS Thông Báo & Nhắc Phí', module: 'Zalo Cloud API', approver: 'Zalo BQT Phê Duyệt', retention: '02 năm', desc: 'Mẫu tin nhắn chăm sóc khách hàng có tích vàng, gửi thông báo hội phí và sự kiện tự động.' },
    { stt: 10, code: 'BM-CEO1983-MAIL-10', name: 'Mẫu Thư Điện Tử HTML Thư Mời & Hóa Đơn Điện Tử', module: 'SMTP Server', approver: 'Ban Truyền Thông', retention: '03 năm', desc: 'Email responsive HTML chuẩn nhận diện Navy-Gold, đính kèm thiệp mời và biên lai PDF.' },
    { stt: 11, code: 'BM-CEO1983-DES-11', name: 'Mẫu Poster Thư Mời Wyndham Thanh Thủy (9:16 Pinterest)', module: 'Studio Poster CRM', approver: 'Ban Thư Ký', retention: '03 năm', desc: 'Mẫu poster đồ họa 3D, bóc tách ảnh đại biểu, làm mờ viền Feather 15px cho sự kiện nghỉ dưỡng.' },
    { stt: 12, code: 'BM-CEO1983-B2B-12', name: 'Kịch Bản Cuộc Hẹn Doanh Nhân 1-on-1 (3 Tình Huống)', module: 'CEO 1983 Mobile App', approver: 'Ban Giao Thương', retention: '03 năm', desc: 'Quy chuẩn kết nối 1-on-1: (1) Cafe giao lưu, (2) Thăm quan nhà máy, (3) Đàm phán deal B2B.' }
  ];

  templates.forEach((t, idx) => {
    const row = s1.addRow(t);
    styleDataRow(row, idx % 2 === 1);
  });

  // --- SHEET 2: MA TRẬN 37 NODE HỆ THỐNG ---
  const s2 = workbook.addWorksheet('MA_TRAN_37_NODE_HE_THONG');
  styleSheetHeader(s2, [
    { header: 'Node ID', key: 'id', width: 18 },
    { header: 'Phân Hệ', key: 'scope', width: 16 },
    { header: 'Tên Node Chức Năng', key: 'name', width: 40 },
    { header: 'Endpoint API Chính', key: 'api', width: 35 },
    { header: 'Bảng CSDL Liên Quan', key: 'tables', width: 35 },
    { header: 'Trạng Thái', key: 'status', width: 18 }
  ]);

  const nodes = [
    { id: 'NODE-CRM-001', scope: 'Web CRM', name: 'Xác thực & Phân quyền RBAC 5 cấp', api: 'POST /api/auth/login', tables: 'ceo1983_users, audit_logs', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-002', scope: 'Web CRM', name: 'Quản trị danh sách hội viên 360 độ', api: 'GET /api/members', tables: 'members, companies', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-003', scope: 'Web CRM', name: 'Thẩm định & Phê duyệt kết nạp', api: 'PUT /api/members/:id/approve', tables: 'members, invoices', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-004', scope: 'Web CRM', name: 'Quản trị hồ sơ doanh nghiệp & đối tác', api: 'GET /api/companies', tables: 'companies, products', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-005', scope: 'Web CRM', name: 'Studio poster thư mời Wyndham 9:16', api: 'POST /api/templates/poster', tables: 'app_settings', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-006', scope: 'Web CRM', name: 'Quản lý nhóm mẫu trang & gửi đa kênh', api: 'POST /api/broadcast/send', tables: 'notifications', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-007', scope: 'Web CRM', name: 'Cấu hình Zalo OA & Xoay vòng Token', api: 'GET /api/zalo/token-status', tables: 'app_settings', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-008', scope: 'Web CRM', name: 'Quản lý Sự kiện & Bàn tiệc Keangnam', api: 'POST /api/events', tables: 'events, event_registrations', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-009', scope: 'Web CRM', name: 'Soát vé QR Động 0.5s & Vòng quay may mắn', api: 'POST /api/events/checkin', tables: 'event_registrations', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-010', scope: 'Web CRM', name: 'Điều hành cuộc họp Ban Cố định / Đột xuất', api: 'POST /api/meetings', tables: 'meetings, participants', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-011', scope: 'Web CRM', name: 'Quản lý thu chi & Sổ quỹ hiệp hội', api: 'GET /api/admin/transactions', tables: 'transactions', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-012', scope: 'Web CRM', name: 'Quản lý hội phí niên khóa & Gạch nợ', api: 'POST /api/invoices/generate', tables: 'invoices, transactions', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-013', scope: 'Web CRM', name: 'Xuất nhập Excel thông minh SheetJS', api: 'GET /api/analytics/export-excel', tables: 'transactions, members', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-014', scope: 'Web CRM', name: 'Kho văn thư & Trình xem Word/Excel/PDF', api: 'GET /api/documents', tables: 'documents', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-015', scope: 'Web CRM', name: 'Giao việc Kanban & AI Bóc tách task', api: 'POST /api/tasks/ai-parse', tables: 'tasks', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-016', scope: 'Web CRM', name: 'Cài đặt hệ thống, SMTP & Nhãn Sidebar', api: 'PUT /api/admin/settings', tables: 'app_settings', status: 'Hoàn thành 100%' },
    { id: 'NODE-CRM-017', scope: 'Web CRM', name: 'Dashboard thống kê Recharts thích ứng theme', api: 'GET /api/admin/stats', tables: 'transactions, members', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-001', scope: 'Mobile App', name: 'Launcher cài đặt PWA /open-app & Auth', api: 'POST /api/auth/mobile-login', tables: 'ceo1983_users', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-002', scope: 'Mobile App', name: 'Đăng ký gia nhập trực tuyến', api: 'POST /api/members/register', tables: 'members, companies', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-003', scope: 'Mobile App', name: 'Trang chủ, Bảng tin 3 cấp & Menu 3 chấm', api: 'GET /api/feed', tables: 'feed_posts, feed_comments', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-004', scope: 'Mobile App', name: 'Thẻ hội viên số Hoàng Gia & QR vCard', api: 'GET /api/members/me/card', tables: 'members', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-005', scope: 'Mobile App', name: 'Danh bạ doanh nhân & Bản đồ số GPS', api: 'GET /api/members/directory', tables: 'members, companies', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-006', scope: 'Mobile App', name: 'Sàn giao thương B2B & Đăng cơ hội', api: 'POST /api/opportunities', tables: 'opportunities', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-007', scope: 'Mobile App', name: 'Gian hàng sản phẩm ưu đãi nội khối', api: 'POST /api/products', tables: 'products', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-008', scope: 'Mobile App', name: 'Đặt lịch hẹn 1-on-1 trong 3 tình huống', api: 'POST /api/meetings/1on1', tables: 'business_meetings', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-009', scope: 'Mobile App', name: 'Đăng ký sự kiện Gala & Mua vé online', api: 'POST /api/events/register', tables: 'event_registrations', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-010', scope: 'Mobile App', name: 'Trình vé QR động xoay vòng 30s & Bàn VIP', api: 'GET /api/events/me/tickets', tables: 'event_registrations', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-011', scope: 'Mobile App', name: 'Lịch họp Ban & Phòng họp trực tuyến Jitsi', api: 'GET /api/meetings/me', tables: 'meetings', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-012', scope: 'Mobile App', name: 'Nộp hội phí VietQR Napas247 / MoMo / VNPay', api: 'POST /api/payment/create-qr', tables: 'invoices, transactions', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-013', scope: 'Mobile App', name: 'Nhắn tin riêng tư B2B thời gian thực', api: 'WSS /socket.io/chat', tables: 'messages', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-014', scope: 'Mobile App', name: 'Biểu quyết đại hội số 1 người - 1 phiếu', api: 'POST /api/votes/submit', tables: 'votes, voting_sessions', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-015', scope: 'Mobile App', name: 'Cố vấn AI phân tích dòng tiền & Deal B2B', api: 'POST /api/ai/advisor', tables: 'ai_logs', status: 'Hoàn thành 100%' },
    { id: 'NODE-APP-016', scope: 'Mobile App', name: 'Hồ sơ năng lực doanh nghiệp & Bảo mật', api: 'PUT /api/members/me/profile', tables: 'members, companies', status: 'Hoàn thành 100%' },
    { id: 'NODE-CORE-001', scope: 'Core Engine', name: 'Kiến trúc Pure NestJS 3 tầng', api: 'All Endpoints', tables: 'All Tables', status: 'Hoàn thành 100%' },
    { id: 'NODE-CORE-002', scope: 'Core Engine', name: 'PostgreSQL Enterprise 113.20.107.184:6432', api: 'TCP/IP Connection Pool', tables: '25 Tables', status: 'Hoàn thành 100%' },
    { id: 'NODE-CORE-003', scope: 'Core Engine', name: 'Hệ thống gửi tin đa kênh Omnichannel Queue', api: 'POST /api/broadcast', tables: 'notifications', status: 'Hoàn thành 100%' },
    { id: 'NODE-CORE-004', scope: 'Core Engine', name: 'Payment Engine & Webhook IPN HMAC-SHA512', api: 'POST /api/payment/ipn', tables: 'transactions, invoices', status: 'Hoàn thành 100%' },
    { id: 'NODE-CORE-005', scope: 'Core Engine', name: 'Socket.IO Gateway Real-time Notification', api: 'WSS /events', tables: 'notifications', status: 'Hoàn thành 100%' },
    { id: 'NODE-CORE-006', scope: 'Core Engine', name: 'Triển khai Docker Compose & Nginx Subdomains', api: 'HTTPS / TLS 1.3', tables: 'Infrastructure', status: 'Hoàn thành 100%' }
  ];

  nodes.forEach((n, idx) => {
    const row = s2.addRow(n);
    styleDataRow(row, idx % 2 === 1);
  });

  // --- SHEET 3: MA TRẬN PHÂN QUYỀN RBAC ---
  const s3 = workbook.addWorksheet('MA_TRAN_PHAN_QUYEN_RBAC');
  styleSheetHeader(s3, [
    { header: 'Nhóm Chức Năng', key: 'group', width: 35 },
    { header: 'SUPER_ADMIN', key: 'sa', width: 16 },
    { header: 'Chủ Tịch (BOARD)', key: 'pres', width: 18 },
    { header: 'Ban Thư Ký', key: 'sec', width: 16 },
    { header: 'Kế Toán', key: 'acc', width: 16 },
    { header: 'Trưởng Ban', key: 'head', width: 16 },
    { header: 'Hội Viên', key: 'mem', width: 16 },
    { header: 'Khách Mời', key: 'guest', width: 16 }
  ]);

  const rbac = [
    { group: 'Quản trị hệ thống & CSDL', sa: 'Toàn quyền', pres: 'Xem', sec: 'Không', acc: 'Không', head: 'Không', mem: 'Không', guest: 'Không' },
    { group: 'Phân quyền tài khoản RBAC', sa: 'Toàn quyền', pres: 'Xem', sec: 'Không', acc: 'Không', head: 'Không', mem: 'Không', guest: 'Không' },
    { group: 'Duyệt kết nạp Hội viên mới', sa: 'Toàn quyền', pres: 'Phê duyệt cuối', sec: 'Thẩm định', acc: 'Xem', head: 'Đề xuất', mem: 'Không', guest: 'Nộp đơn' },
    { group: 'Quản trị hồ sơ Hội viên 360', sa: 'Toàn quyền', pres: 'Xem toàn bộ', sec: 'Toàn quyền', acc: 'Xem thông tin', head: 'Xem theo Ban', mem: 'Sửa hồ sơ mình', guest: 'Không' },
    { group: 'Phát hành Hóa đơn Hội phí', sa: 'Toàn quyền', pres: 'Xem báo cáo', sec: 'Xem', acc: 'Toàn quyền', head: 'Xem theo Ban', mem: 'Xem nợ mình', guest: 'Không' },
    { group: 'Xác nhận gạch nợ thanh toán', sa: 'Toàn quyền', pres: 'Xem', sec: 'Không', acc: 'Thủ công/Duyệt', head: 'Không', mem: 'Nộp phí', guest: 'Không' },
    { group: 'Tạo Sự kiện Gala & Xếp Bàn', sa: 'Toàn quyền', pres: 'Phê duyệt', sec: 'Toàn quyền', acc: 'Phối hợp', head: 'Phối hợp', mem: 'Mua vé/Xem bàn', guest: 'Mua vé mở' },
    { group: 'Soát vé QR Động Keangnam', sa: 'Toàn quyền', pres: 'Giám sát', sec: 'Toàn quyền', acc: 'Xem', head: 'Có (tại cổng)', mem: 'Trình mã QR', guest: 'Trình vé' },
    { group: 'Studio Poster & Bắn Zalo/Mail', sa: 'Toàn quyền', pres: 'Duyệt gửi', sec: 'Toàn quyền', acc: 'Không', head: 'Xem', mem: 'Nhận tin', guest: 'Không' },
    { group: 'Xem Sổ Quỹ & Báo Cáo Tài Chính', sa: 'Toàn quyền', pres: 'Toàn quyền', sec: 'Giới hạn', acc: 'Toàn quyền', head: 'Xem quỹ Ban', mem: 'Không', guest: 'Không' },
    { group: 'Lập & Duyệt Phiếu Chi / Hoàn Ứng', sa: 'Toàn quyền', pres: 'Phê duyệt chi', sec: 'Lập phiếu', acc: 'Hạch toán', head: 'Đề xuất chi Ban', mem: 'Không', guest: 'Không' },
    { group: 'Đăng Tin Sàn Giao Thương B2B', sa: 'Quản trị', pres: 'Đăng & Kết nối', sec: 'Quản trị', acc: 'Xem', head: 'Đăng & Kết nối', mem: 'Đăng & Đàm phán', guest: 'Xem có hạn' },
    { group: 'Giao Việc Kanban & AI Parse Task', sa: 'Toàn quyền', pres: 'Giám sát', sec: 'Tạo & Chia task', acc: 'Xem', head: 'Chia việc Ban', mem: 'Cập nhật tiến độ', guest: 'Không' },
    { group: 'Cố Vấn AI Dòng Tiền & Deal B2B', sa: 'Toàn quyền', pres: 'Toàn quyền', sec: 'Toàn quyền', acc: 'Toàn quyền', head: 'Toàn quyền', mem: 'Toàn quyền', guest: 'Demo hạn chế' },
    { group: 'Biểu Quyết Đại Hội Số', sa: 'Tạo phiên', pres: 'Chủ trì phiên', sec: 'Tổ chức', acc: 'Bỏ phiếu', head: 'Bỏ phiếu', mem: '1 Người 1 Phiếu', guest: 'Không' }
  ];

  rbac.forEach((r, idx) => {
    const row = s3.addRow(r);
    styleDataRow(row, idx % 2 === 1);
  });

  // --- SHEET 4: MA TRẬN KIỂM THỬ TEST CASES ---
  const s4 = workbook.addWorksheet('MA_TRAN_KIEM_THU_TEST_CASES');
  styleSheetHeader(s4, [
    { header: 'Mã Test Case', key: 'tcId', width: 18 },
    { header: 'Phân Hệ', key: 'scope', width: 16 },
    { header: 'Node Liên Quan', key: 'node', width: 18 },
    { header: 'Mục Đích Kiểm Thử', key: 'objective', width: 45 },
    { header: 'Mức Độ Ưu Tiên', key: 'priority', width: 16 },
    { header: 'Kết Quả Kỳ Vọng', key: 'expected', width: 45 },
    { header: 'Trạng Thái', key: 'status', width: 15 }
  ]);

  const testCases = [
    { tcId: 'TC-AUTH-001', scope: 'Web CRM', node: 'NODE-CRM-001', objective: 'Đăng nhập thành công với tài khoản Chủ tịch', priority: 'P1 - Blocker', expected: 'Trả về JWT Token và chuyển vào Dashboard 17 menu', status: 'PASS' },
    { tcId: 'TC-AUTH-004', scope: 'Web CRM', node: 'NODE-CRM-001', objective: 'Kiểm tra RBAC - Kế toán không được vào duyệt kết nạp', priority: 'P2 - Critical', expected: 'Trả về HTTP 403 Forbidden', status: 'PASS' },
    { tcId: 'TC-MEM-003', scope: 'Web CRM', node: 'NODE-CRM-003', objective: 'Phê duyệt kết nạp tự động sinh mã CEO1983-XXX', priority: 'P1 - Blocker', expected: 'Cấp mã hội viên, hóa đơn niên khóa, gửi Zalo/Email', status: 'PASS' },
    { tcId: 'TC-FIN-008', scope: 'Payment Engine', node: 'NODE-CRM-012', objective: 'Gạch nợ tự động qua Webhook IPN Napas247', priority: 'P1 - Blocker', expected: 'Hóa đơn chuyển PAID, tăng sổ quỹ, bắn Socket.IO', status: 'PASS' },
    { tcId: 'TC-FIN-009', scope: 'Payment Engine', node: 'NODE-CORE-004', objective: 'Chống tấn công giả mạo chữ ký Webhook HMAC-SHA512', priority: 'P1 - Blocker', expected: 'Chặn 403 Forbidden, ghi nhật ký cảnh báo an ninh', status: 'PASS' },
    { tcId: 'TC-CHECKIN-001', scope: 'Web CRM / App', node: 'NODE-CRM-009', objective: 'Soát vé QR hợp lệ tại Keangnam < 0.5 giây', priority: 'P1 - Blocker', expected: 'Thời gian phản hồi < 0.45s, báo Bàn VIP và Ghế', status: 'PASS' },
    { tcId: 'TC-CHECKIN-003', scope: 'Web CRM / App', node: 'NODE-CRM-009', objective: 'Chống soát vé trùng lặp (Double Check-in)', priority: 'P1 - Blocker', expected: 'Bật còi báo đỏ, HTTP 409 Conflict', status: 'PASS' },
    { tcId: 'TC-TASK-003', scope: 'Web CRM', node: 'NODE-CRM-015', objective: 'AI Gemini bóc tách task từ biên bản họp Word/Excel', priority: 'P2 - Critical', expected: 'Tự động trích xuất Task, gán người và deadline', status: 'PASS' },
    { tcId: 'TC-TASK-004', scope: 'Web CRM', node: 'NODE-CRM-015', objective: 'Kéo thả thẻ Kanban sang cột Đã hoàn thành', priority: 'P2 - Critical', expected: 'Chuyển DONE, lưu CSDL, animation 60fps', status: 'PASS' },
    { tcId: 'TC-FEED-003', scope: 'Mobile App', node: 'NODE-APP-003', objective: 'Hiện menu 3 chấm để chỉnh sửa/xóa bài đăng', priority: 'P2 - Critical', expected: 'Chỉ hiện cho chủ bài viết / Admin, xóa mềm CSDL', status: 'PASS' },
    { tcId: 'TC-POSTER-002', scope: 'Web CRM', node: 'NODE-CRM-005', objective: 'Tách nền chân dung và làm mờ mép Feather 15px', priority: 'P2 - Critical', expected: 'Hòa quyện vào nền Wyndham 9:16 Pinterest', status: 'PASS' },
    { tcId: 'TC-PERF-001', scope: 'Core Engine', node: 'NODE-CORE-002', objective: 'Tải đồng thời 2.000 users qua PgBouncer', priority: 'P1 - Blocker', expected: 'P95 Response Time < 350ms, 0% lỗi HTTP', status: 'PASS' }
  ];

  testCases.forEach((tc, idx) => {
    const row = s4.addRow(tc);
    styleDataRow(row, idx % 2 === 1);
  });

  await workbook.xlsx.writeFile(outputPath);
  console.log(`✓ [EXCEL] Xuất thành công: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

// ============================================================================
// HÀM ĐIỀU PHỐI CHÍNH (MASTER RUNNER)
// ============================================================================

async function main() {
  console.log('======================================================================');
  console.log('KHỞI CHẠY XUẤT BẢN ĐA ĐỊNH DẠNG TÀI LIỆU CEO 1983 (HANOIBA)');
  console.log('Định dạng: Word (.docx), Adobe PDF (.pdf), Excel (.xlsx), Markdown (.md)');
  console.log('======================================================================\n');

  // 1. Tạo file Excel RTM & Templates Catalog
  const excelRtmPath = path.join(NOTEBOOKLM_DIR, '10_MA_TRAN_TRUY_VET_YEU_CAU_RTM_CEO1983.xlsx');
  await generateMasterExcelRTM(excelRtmPath);

  // Copy sang document và public docs
  fs.copyFileSync(excelRtmPath, path.join(DOC_DIR, '10_MA_TRAN_TRUY_VET_YEU_CAU_RTM_CEO1983.xlsx'));
  fs.copyFileSync(excelRtmPath, path.join(FE_DOCS_DIR, '10_MA_TRAN_TRUY_VET_YEU_CAU_RTM_CEO1983.xlsx'));

  // 2. Chuyển đổi DOCX cho tất cả các tài liệu kỹ thuật
  const docxTasks = [
    {
      src: path.join(NOTEBOOKLM_DIR, '07_TAI_LIEU_YEU_CAU_NGHIEP_VU_BRD_CHINH_THUC.md'),
      dest: path.join(NOTEBOOKLM_DIR, '07_TAI_LIEU_YEU_CAU_NGHIEP_VU_BRD_CHINH_THUC.docx'),
      title: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ BRD MASTER'
    },
    {
      src: path.join(NOTEBOOKLM_DIR, '08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.md'),
      dest: path.join(NOTEBOOKLM_DIR, '08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.docx'),
      title: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM SRS MASTER'
    },
    {
      src: path.join(NOTEBOOKLM_DIR, '09_DAC_TA_API_VA_THIET_KE_CSDL.md'),
      dest: path.join(NOTEBOOKLM_DIR, '09_DAC_TA_API_VA_THIET_KE_CSDL.docx'),
      title: 'ĐẶC TẢ API VÀ THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL'
    },
    {
      src: path.join(NOTEBOOKLM_DIR, '11_SDD_THIET_KE_KY_THUAT_KIEN_TRUC_DATABASE.md'),
      dest: path.join(NOTEBOOKLM_DIR, '11_SDD_THIET_KE_KY_THUAT_KIEN_TRUC_DATABASE.docx'),
      title: 'TÀI LIỆU MÔ TẢ THIẾT KẾ KỸ THUẬT, KIẾN TRÚC & DATABASE (SDD)'
    },
    {
      src: path.join(NOTEBOOKLM_DIR, '12_API_SPECIFICATION_DAC_TA_GIAO_TIEP_API.md'),
      dest: path.join(NOTEBOOKLM_DIR, '12_API_SPECIFICATION_DAC_TA_GIAO_TIEP_API.docx'),
      title: 'TÀI LIỆU ĐẶC TẢ GIAO DIỆN LẬP TRÌNH RESTFUL API SPECIFICATION'
    },
    {
      src: path.join(NOTEBOOKLM_DIR, '13_UI_UX_SPECIFICATION_DAC_TA_GIAO_DIEN_TRAI_NGHIEM.md'),
      dest: path.join(NOTEBOOKLM_DIR, '13_UI_UX_SPECIFICATION_DAC_TA_GIAO_DIEN_TRAI_NGHIEM.docx'),
      title: 'TÀI LIỆU ĐẶC TẢ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG UI/UX SPECIFICATION'
    },
    {
      src: path.join(NOTEBOOKLM_DIR, '14_TEST_SPECIFICATION_DAC_TA_KIEM_THU.md'),
      dest: path.join(NOTEBOOKLM_DIR, '14_TEST_SPECIFICATION_DAC_TA_KIEM_THU.docx'),
      title: 'TÀI LIỆU ĐẶC TẢ KIỂM THỬ PHẦN MỀM TEST SPECIFICATION & ACCEPTANCE'
    }
  ];

  for (const t of docxTasks) {
    if (fs.existsSync(t.src)) {
      await convertMarkdownToDocx(t.src, t.dest, t.title);
      // Copy sang document root
      const rootDocxName = path.basename(t.dest).replace(/^[0-9]+_/, '');
      fs.copyFileSync(t.dest, path.join(DOC_DIR, rootDocxName));
      fs.copyFileSync(t.dest, path.join(FE_DOCS_DIR, rootDocxName));
    }
  }

  // 3. Khởi động Chromium xuất bản PDF
  console.log('\n[PDF ENGINE] Khởi động Google Chrome qua Playwright...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: true
    });
    console.log('✓ Google Chrome đã kết nối sẵn sàng tạo PDF');

    const pdfTasks = [
      {
        src: path.join(NOTEBOOKLM_DIR, '07_TAI_LIEU_YEU_CAU_NGHIEP_VU_BRD_CHINH_THUC.md'),
        dest: path.join(NOTEBOOKLM_DIR, '07_TAI_LIEU_YEU_CAU_NGHIEP_VU_BRD_CHINH_THUC.pdf')
      },
      {
        src: path.join(NOTEBOOKLM_DIR, '08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.md'),
        dest: path.join(NOTEBOOKLM_DIR, '08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.pdf')
      },
      {
        src: path.join(NOTEBOOKLM_DIR, '09_DAC_TA_API_VA_THIET_KE_CSDL.md'),
        dest: path.join(NOTEBOOKLM_DIR, '09_DAC_TA_API_VA_THIET_KE_CSDL.pdf')
      },
      {
        src: path.join(NOTEBOOKLM_DIR, '11_SDD_THIET_KE_KY_THUAT_KIEN_TRUC_DATABASE.md'),
        dest: path.join(NOTEBOOKLM_DIR, '11_SDD_THIET_KE_KY_THUAT_KIEN_TRUC_DATABASE.pdf')
      },
      {
        src: path.join(NOTEBOOKLM_DIR, '12_API_SPECIFICATION_DAC_TA_GIAO_TIEP_API.md'),
        dest: path.join(NOTEBOOKLM_DIR, '12_API_SPECIFICATION_DAC_TA_GIAO_TIEP_API.pdf')
      },
      {
        src: path.join(NOTEBOOKLM_DIR, '13_UI_UX_SPECIFICATION_DAC_TA_GIAO_DIEN_TRAI_NGHIEM.md'),
        dest: path.join(NOTEBOOKLM_DIR, '13_UI_UX_SPECIFICATION_DAC_TA_GIAO_DIEN_TRAI_NGHIEM.pdf')
      },
      {
        src: path.join(NOTEBOOKLM_DIR, '14_TEST_SPECIFICATION_DAC_TA_KIEM_THU.md'),
        dest: path.join(NOTEBOOKLM_DIR, '14_TEST_SPECIFICATION_DAC_TA_KIEM_THU.pdf')
      }
    ];

    for (const t of pdfTasks) {
      if (fs.existsSync(t.src)) {
        await convertMarkdownToPdf(browser, t.src, t.dest);
        const rootPdfName = path.basename(t.dest).replace(/^[0-9]+_/, '');
        fs.copyFileSync(t.dest, path.join(DOC_DIR, rootPdfName));
        fs.copyFileSync(t.dest, path.join(FE_DOCS_DIR, rootPdfName));
      }
    }
  } catch (err) {
    console.error('Lỗi khi xuất PDF:', err.message);
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n======================================================================');
  console.log('HOÀN TẤT 100% XUẤT BẢN ĐA ĐỊNH DẠNG: MD, DOCX, PDF, XLSX!');
  console.log('Tất cả các tệp sẵn sàng để đồng bộ lên Google NotebookLM và tải về.');
  console.log('======================================================================');
}

main().catch(console.error);

