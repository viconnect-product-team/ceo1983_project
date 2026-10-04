const fs = require('fs');
const path = require('path');

// ============================================================================
// BUILDER SCRIPT: MASTER SRS IEEE 830 & HDSD TRAINING HTML/PDF CEO 1983
// ============================================================================

console.log('>>> Bắt đầu tạo tài liệu SRS IEEE 830 & Hướng Dẫn Sử Dụng Chuẩn Hóa...');

// ----------------------------------------------------------------------------
// 1. GENERATE MASTER SRS IEEE 830 MARKDOWN
// ----------------------------------------------------------------------------
function generateSrsMarkdown() {
  return `# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## HỆ THỐNG QUẢN TRỊ & ỨNG DỤNG DOANH NHÂN CLB CEO 1983 (HANOIBA)
### Tiêu Chuẩn Quốc Tế IEEE 830 — Phiên Bản Master Hoàn Chỉnh

---

### THÔNG TIN DỰ ÁN (PROJECT METADATA)
* **Tên dự án:** Hệ Sinh Thái Số Hóa & Quản Trị Hiệp Hội Doanh Nhân CEO 1983 (CEO 1983 Association Ecosystem).
* **Mục tiêu cốt lõi:** Số hóa 100% hồ sơ hội viên, tự động hóa quy trình thẩm định kết nạp, quản trị sổ quỹ và thu hội phí thường niên, kiểm soát an ninh sự kiện qua mã QR Pass tốc độ cao, tổ chức biểu quyết đại hội minh bạch và thúc đẩy mạng lưới giao thương nội khối B2B.
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA).
* **Đơn vị tư vấn & phát triển:** ViConnect Platform & Ban Công Nghệ Chuyển Đổi Số.
* **Mã tài liệu:** \`SRS-IEEE830-CEO1983-MASTER-V5.0\`
* **Phiên bản:** \`Version 5.0 (Master Release — Đầy Đủ Chi Tiết & Khớp Kỹ Thuật 100%)\`
* **Ngày phê duyệt:** 04/10/2026
* **Trạng thái:** Đã thẩm định, đối chiếu kiến trúc thực tế và phê duyệt chính thức.

---

## 1. GIỚI THIỆU CHUNG (INTRODUCTION)

### 1.1. Mục Đích Của Tài Liệu (Purpose)
Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) này được biên soạn theo tiêu chuẩn quốc tế **IEEE 830-1998**, nhằm xác định một cách đầy đủ, chính xác và không mơ hồ toàn bộ các yêu cầu chức năng (Functional Requirements), yêu cầu phi chức năng (Non-Functional Requirements), thiết kế vai trò người dùng (User Roles), hành trình trải nghiệm (User Journeys) và các giao diện tích hợp hệ thống cho **Hệ sinh thái Số hóa Hiệp hội Doanh nhân CEO 1983**.

Tài liệu là bản cam kết kỹ thuật duy nhất giữa Ban Thường Trực Ban Chấp Hành CLB Doanh Nhân CEO 1983, Hội Doanh Nhân Trẻ Hà Nội (HanoiBA), Ban Kiểm Tra, Ban Thư Ký và Đội ngũ Kỹ sư Phát triển Hệ thống ViConnect trong toàn bộ vòng đời phát triển, kiểm thử, bàn giao và vận hành.

### 1.2. Phạm Vi Dự Án (Project Scope)
Hệ sinh thái bao gồm 3 phân hệ cấu thành độc lập nhưng đồng bộ dữ liệu thời gian thực:
1. **Cổng Thông Tin Công Khai (Public Landing Web):** Tiếp nhận hồ sơ đăng ký gia nhập CLB trực tuyến, tra cứu mã định danh hội viên và truyền thông giá trị cốt lõi của CLB Doanh Nhân CEO 1983.
2. **Cổng Quản Trị Điều Hành Trung Tâm (Executive Web CRM):** Dành cho Ban Quản Trị, Ban Thư Ký và 6 Ban chuyên môn để quản lý hồ sơ hội viên 360°, thẩm định kết nạp, sơ đồ ghế sự kiện Gala (Cinema Seating Map), cổng soát vé an ninh QR Gate, điều hành cuộc họp trực tuyến/offline, sàn giao thương B2B, quản lý công việc phân cấp và sổ quỹ thu chi minh bạch.
3. **Ứng Dụng Di Động Hội Viên (CEO 1983 Mobile App & PWA):** Dành riêng cho Hội viên chính thức với Thẻ VIP 3D Navy & Gold, Danh thiếp thông minh NFC chạm 1 chạm, Hộp thư Doanh nhân Messenger #0084FF, Gian hàng B2B Doanh nhân CEO 1983, Bảng tin cơ hội Cung - Cầu thời gian thực, Biểu quyết đại hội và Cổng thanh toán gia hạn hội phí VietQR.

### 1.3. Thuật Ngữ & Viết Tắt (Definitions, Acronyms & Abbreviations)
* **HanoiBA:** Hội Doanh Nhân Trẻ Hà Nội (Hanoi Young Business Association).
* **CLB CEO 1983:** Câu lạc bộ Doanh nhân sinh năm Quý Hợi 1983 trực thuộc HanoiBA.
* **BQT:** Ban Quản Trị CLB Doanh Nhân CEO 1983.
* **BTK:** Ban Thư Ký CLB Doanh Nhân CEO 1983.
* **BTV:** Ban Thành Viên CLB Doanh Nhân CEO 1983.
* **BTN:** Ban Thiện Nguyện & An Sinh Xã Hội.
* **BTT:** Ban Truyền Thông & Sự Kiện.
* **BXT:** Ban Xúc Tiến Thương Mại & Hợp Tác Đầu Tư.
* **BTC:** Ban Tài Chính & Sổ Quỹ Hiệp Hội.
* **RBAC:** Role-Based Access Control (Kiểm soát truy cập dựa trên vai trò).
* **VietQR:** Chuẩn thanh toán mã QR liên ngân hàng Napas 24/7.
* **PWA:** Progressive Web App (Ứng dụng web cấp tiến chạy đa nền tảng).
* **JWT:** JSON Web Token (Cơ chế xác thực phiên làm việc an toàn).
* **E-Ticket QR:** Vé điện tử định danh kèm mã QR mã hóa dùng trong soát vé.
* **NFC:** Near Field Communication (Công nghệ truyền thông trường gần 13.56MHz).
* **MECE:** Mutually Exclusive, Collectively Exhaustive (Không trùng lặp, Không bỏ sót).

---

## 2. MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)

### 2.1. Danh Sách User Roles & Ma Trận Phân Quyền (Roles & Permissions)

Hệ thống thiết lập ma trận phân quyền 5 cấp bậc nghiêm ngặt kết hợp phân định trách nhiệm theo 6 Ban chuyên môn:

| Cấp Bậc Vai Trò | Mã Role | Đối Tượng Áp Dụng | Phạm Vi Quyền Hạn Cốt Lõi |
| :--- | :--- | :--- | :--- |
| **Cấp 1: Quản Trị Tối Cao** | \`quan_tri\` / \`superadmin\` | Chủ tịch CLB, Ban Thường Trực | Toàn quyền cấu hình hệ thống, xem, sửa, xóa, phân bổ vai trò và phê duyệt ngân sách/sự kiện cấp cao nhất. |
| **Cấp 2: Quản Trị Vận Hành** | \`admin\` | Giám đốc điều hành, Phó Chủ tịch phụ trách | Xem, sửa, phân quyền tài khoản chuyên ban, điều hành các hoạt động tác nghiệp hàng ngày. |
| **Cấp 3: Tổng Thư Ký** | \`tong_thu_ky\` / \`btk\` | Tổng Thư Ký, Chánh Văn Phòng | Khởi tạo và điều phối cuộc họp, quản lý phòng họp Sapphire Hub, ban hành nghị quyết, văn bản. **Tuyệt đối KHÔNG có quyền phê duyệt kết nạp hội viên.** |
| **Cấp 4: Trưởng Ban Chuyên Môn** | \`truong_ban\` (\`btv\`, \`btn\`, \`btt\`, \`bxt\`, \`btc\`) | Lãnh đạo 6 Ban chuyên trách | Quản lý nghiệp vụ chuyên biệt của từng ban: BTV độc quyền duyệt hội viên; BXT duyệt sàn B2B; BTT soát vé; BTN/BTC duyệt chi tiêu sổ quỹ. |
| **Cấp 5: Hội Viên Chính Thức** | \`member\` | 500+ Doanh nhân CEO 1983 chính danh | Sử dụng App Mobile: Thẻ VIP, danh bạ, đặt vé sự kiện, đăng sản phẩm B2B, trao đổi cơ hội, bỏ phiếu biểu quyết và nộp hội phí. |
| **Cấp 0: Khách Vãng Lai** | \`guest\` | Doanh nhân 1983 ứng viên, khách mời | Xem cổng thông tin công khai, gửi đơn đăng ký gia nhập CLB, đăng ký vé sự kiện mở rộng. |

#### Ma Trận Trách Nhiệm RACI Trong 6 Ban Chuyên Môn:
1. **Ban Quản Trị (BQT):** Accountable (A) toàn diện mọi quyết định tổ chức và ngân sách.
2. **Ban Thành Viên (BTV):** Responsible (R) độc quyền tiếp nhận, thẩm định và bấm nút duyệt kết nạp hội viên (Cấp mã \`CEO-83xxx\`).
3. **Ban Thư Ký (BTK):** Responsible (R) điều hành lịch họp, biểu quyết và văn bản hành chính; không can thiệp thẩm định hội viên.
4. **Ban Thiện Nguyện (BTN) & Ban Tài Chính (BTC):** Responsible (R) quản lý Sổ Quỹ Thu Chi, kiểm soát phiếu chi 3 cấp và đối soát hội phí.
5. **Ban Truyền Thông (BTT):** Responsible (R) vận hành Cổng soát vé Gate Check-in QR tại sự kiện và quản trị bảng tin truyền thông.
6. **Ban Xúc Tiến Thương Mại (BXT):** Responsible (R) kiểm duyệt gian hàng sản phẩm B2B và điều phối cơ hội kinh doanh Cung - Cầu.

---

### 2.2. Ánh Xạ Toàn Bộ Hành Trình Người Dùng (User Journeys)

#### Hành Trình 1: Khách Vãng Lai ➔ Đăng Ký Trực Tuyến ➔ Thẩm Định BTV ➔ Cấp Mã Hội Viên ➔ Đăng Nhập Lần Đầu
1. **Bước 1:** Ứng viên truy cập Cổng thông tin công khai, nhấn nút "Đăng Ký Gia Nhập".
2. **Bước 2:** Điền mẫu đơn điện tử: Họ tên, Ngày sinh (xác thực năm 1983), SĐT, Email, Tên doanh nghiệp, MST, Chức vụ, Nguyện vọng chuyên ban.
3. **Bước 3:** Nhấn gửi đơn. Hệ thống lưu hồ sơ ở trạng thái \`pending\` (Chờ thẩm định), đồng thời máy chủ SMTP tự động gửi email xác nhận tiếp nhận đến hòm thư ứng viên.
4. **Bước 4:** Lãnh đạo Ban Thành Viên (BTV) đăng nhập CRM, mở màn hình "Duyệt Hội Viên" (\`/members\`), kiểm tra thông tin pháp nhân và nhấn nút "Phê Duyệt".
5. **Bước 5:** Hệ thống tự động sinh Mã hội viên chuẩn (\`CEO-83xxx\`), tạo tài khoản người dùng, băm mật khẩu khởi tạo an toàn và gửi email chào mừng kèm thông tin đăng nhập.
6. **Bước 6:** Hội viên mở App Mobile CEO 1983, đăng nhập bằng Email/SĐT và mật khẩu tạm thời, hệ thống bắt buộc đổi mật khẩu mới trong lần đầu tiên truy cập.

#### Hành Trình 2: Quản Lý Hội Phí ➔ Quét Mã VietQR ➔ Kế Toán Đối Soát ➔ Duyệt Gia Hạn (+1 Năm)
1. **Bước 1:** Hội viên mở mục "Hội Phí" trên App Mobile, hệ thống hiển thị thông báo niên liễm cần đóng (5.000.000 VNĐ/năm).
2. **Bước 2:** Bấm nút "Thanh Toán VietQR". Hệ thống hiển thị mã VietQR động chuẩn Napas 24/7 chứa sẵn Số tiền, Tên tài khoản thụ hưởng và Cú pháp chuẩn (\`HOIPHI CEO1983 [MÃ_HỘI_VIÊN]\`).
3. **Bước 3:** Hội viên mở ứng dụng Ngân hàng trên điện thoại, quét mã QR và xác nhận chuyển khoản.
4. **Bước 4:** Ban Kế toán / Thủ quỹ mở màn hình "Quản Lý Hội Phí" (\`/fees\`) trên Web CRM, kiểm tra giao dịch tương ứng trên sao kê ngân hàng.
5. **Bước 5:** Bấm nút "Duyệt Gạch Nợ". Hệ thống tự động cộng thêm +365 ngày vào hạn dùng của Thẻ hội viên VIP, chuyển trạng thái sang \`paid\` và gửi hóa đơn xác nhận đến hội viên.

#### Hành Trình 3: Tạo Sự Kiện Gala ➔ Xếp Ghế Sân Khấu ➔ Phát Hành Vé QR ➔ Soát Vé Gate Check-in Tốc Độ Cao
1. **Bước 1:** Ban Quản Trị / Ban Thư Ký tạo mới Sự kiện Gala trên CRM, thiết lập timeline, cấu hình vé VIP và vé Tiêu chuẩn.
2. **Bước 2:** Mở công cụ "Cinema Seating Map", kéo thả bố trí bàn tiệc VIP 10 chỗ, dãy ghế đại biểu danh dự và khán phòng.
3. **Bước 3:** Hội viên đăng ký tham dự qua App Mobile, chọn vị trí ngồi và nhận ngay Vé điện tử E-Ticket chứa mã QR mã hóa độc bản.
4. **Bước 4:** Tại cửa đón tiếp sự kiện Gala, Ban Truyền Thông mở máy quét tại Cổng An Ninh Soát Vé (\`/checkin\`).
5. **Bước 5:** Quét mã QR trên điện thoại đại biểu. Hệ thống phản hồi < 0.2s: Màn hình xanh lục hợp lệ, hiển thị Họ tên, Doanh nghiệp và Số bàn VIP; nếu quét lại lần 2, hệ thống lập tức báo đỏ cảnh báo vé đã qua cửa.
6. **Bước 6:** Dữ liệu check-in thực tế tự động đồng bộ vào Vòng quay số may mắn (Lucky Draw) để phục vụ quay thưởng đại hội.

#### Hành Trình 4: Kết Nối Giao Thương B2B ➔ Trao Đổi Danh Thiếp NFC ➔ Nhắn Tin Hẹn Gặp 1-on-1
1. **Bước 1:** Hai hội viên gặp gỡ tại sự kiện, chạm thẻ danh thiếp thông minh NFC vào mặt lưng điện thoại đối tác.
2. **Bước 2:** Điện thoại tự động mở trang Danh thiếp số công khai (\`/card/:code\`) chứa đầy đủ hồ sơ năng lực, công ty và nút lưu danh bạ.
3. **Bước 3:** Bấm nút "Kết Nối B2B", mở ngăn kéo (Bottom Sheet) chọn mục đích hợp tác và gửi lời mời gặp gỡ 1-on-1.
4. **Bước 4:** Đối tác nhận thông báo tức thì, mở Hộp thư Messenger #0084FF và bấm "Chấp Nhận Lời Mời".
5. **Bước 5:** Hệ thống tạo phòng họp hoặc liên kết lịch hẹn trực tiếp, lưu trữ lịch sử tương tác vào Hồ sơ Quan hệ Đối tác.

#### Hành Trình 5: Đại Hội Hiệp Hội ➔ Biểu Quyết Trực Tuyến ➔ Công Bố Kết Quả Realtime
1. **Bước 1:** Ban Thư Ký khởi tạo phiên biểu quyết trên CRM: Tiêu đề nghị quyết, danh sách phương án lựa chọn, thời gian mở và đóng hòm phiếu.
2. **Bước 2:** Kích hoạt phiên biểu quyết. Toàn bộ hội viên chính thức nhận được thông báo đẩy trên App Mobile.
3. **Bước 3:** Hội viên mở màn hình Biểu Quyết (\`/association/voting\`), chọn phương án và bấm "Xác Nhận Bỏ Phiếu". Hệ thống áp dụng quy tắc 1 người 1 phiếu và khóa nút sau khi đã bầu.
4. **Bước 4:** Máy chủ tổng hợp phiếu bầu tức thời, màn hình lớn sân khấu đại hội hiển thị biểu đồ tỷ lệ phần trăm (%) nhảy động theo thời gian thực mà không lộ danh tính người bỏ phiếu.

---

### 2.3. Môi Trường Hoạt Động (Operating Environment)
* **Phía Máy Khách (Clients):**
  - Web Desktop: Google Chrome 90+, Apple Safari 14+, Mozilla Firefox 90+, Microsoft Edge 90+.
  - Mobile Devices: iOS 14.0+ (Safari PWA / Mobile Safari), Android 9.0+ (Chrome / Edge PWA / Native APK).
* **Phía Máy Chủ (Server & Infrastructure):**
  - Hệ điều hành: Linux Ubuntu 22.04 LTS (Production Containerized Environment).
  - Web Server & Gateway: Nginx Reverse Proxy (SSL/TLS 1.3 Termination, Gzip/Brotli Compression, WSS Reverse Proxy).
  - Runtime Engine: Node.js v18.x LTS, NestJS Framework v10.x.
  - Cơ sở dữ liệu: PostgreSQL Database v15+ kết hợp Prisma ORM (@vibe/db) và Connection Pooler PgBouncer.
  - Lưu trữ tệp đối tượng: MinIO S3 Compatible Object Storage (Lưu trữ ảnh đại diện, ảnh bìa, banner, hóa đơn và PDF tài liệu).
  - Giao tiếp thời gian thực: Socket.IO Gateway Engine.

---

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

### 3.1. MODULE 1: CỔNG THÔNG TIN CÔNG KHAI & ĐĂNG KÝ HỘI VIÊN (PUBLIC PORTAL)

#### [FR-PUB-01] Khám Phá Cổng Thông Tin & Giới Thiệu Tôn Chỉ CLB
* **Actor:** Khách vãng lai, Doanh nhân ứng viên, Công chúng.
* **Mô tả chi tiết:**
  - **Input:** Khách truy cập đường dẫn trang chủ Cổng thông tin công khai.
  - **Xử lý logic:** Hệ thống tải trang chủ, render Banner nhận diện thương hiệu, thông điệp Chủ tịch, giới thiệu 6 Ban chuyên môn điều hành và các số liệu thống kê quy mô (500+ hội viên, tổng giá trị giao thương).
  - **Output:** Giao diện Cổng thông tin hiển thị sắc nét, tối ưu chuẩn Responsive trên cả máy tính và điện thoại.
* **Ngoại lệ:** Mất kết nối internet ➔ Trình duyệt hiển thị trang thông báo Offline của Service Worker.

#### [FR-PUB-02] Đăng Ký Gia Nhập Hội Viên Chính Thức Trực Tuyến
* **Actor:** Doanh nhân sinh năm 1983 (Đại diện mẫu: \`vupv090120@gmail.com\`).
* **Mô tả chi tiết:**
  - **Input:** Biểu mẫu đăng ký gồm: Họ tên, Ngày tháng năm sinh, Số điện thoại, Email doanh nghiệp, Tên công ty, Mã số thuế, Chức vụ lãnh đạo, Lĩnh vực ngành nghề, Nguyện vọng chuyên ban sinh hoạt.
  - **Xử lý logic:**
    1. Kiểm tra năm sinh bắt buộc phải là 1983.
    2. Kiểm tra định dạng Email chuẩn và Số điện thoại 10 chữ số.
    3. Kiểm tra xem Email/SĐT đã tồn tại trong CSDL hay chưa.
    4. Ghi nhận bản ghi vào bảng \`members\` với trạng thái \`status = 'pending'\`.
    5. Kích hoạt sự kiện gửi email tự động xác nhận qua SMTP Mailer.
  - **Output:** Thông báo tiếp nhận hồ sơ thành công, hiển thị Mã tra cứu hồ sơ và thông điệp hướng dẫn bước tiếp theo.
* **Ngoại lệ:**
  - Năm sinh khác 1983 ➔ Báo lỗi: "CLB CEO 1983 chỉ tiếp nhận hội viên sinh năm Quý Hợi 1983".
  - Email/SĐT đã tồn tại ➔ Báo lỗi: "Hồ sơ với thông tin này đã được đăng ký, vui lòng liên hệ Ban Thành Viên".

#### [FR-PUB-03] Tự Động Gửi Email Xác Nhận Tiếp Nhận Hồ Sơ Đăng Ký
* **Actor:** Hệ thống Máy chủ Thư tín Tự động (SMTP Mailer Service).
* **Mô tả chi tiết:**
  - **Input:** Sự kiện tạo hồ sơ đăng ký mới thành công từ [FR-PUB-02].
  - **Xử lý logic:** Lấy thông tin ứng viên, chèn vào mẫu email thương hiệu CEO 1983 (HTML Template), kết nối cổng SMTP Gmail Relay (\`smtp.gmail.com:465\`) và phát thư.
  - **Output:** Thư điện tử gửi thành công vào hòm thư ứng viên kèm thông tin tóm tắt và quy trình xét duyệt.
* **Ngoại lệ:** Hòm thư đích từ chối hoặc lỗi mạng SMTP ➔ Tự động xếp hàng thử lại (Retry Queue) sau 5 phút.

#### [FR-PUB-04] Tra Cứu Danh Bạ Doanh Nghiệp Thành Viên Công Khai
* **Actor:** Khách vãng lai, Đối tác tìm kiếm nhà cung cấp.
* **Mô tả chi tiết:**
  - **Input:** Từ khóa tìm kiếm (Tên doanh nghiệp, Ngành nghề, Sản phẩm cốt lõi).
  - **Xử lý logic:** Truy vấn danh sách doanh nghiệp đã được xác thực (\`is_verified = true\`), hiển thị Logo, Tên công ty, Lĩnh vực và Địa chỉ trụ sở. Ẩn thông tin số điện thoại cá nhân theo chính sách bảo mật.
  - **Output:** Danh sách card doanh nghiệp kèm liên kết dẫn đến trang thông tin chi tiết.
* **Ngoại lệ:** Không tìm thấy kết quả ➔ Hiển thị gợi ý các ngành nghề tiêu biểu trong hiệp hội.

---

### 3.2. MODULE 2: XÁC THỰC, PHÂN QUYỀN & BẢO MẬT HỆ THỐNG (IAM & SECURITY)

#### [FR-SEC-01] Đăng Nhập Cổng Quản Trị Web CRM
* **Actor:** Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn.
* **Mô tả chi tiết:**
  - **Input:** Email hoặc Mã hội viên và Mật khẩu quản trị.
  - **Xử lý logic:**
    1. Tìm bản ghi tài khoản trong bảng \`users\`.
    2. So khớp mật khẩu với hàm băm \`bcrypt.compare()\`.
    3. Kiểm tra trạng thái tài khoản (\`status = 'active'\`).
    4. Kiểm tra quyền hạn quản trị (Chỉ tài khoản thuộc 5 cấp bậc quản trị mới được truy cập CRM).
    5. Khởi tạo cặp khóa JWT (Access Token 15 phút, Refresh Token 7 ngày) và lưu thông tin phiên làm việc.
  - **Output:** Điều hướng vào Bàn làm việc Dashboard CRM (\`/\`), lưu token an toàn.
* **Ngoại lệ:**
  - Sai mật khẩu quá 5 lần ➔ Tạm khóa tài khoản trong 15 phút chống tấn công Brute-force.
  - Tài khoản không có quyền quản trị ➔ Báo lỗi: "Tài khoản không có thẩm quyền truy cập Cổng Quản Trị".

#### [FR-SEC-02] Đăng Nhập Ứng Dụng Di Động Hội Viên CEO 1983
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Số điện thoại / Email và Mật khẩu hội viên.
  - **Xử lý logic:** Xác thực danh tính hội viên, kiểm tra trạng thái kích hoạt hồ sơ, tạo phiên làm việc di động và tải dữ liệu Thẻ hội viên VIP.
  - **Output:** Điều hướng vào Trang chủ Hội viên (\`/association\`), hiển thị họ tên, ảnh đại diện và thẻ danh dự.
* **Ngoại lệ:** Hồ sơ đang ở trạng thái Chờ thẩm định (\`pending\`) ➔ Thông báo: "Hồ sơ của Quý anh/chị đang được Ban Thành Viên thẩm định".

#### [FR-SEC-03] Bắt Buộc Đổi Mật Khẩu Khởi Tạo Lần Đầu (Onboarding Password Change)
* **Actor:** Hội viên mới đăng nhập lần đầu tiên bằng mật khẩu hệ thống cấp.
* **Mô tả chi tiết:**
  - **Input:** Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.
  - **Xử lý logic:**
    1. Kiểm tra cờ \`must_change_password = true\`.
    2. Kiểm tra độ mạnh mật khẩu mới: Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số.
    3. Băm mật khẩu mới bằng \`bcrypt\` và cập nhật vào CSDL.
    4. Xóa cờ \`must_change_password = false\`.
  - **Output:** Thông báo đổi mật khẩu thành công và chuyển thẳng vào màn hình chính.
* **Ngoại lệ:** Mật khẩu mới trùng mật khẩu cũ hoặc không đủ độ phức tạp ➔ Báo lỗi chi tiết.

#### [FR-SEC-04] Cơ Chế Làm Mới Phiên Làm Việc (JWT Token Refresh)
* **Actor:** Hệ thống xác thực ngầm định.
* **Mô tả chi tiết:**
  - **Input:** Refresh Token hợp lệ gửi kèm yêu cầu khi Access Token hết hạn (401 Unauthorized).
  - **Xử lý logic:** Kiểm tra chữ ký số Refresh Token, kiểm tra trong danh sách thu hồi (Blacklist), phát hành Access Token mới và cấp lại cho client.
  - **Output:** Yêu cầu API ban đầu được thực thi thông suốt mà người dùng không bị gián đoạn hay văng khỏi ứng dụng.
* **Ngoại lệ:** Refresh Token hết hạn hoặc không hợp lệ ➔ Xóa phiên đăng nhập và chuyển hướng về màn hình Đăng nhập.

#### [FR-SEC-05] Quản Trị Ma Trận Phân Quyền Vai Trò (RBAC Management)
* **Actor:** Ban Quản Trị tối cao (\`quan_tri\`).
* **Mô tả chi tiết:**
  - **Input:** Lựa chọn vai trò (Cột bên trái) và danh sách chức năng (Cột bên trên), đánh dấu các quyền: Xem, Sửa, Xóa, Phân quyền.
  - **Xử lý logic:** Cập nhật bảng ánh xạ quyền hạn \`role_permissions\`, áp dụng chính sách Data Scope và phân vùng bảo mật.
  - **Output:** Cập nhật ma trận thành công, áp dụng tức thời cho các tài khoản đang hoạt động.
* **Ngoại lệ:** Cố ý hạ quyền của vai trò \`quan_tri\` tối cao ➔ Hệ thống chặn và báo lỗi an toàn.

---

### 3.3. MODULE 3: QUẢN TRỊ DANH BẠ HỘI VIÊN 360° & THẨM ĐỊNH KẾT NẠP

#### [FR-MBR-01] Quản Lý Danh Sách Hội Viên Đa Chiều
* **Actor:** Ban Quản Trị, Ban Thành Viên, Ban Thư Ký.
* **Mô tả chi tiết:**
  - **Input:** Bộ lọc theo Ban chuyên môn, Tình trạng hội phí (Đã đóng / Quá hạn), Hạng hội viên (Kim Cương / Vàng / Bạc), Từ khóa tìm kiếm.
  - **Xử lý logic:** Truy vấn bảng \`members\`, hỗ trợ cuộn ngang bảng chuẩn với Cột STT cố định bên trái và Cột Thao tác cố định bên phải.
  - **Output:** Bảng danh sách hội viên chuẩn xác, hiển thị Mã HV, Họ tên, Doanh nghiệp, Chức vụ, SĐT, Ban chuyên môn và Trạng thái.
* **Ngoại lệ:** Không có dữ liệu thỏa mãn bộ lọc ➔ Hiển thị trạng thái rỗng và nút đặt lại bộ lọc.

#### [FR-MBR-02] Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới (Độc Quyền BTV)
* **Actor:** Trưởng Ban Thành Viên (\`ceo.thanhvien@ceo1983.com\`).
* **Mô tả chi tiết:**
  - **Input:** Mở ngăn kéo (Drawer) chi tiết hồ sơ ứng viên đang chờ duyệt (\`pending\`).
  - **Xử lý logic:**
    1. Kiểm tra tính pháp lý doanh nghiệp, năng lực điều hành và xác nhận đúng năm sinh 1983.
    2. Nhấn nút "Phê Duyệt Kết Nạp".
    3. Hệ thống kiểm tra quyền hạn của người thực hiện (Bắt buộc phải là Ban Thành Viên hoặc BQT; chặn tuyệt đối Ban Thư Ký).
    4. Sinh mã số hội viên tự động \`CEO-83xxx\` (ví dụ: \`CEO-83007\`).
    5. Cập nhật trạng thái sang \`active\`, tạo mật khẩu khởi tạo ngẫu nhiên.
    6. Gửi email phát hành tài khoản và mật khẩu đến email ứng viên qua SMTP Gmail.
  - **Output:** Thông báo toast duyệt thành công, hiển thị mã hội viên mới và cập nhật bảng danh sách.
* **Ngoại lệ:** Tài khoản Ban Thư Ký bấm duyệt ➔ Báo lỗi: "Ban Thư Ký không có thẩm quyền duyệt kết nạp hội viên, nghiệp vụ thuộc Ban Thành Viên".

#### [FR-MBR-03] Từ Chối Hồ Sơ Gia Nhập Kèm Lý Do
* **Actor:** Ban Thành Viên (BTV).
* **Mô tả chi tiết:**
  - **Input:** Nhấn nút "Từ Chối", nhập lý do từ chối (Ví dụ: Chưa đủ điều kiện đại diện pháp luật, sai năm sinh).
  - **Xử lý logic:** Cập nhật trạng thái hồ sơ sang \`rejected\`, lưu lý do vào nhật ký và kích hoạt email thông báo nhã nhặn tới ứng viên.
  - **Output:** Hồ sơ chuyển sang danh sách Từ chối, gửi email thông báo kết quả.
* **Ngoại lệ:** Chưa nhập lý do từ chối ➔ Bắt buộc nhập lý do mới cho phép xác nhận.

#### [FR-MBR-04] Hồ Sơ Hội Viên Chi Tiết 360 Độ
* **Actor:** Quản trị viên CRM, Hội viên xem hồ sơ của mình.
* **Mô tả chi tiết:**
  - **Input:** Nhấp vào mã hoặc tên hội viên.
  - **Xử lý logic:** Tải toàn bộ dữ liệu liên kết: Thông tin cá nhân, Hồ sơ doanh nghiệp thành viên, Lịch sử tham gia sự kiện Gala, Lịch sử đóng hội phí thường niên, Danh sách sản phẩm B2B đang bán, Lịch sử cuộc họp và đóng góp quỹ thiện nguyện.
  - **Output:** Giao diện Hồ sơ 360 độ trực quan, phân chia theo từng Tab thông tin chuyên biệt.
* **Ngoại lệ:** Hội viên thường xem hồ sơ hội viên khác trên CRM ➔ Bị chặn quyền truy cập.

---

### 3.4. MODULE 4: SÀN GIAO THƯƠNG B2B MARKETPLACE & DOANH NGHIỆP THÀNH VIÊN

#### [FR-MKT-01] Đăng Tải Sản Phẩm / Dịch Vụ Lên Sàn B2B Nội Khối
* **Actor:** Hội viên chính thức (Đại diện doanh nghiệp thành viên).
* **Mô tả chi tiết:**
  - **Input:** Tên sản phẩm/dịch vụ, Danh mục ngành hàng, Giá niêm yết, Giá ưu đãi độc quyền cho Hội viên CEO 1983 (Ví dụ: Giảm 15%), Ảnh sản phẩm chất lượng cao (MinIO), Mô tả kỹ thuật và Chính sách bảo hành.
  - **Xử lý logic:** Kiểm tra tài khoản hội viên có hợp lệ và đã đóng hội phí hay chưa, lưu bản ghi vào \`products\` ở trạng thái \`pending\` (Chờ duyệt).
  - **Output:** Sản phẩm được gửi lên hệ thống và chuyển về hàng đợi kiểm duyệt của Ban Xúc Tiến Thương Mại.
* **Ngoại lệ:** Hội viên nợ hội phí quá hạn ➔ Cảnh báo yêu cầu hoàn tất hội phí trước khi đăng bán sản phẩm.

#### [FR-MKT-02] Kiểm Duyệt & Kích Hoạt Gian Hàng B2B (Độc Quyền BXT)
* **Actor:** Ban Xúc Tiến Thương Mại (\`ceo.xuctien@ceo1983.com\`).
* **Mô tả chi tiết:**
  - **Input:** Mở danh sách sản phẩm chờ duyệt trên CRM (\`/marketplace\`), xem chi tiết chứng chỉ chất lượng và chính sách ưu đãi.
  - **Xử lý logic:** Nhấn "Phê Duyệt Đăng Sàn". Hệ thống chuyển trạng thái sang \`published\`, đẩy sản phẩm lên vị trí nổi bật trên Mobile App.
  - **Output:** Sản phẩm xuất hiện chính thức trên Gian hàng B2B Doanh nhân CEO 1983.
* **Ngoại lệ:** Sản phẩm vi phạm chính sách trợ giá nội bộ ➔ Bấm "Yêu Cầu Chỉnh Sửa" kèm ghi chú phản hồi.

#### [FR-MKT-03] Đàm Phán & Gửi Báo Giá Trực Tiếp Giữa Hai Doanh Nhân
* **Actor:** Hội viên mua hàng và Hội viên bán hàng.
* **Mô tả chi tiết:**
  - **Input:** Bấm nút "Nhắn Tin Đàm Phán B2B" tại trang chi tiết sản phẩm.
  - **Xử lý logic:** Hệ thống tự động tạo cuộc trò chuyện chuyên biệt trên Hộp thư Messenger #0084FF, ghim kèm thẻ thông tin sản phẩm và báo giá mẫu.
  - **Output:** Cửa sổ chat mở ra tức thì với đầy đủ ngữ cảnh giao thương giữa hai CEO.
* **Ngoại lệ:** Người bán đang khóa tài khoản ➔ Thông báo sản phẩm tạm thời ngừng giao dịch.

---

### 3.5. MODULE 5: BẢNG TIN CƠ HỘI KINH DOANH CUNG - CẦU (OPPORTUNITIES)

#### [FR-OPP-01] Đăng Nhu Cầu Cung - Cầu Kinh Doanh
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Loại nhu cầu (Cần Mua / Cần Bán / Tìm Đối Tác Đầu Tư), Tiêu đề, Giá trị thương vụ ước tính (VNĐ), Thời hạn hiệu lực, Mô tả chi tiết yêu cầu kỹ thuật và hồ sơ năng lực cần có.
  - **Xử lý logic:** Lưu vào bảng \`opportunities\`, tự động phân loại ngành nghề và kích hoạt cơ chế ghép nối AI Matcher.
  - **Output:** Cơ hội xuất hiện trên Bảng tin Giao thương (\`/association/opportunities\`) kèm định giá thương vụ.
* **Ngoại lệ:** Giá trị thương vụ nhập số âm hoặc sai định dạng tiền tệ ➔ Form tự động định dạng và báo lỗi.

#### [FR-OPP-02] Tiếp Nhận & Khớp Lệnh Cơ Hội (Claim Opportunity)
* **Actor:** Doanh nghiệp có năng lực đáp ứng nhu cầu.
* **Mô tả chi tiết:**
  - **Input:** Bấm nút "Tiếp Nhận Cơ Hội", đính kèm đề xuất phương án và số điện thoại liên hệ.
  - **Xử lý logic:** Cập nhật trạng thái cơ hội sang \`claimed\`, ghi nhận tên người tiếp nhận (\`claimedByName\`), gửi thông báo tức thì đến người đăng.
  - **Output:** Cơ hội chuyển trạng thái sang "Đã Tiếp Nhận", hiển thị dấu chấm xanh hợp tác và mở kênh trao đổi riêng.
* **Ngoại lệ:** Cơ hội đã được đối tác khác tiếp nhận trước ➔ Báo thông báo: "Cơ hội này đã được tiếp nhận xử lý".

---

### 3.6. MODULE 6: QUẢN TRỊ SỰ KIỆN, VÉ MỜI QR & SƠ ĐỒ GHẾ SEATING MAP

#### [FR-EVT-01] Khởi Tạo Sự Kiện Gala & Đại Hội Hiệp Hội
* **Actor:** Ban Quản Trị, Ban Thư Ký, Ban Truyền Thông.
* **Mô tả chi tiết:**
  - **Input:** Tên sự kiện, Thời gian bắt đầu/kết thúc, Địa điểm tổ chức, Ảnh banner 16:9, Nội dung chương trình (Agenda), Diễn giả danh dự.
  - **Xử lý logic:** Thiết lập trạng thái \`upcoming\`, lưu trữ bản ghi vào bảng \`events\`, đẩy thông báo đến toàn thể hội viên.
  - **Output:** Sự kiện xuất hiện trên Lịch hoạt động Web CRM và App Mobile.
* **Ngoại lệ:** Thời gian kết thúc trước thời gian bắt đầu ➔ Báo lỗi logic thời gian.

#### [FR-EVT-02] Cấu Hình Đa Hạng Vé & Biểu Phí Tham Dự
* **Actor:** Ban Tổ Chức Sự Kiện.
* **Mô tả chi tiết:**
  - **Input:** Tạo các gói vé: Vé VIP Dạ Tiệc Gala (Có phí: 1.500.000 VNĐ), Vé Tiêu Chuẩn Hội Viên Chính Thức (Miễn phí: 0 VNĐ), Vé Khách Mời Doanh Nghiệp (0 VNĐ).
  - **Xử lý logic:** Lưu cấu hình vé, liên kết mã thanh toán VietQR cho các loại vé có thu phí.
  - **Output:** Bảng biểu phí vé hiển thị rõ ràng trên cổng đăng ký sự kiện.
* **Ngoại lệ:** Số lượng vé đăng ký vượt quá sức chứa khán phòng ➔ Tự động khóa đăng ký và báo "Hết vé".

#### [FR-EVT-03] Thiết Kế Sơ Đồ Chỗ Ngồi Cinema Seating Map
* **Actor:** Ban Thư Ký, Ban Tổ Chức.
* **Mô tả chi tiết:**
  - **Input:** Giao diện đồ họa Seating Map (\`/events/seating\`), chọn loại bàn tròn Gala VIP (10 ghế) hoặc dãy ghế hội trường.
  - **Xử lý logic:** Gán định danh bàn (\`Bàn VIP 01\`, \`Bàn VIP 02\`), gán hội viên cụ thể vào từng vị trí ghế ngồi theo thứ tự nghi lễ ngoại giao.
  - **Output:** Sơ đồ phòng tiệc hiển thị trực quan theo thời gian thực, đồng bộ số bàn vào vé E-Ticket của đại biểu.
* **Ngoại lệ:** Gán trùng 1 hội viên vào 2 vị trí ghế khác nhau ➔ Hệ thống tự động cảnh báo xung đột vị trí.

---

### 3.7. MODULE 7: CỔNG AN NINH SOÁT VÉ GATE CHECK-IN QR & QUAY SỐ MAY MẮN

#### [FR-CHK-01] Quét Mã QR Pass Soát Vé Cổng Tốc Độ Cao
* **Actor:** Ban Truyền Thông, Nhân viên soát vé tại cửa sự kiện.
* **Mô tả chi tiết:**
  - **Input:** Hướng camera máy quét vào mã QR trên điện thoại hoặc vé in của đại biểu (\`/checkin\`).
  - **Xử lý logic:**
    1. Giải mã token QR code của vé.
    2. Truy vấn bản ghi đăng ký trong \`event_registrations\`.
    3. Kiểm tra tính hợp lệ và trạng thái soát vé.
    4. Nếu chưa check-in: Cập nhật \`attended = true\`, ghi nhận thời gian check-in chính xác.
  - **Output:** Màn hình chuyển sang **Xanh lục rực rỡ** trong < 0.2s, phát âm thanh "Bíp" thành công, hiển thị Họ tên đại biểu, Tên doanh nghiệp và Số bàn tiệc VIP.
* **Ngoại lệ (Cảnh báo gian lận):** Nếu vé đã quét trước đó ➔ Màn hình lập tức chuyển sang **Đỏ rực cảnh báo**, phát âm thanh cảnh báo lỗi và hiển thị rõ: "CẢNH BÁO: Vé đã được check-in vào lúc [HH:mm:ss]!".

#### [FR-CHK-02] Vòng Quay Số May Mắn Minh Bạch (Lucky Draw)
* **Actor:** Ban Tổ Chức Gala Đại Hội.
* **Mô tả chi tiết:**
  - **Input:** Mở màn hình Lucky Draw trên CRM, chọn giải thưởng (Giải Đặc Biệt, Giải Nhất, Giải Nhì).
  - **Xử lý logic:** Hệ thống tự động lọc danh sách chỉ gồm những đại biểu **ĐÃ CHECK-IN THỰC TẾ** tại cổng đón tiếp (loại bỏ đại biểu vắng mặt), kích hoạt hoạt ảnh vòng quay số 3D ngẫu nhiên và chọn người trúng thưởng.
  - **Output:** Hiệu ứng pháo hoa chúc mừng, hiển thị Họ tên, Doanh nghiệp và Mã số may mắn của người trúng giải, đồng thời đẩy thông báo chúc mừng tới toàn bộ hội trường.
* **Ngoại lệ:** Chưa có đại biểu nào check-in ➔ Thông báo: "Chưa có dữ liệu đại biểu tham dự để quay thưởng".

---

### 3.8. MODULE 8: QUẢN TRỊ CUỘC HỌP & ĐIỀU HÀNH BAN CHẤP HÀNH (MEETINGS)

#### [FR-MTG-01] Khởi Tạo Lịch Họp Ban Chấp Hành Đa Nền Tảng
* **Actor:** Chủ tịch, Tổng Thư Ký, Admin, Trưởng ban.
* **Mô tả chi tiết:**
  - **Input:** Tiêu đề cuộc họp, Thời gian bắt đầu/kết thúc, Nền tảng tổ chức (Phòng Họp Sapphire Hub UniWork 40 chỗ / Zoom Meetings / Google Meet / UniWork Meet), Danh sách đại biểu triệu tập, Tài liệu đính kèm.
  - **Xử lý logic:**
    1. Kiểm tra thẩm quyền người tạo (Chỉ 4 vai trò được phép).
    2. Chạy thuật toán kiểm tra chống trùng phòng họp Sapphire Hub.
    3. Lưu bản ghi vào \`meetings\`, tự động phát giấy triệu tập vào App Mobile của các đại biểu.
  - **Output:** Cuộc họp được lên lịch thành công, hiển thị đường link họp hoặc địa chỉ phòng họp vật lý.
* **Ngoại lệ:** Trùng lịch phòng họp Sapphire Hub ➔ Hệ thống báo đỏ xung đột và đề xuất dời lịch hoặc đổi sang họp Zoom.

#### [FR-MTG-02] Xử Lý Cuộc Họp Đột Xuất & Xung Đột Lịch (Urgent Meetings)
* **Actor:** Ban Thường Trực, Tổng Thư Ký.
* **Mô tả chi tiết:**
  - **Input:** Bật cờ "Cuộc họp khẩn cấp" (\`isUrgent = true\`), nhập lý do khẩn cấp.
  - **Xử lý logic:** Đánh dấu huy hiệu Đỏ khẩn cấp, kích hoạt tính năng "Liên Hệ Điều Phối" (Gọi điện thoại trực tiếp \`tel:\` hoặc gửi email ưu tiên tới người phụ trách cuộc họp bị xung đột để thống nhất dời lịch).
  - **Output:** Thông báo khẩn cấp được phát toàn hệ thống, cuộc họp ưu tiên được giữ chỗ.
* **Ngoại lệ:** Hủy hoặc dời lịch họp ➔ Tự động gửi thông báo Broadcast cập nhật thời gian mới cho toàn bộ đại biểu.

---

### 3.9. MODULE 9: QUẢN TRỊ CÔNG VIỆC PHÂN CẤP (TASKS 5 VIEW MODES)

#### [FR-TSK-01] Quản Lý Công Việc Đa Dạng 5 Chế Độ Hiển Thị
* **Actor:** Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn.
* **Mô tả chi tiết:**
  - **Input:** Chọn 1 trong 5 chế độ xem:
    1. **Bảng Chi Tiết (Table View):** Hiển thị cột Mã CV, Tên, Ban, Người làm, Deadline, Ưu tiên, Tiến độ slider, Trạng thái, Link họp.
    2. **Lưới Kanban (Kanban Board):** 5 cột trạng thái (\`Chưa làm\`, \`Đang làm\`, \`Chờ duyệt\`, \`Hoàn thành\`, \`Tạm dừng\`) kèm thanh Zoom 3 cấp độ (280px / 345px / 410px).
    3. **Lịch Tháng (Calendar View):** Hiển thị công việc và cuộc họp theo từng ô ngày.
    4. **Biểu Đồ Thống Kê (Statistics Chart View):** Donut phân bổ %, Grouped Bar so sánh khối lượng theo ban, Timeline Gantt.
    5. **Cây Cơ Cấu Tổ Chức (Org Tree View):** Cây phân cấp từ Ban Thường Trực xuống các Ban chuyên trách kèm tỷ lệ hoàn thành trung bình.
  - **Xử lý logic:** Chuyển đổi view mượt mà, lưu trạng thái view yêu thích của người dùng vào LocalStorage.
  - **Output:** Giao diện điều hành công việc trực quan, loại bỏ hoàn toàn tình trạng trôi việc trên Zalo.
* **Ngoại lệ:** Lỗi kết nối mạng ➔ Lưu thao tác tạm thời trên máy khách và đồng bộ lại khi có mạng.

---

### 3.10. MODULE 10: BIỂU QUYẾT & BẦU CỬ ĐẠI HỘI ĐIỆN TỬ (VOTING)

#### [FR-VOT-01] Khởi Tạo Phiên Bầu Cử / Biểu Quyết Đại Hội
* **Actor:** Ban Thư Ký, Ban Quản Trị.
* **Mô tả chi tiết:**
  - **Input:** Tiêu đề biểu quyết, Nội dung tờ trình, Danh sách phương án lựa chọn (Hoặc danh sách ứng viên Ban Chấp Hành), Thời hạn mở/đóng biểu quyết.
  - **Xử lý logic:** Lưu vào bảng \`polls\` và \`poll_options\`, chuyển trạng thái sang \`open\`.
  - **Output:** Phiên biểu quyết xuất hiện tức thì trên màn hình Biểu Quyết của tất cả hội viên.
* **Ngoại lệ:** Đóng biểu quyết thủ công ➔ Hệ thống chốt số liệu và khóa nút bỏ phiếu toàn mạng.

#### [FR-VOT-02] Bỏ Phiếu Biểu Quyết Bảo Mật 1 Người 1 Phiếu
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Chọn phương án biểu quyết (Đồng ý / Không đồng ý / Ý kiến khác), nhấn "Xác Nhận Bỏ Phiếu".
  - **Xử lý logic:**
    1. Kiểm tra xem hội viên đã bỏ phiếu cho phiên này chưa trong bảng \`poll_votes\`.
    2. Nếu chưa: Ghi nhận phiếu bầu, tăng bộ đếm \`votes_count\` của phương án được chọn.
    3. Đánh dấu hội viên đã hoàn thành biểu quyết và khóa nút bấm.
    4. Bắn sự kiện WebSocket cập nhật tỷ lệ % cho máy chủ hiển thị.
  - **Output:** Thông báo: "Quý anh/chị đã biểu quyết thành công!", hiển thị kết quả tổng hợp.
* **Ngoại lệ:** Cố ý gửi nhiều request bỏ phiếu cùng lúc ➔ Database ràng buộc khóa duy nhất \`UNIQUE(poll_id, user_id)\` chặn trùng lặp tuyệt đối.

---

### 3.11. MODULE 11: TÀI CHÍNH, SỔ QUỸ THU CHI & GIA HẠN HỘI PHÍ VIETQR

#### [FR-FIN-01] Tra Cứu & Thanh Toán Hội Phí VietQR Động
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Mở mục Gia hạn hội phí trên App Mobile, chọn kỳ đóng phí thường niên (5.000.000 VNĐ).
  - **Xử lý logic:** Tạo mã VietQR động chuẩn Napas chứa số tài khoản MB Bank \`198388889999\`, chủ tài khoản \`CLB DOANH NHAN 1983\` và cú pháp chuẩn.
  - **Output:** Hiển thị mã QR rõ nét, nút "Tải Mã QR" và nút "Sao Chép Số Tài Khoản".
* **Ngoại lệ:** Lỗi kết nối dịch vụ sinh QR ➔ Hiển thị thông tin chuyển khoản dạng văn bản dự phòng.

#### [FR-FIN-02] Đối Soát & Duyệt Gạch Nợ Thủ Công (Kế Toán CRM)
* **Actor:** Ban Tài Chính, Thủ quỹ CLB.
* **Mô tả chi tiết:**
  - **Input:** Danh sách hóa đơn hội phí chờ gạch nợ (\`/fees\`), kiểm tra khớp lệnh với sao kê ngân hàng MB Bank.
  - **Xử lý logic:** Nhấn nút "Duyệt Gạch Nợ". Hệ thống cập nhật trạng thái hóa đơn sang \`paid\`, tự động gia hạn ngày hết hạn thẻ hội viên thêm +365 ngày.
  - **Output:** Thẻ hội viên trên App Mobile tự động chuyển sang trạng thái "Đã Kích Hoạt", hiển thị biên lai điện tử.
* **Ngoại lệ:** Số tiền chuyển khoản thiếu ➔ Bấm "Cảnh Báo Thiếu Tiền" kèm ghi chú số tiền còn thiếu.

#### [FR-FIN-03] Quản Trị Sổ Quỹ Thu Chi 3 Cấp Duyệt (Cashbook)
* **Actor:** Ban Thiện Nguyện (BTN), Ban Tài Chính (BTC), Ban Quản Trị (BQT).
* **Mô tả chi tiết:**
  - **Input:** Lập phiếu chi hoạt động hoặc từ thiện: Số tiền, Nội dung chi, Người nhận, Chứng từ hóa đơn đính kèm.
  - **Xử lý logic:** Quy trình duyệt 3 cấp nghiêm ngặt: Tạo phiếu (\`pending\`) ➔ Trưởng ban kiểm tra (\`reviewed\`) ➔ Chủ tịch/BQT phê chuẩn (\`approved\`).
  - **Output:** Tiền quỹ tự động trừ vào Sổ quỹ chung, hiển thị trên Báo cáo tài chính minh bạch thời gian thực.
* **Ngoại lệ:** Phiếu chi không có chứng từ hợp lệ ➔ Bị từ chối và ghi rõ lý do trả về người tạo.

---

### 3.12. MODULE 12: QUYỀN LỢI, ƯU ĐÃI SINH NHẬT & NHÀ TÀI TRỢ (PERKS & SPONSORS)

#### [FR-PRK-01] Quản Trị Chương Trình Chúc Mừng Sinh Nhật Tự Động
* **Actor:** Quản trị viên CRM (\`/perks\`).
* **Mô tả chi tiết:**
  - **Input:** Mẫu lời chúc sinh nhật cá nhân hóa, Mã E-Voucher độc quyền (Ví dụ: \`SINHNHAT-CEO1983\`), Giá trị quà tặng (% giảm giá dịch vụ), Thời hạn sử dụng (30 ngày).
  - **Xử lý logic:** Hệ thống tự động quét ngày sinh hội viên mỗi ngày vào lúc 08:00 sáng, kích hoạt Popup chúc mừng sang trọng trên App Mobile của hội viên có sinh nhật trong ngày.
  - **Output:** Hội viên nhận được thiệp chúc mừng mạ vàng từ Chủ tịch và mã voucher quà tặng.
* **Ngoại lệ:** Hội viên chưa cập nhật ngày sinh ➔ Hệ thống hiển thị thông báo nhắc hoàn thiện hồ sơ.

#### [FR-PRK-02] Quản Trị Gói Tài Trợ & Quyền Lợi Nhà Tài Trợ
* **Actor:** Ban Xúc Tiến Thương Mại, Ban Tài Chính.
* **Mô tả chi tiết:**
  - **Input:** Tạo gói tài trợ: Kim Cương, Vàng, Bạc, Đồng kèm quyền lợi (Vị trí logo trên sân khấu, bài phát biểu, gian hàng VIP).
  - **Xử lý logic:** Ghi nhận nhà tài trợ, tự động hiển thị Logo trên Carousel Nhà Tài Trợ Obsidian & Amber Gold trên toàn bộ hệ thống.
  - **Output:** Thương hiệu nhà tài trợ được quảng bá trang trọng và đồng bộ.
* **Ngoại lệ:** Hết hạn hợp đồng tài trợ ➔ Hệ thống tự động chuyển trạng thái sang \`expired\` và hạ banner.

---

### 3.13. MODULE 13: THẺ HỘI VIÊN VIP 3D, DANH THIẾP NFC & PUBLIC VISIT CARD

#### [FR-CRD-01] Hiển Thị Thẻ Hội Viên Điện Tử VIP 3D Chìm Logo
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Mở màn hình Thẻ của tôi (\`/association/card\`).
  - **Xử lý logic:** Hệ thống tải Thẻ VIP hiệu ứng 3D với nền Xanh Navy hoàng gia, Logo doanh nghiệp hòa trộn chìm sang trọng (Screen blend), Mã định danh \`CEO-83xxx\`, Họ tên, Chức vụ và Mã QR cá nhân.
  - **Output:** Thẻ hiển thị sắc nét, có nút lật mặt sau xem hợp đồng gia nhập và thông tin liên hệ.
* **Ngoại lệ:** Chưa có logo doanh nghiệp ➔ Hiển thị logo chuẩn CEO 1983 mặc định.

#### [FR-CRD-02] Danh Thiếp Điện Tử Thông Minh Công Khai (Public Visiting Card)
* **Actor:** Đối tác quét mã QR hoặc chạm thẻ NFC của hội viên.
* **Mô tả chi tiết:**
  - **Input:** Trình duyệt mở đường dẫn công khai \`/card/:code\`.
  - **Xử lý logic:** Hiển thị trang Danh thiếp số tối ưu cho điện thoại: Ảnh đại diện, Họ tên, Công ty, Chức vụ, Số điện thoại, Email, Website, Bản đồ địa chỉ trụ sở và nút "Lưu Danh Bạ Vào Điện Thoại" (file \`.vcf\`).
  - **Output:** Đối tác lưu toàn bộ thông tin liên lạc vào danh bạ điện thoại chỉ sau 1 chạm.
* **Ngoại lệ:** Hội viên bật chế độ riêng tư ẩn số điện thoại ➔ Số điện thoại được ẩn hoặc chuyển thành nút liên hệ qua ban thư ký.

---

### 3.14. MODULE 14: HỘP THƯ DOANH NHÂN VIP MESSENGER & LỊCH HẸN 1-ON-1

#### [FR-MSG-01] Nhắn Tin Doanh Nhân Thời Gian Thực Chuẩn #0084FF
* **Actor:** Hai hội viên chính thức trong mạng lưới.
* **Mô tả chi tiết:**
  - **Input:** Soạn nội dung tin nhắn văn bản, hình ảnh, tài liệu báo giá hoặc ghim vị trí cuộc gặp.
  - **Xử lý logic:** Mã hóa nội dung, truyền tải qua WebSocket Socket.IO thời gian thực, lưu trữ lịch sử tin nhắn trong CSDL.
  - **Output:** Tin nhắn xuất hiện tức thời trên màn hình đối tác kèm âm thanh thông báo nhẹ nhàng.
* **Ngoại lệ:** Người gửi bấm "Thu hồi tin nhắn" ➔ Hệ thống cập nhật trạng thái đã thu hồi và hiển thị "Tin nhắn đã được thu hồi".

#### [FR-MSG-02] Kênh Thông Báo Tự Động Từ Ban Thư Ký CLB (System Channel)
* **Actor:** Hệ thống điều hành hiệp hội.
* **Mô tả chi tiết:**
  - **Input:** Sự kiện thông báo mới từ Ban Chấp Hành (Hội phí thường niên, Giấy mời họp đại hội, Lịch gala).
  - **Xử lý logic:** Tự động phát tin nhắn phong cách Zalo OA vào kênh "Ban Thư Ký CLB Doanh Nhân CEO 1983", luôn được ghim ở vị trí đầu tiên trên Hộp thư của hội viên.
  - **Output:** Thẻ tin nhắn giao dịch hiển thị trang trọng với số tiền, hạn đóng và nút "Thanh Toán VietQR" ngay trong khung chat.
* **Ngoại lệ:** Không thể bỏ ghim hoặc xóa kênh Ban Thư Ký.

---

### 3.15. MODULE 15: TRUYỀN THÔNG, THƯ VIỆN TÀI LIỆU & EMAIL MARKETING

#### [FR-DOC-01] Quản Trị Thư Viện Nghị Quyết & Văn Bản Nội Bộ
* **Actor:** Ban Thư Ký, Ban Quản Trị.
* **Mô tả chi tiết:**
  - **Input:** Tải lên văn bản (PDF, DOCX): Quy chế hoạt động CLB, Nghị quyết đại hội, Biên bản họp ban chấp hành, Báo cáo tài chính năm.
  - **Xử lý logic:** Lưu trữ an toàn trên MinIO S3, phân quyền xem theo cấp bậc hội viên hoặc công khai.
  - **Output:** Văn bản được lưu trữ khoa học, hội viên tra cứu và tải xuống dễ dàng trên App Mobile (\`/association/library\`).
* **Ngoại lệ:** Văn bản mật ➔ Chỉ tài khoản Ban Quản Trị mới có quyền truy cập.

#### [FR-DOC-02] Chiến Dịch Gửi Email Thông Báo Tự Động Hàng Loạt
* **Actor:** Ban Thư Ký, Ban Truyền Thông.
* **Mô tả chi tiết:**
  - **Input:** Soạn nội dung email theo mẫu chuẩn thương hiệu CEO 1983, chọn nhóm người nhận (Toàn thể hội viên / Ban Chấp Hành / Hội viên nợ phí).
  - **Xử lý logic:** Hàng đợi gửi email tự động (Email Dispatch Queue) xử lý qua SMTP Mailer với độ trễ an toàn chống spam.
  - **Output:** Email gửi đến hòm thư tất cả hội viên, báo cáo thống kê tỷ lệ gửi thành công.
* **Ngoại lệ:** Địa chỉ email không tồn tại ➔ Ghi nhận vào nhật ký lỗi và gắn cờ cảnh báo trên CRM.

---

### 3.16. MODULE 16: QUẢN TRỊ NỀN TẢNG & NHẬT KÝ KIỂM TOÁN (PLATFORM & AUDIT)

#### [FR-SYS-01] Nhật Ký Kiểm Toán Bất Biến (Immutable Audit Logs)
* **Actor:** Hệ thống ghi nhận tự động.
* **Mô tả chi tiết:**
  - **Input:** Mọi hành động trọng yếu: Đăng nhập, Duyệt kết nạp, Sửa điểm danh, Thay đổi số tiền quỹ, Biểu quyết, Phân quyền.
  - **Xử lý logic:** Tự động ghi lại Actor ID, Hành động, Thời gian chính xác (Timestamp), Địa chỉ IP, Trình duyệt và Dữ liệu trước/sau khi thay đổi vào bảng \`audit_logs\`.
  - **Output:** Bảng nhật ký kiểm toán không thể xóa hoặc chỉnh sửa (\`/platform/audit\`), phục vụ công tác thanh tra minh bạch của Ban Kiểm Tra Hiệp Hội.
* **Ngoại lệ:** Kể cả Superadmin cũng không có quyền chỉnh sửa nội dung bản ghi Audit Log.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 4.1. Hiệu Năng & Khả Năng Mở Rộng (Performance & Scalability)
* **Thời gian phản hồi API:** Tối đa 200ms cho 95% các yêu cầu truy vấn chuẩn (P95 < 200ms); tối đa 500ms cho các truy vấn phức tạp hoặc báo cáo tài chính.
* **Tốc độ xác thực vé Gate Check-in:** Quét và trả về kết quả Hợp lệ/Trùng lặp trong vòng < 0.2 giây để đảm bảo không ùn tắc tại cửa sự kiện Gala 500 người.
* **Chịu tải đồng thời:** Hệ thống chịu tải tối thiểu 1,000 người dùng hoạt động đồng thời (Concurrent Users) và 10,000 phiên biểu quyết/phút trong thời gian diễn ra đại hội.
* **Tối ưu hóa tài nguyên:** Tỷ lệ nén ảnh webp/avif tự động, caching bằng Redis/In-memory và nén Brotli/Gzip tại Nginx Gateway.

### 4.2. Bảo Mật & An Toàn Thông Tin (Security & Privacy)
* **Mã hóa dữ liệu:** 100% kết nối bắt buộc qua giao thức bảo mật HTTPS/WSS với chứng chỉ mã hóa TLS 1.3.
* **Mật khẩu người dùng:** Băm mật khẩu bằng thuật toán \`bcrypt\` với Salt Rounds = 10, tuyệt đối không lưu trữ văn bản thô (Plaintext).
* **Kiểm soát phiên làm việc:** Sử dụng Access Token thời hạn ngắn (15 phút) và Refresh Token lưu trữ bảo mật (HttpOnly Cookie hoặc Storage mã hóa).
* **Phòng chống tấn công:**
  - Rate Limiting: Giới hạn tối đa 100 requests/phút/IP đối với các endpoint công khai và 5 lần thử đăng nhập sai/15 phút.
  - Chống SQL Injection bằng Prisma Parameterized Queries.
  - Chống Cross-Site Scripting (XSS) và Cross-Site Request Forgery (CSRF).
  - Tách biệt dữ liệu nhạy cảm theo phân vùng bảo mật Row Level Security.

### 4.3. Tính Khả Dụng & Trải Nghiệm Người Dùng (Usability & Design)
* **Bảng màu nhận diện chuẩn mực:** Tuân thủ triệt để bảng màu Deep Cobalt Navy (\`#003B95\`) và Warm Amber Gold (\`#F59E0B\`). Tuyệt đối không dùng nút màu đen tuyền (\`#000000\`) hay màu cam chói lóa trên giao diện điều hành.
* **Tối ưu hóa Bảng dữ liệu CRM:** Bảng dữ liệu lớn (>6 cột) phải có thanh cuộn ngang \`min-w-[1050px]\`, cố định Cột STT sát lề trái và Cột Thao tác sát lề phải, hỗ trợ Tooltip hiển thị đầy đủ văn bản bị rút gọn.
* **Chuẩn PWA Di Động:** Hỗ trợ cài đặt "Add to Home Screen" trên cả iOS Safari và Android với biểu tượng chính thức độ nét cao và khởi động toàn màn hình (Standalone mode).

### 4.4. Độ Tin Cậy & Khôi Phục Thảm Họa (Reliability & Disaster Recovery)
* **Độ sẵn sàng (Uptime SLA):** Cam kết tỷ lệ hoạt động liên tục đạt tối thiểu 99.9% (ngoại trừ các kỳ bảo trì định kỳ có thông báo trước).
* **Bảo toàn dữ liệu (ACID Compliance):** Các giao dịch tài chính, sổ quỹ và điểm danh sử dụng PostgreSQL Database Transactions đảm bảo tính toàn vẹn 100%.
* **Chiến lược Sao lưu Dự phòng (Backup Policy):**
  - Sao lưu tự động CSDL hàng ngày (\`pg_dump\`) vào lúc 02:00 sáng.
  - Bản sao lưu được mã hóa và lưu trữ tại 2 vùng địa lý độc lập.
  - Thời gian khôi phục thảm họa mục tiêu: RTO < 30 phút, RPO < 24 giờ.

---

## 5. YÊU CẦU GIAO TIẾP HỆ THỐNG (SYSTEM INTERFACES)

### 5.1. Cổng Thanh Toán VietQR Napas 24/7
* **Nhà cung cấp:** VietQR Standard (Napas / MB Bank).
* **Mục đích:** Sinh mã QR chuyển khoản ngân hàng động cho hội phí thường niên và vé sự kiện có thu phí.
* **Đặc tả dữ liệu:** Ngân hàng thụ hưởng: MB Bank; Số tài khoản: \`198388889999\`; Chủ tài khoản: \`CLB DOANH NHAN 1983\`.
* **Cơ chế xử lý:** Hệ thống sinh mã QR động; Kế toán đối soát sao kê ngân hàng và bấm duyệt gạch nợ thủ công trong CRM (\`/fees\`).

### 5.2. Máy Chủ Thư Tín Điện Tử (SMTP Mailer Gateway)
* **Nhà cung cấp:** Google Workspace SMTP Relay (\`smtp.gmail.com:465\`).
* **Mục đích:** Gửi thư tiếp nhận đơn đăng ký, thư phát hành tài khoản mật khẩu, giấy triệu tập cuộc họp và hóa đơn hội phí.
* **Cơ chế bảo mật:** Xác thực SSL/TLS với Mật khẩu ứng dụng chuyên dụng (App Password).

### 5.3. Hệ Thống Lưu Trữ Tệp Đối Tượng (MinIO S3 Compatible Storage)
* **Giao thức:** Amazon S3 REST API Protocol.
* **Mục đích:** Lưu trữ an toàn các tệp hình ảnh đại diện, ảnh bìa, logo công ty, ảnh banner sự kiện và tệp tài liệu PDF nội bộ.
* **Địa chỉ lưu trữ:** \`vione-bucket\` phân quyền truy cập theo đường dẫn có chữ ký số (Presigned URLs) đối với tài liệu mật.

### 5.4. Cổng Hội Nghị Trực Tuyến (Meeting Platforms Interface)
* **Nền tảng hỗ trợ:** Zoom Meetings (\`https://zoom.us/j/\`), Google Meet (\`https://meet.google.com/\`) và UniWork Meet.
* **Cơ chế:** Lưu trữ mã phòng họp, tạo liên kết truy cập an toàn và nhúng vào lịch công tác của đại biểu.

---

## 6. PHÊ DUYỆT TÀI LIỆU (APPROVAL & SIGN-OFF)

| Đại Diện Ban Chấp Hành CLB CEO 1983 | Đại Diện Đơn Vị Phát Triển ViConnect |
| :---: | :---: |
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br><br>**Chủ Tịch CLB Doanh Nhân CEO 1983** | <br><br><br>**Trưởng Ban Kiến Trúc Hệ Thống ViConnect** |
`;
}

// ----------------------------------------------------------------------------
// 2. GENERATE COMPREHENSIVE HDSD TRAINING HTML
// ----------------------------------------------------------------------------
function generateHdsdHtml() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TÀI LIỆU HƯỚNG DẪN SỬ DỤNG VÀ ĐÀO TẠO VẬN HÀNH HỆ THỐNG CLB DOANH NHÂN CEO 1983</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; background: #0A1128; color: #1E293B; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11pt; line-height: 1.6; }
    
    .trn-doc { width: 100%; max-width: 960px; margin: 0 auto; background: #FFFFFF; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    
    /* Cover Page - Đúng chuẩn 1 trang A4 297mm */
    .cover {
      width: 100%;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      background: linear-gradient(135deg, #001233 0%, #002255 45%, #003B95 80%, #001A4D 100%);
      color: #FFFFFF;
      padding: 48px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .cover::before {
      content: "";
      position: absolute;
      top: -100px; right: -100px;
      width: 450px; height: 450px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0) 70%);
      border-radius: 50%;
    }
    .cover .accent-bar { width: 70px; height: 5px; background: linear-gradient(90deg, #F59E0B, #FBBF24); border-radius: 3px; margin-bottom: 20px; }
    .cover .header { display: flex; justify-content: space-between; font-size: 10pt; color: #94A3B8; font-weight: 600; letter-spacing: 0.5px; }
    .cover .header span { color: #F59E0B; font-weight: 700; }
    .cover .divider { height: 1px; background: rgba(255, 255, 255, 0.15); margin: 18px 0 24px; }
    
    .cover .badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #FBBF24;
      padding: 5px 16px;
      border-radius: 9999px;
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .cover .project-title { font-size: 24pt; font-weight: 900; line-height: 1.25; margin: 0 0 12px 0; color: #FFFFFF; }
    .cover .project-title .gold { color: #F59E0B; text-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
    .cover .project-title .sub { display: block; font-size: 14pt; font-weight: 600; color: #93C5FD; margin-top: 8px; }
    .cover .subtitle { font-size: 10.5pt; color: #CBD5E1; line-height: 1.6; max-width: 820px; margin-bottom: 20px; }
    
    .cover .meta-info { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 18px 24px; margin-top: 10px; }
    .cover .meta-info table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    .cover .meta-info td { padding: 5px 0; color: #E2E8F0; }
    .cover .meta-info td.label { color: #94A3B8; width: 180px; font-weight: 500; }
    .cover .meta-info td strong { color: #FFFFFF; }
    .cover .footer { display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 14px; margin-top: 20px; }
    
    /* Document Body & Typography */
    .trn-section { padding: 36px 48px; border-bottom: 1px solid #E2E8F0; position: relative; }
    .trn-tag { display: inline-block; background: #003B95; color: #FFFFFF; font-size: 8.5pt; font-weight: 800; padding: 3px 12px; border-radius: 6px; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase; }
    .trn-h2 { font-size: 16pt; font-weight: 900; color: #001A4D; margin: 0 0 6px 0; line-height: 1.3; }
    .trn-h3 { display: block; font-size: 10.5pt; font-weight: 600; color: #475569; margin-bottom: 16px; }
    .trn-goal { background: #F0F7FF; border-left: 4px solid #003B95; padding: 12px 18px; border-radius: 0 10px 10px 0; margin-bottom: 16px; font-size: 10pt; color: #1E3A8A; line-height: 1.55; }
    .trn-path { background: #F8FAFC; border: 1px dashed #CBD5E1; padding: 9px 15px; border-radius: 8px; font-size: 9pt; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace; color: #0F172A; }
    .trn-path strong { color: #003B95; }
    
    .trn-sec-title { font-size: 12pt; font-weight: 800; color: #002255; margin: 20px 0 10px 0; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; }
    ol.trn-steps, ul.trn-steps { padding-left: 22px; margin: 10px 0 16px 0; }
    ol.trn-steps li, ul.trn-steps li { margin-bottom: 8px; font-size: 10pt; color: #334155; }
    ol.trn-steps li strong, ul.trn-steps li strong { color: #0F172A; }
    
    .box-blue { background: #EFF6FF; border: 1px solid #BFDBFE; border-left: 4px solid #2563EB; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #1E3A8A; margin: 14px 0; line-height: 1.55; }
    .box-warn { background: #FFFBEB; border: 1px solid #FDE68A; border-left: 4px solid #D97706; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #92400E; margin: 14px 0; line-height: 1.55; }
    .box-green { background: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #16A34A; border-radius: 8px; padding: 12px 18px; font-size: 9.5pt; color: #14532D; margin: 14px 0; line-height: 1.55; }

    table.tb { width: 100%; border-collapse: collapse; margin: 14px 0 18px; font-size: 9.5pt; }
    table.tb th { background: #001A4D; color: #FFFFFF; font-weight: 700; text-align: left; padding: 8px 12px; border: 1px solid #CBD5E1; }
    table.tb td { padding: 8px 12px; border: 1px solid #CBD5E1; color: #334155; }
    table.tb tr:nth-child(even) { background: #F8FAFC; }
    
    /* Desktop Full Screenshots */
    .shot-wrap { page-break-inside: avoid; break-inside: avoid; margin: 16px 0; }
    .shot { border: 1px solid #CBD5E1; border-radius: 10px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 14px; }
    .shot img { width: 100%; height: auto; display: block; }
    .shot figcaption { font-size: 9pt; color: #475569; padding: 8px 14px; background: #F8FAFC; border-top: 1px solid #E2E8F0; line-height: 1.45; }
    .shot figcaption strong { color: #003B95; }
    
    /* MOBILE PHONE MOCKUP (Crucial Mandate: Display in true vertical phone proportions) */
    .shot-mobile-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
      align-items: flex-start;
      margin: 18px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .shot-mobile-card {
      width: 275px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 12px;
    }
    .phone-mockup {
      width: 100%;
      background: #0B1329;
      border: 8px solid #1E293B;
      border-radius: 36px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
    }
    .phone-mockup::before {
      content: "";
      display: block;
      width: 90px;
      height: 16px;
      background: #000000;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      z-index: 10;
    }
    .phone-mockup img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 26px;
      background: #FFFFFF;
    }
    .phone-caption {
      font-size: 8.5pt;
      color: #475569;
      text-align: center;
      margin-top: 10px;
      line-height: 1.4;
      padding: 0 6px;
    }
    .phone-caption strong { color: #003B95; }
    
    /* TOC */
    .toc-title { font-size: 18pt; font-weight: 900; margin: 8px 0 10px; padding-bottom: 8px; border-bottom: 3px solid #003B95; color: #001A4D; }
    .toc-subtitle { font-size: 10pt; color: #64748B; margin-bottom: 16px; }
    .toc-list { display: flex; flex-direction: column; gap: 6px; }
    .toc-item { display: flex; align-items: center; gap: 12px; padding: 8px 14px; border-radius: 8px; text-decoration: none; color: #001A4D; border: 1px solid #E2E8F0; background: #FFFFFF; }
    .toc-index { min-width: 28px; font-size: 10pt; font-weight: 800; color: #003B95; }
    .toc-text { font-size: 10pt; font-weight: 600; flex: 1; }
    
    /* End Page */
    .doc-end { padding: 24px 48px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 9pt; color: #64748B; }

    /* Print Styles A4 */
    @page { size: A4; margin: 16mm 12mm 18mm 12mm; }
    @page :first { margin: 0; }
    @media print {
      html, body { background: #FFF !important; margin: 0; padding: 0; }
      .trn-doc { width: auto; max-width: none; margin: 0; box-shadow: none; }
      .cover { width: 210mm !important; height: 297mm !important; margin: 0 !important; page-break-after: always; break-after: page; }
      .trn-section { page-break-before: always; break-before: page; padding-bottom: 6mm; }
      #toc { page-break-after: always; break-after: page; }
      .shot-wrap, .trn-sec-title, .trn-goal, .box-blue, .box-warn, .box-green, .shot-mobile-grid { page-break-inside: avoid; break-inside: avoid; }
      a { color: inherit !important; text-decoration: none !important; }
    }
  </style>
</head>
<body>

<article class="trn-doc">

  <!-- ===================================================================== -->
  <!-- 1. COVER PAGE (ĐÚNG 1 TRANG A4 297MM KHI IN)                           -->
  <!-- ===================================================================== -->
  <section class="cover" id="cover">
    <div>
      <div class="accent-bar"></div>
      <div class="header">
        <div>MÃ TÀI LIỆU: <span>HDSD-CEO1983-PRO-V5.0</span></div>
        <div>HỆ SINH THÁI HIỆP HỘI DOANH NHÂN CEO 1983</div>
      </div>
      <div class="divider"></div>
      
      <div class="badge">TÀI LIỆU ĐÀO TẠO & HƯỚNG DẪN SỬ DỤNG CHÍNH THỨC</div>
      
      <h1 class="project-title">
        CẨM NANG VẬN HÀNH <span class="gold">CRM HIỆP HỘI</span> & <br>
        ỨNG DỤNG DI ĐỘNG <span class="gold">CEO 1983</span>
        <span class="sub">Hội Tụ Doanh Nhân 1983 — Kết Nối Sức Mạnh, Kiến Tạo Tương Lai</span>
      </h1>
      
      <p class="subtitle">
        Tài liệu cẩm nang nghiệp vụ trực quan toàn diện dành cho Ban Quản Trị, Ban Thư Ký, 6 Ban Chuyên Môn và Toàn thể Hội viên Doanh nhân CLB CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA). Hướng dẫn thao tác chi tiết từng bước, tích hợp minh chứng ảnh thực tế cho toàn bộ phân hệ Web CRM và App Di Động.
      </p>
    </div>

    <div>
      <div class="meta-info">
        <table>
          <tr>
            <td class="label">Cơ quan chủ quản:</td>
            <td><strong>CLB Doanh Nhân CEO 1983 (HanoiBA)</strong></td>
          </tr>
          <tr>
            <td class="label">Đơn vị phát triển:</td>
            <td><strong>ViConnect Platform & Ban Chuyển Đổi Số</strong></td>
          </tr>
          <tr>
            <td class="label">Phiên bản tài liệu:</td>
            <td><strong>Version 5.0 — Master Production Release</strong></td>
          </tr>
          <tr>
            <td class="label">Hệ thống áp dụng:</td>
            <td><strong>Web CRM Quản Trị & App Mobile Hội Viên CEO 1983</strong></td>
          </tr>
          <tr>
            <td class="label">Ngày hiệu lực:</td>
            <td><strong>04/10/2026</strong></td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <div>© 2026 CLB Doanh Nhân CEO 1983 · Bản quyền thuộc HanoiBA</div>
        <div>Tiêu chuẩn tài liệu Playbook 18 & UNICOM System</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- 2. MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)                              -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="toc">
    <div class="toc-title">MỤC LỤC NỘI DUNG ĐÀO TẠO</div>
    <div class="toc-subtitle">Bao gồm 16 chương nghiệp vụ tuần tự từ Cổng thông tin, Web CRM đến App Mobile Hội viên</div>
    
    <div class="toc-list">
      <a href="#sec-01" class="toc-item"><span class="toc-index">01</span><span class="toc-text">Cổng Thông Tin Công Khai & Nộp Đơn Đăng Ký Gia Nhập Trực Tuyến</span></a>
      <a href="#sec-02" class="toc-item"><span class="toc-index">02</span><span class="toc-text">Đăng Nhập Cổng Quản Trị CRM & Tổng Quan Bàn Làm Việc Dashboard</span></a>
      <a href="#sec-03" class="toc-item"><span class="toc-index">03</span><span class="toc-text">Quản Trị Danh Bạ Hội Viên 360° & Quy Trình Thẩm Định Kết Nạp (BTV)</span></a>
      <a href="#sec-04" class="toc-item"><span class="toc-index">04</span><span class="toc-text">Đăng Nhập App Di Động CEO 1983 & Đổi Mật Khẩu Lần Đầu</span></a>
      <a href="#sec-05" class="toc-item"><span class="toc-index">05</span><span class="toc-text">Trang Chủ Hội Viên, Cập Nhật Nhanh Hồ Sơ & Đếm Chỉ Số B2B</span></a>
      <a href="#sec-06" class="toc-item"><span class="toc-index">06</span><span class="toc-text">Thẻ Hội Viên VIP 3D Chìm Logo & Danh Thiếp Số Công Khai (NFC)</span></a>
      <a href="#sec-07" class="toc-item"><span class="toc-index">07</span><span class="toc-text">Danh Bạ Hội Viên, Mời Gặp 1-on-1 & Quản Lý Tab "Đã Gửi Kết Nối"</span></a>
      <a href="#sec-08" class="toc-item"><span class="toc-index">08</span><span class="toc-text">Hộp Thư Doanh Nhân Messenger #0084FF & Kênh Ban Thư Ký Zalo OA</span></a>
      <a href="#sec-09" class="toc-item"><span class="toc-index">09</span><span class="toc-text">Tạo Sự Kiện Gala & Thiết Kế Sơ Đồ Chỗ Ngồi Cinema Seating Map</span></a>
      <a href="#sec-10" class="toc-item"><span class="toc-index">10</span><span class="toc-text">Đăng Ký Tham Dự Sự Kiện & Phát Hành Vé Mời Điện Tử E-Ticket QR</span></a>
      <a href="#sec-11" class="toc-item"><span class="toc-index">11</span><span class="toc-text">Vận Hành Cổng Soát Vé An Ninh Gate Check-in QR & Quay Số May Mắn</span></a>
      <a href="#sec-12" class="toc-item"><span class="toc-index">12</span><span class="toc-text">Gian Hàng B2B Doanh Nhân CEO 1983 & Khớp Lệnh Cơ Hội Cung - Cầu</span></a>
      <a href="#sec-13" class="toc-item"><span class="toc-index">13</span><span class="toc-text">Quản Lý Hội Phí Thường Niên VietQR & Đối Soát Gạch Nợ Thủ Công</span></a>
      <a href="#sec-14" class="toc-item"><span class="toc-index">14</span><span class="toc-text">Điều Hành Cuộc Họp Ban Chấp Hành & Chống Trùng Phòng Sapphire Hub</span></a>
      <a href="#sec-15" class="toc-item"><span class="toc-index">15</span><span class="toc-text">Quản Trị Công Việc Phân Cấp (Tasks 5 View Modes: Kanban Zoom, Org Tree)</span></a>
      <a href="#sec-16" class="toc-item"><span class="toc-index">16</span><span class="toc-text">Biểu Quyết Đại Hội Điện Tử, Thư Viện Tài Liệu & Ma Trận Phân Quyền RBAC</span></a>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 1: CỔNG THÔNG TIN CÔNG KHAI & ĐĂNG KÝ HỘI VIÊN                  -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-01">
    <div class="trn-tag">CHƯƠNG 01 · TIẾP NHẬN ỨNG VIÊN</div>
    <h2 class="trn-h2">Cổng Thông Tin Công Khai & Nộp Đơn Đăng Ký Gia Nhập Trực Tuyến</h2>
    <span class="trn-h3">Giới thiệu tôn chỉ CLB và quy trình nộp hồ sơ xét duyệt hội viên chính thức</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp các doanh nhân sinh năm 1983 tìm hiểu về CLB Doanh Nhân CEO 1983 (HanoiBA), đăng ký gia nhập câu lạc bộ trực tuyến và tự động nhận email xác nhận tiếp nhận hồ sơ.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng thông tin công khai CLB CEO 1983 ➔ Nút "Đăng Ký Gia Nhập"
    </div>

    <div class="trn-sec-title">1. Quy Trình Thao Tác Chi Tiết (4 Bước)</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Truy cập Cổng thông tin điện tử CLB Doanh Nhân CEO 1983. Xem thông điệp Chủ tịch, các số liệu thống kê hội viên và hoạt động 6 Ban chuyên môn.</li>
      <li><strong>Bước 2:</strong> Nhấn nút <strong>"Đăng Ký Gia Nhập"</strong> màu vàng kim trên thanh điều hướng.</li>
      <li><strong>Bước 3:</strong> Điền đầy đủ thông tin vào mẫu đăng ký điện tử:
        <ul>
          <li>Họ và tên ứng viên: <em>Phạm Văn Vũ</em></li>
          <li>Ngày tháng năm sinh: <em>09/01/1983</em> (Bắt buộc xác thực tiêu chuẩn sinh năm 1983)</li>
          <li>Số điện thoại & Email: <em>0901201983</em> / <em>vupv090120@gmail.com</em></li>
          <li>Doanh nghiệp & Mã số thuế: <em>Cty CP Công nghệ VIO CONNECT</em> / <em>0109831983</em></li>
          <li>Chức vụ & Ban chuyên môn nguyện vọng sinh hoạt.</li>
        </ul>
      </li>
      <li><strong>Bước 4:</strong> Bấm <strong>"Gửi Hồ Sơ Đăng Ký Gia Nhập"</strong>. Hệ thống tiếp nhận hồ sơ, chuyển trạng thái sang <em>Chờ thẩm định</em> và tự động phát email biên nhận qua hòm thư ứng viên.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_01_landing_ceo1983_hero.png" alt="Cổng thông tin điện tử CLB Doanh Nhân CEO 1983">
        <figcaption><strong>Hình 1.1:</strong> Giao diện Cổng thông tin điện tử chính thức CLB Doanh Nhân CEO 1983</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_02_member_registration_form_filled.png" alt="Mẫu đăng ký gia nhập hội viên trực tuyến">
        <figcaption><strong>Hình 1.2:</strong> Mẫu biểu nộp hồ sơ đăng ký gia nhập hội viên CEO 1983 trực tuyến</figcaption>
      </div>
    </div>

    <div class="box-green">
      <strong>KẾT QUẢ ĐẠT ĐƯỢC:</strong> Hồ sơ được ghi nhận vào CSDL trung tâm, máy chủ gửi thư tự động phát thư xác nhận đến email \`vupv090120@gmail.com\` kèm mã số hồ sơ tra cứu.
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 2: ĐĂNG NHẬP CỔNG CRM & BÀN LÀM VIỆC DASHBOARD                  -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-02">
    <div class="trn-tag">CHƯƠNG 02 · CRM QUẢN TRỊ</div>
    <h2 class="trn-h2">Đăng Nhập Cổng Quản Trị CRM & Tổng Quan Bàn Làm Việc Dashboard</h2>
    <span class="trn-h3">Truy cập hệ thống điều hành trung tâm dành cho Ban Quản Trị và Ban Thư Ký</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Cung cấp cái nhìn toàn cảnh về tình hình hội viên, quỹ tài chính, tiến độ sự kiện và phễu giao thương B2B của toàn hiệp hội.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng Quản Trị CRM ➔ Đăng nhập (\`/auth\`) ➔ Bàn làm việc (\`/\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Đăng Nhập & Theo Dõi Chỉ Số</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Mở Cổng Quản Trị Web CRM. Nhập Email quản trị (ví dụ: \`admin@connect.vn\`) và Mật khẩu bảo mật.</li>
      <li><strong>Bước 2:</strong> Nhấn nút <strong>"Đăng Nhập Quản Trị"</strong>. Hệ thống kiểm tra quyền hạn và tạo phiên làm việc bảo mật.</li>
      <li><strong>Bước 3:</strong> Tại Bàn làm việc Dashboard, theo dõi 4 khối chỉ số KPI then chốt:
        <ul>
          <li><strong>Tổng số hội viên:</strong> Số lượng hội viên chính thức và số hồ sơ đang chờ duyệt.</li>
          <li><strong>Tài chính quỹ:</strong> Tổng thu hội phí, số dư quỹ thiện nguyện và chi phí vận hành.</li>
          <li><strong>Sự kiện Gala:</strong> Số lượng đại biểu đã đăng ký và tỷ lệ check-in thời gian thực.</li>
          <li><strong>Giao thương B2B:</strong> Tổng số sản phẩm đang niêm yết và giá trị thương vụ đã kết nối.</li>
        </ul>
      </li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_04_crm_login_screen.png" alt="Màn hình đăng nhập Cổng Quản Trị CRM">
        <figcaption><strong>Hình 2.1:</strong> Màn hình Đăng nhập Cổng Quản Trị Web CRM CEO 1983 an toàn</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_05_crm_dashboard_overview.png" alt="Bàn làm việc Dashboard điều hành CRM">
        <figcaption><strong>Hình 2.2:</strong> Bàn làm việc Dashboard tổng quan chỉ số hoạt động CLB Doanh Nhân CEO 1983</figcaption>
      </div>
    </div>

    <div class="box-blue">
      <strong>QUY CHUẨN THIẾT KẾ GIAO DIỆN CRM:</strong> Toàn bộ giao diện áp dụng chuẩn phong cách Xanh Navy (\`#003B95\`) và Vàng Champagne Gold, loại bỏ hoàn toàn các nút đen u ám và nút cam chói lóa. Bảng dữ liệu có thanh cuộn ngang cố định Cột STT và Cột Thao tác.
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 3: QUẢN TRỊ HỘI VIÊN 360 & THẨM ĐỊNH KẾT NẠP BTV                -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-03">
    <div class="trn-tag">CHƯƠNG 03 · BAN THÀNH VIÊN (BTV)</div>
    <h2 class="trn-h2">Quản Trị Danh Bạ Hội Viên 360° & Quy Trình Thẩm Định Kết Nạp</h2>
    <span class="trn-h3">Thẩm quyền độc quyền của Ban Thành Viên (BTV) trong việc kiểm duyệt và cấp mã hội viên</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Đảm bảo 100% hồ sơ kết nạp được thẩm định chính xác về mặt pháp lý doanh nghiệp và tiêu chuẩn sinh năm 1983; tự động cấp Mã hội viên định danh (\`CEO-83xxx\`) và gửi email thông báo mật khẩu khởi tạo.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng Quản Trị CRM ➔ Menu "Hội Viên" ➔ Mục "Danh sách hội viên" (\`/members\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Thẩm Định Hồ Sơ Mới (4 Bước)</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Trưởng Ban Thành Viên (\`ceo.thanhvien@ceo1983.com\`) đăng nhập CRM, chọn tab <strong>"Chờ Thẩm Định"</strong>.</li>
      <li><strong>Bước 2:</strong> Nhấp vào tên ứng viên <em>Phạm Văn Vũ</em> để mở ngăn kéo (Drawer) thẩm định chi tiết 360 độ: xem mã số thuế, chức vụ, hồ sơ công ty và nguyện vọng chuyên ban.</li>
      <li><strong>Bước 3:</strong> Nhấn nút <strong>"Phê Duyệt Kết Nạp"</strong> màu xanh Navy.</li>
      <li><strong>Bước 4:</strong> Hệ thống tự động:
        <ul>
          <li>Cấp Mã định danh độc bản: <strong>CEO-83007</strong>.</li>
          <li>Kích hoạt tài khoản và băm mật khẩu ngẫu nhiên an toàn.</li>
          <li>Máy chủ SMTP phát thư điện tử chào mừng chính thức kèm thông tin đăng nhập đến hòm thư \`vupv090120@gmail.com\`.</li>
        </ul>
      </li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_06_crm_members_pending_list.png" alt="Danh sách hồ sơ chờ thẩm định BTV">
        <figcaption><strong>Hình 3.1:</strong> Danh sách hồ sơ hội viên chờ thẩm định tại Ban Thành Viên</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_07_crm_member_detail_drawer.png" alt="Ngăn kéo thẩm định hồ sơ hội viên 360 độ">
        <figcaption><strong>Hình 3.2:</strong> Ngăn kéo Drawer thẩm định chi tiết hồ sơ ứng viên và xác minh thông tin doanh nghiệp</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_09_email_template_credentials_sent_vu.png" alt="Email tự động gửi thông tin tài khoản">
        <figcaption><strong>Hình 3.3:</strong> Mẫu email tự động gửi thông báo kết nạp thành công và mật khẩu khởi tạo cho hội viên</figcaption>
      </div>
    </div>

    <div class="box-warn">
      <strong>RÀNG BUỘC PHÂN QUYỀN TUYỆT ĐỐI:</strong> Ban Thư Ký (BTK) KHÔNG có thẩm quyền bấm duyệt kết nạp hội viên. Nếu tài khoản thư ký cố tình thao tác, hệ thống sẽ chặn và hiển thị thông báo phân quyền an toàn.
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 4: ĐĂNG NHẬP APP DI ĐỘNG CEO 1983 & ĐỔI MẬT KHẨU                -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-04">
    <div class="trn-tag">CHƯƠNG 04 · APP DI ĐỘNG CEO 1983</div>
    <h2 class="trn-h2">Đăng Nhập App Di Động CEO 1983 & Đổi Mật Khẩu Lần Đầu</h2>
    <span class="trn-h3">Trải nghiệm ứng dụng di động dành cho doanh nhân hội viên chính thức</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Hướng dẫn hội viên đăng nhập ứng dụng trên điện thoại thông minh bằng mật khẩu tạm thời được cấp và thiết lập mật khẩu cá nhân mới để kích hoạt bảo mật.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Mở App CEO 1983 trên điện thoại ➔ Màn hình đăng nhập (\`/association/login\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Thao Tác Trên Điện Thoại</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Mở ứng dụng CEO 1983. Nhập Số điện thoại/Email và Mật khẩu khởi tạo được gửi trong email chào mừng.</li>
      <li><strong>Bước 2:</strong> Nhấn nút <strong>"Đăng Nhập"</strong>.</li>
      <li><strong>Bước 3:</strong> Màn hình yêu cầu <strong>"Đổi Mật Khẩu Lần Đầu"</strong> tự động xuất hiện. Nhập mật khẩu cũ và thiết lập mật khẩu mới (tối thiểu 8 ký tự).</li>
      <li><strong>Bước 4:</strong> Bấm <strong>"Kích Hoạt Tài Khoản"</strong> để hoàn tất và truy cập vào không gian làm việc hội viên.</li>
    </ol>

    <!-- HIỂN THỊ CHUẨN PHONE MOCKUP MOBILE PORTRAIT -->
    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_10_app_login_screen.png" alt="Màn hình đăng nhập App CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 4.1:</strong> Màn hình Đăng nhập App Di Động CEO 1983</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_11_app_login_filled_vu.png" alt="Điền thông tin đăng nhập">
        </div>
        <div class="phone-caption"><strong>Hình 4.2:</strong> Nhập thông tin đăng nhập chính danh</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_12_app_onboarding_password_change.png" alt="Đổi mật khẩu khởi tạo">
        </div>
        <div class="phone-caption"><strong>Hình 4.3:</strong> Thiết lập mật khẩu mới an toàn</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 5: TRANG CHỦ HỘI VIÊN, PROFILE NHANH & CHỈ SỐ B2B              -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-05">
    <div class="trn-tag">CHƯƠNG 05 · APP DI ĐỘNG CEO 1983</div>
    <h2 class="trn-h2">Trang Chủ Hội Viên, Cập Nhật Nhanh Hồ Sơ & Đếm Chỉ Số B2B</h2>
    <span class="trn-h3">Trung tâm điều hành cá nhân của doanh nhân trên ứng dụng di động</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp hội viên nắm bắt nhanh các tin tức hiệp hội, theo dõi lịch sự kiện sắp diễn ra, đếm cơ hội kinh doanh đang mở và chỉnh sửa thông tin đại diện theo phong cách Facebook tức thì.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Tab "Trang Chủ" trên thanh điều hướng dưới đáy ứng dụng (\`/association\`)
    </div>

    <div class="trn-sec-title">1. Các Thành Phần Trọng Tâm Tại Trang Chủ</div>
    <ul class="trn-steps">
      <li><strong>Header Nhận Diện:</strong> Hiển thị Logo CEO 1983 sắc nét, chuông thông báo cá nhân hóa và nút "Liên Hệ Trực Tiếp" mở bảng thông tin liên lạc Ban Thư Ký.</li>
      <li><strong>Thẻ Hội Viên Tóm Tắt:</strong> Hiển thị Họ tên, Mã hội viên (ví dụ: \`CEO-83007\`), chức vụ doanh nghiệp và nút "Chỉnh sửa nhanh". Bấm vào mở modal chỉnh sửa ảnh đại diện, ảnh bìa, số điện thoại và logo công ty tức thì.</li>
      <li><strong>Huy Hiệu Chỉ Số B2B:</strong> Các badge thống kê cơ hội kinh doanh đang mở và sản phẩm đang bán được đóng gói gọn gàng bên trong thẻ, không tràn viền.</li>
      <li><strong>Lối Tắt Tác Vụ Nhanh (Quick Pills):</strong> Nút Quét mã QR check-in sự kiện, Đóng hội phí VietQR, Mạng lưới đối tác và Sàn B2B.</li>
    </ul>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_13_app_home_dashboard.png" alt="Trang chủ Hội viên CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 5.1:</strong> Trang chủ Hội viên Doanh nhân CEO 1983</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_30_app_member_profile_edit.png" alt="Chỉnh sửa nhanh hồ sơ doanh nhân">
        </div>
        <div class="phone-caption"><strong>Hình 5.2:</strong> Bảng chỉnh sửa nhanh ảnh đại diện & logo</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 6: THẺ HỘI VIÊN VIP 3D & DANH THIẾP SỐ NFC                     -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-06">
    <div class="trn-tag">CHƯƠNG 06 · ĐỊNH DANH SỐ VIP</div>
    <h2 class="trn-h2">Thẻ Hội Viên VIP 3D Chìm Logo & Danh Thiếp Số Công Khai (NFC)</h2>
    <span class="trn-h3">Định danh doanh nhân cao cấp với công nghệ chạm NFC 1 giây và mã QR cá nhân</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Tạo dựng niềm tự hào hội viên qua thẻ điện tử 3D sang trọng, hỗ trợ kết nối đối tác nhanh chóng qua công nghệ chạm thẻ NFC hoặc quét mã QR danh thiếp công khai.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Tab "Thẻ VIP" (\`/association/card\`) hoặc đường dẫn công khai \`/card/:code\`
    </div>

    <div class="trn-sec-title">1. Hướng Dẫn Sử Dụng Thẻ Điện Tử & NFC</div>
    <ol class="trn-steps">
      <li><strong>Xem Thẻ 3D:</strong> Mở tab Thẻ VIP. Thẻ được thiết kế theo tỷ lệ thẻ ngân hàng chuẩn quốc tế, nền Xanh Navy phối Vàng Amber Gold, chìm Logo doanh nghiệp với hiệu ứng Screen Blend tinh tế.</li>
      <li><strong>Lật Mặt Sau Thẻ:</strong> Chạm nhẹ vào thẻ để lật xem mặt sau chứa Điều lệ hội viên, thời hạn thẻ và mã QR quét định danh.</li>
      <li><strong>Chạm Thẻ NFC:</strong> Khi gặp đối tác tại hội thảo, đưa mặt thẻ vật lý chạm vào lưng điện thoại đối tác (hỗ trợ cả iPhone và Android), điện thoại đối tác tự động mở trang Danh thiếp số công khai.</li>
      <li><strong>Lưu Danh Bạ Tự Động:</strong> Đối tác chỉ cần bấm nút <strong>"Lưu Danh Bạ"</strong> để lưu đầy đủ Họ tên, Số điện thoại, Email, Chức vụ và Địa chỉ công ty vào danh bạ điện thoại trong 1 giây.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_26_app_vip_3d_card.png" alt="Thẻ Hội viên VIP 3D CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 6.1:</strong> Thẻ Hội viên VIP 3D chìm logo doanh nghiệp</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_27_public_digital_card_web.png" alt="Trang danh thiếp số công khai">
        </div>
        <div class="phone-caption"><strong>Hình 6.2:</strong> Danh thiếp số công khai quét qua mã QR / NFC</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 7: DANH BẠ HỘI VIÊN & TAB ĐÃ GỬI KẾT NỐI                       -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-07">
    <div class="trn-tag">CHƯƠNG 07 · KẾT NỐI B2B</div>
    <h2 class="trn-h2">Danh Bạ Hội Viên, Mời Gặp 1-on-1 & Quản Lý Tab "Đã Gửi Kết Nối"</h2>
    <span class="trn-h3">Mạng lưới hơn 500+ lãnh đạo doanh nghiệp và công cụ điều phối cuộc hẹn giao thương</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp hội viên dễ dàng tra cứu đối tác theo ngành nghề, gửi lời mời giao thương 1-on-1 và theo dõi trạng thái lời mời tại tab "Đã gửi kết nối".
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Tab "Hội Viên" trên App Mobile (\`/association/members\`)
    </div>

    <div class="trn-sec-title">1. Thao Tác Gửi Lời Mời & Theo Dõi Kết Nối</div>
    <ol class="trn-steps">
      <li><strong>Tìm Kiếm & Lọc:</strong> Sử dụng thanh tìm kiếm nhanh theo tên CEO hoặc chọn bộ lọc ngành nghề (Công nghệ, Bất động sản, Xây dựng, Tài chính...).</li>
      <li><strong>Gửi Lời Mời Kết Nối:</strong> Bấm biểu tượng <strong>"Bắt Tay (Handshake)"</strong> tại thẻ hội viên. Ngăn kéo B2B Connect mở ra: chọn mục đích hợp tác, đính kèm cơ hội kinh doanh và bấm "Gửi Đề Xuất".</li>
      <li><strong>Quản Lý Tab "Đã Gửi Kết Nối":</strong> Mở tab "Đã gửi kết nối" để theo dõi 3 trạng thái:
        <ul>
          <li><strong>Đang chờ:</strong> Đối tác chưa phản hồi. Có sẵn nút <strong>"Hủy"</strong> để rút lại lời mời nếu bấm nhầm.</li>
          <li><strong>Đã chấp nhận:</strong> Đối tác đã đồng ý. Có sẵn nút <strong>"Nhắn tin"</strong> để mở cuộc trò chuyện ngay.</li>
          <li><strong>Đã từ chối:</strong> Hiển thị rõ ràng nếu đối tác chưa sắp xếp được lịch.</li>
        </ul>
      </li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app1983_03_members_directory.png" alt="Danh bạ hội viên CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 7.1:</strong> Danh bạ Hội viên CLB CEO 1983</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app1983_04_member_profile_modal.png" alt="Chi tiết hồ sơ đối tác">
        </div>
        <div class="phone-caption"><strong>Hình 7.2:</strong> Hồ sơ chi tiết đối tác và đề xuất kết nối B2B</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 8: HỘP THƯ MESSENGER & KÊNH BAN THƯ KÝ ZALO OA                 -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-08">
    <div class="trn-tag">CHƯƠNG 08 · TRÒ CHUYỆN REALTIME</div>
    <h2 class="trn-h2">Hộp Thư Doanh Nhân Messenger #0084FF & Kênh Ban Thư Ký Zalo OA</h2>
    <span class="trn-h3">Không gian trao đổi bảo mật thời gian thực, thẻ mời họp B2B và kênh ghim chính thức</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Tạo kênh liên lạc kinh doanh tập trung giữa các hội viên và nhận các thông báo điều hành chính thức từ Ban Thư Ký với định dạng thẻ giao dịch Zalo OA chuyên nghiệp.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Tab "Tin Nhắn" trên App Mobile (\`/association/messages\`)
    </div>

    <div class="trn-sec-title">1. Tính Năng Nổi Bật Trên Hộp Thư Doanh Nhân</div>
    <ul class="trn-steps">
      <li><strong>Kênh Ghim Số 1 - Ban Thư Ký CLB:</strong> Luôn nằm cố định trên cùng với huy hiệu xác thực. Nhận thông báo đóng phí niên liễm, giấy triệu tập đại hội và thông báo khẩn cấp.</li>
      <li><strong>Thẻ Giao Dịch Zalo OA:</strong> Thông báo hội phí hiển thị số tiền in đậm, thông tin tài khoản MB Bank và nút "Thanh Toán VietQR" trực tiếp trong khung chat.</li>
      <li><strong>Thẻ Mời Họp B2B Tương Tác:</strong> Khi gửi lời mời gặp mặt, tin nhắn hiển thị dưới dạng card tương tác với thời gian, địa điểm và nút "Đồng Ý / Từ Chối" trực tiếp.</li>
      <li><strong>Tính Năng An Toàn:</strong> Hỗ trợ thu hồi tin nhắn, gửi ảnh độ nét cao và nhật ký cuộc gọi trao đổi.</li>
    </ul>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app1983_15_messages_secretary.png" alt="Hộp thư tin nhắn Ban Thư Ký">
        </div>
        <div class="phone-caption"><strong>Hình 8.1:</strong> Hộp thư Messenger & Kênh Ban Thư Ký ghim trên cùng</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app_step_10_chat_conversation.png" alt="Cuộc trò chuyện trao đổi B2B">
        </div>
        <div class="phone-caption"><strong>Hình 8.2:</strong> Giao diện trò chuyện thời gian thực chuẩn #0084FF</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 9: TẠO SỰ KIỆN GALA & SƠ ĐỒ CHỖ NGỒI SEATING MAP               -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-09">
    <div class="trn-tag">CHƯƠNG 09 · QUẢN LÝ SỰ KIỆN CRM</div>
    <h2 class="trn-h2">Tạo Sự Kiện Gala & Thiết Kế Sơ Đồ Chỗ Ngồi Cinema Seating Map</h2>
    <span class="trn-h3">Công cụ điều phối đại hội quy mô lớn và bố trí bàn tiệc VIP trực quan</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Khởi tạo sự kiện đa bước, cấu hình vé có phí/miễn phí và sắp xếp vị trí chỗ ngồi đại biểu chính xác theo sơ đồ bàn tiệc, triệt tiêu tình trạng tranh chấp chỗ ngồi.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng Quản Trị CRM ➔ Menu "Sự Kiện" (\`/events\`) ➔ Nút "Tạo Sự Kiện" & Tab "Seating Map"
    </div>

    <div class="trn-sec-title">1. Quy Trình Khởi Tạo & Thiết Kế Sơ Đồ Chỗ Ngồi</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Bấm nút <strong>"Tạo Sự Kiện Mới"</strong> trên CRM. Nhập tên sự kiện (ví dụ: <em>Đêm Gala Hội Ngộ Doanh Nhân CEO 1983</em>), thời gian, địa điểm khách sạn và tải banner 16:9.</li>
      <li><strong>Bước 2:</strong> Thiết lập các loại vé: Vé VIP Dạ Tiệc (1.500.000 VNĐ) và Vé Tiêu Chuẩn Hội Viên (0 VNĐ).</li>
      <li><strong>Bước 3:</strong> Mở công cụ <strong>Cinema Seating Map</strong>:
        <ul>
          <li>Kéo thả bố trí các bàn tròn VIP 10 chỗ (Bàn VIP 01, Bàn VIP 02...) gần sân khấu.</li>
          <li>Bố trí các dãy ghế đại biểu danh dự và dãy hội viên.</li>
          <li>Gán trực tiếp từng hội viên vào vị trí ghế cụ thể.</li>
        </ul>
      </li>
      <li><strong>Bước 4:</strong> Bấm <strong>"Lưu & Kích Hoạt Sự Kiện"</strong>. Hệ thống tự động đồng bộ số bàn vào vé E-Ticket của từng đại biểu.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_18_crm_event_create_paid_modal.png" alt="Khởi tạo sự kiện trên CRM">
        <figcaption><strong>Hình 9.1:</strong> Cửa sổ thiết lập thông tin sự kiện Gala và cấu hình biểu phí vé</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_31_crm_cinema_seating_map.png" alt="Sơ đồ chỗ ngồi Cinema Seating Map">
        <figcaption><strong>Hình 9.2:</strong> Giao diện thiết kế sơ đồ chỗ ngồi bàn tiệc VIP Cinema Seating Map trực quan</figcaption>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 10: ĐĂNG KÝ SỰ KIỆN & PHÁT HÀNH VÉ QR E-TICKET                 -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-10">
    <div class="trn-tag">CHƯƠNG 10 · VÉ ĐIỆN TỬ APP</div>
    <h2 class="trn-h2">Đăng Ký Tham Dự Sự Kiện & Phát Hành Vé Mời Điện Tử E-Ticket QR</h2>
    <span class="trn-h3">Thao tác giữ chỗ và nhận vé điện tử an toàn ngay trên điện thoại hội viên</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp hội viên đăng ký tham gia các chương trình của hiệp hội và nhận vé E-Ticket chứa mã QR mã hóa cùng số bàn tiệc đã được xếp sẵn.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Tab "Sự Kiện" trên App Mobile (\`/association/events\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Đăng Ký & Nhận Vé Mời E-Ticket</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Mở mục Sự Kiện trên App Mobile, chọn sự kiện Gala mong muốn tham gia.</li>
      <li><strong>Bước 2:</strong> Xem chi tiết nội dung chương trình, diễn giả và thời gian biểu.</li>
      <li><strong>Bước 3:</strong> Bấm <strong>"Đăng Ký Tham Dự"</strong>. Nếu là vé có phí, hệ thống hiển thị mã VietQR chuyển khoản nhanh; nếu là vé đặc quyền hội viên, hệ thống xác nhận ngay lập tức.</li>
      <li><strong>Bước 4:</strong> Vé mời điện tử E-Ticket QR xuất hiện trên màn hình: hiển thị Mã vé, Mã QR chống giả mạo, Họ tên đại biểu, Tên doanh nghiệp và <strong>Vị trí Bàn VIP</strong>.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app1983_07_events_list.png" alt="Lịch sự kiện trên App Mobile">
        </div>
        <div class="phone-caption"><strong>Hình 10.1:</strong> Danh sách sự kiện hoạt động CLB CEO 1983</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app1983_08_event_ticket_qr.png" alt="Vé mời điện tử E-Ticket QR">
        </div>
        <div class="phone-caption"><strong>Hình 10.2:</strong> Vé mời điện tử E-Ticket QR Pass kèm số bàn VIP</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 11: CỔNG AN NINH SOÁT VÉ GATE CHECK-IN QR & LUCKY DRAW          -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-11">
    <div class="trn-tag">CHƯƠNG 11 · AN NINH & QUAY SỐ</div>
    <h2 class="trn-h2">Vận Hành Cổng Soát Vé An Ninh Gate Check-in QR & Quay Số May Mắn</h2>
    <span class="trn-h3">Nghiệp vụ đón tiếp đại biểu tốc độ cao & quay thưởng đại hội minh bạch</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Ban Truyền Thông và Lễ tân soát vé đại biểu < 0.2s tại cổng Gala, tự động nhận diện vé hợp lệ/vé trùng và nạp danh sách đại biểu tham dự thực tế vào Vòng quay số may mắn.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng Quản Trị CRM ➔ Mục "Soát Vé Sự Kiện" (\`/checkin\`) & Tab "Lucky Draw"
    </div>

    <div class="trn-sec-title">1. Quy Trình Soát Vé Tại Cửa Đón Tiếp</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Mở màn hình Soát vé an ninh Gate Check-in (\`/checkin\`) trên máy tính bảng hoặc máy tính có camera tại bàn đón tiếp.</li>
      <li><strong>Bước 2:</strong> Hướng camera vào mã QR E-Ticket trên điện thoại của đại biểu.</li>
      <li><strong>Bước 3:</strong> Xử lý kết quả phản hồi tức thời:
        <ul>
          <li><strong>Màn hình Xanh Lục (Hợp lệ):</strong> Phản hồi trong 0.2s, hiển thị Họ tên đại biểu, Tên doanh nghiệp và Vị trí Bàn tiệc. Lễ tân hướng dẫn đại biểu vào đúng bàn.</li>
          <li><strong>Màn hình Đỏ Rực (Cảnh báo vé trùng):</strong> Phát âm thanh cảnh báo, hiển thị: <em>"CẢNH BÁO: Vé này đã được check-in lúc [HH:mm:ss]!"</em> để ngăn chặn gian lận.</li>
        </ul>
      </li>
      <li><strong>Bước 4:</strong> Vòng quay số may mắn Lucky Draw tự động đồng bộ danh sách những người ĐÃ CHECK-IN THỰC TẾ tại cửa để quay thưởng trên màn hình lớn sân khấu.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_23_crm_gate_checkin_scanner.png" alt="Giao diện máy quét soát vé Gate Check-in">
        <figcaption><strong>Hình 11.1:</strong> Cổng an ninh soát vé thông minh Gate Check-in QR tại sự kiện Gala</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_24_checkin_valid_green_success.png" alt="Màn hình soát vé xanh hợp lệ">
        <figcaption><strong>Hình 11.2:</strong> Màn hình phản hồi Xanh lục hợp lệ kèm thông tin vị trí bàn tiệc VIP</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_25_checkin_duplicate_red_alert.png" alt="Màn hình cảnh báo vé trùng">
        <figcaption><strong>Hình 11.3:</strong> Màn hình Đỏ rực cảnh báo gian lận khi phát hiện vé đã quét trước đó</figcaption>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 12: GIAN HÀNG B2B DOANH NHÂN & CƠ HỘI CUNG - CẦU                -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-12">
    <div class="trn-tag">CHƯƠNG 12 · XÚC TIẾN THƯƠNG MẠI</div>
    <h2 class="trn-h2">Gian Hàng B2B Doanh Nhân CEO 1983 & Khớp Lệnh Cơ Hội Cung - Cầu</h2>
    <span class="trn-h3">Thúc đẩy giao thương nội khối, giới thiệu sản phẩm và đàm phán hợp đồng B2B</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp các doanh nghiệp hội viên quảng bá sản phẩm với chính sách trợ giá nội bộ, tiếp nhận đơn hàng và khớp nối các cơ hội Cung - Cầu 1-on-1 có định giá thương vụ cụ thể.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Tab "Sản Phẩm" (\`/association/products\`) & Tab "Cơ Hội" (\`/association/opportunities\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Đăng Bán & Khớp Lệnh Giao Thương</div>
    <ol class="trn-steps">
      <li><strong>Đăng Sản Phẩm B2B:</strong> Nhấn nút "Đăng sản phẩm mới". Nhập tên hàng hóa, giá niêm yết, tỷ lệ chiết khấu đặc quyền cho CEO 1983 (ví dụ: giảm 20%), tải ảnh sản phẩm và gửi Ban Xúc Tiến thẩm định.</li>
      <li><strong>Mua Hàng & Đàm Phán:</strong> Người mua xem chi tiết sản phẩm, nhấn nút "Nhắn tin đàm phán" để mở khung chat trực tiếp với CEO bán hàng.</li>
      <li><strong>Đăng Nhu Cầu Cung - Cầu:</strong> Mở mục "Cơ Hội B2B", đăng nhu cầu cần mua vật tư hoặc tìm đối tác liên danh, nhập giá trị thương vụ ước tính (ví dụ: 500.000.000 VNĐ).</li>
      <li><strong>Tiếp Nhận Cơ Hội:</strong> Doanh nghiệp có năng lực bấm "Tiếp nhận cơ hội" để khớp lệnh và nhận thông tin liên hệ bảo mật.</li>
    </ol>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_28_app_marketplace_b2b.png" alt="Gian hàng B2B Doanh nhân CEO 1983">
        </div>
        <div class="phone-caption"><strong>Hình 12.1:</strong> Gian hàng B2B Doanh nhân CEO 1983</div>
      </div>

      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/live_29_app_opportunities_feed_1on1.png" alt="Bảng tin cơ hội kinh doanh Cung - Cầu">
        </div>
        <div class="phone-caption"><strong>Hình 12.2:</strong> Bảng tin Cơ hội Cung - Cầu & Định giá thương vụ</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 13: QUẢN LÝ HỘI PHÍ VIETQR & ĐỐI SOÁT GẠCH NỢ                   -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-13">
    <div class="trn-tag">CHƯƠNG 13 · TÀI CHÍNH & HỘI PHÍ</div>
    <h2 class="trn-h2">Quản Lý Hội Phí Thường Niên VietQR & Đối Soát Gạch Nợ Thủ Công</h2>
    <span class="trn-h3">Quy trình nộp hội phí niên liễm và cơ chế đối soát sao kê minh bạch của Kế toán</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Tạo điều kiện cho hội viên nộp hội phí nhanh chóng bằng mã VietQR ngân hàng, đồng thời hỗ trợ Kế toán đối soát sao kê và gạch nợ chuẩn xác trong CRM.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> App Mobile (\`/association/renew\`) ➔ Web CRM Menu "Tài Chính" (\`/fees\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Đóng Phí & Gạch Nợ (5 Bước)</div>
    <ol class="trn-steps">
      <li><strong>Hội viên quét mã VietQR:</strong> Hội viên mở mục Đóng Hội Phí trên App Mobile, chọn kỳ đóng phí 5.000.000 VNĐ. Hệ thống hiển thị mã VietQR động chứa sẵn số tài khoản MB Bank và nội dung chuyển khoản.</li>
      <li><strong>Thực hiện chuyển khoản:</strong> Hội viên dùng App Ngân hàng quét mã và xác nhận chuyển khoản.</li>
      <li><strong>Kế toán kiểm tra sao kê:</strong> Ban Kế toán đăng nhập Web CRM, mở màn hình "Quản Lý Hội Phí" (\`/fees\`), đối chiếu số tiền và cú pháp chuyển khoản với sao kê ngân hàng MB Bank.</li>
      <li><strong>Bấm nút Duyệt Gạch Nợ:</strong> Kế toán bấm "Duyệt Gạch Nợ". Hệ thống tự động gia hạn thêm +365 ngày sử dụng Thẻ VIP cho hội viên.</li>
      <li><strong>Phát hành biên lai:</strong> Hệ thống chuyển trạng thái sang \`paid\` và gửi hóa đơn xác nhận đến hội viên.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_34_crm_fees_vietqr_cashbook.png" alt="Quản lý hội phí và sổ quỹ trên CRM">
        <figcaption><strong>Hình 13.1:</strong> Màn hình Quản trị Hội phí thường niên và đối soát sao kê trên Web CRM</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_20_guest_paid_vietqr_payment_modal.png" alt="Mã thanh toán VietQR ngân hàng">
        <figcaption><strong>Hình 13.2:</strong> Mã thanh toán VietQR động kèm cú pháp chuyển khoản chuẩn Napas</figcaption>
      </div>
    </div>

    <div class="box-warn">
      <strong>LƯU Ý NGHIỆP VỤ KẾ TOÁN:</strong> Hiện tại hệ thống sử dụng cơ chế tạo mã QR động kèm đối soát thủ công. Kế toán bắt buộc phải kiểm tra tiền về trên tài khoản ngân hàng thực tế trước khi bấm duyệt gạch nợ trên phần mềm.
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 14: ĐIỀU HÀNH CUỘC HỌP & CHỐNG TRÙNG PHÒNG SAPPHIRE              -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-14">
    <div class="trn-tag">CHƯƠNG 14 · BAN THƯ KÝ (BTK)</div>
    <h2 class="trn-h2">Điều Hành Cuộc Họp Ban Chấp Hành & Chống Trùng Phòng Sapphire Hub</h2>
    <span class="trn-h3">Lên lịch họp ban chấp hành, tích hợp Zoom/Meet và thuật toán chống xung đột phòng</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp Ban Thư Ký quản lý lịch họp giao ban, triệu tập đại biểu, chống trùng lịch phòng họp vật lý Sapphire Hub và xử lý các cuộc họp đột xuất quan trọng.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng Quản Trị CRM ➔ Menu "Cuộc Họp" (\`/meetings\`)
    </div>

    <div class="trn-sec-title">1. Quy Trình Khởi Tạo & Điều Phối Lịch Họp</div>
    <ol class="trn-steps">
      <li><strong>Bước 1:</strong> Bấm nút <strong>"Tạo Cuộc Họp Mới"</strong> trên CRM. Chọn hình thức: <em>Phòng Họp Sapphire UniWork Hub (40 chỗ)</em>, <em>Zoom Meetings</em>, <em>Google Meet</em> hoặc <em>UniWork Meet</em>.</li>
      <li><strong>Bước 2:</strong> Nhập ngày giờ bắt đầu, thời lượng và danh sách đại biểu triệu tập.</li>
      <li><strong>Bước 3:</strong> Thuật toán tự động quét lịch: nếu phòng Sapphire Hub đã có cuộc họp khác trong khung giờ đó, hệ thống sẽ cảnh báo đỏ và chặn tạo lịch trùng.</li>
      <li><strong>Bước 4:</strong> Đối với cuộc họp khẩn cấp, bật cờ \`isUrgent\`, sử dụng nút "Liên Hệ Điều Phối" để gọi điện hoặc gửi email ưu tiên thương lượng dời lịch cuộc họp thường.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_32_crm_meetings_calendar.png" alt="Lịch điều hành cuộc họp trên CRM">
        <figcaption><strong>Hình 14.1:</strong> Lịch điều hành cuộc họp Ban Chấp Hành và điều phối phòng họp Sapphire Hub</figcaption>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 15: QUẢN TRỊ CÔNG VIỆC PHÂN CẤP (TASKS 5 VIEW MODES)           -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-15">
    <div class="trn-tag">CHƯƠNG 15 · ĐIỀU HÀNH TÁC NGHIỆP</div>
    <h2 class="trn-h2">Quản Trị Công Việc Phân Cấp (Tasks 5 View Modes: Kanban Zoom, Org Tree)</h2>
    <span class="trn-h3">Đóng gói công việc khoa học theo 5 chế độ hiển thị chuyên sâu</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Giúp Ban Quản Trị và các Trưởng ban giao việc, kiểm soát tiến độ, đôn đốc công việc quá hạn và theo dõi hiệu suất hoàn thành của 6 Ban chuyên môn.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> Cổng Quản Trị CRM ➔ Menu "Công Việc" (\`/tasks\`)
    </div>

    <div class="trn-sec-title">1. Khám Phá 5 Chế Độ Xem Công Việc</div>
    <ul class="trn-steps">
      <li><strong>Chế độ 1 - Bảng Chi Tiết (Table View):</strong> Xem đầy đủ cột thông tin: Tên công việc, Ban phụ trách, Người thực hiện, Deadline, Mức ưu tiên, Tiến độ % và Nút vào phòng họp.</li>
      <li><strong>Chế độ 2 - Lưới Kanban Kéo Thả (Kanban Board):</strong> Kéo thả thẻ việc qua 5 cột trạng thái. Đặc biệt có thanh điều khiển <strong>Zoom Kích Thước</strong> 3 cấp độ: Thu nhỏ (280px), Tiêu chuẩn (345px), Phóng to (410px) chống tràn màn hình.</li>
      <li><strong>Chế độ 3 - Lịch Công Tác (Calendar View):</strong> Xem khối lượng công việc và cuộc họp phân bổ theo từng ngày trong tháng.</li>
      <li><strong>Chế độ 4 - Biểu Đồ Thống Kê (Statistics Chart View):</strong> Phân tích chuyên sâu với Recharts: Biểu đồ Donut cơ cấu trạng thái, Grouped Bar so sánh khối lượng giữa các ban và biểu đồ Gantt Timeline.</li>
      <li><strong>Chế độ 5 - Cây Cơ Cấu Tổ Chức (Org Tree View):</strong> Cây phân cấp từ Ban Thường Trực xuống các Ban chuyên trách kèm tỷ lệ hoàn thành trung bình.</li>
    </ul>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/crm_tasks_management.png" alt="Quản lý công việc Kanban trên CRM">
        <figcaption><strong>Hình 15.1:</strong> Bảng quản trị công việc phân cấp đa dạng chế độ hiển thị trên Web CRM</figcaption>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- CHƯƠNG 16: BIỂU QUYẾT ĐẠI HỘI, TÀI LIỆU & MA TRẬN RBAC                -->
  <!-- ===================================================================== -->
  <section class="trn-section" id="sec-16">
    <div class="trn-tag">CHƯƠNG 16 · BẦU CỬ & HỆ THỐNG</div>
    <h2 class="trn-h2">Biểu Quyết Đại Hội Điện Tử, Thư Viện Tài Liệu & Ma Trận Phân Quyền RBAC</h2>
    <span class="trn-h3">Nền tảng dân chủ đại hội, lưu trữ văn bản pháp lý và kiểm soát an toàn bảo mật</span>

    <div class="trn-goal">
      <strong>Mục tiêu nghiệp vụ:</strong> Tổ chức các phiên bỏ phiếu bầu cử đại hội trực tuyến minh bạch 1 người 1 phiếu, quản lý thư viện tài liệu nghị quyết và cấu hình phân quyền 5 cấp bậc cho đội ngũ điều hành.
    </div>

    <div class="trn-path">
      <strong>Vị trí truy cập:</strong> CRM Menu "Biểu Quyết" (\`/voting\`), "Tài Liệu" (\`/documents\`) & "Phân Quyền" (\`/permissions\`)
    </div>

    <div class="trn-sec-title">1. Các Thao Tác Nghiệp Vụ Cốt Lõi</div>
    <ol class="trn-steps">
      <li><strong>Khởi tạo & Bỏ phiếu biểu quyết:</strong> Ban Thư Ký tạo cuộc biểu quyết trên CRM, thiết lập các phương án lựa chọn. Hội viên mở App Mobile (\`/association/voting\`) để bỏ phiếu bảo mật. Kết quả tỷ lệ % được cập nhật nhảy động thời gian thực trên màn hình lớn.</li>
      <li><strong>Thư viện nghị quyết & Văn bản:</strong> Ban Thư Ký tải lên các văn bản quy chế, nghị quyết đại hội (PDF/DOCX) lên kho MinIO S3. Hội viên dễ dàng tra cứu trên App Mobile (\`/association/library\`).</li>
      <li><strong>Ma trận phân quyền RBAC 5 Cấp Bậc:</strong> Ban Quản Trị cấu hình quyền hạn tại \`/permissions\`: kiểm soát quyền Xem, Sửa, Xóa, Phân quyền cho từng vị trí lãnh đạo trong 6 Ban chuyên môn.</li>
    </ol>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_33_crm_online_voting.png" alt="Quản lý biểu quyết trên CRM">
        <figcaption><strong>Hình 16.1:</strong> Trung tâm điều hành biểu quyết và bầu cử đại hội trực tuyến trên Web CRM</figcaption>
      </div>
    </div>

    <div class="shot-wrap">
      <div class="shot">
        <img src="images/evidence/live_35_crm_rbac_roles_permissions.png" alt="Ma trận phân quyền RBAC trên CRM">
        <figcaption><strong>Hình 16.2:</strong> Ma trận phân quyền 5 cấp bậc vai trò x tính năng trên Web CRM CEO 1983</figcaption>
      </div>
    </div>

    <div class="shot-mobile-grid">
      <div class="shot-mobile-card">
        <div class="phone-mockup">
          <img src="images/evidence/app1983_13_voting_online.png" alt="Biểu quyết trên App Mobile">
        </div>
        <div class="phone-caption"><strong>Hình 16.3:</strong> Giao diện biểu quyết đại hội điện tử trên App Mobile</div>
      </div>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- TRANG KẾT THÚC & XÁC NHẬN BÀN GIAO                                   -->
  <!-- ===================================================================== -->
  <section class="doc-end">
    <div>
      <strong>TỔNG KẾT BÀN GIAO TÀI LIỆU HUẤN LUYỆN:</strong><br>
      Tài liệu này được xuất bản theo tiêu chuẩn Playbook 18 & UNICOM System.<br>
      Bảo mật & Lưu hành nội bộ CLB Doanh Nhân CEO 1983 (HanoiBA).
    </div>
    <div style="text-align: right;">
      <strong>ĐẠI DIỆN HỘI ĐỒNG NGHIỆM THU</strong><br>
      Ban Quản Trị CLB CEO 1983 & ViConnect Platform<br>
      <em>Hà Nội, ngày 04 tháng 10 năm 2026</em>
    </div>
  </section>

</article>

</body>
</html>
`;
}

// ----------------------------------------------------------------------------
// 3. MAIN EXECUTION & FILE SAVING
// ----------------------------------------------------------------------------
async function main() {
  console.log('1. Đang tạo nội dung Markdown SRS IEEE 830...');
  const srsContent = generateSrsMarkdown();
  
  const srsDocsPath = path.resolve(__dirname, '../docs/SRS_IEEE830_CEO1983_TOAN_DIEN.md');
  const srsPublicPath = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/SRS_IEEE830_CEO1983_TOAN_DIEN.md');
  
  fs.writeFileSync(srsDocsPath, srsContent, 'utf8');
  fs.writeFileSync(srsPublicPath, srsContent, 'utf8');
  console.log(`   -> Đã lưu SRS Markdown tại: ${srsDocsPath} (${Buffer.byteLength(srsContent, 'utf8')} bytes)`);
  console.log(`   -> Đã đồng bộ SRS Markdown sang public/docs: ${srsPublicPath}`);

  console.log('2. Đang tạo nội dung HTML Hướng Dẫn Sử Dụng Chuẩn Hóa...');
  const hdsdContent = generateHdsdHtml();
  
  const hdsdDocsPath = path.resolve(__dirname, '../docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');
  const hdsdPublicPath = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');

  fs.writeFileSync(hdsdDocsPath, hdsdContent, 'utf8');
  fs.writeFileSync(hdsdPublicPath, hdsdContent, 'utf8');
  console.log(`   -> Đã lưu HDSD HTML tại: ${hdsdDocsPath} (${Buffer.byteLength(hdsdContent, 'utf8')} bytes)`);
  console.log(`   -> Đã đồng bộ HDSD HTML sang public/docs: ${hdsdPublicPath}`);

  console.log('\n>>> HOÀN TẤT XUẤT BẢN THÀNH CÔNG 100%! <<<');
}

main().catch(err => {
  console.error('Lỗi khi thực thi script:', err);
  process.exit(1);
});
