# KỸ NĂNG DI ĐỘNG (MOBILE AI SKILL) - DỰ ÁN CEO 1983
## Phân Hệ: Ứng Dụng Di Động Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

### 1. Giới Thiệu & Mục Đích Kỹ Năng
Kỹ năng này cung cấp toàn bộ hướng dẫn vận hành, kiến trúc native wrapper, cầu nối Android Java, dịch vụ thông báo nền (Background Service), cơ chế WebRTC và quy trình biên dịch gói APK Debug/Release dành riêng cho **Ứng Dụng Di Động CLB Doanh Nhân CEO 1983**.

---

### 2. Nguyên Tắc Cốt Lõi (Core Principles)
1. **Tuyệt Đối Không Tự Ý Chạy Git Push / Git Commit**:
   - Mọi tệp mã nguồn, tài nguyên native và file APK chỉ được lưu trữ cục bộ (Local).
   - Quyền commit và đưa mã nguồn lên kho lưu trữ thuộc về người dùng.
2. **Kiểm Tra Type-Check Bắt Buộc Trước Khi Đóng Gói (Exit Code 0)**:
   - Trước khi đóng gói APK hoặc bàn giao, bắt buộc chạy `npx tsc --noEmit` trên frontend `apps/ceo1983_app_fe` và backend `apps/ceo1983_app_be` đạt 0 lỗi.
3. **Cơ Chế Thông Báo Nền (Background Push Service)**:
   - Tích hợp `CeoNotificationSyncService` chạy ngầm độc lập với vòng đời ứng dụng.
   - Khi có cuộc gọi đến hoặc tin nhắn mới, bắt buộc bắn thông báo Heads-Up Notification ngoài màn hình khóa/thanh thông báo kèm chuông, rung và nút nhận/từ chối cuộc gọi mà không cần người dùng mở app trước.
4. **Cắt Bỏ Khoảng Trắng Thừa (Stream Space / Auto-trim Whitespace)**:
   - Toàn bộ các trường nhập liệu trên mobile app bắt buộc tự động cắt bỏ khoảng trắng thừa đầu cuối khi mất tiêu điểm (`onBlur`), bảo đảm dữ liệu số điện thoại, mã vé, email và văn bản không bị lỗi khoảng trắng.
5. **Chuẩn Hóa Ngôn Ngữ Doanh Nghiệp (Zero Technical Jargon)**:
   - Tuyệt đối không để lộ các từ ngữ kỹ thuật như "SQL", "PostgreSQL", "public.<table_name>", "RESTful API", "Cấp bậc" trên giao diện người dùng.

---

### 3. Kiến Trúc Native & Cầu Nối Android Java

1. **Dịch Vụ Đồng Bộ Cuộc Gọi & Tin Nhắn Nền (`CeoNotificationSyncService.java`)**:
   - Khởi tạo Foreground/Background Service qua Notification Channel `ceo1983_calls_v2` với mức ưu tiên `IMPORTANCE_HIGH`.
   - Polling ngầm định kỳ gọi API `/me/active-call` và `/notifications`.
   - Hiển thị cuộc gọi đến với 2 nút hành động trực tiếp: "Nghe" và "Từ chối".

2. **Cầu Nối Giọng Nói Native AI (`MainActivity.java` - `NativeBridge`)**:
   - Nhận diện giọng nói STT tiếng Việt qua `android.speech.SpeechRecognizer` (ngôn ngữ `vi-VN`).
   - Phát âm phản hồi TTS qua `android.speech.tts.TextToSpeech` (locale `vi-VN`) với độ trễ 0ms.
   - Phơi bày các phương thức `@JavascriptInterface`: `speak()`, `stopSpeaking()`, `startSpeechRecognition()`, `stopSpeechRecognition()`.

3. **Cấu Hình Môi Trường Capacitor (`capacitor.config.ts`)**:
   - `appId`: `vn.ceo1983.app`
   - `appName`: `CEO1983`
   - `server.url`: Trỏ trực tiếp cổng Web bảo mật HTTPS (`https://14.225.217.232:5444/association`).

---

### 4. Quy Trình Biên Dịch APK Mới Nhất

Khi có thay đổi Frontend cần cập nhật lên Mobile APK:

```powershell
# Bước 1: Biên dịch Frontend Web
cd apps/ceo1983_app_fe
npm run build

# Bước 2: Đồng bộ mã nguồn sang thư mục Android Native
cd ../../apps/mobile_ceo1983
npx cap copy android

# Bước 3: Biên dịch file APK bằng Gradle Wrapper
cd android
.\gradlew.bat assembleDebug
```

- Gói APK thành phẩm xuất ra tại:
  `apps/mobile_ceo1983/android/app/build/outputs/apk/debug/app-debug.apk`
  (tự động đồng bộ sang `release_apk/CEO1983-app-latest.apk` và `public/docs/`).

---

### 5. Quy Trình Triển Khai Siêu Tốc (Fast Deploy)

Sử dụng script tự động hóa:
```powershell
.\deploy-mobile.ps1
```
Script tự động biên dịch, đồng bộ Capacitor và triển khai gói mobile lên máy chủ chỉ trong 1-2 phút.
