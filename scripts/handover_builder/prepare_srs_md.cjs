const fs = require('fs');
const path = require('path');

const src = path.resolve('document/notebooklm/08_TAI_LIEU_DAC_TA_YEU_CAU_PHAN_MEM_SRS_CHINH_THUC.md');
let content = fs.readFileSync(src, 'utf8');

const newHeader = `# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

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

## MỤC LỤC TÀI LIỆU`;

content = content.replace(/# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 \(HANOIBA\)[\s\S]*?## MỤC LỤC TÀI LIỆU/, newHeader);

const out = path.resolve('document/handover/02_SRS_CEO1983_HANOIBA.md');
fs.writeFileSync(out, content, 'utf8');
console.log('✓ 02_SRS written successfully, size:', content.length);

