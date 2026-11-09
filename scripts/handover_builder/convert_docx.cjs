/**
/**
 * CONVERT DOCX MODULE - ENTERPRISE EDITION V10.0
 * Converts Markdown to Microsoft Word (.docx) format using docx library (^9.7.1)
 * Standard A4 layout, Royal HanoiBA Cover Page, Styled Tables, Smart Auto-Width,
 * Callout Boxes for Process Flows & Code Blocks, Crisp Typography, Header & Footer.
 * 
 * FIXES PREVIOUS ISSUES:
 * 1. No more broken diagrams: Multi-line code/flow blocks are converted to styled Callout Tables
 *    with line-by-line TextRuns (with break) and Consolas font, preventing Word layout corruption.
 * 2. Smart Column Widths: Table columns are weighted by character length instead of flat equal widths,
 *    giving narrow columns (STT, Mã, Bước) ~10-15% and content columns (Mô tả, Hành động) ~35-50%.
 * 3. Page Breaks & Headings: Clean spacing, no orphan headings, cantSplit rows on tables.
 */

const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  PageBreak
} = docx;

const FONT_FAMILY = 'Times New Roman';
const CODE_FONT = 'Consolas';

const COLORS = {
  NAVY: '003B95',
  GOLD: 'D97706',
  DARK_GOLD: '8A6508',
  DARK_SLATE: '1E293B',
  MUTED_SLATE: '64748B',
  BORDER_COLOR: 'CBD5E1',
  BG_LIGHT: 'F8FAFC',
  BG_HEADER: '003B95',
  WHITE: 'FFFFFF',
  ACCENT_BORDER: '003B95'
};

const TABLE_WIDTH_DXA = 9026; // A4 printable width in dxa

const TABLE_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR }
};

function parseInlineMarkdown(text, baseOptions = {}) {
  if (!text) return [new TextRun({ text: '', font: FONT_FAMILY, ...baseOptions })];

  const runs = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push(new TextRun({
        text: text.slice(lastIdx, match.index),
        font: FONT_FAMILY,
        ...baseOptions
      }));
    }

    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**')) {
      runs.push(new TextRun({
        text: raw.slice(2, -2),
        bold: true,
        font: FONT_FAMILY,
        ...baseOptions
      }));
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      runs.push(new TextRun({
        text: raw.slice(1, -1),
        italics: true,
        font: FONT_FAMILY,
        ...baseOptions
      }));
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      runs.push(new TextRun({
        text: raw.slice(1, -1),
        font: CODE_FONT,
        color: COLORS.DARK_GOLD,
        bold: true,
        size: (baseOptions.size || 22) - 2
      }));
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    runs.push(new TextRun({
      text: text.slice(lastIdx),
      font: FONT_FAMILY,
      ...baseOptions
    }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text: '', font: FONT_FAMILY, ...baseOptions })];
}

/**
 * Calculates smart column widths based on maximum content length in each column
 */
function calculateSmartColumnWidths(headerCols, dataRows) {
  const colCount = headerCols.length;
  if (colCount === 0) return [];

  // Calculate length weights
  const maxLen = new Array(colCount).fill(0);
  for (let c = 0; c < colCount; c++) {
    maxLen[c] = (headerCols[c] || '').length * 1.5;
  }

  for (const row of dataRows) {
    for (let c = 0; c < colCount; c++) {
      const cellLen = (row[c] || '').length;
      if (cellLen > maxLen[c]) {
        maxLen[c] = cellLen;
      }
    }
  }

  // Bound weights: Min 8%, Max 50%
  const clampedWeights = maxLen.map(l => Math.min(Math.max(Math.sqrt(l), 3), 18));
  const totalWeight = clampedWeights.reduce((a, b) => a + b, 0);

  let allocatedDxa = 0;
  const colWidthsDxa = [];

  for (let c = 0; c < colCount; c++) {
    if (c === colCount - 1) {
      colWidthsDxa.push(TABLE_WIDTH_DXA - allocatedDxa);
    } else {
      const w = Math.round((clampedWeights[c] / totalWeight) * TABLE_WIDTH_DXA);
      colWidthsDxa.push(w);
      allocatedDxa += w;
    }
  }

  return colWidthsDxa;
}

function createWordTable(tableLines) {
  if (tableLines.length < 2) return null;
  const headerCols = tableLines[0].split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  const dataRows = [];

  for (let i = 2; i < tableLines.length; i++) {
    const cols = tableLines[i].split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (cols.length > 0) dataRows.push(cols);
  }

  const colCount = headerCols.length;
  if (colCount === 0) return null;

  const colWidthsDxa = calculateSmartColumnWidths(headerCols, dataRows);

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headerCols.map((c, idx) => new TableCell({
      width: { size: colWidthsDxa[idx], type: WidthType.DXA },
      shading: { fill: COLORS.BG_HEADER, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 130, right: 130 },
      borders: TABLE_BORDER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: c,
              font: FONT_FAMILY,
              size: 20,
              bold: true,
              color: COLORS.WHITE
            })
          ]
        })
      ]
    }))
  });

  const bodyRows = dataRows.map((row, rIdx) => new TableRow({
    cantSplit: true,
    children: headerCols.map((_, cIdx) => {
      const cellText = row[cIdx] || '';
      const isShortCol = colWidthsDxa[cIdx] < 1200;
      return new TableCell({
        width: { size: colWidthsDxa[cIdx], type: WidthType.DXA },
        shading: rIdx % 2 === 1 ? { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR } : undefined,
        margins: { top: 100, bottom: 100, left: 130, right: 130 },
        borders: TABLE_BORDER,
        children: [
          new Paragraph({
            alignment: isShortCol ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: parseInlineMarkdown(cellText, { size: 20, color: COLORS.DARK_SLATE })
          })
        ]
      });
    })
  }));

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    rows: [headerRow, ...bodyRows]
  });
}

/**
 * Creates an elegant Callout Table for Process Flows, Code Blocks, and System Diagrams
 * Prevents text run newline collapse bug in Word.
 */
function createCalloutBox(lines, options = {}) {
  const isDiagram = options.isDiagram || false;
  const borderAccentColor = isDiagram ? COLORS.GOLD : COLORS.NAVY;

  const paragraphs = lines.map((l, idx) => {
    const isArrowLine = l.includes('➔') || l.includes('->') || l.includes('-->') || l.includes('──');
    return new Paragraph({
      spacing: { before: 20, after: 20, line: 220 },
      children: [
        new TextRun({
          text: l || ' ',
          font: isDiagram ? FONT_FAMILY : CODE_FONT,
          size: isDiagram ? 19 : 17,
          bold: isArrowLine,
          color: isArrowLine ? COLORS.NAVY : COLORS.DARK_SLATE
        })
      ]
    });
  });

  const calloutCell = new TableCell({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 200, right: 180 },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: borderAccentColor }, // 3pt thick accent border
      top: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 2, color: COLORS.BORDER_COLOR }
    },
    children: paragraphs
  });

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    rows: [new TableRow({ children: [calloutCell] })]
  });
}

function createCoverPageElements(docInfo) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: 'HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: COLORS.NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'CLB DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: COLORS.GOLD
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 500 },
      children: [
        new TextRun({
          text: '❖  ❖  ❖',
          font: FONT_FAMILY,
          size: 26,
          color: COLORS.GOLD
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 180 },
      children: [
        new TextRun({
          text: docInfo.systemName || docInfo.title,
          font: FONT_FAMILY,
          size: 32,
          bold: true,
          color: COLORS.NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: docInfo.subTitle || '',
          font: FONT_FAMILY,
          size: 22,
          italics: true,
          color: COLORS.MUTED_SLATE
        })
      ]
    }),

    // Meta Table
    new Table({
      width: { size: 7500, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Mã Tài Liệu', bold: true, font: FONT_FAMILY, size: 20, color: COLORS.NAVY })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: docInfo.docCode || 'DOC-CEO1983', bold: true, font: FONT_FAMILY, size: 20 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Phiên Bản', bold: true, font: FONT_FAMILY, size: 20, color: COLORS.NAVY })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: docInfo.version || 'Version 10.0 Toàn Diện', font: FONT_FAMILY, size: 20 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Cơ Quan Chủ Quản', bold: true, font: FONT_FAMILY, size: 20, color: COLORS.NAVY })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'CLB Doanh Nhân CEO 1983 (HanoiBA)', font: FONT_FAMILY, size: 20 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Đơn Vị Phát Triển', bold: true, font: FONT_FAMILY, size: 20, color: COLORS.NAVY })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'VICONNECT - Chuyển Đổi Số Hiệp Hội', font: FONT_FAMILY, size: 20 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: 'Trạng Thái', bold: true, font: FONT_FAMILY, size: 20, color: COLORS.NAVY })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: TABLE_BORDER,
              children: [new Paragraph({ children: [new TextRun({ text: '✓ ĐÃ THẨM ĐỊNH & NGHIỆM THU CHÍNH THỨC', bold: true, font: FONT_FAMILY, size: 20, color: '16A34A' })] })]
            })
          ]
        })
      ]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 0 },
      children: [
        new TextRun({
          text: 'Lưu hành nội bộ Ban Lãnh Đạo CLB Doanh Nhân CEO 1983 & Doanh Nghiệp Hội Viên',
          italics: true,
          font: FONT_FAMILY,
          size: 18,
          color: COLORS.MUTED_SLATE
        })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

async function convertMarkdownToDocx(mdText, docInfo, outputFilePath) {
  const lines = mdText.split(/\r?\n/);
  const docChildren = [...createCoverPageElements(docInfo)];

  let inTable = false;
  let tableBuffer = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks / Mermaid
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block -> Flush into elegant Callout Box
        const isMermaid = codeBlockLang.toLowerCase().includes('mermaid') || codeBuffer.some(l => l.includes('graph ') || l.includes('sequenceDiagram'));
        const callout = createCalloutBox(codeBuffer, { isDiagram: isMermaid });
        docChildren.push(callout);

        inCodeBlock = false;
        codeBuffer = [];
        codeBlockLang = '';
      } else {
        if (inTable && tableBuffer.length > 0) {
          const t = createWordTable(tableBuffer);
          if (t) docChildren.push(t);
          inTable = false;
          tableBuffer = [];
        }
        inCodeBlock = true;
        codeBuffer = [];
        codeBlockLang = trimmed.replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableBuffer = [];
      }
      tableBuffer.push(trimmed);
      continue;
    } else {
      if (inTable && tableBuffer.length > 0) {
        const t = createWordTable(tableBuffer);
        if (t) docChildren.push(t);
        inTable = false;
        tableBuffer = [];
      }
    }

    // Skip divider line
    if (trimmed === '---' || trimmed === '***') {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 120 },
        children: [new TextRun({ text: line.substring(2), font: FONT_FAMILY, size: 30, bold: true, color: COLORS.NAVY })]
      }));
      continue;
    }
    if (line.startsWith('## ')) {
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: line.substring(3), font: FONT_FAMILY, size: 26, bold: true, color: COLORS.GOLD })]
      }));
      continue;
    }
    if (line.startsWith('### ')) {
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 60 },
        children: [new TextRun({ text: line.substring(4), font: FONT_FAMILY, size: 24, bold: true, color: COLORS.NAVY })]
      }));
      continue;
    }
    if (line.startsWith('#### ')) {
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 140, after: 50 },
        children: [new TextRun({ text: line.substring(5), font: FONT_FAMILY, size: 22, bold: true, italics: true, color: COLORS.DARK_SLATE })]
      }));
      continue;
    }

    // Process Flow Banner (e.g. `[1. Đăng ký] ➔ [2. Duyệt] ➔ [3. Cấp thẻ]`)
    if (line.includes('➔') && (line.startsWith('*') || line.startsWith('`') || line.startsWith('['))) {
      const bannerBox = createCalloutBox([trimmed.replace(/^\*+|\*+$/g, '')], { isDiagram: true });
      docChildren.push(bannerBox);
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (bulletMatch) {
      docChildren.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30, line: 250 },
        children: parseInlineMarkdown(bulletMatch[2], { size: 21, color: COLORS.DARK_SLATE })
      }));
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (numMatch) {
      docChildren.push(new Paragraph({
        spacing: { before: 30, after: 30, line: 250 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: numMatch[0].split('.')[0] + '. ', bold: true, font: FONT_FAMILY, size: 21, color: COLORS.NAVY }),
          ...parseInlineMarkdown(numMatch[2], { size: 21, color: COLORS.DARK_SLATE })
        ]
      }));
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      docChildren.push(new Paragraph({
        spacing: { before: 60, after: 60, line: 250 },
        indent: { left: 400 },
        shading: { fill: COLORS.BG_LIGHT, type: ShadingType.CLEAR },
        children: parseInlineMarkdown(line.replace(/^>\s?/, ''), { size: 20, italics: true, color: COLORS.MUTED_SLATE })
      }));
      continue;
    }

    // Normal paragraph
    if (trimmed.length > 0) {
      docChildren.push(new Paragraph({
        spacing: { before: 50, after: 50, line: 250 },
        alignment: AlignmentType.JUSTIFIED,
        children: parseInlineMarkdown(line, { size: 21, color: COLORS.DARK_SLATE })
      }));
    }
  }

  // Flush remaining table
  if (inTable && tableBuffer.length > 0) {
    const t = createWordTable(tableBuffer);
    if (t) docChildren.push(t);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_FAMILY, size: 22, color: COLORS.DARK_SLATE },
          paragraph: { spacing: { line: 250 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 standard
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 120 },
                children: [
                  new TextRun({
                    text: 'HỆ SINH THÁI SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)',
                    italics: true,
                    size: 17,
                    color: COLORS.MUTED_SLATE,
                    font: FONT_FAMILY
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
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 120, after: 0 },
                children: [
                  new TextRun({
                    text: 'BẢO MẬT & LƯU HÀNH NỘI BỘ - BAN LÃNH ĐẠO CLB CEO 1983          ',
                    italics: true,
                    size: 17,
                    color: COLORS.MUTED_SLATE,
                    font: FONT_FAMILY
                  }),
                  new TextRun({ text: 'Trang ', size: 17, color: COLORS.MUTED_SLATE, font: FONT_FAMILY }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 17, bold: true, color: COLORS.NAVY, font: FONT_FAMILY }),
                  new TextRun({ text: ' / ', size: 17, color: COLORS.MUTED_SLATE, font: FONT_FAMILY }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, bold: true, color: COLORS.NAVY, font: FONT_FAMILY })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  console.log(`✓ Đã xuất DOCX thành công: ${outputFilePath} (${(fs.statSync(outputFilePath).size / 1024).toFixed(1)} KB)`);
}

module.exports = { convertMarkdownToDocx };
