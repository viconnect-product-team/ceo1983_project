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
// PHẦN 1: GENERATE SLIDE PRESENTATION HTML & XUẤT RA FILE PDF CHUẨN KEYNOTE / SỰ KIỆN PR (24 SLIDES)
// ============================================================================
async function generateSlidePdf() {
  console.log('>>> [1/2] Đang tạo Slide Trình Chiếu Chuẩn Keynote Sự Kiện & PR Sản Phẩm 24 Trang (09h00-12h00)...');

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

  // Ảnh cho các tính năng Bonus
  const imgChatCall = getBase64Image(path.join(IMG_EVIDENCE_DIR, '09_app_chat_call_messenger_bubble.png'));
  const imgCrmMeetings = getBase64Image(path.join(IMG_CRM_DIR, '15_quan_ly_lich_hop.png'));
  const imgCrmTasks = getBase64Image(path.join(IMG_CRM_DIR, '17_giao_viec_nhiem_vu_kanban.png'));
  const imgNetworkChat = getBase64Image(path.join(IMG_CRM_DIR, '23_tin_nhan_trao_doi_network.png'));

  // Ảnh CRM
  const imgCrmDashboard = getBase64Image(path.join(IMG_CRM_DIR, '02_dashboard_tong_quan.png'));
  const imgCrmMembers = getBase64Image(path.join(IMG_CRM_DIR, '08_quan_ly_hoi_vien.png'));
  const imgCrmRbac = getBase64Image(path.join(IMG_CRM_DIR, '07_ma_tran_phan_quyen_rbac.png'));
  const imgCrmSeating = getBase64Image(path.join(IMG_CRM_DIR, '12_so_do_khan_phong_ban_tiec.png'));
  const imgCrmEvents = getBase64Image(path.join(IMG_CRM_DIR, '10_quan_tri_su_kien.png'));
  const imgCrmFinance = getBase64Image(path.join(IMG_CRM_DIR, '19_quan_ly_so_quy_thu_chi.png'));
  const imgCrmFees = getBase64Image(path.join(IMG_CRM_DIR, '20_quan_ly_hoi_phi_hoa_don.png'));

  const slides = [
    // SLIDE 1: KEYNOTE HERO OPENING (DARK LUXURY PR LAUNCH)
    `
    <div class="slide keynote-dark">
      <div class="ambient-glow glow-top"></div>
      <div class="ambient-glow glow-bottom"></div>
      <div class="launch-badge">
        <span class="pulse-dot"></span>
        HANOIBA × VICONNECT PLATFORM · SPECIAL PRODUCT LAUNCH 2026
      </div>
      <h1 class="keynote-hero-title">
        HỆ SINH THÁI CÔNG NGHỆ KÉP<br>
        <span class="gold-gradient-text">CLB DOANH NHÂN CEO 1983</span>
      </h1>
      <p class="keynote-hero-subtitle">
        CÔNG BỐ & BÁO CÁO GIẢI PHÁP SỐ HÓA TOÀN DIỆN: <strong>WEB CRM QUẢN TRỊ TRUNG TÂM</strong> & <strong>MOBILE APP HỘI VIÊN ĐẶC QUYỀN</strong>
      </p>
      
      <div class="keynote-meta-container">
        <div class="keynote-pill">
          <div class="pill-label">KHUNG GIỜ LÀM VIỆC</div>
          <div class="pill-value">09:00 – 12:00 (Tròn 3 Tiếng)</div>
        </div>
        <div class="keynote-pill">
          <div class="pill-label">ĐƠN VỊ TRIỂN KHAI</div>
          <div class="pill-value">Liên Minh ViConnect & ViOne</div>
        </div>
        <div class="keynote-pill">
          <div class="pill-label">ĐỐI TÁC TRỌNG TÂM</div>
          <div class="pill-value">Ban Thường Trực & BĐH CEO 1983</div>
        </div>
      </div>
      <div class="keynote-slogan">"BẢN LĨNH – TIÊN PHONG – KẾT NỐI – PHÁT TRIỂN"</div>
    </div>
    `,

    // SLIDE 2: 3-HOUR KEYNOTE TIMELINE ROADMAP
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">PHẦN 1 · KHỞI ĐỘNG HỘI NGHỊ</div>
        <div class="slide-code">AGENDA 3 TIẾNG (09:00 – 12:00)</div>
      </div>
      <h2 class="slide-main-heading">CHƯƠNG TRÌNH LÀM VIỆC & LỘ TRÌNH ĐÁNH GIÁ 3 TIẾNG</h2>
      <p class="slide-sub-heading">Tối ưu hiệu quả từng phút · Tách bạch rõ ràng thời gian thuyết trình, phản biện và chốt nghiệm thu</p>
      
      <div class="keynote-timeline-grid">
        <div class="timeline-card">
          <div class="time-header">09:00 – 09:10 (10p)</div>
          <div class="phase-title">1. Khởi Động & Giới Thiệu</div>
          <p>Chào mừng đại biểu, giới thiệu đoàn công tác ViConnect - ViOne và Ban Thường Trực CEO 1983.</p>
        </div>
        <div class="timeline-card">
          <div class="time-header">09:10 – 09:25 (15p)</div>
          <div class="phase-title">2. Bối Cảnh & 3 Trụ Cột</div>
          <p>Phân tích 3 bài toán gốc, kiến trúc giải pháp kép và công bố 3 trụ cột tính năng ViConnect.</p>
        </div>
        <div class="timeline-card highlight-card">
          <div class="time-header gold-bg">09:25 – 09:45 (20p)</div>
          <div class="phase-title">3A. Live Demo Mobile App</div>
          <p>Thao tác trực tiếp trên điện thoại: Thẻ VIP mạ vàng, Danh thiếp số kép, Sàn B2B, Vé QR, VoIP & AI Voice.</p>
        </div>
        <div class="timeline-card highlight-card">
          <div class="time-header navy-bg">09:45 – 10:00 (15p)</div>
          <div class="phase-title">3B. Live Demo Web CRM</div>
          <p>Tháp chỉ huy: Dashboard 360°, Phân quyền RBAC 6 Ban, Cinema Map, Sapphire Hub & Kế toán VietQR.</p>
        </div>
        <div class="timeline-card alert-card">
          <div class="time-header orange-bg">10:00 – 10:45 (45p)</div>
          <div class="phase-title">3. Đối Thoại & Phản Biện</div>
          <p><strong>Đến 11h kém 15:</strong> Lắng nghe ý kiến của Chủ tịch, Ban Thường Trực & 6 Ban. Giải đáp 10 tình huống thực chiến.</p>
        </div>
        <div class="timeline-card success-card">
          <div class="time-header green-bg">10:45 – 11:45 (60p)</div>
          <div class="phase-title">4. Đánh Giá Tổng Kết Chốt</div>
          <p><strong>"Cái gì chốt – Cái gì sửa":</strong> Chốt 100% nghiệm thu 12 module đã làm. Ghi nhận các điểm sửa kèm deadline.</p>
        </div>
        <div class="timeline-card">
          <div class="time-header">11:45 – 12:00 (15p)</div>
          <div class="phase-title">5. Cam Kết Văn Bản & Bế Mạc</div>
          <p>Cam kết gửi biên bản trong 24h - 48h, kế hoạch tập huấn 3 giai đoạn và bế mạc đúng 12:00 trưa.</p>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 02 / 24</div>
    </div>
    `,

    // SLIDE 3: 3 BÀI TOÁN GỐC & BƯỚC NGOẶT CHUYỂN ĐỔI SỐ
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">PHẦN 2 · BỐI CẢNH & THẤU HIỂU NỖI ĐAU</div>
        <div class="slide-code">THE 3 BIG CHALLENGES</div>
      </div>
      <h2 class="slide-main-heading">3 BÀI TOÁN GỐC CỦA CEO 1983 & GIẢI PHÁP ĐỘT PHÁ VICONNECT</h2>
      <p class="slide-sub-heading">Chấm dứt hoàn toàn phương thức thủ công rời rạc · Số hóa triệt để 100% bằng công nghệ hiệp hội chuyên sâu</p>
      
      <div class="three-columns-hero">
        <div class="hero-column-card">
          <div class="col-icon">👥</div>
          <div class="problem-badge">NỖI ĐAU 1 · HỘI VIÊN</div>
          <h3 class="col-title">Quản Trị 500+ Hội Viên</h3>
          <div class="old-way">
            <span class="cross-icon">✕</span> Dữ liệu phân tán Excel, Zalo; duyệt hồ sơ giấy tờ phức tạp; không có định danh số xứng tầm CEO.
          </div>
          <div class="new-way">
            <span class="check-icon">✓</span> <strong>Hồ sơ số 360°</strong>, định danh CEO-83xxx, Thẻ VIP mạ vàng & Danh thiếp số kép 1 chạm lưu vCard.
          </div>
        </div>
        <div class="hero-column-card">
          <div class="col-icon">🎪</div>
          <div class="problem-badge">NỖI ĐAU 2 · SỰ KIỆN</div>
          <h3 class="col-title">Tổ Chức Sự Kiện Gala</h3>
          <div class="old-way">
            <span class="cross-icon">✕</span> Gala 500 khách ùn tắc sảnh tiếp đón; sơ đồ bàn ghế lộn xộn; kiểm phiếu biểu quyết mất 2 - 3 giờ.
          </div>
          <div class="new-way">
            <span class="check-icon">✓</span> <strong>Soát vé Gatekeeper 0.1s</strong> Offline Cache, sơ đồ Cinema Map kéo thả, Biểu quyết số 1 người 1 phiếu.
          </div>
        </div>
        <div class="hero-column-card">
          <div class="col-icon">🤝</div>
          <div class="problem-badge">NỖI ĐAU 3 · GIAO THƯƠNG</div>
          <h3 class="col-title">Xúc Tiến Thương Mại B2B</h3>
          <div class="old-way">
            <span class="cross-icon">✕</span> Bài đăng bán hàng trôi tin trên Zalo, khó tìm kiếm; chưa có công cụ kết nối 1-on-1 chính danh.
          </div>
          <div class="new-way">
            <span class="check-icon">✓</span> <strong>Sàn Marketplace B2B</strong> ưu đãi nội bộ, Bảng Deal Cung-Cầu thời gian thực, Lịch hẹn B2B 1-on-1.
          </div>
        </div>
      </div>
      
      <div class="event-gift-banner">
        🎁 <strong>ĐẶC QUYỀN ĐỒNG HÀNH TỪ VICONNECT:</strong> Không dừng lại ở 3 yêu cầu trên, ViConnect còn trang bị thêm <strong>Hệ tính năng BONUS giá trị gia tăng (Đã có sẵn & Đang phát triển)</strong> giúp CLB CEO 1983 dẫn đầu HanoiBA!
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 03 / 24</div>
    </div>
    `,

    // SLIDE 4: DUAL ARCHITECTURE KEYNOTE SHOWCASE
    `
    <div class="slide keynote-dark">
      <div class="ambient-glow glow-top"></div>
      <div class="slide-top-bar dark-top-bar">
        <div class="launch-badge-sm">DUAL PLATFORM ARCHITECTURE</div>
        <div class="slide-code-dark">REAL-TIME CLOUD SYNC</div>
      </div>
      <h2 class="keynote-heading-white">HỆ SINH THÁI CÔNG NGHỆ KÉP: WEB CRM & MOBILE APP</h2>
      <p class="keynote-desc-gray">Đồng bộ dữ liệu thời gian thực 2 chiều trên nền tảng đám mây bảo mật cao cấp ViConnect Platform</p>
      
      <div class="dual-platform-grid">
        <div class="platform-glass-card">
          <div class="platform-tag gold-tag">VĂN PHÒNG BỎ TÚI CỦA 500+ CEO</div>
          <h3 class="platform-title">📱 1. Mobile App Hội Viên CEO 1983</h3>
          <p class="platform-summary">Trải nghiệm di động chuẩn nhận diện Deep Cobalt Navy & Warm Amber Gold dành riêng cho các chủ doanh nghiệp:</p>
          <div class="feature-capsule-list">
            <div class="capsule">🏆 Thẻ VIP Mạ Vàng & Danh thiếp số kép (QR vCard 1 chạm)</div>
            <div class="capsule">👥 Danh bạ 500+ CEO 11 ngành nghề & Đặt lịch hẹn 1-on-1</div>
            <div class="capsule">🛒 Sàn B2B Marketplace & Bảng cơ hội giao thương thời gian thực</div>
            <div class="capsule">🎟 Ví vé QR E-Ticket, Cinema Map & Biểu quyết đại hội số</div>
          </div>
        </div>
        
        <div class="platform-glass-card">
          <div class="platform-tag blue-tag">THÁP ĐIỀU KHIỂN TRUNG TÂM</div>
          <h3 class="platform-title">💻 2. Web CRM Quản Trị Chuyên Sâu</h3>
          <p class="platform-summary">Công cụ điều hành phân quyền nghiêm ngặt dành cho Ban Thường Trực, Ban Thư Ký và 6 Ban Chuyên Môn:</p>
          <div class="feature-capsule-list">
            <div class="capsule">📊 Executive Dashboard 360° đo lường sức khỏe CLB</div>
            <div class="capsule">🛡 Thẩm định hồ sơ kết nạp 3 bước & Phân quyền RBAC 6 Ban</div>
            <div class="capsule">🎭 Sơ đồ ghế Cinema Map kéo thả & Gatekeeper QR 0.1s Offline</div>
            <div class="capsule">💳 Tự động hóa Kế toán VietQR Napas 24/7 gạch nợ tức thời 1s</div>
          </div>
        </div>
      </div>
      <div class="slide-footer dark-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 04 / 24</div>
    </div>
    `,

    // SLIDE 5: 3 TRỤ CỘT TÍNH NĂNG (KEYNOTE BREAKDOWN)
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">PHÂN ĐỊNH CHIẾN LƯỢC SẢN PHẨM</div>
        <div class="slide-code">THE 3-PILLAR FRAMEWORK</div>
      </div>
      <h2 class="slide-main-heading">BẢN ĐỒ TOÀN CẢNH HỆ TÍNH NĂNG THEO 3 TRỤ CỘT</h2>
      <p class="slide-sub-heading">Phân định minh bạch giữa tính năng hoàn thành 100%, tính năng tặng kèm dùng ngay và lộ trình R&D tương lai</p>
      
      <div class="three-pillars-showcase">
        <div class="pillar-box pillar-navy">
          <div class="pillar-header">
            <span class="pillar-badge tag-navy">TRỤ CỘT 1 · HOÀN THÀNH 100%</span>
            <h3>3 Yêu Cầu Gốc CEO 1983</h3>
          </div>
          <ul class="pillar-points">
            <li><strong>Đăng ký & Đăng nhập</strong> bảo mật SĐT.</li>
            <li><strong>Thẻ VIP mạ vàng & Danh thiếp số kép</strong> (vCard 1 chạm, Company Profile 2 trang).</li>
            <li><strong>Danh bạ 500 CEO</strong> & Hẹn 1-on-1 đồng bộ lịch.</li>
            <li><strong>Sàn Marketplace B2B</strong> & Bảng Deal thời gian thực.</li>
            <li><strong>Vé QR E-ticket</strong>, Cinema Map & Biểu quyết số.</li>
            <li><strong>Web CRM Dashboard 360°</strong> & RBAC 6 Ban.</li>
          </ul>
          <div class="pillar-bottom-label">✔ ĐÃ SẴN SÀNG CHỐT NGHIỆM THU</div>
        </div>

        <div class="pillar-box pillar-emerald">
          <div class="pillar-header">
            <span class="pillar-badge tag-emerald">TRỤ CỘT 2 · TẶNG KÈM DÙNG NGAY</span>
            <h3>Bonus ViConnect Có Sẵn</h3>
          </div>
          <ul class="pillar-points">
            <li><strong>VoIP Gọi nền Native Push Call</strong> (chuông reo màn hình khóa kể cả khi tắt app).</li>
            <li><strong>Khoảnh khắc Doanh nhân (Moments B2B)</strong> chia sẻ lễ ký kết, giải thưởng, thành tựu.</li>
            <li><strong>Lịch họp số Sapphire Hub</strong> chống trùng lịch, điểm danh QR động 30s.</li>
            <li><strong>Giao việc Kanban 6 Ban</strong> theo dõi deadline.</li>
            <li><strong>Kế toán VietQR Napas 24/7</strong> gạch nợ 1s, xuất Excel chuẩn mẫu nộp HanoiBA.</li>
          </ul>
          <div class="pillar-bottom-label emerald-label">🎁 HOÀN TOÀN MIỄN PHÍ BẢN QUYỀN</div>
        </div>

        <div class="pillar-box pillar-gold">
          <div class="pillar-header">
            <span class="pillar-badge tag-gold">TRỤ CỘT 3 · LỘ TRÌNH R&D TƯƠNG LAI</span>
            <h3>Bonus ViConnect Đang Làm</h3>
          </div>
          <ul class="pillar-points">
            <li><strong>Trợ lý AI Voice tiếng Việt</strong> nhận diện giọng nói, điều khiển rảnh tay khi lái xe ô tô.</li>
            <li><strong>Thuật toán AI Smart Deal Matching</strong> tự động ghép cặp cung - cầu B2B các thương vụ lớn.</li>
            <li><strong>Mạng lưới Liên minh Đa Hiệp Hội</strong> kết nối giao thương chéo CEO 1982, 1984...</li>
            <li><strong>Nâng cấp qua Cloud OTA</strong> tự động cho CLB không gián đoạn hoạt động.</li>
          </ul>
          <div class="pillar-bottom-label gold-label">🚀 NÂNG CẤP TỰ ĐỘNG QUA MẠNG</div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 05 / 24</div>
    </div>
    `,

    // SLIDE 6: MOBILE APP · ONBOARDING & LOGIN
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">MOBILE APP · PHÂN HỆ HỘI VIÊN</div>
        <div class="slide-code">01 / AUTHENTICATION & SECURITY</div>
      </div>
      <h2 class="slide-main-heading">QUY TRÌNH ĐĂNG KÝ, ĐĂNG NHẬP & BẢO MẬT HỘI VIÊN</h2>
      <p class="slide-sub-heading">Gia nhập trực tuyến chuẩn hóa · Định danh chính danh theo giấy phép ĐKKD doanh nghiệp</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Cổng Gia Nhập Trực Tuyến Tự Động</h4>
              <p>Doanh nhân nộp hồ sơ xét duyệt trực tiếp từ Landing Page, đính kèm giấy phép ĐKKD và thông tin công ty an toàn.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Đăng Nhập Bảo Mật & Tiện Lợi</h4>
              <p>Đăng nhập bằng Số điện thoại hoặc Mã số hội viên chính thức <strong>CEO-83xxx</strong>. Hỗ trợ mở khóa nhanh bằng sinh trắc học FaceID / Vân tay.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Cập Nhật Năng Lực Doanh Nghiệp Chủ Động</h4>
              <p>Hội viên dễ dàng thay đổi ảnh đại diện, logo công ty, tải lên Company Profile 2 trang phục vụ kết nối giao thương B2B.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame"><img src="${imgMobileRegister}" alt="Đăng ký gia nhập" /><div class="frame-tag">Đăng Ký Online</div></div>
          <div class="phone-frame"><img src="${imgMobileLogin}" alt="Đăng nhập mobile" /><div class="frame-tag">Đăng Nhập Hội Viên</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 06 / 24</div>
    </div>
    `,

    // SLIDE 7: MOBILE APP · HOME & NEWS
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">MOBILE APP · PHÂN HỆ HỘI VIÊN</div>
        <div class="slide-code">02 / HOME & COMMUNITY HUB</div>
      </div>
      <h2 class="slide-main-heading">TRANG CHỦ ĐIỀU HÀNH, BẢN TIN NỘI BỘ & KHO VĂN KIỆN SỐ</h2>
      <p class="slide-sub-heading">Nắm trọn nhịp đập hoạt động của câu lạc bộ mọi lúc mọi nơi trên chiếc điện thoại di động</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Bản Tin Hoạt Động Thời Gian Thực</h4>
              <p>Cập nhật tức thời các thông báo chính thức của HanoiBA và CLB 1983. Bấm mở bài viết xem hình ảnh, video chất lượng cao mà không bị lỗi trang.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Kho Văn Kiện & Tài Liệu Pháp Lý Số</h4>
              <p>Tra cứu điều lệ CLB, biên bản họp BCH, mẫu đề xuất kết nối giao thương 24/7 mà không sợ thất lạc hay trôi file.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Phím Tắt Điều Hướng 1 Chạm</h4>
              <p>Truy cập siêu tốc vào Danh bạ 500 CEO, Sự kiện sắp diễn ra, Sàn Marketplace và Lịch hẹn giao thương B2B.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame"><img src="${imgMobileHome}" alt="Trang chủ mobile" /><div class="frame-tag">Trang Chủ App</div></div>
          <div class="phone-frame"><img src="${imgMobileNews}" alt="Bản tin hoạt động" /><div class="frame-tag">Bản Tin & Sự Kiện</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 07 / 24</div>
    </div>
    `,

    // SLIDE 8: THẺ VIP MẠ VÀNG & DANH THIẾP SỐ KÉP (KEYNOTE SHOWSTOPPER SLIDE)
    `
    <div class="slide keynote-dark gold-border-slide">
      <div class="ambient-glow glow-gold"></div>
      <div class="slide-top-bar dark-top-bar">
        <div class="launch-badge-gold">SIGNATURE FEATURE · ĐIỂM NHẤN ĐẲNG CẤP DOANH NHÂN</div>
        <div class="slide-code-gold">EXECUTIVE DIGITAL CARD 5.0</div>
      </div>
      <h2 class="keynote-heading-white">THẺ HỘI VIÊN VIP MẠ VÀNG & DANH THIẾP SỐ KÉP ĐỘC BẢN</h2>
      <p class="keynote-desc-gray">Tự hào khẳng định vị thế doanh nhân Quý Hợi 1983 · Kết nối đối tác trong 1 nốt nhạc không cần cài app</p>
      
      <div class="showstopper-grid">
        <div class="showstopper-left">
          <div class="glass-feature-box">
            <div class="box-icon">👑</div>
            <div class="box-text">
              <h4>Thẻ Hội Viên VIP Mạ Vàng Độc Bản</h4>
              <p>Dập nổi mã số chính danh <strong>CEO-83xxx</strong>, logo công ty và chức danh lãnh đạo. Tự tin xuất trình tại các diễn đàn kinh tế lớn.</p>
            </div>
          </div>
          <div class="glass-feature-box">
            <div class="box-icon">🔄</div>
            <div class="box-text">
              <h4>Hệ Thống Danh Thiếp Số Kép: Chính & Phụ</h4>
              <p>Cơ chế thẻ kép đầu tiên trên thị trường. Hội viên chủ động cấu hình ẩn/hiện Số điện thoại, Email, Địa chỉ công ty tùy đối tượng đối tác tiếp cận.</p>
            </div>
          </div>
          <div class="glass-feature-box">
            <div class="box-icon">⚡</div>
            <div class="box-text">
              <h4>Quét QR Lưu vCard 1 Chạm & Company Profile 2 Trang</h4>
              <p>Đối tác <strong>hoàn toàn không cần cài app</strong>! Quét camera điện thoại là xem thẻ VIP, bấm Lưu vCard vào danh bạ và xem trọn vẹn Profile Doanh Nghiệp 2 trang bên dưới.</p>
            </div>
          </div>
        </div>
        
        <div class="showstopper-right">
          <div class="phone-frame-gold"><img src="${imgCardFront}" alt="Thẻ hội viên mặt trước" /><div class="frame-tag-gold">Thẻ VIP Mạ Vàng</div></div>
          <div class="phone-frame-gold"><img src="${imgCardBackQr}" alt="Thẻ hội viên mặt sau QR" /><div class="frame-tag-gold">Mặt Sau Thẻ & QR Cá Nhân</div></div>
        </div>
      </div>
      <div class="slide-footer dark-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 08 / 24</div>
    </div>
    `,

    // SLIDE 9: MOBILE APP · DANH BẠ & ĐẶT LỊCH HẸN 1-ON-1
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">MOBILE APP · PHÂN HỆ HỘI VIÊN</div>
        <div class="slide-code">03 / DIRECTORY & 1-ON-1 B2B</div>
      </div>
      <h2 class="slide-main-heading">DANH BẠ 500+ CEO & ĐẶT LỊCH HẸN GIAO THƯƠNG 1-ON-1</h2>
      <p class="slide-sub-heading">Biến mối quan hệ đồng niên Quý Hợi thành những thương vụ kinh tế thực chiến, an toàn và bền vững</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Danh Bạ Phân Loại Theo 11 Nhóm Ngành Hàng</h4>
              <p>Tra cứu nhanh 500+ CEO: Xây dựng, Bất động sản, Tài chính, Công nghệ, Du lịch, Sản xuất, Bán lẻ, Y tế... chỉ trong 1 chạm.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Bộ Icon Thao Tác Tối Giản Xanh Cobalt Navy</h4>
              <p>Gọi điện trực tiếp, nhắn tin nội bộ, xem danh thiếp số hoặc bấm nút <strong>Kết nối giao thương B2B</strong> chuẩn mực.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Đặt Lịch Hẹn 1-on-1 Gắn Liền Thương Vụ</h4>
              <p>Gửi lời mời cà phê làm việc kèm lý do kết nối cụ thể. Tự động đồng bộ vào lịch Google / Apple Calendar trên điện thoại hai bên.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame"><img src="${imgDirectory}" alt="Danh bạ hội viên" /><div class="frame-tag">Danh Bạ 500+ CEO</div></div>
          <div class="phone-frame"><img src="${imgMemberProfile}" alt="Chi tiết hồ sơ hội viên" /><div class="frame-tag">Hồ Sơ Năng Lực & Kết Nối</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 09 / 24</div>
    </div>
    `,

    // SLIDE 10: MOBILE APP · SÀN MARKETPLACE & CƠ HỘI KINH DOANH
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">MOBILE APP · PHÂN HỆ HỘI VIÊN</div>
        <div class="slide-code">04 / B2B COMMERCE & DEALS</div>
      </div>
      <h2 class="slide-main-heading">SÀN GIAO THƯƠNG B2B & BẢNG CƠ HỘI KINH DOANH NỘI BỘ</h2>
      <p class="slide-sub-heading">Không gian thương mại đặc quyền – Ưu tiên dùng sản phẩm của nhau và đo lường dòng tiền thực tế</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Sàn Thương Mại Nội Bộ B2B</h4>
              <p>Trưng bày các sản phẩm/dịch vụ của thành viên 1983 kèm mức chiết khấu nội bộ đặc quyền. Nhắn tin hỏi giá và đặt mua trực tiếp.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Bảng Cơ Hội Kinh Doanh Thời Gian Thực</h4>
              <p>Đăng tin Mua, Bán, Cần tìm nhà thầu phụ, Hợp tác đầu tư kèm giá trị ước tính của thương vụ. Không bị trôi bài như trong nhóm chat.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Đo Lường Doanh Thu Giao Thương (Deal Tracking)</h4>
              <p>Ghi nhận giá trị các hợp đồng ký kết thành công giữa các thành viên, phục vụ báo cáo thành tích lên Hội Doanh Nhân Trẻ Hà Nội.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame"><img src="${imgMarketplace}" alt="Sàn giao thương B2B" /><div class="frame-tag">Sàn B2B Marketplace</div></div>
          <div class="phone-frame"><img src="${imgOpportunities}" alt="Cơ hội kinh doanh" /><div class="frame-tag">Bảng Deal Cung - Cầu</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 10 / 24</div>
    </div>
    `,

    // SLIDE 11: MOBILE APP · SỰ KIỆN, VÉ QR & BIỂU QUYẾT
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">MOBILE APP · PHÂN HỆ HỘI VIÊN</div>
        <div class="slide-code">05 / EVENTS & SMART E-TICKET</div>
      </div>
      <h2 class="slide-main-heading">QUẢN TRỊ SỰ KIỆN, VÉ ĐIỆN TỬ QR CODE & BIỂU QUYẾT SỐ</h2>
      <p class="slide-sub-heading">Tổ chức sự kiện đẳng cấp chuyên nghiệp – Check-in siêu tốc 0.1s và biểu quyết số tức thời</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Đăng Ký Sự Kiện & Nhận Ví Vé E-Ticket</h4>
              <p>Hội viên đăng ký 1 chạm. Vé điện tử QR hiển thị rõ ràng Số Bàn và Số Ghế VIP đã được Ban Tổ Chức xếp chỗ trước.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Soát Vé 0.1s Gatekeeper Chống Ùn Tắc</h4>
              <p>Chỉ cần giơ mã QR vào máy quét Gatekeeper tại cổng tiếp đón, bíp 1 tiếng là hoàn tất, triệt tiêu 100% tình trạng ùn tắc sảnh.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Quay Số May Mắn Lucky Draw & Biểu Quyết</h4>
              <p>Mỗi vé tích hợp mã số quay thưởng Lucky Draw trên màn hình LED lớn. Tính năng Biểu quyết đại hội 1 người 1 phiếu minh bạch 100%.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame"><img src="${imgQrPass}" alt="Vé điện tử QR checkin" /><div class="frame-tag">Ví Vé Điện Tử QR</div></div>
          <div class="phone-frame"><img src="${imgVoting}" alt="Biểu quyết đại hội" /><div class="frame-tag">Biểu Quyết Đại Hội Số</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 11 / 24</div>
    </div>
    `,

    // SLIDE 12: BONUS 1: ĐÀM THOẠI VOIP NATIVE & AI VOICE
    `
    <div class="slide keynote-dark">
      <div class="ambient-glow glow-emerald"></div>
      <div class="slide-top-bar dark-top-bar">
        <div class="launch-badge-emerald">SPECIAL BONUS 01 · TẶNG KÈM TỪ VICONNECT</div>
        <div class="slide-code-emerald">NATIVE VOIP CALL & AI ASSISTANT</div>
      </div>
      <h2 class="keynote-heading-white">ĐÀM THOẠI VOIP GỌI NỀN BẢO MẬT & TRỢ LÝ GIỌNG NÓI AI VOICE</h2>
      <p class="keynote-desc-gray">Bảo mật thông tin nội bộ 100% · Cuộc gọi reo chuông màn hình khóa và trợ lý rảnh tay khi lái xe</p>
      
      <div class="split-wide-grid">
        <div class="split-wide-left">
          <div class="emerald-glass-card">
            <div class="status-pill-emerald">ĐÃ CÓ SẴN 100% · TÍCH HỢP NGAY</div>
            <h4 class="card-title-light">Đàm Thoại VoIP Mã Hóa & Native Push Call</h4>
            <p>Hội viên gọi thoại và video call nội bộ hoàn toàn miễn phí. Bảo mật số điện thoại cá nhân tuyệt đối, không sợ lộ lọt qua bên thứ ba.</p>
            <div class="highlight-note-emerald">
              <strong>Đột phá kỹ thuật:</strong> Khi tắt app hoặc khóa màn hình, có cuộc gọi đến điện thoại vẫn reo chuông và hiện giao diện nhận cuộc gọi native trên màn hình khóa y như cuộc gọi nhà mạng!
            </div>
          </div>
          
          <div class="gold-glass-card">
            <div class="status-pill-gold">ĐANG LÀM THEO LỘ TRÌNH R&D</div>
            <h4 class="card-title-light">Trợ Lý Doanh Nhân AI Voice Tiếng Việt</h4>
            <p>ViConnect đang phát triển trợ lý ảo nhận diện giọng nói tiếng Việt chuyên sâu cho các CEO khi đang lái xe ô tô.</p>
            <p class="small-text-gold">Chỉ cần nói: <em>"Mở danh bạ", "Tìm sự kiện Gala", "Xem thẻ hội viên"</em>, ứng dụng tự động nhận diện và chuyển màn hình tức thì.</p>
          </div>
        </div>
        
        <div class="split-wide-right">
          <div class="wide-mockup-frame">
            <img src="${imgChatCall}" alt="VoIP Call và Chat" />
            <div class="mockup-caption">Đàm Thoại VoIP Cuộc Gọi Nền Native & Tin Nhắn Mã Hóa</div>
          </div>
        </div>
      </div>
      <div class="slide-footer dark-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 12 / 24</div>
    </div>
    `,

    // SLIDE 13: BONUS 2: MẠNG XÃ HỘI MOMENTS B2B
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">SPECIAL BONUS 02 · VICONNECT CÓ SẴN</div>
        <div class="slide-code">BUSINESS MOMENTS FEED</div>
      </div>
      <h2 class="slide-main-heading">KHOẢNH KHẮC DOANH NHÂN (BUSINESS MOMENTS FEED)</h2>
      <p class="slide-sub-heading">Mạng xã hội nội bộ như một "LinkedIn thu nhỏ" dành riêng cho cộng đồng 500+ chủ doanh nghiệp 1983</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Bảng Tin Tinh Hoa Doanh Nhân</h4>
              <p>Nơi các CEO chia sẻ hình ảnh ký kết hợp đồng, giải thưởng doanh nghiệp, khánh thành nhà máy, hoạt động thiện nguyện xã hội.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Tương Tác Văn Minh Giữa Các Đồng Niên</h4>
              <p>Thả tim, chúc mừng, bình luận trao đổi kinh nghiệm trong không gian tinh hoa, bảo chứng uy tín thương hiệu cá nhân của lãnh đạo.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Hệ Thống Thông Báo Đẩy Thông Minh</h4>
              <p>Khi có tương tác mới, hệ thống gửi thông báo Push Notification đến điện thoại giúp các doanh nghiệp không bỏ lỡ cơ hội kết nối.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col single-col-mockup">
          <div class="wide-desktop-frame">
            <img src="${imgNetworkChat}" alt="Khoảnh khắc doanh nhân" />
            <div class="frame-tag">Business Moments & Trao Đổi B2B Network</div>
          </div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 13 / 24</div>
    </div>
    `,

    // SLIDE 14: WEB CRM DASHBOARD 360°
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">WEB CRM QUẢN TRỊ · THÁP CHỈ HUY TRUNG TÂM</div>
        <div class="slide-code">EXECUTIVE COMMAND CENTER</div>
      </div>
      <h2 class="slide-main-heading">EXECUTIVE DASHBOARD: SỐ LIỆU ĐIỀU HÀNH THỜI GIAN THỰC</h2>
      <p class="slide-sub-heading">Bức tranh toàn cảnh 360° giúp Ban Thường Trực và Ban Điều Hành ra quyết định dựa trên dữ liệu thật</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Sức Khỏe Phát Triển Hội Viên 360°</h4>
              <p>Biểu đồ tốc độ tăng trưởng hội viên, tỷ lệ hội viên chính thức/dự bị, cơ cấu 11 ngành nghề và tỷ lệ hoàn thiện hồ sơ doanh nghiệp.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Kiểm Soát Giao Thương & Dòng Tiền</h4>
              <p>Tổng số cơ hội kinh doanh phát sinh, giá trị thương vụ B2B, số sự kiện đã tổ chức và tỷ lệ đại biểu tham dự thực tế.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Cảnh Báo Thông Minh Tự Động</h4>
              <p>Tự động thông báo hồ sơ gia nhập đang chờ duyệt, sự kiện sắp diễn ra và danh sách hội viên sắp đến hạn đóng hội phí thường niên.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col single-col-mockup">
          <div class="wide-desktop-frame">
            <img src="${imgCrmDashboard}" alt="Executive Dashboard" />
            <div class="frame-tag">Giao Diện Tổng Quan Executive Dashboard Web CRM</div>
          </div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 14 / 24</div>
    </div>
    `,

    // SLIDE 15: WEB CRM HỘI VIÊN & RBAC 6 BAN
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">WEB CRM QUẢN TRỊ · CHUYÊN BAN VẬN HÀNH</div>
        <div class="slide-code">RBAC COMMITTEE MATRIX</div>
      </div>
      <h2 class="slide-main-heading">THẨM ĐỊNH HỘI VIÊN & MA TRẬN PHÂN QUYỀN RBAC 6 BAN</h2>
      <p class="slide-sub-heading">Kỷ luật tổ chức và an toàn dữ liệu tuyệt đối theo đúng điều lệ hoạt động của CLB Doanh Nhân CEO 1983</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Quy Trình Duyệt Hội Viên 3 Bước Nghiêm Ngặt</h4>
              <p>Tiếp nhận đơn online ➔ Ban Thành viên thẩm định tính pháp lý ➔ Ban Thường Trực bấm duyệt cấp mã CEO-83xxx tự động.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Phân Quyền Rạch Ròi 6 Chuyên Ban (RBAC)</h4>
              <p>Ban Truyền thông, Ban Thành viên, Ban Xúc tiến, Ban Tài chính, Ban Thiện nguyện, Ban Quản trị; ban nào làm đúng quyền của ban đó.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Nhật Ký Thao Tác Bất Biến (Audit Logs)</h4>
              <p>Lưu vết 100% ai đã phê duyệt, chỉnh sửa dữ liệu vào lúc mấy giờ mấy phút, đảm bảo tính kỷ luật và minh bạch thông tin nội bộ.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame wide-tablet-frame"><img src="${imgCrmMembers}" alt="Quản lý hội viên CRM" /><div class="frame-tag">Quản Lý Danh Sách Hội Viên</div></div>
          <div class="phone-frame wide-tablet-frame"><img src="${imgCrmRbac}" alt="Phân quyền RBAC" /><div class="frame-tag">Ma Trận Phân Quyền RBAC</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 15 / 24</div>
    </div>
    `,

    // SLIDE 16: WEB CRM CINEMA MAP & GATEKEEPER
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">WEB CRM QUẢN TRỊ · SỰ KIỆN GALA</div>
        <div class="slide-code">CINEMA MAP & GATEKEEPER SCAN</div>
      </div>
      <h2 class="slide-main-heading">SƠ ĐỒ KHÁN PHÒNG CINEMA MAP & SOÁT VÉ GATEKEEPER</h2>
      <p class="slide-sub-heading">Xếp chỗ ngồi trực quan chuẩn rạp chiếu phim – Triệt tiêu 100% tình trạng lộn xộn tại các Gala 500 khách</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Sơ Đồ Kéo Thả Trực Quan (Cinema Map)</h4>
              <p>Ban Tổ chức kéo thả bàn tròn, bàn VIP, dãy ghế đại biểu như rạp chiếu phim; gán vị trí đích danh cho từng vị khách.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Ứng Dụng Gatekeeper Quét QR 0.1 Giây</h4>
              <p>Nhân sự lễ tân quét mã vé QR tại cổng. Màn hình hiện rõ: Tên khách, Tên doanh nghiệp, Vị trí bàn và số ghế ngồi VIP cụ thể.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Bộ Nhớ Đệm Offline Cache Khi Mất Mạng</h4>
              <p>Cho phép soát vé liên tục ngay cả khi tầng hầm khách sạn bị mất sóng 4G/Wifi; tự động đồng bộ lên đám mây khi có sóng trở lại.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col single-col-mockup">
          <div class="wide-desktop-frame">
            <img src="${imgCrmSeating}" alt="Sơ đồ ghế ngồi Cinema Map" />
            <div class="frame-tag">Sơ Đồ Bàn Ghế Khán Phòng Gala & Quản Trị Sự Kiện</div>
          </div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 16 / 24</div>
    </div>
    `,

    // SLIDE 17: WEB CRM CUỘC HỌP SỐ & KANBAN
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">SPECIAL BONUS 03 · VICONNECT CÓ SẴN</div>
        <div class="slide-code">SAPPHIRE HUB & KANBAN 6 BAN</div>
      </div>
      <h2 class="slide-main-heading">QUẢN TRỊ LỊCH HỌP SAPPHIRE HUB & GIAO VIỆC KANBAN 6 BAN</h2>
      <p class="slide-sub-heading">Công nghệ điều hành số hóa giúp Ban Điều Hành tiết kiệm 85% thời gian xử lý thủ công</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Lịch Họp Số Sapphire Hub Thông Minh</h4>
              <p>Khởi tạo lịch họp trực tiếp tại văn phòng hoặc họp online (Zoom, Meet, UniWork). Thuật toán tự động phát hiện và cảnh báo trùng phòng.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Điểm Danh Đại Biểu Bằng QR Động (30s Đổi Mã)</h4>
              <p>Mã QR trên màn hình tự động thay đổi sau mỗi 30 giây, ngăn chặn triệt để tình trạng chụp ảnh mã QR gửi cho người khác điểm danh hộ.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Bảng Giao Việc Kanban 6 Chuyên Ban</h4>
              <p>Nghị quyết cuộc họp được chuyển thẳng thành các thẻ công việc giao xuống từng ban kèm deadline, tự động nhắc việc đến hạn.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col">
          <div class="phone-frame wide-tablet-frame"><img src="${imgCrmMeetings}" alt="Lịch họp Sapphire Hub" /><div class="frame-tag">Lịch Họp & QR Động 30s</div></div>
          <div class="phone-frame wide-tablet-frame"><img src="${imgCrmTasks}" alt="Giao việc Kanban" /><div class="frame-tag">Giao Việc Kanban 6 Ban</div></div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 17 / 24</div>
    </div>
    `,

    // SLIDE 18: WEB CRM KẾ TOÁN & VIETQR
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">SPECIAL BONUS 04 · VICONNECT CÓ SẴN</div>
        <div class="slide-code">VIETQR NAPAS 24/7 AUTOMATION</div>
      </div>
      <h2 class="slide-main-heading">TỰ ĐỘNG HÓA KẾ TOÁN VIETQR NAPAS 24/7 & MINH BẠCH SỔ QUỸ</h2>
      <p class="slide-sub-heading">Tiền về thẳng tài khoản CLB · Gạch nợ tự động trong 1 giây và xuất file Excel đối soát nộp HanoiBA</p>
      
      <div class="feature-split-grid">
        <div class="feature-bullets-col">
          <div class="highlight-bullet">
            <div class="bullet-number">01</div>
            <div class="bullet-body">
              <h4>Mã Thanh Toán VietQR Napas 24/7 Động</h4>
              <p>Hệ thống tự sinh mã QR chứa sẵn số tiền và mã hóa đơn (hội phí 5.000.000đ/năm, vé sự kiện). Quét chuyển khoản trong 1 giây.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">02</div>
            <div class="bullet-body">
              <h4>Gạch Nợ Tức Thời Qua Webhook Ngân Hàng</h4>
              <p>Hội viên thanh toán xong là trạng thái tự động chuyển thành ĐÃ THU sau 1-2 giây, xuất biên lai điện tử ngay trên app hội viên.</p>
            </div>
          </div>
          <div class="highlight-bullet">
            <div class="bullet-number">03</div>
            <div class="bullet-body">
              <h4>Xuất Báo Cáo Sổ Quỹ Excel Chuẩn Mẫu HanoiBA</h4>
              <p>Ban Tài chính chỉ mất 1 cú nhấp chuột để xuất toàn bộ báo cáo thu chi, sao kê quỹ phục vụ công tác thanh kiểm tra của Ban Kiểm Soát.</p>
            </div>
          </div>
        </div>
        <div class="feature-mockups-col single-col-mockup">
          <div class="wide-desktop-frame">
            <img src="${imgCrmFinance}" alt="Sổ quỹ tài chính CRM" />
            <div class="frame-tag">Sổ Quỹ Thu Chi & Hóa Đơn Hội Phí VietQR</div>
          </div>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 18 / 24</div>
    </div>
    `,

    // SLIDE 19: LIÊN MINH ĐA HIỆP HỘI
    `
    <div class="slide keynote-dark">
      <div class="ambient-glow glow-purple"></div>
      <div class="slide-top-bar dark-top-bar">
        <div class="launch-badge-purple">FUTURE R&D ROADMAP · VICONNECT TIẾP SỨC</div>
        <div class="slide-code-purple">MULTI-TENANT ALLIANCE NETWORK</div>
      </div>
      <h2 class="keynote-heading-white">MẠNG LƯỚI LIÊN MINH GIAO THƯƠNG ĐA HIỆP HỘI & AI SMART MATCHING</h2>
      <p class="keynote-desc-gray">Mở rộng không giới hạn quy mô giao thương giữa CEO 1983 với các CLB Doanh nhân khác trong HanoiBA</p>
      
      <div class="three-cards-dark">
        <div class="dark-feature-card">
          <div class="dark-card-icon">🌐</div>
          <span class="status-pill-purple">ĐANG LÀM THEO LỘ TRÌNH R&D</span>
          <h4>Liên Minh Đa Hiệp Hội (Multi-Tenant)</h4>
          <p>Nền tảng ViConnect có sẵn kiến trúc đa tổ chức. Đang mở cổng kết nối liên hiệp hội giữa CEO 1983 với CEO 1982, CEO 1984 và Hội Doanh nhân trẻ các tỉnh bạn.</p>
          <div class="card-footer-note">Nhân cấp số nhân mạng lưới đối tác mà không cần đầu tư thêm.</div>
        </div>
        
        <div class="dark-feature-card">
          <div class="dark-card-icon">📈</div>
          <span class="status-pill-purple">ĐANG LÀM THEO LỘ TRÌNH R&D</span>
          <h4>Giao Thương B2B Chéo (Cross-Selling)</h4>
          <p>Sản phẩm của hội viên 1983 được mở quyền hiển thị ưu đãi sang các cộng đồng doanh nhân liên kết trong hệ sinh thái, mở rộng thị trường tiêu thụ.</p>
          <div class="card-footer-note">Thúc đẩy doanh thu thực tế vượt bậc cho doanh nghiệp thành viên.</div>
        </div>
        
        <div class="dark-feature-card">
          <div class="dark-card-icon">🤖</div>
          <span class="status-pill-purple">ĐANG LÀM THEO LỘ TRÌNH R&D</span>
          <h4>AI Khớp Nối Cung - Cầu Tự Động</h4>
          <p>Thuật toán AI phân tích hồ sơ năng lực và nhu cầu mua sắm B2B để chủ động ghép cặp và thông báo cơ hội hợp tác kinh doanh phù hợp nhất.</p>
          <div class="card-footer-note">Dữ liệu tài chính nội bộ CEO 1983 vẫn được bảo mật 100%.</div>
        </div>
      </div>
      <div class="slide-footer dark-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 19 / 24</div>
    </div>
    `,

    // SLIDE 20: SO SÁNH HIỆU QUẢ TRƯỚC VÀ SAU
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">ĐÁNH GIÁ ĐỘT PHÁ CÔNG NGHỆ</div>
        <div class="slide-code">BEFORE VS AFTER TRANSFORMATION</div>
      </div>
      <h2 class="slide-main-heading">BẢNG SO SÁNH HIỆU QUẢ: TRƯỚC VÀ SAU KHI SỐ HÓA</h2>
      <p class="slide-sub-heading">Minh chứng cho sự đột phá vượt bậc giữa phương thức vận hành cũ và hệ sinh thái ViConnect mới</p>
      
      <div class="comparison-table-wrapper">
        <table class="comp-table">
          <thead>
            <tr>
              <th style="width: 22%;">Tiêu Chí Vận Hành</th>
              <th style="width: 39%;">Phương Thức Cũ (Trước Đây)</th>
              <th class="highlight-col" style="width: 39%;">Hệ Sinh Thái Kép CEO 1983 (Hiện Tại)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Dữ Liệu Hội Viên</strong></td>
              <td>Phân tán file Excel, nhóm Zalo, dễ thất lạc, khó tra cứu</td>
              <td class="highlight-col"><strong>Hồ sơ 360° tập trung</strong>, mã định danh CEO-83xxx, tra cứu 1 chạm</td>
            </tr>
            <tr>
              <td><strong>Danh Thiếp Giao Thương</strong></td>
              <td>In card giấy tốn kém, dễ mất, không cập nhật hồ sơ</td>
              <td class="highlight-col"><strong>Danh thiếp số kép</strong> (Chính/Phụ), quét QR lưu vCard & Profile 2 trang</td>
            </tr>
            <tr>
              <td><strong>Tổ Chức Sự Kiện Gala</strong></td>
              <td>Xếp chỗ lộn xộn, check-in ùn tắc, kiểm phiếu mất 2 - 3 giờ</td>
              <td class="highlight-col"><strong>Sơ đồ Cinema Map</strong>, soát vé Gatekeeper 0.1s, biểu quyết tức thời 100%</td>
            </tr>
            <tr>
              <td><strong>Xúc Tiến Kinh Doanh</strong></td>
              <td>Đăng bài trôi tin trên Zalo, thiếu kênh kết nối 1-on-1</td>
              <td class="highlight-col"><strong>Sàn B2B Marketplace</strong>, bảng Deal thời gian thực, đặt lịch hẹn B2B</td>
            </tr>
            <tr>
              <td><strong>Tính Năng Bonus CÓ SẴN</strong></td>
              <td>Không có công cụ, phải dùng các app rời rạc bên ngoài</td>
              <td class="highlight-col"><strong>VoIP Call nền native, Moments B2B, Lịch họp QR 30s, Kanban 6 Ban, VietQR 24/7</strong></td>
            </tr>
            <tr>
              <td><strong>Tính Năng Bonus ĐANG LÀM</strong></td>
              <td>Không có lộ trình nghiên cứu phát triển công nghệ</td>
              <td class="highlight-col"><strong>AI Voice tiếng Việt rảnh tay, AI Smart Matching, Liên minh Đa Hiệp Hội</strong></td>
            </tr>
            <tr>
              <td><strong>Thời Gian Điều Hành</strong></td>
              <td>Tốn 15 - 20 giờ/tuần xử lý thủ công của Ban Thư ký & BĐH</td>
              <td class="highlight-col"><strong>Giảm 85% thời gian</strong>, tự động hóa toàn diện, minh bạch 100%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 20 / 24</div>
    </div>
    `,

    // SLIDE 21: PHẦN 3 · NHẬN XÉT ĐỐI TÁC & 10 TÌNH HUỐNG
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge gold-event-badge">PHẦN 3 · DIỄN ĐÀN ĐỐI THOẠI & PHẢN BIỆN (10:00 – 10:45)</div>
        <div class="slide-code">45 MINUTES OPEN FORUM</div>
      </div>
      <h2 class="slide-main-heading">NHẬN XÉT TỪ ĐỐI TÁC & THÁO GỠ 10 TÌNH HUỐNG THỰC CHIẾN</h2>
      <p class="slide-sub-heading">Dành trọn vẹn 45 phút (đến 11h kém 15) lắng nghe Chủ tịch, Ban Thường Trực & 6 Ban Chuyên Môn</p>
      
      <div class="three-cards-forum">
        <div class="forum-card">
          <div class="forum-icon">🎙</div>
          <h3 class="forum-title">Lắng Nghe Toàn Diện 6 Ban</h3>
          <p class="forum-desc">Tiếp nhận mọi góc nhìn vận hành thực tế:</p>
          <ul class="forum-list">
            <li><strong>Ban Thành Viên:</strong> Thẩm định hội viên, bảo mật SĐT.</li>
            <li><strong>Ban Sự Kiện:</strong> Soát vé Gala 500 khách khi mất sóng 4G.</li>
            <li><strong>Ban Xúc Tiến:</strong> Sàn B2B, lưu vĩnh viễn & Deal Value.</li>
            <li><strong>Ban Tài Chính:</strong> Thu chi VietQR Napas 24/7 về quỹ CLB.</li>
            <li><strong>Ban Truyền Thông:</strong> Phân quyền đăng tin & Media.</li>
          </ul>
        </div>
        
        <div class="forum-card highlight-forum-card">
          <div class="forum-icon">🛡</div>
          <h3 class="forum-title">Bộ Cẩm Nang 10 Tình Huống</h3>
          <p class="forum-desc">Giải pháp công nghệ có sẵn tháo gỡ 100% khúc mắc:</p>
          <ul class="forum-list">
            <li><strong>Bảo mật SĐT:</strong> Cơ chế Danh thiếp kép chủ động ẩn/hiện.</li>
            <li><strong>Soát vé offline:</strong> Gatekeeper 0.1s lưu cache cục bộ.</li>
            <li><strong>Quét QR không cần app:</strong> Xem thẻ VIP & Profile 2 trang.</li>
            <li><strong>Dòng tiền minh bạch:</strong> Tiền về thẳng tài khoản CLB.</li>
            <li><strong>Bản quyền tương lai:</strong> Cam kết vĩnh viễn không thu phí.</li>
          </ul>
        </div>
        
        <div class="forum-card">
          <div class="forum-icon">🎯</div>
          <h3 class="forum-title">Quy Trình Ứng Biến 4 Bước</h3>
          <p class="forum-desc">Tác phong bản lĩnh của diễn giả công nghệ:</p>
          <ul class="forum-list">
            <li><strong>1. Lắng nghe:</strong> Ghi chép cẩn thận vào sổ tay.</li>
            <li><strong>2. Đồng cảm:</strong> Xác nhận câu hỏi chạm đúng thực tế.</li>
            <li><strong>3. Trả lời sắc bén:</strong> Đi thẳng vào bản chất công nghệ.</li>
            <li><strong>4. Phân loại rạch ròi:</strong> Chuyển sang biên bản: Cái gì chốt - Cái gì sửa.</li>
          </ul>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 21 / 24</div>
    </div>
    `,

    // SLIDE 22: PHẦN 4 · BẢN ĐÁNH GIÁ TỔNG KẾT: CÁI GÌ CHỐT, CÁI GÌ SỬA
    `
    <div class="slide keynote-dark green-border-slide">
      <div class="ambient-glow glow-green"></div>
      <div class="slide-top-bar dark-top-bar">
        <div class="launch-badge-green">PHẦN 4 · TỔNG KẾT ĐÁNH GIÁ & CHỐT PHẠM VI (10:45 – 11:45)</div>
        <div class="slide-code-green">ACCEPTANCE SIGN-OFF MATRIX</div>
      </div>
      <h2 class="keynote-heading-white">BẢN ĐÁNH GIÁ TỔNG KẾT: "CÁI GÌ CHỐT – CÁI GÌ SỬA"</h2>
      <p class="keynote-desc-gray">Phân định minh bạch 3 danh mục: Chốt 100% nghiệm thu module đã làm | Tinh chỉnh nghiệp vụ | Lộ trình tương lai</p>
      
      <div class="signoff-three-grid">
        <div class="signoff-box signoff-green">
          <div class="signoff-tag tag-green-bg">DANH MỤC 1 · KÝ CHỐT TẠI BÀN HỌP</div>
          <h4 class="signoff-heading">CHỐT 100% ĐÃ HOÀN THÀNH</h4>
          <p class="signoff-desc">Khóa chặt nghiệm thu 12 module sẵn sàng:</p>
          <ul class="signoff-checklist">
            <li>✔ Đăng ký & Đăng nhập bảo mật SĐT</li>
            <li>✔ Thẻ VIP mạ vàng & Danh thiếp số kép vCard</li>
            <li>✔ Danh bạ 500 CEO 11 ngành & Hẹn 1-on-1</li>
            <li>✔ Sàn Marketplace B2B & Bảng Deal Cung-Cầu</li>
            <li>✔ Vé QR E-ticket, Cinema Map & Biểu quyết</li>
            <li>✔ Web CRM Dashboard 360° & RBAC 6 Ban</li>
            <li>✔ VoIP gọi nền, Moments B2B, Sapphire QR 30s, Kanban, VietQR 24/7</li>
          </ul>
          <div class="signoff-badge-bottom">KÝ NHÁY BIÊN BẢN NGHIỆM THU 100%</div>
        </div>
        
        <div class="signoff-box signoff-gold">
          <div class="signoff-tag tag-gold-bg">DANH MỤC 2 · CAM KẾT DEADLINE</div>
          <h4 class="signoff-heading">CẦN SỬA (TINH CHỈNH NGHIỆP VỤ)</h4>
          <p class="signoff-desc">Tiếp thu các góp ý nhỏ từ cuộc họp:</p>
          <ul class="signoff-checklist">
            <li>• Tinh chỉnh màu sắc nút bấm, font chữ theo gu BĐH</li>
            <li>• Bổ sung trường thông tin quy mô nhân sự công ty</li>
            <li>• Tùy biến mẫu xuất Excel sổ quỹ theo mẫu riêng HanoiBA</li>
            <li>• Phân công kỹ sư ViConnect phụ trách từng đầu việc</li>
          </ul>
          <div class="signoff-badge-bottom gold-btn">CAM KẾT XONG TRONG 3 - 5 NGÀY</div>
        </div>
        
        <div class="signoff-box signoff-purple">
          <div class="signoff-tag tag-purple-bg">DANH MỤC 3 · R&D ĐỘT PHÁ</div>
          <h4 class="signoff-heading">LỘ TRÌNH R&D VICONNECT</h4>
          <p class="signoff-desc">Định hướng công nghệ dài hạn cho CLB:</p>
          <ul class="signoff-checklist">
            <li>• Trợ lý Doanh nhân AI Voice tiếng Việt rảnh tay</li>
            <li>• AI Smart Deal Matching ghép đôi cung - cầu B2B</li>
            <li>• Liên minh Đa Hiệp Hội HanoiBA (CEO 1982, 1984...)</li>
            <li>• Nâng cấp tự động qua mạng không tốn phí</li>
          </ul>
          <div class="signoff-badge-bottom purple-btn">NÂNG CẤP QUA CLOUD OTA MIỄN PHÍ</div>
        </div>
      </div>
      <div class="slide-footer dark-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 22 / 24</div>
    </div>
    `,

    // SLIDE 23: PHẦN 5 · CAM KẾT VĂN BẢN & LỘ TRÌNH BÀN GIAO
    `
    <div class="slide keynote-light">
      <div class="slide-top-bar">
        <div class="event-badge">PHẦN 5 · CAM KẾT VĂN BẢN & BÀN GIAO (11:45 – 12:00)</div>
        <div class="slide-code">OFFICIAL HANDOVER COMMITMENT</div>
      </div>
      <h2 class="slide-main-heading">CAM KẾT GỬI LẠI VĂN BẢN CHÍNH THỨC & LỘ TRÌNH TRIỂN KHAI</h2>
      <p class="slide-sub-heading">Mọi nội dung thống nhất được thể chế hóa bằng văn bản có giá trị pháp lý trong 24h - 48h</p>
      
      <div class="three-cards-forum">
        <div class="forum-card">
          <div class="forum-icon">📑</div>
          <h3 class="forum-title">Cam Kết Văn Bản Chính Thức</h3>
          <p class="forum-desc">Gửi lại đầy đủ bằng văn bản có dấu đỏ:</p>
          <ul class="forum-list">
            <li><strong>Trong 24 giờ:</strong> Gửi Biên bản họp tổng kết chính thức có chữ ký xác nhận hai bên.</li>
            <li><strong>Trong 48 giờ:</strong> Gửi Kế hoạch chỉnh sửa chi tiết (Action Plan) cho Danh mục Cần Sửa.</li>
            <li><strong>Trong 3 ngày:</strong> Bàn giao bộ tài liệu HDSD chuẩn hóa (PDF + Video clip ngắn 60s).</li>
          </ul>
        </div>
        
        <div class="forum-card highlight-forum-card">
          <div class="forum-icon">🎓</div>
          <h3 class="forum-title">Lộ Trình Bàn Giao & Đào Tạo</h3>
          <p class="forum-desc">3 Giai đoạn chặt chẽ, chu đáo:</p>
          <ul class="forum-list">
            <li><strong>Giai đoạn 1:</strong> Bàn giao tài khoản quản trị cho Ban Thường Trực & Ban Thư Ký.</li>
            <li><strong>Giai đoạn 2:</strong> Tổ chức 01 buổi tập huấn chuyên sâu 30 phút cho Ban Thư Ký & 6 Ban.</li>
            <li><strong>Giai đoạn 3:</strong> Ban Điều Hành trải nghiệm thử 3 - 5 ngày trước khi phát động toàn thể hội viên.</li>
          </ul>
        </div>
        
        <div class="forum-card">
          <div class="forum-icon">🤝</div>
          <h3 class="forum-title">Đồng Hành Kỹ Thuật 24/7</h3>
          <p class="forum-desc">Cam kết trách nhiệm cao nhất:</p>
          <ul class="forum-list">
            <li><strong>Hotline 24/7:</strong> Kỹ sư ViConnect túc trực hỗ trợ BĐH và hội viên.</li>
            <li><strong>Bảo mật:</strong> Sao lưu dữ liệu đám mây hàng ngày.</li>
            <li><strong>Nâng cấp:</strong> Tự động cập nhật qua OTA không gián đoạn hoạt động của CLB.</li>
          </ul>
        </div>
      </div>
      <div class="slide-footer">CLB Doanh Nhân CEO 1983 (HanoiBA) · Trang 23 / 24</div>
    </div>
    `,

    // SLIDE 24: KEYNOTE GRAND FINALE (CLOSING AT 12:00)
    `
    <div class="slide keynote-dark">
      <div class="ambient-glow glow-top"></div>
      <div class="launch-badge">
        <span class="pulse-dot"></span>
        CLB DOANH NHÂN CEO 1983 (HANOIBA) × VICONNECT PLATFORM & VIONE
      </div>
      <h1 class="keynote-hero-title">
        XIN TRÂN TRỌNG CẢM ƠN<br>
        <span class="gold-gradient-text">QUÝ ANH CHỊ BAN ĐIỀU HÀNH!</span>
      </h1>
      <p class="keynote-hero-subtitle">
        KÍNH CHÚC CLB DOANH NHÂN CEO 1983 LUÔN VỮNG MẠNH, ĐOÀN KẾT, THỊNH VƯỢNG VÀ TIÊN PHONG SỐ HÓA
      </p>
      
      <div class="keynote-meta-container">
        <div class="keynote-pill">
          <div class="pill-label">ĐƯỜNG DÂY NÓNG HỖ TRỢ 24/7</div>
          <div class="pill-value">Hotline Kỹ Thuật ViOne: 1900 xxxx</div>
        </div>
        <div class="keynote-pill">
          <div class="pill-label">CỔNG TRẢI NGHIỆM HỘI VIÊN</div>
          <div class="pill-value">ceo1983.viconnect.vn</div>
        </div>
        <div class="keynote-pill">
          <div class="pill-label">CỔNG QUẢN TRỊ TRUNG TÂM</div>
          <div class="pill-value">crm.ceo1983.viconnect.vn</div>
        </div>
      </div>
      
      <div class="grand-clock-badge">⏱ Buổi họp hoàn thành đúng thời gian cam kết: 12h00 Trưa</div>
    </div>
    `
  ];

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Keynote Presentation - Hệ Sinh Thái Số Hóa CLB Doanh Nhân CEO 1983 (24 Slides)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 16in 9in;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0B0F19;
      color: #0F172A;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .slide {
      width: 16in;
      height: 9in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 0.5in 0.8in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* THEME DARK KEYNOTE */
    .keynote-dark {
      background: radial-gradient(circle at 50% 0%, #002B70 0%, #0A1128 50%, #050814 100%);
      color: #FFFFFF;
    }
    .keynote-light {
      background: #F8FAFC;
      color: #0F172A;
      border-bottom: 2px solid #E2E8F0;
    }
    .gold-border-slide {
      border: 3px solid rgba(245, 158, 11, 0.4);
    }
    .green-border-slide {
      border: 3px solid rgba(16, 185, 129, 0.4);
    }

    /* Ambient Glow Effects */
    .ambient-glow {
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      filter: blur(120px);
    }
    .glow-top {
      top: -150px;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 450px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(0, 59, 149, 0) 70%);
    }
    .glow-bottom {
      bottom: -150px;
      right: 10%;
      width: 600px;
      height: 350px;
      background: radial-gradient(circle, rgba(0, 59, 149, 0.3) 0%, transparent 70%);
    }
    .glow-gold {
      top: -100px;
      right: -100px;
      width: 700px;
      height: 500px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%);
    }
    .glow-emerald {
      top: -100px;
      left: -100px;
      width: 700px;
      height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
    }
    .glow-purple {
      top: -100px;
      right: -100px;
      width: 700px;
      height: 500px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
    }
    .glow-green {
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 450px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
    }

    /* Badges & Headers */
    .launch-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #F8FAFC;
      backdrop-filter: blur(10px);
      margin: 0 auto 20px auto;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
    }
    .launch-badge-sm {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #93C5FD;
    }
    .launch-badge-gold {
      display: inline-block;
      padding: 5px 16px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid #F59E0B;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #FCD34D;
    }
    .launch-badge-emerald {
      display: inline-block;
      padding: 5px 16px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10B981;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #6EE7B7;
    }
    .launch-badge-purple {
      display: inline-block;
      padding: 5px 16px;
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid #8B5CF6;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #DDD6FE;
    }
    .launch-badge-green {
      display: inline-block;
      padding: 5px 16px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10B981;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #A7F3D0;
    }

    .slide-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .event-badge {
      display: inline-block;
      padding: 5px 14px;
      background: #EFF6FF;
      color: #003B95;
      border: 1px solid #BFDBFE;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .gold-event-badge {
      background: #FEF3C7;
      color: #B45309;
      border-color: #FDE68A;
    }
    .slide-code {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #64748B;
    }
    .slide-code-dark { color: #94A3B8; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
    .slide-code-gold { color: #FCD34D; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
    .slide-code-emerald { color: #6EE7B7; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
    .slide-code-purple { color: #DDD6FE; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
    .slide-code-green { color: #A7F3D0; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }

    /* Keynote Titles */
    .keynote-hero-title {
      font-size: 46px;
      font-weight: 900;
      line-height: 1.2;
      text-align: center;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
    }
    .gold-gradient-text {
      background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
    }
    .keynote-hero-subtitle {
      font-size: 18px;
      color: #CBD5E1;
      text-align: center;
      max-width: 960px;
      margin: 0 auto 30px auto;
      line-height: 1.5;
    }
    .keynote-meta-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 1000px;
      width: 100%;
      margin: 0 auto 25px auto;
    }
    .keynote-pill {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 16px 20px;
      backdrop-filter: blur(12px);
      text-align: center;
    }
    .pill-label {
      font-size: 11px;
      color: #F59E0B;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .pill-value {
      font-size: 17px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .keynote-slogan {
      text-align: center;
      font-size: 15px;
      color: #94A3B8;
      font-style: italic;
      letter-spacing: 1px;
    }

    .slide-main-heading {
      font-size: 32px;
      font-weight: 900;
      color: #003B95;
      line-height: 1.25;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }
    .keynote-heading-white {
      font-size: 32px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.25;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }
    .slide-sub-heading {
      font-size: 16px;
      color: #475569;
      font-weight: 500;
      margin-bottom: 18px;
    }
    .keynote-desc-gray {
      font-size: 16px;
      color: #94A3B8;
      font-weight: 500;
      margin-bottom: 18px;
    }

    /* Keynote Timeline Grid */
    .keynote-timeline-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 12px;
      height: 100%;
      align-items: stretch;
      margin-bottom: 15px;
    }
    .timeline-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    }
    .timeline-card .time-header {
      font-size: 11.5px;
      font-weight: 800;
      color: #003B95;
      background: #EFF6FF;
      padding: 4px 8px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 10px;
    }
    .timeline-card .phase-title {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .timeline-card p {
      font-size: 12px;
      color: #64748B;
      line-height: 1.45;
    }
    .highlight-card {
      border: 2px solid #93C5FD;
      background: #F0F7FF;
    }
    .highlight-card .phase-title { color: #003B95; }
    .gold-bg { background: #F59E0B !important; color: #FFFFFF !important; }
    .navy-bg { background: #003B95 !important; color: #FFFFFF !important; }
    .orange-bg { background: #EA580C !important; color: #FFFFFF !important; }
    .green-bg { background: #10B981 !important; color: #FFFFFF !important; }
    .alert-card { border: 2px solid #FCD34D; background: #FFFBEB; }
    .alert-card .phase-title { color: #B45309; }
    .success-card { border: 2px solid #86EFAC; background: #F0FDF4; }
    .success-card .phase-title { color: #166534; }

    /* 3 Columns Hero */
    .three-columns-hero {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: 100%;
      margin-bottom: 15px;
    }
    .hero-column-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 18px;
      padding: 24px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0, 59, 149, 0.05);
      border-top: 5px solid #003B95;
    }
    .col-icon { font-size: 38px; margin-bottom: 10px; }
    .problem-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      color: #DC2626;
      background: #FEE2E2;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
      width: fit-content;
    }
    .col-title {
      font-size: 20px;
      font-weight: 800;
      color: #003B95;
      margin-bottom: 14px;
    }
    .old-way {
      background: #FFF1F2;
      border: 1px solid #FECDD3;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13px;
      color: #9F1239;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .new-way {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13px;
      color: #166534;
      line-height: 1.5;
    }
    .cross-icon { font-weight: bold; color: #E11D48; }
    .check-icon { font-weight: bold; color: #16A34A; }
    .event-gift-banner {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 14px;
      color: #166534;
      font-weight: 600;
    }

    /* Dual Platform Grid */
    .dual-platform-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      height: 100%;
      margin-bottom: 15px;
    }
    .platform-glass-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 28px;
      backdrop-filter: blur(14px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .platform-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
      width: fit-content;
    }
    .gold-tag { background: rgba(245, 158, 11, 0.2); color: #FCD34D; border: 1px solid #F59E0B; }
    .blue-tag { background: rgba(0, 59, 149, 0.3); color: #93C5FD; border: 1px solid #60A5FA; }
    .platform-title {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 8px;
    }
    .platform-summary {
      font-size: 14px;
      color: #CBD5E1;
      line-height: 1.5;
      margin-bottom: 18px;
    }
    .feature-capsule-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .capsule {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13.5px;
      color: #F8FAFC;
    }

    /* Three Pillars Showcase */
    .three-pillars-showcase {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: 100%;
      margin-bottom: 15px;
    }
    .pillar-box {
      border-radius: 18px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.04);
    }
    .pillar-navy { background: #FFFFFF; border: 1px solid #DBEAFE; border-top: 5px solid #003B95; }
    .pillar-emerald { background: #F0FDF4; border: 1px solid #BBF7D0; border-top: 5px solid #10B981; }
    .pillar-gold { background: #FFFBEB; border: 1px solid #FEF3C7; border-top: 5px solid #F59E0B; }
    .pillar-header h3 { font-size: 18px; font-weight: 800; margin-top: 8px; margin-bottom: 12px; }
    .pillar-navy h3 { color: #003B95; }
    .pillar-emerald h3 { color: #065F46; }
    .pillar-gold h3 { color: #92400E; }
    .pillar-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .tag-navy { background: #EFF6FF; color: #003B95; border: 1px solid #BFDBFE; }
    .tag-emerald { background: #DCFCE7; color: #065F46; border: 1px solid #A7F3D0; }
    .tag-gold { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
    .pillar-points { list-style: none; padding: 0; }
    .pillar-points li {
      font-size: 13.5px;
      color: #334155;
      line-height: 1.5;
      margin-bottom: 8px;
      position: relative;
      padding-left: 18px;
    }
    .pillar-points li::before {
      content: "✔";
      position: absolute;
      left: 0;
      color: #003B95;
      font-weight: bold;
    }
    .pillar-emerald .pillar-points li::before { color: #10B981; }
    .pillar-gold .pillar-points li::before { color: #F59E0B; }
    .pillar-bottom-label {
      font-size: 12.5px;
      font-weight: 800;
      color: #003B95;
      background: #EFF6FF;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
    }
    .emerald-label { background: #DCFCE7; color: #065F46; }
    .gold-label { background: #FEF3C7; color: #92400E; }

    /* Feature Split Grid (Bullets + Mockups) */
    .feature-split-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 35px;
      align-items: center;
      height: 100%;
      margin-bottom: 10px;
    }
    .feature-bullets-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .highlight-bullet {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 20px;
      display: flex;
      gap: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    }
    .bullet-number {
      font-size: 20px;
      font-weight: 900;
      color: #003B95;
      background: #EFF6FF;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bullet-body h4 {
      font-size: 16px;
      font-weight: 800;
      color: #003B95;
      margin-bottom: 4px;
    }
    .bullet-body p {
      font-size: 13.5px;
      color: #475569;
      line-height: 1.5;
    }
    .feature-mockups-col {
      display: flex;
      gap: 18px;
      justify-content: center;
      align-items: center;
    }
    .phone-frame {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 16px;
      padding: 8px;
      box-shadow: 0 15px 30px rgba(0, 59, 149, 0.08);
      text-align: center;
      display: flex;
      flex-direction: column;
      max-height: 460px;
    }
    .phone-frame img {
      max-height: 410px;
      width: auto;
      object-fit: contain;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
    }
    .frame-tag {
      font-size: 11.5px;
      font-weight: 700;
      color: #003B95;
      padding: 5px 8px;
      background: #F1F5F9;
      border-radius: 6px;
      margin-top: 6px;
    }
    .wide-tablet-frame {
      max-height: 460px;
      width: 100%;
    }
    .wide-tablet-frame img {
      max-height: 410px;
      width: 100%;
      object-fit: contain;
    }
    .single-col-mockup {
      width: 100%;
    }
    .wide-desktop-frame {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 16px;
      padding: 8px;
      box-shadow: 0 15px 30px rgba(0, 59, 149, 0.08);
      width: 100%;
      text-align: center;
    }
    .wide-desktop-frame img {
      width: 100%;
      max-height: 410px;
      object-fit: contain;
      border-radius: 10px;
    }

    /* Showstopper VIP Card Slide */
    .showstopper-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 35px;
      align-items: center;
      height: 100%;
      margin-bottom: 10px;
    }
    .glass-feature-box {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 16px;
      padding: 18px 22px;
      margin-bottom: 14px;
      backdrop-filter: blur(12px);
      display: flex;
      gap: 16px;
    }
    .box-icon { font-size: 28px; flex-shrink: 0; }
    .box-text h4 { font-size: 17px; font-weight: 800; color: #FCD34D; margin-bottom: 4px; }
    .box-text p { font-size: 13.5px; color: #CBD5E1; line-height: 1.5; }
    .showstopper-right { display: flex; gap: 20px; justify-content: center; }
    .phone-frame-gold {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(245, 158, 11, 0.5);
      border-radius: 18px;
      padding: 8px;
      box-shadow: 0 20px 40px rgba(245, 158, 11, 0.15);
      text-align: center;
    }
    .phone-frame-gold img {
      max-height: 410px;
      width: auto;
      object-fit: contain;
      border-radius: 12px;
    }
    .frame-tag-gold {
      font-size: 12px;
      font-weight: 800;
      color: #FCD34D;
      padding: 6px 10px;
      background: rgba(245, 158, 11, 0.2);
      border-radius: 6px;
      margin-top: 6px;
    }

    /* Split Wide (VoIP) */
    .split-wide-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      height: 100%;
      align-items: center;
      margin-bottom: 10px;
    }
    .emerald-glass-card {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 16px;
    }
    .status-pill-emerald {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      background: rgba(16, 185, 129, 0.2);
      color: #6EE7B7;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .status-pill-gold {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      background: rgba(245, 158, 11, 0.2);
      color: #FCD34D;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .card-title-light { font-size: 17px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px; }
    .emerald-glass-card p { font-size: 13.5px; color: #CBD5E1; line-height: 1.5; }
    .highlight-note-emerald {
      margin-top: 10px;
      background: rgba(16, 185, 129, 0.15);
      border-left: 4px solid #10B981;
      padding: 8px 12px;
      font-size: 13px;
      color: #A7F3D0;
      line-height: 1.45;
    }
    .gold-glass-card {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 16px;
      padding: 20px 24px;
    }
    .gold-glass-card p { font-size: 13.5px; color: #CBD5E1; line-height: 1.5; }
    .small-text-gold { font-size: 13px; color: #FCD34D; margin-top: 6px; }
    .wide-mockup-frame {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 10px;
      text-align: center;
    }
    .wide-mockup-frame img {
      width: 100%;
      max-height: 410px;
      object-fit: contain;
      border-radius: 10px;
    }
    .mockup-caption {
      font-size: 12px;
      font-weight: 700;
      color: #CBD5E1;
      padding: 6px;
    }

    /* Three Cards Dark */
    .three-cards-dark {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: 100%;
      margin-bottom: 15px;
    }
    .dark-feature-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 18px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backdrop-filter: blur(12px);
    }
    .dark-card-icon { font-size: 36px; margin-bottom: 8px; }
    .status-pill-purple {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      color: #DDD6FE;
      background: rgba(139, 92, 246, 0.2);
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 10px;
      width: fit-content;
    }
    .dark-feature-card h4 { font-size: 18px; font-weight: 800; color: #FFFFFF; margin-bottom: 8px; }
    .dark-feature-card p { font-size: 13.5px; color: #CBD5E1; line-height: 1.5; margin-bottom: 12px; }
    .card-footer-note {
      font-size: 12.5px;
      color: #A78BFA;
      font-weight: 600;
      background: rgba(139, 92, 246, 0.1);
      padding: 8px 12px;
      border-radius: 8px;
    }

    /* Forum Cards */
    .three-cards-forum {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: 100%;
      margin-bottom: 15px;
    }
    .forum-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 18px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    }
    .highlight-forum-card {
      border: 2px solid #F59E0B;
      background: #FFFDF7;
    }
    .forum-icon { font-size: 36px; margin-bottom: 8px; }
    .forum-title { font-size: 18px; font-weight: 800; color: #003B95; margin-bottom: 6px; }
    .forum-desc { font-size: 13px; color: #64748B; margin-bottom: 12px; }
    .forum-list { list-style: none; padding: 0; }
    .forum-list li {
      font-size: 13.5px;
      color: #334155;
      line-height: 1.5;
      margin-bottom: 8px;
      padding-left: 18px;
      position: relative;
    }
    .forum-list li::before {
      content: "✔";
      position: absolute;
      left: 0;
      color: #F59E0B;
      font-weight: bold;
    }

    /* Sign-off Grid */
    .signoff-three-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: 100%;
      margin-bottom: 15px;
    }
    .signoff-box {
      border-radius: 18px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backdrop-filter: blur(14px);
    }
    .signoff-green { background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.4); }
    .signoff-gold { background: rgba(245, 158, 11, 0.08); border: 1.5px solid rgba(245, 158, 11, 0.4); }
    .signoff-purple { background: rgba(139, 92, 246, 0.08); border: 1.5px solid rgba(139, 92, 246, 0.4); }
    .signoff-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 8px;
      width: fit-content;
    }
    .tag-green-bg { background: rgba(16, 185, 129, 0.25); color: #6EE7B7; }
    .tag-gold-bg { background: rgba(245, 158, 11, 0.25); color: #FCD34D; }
    .tag-purple-bg { background: rgba(139, 92, 246, 0.25); color: #DDD6FE; }
    .signoff-heading { font-size: 18px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; }
    .signoff-desc { font-size: 13px; color: #94A3B8; margin-bottom: 12px; }
    .signoff-checklist { list-style: none; padding: 0; }
    .signoff-checklist li {
      font-size: 13px;
      color: #E2E8F0;
      line-height: 1.5;
      margin-bottom: 6px;
    }
    .signoff-badge-bottom {
      font-size: 12px;
      font-weight: 800;
      text-align: center;
      padding: 10px;
      border-radius: 8px;
      background: #10B981;
      color: #FFFFFF;
      margin-top: 10px;
    }
    .gold-btn { background: #F59E0B; }
    .purple-btn { background: #8B5CF6; }

    /* Comparison Table */
    .comparison-table-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
    }
    .comp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      border-radius: 12px;
      overflow: hidden;
    }
    .comp-table th, .comp-table td {
      padding: 11px 16px;
      text-align: left;
      border-bottom: 1px solid #E2E8F0;
    }
    .comp-table th {
      background: #003B95;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
    }
    .comp-table th.highlight-col { background: #0A1A3A; color: #F59E0B; }
    .comp-table td.highlight-col { background: #F0F7FF; color: #003B95; }
    .comp-table tr:hover td { background: #F8FAFC; }

    /* Grand Clock Badge */
    .grand-clock-badge {
      display: inline-block;
      padding: 10px 30px;
      background: #10B981;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 16px;
      border-radius: 999px;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
      margin: 0 auto;
    }

    /* Footer */
    .slide-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #94A3B8;
      display: flex;
      justify-content: space-between;
    }
    .dark-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      color: #64748B;
    }
  </style>
</head>
<body>
  ${slides.join('\n')}
</body>
</html>`;

  const htmlPath = path.join(DOC_DIR, 'SLIDE_TRINH_BAY_THU_4_CEO1983.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✓ Đã cập nhật file HTML Slide Keynote 24 slides: ${htmlPath}`);

  // Xuất file PDF bằng Playwright Chrome (Widescreen 16:9)
  console.log('--- Đang khởi động Playwright Chrome để render file PDF Keynote 24 trang... ---');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1800);

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
  console.log(`✓ XUẤT FILE PDF KEYNOTE 24 SLIDES THÀNH CÔNG: ${pdfPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

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
// ============================================================================
async function generateSpeakerDocx() {
  console.log('>>> [2/2] Đang tạo file Word (.docx) KỊCH BẢN NÓI HỌC THUỘC LÒNG Chuyên Biệt Cho Diễn Giả...');

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

  function createRehearsalSection(partTitle, timeRange, stageDirection, verbatimLines, clickGuide) {
    const rows = [];

    // Header phân đoạn
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_HEADER },
            children: [
              new Paragraph({
                spacing: { before: 80, after: 80 },
                children: [
                  new TextRun({
                    text: `${partTitle.toUpperCase()} | KHUNG GIỜ: ${timeRange}`,
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

    // Hướng dẫn ngôn ngữ hình thể & sân khấu
    if (stageDirection) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GOLD_TINT },
              borders: BORDER_LIGHT,
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: '🎭 TÁC PHONG SÂN KHẤU, NGỮ ĐIỆU & ĐIỂM DỪNG: ',
                      bold: true,
                      size: 20,
                      color: COLOR_GOLD,
                      font: FONT,
                    }),
                    new TextRun({
                      text: stageDirection,
                      italics: true,
                      size: 20,
                      color: '78350F',
                      font: FONT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    // Lời thoại học thuộc lòng (Có phân tách câu ngắn và hướng dẫn nhấn giọng)
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
            borders: BORDER_LIGHT,
            children: [
              new Paragraph({
                spacing: { before: 80, after: 60 },
                children: [
                  new TextRun({
                    text: '🎙 LỜI THOẠI NGUYÊN VĂN BẮT BUỘC HỌC THUỘC (HỌC KỸ TỪNG CÂU):',
                    bold: true,
                    size: 21,
                    color: COLOR_NAVY,
                    font: FONT,
                  }),
                ],
              }),
              ...verbatimLines.map(
                (line) =>
                  new Paragraph({
                    spacing: { before: 60, after: 60, line: 280 },
                    children: [
                      new TextRun({
                        text: line,
                        size: 21.5,
                        color: COLOR_DARK,
                        font: FONT,
                      }),
                    ],
                  })
              ),
            ],
          }),
        ],
      })
    );

    // Thao tác máy chiếu / demo
    if (clickGuide) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: COLOR_BG_BLUE_TINT },
              borders: BORDER_LIGHT,
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: '💻 THAO TÁC MÀN HÌNH DEMO TƯƠNG ỨNG: ',
                      bold: true,
                      size: 20,
                      color: COLOR_NAVY,
                      font: FONT,
                    }),
                    new TextRun({
                      text: clickGuide,
                      size: 20,
                      color: '1E3A8A',
                      font: FONT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    return new Table({
      width: { size: 9200, type: WidthType.DXA },
      rows: rows,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
    });
  }

  // Bảng Nghiệm Thu: Cái gì chốt - Cái gì sửa
  function createSignOffMatrixTable() {
    const modules = [
      { id: '1', name: 'Đăng ký & Đăng nhập', desc: 'Đăng nhập SĐT an toàn, OTP/Mật khẩu, đổi mật khẩu lần đầu, định danh CEO-83xxx', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '2', name: 'Thẻ VIP mạ vàng & Danh thiếp số kép', desc: 'Mặt trước/sau thẻ VIP; Danh thiếp kép Chính/Phụ; Ẩn hiện SĐT; Quét QR lưu vCard & Profile 2 trang', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '3', name: 'Danh bạ 500 CEO & Hẹn 1-on-1', desc: '11 nhóm ngành hàng; Icon xanh Cobalt; Đặt lịch hẹn 1-on-1 đồng bộ lịch điện thoại', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '4', name: 'Sàn B2B & Bảng Deal Cung-Cầu', desc: 'Đăng bán sản phẩm ưu đãi nội bộ; Kiểm duyệt trước khi lên sàn; Bảng Deal đo Deal Value', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '5', name: 'Quản trị Sự kiện & Vé QR Gatekeeper', desc: 'Ví vé QR E-Ticket; Sơ đồ Cinema Map kéo thả; Soát vé 0.1s Offline Cache; Lucky Draw & Biểu quyết', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '6', name: 'Web CRM: Dashboard 360°', desc: 'Executive Dashboard KPI thời gian thực (Hội viên, Tài chính, Sự kiện, Giao thương)', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '7', name: 'Web CRM: Phân quyền RBAC 6 Ban', desc: 'Thẩm định hồ sơ 3 bước; Phân quyền rạch ròi 6 ban; Audit Log ghi vết 100% thao tác', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '8', name: 'Kế toán tự động hóa VietQR Napas 24/7', desc: 'Tạo mã VietQR động; Gạch nợ tự động sau 1s; Xuất file Excel sổ quỹ chuẩn mẫu HanoiBA', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '9', name: '[BONUS SẴN] VoIP Đàm thoại gọi nền', desc: 'Gọi thoại/video nội bộ mã hóa; Đổ chuông native màn hình khóa khi tắt app', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '10', name: '[BONUS SẴN] Moments Doanh nhân B2B', desc: 'Feed bài viết chia sẻ lễ ký kết, giải thưởng doanh nghiệp, bình luận tinh hoa', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '11', name: '[BONUS SẴN] Lịch họp số Sapphire Hub', desc: 'Quản lý lịch họp online/offline chống trùng phòng; Điểm danh QR động 30s chống gian lận', status: 'CHỐT 100% NGHIỆM THU' },
      { id: '12', name: '[BONUS SẴN] Giao việc Kanban 6 Ban', desc: 'Chuyển nghị quyết thành thẻ việc Kanban giao cho 6 ban chuyên môn theo dõi deadline', status: 'CHỐT 100% NGHIỆM THU' },
    ];

    const rows = [
      new TableRow({
        children: [
          new TableCell({ shading: { type: ShadingType.CLEAR, fill: COLOR_NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF', size: 18, font: FONT })] })] }),
          new TableCell({ shading: { type: ShadingType.CLEAR, fill: COLOR_NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'PHÂN HỆ / CHỨC NĂNG', bold: true, color: 'FFFFFF', size: 18, font: FONT })] })] }),
          new TableCell({ shading: { type: ShadingType.CLEAR, fill: COLOR_NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'CHI TIẾT NGHIỆP VỤ ĐÃ LÀM', bold: true, color: 'FFFFFF', size: 18, font: FONT })] })] }),
          new TableCell({ shading: { type: ShadingType.CLEAR, fill: COLOR_NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'ĐÁNH GIÁ BĐH', bold: true, color: 'FFFFFF', size: 18, font: FONT })] })] }),
          new TableCell({ shading: { type: ShadingType.CLEAR, fill: COLOR_NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'KẾT LUẬN', bold: true, color: 'FFFFFF', size: 18, font: FONT })] })] }),
        ],
      }),
      ...modules.map(
        (m) =>
          new TableRow({
            children: [
              new TableCell({ borders: BORDER_LIGHT, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.id, bold: true, size: 18, font: FONT })] })] }),
              new TableCell({ borders: BORDER_LIGHT, children: [new Paragraph({ children: [new TextRun({ text: m.name, bold: true, size: 18, font: FONT, color: COLOR_NAVY })] })] }),
              new TableCell({ borders: BORDER_LIGHT, children: [new Paragraph({ children: [new TextRun({ text: m.desc, size: 18, font: FONT })] })] }),
              new TableCell({ borders: BORDER_LIGHT, shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GREEN_TINT }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '☑ Đạt chuẩn 100%', size: 18, font: FONT, color: '166534', bold: true })] })] }),
              new TableCell({ borders: BORDER_LIGHT, shading: { type: ShadingType.CLEAR, fill: 'DCFCE7' }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: m.status, bold: true, size: 18, font: FONT, color: '166534' })] })] }),
            ],
          })
      ),
    ];

    return new Table({
      width: { size: 9200, type: WidthType.DXA },
      rows: rows,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
    });
  }

  // Bảng Tình Huống Thực Chiến (Rehearsal Flashcards)
  function createScenarioFlashcard(num, targetRole, objection, strategicAnswer) {
    return new Table({
      width: { size: 9200, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: '1E3A8A' },
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: `TÌNH HUỐNG ${num} | ĐỐI TƯỢNG PHẢN BIỆN: ${targetRole.toUpperCase()}`,
                      bold: true,
                      size: 22,
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
              shading: { type: ShadingType.CLEAR, fill: COLOR_BG_GOLD_TINT },
              borders: BORDER_LIGHT,
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: '❓ CÂU HỎI / BĂN KHOĂN CỦA ĐỐI TÁC: ',
                      bold: true,
                      size: 20,
                      color: COLOR_GOLD,
                      font: FONT,
                    }),
                    new TextRun({
                      text: objection,
                      italics: true,
                      size: 20,
                      color: '78350F',
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
              shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
              borders: BORDER_LIGHT,
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: '💡 LỜI ĐỐI ĐÁP BẢN LĨNH (HỌC THUỘC TỪNG CÂU ĐỂ BẮT NHỊP TỨC THÌ):',
                      bold: true,
                      size: 20,
                      color: '047857',
                      font: FONT,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40, after: 60, line: 280 },
                  children: [
                    new TextRun({
                      text: strategicAnswer,
                      size: 21,
                      color: COLOR_DARK,
                      font: FONT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'CLB DOANH NHÂN CEO 1983 × VICONNECT & VIONE | BẢN HỌC THUỘC LÒNG CHO DIỄN GIẢ',
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
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                  new TextRun({
                    text: ' / ',
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLOR_MUTED,
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Tiêu đề tài liệu Word
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: 'BẢN KỊCH BẢN HỌC THUỘC LÒNG DÀNH CHO DIỄN GIẢ',
                bold: true,
                size: 32,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: 'DIỄN ĐÀN CÔNG BỐ & BÁO CÁO GIẢI PHÁP CHUYỂN ĐỔI SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)',
                bold: true,
                size: 22,
                color: COLOR_GOLD,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: 'Thời lượng: 180 Phút (09:00 – 12:00 - Tròn 3 Tiếng) | Đơn vị: Liên minh ViConnect & ViOne',
                italics: true,
                size: 18,
                color: COLOR_MUTED,
                font: FONT,
              }),
            ],
          }),

          // PHẦN 0: NGHỆ THUẬT SÂN KHẤU DÀNH CHO BẠN
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: 'PHẦN 0: BÍ QUYẾT LÀM CHỦ KHÁN PHÒNG & NGHỆ THUẬT SÂN KHẤU DOANH NHÂN',
                bold: true,
                size: 22,
                color: '991B1B',
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• Quy tắc 1 (Thời gian vàng): Bắt đầu chính xác lúc 09h00 sáng và bế mạc đúng 12h00 trưa (tròn 3 tiếng). Không trễ 1 phút, không kết thúc vội vàng.',
                size: 20,
                color: COLOR_DARK,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• Quy tắc 2 (Ngôn ngữ hình thể & Ánh mắt): Đứng thẳng, hai tay mở tự nhiên ngang thắt lưng khi giới thiệu, mắt quét theo đường chữ W để nhìn vào từng vị trí của Chủ tịch và các Trưởng Ban.',
                size: 20,
                color: COLOR_DARK,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: '• Quy tắc 3 (Khẩu khí & Xưng hô): Giọng nói đĩnh đạc, trầm ấm, nhả chữ dứt khoát. Xưng "Em" và gọi "Các anh chị Ban Điều Hành", thể hiện sự kính trọng nhưng hoàn toàn tự tin về công nghệ.',
                size: 20,
                color: COLOR_DARK,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: '• Ký hiệu trong kịch bản: [NHẤN GIỌNG] = Đọc to, chắc nịch; [NGỪNG 2 GIÂY] = Dừng lại để cả phòng nhìn lên màn hình; [CHỈ TAY] = Đưa tay chỉ về màn hình LED.',
                size: 19,
                color: '047857',
                font: FONT,
                italics: true,
              }),
            ],
          }),

          // PHẦN 1: KHỞI ĐỘNG (09:00 - 09:10)
          createRehearsalSection(
            'Phần 1: Mở Đầu, Định Hình Quy Chuẩn & Giới Thiệu Hai Bên',
            '09:00 – 09:10 (10 phút)',
            'Đứng thẳng, mỉm cười ấm áp, hai tay mở hướng về phía bàn họp. Mắt nhìn lần lượt Chủ tịch và các Trưởng Ban. Bắt đầu đúng 09h00 sáng.',
            [
              '“Em chào tất cả mọi người! [Cúi chào nhẹ, cười thân thiện]”',
              '“Em xin gửi lời chào trân trọng nhất tới các anh chị trong Ban Thường Trực, Ban Điều Hành và toàn thể các anh chị đại diện các Ban Chuyên Môn của CLB Doanh Nhân CEO 1983 - HanoiBA đã có mặt đông đủ trong buổi họp ngày hôm nay.”',
              '“Trước hết, em xin phép giới thiệu về chủ đề của buổi làm việc hôm nay: [NHẤN GIỌNG] Báo cáo, Trình diễn giải pháp và Đánh giá tổng kết chuyển đổi số toàn diện cho CLB Doanh Nhân CEO 1983, bao gồm Hệ thống Quản trị Trung tâm Web CRM và Ứng dụng Di động Dành riêng cho Hội viên.”',
              '“Về phía đoàn công tác của chúng em hôm nay, em xin trân trọng giới thiệu có sự tham gia của: Anh/Chị [...] - Đại diện Ban Lãnh đạo ViConnect và ViOne; Anh/Chị [...] - Phụ trách Kiến trúc Giải pháp; và Em là [...] - Phụ trách Đội ngũ Triển khai Dự án, cùng các anh em kỹ sư công nghệ trực tiếp phát triển hệ thống.”',
              '“Kính thưa các anh chị, buổi họp hôm nay của chúng ta bắt đầu vào đúng [NHẤN GIỌNG] 09h00 sáng và dự kiến sẽ diễn ra trong tròn 3 tiếng đồng hồ, kết thúc vào lúc 12h00 trưa. Khung chương trình 3 tiếng được phân bổ rất khoa học:”',
              '“• Từ 09h00 đến 10h00: Em sẽ báo cáo bối cảnh bài toán và demo trực tiếp toàn bộ sản phẩm trên cả Mobile App và Web CRM.”',
              '“• Từ 10h00 đến 10h45 (tức đến 11h kém 15): Dành trọn vẹn 45 phút để lắng nghe ý kiến nhận xét, đánh giá và giải đáp các câu hỏi phản biện từ phía anh Chủ tịch và các Trưởng Ban.”',
              '“• Từ 10h45 đến 11h45: Hai bên cùng ngồi lại lập Bản Đánh Giá Tổng Kết Cuộc Họp: [NHẤN GIỌNG] Chốt nghiệm thu 100% các chức năng đã làm đạt chuẩn, và phân loại rõ Cái gì cần tinh chỉnh sửa đổi kèm người phụ trách và thời hạn cam kết.”',
              '“• Từ 11h45 đến 12h00: Thống nhất cam kết gửi văn bản chính thức sau cuộc họp, lộ trình bàn giao tài liệu, tập huấn và bế mạc đúng 12h00.”',
              '“Trước khi bước vào nội dung chi tiết, [NHẤN GIỌNG] em xin trân trọng kính mời các anh chị giới thiệu về các thành viên tham gia buổi họp ngày hôm nay ở phía anh chị, để đoàn chúng em được lắng nghe và tiện xưng hô trong suốt 3 tiếng làm việc ạ. Em xin kính mời anh/chị!”',
            ],
            'Chiếu Slide 1 (Bìa Keynote) và Slide 2 (Agenda 3 tiếng). Lùi lại nửa bước, chăm chú lắng nghe, gật đầu mỉm cười và ghi nhanh tên từng anh chị vào sổ tay.'
          ),

          new Paragraph({ spacing: { before: 140 } }),

          // PHẦN 2: BỐI CẢNH & 3 BÀI TOÁN GỐC (09:10 - 09:25)
          createRehearsalSection(
            'Phần 2: Bối Cảnh, 3 Bài Toán Gốc & Bản Đồ 3 Trụ Cột ViConnect',
            '09:10 – 09:25 (15 phút)',
            'Chuyển giọng ấm áp, thể hiện sự đồng cảm sâu sắc với nỗi vất vả của Ban Điều Hành khi quản lý 500+ CEO bằng phương thức thủ công.',
            [
              '“Dạ vâng, em xin trân trọng cảm ơn phần giới thiệu của anh/chị! Rất vinh dự cho chúng em khi được đồng hành cùng các anh chị lãnh đạo đầy nhiệt huyết của HanoiBA.”',
              '“Thưa các anh chị, hôm nay em sẽ trình bày bức tranh hoàn chỉnh về giải pháp mà đội ngũ chúng em đã ngày đêm hoàn thiện dựa trên chính bài toán thực tế mà các anh chị đã đặt ra ngay từ những ngày đầu.”',
              '“Khi nhận bài toán từ CLB Doanh Nhân CEO 1983, chúng em đã lắng nghe và đúc kết thành [NHẤN GIỌNG] 3 nhóm yêu cầu cốt lõi lớn nhất của các anh chị:”',
              '“1. Thứ nhất là Quản trị thành viên: Làm sao quản lý tập trung và chuẩn hóa hơn 500 hồ sơ lãnh đạo sinh năm Quý Hợi 1983? Thoát khỏi cảnh dữ liệu phân tán trên file Excel, Zalo; quy trình kết nạp, thẩm định tư cách hội viên phải số hóa theo 6 Ban chuyên môn và có một tấm Thẻ hội viên điện tử xứng tầm đẳng cấp doanh nhân.”',
              '“2. Thứ hai là Quản lý sự kiện: Các chương trình Đại hội, Hội thảo, Gala lớn của CLB quy tụ 300 - 500 khách mời. Làm sao xếp chỗ ngồi trực quan, không lộn xộn; khâu soát vé bằng mã QR phải siêu nhanh dưới 1 giây để không ùn tắc sảnh; và có các tính năng tương tác như Lucky Draw quay số may mắn, biểu quyết đại hội ngay trên điện thoại.”',
              '“3. Thứ ba là Xúc tiến thương mại: Đây chính là trái tim của một tổ chức doanh nhân. Làm thế nào để các đồng niên 1983 trao cơ hội kinh doanh cho nhau dễ dàng nhất? Cần có Sàn giao thương nội bộ B2B (Marketplace), nơi trưng bày sản phẩm ưu đãi của thành viên, Bảng tin cơ hội kinh doanh thực chiến, và đặc biệt là công cụ kết nối đặt lịch hẹn 1-on-1 trực tiếp giữa các CEO.”',
              '“Thưa các anh chị, dựa trên yêu cầu của các anh chị kết hợp cùng giải pháp của ViOne và ViConnect, chúng em đã xây dựng nên Bộ giải pháp kép đồng bộ thời gian thực: Web CRM Quản trị và Mobile App CEO 1983.”',
              '“Đặc biệt, giải pháp được phân định rõ thành [NHẤN GIỌNG] 3 TRỤ CỘT TÍNH NĂNG:”',
              '“• Trụ Cột 1: 3 YÊU CẦU CỐT LÕI BAN ĐẦU CỦA CEO 1983 (ĐÃ HOÀN THÀNH 100%) — Đáp ứng đầy đủ, chính xác từng yêu cầu nghiệp vụ về Thành viên, Sự kiện và Xúc tiến thương mại.”',
              '“• Trụ Cột 2: CÁC TÍNH NĂNG BONUS VICONNECT ĐÃ CÓ SẴN (SỬ DỤNG ĐƯỢC NGAY 100%) — Được ViConnect tặng kèm hoàn toàn miễn phí, không thu phí bản quyền: Đàm thoại VoIP gọi nền native, Mạng xã hội Moments Doanh nhân B2B, Lịch họp số Sapphire Hub điểm danh QR động 30s, Giao việc Kanban 6 Ban, và Kế toán tự động VietQR Napas 24/7 gạch nợ 1s.”',
              '“• Trụ Cột 3: CÁC TÍNH NĂNG BONUS VICONNECT ĐANG LÀM THEO LỘ TRÌNH R&D (NÂNG CẤP TỰ ĐỘNG QUA CLOUD OTA) — Trợ lý giọng nói AI Voice tiếng Việt lái xe rảnh tay, AI Smart Deal Matching ghép đôi cung cầu, và Mạng lưới Liên minh Đa Hiệp Hội HanoiBA.”',
              '“Hôm nay em sẽ trình bày theo đúng quy trình sử dụng và chức năng thực tế: Mobile App trước dưới góc nhìn hội viên, sau đó tới Web CRM dưới góc nhìn Ban Điều Hành. Sau đây, em xin phép bắt đầu phần demo trên Mobile App!”',
            ],
            'Chiếu Slide 3 (3 Bài toán gốc), Slide 4 (Kiến trúc kép) và Slide 5 (Bản đồ 3 trụ cột). Chuẩn bị sẵn màn hình điện thoại kết nối máy chiếu.'
          ),

          new Paragraph({ spacing: { before: 140 } }),

          // PHẦN 3A: DEMO MOBILE APP & BONUS (09:25 - 09:45)
          createRehearsalSection(
            'Phần 3A: Trình Diễn Thực Tế Mobile App Hội Viên & Hệ Tính Năng Bonus',
            '09:25 – 09:45 (20 phút)',
            'Cầm điện thoại thao tác trực tiếp, ngón tay lướt dứt khoát. Nói đến đâu ngón tay chạm đến đó, dừng 2 - 3 giây ở các điểm nhấn như Thẻ VIP mạ vàng, Danh thiếp số kép, QR code, VoIP Call nền và Trợ lý AI để cả khán phòng trầm trồ.',
            [
              '“1. Về Đăng nhập & Trang chủ: Hội viên mở App CEO 1983, giao diện mang tông màu Deep Cobalt Navy và viền vàng hổ phách Warm Amber Gold sang trọng. Đăng nhập an toàn bằng số điện thoại. Trên trang chủ, hội viên lướt xem tin tức nóng hổi của CLB, mở kho tài liệu văn kiện mà không gặp bất kỳ lỗi nào.”',
              '“2. Về Thẻ Hội Viên VIP & Danh Thiếp Số Kép (Đây là điểm các anh chị rất quan tâm!): [CHỈ TAY LÊN MÀN HÌNH] Trên màn hình là Thẻ VIP mạ vàng chính danh CEO-83xxx. Đặc biệt, chúng em đã phát triển cơ chế Danh thiếp số kép: Danh thiếp chính và Danh thiếp phụ. Hội viên hoàn toàn chủ động chọn trường thông tin nào muốn hiển thị cho người ngoài thấy (như Số điện thoại, Email, Địa chỉ, Mạng xã hội).”',
              '“Khi đối tác quét mã QR hoặc mở link /card/:code, họ [NHẤN GIỌNG] KHÔNG CẦN CÀI APP vẫn xem được Thẻ VIP mạ vàng, bấm Lưu danh bạ vCard vào điện thoại chỉ với 1 chạm, và xem được trọn vẹn Hồ sơ năng lực Company Profile 2 trang của doanh nghiệp ở ngay bên dưới! [NGỪNG 2 GIÂY]”',
              '“3. Về Danh bạ & Đặt lịch hẹn 1-on-1: Toàn bộ hơn 500 CEO được phân loại theo 11 nhóm ngành hàng. Tất cả các nút bấm được tối ưu thành màu xanh Cobalt Navy sang trọng. Em chỉ cần bấm nút Đặt lịch hẹn 1-on-1, chọn mục đích làm việc là lời mời gửi thẳng tới CEO đối tác và tự động đồng bộ vào lịch điện thoại.”',
              '“4. Về Sàn Marketplace B2B & Cơ hội kinh doanh: Nơi trưng bày các sản phẩm với chính sách ưu đãi nội bộ đặc quyền. Bảng Cơ hội kinh doanh hiển thị các nhu cầu Mua, Bán, Hợp tác kèm thanh giá trị Deal theo thời gian thực.”',
              '“5. Về Sự kiện, Vé QR & Biểu quyết: Khi CLB có sự kiện, hội viên đăng ký và nhận ngay Ví vé QR điện tử hiển thị rõ số bàn và số ghế VIP đã được Ban tổ chức xếp chỗ. Tại sự kiện chỉ cần giơ mã QR quét 0.1s là xong, kèm mã số Lucky Draw và tính năng Biểu quyết đại hội 1 người 1 phiếu minh bạch tức thì.”',
              '“VÀ ĐÂY LÀ ĐIỂM ĐẶC BIỆT MÀ VICONNECT DÀNH TẶNG CHO CLB (CÁC TÍNH NĂNG BONUS TRÊN APP):”',
              '“Thứ nhất [ViConnect ĐÃ CÓ SẴN]: Đàm thoại VoIP nội bộ bảo mật & Đổ chuông cuộc gọi nền. Các CEO có thể gọi thoại hoặc video call hoàn toàn miễn phí trên nền tảng mã hóa riêng. Đặc biệt, kể cả khi hội viên khóa màn hình hoặc tắt ứng dụng, khi có cuộc gọi đến, [NHẤN GIỌNG] điện thoại vẫn rung chuông và hiện giao diện nhận/từ chối native ngay trên màn hình khóa y hệt cuộc gọi viễn thông!”',
              '“Thứ hai [ViConnect ĐÃ CÓ SẴN]: Bảng tin Moments Doanh nhân — không gian tương tác như một LinkedIn thu nhỏ dành riêng cho 500+ CEO 1983 để chia sẻ các khoảnh khắc ký kết hợp đồng, giải thưởng và thành tựu kinh doanh!”',
              '“Thứ ba [ViConnect ĐANG LÀM THEO LỘ TRÌNH R&D]: Trợ lý giọng nói AI Voice tiếng Việt — hỗ trợ các CEO điều khiển rảnh tay khi lái xe ô tô, chỉ cần bấm micro và nói ‘Mở danh bạ’, ‘Tìm kiếm sự kiện Gala’, AI sẽ tự động điều hướng tức thì; cùng Thuật toán AI Smart Deal Matching tự động phân tích và kết nối cung cầu!”',
            ],
            'Chiếu lần lượt Slide 6 -> 13. Bấm trực tiếp trên App: /association/login -> /association (Tin tức & Kho tài liệu) -> /association/card (Danh thiếp số, CardPreviewModal) -> /association/members (Hẹn 1-on-1) -> /association/products & opportunities -> /association/events (Vé QR) -> Giới thiệu tính năng Call VoIP, Moments B2B & AI Voice.'
          ),

          new Paragraph({ spacing: { before: 140 } }),

          // PHẦN 3B: DEMO WEB CRM & BONUS QUẢN TRỊ (09:45 - 10:00)
          createRehearsalSection(
            'Phần 3B: Trình Diễn Trung Tâm Quản Trị Web CRM & Tính Năng Mở Rộng',
            '09:45 – 10:00 (15 phút)',
            'Chuyển màn hình sang Web CRM máy tính toàn màn hình. Tác phong điềm đạm, mạch lạc, nhấn mạnh vào khả năng kiểm soát chặt chẽ, minh bạch và các tính năng mở rộng quản trị cuộc họp số, Kanban.',
            [
              '“Kính thưa các anh chị, để vận hành trơn tru toàn bộ các trải nghiệm trên điện thoại của hội viên, đằng sau đó là Cổng Quản Trị Trung Tâm Web CRM dành cho Ban Điều Hành và 6 Ban Chuyên Môn.”',
              '“1. Executive Dashboard: Ngay khi đăng nhập, Ban Lãnh đạo nắm trọn vẹn sức khỏe câu lạc bộ: Biểu đồ hội viên mới, dòng tiền giao thương, tình hình thu nợ hội phí và cảnh báo các đầu việc sắp đến hạn.”',
              '“2. Quản lý hội viên & Ma trận phân quyền 6 chuyên ban: Khi có hồ sơ gia nhập nộp online, Ban Thư ký tiếp nhận, Ban Thành viên thẩm định tính pháp lý của doanh nghiệp và bấm duyệt cấp mã thẻ hội viên chỉ với 1 click. Hệ thống phân quyền chặt chẽ cho Ban Truyền thông, Ban Thành viên, Ban Xúc tiến, Ban Tài chính, Ban Thiện nguyện và Ban Quản trị; ban nào làm đúng việc của ban đó.”',
              '“3. Sơ đồ xếp chỗ Cinema Map & Soát vé Gatekeeper: Đây là giải pháp triệt tiêu hoàn toàn sự lộn xộn tại các Gala 500 khách. Ban Tổ chức kéo thả trực quan vị trí bàn tròn, bàn VIP như rạp chiếu phim; ứng dụng Gatekeeper quét vé QR chỉ mất 0.1 giây, ngay cả khi 4G chập chờn vẫn check-in mượt mà.”',
              '“VÀ ĐÂY LÀ GIÁ TRỊ GIA TĂNG (BONUS) TRÊN WEB CRM MÀ VICONNECT TRANG BỊ TIẾP:”',
              '“• [ViConnect ĐÃ CÓ SẴN]: Hệ thống Quản lý Cuộc họp Số Sapphire Hub & Giao việc Kanban 6 Ban. Ban Thường Trực có thể tạo lịch họp online (Zoom, Google Meet, UniWork Meet) hoặc phòng họp vật lý, chống trùng lịch tự động. Điểm danh đại biểu bằng mã QR động đổi mỗi 30 giây chống gian lận. Sau cuộc họp, biên bản được chuyển thành các thẻ công việc Kanban giao thẳng cho 6 Ban chuyên môn để theo dõi deadline sát sao!”',
              '“• [ViConnect ĐÃ CÓ SẴN]: Kế toán tự động hóa VietQR Napas 24/7. Khi thu hội phí 5 triệu/năm, hệ thống tự sinh mã VietQR động có sẵn số tiền và mã hóa đơn. Hội viên chuyển khoản là hệ thống tự động gạch nợ sau 1 giây, xuất biên lai ngay trên App. Ban Tài chính chỉ cần bấm nút là xuất trọn vẹn file Excel đối soát thu chi nộp cho HanoiBA.”',
              '“• [ViConnect ĐANG LÀM THEO LỘ TRÌNH R&D]: Kiến trúc Liên minh đa hiệp hội Multi-Tenant Network. Nền tảng ViConnect đang xây dựng sẵn cổng kết nối liên thông, sẵn sàng mở rộng giao thương chéo với CLB CEO 1982, CEO 1984, Hội Doanh nhân Trẻ các tỉnh thành mà dữ liệu nội bộ của CEO 1983 vẫn được bảo mật phân lập 100%!”',
            ],
            'Chiếu lần lượt Slide 14 -> 19. Bấm trực tiếp trên Web CRM: Dashboard -> Quản lý hội viên -> Ma trận phân quyền RBAC -> Sơ đồ xếp chỗ Cinema Map -> Quản lý lịch họp số & Giao việc Kanban -> Kế toán sổ quỹ VietQR & Nút xuất Excel.'
          ),

          new Paragraph({ spacing: { before: 140 } }),

          // PHẦN 4: NHẬN XÉT TỪ ĐỐI TÁC (10:00 - 10:45 / ĐẾN 11H KÉM 15)
          createRehearsalSection(
            'Phần 4: Nhận Xét Từ Đối Tác & Đối Thoại Phản Biện Chuyên Sâu',
            '10:00 – 10:45 (đến 11h kém 15 - 45 phút)',
            'Chủ động mở lời mời, mắt nhìn về phía Chủ tịch và các Trưởng Ban. Tay cầm bút ghi chép cẩn thận từng câu hỏi vào sổ, gật đầu tiếp thu trước khi trả lời.',
            [
              '“Kính thưa anh Chủ tịch, các anh chị trong Ban Thường Trực và toàn thể các anh chị Trưởng Ban Chuyên Môn!”',
              '“Đồng hồ hiện tại vừa đúng 10h00 sáng. Chúng em đã hoàn thành phần báo cáo và demo thực tế toàn bộ các phân hệ từ Mobile App hội viên đến Web CRM quản trị.”',
              '“Đúng như kế hoạch làm việc đã thống nhất, [NHẤN GIỌNG] từ bây giờ đến 10h45 (tức đến 11h kém 15), chúng em xin trân trọng dành trọn vẹn 45 phút này để lắng nghe những đánh giá, nhận xét, góp ý và những câu hỏi phản biện từ phía các anh chị.”',
              '“Chúng em hiểu rằng, các anh chị là những người trực tiếp vận hành CLB, ý kiến của các anh chị là thước đo thực tế nhất để hệ thống đi vào đời sống của hơn 500 doanh nhân CEO 1983.”',
              '“Em xin trân trọng kính mời anh Chủ tịch, chị Tổng thư ký và các anh chị Trưởng Ban: Ban Thành viên, Ban Sự kiện, Ban Xúc tiến, Ban Tài chính, Ban Truyền thông và Ban Quản trị chia sẻ những nhận xét và câu hỏi đầu tiên ạ!”',
              'NGUYÊN TẮC 4 BƯỚC ỨNG ĐỐI CỦA BẠN:',
              '1. Chăm chú lắng nghe & ghi chép cẩn thận vào sổ tay, không ngắt lời.',
              '2. Đồng cảm & Xác nhận: "Dạ vâng, câu hỏi của anh/chị rất xác đáng và chạm đúng thực tế vận hành..."',
              '3. Trả lời dứt khoát, đi vào bản chất công nghệ ViConnect (áp dụng Bộ 10 tình huống bên dưới).',
              '4. Xác nhận sự hài lòng và phân loại vào biên bản: Cái gì chốt - Cái gì sửa.',
            ],
            'Chiếu Slide 20 (Bảng so sánh trước sau) và Slide 21 (Nhận xét đối tác & 10 tình huống). Lắng nghe và trả lời ngắn gọn, tự tin, đúng trọng tâm.'
          ),

          new Paragraph({ spacing: { before: 140 } }),

          // PHẦN 5: BẢN ĐÁNH GIÁ TỔNG KẾT: CÁI GÌ CHỐT, CÁI GÌ SỬA (10:45 - 11:45)
          createRehearsalSection(
            'Phần 5: Bản Đánh Giá Tổng Kết Cuộc Họp & Chốt Chức Năng',
            '10:45 – 11:45 (60 phút)',
            'Phong thái dứt khoát, chuyên nghiệp, dẫn dắt vào trọng tâm để chốt biên bản. Khẳng định 12 module cốt lõi đã hoàn thành đạt chuẩn để ký nghiệm thu.',
            [
              '“Kính thưa các anh chị, hiện tại là 10h45 sáng (11h kém 15).”',
              '“Sau 45 phút trao đổi và nhận xét rất sôi nổi, em xin phép bước sang phần quan trọng nhất của buổi làm việc hôm nay: [NHẤN GIỌNG] TỔNG KẾT ĐÁNH GIÁ CUỘC HỌP & LẬP BIÊN BẢN CHỐT CHỨC NĂNG: CÁI GÌ CHỐT, CÁI GÌ SỬA.”',
              '“Mục tiêu của chúng em hôm nay là: [NHẤN GIỌNG] Những chức năng đội ngũ đã làm hoàn thiện và đáp ứng đúng yêu cầu của CLB thì chúng ta cùng nhau CHỐT NGHIỆM THU 100%. Còn những điểm các anh chị vừa góp ý cần tinh chỉnh, chúng em ghi nhận chi tiết vào danh mục CÁI CẦN SỬA, có người phụ trách rõ ràng và cam kết thời hạn hoàn thành.”',
              '“Sau buổi họp hôm nay, toàn bộ nội dung chốt này sẽ được chúng em gửi lại bằng văn bản chính thức có ký xác nhận cho Ban Thường Trực và Ban Thư Ký để làm căn cứ triển khai.”',
              '“Sau đây, em xin phép chiếu trực tiếp Bảng Đánh Giá Tổng Kết & Chốt Chức Năng lên màn hình để hai bên cùng đối soát từng mục ạ!”',
            ],
            'Chiếu Slide 22 (Bản đánh giá tổng kết: Cái gì chốt - Cái gì sửa). Mở file biểu mẫu trên màn hình lớn và điền trực tiếp cùng Ban Điều Hành.'
          ),

          new Paragraph({ spacing: { before: 100, after: 60 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'BIÊN BẢN ĐỐI SOÁT & CHỐT 100% CÁC CHỨC NĂNG ĐÃ LÀM (ACCEPTANCE MATRIX):',
                bold: true,
                size: 20,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          createSignOffMatrixTable(),

          new Paragraph({ spacing: { before: 140 } }),

          // PHẦN 6: KẾ HOẠCH BÀN GIAO, CAM KẾT VĂN BẢN & BẾ MẠC (11:45 - 12:00)
          createRehearsalSection(
            'Phần 6: Kế Hoạch Bàn Giao, Cam Kết Văn Bản & Lời Cảm Ơn Bế Mạc Đúng 12:00',
            '11:45 – 12:00 (15 phút)',
            'Phong thái tự tin, đứng thẳng người, giọng nói dõng dạc, tràn đầy năng lượng tích cực. Cam kết gửi lại văn bản chính thức và kết thúc cuộc họp đúng 12h00 trưa.',
            [
              '“Kính thưa các anh chị Ban Điều Hành, để đảm bảo tính chuẩn mực và pháp lý cao nhất, ngay sau buổi làm việc hôm nay, [NHẤN GIỌNG] toàn bộ nội dung trao đổi sẽ được ViConnect gửi lại cho các anh chị bằng văn bản chính thức, cụ thể:”',
              '“1. Trong vòng 24 giờ (ngay ngày mai): Chúng em sẽ gửi lại Biên Bản Họp Tổng Kết Chính Thức đã được hoàn thiện đầy đủ chữ ký của đại diện hai bên.”',
              '“2. Trong vòng 48 giờ: Chúng em sẽ gửi Văn Bản Kế Hoạch Chỉnh Sửa Chi Tiết (Action Plan) đối với các hạng mục trong Danh mục Cần Sửa, cam kết rõ ngày bàn giao từng tính năng (3 - 5 ngày làm việc).”',
              '“3. Trong vòng 03 ngày: Chúng em gửi bản mềm và bản in Trọn bộ Tài liệu Hướng Dẫn Sử Dụng (HDSD) chuẩn hóa dạng PDF và các video clip ngắn 60 giây cho từng phân ban.”',
              '“Đồng thời, chúng em đề xuất lộ trình bàn giao 3 giai đoạn:”',
              '“• Giai đoạn 1: Bàn giao tài khoản quản trị và tài liệu cho Ban Thường Trực và Ban Thư Ký.”',
              '“• Giai đoạn 2: Đội ngũ kỹ thuật ViConnect tổ chức 01 buổi đào tạo tập huấn chuyên sâu 30 phút (trực tiếp hoặc qua Zoom) cho Ban Thư Ký và 6 Ban Chuyên Môn để các anh chị tự tay thao tác nhuần nhuyễn.”',
              '“• Giai đoạn 3: Ban Điều Hành trải nghiệm thử thực tế trong 3 - 5 ngày trước khi chính thức phát động toàn thể hơn 500 hội viên tải App.”',
              '“Đồng hồ hiện tại vừa đúng [NHẤN GIỌNG] 12h00 trưa! Buổi làm việc 3 tiếng hôm nay đã diễn ra vô cùng thành công, trách nhiệm và hiệu quả. Chúng em xin bày tỏ lòng biết ơn chân thành nhất tới anh Chủ tịch, các anh chị trong Ban Thường Trực, Ban Điều Hành và 6 Ban Chuyên Môn đã dành trọn vẹn buổi sáng làm việc nghiêm túc cùng đoàn công tác.”',
              '“Kính chúc CLB Doanh Nhân CEO 1983 ngày càng vững mạnh, đoàn kết, kinh doanh đại thành công và luôn giữ vững tinh thần: [NHẤN GIỌNG] BẢN LĨNH – TIÊN PHONG – KẾT NỐI – PHÁT TRIỂN! Em xin trân trọng cảm ơn tất cả mọi người ạ! [CÚI CHÀO TRÂN TRỌNG]”',
            ],
            'Chiếu Slide 23 (Cam kết văn bản) và Slide 24 (Cảm ơn & Hotline 24/7). Cúi đầu chào trân trọng, bắt tay các anh chị lãnh đạo khi kết thúc lúc 12:00.'
          ),

          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '═════════════════════════════════════════════════════════════════',
                color: COLOR_BORDER,
                size: 18,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: 'BỘ CẨM NANG 10 TÌNH HUỐNG THỰC CHIẾN DÀNH CHO DIỄN GIẢ',
                bold: true,
                size: 26,
                color: COLOR_NAVY,
                font: FONT,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: 'Để bạn hoàn toàn làm chủ khán phòng và trả lời sắc bén, thuyết phục trước các câu hỏi khó của Ban Điều Hành trong khung giờ 10:00 - 10:45 (đến 11h kém 15), dưới đây là 10 tình huống thực tế và câu trả lời mẫu:',
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
            'Ban Thành Viên - Bảo Mật Số Điện Thoại',
            '“Hội viên trong CLB đều là lãnh đạo doanh nghiệp lớn, rất sợ bị lộ số điện thoại cho các bên bảo hiểm, bất động sản hoặc đối thủ ngoài xã hội lấy cắp để gọi điện làm phiền.”',
            '“Dạ thưa anh/chị Trưởng Ban Thành viên, đây là vấn đề chúng em ưu tiên bảo mật ở cấp độ cao nhất. Hệ thống được trang bị cơ chế Danh thiếp số kép (Primary & Secondary Card). Trên mỗi danh thiếp, hội viên có quyền tự bật/tắt hiển thị Số điện thoại, Email, Địa chỉ. Khi đối tác bên ngoài quét mã QR, nếu CEO chọn ẩn SĐT thì người ngoài chỉ thấy tên, chức danh và logo doanh nghiệp. Đặc biệt, danh bạ toàn thể 500+ CEO được bảo vệ trong phân vùng khép kín, chỉ có tài khoản hội viên đã được Ban Thành Viên thẩm định và cấp mã CEO-83xxx mới đăng nhập tra cứu được, hệ thống ngăn chặn 100% các công cụ cào dữ liệu từ bên ngoài ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            2,
            'Ban Sự Kiện - Soát Vé Gala Khi Mất Sóng 4G / Nghẽn Mạng',
            '“Các sự kiện Gala lớn tổ chức ở sảnh tầng hầm khách sạn, mạng 4G và Wifi thường rất yếu hoặc mất kết nối. 500 người đến dồn dập trong 15 phút, app có bị đơ không? Sơ đồ ghế ngồi có bị nhảy lộn xộn không?”',
            '“Dạ câu hỏi của anh/chị phản ánh đúng thực tế khốc liệt tại các Gala lớn. Ứng dụng Gatekeeper của chúng em được thiết kế chuyên dụng cho sự kiện: Trước giờ G, toàn bộ danh sách vé được tải sẵn về bộ nhớ đệm Offline Cache trên máy quét. Tốc độ nhận diện mã QR chỉ mất đúng 0.1 giây. Kể cả khi mất mạng hoàn toàn, máy quét vẫn bíp check-in bình thường, hiện rõ số bàn số ghế VIP để lễ tân dẫn khách, và lưu lại lịch sử để tự đồng bộ lên đám mây khi có sóng trở lại. Còn sơ đồ Cinema Map được cố định tọa độ trên máy chủ, Ban tổ chức có thể xuất thêm 1 bản sơ đồ PDF in giấy dự phòng cho lễ tân ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            3,
            'Ban Xúc Tiến - Sàn Marketplace So Với Nhóm Zalo',
            '“Các doanh nghiệp xưa nay vẫn quen đăng bài bán hàng lên nhóm Zalo CLB. Giờ đưa lên Marketplace trên App thì có gì hơn? Làm sao chứng minh giá trị giao thương mang lại cho CLB?”',
            '“Dạ thưa anh/chị, nhóm Zalo có nhược điểm chí mạng là bài đăng bị trôi sau vài tiếng, không phân loại ngành nghề, và thành viên ngoài có thể trà trộn spam. Sàn Marketplace trên App ViConnect giải quyết triệt để: 1. Sản phẩm được lưu trữ vĩnh viễn theo 11 nhóm ngành hàng, kèm chính sách ưu đãi đặc quyền cho hội viên 1983; 2. Bảng Cơ hội kinh doanh cho phép tạo các Deal mua bán có giá trị rõ ràng; 3. Hệ thống có form ghi nhận Giá trị giao dịch thành công (Deal Value), giúp Ban Xúc tiến có số liệu thống kê thời gian thực trên CRM: Tháng này CLB đã giao thương được bao nhiêu tỷ đồng, phục vụ đắc lực cho báo cáo thành tích lên Hội Doanh Nhân Trẻ Hà Nội ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            4,
            'Ban Tài Chính - Dòng Tiền Thu Chi & VietQR Napas 24/7',
            '“Khi hội viên đóng hội phí 5 triệu/năm hoặc mua vé tài trợ sự kiện qua mã QR trên App, tiền chảy về đâu? Kế toán có phải ngồi rà từng dòng sao kê ngân hàng không?”',
            '“Dạ thưa Ban Tài Chính, chúng em xin khẳng định 100%: ViConnect KHÔNG BAO GIỜ giữ tiền của CLB. Tiền được chuyển khoản trực tiếp vào tài khoản ngân hàng chính thức của CLB CEO 1983 tại ngân hàng (MB Bank, Vietcombank...). Giải pháp của chúng em là cổng công nghệ VietQR Napas 24/7: Hệ thống tự sinh mã QR động chứa đúng số tiền và mã hóa đơn của hội viên. Ngay khi tiền về tài khoản CLB, hệ thống nhận tín hiệu và tự động gạch nợ sau 1 giây, xuất biên lai điện tử. Cuối tháng kế toán chỉ cần bấm nút là xuất trọn vẹn file Excel đối soát thu chi chuẩn mẫu nộp HanoiBA, giải phóng 95% công sức thủ công ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            5,
            'Ban Truyền Thông - Dung Lượng Ảnh/Video & Phân Quyền Đăng Tin',
            '“Sau mỗi sự kiện Gala, ban truyền thông có hàng nghìn tấm ảnh chất lượng cao và clip phóng sự, hệ thống có bị giới hạn dung lượng không? Ai được quyền đăng tin lên app?”',
            '“Dạ hệ thống được thiết kế rất thông minh: Bài viết sự kiện trên App cho phép gắn trực tiếp đường dẫn Kho ảnh Google Drive gốc dung lượng cao để hội viên tải ảnh nét căng về máy. Còn trên App, hệ thống tối ưu ảnh hiển thị siêu nhẹ lướt mượt mà. Về phân quyền: Chỉ có tài khoản của Ban Truyền Thông mới có quyền tạo và duyệt bài viết tin tức; hội viên chỉ có quyền bình luận văn minh trên mục Moments Doanh nhân, đảm bảo trang tin CLB luôn chuẩn mực và chính thống ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            6,
            'Ban Thư Ký - Quy Trình Duyệt Hồ Sơ Kết Nạp 3 Bước',
            '“Khi có doanh nhân nộp đơn xin gia nhập từ Landing page, quy trình duyệt diễn ra thế nào? Có sợ duyệt nhầm hoặc không biết ai là người duyệt không?”',
            '“Dạ quy trình duyệt hồ sơ trên CRM tuân thủ nghiêm ngặt chuẩn 3 bước: Bước 1: Ban Thư ký tiếp nhận đơn online và kiểm tra sơ bộ; Bước 2: Chuyển Ban Thành viên thẩm định tính pháp lý của doanh nghiệp; Bước 3: Chủ tịch hoặc Tổng Thư Ký bấm duyệt cuối cùng. Khi duyệt xong, hệ thống tự động sinh Mã hội viên CEO-83xxx và gửi email chào mừng kèm tài khoản đăng nhập cho hội viên mới. Mọi thao tác đều được ghi lại trong nhật ký hệ thống (Audit Logs), hiển thị rõ ai duyệt lúc mấy giờ mấy phút, đảm bảo tính kỷ luật và minh bạch tuyệt đối ạ.”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            7,
            'Chủ Tịch CLB - Bản Quyền & Chi Phí Tương Lai',
            '“Hiện tại ViConnect làm rất nhiệt tình và tặng nhiều tính năng. Nhưng sau này (1 - 2 năm nữa) có thu phí duy trì cao không? Các tính năng Bonus có bị cắt đi hoặc bắt mua thêm License không?”',
            '“Dạ thưa anh Chủ tịch và các anh chị trong Ban Thường Trực! Đây là cam kết chiến lược bằng văn bản của ViConnect: Chúng em coi CLB Doanh Nhân CEO 1983 là mô hình chuyển đổi số kiểu mẫu hàng đầu của HanoiBA. Toàn bộ các chức năng đã xây dựng và hệ tính năng Bonus có sẵn (VoIP, Moments B2B, Lịch họp Sapphire Hub, Kanban, VietQR) được bàn giao sử dụng vĩnh viễn, KHÔNG BAO GIỜ phát sinh chi phí bản quyền hay cắt bớt tính năng. Còn các tính năng tương lai trong lộ trình R&D của ViConnect (AI Voice, AI Matching, Liên minh đa hiệp hội), CLB sẽ được nâng cấp hoàn toàn miễn phí qua Cloud OTA. ViConnect cam kết đồng hành dài hạn và bảo hành kỹ thuật 24/7 cho CLB ạ!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            8,
            'Xử Lý Scope Creep - Đối Tác Đề Xuất Tính Năng Ngoài Phạm Vi',
            '“Một Trưởng ban hào hứng yêu cầu: ‘Tôi muốn hệ thống làm thêm cả chức năng quản lý chấm công nhân viên và chấm điểm tín dụng ngân hàng cho các công ty hội viên...’”',
            '“Dạ vâng, ý tưởng của anh/chị thực sự rất xuất sắc và thể hiện tầm nhìn dài hạn cho các doanh nghiệp thành viên. Tuy nhiên, để đảm bảo hệ thống phục vụ đúng tôn chỉ trọng tâm của CLB là Kết Nối & Giao Thương và bàn giao đúng tiến độ, em xin phép ghi nhận tính năng này vào Danh mục 3: Đề xuất mở rộng trong lộ trình R&D tương lai. Trước mắt, trong buổi họp hôm nay, chúng ta cùng tập trung chốt nghiệm thu trọn vẹn các tính năng cốt lõi đang có để sớm đưa app đến tay 500 hội viên sinh hoạt đã anh/chị nhé!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            9,
            'Xử Lý Góp Ý Giao Diện - Phàn Nàn Chi Tiết Chưa Đúng Ý',
            '“Trưởng ban nhận xét: ‘Cái màu nút này tôi thấy chưa ưng lắm, hoặc form này nên bỏ bớt 1 ô nhập đi...’”',
            '“Dạ vâng, góp ý của anh/chị rất tinh tế và chính xác! Phần mềm này sinh ra là để phục vụ các anh chị sử dụng thuận tiện nhất. Em xin phép ghi ngay chi tiết này vào Danh mục 2: Các nội dung cần tinh chỉnh (Cái Cần Sửa) trong biên bản hôm nay. Đội ngũ kỹ thuật của chúng em cam kết sẽ hoàn thành việc điều chỉnh này trong vòng 3 ngày làm việc và gửi bản cập nhật để anh/chị nghiệm thu ạ!”'
          ),
          new Paragraph({ spacing: { before: 120 } }),

          createScenarioFlashcard(
            10,
            'Ban Thường Trực - Trách Nhiệm Gửi Văn Bản Sau Họp',
            '“Hôm nay nói rất hay, nhưng sau cuộc họp ai là người chịu trách nhiệm gửi lại biên bản và theo dõi tiến độ sửa chữa?”',
            '“Dạ thưa các anh chị, em - [Họ tên diễn giả], với tư cách là Trưởng đại diện Đội ngũ Triển khai của ViConnect, cùng anh/chị [Tên lãnh đạo ViConnect] sẽ trực tiếp chịu trách nhiệm trước Ban Thường Trực. Ngay trong ngày mai, chúng em sẽ gửi văn bản Biên bản họp chính thức qua email và văn bản giấy có dấu đỏ cho Ban Thư Ký. Mọi tiến độ cập nhật sẽ được thông báo liên tục hàng ngày cho đến khi hệ thống phát động hoàn tất ạ!”'
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
      console.warn(`[WARN] File ${docxPath} đang được mở bởi ứng dụng khác (Microsoft Word). Đang lưu sang file thay thế...`);
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
