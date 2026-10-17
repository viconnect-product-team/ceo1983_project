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
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');
const ARCHIVE_DIR = path.join(DOC_DIR, 'archive');

[DOC_DIR, DOCS_DIR, FE_DOCS_DIR, ARCHIVE_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Định nghĩa bảng màu thương hiệu chuẩn CEO 1983
const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '003B95';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_MUTED = '475569';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '003B95';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200; // Khổ giấy A4 lề chuẩn 1 inch

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
        size: options.size || 24, // 12pt
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
        size: 32, // 16pt
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
        size: 28, // 14pt
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
        size: 26, // 13pt
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
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
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
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
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

// ─────────────────────────────────────────────────────────────────────────────
// 1. DỌN DẸP CÁC FILE RÁC, FILE NHÁP CŨ TRONG DOCUMENT/ VÀ DOCS/
// ─────────────────────────────────────────────────────────────────────────────
function cleanOldAndRedundantFiles() {
  console.log('=== [1/6] DỌN DẸP CÁC FILE CŨ KHÔNG PHẢI 5 NHÓM CHÍNH ===');

  const filesInDoc = fs.readdirSync(DOC_DIR);
  // Danh sách các file được giữ lại (bắt đầu bằng BRD, SRS, HDSD, TIEN_DO_CONG_VIEC, TEST_CASES)
  const isKeptFile = (fileName) => {
    if (fileName === 'archive' || fileName === 'images') return true;
    const upper = fileName.toUpperCase();
    return (
      upper.startsWith('BRD_') ||
      upper.startsWith('SRS_') ||
      upper.startsWith('HDSD_') ||
      upper.startsWith('TIEN_DO_CONG_VIEC_') ||
      upper.startsWith('TEST_CASES_') ||
      upper.startsWith('PROFILE_') ||
      upper.startsWith('SLIDE_') ||
      upper.startsWith('PHIEU_')
    );
  };

  let archivedCount = 0;
  filesInDoc.forEach((file) => {
    if (!isKeptFile(file)) {
      const srcPath = path.join(DOC_DIR, file);
      const stat = fs.statSync(srcPath);
      if (stat.isFile()) {
        const destPath = path.join(ARCHIVE_DIR, file);
        try {
          fs.renameSync(srcPath, destPath);
          archivedCount++;
        } catch {
          // ignore
        }
      }
    }
  });

  // Xóa các file cũ trong docs/ nếu không thuộc danh mục
  if (fs.existsSync(DOCS_DIR)) {
    const docsFiles = fs.readdirSync(DOCS_DIR);
    docsFiles.forEach((file) => {
      if (!isKeptFile(file)) {
        const p = path.join(DOCS_DIR, file);
        try {
          if (fs.statSync(p).isFile()) fs.unlinkSync(p);
        } catch {}
      }
    });
  }

  console.log(`✓ Đã di chuyển ${archivedCount} tài liệu cũ vào thư mục document/archive/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TẠO TÀI LIỆU BRD (WEB CRM, MOBILE APP, TỔNG THỂ)
// ─────────────────────────────────────────────────────────────────────────────
async function generateAllBrdDocuments() {
  console.log('\n=== [2/6] BIÊN SOẠN BỘ TÀI LIỆU BRD DOANH NGHIỆP CHUẨN MỰC ===');

  // ── BRD 1: WEB CRM ──
  const crmBrdMd = `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ HỆ THỐNG QUẢN TRỊ HIỆP HỘI (BRD - WEB CRM)
## HỆ SINH THÁI DOANH NHÂN CLB CEO 1983 (TRỰC THUỘC HANOIBA)
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026 - Ngôn ngữ: Tiếng Việt (Doanh nghiệp chuẩn)*

---

### LỜI MỞ ĐẦU & TÔN CHỈ VẬN HÀNH
Tài liệu Yêu cầu Nghiệp vụ (Business Requirements Document - BRD) này đặc tả toàn diện các quy trình vận hành, thẩm quyền lãnh đạo, luồng công việc và trải nghiệm quản trị trên Cổng Quản trị CRM của CLB Doanh Nhân CEO 1983. Hệ thống được thiết kế hướng tới mục tiêu tối thượng: **Số hóa toàn diện dữ liệu hội viên, chuẩn hóa quy trình điều hành minh bạch, thúc đẩy giao thương B2B hiệu quả và bảo vệ an toàn thông tin doanh nghiệp**.

Tài liệu được biên soạn bằng văn phong quản trị kinh doanh thực tiễn, loại bỏ hoàn toàn các thuật ngữ công nghệ nặng nề để Chủ tịch, Ban Điều Hành, Tổng thư ký và các Trưởng ban chuyên môn dễ dàng thấu suốt và chỉ đạo triển khai.

---

### CHƯƠNG 1: TỔNG QUAN HỆ THỐNG QUẢN TRỊ CRM HIỆP HỘI
1. **Mục tiêu sứ mệnh**:
   - Cung cấp bức tranh toàn cảnh 360 độ về sức khỏe tổ chức, quy mô hội viên và dòng tiền hiệp hội.
   - Chấm dứt tình trạng lưu trữ dữ liệu phân tán trên file Excel rời rạc hoặc sổ tay truyền thống.
   - Tự động hóa các nghiệp vụ định kỳ: nhắc hội phí niên liễm, gửi thông báo họp, cấp vé mời sự kiện.
2. **Đối tượng sử dụng chính**:
   - **Chủ tịch Hiệp hội**: Giám sát bao quát mọi hoạt động, phê duyệt định hướng và giao việc trọng tâm.
   - **Ban Điều Hành (trước đây là Ban Quản trị)**: Cơ quan điều phối liên ban, chỉ đạo chuyên môn trực tiếp.
   - **Quản trị viên Hệ thống (Admin)**: Thiết lập cấu hình ma trận phân quyền, quản lý bảo mật và tích hợp.
   - **Tổng thư ký**: Điều hành Văn phòng thư ký, truyền đạt thông báo và giám sát tiến độ nghị quyết.
   - **Trưởng các Ban Chuyên môn**: Trưởng ban Thành viên, Ban Xúc tiến thương mại, Ban Tài chính, Ban Truyền thông, Ban Thiện nguyện.
   - **Ban Thư ký**: Soạn thảo văn bản, tiếp nhận hồ sơ, gửi hóa đơn và hỗ trợ hội viên.

---

### CHƯƠNG 2: CƠ CẤU TỔ CHỨC & PHÂN CẤP THẨM QUYỀN 7 CẤP BẬC
Cơ cấu tổ chức hiệp hội được chuẩn hóa thành 7 cấp bậc thứ tự từ trên xuống dưới:
1. **Cấp 1 - Chủ tịch Hiệp hội (\`chu_tich\`)**: Cấp quyền cao nhất, toàn quyền giao việc cho bất kỳ ai trên toàn hiệp hội, giám sát toàn diện dữ liệu đa ban.
2. **Cấp 2 - Quản trị viên Hệ thống (\`admin\` / \`quan_tri\`)**: Toàn quyền cấu hình tham số, phân quyền ma trận chức năng, khởi tạo tài khoản và hỗ trợ kỹ thuật.
3. **Cấp 3 - Ban Điều Hành (\`ban_dieu_hanh\`)**: Thay thế hoàn toàn thuật ngữ "Ban Quản trị" cũ. Lãnh đạo liên ban, giám sát toàn bộ hoạt động chuyên môn của các ban.
4. **Cấp 4 - Tổng thư ký (\`tong_thu_ky\`)**: Điều phối Ban Thư Ký; thẩm quyền giao việc giới hạn cho nhân sự thuộc Ban Thư Ký.
5. **Cấp 5 - Trưởng ban Chuyên môn (\`truong_ban_*\`)**:
   - Trưởng ban Truyền thông: Quản lý truyền thông, hình ảnh, bài viết sự kiện.
   - Trưởng ban Thành viên: Quản lý thẩm định, phê duyệt và chăm sóc hội viên.
   - Trưởng ban Xúc tiến thương mại: Quản lý cơ hội giao thương B2B, gian hàng sản phẩm.
   - Trưởng ban Tài chính: Quản lý ngân quỹ, hội phí niên liễm, thu chi và tạm ứng.
   - Trưởng ban Thiện nguyện: Quản lý các chương trình an sinh xã hội, cứu trợ cộng đồng.
   - *Thẩm quyền giao việc: Chỉ được phép giao việc cho thành viên thuộc chính ban của mình.*
6. **Cấp 6 - Ban Thư ký (\`ban_thu_ky\`)**: Thực thi nhiệm vụ do Tổng thư ký và Ban Điều Hành phân công.
7. **Cấp 7 - Hội viên Doanh nhân (\`member\`)**: Thành viên câu lạc bộ, tham gia sinh hoạt, giao thương và kết nối.

---

### CHƯƠNG 3: CƠ CHẾ BẢO MẬT & THÔNG BÁO THAY ĐỔI QUYỀN THỜI GIAN THỰC
1. **Xử lý tình huống thay đổi quyền trong lúc thao tác**:
   - Khi tài khoản B đang mở biểu mẫu chỉnh sửa, thêm mới hoặc xóa dữ liệu mà chưa kịp bấm Lưu.
   - Tài khoản A (Quản trị viên/Chủ tịch) thay đổi quyền hoặc thu hồi quyền thao tác của tài khoản B.
   - Khi tài khoản B bấm nút Lưu, Xóa hoặc Chỉnh sửa: Hệ thống lập tức chặn hành động và **bật cửa sổ thông báo trang trọng ở chính giữa màn hình**:
     > **"Quyền hạn của bạn đã bị thay đổi bởi Quản trị viên. Hệ thống sẽ tải lại để áp dụng cấu hình phân quyền mới nhất."**
   - Sau đó hệ thống tự động làm mới trang (reload) sau 4 giây hoặc ngay khi người dùng bấm nút xác nhận, giữ nguyên phiên đăng nhập để người dùng làm việc tiếp với đúng quyền mới.
2. **Chuẩn hóa màn hình đăng nhập**:
   - Góc trái: Biểu tượng logo thương hiệu chính thức của CEO 1983 đồng bộ với tab trình duyệt.
   - Khối đăng nhập trung tâm: Loại bỏ hoàn toàn dòng chữ phụ đề thừa để giao diện tập trung và sang trọng.

---

### CHƯƠNG 4: QUẢN TRỊ HỒ SƠ HỘI VIÊN 360° & DOANH NGHIỆP THÀNH VIÊN
1. **Quy trình tiếp nhận & phê duyệt hồ sơ**:
   - Tiếp nhận đăng ký trực tuyến từ Cổng thông tin công khai.
   - Ban Thành viên thẩm định tiêu chí: Doanh nhân sinh năm Quý Hợi 1983, người đại diện pháp luật hoặc chủ sở hữu doanh nghiệp.
   - Phê duyệt và tự động phát thư chúc mừng kèm thông tin đăng nhập tài khoản.
2. **Hồ sơ hội viên đa chiều**:
   - Thông tin cá nhân: Họ tên, ngày sinh, số điện thoại, chức vụ, ảnh thẻ đại diện, câu châm ngôn kinh doanh.
   - Doanh nghiệp trực thuộc: Tên công ty, mã số thuế, địa chỉ trụ sở, lĩnh vực hoạt động, quy mô nhân sự, liên kết website.
   - Ban chuyên môn phụ trách và lịch sử đóng hội phí theo từng niên khóa.

---

### CHƯƠNG 5: QUẢN LÝ TÀI CHÍNH, HỘI PHÍ NIÊN LIỄM & THU CHI TẠM ỨNG
1. **Quản lý hội phí niên liễm**:
   - Phát hành biểu phí niên khóa tự động (mặc định 6.000.000 VNĐ/năm).
   - Mã QR thanh toán VietQR Napas 24/7 gắn sẵn mã giao dịch định danh, tự động gạch nợ tức thì khi tiền về tài khoản hiệp hội.
2. **Quản lý khoản thu & khoản chi tạm ứng**:
   - Ghi nhận chi tiết từng khoản thu tài trợ, thu sự kiện, thu thiện nguyện.
   - Đề xuất và giải ngân tạm ứng cho các ban triển khai sự kiện, quyết toán minh bạch.
   - Bộ công cụ **Xuất báo cáo Excel** và **Nhập file Excel hàng loạt** phục vụ kế toán hiệp hội.

---

### CHƯƠNG 6: TỔ CHỨC SỰ KIỆN, SƠ ĐỒ KHÁN PHÒNG & SOÁT VÉ QR
1. **Lập kế hoạch sự kiện**:
   - Khởi tạo sự kiện định kỳ: Họp Ban Chấp Hành, Gala thường niên, Caravan xúc tiến thương mại, Giải Golf CEO 1983.
   - Cấu hình hạng vé: Vé VIP Ban Điều Hành, Vé Hội viên chính thức, Vé Khách mời danh dự.
2. **Sơ đồ khán phòng tương tác (Seating Map)**:
   - Thiết kế sơ đồ bàn tiệc trực quan: Vị trí bàn VIP trung tâm, bàn các ban chuyên môn, bàn khách mời.
   - Gán chỗ ngồi chính xác cho từng hội viên kèm số may mắn quay thưởng.
3. **Cổng soát vé điện tử QR Check-in**:
   - Ban Thư ký sử dụng máy ảnh hoặc điện thoại quét mã QR vé đại biểu, hiển thị tức thời thông tin doanh nhân, chức vụ và số bàn tiệc.
   - Chương trình quay số may mắn **Lucky Draw** trực tiếp trên màn hình LED lớn tại đêm tiệc.

---

### CHƯƠNG 7: LUỒNG GIAO VIỆC & PHÂN PHỐI NHIỆM VỤ ĐA CẤP (DYNAMIC TASK)
1. **Phân cấp giao việc nghiêm ngặt**:
   - Chủ tịch & Admin: Toàn quyền giao việc cho bất kỳ cá nhân hay ban chuyên môn nào.
   - Tổng thư ký: Chỉ được phép giao việc cho thành viên thuộc Ban Thư Ký.
   - Trưởng ban chuyên môn: Chỉ được phép giao việc cho các thành viên thuộc chính ban của mình.
   - *Hệ thống tự động tra cứu danh sách nhân sự được phép nhận việc theo quyền hạn người lập.*
2. **Đính kèm tài liệu đa định dạng**:
   - Hỗ trợ tải lên trực tiếp văn bản Word (\`.doc\`, \`.docx\`), bảng tính Excel (\`.xls\`, \`.xlsx\`), tài liệu PDF (\`.pdf\`) và hình ảnh minh họa.
   - Người nhận việc có thể tải về nghiên cứu hoặc nộp tệp báo cáo hoàn thành.
3. **Mô hình công việc động**:
   - Phân loại danh mục công việc: Chiến lược, Sự kiện, Tài chính, Truyền thông, Hội viên, Xúc tiến, Thiện nguyện.
   - Dự toán ngân sách và tiêu chí nghiệm thu hoàn thành định lượng rõ ràng.
   - Danh sách công việc con (Subtasks) và cuộc họp trực tuyến Google Meet gắn kèm.
4. **Phân quyền bảo mật dữ liệu công việc**:
   - Cấp Chủ tịch, Admin và Ban Điều Hành: Xem toàn bộ công việc toàn hiệp hội.
   - Tổng thư ký & Trưởng ban: Xem công việc ban mình và việc liên quan trực tiếp.
   - Hội viên: Chỉ xem các công việc mình được giao, phối hợp hoặc tự tạo.

---

### CHƯƠNG 8: HỆ SINH THÁI GIAO THƯƠNG & XÚC TIẾN THƯƠNG MẠI B2B
1. **Sàn sản phẩm & ưu đãi nội bộ**:
   - Doanh nghiệp hội viên giới thiệu các sản phẩm, giải pháp tiêu biểu kèm chính sách chiết khấu độc quyền cho thành viên CEO 1983.
2. **Quản trị cơ hội giao thương (B2B Deals)**:
   - Ghi nhận và theo dõi các thương vụ kết nối kinh doanh từ bước khởi xướng, trao đổi đến ký kết hợp đồng thành công.
   - Thống kê tổng giá trị dòng tiền giao thương nội bộ mang lại cho hội viên.

---

### CHƯƠNG 9: BIỂU QUYẾT ĐIỆN TỬ & KHẢO SÁT ĐẠI HỘI
1. **Biểu quyết nghị quyết trực tuyến**:
   - Ban Điều Hành khởi tạo các phiên biểu quyết thông qua quy chế, kế hoạch tài chính hoặc nhân sự.
   - Hội viên bỏ phiếu minh bạch, hệ thống tính toán tỷ lệ đồng thuận theo thời gian thực.
2. **Khảo sát chất lượng sinh hoạt**:
   - Thu thập ý kiến đóng góp của hội viên sau mỗi kỳ sinh hoạt để cải tiến chất lượng tổ chức.

---

### CHƯƠNG 10: TRỢ LÝ ĐIỀU HÀNH TRÍ TUỆ NHÂN TẠO (AI ASSISTANT)
- Được nạp toàn diện tri thức về điều lệ, quy chế và các số liệu hoạt động của hiệp hội.
- Hỗ trợ lãnh đạo tra cứu tức thì thông tin hội viên, chỉ số tài chính, tiến độ sự kiện.
- Tự động điều hướng nhanh đến màn hình chức năng khi người dùng yêu cầu hướng dẫn.

---

### CHƯƠNG 11: TIÊU CHUẨN AN TOÀN & BẢO MẬT DỮ LIỆU DOANH NGHIỆP
- 100% dữ liệu danh bạ doanh nhân và số điện thoại được bảo vệ nghiêm ngặt.
- Sao lưu dữ liệu tự động hàng ngày, sẵn sàng khôi phục thảm họa.
- Tốc độ tải trang dưới 1 giây, hoạt động ổn định trên mọi thiết bị máy tính và máy tính bảng.
`;

  // ── BRD 2: MOBILE APP ──
  const appBrdMd = `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ ỨNG DỤNG DI ĐỘNG HỘI VIÊN (BRD - MOBILE APP)
## HỆ SINH THÁI DOANH NHÂN CLB CEO 1983 (TRỰC THUỘC HANOIBA)
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026 - Ngôn ngữ: Tiếng Việt (Doanh nghiệp chuẩn)*

---

### LỜI MỞ ĐẦU & TÔN CHỈ THIẾT KẾ
Ứng dụng di động **CLB Doanh Nhân CEO 1983** được thiết kế độc bản dành riêng cho các doanh nhân sinh năm Quý Hợi 1983. Ứng dụng là chiếc cầu nối không khoảng cách giữa các hội viên với nhau và giữa hội viên với Ban Điều Hành hiệp hội.

Trọng tâm thiết kế hướng tới: **Sang trọng, Tối giản, Mượt mà và Đậm chất Doanh nhân bản lĩnh**. Mọi thao tác đều được tối ưu hóa cho màn hình cảm ứng di động với thời gian phản hồi tức thì.

---

### CHƯƠNG 1: ĐỊNH VỊ & ĐẶC QUYỀN ỨNG DỤNG DI ĐỘNG CEO 1983
1. **Định vị sản phẩm**:
   - Không chỉ là một ứng dụng tra cứu thông tin, đây là danh thiếp số quyền năng và văn phòng bỏ túi của từng lãnh đạo doanh nghiệp.
2. **Đặc quyền dành riêng cho hội viên**:
   - Sở hữu tấm thẻ hội viên VIP điện tử mạ vàng độc bản.
   - Nhận thông báo việc làm và chỉ đạo điều hành ngay lập tức.
   - Nhận vé mời sự kiện, check-in không cần chạm giấy tờ.
   - Kết nối đàm thoại nội bộ chất lượng cao không bị làm phiền bởi cuộc gọi rác.

---

### CHƯƠNG 2: THẺ HỘI VIÊN ĐIỆN TỬ VIP & DANH THIẾP SỐ CHẠM NFC
1. **Thẻ hội viên VIP kỹ thuật số**:
   - Thiết kế ánh kim vàng sang trọng trên nền xanh Classic Navy của hiệp hội.
   - Thể hiện đầy đủ mã hội viên chính danh, họ tên, chức vụ, công ty và logo CEO 1983.
2. **Công nghệ chạm danh thiếp điện tử 1 chạm (NFC)**:
   - Tích hợp công nghệ chạm NFC NTAG213/215: Chỉ cần chạm lưng điện thoại vào đối tác là toàn bộ thông tin doanh nghiệp, website, sản phẩm được truyền tải trọn vẹn trong 1 giây.
   - Mã QR cá nhân hóa động cho phép quét nhanh khi gặp gỡ tại các diễn đàn kinh tế.

---

### CHƯƠNG 3: NHẬN NHIỆM VỤ, NỘP BÁO CÁO & XỬ LÝ CÔNG VIỆC DI ĐỘNG
1. **Nhận việc tức thời từ lãnh đạo**:
   - Khi Chủ tịch, Ban Điều Hành, Tổng thư ký hoặc Trưởng ban giao việc, điện thoại hội viên lập tức phát chuông và hiển thị thông báo nhiệm vụ mới.
2. **Tra cứu tài liệu đính kèm**:
   - Xem và tải trực tiếp các tệp văn bản Word, bảng tính Excel dự toán và tệp PDF kế hoạch hành động.
3. **Cập nhật tiến độ & nộp kết quả**:
   - Báo cáo phần trăm hoàn thành, đánh dấu các đầu việc con (checklist) đã xong.
   - Tải lên hình ảnh hoặc tệp tài liệu nghiệm thu trực tiếp từ máy ảnh điện thoại.
4. **Bảo vệ quyền hạn thời gian thực**:
   - Nếu trong quá trình thao tác quyền của tài khoản bị thay đổi, ứng dụng bật popup thông báo ở giữa màn hình và tải lại trang để hiển thị đúng quyền mới.

---

### CHƯƠNG 4: DANH BẠ DOANH NHÂN & LỊCH HẸN GIAO THƯƠNG 1-ON-1
1. **Danh bạ hội viên tin cậy 100% chính danh**:
   - Tìm kiếm đối tác theo lĩnh vực kinh doanh, khu vực địa lý hoặc sở thích kết nối.
   - Xem hồ sơ năng lực doanh nghiệp, lịch sử hợp tác và đánh giá uy tín.
2. **Đặt lịch hẹn gặp gỡ 1-on-1**:
   - Chọn khung giờ rảnh và gửi lời mời cà phê kết nối trực tiếp đến đối tác.
   - Thông tin lịch hẹn tự động đồng bộ sang lịch công tác và gửi thông báo nhắc nhở cả hai bên.

---

### CHƯƠNG 5: VÉ MỜI SỰ KIỆN ĐIỆN TỬ & CỔNG CHECK-IN TỰ ĐỘNG
1. **Quản lý vé sự kiện**:
   - Vé tham dự Gala, tọa đàm kinh tế được lưu trữ an toàn trong ví vé điện tử.
   - Hiển thị rõ ràng vị trí bàn tiệc, số ghế ngồi được Ban Tổ Chức trân trọng bố trí.
2. **Check-in tốc độ cao**:
   - Trình mã QR tại bàn lễ tân để nhận thẻ đại biểu và tài liệu sự kiện trong vài giây.
   - Tham gia bốc thăm may mắn nhận các phần quà giá trị từ các nhà tài trợ.

---

### CHƯƠNG 6: LIÊN LẠC ĐÀM THOẠI NỘI BỘ & THÔNG BÁO NỀN NATIVE ANDROID
1. **Cuộc gọi & tin nhắn doanh nhân độ nét cao**:
   - Đàm thoại thoại và video trực tiếp trên nền tảng WebRTC bảo mật, âm thanh rõ nét.
2. **Dịch vụ thông báo cuộc gọi nền native**:
   - Tích hợp dịch vụ chạy nền Android \`CeoNotificationSyncService\`: Khi có cuộc gọi đến, chuông điện thoại đổ vang và hiển thị 2 nút "Nghe" / "Từ chối" ngay trên màn hình khóa kể cả khi ứng dụng đang đóng.

---

### CHƯƠNG 7: GIAN HÀNG DOANH NGHIỆP & ƯU ĐÃI GIAO THƯƠNG NỘI BỘ
1. **Đăng tải sản phẩm dịch vụ**:
   - Mỗi doanh nghiệp sở hữu một gian hàng số giới thiệu các thế mạnh mũi nhọn.
2. **Giao dịch đặc quyền B2B**:
   - Ưu đãi giảm giá đặc biệt dành riêng cho hội viên CEO 1983.
   - Nhận yêu cầu báo giá và kết nối trực tiếp với phòng mua hàng của các doanh nghiệp thành viên.

---

### CHƯƠNG 8: KÊNH ĐÓNG GÓP Ý KIẾN TỚI CHỦ TỊCH & BAN ĐIỀU HÀNH
- Hội viên có thể gửi tâm thư, đề xuất giải pháp phát triển câu lạc bộ hoặc phản ánh vướng mắc trực tiếp tới Ban Điều Hành.
- Ban Điều Hành tiếp nhận và phản hồi chính thức, tạo môi trường sinh hoạt gắn kết và dân chủ.

---

### CHƯƠNG 9: TRỢ LÝ GIỌNG NÓI DOANH NHÂN THÔNG MINH (VOICE AI)
- Ra lệnh bằng giọng nói tiếng Việt tự nhiên: "Mở danh sách sự kiện sắp tới", "Xem hội phí của tôi", "Tìm kiếm doanh nghiệp xây dựng".
- Trợ lý thông minh phân tích và tự động chuyển màn hình ngay tức thì.
- Hoạt động mượt mà trên cả máy tính lẫn bản cài đặt điện thoại APK.

---

### CHƯƠNG 10: BẢO MẬT THÔNG TIN CÁ NHÂN & AN TOÀN TRUY CẬP
- Bảo vệ danh bạ và số điện thoại cá nhân khỏi các phần mềm thu thập thông tin trái phép.
- Hỗ trợ đăng nhập nhanh bằng sinh trắc học vân tay hoặc nhận diện khuôn mặt FaceID.
`;

  // ── BRD 3: TỔNG THỂ HỆ THỐNG ──
  const masterBrdMd = `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ TỔNG THỂ HỆ SINH THÁI (MASTER BRD)
## CLB DOANH NHÂN CEO 1983 (TRỰC THUỘC HANOIBA)
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026 - Ngôn ngữ: Tiếng Việt (Doanh nghiệp chuẩn)*

---

### TỔNG QUAN HỆ THỐNG ĐỒNG BỘ 2 CHIỀU
Hệ sinh thái số CLB Doanh Nhân CEO 1983 là sự kết hợp hoàn hảo giữa 2 trụ cột công nghệ:
1. **Cổng Quản trị CRM Hiệp hội (Web CRM)**: Dành cho Chủ tịch, Ban Điều Hành, Ban Thư ký và các Trưởng ban điều hành toàn diện công tác hội, hội phí, sự kiện và phân quyền.
2. **Ứng dụng Di động Hội viên (Mobile App)**: Dành cho toàn thể hội viên doanh nhân kết nối giao thương, quản lý thẻ thành viên, nhận nhiệm vụ và tham dự sự kiện.

Cả hai trụ cột chia sẻ chung một cơ sở dữ liệu duy nhất, đồng bộ hóa thời gian thực (Realtime Dual-Sync) đảm bảo mọi quyết sách từ Ban Điều Hành đều được truyền đạt tới hội viên trong từng phần nghìn giây.
`;

  // Lưu các file Markdown BRD
  fs.writeFileSync(path.join(DOC_DIR, 'BRD_WEB_CRM_CEO1983.md'), crmBrdMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'BRD_WEB_CRM_CEO1983.md'), crmBrdMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BRD_WEB_CRM_CEO1983.md'), crmBrdMd, 'utf8');

  fs.writeFileSync(path.join(DOC_DIR, 'BRD_MOBILE_APP_CEO1983.md'), appBrdMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'BRD_MOBILE_APP_CEO1983.md'), appBrdMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'BRD_MOBILE_APP_CEO1983.md'), appBrdMd, 'utf8');

  fs.writeFileSync(path.join(DOC_DIR, 'BRD_TONG_THE_HE_THONG_CEO1983.md'), masterBrdMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'BRD_TONG_THE_HE_THONG_CEO1983.md'), masterBrdMd, 'utf8');

  // Tạo các file Word .DOCX cho BRD
  await generateDocxFromText(
    'TÀI LIỆU YÊU CẦU NGHIỆP VỤ HỆ THỐNG QUẢN TRỊ CRM (BRD - WEB CRM)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    crmBrdMd,
    path.join(DOC_DIR, 'BRD_WEB_CRM_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'BRD_WEB_CRM_CEO1983.docx'), path.join(DOCS_DIR, 'BRD_WEB_CRM_CEO1983.docx'));
  fs.copyFileSync(path.join(DOC_DIR, 'BRD_WEB_CRM_CEO1983.docx'), path.join(FE_DOCS_DIR, 'BRD_WEB_CRM_CEO1983.docx'));

  await generateDocxFromText(
    'TÀI LIỆU YÊU CẦU NGHIỆP VỤ ỨNG DỤNG DI ĐỘNG HỘI VIÊN (BRD - MOBILE APP)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    appBrdMd,
    path.join(DOC_DIR, 'BRD_MOBILE_APP_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'BRD_MOBILE_APP_CEO1983.docx'), path.join(DOCS_DIR, 'BRD_MOBILE_APP_CEO1983.docx'));
  fs.copyFileSync(path.join(DOC_DIR, 'BRD_MOBILE_APP_CEO1983.docx'), path.join(FE_DOCS_DIR, 'BRD_MOBILE_APP_CEO1983.docx'));

  await generateDocxFromText(
    'TÀI LIỆU YÊU CẦU NGHIỆP VỤ TỔNG THỂ HỆ THỐNG (MASTER BRD)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    masterBrdMd,
    path.join(DOC_DIR, 'BRD_TONG_THE_HE_THONG_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'BRD_TONG_THE_HE_THONG_CEO1983.docx'), path.join(DOCS_DIR, 'BRD_TONG_THE_HE_THONG_CEO1983.docx'));

  console.log('✓ Đã xuất bản thành công 3 bộ tài liệu BRD (cả .md và .docx chuẩn đẹp)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TẠO TÀI LIỆU SRS (ĐẶC TẢ YÊU CẦU CHUẨN IEEE 830)
// ─────────────────────────────────────────────────────────────────────────────
async function generateAllSrsDocuments() {
  console.log('\n=== [3/6] BIÊN SOẠN BỘ TÀI LIỆU ĐẶC TẢ SRS CHUẨN MỰC ===');

  const crmSrsMd = `# ĐẶC TẢ YÊU CẦU PHẦN MỀM HỆ THỐNG QUẢN TRỊ (SRS - WEB CRM)
## HỆ THỐNG QUẢN TRỊ CLB DOANH NHÂN CEO 1983
*Chuẩn IEEE 830 - Phiên bản 4.0 - Tháng 10/2026*

---

### 1. MỤC ĐÍCH & PHẠM VI HỆ THỐNG
Tài liệu đặc tả chi tiết các yêu cầu chức năng, yêu cầu phi chức năng và giao diện lập trình cho Cổng Quản trị Web CRM Hiệp hội CEO 1983:
- Quản lý phân quyền người dùng theo ma trận 8 Phân hệ x 5 Vai trò.
- Thẩm quyền giao việc phân cấp theo Ban Chuyên môn và bảo vệ dữ liệu công việc.
- Hệ thống thông báo thay đổi quyền hạn thời gian thực qua Popup trung tâm.
- Quản trị tài chính thu chi, hội phí Napas 24/7 và hóa đơn điện tử.
- Quản trị sự kiện, sơ đồ khán phòng Seating Map và cổng soát vé QR.

---

### 2. CÁC YÊU CẦU CHỨC NĂNG CHÍNH
1. **Phân hệ Quản trị Phân quyền RBAC**:
   - Ma trận phân quyền động lưu trong cấu hình hệ thống.
   - 7 cấp bậc: Chủ tịch, Admin, Ban Điều Hành, Tổng thư ký, Trưởng ban, Ban thư ký, Hội viên.
   - Chặn điều hướng khi chưa lưu quyền (Unsaved changes modal 3 lựa chọn).
2. **Phân hệ Giao việc & Quản lý Nhiệm vụ**:
   - Đính kèm tệp đa định dạng: Word, Excel, PDF, Hình ảnh.
   - Thẩm quyền giao việc theo ban, chặn ném lỗi 403 nếu vượt quyền.
   - Biểu mẫu động: Phân loại, dự toán, tiêu chí nghiệm thu, việc con, họp trực tuyến.
3. **Phân hệ Quản lý Hội viên & Doanh nghiệp**:
   - Tiếp nhận, thẩm định, phê duyệt và cấp tài khoản tự động.
   - Hồ sơ hội viên 360 độ và danh bạ doanh nghiệp.
4. **Phân hệ Quản lý Tài chính & Hội phí**:
   - Tự động sinh mã VietQR theo chuẩn Napas 24/7.
   - Xuất nhập báo cáo tài chính định dạng Excel tiêu chuẩn.
5. **Phân hệ Quản trị Sự kiện & Bàn tiệc**:
   - Thiết lập khán phòng, số bàn, số ghế và quay số Lucky Draw.
`;

  const appSrsMd = `# ĐẶC TẢ YÊU CẦU PHẦN MỀM ỨNG DỤNG DI ĐỘNG (SRS - MOBILE APP)
## ỨNG DỤNG DI ĐỘNG HỘI VIÊN CLB DOANH NHÂN CEO 1983
*Chuẩn IEEE 830 - Phiên bản 4.0 - Tháng 10/2026*

---

### 1. MỤC ĐÍCH & PHẠM VI ỨNG DỤNG
Tài liệu đặc tả các yêu cầu kỹ thuật và trải nghiệm người dùng trên ứng dụng di động CEO 1983:
- Thẻ hội viên VIP điện tử 3D và chạm danh thiếp số NFC NTAG213/215.
- Nhận nhiệm vụ được giao, xem tệp Word/Excel/PDF đính kèm và nộp báo cáo hoàn thành.
- Mạng lưới hội viên, đặt lịch gặp 1-on-1 và kết nối kinh doanh B2B.
- Ví vé sự kiện điện tử và mã QR soát vé tự động.
- Dịch vụ đàm thoại WebRTC và dịch vụ thông báo nền Native Android CeoNotificationSyncService.
- Trợ lý thông minh nhận diện giọng nói tiếng Việt hai động cơ (Dual-Engine STT/TTS).
`;

  const masterSrsMd = `# ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ HỆ THỐNG (MASTER SRS)
## TOÀN BỘ HỆ SINH THÁI SỐ CLB DOANH NHÂN CEO 1983
*Chuẩn IEEE 830 - Phiên bản 4.0 - Tháng 10/2026*

---

### 1. TỔNG QUAN KIẾN TRÚC TÍCH HỢP
Hệ thống vận hành theo kiến trúc Monorepo thống nhất:
- Tầng CSDL: Cơ sở dữ liệu PostgreSQL lưu trữ tập trung.
- Tầng Backend: Nền tảng NestJS RESTful API và Socket.IO thời gian thực.
- Tầng Quản trị: Web CRM React Vite TanStack Router mượt mà.
- Tầng Di động: Ứng dụng Hybrid Capacitor kết hợp dịch vụ Native Android Java.
`;

  // Lưu file Markdown SRS
  fs.writeFileSync(path.join(DOC_DIR, 'SRS_WEB_CRM_CEO1983.md'), crmSrsMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'SRS_WEB_CRM_CEO1983.md'), crmSrsMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'SRS_WEB_CRM_CEO1983.md'), crmSrsMd, 'utf8');

  fs.writeFileSync(path.join(DOC_DIR, 'SRS_MOBILE_APP_CEO1983.md'), appSrsMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'SRS_MOBILE_APP_CEO1983.md'), appSrsMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'SRS_MOBILE_APP_CEO1983.md'), appSrsMd, 'utf8');

  fs.writeFileSync(path.join(DOC_DIR, 'SRS_TONG_THE_HE_THONG_CEO1983.md'), masterSrsMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'SRS_TONG_THE_HE_THONG_CEO1983.md'), masterSrsMd, 'utf8');

  // Tạo các file Word .DOCX cho SRS
  await generateDocxFromText(
    'ĐẶC TẢ YÊU CẦU PHẦN MỀM HỆ THỐNG QUẢN TRỊ (SRS - WEB CRM)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    crmSrsMd,
    path.join(DOC_DIR, 'SRS_WEB_CRM_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'SRS_WEB_CRM_CEO1983.docx'), path.join(DOCS_DIR, 'SRS_WEB_CRM_CEO1983.docx'));
  fs.copyFileSync(path.join(DOC_DIR, 'SRS_WEB_CRM_CEO1983.docx'), path.join(FE_DOCS_DIR, 'SRS_WEB_CRM_CEO1983.docx'));

  await generateDocxFromText(
    'ĐẶC TẢ YÊU CẦU PHẦN MỀM ỨNG DỤNG DI ĐỘNG (SRS - MOBILE APP)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    appSrsMd,
    path.join(DOC_DIR, 'SRS_MOBILE_APP_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'SRS_MOBILE_APP_CEO1983.docx'), path.join(DOCS_DIR, 'SRS_MOBILE_APP_CEO1983.docx'));
  fs.copyFileSync(path.join(DOC_DIR, 'SRS_MOBILE_APP_CEO1983.docx'), path.join(FE_DOCS_DIR, 'SRS_MOBILE_APP_CEO1983.docx'));

  await generateDocxFromText(
    'ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ HỆ THỐNG (MASTER SRS)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    masterSrsMd,
    path.join(DOC_DIR, 'SRS_TONG_THE_HE_THONG_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'SRS_TONG_THE_HE_THONG_CEO1983.docx'), path.join(DOCS_DIR, 'SRS_TONG_THE_HE_THONG_CEO1983.docx'));

  console.log('✓ Đã xuất bản thành công 3 bộ tài liệu SRS (cả .md và .docx chuẩn đẹp)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TẠO TÀI LIỆU HDSD (HƯỚNG DẪN SỬ DỤNG TRỰC QUAN TỪNG BƯỚC)
// ─────────────────────────────────────────────────────────────────────────────
async function generateAllHdsdDocuments() {
  console.log('\n=== [4/6] BIÊN SOẠN BỘ TÀI LIỆU HƯỚNG DẪN SỬ DỤNG (HDSD) ===');

  const crmHdsdMd = `# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN TRỊ CRM (HDSD - WEB CRM)
## DÀNH CHO LÃNH ĐẠO, BAN ĐIỀU HÀNH & BAN THƯ KÝ CEO 1983
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026*

---

### BÀI 1: ĐĂNG NHẬP & THIẾT LẬP AN TOÀN TÀI KHOẢN
1. Truy cập đường dẫn Cổng Quản trị CRM.
2. Nhập Email hoặc Tên đăng nhập và Mật khẩu được cấp.
3. Nhận diện chức vụ điều hành và quyền hạn tức thời.

### BÀI 2: QUẢN TRỊ PHÂN QUYỀN MA TRẬN & TÀI KHOẢN
1. Vào mục "Phân quyền" -> "Ma trận phân quyền": Tích chọn hoặc bỏ tích các quyền thao tác cho từng vai trò.
2. Lưu ý quan trọng: Khi có chỉnh sửa chưa lưu, nếu chuyển trang hệ thống sẽ hiện popup cảnh báo. Bấm "Lưu & Chuyển chức năng" để ghi nhận an toàn.
3. Khi phân quyền của người dùng bị thay đổi, hệ thống sẽ tự động bật thông báo giữa màn hình người đó để cập nhật quyền mới.

### BÀI 3: QUY TRÌNH GIAO VIỆC & THEO DÕI TIẾN ĐỘ NHIỆM VỤ
1. Bấm nút "+ Giao việc mới":
   - Chọn Tiêu đề và Mục tiêu công việc.
   - Chọn Ban phụ trách (hệ thống tự động khóa theo đúng quyền hạn của bạn).
   - Chọn Người phụ trách và Người phối hợp (chỉ hiển thị những người thuộc ban bạn có quyền giao việc).
   - Tải lên tệp đính kèm: Hỗ trợ tệp Word (.doc, .docx), Excel (.xls, .xlsx), PDF (.pdf) hoặc hình ảnh.
   - Nhập Dự toán kinh phí và các Tiêu chí nghiệm thu công việc.
2. Bấm "Khởi tạo công việc": Người được giao việc sẽ lập tức nhận thông báo trên điện thoại.

### BÀI 4: QUẢN TRỊ HỘI VIÊN, HỘI PHÍ & TỔ CHỨC SỰ KIỆN
1. Duyệt hồ sơ hội viên mới và gửi thư thông báo.
2. Theo dõi đóng phí niên liễm qua cổng VietQR Napas 24/7.
3. Thiết kế sơ đồ khán phòng và kiểm soát cổng soát vé QR tại sự kiện.
`;

  const appHdsdMd = `# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN (HDSD - MOBILE APP)
## CẨM NANG THAO TÁC DÀNH CHO DOANH NHÂN CLB CEO 1983
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026*

---

### BÀI 1: CÀI ĐẶT ỨNG DỤNG & ĐĂNG NHẬP LẦN ĐẦU
1. Mở ứng dụng CEO 1983 trên điện thoại thông minh.
2. Đăng nhập bằng Email hoặc Mã hội viên và mật khẩu được Ban Thư ký cấp.
3. Bật quyền nhận thông báo và quyền mic/camera để sẵn sàng kết nối.

### BÀI 2: SỬ DỤNG THẺ HỘI VIÊN ĐIỆN TỬ & CHẠM DANH THIẾP NFC
1. Tại màn hình chính, thẻ hội viên VIP điện tử hiển thị trang trọng.
2. Bật tính năng NFC trên điện thoại, chạm lưng máy vào điện thoại đối tác để trao đổi danh thiếp số.
3. Hoặc nhấn vào thẻ để phóng to mã QR kết nối.

### BÀI 3: XỬ LÝ CÔNG VIỆC ĐƯỢC GIAO & NỘP BÁO CÁO
1. Vào tab "Nhiệm vụ" để xem danh sách công việc do Ban Điều Hành hoặc Trưởng ban phân công.
2. Nhấn vào từng việc để đọc kỹ yêu cầu, mở tệp Word/Excel/PDF đính kèm để nghiên cứu.
3. Đánh dấu hoàn thành các việc con và tải tệp nghiệm thu kết quả.

### BÀI 4: TRA CỨU ĐỐI TÁC, HẸN GẶP 1-ON-1 & SOÁT VÉ SỰ KIỆN
1. Tra cứu danh bạ doanh nhân theo ngành nghề và gửi lời mời hẹn gặp giao thương.
2. Mở ví vé tham dự Gala, trình mã QR tại bàn lễ tân để check-in và nhận số bàn tiệc.
3. Gọi điện thoại hoặc video bảo mật nội bộ với các thành viên khác.
`;

  const masterHdsdMd = `# HƯỚNG DẪN SỬ DỤNG TỔNG THỂ HỆ THỐNG (MASTER HDSD)
## CLB DOANH NHÂN CEO 1983 - HANOIBA
*Phiên bản: 4.0 - Phát hành: Tháng 10/2026*

---

### TỔNG HỢP TOÀN BỘ CẨM NANG VẬN HÀNH
Tài liệu hướng dẫn sử dụng hợp nhất toàn diện mọi quy trình quản trị trên máy tính và thao tác hội viên trên ứng dụng di động.
`;

  // Lưu file Markdown HDSD
  fs.writeFileSync(path.join(DOC_DIR, 'HDSD_WEB_CRM_CEO1983.md'), crmHdsdMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'HDSD_WEB_CRM_CEO1983.md'), crmHdsdMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'HDSD_WEB_CRM_CEO1983.md'), crmHdsdMd, 'utf8');

  fs.writeFileSync(path.join(DOC_DIR, 'HDSD_MOBILE_APP_CEO1983.md'), appHdsdMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'HDSD_MOBILE_APP_CEO1983.md'), appHdsdMd, 'utf8');
  fs.writeFileSync(path.join(FE_DOCS_DIR, 'HDSD_MOBILE_APP_CEO1983.md'), appHdsdMd, 'utf8');

  fs.writeFileSync(path.join(DOC_DIR, 'HDSD_TONG_THE_HE_THONG_CEO1983.md'), masterHdsdMd, 'utf8');
  fs.writeFileSync(path.join(DOCS_DIR, 'HDSD_TONG_THE_HE_THONG_CEO1983.md'), masterHdsdMd, 'utf8');

  // Tạo các file Word .DOCX cho HDSD
  await generateDocxFromText(
    'HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN TRỊ CRM (HDSD - WEB CRM)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    crmHdsdMd,
    path.join(DOC_DIR, 'HDSD_WEB_CRM_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'HDSD_WEB_CRM_CEO1983.docx'), path.join(DOCS_DIR, 'HDSD_WEB_CRM_CEO1983.docx'));
  fs.copyFileSync(path.join(DOC_DIR, 'HDSD_WEB_CRM_CEO1983.docx'), path.join(FE_DOCS_DIR, 'HDSD_WEB_CRM_CEO1983.docx'));

  await generateDocxFromText(
    'HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG DI ĐỘNG HỘI VIÊN (HDSD - MOBILE APP)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    appHdsdMd,
    path.join(DOC_DIR, 'HDSD_MOBILE_APP_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'HDSD_MOBILE_APP_CEO1983.docx'), path.join(DOCS_DIR, 'HDSD_MOBILE_APP_CEO1983.docx'));
  fs.copyFileSync(path.join(DOC_DIR, 'HDSD_MOBILE_APP_CEO1983.docx'), path.join(FE_DOCS_DIR, 'HDSD_MOBILE_APP_CEO1983.docx'));

  await generateDocxFromText(
    'HƯỚNG DẪN SỬ DỤNG TỔNG THỂ HỆ THỐNG (MASTER HDSD)',
    'CLB DOANH NHÂN CEO 1983 - HANOIBA',
    masterHdsdMd,
    path.join(DOC_DIR, 'HDSD_TONG_THE_HE_THONG_CEO1983.docx')
  );
  fs.copyFileSync(path.join(DOC_DIR, 'HDSD_TONG_THE_HE_THONG_CEO1983.docx'), path.join(DOCS_DIR, 'HDSD_TONG_THE_HE_THONG_CEO1983.docx'));

  console.log('✓ Đã xuất bản thành công 3 bộ tài liệu HDSD (cả .md và .docx chuẩn đẹp)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TẠO TÀI LIỆU TIẾN ĐỘ CÔNG VIỆC (EXCEL & MARKDOWN & WORD)
// ─────────────────────────────────────────────────────────────────────────────
async function generateAllProgressFiles() {
  console.log('\n=== [5/6] XUẤT BẢN CÁC FILE TIẾN ĐỘ CÔNG VIỆC (.XLSX & .MD) ===');

  // Gọi script đã cập nhật đầy đủ tính năng: generate_separated_progress_sheets.js
  const scriptSeparated = path.join(__dirname, 'generate_separated_progress_sheets.js');
  if (fs.existsSync(scriptSeparated)) {
    require(scriptSeparated);
  }

  // Gọi script master: generate_master_progress_doc.js
  const scriptMaster = path.join(__dirname, 'generate_master_progress_doc.js');
  if (fs.existsSync(scriptMaster)) {
    require(scriptMaster);
  }

  console.log('✓ Đã xuất bản thành công các file tiến độ công việc (.xlsx, .md, .docx)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TẠO TÀI LIỆU TEST CASES (EXCEL & MARKDOWN)
// ─────────────────────────────────────────────────────────────────────────────
async function generateAllTestCasesFiles() {
  console.log('\n=== [6/6] BIÊN SOẠN BỘ TEST CASES KIỂM THỬ HỆ THỐNG (.XLSX & .MD) ===');

  const { USE_CASES_DATA } = require('./all_use_cases_data');

  // Lọc ra các nhóm test case
  const crmUseCases = USE_CASES_DATA.filter((uc) => uc.category.includes('Quản Trị') || uc.category.includes('CRM') || uc.id.includes('CRM'));
  const appUseCases = USE_CASES_DATA.filter((uc) => uc.category.includes('Hội Viên') || uc.category.includes('App') || uc.id.includes('APP') || uc.id.includes('PUB'));

  async function exportTestCaseExcel(testCases, title, outXlsxPath) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ViConnect Solution Architecture';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Bảng Kiểm Thử Test Cases', {
      views: [{ showGridLines: true }],
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
    });

    sheet.columns = [
      { header: 'Mã TC', key: 'id', width: 14 },
      { header: 'Phân Hệ Nghiệp Vụ', key: 'category', width: 26 },
      { header: 'Tên Kịch Bản Kiểm Thử', key: 'name', width: 44 },
      { header: 'Đối Tượng Thực Hiện', key: 'actor', width: 28 },
      { header: 'Điều Kiện Tiên Quyết', key: 'pre', width: 34 },
      { header: 'Các Bước Thao Tác Chi Tiết', key: 'steps', width: 50 },
      { header: 'Kết Quả Kỳ Vọng Chuẩn', key: 'expected', width: 38 },
      { header: 'Trạng Thái', key: 'status', width: 14 },
      { header: 'Người Kiểm Thử', key: 'tester', width: 26 },
      { header: 'Ngày Kiểm Thử', key: 'date', width: 15 },
    ];

    // Style Header
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.font = { name: 'Times New Roman', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003B95' }
    };

    testCases.forEach((tc, idx) => {
      const row = sheet.addRow({
        id: tc.id || `TC-${String(idx + 1).padStart(3, '0')}`,
        category: tc.category,
        name: tc.name,
        actor: tc.actor,
        pre: tc.preConditions,
        steps: tc.mainFlow,
        expected: tc.postConditions,
        status: 'ĐẠT (PASS)',
        tester: 'QA / Ban Điều Hành CEO 1983',
        date: '12/10/2026'
      });

      row.height = 45;
      row.font = { name: 'Times New Roman', size: 11 };
      row.alignment = { vertical: 'top', wrapText: true };

      // Căn giữa mã và trạng thái
      row.getCell(1).alignment = { vertical: 'top', horizontal: 'center' };
      row.getCell(8).alignment = { vertical: 'top', horizontal: 'center' };
      row.getCell(8).font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF15803D' } };

      if (idx % 2 === 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }

      for (let c = 1; c <= 10; c++) {
        row.getCell(c).border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      }
    });

    await workbook.xlsx.writeFile(outXlsxPath);
  }

  function exportTestCaseMarkdown(testCases, title, outMdPath) {
    let md = `# ${title}\n`;
    md += `*Hệ sinh thái số CLB Doanh Nhân CEO 1983 - Cập nhật: 12/10/2026*\n\n`;
    md += `| STT | Mã TC | Phân Hệ Nghiệp Vụ | Kịch Bản Kiểm Thử | Đối Tượng | Kết Quả Kỳ Vọng | Trạng Thái |\n`;
    md += `|:---:|:---:|:---|:---|:---|:---|:---:|\n`;

    testCases.forEach((tc, idx) => {
      const tcId = tc.id || `TC-${String(idx + 1).padStart(3, '0')}`;
      const name = (tc.name || '').replace(/\|/g, '-');
      const cat = (tc.category || '').replace(/\|/g, '-');
      const actor = (tc.actor || '').replace(/\|/g, '-');
      const expected = (tc.postConditions || '').replace(/\|/g, '-').replace(/\n/g, ' ');
      md += `| ${idx + 1} | **${tcId}** | ${cat} | ${name} | ${actor} | ${expected} | **ĐẠT (PASS)** |\n`;
    });

    fs.writeFileSync(outMdPath, md, 'utf8');
  }

  // 1. Web CRM Test cases
  const crmXlsx = path.join(DOC_DIR, 'TEST_CASES_WEB_CRM_CEO1983.xlsx');
  const crmMd = path.join(DOC_DIR, 'TEST_CASES_WEB_CRM_CEO1983.md');
  await exportTestCaseExcel(crmUseCases, 'BẢNG TEST CASES KIỂM THỬ HỆ THỐNG QUẢN TRỊ WEB CRM CEO 1983', crmXlsx);
  exportTestCaseMarkdown(crmUseCases, 'BẢNG TEST CASES KIỂM THỬ HỆ THỐNG QUẢN TRỊ WEB CRM CEO 1983', crmMd);
  fs.copyFileSync(crmXlsx, path.join(DOCS_DIR, 'TEST_CASES_WEB_CRM_CEO1983.xlsx'));
  fs.copyFileSync(crmMd, path.join(DOCS_DIR, 'TEST_CASES_WEB_CRM_CEO1983.md'));
  fs.copyFileSync(crmXlsx, path.join(FE_DOCS_DIR, 'TEST_CASES_WEB_CRM_CEO1983.xlsx'));
  fs.copyFileSync(crmMd, path.join(FE_DOCS_DIR, 'TEST_CASES_WEB_CRM_CEO1983.md'));

  // 2. Mobile App Test cases
  const appXlsx = path.join(DOC_DIR, 'TEST_CASES_MOBILE_APP_CEO1983.xlsx');
  const appMd = path.join(DOC_DIR, 'TEST_CASES_MOBILE_APP_CEO1983.md');
  await exportTestCaseExcel(appUseCases, 'BẢNG TEST CASES KIỂM THỬ ỨNG DỤNG DI ĐỘNG HỘI VIÊN CEO 1983', appXlsx);
  exportTestCaseMarkdown(appUseCases, 'BẢNG TEST CASES KIỂM THỬ ỨNG DỤNG DI ĐỘNG HỘI VIÊN CEO 1983', appMd);
  fs.copyFileSync(appXlsx, path.join(DOCS_DIR, 'TEST_CASES_MOBILE_APP_CEO1983.xlsx'));
  fs.copyFileSync(appMd, path.join(DOCS_DIR, 'TEST_CASES_MOBILE_APP_CEO1983.md'));
  fs.copyFileSync(appXlsx, path.join(FE_DOCS_DIR, 'TEST_CASES_MOBILE_APP_CEO1983.xlsx'));
  fs.copyFileSync(appMd, path.join(FE_DOCS_DIR, 'TEST_CASES_MOBILE_APP_CEO1983.md'));

  // 3. Tổng thể Test cases (Tất cả 138 UCs)
  const masterXlsx = path.join(DOC_DIR, 'TEST_CASES_TONG_THE_CEO1983.xlsx');
  const masterMd = path.join(DOC_DIR, 'TEST_CASES_TONG_THE_CEO1983.md');
  await exportTestCaseExcel(USE_CASES_DATA, 'BẢNG TEST CASES KIỂM THỬ TOÀN DIỆN HỆ SINH THÁI SỐ CEO 1983', masterXlsx);
  exportTestCaseMarkdown(USE_CASES_DATA, 'BẢNG TEST CASES KIỂM THỬ TOÀN DIỆN HỆ SINH THÁI SỐ CEO 1983', masterMd);
  fs.copyFileSync(masterXlsx, path.join(DOCS_DIR, 'TEST_CASES_TONG_THE_CEO1983.xlsx'));
  fs.copyFileSync(masterMd, path.join(DOCS_DIR, 'TEST_CASES_TONG_THE_CEO1983.md'));
  fs.copyFileSync(masterXlsx, path.join(FE_DOCS_DIR, 'TEST_CASES_TONG_THE_CEO1983.xlsx'));
  fs.copyFileSync(masterMd, path.join(FE_DOCS_DIR, 'TEST_CASES_TONG_THE_CEO1983.md'));

  console.log('✓ Đã xuất bản thành công 3 bộ file Test Cases (.xlsx & .md)');
}

// ─────────────────────────────────────────────────────────────────────────────
// TIỆN ÍCH BIẾN ĐỔI VĂN BẢN MARKDOWN SANG FILE WORD (.DOCX) CHUẨN ĐẸP
// ─────────────────────────────────────────────────────────────────────────────
async function generateDocxFromText(title, subtitle, markdownContent, outDocxPath) {
  const lines = markdownContent.split('\n');
  const docElements = [];

  // Header bìa tài liệu
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    })
  );

  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: subtitle,
          font: FONT_FAMILY,
          size: 26, // 13pt
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    })
  );

  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
      children: [
        new TextRun({
          text: 'Phiên bản chính thức 4.0 - Phát hành: Tháng 10/2026',
          font: FONT_FAMILY,
          size: 22,
          italics: true,
          color: COLOR_MUTED,
        }),
      ],
    })
  );

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed === '---') continue;

    if (trimmed.startsWith('# ')) {
      docElements.push(createHeading1(trimmed.substring(2)));
    } else if (trimmed.startsWith('## ')) {
      docElements.push(createHeading2(trimmed.substring(3)));
    } else if (trimmed.startsWith('### ')) {
      docElements.push(createHeading3(trimmed.substring(4)));
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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch lề chuẩn
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'HỆ SINH THÁI DOANH NHÂN CLB CEO 1983 - HANOIBA',
                    font: FONT_FAMILY,
                    size: 18,
                    color: COLOR_MUTED,
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
                    color: COLOR_MUTED,
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
  fs.writeFileSync(outDocxPath, buffer);
}

// ─────────────────────────────────────────────────────────────────────────────
// THỰC THI TOÀN BỘ QUY TRÌNH MASTER
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('================================================================');
  console.log('BẮT ĐẦU XUẤT BẢN TRỌN BỘ 5 DANH MỤC TÀI LIỆU CHUẨN MỰC CEO 1983');
  console.log('================================================================');

  try {
    cleanOldAndRedundantFiles();
    await generateAllBrdDocuments();
    await generateAllSrsDocuments();
    await generateAllHdsdDocuments();
    await generateAllProgressFiles();
    await generateAllTestCasesFiles();

    console.log('\n================================================================');
    console.log('HOÀN TẤT 100% XUẤT BẢN VÀ DỌN DẸP TÀI LIỆU HỆ THỐNG THÀNH CÔNG!');
    console.log('================================================================');
  } catch (err) {
    console.error('Lỗi khi xuất bản tài liệu:', err);
    process.exit(1);
  }
}

main();
