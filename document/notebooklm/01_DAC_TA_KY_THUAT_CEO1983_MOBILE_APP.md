# MỤC 1: ĐẶC TẢ KỸ THUẬT & LUỒNG XỬ LÝ PHÂN HỆ MOBILE APP CEO 1983
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Phân hệ: Mobile Web App Hội viên (iOS / Android / PWA / Capacitor Native)*

---

## 1. TỔNG QUAN PHÂN HỆ MOBILE APP
- **Tên phân hệ**: Ứng dụng Di Động Hội Viên CLB Doanh Nhân CEO 1983 (`@ceo1983/app_fe`).
- **Đối tượng sử dụng**: Hội viên chính thức CLB CEO 1983 (Chủ tịch HĐQT, CEO, Tổng giám đốc, Nhà sáng lập) và các đối tác B2B.
- **Khung giao diện (Layout)**: `MemberShell.tsx` với **Bottom Navigation Bar** 5 mục:
  1. Trang chủ (`/association`)
  2. Cơ hội (`/association/opportunities`)
  3. Danh bạ (`/association/members`)
  4. Mạng lưới (`/association/messages`)
  5. Cá nhân (`/association/profile`)
- **Hệ thống màu thương hiệu & Quy chuẩn nút bấm (Strict UI Rules)**:
  - **Màu sắc thương hiệu**: Deep Cobalt Navy (`#1F3864`), Vàng Hoàng Gia Amber Gold (`#B8860B`), Xanh Ngọc Emerald (`#059669`).
  - **QUY CHUẨN NÚT BẤM (STRICT NO RED BUTTONS)**: Tuyệt đối không dùng nút bấm màu đỏ trên toàn bộ hệ thống. Nút chính dùng Navy hoặc Emerald, nút điểm nhấn/kêu gọi hành động dùng Amber Gold, nút đóng/hủy dùng Slate.

---

## 2. ĐẶC TẢ CHI TIẾT THEO TỪNG NODE CHỨC NĂNG

### `[NODE-APP-001]` Trang Chủ Hội Viên, Dải Nến Candlestick & 4 Phím Tắt Tùy Biến
- **Route Frontend**: `/association` (`src/routes/association.index.tsx`).
- **Thành phần**: `CustomHomeShortcutsModal.tsx`, `FeedSummaryWidget.tsx`, `UpcomingEventsWidget.tsx`.
- **API Backend**: `GET /association/home-feed`, `GET /association/home-stats` (`feed.service.ts`, `opportunity.service.ts`).
- **Bảng CSDL**: `feed_posts`, `events`, `opportunities`, `products`.
- **Luồng xử lý**:
  - Dải Cơ Hội Kinh Doanh Kéo Full-Width: Tích hợp widget Biểu đồ nến Candlestick thời gian thực biểu thị biến động giao thương theo từng khung giờ trong ngày (Open, High, Low, Close, Volume).
  - Khối Sàn Giao Thương B2B được đẩy xuống ngay bên dưới dạng thẻ full-width card dễ quan sát.
  - Tải số liệu thống kê thật 100% từ CSDL (tổng số deal, tổng giá trị, sản phẩm). Tuyệt đối không dùng số fallback giả.
  - Cho phép hội viên mở modal tùy biến chọn 4 phím tắt thường dùng nhất trong số 10 tính năng. Lưu vào `localStorage` theo key `vba_user_custom_shortcuts_${userId}` và hiển thị badge số lượng.
  - Cho phép đổi nhanh Avatar, Cover photo, Logo công ty kiểu Facebook ngay tại trang chủ và phát sự kiện đồng bộ.

### `[NODE-APP-002]` Thẻ Hội Viên VIP Số & QR Cá Nhân
- **Route Frontend**: `/association/card` (`src/routes/association.card.tsx`).
- **Thành phần**: `Ceo1983BusinessCardVisit.tsx`, `QrEnlargeModal.tsx`.
- **API Backend**: `GET /association/card-profile`, `PUT /association/card-privacy` (`card.service.ts`).
- **Bảng CSDL**: `members`, `companies`, `member_cards`.
- **Luồng xử lý**:
  - Góc trên bên phải của Thẻ Hội Viên là Logo doanh nghiệp của hội viên (tải lên linh hoạt).
  - Bấm vào mã QR cá nhân sẽ mở Popup phóng to toàn màn hình để người đối diện quét nhanh.
  - Cung cấp 2 công tắc bảo vệ quyền riêng tư cho Số điện thoại và Email.
  - Tích hợp nút Quét mã QR trực tiếp ngay dưới thẻ để quét thẻ của đối tác tại hội nghị.

### `[NODE-APP-003]` Trang Quét Danh Thiếp Công Khai Bảo Mật
- **Route Frontend**: `/card/$code` (`src/routes/card.$code.tsx`).
- **API Backend**: `GET /card/public/:code` (`card.service.ts`).
- **Bảng CSDL**: `members`, `companies`.
- **Luồng xử lý**:
  - Bất kỳ ai quét mã QR vật lý hoặc QR số của hội viên sẽ truy cập vào trang này.
  - Nếu hội viên bật chế độ ẩn Số điện thoại hoặc Email, giao diện hiển thị thông báo "🔒 Đã ẩn theo cài đặt riêng tư" thay vì số thật.
  - Thiết kế đồng bộ 100% về kích thước, màu sắc và kiểu dáng thẻ với Thẻ hội viên nội bộ.

### `[NODE-APP-004]` Danh Bạ Hội Viên & Chế Độ Bản Đồ Định Vị
- **Route Frontend**: `/association/members` (`src/routes/association.members.tsx`).
- **Thành phần**: `BusinessConnectBottomSheet.tsx`, `MemberCardGrid.tsx`.
- **API Backend**: `GET /association/members`, `GET /members/locations`, `PUT /members/my-location` (`members.service.ts`).
- **Bảng CSDL**: `members`, `companies`, `b2b_connections`.
- **Luồng xử lý**:
  - Hỗ trợ 2 chế độ: Chế độ Danh Sách và Chế độ Bản Đồ Hội Viên tương tác trực tiếp.
  - Chế độ Bản Đồ hiển thị tọa độ các quận trọng điểm và ghim Avatar nổi bật của các hội viên kích hoạt chia sẻ vị trí (`is_location_sharing = true`).
  - Nhấp vào Avatar mở Mini Card tóm tắt doanh nghiệp kèm nút Gọi điện thoại hoặc Đặt lịch hẹn 1-on-1.
  - Dải chữ cái A-Z cuộn ngang trên điện thoại, nút hành động gọi điện, nhắn tin, đặt lịch kết nối.

### `[NODE-APP-005]` Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang
- **Route Frontend**: `/association/opportunities` (`src/routes/association.opportunities.tsx`).
- **Thành phần**: `OpportunityCard.tsx`, `OpportunityFilterTabs.tsx`.
- **API Backend**: `GET /association/opportunities`, `POST /association/opportunities` (`opportunity.service.ts`).
- **Bảng CSDL**: `opportunities`, `members`.
- **Luồng xử lý**:
  - Dải 3 thẻ thống kê ngang nhỏ gọn trên đầu: "Tổng chia sẻ", "Deal đã chốt", "Tôi share đi", kèm nút điều hướng nhanh sang Trung tâm Thống kê.
  - Bộ lọc 3 trạng thái rõ ràng: "Tất cả", "🛒 Bên mua (Cần mua / Tìm đối tác)", "📦 Bên bán (Cung cấp / Bán hàng)", kết hợp bộ lọc 10 ngành nghề trọng điểm.

### `[NODE-APP-006]` Trung Tâm Thống Kê (Toàn CLB vs Cá Nhân Tôi)
- **Route Frontend**: `/association/analytics` (`src/routes/association.analytics.tsx`).
- **API Backend**: `GET /association/opportunities/report`, `GET /analytics/overview` (`opportunity.service.ts`, `analytics.service.ts`).
- **Bảng CSDL**: `opportunities`, `members`.
- **Luồng xử lý**:
  - Thiết kế 2 Tab phân tích so sánh: "Tab Toàn CLB" (bức tranh tổng thể, cơ cấu ngành nghề) vs "Tab Cá Nhân Tôi" (cơ hội đã trao, cơ hội đã nhận, deal đã chốt).
  - Trên đỉnh cao nhất của timeline biểu đồ gắn trực tiếp **Avatar tròn viền vàng** vinh danh Doanh nhân Top 1 Giver.
  - Bảng xếp hạng Top Givers có thể mở rộng/thu gọn và danh sách cơ hội thời gian thực.

### `[NODE-APP-007]` Sàn Giao Thương B2B Giới Hạn 5 Sản Phẩm
- **Route Frontend**: `/association/products` (`src/routes/association.products.tsx`).
- **Thành phần**: `ProductPostModal.tsx`, `ObsidianSponsorCarousel.tsx`.
- **API Backend**: `GET /association/products`, `POST /association/products` (`marketplace.service.ts`).
- **Bảng CSDL**: `products`, `members`, `companies`.
- **Luồng xử lý**:
  - Mỗi doanh nghiệp thành viên CHỈ ĐƯỢC ĐĂNG TỐI ĐA 5 sản phẩm/dịch vụ tiêu biểu (chống spam).
  - Hiển thị huy hiệu `(X/5 sản phẩm)` và banner quy chuẩn. Từ chối tạo mới khi đã đạt mốc 5 sản phẩm.
  - Băng chuyền nhà tài trợ Obsidian Dark viền Amber Gold. Nút nhắn tin trực tiếp cho người đại diện bán hàng.

### `[NODE-APP-008]` Lịch Trình Sự Kiện & Cuộc Họp Ban YBA
- **Route Frontend**: `/association/events` (`src/routes/association.events.tsx`).
- **Thành phần**: `RegisteredEventsQrSlider.tsx`, `EventsErrorBoundary.tsx`, `EventTicketModal.tsx`.
- **API Backend**: `GET /association/events`, `POST /association/events/:id/register` (`events.service.ts`, `meetings.service.ts`).
- **Bảng CSDL**: `events`, `meetings`, `event_registrations`.
- **Luồng xử lý**:
  - Chuẩn hóa 2 Tab độc lập theo phong cách YBA: "Tab 1: Sự Kiện CLB" (Đại hội, Gala, Giải Golf) vs "Tab 2: Cuộc Họp & Gặp Mặt" (Họp Ban, Cafe Doanh nhân, Caravan Thăm DN).
  - Bọc `EventsErrorBoundary` cấp route để tránh văng crash toàn trang khi có dữ liệu ngày tháng bất thường.
  - Tự động hiển thị huy hiệu `[Họp Ban]` và liên kết tham gia phòng họp trực tuyến Jitsi Meet.
  - Slide cuộn ngang hiển thị trực tiếp tối đa 3 mã QR vé tham dự đã đăng ký.

### `[NODE-APP-009]` Biểu Quyết Trực Tuyến Gắn Với Sự Kiện/Họp
- **Route Frontend**: `/association/voting` (`src/routes/association.voting.tsx`).
- **API Backend**: `GET /association/polls`, `POST /association/polls/:id/vote` (`voting.service.ts`).
- **Bảng CSDL**: `polls`, `poll_options`, `poll_votes`.
- **Luồng xử lý**:
  - Tab 1 - Biểu quyết đang diễn ra: Các phiên gắn với sự kiện/cuộc họp đang mở, hiển thị các lựa chọn (Tán thành, Không tán thành, Ý kiến khác) và tỷ lệ % realtime.
  - Tab 2 - Lịch sử biểu quyết: Lưu trữ các nghị quyết đã biểu quyết thành công.

### `[NODE-APP-010]` Bảng Tin Mạng Lưới, 5 Comment Mở Sẵn & Link Preview Facebook
- **Route Frontend**: `/association/messages` (`src/routes/association.messages.tsx`).
- **Thành phần**: `FeedView.tsx`, `PostItem.tsx`, `CommentSection.tsx`.
- **API Backend**: `GET /association/feed`, `POST /association/feed/posts`, `POST /association/feed/comments` (`feed.service.ts`).
- **Bảng CSDL**: `feed_posts`, `feed_comments`, `feed_likes`.
- **Luồng xử lý**:
  - Mở sẵn 5 bình luận mới nhất dưới mỗi bài đăng kèm ô nhập bình luận trực tiếp giúp thảo luận tự nhiên, thuận tiện.
  - Tự động trích xuất metadata và hiển thị Thẻ xem trước liên kết (Link Preview Card) dạng Facebook chuẩn mực khi bài viết chia sẻ link bài báo hoặc mạng xã hội.
  - Tích hợp cuộc họp ban vào Bảng tin có nút đánh dấu cuộc họp vào hồ sơ cá nhân.

### `[NODE-APP-011]` Hồ Sơ Cá Nhân & Quản Trị RBAC Nhanh
- **Route Frontend**: `/association/profile` (`src/routes/association.profile.tsx`).
- **Thành phần**: `QuickProfileEditModal.tsx`.
- **API Backend**: `GET /association/profile`, `PUT /association/profile` (`members.service.ts`).
- **Bảng CSDL**: `members`, `vione_users`.
- **Luồng xử lý**:
  - Xem thông tin lãnh đạo, công ty, điều lệ và hợp đồng hội viên.
  - Nếu tài khoản có quyền Admin/BQT (`isAdmin`), hiển thị nút "Phân quyền Hội viên (BQT)" dẫn tới `/association/permissions`.

### `[NODE-APP-012]` Cài Đặt Hệ Thống, Trợ Lý AI & Đổi Mật Khẩu
- **Route Frontend**: `/association/settings` (`src/routes/association.settings.tsx`).
- **Thành phần**: `AccountSecuritySettingsForm.tsx`, `ContactSupportModal.tsx`, `UserGuideModal.tsx`.
- **API Backend**: `PUT /auth/change-password` (`auth.service.ts`).
- **Bảng CSDL**: `vione_users`.
- **Luồng xử lý**:
  - Duy trì 3 khối chức năng: Cài đặt hệ thống; Các trường liên hệ hỗ trợ 24/7; Bảo mật & Đổi mật khẩu bắt buộc.
  - Khi bấm X trên trợ lý AI: Tắt hoàn toàn AI (`ceo1983_ai_disabled_permanently = true`), triệt tiêu dock thu gọn.

### `[NODE-APP-013]` Kho Đặc Quyền Ưu Đãi QR Động & Bản Đồ Chỉ Đường
- **Route Frontend**: `/association/perks` (`src/routes/association.perks.tsx`).
- **API Backend**: `GET /association/perks` (`sponsors.service.ts`).
- **Bảng CSDL**: `sponsors_prizes`, `perks`.
- **Luồng xử lý**:
  - Danh sách thẻ ưu đãi độc quyền từ các doanh nghiệp thành viên.
  - Tích hợp Popup hiển thị Mã QR Động (`QrCanvas`) quét nhận ưu đãi tại điểm.
  - Tiện ích dẫn đường Google Maps trực tiếp, nút bấm gọi Hotline tổng đài và liên kết ghé thăm gian hàng B2B của đối tác.

### `[NODE-APP-014]` Cầu Nối Native Android / iOS & Push Service Worker
- **Mã nguồn**: `mobile_ceo1983/`, `apps/ceo1983_app_fe/public/sw.js`.
- **Công nghệ**: Capacitor Android Java wrapper, Web Push API, FCM.
- **Luồng xử lý**:
  - Trong `sw.js`: Bọc kiểm tra `Notification.permission === 'granted'` và `.catch(() => {})` để tránh uncaught promise rejection.
  - Cầu nối Capacitor WebView điều hướng trơn tru, hỗ trợ mở picker native của thiết bị.

### `[NODE-APP-015]` Phân Hệ Gặp Gỡ & Kết Nối B2B 1-on-1 Độc Lập
- **Route Frontend**: `/association/connect` (`src/routes/association.connect.tsx`).
- **API Backend**: `GET /b2b-connections/my`, `POST /b2b-connections`, `PUT /b2b-connections/:id/status`, `POST /b2b-connections/:id/deal` (`b2b-connections.service.ts`).
- **Bảng CSDL**: `b2b_connections`, `opportunities`, `members`.
- **Luồng xử lý**:
  - Quản lý tập trung 3 tab: Cuộc gặp đã xác nhận, Lời mời nhận, Lời mời gửi.
  - Modal đặt lịch hẹn gặp 1-on-1 với đối tác thành viên trong CLB (Gặp trực tiếp hoặc Gặp trực tuyến).
  - Tích hợp phòng họp video trực tuyến bảo mật Jitsi Meet trực tiếp trong ứng dụng.
  - Modal ghi nhận Deal thành công sau cuộc gặp, tích lũy doanh số giao thương vào báo cáo chung của CLB.

### `[NODE-APP-016]` Phân Hệ Đào Tạo Doanh Nhân & Phòng Họp Trực Tuyến
- **Route Frontend**: `/association/training` (`src/routes/association.training.tsx`).
- **API Backend**: `GET /trainings`, `POST /trainings/:id/register` (`trainings.service.ts`).
- **Bảng CSDL**: `trainings`, `training_attendees`.
- **Luồng xử lý**:
  - Hiển thị danh sách các chuyên đề đào tạo quản trị điều hành, nâng cao năng lực lãnh đạo doanh nghiệp.
  - Hiển thị thông tin giảng viên/chuyên gia, học hàm học vị, ngày giờ phát sóng và kho giáo trình bài giảng đính kèm (Slide PDF, file tính toán Excel).
  - Nút "Vào Phòng Họp Video" tích hợp phòng họp Jitsi Meet trực tiếp trong ứng dụng, có camera, micro, chat và cơ chế tự động điểm danh tham dự.

