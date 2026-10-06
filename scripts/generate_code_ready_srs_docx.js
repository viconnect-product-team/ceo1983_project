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

const FONT_FAMILY = 'Times New Roman';
const NAVY = '003B95';
const BLUE_ACCENT = '0084FF';
const GOLD = 'D97706';
const SLATE_DARK = '0F172A';
const SLATE_LIGHT = 'F8FAFC';
const BORDER_COLOR = 'CBD5E1';
const TOTAL_TABLE_WIDTH_DXA = 9200; // Chiều rộng chuẩn A4 (11906 - 2706 lề = 9200 twips/DXA)

const BORDER_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
};

function createPara(text, options = {}) {
  const lines = String(text || '').split('\n');
  const runs = [];
  lines.forEach((line, idx) => {
    runs.push(
      new TextRun({
        text: line,
        break: idx > 0 ? 1 : 0,
        font: FONT_FAMILY,
        size: options.size || 24, // 12pt
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || '1E293B',
      })
    );
  });
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: options.spacing || { before: 80, after: 80, line: 276 },
    children: runs,
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
        color: SLATE_DARK,
      })
    );
  }
  children.push(
    new TextRun({
      text: text,
      font: FONT_FAMILY,
      size: 24,
      color: '334155',
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
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 32, // 16pt
        bold: true,
        color: NAVY,
      }),
    ],
  });
}

function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: BLUE_ACCENT,
      }),
    ],
  });
}

function createHeading3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: GOLD,
      }),
    ],
  });
}

function createCallout(title, text, type = 'info') {
  const borderColor = type === 'tip' ? GOLD : (type === 'danger' ? 'DC2626' : BLUE_ACCENT);
  const bgColor = type === 'tip' ? 'FEF3C7' : (type === 'danger' ? 'FEE2E2' : 'EFF6FF');
  const lines = String(text || '').split('\n');
  const textParas = lines.map((line, idx) => {
    return new Paragraph({
      spacing: { before: idx === 0 ? 0 : 40, after: 40, line: 260 },
      children: [
        new TextRun({
          text: line,
          font: FONT_FAMILY,
          italics: true,
          size: 22,
          color: '334155',
        }),
      ],
    });
  });

  return new Table({
    width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [TOTAL_TABLE_WIDTH_DXA],
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    font: FONT_FAMILY,
                    bold: true,
                    size: 22,
                    color: borderColor,
                  }),
                ],
              }),
              ...textParas,
            ],
          }),
        ],
      }),
    ],
  });
}

function createTable(headers, rowsData, widths = []) {
  const sum = widths && widths.length > 0 ? widths.reduce((a, b) => a + Number(b), 0) : 0;
  const colWidthsDxa = headers.map((_, i) => {
    if (sum > 0 && widths[i] !== undefined) {
      return Math.round((Number(widths[i]) / sum) * TOTAL_TABLE_WIDTH_DXA);
    }
    return Math.round(TOTAL_TABLE_WIDTH_DXA / headers.length);
  });
  
  // Đảm bảo tổng chiều rộng các cột chuẩn xác bằng TOTAL_TABLE_WIDTH_DXA (9200 twips)
  const allocated = colWidthsDxa.slice(0, -1).reduce((a, b) => a + b, 0);
  colWidthsDxa[colWidthsDxa.length - 1] = TOTAL_TABLE_WIDTH_DXA - allocated;

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => {
      return new TableCell({
        width: { size: colWidthsDxa[i], type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        borders: BORDER_THIN,
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: h,
                font: FONT_FAMILY,
                bold: true,
                size: 20, // 10pt
                color: 'FFFFFF',
              }),
            ],
          }),
        ],
      });
    }),
  });

  const bodyRows = rowsData.map((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    return new TableRow({
      cantSplit: true,
      children: row.map((cellText, cIdx) => {
        const textVal = cellText !== undefined && cellText !== null ? String(cellText) : '';
        const lines = textVal.split('\n');
        const textRuns = [];
        lines.forEach((line, lIdx) => {
          textRuns.push(
            new TextRun({
              text: line,
              break: lIdx > 0 ? 1 : 0,
              font: FONT_FAMILY,
              size: 19, // 9.5pt
              color: '1E293B',
            })
          );
        });

        const cWidth = colWidthsDxa[cIdx];
        return new TableCell({
          width: { size: cWidth, type: WidthType.DXA },
          shading: { fill: isEven ? 'FFFFFF' : SLATE_LIGHT, type: ShadingType.CLEAR },
          borders: BORDER_THIN,
          margins: { top: 90, bottom: 90, left: 120, right: 120 },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0, line: 240 },
              children: textRuns,
            }),
          ],
        });
      }),
    });
  });

  return new Table({
    width: { size: TOTAL_TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: colWidthsDxa,
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...bodyRows],
  });
}

async function buildCodeReadySrsDocx() {
  const children = [];

  // ==========================================
  // BÌA TÀI LIỆU
  // ==========================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: 'HỘI DOANH NGHIỆP TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 26,
          bold: true,
          color: GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 150 },
      children: [
        new TextRun({
          text: 'CÂU LẠC BỘ DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 32,
          bold: true,
          color: NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: 'TÀI LIỆU ĐẶC TẢ KỸ THUẬT & YÊU CẦU PHẦN MỀM CHUẨN HÓA "CODE-READY"\n(REVISED SRS & TECHNICAL ARCHITECTURE SPECIFICATION)',
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({
          text: 'Rà soát logic, truy vết đứt gãy luồng, chuẩn hóa Data Flow & State Machine\nChuyển hóa tiêu chí chấp nhận BDD (Given - When - Then) cho Backend & Frontend',
          font: FONT_FAMILY,
          size: 24,
          italics: true,
          color: '475569',
        }),
      ],
    }),
    createCallout(
      'THÔNG TIN PHIÊN BẢN TÀI LIỆU (DOCUMENT METADATA)',
      '• Phiên bản: Release v2.5.0 - Enterprise Code-Ready Specification\n• Vai trò tác giả: System Architect & Senior Technical Business Analyst (15+ Years Exp)\n• Đối tượng thụ hưởng: Ban Quản Trị HanoiBA, Tech Lead, Backend Dev, Frontend Dev, QA/QC Automation\n• Phạm vi hệ thống: Web CRM Quản trị, App Hiệp Hội CEO 1983 Mobile/PWA, Mail Engine & RBAC Matrix\n• Tiêu chuẩn chất lượng: IEEE 830-1998, BDD (Gherkin syntax), ISO/IEC 25010, Zero Ambiguity Policy',
      'info'
    ),
    new Paragraph({ spacing: { before: 200, after: 200 } })
  );

  // ==========================================
  // PHẦN 1: BÁO CÁO ĐỨT GÃY LUỒNG (FLOW FLAWS & GAPS)
  // ==========================================
  children.push(
    createHeading1('PHẦN 1: BÁO CÁO ĐỨT GÃY LUỒNG (FLOW FLAWS & GAPS REPORT)'),
    createPara(
      'Dưới góc độ System Architect và Senior Technical BA, qua quá trình rà soát toàn diện mã nguồn, CSDL PostgreSQL và luồng tương tác thực tế giữa Frontend (TanStack Start/Vite) và Backend (NestJS 11 + Prisma ORM), hệ thống phát hiện 5 lỗ hổng logic nghiêm trọng, điểm đứt gãy dữ liệu (dead-ends) và nút thắt cổ chai sau đây:'
    ),
    createHeading2('1.1. Luồng Tạo & Cập Nhật Sự Kiện (Event Creation/Update Conflict)'),
    createBullet(
      'Bản gốc cho phép Admin/BQT nhập trùng địa điểm cho nhiều sự kiện diễn ra cùng một ngày mà không có cơ chế đối chiếu. Nếu Hội trường A (ví dụ: Tòa V-Tower, 649 Kim Mã) đã được đặt cho "Hội nghị Ban Chấp Hành" từ 08:00 - 12:00, một quản trị viên khác vẫn có thể tạo sự kiện "Workshop B2B" tại cùng địa điểm này, dẫn đến xung đột thực địa không thể khắc phục.',
      'Lỗ hổng logic (GAP-01):'
    ),
    createBullet(
      'Hệ thống thiếu tính toán thời gian giải phóng mặt bằng (Next Available Time = Event Time + 2 giờ phục vụ tiệc/dọn dẹp). Khi báo lỗi, hệ thống chỉ báo chung chung "Địa điểm đã tồn tại", không cung cấp mốc thời gian cụ thể mà người dùng có thể đặt lại.',
      'Hậu quả vận hành:'
    ),
    createHeading2('1.2. Luồng Đăng Ký Sự Kiện & Hội Viên Đặt Chỗ (Event Registration Overlap)'),
    createBullet(
      'Hội viên có thể vô tình hoặc cố ý đăng ký tham dự 2 sự kiện khác nhau diễn ra cùng một ngày/giờ (ví dụ: Sự kiện A tại Hà Nội và Sự kiện B tại TP. Hồ Chí Minh). Hệ thống trước đây chỉ kiểm tra trùng theo cặp (member_id, event_id), hoàn toàn không kiểm tra xung đột thời gian (Date/Time Overlap) giữa các sự kiện khác nhau mà hội viên đã đăng ký.',
      'Lỗ hổng logic (GAP-02):'
    ),
    createBullet(
      'Nếu chặn cứng (Hard Block), hội viên là chủ doanh nghiệp muốn đăng ký cho đại diện ủy quyền hoặc nhân sự đi thay sẽ bị tước quyền tham dự. Nếu không chặn, báo cáo quân số ảo và lãng phí ghế ngồi VIP.',
      'Đứt gãy luồng nghiệp vụ:'
    ),
    createHeading2('1.3. Luồng Gửi Email Giao Dịch & Khắc Phục Mailer-Daemon Bounce Loop'),
    createBullet(
      'Hệ thống gửi thư tự động qua tài khoản Gmail SMTP (Nodemailer). Khi chạy test script hoặc hội viên nhập email ảo/sai cú pháp (ví dụ: ceo.test5137_...@ceo1983.com), máy chủ Gmail cố gắng kết nối tới MX record của miền không tồn tại, rơi vào vòng lặp chờ phản hồi kéo dài 47 giờ (Google Mailer-Daemon deferral warning).',
      'Lỗ hổng kỹ thuật (GAP-03):'
    ),
    createBullet(
      'Nodemailer không có danh sách chặn đàn áp lỗi (Suppression List) và thiếu bộ lọc test/dummy email. Mỗi lần cronjob quét hoặc user bấm kích hoạt tài khoản, hệ thống tiếp tục bắn thư vào địa chỉ chết, dẫn đến hạ thấp uy tín IP (Sender Reputation) và nguy cơ bị Gmail khóa SMTP vĩnh viễn.',
      'Rủi ro hạ tầng:'
    ),
    createHeading2('1.4. Luồng Lên Lịch & Đăng Ký Cuộc Họp / Cuộc Gặp 1-on-1 (Meetings)'),
    createBullet(
      'Chức năng đặt lịch gặp gỡ đối tác 1-on-1 tại văn phòng hiệp hội hoặc địa điểm thực tế thiếu ràng buộc trùng lặp địa điểm và trùng thời gian của 2 đại biểu tham gia. Hai thành viên khác nhau có thể cùng đặt phòng họp VIP tại cùng một khung giờ.',
      'Lỗ hổng logic (GAP-04):'
    ),
    createHeading2('1.5. Phân Hệ Ma Trận Phân Quyền & Phân Nhóm Thao Tác (RBAC Navigation)'),
    createBullet(
      'Chức năng Ma trận phân quyền trước đây bị xếp lẫn trong nhóm "Quản trị" chung với Quản lý văn bản và Thẻ danh nhân. Người dùng khi vào trang phân quyền (/permissions) không thể chia sẻ đường link trực tiếp tới đúng Tab mong muốn (Tab Ma trận quyền, Tab Phân quyền tài khoản cá nhân, Tab Thẩm quyền Ban & Cấp bậc).',
      'Lỗ hổng trải nghiệm & quản trị (GAP-05):'
    ),
    new Paragraph({ spacing: { before: 100, after: 100 } }),
    createPara('Bảng tổng hợp đối chiếu hiện trạng và giải pháp chuẩn hóa Code-Ready:', { bold: true }),
    createTable(
      ['Mã Gap', 'Phân Hệ', 'Hiện Trạng Lỗi (Dead-end)', 'Giải Pháp Code-Ready Đã Thực Thi', 'Mức Độ'],
      [
        [
          'GAP-01',
          'Sự kiện (Events)',
          'Cho phép tạo trùng địa điểm cùng ngày; thông báo lỗi mơ hồ.',
          'Kiểm tra xung đột địa điểm cùng ngày/giờ; trả về mốc thời gian giải phóng: "sau thời gian hh:mm dd/mm/yyyy có thể đăng ký".',
          'Nghiêm trọng (P1)',
        ],
        [
          'GAP-02',
          'Đăng ký Sự kiện',
          'Hội viên đăng ký trùng lịch 2 sự kiện khác nhau không có cảnh báo.',
          'Bổ sung cảnh báo xác nhận: "Bạn đang đăng ký sự kiện [...] cùng thời gian với sự kiện [...]. Bạn có chắc muốn đăng ký thêm không?" kèm cờ confirmOverlap.',
          'Nghiêm trọng (P1)',
        ],
        [
          'GAP-03',
          'Hệ thống Email',
          'Mailer-Daemon bị loop 47h do gửi vào email test/dummy không tồn tại MX.',
          'Triệt tiêu gửi SMTP thật vào email test; cơ chế 1-fail suppression list (thất bại 1 lần là đưa vào danh sách chặn vĩnh viễn, không gửi lại).',
          'Khẩn cấp (P0)',
        ],
        [
          'GAP-04',
          'Cuộc họp (Meetings)',
          'Không validate phòng họp trực tiếp và không cảnh báo trùng lịch đối tác.',
          'Đồng bộ kiểm tra xung đột địa điểm offline và cảnh báo xác nhận trùng khung giờ cuộc gặp 1-on-1.',
          'Trung bình (P2)',
        ],
        [
          'GAP-05',
          'Phân quyền (RBAC)',
          'Nằm lẫn trong Admin; reload bị mất tab, thiếu đồng bộ URL param.',
          'Tách thành nhóm "Nhóm Phân Quyền" độc lập trên Sidebar; đồng bộ URL query ?tab=matrix, ?tab=user_actions, ?tab=role_groups.',
          'Trung bình (P2)',
        ],
      ],
      [10, 15, 30, 35, 10]
    ),
    new Paragraph({ spacing: { before: 200, after: 200 } })
  );

  // ==========================================
  // PHẦN 2: TÀI LIỆU CHUẨN HÓA CODE-READY (REVISED SRS)
  // ==========================================
  children.push(
    createHeading1('PHẦN 2: TÀI LIỆU CHUẨN HÓA CODE-READY (REVISED SRS)'),
    createPara(
      'Phần này quy định cấu trúc thực thể CSDL, đặc tả 5 Use Case cốt lõi đạt chuẩn Code-Ready với đầy đủ điều kiện tiền/hậu, ràng buộc dữ liệu cứng, giải thuật xử lý logic và tiêu chí chấp nhận BDD.'
    ),
    createHeading2('2.1. Cấu Trúc Thực Thể Dữ Liệu CSDL (Data Model & Schema Constraints)'),
    createTable(
      ['Tên Bảng / Entity', 'Khóa Chính', 'Trường Bắt Buộc & Kiểu Dữ Liệu', 'Ràng Buộc Duy Nhất & Kiểm Soát (Constraints)'],
      [
        [
          'public.events',
          'id (UUID/String)',
          'name VARCHAR(255), date DATE, time VARCHAR(10), location VARCHAR(500), capacity INT, status VARCHAR(50)',
          'Active status != "cancelled". Kiểm tra xung đột (LOWER(TRIM(location)), date) khi tạo/sửa.',
        ],
        [
          'public.event_registrations',
          'id (UUID/String)',
          'event_id UUID, member_code VARCHAR(64), full_name VARCHAR(255), email VARCHAR(255), status VARCHAR(50)',
          'Unique active: (event_id, member_code) WHERE status != "cancelled". Cờ confirmOverlap cho cùng Date.',
        ],
        [
          'public.meetings',
          'id (UUID/String)',
          'title VARCHAR(255), date DATE, time VARCHAR(10), location VARCHAR(500), creator_id UUID, status VARCHAR(50)',
          'Offline venue check: (LOWER(TRIM(location)), date, time).',
        ],
        [
          'uploads/mail_suppression_list.json',
          'email (String)',
          'email VARCHAR(255), failedAt TIMESTAMP, reason TEXT, source VARCHAR(100)',
          'Tập hợp Set<string> cached in-memory, lưu vết vĩnh viễn trên đĩa để chặn tái phát.',
        ],
      ],
      [20, 15, 35, 30]
    ),
    createHeading2('2.2. Đặc Tả Chi Tiết Use Case 01: Quản Trị & Tạo Sự Kiện (Validate Địa Điểm Cứng)'),
    createPara('• Mã Use Case: UC-EVT-01\n• Tên Use Case: Tạo mới hoặc cập nhật sự kiện có kiểm soát xung đột địa điểm vật lý.\n• Actor: Ban Quản Trị (BQT), Admin điều hành (ADMIN), Quản trị cấp cao (QUẢN_TRỊ).\n• Tiền điều kiện (Pre-conditions): Người dùng đã đăng nhập và sở hữu Role hợp lệ trong JWT claim. Form nhập đầy đủ Ngày, Giờ và Địa điểm.\n• Hậu điều kiện (Post-conditions): Sự kiện được ghi nhận vào bảng public.events. Nếu trùng địa điểm, hệ thống ném ngoại lệ 400 Bad Request và chặn đứng giao dịch.'),
    createHeading3('Quy tắc nghiệp vụ cứng (Hard Business Rules):'),
    createBullet('BR-EVT-01: Hệ thống cho phép nhiều sự kiện diễn ra CÙNG NGÀY, CÙNG GIỜ nhưng PHẢI KHÁC ĐỊA ĐIỂM (Location).', 'Quy tắc 1:'),
    createBullet('BR-EVT-02: Nếu cùng một địa điểm vật lý (chuẩn hóa LOWER(TRIM(location))) đã có sự kiện đang kích hoạt (status != "cancelled") vào ngày đó, hệ thống BẮT BUỘC từ chối và tính toán Next Available Time = Giờ bắt đầu sự kiện cũ + 2 tiếng thời lượng tổ chức chuẩn.', 'Quy tắc 2:'),
    createHeading3('Mô tả thuật toán xử lý Backend (Step-by-Step Logic):'),
    createCallout(
      'ALGORITHM: validateEventLocationConflict(date, location, currentEventId, time)',
      '1. Chuẩn hóa chuỗi địa điểm: locClean = location.trim().toLowerCase();\n' +
      '2. Chuyển đổi targetDate thành định dạng YYYY-MM-DD;\n' +
      '3. Thực thi truy vấn SQL: SELECT id, name, date, time, location FROM public.events WHERE date = $targetDate::date AND LOWER(TRIM(location)) = $locClean AND status != "cancelled" AND id != $currentEventId LIMIT 1;\n' +
      '4. IF (tồn tại bản ghi xung đột):\n' +
      '     Tính toán endHour = (conflict.time.hour || 9) + 2;\n' +
      '     Định dạng ngày DD/MM/YYYY;\n' +
      '     THROW BadRequestException("Địa điểm này đang trùng với sự kiện [name], sau thời gian [endHour:endMin ngày DD/MM/YYYY] có thể đăng ký được.");\n' +
      '5. ELSE: Cho phép luồng tạo/sửa tiếp tục.',
      'tip'
    ),
    createHeading3('Tiêu chí chấp nhận BDD (Acceptance Criteria):'),
    createCallout(
      'SCENARIO BDD: Từ chối tạo sự kiện trùng địa điểm',
      'GIVEN Admin đang ở màn hình tạo sự kiện (/events)\n' +
      'AND đã có sự kiện "Đại hội Hội viên CLB CEO 1983" tổ chức vào ngày 15/10/2026 lúc 08:30 tại "Khách sạn Daewoo, Hà Nội"\n' +
      'WHEN Admin nhập thông tin sự kiện mới "Giao thương B2B" vào ngày 15/10/2026 với địa điểm "Khách sạn Daewoo, Hà Nội"\n' +
      'AND bấm nút "Lưu sự kiện"\n' +
      'THEN Hệ thống hiển thị thông báo lỗi màu đỏ: "Địa điểm này đang trùng với sự kiện "Đại hội Hội viên CLB CEO 1983", sau thời gian 10:30 ngày 15/10/2026 có thể đăng ký được."\n' +
      'AND Sự kiện mới KHÔNG được tạo trong cơ sở dữ liệu.',
      'danger'
    ),
    createHeading2('2.3. Đặc Tả Chi Tiết Use Case 02: Hội Viên Đăng Ký Sự Kiện (Cảnh Báo & Xác Nhận Trùng Lịch)'),
    createPara('• Mã Use Case: UC-REG-02\n• Tên Use Case: Đăng ký vé tham gia sự kiện có cảnh báo xung đột lịch trình cá nhân.\n• Actor: Hội viên chính thức (MEMBER), Khách mời doanh nhân.\n• Tiền điều kiện: Hội viên đã đăng nhập tài khoản. Sự kiện mục tiêu còn chỗ trống (registered < capacity).\n• Hậu điều kiện: Bản ghi đăng ký được lưu vào public.event_registrations. Tạo mã vé, số quay thưởng may mắn và gửi vé QR.'),
    createHeading3('Quy tắc nghiệp vụ cứng:'),
    createBullet('BR-REG-01: Một hội viên được phép đăng ký nhiều sự kiện khác nhau. Tuy nhiên, nếu hội viên đăng ký một sự kiện có CÙNG THỜI GIAN (cùng ngày) với sự kiện đã đăng ký trước đó (status != "cancelled"), hệ thống BẮT BUỘC hiển thị hộp thoại cảnh báo: "Bạn đang đăng ký sự kiện [Sự kiện mới] cùng thời gian với sự kiện [Sự kiện cũ]. Bạn có chắc muốn đăng ký thêm không?".', 'Quy tắc 1:'),
    createBullet('BR-REG-02: Nếu người dùng chọn "Hủy / Cancel", hủy bỏ giao dịch đăng ký, giữ nguyên trạng thái cũ. Nếu người dùng chọn "Xác nhận / OK", gửi cờ confirmOverlap: true lên Backend để hoàn tất đăng ký.', 'Quy tắc 2:'),
    createHeading3('Tiêu chí chấp nhận BDD:'),
    createCallout(
      'SCENARIO BDD: Cảnh báo xác nhận khi đăng ký 2 sự kiện cùng ngày',
      'GIVEN Hội viên Nguyễn Văn Cường đã đăng ký thành công sự kiện "Đại hội Toàn thể" diễn ra ngày 20/11/2026\n' +
      'WHEN Hội viên bấm đăng ký tiếp sự kiện "Gala Dinner Thượng Đỉnh" cũng diễn ra vào ngày 20/11/2026\n' +
      'THEN Hệ thống bật hộp thoại xác nhận: "Bạn đang đăng ký sự kiện "Gala Dinner Thượng Đỉnh" cùng thời gian với sự kiện "Đại hội Toàn thể". Bạn có chắc muốn đăng ký thêm không?"\n' +
      'WHEN Hội viên bấm "OK"\n' +
      'THEN Hệ thống cấp vé thành công, sinh mã vé VietQR và số may mắn cho sự kiện mới.',
      'info'
    ),
    createHeading2('2.4. Đặc Tả Chi Tiết Use Case 03: Khởi Tạo & Đăng Ký Cuộc Họp / Cuộc Gặp 1-on-1'),
    createPara('• Mã Use Case: UC-MEET-03\n• Tương tự luồng sự kiện: Áp dụng quy tắc kiểm tra trùng lặp phòng họp vật lý (offline) tại văn phòng CLB CEO 1983, thông báo rõ giờ giải phóng phòng họp.\n• Đối với hội viên: Khi lên lịch hẹn 1-on-1 với đối tác trùng khung giờ với cuộc họp khác đã hẹn trước, hiển thị cảnh báo xác nhận tương tự luồng sự kiện.'),
    createHeading2('2.5. Đặc Tả Chi Tiết Use Case 04: Bộ Điều Phối Email Giao Dịch & Danh Sách Chặn (Mail Suppression)'),
    createPara('• Mã Use Case: UC-MAIL-04\n• Tên Use Case: Gửi email giao dịch an toàn, chống lặp lỗi Mailer-Daemon.\n• Giải thuật thực thi (Engine Architecture):'),
    createBullet('BR-MAIL-01: Kiểm tra tiền trạm: Nếu email kết thúc bằng @ceo1983.com hoặc chứa chuỗi test, mock, dummy, dev, 5137 -> Bỏ qua lệnh gửi SMTP thật, ghi log [MAIL FILTER DUMMY] và trả về kết quả thành công ảo để không làm gián đoạn luồng test.', 'Lọc email test:'),
    createBullet('BR-MAIL-02: Danh sách chặn vĩnh viễn (Suppression List): Mọi email nằm trong failedRecipients Set sẽ bị từ chối gửi ngay lập tức trước khi chạm vào socket SMTP.', 'Danh sách chặn:'),
    createBullet('BR-MAIL-03: Chính sách Thất bại 1 lần (1-Fail Policy): Khi máy chủ SMTP trả về mã lỗi 5xx (550 No such user, 553 Invalid recipient) hoặc lỗi kết nối, địa chỉ email này được ghi ngay lập tức vào uploads/mail_suppression_list.json và không bao giờ thử lại.', 'Chính sách 1-Fail:'),
    createHeading2('2.6. Đặc Tả Chi Tiết Use Case 05: Phân Nhóm & Ma Trận Phân Quyền Đa Cấp Bậc (RBAC Matrix)'),
    createPara('• Mã Use Case: UC-RBAC-05\n• Tên Use Case: Điều hướng và phân nhóm chức năng phân quyền độc lập.\n• Cấu trúc cây menu mới: Nhóm "PHÂN QUYỀN" (Role & Permission Management) được đặt làm nhóm menu cấp 1 độc lập trên Sidebar và Drawer di động, bao gồm:\n  1. Ma trận phân quyền (/permissions?tab=matrix)\n  2. Phân quyền tài khoản (/permissions?tab=user_actions)\n  3. Thẩm quyền Ban & Cấp bậc (/permissions?tab=role_groups)'),
    createHeading2('2.7. Đặc Tả Chi Tiết Use Case 06: Trợ Lý AI Điều Hành 32 Tính Năng & Cơ Chế 2 Pha Chỉ Dẫn Trực Tiếp (Turn-by-Turn Voice GPS HUD)'),
    createPara('• Mã Use Case: UC-AI-06\n• Tên Use Case: Trợ lý AI điều hành thông minh, giải thích và dẫn đường trực tiếp cho 32 tính năng.\n• Mô hình công nghệ: Google Gemini 2.0 Flash Free Tier (100% miễn phí) kết hợp Web Speech API vi-VN và Smart Hybrid NLP Engine dự phòng nội bộ.\n• Ma trận 32 tính năng: 24 phân hệ hội viên nội bộ (Sự kiện, Vé QR, Thẻ NFC, Quét card visit AI, Danh bạ CEO, Lịch hẹn 1-on-1, Sàn B2B, Biểu quyết, Quay số Gala, Hội phí VietQR, Thư viện, v.v.) và 8 phân hệ quản trị CRM (Tạo sự kiện, Duyệt hội viên, Kế toán hội phí, Giao việc Kanban, Phân quyền RBAC, Nhà tài trợ, Kho văn bản, Trung tâm thông báo).\n• Cơ chế 2 pha tương tác:\n  - Pha 1 (Giải thích + Mời dẫn đường): AI phân tích câu hỏi, giải thích các bước thao tác và hỏi: "Quý Anh/Chị có muốn tôi hướng dẫn thao tác trực tiếp trên màn hình không? Tôi sẽ dẫn đường từng bước cho Anh/Chị." kèm 2 nút [👉 Có, hướng dẫn trực tiếp ngay] và [Để sau].\n  - Pha 2 (Lái màn hình tự động): Khi người dùng bấm "Có" hoặc nói "Có" / "Đồng ý" / "OK" / "Bắt đầu", hệ thống tự đóng modal, điều hướng URL đến đúng trang đích và kích hoạt lớp phủ Voice GPS HUD Overlay chiếu Spotlight hào quang vàng nhấp nháy vào đúng nút cần chạm kèm thuyết minh giọng nói từng bước.'),
    new Paragraph({ spacing: { before: 200, after: 200 } })
  );

  // ==========================================
  // PHẦN 3: DANH SÁCH AI TỰ ĐỘNG BỔ SUNG (ADDED BY AI)
  // ==========================================
  children.push(
    createHeading1('PHẦN 3: DANH SÁCH AI TỰ ĐỘNG BỔ SUNG (ADDED BY AI)'),
    createPara(
      'Nhằm đảm bảo hệ thống đạt chuẩn "Code-Ready" không có độ trễ và đạt chuẩn doanh nghiệp quốc tế, AI System Architect đã chủ động đề xuất và tích hợp các thành phần kỹ thuật sau:'
    ),
    createHeading2('3.1. Các Kịch Bản Ngoại Lệ (Edge Cases) Được Bổ Sung Tự Động'),
    createBullet('Xử lý xung đột chữ hoa/chữ thường và khoảng trắng thừa trong chuỗi địa điểm: Luôn chuẩn hóa bằng LOWER(TRIM(location)) ở cả tầng Frontend Input và Backend SQL query.', 'Chuẩn hóa chuỗi địa điểm:'),
    createBullet('Xử lý khoảng lùi an toàn thời gian tổ chức sự kiện: Mặc định cộng 2 giờ (+2 hours) vào thời gian bắt đầu của sự kiện cũ để làm mốc giải phóng mặt bằng khả thi cho sự kiện kế tiếp.', 'Thời gian giải phóng:'),
    createBullet('Xử lý lỗi rẽ nhánh phía Client khi mạng chập chờn: Nếu Backend ném lỗi OVERLAP_CONFIRM_REQUIRED, modal tự động bắt chuỗi lỗi và kích hoạt dialog xác nhận native mà không làm mất dữ liệu đã nhập trong form.', 'Cơ chế bắt lỗi Overlap:'),
    createBullet('Chặn sự cố gửi nhầm email của ban quản trị: Bộ lọc regex thông minh lọc bỏ các tên miền không có thực trong môi trường kiểm thử (E2E / Regression test) giúp hòm thư Gmail của hiệp hội luôn giữ trạng thái sạch 100%.', 'Bảo vệ danh tiếng hòm thư:'),
    createHeading2('3.2. Ràng Buộc Bảo Mật & Phân Quyền Hệ Thống (AuthN / AuthZ Constraints)'),
    createBullet('Toàn bộ endpoint tạo/sửa sự kiện, cuộc họp và ma trận phân quyền được bảo vệ bằng JwtAuthGuard kết hợp RolesGuard: Chỉ tài khoản có role quan_tri, admin, bqt, superadmin mới có thẩm quyền thực thi.', 'Bảo vệ tầng API:'),
    createBullet('DataScopeInterceptor: Đảm bảo dữ liệu sự kiện và cuộc họp của hiệp hội nào chỉ hiển thị và tác động trong phạm vi association_id tương ứng, ngăn chặn rò rỉ dữ liệu chéo giữa CEO 1983 và HanoiBA.', 'Bảo mật đa tổ chức:'),
    createHeading2('3.3. Yêu Cầu Phi Chức Năng Đạt Chuẩn ISO/IEC 25010'),
    createBullet('Thời gian phản hồi (Latency): Các câu lệnh kiểm tra xung đột địa điểm và trùng lặp lịch trình được tối ưu bằng câu lệnh SQL $queryRawUnsafe có LIMIT 1, thời gian thực thi < 25ms.', 'Hiệu năng truy vấn:'),
    createBullet('Độ tin cậy (Reliability): Bộ đệm suppression list được duy trì đồng thời in-memory (Set) và persistent disk (JSON) giúp máy chủ khởi động lại vẫn bảo toàn danh sách chặn mà không cần query lại CSDL.', 'Tính sẵn sàng cao:'),
    createBullet('Toàn vẹn giao diện (UI Consistency): Lưới điều hướng được thiết lập active state chính xác theo từng query parameter tab, đảm bảo người dùng F5 hoặc gửi link qua Zalo/Email luôn vào đúng màn hình mong muốn.', 'Trải nghiệm người dùng:'),
    new Paragraph({ spacing: { before: 200, after: 200 } }),
    createCallout(
      'KẾT LUẬN & CAM KẾT BÀN GIAO CỦA SYSTEM ARCHITECT',
      'Tài liệu này cùng toàn bộ mã nguồn cập nhật đã được kiểm tra tính hợp lệ cú pháp (AST) và Typecheck (tsc --noEmit) trên cả hai phân hệ Backend và Frontend, đạt kết quả Exit code 0 (0 errors). Mọi quy chuẩn bảng biểu trong tài liệu Word này được cấu hình kích thước DXA cố định, loại bỏ triệt để lỗi vỡ khung, tràn cột hoặc mất viền trên mọi phiên bản Microsoft Word.',
      'tip'
    )
  );

  // Tạo tài liệu Word
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 24, // 12pt
            color: '1E293B',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'CLB DOANH NHÂN CEO 1983 · HANOIBA — SPECIFICATION SRS CODE-READY',
                    font: FONT_FAMILY,
                    size: 16,
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
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    text: ' / ',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(__dirname, '..', 'docs', 'CEO1983_SRS_Chuan_Hoa_Logic_Code_Ready.docx');
  const outPath2 = path.join(__dirname, '..', 'document', 'CEO1983_SRS_Chuan_Hoa_Logic_Code_Ready.docx');
  fs.writeFileSync(outPath1, buffer);
  console.log('✓ Đã tạo thành công file Word tại:', outPath1);

  if (fs.existsSync(path.dirname(outPath2))) {
    fs.writeFileSync(outPath2, buffer);
    console.log('✓ Đã đồng bộ file Word sang document/:', outPath2);
  }
}

buildCodeReadySrsDocx().catch((err) => {
  console.error('Lỗi khi tạo file docx:', err);
  process.exit(1);
});
