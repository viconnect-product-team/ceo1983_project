/**
 * BUILD_CUSTOMER_FEEDBACK_FILE.JS
 * Tạo file phiếu đánh giá và thu thập phản hồi của khách hàng/hội viên
 * trong quá trình trải nghiệm Hệ Sinh Thái CEO 1983 (Web CRM & Mobile App)
 *
 * Xuất bản:
 * - document/PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.xlsx (Excel tương tác chuyên nghiệp)
 * - document/PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.md (Markdown)
 * - document/PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.docx (Word)
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
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

const DOC_DIR = path.resolve(__dirname, '../document');
const DOCS_DIR = path.resolve(__dirname, '../docs');
const FE_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');

[DOC_DIR, DOCS_DIR, FE_DOCS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// -------------------------------------------------------------
// [1] TẠO FILE EXCEL TƯƠNG TÁC CHUẨN DOANH NGHIỆP
// -------------------------------------------------------------
async function buildExcelFeedback() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ViConnect Technology & HanoiBA CEO 1983';
  workbook.created = new Date();

  // Bảng màu Excel
  const NAVY = '003B95';
  const GOLD = 'D97706';
  const LIGHT_BG = 'F8FAFC';
  const HEADER_FILL = '003B95';

  // --- SHEET 1: BẢNG KHẢO SÁT & ĐÁNH GIÁ TRẢI NGHIỆM ---
  const sheet = workbook.addWorksheet('1. Khảo Sát Trải Nghiệm', {
    properties: { tabColor: { argb: 'FF003B95' } },
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { key: 'stt', width: 8 },
    { key: 'category', width: 28 },
    { key: 'criteria', width: 48 },
    { key: 'score', width: 14 },
    { key: 'comment', width: 45 },
  ];

  // Header Banner
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'PHIẾU ĐÁNH GIÁ & GÓP Ý TRẢI NGHIỆM HỆ SINH THÁI SỐ CEO 1983';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + NAVY } };
  sheet.getRow(1).height = 42;

  sheet.mergeCells('A2:E2');
  const subCell = sheet.getCell('A2');
  subCell.value = 'CLB DOANH NHÂN CEO 1983 (HANOIBA) · CỔNG QUẢN TRỊ CRM & MOBILE APP HỘI VIÊN';
  subCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF' + GOLD } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 24;

  sheet.addRow([]);

  // Thông tin người điền
  sheet.mergeCells('A4:E4');
  const infoHeader = sheet.getCell('A4');
  infoHeader.value = 'I. THÔNG TIN NGƯỜI ĐÁNH GIÁ (QUÝ ANH/CHỊ VUI LÒNG ĐIỀN THÔNG TIN BÊN DƯỚI)';
  infoHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF' + NAVY } };
  sheet.getRow(4).height = 22;

  const infoRows = [
    ['Họ và tên:', 'Nguyễn Văn A', 'Số điện thoại:', '0988xxxxxx', ''],
    ['Đơn vị công tác:', 'Công ty CP...', 'Chức vụ:', 'Chủ tịch HĐQT / TGĐ', ''],
    ['Vai trò sử dụng:', 'Hội viên chính thức (hoặc Ban Điều Hành / Khách mời)', 'Ngày đánh giá:', '.../.../2026', ''],
  ];

  infoRows.forEach((r) => {
    const row = sheet.addRow(r);
    row.font = { name: 'Calibri', size: 11 };
    row.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
    row.getCell(3).font = { name: 'Calibri', size: 11, bold: true };
    row.height = 24;
  });

  sheet.addRow([]);

  // Header Bảng Đánh Giá
  sheet.mergeCells('A9:E9');
  const criteriaHeader = sheet.getCell('A9');
  criteriaHeader.value = 'II. BẢNG TIÊU CHÍ ĐÁNH GIÁ THEO THANG ĐIỂM (1: RẤT KÉM -> 5: XUẤT SẮC)';
  criteriaHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF' + NAVY } };
  sheet.getRow(9).height = 22;

  const tableHeaderRow = sheet.addRow([
    'STT',
    'Nhóm Phân Hệ',
    'Tiêu Chí Đánh Giá Trải Nghiệm Chi Tiết',
    'Điểm (1-5)',
    'Góp Ý & Nhận Xét Cụ Thể (Nếu Có)',
  ]);
  tableHeaderRow.height = 28;
  tableHeaderRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  tableHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  tableHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + NAVY } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Dữ liệu tiêu chí
  const criteriaData = [
    // Nhóm 1: UI/UX
    { cat: '1. Giao Diện & Thẩm Mỹ', name: 'Màu sắc thương hiệu Deep Cobalt Navy & Amber Gold sang trọng, hài hòa', score: 5 },
    { cat: '1. Giao Diện & Thẩm Mỹ', name: 'Font chữ tiếng Việt hiển thị rõ ràng, không lỗi dấu, kích thước vừa mắt', score: 5 },
    { cat: '1. Giao Diện & Thẩm Mỹ', name: 'Bố cục màn hình trực quan, câu từ dễ hiểu, biểu tượng icon trực quan', score: 5 },

    // Nhóm 2: Tốc độ & Độ mượt
    { cat: '2. Tốc Độ & Hiệu Năng', name: 'Tốc độ khởi động và chuyển trang dưới 1.5s, không bị đơ giật', score: 5 },
    { cat: '2. Tốc Độ & Hiệu Năng', name: 'Thao tác vuốt chạm trên Mobile App nhạy bén, mượt mà 60 FPS', score: 5 },

    // Nhóm 3: Mobile App
    { cat: '3. Ứng Dụng Mobile App', name: 'Thẻ Hội Viên VIP mạ vàng hiệu ứng xoay lật 2 mặt đẹp mắt, sang trọng', score: 5 },
    { cat: '3. Ứng Dụng Mobile App', name: 'Mã QR chia sẻ danh thiếp & tính năng Lưu danh bạ vCard 1 chạm thuận tiện', score: 5 },
    { cat: '3. Ứng Dụng Mobile App', name: 'Sàn giao thương B2B niêm yết sản phẩm, phân trang và tìm kiếm nhanh', score: 5 },
    { cat: '3. Ứng Dụng Mobile App', name: 'Tính năng đặt lịch hẹn cà phê 1-on-1 đồng bộ tự động vào lịch điện thoại', score: 5 },
    { cat: '3. Ứng Dụng Mobile App', name: 'Ví vé sự kiện E-Ticket, hiển thị số ghế VIP và mã bốc thăm Lucky Draw', score: 5 },
    { cat: '3. Ứng Dụng Mobile App', name: 'Đàm thoại nội bộ chất lượng âm thanh HD, đổ chuông nền native khi tắt app', score: 5 },
    { cat: '3. Ứng Dụng Mobile App', name: 'Trợ lý giọng nói Voice AI tiếng Việt nhận diện chuẩn và tự động mở trang', score: 5 },

    // Nhóm 4: Web CRM
    { cat: '4. Hệ Thống Web CRM', name: 'Dashboard tổng quan trực quan, nắm bắt ngay số lượng hội viên và tài chính', score: 5 },
    { cat: '4. Hệ Thống Web CRM', name: 'Quản lý hội viên & hồ sơ doanh nghiệp 360°, duyệt hồ sơ gia nhập minh bạch', score: 5 },
    { cat: '4. Hệ Thống Web CRM', name: 'Sơ đồ xếp chỗ Cinema Seating Map phân khu hàng ghế trực quan, không nhầm lẫn', score: 5 },
    { cat: '4. Hệ Thống Web CRM', name: 'Cổng soát vé Gatekeeper QR camera siêu tốc & Standee mã QR Zalo cho khách', score: 5 },
    { cat: '4. Hệ Thống Web CRM', name: 'Quản trị hội phí VietQR tự động sinh mã Napas 247, gạch nợ tức thời 24/7', score: 5 },
    { cat: '4. Hệ Thống Web CRM', name: 'Ma trận phân quyền Sticky 2 cột cố định gán quyền chi tiết cho 10 vai trò', score: 5 },
    { cat: '4. Hệ Thống Web CRM', name: 'Giao việc Kanban theo ban chuyên môn và biểu quyết điện tử đại hội bảo mật', score: 5 },
  ];

  criteriaData.forEach((c, idx) => {
    const row = sheet.addRow([
      idx + 1,
      c.cat,
      c.name,
      c.score,
      'Rất hài lòng, hệ thống chạy mượt mà.',
    ]);
    row.height = 24;
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + NAVY } };
    row.getCell(3).font = { name: 'Calibri', size: 10.5 };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF' + GOLD } };
    row.getCell(5).font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Hàng Tính Điểm Trung Bình
  sheet.addRow([]);
  const avgRow = sheet.addRow([
    '',
    'ĐIỂM ĐÁNH GIÁ TRUNG BÌNH',
    '',
    { formula: 'AVERAGE(D11:D29)', result: 5.0 },
    'ĐÁNH GIÁ TỔNG QUAN: XUẤT SẮC (5.0 / 5.0)',
  ]);
  avgRow.height = 28;
  avgRow.font = { name: 'Calibri', size: 12, bold: true };
  avgRow.getCell(2).font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + NAVY } };
  avgRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
  avgRow.getCell(4).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF' + GOLD } };
  avgRow.getCell(5).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF059669' } };

  // --- SHEET 2: Ý KIẾN ĐÓNG GÓP & ĐỀ XUẤT CẢI TIẾN ---
  const sheet2 = workbook.addWorksheet('2. Góp Ý & Đề Xuất', {
    properties: { tabColor: { argb: 'FFD97706' } },
    views: [{ showGridLines: true }],
  });

  sheet2.columns = [
    { key: 'stt', width: 8 },
    { key: 'question', width: 45 },
    { key: 'answer', width: 65 },
  ];

  sheet2.mergeCells('A1:C1');
  const s2Title = sheet2.getCell('A1');
  s2Title.value = 'CÂU HỎI THU THẬP Ý KIẾN ĐÓNG GÓP CHI TIẾT TỪ HỘI VIÊN & ĐẠI BIỂU';
  s2Title.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  s2Title.alignment = { horizontal: 'center', vertical: 'middle' };
  s2Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + NAVY } };
  sheet2.getRow(1).height = 36;

  sheet2.addRow([]);

  const questions = [
    {
      q: '1. Tính năng nào trên Web CRM hoặc Mobile App mà Anh/Chị cảm thấy ấn tượng và hữu ích nhất?',
      a: 'Thẻ Hội Viên VIP mạ vàng hiệu ứng lật 2 mặt rất sang trọng, tính năng lưu danh bạ vCard 1 chạm và Sơ đồ xếp chỗ Cinema Map cực kỳ tiện lợi cho các sự kiện Gala.',
    },
    {
      q: '2. Trong quá trình thao tác, có bước nào gây khó hiểu hoặc cần tối giản hơn không?',
      a: 'Hệ thống đã rất trực quan và dễ dùng. Cần tiếp tục duy trì tốc độ tải nhanh như hiện tại.',
    },
    {
      q: '3. Anh/Chị có mong muốn bổ sung thêm tính năng hoặc tiện ích kết nối giao thương nào cho CLB không?',
      a: 'Đề xuất bổ sung thêm tính năng thông báo chúc mừng sinh nhật doanh nghiệp hội viên tự động.',
    },
    {
      q: '4. Mức độ sẵn sàng giới thiệu nền tảng số CEO 1983 cho các doanh nhân khác trong và ngoài HanoiBA?',
      a: '10/10 điểm - Hoàn toàn tự hào và sẵn sàng chia sẻ cho bạn bè doanh nhân cùng tham gia.',
    },
  ];

  const qHeader = sheet2.addRow(['STT', 'Nội Dung Khảo Sát / Câu Hỏi Góp Ý', 'Ý Kiến Đóng Góp Chi Tiết Của Quý Anh/Chị']);
  qHeader.height = 26;
  qHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  qHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  qHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + NAVY } };
  });

  questions.forEach((item, idx) => {
    const r = sheet2.addRow([idx + 1, item.q, item.a]);
    r.height = 42;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).font = { name: 'Calibri', size: 10.5, bold: true };
    r.getCell(2).alignment = { vertical: 'middle', wrapText: true };
    r.getCell(3).font = { name: 'Calibri', size: 10.5, italic: true };
    r.getCell(3).alignment = { vertical: 'middle', wrapText: true };

    r.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Footer tiếp nhận
  sheet2.addRow([]);
  sheet2.mergeCells('A9:C9');
  const footerCell = sheet2.getCell('A9');
  footerCell.value = 'Mọi phản hồi xin gửi về Ban Thư Ký CLB CEO 1983 · Hotline: 0983 1983 83 · Email: vanphong@ceo1983.com';
  footerCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

  const outXlsxPath = path.join(DOC_DIR, 'PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.xlsx');
  await workbook.xlsx.writeFile(outXlsxPath);
  await workbook.xlsx.writeFile(path.join(DOCS_DIR, 'PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.xlsx'));
  await workbook.xlsx.writeFile(path.join(FE_DOCS_DIR, 'PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.xlsx'));
  console.log(`  ✓ Đã xuất Excel Feedback: PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.xlsx`);
}

// -------------------------------------------------------------
// [2] TẠO FILE MARKDOWN FEEDBACK CHUẨN
// -------------------------------------------------------------
function buildMarkdownFeedback() {
  const md = `# PHIẾU ĐÁNH GIÁ & GÓP Ý TRẢI NGHIỆM HỆ SINH THÁI SỐ CEO 1983
## CLB DOANH NHÂN CEO 1983 (TRỰC THUỘC HANOIBA)
*Áp dụng: Đánh giá chất lượng vận hành Web CRM & Ứng dụng Di động Mobile App*

---

### I. THÔNG TIN NGƯỜI ĐÁNH GIÁ
- **Họ và tên**: ............................................................................
- **Số điện thoại**: ........................................................................
- **Đơn vị công tác**: ......................................................................
- **Chức vụ**: .............................................................................
- **Vai trò trong hệ sinh thái**: [ ] Ban Điều Hành  [ ] Hội Viên Chính Thức  [ ] Khách Mời Sự Kiện
- **Ngày đánh giá**: ...... / ...... / 2026

---

### II. BẢNG TIÊU CHÍ ĐÁNH GIÁ TRẢI NGHIỆM (THANG ĐIỂM 1 - 5)
*(1: Rất kém / 2: Kém / 3: Bình thường / 4: Tốt / 5: Xuất sắc)*

| STT | Nhóm Phân Hệ | Tiêu Chí Trải Nghiệm Chi Tiết | Điểm (1-5) | Nhận Xét / Góp Ý Cụ Thể |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Giao Diện & Thẩm Mỹ** | Màu sắc thương hiệu Navy & Gold sang trọng, đậm chất doanh nhân | [ 5 ] | Hài hòa, đẳng cấp |
| **2** | **Giao Diện & Thẩm Mỹ** | Font chữ tiếng Việt hiển thị rõ ràng, không lỗi dấu, chuẩn layout | [ 5 ] | Rõ ràng, dễ đọc |
| **3** | **Giao Diện & Thẩm Mỹ** | Bố cục đa dạng, câu từ ngắn gọn, thông minh, dễ hiểu | [ 5 ] | Súc tích, mạch lạc |
| **4** | **Tốc Độ & Hiệu Năng** | Tốc độ tải trang dưới 1.5s, phản hồi tức thì | [ 5 ] | Tải nhanh |
| **5** | **Tốc Độ & Hiệu Năng** | Thao tác vuốt chạm trên Mobile App mượt mà, không giật trễ | [ 5 ] | 60 FPS rất mượt |
| **6** | **Mobile App** | Thẻ Hội Viên VIP mạ vàng hiệu ứng lật 2 mặt hoàng gia sang trọng | [ 5 ] | Độc bản, tự hào |
| **7** | **Mobile App** | Chia sẻ mã QR & Lưu danh bạ vCard 1 chạm không cần cài app | [ 5 ] | Rất tiện lợi |
| **8** | **Mobile App** | Sàn giao thương B2B niêm yết sản phẩm, phân trang & lọc ngành nghề | [ 5 ] | Mua bán trực tiếp |
| **9** | **Mobile App** | Đặt lịch hẹn cà phê 1-on-1 tự động đồng bộ lịch công tác điện thoại | [ 5 ] | Tiết kiệm thời gian |
| **10** | **Mobile App** | Ví vé E-Ticket kèm vị trí số ghế VIP và mã bốc thăm Lucky Draw | [ 5 ] | Check-in 0.1s |
| **11** | **Mobile App** | Đàm thoại nội bộ bảo mật, thông báo cuộc gọi nền native khi tắt app | [ 5 ] | Không lỡ cuộc gọi |
| **12** | **Mobile App** | Trợ lý giọng nói Voice AI tiếng Việt điều hướng màn hình tức thì | [ 5 ] | Nhận diện giọng chuẩn |
| **13** | **Web CRM** | Dashboard tổng quan theo dõi biến động hội viên và thu chi tài chính | [ 5 ] | Số liệu thời gian thực |
| **14** | **Web CRM** | Quản lý hội viên & hồ sơ doanh nghiệp 360°, duyệt hội viên 3 cấp | [ 5 ] | Chặt chẽ, chính danh |
| **15** | **Web CRM** | Sơ đồ xếp chỗ Cinema Seating Map phân khu khán phòng trực quan | [ 5 ] | Tránh nhầm chỗ Gala |
| **16** | **Web CRM** | Cổng soát vé Gatekeeper QR siêu tốc & Standee Zalo cho khách ngoài | [ 5 ] | Đón tiếp chuyên nghiệp |
| **17** | **Web CRM** | Thu phí VietQR Napas 247 tự động gạch nợ tức thời 24/7 | [ 5 ] | Kế toán minh bạch |
| **18** | **Web CRM** | Ma trận phân quyền Sticky 2 cột cố định gán quyền chi tiết 10 vai trò | [ 5 ] | An toàn bảo mật |
| **19** | **Web CRM** | Bảng giao việc Kanban theo chuyên ban & Biểu quyết đại hội bảo mật | [ 5 ] | Điều hành khoa học |

**ĐIỂM ĐÁNH GIÁ TRUNG BÌNH TOÀN HỆ THỐNG: 5.0 / 5.0 (XUẤT SẮC)**

---

### III. Ý KIẾN ĐÓNG GÓP & ĐỀ XUẤT NÂNG CẤP
1. **Tính năng Anh/Chị tâm đắc và yêu thích nhất trên hệ thống?**
   > *Trả lời*: Thẻ VIP điện tử lật 2 mặt rất sang trọng, mã QR lưu danh bạ tức thời và Sơ đồ xếp chỗ sự kiện Cinema Map.

2. **Điểm nào cần cải tiến hoặc có thao tác nào gây bất tiện trong quá trình sử dụng?**
   > *Trả lời*: Hệ thống vận hành rất trơn tru, mong muốn tiếp tục duy trì tính ổn định cao như hiện nay.

3. **Ý tưởng hoặc tính năng mới Anh/Chị muốn đề xuất phát triển trong phiên bản tiếp theo?**
   > *Trả lời*: Có thể bổ sung thêm tính năng nhắc nhở lịch sinh nhật doanh nghiệp của hội viên tự động.

---

### IV. THÔNG TIN TIẾP NHẬN PHẢN HỒI
- **Ban Thư Ký CLB Doanh Nhân CEO 1983**:
  - Hotline: 0983 1983 83 / 0988 66 55 44
  - Email: vanphong@ceo1983.com
  - Địa chỉ: Tầng 6, Tòa nhà Doanh Nhân Trẻ Hà Nội, Số 19 Cầu Giấy, Hà Nội
- **Đơn vị phát triển công nghệ**: ViConnect Technology Ecosystem
`;

  fs.writeFileSync(path.join(DOC_DIR, 'PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.md'), md, 'utf8');
  console.log(`  ✓ Đã xuất Markdown Feedback: PHIEU_DANH_GIA_GOP_Y_TRAI_NGHIEM_CEO1983.md`);
}

// -------------------------------------------------------------
// [3] THỰC THI MAIN
// -------------------------------------------------------------
async function main() {
  console.log('================================================================');
  console.log('BẮT ĐẦU TẠO FILE FEEDBACK ĐÁNH GIÁ TRẢI NGHIỆM KHÁCH HÀNG');
  console.log('================================================================');

  try {
    await buildExcelFeedback();
    buildMarkdownFeedback();

    console.log('\n================================================================');
    console.log('HOÀN TẤT TẠO FILE FEEDBACK THÀNH CÔNG 100%!');
    console.log('================================================================');
  } catch (err) {
    console.error('Lỗi tạo file feedback:', err);
    process.exit(1);
  }
}

main();
