# MOBILE AI SKILL - CEO 1983 PROJECT
## Phân Hệ: Mobile App Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

### 1. Giới Thiệu & Mục Đích Kỹ Năng
Kỹ năng này cung cấp hướng dẫn đóng gói ứng dụng native, đồng bộ Capacitor, tối ưu hóa WebView Android và biên dịch gói APK Debug/Release dành riêng cho **App Di Động CLB Doanh Nhân CEO 1983**.

---

### 2. Nguyên Tắc Cốt Lõi
1. **Tuyệt Đối Không Tự Ý Chạy Git Push / Git Commit**:
   - Mọi tệp APK và mã nguồn cấu hình chỉ lưu cục bộ.
2. **Quy Trình Biên Dịch APK Mới Nhất**:
   - Khi có thay đổi Frontend cần cập nhật lên Mobile APK:
     ```powershell
     # Bước 1: Build Frontend Web
     cd apps/ceo1983_app_fe
     npm run build

     # Bước 2: Đồng bộ mã nguồn sang thư mục Android Native
     cd ../../apps/mobile_ceo1983
     npx cap copy android

     # Bước 3: Biên dịch APK bằng Gradle Wrapper
     cd android
     .\gradlew.bat assembleDebug
     ```
   - Gói APK thành phẩm xuất ra tại:
     `apps/mobile_ceo1983/android/app/build/outputs/apk/debug/app-debug.apk`
     (hoặc đồng bộ sang `release_apk/CEO1983-app-latest.apk`).
3. **Quy Trình Triển Khai Siêu Tốc (Fast Deploy)**:
   - Sử dụng script:
     ```powershell
     .\deploy-mobile.ps1
     ```
   - Tự động bỏ qua backend, tiết kiệm 1.5GB upload và rút ngắn thời gian deploy chỉ còn 1-2 phút.
