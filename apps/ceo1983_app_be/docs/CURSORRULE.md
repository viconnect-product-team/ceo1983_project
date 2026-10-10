# BACKEND CODING RULES (CURSORRULE) - CEO 1983 PROJECT
## Phân Hệ: Backend API NestJS (`apps/ceo1983_app_be`)

---

### [ĐIỀU LUẬT 1] KIẾN TRÚC MỎNG CONTROLLER - DÀY SERVICE (Thin Controller, Fat Service)
- **Controller Mỏng**: Chỉ đón nhận HTTP Request, trích xuất `@Body()`, `@Param()`, `@Query()`, gắn Decorator `@UseGuards()`, gọi Service tương ứng và trả kết quả.
- **Service Dày**: Chứa 100% logic nghiệp vụ, tính toán, kiểm tra quyền hạn, bọc khối try/catch và ném lỗi NestJS HttpException rõ ràng.
- **Giới Hạn Tệp Mã Nguồn**: Nghiêm cấm viết tệp dịch vụ hoặc controller vượt quá **2.000 dòng**. Khi phình to, bắt buộc áp dụng **Facade Pattern** và bóc tách thành các Sub-Services trong `services/`.

---

### [ĐIỀU LUẬT 2] CẤM TUYỆT ĐỐI HARD DỮ LIỆU & MOCK DATA (Zero Mock Data)
- **CẤM** tạo các mảng dữ liệu tĩnh giả lập trong backend (ví dụ: `const MOCK_EVENTS = [...]`).
- 100% dữ liệu phải đọc/ghi từ PostgreSQL qua Prisma Client.
- Khi truy vấn không có kết quả: Trả về mảng rỗng `[]` hoặc ném `NotFoundException("Không tìm thấy dữ liệu")`, không tự chế bản ghi giả.

---

### [ĐIỀU LUẬT 3] TYPE-SAFETY TUYỆT ĐỐI (100% TypeScript)
- **CẤM** dùng kiểu `any` trong toàn bộ code mới hoặc code được refactor.
- Sử dụng DTO được định nghĩa chặt chẽ với `class-validator` (`@IsString()`, `@IsOptional()`, `@IsUUID()`, `@IsNumber()`) hoặc `zod`.
- Nếu kiểu dữ liệu chưa xác định, dùng `unknown`, Generics `<T>`, hoặc `Record<string, unknown>`.

---

### [ĐIỀU LUẬT 4] AN TOÀN TRUY VẤN SQL & PRISMA
- Tuyệt đối không nối chuỗi thô khi chạy `$queryRaw`.
- Luôn sử dụng Tagged Template Literals: `this.prisma.$queryRaw\`SELECT ... WHERE id = \${id}::uuid\``.
- Luôn kiểm tra ràng buộc khóa ngoại và tính toàn vẹn dữ liệu trước khi thực thi lệnh `DELETE`.

---

### [ĐIỀU LUẬT 5] PHÂN QUYỀN RBAC & DỮ LIỆU PHẠM VI
- Chuẩn hóa đúng 5 vai trò: `quan_tri`, `admin`, `tong_thu_ky`, `truong_ban`, `member`.
- Chuẩn hóa đúng 7 ban chuyên môn: Ban Thành viên, Ban xúc tiến, Ban thiện nguyện, Ban truyền thông, Ban quản trị, Ban tài chính, Hội viên ceo1983.
- Mọi thao tác thay đổi vai trò hoặc duyệt thành viên chỉ dành cho `quan_tri` hoặc `admin`; chặn 403 Forbidden nếu vi phạm.
