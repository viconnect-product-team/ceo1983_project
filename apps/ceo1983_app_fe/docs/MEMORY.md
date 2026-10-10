# FRONTEND ARCHITECTURE MEMORY - CEO 1983 PROJECT
## Phân Hệ: Frontend Web & PWA (`apps/ceo1983_app_fe`)

---

### 1. Lịch Sử Các Quyết Định Kiến Trúc Trọng Yếu (Architectural Decisions)
1. **Dọn Dẹp 21 Route Thừa `/m/*` Bằng 301 Client Redirect (Hiệp 1)**:
   - Các route lá nhân bản (`m.index.tsx`, `m.card.tsx`, `m.events.tsx`, ...) được thay thế hoàn toàn bằng cơ chế chuyển hướng client-side `redirect({ to: '/association/...' })`.
   - Cắt giảm hơn **8.500 dòng code thừa** mà vẫn giữ 100% khả năng tương thích ngược với các liên kết cũ trên thiết bị di động.
2. **Thu Gọn Tệp Types Supabase Rác (Hiệp 1)**:
   - Tệp `apps/ceo1983_app_fe/src/integrations/supabase/types.ts` chứa schema Supabase rác từ 10.347 dòng được rút gọn xuống 35 dòng interface chung, loại bỏ hơn **10.310 dòng mã chết**.
3. **Phân Rã 4 Mega-Routes Frontend Vượt Ngưỡng 2.000 Dòng (Hiệp 3)**:
   - `association.messages.tsx`: 5.353 dòng $\rightarrow$ 153 dòng (-97%), phân rã thành 7 modules trong `src/components/messages/`.
   - `association.products.tsx`: 3.110 dòng $\rightarrow$ 2.340 dòng (-770 dòng), bóc tách 5 modals trong `src/components/marketplace/modals/`.
   - `association.events.tsx`: 2.490 dòng $\rightarrow$ 1.660 dòng (-830 dòng), bóc tách 5 modals trong `src/components/events/modals/`.
   - `association.opportunities.tsx`: 2.180 dòng $\rightarrow$ 1.286 dòng (-894 dòng), bóc tách 3 modals trong `src/components/opportunities/modals/`.
4. **Khắc Phục Hiện Tượng "Bị Chạm" / Nuốt Cú Chạm Trên Mobile (Log 209)**:
   - Loại bỏ `e.preventDefault()` trong `touchend` listener tại `__root.tsx` vốn làm hủy synthetic click của trình duyệt.
   - Gỡ bỏ bộ lọc Gaussian Blur nặng nề `blur(100px)` và `blur(120px)` trên diện tích toàn màn hình tại `styles.css` làm tụt FPS GPU, thay bằng radial-gradient nhẹ nhàng đạt chuẩn 60-120fps.
   - Gỡ khóa `transform` trong `PullToRefresh.tsx` khi nghỉ giúp cuộn mượt mà.
5. **Tích Hợp Trình Xem Bảng Tính Excel Trực Tiếp In-App (Log 211)**:
   - Tích hợp SheetJS `xlsx` v0.18.5 và modal `ExcelViewerModal.tsx` cho phép đọc trực tiếp file `.xlsx`, `.xls`, `.csv` trên cả Web và Mobile.

---

### 2. Các Lưu Ý Kỹ Thuật (Gotchas)
- **Thư Viện Toast**: Dự án sử dụng `import { toast } from "sonner";` (KHÔNG dùng `react-hot-toast`).
- **Định dạng Tiền tệ**: Sử dụng `StandardCurrencyInput` từ `@/components/common/StandardCurrencyInput`.
- **Tải lên & Hiển thị Media**: Sử dụng `uploadFileToNest` và `resolveMediaUrl` từ `@/lib/api-client`.
- **Định dạng Ngày tháng**: Sử dụng `formatDisplayDate` từ `@/lib/date-format`.
