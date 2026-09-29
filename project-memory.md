# CEO 1983 - Project Memory & Standard Architecture

## 1. HỆ THỐNG 5 TỆP TÀI LIỆU CHUẨN CHO AI (MANDATORY AI DOCS)
Mọi AI Agent khi can thiệp vào codebase `ceo1983_project` bắt buộc phải cập nhật đầy đủ và đồng bộ 5 tệp:
1. `.cursorrules`: Bộ luật cốt lõi, quy tắc kiến trúc, quy chuẩn màu sắc và hành vi.
2. `docs/tech-spec.md`: Đặc tả kỹ thuật, schema, endpoints, data flow.
3. `skills/create-crud.md`: Kỹ năng triển khai CRUD chuẩn Feature-First / Domain Co-location.
4. `docs/developer-checklist.md`: Tiêu chuẩn nghiệm thu, checklist chất lượng mã và bảo toàn giao diện.
5. `project-memory.md` / `TECHNICAL_MEMORY.md`: Nhật ký kiến trúc, trạng thái các tính năng, luồng nghiệp vụ.

---

## 2. QUY CHUẨN THIẾT KẾ & DỮ LIỆU (ZERO-TOLERANCE RULES)
- **Màu sắc thương hiệu bắt buộc**:
  - Primary Brand: Deep Cobalt Navy (`#003B95`)
  - Accent / CTA: Warm Amber Gold (`#F59E0B`)
  - Tuyệt đối KHÔNG tự ý đổi sang màu vàng sâm banh gradient, nền tối `#001D4A` hay nút bấm màu đen khi chưa có sự cho phép của người dùng.
- **Dữ liệu thực tế (Zero fake data)**:
  - Dữ liệu phải phản ánh đúng cơ cấu tổ chức Hiệp hội CEO 1983 (Ban Điều Hành, Ban Truyền Thông, Ban Thành Viên, Ban Tài Chính, Ban Thiện Nguyện & An Sinh Xã Hội, Ban Xúc Tiến Thương Mại).
  - Nghiêm cấm tạo mock data linh tinh, vô nghĩa.

---

## 3. PHÂN HỆ QUẢN LÝ CÔNG VIỆC (TASK MANAGEMENT - V2.2.0)
- **Vị trí thư mục**: `apps/ceo1983_app_fe/src/features/tasks/`
- **5 Dạng hiển thị chuẩn (5 View Modes)**:
  1. **Bảng (Table View)**: `TaskTableView.tsx` - Cột STT, mã CV, tiêu đề + badge cuộc họp trực tuyến, ban, người thực hiện, độ ưu tiên, hạn chót, tiến độ %, trạng thái, thao tác.
  2. **Lưới / Kanban (Grid View)**: `TaskKanbanBoard.tsx` - Bố cục flex trượt ngang chống dính chùm, tích hợp thanh điều khiển **Zoom to / Zoom nhỏ (Kích thước)** 3 cấp độ (Thu nhỏ 280px, Tiêu chuẩn 345px, Phóng to 410px), thẻ card thoáng đãng, sắc nét.
  3. **Lịch (Calendar View)**: `TaskCalendarView.tsx` - Lưới tháng 7 ngày/tuần, badge công việc theo ngày hết hạn kèm ký hiệu video meeting và nút thêm nhanh việc theo ngày.
  4. **Biểu đồ Thống kê (Statistics Dashboard)**: `TaskStatisticsChartView.tsx` - Dashboard phân tích chuyên sâu với Recharts (Donut cơ cấu trạng thái, Bar chart khối lượng theo ban chuyên môn, Area chart tiến độ TB %, Bảng xếp hạng hiệu suất các ban và sub-tab Timeline Gantt).
  5. **Cây đơn vị (Org Tree View)**: `TaskOrgTreeView.tsx` - Cây cơ cấu phân cấp Hiệp hội CEO 1983 -> Các Ban chuyên môn, thống kê % tiến độ trung bình, số lượng việc, và nút "Giao việc" theo từng ban.
- **Tích hợp Cuộc họp trực tuyến (Online Meeting Integration)**:
  - Hỗ trợ 3 nền tảng: **Zoom**, **Google Meet**, **UniWork**.
  - Trường dữ liệu: `meeting: { enabled, platform, link, note }`.
  - Hiển thị badge họp trực tiếp trên tất cả các view và Drawer chi tiết công việc.


---

## 4. MA TRẬN PHÂN QUYỀN CHUẨN RBAC (5 ROLES x FEATURE COLUMNS)
- **Vị trí**: `apps/ceo1983_app_fe/src/routes/permissions.tsx` & `src/components/dashboard/RbacPermissionMatrix.tsx`
- **Tách biệt 2 Tab độc lập (Không gộp chung quản trị tài khoản vào ma trận quyền)**:
  - **Tab 1: Ma Trận Phân Quyền 5 Cấp Bậc (Vai Trò x Chức Năng)**:
    - **Hàng bên trái (Rows)**: Đúng 5 cấp bậc chuẩn:
      1. `Quản trị`: Xem, Sửa, Xóa, Phân quyền (Toàn quyền)
      2. `Admin`: Xem, Sửa, Phân quyền
      3. `Tổng thư ký`: Xem, Sửa
      4. `Trưởng ban` (bao gồm Ban Thiện Nguyện & An Sinh Xã Hội mới): Xem, Sửa
      5. `Hội viên`: Chỉ Xem
    - **Cột bên trên (Columns)**: Từng chức năng riêng lẻ (Hội viên, Sự kiện, Cuộc họp, Công việc, Thiện nguyện & An sinh, Tài chính, Giao thương, Bầu cử, Truyền thông, Hệ thống...).
    - **Ô giao điểm (Cells)**: Render các pill/checkbox thao tác trực quan tuân thủ đúng giới hạn quyền của từng vai trò.
  - **Tab 2: Phân Quyền Thao Tác Trực Tiếp Cho Từng Tài Khoản Cá Nhân**.
- **Tính năng nâng cao**: Thêm chức năng tùy biến, sửa tên chức năng, xóa chức năng, bộ lọc nhóm phân hệ và thống kê KPI trực quan.
- **Đã dọn dẹp mã cũ**: Loại bỏ hoàn toàn khối "Ma Trận Chi Tiết Phân Quyền 8 Cấp Bậc" cũ bị trùng lặp và gây rối mắt.

---

## 5. PHÂN HỆ QUẢN LÝ CUỘC HỌP & ĐIỀU PHỐI KHẨN CẤP (MEETINGS REFACTOR)
- **Vị trí**: `apps/ceo1983_app_fe/src/routes/meetings.tsx` & `src/lib/meetings.functions.ts`
- **3 Nền tảng họp trực tuyến chuẩn**:
  1. **Zoom Meeting**: Họp trực tuyến bảo mật cao kèm meeting URL + passcode.
  2. **Google Meet**: Họp trực tiếp trên nền web không cần cài đặt.
  3. **UniWork Meet**: Nền tảng hội họp số nội bộ của hệ sinh thái UniWork.
- **Thẩm quyền tạo cuộc họp**:
  - Giới hạn đúng 4 vai trò có thẩm quyền: **Chủ tịch**, **Tổng thư ký**, **Admin**, **Trưởng ban**.
  - Lưu trữ đầy đủ danh tính người tạo: Tên, Chức vụ, SĐT liên hệ, Email.
- **Cơ chế xử lý Cuộc họp đột ngột quan trọng (Khẩn cấp) & Xung đột lịch**:
  - Cờ đánh dấu cuộc họp khẩn cấp (`isUrgent`) kèm lý do triệu tập đột xuất (`urgentReason`).
  - Nút **"Liên Hệ Điều Phối"**: Mở modal hiển thị ngay thông tin người tạo cuộc họp kèm gọi điện thoại nhanh (`tel:`) và gửi email (`mailto:`) để thống nhất điều phối.
  - Chức năng **"Sắp Xếp Lại Lịch Họp (Reschedule)"**: Cho phép người triệu tập/admin dời ngày/giờ họp và tự động phát thông báo broadcast điều chỉnh đến các bên.
  - Chức năng **"Xóa Cuộc Họp (Delete)"**: Nút xóa màu đỏ kèm modal xác nhận an toàn, thu hồi lịch và xóa vĩnh viễn khỏi hệ thống.

