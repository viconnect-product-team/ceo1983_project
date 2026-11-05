/**
 * BUILD BRD V7.0 - TÀI LIỆU YÊU CẦU NGHIỆP VỤ TOÀN DIỆN
 * Chuẩn hóa theo mẫu tài liệu BRD_BusinessConnect_v1.0.html
 * Đầy đủ: Cover page A4, TOC clickable, Abbreviation, RACI Matrix, 
 * 11 Phân hệ chi tiết có Luồng nghiệp vụ Mermaid, Business Rules, Exception Handling,
 * Phụ lục Ma trận 37 Node ID & 6 Sequence Diagrams Mermaid.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const NOTEBOOK_DIR = path.join(DOC_DIR, 'notebooklm');
const FE_DOCS_DIR = path.join(ROOT_DIR, 'apps/ceo1983_app_fe/public/docs');

if (!fs.existsSync(FE_DOCS_DIR)) fs.mkdirSync(FE_DOCS_DIR, { recursive: true });
if (!fs.existsSync(NOTEBOOK_DIR)) fs.mkdirSync(NOTEBOOK_DIR, { recursive: true });

console.log('--- KHỞI TẠO XUẤT BẢN TÀI LIỆU BRD V7.0 & SRS V7.0 (MARKDOWN, HTML A4 & WORD DOCX) ---');
