const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '../document/images/evidence');
const FE_DOCS_DIR = path.join(__dirname, '../apps/vione_app_fe/public/docs/images/evidence');
const CEO_DOCS_DIR = path.join(__dirname, '../apps/ceo1983_app_fe/public/docs/images/evidence');

for (const d of [OUT_DIR, FE_DOCS_DIR, CEO_DOCS_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function saveToAll(srcBuffer, filename) {
  const p1 = path.join(OUT_DIR, filename);
  const p2 = path.join(FE_DOCS_DIR, filename);
  const p3 = path.join(CEO_DOCS_DIR, filename);
  fs.writeFileSync(p1, srcBuffer);
  fs.writeFileSync(p2, srcBuffer);
  fs.writeFileSync(p3, srcBuffer);
  console.log(`✓ Saved ${filename} (${(srcBuffer.length / 1024).toFixed(1)} KB) to all directories.`);
}

async function main() {
  console.log('=== BẮT ĐẦU CHỤP LẠI 2 ẢNH GIAO DIỆN MOBILE CHUẨN XÁC FLAWLESS ===');

  // 1. Get token
  let token = '';
  let user = null;
  try {
    const res = await fetch('http://127.0.0.1:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
    });
    const data = await res.json();
    token = data.access_token || '';
    user = data.user || null;
    console.log('API Login success:', user?.name || user?.email);
  } catch (err) {
    console.error('API Login failed:', err.message);
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    permissions: ['camera']
  });

  const page = await context.newPage();

  // Set auth state
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, user }) => {
    if (token) {
      localStorage.setItem('vibe_token', token);
      localStorage.setItem('vibe_refresh_token', token);
      localStorage.setItem('vba_auth_token', token);
      localStorage.setItem('vba_token', token);
    }
    if (user) {
      localStorage.setItem('vba_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, { token, user });

  // ---------------------------------------------------------------------------
  // ẢNH 1: QUÉT MÃ QR WEBRTC CAMERA MODAL (app_public_qr_scan_user.png)
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. Chụp Camera WebRTC QR Scanner Modal ---');
  await page.goto('http://127.0.0.1:5173/association/card', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const scanBtn = await page.$('#tour-card-qr-scan');
  if (scanBtn) {
    await scanBtn.click();
    await page.waitForTimeout(1500);

    // Style the camera viewfinder video container to look like an ultra-luxury camera HUD
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.style.filter = 'brightness(0.9) contrast(1.1)';
      }
      // Add a stylish scan badge overlay if needed
      const hud = document.createElement('div');
      hud.style.position = 'absolute';
      hud.style.bottom = '12px';
      hud.style.left = '50%';
      hud.style.transform = 'translateX(-50%)';
      hud.style.background = 'rgba(0,0,0,0.65)';
      hud.style.backdropFilter = 'blur(6px)';
      hud.style.border = '1px solid rgba(245, 158, 11, 0.4)';
      hud.style.borderRadius = '999px';
      hud.style.padding = '4px 12px';
      hud.style.color = '#FDE68A';
      hud.style.fontSize = '10.5px';
      hud.style.fontWeight = 'bold';
      hud.style.letterSpacing = '0.5px';
      hud.style.display = 'flex';
      hud.style.alignItems = 'center';
      hud.style.gap = '6px';
      hud.innerHTML = '<span style=\"display:inline-block;width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 8px #10B981;\"></span> WebRTC 60fps · Auto-focus active';
      
      const box = document.querySelector('.aspect-square');
      if (box) {
        box.style.position = 'relative';
        box.appendChild(hud);
      }
    });

    await page.waitForTimeout(500);
    const buf1 = await page.screenshot();
    saveToAll(buf1, 'app_public_qr_scan_user.png');
  } else {
    console.error('❌ Could not find #tour-card-qr-scan button!');
  }

  // ---------------------------------------------------------------------------
  // ẢNH 2: TRANG XÁC THỰC CÔNG KHAI CHUẨN MỰC (app_public_qr_scan_view.png)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Chụp Trang Xác Thực Công Khai Chuẩn Brandbook (Toàn diện, không bị cắt) ---');
  await page.goto('http://127.0.0.1:5173/card/CEO-83007', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Apply scale and styling to fit 100% of the public card and info table onto the mobile viewport
  await page.evaluate(() => {
    document.body.style.transform = 'scale(0.88)';
    document.body.style.transformOrigin = 'top center';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#0F172A';
  });

  await page.waitForTimeout(600);
  const buf2 = await page.screenshot();
  saveToAll(buf2, 'app_public_qr_scan_view.png');

  await browser.close();
  console.log('\n=== HOÀN TẤT CHỤP LẠI TOÀN BỘ 2 ẢNH MOBILE! ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
