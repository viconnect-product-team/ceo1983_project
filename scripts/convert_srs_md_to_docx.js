/**
 * CONVERT SRS MARKDOWN TO MICROSOFT WORD (.DOCX & .DOC)
 * Chuẩn hóa tài liệu SRS CEO 1983 V6.0 (147 Use Cases) sang định dạng Word chuyên nghiệp
 * Thiết kế chuẩn nhận diện CEO 1983: Deep Cobalt Navy (#1F3864), Amber Gold (#B8860B)
 * Khổ giấy A4, Font Times New Roman, Bảng biểu viền mảnh sang trọng, chống vỡ format trên mọi ứng dụng
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

// TỔNG CHIỀU RỘNG CHUẨN A4 TRỪ LỀ LÀ 9026 DXA (~15.92 cm)
// Khổ A4 = 11906 DXA, Margin Trái = 1440 DXA, Margin Phải = 1440 DXA -> Phần thân = 9026 DXA
const TOTAL_TABLE_WIDTH = 9026;

// Color Palette Hoàng Gia CEO 1983
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

/**
 * Phân tích chuỗi có chứa định dạng markdown inline (**bold**, *italic*, `code`)
 * thành mảng TextRun của thư viện docx
 */
function parseInlineMarkdown(text, baseOptions = {}) {
  if (!text) return [new TextRun({ text: '', ...baseOptions })];

  const runs = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
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

  if (lastIdx < text.length) {
    runs.push(new TextRun({
      text: text.slice(lastIdx),
      font: 'Times New Roman',
      ...baseOptions
    }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text: '', ...baseOptions })];
}

/**
 * Format toàn bộ các đoạn văn bản (paragraphs) trong một TableCell:
 * - Tự động nhận diện các bước (1. , 2. , Bước 1:) và in đậm số thứ tự, thụt lề chuẩn
 * - Nhận diện các gạch đầu dòng con (- , * , +) và thụt lề cấp 1, cấp 2
 * - Loại bỏ các dòng trống thừa
 */
function formatCellParagraphs(content, isHeader, isFirstCol) {
  if (isHeader) {
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80, line: 240 },
        children: [
          new TextRun({
            text: content.trim(),
            bold: true,
            color: COLORS.WHITE,
            size: 20, // 10pt
            font: 'Times New Roman'
          })
        ]
      })
    ];
  }

  // Tách dòng bởi thẻ <br> hoặc newline
  const rawLines = content.split(/<br\s*\/?>|\r?\n/gi);
  const paras = [];

  rawLines.forEach((rawLine) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;

    // 1. Kiểm tra bước đánh số: "1. ", "2. ", "Bước 1:", "Step 1:"
    const stepMatch = trimmed.match(/^((?:Bước\s*\d+|Step\s*\d+|\d+[\.\)])(?:\s*:|\s*))\s*(.*)$/i);
    // 2. Kiểm tra gạch đầu dòng con thụt lề cấp 2 ("   + ", "    - ")
    const subBulletMatch = rawLine.match(/^(\s{3,}|\t+)(?:[\+\-\*•])\s*(.*)$/);
    // 3. Kiểm tra gạch đầu dòng cấp 1 ("- ", "* ", "+ ", "• ")
    const bulletMatch = trimmed.match(/^([\-\*•\+])\s*(.*)$/);

    if (stepMatch) {
      const stepNum = stepMatch[1].trim();
      const stepContent = stepMatch[2].trim();
      const runs = [
        new TextRun({
          text: stepNum + ' ',
          bold: true,
          color: COLORS.NAVY,
          size: 20,
          font: 'Times New Roman'
        }),
        ...parseInlineMarkdown(stepContent, {
          color: COLORS.DARK_SLATE,
          size: 20
        })
      ];
      paras.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 240 },
          spacing: { before: 40, after: 40, line: 240 },
          children: runs
        })
      );
    } else if (subBulletMatch) {
      const subContent = subBulletMatch[2].trim();
      const runs = [
        new TextRun({
          text: '◦ ',
          bold: true,
          color: COLORS.GOLD,
          size: 20,
          font: 'Times New Roman'
        }),
        ...parseInlineMarkdown(subContent, {
          color: COLORS.DARK_SLATE,
          size: 20
        })
      ];
      paras.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 600 },
          spacing: { before: 20, after: 20, line: 240 },
          children: runs
        })
      );
    } else if (bulletMatch) {
      const bulletContent = bulletMatch[2].trim();
      const runs = [
        new TextRun({
          text: '• ',
          bold: true,
          color: COLORS.NAVY,
          size: 20,
          font: 'Times New Roman'
        }),
        ...parseInlineMarkdown(bulletContent, {
          color: COLORS.DARK_SLATE,
          size: 20
        })
      ];
      paras.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 360 },
          spacing: { before: 30, after: 30, line: 240 },
          children: runs
        })
      );
    } else {
      const runs = parseInlineMarkdown(trimmed, {
        bold: isFirstCol,
        color: isFirstCol ? COLORS.NAVY : COLORS.DARK_SLATE,
        size: 20
      });
      paras.push(
        new Paragraph({
          alignment: isFirstCol ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
          spacing: { before: 30, after: 30, line: 240 },
          children: runs
        })
      );
    }
  });

  if (paras.length === 0) {
    paras.push(
      new Paragraph({
        spacing: { before: 30, after: 30, line: 240 },
        children: [new TextRun({ text: '', size: 20 })]
      })
    );
  }

  return paras;
}

/**
 * Tạo ô TableCell với kích thước DXA chuẩn xác 100%
 */
function createTableCell(content, options = {}) {
  const {
    isHeader = false,
    widthDxa = 4500,
    bgColor = isHeader ? COLORS.NAVY : null,
    isFirstCol = false
  } = options;

  const paragraphs = formatCellParagraphs(content, isHeader, isFirstCol);

  const cellConfig = {
    width: { size: widthDxa, type: WidthType.DXA },
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
 * Tạo bảng Word từ các dòng Markdown table với columnWidths và w:tblGrid chuẩn xác
 */
function createWordTable(tableLines) {
  if (tableLines.length < 2) return null;

  // Lọc bỏ dòng phân cách | :--- | :--- |
  const validRows = tableLines.filter(line => !line.match(/^\|\s*[:\-\s|]+\|$/));
  if (validRows.length === 0) return null;

  // Parse từng hàng thành mảng ô
  const parsedRows = validRows.map(line => {
    return line
      .split('|')
      .slice(1, -1)
      .map(cell => cell.trim());
  });

  const colCount = Math.max(...parsedRows.map(r => r.length));
  if (colCount === 0) return null;

  // Phân bổ chiều rộng cột theo tiêu chuẩn DXA khổ A4 (Tổng = 9026 DXA)
  let colWidthsDxa = [];

  if (colCount === 2) {
    // Tỷ lệ chuẩn cho Bảng Use Case: 2500 DXA Cột Thuộc Tính (~27.7%), 6526 DXA Cột Mô Tả (~72.3%)
    colWidthsDxa = [2500, 6526];
  } else if (colCount === 3) {
    // Tỷ lệ chuẩn cho Bảng 3 Cột (Từ viết tắt / Thuật ngữ / Định nghĩa)
    colWidthsDxa = [1800, 3200, 4026];
  } else if (colCount === 4) {
    colWidthsDxa = [1500, 2500, 2500, 2526];
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

      cells.push(
        createTableCell(cellText, {
          isHeader: isHeader,
          widthDxa: cellWidth,
          bgColor: isHeader ? COLORS.NAVY : (isFirstCol ? COLORS.BG_LIGHT : null),
          isFirstCol: isFirstCol
        })
      );
    }

    return new TableRow({
      tableHeader: isHeader,
      cantSplit: isHeader, // Header không tách, các row dài tự động tách trang mượt mà
      children: cells
    });
  });

  return new Table({
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: colWidthsDxa, // BẮT BUỘC: ĐỂ w:tblGrid SINH RA ĐÚNG 2500 & 6526 DXA!
    alignment: AlignmentType.CENTER,
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
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLORS.GOLD },
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
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [TOTAL_TABLE_WIDTH],
    alignment: AlignmentType.CENTER,
    rows: [new TableRow({ children: [calloutCell] })]
  }));
  elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

  return elements;
}

/**
 * HÀM CHÍNH BUILD TÀI LIỆU DOCX & DOC
 */
async function buildDocxFromMarkdown() {
  const mdPath = path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.md');

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
  const coverColWidths = [2800, 4700];
  const coverInfoTable = new Table({
    width: { size: 7500, type: WidthType.DXA },
    columnWidths: coverColWidths,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          createTableCell('Cơ Quan Ban Hành:', { widthDxa: coverColWidths[0], bold: true, isFirstCol: true }),
          createTableCell('Ban Chấp Hành CLB Doanh Nhân CEO 1983', { widthDxa: coverColWidths[1], bold: true })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Phiên Bản Hệ Thống:', { widthDxa: coverColWidths[0], bold: true, isFirstCol: true }),
          createTableCell('Version 6.0 (Cập nhật Tháng 11/2026)', { widthDxa: coverColWidths[1], bold: true })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Tổng Số Nghiệp Vụ:', { widthDxa: coverColWidths[0], bold: true, isFirstCol: true }),
          createTableCell('147 Use Cases Toàn Diện (10 PUB + 84 CRM + 53 APP)', { widthDxa: coverColWidths[1], bold: true })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Cấp Độ Bảo Mật:', { widthDxa: coverColWidths[0], bold: true, isFirstCol: true }),
          createTableCell('LƯU HÀNH NỘI BỘ & NGHIỆM THU CHÍNH THỨC', { widthDxa: coverColWidths[1], bold: true })
        ]
      }),
      new TableRow({
        children: [
          createTableCell('Hạ Tầng Triển Khai:', { widthDxa: coverColWidths[0], bold: true, isFirstCol: true }),
          createTableCell('Production Server VPS | CRM & Mobile App Tách Biệt Độc Lập', { widthDxa: coverColWidths[1] })
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
        size: 21,
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
      size: 21,
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

  console.log('Đang đóng gói file Microsoft Word (.docx & .doc)...');
  const buffer = await docx.Packer.toBuffer(doc);

  // Danh sách các tệp xuất bản (cả .docx và .doc)
  const targets = [
    path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx'),
    path.join(__dirname, '../document/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.doc'),
    path.join(__dirname, '../document/SRS_CEO1983_HE_THONG_TOAN_DIEN.docx'),
    path.join(__dirname, '../document/SRS_CEO1983_HE_THONG_TOAN_DIEN.doc'),
    path.join(__dirname, '../apps/ceo1983_app_fe/public/docs/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx'),
    path.join(__dirname, '../apps/ceo1983_app_fe/public/docs/SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.doc')
  ];

  targets.forEach(t => {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(t, buffer);
    console.log(`✓ Đã xuất thành công: ${t}`);
  });

  console.log('\nHOÀN TẤT XUẤT BẢN WORD TÀI LIỆU SRS CEO 1983 V6.0!');
}

buildDocxFromMarkdown().catch(err => {
  console.error('Lỗi khi build tài liệu Word:', err);
  process.exit(1);
});
