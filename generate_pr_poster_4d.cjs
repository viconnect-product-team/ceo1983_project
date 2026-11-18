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

async function render4DPoster() {
  const root = path.resolve(__dirname);
  const logoPath = path.join(root, 'apps/ceo1983_app_fe/public/ceo1983-official-logo.png');
  const fallbackLogoPath = path.join(root, 'apps/ceo1983_app_fe/public/ceo1983-logo.png');
  const realDashboardPath = 'C:\\Users\\vumik\\.gemini\\antigravity\\brain\\8cc7e26e-c329-4eed-a011-3ae20d8c8377\\.user_uploaded\\media_1794794495893_4b711186.jpg';
  const viconnectLogoPath = path.join(root, 'apps/ceo1983_app_fe/public/viconnect-logo.png');

  const logoBase64 = toBase64(logoPath) || toBase64(fallbackLogoPath);
  const realDashBase64 = toBase64(realDashboardPath);
  const viconnectBase64 = toBase64(viconnectLogoPath);

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>CEO 1983 Platform - 4D Hyper-Spatial PR Poster</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 1700px;
      background: #FFFFFF;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
      -webkit-font-smoothing: antialiased;
    }

    /* ================= 4D HYPER-SPATIAL BACKGROUND ENVIRONMENT ================= */
    /* Nền chuyển màu: Trắng tinh khôi đỉnh cao chuyển dần sang dải Xanh Gradient CEO 1983 */
    .bg-4d-canvas {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, 
        #FFFFFF 0%, 
        #FFFFFF 10%, 
        #F1F6FB 18%, 
        #CFE2F4 25%, 
        #1E4570 33%, 
        #0C274C 45%, 
        #071A34 65%, 
        #020914 100%
      );
      z-index: 1;
    }

    /* 4D Quantum Light Portal (Cổng không gian ánh sáng lượng tử) */
    .portal-4d-glow {
      position: absolute;
      top: 260px;
      left: 50%;
      transform: translateX(-50%);
      width: 1300px;
      height: 700px;
      background: radial-gradient(ellipse at 50% 40%, rgba(56, 189, 248, 0.4) 0%, rgba(30, 64, 175, 0.35) 40%, rgba(12, 39, 76, 0.8) 70%, transparent 100%);
      filter: blur(60px);
      z-index: 2;
      pointer-events: none;
    }

    /* 4D Hyperbolic Light Arch (Vòm ánh sáng vô cực uốn lượn xuyên không gian) */
    .arch-4d-hyperbolic {
      position: absolute;
      top: 320px;
      left: 50%;
      width: 1100px;
      height: 520px;
      margin-left: -550px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transform: rotateX(74deg) rotateY(-8deg) rotateZ(15deg);
      box-shadow: 
        0 0 50px rgba(56, 189, 248, 0.7), 
        inset 0 0 40px rgba(255, 255, 255, 0.8);
      z-index: 3;
      pointer-events: none;
    }

    .arch-4d-inner {
      position: absolute;
      top: 360px;
      left: 50%;
      width: 960px;
      height: 440px;
      margin-left: -480px;
      border: 1.5px dashed rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      transform: rotateX(72deg) rotateY(12deg) rotateZ(-18deg);
      box-shadow: 0 0 60px rgba(255, 255, 255, 0.6);
      z-index: 3;
      pointer-events: none;
    }

    /* 4D Sân Khấu Kính Gương Vô Cực (4D Infinite Curved Mirror Stage) */
    .stage-4d-container {
      position: absolute;
      top: 480px;
      left: 50%;
      transform: translateX(-50%);
      width: 1100px;
      height: 480px;
      perspective: 1200px;
      z-index: 4;
      pointer-events: none;
    }

    .stage-4d-disc {
      position: absolute;
      top: 140px;
      left: 50px;
      width: 1000px;
      height: 380px;
      border-radius: 50%;
      transform: rotateX(68deg);
      background: radial-gradient(ellipse at 50% 25%, 
        #FFFFFF 0%, 
        #DCEBFA 30%, 
        rgba(30, 69, 112, 0.8) 65%, 
        rgba(7, 26, 52, 0.98) 100%
      );
      box-shadow: 
        0 0 100px rgba(255, 255, 255, 0.9),
        inset 0 0 60px rgba(255, 255, 255, 0.95),
        0 30px 80px rgba(0, 0, 0, 0.95);
      border: 3px solid rgba(255, 255, 255, 0.95);
    }

    /* Lưới ma trận không gian 4D */
    .stage-4d-matrix {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px);
      mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
    }

    .stage-4d-rim-laser {
      position: absolute;
      top: 310px;
      left: 100px;
      width: 900px;
      height: 5px;
      background: linear-gradient(90deg, transparent 5%, #38BDF8 25%, #FFFFFF 50%, #38BDF8 75%, transparent 95%);
      box-shadow: 0 0 30px #FFFFFF, 0 0 60px #38BDF8;
    }

    /* Luồng hạt photon không gian 4D (Spatial Photons) */
    .photon-stream {
      position: absolute;
      border-radius: 50%;
      background: #FFFFFF;
      box-shadow: 0 0 12px #FFFFFF, 0 0 25px #38BDF8;
      z-index: 5;
    }

    /* ================= MAIN WRAPPER ================= */
    .poster-container {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 38px 46px 28px 46px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 10;
    }

    /* ================= 1. HEADER (NỀN TRẮNG SANG TRỌNG) ================= */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.96);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(12, 39, 76, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(226, 232, 240, 0.9);
      position: relative;
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-img {
      height: 64px;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
    }

    .brand-titles {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hanoiba-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #0C274C;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hanoiba-title .dot-blue {
      width: 6px;
      height: 6px;
      background: #0284C7;
      border-radius: 50%;
      display: inline-block;
    }

    .club-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #071A34;
    }

    .header-center-badge {
      background: linear-gradient(135deg, #0C274C 0%, #1E4570 100%);
      padding: 8px 20px;
      border-radius: 30px;
      box-shadow: 0 4px 15px rgba(12, 39, 76, 0.25);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-center-badge span {
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #FFFFFF;
    }

    .brand-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tech-by-text {
      text-align: right;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #64748B;
      text-transform: uppercase;
    }

    .tech-by-text strong {
      color: #0C274C;
      display: block;
      font-size: 11.5px;
      font-weight: 800;
    }

    .viconnect-logo-img {
      height: 38px;
    }

    /* ================= 2. HERO HEADLINE (TEXT TOÀN MÀU TRẮNG SẮC NÉT) ================= */
    .hero-pr-section {
      text-align: center;
      margin-top: 14px;
      position: relative;
      z-index: 12;
    }

    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #FFFFFF;
      margin-bottom: 8px;
      padding: 6px 24px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.45);
      border-radius: 30px;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .hero-main-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 68px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1.08;
      color: #FFFFFF;
      text-shadow: 
        0 2px 10px rgba(0, 0, 0, 0.4),
        0 8px 30px rgba(0, 0, 0, 0.7);
      margin-bottom: 8px;
    }

    .hero-sub-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #FFFFFF;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
      margin-bottom: 16px;
      opacity: 0.95;
    }

    /* 6 BAN CHUYÊN MÔN */
    .departments-ribbon {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 18px;
    }

    .dept-badge {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.35);
      padding: 6px 15px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #FFFFFF;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dept-badge::before {
      content: '●';
      color: #38BDF8;
      font-size: 8px;
    }

    /* ================= 3. 4D HERO DEVICES SHOWCASE (NO VIP CARD, NO NFC) ================= */
    .hero-4d-stage {
      position: relative;
      width: 1040px;
      height: 420px;
      margin: 0 auto;
      perspective: 1400px;
      z-index: 15;
    }

    /* 3D LAPTOP MACBOOK PRO - REAL CRM DASHBOARD */
    .laptop-4d-wrap {
      position: absolute;
      left: 70px;
      top: 15px;
      width: 650px;
      height: 390px;
      transform: rotateY(-11deg) rotateX(10deg);
      transform-style: preserve-3d;
      filter: drop-shadow(0 35px 55px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 45px rgba(255, 255, 255, 0.3));
    }

    .laptop-screen-frame {
      width: 630px;
      height: 360px;
      background: #071A34;
      border: 4px solid #FFFFFF;
      border-radius: 14px 14px 4px 4px;
      padding: 5px;
      box-shadow: 0 0 35px rgba(255, 255, 255, 0.7), inset 0 0 10px rgba(0,0,0,0.8);
      position: relative;
      overflow: hidden;
    }

    .laptop-camera-notch {
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      width: 70px;
      height: 7px;
      background: #000;
      border-radius: 0 0 6px 6px;
      z-index: 10;
    }

    .laptop-display-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: left top;
      border-radius: 8px;
    }

    .laptop-base-slab {
      position: absolute;
      bottom: -18px;
      left: -20px;
      width: 670px;
      height: 24px;
      background: linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 35%, #94A3B8 100%);
      border-radius: 0 0 20px 20px;
      border-top: 1px solid #FFFFFF;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.9);
    }

    .laptop-base-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 6px;
      background: #64748B;
      border-radius: 0 0 8px 8px;
    }

    /* 3D IPHONE 16 PRO - GIAO DIỆN APP CHUẨN CEO 1983 (SỰ KIỆN, CƠ HỘI, B2B) */
    .phone-4d-wrap {
      position: absolute;
      right: 120px;
      top: 10px;
      width: 235px;
      height: 420px;
      transform: rotateY(-8deg) rotateX(6deg) translateZ(60px);
      filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.45));
      z-index: 20;
    }

    .phone-titanium-frame {
      width: 230px;
      height: 415px;
      background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%);
      border-radius: 42px;
      padding: 6px;
      box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.95), 0 0 35px rgba(255, 255, 255, 0.6);
      position: relative;
    }

    .phone-screen-glass {
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, #071A34 0%, #0C274C 50%, #020914 100%);
      border-radius: 36px;
      overflow: hidden;
      position: relative;
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
      padding: 18px 12px 12px 12px;
      justify-content: space-between;
    }

    .phone-dynamic-island {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 72px;
      height: 18px;
      background: #000;
      border-radius: 20px;
      z-index: 10;
    }

    /* GIAO DIỆN APP NỘI BỘ CEO 1983 TRÊN ĐIỆN THOẠI */
    .app-screen-header {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-screen-logo {
      height: 24px;
    }

    .app-screen-status {
      font-size: 8px;
      font-weight: 800;
      color: #FFFFFF;
      background: rgba(56, 189, 248, 0.2);
      padding: 2px 8px;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.5);
    }

    /* KHỐI SỰ KIỆN NỔI BẬT TRÊN APP */
    .app-event-highlight {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(12, 39, 76, 0.8) 100%);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
      margin: 8px 0;
    }

    .app-event-tag {
      font-size: 7.5px;
      font-weight: 800;
      color: #38BDF8;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .app-event-title {
      font-size: 11px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 2px 0;
      line-height: 1.3;
    }

    .app-event-meta {
      font-size: 7.5px;
      color: #E2E8F0;
      margin-top: 4px;
      display: flex;
      justify-content: space-between;
    }

    /* KHỐI FEED CƠ HỘI KINH DOANH MỚI NHẤT */
    .app-opps-feed {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 8px 10px;
      margin-bottom: 6px;
    }

    .app-opps-label {
      font-size: 7.5px;
      font-weight: 800;
      color: #38BDF8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .app-opps-text {
      font-size: 8.5px;
      color: #FFFFFF;
      font-weight: 600;
      margin-top: 2px;
      line-height: 1.3;
    }

    /* 4 PHÍM TÍNH NĂNG CHÍNH APP */
    .app-quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .app-action-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 6px 4px;
      text-align: center;
      font-size: 8px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .app-action-btn.active {
      background: #FFFFFF;
      color: #0C274C;
      font-weight: 800;
    }

    /* ================= 4. 6 TÍNH NĂNG NỔI BẬT CHUẨN CEO 1983 (TEXT TOÀN MÀU TRẮNG SẮC NÉT) ================= */
    .pillars-grid-section {
      margin-top: 14px;
      position: relative;
      z-index: 30;
    }

    .pillars-section-title-wrap {
      text-align: center;
      margin-bottom: 12px;
    }

    .pillars-section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .pillars-section-title::before,
    .pillars-section-title::after {
      content: '';
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #FFFFFF);
    }

    .pillars-section-title::after {
      background: linear-gradient(90deg, #FFFFFF, transparent);
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .crystal-card-4d {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(7, 26, 52, 0.9) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(25px);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .crystal-card-4d::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #FFFFFF, #38BDF8, transparent);
    }

    .card-top-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-4d-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 100%);
      border: 1px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.4);
      flex-shrink: 0;
    }

    .card-header-texts {
      display: flex;
      flex-direction: column;
    }

    .card-index {
      font-size: 10px;
      font-weight: 800;
      color: #38BDF8;
      letter-spacing: 1.5px;
    }

    .card-title {
      font-size: 14.5px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }

    .card-desc {
      font-size: 11px;
      line-height: 1.5;
      color: #FFFFFF;
      font-weight: 500;
      opacity: 0.95;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .card-tag {
      margin-top: 3px;
      align-self: flex-start;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.16);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    /* ================= 5. 4 KEY METRICS (TEXT TOÀN MÀU TRẮNG SẮC NÉT) ================= */
    .metrics-4d-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 14px;
      position: relative;
      z-index: 30;
    }

    .metric-box-4d {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(7, 26, 52, 0.92) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      border-radius: 12px;
      padding: 12px 10px;
      text-align: center;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(16px);
    }

    .metric-value-4d {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 25px;
      font-weight: 900;
      color: #FFFFFF;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.4);
      line-height: 1.1;
      margin-bottom: 3px;
    }

    .metric-label-4d {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #FFFFFF;
      opacity: 0.9;
    }

    /* ================= 6. FOOTER PR CALL TO ACTION ================= */
    .footer-pr-section {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(2, 9, 20, 0.96) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.4);
      border-radius: 18px;
      padding: 16px 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.5);
      position: relative;
      z-index: 35;
      margin-top: 14px;
      backdrop-filter: blur(25px);
    }

    .footer-left-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .footer-slogan {
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
      letter-spacing: 0.5px;
    }

    .footer-organization {
      font-size: 12px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .footer-sub-org {
      font-size: 10px;
      color: #CBD5E1;
      letter-spacing: 0.5px;
    }

    .footer-cta-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cta-btn-4d {
      background: #FFFFFF;
      color: #0C274C;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 30px;
      border: 1px solid #FFFFFF;
      box-shadow: 0 6px 25px rgba(255, 255, 255, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }

    .cta-btn-4d span.arrow {
      font-size: 16px;
      font-weight: 900;
      color: #0C274C;
    }

    .qr-box-4d {
      width: 68px;
      height: 68px;
      background: #FFFFFF;
      border: 2px solid #FFFFFF;
      border-radius: 10px;
      padding: 4px;
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-box-4d svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <!-- 4D HYPER-SPATIAL BACKGROUND ENVIRONMENT -->
  <div class="bg-4d-canvas"></div>
  <div class="portal-4d-glow"></div>
  <div class="arch-4d-hyperbolic"></div>
  <div class="arch-4d-inner"></div>

  <!-- 4D STAGE PODIUM -->
  <div class="stage-4d-container">
    <div class="stage-4d-disc">
      <div class="stage-4d-matrix"></div>
    </div>
    <div class="stage-4d-rim-laser"></div>
  </div>

  <!-- PHOTON SPATIAL PARTICLES -->
  <div class="photon-stream" style="top: 280px; left: 140px; width: 6px; height: 6px; opacity: 0.9;"></div>
  <div class="photon-stream" style="top: 360px; right: 180px; width: 8px; height: 8px; opacity: 0.85;"></div>
  <div class="photon-stream" style="top: 520px; left: 90px; width: 5px; height: 5px; opacity: 0.8;"></div>
  <div class="photon-stream" style="top: 600px; right: 100px; width: 7px; height: 7px; opacity: 0.9;"></div>

  <!-- MAIN POSTER CONTENT LAYOUT -->
  <div class="poster-container">
    
    <!-- 1. HEADER SECTION (NỀN TRẮNG SANG TRỌNG) -->
    <div class="header-bar">
      <div class="brand-left">
        <img class="brand-logo-img" src="${logoBase64}" alt="CEO 1983 Official Logo">
        <div class="brand-titles">
          <div class="hanoiba-title">
            <span class="dot-blue"></span> HANOIBA – HỘI DOANH NGHIỆP TRẺ HÀ NỘI <span class="dot-blue"></span>
          </div>
          <div class="club-title">CLB DOANH NHÂN CEO 1983</div>
        </div>
      </div>

      <div class="header-center-badge">
        <span>NỀN TẢNG SỐ DOANH NHÂN HANOIBA</span>
      </div>

      <div class="brand-right">
        <div class="tech-by-text">
          ĐỐI TÁC CÔNG NGHỆ
          <strong>VICONNECT</strong>
        </div>
        <img class="viconnect-logo-img" src="${viconnectBase64}" alt="ViConnect Logo">
      </div>
    </div>

    <!-- 2. HERO HEADLINE (TEXT TOÀN MÀU TRẮNG SẮC NÉT) -->
    <div class="hero-pr-section">
      <div class="hero-pill-badge">
        <span>✦</span> KỶ NGUYÊN SỐ DOANH NHÂN 1983 <span>✦</span>
      </div>
      <h1 class="hero-main-title">CEO 1983 PLATFORM</h1>
      <p class="hero-sub-title">HỆ SINH THÁI SỐ ĐỘT PHÁ VẬN HÀNH & KẾT NỐI TOÀN DIỆN</p>

      <!-- 6 BAN CHUYÊN MÔN -->
      <div class="departments-ribbon">
        <div class="dept-badge">Ban Điều Hành</div>
        <div class="dept-badge">Ban Thư Ký</div>
        <div class="dept-badge">Ban Thành Viên</div>
        <div class="dept-badge">Ban Xúc Tiến Thương Mại</div>
        <div class="dept-badge">Ban Truyền Thông</div>
        <div class="dept-badge">Ban Thiện Nguyện</div>
      </div>
    </div>

    <!-- 3. 4D HERO DEVICES SHOWCASE (NO VIP CARD, NO NFC) -->
    <div class="hero-4d-stage">
      
      <!-- 3D LAPTOP MOCKUP (MACBOOK PRO SILVER - REAL CRM DASHBOARD) -->
      <div class="laptop-4d-wrap">
        <div class="laptop-screen-frame">
          <div class="laptop-camera-notch"></div>
          <img class="laptop-display-img" src="${realDashBase64}" alt="CEO 1983 CRM Dashboard">
        </div>
        <div class="laptop-base-slab">
          <div class="laptop-base-notch"></div>
        </div>
      </div>

      <!-- 3D IPHONE MOCKUP (TITANIUM WHITE - CEO 1983 APP FEED & EVENTS) -->
      <div class="phone-4d-wrap">
        <div class="phone-titanium-frame">
          <div class="phone-screen-glass">
            <div class="phone-dynamic-island"></div>
            
            <div class="app-screen-header">
              <img class="app-screen-logo" src="${logoBase64}" alt="App Logo">
              <span class="app-screen-status">HANOIBA</span>
            </div>

            <!-- SỰ KIỆN NỔI BẬT -->
            <div class="app-event-highlight">
              <div class="app-event-tag">SỰ KIỆN SẮP TỚI</div>
              <div class="app-event-title">KỶ NIỆM 4 NĂM THÀNH LẬP CLB DOANH NHÂN CEO 1983</div>
              <div class="app-event-meta">
                <span>📅 21 Th11 • 07:00</span>
                <span>📍 Nhà hàng Lotte</span>
              </div>
            </div>

            <!-- FEED CƠ HỘI KINH DOANH -->
            <div class="app-opps-feed">
              <div class="app-opps-label">💼 CƠ HỘI HỢP TÁC B2B</div>
              <div class="app-opps-text">Tìm đối tác cung ứng giải pháp chuyển đổi số & vật liệu xây dựng</div>
            </div>

            <!-- 4 TÍNH NĂNG CHÍNH -->
            <div class="app-quick-actions">
              <div class="app-action-btn active">📅 Sự Kiện</div>
              <div class="app-action-btn">🤝 Giao Thương B2B</div>
              <div class="app-action-btn">💼 Chia Sẻ Cơ Hội</div>
              <div class="app-action-btn">👥 Hội Viên</div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- 4. 6 TÍNH NĂNG NỔI BẬT CHUẨN CEO 1983 (TEXT TOÀN MÀU TRẮNG SẮC NÉT) -->
    <div class="pillars-grid-section">
      <div class="pillars-section-title-wrap">
        <div class="pillars-section-title">6 TÍNH NĂNG NỔI BẬT HỆ THỐNG</div>
      </div>

      <div class="pillars-grid">
        <!-- 1. Sự kiện -->
        <div class="crystal-card-4d">
          <div class="card-top-row">
            <div class="card-4d-icon-box">📅</div>
            <div class="card-header-texts">
              <span class="card-index">TÍNH NĂNG 01</span>
              <h3 class="card-title">Sự Kiện</h3>
            </div>
          </div>
          <p class="card-desc">Tổ chức sự kiện, hội thảo chuyên đề, đại hội thường niên, đăng ký tham gia và điểm danh check-in QR Code tức thì.</p>
          <span class="card-tag">Quản Lý Sự Kiện</span>
        </div>

        <!-- 2. Chia sẻ cơ hội -->
        <div class="crystal-card-4d">
          <div class="card-top-row">
            <div class="card-4d-icon-box">💼</div>
            <div class="card-header-texts">
              <span class="card-index">TÍNH NĂNG 02</span>
              <h3 class="card-title">Chia Sẻ Cơ Hội</h3>
            </div>
          </div>
          <p class="card-desc">Đăng tải cơ hội kinh doanh, tìm kiếm đối tác hợp tác đầu tư, giới thiệu khách hàng tiềm năng và liên minh doanh nghiệp.</p>
          <span class="card-tag">Hợp Tác Đầu Tư</span>
        </div>

        <!-- 3. Báo cáo thống kê tài chính -->
        <div class="crystal-card-4d">
          <div class="card-top-row">
            <div class="card-4d-icon-box">📊</div>
            <div class="card-header-texts">
              <span class="card-index">TÍNH NĂNG 03</span>
              <h3 class="card-title">Thống Kê Tài Chính</h3>
            </div>
          </div>
          <p class="card-desc">Biểu đồ thu chi trực quan, quản trị hội phí, tài trợ sự kiện, theo dõi dòng tiền và báo cáo ngân sách công khai minh bạch.</p>
          <span class="card-tag">Báo Cáo Tài Chính</span>
        </div>

        <!-- 4. Giao thương kết nối B2B -->
        <div class="crystal-card-4d">
          <div class="card-top-row">
            <div class="card-4d-icon-box">🤝</div>
            <div class="card-header-texts">
              <span class="card-index">TÍNH NĂNG 04</span>
              <h3 class="card-title">Giao Thương B2B</h3>
            </div>
          </div>
          <p class="card-desc">Sàn kết nối cung cầu nội khối, quảng bá sản phẩm - dịch vụ doanh nghiệp, xúc tiến thương mại và mở rộng chuỗi cung ứng.</p>
          <span class="card-tag">Kết Nối B2B</span>
        </div>

        <!-- 5. Mạng lưới gắn kết hội viên -->
        <div class="crystal-card-4d">
          <div class="card-top-row">
            <div class="card-4d-icon-box">🌐</div>
            <div class="card-header-texts">
              <span class="card-index">TÍNH NĂNG 05</span>
              <h3 class="card-title">Gắn Kết Hội Viên</h3>
            </div>
          </div>
          <p class="card-desc">Không gian tương tác cộng đồng doanh nhân, sinh hoạt các ban chuyên môn, giao lưu văn hóa và chia sẻ tri thức thực chiến.</p>
          <span class="card-tag">Mạng Lưới Hội Viên</span>
        </div>

        <!-- 6. Quản lý hội viên -->
        <div class="crystal-card-4d">
          <div class="card-top-row">
            <div class="card-4d-icon-box">👥</div>
            <div class="card-header-texts">
              <span class="card-index">TÍNH NĂNG 06</span>
              <h3 class="card-title">Quản Lý Hội Viên</h3>
            </div>
          </div>
          <p class="card-desc">Số hóa 100% hồ sơ doanh nghiệp & doanh nhân, phân quyền RBAC ban bệ, tự động hóa gia hạn và tra cứu danh bạ số thông minh.</p>
          <span class="card-tag">Quản Trị Hội Viên</span>
        </div>
      </div>
    </div>

    <!-- 5. 4 KEY METRICS (TEXT TOÀN MÀU TRẮNG SẮC NÉT) -->
    <div class="metrics-4d-strip">
      <div class="metric-box-4d">
        <div class="metric-value-4d">100%</div>
        <div class="metric-label-4d">Số Hóa Vận Hành</div>
      </div>
      <div class="metric-box-4d">
        <div class="metric-value-4d">REAL-TIME</div>
        <div class="metric-label-4d">Đồng Bộ Dữ Liệu</div>
      </div>
      <div class="metric-box-4d">
        <div class="metric-value-4d">B2B CONNECT</div>
        <div class="metric-label-4d">Giao Thương Đột Phá</div>
      </div>
      <div class="metric-box-4d">
        <div class="metric-value-4d">MINH BẠCH</div>
        <div class="metric-label-4d">Thống Kê Tài Chính</div>
      </div>
    </div>

    <!-- 6. FOOTER PR CALL TO ACTION -->
    <div class="footer-pr-section">
      <div class="footer-left-info">
        <div class="footer-slogan">"Tiên phong Chuyển đổi số – Gắn kết Vững bền – Thịnh vượng Tương lai"</div>
        <div class="footer-organization">CLB DOANH NHÂN CEO 1983 (HANOIBA)</div>
        <div class="footer-sub-org">Hội Doanh Nghiệp Trẻ Hà Nội • Đối tác công nghệ: ViConnect JSC</div>
      </div>

      <div class="footer-cta-group">
        <a class="cta-btn-4d" href="https://ceo1983.viconnect.vn">
          <span>TRẢI NGHIỆM HỆ SINH THÁI</span>
          <span class="arrow">➔</span>
        </a>

        <!-- QR Code Placeholder -->
        <div class="qr-box-4d">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0C274C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <path d="M7 7h.01"></path>
            <path d="M17 7h.01"></path>
            <path d="M7 17h.01"></path>
            <path d="M17 17h.01"></path>
          </svg>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;

  const htmlPath = path.join(root, 'ceo1983_pr_poster_4d.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('HTML written to', htmlPath);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  console.log('Launching browser with', edgePath);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 1700,
    deviceScaleFactor: 2
  });

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const outPath = path.join(root, 'ceo1983_pr_poster_4d.png');
  await page.screenshot({
    path: outPath,
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 1700
    }
  });

  await browser.close();
  console.log('Rendered successfully to:', outPath);

  // Copy to public and artifact
  const publicDest = path.join(root, 'apps/ceo1983_app_fe/public/ceo1983_pr_poster_4d.png');
  fs.copyFileSync(outPath, publicDest);
  console.log('Copied to public:', publicDest);

  const artifactDir = 'C:\\Users\\vumik\\.gemini\\antigravity\\brain\\8cc7e26e-c329-4eed-a011-3ae20d8c8377';
  if (fs.existsSync(artifactDir)) {
    const artifactDest = path.join(artifactDir, 'ceo1983_pr_poster_4d.png');
    fs.copyFileSync(outPath, artifactDest);
    console.log('Copied to artifact:', artifactDest);
  }
}

render4DPoster().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
