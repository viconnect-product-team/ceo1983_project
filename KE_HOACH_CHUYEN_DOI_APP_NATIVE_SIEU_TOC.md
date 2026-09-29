# KẾ HOẠCH TRIỂN KHAI APP REACT NATIVE SIÊU TỐC (2 - 3 TIẾNG)
> **Dự án:** CLB Doanh Nhân CEO 1983  
> **Mục tiêu:** Tạo ứng dụng React Native / Expo thuần 100%, có Bottom Navigation Native, Camera QR Native, đóng gói thành file APK/AAB độc lập.  
> **Lệnh kích hoạt:** Khi người dùng yêu cầu *"Tìm file kế hoạch chuyển đổi app native và bắt đầu làm"*, AI sẽ kích hoạt quy trình này ngay lập tức.

---

## 1. TỔNG QUAN KIẾN TRÚC & CÔNG NGHỆ

- **Framework lõi:** React Native (Expo SDK 52/53 mới nhất).
- **Ngôn ngữ:** TypeScript 100% (Strict Type, không dùng `any`).
- **Thanh điều hướng:** `@react-navigation/bottom-tabs` & `@react-navigation/native-stack` (100% Native Views của Android & iOS).
- **Camera & Quét QR:** `expo-camera` (Quét mã QR sự kiện và danh thiếp tốc độ cao bằng phần cứng Native).
- **Phản hồi xúc giác (Haptics):** `expo-haptics` (Rung nhẹ khi chạm tab/quét QR chuẩn trải nghiệm app xịn).
- **Engine biên dịch:** Hermes Engine (Meta / Facebook).
- **Cầu nối dữ liệu:** `react-native-webview` với Native Bridge hai chiều (`postMessage` & `onMessage`).

---

## 2. CHECKLIST 5 TAB NATIVE CHUẨN

| Tab | Tên Tab | Icon Native | Chức năng chi tiết |
| :---: | :--- | :--- | :--- |
| **Tab 1** | **Trang chủ** | `Home` | - Header thương hiệu CEO 1983 + Chuông thông báo.<br>- Slider Quảng cáo vuốt ngang (Video/Banner).<br>- Cụm thao tác nhanh: Quét QR, Danh thiếp NFC, Điểm danh, Giới thiệu Deal B2B.<br>- Danh sách Sự kiện sắp diễn ra. |
| **Tab 2** | **Danh thiếp** | `CreditCard` | - Thẻ danh thiếp doanh nhân 2 mặt có mã QR cá nhân.<br>- Danh bạ 27+ hội viên có tìm kiếm & lọc ngành nghề.<br>- Kết nối nhanh qua 1-chạm NFC hoặc quét QR. |
| **Tab 3** | **Sự kiện** | `Calendar` | - Danh sách sự kiện của Hiệp hội, chi tiết sự kiện & bản đồ.<br>- Nút kích hoạt **Native Camera Quét QR** check-in vé siêu nhạy cho Ban tổ chức. |
| **Tab 4** | **Tin nhắn** | `MessageSquare` | - Phân luồng kênh: Kênh Truyền Thông, Kênh Ban Thư Ký, Kênh Xúc Tiến, Kênh Deal B2B.<br>- Chat riêng 1-1 giữa các hội viên. |
| **Tab 5** | **Cá nhân** | `User` | - Hồ sơ doanh nghiệp, thông báo cá nhân, cài đặt tài khoản & đăng xuất. |

---

## 3. CÁC BƯỚC TRIỂN KHAI THẦN TỐC (DỰ KIẾN 120 PHÚT)

### ⏱️ Giai đoạn 1: Khởi tạo Shell React Native (30 phút)
1. Tạo thư mục `apps/ceo1983_mobile_app` bằng Expo CLI.
2. Cài đặt các gói phụ thuộc Native:
   ```bash
   npx expo install expo-camera expo-haptics react-native-webview @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
   ```
3. Cấu hình `app.json` với Bundle ID `vn.ceo1983.app`, Icon và Splash Screen CEO 1983 chính thức.

### ⏱️ Giai đoạn 2: Dựng Native Bottom Tabs & Header (30 phút)
1. Xây dựng bộ điều hướng 5 tab với icon Lucide/Ionicons và theme Navy Blue (`#0f172a`) & Gold (`#d97706`).
2. Tích hợp Safe Area Insets (chống tràn tai thỏ Dynamic Island iPhone và phím điều hướng Android).
3. Thêm hiệu ứng rung phản hồi (Haptic Feedback) khi người dùng bấm chuyển tab.

### ⏱️ Giai đoạn 3: Màn hình Native Camera Quét QR (30 phút)
1. Xây dựng màn hình `QrScannerModal.tsx` dùng `expo-camera` trực tiếp trên phần cứng máy.
2. Tự động nhận diện mã QR vé sự kiện và gửi kết quả về hệ thống điểm danh Backend NestJS.

### ⏱️ Giai đoạn 4: Ghép nối Nội dung & Xuất file APK (30 phút)
1. Tích hợp màn hình nội dung từ phân hệ Mobile Web đã tối ưu.
2. Kiểm tra kết nối API Backend NestJS (`http://14.225.217.232:4002` hoặc localhost).
3. Chạy lệnh xuất bản file APK:
   ```bash
   cd apps/ceo1983_mobile_app/android && .\gradlew.bat assembleDebug
   ```
4. Bàn giao file APK hoàn chỉnh cho kiểm thử.

---

## 4. GHI CHÚ QUAN TRỌNG CHO BẢN DEMO NGÀY MAI
- **Bản APK hiện tại:** Đã được build sẵn tại `apps/mobile_ceo1983/android/app/build/outputs/apk/debug/CEO1983-v1.0-debug.apk` (Timestamp 17:03:37), chạy mượt mà, đầy đủ tính năng:
  - Cụm quảng cáo Slider vuốt ngang đính kèm video.
  - Thông báo cuộc họp offline & phân luồng tin nhắn các Kênh/Ban.
  - Ma trận phân quyền CRM đã fix không bị reset.
  - Danh bạ 27+ hội viên hiển thị chuẩn xác không lỗi.
- **Tập trung cao độ cho buổi demo ngày mai thành công tốt đẹp!**
