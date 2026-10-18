const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
} = docx;

const ROOT_DIR = path.resolve(__dirname, '..');
const DOC_DIR = path.join(ROOT_DIR, 'document');
const IMG_MOBILE_DIR = path.join(DOC_DIR, 'images', 'guide_mobile');
const IMG_CRM_DIR = path.join(DOC_DIR, 'images', 'guide_crm');
const IMG_EVIDENCE_DIR = path.join(DOC_DIR, 'images', 'evidence');
const LOGO_PATH = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'ceo1983-official-logo.png');

if (!fs.existsSync(DOC_DIR)) {
  fs.mkdirSync(DOC_DIR, { recursive: true });
}

function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${data.toString('base64')}`;
  }
  console.warn(`[WARN] Image not found: ${filePath}`);
  return '';
}

// ============================================================================
// PHẦN 1: GENERATE SLIDE PRESENTATION HTML & XUẤT RA FILE PDF CHUẨN WIDESCREEN 16:9 (22 SLIDES)
// NỀN XANH TRẮNG SANG TRỌNG - 1 SLIDE 1 KIỂU BỐ CỤC - CÓ LOGO CEO 1983 TRÊN TỪNG SLIDE
// HIỆU ỨNG CHUYỂN SLIDE 3D THÚ VỊ KHI THUYẾT TRÌNH (CUBE, SLIDE PUSH, PARALLAX, FLIP)
// ============================================================================
async function generateSlidePdf() {
  console.log('>>> [1/2] Đang tạo Bộ Slide Trình Chiếu Chuẩn Nền Xanh Trắng & Logo CEO 1983 (22 Trang)...');

  // Lấy Base64 của Logo chính thức CEO 1983
  const imgOfficialLogo = getBase64Image(LOGO_PATH);

  // Lấy Base64 của các ảnh chức năng thực tế
  const imgMobileRegister = getBase64Image(path.join(IMG_MOBILE_DIR, '01_dang_ky_gia_nhap.png'));
  const imgMobileLogin = getBase64Image(path.join(IMG_MOBILE_DIR, '02_dang_nhap_mobile.png'));
  const imgMobileHome = getBase64Image(path.join(IMG_MOBILE_DIR, '04_trang_chu_mobile.png'));
  const imgMobileNews = getBase64Image(path.join(IMG_MOBILE_DIR, '16_tin_tuc_hoat_dong.png'));
  const imgCardFront = getBase64Image(path.join(IMG_MOBILE_DIR, '05_the_hoi_vien_vip_mat_truoc.png'));
  const imgCardBackQr = getBase64Image(path.join(IMG_MOBILE_DIR, '06_the_hoi_vien_vip_mat_sau_qr.png'));
  const imgDirectory = getBase64Image(path.join(IMG_MOBILE_DIR, '07_danh_ba_hoi_vien.png'));
  const imgMemberProfile = getBase64Image(path.join(IMG_MOBILE_DIR, '08_chi_tiet_ho_so_hoi_vien.png'));
  const imgMarketplace = getBase64Image(path.join(IMG_MOBILE_DIR, '12_san_giao_thuong_b2b.png'));
  const imgOpportunities = getBase64Image(path.join(IMG_MOBILE_DIR, '14_co_hoi_kinh_doanh.png'));
  const imgEventsList = getBase64Image(path.join(IMG_MOBILE_DIR, '09_danh_sach_su_kien.png'));
  const imgQrPass = getBase64Image(path.join(IMG_MOBILE_DIR, '11_ve_dien_tu_qr_checkin.png'));
  const imgVoting = getBase64Image(path.join(IMG_MOBILE_DIR, '15_binh_chon_bieu_quyet.png'));

  // Ảnh công cụ thực tế
  const imgChatCall = getBase64Image(path.join(IMG_EVIDENCE_DIR, '09_app_chat_call_messenger_bubble.png'));
  const imgCrmMeetings = getBase64Image(path.join(IMG_CRM_DIR, '15_quan_ly_lich_hop.png'));
  const imgCrmTasks = getBase64Image(path.join(IMG_CRM_DIR, '17_giao_viec_nhiem_vu_kanban.png'));
  const imgNetworkChat = getBase64Image(path.join(IMG_CRM_DIR, '23_tin_nhan_trao_doi_network.png'));

  // Ảnh CRM Quản trị
  const imgCrmDashboard = getBase64Image(path.join(IMG_CRM_DIR, '02_dashboard_tong_quan.png'));
  const imgCrmMembers = getBase64Image(path.join(IMG_CRM_DIR, '08_quan_ly_hoi_vien.png'));
  const imgCrmRbac = getBase64Image(path.join(IMG_CRM_DIR, '07_ma_tran_phan_quyen_rbac.png'));
  const imgCrmSeating = getBase64Image(path.join(IMG_CRM_DIR, '12_so_do_khan_phong_ban_tiec.png'));
  const imgCrmEvents = getBase64Image(path.join(IMG_CRM_DIR, '10_quan_tri_su_kien.png'));
  const imgCrmFinance = getBase64Image(path.join(IMG_CRM_DIR, '19_quan_ly_so_quy_thu_chi.png'));
  const imgCrmFees = getBase64Image(path.join(IMG_CRM_DIR, '20_quan_ly_hoi_phi_hoa_don.png'));

  // Hàm tạo header chuẩn hóa có Logo CEO 1983 cho từng slide
  function createSlideHeader(badgeText, sectionTitle, slideNumber, totalSlides = 22) {
    return `
      <div class="slide-header">
        <div class="header-brand">
          <img src="${imgOfficialLogo}" class="brand-logo" alt="CEO 1983 Logo" />
          <div class="brand-meta">
            <span class="club-title">CLB DOANH NHÂN CEO 1983 (HANOIBA)</span>
            <span class="system-subtitle">HỆ SINH THÁI CÔNG NGHỆ QUẢN TRỊ & GIAO THƯƠNG SỐ</span>
          </div>
        </div>
        <div class="header-tags">
          <div class="category-badge">${badgeText}</div>
          <div class="slide-index-pill">${String(slideNumber).padStart(2, '0')} / ${totalSlides}</div>
        </div>
      </div>
    `;
  }

  // DANH SÁCH 22 SLIDES - NỀN XANH TRẮNG - 1 SLIDE 1 KIỂU BỐ CỤC ĐẶC BIỆT
  const slides = [
    // SLIDE 1: HERO COVER (BỐ CỤC TRANG BÌA CHỦ ĐẠO - NỀN XANH TRẮNG HOÀNG GIA)
    `
    <div class="slide slide-hero-cover" data-slide="1">
      <div class="cover-watermark"></div>
      <div class="hero-top-badge">
        <span class="pulse-indicator"></span>
        HANOIBA × VICONNECT PLATFORM · SPECIAL PRODUCT LAUNCH 2026
      </div>
      
      <div class="hero-center-logo">
        <img src="${imgOfficialLogo}" alt="CEO 1983 Official Logo" class="hero-logo-img" />
      </div>

      <h1 class="hero-main-title">
        HỆ SINH THÁI CÔNG NGHỆ KÉP<br>
        <span class="navy-gold-text">CLB DOANH NHÂN CEO 1983</span>
      </h1>
      
      <p class="hero-lead-description">
        BÁO CÁO GIẢI PHÁP SỐ HÓA TOÀN DIỆN: <strong>WEB CRM THÁP CHỈ HUY TRUNG TÂM</strong> & <strong>MOBILE APP HỘI VIÊN ĐẶC QUYỀN</strong>
      </p>

      <div class="hero-meta-cards">
        <div class="meta-pill-card">
          <div class="pill-icon">⏱</div>
          <div class="pill-info">
            <span class="pill-label">KHUNG GIỜ LÀM VIỆC</span>
            <span class="pill-value">09:00 – 12:00 (Tròn 3 Tiếng)</span>
          </div>
        </div>
        <div class="meta-pill-card highlight-pill">
          <div class="pill-icon">⚡</div>
          <div class="pill-info">
            <span class="pill-label">2 LUỒNG TRỌNG TÂM CỐT LÕI</span>
            <span class="pill-value">Thanh Toán Tài Chính & Xúc Tiến B2B</span>
          </div>
        </div>
        <div class="meta-pill-card">
          <div class="pill-icon">🛡</div>
          <div class="pill-info">
            <span class="pill-label">ĐƠN VỊ TRIỂN KHAI</span>
            <span class="pill-value">Liên Minh ViConnect & ViOne</span>
          </div>
        </div>
      </div>

      <div class="hero-slogan-bar">
        "BẢN LĨNH – TIÊN PHONG – KẾT NỐI – PHÁT TRIỂN"
      </div>
    </div>
    `,

    // SLIDE 2: MASTER TIMELINE 3 TIẾNG (BỐ CỤC TRỤC DẢI TIẾN TRÌNH NGANG)
    `
    <div class="slide slide-timeline" data-slide="2">
      ${createSlideHeader('PHẦN 1 · KHỞI ĐỘNG HỘI NGHỊ', 'CHƯƠNG TRÌNH LÀM VIỆC', 2)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">CHƯƠNG TRÌNH LÀM VIỆC & LỘ TRÌNH ĐÁNH GIÁ 3 TIẾNG</h2>
        <p class="slide-subtitle">Tối ưu hiệu quả từng phút · Tách bạch rõ ràng thời gian thuyết trình, phản biện và chốt nghiệm thu</p>
      </div>

      <div class="timeline-stepper">
        <div class="step-card">
          <div class="step-time">09:00 – 09:10</div>
          <div class="step-badge">10 phút</div>
          <h4 class="step-title">1. Khởi Động & Giới Thiệu</h4>
          <p class="step-desc">Chào mừng đại biểu, giới thiệu đoàn ViConnect - ViOne và BĐH CEO 1983.</p>
        </div>

        <div class="step-card">
          <div class="step-time">09:10 – 09:25</div>
          <div class="step-badge">15 phút</div>
          <h4 class="step-title">2. Bối Cảnh & 2 Luồng Gốc</h4>
          <p class="step-desc">Phân tích bài toán gốc, kiến trúc kép và định hình 2 luồng huyết mạch.</p>
        </div>

        <div class="step-card step-highlight-blue">
          <div class="step-time">09:25 – 09:45</div>
          <div class="step-badge badge-blue">20 phút</div>
          <h4 class="step-title">3A. Demo Mobile App</h4>
          <p class="step-desc">Thẻ VIP mạ vàng, Danh thiếp số vCard, Sàn B2B, Ví vé QR, Công cụ thực tế.</p>
        </div>

        <div class="step-card step-highlight-navy">
          <div class="step-time">09:45 – 10:00</div>
          <div class="step-badge badge-navy">15 phút</div>
          <h4 class="step-title">3B. Demo Web CRM</h4>
          <p class="step-desc">Dashboard 360°, RBAC 6 Ban, Sơ đồ Cinema Map, Sổ quỹ VietQR TT200.</p>
        </div>

        <div class="step-card step-alert">
          <div class="step-time">10:00 – 10:45</div>
          <div class="step-badge badge-amber">45 phút</div>
          <h4 class="step-title">4. Đối Thoại & Phản Biện</h4>
          <p class="step-desc">Đến 11h kém 15: Lắng nghe ý kiến BĐH, giải đáp sắc bén 10 tình huống.</p>
        </div>

        <div class="step-card step-success">
          <div class="step-time">10:45 – 11:45</div>
          <div class="step-badge badge-green">60 phút</div>
          <h4 class="step-title">5. Chốt Nghiệm Thu</h4>
          <p class="step-desc"><strong>Cái gì chốt - Cái gì sửa:</strong> Chốt 100% module hoàn thành. Ký biên bản.</p>
        </div>

        <div class="step-card">
          <div class="step-time">11:45 – 12:00</div>
          <div class="step-badge">15 phút</div>
          <h4 class="step-title">6. Kế Hoạch Bàn Giao</h4>
          <p class="step-desc">Cam kết văn bản trong 24h/48h, lịch tập huấn và bế mạc đúng 12:00 trưa.</p>
        </div>
      </div>

      <div class="timeline-callout">
        🎯 <strong>MỤC TIÊU SỐNG CÒN CỦA HỘI NGHỊ:</strong> Kết thúc 3 tiếng, hai bên cùng ký biên bản phân định rạch ròi <strong>"Cái gì chốt nghiệm thu 100%"</strong> và <strong>"Cái gì cần tinh chỉnh kèm cam kết ngày hoàn thành"</strong>.
      </div>
    </div>
    `,

    // SLIDE 3: 3 BÀI TOÁN GỐC & BƯỚC NGOẶT CHUYỂN ĐỔI SỐ (BỐ CỤC 3 CỘT SO SÁNH NỖI ĐAU VS CHUẨN MỚI)
    `
    <div class="slide slide-three-columns" data-slide="3">
      ${createSlideHeader('PHẦN 2 · BỐI CẢNH & NỖI ĐAU THỰC TẾ', '3 BÀI TOÁN GỐC', 3)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">3 BÀI TOÁN GỐC CỦA CEO 1983 & BƯỚC NGOẶT SỐ HÓA TOÀN DIỆN</h2>
        <p class="slide-subtitle">Chấm dứt hoàn toàn phương thức thủ công rời rạc · Chuẩn hóa 100% bằng công nghệ hiệp hội chuyên sâu</p>
      </div>

      <div class="three-cards-grid">
        <div class="challenge-card">
          <div class="card-icon-box">👥</div>
          <span class="card-badge">BÀI TOÁN 1 · HỘI VIÊN</span>
          <h3 class="card-heading">Quản Trị 500+ Hội Viên</h3>
          <div class="diff-block diff-old">
            <span class="diff-tag old-tag">✕ Cũ:</span> Dữ liệu phân tán Excel, Zalo; duyệt hồ sơ giấy tờ thủ công; không có định danh số xứng tầm CEO.
          </div>
          <div class="diff-block diff-new">
            <span class="diff-tag new-tag">✓ Mới:</span> <strong>Hồ sơ số 360°</strong>, định danh CEO-83xxx, Thẻ VIP mạ vàng & Danh thiếp số kép 1 chạm lưu vCard.
          </div>
        </div>

        <div class="challenge-card card-featured">
          <div class="card-icon-box gold-icon">🎪</div>
          <span class="card-badge gold-badge">BÀI TOÁN 2 · SỰ KIỆN & TÀI CHÍNH</span>
          <h3 class="card-heading">Sự Kiện Gắn Liền Thu - Chi</h3>
          <div class="diff-block diff-old">
            <span class="diff-tag old-tag">✕ Cũ:</span> Chỉ lo soát vé giấy, bỏ quên luồng tiền; quyết toán tạm ứng, thu tiền mặt, hoàn ứng mất hàng tuần.
          </div>
          <div class="diff-block diff-new">
            <span class="diff-tag new-tag">✓ Mới:</span> <strong>Sự kiện khép kín</strong>: Vé QR 0.1s + Cinema Map + Quyết toán tự động đẩy vào Sổ Quỹ Tiền Mặt TT200.
          </div>
        </div>

        <div class="challenge-card">
          <div class="card-icon-box">🤝</div>
          <span class="card-badge">BÀI TOÁN 3 · GIAO THƯƠNG</span>
          <h3 class="card-heading">Xúc Tiến Thương Mại B2B</h3>
          <div class="diff-block diff-old">
            <span class="diff-tag old-tag">✕ Cũ:</span> Bài đăng bán hàng trôi tin Zalo, spam, không có công cụ đo lường giá trị giao dịch của CLB.
          </div>
          <div class="diff-block diff-new">
            <span class="diff-tag new-tag">✓ Mới:</span> <strong>Sàn Marketplace B2B</strong> ưu đãi nội bộ, Bảng Deal Cung - Cầu thời gian thực, Lịch hẹn 1-on-1.
          </div>
        </div>
      </div>

      <div class="focus-notice-bar">
        ⚡ <strong>KẾT LUẬN CỦA ĐỘI NGŨ KIẾN TẠO HỆ THỐNG:</strong> Toàn bộ sức sống của CLB hội tụ vào <strong>2 LUỒNG QUAN TRỌNG NHẤT: LUỒNG THANH TOÁN TÀI CHÍNH</strong> và <strong>LUỒNG XÚC TIẾN THƯƠNG MẠI B2B</strong>!
      </div>
    </div>
    `,

    // SLIDE 4: KIẾN TRÚC HỆ SINH THÁI KÉP (BỐ CỤC 2 KHỐI NỀN TẢNG ĐỐI XỨNG CÔNG NGHỆ CAO)
    `
    <div class="slide slide-dual-platform" data-slide="4">
      ${createSlideHeader('PHẦN 2 · KIẾN TRÚC GIẢI PHÁP', 'HỆ SINH THÁI KÉP', 4)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">HỆ SINH THÁI CÔNG NGHỆ KÉP: WEB CRM & MOBILE APP</h2>
        <p class="slide-subtitle">Đồng bộ dữ liệu thời gian thực 2 chiều trên nền tảng đám mây an toàn, bảo mật cao cấp</p>
      </div>

      <div class="dual-columns-container">
        <div class="platform-card platform-app">
          <div class="platform-header">
            <div class="platform-badge app-badge">📱 DÀNH CHO 500+ HỘI VIÊN</div>
            <h3 class="platform-name">Mobile App CEO 1983 (Văn Phòng Bỏ Túi)</h3>
            <p class="platform-lead">Trải nghiệm di động chuẩn nhận diện Deep Cobalt Navy & Warm Amber Gold:</p>
          </div>
          <div class="platform-bullets">
            <div class="bullet-item">
              <span class="bullet-icon">🏆</span>
              <div><strong>Thẻ VIP & Danh thiếp số kép:</strong> QR 1 chạm lưu danh bạ vCard, Profile 2 trang.</div>
            </div>
            <div class="bullet-item">
              <span class="bullet-icon">👥</span>
              <div><strong>Danh bạ CEO 11 ngành:</strong> Tìm kiếm đối tác, gửi đề xuất lịch hẹn giao thương 1-on-1.</div>
            </div>
            <div class="bullet-item">
              <span class="bullet-icon">🛒</span>
              <div><strong>Sàn Marketplace B2B:</strong> Gian hàng ưu đãi nội bộ & Bảng Deal Cung - Cầu.</div>
            </div>
            <div class="bullet-item">
              <span class="bullet-icon">🎟</span>
              <div><strong>Ví vé QR & Tương tác số:</strong> Check-in sự kiện 0.1s, Lucky Draw, Biểu quyết đại hội.</div>
            </div>
          </div>
        </div>

        <div class="platform-card platform-crm">
          <div class="platform-header">
            <div class="platform-badge crm-badge">💻 DÀNH CHO BĐH & 6 BAN</div>
            <h3 class="platform-name">Web CRM Quản Trị (Tháp Chỉ Huy Trung Tâm)</h3>
            <p class="platform-lead">Công cụ quản trị, kiểm soát tài chính và điều phối chuyên sâu:</p>
          </div>
          <div class="platform-bullets">
            <div class="bullet-item">
              <span class="bullet-icon">📊</span>
              <div><strong>Executive Dashboard 360°:</strong> Đo lường KPI hội viên, sự kiện, dòng tiền thực.</div>
            </div>
            <div class="bullet-item">
              <span class="bullet-icon">🛡</span>
              <div><strong>Phân quyền RBAC 6 Ban:</strong> Thẩm định hồ sơ kết nạp 3 bước, bảo mật tuyệt đối.</div>
            </div>
            <div class="bullet-item">
              <span class="bullet-icon">💰</span>
              <div><strong>Sổ Quỹ Tiền Mặt TT200:</strong> Quản lý tạm ứng, quyết toán sự kiện, VietQR gạch nợ 1s.</div>
            </div>
            <div class="bullet-item">
              <span class="bullet-icon">🎪</span>
              <div><strong>Cinema Map & Soát vé:</strong> Quản lý sơ đồ bàn tiệc VIP, ứng dụng Gatekeeper quét vé.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sync-footer-bar">
        🔄 <strong>CƠ CHẾ ĐỒNG BỘ THỜI GIAN THỰC (REAL-TIME CLOUD SYNC):</strong> Mọi thao tác phê duyệt, đăng ký vé, đóng tiền, tạo deal trên App lập tức cập nhật lên CRM trong 0.5 giây!
      </div>
    </div>
    `,

    // SLIDE 5: TRỌNG TÂM 1 - LUỒNG THANH TOÁN & TÀI CHÍNH TOÀN DIỆN (SƠ ĐỒ QUY TRÌNH 5 BƯỚC KHÉP KÍN)
    `
    <div class="slide slide-flow-process" data-slide="5">
      ${createSlideHeader('LUỒNG TRỌNG TÂM 1 · HUYẾT MẠCH TỔ CHỨC', 'THANH TOÁN & TÀI CHÍNH TOÀN DIỆN', 5)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">LUỒNG THANH TOÁN & TÀI CHÍNH: CHUỖI DÒNG TIỀN KHÉP KÍN</h2>
        <p class="slide-subtitle">Sự kiện không chỉ là soát vé · Sự kiện là bài toán quản trị dòng tiền từ dự toán đến quyết toán sổ quỹ</p>
      </div>

      <div class="process-flow-grid">
        <div class="flow-card">
          <div class="flow-step-num">BƯỚC 1</div>
          <div class="flow-icon">📝</div>
          <h4 class="flow-card-title">Dự Toán & Thu Tiền</h4>
          <p class="flow-card-desc">Lập dự toán sự kiện. Hội viên quét VietQR Napas 24/7 thanh toán vé & tài trợ. Hệ thống tự gạch nợ 1s.</p>
        </div>

        <div class="flow-connector">➔</div>

        <div class="flow-card">
          <div class="flow-step-num">BƯỚC 2</div>
          <div class="flow-icon">💵</div>
          <h4 class="flow-card-title">Thu Tại Tiếp Đón</h4>
          <p class="flow-card-desc">Thu tiền mặt trực tiếp tại bàn lễ tân với khách vãng lai. Lập phiếu thu điện tử tức thì trên CRM.</p>
        </div>

        <div class="flow-connector">➔</div>

        <div class="flow-card flow-card-featured">
          <div class="flow-step-num">BƯỚC 3</div>
          <div class="flow-icon">📤</div>
          <h4 class="flow-card-title">Tạm Ứng Tổ Chức</h4>
          <p class="flow-card-desc">Ban Tài chính duyệt phiếu tạm ứng cho Ban Sự kiện / Hậu cần chi trả âm thanh, ánh sáng, địa điểm, quà tặng.</p>
        </div>

        <div class="flow-connector">➔</div>

        <div class="flow-card">
          <div class="flow-step-num">BƯỚC 4</div>
          <div class="flow-icon">📥</div>
          <h4 class="flow-card-title">Hoàn Ứng & Chi Trả</h4>
          <p class="flow-card-desc">Đối chiếu hóa đơn thực chi. Hoàn ứng số tiền chi tiêu thừa vào tài khoản quỹ CLB, khóa số liệu chi phí.</p>
        </div>

        <div class="flow-connector">➔</div>

        <div class="flow-card flow-card-success">
          <div class="flow-step-num">BƯỚC 5</div>
          <div class="flow-icon">📑</div>
          <h4 class="flow-card-title">Sổ Quỹ TT 200</h4>
          <p class="flow-card-desc">Tự động kết chuyển vào Sổ Quỹ Tiền Mặt (Mẫu S07-DN). Xuất file Excel chuẩn mực báo cáo Ban Thường Trực & HanoiBA.</p>
        </div>
      </div>

      <div class="finance-security-banner">
        🔒 <strong>NGUYÊN TẮC AN TOÀN TÀI CHÍNH TUYỆT ĐỐI:</strong> ViConnect <strong>KHÔNG GIỮ TIỀN CỦA CLB</strong>. 100% dòng tiền chuyển thẳng về tài khoản ngân hàng chính thức của CLB CEO 1983 tại MB Bank/Vietcombank.
      </div>
    </div>
    `,

    // SLIDE 6: BÁO CÁO SỔ QUỸ TIỀN MẶT TT 200 (BỐ CỤC CHỨNG TỪ TÀI CHÍNH & MẪU S07-DN CHUẨN HANOIBA)
    `
    <div class="slide slide-finance-report" data-slide="6">
      ${createSlideHeader('LUỒNG TRỌNG TÂM 1 · TÀI CHÍNH CHUẨN MỰC', 'SỔ QUỸ TIỀN MẶT TT 200', 6)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">SỔ QUỸ TIỀN MẶT THÔNG TƯ 200/2014/TT-BTC (MẪU S07-DN)</h2>
        <p class="slide-subtitle">Minh bạch từng đồng thu chi · Đọc số tiền bằng chữ · Multi-sheet phục vụ kiểm toán nội bộ và báo cáo HanoiBA</p>
      </div>

      <div class="report-split-layout">
        <div class="report-table-card">
          <div class="table-header-row">
            <span class="report-code">MẪU S07-DN · BỘ TÀI CHÍNH BAN HÀNH</span>
            <span class="report-status">KẾT TOÁN TỰ ĐỘNG THEO THỜI GIAN THỰC</span>
          </div>

          <table class="cashbook-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số Chứng Từ</th>
                <th>Diễn Giải Nội Dung Thu - Chi</th>
                <th class="text-right">Số Tiền Thu</th>
                <th class="text-right">Số Tiền Chi</th>
                <th class="text-right">Số Dư Quỹ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15/10/2026</td>
                <td><span class="code-badge pt">PT-2026-089</span></td>
                <td>Thu hội phí thường niên 2026 (CEO-83012) qua VietQR</td>
                <td class="text-right font-bold text-green">5.000.000 đ</td>
                <td class="text-right text-gray">-</td>
                <td class="text-right font-bold">125.000.000 đ</td>
              </tr>
              <tr>
                <td>16/10/2026</td>
                <td><span class="code-badge pt">PT-2026-090</span></td>
                <td>Thu tài trợ Kim Cương Gala Doanh Nhân (Cty Hòa Phát)</td>
                <td class="text-right font-bold text-green">50.000.000 đ</td>
                <td class="text-right text-gray">-</td>
                <td class="text-right font-bold">175.000.000 đ</td>
              </tr>
              <tr class="highlight-row">
                <td>16/10/2026</td>
                <td><span class="code-badge pc">PC-2026-042</span></td>
                <td>Tạm ứng Ban Sự Kiện: Thuê âm thanh, ánh sáng Gala</td>
                <td class="text-right text-gray">-</td>
                <td class="text-right font-bold text-red">30.000.000 đ</td>
                <td class="text-right font-bold">145.000.000 đ</td>
              </tr>
              <tr>
                <td>17/10/2026</td>
                <td><span class="code-badge pt">PT-2026-091</span></td>
                <td>Hoàn ứng chi phí sự kiện còn thừa từ Ban Sự Kiện</td>
                <td class="text-right font-bold text-green">4.500.000 đ</td>
                <td class="text-right text-gray">-</td>
                <td class="text-right font-bold">149.500.000 đ</td>
              </tr>
            </tbody>
          </table>

          <div class="table-footer-words">
            Số tiền tồn quỹ bằng chữ: <strong>Một trăm bốn mươi chín triệu năm trăm nghìn đồng chẵn.</strong>
          </div>
        </div>

        <div class="report-features-card">
          <h4 class="features-heading">Ưu Điểm Vượt Trội Cho Ban Tài Chính:</h4>
          <ul class="feature-bullets-list">
            <li><strong>Tích Hợp VietQR Napas 24/7:</strong> Gạch nợ tự động trong 1 giây, xuất biên lai điện tử.</li>
            <li><strong>Quyết Toán Đa Nguồn:</strong> Ghi nhận đồng thời chuyển khoản, thẻ và thu tiền mặt tại bàn tiếp đón.</li>
            <li><strong>Quản Lý Tạm Ứng - Hoàn Ứng:</strong> Kiểm soát chặt chẽ từng đồng giải ngân cho các ban chuyên môn.</li>
            <li><strong>Xuất Excel Chuẩn Thông Tư 200:</strong> 1 Click xuất file Excel định dạng chuẩn Mẫu S07-DN nộp HanoiBA.</li>
          </ul>
          <div class="audit-badge">
            ✅ <strong>TIẾT KIỆM 95% THỜI GIAN ĐỐI SOÁT:</strong> Thủ quỹ không còn phải ngồi cộng sổ tay hay dò từng dòng sao kê ngân hàng!
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 7: TRỌNG TÂM 2 - LUỒNG XÚC TIẾN THƯƠNG MẠI & GIAO THƯƠNG B2B (BỐ CỤC 4 CÁNH BUỒM KINH TẾ)
    `
    <div class="slide slide-trade-promotion" data-slide="7">
      ${createSlideHeader('LUỒNG TRỌNG TÂM 2 · TRÁI TIM HỘI ĐOÀN', 'XÚC TIẾN THƯƠNG MẠI B2B', 7)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">LUỒNG XÚC TIẾN THƯƠNG MẠI: TRÁI TIM GIAO THƯƠNG B2B</h2>
        <p class="slide-subtitle">Biến 500+ mối quan hệ đồng niên thành dòng doanh thu thực tế · Đo lường tổng giá trị thương vụ của CLB</p>
      </div>

      <div class="four-sails-grid">
        <div class="sail-card">
          <div class="sail-icon">🪪</div>
          <span class="sail-badge">BƯỚC 1 · KẾT NỐI</span>
          <h3 class="sail-title">Thẻ Danh Thiếp Số 1 Chạm</h3>
          <p class="sail-desc">Quét QR lưu vCard ngay về danh bạ điện thoại mà không cần cài app. Tích hợp Company Profile 2 trang.</p>
        </div>

        <div class="sail-card">
          <div class="sail-icon">🛒</div>
          <span class="sail-badge">BƯỚC 2 · TRƯNG BÀY</span>
          <h3 class="sail-title">Sàn Marketplace B2B</h3>
          <p class="sail-desc">Gian hàng số trưng bày sản phẩm - dịch vụ ưu đãi độc quyền dành riêng cho các thành viên CEO 1983.</p>
        </div>

        <div class="sail-card sail-featured">
          <div class="sail-icon">⚡</div>
          <span class="sail-badge gold-sail">BƯỚC 3 · KHỚP LỆNH</span>
          <h3 class="sail-title">Bảng Deal Cung - Cầu</h3>
          <p class="sail-desc">Niêm yết nhu cầu Mua - Bán với giá trị thương vụ cụ thể. Thúc đẩy dòng tiền lưu thông trực tiếp trong nội bộ.</p>
        </div>

        <div class="sail-card">
          <div class="sail-icon">📅</div>
          <span class="sail-badge">BƯỚC 4 · CHỐT HỢP ĐỒNG</span>
          <h3 class="sail-title">Lịch Hẹn B2B 1-on-1</h3>
          <p class="sail-desc">Gửi đề xuất lịch hẹn kết nối kinh doanh trực tiếp giữa 2 CEO, tự động đồng bộ vào lịch điện thoại cá nhân.</p>
        </div>
      </div>

      <div class="trade-kpi-banner">
        📈 <strong>ĐO LƯỜNG TỔNG GIÁ TRỊ GIAO DỊCH (DEAL VALUE):</strong> Hệ thống ghi nhận số tiền giao thương thành công, tạo báo cáo số liệu thực tế để CLB khẳng định vị thế dẫn đầu trong toàn Hội HanoiBA!
      </div>
    </div>
    `,

    // SLIDE 8: THẺ HỘI VIÊN VIP & DANH THIẾP SỐ KÉP (BỐ CỤC MOCKUP THẺ 3D & BẢO MẬT SĐT RIÊNG TƯ)
    `
    <div class="slide slide-vip-card" data-slide="8">
      ${createSlideHeader('MOBILE APP · ĐỊNH DANH ĐẲNG CẤP', 'THẺ VIP & DANH THIẾP SỐ KÉP', 8)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">THẺ HỘI VIÊN VIP MẠ VÀNG & DANH THIẾP SỐ KÉP 1 CHẠM</h2>
        <p class="slide-subtitle">Định danh số đẳng cấp doanh nhân · Lưu vCard danh bạ tức thì · Cơ chế bảo mật số điện thoại riêng tư</p>
      </div>

      <div class="card-demo-container">
        <div class="card-mockup-wrapper">
          <div class="card-frame">
            <img src="${imgCardFront}" alt="Thẻ VIP mặt trước" class="card-img" />
            <div class="frame-label">MẶT TRƯỚC: MẠ VÀNG CHUẨN CEO</div>
          </div>
          <div class="card-frame">
            <img src="${imgCardBackQr}" alt="Thẻ VIP mặt sau QR" class="card-img" />
            <div class="frame-label">MẶT SAU: MÃ QR ĐỘC BẢN CÁ NHÂN</div>
          </div>
        </div>

        <div class="card-tech-points">
          <div class="tech-box">
            <div class="tech-icon">🔀</div>
            <div class="tech-text">
              <h4>Cơ Chế Danh Thiếp Kép (Primary / Secondary)</h4>
              <p>Hội viên có thể thiết lập 2 danh thiếp: Danh thiếp công việc chính và Danh thiếp kinh doanh phụ. Tùy ý chọn danh thiếp mặc định khi chia sẻ.</p>
            </div>
          </div>

          <div class="tech-box">
            <div class="tech-icon">🛡</div>
            <div class="tech-text">
              <h4>Bảo Mật Số Điện Thoại Riêng Tư</h4>
              <p>Chủ động bật/tắt hiển thị SĐT. Khi đi gặp đối tác lạ, người quét chỉ thấy thông tin công ty và chức danh mà không bị lộ số điện thoại cá nhân.</p>
            </div>
          </div>

          <div class="tech-box">
            <div class="tech-icon">📲</div>
            <div class="tech-text">
              <h4>Lưu Danh Bạ vCard 1 Chạm Không Cần Cài App</h4>
              <p>Đối tác mở link quét QR trên bất kỳ trình duyệt nào, bấm nút 'Lưu danh bạ' là tự động lưu trọn vẹn số điện thoại, email, địa chỉ vào máy.</p>
            </div>
          </div>

          <div class="tech-box">
            <div class="tech-icon">📄</div>
            <div class="tech-text">
              <h4>Đính Kèm Company Profile 2 Trang</h4>
              <p>Toàn bộ hồ sơ năng lực doanh nghiệp, sản phẩm tiêu biểu và giải thưởng được hiển thị trang trọng ngay bên dưới thẻ số.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 9: LUỒNG SỰ KIỆN TOÀN DIỆN & CHUỖI GIÁ TRỊ KHÉP KÍN (BỐ CỤC HÀNH TRÌNH SỰ KIỆN 4 GIAI ĐOẠN)
    `
    <div class="slide slide-event-ecosystem" data-slide="9">
      ${createSlideHeader('SỰ KIỆN · TRẢI NGHIỆM ĐỈNH CAO', 'LUỒNG SỰ KIỆN KHÉP KÍN', 9)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">QUẢN TRỊ SỰ KIỆN TOÀN TRÌNH: TRẢI NGHIỆM ĐỈNH CAO</h2>
        <p class="slide-subtitle">Từ khâu truyền thông, bán vé, xếp chỗ rạp phim đến check-in 0.1 giây và biểu quyết minh bạch</p>
      </div>

      <div class="event-journey-grid">
        <div class="journey-card">
          <div class="journey-phase">GIAI ĐOẠN 1</div>
          <h4 class="journey-title">Đăng Ký & Mua Vé Số</h4>
          <ul class="journey-list">
            <li>Thông tin sự kiện hiển thị rõ nét trên Mobile App.</li>
            <li>Đăng ký vé tham dự và suất khách mời đi kèm.</li>
            <li>Thanh toán vé bằng mã VietQR động gạch nợ sau 1s.</li>
            <li>Ví vé điện tử lưu trữ mã QR định danh cá nhân.</li>
          </ul>
        </div>

        <div class="journey-card">
          <div class="journey-phase">GIAI ĐOẠN 2</div>
          <h4 class="journey-title">Sơ Đồ Cinema Map</h4>
          <ul class="journey-list">
            <li>Ban tổ chức kéo thả xếp chỗ trực quan trên CRM.</li>
            <li>Phân chia khu vực VIP, Bàn danh dự, Bàn hội viên.</li>
            <li>Hội viên nhìn thấy rõ số bàn, số ghế ngay trên vé.</li>
            <li>Lễ tân xuất bản in sơ đồ dự phòng dẫn khách.</li>
          </ul>
        </div>

        <div class="journey-card journey-featured">
          <div class="journey-phase gold-phase">GIAI ĐOẠN 3</div>
          <h4 class="journey-title">Soát Vé Gatekeeper 0.1s</h4>
          <ul class="journey-list">
            <li>Tốc độ nhận diện mã QR siêu tốc dưới 0.1 giây.</li>
            <li>Bộ nhớ đệm <strong>Offline Cache</strong> quét mượt khi mất sóng.</li>
            <li>Chống trùng lặp mã vé và báo động gian lận tức thì.</li>
            <li>Màn hình chào mừng tên đại biểu và vị trí bàn ghế.</li>
          </ul>
        </div>

        <div class="journey-card">
          <div class="journey-phase">GIAI ĐOẠN 4</div>
          <h4 class="journey-title">Tương Tác & Biểu Quyết</h4>
          <ul class="journey-list">
            <li>Vòng quay may mắn Lucky Draw mã số ngẫu nhiên.</li>
            <li>Biểu quyết đại hội số trực tuyến 1 người 1 phiếu.</li>
            <li>Hiển thị kết quả biểu quyết minh bạch lên màn hình LED.</li>
            <li>Tự động tổng kết chi phí và đẩy sang Sổ Quỹ TT200.</li>
          </ul>
        </div>
      </div>

      <div class="event-capacity-notice">
        ⚡ <strong>KHẢ NĂNG TẢI LỚN:</strong> Hệ thống đã được kiểm thử tải thực tế, đáp ứng hơn <strong>1.000 đại biểu check-in liên tục trong 15 phút</strong> mà không gây bất kỳ hiện tượng nghẽn mạng hay ùn tắc sảnh đón tiếp!
      </div>
    </div>
    `,

    // SLIDE 10: VÉ ĐIỆN TỬ QR & SOÁT VÉ GATEKEEPER OFFLINE CACHE (BỐ CỤC THỰC CHIẾN GALA MẤT MẠNG)
    `
    <div class="slide slide-gatekeeper-tech" data-slide="10">
      ${createSlideHeader('SỰ KIỆN · BẢO ĐẢM VẬN HÀNH', 'SOÁT VÉ OFFLINE CACHE', 10)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">VÉ ĐIỆN TỬ QR & SOÁT VÉ GATEKEEPER CÓ BỘ NHỚ ĐỆM OFFLINE</h2>
        <p class="slide-subtitle">Giải quyết triệt để nỗi lo mất sóng 4G / nghẽn mạng tại tầng hầm trung tâm hội nghị khi đón 500 khách</p>
      </div>

      <div class="gatekeeper-layout">
        <div class="gatekeeper-phone-side">
          <div class="phone-mockup">
            <img src="${imgQrPass}" alt="Vé điện tử QR" class="mockup-screen" />
            <div class="mockup-caption">VÍ VÉ QR E-TICKET TRÊN APP</div>
          </div>
        </div>

        <div class="gatekeeper-comparison-side">
          <div class="tech-badge-row">
            <span class="tech-pill">TỐC ĐỘ: 0.1 GIÂY</span>
            <span class="tech-pill">BỘ NHỚ ĐỆM: LOCAL OFFLINE CACHE</span>
            <span class="tech-pill">CHỐNG GIAN LẬN: 100%</span>
          </div>

          <div class="comparison-card">
            <div class="comp-col comp-without">
              <h4 class="comp-title text-red">✕ HỆ THỐNG THÔNG THƯỜNG</h4>
              <ul class="comp-list">
                <li>Phụ thuộc 100% vào mạng Wifi/4G trực tiếp.</li>
                <li>Mất sóng là đơ máy, không quét được vé.</li>
                <li>Ùn tắc sảnh tiếp đón, khách mời khó chịu.</li>
                <li>Dễ bị lỗi quét trùng vé do mạng chập chờn.</li>
              </ul>
            </div>

            <div class="comp-col comp-with">
              <h4 class="comp-title text-green">✓ GATEKEEPER VICONNECT</h4>
              <ul class="comp-list">
                <li>Tự động tải sẵn danh sách vé vào máy trước giờ G.</li>
                <li><strong>Mất mạng hoàn toàn vẫn quét vé bíp bíp bình thường</strong>.</li>
                <li>Hiện ngay số bàn số ghế VIP để lễ tân dẫn khách.</li>
                <li>Tự động đồng bộ lên đám mây ngay khi có sóng trở lại.</li>
              </ul>
            </div>
          </div>

          <div class="gatekeeper-kpi-box">
            <div class="kpi-item">
              <span class="kpi-num">0.1s</span>
              <span class="kpi-label">Thời gian nhận diện QR</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-num">100%</span>
              <span class="kpi-label">Độ chính xác ghế ngồi</span>
            </div>
            <div class="kpi-item">
              <span class="kpi-num">0</span>
              <span class="kpi-label">Rủi ro ùn tắc tiếp đón</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 11: GÓC NHÌN QUẢN LÝ DỰ ÁN: HỆ CÔNG CỤ HỖ TRỢ CÔNG VIỆC THỰC TẾ (BỐ CỤC TRIẾT LÝ HỆ THỐNG)
    `
    <div class="slide slide-ops-philosophy" data-slide="11">
      ${createSlideHeader('QUẢN LÝ DỰ ÁN · GÓC NHÌN CHUYÊN GIA', 'HỆ CÔNG CỤ THỰC TẾ', 11)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">GÓC NHÌN QUẢN TRỊ DỰ ÁN: HỆ CÔNG CỤ HỖ TRỢ CÔNG VIỆC THỰC TẾ</h2>
        <p class="slide-subtitle">Không phải tính năng rời rạc trên giấy · Đây là bộ công cụ thực chiến giải quyết bài toán vận hành hàng ngày của BĐH</p>
      </div>

      <div class="philosophy-manifesto">
        <div class="manifesto-left">
          <div class="pm-badge">TƯ DUY KIẾN TẠO HỆ THỐNG</div>
          <h3 class="pm-heading">Vì Sao Đội Ngũ Chủ Động Tích Hợp Hệ Công Cụ Này?</h3>
          <p class="pm-paragraph">
            Trong quá trình khảo sát và đồng hành cùng Ban Điều Hành CEO 1983, đội ngũ kỹ sư và quản lý dự án chúng em nhận thấy một thực tế rất rõ ràng:
          </p>
          <div class="pm-quote-box">
            "Nếu chỉ cung cấp các chức năng bề nổi như duyệt hồ sơ hay xem tin tức, thì hàng ngày Ban Thường Trực và 6 Ban Chuyên Môn vẫn phải mở Zalo để họp, mở Excel để giao việc, gọi điện thoại ngoài gây lộ số cá nhân, dữ liệu bị phân mảnh và thất thoát thông tin."
          </div>
          <p class="pm-paragraph">
            Chính vì vậy, từ <strong>góc nhìn của người làm hệ thống và quản trị dự án chuyên nghiệp</strong>, chúng em đã chủ động phát triển và tích hợp sẵn <strong>BỘ CÔNG CỤ HỖ TRỢ CÔNG VIỆC THỰC TẾ</strong> giúp BĐH vận hành trọn vẹn quy trình ngay trên một nền tảng duy nhất!
          </p>
        </div>

        <div class="manifesto-right">
          <div class="ops-suite-card">
            <span class="suite-tag">BỘ CÔNG CỤ THỰC CHIẾN TÍCH HỢP SẴN</span>
            <div class="suite-item">
              <div class="suite-icon">📅</div>
              <div>
                <strong>Lịch Họp Số Sapphire Hub & QR Động 30s:</strong>
                <p>Chống trùng phòng họp, điểm danh BCH chính xác chống gian lận.</p>
              </div>
            </div>
            <div class="suite-item">
              <div class="suite-icon">📋</div>
              <div>
                <strong>Bảng Giao Việc Kanban 6 Ban:</strong>
                <p>Số hóa nghị quyết họp thành thẻ việc, kiểm soát tiến độ từng ban.</p>
              </div>
            </div>
            <div class="suite-item">
              <div class="suite-icon">📞</div>
              <div>
                <strong>Đàm Thoại VoIP & Cuộc Gọi Nền Native:</strong>
                <p>Bảo mật số điện thoại, đổ chuông màn hình khóa ngay cả khi tắt app.</p>
              </div>
            </div>
            <div class="suite-item">
              <div class="suite-icon">🌟</div>
              <div>
                <strong>Mạng Xã Hội Moments Doanh Nhân B2B:</strong>
                <p>Không gian tinh hoa chia sẻ hợp tác, giải thưởng và tư liệu hội đoàn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 12: CÔNG CỤ THỰC TẾ 1 - LỊCH HỌP SỐ SAPPHIRE HUB & QR ĐỘNG 30S (BỐ CỤC CHỐNG GIAN LẬN)
    `
    <div class="slide slide-meetings-hub" data-slide="12">
      ${createSlideHeader('CÔNG CỤ THỰC TẾ 1 · ĐIỀU HÀNH BĐH', 'LỊCH HỌP SỐ SAPPHIRE HUB', 12)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">LỊCH HỌP SỐ THÔNG MINH SAPPHIRE HUB & ĐIỂM DANH QR ĐỘNG 30S</h2>
        <p class="slide-subtitle">Tổ chức họp BCH online/offline · Tự động phát hiện trùng phòng · Điểm danh đại biểu chống gian lận</p>
      </div>

      <div class="meetings-hub-layout">
        <div class="meetings-screen-side">
          <div class="laptop-frame">
            <img src="${imgCrmMeetings}" alt="Quản lý lịch họp CRM" class="laptop-img" />
            <div class="laptop-caption">GIAO DIỆN QUẢN LÝ LỊCH HỌP SỐ TRÊN CRM</div>
          </div>
        </div>

        <div class="meetings-tech-side">
          <div class="feature-box-blue">
            <div class="box-icon">🏢</div>
            <div class="box-content">
              <h4>Chống Trùng Lịch & Phòng Họp Tuyệt Đối</h4>
              <p>Thuật toán tự động quét xung đột thời gian giữa các phòng họp trực tiếp và phòng họp trực tuyến (Zoom, Google Meet, UniWork Hub).</p>
            </div>
          </div>

          <div class="feature-box-blue feature-highlight-gold">
            <div class="box-icon">⏱</div>
            <div class="box-content">
              <h4>Mã QR Động Thay Đổi 30 Giây Một Lần (Anti-Fraud)</h4>
              <p>Mã QR điểm danh trên màn hình máy chiếu tự động làm mới mỗi 30s. Ngăn chặn triệt để tình trạng chụp ảnh mã QR gửi cho người ngoài điểm danh hộ!</p>
            </div>
          </div>

          <div class="feature-box-blue">
            <div class="box-icon">📊</div>
            <div class="box-content">
              <h4>Báo Cáo Tỷ Lệ Hiện Diện Tức Thì</h4>
              <p>Xuất danh sách đại biểu tham dự, vắng mặt có lý do và không lý do ngay khi cuộc họp bắt đầu, phục vụ công tác thi đua và kỷ luật hội.</p>
            </div>
          </div>

          <div class="hub-kpi-bar">
            <span>✓ Giảm 100% rủi ro trùng phòng</span>
            <span>✓ Tiết kiệm 20 phút điểm danh thủ công</span>
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 13: CÔNG CỤ THỰC TẾ 2 - BẢNG ĐIỀU PHỐI KANBAN 6 BAN (BỐ CỤC QUẢN TRỊ TIẾN ĐỘ THỰC THI)
    `
    <div class="slide slide-kanban-board" data-slide="13">
      ${createSlideHeader('CÔNG CỤ THỰC TẾ 2 · ĐIỀU HÀNH 6 BAN', 'BẢNG GIAO VIỆC KANBAN', 13)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">ĐIỀU PHỐI CÔNG VIỆC KANBAN: CHUYỂN NGHỊ QUYẾT THÀNH HÀNH ĐỘNG</h2>
        <p class="slide-subtitle">Không để nghị quyết cuộc họp nằm trên giấy · Giao việc cụ thể, đo lường tiến độ sát sao cho 6 ban chuyên môn</p>
      </div>

      <div class="kanban-layout">
        <div class="kanban-image-side">
          <div class="laptop-frame">
            <img src="${imgCrmTasks}" alt="Bảng giao việc Kanban CRM" class="laptop-img" />
            <div class="laptop-caption">BẢNG KANBAN TIẾN ĐỘ 6 BAN CHUYÊN MÔN</div>
          </div>
        </div>

        <div class="kanban-steps-side">
          <div class="kanban-flow-card">
            <div class="step-badge-circle">1</div>
            <div>
              <h4>Chuyển Nghị Quyết Thành Thẻ Việc</h4>
              <p>Ngay sau cuộc họp BĐH, các đầu việc được tạo thành thẻ việc có mô tả, đính kèm file tài liệu và hạn chót (Deadline) rõ ràng.</p>
            </div>
          </div>

          <div class="kanban-flow-card">
            <div class="step-badge-circle">2</div>
            <div>
              <h4>Phân Công Trực Tiếp 6 Ban Chuyên Môn</h4>
              <p>Giao việc cho Ban Thành viên, Ban Sự kiện, Ban Xúc tiến, Ban Tài chính, Ban Truyền thông hoặc Ban Quản trị. Trưởng ban nhận thông báo tức thì.</p>
            </div>
          </div>

          <div class="kanban-flow-card highlight-step">
            <div class="step-badge-circle gold-circle">3</div>
            <div>
              <h4>Kiểm Soát 3 Cột Trạng Thái Thời Gian Thực</h4>
              <p>Trực quan hóa: <strong>Chờ Xử Lý ➔ Đang Thực Hiện ➔ Đã Hoàn Thành</strong>. Hệ thống tự động gửi nhắc việc khi sắp đến hạn chót.</p>
            </div>
          </div>

          <div class="kanban-summary-banner">
            🎯 <strong>KẾT QUẢ ĐẠT ĐƯỢC:</strong> Tăng <strong>300% hiệu suất hoàn thành nhiệm vụ</strong> của các Ban Chuyên Môn; Ban Thường Trực kiểm soát toàn cảnh công việc CLB chỉ trên 1 màn hình.
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 14: CÔNG CỤ THỰC TẾ 3 - VOIP CALL NỘI BỘ & CUỘC GỌI NỀN NATIVE (BỐ CỤC CÔNG NGHỆ VIỄN THÔNG)
    `
    <div class="slide slide-voip-calling" data-slide="14">
      ${createSlideHeader('CÔNG CỤ THỰC TẾ 3 · KẾT NỐI BẢO MẬT', 'ĐÀM THOẠI VOIP NỘI BỘ', 14)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">ĐÀM THOẠI VOIP NỘI BỘ MÃ HÓA & CUỘC GỌI NỀN NATIVE PUSH CALL</h2>
        <p class="slide-subtitle">Bảo mật số điện thoại cá nhân tuyệt đối · Đổ chuông màn hình khóa ngay cả khi tắt app hoặc khóa máy</p>
      </div>

      <div class="voip-demo-layout">
        <div class="voip-mockup-side">
          <div class="phone-mockup phone-call">
            <img src="${imgChatCall}" alt="Màn hình cuộc gọi VoIP" class="mockup-screen" />
            <div class="mockup-caption">CUỘC GỌI NATIVE ĐỔ CHUÔNG MÀN HÌNH KHÓA</div>
          </div>
        </div>

        <div class="voip-tech-side">
          <div class="voip-feature-card">
            <div class="v-icon">🔒</div>
            <div>
              <h4>Bảo Mật Số Điện Thoại Cá Nhân Cấp Độ Cao Nhất</h4>
              <p>Các CEO gọi điện trực tiếp cho nhau qua hạ tầng VoIP nội bộ của ViConnect mà không cần biết hay để lộ số điện thoại cá nhân cho đối tác.</p>
            </div>
          </div>

          <div class="voip-feature-card card-featured">
            <div class="v-icon gold-v-icon">📲</div>
            <div>
              <h4>Cuộc Gọi Nền Native Push Call (Công Nghệ Vượt Trội)</h4>
              <p>Khác biệt hoàn toàn với các app thông thường: Kể cả khi hội viên <strong>đã tắt app hoàn toàn hoặc đang khóa màn hình</strong>, khi có cuộc gọi đến, điện thoại vẫn tự động bật sáng, đổ chuông và hiện nút Nhận/Từ chối y như cuộc gọi nhà mạng!</p>
            </div>
          </div>

          <div class="voip-feature-card">
            <div class="v-icon">📶</div>
            <div>
              <h4>Chất Lượng Âm Thanh HD Voice Mã Hóa Đầu - Cuối</h4>
              <p>Đường truyền thoại và video sắc nét, tối ưu băng thông khi đi công tác nước ngoài hoặc khu vực sóng yếu, mã hóa an toàn dữ liệu cuộc gọi.</p>
            </div>
          </div>

          <div class="voip-advantage-pill">
            🚀 <strong>KHÔNG LO TRỄ VIỆC KHẨN:</strong> 100% cuộc gọi quan trọng của Ban Thường Trực đều được kết nối tức thì, không bị bỏ lỡ như tin nhắn Zalo bị ẩn!
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 15: CÔNG CỤ THỰC TẾ 4 - MẠNG XÃ HỘI DOANH NHÂN MOMENTS B2B (BỐ CỤC KHÔNG GIAN TINH HOA)
    `
    <div class="slide slide-moments-feed" data-slide="15">
      ${createSlideHeader('CÔNG CỤ THỰC TẾ 4 · VĂN HÓA DOANH NHÂN', 'MẠNG XÃ HỘI MOMENTS B2B', 15)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">MẠNG XÃ HỘI KHOẢNH KHẮC DOANH NHÂN (BUSINESS MOMENTS B2B)</h2>
        <p class="slide-subtitle">Không gian tinh hoa khép kín chỉ dành riêng cho 500+ CEO 1983 · Tôn vinh thành tựu, lan tỏa văn hóa doanh nhân</p>
      </div>

      <div class="moments-layout">
        <div class="moments-left-side">
          <div class="moments-pillar-box">
            <div class="p-num">01</div>
            <div>
              <h4>Không Gian Riêng Tư & Tinh Hoa</h4>
              <p>Không lẫn lộn với mạng xã hội đại trà, không spam quảng cáo rác. Nơi chỉ có các doanh nhân cùng trang lứa 1983 giao lưu và chia sẻ.</p>
            </div>
          </div>

          <div class="moments-pillar-box">
            <div class="p-num">02</div>
            <div>
              <h4>Tôn Vinh Thành Tựu Doanh Nghiệp</h4>
              <p>Đăng tải các dấu mốc ký kết hợp đồng, lễ khánh thành nhà máy, giải thưởng doanh nghiệp, sự kiện thiện nguyện của các thành viên.</p>
            </div>
          </div>

          <div class="moments-pillar-box highlight-box">
            <div class="p-num gold-p">03</div>
            <div>
              <h4>Tương Tác Văn Minh & Khích Lệ Đồng Đội</h4>
              <p>Các đồng niên gửi lời chúc mừng, thả tim, bình luận trao đổi cơ hội hợp tác kinh doanh trong bầu không khí ấm áp và tin cậy.</p>
            </div>
          </div>
        </div>

        <div class="moments-right-side">
          <div class="laptop-frame">
            <img src="${imgNetworkChat}" alt="Moments trao đổi network" class="laptop-img" />
            <div class="laptop-caption">GIAO DIỆN TƯƠNG TÁC NETWORK NỘI BỘ</div>
          </div>
        </div>
      </div>

      <div class="moments-footer-quote">
        🤝 <strong>GẮN KẾT BỀN CHẶT:</strong> Moments B2B biến CLB CEO 1983 thành một khối đoàn kết vững mạnh, nâng đỡ nhau cùng phát triển trong kinh doanh và cuộc sống.
      </div>
    </div>
    `,

    // SLIDE 16: WEB CRM EXECUTIVE DASHBOARD 360° (BỐ CỤC THÁP CHỈ HUY TRUNG TÂM & 4 CHỈ SỐ LỚN)
    `
    <div class="slide slide-dashboard-crm" data-slide="16">
      ${createSlideHeader('WEB CRM · THÁP CHỈ HUY TRUNG TÂM', 'EXECUTIVE DASHBOARD 360°', 16)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">EXECUTIVE DASHBOARD 360°: ĐO LƯỜNG SỨC KHỎE TOÀN DIỆN CLB</h2>
        <p class="slide-subtitle">Kiểm soát trực quan số liệu hội viên, sự kiện, dòng tiền và cơ hội giao thương theo thời gian thực</p>
      </div>

      <div class="dashboard-preview-layout">
        <div class="dashboard-img-wrapper">
          <img src="${imgCrmDashboard}" alt="Dashboard tổng quan CRM" class="dashboard-img" />
        </div>

        <div class="kpi-quad-grid">
          <div class="quad-card">
            <div class="quad-icon">👥</div>
            <div class="quad-num">500+</div>
            <div class="quad-label">Hội Viên Chính Thức</div>
            <p class="quad-desc">Phân loại theo 11 ngành nghề, quản lý hồ sơ và mã thẻ CEO-83xxx.</p>
          </div>

          <div class="quad-card">
            <div class="quad-icon">🎪</div>
            <div class="quad-num">100%</div>
            <div class="quad-label">Sự Kiện Số Hóa</div>
            <p class="quad-desc">Từ Đại hội, Gala đến họp BCH đều có vé QR và Cinema Map.</p>
          </div>

          <div class="quad-card quad-gold">
            <div class="quad-icon">💰</div>
            <div class="quad-num">24/7</div>
            <div class="quad-label">VietQR Napas Gạch Nợ</div>
            <p class="quad-desc">Hội phí và vé sự kiện tự động kết chuyển vào Sổ Quỹ TT200.</p>
          </div>

          <div class="quad-card">
            <div class="quad-icon">🤝</div>
            <div class="quad-num">100%</div>
            <div class="quad-label">Minh Bạch Giao Thương</div>
            <p class="quad-desc">Đo lường giá trị thương vụ B2B phục vụ báo cáo lên HanoiBA.</p>
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 17: MA TRẬN PHÂN QUYỀN RBAC 6 BAN CHUYÊN MÔN (BỐ CỤC PHÂN QUYỀN VÀ THẨM ĐỊNH 3 BƯỚC)
    `
    <div class="slide slide-rbac-matrix" data-slide="17">
      ${createSlideHeader('WEB CRM · KỶ LUẬT VẬN HÀNH', 'MA TRẬN PHÂN QUYỀN RBAC', 17)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">MA TRẬN PHÂN QUYỀN RBAC 6 BAN & QUY TRÌNH THẨM ĐỊNH 3 BƯỚC</h2>
        <p class="slide-subtitle">Phân quyền chặt chẽ từng nghiệp vụ · Lưu vết 100% thao tác hệ thống · Đảm bảo kỷ luật và minh bạch tuyệt đối</p>
      </div>

      <div class="rbac-split-container">
        <div class="rbac-approval-card">
          <h4 class="card-title-blue">QUY TRÌNH DUYỆT HỘI VIÊN 3 BƯỚC</h4>
          <div class="step-row">
            <div class="s-badge">B1</div>
            <div>
              <strong>Ban Thư Ký Tiếp Nhận:</strong>
              <p>Tiếp nhận đơn gia nhập online từ Landing Page, kiểm tra tính đầy đủ của hồ sơ.</p>
            </div>
          </div>
          <div class="step-row">
            <div class="s-badge">B2</div>
            <div>
              <strong>Ban Thành Viên Thẩm Định:</strong>
              <p>Xác minh tư cách pháp nhân doanh nghiệp, năm sinh 1983 và uy tín ngành nghề.</p>
            </div>
          </div>
          <div class="step-row step-row-gold">
            <div class="s-badge gold-b">B3</div>
            <div>
              <strong>Ban Thường Trực Phê Duyệt:</strong>
              <p>Chủ tịch/TTK bấm duyệt cuối cùng. Tự động sinh mã CEO-83xxx và cấp thẻ số.</p>
            </div>
          </div>
        </div>

        <div class="rbac-matrix-card">
          <h4 class="card-title-navy">MA TRẬN PHÂN QUYỀN 6 BAN CHUYÊN MÔN</h4>
          <table class="rbac-table">
            <thead>
              <tr>
                <th>Ban Chuyên Môn</th>
                <th>Phạm Vi Thao Tác Chuyên Biệt</th>
                <th>Mức Quyền Hạn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ban Thành Viên</strong></td>
                <td>Quản lý danh sách, thẩm định hồ sơ, cấp mã thẻ</td>
                <td><span class="role-badge">Chuyên ban</span></td>
              </tr>
              <tr>
                <td><strong>Ban Sự Kiện</strong></td>
                <td>Tạo sự kiện, xếp chỗ Cinema Map, quản lý vé QR</td>
                <td><span class="role-badge">Chuyên ban</span></td>
              </tr>
              <tr>
                <td><strong>Ban Xúc Tiến B2B</strong></td>
                <td>Kiểm duyệt sàn Marketplace, quản trị Deal Cung - Cầu</td>
                <td><span class="role-badge">Chuyên ban</span></td>
              </tr>
              <tr>
                <td><strong>Ban Tài Chính</strong></td>
                <td>Quản lý thu chi, sổ quỹ TT200, duyệt tạm ứng, gạch nợ</td>
                <td><span class="role-badge role-gold">Tài chính</span></td>
              </tr>
              <tr>
                <td><strong>Ban Truyền Thông</strong></td>
                <td>Đăng tin tức, văn kiện, quản trị nội dung Moments</td>
                <td><span class="role-badge">Chuyên ban</span></td>
              </tr>
              <tr>
                <td><strong>Ban Thường Trực</strong></td>
                <td>Toàn quyền phê duyệt, xem Executive Dashboard 360°</td>
                <td><span class="role-badge role-navy">Toàn quyền</span></td>
              </tr>
            </tbody>
          </table>
          <div class="audit-log-note">
            📝 <strong>HỆ THỐNG AUDIT LOGS:</strong> Mọi thao tác phê duyệt, chỉnh sửa đều được ghi lại chính xác: Ai làm, làm lúc mấy giờ mấy phút, trên địa chỉ IP nào!
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 18: LỘ TRÌNH NÂNG CẤP HỆ THỐNG (BỐ CỤC 3 CỘT R&D TƯƠNG LAI QUA CLOUD OTA)
    `
    <div class="slide slide-future-roadmap" data-slide="18">
      ${createSlideHeader('LỘ TRÌNH R&D · TẦM NHÌN DÀI HẠN', 'NÂNG CẤP TỰ ĐỘNG OTA', 18)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">LỘ TRÌNH NÂNG CẤP HỆ THỐNG: CÔNG NGHỆ TIÊN PHONG</h2>
        <p class="slide-subtitle">Nền tảng ViConnect liên tục nghiên cứu và mở rộng · Nâng cấp tự động qua mạng cho toàn bộ hội viên</p>
      </div>

      <div class="three-pillars-grid">
        <div class="pillar-card">
          <div class="p-icon">🎙</div>
          <span class="p-badge">CÔNG NGHỆ 1</span>
          <h3 class="p-title">Trợ Lý AI Voice Tiếng Việt</h3>
          <p class="p-desc">
            Phòng R&D ViConnect đang hoàn thiện trợ lý ảo giọng nói tiếng Việt giúp các CEO điều khiển rảnh tay khi lái xe:
          </p>
          <ul class="p-list">
            <li>'Tìm sự kiện Gala cuối năm'</li>
            <li>'Mở danh thiếp số của tôi'</li>
            <li>'Tìm đối tác ngành xây dựng 1983'</li>
            <li>'Đề xuất lịch hẹn với anh Nam'</li>
          </ul>
        </div>

        <div class="pillar-card pillar-featured">
          <div class="p-icon gold-p-icon">🧠</div>
          <span class="p-badge gold-p-badge">CÔNG NGHỆ 2</span>
          <h3 class="p-title">AI Smart Deal Matching</h3>
          <p class="p-desc">
            Thuật toán học máy tự động phân tích hồ sơ năng lực và nhu cầu của các doanh nghiệp để ghép đôi chính xác:
          </p>
          <ul class="p-list">
            <li>Tự động nhận diện nhu cầu Mua - Bán.</li>
            <li>Gợi ý kết nối 1-on-1 có tỷ lệ chốt deal cao.</li>
            <li>Cảnh báo cơ hội giao thương phù hợp ngành nghề.</li>
            <li>Tối ưu hóa dòng tiền luân chuyển trong CLB.</li>
          </ul>
        </div>

        <div class="pillar-card">
          <div class="p-icon">🌐</div>
          <span class="p-badge">CÔNG NGHỆ 3</span>
          <h3 class="p-title">Liên Minh Đa Hiệp Hội HanoiBA</h3>
          <p class="p-desc">
            Kiến trúc Multi-Tenant mở cổng liên kết kinh tế giữa CEO 1983 với các CLB bạn trong toàn Hội Doanh Nhân Trẻ Hà Nội:
          </p>
          <ul class="p-list">
            <li>Mở rộng thị trường sang CEO 1982, CEO 1984.</li>
            <li>Tiếp cận mạng lưới Hội DNT các tỉnh bạn.</li>
            <li>Nhân cấp số nhân cơ hội bán hàng cho hội viên.</li>
            <li>Bảo mật độc lập dữ liệu tài chính nội bộ.</li>
          </ul>
        </div>
      </div>

      <div class="ota-banner">
        🚀 <strong>CẬP NHẬT TỰ ĐỘNG QUA CLOUD OTA:</strong> Các tính năng tương lai sẽ được hệ thống tự động đẩy xuống Mobile App và CRM mà không làm gián đoạn vận hành!
      </div>
    </div>
    `,

    // SLIDE 19: BỘ 10 TÌNH HUỐNG THỰC CHIẾN & ĐỐI THOẠI (BỐ CỤC CHUẨN BỊ 45 PHÚT PHẢN BIỆN)
    `
    <div class="slide slide-scenarios-qa" data-slide="19">
      ${createSlideHeader('PHẦN 3 · ĐỐI THOẠI CHUYÊN SÂU', '10:00 – 10:45 (ĐẾN 11H KÉM 15)', 19)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">BỘ 10 TÌNH HUỐNG THỰC CHIẾN: SẴN SÀNG ĐỐI THOẠI PHẢN BIỆN</h2>
        <p class="slide-subtitle">Dành trọn vẹn 45 phút lắng nghe ý kiến của Chủ tịch, Ban Thường Trực và 6 Ban Chuyên Môn</p>
      </div>

      <div class="scenarios-matrix-grid">
        <div class="sc-card">
          <div class="sc-num">01</div>
          <div class="sc-text">
            <strong>Bảo Mật SĐT Hội Viên:</strong>
            <p>Danh thiếp số kép, chủ động ẩn SĐT, chỉ hội viên được duyệt mới tra cứu danh bạ.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">02</div>
          <div class="sc-text">
            <strong>Soát Vé Khi Mất Mạng:</strong>
            <p>Gatekeeper tích hợp Local Offline Cache, quét 0.1s không nghẽn tại tầng hầm Gala.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">03</div>
          <div class="sc-text">
            <strong>Marketplace vs Nhóm Zalo:</strong>
            <p>Lưu trữ vĩnh viễn, phân loại ngành, đo lường giá trị giao dịch thực tế nộp HanoiBA.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">04</div>
          <div class="sc-text">
            <strong>Dòng Tiền Thu Chi:</strong>
            <p>ViConnect KHÔNG GIỮ TIỀN. Tiền về thẳng tài khoản CLB, VietQR gạch nợ sau 1s.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">05</div>
          <div class="sc-text">
            <strong>Dung Lượng Ảnh & Video:</strong>
            <p>Liên kết kho ảnh gốc Google Drive nét căng, app hiển thị siêu nhẹ mượt mà.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">06</div>
          <div class="sc-text">
            <strong>Duyệt Hồ Sơ Kết Nạp:</strong>
            <p>Quy trình chuẩn 3 bước: Thư ký ➔ Ban Thành viên ➔ Thường trực duyệt; lưu vết 100%.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">07</div>
          <div class="sc-text">
            <strong>Bản Quyền & Cam Kết:</strong>
            <p>Bàn giao sử dụng vĩnh viễn, đồng hành dài hạn, bảo hành kỹ thuật 24/7 cho CLB.</p>
          </div>
        </div>

        <div class="sc-card">
          <div class="sc-num">08</div>
          <div class="sc-text">
            <strong>Xử Lý Đề Xuất Ngoài Phạm Vi:</strong>
            <p>Ghi nhận vào Danh mục 3 lộ trình mở rộng để giữ đúng tiến độ bàn giao cốt lõi.</p>
          </div>
        </div>
      </div>

      <div class="open-qa-invitation">
        🎤 <strong>KÍNH MỜI BAN ĐIỀU HÀNH TRAO ĐỔI:</strong> Chúng em xin trân trọng lắng nghe và giải đáp chi tiết mọi câu hỏi từ phía các anh chị lãnh đạo!
      </div>
    </div>
    `,

    // SLIDE 20: BIÊN BẢN ĐÁNH GIÁ CUỘC HỌP: CÁI GÌ CHỐT - CÁI GÌ SỬA (BỐ CỤC 3 HỘP ĐÁNH GIÁ CHỐT NGHIỆM THU)
    `
    <div class="slide slide-signoff-matrix" data-slide="20">
      ${createSlideHeader('PHẦN 4 · ĐÁNH GIÁ TỔNG KẾT', '10:45 – 11:45 (TRÒN 60 PHÚT)', 20)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">BẢN ĐÁNH GIÁ TỔNG KẾT: CÁI GÌ CHỐT – CÁI GÌ SỬA</h2>
        <p class="slide-subtitle">Minh bạch phạm vi · Khóa chặt các chức năng đã hoàn thành · Cam kết thời hạn hoàn thành các điểm tinh chỉnh</p>
      </div>

      <div class="signoff-three-boxes">
        <div class="signoff-box signoff-green">
          <div class="box-top">
            <span class="box-tag tag-green">DANH MỤC 1 · CHỐT 100%</span>
            <h3 class="box-heading">CÁI GÌ ĐÃ LÀM ➔ CHỐT NGHIỆM THU</h3>
            <p class="box-desc">Đã hoàn thành và đáp ứng đầy đủ yêu cầu nghiệp vụ:</p>
            <ul class="box-checklist">
              <li>✔ Đăng ký & Đăng nhập số điện thoại an toàn</li>
              <li>✔ Thẻ VIP mạ vàng & Danh thiếp số kép vCard</li>
              <li>✔ Danh bạ 500+ CEO 11 ngành & Hẹn 1-on-1</li>
              <li>✔ Sàn Marketplace B2B & Bảng Deal Cung Cầu</li>
              <li>✔ Quản trị Sự kiện, Cinema Map & Vé QR 0.1s</li>
              <li>✔ Executive Dashboard 360° & RBAC 6 Ban</li>
              <li>✔ Sổ Quỹ Tiền Mặt TT200 & VietQR Napas 24/7</li>
              <li>✔ Hệ công cụ thực tế: Lịch họp, Kanban, VoIP, Moments</li>
            </ul>
          </div>
          <div class="box-footer-btn btn-green">CHỐT NGHIỆM THU 100% TẠI BUỔI HỌP</div>
        </div>

        <div class="signoff-box signoff-amber">
          <div class="box-top">
            <span class="box-tag tag-amber">DANH MỤC 2 · TINH CHỈNH</span>
            <h3 class="box-heading">CÁI GÌ CẦN SỬA ➔ CAM KẾT DEADLINE</h3>
            <p class="box-desc">Ghi nhận chi tiết các góp ý tinh chỉnh tại cuộc họp:</p>
            <ul class="box-checklist checklist-amber">
              <li>✎ Bổ sung trường thông tin quy mô doanh nghiệp</li>
              <li>✎ Tinh chỉnh màu sắc nút bấm theo góp ý của BĐH</li>
              <li>✎ Tối ưu thêm thông báo nhắc nhở sự kiện qua Zalo</li>
              <li>✎ Phân công người phụ trách kỹ thuật cụ thể</li>
              <li>✎ Cam kết hoàn thành trong vòng <strong>3 - 5 ngày làm việc</strong></li>
            </ul>
          </div>
          <div class="box-footer-btn btn-amber">CAM KẾT THỜI HẠN BẰNG VĂN BẢN</div>
        </div>

        <div class="signoff-box signoff-blue">
          <div class="box-top">
            <span class="box-tag tag-blue">DANH MỤC 3 · R&D ROADMAP</span>
            <h3 class="box-heading">ĐỀ XUẤT MỞ RỘNG ➔ LỘ TRÌNH TƯƠNG LAI</h3>
            <p class="box-desc">Các ý tưởng lớn ngoài phạm vi cam kết ban đầu:</p>
            <ul class="box-checklist checklist-blue">
              <li>🚀 Trợ lý Doanh nhân AI Voice Assistant tiếng Việt</li>
              <li>🚀 Thuật toán AI Smart Deal Matching ghép đôi cung cầu</li>
              <li>🚀 Cổng liên kết Liên minh Đa Hiệp Hội HanoiBA</li>
              <li>🚀 Nâng cấp tự động qua mạng Cloud OTA</li>
            </ul>
          </div>
          <div class="box-footer-btn btn-blue">NÂNG CẤP QUA CLOUD OTA</div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 21: KẾ HOẠCH BÀN GIAO 3 GIAI ĐOẠN & CAM KẾT VĂN BẢN (BỐ CỤC PHÁP LÝ & BÀN GIAO)
    `
    <div class="slide slide-handover-plan" data-slide="21">
      ${createSlideHeader('PHẦN 5 · KẾ HOẠCH BÀN GIAO', '11:45 – 12:00 (BẾ MẠC ĐÚNG GIỜ)', 21)}
      
      <div class="slide-title-group">
        <h2 class="slide-title">KẾ HOẠCH BÀN GIAO 3 GIAI ĐOẠN & CAM KẾT VĂN BẢN CHÍNH THỨC</h2>
        <p class="slide-subtitle">Trách nhiệm cao nhất · Biên bản chính thức trong 24h · Kế hoạch hành động trong 48h · Tập huấn chuyên sâu</p>
      </div>

      <div class="handover-grid">
        <div class="handover-phases-col">
          <div class="h-card">
            <div class="h-step-badge">GIAI ĐOẠN 1</div>
            <div>
              <h4>Bàn Giao Tài Khoản & Tài Liệu Chuẩn Hóa</h4>
              <p>Cấp tài khoản trải nghiệm thực tế cho Ban Thường Trực và Ban Thư Ký; bàn giao bộ tài liệu HDSD (bản mềm PDF & video 60s).</p>
            </div>
          </div>

          <div class="h-card">
            <div class="h-step-badge">GIAI ĐOẠN 2</div>
            <div>
              <h4>Tổ Chức 01 Buổi Tập Huấn Chuyên Sâu 30 Phút</h4>
              <p>Đội ngũ kỹ sư trực tiếp hướng dẫn Ban Thư Ký và đại diện 6 Ban Chuyên Môn tự tay thao tác nhuần nhuyễn từng nghiệp vụ.</p>
            </div>
          </div>

          <div class="h-card h-card-highlight">
            <div class="h-step-badge gold-badge">GIAI ĐOẠN 3</div>
            <div>
              <h4>BĐH Trải Nghiệm & Phát Động 500+ Hội Viên</h4>
              <p>BĐH chạy thử thực tế 3 - 5 ngày; chính thức phát động toàn thể hội viên CEO 1983 tải App trên App Store và Google Play.</p>
            </div>
          </div>
        </div>

        <div class="legal-commitments-col">
          <div class="legal-box">
            <span class="legal-tag">CAM KẾT VĂN BẢN CHÍNH THỨC SAU CUỘC HỌP</span>
            <div class="legal-item">
              <div class="l-badge">24H</div>
              <div>
                <strong>Gửi Biên Bản Họp Chính Thức:</strong>
                <p>Hoàn thiện đầy đủ chữ ký hai bên, gửi bản mềm qua email và bản in văn bản có dấu đỏ cho Ban Thư Ký.</p>
              </div>
            </div>
            <div class="legal-item">
              <div class="l-badge">48H</div>
              <div>
                <strong>Gửi Kế Hoạch Chỉnh Sửa Chi Tiết (Action Plan):</strong>
                <p>Liệt kê chi tiết từng hạng mục cần sửa, người phụ trách và ngày hoàn thành cụ thể.</p>
              </div>
            </div>
            <div class="legal-item">
              <div class="l-badge">03 NGÀY</div>
              <div>
                <strong>Gửi Trọn Bộ Tài Liệu HDSD & Video Clip:</strong>
                <p>Cẩm nang hướng dẫn sử dụng chi tiết từng phân hệ cho 6 Ban Chuyên Môn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,

    // SLIDE 22: LỜI CẢM ƠN & CAM KẾT ĐỒNG HÀNH VỮNG BỀN (BỐ CỤC KẾT THÚC TRANG TRỌNG 12:00)
    `
    <div class="slide slide-closing-hero" data-slide="22">
      <div class="closing-card">
        <div class="closing-emblem">
          <img src="${imgOfficialLogo}" alt="CEO 1983 Logo" class="closing-logo-img" />
        </div>

        <div class="closing-clock-badge">
          ⏱ KẾT THÚC BUỔI LÀM VIỆC ĐÚNG 12:00 TRƯA
        </div>

        <h2 class="closing-title">
          TRÂN TRỌNG CẢM ƠN BAN ĐIỀU HÀNH<br>
          <span class="gold-gradient-text">CLB DOANH NHÂN CEO 1983 - HANOIBA</span>
        </h2>

        <p class="closing-paragraph">
          Liên minh <strong>ViConnect & ViOne</strong> cam kết đồng hành lâu dài, hỗ trợ kỹ thuật 24/7, đưa CLB Doanh Nhân CEO 1983 trở thành <strong>ngọn cờ đầu về chuyển đổi số</strong> trong toàn bộ Hội Doanh Nhân Trẻ Hà Nội!
        </p>

        <div class="closing-contact-pills">
          <div class="contact-pill">
            <span class="c-label">ĐƠN VỊ TRIỂN KHAI:</span>
            <span class="c-val">Liên Minh Nền Tảng ViConnect & ViOne Solution</span>
          </div>
          <div class="contact-pill">
            <span class="c-label">HOTLINE KỸ THUẬT:</span>
            <span class="c-val">1900 xxxx · Hỗ trợ 24/7</span>
          </div>
          <div class="contact-pill">
            <span class="c-label">TRỤ SỞ:</span>
            <span class="c-val">Hà Nội, Việt Nam</span>
          </div>
        </div>

        <div class="closing-slogan">
          "BẢN LĨNH – TIÊN PHONG – KẾT NỐI – PHÁT TRIỂN"
        </div>
      </div>
    </div>
    `
  ];

  // TOÀN BỘ CSS THIẾT KẾ CHO 22 SLIDES: NỀN XANH TRẮNG SANG TRỌNG, 1 SLIDE 1 KIỂU BỐ CỤC,
  // HIỆU ỨNG CHUYỂN SLIDE 3D THÚ VỊ VÀ ĐIỀU KHIỂN BÀN PHÍM / HUD THUYẾT TRÌNH
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BÁO CÁO GIẢI PHÁP SỐ HÓA TOÀN DIỆN · CLB DOANH NHÂN CEO 1983</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* ==========================================================================
       RESET & BASE SETUP
       ========================================================================== */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0B132B;
      color: #1E293B;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ==========================================================================
       COLOR TOKENS - NỀN XANH TRẮNG HOÀNG GIA (ROYAL NAVY & CRISP WHITE LUXURY)
       ========================================================================== */
    :root {
      --primary-navy: #003B95;
      --deep-navy: #0A1E3F;
      --royal-blue: #1D4ED8;
      --accent-blue: #0284C7;
      --light-blue-bg: #EFF6FF;
      --gold-accent: #D97706;
      --gold-light: #F59E0B;
      --gold-bg: #FEF3C7;
      --emerald-green: #10B981;
      --slate-dark: #0F172A;
      --slate-body: #334155;
      --slate-muted: #64748B;
      --card-white: #FFFFFF;
      --card-border: #E2E8F0;
      --shadow-premium: 0 10px 30px rgba(0, 59, 149, 0.06);
    }

    /* ==========================================================================
       PRESENTATION DECK CONTAINER (16:9 RATIO WIDESCREEN)
       ========================================================================== */
    #deck-viewport {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1400px;
      overflow: hidden;
      position: relative;
      background: radial-gradient(circle at 50% 50%, #172554 0%, #0A1128 100%);
    }

    .slide {
      width: 1600px;
      height: 900px;
      background: #FFFFFF;
      border-radius: 12px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      padding: 36px 50px 32px 50px;
      opacity: 0;
      pointer-events: none;
      transition: all 0.65s cubic-bezier(0.25, 1, 0.5, 1);
      overflow: hidden;
    }

    /* Active Slide State */
    .slide.active {
      opacity: 1;
      pointer-events: auto;
      z-index: 10;
      transform: translate(-50%, -50%) scale(1) rotateY(0deg);
    }

    /* ==========================================================================
       3D TRANSITION EFFECTS (CUBE, SLIDE-PUSH, PARALLAX-ZOOM, FLIP-CARD)
       ========================================================================== */
    /* Effect 1: 3D Cube (Default) */
    .effect-cube .slide.prev {
      opacity: 0;
      transform: translate(-130%, -50%) rotateY(45deg) scale(0.85);
      z-index: 5;
    }
    .effect-cube .slide.next {
      opacity: 0;
      transform: translate(30%, -50%) rotateY(-45deg) scale(0.85);
      z-index: 5;
    }

    /* Effect 2: Smooth Slide Push */
    .effect-push .slide.prev {
      opacity: 0;
      transform: translate(-160%, -50%);
      z-index: 5;
    }
    .effect-push .slide.next {
      opacity: 0;
      transform: translate(60%, -50%);
      z-index: 5;
    }

    /* Effect 3: Parallax Zoom */
    .effect-zoom .slide.prev {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.15);
      filter: blur(8px);
      z-index: 5;
    }
    .effect-zoom .slide.next {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.75);
      filter: blur(8px);
      z-index: 5;
    }

    /* Effect 4: Flip 3D Card */
    .effect-flip .slide.prev {
      opacity: 0;
      transform: translate(-50%, -50%) rotateY(90deg);
      z-index: 5;
    }
    .effect-flip .slide.next {
      opacity: 0;
      transform: translate(-50%, -50%) rotateY(-90deg);
      z-index: 5;
    }

    /* ==========================================================================
       STANDARDIZED SLIDE HEADER WITH OFFICIAL CEO 1983 LOGO
       ========================================================================== */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 2px solid #EFF6FF;
      margin-bottom: 18px;
      flex-shrink: 0;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      height: 48px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 59, 149, 0.15));
    }
    .brand-meta {
      display: flex;
      flex-direction: column;
    }
    .club-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 0.5px;
    }
    .system-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: var(--slate-muted);
      letter-spacing: 0.3px;
    }
    .header-tags {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .category-badge {
      background: var(--light-blue-bg);
      color: var(--primary-navy);
      border: 1px solid #BFDBFE;
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .slide-index-pill {
      background: var(--slate-dark);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 12px;
      border-radius: 999px;
      padding: 6px 14px;
      letter-spacing: 1px;
    }

    /* Slide Titles */
    .slide-title-group {
      margin-bottom: 20px;
      flex-shrink: 0;
    }
    .slide-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: var(--slate-dark);
      line-height: 1.25;
      letter-spacing: -0.3px;
      margin-bottom: 6px;
    }
    .slide-subtitle {
      font-size: 14.5px;
      color: var(--slate-muted);
      line-height: 1.4;
      font-weight: 500;
    }

    /* ==========================================================================
       SLIDE 1: HERO COVER DESIGN (NỀN XANH TRẮNG HOÀNG GIA ĐẲNG CẤP)
       ========================================================================== */
    .slide-hero-cover {
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #EFF6FF 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 50px 70px;
      position: relative;
    }
    .hero-top-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #EFF6FF;
      color: var(--primary-navy);
      border: 1.5px solid #BFDBFE;
      padding: 8px 24px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }
    .pulse-indicator {
      width: 8px;
      height: 8px;
      background: #2563EB;
      border-radius: 50%;
      box-shadow: 0 0 10px #2563EB;
    }
    .hero-center-logo {
      margin-bottom: 20px;
    }
    .hero-logo-img {
      height: 105px;
      width: auto;
      filter: drop-shadow(0 8px 20px rgba(0, 59, 149, 0.2));
    }
    .hero-main-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 42px;
      font-weight: 900;
      line-height: 1.2;
      color: var(--slate-dark);
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    .navy-gold-text {
      background: linear-gradient(135deg, #003B95 0%, #1D4ED8 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-lead-description {
      font-size: 17.5px;
      color: #475569;
      max-width: 980px;
      margin: 0 auto 30px auto;
      line-height: 1.5;
    }
    .hero-meta-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 1080px;
      width: 100%;
      margin: 0 auto 28px auto;
    }
    .meta-pill-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-premium);
      text-align: left;
    }
    .meta-pill-card.highlight-pill {
      background: #FEF3C7;
      border-color: #FDE68A;
    }
    .pill-icon {
      font-size: 26px;
      width: 48px;
      height: 48px;
      background: #EFF6FF;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .highlight-pill .pill-icon {
      background: #FDE68A;
    }
    .pill-info {
      display: flex;
      flex-direction: column;
    }
    .pill-label {
      font-size: 11px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .highlight-pill .pill-label { color: #92400E; }
    .pill-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--slate-dark);
    }
    .hero-slogan-bar {
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 2px;
    }

    /* ==========================================================================
       SLIDE 2: TIMELINE STEPPER (7 PHÂN ĐOẠN 09:00 - 12:00)
       ========================================================================== */
    .timeline-stepper {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 14px;
      flex: 1;
      align-items: stretch;
      margin-bottom: 16px;
    }
    .step-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
    }
    .step-time {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 6px;
    }
    .step-badge {
      background: #E2E8F0;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      width: fit-content;
      margin-bottom: 10px;
    }
    .badge-blue { background: #DBEAFE; color: #1D4ED8; }
    .badge-navy { background: #003B95; color: #FFFFFF; }
    .badge-amber { background: #FEF3C7; color: #B45309; }
    .badge-green { background: #DCFCE7; color: #15803D; }
    .step-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .step-desc {
      font-size: 12px;
      color: var(--slate-body);
      line-height: 1.45;
    }
    .step-highlight-blue { background: #EFF6FF; border-color: #BFDBFE; }
    .step-highlight-navy { background: #F0F4FF; border-color: #93C5FD; }
    .step-alert { background: #FFFBEB; border-color: #FCD34D; }
    .step-success { background: #F0FDF4; border-color: #86EFAC; }
    .timeline-callout {
      background: #EFF6FF;
      border-left: 4px solid var(--primary-navy);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      color: var(--slate-dark);
    }

    /* ==========================================================================
       SLIDE 3: 3 BÀI TOÁN GỐC (3 CỘT SO SÁNH NỖI ĐAU VS GIẢI PHÁP MỚI)
       ========================================================================== */
    .three-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
      margin-bottom: 16px;
    }
    .challenge-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px 22px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .card-featured {
      border: 2px solid #F59E0B;
      background: #FFFDF8;
    }
    .card-icon-box {
      font-size: 32px;
      width: 56px;
      height: 56px;
      background: #EFF6FF;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .gold-icon { background: #FEF3C7; }
    .card-badge {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .gold-badge { color: #B45309; }
    .card-heading {
      font-size: 19px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 16px;
    }
    .diff-block {
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.45;
      margin-bottom: 12px;
    }
    .diff-old {
      background: #FEF2F2;
      border-left: 3px solid #EF4444;
      color: #991B1B;
    }
    .diff-new {
      background: #F0FDF4;
      border-left: 3px solid #10B981;
      color: #166534;
    }
    .diff-tag { font-weight: 800; margin-right: 4px; }
    .focus-notice-bar {
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      color: #92400E;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
    }

    /* ==========================================================================
       SLIDE 4: DUAL ARCHITECTURE (2 KHỐI NỀN TẢNG ĐỐI XỨNG CÔNG NGHỆ CAO)
       ========================================================================== */
    .dual-columns-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      flex: 1;
      margin-bottom: 16px;
    }
    .platform-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .platform-app { border-top: 5px solid var(--gold-accent); }
    .platform-crm { border-top: 5px solid var(--primary-navy); }
    .platform-badge {
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      width: fit-content;
      padding: 4px 12px;
      border-radius: 999px;
    }
    .app-badge { background: #FEF3C7; color: #B45309; }
    .crm-badge { background: #EFF6FF; color: #003B95; }
    .platform-name {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 8px;
    }
    .platform-lead {
      font-size: 13.5px;
      color: var(--slate-muted);
      margin-bottom: 18px;
    }
    .platform-bullets {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13.5px;
      color: var(--slate-body);
      line-height: 1.45;
      background: #F8FAFC;
      padding: 10px 14px;
      border-radius: 8px;
    }
    .bullet-icon { font-size: 20px; flex-shrink: 0; }
    .sync-footer-bar {
      background: #EFF6FF;
      color: var(--primary-navy);
      border: 1px solid #BFDBFE;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      text-align: center;
    }

    /* ==========================================================================
       SLIDE 5: LUỒNG THANH TOÁN & TÀI CHÍNH TOÀN DIỆN (SƠ ĐỒ 5 BƯỚC KHÉP KÍN)
       ========================================================================== */
    .process-flow-grid {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      margin-bottom: 16px;
    }
    .flow-card {
      flex: 1;
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px 16px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
      height: 100%;
    }
    .flow-card-featured {
      border: 2px solid #F59E0B;
      background: #FFFDF8;
    }
    .flow-card-success {
      border: 2px solid #10B981;
      background: #F0FDF4;
    }
    .flow-step-num {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .flow-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    .flow-card-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 8px;
    }
    .flow-card-desc {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.45;
    }
    .flow-connector {
      font-size: 22px;
      font-weight: 900;
      color: #94A3B8;
    }
    .finance-security-banner {
      background: #F0FDF4;
      border: 1px solid #86EFAC;
      color: #166534;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      text-align: center;
    }

    /* ==========================================================================
       SLIDE 6: BÁO CÁO SỔ QUỸ TIỀN MẶT TT 200 (BẢNG HẠCH TOÁN MẪU S07-DN)
       ========================================================================== */
    .report-split-layout {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 24px;
      flex: 1;
    }
    .report-table-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .table-header-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 11px;
      font-weight: 800;
    }
    .report-code { color: var(--primary-navy); }
    .report-status { color: #16A34A; }
    .cashbook-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin-bottom: 14px;
    }
    .cashbook-table th {
      background: #F1F5F9;
      color: var(--slate-dark);
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #CBD5E1;
    }
    .cashbook-table td {
      padding: 10px 10px;
      border-bottom: 1px solid #E2E8F0;
      color: var(--slate-body);
    }
    .code-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .code-badge.pt { background: #DCFCE7; color: #166534; }
    .code-badge.pc { background: #FEE2E2; color: #991B1B; }
    .highlight-row { background: #FFFBEB; font-weight: 600; }
    .text-right { text-align: right; }
    .text-green { color: #15803D; }
    .text-red { color: #B91C1C; }
    .text-gray { color: #94A3B8; }
    .font-bold { font-weight: 700; }
    .table-footer-words {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: var(--slate-dark);
    }
    .report-features-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-premium);
    }
    .features-heading {
      font-size: 16px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 14px;
    }
    .feature-bullets-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }
    .feature-bullets-list li {
      font-size: 13.5px;
      color: var(--slate-body);
      line-height: 1.45;
      padding-left: 20px;
      position: relative;
    }
    .feature-bullets-list li::before {
      content: "✔";
      position: absolute;
      left: 0;
      color: var(--primary-navy);
      font-weight: bold;
    }
    .audit-badge {
      background: #DCFCE7;
      border: 1px solid #86EFAC;
      color: #14532D;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    /* ==========================================================================
       SLIDE 7: TRỌNG TÂM 2 - XÚC TIẾN THƯƠNG MẠI B2B (4 CÁNH BUỒM KINH TẾ)
       ========================================================================== */
    .four-sails-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      flex: 1;
      margin-bottom: 16px;
    }
    .sail-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px 18px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .sail-featured {
      border: 2px solid #F59E0B;
      background: #FFFDF8;
    }
    .sail-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }
    .sail-badge {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .gold-sail { color: #B45309; }
    .sail-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 10px;
    }
    .sail-desc {
      font-size: 13px;
      color: var(--slate-body);
      line-height: 1.45;
    }
    .trade-kpi-banner {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: var(--primary-navy);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      text-align: center;
    }

    /* ==========================================================================
       SLIDE 8: THẺ VIP & DANH THIẾP SỐ KÉP (MOCKUP 3D & CÔNG NGHỆ BẢO MẬT)
       ========================================================================== */
    .card-demo-container {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 30px;
      flex: 1;
      align-items: center;
    }
    .card-mockup-wrapper {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    .card-frame {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card-img {
      max-height: 380px;
      width: auto;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 59, 149, 0.15);
      border: 1px solid #CBD5E1;
    }
    .frame-label {
      font-size: 11px;
      font-weight: 800;
      color: #64748B;
      margin-top: 8px;
      letter-spacing: 0.5px;
    }
    .card-tech-points {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tech-box {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .tech-icon {
      font-size: 22px;
      width: 40px;
      height: 40px;
      background: #EFF6FF;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tech-text h4 {
      font-size: 15px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 4px;
    }
    .tech-text p {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.4;
    }

    /* ==========================================================================
       SLIDE 9: LUỒNG SỰ KIỆN TOÀN DIỆN (HÀNH TRÌNH 4 GIAI ĐOẠN KHÉP KÍN)
       ========================================================================== */
    .event-journey-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      flex: 1;
      margin-bottom: 16px;
    }
    .journey-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px 18px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .journey-featured {
      border: 2px solid #F59E0B;
      background: #FFFDF8;
    }
    .journey-phase {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .gold-phase { color: #B45309; }
    .journey-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 12px;
    }
    .journey-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .journey-list li {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.45;
      padding-left: 16px;
      position: relative;
    }
    .journey-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--primary-navy);
      font-weight: bold;
    }
    .event-capacity-notice {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: var(--primary-navy);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      text-align: center;
    }

    /* ==========================================================================
       SLIDE 10: VÉ ĐIỆN TỬ QR & GATEKEEPER OFFLINE (BẢNG SO SÁNH ONLINE VS OFFLINE)
       ========================================================================== */
    .gatekeeper-layout {
      display: grid;
      grid-template-columns: 0.85fr 1.35fr;
      gap: 30px;
      flex: 1;
      align-items: center;
    }
    .gatekeeper-phone-side {
      display: flex;
      justify-content: center;
    }
    .phone-mockup {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .mockup-screen {
      max-height: 410px;
      width: auto;
      border-radius: 16px;
      box-shadow: 0 15px 35px rgba(0, 59, 149, 0.15);
      border: 1px solid #CBD5E1;
    }
    .mockup-caption {
      font-size: 11px;
      font-weight: 800;
      color: #64748B;
      margin-top: 8px;
      letter-spacing: 0.5px;
    }
    .gatekeeper-comparison-side {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .tech-badge-row {
      display: flex;
      gap: 10px;
    }
    .tech-pill {
      background: #EFF6FF;
      color: var(--primary-navy);
      border: 1px solid #BFDBFE;
      font-size: 11.5px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 6px;
    }
    .comparison-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
    }
    .comp-title { font-size: 14px; font-weight: 800; margin-bottom: 8px; }
    .comp-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .comp-list li { font-size: 12px; line-height: 1.4; color: var(--slate-body); }
    .gatekeeper-kpi-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      text-align: center;
    }
    .kpi-item {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .kpi-num {
      display: block;
      font-size: 22px;
      font-weight: 900;
      color: var(--primary-navy);
      margin-bottom: 2px;
    }
    .kpi-label { font-size: 11px; color: var(--slate-muted); font-weight: 600; }

    /* ==========================================================================
       SLIDE 11: GÓC NHÌN QUẢN LÝ DỰ ÁN (TRIẾT LÝ HỆ CÔNG CỤ THỰC CHIẾN)
       ========================================================================== */
    .philosophy-manifesto {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 30px;
      flex: 1;
      align-items: center;
    }
    .pm-badge {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--gold-accent);
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .pm-heading {
      font-size: 22px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 14px;
      line-height: 1.3;
    }
    .pm-paragraph {
      font-size: 14px;
      color: var(--slate-body);
      line-height: 1.55;
      margin-bottom: 14px;
    }
    .pm-quote-box {
      background: #EFF6FF;
      border-left: 4px solid var(--primary-navy);
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-style: italic;
      color: var(--slate-dark);
      margin-bottom: 14px;
      line-height: 1.5;
    }
    .ops-suite-card {
      background: #FFFFFF;
      border: 1.5px solid #BFDBFE;
      border-radius: 16px;
      padding: 24px 20px;
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .suite-tag {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      background: #EFF6FF;
      padding: 4px 12px;
      border-radius: 6px;
      width: fit-content;
      margin-bottom: 4px;
    }
    .suite-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .suite-icon {
      font-size: 22px;
      width: 42px;
      height: 42px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .suite-item strong {
      font-size: 14px;
      color: var(--slate-dark);
      display: block;
      margin-bottom: 2px;
    }
    .suite-item p {
      font-size: 12.5px;
      color: var(--slate-muted);
      line-height: 1.4;
    }

    /* ==========================================================================
       SLIDES 12 - 15: CÔNG CỤ THỰC TẾ 1 ĐẾN 4 (LAYOUT MÁY TÍNH / ĐIỆN THOẠI)
       ========================================================================== */
    .meetings-hub-layout, .kanban-layout, .voip-demo-layout, .moments-layout {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 28px;
      flex: 1;
      align-items: center;
    }
    .voip-demo-layout {
      grid-template-columns: 0.8fr 1.3fr;
    }
    .moments-layout {
      grid-template-columns: 1fr 1.25fr;
    }
    .laptop-frame {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 14px;
      padding: 10px;
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .laptop-img {
      width: 100%;
      height: auto;
      max-height: 380px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }
    .laptop-caption {
      font-size: 11px;
      font-weight: 800;
      color: #64748B;
      margin-top: 8px;
      letter-spacing: 0.5px;
    }
    .meetings-tech-side, .kanban-steps-side, .voip-tech-side, .moments-left-side {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feature-box-blue, .kanban-flow-card, .voip-feature-card, .moments-pillar-box {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      gap: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .feature-highlight-gold {
      border: 1.5px solid #F59E0B;
      background: #FFFDF8;
    }
    .box-icon, .v-icon {
      font-size: 24px;
      width: 44px;
      height: 44px;
      background: #EFF6FF;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gold-v-icon { background: #FEF3C7; }
    .box-content h4, .kanban-flow-card h4, .voip-feature-card h4, .moments-pillar-box h4 {
      font-size: 15px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 3px;
    }
    .box-content p, .kanban-flow-card p, .voip-feature-card p, .moments-pillar-box p {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.4;
    }
    .hub-kpi-bar {
      display: flex;
      gap: 14px;
      background: #EFF6FF;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--primary-navy);
    }
    .step-badge-circle, .p-num {
      width: 36px;
      height: 36px;
      background: #EFF6FF;
      color: var(--primary-navy);
      font-weight: 900;
      font-size: 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gold-circle, .gold-p {
      background: #FEF3C7;
      color: #B45309;
    }
    .kanban-summary-banner, .voip-advantage-pill, .moments-footer-quote {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--slate-dark);
    }

    /* ==========================================================================
       SLIDE 16: EXECUTIVE DASHBOARD 360° (CRM PREVIEW VÀ 4 CHỈ SỐ LỚN)
       ========================================================================== */
    .dashboard-preview-layout {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 26px;
      flex: 1;
      align-items: center;
    }
    .dashboard-img-wrapper {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 14px;
      padding: 10px;
      box-shadow: var(--shadow-premium);
    }
    .dashboard-img {
      width: 100%;
      height: auto;
      max-height: 400px;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }
    .kpi-quad-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .quad-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px 16px;
      box-shadow: var(--shadow-premium);
    }
    .quad-gold {
      border: 2px solid #F59E0B;
      background: #FFFDF8;
    }
    .quad-icon { font-size: 26px; margin-bottom: 6px; }
    .quad-num {
      font-size: 28px;
      font-weight: 900;
      color: var(--primary-navy);
      line-height: 1;
      margin-bottom: 4px;
    }
    .quad-gold .quad-num { color: #B45309; }
    .quad-label {
      font-size: 13px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 6px;
    }
    .quad-desc {
      font-size: 11.5px;
      color: var(--slate-muted);
      line-height: 1.4;
    }

    /* ==========================================================================
       SLIDE 17: MA TRẬN PHÂN QUYỀN RBAC 6 BAN (QUY TRÌNH 3 BƯỚC VÀ BẢNG PHÂN QUYỀN)
       ========================================================================== */
    .rbac-split-container {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 24px;
      flex: 1;
    }
    .rbac-approval-card, .rbac-matrix-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px 20px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .card-title-blue {
      font-size: 15px;
      font-weight: 800;
      color: var(--primary-navy);
      margin-bottom: 14px;
    }
    .card-title-navy {
      font-size: 15px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 14px;
    }
    .step-row {
      display: flex;
      gap: 12px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 10px;
    }
    .step-row-gold {
      background: #FFFDF8;
      border-color: #FCD34D;
    }
    .s-badge {
      width: 32px;
      height: 32px;
      background: #EFF6FF;
      color: var(--primary-navy);
      font-weight: 900;
      font-size: 13px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gold-b { background: #FEF3C7; color: #B45309; }
    .step-row strong { font-size: 13.5px; color: var(--slate-dark); display: block; margin-bottom: 2px; }
    .step-row p { font-size: 12px; color: var(--slate-muted); line-height: 1.4; }
    .rbac-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 12px;
    }
    .rbac-table th {
      background: #F1F5F9;
      color: var(--slate-dark);
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #CBD5E1;
    }
    .rbac-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #E2E8F0;
      color: var(--slate-body);
    }
    .role-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: #EFF6FF;
      color: #003B95;
    }
    .role-gold { background: #FEF3C7; color: #B45309; }
    .role-navy { background: #0A1E3F; color: #FFFFFF; }
    .audit-log-note {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11.5px;
      color: var(--slate-dark);
    }

    /* ==========================================================================
       SLIDE 18: LỘ TRÌNH R&D TƯƠNG LAI (3 CỘT CÔNG NGHỆ OTA)
       ========================================================================== */
    .three-pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      flex: 1;
      margin-bottom: 16px;
    }
    .pillar-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-premium);
    }
    .pillar-featured {
      border: 2px solid #F59E0B;
      background: #FFFDF8;
    }
    .p-icon { font-size: 32px; margin-bottom: 10px; }
    .p-badge {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .gold-p-badge { color: #B45309; }
    .p-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 10px;
    }
    .p-desc {
      font-size: 13px;
      color: var(--slate-muted);
      line-height: 1.45;
      margin-bottom: 14px;
    }
    .p-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .p-list li {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.4;
      padding-left: 18px;
      position: relative;
    }
    .p-list li::before {
      content: "➔";
      position: absolute;
      left: 0;
      color: var(--primary-navy);
      font-size: 11px;
    }
    .ota-banner {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: var(--primary-navy);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      text-align: center;
    }

    /* ==========================================================================
       SLIDE 19: BỘ 10 TÌNH HUỐNG THỰC CHIẾN (MA TRẬN ĐỐI THOẠI 45 PHÚT)
       ========================================================================== */
    .scenarios-matrix-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      flex: 1;
      margin-bottom: 16px;
    }
    .sc-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 14px;
      display: flex;
      gap: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.02);
    }
    .sc-num {
      font-size: 15px;
      font-weight: 900;
      color: var(--primary-navy);
      background: #EFF6FF;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sc-text strong {
      font-size: 13px;
      font-weight: 800;
      color: var(--slate-dark);
      display: block;
      margin-bottom: 3px;
    }
    .sc-text p {
      font-size: 11.5px;
      color: var(--slate-muted);
      line-height: 1.4;
    }
    .open-qa-invitation {
      background: #FEF3C7;
      border: 1.5px solid #FDE68A;
      color: #92400E;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
      font-weight: 700;
    }

    /* ==========================================================================
       SLIDE 20: BIÊN BẢN CHỐT: CÁI GÌ CHỐT - CÁI GÌ SỬA (3 HỘP ĐÁNH GIÁ)
       ========================================================================== */
    .signoff-three-boxes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      flex: 1;
    }
    .signoff-box {
      border-radius: 16px;
      padding: 22px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-premium);
    }
    .signoff-green { background: #F0FDF4; border: 2px solid #86EFAC; }
    .signoff-amber { background: #FFFBEB; border: 2px solid #FCD34D; }
    .signoff-blue { background: #EFF6FF; border: 2px solid #93C5FD; }
    .box-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 6px;
    }
    .tag-green { background: #DCFCE7; color: #166534; }
    .tag-amber { background: #FEF3C7; color: #B45309; }
    .tag-blue { background: #DBEAFE; color: #1D4ED8; }
    .box-heading {
      font-size: 16px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 4px;
    }
    .box-desc {
      font-size: 12.5px;
      color: var(--slate-muted);
      margin-bottom: 12px;
    }
    .box-checklist {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    .box-checklist li {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.4;
    }
    .checklist-amber li { color: #78350F; }
    .checklist-blue li { color: #1E3A8A; }
    .box-footer-btn {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      text-align: center;
      color: #FFFFFF;
    }
    .btn-green { background: #16A34A; }
    .btn-amber { background: #D97706; }
    .btn-blue { background: #2563EB; }

    /* ==========================================================================
       SLIDE 21: KẾ HOẠCH BÀN GIAO & CAM KẾT VĂN BẢN (3 GIAI ĐOẠN)
       ========================================================================== */
    .handover-grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 26px;
      flex: 1;
    }
    .handover-phases-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .h-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      gap: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .h-card-highlight {
      border: 1.5px solid #F59E0B;
      background: #FFFDF8;
    }
    .h-step-badge {
      font-size: 11px;
      font-weight: 900;
      background: #EFF6FF;
      color: var(--primary-navy);
      padding: 4px 10px;
      border-radius: 6px;
      height: fit-content;
      flex-shrink: 0;
    }
    .h-card h4 {
      font-size: 15px;
      font-weight: 800;
      color: var(--slate-dark);
      margin-bottom: 4px;
    }
    .h-card p {
      font-size: 12.5px;
      color: var(--slate-body);
      line-height: 1.45;
    }
    .legal-box {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px 20px;
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      gap: 14px;
      height: 100%;
    }
    .legal-tag {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-navy);
      background: #EFF6FF;
      padding: 4px 12px;
      border-radius: 6px;
      width: fit-content;
    }
    .legal-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .l-badge {
      font-size: 12px;
      font-weight: 900;
      background: #003B95;
      color: #FFFFFF;
      padding: 6px 10px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .legal-item strong {
      font-size: 14px;
      color: var(--slate-dark);
      display: block;
      margin-bottom: 2px;
    }
    .legal-item p {
      font-size: 12px;
      color: var(--slate-muted);
      line-height: 1.4;
    }

    /* ==========================================================================
       SLIDE 22: CLOSING HERO (LỜI CẢM ƠN VÀ CAM KẾT BỀN VỮNG ĐÚNG 12:00)
       ========================================================================== */
    .slide-closing-hero {
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #EFF6FF 100%);
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px 80px;
    }
    .closing-card {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .closing-emblem {
      margin-bottom: 16px;
    }
    .closing-logo-img {
      height: 95px;
      width: auto;
      filter: drop-shadow(0 6px 16px rgba(0, 59, 149, 0.2));
    }
    .closing-clock-badge {
      background: #10B981;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 20px;
      border-radius: 999px;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    .closing-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 34px;
      font-weight: 900;
      color: var(--slate-dark);
      line-height: 1.25;
      margin-bottom: 16px;
    }
    .gold-gradient-text {
      background: linear-gradient(135deg, #003B95 0%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .closing-paragraph {
      font-size: 16px;
      color: var(--slate-body);
      line-height: 1.55;
      max-width: 860px;
      margin-bottom: 28px;
    }
    .closing-contact-pills {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .contact-pill {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      padding: 10px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .c-label {
      font-size: 10.5px;
      font-weight: 800;
      color: #64748B;
      display: block;
      margin-bottom: 2px;
    }
    .c-val {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--slate-dark);
    }
    .closing-slogan {
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: var(--primary-navy);
      letter-spacing: 2px;
    }

    /* ==========================================================================
       FLOATING INTERACTIVE HUD (PRESENTATION CONTROLLER)
       ========================================================================== */
    #presenter-hud {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 999px;
      padding: 8px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      color: #FFFFFF;
    }
    .hud-btn {
      background: rgba(255, 255, 255, 0.12);
      border: none;
      color: #FFFFFF;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .hud-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
    .hud-counter {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #93C5FD;
      min-width: 80px;
      text-align: center;
    }
    .hud-select {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
    }
    .hud-select option {
      background: #0F172A;
      color: #FFFFFF;
    }
    .hud-timer {
      font-family: monospace;
      font-size: 13px;
      font-weight: 800;
      background: rgba(16, 185, 129, 0.2);
      color: #6EE7B7;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    /* Top Progress Bar */
    #progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(90deg, #003B95 0%, #2563EB 50%, #D97706 100%);
      z-index: 1001;
      transition: width 0.3s ease;
    }

    /* ==========================================================================
       PRINT SETUP FOR PLAYWRIGHT PDF EXPORT (16in x 9in EXACT FIT)
       ========================================================================== */
    @page {
      size: 16in 9in;
      margin: 0;
    }
    @media print {
      body, html {
        background: #FFFFFF !important;
        overflow: visible !important;
      }
      #deck-viewport {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        perspective: none !important;
        background: transparent !important;
      }
      .slide {
        position: relative !important;
        top: auto !important;
        left: auto !important;
        transform: none !important;
        width: 16in !important;
        height: 9in !important;
        opacity: 1 !important;
        page-break-after: always !important;
        break-after: page !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      #presenter-hud, #progress-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body class="effect-cube">

  <div id="progress-bar" style="width: 4.54%;"></div>

  <div id="deck-viewport">
    ${slides.join('\n')}
  </div>

  <!-- FLOATING PRESENTER HUD -->
  <div id="presenter-hud">
    <button class="hud-btn" id="btn-prev" title="Phím mũi tên trái hoặc PageUp">◀ Trước (←)</button>
    <div class="hud-counter" id="hud-slide-num">01 / 22</div>
    <button class="hud-btn" id="btn-next" title="Phím mũi tên phải hoặc Space hoặc PageDown">Tiếp Theo (→) ▶</button>

    <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.2);"></div>

    <label style="font-size: 11px; color: #94A3B8; font-weight: 700;">HIỆU ỨNG:</label>
    <select class="hud-select" id="effect-select">
      <option value="effect-cube">3D Cube (Xoay Hộp)</option>
      <option value="effect-push">Slide Push (Trượt Ngang)</option>
      <option value="effect-zoom">Parallax Zoom (Chiều Sâu)</option>
      <option value="effect-flip">Flip 3D (Lật Thẻ)</option>
    </select>

    <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.2);"></div>

    <div class="hud-timer" id="hud-timer" title="Đồng hồ đếm ngược 180 phút">09:00:00 (180p)</div>
    <button class="hud-btn" id="btn-fullscreen" title="Phím F hoặc F11">⛶ Toàn Màn Hình</button>
  </div>

  <script>
    // ========================================================================
    // INTERACTIVE PRESENTATION ENGINE (NAVIGATION, 3D TRANSITIONS, SHORTCUTS)
    // ========================================================================
    (function() {
      const slides = Array.from(document.querySelectorAll('.slide'));
      const totalSlides = slides.length;
      let currentIndex = 0;

      const numEl = document.getElementById('hud-slide-num');
      const progressEl = document.getElementById('progress-bar');
      const effectSelect = document.getElementById('effect-select');
      const timerEl = document.getElementById('hud-timer');

      function updateSlideClasses() {
        slides.forEach((slide, idx) => {
          slide.classList.remove('active', 'prev', 'next');
          if (idx === currentIndex) {
            slide.classList.add('active');
          } else if (idx < currentIndex) {
            slide.classList.add('prev');
          } else {
            slide.classList.add('next');
          }
        });

        const currentNum = String(currentIndex + 1).padStart(2, '0');
        const totalNum = String(totalSlides).padStart(2, '0');
        numEl.textContent = \`\${currentNum} / \${totalNum}\`;

        const pct = ((currentIndex + 1) / totalSlides) * 100;
        progressEl.style.width = \`\${pct}%\`;
      }

      function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;
        currentIndex = index;
        updateSlideClasses();
      }

      function nextSlide() {
        if (currentIndex < totalSlides - 1) {
          goToSlide(currentIndex + 1);
        }
      }

      function prevSlide() {
        if (currentIndex > 0) {
          goToSlide(currentIndex - 1);
        }
      }

      // Event Listeners for HUD Buttons
      document.getElementById('btn-next').addEventListener('click', nextSlide);
      document.getElementById('btn-prev').addEventListener('click', prevSlide);

      // Effect Selector
      effectSelect.addEventListener('change', function(e) {
        document.body.className = e.target.value;
      });

      // Fullscreen Toggle
      document.getElementById('btn-fullscreen').addEventListener('click', function() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });

      // Keyboard Navigation
      window.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
          e.preventDefault();
          nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
          e.preventDefault();
          prevSlide();
        } else if (e.key === 'Home') {
          e.preventDefault();
          goToSlide(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          goToSlide(totalSlides - 1);
        } else if (e.key === 'f' || e.key === 'F') {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      });

      // Presenter Timer (Đếm ngược 180 phút: 09h00 - 12h00)
      let totalSeconds = 180 * 60; // 3 tiếng = 10,800 giây
      setInterval(function() {
        if (totalSeconds > 0) {
          totalSeconds--;
          const hours = Math.floor(totalSeconds / 3600);
          const mins = Math.floor((totalSeconds % 3600) / 60);
          const secs = totalSeconds % 60;
          timerEl.textContent = \`\${String(hours).padStart(2, '0')}:\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;

          // Cảnh báo màu theo mốc thời gian
          if (totalSeconds < 15 * 60) {
            timerEl.style.background = 'rgba(239, 68, 68, 0.2)';
            timerEl.style.color = '#FCA5A5';
            timerEl.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          } else if (totalSeconds < 45 * 60) {
            timerEl.style.background = 'rgba(245, 158, 11, 0.2)';
            timerEl.style.color = '#FCD34D';
            timerEl.style.borderColor = 'rgba(245, 158, 11, 0.5)';
          }
        }
      }, 1000);

      // Khởi tạo slide đầu tiên
      updateSlideClasses();
    })();
  </script>
</body>
</html>`;

  const htmlPath = path.join(DOC_DIR, 'SLIDE_TRINH_BAY_THU_4_CEO1983.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✓ Đã cập nhật file HTML Slide Keynote 22 slides: ${htmlPath}`);

  // Xuất file PDF bằng Playwright Chrome (Widescreen 16:9)
  console.log('--- Đang khởi động Playwright Chrome để render file PDF Keynote 22 trang... ---');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const pdfPath = path.join(DOC_DIR, 'SLIDE_TRINH_BAY_THU_4_CEO1983.pdf');
  await page.pdf({
    path: pdfPath,
    width: '16in',
    height: '9in',
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  const stats = fs.statSync(pdfPath);
  console.log(`✓ XUẤT FILE PDF KEYNOTE 22 SLIDES THÀNH CÔNG: ${pdfPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

  // Đồng bộ sang thư mục public của Web App FE để có thể tải trực tiếp
  const feDocsDir = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');
  if (!fs.existsSync(feDocsDir)) {
    fs.mkdirSync(feDocsDir, { recursive: true });
  }
  const fePdfPath = path.join(feDocsDir, 'SLIDE_TRINH_BAY_THU_4_CEO1983.pdf');
  fs.copyFileSync(pdfPath, fePdfPath);
  console.log(`✓ Đã đồng bộ sang thư mục Web App: ${fePdfPath}`);
}

// ============================================================================
// PHẦN 2: GENERATE BẢN WORD HỌC THUỘC LÒNG CHUYÊN SÂU DÀNH CHO DIỄN GIẢ (REHEARSAL PROMPTER)
// CÂU CHỮ NGẮN GỌN, ĐANH THÉP, DỄ HỌC THUỘC LÒNG - 2 LUỒNG TRỌNG TÂM CỐT LÕI
// ============================================================================
async function generateSpeakerDocx() {
  console.log('>>> [2/2] Đang tạo file Word (.docx) KỊCH BẢN NÓI HỌC THUỘC LÒNG Ngắn Gọn Cho Diễn Giả...');

  const FONT = 'Arial';
  const COLOR_NAVY = '003B95';
  const COLOR_GOLD = 'D97706';
  const COLOR_DARK = '1E293B';
  const COLOR_MUTED = '64748B';
  const COLOR_BORDER = 'CBD5E1';
  const COLOR_BG_HEADER = '003B95';
  const COLOR_BG_GOLD_TINT = 'FFFBEB';
  const COLOR_BG_BLUE_TINT = 'EFF6FF';
  const COLOR_BG_GREEN_TINT = 'F0FDF4';

  const BORDER_LIGHT = {
    top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  };

  function createRehearsalSection(partTitle, timeRange, coreRule, verbatimLines, clickGuide) {
    const rows = [];

    // Header phân đoạn
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_HEADER },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${partTitle.toUpperCase()} (${timeRange})`,
                    bold: true,
                    size: 24,
                    color: 'FFFFFF',
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Khẩu quyết cốt lõi
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GOLD_TINT },
            borders: BORDER_LIGHT,
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '⚡ KHẨU QUYẾT HỌC THUỘC LÒNG: ',
                    bold: true,
                    size: 21,
                    color: COLOR_GOLD,
                    font: FONT,
                  }),
                  new TextRun({
                    text: coreRule,
                    bold: true,
                    size: 21,
                    color: COLOR_DARK,
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Lời nói diễn giả ngắn gọn
    const speechParagraphs = verbatimLines.map((line) => {
      const isBullet = line.startsWith('•') || line.startsWith('-');
      return new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: line,
            size: 21,
            color: isBullet ? COLOR_NAVY : COLOR_DARK,
            bold: isBullet,
            font: FONT,
          }),
        ],
      });
    });

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: BORDER_LIGHT,
            margins: { top: 140, bottom: 140, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: '🗣 LỜI NÓI DIỄN GIẢ (NÓI NGẮN GỌN, ĐANH THÉP, DỨT KHOÁT):',
                    bold: true,
                    size: 19,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                ],
              }),
              ...speechParagraphs,
            ],
          }),
        ],
      })
    );

    // Thao tác click / chạm màn hình
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_BLUE_TINT },
            borders: BORDER_LIGHT,
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '🖱 THAO TÁC MÀN HÌNH TƯƠNG ỨNG: ',
                    bold: true,
                    size: 19,
                    color: COLOR_NAVY,
                    font: FONT,
                  }),
                  new TextRun({
                    text: clickGuide,
                    size: 19,
                    color: COLOR_DARK,
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows,
    });
  }

  function createScenarioFlashcard(num, scenarioTitle, partnerQuestion, speakerResponse) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '0A1E3F' },
              margins: { top: 80, bottom: 80, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `TÌNH HUỐNG THỰC CHIẾN #${num}: ${scenarioTitle.toUpperCase()}`,
                      bold: true,
                      size: 21,
                      color: 'FFFFFF',
                      font: FONT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'FEF2F2' },
              borders: BORDER_LIGHT,
              margins: { top: 80, bottom: 80, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: '❓ Băn khoăn đối tác: ', bold: true, size: 20, color: 'B91C1C', font: FONT }),
                    new TextRun({ text: partnerQuestion, italics: true, size: 20, color: '7F1D1D', font: FONT }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' },
              borders: BORDER_LIGHT,
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: '💡 Đối đáp sắc bén (Học thuộc lòng): ', bold: true, size: 20, color: '15803D', font: FONT }),
                    new TextRun({ text: speakerResponse, bold: true, size: 20, color: '14532D', font: FONT }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'KỊCH BẢN THUYẾT TRÌNH THỨ 4 · CLB DOANH NHÂN CEO 1983 (HANOIBA)',
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    size: 18,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                  new TextRun({
                    text: ' / ',
                    size: 18,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // TIÊU ĐỀ TÀI LIỆU
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'KỊCH BẢN NÓI HỌC THUỘC LÒNG THUYẾT TRÌNH BÁO CÁO GIẢI PHÁP',
                bold: true,
                size: 32,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'HỆ SINH THÁI CÔNG NGHỆ KÉP: WEB CRM QUẢN TRỊ & MOBILE APP HỘI VIÊN',
                bold: true,
                size: 24,
                color: COLOR_GOLD,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'HỘI NGHỊ LÀM VIỆC 3 TIẾNG (09:00 – 12:00) · BẢN TÓM TẮT ĐANH THÉP DÀNH CHO DIỄN GIẢ',
                italics: true,
                size: 20,
                color: COLOR_MUTED,
                font: FONT,
              }),
            ],
          }),

          // LƯU Ý SỐNG CÒN
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GOLD_TINT },
                    borders: BORDER_LIGHT,
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '📌 3 NGUYÊN TẮC VÀNG KHI THUYẾT TRÌNH:',
                            bold: true,
                            size: 21,
                            color: COLOR_GOLD,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 60 },
                        children: [
                          new TextRun({
                            text: '1. Nói ngắn gọn, dứt khoát: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Không đọc lại từng dòng trên slide. Chỉ nói câu khẩu quyết, dẫn chứng số liệu thực tế và chỉ tay vào màn hình.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40 },
                        children: [
                          new TextRun({
                            text: '2. Khẳng định 2 luồng quan trọng nhất: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'Luồng Sự kiện gắn liền với Luồng Thanh toán tài chính thu-chi (Sổ quỹ TT200), cùng với Luồng Xúc tiến thương mại B2B là 2 trục xương sống của toàn hệ thống.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40 },
                        children: [
                          new TextRun({
                            text: '3. Góc nhìn người làm hệ thống về chức năng hỗ trợ thực tế: ',
                            bold: true,
                            size: 20,
                            font: FONT,
                          }),
                          new TextRun({
                            text: 'TUYỆT ĐỐI KHÔNG NÓI LÀ "MIỄN PHÍ". Trình bày từ góc nhìn quản lý dự án am hiểu vận hành thực tế: đội ngũ đã chủ động tích hợp sẵn Bộ công cụ hỗ trợ công việc thực tế (Lịch họp QR 30s, Kanban 6 ban, VoIP nội bộ, Moments B2B) để BĐH giải quyết ngay các bài toán thường nhật thay thế Zalo/Excel.',
                            size: 20,
                            font: FONT,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 1: KHỞI ĐỘNG & GIỚI THIỆU (09:00 - 09:10)
          createRehearsalSection(
            'Phần 1: Khởi Động Hội Nghị & Giới Thiệu Hai Bên',
            '09:00 – 09:10 (10 Phút)',
            '“Đúng 09h00 bắt đầu – 12h00 bế mạc. Thuyết trình 60p, Phản biện 45p, Chốt nghiệm thu 60p, Bàn giao 15p.”',
            [
              '“Em chào tất cả mọi người! Em xin gửi lời chào trân trọng nhất tới Ban Thường Trực, Ban Điều Hành và 6 Ban Chuyên Môn của CLB Doanh Nhân CEO 1983.”',
              '“Hôm nay, liên minh ViConnect & ViOne báo cáo giải pháp số hóa toàn diện: Web CRM Tháp chỉ huy và Mobile App Hội viên.”',
              '“Cuộc họp bắt đầu đúng 09h00 và bế mạc đúng 12h00 trưa, phân bổ khoa học:',
              '• 09h00 - 10h00: Báo cáo bối cảnh và Demo trực tiếp cả 2 nền tảng.',
              '• 10h00 - 10h45 (đến 11h kém 15): Lắng nghe ý kiến và giải đáp phản biện chuyên sâu.',
              '• 10h45 - 11h45: Lập Biên Bản Chốt Chức Năng: Cái gì chốt nghiệm thu 100%, Cái gì cần tinh chỉnh kèm deadline.',
              '• 11h45 - 12h00: Cam kết văn bản, kế hoạch tập huấn và bế mạc đúng 12h00.”',
              '“Em xin trân trọng kính mời anh Chủ tịch và các anh chị giới thiệu thành viên tham dự phía CLB để chúng em tiện xưng hô ạ!”',
            ],
            'Slide 1 (Hero) ➔ Slide 2 (Timeline). Đứng thẳng, bao quát phòng họp, mỉm cười lắng nghe khi đối tác giới thiệu.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 2: BỐI CẢNH & 2 LUỒNG TRỌNG TÂM (09:10 - 09:25)
          createRehearsalSection(
            'Phần 2: Bối Cảnh, 3 Bài Toán Gốc & 2 Luồng Trọng Tâm',
            '09:10 – 09:25 (15 Phút)',
            '“3 bài toán gốc được giải quyết bằng 2 luồng huyết mạch: Thanh toán tài chính toàn diện & Xúc tiến thương mại B2B.”',
            [
              '“Thưa các anh chị, khi nhận bài toán từ CEO 1983, chúng em đúc kết 3 nỗi đau lớn nhất:',
              '• Một là Hội viên: 500 hồ sơ phân tán trên Excel, Zalo; duyệt giấy tờ phức tạp; thiếu tấm thẻ định danh số.',
              '• Hai là Sự kiện & Tài chính: Sự kiện không chỉ là soát vé, mà gắn liền dòng tiền: Thu tiền vé, thu tài trợ, tạm ứng tổ chức, hoàn ứng và quyết toán.',
              '• Ba là Giao thương: Bài đăng trôi tin trên Zalo, chưa có công cụ đo lường giá trị giao dịch của CLB.',
              '“Từ 3 bài toán trên, giải pháp của chúng em định hình 2 LUỒNG QUAN TRỌNG NHẤT HỆ THỐNG:',
              '1. LUỒNG THANH TOÁN & TÀI CHÍNH TOÀN DIỆN: Chuỗi dòng tiền khép kín từ VietQR 1s đến Sổ Quỹ Tiền Mặt Thông tư 200.',
              '2. LUỒNG XÚC TIẾN THƯƠNG MẠI B2B: Danh thiếp vCard 1 chạm, Sàn Marketplace ưu đãi, Bảng Deal Cung - Cầu và Hẹn 1-on-1.”',
              '“Đồng thời, dưới góc nhìn của người quản lý dự án am hiểu vận hành thực tế, chúng em trang bị sẵn Bộ công cụ hỗ trợ công việc thực tế (Lịch họp QR 30s, Kanban 6 ban, VoIP nội bộ, Moments B2B) để BĐH làm việc hàng ngày mà không bị phân tán thông tin!”',
            ],
            'Slide 3 (3 Bài toán) ➔ Slide 4 (Hệ sinh thái kép) ➔ Slide 5 (Sơ đồ luồng tài chính).'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 3A: DEMO THỰC TẾ MOBILE APP HỘI VIÊN (09:25 - 09:45)
          createRehearsalSection(
            'Phần 3A: Demo Thực Tế Mobile App Hội Viên CEO 1983',
            '09:25 – 09:45 (20 Phút)',
            '“Thẻ VIP mạ vàng, Danh thiếp kép ẩn hiện SĐT riêng tư, Lưu vCard 1 chạm không cần cài app, Ví vé QR 0.1s.”',
            [
              '“Sau đây em xin chiếu màn hình điện thoại demo trực tiếp Mobile App:',
              '• 1. Đăng nhập SĐT an toàn: Chuẩn màu Deep Cobalt Navy & Warm Amber Gold sang trọng.',
              '• 2. Thẻ VIP & Danh thiếp số kép: Hỗ trợ 2 danh thiếp Primary và Secondary. CEO có thể chủ động ẩn SĐT cá nhân khi gặp đối tác bên ngoài. Đối tác quét QR lưu ngay vCard về máy mà KHÔNG CẦN CÀI APP, xem kèm Company Profile 2 trang bên dưới.',
              '• 3. Danh bạ CEO 11 ngành: Nút gọi điện, nhắn tin và Đề xuất lịch hẹn 1-on-1 đồng bộ lịch điện thoại.',
              '• 4. Sàn Marketplace B2B & Bảng Deal Cung - Cầu: Niêm yết sản phẩm ưu đãi và nhu cầu mua bán thời gian thực.',
              '• 5. Vé sự kiện QR E-Ticket: Hiện rõ số bàn số ghế VIP, check-in 0.1s, Lucky Draw và Biểu quyết đại hội số.',
              '• 6. Bộ công cụ thực tế: VoIP Call nội bộ đổ chuông native màn hình khóa khi tắt app, và Mạng xã hội Moments B2B.”',
            ],
            'Chiếu điện thoại lên máy chiếu lớn. Slide 7 (Xúc tiến B2B) ➔ Slide 8 (Thẻ VIP) ➔ Slide 10 (Vé QR).'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 3B: DEMO THỰC TẾ WEB CRM QUẢN TRỊ (09:45 - 10:00)
          createRehearsalSection(
            'Phần 3B: Demo Thực Tế Web CRM Quản Trị Trung Tâm',
            '09:45 – 10:00 (15 Phút)',
            '“Tháp chỉ huy: Dashboard 360°, Phân quyền RBAC 6 Ban, Sổ Quỹ Tiền Mặt TT200 VietQR Napas 24/7 gạch nợ 1s.”',
            [
              '“Chuyển sang màn hình máy tính Web CRM - Tháp điều khiển trung tâm:',
              '• 1. Executive Dashboard 360°: Kiểm soát thời gian thực 500+ hội viên, các sự kiện, doanh số giao thương.',
              '• 2. Thẩm định hồ sơ kết nạp 3 bước: Thư ký tiếp nhận ➔ Ban Thành viên thẩm định ➔ Thường trực duyệt cấp mã thẻ.',
              '• 3. Phân quyền RBAC 6 Ban: Ban nào chỉ thao tác đúng nghiệp vụ ban đó, Audit Log lưu vết 100% thao tác.',
              '• 4. LUỒNG TÀI CHÍNH TOÀN DIỆN & SỔ QUỸ TT 200 (MẪU S07-DN): VietQR Napas gạch nợ sau 1s. Quản lý thu phí, tạm ứng cho ban sự kiện, hoàn ứng tiền thừa, quyết toán thực chi. Đọc số tiền bằng chữ và xuất file Excel chuẩn mực nộp HanoiBA.',
              '• 5. Công cụ thực tế BĐH: Lịch họp số Sapphire Hub điểm danh QR động 30s chống gian lận, Bảng giao việc Kanban 6 Ban.”',
            ],
            'Chuyển máy tính Web CRM. Slide 6 (Sổ Quỹ TT200) ➔ Slide 12 (Lịch họp) ➔ Slide 13 (Kanban) ➔ Slide 16 (Dashboard) ➔ Slide 17 (RBAC).'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 4: ĐỐI THOẠI PHẢN BIỆN (10:00 - 10:45)
          createRehearsalSection(
            'Phần 4: Nhận Xét Từ Đối Tác & Đối Thoại Phản Biện Sâu',
            '10:00 – 10:45 (Đến 11h Kém 15 - 45 Phút)',
            '“Lắng nghe không ngắt lời. Áp dụng 4 bước: Đồng cảm ➔ Dẫn chứng kỹ thuật ➔ Cam kết ➔ Xác nhận hài lòng.”',
            [
              '“Đúng 10h00 sáng, em xin phép bước sang phần quan trọng nhất: Lắng nghe ý kiến của các anh chị.”',
              '“Từ bây giờ đến 10h45 (11h kém 15), chúng em dành trọn 45 phút để anh Chủ tịch và 6 Ban Chuyên Môn nhận xét và đặt câu hỏi phản biện.”',
              '“Mọi ý kiến của các anh chị là căn cứ thực tế nhất để chúng em hoàn thiện sản phẩm đạt chuẩn cao nhất cho CLB.”',
              '“Em xin trân trọng kính mời anh Chủ tịch, chị Tổng thư ký và các anh chị Trưởng Ban chia sẻ ạ!”',
            ],
            'Slide 19 (10 Tình huống thực chiến). Mở sổ tay ghi chép cẩn thận từng ý kiến của BĐH.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 5: CHỐT NGHIỆM THU: CÁI GÌ CHỐT, CÁI GÌ SỬA (10:45 - 11:45)
          createRehearsalSection(
            'Phần 5: Biên Bản Đánh Giá Cuộc Họp: Cái Gì Chốt, Cái Gì Sửa',
            '10:45 – 11:45 (Tròn 60 Phút)',
            '“Phải chốt được 100% chức năng đã làm. Phân định rõ 3 danh mục: Chốt nghiệm thu, Cần sửa, Lộ trình tương lai.”',
            [
              '“Hiện tại là 10h45 (11h kém 15). Chúng ta bước vào phần quyết định: LẬP BIÊN BẢN CHỐT CHỨC NĂNG.”',
              '“Nguyên tắc làm việc của chúng em rất sòng phẳng và minh bạch:',
              '• 1. DANH MỤC 1: CÁC CHỨC NĂNG ĐÃ HOÀN THÀNH ➔ CHỐT NGHIỆM THU 100% (12 module cốt lõi và công cụ thực tế).',
              '• 2. DANH MỤC 2: CÁC NỘI DUNG CẦN TINH CHỈNH ➔ Ghi nhận chi tiết, có người phụ trách và cam kết hoàn thành trong 3 - 5 ngày.',
              '• 3. DANH MỤC 3: ĐỀ XUẤT MỞ RỘNG ➔ Đưa vào lộ trình R&D tương lai nâng cấp tự động qua Cloud OTA (AI Voice, AI Matching).”',
              '“Em xin phép chiếu trực tiếp Biên Bản lên màn hình để hai bên cùng đối soát và ký xác nhận tại chỗ ạ!”',
            ],
            'Slide 20 (Biên bản chốt). Mở file Biên bản trên màn hình lớn để điền trực tiếp cùng BĐH.'
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // PHẦN 6: KẾ HOẠCH BÀN GIAO & BẾ MẠC ĐÚNG 12:00 (11:45 - 12:00)
          createRehearsalSection(
            'Phần 6: Kế Hoạch Bàn Giao, Cam Kết Văn Bản & Bế Mạc Đúng 12:00',
            '11:45 – 12:00 (15 Phút)',
            '“Gửi biên bản trong 24h, Action plan trong 48h, tập huấn 30p, bế mạc đúng 12h00 trưa.”',
            [
              '“Kính thưa các anh chị, để đảm bảo tính pháp lý và cam kết trách nhiệm cao nhất:',
              '• Trong vòng 24 giờ: Chúng em gửi lại Biên Bản Họp có đầy đủ chữ ký hai bên.',
              '• Trong vòng 48 giờ: Chúng em gửi Văn Bản Kế Hoạch Chỉnh Sửa Chi Tiết (Action Plan) cho Danh mục 2.',
              '• Trong vòng 03 ngày: Bàn giao trọn bộ tài liệu HDSD chuẩn hóa (PDF & Video clip 60s).',
              '• Lộ trình bàn giao: Tổ chức 01 buổi tập huấn 30 phút cho Ban Thư ký & 6 Ban ➔ BĐH dùng thử 3-5 ngày ➔ Phát động 500+ hội viên.”',
              '“Đồng hồ hiện tại vừa đúng 12h00 trưa! Thay mặt liên minh ViConnect & ViOne, em xin trân trọng cảm ơn anh Chủ tịch và toàn thể Ban Điều Hành đã dành trọn vẹn buổi sáng làm việc nghiêm túc, trách nhiệm và thành công tốt đẹp!”',
            ],
            'Slide 21 (Bàn giao) ➔ Slide 22 (Lời cảm ơn). Cúi đầu chào trân trọng, bắt tay lãnh đạo kết thúc lúc 12:00.'
          ),

          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'BỘ 10 TÌNH HUỐNG THỰC CHIẾN ĐỐI ĐÁP SẮC BÉN DÀNH CHO DIỄN GIẢ',
                bold: true,
                size: 24,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: 'Học thuộc lòng câu trả lời mẫu ngắn gọn 3-4 câu dưới đây để làm chủ khán phòng trong khung giờ 10:00 - 10:45:',
                italics: true,
                size: 20,
                color: COLOR_MUTED,
                font: FONT,
              }),
            ],
          }),

          // 10 TÌNH HUỐNG THỰC CHIẾN
          createScenarioFlashcard(
            1,
            'Ban Thành Viên - Bảo Mật Số Điện Thoại Cá Nhân',
            '“Hội viên là lãnh đạo doanh nghiệp, rất sợ bị lộ số điện thoại cho bảo hiểm, bất động sản gọi phiền.”',
            '“Dạ hệ thống trang bị cơ chế Danh thiếp số kép. CEO có quyền tắt hiển thị SĐT cá nhân trên thẻ. Người ngoài quét mã QR chỉ thấy tên, chức danh và logo doanh nghiệp, hoàn toàn không thấy số điện thoại. Danh bạ toàn thể 500+ CEO được bảo vệ khép kín, chỉ tài khoản hội viên được Ban Thành Viên phê duyệt mới đăng nhập tra cứu được ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            2,
            'Ban Sự Kiện - Soát Vé Gala Khi Tầng Hầm Mất Sóng 4G',
            '“Sự kiện 500 khách ở tầng hầm khách sạn hay mất sóng, app có bị đơ không? Có ùn tắc không?”',
            '“Dạ ứng dụng Gatekeeper của chúng em có bộ nhớ đệm Local Offline Cache. Toàn bộ danh sách vé được tải sẵn về máy trước giờ G. Tốc độ quét mã QR chỉ đúng 0.1 giây. Mất mạng hoàn toàn máy vẫn bíp check-in bình thường, hiện rõ số bàn số ghế VIP để lễ tân dẫn khách và tự đồng bộ lên mây khi có sóng trở lại ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            3,
            'Ban Xúc Tiến - Sàn Marketplace So Với Nhóm Zalo',
            '“Doanh nghiệp quen đăng bài lên Zalo CLB. Đưa lên App thì hơn gì? Đo lường giao thương thế nào?”',
            '“Dạ Zalo bị trôi tin sau vài tiếng và không phân loại ngành. Sàn Marketplace trên App lưu trữ vĩnh viễn theo 11 ngành nghề kèm ưu đãi nội bộ; Bảng Deal Cung - Cầu ghi nhận giá trị thương vụ thời gian thực; và hệ thống có form báo cáo Deal Value để Ban Xúc tiến thống kê hàng tháng CLB đã giao thương được bao nhiêu tỷ đồng nộp HanoiBA ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            4,
            'Ban Tài Chính - Dòng Tiền & VietQR Napas 24/7',
            '“Hội viên nộp hội phí hoặc mua vé sự kiện qua QR, tiền về đâu? Kế toán có phải rà sao kê không?”',
            '“Dạ ViConnect KHÔNG BAO GIỜ giữ tiền của CLB. Tiền chảy thẳng 100% về tài khoản chính thức của CLB CEO 1983 tại ngân hàng. Cổng VietQR Napas tự động gạch nợ sau 1 giây và xuất Sổ Quỹ Tiền Mặt chuẩn Thông tư 200 (Mẫu S07-DN). Kế toán chỉ cần bấm 1 click là xuất trọn vẹn file Excel đối soát thu chi nộp HanoiBA ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            5,
            'Ban Truyền Thông - Dung Lượng Ảnh & Phân Quyền Đăng Tin',
            '“Sau Gala có hàng nghìn ảnh nét căng và video phóng sự, hệ thống có bị nặng không? Ai được đăng tin?”',
            '“Dạ bài viết trên App cho phép gắn trực tiếp link Kho ảnh gốc Google Drive dung lượng cao để hội viên tải ảnh nét căng, còn trên App hệ thống tối ưu ảnh hiển thị siêu nhẹ lướt mượt. Về phân quyền: Chỉ tài khoản Ban Truyền Thông mới được đăng và duyệt tin tức; hội viên chỉ tương tác văn minh trên Moments B2B ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            6,
            'Ban Thư Ký - Quy Trình Thẩm Định Duyệt Hội Viên',
            '“Hội viên nộp đơn online thì duyệt thế nào? Có sợ duyệt nhầm hoặc không biết ai duyệt không?”',
            '“Dạ quy trình duyệt tuân thủ chuẩn 3 bước: Bước 1 Thư ký tiếp nhận kiểm tra sơ bộ; Bước 2 Ban Thành viên thẩm định pháp nhân doanh nghiệp; Bước 3 Thường trực bấm duyệt cấp mã CEO-83xxx. Hệ thống lưu Audit Log chi tiết: ai duyệt, mấy giờ mấy phút, đảm bảo kỷ luật và minh bạch tuyệt đối ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            7,
            'Chủ Tịch CLB - Cam Kết Chi Phí & Đồng Hành Lâu Dài',
            '“Sau này có thu phí duy trì cao không? Các công cụ hỗ trợ thực tế có bị cắt đi hoặc bắt mua thêm không?”',
            '“Dạ đây là cam kết chiến lược của ViConnect: Chúng em coi CEO 1983 là mô hình kiểu mẫu của HanoiBA. Toàn bộ các chức năng đã xây dựng và Bộ công cụ thực tế (Lịch họp QR 30s, Kanban, VoIP, Moments, VietQR) được bàn giao sử dụng vĩnh viễn, KHÔNG BAO GIỜ phát sinh chi phí bản quyền hay cắt bớt tính năng. ViConnect bảo hành kỹ thuật 24/7 cho CLB ạ!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            8,
            'Xử Lý Scope Creep - Đối Tác Đề Xuất Tính Năng Ngoài Phạm Vi',
            '“Một Trưởng ban hào hứng yêu cầu làm thêm chức năng quản lý nhân sự chấm công nội bộ cho doanh nghiệp...”',
            '“Dạ ý tưởng của anh/chị rất hay cho quản trị doanh nghiệp riêng lẻ. Tuy nhiên, để hệ thống tập trung đúng tôn chỉ hiệp hội là Kết Nối & Giao Thương và bàn giao đúng tiến độ, em xin phép ghi nhận tính năng này vào Danh mục 3 trong lộ trình R&D tương lai. Hôm nay chúng ta cùng tập trung chốt nghiệm thu các tính năng cốt lõi đang có để sớm đưa app đến tay 500 hội viên sinh hoạt ạ!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            9,
            'Xử Lý Góp Ý Giao Diện - Phàn Nàn Chi Tiết Chưa Đúng Ý',
            '“Trưởng ban nhận xét: ‘Cái màu nút này tôi chưa ưng, hoặc form này nên bỏ bớt 1 trường nhập...’”',
            '“Dạ góp ý của anh/chị rất tinh tế và thực tế! Phần mềm sinh ra là để phục vụ các anh chị thuận tiện nhất. Em xin phép ghi ngay chi tiết này vào Danh mục 2: Các nội dung cần tinh chỉnh trong biên bản hôm nay. Đội ngũ kỹ thuật cam kết điều chỉnh hoàn tất trong vòng 3 ngày làm việc và gửi bản cập nhật để anh/chị nghiệm thu ạ!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            10,
            'Ban Thường Trực - Trách Nhiệm Gửi Văn Bản Sau Họp',
            '“Hôm nay nói rất hay, nhưng sau cuộc họp ai là người chịu trách nhiệm gửi lại văn bản và theo dõi tiến độ?”',
            '“Dạ em - [Họ tên diễn giả], Trưởng đại diện Đội ngũ Triển khai ViConnect, cùng lãnh đạo ViConnect trực tiếp chịu trách nhiệm trước Ban Thường Trực. Ngay trong ngày mai, chúng em gửi Biên bản họp chính thức qua email và văn bản giấy có dấu đỏ cho Ban Thư Ký. Mọi tiến độ cập nhật sẽ được báo cáo liên tục hàng ngày cho đến khi phát động hoàn tất ạ!”'
          ),
        ],
      },
    ],
  });

  const docxPath = path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx');
  const buffer = await Packer.toBuffer(doc);
  let savedPath = docxPath;
  try {
    fs.writeFileSync(docxPath, buffer);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.warn(`[WARN] File ${docxPath} đang được mở bởi ứng dụng khác. Đang lưu sang file thay thế...`);
      savedPath = path.join(DOC_DIR, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983_MOI.docx');
      fs.writeFileSync(savedPath, buffer);
    } else {
      throw err;
    }
  }
  const stats = fs.statSync(savedPath);
  console.log(`✓ XUẤT FILE WORD (.DOCX) LỜI THOẠI HỌC THUỘC LÒNG THÀNH CÔNG: ${savedPath} (${(stats.size / 1024).toFixed(1)} KB)`);

  const feDocsDir = path.join(ROOT_DIR, 'apps', 'ceo1983_app_fe', 'public', 'docs');
  if (fs.existsSync(feDocsDir)) {
    try {
      fs.copyFileSync(savedPath, path.join(feDocsDir, 'KICH_BAN_LOI_NOI_HOC_THUOC_THUYET_TRINH_CEO1983.docx'));
    } catch (_) {}
  }
}

async function main() {
  console.log('====================================================================');
  console.log('>>> BẮT ĐẦU TẠO BỘ TÀI LIỆU SLIDE KEYNOTE SỰ KIỆN & FILE WORD HỌC THUỘC <<<');
  console.log('====================================================================');
  await generateSlidePdf();
  await generateSpeakerDocx();
  console.log('====================================================================');
  console.log('>>> HOÀN TẤT 100%! BỘ TÀI LIỆU SỰ KIỆN ĐÃ ĐƯỢC TẠO XONG TẠI document/ <<<');
  console.log('====================================================================');
}

main().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
