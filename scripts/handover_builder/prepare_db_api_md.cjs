const fs = require('fs');
const path = require('path');

const src = path.resolve('document/notebooklm/09_DAC_TA_API_VA_THIET_KE_CSDL.md');
let content = fs.readFileSync(src, 'utf8');

const newHeader = `# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL & ĐẶC TẢ REST API
*(DATABASE DESIGN & REST API SPECIFICATIONS - MASTER ENTERPRISE SPEC)*

---

* **Mã tài liệu:** \`DB-API-CEO1983-MASTER-HANOIBA\`
* **Phiên bản:** \`Phiên bản 10.0 Enterprise Handover Standard (Bản Bàn Giao Kỹ Thuật & CSDL Toàn Diện)\`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Đội ngũ Kỹ sư Dữ liệu & Kiến trúc sư Backend NestJS
* **Công nghệ cốt lõi:** PostgreSQL 16+, NestJS Pure 3-Tier, Prisma ORM, JWT Authentication, Redis Cache, Socket.IO Realtime
* **Ngày phát hành:** \`08/11/2026\`

---

## MỤC LỤC TÀI LIỆU

1. **PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU & GIAO TIẾP HỆ THỐNG**
   - 1.1. Triết Lý Thiết Kế Kiến Trúc Backend NestJS Thuần Khiết
   - 1.2. Chuẩn Hóa Khóa Chính UUIDv4 & Tính Toàn Vẹn Quan Hệ
   - 1.3. Cơ Chế Bảo Mật RBAC, DataScopeInterceptor & Xác Thực JWT
2. **PHẦN II: THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL CHI TIẾT (16 BẢNG DỮ LIỆU)**
   - 2.1. Sơ Đồ Quan Hệ Thực Thể Toàn Diện (Full ERD Diagram)
   - 2.2. Phân Hệ Người Dùng, Hội Viên & Doanh Nghiệp (\`vione_users\`, \`members\`, \`companies\`)
   - 2.3. Phân Hệ Phân Quyền Vai Trò & Phân Ban (\`user_roles\`, \`committee_members\`)
   - 2.4. Phân Hệ Giao Thương B2B, Cơ Hội & Đàm Phán Deal (\`opportunities\`, \`opportunity_interests\`)
   - 2.5. Phân Hệ Sản Phẩm & Gian Hàng Sàn TMĐT (\`products\`)
   - 2.6. Phân Hệ Sự Kiện, Sơ Đồ Ghế Cinema & Trạm Soát Vé (\`events\`, \`event_registrations\`)
   - 2.7. Phân Hệ Cuộc Họp Ban & Quản Lý Check-in Độc Lập (\`business_meetings\`, \`meeting_participants\`)
   - 2.8. Phân Hệ Bảng Tin Mạng Lưới & Bình Luận Cây 3 Tầng (\`feed_posts\`, \`feed_comments\`, \`feed_likes\`)
   - 2.9. Phân Hệ Tài Chính, Sổ Quỹ & Thu Hội Phí Niên Liễm (\`financial_transactions\`, \`membership_fees\`)
   - 2.10. Phân Hệ Tích Hợp Zalo OA & Quản Lý Token 6 Giờ (\`zalo_accounts\`)
   - 2.11. Phân Hệ Quản Trị Hệ Thống & Nhật Ký Kiểm Toán (\`audit_logs\`, \`app_settings\`, \`notifications\`)
3. **PHẦN III: ĐẶC TẢ CHI TIẾT 50+ REST API ENDPOINTS CHUẨN DOANH NGHIỆP**
   - 3.1. Phân Hệ Xác Thực & Phiên Làm Việc (Authentication & Session APIs)
   - 3.2. Phân Hệ Quản Trị Hội Viên & Thẩm Định Hồ Sơ (Members APIs)
   - 3.3. Phân Hệ Sự Kiện, Sơ Đồ Bàn Tiệc & Trạm Soát Vé QR Gate (Events & Seating APIs)
   - 3.4. Phân Hệ Cuộc Họp Ban & Quản Lý Check-in Độc Lập (Meetings & Check-in APIs)
   - 3.5. Phân Hệ Cơ Hội Giao Thương B2B & Đàm Phán Deal Sinh Lời (Opportunities & Deals APIs)
   - 3.6. Phân Hệ Sản Phẩm & Sàn TMĐT Nội Khối (Products APIs)
   - 3.7. Phân Hệ Mạng Lưới, Đăng Bài QR & Bình Luận Cây (Feed & Comments APIs)
   - 3.8. Phân Hệ Tài Chính, Thu Hội Phí & Webhook Đối Soát (Finance & Payment APIs)
   - 3.9. Phân Hệ Tích Hợp Zalo OA & Tự Động Làm Mới Token (Zalo OA APIs)
   - 3.10. Phân Hệ Báo Cáo Thống Kê 2 Cột & Dashboard KPI (Analytics BI APIs)

---

## PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU`;

content = content.replace(/# TÀI LIỆU ĐẶC TẢ CHI TIẾT API & THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL[\s\S]*?## PHẦN I: TỔNG QUAN KIẾN TRÚC DỮ LIỆU/, newHeader);

// Add ERD diagram in Mermaid
const erdMermaid = `
\`\`\`mermaid
erDiagram
    vione_users ||--o| members : "owns"
    vione_users ||--o{ audit_logs : "records"
    members ||--o| companies : "leads"
    members ||--o{ opportunities : "creates"
    members ||--o{ opportunity_interests : "deals"
    members ||--o{ event_registrations : "registers"
    members ||--o{ meeting_participants : "attends"
    members ||--o{ feed_posts : "posts"
    members ||--o{ feed_comments : "comments"
    members ||--o{ membership_fees : "owes"
    members ||--o{ financial_transactions : "pays"
    
    events ||--o{ event_registrations : "contains"
    business_meetings ||--o{ meeting_participants : "gathers"
    opportunities ||--o{ opportunity_interests : "receives"
    companies ||--o{ products : "offers"
    feed_posts ||--o{ feed_comments : "discusses"
\`\`\`
`;

content = content.replace(/```\s*┌───[\s\S]*?└───┘\s*```/, erdMermaid);

const out = path.resolve('document/handover/03_THIET_KE_CSDL_VA_API_CEO1983_HANOIBA.md');
fs.writeFileSync(out, content, 'utf8');
console.log('✓ 03_THIET_KE_CSDL_VA_API written successfully, size:', content.length);

