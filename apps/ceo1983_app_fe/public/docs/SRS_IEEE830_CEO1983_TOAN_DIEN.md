# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## HỆ THỐNG QUẢN TRỊ & ỨNG DỤNG DOANH NHÂN CLB CEO 1983 (HANOIBA)
### Tiêu Chuẩn Quốc Tế IEEE 830 — Phiên Bản Master Hoàn Chỉnh

---

### THÔNG TIN DỰ ÁN (PROJECT METADATA)
* **Tên dự án:** Hệ Sinh Thái Số Hóa & Quản Trị Hiệp Hội Doanh Nhân CEO 1983 (CEO 1983 Association Ecosystem).
* **Mục tiêu cốt lõi:** Số hóa 100% hồ sơ hội viên, tự động hóa quy trình thẩm định kết nạp, quản trị sổ quỹ và thu hội phí thường niên, kiểm soát an ninh sự kiện qua mã QR Pass tốc độ cao, tổ chức biểu quyết đại hội minh bạch và thúc đẩy mạng lưới giao thương nội khối B2B.
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA).
* **Đơn vị tư vấn & phát triển:** ViConnect Platform & Ban Công Nghệ Chuyển Đổi Số.
* **Mã tài liệu:** `SRS-IEEE830-CEO1983-MASTER-V5.0`
* **Phiên bản:** `Version 5.0 (Master Release — Đầy Đủ Chi Tiết & Khớp Kỹ Thuật 100%)`
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
| **Cấp 1: Quản Trị Tối Cao** | `quan_tri` / `superadmin` | Chủ tịch CLB, Ban Thường Trực | Toàn quyền cấu hình hệ thống, xem, sửa, xóa, phân bổ vai trò và phê duyệt ngân sách/sự kiện cấp cao nhất. |
| **Cấp 2: Quản Trị Vận Hành** | `admin` | Giám đốc điều hành, Phó Chủ tịch phụ trách | Xem, sửa, phân quyền tài khoản chuyên ban, điều hành các hoạt động tác nghiệp hàng ngày. |
| **Cấp 3: Tổng Thư Ký** | `tong_thu_ky` / `btk` | Tổng Thư Ký, Chánh Văn Phòng | Khởi tạo và điều phối cuộc họp, quản lý phòng họp Sapphire Hub, ban hành nghị quyết, văn bản. **Tuyệt đối KHÔNG có quyền phê duyệt kết nạp hội viên.** |
| **Cấp 4: Trưởng Ban Chuyên Môn** | `truong_ban` (`btv`, `btn`, `btt`, `bxt`, `btc`) | Lãnh đạo 6 Ban chuyên trách | Quản lý nghiệp vụ chuyên biệt của từng ban: BTV độc quyền duyệt hội viên; BXT duyệt sàn B2B; BTT soát vé; BTN/BTC duyệt chi tiêu sổ quỹ. |
| **Cấp 5: Hội Viên Chính Thức** | `member` | 500+ Doanh nhân CEO 1983 chính danh | Sử dụng App Mobile: Thẻ VIP, danh bạ, đặt vé sự kiện, đăng sản phẩm B2B, trao đổi cơ hội, bỏ phiếu biểu quyết và nộp hội phí. |
| **Cấp 0: Khách Vãng Lai** | `guest` | Doanh nhân 1983 ứng viên, khách mời | Xem cổng thông tin công khai, gửi đơn đăng ký gia nhập CLB, đăng ký vé sự kiện mở rộng. |

#### Ma Trận Trách Nhiệm RACI Trong 6 Ban Chuyên Môn:
1. **Ban Quản Trị (BQT):** Accountable (A) toàn diện mọi quyết định tổ chức và ngân sách.
2. **Ban Thành Viên (BTV):** Responsible (R) độc quyền tiếp nhận, thẩm định và bấm nút duyệt kết nạp hội viên (Cấp mã `CEO-83xxx`).
3. **Ban Thư Ký (BTK):** Responsible (R) điều hành lịch họp, biểu quyết và văn bản hành chính; không can thiệp thẩm định hội viên.
4. **Ban Thiện Nguyện (BTN) & Ban Tài Chính (BTC):** Responsible (R) quản lý Sổ Quỹ Thu Chi, kiểm soát phiếu chi 3 cấp và đối soát hội phí.
5. **Ban Truyền Thông (BTT):** Responsible (R) vận hành Cổng soát vé Gate Check-in QR tại sự kiện và quản trị bảng tin truyền thông.
6. **Ban Xúc Tiến Thương Mại (BXT):** Responsible (R) kiểm duyệt gian hàng sản phẩm B2B và điều phối cơ hội kinh doanh Cung - Cầu.

---

### 2.2. Ánh Xạ Toàn Bộ Hành Trình Người Dùng (User Journeys)

#### Hành Trình 1: Khách Vãng Lai ➔ Đăng Ký Trực Tuyến ➔ Thẩm Định BTV ➔ Cấp Mã Hội Viên ➔ Đăng Nhập Lần Đầu
1. **Bước 1:** Ứng viên truy cập Cổng thông tin công khai, nhấn nút "Đăng Ký Gia Nhập".
2. **Bước 2:** Điền mẫu đơn điện tử: Họ tên, Ngày sinh (xác thực năm 1983), SĐT, Email, Tên doanh nghiệp, MST, Chức vụ, Nguyện vọng chuyên ban.
3. **Bước 3:** Nhấn gửi đơn. Hệ thống lưu hồ sơ ở trạng thái `pending` (Chờ thẩm định), đồng thời máy chủ SMTP tự động gửi email xác nhận tiếp nhận đến hòm thư ứng viên.
4. **Bước 4:** Lãnh đạo Ban Thành Viên (BTV) đăng nhập CRM, mở màn hình "Duyệt Hội Viên" (`/members`), kiểm tra thông tin pháp nhân và nhấn nút "Phê Duyệt".
5. **Bước 5:** Hệ thống tự động sinh Mã hội viên chuẩn (`CEO-83xxx`), tạo tài khoản người dùng, băm mật khẩu khởi tạo an toàn và gửi email chào mừng kèm thông tin đăng nhập.
6. **Bước 6:** Hội viên mở App Mobile CEO 1983, đăng nhập bằng Email/SĐT và mật khẩu tạm thời, hệ thống bắt buộc đổi mật khẩu mới trong lần đầu tiên truy cập.

#### Hành Trình 2: Quản Lý Hội Phí ➔ Quét Mã VietQR ➔ Kế Toán Đối Soát ➔ Duyệt Gia Hạn (+1 Năm)
1. **Bước 1:** Hội viên mở mục "Hội Phí" trên App Mobile, hệ thống hiển thị thông báo niên liễm cần đóng (5.000.000 VNĐ/năm).
2. **Bước 2:** Bấm nút "Thanh Toán VietQR". Hệ thống hiển thị mã VietQR động chuẩn Napas 24/7 chứa sẵn Số tiền, Tên tài khoản thụ hưởng và Cú pháp chuẩn (`HOIPHI CEO1983 [MÃ_HỘI_VIÊN]`).
3. **Bước 3:** Hội viên mở ứng dụng Ngân hàng trên điện thoại, quét mã QR và xác nhận chuyển khoản.
4. **Bước 4:** Ban Kế toán / Thủ quỹ mở màn hình "Quản Lý Hội Phí" (`/fees`) trên Web CRM, kiểm tra giao dịch tương ứng trên sao kê ngân hàng.
5. **Bước 5:** Bấm nút "Duyệt Gạch Nợ". Hệ thống tự động cộng thêm +365 ngày vào hạn dùng của Thẻ hội viên VIP, chuyển trạng thái sang `paid` và gửi hóa đơn xác nhận đến hội viên.

#### Hành Trình 3: Tạo Sự Kiện Gala ➔ Xếp Ghế Sân Khấu ➔ Phát Hành Vé QR ➔ Soát Vé Gate Check-in Tốc Độ Cao
1. **Bước 1:** Ban Quản Trị / Ban Thư Ký tạo mới Sự kiện Gala trên CRM, thiết lập timeline, cấu hình vé VIP và vé Tiêu chuẩn.
2. **Bước 2:** Mở công cụ "Cinema Seating Map", kéo thả bố trí bàn tiệc VIP 10 chỗ, dãy ghế đại biểu danh dự và khán phòng.
3. **Bước 3:** Hội viên đăng ký tham dự qua App Mobile, chọn vị trí ngồi và nhận ngay Vé điện tử E-Ticket chứa mã QR mã hóa độc bản.
4. **Bước 4:** Tại cửa đón tiếp sự kiện Gala, Ban Truyền Thông mở máy quét tại Cổng An Ninh Soát Vé (`/checkin`).
5. **Bước 5:** Quét mã QR trên điện thoại đại biểu. Hệ thống phản hồi < 0.2s: Màn hình xanh lục hợp lệ, hiển thị Họ tên, Doanh nghiệp và Số bàn VIP; nếu quét lại lần 2, hệ thống lập tức báo đỏ cảnh báo vé đã qua cửa.
6. **Bước 6:** Dữ liệu check-in thực tế tự động đồng bộ vào Vòng quay số may mắn (Lucky Draw) để phục vụ quay thưởng đại hội.

#### Hành Trình 4: Kết Nối Giao Thương B2B ➔ Trao Đổi Danh Thiếp NFC ➔ Nhắn Tin Hẹn Gặp 1-on-1
1. **Bước 1:** Hai hội viên gặp gỡ tại sự kiện, chạm thẻ danh thiếp thông minh NFC vào mặt lưng điện thoại đối tác.
2. **Bước 2:** Điện thoại tự động mở trang Danh thiếp số công khai (`/card/:code`) chứa đầy đủ hồ sơ năng lực, công ty và nút lưu danh bạ.
3. **Bước 3:** Bấm nút "Kết Nối B2B", mở ngăn kéo (Bottom Sheet) chọn mục đích hợp tác và gửi lời mời gặp gỡ 1-on-1.
4. **Bước 4:** Đối tác nhận thông báo tức thì, mở Hộp thư Messenger #0084FF và bấm "Chấp Nhận Lời Mời".
5. **Bước 5:** Hệ thống tạo phòng họp hoặc liên kết lịch hẹn trực tiếp, lưu trữ lịch sử tương tác vào Hồ sơ Quan hệ Đối tác.

#### Hành Trình 5: Đại Hội Hiệp Hội ➔ Biểu Quyết Trực Tuyến ➔ Công Bố Kết Quả Realtime
1. **Bước 1:** Ban Thư Ký khởi tạo phiên biểu quyết trên CRM: Tiêu đề nghị quyết, danh sách phương án lựa chọn, thời gian mở và đóng hòm phiếu.
2. **Bước 2:** Kích hoạt phiên biểu quyết. Toàn bộ hội viên chính thức nhận được thông báo đẩy trên App Mobile.
3. **Bước 3:** Hội viên mở màn hình Biểu Quyết (`/association/voting`), chọn phương án và bấm "Xác Nhận Bỏ Phiếu". Hệ thống áp dụng quy tắc 1 người 1 phiếu và khóa nút sau khi đã bầu.
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
* **Actor:** Doanh nhân sinh năm 1983 (Đại diện mẫu: `vupv090120@gmail.com`).
* **Mô tả chi tiết:**
  - **Input:** Biểu mẫu đăng ký gồm: Họ tên, Ngày tháng năm sinh, Số điện thoại, Email doanh nghiệp, Tên công ty, Mã số thuế, Chức vụ lãnh đạo, Lĩnh vực ngành nghề, Nguyện vọng chuyên ban sinh hoạt.
  - **Xử lý logic:**
    1. Kiểm tra năm sinh bắt buộc phải là 1983.
    2. Kiểm tra định dạng Email chuẩn và Số điện thoại 10 chữ số.
    3. Kiểm tra xem Email/SĐT đã tồn tại trong CSDL hay chưa.
    4. Ghi nhận bản ghi vào bảng `members` với trạng thái `status = 'pending'`.
    5. Kích hoạt sự kiện gửi email tự động xác nhận qua SMTP Mailer.
  - **Output:** Thông báo tiếp nhận hồ sơ thành công, hiển thị Mã tra cứu hồ sơ và thông điệp hướng dẫn bước tiếp theo.
* **Ngoại lệ:**
  - Năm sinh khác 1983 ➔ Báo lỗi: "CLB CEO 1983 chỉ tiếp nhận hội viên sinh năm Quý Hợi 1983".
  - Email/SĐT đã tồn tại ➔ Báo lỗi: "Hồ sơ với thông tin này đã được đăng ký, vui lòng liên hệ Ban Thành Viên".

#### [FR-PUB-03] Tự Động Gửi Email Xác Nhận Tiếp Nhận Hồ Sơ Đăng Ký
* **Actor:** Hệ thống Máy chủ Thư tín Tự động (SMTP Mailer Service).
* **Mô tả chi tiết:**
  - **Input:** Sự kiện tạo hồ sơ đăng ký mới thành công từ [FR-PUB-02].
  - **Xử lý logic:** Lấy thông tin ứng viên, chèn vào mẫu email thương hiệu CEO 1983 (HTML Template), kết nối cổng SMTP Gmail Relay (`smtp.gmail.com:465`) và phát thư.
  - **Output:** Thư điện tử gửi thành công vào hòm thư ứng viên kèm thông tin tóm tắt và quy trình xét duyệt.
* **Ngoại lệ:** Hòm thư đích từ chối hoặc lỗi mạng SMTP ➔ Tự động xếp hàng thử lại (Retry Queue) sau 5 phút.

#### [FR-PUB-04] Tra Cứu Danh Bạ Doanh Nghiệp Thành Viên Công Khai
* **Actor:** Khách vãng lai, Đối tác tìm kiếm nhà cung cấp.
* **Mô tả chi tiết:**
  - **Input:** Từ khóa tìm kiếm (Tên doanh nghiệp, Ngành nghề, Sản phẩm cốt lõi).
  - **Xử lý logic:** Truy vấn danh sách doanh nghiệp đã được xác thực (`is_verified = true`), hiển thị Logo, Tên công ty, Lĩnh vực và Địa chỉ trụ sở. Ẩn thông tin số điện thoại cá nhân theo chính sách bảo mật.
  - **Output:** Danh sách card doanh nghiệp kèm liên kết dẫn đến trang thông tin chi tiết.
* **Ngoại lệ:** Không tìm thấy kết quả ➔ Hiển thị gợi ý các ngành nghề tiêu biểu trong hiệp hội.

---

### 3.2. MODULE 2: XÁC THỰC, PHÂN QUYỀN & BẢO MẬT HỆ THỐNG (IAM & SECURITY)

#### [FR-SEC-01] Đăng Nhập Cổng Quản Trị Web CRM
* **Actor:** Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn.
* **Mô tả chi tiết:**
  - **Input:** Email hoặc Mã hội viên và Mật khẩu quản trị.
  - **Xử lý logic:**
    1. Tìm bản ghi tài khoản trong bảng `users`.
    2. So khớp mật khẩu với hàm băm `bcrypt.compare()`.
    3. Kiểm tra trạng thái tài khoản (`status = 'active'`).
    4. Kiểm tra quyền hạn quản trị (Chỉ tài khoản thuộc 5 cấp bậc quản trị mới được truy cập CRM).
    5. Khởi tạo cặp khóa JWT (Access Token 15 phút, Refresh Token 7 ngày) và lưu thông tin phiên làm việc.
  - **Output:** Điều hướng vào Bàn làm việc Dashboard CRM (`/`), lưu token an toàn.
* **Ngoại lệ:**
  - Sai mật khẩu quá 5 lần ➔ Tạm khóa tài khoản trong 15 phút chống tấn công Brute-force.
  - Tài khoản không có quyền quản trị ➔ Báo lỗi: "Tài khoản không có thẩm quyền truy cập Cổng Quản Trị".

#### [FR-SEC-02] Đăng Nhập Ứng Dụng Di Động Hội Viên CEO 1983
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Số điện thoại / Email và Mật khẩu hội viên.
  - **Xử lý logic:** Xác thực danh tính hội viên, kiểm tra trạng thái kích hoạt hồ sơ, tạo phiên làm việc di động và tải dữ liệu Thẻ hội viên VIP.
  - **Output:** Điều hướng vào Trang chủ Hội viên (`/association`), hiển thị họ tên, ảnh đại diện và thẻ danh dự.
* **Ngoại lệ:** Hồ sơ đang ở trạng thái Chờ thẩm định (`pending`) ➔ Thông báo: "Hồ sơ của Quý anh/chị đang được Ban Thành Viên thẩm định".

#### [FR-SEC-03] Bắt Buộc Đổi Mật Khẩu Khởi Tạo Lần Đầu (Onboarding Password Change)
* **Actor:** Hội viên mới đăng nhập lần đầu tiên bằng mật khẩu hệ thống cấp.
* **Mô tả chi tiết:**
  - **Input:** Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.
  - **Xử lý logic:**
    1. Kiểm tra cờ `must_change_password = true`.
    2. Kiểm tra độ mạnh mật khẩu mới: Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số.
    3. Băm mật khẩu mới bằng `bcrypt` và cập nhật vào CSDL.
    4. Xóa cờ `must_change_password = false`.
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
* **Actor:** Ban Quản Trị tối cao (`quan_tri`).
* **Mô tả chi tiết:**
  - **Input:** Lựa chọn vai trò (Cột bên trái) và danh sách chức năng (Cột bên trên), đánh dấu các quyền: Xem, Sửa, Xóa, Phân quyền.
  - **Xử lý logic:** Cập nhật bảng ánh xạ quyền hạn `role_permissions`, áp dụng chính sách Data Scope và phân vùng bảo mật.
  - **Output:** Cập nhật ma trận thành công, áp dụng tức thời cho các tài khoản đang hoạt động.
* **Ngoại lệ:** Cố ý hạ quyền của vai trò `quan_tri` tối cao ➔ Hệ thống chặn và báo lỗi an toàn.

---

### 3.3. MODULE 3: QUẢN TRỊ DANH BẠ HỘI VIÊN 360° & THẨM ĐỊNH KẾT NẠP

#### [FR-MBR-01] Quản Lý Danh Sách Hội Viên Đa Chiều
* **Actor:** Ban Quản Trị, Ban Thành Viên, Ban Thư Ký.
* **Mô tả chi tiết:**
  - **Input:** Bộ lọc theo Ban chuyên môn, Tình trạng hội phí (Đã đóng / Quá hạn), Hạng hội viên (Kim Cương / Vàng / Bạc), Từ khóa tìm kiếm.
  - **Xử lý logic:** Truy vấn bảng `members`, hỗ trợ cuộn ngang bảng chuẩn với Cột STT cố định bên trái và Cột Thao tác cố định bên phải.
  - **Output:** Bảng danh sách hội viên chuẩn xác, hiển thị Mã HV, Họ tên, Doanh nghiệp, Chức vụ, SĐT, Ban chuyên môn và Trạng thái.
* **Ngoại lệ:** Không có dữ liệu thỏa mãn bộ lọc ➔ Hiển thị trạng thái rỗng và nút đặt lại bộ lọc.

#### [FR-MBR-02] Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới (Độc Quyền BTV)
* **Actor:** Trưởng Ban Thành Viên (`ceo.thanhvien@ceo1983.com`).
* **Mô tả chi tiết:**
  - **Input:** Mở ngăn kéo (Drawer) chi tiết hồ sơ ứng viên đang chờ duyệt (`pending`).
  - **Xử lý logic:**
    1. Kiểm tra tính pháp lý doanh nghiệp, năng lực điều hành và xác nhận đúng năm sinh 1983.
    2. Nhấn nút "Phê Duyệt Kết Nạp".
    3. Hệ thống kiểm tra quyền hạn của người thực hiện (Bắt buộc phải là Ban Thành Viên hoặc BQT; chặn tuyệt đối Ban Thư Ký).
    4. Sinh mã số hội viên tự động `CEO-83xxx` (ví dụ: `CEO-83007`).
    5. Cập nhật trạng thái sang `active`, tạo mật khẩu khởi tạo ngẫu nhiên.
    6. Gửi email phát hành tài khoản và mật khẩu đến email ứng viên qua SMTP Gmail.
  - **Output:** Thông báo toast duyệt thành công, hiển thị mã hội viên mới và cập nhật bảng danh sách.
* **Ngoại lệ:** Tài khoản Ban Thư Ký bấm duyệt ➔ Báo lỗi: "Ban Thư Ký không có thẩm quyền duyệt kết nạp hội viên, nghiệp vụ thuộc Ban Thành Viên".

#### [FR-MBR-03] Từ Chối Hồ Sơ Gia Nhập Kèm Lý Do
* **Actor:** Ban Thành Viên (BTV).
* **Mô tả chi tiết:**
  - **Input:** Nhấn nút "Từ Chối", nhập lý do từ chối (Ví dụ: Chưa đủ điều kiện đại diện pháp luật, sai năm sinh).
  - **Xử lý logic:** Cập nhật trạng thái hồ sơ sang `rejected`, lưu lý do vào nhật ký và kích hoạt email thông báo nhã nhặn tới ứng viên.
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
  - **Xử lý logic:** Kiểm tra tài khoản hội viên có hợp lệ và đã đóng hội phí hay chưa, lưu bản ghi vào `products` ở trạng thái `pending` (Chờ duyệt).
  - **Output:** Sản phẩm được gửi lên hệ thống và chuyển về hàng đợi kiểm duyệt của Ban Xúc Tiến Thương Mại.
* **Ngoại lệ:** Hội viên nợ hội phí quá hạn ➔ Cảnh báo yêu cầu hoàn tất hội phí trước khi đăng bán sản phẩm.

#### [FR-MKT-02] Kiểm Duyệt & Kích Hoạt Gian Hàng B2B (Độc Quyền BXT)
* **Actor:** Ban Xúc Tiến Thương Mại (`ceo.xuctien@ceo1983.com`).
* **Mô tả chi tiết:**
  - **Input:** Mở danh sách sản phẩm chờ duyệt trên CRM (`/marketplace`), xem chi tiết chứng chỉ chất lượng và chính sách ưu đãi.
  - **Xử lý logic:** Nhấn "Phê Duyệt Đăng Sàn". Hệ thống chuyển trạng thái sang `published`, đẩy sản phẩm lên vị trí nổi bật trên Mobile App.
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
  - **Xử lý logic:** Lưu vào bảng `opportunities`, tự động phân loại ngành nghề và kích hoạt cơ chế ghép nối AI Matcher.
  - **Output:** Cơ hội xuất hiện trên Bảng tin Giao thương (`/association/opportunities`) kèm định giá thương vụ.
* **Ngoại lệ:** Giá trị thương vụ nhập số âm hoặc sai định dạng tiền tệ ➔ Form tự động định dạng và báo lỗi.

#### [FR-OPP-02] Tiếp Nhận & Khớp Lệnh Cơ Hội (Claim Opportunity)
* **Actor:** Doanh nghiệp có năng lực đáp ứng nhu cầu.
* **Mô tả chi tiết:**
  - **Input:** Bấm nút "Tiếp Nhận Cơ Hội", đính kèm đề xuất phương án và số điện thoại liên hệ.
  - **Xử lý logic:** Cập nhật trạng thái cơ hội sang `claimed`, ghi nhận tên người tiếp nhận (`claimedByName`), gửi thông báo tức thì đến người đăng.
  - **Output:** Cơ hội chuyển trạng thái sang "Đã Tiếp Nhận", hiển thị dấu chấm xanh hợp tác và mở kênh trao đổi riêng.
* **Ngoại lệ:** Cơ hội đã được đối tác khác tiếp nhận trước ➔ Báo thông báo: "Cơ hội này đã được tiếp nhận xử lý".

---

### 3.6. MODULE 6: QUẢN TRỊ SỰ KIỆN, VÉ MỜI QR & SƠ ĐỒ GHẾ SEATING MAP

#### [FR-EVT-01] Khởi Tạo Sự Kiện Gala & Đại Hội Hiệp Hội
* **Actor:** Ban Quản Trị, Ban Thư Ký, Ban Truyền Thông.
* **Mô tả chi tiết:**
  - **Input:** Tên sự kiện, Thời gian bắt đầu/kết thúc, Địa điểm tổ chức, Ảnh banner 16:9, Nội dung chương trình (Agenda), Diễn giả danh dự.
  - **Xử lý logic:** Thiết lập trạng thái `upcoming`, lưu trữ bản ghi vào bảng `events`, đẩy thông báo đến toàn thể hội viên.
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
  - **Input:** Giao diện đồ họa Seating Map (`/events/seating`), chọn loại bàn tròn Gala VIP (10 ghế) hoặc dãy ghế hội trường.
  - **Xử lý logic:** Gán định danh bàn (`Bàn VIP 01`, `Bàn VIP 02`), gán hội viên cụ thể vào từng vị trí ghế ngồi theo thứ tự nghi lễ ngoại giao.
  - **Output:** Sơ đồ phòng tiệc hiển thị trực quan theo thời gian thực, đồng bộ số bàn vào vé E-Ticket của đại biểu.
* **Ngoại lệ:** Gán trùng 1 hội viên vào 2 vị trí ghế khác nhau ➔ Hệ thống tự động cảnh báo xung đột vị trí.

---

### 3.7. MODULE 7: CỔNG AN NINH SOÁT VÉ GATE CHECK-IN QR & QUAY SỐ MAY MẮN

#### [FR-CHK-01] Quét Mã QR Pass Soát Vé Cổng Tốc Độ Cao
* **Actor:** Ban Truyền Thông, Nhân viên soát vé tại cửa sự kiện.
* **Mô tả chi tiết:**
  - **Input:** Hướng camera máy quét vào mã QR trên điện thoại hoặc vé in của đại biểu (`/checkin`).
  - **Xử lý logic:**
    1. Giải mã token QR code của vé.
    2. Truy vấn bản ghi đăng ký trong `event_registrations`.
    3. Kiểm tra tính hợp lệ và trạng thái soát vé.
    4. Nếu chưa check-in: Cập nhật `attended = true`, ghi nhận thời gian check-in chính xác.
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
    3. Lưu bản ghi vào `meetings`, tự động phát giấy triệu tập vào App Mobile của các đại biểu.
  - **Output:** Cuộc họp được lên lịch thành công, hiển thị đường link họp hoặc địa chỉ phòng họp vật lý.
* **Ngoại lệ:** Trùng lịch phòng họp Sapphire Hub ➔ Hệ thống báo đỏ xung đột và đề xuất dời lịch hoặc đổi sang họp Zoom.

#### [FR-MTG-02] Xử Lý Cuộc Họp Đột Xuất & Xung Đột Lịch (Urgent Meetings)
* **Actor:** Ban Thường Trực, Tổng Thư Ký.
* **Mô tả chi tiết:**
  - **Input:** Bật cờ "Cuộc họp khẩn cấp" (`isUrgent = true`), nhập lý do khẩn cấp.
  - **Xử lý logic:** Đánh dấu huy hiệu Đỏ khẩn cấp, kích hoạt tính năng "Liên Hệ Điều Phối" (Gọi điện thoại trực tiếp `tel:` hoặc gửi email ưu tiên tới người phụ trách cuộc họp bị xung đột để thống nhất dời lịch).
  - **Output:** Thông báo khẩn cấp được phát toàn hệ thống, cuộc họp ưu tiên được giữ chỗ.
* **Ngoại lệ:** Hủy hoặc dời lịch họp ➔ Tự động gửi thông báo Broadcast cập nhật thời gian mới cho toàn bộ đại biểu.

---

### 3.9. MODULE 9: QUẢN TRỊ CÔNG VIỆC PHÂN CẤP (TASKS 5 VIEW MODES)

#### [FR-TSK-01] Quản Lý Công Việc Đa Dạng 5 Chế Độ Hiển Thị
* **Actor:** Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn.
* **Mô tả chi tiết:**
  - **Input:** Chọn 1 trong 5 chế độ xem:
    1. **Bảng Chi Tiết (Table View):** Hiển thị cột Mã CV, Tên, Ban, Người làm, Deadline, Ưu tiên, Tiến độ slider, Trạng thái, Link họp.
    2. **Lưới Kanban (Kanban Board):** 5 cột trạng thái (`Chưa làm`, `Đang làm`, `Chờ duyệt`, `Hoàn thành`, `Tạm dừng`) kèm thanh Zoom 3 cấp độ (280px / 345px / 410px).
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
  - **Xử lý logic:** Lưu vào bảng `polls` và `poll_options`, chuyển trạng thái sang `open`.
  - **Output:** Phiên biểu quyết xuất hiện tức thì trên màn hình Biểu Quyết của tất cả hội viên.
* **Ngoại lệ:** Đóng biểu quyết thủ công ➔ Hệ thống chốt số liệu và khóa nút bỏ phiếu toàn mạng.

#### [FR-VOT-02] Bỏ Phiếu Biểu Quyết Bảo Mật 1 Người 1 Phiếu
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Chọn phương án biểu quyết (Đồng ý / Không đồng ý / Ý kiến khác), nhấn "Xác Nhận Bỏ Phiếu".
  - **Xử lý logic:**
    1. Kiểm tra xem hội viên đã bỏ phiếu cho phiên này chưa trong bảng `poll_votes`.
    2. Nếu chưa: Ghi nhận phiếu bầu, tăng bộ đếm `votes_count` của phương án được chọn.
    3. Đánh dấu hội viên đã hoàn thành biểu quyết và khóa nút bấm.
    4. Bắn sự kiện WebSocket cập nhật tỷ lệ % cho máy chủ hiển thị.
  - **Output:** Thông báo: "Quý anh/chị đã biểu quyết thành công!", hiển thị kết quả tổng hợp.
* **Ngoại lệ:** Cố ý gửi nhiều request bỏ phiếu cùng lúc ➔ Database ràng buộc khóa duy nhất `UNIQUE(poll_id, user_id)` chặn trùng lặp tuyệt đối.

---

### 3.11. MODULE 11: TÀI CHÍNH, SỔ QUỸ THU CHI & GIA HẠN HỘI PHÍ VIETQR

#### [FR-FIN-01] Tra Cứu & Thanh Toán Hội Phí VietQR Động
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Mở mục Gia hạn hội phí trên App Mobile, chọn kỳ đóng phí thường niên (5.000.000 VNĐ).
  - **Xử lý logic:** Tạo mã VietQR động chuẩn Napas chứa số tài khoản MB Bank `198388889999`, chủ tài khoản `CLB DOANH NHAN 1983` và cú pháp chuẩn.
  - **Output:** Hiển thị mã QR rõ nét, nút "Tải Mã QR" và nút "Sao Chép Số Tài Khoản".
* **Ngoại lệ:** Lỗi kết nối dịch vụ sinh QR ➔ Hiển thị thông tin chuyển khoản dạng văn bản dự phòng.

#### [FR-FIN-02] Đối Soát & Duyệt Gạch Nợ Thủ Công (Kế Toán CRM)
* **Actor:** Ban Tài Chính, Thủ quỹ CLB.
* **Mô tả chi tiết:**
  - **Input:** Danh sách hóa đơn hội phí chờ gạch nợ (`/fees`), kiểm tra khớp lệnh với sao kê ngân hàng MB Bank.
  - **Xử lý logic:** Nhấn nút "Duyệt Gạch Nợ". Hệ thống cập nhật trạng thái hóa đơn sang `paid`, tự động gia hạn ngày hết hạn thẻ hội viên thêm +365 ngày.
  - **Output:** Thẻ hội viên trên App Mobile tự động chuyển sang trạng thái "Đã Kích Hoạt", hiển thị biên lai điện tử.
* **Ngoại lệ:** Số tiền chuyển khoản thiếu ➔ Bấm "Cảnh Báo Thiếu Tiền" kèm ghi chú số tiền còn thiếu.

#### [FR-FIN-03] Quản Trị Sổ Quỹ Thu Chi 3 Cấp Duyệt (Cashbook)
* **Actor:** Ban Thiện Nguyện (BTN), Ban Tài Chính (BTC), Ban Quản Trị (BQT).
* **Mô tả chi tiết:**
  - **Input:** Lập phiếu chi hoạt động hoặc từ thiện: Số tiền, Nội dung chi, Người nhận, Chứng từ hóa đơn đính kèm.
  - **Xử lý logic:** Quy trình duyệt 3 cấp nghiêm ngặt: Tạo phiếu (`pending`) ➔ Trưởng ban kiểm tra (`reviewed`) ➔ Chủ tịch/BQT phê chuẩn (`approved`).
  - **Output:** Tiền quỹ tự động trừ vào Sổ quỹ chung, hiển thị trên Báo cáo tài chính minh bạch thời gian thực.
* **Ngoại lệ:** Phiếu chi không có chứng từ hợp lệ ➔ Bị từ chối và ghi rõ lý do trả về người tạo.

---

### 3.12. MODULE 12: QUYỀN LỢI, ƯU ĐÃI SINH NHẬT & NHÀ TÀI TRỢ (PERKS & SPONSORS)

#### [FR-PRK-01] Quản Trị Chương Trình Chúc Mừng Sinh Nhật Tự Động
* **Actor:** Quản trị viên CRM (`/perks`).
* **Mô tả chi tiết:**
  - **Input:** Mẫu lời chúc sinh nhật cá nhân hóa, Mã E-Voucher độc quyền (Ví dụ: `SINHNHAT-CEO1983`), Giá trị quà tặng (% giảm giá dịch vụ), Thời hạn sử dụng (30 ngày).
  - **Xử lý logic:** Hệ thống tự động quét ngày sinh hội viên mỗi ngày vào lúc 08:00 sáng, kích hoạt Popup chúc mừng sang trọng trên App Mobile của hội viên có sinh nhật trong ngày.
  - **Output:** Hội viên nhận được thiệp chúc mừng mạ vàng từ Chủ tịch và mã voucher quà tặng.
* **Ngoại lệ:** Hội viên chưa cập nhật ngày sinh ➔ Hệ thống hiển thị thông báo nhắc hoàn thiện hồ sơ.

#### [FR-PRK-02] Quản Trị Gói Tài Trợ & Quyền Lợi Nhà Tài Trợ
* **Actor:** Ban Xúc Tiến Thương Mại, Ban Tài Chính.
* **Mô tả chi tiết:**
  - **Input:** Tạo gói tài trợ: Kim Cương, Vàng, Bạc, Đồng kèm quyền lợi (Vị trí logo trên sân khấu, bài phát biểu, gian hàng VIP).
  - **Xử lý logic:** Ghi nhận nhà tài trợ, tự động hiển thị Logo trên Carousel Nhà Tài Trợ Obsidian & Amber Gold trên toàn bộ hệ thống.
  - **Output:** Thương hiệu nhà tài trợ được quảng bá trang trọng và đồng bộ.
* **Ngoại lệ:** Hết hạn hợp đồng tài trợ ➔ Hệ thống tự động chuyển trạng thái sang `expired` và hạ banner.

---

### 3.13. MODULE 13: THẺ HỘI VIÊN VIP 3D, DANH THIẾP NFC & PUBLIC VISIT CARD

#### [FR-CRD-01] Hiển Thị Thẻ Hội Viên Điện Tử VIP 3D Chìm Logo
* **Actor:** Hội viên chính thức CLB Doanh Nhân CEO 1983.
* **Mô tả chi tiết:**
  - **Input:** Mở màn hình Thẻ của tôi (`/association/card`).
  - **Xử lý logic:** Hệ thống tải Thẻ VIP hiệu ứng 3D với nền Xanh Navy hoàng gia, Logo doanh nghiệp hòa trộn chìm sang trọng (Screen blend), Mã định danh `CEO-83xxx`, Họ tên, Chức vụ và Mã QR cá nhân.
  - **Output:** Thẻ hiển thị sắc nét, có nút lật mặt sau xem hợp đồng gia nhập và thông tin liên hệ.
* **Ngoại lệ:** Chưa có logo doanh nghiệp ➔ Hiển thị logo chuẩn CEO 1983 mặc định.

#### [FR-CRD-02] Danh Thiếp Điện Tử Thông Minh Công Khai (Public Visiting Card)
* **Actor:** Đối tác quét mã QR hoặc chạm thẻ NFC của hội viên.
* **Mô tả chi tiết:**
  - **Input:** Trình duyệt mở đường dẫn công khai `/card/:code`.
  - **Xử lý logic:** Hiển thị trang Danh thiếp số tối ưu cho điện thoại: Ảnh đại diện, Họ tên, Công ty, Chức vụ, Số điện thoại, Email, Website, Bản đồ địa chỉ trụ sở và nút "Lưu Danh Bạ Vào Điện Thoại" (file `.vcf`).
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
  - **Output:** Văn bản được lưu trữ khoa học, hội viên tra cứu và tải xuống dễ dàng trên App Mobile (`/association/library`).
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
  - **Xử lý logic:** Tự động ghi lại Actor ID, Hành động, Thời gian chính xác (Timestamp), Địa chỉ IP, Trình duyệt và Dữ liệu trước/sau khi thay đổi vào bảng `audit_logs`.
  - **Output:** Bảng nhật ký kiểm toán không thể xóa hoặc chỉnh sửa (`/platform/audit`), phục vụ công tác thanh tra minh bạch của Ban Kiểm Tra Hiệp Hội.
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
* **Mật khẩu người dùng:** Băm mật khẩu bằng thuật toán `bcrypt` với Salt Rounds = 10, tuyệt đối không lưu trữ văn bản thô (Plaintext).
* **Kiểm soát phiên làm việc:** Sử dụng Access Token thời hạn ngắn (15 phút) và Refresh Token lưu trữ bảo mật (HttpOnly Cookie hoặc Storage mã hóa).
* **Phòng chống tấn công:**
  - Rate Limiting: Giới hạn tối đa 100 requests/phút/IP đối với các endpoint công khai và 5 lần thử đăng nhập sai/15 phút.
  - Chống SQL Injection bằng Prisma Parameterized Queries.
  - Chống Cross-Site Scripting (XSS) và Cross-Site Request Forgery (CSRF).
  - Tách biệt dữ liệu nhạy cảm theo phân vùng bảo mật Row Level Security.

### 4.3. Tính Khả Dụng & Trải Nghiệm Người Dùng (Usability & Design)
* **Bảng màu nhận diện chuẩn mực:** Tuân thủ triệt để bảng màu Deep Cobalt Navy (`#003B95`) và Warm Amber Gold (`#F59E0B`). Tuyệt đối không dùng nút màu đen tuyền (`#000000`) hay màu cam chói lóa trên giao diện điều hành.
* **Tối ưu hóa Bảng dữ liệu CRM:** Bảng dữ liệu lớn (>6 cột) phải có thanh cuộn ngang `min-w-[1050px]`, cố định Cột STT sát lề trái và Cột Thao tác sát lề phải, hỗ trợ Tooltip hiển thị đầy đủ văn bản bị rút gọn.
* **Chuẩn PWA Di Động:** Hỗ trợ cài đặt "Add to Home Screen" trên cả iOS Safari và Android với biểu tượng chính thức độ nét cao và khởi động toàn màn hình (Standalone mode).

### 4.4. Độ Tin Cậy & Khôi Phục Thảm Họa (Reliability & Disaster Recovery)
* **Độ sẵn sàng (Uptime SLA):** Cam kết tỷ lệ hoạt động liên tục đạt tối thiểu 99.9% (ngoại trừ các kỳ bảo trì định kỳ có thông báo trước).
* **Bảo toàn dữ liệu (ACID Compliance):** Các giao dịch tài chính, sổ quỹ và điểm danh sử dụng PostgreSQL Database Transactions đảm bảo tính toàn vẹn 100%.
* **Chiến lược Sao lưu Dự phòng (Backup Policy):**
  - Sao lưu tự động CSDL hàng ngày (`pg_dump`) vào lúc 02:00 sáng.
  - Bản sao lưu được mã hóa và lưu trữ tại 2 vùng địa lý độc lập.
  - Thời gian khôi phục thảm họa mục tiêu: RTO < 30 phút, RPO < 24 giờ.

---

## 5. YÊU CẦU GIAO TIẾP HỆ THỐNG (SYSTEM INTERFACES)

### 5.1. Cổng Thanh Toán VietQR Napas 24/7
* **Nhà cung cấp:** VietQR Standard (Napas / MB Bank).
* **Mục đích:** Sinh mã QR chuyển khoản ngân hàng động cho hội phí thường niên và vé sự kiện có thu phí.
* **Đặc tả dữ liệu:** Ngân hàng thụ hưởng: MB Bank; Số tài khoản: `198388889999`; Chủ tài khoản: `CLB DOANH NHAN 1983`.
* **Cơ chế xử lý:** Hệ thống sinh mã QR động; Kế toán đối soát sao kê ngân hàng và bấm duyệt gạch nợ thủ công trong CRM (`/fees`).

### 5.2. Máy Chủ Thư Tín Điện Tử (SMTP Mailer Gateway)
* **Nhà cung cấp:** Google Workspace SMTP Relay (`smtp.gmail.com:465`).
* **Mục đích:** Gửi thư tiếp nhận đơn đăng ký, thư phát hành tài khoản mật khẩu, giấy triệu tập cuộc họp và hóa đơn hội phí.
* **Cơ chế bảo mật:** Xác thực SSL/TLS với Mật khẩu ứng dụng chuyên dụng (App Password).

### 5.3. Hệ Thống Lưu Trữ Tệp Đối Tượng (MinIO S3 Compatible Storage)
* **Giao thức:** Amazon S3 REST API Protocol.
* **Mục đích:** Lưu trữ an toàn các tệp hình ảnh đại diện, ảnh bìa, logo công ty, ảnh banner sự kiện và tệp tài liệu PDF nội bộ.
* **Địa chỉ lưu trữ:** `vione-bucket` phân quyền truy cập theo đường dẫn có chữ ký số (Presigned URLs) đối với tài liệu mật.

### 5.4. Cổng Hội Nghị Trực Tuyến (Meeting Platforms Interface)
* **Nền tảng hỗ trợ:** Zoom Meetings (`https://zoom.us/j/`), Google Meet (`https://meet.google.com/`) và UniWork Meet.
* **Cơ chế:** Lưu trữ mã phòng họp, tạo liên kết truy cập an toàn và nhúng vào lịch công tác của đại biểu.

---

## 6. PHÊ DUYỆT TÀI LIỆU (APPROVAL & SIGN-OFF)

| Đại Diện Ban Chấp Hành CLB CEO 1983 | Đại Diện Đơn Vị Phát Triển ViConnect |
| :---: | :---: |
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br><br>**Chủ Tịch CLB Doanh Nhân CEO 1983** | <br><br><br>**Trưởng Ban Kiến Trúc Hệ Thống ViConnect** |
