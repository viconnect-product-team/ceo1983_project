# FRONTEND CODING RULES (CURSORRULE) - CEO 1983 PROJECT
## Phân Hệ: Frontend Web & PWA (`apps/ceo1983_app_fe`)

---

### [ĐIỀU LUẬT 1] CHUẨN 3 MÀU CEO 1983 TỐI THƯỢNG - CẤM TỰ BỊA MÀU LINH TINH
- Toàn bộ giao diện hội viên và quản trị chỉ được phép phối hợp trong **3 tông màu chuẩn CEO 1983**:
  1. **Deep Cobalt Navy** (`#003B95` / `#002B70` / `#0A1A3A`): Màu nhận diện thương hiệu chủ đạo cho Nút chính, Header, Tab điều hướng đang chọn, Huy hiệu chính thức.
  2. **Warm Amber Gold** (`#F59E0B` / `#D97706` / `#B45309`): Màu điểm nhấn hoàng gia cho viền thẻ hội viên VIP, icon sao vàng, nút Quan tâm, giá trị Deal CRM.
  3. **Neutral Contrast** (`#FFFFFF` / `#0F172A` / `#1E293B`): Nền trắng thanh lịch (`#FFFFFF`), thẻ nền navy đen sang trọng (`#0F172A`), chữ tương phản cao.
- **CẤM TUYỆT ĐỐI**:
  - Không dùng màu tím (`purple`), hồng (`pink`), xanh lá chuối (`lime`), xanh neon, cyan/teal sặc sỡ bừa bãi.
  - Không tự ý thêm màu gradient cầu vồng làm phá vỡ tính đồng bộ sang trọng của CLB Doanh Nhân.

---

### [ĐIỀU LUẬT 2] CẤM HARD DỮ LIỆU & CẤM MOCK DỮ LIỆU (Zero Mock Data)
- **CẤM** tạo các mảng dữ liệu tĩnh giả lập trong component (ví dụ: `const mockEvents = [...]`, `const mockProducts = [...]`).
- 100% dữ liệu phải nạp từ PostgreSQL thông qua NestJS Backend RESTful API (`fetchNestApi`, Prisma queries).
- Khi danh sách trống: BẮT BUỘC hiển thị Empty State trang trọng (icon nhạt, thông báo `"Chưa có dữ liệu"`, kèm nút kêu gọi hành động Tạo mới).

---

### [ĐIỀU LUẬT 3] CẤM TUYỆT ĐỐI SUPABASE CLIENT TRÊN FRONTEND
- Tuyệt đối KHÔNG import `@supabase/supabase-js` hay gọi `supabase.from(...)` trong bất kỳ component nào.
- 100% kết nối dữ liệu phải thông qua NestJS API Gateway (`fetchNestApi`) với Bearer JWT Token.

---

### [ĐIỀU LUẬT 4] BÓC TÁCH MODAL & GIỚI HẠN TỆP ROUTE (< 2.000 dòng)
- Nghiêm cấm viết các tệp Route vượt quá 2.000 dòng mã nguồn.
- Toàn bộ Modals của màn hình phải được bóc tách vào `src/components/<feature>/modals/` kèm tệp barrel `index.ts`.
- Mỗi Modal là một Component độc lập, tự quản lý Portal an toàn (`createPortal(..., document.body)`), nhận Typed Props rõ ràng và sử dụng Sonner Toast (`import { toast } from "sonner"`).

---

### [ĐIỀU LUẬT 5] TỐI GIẢN NÚT BẤM BẰNG ICON ĐƠN SẮC
- Không làm rối giao diện bằng các nút bấm chữ cồng kềnh.
- Sử dụng các icon Lucide đơn sắc tinh tế (`<MessageSquare className="size-4" />`, `<Phone className="size-4" />`, `<Handshake className="size-4" />`).
- Chỉ dùng nút chữ lớn cho hành động quyết định (Đăng ký, Xác nhận, Đăng cơ hội).
