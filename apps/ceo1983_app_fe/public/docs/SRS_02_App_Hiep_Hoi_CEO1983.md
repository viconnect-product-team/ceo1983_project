# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & THIẾT KẾ HỆ THỐNG

## ỨNG DỤNG DI ĐỘNG & PWA HIỆP HỘI CLB DOANH NHÂN CEO 1983

*Phiên bản: Version 4.5 - Chuẩn Hóa Toàn Diện Master BA & Kỹ Thuật Hệ Thống (Trang Bìa & Mục Lục Chuẩn)*

## MỤC LỤC TÀI LIỆU (TABLE OF CONTENTS)

| Mục | Phần / Phân Hệ Chức Năng | Phạm Vi Nghiệp Vụ | Trạng Thái |
| --- | --- | --- | --- |
| PHẦN 1 | Giải Thích Bình Dân Các Khái Niệm Kỹ Thuật Cốt Lõi (Sổ Tay Số, Thẻ Chạm NFC, Soát Vé) | Nền tảng kiến trúc | Hoàn tất 100% |
| PHẦN 2 | Bản Đồ 5 Tab Điều Hướng & Luồng Màn Hình Ứng Dụng Di Động CEO1983 | Điều hướng UI/UX | Hoàn tất 100% |
| PHẦN 3 | Đặc Tả Tuần Tự Chi Tiết Toàn Bộ 13 Phân Hệ Nghiệp Vụ App Hội Viên | Nghiệp vụ chi tiết | Hoàn tất 100% |
|   3.1 | MOD-01: Xác Thực, Đăng Nhập Đa Kênh & Kích Hoạt Thẻ Hội Viên | Xác thực & Bảo mật | Hoàn tất 100% |
|   3.2 | MOD-02: Thẻ Hội Viên Thông Minh VIP 3D Chìm Logo (Screen Blend) & Danh Thiếp Số | Định danh số VIP | Hoàn tất 100% |
|   3.3 | MOD-03: Công Nghệ Chạm Thẻ Thông Minh NFC 1-Chạm & Apple/Google Wallets | Phần cứng & NFC | Hoàn tất 100% |
|   3.4 | MOD-04: Hộp Thư & Tin Nhắn Doanh Nhân VIP #0084FF, Thư Mời Họp B2B & Thu Hồi Tin | Chat Realtime | Hoàn tất 100% |
|   3.5 | MOD-05: Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối Hẹn Bàn Tròn 1-on-1 | Giao thương 1-on-1 | Hoàn tất 100% |
|   3.6 | MOD-06: Sàn Giao Thương B2B Shopee Style: Đánh Giá Sản Phẩm & % Sao Điểm Doanh Nghiệp | Marketplace Shopee | Hoàn tất 100% |
|   3.7 | MOD-07: Sự Kiện Tràn Viền, Cơ Chế Điểm Danh Kép (Dual Check-in) & Bầu Cử Đại Hội | Sự kiện & Check-in | Hoàn tất 100% |
|   3.8 | MOD-08: Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 24/7 & Lịch Sử Hóa Đơn VAT | Tài chính hội viên | Hoàn tất 100% |
|   3.9 | MOD-09: Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Trực Tuyến 7 Ban Chuyên Môn | Hồ sơ & Tin tức | Hoàn tất 100% |
|   3.10 | MOD-10: Tách Biệt Độc Lập Luồng Chuông Thông Báo & Landing Page Điện Ảnh CLB | Thông báo & Portal | Hoàn tất 100% |
|   3.11 | MOD-11: Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành CLB | Cài đặt & Onboarding | Hoàn tất 100% |
|   3.12 | MOD-12: Trải Nghiệm Doanh Nhân, Chúc Mừng Sinh Nhật Tự Động & Theme Mùa Lễ Hội | Cá nhân hóa UX | Hoàn tất 100% |
|   3.13 | MOD-13: Quản Lý Nhà Tài Trợ, Banner Carousel Affiliate & Sàn TMĐT Luxury | Truyền thông & Tài trợ | Hoàn tất 100% |
| PHẦN 4 | Ma Trận Phân Quyền 5 Cấp Bậc Vai Trò Trên Hệ Thống App & Web | Kiểm soát truy cập | Hoàn tất 100% |
| PHẦN 5 | Thiết Kế Cơ Sở Dữ Liệu PostgreSQL & Bảng Nghiệp Vụ App Di Động | Database & Schemas | Hoàn tất 100% |
| PHẦN 6 | Kịch Bản Kiểm Thử Nghiệm Thu Chấp Thuận (UAT Acceptance Test Cases) | Kiểm thử UAT | Hoàn tất 100% |


| Mục Quản Trị | Thông Tin Chi Tiết |
| --- | --- |
| Tên Ứng Dụng (Mobile Name) | CEO1983 (Chuẩn hóa viết liền không dấu cách, biểu tượng số 8 mạ vàng doanh nhân) |
| Mã Tài Liệu | SRS-CEO1983-APP-V4.5 |
| Phiên Bản | Version 4.5 - Master BA Comprehensive Specification (Chuẩn hóa 13 phân hệ App di động có bìa & mục lục) |
| Đơn Vị Chủ Quản | CLB Doanh Nhân CEO 1983 (Trực thuộc Hiệp Hội Doanh Nghiệp Trẻ Hà Nội - HanoiBA) |
| Tác Giả & Thẩm Định | Master Business Analyst, Solution Architect & Ban Thư Ký CLB CEO 1983 |
| Đối Tượng Sử Dụng | Hội viên Doanh nhân CLB CEO 1983, Ban Quản Trị, Ban Soát Vé Sự Kiện, Ban Truyền Thông, Ban Thành Viên, Ban Tài Chính |
| Nền Tảng Triển Khai | PWA Mobile Web & Mobile App (Android APK qua Capacitor 8.5 / iOS IPA / React 19 / TanStack Router) |
| Phong Cách Thiết Kế | Executive Luxury Champagne Gold (#D97706, #FEF3C7) & Royal Navy (#003B95, #0A1834). Đẳng cấp doanh nhân sang trọng. |
| Hệ Thống Tích Hợp | Web CRM CEO 1983, Cổng Thanh Toán VietQR Napas 24/7, Camera Barcode Scanner, Web NFC API, Push Notification |


## PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM KỸ THUẬT CỐT LÕI

> **HÌNH TƯỢNG VÍ VON ĐỜI THƯỜNG DỄ HIỂU:**
> 1. **Luồng Cuộc Gặp (Hẹn bàn 1-on-1):** Thiệp mời cà phê bàn tròn giao thương tự động đồng bộ lịch vào sổ tay hai CEO.
> 2. **Soát Vé QR Cổng Sự Kiện:** Mắt thần camera chỉ kích hoạt cho nhân sự Ban Truyền Thông được BQT chỉ định.
> 3. **Thẻ VIP 3D & Chạm NFC:** Danh thiếp mạ vàng chạm lưng điện thoại lưu danh bạ (.VCF) tức thì sau 1 giây.
> 4. **Cơ Chế Điểm Danh Kép:** Tự quét Standee nhận bàn/ghế/mã bốc thăm hoặc chìa vé QR cho ban kiểm soát gạch vé.
> 5. **Tin Nhắn VIP Messenger:** Chat 1-1 bong bóng xanh #0084FF, thu hồi tin, thả cảm xúc emoji, họp nhóm ban ngành.
> 6. **Quà Sinh Nhật & Chủ Đề Lễ Hội:** Tự động chúc mừng sinh nhật kèm voucher chiết khấu; đổi giao diện Tết, Noel, Tuyên Quang.

## PHẦN 2: BẢN ĐỒ 5 TAB CHỨC NĂNG & PHÂN QUYỀN TRÊN APP

| Tab Điều Hướng | Tên Chức Năng | Quyền Hiển Thị | Mô Tả Nghiệp Vụ |
| --- | --- | --- | --- |
| Tab 1: Trang Chủ (/association) | Home Dashboard & VIP Card | Tất cả (Tiện ích Soát vé QR chỉ mở cho nhân sự được gán) | Thẻ VIP 3D chạm NFC, sự kiện nổi bật, tiện ích Soát vé sự kiện (chỉ mở cho nhân sự được BQT chỉ định), tin tức hoạt động CLB, popup sinh nhật tự động. |
| Tab 2: Sự Kiện (/association/events) | Events & Dual Check-in Pass | Tất cả (Hội viên xem chung + đăng ký vé) | Lịch đại hội gala, sơ đồ khán phòng bàn VIP, quét mã Standee tự động nhận bàn/ghế/mã may mắn, cuống vé điện tử QR cá nhân. |
| Tab 3: Thẻ 83 (/association/card) | Smart NFC Card & Business Identity | Tất cả (Thao tác thẻ cá nhân) | Trọng tâm thanh điều hướng: Mở danh thiếp số 3D, mã QR định danh cá nhân, chạm kết nối NFC, chia sẻ link hồ sơ doanh nhân công khai /card/:code. |
| Tab 4: Tin Nhắn (/association/messages) | Messages, Meetings & 1-on-1 | Tất cả (Chat cá nhân + Xem họp) | Hộp thư doanh nhân VIP phong cách Messenger, chat 1-1, nhóm chat ban ngành, luồng cuộc gặp hẹn bàn 1-on-1, lịch cuộc họp Online/Offline. |
| Tab 5: Cá Nhân (/association/profile) | Profile, Settings & Invoices | Tất cả (Quản lý thông tin mình) | Chỉnh sửa nhanh hồ sơ CEO, quản lý doanh nghiệp, tra cứu hóa đơn hội phí thường niên VietQR, danh bạ 7 ban ngành, hỗ trợ thư ký, đổi mật khẩu và bảo mật. |


### 3.1 MOD-01: Xác Thực, Đăng Nhập & Kích Hoạt Thẻ Hội Viên
• Mục tiêu: Cung cấp cổng xác thực đa kênh tiện lợi, bảo mật cao cho CEO và lãnh đạo doanh nghiệp.
• Chức năng chi tiết:
  - AUTH-01: Đăng nhập đa kênh (Số điện thoại / Mã hội viên M1983-xxx / Email) kết hợp mật khẩu. Tự động lưu refresh token và nhận diện phiên làm việc.
  - AUTH-02: Đăng ký tài khoản hội viên mới & Form hồ sơ pháp nhân doanh nghiệp đầy đủ (loại bỏ trường doanh thu).
  - AUTH-03: Quên mật khẩu & xác thực mã OTP qua SMS / Zalo ZNS.
  - AUTH-04: Đổi mật khẩu & Quản lý phiên đăng nhập các thiết bị.
  - AUTH-05: Cài đặt PWA lên màn hình chính (Add to Home Screen trên iOS và Android Install Prompt).
• Quy trình đăng nhập chi tiết (Step-by-step Flow):
  - Bước 1: Hội viên mở App, nhập Số điện thoại (hoặc Mã hội viên) và Mật khẩu.
  - Bước 2: Bấm nút "Đăng Nhập". App gọi API POST /api/auth/login.
  - Bước 3: Máy chủ kiểm tra thông tin, sinh JWT Access Token và Refresh Token an toàn.
  - Bước 4: Ứng dụng chuyển hướng vào Trang chủ (/association), đồng thời tải dữ liệu hồ sơ cá nhân và kết nối WebSocket thông báo realtime.
• API Mapped: POST /api/auth/login, POST /api/auth/register, POST /api/auth/forgot-password, PUT /api/auth/password.

### 3.2 MOD-02: Thẻ Hội Viên Thông Minh VIP 3D Chìm Logo & Danh Thiếp Điện Tử (Digital Card)
• Mục tiêu: Xây dựng bộ nhận diện số sang trọng, quyền lực cho từng CEO thành viên CLB 1983 với thiết kế chìm logo tinh tế không nền đen.
• Chức năng chi tiết:
  - CARD-01: Hiển thị Thẻ Hội Viên VIP 3D Chìm Logo (Screen Blend): Loại bỏ triệt để viền đen của ảnh logo thông qua kỹ thuật hòa trộn màn hình CSS (mix-blend-screen / mixBlendMode: "screen"). Logo số 8 mạ vàng và chữ CEO1983 hiển thị trong suốt, chìm tinh tế vào nền thẻ gradient Royal Navy (#003B95 - #0A1834) và viền vàng champagne, không để lại mảng khối đen thô ráp.
  - CARD-02: Huy hiệu định danh cao cấp: Avatar hội viên bo tròn viền gradient hoàng gia, Mã hội viên M1983-xxx, Dấu tích xanh xác thực chính thức (Verified Member Badge), Chức vụ và Tên công ty pháp nhân.
  - CARD-03: Cấu trúc hồ sơ doanh nhân 360° ngay bên dưới thẻ: tiểu sử lãnh đạo, ngành nghề kinh doanh chính, nhu cầu kết nối cung ứng, thông tin mã số thuế và văn phòng đại diện.
  - CARD-04: Tích hợp mạng xã hội & ví điện tử (Facebook, Zalo, LinkedIn, Apple Wallet Pass, Google Wallet).
  - CARD-05: Danh thiếp số công khai chuẩn nhận diện CLB CEO 1983 (/card/:code) giúp đối tác bên ngoài quét xem không cần cài app.
  - CARD-06: Nút "Xem danh thiếp số" 1 chạm tích hợp trong hồ sơ hội viên và hộp thư chat.
• Quy trình chia sẻ danh thiếp số tuần tự (Step-by-step Flow):
  - Bước 1: Hội viên mở Tab "Thẻ 83" (/association/card) hoặc bấm vào thẻ VIP trên màn hình chính.
  - Bước 2: Thẻ VIP 3D xoay mượt mà, hiển thị logo chìm sang trọng và mã QR cá nhân sắc nét.
  - Bước 3: Đối tác dùng camera điện thoại quét mã QR cá nhân.
  - Bước 4: Trình duyệt điện thoại của đối tác mở trang web danh thiếp số công khai (/card/:code) hiển thị đầy đủ thông tin CEO và doanh nghiệp.
  - Bước 5: Đối tác bấm nút "Lưu Danh Bạ" -> Hệ thống tự động tải file .VCF lưu thẳng vào danh bạ điện thoại của đối tác mà không cần đối tác tải app.
• API Mapped: GET /api/connect-app/me, GET /api/business-cards/code/:code, PUT /api/connect-app/me/socials.

### 3.3 MOD-03: Công Nghệ Chạm Thẻ Thông Minh NFC & Wallets
• Mục tiêu: Hiện thực hóa công nghệ một chạm kết nối thông minh giữa thẻ vật lý và thiết bị di động.
• Chức năng chi tiết:
  - NFC-01: Popup Radar quét sóng và chạm kết nối NFC một chạm qua Web NFC API (NDEFReader).
  - NFC-02: Ghi dữ liệu URL danh thiếp cá nhân hóa vào phôi thẻ NFC kim loại / gỗ NTAG213/215.
• Quy trình chạm thẻ vật lý (Step-by-step Flow):
  - Bước 1: Hội viên mở popup "Chạm Thẻ NFC" trên App di động.
  - Bước 2: Chạm lưng điện thoại vào thẻ kim loại / phôi thẻ NFC của đối tác.
  - Bước 3: Radar trên màn hình phát hiệu ứng quét sóng âm và thông báo: "Đã nhận diện Thẻ Doanh Nhân [Tên CEO]".
  - Bước 4: App lập tức mở hồ sơ chi tiết của đối tác và đề xuất kết nối giao thương.
• Ghi chú môi trường: Đã hoàn thiện logic đọc/ghi Web NFC API; cần thiết bị di động vật lý có chip NFC để test chạm thực tế.

### 3.4 MOD-04: Gắn Kết & Tin Nhắn Doanh Nhân Phong Cách Messenger VIP
• Mục tiêu: Xây dựng nền tảng liên lạc nội bộ bảo mật, chuyên nghiệp, hỗ trợ tối đa cho việc giao thương và hội họp.
• Chức năng chi tiết:
  - MSG-01: Hộp thư doanh nhân với 3 tab: "Tất cả", "Chưa đọc", "Nhóm ban ngành". Hiển thị snippet tin nhắn mới nhất và badge số lượng chưa đọc.
  - MSG-02: Giao diện Chat 1-1 phong cách Messenger (Bong bóng chat xanh #0084FF, avatar đối tác, thời gian gửi, trạng thái Đã gửi / Đã nhận / Đã xem).
  - MSG-03: Thu hồi tin nhắn đã gửi (Recall Message) và cơ chế tự động nhảy lên đầu danh sách hội thoại khi có tin mới.
  - MSG-04: Thanh tương tác nhanh thả 6 emoji cảm xúc (Thích, Yêu, Cười, Ngạc nhiên, Buồn, Phẫn nộ) và menu tùy chọn.
  - MSG-05: Đính kèm Thư mời họp B2B ([B2B_CONNECT_INVITE]) trực tiếp trong luồng chat kèm nút Đồng ý / Đổi giờ / Từ chối.
  - MSG-06: Tạo nhóm chat theo từng Ban ngành, sự kiện (CreateGroupChatModal: gợi ý tên, icon, lọc thành viên theo ban ngành).
  - MSG-07: Gọi thoại & gọi video WebRTC 1-1 giữa các CEO.
• Quy trình trao đổi tin nhắn B2B (Step-by-step Flow):
  - Bước 1: Hội viên vào Tab Tin Nhắn (/association/messages), chọn một cuộc hội thoại hoặc bấm nút chat từ danh bạ.
  - Bước 2: Nhập nội dung văn bản, chèn ảnh, tài liệu hoặc bấm nút "Gửi Thư Mời Họp B2B".
  - Bước 3: Bấm nút Gửi. Hệ thống lưu tin nhắn vào bảng chat_messages và phát Socket.io thời gian thực đến người nhận.
  - Bước 4: Phía người nhận hiển thị bong bóng chat tức thì và có âm thanh thông báo nhẹ nhàng.
• API Mapped: GET /api/connect-app/dm/threads, POST /api/connect-app/dm/threads/:id/messages, DELETE /api/connect-app/dm/messages/:id.

### 3.5 MOD-05: Danh Bạ Hội Viên, Mời Gia Nhập & Quản Lý Kết Nối
• Mục tiêu: Tra cứu hồ sơ doanh nghiệp toàn diện, mở rộng mạng lưới giao lưu hợp tác trong hiệp hội.
• Chức năng chi tiết:
  - MEM-01: Danh bạ hội viên trực quan với bộ lọc thông minh theo ngành nghề, khu vực và từ khóa tìm kiếm.
  - MEM-02: Nút hành động nhanh dạng icon (Gọi điện, Nhắn tin, Hẹn gặp bàn tròn, Xem danh thiếp số).
  - MEM-03: Drawer đề xuất kết nối giao thương (BusinessConnectBottomSheet) kèm đính kèm nhu cầu hợp tác.
  - MEM-04: Tính năng Mời doanh nhân mới gia nhập CLB (sinh link giới thiệu độc quyền kèm mã hội viên giới thiệu).
• Quy trình gửi lời mời kết nối (Step-by-step Flow):
  - Bước 1: Tìm kiếm đối tác theo ngành nghề (Ví dụ: "Xây dựng", "Logistics") trong danh bạ.
  - Bước 2: Bấm nút "Bắt tay kết nối" (Handshake icon) trên thẻ hồ sơ của đối tác.
  - Bước 3: Mở Drawer nhập lời chào và chọn cơ hội hợp tác muốn thảo luận.
  - Bước 4: Bấm "Gửi Lời Mời". Hệ thống lưu trạng thái pending và gửi thông báo chuông đến đối tác.
• API Mapped: GET /api/members, POST /api/connections/invite, GET /api/members/:id/profile.

### 3.6 MOD-06: Sàn Giao Thương B2B Shopee Style: Đánh Giá Sản Phẩm & % Sao Doanh Nghiệp
• Mục tiêu: Xây dựng sàn thương mại B2B nội bộ chuẩn Shopee, thúc đẩy giao thương minh bạch với hệ số uy tín dựa trên đánh giá sao thực tế của các CEO.
• Chức năng chi tiết:
  - B2B-01: Thanh tìm kiếm & Bộ lọc chuẩn Shopee: Bên trái thanh tìm kiếm là icon Menu phân loại (SlidersHorizontal) mở bộ lọc sắp xếp giá (Tăng dần / Giảm dần), sắp xếp theo hàng Mới nhất hoặc Bán chạy nhất. Ngay bên dưới thanh tìm kiếm là dải chip Danh mục gần đây đã chọn (Recent Categories chips - lưu bộ nhớ cache localStorage) giúp hội viên quay lại danh mục ưa thích chỉ với 1 chạm.
  - B2B-02: Hiển thị Đánh giá sản phẩm & % Điểm Sao Doanh Nghiệp:
    + Mỗi thẻ sản phẩm hiển thị số sao trung bình (Ví dụ: 4.9⭐) và số lượng đã bán / đã giao dịch.
    + Điểm sao của công ty thành viên được tính chính xác theo tỷ lệ phần trăm tổng số sao từ toàn bộ lượt đánh giá:
      Công thức: % Hài Lòng = [ Tổng số sao nhận được / (Tổng số lượt đánh giá * 5) ] * 100%
      Ví dụ: Một công ty nhận 1.670 sao từ 342 lượt đánh giá -> Điểm công ty: 4.88⭐ (97.7% hài lòng).
  - B2B-03: Modal Chi Tiết Sản Phẩm & Đánh Giá Chuẩn Shopee (ShopeeProductDetailModal):
    + Header Shopee Mall đỏ - vàng uy tín, nhãn "CEO1983 Mall" bảo chứng chất lượng.
    + Khối Hồ sơ Shop Doanh Nghiệp: Logo, tên doanh nghiệp, điểm sao công ty kèm %, số lượng sản phẩm đang niêm yết, tỷ lệ phản hồi chat (100%), thời gian gia nhập CLB.
    + Khối Đánh Giá Sản Phẩm (Rating Breakdown): Điểm số trung bình lớn 4.9/5, hiển thị thanh tiến trình 5 sao, 4 sao, 3 sao, 2 sao, 1 sao.
    + Bộ lọc tab đánh giá: Tất cả, 5 sao, 4 sao, 3 sao, 2 sao, 1 sao, Có nhận xét chi tiết.
    + Danh sách nhận xét của các CEO: Tên hội viên, công ty, avatar, số sao đánh giá, thời gian, nội dung nhận xét và phản hồi chính thức của nhà bán.
    + Form gửi đánh giá nhanh: Chọn số sao từ 1 đến 5 và viết cảm nhận chất lượng hàng hóa.
  - B2B-04: Nút "Chat Thương Thảo B2B" chuyển thẳng vào luồng chat 1-1 với chủ doanh nghiệp để đàm phán hợp đồng.
• Quy trình xem & đánh giá sản phẩm tuần tự (Step-by-step Flow):
  - Bước 1: Hội viên vào Sàn Giao Thương (/association/products).
  - Bước 2: Bấm icon Menu bên trái thanh tìm kiếm để chọn sắp xếp "Giá: Thấp đến Cao" hoặc chọn một danh mục từ dải "Danh mục gần đây".
  - Bước 3: Bấm vào một sản phẩm trên sàn -> Mở ShopeeProductDetailModal.
  - Bước 4: Hội viên xem thông số kỹ thuật, uy tín % sao của công ty đối tác, kéo xuống đọc nhận xét của các CEO khác.
  - Bước 5: Bấm "Thêm Đánh Giá", chọn 5 sao, nhập nội dung "Sản phẩm chất lượng vượt trội, đóng gói chuyên nghiệp" và bấm Gửi Đánh Giá.
  - Bước 6: Hệ thống cập nhật tức thì điểm đánh giá sản phẩm và tính toán lại % điểm sao uy tín của doanh nghiệp.
• API Mapped: GET /api/products, GET /api/products/:id/reviews, POST /api/products/:id/reviews, GET /api/companies/:id/rating-summary.

### 3.7 MOD-07: Sự Kiện Tràn Viền, Check-in QR Kép & Biểu Quyết Bầu Cử
• Mục tiêu: Quản lý xuyên suốt trải nghiệm tham dự đại hội, gala tiệc tối từ đăng ký, soát vé đến biểu quyết và quay thưởng.
• Chức năng chi tiết:
  - EVT-01: Danh sách sự kiện với ảnh banner tràn viền 16:9, đếm ngược thời gian khai mạc, thông tin sơ đồ khán phòng và nhà tài trợ.
  - EVT-02: Đăng ký vé tham dự và nhận Cuống Vé Điện Tử Viền Vàng cá nhân (kèm mã QR soát vé riêng).
  - EVT-03: Cơ chế Điểm Danh Kép (Dual Check-in):
    + Chế độ 1 (Hội viên tự quét Standee): Mở camera quét mã QR đặt tại cửa -> Hệ thống báo ngay Bàn VIP mấy, Ghế mấy và sinh Mã số may mắn.
    + Chế độ 2 (Soát vé qua cổng): Chìa vé điện tử cho nhân sự Ban Truyền Thông quét gạch vé.
  - EVT-04: Biểu quyết đại hội trực tuyến: Xem danh sách đề án bầu cử, chọn phương án và bấm xác nhận bỏ phiếu.
  - EVT-05: Vòng quay may mắn Lucky Draw: Hiển thị mã may mắn cá nhân và theo dõi trực tiếp kết quả quay số trúng thưởng.
• Quy trình tự quét Standee điểm danh (Step-by-step Flow):
  - Bước 1: Đến sảnh hội trường, hội viên mở Tab Sự Kiện, bấm nút "Quét Mã Standee Lễ Tân".
  - Bước 2: Hướng camera vào mã QR in trên Standee đón tiếp.
  - Bước 3: Màn hình hiển thị Thẻ Chúc Mừng Điểm Danh mạ vàng: "Chào mừng CEO [Tên]! Quý khách ngồi tại Bàn VIP 02, Ghế 06. Mã số may mắn của quý khách: LUCK-8319".
• API Mapped: GET /api/events, POST /api/events/:id/register, POST /api/events/checkin/confirm, POST /api/voting/ballot.

### 3.8 MOD-08: Thu & Đóng Hội Phí Tự Động Qua VietQR Napas 24/7
• Mục tiêu: Tối giản thủ tục tài chính, giúp CEO hoàn thành nghĩa vụ hội phí chỉ trong 1 chạm chuyển khoản ngân hàng.
• Chức năng chi tiết:
  - FEE-01: Tra cứu trạng thái thẻ và hạn hội phí trên trang cá nhân và thẻ VIP.
  - FEE-02: Nút "Đóng hội phí thường niên" mở Popup hiển thị Mã VietQR động chuẩn Napas 24/7 (tự động điền số tiền, số tài khoản CLB và cú pháp chuyển khoản chính xác).
  - FEE-03: Xem lịch sử hóa đơn thanh toán và xuất phiếu thu điện tử VAT.
• API Mapped: GET /api/invoices/me, POST /api/invoices/vietqr/generate, POST /api/invoices/webhook/napas.

### 3.9 MOD-09: Trang Cá Nhân, Bố Cục Tin Tức 50% & Hỗ Trợ Ban Thư Ký
• Mục tiêu: Tối ưu không gian hiển thị thông tin cá nhân và tin tức hoạt động hiệp hội hài hòa.
• Chức năng chi tiết:
  - PRO-01: Bố cục màn hình cá nhân chia tỷ lệ 50/50: Nửa trên là danh thiếp CEO và thống kê hoạt động, nửa dưới là bảng tin hoạt động CLB.
  - PRO-02: Popup QuickProfileEditModal cho phép đổi ảnh đại diện, ảnh bìa, logo công ty và slogan chỉ trong 10 giây.
  - PRO-03: Modal ContactSupportModal hiển thị danh bạ trực ban và số hotline của 7 ban chuyên môn CLB.
  - PRO-04: Modal UserGuideModal cẩm nang hướng dẫn sử dụng app tương tác từng bước kèm tải file PDF chính thức.
• API Mapped: GET /api/members/me, PUT /api/members/me, GET /api/association/committees.

### 3.10 MOD-10: Tách Biệt Độc Lập Luồng Thông Báo & Landing Page Điện Ảnh
• Mục tiêu: Phân định rạch ròi giữa thông báo hệ thống và tin nhắn trò chuyện, mang lại trải nghiệm không bị xao nhãng.
• Chức năng chi tiết:
  - NOTIF-01: Chuông thông báo độc lập trên thanh Header: Nhận thông báo xét duyệt hồ sơ, lời mời kết nối được chấp nhận, nhắc lịch họp offline và biên lai thanh toán.
  - NOTIF-02: Trang Landing Page công khai phong cách điện ảnh (Cinematic Visual) giới thiệu sứ mệnh, Ban Chấp hành và quyền lợi hội viên CEO 1983.
• API Mapped: GET /api/notifications, PUT /api/notifications/:id/read.

### 3.11 MOD-11: Đăng Ký Landing 3 Cấp, Onboarding, Quyền Riêng Tư & 7 Ban Ngành
• Mục tiêu: Hướng dẫn người dùng mới, bảo vệ quyền riêng tư số và kết nối chuyên sâu theo ban chuyên môn.
• Chức năng chi tiết:
  - ONB-01: Luồng Onboarding 3 bước giới thiệu các giá trị cốt lõi khi mở app lần đầu.
  - ONB-02: Cài đặt quyền riêng tư: Ẩn/Hiện số điện thoại, ẩn email cá nhân trên danh thiếp số công khai.
  - ONB-03: Danh bạ 7 Ban ngành chuyên môn CLB CEO 1983 (Ban Hội viên, Ban Tài chính, Ban Xúc tiến thương mại, Ban Truyền thông, Ban Sự kiện, Ban Đào tạo, Ban Pháp chế).
• API Mapped: GET /api/association/committees, PUT /api/members/me/privacy.

### 3.12 MOD-12: Tinh Chỉnh Trải Nghiệm Doanh Nhân & Chúc Mừng Sinh Nhật Tự Động
• Mục tiêu: Tạo cảm giác gắn kết gia đình, ấm áp và trân trọng đối với từng doanh nhân trong hiệp hội.
• Chức năng chi tiết:
  - EXP-01: Luồng Ưu đãi & Chúc mừng sinh nhật tự động (Birthday Surprise Flow):
    + Tự động so khớp ngày sinh của hội viên với ngày hiện tại của hệ thống.
    + Hiển thị popup thiệp mừng mạ vàng kèm hiệu ứng pháo hoa rực rỡ, trao mã voucher quà tặng chiết khấu dịch vụ B2B độc quyền.
    + Tự động lưu mã voucher vào ví cá nhân và ghi nhớ trạng thái không làm phiền lại trong ngày.
  - EXP-02: Bộ chuyển đổi chủ đề mùa lễ hội linh hoạt (Seasonal Theme Switcher):
    + Phong cách Classic Doanh nhân Cổ điển (Xanh Navy & Vàng Champagne).
    + Phong cách Hội Tụ Tuyên Quang (Sự kiện đại hội, hoa sen và danh lam).
    + Phong cách Giáng Sinh (Tuyết rơi nhẹ, chuông vàng lễ hội).
    + Phong cách Tết Nguyên Đán (Sắc đỏ may mắn, cành mai hoa đào vàng).
• API Mapped: GET /api/members/me/birthday, GET /api/theme/config.

### 3.13 MOD-13: Quản Lý Nhà Tài Trợ, Banner Affiliate & Sàn TMĐT Luxury
• Mục tiêu: Khai thác tiềm năng truyền thông và thương mại của cộng đồng doanh nhân chất lượng cao.
• Chức năng chi tiết:
  - MKT-01: Top Carousel Banner nhà tài trợ nổi bật ở đầu trang Sàn Giao Thương (tự động chuyển slide mỗi 4 giây kèm huy hiệu "Được Tài Trợ").
  - MKT-02: Nút "Đăng Ký Chạy Quảng Cáo / Tài Trợ" mở modal thu thập thông tin chiến dịch, hình ảnh banner và link điều hướng.
  - MKT-03: Tích hợp đóng phí tài trợ trực tiếp qua cổng VietQR Napas 24/7 và kiểm duyệt xuất bản từ Web CRM.
• API Mapped: GET /api/sponsored-ads, POST /api/sponsored-ads/register.

## PHẦN 4: MA TRẬN PHÂN QUYỀN 5 CẤP BẬC VAI TRÒ TRÊN HỆ THỐNG

| Chức Năng Nghiệp Vụ | Quản Trị (Super Admin) | Admin (Ban Thư Ký) | Tổng Thư Ký | Trưởng Ban | Thành Viên |
| --- | --- | --- | --- | --- | --- |
| Thẻ VIP 3D & Chạm NFC | Toàn quyền cấu hình & xem | Toàn quyền hỗ trợ thẻ | Toàn quyền thao tác | Toàn quyền thao tác | Thao tác thẻ cá nhân |
| Soát Vé Sự Kiện QR | Toàn quyền kiểm soát | Toàn quyền kiểm soát | Toàn quyền kiểm soát | Kiểm soát khi được gán | Ẩn hoàn toàn (Không có quyền) |
| Tạo Cuộc Họp Mới | Tạo & Duyệt ngay | Tạo & Duyệt ngay | Được tạo (Chờ Quản trị duyệt) | Được tạo (Chờ Quản trị duyệt) | Không có quyền tạo |
| Phê Duyệt Cuộc Họp | Thẩm quyền tối cao | Thẩm quyền duyệt | Không có quyền duyệt | Không có quyền duyệt | Không có quyền duyệt |
| Đăng Ký Phòng Họp | Gộp dropdown tạo cuộc họp | Gộp dropdown tạo cuộc họp | Gộp dropdown tạo cuộc họp | Gộp dropdown tạo cuộc họp | Không có quyền |
| Xác Nhận Họp (RSVP) | Xem & Điểm danh toàn bộ | Xem & Điểm danh toàn bộ | Xác nhận & Điểm danh ban | Xác nhận & Điểm danh ban | Bấm Xác nhận / Báo vắng |
| Cuộc Gặp 1-on-1 Doanh Nhân | Xem toàn bộ lịch hẹn | Xem hỗ trợ kết nối | Tạo & Nhận cuộc gặp | Tạo & Nhận cuộc gặp | Tạo & Nhận cuộc gặp |
| Quản Trị Sàn B2B & Duyệt Tin | Toàn quyền duyệt sản phẩm | Kiểm duyệt sản phẩm | Đăng bài doanh nghiệp | Đăng bài doanh nghiệp | Đăng bài doanh nghiệp |
| Biểu Quyết Đại Hội | Tạo hòm phiếu & Khóa phiếu | Hỗ trợ tạo hòm phiếu | Bỏ phiếu đại biểu | Bỏ phiếu đại biểu | Bỏ phiếu 1 lần duy nhất |
| Đóng Phí Hội Phí Thường Niên VietQR | Đối soát & Gạch nợ tự động | Hỗ trợ đối soát nợ | Đóng phí tài khoản mình | Đóng phí tài khoản mình | Đóng phí tài khoản mình |


## PHẦN 5: THIẾT KẾ CƠ SỞ DỮ LIỆU LIÊN QUAN TRÊN APP DI ĐỘNG

### 5.1 Bảng business_connections (Hẹn Bàn 1-on-1)

| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Mã cuộc hẹn duy nhất. |
| sender_member_id | UUID | Có | FK -> members.id | Hội viên chủ động gửi lời mời hẹn gặp. |
| receiver_member_id | UUID | Có | FK -> members.id | Hội viên nhận được lời mời hẹn gặp. |
| meeting_purpose | VARCHAR(255) | Có | None | Mục đích: Tìm hiểu chuỗi cung ứng, Hợp tác kinh doanh, Đầu tư. |
| proposed_time | TIMESTAMPTZ | Có | None | Thời gian hẹn gặp do bên mời đề xuất. |
| proposed_location | VARCHAR(255) | Có | None | Địa điểm hẹn gặp (Tên quán cà phê, văn phòng hoặc bàn VIP). |
| message | TEXT | Không | None | Lời nhắn gửi gắm của người mời. |
| status | VARCHAR(30) | Có | None | Trạng thái: "pending" (Chờ phản hồi), "confirmed" (Đã chốt), "declined" (Từ chối). |
| created_at | TIMESTAMPTZ | Có | None | Thời điểm gửi lời mời hẹn gặp. |


### 5.2 Bảng chat_messages (Tin Nhắn Doanh Nhân VIP)

| Tên Cột (Field) | Kiểu Dữ Liệu | Bắt Buộc? | Khóa (Key) | Giải Thích Chi Tiết |
| --- | --- | --- | --- | --- |
| id | UUID | Có | PK | Mã tin nhắn duy nhất. |
| thread_id | VARCHAR(100) | Có | None | Mã luồng trò chuyện 1-1 hoặc mã nhóm ban ngành. |
| sender_id | UUID | Có | FK -> vione_users.id | Người gửi tin nhắn. |
| content | TEXT | Có | None | Nội dung tin nhắn văn bản hoặc mã thẻ mời B2B. |
| type | VARCHAR(30) | Có | None | Loại tin: "text", "image", "file", "b2b_invite", "system". |
| reactions | JSONB | Không | None | Mảng chứa các biểu tượng cảm xúc đã thả (emoji, user_id). |
| is_recalled | BOOLEAN | Có | None | Đánh dấu tin nhắn đã bị thu hồi hay chưa. |
| created_at | TIMESTAMPTZ | Có | None | Thời điểm gửi tin nhắn. |


## PHẦN 6: KỊCH BẢN KIỂM THỬ NGHIỆM THU CHẤP THUẬN (UAT)

| Mã TC | Tên Nghiệp Vụ | Màn Hình Thao Tác | Thao Tác Thực Hiện | Kỳ Vọng Kỹ Thuật (API/Socket) | Kỳ Vọng Giao Diện (UI) |
| --- | --- | --- | --- | --- | --- |
| TC_APP_01 | Đăng nhập đa kênh | Màn hình Đăng nhập (/association/login) | Nhập SĐT/Mã M1983 và Mật khẩu | POST /api/auth/login trả JWT token 200 OK | Chuyển mượt mà vào Trang chủ, nạp thẻ VIP |
| TC_APP_02 | Xem Danh thiếp số công khai | Trang Public Card (/card/:code) | Quét QR trên thẻ hoặc mở link slug | GET /api/business-cards/code/:code trả dữ liệu CEO | Hiển thị thẻ 3D mạ vàng và nút Lưu danh bạ .VCF |
| TC_APP_03 | Tự quét QR Standee điểm danh | Màn hình Check-in (/association/events) | Quét QR Standee tại cửa đại hội | POST /api/events/checkin/standee ghi nhận vé | Bật popup Chúc mừng: Bàn VIP, Ghế ngồi, Mã quay số |
| TC_APP_04 | Soát vé kiểm soát cổng | Màn hình Soát vé (/association/checkin) | Nhân sự BTT quét vé QR của khách | GET lookup và POST confirm gạch vé thành công | Hiển thị Popup thông tin đại biểu, đổi vé sang Đã Vào |
| TC_APP_05 | Hội viên thường truy cập soát vé | Nhập URL /association/checkin | Hội viên không được gán cố tình vào link | Middleware chặn phân quyền (403 Forbidden) | Màn hình báo Không có quyền, có nút Về trang chủ |
| TC_APP_06 | Hẹn gặp bàn tròn 1-on-1 | Hồ sơ hội viên đối tác | Bấm nút Hẹn gặp bàn tròn, nhập giờ/địa điểm | POST /api/connections/meetings status = pending | Đối tác nhận thông báo đẩy và tin nhắn mời hẹn |
| TC_APP_07 | Thu hồi tin nhắn đã gửi | Màn hình Chat (/association/messages) | Bấm menu ⋯ tại tin nhắn -> Chọn Thu hồi | DELETE /api/connect-app/dm/messages/:id | Bong bóng đổi thành: Bạn đã thu hồi một tin nhắn |
| TC_APP_08 | Nhận Popup Chúc Mừng Sinh Nhật | Trang Chủ (/association) | Mở app đúng ngày sinh nhật hội viên | Kiểm tra ngày sinh khớp ngày hiện tại | Nổ pháo hoa chúc mừng kèm Voucher quà tặng độc quyền |
| TC_APP_09 | Chuyển đổi chủ đề mùa lễ hội | Modal Cài đặt chủ đề | Chọn chủ đề "Tết" hoặc "Giáng sinh" | Lưu ceo1983_active_theme vào localStorage | Header, banner và nút bấm đổi áo mới ngay lập tức |
| TC_APP_10 | Thanh toán hội phí VietQR | Trang Cá Nhân (/association/profile) | Bấm nút Đóng hội phí thường niên | POST /api/invoices/vietqr sinh mã QR Napas 24/7 | Hiển thị Popup VietQR chuẩn chứa số tiền và nội dung |


