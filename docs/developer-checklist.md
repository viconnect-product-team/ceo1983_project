# DEFINITION OF DONE & DEVELOPER CHECKLIST
## Bộ tiêu chuẩn nghiệm thu tính năng dành cho Kỹ sư phần mềm & AI Agents
**Dự án:** Hệ sinh thái Hiệp hội Doanh nhân CEO 1983 | **Vai trò:** QA Lead

Mọi Pull Request, tính năng mới hoặc bản sửa lỗi (Bug fix) trước khi merge vào nhánh chính hoặc đưa lên môi trường Production BẮT BUỘC phải tích chọn và vượt qua 100% các tiêu chí kiểm thử dưới đây.

---

## 1. KIỂM SOÁT ĐẦU VÀO VÀ VALIDATION (DATA INTEGRITY)

- [ ] **1.1. Khai báo DTO tường minh, không sử dụng kiểu `any`**
  Mọi payload gửi lên từ client đều phải có Class DTO hoặc Zod Schema định nghĩa rõ ràng kiểu dữ liệu của từng trường (`string`, `number`, `boolean`, `array`).
  ```typescript
  // ✅ Chuẩn dự án:
  export class CreatePollDto {
    title!: string;
    description?: string;
    options!: string[];
    startDate?: string;
    endDate?: string;
  }
  ```

- [ ] **1.2. Kiểm tra tính hợp lệ của tham số ID (UUID Check)**
  Tất cả các tham số URL dạng ID (`:id`) phải được kiểm tra định dạng UUID hợp lệ trước khi truy vấn vào cơ sở dữ liệu để tránh crash câu lệnh SQL.
  ```typescript
  // ✅ Chuẩn dự án:
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new BadRequestException('ID không đúng định dạng UUID hợp lệ');
  }
  ```

---

## 2. BẢO MẬT & PHÂN QUYỀN (SECURITY & AUTHORIZATION)

- [ ] **2.1. Bảo vệ Endpoint bằng `JwtAuthGuard` & `RolesGuard`**
  Tất cả Controller hoặc Endpoint yêu cầu xác thực phải được bọc bởi guard chuẩn của hệ thống:
  ```typescript
  // ✅ Chuẩn dự án:
  @Controller('voting')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class VotingController {}
  ```

- [ ] **2.2. Khai báo danh sách vai trò được phép truy cập (`@Roles`)**
  Các thao tác nhạy cảm (Tạo, Sửa, Xóa cấu hình, Duyệt hội viên) phải được phân quyền rõ ràng cho ban quản trị:
  ```typescript
  // ✅ Chuẩn dự án:
  @Delete('polls/:id')
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btc')
  async deletePoll(@Request() req: any, @Param('id') id: string) {
    return this.votingService.deletePoll(req.user.id || req.user.sub, id);
  }
  ```

- [ ] **2.3. Trích xuất thông tin người dùng từ JWT Token**
  Tuyệt đối không nhận `userId` từ Body của Request để tránh giả mạo danh tính. Luôn trích xuất từ `req.user.id || req.user.sub`:
  ```typescript
  const currentUserId = req.user.id || req.user.sub;
  ```

- [ ] **2.4. Phân vùng dữ liệu chi hội (`DataScopeInterceptor`)**
  Nếu API phục vụ theo phân quyền chi hội/ban ngành, phải đính kèm interceptor:
  ```typescript
  @UseInterceptors(DataScopeInterceptor)
  @DataScope('sponsor')
  ```

---

## 3. TÀI LIỆU HÓA API (SWAGGER / OPENAPI SPEC)

- [ ] **3.1. Đầy đủ Annotations trên Controller và Method**
  Cung cấp tóm tắt hành động (`@ApiOperation`), thẻ nhóm (`@ApiTags`), và định dạng dữ liệu trả về (`@ApiResponse`):
  ```typescript
  // ✅ Chuẩn dự án:
  @ApiTags('Sponsors')
  @Controller('sponsors')
  export class SponsorsController {
    @ApiOperation({ summary: 'Lấy danh sách các gói tài trợ của hiệp hội' })
    @ApiResponse({ status: 200, description: 'Danh sách gói tài trợ thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực JWT' })
    @Get('packages')
    async listPackages() {}
  }
  ```

---

## 4. XỬ LÝ LỖI & GHI LOG (ERROR HANDLING & LOGGING)

- [ ] **4.1. Ném đúng mã lỗi HTTP Exception của NestJS**
  Không trả về thông báo lỗi dạng string thô hoặc HTTP 200 chứa status `error`. Luôn ném đúng ngoại lệ:
  ```typescript
  // ✅ Chuẩn dự án:
  if (!item) {
    throw new NotFoundException(`Không tìm thấy bản ghi với ID ${id}`);
  }
  if (item.status === 'closed') {
    throw new BadRequestException('Cuộc biểu quyết này đã kết thúc, không thể bỏ phiếu');
  }
  ```

- [ ] **4.2. Logging chuẩn hóa có tiền tố Module**
  Mọi lỗi bắt được trong khối `catch` phải được in log rõ ràng để DevOps/SRE dễ dàng tra cứu:
  ```typescript
  // ✅ Chuẩn dự án:
  try {
    // DB Query...
  } catch (err: unknown) {
    console.error('[VotingService] listPolls error:', err);
    return []; // Trả về fallback an toàn nếu cần
  }
  ```

- [ ] **4.3. Chống rò rỉ thông tin nhạy cảm (No Stack Trace to Client)**
  Không bao giờ ném trực tiếp toàn bộ error stack trace hoặc thông số chuỗi kết nối Database về phía Frontend.

---

## 5. TIÊU CHUẨN GIAO DIỆN & TRẢI NGHIỆM (FRONTEND & UI/UX)

- [ ] **5.1. Quy tắc màu sắc chuẩn thương hiệu CEO 1983**
  - **Màu chủ đạo (Primary):** Deep Cobalt Navy (`#003B95` / `#00224F`) cho Nút chính, Header, Thanh điều hướng, Huy hiệu (`bg-[#003B95]`, chữ trắng `#FFFFFF`).
  - **Màu nhấn hoàng gia (Accent):** Warm Amber Gold (`#F59E0B` / `#D97706`) cho Huy hiệu VIP, Viền nổi bật, Sao danh dự, Điểm nhấn.
  - **Tuyệt đối KHÔNG sử dụng màu vàng sâm banh gradient của ViOne cho CEO 1983.**
  - **Tuyệt đối KHÔNG sử dụng nút màu đen đặc ở Chế độ sáng (Light Mode).**

- [ ] **5.2. Quản lý trạng thái tải (Loading, Empty, Error)**
  Mọi component lấy dữ liệu từ API đều phải có đầy đủ 3 trạng thái:
  - Khi đang tải: Hiển thị Skeleton hoặc Spinner tròn gradient.
  - Khi rỗng: Hiển thị Empty State kèm icon minh họa và nút điều hướng hoặc hành động tạo mới.
  - Khi lỗi: Hiển thị thông báo thân thiện và nút "Thử lại".

- [ ] **5.3. Phản hồi hành động tức thì với Toast (Sonner)**
  Sau khi Create/Update/Delete thành công, bắt buộc hiển thị toast thông báo và cập nhật lại cache dữ liệu:
  ```typescript
  // ✅ Chuẩn dự án:
  toast.success('🎉 Đã xác nhận tham gia sự kiện thành công!');
  queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
  ```

- [ ] **5.4. Tương thích PWA & Safari trên thiết bị iOS**
  - Đảm bảo các thẻ `apple-touch-icon` có kích thước 180x180, nền ĐẶC `#001D4A`, không có alpha channel.
  - Hỗ trợ đầy đủ viewport-fit=cover, ngăn chặn zoom nhầm khi gõ phím trên iPhone.

- [ ] **5.5. Đóng gói theo thư mục tính năng (Feature-First & RESTful API Co-location)**
  - Tất cả các file thuộc một tính năng (code API RESTful, UI components, types, barrel export) bắt buộc phải nằm chung trong đúng thư mục mang tên tính năng đó (`src/features/<ten-chuc-nang>/`):
    + `api.ts`: Các hàm gọi API chuẩn RESTful (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
    + `types.ts`: Interface, Types, Status Enums.
    + `components/`: Toàn bộ UI component phục vụ riêng cho tính năng.
    + `index.ts`: File index xuất khẩu đầy đủ api, types, components.
  - Tuyệt đối không để file code bị phân tán rải rác ngoài thư mục chức năng.

- [ ] **5.6. Hỗ trợ đủ 5 Dạng Hiển Thị Cho Màn Hình Quản Lý Công Việc**
  - Màn hình Quản lý Công việc & Giao việc (`/tasks`) bắt buộc hỗ trợ đầy đủ 5 dạng hiển thị:
    1. Dạng bảng (Table View - chi tiết theo cột)
    2. Dạng lưới (Kanban Board - bố cục flex trượt ngang chống dính chùm, thanh điều khiển **Zoom to / Zoom nhỏ** 3 cấp độ: Thu nhỏ 280px, Tiêu chuẩn 345px, Phóng to 410px)
    3. Dạng lịch (Calendar Month View - lịch tháng và các mốc họp)
    4. Dạng biểu đồ thống kê (Statistics Dashboard - biểu đồ tròn Donut cơ cấu trạng thái, Bar chart khối lượng theo ban, Area chart tiến độ TB, Bảng xếp hạng hiệu suất các ban và sub-tab Timeline Gantt)
    5. Dạng cây đơn vị (Org Unit Tree View - phân cấp ban chuyên trách CEO 1983)

- [ ] **5.7. Tích hợp & Quản lý Cuộc Họp Trực Tuyến Đa Nền Tảng (Meetings Refactor)**
  - Hỗ trợ đúng 3 nền tảng chuẩn: **Zoom Meeting**, **Google Meet**, **UniWork Meet**.
  - Giới hạn thẩm quyền tạo cuộc họp cho đúng 4 cấp bậc: **Chủ tịch**, **Tổng thư ký**, **Admin**, **Trưởng ban** (kèm Tên, SĐT, Email người triệu tập).
  - Xử lý cuộc họp đột ngột quan trọng (Khẩn cấp):
    + Cờ khẩn cấp `isUrgent` kèm lý do triệu tập đột xuất `urgentReason`.
    + Nút "Liên hệ điều phối" mở modal thông tin người tạo kèm gọi điện thoại trực tiếp (`tel:`) và gửi email (`mailto:`).
    + Chức năng "Sắp xếp lại lịch họp (Reschedule)" cho phép cập nhật ngày/giờ mới và tự động phát thông báo điều chỉnh.
    + Chức năng "Xóa cuộc họp" với modal xác nhận an toàn giúp thu hồi và xóa sạch dữ liệu.

- [ ] **5.8. Ma Trận Phân Quyền Chuẩn RBAC (5 Hàng Vai Trò x Cột Chức Năng Riêng Lẻ)**
  - Tách biệt 2 Tab độc lập, không gộp chung quản trị tài khoản vào ma trận vai trò:
    + **Tab 1**: Ma Trận Phân Quyền 5 Cấp Bậc (Vai Trò x Chức Năng).
    + **Tab 2**: Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản Cá Nhân.
  - Hàng bên trái (Rows) là đúng 5 vai trò chuẩn:
    1. Quản trị (Xem, Sửa, Xóa, Phân quyền)
    2. Admin (Xem, Sửa, Phân quyền)
    3. Tổng thư ký (Xem, Sửa)
    4. Trưởng ban (Xem, Sửa - bao gồm Ban Thiện Nguyện & An Sinh Xã Hội)
    5. Hội viên (Chỉ Xem)
  - Cột bên trên (Columns) là các chức năng riêng lẻ (Hội viên, Công việc, Cuộc họp, Sự kiện, Ban thiện nguyện, Tài chính, Giao thương, Bầu cử, Truyền thông, Hệ thống...).
  - Các ô giao điểm hiển thị pill/checkbox thao tác trực quan tuân thủ đúng giới hạn quyền của từng vai trò.

- [ ] **5.9. Tuân thủ Nguyên tắc Dữ Liệu & Thương Hiệu**
  - ❌ Tuyệt đối không tự động fake dữ liệu tùy tiện; dùng dữ liệu có thật và logic thực tế của CEO 1983.
  - ❌ Tuyệt đối không tự ý sửa bảng màu ngoài chuẩn Deep Cobalt Navy (`#003B95`) và Warm Amber Gold (`#F59E0B`).

---

## 6. KIỂM THỬ ĐÓNG GÓI & KHÔNG CÒN LỖI (ZERO LINT & ZERO TYPE ERROR)

- [ ] **6.1. Build Frontend thành công không lỗi TypeScript**
  ```powershell
  npm run build
  ```
  Kết quả phải báo: `✓ built in ...` và `i Generated .output/nitro.json`.

- [ ] **6.2. Dọn sạch Dead Code và Console Log rác**
  Không còn file `.bak`, file log tạm thời, biến unused variable hay `console.log('debug here')`.
