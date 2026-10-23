# MỤC 1: ĐẶC TẢ KỸ THUẬT & LUỒNG XỬ LÝ PHÂN HỆ MOBILE APP CEO 1983
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Phân hệ: Mobile Web App Hội viên (iOS / Android / PWA / Capacitor Native)*

---

## 1. TỔNG QUAN PHÂN HỆ MOBILE APP
- **Tên phân hệ**: Ứng dụng Di Động Hội Viên CLB Doanh Nhân CEO 1983 (`@ceo1983/app_fe`).
- **Đối tượng sử dụng**: Hội viên chính thức CLB CEO 1983 (Chủ tịch HĐQT, CEO, Tổng giám đốc, Nhà sáng lập) và các đối tác B2B.
- **Khung giao diện (Layout)**: `MemberShell.tsx` với **Bottom Navigation Bar** 5 mục chuẩn hóa:
  1. Trang chủ (`/association`)
  2. Thống kê (`/association/analytics`) - Biểu tượng `FooterAnalyticsIcon`
  3. Danh bạ (`/association/members`)
  4. Mạng lưới (`/association/messages`) - Biểu tượng mạng lưới cộng đồng `FooterSocialNetworkIcon`
  5. Cá nhân (`/association/profile`)
- **Hệ thống màu thương hiệu & Quy chuẩn nút bấm (Strict UI Rules)**:
  - **Màu sắc thương hiệu**: Deep Cobalt Navy (`#1F3864`), Vàng Hoàng Gia Amber Gold (`#B8860B`), Xanh Ngọc Emerald (`#059669`).
  - **QUY CHUẨN NÚT BẤM (STRICT NO RED BUTTONS)**: Tuyệt đối không dùng nút bấm màu đỏ trên toàn bộ hệ thống. Nút chính dùng Navy hoặc Emerald, nút điểm nhấn/kêu gọi hành động dùng Amber Gold, nút đóng/hủy dùng Slate.

---

## 2. ĐẶC TẢ CHI TIẾT THEO TỪNG NODE CHỨC NĂNG

### `[NODE-APP-001]` Trang Chủ Hội Viên, Lối Tắt Tin Nhắn, Welcome Modal & Theme Sync
- **Route Frontend**: `/association` (`src/routes/association.index.tsx`).
- **Thành phần**: `CustomHomeShortcutsModal.tsx`, `WelcomeMemberModal.tsx`, `SeasonalEventHeader.tsx`, `OpportunityCandleWidget.tsx`.
- **API Backend**: `GET /association/home-feed`, `GET /association/home-stats` (`feed.service.ts`, `opportunity.service.ts`).
- **Bảng CSDL**: `feed_posts`, `events`, `opportunities`, `products`.
- **Luồng xử lý**:
  - Dải Cơ Hội Kinh Doanh Kéo Full-Width: Tích hợp widget Biểu đồ nến Candlestick thời gian thực biểu thị biến động giao thương theo từng khung giờ trong ngày (Open, High, Low, Close, Volume).
  - Khối Sàn Giao Thương B2B được đẩy xuống ngay bên dưới dạng thẻ full-width card dễ quan sát.
  - Tải số liệu thống kê thật 100% từ CSDL (tổng số deal, tổng giá trị, sản phẩm). Tuyệt đối không dùng số fallback giả.
  - **Lối Tắt Nhanh Tiện Ích**: Modal tùy biến phím tắt (`CustomHomeShortcutsModal.tsx`) chuẩn hóa thay thế lối tắt Thống kê cũ bằng lối tắt **"Tin nhắn"** (`/association/messages?tab=messages`) giúp hội viên mở nhanh hộp thư đàm phán B2B.
  - **Cửa Sổ Chào Mừng Hội Viên (Onboarding Welcome Modal)**: Gắn trực tiếp tại `MemberShell.tsx`, tự động chào mừng khi mở app, hỗ trợ mượt mà cả chế độ Sáng (Light) và Tối (Dark).
  - **Đồng Bộ Hình Nền Chủ Đề Lễ Hội**: Tự động áp dụng lớp nền sự kiện rực rỡ từ biến CSS toàn cục `--festival-bg-image` do Theme Studio CRM phát hành.


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

### `[NODE-APP-004]` Danh Bạ Hội Viên & Bản Đồ Số 2D Google Maps Đa Phạm Vi
- **Route Frontend**: `/association/members` (`src/routes/association.members.tsx`).
- **Thành phần**: `CeoInteractiveMapModal.tsx`, `BusinessConnectBottomSheet.tsx`, `MemberCardGrid.tsx`.
- **API Backend**: `GET /association/members`, `GET /members/locations`, `PUT /members/my-location` (`members.service.ts`).
- **Bảng CSDL**: `members`, `companies`, `b2b_connections`.
- **Luồng xử lý**:
  - Hỗ trợ chuyển đổi nhanh giữa Chế độ Danh Sách và nút bấm "Bản Đồ" (Icon `MapPin` / `Compass`).
  - **Bản Đồ 2D Google Maps (`CeoInteractiveMapModal.tsx`)**: Ứng dụng lớp bản đồ 2D Google Maps (`mt0-mt3.google.com/vt/lyrs=m`), khắc phục triệt để lỗi màn hình đen.
  - **Phân tách 2 phạm vi hiển thị độc lập**:
    + *Phạm vi "Tổng thể"*: Toàn bộ hội viên trực tuyến/dùng app, sự kiện sắp tới, cuộc họp Ban.
    + *Phạm vi "Cá nhân"*: Hội viên đã kết nối giao thương với tôi, sự kiện tôi đã đăng ký, cuộc họp 1-on-1/Ban liên quan đến user ID.
  - Tích hợp công cụ định vị GPS thời gian thực và nút dẫn đường Google Maps trực tiếp.
  - Chạm Avatar mở Mini Card tóm tắt doanh nghiệp kèm nút Gọi điện thoại hoặc Đặt lịch hẹn 1-on-1.

### `[NODE-APP-005]` Cơ Hội Giao Thương B2B Strip 3 Thẻ Ngang
- **Route Frontend**: `/association/opportunities` (`src/routes/association.opportunities.tsx`).
- **Thành phần**: `OpportunityCard.tsx`, `OpportunityFilterTabs.tsx`.
- **API Backend**: `GET /association/opportunities`, `POST /association/opportunities` (`opportunity.service.ts`).
- **Bảng CSDL**: `opportunities`, `members`.
- **Luồng xử lý**:
  - Dải 3 thẻ thống kê ngang nhỏ gọn trên đầu: "Tổng chia sẻ", "Deal đã chốt", "Tôi share đi", kèm nút điều hướng nhanh sang Trung tâm Thống kê.
  - Bộ lọc 3 trạng thái rõ ràng: "Tất cả", "🛒 Bên mua (Cần mua / Tìm đối tác)", "📦 Bên bán (Cung cấp / Bán hàng)", kết hợp bộ lọc 10 ngành nghề trọng điểm.

### `[NODE-APP-006]` Trung Tâm Thống Kê 5 Phân Loại, Biểu Đồ Cột Đường Đỉnh Top Avatar & Bục Top 3 Một Hàng
- **Route Frontend**: `/association/analytics` (`src/routes/association.analytics.tsx`).
- **Thành phần**: `AssociationAnalyticsScreen`, Recharts `ComposedChart` (`Bar`, `Line`), Export Report Modal.
- **API Backend**: `GET /association/opportunities/report`, `GET /analytics/overview` (`opportunity.service.ts`, `analytics.service.ts`).
- **Bảng CSDL**: `opportunities`, `members`, `feed_posts`, `events`.
- **Luồng xử lý**:
  - **4 ô Thẻ KPI cốt lõi trên đầu**: Tổng cơ hội kết nối, Tổng chi tiêu/Doanh số giao dịch, Lượt tương tác app, Sự kiện & Hoạt động đang diễn ra. Bỏ toàn bộ chi tiết thừa phía trên biểu đồ.
  - **Biểu đồ biến động Composed Bar + Line**: Tông 3 màu xanh - trắng - đen; đường Line xanh lá (`#10B981`) thể hiện xu hướng tăng, đường đỏ (`#EF4444`) thể hiện xu hướng giảm.
  - **Avatar Ghim Đỉnh Cột / Đường**: Tại đỉnh cao nhất của cột số liệu hoặc mốc cuối của đường, ghim **Avatar tròn viền vàng** vinh danh Doanh nhân Top 1.
  - **Bục Vinh Danh Top 3 Nằm Chung 1 Hàng**: Top 1 ở giữa cao nhất (Vương miện vàng), Top 2 bên trái (Huy hiệu Bạc), Top 3 bên phải (Huy hiệu Đồng).
  - **5 Danh Mục Nghiệp Vụ Rõ Ràng**: 1. Cơ hội, 2. Chi tiêu giao dịch, 3. Tần suất tương tác app, 4. Sự kiện hoạt động, 5. Hội viên tích cực nhất (Bình luận + Đăng cơ hội).
  - **Xuất Báo Cáo Chuẩn Hóa**: In ấn khổ giấy A4 tiêu chuẩn (`window.print`) và Xuất file Excel `.xlsx`.

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

### `[NODE-APP-010]` Bảng Tin Mạng Lưới Feed B2B, Thẻ Attendee & Bắn Đào Tạo/Sự Kiện Từ CRM
- **Route Frontend**: `/association/messages` (`src/routes/association.messages.tsx`).
- **Thành phần**: `FeedView.tsx`, `PostItem.tsx`, `CommentSection.tsx`, `SeasonalEventHeader.tsx`.
- **API Backend**: `GET /association/feed`, `POST /association/feed/posts`, `POST /association/feed/comments` (`feed.service.ts`).
- **Bảng CSDL**: `feed_posts`, `feed_comments`, `feed_likes`.
- **Luồng xử lý**:
  - **Loại bỏ ô search trùng lặp trong Feed**: Đồng bộ thống nhất từ khóa tìm kiếm qua Header `searchQuery`.
  - **Gắn thẻ đại biểu tham dự cuộc họp/sự kiện**: Hiển thị danh sách hội viên tham dự dưới dạng thẻ `@HọTên [✓ Đã Check-in]`.
  - **Tiếp nhận sự kiện & đào tạo bắn từ CRM**: Hiển thị ảnh Poster sự kiện/đào tạo khổ lớn kèm **Mã QR Điểm Danh (Check-in QR)** và thông tin khung giờ để quét soát vé nhanh tại cổng.
  - Mở sẵn 5 bình luận mới nhất dưới mỗi bài đăng kèm ô nhập trực tiếp.
  - Thẻ xem trước liên kết (Link Preview Card) dạng Facebook chuẩn mực khi chia sẻ bài báo kinh tế hoặc link ngoài.

### `[NODE-APP-011]` Hồ Sơ Cá Nhân Tối Giản Header & Đồng Bộ Theme CRM
- **Route Frontend**: `/association/profile` (`src/routes/association.profile.tsx`).
- **Thành phần**: `QuickProfileEditModal.tsx`.
- **API Backend**: `GET /association/profile`, `PUT /association/profile` (`members.service.ts`).
- **Bảng CSDL**: `members`, `vione_users`.
- **Luồng xử lý**:
  - **Tối giản hóa Header**: Loại bỏ hoàn toàn các icon chức năng thừa ở góc phải Header (`right={null}`), giúp giao diện thanh thoát, sang trọng.
  - **Thẻ trạng thái đồng bộ Theme CRM thời gian thực**: Hiển thị thẻ viền vàng thông báo tên chủ đề lễ hội đang kích hoạt và trạng thái đồng bộ với Theme Studio CRM.
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

