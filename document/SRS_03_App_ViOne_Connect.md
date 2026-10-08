# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & KIẾN TRÚC DỮ LIỆU
## ỨNG DỤNG MẠNG LƯỚI GIAO THƯƠNG VIONE CONNECT (BUSINESS CONNECT)

### 1. Khái Niệm Bình Dân Cho Người Không Học IT:
ViOne Connect là công cụ hỗ trợ doanh nhân **kết nối không biên giới**.
* Mỗi khi doanh nhân chạm thẻ danh thiếp Titanium NFC vào điện thoại của khách hàng, máy tính mở tủ `member_business_cards` để tải trang giới thiệu 3D lung linh.
* Khi khách hàng bấm "Lưu danh bạ", máy chủ đóng gói thông tin thành file danh bạ điện thoại (.VCF) để nạp thẳng vào danh bạ iPhone/Android.
* Khi khách hàng điền form để lại số điện thoại, máy tính ghi một dòng vào tủ `business_card_leads` để chủ thẻ biết có khách hàng tiềm năng vừa liên hệ.

---

### 2. Danh Mục APIs & Bảng Cơ Sở Dữ Liệu:
1. **Quản lý Danh thiếp số**:
   - Bảng chính: `member_business_cards`
   - Bảng phụ: `business_card_interactions` (nhật ký lượt chạm), `business_card_leads` (khách để lại liên hệ).
   - Ghép bảng: `member_business_cards JOIN members ON member_business_cards.member_id = members.id`.
2. **Ghép đôi Giao thương B2B (AI Matchmaking)**:
   - Bảng `business_card_services` (các dịch vụ công ty tôi cung cấp).
   - Bảng `business_card_needs` (những gì công ty tôi đang cần tìm kiếm thu mua).
   - Ghép nối: Máy tính so khớp từ khóa giữa 2 bảng này để gợi ý 2 doanh nghiệp kết nối với nhau.

---

### 3. Định Dạng Đóng Gói Ứng Dụng Di Động Android (Dual APK Release):
1. **Bản APK Native Standalone (`ViOne-Connect-latest.apk` - ~81.57 MB)**:
   - Mã nguồn: `apps/mobile_vione` (React Native 0.76.7, Expo SDK 52, Hermes Engine).
   - Quy trình build: Lệnh `./build-apk.ps1 -Release` thực thi Gradle `assembleRelease`.
   - Vị trí tệp xuất xưởng: `release_apk/ViOne-Connect-latest.apk` và `apps/vione_app_fe/public/ViOne-Connect-latest.apk`.
   - Đặc điểm: Hoạt động thuần Native 100%, hiệu năng 60-120fps, đóng gói sẵn bytecode JS offline, hỗ trợ đầy đủ camera native quét QR/OCR, cảm biến NFC, thông báo đẩy màn hình khóa.
2. **Bản APK PWA Siêu Tốc (`ViOne-PWA-latest.apk` - ~3.18 MB)**:
   - Mã nguồn: `apps/vione_app_fe` (TanStack React Start, Capacitor Android).
   - Quy trình build: `npx cap sync android` và chạy Gradle `assembleRelease` tại `apps/vione_app_fe/android`.
   - Vị trí tệp xuất xưởng: `release_apk/ViOne-PWA-latest.apk` và `apps/vione_app_fe/public/ViOne-PWA-latest.apk`.
   - Đặc điểm: Kích thước siêu nhẹ (~3.18 MB), tải và cài đặt trong 3 giây, tự động cập nhật giao diện thời gian thực qua server, hỗ trợ WebRTC call 2 chiều.
