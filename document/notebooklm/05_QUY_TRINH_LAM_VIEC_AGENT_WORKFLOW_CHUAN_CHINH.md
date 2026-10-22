# MỤC 5: QUY TRÌNH LÀM VIỆC AGENT CHUẨN CHỈNH (AGENT WORKFLOW STANDARDS)
*Tài liệu nguồn chuẩn hóa tải lên Google NotebookLM (Sổ tay: https://notebook.google.com/notebook/6ea9dec4-b8c1-4b4b-a077-d874b625bafd)*
*Mục đích: Thiết lập quy chuẩn vận hành chuẩn mực, minh bạch, triệt tiêu 100% lỗi làm sai ý người dùng*

---

## 1. PHÂN TÍCH NGUYÊN NHÂN LÀM SAI Ý & GIẢI PHÁP TRIỆT ĐỂ

### Vì sao trước đây Agent hay làm sai ý người dùng?
1. **Lẫn lộn phân hệ (Context Confusion)**:
   - Dự án có cả Web CRM Quản trị và Mobile App Hội viên trong cùng repo. Khi người dùng ra prompt ngắn (ví dụ: "sửa thống kê cơ hội", "bổ sung nút điểm danh"), Agent vội vã code mà không xác định xem người dùng đang nói về giao diện CRM Desktop hay App Di Động.
2. **Không tra cứu bản đồ kiến trúc (No Traceability)**:
   - Một chức năng đi qua Route -> Component -> API -> Controller -> Service -> Database. Agent sửa mò mẫm từng file, sửa chỗ này sót chỗ khác hoặc sửa sai file của màn hình khác.
3. **Không đọc tài liệu và code cũ trước khi sửa (Skipping Pre-read)**:
   - Tự ý áp đặt pattern code mới mà không đọc file quy chuẩn và các ràng buộc đặc thù đã được thiết lập từ trước.

### Giải pháp triệt để: "Node-Driven & Gatekeeper Protocol"
- **Không bao giờ đoán mò**: Mọi yêu cầu đều phải được ánh xạ vào một **Node ID** duy nhất (`[NODE-CRM-xxx]` hoặc `[NODE-APP-xxx]`).
- **Đọc trước khi chạm**: Phải dùng `view_file` đọc toàn bộ file thuộc Node đó trước khi sửa bất kỳ dòng mã nào.
- **Xác nhận minh bạch**: Trong câu trả lời, Agent luôn nêu rõ: Phân hệ nào, Node nào, file nào sẽ được xử lý.

---

## 2. QUY TRÌNH 5 BƯỚC BẮT BUỘC KHI NHẬN PROMPT MỚI

```
┌────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 1: XÁC ĐỊNH PHÂN HỆ (CRM Quản Trị vs Mobile App vs Core DevOps)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 2: TRA CỨU NODE MATRIX (Tìm mã [NODE-CRM-xxx] / [NODE-APP-xxx])   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 3: ĐỌC TÀI LIỆU QUY CHUẨN & MÃ NGUỒN HIỆN HỮU (Pre-read Check)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 4: THỰC THI SỬA ĐỔI CHUẨN XÁC THEO DANH MỤC FILE TRONG NODE      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  BƯỚC 5: KIỂM CHỨNG 0 LỖI (tsc --noEmit) & ĐỒNG BỘ MEMORY/CURSORRULES  │
└────────────────────────────────────────────────────────────────────────┘
```

### Chi Tiết Từng Bước:

#### 📍 Bước 1: Xác Định Phân Hệ
- **Nếu là Web CRM**:
  - Đối tượng: Chủ tịch, Ban Điều Hành, Ban Thư Ký, Kế toán, Admin.
  - Giao diện: Desktop PC/Laptop, Sidebar bên trái, Bảng Excel kéo rê cột, Recharts, Xuất/Nhập Excel.
- **Nếu là Mobile App**:
  - Đối tượng: Hội viên doanh nhân (sinh năm 1983).
  - Giao diện: Màn hình điện thoại 320px - 430px+, Bottom Nav 5 icon, Thẻ VIP số, B2B Connect, Dải thẻ ngang, 3 màu thương hiệu.
- **Nếu là Core / DevOps**:
  - Đối tượng: Kỹ thuật hệ thống, CSDL PostgreSQL, Docker Deploy, Nginx VPS.

#### 🔍 Bước 2: Tra Cứu Node Matrix
- Mở file `.agents/rules/node-matrix.md` hoặc `document/notebooklm/00_TONG_QUAN_VA_MA_TRAN_NODE_HE_THONG.md`.
- Định vị chính xác Node ID tương ứng với chức năng cần sửa.
- Thu thập đầy đủ danh sách: File Route, File Component, File API Service, File Controller, Bảng CSDL.

#### 📖 Bước 3: Đọc File & Tài Liệu Quy Chuẩn
- Bắt buộc đọc file quy tắc riêng:
  - Nếu là CRM -> Đọc `.agents/rules/crm-rules.md`
  - Nếu là Mobile App -> Đọc `.agents/rules/mobile-rules.md`
  - Nếu là Deploy -> Đọc `.agents/rules/deployment-rules.md`
- Dùng `view_file` mở đọc nội dung thực tế của các file sẽ chỉnh sửa để hiểu rõ context, state và props hiện hữu.

#### 🛠️ Bước 4: Thực Thi Code Chuẩn Xác
- Chỉ sửa đúng các tệp trong Node.
- Áp dụng đúng quy tắc:
  - 100% TypeScript type-safe (không dùng `any`).
  - Kiến trúc Pure NestJS (không dùng Supabase PostgREST client).
  - 3 màu thương hiệu chuẩn (Đỏ ưu tiên 1, Vàng ưu tiên 2, Xanh ưu tiên 3).
  - An toàn ngày tháng (kiểm tra `!isNaN(d.getTime())`).

#### ✅ Bước 5: Kiểm Tra Lỗi & Đồng Bộ Hóa
- **Chạy kiểm tra Type-check**:
  ```bash
  cd apps/ceo1983_app_be && npx tsc --noEmit
  cd apps/ceo1983_app_fe && npx tsc --noEmit
  ```
  Phải xác nhận trả về exit code 0 (0 errors).
- **Đồng bộ hóa bắt buộc**:
  - Cập nhật nhật ký kỹ thuật vào `MEMORY.md`.
  - Cập nhật quy chuẩn mới vào `.cursorrules`.
  - Cập nhật tài liệu kỹ thuật trong `document/notebooklm/`.
- **TUYỆT ĐỐI KHÔNG CHẠY `git commit` HOẶC `git push` TỰ ĐỘNG**.

---

## 3. CHECKLIST MINH BẠCH BÀN GIAO CHO NGƯỜI DÙNG
Mỗi khi trả lời người dùng sau khi hoàn thành một tác vụ, Agent phải trình bày theo mẫu sau:

1. **Phân hệ thực thi**: Web CRM Quản trị / Mobile App CEO 1983 / Core Backend / DevOps.
2. **Node ID đã xử lý**: `[NODE-xxx: Tên Luồng Chức Năng]`.
3. **Danh sách các tệp đã kiểm tra và chỉnh sửa**: Tạo link clickable `[filename](file:///...)`.
4. **Kết quả Type Check**: `tsc --noEmit` exit code 0 (0 errors).
5. **Đồng bộ**: Đã cập nhật `MEMORY.md` và `.cursorrules`.
