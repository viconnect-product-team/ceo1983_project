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
  - **Màu sắc thương hiệu & Bộ Theme Đa Dạng**: 
    + *Cam Tiên Phong (Pioneer Orange)*: Tone màu vàng cam hiện đại từ bản thiết kế Figma (`#EA580C`, `#F97316`).
    + *Xanh Doanh Nhân (Classic Navy)*: Tone màu xanh Navy truyền thống của Hiệp hội (`#1F3864`, `#003B95`).
    + *Đỏ Nhiệt Huyết (Crimson Red)*: Tone màu đỏ nhiệt huyết doanh nhân (`#DC2626`).
    + *Vàng Hoàng Gia Amber Gold* (`#B8860B`), *Xanh Ngọc Emerald* (`#059669`).
  - **Quy Chuẩn Đồng Bộ Theme Toàn Bộ Màn Hình (Theme System Sync)**:
    + Khi người dùng lựa chọn chuyển đổi theme màu, hệ thống tự động đổi màu đồng bộ trên toàn bộ các màn hình của App (Trang chủ, Mạng lưới Feed, Thống kê biểu đồ, Danh bạ, Sự kiện, B2B Opportunities, Tin nhắn).
    + **Bộ Icon Chuẩn**: Toàn bộ icon SVG / Lucide giữ nguyên 100% hình thái thiết kế chuẩn mực như bộ Cam Tiên Phong, chỉ tự động đổi màu sắc `stroke` và `fill` tương thích với theme màu được lựa chọn.
  - **QUY CHUẨN NÚT BẤM (STRICT NO RED BUTTONS)**: Tuyệt đối không dùng nút bấm màu đỏ trên toàn bộ hệ thống. Nút chính dùng Navy hoặc Emerald, nút điểm nhấn/kêu gọi hành động dùng Amber Gold, nút đóng/hủy dùng Slate.

---

## 2. ĐẶC TẢ CHI TIẾT THEO TỪNG NODE CHỨC NĂNG

### `[NODE-APP-001]` Trang Chủ Hội Viên, thẻ hội viên điện tử Đồng Bộ & Giao Diện Figma Theme Cam Tiên Phong
- **Route Frontend**: `/association` (`src/routes/association.index.tsx`).
- **Thành phần**: `CustomHomeShortcutsModal.tsx`, `WelcomeMemberModal.tsx`, `SeasonalEventHeader.tsx`, `OpportunityCandleWidget.tsx`.
- **API Backend**: `GET /association/home-feed`, `GET /association/home-stats`, `PATCH /members/me` (`feed.service.ts`, `opportunity.service.ts`, `members.service.ts`).
- **Bảng CSDL**: `feed_posts`, `events`, `opportunities`, `products`, `members`.
- **Luồng xử lý & Thiết kế Chuẩn Figma**:
  - **Giao Diện Chuẩn Figma Tone Cam Tiên Phong**: Toàn bộ thẻ Doanh Nhân Hero Card, khối Tính Năng Nhanh, Banner Sự Kiện, Tin Tức CLB và Quét Mã Check-in QR áp dụng chuẩn tone màu cam (`#EA580C`, `#F97316`, `orange-500`, `orange-600`) kết hợp dải gradient chuyển màu dịu mắt và bóng đổ cam nhẹ.
  - **Hệ Thống Icon SVG Độc Quyền Cục Bộ**: Tích hợp trực tiếp bộ SVG từ `/icons/home/` gồm chuông thông báo (`notification-01.svg`), khiên xác thực doanh nhân (`security-check.svg`), nút chỉnh sửa (`edit-04.svg`), hotline (`call-02.svg`), 4 phím tắt nhanh (Tin nhắn `bubble-chat.svg`, Danh bạ CEO `contact-book.svg`, Báo cáo `chart-breakout-circle.svg`, Giao thương B2B `briefcase-04.svg`) và đồng hồ đếm ngược sự kiện (`Clock.svg`).
  - **Nút Chỉnh Sửa Trên Thẻ Hội Viên Tối Giản**: Nút chỉnh sửa thông tin trên Thẻ Hội Viên chỉ hiển thị biểu tượng icon bút chì bo viền (`edit-04.svg`), loại bỏ hoàn toàn chữ text để tối ưu không gian thẻ doanh nhân số sang trọng.
  - **Cơ Chế Đồng Bộ Avatar & Ảnh Bìa Realtime**: Khi thay đổi Avatar hoặc Ảnh bìa tại màn Cá nhân (`/association/profile`), hệ thống cập nhật đồng thời lên CSDL qua `PATCH /members/me` và phát sự kiện `profile-updated` / `vba_member_avatar_updated`. Trang chủ lập tức lắng nghe và phản ánh Avatar cùng Ảnh bìa mới nhất trên Thẻ Hội Viên mà không cần tải lại toàn bộ trang.
  - Dải Cơ Hội Kinh Doanh Kéo Full-Width: Tích hợp widget Biểu đồ nến Candlestick thời gian thực biểu thị biến động giao thương theo từng khung giờ trong ngày (Open, High, Low, Close, Volume).
  - Khối Sàn Giao Thương B2B được đẩy xuống ngay bên dưới dạng thẻ full-width card dễ quan sát.
  - Tải số liệu thống kê thật 100% từ CSDL (tổng số deal, tổng giá trị, sản phẩm). Tuyệt đối không dùng số fallback giả.
  - Modal tùy biến phím tắt (`CustomHomeShortcutsModal.tsx`) chuẩn hóa lối tắt **"Tin nhắn"** (`/association/messages?tab=messages`).

### `[NODE-APP-002]` thẻ hội viên điện tử Số & QR Cá Nhân
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

### `[NODE-APP-004]` Danh Bạ Hội Viên, Danh Thiếp Đã Quét & Cổng Quét QR Phân Luồng
- **Route Frontend**: `/association/members` (`src/routes/association.members.tsx`).
- **Thành phần**: `CeoInteractiveMapModal.tsx`, `BusinessConnectBottomSheet.tsx`, `MemberCardGrid.tsx`, `AssociationQrScanModal.tsx`.
- **API Backend**: `GET /association/members`, `GET /members/locations`, `PUT /members/my-location` (`members.service.ts`).
- **Bảng CSDL**: `members`, `companies`, `b2b_connections`, `scanned_business_cards`.
- **Luồng xử lý**:
  - **Loại Bỏ Nút "Thêm CEO"**: Bỏ hoàn toàn nút "Thêm CEO" trên thanh tiêu đề/danh bạ để đảm bảo tính xác thực hội viên chính thức do BQT phê duyệt.
  - **Bổ Sung Danh Mục "Danh Thiếp Đã Quét"**: Thêm tab/mục riêng biệt hiển thị danh bạ các danh thiếp đối tác CEO 1983 đã quét kèm thời gian, ghi chú kết nối và liên kết trao đổi nhanh.
  - **Phân Luồng Thẻ Quét QR Thông Minh**: Khi quét mã QR từ danh thiếp/thẻ của đối tác:
    + *Nếu là Thẻ hội viên CEO 1983*: Tự động định danh, xem hồ sơ VIP và lưu ngay vào mục "Danh thiếp đã quét".
    + *Nếu KHÔNG PHẢI thẻ CEO 1983* (danh thiếp giấy, vCard bên ngoài, mã QR Zalo): Hiển thị thông báo minh bạch: *"Không thể lưu vào danh mục Danh thiếp đã quét của CEO 1983. Chỉ lưu vào danh bạ thiết bị và kết nối qua Zalo"*, đồng thời cung cấp nút tải vCard về danh bạ máy và mở đường dẫn `https://zalo.me/[phone]`.
  - **Bản Đồ 2D Google Maps (`CeoInteractiveMapModal.tsx`)**: Ứng dụng lớp bản đồ 2D Google Maps (`mt0-mt3.google.com/vt/lyrs=m`), khắc phục triệt để lỗi màn hình đen.
  - Hỗ trợ chuyển đổi mượt mà giữa Chế độ Danh Sách và Bản Đồ.

### `[NODE-APP-005]` Cơ Hội Giao Thương B2B, Biểu Đồ 3 Chỉ Số Biến Động, Bộ Lọc Trạng Thái & Ban Bệ
- **Route Frontend**: `/association/opportunities` (`src/routes/association.opportunities.tsx`).
- **Thành phần**: `OpportunityCard.tsx`, `OpportunityFilterTabs.tsx`, `OpportunityDetailModal.tsx`, `OpportunityCreateModal.tsx`, `OpportunityMultiMetricChart.tsx`.
- **API Backend**: `GET /association/opportunities`, `POST /association/opportunities`, `GET /members/by-department` (`opportunity.service.ts`, `members.service.ts`).
- **Bảng CSDL**: `opportunities`, `opportunity_deals`, `members`.
- **Luồng xử lý**:
  - **Loại Bỏ Bộ Lọc Cũ "Bên Mua - Bên Bán"**: Xóa bỏ hoàn toàn khái niệm phân chia mua/bán gây chia tách luồng giao thương.
  - **Tích Hợp API Người Đã Kết Nối Khi Đăng & Sửa Cơ Hội (Referrer Connection API)**:
    + Tại Modal Đăng mới (`OpportunityCreateModal`) và Chỉnh sửa (`OpportunityEditModal`), mục "Người giới thiệu" tự động gọi API `GET /network/connections` để nạp danh sách các hội viên đã kết nối chính thức trong mạng lưới của tài khoản.
    + Cung cấp bộ chọn tương tác trực quan (Connected Members Picker): tìm kiếm nhanh theo tên/công ty, hiển thị avatar, tên, đơn vị công tác và huy hiệu `✓ Hội viên đã kết nối`.
    + Cho phép chọn nhanh chỉ với 1 chạm hoặc chuyển đổi sang chế độ nhập thủ công linh hoạt.
  - **4 Trạng Thái Cơ Hội Của Tôi Chuẩn Hóa**: Thay thế bằng hệ thống danh mục trực diện:
    1. *Cơ hội của tôi*: Toàn bộ cơ hội do chính tôi khởi tạo.
    2. *Cơ hội tôi đã chốt được*: Các thương vụ đã ký kết hợp đồng, ghi nhận doanh số thành công.
    3. *Cơ hội đang deal*: Các cơ hội đang trong quá trình thương thảo, gửi báo giá, xem xét điều khoản.
    4. *Cơ hội đã đóng của tôi*: Các cơ hội đã kết thúc giao dịch hoặc chủ động đóng.
  - **Danh Mục "Ai Đang Quan Tâm Deal Cơ Hội Của Tôi" & Bộ Lọc Tối Ưu Lợi Nhuận**:
    + Liệt kê cụ thể danh sách đối tác đang phản hồi, gửi đề xuất đàm phán trên các cơ hội của tôi.
    + Tích hợp bộ lọc sắp xếp ưu tiên thông minh theo **"% có lợi nhất cho tôi"** (tỷ lệ chiết khấu/hoa hồng hấp dẫn nhất, biên lợi nhuận cao nhất hoặc giá trị deal lớn nhất).
  - **Biểu Đồ 3 Chỉ Số Biến Động Đa Khung Thời Gian (Ngay Trên Thanh Tìm Kiếm & Chi Tiết Cơ Hội)**:
    + Tích hợp biểu đồ trực quan thể hiện đồng thời 3 chỉ số cốt lõi:
      1. Khối lượng giao dịch (Deal Volume / Số lượng cơ hội phát sinh).
      2. Giá trị giao thương (Deal Value / Tổng doanh số VNĐ).
      3. Tỷ lệ đàm phán thành công & Biến động % tăng trưởng.
    + Hỗ trợ chuyển đổi linh hoạt theo các khung thời gian: **Từng phút (1m/15m), Giờ (1h), Ngày (1D), Tuần (1W), Tháng (1M), Quý (3M), Năm (1Y)**.
  - **Đăng Cơ Hội - Lựa Chọn Ban Bệ & Thành Viên Thực Tế**:
    + Khi chọn đăng cơ hội "Theo từng ban": Gọi API trực tiếp (`/members/by-department` hoặc query thành viên) để hiển thị danh sách hội viên thực tế trong ban kèm ô checkbox.
    + Tích chọn hội viên nào thì cơ hội sẽ được phân quyền hiển thị đích danh cho người đó.
    + Bỏ phạm vi "người muốn hiện" phức tạp; đơn giản hóa thành phạm vi "Bạn bè": Chọn tất cả bạn bè hoặc tích chọn từng người cụ thể.
    + Bổ sung 2 trường thông tin tùy chọn (không bắt buộc / not required):
      1. *Người giới thiệu*: Tên/ID người kết nối trung gian.
      2. *Chia sẻ % hoa hồng*: Tỷ lệ hoa hồng kết nối (% chia sẻ giao thương).
  - **Thống Kê Cơ Hội Chuyên Sâu Ngay Tại Màn Cơ Hội**:
    + Toàn bộ phân tích chi tiết, tỷ lệ chốt deal, phân bổ theo ngành nghề của cơ hội được bố trí ở tab **"Thống kê"** chuyên biệt ngay trong màn Chia Sẻ Cơ Hội.

### `[NODE-APP-006]` Trung Tâm Thống Kê Tổng Thể, 4 Trường Chú Thích & Xuất Báo Cáo Kiểm Toán
- **Route Frontend**: `/association/analytics` (`src/routes/association.analytics.tsx`).
- **Thành phần**: `AssociationAnalyticsScreen`, Recharts `ComposedChart`, `AuditExportReportModal.tsx`.
- **API Backend**: `GET /analytics/overview`, `POST /analytics/export-log` (`analytics.service.ts`, `opportunity.service.ts`).
- **Bảng CSDL**: `opportunities`, `members`, `feed_posts`, `events`.
- **Luồng xử lý**:
  - **Loại Bỏ Hoàn Toàn Các Ô Vuông KPI Rời Rạc**: Thay thế khối card vuông tĩnh bằng biểu đồ trung tâm tinh tế, tập trung toàn diện vào luồng dữ liệu thời gian thực.
  - **Hiển Thị Tóm Lược Cơ Hội Chung**: Đối với phân hệ cơ hội, màn thống kê chỉ hiển thị 3 chỉ số khái quát: Tổng cơ hội phát sinh, Tổng giá trị giao thương (VNĐ), và Số lượng cơ hội đã hoàn tất (chi tiết chuyên sâu đã chuyển sang `[NODE-APP-005]`).
  - **4 Trường Chú Thích Minh Bạch Dưới Biểu Đồ**: Bố trí 4 khối chú thích phân định rõ nét:
    1. *Cột Navy (`#1F3864`)*: Biểu thị Giá trị giao dịch thực tế (VNĐ).
    2. *Đường Trend Emerald (`#059669`)*: Biểu thị Tỷ lệ hoàn thành mục tiêu giao thương.
    3. *Điểm Amber Gold (`#F59E0B`)*: Điểm kết nối B2B & tương tác tích cực.
    4. *Avatar Đỉnh Top 1*: Doanh nhân xuất sắc dẫn đầu kỳ thống kê.
  - **Loại Bỏ Nút "Xuất Excel" Ở Header**: Thanh tiêu đề được tinh giản tối đa, không chứa nút xuất dữ liệu gây rối mắt.
  - **Xuất Báo Cáo Tại Footer Có Bằng Chứng Kiểm Toán**:
    + Nút xuất báo cáo bố trí chuyên nghiệp tại Footer.
    + Khi bấm, hiển thị Modal xác nhận danh tính người xuất làm bằng chứng kiểm toán minh bạch: Họ tên người xuất, Mã hội viên, Ban công tác (hoặc vai trò Hội viên chính thức), Dấu thời gian xuất chính xác (Timestamp).
    + Cho phép chọn định dạng xuất: Bảng tính Excel (`.xlsx`), Báo cáo PDF khổ A4 tiêu chuẩn, hoặc Bản chứng nhận hình ảnh (`.png`).
  - **TUYỆT ĐỐI 100% DỮ LIỆU THẬT**: Khai thác trực tiếp từ cơ sở dữ liệu hệ thống. Nghiêm cấm hoàn toàn hành vi tạo dữ liệu giả lập (mock data), số % tăng trưởng ảo.

### `[NODE-APP-007]` Sàn Giao Thương B2B & Icon "Gian Hàng Của Tôi" Tinh Gọn
- **Route Frontend**: `/association/products` (`src/routes/association.products.tsx`).
- **Thành phần**: `ProductPostModal.tsx`, `ObsidianSponsorCarousel.tsx`, `MyStoreDrawer.tsx`.
- **API Backend**: `GET /association/products`, `POST /association/products`, `GET /products/my-store` (`marketplace.service.ts`).
- **Bảng CSDL**: `products`, `members`, `companies`.
- **Luồng xử lý**:
  - **Loại Bỏ Tab Phân Đoạn Cồng Kềnh**: Gỡ bỏ thanh tab chuyển đổi "Chợ B2B / Gian hàng của tôi" nằm ngang màn hình.
  - **Icon "Gian Hàng Của Tôi" Góc Phải Header**: Thay thế bằng 1 biểu tượng icon cửa hàng (`Store` hoặc `Package`) sang trọng đặt tại góc trên bên phải thanh Header.
  - **Ràng Buộc Phạm Vi Hiển Thị**: Icon này **CHỈ ĐƯỢC PHÉP HIỆN DIỆN DUY NHẤT** khi người dùng đang ở trong phân hệ Sàn thương mại B2B (`/association/products`), không xuất hiện ở các màn hình khác.
  - Khi chạm vào Icon: Mở nhanh trang quản trị/xem danh mục "Gian hàng của tôi" của hội viên, cho phép quản lý tối đa 5 sản phẩm tiêu biểu, chỉnh sửa thông tin hoặc đăng sản phẩm mới.

### `[NODE-APP-008]` Lịch Trình Sự Kiện & Hoạt Động Điều Hành CEO 1983 Chuẩn Giao Diện Figma
- **Route Frontend**: `/association/events` (`src/routes/association.events.tsx`).
- **Thành phần**: `FeaturedUpcomingEventHero`, `EventCardItem`, `ActivityMeetingCardItem`, `EventDetailModal.tsx`, `EventRegistrationModal.tsx`, `EventTicketPassModal.tsx`, `EventsErrorBoundary.tsx`.
- **API Backend**: `GET /association/events`, `POST /association/events/:id/register`, `GET /meetings` (`events.service.ts`, `meetings.service.ts`).
- **Bảng CSDL**: `events`, `meetings`, `event_registrations`, `event_tickets`.
- **Luồng xử lý & Thiết kế Chuẩn Figma**:
  - **Khung Tiêu Đề Header**: Nút quay lại bo góc vuông bo mềm (`arrow-left-02.svg`), tiêu đề "Sự kiện", nút lịch công tác (`calendar-02.svg`).
  - **Hệ Thống 2 Tab Độc Lập**:
    - *Tab 1: Sự kiện*:
      + **Khối "Sự kiện sắp tới" Hero Card**: Tự động xoay vòng carousel với ảnh bìa bo góc 16px, phủ gradient đen mờ, huy hiệu ngày diễn ra (`12/11/2026`) kèm icon lịch, huy hiệu ngành "Giao thương B2B", tiêu đề sự kiện chữ trắng nổi bật, địa điểm hội trường kèm icon vị trí, nút "Xem ngay" phong cách viền phẳng kèm icon mũi tên, và cụm 4 chấm chỉ số trang (pagination dots).
      + **Khối "Tất cả sự kiện" & Bộ Lọc Nhanh**: Cụm pill bộ lọc với số đếm badge ("Sắp diễn ra", "Đã đăng ký", "Miễn phí", "Có phí").
      + **Danh Sách Thẻ Sự Kiện Dọc (Event Cards)**: Ảnh thumbnail vuông/chữ nhật bên trái (w-24), cột thông tin bên phải (danh mục + nút 3 chấm `more-vertical.svg`, tiêu đề in đậm, hàng ngày giờ kèm icon đồng hồ báo thức `alarm-clock.svg`, địa điểm hội trường), thanh đáy chứa badge trạng thái vé ("Còn vé" / "Miễn phí") và nút "Đăng ký ngay" màu Navy sang trọng.
      + **Nút "Xem tất cả ({tổng số})"**: Nút chuyển tiếp kèm icon `arrow-right-02.svg`.
      + **Khối "Xem gần đây"**: Hiển thị dạng lưới 2 cột nhỏ gọn kèm cụm chấm chỉ số trang.
      + **Banner Chân Trang CLB**: "CLB Doanh Nhân CEO 1983 - Kết Nối Thịnh Vượng", nút liên hệ Ban Truyền Thông.
    - *Tab 2: Hoạt động (Cuộc họp & Hội nghị Điều hành)*:
      + **Tiêu Đề Khối**: "Hoạt động & Cuộc họp" - "Điều Hành Trực Tuyến & Trực Tiếp".
      + **Bộ Lọc Phân Loại**: "Tất cả", "Họp cố định theo ban", "Họp bất thường/ Đột xuất".
      + **Danh Sách Thẻ Cuộc Họp Trục Thời Gian (Timeline Cards)**: Cột mốc thời gian bên trái (giờ bắt đầu, thanh dọc kết nối, giờ kết thúc), Thẻ nội dung bên phải (huy hiệu hình thái "Trực tiếp" / "Trực tuyến" kèm icon globe/home, phân loại cuộc họp, tiêu đề cuộc họp in đậm, địa điểm/link phòng họp, nút xác nhận tham dự).
      + **Ghi Chú Triệu Tập**: "Triệu tập bởi Chủ tịch CLB · Thành phần: Hội viên được triệu tập".
  - **Hệ Thống Icon SVG Độc Quyền Cục Bộ**:
    - Bộ Sự kiện (`/icons/events/`): `alarm-clock.svg`, `arrow-left-02.svg`, `arrow-right-02.svg`, `calendar-02.svg`, `calendar-03.svg`, `dot-separator.svg`, `location-01.svg`, `more-vertical.svg`.
    - Bộ Hoạt động (`/icons/activities/`): `arrow-left-02.svg`, `calendar-02.svg`, `globe-02.svg`, `home-04.svg`, `pie-chart.svg`, `qr-code-02.svg`, `user-circle-02.svg`.
  - **Dữ Liệu Fallback Tự Nhiên**: Luôn hiển thị dữ liệu mẫu sự kiện và cuộc họp chuẩn mực khi CSDL vừa được làm sạch, đảm bảo trải nghiệm người dùng không bị gián đoạn hay trống trải.

### `[NODE-APP-009]` Biểu Quyết Trực Tuyến Gắn Với Sự Kiện/Họp
- **Route Frontend**: `/association/voting` (`src/routes/association.voting.tsx`).
- **API Backend**: `GET /association/polls`, `POST /association/polls/:id/vote` (`voting.service.ts`).
- **Bảng CSDL**: `polls`, `poll_options`, `poll_votes`.
- **Luồng xử lý**:
  - Tab 1 - Biểu quyết đang diễn ra: Các phiên gắn với sự kiện/cuộc họp đang mở, hiển thị các lựa chọn (Tán thành, Không tán thành, Ý kiến khác) và tỷ lệ % realtime.
  - Tab 2 - Lịch sử biểu quyết: Lưu trữ các nghị quyết đã biểu quyết thành công.

### `[NODE-APP-010]` Bảng Tin Mạng Lưới Feed, Bình Luận Đa Phương Tiện & Bộ Emoji Đầy Đủ
- **Route Frontend**: `/association/messages` (`src/routes/association.messages.tsx`).
- **Thành phần**: `FeedView.tsx`, `PostItem.tsx`, `CommentSection.tsx`, `CommentMediaPicker.tsx`, `EmojiPickerModal.tsx`.
- **API Backend**: `GET /association/feed`, `POST /association/feed/posts`, `POST /association/feed/comments` (`feed.service.ts`).
- **Bảng CSDL**: `feed_posts`, `feed_comments`, `feed_likes`.
- **Luồng xử lý**:
  - **Tên Thật & Avatar Thật 100%**: Người đăng bài và người bình luận bắt buộc phải hiển thị tên thật cùng avatar thật từ tài khoản hội viên. Loại bỏ hoàn toàn bình luận mẫu/mock data khi bài viết chưa có bình luận.
  - **Đính Kèm Đa Phương Tiện Trong Bình Luận**: Cho phép đính kèm hình ảnh (`image/*`), video clip ngắn (`video/*`), và hình động GIF sinh động.
  - **Bộ Cảm Xúc / Emotion Picker Toàn Diện**: Tích hợp picker cảm xúc chuyên nghiệp với đầy đủ danh mục biểu tượng cảm xúc (Mặt cười, cử chỉ ngón tay, chúc mừng hợp tác, bắt tay doanh nhân, kinh doanh thịnh vượng).
  - Gắn thẻ đại biểu tham dự cuộc họp/sự kiện: Hiển thị danh sách hội viên tham dự dưới dạng thẻ `@HọTên [✓ Đã Check-in]`.
  - Tiếp nhận sự kiện & đào tạo bắn từ CRM kèm Mã QR Điểm Danh (Check-in QR).

### `[NODE-APP-011]` Hồ Sơ Cá Nhân & Quản Trị Nhận Diện Thương Hiệu Chuẩn Figma Tone Cam
- **Route Frontend**: `/association/profile` (`src/routes/association.profile.tsx`).
- **Thành phần**: `QuickProfileEditModal.tsx`.
- **API Backend**: `GET /association/profile`, `PATCH /members/me`, `PATCH /members/me/cover` (`members.service.ts`).
- **Bảng CSDL**: `members`, `vione_users`.
- **Luồng xử lý & Thiết kế Chuẩn Figma**:
  - **Giao Diện Chuẩn Figma Tone Cam Tiên Phong**: Toàn bộ trang hồ sơ cá nhân đồng bộ dải màu cam ấm áp (`#EA580C`, `#F97316`, `orange-500`, `orange-600`), bao gồm thẻ Hero Card, cụm tab phân đoạn "Tổng quan bài viết" vs "Giao thương & Sự kiện", các sub-pills lựa chọn, khối địa chỉ bản đồ và thẻ thông tin doanh nghiệp.
  - **Hệ Thống Icon SVG Độc Quyền Cục Bộ**: Tích hợp trực tiếp bộ SVG từ `/icons/profile/` gồm nút quay lại (`arrow-left-02.svg`), cài đặt tài khoản (`setting-07.svg`), sửa ảnh bìa (`edit-04.svg`), đổi avatar (`user-edit-01.svg`), xác minh chính danh (`check-verified-02.svg`), chức danh (`briefcase-04.svg`), 3 nút hành động chính (Danh thiếp `student-card.svg`, Chia sẻ `share-01.svg`, Sửa hồ sơ `user-edit-01.svg`), icon khối hồ sơ (`profile-02.svg`), định vị bản đồ (`navigation-05.svg`), tìm kiếm (`search-01.svg`).
  - **Bản Đồ Doanh Nghiệp 2D Tương Tác**: Nhúng iframe Google Maps với marker đỏ cam chính tâm (`bg-orange-100` với pin `bg-orange-600`), nút "Chỉ đường" và "Mở bản đồ lớn" tone cam.
  - Tải lên và cập nhật Avatar cùng Ảnh bìa: Lập tức gọi API lưu CSDL máy chủ, lưu bộ nhớ cục bộ đồng bộ và phát tín hiệu broadcast để Thẻ Hội Viên tại Trang Chủ và Trang Thẻ cập nhật ngay lập tức.
  - Thẻ trạng thái đồng bộ Theme CRM thời gian thực: Hiển thị thẻ viền vàng thông báo tên chủ đề lễ hội đang kích hoạt.
  - Xem thông tin lãnh đạo, công ty, điều lệ và hợp đồng hội viên.

---

## 3. QUY CHUẨN Ô NHẬP LIỆU (UNIVERSAL INPUT) & NGẮT DÒNG TỰ ĐỘNG TOÀN ỨNG DỤNG
- **Nút Xóa Nhanh `allowClear` Bắt Buộc**: Tất cả các ô nhập liệu tìm kiếm (Search inputs) và ô nhập bình luận (Comment inputs) trên toàn app đều phải có nút xóa nhanh (biểu tượng `X` hoặc `XCircle`) xuất hiện khi có nội dung để người dùng xóa tức thì chỉ bằng một chạm.
- **Tự Động Xuống Dòng & Chống Cắt Cụt Ellipsis (`...`)**:
  - Nghiêm cấm sử dụng các class gây cắt cụt nội dung như `truncate` hoặc `whitespace-nowrap` trên các đoạn văn bản mô tả, tên công ty chi tiết, nội dung cơ hội hay nội dung bình luận.
  - Bắt buộc sử dụng `whitespace-normal break-words overflow-visible` để văn bản dài tự động căn chỉnh và đẩy xuống dòng mượt mà, đảm bảo hiển thị trọn vẹn thông điệp của doanh nhân.

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

### `[NODE-APP-015]` Phân Hệ Gặp Gỡ & Kết Nối B2B 1-on-1 Độc Lập & Điều Hướng Deal Đích Danh
- **Route Frontend**: `/association/connect` (`src/routes/association.connect.tsx`).
- **API Backend**: `GET /meetings/connection-appointments`, `POST /meetings`, `PATCH /meetings/:id`, `POST /meetings/:id/cancel` (`meetings.controller.ts`, `meetings.service.ts`).
- **Bảng CSDL**: `meetings`, `opportunities`, `members`.
- **Luồng xử lý**:
  - Quản lý tập trung đúng **3 tab chuẩn hóa**:
    1. *Cuộc gặp của tôi*: Danh sách cuộc gặp đã xác nhận hoặc lời mời nhận (lọc sạch các cuộc gặp đã bị hủy/từ chối để đối tác không thấy lời mời đã hủy).
    2. *Cuộc gặp đã gửi*: Danh sách cuộc gặp do mình khởi tạo; các cuộc gặp đang chờ phản hồi có nút "Hủy cuộc gặp" trực quan.
    3. *Cuộc gặp đã hủy*: Quản lý danh mục các cuộc gặp đã bị hủy hoặc từ chối kèm nhãn cảnh báo đỏ.
  - Modal đặt lịch hẹn gặp 1-on-1 với đối tác thành viên trong CLB (Gặp trực tiếp hoặc Gặp trực tuyến có phòng Jitsi Meet).
  - Modal ghi nhận Deal thành công sau cuộc gặp, tích lũy doanh số giao thương vào báo cáo chung của CLB.
  - Gửi Deal Chào Giá Đích Danh: Bấm deal tại Chia sẻ cơ hội (`/association/opportunities`) hoặc Sàn thương mại (`/association/products`) sẽ gửi thông báo và dữ liệu trực tiếp đến đúng người đăng bài.
  - Loại bỏ hoàn toàn tab "Lịch hẹn" ở Danh bạ hội viên (`/association/members`), chuyển hướng toàn bộ về `/association/connect`.

### `[NODE-APP-017]` Màn Hình Cá Nhân (Profile), Quyền Riêng Tư Mạng Lưới Facebook Style & Quản Lý Bài Viết
- **Route Frontend**: `/association/profile` (`src/routes/association.profile.tsx`).
- **Thành phần**: `CreatePostModal.tsx`, `CustomHomeShortcutsModal.tsx`, `CardPreviewModal.tsx`.
- **API Backend**: `GET /feed?authorId=...`, `PATCH /feed/:id`, `DELETE /feed/:id`, `PATCH /members/me` (`feed.service.ts`, `feed.controller.ts`).
- **Bảng CSDL**: `members`, `feed_posts`, `users`.
- **Luồng xử lý**:
  - **Tái cấu trúc 2 nhóm tab chính**:
    + *Nhóm 1 (Tổng quan & Bài viết)*: 4 chỉ số KPI tổng thể, Panel "Hồ sơ doanh nghiệp" đóng mở accordion (gộp Giới thiệu doanh nghiệp, nhân lực, quy mô, lĩnh vực), và phần Bài viết mạng lưới đã đăng.
    + *Nhóm 2 (Giao thương & Sự kiện)*: Lịch sử hoạt động xúc tiến, kết nối B2B và sự kiện tham dự.
  - **Hàng nút tiện ích dưới Avatar**: 4 nút chuẩn: 1. Danh thiếp, 2. Chia sẻ, 3. Sửa hồ sơ, 4. Cài đặt (Icon Cog mở Cài đặt & Cấu hình hệ thống). Bỏ quét mã QR tại vị trí này.
  - **Quản lý bài viết mạng lưới**: Mỗi bài viết do hội viên đăng tải có menu `...` hỗ trợ Chỉnh sửa và Xóa bài viết (phân quyền tác giả hoặc Admin).
  - **Quyền riêng tư chuẩn Facebook**: Hỗ trợ 3 phạm vi: Công khai (🌐), Bạn bè kết nối (👥), Chỉ mình tôi (🔒) lưu trực tiếp vào cột `privacy` của CSDL.
  - **Tùy biến 4 tính năng nhanh trang chủ**: Bổ sung bộ điều khiển chọn 4 shortcut ghim trang chủ ngay trong modal "Xem tất cả tính năng" (`AllFeaturesModal.tsx`).

### `[NODE-APP-016]` Phân Hệ Đào Tạo Doanh Nhân & Phòng Họp Trực Tuyến
- **Route Frontend**: `/association/training` (`src/routes/association.training.tsx`).
- **API Backend**: `GET /trainings`, `POST /trainings/:id/register` (`trainings.service.ts`).
- **Bảng CSDL**: `trainings`, `training_attendees`.
- **Luồng xử lý**:
  - Hiển thị danh sách các chuyên đề đào tạo quản trị điều hành, nâng cao năng lực lãnh đạo doanh nghiệp.
  - Hiển thị thông tin giảng viên/chuyên gia, học hàm học vị, ngày giờ phát sóng và kho giáo trình bài giảng đính kèm (Slide PDF, file tính toán Excel).
  - Nút "Vào Phòng Họp Video" tích hợp phòng họp Jitsi Meet trực tiếp trong ứng dụng, có camera, micro, chat và cơ chế tự động điểm danh tham dự.

### `[NODE-APP-018]` Chụp Ảnh Trực Tiếp & Tải Ảnh/Video Hoạt Động (Sự Kiện, Họp, Đào Tạo) Đẩy Lên Mạng Lưới
- **Thành phần**: `LiveActivityMediaSection.tsx`, `FeedView.tsx`.
- **Luồng xử lý**:
  - Tích hợp nút Chụp ảnh trực tiếp từ Camera (`capture="environment"`) và nút Tải ảnh/video từ thư viện.
  - Giới hạn tải lên tối đa 5 ảnh + 1 video / lượt.
  - Cho phép người có quyền tùy chọn đẩy nhanh khoảnh khắc hoạt động lên bảng tin Mạng Lưới (`/feed`) với danh mục `EVENT_MEETING`.
  - Trên bảng tin mạng lưới, các bài đăng sự kiện hiển thị nút link `<QrCode /> [Xem mã QR Check-in]` và nút `<Download /> [Tải poster sự kiện]` thay vì render canvas QR lớn chiếm màn hình.


