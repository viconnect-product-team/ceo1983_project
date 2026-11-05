/**
 * GENERATE V7.0 DOCX (MICROSOFT WORD) FOR SRS & BRD
 * Chuẩn hóa tài liệu Word không bị lỗi "Table Properties"
 * Thiết kế chuẩn nhận diện CEO 1983: Deep Cobalt Navy (#1F3864), Amber Gold (#B8860B)
 * Khổ giấy A4, Font Times New Roman, Bảng biểu chuẩn OpenXML ISO/IEC 29500
 */

const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document,
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
  PageBreak,
  Packer
} = docx;

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');

const TOTAL_TABLE_WIDTH = 9026;

const COLORS = {
  NAVY: '1F3864',
  GOLD: 'B8860B',
  DARK_GOLD: '8A6508',
  DARK_SLATE: '1E293B',
  MUTED_SLATE: '64748B',
  BORDER_COLOR: 'CBD5E1',
  BG_LIGHT: 'F8FAFC',
  BG_ZEBRA: 'F1F5F9',
  WHITE: 'FFFFFF',
  ACCENT_BLUE: '2563EB',
  CALLOUT_BG: 'FEF3C7'
};

const TABLE_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR }
};

function parseInlineMarkdown(text, baseOptions = {}) {
  if (!text) return [new TextRun({ text: '', font: 'Times New Roman', ...baseOptions })];

  const runs = [];
  const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push(new TextRun({
        text: text.slice(lastIdx, match.index),
        font: 'Times New Roman',
        ...baseOptions
      }));
    }

    const raw = match[0];
    if (raw.startsWith('***') && raw.endsWith('***')) {
      runs.push(new TextRun({
        text: raw.slice(3, -3),
        bold: true,
        italics: true,
        font: 'Times New Roman',
        ...baseOptions
      }));
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      runs.push(new TextRun({
        text: raw.slice(2, -2),
        bold: true,
        font: 'Times New Roman',
        ...baseOptions
      }));
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      runs.push(new TextRun({
        text: raw.slice(1, -1),
        italics: true,
        font: 'Times New Roman',
        ...baseOptions
      }));
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      runs.push(new TextRun({
        text: raw.slice(1, -1),
        font: 'Consolas',
        size: (baseOptions.size || 20) - 2,
        color: COLORS.NAVY
      }));
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    runs.push(new TextRun({
      text: text.slice(lastIdx),
      font: 'Times New Roman',
      ...baseOptions
    }));
  }

  return runs;
}

function createWordTable(tableLines) {
  if (tableLines.length < 2) return null;
  const validRows = tableLines.filter(line => !line.match(/^\|\s*[:\-\s|]+\|$/));
  if (validRows.length === 0) return null;

  const parsedRows = validRows.map(line => {
    return line.split('|').slice(1, -1).map(cell => cell.trim());
  });

  const colCount = Math.max(...parsedRows.map(r => r.length));
  if (colCount === 0) return null;

  let colWidthsDxa = [];
  if (colCount === 2) {
    colWidthsDxa = [2500, 6526];
  } else if (colCount === 3) {
    colWidthsDxa = [1800, 3200, 4026];
  } else if (colCount === 4) {
    colWidthsDxa = [1500, 2500, 2500, 2526];
  } else if (colCount === 5) {
    colWidthsDxa = [1200, 2000, 2000, 2000, 1826];
  } else {
    const w = Math.floor(TOTAL_TABLE_WIDTH / colCount);
    colWidthsDxa = Array(colCount).fill(w);
    colWidthsDxa[colCount - 1] += TOTAL_TABLE_WIDTH - (w * colCount);
  }

  const tableRows = parsedRows.map((rowCells, rowIdx) => {
    const isHeader = rowIdx === 0;
    const cells = [];

    for (let c = 0; c < colCount; c++) {
      const cellText = rowCells[c] || '';
      const cellWidth = colWidthsDxa[c];
      const isFirstCol = c === 0 && !isHeader;

      const runs = parseInlineMarkdown(cellText, {
        color: isHeader ? COLORS.WHITE : (isFirstCol ? COLORS.NAVY : COLORS.DARK_SLATE),
        bold: isHeader || isFirstCol,
        size: 19 // 9.5pt
      });

      const cellConfig = {
        width: { size: cellWidth, type: WidthType.DXA },
        borders: TABLE_BORDER,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: isHeader ? AlignmentType.CENTER : (isFirstCol ? AlignmentType.LEFT : AlignmentType.JUSTIFIED),
            spacing: { before: 20, after: 20, line: 240 },
            children: runs
          })
        ]
      };

      if (isHeader) {
        cellConfig.shading = { fill: COLORS.NAVY };
      } else if (isFirstCol) {
        cellConfig.shading = { fill: COLORS.BG_LIGHT };
      }

      cells.push(new TableCell(cellConfig));
    }

    return new TableRow({
      tableHeader: isHeader,
      cantSplit: isHeader,
      children: cells
    });
  });

  return new Table({
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: colWidthsDxa,
    alignment: AlignmentType.CENTER,
    rows: tableRows
  });
}

function parseMarkdownToDocxElements(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const elements = [];

  let inTable = false;
  let tableLines = [];
  let inCode = false;
  let codeLines = [];
  let isMermaid = false;

  function flushTable() {
    if (!inTable) return;
    const tbl = createWordTable(tableLines);
    if (tbl) {
      elements.push(tbl);
      elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
    }
    tableLines = [];
    inTable = false;
  }

  function flushCode() {
    if (!inCode) return;
    const title = isMermaid ? 'BIỂU ĐỒ QUY TRÌNH (MERMAID SPECIFICATION):' : 'KHỐI MÃ NGUỒN:';
    const cellChildren = [
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 18, color: COLORS.NAVY, font: 'Consolas' })],
        spacing: { before: 40, after: 40 }
      })
    ];

    codeLines.slice(0, 40).forEach(cl => {
      cellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: cl, size: 16, font: 'Consolas', color: COLORS.DARK_SLATE })],
          spacing: { before: 10, after: 10, line: 200 }
        })
      );
    });

    const calloutCell = new TableCell({
      width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
      borders: TABLE_BORDER,
      shading: { fill: COLORS.BG_LIGHT },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: cellChildren
    });

    elements.push(
      new Table({
        width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: [TOTAL_TABLE_WIDTH],
        alignment: AlignmentType.CENTER,
        rows: [new TableRow({ children: [calloutCell] })]
      })
    );
    elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

    codeLines = [];
    inCode = false;
    isMermaid = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Mermaid or Code Block
    if (line.trim().startsWith('```')) {
      flushTable();
      if (inCode) {
        flushCode();
      } else {
        inCode = true;
        isMermaid = line.includes('mermaid');
        codeLines = [];
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Markdown Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableLines.push(line);
      continue;
    } else {
      flushTable();
    }

    // Heading 1
    if (line.startsWith('# ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: line.replace(/^#\s+/, '').trim(), bold: true, size: 32, color: COLORS.NAVY, font: 'Times New Roman' })]
        })
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: line.replace(/^##\s+/, '').trim(), bold: true, size: 26, color: COLORS.DARK_GOLD, font: 'Times New Roman' })]
        })
      );
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [new TextRun({ text: line.replace(/^###\s+/, '').trim(), bold: true, size: 22, color: COLORS.NAVY, font: 'Times New Roman' })]
        })
      );
      continue;
    }

    // Heading 4
    if (line.startsWith('#### ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: line.replace(/^####\s+/, '').trim(), bold: true, size: 20, color: COLORS.DARK_SLATE, font: 'Times New Roman' })]
        })
      );
      continue;
    }

    // List item
    if (line.match(/^(\s*)[-*+]\s+(.*)$/)) {
      const text = line.replace(/^(\s*)[-*+]\s+/, '').trim();
      const runs = parseInlineMarkdown(text, { size: 21, color: COLORS.DARK_SLATE });
      elements.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 30, after: 30, line: 260 },
          children: runs
        })
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const text = line.replace(/^>\s+/, '').trim();
      elements.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [new TextRun({ text: '▶  ' + text, italics: true, size: 20, color: COLORS.DARK_GOLD, font: 'Times New Roman' })]
        })
      );
      continue;
    }

    // Divider
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
      continue;
    }

    // Normal text
    if (line.trim().length > 0 && !line.trim().startsWith('<div')) {
      const runs = parseInlineMarkdown(line.trim(), { size: 21, color: COLORS.DARK_SLATE });
      elements.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 40, after: 40, line: 260 },
          children: runs
        })
      );
    }
  }

  flushTable();
  flushCode();

  return elements;
}

function buildCoverPage(title, subtitle, docCode, version, date) {
  const elements = [];

  elements.push(new Paragraph({ spacing: { before: 600, after: 200 } }));

  // Header Title Box
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [
        new TextRun({ text: 'HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)', bold: true, size: 24, color: COLORS.DARK_SLATE, font: 'Times New Roman' })
      ]
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({ text: 'CLB DOANH NHÂN CEO 1983', bold: true, size: 28, color: COLORS.NAVY, font: 'Times New Roman' })
      ]
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({ text: '★ ★ ★ ★ ★', bold: true, size: 24, color: COLORS.GOLD, font: 'Times New Roman' })
      ]
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: title, bold: true, size: 36, color: COLORS.NAVY, font: 'Times New Roman' })
      ]
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 400 },
      children: [
        new TextRun({ text: subtitle, bold: true, size: 22, color: COLORS.DARK_GOLD, font: 'Times New Roman' })
      ]
    })
  );

  // Meta Table
  const metaColWidths = [2800, 4700];
  const metaTable = new Table({
    width: { size: 7500, type: WidthType.DXA },
    columnWidths: metaColWidths,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: metaColWidths[0], type: WidthType.DXA },
            borders: TABLE_BORDER,
            shading: { fill: COLORS.BG_LIGHT },
            children: [new Paragraph({ children: [new TextRun({ text: 'Mã Tài Liệu:', bold: true, size: 20, color: COLORS.NAVY })] })]
          }),
          new TableCell({
            width: { size: metaColWidths[1], type: WidthType.DXA },
            borders: TABLE_BORDER,
            children: [new Paragraph({ children: [new TextRun({ text: docCode, bold: true, size: 20, color: COLORS.DARK_SLATE })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: metaColWidths[0], type: WidthType.DXA },
            borders: TABLE_BORDER,
            shading: { fill: COLORS.BG_LIGHT },
            children: [new Paragraph({ children: [new TextRun({ text: 'Phiên Bản:', bold: true, size: 20, color: COLORS.NAVY })] })]
          }),
          new TableCell({
            width: { size: metaColWidths[1], type: WidthType.DXA },
            borders: TABLE_BORDER,
            children: [new Paragraph({ children: [new TextRun({ text: version, bold: true, size: 20, color: COLORS.DARK_SLATE })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: metaColWidths[0], type: WidthType.DXA },
            borders: TABLE_BORDER,
            shading: { fill: COLORS.BG_LIGHT },
            children: [new Paragraph({ children: [new TextRun({ text: 'Ngày Ban Hành:', bold: true, size: 20, color: COLORS.NAVY })] })]
          }),
          new TableCell({
            width: { size: metaColWidths[1], type: WidthType.DXA },
            borders: TABLE_BORDER,
            children: [new Paragraph({ children: [new TextRun({ text: date, size: 20, color: COLORS.DARK_SLATE })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: metaColWidths[0], type: WidthType.DXA },
            borders: TABLE_BORDER,
            shading: { fill: COLORS.BG_LIGHT },
            children: [new Paragraph({ children: [new TextRun({ text: 'Cơ Quan Ban Hành:', bold: true, size: 20, color: COLORS.NAVY })] })]
          }),
          new TableCell({
            width: { size: metaColWidths[1], type: WidthType.DXA },
            borders: TABLE_BORDER,
            children: [new Paragraph({ children: [new TextRun({ text: 'Ban Chấp Hành CLB Doanh Nhân CEO 1983', bold: true, size: 20, color: COLORS.DARK_SLATE })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: metaColWidths[0], type: WidthType.DXA },
            borders: TABLE_BORDER,
            shading: { fill: COLORS.BG_LIGHT },
            children: [new Paragraph({ children: [new TextRun({ text: 'Đơn Vị Phát Triển:', bold: true, size: 20, color: COLORS.NAVY })] })]
          }),
          new TableCell({
            width: { size: metaColWidths[1], type: WidthType.DXA },
            borders: TABLE_BORDER,
            children: [new Paragraph({ children: [new TextRun({ text: 'ViConnect Technology Solutions Co., Ltd', bold: true, size: 20, color: COLORS.DARK_SLATE })] })]
          })
        ]
      })
    ]
  });

  elements.push(metaTable);
  elements.push(new Paragraph({ spacing: { before: 400, after: 0 } }));
  elements.push(new Paragraph({ children: [new PageBreak()] }));

  return elements;
}

async function convertFileToDocx(mdPath, outDocxPath, title, subtitle, docCode, version, date) {
  console.log(`Đang xử lý ${mdPath} -> ${outDocxPath}...`);
  const md = fs.readFileSync(mdPath, 'utf8');

  const coverElements = buildCoverPage(title, subtitle, docCode, version, date);
  const contentElements = parseMarkdownToDocxElements(md);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
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
                    text: `${title} - ${version} | CLB CEO 1983 (HANOIBA)`,
                    italics: true,
                    size: 17,
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
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 120, after: 0 },
                children: [
                  new TextRun({
                    text: 'BẢO MẬT & LƯU HÀNH NỘI BỘ - BAN CHẤP HÀNH CLB CEO 1983                       ',
                    italics: true,
                    size: 17,
                    color: COLORS.MUTED_SLATE,
                    font: 'Times New Roman'
                  }),
                  new TextRun({ text: 'Trang ', size: 17, color: COLORS.MUTED_SLATE, font: 'Times New Roman' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 17, color: COLORS.MUTED_SLATE, font: 'Times New Roman' })
                ]
              })
            ]
          })
        },
        children: [...coverElements, ...contentElements]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outDocxPath, buffer);
  console.log(`✓ Đã tạo thành công: ${outDocxPath}`);
}

async function run() {
  console.log('--- KHỞI ĐỘNG XUẤT BẢN FILE WORD CHUẨN ISO/IEC 29500 ---');

  // 1. Build BRD DOCX
  await convertFileToDocx(
    path.join(DOC_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.md'),
    path.join(DOC_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.docx'),
    'TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)',
    'Hệ Sinh Thái Số Hóa Toàn Diện Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA)',
    'CEO1983/BRD-ALL-V7.0',
    'Phiên bản 7.0',
    '05/11/2026'
  );

  // Copy sang FE
  fs.copyFileSync(
    path.join(DOC_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.docx'),
    path.join(FE_DOCS_DIR, 'BRD_CEO1983_HE_THONG_TOAN_DIEN_V7.docx')
  );

  // 2. Build SRS DOCX
  await convertFileToDocx(
    path.join(DOC_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.md'),
    path.join(DOC_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.docx'),
    'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)',
    'Hệ Sinh Thái Số Hóa Toàn Diện Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA)',
    'CEO1983/SRS-ALL-V7.0',
    'Phiên bản 7.0',
    '05/11/2026'
  );

  // Copy sang FE
  fs.copyFileSync(
    path.join(DOC_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.docx'),
    path.join(FE_DOCS_DIR, 'SRS_CEO1983_HE_THONG_TOAN_DIEN_V7.docx')
  );

  console.log('--- HOÀN TẤT XUẤT BẢN WORD CHUẨN XÁC 100%! ---');
}

run().catch(err => {
  console.error('Lỗi khi xuất bản Word:', err);
  process.exit(1);
});

