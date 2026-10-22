---
name: ceo1983-crm
description: Kỹ năng chuyên sâu về nghiệp vụ, kỹ thuật, giao diện, bảng biểu Excel, biểu đồ Recharts và phân quyền RBAC cho Cổng Quản trị Web CRM CLB Doanh Nhân CEO 1983 (HanoiBA).
---

# KỸ NĂNG CHUYÊN SÂU PHÂN HỆ WEB CRM QUẢN TRỊ CEO 1983

Kỹ năng này cung cấp các chỉ dẫn nghiệp vụ, kỹ thuật và quy chuẩn phát triển cho phân hệ **Web CRM Quản Trị** dành cho Chủ tịch, Ban Điều Hành, Ban Thư Ký và 6 Ban Chuyên Môn của CLB Doanh Nhân CEO 1983.

---

## 1. Bản Chất & Phân Biệt Phân Hệ
- **Không nhầm lẫn với Mobile App**: CRM là ứng dụng máy tính để bàn (Desktop Web) phục vụ điều hành, ra quyết định và kiểm soát dữ liệu. Mọi component và route CRM đều nằm trong layout `DashboardLayout` với **Sidebar cố định bên trái**.
- **Người dùng trọng tâm**: 
  - `chu_tich`: Chủ tịch hiệp hội (toàn quyền chỉ đạo, giao việc toàn hiệp hội).
  - `admin` / `quan_tri`: Quản trị viên hệ thống (cấu hình kỹ thuật, RBAC, tài khoản).
  - `ban_dieu_hanh`: Lãnh đạo liên ban, giám sát 6 ban chuyên môn.
  - `tong_thu_ky`: Điều phối ban thư ký, quản lý công văn, văn thư, mẫu email.
  - `truong_ban_*`: Trưởng ban chuyên môn (Sự kiện, Xúc tiến, Hội viên, Truyền thông, Tài chính, Thiện nguyện).
  - `ban_thu_ky`: Nhân sự văn phòng thực thi nghiệp vụ.

---

## 2. Danh Mục Các Chức Năng CRM & Node Traceability
Khi nhận yêu cầu về CRM, Agent tra cứu mã Node tương ứng:
- **`[NODE-CRM-001]` Dashboard CLB (`/`, `/dashboard`)**: 4 thẻ KPI tổng quan, lịch sự kiện & cuộc họp tháng, cảnh báo hội phí.
- **`[NODE-CRM-002]` Thống Kê CLB 5 Chế Độ (`/analytics`)**: Menu Sidebar `BarChart3`. Hỗ trợ 5 view: Lưới KPI, Dashboard tổng hợp, Treemap ngành nghề, Donut ban ngành, Org Tree cơ cấu tổ chức. Hỗ trợ xuất/nhập Excel.
- **`[NODE-CRM-003]` Quản Trị Hội Viên 360° (`/members`)**: Hồ sơ hội viên, người đại diện. Modal sửa chỉ sửa trường cá nhân. Xóa 2 lựa chọn (xóa cty trước hoặc xóa cascade tất cả).
- **`[NODE-CRM-004]` Quản Trị Doanh Nghiệp Thành Viên (`/companies`)**: Quản lý MST, quy mô, website, ngành nghề. Cột 3 bảng bắt buộc là Tên doanh nghiệp.
- **`[NODE-CRM-005]` Quản Lý Tài Khoản & Gán Ban (`/accounts`)**: Gán vai trò BĐH và Ban chuyên môn. Bắt buộc gọi API `PATCH /members/:id/role-dept` lưu vào PostgreSQL. Nạp CSDL đè danh sách khi F5. 5 vai trò BĐH hiện ngay click 1.
- **`[NODE-CRM-006]` Ma Trận Phân Quyền RBAC (`/permissions`)**: 2 Tab độc lập: Tab 1 "Phân Quyền CRM Web", Tab 2 "Phân Quyền App Mobile". Quản lý 6 vai trò thành viên ban và 10 quyền di động.
- **`[NODE-CRM-007]` Quản Trị Sự Kiện & Lucky Draw (`/events`)**: Poster tùy biến khung giờ, Lịch trình Agenda chi tiết theo giờ, đếm Realtime tham dự, in mã QR điểm danh, cấu hình giải thưởng Lucky Draw.
- **`[NODE-CRM-008]` Quản Lý Cuộc Họp Ban (`/meetings`)**: Bản đồ tương tác chọn vị trí ghim đỏ Nominatim, tự động đồng bộ sang Sự kiện Mobile (`[Họp Ban]`) và đẩy lên Bảng tin Social (`EVENT_MEETING`).
- **`[NODE-CRM-009]` Quản Lý Thu Ngân Sách (`/income`)**: Bảng co dãn cột kéo chuột như Excel (`table-fixed`), Biểu đồ ComposedChart dòng tiền, PieChart nguồn thu & hạng tài trợ, Xuất/Nhập Excel.
- **`[NODE-CRM-010]` Quản Lý Chi & Tạm Ứng (`/expenses`)**: Phiếu chi, tạm ứng công việc, hoàn ứng tiền thừa. Biểu đồ tròn cơ cấu chi phí thực tế. Hỗ trợ import/export Excel.
- **`[NODE-CRM-011]` Báo Cáo Tài Chính Tổng Hợp (`/finance-report`)**: Dòng tiền Thu - Chi - Thặng Dư tích lũy. Lưới phân tích 4 hạng tài trợ.
- **`[NODE-CRM-012]` Giao Việc Ban Chuyên Môn (`/tasks`)**: Nêu rõ người giao (`[Giao việc từ ${creatorDisplayName}]`). Nút "Xem file" (Eye) xem trực tiếp Excel, Lightbox ảnh, PDF.
- **`[NODE-CRM-013]` Quản Trị Nhà Tài Trợ (`/sponsors`)**: 4 Hạng Kim Cương, Vàng, Bạc, Đồng; Quản lý quyền lợi hiển thị banner.
- **`[NODE-CRM-014]` Kho Tài Liệu & Mẫu Email (`/documents`)**: Mẫu email v3 bền vững, thẻ thân thiện `[Mã hội viên]`, `[Tên hội viên]`, đính kèm QR Inline CID.
- **`[NODE-CRM-015]` Quản Trị Biểu Quyết & Quay Thưởng (`/voting`)**: Quay số may mắn nạp động giải thưởng từ API, loại trừ người trúng, tự động trừ số lượng và dispatch email trúng thưởng.
- **`[NODE-CRM-016]` Quản Lý Bản Tin CLB (`/news-admin`)**: Soạn thảo tin tức, đính kèm ảnh đa phương tiện, phát hành bản tin tới bảng tin mạng xã hội App Mobile. Seed on Read khi bảng trống.
- **`[NODE-CRM-017]` Gia Hạn Hội Viên (`/renewal`)**: Khử prefix `RNW-`, truy vấn linh hoạt tránh lỗi ép kiểu UUID CSDL. LEFT JOIN tài khoản mới nhất.

---

## 3. Tiêu Chuẩn Giao Diện Bắt Buộc Của CRM
1. **Bảng dữ liệu kiểu Excel**:
   - Sử dụng `useResizableColumns` và `ResizableTh`.
   - Các cột nội dung dài dùng `TruncatedText` với tooltip Ant Design (nền đen `#1f1f1f`, chữ trắng, animate zoom).
2. **Biểu đồ trực quan Recharts**:
   - Palette màu chuẩn tài chính: Thu (Emerald `#059669`), Chi (Rose `#E11D48`), Thặng Dư (Gold `#F59E0B`), Navy (`#003B95`).
   - Mọi số tiền phải định dạng VNĐ có dấu phân tách hàng nghìn (`100.000.000 đ`).
3. **Đồng Bộ Dữ Liệu PostgreSQL (Pure NestJS)**:
   - 100% dữ liệu phải nạp và lưu vào CSDL PostgreSQL qua NestJS REST API (`fetchNestApi`).
   - TUYỆT ĐỐI KHÔNG dùng mock data hoặc hardcode mảng dữ liệu giả.

---

## 4. Quy Trình Kiểm Thử Trước Khi Bàn Giao
1. Sau khi chỉnh sửa code CRM, bắt buộc kiểm tra xem có ảnh hưởng đến route CRM khác hay không.
2. Chạy `npx tsc --noEmit` xác nhận 0 lỗi.
3. Cập nhật `MEMORY.md` và `.cursorrules`.
