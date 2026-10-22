# QUY CHUẨN NGHIỆP VỤ & KỸ THUẬT PHÂN HỆ MOBILE APP CEO 1983 (MOBILE RULES)
## ỨNG DỤNG DI ĐỘNG HỘI VIÊN CLB DOANH NHÂN CEO 1983 (HANOIBA)
*Áp dụng độc quyền cho: Mobile App Hội viên (iOS / Android / PWA / Capacitor)*

---

## 1. ĐỐI TƯỢNG VÀ BẢN CHẤT CỦA PHÂN HỆ MOBILE APP
- **Đối tượng người dùng**: Hội viên chính thức CLB Doanh Nhân CEO 1983 (Chủ tịch HĐQT, Tổng Giám đốc, CEO, Nhà sáng lập) và các đối tác B2B chiến lược.
- **Môi trường hiển thị**: Điện thoại di động thông minh (iOS Safari, Android Chrome, Ứng dụng Native Capacitor, PWA Add-to-Home), tối ưu trên các kích thước màn hình từ 320px đến 430px+ (iPhone SE, iPhone 14/15/16 Pro Max, Samsung Galaxy S Series).
- **Khung giao diện (Layout)**: `MemberShell` với **Thanh điều hướng chân trang (Bottom Navigation Bar)** cố định gồm 5 mục chính: Trang chủ (`/association`), Cơ hội (`/association/opportunities`), Danh bạ (`/association/members`), Tin nhắn (`/association/messages`), Cá nhân (`/association/profile`).
- **TUYỆT ĐỐI KHÔNG NHẦM VỚI WEB CRM**: Mobile App không hiển thị Sidebar desktop, không dùng bảng dữ liệu kiểu Excel cố định rộng ngang, không dùng các bảng nút cồng kềnh.

---

## 2. QUY CHUẨN ĐỊNH TUYẾN PHÂN HỆ MOBILE APP (ROUTES)
Toàn bộ các route của Mobile App bắt đầu bằng tiền tố `/association` hoặc thẻ công khai `/card/$code`:
- **Trang chủ di động**: `/association` (Feed hoạt động, 4 phím tắt tùy biến, sự kiện sắp tới)
- **Thẻ hội viên VIP**: `/association/card` (Logo DN góc phải, QR cá nhân popup, hợp đồng, quét QR)
- **Trang quét thẻ công khai**: `/card/$code` (Tuân thủ công tắc quyền riêng tư SĐT/Email)
- **Danh bạ hội viên**: `/association/members` (Lọc ngành, thanh A-Z cuộn ngang, popup hẹn gặp B2B)
- **Cơ hội kinh doanh**: `/association/opportunities` (Strip 3 thẻ ngang, lọc Bên mua / Bên bán, 10 ngành nghề)
- **Trung tâm Thống kê Hội viên**: `/association/analytics` (Tập trung 100% biểu đồ cơ hội, Top 1 Giver, Top 5, Danh sách ALL deals)
- **Sàn giao thương B2B**: `/association/products` (Tối đa 5 sản phẩm/DN, Slider Obsidian viền Amber Gold, chat người bán)
- **Sự kiện & Họp ban**: `/association/events` (Gộp họp ban `[Họp Ban]`, bọc `EventsErrorBoundary`, vé QR, lịch trình)
- **Biểu quyết nghị quyết**: `/association/voting` (2 Tab: Đang mở & Lịch sử, gắn với sự kiện/họp)
- **Bảng tin & Mời B2B**: `/association/messages` (Icon Comment cạnh Share bên phải, Đánh dấu họp vào hồ sơ cá nhân)
- **Hồ sơ cá nhân & Thẩm quyền**: `/association/profile` (Định danh lãnh đạo, Hợp đồng, nút Phân quyền BQT nếu là Admin)
- **Cài đặt & Trợ lý AI**: `/association/settings` (Ngôn ngữ, Giao diện, Hotline hỗ trợ, Đổi mật khẩu bắt buộc)
- **Kho Đặc quyền**: `/association/perks` (Voucher, giải thưởng trúng từ Lucky Draw)

---

## 3. HỆ THỐNG 3 MÀU THƯƠNG HIỆU PHÂN CẤP ƯU TIÊN (BRAND 3-COLOR SYSTEM)
Mọi màn hình và component của Mobile App BẮT BUỘC tuân thủ phân cấp màu sắc:
1. **Mức Ưu Tiên 1 - ĐỎ (#DC2626 / #D92525)**:
   - Ý nghĩa: Mức ưu tiên cao nhất, hành động khẩn cấp, nhận diện thương hiệu CEO 1983.
   - Áp dụng: Huy hiệu Top 1 Giver dẫn đầu, nút CTA quyết định then chốt, thông báo khẩn cấp, cảnh báo phiên biểu quyết sắp đóng.
2. **Mức Ưu Tiên 2 - VÀNG / HỔ PHÁCH (#F59E0B / #D97706)**:
   - Ý nghĩa: Mức ưu tiên vừa, trạng thái đang tiến hành, điểm nhấn VIP.
   - Áp dụng: Trạng thái đang xử lý, viền thẻ VIP danh dự, vinh danh Top 2 và Top 3, giá trị tiền tệ deal cơ hội, sự kiện đang mở đăng ký.
3. **Mức Ưu Tiên 3 - XANH NAVY (#003B95) & XANH LỤC (#059669)**:
   - Ý nghĩa: Nền tảng hệ thống, thông tin thường nhật, trạng thái hoàn thành.
   - Áp dụng: Thanh điều hướng Header/Footer, trạng thái deal đã chốt thành công, vé sự kiện hợp lệ, biểu tượng liên hệ.
- **Nền Tương Phản**: Nền sáng thanh lịch `#FFFFFF` và Nền thẻ đen sang trọng Obsidian `#0F172A` / `#0B132B`.
- **CẤM TUYỆT ĐỐI**: Màu tím (purple), hồng (pink), xanh neon, dải màu cầu vồng đa sắc.

---

## 4. QUY CHUẨN TRẢI NGHIỆM NGƯỜI DÙNG DI ĐỘNG (MOBILE UX/UI STANDARDS)
1. **Tối Ưu Nút Bấm Thành Biểu Tượng (Button-to-Icon)**:
   - Trên danh sách và thẻ hội viên, TUYỆT ĐỐI KHÔNG dùng các nút chữ cồng kềnh ("Gọi điện", "Nhắn tin", "Xem thẻ", "Kết nối").
   - BẮT BUỘC dùng biểu tượng Lucide đơn sắc tinh tế (`Phone`, `MessageSquare`, `User`, `Handshake`), dàn lưới 5 cột cân đối (`grid grid-cols-5 sm:flex`).
2. **Thanh Cuộn Danh Bạ A-Z Cuộn Ngang (Horizontal A-Z Bar)**:
   - Trên màn hình điện thoại, TUYỆT ĐỐI KHÔNG dùng thanh dải chữ cái A-Z dọc cố định (gây đè nội dung và lỗi chạm).
   - BẮT BUỘC dùng thanh A-Z cuộn ngang (`sm:hidden overflow-x-auto`), thanh dọc chỉ hiện khi màn hình đạt kích thước tablet/desktop (`hidden sm:flex`).
3. **Chuẩn Nhập Ngày Tháng Di Động & Mở Picker Native (Date Input Standards)**:
   - Trường nhập ngày tháng (`StandardDateInput`) phải tự động mask/chèn dấu `/` khi gõ số (`inputMode="numeric"`) vì bàn phím số iOS không có dấu gạch chéo.
   - Icon lịch BẮT BUỘC sử dụng Native `<input type="date">` overlay trong suốt (`opacity-0 absolute inset-0`) để kích hoạt trực tiếp picker native của iOS/Android mà không bị WebKit chặn `.showPicker()`.
4. **An Toàn Ngày Tháng & Error Boundary Sự Kiện (Crash Prevention)**:
   - Tuyệt đối không gọi trực tiếp `new Date(event.date).toLocaleDateString(...)` mà không kiểm tra tính hợp lệ.
   - BẮT BUỘC dùng hàm helper an toàn `safeFormatEventDate` và `safeGetEventDayMonth` kiểm tra `!isNaN(d.getTime())`, phòng vệ triệt để lỗi `RangeError: Invalid time value`.
   - Toàn bộ trang sự kiện BẮT BUỘC bọc quanh bởi `EventsErrorBoundary` cấp route để tránh văng crash toàn ứng dụng.
5. **Quy Chuẩn Bảng Tin & Tương Tác Cuộc Họp (Feed Interaction)**:
   - Nút Icon Bình luận BẮT BUỘC đặt cạnh nút Icon Chia sẻ (nằm sát bên phải thanh tương tác bài viết).
   - Nút "Đánh dấu cuộc họp vào hồ sơ cá nhân" trên các bài viết họp ban (`EVENT_MEETING`) tự động lưu vào lịch sử hoạt động cá nhân của hội viên (`vba_recent_activities`).
6. **Thống Kê Cơ Hội Ngang & Trung Tâm Thống Kê Chuyên Biệt**:
   - Tại trang `/association/opportunities`: TUYỆT ĐỐI KHÔNG để biểu đồ trong màn này. BẮT BUỘC dùng dải 3 thẻ thống kê ngang ("Tổng chia sẻ", "Deal đã chốt", "Tôi share đi") và nút điều hướng sang `/association/analytics`.
   - Tại trang `/association/analytics`: Tập trung 100% biểu đồ cơ hội di động, vinh danh Top 1 Giver nổi bật, Top 5 Givers, và danh sách toàn bộ ALL cơ hội với tìm kiếm realtime.
7. **Sàn Giao Thương B2B Giới Hạn 5 Sản Phẩm**:
   - Nhằm chống spam và nâng cao uy tín, mỗi doanh nghiệp thành viên CHỈ ĐƯỢC ĐĂNG TỐI ĐA 5 sản phẩm/dịch vụ tiêu biểu.
   - Hiển thị huy hiệu rõ ràng `(X/5 sản phẩm)` và từ chối tạo mới khi đã đạt mốc 5 sản phẩm.
8. **Quyền Riêng Tư Danh Thiếp Số**:
   - Công tắc bật/tắt quyền riêng tư cho Số điện thoại và Email.
   - Khi hội viên chọn ẩn, trang quét mã công khai `/card/$code` hiển thị thông báo "🔒 Đã ẩn theo cài đặt riêng tư".
9. **Tùy Biến 4 Tính Năng Chính Trang Chủ**:
   - Cho phép hội viên tự chọn 4 tính năng thường dùng nhất hiển thị trên Trang chủ thông qua `CustomHomeShortcutsModal`. Dữ liệu lưu bền vững theo user ID.
10. **Số Liệu Thật 100% từ CSDL**:
    - Mọi con số thống kê cơ hội, sản phẩm trên trang chủ BẮT BUỘC nạp từ CSDL PostgreSQL qua NestJS API, tuyệt đối không dùng số fallback ảo (6, 3, 4.2 Tỷ, 2.4 Tỷ) khi danh sách trống.
