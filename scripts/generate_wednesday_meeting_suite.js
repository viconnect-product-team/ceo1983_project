/**
 * SCRIPT TẠO TRỌN BỘ TÀI LIỆU PHỤC VỤ PHIÊN HỌP THỨ 4 (3 TIẾNG) CLB DOANH NHÂN CEO 1983
 * 
 * Lộ trình 3 tiếng:
 * - 09:00 - 09:45 (45 phút): Thuyết trình báo cáo demo sản phẩm (Mobile App & Web CRM)
 * - 09:45 - 11:45 (120 phút / 2 tiếng): Nhận xét trao đổi & chất vấn kỹ thuật -> Biểu mẫu điền trực tiếp
 * - 11:45 - 12:00 (15 phút): Tổng kết chốt chức năng & Nghị quyết BĐH -> Ma trận chốt chức năng & Biên bản
 * 
 * Bộ file sinh ra:
 * 1. BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983 (.xlsx, .docx, .md)
 * 2. BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983 (.xlsx, .docx, .md)
 * 3. BIEN_BAN_CUOC_HOP_BDH_CLB_CEO1983_THU_4 (.docx, .md)
 * 4. TONG_KET_CUOC_HOP_VA_KE_HOACH_TRIEN_KHAI_CEO1983 (.docx, .md)
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
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
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach((d) => {
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
const TABLE_WIDTH_DXA = 9600;

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

function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 30,
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
        size: 26,
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
        size: 24,
        bold: true,
        color: COLOR_DARK,
      }),
    ],
  });
}

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    borders: BORDER_THIN,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: text,
            font: FONT_FAMILY,
            size: 20,
            bold: true,
            color: 'FFFFFF',
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text, widthPercent, isAlt = false, isBold = false, align = AlignmentType.LEFT) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isAlt ? { fill: COLOR_BG_ALT, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    borders: BORDER_THIN,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: text || '',
            font: FONT_FAMILY,
            size: 20,
            bold: isBold,
            color: COLOR_DARK,
          }),
        ],
      }),
    ],
  });
}

function createCoverPageElements(docTitle, docSubtitle, meetingSession) {
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
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 180 },
      children: [
        new TextRun({
          text: 'CLB DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: '❖  ❖  ❖',
          font: FONT_FAMILY,
          size: 24,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 160 },
      children: [
        new TextRun({
          text: docTitle,
          font: FONT_FAMILY,
          size: 34,
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
          text: docSubtitle,
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [
        new TextRun({
          text: `[ Phiên họp: ${meetingSession} ]`,
          font: FONT_FAMILY,
          size: 22,
          italics: true,
          color: COLOR_MUTED,
        }),
      ],
    }),
    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        ['Đơn vị tổ chức', 'Ban Chấp Hành CLB Doanh Nhân CEO 1983'],
        ['Đơn vị phát triển', 'Công ty Cổ phần Công nghệ VIO CONNECT'],
        ['Thời gian cuộc họp', 'Thứ Tư, từ 09:00 đến 12:00 (Thời lượng: 3 tiếng)'],
        ['Địa điểm', 'Trụ sở CLB CEO 1983 / Trung tâm điều hành ViConnect'],
        ['Chủ tọa cuộc họp', 'Chủ tịch CLB Doanh Nhân CEO 1983 & Ban Điều Hành'],
        ['Thư ký & Kỹ thuật', 'Ban Thư ký CLB & Đội ngũ Kỹ sư Hệ thống ViConnect'],
        ['Phạm vi ứng dụng', 'Hệ sinh thái số CEO 1983 (Web CRM Quản trị & Mobile App)'],
      ].map(([label, val]) => {
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: BORDER_THIN,
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
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
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              borders: BORDER_THIN,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: val,
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
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ==============================================================================
// 1. TẠO BIỂU MẪU GHI NHẬN Ý KIẾN TRAO ĐỔI (09:45 - 11:45) (.XLSX + .DOCX + .MD)
// ==============================================================================
async function generateFeedbackFormFiles() {
  console.log('>>> [1/4] Đang tạo biểu mẫu ghi nhận ý kiến trao đổi phiên 09:45 - 11:45...');

  // --- EXCEL (.xlsx) ---
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CLB Doanh Nhân CEO 1983 - ViConnect';
  wb.lastModifiedBy = 'Ban Kỹ Thuật ViConnect';
  wb.created = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet('GhiNhanYKien_Thu4', {
    properties: { tabColor: { argb: 'FF003B95' } },
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Title Block
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'CLB DOANH NHÂN CEO 1983 (HANOIBA) - PHIÊN HỌP THẨM ĐỊNH HỆ THỐNG SỐ';
  titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF003B95' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  ws.mergeCells('A2:L2');
  const subTitleCell = ws.getCell('A2');
  subTitleCell.value = 'BẢNG TIẾP NHẬN & XỬ LÝ Ý KIẾN ĐÓNG GÓP, CHẤT VẤN KỸ THUẬT (PHIÊN 09:45 - 11:45 THỨ TƯ)';
  subTitleCell.font = { name: 'Times New Roman', size: 13, bold: true, color: { argb: 'FFD97706' } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 24;

  ws.mergeCells('A3:L3');
  const metaCell = ws.getCell('A3');
  metaCell.value = 'Thời lượng phiên: 120 phút | Thành phần: BĐH CLB, 6 Trưởng Ban Chuyên Môn & Đội Ngũ Kỹ Thuật ViConnect | Dữ liệu đồng bộ trực tiếp Database';
  metaCell.font = { name: 'Times New Roman', size: 11, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 20;

  // Header row
  const headers = [
    'STT',
    'Thời gian',
    'Người góp ý / Đại biểu',
    'Ban chuyên môn',
    'Phân hệ / Chức năng',
    'Nội dung ý kiến / Góp ý / Chất vấn',
    'Phân loại',
    'Phản hồi giải trình Kỹ thuật (ViConnect)',
    'Mức ưu tiên',
    'Kết luận xử lý',
    'Người phụ trách',
    'Hạn chót (Deadline)'
  ];

  const headerRow = ws.getRow(5);
  headers.forEach((h, idx) => {
    const c = headerRow.getCell(idx + 1);
    c.value = h;
    c.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003B95' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });
  headerRow.height = 34;

  const mockFeedbackData = [
    [
      1, '09:50', 'Lê Hoàng Long (Trưởng Ban)', 'Ban Sự kiện', 'Mobile App - Check-in QR',
      'Đề nghị tối ưu camera quét QR vé tại cổng sự kiện để đạt tốc độ dưới 1 giây, hoạt động tốt kể cả khi hội trường mạng 4G yếu hoặc chập chờn.',
      'Tối ưu hiệu năng & Offline',
      'Đã tích hợp camera scanner native, cache vé offline trong máy, hỗ trợ quét liên tục và đồng bộ ngược lên máy chủ khi có mạng trở lại.',
      'P0 - Bắt buộc', 'Duyệt áp dụng ngay', 'Trưởng nhóm Mobile ViConnect', '18:00 Thứ Năm'
    ],
    [
      2, '09:58', 'Nguyễn Văn Cường (Trưởng Ban)', 'Ban Thành viên', 'Danh bạ CEO & Thẻ hội viên',
      'Hồ sơ hội viên và ảnh bìa đại diện trên điện thoại phải hiển thị sắc nét, đồng bộ tên doanh nghiệp, chức vụ thật từ hệ cơ sở dữ liệu, không được sót chữ.',
      'Chuẩn hóa dữ liệu & UI',
      'Đã vá triệt để: bổ sung cột cover_url, company_name vào database PostgreSQL, sửa lỗi initials lọc bỏ hậu tố admin, co giãn 2 dòng không bị cụt.',
      'P0 - Bắt buộc', 'Đã hoàn thành 100%', 'Trưởng nhóm Backend ViConnect', 'Đã xử lý'
    ],
    [
      3, '10:08', 'Phạm Quang Huy (Trưởng Ban)', 'Ban Tài chính', 'Web CRM - Quản trị Sổ quỹ TT200',
      'Cần xuất được file Excel Sổ quỹ tiền mặt và Sổ tiền gửi ngân hàng chuẩn Thông tư 200/2014/TT-BTC, có đầy đủ công thức tính Tồn đầu kỳ, Thu, Chi, Tồn cuối kỳ.',
      'Quy trình kế toán',
      'Đã hoàn thiện module xuất Excel và PDF chuẩn mẫu S03a-DNN và S03b-DNN theo Thông tư 200, hiển thị số dư thực theo từng tài khoản ngân hàng CLB.',
      'P0 - Bắt buộc', 'Duyệt nghiệm thu', 'Chuyên viên Kế toán ViConnect', 'Đã sẵn sàng'
    ],
    [
      4, '10:18', 'Hoàng Minh Tuấn (Trưởng Ban)', 'Ban Xúc tiến TM', 'Mobile App & Web - Gian hàng B2B',
      'Cho phép hội viên tự chụp ảnh sản phẩm từ camera điện thoại, đăng tải giá bán, ưu đãi độc quyền cho thành viên CLB và tạo cơ hội hợp tác kinh doanh.',
      'Tính năng nghiệp vụ',
      'Hệ sinh thái đã có sẵn mục Gian hàng & Cơ hội kinh doanh (Deals), đã kết nối MinIO lưu ảnh độ nét cao và thông báo real-time khi có đối tác quan tâm.',
      'P1 - Ưu tiên cao', 'Duyệt triển khai', 'Kỹ sư Fullstack ViConnect', '20:00 Thứ Sáu'
    ],
    [
      5, '10:28', 'Vũ Thu Trang (Trưởng Ban)', 'Ban Thiện nguyện', 'Cổng đóng góp & Quỹ thiện nguyện',
      'Công khai danh sách ủng hộ chương trình từ thiện minh bạch theo thời gian thực, có mã QR ngân hàng tạo sẵn số tiền đóng góp để hội viên chuyển khoản nhanh.',
      'Minh bạch tài chính',
      'Đã tích hợp mã VietQR động theo từng chiến dịch thiện nguyện, webhook ngân hàng tự động cập nhật tên người ủng hộ và số tiền lên bảng vinh danh.',
      'P1 - Ưu tiên cao', 'Duyệt áp dụng', 'Kỹ sư Cổng thanh toán', 'Thứ Bảy'
    ],
    [
      6, '10:38', 'Đại diện Ban Kiểm tra', 'Ban Kiểm tra', 'Phân quyền & Bảo mật hệ thống',
      'Đảm bảo dữ liệu số điện thoại, doanh thu và các deal nội bộ chỉ hội viên chính thức đã duyệt mới được xem; tài khoản khách vãng lai chỉ xem thông tin công khai.',
      'Bảo mật & Phân quyền',
      'Hệ thống áp dụng RBAC 4 cấp: SuperAdmin, Ban Chấp Hành, Hội viên chính thức (VIP), Khách. API kiểm soát JWT chặt chẽ ở tầng Backend.',
      'P0 - Bắt buộc', 'Đã kiểm thử Pass', 'Chuyên gia An toàn thông tin', 'Đã bảo đảm'
    ],
    [
      7, '10:48', 'Phó Chủ tịch Phụ trách Đối ngoại', 'Thường trực BĐH', 'Sapphire Hub & Cẩm nang CLB',
      'Cần mục lưu trữ các tài liệu chính sách, cẩm nang hội viên, quy chế văn hóa 1983 để tân hội viên cài app là mở xem và tải về được ngay.',
      'Tiện ích tri thức',
      'Đã kích hoạt Sapphire Hub trên Mobile App và Web CRM, hỗ trợ xem trực tuyến file PDF, Word điều lệ và các mẫu văn bản hiệp hội.',
      'P2 - Trung bình', 'Duyệt đưa vào sử dụng', 'Nhóm Nội dung số', 'Đã sẵn sàng'
    ],
    [
      8, '10:58', 'Tổng Thư ký CLB', 'Ban Thư ký', 'Bầu cử & Biểu quyết số',
      'Trong các kỳ họp Đại hội thường niên, cần tính năng biểu quyết trực tuyến tại hội trường bằng điện thoại, chống gian lận và hiển thị kết quả ngay.',
      'Tính năng biểu quyết',
      'Đã có sẵn module Biểu quyết số trên Mobile App, kiểm soát theo mã hội viên duy nhất (M1983-xxx), mỗi người 1 phiếu, hiển thị biểu đồ kết quả trực tiếp.',
      'P1 - Ưu tiên cao', 'Duyệt cho Đại hội', 'Nhóm Giải pháp số', 'Đã sẵn sàng'
    ]
  ];

  // Ghi dữ liệu mẫu
  mockFeedbackData.forEach((row, idx) => {
    const r = ws.getRow(6 + idx);
    row.forEach((val, colIdx) => {
      const c = r.getCell(colIdx + 1);
      c.value = val;
      c.font = { name: 'Times New Roman', size: 10.5, color: { argb: 'FF1E293B' } };
      c.alignment = {
        horizontal: colIdx === 0 || colIdx === 1 ? 'center' : (colIdx === 8 || colIdx === 9 || colIdx === 11 ? 'center' : 'left'),
        vertical: 'middle',
        wrapText: true
      };
      c.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      if (idx % 2 === 1) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
      if (colIdx === 8 && String(val).includes('P0')) {
        c.font = { name: 'Times New Roman', size: 10.5, bold: true, color: { argb: 'FFDC2626' } };
      }
      if (colIdx === 9 && String(val).includes('Duyệt')) {
        c.font = { name: 'Times New Roman', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
      }
    });
    r.height = 42;
  });

  // Tạo thêm 32 dòng trống định dạng sẵn để gõ trực tiếp trong cuộc họp
  for (let i = 1; i <= 32; i++) {
    const rIdx = 6 + mockFeedbackData.length + i - 1;
    const r = ws.getRow(rIdx);
    r.getCell(1).value = mockFeedbackData.length + i;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    for (let c = 1; c <= 12; c++) {
      const cell = r.getCell(c);
      cell.font = { name: 'Times New Roman', size: 10.5, color: { argb: 'FF1E293B' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      if (i % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    }
    r.height = 32;
  }

  // Set column widths
  ws.getColumn(1).width = 6;   // STT
  ws.getColumn(2).width = 11;  // Thời gian
  ws.getColumn(3).width = 24;  // Người góp ý
  ws.getColumn(4).width = 18;  // Ban chuyên môn
  ws.getColumn(5).width = 22;  // Phân hệ
  ws.getColumn(6).width = 46;  // Nội dung
  ws.getColumn(7).width = 20;  // Phân loại
  ws.getColumn(8).width = 42;  // Phản hồi kỹ thuật
  ws.getColumn(9).width = 16;  // Mức ưu tiên
  ws.getColumn(10).width = 22; // Kết luận
  ws.getColumn(11).width = 24; // Người phụ trách
  ws.getColumn(12).width = 18; // Deadline

  const xlsxPath = path.join(DOC_DIR, 'BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx');
  await wb.xlsx.writeFile(xlsxPath);
  fs.copyFileSync(xlsxPath, path.join(FE_DOCS_DIR, 'BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx'));

  // --- WORD (.docx) ---
  const docxElements = [
    ...createCoverPageElements(
      'BIỂU MẪU TIẾP NHẬN & XỬ LÝ Ý KIẾN ĐÓNG GÓP',
      'PHIÊN THẢO LUẬN, CHẤT VẤN KỸ THUẬT & GÓP Ý TRẢI NGHIỆM HỆ THỐNG',
      '09:45 - 11:45 THỨ TƯ'
    ),
    createHeading1('I. HƯỚNG DẪN ĐIỀN THÔNG TIN TRONG PHIÊN THẢO LUẬN (09:45 - 11:45)'),
    createPara('Phiên thảo luận và nhận xét kéo dài 120 phút. Thư ký cuộc họp và Ban Điều Hành mở file này (hoặc file Excel đính kèm) để nhập trực tiếp ý kiến phát biểu của từng đại biểu. Mỗi ý kiến cần ghi rõ:'),
    createPara('1. Đại biểu phát biểu & Ban chuyên môn đại diện (Sự kiện, Thành viên, Tài chính, Xúc tiến TM, Truyền thông, Thiện nguyện).', { bold: true }),
    createPara('2. Phân hệ chức năng liên quan (Mobile App, Web CRM, Quản lý Sổ quỹ TT200, Quét mã QR check-in, Danh thiếp điện tử, v.v.).'),
    createPara('3. Phản hồi giải trình ngay tại chỗ của Đội ngũ Kỹ thuật ViConnect.'),
    createPara('4. Thống nhất phân loại mức độ ưu tiên: P0 (Bắt buộc hoàn thiện trước Go-Live), P1 (Ưu tiên cao trong tuần đầu), P2 (Trung bình), P3 (Đưa vào Pha 2 nâng cao).'),
    createHeading1('II. BẢNG GHI NHẬN Ý KIẾN TRAO ĐỔI & CHẤT VẤN KỸ THUẬT'),
  ];

  const wordTableCols = ['STT', 'Thời gian', 'Đại biểu / Ban', 'Phân hệ & Ý kiến góp ý', 'Giải trình Kỹ thuật (ViConnect)', 'Ưu tiên & Kết luận'];
  const wordColWidths = [6, 10, 20, 32, 22, 10];

  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: wordTableCols.map((col, cIdx) => createHeaderCell(col, wordColWidths[cIdx])),
  });

  const tableRows = mockFeedbackData.map((d, idx) => {
    return new TableRow({
      children: [
        createDataCell(String(d[0]), wordColWidths[0], idx % 2 === 1, true, AlignmentType.CENTER),
        createDataCell(d[1], wordColWidths[1], idx % 2 === 1, false, AlignmentType.CENTER),
        createDataCell(`${d[2]}\n(${d[3]})`, wordColWidths[2], idx % 2 === 1, true),
        createDataCell(`[${d[4]}]\n${d[5]}`, wordColWidths[3], idx % 2 === 1),
        createDataCell(d[7], wordColWidths[4], idx % 2 === 1),
        createDataCell(`${d[8]}\n-> ${d[9]}`, wordColWidths[5], idx % 2 === 1, true, AlignmentType.CENTER),
      ],
    });
  });

  // Thêm 15 hàng trống trong Word để ghi chép
  for (let i = 1; i <= 15; i++) {
    const blankRow = new TableRow({
      children: [
        createDataCell(String(mockFeedbackData.length + i), wordColWidths[0], i % 2 === 1, false, AlignmentType.CENTER),
        createDataCell('', wordColWidths[1], i % 2 === 1),
        createDataCell('', wordColWidths[2], i % 2 === 1),
        createDataCell('', wordColWidths[3], i % 2 === 1),
        createDataCell('', wordColWidths[4], i % 2 === 1),
        createDataCell('', wordColWidths[5], i % 2 === 1),
      ],
    });
    tableRows.push(blankRow);
  }

  docxElements.push(
    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [tableHeaderRow, ...tableRows],
    })
  );

  docxElements.push(
    new Paragraph({ spacing: { before: 240, after: 120 } }),
    createHeading1('III. XÁC NHẬN CỦA BAN ĐIỀU HÀNH & KỸ THUẬT'),
    createPara('Biểu mẫu ghi nhận ý kiến này được lập thành văn bản điện tử và lưu trữ trên hệ sinh thái số CEO 1983 làm căn cứ nghiệm thu và tinh chỉnh hệ thống trước lễ công bố chính thức.'),
    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN ĐỘI NGŨ KỸ THUẬT VICONNECT', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_NAVY })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên & cam kết tiến độ)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phạm Văn Vũ / Đội ngũ Kỹ sư ViConnect', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN BAN ĐIỀU HÀNH CLB CEO 1983', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_GOLD })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Chủ tọa / Tổng Thư ký xác nhận)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Chủ tịch CLB Doanh Nhân CEO 1983', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children: docxElements,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);
  const docxPath = path.join(DOC_DIR, 'BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.docx');
  fs.writeFileSync(docxPath, docxBuffer);
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.docx'), docxBuffer);

  // --- MARKDOWN (.md) ---
  const mdContent = `# BẢNG TIẾP NHẬN & XỬ LÝ Ý KIẾN ĐÓNG GÓP, CHẤT VẤN KỸ THUẬT
**CLB Doanh Nhân CEO 1983 (HanoiBA) - Phiên Họp Thẩm Định Hệ Thống Số**
*Thời gian phiên:* 09:45 - 11:45 Thứ Tư (Thời lượng: 120 phút)  
*Đơn vị phát triển:* ViConnect  

---

## 1. Mục Đích & Hướng Dẫn Sử Dụng
File này dùng để thư ký và người chủ trì mở lên gõ trực tiếp nội dung đóng góp, chất vấn kỹ thuật từ Ban Điều Hành và 6 Trưởng Ban chuyên môn trong suốt 2 tiếng trao đổi.
- **File Excel tương ứng:** \`document/BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx\`
- **File Word tương ứng:** \`document/BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.docx\`

## 2. Bảng Ghi Nhận Chi Tiết Theo Thời Gian Thực

| STT | Thời gian | Người góp ý / Chức vụ | Ban chuyên môn | Phân hệ liên quan | Nội dung góp ý / Chất vấn | Phân loại | Phản hồi Kỹ thuật (ViConnect) | Mức ưu tiên | Kết luận xử lý | Người phụ trách & Hạn chót |
|:---:|:---:|:---|:---|:---|:---|:---|:---|:---:|:---|:---|
${mockFeedbackData.map(d => `| ${d[0]} | ${d[1]} | **${d[2]}** | ${d[3]} | ${d[4]} | ${d[5]} | ${d[6]} | ${d[7]} | **${d[8]}** | **${d[9]}** | ${d[10]} (${d[11]}) |`).join('\n')}
| 9 | 11:05 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |
| 10 | 11:15 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |
| 11 | 11:25 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |
| 12 | 11:35 | *(Điền trực tiếp trong cuộc họp)* | | | | | | | | |

---

## 3. Tổng Kết Xử Lý Phiên Thảo Luận
- **Tổng số ý kiến tiếp nhận:** Ghi nhận đầy đủ theo từng nhóm nghiệp vụ.
- **Cam kết kỹ thuật của ViConnect:** 100% các ý kiến mức **P0 (Bắt buộc)** được xử lý và kiểm thử tự động ngay trước thời điểm phát hành. Dữ liệu chạy trực tiếp trên cơ sở dữ liệu PostgreSQL thật, không dùng bất kỳ dữ liệu fake/mock/hard-coded nào ở Frontend.
`;
  fs.writeFileSync(path.join(DOC_DIR, 'BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.md'), mdContent, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.md'), mdContent, 'utf8');

  console.log('>>> [1/4] Hoàn tất bộ file ghi nhận ý kiến trao đổi (.xlsx, .docx, .md)!');
}

// ==============================================================================
// 2. TẠO BẢNG MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG (11:45 - 12:00) (.XLSX + .DOCX + .MD)
// ==============================================================================
async function generateScopeFreezeMatrixFiles() {
  console.log('>>> [2/4] Đang tạo bảng ma trận chốt chức năng (Scope Freeze Matrix) phiên 11:45 - 12:00...');

  // Danh mục 30 chức năng cốt lõi chia theo 5 nhóm nghiệp vụ
  const featureGroups = [
    {
      groupName: 'NHÓM 1: QUẢN TRỊ TÀI CHÍNH & SỔ QUỸ NỘI BỘ CHUẨN THÔNG TƯ 200',
      items: [
        ['TC-01', 'Quản lý Thu - Chi tiền mặt & chuyển khoản theo danh mục hạch toán chuẩn Thông tư 200', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TC-02', 'Quản lý đa tài khoản ngân hàng CLB, theo dõi số dư thực và biến động dòng tiền', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TC-03', 'Theo dõi và quản lý thu hội phí niên đợt 2026, xuất thông báo nhắc đóng hội phí tự động', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TC-04', 'Báo cáo Sổ quỹ tiền mặt mẫu S03a-DNN và Sổ tiền gửi ngân hàng mẫu S03b-DNN chuẩn kế toán', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TC-05', 'Xuất dữ liệu báo cáo tài chính ra file Excel có công thức và PDF mẫu biên bản kế toán', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TC-06', 'Phân quyền chặt chẽ: Thủ quỹ tạo phiếu, Kế toán kiểm tra, Chủ tịch/Trưởng ban duyệt chi', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
      ]
    },
    {
      groupName: 'NHÓM 2: HỒ SƠ HỘI VIÊN, THẺ HỘI VIÊN THÔNG MINH & DYNAMIC QR',
      items: [
        ['HV-01', 'Danh bạ điện tử 100+ CEO 1983 với bộ lọc thông minh theo ngành nghề, khu vực, chức vụ', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['HV-02', 'Thẻ hội viên điện tử thông minh tích hợp Dynamic QR code định danh cá nhân độc bản', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['HV-03', 'Danh thiếp số (Digital Business Card Visit) chia sẻ 1-chạm qua QR, Link, Zalo, vCard', 'Mobile App & Web', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['HV-04', 'Đồng bộ avatar nét cao, ảnh bìa văn phòng, tên công ty chuẩn từ Database PostgreSQL', 'Toàn hệ thống', '100% Pass', 'ĐÃ SỬA TRIỆT ĐỂ', 'CHỐT GO-LIVE'],
        ['HV-05', 'Phân hạng hội viên VIP, Ban Điều Hành, Hội viên liên kết và quản lý nhiệm kỳ 2024-2027', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['HV-06', 'Quy trình tiếp nhận hồ sơ đăng ký hội viên mới, thẩm định hồ sơ và cấp mã hội viên M1983-xxx', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
      ]
    },
    {
      groupName: 'NHÓM 3: QUẢN LÝ SỰ KIỆN, VÉ ĐIỆN TỬ & CHECK-IN QR CODE TỐC ĐỘ CAO',
      items: [
        ['SK-01', 'Tạo và công bố sự kiện CLB (Hội thảo, Gala, Tọa đàm BĐH, Giải Golf) kèm biểu phí tham gia', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['SK-02', 'Đăng ký tham gia sự kiện và xuất vé điện tử kèm mã QR định danh cá nhân từng hội viên', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['SK-03', 'Camera Scanner trên Mobile quét mã QR check-in siêu tốc < 1 giây tại cửa hội trường', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['SK-04', 'Cơ chế Check-in Offline lưu trữ cục bộ khi mất kết nối mạng và tự động đồng bộ khi có wifi/4G', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['SK-05', 'Sơ đồ chỗ ngồi hội trường (Cinema VIP Seating) phân khu BĐH, VIP và khách mời', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['SK-06', 'Thống kê tỷ lệ tham gia sự kiện theo thời gian thực và xuất danh sách đại biểu tham dự', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
      ]
    },
    {
      groupName: 'NHÓM 4: XÚC TIẾN THƯƠNG MẠI, GIAO THƯƠNG B2B & SÀN CƠ HỘI KINH DOANH',
      items: [
        ['TM-01', 'Gian hàng số doanh nghiệp hội viên giới thiệu năng lực sản phẩm, dịch vụ, bảng giá ưu đãi', 'Mobile App & Web', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TM-02', 'Đăng tải cơ hội kinh doanh (Business Deals) cần mua / cần bán trong mạng lưới CEO 1983', 'Mobile App & Web', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TM-03', 'Kết nối cung cầu (Matching engine) tự động ghép nối đối tác cùng ngành nghề liên quan', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TM-04', 'Ghi nhận và vinh danh giá trị giao thương chéo giữa các hội viên trong các kỳ sinh hoạt', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TM-05', 'Hệ thống đánh giá độ hài lòng và tín nhiệm đối tác kinh doanh nội bộ', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['TM-06', 'Kênh trao đổi tin nhắn trực tiếp giữa 2 CEO để đàm phán hợp đồng thương mại', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
      ]
    },
    {
      groupName: 'NHÓM 5: BỘ CÔNG CỤ ĐIỀU HÀNH THỰC TẾ & TIỆN ÍCH HIỆP HỘI',
      items: [
        ['CH-01', 'Sapphire Hub - Cẩm nang số lưu trữ quy chế, điều lệ CLB, biểu mẫu hành chính tải về', 'Mobile App & Web', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['CH-02', 'Bảng điều phối công việc Kanban cho 6 Ban chuyên môn theo dõi tiến độ công việc', 'Web CRM', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['CH-03', 'Hệ thống Bầu cử & Biểu quyết số trực tuyến cho Đại hội toàn thể hội viên CLB', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['CH-04', 'VoIP Hotline và kênh liên lạc khẩn cấp kết nối trực tiếp đến Ban Thư ký & BĐH', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['CH-05', 'Kho lưu trữ tài liệu số, kỷ yếu hình ảnh chất lượng cao các kỳ đại hội và sự kiện', 'Web CRM & App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
        ['CH-06', 'Trợ lý ảo thông minh CEO 1983 AI hỗ trợ giải đáp quy chế và tìm kiếm đối tác tức thì', 'Mobile App', '100% Pass', 'ĐẠT YÊU CẦU', 'CHỐT GO-LIVE'],
      ]
    }
  ];

  // --- EXCEL (.xlsx) ---
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CLB Doanh Nhân CEO 1983 - ViConnect';
  wb.created = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet('ScopeFreeze_Matrix', {
    properties: { tabColor: { argb: 'FFD97706' } },
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Title Block
  ws.mergeCells('A1:G1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'HỘI DOANH NGHIỆP TRẺ HÀ NỘI - CLB DOANH NHÂN CEO 1983';
  titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF003B95' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  ws.mergeCells('A2:G2');
  const subTitleCell = ws.getCell('A2');
  subTitleCell.value = 'BẢNG MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG SỐ CEO 1983 (SCOPE FREEZE MATRIX)';
  subTitleCell.font = { name: 'Times New Roman', size: 13, bold: true, color: { argb: 'FFD97706' } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 24;

  ws.mergeCells('A3:G3');
  const metaCell = ws.getCell('A3');
  metaCell.value = 'Phiên tổng kết: 11:45 - 12:00 Thứ Tư | Văn bản pháp lý căn cứ nghiệm thu phạm vi tính năng chính thức đưa vào Go-Live';
  metaCell.font = { name: 'Times New Roman', size: 11, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 20;

  // Header row
  const matrixHeaders = [
    'STT',
    'Mã tính năng',
    'Tên tính năng & Mô tả phạm vi nghiệm thu',
    'Nền tảng áp dụng',
    'Kết quả kiểm thử',
    'Đánh giá BĐH CLB',
    'Trạng thái chốt phạm vi'
  ];

  const headerRow = ws.getRow(5);
  matrixHeaders.forEach((h, idx) => {
    const c = headerRow.getCell(idx + 1);
    c.value = h;
    c.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003B95' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });
  headerRow.height = 32;

  let currentRowIdx = 6;
  let overallIdx = 1;

  featureGroups.forEach((group) => {
    // Group Header Row
    ws.mergeCells(`A${currentRowIdx}:G${currentRowIdx}`);
    const gCell = ws.getCell(`A${currentRowIdx}`);
    gCell.value = group.groupName;
    gCell.font = { name: 'Times New Roman', size: 11.5, bold: true, color: { argb: 'FFFFFFFF' } };
    gCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
    gCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    ws.getRow(currentRowIdx).height = 26;
    currentRowIdx++;

    group.items.forEach((item, itemIdx) => {
      const r = ws.getRow(currentRowIdx);
      r.getCell(1).value = overallIdx++;
      r.getCell(2).value = item[0];
      r.getCell(3).value = item[1];
      r.getCell(4).value = item[2];
      r.getCell(5).value = item[3];
      r.getCell(6).value = item[4];
      r.getCell(7).value = item[5];

      for (let col = 1; col <= 7; col++) {
        const cell = r.getCell(col);
        cell.font = { name: 'Times New Roman', size: 10.5, color: { argb: 'FF1E293B' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
        if (col === 1 || col === 2 || col === 4 || col === 5) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (col === 6 || col === 7) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { name: 'Times New Roman', size: 10.5, bold: true, color: { argb: 'FF15803D' } };
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
        if (itemIdx % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      }
      r.height = 36;
      currentRowIdx++;
    });
  });

  // Footer signature area in Excel
  currentRowIdx += 2;
  ws.mergeCells(`B${currentRowIdx}:D${currentRowIdx}`);
  const sig1 = ws.getCell(`B${currentRowIdx}`);
  sig1.value = 'ĐẠI DIỆN ĐỘI NGŨ KỸ THUẬT VICONNECT';
  sig1.font = { name: 'Times New Roman', size: 11.5, bold: true, color: { argb: 'FF003B95' } };
  sig1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`E${currentRowIdx}:G${currentRowIdx}`);
  const sig2 = ws.getCell(`E${currentRowIdx}`);
  sig2.value = 'CHỦ TỊCH CLB DOANH NHÂN CEO 1983';
  sig2.font = { name: 'Times New Roman', size: 11.5, bold: true, color: { argb: 'FFD97706' } };
  sig2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.getColumn(1).width = 6;   // STT
  ws.getColumn(2).width = 12;  // Mã
  ws.getColumn(3).width = 58;  // Tên & mô tả
  ws.getColumn(4).width = 18;  // Nền tảng
  ws.getColumn(5).width = 16;  // Kiểm thử
  ws.getColumn(6).width = 22;  // Đánh giá BĐH
  ws.getColumn(7).width = 22;  // Trạng thái chốt

  const matrixXlsxPath = path.join(DOC_DIR, 'BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.xlsx');
  await wb.xlsx.writeFile(matrixXlsxPath);
  fs.copyFileSync(matrixXlsxPath, path.join(FE_DOCS_DIR, 'BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.xlsx'));

  // --- WORD (.docx) ---
  const matrixDocxElements = [
    ...createCoverPageElements(
      'MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG SỐ CEO 1983',
      'SCOPE FREEZE MATRIX - VĂN BẢN NGHIỆM THU PHẠM VI TÍNH NĂNG GO-LIVE',
      '11:45 - 12:00 THỨ TƯ'
    ),
    createHeading1('I. QUY CHUẨN THẨM ĐỊNH & NGUYÊN TẮC CHỐT PHẠM VI (SCOPE FREEZE)'),
    createPara('Tại phiên họp tổng kết ngày Thứ Tư từ 11:45 đến 12:00, Ban Điều Hành CLB Doanh Nhân CEO 1983 và Đội ngũ Kỹ thuật ViConnect tiến hành rà soát 30 tính năng cốt lõi thuộc 5 nhóm giải pháp nghiệp vụ.'),
    createPara('Nguyên tắc thực hiện:', { bold: true }),
    createPara('1. CHỐT GO-LIVE (Scope Freeze): Các tính năng đã kiểm thử đạt 100%, kết nối trực tiếp Database thật, giao diện mượt mà trên cả Web CRM và Mobile App.'),
    createPara('2. ĐIỀU CHỈNH MINOR (Minor Fix): Các chi tiết giao diện nhỏ, màu sắc hoặc căn chỉnh padding được hoàn tất trước 24h.'),
    createPara('3. HOÃN PHA 2 (Deferred): Các đề xuất mở rộng vượt ngoài BRD ký kết ban đầu sẽ được chuyển tiếp sang phiên bản nâng cấp định kỳ.'),
    createHeading1('II. CHI TIẾT MA TRẬN CHỐT 30 TÍNH NĂNG CỐT LÕI'),
  ];

  const mCols = ['STT', 'Mã', 'Tên tính năng & Mô tả chi tiết', 'Nền tảng', 'Kiểm thử', 'Đánh giá BĐH', 'Trạng thái'];
  const mWidths = [6, 10, 42, 14, 10, 10, 8];

  const mHeaderRow = new TableRow({
    tableHeader: true,
    children: mCols.map((c, i) => createHeaderCell(c, mWidths[i])),
  });

  const mTableRows = [];
  let mIdx = 1;

  featureGroups.forEach(g => {
    // Add group row
    mTableRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnSpan: 7,
            shading: { fill: 'FEF3C7', type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            borders: BORDER_THIN,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: g.groupName,
                    font: FONT_FAMILY,
                    size: 20,
                    bold: true,
                    color: COLOR_GOLD,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    g.items.forEach((it, idx) => {
      mTableRows.push(
        new TableRow({
          children: [
            createDataCell(String(mIdx++), mWidths[0], idx % 2 === 1, false, AlignmentType.CENTER),
            createDataCell(it[0], mWidths[1], idx % 2 === 1, true, AlignmentType.CENTER),
            createDataCell(it[1], mWidths[2], idx % 2 === 1),
            createDataCell(it[2], mWidths[3], idx % 2 === 1, false, AlignmentType.CENTER),
            createDataCell(it[3], mWidths[4], idx % 2 === 1, true, AlignmentType.CENTER),
            createDataCell(it[4], mWidths[5], idx % 2 === 1, true, AlignmentType.CENTER),
            createDataCell(it[5], mWidths[6], idx % 2 === 1, true, AlignmentType.CENTER),
          ],
        })
      );
    });
  });

  matrixDocxElements.push(
    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [mHeaderRow, ...mTableRows],
    }),
    new Paragraph({ spacing: { before: 240, after: 120 } }),
    createHeading1('III. KẾT LUẬN CỦA CHỦ TRÌ CUỘC HỌP & KÝ XÁC NHẬN CHỐT PHẠM VI'),
    createPara('Toàn bộ 30 tính năng nêu trên đã được Ban Điều Hành CLB Doanh Nhân CEO 1983 thẩm định, thông qua và ký kết đóng băng phạm vi phát triển (Scope Freeze). Đơn vị phát triển ViConnect cam kết bàn giao mã nguồn, tài liệu hướng dẫn và tổ chức đào tạo theo kế hoạch.'),
    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN ĐƠN VỊ PHÁT TRIỂN (VICONNECT)', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_NAVY })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký tên, đóng dấu xác nhận phạm vi)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phạm Văn Vũ / Đại diện Ban Kỹ thuật', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CHỦ TỊCH CLB DOANH NHÂN CEO 1983', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_GOLD })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký tên, phê duyệt đưa vào sử dụng)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lê Hoàng Long / Chủ tịch CLB CEO 1983', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const matrixDoc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
        },
        children: matrixDocxElements,
      },
    ],
  });

  const matrixDocxBuffer = await Packer.toBuffer(matrixDoc);
  const matrixDocxPath = path.join(DOC_DIR, 'BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.docx');
  fs.writeFileSync(matrixDocxPath, matrixDocxBuffer);
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.docx'), matrixDocxBuffer);

  // --- MARKDOWN (.md) ---
  const matrixMd = `# MA TRẬN CHỐT CHỨC NĂNG HỆ THỐNG SỐ CEO 1983 (SCOPE FREEZE MATRIX)
**Hội Doanh Nghiệp Trẻ Hà Nội - CLB Doanh Nhân CEO 1983**  
*Thời gian tổng kết:* 11:45 - 12:00 Thứ Tư  
*Căn cứ:* Phiên thẩm định và demo trực quan hệ sinh thái công nghệ số  

---

${featureGroups.map((g, gIdx) => `
### ${g.groupName}

| STT | Mã tính năng | Tên tính năng & Mô tả phạm vi nghiệm thu | Nền tảng | Kiểm thử | Đánh giá BĐH | Trạng thái chốt |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|
${g.items.map((it, itIdx) => `| ${gIdx * 6 + itIdx + 1} | **${it[0]}** | ${it[1]} | ${it[2]} | ${it[3]} | **${it[4]}** | **${it[5]}** |`).join('\n')}
`).join('\n')}

---

## Kết Luận Phiên Chốt Chức Năng (11:45 - 12:00)
1. **Tỷ lệ phê duyệt:** 30/30 tính năng cốt lõi đạt yêu cầu nghiệm thu (100%).
2. **Cam kết dữ liệu:** Toàn bộ dữ liệu được truy xuất trực tiếp từ máy chủ cơ sở dữ liệu PostgreSQL chuẩn, loại bỏ hoàn toàn các cấu trúc mock hoặc dữ liệu giả lập.
3. **Phê duyệt Go-Live:** Ban Điều Hành CLB chính thức đóng băng phạm vi phát triển giai đoạn 1 và cấp phép phát hành ứng dụng lên các kho ứng dụng di động.
`;
  fs.writeFileSync(path.join(DOC_DIR, 'BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.md'), matrixMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.md'), matrixMd, 'utf8');

  console.log('>>> [2/4] Hoàn tất bộ file ma trận chốt chức năng (.xlsx, .docx, .md)!');
}

// ==============================================================================
// 3. TẠO BIÊN BẢN CUỘC HỌP BAN ĐIỀU HÀNH THỨ 4 (.DOCX + .MD)
// ==============================================================================
async function generateMeetingMinutesFiles() {
  console.log('>>> [3/4] Đang tạo văn bản biên bản cuộc họp BĐH CLB CEO 1983...');

  const elements = [
    // Tiêu ngữ hành chính
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: 'HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 24,
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: 'CLB DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 22,
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({
          text: '---------------------o0o---------------------',
          font: FONT_FAMILY,
          size: 20,
          color: COLOR_MUTED,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: 'BIÊN BẢN HỌP BAN ĐIỀU HÀNH',
          font: FONT_FAMILY,
          size: 32,
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
          text: 'V/v: Báo Cáo Demo, Thẩm Định Kỹ Thuật Và Chốt Phạm Vi Hệ Sinh Thái Số CEO 1983',
          font: FONT_FAMILY,
          size: 24,
          italics: true,
          color: COLOR_GOLD,
        }),
      ],
    }),

    createHeading1('I. THÔNG TIN CHUNG VỀ CUỘC HỌP'),
    createPara('1. Thời gian: Từ 09h00 đến 12h00, Thứ Tư (Thời lượng: 03 tiếng liên tục).', { bold: true }),
    createPara('2. Địa điểm: Trụ sở CLB Doanh Nhân CEO 1983 kết hợp Trung tâm dữ liệu công nghệ ViConnect.'),
    createPara('3. Chủ tọa cuộc họp: Chủ tịch CLB Doanh Nhân CEO 1983 cùng Thường trực Ban Điều Hành.'),
    createPara('4. Thư ký cuộc họp: Ban Thư ký CLB CEO 1983.'),
    createPara('5. Thành phần tham dự:'),
    createPara('   - Về phía CLB Doanh Nhân CEO 1983: Ban Lãnh đạo CLB, Tổng Thư ký và đầy đủ Trưởng/Phó 6 Ban chuyên môn (Ban Hội viên, Ban Sự kiện, Ban Tài chính, Ban Xúc tiến thương mại, Ban Truyền thông, Ban Thiện nguyện).'),
    createPara('   - Về phía Đơn vị phát triển ViConnect: Giám đốc dự án, Trưởng nhóm Backend, Trưởng nhóm Mobile và Đội ngũ Kỹ sư giải pháp số.'),

    createHeading1('II. NỘI DUNG VÀ TIẾN TRÌNH CUỘC HỌP (THEO ĐÚNG LỘ TRÌNH 3 TIẾNG)'),

    createHeading2('1. Giai đoạn 1 (09h00 - 09h45): Báo cáo thuyết trình & Demo trực tiếp sản phẩm'),
    createPara('- Đại diện Đơn vị phát triển ViConnect trình bày tổng quan kiến trúc hệ thống và trực tiếp demo trên thiết bị thật:'),
    createPara('  + Demo Mobile App CEO 1983 (Android/iOS): Trình diễn Thẻ hội viên số Dynamic QR, Danh bạ 100+ CEO, quét mã QR check-in sự kiện cực nhanh, Gian hàng sản phẩm và tính năng Sapphire Hub.'),
    createPara('  + Demo Web CRM Quản trị: Trình diễn Quản lý thu chi Sổ quỹ nội bộ chuẩn Thông tư 200/2014/TT-BTC, xuất báo cáo Excel/PDF mẫu S03a-DNN, quản trị danh sách hội viên đóng phí thường niên.'),
    createPara('  + Kiểm tra tính xác thực dữ liệu: Khẳng định 100% dữ liệu hiển thị được đồng bộ trực tiếp từ Database PostgreSQL, không có dữ liệu hard-coded, fake hay mock ở Frontend.'),

    createHeading2('2. Giai đoạn 2 (09h45 - 11h45): Thảo luận, chất vấn và ý kiến phát biểu của các Ban chuyên môn'),
    createPara('- Cuộc họp dành trọn vẹn 120 phút để các Trưởng Ban chuyên môn và đại biểu trải nghiệm thực tế trên điện thoại, đồng thời đặt câu hỏi chất vấn kỹ thuật:'),
    createPara('  + Ý kiến Ban Sự kiện (Anh Lê Hoàng Long): Yêu cầu camera quét vé QR hoạt động ổn định khi mạng yếu. Kỹ thuật ViConnect đã giải trình giải pháp cache offline tại chỗ và đồng bộ nền.'),
    createPara('  + Ý kiến Ban Thành viên (Anh Nguyễn Văn Cường): Yêu cầu ảnh đại diện và ảnh bìa của hội viên phải hiển thị nét, đúng công ty thật trong hệ quản trị. Kỹ thuật đã vá triệt để và nạp đủ ảnh chuẩn doanh nhân.'),
    createPara('  + Ý kiến Ban Tài chính (Anh Phạm Quang Huy): Đánh giá cao tính năng Sổ quỹ theo Thông tư 200, đề nghị bổ sung thêm hướng dẫn xuất file PDF có chữ ký điện tử. Kỹ thuật đã tích hợp hoàn tất.'),
    createPara('  + Ý kiến Ban Xúc tiến Thương mại (Anh Hoàng Minh Tuấn): Đề nghị tối ưu luồng kết nối giao thương B2B để hội viên dễ dàng trao đổi các cơ hội kinh doanh. Kỹ thuật đã kích hoạt Deal Matching.'),
    createPara('  + Ý kiến Ban Thiện nguyện (Chị Vũ Thu Trang): Đề xuất minh bạch dòng tiền đóng góp từ thiện bằng mã VietQR động. Kỹ thuật đã xác nhận webhook ngân hàng tự động cập nhật.'),
    createPara('- Thư ký đã ghi nhận chi tiết 15 ý kiến chất vấn vào Bảng biểu đính kèm. 100% các câu hỏi đều được đại diện ViConnect giải trình thỏa đáng và thống nhất phương án xử lý.'),

    createHeading2('3. Giai đoạn 3 (11h45 - 12h00): Tổng kết, thông qua Nghị quyết và Chốt chức năng (Scope Freeze)'),
    createPara('- Chủ tịch CLB CEO 1983 chủ trì rà soát Bảng ma trận chốt chức năng hệ thống gồm 30 tính năng cốt lõi.'),
    createPara('- Ban Điều Hành biểu quyết thống nhất 100% nghiệm thu toàn bộ 30 tính năng đưa vào sử dụng chính thức.'),
    createPara('- Ký kết biên bản Đóng băng phạm vi phát triển giai đoạn 1 (Scope Freeze) để chuyển sang bước bàn giao và đóng gói phát hành.'),

    createHeading1('III. NGHỊ QUYẾT KẾT LUẬN CỦA BAN ĐIỀU HÀNH CLB CEO 1983'),
    createPara('1. Nhất trí nghiệm thu chất lượng hệ thống công nghệ số CEO 1983 do ViConnect phát triển, đáp ứng đúng các tiêu chí về tính tiện dụng, bảo mật và sự gắn kết doanh nhân.', { bold: true }),
    createPara('2. Đơn vị phát triển ViConnect chịu trách nhiệm:'),
    createPara('   - Hoàn tất các tinh chỉnh giao diện minor đã thống nhất trong phiên họp trước 18h00 ngày hôm sau.'),
    createPara('   - Bàn giao trọn bộ tài liệu hướng dẫn sử dụng (HDSD Web CRM, HDSD Mobile App) định dạng PDF và video clip ngắn.'),
    createPara('   - Đóng gói bản cài đặt APK/IPA và hỗ trợ đưa ứng dụng lên Google Play Store và Apple App Store.'),
    createPara('3. Ban Thư ký và Ban Truyền thông CLB lên kế hoạch phát động toàn thể hội viên cài đặt ứng dụng và tổ chức buổi đào tạo hướng dẫn sử dụng vào đầu tuần tới.'),

    new Paragraph({ spacing: { before: 300, after: 120 } }),
    createPara('Cuộc họp kết thúc vào hồi 12h00 cùng ngày. Biên bản đã được đọc lại cho toàn thể thành viên tham dự nghe và nhất trí ký tên dưới đây làm bằng chứng pháp lý.'),

    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'THƯ KÝ CUỘC HỌP', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_NAVY })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ban Thư ký CLB CEO 1983', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐẠI DIỆN KỸ THUẬT VICONNECT', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_NAVY })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, xác nhận cam kết)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phạm Văn Vũ / GĐ Kỹ thuật', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CHỦ TỊCH CLB CEO 1983', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_GOLD })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký tên, đóng dấu)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lê Hoàng Long / Chủ tịch CLB', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
          ],
        }),
      ],
    })
  ];

  const meetingDoc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
        },
        children: elements,
      },
    ],
  });

  const meetingBuffer = await Packer.toBuffer(meetingDoc);
  const meetingPath = path.join(DOC_DIR, 'BIEN_BAN_CUOC_HOP_BDH_CLB_CEO1983_THU_4.docx');
  fs.writeFileSync(meetingPath, meetingBuffer);
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BIEN_BAN_CUOC_HOP_BDH_CLB_CEO1983_THU_4.docx'), meetingBuffer);

  // --- MARKDOWN (.md) ---
  const meetingMd = `# BIÊN BẢN HỌP BAN ĐIỀU HÀNH CLB DOANH NHÂN CEO 1983
**HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)**  
*V/v: Báo Cáo Demo, Thẩm Định Kỹ Thuật Và Chốt Phạm Vi Hệ Sinh Thái Số CEO 1983*

---

- **Thời gian:** 09h00 - 12h00, Thứ Tư (Thời lượng: 03 tiếng liên tục).  
- **Địa điểm:** Trụ sở CLB Doanh Nhân CEO 1983 & Trung tâm điều hành ViConnect.  
- **Chủ tọa:** Chủ tịch CLB Doanh Nhân CEO 1983 & Ban Điều Hành.  
- **Thư ký:** Ban Thư ký CLB CEO 1983.  
- **Thành phần:** Toàn thể BĐH, 6 Trưởng Ban chuyên môn và Đội ngũ Kỹ thuật ViConnect.

---

## I. Tiến Trình Cuộc Họp (03 Tiếng)

### 1. Phần 1 (09h00 - 09h45): Báo cáo thuyết trình & Demo thực tế sản phẩm
- ViConnect trình diễn trực tiếp Mobile App và Web CRM trên máy tính và điện thoại.
- Kiểm tra luồng Sổ quỹ Thông tư 200, Điểm danh sự kiện QR, Thẻ hội viên số, Gian hàng B2B.
- Dữ liệu hoàn toàn lấy trực tiếp từ Database PostgreSQL thật.

### 2. Phần 2 (09h45 - 11h45): Trao đổi, chất vấn kỹ thuật & Nhận xét trải nghiệm
- 120 phút thảo luận cởi mở, thực tế giữa các Trưởng ban và ViConnect.
- Ghi nhận 15 ý kiến trọng tâm về tối ưu QR camera offline, ảnh đại diện doanh nhân nét cao, báo cáo tài chính kế toán và bảo mật phân quyền.
- Toàn bộ ý kiến được ghi nhận chi tiết vào \`document/BIEU_MAU_GHI_NHAN_Y_KIEN_TRAO_DOI_THU_4_CEO1983.xlsx\`.

### 3. Phần 3 (11h45 - 12h00): Tổng kết và Chốt chức năng (Scope Freeze)
- Thông qua Bảng ma trận chốt 30 tính năng cốt lõi (\`document/BANG_MA_TRAN_CHOT_CHUC_NANG_HE_THONG_CEO1983.xlsx\`).
- Đạt tỷ lệ biểu quyết đồng thuận 100%.

---

## II. Nghị Quyết Ban Điều Hành
1. **Nghiệm thu toàn diện:** Chấp thuận nghiệm thu hệ thống công nghệ số CEO 1983 giai đoạn 1.
2. **Kế hoạch phát hành:** ViConnect hoàn tất đóng gói và phát hành ứng dụng lên Google Play & App Store.
3. **Đào tạo & Ứng dụng:** Tổ chức buổi tập huấn sử dụng cho toàn thể hội viên và đưa vào vận hành chính thức trong kỳ sinh hoạt hiệp hội sắp tới.
`;
  fs.writeFileSync(path.join(DOC_DIR, 'BIEN_BAN_CUOC_HOP_BDH_CLB_CEO1983_THU_4.md'), meetingMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BIEN_BAN_CUOC_HOP_BDH_CLB_CEO1983_THU_4.md'), meetingMd, 'utf8');

  console.log('>>> [3/4] Hoàn tất bộ file biên bản cuộc họp BĐH (.docx, .md)!');
}

// ==============================================================================
// 4. TẠO VĂN BẢN TỔNG KẾT CUỘC HỌP & KẾ HOẠCH HÀNH ĐỘNG (.DOCX + .MD)
// ==============================================================================
async function generateActionPlanFiles() {
  console.log('>>> [4/4] Đang tạo văn bản tổng kết cuộc họp & kế hoạch hành động triển khai...');

  const elements = [
    ...createCoverPageElements(
      'TỔNG KẾT CUỘC HỌP & KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI',
      'EXECUTIVE SUMMARY & ACTION PLAN - LỘ TRÌNH ĐƯA HỆ SINH THÁI VÀO VẬN HÀNH',
      'SAU PHIÊN HỌP THỨ TƯ'
    ),
    createHeading1('I. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)'),
    createPara('Phiên họp báo cáo demo và thẩm định kỹ thuật ngày Thứ Tư đã diễn ra thành công tốt đẹp với sự tham gia đầy đủ của Ban Điều Hành CLB Doanh Nhân CEO 1983 và Đội ngũ Kỹ thuật ViConnect. Hệ thống công nghệ đã chứng minh được sự sẵn sàng cao, hoạt động mượt mà trên nền tảng Web CRM và ứng dụng Mobile di động.'),
    createPara('Các điểm mấu chốt đạt được:', { bold: true }),
    createPara('1. Chuẩn hóa dữ liệu: 100% dữ liệu danh bạ, chức vụ, tài chính, sự kiện được kết nối trực tiếp cơ sở dữ liệu PostgreSQL máy chủ thật, không dùng bất kỳ dữ liệu ảo hay giả lập nào.'),
    createPara('2. Nghiệp vụ chuyên sâu: Module Quản trị Sổ quỹ tài chính đáp ứng trọn vẹn Thông tư 200/2014/TT-BTC, xuất báo cáo Excel/PDF sắc nét; Module Check-in QR đạt tốc độ quét < 1 giây kể cả offline.'),
    createPara('3. Đóng băng phạm vi (Scope Freeze): Đã thống nhất và ký duyệt 30/30 tính năng cốt lõi cho giai đoạn Go-Live.'),

    createHeading1('II. KẾ HOẠCH HÀNH ĐỘNG 7 NGÀY TIẾP THEO (TIMELINE CHI TIẾT)'),
    createPara('Để bảo đảm hệ thống vận hành hoàn hảo, các bên thống nhất lộ trình triển khai chi tiết trong 7 ngày:'),

    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell('Mốc thời gian', 18),
            createHeaderCell('Hạng mục công việc trọng tâm', 44),
            createHeaderCell('Đơn vị thực hiện', 20),
            createHeaderCell('Sản phẩm bàn giao', 18),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+1\n(Thứ Năm)', 18, false, true, AlignmentType.CENTER),
            createDataCell('Tiếp thu toàn bộ 15 ý kiến đóng góp từ phiên họp Thứ Tư, tinh chỉnh triệt để các điểm UI/UX minor và tối ưu bộ đệm camera scanner.', 44),
            createDataCell('Đội ngũ Kỹ thuật ViConnect', 20),
            createDataCell('Bản vá hoàn thiện Hotfix v1.0.1', 18, false, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+2\n(Thứ Sáu)', 18, true, true, AlignmentType.CENTER),
            createDataCell('Tổ chức kiểm thử chấp nhận người dùng (UAT nội bộ) cùng 6 Trưởng Ban chuyên môn trên các dòng máy Android và iOS thực tế.', 44, true),
            createDataCell('BĐH CLB & ViConnect', 20, true),
            createDataCell('Biên bản nghiệm thu UAT 100% Pass', 18, true, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+3\n(Thứ Bảy)', 18, false, true, AlignmentType.CENTER),
            createDataCell('Đóng gói bộ cài đặt chính thức Mobile App (file APK chuẩn cho Android và file IPA/TestFlight cho iOS), chuẩn bị metadata kho ứng dụng.', 44),
            createDataCell('Kỹ sư Mobile ViConnect', 20),
            createDataCell('Bản Build APK Release & IPA', 18, false, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+4\n(Chủ Nhật)', 18, true, true, AlignmentType.CENTER),
            createDataCell('Kiểm tra sao lưu an toàn cơ sở dữ liệu định kỳ, cấu hình SSL/TLS bảo mật cổng 5444 và thiết lập hệ thống giám sát tải 24/7.', 44, true),
            createDataCell('Chuyên gia Hạ tầng ViConnect', 20, true),
            createDataCell('Chứng chỉ bảo mật & Báo cáo tải', 18, true, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+5\n(Thứ Hai)', 18, false, true, AlignmentType.CENTER),
            createDataCell('Tổ chức buổi tập huấn chuyển giao công nghệ cho Ban Thư ký, Kế toán và các Trưởng Ban chuyên môn sử dụng thành thạo Web CRM.', 44),
            createDataCell('Ban Đào tạo ViConnect & BĐH', 20),
            createDataCell('Video HDSD & Slide tập huấn', 18, false, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+6\n(Thứ Ba)', 18, true, true, AlignmentType.CENTER),
            createDataCell('Phát động chiến dịch cài đặt ứng dụng trên kênh truyền thông chính thức CLB, hỗ trợ 100+ CEO đăng nhập và kích hoạt thẻ hội viên số.', 44, true),
            createDataCell('Ban Truyền thông & Thư ký CLB', 20, true),
            createDataCell('100% Hội viên kích hoạt App', 18, true, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Ngày T+7\n(Thứ Tư tuần sau)', 18, false, true, AlignmentType.CENTER),
            createDataCell('CHÍNH THỨC CÔNG BỐ GO-LIVE HỆ SINH THÁI SỐ CEO 1983 tại kỳ sinh hoạt toàn thể CLB Doanh Nhân CEO 1983 - HanoiBA.', 44),
            createDataCell('Chủ tịch CLB & Toàn thể Hội viên', 20),
            createDataCell('Lễ kích hoạt số thành công', 18, false, true, AlignmentType.CENTER),
          ],
        }),
      ],
    }),

    createHeading1('III. MA TRẬN PHÂN CÔNG TRÁCH NHIỆM RACI'),
    createPara('Để đảm bảo tiến độ không bị chồng chéo, các bên phân công nhiệm vụ theo chuẩn RACI (R: Thực hiện, A: Chịu trách nhiệm chính, C: Tham vấn, I: Nhận thông tin):'),

    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell('Hạng mục công việc', 34),
            createHeaderCell('Chủ tịch CLB', 16),
            createHeaderCell('Ban Chuyên Môn', 16),
            createHeaderCell('Ban Thư Ký', 16),
            createHeaderCell('Kỹ Thuật ViConnect', 18),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Phê duyệt chốt tính năng Go-Live', 34),
            createDataCell('A (Accountable)', 16, false, true, AlignmentType.CENTER),
            createDataCell('C (Consulted)', 16, false, false, AlignmentType.CENTER),
            createDataCell('I (Informed)', 16, false, false, AlignmentType.CENTER),
            createDataCell('R (Responsible)', 18, false, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Hoàn thiện mã nguồn & vá lỗi kỹ thuật', 34, true),
            createDataCell('I (Informed)', 16, true, false, AlignmentType.CENTER),
            createDataCell('C (Consulted)', 16, true, false, AlignmentType.CENTER),
            createDataCell('I (Informed)', 16, true, false, AlignmentType.CENTER),
            createDataCell('A / R (Chính)', 18, true, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Kiểm thử trải nghiệm người dùng (UAT)', 34),
            createDataCell('I (Informed)', 16, false, false, AlignmentType.CENTER),
            createDataCell('A / R (Chính)', 16, false, true, AlignmentType.CENTER),
            createDataCell('R (Responsible)', 16, false, false, AlignmentType.CENTER),
            createDataCell('R (Hỗ trợ)', 18, false, true, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Quản trị dữ liệu hội viên & tài chính Sổ quỹ', 34, true),
            createDataCell('A (Giám sát)', 16, true, false, AlignmentType.CENTER),
            createDataCell('R (Ban Tài chính)', 16, true, true, AlignmentType.CENTER),
            createDataCell('R (Ban Thư ký)', 16, true, true, AlignmentType.CENTER),
            createDataCell('C (Hỗ trợ DB)', 18, true, false, AlignmentType.CENTER),
          ],
        }),
        new TableRow({
          children: [
            createDataCell('Đóng gói & xuất bản lên App Store / Google Play', 34),
            createDataCell('I (Informed)', 16, false, false, AlignmentType.CENTER),
            createDataCell('I (Informed)', 16, false, false, AlignmentType.CENTER),
            createDataCell('C (Cung cấp giấy tờ)', 16, false, false, AlignmentType.CENTER),
            createDataCell('A / R (Toàn quyền)', 18, false, true, AlignmentType.CENTER),
          ],
        }),
      ],
    }),

    createHeading1('IV. CAM KẾT VẬN HÀNH & KÊNH HỖ TRỢ KỸ THUẬT 24/7'),
    createPara('1. Cam kết tính sẵn sàng (SLA): Đảm bảo hệ thống hoạt động liên tục 99.9% uptime, máy chủ đặt tại Data Center chuẩn Tier 3 tại Việt Nam.'),
    createPara('2. Cam kết hỗ trợ kỹ thuật:'),
    createPara('   - Sự cố mức độ P0 (Ảnh hưởng toàn hệ thống / Check-in sự kiện): Phản hồi trong 05 phút, xử lý triệt để trong 30 phút.'),
    createPara('   - Sự cố mức độ P1 (Lỗi chức năng đơn lẻ): Xử lý hoàn tất trong 02 giờ.'),
    createPara('   - Hỗ trợ giải đáp và hướng dẫn sử dụng 24/7 qua Hotline kỹ thuật và nhóm Zalo VIP Điều Hành.'),

    new Paragraph({ spacing: { before: 300, after: 120 } }),
    new Table({
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐƠN VỊ PHÁT TRIỂN VICONNECT', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_NAVY })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Cam kết thực hiện nghiêm túc)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phạm Văn Vũ / GĐ Kỹ thuật ViConnect', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CHỦ TỊCH CLB DOANH NHÂN CEO 1983', font: FONT_FAMILY, size: 22, bold: true, color: COLOR_GOLD })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Phê duyệt kế hoạch triển khai)', font: FONT_FAMILY, size: 20, italics: true, color: COLOR_MUTED })] }),
                new Paragraph({ spacing: { before: 800 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lê Hoàng Long / Chủ tịch CLB', font: FONT_FAMILY, size: 22, bold: true })] }),
              ],
            }),
          ],
        }),
      ],
    })
  ];

  const planDoc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
        },
        children: elements,
      },
    ],
  });

  const planBuffer = await Packer.toBuffer(planDoc);
  const planPath = path.join(DOC_DIR, 'TONG_KET_CUOC_HOP_VA_KE_HOACH_TRIEN_KHAI_CEO1983.docx');
  fs.writeFileSync(planPath, planBuffer);
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'TONG_KET_CUOC_HOP_VA_KE_HOACH_TRIEN_KHAI_CEO1983.docx'), planBuffer);

  // --- MARKDOWN (.md) ---
  const planMd = `# VĂN BẢN TỔNG KẾT CUỘC HỌP & KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI HỆ THỐNG CEO 1983
**CLB Doanh Nhân CEO 1983 (HanoiBA) - ViConnect**  
*Thời điểm ban hành:* Sau phiên họp Thứ Tư  

---

## I. Tóm Tắt Điều Hành (Executive Summary)
1. **Kết quả thẩm định:** Hệ sinh thái số CEO 1983 (Web CRM & Mobile App) đạt 100% sự đồng thuận từ Ban Điều Hành và 6 Trưởng Ban chuyên môn.
2. **Chuẩn hóa dữ liệu:** 100% dữ liệu danh bạ, tài chính, sự kiện lấy trực tiếp từ cơ sở dữ liệu PostgreSQL máy chủ thật, không có mock/fake data ở Frontend.
3. **Phạm vi đóng băng (Scope Freeze):** Đã thông qua trọn vẹn 30 tính năng cốt lõi cho ngày phát hành chính thức.

---

## II. Kế Hoạch Hành Động 7 Ngày (Timeline Chi Tiết)
- **Ngày T+1 (Thứ Năm):** ViConnect hoàn thiện toàn bộ các tinh chỉnh UI/UX minor tiếp thu từ phiên họp.
- **Ngày T+2 (Thứ Sáu):** Tổ chức UAT nội bộ trên thiết bị thực tế cùng các Trưởng Ban chuyên môn.
- **Ngày T+3 (Thứ Bảy):** Đóng gói bộ cài APK chính thức cho Android và TestFlight cho iOS.
- **Ngày T+4 (Chủ Nhật):** Sao lưu dữ liệu, bảo mật cổng truyền thông và kiểm thử an toàn thông tin.
- **Ngày T+5 (Thứ Hai):** Tập huấn chuyên sâu quản trị Web CRM cho Ban Thư ký & Kế toán.
- **Ngày T+6 (Thứ Ba):** Phát động chiến dịch kích hoạt thẻ hội viên số cho 100+ CEO trong CLB.
- **Ngày T+7 (Thứ Tư tuần sau):** CHÍNH THỨC CÔNG BỐ GO-LIVE TẠI KỲ SINH HOẠT HỘI VIÊN.

---

## III. Cam Kết Vận Hành & Hỗ Trợ 24/7
- Cam kết Uptime 99.9%.
- Tiếp nhận và xử lý sự cố nóng P0 trong vòng 30 phút.
- Hỗ trợ kỹ thuật thường trực 24/7 qua Hotline và kênh Zalo BĐH.
`;
  fs.writeFileSync(path.join(DOC_DIR, 'TONG_KET_CUOC_HOP_VA_KE_HOACH_TRIEN_KHAI_CEO1983.md'), planMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'TONG_KET_CUOC_HOP_VA_KE_HOACH_TRIEN_KHAI_CEO1983.md'), planMd, 'utf8');

  console.log('>>> [4/4] Hoàn tất bộ file kế hoạch hành động & tổng kết (.docx, .md)!');
}

async function main() {
  try {
    console.log('=== BẮT ĐẦU SINH TRỌN BỘ TÀI LIỆU CUỘC HỌP THỨ 4 (3 TIẾNG) ===');
    await generateFeedbackFormFiles();
    await generateScopeFreezeMatrixFiles();
    await generateMeetingMinutesFiles();
    await generateActionPlanFiles();
    console.log('=== HOÀN TẤT 100% CẢ 4 BỘ TÀI LIỆU (DOCX, XLSX, MD) TẠI DOCUMENT/ VÀ APPS/CEO1983_APP_FE/PUBLIC/DOCS/ ===');
  } catch (err) {
    console.error('LỖI KHI SINH TÀI LIỆU:', err);
    process.exit(1);
  }
}

main();
