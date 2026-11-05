const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../MEMORY.md');
let content = fs.readFileSync(file, 'utf8');

const newEntry = `- **Bản cập nhật ngày 05/11/2026 (v10.42): Sửa Triệt Để Lỗi Share Format Mạng Xã Hội (Facebook, Zalo) & Xây Dựng Giao Diện Chat AI Đỉnh Cao ChatGPT Dùng Model Free Tại Web CRM ([NODE-CORE-001], [NODE-CRM-001], [NODE-CRM-015], [NODE-APP-003], [NODE-APP-004], [NODE-APP-008])**:
  1. *Khắc Phục Triệt Để Lỗi Chia Sẻ Mạng Xã Hội Mất Format*:
     - **Nguyên nhân gốc rễ**: Khi bấm nút chia sẻ Facebook / Zalo trong modal chi tiết cơ hội (\`OpportunityDetailModal.tsx\`), code cũ sinh URL client-side \`/share/opportunity/:id\`. Khi crawler bot (Facebook, Zalo) truy cập, Nginx chuyển tiếp tới SPA frontend trả về \`index.html\` với meta tags mặc định (ảnh skyline ban ngày và title chung chung) thay vì nội dung thực tế của cơ hội/sự kiện.
     - **Sửa Frontend**: Patch \`OpportunityDetailModal.tsx\` sử dụng chuẩn hàm \`buildDynamicShareUrl\` trỏ vào \`/api/share/preview\` kèm đầy đủ loại entity (\`opportunity\`), id, tiêu đề cơ hội, mô tả tóm tắt, ảnh thật và quy mô ngân sách.
     - **Nâng Cấp Backend**: Cập nhật \`apps/ceo1983_app_be/src/app.controller.ts\` với route \`@Get(['share/preview', 'api/share/preview', 'share/:type/:id', 'api/share/:type/:id'])\`. Đọc dữ liệu thực tế từ PostgreSQL (tiêu đề, mô tả, ảnh, thời gian sự kiện, quy mô ngân sách tỷ/triệu VNĐ của cơ hội) và xuất HTML OpenGraph, Twitter Cards (\`summary_large_image\`), Schema.org Microdata chuẩn mực 1200x630px.
     - **Nâng Cấp Hạ Tầng Nginx**: Bổ sung location \`/share/\` trong \`deploy/ssl/nginx.conf\` (cả port 443 và port 5445) proxy trực tiếp sang backend container \`ceo1983-backend-prod:4000\`, đảm bảo bất kỳ crawler bot nào quét link dạng \`/share/...\` đều nhận trọn vẹn thẻ OpenGraph động.
  2. *Xây Dựng Giao Diện Chat AI Chuẩn ChatGPT Sử Dụng Model Free*:
     - **Backend Endpoint Chat**: Thêm method \`handleChatAssistant\` vào \`AiCrmAnalyticsService\` và endpoint \`@Post('crm/chat')\` trong \`AiController\`. Tự động thu thập Live CRM Context từ database PostgreSQL (Hội viên, Sổ quỹ tài chính thu chi, Sự kiện, Cơ hội B2B, 6 Ban chuyên môn). Hỗ trợ danh mục Model Free: Google Gemini 2.0 Flash (Free Tier), DeepSeek V3 / R1 (Free), Meta Llama 3.3 70B (Groq Free), GPT-4o-mini kèm Intelligent Hybrid Expert Fallback Engine phân tích chuyên sâu.
     - **Frontend ChatGPT Component (\`CrmChatGPTView.tsx\`)**:
       - *Sidebar Lịch sử*: Nút "+ Cuộc trò chuyện mới", danh sách phiên hội thoại lưu trong \`localStorage\`, đổi tên theo câu hỏi đầu tiên, nút xóa từng phiên và dọn dẹp toàn bộ.
       - *Header Model Selector*: Dropdown chọn linh hoạt 4 mô hình Free Tier hàng đầu, hiển thị huy hiệu trạng thái Live PostgreSQL.
       - *Màn hình Khởi đầu*: 4 Quick Prompt Cards (Hội viên, Dòng tiền thu chi, Cơ hội B2B, Kế hoạch sự kiện).
       - *Khung Tin nhắn*: Thiết kế chuẩn mực ChatGPT với Avatar AI lấp lánh, trình render Markdown thuần an toàn không XSS (tiêu đề h3/h4, in đậm, danh sách, bảng biểu Markdown, thẻ dẫn chứng CSDL, nút Copy to clipboard, latency tracker).
       - *Thanh Nhập liệu Chân trang*: Floating input bar bo tròn mềm mại, Textarea tự động co giãn chiều cao theo số dòng, phím tắt Enter gửi tin, Shift+Enter xuống dòng, nút Gửi tròn thanh thoát.
     - **Tích Hợp Web CRM Route**: Đặt tab "Trò Chuyện AI (ChatGPT Style)" làm tab đầu tiên và mặc định tại \`apps/ceo1983_app_fe/src/routes/ai-assistant.tsx\`.
  3. *Kiểm Tra & Xác Minh*:
     - Đạt 0 lỗi cú pháp AST (0 syntax errors) và 0 lỗi TypeScript trên tất cả các file sửa đổi.
     - Cập nhật \`routeTree.gen.ts\` đồng bộ chuẩn xác.

`;

const marker = '# System Memory & Architecture\n\n';
content = content.replace(marker, marker + newEntry);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated MEMORY.md with v10.42!');

