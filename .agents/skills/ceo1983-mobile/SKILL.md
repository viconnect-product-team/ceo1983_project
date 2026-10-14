---
name: ceo1983-mobile
description: Hướng dẫn kỹ thuật native, cầu nối Android Java, Capacitor, tối ưu WebView và đóng gói ứng dụng di động CEO 1983 Mobile App.
---

# KỸ NĂNG ỨNG DỤNG DI ĐỘNG CEO 1983 MOBILE

Kỹ năng này cung cấp các tiêu chuẩn kỹ thuật, cấu hình Capacitor, cầu nối Native Android Java, dịch vụ chạy ngầm và quy trình biên dịch gói APK cho **Ứng Dụng Di Động CLB Doanh Nhân CEO 1983** (`apps/mobile_ceo1983`).

---

## 1. Kiến Trúc Native & Cầu Nối Hệ Điều Hành

- **Capacitor Mobile Wrapper**: Đóng gói ứng dụng di động cho Android và iOS với `appId: "vn.ceo1983.app"`, kết nối HTTPS bảo mật với cổng nghiệp vụ hội viên.
- **Dịch Vụ Thông Báo Nền (`CeoNotificationSyncService.java`)**: 
  - Khởi tạo Foreground/Background Service chạy độc lập với vòng đời WebView.
  - Tự động nhận diện cuộc gọi WebRTC và tin nhắn mới ngay cả khi ứng dụng đang đóng hoặc chạy ngầm.
  - Hiển thị Heads-Up Notification ngoài màn hình khóa với chuông, rung và 2 nút hành động trực tiếp: "Nghe" và "Từ chối".
- **Cầu Nối Native Android AI (`MainActivity.java`)**:
  - Nhận diện giọng nói tiếng Việt qua `android.speech.SpeechRecognizer` (`vi-VN`).
  - Phát âm phản hồi TTS qua `android.speech.tts.TextToSpeech` (`vi-VN`) với độ trễ 0ms.
- **Tự Động Cắt Khoảng Trắng Thừa (Stream Space / Auto-trim)**:
  - Toàn bộ các ô nhập liệu trên ứng dụng di động tự động cắt bỏ khoảng trắng thừa đầu cuối khi mất tiêu điểm (`onBlur`).

---

## 2. Quy Trình Biên Dịch & Đóng Gói APK

Khi có cập nhật mã nguồn Frontend:

```powershell
# 1. Biên dịch Frontend Web
cd apps/ceo1983_app_fe
npm run build

# 2. Đồng bộ sang Android Native
cd ../../apps/mobile_ceo1983
npx cap copy android

# 3. Biên dịch APK
cd android
.\gradlew.bat assembleDebug
```

Tệp APK thành phẩm:
- `apps/mobile_ceo1983/android/app/build/outputs/apk/debug/app-debug.apk`
- Đồng bộ tự động sang `release_apk/CEO1983-app-latest.apk`.

---

## 3. Quy Tắc Bắt Buộc

1. **Tuyệt Đối Không Tự Ý Chạy Git Push / Git Commit**: Mọi tệp chỉ lưu cục bộ.
2. **Kiểm Tra Type-Check 100% Exit Code 0** (`npx tsc --noEmit`) trước khi xuất bản.
3. **Không Sử Dụng Thuật Ngữ Kỹ Thuật (Zero Technical Jargon)** trên giao diện người dùng.

---

## 4. Chuẩn Hóa Phân Quyền, Ô Nhập Liệu & Trải Nghiệm Mobile (Cập Nhật 10/2026)

1. **Phân Quyền Thao Tác Chặt Chẽ**:
   - Tin tức câu lạc bộ: Chỉ các vai trò `Quản trị`, `Admin`, `Chủ tịch`, `Trưởng ban` mới có quyền Đăng/Sửa/Xóa. Thành viên chỉ được xem.
   - Quét mã QR sự kiện: Kiểm soát nghiêm ngặt theo danh sách nhân sự được phân quyền quét mã từ CRM (`qrScanners` / `qrStaff`). Riêng `Quản trị`, `Chủ tịch`, `Admin` luôn có toàn quyền quét mã ở mọi sự kiện.
2. **Khắc Phục Ô Nhập Tiền Tệ VNĐ**:
   - Loại bỏ cản trở của `isComposingRef` trên các ô nhập tiền tệ số `inputMode="numeric"`, cho phép người dùng gõ số liền mạch trên bàn phím ảo Android/iOS và bộ gõ tiếng Việt.
3. **Quản Lý Quyền Thông Báo Chủ Động**:
   - Tuyệt đối không bật popup xin quyền thông báo khi vừa vào ứng dụng. Chuyển quyền quản lý sang công tắc Bật/Tắt trong màn hình Hồ sơ cá nhân.
4. **Tối Giản Hóa Giao Diện & Tiết Giảm Màu Vàng**:
   - Loại bỏ section "Lịch sử hoạt động & giao dịch" trên trang chủ để giao diện thoáng gọn, chuyên nghiệp.
   - Điều chỉnh bảng màu ưu tiên Deep Cobalt Navy, giảm độ chói của các mảng màu vàng kim.

