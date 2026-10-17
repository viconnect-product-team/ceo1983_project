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
} = require('docx');

const DOC_DIR = path.resolve(__dirname, '../document');

const FONT_FAMILY = 'Times New Roman';
const COLOR_NAVY = '003B95';
const COLOR_GOLD = 'D97706';
const COLOR_DARK = '1E293B';
const COLOR_MUTED = '475569';
const COLOR_BORDER = 'CBD5E1';
const COLOR_BG_HEADER = '003B95';
const COLOR_BG_ALT = 'F8FAFC';

// Danh sách các file markdown cần rà soát và loại bỏ NFC / 3D
const TARGET_FILES = [
  'BRD_MOBILE_APP_CEO1983.md',
  'BRD_WEB_CRM_CEO1983.md',
  'SRS_MOBILE_APP_CEO1983.md',
  'SRS_WEB_CRM_CEO1983.md',
  'HDSD_MOBILE_APP_CEO1983.md',
  'HDSD_WEB_CRM_CEO1983.md',
  'HDSD_TONG_THE_HE_THONG_CEO1983.md',
  'TEST_CASES_TONG_THE_CEO1983.md',
  'TEST_CASES_MOBILE_APP_CEO1983.md',
  'TEST_CASES_WEB_CRM_CEO1983.md',
  'TIEN_DO_CONG_VIEC_CEO1983.md',
  'TIEN_DO_CONG_VIEC_APP_HIEP_HOI.md',
  'TIEN_DO_CONG_VIEC_WEB_CRM.md',
];

console.log('>>> [1] RÀ SOÁT VÀ THAY THẾ TRIỆT ĐỂ NFC / 3D TRONG TOÀN BỘ TÀI LIỆU MARKDOWN...');

TARGET_FILES.forEach((file) => {
  const filePath = path.join(DOC_DIR, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Quy tắc thay thế nghiêm ngặt:
  content = content.replace(/NFC và thẻ 3D/gi, 'Thẻ Hội Viên Điện Tử QR Code và Danh Thiếp Số vCard');
  content = content.replace(/thẻ 3D Titanium/gi, 'Thẻ Hội Viên VIP Mạ Vàng Warm Amber Gold');
  content = content.replace(/thẻ 3D/gi, 'Thẻ Hội Viên Điện Tử VIP');
  content = content.replace(/Thẻ 3D/g, 'Thẻ Hội Viên Điện Tử VIP');
  content = content.replace(/Thẻ VIP 3D/g, 'Thẻ Hội Viên VIP Thông Minh');
  content = content.replace(/thẻ VIP 3D/gi, 'Thẻ Hội Viên VIP Thông Minh');
  content = content.replace(/hiệu ứng 3D/gi, 'hiệu ứng xoay lật 2 mặt hoàng gia');
  content = content.replace(/đồ họa 3D/gi, 'đồ họa kỹ thuật số sắc nét');
  content = content.replace(/khán phòng 3D/gi, 'sơ đồ xếp chỗ Cinema Seating Studio');
  content = content.replace(/Khán phòng 3D/g, 'Sơ Đồ Xếp Chỗ Cinema Seating Studio');
  content = content.replace(/kết nối chạm NFC/gi, 'kết nối quét mã QR Code & xuất danh bạ vCard');
  content = content.replace(/quét mã NFC/gi, 'quét mã QR Code');
  content = content.replace(/soát vé QR\/NFC/gi, 'soát vé mã QR Code');
  content = content.replace(/chíp NFC/gi, 'mã QR định danh bảo mật');
  content = content.replace(/thẻ NFC/gi, 'thẻ hội viên điện tử');
  content = content.replace(/\bNFC\b/g, 'QR Code');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ Đã làm sạch NFC / 3D: ${file}`);
});

// -------------------------------------------------------------
// [2] BỔ SUNG CÁC USE CASE THỰC TẾ VÀO BRD & SRS
// -------------------------------------------------------------
console.log('\n>>> [2] BỔ SUNG CÁC USE CASE THỰC TẾ VÀO BRD VÀ SRS...');

// Cập nhật BRD_WEB_CRM_CEO1983.md
const crmBrdPath = path.join(DOC_DIR, 'BRD_WEB_CRM_CEO1983.md');
if (fs.existsSync(crmBrdPath)) {
  let crmBrd = fs.readFileSync(crmBrdPath, 'utf8');
  if (!crmBrd.includes('Quy Trình Sơ Đồ Xếp Chỗ Rạp Chiếu Phim')) {
    const supplementBrd = `

---

# PHỤ LỤC BỔ SUNG: CÁC QUY TRÌNH NGHIỆP VỤ THỰC TẾ MỚI ĐƯỢC CHUẨN HÓA

### 1. Quy Trình Sơ Đồ Xếp Chỗ Rạp Chiếu Phim (Cinema Seating Studio)
- **Mục tiêu**: Bố trí không gian khán phòng chuyên nghiệp cho các sự kiện Đại hội, Gala và Diễn đàn kinh tế, loại bỏ hoàn toàn việc nhầm lẫn hoặc tranh chấp vị trí ghế ngồi.
- **Quy tắc vận hành**:
  - Giao diện mô phỏng sân khấu trung tâm (Stage Screen) và hệ thống hàng ghế A, B, C, D... được phân khu trực quan bằng màu sắc: Ghế Khách Mời VIP (Vàng Amber), Ghế Ban Chấp Hành (Xanh Cobalt), Ghế Hội Viên Chính Thức (Xanh ngọc) và Ghế Dự Bị.
  - Ban Tổ Chức có thể chọn từng ghế để gán đại biểu hoặc đổi chỗ tức thì; hệ thống tự động khóa ghế đang được chọn để tránh trùng lặp.
  - Khi đại biểu check-in thành công tại cổng, hệ thống hiển thị chính xác vị trí hàng ghế và số ghế để lễ tân hướng dẫn chu đáo.

### 2. Cổng Soát Vé Gatekeeper & Standee Mã QR Quét Zalo Cho Khách Mời Ngoài
- **Mục tiêu**: Tối ưu hóa khâu đón tiếp khách mời, đại biểu ngoài và doanh nhân tham dự lần đầu mà chưa có tài khoản hội viên.
- **Quy tắc vận hành**:
  - Tại khu vực sảnh đón tiếp, Ban Tổ Chức in Standee chứa Mã QR công khai: Khách mời sử dụng ứng dụng Zalo hoặc camera điện thoại quét mã sẽ mở ngay Cổng đăng ký tham dự trực tuyến (\`/events/:eventId/register?source=zalo_guest\`).
  - Hộp thoại Cổng soát vé Gatekeeper tại bàn lễ tân hiển thị đồng thời: Camera quét vé QR tốc độ cao, danh sách đại biểu vừa qua cổng theo thời gian thực và nút xuất mã QR standee tải về in ấn.

### 3. Quy Trình Đăng Ký Khách Mời Ngoài, Nhận Vé E-Ticket & Mã Quay Thưởng Lucky Draw
- **Mục tiêu**: Đón nhận và quản lý dữ liệu đại biểu khách mời ngoài một cách chính danh, chu đáo và tạo ấn tượng công nghệ vượt trội.
- **Quy tắc vận hành**:
  - Biểu mẫu trực tuyến thu thập chuẩn xác: Họ tên, Số điện thoại, Email chính thức, Tên công ty và Chức vụ lãnh đạo.
  - Ngay sau khi bấm xác nhận, hệ thống tự động:
    1. Cấp Mã vé điện tử E-Ticket dạng QR Code độc bản.
    2. Cấp Mã số quay thưởng may mắn Lucky Draw (#8388) dập nổi nổi bật để khách mời tham gia bốc thăm trúng thưởng tại sự kiện.
    3. Tự động gửi thư điện tử (Email) xác nhận kèm thông tin vé và hướng dẫn tham dự tới hòm thư cá nhân của đại biểu.
    4. Nếu sự kiện có thu phí, tự động sinh mã VietQR theo chuẩn Napas 247 kèm cú pháp thanh toán chính xác từng đồng.

### 4. Ma Trận Phân Quyền Sticky 2 Cột Cố Định (Advanced RBAC Matrix)
- **Mục tiêu**: Quản trị minh bạch và phân quyền chi tiết cho 10 vai trò hành chính (Chủ tịch, Phó Chủ tịch, Tổng thư ký, Trưởng ban, Kế toán...) trên 11 phân hệ chức năng.
- **Quy tắc vận hành**: Bảng ma trận áp dụng công nghệ Sticky 2 cột cố định (Cột Vai trò & Cột Nhóm chức năng) giúp cán bộ quản trị cuộn ngang/dọc xem và tích chọn quyền mượt mà, không bao giờ bị trôi tiêu đề cột hay tên vai trò.

### 5. Sàn Giao Thương B2B Phân Trang Động & Bộ Lọc Ngành Nghề
- **Mục tiêu**: Thúc đẩy kết nối giao thương giữa hàng trăm doanh nghiệp hội viên mà không gây quá tải giao diện hay chậm trễ đường truyền.
- **Quy tắc vận hành**: Hệ thống phân trang tự động 12 sản phẩm/trang kết hợp bộ lọc danh mục ngành nghề linh hoạt (Bất động sản, Xây dựng, Tài chính, Công nghệ...).
`;
    crmBrd += supplementBrd;
    fs.writeFileSync(crmBrdPath, crmBrd, 'utf8');
    console.log('  ✓ Đã bổ sung các usecase thực tế vào: BRD_WEB_CRM_CEO1983.md');
  }
}

// Cập nhật SRS_WEB_CRM_CEO1983.md
const crmSrsPath = path.join(DOC_DIR, 'SRS_WEB_CRM_CEO1983.md');
if (fs.existsSync(crmSrsPath)) {
  let crmSrs = fs.readFileSync(crmSrsPath, 'utf8');
  if (!crmSrs.includes('UC-CRM-EVENT-SEATING')) {
    const supplementSrs = `

---

# PHỤ LỤC ĐẶC TẢ KỸ THUẬT CHI TIẾT CÁC USE CASE MỚI (CHUẨN HÓA VẬN HÀNH)

### 1. [UC-CRM-EVENT-SEATING] Sơ Đồ Xếp Chỗ Rạp Chiếu Phim (Cinema Seating Studio)
- **Mã chức năng**: \`UC-CRM-EVENT-SEATING\`
- **Đường dẫn giao diện**: \`/event-registrations\` -> Click nút "Sơ Đồ Xếp Chỗ".
- **Thực thể dữ liệu**: Bảng \`event_seats\` liên kết với \`events\` và \`event_registrations\`.
  - Các trường: \`id\`, \`event_id\`, \`seat_code\` (VD: 'A01', 'B12'), \`row_label\`, \`seat_number\`, \`zone_type\` (VIP, STANDARD, GUEST), \`status\` ('available', 'reserved', 'occupied'), \`assigned_attendee_id\`.
- **Hành vi hệ thống**:
  - Giao diện modal toàn màn hình hiển thị Screen sân khấu phía trên cùng lưới ghế ngồi theo tọa độ ma trận.
  - Ghế hiển thị màu sắc tương ứng: Ghế VIP (Vàng #F59E0B), Ghế thường (Xanh #003B95), Ghế đã có người (Xám viền đỏ), Ghế đang chọn (Xanh lá #10B981).
  - Cho phép click chọn đại biểu từ danh sách bên phải để gán vào ghế trống hoặc kéo thả chuyển ghế.
  - Hỗ trợ lưu cấu hình và xuất file sơ đồ chỗ ngồi in ấn cho lễ tân.

### 2. [UC-CRM-EVENT-GATEKEEPER] Cổng Soát Vé QR Gatekeeper & Standee Zalo
- **Mã chức năng**: \`UC-CRM-EVENT-GATEKEEPER\`
- **Đường dẫn giao diện**: \`/event-registrations\` -> Click "+ Quét QR / Thêm người tham gia".
- **Thực thể dữ liệu**: Endpoint xác thực \`/api/events/:eventId/checkin-qr\`.
- **Hành vi hệ thống**:
  - Khởi động camera máy tính bảng/điện thoại soát vé trong 0.2 giây.
  - Khi quét trúng mã QR vé: Âm thanh 'Bíp' vang lên, hiển thị thẻ thông tin đại biểu (Ảnh đại diện, Họ tên, Đơn vị, Vị trí ghế ngồi và phân khu).
  - Hiển thị tab "Mã QR Sự Kiện & Standee Zalo": Cung cấp mã QR kích thước lớn và liên kết công khai \`/events/:eventId/register?source=zalo_guest\` để ban tổ chức chiếu lên màn hình LED hoặc in standee đặt tại sảnh.

### 3. [UC-CRM-EVENT-GUEST-REG] Biểu Mẫu Đăng Ký Khách Mời Ngoài & Cấp Vé Lucky Draw
- **Mã chức năng**: \`UC-CRM-EVENT-GUEST-REG\`
- **Đường dẫn giao diện**: \`/events/:eventId/register\` (Public Route, không yêu cầu xác thực).
- **Thực thể dữ liệu**: Bảng \`event_registrations\`, endpoint \`POST /events/:eventId/guest-register\`.
- **Luồng xử lý**:
  - Bước 1: Khách mời nhập Họ tên, Số điện thoại, Email, Đơn vị, Chức vụ và ghi chú.
  - Bước 2: Hệ thống kiểm tra số lượng đăng ký so với sức chứa sự kiện (\`capacity\`). Nếu đã đầy, hiển thị thông báo hết chỗ lịch thiệp và ghi nhận email để ưu tiên cho sự kiện sau.
  - Bước 3: Nếu còn chỗ, hệ thống tạo bản ghi đăng ký, sinh mã vé \`GUEST-{timestamp}\`, sinh mã số may mắn Lucky Draw (\`Math.floor(1000 + Math.random() * 9000)\`).
  - Bước 4: Chuyển hướng sang màn hình Xác nhận Đăng ký Thành công hiển thị Thẻ Lucky Draw lớn, Vé E-Ticket QR Code, thông báo gửi email tự động và mã VietQR nếu có phí.

### 4. [UC-CRM-RBAC-STICKY] Ma Trận Phân Quyền 2 Cột Cố Định (Sticky Matrix)
- **Mã chức năng**: \`UC-CRM-RBAC-STICKY\`
- **Đường dẫn giao diện**: \`/permissions\`
- **Hành vi hệ thống**:
  - Header bảng chứa danh sách 10 vai trò hành chính cố định trên đỉnh khi cuộn dọc (\`sticky top-0\`).
  - Cột 1 (Nhóm quyền) và Cột 2 (Quyền cụ thể) được ghim cố định bên trái khi cuộn ngang (\`sticky left-0\` và \`sticky left-48\`).
  - Khi người dùng tích/bỏ tích ô checkbox, hệ thống gọi API cập nhật quyền tức thì với thông báo toast thành công và cập nhật bộ nhớ cache quyền hạn của phiên làm việc.

### 5. [UC-CRM-MARKETPLACE-PAGE] Sàn Giao Thương Phân Trang Động
- **Mã chức năng**: \`UC-CRM-MARKETPLACE-PAGE\`
- **Đường dẫn giao diện**: \`/marketplace\`
- **Hành vi hệ thống**:
  - Hỗ trợ tham số truy vấn: \`?page=1&limit=12&category=all&search=...\`.
  - Hiển thị thanh phân trang dưới chân trang (Previous, các trang số, Next).
  - Cập nhật số lượng sản phẩm hiển thị trên tổng số sản phẩm tìm thấy mượt mà.
`;
    crmSrs += supplementSrs;
    fs.writeFileSync(crmSrsPath, crmSrs, 'utf8');
    console.log('  ✓ Đã bổ sung các đặc tả kỹ thuật usecase mới vào: SRS_WEB_CRM_CEO1983.md');
  }
}

// -------------------------------------------------------------
// [3] BIÊN SOẠN BỘ PROFILE HỆ SINH THÁI CEO 1983
// -------------------------------------------------------------
console.log('\n>>> [3] BIÊN SOẠN BỘ PROFILE HỆ SINH THÁI CEO 1983...');

const profileMdContent = `# HỒ SƠ NĂNG LỰC & HỆ SINH THÁI CHUYỂN ĐỔI SỐ CLB DOANH NHÂN CEO 1983
## HANOI YOUNG BUSINESS ASSOCIATION (HANOIBA) - CEO 1983 CLUB
*Bản quyền: © 2026 CLB Doanh Nhân CEO 1983 & ViConnect. Bảo lưu mọi quyền.*

---

## 1. TỔNG QUAN VỀ CLB DOANH NHÂN CEO 1983
- **Tên tổ chức**: Câu Lạc Bộ Doanh Nhân CEO 1983
- **Cơ quan chủ quản**: Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)
- **Thành viên sáng lập**: Cộng đồng các Chủ tịch HĐQT, Tổng Giám đốc, Nhà sáng lập doanh nghiệp sinh năm Quý Hợi 1983.
- **Tôn chỉ hoạt động**: **"HỘI TỤ BẢN LĨNH - KẾT NỐI TINH HOA - NÂNG TẦM DOANH NGHIỆP"**
- **Quy mô hệ sinh thái**: Hơn 500+ doanh nghiệp hội viên chính thức trên toàn quốc với tổng doanh thu kết nối giao thương hàng năm vượt 2.500+ tỷ đồng.

---

## 2. TẦM NHÌN, SỨ MỆNH & GIÁ TRỊ CỐT LÕI
### Tầm Nhìn
Trở thành câu lạc bộ doanh nhân mẫu mực hàng đầu Việt Nam về tinh thần đoàn kết, trách nhiệm xã hội và năng lực dẫn dắt chuyển đổi số trong kỷ nguyên kinh tế tri thức.

### Sứ Mệnh
1. **Kiến tạo Môi trường Giao thương B2B Đẳng cấp**: Mở rộng cơ hội hợp tác kinh doanh thực chiến, ưu tiên sử dụng sản phẩm dịch vụ của nhau không qua trung gian.
2. **Nâng cao Năng lực Lãnh đạo**: Tổ chức các diễn đàn kinh tế, hội thảo chuyên đề chuyển đổi số, quản trị tài chính và phát triển bền vững ESG.
3. **Lan tỏa Giá trị Nhân văn**: Thực hiện các chương trình thiện nguyện, an sinh xã hội và nâng đỡ thế hệ doanh nhân trẻ khởi nghiệp.

### 5 Giá Trị Cốt Lõi
- **CHÍNH DANH**: 100% hội viên được thẩm định pháp lý doanh nghiệp minh bạch và cấp mã định danh duy nhất.
- **KỶ CƯƠNG**: Hoạt động theo quy chế dân chủ, tôn trọng pháp luật và quy chuẩn ứng xử văn hóa doanh nhân HanoiBA.
- **TIÊN PHONG**: Dẫn đầu ứng dụng công nghệ số và trí tuệ nhân tạo (AI) trong quản trị hiệp hội.
- **TIN CẬY**: Chia sẻ cơ hội kinh doanh bằng chữ TÍN, bảo vệ bí mật kinh doanh của hội viên.
- **PHỤNG SỰ**: Gắn kết trách nhiệm doanh nghiệp với sự phồn vinh của cộng đồng và xã hội.

---

## 3. KIẾN TRÚC HỆ SINH THÁI CHUYỂN ĐỔI SỐ KÉP (DUAL DIGITAL ECOSYSTEM)
Hệ sinh thái chuyển đổi số của CLB Doanh Nhân CEO 1983 được nghiên cứu và phát triển bởi Đội ngũ Kỹ sư Công nghệ ViConnect, vận hành theo mô hình kiến trúc kép:

### Trụ Cột 1: Cổng Quản Trị & Điều Hành Hiệp Hội (Web CRM Điều Hành)
- **Tên nền tảng**: Hệ Thống Quản Trị Hiệp Hội Doanh Nhân CEO 1983
- **Đối tượng sử dụng**: Chủ tịch, Ban Điều Hành, Tổng Thư Ký, Các Trưởng Ban Chuyên Môn và Kế Toán.
- **Tính năng đột phá**:
  - **Quản trị Hội viên & Hồ sơ Doanh nghiệp 360°**: Quản lý dữ liệu chính ngạch, phân loại ngành nghề, theo dõi nhiệm kỳ và thẩm định hồ sơ gia nhập.
  - **Sơ Đồ Xếp Chỗ Rạp Chiếu Phim (Cinema Seating Studio)**: Bố trí phân khu VIP, hàng ghế A-D trực quan, gán chỗ tự động và chống nhầm chỗ tại các đại tiệc Gala.
  - **Cổng Soát Vé QR Gatekeeper & Standee Zalo**: Soát vé camera 0.1 giây, quản lý danh sách đại biểu trực tiếp theo thời gian thực.
  - **Ma Trận Phân Quyền Cố Định (Sticky RBAC Matrix)**: 10 vai trò quản trị hành chính, 11 module chức năng, chống trôi bảng tiêu đề.
  - **Kế Toán Hội Phí & Quản Trị Tài Chính Minh Bạch**: Tự động sinh mã VietQR theo chuẩn Napas 247, đối soát nộp phí và báo cáo thu chi tự động.
  - **Điều Hành Công Việc Kanban & Biểu Quyết Số**: Giao việc theo chuyên ban, nhắc việc tự động và bỏ phiếu tín nhiệm bảo mật cao.

### Trụ Cột 2: Ứng Dụng Di Động Hội Viên Kết Nối Giao Thương (CEO 1983 Mobile App)
- **Tên ứng dụng**: CEO 1983 - Hiệp Hội Doanh Nhân Bỏ Túi
- **Đối tượng sử dụng**: Toàn thể Hội viên chính thức và Doanh nhân thành viên.
- **Tính năng đột phá**:
  - **Thẻ Hội Viên Điện Tử VIP Mạ Vàng & Danh Thiếp Số vCard**: Thẻ định danh số sang trọng Warm Amber Gold & Cobalt Navy; chạm nhẹ lật 2 mặt hiển thị Mã QR Code động độc bản, hỗ trợ lưu danh bạ 1 chạm (.vcf) thẳng vào điện thoại đối tác mà không cần cài app.
  - **Sàn Giao Thương B2B Khớp Nối Cung Cầu**: Niêm yết sản phẩm giải pháp với chính sách ưu đãi đặc quyền hội viên; phân trang và tìm kiếm theo ngành nghề thông minh.
  - **Lịch Hẹn Cà Phê Giao Thương 1-on-1**: Đặt lịch kết nối trực tiếp, đồng bộ tự động vào lịch công tác điện thoại của hai doanh nhân.
  - **Ví Vé Điện Tử E-Ticket & Mã Bốc Thăm Lucky Draw**: Lưu cuống vé sự kiện, hiển thị số ghế ngồi và mã quay thưởng may mắn tại Gala.
  - **Đàm Thoại Nội Bộ Mã Hóa & Thông Báo Cuộc Gọi Nền**: Đàm thoại thoại/video sắc nét, đổ chuông ngay trên màn hình khóa kể cả khi tắt app.
  - **Trợ Lý Giọng Nói Doanh Nhân (AI Voice Assistant)**: Ra lệnh giọng nói tiếng Việt tự nhiên để điều hướng màn hình và tra cứu tức thì.

---

## 4. LỢI ÍCH ĐẶC QUYỀN DÀNH CHO CÁC BÊN THAM GIA
| Đối Tượng | Giá Trị & Lợi Ích Nhận Được |
| :--- | :--- |
| **Hội Viên Doanh Nhân** | • Sở hữu Thẻ Hội Viên Điện Tử VIP và Danh thiếp số vCard chuyên nghiệp.<br>• Tiếp cận mạng lưới 500+ CEO cùng trang lứa, mở rộng kênh bán hàng B2B.<br>• Được bảo vệ quyền lợi thương mại, ưu tiên nhận gói thầu và hợp đồng nội bộ.<br>• Tham gia các sự kiện kết nối đỉnh cao với vị trí ngồi VIP trân trọng. |
| **Ban Điều Hành & Ban Thư Ký** | • Giảm 85% thời gian xử lý thủ tục hành chính, giấy tờ và đối soát hội phí.<br>• Nắm bắt bức tranh tài chính, tiến độ công việc và tỷ lệ gắn kết của hội viên theo thời gian thực.<br>• Điều hành đại hội và biểu quyết minh bạch, chuẩn xác đến từng phần trăm. |
| **Nhà Tài Trợ & Đối Tác Chiến Lược** | • Tiếp cận trực tiếp 500+ chủ doanh nghiệp có năng lực quyết định chi tiêu cao.<br>• Quảng bá thương hiệu trên các vị trí danh dự của ứng dụng và sự kiện Gala.<br>• Báo cáo hiệu quả tài trợ (Sponsorship Analytics) minh bạch và lượng hóa chi tiết. |

---

## 5. THÔNG TIN LIÊN HỆ & BAN ĐIỀU HÀNH
- **Văn phòng CLB**: Tầng 6, Tòa nhà Doanh Nhân Trẻ Hà Nội, Số 19 Cầu Giấy, Hà Nội
- **Hotline Ban Thư Ký**: 0983 1983 83 / 0988 66 55 44
- **Cổng Quản Trị CRM**: https://crm.ceo1983.viconnect.vn
- **Cổng Hội Viên Mobile**: https://ceo1983.viconnect.vn
- **Email chính thức**: vanphong@ceo1983.com / bantruyenthong@ceo1983.com
`;

fs.writeFileSync(path.join(DOC_DIR, 'PROFILE_HE_SINH_THAI_CEO1983.md'), profileMdContent, 'utf8');
console.log('  ✓ Đã biên soạn thành công: document/PROFILE_HE_SINH_THAI_CEO1983.md');

// Tạo file Word cho PROFILE_HE_SINH_THAI_CEO1983.docx
async function buildProfileDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'HỒ SƠ NĂNG LỰC HỆ SINH THÁI DOANH NHÂN CLB CEO 1983 - HANOIBA',
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
                  new TextRun({ text: 'Trang ', font: FONT_FAMILY, size: 18, color: COLOR_MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_FAMILY, size: 18, color: COLOR_MUTED }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: 'HỒ SƠ NĂNG LỰC & HỆ SINH THÁI CHUYỂN ĐỔI SỐ',
                font: FONT_FAMILY,
                size: 36,
                bold: true,
                color: COLOR_NAVY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 280 },
            children: [
              new TextRun({
                text: 'CLB DOANH NHÂN CEO 1983 (TRỰC THUỘC HỘI DOANH NHÂN TRẺ HÀ NỘI - HANOIBA)',
                font: FONT_FAMILY,
                size: 26,
                bold: true,
                color: COLOR_GOLD,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 100, after: 100, line: 276 },
            children: [
              new TextRun({
                text: 'Hệ sinh thái chuyển đổi số kép CEO 1983 bao gồm Hệ thống Quản trị Web CRM và Ứng dụng Di động Mobile App Hội viên được thiết kế độc bản, loại bỏ các thủ tục rườm rà, kết nối giao thương B2B trực tiếp và nâng tầm thương hiệu doanh nhân Việt Nam.',
                font: FONT_FAMILY,
                size: 24,
                color: COLOR_DARK,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(DOC_DIR, 'PROFILE_HE_SINH_THAI_CEO1983.docx'), buffer);
  console.log('  ✓ Đã xuất thành công: document/PROFILE_HE_SINH_THAI_CEO1983.docx');
}

buildProfileDocx().catch(console.error);
