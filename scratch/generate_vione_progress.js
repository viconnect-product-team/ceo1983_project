const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function buildViOneProgress() {
  const tasks = [
    { stt: 1, wbs: '1.1', name: 'Kiến trúc Hạ tầng & Database PostgreSQL ViOne', owner: 'Backend Lead', priority: 'Critical', status: 'Hoàn thành 100%', progress: 100, note: 'Chạy cổng 4001, DB 113.20.107.184:6432' },
    { stt: 2, wbs: '1.2', name: 'Sửa lỗi AI Copilot CRM & App ViOne', owner: 'AI Engineer', priority: 'Critical', status: 'Hoàn thành 100%', progress: 100, note: 'Khớp POST /api/ai/chat JSON payload' },
    { stt: 3, wbs: '1.3', name: 'Đồng bộ hóa 100% hình ảnh không bị vỡ (HTTP 200)', owner: 'Frontend Lead', priority: 'Critical', status: 'Hoàn thành 100%', progress: 100, note: 'Tạo clean aliases, loại bỏ lỗi unescaped characters' },
    { stt: 4, wbs: '1.4', name: 'Khôi phục đầy đủ 14 phân hệ Landing Page theo Figma', owner: 'UI/UX Lead', priority: 'Critical', status: 'Hoàn thành 100%', progress: 100, note: 'Khôi phục trọn vẹn 14 phân hệ từ file Figma' },
    { stt: 5, wbs: '1.5', name: 'Hiệu ứng 4.8s Pop-up Looping Keyframe Hero Phone', owner: 'UI/UX Dev', priority: 'High', status: 'Hoàn thành 100%', progress: 100, note: 'Hoạt ảnh mượt mà, scale 1.05 z-index 30' },
    { stt: 6, wbs: '1.6', name: 'Bảng giá linh hoạt & Modal Nhận Báo giá Doanh nghiệp', owner: 'Frontend Dev', priority: 'Critical', status: 'Hoàn thành 100%', progress: 100, note: 'Không lộ giá cứng, thu thập lead tư vấn 1-1' },
    { stt: 7, wbs: '1.7', name: 'FAQ Accordion tương tác & Smooth scroll Navigation', owner: 'Frontend Dev', priority: 'Medium', status: 'Hoàn thành 100%', progress: 100, note: 'Mở/đóng tương tác mượt mà' },
    { stt: 8, wbs: '2.1', name: 'Bộ Slide Thuyết trình CRM ViOne PPTX & HTML (16 slides)', owner: 'Product Owner', priority: 'High', status: 'Hoàn thành 100%', progress: 100, note: 'Nhúng ảnh screenshot bằng chứng sắc nét' },
    { stt: 9, wbs: '2.2', name: 'Bộ Slide Thuyết trình App ViOne Connect PPTX & HTML (20 slides)', owner: 'Product Owner', priority: 'High', status: 'Hoàn thành 100%', progress: 100, note: 'Khung smartphone Titanium tinh xảo' },
    { stt: 10, wbs: '2.3', name: 'Tài liệu HDSD ViOne Toàn diện DOCX & HTML', owner: 'Technical Writer', priority: 'High', status: 'Hoàn thành 100%', progress: 100, note: 'Đầy đủ các bước vận hành thực tế' },
    { stt: 11, wbs: '2.4', name: 'Tài liệu SRS ViOne Master DOCX & MD (2.93 MB)', owner: 'BA Lead', priority: 'Critical', status: 'Hoàn thành 100%', progress: 100, note: 'Đầy đủ 100+ Use Cases & kiến trúc chi tiết' },
    { stt: 12, wbs: '2.5', name: 'Bộ Test Cases Hệ thống ViOne (XLSX, MD)', owner: 'QA Lead', priority: 'High', status: 'Hoàn thành 100%', progress: 100, note: 'Toàn bộ ca kiểm thử Pass 100%' },
  ];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tien_Do_ViOne');
  sheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Mã WBS', key: 'wbs', width: 12 },
    { header: 'Hạng mục Công việc', key: 'name', width: 45 },
    { header: 'Phụ trách', key: 'owner', width: 18 },
    { header: 'Mức độ', key: 'priority', width: 14 },
    { header: 'Trạng thái', key: 'status', width: 18 },
    { header: 'Tiến độ (%)', key: 'progress', width: 14 },
    { header: 'Ghi chú kỹ thuật', key: 'note', width: 45 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(tasks);

  const xlsxPath = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/document/TIEN_DO_CONG_VIEC_VIONE.xlsx';
  await workbook.xlsx.writeFile(xlsxPath);
  console.log('✓ Đã lưu Excel:', xlsxPath);

  let md = '# BÁO CÁO TIẾN ĐỘ CÔNG VIỆC DỰ ÁN VIONE PLATFORM 5.0\n\n';
  md += '| STT | Mã WBS | Hạng mục Công việc | Phụ trách | Mức độ | Trạng thái | Tiến độ | Ghi chú kỹ thuật |\n';
  md += '|---|---|---|---|---|---|---|---|\n';
  for (const t of tasks) {
    md += `| ${t.stt} | ${t.wbs} | ${t.name} | ${t.owner} | ${t.priority} | **${t.status}** | ${t.progress}% | ${t.note} |\n`;
  }
  const mdPath = 'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/document/TIEN_DO_CONG_VIEC_VIONE.md';
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log('✓ Đã lưu Markdown:', mdPath);

  // Copy to ceo1983_project/document as well
  fs.copyFileSync(xlsxPath, 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/TIEN_DO_CONG_VIEC_VIONE.xlsx');
  fs.copyFileSync(mdPath, 'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/document/TIEN_DO_CONG_VIEC_VIONE.md');

  // Sync to public/docs in all projects
  const targetPublicDirs = [
    'd:/download/VICONNECT/CEO_VIONE_PROJECT/vione_project/apps/vione_app_fe/public/docs',
    'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/ceo1983_app_fe/public/docs',
    'd:/download/VICONNECT/CEO_VIONE_PROJECT/ceo1983_project/apps/vione_app_fe/public/docs'
  ];

  for (const tDir of targetPublicDirs) {
    if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
    fs.copyFileSync(xlsxPath, path.join(tDir, 'TIEN_DO_CONG_VIEC_VIONE.xlsx'));
    fs.copyFileSync(mdPath, path.join(tDir, 'TIEN_DO_CONG_VIEC_VIONE.md'));
    console.log(`✓ Đã đồng bộ tiến độ sang: ${tDir}`);
  }
}

buildViOneProgress();
