const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'build_master_srs_word_and_md.js');
let content = fs.readFileSync(targetFile, 'utf8');

// Thay thế USE_CASES_DATA bằng require từ all_use_cases_data.js
const startPattern = '// Danh sách 16 Use Case hoàn chỉnh bao quát toàn bộ CRM & App';
const endPattern = '];\n\n// Hàm tạo Markdown hoàn chỉnh chuẩn 100% kèm ảnh minh chứng thực tế';

const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `// Danh sách 52 Use Cases toàn diện bao quát 100% Web CRM và Mobile App
const { USE_CASES_DATA } = require('./all_use_cases_data');`;
  content = content.slice(0, startIndex) + replacement + content.slice(endIndex + 2);
  console.log('Đã thay thế thành công khối USE_CASES_DATA bằng 52 Use Cases!');
} else {
  console.error('Không tìm thấy vị trí start hoặc end pattern:', { startIndex, endIndex });
  process.exit(1);
}

// Cập nhật tiêu đề và mô tả mục 5 trong Markdown và Docx
content = content.replace(
  '5. YÊU CẦU CHỨC NĂNG CHI TIẾT (Specific Functional Requirements)',
  '5. YÊU CẦU CHỨC NĂNG CHI TIẾT (52 USE CASES CHI TIẾT)'
);
content = content.replace(
  'Dưới đây là bảng đặc tả chi tiết toàn bộ 16 Use Case nghiệp vụ cốt lõi của Hệ sinh thái CEO 1983:',
  'Dưới đây là bảng đặc tả chi tiết toàn diện 52 Use Cases nghiệp vụ bao phủ 100% Hệ sinh thái Số hóa CEO 1983 (28 Use Cases Web CRM Quản trị & 24 Use Cases Ứng dụng Di động Hội viên):'
);
content = content.replace(
  'Phiên bản:** 3.0 (Master Release - Bổ sung toàn diện 16 Use Case, tối ưu ảnh Mobile Frame và tích hợp SMTP Live)',
  'Phiên bản:** 4.0 (Master Enterprise Release - 52 Use Cases toàn diện bao phủ 100% Web CRM và Mobile App)'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Đã cập nhật file build_master_srs_word_and_md.js thành công!');
