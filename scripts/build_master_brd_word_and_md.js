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
  ExternalHyperlink,
} = require('docx');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Định nghĩa bảng màu thương hiệu chuẩn CEO 1983
const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '0A2540';
const COLOR_BLUE_ACCENT = '003B95';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '003B95';
const COLOR_BG_ALT = 'F8FAFC';
const TABLE_WIDTH_DXA = 9200; // Độ rộng in A4 chuẩn

const BORDER_STYLE_THIN = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
};

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 30, // 15pt
        bold: true,
        color: COLOR_NAVY,
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        color: COLOR_BLUE_ACCENT,
      }),
    ],
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: COLOR_GOLD,
      }),
    ],
  });
}

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

function createBullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 24,
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
  const headerCells = headers.map((h, i) => {
    return new TableCell({
      width: { size: finalColWidths[i], type: WidthType.DXA },
      shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
      borders: BORDER_STYLE_THIN,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: String(h),
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
  tableRows.push(new TableRow({ tableHeader: true, children: headerCells }));

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

// =========================================================================
// NỘI DUNG MARKDOWN BRD
// =========================================================================
function generateBrdMarkdown() {
  return `# Business Requirements Document (BRD)
## TÀI LIỆU YÊU CẦU NGHIỆP VỤ TOÀN DIỆN
### HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983
*Nền Tảng Quản Trị Trung Tâm (Web CRM) & Ứng Dụng Di Động Hội Viên (Mobile App)*

---

### THÔNG TIN DỰ ÁN
* **Tên Dự Án:** Hệ Sinh Thái Số Hóa & Quản Trị Hiệp Hội Doanh Nhân CEO 1983
* **Mã Tài Liệu:** BRD-CEO1983-ENTERPRISE-V1.0
* **Phiên Bản:** 1.0 (Master Enterprise Release)
* **Ngày Phát Hành:** 01/10/2026
* **Đơn Vị Chủ Trì:** CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)
* **Đơn Vị Thực Hiện:** ViConnect Platform & Ban Công Nghệ Chuyển Đổi Số
* **Trạng Thái Nghiệm Thu:** Đã thẩm định & Phê duyệt nghiệp vụ 100%

---

## 1. TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP (Executive Summary & Business Context)

### 1.1. Bối cảnh thành lập CLB Doanh nhân CEO 1983
Câu lạc bộ Doanh nhân CEO 1983 là tổ chức thành viên trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA), quy tụ hơn 500+ chủ tịch HĐQT, tổng giám đốc, nhà sáng lập doanh nghiệp sinh năm Quý Hợi 1983. Với phương châm *"Bản lĩnh - Tiên phong - Kết nối - Phát triển"*, câu lạc bộ hướng tới mục tiêu tạo ra môi trường tương trợ kinh doanh vững mạnh, liên minh xúc tiến thương mại và đồng hành phụng sự xã hội.

### 1.2. Thách thức nghiệp vụ thực tế (Pain Points)
Trước khi ứng dụng nền tảng số hóa, công tác điều hành hiệp hội gặp nhiều nút thắt lớn:
1. **Dữ liệu phân tán & Thất lạc:** Thông tin hội viên được lưu rải rác trên file Excel cá nhân và các nhóm chat Zalo/Viber, gây khó khăn cho việc tra cứu năng lực cung ứng và cập nhật thay đổi nhân sự.
2. **Quy trình phê duyệt kết nạp chồng chéo:** Thiếu sự phân định rõ ràng giữa thẩm quyền hành chính của Ban Thư Ký và thẩm quyền thẩm định doanh nghiệp của Ban Thành Viên.
3. **Thất thoát & Tốn kém thời gian thu hội phí:** Công tác theo dõi, đối soát và gạch nợ hội phí thường niên (5.000.000 VNĐ/năm) hoàn toàn thủ công, thủ quỹ phải kiểm tra từng dòng sao kê ngân hàng.
4. **Sự kiện Gala lộn xộn vị trí ngồi:** Các sự kiện lớn (300 - 500 đại biểu) chưa có sơ đồ phân khu chỗ ngồi trực quan, dẫn đến tranh chấp chỗ ngồi và ùn tắc tại cửa check-in.
5. **Đại hội bầu cử chậm trễ:** Việc phát phiếu bầu giấy và kiểm phiếu thủ công tốn từ 2 - 3 giờ đồng hồ, nguy cơ sai sót và thiếu tính bảo mật thời gian thực.
6. **Thiếu kênh giao thương nội bộ:** Hội viên chưa có sàn thương mại điện tử chuyên biệt để đăng bán sản phẩm và kết nối cơ hội Cung - Cầu 1-on-1 có bảo chứng của câu lạc bộ.

### 1.3. Mục tiêu chiến lược số hóa (Strategic Objectives & KPIs)
* **Số hóa 100% hồ sơ hội viên:** Định danh điện tử chính danh cho 500+ CEO hội viên qua mã định danh CEO-83xxx.
* **Cổng Tiếp Nhận Hồ Sơ Gia Nhập Trực Tuyến:** Ứng viên nộp hồ sơ xét duyệt chính thức tại [Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến](https://14.225.217.232:5444/landing?apply=%22true%22) (Bảo mật biểu mẫu chuẩn hóa, tiếp nhận trực tiếp vào Hội đồng Thẩm định Ban Thành Viên).
* **Tự động hóa 100% luồng thu hội phí:** Tích hợp cổng thanh toán VietQR Napas 24/7, gạch nợ tự động trong 1 giây.
* **Tăng trưởng giao thương B2B +45%:** Khớp nối trực tiếp nhu cầu Cung - Cầu giữa các thành viên, thúc đẩy tiêu dùng chéo.
* **Soát vé an ninh thông minh < 0.5s:** Cổng Check-in QR Gate nhận diện chính xác đại biểu và vị trí bàn VIP.
* **Bầu cử đại hội 1 người 1 phiếu:** Kiểm phiếu điện tử tức thì, minh bạch 100% kết quả trong 1 giây.

---

## 2. MÔ HÌNH VẬN HÀNH & PHÂN ĐỊNH 6 CHUYÊN BAN (Operational Structure & 6 Specialized Committees)

Hệ thống được thiết kế theo ma trận phân quyền chức năng bám sát cơ cấu tổ chức thực tế của CLB Doanh nhân CEO 1983:

| STT | Ban Chuyên Môn | Tài Khoản Đại Diện | Thẩm Quyền & Trách Nhiệm Nghiệp Vụ Cốt Lõi |
| :--- | :--- | :--- | :--- |
| 1 | **Ban Quản Trị (BQT)** | \`admin@connect.vn\` | - Quản trị tối cao hệ thống (\`quan_tri\`).<br>- Phê duyệt chiến lược, ngân sách, nhân sự Ban chấp hành.<br>- Cấu hình ma trận phân quyền 5 vai trò hệ thống.<br>- Phê duyệt các cuộc họp đại hội và sự kiện cấp cao. |
| 2 | **Ban Thư Ký (BTK)** | \`ceo.tongthuky@ceo1983.com\` | - Triệu tập đại biểu, khởi tạo cuộc họp định kỳ & đột xuất.<br>- Điểm danh QR cuộc họp, quản lý phòng họp Sapphire Hub.<br>- Soạn thảo và ban hành nghị quyết, biên bản đại hội.<br>- **Tuyệt đối KHÔNG có quyền phê duyệt kết nạp hội viên (không có thẩm quyền thực hiện).** |
| 3 | **Ban Thành Viên (BTV)** | \`ceo.thanhvien@ceo1983.com\` | - **Thẩm quyền độc quyền kiểm duyệt hồ sơ đăng ký mới.**<br>- Thẩm định điều kiện pháp lý, mã số thuế và năng lực doanh nghiệp.<br>- Cấp mã số hội viên định danh (CEO-83xxx).<br>- Phê duyệt kích hoạt tài khoản và phát hành email mật khẩu.<br>- Chấm điểm hoạt động, xếp hạng hội viên (Kim Cương, Vàng, Bạc). |
| 4 | **Ban Thiện Nguyện (BTN)** | \`ceo.thiennguyen@ceo1983.com\` | - Điều hành Quỹ An Sinh Xã Hội & Thiện Nguyện cộng đồng.<br>- Quản trị Sổ Quỹ Thu Chi 3 cấp duyệt (\`pending\` -> \`reviewed\` -> \`approved\`).<br>- Công khai sao kê tài chính thời gian thực phục vụ minh bạch hóa nguồn tiền. |
| 5 | **Ban Truyền Thông (BTT)** | \`ceo.truyenthong@ceo1983.com\` | - Quản trị Banner Carousel Marketing (tự động trượt 4s).<br>- Đưa tin tức, sự kiện, kho tài nguyên ảnh/video trên Mobile App.<br>- Vận hành cổng soát vé an ninh Gate Check-in QR tại sự kiện Gala. |
| 6 | **Ban Xúc Tiến (BXT)** | \`ceo.xuctien@ceo1983.com\` | - Quản trị Sàn Giao Thương B2B tiêu chuẩn thương mại B2B.<br>- Kiểm duyệt chất lượng sản phẩm và chính sách trợ giá nội bộ.<br>- Điều phối và khớp lệnh Bảng tin Cơ hội Cung - Cầu 1-on-1. |

---

## 3. PHÂN TÍCH MA TRẬN TRÁCH NHIỆM RACI (Stakeholder RACI Matrix)

* **R (Responsible):** Người trực tiếp thực hiện công việc.
* **A (Accountable):** Người chịu trách nhiệm phê duyệt và kết quả cuối cùng.
* **C (Consulted):** Người được tham vấn chuyên môn.
* **I (Informed):** Người được thông báo kết quả.

| Quy Trình Nghiệp Vụ Cốt Lõi | Ban Quản Trị (BQT) | Ban Thành Viên (BTV) | Ban Thư Ký (BTK) | Ban Tài Chính / Thiện Nguyện | Ban Truyền Thông | Ban Xúc Tiến | Hội Viên (Member) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Tiếp nhận hồ sơ đăng ký Landing Page | I | **A / R** | I | I | I | I | R |
| Thẩm định & Duyệt kết nạp (Cấp mã CEO-83xxx) | A | **R** | **KHÔNG CÓ QUYỀN** | I | I | I | I |
| Tổ chức & Cấu hình vé sự kiện Gala | A | C | C | C | **R** | C | I |
| Thiết kế sơ đồ ghế Cinema Seating Map | A | C | **R** | I | R | I | I |
| Soát vé an ninh Gate Check-in QR | I | I | C | I | **A / R** | I | I |
| Lên lịch họp & Chống trùng phòng Sapphire | A | I | **A / R** | I | I | I | I |
| Quản trị Sổ quỹ & Chi tiêu VietQR 3 cấp | **A** | I | I | **R** | I | I | I |
| Thu hội phí thường niên VietQR 24/7 | A | C | I | **R** | I | I | R |
| Duyệt sản phẩm Sàn B2B | I | C | I | I | I | **A / R** | R |
| Khớp nối cơ hội Cung - Cầu 1-on-1 | I | I | I | I | I | **A / R** | R |
| Bỏ phiếu biểu quyết đại hội điện tử | **A** | I | R | I | I | I | **R** |

---

## 4. YÊU CẦU NGHIỆP VỤ PHÂN HỆ WEB CRM QUẢN TRỊ (Core Business Requirements - CRM)

### 4.1. Phân hệ Quản trị Hội viên & Tổ chức (BR-CRM-01)
* **BR-CRM-01.1:** Tiếp nhận hồ sơ tự động từ Landing Page, gửi thư xác nhận kèm mã hồ sơ qua giao thức SMTP chuẩn Google bảo mật cao.
* **BR-CRM-01.2:** Ban Thành Viên có quyền độc quyền đối soát MST, doanh thu, pháp nhân và bấm phê duyệt. Hệ thống tự động cấp mã hội viên định dạng \`CEO-83xxx\`, tạo user trong \`auth.users\` và \`public.vione_users\`, gửi email thông báo mật khẩu khởi tạo.
* **BR-CRM-01.3:** Chặn hoàn toàn quyền duyệt hội viên đối với Ban Thư Ký và các ban khác bằng cơ chế phân quyền bảo mật của hệ thống.
* **BR-CRM-01.4:** Trang xem chi tiết hội viên 360 độ (\`/members/$memberId\`) tích hợp lịch sử tham dự sự kiện, giao thương B2B, điểm danh họp và đóng góp quỹ.
* **BR-CRM-01.5:** Quản trị tài khoản hội viên: Cấp lại mật khẩu tạm thời, kích hoạt, khóa/mở khóa tài khoản ngay lập tức.
* **BR-CRM-01.6:** Chấm điểm hoạt động cống hiến, xếp hạng hội viên (Kim Cương, Vàng, Bạc) và phân tích phân khúc ngành nghề (\`/segments\`).

### 4.2. Phân hệ Quản trị Sự kiện & Hội nghị (BR-CRM-02)
* **BR-CRM-02.1:** Khởi tạo sự kiện đa bước (Event Wizard) với thông tin tổng quan, diễn giả, timeline chương trình và ảnh banner tỷ lệ 16:9.
* **BR-CRM-02.2:** Cấu hình linh hoạt các gói vé: Vé VIP tiệc tối có phí (1.500.000 VNĐ), Vé tiêu chuẩn khách mời (0 VNĐ), Vé đặc quyền hội viên chính thức (0 VNĐ).
* **BR-CRM-02.3:** Thiết kế sơ đồ chỗ ngồi trực quan Cinema Seating Map (\`/events/seating\`) phân bổ bàn tròn Gala VIP, dãy ghế đại biểu danh dự và dãy hội viên.
* **BR-CRM-02.4:** Cổng an ninh soát vé thông minh Check-in QR Gate (\`/checkin\`) xử lý thời gian thực: Màn hình xanh lục hợp lệ trong 0.2s; Màn hình đỏ rực cảnh báo gian lận trùng lặp vé.
* **BR-CRM-02.5:** Vòng quay số may mắn (Lucky Draw) tự động nạp danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tại cửa để quay thưởng minh bạch.

### 4.3. Phân hệ Quản trị Cuộc họp & Lịch Công Tác (BR-CRM-03)
* **BR-CRM-03.1:** Khởi tạo cuộc họp tập trung hỗ trợ đa nền tảng: Phòng Họp Sapphire UniWork Hub (sức chứa 40 chỗ), Zoom Meetings, Google Meet, UniWork Meet và Địa điểm Offline khác.
* **BR-CRM-03.2:** Thuật toán chống trùng phòng họp vật lý tự động cảnh báo xung đột lịch.
* **BR-CRM-03.3:** Cuộc họp do Trưởng ban/Thư ký tạo ở trạng thái \`pending_approval\`, chỉ kích hoạt \`upcoming\` khi Ban Quản Trị phê duyệt.
* **BR-CRM-03.4:** Tự động gửi giấy triệu tập và tin nhắn hệ thống [CEO1983_SYSTEM] đến đại biểu tham gia.
* **BR-CRM-03.5:** Điểm danh đại biểu bằng mã QR động tự thay đổi sau mỗi 30 giây để chống gian lận gửi ảnh điểm danh từ xa.
* **BR-CRM-03.6:** Biên bản cuộc họp điện tử đính kèm nghị quyết ký số và tự động giao việc cho các ban chuyên môn (\`/tasks\`).

### 4.4. Phân hệ Quản trị Tài chính & Sổ Quỹ Cashbook (BR-CRM-04)
* **BR-CRM-04.1:** Quản lý thu hội phí thường niên (5.000.000 VNĐ/năm), tự động cảnh báo nộp trước 30 ngày và đối soát công nợ.
* **BR-CRM-04.2:** Tích hợp Cổng thanh toán VietQR Napas 24/7: Sinh mã QR chuyển khoản tự động kèm cú pháp định danh; tự động gạch nợ sang \`paid\` qua Webhook trong 1 giây.
* **BR-CRM-04.3:** Quy trình kiểm soát phiếu chi 3 cấp nghiêm ngặt: Lập phiếu (\`pending\`) -> Kiểm soát (\`reviewed\`) -> Phê duyệt xuất quỹ (\`approved\`).
* **BR-CRM-04.4:** Quản lý Quỹ An Sinh Xã Hội & Thiện Nguyện (\`/funds\`), công khai sao kê thu chi minh bạch thời gian thực cho toàn thể hội viên.

### 4.5. Phân hệ Quản trị Hệ thống & Phân Quyền RBAC (BR-CRM-05)
* **BR-CRM-05.1:** Ma trận phân quyền 5 vai trò hệ thống độc lập: Quản trị (\`platform_admin\`), Admin (\`admin\`), Tổng thư ký (\`tong_thu_ky\`), Trưởng ban (\`truong_ban\`), Thành viên (\`member\`).
* **BR-CRM-05.2:** Kiểm soát chi tiết 30 chức năng cốt lõi (tương ứng 8 nhóm Sidebar) qua ActionPills (Xem, Thêm, Sửa, Xóa, Duyệt, Điểm danh, Bỏ phiếu).
* **BR-CRM-05.3:** Lưu trữ cấu hình phân quyền trực tiếp vào cơ sở dữ liệu PostgreSQL và đồng bộ cache.

---

## 5. YÊU CẦU NGHIỆP VỤ PHÂN HỆ MOBILE APP HIỆP HỘI (Core Business Requirements - Mobile App)

### 5.1. Danh Thiếp Số VIP 3D & Hồ Sơ Cá Nhân (BR-APP-01)
* **BR-APP-01.1:** Đăng nhập an toàn, ghi nhớ tài khoản và bắt buộc đổi mật khẩu khởi tạo đối với hội viên mới (\`/account-settings\`).
* **BR-APP-01.2:** Thẻ Hội Viên VIP Titanium 3D hiệu ứng mạ vàng hoàng gia, xoay lật 180 độ 3D và hiển thị mã QR định danh cá nhân độc bản (\`/association/card\`).
* **BR-APP-01.3:** Kết nối chạm một chạm NFC không tiếp xúc: Chạm mặt sau thẻ vào smartphone để mở ngay trang danh thiếp công khai (\`/card/:slug\`).
* **BR-APP-01.4:** Tự động xuất file vCard (.vcf) đồng bộ toàn bộ Họ tên, SĐT, Email, Công ty, Avatar vào danh bạ điện thoại đối tác trong 1 giây.
* **BR-APP-01.5:** Chỉnh sửa nhanh hồ sơ cá nhân qua \`QuickProfileEditModal\`: Cập nhật avatar, ảnh bìa, logo công ty và chức vụ lãnh đạo ngay trên màn hình chính.

### 5.2. Kết Nối Doanh Nhân & Trò Chuyện Thời Gian Thực (BR-APP-02)
* **BR-APP-02.1:** Khám phá danh bạ 500+ CEO hội viên, lọc thông minh theo ngành nghề, tỉnh thành và chuyên ban.
* **BR-APP-02.2:** Quét mã QR camera WebRTC siêu tốc trong 0.1 giây để kết nối đối tác hoặc điểm danh sự kiện.
* **BR-APP-02.3:** Đặt lịch hẹn gặp kết nối kinh doanh 1-on-1 giữa 2 hội viên, hỗ trợ xác nhận, đề xuất đổi giờ và đồng bộ Google Calendar.
* **BR-APP-02.4:** Nhắn tin trò chuyện 1-1 và Nhóm chat chuyên ban thời gian thực qua WebSocket, hỗ trợ gửi ảnh, tài liệu năng lực và vị trí.
* **BR-APP-02.5:** Chuyển tiếp tin nhắn, tìm kiếm lịch sử hội thoại và ghim tin nhắn thông báo quan trọng.

### 5.3. Vé Sự Kiện Điện Tử & Điểm Danh Hội Trường (BR-APP-03)
* **BR-APP-03.1:** Khám phá sự kiện, xem thông tin diễn giả VIP và khung thời gian chương trình.
* **BR-APP-03.2:** Hội viên chính thức đăng ký vé VIP miễn phí 0 VNĐ (tự động nhận diện tư cách hội viên).
* **BR-APP-03.3:** Mua thêm vé cho đối tác đi cùng kèm thanh toán phụ thu trực tiếp qua VietQR Napas.
* **BR-APP-03.4:** Trực quan hóa và lựa chọn vị trí ghế ngồi Cinema Seating Map ngay trên điện thoại.
* **BR-APP-03.5:** Ví vé điện tử ("Vé Sự Kiện Của Tôi") lưu trữ Offline, hiển thị mã QR E-Ticket khổ lớn và mã số bốc thăm may mắn (#LUCKY-xxxx) để check-in tại cửa.
* **BR-APP-03.6:** Quét QR điểm danh tại bàn tiếp đón, tự động cộng điểm cống hiến vào hồ sơ hội viên.

### 5.4. Sàn Giao Thương B2B & Cơ Hội Cung - Cầu 1-on-1 (BR-APP-04)
* **BR-APP-04.1:** Đăng bán sản phẩm, dịch vụ doanh nghiệp lên Sàn B2B kèm chính sách trợ giá độc quyền cho hội viên CEO 1983.
* **BR-APP-04.2:** Khám phá chợ B2B tiêu chuẩn B2B, xem chi tiết sản phẩm qua \`ProductDetailModal\` và chat trực tiếp với chủ doanh nghiệp bán.
* **BR-APP-04.3:** Đăng tin trao đổi cơ hội kinh doanh Cung - Cầu (Cần Mua / Cần Bán) lên bảng tin chung.
* **BR-APP-04.4:** Bấm tiếp nhận cơ hội kinh doanh (Claim Opportunity), tự động tạo phòng trao đổi hợp tác và ghi nhận doanh số giao thương cho hiệp hội.

### 5.5. Biểu Quyết Đại Hội Điện Tử (BR-APP-05)
* **BR-APP-05.1:** Bỏ phiếu bầu cử Ban chấp hành và thông qua nghị quyết đại hội trực tuyến 1 người 1 phiếu.
* **BR-APP-05.2:** Mã hóa một chiều phiếu bầu, đảm bảo tính bảo mật và ẩn danh của đại biểu.
* **BR-APP-05.3:** Cập nhật kết quả biểu quyết (Live Chart) thời gian thực trên màn hình lớn của đại hội.

---

## 6. QUY TẮC NGHIỆP VỤ BẮT BUỘC (Strict Business Rules)

1. **Quy tắc Thẩm quyền Phê duyệt Hội viên (RULE-RBAC-01):**
   - Thẩm quyền kiểm duyệt và phê duyệt kết nạp hội viên mới thuộc về **Ban Thành Viên (\`ban_thanh_vien\` / \`ceo.thanhvien@ceo1983.com\`)** hoặc Ban Quản Trị (\`quan_tri\` / \`admin\`).
   - Ban Thư Ký và các ban chuyên môn khác TUYỆT ĐỐI KHÔNG có quyền phê duyệt hồ sơ kết nạp. Nếu can thiệp, hệ thống bắt buộc chặn đứng bằng mã lỗi **Từ chối quyền hạn Forbidden**.
2. **Quy tắc Chuẩn hóa 6 Chuyên Ban (RULE-RBAC-02):**
   - Hệ thống vận hành đúng 6 chuyên ban: Ban Quản Trị, Ban Thư Ký, Ban Thành Viên, Ban Thiện Nguyện, Ban Truyền Thông, Ban Xúc Tiến.
3. **Quy tắc Thuật ngữ (RULE-TERM-01):**
   - Tuyệt đối KHÔNG sử dụng từ "niên liễm" trong bất kỳ tài liệu, giao diện hay mã nguồn nào; bắt buộc thay bằng **"hội phí"** hoặc **"hội phí thường niên"**.
4. **Quy tắc Sổ Quỹ Thu Chi 3 Cấp (RULE-FIN-01):**
   - Mọi khoản chi từ quỹ câu lạc bộ bắt buộc trải qua 3 cấp duyệt: Lập phiếu -> Thẩm định -> Phê duyệt xuất quỹ. Toàn bộ giao dịch thu chi được gạch nợ tự động qua VietQR Napas 24/7.
5. **Quy tắc Kiểm soát Chỗ Ngồi Sự Kiện (RULE-EVT-01):**
   - 100% đại biểu tham dự sự kiện Gala có chỗ ngồi được định danh trên Cinema Seating Map và in trực tiếp trên mã vé QR E-Ticket.
6. **Quy tắc Soát Vé Chống Trùng Lặp (RULE-SEC-01):**
   - Mỗi mã vé QR chỉ được phép qua cổng an ninh 01 lần duy nhất. Lần quét thứ hai bắt buộc kích hoạt cảnh báo đỏ gian lận.
7. **Quy tắc Biểu Quyết 1 Người 1 Phiếu (RULE-VOT-01):**
   - Mỗi hội viên chính thức chỉ có đúng 01 phiếu biểu quyết cho mỗi tờ trình, không thể can thiệp hay sửa đổi sau khi đã xác nhận.

---

## 7. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

| Tiêu Chí | Yêu Cầu Chi Tiết | Chỉ Số Đo Lường (SLA) |
| :--- | :--- | :--- |
| **Hiệu năng (Performance)** | - Phản hồi API trung bình dưới 150ms.<br>- Quét nhận diện mã QR soát vé camera dưới 0.2s.<br>- Tải trang Mobile App dưới 1.5s trên mạng 4G.<br>- Chịu tải đồng thời tối thiểu 5,000 người dùng. | Response < 150ms<br>Scan QR < 200ms<br>Concurrent > 5,000 |
| **Bảo mật (Security)** | - Mã hóa toàn bộ dữ liệu qua HTTPS TLS 1.3 và WSS.<br>- Mật khẩu băm Bcrypt Salt 10 vòng.<br>- Tự động khóa tài khoản sau 5 lần đăng nhập sai.<br>- Ghi nhật ký kiểm toán Audit Logs 100% các thao tác quản trị. | TLS 1.3<br>Bcrypt Salt 10<br>Lock 5 fails<br>Audit 100% |
| **Độ tin cậy & Sao lưu** | - Tính sẵn sàng của hệ thống đạt 99.9%.<br>- Sao lưu tự động cơ sở dữ liệu hàng ngày lúc 03:00 AM.<br>- Thời gian phục hồi thảm họa RTO < 2 giờ, RPO < 24 giờ. | Uptime > 99.9%<br>Daily Backup<br>RTO < 2h |
| **Giao diện & Trải nghiệm** | - Thiết kế theo phong cách Hoàng Gia Doanh Nhân (Navy & Amber Gold).<br>- Tương thích hoàn hảo mọi thiết bị di động (Responsive 100%).<br>- Không có lỗi gãy chữ hay cột hẹp trên các tài liệu xuất bản. | Responsive 100%<br>Lỗi giao diện: 0%<br>Bảng Word chuẩn DXA |

---

## 8. LỘ TRÌNH TRIỂN KHAI & KẾ HOẠCH BÀN GIAO (Implementation Roadmap)

1. **Giai đoạn 1 (Tháng 09/2026):** Khởi tạo hạ tầng, thiết kế CSDL PostgreSQL, đồng bộ 6 chuyên ban và MinIO Object Storage. (Hoàn thành 100%)
2. **Giai đoạn 2 (Tháng 09/2026):** Triển khai xác thực JWT, bảo mật RBAC 5 vai trò và phân định thẩm quyền Ban Thành Viên duyệt hội viên. (Hoàn thành 100%)
3. **Giai đoạn 3 (Tháng 09/2026):** Xây dựng Cổng Quản trị Web CRM (Hội viên 360 độ, Sự kiện Event Wizard, Lịch họp Sapphire Hub, Sổ quỹ VietQR). (Hoàn thành 100%)
4. **Giai đoạn 4 (Tháng 09/2026):** Phát triển Mobile App Hiệp Hội (Thẻ VIP 3D NFC, Hẹn gặp 1-1, Chat realtime, Sàn B2B, Biểu quyết). (Hoàn thành 100%)
5. **Giai đoạn 5 (Tháng 09/2026):** Tích hợp dịch vụ Mailer SMTP gửi email tự động và Cổng thanh toán VietQR Napas 24/7. (Hoàn thành 100%)
6. **Giai đoạn 6 (Tháng 10/2026):** Kiểm thử E2E full luồng trên môi trường môi trường vận hành thực tế, khắc phục 100% lỗi dữ liệu. (Hoàn thành 100%)
7. **Giai đoạn 7 (Tháng 10/2026):** Biên soạn trọn bộ tài liệu Master: SRS 52 Use Cases, BRD Nghiệp vụ, HDSD 16 Chương, Test Cases 54 TCs, Báo cáo Tiến độ 42 WPs và Slide thuyết trình. (Hoàn thành 100%)
8. **Giai đoạn 8 (Tháng 10/2026):** Nghiệm thu kỹ thuật, bàn giao mã nguồn cục bộ và đào tạo chuyển giao vận hành cho Ban Điều Hành CLB CEO 1983. (Sẵn sàng bàn giao)

---
*Tài Liệu Yêu Cầu Nghiệp Vụ (BRD) Hệ Sinh Thái Số Hóa Hiệp Hội Doanh Nhân CEO 1983 - Bản quyền thuộc về CLB Doanh Nhân CEO 1983 & HanoiBA (2026).*
`;
}

// =========================================================================
// XÂY DỰNG FILE WORD DOCX BRD
// =========================================================================
async function buildBrdDocxFile(outputPath) {
  const docChildren = [];

  // Trang bìa DOCX
  docChildren.push(
    new Paragraph({ spacing: { before: 1000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)',
          font: FONT_FAMILY,
          size: 24, // 12pt
          bold: true,
          color: '64748B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({
          text: 'CLB DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 28, // 14pt
          bold: true,
          color: COLOR_GOLD,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 600 },
      children: [
        new TextRun({
          text: '----------------------------------------',
          font: FONT_FAMILY,
          size: 20,
          color: COLOR_BORDER,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'BUSINESS REQUIREMENTS DOCUMENT (BRD)',
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: COLOR_NAVY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: 'TÀI LIỆU YÊU CẦU NGHIỆP VỤ TOÀN DIỆN',
          font: FONT_FAMILY,
          size: 28, // 14pt
          bold: true,
          color: COLOR_BLUE_ACCENT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 800 },
      children: [
        new TextRun({
          text: 'HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983',
          font: FONT_FAMILY,
          size: 24, // 12pt
          italics: true,
          color: '475569',
        }),
      ],
    })
  );

  // Metadata Table
  const metaHeaders = ['Thuộc Tính Dự Án', 'Thông Tin Chi Tiết Nghiệp Vụ'];
  const metaWidths = [2800, 6400];
  const metaRows = [
    ['Tên Dự Án', 'Hệ Sinh Thái Số Hóa & Quản Trị Hiệp Hội Doanh Nhân CEO 1983'],
    ['Mã Tài Liệu', 'BRD-CEO1983-ENTERPRISE-V1.0'],
    ['Phiên Bản', '1.0 (Master Enterprise Edition)'],
    ['Ngày Phát Hành', '01/10/2026'],
    ['Đơn Vị Chủ Trì', 'CLB Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội - HanoiBA)'],
    ['Đơn Vị Thực Hiện', 'ViConnect Platform & Ban Công Nghệ Chuyển Đổi Số'],
    ['Môi Trường Nghiệm Thu', 'Cổng Thông Tin Điện Tử, Cổng Quản Trị Ban Chấp Hành & Ứng Dụng Doanh Nhân CEO 1983'],
    ['Trạng Thái Nghiệm Thu', 'Đã Thẩm Định & Phê Duyệt Nghiệp Vụ 100% (Sẵn sàng bàn giao)'],
  ];
  docChildren.push(
    createTable(metaHeaders, metaRows, metaWidths),
    new Paragraph({ spacing: { after: 600 } })
  );

  // ==================== 1. TỔNG QUAN & BỐI CẢNH ====================
  docChildren.push(
    createHeading1('1. TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP (Executive Summary)'),
    createHeading2('1.1. Bối cảnh thành lập CLB Doanh nhân CEO 1983'),
    createParagraph('Câu lạc bộ Doanh nhân CEO 1983 là tổ chức thành viên trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA), quy tụ hơn 500+ chủ tịch HĐQT, tổng giám đốc, nhà sáng lập doanh nghiệp sinh năm Quý Hợi 1983. Với phương châm "Bản lĩnh - Tiên phong - Kết nối - Phát triển", câu lạc bộ hướng tới mục tiêu tạo ra môi trường tương trợ kinh doanh vững mạnh, liên minh xúc tiến thương mại và đồng hành phụng sự xã hội.'),
    createHeading2('1.2. Thách thức nghiệp vụ thực tế (Pain Points)'),
    createBullet('Dữ liệu phân tán & Thất lạc: Thông tin hội viên lưu rải rác trên file Excel cá nhân và các nhóm chat Zalo/Viber, gây khó khăn cho tra cứu năng lực cung ứng.'),
    createBullet('Quy trình phê duyệt kết nạp chồng chéo: Thiếu sự phân định rõ ràng giữa thẩm quyền hành chính của Ban Thư Ký và thẩm quyền thẩm định của Ban Thành Viên.'),
    createBullet('Thất thoát & Tốn kém thời gian thu hội phí: Công tác theo dõi, đối soát và gạch nợ hội phí thường niên (5.000.000 VNĐ/năm) hoàn toàn thủ công.'),
    createBullet('Sự kiện Gala lộn xộn vị trí ngồi: Các sự kiện lớn (300 - 500 đại biểu) chưa có sơ đồ phân khu chỗ ngồi trực quan, dẫn đến tranh chấp chỗ ngồi.'),
    createBullet('Đại hội bầu cử chậm trễ: Việc phát phiếu bầu giấy và kiểm phiếu thủ công tốn từ 2 - 3 giờ đồng hồ, nguy cơ sai sót và thiếu tính bảo mật thời gian thực.'),
    createBullet('Thiếu kênh giao thương nội bộ: Hội viên chưa có sàn thương mại điện tử chuyên biệt để đăng bán sản phẩm và kết nối cơ hội Cung - Cầu 1-on-1.'),
    createHeading2('1.3. Mục tiêu chiến lược số hóa (Strategic Objectives & KPIs)'),
    createBullet('Số hóa 100% hồ sơ hội viên: Định danh điện tử chính danh cho 500+ CEO hội viên qua mã định danh CEO-83xxx.'),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 40, line: 260 },
      children: [
        new TextRun({
          text: 'Cổng Tiếp Nhận Hồ Sơ Gia Nhập Trực Tuyến: Ứng viên nộp hồ sơ xét duyệt chính thức tại ',
          font: FONT_FAMILY,
          size: 24,
          color: COLOR_DARK,
        }),
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: 'Cổng Tiếp Nhận Hồ Sơ Gia Nhập CLB Doanh Nhân CEO 1983 Trực Tuyến',
              font: FONT_FAMILY,
              size: 24,
              bold: true,
              color: COLOR_BLUE_ACCENT,
              underline: {},
            }),
          ],
          link: 'https://14.225.217.232:5444/landing?apply=%22true%22',
        }),
        new TextRun({
          text: ' (Bảo mật biểu mẫu điện tử chuẩn hóa, tiếp nhận trực tiếp vào Hội đồng Thẩm định Ban Thành Viên).',
          font: FONT_FAMILY,
          size: 24,
          color: COLOR_DARK,
        }),
      ],
    }),
    createBullet('Tự động hóa 100% luồng thu hội phí: Tích hợp cổng thanh toán VietQR Napas 24/7, gạch nợ tự động trong 1 giây.'),
    createBullet('Tăng trưởng giao thương B2B +45%: Khớp nối trực tiếp nhu cầu Cung - Cầu giữa các thành viên, thúc đẩy tiêu dùng chéo.'),
    createBullet('Soát vé an ninh thông minh < 0.5s: Cổng Check-in QR Gate nhận diện chính xác đại biểu và vị trí bàn VIP.'),
    createBullet('Bầu cử đại hội 1 người 1 phiếu: Kiểm phiếu điện tử tức thì, minh bạch 100% kết quả trong 1 giây.')
  );

  // ==================== 2. MÔ HÌNH VẬN HÀNH 6 CHUYÊN BAN ====================
  const banHeaders = ['STT', 'Ban Chuyên Môn', 'Tài Khoản Đại Diện', 'Thẩm Quyền & Trách Nhiệm Nghiệp Vụ Cốt Lõi'];
  const banWidths = [700, 2000, 2500, 4000];
  const banRows = [
    ['1', 'Ban Quản Trị (BQT)', 'admin@connect.vn', 'Quản trị tối cao hệ thống (quan_tri). Phê duyệt chiến lược, ngân sách, nhân sự. Cấu hình ma trận phân quyền 5 vai trò hệ thống.'],
    ['2', 'Ban Thư Ký (BTK)', 'ceo.tongthuky@ceo1983.com', 'Triệu tập đại biểu, khởi tạo cuộc họp. Điểm danh QR, quản lý phòng họp Sapphire Hub. Soạn thảo nghị quyết. TUYỆT ĐỐI KHÔNG DUYỆT HỘI VIÊN (Từ chối quyền hạn).'],
    ['3', 'Ban Thành Viên (BTV)', 'ceo.thanhvien@ceo1983.com', 'THẨM QUYỀN ĐỘC QUYỀN KIỂM DUYỆT HỘI VIÊN MỚI. Thẩm định MST, năng lực doanh nghiệp, cấp mã số CEO-83xxx, tạo tài khoản và gửi email mật khẩu.'],
    ['4', 'Ban Thiện Nguyện (BTN)', 'ceo.thiennguyen@ceo1983.com', 'Điều hành Quỹ An Sinh Xã Hội. Quản trị Sổ Quỹ Thu Chi 3 cấp duyệt. Công khai sao kê tài chính thời gian thực phục vụ minh bạch hóa nguồn tiền.'],
    ['5', 'Ban Truyền Thông (BTT)', 'ceo.truyenthong@ceo1983.com', 'Quản trị Banner Carousel Marketing (tự động trượt 4s). Đưa tin tức, sự kiện. Vận hành cổng soát vé an ninh Gate Check-in QR tại sự kiện Gala.'],
    ['6', 'Ban Xúc Tiến (BXT)', 'ceo.xuctien@ceo1983.com', 'Quản trị Sàn Giao Thương B2B tiêu chuẩn B2B. Kiểm duyệt chất lượng sản phẩm và chính sách trợ giá nội bộ. Khớp lệnh Bảng tin Cơ hội Cung - Cầu 1-on-1.'],
  ];

  docChildren.push(
    createHeading1('2. MÔ HÌNH VẬN HÀNH & PHÂN ĐỊNH 6 CHUYÊN BAN (Operational Structure)'),
    createParagraph('Hệ thống được thiết kế bám sát cơ cấu tổ chức và chức năng nhiệm vụ của 6 Chuyên Ban trực thuộc CLB CEO 1983:'),
    createTable(banHeaders, banRows, banWidths)
  );

  // ==================== 3. MA TRẬN RACI ====================
  const raciHeaders = ['Quy Trình Nghiệp Vụ', 'BQT', 'BTV', 'BTK', 'BTN', 'BTT', 'BXT', 'Hội Viên'];
  const raciWidths = [2600, 1000, 1200, 1200, 1000, 1000, 1000, 1200];
  const raciRows = [
    ['Tiếp nhận đơn đăng ký Landing Page', 'I', 'A / R', 'I', 'I', 'I', 'I', 'R'],
    ['Thẩm định & Duyệt kết nạp (Cấp mã CEO-83xxx)', 'A', 'R', 'BLOCKED', 'I', 'I', 'I', 'I'],
    ['Tổ chức & Cấu hình vé sự kiện Gala', 'A', 'C', 'C', 'C', 'R', 'C', 'I'],
    ['Thiết kế sơ đồ ghế Cinema Seating Map', 'A', 'C', 'R', 'I', 'R', 'I', 'I'],
    ['Soát vé an ninh Gate Check-in QR', 'I', 'I', 'C', 'I', 'A / R', 'I', 'I'],
    ['Lên lịch họp & Chống trùng phòng Sapphire', 'A', 'I', 'A / R', 'I', 'I', 'I', 'I'],
    ['Quản trị Sổ quỹ & Chi tiêu VietQR 3 cấp', 'A', 'I', 'I', 'R', 'I', 'I', 'I'],
    ['Thu hội phí thường niên VietQR 24/7', 'A', 'C', 'I', 'R', 'I', 'I', 'R'],
    ['Duyệt sản phẩm Sàn B2B', 'I', 'C', 'I', 'I', 'I', 'A / R', 'R'],
    ['Khớp nối cơ hội Cung - Cầu 1-on-1', 'I', 'I', 'I', 'I', 'I', 'A / R', 'R'],
    ['Bỏ phiếu biểu quyết đại hội điện tử', 'A', 'I', 'R', 'I', 'I', 'I', 'R'],
  ];

  docChildren.push(
    createHeading1('3. MA TRẬN PHÂN TÍCH TRÁCH NHIỆM RACI (RACI Matrix)'),
    createParagraph('Quy chuẩn trách nhiệm giữa các bên liên quan theo chuẩn RACI (Responsible, Accountable, Consulted, Informed):'),
    createTable(raciHeaders, raciRows, raciWidths)
  );

  // ==================== 4. YÊU CẦU NGHIỆP VỤ CRM ====================
  docChildren.push(
    createHeading1('4. YÊU CẦU NGHIỆP VỤ PHÂN HỆ WEB CRM QUẢN TRỊ (Business Requirements - CRM)'),
    createHeading2('4.1. Quản trị Vòng Đời Hội Viên & Thẩm Định Doanh Nghiệp (BR-CRM-01)'),
    createBullet('BR-CRM-01.1: Tiếp nhận hồ sơ đăng ký trực tuyến từ Landing Page, tự động gửi thư xác nhận kèm mã hồ sơ qua Google SMTP bảo mật cao.'),
    createBullet('BR-CRM-01.2: Thẩm quyền độc quyền kiểm duyệt hồ sơ thuộc về Ban Thành Viên. Khi duyệt thành công, hệ thống cấp mã CEO-83xxx, tạo tài khoản trong auth.users và vione_users, gửi email tài khoản chính thức.'),
    createBullet('BR-CRM-01.3: Chặn hoàn toàn quyền duyệt hội viên của Ban Thư Ký và các ban khác bằng cơ chế phân quyền bảo mật của hệ thống.'),
    createBullet('BR-CRM-01.4: Hồ sơ hội viên 360 độ (/members/$memberId) tích hợp toàn diện lịch sử tham dự sự kiện, giao thương B2B, điểm danh và cống hiến.'),
    createBullet('BR-CRM-01.5: Quản trị tài khoản: Reset mật khẩu tạm thời, kích hoạt, khóa/mở khóa tài khoản ngay lập tức.'),
    createBullet('BR-CRM-01.6: Chấm điểm hoạt động, xếp hạng hội viên (Kim Cương, Vàng, Bạc) và phân tích ngành nghề (/segments).'),

    createHeading2('4.2. Quản Trị Sự Kiện, Vé Mời & Soát Vé An Ninh (BR-CRM-02)'),
    createBullet('BR-CRM-02.1: Khởi tạo sự kiện đa bước qua Event Wizard (/events/new) cấu hình lịch trình, diễn giả, banner 16:9.'),
    createBullet('BR-CRM-02.2: Cấu hình đa dạng gói vé: Vé VIP tiệc tối có phí (1.500.000 VNĐ), Vé khách mời miễn phí (0 VNĐ), Vé ưu đãi hội viên (0 VNĐ).'),
    createBullet('BR-CRM-02.3: Thiết kế sơ đồ ghế Cinema Seating Map phân khu bàn VIP Gala tròn và dãy ghế đại biểu danh dự.'),
    createBullet('BR-CRM-02.4: Cổng an ninh Gate Check-in QR Gate (/checkin) phản hồi trong 0.2s: Xanh lục hợp lệ; Đỏ rực cảnh báo trùng vé.'),
    createBullet('BR-CRM-02.5: Vòng quay may mắn (Lucky Draw) tự động nạp danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tại cửa để quay thưởng.'),

    createHeading2('4.3. Quản Trị Cuộc Họp & Lịch Công Tác Tập Trung (BR-CRM-03)'),
    createBullet('BR-CRM-03.1: Khởi tạo cuộc họp hỗ trợ Zoom, Google Meet, UniWork, Phòng Họp Sapphire Hub 40 chỗ và Offline.'),
    createBullet('BR-CRM-03.2: Thuật toán chống trùng phòng họp Sapphire Hub tự động kiểm tra xung đột khung giờ.'),
    createBullet('BR-CRM-03.3: Lịch họp do Thư ký/Trưởng ban tạo ở trạng thái pending_approval, chỉ kích hoạt khi Ban Quản Trị phê duyệt.'),
    createBullet('BR-CRM-03.4: Tự động gửi giấy triệu tập và tin nhắn hệ thống [CEO1983_SYSTEM] đến đại biểu tham gia.'),
    createBullet('BR-CRM-03.5: Điểm danh đại biểu bằng mã QR động thay đổi sau mỗi 30 giây để chống gian lận.'),
    createBullet('BR-CRM-03.6: Biên bản cuộc họp điện tử đính kèm nghị quyết ký số và tự động giao việc cho các chuyên ban (/tasks).'),

    createHeading2('4.4. Quản Trị Tài Chính, Hội Phí & Sổ Quỹ Cashbook (BR-CRM-04)'),
    createBullet('BR-CRM-04.1: Quản lý thu hội phí thường niên (5.000.000 VNĐ/năm), cảnh báo hạn nộp và đối soát công nợ tự động.'),
    createBullet('BR-CRM-04.2: Tích hợp Cổng thanh toán VietQR Napas 24/7 sinh mã QR tự động kèm cú pháp định danh; tự động gạch nợ trong 1 giây.'),
    createBullet('BR-CRM-04.3: Quy trình kiểm soát phiếu chi 3 cấp nghiêm ngặt: Lập phiếu -> Kiểm soát -> Phê duyệt xuất quỹ.'),
    createBullet('BR-CRM-04.4: Quản lý Quỹ An Sinh Xã Hội & Thiện Nguyện (/funds), công khai sao kê thu chi minh bạch thời gian thực.'),

    createHeading2('4.5. Quản Trị Hệ Thống & Ma Trận Phân Quyền RBAC (BR-CRM-05)'),
    createBullet('BR-CRM-05.1: Kiểm soát 5 vai trò hệ thống chuẩn: Quản trị, Admin, Tổng thư ký, Trưởng ban, Thành viên.'),
    createBullet('BR-CRM-05.2: Ma trận phân quyền chi tiết cho 30 chức năng cốt lõi (tương ứng 8 nhóm Sidebar) qua ActionPill.'),
    createBullet('BR-CRM-05.3: Lưu trữ phân quyền trực tiếp vào bảng public.app_settings với key crm_permission_matrix.')
  );

  // ==================== 5. YÊU CẦU NGHIỆP VỤ APP HIỆP HỘI ====================
  docChildren.push(
    createHeading1('5. YÊU CẦU NGHIỆP VỤ PHÂN HỆ MOBILE APP HIỆP HỘI (Business Requirements - Mobile App)'),
    createHeading2('5.1. Thẻ Hội Viên VIP 3D, Danh Thiếp Số & Cá Nhân Hóa (BR-APP-01)'),
    createBullet('BR-APP-01.1: Đăng nhập an toàn, ghi nhớ tài khoản và bắt buộc đổi mật khẩu khởi tạo đối với hội viên mới (/account-settings).'),
    createBullet('BR-APP-01.2: Thẻ Hội Viên VIP Titanium 3D mạ vàng hoàng gia, xoay lật 180 độ và hiển thị mã QR định danh cá nhân độc bản.'),
    createBullet('BR-APP-01.3: Kết nối chạm một chạm NFC không tiếp xúc: Chạm thẻ vào smartphone để mở ngay trang danh thiếp công khai (/card/:slug).'),
    createBullet('BR-APP-01.4: Tự động xuất file vCard (.vcf) đồng bộ toàn bộ thông tin liên hệ vào danh bạ điện thoại đối tác trong 1 giây.'),
    createBullet('BR-APP-01.5: Chỉnh sửa nhanh hồ sơ qua QuickProfileEditModal: Cập nhật avatar, ảnh bìa, logo công ty và chức vụ lãnh đạo.'),

    createHeading2('5.2. Giao Thương B2B, Hẹn Gặp 1-1 & Nhắn Tin Thời Gian Thực (BR-APP-02)'),
    createBullet('BR-APP-02.1: Khám phá danh bạ 500+ CEO hội viên, lọc thông minh theo ngành nghề, tỉnh thành và chuyên ban.'),
    createBullet('BR-APP-02.2: Quét mã QR camera WebRTC siêu tốc trong 0.1s để kết nối đối tác hoặc điểm danh sự kiện.'),
    createBullet('BR-APP-02.3: Đặt lịch hẹn gặp kết nối kinh doanh 1-on-1 giữa 2 hội viên, hỗ trợ xác nhận, đề xuất đổi giờ và sync lịch cá nhân.'),
    createBullet('BR-APP-02.4: Nhắn tin trò chuyện 1-1 và Nhóm chat chuyên ban thời gian thực qua WebSocket, gửi ảnh và tài liệu năng lực.'),
    createBullet('BR-APP-02.5: Chuyển tiếp tin nhắn, tìm kiếm lịch sử hội thoại và ghim tin nhắn thông báo quan trọng.'),

    createHeading2('5.3. Vé Sự Kiện Điện Tử & Điểm Danh Hội Trường (BR-APP-03)'),
    createBullet('BR-APP-03.1: Khám phá sự kiện, xem thông tin diễn giả VIP và khung thời gian chương trình.'),
    createBullet('BR-APP-03.2: Hội viên chính thức đăng ký vé VIP miễn phí 0 VNĐ (tự động nhận diện tư cách hội viên).'),
    createBullet('BR-APP-03.3: Mua thêm vé cho đối tác đi cùng kèm thanh toán phụ thu trực tiếp qua VietQR Napas.'),
    createBullet('BR-APP-03.4: Trực quan hóa và lựa chọn vị trí ghế ngồi Cinema Seating Map ngay trên điện thoại.'),
    createBullet('BR-APP-03.5: Ví vé điện tử ("Vé Sự Kiện Của Tôi") lưu Offline, hiển thị mã QR E-Ticket và mã Lucky Draw để check-in cửa.'),
    createBullet('BR-APP-03.6: Quét QR điểm danh tại bàn tiếp đón, tự động cộng điểm cống hiến vào hồ sơ hội viên.'),

    createHeading2('5.4. Sàn Thương Mại B2B & Cơ Hội Cung - Cầu (BR-APP-04)'),
    createBullet('BR-APP-04.1: Đăng bán sản phẩm, dịch vụ doanh nghiệp lên Sàn B2B kèm chính sách trợ giá độc quyền cho hội viên.'),
    createBullet('BR-APP-04.2: Khám phá chợ B2B tiêu chuẩn B2B, xem chi tiết sản phẩm qua ProductDetailModal và chat trực tiếp với người bán.'),
    createBullet('BR-APP-04.3: Đăng tin trao đổi cơ hội kinh doanh Cung - Cầu (Cần Mua / Cần Bán) lên bảng tin chung.'),
    createBullet('BR-APP-04.4: Bấm tiếp nhận cơ hội kinh doanh (Claim Opportunity), tự động tạo phòng trao đổi và ghi nhận doanh số giao thương.'),

    createHeading2('5.5. Biểu Quyết Đại Hội Trực Tuyến 1 Người 1 Phiếu (BR-APP-05)'),
    createBullet('BR-APP-05.1: Bỏ phiếu bầu cử Ban chấp hành và thông qua nghị quyết đại hội trực tuyến 1 người 1 phiếu.'),
    createBullet('BR-APP-05.2: Mã hóa một chiều phiếu bầu, đảm bảo tính bảo mật và ẩn danh của đại biểu.'),
    createBullet('BR-APP-05.3: Cập nhật kết quả biểu quyết (Live Chart) thời gian thực trên màn hình lớn của đại hội.')
  );

  // ==================== 6. QUY TẮC NGHIỆP VỤ BẮT BUỘC ====================
  const ruleHeaders = ['Mã Quy Tắc', 'Tên Quy Tắc Nghiệp Vụ', 'Mô Tả & Cơ Chế Kiểm Soát Bắt Buộc'];
  const ruleWidths = [1800, 2400, 5000];
  const ruleRows = [
    ['RULE-RBAC-01', 'Độc Quyền Duyệt Hội Viên', 'Thẩm quyền kiểm duyệt & phê duyệt kết nạp hội viên thuộc về Ban Thành Viên hoặc Ban Quản Trị. Ban Thư Ký và các ban khác bị chặn bằng Từ chối quyền hạn Forbidden.'],
    ['RULE-RBAC-02', 'Chuẩn Hóa 6 Chuyên Ban', 'Hệ thống chuẩn hóa đúng 6 chuyên ban: BQT, BTK, BTV, BTN, BTT, BXT tương ứng với 6 tài khoản chính thức.'],
    ['RULE-TERM-01', 'Cấm Từ "Niên Liễm"', 'Tuyệt đối không sử dụng từ "niên liễm" trong toàn bộ tài liệu và mã nguồn; bắt buộc thay bằng "hội phí" hoặc "hội phí thường niên".'],
    ['RULE-FIN-01', 'Sổ Quỹ 3 Cấp & VietQR', 'Mọi khoản chi quỹ phải qua 3 cấp duyệt (Lập -> Kiểm soát -> Duyệt chi). Mọi khoản thu chi gạch nợ tự động qua VietQR Napas 24/7.'],
    ['RULE-EVT-01', 'Cinema Seating Map', '100% đại biểu tham dự Gala có chỗ ngồi được định danh trên sơ đồ Cinema Seating Map và in trên mã vé QR E-Ticket.'],
    ['RULE-SEC-01', 'Soát Vé Chống Trùng', 'Mỗi mã vé QR chỉ được phép qua cổng an ninh 01 lần. Lần quét thứ hai bắt buộc kích hoạt cảnh báo đỏ gian lận trùng vé.'],
    ['RULE-VOT-01', 'Biểu Quyết 1 Người 1 Phiếu', 'Mỗi hội viên chính thức chỉ có 01 phiếu biểu quyết cho mỗi tờ trình, không thể sửa đổi sau khi đã xác nhận.'],
  ];

  docChildren.push(
    createHeading1('6. QUY TẮC NGHIỆP VỤ BẮT BUỘC (Strict Business Rules)'),
    createParagraph('Toàn bộ các quy tắc nghiệp vụ bất di bất dịch của tổ chức được số hóa và cài đặt trực tiếp vào tầng Business Logic của hệ thống:'),
    createTable(ruleHeaders, ruleRows, ruleWidths)
  );

  // ==================== 7. YÊU CẦU PHI CHỨC NĂNG ====================
  const nfrHeaders = ['Tiêu Chí', 'Yêu Cầu Kỹ Thuật Chi Tiết', 'Chỉ Số Đo Lường (SLA)'];
  const nfrWidths = [2200, 4800, 2200];
  const nfrRows = [
    ['Hiệu năng (Performance)', 'Phản hồi API trung bình dưới 150ms. Quét nhận diện mã QR soát vé camera dưới 0.2s. Chịu tải đồng thời tối thiểu 5,000 người dùng.', 'Response < 150ms\nScan QR < 200ms\nUsers > 5,000'],
    ['Bảo mật (Security)', 'Mã hóa HTTPS TLS 1.3 và WSS. Mật khẩu băm Bcrypt Salt 10 vòng. Khóa tài khoản sau 5 lần sai. Ghi nhật ký kiểm toán Audit Trail 100%.', 'TLS 1.3\nBcrypt Salt 10\nLock 5 fails\nAudit 100%'],
    ['Độ tin cậy (Reliability)', 'Tính sẵn sàng của hệ thống đạt 99.9%. Tự động sao lưu cơ sở dữ liệu hàng ngày lúc 03:00 AM. RTO < 2 giờ, RPO < 24 giờ.', 'Uptime > 99.9%\nDaily Backup\nRTO < 2h'],
    ['Tính khả dụng (Usability)', 'Giao diện phong cách Hoàng Gia Doanh Nhân (Navy & Amber Gold). Tương thích 100% kích thước màn hình điện thoại và máy tính.', 'Responsive 100%\nTiếng Việt chuẩn hóa\nLỗi giao diện: 0%'],
  ];

  docChildren.push(
    createHeading1('7. YÊU CẦU PHI CHỨC NĂNG & AN TOÀN BẢO MẬT (Non-Functional Requirements)'),
    createTable(nfrHeaders, nfrRows, nfrWidths)
  );

  // ==================== 8. KẾ HOẠCH BÀN GIAO & LỘ TRÌNH ====================
  docChildren.push(
    createHeading1('8. KẾ HOẠCH BÀN GIAO & LỘ TRÌNH TRIỂN KHAI (Implementation Roadmap)'),
    createBullet('Giai đoạn 1 (Tháng 09/2026): Khởi tạo hạ tầng, CSDL PostgreSQL, đồng bộ 6 chuyên ban và MinIO Object Storage. (Hoàn thành 100%)'),
    createBullet('Giai đoạn 2 (Tháng 09/2026): Triển khai xác thực JWT, bảo mật RBAC 5 vai trò và phân định thẩm quyền Ban Thành Viên duyệt hội viên. (Hoàn thành 100%)'),
    createBullet('Giai đoạn 3 (Tháng 09/2026): Xây dựng Cổng Quản trị Web CRM (Hội viên 360 độ, Sự kiện Event Wizard, Lịch họp Sapphire Hub, Sổ quỹ VietQR). (Hoàn thành 100%)'),
    createBullet('Giai đoạn 4 (Tháng 09/2026): Phát triển Mobile App Hiệp Hội (Thẻ VIP 3D NFC, Hẹn gặp 1-1, Chat realtime, Sàn B2B, Biểu quyết). (Hoàn thành 100%)'),
    createBullet('Giai đoạn 5 (Tháng 09/2026): Tích hợp dịch vụ Mailer SMTP gửi email tự động và Cổng thanh toán VietQR Napas 24/7. (Hoàn thành 100%)'),
    createBullet('Giai đoạn 6 (Tháng 10/2026): Kiểm thử E2E full luồng trên môi trường môi trường vận hành thực tế, khắc phục 100% lỗi dữ liệu. (Hoàn thành 100%)'),
    createBullet('Giai đoạn 7 (Tháng 10/2026): Biên soạn trọn bộ tài liệu Master: SRS 52 Use Cases, BRD Nghiệp vụ, HDSD 16 Chương, Test Cases 54 TCs, Báo cáo Tiến độ 42 WPs và Slide thuyết trình. (Hoàn thành 100%)'),
    createBullet('Giai đoạn 8 (Tháng 10/2026): Nghiệm thu kỹ thuật, bàn giao mã nguồn cục bộ và đào tạo chuyển giao vận hành cho Ban Điều Hành CLB CEO 1983. (Sẵn sàng bàn giao)'),
    new Paragraph({ spacing: { before: 300 } }),
    createParagraph('Tài liệu Yêu Cầu Nghiệp Vụ (BRD) Hệ Sinh Thái Số Hóa Hiệp Hội Doanh Nhân CEO 1983 - Bản quyền thuộc về CLB Doanh Nhân CEO 1983 & HanoiBA (2026).', { italics: true, color: '64748B' })
  );

  // Khởi tạo Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
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
                    text: 'BRD-CEO1983-ENTERPRISE-V1.0 · CLB Doanh Nhân CEO 1983 (HanoiBA)',
                    font: FONT_FAMILY,
                    size: 18,
                    color: '64748B',
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
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return buffer.length;
}

async function main() {
  console.log('=== BẮT ĐẦU XUẤT BẢN TÀI LIỆU BRD DOANH NGHIỆP CEO 1983 (MD & DOCX) ===');

  // 1. Tạo Markdown BRD
  const mdContent = generateBrdMarkdown();
  const mdPath = path.join(DOC_DIR, 'BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md');
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`✓ Đã lưu Markdown BRD: ${mdPath} (${(Buffer.byteLength(mdContent) / 1024).toFixed(1)} KB)`);

  // 2. Tạo Word DOCX BRD
  const docxPath = path.join(DOC_DIR, 'BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx');
  const docxSize = await buildBrdDocxFile(docxPath);
  console.log(`✓ Đã xuất bản file Word DOCX BRD thành công: ${docxPath} (${(docxSize / 1024).toFixed(1)} KB)`);

  // 3. Đồng bộ sang thư mục public docs của frontend
  const feDocxPath = path.join(FE_DOCS_DIR, 'BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx');
  const feMdPath = path.join(FE_DOCS_DIR, 'BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.md');
  fs.copyFileSync(docxPath, feDocxPath);
  fs.copyFileSync(mdPath, feMdPath);
  console.log(`✓ Đã đồng bộ sang: ${feDocxPath}`);

  console.log('=== HOÀN TẤT XUẤT BẢN TÀI LIỆU BRD (MD & DOCX) THÀNH CÔNG 100%! ===');
}

main().catch(err => {
  console.error('LỖI KHI XUẤT BẢN BRD:', err);
  process.exit(1);
});
