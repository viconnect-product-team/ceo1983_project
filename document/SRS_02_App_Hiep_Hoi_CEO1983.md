# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — PHÂN HỆ ỨNG DỤNG DI ĐỘNG HỘI VIÊN & PWA

## HỆ SINH THÁI SỐ HÓA HIỆP HỘI DOANH NHÂN CEO 1983 (HANOIBA)

### TIÊU CHUẨN IEEE 830-1998 (PHÂN TÍCH MECE 100%)

*Mã tài liệu: SRS-02-APP-CEO1983-2026 | Phiên bản: Version 5.0 (Bàn Giao Kỹ Thuật Đầy Đủ Chi Tiết 100% MECE) | Ngày phê duyệt: 04/10/2026*

*Cơ quan chủ quản: Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA)*

*Chuyên gia thực hiện: Senior Business Analyst & System Architect (15+ Năm Kinh Nghiệm)*
---

## 1. GIỚI THIỆU CHUNG (INTRODUCTION)

### 1.1. Mục Đích Của Tài Liệu (Purpose)

Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) mã hiệu [SRS-02-APP-CEO1983-2026] được biên soạn theo đúng tiêu chuẩn quốc tế IEEE 830-1998, nhằm xác định một cách đầy đủ, chính xác, không mơ hồ toàn bộ các yêu cầu chức năng, yêu cầu phi chức năng, thiết kế vai trò người dùng, hành trình trải nghiệm và các giao diện tích hợp hệ thống cho Hệ Sinh Thái Số Hóa Hiệp Hội Doanh Nhân CEO 1983 (Trực thuộc HanoiBA). Tài liệu là căn cứ pháp lý và kỹ thuật duy nhất để nghiệm thu phần mềm.

### 1.2. Phạm Vi Tài Liệu (Document Scope)

Tài liệu này bao gồm đặc tả chi tiết của 26 trường hợp sử dụng (Use Cases) tương ứng với phạm vi chức năng bàn giao, áp dụng nguyên tắc MECE (Mutually Exclusive, Collectively Exhaustive) để tuyệt đối không trùng lặp và không bỏ sót bất kỳ luồng tác nghiệp nào của Hội đồng Điều hành và Hội viên CLB Doanh Nhân CEO 1983.

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

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS — 26 USE CASES)

*Mỗi chức năng dưới đây được đặc tả theo đúng chuẩn quốc tế bao gồm 12 trường thông tin: Mã Use Case, Tên chức năng, Module, Mục tiêu, Tác nhân, Tiền điều kiện, Từ điển dữ liệu đầu vào, Luồng sự kiện chính (mỗi bước xuống dòng rõ ràng), Luồng thay thế, Luồng ngoại lệ, Hậu điều kiện, Quy tắc nghiệp vụ và Ánh xạ kỹ thuật CSDL/API.*


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

