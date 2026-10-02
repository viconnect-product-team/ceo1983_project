const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const VIONE_DIR = path.resolve(__dirname, '../../vione_project');
const DOC_DIR = path.join(VIONE_DIR, 'document');
const FE_DOCS_DIR = path.join(VIONE_DIR, 'apps', 'vione_app_fe', 'public', 'docs');

[DOC_DIR, FE_DOCS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// BẢNG MÀU CHUẨN HOÀNG GIA VÀNG ĐỒNG VIONE:
const THEME_VIONE = {
  BG_DARK: '09090B',
  BG_LIGHT: 'FAFAF9',
  BG_CARD: '18181B',
  GOLD_PRIMARY: 'EAB308',
  GOLD_AMBER: 'CA8A04',
  GOLD_LIGHT: 'FEF9C3',
  TEXT_LIGHT: 'FFFFFF',
  TEXT_MUTED: '94A3B8',
  TEXT_DARK: '09090B',
  BORDER_GOLD: 'FDE047',
};

async function buildCrmSlides() {
  console.log('>>> Khởi tạo Slide Thuyết Trình CRM ViOne (SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx)...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Vione AI 5.0 — Hệ Thống Quản Trị CRM & Vận Hành Doanh Nghiệp';

  // SLIDE 1: COVER
  let s1 = pres.addSlide();
  s1.background = { color: THEME_VIONE.BG_DARK };
  s1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.3, h: 7.5, fill: { color: THEME_VIONE.GOLD_PRIMARY } });
  
  // Logo
  s1.addShape(pres.ShapeType.rect, { x: 1.2, y: 1.2, w: 1.2, h: 1.2, fill: { color: THEME_VIONE.GOLD_PRIMARY } });
  s1.addText('V', { x: 1.2, y: 1.2, w: 1.2, h: 1.2, fontSize: 36, fontFace: 'Outfit', bold: true, color: THEME_VIONE.BG_DARK, align: 'center', valign: 'middle' });
  
  s1.addText('VIONE AI 5.0 PLATFORM', { x: 2.6, y: 1.35, fontSize: 22, fontFace: 'Outfit', bold: true, color: THEME_VIONE.GOLD_PRIMARY });
  s1.addText('HỆ THỐNG QUẢN TRỊ CRM & ĐIỀU HÀNH TỰ ĐỘNG THẾ HỆ MỚI', { x: 1.2, y: 2.8, w: 10.5, h: 1.5, fontSize: 34, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_LIGHT, lineSpacingMultiple: 1.15 });
  s1.addText('Chạm đỉnh tương lai với trợ lý Trí tuệ nhân tạo toàn diện — Ra quyết định thông minh hơn gấp 10 lần.', { x: 1.2, y: 4.5, w: 9.5, fontSize: 16, fontFace: 'Inter', color: THEME_VIONE.TEXT_MUTED });
  s1.addText('Ban Giải Pháp Chuyển Đổi Số ViOne • Tháng 10 / 2026 • Phiên bản 5.0 Master', { x: 1.2, y: 6.2, fontSize: 12, fontFace: 'Inter', color: THEME_VIONE.GOLD_AMBER, bold: true });

  // SLIDE 2: BỐI CẢNH & THÁCH THỨC
  let s2 = pres.addSlide();
  s2.background = { color: THEME_VIONE.BG_LIGHT };
  s2.addText('TỔNG QUAN THÁCH THỨC VẬN HÀNH DOANH NGHIỆP', { x: 0.8, y: 0.6, fontSize: 13, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER });
  s2.addText('Tại sao doanh nghiệp cần nâng cấp lên Vione AI 5.0?', { x: 0.8, y: 1.0, fontSize: 24, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_DARK });

  const challenges = [
    { title: 'Phân mảnh dữ liệu', desc: 'Dữ liệu bán hàng, công nợ, giao tiếp khách hàng lưu trữ rải rác trên nhiều phần mềm không đồng bộ.' },
    { title: 'Tắc nghẽn báo cáo', desc: 'Lãnh đạo mất từ 2-3 ngày để tổng hợp số liệu doanh thu các chi nhánh, thiếu tính thời sự để ra quyết định.' },
    { title: 'Bỏ sót khách hàng', desc: 'Tin nhắn đối tác từ Facebook, Zalo, Web chat và hotline bị thất lạc khi chuyển giao ca nhân viên.' },
    { title: 'Lãng phí chi phí phần mềm', desc: 'Phải trả tiền cho nhiều gói dịch vụ riêng biệt với các tính năng dư thừa không áp dụng thực tế.' }
  ];

  challenges.forEach((c, idx) => {
    let x = 0.8 + (idx % 2) * 5.8;
    let y = 2.0 + Math.floor(idx / 2) * 2.4;
    s2.addShape(pres.ShapeType.rect, { x, y, w: 5.4, h: 2.0, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1.5 } });
    s2.addShape(pres.ShapeType.rect, { x: x + 0.3, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: THEME_VIONE.GOLD_LIGHT } });
    s2.addText(`${idx + 1}`, { x: x + 0.3, y: y + 0.3, w: 0.5, h: 0.5, fontSize: 14, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER, align: 'center', valign: 'middle' });
    s2.addText(c.title, { x: x + 1.0, y: y + 0.35, fontSize: 16, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_DARK });
    s2.addText(c.desc, { x: x + 0.3, y: y + 0.95, w: 4.8, fontSize: 12, fontFace: 'Inter', color: '64748B', lineSpacingMultiple: 1.15 });
  });

  // SLIDE 3: KIẾN TRÚC HỢP NHẤT
  let s3 = pres.addSlide();
  s3.background = { color: THEME_VIONE.BG_LIGHT };
  s3.addText('HỆ SINH THÁI ĐIỀU HÀNH TOÀN DIỆN', { x: 0.8, y: 0.6, fontSize: 13, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER });
  s3.addText('Kiến Trúc Hoạt Động Hợp Nhất ViOne AI 5.0', { x: 0.8, y: 1.0, fontSize: 24, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_DARK });

  const modules = [
    { title: 'ViOne AI Copilot 5.0', sub: 'Trợ lý phân tích tài chính & lập kế hoạch tự động' },
    { title: 'CRM & Bán Hàng 360°', sub: 'Quản lý đường ống cơ hội (Pipeline) & giá trị deal' },
    { title: 'Hộp Thư Đa Kênh Omnibox', sub: 'Hợp nhất Zalo OA, Web Chat & ViOne App' },
    { title: 'Sàn Giao Thương B2B', sub: 'Matching nhu cầu mua bán nội bộ bằng AI' },
    { title: 'Danh Thiếp Số NFC', sub: 'Chạm NFC thông minh chia sẻ hồ sơ số 1 giây' },
    { title: 'Bảo Mật Chuẩn AES-256', sub: 'Phân quyền đa cấp độ RBAC & lưu vết audit log' },
  ];

  modules.forEach((m, idx) => {
    let col = idx % 3;
    let row = Math.floor(idx / 3);
    let x = 0.8 + col * 3.9;
    let y = 2.0 + row * 2.4;
    s3.addShape(pres.ShapeType.rect, { x, y, w: 3.6, h: 2.0, fill: { color: 'FFFFFF' }, line: { color: idx === 0 ? THEME_VIONE.GOLD_PRIMARY : 'E2E8F0', width: idx === 0 ? 2 : 1 } });
    s3.addText(m.title, { x: x + 0.3, y: y + 0.4, w: 3.0, fontSize: 15, fontFace: 'Inter', bold: true, color: idx === 0 ? THEME_VIONE.GOLD_AMBER : THEME_VIONE.TEXT_DARK });
    s3.addText(m.sub, { x: x + 0.3, y: y + 1.0, w: 3.0, fontSize: 11.5, fontFace: 'Inter', color: '64748B', lineSpacingMultiple: 1.2 });
  });

  // SLIDE 4: VIONE AI COPILOT 5.0
  let s4 = pres.addSlide();
  s4.background = { color: THEME_VIONE.BG_DARK };
  s4.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.3, h: 7.5, fill: { color: THEME_VIONE.GOLD_PRIMARY } });
  s4.addText('ĐIỂM NHẤN CÔNG NGHỆ', { x: 0.8, y: 0.6, fontSize: 13, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_PRIMARY });
  s4.addText('ViOne AI Copilot 5.0 — Bộ Não Tự Động Hóa Vận Hành', { x: 0.8, y: 1.0, fontSize: 24, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_LIGHT });

  // Feature block left
  s4.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.8, w: 5.6, h: 4.8, fill: { color: THEME_VIONE.BG_CARD }, line: { color: '334155', width: 1 } });
  s4.addText('NĂNG LỰC XỬ LÝ DỮ LIỆU THỜI GIAN THỰC', { x: 1.2, y: 2.1, fontSize: 14, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_PRIMARY });
  s4.addText('• Đọc trực tiếp dữ liệu cơ sở dữ liệu PostgreSQL bảo mật.\n• Tự động tính toán tổng giá trị phễu thương vụ (18.5 Tỷ VNĐ).\n• Hiệu suất hệ thống đo lường đạt 98.4% so với trung bình ngành.\n• Đề xuất giải pháp 3 bước có thể thực thi ngay lập tức.\n• Tự động soạn thảo email phản hồi và cập nhật tiến độ hợp đồng.', {
    x: 1.2, y: 2.7, w: 4.8, h: 3.5, fontSize: 13, fontFace: 'Inter', color: 'E2E8F0', lineSpacingMultiple: 1.35
  });

  // Feature block right (Simulation of Image 1 Phone card)
  s4.addShape(pres.ShapeType.rect, { x: 6.8, y: 1.8, w: 5.6, h: 4.8, fill: { color: 'FFFFFF' }, line: { color: THEME_VIONE.GOLD_PRIMARY, width: 2.5 } });
  s4.addText('HIỆU SUẤT HÔM NAY: 98.4%', { x: 7.2, y: 2.2, fontSize: 16, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_DARK });
  s4.addText('TIẾN TRÌNH AI BOT:', { x: 7.2, y: 2.8, fontSize: 12, fontFace: 'Inter', bold: true, color: '64748B' });
  s4.addText('1. Báo cáo tài chính tháng 2 — [HOÀN TẤT 100%]\n2. Phản hồi Hotline CSKH tự động — [ĐÃ XỬ LÝ 66%]\n3. Đồng bộ API SAP ERP — [ĐANG KẾT NỐI]\n4. Lọc danh sách đối tác B2B tiềm năng — [HOÀN TẤT]', {
    x: 7.2, y: 3.2, w: 4.8, h: 2.2, fontSize: 12, fontFace: 'Inter', color: '1E293B', lineSpacingMultiple: 1.3
  });
  s4.addShape(pres.ShapeType.rect, { x: 7.2, y: 5.4, w: 4.8, h: 0.8, fill: { color: 'EFF6FF' } });
  s4.addText('⚡ Trợ lý thông minh đã kích hoạt • Mã hóa AES-256', { x: 7.2, y: 5.4, w: 4.8, h: 0.8, fontSize: 11, fontFace: 'Inter', bold: true, color: '1D4ED8', align: 'center', valign: 'middle' });

  // SLIDE 5: CHÍNH SÁCH BÁO GIÁ LINH HOẠT (NO FIXED PRICES)
  let s5 = pres.addSlide();
  s5.background = { color: THEME_VIONE.BG_LIGHT };
  s5.addText('CHÍNH SÁCH ĐỒNG HÀNH & ĐẦU TƯ', { x: 0.8, y: 0.6, fontSize: 13, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER });
  s5.addText('Chính Sách Báo Giá Tư Vấn Doanh Nghiệp (Consultative Pricing)', { x: 0.8, y: 1.0, fontSize: 24, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_DARK });

  const tiers = [
    { name: 'ViOne Starter AI', tag: 'BẮT ĐẦU NHANH', price: 'Liên Hệ Nhận Ưu Đãi', sub: 'Tối ưu cho DN vừa & nhỏ khởi động chuyển đổi số', cta: 'Yêu Cầu Báo Giá Starter' },
    { name: 'ViOne Professional AI', tag: 'ĐƯỢC 85% DN CHỌN', price: 'Tùy Biến Theo Quy Mô', sub: 'Toàn diện sức mạnh AI Copilot & CRM tăng trưởng', cta: 'Tư Vấn 1-1 & Báo Giá' },
    { name: 'ViOne Enterprise', tag: 'DÀNH CHO TẬP ĐOÀN', price: 'May Đo Chuyên Sâu', sub: 'Private Cloud, kết nối SAP/Oracle ERP, AI riêng', cta: 'Liên Hệ Ban Cố Vấn' },
  ];

  tiers.forEach((t, idx) => {
    let x = 0.8 + idx * 3.9;
    let y = 1.8;
    s5.addShape(pres.ShapeType.rect, { x, y, w: 3.6, h: 4.8, fill: { color: idx === 1 ? 'FEFCE8' : 'FFFFFF' }, line: { color: idx === 1 ? THEME_VIONE.GOLD_PRIMARY : 'CBD5E1', width: idx === 1 ? 2.5 : 1 } });
    s5.addText(t.tag, { x: x + 0.3, y: y + 0.3, fontSize: 10, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER });
    s5.addText(t.name, { x: x + 0.3, y: y + 0.7, w: 3.0, fontSize: 18, fontFace: 'Outfit', bold: true, color: THEME_VIONE.TEXT_DARK });
    s5.addText(t.price, { x: x + 0.3, y: y + 1.4, w: 3.0, fontSize: 16, fontFace: 'Inter', bold: true, color: idx === 1 ? '92400E' : '0F172A' });
    s5.addText(t.sub, { x: x + 0.3, y: y + 2.0, w: 3.0, fontSize: 11.5, fontFace: 'Inter', color: '64748B' });
    
    // CTA Button
    s5.addShape(pres.ShapeType.rect, { x: x + 0.3, y: y + 4.0, w: 3.0, h: 0.6, fill: { color: idx === 1 ? THEME_VIONE.GOLD_PRIMARY : '09090B' } });
    s5.addText(t.cta, { x: x + 0.3, y: y + 4.0, w: 3.0, h: 0.6, fontSize: 11, fontFace: 'Inter', bold: true, color: idx === 1 ? THEME_VIONE.BG_DARK : 'FFFFFF', align: 'center', valign: 'middle' });
  });

  const outPptxCrm = path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx');
  await pres.writeFile({ fileName: outPptxCrm });
  fs.copyFileSync(outPptxCrm, path.join(FE_DOCS_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx'));
  console.log('✓ Hoàn tất PPTX CRM ViOne:', outPptxCrm);
}

async function buildAppSlides() {
  console.log('>>> Khởi tạo Slide Thuyết Trình App ViOne Connect (SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx)...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'ViOne Connect — Ứng Dụng Di Động Danh Thiếp Số & Kết Nối Giao Thương B2B';

  // SLIDE 1: COVER
  let s1 = pres.addSlide();
  s1.background = { color: THEME_VIONE.BG_DARK };
  s1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.3, h: 7.5, fill: { color: THEME_VIONE.GOLD_PRIMARY } });

  s1.addShape(pres.ShapeType.rect, { x: 1.2, y: 1.2, w: 1.2, h: 1.2, fill: { color: THEME_VIONE.GOLD_PRIMARY } });
  s1.addText('V', { x: 1.2, y: 1.2, w: 1.2, h: 1.2, fontSize: 36, fontFace: 'Outfit', bold: true, color: THEME_VIONE.BG_DARK, align: 'center', valign: 'middle' });

  s1.addText('VIONE CONNECT MOBILE APP', { x: 2.6, y: 1.35, fontSize: 22, fontFace: 'Outfit', bold: true, color: THEME_VIONE.GOLD_PRIMARY });
  s1.addText('DANH THIẾP SỐ THÔNG MINH NFC & MẠNG LƯỚI GIAO THƯƠNG DOANH NHÂN', { x: 1.2, y: 2.8, w: 10.5, h: 1.5, fontSize: 32, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_LIGHT, lineSpacingMultiple: 1.15 });
  s1.addText('Một chạm NFC kết nối triệu cơ hội — Tích hợp Trợ lý AI bỏ túi và Bảng tin Moments thời sự.', { x: 1.2, y: 4.5, w: 9.5, fontSize: 16, fontFace: 'Inter', color: THEME_VIONE.TEXT_MUTED });
  s1.addText('Hệ Sinh Thái ViOne • Phiên Bản iOS & Android PWA/Capacitor', { x: 1.2, y: 6.2, fontSize: 12, fontFace: 'Inter', color: THEME_VIONE.GOLD_AMBER, bold: true });

  // SLIDE 2: 4 TÍNH NĂNG ĐỘT PHÁ
  let s2 = pres.addSlide();
  s2.background = { color: THEME_VIONE.BG_LIGHT };
  s2.addText('TRẢI NGHIỆM MOBILE DOANH NHÂN', { x: 0.8, y: 0.6, fontSize: 13, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER });
  s2.addText('4 Trụ Cột Tính Năng Đột Phá Của ViOne Connect', { x: 0.8, y: 1.0, fontSize: 24, fontFace: 'Inter', bold: true, color: THEME_VIONE.TEXT_DARK });

  const appFeatures = [
    { title: 'Chạm Thẻ NFC 1 Giây', desc: 'Chạm trực tiếp thẻ cứng NFC vào điện thoại đối tác để mở hồ sơ năng lực số đa phương tiện, không cần cài đặt app.' },
    { title: 'Bảng Tin Moments Doanh Nghiệp', desc: 'Chia sẻ các hoạt động ký kết hợp đồng, sự kiện giao thương và tìm kiếm đối tác cung ứng trong mạng lưới uy tín.' },
    { title: 'Trò Chuyện & Nhắn Tin Đa Kênh', desc: 'Hệ thống chat nội bộ bảo mật, gửi danh thiếp số, gửi báo giá và trao đổi trực tiếp giữa các giám đốc điều hành.' },
    { title: 'Trợ Lý AI Gợi Ý Đối Tác', desc: 'AI tự động tính toán khoảng cách địa lý và độ tương thích ngành nghề để gợi ý "Gần bạn có ai đang dùng ViOne không?".' }
  ];

  appFeatures.forEach((f, idx) => {
    let col = idx % 2;
    let row = Math.floor(idx / 2);
    let x = 0.8 + col * 5.8;
    let y = 1.8 + row * 2.5;
    s2.addShape(pres.ShapeType.rect, { x, y, w: 5.4, h: 2.1, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1.5 } });
    s2.addText(f.title, { x: x + 0.4, y: y + 0.35, fontSize: 16, fontFace: 'Inter', bold: true, color: THEME_VIONE.GOLD_AMBER });
    s2.addText(f.desc, { x: x + 0.4, y: y + 0.95, w: 4.6, fontSize: 12, fontFace: 'Inter', color: '64748B', lineSpacingMultiple: 1.25 });
  });

  const outPptxApp = path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx');
  await pres.writeFile({ fileName: outPptxApp });
  fs.copyFileSync(outPptxApp, path.join(FE_DOCS_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx'));
  console.log('✓ Hoàn tất PPTX App ViOne Connect:', outPptxApp);
}

// Generate HTML Slide decks
function buildHtmlSlides() {
  const htmlCrm = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Slide Thuyết Trình CRM Quản Trị ViOne 5.0</title>
  <style>
    body { font-family: 'Inter', sans-serif; background: #09090B; color: #FFF; margin: 0; padding: 20px; }
    .slide { max-width: 1000px; margin: 0 auto 30px; background: #18181B; border: 1.5px solid #EAB308; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    h1 { color: #EAB308; font-size: 32px; margin-top: 0; }
    h2 { color: #FACC15; font-size: 24px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
    p, li { font-size: 16px; color: #E2E8F0; line-height: 1.6; }
    .highlight { color: #EAB308; font-weight: bold; }
    .btn-gold { background: linear-gradient(135deg, #F59E0B, #EAB308); color: #09090B; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="slide">
    <h1>VIONE AI 5.0 — CRM QUẢN TRỊ & ĐIỀU HÀNH THẾ HỆ MỚI</h1>
    <p>Chạm đỉnh tương lai với Trợ lý AI Copilot 5.0 và Kiến trúc Hợp nhất Doanh nghiệp.</p>
  </div>
  <div class="slide">
    <h2>1. Bộ Não ViOne AI Copilot 5.0</h2>
    <p>Kết nối trực tiếp PostgreSQL và phân tích dữ liệu kinh doanh thời gian thực:</p>
    <ul>
      <li>Tổng giá trị cơ hội mở: <span class="highlight">18.500.000.000 VNĐ</span></li>
      <li>Hiệu suất vận hành tự động: <span class="highlight">98.4%</span></li>
      <li>Tự động hóa báo cáo tài chính, gợi ý đối tác B2B và lập kế hoạch 3 bước.</li>
    </ul>
  </div>
  <div class="slide">
    <h2>2. Chính Sách Báo Giá Doanh Nghiệp (Consultative Pricing)</h2>
    <p>Không niêm yết mức giá cố định để tối ưu ngân sách theo quy mô bài toán của từng doanh nghiệp.</p>
    <a href="/auth" class="btn-gold">Truy cập Cổng Đăng Nhập CRM ViOne →</a>
  </div>
</body>
</html>`;

  const htmlApp = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Slide Thuyết Trình App ViOne Connect</title>
  <style>
    body { font-family: 'Inter', sans-serif; background: #09090B; color: #FFF; margin: 0; padding: 20px; }
    .slide { max-width: 1000px; margin: 0 auto 30px; background: #18181B; border: 1.5px solid #EAB308; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    h1 { color: #EAB308; font-size: 32px; margin-top: 0; }
    h2 { color: #FACC15; font-size: 24px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
    p, li { font-size: 16px; color: #E2E8F0; line-height: 1.6; }
    .highlight { color: #EAB308; font-weight: bold; }
  </style>
</head>
<body>
  <div class="slide">
    <h1>VIONE CONNECT MOBILE APP</h1>
    <p>Danh thiếp số thông minh NFC & Mạng lưới kết nối giao thương B2B dành cho Doanh nhân.</p>
  </div>
  <div class="slide">
    <h2>Trải Nghiệm Đột Phá Trên Thiết Bị Di Động</h2>
    <ul>
      <li>Chạm thẻ NFC 1 giây mở ngay hồ sơ số doanh nghiệp.</li>
      <li>Bảng tin Moments chia sẻ cơ hội hợp tác và sự kiện giao thương.</li>
      <li>Trò chuyện đa kênh và hỏi đáp với Trợ lý AI ViOne mọi lúc mọi nơi.</li>
    </ul>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html'), htmlCrm, 'utf8');
  fs.copyFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html'), path.join(FE_DOCS_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html'));

  fs.writeFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html'), htmlApp, 'utf8');
  fs.copyFileSync(path.join(DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html'), path.join(FE_DOCS_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html'));

  console.log('✓ Hoàn tất HTML Slides CRM & App ViOne!');
}

async function main() {
  await buildCrmSlides();
  await buildAppSlides();
  buildHtmlSlides();
}

main().catch(console.error);
