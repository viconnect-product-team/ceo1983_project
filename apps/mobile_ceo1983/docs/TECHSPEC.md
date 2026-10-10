# MOBILE TECHNICAL SPECIFICATION (TECHSPEC) - CEO 1983 PROJECT
## Phân Hệ: Mobile App Android / iOS Wrapper (`apps/mobile_ceo1983`)

---

### 1. Kiến Trúc & Nền Tảng
- **Wrapper Engine**: Capacitor 8.5.0 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`).
- **Ứng Dụng Đích**: CLB Doanh Nhân CEO 1983 Mobile (`connect.vn.vione_app`).
- **Nạp Giao Diện (WebView Source)**:
  - Cấu hình trong `capacitor.config.ts`.
  - Môi trường Local: Nạp từ thư mục `www/` hoặc dev server `http://10.0.2.2:5002` / `http://localhost:5002`.
  - Môi trường Live Server: Trỏ về máy chủ hiệp hội `https://14.225.217.232:5444/association`.

---

### 2. Cấu Trúc Native Android
```
apps/mobile_ceo1983/
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   # Cấu hình phần cứng: android:hardwareAccelerated="true"
│   │   │   ├── java/.../MainActivity.java # Tinh chỉnh WebView Layer, Pre-Rasterization, Overscroll
│   │   │   └── res/                  # App Icons, Splash Screen, XML config
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradlew.bat                   # Gradle Wrapper build APK
├── capacitor.config.ts               # File cấu hình server URL và plugin Capacitor
└── package.json
```

---

### 3. Tinh Chỉnh WebView Native Tối Ưu (Log 209)
Trong `MainActivity.java`:
```java
// Bật tăng tốc phần cứng Native
webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

// Tắt overscroll giật bóng nước của Android
webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

// Bật vẽ trước nội dung ngoài màn hình (Pre-Rasterization)
webView.getSettings().setOffscreenPreRaster(true);
```
Giúp ứng dụng duy trì 60-120 FPS khi cuộn danh sách hội viên, sự kiện và tin tức.
