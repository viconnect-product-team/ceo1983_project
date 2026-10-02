// scripts/build_master_suite_v3.js
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TableOfContents,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  ImageRun,
  PageBreak,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIONE_DOC_DIR = path.join(ROOT_DIR, '..', 'vione_project', 'document');
const CEO_DOC_DIR = path.join(ROOT_DIR, 'document');
const EVIDENCE_DIR = path.join(CEO_DOC_DIR, 'images', 'evidence');

const FE_DOCS_DIRS = [
  path.join(ROOT_DIR, '..', 'vione_project', 'apps', 'vione_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'vione_app_fe', 'public', 'docs'),
  VIONE_DOC_DIR,
  CEO_DOC_DIR
];

FE_DOCS_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT_FAMILY = 'Times New Roman';
const COLOR_GOLD = 'D97706';
const COLOR_NAVY = '0F172A';
const COLOR_AMBER = 'B45309';
const COLOR_DARK = '1E293B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '0F172A';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200;

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createParagraph(text, opts = {}) {
  const lines = String(text || '').split('\n');
  const children = [];
  lines.forEach((line, idx) => {
    children.push(
      new TextRun({
        text: line,
        break: idx > 0 ? 1 : 0,
        font: FONT_FAMILY,
        size: opts.size || 24, // 12pt
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COLOR_DARK,
      })
    );
  });
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: opts.spacing || { before: 80, after: 80, line: 276 },
    children,
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 32, // 16pt
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: COLOR_AMBER,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 25, // 12.5pt
        bold: true,
        color: COLOR_GOLD,
      }),
    ],
  });
}

function createBullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 23, // 11.5pt
        color: COLOR_DARK,
      }),
    ],
  });
}

function createTable(headers, rows, colWidths = []) {
  let finalColWidths = colWidths;
  if (!finalColWidths || finalColWidths.length === 0) {
    const colCount = headers.length;
    const avgWidth = Math.floor(TABLE_WIDTH_DXA / colCount);
    finalColWidths = Array(colCount).fill(avgWidth);
  }

  const tableRows = [];

  // Header Row
  const headerCells = headers.map((h, idx) => {
    return new TableCell({
      width: { size: finalColWidths[idx], type: WidthType.DXA },
      shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
      borders: BORDER_STYLE_THIN,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: FONT_FAMILY,
              size: 22, // 11pt
              bold: true,
              color: 'FFFFFF',
            }),
          ],
        }),
      ],
    });
  });
  tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

  // Data Rows
  rows.forEach((row, rIdx) => {
    const isAlt = rIdx % 2 === 1;
    const cells = row.map((cellText, cIdx) => {
      const isBold = cIdx === 0 && headers.length > 2;
      return new TableCell({
        width: { size: finalColWidths[cIdx], type: WidthType.DXA },
        shading: { fill: isAlt ? COLOR_BG_ALT : 'FFFFFF', type: ShadingType.CLEAR },
        borders: BORDER_STYLE_THIN,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(cellText || ''),
                font: FONT_FAMILY,
                size: 21, // 10.5pt
                bold: isBold,
                color: COLOR_DARK,
              }),
            ],
          }),
        ],
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: finalColWidths,
    rows: tableRows,
  });
}

function createImageParagraph(imgFileName, captionText, defaultWidth = 520, defaultHeight = 290) {
  if (!imgFileName) return [];
  const p = path.join(EVIDENCE_DIR, imgFileName);
  if (!fs.existsSync(p)) return [];

  try {
    const imgBuffer = fs.readFileSync(p);

    let realWidth = 0;
    let realHeight = 0;
    if (imgBuffer.length > 24 && imgBuffer.toString('ascii', 12, 16) === 'IHDR') {
      realWidth = imgBuffer.readUInt32BE(16);
      realHeight = imgBuffer.readUInt32BE(20);
    }

    let finalW = defaultWidth;
    let finalH = defaultHeight;

    if (realWidth > 0 && realHeight > 0) {
      const isMobileRatio = realHeight > realWidth * 1.3;
      if (isMobileRatio) {
        finalW = 240;
        finalH = Math.min(480, Math.floor((240 / realWidth) * realHeight));
      } else {
        finalW = 540;
        finalH = Math.min(320, Math.floor((540 / realWidth) * realHeight));
      }
    }

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 60 },
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: {
              width: finalW,
              height: finalH,
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 180 },
        children: [
          new TextRun({
            text: `[Hình Ảnh Minh Chứng] ${captionText}`,
            font: FONT_FAMILY,
            size: 20, // 10pt
            italics: true,
            color: '64748B',
          }),
        ],
      }),
    ];
  } catch (err) {
    return [];
  }
}

function syncToAllDirs(fileName, bufferOrString) {
  FE_DOCS_DIRS.forEach(d => {
    const target = path.join(d, fileName);
    fs.writeFileSync(target, bufferOrString);
  });
}

console.log('Doc base utilities loaded successfully');

module.exports = {
  createParagraph,
  createHeading1,
  createHeading2,
  createHeading3,
  createBullet,
  createTable,
  createImageParagraph,
  syncToAllDirs,
  FONT_FAMILY,
  COLOR_NAVY,
  COLOR_GOLD,
  COLOR_AMBER,
  COLOR_DARK,
  VIONE_DOC_DIR,
  CEO_DOC_DIR,
  EVIDENCE_DIR
};
