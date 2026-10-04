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
  TableLayoutType,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const DOCUMENT_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');

[DOCUMENT_DIR, FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '003B95';
const COLOR_BLUE = '1E63E9';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_HEADER_BG = '001A4D';
const COLOR_ALT_BG = 'F8FAFC';
const TABLE_WIDTH = 9200;

const BORDER_STYLE = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createPara(text, opts = {}) {
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

function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 30, // 15pt
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        color: COLOR_BLUE,
      }),
    ],
  });
}

function createHeading3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: COLOR_DARK,
      }),
    ],
  });
}

function createCover() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 120 },
      children: [
        new TextRun({
          text: 'HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: 'CLB DOANH NHÂN CEO 1983 — HỆ SINH THÁI SỐ HÓA HIỆP HỘI',
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 140 },
      children: [
        new TextRun({
          text: 'SOFTWARE REQUIREMENTS SPECIFICATION (SRS)',
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({
          text: 'ĐẶC TẢ YÊU CẦU PHẦN MỀM CHUẨN QUỐC TẾ IEEE 830',
          font: FONT_FAMILY,
          size: 28,
          bold: true,
          color: COLOR_BLUE,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 800 },
      children: [
        new TextRun({
          text: 'Cổng Quản Trị Trung Tâm Web CRM & Ứng Dụng Di Động Hội Viên CEO 1983',
          font: FONT_FAMILY,
          size: 24,
          italics: true,
          color: '64748B',
        }),
      ],
    }),
    new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      rows: [
        ['Mã Tài Liệu', 'SRS-IEEE830-CEO1983-MASTER-V5.0'],
        ['Phiên Bản', 'Version 5.0 — Master Specification (Khớp Kỹ Thuật 100%)'],
        ['Cơ Quan Chủ Quản', 'CLB Doanh Nhân CEO 1983 (Trực thuộc HanoiBA)'],
        ['Đơn Vị Thực Hiện', 'ViConnect Platform & Ban Công Nghệ Chuyển Đổi Số'],
        ['Phạm Vi Áp Dụng', 'Ban Quản Trị, Ban Thư Ký, 6 Ban Chuyên Môn & Toàn Thể Hội Viên'],
        ['Ngày Phê Duyệt', '04/10/2026'],
      ].map(([label, val]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2800, type: WidthType.DXA },
              borders: BORDER_STYLE,
              shading: { fill: COLOR_ALT_BG, type: ShadingType.CLEAR },
              children: [createPara(label, { bold: true, size: 22 })],
            }),
            new TableCell({
              width: { size: 6400, type: WidthType.DXA },
              borders: BORDER_STYLE,
              children: [createPara(val, { size: 22 })],
            }),
          ],
        })
      ),
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 0 },
      children: [
        new TextRun({
          text: 'Hà Nội — Tháng 10 Năm 2026',
          font: FONT_FAMILY,
          size: 22,
          italics: true,
          color: '64748B',
        }),
      ],
      pageBreakBefore: false,
    }),
    new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
      pageBreakBefore: true,
    }),
  ];
}

function parseMarkdownToDocx(mdText) {
  const children = [...createCover()];
  const lines = mdText.split('\n');
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check table
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      if (line.includes('---')) continue; // Skip markdown separator row
      const cells = line.split('|').slice(1, -1).map(c => c.trim().replace(/<br>/g, '\n').replace(/\*\*/g, ''));
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // Flush table
      if (tableRows.length > 0) {
        const colCount = tableRows[0].length;
        const colWidth = Math.floor(TABLE_WIDTH / colCount);
        const rows = tableRows.map((r, rIdx) => {
          const isHeader = rIdx === 0;
          return new TableRow({
            children: r.map(cText =>
              new TableCell({
                width: { size: colWidth, type: WidthType.DXA },
                borders: BORDER_STYLE,
                shading: isHeader
                  ? { fill: COLOR_HEADER_BG, type: ShadingType.CLEAR }
                  : rIdx % 2 === 1
                  ? { fill: COLOR_ALT_BG, type: ShadingType.CLEAR }
                  : undefined,
                children: [
                  createPara(cText, {
                    bold: isHeader,
                    color: isHeader ? 'FFFFFF' : COLOR_DARK,
                    size: 20,
                  }),
                ],
              })
            ),
          });
        });
        children.push(new Table({ width: { size: TABLE_WIDTH, type: WidthType.DXA }, rows }));
        children.push(createPara('', { spacing: { before: 80, after: 80 } }));
      }
      inTable = false;
      tableRows = [];
    }

    if (!line) continue;

    if (line.startsWith('# ')) {
      children.push(createHeading1(line.substring(2).replace(/\*\*/g, '')));
    } else if (line.startsWith('## ')) {
      children.push(createHeading1(line.substring(3).replace(/\*\*/g, '')));
    } else if (line.startsWith('### ')) {
      children.push(createHeading2(line.substring(4).replace(/\*\*/g, '')));
    } else if (line.startsWith('#### ')) {
      children.push(createHeading3(line.substring(5).replace(/\*\*/g, '')));
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      children.push(
        createPara(`• ${line.substring(2).replace(/\*\*/g, '')}`, {
          spacing: { before: 40, after: 40 },
          size: 22,
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      children.push(
        createPara(line.replace(/\*\*/g, ''), {
          spacing: { before: 40, after: 40 },
          size: 22,
        })
      );
    } else if (!line.startsWith('---')) {
      children.push(
        createPara(line.replace(/\*\*/g, ''), {
          size: 22,
        })
      );
    }
  }

  return children;
}

async function main() {
  console.log('>>> Bắt đầu biên dịch SRS IEEE 830 sang định dạng Word DOCX...');
  const mdPath = path.join(DOCS_DIR, 'SRS_IEEE830_CEO1983_TOAN_DIEN.md');
  if (!fs.existsSync(mdPath)) {
    console.error('Không tìm thấy file SRS Markdown:', mdPath);
    process.exit(1);
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const docElements = parseMarkdownToDocx(mdContent);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch = 1440 twips
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'SRS IEEE 830 — Hệ Sinh Thái CLB Doanh Nhân CEO 1983 (HanoiBA)',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '94A3B8',
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
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    text: ' / ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '94A3B8',
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

  const targets = [
    path.join(DOCS_DIR, 'SRS_IEEE830_CEO1983_TOAN_DIEN.docx'),
    path.join(DOCUMENT_DIR, 'SRS_IEEE830_CEO1983_TOAN_DIEN.docx'),
    path.join(FE_DOCS_DIR, 'SRS_IEEE830_CEO1983_TOAN_DIEN.docx'),
  ];

  targets.forEach(t => {
    fs.writeFileSync(t, buffer);
    console.log(`✓ Đã lưu file Word thành công tại: ${t} (${buffer.length} bytes)`);
  });

  console.log('🎉 Hoàn tất xuất bản SRS IEEE 830 DOCX thành công 100%!');
}

main().catch(err => {
  console.error('Lỗi khi tạo file Word DOCX:', err);
  process.exit(1);
});
