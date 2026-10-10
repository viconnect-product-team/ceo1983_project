# BACKEND AI SKILL - CEO 1983 PROJECT
## Phân Hệ: Backend API NestJS (`apps/ceo1983_app_be`)

---

### 1. Giới Thiệu & Mục Đích Kỹ Năng
Kỹ năng này cung cấp toàn bộ hướng dẫn vận hành, tiêu chuẩn viết mã và quy trình kiểm tra tự động dành riêng cho trí tuệ nhân tạo (AI Assistant) và kỹ sư phát triển trên phân hệ **Backend NestJS** của hệ sinh thái **CEO 1983 Project**.

---

### 2. Nguyên Tắc Hoạt Động Cốt Lõi (Iron Rules)
1. **Tuyệt Đối Không Tự Ý Chạy Git Push / Git Commit**:
   - Mọi thay đổi mã nguồn chỉ được phép lưu cục bộ (Local).
   - Quyền commit và push hoàn toàn thuộc về người dùng.
2. **Kiểm Tra Biên Dịch Type-Check Bắt Buộc (Exit Code 0)**:
   - Trước khi hoàn thành bất kỳ nhiệm vụ nào, BẮT BUỘC thực thi:
     ```powershell
     npx tsc --noEmit -p tsconfig.json
     ```
   - Lệnh phải trả về **Exit code 0 (0 errors)**. Tuyệt đối không để sót biến chưa khai báo, lỗi kiểu dữ liệu hoặc gạch chân đỏ trong IDE.
3. **CẤM HARD DỮ LIỆU / CẤM MOCK DỮ LIỆU (Zero Mock Data)**:
   - 100% dữ liệu API trả về phải được truy vấn thật từ cơ sở dữ liệu **PostgreSQL** thông qua **Prisma ORM** (`packages/db`).
   - Tuyệt đối CẤM hardcode mảng dữ liệu giả lập (`const mockData = [...]`) trong Controller hoặc Service.
4. **Cách Ly Dự Án Tuyệt Đối (Project Isolation)**:
   - 100% code chỉ nằm trong workspace `ceo1983_project/`. Tuyệt đối không import hoặc chỉnh sửa mã từ `vione_project/`.

---

### 3. Quy Trình Phát Triển Module Backend
Khi bổ sung hoặc điều chỉnh bất kỳ tính năng nào trên Backend:
1. **Tạo/Cập nhật DTO**:
   - Đặt trong thư mục `dto/` của module.
   - Định nghĩa kiểu dữ liệu rõ ràng bằng TypeScript Class kết hợp `class-validator` hoặc schema `zod`.
   - CẤM dùng kiểu `any`.
2. **Xây dựng Service (Fat Service)**:
   - Chứa toàn bộ business logic, validate nghiệp vụ, tính toán thống kê và truy vấn CSDL.
   - Sử dụng Prisma Client (`this.prisma.<model>...`).
   - Xử lý ngoại lệ chuẩn NestJS: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`.
3. **Xây dựng Controller (Thin Controller)**:
   - Chỉ nhận request, liên kết DTO (`@Body()`, `@Query()`, `@Param()`), áp dụng Guards (`@UseGuards(JwtAuthGuard, RolesGuard)`), gọi Service và trả về response.
4. **Đăng Ký Vào Module**:
   - Khai báo Controller trong `controllers: [...]` và Service trong `providers: [...]` / `exports: [...]`.
5. **Chạy Type-Check**:
   - `npx tsc --noEmit -p tsconfig.json`.

---

### 4. Các Lệnh Thường Dùng
```powershell
# Chạy máy chủ backend ở chế độ phát triển
npm run start:dev

# Kiểm tra lỗi biên dịch TypeScript (BẮT BUỘC)
npx tsc --noEmit -p tsconfig.json

# Cập nhật Prisma Client sau khi thay đổi schema
npm run db:generate --workspace=@vibe/db
```
