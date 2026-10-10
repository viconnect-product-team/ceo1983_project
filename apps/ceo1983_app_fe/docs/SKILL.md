# FRONTEND AI SKILL - CEO 1983 PROJECT
## Phân Hệ: Frontend Web & PWA (`apps/ceo1983_app_fe`)

---

### 1. Giới Thiệu & Mục Đích Kỹ Năng
Kỹ năng này cung cấp toàn bộ hướng dẫn vận hành, tiêu chuẩn viết mã, quy chuẩn thiết kế giao diện và quy trình kiểm thử tự động dành cho trí tuệ nhân tạo (AI Assistant) trên phân hệ **Frontend React / TanStack Router** của hệ sinh thái **CEO 1983 Project**.

---

### 2. Nguyên Tắc Hoạt Động Cốt Lõi (Iron Rules)
1. **Tuyệt Đối Không Tự Ý Chạy Git Push / Git Commit**:
   - Mọi thay đổi mã nguồn chỉ được phép lưu cục bộ (Local).
   - Quyền commit và push hoàn toàn thuộc về người dùng.
2. **Kiểm Tra Biên Dịch Type-Check Bắt Buộc (Exit Code 0)**:
   - Trước khi hoàn thành bất kỳ nhiệm vụ nào, BẮT BUỘC thực thi:
     ```powershell
     npx tsc --noEmit
     ```
   - Lệnh phải trả về **Exit code 0 (0 errors)**. Tuyệt đối không để sót biến chưa khai báo, lỗi cú pháp hoặc gạch chân đỏ trong IDE.
3. **CHỈ SỬ DỤNG ĐÚNG 3 MÀU CHUẨN CEO 1983 - CẤM TỰ TẠO MÀU LINH TINH**:
   - Màu 1: **Deep Cobalt Navy** (`#003B95` / `#002B70` / `#0A1A3A`) - Nút chính, Header, Thanh điều hướng, Huy hiệu VIP.
   - Màu 2: **Warm Amber Gold** (`#F59E0B` / `#D97706` / `#B45309`) - Điểm nhấn, viền thẻ VIP, nút Quan tâm, con số Deal CRM.
   - Màu 3: **Neutral Contrast** (`#FFFFFF` / `#0F172A` / `#1E293B`) - Nền trắng sáng thanh lịch hoặc thẻ đen xám sang trọng.
   - **CẤM TUYỆT ĐỐI**: Màu tím, hồng, xanh neon, lime, màu cầu vồng.
4. **CẤM HARD DỮ LIỆU / CẤM MOCK DỮ LIỆU (Zero Mock Data)**:
   - 100% dữ liệu hiển thị phải nạp từ PostgreSQL thông qua NestJS Backend RESTful API (`fetchNestApi`, `uploadFileToNest`).
   - Tuyệt đối CẤM hardcode mảng dữ liệu giả lập (`const mockItems = [...]`) trong components.
   - Khi mảng rỗng -> Render Empty State trang trọng (`"Chưa có dữ liệu"`, kèm nút tạo/đăng mới).
5. **TRIỆT TIÊU HOÀN TOÀN SUPABASE CLIENT TRÊN FRONTEND**:
   - Tuyệt đối không import hoặc gọi `@supabase/supabase-js`.
   - Toàn bộ kết nối dữ liệu và upload file phải đi qua NestJS API.
6. **PHÂN RÃ TỆP KHỔNG LỒ & MODAL CHUYÊN TRÁCH (< 2.000 dòng)**:
   - Toàn bộ Modals của một màn hình phải được bóc tách vào `src/components/<feature>/modals/`.
   - Giữ cho tệp Route chính mỏng, sạch và dễ bảo trì.

---

### 3. Quy Trình Thêm/Sửa Route Trên Frontend
1. Khi tạo tệp route mới trong `src/routes/`:
   ```powershell
   npm run routes:gen
   ```
   Lệnh này tự động cập nhật cây định tuyến `src/routeTree.gen.ts`.
2. Chạy kiểm tra kiểu tĩnh:
   ```powershell
   npx tsc --noEmit
   ```
3. Đảm bảo chạy mượt mà không lỗi.
