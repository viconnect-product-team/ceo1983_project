# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ CHÍNH THỨC
*(SOFTWARE REQUIREMENTS SPECIFICATION - MASTER SRS)*

---

* **Mã tài liệu:** `SRS-CEO1983-MASTER-CHINH-THUC`
* **Phiên bản:** `Phiên bản 9.0 Toàn Diện (Chuẩn IEEE 830 - Bản Bàn Giao Khách Hàng, Ban Lãnh Đạo & Kỹ Sư Vận Hành)`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Đội ngũ Kiến trúc sư Hệ thống & Chuyên gia Phân tích Nghiệp vụ
* **Phân loại:** Đặc tả Kỹ thuật, Luồng Dữ liệu, Ma trận Use Case & Hệ thống Sơ đồ Mô hình hóa Chi tiết

---

## MỤC LỤC TÀI LIỆU
1. **CHƯƠNG 1: HỆ THỐNG SƠ ĐỒ MÔ HÌNH HÓA TOÀN DIỆN (15 MERMAID DIAGRAMS)**
   - 1.1. Sơ Đồ Tổng Quan Kiến Trúc Đa Tầng (System Architecture)
   - 1.2. Sơ Đồ Tổng Thể Use Case Phân Hệ Quản Trị CRM (CRM Use Case Diagram)
   - 1.3. Sơ Đồ Tổng Thể Use Case Phân Hệ Ứng Dụng Di Động (Mobile App Use Case Diagram)
   - 1.4. Sơ Đồ Luồng Dữ Liệu Đầu-cuối (End-to-End Data Flow Sequence)
   - 1.5. Sơ Đồ Tuần Tự: Quy Trình Đặt Lịch Hẹn 1-on-1 trong 3 Tình Huống & Tự Động Nhắn Tin
   - 1.6. Sơ Đồ Tuần Tự: Sự Kiện & Lưu Vết Kỷ Niệm 5 Hạng Mục (Sponsors, Polls, Awards, Seating, Drive)
   - 1.7. Sơ Đồ Tuần Tự: Đăng Bài Đa Kênh 1-Click (Facebook, Group, Zalo OA, Web)
   - 1.8. Sơ Đồ Tuần Tự: Thanh Toán Điện Tử QR MoMo & VNPay Gạch Nợ Tự Động
   - 1.9. Sơ Đồ Tuần Tự: Bình Luận Cây 3 Cấp, Menu 3 Chấm & Tag `@` Đối Tác Đã Kết Nối
   - 1.10. Sơ Đồ Trạng Thái: Vòng Đời Hồ Sơ Hội Viên (Member Lifecycle State Diagram)
   - 1.11. Sơ Đồ Trạng Thái: Vòng Đời Cơ Hội Giao Thương B2B (Opportunity Lifecycle State Diagram)
   - 1.12. Sơ Đồ Trạng Thái: Vòng Đời Sự Kiện & Hoạt Động (Event & Meeting Lifecycle State Diagram)
   - 1.13. Sơ Đồ Thực Thể Mối Quan Hệ CSDL (Entity-Relationship Diagram - ERD)
   - 1.14. Sơ Đồ Luồng Hoạt Động: Phân Loại Hoạt Động Họp Cố Định vs Họp Bất Thường
   - 1.15. Sơ Đồ Luồng Hoạt Động: Nhập Bảng Tính & Bóc Tách Trường Thông Minh (Smart Import)
2. **CHƯƠNG 2: MA TRẬN USE CASE & ĐẶC TẢ CHI TIẾT 30 USE CASES CHUẨN IEEE 830**
   - 2.1. Ma Trận Use Case Phân Hệ Quản Trị Web CRM (`UC-CRM-001` đến `UC-CRM-015`)
   - 2.2. Đặc Tả Chi Tiết 15 Use Cases Quản Trị CRM
   - 2.3. Ma Trận Use Case Phân Hệ Ứng Dụng Di Động (`UC-APP-001` đến `UC-APP-015`)
   - 2.4. Đặc Tả Chi Tiết 15 Use Cases Mobile App
3. **CHƯƠNG 3: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)**
   - 3.1. Nhóm Chức Năng Quản Trị Trung Ương CRM
   - 3.2. Nhóm Chức Năng Ứng Dụng Di Động Hội Viên
4. **CHƯƠNG 4: ĐẶC TẢ CỔNG THANH TOÁN ĐIỆN TỬ (MÃ QR MOMO & CỔNG VNPAY)**
5. **CHƯƠNG 5: YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)**
6. **CHƯƠNG 6: MA TRẬN TRUY XUẤT TÍNH NĂNG (TRACEABILITY MATRIX)**

---

## CHƯƠNG 1: HỆ THỐNG SƠ ĐỒ MÔ HÌNH HÓA TOÀN DIỆN (15 MERMAID DIAGRAMS)

### 1.1. Sơ Đồ Tổng Quan Kiến Trúc Đa Tầng (System Architecture)
Hệ thống triển khai theo mô hình Monorepo Domain-Driven Design (DDD) phân tầng độc lập:

```mermaid
graph TB
    subgraph CLIENT_TIER ["TẦNG GIAO DIỆN NGƯỜI DÙNG (PRESENTATION LAYER)"]
        CRM["Cổng Quản Trị Web CRM<br/>(Desktop Responsive, Recharts, SheetJS, Sidebar)"]
        APP["Ứng Dụng Di Động Hội Viên CEO 1983<br/>(Mobile-First, PWA, Capacitor Native, BottomNav)"]
        LANDING["Hệ Thống Trang Đích Landing Web<br/>(Subdomains, 2 Bản mẫu: Timed Cards & Mobile Showcase)"]
    end

    subgraph GATEWAY_TIER ["TẦNG CỬA NGÕ & ĐIỀU PHỐI (GATEWAY & REVERSE PROXY)"]
        NGINX["Cụm Nginx Reverse Proxy (SSL TLS 1.3)<br/>Điều phối tải, Cắt lọc bot crawler, Cấp chứng chỉ bảo mật"]
        SHARE_PROXY["Bộ Điều Phối OpenGraph Chia Sẻ Mạng Xã Hội<br/>(/share/preview, /share/:type/:id)"]
    end

    subgraph APP_TIER ["TẦNG XỬ LÝ NGHIỆP VỤ TRUNG TÂM (APPLICATION SERVICE LAYER)"]
        AUTH_MOD["Phân Hệ Xác Thực & RBAC<br/>(JWT HS256, Bcrypt, Phân quyền vai trò)"]
        MEMBER_MOD["Phân Hệ Hội Viên & Tổ Chức<br/>(Hồ sơ 360, Duyệt kết nạp, Thẻ số)"]
        TRADE_MOD["Phân Hệ Giao Thương B2B & Sàn TMĐT<br/>(Cơ hội, Sản phẩm, B2B Matching)"]
        MEETING_MOD["Phân Hệ Lịch Hẹn 1-on-1<br/>(3 Case hẹn gặp, Tự động gửi tin nhắn)"]
        FEED_MOD["Phân Hệ Mạng Lưới & Bình Luận Tree<br/>(Cây phản hồi, Tag @ kết nối, Push Notify)"]
        STAT_MOD["Phân Hệ Thống Kê & Đối Soát<br/>(5 Chu kỳ, Minh chứng, 3 chế độ Xuất Excel)"]
        DOC_MOD["Phân Hệ Trình Xem Tài Liệu Toàn Năng<br/>(Word A4, Excel Tabs SheetJS, PDF)"]
        LANDING_MOD["Phân Hệ Quản Trị Landing Web<br/>(Tree Menu, Sub-screens, Dynamic API)"]
        AI_MOD["Phân Hệ Trợ Lý Cố Vấn Số AI<br/>(Mô hình Giáo viên đứng cạnh bảng, Multi-Persona)"]
        PAYMENT_MOD["Phân Hệ Thanh Toán Điện Tử<br/>(Mã QR MoMo & Cổng thanh toán VNPay)"]
        SYND_MOD["Phân Hệ Đăng Bài Đa Kênh 1-Click<br/>(Hội nhóm Facebook, Nhóm Zalo, Web)"]
    end

    subgraph DATA_TIER ["TẦNG LƯU TRỮ & DỮ LIỆU SỐNG (PERSISTENCE LAYER)"]
        PG_DB[("Cơ Sở Dữ Liệu PostgreSQL Doanh Nghiệp<br/>(Bảo toàn toàn vẹn dữ liệu, RLS Security, Flags Guard)")]
        FILE_STORAGE[("Kho Lưu Trữ Tệp Tin & Đa Phương Tiện<br/>(Tài liệu nội bộ, Chứng từ, Ảnh hội viên)")]
        SOCKET_STATE[("Bộ Quản Lý Phiên & Socket Thời Gian Thực<br/>(Thông báo đẩy, Trò chuyện B2B tức thời)")]
    end

    subgraph INTEGRATION_TIER ["TẦNG KẾT NỐI ĐỐI TÁC NGOÀI (EXTERNAL INTEGRATIONS)"]
        VNPAY["Cổng Thanh Toán Quốc Gia VNPay<br/>(Xác thực chữ ký số HMAC an toàn)"]
        MOMO["Ví Điện Tử & Cổng QR MoMo<br/>(Thanh toán hội phí & giao dịch nhanh)"]
        ZALO["Nền Tảng Zalo Mini App & Zalo OA<br/>(Tra cứu danh bạ, đồng bộ tương tác)"]
        FACEBOOK["Nền Tảng Facebook Graph & Nhóm CLB<br/>(Đồng bộ thông cáo báo chí, OpenGraph Card)"]
    end

    CLIENT_TIER --> NGINX
    NGINX --> SHARE_PROXY
    NGINX --> APP_TIER
    APP_TIER --> DATA_TIER
    APP_TIER --> INTEGRATION_TIER
```

---

### 1.2. Sơ Đồ Tổng Thể Use Case Phân Hệ Quản Trị CRM
Thể hiện mối liên kết giữa các tác nhân quản trị và các Use Case cốt lõi:

```mermaid
graph LR
    subgraph ACTORS_CRM ["TÁC NHÂN QUẢN TRỊ CRM"]
        ADMIN["Chủ Tịch / Superadmin"]
        BTK["Ban Thư Ký CLB"]
        BTV["Ban Thành Viên"]
        BGT["Ban Giao Thương"]
        BTC["Ban Tài Chính"]
        BTT["Ban Truyền Thông"]
    end

    subgraph UC_CRM_GROUP ["USE CASES QUẢN TRỊ WEB CRM"]
        UC_C01["UC-CRM-001: Tiếp Nhận & Duyệt Kết Nạp HV"]
        UC_C02["UC-CRM-002: Quản Lý Hồ Sơ 360 & Chi Hội"]
        UC_C03["UC-CRM-003: Thống Kê Chỉ Số 5 Chu Kỳ"]
        UC_C04["UC-CRM-004: Xuất Báo Cáo Excel 3 Chế Độ"]
        UC_C05["UC-CRM-005: Nhập Excel Thông Minh (Smart Import)"]
        UC_C06["UC-CRM-006: Cấu Hình Kênh Mạng Xã Hội"]
        UC_C07["UC-CRM-007: Đăng Bài Đa Kênh 1-Click"]
        UC_C08["UC-CRM-008: Quản Trị Landing Web Đa Mẫu"]
        UC_C09["UC-CRM-009: Cấu Hình Tree Menu & Subdomain"]
        UC_C10["UC-CRM-010: Xem Tài Liệu Toàn Năng (Word/Excel/PDF)"]
        UC_C11["UC-CRM-011: Quản Trị Biểu Quyết & Bầu Cử Đại Hội"]
        UC_C12["UC-CRM-012: Phân Quyền Vai Trò RBAC"]
        UC_C13["UC-CRM-013: Kiểm Duyệt Sàn Thương Mại B2B"]
        UC_C14["UC-CRM-014: Quản Lý Thu Chi & Đối Soát MoMo/VNPay"]
        UC_C15["UC-CRM-015: Điều Phối Cuộc Họp Ban Cố Định & Bất Thường"]
    end

    ADMIN --> UC_C11
    ADMIN --> UC_C12
    BTK --> UC_C02
    BTK --> UC_C10
    BTK --> UC_C15
    BTV --> UC_C01
    BTV --> UC_C05
    BGT --> UC_C13
    BGT --> UC_C03
    BTC --> UC_C04
    BTC --> UC_C14
    BTT --> UC_C06
    BTT --> UC_C07
    BTT --> UC_C08
    BTT --> UC_C09
```

---

### 1.3. Sơ Đồ Tổng Thể Use Case Phân Hệ Ứng Dụng Di Động
Mô hình hóa các chức năng tương tác của Hội viên doanh nhân:

```mermaid
graph LR
    subgraph ACTORS_APP ["TÁC NHÂN DI ĐỘNG"]
        HV["Hội Viên Doanh Nhân CEO 1983"]
        DT["Đối Tác Doanh Nghiệp Giao Thương"]
        GUEST["Khách Mời / Người Ngoài Hiệp Hội"]
    end

    subgraph UC_APP_GROUP ["USE CASES MOBILE APP"]
        UC_A01["UC-APP-001: Đăng Ký Tài Khoản Trực Tuyến"]
        UC_A02["UC-APP-002: Đăng Nhập & Chào Mừng AI Ngày Đầu"]
        UC_A03["UC-APP-003: Thẻ Doanh Nhân & Mã QR Định Danh"]
        UC_A04["UC-APP-004: Đăng Tin Cơ Hội Giao Thương B2B"]
        UC_A05["UC-APP-005: Mở Gian Hàng Sản Phẩm Nội Khối"]
        UC_A06["UC-APP-006: Đặt Lịch Hẹn 1-on-1 Tự Do"]
        UC_A07["UC-APP-007: Đặt Lịch Hẹn 1-on-1 Từ Cơ Hội"]
        UC_A08["UC-APP-008: Đặt Lịch Hẹn 1-on-1 Từ Sản Phẩm"]
        UC_A09["UC-APP-009: Nhắn Tin Tự Động & Xác Nhận Lịch Hẹn"]
        UC_A10["UC-APP-010: Đăng Bài Mạng Lưới (Mục 'Khác')"]
        UC_A11["UC-APP-011: Bình Luận Cây & Menu 3 Chấm"]
        UC_A12["UC-APP-012: Nhắc Tên @ Đối Tác Kết Nối"]
        UC_A13["UC-APP-013: Chia Sẻ Public OpenGraph MXH"]
        UC_A14["UC-APP-014: Sự Kiện & Lưu Vết Kỷ Niệm 5 Hạng Mục"]
        UC_A15["UC-APP-015: Tham Gia Họp Ban & Nộp Phí MoMo/VNPay"]
    end

    GUEST --> UC_A01
    GUEST --> UC_A13
    HV --> UC_A02
    HV --> UC_A03
    HV --> UC_A04
    HV --> UC_A05
    HV --> UC_A06
    HV --> UC_A07
    HV --> UC_A08
    HV --> UC_A09
    HV --> UC_A10
    HV --> UC_A11
    HV --> UC_A12
    HV --> UC_A14
    HV --> UC_A15
    DT --> UC_A06
    DT --> UC_A07
    DT --> UC_A08
    DT --> UC_A09
```

---

### 1.4. Sơ Đồ Luồng Dữ Liệu Đầu-cuối (End-to-End Data Flow Sequence)

```mermaid
sequenceDiagram
    autonumber
    actor HV as Hội Viên Doanh Nhân
    participant APP as Mobile App CEO 1983
    participant NGINX as Nginx Gateway
    participant BE as Backend Core Services
    participant DB as CSDL PostgreSQL
    actor BTV as Ban Thành Viên (CRM)
    participant PAY as MoMo / VNPay
    actor DT as Đối Tác Doanh Nghiệp

    HV->>APP: Nộp đơn đăng ký gia nhập (Họ tên, Năm sinh 1983, MST, Cty)
    APP->>BE: Gửi hồ sơ đăng ký mới
    BE->>DB: Lưu trạng thái PENDING_APPROVAL
    BE-->>BTV: Thông báo hồ sơ mới trên Web CRM
    BTV->>BE: Thẩm định hồ sơ & Phê duyệt kết nạp chính thức
    BE->>DB: Cập nhật ACTIVE, cấp mã định danh CEO-83xxx
    BE-->>HV: Gửi thông báo kết nạp kèm mật khẩu & link app
    HV->>APP: Đăng nhập -> AI chào mừng không viền & Cấp Thẻ QR

    Note over HV,DT: Luồng Giao Thương B2B & Đặt Lịch Hẹn 1-on-1
    HV->>APP: Đăng bài cơ hội B2B hoặc Mở gian hàng sản phẩm
    DT->>APP: Xem cơ hội/sản phẩm -> Bấm "Lên lịch gặp 1-on-1"
    APP->>BE: Khởi tạo cuộc hẹn B2B
    BE->>DB: Lưu lịch hẹn & tự động gửi tin nhắn vào hộp thư chat
    BE-->>HV: Thông báo có đối tác đăng ký gặp gỡ
    HV->>APP: Bấm Đồng ý cuộc hẹn -> Tự động xác nhận & nhắc lịch 2 bên

    Note over HV,PAY: Luồng Thanh Toán Hội Phí Điện Tử
    HV->>APP: Chọn thanh toán hội phí thường niên
    APP->>BE: Yêu cầu tạo mã thanh toán
    BE->>PAY: Khởi tạo mã QR MoMo / Giao dịch cổng VNPay
    PAY-->>HV: Quét mã QR MoMo hoặc xác thực qua VNPay
    PAY->>BE: IPN Webhook báo giao dịch thành công (HMAC verified)
    BE->>DB: Gạch nợ tự động, ghi nhận sổ quỹ thu chi minh bạch
    BE-->>BTV: Cập nhật số liệu tài chính trên CRM
```

---

### 1.5. Sơ Đồ Tuần Tự: Quy Trình Đặt Lịch Hẹn 1-on-1 trong 3 Tình Huống & Tự Động Nhắn Tin

```mermaid
sequenceDiagram
    autonumber
    actor HVA as Hội Viên A (Người Khởi Tạo Hẹn)
    participant APP as Mobile App CEO 1983
    participant MSG as Phân Hệ Tin Nhắn & Đặt Lịch
    participant DB as CSDL PostgreSQL
    actor HVB as Hội Viên B (Người Nhận Lời Mời)

    alt Tình huống 1: Hẹn gặp tự chủ động tại Kết nối B2B
        HVA->>APP: Vào Danh bạ B2B -> Tìm HV B -> Bấm "Lên lịch gặp 1-on-1"
    else Tình huống 2: Hẹn gặp từ Tin chia sẻ cơ hội
        HVA->>APP: Đọc bài Cơ hội của HV B -> Bấm "Hẹn gặp trao đổi cơ hội"
    else Tình huống 3: Hẹn gặp từ Gian hàng sàn thương mại
        HVA->>APP: Xem sản phẩm của HV B -> Bấm "Lên lịch làm việc B2B"
    end

    APP->>HVA: Hiển thị form chọn ngày, giờ, hình thức (Online/Trực tiếp)
    HVA->>APP: Xác nhận gửi lời mời hẹn gặp
    APP->>MSG: Gửi yêu cầu đặt lịch hẹn kèm ngữ cảnh gốc
    MSG->>DB: Tạo bản ghi b2b_meetings (Status: PENDING)
    MSG->>DB: Tự động ghi 1 tin nhắn vào cuộc hội thoại HVA - HVB: "Lời mời hẹn gặp B2B..."
    MSG-->>HVB: Gửi thông báo đẩy (Push Notification) đến điện thoại HV B
    
    HVB->>APP: Mở tin nhắn trò chuyện -> Bấm xem chi tiết lịch hẹn
    alt HV B bấm "Đồng ý gặp"
        HVB->>APP: Bấm nút "Đồng ý"
        APP->>MSG: Xác nhận chấp thuận lịch hẹn
        MSG->>DB: Cập nhật b2b_meetings (Status: CONFIRMED)
        MSG->>DB: Tự động gửi tin nhắn xác nhận: "Đã đồng ý lịch hẹn vào ngày..."
        MSG-->>HVA: Bắn thông báo xác nhận thành công
        MSG-->>APP: Tự động lưu cuộc hẹn vào Calendar của cả 2 hội viên kèm chuông báo
    else HV B bấm "Từ chối / Đổi giờ"
        HVB->>APP: Nhập lý do từ chối / đề xuất giờ khác
        APP->>MSG: Cập nhật trạng thái REJECTED / RESCHEDULED
        MSG->>DB: Gửi tin nhắn phản hồi lý do vào luồng chat
        MSG-->>HVA: Thông báo đối tác bận hẹn
    end
```

---

### 1.6. Sơ Đồ Tuần Tự: Sự Kiện & Lưu Vết Kỷ Niệm 5 Hạng Mục

```mermaid
sequenceDiagram
    autonumber
    actor HV as Hội Viên Tham Dự
    participant APP as Mobile App
    participant EVT as Phân Hệ Sự Kiện
    participant MODAL as EventHistoryRecapModal
    participant DRIVE as Google Drive Cloud
    actor BTC as Ban Tổ Chức / Ban Sự Kiện

    Note over BTC,EVT: Sau khi sự kiện bế mạc (Trạng thái ENDED)
    BTC->>EVT: Đóng phiên sự kiện, nhập kết quả lưu vết kỷ niệm
    EVT->>EVT: Lưu 5 khối dữ liệu: Nhà tài trợ, Biểu quyết, Giải thưởng, Chỗ ngồi, Link ảnh

    Note over HV,MODAL: Hội viên xem lại lịch sử & kỷ niệm sự kiện
    HV->>APP: Mở tab "Sự kiện" -> Chọn "Lịch sử sự kiện" -> Chọn sự kiện đã kết thúc
    HV->>APP: Bấm nút "Biên bản & Kỷ niệm sự kiện"
    APP->>MODAL: Mở hộp thoại EventHistoryRecapModal (Huy hiệu Đã kết thúc)
    
    alt Hạng mục 1: Thư mục ảnh Google Drive
        HV->>MODAL: Chọn tab "Thư mục ảnh"
        MODAL->>MODAL: Hiển thị dung lượng 8.4GB, 450+ ảnh RAW & Video 4K
        HV->>MODAL: Bấm "Mở Thư Mục Ảnh Drive Để Tải Về"
        MODAL->>DRIVE: window.open(drivePhotosUrl) -> Mở trực tiếp kho ảnh gốc
    else Hạng mục 2: Danh sách nhà tài trợ
        HV->>MODAL: Chọn tab "Nhà tài trợ"
        MODAL-->>HV: Hiển thị phân hạng Kim Cương, Vàng, Bạc, Đồng Hành kèm Logo & Số tiền
    else Hạng mục 3: Nghị quyết & Biểu quyết
        HV->>MODAL: Chọn tab "Biểu quyết"
        MODAL-->>HV: Hiển thị 3 Nghị quyết đại hội, tỷ lệ %, số đại biểu, trạng thái ĐÃ THÔNG QUA
    else Hạng mục 4: Giải thưởng & Vinh danh
        HV->>MODAL: Chọn tab "Giải thưởng"
        MODAL-->>HV: Hiển thị kết quả Lucky Draw (Xe máy VinFast, laptop, voucher) & Doanh nhân tiêu biểu
    else Hạng mục 5: Sắp xếp sơ đồ chỗ ngồi
        HV->>MODAL: Chọn tab "Sắp xếp chỗ ngồi"
        HV->>MODAL: Gõ tên tra cứu vào ô tìm kiếm nhanh
        MODAL-->>HV: Hiển thị chính xác Bàn Đoàn Chủ tịch VIP 01, Bàn Doanh nghiệp A1-A3, số ghế
    end
```

---

### 1.7. Sơ Đồ Tuần Tự: Đăng Bài Đa Kênh 1-Click (Facebook, Group, Zalo OA, Web)

```mermaid
sequenceDiagram
    autonumber
    actor BTT as Cán Bộ Ban Truyền Thông
    participant CRM as Cổng Quản Trị CRM
    participant BE as Backend Syndication Core
    participant FB as Facebook Graph API
    participant ZALO as Zalo OA API
    participant WEB as Cổng Tin Tức Hiệp Hội
    participant DB as CSDL PostgreSQL

    BTT->>CRM: Soạn thảo thông cáo sự kiện / tin tức mới
    BTT->>CRM: Tải ảnh đại diện, nhập tiêu đề, nội dung tóm tắt
    BTT->>CRM: Bấm nút "Đăng Bài Đa Kênh 1-Click"
    CRM->>BE: Gửi payload bài đăng kèm danh sách kênh cấu hình
    BE->>DB: Lưu bài viết chính thức vào bảng news
    
    par Phát hành Facebook
        BE->>FB: Gửi bài đăng lên Fanpage & Group Hội viên CEO 1983
        FB-->>BE: Trả về post_id thành công
    and Phát hành Zalo
        BE->>ZALO: Gửi Broadcast bài viết tới Zalo OA & Nhóm Ban Chấp Hành
        ZALO-->>BE: Trả về message_id thành công
    and Xuất bản Trang Tin Điện Tử
        BE->>WEB: Cập nhật tin tức lên trang chủ ceo1983.com
        WEB-->>BE: Trả về URL bài viết
    end

    BE->>DB: Ghi nhận lịch sử phát hành đa kênh (status: PUBLISHED)
    BE-->>CRM: Thông báo "Đã đăng bài thành công lên 3 nền tảng trong 1.2s"
```

---

### 1.8. Sơ Đồ Tuần Tự: Thanh Toán Điện Tử QR MoMo & VNPay Gạch Nợ Tự Động

```mermaid
sequenceDiagram
    autonumber
    actor HV as Hội Viên
    participant APP as Mobile App CEO 1983
    participant PAY_SRV as Payment Strategy Core
    participant MOMO as Cổng Ví MoMo
    participant VNPAY as Cổng Quốc Gia VNPay
    participant DB as CSDL PostgreSQL

    HV->>APP: Chọn nộp hội phí thường niên (10.000.000 đ)
    APP->>PAY_SRV: Yêu cầu khởi tạo giao dịch thanh toán
    
    alt Lựa chọn 1: Thanh toán qua Mã QR MoMo
        PAY_SRV->>MOMO: Khởi tạo đơn hàng (Mã GD, Số tiền, Chữ ký HMAC)
        MOMO-->>PAY_SRV: Trả về deeplink & mã QR MoMo
        PAY_SRV-->>APP: Hiển thị mã QR MoMo có nội dung "CEO1983 HOIPHI CEO83001"
        HV->>MOMO: Quét mã trên App MoMo -> Bấm thanh toán
        MOMO->>PAY_SRV: Webhook IPN thông báo giao dịch thành công (HMAC verified)
    else Lựa chọn 2: Thanh toán qua Cổng VNPay
        PAY_SRV->>VNPAY: Tạo URL chuyển hướng thanh toán VNPay
        VNPAY-->>APP: Mở cổng thanh toán VNPay (ATM/Visa/Mobile Banking)
        HV->>VNPAY: Xác thực OTP ngân hàng thành công
        VNPAY->>PAY_SRV: Webhook IPN gửi kết quả giao dịch mã vnp_ResponseCode=00
    end

    PAY_SRV->>DB: Bắt đầu Transaction nguyên tử (ACID):
    PAY_SRV->>DB: 1. Tạo bản ghi transactions (COMPLETED)
    PAY_SRV->>DB: 2. Cập nhật invoices (PAID)
    PAY_SRV->>DB: 3. Gạch nợ hội phí của hội viên sang trạng thái ĐÃ NỘP ĐỦ
    PAY_SRV-->>APP: Bắn thông báo đẩy: "Thanh toán thành công! Đã cấp biên lai điện tử"
```

---

### 1.9. Sơ Đồ Tuần Tự: Bình Luận Cây 3 Cấp, Menu 3 Chấm & Tag `@` Đối Tác Đã Kết Nối

```mermaid
sequenceDiagram
    autonumber
    actor HVA as Hội Viên A (Người Bình Luận)
    participant APP as Mobile App CEO 1983
    participant FEED as Feed & Comment Core
    participant DB as CSDL PostgreSQL
    actor HVB as Hội Viên B (Người Được Tag `@`)

    HVA->>APP: Mở bài viết mạng lưới -> Chọn vùng bình luận
    HVA->>APP: Gõ ký tự "@" trên bàn phím
    APP->>FEED: Gọi API GET /members/connected-network
    FEED->>DB: Truy vấn danh sách đối tác ĐÃ KẾT NỐI với HV A (loại bỏ người chưa kết nối)
    FEED-->>APP: Trả về danh sách đối tác kết nối kèm ảnh avatar & tên công ty
    APP-->>HVA: Mở popup gợi ý autocomplete
    HVA->>APP: Chọn HV B -> Hiển thị thẻ Chip tag xanh kèm nút [x] xóa nhanh
    HVA->>APP: Nhập nội dung thảo luận -> Bấm Gửi bình luận
    
    APP->>FEED: Gửi bình luận (parentId nếu là reply, mentionUserIds: [HVB])
    FEED->>DB: Lưu bình luận phân cấp dạng cây (Level 1, 2, 3)
    FEED-->>HVB: Bắn thông báo đẩy: "Hội viên A đã nhắc tên bạn trong một thảo luận"
    FEED-->>APP: Cập nhật luồng bình luận đưa thảo luận mới lên đầu danh sách

    Note over HVA,APP: Thao tác Menu 3 chấm (...) hoặc Nhấn giữ
    alt Bình luận của chính mình
        HVA->>APP: Chạm menu 3 chấm (...) tại bình luận của mình
        APP-->>HVA: Mở menu 4 tùy chọn: [Chỉnh sửa, Xóa bình luận, Sao chép, Phản hồi]
        HVA->>APP: Chọn "Sao chép" -> Lưu text vào Clipboard kèm Toast thông báo
    else Bình luận của người khác
        HVA->>APP: Chạm menu 3 chấm (...) tại bình luận của người khác
        APP-->>HVA: Mở menu 2 tùy chọn an toàn: [Sao chép nội dung, Phản hồi]
    end
```

---

### 1.10. Sơ Đồ Trạng Thái: Vòng Đời Hồ Sơ Hội Viên (Member Lifecycle State Diagram)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Khởi tạo hồ sơ trực tuyến
    DRAFT --> PENDING_APPROVAL: Gửi đơn đăng ký hoàn tất
    
    state PENDING_APPROVAL {
        [*] --> THAM_TRA_HOI_VIEN: Ban Thành Viên thẩm tra năm sinh 1983 & MST
        THAM_TRA_HOI_VIEN --> HO_SO_HOP_LE: Đáp ứng điều lệ CLB
        THAM_TRA_HOI_VIEN --> THIEU_GIAY_TO: Ban Thư Ký yêu cầu bổ sung
        THIEU_GIAY_TO --> THAM_TRA_HOI_VIEN: Đã bổ sung hồ sơ
    }

    PENDING_APPROVAL --> ACTIVE: Ban Thành Viên bấm Duyệt Kết Nạp (Cấp mã CEO-83xxx)
    PENDING_APPROVAL --> REJECTED: Không đáp ứng điều lệ (Từ chối kết nạp)
    
    ACTIVE --> SUSPENDED: Quá hạn đóng hội phí / Đang xử lý khiếu nại
    SUSPENDED --> ACTIVE: Đã hoàn tất nghĩa vụ tài chính
    ACTIVE --> TERMINATED: Vi phạm nghiêm trọng đạo đức / Tự nguyện rút lui
    
    REJECTED --> [*]
    TERMINATED --> [*]
```

---

### 1.11. Sơ Đồ Trạng Thái: Vòng Đời Cơ Hội Giao Thương B2B (Opportunity Lifecycle State Diagram)

```mermaid
stateDiagram-v2
    [*] --> OPEN: Đăng tin cơ hội B2B (Định dạng Tỷ/Tr VNĐ)
    
    OPEN --> IN_NEGOTIATION: Có đối tác gửi lời mời hẹn gặp 1-on-1 & Được chấp thuận
    IN_NEGOTIATION --> OPEN: Cuộc gặp kết thúc nhưng chưa đi đến hợp đồng (Tiếp tục mở)
    
    IN_NEGOTIATION --> DEAL_WON: Ký kết hợp đồng thành công (Ghi nhận giá trị giao dịch)
    IN_NEGOTIATION --> DEAL_FAILED: Đàm phán không thành công (Hủy deal)
    
    OPEN --> EXPIRED: Hết hạn tiếp nhận hồ sơ hợp tác
    OPEN --> CANCELLED: Người đăng chủ động đóng cơ hội
    
    DEAL_WON --> [*]
    DEAL_FAILED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
```

---

### 1.12. Sơ Đồ Trạng Thái: Vòng Đời Sự Kiện & Hoạt Động (Event & Meeting Lifecycle State Diagram)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Tạo bản thảo sự kiện / lịch họp ban
    DRAFT --> PUBLISHED: Phát hành chính thức lên ứng dụng
    
    state PUBLISHED {
        [*] --> REGISTRATION_OPEN: Mở đăng ký vé & Giữ chỗ
        REGISTRATION_OPEN --> SOLD_OUT: Hết vé / Đủ đại biểu
        SOLD_OUT --> REGISTRATION_OPEN: Có người hủy vé (Mở lại chỗ)
    }

    PUBLISHED --> IN_PROGRESS: Điểm danh QR Check-in tại cổng sự kiện
    IN_PROGRESS --> ENDED: Bế mạc sự kiện / Hoàn tất phiên họp
    
    state ENDED {
        [*] --> HISTORY_RECAP_ACTIVE: Ban Tổ Chức cập nhật dữ liệu lưu vết
        HISTORY_RECAP_ACTIVE --> SPONSORS_LOGGED: Lưu danh sách Nhà tài trợ
        HISTORY_RECAP_ACTIVE --> POLLS_LOGGED: Lưu kết quả Biểu quyết đại hội
        HISTORY_RECAP_ACTIVE --> AWARDS_LOGGED: Lưu kết quả Giải thưởng Lucky Draw
        HISTORY_RECAP_ACTIVE --> SEATING_LOGGED: Lưu sơ đồ phân bổ chỗ ngồi
        HISTORY_RECAP_ACTIVE --> DRIVE_LINKED: Mở liên kết tải ảnh Google Drive
    }

    ENDED --> [*]
```

---

### 1.13. Sơ Đồ Thực Thể Mối Quan Hệ CSDL (Entity-Relationship Diagram - ERD)

```mermaid
erDiagram
    MEMBERS ||--o{ COMPANIES : owns
    MEMBERS ||--o{ OPPORTUNITIES : posts
    MEMBERS ||--o{ PRODUCTS : lists
    MEMBERS ||--o{ B2B_MEETINGS : initiates
    MEMBERS ||--o{ COMMENTS : writes
    MEMBERS ||--o{ NOTIFICATIONS : receives
    MEMBERS ||--o{ EVENT_REGISTRATIONS : books
    MEMBERS ||--o{ TRANSACTIONS : pays

    EVENTS ||--o{ EVENT_REGISTRATIONS : contains
    EVENTS ||--o{ EVENT_RECAPS : has
    EVENTS ||--o{ EVENT_SPONSORS : sponsored_by

    MEETINGS ||--o{ MEETING_ATTENDEES : invites

    MEMBERS {
        uuid id PK
        string member_code UK "CEO-83xxx"
        string full_name
        string email UK
        string phone UK
        int birth_year "1983"
        string role "ADMIN, BTK, BTV, BGT, BTC, BTT, MEMBER"
        string membership_status "ACTIVE, PENDING, SUSPENDED"
        string avatar_url
    }

    COMPANIES {
        uuid id PK
        uuid member_id FK
        string company_name
        string tax_id UK
        string industry
        string address
        string website
    }

    OPPORTUNITIES {
        uuid id PK
        uuid creator_id FK
        string title
        string trade_type "BUY, SELL"
        bigint budget_vnd
        string status "OPEN, IN_NEGOTIATION, DEAL_WON, DEAL_FAILED"
        timestamp created_at
    }

    PRODUCTS {
        uuid id PK
        uuid company_id FK
        string product_name
        bigint public_price
        bigint member_discount_price
        int display_order "Max 5 per company"
    }

    B2B_MEETINGS {
        uuid id PK
        uuid initiator_id FK
        uuid receiver_id FK
        string meeting_type "DIRECT, OPPORTUNITY_LINKED, PRODUCT_LINKED"
        uuid source_id "ID of Opportunity or Product"
        timestamp meeting_time
        string location
        string status "PENDING, CONFIRMED, REJECTED, COMPLETED"
    }

    EVENTS {
        uuid id PK
        string title
        string category "GALA, WORKSHOP, B2B_MATCHING, REGULAR"
        timestamp start_date
        string location
        int max_seats
        bigint ticket_price
        string status "UPCOMING, IN_PROGRESS, ENDED"
    }

    EVENT_RECAPS {
        uuid id PK
        uuid event_id FK
        string drive_photos_url
        jsonb voting_resolutions
        jsonb award_winners
        jsonb seating_chart
    }

    MEETINGS {
        uuid id PK
        string title
        string meeting_type "FIXED_COMMITTEE, EXTRAORDINARY"
        string committee_name "BAN_DIEU_HANH, BAN_XUC_TIEN, BAN_THANH_VIEN"
        timestamp meeting_time
        string online_meet_link
        string documents_list
    }
```

---

### 1.14. Sơ Đồ Luồng Hoạt Động: Phân Loại Hoạt Động Họp Cố Định vs Họp Bất Thường

```mermaid
flowchart TD
    START([Bắt đầu: Mở Tab Hoạt Động]) --> LOAD_MEETINGS[Tải danh sách lịch họp từ API /meetings]
    LOAD_MEETINGS --> FILTER_SELECTION{Người dùng chọn bộ lọc con}

    FILTER_SELECTION -->|Tất cả hoạt động| SHOW_ALL[Hiển thị toàn bộ lịch họp của CLB]
    
    FILTER_SELECTION -->|Họp cố định theo ban| FILTER_FIXED[Lọc category: fixed_committee]
    FILTER_FIXED --> RENDER_FIXED[Hiển thị Badge Xanh Navy: Họp Cố Định Theo Ban<br/>- Họp Ban Điều Hành định kỳ<br/>- Họp Ban Xúc Tiến B2B định kỳ<br/>- Họp Ban Thành Viên thẩm định]

    FILTER_SELECTION -->|Họp bất thường / Đột xuất| FILTER_EXTRA[Lọc category: extraordinary]
    FILTER_EXTRA --> RENDER_EXTRA[Hiển thị Badge Hổ Phách & Icon Cảnh Báo: Họp Bất Thường<br/>- Họp khẩn Ban Thường Trực cứu trợ bão lũ<br/>- Họp hiệp thương liên minh gói thầu B2B 50 tỷ]

    RENDER_FIXED --> ACTION_DECISION{Thao tác hội viên}
    RENDER_EXTRA --> ACTION_DECISION
    SHOW_ALL --> ACTION_DECISION

    ACTION_DECISION -->|Bấm Vào Phòng Họp Ngay| OPEN_JITSI[Mở Iframe phòng họp trực tuyến Jitsi Meet an toàn]
    ACTION_DECISION -->|Bấm Xác Nhận Tham Dự| CONFIRM_ATTEND[Ghi nhận điểm danh & Cập nhật danh sách đại biểu]
    ACTION_DECISION -->|Xem Tài Liệu Đính Kèm| VIEW_DOCS[Mở tệp báo cáo tài chính / dự thảo kế hoạch]
```

---

### 1.15. Sơ Đồ Luồng Hoạt Động: Nhập Bảng Tính & Bóc Tách Trường Thông Minh (Smart Import)

```mermaid
flowchart TD
    A([Bắt đầu: Kéo thả tệp Excel .xlsx/.xls]) --> B[Đọc file dạng nhị phân qua SheetJS]
    B --> C[Phân tích hàng đầu tiên: Header Columns]
    C --> D{Tự động nhận diện tiêu đề cột tiếng Việt}
    
    D -->|Khớp chính xác| E[Gán tự động: Họ tên, SĐT, Email, Công ty, MST, Chức vụ]
    D -->|Không khớp| F[Mở giao diện Ánh Xạ Cột cho người dùng tự nối trường]
    
    E --> G[Kiểm tra tính hợp lệ từng dòng: Validation Engine]
    F --> G
    
    G --> H{Phát hiện lỗi trùng SĐT hoặc sai định dạng?}
    H -->|Có lỗi| I[Đánh dấu đỏ dòng lỗi & Hiển thị cảnh báo số lượng vi phạm]
    H -->|Hợp lệ| J[Hiển thị danh sách Xem Trước Preview Data xanh sạch]
    
    I --> K{Người dùng chọn cách xử lý}
    K -->|Bỏ qua các dòng lỗi| J
    K -->|Hủy tệp để sửa lại| L([Kết thúc luồng nhập])
    
    J --> M[Người dùng bấm 'Xác Nhận Lưu Vào Danh Bạ']
    M --> N[Backend thực thi Batch Insert có Transaction an toàn]
    N --> O[Tự động sinh mã hội viên CEO-83xxx & Cập nhật danh bạ CRM]
    O --> P([Hoàn tất: Báo cáo số lượng bản ghi đã nạp thành công])
```

---

## CHƯƠNG 2: MA TRẬN USE CASE & ĐẶC TẢ CHI TIẾT 30 USE CASES CHUẨN IEEE 830

### 2.1. Ma Trận Use Case Phân Hệ Quản Trị Web CRM

| Mã Use Case | Tên Use Case Nghiệp Vụ | Tác Nhân Chính | Mục Tiêu Nghiệp Vụ Cốt Lõi | Mức Ưu Tiên |
| :--- | :--- | :--- | :--- | :--- |
| **UC-CRM-001** | Tiếp Nhận & Phê Duyệt Kết Nạp Hội Viên Mới | Ban Thành Viên | Xác minh năm sinh 1983, MST, phê duyệt và cấp mã CEO-83xxx | Bắt buộc (P1) |
| **UC-CRM-002** | Quản Lý Hồ Sơ 360 Độ & Chi Hội Trực Thuộc | Ban Thư Ký | Quản lý danh bạ doanh nhân, cập nhật chức vụ và phân ban | Bắt buộc (P1) |
| **UC-CRM-003** | Trung Tâm Thống Kê Chỉ Số Đa Chiều 5 Chu Kỳ | Ban Quản Trị / BGT | Phân tích số liệu cơ hội, doanh số, lượt tham dự và cống hiến | Bắt buộc (P1) |
| **UC-CRM-004** | Xuất Báo Cáo Bảng Tính Excel 3 Chế Độ | Ban Tài Chính / Kế toán | Xuất theo chu kỳ, theo hội viên chi tiết và phân tích biến động | Bắt buộc (P1) |
| **UC-CRM-005** | Nhập Dữ Liệu Bảng Tính Thông Minh (Smart Import) | Ban Thành Viên / BTK | Tự động bóc tách cột, phát hiện trùng lặp và nạp danh bạ nhanh | Bắt buộc (P1) |
| **UC-CRM-006** | Cấu Hình Kênh Mạng Xã Hội (FB, Group, Zalo OA) | Ban Truyền Thông | Thiết lập liên kết fanpage, nhóm Zalo và tham số tích hợp | Bắt buộc (P1) |
| **UC-CRM-007** | Đăng Bài Đa Kênh Đồng Loạt 1-Click Syndication | Ban Truyền Thông | Phát hành thông cáo, sự kiện đồng thời lên Web, FB, Zalo trong 1s | Bắt buộc (P1) |
| **UC-CRM-008** | Quản Trị Hệ Thống Trang Đích Landing Web Đa Mẫu | Ban Truyền Thông | Tạo trang đích, chọn mẫu Timed Cards hoặc Startup Mobile Showcase | Bắt buộc (P1) |
| **UC-CRM-009** | Cấu Hình Dynamic Tree Menu & Gán Subdomain | Ban Truyền Thông | Thiết lập menu đa cấp mở màn con, gán tên miền phụ độc lập | Bắt buộc (P1) |
| **UC-CRM-010** | Trình Xem Tài Liệu Toàn Năng (Word/Excel/PDF) | Ban Thư Ký / Hội viên | Xem trực tiếp tài liệu Word A4, Excel đa tabs, PDF nhúng trực quan | Bắt buộc (P1) |
| **UC-CRM-011** | Quản Trị Bầu Cử Ban Chấp Hành & Biểu Quyết | Ban Quản Trị / Đại hội | Tạo hòm phiếu điện tử, kiểm phiếu realtime, khóa cờ xóa sạch | Bắt buộc (P1) |
| **UC-CRM-012** | Phân Quyền Vai Trò An Toàn RBAC Matrix | Quản Trị Viên Tối Cao | Gán quyền theo chuyên ban, hiển thị badge bảo vệ, nút lưu an toàn | Bắt buộc (P1) |
| **UC-CRM-013** | Kiểm Duyệt & Quản Trị Sàn Thương Mại B2B | Ban Giao Thương | Kiểm soát chất lượng sản phẩm, giới hạn 5 sản phẩm/doanh nghiệp | Bắt buộc (P1) |
| **UC-CRM-014** | Quản Lý Sổ Quỹ Thu Chi & Đối Soát MoMo/VNPay | Ban Tài Chính | Gạch nợ tự động, theo dõi dòng tiền minh bạch, xuất sao kê | Bắt buộc (P1) |
| **UC-CRM-015** | Điều Phối Cuộc Họp Ban Cố Định & Bất Thường | Ban Thư Ký | Tạo lịch họp định kỳ và khẩn cấp, tài liệu, link Jitsi Meet | Bắt buộc (P1) |

---

### 2.2. Đặc Tả Chi Tiết Các Use Cases Quản Trị CRM Điển Hình

#### UC-CRM-001: Tiếp Nhận & Phê Duyệt Kết Nạp Hội Viên Mới
* **Tác nhân chính:** Cán bộ Ban Thành Viên (Người có thẩm quyền duyệt).
* **Tác nhân phụ:** Ban Thư Ký (Hỗ trợ thẩm tra ban đầu), Ứng viên doanh nhân.
* **Điều kiện tiên quyết:** Ứng viên đã nộp đơn đăng ký trực tuyến kèm đầy đủ ảnh CCCD, năm sinh 1983 và Giấy phép ĐKKD.
* **Điều kiện sau khi thực hiện:** Tài khoản hội viên được kích hoạt trạng thái `ACTIVE`, sinh mã `CEO-83xxx`, gửi email chào mừng và thông tin đăng nhập app.
* **Luồng sự kiện chính (Main Flow):**
  1. Cán bộ Ban Thành Viên đăng nhập Cổng Quản Trị CRM và truy cập danh mục "Quản lý Hội viên" -> Tab "Chờ Phê Duyệt".
  2. Hệ thống hiển thị danh sách hồ sơ mới nộp kèm chỉ số cảnh báo thời gian chờ duyệt.
  3. Cán bộ chọn một hồ sơ để mở bảng thông tin chi tiết 360 độ.
  4. Cán bộ kiểm tra đối soát:
     - Xác thực năm sinh: Đúng năm Quý Hợi 1983.
     - Tra cứu Mã số thuế trên Cổng thông tin Quốc gia về Đăng ký Doanh nghiệp.
     - Xác nhận chức danh điều hành doanh nghiệp (Chủ tịch HĐQT, Tổng Giám Đốc, Giám Đốc Điều Hành).
  5. Cán bộ bấm nút "Phê Duyệt Kết Nạp Chính Thức".
  6. Hệ thống hiển thị hộp thoại xác nhận kèm số thứ tự tự tăng tiếp theo.
  7. Cán bộ bấm "Xác Nhận". Hệ thống khởi tạo Database Transaction:
     - Cập nhật trạng thái `membership_status = 'ACTIVE'`.
     - Sinh mã định danh chính thức: `CEO-83xxx`.
     - Khởi tạo ví danh thiếp điện tử và cấp mã QR cá nhân hóa.
     - Kích hoạt dịch vụ gửi thư điện tử phát hành thông cáo kết nạp.
  8. Hệ thống thông báo: "Đã phê duyệt kết nạp thành công Hội viên [Tên] - Mã số: CEO-83xxx".
* **Luồng rẽ nhánh / Ngoại lệ (Alternative & Exception Flows):**
  - *4a. Hồ sơ thiếu giấy tờ:* Cán bộ bấm "Yêu Cầu Bổ Sung" -> Nhập lý do (ví dụ: "Thiếu ảnh giấy phép ĐKKD") -> Hệ thống gửi thông báo và giữ nguyên trạng thái `PENDING_APPROVAL`.
  - *4b. Ứng viên không đúng năm sinh 1983:* Cán bộ bấm "Từ Chối Kết Nạp" -> Nhập lý do vi phạm điều lệ -> Hệ thống chuyển trạng thái `REJECTED`.
* **Quy tắc nghiệp vụ (Business Rules):**
  - Ban Thư Ký tuyệt đối không thể nhìn thấy nút bấm phê duyệt chính thức (chỉ có quyền xem và ghi chú).
  - Mã hội viên là bất biến, không trùng lặp và không bị xóa bỏ ngay cả khi hội viên rút lui.

---

#### UC-CRM-004: Xuất Báo Cáo Bảng Tính Excel 3 Chế Độ
* **Tác nhân chính:** Kế toán CLB / Cán bộ Ban Tài Chính.
* **Điều kiện tiên quyết:** Đã đăng nhập CRM với vai trò Kế toán hoặc Ban Tài Chính.
* **Luồng sự kiện chính (Main Flow):**
  1. Người dùng truy cập phân hệ "Thống Kê Tài Chính & Đối Soát" trên CRM.
  2. Bấm nút "Xuất Báo Cáo Excel".
  3. Hệ thống mở hộp thoại tùy chọn với 3 chế độ xuất chuyên biệt:
     - *Chế độ 1: Xuất theo chu kỳ thời gian (Tháng, Quý, Năm).*
     - *Chế độ 2: Xuất phân tích chi tiết từng hội viên (Mỗi hội viên 1 dòng/sheet).*
     - *Chế độ 3: Xuất báo cáo biến động tăng trưởng & so sánh kỳ trước.*
  4. Người dùng chọn chế độ mong muốn và thiết lập mốc thời gian.
  5. Bấm "Tải Báo Cáo Excel".
  6. Hệ thống tổng hợp dữ liệu thời gian thực từ CSDL PostgreSQL, sử dụng thư viện SheetJS để dựng file `.xlsx` chuẩn mẫu văn bản tài chính (tiêu đề hiệp hội, ngày giờ xuất, bảng số liệu định dạng phân cách hàng nghìn, công thức hàm SUM tự động).
  7. Trình duyệt tự động tải tệp tin về máy tính người dùng trong vòng dưới 2 giây.

---

### 2.3. Ma Trận Use Case Phân Hệ Ứng Dụng Di Động

| Mã Use Case | Tên Use Case Nghiệp Vụ | Tác Nhân Chính | Mục Tiêu Nghiệp Vụ Cốt Lõi | Mức Ưu Tiên |
| :--- | :--- | :--- | :--- | :--- |
| **UC-APP-001** | Đăng Ký Tài Khoản & Nộp Hồ Sơ Trực Tuyến | Khách mời / Doanh nhân | Nộp hồ sơ gia nhập, upload giấy phép kinh doanh trên điện thoại | Bắt buộc (P1) |
| **UC-APP-002** | Đăng Nhập & Chào Mừng AI Ngày Đầu Tiên | Doanh nhân Hội viên | Đăng nhập sinh trắc học, AI chào đón theme sáng, tải dữ liệu sống | Bắt buộc (P1) |
| **UC-APP-003** | Thẻ Doanh Nhân Điện Tử & Mã QR Cá Nhân | Doanh nhân Hội viên | Thẻ nhận diện số, quét QR danh thiếp và check-in sự kiện | Bắt buộc (P1) |
| **UC-APP-004** | Đăng Tin Cơ Hội Giao Thương B2B | Doanh nhân Hội viên | Tạo bài đăng tìm đối tác, tự động format ngân sách Tỷ/Tr VNĐ | Bắt buộc (P1) |
| **UC-APP-005** | Mở Gian Hàng Sản Phẩm Doanh Nghiệp | Doanh nhân Hội viên | Niêm yết sản phẩm tiêu biểu (tối đa 5), ưu đãi đặc quyền nội khối | Bắt buộc (P1) |
| **UC-APP-006** | Đặt Lịch Hẹn 1-on-1 Tình Huống 1: Tự Do B2B | Doanh nhân Hội viên | Tra cứu đối tác theo ngành và chủ động đặt lịch làm việc | Bắt buộc (P1) |
| **UC-APP-007** | Đặt Lịch Hẹn 1-on-1 Tình Huống 2: Từ Cơ Hội | Doanh nhân Hội viên | Bấm hẹn gặp trực tiếp từ tin cơ hội, tự động gắn tiêu đề cơ hội | Bắt buộc (P1) |
| **UC-APP-008** | Đặt Lịch Hẹn 1-on-1 Tình Huống 3: Từ Sản Phẩm | Doanh nhân Hội viên | Bấm hẹn làm việc từ gian hàng sản phẩm để đàm phán hợp đồng | Bắt buộc (P1) |
| **UC-APP-009** | Tự Động Nhắn Tin & Xác Nhận Lịch Hẹn | Hệ thống / Hội viên | Tự động gửi tin nhắn vào hộp thư chat khi tạo và đồng ý lịch gặp | Bắt buộc (P1) |
| **UC-APP-010** | Bản Tin Mạng Lưới & Đăng Bài Mục 'Khác' | Doanh nhân Hội viên | Chia sẻ hoạt động, bài học quản trị, đính kèm đa phương tiện | Bắt buộc (P1) |
| **UC-APP-011** | Bình Luận Cây & Menu 3 Chấm Chuẩn Facebook | Doanh nhân Hội viên | Bình luận đa cấp, menu 3 chấm Sao chép/Chỉnh sửa/Xóa/Phản hồi | Bắt buộc (P1) |
| **UC-APP-012** | Nhắc Tên `@` Đối Tác Đã Kết Nối & Tag Chip | Doanh nhân Hội viên | Autocomplete chỉ gợi ý hội viên đã kết nối, gắn chip xóa nhanh | Bắt buộc (P1) |
| **UC-APP-013** | Chia Sẻ Public OpenGraph Mạng Xã Hội | Doanh nhân Hội viên | Chia sẻ link bài viết/cơ hội ra FB/Zalo hiển thị đúng card ảnh | Bắt buộc (P1) |
| **UC-APP-014** | Sự Kiện & Lưu Vết Kỷ Niệm 5 Hạng Mục | Doanh nhân Hội viên | Đăng ký vé QR, xem kỷ yếu: Nhà tài trợ, Biểu quyết, Giải, Ghế, Drive | Bắt buộc (P1) |
| **UC-APP-015** | Tham Gia Họp Ban & Nộp Phí MoMo/VNPay | Doanh nhân Hội viên | Lọc họp ban cố định vs bất thường, vào Jitsi, nộp phí qua QR MoMo | Bắt buộc (P1) |

---

### 2.4. Đặc Tả Chi Tiết Các Use Cases Mobile App Điển Hình

#### UC-APP-006 / 007 / 008: Đặt Lịch Hẹn Giao Thương 1-on-1 (3 Tình Huống)
* **Tác nhân chính:** Hội viên A (Người khởi xướng cuộc hẹn).
* **Tác nhân phụ:** Hội viên B (Đối tác được mời hẹn).
* **Luồng sự kiện chính (Main Flow):**
  1. Hội viên A tiếp cận chức năng lên lịch gặp thông qua 1 trong 3 tình huống nghiệp vụ:
     - *Tình huống 1 (Tự do):* Truy cập tab "Mạng Lưới" -> Mục "Gặp Mặt B2B" -> Tìm kiếm Hội viên B -> Bấm "Lên lịch gặp 1-on-1".
     - *Tình huống 2 (Từ Cơ hội):* Đọc bài viết cơ hội hợp tác của Hội viên B -> Bấm nút "Hẹn gặp trao đổi cơ hội".
     - *Tình huống 3 (Từ Sản phẩm):* Xem chi tiết giải pháp/sản phẩm trên Sàn thương mại -> Bấm "Lên lịch làm việc B2B".
  2. Hệ thống hiển thị biểu mẫu thiết lập cuộc hẹn:
     - Ngữ cảnh gốc (tiêu đề cơ hội hoặc tên sản phẩm) được tự động điền sẵn và khóa chỉnh sửa để tránh nhầm lẫn.
     - Chọn ngày gặp (sử dụng lịch tương tác kiểm tra không trùng lịch cá nhân).
     - Chọn khung giờ (buổi sáng, buổi chiều hoặc giờ hẹn chính xác).
     - Chọn hình thức: *Trực tiếp (Tại văn phòng, Cafe, Trụ sở HanoiBA)* hoặc *Trực tuyến (Phòng họp bảo mật Jitsi Meet)*.
     - Nhập nội dung trao đổi trọng tâm.
  3. Hội viên A bấm nút "Xác Nhận Đặt Lịch Hẹn".
  4. Hệ thống thực thi xử lý nghiệp vụ tự động:
     - Khởi tạo bản ghi cuộc hẹn trong cơ sở dữ liệu với trạng thái `PENDING`.
     - **Tự động gửi một tin nhắn văn bản chính thức vào hộp thư trò chuyện giữa Hội viên A và Hội viên B** với nội dung: *"Lời mời hẹn gặp B2B: [Nội dung] - Thời gian: [Giờ/Ngày] - Địa điểm: [Địa điểm]"*.
     - Bắn thông báo đẩy (Push Notification) đến điện thoại của Hội viên B.
  5. Hội viên B nhận thông báo, mở hộp thư tin nhắn và bấm "Đồng Ý Gặp":
     - Hệ thống cập nhật trạng thái cuộc hẹn thành `CONFIRMED`.
     - **Tiếp tục tự động gửi một tin nhắn xác nhận vào luồng chat của cả hai bên:** *"Hội viên B đã đồng ý cuộc hẹn B2B vào lúc [Giờ/Ngày]"*.
     - Tự động bổ sung sự kiện vào Lịch công tác cá nhân của cả 2 hội viên kèm bộ đếm ngược báo thức nhắc hẹn trước 30 phút.

---

#### UC-APP-014: Sự Kiện & Lưu Vết Kỷ Niệm 5 Hạng Mục
* **Tác nhân chính:** Doanh nhân Hội viên.
* **Tác nhân phụ:** Ban Tổ Chức sự kiện, Ban Truyền Thông.
* **Điều kiện tiên quyết:** Sự kiện đã diễn ra và được đánh dấu trạng thái kết thúc (`ENDED`).
* **Luồng sự kiện chính (Main Flow):**
  1. Hội viên mở màn hình "Sự Kiện" -> Chuyển sang danh mục con "Lịch sử sự kiện".
  2. Danh sách các sự kiện đã kết thúc hiển thị kèm huy hiệu "Kỷ yếu sự kiện".
  3. Hội viên chạm vào thẻ sự kiện hoặc bấm nút "Biên bản & Kỷ niệm".
  4. Hệ thống mở hộp thoại toàn màn hình `EventHistoryRecapModal`, mặc định mở tab "Thư mục ảnh".
  5. Hội viên tương tác với 5 hạng mục lưu vết toàn diện:
     - **Hạng mục 1 (Thư mục ảnh Google Drive):** Thể hiện dung lượng 8.4 GB, 450+ ảnh RAW và video recap 4K. Bấm nút "Mở Thư Mục Ảnh Drive Để Tải Về", hệ thống gọi lệnh `window.open(drivePhotosUrl, '_blank')` để tải ảnh trực tiếp không bị giảm độ phân giải.
     - **Hạng mục 2 (Nhà tài trợ đồng hành):** Xem danh sách phân hạng theo Kim Cương, Vàng, Bạc, Đồng Hành B2B kèm Logo doanh nghiệp, người đại diện và số tiền tài trợ.
     - **Hạng mục 3 (Biểu quyết đại hội):** Xem toàn văn 3 Nghị quyết đại hội được thông qua, tỷ lệ tán thành 98.6% - 100%, số đại biểu tán thành và trạng thái ban hành.
     - **Hạng mục 4 (Giải thưởng & Vinh danh):** Xem kết quả bốc thăm trúng thưởng Lucky Draw (Giải đặc biệt xe máy điện VinFast Feliz S mã #1983, laptop Lenovo ThinkPad, voucher Flamingo Resort) và cúp vinh danh lãnh đạo cống hiến.
     - **Hạng mục 5 (Sắp xếp chỗ ngồi):** Xem sơ đồ bố trí bàn tiệc VIP 01, Bàn Doanh nghiệp A1-A3, đại biểu từng ghế; hỗ trợ ô tra cứu nhanh theo tên hội viên hoặc tên công ty.

---

## CHƯƠNG 3: ĐẶC TẢ YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

### 3.1. Nhóm Chức Năng Quản Trị Trung Ương CRM
* **FR-CRM-01 (Quản lý Hồ sơ Hội viên):** Thu thập thông tin 360 độ (MST, ngành nghề, pháp nhân, năm sinh 1983). Phân định ranh giới giữa quyền thẩm tra của Ban Thư Ký và quyền phê duyệt duy nhất của Ban Thành Viên.
* **FR-CRM-02 (Trung tâm Thống kê & 3 Chế độ Xuất Excel):** Báo cáo theo chu kỳ (Tháng, Quý, Năm); Báo cáo chi tiết từng hội viên; Báo cáo biến động tăng trưởng. Cơ chế Nhập Excel thông minh (Smart Import) tự động bóc tách và ánh xạ cột.
* **FR-CRM-03 (Tích hợp Đa kênh 1-Click):** Cấu hình đường dẫn Fanpage, Group, Zalo OA. Bấm 1 nút duy nhất để đồng loạt phát hành bài viết lên toàn bộ mạng xã hội.
* **FR-CRM-04 (Quản lý Landing Web Đa Mẫu):** Cung cấp sẵn 2 bản mẫu chuẩn quốc tế: *Timed Cards Opening* (lăn chuột/vuốt chuyển thẻ) và *Startup Mobile Showcase* (khung iPhone 16, ruy băng 4 chỉ số vàng, 3D cards chuẩn `ceo1983.com`).
* **FR-CRM-05 (Trình Xem Tài Liệu Toàn Năng):** Mở xem trực tiếp tệp Word định dạng trang giấy A4 tiêu chuẩn; Bảng tính Excel hiển thị nhiều sheet tabs và ô lọc; Tài liệu PDF nhúng trực quan.
* **FR-CRM-06 (Bầu Cử & Phân Quyền Vai Trò):** Quản lý biểu quyết đại hội với cơ chế bảo vệ cờ hệ thống (xóa sạch không bao giờ tự nạp lại dữ liệu ảo). Cột vai trò hiển thị huy hiệu bảo vệ, không cho chọn select trực tiếp để chống thao tác nhầm.

### 3.2. Nhóm Chức Năng Ứng Dụng Di Động Hội Viên
* **FR-APP-01 (Thẻ Doanh Nhân & QR Code):** Thẻ số nhận diện chuẩn màu Navy & Vàng Gold. Mã QR cá nhân hóa tích hợp xem danh thiếp và check-in sự kiện dưới 0.3s.
* **FR-APP-02 (Sàn B2B & Cơ Hội Hợp Tác):** Đăng tin cơ hội format thông minh (Tỷ/Tr VNĐ). Gian hàng sản phẩm giới hạn tối đa 5 sản phẩm tiêu biểu mỗi doanh nghiệp, chiết khấu đặc quyền thành viên.
* **FR-APP-03 (Lên Lịch Hẹn 1-on-1 trong 3 Case):** Hẹn tự do, hẹn từ cơ hội, hẹn từ sản phẩm. Tự động gửi tin nhắn thông báo và xác nhận vào luồng chat 2 bên, đồng bộ lịch điện thoại.
* **FR-APP-04 (Bản Tin Mạng Lưới & Bình Luận Cây):** Đăng bài chuyên mục (Kinh doanh, Đào tạo, Sự kiện, "Khác"). Bình luận phân cấp cây 3 tầng, menu 3 chấm (Sao chép, Chỉnh sửa, Xóa, Phản hồi), tag `@` đối tác đã kết nối.
* **FR-APP-05 (Chia Sẻ Public Ra Ngoài):** Tạo liên kết OpenGraph chuẩn thẻ ảnh, tiêu đề và mô tả chính xác của bài đăng khi chia sẻ sang Facebook, Zalo.
* **FR-APP-06 (Trung Tâm Thống Kê & Minh Chứng):** Biểu đồ 5 chu kỳ (Ngày/Tuần/Tháng/Quý/Năm), nhãn trục X nghiêng 35 độ, tooltip thẻ Card nền trắng phân định rõ số lượng tin và giá trị tiền Tỷ VNĐ. Chạm từng ô để mở danh sách minh chứng thực tế.
* **FR-APP-07 (Trợ Lý AI Không Viền & Theme Sáng):** Lời chào mừng đăng nhập ngày đầu tiên với giao diện không viền bo, nền trắng sáng, tải dữ liệu sống thời gian thực về sự kiện và cơ hội hôm nay.

---

## CHƯƠNG 4: ĐẶC TẢ CỔNG THANH TOÁN ĐIỆN TỬ (MÃ QR MOMO & CỔNG VNPAY)

1. **Chuẩn Hóa Cổng Thanh Toán Độc Lập:**
   - Hệ thống loại bỏ hoàn toàn dịch vụ VietQR, chuyển sang tích hợp trực tiếp 2 giải pháp thanh toán điện tử hàng đầu Việt Nam:
     * **Mã QR Ví Điện Tử MoMo:** Tự động phát sinh mã QR MoMo mang mã hóa định danh hội viên và số tiền chính xác, tương thích ứng dụng Ví MoMo và 40+ ứng dụng ngân hàng.
     * **Cổng Thanh Toán Quốc Gia VNPay:** Hỗ trợ thanh toán bảo mật đa kênh qua thẻ ATM nội địa, thẻ quốc tế (Visa, Mastercard, JCB) và quét mã VNPay-QR trên ứng dụng ngân hàng.
2. **Cơ Chế Gạch Nợ & Đối Soát Tự Động:**
   - Xác thực chữ ký số băm mật mã học HMAC-SHA256 trên Webhook IPN gửi từ cổng thanh toán.
   - Khi giao dịch thành công, hệ thống thực thi Database Transaction tự động gạch nợ hội phí, phát hành hóa đơn điện tử và gửi thông báo xác nhận tới hội viên ngay lập tức.

---

## CHƯƠNG 5: YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

* **NFR-01 (Hiệu năng):** Phản hồi API dưới 800ms cho 95% yêu cầu; Quét mã QR check-in sự kiện dưới 300ms.
* **NFR-02 (Bảo mật Zero-Trust):** Mã hóa mật khẩu Bcrypt (Cost 10); Xác thực Token JWT HS256 có kiểm tra thời hạn; Chống tấn công XSS, SQL Injection và kiểm soát IDOR trên toàn bộ các Endpoint ghi dữ liệu.
* **NFR-03 (Tính sẵn sàng & Khôi phục):** Độ sẵn sàng hệ thống đạt 99.9%; Tự động sao lưu CSDL PostgreSQL định kỳ 24h/lần.
* **NFR-04 (Nhận diện thương hiệu & Thân thiện):** Toàn bộ giao diện Web CRM và Mobile App tuân thủ nghiêm ngặt bảng màu chuẩn: Xanh Navy `#003B95`, Xanh Đậm `#1F3864`, Vàng Gold `#F59E0B`. Loại bỏ hoàn toàn các nút có màu gradient, đảm bảo tính trang nhã và đẳng cấp doanh nhân.

---

## CHƯƠNG 6: MA TRẬN TRUY XUẤT TÍNH NĂNG (TRACEABILITY MATRIX)

| Mã Yêu Cầu Chức Năng | Mã Use Case Tương Ứng | Thành Phần Frontend | Module Backend | Bảng CSDL PostgreSQL |
| :--- | :--- | :--- | :--- | :--- |
| **FR-CRM-01** | `UC-CRM-001`, `UC-CRM-002` | `admin.members.tsx` | `members.service.ts` | `public.members` |
| **FR-CRM-02** | `UC-CRM-003`, `UC-CRM-004`, `UC-CRM-005` | `admin.analytics.tsx` | `analytics.service.ts` | `public.analytics`, `public.invoices` |
| **FR-CRM-03** | `UC-CRM-006`, `UC-CRM-007` | `admin.integration.tsx` | `syndication.service.ts` | `public.app_settings` |
| **FR-CRM-04** | `UC-CRM-008`, `UC-CRM-009` | `admin.landing-webs.tsx` | `landing.service.ts` | `public.landing_webs` |
| **FR-CRM-05** | `UC-CRM-010` | `UniversalDocumentViewerModal.tsx` | `documents.service.ts` | `public.documents` |
| **FR-CRM-06** | `UC-CRM-011`, `UC-CRM-012` | `admin.elections.tsx`, `admin.users.tsx` | `elections.service.ts` | `public.polls`, `public.users` |
| **FR-APP-01** | `UC-APP-003` | `association.card.tsx` | `members.service.ts` | `public.members` |
| **FR-APP-02** | `UC-APP-004`, `UC-APP-005` | `association.opportunities.tsx` | `opportunities.service.ts` | `public.opportunities`, `public.products` |
| **FR-APP-03** | `UC-APP-006`, `UC-APP-007`, `UC-APP-008`, `UC-APP-009` | `association.messages.tsx` | `meetings.service.ts`, `messages.service.ts` | `public.b2b_meetings`, `public.messages` |
| **FR-APP-04** | `UC-APP-010`, `UC-APP-011`, `UC-APP-012` | `CommentTreeSection.tsx` | `feed.service.ts` | `public.comments`, `public.notifications` |
| **FR-APP-05** | `UC-APP-013` | `ShareModal.tsx`, `SharePreview.tsx` | `share.controller.ts` | `public.shares` |
| **FR-APP-06** | `UC-APP-014` | `association.events.tsx`, `EventHistoryRecapModal.tsx` | `events.service.ts` | `public.events`, `public.event_recaps` |
| **FR-APP-07** | `UC-APP-002`, `UC-APP-015` | `FirstDayAiWelcomeModal.tsx`, `payment.tsx` | `payment.service.ts` | `public.transactions` |
