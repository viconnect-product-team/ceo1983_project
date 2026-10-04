const fs = require('fs');
const path = require('path');

const memoryPath = path.resolve(__dirname, '../MEMORY.md');
const content = `
### 26.4. Tách Biệt & Xuất Bản Toàn Diện Bộ Tài Liệu BRD & SRS Định Dạng Word (.DOCX)
- Đã xuất bản và phân tách độc lập các bộ tài liệu BRD và SRS sang định dạng Word (\`.docx\`) chuẩn mực A4, phông chữ Times New Roman 12pt, lề chuẩn 1 inch, có trang bìa sang trọng, mục lục, bảng biểu viền mỏng và tiêu đề màu thương hiệu Navy (#003B95) / Amber Gold (#D97706):
  1. \`BRD_CEO1983_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx\`: Tài liệu Yêu cầu Nghiệp vụ Doanh nghiệp CEO 1983.
  2. \`BRD_VIONE_YEU_CAU_NGHIEP_VU_TOAN_DIEN.docx\`: Tài liệu Yêu cầu Nghiệp vụ Doanh nghiệp Mạng lưới ViOne.
  3. \`SRS_IEEE830_CEO1983_TOAN_DIEN.docx\`: Đặc tả Yêu cầu Phần mềm Chuẩn Quốc Tế IEEE 830 (16 Modules MECE).
  4. \`SRS_01_Web_CRM_CEO1983.docx\`: SRS Chuyên Biệt Phân Hệ Web CRM Quản Trị CEO 1983.
  5. \`SRS_02_App_Hiep_Hoi_CEO1983.docx\`: SRS Chuyên Biệt Phân Hệ App Hiệp Hội Di Động CEO 1983.
  6. \`SRS_03_App_ViOne_Connect.docx\`: SRS Chuyên Biệt Phân Hệ Mạng Lưới Giao Thương ViOne Connect.
  7. \`SRS_04_Web_CRM_ViOne.docx\`: SRS Chuyên Biệt Phân Hệ Web CRM Quản Trị ViOne Enterprise.
  8. \`SRS_CHI_TIET_CEO1983_HE_THONG_TOAN_DIEN.docx\`: SRS Chi Tiết Bao Phủ Toàn Bộ 138 Use Cases.
- Toàn bộ các file Word đã được đồng bộ đồng thời tại 3 thư mục: \`docs/\`, \`document/\`, và \`apps/ceo1983_app_fe/public/docs/\`.
`;

fs.appendFileSync(memoryPath, content, 'utf8');
console.log('Đã cập nhật MEMORY.md 26.4');
