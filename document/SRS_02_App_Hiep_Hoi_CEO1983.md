# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & THIẾT KẾ HỆ THỐNG
## ỨNG DỤNG DI ĐỘNG & PWA HIỆP HỘI CLB DOANH NHÂN CEO 1983

> **Phiên bản:** Version 3.2 - Master BA Comprehensive Specification  
> **Tên Ứng Dụng (Mobile Name):** CEO1983 (Chuẩn hóa viết liền không dấu cách, biểu tượng số 8 mạ vàng doanh nhân)  
> **Mã Tài Liệu:** `SRS-CEO1983-APP-V3.2`  
> **Tác Giả & Thẩm Định:** Master Business Analyst, Solution Architect & Ban Thư Ký CLB CEO 1983  
> **Đối Tượng Áp Dụng:** Hội viên Doanh nhân CLB CEO 1983, Ban Quản Trị, Ban Soát Vé Sự Kiện, Ban Truyền Thông, Ban Tài Chính  
> **Nền Tảng Triển Khai:** PWA Mobile Web & Mobile App (Android APK qua Capacitor / React 19 / TanStack Router)  
> **Phong Cách Thiết Kế:** Executive Luxury Champagne Gold (`linear-gradient(135deg, #F6E1C3, #D8B282, #C29B69, #8C653B)`), Royal Navy Brand (`#003B95`), Dark Navy Slate (`#0A1834`). Tuyệt đối không dùng nút đen hay viền cam.

---

## PHẦN 1: GIẢI THÍCH BÌNH DÂN CÁC KHÁI NIỆM NGHIỆP VỤ CỐT LÕI

1. **Hệ Sinh Thái Ưu Đãi Sinh Nhật (Birthday Surprise Flow):**
   - Giống như một chiếc thiệp chúc mừng mạ vàng kèm voucher quà tặng bất ngờ được trao tận tay CEO ngay khi mở cửa văn phòng vào đúng ngày sinh nhật. Hệ thống tự động so khớp ngày sinh, hiển thị pháo hoa chúc mừng và trao mã voucher chiết khấu dịch vụ mà không cần hội viên phải đi xin xỏ.
2. **Quảng Cáo Tiếp Thị Marketplace (Sponsored Ads & Affiliate):**
   - Tương tự như bảng quảng cáo LED đắt giá nhất ở sảnh tòa nhà hội nghị B2B. Các doanh nghiệp hội viên tự nộp hồ sơ quảng cáo sản phẩm ngay trên điện thoại, Admin duyệt và nhận thanh toán VietQR Napas 24/7 tức thì, sau đó banner được đưa lên vị trí trang trọng nhất trên sàn giao thương cho hàng ngàn CEO cùng xem.
3. **Cơ Chế Điểm Danh Sự Kiện Kép (Dual Check-in QR Architecture):**
   - **Cách 1 (Tự điểm danh):** Hội viên đến cửa hội trường, mở máy quét mã QR in trên Standee lễ tân, hệ thống lập tức thông báo "Chào mừng CEO!", báo ngay vị trí Bàn VIP mấy, Ghế số mấy và tặng một Mã số quay thưởng may mắn.
   - **Cách 2 (Soát vé qua cổng):** Hội viên chìa thẻ vé điện tử có mã QR trên màn hình điện thoại ra, Ban soát vé (được Admin phân quyền) dùng máy quét một tiếng bíp là cửa mở.
4. **Bộ Chuyển Đổi Chủ Đề Mùa Lễ Hội (Seasonal Dynamic Theme Switcher):**
   - Chiếc áo mới cho ứng dụng: Khi đến Tết Nguyên Đán, ứng dụng chuyển sang sắc đỏ mai vàng rực rỡ; đến Giáng sinh có chuông tuyết ấm áp; ngày thường giữ sắc xanh hoàng gia và vàng kim lịch lãm.

---

## PHẦN 2: BẢN ĐỒ CÁC TAB CHỨC NĂNG & LUỒNG MÀN HÌNH TRÊN APP

| Tab Điều Hướng | Tên Chức Năng | Phân Quyền | Mô Tả Trải Nghiệm Người Dùng |
| :--- | :--- | :--- | :--- |
| **Tab 1: Trang Chủ** | Home Dashboard & VIP Card | Toàn bộ hội viên (Phần Soát vé chỉ mở cho Ban Soát Vé) | Thẻ VIP 3D chạm NFC, Sự kiện sắp diễn ra, Tiện ích soát vé nhanh (chỉ mở cho người được chỉ định), Popup chúc mừng sinh nhật tự động, Bộ đổi chủ đề giao diện mùa lễ hội. |
| **Tab 2: Sự Kiện** | Events & Dual Check-in Pass | Toàn bộ hội viên | Danh sách đại hội, gala, hội thảo xúc tiến; Màn hình Quét QR Check-in Standee tự động nhận bàn/ghế/mã bốc thăm; Màn hình Vé điện tử cá nhân kèm mã QR soát vé. |
| **Tab 3: Thẻ 83** | Smart NFC Card & Business Identity | Toàn bộ hội viên | Trọng tâm thanh điều hướng: Danh thiếp điện tử 3D mạ vàng, QR code định danh cá nhân, chạm kết nối NFC, chia sẻ link hồ sơ doanh nghiệp B2B một chạm. |
| **Tab 4: Giao Thương (Marketplace)** | B2B Marketplace & Ad Sponsor | Toàn bộ hội viên & Doanh nghiệp | Danh mục sản phẩm/dịch vụ B2B của hội viên, Top Carousel Banner nhà tài trợ nổi bật, Nút mở Modal đăng ký chạy quảng cáo affiliate/sponsorship lên Ban Quản Trị. |
| **Tab 5: Tin Nhắn & Cuộc Gặp** | Messages, Meetings & 1-on-1 | Toàn bộ hội viên | Hộp thư trò chuyện bảo mật, Luồng đặt lịch hẹn bàn 1-on-1 giữa các CEO, Xem bản đồ Google Maps cuộc gặp offline, Nút vào phòng họp Google Meet trực tuyến. |
| **Tab 6: Cá Nhân** | Executive Profile & Settings | Toàn bộ hội viên | Hồ sơ cá nhân CEO, quản lý thông tin doanh nghiệp, tra cứu hóa đơn niên liễm VietQR, quản lý voucher ưu đãi sinh nhật đã lưu, đổi mật khẩu và bảo mật. |

---

## PHẦN 3: ĐẶC TẢ CHI TIẾT 4 LUỒNG TÍNH NĂNG MỚI ĐƯỢC NÂNG CẤP

### 3.1. Luồng Ưu Đãi & Chúc Mừng Sinh Nhật Hội Viên (Birthday Surprise Flow)
- **Mã chức năng:** `APP_FEAT_BIRTHDAY_CELEBRATION`
- **Tập tin hiện thực:** `src/components/member/BirthdayCelebrationModal.tsx` tích hợp tại `src/routes/association.index.tsx`.
- **Kịch bản hoạt động:**
  1. Khi hội viên mở ứng dụng và truy cập màn hình chính (`/association`), hệ thống chạy hàm kiểm tra:
     - So khớp ngày tháng sinh nhật của hội viên với ngày hiện tại của hệ thống.
     - Kiểm tra trong `localStorage` khóa `vione_birthday_dismissed_{memberId}_{year}` xem hội viên đã nhận/đóng thông báo sinh nhật trong ngày hôm nay chưa.
  2. Nếu trùng khớp và chưa nhận:
     - Kích hoạt hiển thị `BirthdayCelebrationModal` với hiệu ứng hoạt họa cao cấp (confetti / sparkles / floating balloons).
     - Hiển thị tên hội viên danh dự, lời chúc mừng trang trọng từ Ban Quản Trị CLB CEO 1983.
     - Hiển thị quà tặng ưu đãi: Tỷ lệ chiết khấu (%) và Mã Voucher độc quyền (lấy từ cấu hình `BirthdayPromoManager` của CRM).
     - Cho phép hội viên bấm nút **"Sao chép mã"** và bấm nút **"Nhận Quà Ưu Đãi"** để tự động lưu mã vào ví voucher cá nhân.
  3. Ghi nhớ trạng thái để không làm phiền người dùng ở các lần truy cập tiếp theo trong ngày.

### 3.2. Luồng Đăng Ký Quảng Cáo Tiếp Thị Marketplace & Hiển Thị Nhà Tài Trợ
- **Mã chức năng:** `APP_FEAT_MARKETPLACE_SPONSORED_ADS`
- **Tập tin hiện thực:** `src/routes/association.products.tsx` (tích hợp `SponsoredAdsCarousel` và `AdRegistrationModal`).
- **Kịch bản đăng ký quảng cáo:**
  1. Tại màn hình Sàn Giao Thương (`/association/products`), hội viên nhìn thấy nút nổi bật: **"Đăng Ký Chạy Quảng Cáo / Tài Trợ"** (Champagne Gold Gradient).
  2. Bấm nút mở Modal đăng ký với các trường thông tin:
     - Tên doanh nghiệp / Thương hiệu.
     - Tiêu đề chiến dịch quảng cáo.
     - Mô tả ngắn gọn về sản phẩm, dịch vụ hoặc chương trình ưu đãi B2B.
     - Đường dẫn ảnh Banner (khổ chuẩn 16:9, khuyến nghị 1200x675px).
     - Đường dẫn liên kết hành động (Website, Landing Page, link Zalo OA hoặc Hotline).
     - Thông tin liên hệ người đại diện doanh nghiệp.
  3. Bấm **"Gửi Đăng Ký Lên Quản Trị"**: Dữ liệu được gửi lên CRM qua API/Supabase với trạng thái `pending`.
- **Kịch bản hiển thị quảng cáo tài trợ:**
  - Ở đầu màn hình Marketplace, hệ thống hiển thị khối Carousel quảng cáo tự động trượt (Auto-play carousel 4 giây/slide).
  - Chỉ các chiến dịch có trạng thái `active` (đã được Admin CRM duyệt và thanh toán VietQR) mới được hiển thị.
  - Mỗi banner có huy hiệu "Được Tài Trợ / Sponsored" màu vàng kim sang trọng, hiển thị thương hiệu và có nút "Xem Ngay" chuyển hướng trực tiếp đến đường dẫn của nhà tài trợ.

### 3.3. Bộ Chuyển Đổi Chủ Đề Động Mùa Lễ Hội (Seasonal Theme Switcher)
- **Mã chức năng:** `APP_FEAT_DYNAMIC_SEASONAL_THEME`
- **Tập tin hiện thực:** `src/components/member/AppThemeSelectorModal.tsx` và `src/components/member/SeasonalEventHeader.tsx`.
- **Danh sách chủ đề hỗ trợ:**
  1. `classic`: Phong cách Doanh nhân Cổ điển (Nền Navy `#0A1834`, Vàng Champagne Gold, họa tiết vương miện quyền lực).
  2. `blue`: Phong cách Hoàng Gia Hiện Đại (Nền Xanh Đại Dương `#003B95`, dải sóng ánh kim thanh lịch).
  3. `tuyen_quang`: Phong cách Hội Tụ Tuyên Quang (Sự kiện đại hội đặc biệt, hoa sen và danh lam thắng cảnh).
  4. `noel` / `christmas`: Mùa Giáng Sinh Yêu Thương (Hạt tuyết rơi, chuông vàng, dải ruy băng đỏ lễ hội).
  5. `tet`: Mùa Xuân Đoàn Viên & Thịnh Vượng (Sắc đỏ may mắn, cành mai hoa đào vàng khoe sắc).
- **Cơ chế lưu trữ:** Đồng bộ vào `localStorage` (`ceo1983_active_theme`) và phát sự kiện `storage` / custom event giúp toàn bộ header, banner và nút bấm cập nhật giao diện ngay lập tức mà không cần tải lại trang.

### 3.4. Cơ Chế Điểm Danh Sự Kiện Kép (Dual Check-in QR System)
- **Mã chức năng:** `APP_FEAT_DUAL_EVENT_CHECKIN`
- **Tập tin hiện thực:** `src/routes/association.checkin.tsx`.
- **2 Chế độ hoạt động song song:**
  - **Chế độ 1: Quét Mã QR Standee Tại Cửa (Mode 1: Standee Scanner):**
    - Hội viên mở máy ảnh trên App và quét mã QR đặt tại bàn lễ tân hoặc standee cửa hội trường.
    - Cú pháp mã QR Standee: `event_checkin:{eventId}:{eventName}`.
    - Hệ thống tự động xác thực:
      - Kiểm tra tính hợp lệ của sự kiện.
      - Ghi nhận trạng thái điểm danh của hội viên vào cơ sở dữ liệu (`status = 'checked_in'`, lưu thời gian `checked_in_at`).
      - Tra cứu số bàn tiệc và vị trí ghế đã phân bổ cho hội viên.
      - Sinh ngẫu nhiên mã số quay thưởng may mắn nếu chưa có (VD: `LUCK-8319`).
    - Giao diện lập tức hiển thị màn hình Chúc Mừng Điểm Danh Thành Công với hiệu ứng thẻ bài VIP mạ vàng, thông tin: Tên CEO, Doanh nghiệp, Bàn số, Ghế số và Mã may mắn bốc thăm trúng thưởng.
  - **Chế độ 2: Trình Thẻ Vé Điện Tử (Mode 2: Attendee Pass):**
    - Trường hợp Ban Soát Vé đứng tại cửa dùng thiết bị quét vé của khách:
    - Hội viên chuyển sang chế độ "Thẻ Vé Của Tôi".
    - Màn hình hiển thị Thẻ Vé Điện Tử cao cấp viền vàng, đầy đủ tên sự kiện, ngày giờ, địa điểm, tên người tham dự, số ghế danh dự, và mã QR vé cá nhân độc nhất: `event_ticket:{eventId}:{memberCode}:{seat}:{luckyNumber}`.
    - Ban Soát Vé quét mã này để gạch vé cho hội viên bước vào khán phòng.

---

## PHẦN 4: MA TRẬN PHÂN QUYỀN TRUY CẬP TRÊN APP MOBILE (RBAC MATRIX)

| Chức Năng / Màn Hình | Hội Viên Thường | Ban Quản Trị CLB | Ban Soát Vé (Được Chỉ Định) | Ban Truyền Thông |
| :--- | :---: | :---: | :---: | :---: |
| **Nhận Popup Sinh Nhật & Voucher** | Có (Nếu đúng ngày) | Có (Nếu đúng ngày) | Có (Nếu đúng ngày) | Có (Nếu đúng ngày) |
| **Đổi Chủ Đề Mùa Lễ Hội** | Có | Có | Có | Có |
| **Đăng Ký Quảng Cáo Marketplace** | Có | Có | Có | Có |
| **Xem Carousel Banner Quảng Cáo** | Có | Có | Có | Có |
| **Tự Quét QR Standee Điểm Danh** | Có | Có | Có | Có |
| **Xem Thẻ Vé Điện Tử Cá Nhân** | Có | Có | Có | Có |
| **Quét Mã Vé Hội Viên Tại Cửa (Soát Vé)** | **KHÔNG** (Ẩn nút) | **CÓ** | **CÓ** | **CÓ** (Khi được gán) |
| **Đặt Lịch Hẹn Bàn 1-on-1** | Có | Có | Có | Có |
| **Xem Bản Đồ Offline & Meet Online** | Có | Có | Có | Có |

---

## PHẦN 5: BẢO ĐẢM HIỆU NĂNG & TRẢI NGHIỆM NGƯỜI DÙNG (NFR & UX)

1. **Khởi động & Render tức thì (Instant Hydration):** Mọi modal (Sinh nhật, Đổi chủ đề, Vé sự kiện) đều được nạp sẵn dưới dạng Client-side component nhẹ, thời gian mở modal < 50ms.
2. **Khả năng hoạt động Ngoại tuyến (Offline-First Ticket Pass):** Thẻ vé điện tử lưu thông tin vé vào bộ nhớ đệm (Cache Storage / LocalStorage), đảm bảo ngay cả khi vào tầng hầm khách sạn mất sóng 4G/Wifi, hội viên vẫn mở được mã QR vé điện tử để ban soát vé quét kiểm tra.
3. **Bảo mật mã QR Vé:** Mã QR vé được mã hóa kèm mã hội viên và ID sự kiện, chống chụp màn hình chia sẻ cho người ngoài dùng trộm.
