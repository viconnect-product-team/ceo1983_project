const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

function toBase64(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).replace('.', '');
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
      return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
    }
  } catch (e) {
    console.warn('Cannot read', filePath, e.message);
  }
  return '';
}

async function main() {
  const root = path.resolve(__dirname);
  const logoPath = path.join(root, 'apps/ceo1983_app_fe/public/ceo1983-official-logo.png');
  const crmDashPath = path.join(root, 'apps/ceo1983_app_fe/public/docs/images/evidence/02_crm_dashboard.png');
  const appVipCardPath = path.join(root, 'apps/ceo1983_app_fe/public/docs/images/evidence/09_app_vip_card.png');
  const appHomePath = path.join(root, 'apps/ceo1983_app_fe/public/docs/images/evidence/08_app_home_dashboard.png');
  const viconnectLogoPath = path.join(root, 'apps/ceo1983_app_fe/public/viconnect-logo.png');

  const logoBase64 = toBase64(logoPath) || toBase64(path.join(root, 'apps/ceo1983_app_fe/public/ceo1983-logo.png'));
  const crmDashBase64 = toBase64(crmDashPath);
  const appVipCardBase64 = toBase64(appVipCardPath) || toBase64(appHomePath);
  const viconnectBase64 = toBase64(viconnectLogoPath);

  console.log('Logo loaded:', !!logoBase64);
  console.log('CRM Dash loaded:', !!crmDashBase64);
  console.log('App Card loaded:', !!appVipCardBase64);

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>CEO 1983 Platform Infographic Poster</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 1700px;
      overflow: hidden;
      font-family: 'Montserrat', sans-serif;
      background: #030a16;
      color: #ffffff;
      position: relative;
    }

    /* Ambient background lighting */
    .bg-gradient {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 80% 15%, rgba(212, 175, 55, 0.22) 0%, transparent 45%),
        radial-gradient(circle at 15% 45%, rgba(139, 0, 0, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 85% 75%, rgba(0, 43, 112, 0.45) 0%, transparent 55%),
        linear-gradient(180deg, #020712 0%, #05142b 25%, #071935 60%, #030a16 100%);
      z-index: 0;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(212, 175, 55, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(212, 175, 55, 0.04) 1px, transparent 1px);
      background-size: 50px 50px;
      z-index: 1;
    }

    .container {
      position: relative;
      z-index: 2;
      width: 1200px;
      height: 1700px;
      padding: 36px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid rgba(212, 175, 55, 0.3);
      padding-bottom: 16px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-img {
      height: 64px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(212, 175, 55, 0.4));
    }
    .brand-text h1 {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #FFF9D2 0%, #E5B842 50%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-transform: uppercase;
    }
    .brand-text p {
      font-size: 11.5px;
      font-weight: 600;
      color: #93C5FD;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .brand-right {
      text-align: right;
    }
    .header-sub-badge {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #F8FAFC;
      text-transform: uppercase;
    }
    .header-sub-tagline {
      font-size: 11px;
      color: #FCD34D;
      font-weight: 500;
      margin-top: 4px;
      letter-spacing: 0.4px;
    }

    /* ── HERO SECTION ── */
    .hero {
      display: flex;
      gap: 24px;
      align-items: center;
      margin-top: 10px;
      position: relative;
    }
    .hero-content {
      flex: 1.05;
    }
    .hero-title-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #FDE047;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 4px 14px;
      border-radius: 99px;
      margin-bottom: 12px;
    }
    .hero-main-title {
      font-size: 34px;
      font-weight: 900;
      line-height: 1.22;
      letter-spacing: -0.5px;
      margin-bottom: 18px;
    }
    .hero-main-title span.gold {
      background: linear-gradient(135deg, #FFFBEB 0%, #FBBF24 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 22px;
    }
    .hero-bullets li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13.5px;
      font-weight: 600;
      color: #E2E8F0;
    }
    .check-icon {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FBBF24, #D97706);
      color: #030C1B;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      flex-shrink: 0;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }
    .committees-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .comm-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 30, 56, 0.7);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 10px;
      font-weight: 600;
      color: #CBD5E1;
    }
    .comm-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #EAB308;
    }

    /* ── HERO MOCKUPS (Right) ── */
    .hero-visual {
      flex: 1.15;
      position: relative;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .portal-ring {
      position: absolute;
      width: 380px;
      height: 250px;
      border-radius: 50%;
      border: 2px solid rgba(234, 179, 8, 0.6);
      box-shadow: 0 0 45px rgba(234, 179, 8, 0.4), inset 0 0 35px rgba(234, 179, 8, 0.25);
      transform: rotate(-10deg);
      z-index: 1;
    }
    .portal-ring-2 {
      position: absolute;
      width: 320px;
      height: 210px;
      border-radius: 50%;
      border: 1.5px dashed rgba(245, 158, 11, 0.4);
      transform: rotate(15deg);
      z-index: 1;
    }
    /* Laptop Frame */
    .laptop-mockup {
      position: absolute;
      left: 10px;
      top: 15px;
      width: 370px;
      height: 235px;
      background: #1e293b;
      border: 3px solid #64748b;
      border-radius: 12px 12px 2px 2px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.2);
      overflow: hidden;
      z-index: 2;
    }
    .laptop-screen {
      width: 100%;
      height: calc(100% - 10px);
      background-size: cover;
      background-position: top center;
      background-color: #0b1a30;
    }
    .laptop-base {
      position: absolute;
      left: -20px;
      bottom: -10px;
      width: 410px;
      height: 10px;
      background: linear-gradient(180deg, #94a3b8, #475569);
      border-radius: 0 0 10px 10px;
    }
    /* Phone Frame */
    .phone-mockup {
      position: absolute;
      right: 20px;
      bottom: 10px;
      width: 140px;
      height: 270px;
      background: #0f172a;
      border: 3.5px solid #d4af37;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(212, 175, 55, 0.35);
      overflow: hidden;
      z-index: 3;
      padding: 4px;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 18px;
      background-size: cover;
      background-position: top center;
      background-color: #0c1a2f;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 8px;
    }

    /* ── 2 HIGHLIGHT CARDS ── */
    .two-boxes-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 12px;
    }
    .info-card {
      background: rgba(8, 22, 46, 0.75);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 16px;
      padding: 16px 20px;
      backdrop-filter: blur(10px);
      position: relative;
    }
    .info-badge {
      display: inline-block;
      font-size: 13px;
      font-weight: 800;
      color: #030C1B;
      background: linear-gradient(135deg, #FDE047, #D97706);
      padding: 4px 16px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
    }
    .info-desc {
      font-size: 11.8px;
      line-height: 1.55;
      color: #CBD5E1;
      font-weight: 500;
    }
    .benefit-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-top: 8px;
    }
    .benefit-icon-box {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .benefit-text-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #F8FAFC;
    }
    .benefit-text-sub {
      font-size: 10.5px;
      color: #94A3B8;
      margin-top: 1px;
    }

    /* ── 9 MAIN FEATURES (Grid 3x3) ── */
    .features-section-title {
      text-align: center;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .features-section-title::before, .features-section-title::after {
      content: "";
      height: 1.5px;
      width: 70px;
      background: linear-gradient(90deg, transparent, #D4AF37);
    }
    .features-section-title::after {
      background: linear-gradient(90deg, #D4AF37, transparent);
    }
    .features-section-title span.gold {
      color: #FBBF24;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .feature-card {
      background: rgba(7, 20, 42, 0.75);
      border: 1px solid rgba(212, 175, 55, 0.22);
      border-radius: 14px;
      padding: 12px 14px;
      backdrop-filter: blur(8px);
      display: flex;
      gap: 12px;
      align-items: center;
      transition: all 0.2s;
    }
    .feat-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(139, 0, 0, 0.2));
      border: 1px solid rgba(212, 175, 55, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .feat-body {
      flex: 1;
      min-width: 0;
    }
    .feat-name {
      font-size: 12px;
      font-weight: 800;
      color: #F8FAFC;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .feat-bullets {
      list-style: none;
    }
    .feat-bullets li {
      font-size: 9.8px;
      color: #94A3B8;
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
      gap: 4px;
    }
    .feat-bullets li::before {
      content: "✔";
      color: #EAB308;
      font-size: 8px;
      font-weight: 900;
      margin-top: 1px;
    }

    /* ── PROCESS TIMELINE ── */
    .timeline-wrap {
      margin-top: 14px;
      background: rgba(8, 22, 46, 0.8);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 14px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .timeline-title-box {
      background: linear-gradient(135deg, #F59E0B, #B45309);
      color: #030C1B;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: 8px;
      text-align: center;
      line-height: 1.25;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .timeline-steps {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 700;
      color: #E2E8F0;
    }
    .step-num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(234, 179, 8, 0.2);
      border: 1px solid #EAB308;
      color: #FDE047;
      font-size: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-arrow {
      color: #D97706;
      font-size: 12px;
      font-weight: 900;
    }

    /* ── FOOTER ── */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid rgba(212, 175, 55, 0.3);
      padding-top: 14px;
      margin-top: 12px;
    }
    .footer-quote {
      flex: 1.3;
    }
    .quote-lead {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 18px;
      font-weight: 700;
      color: #FDE047;
    }
    .quote-sub {
      font-size: 11px;
      color: #CBD5E1;
      margin-top: 2px;
      line-height: 1.4;
    }
    .footer-right {
      flex: 1.1;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .cta-btn {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%);
      color: #030C1B;
      font-size: 12.5px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 9px 24px;
      border-radius: 99px;
      border: 1.5px solid #FDE047;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-contact-info {
      font-size: 10px;
      color: #94A3B8;
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .footer-contact-info span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .footer-org-name {
      font-size: 11px;
      font-weight: 800;
      color: #E2E8F0;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="grid-lines"></div>

  <div class="container">
    <!-- HEADER -->
    <header class="header">
      <div class="brand-left">
        ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo-img" alt="Logo CEO 1983" />` : ''}
        <div class="brand-text">
          <h1>CLB DOANH NHÂN CEO 1983</h1>
          <p>Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)</p>
        </div>
      </div>
      <div class="brand-right">
        <div class="header-sub-badge">NỀN TẢNG SỐ VẬN HÀNH & KẾT NỐI DOANH NHÂN</div>
        <div class="header-sub-tagline">Dữ liệu tập trung • Kết nối giao thương • Quản trị chuyên nghiệp</div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-title-badge">⚡ CHUYỂN ĐỔI SỐ HIỆP HỘI & CLB</div>
        <h2 class="hero-main-title">
          <span class="gold">CEO 1983 PLATFORM</span><br>
          Giải pháp số toàn diện cho Doanh Nhân CEO 1983
        </h2>
        <ul class="hero-bullets">
          <li>
            <div class="check-icon">✓</div>
            <span>Quản lý hội viên & thẩm định hồ sơ chuyên nghiệp</span>
          </li>
          <li>
            <div class="check-icon">✓</div>
            <span>Kết nối thành viên & giao thương B2B nội bộ</span>
          </li>
          <li>
            <div class="check-icon">✓</div>
            <span>Tổ chức sự kiện, họp ban & check-in QR/NFC tự động</span>
          </li>
          <li>
            <div class="check-icon">✓</div>
            <span>Quản trị quỹ, hội phí & sao kê tài chính minh bạch</span>
          </li>
          <li>
            <div class="check-icon">✓</div>
            <span>Lan tỏa giá trị cộng đồng & thiện nguyện nhân ái</span>
          </li>
        </ul>

        <div class="committees-row">
          <div class="comm-chip"><span class="dot"></span> Ban Điều Hành & Thư Ký</div>
          <div class="comm-chip"><span class="dot"></span> Ban Thành Viên</div>
          <div class="comm-chip"><span class="dot"></span> Ban Xúc Tiến Thương Mại</div>
          <div class="comm-chip"><span class="dot"></span> Ban Truyền Thông</div>
          <div class="comm-chip"><span class="dot"></span> Ban Tài Chính</div>
          <div class="comm-chip"><span class="dot"></span> Ban Thiện Nguyện</div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="portal-ring"></div>
        <div class="portal-ring-2"></div>
        
        <!-- Laptop Mockup -->
        <div class="laptop-mockup">
          <div class="laptop-screen" style="${crmDashBase64 ? `background-image: url('${crmDashBase64}');` : ''}">
            ${!crmDashBase64 ? '<div style="padding:15px; color:#93c5fd; font-size:12px; font-weight:bold;">WEB CRM QUẢN TRỊ CLB CEO 1983</div>' : ''}
          </div>
          <div class="laptop-base"></div>
        </div>

        <!-- Phone Mockup -->
        <div class="phone-mockup">
          <div class="phone-screen" style="${appVipCardBase64 ? `background-image: url('${appVipCardBase64}');` : ''}">
            <div style="background: rgba(3, 12, 27, 0.85); border-radius: 8px; padding: 4px 6px; border: 1px solid rgba(212,175,55,0.4); text-align:center;">
              <div style="font-size:8px; font-weight:800; color:#FDE047;">CEO 1983 APP</div>
              <div style="font-size:6.5px; color:#CBD5E1;">Smart VIP Card & B2B</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2 HIGHLIGHT BOXES -->
    <section class="two-boxes-row">
      <div class="info-card">
        <div class="info-badge">CEO 1983 APP LÀ GÌ?</div>
        <p class="info-desc">
          Ứng dụng di động và cổng quản trị số chuyên biệt giúp <strong>CLB Doanh Nhân CEO 1983</strong> kết nối giao thương, quản lý hội viên, tổ chức sự kiện và tương tác công việc thời gian thực trên một nền tảng số bảo mật &amp; thống nhất.
        </p>
      </div>

      <div class="info-card">
        <div class="info-badge">LỢI ÍCH NỔI BẬT</div>
        <div class="benefit-item">
          <div class="benefit-icon-box">🚀</div>
          <div>
            <div class="benefit-text-title">Vận hành hiệu quả &amp; Chuyên nghiệp</div>
            <div class="benefit-text-sub">Tự động hóa điểm danh, đối soát hội phí, tiết kiệm 80% thời gian quản lý.</div>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon-box">🤝</div>
          <div>
            <div class="benefit-text-title">Gắn kết mạng lưới doanh nhân vững chắc</div>
            <div class="benefit-text-sub">Tương tác 1-on-1, sinh hoạt ban chuyên môn, chia sẻ giá trị bền lâu.</div>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon-box">📈</div>
          <div>
            <div class="benefit-text-title">Đột phá cơ hội giao thương B2B</div>
            <div class="benefit-text-sub">Mở rộng thị trường, chào bán sản phẩm &amp; tìm kiếm đối tác chiến lược.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9 FEATURES GRID -->
    <section>
      <div class="features-section-title">
        CÁC TÍNH NĂNG CHÍNH CỦA <span class="gold">CEO 1983 PLATFORM</span>
      </div>

      <div class="features-grid">
        <!-- Feature 1 -->
        <div class="feature-card">
          <div class="feat-icon-box">👥</div>
          <div class="feat-body">
            <div class="feat-name">Quản lý Hội viên</div>
            <ul class="feat-bullets">
              <li>Hồ sơ doanh nghiệp tập trung</li>
              <li>Phân ban chuyên môn &amp; vai trò</li>
              <li>Gia hạn, nhắc phí tự động</li>
            </ul>
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-card">
          <div class="feat-icon-box">🌐</div>
          <div class="feat-body">
            <div class="feat-name">Kết nối Thành viên</div>
            <ul class="feat-bullets">
              <li>Danh bạ số tìm kiếm thông minh</li>
              <li>Kết nối đúng người, đúng ngành</li>
              <li>Nhắn tin, gọi điện trao đổi nội bộ</li>
            </ul>
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-card">
          <div class="feat-icon-box">🤝</div>
          <div class="feat-body">
            <div class="feat-name">Kết nối Giao thương</div>
            <ul class="feat-bullets">
              <li>Sàn cơ hội hợp tác kinh doanh</li>
              <li>Gian hàng sản phẩm &amp; ưu đãi</li>
              <li>Đặt lịch hẹn gặp B2B 1-on-1</li>
            </ul>
          </div>
        </div>

        <!-- Feature 4 -->
        <div class="feature-card">
          <div class="feat-icon-box">📅</div>
          <div class="feat-body">
            <div class="feat-name">Sự kiện &amp; Check-in</div>
            <ul class="feat-bullets">
              <li>Lịch sinh hoạt &amp; họp ban định kỳ</li>
              <li>Đăng ký &amp; phát vé E-Ticket</li>
              <li>Quét mã QR/NFC check-in tức thì</li>
            </ul>
          </div>
        </div>

        <!-- Feature 5 -->
        <div class="feature-card">
          <div class="feat-icon-box">💰</div>
          <div class="feat-body">
            <div class="feat-name">Minh bạch Tài chính</div>
            <ul class="feat-bullets">
              <li>Thu niên liễm &amp; gói tài trợ</li>
              <li>Quản lý thu chi - ngân sách quỹ</li>
              <li>Đối soát VietQR tự động thời gian thực</li>
            </ul>
          </div>
        </div>

        <!-- Feature 6 -->
        <div class="feature-card">
          <div class="feat-icon-box">💳</div>
          <div class="feat-body">
            <div class="feat-name">Smart VIP Card</div>
            <ul class="feat-bullets">
              <li>Thẻ Doanh nhân số NFC &amp; QR</li>
              <li>Chia sẻ danh thiếp 1 chạm</li>
              <li>Định danh hội viên CEO 1983</li>
            </ul>
          </div>
        </div>

        <!-- Feature 7 -->
        <div class="feature-card">
          <div class="feat-icon-box">📢</div>
          <div class="feat-body">
            <div class="feat-name">Bản tin &amp; Truyền thông</div>
            <ul class="feat-bullets">
              <li>Thông báo chỉ đạo từ Ban Điều Hành</li>
              <li>Tin tức hoạt động &amp; vinh danh</li>
              <li>Kho tài liệu, ảnh sự kiện tập trung</li>
            </ul>
          </div>
        </div>

        <!-- Feature 8 -->
        <div class="feature-card">
          <div class="feat-icon-box">📊</div>
          <div class="feat-body">
            <div class="feat-name">Dashboard &amp; Báo cáo</div>
            <ul class="feat-bullets">
              <li>Thống kê tỷ lệ tham gia sự kiện</li>
              <li>Biểu đồ quỹ &amp; tăng trưởng hội viên</li>
              <li>Số liệu phục vụ lãnh đạo điều hành</li>
            </ul>
          </div>
        </div>

        <!-- Feature 9 -->
        <div class="feature-card">
          <div class="feat-icon-box">❤️</div>
          <div class="feat-body">
            <div class="feat-name">Ban Thiện nguyện</div>
            <ul class="feat-bullets">
              <li>Sự kiện an sinh &amp; từ thiện xã hội</li>
              <li>Theo dõi mục tiêu quyên góp</li>
              <li>Công khai sao kê minh bạch tài khoản</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- PROCESS TIMELINE -->
    <section class="timeline-wrap">
      <div class="timeline-title-box">
        HÀNH TRÌNH<br>HỘI VIÊN CEO 1983
      </div>
      <div class="timeline-steps">
        <div class="step-item"><span class="step-num">1</span> 1. Gia nhập &amp; Định danh</div>
        <div class="step-arrow">❯❯</div>
        <div class="step-item"><span class="step-num">2</span> 2. Kết nối Hội viên</div>
        <div class="step-arrow">❯❯</div>
        <div class="step-item"><span class="step-num">3</span> 3. Tham gia Sự kiện</div>
        <div class="step-arrow">❯❯</div>
        <div class="step-item"><span class="step-num">4</span> 4. Giao thương B2B</div>
        <div class="step-arrow">❯❯</div>
        <div class="step-item"><span class="step-num">5</span> 5. Đóng góp &amp; Quỹ</div>
        <div class="step-arrow">❯❯</div>
        <div class="step-item"><span class="step-num">6</span> 6. Báo cáo &amp; Phát triển</div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-quote">
        <div class="quote-lead">"Vì một Cộng đồng CEO 1983: Gắn kết – Tiên phong – Thịnh vượng"</div>
        <div class="quote-sub">Đồng hành cùng Doanh nhân 1983 kiến tạo giá trị bền vững và vươn tầm cao mới.</div>
      </div>

      <div class="footer-right">
        <div class="cta-btn">
          ▶ TRẢI NGHIỆM CEO 1983 APP
        </div>
        <div class="footer-org-name">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
        <div class="footer-contact-info">
          <span>🌐 ceo1983.viconnect.vn</span>
          <span>✉️ info@viconnect.vn</span>
          <span>📞 Hotline: 0984.078.727</span>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;

  const htmlPath = path.join(root, 'ceo1983_infographic_poster.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('HTML written to', htmlPath);

  const outputPath = path.join(root, 'ceo1983_infographic_poster.png');

  console.log('Launching Puppeteer to capture PNG...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--font-render-hinting=max',
      '--enable-font-antialiasing'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 1700,
    deviceScaleFactor: 2 // Output 2400x3400 high resolution
  });

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait extra 1 second to ensure Google Fonts render
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 1700 }
  });

  await browser.close();
  console.log('SUCCESS: High-res poster generated at:', outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
