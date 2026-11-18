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

async function renderBreakthroughPoster() {
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
  <title>CEO 1983 Platform - Breakthrough 3D PR Poster</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
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

    /* ================= BREAKTHROUGH 3D BACKGROUND (WHITE TO CEO1983 GRADIENT BLUE) ================= */
    /* Lớp nền chính: Trắng tinh khôi chuyển mượt sang Xanh Gradient CEO 1983 */
    .bg-main-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, 
        #FFFFFF 0%, 
        #FFFFFF 12%, 
        #F0F5FA 20%, 
        #D9E8F5 26%, 
        #1E4976 34%, 
        #0F2D54 44%, 
        #0A1D36 65%, 
        #050E1C 100%
      );
      z-index: 1;
    }

    /* 3D Modern Architectural Cyber Waves */
    .bg-cyber-glow-sphere {
      position: absolute;
      top: 240px;
      left: 50%;
      transform: translateX(-50%);
      width: 1200px;
      height: 600px;
      background: radial-gradient(ellipse at center, rgba(30, 144, 255, 0.35) 0%, rgba(15, 45, 84, 0.6) 45%, transparent 75%);
      filter: blur(50px);
      z-index: 2;
      pointer-events: none;
    }

    /* 3D WHITE REFLECTIVE STAGE PODIUM (BỤC GƯƠNG TRẮNG 3D CAO CẤP) */
    .stage-3d-wrapper {
      position: absolute;
      top: 480px;
      left: 50%;
      transform: translateX(-50%);
      width: 1100px;
      height: 480px;
      perspective: 1100px;
      z-index: 4;
      pointer-events: none;
    }

    /* Mặt bục gương trắng phản chiếu 3D tinh khôi */
    .stage-mirror-top {
      position: absolute;
      top: 130px;
      left: 60px;
      width: 980px;
      height: 380px;
      border-radius: 50%;
      transform: rotateX(68deg);
      background: radial-gradient(ellipse at 50% 30%, 
        #FFFFFF 0%, 
        #E2ECF8 35%, 
        rgba(30, 73, 118, 0.7) 70%, 
        rgba(10, 29, 54, 0.95) 100%
      );
      box-shadow: 
        0 0 80px rgba(255, 255, 255, 0.8),
        inset 0 0 50px rgba(255, 255, 255, 0.9),
        0 25px 60px rgba(0, 0, 0, 0.85);
      border: 3px solid rgba(255, 255, 255, 0.9);
    }

    /* Lưới phối cảnh ánh sáng trắng công nghệ */
    .stage-mesh-lines {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-size: 35px 35px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.35) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 1px, transparent 1px);
      mask-image: radial-gradient(circle at center, black 45%, transparent 85%);
      -webkit-mask-image: radial-gradient(circle at center, black 45%, transparent 85%);
    }

    /* Thân bục 3D (White Titanium Slab) */
    .stage-base-slab {
      position: absolute;
      top: 300px;
      left: 110px;
      width: 880px;
      height: 55px;
      background: linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 30%, #475569 80%, #0F172A 100%);
      border-radius: 0 0 440px 440px / 0 0 90px 90px;
      box-shadow: 0 35px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(30, 144, 255, 0.4);
      border-bottom: 2px solid #E2E8F0;
    }

    /* Dải LED trắng hắt sáng chân bục */
    .stage-laser-rim {
      position: absolute;
      top: 298px;
      left: 110px;
      width: 880px;
      height: 4px;
      background: linear-gradient(90deg, transparent 5%, #FFFFFF 30%, #E2ECF8 50%, #FFFFFF 70%, transparent 95%);
      box-shadow: 0 0 25px #FFFFFF, 0 0 45px #38BDF8;
    }

    /* Vòng ánh sáng 3D trắng xanh thanh lịch */
    .orbit-light-ring-1 {
      position: absolute;
      top: 420px;
      left: 50%;
      width: 950px;
      height: 380px;
      margin-left: -475px;
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      transform: rotateX(72deg) rotateZ(-12deg);
      box-shadow: 0 0 35px rgba(255, 255, 255, 0.7);
      z-index: 5;
    }

    .orbit-light-ring-2 {
      position: absolute;
      top: 450px;
      left: 50%;
      width: 820px;
      height: 320px;
      margin-left: -410px;
      border: 1.5px dashed rgba(186, 230, 253, 0.7);
      border-radius: 50%;
      transform: rotateX(70deg) rotateZ(18deg);
      box-shadow: 0 0 40px rgba(56, 189, 248, 0.6);
      z-index: 5;
    }

    /* ================= MAIN WRAPPER ================= */
    .poster-container {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 38px 46px 30px 46px;
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
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(15, 45, 84, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(226, 232, 240, 0.8);
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
      color: #0F2D54;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hanoiba-title .dot-gold {
      width: 6px;
      height: 6px;
      background: #D4AF37;
      border-radius: 50%;
      display: inline-block;
    }

    .club-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0A1D36;
    }

    .header-center-badge {
      background: linear-gradient(135deg, #0F2D54 0%, #1E4976 100%);
      padding: 8px 20px;
      border-radius: 30px;
      box-shadow: 0 4px 15px rgba(15, 45, 84, 0.25);
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
      color: #0F2D54;
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
      margin-top: 16px;
      position: relative;
      z-index: 12;
    }

    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #FFFFFF;
      margin-bottom: 8px;
      padding: 6px 24px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 30px;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .hero-pill-badge .gold-star {
      color: #FFD700;
      font-size: 11px;
    }

    /* TIÊU ĐỀ CHÍNH SẮC NÉT TOÀN MÀU TRẮNG */
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

    /* 6 BAN CHUYÊN MÔN - CHIP KÍNH TRẮNG TRONG SUỐT */
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

    /* ================= 3. 3D HERO DEVICES SHOWCASE ================= */
    .hero-3d-stage {
      position: relative;
      width: 1040px;
      height: 410px;
      margin: 0 auto;
      perspective: 1300px;
      z-index: 15;
    }

    /* 3D LAPTOP MACBOOK PRO WITH REAL CRM DASHBOARD */
    .laptop-3d-wrap {
      position: absolute;
      left: 100px;
      top: 15px;
      width: 630px;
      height: 380px;
      transform: rotateY(-11deg) rotateX(10deg);
      transform-style: preserve-3d;
      filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.25));
    }

    .laptop-screen-frame {
      width: 610px;
      height: 350px;
      background: #0F172A;
      border: 4px solid #FFFFFF;
      border-radius: 14px 14px 4px 4px;
      padding: 5px;
      box-shadow: 0 0 35px rgba(255, 255, 255, 0.6), inset 0 0 10px rgba(0,0,0,0.8);
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
      width: 650px;
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

    /* 3D IPHONE 16 PRO (TITANIUM WHITE & DEEP BLUE UI) */
    .phone-3d-wrap {
      position: absolute;
      right: 140px;
      top: 15px;
      width: 220px;
      height: 410px;
      transform: rotateY(-8deg) rotateX(6deg) translateZ(50px);
      filter: drop-shadow(0 30px 45px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 35px rgba(255, 255, 255, 0.4));
      z-index: 20;
    }

    .phone-titanium-frame {
      width: 215px;
      height: 405px;
      background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%);
      border-radius: 40px;
      padding: 6px;
      box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.5);
      position: relative;
    }

    .phone-screen-glass {
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, #07152D 0%, #0F2D54 60%, #050E1C 100%);
      border-radius: 34px;
      overflow: hidden;
      position: relative;
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
      padding: 18px 12px 14px 12px;
      justify-content: space-between;
    }

    .phone-dynamic-island {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 70px;
      height: 18px;
      background: #000;
      border-radius: 20px;
      z-index: 10;
    }

    /* GIAO DIỆN APP HỘI VIÊN CEO 1983 TRÊN ĐIỆN THOẠI */
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
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    /* THẺ VIP TRONG ĐIỆN THOẠI */
    .app-vip-card-box {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(15, 45, 84, 0.8) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
      margin: 8px 0;
      position: relative;
    }

    .app-card-title {
      font-size: 7.5px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .app-card-name {
      font-size: 11px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 2px 0;
    }

    .app-card-sub {
      font-size: 7.5px;
      color: #E2E8F0;
    }

    .app-card-qr-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 6px;
    }

    .app-card-chip {
      width: 22px;
      height: 16px;
      background: linear-gradient(135deg, #FFD700, #B8860B);
      border-radius: 3px;
      border: 1px solid #FFF;
    }

    .app-card-qr-mini {
      width: 26px;
      height: 26px;
      background: #FFF;
      border-radius: 4px;
      padding: 2px;
    }

    .app-quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .app-action-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 8px;
      padding: 6px 4px;
      text-align: center;
      font-size: 8px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .app-action-btn.active {
      background: #FFFFFF;
      color: #0F2D54;
      font-weight: 800;
    }

    /* 3D FLOATING SMART VIP NFC CARD */
    .vip-card-3d-float {
      position: absolute;
      right: 15px;
      bottom: -10px;
      width: 245px;
      height: 148px;
      transform: rotateY(18deg) rotateX(-12deg) rotateZ(5deg) translateZ(110px);
      background: linear-gradient(135deg, #0A1D36 0%, #0F2D54 50%, #1E4976 100%);
      border: 2px solid #FFFFFF;
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.9), 
        0 0 35px rgba(255, 255, 255, 0.5), 
        inset 0 1px 2px rgba(255, 255, 255, 0.6);
      z-index: 28;
    }

    .vip-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .vip-card-logo-mini {
      height: 24px;
    }

    .vip-nfc-chip {
      width: 32px;
      height: 24px;
      background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
      border-radius: 5px;
      border: 1px solid #FFFFFF;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
    }

    .vip-card-title {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #E2E8F0;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .vip-card-member-name {
      font-size: 13.5px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 4px rgba(0,0,0,0.8);
    }

    .vip-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .vip-card-id {
      font-family: monospace;
      font-size: 9px;
      color: #E2E8F0;
      letter-spacing: 1px;
    }

    .vip-badge-vip {
      background: #FFFFFF;
      color: #0F2D54;
      font-size: 8px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 1.2px;
    }

    /* ================= 4. 6 CORE PILLARS (TEXT TOÀN MÀU TRẮNG SẮC NÉT) ================= */
    .pillars-grid-section {
      margin-top: 16px;
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

    .crystal-card-3d {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(10, 29, 54, 0.85) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .crystal-card-3d::before {
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

    .card-3d-icon-box {
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
      background: rgba(255, 255, 255, 0.15);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.35);
    }

    /* ================= 5. 4 KEY METRICS (TEXT TOÀN MÀU TRẮNG SẮC NÉT) ================= */
    .metrics-3d-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 14px;
      position: relative;
      z-index: 30;
    }

    .metric-box-3d {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(10, 29, 54, 0.9) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px 10px;
      text-align: center;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(16px);
    }

    .metric-value-3d {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 25px;
      font-weight: 900;
      color: #FFFFFF;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.4);
      line-height: 1.1;
      margin-bottom: 3px;
    }

    .metric-label-3d {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #FFFFFF;
      opacity: 0.9;
    }

    /* ================= 6. FOOTER PR CALL TO ACTION ================= */
    .footer-pr-section {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(5, 14, 28, 0.95) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      border-radius: 18px;
      padding: 16px 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.5);
      position: relative;
      z-index: 35;
      margin-top: 14px;
      backdrop-filter: blur(20px);
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

    .cta-btn-3d {
      background: #FFFFFF;
      color: #0F2D54;
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

    .cta-btn-3d span.arrow {
      font-size: 16px;
      font-weight: 900;
      color: #0F2D54;
    }

    .qr-box-3d {
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

    .qr-box-3d svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <!-- 3D BACKGROUND ENVIRONMENT (WHITE TO CEO 1983 GRADIENT BLUE) -->
  <div class="bg-main-gradient"></div>
  <div class="bg-cyber-glow-sphere"></div>

  <!-- 3D WHITE REFLECTIVE PODIUM STAGE -->
  <div class="stage-3d-wrapper">
    <div class="stage-mirror-top">
      <div class="stage-mesh-lines"></div>
    </div>
    <div class="stage-base-slab"></div>
    <div class="stage-laser-rim"></div>
  </div>
  <div class="orbit-light-ring-1"></div>
  <div class="orbit-light-ring-2"></div>

  <!-- MAIN POSTER CONTENT LAYOUT -->
  <div class="poster-container">
    
    <!-- 1. HEADER SECTION (NỀN TRẮNG SANG TRỌNG) -->
    <div class="header-bar">
      <div class="brand-left">
        <img class="brand-logo-img" src="${logoBase64}" alt="CEO 1983 Official Logo">
        <div class="brand-titles">
          <div class="hanoiba-title">
            <span class="dot-gold"></span> HANOIBA – HỘI DOANH NGHIỆP TRẺ HÀ NỘI <span class="dot-gold"></span>
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
        <span class="gold-star">✦</span> KỶ NGUYÊN SỐ DOANH NHÂN 1983 <span class="gold-star">✦</span>
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

    <!-- 3. 3D HERO DEVICES SHOWCASE -->
    <div class="hero-3d-stage">
      
      <!-- 3D LAPTOP MOCKUP (MACBOOK PRO SILVER - REAL DASHBOARD) -->
      <div class="laptop-3d-wrap">
        <div class="laptop-screen-frame">
          <div class="laptop-camera-notch"></div>
          <img class="laptop-display-img" src="${realDashBase64}" alt="CEO 1983 CRM Dashboard">
        </div>
        <div class="laptop-base-slab">
          <div class="laptop-base-notch"></div>
        </div>
      </div>

      <!-- 3D IPHONE MOCKUP (TITANIUM WHITE) -->
      <div class="phone-3d-wrap">
        <div class="phone-titanium-frame">
          <div class="phone-screen-glass">
            <div class="phone-dynamic-island"></div>
            
            <div class="app-screen-header">
              <img class="app-screen-logo" src="${logoBase64}" alt="App Logo">
              <span class="app-screen-status">VIP ACTIVE</span>
            </div>

            <!-- THẺ VIP ĐIỆN TỬ -->
            <div class="app-vip-card-box">
              <div class="app-card-title">SMART VIP MEMBER CARD</div>
              <div class="app-card-name">DOANH NHÂN CEO 1983</div>
              <div class="app-card-sub">HANOIBA • KẾT NỐI & VẬN HÀNH</div>
              <div class="app-card-qr-row">
                <div class="app-card-chip"></div>
                <div class="app-card-qr-mini">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                    <rect x="2" y="2" width="8" height="8"></rect>
                    <rect x="14" y="2" width="8" height="8"></rect>
                    <rect x="2" y="14" width="8" height="8"></rect>
                    <path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2v2h-2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- PHÍM THAO TÁC APP -->
            <div class="app-quick-actions">
              <div class="app-action-btn active">⚡ Check-in NFC</div>
              <div class="app-action-btn">🤝 Sàn Giao Thương</div>
              <div class="app-action-btn">📅 Lịch Sự Kiện</div>
              <div class="app-action-btn">👥 Danh Bạ Số</div>
            </div>

          </div>
        </div>
      </div>

      <!-- 3D FLOATING SMART VIP NFC CARD -->
      <div class="vip-card-3d-float">
        <div class="vip-card-header">
          <img class="vip-card-logo-mini" src="${logoBase64}" alt="Mini Logo">
          <div class="vip-nfc-chip"></div>
        </div>
        <div>
          <div class="vip-card-title">SMART VIP NFC CARD</div>
          <div class="vip-card-member-name">DOANH NHÂN CEO 1983</div>
        </div>
        <div class="vip-card-footer">
          <span class="vip-card-id">ID: 1983-VIP-0888</span>
          <span class="vip-badge-vip">NFC TOUCH</span>
        </div>
      </div>

    </div>

    <!-- 4. 6 CORE PILLARS (TEXT TOÀN MÀU TRẮNG SẮC NÉT) -->
    <div class="pillars-grid-section">
      <div class="pillars-section-title-wrap">
        <div class="pillars-section-title">6 TRỤ CỘT NĂNG LỰC ĐỘT PHÁ</div>
      </div>

      <div class="pillars-grid">
        <!-- Pillar 1 -->
        <div class="crystal-card-3d">
          <div class="card-top-row">
            <div class="card-3d-icon-box">🏛️</div>
            <div class="card-header-texts">
              <span class="card-index">MODULE 01</span>
              <h3 class="card-title">Quản Trị Toàn Diện</h3>
            </div>
          </div>
          <p class="card-desc">Cổng Web CRM chuyên sâu, số hóa 100% hồ sơ hội viên, phân quyền RBAC đa cấp, tự động hóa gia hạn và vận hành ban bệ.</p>
          <span class="card-tag">Web CRM Quản Trị</span>
        </div>

        <!-- Pillar 2 -->
        <div class="crystal-card-3d">
          <div class="card-top-row">
            <div class="card-3d-icon-box">🤝</div>
            <div class="card-header-texts">
              <span class="card-index">MODULE 02</span>
              <h3 class="card-title">Giao Thương B2B</h3>
            </div>
          </div>
          <p class="card-desc">Sàn kết nối cung cầu nội khối, quảng bá sản phẩm - dịch vụ doanh nghiệp, mở rộng cơ hội hợp tác và liên minh kinh doanh.</p>
          <span class="card-tag">B2B Connect</span>
        </div>

        <!-- Pillar 3 -->
        <div class="crystal-card-3d">
          <div class="card-top-row">
            <div class="card-3d-icon-box">⚡</div>
            <div class="card-header-texts">
              <span class="card-index">MODULE 03</span>
              <h3 class="card-title">Sự Kiện & Check-in</h3>
            </div>
          </div>
          <p class="card-desc">Quản lý lịch trình, đăng ký tham dự, check-in 1 chạm bằng QR Code động và thẻ thông minh NFC, thống kê đối chiếu tức thì.</p>
          <span class="card-tag">QR & NFC Check-in</span>
        </div>

        <!-- Pillar 4 -->
        <div class="crystal-card-3d">
          <div class="card-top-row">
            <div class="card-3d-icon-box">💳</div>
            <div class="card-header-texts">
              <span class="card-index">MODULE 04</span>
              <h3 class="card-title">Thẻ VIP & Danh Thiếp Số</h3>
            </div>
          </div>
          <p class="card-desc">Định danh doanh nhân thời đại số với Smart VIP Card tích hợp chip NFC, chia sẻ danh thiếp điện tử và kết nối chuyên nghiệp.</p>
          <span class="card-tag">Smart VIP Card</span>
        </div>

        <!-- Pillar 5 -->
        <div class="crystal-card-3d">
          <div class="card-top-row">
            <div class="card-3d-icon-box">💰</div>
            <div class="card-header-texts">
              <span class="card-index">MODULE 05</span>
              <h3 class="card-title">Tài Chính Minh Bạch</h3>
            </div>
          </div>
          <p class="card-desc">Kiểm soát hội phí, tài trợ, ngân sách sự kiện với hệ thống báo cáo thu - chi trực quan, chuẩn xác và công khai minh bạch.</p>
          <span class="card-tag">Quản Trị Tài Chính</span>
        </div>

        <!-- Pillar 6 -->
        <div class="crystal-card-3d">
          <div class="card-top-row">
            <div class="card-3d-icon-box">💖</div>
            <div class="card-header-texts">
              <span class="card-index">MODULE 06</span>
              <h3 class="card-title">Ban Thiện Nguyện</h3>
            </div>
          </div>
          <p class="card-desc">Quản lý chiến dịch thiện nguyện vì cộng đồng, tiếp nhận đóng góp, theo dõi sao kê minh bạch và lan tỏa giá trị nhân văn.</p>
          <span class="card-tag">An Sinh Xã Hội</span>
        </div>
      </div>
    </div>

    <!-- 5. 4 KEY METRICS (TEXT TOÀN MÀU TRẮNG SẮC NÉT) -->
    <div class="metrics-3d-strip">
      <div class="metric-box-3d">
        <div class="metric-value-3d">100%</div>
        <div class="metric-label-3d">Số Hóa Vận Hành</div>
      </div>
      <div class="metric-box-3d">
        <div class="metric-value-3d">01 CHẠM</div>
        <div class="metric-label-3d">Check-in QR / NFC</div>
      </div>
      <div class="metric-box-3d">
        <div class="metric-value-3d">24 / 7</div>
        <div class="metric-label-3d">Đồng Bộ Đa Nền Tảng</div>
      </div>
      <div class="metric-box-3d">
        <div class="metric-value-3d">MINH BẠCH</div>
        <div class="metric-label-3d">Tài Chính & Thiện Nguyện</div>
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
        <a class="cta-btn-3d" href="https://ceo1983.viconnect.vn">
          <span>TRẢI NGHIỆM HỆ SINH THÁI</span>
          <span class="arrow">➔</span>
        </a>

        <!-- QR Code Placeholder -->
        <div class="qr-box-3d">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0F2D54" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

  const htmlPath = path.join(root, 'ceo1983_pr_poster_breakthrough.html');
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

  const outPath = path.join(root, 'ceo1983_pr_poster_3d_breakthrough.png');
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
  const publicDest = path.join(root, 'apps/ceo1983_app_fe/public/ceo1983_pr_poster_3d_breakthrough.png');
  fs.copyFileSync(outPath, publicDest);
  console.log('Copied to public:', publicDest);

  const artifactDir = 'C:\\Users\\vumik\\.gemini\\antigravity\\brain\\8cc7e26e-c329-4eed-a011-3ae20d8c8377';
  if (fs.existsSync(artifactDir)) {
    const artifactDest = path.join(artifactDir, 'ceo1983_pr_poster_3d_breakthrough.png');
    fs.copyFileSync(outPath, artifactDest);
    console.log('Copied to artifact:', artifactDest);
  }
}

renderBreakthroughPoster().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
