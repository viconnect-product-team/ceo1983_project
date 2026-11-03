/**
 * CONVERT SRS MARKDOWN TO MICROSOFT WORD (.DOCX)
 * Chuẩn hóa tài liệu SRS CEO 1983 V6.0 (147 Use Cases) sang định dạng Word chuyên nghiệp
 * Thiết kế chuẩn nhận diện CEO 1983: Deep Cobalt Navy (#1F3864), Amber Gold (#B8860B)
 * Khổ giấy A4, Font Times New Roman, Bảng biểu viền mảnh sang trọng
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
  ImageRun,
  PageBreak
} = docx;

// Color Palette
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
  TAG_BG: 'EEF2FF'
};

// Table Border Style
const TABLE_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER_COLOR }
};

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  right: { style: BorderStyle.NONE, size: 0, color: 'auto' }
};

/**
 * Phân tích chuỗi có chứa định dạng markdown inline (**bold**, *italic*, `code`)
 * thành mảng TextRun của thư viện docx
 */
function parseInlineMarkdown(text, baseOptions = {}) {
  if (!text) return [new TextRun({ text: '', ...baseOptions })];

  // Chuẩn hóa thẻ <br> thành newline
  const clean = text.replace(/<br\s*\/?>/gi, '\n');
  const lines = clean.split('\n');
  const runs = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      // Xuống dòng trong cùng đoạn văn
      runs.push(new TextRun({ break: 1, ...baseOptions }));
    }

    // Tokenize line by markdown tokens
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        runs.push(new TextRun({
          text: line.slice(lastIdx, match.index),
          font: 'Times New Roman',
          ...baseOptions
        }));
      }

      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
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
          color: COLORS.DARK_GOLD,
          bold: true,
          ...baseOptions
        }));
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < line.length) {
      runs.push(new TextRun({
        text: line.slice(lastIdx),
        font: 'Times New Roman',
        ...baseOptions
      }));
    }
  });

  return runs;
}

/**
 * Xử lý tạo TableCell chứa dữ liệu có hỗ trợ xuống dòng
 */
function createTableCell(content, options = {}) {
  const {
    isHeader = false,
    width = 4500,
    bgColor = isHeader ? COLORS.NAVY : null,
    bold = isHeader,
    textColor = isHeader ? COLORS.WHITE : COLORS.DARK_SLATE,
    alignment = AlignmentType.LEFT
  } = options;

  // Tách các đoạn văn bản nếu có nhiều dòng
  const lines = content.split(/<br\s*\/?>|\n/i);
  const paragraphs = lines.map(line => {
    const runs = parseInlineMarkdown(line.trim(), {
      bold: bold,
      color: textColor,
      size: isHeader ? 21 : 20 // 10.5pt hoặc 10pt
    });
    return new Paragraph({
      alignment: alignment,
      spacing: { before: 40, after: 40, line: 240 },
      children: runs.length > 0 ? runs : [new TextRun({ text: '', size: 20 })]
    });
  });

  const cellConfig = {
    width: { size: width, type: WidthType.DXA },
    borders: TABLE_BORDER,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: paragraphs
  };

  if (bgColor) {
    cellConfig.shading = {
      type: ShadingType.CLEAR,
      fill: bgColor,
      color: 'auto'
    };
  }

  return new TableCell(cellConfig);
}

/**
 * Tạo bảng Word từ các dòng Markdown table
 */
function createWordTable(tableLines) {
  if (tableLines.length < 2) return null;

  // Lọc bỏ dòng phân cách `| :--- | :--- |`
  const validRows = tableLines.filter(line => !line.match(/^\|\s*[:\-\s|]+\|$/));
  if (validRows.length === 0) return null;

  // Parse từng hàng thành mảng ô
  const parsedRows = validRows.map(line => {
    return line
      .split('|')
      .slice(1, -1) // Bỏ phần tử đầu và cuối do split từ '| col1 | col2 |'
      .map(cell => cell.trim());
  });

  const colCount = Math.max(...parsedRows.map(r => r.length));
  if (colCount === 0) return null;

  // Tính toán độ rộng cột (Tổng width khả dụng khổ A4 là ~9000 DXA)
  const TOTAL_WIDTH = 9026;
  let colWidths = [];

  if (colCount === 2) {
    colWidths = [2600, 6426]; // Tỷ lệ chuẩn cho Bảng Use Case
  } else if (colCount === 3) {
    colWidths = [2000, 3500, 3526];
  } else if (colCount === 4) {
    colWidths = [1500, 2500, 2500, 2526];
  } else {
    const w = Math.floor(TOTAL_WIDTH / colCount);
    colWidths = Array(colCount).fill(w);
    colWidths[colCount - 1] += TOTAL_WIDTH - (w * colCount);
  }

  const tableRows = parsedRows.map((rowCells, rowIdx) => {
    const isHeader = rowIdx === 0;
    const cells = [];

    for (let c = 0; c < colCount; c++) {
      const cellText = rowCells[c] || '';
      const cellWidth = colWidths[c];
      const isFirstCol = c === 0 && !isHeader;

      cells.push(createTableCell(cellText, {
        isHeader: isHeader,
        width: cellWidth,
        bgColor: isHeader ? COLORS.NAVY : (isFirstCol ? COLORS.BG_LIGHT : null),
        bold: isHeader || isFirstCol,
        textColor: isHeader ? COLORS.WHITE : COLORS.DARK_SLATE,
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT
      }));
    }

    return new TableRow({
      tableHeader: isHeader,
      children: cells
    });
  });

  return new Table({
    width: { size: TOTAL_WIDTH, type: WidthType.DXA },
    rows: tableRows
  });
}

/**
 * Tạo khối hình ảnh hoặc hộp minh chứng
 */
function createImageBlock(altText, rawSrc, basePath) {
  const resolvedPath = path.resolve(basePath, rawSrc);
  const elements = [];

  if (fs.existsSync(resolvedPath)) {
    try {
      const imgBuffer = fs.readFileSync(resolvedPath);
      elements.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 80 },
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: {
              width: 520,
              height: 290
            }
          })
        ]
      }));

      elements.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 180 },
        children: [
          new TextRun({
            text: `Hình minh chứng: ${altText}`,
            italics: true,
            size: 19, // 9.5pt
            color: COLORS.MUTED_SLATE,
            font: 'Times New Roman'
          })
        ]
      }));
      return elements;
    } catch (e) {
      console.warn(`Lỗi khi nhúng ảnh ${rawSrc}:`, e.message);
    }
  }

  // Fallback: Tạo hộp ghi chú minh chứng trang nhã
  const calloutCell = new TableCell({
    width: { size: 9026, type: WidthType.DXA },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.GOLD }, // Viền dày bên trái màu Vàng Gold
      top: BorderStyle.NONE,
      bottom: BorderStyle.NONE,
      right: BorderStyle.NONE
    },
    shading: {
      type: ShadingType.CLEAR,
      fill: COLORS.BG_LIGHT,
      color: 'auto'
    },
    margins: { top: 120, bottom: 120, left: 180, right: 180 },
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: `📷 [MINH CHỨNG HỆ THỐNG]: `,
            bold: true,
            color: COLORS.DARK_GOLD,
            font: 'Times New Roman',
            size: 20
          }),
          new TextRun({
            text: `${altText} `,
            bold: false,
            italics: true,
            color: COLORS.DARK_SLATE,
            font: 'Times New Roman',
            size: 20
          }),
          new TextRun({
            text: `(Tệp: ${rawSrc})`,
            color: COLORS.MUTED_SLATE,
            font: 'Consolas',
            size: 18
          })
        ]
      })
    ]
  });

  elements.push(new Table({
    width: { size: 9026, type: WidthType.DXA },
    rows: [new TableRow({ children: [calloutCell] })]
  }));
  elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

  return elements;
}

/**
 * HÀM CHÍNH BUILD TÀI LIỆU DOCX
 */
async function buildDocxFromMarkdown() {
  const mdPath = path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md');
  const outputDocxPath = path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx');
  const shortDocxPath = path.join(__dirname, '../document/SRS_CEO1983_HE_THONG_TOAN_DIEN.docx');
  const feDocxPath = path.join(__dirname, '../apps/ceo1983_app_fe/public/docs/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx');

  console.log(`Đang đọc nội dung từ: ${mdPath}...`);
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const lines = mdContent.split('\n');

  console.log(`Tổng số dòng Markdown: ${lines.length}`);

  const docChildren = [];

  // 1. TẠO TRANG BÌA ĐẲNG CẤP (COVER PAGE)
  docChildren.push(new Paragraph({ spacing: { before: 400, after: 200 } }));

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: 'HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)',
        bold: true,
        size: 26, // 13pt
        color: COLORS.NAVY,
        font: 'Times New Roman'
      })
    ]
  }));

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 300 },
    children: [
      new TextRun({
        text: 'CÂU LẠC BỘ DOANH NHÂN CEO 1983',
        bold: true,
        size: 32, // 16pt
        color: COLORS.GOLD,
        font: 'Times New Roman'
      })
    ]
  }));

  // Đường kẻ vàng trang trí
  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 800 },
    children: [
      new TextRun({
        text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        color: COLORS.GOLD,
        size: 20
      })
    ]
  }));

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)',
        bold: true,
        size: 44, // 22pt
        color: COLORS.NAVY,
        font: 'Times New Roman'
      })
    ]
  }));

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
    children: [
      new TextRun({
        text: 'SOFTWARE REQUIREMENTS SPECIFICATION',
        bold: true,
        size: 28, // 14pt
        color: COLORS.DARK_GOLD,
        font: 'Times New Roman'
      })
    ]
  }));

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 600 },
    children: [
      new TextRun({
        text: 'HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (CEO 1983 ASSOCIATION ECOSYSTEM)',
        italics: true,
        size: 24, // 12pt
        color: COLORS.DARK_SLATE,
        font: 'Times New Roman'
      })
    ]
  }));

  // Bảng thông tin phát hành trên bìa
  const coverInfoTable = new Table({
    width: { size: 7000, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          createTableCell('Cơ Quan Ban Hành:', { width: 2500, bold: true, textColor: COLORS.NAVY }),
          createTableCell('Ban Chấp Hành CLB Doanh Nhân CEO 1983', { width: 4500, bold: true })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Phiên Bản Hệ Thống:', { width: 2500, bold: true, textColor: COLORS.NAVY }),
          createTableCell('Version 6.0 (Cập nhật Tháng 11/2026)', { width: 4500, bold: true, textColor: COLORS.GOLD })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Tổng Số Nghiệp Vụ:', { width: 2500, bold: true, textColor: COLORS.NAVY }),
          createTableCell('147 Use Cases Toàn Diện (10 PUB + 84 CRM + 53 APP)', { width: 4500, bold: true })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Cấp Độ Bảo Mật:', { width: 2500, bold: true, textColor: COLORS.NAVY }),
          createTableCell('LƯU HÀNH NỘI BỘ & NGHIỆM THU CHÍNH THỨC', { width: 4500, bold: true, textColor: COLORS.DARK_GOLD })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Hạ Tầng Triển Khai:', { width: 2500, bold: true, textColor: COLORS.NAVY }),
          createTableCell('Production Server VPS | CRM & Mobile App Tách Biệt Độc Lập', { width: 4500 })
        ]
      })
    ]
  });

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
    children: []
  }));

  docChildren.push(coverInfoTable);

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 100 },
    children: [
      new TextRun({
        text: 'Hà Nội, Tháng 11 Năm 2026',
        italics: true,
        size: 22,
        color: COLORS.MUTED_SLATE,
        font: 'Times New Roman'
      })
    ]
  }));

  // Ngắt trang sau bìa
  docChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // 2. DUYỆT TỪNG DÒNG MARKDOWN VÀ CHUYỂN ĐỔI
  let i = 0;
  let inTable = false;
  let tableBuffer = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Kiểm tra nếu là dòng trong bảng
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableBuffer.push(trimmed);
      i++;
      continue;
    } else {
      // Nếu kết thúc bảng
      if (inTable) {
        const tableElement = createWordTable(tableBuffer);
        if (tableElement) {
          docChildren.push(tableElement);
          docChildren.push(new Paragraph({ spacing: { before: 80, after: 120 } }));
        }
        tableBuffer = [];
        inTable = false;
      }
    }

    // Bỏ qua dòng trống
    if (trimmed === '') {
      i++;
      continue;
    }

    // Xử lý dòng phân cách ngang `---`
    if (trimmed === '---') {
      docChildren.push(new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: '────────────────────────────────────────────────────────────────────────',
            color: COLORS.BORDER_COLOR,
            size: 16
          })
        ]
      }));
      i++;
      continue;
    }

    // Xử lý ảnh Markdown `![alt](url)`
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const rawSrc = imgMatch[2];
      const imgElements = createImageBlock(altText, rawSrc, path.join(__dirname, '../document'));
      docChildren.push(...imgElements);
      i++;
      continue;
    }

    // Xử lý Heading cấp 1 `# `
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s+/, '');
      // Bỏ qua tiêu đề trang bìa đã tạo ở trên
      if (!headingText.includes('SOFTWARE REQUIREMENTS SPECIFICATION') && !headingText.includes('HỆ SINH THÁI SỐ HÓA')) {
        docChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 160 },
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 32, // 16pt
              color: COLORS.NAVY,
              font: 'Times New Roman'
            })
          ]
        }));
      }
      i++;
      continue;
    }

    // Xử lý Heading cấp 2 `## `
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      // Bỏ qua tiêu đề TRANG BÌA vì đã tạo rồi
      if (headingText.includes('TRANG BÌA')) {
        i++;
        continue;
      }

      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 140 },
        children: [
          new TextRun({
            text: headingText,
            bold: true,
            size: 28, // 14pt
            color: COLORS.NAVY,
            font: 'Times New Roman'
          })
        ]
      }));
      i++;
      continue;
    }

    // Xử lý Heading cấp 3 `### `
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      const isUseCase = headingText.includes('Use Case') || headingText.includes('UC-');

      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: headingText,
            bold: true,
            size: 24, // 12pt
            color: isUseCase ? COLORS.NAVY : COLORS.DARK_GOLD,
            font: 'Times New Roman'
          })
        ]
      }));
      i++;
      continue;
    }

    // Xử lý Heading cấp 4 `#### `
    if (trimmed.startsWith('#### ')) {
      const headingText = trimmed.replace(/^####\s+/, '');
      docChildren.push(new Paragraph({
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: headingText,
            bold: true,
            size: 22, // 11pt
            color: COLORS.DARK_SLATE,
            font: 'Times New Roman'
          })
        ]
      }));
      i++;
      continue;
    }

    // Xử lý Bullet List `* ` hoặc `- `
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.replace(/^[\*\-]\s+/, '');
      const runs = parseInlineMarkdown(bulletText, {
        size: 21, // 10.5pt
        color: COLORS.DARK_SLATE
      });

      docChildren.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 40, after: 40, line: 240 },
        children: runs
      }));
      i++;
      continue;
    }

    // Xử lý Numbered List `1. `
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const listText = numMatch[2];
      const runs = parseInlineMarkdown(listText, {
        size: 21,
        color: COLORS.DARK_SLATE
      });

      // Thêm số thứ tự in đậm vào đầu
      runs.unshift(new TextRun({
        text: `${numMatch[1]}. `,
        bold: true,
        size: 21,
        color: COLORS.NAVY,
        font: 'Times New Roman'
      }));

      docChildren.push(new Paragraph({
        indent: { left: 400 },
        spacing: { before: 40, after: 40, line: 240 },
        children: runs
      }));
      i++;
      continue;
    }

    // Xử lý đoạn văn thường (Normal Paragraph)
    const runs = parseInlineMarkdown(trimmed, {
      size: 21, // 10.5pt
      color: COLORS.DARK_SLATE
    });

    docChildren.push(new Paragraph({
      spacing: { before: 60, after: 60, line: 260 },
      alignment: AlignmentType.JUSTIFIED,
      children: runs
    }));

    i++;
  }

  // Nếu còn bảng ở cuối file
  if (inTable && tableBuffer.length > 0) {
    const tableElement = createWordTable(tableBuffer);
    if (tableElement) {
      docChildren.push(tableElement);
    }
  }

  // 3. THIẾT LẬP DOCUMENT CHUẨN A4 KÈM HEADER VÀ FOOTER
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 22, // 11pt mặc định
            color: COLORS.DARK_SLATE
          },
          paragraph: {
            spacing: { line: 260 }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // Khổ A4 width (dxa)
              height: 16838 // Khổ A4 height (dxa)
            },
            margin: {
              top: 1440,    // 1 inch (~25.4 mm)
              bottom: 1440,
              left: 1440,
              right: 1440
            }
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
                    text: 'HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA) - SRS V6.0',
                    italics: true,
                    size: 17, // 8.5pt
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
                    text: 'BẢO MẬT & LƯU HÀNH NỘI BỘ - BAN CHẤP HÀNH CLB CEO 1983                                               ',
                    italics: true,
                    size: 17,
                    color: COLORS.MUTED_SLATE,
                    font: 'Times New Roman'
                  }),
                  new TextRun({
                    text: 'Trang ',
                    size: 17,
                    color: COLORS.MUTED_SLATE,
                    font: 'Times New Roman'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 17,
                    bold: true,
                    color: COLORS.NAVY,
                    font: 'Times New Roman'
                  }),
                  new TextRun({
                    text: ' / ',
                    size: 17,
                    color: COLORS.MUTED_SLATE,
                    font: 'Times New Roman'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 17,
                    bold: true,
                    color: COLORS.NAVY,
                    font: 'Times New Roman'
                  })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  console.log('Đang đóng gói file Microsoft Word (.docx)...');
  const buffer = await docx.Packer.toBuffer(doc);

  // Ghi file ra các vị trí đích
  fs.writeFileSync(outputDocxPath, buffer);
  console.log(`Đã xuất thành công: ${outputDocxPath} (${Math.round(buffer.length / 1024)} KB)`);

  fs.writeFileSync(shortDocxPath, buffer);
  console.log(`Đã xuất thành công: ${shortDocxPath}`);

  // Đảm bảo thư mục public/docs tồn tại
  const feDocsDir = path.dirname(feDocxPath);
  if (!fs.existsSync(feDocsDir)) {
    fs.mkdirSync(feDocsDir, { recursive: true });
  }
  fs.writeFileSync(feDocxPath, buffer);
  console.log(`Đã đồng bộ sang: ${feDocxPath}`);

  console.log('\nHOÀN TẤT XUẤT BẢN WORD TÀI LIỆU SRS CEO 1983 V6.0!');
}

buildDocxFromMarkdown().catch(err => {
  console.error('Lỗi khi build tài liệu Word:', err);
  process.exit(1);
});

