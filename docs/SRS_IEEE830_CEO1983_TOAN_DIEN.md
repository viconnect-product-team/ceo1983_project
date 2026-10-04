# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983

### TIÊU CHUẨN IEEE 830-1998 (PHÂN TÍCH MECE 100%)

*Mã tài liệu: SRS-IEEE830-CEO1983-MASTER-V5.0 | Phiên bản: Version 5.0 (Bàn Giao Kỹ Thuật Đầy Đủ Chi Tiết 100% MECE) | Ngày phê duyệt: 04/10/2026*

*Cơ quan chủ quản: Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA)*

*Chuyên gia thực hiện: Senior Business Analyst & System Architect (15+ Năm Kinh Nghiệm)*
---

## 1. GIỚI THIỆU CHUNG (INTRODUCTION)

### 1.1. Mục Đích Của Tài Liệu (Purpose)

Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) mã hiệu [SRS-IEEE830-CEO1983-MASTER-V5.0] được biên soạn theo đúng tiêu chuẩn quốc tế IEEE 830-1998, nhằm xác định một cách đầy đủ, chính xác, không mơ hồ toàn bộ các yêu cầu chức năng, yêu cầu phi chức năng, thiết kế vai trò người dùng, hành trình trải nghiệm và các giao diện tích hợp hệ thống cho Hệ Sinh Thái Số Hóa Hiệp Hội Doanh Nhân CEO 1983 (Trực thuộc HanoiBA). Tài liệu là căn cứ pháp lý và kỹ thuật duy nhất để nghiệm thu phần mềm.

### 1.2. Phạm Vi Tài Liệu (Document Scope)

Tài liệu này bao gồm đặc tả chi tiết của 56 trường hợp sử dụng (Use Cases) tương ứng với phạm vi chức năng bàn giao, áp dụng nguyên tắc MECE (Mutually Exclusive, Collectively Exhaustive) để tuyệt đối không trùng lặp và không bỏ sót bất kỳ luồng tác nghiệp nào của Hội đồng Điều hành và Hội viên CLB Doanh Nhân CEO 1983.

### 1.3. Định Nghĩa & Viết Tắt (Definitions & Acronyms)

| Từ Viết Tắt | Thuật Ngữ Tiếng Anh / Tiếng Việt | Định Nghĩa Chi Tiết Trong Hệ Thống |
| --- | --- | --- |
| HanoiBA | Hanoi Young Business Association | Hội Doanh Nhân Trẻ Hà Nội, cơ quan cấp trên của CLB CEO 1983. |
| CLB CEO 1983 | CEO 1983 Business Club | Câu lạc bộ các nhà lãnh đạo doanh nghiệp sinh năm 1983 (Quý Hợi). |
| BQT | Board of Management | Ban Quản Trị CLB Doanh Nhân CEO 1983. |
| BTK | Secretariat Committee | Ban Thư Ký CLB, cơ quan điều hành hành chính văn phòng. |
| BTV | Membership Committee | Ban Thành Viên, cơ quan độc quyền thẩm định và duyệt kết nạp hội viên. |
| BTN | Charity Committee | Ban Thiện Nguyện & An Sinh Xã Hội. |
| BTT | Media & Event Committee | Ban Truyền Thông & Sự Kiện. |
| BXT | Trade Promotion Committee | Ban Xúc Tiến Thương Mại & Đầu Tư. |
| RBAC | Role-Based Access Control | Mô hình kiểm soát truy cập dựa trên vai trò người dùng. |
| VietQR | Vietnam QR Payment Standard | Chuẩn thanh toán chuyển khoản liên ngân hàng Napas 24/7. |
| NFC | Near Field Communication | Công nghệ giao tiếp trường gần tần số 13.56MHz chia sẻ danh thiếp. |
| MECE | Mutually Exclusive, Collectively Exhaustive | Nguyên tắc phân tích không trùng lặp, không bỏ sót chức năng. |



## 2. MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)

### 2.1. Danh Sách User Roles & Ma Trận Phân Quyền (Roles & Permissions)

| Mã Role | Tên Vai Trò | Đối Tượng Áp Dụng | Mô Tả Quyền Hạn Cốt Lõi |
| --- | --- | --- | --- |
| quan_tri | Ban Quản Trị Tối Cao (Superadmin) | Chủ tịch CLB, Ban Thường Trực CLB Doanh Nhân CEO 1983 | Toàn quyền: Xem (Read), Tạo (Create), Chỉnh sửa (Update), Xóa (Delete), Phê duyệt (Approve), Cấu hình (Configure) trên tất cả 30 màn hình và API. |
| admin | Quản Trị Vận Hành (Executive Admin) | Phó Chủ tịch Thường trực, Giám đốc Điều hành CLB | Quyền Xem, Tạo, Sửa, Duyệt trên các phân hệ Hội viên, Sự kiện, Cuộc họp, Sàn B2B, Công việc. Không có quyền xóa dữ liệu kiểm toán và hạ quyền Superadmin. |
| tong_thu_ky | Tổng Thư Ký / Ban Thư Ký (Secretariat) | Tổng Thư Ký, Phó Tổng Thư Ký, Chánh Văn Phòng CLB | Toàn quyền trên phân hệ Cuộc họp, Phòng họp Sapphire Hub, Lịch công tác, Giao việc và Quản trị Kênh Thông Báo Ban Thư Ký ghim trên Mobile App. Bị chặn ở API duyệt hội viên. |
| truong_ban | Trưởng Ban Chuyên Môn (Committee Heads) | Trưởng/Phó các ban: Ban Thành Viên (BTV), Ban Thiện Nguyện (BTN), Ban Truyền Thông (BTT), Ban Xúc Tiến (BXT), Ban Tài Chính (BTC) | Phân quyền theo phạm vi chuyên trách (Scope-based RBAC) của từng ban. Không truy cập chéo vào các chức năng đặc thù của ban khác. |
| member | Hội Viên Chính Thức (Official Member) | 500+ Doanh nhân CEO 1983 chính danh (Đã được BTV duyệt và có trạng thái phí 'paid') | Quyền truy cập đầy đủ các chức năng dành cho hội viên trên Mobile App. Bị giới hạn không truy cập vào Cổng Web CRM Quản trị. |
| guest | Khách Vãng Lai & Ứng Viên (Guest / Applicant) | Doanh nhân 1983 đang nộp hồ sơ gia nhập, Khách mời sự kiện | Chỉ truy cập các màn hình và API công khai (`/landing`, `/card/:slug`, `/events/public`). |



### 2.2. Ánh Xạ Toàn Bộ Hành Trình Người Dùng (User Journeys)

#### UJ-01: Hành Trình Tiếp Nhận Ứng Viên ➔ Thẩm Định BTV ➔ Phê Duyệt Cấp Mã ➔ Đăng Nhập Lần Đầu

**Đối tượng trải nghiệm:** Ứng viên 1983, Ban Thành Viên (BTV)

Bước 1: Ứng viên truy cập Cổng tiếp nhận hồ sơ trực tuyến tại https://14.225.217.232:5444/landing?apply=true.

Bước 2: Ứng viên điền biểu mẫu điện tử gồm 9 trường: Họ tên, Ngày tháng năm sinh (Bắt buộc năm 1983), SĐT, Email, Tên doanh nghiệp, Mã số thuế, Chức vụ, Lĩnh vực kinh doanh, Nguyện vọng chuyên ban.

Bước 3: Nhấn nút 'Gửi Đơn Đăng Ký'. Hệ thống kiểm tra hợp lệ client/server, lưu bản ghi vào CSDL ở trạng thái pending, máy chủ SMTP tự động gửi Thư điện tử xác nhận tiếp nhận kèm Mã tra cứu đến email ứng viên.

Bước 4: Cán bộ Ban Thành Viên (ceo.thanhvien@ceo1983.com) đăng nhập Web CRM, vào màn hình 'Quản Lý Hội Viên' (/members), mở ngăn kéo xem chi tiết hồ sơ ứng viên.

Bước 5: BTV đối soát thông tin pháp nhân trên Cổng ĐKKD quốc gia, kiểm tra MST và uy tín doanh nghiệp. Nhấn nút 'Phê Duyệt Kết Nạp'.

Bước 6: Hệ thống kiểm tra quyền hạn BTV, tự động sinh Mã hội viên chuẩn CEO-83xxx, kích hoạt tài khoản status = 'active', tạo mật khẩu ngẫu nhiên bảo mật cao và gửi Email Chào mừng kèm thông tin đăng nhập.

Bước 7: Hội viên tải và mở Ứng dụng Di động CEO 1983, đăng nhập bằng Email/SĐT và mật khẩu tạm. Hệ thống chuyển hướng bắt buộc đổi mật khẩu mới tại QuickProfileEditModal trước khi vào trang chủ.

#### UJ-02: Hành Trình Thông Báo Hội Phí ➔ Thanh Toán VietQR 24/7 ➔ Kế Toán Đối Soát Gạch Nợ (+365 Ngày)

**Đối tượng trải nghiệm:** Hội viên chính thức, Ban Tài Chính / Kế Toán

Bước 1: Hệ thống tự động quét ngày hết hạn thẻ VIP (term_end). Trước 30 ngày, hệ thống kích hoạt thông báo đẩy trên Mobile App và email thông báo nộp hội phí thường niên (5.000.000 VNĐ/năm).

Bước 2: Hội viên mở mục 'Hội Phí' trên Mobile App, nhấn nút 'Thanh Toán VietQR'.

Bước 3: Hệ thống sinh mã VietQR động chuẩn Napas 24/7 chứa sẵn: Số tiền (5.000.000 VNĐ), Số tài khoản thụ hưởng của CLB CEO 1983 và Cú pháp: HOIPHI CEO1983 [MÃ_HV] [HỌ_TÊN].

Bước 4: Hội viên sử dụng ứng dụng Mobile Banking của ngân hàng cá nhân, quét mã QR và chuyển khoản thành công.

Bước 5: Kế toán câu lạc bộ mở màn hình 'Quản Lý Hội Phí' (/fees) trên Web CRM, kiểm tra giao dịch tương ứng trên sao kê tài khoản ngân hàng thực tế.

Bước 6: Khi thông tin khớp đúng, kế toán bấm nút 'Duyệt Gạch Nợ'.

Bước 7: Hệ thống chuyển trạng thái sang paid, cộng dồn +365 ngày vào hạn dùng của Thẻ hội viên VIP (term_end), sinh hóa đơn điện tử (invoices) và gửi thông báo xác nhận thành công cho hội viên.

#### UJ-03: Hành Trình Khởi Tạo Sự Kiện Gala ➔ Thiết Kế Sơ Đồ Ghế ➔ Phát Hành E-Ticket ➔ Soát Vé Gate Check-in QR (< 0.2s)

**Đối tượng trải nghiệm:** Ban Truyền Thông (BTT), Ban Thư Ký (BTK), Hội viên tham dự

Bước 1: Ban Truyền Thông khởi tạo sự kiện Gala trên Web CRM (/events), thiết lập timeline chương trình, diễn giả VIP và cấu hình các hạng vé (VIP Đại biểu, Hội viên chính thức, Khách mời có phí).

Bước 2: Mở công cụ 'Cinema Seating Map' (/events/seating), kéo thả bố trí bàn tiệc tròn 10 chỗ (Bàn VIP 1 đến VIP 6 cho Lãnh đạo Thành ủy, HanoiBA), dãy ghế đại biểu danh dự và các bàn hội viên.

Bước 3: Hội viên mở Mobile App, xem thông tin sự kiện Gala, chọn vị trí ngồi và nhấn 'Đăng Ký Tham Dự'.

Bước 4: Hệ thống phát hành Vé điện tử E-Ticket QR lưu trong mục 'Vé Của Tôi' (hỗ trợ hiển thị offline). Vé chứa mã QR mã hóa bảo mật độc bản và mã số may mắn (#LUCKY-xxxx).

Bước 5: Tại sảnh đón tiếp sự kiện Gala, cán bộ an ninh BTT mở màn hình Cổng Soát Vé QR Gate (/checkin) trên máy tính bảng hoặc máy tính có camera.

Bước 6: Quét mã QR trên điện thoại của đại biểu. Tốc độ nhận diện < 0.2s: Màn hình bừng sáng XANH LỤC, hiển thị Họ tên, Đơn vị và Số bàn tiệc VIP; nếu quét lại lần 2, màn hình báo ĐỎ RỰC cảnh báo gian lận trùng vé.

Bước 7: Danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tự động đồng bộ vào Vòng quay may mắn (Lucky Draw) trên sân khấu đại hội.

#### UJ-04: Hành Trình Kết Nối Giao Thương B2B ➔ Chạm Danh Thiếp NFC ➔ Trao Đổi Cơ Hội Cung - Cầu 1-on-1

**Đối tượng trải nghiệm:** Hội viên Doanh nhân CEO 1983

Bước 1: Hai hội viên gặp gỡ trực tiếp, chạm mặt sau thẻ thông minh NFC vào điện thoại đối tác.

Bước 2: Điện thoại đối tác tự động mở trang Danh thiếp số công khai (/card/:code) hiển thị đầy đủ thông tin: Họ tên, Chức vụ, Logo công ty, Hồ sơ năng lực, Sản phẩm tiêu biểu và Nút 'Lưu Danh Bạ'.

Bước 3: Đối tác bấm 'Lưu Danh Bạ', hệ thống xuất ngay tệp vCard (.vcf) tự động nhập đầy đủ thông tin vào danh bạ điện thoại trong 1 giây.

Bước 4: Đối tác bấm 'Kết Nối B2B', chọn nhu cầu hợp tác và gửi lời mời kết nối kinh doanh 1-on-1.

Bước 5: Hội viên nhận được thông báo đẩy, mở Hộp Thư Messenger #0084FF và bấm 'Chấp Nhận Lời Mời'.

Bước 6: Hai hội viên trao đổi tin nhắn, tài liệu báo giá thời gian thực hoặc đăng bài lên Bảng tin Cơ hội Cung - Cầu để hiệp hội bảo chứng giao dịch.

#### UJ-05: Hành Trình Đại Hội Toàn Thể ➔ Biểu Quyết Trực Tuyến ➔ Công Bố Kết Quả Thời Gian Thực (Live 1s)

**Đối tượng trải nghiệm:** Ban Thư Ký (BTK), Hội viên chính thức

Bước 1: Ban Thư Ký tạo phiên biểu quyết trên Web CRM: Nhập tiêu đề nghị quyết đại hội, danh sách ứng viên Ban Chấp Hành nhiệm kỳ mới và thiết lập thời gian mở/đóng hòm phiếu.

Bước 2: Khi Chủ tọa đại hội phát lệnh, Ban Thư Ký bấm 'Kích Hoạt Phiên Bầu Cử'. Toàn bộ 500+ hội viên chính thức nhận được thông báo đẩy trên Mobile App.

Bước 3: Hội viên mở màn hình Biểu Quyết (/association/voting), xem chi tiết tờ trình nghị quyết, tích chọn các phương án (Đồng ý / Không đồng ý / Ý kiến khác) và bấm 'Xác Nhận Bỏ Phiếu'.

Bước 4: Hệ thống mã hóa một chiều phiếu bầu (Đảm bảo nguyên tắc 1 người 1 phiếu và ẩn danh tuyệt đối), khóa nút biểu quyết trên máy hội viên.

Bước 5: Máy chủ Socket.IO tổng hợp kết quả tức thời. Màn hình LED trung tâm của Đại hội hiển thị biểu đồ tỷ lệ phần trăm (%) nhảy động thời gian thực với độ trễ dưới 1 giây, công bố kết quả minh bạch 100%.

### 2.3. Môi Trường Hoạt Động Của Hệ Thống (Operating Environment)

* Phía Máy Khách (Clients):
  - Trình duyệt Web Desktop: Google Chrome 90+, Apple Safari 14+, Mozilla Firefox 90+, Microsoft Edge 90+.
  - Thiết bị Di động (Mobile): iOS 14.0+ (Safari PWA / Mobile Safari), Android 9.0+ (Chrome / Edge PWA / Native APK).
* Phía Máy Chủ (Server & Infrastructure):
  - Hệ điều hành máy chủ: Linux Ubuntu 22.04 LTS (Containerized Docker Architecture).
  - Web Server & Gateway: Nginx Reverse Proxy (SSL/TLS 1.3, HTTP/2, WSS Gateway Reverse Proxy).
  - Runtime Engine: Node.js v18.x LTS, NestJS Framework v10.x.
  - Cơ sở dữ liệu: PostgreSQL v15+ kết hợp Prisma ORM (@vibe/db) và Connection Pooler PgBouncer.
  - Lưu trữ tệp đối tượng: MinIO S3 Compatible Object Storage.
  - Động cơ thời gian thực: Socket.IO Gateway Engine.

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS — 56 USE CASES)

*Mỗi chức năng dưới đây được đặc tả theo đúng chuẩn quốc tế bao gồm 12 trường thông tin: Mã Use Case, Tên chức năng, Module, Mục tiêu, Tác nhân, Tiền điều kiện, Từ điển dữ liệu đầu vào, Luồng sự kiện chính (mỗi bước xuống dòng rõ ràng), Luồng thay thế, Luồng ngoại lệ, Hậu điều kiện, Quy tắc nghiệp vụ và Ánh xạ kỹ thuật CSDL/API.*


### [UC-PUB-01] Khám Phá Cổng Thông Tin & Giới Thiệu Tôn Chỉ CLB CEO 1983

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-PUB-01 |
| Tên Chức Năng | Khám Phá Cổng Thông Tin & Giới Thiệu Tôn Chỉ CLB CEO 1983 |
| Phân Hệ / Module | Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên |
| Mục Tiêu Nghiệp Vụ | Cung cấp cổng thông tin đối ngoại chính thức giới thiệu về lịch sử hình thành, ban lãnh đạo, 6 ban chuyên môn và các hoạt động tiêu biểu của CLB CEO 1983. |
| Tác Nhân (Actors) | Khách vãng lai, Doanh nhân ứng viên, Công chúng |
| Tiền Điều Kiện (Pre-conditions) | Người dùng có thiết bị kết nối Internet và trình duyệt web tiêu chuẩn. |
| Hậu Điều Kiện (Post-conditions) | Khách nắm bắt được đầy đủ thông tin uy tín của CLB Doanh Nhân CEO 1983. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-UI-ROYAL-NAVY-GOLD: Phải tuân thủ bộ nhận diện Xanh Navy #003B95 và Amber Gold #F59E0B. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/landing` | Component: `LandingPage.tsx` | Method: GET |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| URL truy cập | String | BẮT BUỘC | https://14.225.217.232:5444/landing |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng truy cập đường dẫn trang chủ Cổng thông tin công khai.

Bước 2: Hệ thống tải tài nguyên tĩnh, render Banner nhận diện thương hiệu Navy & Gold.

Bước 3: Hiển thị thông điệp Chủ tịch CLB, Tôn chỉ 'Bản lĩnh - Tiên phong - Kết nối - Phát triển'.

Bước 4: Hiển thị thông tin giới thiệu 6 Ban chuyên môn tác nghiệp và các số liệu thống kê quy mô (500+ hội viên, tổng giá trị giao thương).

Bước 5: Hiển thị các khối nội dung: Sự kiện sắp diễn ra, Tin tức hoạt động và Nút CTA 'Đăng Ký Gia Nhập'.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Người dùng chuyển đổi ngôn ngữ hiển thị (Tiếng Việt / English).

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Mất kết nối mạng Internet -> Trình duyệt kích hoạt Service Worker hiển thị màn hình Offline thân thiện.

### [UC-PUB-02] Nộp Hồ Sơ Đăng Ký Gia Nhập Hội Viên Chính Thức (e-Form 1983)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-PUB-02 |
| Tên Chức Năng | Nộp Hồ Sơ Đăng Ký Gia Nhập Hội Viên Chính Thức (e-Form 1983) |
| Phân Hệ / Module | Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên |
| Mục Tiêu Nghiệp Vụ | Tiếp nhận đơn đăng ký gia nhập câu lạc bộ từ các doanh nhân sinh năm 1983 thông qua biểu mẫu chuẩn hóa e-Form. |
| Tác Nhân (Actors) | Doanh nhân ứng viên sinh năm 1983 |
| Tiền Điều Kiện (Pre-conditions) | Ứng viên truy cập Cổng tiếp nhận hồ sơ tại `/landing?apply=true`. |
| Hậu Điều Kiện (Post-conditions) | Hồ sơ ứng viên được lưu trữ an toàn trong CSDL ở trạng thái pending, sẵn sàng cho Ban Thành Viên thẩm định. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-MEMBER-BIRTHYEAR-1983: Kiểm tra nghiêm ngặt năm sinh 1983. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/applications` | Tables: `members`, `activity_log` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| fullName | String (2-100 chars) | BẮT BUỘC | Không chứa ký tự đặc biệt |
| birthYear | Integer | BẮT BUỘC | Bắt buộc chính xác là năm 1983 |
| phone | String (10 digits) | BẮT BUỘC | Định dạng số điện thoại di động Việt Nam |
| email | String | BẮT BUỘC | Email doanh nghiệp chuẩn RFC 5322 |
| companyName | String | BẮT BUỘC | Tên pháp nhân theo ĐKKD |
| taxCode | String (10-13 digits) | BẮT BUỘC | Mã số thuế doanh nghiệp hợp lệ |
| position | String | BẮT BUỘC | Chức vụ lãnh đạo (Chủ tịch, TGĐ, Giám đốc) |
| industry | String | BẮT BUỘC | Lĩnh vực ngành nghề kinh doanh cốt lõi |
| committeePreference | String | Tùy chọn | Thuộc 1 trong 6 ban chuyên môn |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ứng viên mở biểu mẫu đăng ký gia nhập trên Cổng thông tin công khai.

Bước 2: Điền đầy đủ và chính xác toàn bộ 9 trường dữ liệu bắt buộc.

Bước 3: Tích chọn cam kết tuân thủ Điều lệ của CLB Doanh Nhân CEO 1983 và HanoiBA.

Bước 4: Nhấn nút 'Gửi Hồ Sơ Đăng Ký'.

Bước 5: Hệ thống thực hiện kiểm tra tính hợp lệ dữ liệu (Validation) ở cả Client và Server.

Bước 6: Hệ thống tạo bản ghi mới trong bảng `members` với trạng thái `status = 'pending'`, `fee_paid = false`.

Bước 7: Kích hoạt dịch vụ SMTP Mailer tự động gửi email xác nhận đến hòm thư ứng viên kèm Mã tra cứu hồ sơ.

Bước 8: Hiển thị thông báo tiếp nhận thành công trên màn hình kèm hướng dẫn các bước thẩm định tiếp theo.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Ứng viên tải kèm ảnh Giấy phép đăng ký kinh doanh (.pdf hoặc .jpg) lên MinIO Storage.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Năm sinh khác 1983 -> Báo lỗi: 'CLB CEO 1983 chỉ tiếp nhận hội viên sinh năm Quý Hợi 1983'.

Bước E2: Email hoặc Số điện thoại đã tồn tại trong CSDL -> Báo lỗi: 'Thông tin này đã được đăng ký, vui lòng liên hệ Ban Thành Viên'.

Bước E3: Định dạng mã số thuế không hợp lệ -> Báo lỗi: 'Mã số thuế phải có độ dài từ 10 đến 13 chữ số'.

### [UC-PUB-03] Tự Động Phát Hành Email Tiếp Nhận Hồ Sơ Qua SMTP Relay

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-PUB-03 |
| Tên Chức Năng | Tự Động Phát Hành Email Tiếp Nhận Hồ Sơ Qua SMTP Relay |
| Phân Hệ / Module | Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên |
| Mục Tiêu Nghiệp Vụ | Hệ thống máy chủ dịch vụ tự động phát hành email xác nhận ngay khi ứng viên nộp hồ sơ đăng ký thành công. |
| Tác Nhân (Actors) | Máy chủ dịch vụ SMTP Mailer ngầm định (Backend Service) |
| Tiền Điều Kiện (Pre-conditions) | Bản ghi đăng ký [UC-PUB-02] được tạo thành công trong CSDL. |
| Hậu Điều Kiện (Post-conditions) | Ứng viên nhận được thư xác nhận chính thức trong hộp thư đến (Inbox) trong vòng dưới 10 giây. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Đảm bảo tỷ lệ gửi thư thành công đạt > 99.5%, tránh rơi vào hòm thư rác (Spam). |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Service: `mailer.service.ts` | Config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| recipientEmail | String | BẮT BUỘC | Email ứng viên vừa đăng ký |
| applicantName | String | BẮT BUỘC | Họ và tên ứng viên |
| applicationId | String UUID | BẮT BUỘC | Mã định danh hồ sơ hệ thống cấp |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Sự kiện APPLICATION_SUBMITTED kích hoạt Job trong hàng đợi xử lý thư tín.

Bước 2: Dịch vụ nạp Template email HTML thương hiệu CEO 1983 (Màu Navy/Gold, Logo HanoiBA).

Bước 3: Điền thông tin cá nhân hóa: Họ tên, Tên doanh nghiệp, Mã tra cứu hồ sơ và Quy trình thẩm định 4 bước.

Bước 4: Kết nối an toàn đến cổng SMTP Relay bảo mật (smtp.gmail.com:465 qua SSL/TLS).

Bước 5: Phát hành thư điện tử đến hộp thư ứng viên.

Bước 6: Ghi nhận nhật ký gửi thư thành công vào bảng `activity_log`.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Hòm thư nhận tạm thời không liên lạc được -> Xếp hàng thử lại sau 5 phút (Tối đa 3 lần).

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Lỗi xác thực SMTP hoặc mất kết nối mạng -> Ghi nhận lỗi vào hệ thống giám sát và thông báo quản trị viên.

### [UC-PUB-04] Tra Cứu Danh Bạ Doanh Nghiệp Hội Viên Công Khai (Chống Lộ SĐT)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-PUB-04 |
| Tên Chức Năng | Tra Cứu Danh Bạ Doanh Nghiệp Hội Viên Công Khai (Chống Lộ SĐT) |
| Phân Hệ / Module | Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên |
| Mục Tiêu Nghiệp Vụ | Cho phép đối tác và công chúng tra cứu thông tin năng lực cung ứng của các doanh nghiệp thành viên chính thức. |
| Tác Nhân (Actors) | Khách vãng lai, Đối tác tìm kiếm nhà cung cấp |
| Tiền Điều Kiện (Pre-conditions) | Cổng thông tin công khai đang hoạt động. |
| Hậu Điều Kiện (Post-conditions) | Đối tác tiếp cận được thông tin doanh nghiệp thành viên uy tín. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Chỉ hiển thị doanh nghiệp của hội viên chính thức đã được Ban Thành Viên xác thực. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `GET /api/association/public-directory` | Table: `companies`, `members` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| keyword | String | Tùy chọn | Từ khóa: Tên doanh nghiệp, ngành nghề, mã số thuế |
| industryFilter | String | Tùy chọn | Lọc theo danh mục ngành nghề |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng nhập từ khóa tìm kiếm hoặc chọn ngành nghề cần tra cứu.

Bước 2: Hệ thống thực hiện truy vấn bảng `companies` kết hợp `members` với điều kiện `status = 'active'` và `is_verified = true`.

Bước 3: Hiển thị danh sách kết quả dạng lưới: Logo doanh nghiệp, Tên công ty, Lĩnh vực, Chức vụ lãnh đạo và Địa chỉ trụ sở.

Bước 4: Người dùng bấm vào từng doanh nghiệp để xem Hồ sơ năng lực chi tiết (Ẩn số điện thoại cá nhân theo chính sách bảo mật).

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Không tìm thấy kết quả -> Hiển thị thông báo gợi ý mở rộng phạm vi tìm kiếm.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Lỗi timeout truy vấn cơ sở dữ liệu -> Trả về danh sách rỗng kèm thông báo thử lại.

### [UC-PUB-05] Khám Phá Sự Kiện Mở Rộng & Đăng Ký Vé Dành Cho Khách Mời

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-PUB-05 |
| Tên Chức Năng | Khám Phá Sự Kiện Mở Rộng & Đăng Ký Vé Dành Cho Khách Mời |
| Phân Hệ / Module | Phân hệ 1: Cổng Thông Tin Công Khai & Tiếp Nhận Ứng Viên |
| Mục Tiêu Nghiệp Vụ | Cho phép khách vãng lai xem lịch trình các sự kiện hội thảo mở rộng và đăng ký mua vé tham dự trực tuyến. |
| Tác Nhân (Actors) | Khách mời, Doanh nhân ngoài hiệp hội |
| Tiền Điều Kiện (Pre-conditions) | Sự kiện được cấu hình cho phép khách mời công chúng đăng ký. |
| Hậu Điều Kiện (Post-conditions) | Khách mời nhận được vé QR điện tử qua email để check-in tại cửa sự kiện. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Khách mời bắt buộc hoàn tất thanh toán trước khi nhận vé. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/events/:id/guest-register` | Table: `event_registrations` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| guestName | String | BẮT BUỘC | Họ và tên khách mời |
| guestPhone | String | BẮT BUỘC | Số điện thoại liên hệ |
| guestEmail | String | BẮT BUỘC | Email nhận vé điện tử |
| ticketTypeId | String | BẮT BUỘC | Gói vé khách mời có phí |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Khách truy cập mục Sự Kiện trên Cổng thông tin công khai.

Bước 2: Chọn sự kiện hội nghị / Gala quan tâm, bấm 'Đăng Ký Tham Dự'.

Bước 3: Điền thông tin cá nhân và chọn số lượng vé khách mời.

Bước 4: Màn hình hiển thị mã VietQR thanh toán tiền vé theo số lượng.

Bước 5: Khách chuyển khoản quét mã VietQR, hệ thống ghi nhận đăng ký ở trạng thái `pending_payment`.

Bước 6: Kế toán đối soát và duyệt phát hành vé E-Ticket QR gửi qua email khách mời.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Sự kiện đã hết số lượng vé khách mời -> Báo lỗi: 'Vé dành cho khách mời đã hết'.

### [UC-CRM-AUTH-01] Đăng Nhập Quản Trị Web CRM & Khóa Chống Brute-force 5 Lần

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-AUTH-01 |
| Tên Chức Năng | Đăng Nhập Quản Trị Web CRM & Khóa Chống Brute-force 5 Lần |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Xác thực danh tính của cán bộ quản lý (BQT, BTK, Trưởng các ban) trước khi cấp quyền truy cập hệ thống CRM. |
| Tác Nhân (Actors) | Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn |
| Tiền Điều Kiện (Pre-conditions) | Người dùng đã được cấp tài khoản quản trị và tài khoản ở trạng thái active. |
| Hậu Điều Kiện (Post-conditions) | Cán bộ quản trị thiết lập phiên làm việc hợp lệ và truy cập các chức năng quản trị theo phân quyền. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Áp dụng cơ chế phòng vệ tự động chống dò quét mật khẩu (Rate Limiting). |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/auth/login` | Tables: `vione_users`, `user_roles`, `audit_logs` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| usernameOrEmail | String | BẮT BUỘC | Email công vụ hoặc Mã hội viên quản trị |
| password | String | BẮT BUỘC | Mật khẩu quản trị (Tối thiểu 8 ký tự) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Cán bộ quản lý truy cập Cổng Quản trị CRM tại https://14.225.217.232:5443.

Bước 2: Nhập Email/Tên đăng nhập và Mật khẩu.

Bước 3: Bấm nút 'Đăng Nhập Hệ Thống'.

Bước 4: Hệ thống truy vấn bảng `vione_users`, lấy chuỗi băm mật khẩu và so khớp bằng thuật toán `bcrypt.compare()`.

Bước 5: Kiểm tra vai trò tài khoản trong `user_roles`: Bắt buộc phải thuộc 1 trong các vai trò quản trị (quan_tri, admin, tong_thu_ky, truong_ban).

Bước 6: Khởi tạo cặp mã khóa JWT: Access Token (thời hạn 15 phút) và Refresh Token (thời hạn 7 ngày).

Bước 7: Lưu thông tin phiên làm việc an toàn trong Cookie HttpOnly và LocalStorage.

Bước 8: Ghi nhận bản ghi nhật ký đăng nhập vào `audit_logs` (User, IP, User-Agent, Timestamp).

Bước 9: Chuyển hướng người dùng vào Bàn làm việc Dashboard trung tâm (/).

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Người dùng tích chọn 'Ghi nhớ đăng nhập' -> Tăng thời hạn Refresh Token lên 30 ngày.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Sai mật khẩu hoặc tài khoản không tồn tại -> Báo lỗi: 'Email hoặc mật khẩu không chính xác'.

Bước E2: Nhập sai mật khẩu liên tiếp quá 5 lần -> Tạm khóa tài khoản trong 15 phút chống tấn công Brute-force.

Bước E3: Tài khoản có vai trò member cố tình đăng nhập CRM -> Báo lỗi HTTP 403: 'Tài khoản không có thẩm quyền truy cập Cổng Quản Trị'.

### [UC-CRM-DASH-01] Bàn Làm Việc Tổng Quan (Dashboard KPI & Cơ Cấu 6 Chuyên Ban)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-DASH-01 |
| Tên Chức Năng | Bàn Làm Việc Tổng Quan (Dashboard KPI & Cơ Cấu 6 Chuyên Ban) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Hiển thị bức tranh toàn cảnh về tình hình hoạt động của hiệp hội: Quy mô hội viên, tiến độ thu hội phí, giá trị giao thương B2B và các sự kiện sắp tới. |
| Tác Nhân (Actors) | Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng nhập thành công vào Cổng Quản trị CRM. |
| Hậu Điều Kiện (Post-conditions) | Lãnh đạo nắm bắt kịp thời các chỉ số điều hành then chốt. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Dữ liệu thống kê được làm mới tự động sau mỗi 60 giây. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/dashboard` | API: `GET /api/association/dashboard-stats` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| timeRange | Enum | Tùy chọn | Tuần này | Tháng này | Quý này | Năm nay |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng mở trang chủ Dashboard CRM (`/` hoặc `/dashboard`).

Bước 2: Hệ thống truy vấn song song dữ liệu từ các phân hệ:

   - Tổng số hội viên chính thức và tỷ lệ tăng trưởng trong tháng.

   - Tỷ lệ hoàn thành nghĩa vụ hội phí thường niên (Số tiền đã thu / Kế hoạch năm).

   - Tổng giá trị kết nối giao thương B2B nội bộ được ghi nhận.

   - Biểu đồ phân bổ hội viên theo 6 Ban chuyên môn và theo phân khúc ngành nghề.

Bước 3: Hiển thị danh sách các việc cần xử lý ngay: Hồ sơ chờ BTV duyệt, Phiếu chi chờ duyệt, Lịch họp sắp diễn ra.

Bước 4: Người dùng bấm vào từng thẻ KPI để điều hướng nhanh đến phân hệ tương ứng.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Lỗi kết nối dịch vụ thống kê -> Hiển thị thông báo và nút 'Tải lại dữ liệu'.

### [UC-CRM-MBR-01] Quản Lý Danh Sách Hội Viên Đa Chiều & Bộ Lọc Nâng Cao

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MBR-01 |
| Tên Chức Năng | Quản Lý Danh Sách Hội Viên Đa Chiều & Bộ Lọc Nâng Cao |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Cung cấp bảng dữ liệu toàn diện 500+ hội viên với bộ lọc đa điều kiện, hỗ trợ cuộn ngang chuẩn với Cột STT cố định bên trái và Cột Thao tác cố định bên phải. |
| Tác Nhân (Actors) | Ban Quản Trị, Ban Thành Viên, Ban Thư Ký |
| Tiền Điều Kiện (Pre-conditions) | Đăng nhập Cổng Quản trị CRM với vai trò có quyền xem danh sách hội viên. |
| Hậu Điều Kiện (Post-conditions) | Cán bộ quản lý nắm bắt chính xác dữ liệu hội viên phục vụ điều hành. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Bảng dữ liệu phải có thiết kế cuộn ngang mượt mà, không bị che khuất nút thao tác. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/members` | API: `GET /api/association/members` | Table: `members` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| committee | String | Tùy chọn | Lọc theo 1 trong 6 ban chuyên môn |
| paymentStatus | String | Tùy chọn | Lọc: Tất cả / Đã đóng (paid) / Chưa đóng (unpaid) |
| tier | String | Tùy chọn | Hạng hội viên: Kim Cương / Vàng / Bạc / Tiêu Chuẩn |
| keyword | String | Tùy chọn | Tìm kiếm theo Họ tên, Mã HV, SĐT, Tên công ty, MST |
| page | Integer | Tùy chọn | Số trang phân trang (Mặc định: 1, 20 bản ghi/trang) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng mở màn hình 'Danh Sách Hội Viên' (/members) trên CRM.

Bước 2: Hệ thống tải danh sách hội viên kèm các chỉ số KPI tóm tắt trên đầu trang (Tổng số hội viên, Số hội viên mới tháng này, Tỷ lệ hoàn thành hội phí).

Bước 3: Hiển thị bảng dữ liệu: Cột STT ghim cố định bên trái; các cột dữ liệu: Mã HV, Họ tên, Chức vụ, Tên doanh nghiệp, SĐT, Ban chuyên môn, Trạng thái hội phí, Hạng hội viên; Cột 'Thao Tác' ghim cố định bên phải.

Bước 4: Người dùng áp dụng các bộ lọc hoặc nhập từ khóa tìm kiếm.

Bước 5: Bảng dữ liệu tự động cập nhật kết quả trong thời gian < 100ms.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Người dùng nhấn nút 'Xuất Excel' -> Hệ thống xuất file bảng tính `.xlsx` danh sách theo đúng bộ lọc đang chọn.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Không tìm thấy bản ghi phù hợp -> Hiển thị hình ảnh trạng thái rỗng và nút 'Đặt lại bộ lọc'.

### [UC-CRM-MBR-02] Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới (Độc Quyền BTV)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MBR-02 |
| Tên Chức Năng | Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới (Độc Quyền BTV) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Thẩm định tính hợp lệ của hồ sơ ứng viên và phê duyệt kết nạp chính thức, cấp mã hội viên định danh CEO-83xxx. Chức năng ĐỘC QUYỀN của Ban Thành Viên. |
| Tác Nhân (Actors) | Trưởng Ban Thành Viên (ceo.thanhvien@ceo1983.com) hoặc Superadmin |
| Tiền Điều Kiện (Pre-conditions) | Hồ sơ ứng viên đang ở trạng thái pending trong danh sách chờ duyệt. |
| Hậu Điều Kiện (Post-conditions) | Ứng viên chính thức trở thành Hội viên CLB CEO 1983, có mã định danh, tài khoản di động và danh thiếp số. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-AUTH-BTV-EXCLUSIVE: Nghiêm cấm tuyệt đối Ban Thư Ký phê duyệt hội viên. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/members/:id/approve` | Tables: `members`, `vione_users`, `member_business_cards` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| memberId | String | BẮT BUỘC | Mã định danh hồ sơ cần duyệt |
| assignedCommittee | String | BẮT BUỘC | Chuyên ban chỉ định sinh hoạt (1 trong 6 ban) |
| memberTier | String | BẮT BUỘC | Hạng hội viên ban đầu (Mặc định: Tiêu Chuẩn) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Cán bộ BTV mở tab 'Chờ Thẩm Định' trên màn hình Quản lý hội viên.

Bước 2: Bấm vào hồ sơ ứng viên để mở Ngăn kéo chi tiết (Drawer) hiển thị toàn bộ thông tin đăng ký.

Bước 3: BTV kiểm tra: Năm sinh (chính xác 1983), Mã số thuế, Năng lực doanh nghiệp và uy tín kinh doanh.

Bước 4: BTV lựa chọn Ban chuyên môn sinh hoạt phù hợp và bấm nút 'Phê Duyệt Kết Nạp'.

Bước 5: Hệ thống kiểm tra quyền hạn của người thực hiện (Bắt buộc phải là BTV hoặc BQT; CHẶN TUYỆT ĐỐI NẾU LÀ BAN THƯ KÝ HOẶC BAN KHÁC).

Bước 6: Hệ thống thực hiện chuỗi giao dịch nguyên tử (Atomic Transaction):

   - Tự động sinh Mã hội viên chuẩn: CEO-83xxx (Tìm số lớn nhất hiện tại + 1, ví dụ: CEO-83008).

   - Cập nhật bản ghi trong `members`: status = 'active', code = 'CEO-83xxx', joined_at = NOW().

   - Tạo tài khoản đăng nhập trong `vione_users` với mật khẩu khởi tạo ngẫu nhiên, bật cờ must_change_password = true.

   - Tạo bản ghi Thẻ doanh nhân điện tử trong `member_business_cards` với slug công khai /card/ceo83xxx.

Bước 7: Kích hoạt dịch vụ SMTP Mailer gửi Email Chào mừng chính thức gia nhập CLB CEO 1983 kèm thông tin đăng nhập đến hòm thư hội viên.

Bước 8: Ghi nhật ký phê duyệt vào bảng `activity_log`.

Bước 9: Đóng ngăn kéo, làm mới danh sách và hiển thị thông báo thành công rực rỡ.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Hồ sơ không đủ điều kiện -> BTV bấm nút 'Từ Chối Kết Nạp', nhập lý do từ chối (VD: Sai năm sinh, doanh nghiệp vi phạm pháp luật). Hệ thống chuyển trạng thái sang rejected và gửi email thông báo từ chối lịch thiệp.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Tài khoản Ban Thư Ký hoặc ban khác bấm duyệt -> Hệ thống chặn ngay lập tức, trả về mã lỗi HTTP 403 Forbidden: 'Ban Thư Ký không có thẩm quyền phê duyệt kết nạp hội viên. Thẩm quyền này thuộc về Ban Thành Viên'.

Bước E2: Trùng lặp mã hội viên trong transaction -> Hệ thống tự động rollback và thử lại với số thứ tự kế tiếp.

### [UC-CRM-MBR-03] Hồ Sơ Hội Viên 360 Độ & Lịch Sử Tương Tác Đa Chiều

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MBR-03 |
| Tên Chức Năng | Hồ Sơ Hội Viên 360 Độ & Lịch Sử Tương Tác Đa Chiều |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Cung cấp góc nhìn toàn cảnh 360 độ về một hội viên: Thông tin pháp nhân, lịch sử đóng hội phí, lịch sử tham gia sự kiện Gala, điểm danh cuộc họp, các sản phẩm B2B đang bán và điểm cống hiến. |
| Tác Nhân (Actors) | Ban Quản Trị, Ban Thành Viên, Ban Thư Ký |
| Tiền Điều Kiện (Pre-conditions) | Hội viên đã có mã định danh trong hệ thống. |
| Hậu Điều Kiện (Post-conditions) | Cán bộ quản lý có đầy đủ thông tin để đánh giá mức độ tích cực và tiềm năng của hội viên. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Dữ liệu được tổng hợp thời gian thực từ 6 bảng CSDL liên quan. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/members/$memberId` | API: `GET /api/association/members/:id/full-profile` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| memberId | String | BẮT BUỘC | Mã định danh hoặc Mã số hội viên (CEO-83xxx) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng bấm vào dòng hội viên trên bảng danh sách.

Bước 2: Hệ thống mở trang Chi tiết Hội viên 360 độ (/members/$memberId).

Bước 3: Hiển thị khối thông tin tổng quan: Avatar, Họ tên, Chức vụ, Tên công ty, Mã HV, Ban chuyên môn, Hạng thẻ VIP.

Bước 4: Hiển thị các tab dữ liệu chuyên sâu:

   - Tab 'Hồ Sơ Doanh Nghiệp': MST, Giấy phép ĐKKD, Website, Địa chỉ trụ sở, Ngành nghề, Quy mô nhân sự.

   - Tab 'Lịch Sử Hội Phí': Danh sách các kỳ hội phí đã đóng, số tiền, ngày gạch nợ, hóa đơn điện tử.

   - Tab 'Sự Kiện & Hội Nghị': Danh sách sự kiện đã đăng ký, vị trí bàn tiệc VIP, trạng thái check-in tại cửa.

   - Tab 'Cuộc Họp & Điểm Danh': Tỷ lệ tham dự các cuộc họp Ban Chấp Hành, lịch sử quét QR điểm danh.

   - Tab 'Gian Hàng B2B': Các sản phẩm đang đăng bán và mức chiết khấu trợ giá nội bộ.

   - Tab 'Nhiệm Vụ Được Giao': Danh sách các công việc trong các ban chuyên môn và tiến độ hoàn thành.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Hội viên không tồn tại -> Hiển thị thông báo 404 và nút quay lại danh sách.

### [UC-CRM-MBR-04] Phân Khúc Hội Viên & Xếp Hạng Điểm Cống Hiến Thường Niên

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MBR-04 |
| Tên Chức Năng | Phân Khúc Hội Viên & Xếp Hạng Điểm Cống Hiến Thường Niên |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Phân loại hội viên theo tiêu chí đóng góp, chuyên cần và khối ngành nghề; tự động xếp hạng thẻ VIP Kim Cương, Vàng, Bạc. |
| Tác Nhân (Actors) | Ban Thành Viên (BTV), Ban Quản Trị |
| Tiền Điều Kiện (Pre-conditions) | Dữ liệu hoạt động của hội viên được cập nhật đầy đủ. |
| Hậu Điều Kiện (Post-conditions) | Hội viên được nâng cấp hạng thẻ VIP tương ứng trên Mobile App. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Hội viên nợ hội phí không được xét hạng Kim Cương. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/segments` | API: `POST /api/association/members/evaluate-tiers` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| evaluationYear | Integer | BẮT BUỘC | Năm đánh giá xếp hạng |
| criteriaWeights | JSON | Tùy chọn | Trọng số điểm: Chuyên cần, Hội phí, Thiện nguyện, Giao thương |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: BTV mở màn hình 'Phân Khúc & Xếp Hạng' (`/segments`) trên Web CRM.

Bước 2: Hệ thống tính toán điểm cống hiến tự động theo công thức:

   - Điểm chuyên cần họp và sự kiện (Tối đa 30 điểm).

   - Điểm hoàn thành hội phí đúng hạn (Tối đa 20 điểm).

   - Điểm đóng góp quỹ thiện nguyện (Tối đa 25 điểm).

   - Điểm giao thương B2B nội bộ (Tối đa 25 điểm).

Bước 3: Tự động phân hạng hội viên:

   - Từ 90 - 100 điểm: Hạng Kim Cương (Diamond Member).

   - Từ 75 - 89 điểm: Hạng Vàng (Gold Member).

   - Từ 60 - 74 điểm: Hạng Bạc (Silver Member).

   - Dưới 60 điểm: Hạng Tiêu Chuẩn (Standard Member).

Bước 4: BTV xác nhận và công bố bảng xếp hạng thường niên.

### [UC-CRM-MBR-05] Kích Hoạt, Khóa Tài Khoản & Cấp Lại Mật Khẩu Khởi Tạo

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MBR-05 |
| Tên Chức Năng | Kích Hoạt, Khóa Tài Khoản & Cấp Lại Mật Khẩu Khởi Tạo |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Quản trị trạng thái hoạt động của tài khoản hội viên: Tạm khóa, mở khóa, hoặc cấp lại mật khẩu khởi tạo khi hội viên quên. |
| Tác Nhân (Actors) | Ban Quản Trị, Ban Thành Viên |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản hội viên tồn tại trong hệ thống. |
| Hậu Điều Kiện (Post-conditions) | Trạng thái tài khoản được cập nhật tức thời trên toàn hệ thống. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mọi thao tác khóa/mở khóa bắt buộc nhập lý do chi tiết. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/members/:id/account-action` | Table: `vione_users` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| memberId | String | BẮT BUỘC | Mã hội viên cần thao tác |
| actionType | Enum | BẮT BUỘC | lock | unlock | reset_password |
| reason | String | BẮT BUỘC | Lý do thao tác phục vụ kiểm toán |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Cán bộ quản lý tìm kiếm hội viên trên màn hình Quản lý hội viên.

Bước 2: Chọn menu thao tác bên phải dòng dữ liệu, chọn 'Khóa Tài Khoản' hoặc 'Cấp Lại Mật Khẩu'.

Bước 3: Nhập lý do thực hiện vào hộp thoại xác nhận.

Bước 4: Hệ thống thực thi:

   - Nếu Khóa: Cập nhật `status = 'suspended'`, thu hồi toàn bộ Refresh Token đang hoạt động.

   - Nếu Cấp lại mật khẩu: Sinh mật khẩu ngẫu nhiên mới, băm Bcrypt, bật cờ `must_change_password = true`, gửi email chứa mật khẩu mới đến hòm thư hội viên.

Bước 5: Ghi nhận nhật ký vào `audit_logs`.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Không thể khóa tài khoản của chính Superadmin đang đăng nhập.

### [UC-CRM-EVT-01] Khởi Tạo Sự Kiện Hội Nghị & Gala Dinner (Event Wizard)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-EVT-01 |
| Tên Chức Năng | Khởi Tạo Sự Kiện Hội Nghị & Gala Dinner (Event Wizard) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Khởi tạo sự kiện đại hội, hội thảo chuyên đề hoặc đêm tiệc Gala Dinner, thiết lập timeline chương trình và cấu hình các hạng vé mời. |
| Tác Nhân (Actors) | Ban Truyền Thông & Sự Kiện (BTT), Ban Quản Trị |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản có quyền quản trị sự kiện. |
| Hậu Điều Kiện (Post-conditions) | Sự kiện được khởi tạo thành công ở trạng thái bản nháp. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-UI-ROYAL-NAVY-GOLD: Ảnh banner sự kiện bắt buộc tỷ lệ 16:9 sắc nét. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/events` | API: `POST /api/association/events` | Table: `events` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| eventName | String | BẮT BUỘC | Tên sự kiện (VD: Gala Kỷ Niệm 3 Năm CEO 1983) |
| eventDate | DateTime | BẮT BUỘC | Thời gian bắt đầu và kết thúc |
| location | String | BẮT BUỘC | Địa điểm tổ chức hội trường |
| capacity | Integer | BẮT BUỘC | Sức chứa tối đa (VD: 500 khách) |
| bannerUrl | String URL | BẮT BUỘC | Ảnh bìa sự kiện tỷ lệ chuẩn 16:9 |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng mở màn hình 'Quản Lý Sự Kiện' (/events) và bấm 'Tạo Sự Kiện Mới'.

Bước 2: Trình tạo sự kiện đa bước (Wizard) mở ra: Bước 1: Thông tin chung; Bước 2: Diễn giả & Timeline; Bước 3: Cấu hình gói vé; Bước 4: Sơ đồ chỗ ngồi.

Bước 3: Nhập thông tin chung và tải ảnh banner 16:9 lên MinIO Storage.

Bước 4: Nhập danh sách diễn giả VIP, timeline chi tiết từng khung giờ.

Bước 5: Bấm 'Lưu & Tiếp Tục' sang bước cấu hình gói vé.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Lưu ở trạng thái 'Bản nháp' (draft) để tiếp tục chỉnh sửa nội dung trước khi công bố.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Thời gian kết thúc trước thời gian bắt đầu -> Báo lỗi validation.

Bước E2: Ảnh banner sai tỷ lệ -> Cảnh báo tối ưu chuẩn 16:9.

### [UC-CRM-EVT-02] Cấu Hình Đa Gói Vé E-Ticket (VIP, Tiêu Chuẩn, Khách Mời)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-EVT-02 |
| Tên Chức Năng | Cấu Hình Đa Gói Vé E-Ticket (VIP, Tiêu Chuẩn, Khách Mời) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Thiết lập các loại vé mời khác nhau cho sự kiện: Vé VIP miễn phí cho Lãnh đạo, Vé đặc quyền hội viên, Vé khách mời có phụ thu. |
| Tác Nhân (Actors) | Ban Truyền Thông (BTT), Ban Tài Chính |
| Tiền Điều Kiện (Pre-conditions) | Sự kiện đã được khởi tạo. |
| Hậu Điều Kiện (Post-conditions) | Các gói vé sẵn sàng mở bán và đăng ký trên Mobile App. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Hội viên chính thức hoàn thành hội phí luôn được đăng ký vé VIP 0 VNĐ. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/events/:id/ticket-types` | Table: `event_ticket_types` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| ticketName | String | BẮT BUỘC | Tên gói vé (Vé VIP Đại Biểu / Vé Hội Viên / Vé Khách) |
| price | Decimal | BẮT BUỘC | Giá vé (0 VNĐ hoặc 1.500.000 VNĐ) |
| quantity | Integer | BẮT BUỘC | Số lượng vé tối đa phát hành |
| description | String | Tùy chọn | Quyền lợi đính kèm gói vé |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại bước Cấu hình vé của Sự kiện, bấm 'Thêm Gói Vé Mới'.

Bước 2: Cấu hình Gói 'Vé VIP Đại Biểu': Giá 0 VNĐ, số lượng 50 vé, dành cho Lãnh đạo Thành ủy, HanoiBA.

Bước 3: Cấu hình Gói 'Vé Hội Viên Chính Thức': Giá 0 VNĐ, số lượng 350 vé, tự động nhận diện hội viên.

Bước 4: Cấu hình Gói 'Vé Khách Mời Mở Rộng': Giá 1.500.000 VNĐ, số lượng 100 vé, có phụ thu tiệc tối.

Bước 5: Nhấn 'Lưu Cấu Hình Vé'. Dữ liệu lưu vào bảng `event_ticket_types`.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Tổng số lượng vé các gói vượt quá sức chứa hội trường -> Báo lỗi cảnh báo vượt tải.

### [UC-CRM-EVT-03] Thiết Kế Sơ Đồ Chỗ Ngồi Trực Quan Cinema Seating Map (Bàn Gala VIP)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-EVT-03 |
| Tên Chức Năng | Thiết Kế Sơ Đồ Chỗ Ngồi Trực Quan Cinema Seating Map (Bàn Gala VIP) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Bố trí trực quan sơ đồ bàn tiệc Gala VIP và dãy ghế hội trường, gán số bàn và số ghế định danh cho từng đại biểu. |
| Tác Nhân (Actors) | Ban Truyền Thông (BTT), Ban Thư Ký (BTK) |
| Tiền Điều Kiện (Pre-conditions) | Sự kiện đã được khởi tạo thành công. |
| Hậu Điều Kiện (Post-conditions) | 100% đại biểu tham dự có vị trí chỗ ngồi được định danh rõ ràng trên hệ thống. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-EVT-SEATING: Mỗi đại biểu có đúng 01 vị trí ghế ngồi định danh trên Cinema Seating Map. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/events/seating` | API: `PUT /api/association/events/:id/seating` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| eventId | String | BẮT BUỘC | Mã sự kiện cần thiết kế sơ đồ |
| seatingLayout | JSON | BẮT BUỘC | Cấu trúc sơ đồ bàn tiệc tròn (10 chỗ/bàn) và dãy ghế |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ban tổ chức mở màn hình 'Sơ Đồ Ghế Ngồi' (/events/seating) cho sự kiện Gala.

Bước 2: Giao diện trực quan hiển thị Sân khấu chính (Main Stage) ở vị trí trung tâm phía trên.

Bước 3: Thêm các Cụm Bàn Tròn Gala VIP (Mỗi bàn 10 ghế): Bàn VIP 1 đến VIP 6 đặt sát sân khấu dành cho Lãnh đạo.

Bước 4: Thêm các Cụm Bàn Hội viên (Bàn 7 đến Bàn 40) ở các khu vực kế tiếp.

Bước 5: Kéo thả phân bổ tên đại biểu VIP vào các ghế định danh hoặc thiết lập chế độ hội viên tự chọn chỗ khi đăng ký vé.

Bước 6: Nhấn nút 'Lưu Sơ Đồ Chỗ Ngồi'.

Bước 7: Hệ thống cập nhật sơ đồ và đồng bộ trực tiếp vào dữ liệu vé của từng đại biểu.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Xếp trùng đại biểu vào 2 ghế khác nhau -> Hệ thống phát hiện xung đột và cảnh báo.

### [UC-CRM-EVT-04] Cổng An Ninh Soát Vé Gate Check-in QR Tốc Độ Cao (< 0.2s)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-EVT-04 |
| Tên Chức Năng | Cổng An Ninh Soát Vé Gate Check-in QR Tốc Độ Cao (< 0.2s) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Nhận diện mã vé điện tử E-Ticket qua camera, xác minh tính hợp lệ và vị trí chỗ ngồi dưới 200ms; kích hoạt cảnh báo đỏ chống gian lận vé trùng lặp. |
| Tác Nhân (Actors) | Cán bộ an ninh / Lễ tân Ban Truyền Thông (BTT) |
| Tiền Điều Kiện (Pre-conditions) | Sự kiện đang trong khung giờ đón tiếp đại biểu; thiết bị có camera kết nối mạng. |
| Hậu Điều Kiện (Post-conditions) | Đại biểu được qua cửa an toàn, thông tin check-in được lưu trữ phục vụ quay thưởng Lucky Draw. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-EVENT-SINGLE-CHECKIN: Mỗi mã vé chỉ được qua cửa đúng 01 lần duy nhất. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/checkin` | API: `POST /api/association/checkin` | Table: `member_checkins` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| qrPayload | String | BẮT BUỘC | Chuỗi mã hóa mã vé quét được từ camera |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Cán bộ an ninh mở màn hình 'Cổng Soát Vé' (/checkin) trên máy tính bảng hoặc laptop.

Bước 2: Hướng camera về phía màn hình điện thoại của đại biểu xuất trình vé E-Ticket.

Bước 3: Camera quét và giải mã chuỗi QR trong thời gian < 0.1 giây.

Bước 4: Gửi yêu cầu xác thực đến API kiểm tra vé (/api/association/checkin).

Bước 5: Hệ thống kiểm tra trong bảng `event_registrations` và `member_checkins`:

   - Trường hợp HỢP LỆ (Lần đầu qua cửa): Toàn bộ màn hình bừng sáng XANH LỤC, phát âm thanh 'Bíp' chào mừng, hiển thị Họ tên đại biểu, Tên doanh nghiệp, Hạng vé và Vị trí Bàn tiệc VIP (VD: 'Bàn VIP 02 - Ghế số 05') để lễ tân dẫn khách.

   - Ghi nhận bản ghi vào bảng `member_checkins` với thời gian thực (checked_at = NOW()).

Bước 6: Tự động chuyển đổi trạng thái sẵn sàng quét đại biểu kế tiếp sau 1.5 giây.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Camera không đọc được mã (do màn hình điện thoại vỡ/tối) -> Cán bộ an ninh nhập Mã vé 6 ký tự bằng tay để check-in thủ công.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Vé quét lại lần thứ hai (Trùng lặp gian lận) -> Toàn bộ màn hình lập tức chuyển sang màu ĐỎ RỰC, phát chuông báo động cảnh báo và hiển thị thông báo: 'CẢNH BÁO: Vé này đã qua cửa lúc hh:mm:ss! Nghi vấn gian lận vé!'.

Bước E2: Mã vé không tồn tại hoặc sai sự kiện -> Màn hình báo ĐỎ: 'Vé không hợp lệ cho sự kiện này'.

### [UC-CRM-EVT-05] Vòng Quay May Mắn (Lucky Draw) Đại Hội Nạp Danh Sách Check-in Thực Tế

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-EVT-05 |
| Tên Chức Năng | Vòng Quay May Mắn (Lucky Draw) Đại Hội Nạp Danh Sách Check-in Thực Tế |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Quay thưởng minh bạch trên màn hình LED sân khấu đại hội, tự động nạp danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tại cửa. |
| Tác Nhân (Actors) | Ban Tổ Chức, MC Sự kiện, Toàn thể Đại biểu |
| Tiền Điều Kiện (Pre-conditions) | Sự kiện đã diễn ra và có danh sách đại biểu check-in thành công trong `member_checkins`. |
| Hậu Điều Kiện (Post-conditions) | Kết quả trúng thưởng được ghi nhận minh bạch, công khai trước toàn thể đại hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Chỉ những đại biểu đã được Cổng soát vé QR Gate quét thành công mới được tham gia quay thưởng. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Component: `LuckyDrawModal.tsx` | Table: `member_checkins` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| eventId | String | BẮT BUỘC | Mã sự kiện đang tổ chức quay thưởng |
| prizeCategory | String | BẮT BUỘC | Hạng giải thưởng (Giải Đặc Biệt, Giải Nhất, Giải Nhì) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Kỹ thuật viên mở màn hình 'Lucky Draw' trên máy tính kết nối màn hình LED sân khấu.

Bước 2: Hệ thống tự động truy vấn danh sách toàn bộ đại biểu có trạng thái checked_in = true tại sự kiện này (Loại bỏ các đại biểu vắng mặt).

Bước 3: Hiển thị giao diện Vòng quay may mắn phong cách Hoàng gia Gold & Navy với hiệu ứng pháo hoa 3D.

Bước 4: MC mời đại biểu nhấn nút 'BẮT ĐẦU QUAY'.

Bước 5: Các con số may mắn (#LUCKY-xxxx) và tên doanh nhân chạy ngẫu nhiên với tốc độ cao kèm âm thanh hồi hộp.

Bước 6: Nhấn nút 'DỪNG LẠI'.

Bước 7: Vòng quay dừng chính xác tại 01 đại biểu may mắn, hiển thị Họ tên, Công ty, Mã số trúng thưởng và hiệu ứng pháo hoa chúc mừng.

Bước 8: Hệ thống lưu kết quả trúng thưởng vào CSDL và loại trừ đại biểu đã trúng khỏi các vòng quay kế tiếp.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Đại biểu trúng thưởng không có mặt trên khán phòng khi gọi tên -> Nhấn 'Quay Lại' để chọn đại biểu khác.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Chưa có đại biểu nào check-in -> Thông báo: 'Chưa có dữ liệu đại biểu check-in để quay thưởng'.

### [UC-CRM-MTG-01] Khởi Tạo Lịch Họp & Thuật Toán Chống Trùng Phòng Sapphire Hub (40 Chỗ)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MTG-01 |
| Tên Chức Năng | Khởi Tạo Lịch Họp & Thuật Toán Chống Trùng Phòng Sapphire Hub (40 Chỗ) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Khởi tạo cuộc họp lãnh đạo tập trung hoặc trực tuyến; tự động phát hiện và ngăn chặn xung đột lịch sử dụng phòng họp vật lý Sapphire Hub (40 chỗ). |
| Tác Nhân (Actors) | Ban Thư Ký (BTK), Ban Quản Trị (BQT) |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản có quyền khởi tạo cuộc họp. |
| Hậu Điều Kiện (Post-conditions) | Lịch họp được thiết lập an toàn, triệt tiêu 100% rủi ro trùng phòng họp vật lý. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Phòng họp Sapphire Hub chỉ phục vụ tối đa 01 cuộc họp trong cùng một khung thời gian. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/meetings` | API: `POST /api/association/meetings` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| title | String | BẮT BUỘC | Tiêu đề cuộc họp (VD: Họp Ban Chấp Hành Quý 3/2026) |
| startTime | DateTime | BẮT BUỘC | Thời gian bắt đầu |
| endTime | DateTime | BẮT BUỘC | Thời gian kết thúc (Phải sau startTime) |
| roomType | String | BẮT BUỘC | Phòng Họp Sapphire Hub / Zoom / Google Meet / Offline khác |
| attendees | Array of Member IDs | BẮT BUỘC | Danh sách đại biểu được triệu tập |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ban Thư Ký mở màn hình 'Quản Lý Cuộc Họp' (/meetings) và bấm 'Lên Lịch Họp Mới'.

Bước 2: Nhập tiêu đề cuộc họp, thời gian bắt đầu và kết thúc.

Bước 3: Lựa chọn địa điểm: 'Phòng Họp Sapphire UniWork Hub' (Sức chứa 40 chỗ).

Bước 4: Hệ thống tự động kích hoạt Thuật toán Chống Trùng Phòng (Room Conflict Detection):

   - Truy vấn toàn bộ các cuộc họp đang có trong CSDL có roomType = 'sapphire_hub' và trạng thái khác cancelled.

   - Kiểm tra điều kiện xung đột thời gian: (start_time < new_end_time) AND (end_time > new_start_time).

Bước 5: Nếu KHÔNG có xung đột: Hệ thống cho phép lưu bản ghi ở trạng thái pending_approval.

Bước 6: Ban Quản Trị phê duyệt chuyển sang trạng thái upcoming, hệ thống tự động phát hành giấy triệu tập qua thông báo đẩy và email đến các đại biểu.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Lựa chọn cuộc họp trực tuyến -> Nhập đường dẫn phòng họp Zoom / Google Meet / UniWork Link.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Phát hiện xung đột lịch phòng Sapphire Hub -> Hệ thống chặn lưu và hiển thị cảnh báo đỏ rực: 'XUNG ĐỘT LỊCH: Phòng họp Sapphire Hub đã được đăng ký bởi [Tên cuộc họp trước] từ hh:mm đến hh:mm. Vui lòng chọn khung giờ khác hoặc đổi địa điểm!'.

### [UC-CRM-MTG-02] Điểm Danh Cuộc Họp Bằng Mã QR Động Thay Đổi Sau 30 Giây (TOTP Engine)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MTG-02 |
| Tên Chức Năng | Điểm Danh Cuộc Họp Bằng Mã QR Động Thay Đổi Sau 30 Giây (TOTP Engine) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Điểm danh đại biểu có mặt tại cuộc họp bằng mã QR tự động thay đổi sau mỗi 30 giây, chống gian lận chụp ảnh gửi điểm danh hộ từ xa. |
| Tác Nhân (Actors) | Ban Thư Ký (Hiển thị mã), Đại biểu tham dự (Quét mã) |
| Tiền Điều Kiện (Pre-conditions) | Cuộc họp đang diễn ra (status = 'in_progress'). |
| Hậu Điều Kiện (Post-conditions) | Dữ liệu chuyên cần được ghi nhận chính xác vào hồ sơ hội viên. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mã QR động có cơ chế bảo vệ chống gian lận điểm danh từ xa tuyệt đối. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/meetings/:id/attendance` | Algorithm: TOTP HMAC-SHA256 |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| meetingId | String | BẮT BUỘC | Mã định danh cuộc họp |
| dynamicToken | String (TOTP) | BẮT BUỘC | Mã bảo mật thời gian thực có hiệu lực trong 30 giây |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ban Thư Ký mở màn hình 'Điểm Danh Cuộc Họp' trên máy chiếu hội trường.

Bước 2: Hệ thống sinh mã QR động chứa chữ ký số thời gian thực (TOTP Engine), tự động làm mới mã sau mỗi 30 giây.

Bước 3: Đại biểu mở Mobile App CEO 1983, chọn tính năng 'Quét QR Điểm Danh'.

Bước 4: Camera điện thoại quét mã QR và gửi mã token kèm vị trí về máy chủ.

Bước 5: Hệ thống xác minh chữ ký số trong cửa sổ thời gian 30 giây hợp lệ.

Bước 6: Ghi nhận trạng thái 'Đã Có Mặt' cho đại biểu trong danh sách cuộc họp kèm thời gian chính xác.

Bước 7: Màn hình máy chiếu của Ban Thư Ký cập nhật tức thì tên đại biểu vừa điểm danh.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Đại biểu không mang điện thoại -> Ban Thư Ký bấm điểm danh thủ công trên bảng điều khiển.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Quét mã QR đã hết hạn (> 30 giây do ảnh chụp từ xa) -> Hệ thống từ chối và báo lỗi: 'Mã QR đã hết hạn. Vui lòng quét trực tiếp mã mới trên màn hình'.

### [UC-CRM-MTG-03] Ban Hành Biên Bản Cuộc Họp & Nghị Quyết Ký Số

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-MTG-03 |
| Tên Chức Năng | Ban Hành Biên Bản Cuộc Họp & Nghị Quyết Ký Số |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Soạn thảo, đính kèm tệp PDF nghị quyết đã ký số và ban hành biên bản cuộc họp đến toàn thể đại biểu tham gia. |
| Tác Nhân (Actors) | Ban Thư Ký (BTK) |
| Tiền Điều Kiện (Pre-conditions) | Cuộc họp đã kết thúc. |
| Hậu Điều Kiện (Post-conditions) | Văn bản nghị quyết được lưu trữ vĩnh viễn trong Kho tài liệu hiệp hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Biên bản cuộc họp phải được ban hành trong vòng 24 giờ sau khi kết thúc họp. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/meetings/:id/minutes` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| meetingId | String | BẮT BUỘC | Mã cuộc họp cần ban hành biên bản |
| minutesSummary | Text | BẮT BUỘC | Nội dung tóm tắt kết luận cuộc họp |
| documentFile | File PDF | BẮT BUỘC | Nghị quyết có chữ ký số hoặc dấu đỏ |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ban Thư Ký mở chi tiết cuộc họp, bấm 'Tạo Biên Bản & Nghị Quyết'.

Bước 2: Nhập nội dung kết luận chỉ đạo của Chủ tịch CLB.

Bước 3: Tải tệp PDF Nghị quyết đã ký số lên MinIO Storage.

Bước 4: Bấm nút 'Ban Hành Chính Thức'.

Bước 5: Hệ thống tự động phát thông báo đẩy và email đến toàn bộ đại biểu tham gia kèm tệp đính kèm.

### [UC-CRM-TSK-01] Quản Lý Công Việc (Tasks) Đa Chế Độ Hiển Thị (5 View Modes)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-TSK-01 |
| Tên Chức Năng | Quản Lý Công Việc (Tasks) Đa Chế Độ Hiển Thị (5 View Modes) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Cung cấp không gian điều hành công việc đa chiều cho 6 ban chuyên môn với 5 chế độ xem linh hoạt: Danh sách (List), Bảng Kanban 3 cấp zoom, Lịch (Calendar), Biểu đồ Gantt và Sơ đồ tổ chức (Org Tree). |
| Tác Nhân (Actors) | Ban Quản Trị, Ban Thư Ký, Trưởng các Ban chuyên môn |
| Tiền Điều Kiện (Pre-conditions) | Đăng nhập Web CRM có quyền giao việc và báo cáo tiến độ. |
| Hậu Điều Kiện (Post-conditions) | Tiến độ công tác của toàn hiệp hội được theo dõi minh bạch, không bỏ sót đầu việc. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mọi kết luận cuộc họp Ban Chấp Hành phải được chuyển hóa thành các Tasks trên hệ thống. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/tasks` | Component: `TaskBoard.tsx`, `KanbanView.tsx` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| viewMode | Enum | BẮT BUỘC | list | kanban | calendar | gantt | org_tree |
| taskTitle | String | BẮT BUỘC | Tiêu đề nhiệm vụ |
| assigneeId | String | BẮT BUỘC | Cán bộ hoặc Ban chuyên môn chịu trách nhiệm |
| dueDate | DateTime | BẮT BUỘC | Hạn chót hoàn thành |
| priority | Enum | BẮT BUỘC | low | medium | high | urgent |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Người dùng mở màn hình 'Quản Lý Công Việc' (/tasks) trên Web CRM.

Bước 2: Hệ thống tải dữ liệu nhiệm vụ và cung cấp thanh công cụ chuyển đổi 5 chế độ xem:

   - Chế độ Danh sách (List View): Xem bảng chi tiết có phân trang và bộ lọc trạng thái.

   - Chế độ Kanban Board: Kéo thả các thẻ công việc giữa các cột: 'Cần làm' -> 'Đang làm' -> 'Chờ duyệt' -> 'Hoàn thành'; hỗ trợ thu phóng 3 cấp (Zoom In / Normal / Zoom Out).

   - Chế độ Lịch (Calendar View): Trực quan hóa hạn chót công việc theo tuần và tháng.

   - Chế độ Biểu đồ Gantt (Gantt Chart): Theo dõi đường găng tiến độ và mối quan hệ phụ thuộc công việc.

   - Chế độ Sơ đồ tổ chức (Org Tree): Xem phân bổ nhiệm vụ theo cấu trúc hình cây của 6 ban chuyên môn.

Bước 3: Khi tạo mới hoặc cập nhật công việc, hệ thống gửi thông báo tức thì qua chuông thông báo và email đến người được giao việc.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Cập nhật công việc quá hạn chót -> Hệ thống tự động gắn nhãn cảnh báo đỏ 'Quá hạn' (Overdue).

### [UC-CRM-TSK-02] Phân Công Nhiệm Vụ Cho 6 Chuyên Ban & Báo Cáo Tiến Độ Realtime

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-TSK-02 |
| Tên Chức Năng | Phân Công Nhiệm Vụ Cho 6 Chuyên Ban & Báo Cáo Tiến Độ Realtime |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Ban Thư Ký và BQT giao việc trực tiếp cho các Trưởng ban; nhận báo cáo tiến độ và nghiệm thu kết quả thực thi. |
| Tác Nhân (Actors) | Ban Thư Ký (Giao việc), Trưởng ban (Thực thi & Báo cáo) |
| Tiền Điều Kiện (Pre-conditions) | Có nhiệm vụ cần triển khai trong hiệp hội. |
| Hậu Điều Kiện (Post-conditions) | Nhiệm vụ được đóng, tích lũy điểm cống hiến cho ban chuyên môn. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Nhiệm vụ chỉ được coi là hoàn thành khi Ban Thư Ký hoặc BQT nghiệm thu. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/tasks` | API: `PUT /api/association/tasks/:id/status` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| targetCommittee | Enum | BẮT BUỘC | BTV | BTN | BTT | BXT | BTC |
| deliverables | Text | BẮT BUỘC | Sản phẩm đầu ra cần bàn giao |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ban Thư Ký tạo nhiệm vụ mới, chọn Ban chuyên môn chịu trách nhiệm.

Bước 2: Trưởng ban nhận thông báo, phân bổ tiếp cho các thành viên trong ban.

Bước 3: Thành viên cập nhật tiến độ (0% đến 100%) và tải lên bằng chứng sản phẩm.

Bước 4: Ban Thư Ký kiểm tra kết quả và bấm nút 'Nghiệm Thu Hoàn Thành'.

### [UC-CRM-FIN-01] Quản Lý Công Nợ & Thu Hội Phí Thường Niên VietQR Napas 24/7

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-FIN-01 |
| Tên Chức Năng | Quản Lý Công Nợ & Thu Hội Phí Thường Niên VietQR Napas 24/7 |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Hệ thống theo dõi công nợ hội phí thường niên (5.000.000 VNĐ/năm), tự động sinh mã VietQR động định danh cho từng hội viên. |
| Tác Nhân (Actors) | Ban Tài Chính, Thủ quỹ, Kế toán |
| Tiền Điều Kiện (Pre-conditions) | Hội viên có thẻ hội viên sắp hết hạn hoặc trong kỳ thu hội phí thường niên. |
| Hậu Điều Kiện (Post-conditions) | Thông báo nộp hội phí được phát hành đến toàn thể hội viên. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mức hội phí thường niên ấn định là 5.000.000 VNĐ/năm. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/fees` | API: `GET /api/association/fees` | Table: `members` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| memberCode | String | BẮT BUỘC | Mã hội viên (CEO-83xxx) |
| fiscalYear | Integer | BẮT BUỘC | Năm tài chính thu hội phí (VD: 2026) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Kế toán mở màn hình 'Quản Lý Hội Phí' (/fees) trên CRM.

Bước 2: Hệ thống liệt kê bảng công nợ: Hội viên đã đóng (Xanh lá) và Hội viên chưa đóng (Cam/Đỏ).

Bước 3: Kế toán bấm 'Gửi Thông Báo Thu Hội Phí' hàng loạt.

Bước 4: Hệ thống tự động tạo mã VietQR động chứa sẵn số tiền 5.000.000 VNĐ và cú pháp chuyển khoản gửi đến Mobile App của hội viên.

Bước 5: Theo dõi trạng thái nộp tiền thời gian thực trên bảng danh sách.

### [UC-CRM-FIN-02] Kế Toán Đối Soát Sao Kê Ngân Hàng & Duyệt Gạch Nợ Thủ Công (+365 Ngày)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-FIN-02 |
| Tên Chức Năng | Kế Toán Đối Soát Sao Kê Ngân Hàng & Duyệt Gạch Nợ Thủ Công (+365 Ngày) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Kế toán kiểm tra biến động số dư tài khoản ngân hàng thực tế và bấm duyệt gạch nợ trên CRM để gia hạn thẻ VIP +365 ngày. |
| Tác Nhân (Actors) | Kế toán / Thủ quỹ CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Có giao dịch chuyển khoản hội phí vào tài khoản ngân hàng của CLB. |
| Hậu Điều Kiện (Post-conditions) | Hội viên được gạch nợ sạch sẽ, thẻ VIP kéo dài hiệu lực thêm 1 năm. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-FEE-VIETQR-AUTO-MATCH: Kế toán bắt buộc kiểm tra sao kê thực tế trước khi bấm duyệt. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/fees` | API: `POST /api/association/fees/:memberId/pay` | Tables: `members`, `invoices` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| memberId | String | BẮT BUỘC | Mã hội viên được đối soát |
| bankTransactionCode | String | Tùy chọn | Mã giao dịch ngân hàng / Ủy nhiệm chi |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Kế toán kiểm tra sổ phụ hoặc tin nhắn biến động số dư tài khoản ngân hàng CLB.

Bước 2: Tìm kiếm hội viên tương ứng theo Mã HV hoặc Họ tên trên màn hình Quản lý hội phí.

Bước 3: Khớp đúng số tiền 5.000.000 VNĐ và nội dung chuyển khoản.

Bước 4: Kế toán bấm nút 'Duyệt Gạch Nợ'.

Bước 5: Hệ thống thực hiện chuỗi cập nhật:

   - Chuyển `fee_paid = true`, `payment_status = 'paid'`.

   - Tự động cộng dồn thêm chính xác +365 ngày vào ngày hết hạn thẻ VIP (`term_end`).

   - Sinh bản ghi hóa đơn thu tiền trong bảng `invoices`.

Bước 6: Gửi hóa đơn điện tử và thông báo xác nhận đã hoàn thành nghĩa vụ tài chính đến Mobile App của hội viên.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Cú pháp chuyển tiền sai hoặc thiếu thông tin -> Kế toán kiểm tra danh sách 'Giao dịch chờ xử lý' để đối soát thủ công.

### [UC-CRM-FIN-03] Quy Trình Kiểm Soát Phiếu Chi Sổ Quỹ Hiệp Hội 3 Cấp Nghiêm Ngặt

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-FIN-03 |
| Tên Chức Năng | Quy Trình Kiểm Soát Phiếu Chi Sổ Quỹ Hiệp Hội 3 Cấp Nghiêm Ngặt |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Thực hiện quy trình kiểm soát chi tiêu quỹ 3 cấp độc lập: Lập phiếu -> Thẩm định -> Phê duyệt xuất quỹ, đảm bảo minh bạch tài chính tuyệt đối. |
| Tác Nhân (Actors) | Cán bộ đề xuất, Trưởng ban/Tổng Thư Ký (Thẩm tra), Chủ tịch/Trưởng Ban Tài Chính (Duyệt) |
| Tiền Điều Kiện (Pre-conditions) | Khoản chi phục vụ hoạt động chính đáng của hiệp hội có dự toán được duyệt. |
| Hậu Điều Kiện (Post-conditions) | Khoản tiền được xuất quỹ đúng quy trình, lưu vết kiểm toán 100% người duyệt và chứng từ. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-FIN-CASHBOOK-3-LEVELS: Tuyệt đối không xuất quỹ khi chưa đủ 3 cấp duyệt. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/funds` | API: `POST /api/association/cashbook/expenses` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| amount | Decimal | BẮT BUỘC | Số tiền đề xuất chi (VNĐ) |
| purpose | String | BẮT BUỘC | Nội dung mục đích chi tiêu chi tiết |
| category | String | BẮT BUỘC | Khoản mục: Sự kiện, Thiện nguyện, Văn phòng, Đối ngoại |
| attachments | Array of File URLs | BẮT BUỘC | Hóa đơn đỏ, chứng từ, tờ trình đính kèm |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Cán bộ đề xuất mở màn hình 'Sổ Quỹ Thu Chi' (/funds hoặc /cashbook) trên CRM, bấm 'Lập Phiếu Chi Mới'.

Bước 2: Điền số tiền, lý do chi, chọn ban thụ hưởng và tải lên chứng từ/hóa đơn gốc.

Bước 3: Nhấn 'Gửi Phê Duyệt'. Phiếu chi ở trạng thái Cấp 1: pending.

Bước 4: Trưởng ban chuyên môn hoặc Tổng Thư Ký mở phiếu chi, kiểm tra tính hợp lý của chứng từ và bấm 'Xác Nhận Thẩm Tra'. Phiếu chi chuyển sang Cấp 2: reviewed.

Bước 5: Chủ tịch CLB hoặc Trưởng Ban Tài chính mở phiếu chi đã thẩm tra, kiểm tra ngân sách và bấm nút 'Phê Duyệt Xuất Quỹ' (approved).

Bước 6: Thủ quỹ căn cứ phiếu chi đã duyệt ở Cấp 3 để thực hiện lệnh chuyển khoản và tải ủy nhiệm chi lên hệ thống.

Bước 7: Bản ghi tự động cập nhật vào sổ cái thu chi và trừ số dư quỹ tương ứng.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Người duyệt ở Cấp 2 hoặc Cấp 3 từ chối -> Bấm 'Trả Lại Yêu Cầu' kèm lý do cần giải trình bổ sung.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Số tiền chi vượt quá số dư khả dụng của quỹ -> Hệ thống cảnh báo đỏ và khóa nút phê duyệt xuất quỹ.

### [UC-CRM-FIN-04] Quản Lý Quỹ An Sinh Xã Hội & Thiện Nguyện (Sao Kê Minh Bạch Realtime)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-FIN-04 |
| Tên Chức Năng | Quản Lý Quỹ An Sinh Xã Hội & Thiện Nguyện (Sao Kê Minh Bạch Realtime) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Quản trị nguồn quỹ an sinh xã hội chuyên biệt, tự động cập nhật và công khai sao kê tài chính thời gian thực cho toàn thể hội viên. |
| Tác Nhân (Actors) | Ban Thiện Nguyện (BTN), Ban Tài Chính |
| Tiền Điều Kiện (Pre-conditions) | Có chương trình phát động thiện nguyện hoặc giải ngân cứu trợ. |
| Hậu Điều Kiện (Post-conditions) | Minh bạch 100% tài chính quỹ thiện nguyện, nâng cao uy tín xã hội của HanoiBA. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Sao kê thiện nguyện phải công khai thời gian thực, không được ẩn giấu số liệu. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/funds` | API: `GET /api/association/funds/public-statement` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| campaignName | String | BẮT BUỘC | Tên chiến dịch thiện nguyện (VD: Xây Điểm Trường Hà Giang) |
| targetAmount | Decimal | BẮT BUỘC | Mục tiêu kêu gọi (VNĐ) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Ban Thiện Nguyện tạo chiến dịch thiện nguyện mới trên Web CRM (`/funds`).

Bước 2: Thiết lập mục tiêu kinh phí và thông tin tài khoản chuyên dụng.

Bước 3: Khi có hội viên ủng hộ, thủ quỹ đối soát và cập nhật vào sổ thu thiện nguyện.

Bước 4: Khi giải ngân, thực hiện quy trình chi tiêu 3 cấp [UC-CRM-FIN-03].

Bước 5: Toàn bộ bảng sao kê thu chi tự động đồng bộ sang màn hình Thiện nguyện trên Mobile App để toàn thể hội viên cùng giám sát.

### [UC-CRM-B2B-01] Kiểm Duyệt Sản Phẩm Sàn B2B Có Trợ Giá Nội Bộ (Ban Xúc Tiến BXT)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-B2B-01 |
| Tên Chức Năng | Kiểm Duyệt Sản Phẩm Sàn B2B Có Trợ Giá Nội Bộ (Ban Xúc Tiến BXT) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Ban Xúc Tiến Thương Mại kiểm định chất lượng sản phẩm và chính sách trợ giá nội bộ (>= 5%) trước khi cho phép hiển thị trên Sàn B2B. |
| Tác Nhân (Actors) | Trưởng Ban Xúc Tiến Thương Mại (ceo.xuctien@ceo1983.com) |
| Tiền Điều Kiện (Pre-conditions) | Có sản phẩm do hội viên gửi lên ở trạng thái `pending_review`. |
| Hậu Điều Kiện (Post-conditions) | Sản phẩm được bảo chứng chất lượng bởi Ban Xúc Tiến hiệp hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-B2B-INTERNAL-DISCOUNT: Bắt buộc mức chiết khấu trợ giá nội bộ >= 5%. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `PUT /api/association/products/:id/review` | Table: `products` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| productId | String | BẮT BUỘC | Mã sản phẩm cần kiểm duyệt |
| approvalStatus | Enum | BẮT BUỘC | approved | rejected |
| reviewNotes | String | Tùy chọn | Ghi chú của người kiểm duyệt |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Cán bộ BXT mở màn hình 'Kiểm Duyệt Sàn B2B' trên Web CRM.

Bước 2: Xem chi tiết sản phẩm: Ảnh, Mô tả kỹ thuật, Giá thị trường và Mức chiết khấu trợ giá nội bộ.

Bước 3: Xác minh tỷ lệ trợ giá: Bắt buộc từ 5% trở lên dành riêng cho hội viên CEO 1983.

Bước 4: Bấm nút 'Phê Duyệt Niêm Yết'.

Bước 5: Sản phẩm chính thức xuất hiện trên Sàn B2B của ứng dụng di động, gửi thông báo chúc mừng đến chủ gian hàng.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Sản phẩm không đạt tiêu chuẩn hoặc trợ giá < 5% -> Bấm 'Từ Chối' kèm lý do cần điều chỉnh.

### [UC-CRM-B2B-02] Điều Phối & Khớp Nối Cơ Hội Kinh Doanh Cung - Cầu 1-on-1

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-B2B-02 |
| Tên Chức Năng | Điều Phối & Khớp Nối Cơ Hội Kinh Doanh Cung - Cầu 1-on-1 |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Giám sát bảng tin Cung - Cầu, hỗ trợ kết nối các thương vụ lớn và ghi nhận doanh số giao thương nội khối cho câu lạc bộ. |
| Tác Nhân (Actors) | Ban Xúc Tiến Thương Mại (BXT) |
| Tiền Điều Kiện (Pre-conditions) | Có tin đăng Cần Mua hoặc Cần Bán trên hệ thống. |
| Hậu Điều Kiện (Post-conditions) | Doanh số giao thương được ghi nhận chính thức vào Báo cáo kinh tế hiệp hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mọi hợp đồng có bảo chứng của BXT được hưởng chính sách bảo lãnh uy tín CLB. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/opportunities` | Table: `business_card_needs` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| opportunityId | String | BẮT BUỘC | Mã tin giao thương |
| contractValue | Decimal | Tùy chọn | Giá trị hợp đồng thực tế sau khi ký kết |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: BXT theo dõi các tin đăng Cung - Cầu trên bảng điều phối CRM.

Bước 2: Nhận diện các nhu cầu lớn, kết nối trực tiếp lãnh đạo 2 doanh nghiệp phù hợp.

Bước 3: Khi hai bên ký kết hợp đồng, BXT ghi nhận doanh số giao thương vào bảng tổng kết.

Bước 4: Điểm thành tích giao thương được cộng vào hồ sơ 360 độ của cả 2 hội viên.

### [UC-CRM-SEC-01] Quản Trị Ma Trận Phân Quyền Vai Trò Động Dynamic RBAC 5 Cấp

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-SEC-01 |
| Tên Chức Năng | Quản Trị Ma Trận Phân Quyền Vai Trò Động Dynamic RBAC 5 Cấp |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Cho phép Superadmin cấu hình quyền hạn chi tiết (Xem, Thêm, Sửa, Xóa, Duyệt) cho 5 vai trò hệ thống. |
| Tác Nhân (Actors) | Ban Quản Trị tối cao (quan_tri) |
| Tiền Điều Kiện (Pre-conditions) | Đăng nhập bằng tài khoản Superadmin (admin@connect.vn). |
| Hậu Điều Kiện (Post-conditions) | Các tài khoản đang hoạt động được áp dụng ma trận quyền mới ngay trong lần gọi API kế tiếp. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Đảm bảo tính bất biến của tài khoản Quản trị tối cao Superadmin. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/settings/roles` | API: `PUT /api/roles/permissions` | Table: `role_permissions` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| targetRole | String | BẮT BUỘC | Thuộc danh mục 5 vai trò hệ thống |
| moduleKey | String | BẮT BUỘC | Mã module/màn hình chức năng |
| actions | Array of Strings | BẮT BUỘC | Tập hợp các quyền: read, create, update, delete, approve |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Superadmin mở màn hình 'Phân Quyền Vai Trò' (/settings/roles) trên Web CRM.

Bước 2: Hệ thống tải ma trận phân quyền dạng bảng: Cột dọc là danh sách 5 vai trò, Cột ngang là 30 màn hình chức năng chia theo 8 nhóm sidebar.

Bước 3: Superadmin tích chọn hoặc hủy chọn các ActionPills (Xem, Sửa, Xóa, Duyệt) tương ứng.

Bước 4: Nhấn nút 'Lưu Ma Trận Phân Quyền'.

Bước 5: Hệ thống kiểm tra tính toàn vẹn (Không cho phép tước quyền quản trị của chính vai trò quan_tri).

Bước 6: Cập nhật các bản ghi trong bảng `role_permissions`.

Bước 7: Làm mới bộ đệm phân quyền (Permission Cache) tức thời trên toàn hệ thống.

Bước 8: Hiển thị thông báo cập nhật thành công.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Superadmin bấm 'Đặt lại mặc định' để khôi phục ma trận phân quyền tiêu chuẩn.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Cố tình tước quyền truy cập module Cấu hình của vai trò quan_tri -> Hệ thống chặn và báo lỗi an toàn.

### [UC-CRM-SEC-02] Nhật Ký Kiểm Toán Hoạt Động Hệ Thống (Audit Logs Bất Biến)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-CRM-SEC-02 |
| Tên Chức Năng | Nhật Ký Kiểm Toán Hoạt Động Hệ Thống (Audit Logs Bất Biến) |
| Phân Hệ / Module | Phân hệ 2: Cổng Quản Trị Điều Hành Trung Tâm (Web CRM) |
| Mục Tiêu Nghiệp Vụ | Tự động ghi nhận 100% nhật ký các thao tác tạo mới, chỉnh sửa, xóa dữ liệu và phê duyệt của cán bộ quản lý phục vụ thanh tra, kiểm toán. |
| Tác Nhân (Actors) | Hệ thống bảo mật ngầm định (Audit Interceptor) |
| Tiền Điều Kiện (Pre-conditions) | Cán bộ quản trị thực hiện bất kỳ thao tác nhạy cảm nào trên Web CRM. |
| Hậu Điều Kiện (Post-conditions) | Mọi thay đổi dữ liệu trong hệ thống đều có thể truy vết chính xác người thực hiện và thời gian. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Nhật ký kiểm toán phải được lưu trữ tối thiểu 36 tháng theo quy định an toàn thông tin. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Middleware: `AuditInterceptor.ts` | Tables: `audit_logs`, `activity_log` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| userId | String UUID | BẮT BUỘC | Mã người thực hiện thao tác |
| action | String | BẮT BUỘC | Hành động: CREATE, UPDATE, DELETE, APPROVE, REJECT |
| targetResource | String | BẮT BUỘC | Đối tượng tác động: Member, Event, Fee, Expense, Task |
| ipAddress | String | BẮT BUỘC | Địa chỉ IP thực của người dùng |
| payloadDiff | JSON | Tùy chọn | Dữ liệu trước và sau khi thay đổi |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Mọi yêu cầu HTTP có phương thức POST, PUT, PATCH, DELETE gửi đến backend đều đi qua Middleware kiểm toán AuditInterceptor.

Bước 2: Trích xuất thông tin người dùng từ JWT Token, địa chỉ IP và URL thực thi.

Bước 3: Thu thập dữ liệu thay đổi trước và sau khi thực hiện nghiệp vụ.

Bước 4: Ghi nhận bản ghi bất biến (Immutable Record) vào bảng `audit_logs` và `activity_log`.

Bước 5: Bản ghi kiểm toán được khóa chống chỉnh sửa, chỉ cho phép Superadmin xem truy vết.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Lỗi ghi log không được làm gián đoạn giao dịch chính nhưng phải kích hoạt cảnh báo giám sát hệ thống.

### [UC-APP-AUTH-01] Đăng Nhập Ứng Dụng Di Động CEO 1983 Bằng SĐT/Email

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-AUTH-01 |
| Tên Chức Năng | Đăng Nhập Ứng Dụng Di Động CEO 1983 Bằng SĐT/Email |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Xác thực danh tính hội viên chính thức trên ứng dụng di động (Mobile App / PWA). |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Hồ sơ hội viên đã được Ban Thành Viên phê duyệt (status = 'active'). |
| Hậu Điều Kiện (Post-conditions) | Hội viên truy cập thành công vào các tiện ích dành riêng cho thành viên. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Chỉ những hội viên có trạng thái active mới được phép đăng nhập ứng dụng. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/auth/login` | Tables: `vione_users`, `members` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| identifier | String | BẮT BUỘC | Số điện thoại di động hoặc Email hội viên |
| password | String | BẮT BUỘC | Mật khẩu hội viên |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở ứng dụng di động CEO 1983.

Bước 2: Nhập Số điện thoại hoặc Email và Mật khẩu.

Bước 3: Bấm nút 'Đăng Nhập'.

Bước 4: Hệ thống kiểm tra thông tin tài khoản và so khớp mật khẩu băm.

Bước 5: Kiểm tra trạng thái hồ sơ trong bảng `members`: Nếu status = 'active', cấp phát phiên làm việc di động.

Bước 6: Kiểm tra cờ must_change_password: Nếu là true, chuyển hướng ngay đến modal bắt buộc đổi mật khẩu.

Bước 7: Nếu mật khẩu đã đổi, tải thông tin Thẻ VIP 3D và chuyển hướng vào màn hình chính Hội viên (/association).

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Hội viên quên mật khẩu -> Nhấn 'Quên mật khẩu' để nhận liên kết khôi phục qua email đã đăng ký.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Hồ sơ đang ở trạng thái Chờ thẩm định (pending) -> Báo lỗi: 'Hồ sơ của Quý anh/chị đang được Ban Thành Viên thẩm định. Vui lòng chờ thông báo chính thức'.

Bước E2: Hồ sơ bị tạm đình chỉ hoặc khai trừ (suspended / terminated) -> Báo lỗi: 'Tư cách hội viên đang bị tạm dừng. Vui lòng liên hệ Ban Quản Trị'.

### [UC-APP-AUTH-02] Bắt Buộc Đổi Mật Khẩu Khởi Tạo Lần Đầu (QuickProfileEditModal)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-AUTH-02 |
| Tên Chức Năng | Bắt Buộc Đổi Mật Khẩu Khởi Tạo Lần Đầu (QuickProfileEditModal) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Buộc hội viên mới phải thay đổi mật khẩu do hệ thống cấp ngẫu nhiên thành mật khẩu cá nhân bảo mật cao trong lần đăng nhập đầu tiên. |
| Tác Nhân (Actors) | Hội viên mới đăng nhập lần đầu |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản có cờ must_change_password = true. |
| Hậu Điều Kiện (Post-conditions) | Tài khoản được bảo vệ bằng mật khẩu cá nhân, cờ must_change_password được gỡ bỏ. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Không cho phép người dùng đóng modal hoặc chuyển trang khi chưa đổi mật khẩu thành công. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/auth/change-password` | Table: `vione_users` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| currentPassword | String | BẮT BUỘC | Mật khẩu khởi tạo hệ thống gửi qua email |
| newPassword | String (>= 8 chars) | BẮT BUỘC | Chứa chữ hoa, chữ thường, chữ số và ký tự đặc biệt |
| confirmPassword | String | BẮT BUỘC | Khớp 100% với newPassword |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hệ thống tự động mở cửa sổ ngăn chặn QuickProfileEditModal ngay sau khi đăng nhập.

Bước 2: Hiển thị thông báo: 'Để đảm bảo an toàn, Quý anh/chị vui lòng đổi mật khẩu khởi tạo trong lần đầu tiên truy cập'.

Bước 3: Hội viên nhập Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu mới.

Bước 4: Nhấn nút 'Lưu Mật Khẩu & Bắt Đầu'.

Bước 5: Hệ thống kiểm tra độ phức tạp mật khẩu mới và xác nhận trùng khớp.

Bước 6: Kiểm tra mật khẩu mới không được trùng với mật khẩu khởi tạo cũ.

Bước 7: Băm mật khẩu mới bằng thuật toán bcrypt (Salt round 10) và cập nhật CSDL.

Bước 8: Cập nhật cờ must_change_password = false.

Bước 9: Đóng modal và chuyển hướng hội viên vào màn hình chính.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Mật khẩu mới không đạt chuẩn độ phức tạp -> Báo lỗi: 'Mật khẩu phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ số và ký tự đặc biệt'.

Bước E2: Xác nhận mật khẩu không khớp -> Báo lỗi: 'Mật khẩu xác nhận không trùng khớp'.

Bước E3: Mật khẩu mới trùng mật khẩu khởi tạo cũ -> Báo lỗi: 'Mật khẩu mới không được trùng mật khẩu cũ'.

### [UC-APP-HOME-01] Trang Chủ Hội Viên VIP & Lưới Phím Tắt Tiện Ích Đẳng Cấp

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-HOME-01 |
| Tên Chức Năng | Trang Chủ Hội Viên VIP & Lưới Phím Tắt Tiện Ích Đẳng Cấp |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Cung cấp bảng điều khiển trung tâm dành cho hội viên: Thẻ VIP danh dự, Lưới phím tắt tiện ích 8 mục, Sự kiện sắp tới, Ưu đãi và Marketplace. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng nhập thành công vào Mobile App. |
| Hậu Điều Kiện (Post-conditions) | Hội viên tiếp cận mọi tính năng chỉ trong 1 lần chạm. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-UI-ROYAL-NAVY-GOLD: Thiết kế giao diện sang trọng, không giật lag. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association` | Component: `association.index.tsx` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở màn hình trang chủ (`/association`).

Bước 2: Hệ thống render Thẻ hội viên VIP 3D với mã QR định danh và huy hiệu chuyên ban.

Bước 3: Hiển thị Lưới 8 tính năng nhanh cân đối: Danh thiếp số, Danh bạ CEO, Quét Check-in, Đặc quyền VIP, Biểu quyết số, Lịch sử hoạt động, Kho tài liệu, Hội phí.

Bước 4: Hiển thị Carousel Sự kiện sắp tới với bộ đếm ngược thời gian thực `EventCountdownMiniBadge`.

Bước 5: Hiển thị Khối Giao thương B2B với tổng giá trị deals thực tế và nút 'Đăng ngay'.

Bước 6: Người dùng chạm vuốt nhẹ nhàng chuyển đổi giữa các mục.

### [UC-APP-CARD-01] Thẻ Hội Viên VIP 3D Titanium Hiệu Ứng Lật 180 Độ & Quét QR

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-CARD-01 |
| Tên Chức Năng | Thẻ Hội Viên VIP 3D Titanium Hiệu Ứng Lật 180 Độ & Quét QR |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Hiển thị Thẻ hội viên VIP 3D công nghệ cao lật 180 độ; hỗ trợ chia sẻ mã QR định danh độc bản tại các sự kiện giao thương. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản hội viên có trạng thái phí `paid`. |
| Hậu Điều Kiện (Post-conditions) | Khẳng định đẳng cấp và uy tín cá nhân của doanh nhân 1983. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Thẻ VIP chỉ kích hoạt đầy đủ hiệu ứng 3D khi hội viên đã hoàn thành nghĩa vụ hội phí. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/card` | Component: `DigitalBusinessCardModal.tsx` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên chạm vào Thẻ VIP tại trang chủ hoặc vào mục 'Thẻ VIP' (`/association/card`).

Bước 2: Thẻ VIP 3D hiển thị với chất liệu Titanium mạ vàng Amber Gold dập nổi logo CEO 1983.

Bước 3: Người dùng vuốt ngón tay để xoay lật 180 độ 3D khám phá mặt trước và mặt sau thẻ.

Bước 4: Mặt sau thẻ hiển thị mã QR định danh độc bản liên kết trực tiếp trang cá nhân `/card/:slug`.

Bước 5: Đối tác có thể quét trực tiếp mã QR trên thẻ để xem hồ sơ năng lực doanh nghiệp.

### [UC-APP-CARD-02] Chia Sẻ Một Chạm NFC Mở Trang Danh Thiếp Công Khai (/card/:code)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-CARD-02 |
| Tên Chức Năng | Chia Sẻ Một Chạm NFC Mở Trang Danh Thiếp Công Khai (/card/:code) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Chạm mặt sau thẻ vật lý NFC vào smartphone đối tác để mở ngay trang danh thiếp công khai trên web mà không cần cài app. |
| Tác Nhân (Actors) | Hội viên sở hữu thẻ NFC, Đối tác tiếp nhận |
| Tiền Điều Kiện (Pre-conditions) | Thẻ NFC đã được ghi mã định danh của hội viên. |
| Hậu Điều Kiện (Post-conditions) | Đối tác tiếp nhận hồ sơ doanh nhân nhanh chóng và chuyên nghiệp. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Trang web danh thiếp số công khai phải tải siêu tốc < 1.0 giây. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/card/:slug` | Table: `member_business_cards` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| slug | String | BẮT BUỘC | Mã định danh thẻ (VD: ceo83007) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên chạm thẻ vật lý NFC vào mặt lưng điện thoại đối tác.

Bước 2: Chip NFC truyền tần số 13.56MHz, điện thoại đối tác bật thông báo mở liên kết web.

Bước 3: Trình duyệt mở trang danh thiếp số công khai: `https://14.225.217.232:5444/card/ceo83007`.

Bước 4: Trang web hiển thị sắc nét: Họ tên, Chức vụ, Logo doanh nghiệp, SĐT, Email, Website, Bản đồ trụ sở và Danh sách dịch vụ cốt lõi.

Bước 5: Đối tác có thể xem toàn bộ hồ sơ mà không cần đăng nhập hay cài đặt ứng dụng.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Điện thoại đối tác không bật NFC -> Hội viên hướng dẫn quét mã QR in trên mặt thẻ.

### [UC-APP-CARD-03] Xuất File vCard (.vcf) Tự Động Nhập Danh Bạ Điện Thoại Trong 1 Giây

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-CARD-03 |
| Tên Chức Năng | Xuất File vCard (.vcf) Tự Động Nhập Danh Bạ Điện Thoại Trong 1 Giây |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Cho phép đối tác bấm nút 'Lưu Danh Bạ' trên trang web danh thiếp để tự động tải file vCard (.vcf) lưu trọn vẹn thông tin vào điện thoại. |
| Tác Nhân (Actors) | Đối tác xem danh thiếp |
| Tiền Điều Kiện (Pre-conditions) | Đang mở trang danh thiếp công khai `/card/:slug`. |
| Hậu Điều Kiện (Post-conditions) | Thông tin liên lạc của hội viên được lưu vĩnh viễn trong danh bạ đối tác. |
| Quy Tắc Nghiệp Vụ (Business Rules) | File vCard phải tương thích 100% cả Apple iOS Contacts và Google Contacts. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `GET /api/cards/:slug/vcf` | Format: MIME `text/vcard` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Đối tác bấm nút 'Lưu Vào Danh Bạ' trên trang danh thiếp công khai.

Bước 2: Máy chủ tự động biên dịch dữ liệu thành tệp vCard chuẩn 3.0 (`contact.vcf`).

Bước 3: Tệp tự động tải về điện thoại đối tác.

Bước 4: Hệ điều hành (iOS / Android) tự động mở ứng dụng Danh Bạ với đầy đủ trường: Họ tên, Công ty, Chức vụ, SĐT, Email, Địa chỉ, Ảnh đại diện.

Bước 5: Đối tác bấm 'Lưu' hoàn tất trong đúng 1 giây mà không cần gõ phím.

### [UC-APP-CARD-04] Chỉnh Sửa Nhanh Hồ Sơ Cá Nhân & Năng Lực Doanh Nghiệp

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-CARD-04 |
| Tên Chức Năng | Chỉnh Sửa Nhanh Hồ Sơ Cá Nhân & Năng Lực Doanh Nghiệp |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Hội viên chủ động cập nhật ảnh đại diện, ảnh bìa, giới thiệu doanh nghiệp và các dịch vụ cung ứng qua Bottom Sheet tiện lợi. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng nhập vào tài khoản cá nhân. |
| Hậu Điều Kiện (Post-conditions) | Hồ sơ năng lực của hội viên luôn được cập nhật mới nhất. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Hỗ trợ cử chỉ vuốt xuống (Swipe down to dismiss) đóng Bottom Sheet mượt mà. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Component: `PersonalProfileBottomSheet.tsx` | Storage: MinIO |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| avatar | Image File | Tùy chọn | Ảnh chân dung doanh nhân |
| cover | Image File | Tùy chọn | Ảnh bìa doanh nghiệp tỷ lệ 3:1 |
| bio | String | Tùy chọn | Giới thiệu ngắn gọn bản thân và triết lý kinh doanh |
| services | Array of Strings | Tùy chọn | Danh sách sản phẩm dịch vụ thế mạnh |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại trang chủ, hội viên chạm vào Thẻ VIP để mở `PersonalProfileBottomSheet` vuốt xuống.

Bước 2: Bấm nút 'Chỉnh Sửa Hồ Sơ'.

Bước 3: Cập nhật thông tin hoặc tải ảnh mới trực tiếp từ thư viện điện thoại.

Bước 4: Nhấn 'Lưu Thay Đổi'.

Bước 5: Dữ liệu tự động đồng bộ vào CSDL và cập nhật tức thì trên trang danh thiếp công khai.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Ảnh tải lên vượt quá 10MB -> Hệ thống tự động nén ảnh phía client trước khi upload.

### [UC-APP-MBR-01] Tra Cứu Danh Bạ 500+ CEO Hội Viên & Lọc Theo 6 Chuyên Ban

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-MBR-01 |
| Tên Chức Năng | Tra Cứu Danh Bạ 500+ CEO Hội Viên & Lọc Theo 6 Chuyên Ban |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Khám phá danh bạ toàn thể các nhà lãnh đạo đồng niên 1983, lọc thông minh theo chuyên ban và ngành nghề kinh doanh. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng nhập vào Mobile App. |
| Hậu Điều Kiện (Post-conditions) | Hội viên tìm thấy đối tác tiềm năng trong câu lạc bộ chỉ trong vài giây. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Nút 'Mời vào CLB' trên thanh công cụ di động tự co giãn không tràn màn hình. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/members` | Component: `association.members.tsx` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| keyword | String | Tùy chọn | Tìm theo tên doanh nhân, công ty, ngành nghề |
| committee | Enum | Tùy chọn | Tất cả | BQT | BTK | BTV | BTN | BTT | BXT |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở mục 'Danh Bạ CEO' (`/association/members`).

Bước 2: Hệ thống hiển thị thanh tìm kiếm nhạy bén và hàng chip lọc theo 6 Ban chuyên môn.

Bước 3: Nhập từ khóa hoặc chạm chọn chuyên ban.

Bước 4: Danh sách hội viên hiển thị dạng thẻ card sang trọng: Avatar, Họ tên, Chức vụ, Tên công ty, Huy hiệu chuyên ban và Hạng thẻ VIP.

Bước 5: Bấm vào hội viên bất kỳ để mở hồ sơ chi tiết và các tùy chọn kết nối (Gọi điện, Nhắn tin, Hẹn gặp 1-1).

### [UC-APP-MBR-02] Đặt Lịch Hẹn Gặp Kết Nối Kinh Doanh 1-on-1 (Connection Appointments)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-MBR-02 |
| Tên Chức Năng | Đặt Lịch Hẹn Gặp Kết Nối Kinh Doanh 1-on-1 (Connection Appointments) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Gửi lời mời hẹn gặp gỡ giao thương trực tiếp hoặc online giữa 2 chủ doanh nghiệp trong câu lạc bộ. |
| Tác Nhân (Actors) | Hội viên khởi xướng, Hội viên nhận lời mời |
| Tiền Điều Kiện (Pre-conditions) | Cả hai đều là hội viên chính thức. |
| Hậu Điều Kiện (Post-conditions) | Cuộc hẹn kinh doanh được xác lập chính thức, nâng cao hiệu quả kết nối hiệp hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Cuộc gặp 1-on-1 được ghi nhận vào chỉ số gắn kết của hội viên. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/appointments` | Table: `appointments` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| targetMemberId | String | BẮT BUỘC | Mã hội viên muốn hẹn gặp |
| appointmentDate | DateTime | BẮT BUỘC | Ngày giờ dự kiến gặp mặt |
| location | String | BẮT BUỘC | Địa điểm cà phê / Văn phòng / Phòng họp Sapphire Hub / Zoom |
| purpose | String | BẮT BUỘC | Mục đích kết nối kinh doanh (Trao đổi cơ hội, Tìm hiểu sản phẩm) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại hồ sơ của một hội viên trong danh bạ, bấm 'Đặt Lịch Hẹn Gặp 1-1'.

Bước 2: Chọn ngày, giờ và địa điểm đề xuất (Offline hoặc Online).

Bước 3: Nhập nội dung mục đích cuộc gặp, bấm 'Gửi Lời Mời'.

Bước 4: Đối tác nhận được thông báo đẩy tức thì trên điện thoại.

Bước 5: Đối tác mở thông báo, bấm 'Đồng Ý Hẹn Gặp' hoặc đề xuất đổi khung giờ khác.

Bước 6: Khi xác nhận, hệ thống tự động ghi nhận vào Lịch cuộc gặp của cả 2 bên và gửi lời nhắc trước 2 giờ.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Trùng lịch với cuộc hẹn khác đã xác nhận -> Cảnh báo nhắc nhở xung đột thời gian.

### [UC-APP-MBR-03] Xem Lịch Sử Cuộc Gặp 1-on-1 Đã Diễn Ra & Sắp Diễn Ra

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-MBR-03 |
| Tên Chức Năng | Xem Lịch Sử Cuộc Gặp 1-on-1 Đã Diễn Ra & Sắp Diễn Ra |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Theo dõi toàn bộ nhật ký các cuộc gặp gỡ giao thương đã thực hiện trong tab chuyên biệt tại Danh bạ hội viên. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Đã có tương tác hẹn gặp trên hệ thống. |
| Hậu Điều Kiện (Post-conditions) | Hội viên quản lý lịch trình kết nối giao thương chặt chẽ. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Dữ liệu cuộc gặp được lưu vết phục vụ đánh giá điểm cống hiến. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/members` (Tab `meetings`) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên vào màn hình Danh bạ, chọn tab 'Lịch Sử Cuộc Gặp' (`/association/members?tab=meetings`).

Bước 2: Hệ thống hiển thị danh sách cuộc hẹn phân chia: 'Sắp Diễn Ra' và 'Đã Diễn Ra'.

Bước 3: Mỗi thẻ hiển thị: Thời gian, Đối tác, Địa điểm, Huy hiệu trạng thái và Tóm tắt mục đích.

Bước 4: Bấm nút 'Nhắn tin nhanh' để mở ngay cuộc trò chuyện với đối tác cuộc hẹn đó.

### [UC-APP-MSG-01] Hộp Thư Trò Chuyện Thời Gian Thực Doanh Nhân Messenger #0084FF

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-MSG-01 |
| Tên Chức Năng | Hộp Thư Trò Chuyện Thời Gian Thực Doanh Nhân Messenger #0084FF |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Nhắn tin trao đổi kinh doanh thời gian thực qua WebSocket, hỗ trợ gửi ảnh, tài liệu năng lực và hiển thị trạng thái đã xem. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Hai hội viên có nhu cầu trao đổi thông tin. |
| Hậu Điều Kiện (Post-conditions) | Thông tin liên lạc nội bộ được bảo mật tuyệt đối. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Huy hiệu số lượng tin nhắn chưa đọc có hiệu ứng gợn sóng animate-ping nhấp nháy. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/messages` | Engine: Socket.IO Gateway |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| receiverId | String UUID | BẮT BUỘC | Mã người nhận tin nhắn |
| messageContent | Text | BẮT BUỘC | Nội dung văn bản tin nhắn |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở tab 'Tin Nhắn' trên thanh điều hướng dưới đáy Mobile App.

Bước 2: Hệ thống tải Hộp thư Messenger phong cách hiện đại với màu chủ đạo #0084FF.

Bước 3: Chọn một cuộc hội thoại từ danh sách hoặc bấm 'Soạn tin mới'.

Bước 4: Nhập nội dung, đính kèm ảnh hoặc tệp hồ sơ năng lực.

Bước 5: Bấm nút 'Gửi'. Máy chủ Socket.IO chuyển tiếp tin nhắn tức thì < 50ms.

Bước 6: Tin nhắn hiển thị trạng thái 'Đã gửi' và 'Đã xem' khi đối phương đọc tin.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Mất mạng Internet -> Lưu tin nhắn vào bộ nhớ đệm và tự động gửi lại khi có mạng.

### [UC-APP-MSG-02] Kênh Thông Báo Ban Thư Ký Ghim Trên Cùng & Thẻ Liên Kết Zalo OA

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-MSG-02 |
| Tên Chức Năng | Kênh Thông Báo Ban Thư Ký Ghim Trên Cùng & Thẻ Liên Kết Zalo OA |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Kênh truyền thông điều hành chính thức của Ban Thư Ký luôn được ghim cố định ở vị trí số 1 trong Hộp thư, tích hợp thẻ kết nối Zalo Official Account. |
| Tác Nhân (Actors) | Ban Thư Ký (Phát thông báo), Hội viên (Tiếp nhận) |
| Tiền Điều Kiện (Pre-conditions) | Hội viên truy cập Hộp thư tin nhắn. |
| Hậu Điều Kiện (Post-conditions) | 100% hội viên tiếp cận thông điệp chỉ đạo của Ban Thường Trực kịp thời. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Kênh Ban Thư Ký là kênh hệ thống bất biến, không thể bị xóa hay ẩn đi. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Component: `ChatDrawer.tsx` | Room: `system:secretariat` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở màn hình Tin nhắn.

Bước 2: Kênh 'Ban Thư Ký CEO 1983' luôn hiển thị trên cùng với huy hiệu Tích xanh xác thực.

Bước 3: Bấm vào kênh để xem các thông báo chỉ đạo, giấy triệu tập họp và văn bản mới nhất.

Bước 4: Chạm vào Thẻ liên kết Zalo OA để chuyển tiếp nhanh sang ứng dụng Zalo kết nối kênh chính thức của hiệp hội.

### [UC-APP-EVT-01] Khám Phá Sự Kiện Hội Thảo & Đêm Gala Dinner Thường Niên

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-EVT-01 |
| Tên Chức Năng | Khám Phá Sự Kiện Hội Thảo & Đêm Gala Dinner Thường Niên |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Xem chi tiết chương trình sự kiện, danh sách diễn giả VIP, timeline khung giờ và chính sách vé mời tham dự. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Có sự kiện đang mở đăng ký. |
| Hậu Điều Kiện (Post-conditions) | Hội viên nắm rõ kế hoạch sự kiện để chủ động sắp xếp lịch công tác. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Icon Sự kiện có huy hiệu số lượng sự kiện mới kèm hiệu ứng animate-pulse. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/events` | Component: `association.events.tsx` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở mục 'Sự Kiện' trên thanh điều hướng (`/association/events`).

Bước 2: Hệ thống hiển thị Carousel Sự kiện nổi bật với ảnh banner 16:9 và bộ đếm ngược.

Bước 3: Danh sách các sự kiện phân loại: 'Sắp Diễn Ra' và 'Đã Kết Thúc'.

Bước 4: Bấm vào một sự kiện để mở màn hình chi tiết: Địa điểm tổ chức, Bản đồ đường đi, Diễn giả VIP và Nút 'Đăng Ký Tham Dự'.

### [UC-APP-EVT-02] Đăng Ký Vé Tham Dự & Lựa Chọn Vị Trí Ghế Ngồi Cinema Seating Map

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-EVT-02 |
| Tên Chức Năng | Đăng Ký Vé Tham Dự & Lựa Chọn Vị Trí Ghế Ngồi Cinema Seating Map |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Hội viên đăng ký vé tham dự sự kiện Gala 0 VNĐ và trực tiếp chọn vị trí bàn tiệc VIP yêu thích trên sơ đồ ghế trực quan. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Sự kiện có thiết kế sơ đồ ghế và đang mở đăng ký chỗ ngồi. |
| Hậu Điều Kiện (Post-conditions) | Hội viên sở hữu vé sự kiện có số bàn và số ghế định danh chính xác. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mỗi hội viên chỉ được đăng ký 01 vé hội viên chính thức 0 VNĐ. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/events/:id/register` | Table: `event_registrations` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| eventId | String | BẮT BUỘC | Mã sự kiện tham dự |
| selectedSeatId | String | BẮT BUỘC | Mã ghế được chọn trên sơ đồ (VD: Bàn 03 - Ghế 08) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại trang chi tiết sự kiện, hội viên bấm 'Đăng Ký Tham Dự'.

Bước 2: Hệ thống tự động nhận diện tư cách hội viên chính thức, áp dụng giá vé VIP 0 VNĐ.

Bước 3: Mở màn hình Sơ Đồ Ghế Ngồi Cinema Seating Map trên điện thoại.

Bước 4: Hội viên chạm chọn bàn tiệc và ghế còn trống (Ghế đã có người chọn hiển thị màu xám khóa).

Bước 5: Bấm 'Xác Nhận Giữ Chỗ'.

Bước 6: Hệ thống khóa ghế và phát hành Vé điện tử E-Ticket tức thì vào Ví vé của hội viên.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Ghế vừa bị người khác chọn trước trong tích tắc -> Báo lỗi: 'Ghế này vừa được đăng ký, vui lòng chọn vị trí khác'.

### [UC-APP-EVT-03] Ví Vé Điện Tử E-Ticket Offline & Mã Check-in QR Khổ Lớn (#LUCKY-xxxx)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-EVT-03 |
| Tên Chức Năng | Ví Vé Điện Tử E-Ticket Offline & Mã Check-in QR Khổ Lớn (#LUCKY-xxxx) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Lưu trữ vé sự kiện offline trong điện thoại, hiển thị mã QR khổ lớn và mã số bốc thăm may mắn để qua cổng an ninh đón tiếp. |
| Tác Nhân (Actors) | Hội viên tham dự sự kiện Gala |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng ký vé sự kiện thành công. |
| Hậu Điều Kiện (Post-conditions) | Đại biểu hoàn tất thủ tục check-in nhanh gọn, không cần xếp hàng tìm tên trên giấy. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Vé điện tử được lưu cache offline, hoạt động bình thường cả khi hội trường nghẽn mạng. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Component: `EventTicketModal.tsx` | Caching: IndexedDB / LocalStorage |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Khi đến hội trường sự kiện, hội viên mở mục 'Vé Của Tôi' trên Mobile App.

Bước 2: Vé điện tử E-Ticket hiển thị toàn màn hình với nhận diện Hoàng gia Navy & Gold.

Bước 3: Hiển thị nổi bật: Mã QR Check-in khổ lớn, Họ tên, Tên công ty, Vị trí Bàn tiệc VIP và Mã số bốc thăm may mắn (#LUCKY-xxxx).

Bước 4: Đưa mã QR trước máy quét tại Cổng an ninh đón tiếp.

Bước 5: Cổng an ninh xác thực thành công trong 0.2s, hội viên bước vào hội trường dự tiệc.

### [UC-APP-FEE-01] Tra Cứu Tình Trạng Hội Phí & Sinh Mã VietQR Động 5.000.000 VNĐ Napas 24/7

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-FEE-01 |
| Tên Chức Năng | Tra Cứu Tình Trạng Hội Phí & Sinh Mã VietQR Động 5.000.000 VNĐ Napas 24/7 |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Hội viên xem thời hạn hiệu lực của thẻ VIP và thanh toán hội phí thường niên nhanh 24/7 qua mã VietQR động. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Hội viên truy cập ứng dụng di động. |
| Hậu Điều Kiện (Post-conditions) | Hội viên thực hiện nghĩa vụ tài chính thuận tiện, không cần gõ tay số tài khoản hay cú pháp. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-TERMINOLOGY-HOIPHI: Dùng thuật ngữ Hội phí thường niên, cấm dùng 'niên liễm'. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/renew` | Component: `association.renew.tsx` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở mục 'Hội Phí' trên Mobile App (`/association/renew`).

Bước 2: Màn hình hiển thị: Ngày hết hạn thẻ VIP hiện tại, Tình trạng công nợ (Đã đóng / Đến hạn).

Bước 3: Nhấn nút 'Thanh Toán VietQR'.

Bước 4: Hệ thống sinh mã VietQR động chuẩn Napas 24/7 chứa sẵn: 5.000.000 VNĐ, Tên tài khoản CLB CEO 1983 và Cú pháp: `HOIPHI CEO1983 [MÃ_HV] [HỌ_TÊN]`.

Bước 5: Hội viên mở app ngân hàng quét mã hoặc bấm 'Lưu ảnh QR' để chuyển khoản.

Bước 6: Sau khi chuyển tiền, kế toán đối soát sao kê và duyệt gạch nợ trên CRM gia hạn thẻ +365 ngày.

### [UC-APP-FEE-02] Xem Lịch Sử Đóng Hội Phí & Tải Hóa Đơn Điện Tử

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-FEE-02 |
| Tên Chức Năng | Xem Lịch Sử Đóng Hội Phí & Tải Hóa Đơn Điện Tử |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Tra cứu lại toàn bộ các kỳ hội phí đã nộp trong suốt quá trình tham gia hiệp hội và tải hóa đơn điện tử. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Hội viên đã có ít nhất một giao dịch hội phí được gạch nợ. |
| Hậu Điều Kiện (Post-conditions) | Doanh nghiệp có đầy đủ chứng từ quyết toán hợp lệ. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Hóa đơn điện tử được lưu trữ vĩnh viễn trên hệ thống. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/renew/history` | Table: `invoices` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại mục Hội phí, hội viên chọn tab 'Lịch Sử Giao Dịch'.

Bước 2: Hệ thống liệt kê danh sách các năm đã đóng: Năm tài chính, Số tiền 5.000.000 VNĐ, Ngày thanh toán, Trạng thái 'Đã Hoàn Thành'.

Bước 3: Bấm vào kỳ bất kỳ để xem và tải Hóa đơn điện tử (.pdf) phục vụ hạch toán chi phí doanh nghiệp.

### [UC-APP-B2B-01] Khám Phá Sàn Thương Mại B2B & Xem Chi Tiết Báo Giá Sản Phẩm

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-B2B-01 |
| Tên Chức Năng | Khám Phá Sàn Thương Mại B2B & Xem Chi Tiết Báo Giá Sản Phẩm |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Khám phá chợ giao thương nội khối, tìm kiếm nhà cung cấp tin cậy trong các bạn đồng niên 1983 và yêu cầu báo giá ưu đãi. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng nhập vào Mobile App. |
| Hậu Điều Kiện (Post-conditions) | Hội viên tiếp cận nguồn hàng chất lượng cao với giá ưu đãi độc quyền. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Loại bỏ hoàn toàn các hành vi B2C e-commerce (trái tim wishlist lặp đi lặp lại) khỏi sàn B2B. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/products` | Component: `association.products.tsx` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| category | String | Tùy chọn | Ngành nghề cung ứng (Xây dựng, F&B, Công nghệ, Y tế, Thời trang...) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở mục 'Chợ B2B' (`/association/products`).

Bước 2: Hệ thống hiển thị 2 tab lớn: 'Chợ Giao Thương B2B' và 'Gian Hàng Của Tôi'.

Bước 3: Xem lưới sản phẩm với nhãn chiết khấu trợ giá nội bộ nổi bật (VD: 'Ưu đãi nội bộ 15%').

Bước 4: Bấm vào sản phẩm để mở `ProductDetailModal`: Thông tin kỹ thuật, Uy tín công ty, Hồ sơ năng lực.

Bước 5: Bấm nút 'Báo Giá ->' để mở cuộc đàm phán 1-on-1 trực tiếp với chủ doanh nghiệp bán.

### [UC-APP-B2B-02] Đăng Bán Sản Phẩm/Dịch Vụ Trợ Giá Nội Bộ Cho Hiệp Hội

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-B2B-02 |
| Tên Chức Năng | Đăng Bán Sản Phẩm/Dịch Vụ Trợ Giá Nội Bộ Cho Hiệp Hội |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Doanh nghiệp thành viên đưa sản phẩm thế mạnh lên sàn B2B để tiếp cận 500+ khách hàng doanh nghiệp tiềm năng trong CLB. |
| Tác Nhân (Actors) | Hội viên doanh nghiệp cung ứng |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản hội viên đang hoạt động hợp lệ. |
| Hậu Điều Kiện (Post-conditions) | Sản phẩm được gửi đến Hội đồng kiểm duyệt Ban Xúc Tiến. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-B2B-INTERNAL-DISCOUNT: Bắt buộc trợ giá nội bộ. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/products` | Table: `products` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| title | String | BẮT BUỘC | Tên sản phẩm dịch vụ |
| price | Decimal | BẮT BUỘC | Giá bán niêm yết |
| discountPercent | Decimal | BẮT BUỘC | Tỷ lệ trợ giá nội bộ (>= 5%) |
| images | Array of Files | BẮT BUỘC | Ảnh sản phẩm thực tế |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại Sàn B2B, chuyển sang tab 'Gian Hàng Của Tôi', bấm 'Đăng Sản Phẩm Mới'.

Bước 2: Điền tên sản phẩm, giá thị trường và mức chiết khấu cam kết dành riêng cho CEO 1983.

Bước 3: Tải ảnh sản phẩm từ điện thoại.

Bước 4: Nhấn 'Gửi Kiểm Duyệt'.

Bước 5: Ban Xúc Tiến kiểm tra và phê duyệt niêm yết trên sàn trong vòng 24 giờ.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Mức chiết khấu < 5% -> Báo lỗi yêu cầu tối thiểu 5% trợ giá nội bộ.

### [UC-APP-B2B-03] Quản Lý Gian Hàng Của Tôi (Chỉnh Sửa, Cập Nhật Giá, Ẩn Sản Phẩm)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-B2B-03 |
| Tên Chức Năng | Quản Lý Gian Hàng Của Tôi (Chỉnh Sửa, Cập Nhật Giá, Ẩn Sản Phẩm) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Quản trị danh mục sản phẩm đang chào bán của doanh nghiệp mình trên sàn giao thương hiệp hội. |
| Tác Nhân (Actors) | Hội viên sở hữu gian hàng |
| Tiền Điều Kiện (Pre-conditions) | Hội viên đã có sản phẩm đăng trên sàn. |
| Hậu Điều Kiện (Post-conditions) | Thông tin gian hàng luôn phản ánh đúng năng lực cung ứng hiện tại. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Chỉ chủ sở hữu sản phẩm hoặc Ban Xúc Tiến mới có quyền chỉnh sửa/ẩn sản phẩm. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/products` (Tab `my-store`) |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| productId | String | BẮT BUỘC | Mã sản phẩm cần điều chỉnh |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên vào tab 'Gian Hàng Của Tôi' trên màn hình Chợ B2B.

Bước 2: Xem danh sách các sản phẩm của công ty mình và số lượt quan tâm báo giá.

Bước 3: Chọn 'Chỉnh sửa' để cập nhật giá hoặc chính sách khuyến mãi mới.

Bước 4: Chọn 'Tạm ẩn' nếu sản phẩm tạm thời hết hàng.

Bước 5: Nhấn 'Lưu Cập Nhật'.

### [UC-APP-OPP-01] Khám Phá Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu (Cần Mua / Cần Bán)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-OPP-01 |
| Tên Chức Năng | Khám Phá Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu (Cần Mua / Cần Bán) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Xem dòng thời gian các nhu cầu tìm kiếm đối tác, mua sắm vật tư thiết bị hoặc hợp tác đầu tư của các thành viên. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Đã đăng nhập vào Mobile App. |
| Hậu Điều Kiện (Post-conditions) | Nắm bắt nhanh các cơ hội kinh doanh thực tế trong hiệp hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Tin đăng phải rõ ràng, nghiêm túc, không spam quảng cáo rác. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/opportunities` | Component: `association.opportunities.tsx` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| typeFilter | Enum | Tùy chọn | Tất cả | Cần Mua (need) | Cần Bán (offer) |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên mở mục 'Cơ Hội Hợp Tác' (`/association/opportunities`).

Bước 2: Hệ thống hiển thị Bảng tin Cung - Cầu thời gian thực phong cách mạng xã hội doanh nhân.

Bước 3: Mỗi thẻ tin hiển thị: Doanh nghiệp đăng tin, Loại tin (Cần Mua màu Xanh / Cần Bán màu Vàng), Ngân sách dự kiến, Hạn chót và Nội dung yêu cầu.

Bước 4: Bấm vào tin đăng để xem chi tiết và thảo luận.

### [UC-APP-OPP-02] Đăng Tin Nhu Cầu Giao Thương Mới Lên Bảng Tin Hiệp Hội

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-OPP-02 |
| Tên Chức Năng | Đăng Tin Nhu Cầu Giao Thương Mới Lên Bảng Tin Hiệp Hội |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Phát đi nhu cầu tìm kiếm nhà cung cấp hoặc chào bán đơn hàng số lượng lớn đến toàn thể cộng đồng CEO 1983. |
| Tác Nhân (Actors) | Hội viên có nhu cầu giao thương |
| Tiền Điều Kiện (Pre-conditions) | Tài khoản hội viên đang hoạt động hợp lệ. |
| Hậu Điều Kiện (Post-conditions) | Cơ hội kinh doanh được lan tỏa đến 500+ chủ doanh nghiệp. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Tin Cần Mua được ưu tiên hiển thị nổi bật trên Bảng tin. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/opportunities` | Table: `business_card_needs` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| title | String | BẮT BUỘC | Tiêu đề nhu cầu ngắn gọn, súc tích |
| type | Enum | BẮT BUỘC | need (Cần Mua) | offer (Cần Bán) |
| budget | Decimal | Tùy chọn | Ngân sách dự toán (VNĐ) |
| description | Text | BẮT BUỘC | Mô tả tiêu chuẩn kỹ thuật và điều kiện giao hàng |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Tại Bảng tin Cơ hội, hội viên bấm nút 'Đăng Tin Mới'.

Bước 2: Chọn loại tin: 'Cần Mua' hoặc 'Cần Bán'.

Bước 3: Nhập tiêu đề, mô tả yêu cầu, ngân sách dự kiến và thời hạn cần tiếp nhận hồ sơ.

Bước 4: Nhấn nút 'Đăng Tin Ngay'.

Bước 5: Tin đăng lập tức hiển thị trên bảng tin của toàn thể hội viên và gửi thông báo đến Ban Xúc Tiến.

### [UC-APP-OPP-03] Tiếp Nhận Cơ Hội Hợp Tác (Claim Opportunity) & Mở Phòng Trao Đổi 1-1

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-OPP-03 |
| Tên Chức Năng | Tiếp Nhận Cơ Hội Hợp Tác (Claim Opportunity) & Mở Phòng Trao Đổi 1-1 |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Doanh nghiệp có năng lực bấm tiếp nhận cơ hội kinh doanh để mở ngay kênh đàm phán hợp tác chính danh với bên đăng tin. |
| Tác Nhân (Actors) | Doanh nghiệp cung ứng quan tâm cơ hội |
| Tiền Điều Kiện (Pre-conditions) | Có tin Cung - Cầu đang mở tiếp nhận. |
| Hậu Điều Kiện (Post-conditions) | Hai doanh nghiệp bắt đầu đàm phán thương vụ có bảo chứng của hiệp hội. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Mỗi cơ hội có thể tiếp nhận tối đa 5 đơn vị báo giá để cạnh tranh lành mạnh. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | API: `POST /api/association/opportunities/:id/claim` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| opportunityId | String | BẮT BUỘC | Mã tin giao thương muốn tiếp nhận |
| introMessage | String | BẮT BUỘC | Lời nhắn giới thiệu năng lực cung ứng |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Khi xem một tin đăng Cần Mua phù hợp năng lực, hội viên bấm nút 'Tiếp Nhận Cơ Hội' (Claim Opportunity).

Bước 2: Nhập tóm tắt năng lực cung ứng và cam kết chính sách ưu đãi.

Bước 3: Bấm 'Xác Nhận Hợp Tác'.

Bước 4: Hệ thống tự động tạo phòng trò chuyện riêng tư 1-on-1 trong Hộp thư Messenger #0084FF giữa hai doanh nhân.

Bước 5: Ghi nhận sự kiện kết nối vào bảng theo dõi của Ban Xúc Tiến để hỗ trợ pháp lý và chứng thư uy tín khi cần.

### [UC-APP-VOT-01] Biểu Quyết & Bầu Cử Đại Hội Điện Tử Trực Tuyến 1 Người 1 Phiếu

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-VOT-01 |
| Tên Chức Năng | Biểu Quyết & Bầu Cử Đại Hội Điện Tử Trực Tuyến 1 Người 1 Phiếu |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Thực hiện bỏ phiếu bầu cử Ban Chấp Hành hoặc biểu quyết thông qua nghị quyết đại hội trên điện thoại di động với độ trễ live 1 giây. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Phiên biểu quyết đang được kích hoạt mở hòm phiếu (status = 'open') và hội viên có `fee_paid = true`. |
| Hậu Điều Kiện (Post-conditions) | Kết quả kiểm phiếu đại hội chính xác 100%, minh bạch tuyệt đối, rút ngắn thời gian kiểm phiếu từ 3 giờ xuống còn 1 giây. |
| Quy Tắc Nghiệp Vụ (Business Rules) | RULE-VOTING-ONE-PERSON-ONE-VOTE: Mỗi hội viên có đúng 1 phiếu bầu, không thể sửa đổi sau khi nộp. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Route: `/association/voting` | API: `POST /api/association/voting/submit` |



#### Từ Điển Dữ Liệu Đầu Vào (Input Data Dictionary)

| Trường Dữ Liệu | Kiểu Dữ Liệu | Bắt Buộc | Quy Tắc Kiểm Tra & Định Dạng (Validation) |
| --- | --- | --- | --- |
| votingSessionId | String | BẮT BUỘC | Mã phiên biểu quyết đại hội |
| selectedOptionId | String | BẮT BUỘC | Lựa chọn: Đồng ý | Không đồng ý | Ý kiến khác |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Khi Chủ tọa đại hội phát lệnh, Ban Thư Ký mở hòm phiếu biểu quyết trên Web CRM.

Bước 2: Toàn bộ hội viên chính thức nhận được thông báo đẩy trên Mobile App, mở màn hình Biểu Quyết (/association/voting).

Bước 3: Xem nội dung tờ trình, chọn phương án biểu quyết và bấm 'Xác Nhận Bỏ Phiếu'.

Bước 4: Hệ thống kiểm tra tư cách cử tri: Bắt buộc tài khoản có trạng thái phí paid và chưa từng bỏ phiếu trong phiên này.

Bước 5: Hệ thống mã hóa một chiều phiếu bầu (Đảm bảo nguyên tắc bỏ phiếu kín ẩn danh).

Bước 6: Khóa nút bỏ phiếu trên điện thoại của hội viên, hiển thị thông báo 'Quý anh/chị đã hoàn thành biểu quyết'.

Bước 7: Máy chủ tổng hợp phiếu bầu tức thời qua Socket.IO.

Bước 8: Màn hình lớn trung tâm của Đại hội hiển thị biểu đồ tỷ lệ phần trăm (%) nhảy động theo thời gian thực (Live 1s).

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Cố tình bỏ phiếu lần thứ hai -> Hệ thống chặn ngay lập tức: 'Quý đại biểu đã thực hiện bỏ phiếu trong phiên này'.

Bước E2: Hội viên chưa hoàn thành hội phí thường niên -> Hệ thống thông báo: 'Chỉ hội viên hoàn thành nghĩa vụ hội phí mới có quyền biểu quyết đại hội'.

### [UC-APP-NOTIF-01] Trung Tâm Thông Báo Đẩy Thời Gian Thực (Push Notifications)

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-NOTIF-01 |
| Tên Chức Năng | Trung Tâm Thông Báo Đẩy Thời Gian Thực (Push Notifications) |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Nhận thông báo tức thì về lịch họp, sự kiện mới, nhắc nộp hội phí, tin nhắn messenger và biến động cơ hội kinh doanh. |
| Tác Nhân (Actors) | Hội viên chính thức CLB Doanh Nhân CEO 1983 |
| Tiền Điều Kiện (Pre-conditions) | Hội viên cho phép nhận thông báo trên thiết bị di động. |
| Hậu Điều Kiện (Post-conditions) | Hội viên không bao giờ bỏ lỡ các thông tin điều hành quan trọng. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Thông báo đẩy được truyền tải qua Web Push API và WebSocket thời gian thực. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Component: `NotificationDrawer.tsx` | Engine: Web Push Protocol |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Hội viên chạm vào biểu tượng Chuông thông báo ở góc trên bên phải màn hình.

Bước 2: Trung tâm thông báo mở ra, hiển thị các thông báo chia theo danh mục: Hệ thống, Sự kiện, Giao thương, Tin nhắn.

Bước 3: Thông báo chưa đọc có chấm xanh nổi bật.

Bước 4: Chạm vào thông báo bất kỳ để điều hướng thẳng đến màn hình nghiệp vụ liên quan.

Bước 5: Bấm 'Đánh dấu tất cả đã đọc' để xóa các huy hiệu chưa đọc.

### [UC-APP-SET-01] Cài Đặt Ứng Dụng PWA Màn Hình Chính iOS & Android 1-Chạm

| Thuộc Tính | Đặc Tả Kỹ Thuật Chi Tiết |
| --- | --- |
| Mã Use Case | UC-APP-SET-01 |
| Tên Chức Năng | Cài Đặt Ứng Dụng PWA Màn Hình Chính iOS & Android 1-Chạm |
| Phân Hệ / Module | Phân hệ 3: Ứng Dụng Di Động Hội Viên CEO 1983 |
| Mục Tiêu Nghiệp Vụ | Cơ chế tự động hỏi 'Bạn muốn thêm ứng dụng CEO 1983 vào màn hình chính không?' khi mở link chia sẻ, hướng dẫn cài đặt PWA chuẩn icon và tên thương hiệu. |
| Tác Nhân (Actors) | Hội viên sử dụng smartphone iOS hoặc Android |
| Tiền Điều Kiện (Pre-conditions) | Mở ứng dụng trên trình duyệt web di động (Safari iOS hoặc Chrome Android). |
| Hậu Điều Kiện (Post-conditions) | Ứng dụng CEO 1983 được cài đặt hoàn chỉnh trên màn hình chính của hội viên. |
| Quy Tắc Nghiệp Vụ (Business Rules) | Khi người dùng đã bấm tắt, tuyệt đối không được tự ý hiện lại popup làm phiền. |
| Ánh Xạ Kỹ Thuật (Tech Mapping) | Component: `IosInstallPrompt.tsx` | WebClip: `/ceo1983.mobileconfig` |



#### Luồng Sự Kiện Chính (Step-by-step Main Flow)

Bước 1: Khi hội viên mở liên kết web app lần đầu hoặc bấm vào link chia sẻ `?install=ios`, hệ thống kích hoạt hộp thoại trang trọng: 'Bạn muốn thêm ứng dụng CEO 1983 vào màn hình chính không?'.

Bước 2: Hộp thoại hiển thị biểu tượng Logo chuẩn CEO 1983 và 2 nút: `[Có, thêm luôn]` và `[Để sau]`.

Bước 3: Nếu trên iOS: Bấm `[Có, thêm luôn]` mở hướng dẫn 3 bước Safari (Nút Chia sẻ -> Thêm vào MH chính) hoặc tải Profile WebClip `.mobileconfig` 1-chạm.

Bước 4: Nếu trên Android: Bắt sự kiện native `beforeinstallprompt`, kích hoạt hộp thoại cài đặt trực tiếp của hệ điều hành.

Bước 5: Biểu tượng ứng dụng 'CEO 1983' xuất hiện trên màn hình chính của điện thoại, khởi chạy toàn màn hình độc lập như app native.

#### Luồng Rẽ Nhánh / Thay Thế (Alternative Flows)

Bước A1: Hội viên bấm '[Để sau]' -> Ghi nhớ vĩnh viễn vào `localStorage`, không tự ý hiện lại làm phiền người dùng.

#### Luồng Ngoại Lệ & Xử Lý Lỗi (Exception Flows)

Bước E1: Mở qua trình duyệt In-App của Zalo / Facebook Messenger -> Hệ thống phát hiện và hướng dẫn 2 bước mở bằng Safari ngoài.

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - ISO/IEC 25010)

### Hiệu Năng & Thời Gian Đáp Ứng (Performance & Latency)

1. Thời gian đáp ứng API thông thường: < 150ms trên 95% request.

2. Tốc độ quét nhận diện mã QR tại Cổng Soát Vé: < 0.2s (200ms).

3. Thời gian tải trang ban đầu (First Contentful Paint): < 1.5s trên mạng 4G.

4. Tốc độ đẩy thông báo thời gian thực qua WebSocket: < 50ms.

### Bảo Mật & Kiểm Soát Truy Cập (Security & Access Control)

1. Mã hóa đường truyền dữ liệu 100% bằng HTTPS TLS 1.3 và WSS.

2. Mật khẩu người dùng được băm an toàn bằng thuật toán Bcrypt với Salt 10 vòng.

3. Tự động khóa tài khoản tạm thời trong 15 phút nếu nhập sai mật khẩu quá 5 lần.

4. Phân quyền theo vai trò RBAC 5 cấp bậc nghiêm ngặt kết hợp chặn cứng quyền duyệt hội viên của Ban Thư Ký.

### Độ Tin Cậy & Tính Sẵn Sàng (Reliability & High Availability)

1. Hệ thống cam kết độ sẵn sàng hoạt động đạt tối thiểu 99.9% (Uptime).

2. Cơ chế sao lưu dữ liệu tự động hàng ngày lúc 03:00 AM, lưu trữ phân tán 30 ngày.

3. Thời gian phục hồi dịch vụ sau thảm họa (RTO) < 2 giờ; Mức mất mát dữ liệu (RPO) < 24 giờ.

## 5. GIAO DIỆN HỆ THỐNG & KIẾN TRÚC DỮ LIỆU (SYSTEM INTERFACES)

* Quy Chuẩn Giao Diện Người Dùng (UI/UX Guidelines):
  - Màu sắc chủ đạo: Xanh Navy `#003B95` và Vàng Ánh Kim Amber Gold `#F59E0B`.
  - Tuyệt đối cấm sử dụng nút bấm màu đen thuần `#000000`.
  - Bảng dữ liệu hỗ trợ cuộn ngang chuẩn với Cột STT cố định bên trái và Cột Thao tác cố định bên phải.
* Giao Diện Phần Cứng & Thẻ Thông Minh (Hardware/NFC Interfaces):
  - Chip NFC tần số 13.56MHz tương thích chuẩn ISO/IEC 14443 Type A.
  - Chạm mặt sau thẻ vào smartphone để mở liên kết công khai `/card/:slug`.
* Kiến Trúc Cơ Sở Dữ Liệu PostgreSQL (Prisma ORM):
  - Bảng hội viên: `members` (liên kết `vione_users` qua `user_id`).
  - Bảng danh thiếp số: `member_business_cards` (chứa slug, branding, liên kết mạng xã hội).
  - Bảng sự kiện: `events`, `event_ticket_types`, `event_registrations`, `member_checkins`.
  - Bảng tài chính & hội phí: `invoices`, `associations`.
* Giao Diện Dịch Vụ Bên Ngoài (External APIs):
  - Cổng thanh toán VietQR Napas 24/7 (Sinh mã QR động chuyển khoản liên ngân hàng).
  - Dịch vụ thư điện tử SMTP Gmail Relay (`smtp.gmail.com:465`).
  - Dịch vụ lưu trữ đối tượng MinIO S3 Compatible Object Storage.

