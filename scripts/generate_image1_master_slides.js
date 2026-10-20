/**
 * GENERATE_IMAGE1_MASTER_SLIDES.JS
 * Tạo bộ slide thuyết trình Báo cáo Tổng thể Hệ sinh thái CEO 1983 chuẩn phong cách Ảnh 1 (Image 1):
 * - Màu chủ đạo: Deep Cobalt Navy (#001F54, #003B95) với dải sóng uốn lượn viền sáng cyan (#00D2FF) & hạt phát sáng
 * - Nền ảnh đa dạng cho từng slide (Skyline Hà Nội - Hồ Tây, phòng họp kính hiện đại, trung tâm dữ liệu, thành phố thông minh)
 * - Khung thẻ trắng nổi bật bo tròn 28px, bóng mờ tinh tế, logo kép ViConnect x CEO 1983
 * - Nội dung: Bức tranh tổng thể 2 sản phẩm (Web CRM & Mobile App) giải quyết 3 bài toán ban đầu từ CEO 1983,
 *   kèm ảnh chụp tính năng thực tế và 5 tính năng đột phá nằm ngoài yêu cầu.
 * - Xuất cả:
 *   1. Bản HTML 16:9 trình chiếu trực quan mượt mà
 *   2. Bản PowerPoint (.pptx) chuẩn 16:9 bằng pptxgenjs
 *   3. Tài liệu Markdown chi tiết
 */

const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const DOC_DIR = path.resolve(__dirname, '../document');
const FE_DOCS_DIR = path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs');
const BG_DIR = path.resolve(__dirname, '../document/images/backgrounds');
const EVIDENCE_DIR = path.resolve(__dirname, '../document/images/evidence');

[DOC_DIR, FE_DOCS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper đọc base64 hình ảnh để nhúng trực tiếp không lo lỗi đường dẫn
function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1);
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${data}`;
  }
  return '';
}

// Danh sách dữ liệu 8 slide chuẩn mực
const SLIDES_DATA = [
  {
    id: 1,
    bgImage: 'backgrounds/01_skyline_lake.jpg',
    type: 'cover',
    tag: 'BÁO CÁO TỔNG THỂ HỆ SINH THÁI SỐ KÉP',
    title: 'HỆ THỐNG QUẢN LÝ CLB DOANH NHÂN CEO 1983',
    subtitle: 'HIỆN THỰC HÓA 3 BÀI TOÁN CHIẾN LƯỢC & CÁC ĐỘT PHÁ CÔNG NGHỆ VƯỢT TRỘI',
    description: 'Báo cáo toàn diện bức tranh 2 sản phẩm Web CRM & Mobile App do ViConnect / Vione nghiên cứu, xây dựng và phát triển theo đặt hàng từ Ban Lãnh Đạo CLB CEO 1983.',
    meetingInfo: {
      time: '09:00 – 12:00 | Thứ Tư, ngày 21/10/2026',
      location: 'Khu biệt thự HDI, 39 ngõ 29 P. Mạc Thái Tông, KĐT Nam Trung Yên, Cầu Giấy, Hà Nội',
      content: 'Báo cáo Demo & Góp ý bản thử nghiệm Ứng dụng Quản lý CLB CEO 1983',
      lunch: 'Bữa trưa thân mật tại Nhà hàng Phiến Hoan Việt Trì',
    },
    footerText: 'Rất hân hạnh được đồng hành cùng Quý Lãnh Đạo & Hội Viên CLB CEO 1983.',
  },
  {
    id: 2,
    bgImage: 'backgrounds/02_boardroom.jpg',
    type: 'two_products',
    tag: 'BỨC TRANH TỔNG THỂ 2 SẢN PHẨM',
    title: 'KIẾN TRÚC KÉP: WEB CRM QUẢN TRỊ & MOBILE APP HỘI VIÊN',
    subtitle: 'Hai bánh đà công nghệ tương hỗ khép kín: Quản trị trung ương minh bạch & Văn phòng số hội viên bỏ túi',
    crm: {
      title: '1. CỔNG QUẢN TRỊ TRUNG ƯƠNG WEB CRM',
      target: 'Dành cho: Ban Điều Hành, Ban Thư Ký, Chủ Tịch & 6 Ban Chuyên Môn',
      bullets: [
        'Trục xương sống quản lý dữ liệu 500+ doanh nghiệp hội viên 360°',
        'Sơ đồ khán phòng rạp phim Cinema Seating Studio & Soát vé Gatekeeper',
        'Bàn giao việc Kanban phân ban, nhắc hạn deadline và đính kèm file Excel/Word',
        'Kế toán tự động hóa VietQR Napas 247, gạch nợ tức thời 0.1s',
        'Ma trận phân quyền Sticky Matrix 10 vai trò bảo mật cấp doanh nghiệp',
      ],
    },
    app: {
      title: '2. VĂN PHÒNG BỎ TÚI MOBILE APP',
      target: 'Dành cho: 500+ Doanh nhân hội viên chính danh CLB CEO 1983 (HanoiBA)',
      bullets: [
        'Thẻ VIP kỹ thuật số mạ vàng & vCard QR lưu danh bạ 1 chạm vào điện thoại',
        'Sàn giao thương B2B nội bộ: Trưng bày sản phẩm và cam kết chiết khấu độc quyền',
        'Ví vé sự kiện E-Ticket, hiển thị sơ đồ số ghế VIP và mã quay thưởng #8388',
        'Mạng lưới doanh nhân chính danh, tìm kiếm đối tác & Đặt lịch hẹn 1-on-1',
        'Trợ lý giọng nói Voice AI tiếng Việt & Đàm thoại nội bộ VoIP Call mã hóa',
      ],
    },
    footerHighlight: '✦ Đồng bộ Real-time 100%: Mọi dữ liệu trên Mobile App tự động đồng bộ tức thời về Web CRM trung ương.',
  },
  {
    id: 3,
    bgImage: 'backgrounds/03_smartcity.jpg',
    type: 'three_requirements',
    tag: 'HIỆN THỰC HÓA YÊU CẦU BAN ĐẦU',
    title: 'ĐÁP ỨNG TRỌN VẸN 3 BÀI TOÁN CHIẾN LƯỢC TỪ CEO 1983',
    subtitle: 'ViConnect chuyển hóa chính xác mọi mong muốn của Ban Chủ Nhiệm thành tính năng số hóa thực chiến',
    cols: [
      {
        num: '01',
        badge: 'YÊU CẦU BÀI TOÁN 1',
        title: 'Quản Lý Tập Trung Hồ Sơ 500+ Hội Viên',
        problem: 'Trước đây: Lưu file Excel rời rạc, khó cập nhật pháp lý, thất lạc thông tin ban ngành.',
        solution: 'ViConnect giải quyết: Số hóa hồ sơ 360°, quy trình xét duyệt 3 cấp bảo mật, gắn thẻ ngành nghề B2B, quản lý lịch sử tham gia và công nợ thường niên.',
      },
      {
        num: '02',
        badge: 'YÊU CẦU BÀI TOÁN 2',
        title: 'Check-in Sự Kiện & Số Hóa Vé Gala',
        problem: 'Trước đây: Nhầm lẫn bàn ghế, xếp chỗ thủ công mất thời gian, soát vé ùn tắc tại cửa.',
        solution: 'ViConnect giải quyết: Sơ đồ rạp phim Cinema Seating Map xếp chỗ chuẩn xác 100%, soát vé QR 0.1s không chạm, vòng quay bốc thăm may mắn Lucky Draw trực tiếp.',
      },
      {
        num: '03',
        badge: 'YÊU CẦU BÀI TOÁN 3',
        title: 'Kết Nối Giao Thương & Cơ Hội B2B',
        problem: 'Trước đây: Giao lưu phong trào, thiếu công cụ theo dõi hợp tác kinh doanh và mua chéo dịch vụ.',
        solution: 'ViConnect giải quyết: Sàn B2B nội bộ niêm yết sản phẩm chiết khấu cao, vCard QR 1 chạm không cần app, hệ thống đặt lịch hẹn cà phê 1-on-1 đồng bộ Calendar.',
      },
    ],
  },
  {
    id: 4,
    bgImage: 'backgrounds/04_operations.jpg',
    type: 'features_gallery',
    tag: 'PHÂN HỆ CÔNG CỤ QUẢN TRỊ',
    title: 'PHÂN HỆ WEB CRM: CÁC CHỨC NĂNG CỐT LÕI ĐÃ HOÀN THIỆN',
    subtitle: 'Giao diện trực quan, tốc độ xử lý tức thì, chuẩn hóa toàn diện quy trình điều hành của Ban Lãnh Đạo',
    features: [
      {
        title: '1. Quản Trị Hội Viên 360° & Thẩm Định',
        desc: 'Hồ sơ pháp lý, MST, phân ban chuyên môn, lịch sử hoạt động và trạng thái xét duyệt 3 cấp.',
        imgFile: '04_crm_members_management.png',
      },
      {
        title: '2. Cinema Seating Studio & Soát Vé QR',
        desc: 'Sơ đồ khán phòng rạp phim trực quan, phân bổ bàn tròn VIP, soát vé Gatekeeper 0.1s không chạm.',
        imgFile: '06_crm_cinema_seating_map.png',
      },
      {
        title: '3. Bàn Giao Việc Kanban & Xem File Đính Kèm',
        desc: 'Phân công nhiệm vụ rõ ràng người giao việc, subtask checklist, xem trực tiếp file Excel/Word/PDF.',
        imgFile: '09_crm_tasks_kanban.png',
      },
      {
        title: '4. Kế Toán Tài Chính & Sổ Quỹ Thu Chi',
        desc: 'Quản lý thu chi minh bạch, xuất hóa đơn hội phí VietQR Napas 247, gạch nợ tức thời 100%.',
        imgFile: '10_crm_cashbook_funds.png',
      },
    ],
  },
  {
    id: 5,
    bgImage: 'backgrounds/05_mobile_network.jpg',
    type: 'features_gallery',
    tag: 'PHÂN HỆ ỨNG DỤNG HỘI VIÊN',
    title: 'PHÂN HỆ MOBILE APP: VĂN PHÒNG SỐ BỎ TÚI CỦA CEO',
    subtitle: 'Nâng tầm hình ảnh doanh nhân, gắn kết giao thương bền chặt ngay trên màn hình smartphone',
    features: [
      {
        title: '1. Thẻ Hội Viên VIP & vCard QR 1 Chạm',
        desc: 'Thẻ số mạ vàng nhận diện thương hiệu, quét QR lưu danh bạ điện thoại không cần cài app.',
        imgFile: '09_app_vip_card.png',
      },
      {
        title: '2. Sàn Thương Mại B2B & Ưu Đãi Độc Quyền',
        desc: 'Gian hàng trực tuyến cho từng doanh nghiệp, ưu tiên tiêu dùng chéo không qua trung gian.',
        imgFile: '16_app_products_ecommerce_grid.png',
      },
      {
        title: '3. Ví Vé E-Ticket & Vòng Quay May Mắn',
        desc: 'Lưu cuống vé sự kiện, hiển thị sơ đồ số ghế VIP và tự động kích hoạt mã bốc thăm #8388.',
        imgFile: '14_app_event_checkin_pass.png',
      },
      {
        title: '4. Mạng Lưới 500+ CEO & Đặt Hẹn 1-on-1',
        desc: 'Tìm kiếm đối tác chính danh theo ngành nghề, gửi lời mời cà phê kết nối tự động cập nhật lịch.',
        imgFile: '15_app_members_directory.png',
      },
    ],
  },
  {
    id: 6,
    bgImage: 'backgrounds/06_innovation.jpg',
    type: 'breakthroughs',
    tag: 'GIÁ TRỊ GIA TĂNG TỪ VICONNECT',
    title: '5 ĐỘT PHÁ CÔNG NGHỆ NẰM NGOÀI YÊU CẦU BAN ĐẦU',
    subtitle: 'Các bước tiến công nghệ vượt trội do ViConnect / Vione chủ động đầu tư nâng cấp cho CLB CEO 1983',
    items: [
      {
        num: '01',
        badge: 'TÀI CHÍNH',
        title: 'Kế Toán Tự Động VietQR Napas 247',
        desc: 'Tự động sinh mã QR động chứa sẵn số tiền và mã hóa đơn. Gạch nợ tức thời 0.1s qua webhook ngân hàng; hạch toán chuẩn thông tư 200/TT-BTC.',
      },
      {
        num: '02',
        badge: 'TRÍ TUỆ NHÂN TẠO',
        title: 'Trợ Lý Giọng Nói Voice AI Tiếng Việt',
        desc: 'Tương tác rảnh tay tự nhiên: "Mở sự kiện sắp tới", "Xem hội phí của tôi", "Tìm đối tác xây dựng" — điều hướng màn hình ngay trong chớp mắt.',
      },
      {
        num: '03',
        badge: 'VIỄN THÔNG BẢO MẬT',
        title: 'Đàm Thoại Nội Bộ Mã Hóa & Native VoIP',
        desc: 'Cuộc gọi thoại & video HD mã hóa riêng tư giữa các CEO. Đổ chuông ngay trên màn hình khóa điện thoại; gác máy 0ms không chuông ảo.',
      },
      {
        num: '04',
        badge: 'KIẾN TRÚC CAO CẤP',
        title: 'Cơ Chế Đồng Bộ Offline-First (Local Cache)',
        desc: 'Soát vé QR và check-in mượt mà ngay cả khi hội trường Gala mất sóng Internet; tự động đồng bộ hóa lên đám mây khi có kết nối trở lại.',
      },
      {
        num: '05',
        badge: 'BẢO MẬT DOANH NGHIỆP',
        title: 'Ma Trận Phân Quyền 6 Ban Chuyên Môn (RBAC)',
        desc: 'Phân tách quyền hạn độc lập cho 10 vai trò (Chủ tịch, Ban Thư Ký, Trưởng Ban, Kế toán, Hội viên); bảo vệ tuyệt đối bí mật kinh doanh.',
      },
    ],
  },
  {
    id: 7,
    bgImage: 'backgrounds/07_banquet_gala.jpg',
    type: 'roadmap',
    tag: 'KẾ HOẠCH TRIỂN KHAI & BÀN GIAO',
    title: 'LỘ TRÌNH ĐỒNG HÀNH BỀN VỮNG CÙNG HANOIBA',
    subtitle: 'ViConnect cam kết chất lượng sản phẩm chuẩn mực, bảo hành dài hạn và đồng hành lâu dài cùng câu lạc bộ',
    steps: [
      {
        phase: 'GIAI ĐOẠN 1',
        time: '21/10/2026',
        title: 'Họp Báo Cáo Demo & Tiếp Thu Góp Ý',
        desc: 'Báo cáo trực tiếp tại HDI Mạc Thái Tông; lắng nghe ý kiến phản hồi từ Ban Lãnh Đạo để hoàn thiện sản phẩm.',
      },
      {
        phase: 'GIAI ĐOẠN 2',
        time: '22/10 – 30/10/2026',
        title: 'Nghiệm Thu Kỹ Thuật & Đóng Gói Bộ Tài Liệu',
        desc: 'Bàn giao 100% hồ sơ tài liệu kỹ thuật, hướng dẫn sử dụng Web CRM và Mobile App; đồng bộ cơ sở dữ liệu chính thức.',
      },
      {
        phase: 'GIAI ĐOẠN 3',
        time: '01/11 – 10/11/2026',
        title: 'Tập Huấn & Chuyển Giao Quy Trình',
        desc: 'Tập huấn trực tiếp cho Ban Thư Ký và các Trưởng Ban; chuyển giao quy trình vận hành sự kiện và quản trị tài chính.',
      },
      {
        phase: 'GIAI ĐOẠN 4',
        time: 'Thường Niên',
        title: 'Phát Hành Store & Bảo Hành 24/7',
        desc: 'Phát hành chính thức lên App Store & Google Play Store; ViConnect trực kỹ thuật và vận hành hạ tầng 24/7 trong các sự kiện Gala.',
      },
    ],
  },
  {
    id: 8,
    bgImage: 'backgrounds/08_skyline_night.jpg',
    type: 'closing',
    tag: 'GẮN KẾT BẢN LĨNH — BỨT PHÁ TƯƠNG LAI',
    title: 'VICONNECT & CLB CEO 1983 (HANOIBA)',
    subtitle: 'ĐỒNG HÀNH KIẾN TẠO LIÊN MINH KINH TẾ BẢN LĨNH & THỊNH VƯỢNG',
    bullets: [
      'ViConnect cam kết duy trì vận hành máy chủ đám mây ổn định 99.9% uptime',
      'Đội ngũ kỹ sư túc trực hỗ trợ kỹ thuật tận tâm tại mọi sự kiện Gala của Hiệp hội',
      'Liên tục cập nhật các công nghệ trí tuệ nhân tạo (AI) mới nhất phục vụ hội viên',
    ],
    contact: {
      hotline: '0983 1983 83 / 0988 66 55 44',
      crmUrl: 'https://crm.ceo1983.viconnect.vn',
      appUrl: 'https://ceo1983.viconnect.vn',
    },
    closingWish: 'Kính chúc CLB CEO 1983 ngày càng lớn mạnh, đoàn kết và bứt phá thành công!',
  },
];

// -------------------------------------------------------------------------
// [A] GENERATE HTML PRESENTATION 16:9 DỰA TRÊN ẢNH 1
// -------------------------------------------------------------------------
function generateHtmlPresentation(slides) {
  const slidesJson = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Tổng Thể Hệ Sinh Thái Số CEO 1983 | ViConnect</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Great+Vibes&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #001F54;
      margin: 0;
      padding: 0;
      overflow: hidden;
      user-select: none;
    }
    .font-script {
      font-family: 'Great Vibes', cursive, serif;
    }
    /* Sóng xanh Cobalt uốn lượn có ánh sáng Cyan chuẩn Ảnh 1 */
    .cyan-glow-wave {
      filter: drop-shadow(0 0 20px rgba(0, 210, 255, 0.75));
    }
    .deep-navy-gradient {
      background: linear-gradient(135deg, #001538 0%, #001F54 50%, #003B95 100%);
    }
    .white-card-elevated {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      box-shadow: 0 30px 60px -15px rgba(0, 31, 84, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 28px;
    }
    .amber-callout {
      background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
      border: 1px solid #FED7AA;
      border-radius: 18px;
    }
  </style>
</head>
<body class="w-screen h-screen flex flex-col justify-between text-slate-800">

  <!-- TOP APP BAR -->
  <header class="w-full h-14 bg-[#001538]/90 border-b border-cyan-500/20 backdrop-blur-md px-6 flex items-center justify-between z-50 text-white shrink-0">
    <div class="flex items-center gap-3">
      <!-- Logo đôi ViConnect x CEO 1983 -->
      <div class="flex items-center gap-2">
        <span class="font-black text-cyan-400 text-lg tracking-wider">▲▼ VICONNECT</span>
        <span class="text-cyan-500/40">|</span>
        <span class="font-extrabold text-amber-400 text-sm tracking-wide">3 CEO 1983</span>
      </div>
      <span class="hidden md:inline text-xs text-blue-200/60 pl-3 border-l border-white/10 font-medium">
        Báo cáo tổng thể hệ sinh thái số (Web CRM &amp; Mobile App)
      </span>
    </div>

    <div class="flex items-center gap-3 text-xs">
      <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold font-mono">
        Thứ Tư, 21/10/2026
      </span>
      <button onclick="toggleFullscreen()" class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition text-white cursor-pointer font-bold">
        ⛶ Toàn màn hình
      </button>
    </div>
  </header>

  <!-- MAIN SLIDE CONTAINER 16:9 -->
  <main class="flex-1 w-full flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden relative">
    <div id="slideViewport" class="w-full max-w-[1550px] aspect-[16/9] max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
      <!-- Dynamic slide content injected here -->
      <div id="slideCard" class="w-full h-full relative overflow-hidden flex flex-col"></div>
    </div>
  </main>

  <!-- BOTTOM CONTROL BAR -->
  <footer class="w-full h-14 bg-[#001538]/90 border-t border-cyan-500/20 px-6 flex items-center justify-between text-white text-xs z-50 shrink-0">
    <div class="flex items-center gap-2">
      <span class="text-blue-200/80">Phím tắt:</span>
      <kbd class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">[←] Trước</kbd>
      <kbd class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">[→] Tiếp theo</kbd>
      <kbd class="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">[Space] Chuyển trang</kbd>
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center gap-3">
      <button onclick="prevSlide()" class="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition font-bold cursor-pointer">
        ◀ Trước
      </button>
      <span id="slideIndicator" class="font-mono font-black text-cyan-300 text-sm tracking-widest px-2">
        1 / 8
      </span>
      <button onclick="nextSlide()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition cursor-pointer shadow-md">
        Tiếp theo ▶
      </button>
    </div>

    <div class="hidden sm:flex items-center gap-2 text-blue-200/70">
      <span>Tập đoàn Công nghệ ViConnect</span>
      <span>·</span>
      <span class="text-amber-400 font-bold">HanoiBA</span>
    </div>
  </footer>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;

    function renderSlide(idx) {
      const s = slides[idx];
      const container = document.getElementById('slideCard');
      document.getElementById('slideIndicator').innerText = (idx + 1) + ' / ' + slides.length;

      let html = '';

      if (s.type === 'cover') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 deep-navy-gradient text-white">
            <!-- Nền ảnh phong cảnh Hà Nội & Hồ Tây mờ ảo -->
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline" />
            
            <!-- Dải sóng xanh cobalt uốn lượn có viền cyan phát sáng chuẩn Ảnh 1 -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 650 C 350 500, 700 780, 1440 550 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.85"/>
              <path d="M0 650 C 350 500, 700 780, 1440 550" stroke="#00D2FF" stroke-width="6" stroke-linecap="round"/>
              <path d="M0 720 C 450 620, 850 820, 1440 680 L 1440 900 L 0 900 Z" fill="#003B95" opacity="0.6"/>
              <path d="M0 720 C 450 620, 850 820, 1440 680" stroke="#00A3FF" stroke-width="4" stroke-linecap="round"/>
            </svg>

            <!-- Top Header Logo đôi -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div class="flex items-center gap-3">
                <div class="h-10 px-3 rounded-xl bg-white text-[#001F54] font-black flex items-center gap-1.5 shadow-md">
                  <span class="text-blue-600 text-lg">▲▼</span>
                  <span class="tracking-wide">VICONNECT</span>
                </div>
                <div class="h-6 w-px bg-white/30"></div>
                <div class="h-10 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black flex items-center gap-1.5 shadow-md">
                  <span class="text-white text-lg">3</span>
                  <span class="tracking-wide">CEO 1983</span>
                </div>
              </div>
              <span class="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
                \${s.tag}
              </span>
            </div>

            <!-- Khung thẻ trắng nổi bật chính giữa theo Ảnh 1 -->
            <div class="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
              <div class="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-white space-y-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                  <span>✦ BÁO CÁO NGHIỆM THU DEMO CHUYÊN NGHIỆP ✦</span>
                </div>

                <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-[#001F54] leading-tight tracking-tight">
                  \${s.title}
                </h1>

                <p class="text-xs sm:text-sm font-bold text-cyan-700 uppercase tracking-widest">
                  \${s.subtitle}
                </p>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  \${s.description}
                </p>

                <!-- Box thông tin thời gian & địa điểm chuẩn Ảnh 1 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div class="w-9 h-9 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      📅
                    </div>
                    <div>
                      <div class="text-[11px] font-bold text-slate-500 uppercase">Thời Gian</div>
                      <div class="text-xs font-extrabold text-[#001F54]">\${s.meetingInfo.time}</div>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div class="w-9 h-9 rounded-xl bg-[#001F54] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      📍
                    </div>
                    <div>
                      <div class="text-[11px] font-bold text-slate-500 uppercase">Địa Điểm</div>
                      <div class="text-xs font-extrabold text-[#001F54] line-clamp-2">\${s.meetingInfo.location}</div>
                    </div>
                  </div>
                </div>

                <!-- Box Thân Mật (Lunch) màu vàng cam ấm áp như Ảnh 1 -->
                <div class="amber-callout p-3.5 flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                    🍴
                  </div>
                  <div class="text-xs font-bold text-amber-950">
                    \${s.meetingInfo.lunch}
                  </div>
                </div>
              </div>

              <!-- Cột phải: Poster thư mời mini + QR chỉ đường -->
              <div class="lg:col-span-4 flex flex-col items-center justify-center gap-3">
                <div class="relative rounded-3xl p-3 bg-white/90 backdrop-blur-md border border-cyan-400/40 shadow-2xl text-center space-y-2 max-w-[260px]">
                  <img src="images/image1_invitation_poster.png" class="w-full rounded-2xl shadow-md border border-slate-200" alt="Poster Gốc Ảnh 1" />
                  <div class="text-[11px] font-extrabold text-[#001F54] pt-1">
                    Bản Demo CLB CEO 1983
                  </div>
                  <span class="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                    📍 Quét mã để xem chi tiết
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer chữ ký thư pháp theo Ảnh 1 -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-200">
              <span class="font-script text-xl sm:text-2xl text-amber-300">\${s.footerText}</span>
              <span class="font-bold text-cyan-300 mt-1 sm:mt-0 font-mono">ViConnect Ecosystem · HanoiBA 2026</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'two_products') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Boardroom" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 720 C 400 580, 800 840, 1440 640 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 720 C 400 580, 800 840, 1440 640" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-cyan-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 font-mono">\${s.subtitle}</span>
            </div>

            <!-- 2 Cards Sản Phẩm nổi bật -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-auto pt-3">
              <!-- CRM Card -->
              <div class="white-card-elevated p-6 sm:p-7 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center gap-2.5 mb-2">
                    <span class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">CRM</span>
                    <h3 class="text-base sm:text-lg font-black text-[#001F54]">\${s.crm.title}</h3>
                  </div>
                  <div class="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 mb-3">
                    \${s.crm.target}
                  </div>
                  <ul class="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                    \${s.crm.bullets.map(b => \`
                      <li class="flex items-start gap-2">
                        <span class="text-blue-600 font-bold mt-0.5">✓</span>
                        <span>\${b}</span>
                      </li>
                    \`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Mobile App Card -->
              <div class="white-card-elevated p-6 sm:p-7 flex flex-col justify-between space-y-4 border-2 border-amber-400/60">
                <div>
                  <div class="flex items-center gap-2.5 mb-2">
                    <span class="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">APP</span>
                    <h3 class="text-base sm:text-lg font-black text-[#001F54]">\${s.app.title}</h3>
                  </div>
                  <div class="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 mb-3">
                    \${s.app.target}
                  </div>
                  <ul class="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                    \${s.app.bullets.map(b => \`
                      <li class="flex items-start gap-2">
                        <span class="text-amber-500 font-bold mt-0.5">★</span>
                        <span>\${b}</span>
                      </li>
                    \`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between items-center text-xs text-cyan-300 font-bold">
              <span>\${s.footerHighlight}</span>
              <span class="font-script text-xl text-amber-300">ViConnect Technology</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'three_requirements') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="City" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 680 C 450 550, 900 800, 1440 600 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 680 C 450 550, 900 800, 1440 600" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-amber-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 font-mono hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 3 Cột Yêu Cầu Ban Đầu -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 my-auto pt-3">
              \${s.cols.map(c => \`
                <div class="white-card-elevated p-5 sm:p-6 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">\${c.badge}</span>
                      <span class="font-mono text-xl font-black text-amber-500">\${c.num}</span>
                    </div>
                    <h3 class="text-base font-black text-[#001F54] mb-2">\${c.title}</h3>
                    
                    <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-medium mb-2">
                      <strong class="text-rose-700">Thách thức cũ:</strong> \${c.problem}
                    </div>

                    <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold">
                      <strong class="text-emerald-700">Giải pháp Vione:</strong> \${c.solution}
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-blue-300">
              <span>Hệ sinh thái số hóa toàn diện CLB Doanh Nhân CEO 1983</span>
              <span class="text-amber-300 font-bold">100% Hoàn Tất</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'features_gallery') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Operations" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 720 C 500 600, 950 820, 1440 660 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 720 C 500 600, 950 820, 1440 660" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-cyan-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 4 Feature Cards kèm hình ảnh thực tế -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto pt-3">
              \${s.features.map(f => \`
                <div class="white-card-elevated p-3.5 flex flex-col justify-between space-y-2 group hover:scale-[1.02] transition">
                  <div class="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img src="images/evidence/\${f.imgFile}" class="w-full h-full object-cover object-top" alt="\${f.title}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                  <div>
                    <h3 class="text-xs sm:text-sm font-black text-[#001F54] line-clamp-1">\${f.title}</h3>
                    <p class="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">\${f.desc}</p>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-cyan-300 font-bold">
              <span>Ảnh chụp giao diện thực tế hệ thống đã triển khai tại ViConnect</span>
              <span class="font-script text-xl text-amber-300">CLB CEO 1983</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'breakthroughs') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Innovation" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 700 C 400 560, 850 820, 1440 620 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 700 C 400 560, 850 820, 1440 620" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-amber-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 5 Đột phá công nghệ ngoài yêu cầu -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 my-auto pt-3">
              \${s.items.map(it => \`
                <div class="white-card-elevated p-4 flex flex-col justify-between space-y-2 border-t-4 border-t-cyan-500">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[9px] font-black uppercase">\${it.badge}</span>
                      <span class="font-mono text-sm font-black text-amber-500">\${it.num}</span>
                    </div>
                    <h3 class="text-xs font-black text-[#001F54] mb-1.5 leading-snug">\${it.title}</h3>
                    <p class="text-[11px] text-slate-600 leading-relaxed font-medium">\${it.desc}</p>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-cyan-300 font-bold">
              <span>Đột phá độc quyền do ViConnect / Vione chủ động tích hợp</span>
              <span class="font-script text-xl text-amber-300">Công nghệ vị nhân sinh</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'roadmap') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-slate-900 text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px]" alt="Gala" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 720 C 450 580, 900 820, 1440 650 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.9"/>
              <path d="M0 720 C 450 580, 900 820, 1440 650" stroke="#00D2FF" stroke-width="5"/>
            </svg>

            <!-- Header -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span class="text-xs font-black text-cyan-400 uppercase tracking-widest block">\${s.tag}</span>
                <h2 class="text-xl sm:text-3xl font-black text-white mt-0.5">\${s.title}</h2>
              </div>
              <span class="text-xs text-blue-200 hidden sm:inline">\${s.subtitle}</span>
            </div>

            <!-- 4 Bước Lộ Trình Triển Khai -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-auto pt-3">
              \${s.steps.map(st => \`
                <div class="white-card-elevated p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">\${st.phase}</span>
                      <span class="font-mono text-xs font-black text-amber-500">\${st.time}</span>
                    </div>
                    <h3 class="text-sm font-black text-[#001F54] mb-1.5 leading-snug">\${st.title}</h3>
                    <p class="text-xs text-slate-600 leading-relaxed font-medium">\${st.desc}</p>
                  </div>
                </div>
              \`).join('')}
            </div>

            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-cyan-300 font-bold">
              <span>Cam kết bảo hành máy chủ 24/7 và đồng hành trọn đời cùng HanoiBA</span>
              <span class="font-script text-xl text-amber-300">ViConnect Partner</span>
            </div>
          </div>
        \`;
      } else if (s.type === 'closing') {
        html = \`
          <div class="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 deep-navy-gradient text-white">
            <img src="\${s.bgImage}" class="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]" alt="Skyline Night" />
            <svg class="absolute inset-0 w-full h-full pointer-events-none cyan-glow-wave" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
              <path d="M0 650 C 400 500, 850 780, 1440 580 L 1440 900 L 0 900 Z" fill="#001F54" opacity="0.85"/>
              <path d="M0 650 C 400 500, 850 780, 1440 580" stroke="#00D2FF" stroke-width="6"/>
            </svg>

            <!-- Top Header Logo đôi -->
            <div class="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div class="flex items-center gap-3">
                <span class="font-black text-white text-base">▲▼ VICONNECT</span>
                <span class="text-white/40">|</span>
                <span class="font-extrabold text-amber-400 text-sm">3 CEO 1983</span>
              </div>
              <span class="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase">
                \${s.tag}
              </span>
            </div>

            <!-- Content Card -->
            <div class="relative z-10 my-auto max-w-3xl mx-auto w-full white-card-elevated p-8 sm:p-10 text-slate-800 shadow-2xl text-center space-y-4">
              <h2 class="text-2xl sm:text-4xl font-black text-[#001F54] leading-tight">
                \${s.title}
              </h2>
              <p class="text-xs sm:text-sm font-black text-cyan-700 uppercase tracking-widest">
                \${s.subtitle}
              </p>

              <div class="space-y-2 max-w-xl mx-auto text-left pt-2">
                \${s.bullets.map(b => \`
                  <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                    <span class="text-emerald-600 font-bold">✓</span>
                    <span>\${b}</span>
                  </div>
                \`).join('')}
              </div>

              <!-- Hotline & URLs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div class="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
                  <div class="text-[10px] font-bold text-blue-600 uppercase">Cổng Quản Trị Web CRM</div>
                  <div class="font-mono font-bold text-blue-900">\${s.contact.crmUrl}</div>
                </div>
                <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                  <div class="text-[10px] font-bold text-amber-700 uppercase">Tải Ứng Dụng Mobile App</div>
                  <div class="font-mono font-bold text-amber-900">\${s.contact.appUrl}</div>
                </div>
              </div>

              <div class="font-script text-2xl sm:text-3xl text-amber-600 pt-2">
                \${s.closingWish}
              </div>
            </div>

            <!-- Footer -->
            <div class="relative z-10 border-t border-white/15 pt-3 flex justify-between text-xs text-blue-200">
              <span>ViConnect Technology Ecosystem · HanoiBA 2026</span>
              <span class="text-amber-300 font-bold">Trân trọng cảm ơn!</span>
            </div>
          </div>
        \`;
      }

      container.innerHTML = html;
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderSlide(currentIndex);
      }
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderSlide(currentIndex);
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    });

    // Initial render
    renderSlide(0);
  </script>
</body>
</html>
  `;
}

// -------------------------------------------------------------------------
// [B] GENERATE POWERPOINT (.PPTX) 16:9 DÙNG PPTXGENJS
// -------------------------------------------------------------------------
async function generatePptxDeck(slides, outPath) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 16:9 chuẩn mực
  pptx.author = 'ViConnect Technology Ecosystem';
  pptx.company = 'CLB Doanh Nhân CEO 1983 - HanoiBA';
  pptx.title = 'Báo Cáo Tổng Thể Hệ Sinh Thái Số CEO 1983';

  for (const s of slides) {
    const slide = pptx.addSlide();

    // 1. Thêm ảnh background tương ứng
    const bgFullPath = path.resolve(__dirname, '../document/images', s.bgImage);
    if (fs.existsSync(bgFullPath)) {
      slide.addImage({
        path: bgFullPath,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }

    // 2. Lớp phủ xanh navy gradient mờ
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
      fill: { color: '001F54', transparency: 25 },
      line: { color: '00D2FF', width: 2 },
    });

    // 3. Header top bar
    slide.addText('▲▼ VICONNECT   |   3 CEO 1983', {
      x: 0.8,
      y: 0.4,
      w: 6.0,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: '00D2FF',
    });

    slide.addText(s.tag || 'BÁO CÁO HỆ SINH THÁI', {
      x: 8.0,
      y: 0.4,
      w: 4.5,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: 'F59E0B',
      align: 'right',
    });

    // 4. Slide content tuỳ theo loại
    if (s.type === 'cover') {
      // White Card
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.0,
        y: 1.1,
        w: 11.3,
        h: 5.6,
        fill: { color: 'FFFFFF', transparency: 5 },
        line: { color: 'E2E8F0', width: 1.5 },
        rectRadius: 0.25,
      });

      slide.addText(s.title, {
        x: 1.4,
        y: 1.4,
        w: 10.5,
        h: 1.2,
        fontSize: 26,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
      });

      slide.addText(s.subtitle, {
        x: 1.4,
        y: 2.6,
        w: 10.5,
        h: 0.4,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
      });

      slide.addText(s.description, {
        x: 1.4,
        y: 3.1,
        w: 10.5,
        h: 0.8,
        fontSize: 12,
        fontFace: 'Arial',
        color: '475569',
      });

      // Meeting info box
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.4,
        y: 4.1,
        w: 10.5,
        h: 1.8,
        fill: { color: 'FFF7ED' },
        line: { color: 'FED7AA', width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(`📅 ${s.meetingInfo.time}\n📍 ${s.meetingInfo.location}\n🍴 ${s.meetingInfo.lunch}`, {
        x: 1.6,
        y: 4.3,
        w: 10.1,
        h: 1.4,
        fontSize: 12,
        fontFace: 'Arial',
        bold: true,
        color: '78350F',
      });

    } else if (s.type === 'two_products') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      // Card CRM
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.7,
        w: 5.6,
        h: 5.1,
        fill: { color: 'FFFFFF' },
        line: { color: '0072CE', width: 2 },
        rectRadius: 0.2,
      });

      slide.addText(s.crm.title, {
        x: 1.1,
        y: 2.0,
        w: 5.0,
        h: 0.5,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
      });

      slide.addText(s.crm.target, {
        x: 1.1,
        y: 2.5,
        w: 5.0,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
      });

      slide.addText(s.crm.bullets.map(b => `✓  ${b}`).join('\n\n'), {
        x: 1.1,
        y: 3.0,
        w: 5.0,
        h: 3.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: '334155',
      });

      // Card Mobile App
      slide.addShape(pptx.ShapeType.rect, {
        x: 6.8,
        y: 1.7,
        w: 5.6,
        h: 5.1,
        fill: { color: 'FFFFFF' },
        line: { color: 'F59E0B', width: 2 },
        rectRadius: 0.2,
      });

      slide.addText(s.app.title, {
        x: 7.1,
        y: 2.0,
        w: 5.0,
        h: 0.5,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
      });

      slide.addText(s.app.target, {
        x: 7.1,
        y: 2.5,
        w: 5.0,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: 'B45309',
      });

      slide.addText(s.app.bullets.map(b => `★  ${b}`).join('\n\n'), {
        x: 7.1,
        y: 3.0,
        w: 5.0,
        h: 3.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: '334155',
      });

    } else if (s.type === 'three_requirements') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.cols.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.9;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 3.6,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'E2E8F0', width: 1.5 },
          rectRadius: 0.2,
        });

        slide.addText(`${c.num}. ${c.title}`, {
          x: xPos + 0.2,
          y: 2.0,
          w: 3.2,
          h: 0.8,
          fontSize: 13,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(`Thách thức cũ:\n${c.problem}`, {
          x: xPos + 0.2,
          y: 2.9,
          w: 3.2,
          h: 1.6,
          fontSize: 10,
          fontFace: 'Arial',
          color: '991B1B',
        });

        slide.addText(`Giải pháp ViConnect:\n${c.solution}`, {
          x: xPos + 0.2,
          y: 4.6,
          w: 3.2,
          h: 2.0,
          fontSize: 10.5,
          fontFace: 'Arial',
          bold: true,
          color: '065F46',
        });
      });

    } else if (s.type === 'features_gallery') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.features.forEach((f, idx) => {
        const xPos = 0.8 + idx * 2.95;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 2.75,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'E2E8F0', width: 1.5 },
          rectRadius: 0.2,
        });

        const imgPath = path.resolve(EVIDENCE_DIR, f.imgFile);
        if (fs.existsSync(imgPath)) {
          slide.addImage({
            path: imgPath,
            x: xPos + 0.15,
            y: 1.9,
            w: 2.45,
            h: 2.2,
          });
        }

        slide.addText(f.title, {
          x: xPos + 0.15,
          y: 4.3,
          w: 2.45,
          h: 0.7,
          fontSize: 11,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(f.desc, {
          x: xPos + 0.15,
          y: 5.1,
          w: 2.45,
          h: 1.5,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: '475569',
        });
      });

    } else if (s.type === 'breakthroughs') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.items.forEach((it, idx) => {
        const xPos = 0.8 + idx * 2.35;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 2.2,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: '00D2FF', width: 2 },
          rectRadius: 0.2,
        });

        slide.addText(`${it.num}. ${it.title}`, {
          x: xPos + 0.15,
          y: 2.0,
          w: 1.9,
          h: 1.0,
          fontSize: 11,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(it.desc, {
          x: xPos + 0.15,
          y: 3.1,
          w: 1.9,
          h: 3.4,
          fontSize: 9.5,
          fontFace: 'Arial',
          color: '334155',
        });
      });

    } else if (s.type === 'roadmap') {
      slide.addText(s.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.6,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });

      s.steps.forEach((st, idx) => {
        const xPos = 0.8 + idx * 2.95;
        slide.addShape(pptx.ShapeType.rect, {
          x: xPos,
          y: 1.7,
          w: 2.75,
          h: 5.1,
          fill: { color: 'FFFFFF' },
          line: { color: 'E2E8F0', width: 1.5 },
          rectRadius: 0.2,
        });

        slide.addText(`${st.phase}\n${st.time}`, {
          x: xPos + 0.15,
          y: 2.0,
          w: 2.45,
          h: 0.8,
          fontSize: 11,
          fontFace: 'Arial',
          bold: true,
          color: 'F59E0B',
        });

        slide.addText(st.title, {
          x: xPos + 0.15,
          y: 3.0,
          w: 2.45,
          h: 0.9,
          fontSize: 12,
          fontFace: 'Arial',
          bold: true,
          color: '001F54',
        });

        slide.addText(st.desc, {
          x: xPos + 0.15,
          y: 4.0,
          w: 2.45,
          h: 2.5,
          fontSize: 10,
          fontFace: 'Arial',
          color: '475569',
        });
      });

    } else if (s.type === 'closing') {
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.5,
        y: 1.3,
        w: 10.3,
        h: 5.4,
        fill: { color: 'FFFFFF' },
        line: { color: 'F59E0B', width: 2 },
        rectRadius: 0.25,
      });

      slide.addText(s.title, {
        x: 1.8,
        y: 1.6,
        w: 9.7,
        h: 0.8,
        fontSize: 24,
        fontFace: 'Arial',
        bold: true,
        color: '001F54',
        align: 'center',
      });

      slide.addText(s.subtitle, {
        x: 1.8,
        y: 2.5,
        w: 9.7,
        h: 0.5,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: '0072CE',
        align: 'center',
      });

      slide.addText(s.bullets.map(b => `✓  ${b}`).join('\n\n'), {
        x: 2.5,
        y: 3.3,
        w: 8.3,
        h: 1.8,
        fontSize: 12,
        fontFace: 'Arial',
        color: '334155',
      });

      slide.addText(s.closingWish, {
        x: 1.8,
        y: 5.4,
        w: 9.7,
        h: 0.8,
        fontSize: 16,
        fontFace: 'Arial',
        italic: true,
        bold: true,
        color: 'B45309',
        align: 'center',
      });
    }
  }

  await pptx.writeFile({ fileName: outPath });
  console.log(`[PPTX] Generated successfully: ${outPath}`);
}

// -------------------------------------------------------------------------
// [C] GENERATE MARKDOWN DOCUMENTATION
// -------------------------------------------------------------------------
function generateMarkdownDoc(slides) {
  let md = `# BÁO CÁO TỔNG THỂ HỆ SINH THÁI SỐ CLB DOANH NHÂN CEO 1983\\n\\n`;
  md += `> **Thời gian báo cáo**: 09:00 – 12:00 | Thứ Tư, ngày 21/10/2026\\n`;
  md += `> **Địa điểm**: Khu biệt thự HDI, 39 ngõ 29 P. Mạc Thái Tông, KĐT Nam Trung Yên, Cầu Giấy, Hà Nội\\n`;
  md += `> **Đơn vị phát triển**: Tập đoàn Công nghệ ViConnect (Vione Ecosystem)\\n\\n`;
  md += `---\\n\\n`;

  slides.forEach((s) => {
    md += `## Slide ${s.id}: ${s.title}\\n`;
    if (s.subtitle) md += `*${s.subtitle}*\\n\\n`;
    if (s.description) md += `${s.description}\\n\\n`;

    if (s.meetingInfo) {
      md += `- **Thời gian**: ${s.meetingInfo.time}\\n`;
      md += `- **Địa điểm**: ${s.meetingInfo.location}\\n`;
      md += `- **Nội dung**: ${s.meetingInfo.content}\\n`;
      md += `- **Bữa trưa**: ${s.meetingInfo.lunch}\\n\\n`;
    }

    if (s.crm && s.app) {
      md += `### ${s.crm.title}\\n`;
      md += `*${s.crm.target}*\\n`;
      s.crm.bullets.forEach((b) => (md += `- ${b}\\n`));
      md += `\\n### ${s.app.title}\\n`;
      md += `*${s.app.target}*\\n`;
      s.app.bullets.forEach((b) => (md += `- ${b}\\n`));
      md += `\\n`;
    }

    if (s.cols) {
      s.cols.forEach((c) => {
        md += `### ${c.num}. ${c.title}\\n`;
        md += `- **Thách thức ban đầu**: ${c.problem}\\n`;
        md += `- **Giải pháp ViConnect**: ${c.solution}\\n\\n`;
      });
    }

    if (s.features) {
      s.features.forEach((f) => {
        md += `### ${f.title}\\n`;
        md += `${f.desc}\\n`;
        md += `*Hình ảnh minh chứng*: \`document/images/evidence/${f.imgFile}\`\\n\\n`;
      });
    }

    if (s.items) {
      s.items.forEach((it) => {
        md += `### ${it.num}. ${it.title} [${it.badge}]\\n`;
        md += `${it.desc}\\n\\n`;
      });
    }

    if (s.steps) {
      s.steps.forEach((st) => {
        md += `### ${st.phase} (${st.time}): ${st.title}\\n`;
        md += `${st.desc}\\n\\n`;
      });
    }

    if (s.bullets) {
      s.bullets.forEach((b) => (md += `- ${b}\\n`));
      md += `\\n`;
    }

    md += `---\\n\\n`;
  });

  return md;
}

// -------------------------------------------------------------------------
// [MAIN EXECUTION]
// -------------------------------------------------------------------------
(async () => {
  console.log('--- ĐANG TẠO BỘ SLIDE THUYẾT TRÌNH MASTER CHUẨN PHONG CÁCH ẢNH 1 ---');

  // 1. Tạo HTML Presentation
  const htmlContent = generateHtmlPresentation(SLIDES_DATA);
  const outHtmlDoc = path.resolve(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  const outHtmlFe = path.resolve(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.html');
  fs.writeFileSync(outHtmlDoc, htmlContent, 'utf8');
  fs.writeFileSync(outHtmlFe, htmlContent, 'utf8');
  console.log('✓ Đã tạo HTML Presentation:', outHtmlDoc);
  console.log('✓ Đã đồng bộ HTML Presentation tới FE docs:', outHtmlFe);

  // 2. Tạo PPTX Presentation
  const outPptxDoc = path.resolve(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
  const outPptxFe = path.resolve(FE_DOCS_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.pptx');
  await generatePptxDeck(SLIDES_DATA, outPptxDoc);
  fs.copyFileSync(outPptxDoc, outPptxFe);
  console.log('✓ Đã tạo PPTX Presentation:', outPptxDoc);
  console.log('✓ Đã đồng bộ PPTX Presentation tới FE docs:', outPptxFe);

  // 3. Tạo Markdown Documentation
  const mdContent = generateMarkdownDoc(SLIDES_DATA);
  const outMd = path.resolve(DOC_DIR, 'SLIDE_TONG_THE_HE_SINH_THAI_CEO1983.md');
  fs.writeFileSync(outMd, mdContent, 'utf8');
  console.log('✓ Đã tạo Markdown Document:', outMd);

  console.log('=== HOÀN TẤT BỘ SLIDE THUYẾT TRÌNH MASTER CEO 1983 CHUẨN ẢNH 1 ===');
})();
