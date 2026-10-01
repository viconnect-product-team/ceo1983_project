const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIRS = [
  path.resolve(__dirname, '../document/images/evidence'),
  path.resolve(__dirname, '../../vione_project/document/images/evidence'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs/images/evidence'),
  path.resolve(__dirname, '../../vione_project/apps/vione_app_fe/public/docs/images/evidence'),
];

DIRS.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function saveImage(filename, buffer) {
  for (const dir of DIRS) {
    fs.writeFileSync(path.join(dir, filename), buffer);
  }
  console.log(`  ✓ Saved [${filename}] (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function captureVioneApp() {
  console.log('=== BẮT ĐẦU CHỤP ẢNH CHUẨN XÁC CHO APP VIONE CONNECT ===\n');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true,
  });

  const appViOne = await mobileContext.newPage();

  try {
    // 1. Login Page
    console.log('1. Chụp màn đăng nhập ViOne...');
    await appViOne.goto('https://14.225.217.232:5445/vione/login', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(1000);
    saveImage('app_vione_01_login.png', await appViOne.screenshot());

    // Submit Login correctly
    console.log('Đang điền tài khoản #bc-auth-email và submit...');
    await appViOne.fill('#bc-auth-email', 'admin@connect.vn');
    await appViOne.fill('#bc-auth-password', '123456');
    await appViOne.locator('button[type="submit"]').click();
    await appViOne.waitForTimeout(4000);
    console.log('Sau đăng nhập URL:', appViOne.url());

    // 2. Home Executive Today
    console.log('2. Chụp trang chủ Executive Today...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_02_home_agenda.png', await appViOne.screenshot());

    // 3. Quick Action "V"
    console.log('3. Chụp nút V Quick Action...');
    const vBtn = appViOne.locator('button[aria-label*="Quick"], button[class*="rounded-full"][class*="amber"], button[class*="bg-gradient"]').first();
    if (await vBtn.count() > 0) {
      await vBtn.click().catch(() => {});
      await appViOne.waitForTimeout(1000);
      saveImage('app_vione_03_quick_action_v.png', await appViOne.screenshot());
      await appViOne.mouse.click(50, 50);
      await appViOne.waitForTimeout(500);
    } else {
      saveImage('app_vione_03_quick_action_v.png', await appViOne.screenshot());
    }

    // 4. Network Directory
    console.log('4. Chụp Mạng lưới Quan hệ Network...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/network', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_04_network_directory.png', await appViOne.screenshot());

    // 5. Moments Feed
    console.log('5. Chụp Bảng tin Moments...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/moment', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_05_moments_feed.png', await appViOne.screenshot());

    // 6. Chat Inbox
    console.log('6. Chụp Hộp thư Trò chuyện Inbox...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/inbox', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_06_chat_inbox.png', await appViOne.screenshot());

    // 7. Community & Opportunities
    console.log('7. Chụp Cộng đồng Giao thương Community...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/community', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_07_community_opportunities.png', await appViOne.screenshot());

    // 8. Me / Titanium Digital Card
    console.log('8. Chụp Trung tâm Thẻ số Cá nhân Me...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/me', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_08_digital_card_me.png', await appViOne.screenshot());

    // 9. NFC Activation
    console.log('9. Chụp Kích hoạt thẻ NFC...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/activate', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_09_nfc_activation.png', await appViOne.screenshot());

    // 10. Security & Sessions
    console.log('10. Chụp Cài đặt Bảo mật...');
    await appViOne.goto('https://14.225.217.232:5445/connect-app/me/security', { waitUntil: 'networkidle', timeout: 15000 });
    await appViOne.waitForTimeout(2000);
    saveImage('app_vione_10_security_settings.png', await appViOne.screenshot());

  } catch (err) {
    console.error('Lỗi khi chụp App ViOne:', err);
  } finally {
    await appViOne.close();
    await browser.close();
  }

  console.log('\n=== HOÀN TẤT CHỤP TOÀN BỘ ẢNH APP VIONE CONNECT! ===');
}

captureVioneApp().catch(console.error);
