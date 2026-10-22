# AGENTS RULES & CONSTRAINTS - HỆ THỐNG CEO 1983 (HANOIBA)
*Phiên bản: 5.0 - Chuẩn hóa kiến trúc tách biệt Web CRM & Mobile App kèm Functional Node Indexing*

---

## 1. Git Push & Commit Rule (STRICT)
- **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHẠY `git push` HAY `git commit`**:
  - Không được tự ý thực thi các lệnh `git push` hoặc `git commit` trong terminal dưới bất kỳ hình thức nào.
  - Mọi thay đổi mã nguồn chỉ được phép chỉnh sửa cục bộ (local).
  - Để người dùng toàn quyền chủ động kiểm tra (`git status`, `git diff`), commit và push mã nguồn lên Git khi họ mong muốn.

---

## 2. Quy Trình 5 Bước Bắt Buộc Trước Khi Code (STRICT PRE-FLIGHT WORKFLOW)
> **MỤC ĐÍCH**: Triệt tiêu hoàn toàn tình trạng làm sai ý người dùng, nhầm lẫn giữa Web CRM và Mobile App, hoặc sửa sót file.

Mỗi khi nhận bất kỳ câu lệnh (prompt), yêu cầu tính năng mới, hoặc báo lỗi nào từ người dùng, Agent **BẮT BUỘC** phải tuân thủ nghiêm ngặt 5 bước sau:

### 📍 BƯỚC 1: XÁC ĐỊNH RÕ PHÂN HỆ MỤC TIÊU
- Phân tích yêu cầu thuộc về:
  1. **Web CRM Quản Trị** (Dành cho Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán, Admin; Giao diện Desktop, Sidebar, Bảng Excel, Recharts).
  2. **CEO 1983 Mobile App** (Dành cho Hội viên doanh nhân; Giao diện Di động, MemberShell, Bottom Nav, Thẻ QR, B2B Connect).
  3. **Hạ Tầng Dùng Chung (Core / Backend / DevOps)** (Auth, CSDL PostgreSQL, Socket.IO, Deploy Docker Nginx).
- *Nếu yêu cầu của người dùng chưa rõ ràng giữa CRM hay Mobile App, Agent phải xác định hoặc hỏi lại, TUYỆT ĐỐI KHÔNG ĐƯỢC ĐOÁN MÒ để rồi code nhầm phân hệ.*

### 🔍 BƯỚC 2: TRA CỨU FUNCTIONAL NODE ID TỪ MA TRẬN
- Mở và tra cứu bản đồ Node tại [.agents/rules/node-matrix.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/.agents/rules/node-matrix.md):
  - Nhóm CRM: `[NODE-CRM-001]` đến `[NODE-CRM-017]`
  - Nhóm Mobile App: `[NODE-APP-001]` đến `[NODE-APP-014]`
  - Nhóm Hạ Tầng: `[NODE-CORE-001]` đến `[NODE-CORE-006]`
- Xác định chính xác danh sách file: Route, Component, API Client, Controller, Service, CSDL Table liên quan đến Node đó.

### 📖 BƯỚC 3: ĐỌC TÀI LIỆU QUY CHUẨN TRƯỚC KHI CHẠM VÀO CODE
- **Nếu là CRM**: Bắt buộc đọc [.agents/rules/crm-rules.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/.agents/rules/crm-rules.md) và tài liệu đặc tả [02_DAC_TA_KY_THUAT_WEB_CRM_QUAN_TRI.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/notebooklm/02_DAC_TA_KY_THUAT_WEB_CRM_QUAN_TRI.md).
- **Nếu là Mobile App**: Bắt buộc đọc [.agents/rules/mobile-rules.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/.agents/rules/mobile-rules.md) và tài liệu đặc tả [01_DAC_TA_KY_THUAT_CEO1983_MOBILE_APP.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/notebooklm/01_DAC_TA_KY_THUAT_CEO1983_MOBILE_APP.md).
- **Nếu là Triển khai / Deploy**: Bắt buộc đọc [.agents/rules/deployment-rules.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/.agents/rules/deployment-rules.md).
- Đọc nội dung thực tế của các tệp nguồn cần sửa bằng `view_file` để nắm trọn vẹn logic hiện hữu.

### 🛠️ BƯỚC 4: THỰC THI SỬA ĐỔI CHUẨN XÁC THEO NODE
- Thực hiện chỉnh sửa chính xác các file thuộc Node đã định danh.
- Tuân thủ nghiêm ngặt bảng màu 3 cấp độ (Đỏ - Vàng - Xanh), kiến trúc NestJS 3 tầng thuần khiết kết nối PostgreSQL, không hardcode mock data, và các ràng buộc đặc thù của từng Node.

### ✅ BƯỚC 5: KIỂM CHỨNG & ĐỒNG BỘ HÓA BẮT BUỘC
1. **Kiểm tra lỗi code (STRICT TYPE-CHECK)**:
   - Chạy `npx tsc --noEmit` tại cả `apps/ceo1983_app_be` và `apps/ceo1983_app_fe`.
   - BẮT BUỘC xác nhận exit code 0 (0 errors) trước khi thông báo hoàn thành.
2. **Đồng bộ hóa tài liệu & Memory**:
   - Cập nhật chi tiết thay đổi vào [MEMORY.md](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/MEMORY.md).
   - Bổ sung quy chuẩn mới vào [.cursorrules](file:///d:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/.cursorrules).
   - Cập nhật Node Matrix và các tài liệu trong `document/notebooklm/` nếu có thay đổi về luồng hoặc cấu trúc.

---

## 3. Đồng Bộ Hóa Bắt Buộc: Memory, Cursor Rules & Tài Liệu NotebookLM (STRICT)
- **Cập nhật MEMORY.md**: Mỗi lần thực hiện bất kỳ thay đổi kiến trúc, tính năng, sửa lỗi hoặc điều chỉnh luồng, BẮT BUỘC phải ghi nhận chi tiết vào `MEMORY.md`.
- **Cập nhật Cursor Rules / Roles (`.cursorrules`)**: Khi có quy chuẩn coding, quy tắc định tuyến, luồng xử lý hoặc vai trò mới, BẮT BUỘC phải bổ sung đồng bộ vào `.cursorrules`.
- **Đồng bộ Tài liệu NotebookLM**: Mọi thay đổi về đặc tả kỹ thuật phải được cập nhật tương ứng vào bộ tài liệu `document/notebooklm/` để người dùng đồng bộ lên Google NotebookLM (`https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd`).

---

## 4. Kiểm Tra Lỗi Code Bắt Buộc Trước Khi Hoàn Thành (STRICT CODE QUALITY)
- **TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỂ LỖI CODE**:
  - Trước khi thông báo hoàn thành bất kỳ nhiệm vụ nào, Agent BẮT BUỘC phải chạy kiểm tra type check (`tsc --noEmit`), linter hoặc AST validation trên toàn bộ các tệp vừa chỉnh sửa.
  - Tuyệt đối không để sót biến chưa khai báo, lỗi cú pháp (syntax errors), gạch chân đỏ trong IDE, hoặc kiểu dữ liệu không khớp.
  - Phải xác nhận lệnh kiểm tra trả về exit code 0 (0 errors) trước khi bàn giao cho người dùng.
