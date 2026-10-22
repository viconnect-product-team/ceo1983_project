---
name: ceo1983-node-navigator
description: Kỹ năng điều hướng và định vị luồng mã nguồn theo Functional Node Traceability Matrix. Giúp Agent xác định chính xác Node ID, phân hệ mục tiêu (CRM vs Mobile App) và các tệp liên quan trước khi sửa mã nguồn.
---

# KỸ NĂNG ĐIỀU HƯỚNG MA TRẬN NODE (CEO1983 NODE NAVIGATOR)

Kỹ năng này chịu trách nhiệm làm "hoa tiêu" cho Agent để **định danh đúng luồng chức năng, phân hệ mục tiêu và tệp nguồn cần xử lý**, ngăn chặn 100% tình trạng làm sai ý người dùng hoặc sửa nhầm file.

---

## 1. Nguyên Tắc Điều Hướng 3 Câu Hỏi (The 3-Question Rule)
Mỗi khi nhận một prompt từ người dùng, Agent phải tự trả lời 3 câu hỏi trước khi gọi bất kỳ công cụ chỉnh sửa code nào:

1. **Câu hỏi 1: Yêu cầu này phục vụ đối tượng nào?**
   - Nếu là Hội viên doanh nhân sử dụng điện thoại/màn hình nhỏ -> **Phân hệ Mobile App CEO 1983** -> Tra cứu `[NODE-APP-xxx]`.
   - Nếu là Ban Điều Hành, Chủ tịch, Trưởng ban, Kế toán, Admin quản trị trên máy tính -> **Phân hệ Web CRM Quản trị** -> Tra cứu `[NODE-CRM-xxx]`.
   - Nếu là Xác thực, CSDL, Socket, Triển khai hạ tầng -> **Phân hệ Core / DevOps** -> Tra cứu `[NODE-CORE-xxx]`.

2. **Câu hỏi 2: Yêu cầu này khớp với Node ID nào trong Ma trận?**
   - Tra cứu file [.agents/rules/node-matrix.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/.agents/rules/node-matrix.md).
   - Xác định chính xác Node ID (Ví dụ: `[NODE-APP-005]`, `[NODE-CRM-002]`, `[NODE-CRM-009]`, v.v.).

3. **Câu hỏi 3: Danh sách các tệp nguồn cấu thành Node đó là gì?**
   - Đọc danh sách Route, Component, API Endpoint, Service và CSDL Table từ bảng tra cứu Node.
   - Dùng `view_file` để đọc nội dung thực tế của các tệp đó trước khi ra quyết định sửa code.

---

## 2. Bảng Tra Nhanh Phân Hệ & Node Phổ Biến

| Từ Khóa Người Dùng Prompt | Phân Hệ Mục Tiêu | Node ID Tương Ứng | File Trọng Tâm |
| :--- | :--- | :--- | :--- |
| "Thống kê cơ hội", "3 thẻ ngang", "Bên mua bên bán" | **Mobile App** | `[NODE-APP-005]` | `src/routes/association.opportunities.tsx` |
| "Vinh danh Top Giver", "Biểu đồ cơ hội mobile" | **Mobile App** | `[NODE-APP-006]` | `src/routes/association.analytics.tsx` |
| "Thống kê CLB", "Menu Analytics CRM", "5 chế độ" | **Web CRM** | `[NODE-CRM-002]` | `src/routes/analytics.tsx`, `Sidebar.tsx` |
| "Sự kiện di động", "Lịch họp ban app", "Lỗi ngày tháng" | **Mobile App** | `[NODE-APP-008]` | `src/routes/association.events.tsx`, `events.service.ts` |
| "Tạo sự kiện CRM", "Poster sự kiện", "Agenda theo giờ" | **Web CRM** | `[NODE-CRM-007]` | `src/routes/events.tsx`, `EventPosterModal.tsx` |
| "Tạo cuộc họp ban", "Bản đồ ghim vị trí" | **Web CRM** | `[NODE-CRM-008]` | `src/routes/meetings.tsx`, `meetings.service.ts` |
| "Bảng tin", "Nút comment cạnh share", "Đánh dấu cuộc họp" | **Mobile App** | `[NODE-APP-010]` | `src/components/feed/FeedView.tsx`, `feed.service.ts` |
| "Sàn B2B", "Giới hạn 5 sản phẩm" | **Mobile App** | `[NODE-APP-007]` | `src/routes/association.products.tsx`, `ProductPostModal.tsx` |
| "Thẻ hội viên", "QR cá nhân", "Quyền riêng tư thẻ" | **Mobile App** | `[NODE-APP-002]` | `src/routes/association.card.tsx`, `card.service.ts` |
| "Thu tài chính", "Phí hội viên", "Import Excel thu" | **Web CRM** | `[NODE-CRM-009]` | `src/routes/income.tsx`, `FinanceChartsSection.tsx` |
| "Chi tài chính", "Tạm ứng hoàn ứng", "Phiếu chi" | **Web CRM** | `[NODE-CRM-010]` | `src/routes/expenses.tsx`, `finance.service.ts` |
| "Báo cáo tài chính", "Dòng tiền", "4 hạng tài trợ" | **Web CRM** | `[NODE-CRM-011]` | `src/routes/finance-report.tsx` |
| "Giao việc", "Người giao việc", "Xem file đính kèm" | **Web CRM** | `[NODE-CRM-012]` | `src/routes/tasks.tsx`, `TaskFormModal.tsx` |
| "Phân quyền", "Gán ban chuyên môn", "5 vai trò BĐH" | **Web CRM** | `[NODE-CRM-005]`, `[NODE-CRM-006]` | `src/routes/accounts.tsx`, `RbacPermissionMatrix.tsx` |
| "Deploy CRM", "Deploy Mobile", "Nginx VPS", "Docker" | **Hạ Tầng** | `[NODE-CORE-004]`, `[NODE-CORE-005]`, `[NODE-CORE-006]` | `deploy/crm/`, `deploy/ceo1983/`, `deploy/ssl/` |

---

## 3. Quy Trình Phản Hồi Minh Bạch (Transparent Execution Protocol)
Trong câu trả lời đầu tiên gửi đến người dùng, Agent phải:
1. **Xác nhận phân hệ**: *"Yêu cầu của bạn thuộc phân hệ [Web CRM Quản trị / CEO 1983 Mobile App]."*
2. **Gắn nhãn Node ID**: *"Khớp với luồng xử lý: `[NODE-xxx: Tên Luồng]`."*
3. **Liệt kê file sẽ chỉnh sửa**: Nêu rõ đường dẫn các tệp sẽ được đọc và hiệu chỉnh.
4. **Cam kết chất lượng**: Chạy `tsc --noEmit` exit 0, không tự ý commit/push git.
