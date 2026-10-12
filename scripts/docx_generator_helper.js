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
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');

[DOC_DIR, DOCS_DIR, FE_DOCS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '003B95';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_MUTED = '475569';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '003B95';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200;

const BORDER_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createPara(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: options.spacing || { before: 80, after: 80, line: 276 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: options.size || 24,
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || COLOR_DARK,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix + ' ',
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: COLOR_NAVY,
      })
    );
  }
  children.push(
    new TextRun({
      text: text,
      font: FONT_FAMILY,
      size: 24,
      color: COLOR_MUTED,
    })
  );

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 50, after: 50, line: 260 },
    children,
  });
}

function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 32,
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 28,
        bold: true,
        color: COLOR_GOLD,
      }),
    ],
  });
}

function createHeading3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 60 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 26,
        bold: true,
        color: COLOR_DARK,
      }),
    ],
  });
}

function createHeading4(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_4,
    spacing: { before: 140, after: 50 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        italics: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: BORDER_THIN,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: text,
            font: FONT_FAMILY,
            size: 22,
            bold: true,
            color: 'FFFFFF',
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text, widthPercent, isAlt = false, isBold = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isAlt ? { fill: COLOR_BG_ALT, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: BORDER_THIN,
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            font: FONT_FAMILY,
            size: 22,
            bold: isBold,
            color: COLOR_DARK,
          }),
        ],
      }),
    ],
  });
}

function parseMarkdownTableToDocxTable(tableLines) {
  if (tableLines.length < 2) return null;
  const headerCols = tableLines[0].split('|').map((s) => s.trim()).filter(Boolean);
  const dataRows = [];
  for (let i = 2; i < tableLines.length; i++) {
    const cols = tableLines[i].split('|').map((s) => s.trim()).filter(Boolean);
    if (cols.length > 0) dataRows.push(cols);
  }

  const colCount = headerCols.length;
  if (colCount === 0) return null;
  const colWidth = Math.floor(100 / colCount);

  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: headerCols.map((c) => createHeaderCell(c, colWidth)),
  });

  const tableBodyRows = dataRows.map((row, idx) => {
    return new TableRow({
      children: headerCols.map((_, colIdx) => {
        const cellText = row[colIdx] || '';
        return createDataCell(cellText, colWidth, idx % 2 === 1, colIdx === 0);
      }),
    });
  });

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    rows: [tableHeaderRow, ...tableBodyRows],
  });
}

// Hàm sinh TRANG BÌA (Cover Page) chuẩn mực doanh nghiệp hoàng gia
function createCoverPageElements(docTitle, docSubtitle) {
  const elements = [];

  // Tổ chức chủ quản
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: 'HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'CLB DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    })
  );

  // Đường phân cách trang trí
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [
        new TextRun({
          text: '❖  ❖  ❖',
          font: FONT_FAMILY,
          size: 28,
          color: COLOR_GOLD,
        }),
      ],
    })
  );

  // Tiêu đề tài liệu lớn
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 180 },
      children: [
        new TextRun({
          text: docTitle,
          font: FONT_FAMILY,
          size: 38,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    })
  );

  // Phụ đề
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
      children: [
        new TextRun({
          text: docSubtitle,
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    })
  );

  // Bảng thông tin siêu dữ liệu tài liệu bìa
  const metaRows = [
    ['Cơ quan ban hành', 'Ban Chấp Hành CLB Doanh Nhân CEO 1983'],
    ['Cấp phê duyệt', 'Chủ tịch Hiệp hội & Ban Điều Hành'],
    ['Phiên bản tài liệu', '5.0 Hoàn thiện (Chuẩn hóa IEEE 830 / BRD)'],
    ['Phạm vi áp dụng', 'Toàn bộ Hệ thống CRM & Mobile App Hiệp Hội'],
    ['Ngày phát hành', 'Tháng 10/2026'],
    ['Trạng thái pháp lý', 'Chính thức - Lưu hành nội bộ'],
  ];

  const metaTable = new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    rows: metaRows.map((r, idx) => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: BORDER_THIN,
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: r[0],
                    font: FONT_FAMILY,
                    size: 22,
                    bold: true,
                    color: COLOR_NAVY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: BORDER_THIN,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: r[1],
                    font: FONT_FAMILY,
                    size: 22,
                    color: COLOR_DARK,
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    }),
  });

  elements.push(metaTable);

  // Ngắt trang sau bìa
  elements.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return elements;
}

// Hàm sinh TRANG MỤC LỤC (Table of Contents) tự động từ Markdown headings
function createTableOfContentsElements(mdContent) {
  const elements = [];

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 240 },
      children: [
        new TextRun({
          text: 'MỤC LỤC TÀI LIỆU',
          font: FONT_FAMILY,
          size: 32,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    })
  );

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({
          text: '―❖―',
          font: FONT_FAMILY,
          size: 24,
          color: COLOR_GOLD,
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      elements.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: '■ ' + trimmed.substring(2),
              font: FONT_FAMILY,
              size: 24,
              bold: true,
              color: COLOR_NAVY,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: '● ' + trimmed.substring(3),
              font: FONT_FAMILY,
              size: 22,
              bold: true,
              color: COLOR_GOLD,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        new Paragraph({
          indent: { left: 800 },
          spacing: { before: 40, after: 30 },
          children: [
            new TextRun({
              text: '– ' + trimmed.substring(4),
              font: FONT_FAMILY,
              size: 20,
              color: COLOR_MUTED,
            }),
          ],
        })
      );
    }
  }

  // Ngắt trang sau mục lục
  elements.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return elements;
}

async function generateDocxFromMarkdown(docTitle, docSubtitle, mdContent, outputName) {
  const lines = mdContent.split('\n');
  const docElements = [];

  // 1. Thêm TRANG BÌA
  docElements.push(...createCoverPageElements(docTitle, docSubtitle));

  // 2. Thêm TRANG MỤC LỤC
  docElements.push(...createTableOfContentsElements(mdContent));

  // 3. Phân tích nội dung chi tiết
  let inTable = false;
  let tableBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      inTable = false;
      const t = parseMarkdownTableToDocxTable(tableBuffer);
      if (t) docElements.push(t);
      tableBuffer = [];
    }

    if (!trimmed || trimmed === '---') continue;

    if (trimmed.startsWith('# ')) {
      docElements.push(createHeading1(trimmed.substring(2)));
    } else if (trimmed.startsWith('## ')) {
      docElements.push(createHeading2(trimmed.substring(3)));
    } else if (trimmed.startsWith('### ')) {
      docElements.push(createHeading3(trimmed.substring(4)));
    } else if (trimmed.startsWith('#### ')) {
      docElements.push(createHeading4(trimmed.substring(5)));
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.substring(2);
      if (bulletText.includes(':')) {
        const parts = bulletText.split(':');
        docElements.push(createBullet(parts.slice(1).join(':').trim(), parts[0].trim() + ':'));
      } else {
        docElements.push(createBullet(bulletText));
      }
    } else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      if (content.includes(':')) {
        const parts = content.split(':');
        docElements.push(createBullet(parts.slice(1).join(':').trim(), parts[0].trim() + ':'));
      } else {
        docElements.push(createBullet(content));
      }
    } else if (trimmed.startsWith('> ')) {
      docElements.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 100, after: 100 },
          children: [
            new TextRun({
              text: trimmed.substring(2),
              font: FONT_FAMILY,
              size: 24,
              italics: true,
              bold: true,
              color: COLOR_NAVY,
            }),
          ],
        })
      );
    } else {
      docElements.push(createPara(trimmed));
    }
  }

  if (inTable && tableBuffer.length > 0) {
    const t = parseMarkdownTableToDocxTable(tableBuffer);
    if (t) docElements.push(t);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'CLB DOANH NHÂN CEO 1983 - HANOIBA',
                    font: FONT_FAMILY,
                    size: 18,
                    bold: true,
                    color: COLOR_NAVY,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 18,
                    bold: true,
                    color: COLOR_NAVY,
                  }),
                ],
              }),
            ],
          }),
        },
        children: docElements,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(DOC_DIR, outputName), buffer);
  fs.writeFileSync(path.join(DOCS_DIR, outputName), buffer);
  fs.writeFileSync(path.join(FE_DOCS_DIR, outputName), buffer);
  console.log(`✓ Đã xuất bản tệp Word ${outputName} tới cả 3 thư mục.`);
}

module.exports = {
  DOC_DIR,
  DOCS_DIR,
  FE_DOCS_DIR,
  generateDocxFromMarkdown,
};
