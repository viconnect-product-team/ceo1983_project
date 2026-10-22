---
name: ceo1983-mobile
description: Kỹ năng chuyên sâu về nghiệp vụ, kỹ thuật, giao diện mobile-first, nhận diện 3 màu thương hiệu, an toàn ngày tháng và cầu nối Native Capacitor cho Ứng dụng Di động Hội viên CLB Doanh Nhân CEO 1983 (HanoiBA).
---

# KỸ NĂNG CHUYÊN SÂU PHÂN HỆ MOBILE APP CEO 1983

Kỹ năng này cung cấp các chỉ dẫn nghiệp vụ, kỹ thuật và quy chuẩn phát triển cho phân hệ **Mobile App Hội Viên CEO 1983** (iOS, Android, PWA, Capacitor Native) dành cho các doanh nhân sinh năm 1983 và lãnh đạo doanh nghiệp trực thuộc HanoiBA.

---

## 1. Bản Chất & Phân Biệt Phân Hệ
- **Không nhầm lẫn với Web CRM**: Mobile App là ứng dụng di động (Mobile-First) dành cho Hội viên doanh nhân. Mọi component và route Mobile đều nằm trong layout `MemberShell` với **Thanh điều hướng chân trang (Bottom Navigation Bar)** gồm 5 biểu tượng chính: Trang chủ, Cơ hội, Danh bạ, Tin nhắn, Cá nhân.
- **Môi trường hiển thị**: Tối ưu trên màn hình điện thoại từ 320px đến 430px+. Tuyệt đối không dùng Sidebar desktop, không dùng bảng Excel rộng ngang cố định, không dùng các bảng nút chữ cồng kềnh.

---

## 2. Danh Mục Các Chức Năng Mobile & Node Traceability
Khi nhận yêu cầu về Mobile App, Agent tra cứu mã Node tương ứng:
- **`[NODE-APP-001]` Trang Chủ & 4 Phím Tắt Tùy Biến (`/association`)**: Số liệu thật 100% từ CSDL. Cho phép tự chọn 4 tính năng chính hiển thị ra trang chủ (`CustomHomeShortcutsModal`). Cập nhật nhanh avatar/bìa/logo kiểu Facebook.
- **`[NODE-APP-002]` Thẻ Hội Viên VIP Số & QR Cá Nhân (`/association/card`)**: Logo công ty hội viên ở góc phải trên. Mã QR cá nhân hóa mở popup phóng to. Công tắc bảo mật SĐT và Email. Tích hợp Quét QR thẻ đối tác.
- **`[NODE-APP-003]` Trang Xem Thẻ Công Khai (`/card/$code`)**: Xem công khai danh thiếp. Tuân thủ quyền riêng tư: Ẩn SĐT/Email sẽ hiện "🔒 Đã ẩn theo cài đặt riêng tư". Giao diện đồng bộ 100% với thẻ nội bộ.
- **`[NODE-APP-004]` Danh Bạ Hội Viên & Hẹn Gặp 1-on-1 (`/association/members`)**: Thanh A-Z cuộn ngang trên điện thoại (`sm:hidden overflow-x-auto`). Nút hành động dàn lưới cân đối (5 cột biểu tượng Lucide). Popup hẹn gặp B2B kèm liên kết cơ hội hợp tác.
- **`[NODE-APP-005]` Cơ Hội Giao Thương Strip 3 Thẻ Ngang (`/association/opportunities`)**: TUYỆT ĐỐI KHÔNG để biểu đồ trong màn này. Dải 3 thẻ ngang: "Tổng chia sẻ", "Deal đã chốt", "Tôi share đi" và nút sang Analytics. Bộ lọc 3 trạng thái: Tất cả, Bên mua, Bên bán.
- **`[NODE-APP-006]` Trung Tâm Thống Kê & Vinh Danh Top Giver (`/association/analytics`)**: Nơi tập trung 100% biểu đồ cơ hội di động (chuyển đổi 3 chế độ). Vinh danh Top 1 Giver nổi bật kèm số lượng & giá trị deal, bảng Top 5 Givers, danh sách ALL cơ hội live filter.
- **`[NODE-APP-007]` Sàn Giao Thương B2B Giới Hạn 5 Sản Phẩm (`/association/products`)**: Giới hạn tối đa 5 sản phẩm/DN (chống spam). Huy hiệu `(X/5 sản phẩm)`. Slider tài trợ nền Obsidian Dark viền Amber Gold. Nút nhắn tin trực tiếp người bán.
- **`[NODE-APP-008]` Lịch Trình Sự Kiện & Soát Vé QR (`/association/events`)**: Bọc `EventsErrorBoundary` chống sập trang. Helper an toàn `safeFormatEventDate` chống `Invalid time value`. Tự động gộp Cuộc họp ban (`[Họp Ban]`). Slider tối đa 3 QR vé.
- **`[NODE-APP-009]` Biểu Quyết Trực Tuyến Gắn Với Sự Kiện/Họp (`/association/voting`)**: 2 Tab: Biểu quyết đang diễn ra & Lịch sử nghị quyết. Mọi biểu quyết đều gắn liền với Cuộc họp hoặc Sự kiện chính thức. Tính % tỷ lệ tán thành Realtime.
- **`[NODE-APP-010]` Bảng Tin, Comment & Đánh Dấu Họp (`/association/messages`)**: Nút Icon Bình luận đặt cạnh nút Icon Chia sẻ bên phải thanh tương tác. Nút "Đánh dấu cuộc họp vào hồ sơ cá nhân" tự động ghi nhận vào lịch sử hoạt động hội viên.
- **`[NODE-APP-011]` Hồ Sơ Cá Nhân & Quản Trị RBAC Nhanh (`/association/profile`)**: Định danh lãnh đạo trang trọng, xem hợp đồng và liên kết thẻ số. Nếu là Admin/BQT thì hiện thêm nút "Phân quyền Hội viên (BQT)" mở sang `/association/permissions`.
- **`[NODE-APP-012]` Cài Đặt Hệ Thống, Trợ Lý AI & Đổi Mật Khẩu (`/association/settings`)**: Đồng bộ 3 khối: Cài đặt hệ thống, Thông tin hỗ trợ 24/7 (Hotline, Email), Đổi mật khẩu bắt buộc & Bảo mật.
- **`[NODE-APP-013]` Kho Đặc Quyền & Quà Tặng Sự Kiện (`/association/perks`)**: Nơi lưu giữ các voucher, quà tặng trúng giải từ Vòng quay may mắn Lucky Draw.
- **`[NODE-APP-014]` Cầu Nối Native Android / iOS & Push Service Worker (`mobile_ceo1983`)**: Trong `sw.js` bọc `Notification.permission === 'granted'` và `.catch()`. Android Java cầu nối Capacitor WebView an toàn, điều hướng mượt mà.

---

## 3. Hệ Thống 3 Màu Thương Hiệu Phân Cấp Ưu Tiên
1. **Mức Ưu Tiên 1 - ĐỎ (#DC2626 / #D92525)**: Nhận diện thương hiệu chính, nút CTA quyết định, thông báo khẩn, Top 1 Giver.
2. **Mức Ưu Tiên 2 - VÀNG / HỔ PHÁCH (#F59E0B / #D97706)**: Điểm nhấn VIP, deal cơ hội, vinh danh Top 2-3, sự kiện mở.
3. **Mức Ưu Tiên 3 - XANH NAVY (#003B95) & XANH LỤC (#059669)**: Nền tảng hệ thống, Header/Footer, trạng thái deal hoàn thành, vé hợp lệ.
- **CẤM TUYỆT ĐỐI**: Màu tím, hồng, xanh neon, dải cầu vồng.

---

## 4. Chuẩn Nhập Liệu & Thao Tác Di Động
- **Trường nhập ngày (`StandardDateInput`)**: Tự động mask dấu `/` khi gõ số (`inputMode="numeric"`). Icon lịch dùng Native `<input type="date">` overlay trong suốt (`opacity-0 absolute inset-0`) kích hoạt picker native của iOS/Android mà không bị WebKit chặn.
- **Tối ưu nút thành biểu tượng**: Dùng biểu tượng Lucide đơn sắc tinh tế (`Phone`, `MessageSquare`, `User`, `Handshake`), dàn lưới 5 cột cân đối.
- **An toàn ngày tháng**: Tuyệt đối không dùng `new Date(event.date)` thiếu kiểm tra. Dùng `safeFormatEventDate` và `safeGetEventDayMonth` kiểm tra `!isNaN(d.getTime())`.

---

## 5. Quy Trình Kiểm Thử Trước Khi Bàn Giao
1. Chạy `npm run routes:gen` nếu có tạo hoặc sửa file route.
2. Chạy `npx tsc --noEmit` xác nhận 0 lỗi (Exit Code 0).
3. Cập nhật `MEMORY.md` và `.cursorrules`.
