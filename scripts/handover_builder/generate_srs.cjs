/**
 * GENERATE SRS: 02_SRS_CEO1983_HANOIBA.md
 * Master Software Requirements Specification for CEO 1983 Club (HanoiBA)
 * IEEE 830-1998 Standard - Version 10.0 Enterprise Handover Standard
 */

const fs = require('fs');
const path = require('path');

function generateSRSMarkdown() {
  // Read foundational SRS from notebooklm
  const srcPath = path.resolve('document/notebooklm/08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.md');
  let content = fs.readFileSync(srcPath, 'utf8');

  // Update header and metadata
  content = content.replace(
    /# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 \(HANOIBA\)[\s\S]*?## MỤC LỤC TÀI LIỆU/,
    `# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM TỔNG THỂ DOANH NGHIỆP
*(SOFTWARE REQUIREMENTS SPECIFICATION - MASTER ENTERPRISE SRS)*

---

* **Mã tài liệu:** \`SRS-IEEE830-CEO1983-MASTER-HANOIBA\`
* **Phiên bản:** \`Phiên bản 10.0 Toàn Diện (Chuẩn IEEE 830 - Bản Bàn Giao Doanh Nghiệp & Kỹ Sư Vận Hành)\`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Đội ngũ Kiến trúc sư Hệ thống & Chuyên gia Phân tích Nghiệp vụ
* **Phân loại:** Đặc tả Kỹ thuật, Luồng Dữ liệu, Ma trận 30 Use Cases Chuẩn Hóa & Hệ thống Sơ đồ Mô hình hóa Chi tiết (Toàn bộ 30 Use Cases đều có biểu đồ Mermaid riêng biệt)
* **Ngày phát hành:** \`08/11/2026\`

---

## MỤC LỤC TÀI LIỆU`
  );

  // Enhance UC-APP-004 with Deal Margin & Visibility
  content = content.replace(
    /#### UC-APP-004: Đăng Tin Cơ Hội Giao Thương B2B & Rút Quan Tâm[\s\S]*?(?=#### UC-APP-005)/,
    `#### UC-APP-004: Đăng Tin Cơ Hội Giao Thương B2B, Chia Sẻ Bảo Mật & Đàm Phán Deal % Lợi Nhuận

* **Mã Use Case:** \`UC-APP-004\`
* **Tác nhân chính (Primary Actor):** Hội viên Doanh nhân CEO 1983
* **Tác nhân phụ (Secondary Actors):** Đối tác giao thương, Ban Giao Thương CLB
* **Mục tiêu cốt lõi (Goal):** Đăng tải nhu cầu mua/bán B2B, lựa chọn phạm vi hiển thị (Công khai vs Chỉ định người xem), tiếp nhận các đề xuất deal và tự động sắp xếp theo tỷ lệ % lợi nhuận lời nhất cho người đăng.
* **Mô tả tổng quan (Description):** Tính năng xương sống thúc đẩy xúc tiến thương mại nội khối. Người đăng có thể giới hạn ai được xem cơ hội (\`visibility = 'assigned'\`). Khi đối tác gửi đề xuất hợp tác có số tiền giao dịch (\`deal_amount\`), hệ thống tự động tính tỷ lệ % sinh lời (\`deal_percent\`) và sắp xếp bảng deal ưu tiên đối tác có giá trị lời nhất.
* **Điều kiện tiên quyết (Preconditions):** Hội viên có tài khoản ACTIVE, đã hoàn tất hồ sơ doanh nghiệp.
* **Điều kiện sau khi thực hiện (Postconditions):** Cơ hội hiển thị đúng đối tượng phân quyền; các đề xuất deal được lưu vết và thông báo cho người đăng.

* **Sơ đồ Biểu đồ Use Case (Use Case Diagram):**

\`\`\`mermaid
flowchart LR
    A["Hội Viên Đăng Bài"] -->|"1. Chọn visibility: Public / Assigned"| UI["Giao Diện App (/association/opportunities/new)"]
    A -->|"2. Nhập ngân sách & phân quyền xem"| UI
    UI -->|"3. POST /opportunities"| BE["Backend NestJS (opportunity.controller)"]
    BE -->|"4. Lưu CSDL: public vs assigned_to_ids"| DB[("PostgreSQL: opportunities")]
    
    PARTNER["Đối Tác Được Xem"] -->|"5. Xem bài & Gửi đề xuất Deal"| DEAL_UI["Form Đề Xuất Deal (deal_amount)"]
    DEAL_UI -->|"6. POST /opportunities/:id/interests"| BE
    BE -->|"7. Tính % lợi nhuận & sắp xếp deal lời nhất"| DB
    BE -->|"8. Push Notify báo tin cho người đăng"| A
\`\`\`

* **Luồng sự kiện chính (Main Flow):**
  1. Hội viên mở mục 'Cơ hội Giao thương' trên Mobile App, bấm nút '+ Đăng Cơ Hội Mới'.
  2. Điền thông tin: Tiêu đề cơ hội, Ngành nghề, Mô tả chi tiết, Ngân sách dự kiến (\`budget\`), Hạn chót.
  3. Chọn phạm vi tiếp cận:
     - \`Công khai (Public)\`: Toàn bộ hội viên trong mạng lưới đều nhìn thấy.
     - \`Chỉ định (Assigned)\`: Chọn danh sách các hội viên cụ thể được phép xem.
  4. Bấm 'Đăng Tin'. Backend lưu bản ghi với danh sách \`assigned_to_ids\`.
  5. Các hội viên được cấp quyền truy cập danh sách cơ hội, xem chi tiết và bấm 'Gửi Đề Xuất Deal'.
  6. Đối tác nhập: Giá trị deal (\`deal_amount\`) và phương án chiết khấu / hoa hồng.
  7. Backend tự động tính \`deal_percent = (deal_amount / budget) * 100\` và cập nhật xếp hạng \`deal_profit_rank\`.
  8. Người đăng mở tab 'Quản lý Deal của tôi': Danh sách đối tác đàm phán được hiển thị sắp xếp theo tỷ lệ lời nhất lên trên cùng.
  9. Người đăng bấm chọn đối tác tối ưu nhất để tiến hành 'Đặt lịch hẹn 1-on-1'.

* **Quy tắc nghiệp vụ chi phối (Business Rules):**
  - **BR-17:** Nếu cơ hội ở chế độ \`assigned\`, API trả về danh sách cơ hội phải lọc bằng \`DataScopeInterceptor\`: chỉ trả về bài đăng nếu \`user.id\` nằm trong \`assigned_to_ids\` hoặc là chính người đăng.
  - **BR-18:** Bảng so sánh deal phải bảo mật riêng tư, chỉ có người đăng cơ hội mới nhìn thấy số tiền và % lợi nhuận của tất cả các deal.

* **Liên kết kỹ thuật (Technical Implementation):**
  - **Giao diện (Frontend UI):** \`apps/ceo1983_app_fe/src/components/opportunities/OpportunityCard.tsx, OpportunityDetailModal.tsx\`
  - **Điểm cuối API (Endpoints):** \`POST /opportunities, GET /opportunities, POST /opportunities/:id/interests, GET /opportunities/my-deals\`
  - **Bảng CSDL PostgreSQL:** \`public.opportunities, public.opportunity_interests\`

---

`
  );

  return content;
}

module.exports = { generateSRSMarkdown };

