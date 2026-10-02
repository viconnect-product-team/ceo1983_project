// scripts/generate_vione_full_master_slides_v2.js - Full Master Slideshow Suite (20 Slides CRM & 20 Slides Mobile App)
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIONE_DOC_DIR = path.join(ROOT_DIR, '..', 'vione_project', 'document');
const CEO_DOC_DIR = path.join(ROOT_DIR, 'document');
const EVIDENCE_DIR = path.join(CEO_DOC_DIR, 'images', 'evidence');

const FE_DOCS_DIRS = [
  path.join(ROOT_DIR, '..', 'vione_project', 'apps', 'vione_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs'),
  path.join(ROOT_DIR, 'apps', 'vione_app_fe', 'public', 'docs'),
  VIONE_DOC_DIR,
  CEO_DOC_DIR
];

FE_DOCS_DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// LUXURY ROYAL GOLD & DARK THEME FOR VIONE
const THEME = {
  BG_DARK: '09090B',
  BG_CARD: '18181B',
  BG_LIGHT: 'FAFAF9',
  GOLD_PRIMARY: 'EAB308',
  GOLD_AMBER: 'CA8A04',
  GOLD_LIGHT: 'FEF08A',
  TEXT_LIGHT: 'FFFFFF',
  TEXT_MUTED: '94A3B8',
  TEXT_DARK: '0F172A',
  BORDER_CARD: '27272A',
  NAVY_ACCENT: '1E3A8A',
};

function getImgBase64(filename) {
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `image/png;base64,${data.toString('base64')}`;
  }
  return null;
}

function getRawBase64(filename) {
  const p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

// =============================================================================
// 1. SLIDE THUYẾT TRÌNH CRM QUẢN TRỊ VIONE AI 5.0 (EXACTLY 20 SLIDES)
// =============================================================================
async function buildCrmSlides() {
  console.log('>>> Bắt đầu tạo đúng 20 Slide Thuyết Trình CRM ViOne AI 5.0 (PPTX, HTML & MD)...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Vione AI 5.0 — Hệ Thống Quản Trị CRM & Vận Hành Doanh Nghiệp Toàn Diện';

  const crmSlidesData = [
    {
      title: 'VIONE PLATFORM 5.0 — HỆ ĐIỀU HÀNH DOANH NGHIỆP HỢP NHẤT',
      category: 'TỔNG QUAN HỆ THỐNG',
      desc: 'Nền tảng CRM doanh nghiệp thế hệ mới tích hợp sâu Trợ lý Trí tuệ nhân tạo AI Copilot, quản trị đa phân hệ (CRM, Dự án, Tài chính, Nhân sự) và tự động hóa quy trình vận hành toàn diện.',
      keyPoints: [
        'Hợp nhất 4 phân hệ cốt lõi: CRM 360°, Vione Work, Vione Finance, Vione HRM.',
        'Trợ lý ảo AI Copilot phân tích dữ liệu cơ sở dữ liệu thời gian thực.',
        'Kiến trúc Multi-tenant cô lập dữ liệu 100% cấp doanh nghiệp.',
        'Mã hóa đường truyền TLS 1.3 và dữ liệu lưu trữ AES-256 tiêu chuẩn quốc tế.'
      ],
      image: '01_crm_login_blue_white.png',
      caption: 'Giao diện Đăng nhập Hệ thống Quản trị Doanh nghiệp ViOne CRM 5.0'
    },
    {
      title: 'TRUNG TÂM ĐIỀU HÀNH EXECUTIVE DASHBOARD & KPI REALTIME',
      category: 'GIÁM SÁT VẬN HÀNH',
      desc: 'Bảng điều khiển trực quan phản ánh 360 độ sức khỏe doanh nghiệp: Tổng giá trị thương vụ, tỷ lệ chuyển đổi, dòng tiền dự báo và tiến độ hoàn thành chỉ tiêu KPI phòng ban.',
      keyPoints: [
        'Chỉ số đo lường hiệu suất thời gian thực (Realtime KPI Metrics).',
        'Biểu đồ tăng trưởng doanh số và phân bổ cơ hội theo từng giai đoạn phễu.',
        'Cảnh báo sớm các điểm nghẽn SLA vận hành và quá hạn xử lý hợp đồng.',
        'Tích hợp nút kích hoạt nhanh Trợ lý AI phân tích chuyên sâu báo cáo.'
      ],
      image: 'crm1983_02_dashboard_overview.png',
      caption: 'Trung tâm Giám sát Điều hành Vận hành Tổng thể ViOne Dashboard'
    },
    {
      title: 'QUẢN LÝ PHỄU KHÁCH HÀNG & HỒ SƠ 360 ĐỘ (LEAD TO DEAL)',
      category: 'PHÂN HỆ CRM',
      desc: 'Chuẩn hóa toàn bộ hành trình khách hàng từ lúc tiếp nhận đầu mối tiềm năng, chấm điểm Lead Scoring bằng AI, chuyển đổi thành cơ hội bán hàng và ký kết hợp đồng.',
      keyPoints: [
        'Hồ sơ khách hàng 360° tích hợp lịch sử tương tác, email, cuộc gọi và ghi chú.',
        'Tự động phân bổ khách hàng cho nhân viên kinh doanh theo quy tắc phân quyền.',
        'Phân tích hành vi tương tác và dự báo xác suất chốt đơn qua thuật toán AI.',
        'Đồng bộ dữ liệu đa kênh từ Webhook, Form Landing Page, Zalo và Hotline.'
      ],
      image: '04_crm_members_management.png',
      caption: 'Phân hệ Quản lý Khách hàng & Cơ hội Chuyển đổi Lead 360°'
    },
    {
      title: 'QUẢN TRỊ CƠ HỘI THƯƠNG MẠI & QUY TRÌNH KÝ KẾT HỢP ĐỒNG',
      category: 'PHÂN HỆ CRM',
      desc: 'Giám sát trực quan đường ống thương vụ (Pipeline), giá trị hợp đồng lũy kế, thời hạn bàn giao và tự động sinh hợp đồng mẫu điện tử chuẩn pháp lý.',
      keyPoints: [
        'Kanban Pipeline trực quan theo các nấc: Khảo sát, Đề xuất, Đàm phán, Ký kết.',
        'Quản lý điều khoản thanh toán, phụ lục hợp đồng và biên bản nghiệm thu.',
        'Cảnh báo công nợ sắp đến hạn và gửi email nhắc thanh toán tự động.',
        'Xuất báo cáo doanh thu dự phóng (Forecast Revenue) theo tháng và quý.'
      ],
      image: 'live_07_crm_member_detail_drawer.png',
      caption: 'Chi tiết Hồ sơ Đối tác & Ngăn kéo Thẩm định Hợp đồng Thương mại'
    },
    {
      title: 'GIAN HÀNG B2B, DANH MỤC SẢN PHẨM & DỊCH VỤ DOANH NGHIỆP',
      category: 'GIAO THƯƠNG B2B',
      desc: 'Không gian quảng bá và thiết lập bảng giá dịch vụ số hóa, kết nối chuỗi cung ứng giữa các doanh nghiệp trong hệ sinh thái ViOne với chính sách ưu đãi nội bộ.',
      keyPoints: [
        'Quản lý SKU, hình ảnh, thông số kỹ thuật và chính sách chiết khấu linh hoạt.',
        'Tự động sinh báo giá PDF chuyên nghiệp chỉ với 1 cú click chuột.',
        'Kiểm duyệt chất lượng sản phẩm và xác thực năng lực pháp lý nhà cung cấp.',
        'Đồng bộ kho hàng và trạng thái đơn hàng thời gian thực.'
      ],
      image: '18_crm_marketplace_sync.png',
      caption: 'Sàn Giao thương B2B & Quản lý Danh mục Sản phẩm Doanh nghiệp'
    },
    {
      title: 'QUẢN TRỊ SỰ KIỆN DOANH NGHIỆP & ĐIỂM DANH CHECK-IN QR',
      category: 'SỰ KIỆN & HỘI THẢO',
      desc: 'Giải pháp toàn diện tổ chức hội nghị khách hàng, lễ ký kết và sự kiện xúc tiến thương mại: Phát hành vé điện tử E-Ticket, sơ đồ vị trí và camera soát vé thông minh.',
      keyPoints: [
        'Thiết lập sự kiện, gói tài trợ và biểu mẫu đăng ký đại biểu trực tuyến.',
        'Phát hành mã QR Code định danh duy nhất chống gian lận và vé trùng lặp.',
        'Tốc độ quét nhận diện qua camera dưới 0.2 giây, đồng bộ trạng thái tức thì.',
        'Báo cáo tỷ lệ tham dự thực tế và tự động gửi thư cảm ơn sau sự kiện.'
      ],
      image: '03_crm_event_create_modal.png',
      caption: 'Biểu mẫu Khởi tạo Sự kiện & Cấu hình Phát hành Vé Điện tử QR'
    },
    {
      title: 'VIONE WORK — QUẢN LÝ DỰ ÁN AGILE & TIẾN ĐỘ CÔNG VIỆC',
      category: 'PHÂN HỆ CÔNG VIỆC',
      desc: 'Phân hệ quản trị nhiệm vụ thông minh theo mô hình Kanban và Agile Sprint, giúp ban giám đốc kiểm soát 100% tiến độ thực hiện của các phòng ban.',
      keyPoints: [
        'Bảng Kanban kéo thả trực quan theo trạng thái: Cần làm, Đang làm, Hoàn thành.',
        'Gán người phụ trách, hạn chót (Deadline), tài liệu đính kèm và danh sách việc.',
        'AI Copilot phát hiện sớm rủi ro chậm tiến độ và đề xuất điều phối nhân sự.',
        'Đồng bộ lịch biểu cá nhân và gửi thông báo nhắc việc qua ứng dụng di động.'
      ],
      image: 'crm_dash_view_01.png',
      caption: 'Bảng Điều hành Tiến độ Công việc & Báo cáo Hoạt động ViOne Work'
    },
    {
      title: 'VIONE FINANCE — DÒNG TIỀN TỰ ĐỘNG & BÁO CÁO P&L MINH BẠCH',
      category: 'PHÂN HỆ TÀI CHÍNH',
      desc: 'Kiểm soát dòng tiền thu chi, hóa đơn điện tử, công nợ phải thu/phải trả và tự động đối soát ngân hàng theo chuẩn số hóa tài chính doanh nghiệp.',
      keyPoints: [
        'Sổ quỹ Cashbook đa cấp, phân loại theo trung tâm chi phí và dự án.',
        'Quy trình duyệt chi 3 cấp nghiêm ngặt trên nền tảng số hóa không giấy tờ.',
        'Tích hợp cổng thanh toán VietQR Napas 24/7 tự động gạch nợ tức thời.',
        'Báo cáo kết quả kinh doanh P&L và dự báo ngân sách lưu chuyển tiền tệ.'
      ],
      image: 'crm_dash_view_02.png',
      caption: 'Phân hệ Quản trị Dòng tiền, Sổ quỹ Thu chi & Báo cáo Tài chính'
    },
    {
      title: 'VIONE HRM — CHẤM CÔNG SỐ & ĐÁNH GIÁ KPI BẰNG TRÍ TUỆ NHÂN TẠO',
      category: 'PHÂN HỆ NHÂN SỰ',
      desc: 'Số hóa quản trị nhân sự từ lưu trữ hồ sơ nhân viên, quản lý ngày phép, chấm công GPS/Wifi đến tính lương tự động và đánh giá hiệu suất KPI qua AI.',
      keyPoints: [
        'Hồ sơ nhân sự điện tử lưu trữ hợp đồng lao động, bằng cấp và quá trình công tác.',
        'Chấm công thông minh trên điện thoại kết hợp định vị địa lý bảo mật.',
        'Bảng tính lương tự động liên kết dữ liệu chấm công và phụ cấp dự án.',
        'Mô hình đánh giá KPI đa chiều 360 độ hỗ trợ bởi thuật toán AI khách quan.'
      ],
      image: 'crm_dash_view_03.png',
      caption: 'Phân hệ Quản trị Nhân sự HRM, Bảng chấm công & Chỉ số KPI AI'
    },
    {
      title: 'VIONE AI COPILOT 5.0 — BỘ NÃO TỰ ĐỘNG HÓA VẬN HÀNH',
      category: 'ĐIỂM NHẤN CÔNG NGHỆ',
      desc: 'Trợ lý AI thế hệ mới được huấn luyện chuyên sâu cho quản trị doanh nghiệp: Kết nối dữ liệu PostgreSQL, phân tích số liệu và đề xuất quyết định kinh doanh chuẩn xác.',
      keyPoints: [
        'Giao diện Chat trực tiếp hỏi đáp về doanh thu, tồn kho và công nợ khách hàng.',
        'Phân tích nguyên nhân gốc rễ (Root-cause Analysis) và đề xuất 3 bước xử lý.',
        'Tự động soạn thảo thư chào hàng, báo cáo tuần và biên bản họp tóm tắt.',
        'Học hỏi liên tục từ dữ liệu vận hành để cá nhân hóa chiến lược cho từng CEO.'
      ],
      image: 'ai_copilot_evidence_01.png',
      caption: 'Giao diện Trợ lý Trí tuệ Nhân tạo ViOne AI Copilot Hỏi đáp Dữ liệu Thời gian thực'
    },
    {
      title: 'BỘ MÁY TỰ ĐỘNG HÓA QUY TRÌNH ĐA KÊNH (WORKFLOW AUTOMATION)',
      category: 'TỰ ĐỘNG HÓA',
      desc: 'Thiết lập các kịch bản tự động hóa vận hành không cần viết mã (No-code Automation Engine), kết nối liền mạch từ kích hoạt sự kiện đến thực thi tác vụ đa nền tảng.',
      keyPoints: [
        'Bước 01 Trigger: Kích hoạt khi có Lead mới từ Web, Zalo OA hoặc Email.',
        'Bước 02 Actions: AI tự động phân loại mức độ ưu tiên, tạo Deal và gán việc.',
        'Bước 03 Monitor: Giám sát thời gian phản hồi SLA và gửi cảnh báo khi tắc nghẽn.',
        'Tích hợp sẵn hơn 100+ ứng dụng doanh nghiệp phổ biến trên thị trường.'
      ],
      image: 'crm_dash_view_04.png',
      caption: 'Sơ đồ Luồng Tự động hóa Quy trình Đa kênh & Workflow Triggers'
    },
    {
      title: 'MA TRẬN PHÂN QUYỀN RBAC & CÔ LẬP DỮ LIỆU MULTI-TENANT',
      category: 'KIẾN TRÚC BẢO MẬT',
      desc: 'Cơ chế phân quyền 5 cấp chặt chẽ bảo vệ tuyệt đối dữ liệu nội bộ doanh nghiệp, đảm bảo mỗi phòng ban và cá nhân chỉ tiếp cận thông tin thuộc phạm vi công việc.',
      keyPoints: [
        '5 Cấp phân quyền: Cấp 1 Super Admin, Cấp 2 Giám đốc, Cấp 3 Trưởng phòng, Cấp 4 Chuyên viên, Cấp 5 Khách.',
        'Cô lập Tenant tuyệt đối ở tầng cơ sở dữ liệu: Ngăn chặn 100% rò rỉ dữ liệu chéo.',
        'Nhật ký kiểm toán Audit Trail ghi lại mọi hành vi xem, sửa, xóa với địa chỉ IP.',
        'Khóa tài khoản tự động và gửi cảnh báo bảo mật khi phát hiện truy cập bất thường.'
      ],
      image: '02_crm_members_roles_permission.png',
      caption: 'Bảng Cấu hình Ma trận Phân quyền Vai trò & Quản trị Bảo mật RBAC'
    },
    {
      title: 'TIÊU CHUẨN AN TOÀN THÔNG TIN & HẠ TẦNG PRIVATE CLOUD',
      category: 'HẠ TẦNG & BẢO MẬT',
      desc: 'Hệ thống được phát triển tuân thủ nghiêm ngặt các tiêu chuẩn an toàn thông tin quốc tế ISO 27001 và OWASP Top 10, sẵn sàng triển khai trên Cloud hoặc On-Premise.',
      keyPoints: [
        'Mã hóa đầu cuối End-to-End Encryption và giao thức bảo mật TLS 1.3.',
        'Cơ chế sao lưu dữ liệu tự động hàng ngày (Daily Backup) với cam kết RPO < 24h, RTO < 30p.',
        'Tùy chọn triển khai linh hoạt: SaaS Cloud, Private Cloud hoặc On-Premise.',
        'Hỗ trợ tích hợp hệ thống xác thực tập trung SSO (Google Workspace, Microsoft Entra).'
      ],
      image: 'crm_dash_view_05.png',
      caption: 'Báo cáo Kiểm toán Bảo mật Hệ thống & Thông số Sao lưu Dữ liệu'
    },
    {
      title: 'TÍCH HỢP HỆ SINH THÁI MỞ & KẾT NỐI ĐA NỀN TẢNG (OPEN API & WEBHOOK)',
      category: 'TÍCH HỢP HỆ THỐNG',
      desc: 'Khả năng tích hợp mở rộng không giới hạn với ERP, hóa đơn điện tử, cổng thanh toán Napas/VietQR, Zalo OA và tổng đài VoIP qua chuẩn RESTful API bảo mật cao.',
      keyPoints: [
        'Chuẩn kết nối Open API RESTful bảo mật bằng OAuth 2.0 và khóa API Key doanh nghiệp.',
        'Webhook thời gian thực đẩy thông báo ngay khi phát sinh giao dịch hoặc đơn hàng mới.',
        'Tích hợp sẵn cổng VietQR tự động sinh mã thanh toán, gạch nợ tức thời 24/7.',
        'Đồng bộ hóa 2 chiều với hệ thống kế toán MISA, Fast, SAP và Oracle ERP.'
      ],
      image: 'step_22_crm_system_settings.png',
      caption: 'Giao diện Cấu hình Kết nối Tích hợp API & Webhook Đa Nền Tảng'
    },
    {
      title: 'TRUNG TÂM PHÂN TÍCH KINH DOANH BI & DỰ BÁO XU HƯỚNG DÒNG TIỀN',
      category: 'BÁO CÁO THÔNG MINH BI',
      desc: 'Hệ thống báo cáo thông minh Business Intelligence (BI) trực quan hóa đa chiều, giúp ban giám đốc dự báo chính xác dòng tiền và tăng trưởng doanh số theo thời gian thực.',
      keyPoints: [
        'Phân tích vòng đời khách hàng (Customer Lifetime Value - CLV) và tỷ lệ giữ chân khách hàng.',
        'Dự báo doanh thu 6 tháng tiếp theo bằng mô hình hồi quy học máy (Machine Learning).',
        'Bản đồ nhiệt bán hàng (Sales Heatmap) theo khu vực địa lý, chi nhánh và danh mục hàng hóa.',
        'Xuất báo cáo tài chính quản trị tự động theo định dạng Excel, PDF và PowerPoint chỉ 1 chạm.'
      ],
      image: 'sub_06_crm_dashboard_kpi.png',
      caption: 'Báo cáo Phân tích Thông minh Business Intelligence & Dự báo Doanh thu AI'
    },
    {
      title: 'QUẢN TRỊ TÀI LIỆU SỐ & QUY TRÌNH KÝ HỢP ĐỒNG ĐIỆN TỬ (E-SIGN)',
      category: 'SỐ HÓA VĂN BẢN',
      desc: 'Lưu trữ, phân loại và ký số văn bản, hợp đồng kinh tế hoàn toàn trực tuyến, loại bỏ 100% thủ tục giấy tờ cồng kềnh và tiết kiệm 80% thời gian luân chuyển hồ sơ.',
      keyPoints: [
        'Tích hợp chữ ký số token USB và chữ ký số từ xa HSM chuẩn giá trị pháp lý Việt Nam.',
        'Phân loại tài liệu thông minh theo dự án, khách hàng và cấp độ bảo mật bí mật nội bộ.',
        'Theo dõi trực quan trạng thái ký kết: Đã gửi, Đã mở xem, Đã ký duyệt, Quá hạn xử lý.',
        'Lưu trữ đám mây mã hóa kép, chống giả mạo và phân quyền truy cập theo sơ đồ chức danh.'
      ],
      image: 'step_21_crm_companies_directory.png',
      caption: 'Quản trị Thư viện Văn bản Số & Quy trình Ký kết Hợp đồng Điện tử'
    },
    {
      title: 'CHÍNH SÁCH BÁO GIÁ TƯ VẤN DOANH NGHIỆP (3 GÓI GIẢI PHÁP)',
      category: 'CHÍNH SÁCH THƯƠNG MẠI',
      desc: 'ViOne áp dụng mô hình định giá tư vấn linh hoạt theo quy mô và mức độ số hóa của từng doanh nghiệp, cam kết tối ưu chi phí đầu tư và chuyển giao công nghệ trọn gói.',
      keyPoints: [
        'Gói Khởi tạo (Starter): Dành cho DN 5 - 20 nhân sự, CRM cơ bản & AI 500 tác vụ/tháng.',
        'Gói Tăng trưởng (Growth - Phổ biến nhất): Dành cho DN 20 - 100 nhân sự, mở khóa 4 phân hệ.',
        'Gói Doanh nghiệp lớn (Enterprise): Dành cho DN > 100 nhân sự, Private Cloud & tích hợp SAP/ERP.',
        'Tuyệt đối không hiển thị giá cứng: Khảo sát hiện trạng và gửi báo giá may đo chi tiết.'
      ],
      image: 'crm_dash_view_06.png',
      caption: 'Bảng So sánh 3 Gói Giải pháp Số hóa Doanh nghiệp ViOne Platform 5.0'
    },
    {
      title: 'LỘ TRÌNH TRIỂN KHAI CHUYỂN ĐỔI SỐ 5 BƯỚC CHUẨN MỰC',
      category: 'TRIỂN KHAI & BÀN GIAO',
      desc: 'Phương pháp luận triển khai thực chiến đã được chứng minh hiệu quả qua hàng trăm doanh nghiệp, đảm bảo vận hành thành công chỉ sau 2 đến 4 tuần làm việc.',
      keyPoints: [
        'Tuần 1: Khảo sát quy trình nghiệp vụ thực tế và thiết lập sơ đồ luồng dữ liệu.',
        'Tuần 2: Khởi tạo hệ thống, cấu hình phân quyền RBAC và import dữ liệu danh mục.',
        'Tuần 3: Đào tạo chuyển giao công nghệ cho cán bộ quản lý và nhân viên sử dụng.',
        'Tuần 4: Vận hành thử nghiệm (UAT), tinh chỉnh kịch bản AI và ký biên bản nghiệm thu.'
      ],
      image: 'crm_dash_view_07.png',
      caption: 'Biểu đồ Tiến độ Triển khai Dự án & Kế hoạch Đào tạo Chuyển giao'
    },
    {
      title: 'CAM KẾT DỊCH VỤ SLA & ĐỘI NGŨ CHUYÊN GIA ĐỒNG HÀNH 24/7',
      category: 'HỖ TRỢ & BẢO HÀNH',
      desc: 'VioConnect cam kết đồng hành lâu dài cùng sự phát triển bền vững của doanh nghiệp, cung cấp dịch vụ hỗ trợ kỹ thuật tận tâm và nâng cấp tính năng định kỳ.',
      keyPoints: [
        'Cam kết thời gian hoạt động hệ thống Uptime tối thiểu 99.98% / năm.',
        'Kênh hỗ trợ kỹ thuật đa kênh: Hotline 24/7, Nhóm Zalo chuyên trách, Ticket hệ thống.',
        'Thời gian phản hồi sự cố khẩn cấp dưới 15 phút, khắc phục trong vòng 2 giờ.',
        'Cập nhật miễn phí các bản vá bảo mật và tính năng nâng cấp phiên bản định kỳ.'
      ],
      image: 'crm_dash_view_08.png',
      caption: 'Hệ thống Giám sát Độ sẵn sàng Uptime & Cổng Hỗ trợ Khách hàng 24/7'
    },
    {
      title: 'TỔNG KẾT GIÁ TRỊ & KHỞI ĐỘNG HỢP TÁC SỐ HÓA CÙNG VIONE',
      category: 'KẾT LUẬN & HÀNH ĐỘNG',
      desc: 'Chuyển đổi số không còn là lựa chọn mà là con đường tất yếu để bứt phá năng lực cạnh tranh. ViOne 5.0 sẵn sàng đồng hành cùng quý doanh nghiệp kiến tạo tương lai.',
      keyPoints: [
        'Tiết kiệm 40% chi phí vận hành và 50% thời gian họp báo cáo định kỳ.',
        'Dữ liệu quản trị tập trung, minh bạch, hỗ trợ ra quyết định kinh doanh tức thời.',
        'Trải nghiệm đẳng cấp cho khách hàng và đối tác trong từng điểm chạm số hóa.',
        'Đăng ký lịch tư vấn 1-1 ngay hôm nay để nhận trọn gói khảo sát quy trình miễn phí.'
      ],
      image: '01_landing_hero.png',
      caption: 'Cổng Đăng ký Tư vấn Chuyển đổi số Doanh nghiệp ViOne Platform 5.0'
    }
  ];

  // Verify exact 20 slides
  console.log(`✓ Xác nhận số lượng slide CRM: ${crmSlidesData.length} / 20`);

  // Build each slide in PPTX
  crmSlidesData.forEach((sData, idx) => {
    let s = pres.addSlide();
    s.background = { color: THEME.BG_DARK };

    // Left Accent Stripe
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: THEME.GOLD_PRIMARY } });

    // Header Tag
    s.addShape(pres.ShapeType.rect, { x: 0.8, y: 0.45, w: 3.2, h: 0.35, fill: { color: THEME.BG_CARD }, line: { color: THEME.GOLD_PRIMARY, width: 1 } });
    s.addText(`SLIDE ${idx + 1} • ${sData.category}`, { x: 0.8, y: 0.45, w: 3.2, h: 0.35, fontSize: 10, fontFace: 'Calibri', bold: true, color: THEME.GOLD_PRIMARY, align: 'center', valign: 'middle' });

    // Title & Subtitle
    s.addText(sData.title, { x: 0.8, y: 0.9, w: 11.8, h: 0.55, fontSize: 19, fontFace: 'Calibri', bold: true, color: THEME.TEXT_LIGHT });
    s.addText(sData.desc, { x: 0.8, y: 1.45, w: 11.8, h: 0.45, fontSize: 11, fontFace: 'Calibri', color: THEME.TEXT_MUTED });

    // Left Column: Keypoints Box
    s.addShape(pres.ShapeType.rect, { x: 0.8, y: 2.05, w: 5.5, h: 4.6, fill: { color: THEME.BG_CARD }, line: { color: THEME.BORDER_CARD, width: 1 } });
    s.addText('TÍNH NĂNG ĐỘT PHÁ & GIÁ TRỊ VẬN HÀNH', { x: 1.1, y: 2.25, fontSize: 13, fontFace: 'Calibri', bold: true, color: THEME.GOLD_PRIMARY });

    let bulletText = sData.keyPoints.map(kp => `• ${kp}`).join('\n\n');
    s.addText(bulletText, { x: 1.1, y: 2.7, w: 4.9, h: 3.7, fontSize: 11.5, fontFace: 'Calibri', color: 'E2E8F0', lineSpacingMultiple: 1.25 });

    // Right Column: Evidence Screenshot Frame
    s.addShape(pres.ShapeType.rect, { x: 6.6, y: 2.05, w: 6.0, h: 4.6, fill: { color: '000000' }, line: { color: THEME.GOLD_PRIMARY, width: 2 } });
    const imgBase64 = getImgBase64(sData.image) || getImgBase64('01_crm_login_blue_white.png');
    if (imgBase64) {
      s.addImage({
        data: imgBase64,
        x: 6.65,
        y: 2.1,
        w: 5.9,
        h: 4.15,
        sizing: { type: 'contain', w: 5.9, h: 4.15 }
      });
    }

    // Caption strip
    s.addShape(pres.ShapeType.rect, { x: 6.6, y: 6.25, w: 6.0, h: 0.4, fill: { color: '18181B' } });
    s.addText(`Minh chứng: ${sData.caption}`, { x: 6.65, y: 6.25, w: 5.9, h: 0.4, fontSize: 9, fontFace: 'Calibri', color: THEME.GOLD_LIGHT, italic: true, align: 'center', valign: 'middle' });

    // Footer
    s.addText('VIONE PLATFORM 5.0 · HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP TIÊU CHUẨN', { x: 0.8, y: 7.0, w: 9.0, fontSize: 9, fontFace: 'Calibri', color: '64748B' });
    s.addText(`Trang ${idx + 1} / ${crmSlidesData.length}`, { x: 10.5, y: 7.0, w: 2.0, fontSize: 9, fontFace: 'Calibri', color: '64748B', align: 'right' });
  });

  const outPptxCrm = path.join(VIONE_DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx');
  await pres.writeFile({ fileName: outPptxCrm });
  console.log(`✓ Đã xuất bản file PPTX CRM: ${outPptxCrm} (${(fs.statSync(outPptxCrm).size / 1024).toFixed(1)} KB)`);

  // Build Full HTML Presentation for CRM Slides
  buildHtmlPresentation(
    crmSlidesData,
    'SLIDE THUYẾT TRÌNH HỆ THỐNG QUẢN TRỊ CRM VIONE AI 5.0',
    path.join(VIONE_DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html'),
    false
  );

  // Build Full Markdown for CRM Slides
  buildMarkdownPresentation(
    crmSlidesData,
    'BỘ SLIDE THUYẾT TRÌNH HỆ THỐNG QUẢN TRỊ CRM VIONE 5.0',
    path.join(VIONE_DOC_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.md')
  );
}

// =============================================================================
// 2. SLIDE THUYẾT TRÌNH APP VIONE CONNECT (EXACTLY 20 SLIDES IN TITANIUM PHONES)
// =============================================================================
async function buildAppSlides() {
  console.log('>>> Bắt đầu tạo đúng 20 Slide Thuyết Trình App ViOne Connect (PPTX, HTML & MD)...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'ViOne Connect — Ứng Dụng Di Động Danh Thiếp Số & Giao Thương Doanh Nhân';

  const appSlidesData = [
    {
      title: 'VIONE CONNECT MOBILE APP — ĐỈNH CAO KẾT NỐI DOANH NHÂN 5.0',
      category: 'TỔNG QUAN ỨNG DỤNG',
      desc: 'Ứng dụng số hóa bỏ túi dành riêng cho chủ doanh nghiệp, nhà sáng lập và lãnh đạo: Tích hợp công nghệ thẻ NFC 1-chạm, danh bạ kinh doanh, mạng xã hội giao thương và Trợ lý AI.',
      keyPoints: [
        'Kích hoạt danh thiếp số cá nhân hóa định danh doanh nhân.',
        'Chạm thẻ NFC truyền tải hồ sơ năng lực số trong 1 giây không cần cài app.',
        'Mạng lưới giao thương B2B bảo mật, tìm kiếm đối tác theo vị trí địa lý.',
        'Ứng dụng đa nền tảng tối ưu: iOS App Store, Android APK và PWA.'
      ],
      image: '06_app_login_screen.png',
      caption: 'Màn hình Đăng nhập An toàn & Xác thực Danh tính ViOne Connect Mobile'
    },
    {
      title: 'DANH THIẾP SỐ TITANIUM NFC & THẺ VIP ĐỘC BẢN',
      category: 'CÔNG NGHỆ 1-CHẠM',
      desc: 'Thay thế hoàn toàn danh thiếp giấy truyền thống bằng thẻ vật lý chất liệu Titanium cao cấp tích hợp vi chip NFC chuẩn quốc tế, nâng tầm vị thế thương hiệu cá nhân.',
      keyPoints: [
        'Chạm thẻ vào mặt sau smartphone đối tác để tự động mở Portfolio số.',
        'Lưu trực tiếp số điện thoại, email và website vào danh bạ danh nhân chỉ 1 chạm.',
        'Cập nhật chức vụ, sản phẩm mới tức thời mà không cần in lại thẻ danh thiếp.',
        'Mã QR Code dự phòng bảo mật chuẩn mực khi đối tác dùng thiết bị cũ.'
      ],
      image: '09_app_vip_card.png',
      caption: 'Giao diện Thẻ Doanh Nhân Số Hóa Titanium NFC & QR Code Độc Bản'
    },
    {
      title: 'MÀN HÌNH TRANG CHỦ & TRUNG TÂM HOẠT ĐỘNG DOANH NHÂN',
      category: 'TRẢI NGHIỆM NGƯỜI DÙNG',
      desc: 'Giao diện trang chủ tinh gọn, sang trọng với các tiện ích truy cập nhanh: Thẻ VIP số, Lịch hẹn hôm nay, Cơ hội kinh doanh mới và Tin tức chuyển động thị trường.',
      keyPoints: [
        'Widget Thẻ VIP điện tử hiển thị mã số thành viên và xếp hạng uy tín.',
        'Bảng tổng hợp nhanh các chỉ số kết nối: Lượt chạm thẻ, Cuộc họp, Đơn hàng B2B.',
        'Lối tắt truy cập nhanh: Quét QR Check-in, Mở Chat, Đăng cơ hội hợp tác.',
        'Thiết kế giao diện Dark Luxury tối ưu hiển thị trên màn hình OLED cao cấp.'
      ],
      image: '08_app_home_dashboard.png',
      caption: 'Màn hình Trang chủ Dashboard Ứng dụng Di động ViOne Connect'
    },
    {
      title: 'QUÉT MÃ QR & KẾT NỐI HỒ SƠ DOANH NGHIỆP TRONG 0.2 GIÂY',
      category: 'KẾT NỐI TỨC THÌ',
      desc: 'Bộ máy quét camera siêu tốc nhận diện mã QR của đối tác tại các sự kiện giao thương, tự động đồng bộ thông tin pháp nhân và lưu vào danh bạ VIP.',
      keyPoints: [
        'Tốc độ quét nhận diện và giải mã tức thời dưới 200 mili-giây.',
        'Tự động phân loại đối tác theo ngành nghề (Sản xuất, Bán lẻ, Dịch vụ).',
        'Ghi chú bối cảnh cuộc gặp gỡ và đặt lịch hẹn gặp lại ngay trong hồ sơ.',
        'Bảo mật danh bạ cá nhân, chống sao chép và thu thập dữ liệu trái phép.'
      ],
      image: '10_app_profile_view.png',
      caption: 'Hồ sơ Doanh nhân 360° & Bộ máy Quét Mã QR Định danh Giao thương'
    },
    {
      title: 'BẢNG TIN MOMENTS DOANH NGHIỆP & CHIA SẺ THƯƠNG VỤ',
      category: 'MẠNG XÃ HỘI B2B',
      desc: 'Không gian truyền thông nội bộ uy tín nơi các nhà lãnh đạo chia sẻ thành tựu ký kết hợp đồng, hoạt động doanh nghiệp và tìm kiếm đối tác đồng hành.',
      keyPoints: [
        'Đăng tải bài viết kèm hình ảnh, video và liên kết sản phẩm gian hàng B2B.',
        'Tương tác chuyên nghiệp: Bắt tay giao thương, Chúc mừng, Đề nghị hợp tác.',
        'Lọc tin tức theo ngành nghề, khu vực địa lý hoặc hội doanh nghiệp tham gia.',
        'Kiểm duyệt nội dung tự động bằng AI, loại bỏ tin rác và quảng cáo sai quy chuẩn.'
      ],
      image: 'app1983_04_home_feed.png',
      caption: 'Bảng tin Moments Doanh nghiệp & Chia sẻ Cơ hội Giao thương Mạng lưới'
    },
    {
      title: 'SÀN CƠ HỘI GIAO THƯƠNG CUNG - CẦU THỜI GIAN THỰC',
      category: 'KẾT NỐI KINH DOANH',
      desc: 'Chợ giao thương B2B khép kín giữa các hội viên: Đăng tải nhu cầu mua hàng số lượng lớn hoặc giới thiệu nguồn cung độc quyền với chính sách chiết khấu sâu.',
      keyPoints: [
        'Đăng tin Chào mua (Cần tìm nhà cung cấp) và Chào bán (Cung ứng sản phẩm).',
        'Bộ lọc nâng cao theo giá trị hợp đồng, địa bàn và tiến độ giao hàng.',
        'Hệ thống AI tự động phân tích và gán ghép cơ hội (Smart Matching Engine).',
        'Đánh giá uy tín đối tác qua chỉ số xác thực doanh nghiệp Verified Business.'
      ],
      image: 'sub_39_app_opportunities_feed.png',
      caption: 'Bảng tin Nhu cầu Giao thương Cung - Cầu Thời Gian Thực ViOne Connect'
    },
    {
      title: 'GIAN HÀNG SẢN PHẨM & DỊCH VỤ DOANH NGHIỆP TRÊN MOBILE',
      category: 'THƯƠNG MẠI ĐIỆN TỬ B2B',
      desc: 'Showroom di động trưng bày các giải pháp, sản phẩm chủ lực của doanh nghiệp: Hình ảnh sắc nét, thông số chi tiết và nút liên hệ báo giá nhanh.',
      keyPoints: [
        'Duyệt sản phẩm theo danh mục ngành hàng với bộ lọc thông minh.',
        'Xem hồ sơ năng lực (Profile), chứng chỉ chất lượng và năng lực sản xuất.',
        'Gửi yêu cầu nhận báo giá riêng cho hội viên chỉ với 1 thao tác chạm.',
        'Theo dõi lịch sử đơn hàng và tiến độ thực hiện hợp đồng cung ứng.'
      ],
      image: 'app1983_05_shop_marketplace.png',
      caption: 'Gian Hàng Sản Phẩm & Dịch Vụ Doanh Nghiệp Trên Ứng Dụng Mobile'
    },
    {
      title: 'TRÒ CHUYỆN BẢO MẬT E2EE & NHÓM KẾT NỐI GIAO THƯƠNG',
      category: 'GIAO TIẾP DOANH NGHIỆP',
      desc: 'Kênh đàm phán thương vụ an toàn tuyệt đối với mã hóa đầu cuối End-to-End Encryption, chia sẻ tài liệu mật, hợp đồng và gọi thoại chất lượng cao.',
      keyPoints: [
        'Mã hóa tin nhắn chuẩn Signal Protocol, không lưu trữ nội dung trên máy chủ trung gian.',
        'Tạo nhóm làm việc kín theo từng dự án hoặc hiệp hội ngành nghề.',
        'Gửi tài liệu hợp đồng định dạng PDF, Excel dung lượng lớn không bị nén mờ.',
        'Tính năng tin nhắn tự hủy sau thời gian cài đặt đối với thông tin nhạy cảm.'
      ],
      image: 'app1983_06_messages_chat.png',
      caption: 'Trung tâm Trò chuyện Doanh nghiệp Bảo mật & Đàm phán Thương mại'
    },
    {
      title: 'QUẢN LÝ SỰ KIỆN DOANH NHÂN & VÉ ĐIỆN TỬ CHECK-IN',
      category: 'SỰ KIỆN & HỘI NGHỊ',
      desc: 'Lịch trình hội nghị, tọa đàm xúc tiến thương mại và gala dinner được cập nhật liên tục: Đăng ký tham gia, nhận vé QR và sơ đồ đường đi chỉ dẫn chi tiết.',
      keyPoints: [
        'Danh sách sự kiện sắp diễn ra kèm thông tin diễn giả và nội dung chương trình.',
        'Vé điện tử tích hợp mã QR cá nhân hóa, hiển thị số bàn và vị trí chỗ ngồi.',
        'Nhắc lịch tự động trước 24 giờ và 2 giờ qua thông báo đẩy trên điện thoại.',
        'Tải tài liệu thuyết trình của diễn giả ngay trên trang chi tiết sự kiện.'
      ],
      image: '11_app_events_calendar.png',
      caption: 'Lịch Trình Sự Kiện Kết Nối Giao Thương & Vé Điện Tử E-Ticket QR'
    },
    {
      title: 'SƠ ĐỒ CHỖ NGỒI SỰ KIỆN & ĐIỀU PHỐI KHÁCH MỜI VIP',
      category: 'ĐIỀU PHỐI SỰ KIỆN',
      desc: 'Trải nghiệm đỉnh cao tại các đại hội doanh nhân: Tra cứu vị trí bàn tiệc VIP của mình, xem danh sách các lãnh đạo ngồi cùng bàn để chủ động giao lưu.',
      keyPoints: [
        'Sơ đồ hội trường tương tác trực quan (Interactive Seating Map).',
        'Xem thông tin chức vụ và doanh nghiệp của các đối tác ngồi chung bàn.',
        'Tính năng gửi lời mời kết bạn trước khi sự kiện chính thức khai mạc.',
        'Đổi chỗ ngồi linh hoạt thông qua ban tổ chức khi có nhu cầu đặc biệt.'
      ],
      image: '12_app_seat_map.png',
      caption: 'Sơ đồ Vị Trí Chỗ Ngồi Hội Nghị & Danh Sách Đại Biểu Bàn VIP'
    },
    {
      title: 'HỆ SINH THÁI ĐẶC QUYỀN VOUCHER & ƯU ĐÃI NỘI BỘ',
      category: 'ĐẶC QUYỀN HỘI VIÊN',
      desc: 'Hàng trăm mã ưu đãi độc quyền dành riêng cho lãnh đạo: Dịch vụ phòng chờ sân bay, khách sạn 5 sao, sân golf, nhà hàng sang trọng và dịch vụ xe đưa đón VIP.',
      keyPoints: [
        'Kho voucher số hóa phân loại theo phong cách sống và nhu cầu công tác.',
        'Mã vạch và mã QR ưu đãi sử dụng trực tiếp tại quầy dịch vụ đối tác.',
        'Tặng voucher cho bạn bè, đối tác hoặc nhân sự xuất sắc trong công ty.',
        'Nhận thông báo khi có thương hiệu cao cấp mới tham gia hệ sinh thái đặc quyền.'
      ],
      image: '13_app_vouchers_benefits.png',
      caption: 'Trung tâm Ưu đãi Đặc quyền Doanh nhân & Kho Voucher VIP ViOne'
    },
    {
      title: 'KHO TƯ LIỆU DOANH NGHIỆP & BẢN TIN KINH TẾ ĐỘC QUYỀN',
      category: 'TRI THỨC QUẢN TRỊ',
      desc: 'Thư viện số hóa lưu trữ các báo cáo nghiên cứu thị trường, mẫu biểu quản trị doanh nghiệp, quy chuẩn pháp lý và cẩm nang điều hành dành cho nhà lãnh đạo.',
      keyPoints: [
        'Tải về miễn phí hàng trăm biểu mẫu hợp đồng, quy chế nhân sự và KPI chuẩn.',
        'Bản tin dự báo xu hướng kinh tế vĩ mô do đội ngũ chuyên gia cố vấn biên soạn.',
        'Đọc tài liệu trực tiếp trên ứng dụng với trình xem PDF bảo mật chống rò rỉ.',
        'Gắn thẻ tài liệu yêu thích để tra cứu nhanh khi cần tham khảo trong công việc.'
      ],
      image: 'app1983_07_library_documents.png',
      caption: 'Thư viện Tư liệu Số hóa & Báo cáo Nghiên cứu Thị trường Dành cho CEO'
    },
    {
      title: 'BIỂU QUYẾT ĐẠI HỘI & KHẢO SÁT DOANH NGHIỆP ĐIỆN TỬ',
      category: 'DÂN CHỦ SỐ HÓA',
      desc: 'Tính năng biểu quyết thông qua nghị quyết và thăm dò ý kiến lãnh đạo theo nguyên tắc 1 người 1 phiếu bảo mật tuyệt đối, kiểm phiếu thời gian thực.',
      keyPoints: [
        'Tạo cuộc biểu quyết với thời gian bắt đầu, kết thúc và cơ chế kiểm soát đại biểu.',
        'Mã hóa phiếu bầu bảo mật, không thể can thiệp hay thay đổi kết quả sau khi gửi.',
        'Biểu đồ kết quả trực tiếp phản ánh tỷ lệ tán thành, không tán thành và ý kiến khác.',
        'Lưu biên bản kiểm phiếu điện tử có chữ ký số xác thực tính pháp lý của nghị quyết.'
      ],
      image: 'app1983_08_polls_voting.png',
      caption: 'Màn hình Biểu quyết Đại hội Điện tử & Báo cáo Kết quả Trực tiếp'
    },
    {
      title: 'TRỢ LÝ ẢO BỎ TÚI VIONE ASSISTANT — ĐIỀU HÀNH BẰNG GIỌNG NÓI',
      category: 'AI TRÊN MOBILE',
      desc: 'Mang sức mạnh của AI Copilot vào thiết bị di động: Tra cứu số liệu doanh thu tức thì, nhắc lịch họp quan trọng và gợi ý đối tác tiềm năng trên đường công tác.',
      keyPoints: [
        'Hỏi đáp tự nhiên bằng giọng nói Tiếng Việt hoặc gõ văn bản nhanh.',
        'Tra cứu tức thời: "Hôm nay có bao nhiêu khách hàng mới?", "Dòng tiền tuần này thế nào?".',
        'Gợi ý kết nối thông minh: "Có CEO nào cùng ngành đang ở gần khách sạn tôi không?".',
        'Tự động ghi nhớ sở thích giao thương và thói quen làm việc của từng chủ doanh nghiệp.'
      ],
      image: 'app1983_11_ai_mobile_assistant.png',
      caption: 'Trợ lý Ảo Doanh nhân ViOne Assistant Tích hợp Sâu trên Điện thoại'
    },
    {
      title: 'TÍNH NĂNG GỢI Ý ĐỐI TÁC GẦN BẠN (NEARBY RADAR MATCHING)',
      category: 'KẾT NỐI KHÔNG GIAN',
      desc: 'Thuật toán định vị thông minh gợi ý các cơ hội kết nối giao thương trực tiếp khi doanh nhân đi công tác tại các tỉnh thành hoặc tham gia hội chợ thương mại.',
      keyPoints: [
        'Quét radar tìm kiếm các hội viên doanh nghiệp trong bán kính từ 1km đến 20km.',
        'Chỉ kích hoạt khi người dùng bật chế độ "Sẵn sàng giao lưu kết nối".',
        'Gửi lời mời thưởng thức cà phê và giao lưu hợp tác kinh doanh 1 chạm.',
        'Bảo mật tuyệt đối thông tin tọa độ chi tiết, chỉ hiển thị khoảng cách tương đối.'
      ],
      image: 'app1983_12_nearby_connect.png',
      caption: 'Tính năng Radar Gợi ý Đối tác Kinh doanh Tiềm năng Gần Bạn'
    },
    {
      title: 'HỆ THỐNG THÔNG BÁO THÔNG MINH (SMART PUSH NOTIFICATIONS)',
      category: 'TƯƠNG TÁC THỜI GIAN THỰC',
      desc: 'Kênh truyền tải thông điệp tức thời đến người dùng: Nhắc nhở lịch họp, cảnh báo công nợ, thông báo khách hàng tiềm năng và tin tức nóng từ hiệp hội.',
      keyPoints: [
        'Tỷ lệ mở thông báo đạt trên 78% nhờ thuật toán tối ưu thời điểm gửi thông minh.',
        'Phân luồng thông báo rõ ràng: Công việc, Cơ hội giao thương, Tài chính, Sự kiện.',
        'Bấm vào thông báo điều hướng thẳng đến đúng màn hình nghiệp vụ liên quan.',
        'Tùy chỉnh chế độ Không làm phiền vào ban đêm hoặc trong các khung giờ họp kín.'
      ],
      image: 'app1983_09_notifications.png',
      caption: 'Trung tâm Quản trị Thông báo Đẩy Push Notification Đa Kênh'
    },
    {
      title: 'QUẢN LÝ TÀI KHOẢN PHÁP NHÂN & CÀI ĐẶT BẢO MẬT RIÊNG TƯ',
      category: 'BẢO MẬT CÁ NHÂN',
      desc: 'Chủ động quản lý thông tin đại diện pháp lý của công ty, cấu hình quyền riêng tư danh bạ, cài đặt xác thực vân tay / Face ID và quản lý các thiết bị đăng nhập.',
      keyPoints: [
        'Đăng nhập sinh trắc học Face ID / Touch ID an toàn và tiện lợi trên di động.',
        'Quản lý danh sách các phiên đăng nhập, đăng xuất từ xa khi nghi ngờ lộ thiết bị.',
        'Tùy chỉnh chế độ công khai: Ẩn/Hiện số điện thoại cá nhân trên danh bạ chung.',
        'Tải về toàn bộ dữ liệu cá nhân theo tiêu chuẩn quyền riêng tư dữ liệu quốc tế.'
      ],
      image: 'app1983_10_account_settings.png',
      caption: 'Cài đặt Tài khoản Doanh nghiệp, Phân quyền Riêng tư & Bảo mật Face ID'
    },
    {
      title: 'HƯỚNG DẪN KÍCH HOẠT THẺ TITANIUM NFC & TẢI APP',
      category: 'HƯỚNG DẪN SỬ DỤNG',
      desc: 'Quy trình 3 bước siêu tốc giúp doanh nhân bắt đầu trải nghiệm hệ sinh thái ViOne Connect chỉ trong vòng 3 phút làm việc.',
      keyPoints: [
        'Bước 1: Tải ứng dụng ViOne Connect trên App Store / Google Play hoặc mở PWA.',
        'Bước 2: Đăng nhập bằng tài khoản được cấp hoặc số điện thoại định danh.',
        'Bước 3: Chạm thẻ Titanium vào đầu đọc NFC để đồng bộ định danh cá nhân độc bản.',
        'Sẵn sàng kết nối giao thương và tham gia hàng trăm sự kiện kết nối đẳng cấp.'
      ],
      image: '06_app_login_screen.png',
      caption: 'Quy trình Kích hoạt Tài khoản & Đồng bộ Thẻ Titanium NFC 1-Chạm'
    },
    {
      title: 'ĐIỀU HÀNH DỰ ÁN & DUYỆT ĐƠN TỪ NHANH TRÊN DI ĐỘNG (MOBILE APPROVALS)',
      category: 'VẬN HÀNH DI ĐỘNG',
      desc: 'Giúp ban lãnh đạo phê duyệt nhanh các đề xuất mua sắm, tạm ứng kinh phí, đơn nghỉ phép và giao việc tức thời mọi lúc mọi nơi ngay trên smartphone.',
      keyPoints: [
        'Nhận thông báo đẩy phê duyệt với đầy đủ hồ sơ đính kèm và tờ trình kinh phí.',
        'Thao tác 1-chạm: Phê duyệt, Từ chối kèm lý do hoặc Chuyển tiếp cấp cao hơn.',
        'Theo dõi tiến độ thực hiện nhiệm vụ khẩn cấp của các bộ phận cấp dưới theo thời gian thực.',
        'Tích hợp chữ ký số di động bảo đảm tính pháp lý cao nhất của quyết định điều hành.'
      ],
      image: 'sub_09_crm_approve_action.png',
      caption: 'Màn hình Phê duyệt Hồ sơ & Điều phối Nhiệm vụ Khẩn cấp trên Di động'
    },
    {
      title: 'TỔNG KẾT HỆ SINH THÁI MOBILE VIONE CONNECT & TẦM NHÌN 2026',
      category: 'KẾT LUẬN & ĐỒNG HÀNH',
      desc: 'ViOne Connect mở ra kỷ nguyên kết nối giao thương thông minh, không khoảng cách, đưa thương hiệu doanh nghiệp và doanh nhân Việt Nam vươn tầm quốc tế.',
      keyPoints: [
        'Hơn 10,000+ kết nối giao thương thành công được tạo lập mỗi tháng trong mạng lưới.',
        'Giảm thiểu 90% lãng phí in ấn danh thiếp giấy và tài liệu hội nghị cồng kềnh.',
        'Nâng cao vị thế thương hiệu cá nhân với tấm thẻ doanh nhân Titanium số hóa đẳng cấp.',
        'Tải ứng dụng ngay hôm nay để gia nhập cộng đồng doanh nhân tinh hoa ViOne.'
      ],
      image: 'sub_15_app_public_digital_card.png',
      caption: 'Hệ Sinh Thái Danh Thiếp Số Titanium & Mạng Lưới Doanh Nhân Tinh Hoa ViOne Connect'
    }
  ];

  // Verify exact 20 slides
  console.log(`✓ Xác nhận số lượng slide Mobile App: ${appSlidesData.length} / 20`);

  // Build each slide in PPTX
  appSlidesData.forEach((sData, idx) => {
    let s = pres.addSlide();
    s.background = { color: THEME.BG_DARK };

    // Left Accent Stripe
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: THEME.GOLD_PRIMARY } });

    // Header Tag
    s.addShape(pres.ShapeType.rect, { x: 0.8, y: 0.45, w: 3.2, h: 0.35, fill: { color: THEME.BG_CARD }, line: { color: THEME.GOLD_PRIMARY, width: 1 } });
    s.addText(`SLIDE ${idx + 1} • ${sData.category}`, { x: 0.8, y: 0.45, w: 3.2, h: 0.35, fontSize: 10, fontFace: 'Calibri', bold: true, color: THEME.GOLD_PRIMARY, align: 'center', valign: 'middle' });

    // Title & Subtitle
    s.addText(sData.title, { x: 0.8, y: 0.9, w: 11.8, h: 0.55, fontSize: 19, fontFace: 'Calibri', bold: true, color: THEME.TEXT_LIGHT });
    s.addText(sData.desc, { x: 0.8, y: 1.45, w: 11.8, h: 0.45, fontSize: 11, fontFace: 'Calibri', color: THEME.TEXT_MUTED });

    // Left Column: Keypoints Box
    s.addShape(pres.ShapeType.rect, { x: 0.8, y: 2.05, w: 6.8, h: 4.6, fill: { color: THEME.BG_CARD }, line: { color: THEME.BORDER_CARD, width: 1 } });
    s.addText('TÍNH NĂNG ĐỘT PHÁ & TRẢI NGHIỆM THỰC TẾ', { x: 1.1, y: 2.25, fontSize: 13, fontFace: 'Calibri', bold: true, color: THEME.GOLD_PRIMARY });

    let bulletText = sData.keyPoints.map(kp => `• ${kp}`).join('\n\n');
    s.addText(bulletText, { x: 1.1, y: 2.7, w: 6.2, h: 3.7, fontSize: 11.5, fontFace: 'Calibri', color: 'E2E8F0', lineSpacingMultiple: 1.25 });

    // Right Column: Titanium Smartphone Frame Simulation
    s.addShape(pres.ShapeType.rect, { x: 8.0, y: 1.95, w: 4.5, h: 4.8, fill: { color: '000000' }, line: { color: THEME.GOLD_PRIMARY, width: 2 } });
    
    // Titanium phone top speaker bar
    s.addShape(pres.ShapeType.rect, { x: 9.8, y: 2.05, w: 0.9, h: 0.1, fill: { color: '334155' } });

    // Smartphone screen image
    const imgBase64 = getImgBase64(sData.image) || getImgBase64('08_app_home_dashboard.png');
    if (imgBase64) {
      s.addImage({
        data: imgBase64,
        x: 8.1,
        y: 2.25,
        w: 4.3,
        h: 4.1,
        sizing: { type: 'contain', w: 4.3, h: 4.1 }
      });
    }

    // Caption strip
    s.addShape(pres.ShapeType.rect, { x: 8.0, y: 6.45, w: 4.5, h: 0.35, fill: { color: '18181B' } });
    s.addText(`Minh chứng: ${sData.caption}`, { x: 8.05, y: 6.45, w: 4.4, h: 0.35, fontSize: 8.5, fontFace: 'Calibri', color: THEME.GOLD_LIGHT, italic: true, align: 'center', valign: 'middle' });

    // Footer
    s.addText('VIONE CONNECT · ỨNG DỤNG DI ĐỘNG DOANH NHÂN & DANH THIẾP SỐ TITANIUM NFC', { x: 0.8, y: 7.0, w: 9.0, fontSize: 9, fontFace: 'Calibri', color: '64748B' });
    s.addText(`Trang ${idx + 1} / ${appSlidesData.length}`, { x: 10.5, y: 7.0, w: 2.0, fontSize: 9, fontFace: 'Calibri', color: '64748B', align: 'right' });
  });

  const outPptxApp = path.join(VIONE_DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx');
  await pres.writeFile({ fileName: outPptxApp });
  console.log(`✓ Đã xuất bản file PPTX App: ${outPptxApp} (${(fs.statSync(outPptxApp).size / 1024).toFixed(1)} KB)`);

  // Build Full HTML Presentation for App Slides
  buildHtmlPresentation(
    appSlidesData,
    'SLIDE THUYẾT TRÌNH ỨNG DỤNG DI ĐỘNG VIONE CONNECT MOBILE',
    path.join(VIONE_DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html'),
    true
  );

  // Build Full Markdown for App Slides
  buildMarkdownPresentation(
    appSlidesData,
    'BỘ SLIDE THUYẾT TRÌNH APP VIONE CONNECT',
    path.join(VIONE_DOC_DIR, 'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.md')
  );
}

// =============================================================================
// 3. BUILDER HTML SLIDESHOW CHO PHÉP XEM TRỰC TIẾP TRÊN TRÌNH DUYỆT (20 SLIDES)
// =============================================================================
function buildHtmlPresentation(slidesData, presentationTitle, outputFilePath, isMobileView) {
  let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentationTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    body { background-color: #09090b; color: #f8fafc; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
    
    /* Top Toolbar */
    .top-bar { height: 60px; background: rgba(24, 24, 27, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 50; }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-badge { width: 34px; height: 34px; background: linear-gradient(135deg, #eab308, #ca8a04); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 18px; }
    .pres-title { font-size: 15px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; }
    .slide-counter { font-size: 13px; font-weight: 600; color: #eab308; background: #27272a; padding: 4px 12px; border-radius: 20px; }
    
    .controls { display: flex; align-items: center; gap: 8px; }
    .slide-select { background: #27272a; border: 1px solid #3f3f46; color: #f8fafc; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; outline: none; cursor: pointer; max-width: 220px; text-overflow: ellipsis; }
    .slide-select:focus { border-color: #eab308; }
    .btn { background: #27272a; border: 1px solid #3f3f46; color: #f8fafc; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .btn:hover { background: #eab308; color: #000; border-color: #eab308; }

    /* Slide Stage */
    .stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; }
    .slide-card { width: 100%; max-width: 1280px; height: 100%; max-height: 720px; background: #121215; border: 1px solid #27272a; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); display: none; flex-direction: column; overflow: hidden; position: relative; }
    .slide-card.active { display: flex; animation: slideFadeIn 0.3s ease; }
    @keyframes slideFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Slide Header */
    .slide-header { padding: 24px 32px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
    .slide-category { display: inline-block; font-size: 11px; font-weight: 800; color: #eab308; text-transform: uppercase; letter-spacing: 1px; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); padding: 3px 10px; border-radius: 6px; margin-bottom: 8px; }
    .slide-title { font-size: 23px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 6px; }
    .slide-desc { font-size: 13.5px; color: #94a3b8; line-height: 1.5; max-width: 960px; }

    /* Slide Content Grid */
    .slide-body { flex: 1; display: grid; grid-template-columns: ${isMobileView ? '1.3fr 1fr' : '1.1fr 1.3fr'}; gap: 24px; padding: 20px 32px; align-items: center; overflow: hidden; }
    .keypoints-box { background: rgba(24, 24, 27, 0.7); border: 1px solid #27272a; border-radius: 14px; padding: 22px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
    .keypoints-title { font-size: 13px; font-weight: 800; color: #eab308; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
    .keypoint-item { font-size: 13.5px; color: #e2e8f0; line-height: 1.6; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px; }
    .keypoint-bullet { color: #eab308; font-weight: bold; flex-shrink: 0; font-size: 15px; }

    /* Media Box */
    .media-box { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    ${isMobileView ? `
      .phone-mockup { width: 280px; height: 420px; background: #000; border: 4px solid #eab308; border-radius: 36px; padding: 10px; box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(234,179,8,0.2); display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; }
      .phone-notch { width: 90px; height: 18px; background: #27272a; border-radius: 10px; margin-bottom: 8px; }
      .phone-screen { width: 100%; flex: 1; border-radius: 20px; overflow: hidden; background: #18181b; }
      .phone-screen img { width: 100%; height: 100%; object-fit: contain; }
    ` : `
      .desktop-frame { width: 100%; height: 100%; max-height: 420px; background: #000; border: 2px solid #eab308; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; }
      .desktop-bar { height: 26px; background: #27272a; display: flex; align-items: center; padding: 0 12px; gap: 6px; }
      .circle { width: 8px; height: 8px; border-radius: 50%; }
      .c-red { background: #ef4444; } .c-yellow { background: #f59e0b; } .c-green { background: #10b981; }
      .desktop-screen { flex: 1; overflow: hidden; background: #18181b; display: flex; align-items: center; justify-content: center; }
      .desktop-screen img { width: 100%; height: 100%; object-fit: contain; }
    `}
    .caption-tag { margin-top: 8px; font-size: 11px; color: #fef08a; font-style: italic; text-align: center; }

    /* Footer Progress */
    .progress-bar-wrap { height: 4px; background: #27272a; width: 100%; }
    .progress-bar { height: 100%; background: linear-gradient(90deg, #eab308, #f59e0b); width: 0%; transition: width 0.3s; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="logo-area">
      <div class="logo-badge">V</div>
      <div class="pres-title">${presentationTitle}</div>
    </div>
    <div class="slide-counter" id="counter">1 / ${slidesData.length}</div>
    <div class="controls">
      <select id="slideSelect" class="slide-select" onchange="goToSlide(this.value)">
        ${slidesData.map((s, idx) => `<option value="${idx}">Slide ${idx + 1}: ${s.category} - ${s.title.slice(0, 30)}...</option>`).join('')}
      </select>
      <button class="btn" onclick="prevSlide()">◀ Trước</button>
      <button class="btn" onclick="nextSlide()">Tiếp ▶</button>
      <button class="btn" onclick="toggleFullScreen()">⛶ Toàn màn hình</button>
    </div>
  </div>

  <div class="stage">
`;

  slidesData.forEach((s, idx) => {
    const rawBase64 = getRawBase64(s.image) || getRawBase64('01_crm_login_blue_white.png');
    html += `
    <div class="slide-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
      <div class="slide-header">
        <span class="slide-category">SLIDE ${idx + 1} • ${s.category}</span>
        <h2 class="slide-title">${s.title}</h2>
        <p class="slide-desc">${s.desc}</p>
      </div>
      <div class="slide-body">
        <div class="keypoints-box">
          <div class="keypoints-title">Tính Năng Đột Phá & Trải Nghiệm Thực Tế</div>
          ${s.keyPoints.map(kp => `
            <div class="keypoint-item">
              <span class="keypoint-bullet">✦</span>
              <span>${kp}</span>
            </div>
          `).join('')}
        </div>
        <div class="media-box">
          ${isMobileView ? `
            <div class="phone-mockup">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img src="${rawBase64}" alt="${s.caption}">
              </div>
            </div>
          ` : `
            <div class="desktop-frame">
              <div class="desktop-bar">
                <div class="circle c-red"></div>
                <div class="circle c-yellow"></div>
                <div class="circle c-green"></div>
              </div>
              <div class="desktop-screen">
                <img src="${rawBase64}" alt="${s.caption}">
              </div>
            </div>
          `}
          <div class="caption-tag">Minh chứng thực tế: ${s.caption}</div>
        </div>
      </div>
    </div>
    `;
  });

  html += `
  </div>
  <div class="progress-bar-wrap">
    <div class="progress-bar" id="progressBar"></div>
  </div>

  <script>
    let current = 0;
    const total = document.querySelectorAll('.slide-card').length;

    function update() {
      document.querySelectorAll('.slide-card').forEach((el, i) => {
        el.classList.toggle('active', i === current);
      });
      document.getElementById('counter').innerText = (current + 1) + ' / ' + total;
      document.getElementById('progressBar').style.width = (((current + 1) / total) * 100) + '%';
      const sel = document.getElementById('slideSelect');
      if (sel) sel.value = current;
    }

    function nextSlide() {
      if (current < total - 1) { current++; update(); }
    }

    function prevSlide() {
      if (current > 0) { current--; update(); }
    }

    function goToSlide(idx) {
      const i = parseInt(idx, 10);
      if (!isNaN(i) && i >= 0 && i < total) {
        current = i;
        update();
      }
    }

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
      if (e.key === 'Home') { current = 0; update(); }
      if (e.key === 'End') { current = total - 1; update(); }
    });

    let touchStartX = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) nextSlide();
        if (touchEndX - touchStartX > 50) prevSlide();
      }
    }, { passive: true });

    update();
  </script>
</body>
</html>
`;

  fs.writeFileSync(outputFilePath, html, 'utf8');
  console.log(`✓ Đã xuất bản file HTML Slideshow: ${outputFilePath} (${(fs.statSync(outputFilePath).size / 1024).toFixed(1)} KB)`);
}

// =============================================================================
// 4. BUILDER FULL MARKDOWN SLIDES (20 SLIDES CHI TIẾT)
// =============================================================================
function buildMarkdownPresentation(slidesData, presentationTitle, outputFilePath) {
  let md = `# ${presentationTitle}

**Định dạng:** 16:9 Widescreen Enterprise Presentation (Bộ Chuẩn 20 Slides)  
**Bộ Nhận Diện:** Hoàng Gia Vàng Đồng ViOne (Onyx #09090B, Gold #EAB308, Amber #CA8A04)  
**Đơn Vị Chủ Quản:** Ban Giải Pháp Chuyển Đổi Số ViOne Ecosystem (Tháng 10 / 2026)  
**Phiên Bản:** v5.0 Master Release  

---

## MỤC LỤC DANH SÁCH 20 SLIDES THUYẾT TRÌNH

`;

  slidesData.forEach((s, idx) => {
    md += `${idx + 1}. [SLIDE ${idx + 1} (${s.category}): ${s.title}](#slide-${idx + 1})\n`;
  });

  md += `\n---\n\n`;

  slidesData.forEach((s, idx) => {
    md += `### <a id="slide-${idx + 1}"></a>SLIDE ${idx + 1}: ${s.title}\n\n`;
    md += `- **Phân loại:** \`${s.category}\`\n`;
    md += `- **Mục tiêu & Tóm tắt:** ${s.desc}\n\n`;
    md += `**Các Điểm Nhấn Nghiệp Vụ Cốt Lõi:**\n`;
    s.keyPoints.forEach(kp => {
      md += `- ${kp}\n`;
    });
    md += `\n**Minh Chứng Giao Diện:**  \n`;
    md += `![Minh chứng: ${s.caption}](images/evidence/${s.image})\n`;
    md += `*Hình ảnh thực tế: ${s.caption}*\n\n`;
    md += `---\n\n`;
  });

  fs.writeFileSync(outputFilePath, md, 'utf8');
  console.log(`✓ Đã xuất bản file Markdown Slideshow: ${outputFilePath} (${(fs.statSync(outputFilePath).size / 1024).toFixed(1)} KB)`);
}

// =============================================================================
// 5. MAIN ORCHESTRATOR
// =============================================================================
async function main() {
  await buildCrmSlides();
  await buildAppSlides();

  // Sync to all project document and public/docs directories
  const filesToSync = [
    'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.pptx',
    'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.html',
    'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_VIONE.md',
    'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.pptx',
    'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.html',
    'SLIDE_THUYET_TRINH_APP_VIONE_CONNECT.md'
  ];

  for (const f of filesToSync) {
    const sPath = path.join(VIONE_DOC_DIR, f);
    if (fs.existsSync(sPath)) {
      for (const destDir of FE_DOCS_DIRS) {
        fs.copyFileSync(sPath, path.join(destDir, f));
      }
    }
  }
  console.log('🎉 Hoàn tất 100% xuất bản & đồng bộ Slide Thuyết Trình ViOne Master (PPTX, HTML, MD)!');
}

main().catch(err => {
  console.error('[LỖI TẠO SLIDES]', err);
  process.exit(1);
});
