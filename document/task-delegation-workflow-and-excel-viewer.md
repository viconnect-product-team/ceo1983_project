# TÀI LIỆU KỸ THUẬT: QUY TRÌNH GIAO VIỆC - NHẬN VIỆC - ĐÁNH GIÁ TIẾN ĐỘ - NỘP FILE & XEM EXCEL TRỰC TIẾP
**Dự án**: Hệ thống Quản trị & Kết nối Doanh nhân CEO 1983  
**Phiên bản**: 1.0 (RESTful API Standard & Strict RBAC Role Validation)  
**Ngày cập nhật**: 08/10/2026  

---

## 1. TỔNG QUAN HỆ THỐNG GIAO VIỆC (TASK DELEGATION WORKFLOW)

Hệ thống quản lý công việc và điều phối nhiệm vụ Hiệp hội CEO 1983 được thiết kế theo vòng đời khép kín, phân định minh bạch trách nhiệm giữa **Người giao việc / Ban Giám sát (Supervisor)** và **Người nhận việc (Assignee)**, hỗ trợ đánh giá tiến độ định kỳ, nộp sản phẩm bàn giao (Deliverables) và đọc file bảng tính Excel (`.xlsx`, `.xls`, `.csv`) trực tiếp trong ứng dụng.

```
[Người Giao Việc / BQT] ─── (1) Giao việc ───► [Nhiệm Vụ: TODO]
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
       (2a) Chấp nhận nhiệm vụ                                             (2b) Từ chối tiếp nhận
    (Ghi nhận thời gian acceptedAt)                                        (Nêu lý do declineReason)
                      ▼                                                                   ▼
             [Nhiệm Vụ: IN_PROGRESS]                                                [Nhiệm Vụ: TODO]
                      │                                                        (BQT phân công lại)
        ┌─────────────┴─────────────┐
        ▼                           ▼
(3a) Cập nhật %          (3b) Đánh giá tiến độ
 & tick Checklist        (Chấm sao, mức độ, chỉ đạo)
        │                           │
        ▼                           ▼
(3c) Nộp File Nghiệm Thu & Xem Bảng Tính Excel In-App
        │
        ▼
(4) Gửi Báo Cáo Nghiệm Thu ───► [Nhiệm Vụ: REVIEW]
                                          │
                      ┌───────────────────┴───────────────────┐
                      ▼                                       ▼
       (5a) Phê duyệt nghiệm thu (100%)              (5b) Yêu cầu làm lại / Chỉnh sửa
        (Đánh giá 1-5 sao, nhận xét)                    (Nêu lý do, quay về IN_PROGRESS)
                      ▼                                       ▼
             [Nhiệm Vụ: DONE]                       [Nhiệm Vụ: IN_PROGRESS]
```

---

## 2. MA TRẬN PHÂN QUYỀN & HÀNH ĐỘNG GIAO DIỆN (STRICT RBAC & DOM OMISSION)

Giao diện người dùng áp dụng triệt để nguyên tắc **Render Omission** (loại bỏ hoàn toàn phần tử khỏi cây DOM khi người dùng không có quyền tương ứng, không dùng giải pháp ẩn mờ CSS đơn thuần).

| Chức năng / Nút thao tác | Người nhận việc (Assignee) | Người giao việc / Giám sát (Supervisor) | Ban Quản trị / Quản trị viên (BQT/Admin) | Người xem (Viewer) |
|---|:---:|:---:|:---:|:---:|
| **Tiếp nhận nhiệm vụ (`POST :id/accept`)** | **Hiện (khi TODO)** | Ẩn khỏi DOM | Ẩn khỏi DOM (trừ khi là người nhận) | Ẩn khỏi DOM |
| **Từ chối tiếp nhận (`POST :id/decline`)** | **Hiện (khi TODO)** | Ẩn khỏi DOM | Ẩn khỏi DOM | Ẩn khỏi DOM |
| **Đôn đốc / Nhắc việc (`POST :id/remind`)** | Ẩn khỏi DOM | **Hiện (khi TODO/IN_PROGRESS)** | **Hiện** | Ẩn khỏi DOM |
| **Đánh giá tiến độ (`POST :id/evaluate`)** | Ẩn khỏi DOM | **Hiện (khi IN_PROGRESS)** | **Hiện** | Ẩn khỏi DOM |
| **Nộp file kết quả (`POST :id/attachments`)** | **Hiện (khi IN_PROGRESS)** | **Hiện** | **Hiện** | Ẩn khỏi DOM |
| **Nộp báo cáo nghiệm thu (`POST :id/submit-review`)** | **Hiện (khi IN_PROGRESS)** | Ẩn khỏi DOM | Ẩn khỏi DOM | Ẩn khỏi DOM |
| **Phê duyệt nghiệm thu (`POST :id/approve`)** | Ẩn khỏi DOM | **Hiện (khi REVIEW)** | **Hiện (khi REVIEW)** | Ẩn khỏi DOM |
| **Yêu cầu làm lại (`POST :id/rework`)** | Ẩn khỏi DOM | **Hiện (khi REVIEW)** | **Hiện (khi REVIEW)** | Ẩn khỏi DOM |
| **Thanh trượt tiến độ % (Range Slider)** | Kéo chỉnh trực tiếp | Kéo chỉnh trực tiếp | Kéo chỉnh trực tiếp | Tĩnh (Read-only bar) |
| **Checklist công việc con (Subtasks)** | Tương tác bật/tắt | Tương tác bật/tắt | Tương tác bật/tắt | Tĩnh (Read-only) |
| **Thanh đổi trạng thái linh hoạt (Status Switcher)** | Ẩn khỏi DOM | **Hiện** | **Hiện** | Ẩn khỏi DOM |
| **Chỉnh sửa / Xóa công việc** | Ẩn khỏi DOM | **Hiện** | **Hiện** | Ẩn khỏi DOM |
| **Xem bảng tính Excel trực tiếp (In-App)** | **Có quyền xem** | **Có quyền xem** | **Có quyền xem** | **Có quyền xem** |

---

## 3. DANH SÁCH RESTFUL API ENDPOINTS

Hệ thống tuân thủ chuẩn RESTful API với định tuyến trực quan tại backend NestJS (`/tasks`):

### 3.1. Nhóm API Tiếp Nhận & Phân Quyền Nhiệm Vụ
- `POST /api/tasks/:id/accept`: Người nhận xác nhận tiếp nhận công việc, hệ thống chuyển sang `IN_PROGRESS`, ghi nhận `acceptedAt` và lịch sử thao tác.
- `POST /api/tasks/:id/decline`: Người nhận từ chối nhận việc kèm lý do `reason`.
- `POST /api/tasks/:id/remind`: Người giao việc/BQT gửi nhắc nhở deadline và đôn đốc tiến độ, tự động đẩy chuông thông báo đến tài khoản người nhận.

### 3.2. Nhóm API Quá Trình Thực Hiện & Đánh Giá Tiến Độ
- `PATCH /api/tasks/:id/progress`: Cập nhật tiến độ % thực tế (`0 - 100%`).
- `PATCH /api/tasks/:id/subtasks/:subtaskId/toggle`: Bật/tắt trạng thái hoàn thành của từng mục con.
- `POST /api/tasks/:id/evaluate`: Giám sát viên thẩm định tiến độ định kỳ:
  - `statusAssessment`: `'ON_TRACK'` (Đúng tiến độ) | `'AHEAD'` (Vượt tiến độ) | `'AT_RISK'` (Có nguy cơ trễ) | `'DELAYED'` (Chậm tiến độ).
  - `rating`: Đánh giá 1-5 sao.
  - `feedback`: Nhận xét chỉ đạo tiến độ.
  - Tự động đẩy thông báo kết quả đánh giá đến người phụ trách.

### 3.3. Nhóm API Quản Lý File & Nộp Sản Phẩm Deliverables
- `POST /api/tasks/:id/attachments`: Tải lên tài liệu đính kèm hoặc nộp sản phẩm nghiệm thu:
  - `name`: Tên file (vd: `Bao_cao_ngan_sach.xlsx`).
  - `url`: Link file hoặc Data URL Base64 an toàn.
  - `size`: Dung lượng file format.
  - `type`: MIME type.
  - `isDeliverable`: `true` nếu là file nộp nghiệm thu, `false` nếu là tài liệu giao việc.
- `DELETE /api/tasks/:id/attachments/:attachmentIndex`: Xóa file đính kèm (chỉ người tải hoặc supervisor có thẩm quyền).

### 3.4. Nhóm API Thẩm Định Nghiệm Thu & Phê Duyệt
- `POST /api/tasks/:id/submit-review`: Người nhận gửi đề xuất nghiệm thu kèm ghi chú kết quả và link/file deliverables. Trạng thái chuyển thành `REVIEW`.
- `POST /api/tasks/:id/approve`: Người giao việc phê duyệt hoàn thành (100%), chấm điểm đánh giá (1-5 sao) và ghi nhận lời khen/nhận xét chất lượng. Trạng thái chuyển thành `DONE`.
- `POST /api/tasks/:id/rework`: Người giao việc từ chối nghiệm thu và yêu cầu làm lại kèm lý do chi tiết `reason`. Trạng thái chuyển lại `IN_PROGRESS`.

---

## 4. TRÌNH XEM BẢNG TÍNH EXCEL TRỰC TIẾP TRONG ỨNG DỤNG (EXCEL VIEWER MODAL)

### 4.1. Kiến Trúc Xử Lý
- Thư viện xử lý lõi: **SheetJS (`xlsx`)** phiên bản 0.18.5.
- Hỗ trợ định dạng: `.xlsx`, `.xls`, `.csv`.
- Cơ chế nạp dữ liệu:
  - **Base64 Data URL**: Bóc tách chuỗi base64 và parse trực tiếp với `XLSX.read(base64, { type: 'base64' })`.
  - **HTTP/HTTPS URL**: `fetch(url) -> arrayBuffer -> XLSX.read(buffer, { type: 'array' })`.
  - **Local/Demo Fallback**: Nếu URL là `#` hoặc mạng nội bộ gián đoạn, tự động khởi tạo dữ liệu bảng tính dự toán mẫu chuẩn doanh nghiệp CEO 1983 để người dùng luôn có trải nghiệm xem bảng tính mượt mà.

### 4.2. Tính Năng Giao Diện
- **Tab Sheets Bar**: Chuyển đổi linh hoạt giữa nhiều Sheet trong cùng một file workbook.
- **Data Grid Tiêu Chuẩn Excel**: Lưới ô tính với tiêu đề cột (A, B, C... Z, AA...), chỉ số dòng (1, 2, 3...), header cố định nổi bật và cột số thứ tự cố định.
- **Căn Lề Thông Minh**: Căn phải tự động cho các ô tính chứa số tiền / số lượng và căn trái cho các ô chứa chuỗi ký tự.
- **Tìm Kiếm Thời Gian Thực**: Bộ lọc tìm kiếm ô tính theo từ khóa, tự động highlight màu hổ phách vàng kim cho các ô khớp nội dung và lọc dòng tức thì.
- **Thanh Trạng Thái (Status Bar)**: Hiển thị tổng số dòng, tổng số cột và số lượng kết quả tìm kiếm.
- **Chế Độ Xem Toàn Màn Hình (Fullscreen)** & **Nút Tải File Gốc (Download)**.
