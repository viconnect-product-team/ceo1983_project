const fs = require('fs');
const path = require('path');

const VIONE_DIR = path.resolve(__dirname, '../../vione_project');
const DOC_DIR = path.join(VIONE_DIR, 'document');
const FE_DOCS_DIR = path.join(VIONE_DIR, 'apps', 'vione_app_fe', 'public', 'docs');

const mdCrm = `# BỘ SLIDE THUYẾT TRÌNH HỆ THỐNG QUẢN TRỊ CRM VIONE 5.0
**Định dạng:** 16:9 Widescreen Presentation  
**Bộ nhận diện:** Hoàng Gia Vàng Đồng ViOne (Onyx #09090B, Gold #EAB308, Amber #CA8A04)  
**Tập tài liệu:** \`SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx\` / \`.html\` / \`.md\`  

---

### SLIDE 1: TIÊU ĐỀ CHÍNH
- **Tiêu đề:** VIONE AI 5.0 — HỆ THỐNG QUẢN TRỊ CRM & ĐIỀU HÀNH TỰ ĐỘNG THẾ HỆ MỚI
- **Slogan:** Chạm đỉnh tương lai với trợ lý Trí tuệ nhân tạo toàn diện — Ra quyết định thông minh hơn gấp 10 lần.
- **Đơn vị phát hành:** Ban Giải Pháp Chuyển Đổi Số ViOne Ecosystem (Tháng 10 / 2026).

---

### SLIDE 2: BỐI CẢNH THỊ TRƯỜNG & THÁCH THỨC VẬN HÀNH
1. **Phân mảnh dữ liệu:** Bán hàng, công nợ, giao tiếp khách hàng lưu trữ rải rác trên nhiều phần mềm không đồng bộ.
2. **Tắc nghẽn báo cáo:** Lãnh đạo mất từ 2-3 ngày để tổng hợp số liệu doanh thu các chi nhánh, thiếu tính thời sự.
3. **Bỏ sót khách hàng:** Tin nhắn đối tác từ Facebook, Zalo, Web chat và hotline bị thất lạc khi chuyển giao ca.
4. **Lãng phí chi phí phần mềm:** Phải trả tiền cho nhiều gói dịch vụ riêng biệt với các tính năng dư thừa.

---

### SLIDE 3: KIẾN TRÚC HỢP NHẤT 6 TRỤ CỘT
- **ViOne AI Copilot 5.0:** Trợ lý phân tích tài chính & lập kế hoạch tự động.
- **CRM & Bán Hàng 360°:** Quản lý đường ống cơ hội (Pipeline) & giá trị deal.
- **Hộp Thư Đa Kênh Omnibox:** Hợp nhất Zalo OA, Web Chat & ViOne App.
- **Sàn Giao Thương B2B:** Matching nhu cầu mua bán nội bộ bằng AI.
- **Danh Thiếp Số NFC:** Chạm NFC thông minh chia sẻ hồ sơ số 1 giây.
- **Bảo Mật Chuẩn AES-256:** Phân quyền đa cấp độ RBAC & lưu vết audit log.

---

### SLIDE 4: BỘ NÃO VIONE AI COPILOT 5.0
- Đọc trực tiếp dữ liệu cơ sở dữ liệu PostgreSQL bảo mật.
- Tự động tính toán tổng giá trị phễu thương vụ (18.5 Tỷ VNĐ).
- Hiệu suất hệ thống đo lường đạt **98.4%** so với hôm qua (+12.5%).
- Đề xuất kế hoạch hành động 3 bước có thể thực thi ngay lập tức.
- Tự động cập nhật tiến độ hợp đồng và gửi thông báo đa kênh.

---

### SLIDE 5: CHÍNH SÁCH BÁO GIÁ TƯ VẤN DOANH NGHIỆP (CONSULTATIVE PRICING)
- Không niêm yết mức giá cố định trên trang web đại trà.
- **Gói Starter:** Liên hệ nhận ưu đãi (Gói hỗ trợ khởi tạo 0đ).
- **Gói Professional (Khuyên dùng):** Tùy biến theo quy mô nhân sự & phễu bán hàng.
- **Gói Enterprise:** May đo chuyên sâu, Private Cloud, tích hợp SAP/Oracle ERP.
`;

const mdApp = `# BỘ SLIDE THUYẾT TRÌNH APP VIONE CONNECT
**Định dạng:** 16:9 Mobile & Business Ecosystem Presentation  
**Tập tài liệu:** \`SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx\` / \`.html\` / \`.md\`  

---

### SLIDE 1: TIÊU ĐỀ CHÍNH
- **Tiêu đề:** VIONE CONNECT MOBILE APP — DANH THIẾP SỐ NFC & MẠNG LƯỚI KẾT NỐI B2B
- **Mục tiêu:** Một chạm kết nối triệu cơ hội — Tích hợp Trợ lý AI bỏ túi và Bảng tin Moments thời sự.

---

### SLIDE 2: 4 TRỤ CỘT TRẢI NGHIỆM MOBILE
1. **Chạm Thẻ NFC 1 Giây:** Chạm thẻ thông minh vào điện thoại đối tác mở hồ sơ năng lực số đa phương tiện.
2. **Bảng Tin Moments:** Chia sẻ hoạt động ký kết hợp đồng, sự kiện giao thương và tìm kiếm đối tác.
3. **Trò Chuyện Đa Kênh Bảo Mật:** Hệ thống chat nội bộ, gửi báo giá và trao đổi trực tiếp giữa các giám đốc.
4. **Trợ Lý AI Gợi Ý Đối Tác:** Tính toán khoảng cách địa lý và độ tương thích ngành nghề để gợi ý kết nối.
`;

fs.writeFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.md'), mdCrm, 'utf8');
fs.copyFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.md'), path.join(FE_DOCS_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.md'));

fs.writeFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.md'), mdApp, 'utf8');
fs.copyFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.md'), path.join(FE_DOCS_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.md'));

console.log('✓ Hoàn tất Markdown Slides CRM & App ViOne!');
