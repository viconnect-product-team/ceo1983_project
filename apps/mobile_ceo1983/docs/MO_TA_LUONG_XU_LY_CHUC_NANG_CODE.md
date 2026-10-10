# MÔ TẢ LUỒNG XỬ LÝ CHỨC NĂNG MOBILE APP (FLOW SPECIFICATION)
## Phân Hệ: Mobile App Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

### LUỒNG 1: KHỞI ĐỘNG ỨNG DỤNG & NẠP WEBVIEW (App Launch Flow)
1. Ứng dụng khởi chạy native qua `MainActivity.java`.
2. Khởi tạo Splash Screen thương hiệu CLB Doanh Nhân CEO 1983 (Logo dập nổi ánh kim trên nền xanh Navy `#003B95`).
3. Kiểm tra kết nối mạng và nạp URL đích `/association` (hoặc tệp tĩnh `www/index.html`).
4. Kích hoạt bridge giao tiếp 2 chiều Capacitor plugins (Camera, Haptics, Storage, StatusBar).

---

### LUỒNG 2: XỬ LÝ NÚT BACK VẬT LÝ & THOÁT APP (Double Back to Exit)
1. Khi người dùng bấm phím Back phần cứng của thiết bị Android:
   - Nếu đang mở Modal / Bottom Sheet: Tự động đóng Modal trước.
   - Nếu đang ở trang con: Gọi `window.history.back()`.
   - Nếu đang ở Trang chủ (`/association`): Bấm lần 1 hiện Toast thông báo `"Bấm quay lại lần nữa để thoát ứng dụng"`, bấm lần 2 trong vòng 2 giây mới thoát app.

---

### LUỒNG 3: QUÉT MÃ QR NATIVE TẠI SỰ KIỆN (Camera QR Scan Flow)
1. Đại biểu hoặc Ban Lễ Tân bấm icon Quét QR trên Top Bar.
2. Ứng dụng yêu cầu quyền Camera qua plugin `@capacitor/camera` hoặc `@zxing/browser`.
3. Phân tích mã QR thời gian thực:
   - Nếu là mã vé sự kiện: Gọi API kiểm tra và hiện thẻ đại biểu.
   - Nếu là mã danh thiếp: Chuyển hướng sang trang danh thiếp `/card/:code`.
