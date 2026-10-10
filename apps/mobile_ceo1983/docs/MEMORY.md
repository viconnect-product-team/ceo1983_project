# MOBILE ARCHITECTURE MEMORY - CEO 1983 PROJECT
## Phân Hệ: Mobile App Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

### 1. Lịch Sử Các Quyết Định Kỹ Thuật (Architectural Decisions)
1. **Khắc phục lỗi giật lag và nuốt chạm (Log 209)**:
   - Gỡ bỏ touch listener chặn click tự nhiên tại `__root.tsx`.
   - Cải tiến hiệu năng Java WebView trong `MainActivity.java` bằng cách kích hoạt `LAYER_TYPE_HARDWARE`, tắt overscroll bounce native của Android Java để tránh xung đột với cử chỉ cuộn Web, và kích hoạt `setOffscreenPreRaster(true)`.
   - Đóng gói thành công bản APK `release_apk/CEO1983-app-latest.apk` (168.54 MB).
2. **Kịch bản deploy siêu tốc cho Mobile (`deploy-mobile.ps1`)**:
   - Rút ngắn thời gian deploy từ 15 phút xuống chỉ còn 1-2 phút bằng cách bỏ qua build/upload backend khi chỉ thay đổi giao diện Mobile Frontend.

---

### 2. Các Lưu Ý Kỹ Thuật (Gotchas)
- **Cấu hình Capacitor URL**: Khi build APK chạy môi trường production, `capacitor.config.ts` trỏ về `https://14.225.217.232:5444/association`.
- **Cấp quyền thiết bị**: Máy ảnh (quét QR, chụp ảnh danh thiếp OCR) cần khai báo đầy đủ trong `AndroidManifest.xml` (`CAMERA`, `READ_EXTERNAL_STORAGE`).
