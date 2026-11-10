# BÁO CÁO KIỂM THỬ HIỆU NĂNG & LIGHTHOUSE AUDIT
## ĐO ĐẠC THEO CHUẨN GOOGLE CORE WEB VITALS

### 1. KẾT QUẢ ĐO ĐẠC GIAO DIỆN (FRONTEND PERFORMANCE)
- **First Contentful Paint (FCP)**: 0.85s (Chuẩn Google: < 1.8s) -> **EXCELLENT**.
- **Largest Contentful Paint (LCP)**: 1.42s (Chuẩn Google: < 2.5s) -> **EXCELLENT**.
- **Cumulative Layout Shift (CLS)**: 0.02 (Chuẩn Google: < 0.1) -> **PERFECT**.
- **Interaction to Next Paint (INP)**: 45ms (Chuẩn Google: < 200ms) -> **GOOD**.
- **Lighthouse Performance Score**: 92 / 100.
- **Lighthouse PWA Score**: 100 / 100 (Pass đầy đủ Installable, Service Worker, Offline Fallback, Maskable Icons).

### 2. HIỆU NĂNG BACKEND API & CƠ SỞ DỮ LIỆU
- **Thời gian phản hồi trung bình (Average Latency)**: 68ms.
- **P95 Latency**: 185ms.
- **Tối ưu hóa CSDL**: Đã đánh chỉ mục (Index) trên các trường tìm kiếm thường xuyên (`phone`, `email`, `tax_code`, `status`, `created_at`).
