const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APP_URL = 'https://ceo1983.viconnect.vn';
const CRM_URL = 'https://crm.ceo1983.viconnect.vn';

const OUT_DIR_APP = path.resolve(__dirname, '../document/images/guide_app');
const OUT_DIR_CRM = path.resolve(__dirname, '../document/images/guide_crm');

if (!fs.existsSync(OUT_DIR_APP)) fs.mkdirSync(OUT_DIR_APP, { recursive: true });
if (!fs.existsSync(OUT_DIR_CRM)) fs.mkdirSync(OUT_DIR_CRM, { recursive: true });

async function clearAppModals(page) {
  try {
    await page.evaluate(() => {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("ceo1983_welcome_shown", "true");
      localStorage.setItem("vba_daily_ai_welcomed_date", todayStr);
      localStorage.setItem("vba_tour_completed", "true");
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('welcome') || k.includes('shown') || k.includes('tour') || k.includes('onboarding'))) {
          localStorage.setItem(k, "true");
        }
      }
    });

    await page.waitForTimeout(400);

    await page.evaluate(() => {
      const dialogs = document.querySelectorAll('[role="dialog"], .fixed.inset-0.z-50, .fixed.inset-0.z-40');
      dialogs.forEach(d => {
        const text = d.textContent || '';
        if (text.includes('Chào mừng') || text.includes('Chào Buổi') || text.includes('Doanh nhân') || text.includes('Tour') || text.includes('Bắt đầu') || text.includes('Bỏ qua') || text.includes('Khởi đầu')) {
          d.remove();
        }
      });
      const backdrops = document.querySelectorAll('.backdrop-blur-sm, .bg-black\\/60, .bg-black\\/50, .bg-black\\/70, .bg-black\\/80, .bg-black\\/40');
      backdrops.forEach(b => b.remove());
      document.body.style.overflow = 'auto';
    });

    await page.waitForTimeout(300);
  } catch (e) {
    console.log('clearAppModals error:', e.message);
  }
}

async function run() {
  console.log('=== KHỞI ĐỘNG CHỤP BỔ SUNG: APP SUB-FEATURES, CRM EVENTS & RESPONSIVE ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--ignore-certificate-errors', '--disable-web-security']
  });

  // ==========================================
  // PHẦN 1: MOBILE APP SUB-FEATURES
  // ==========================================
  console.log('\n--- BƯỚC 1: CHỤP CÁC TÍNH NĂNG CON CỦA MOBILE APP ---');
  const appCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const appPage = await appCtx.newPage();

  // Đăng nhập App
  console.log('Đang đăng nhập App với vumikasa6@gmail.com...');
  await appPage.goto(`${APP_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await appPage.waitForTimeout(1000);
  await clearAppModals(appPage);

  const emailInput = await appPage.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]');
  const passInput = await appPage.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.fill('vumikasa6@gmail.com');
    await passInput.fill('123456');
    const submitBtn = await appPage.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await appPage.waitForTimeout(2500);
  }

  // 1.1 Trung tâm Thông báo
  console.log('1.1 Chụp Trung tâm Thông báo...');
  await appPage.goto(`${APP_URL}/association/notifications`, { waitUntil: 'networkidle', timeout: 30000 });
  await clearAppModals(appPage);
  await appPage.waitForTimeout(1000);
  await appPage.screenshot({ path: path.join(OUT_DIR_APP, '01_b_app_notifications_center.png') });
  console.log('Saved: 01_b_app_notifications_center.png');

  // 1.2 Cấu hình Giao diện & Màu Brandbook
  console.log('1.2 Chụp Cấu hình Giao diện & Màu sắc...');
  await appPage.goto(`${APP_URL}/association/system-config`, { waitUntil: 'networkidle', timeout: 30000 });
  await clearAppModals(appPage);
  await appPage.waitForTimeout(1000);
  await appPage.screenshot({ path: path.join(OUT_DIR_APP, '01_c_app_theme_switcher_modal.png') });
  console.log('Saved: 01_c_app_theme_switcher_modal.png');

  // 1.3 Giao diện Dark Mode (Chuyển dark mode và chụp trang chủ)
  console.log('1.3 Chụp App ở chế độ Dark Mode...');
  await appPage.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = 'dark';
    localStorage.setItem('vba.theme', 'dark');
    localStorage.setItem('theme', 'dark');
  });
  await appPage.goto(`${APP_URL}/association`, { waitUntil: 'networkidle', timeout: 30000 });
  await clearAppModals(appPage);
  await appPage.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = 'dark';
  });
  await appPage.waitForTimeout(1000);
  await appPage.screenshot({ path: path.join(OUT_DIR_APP, '01_d_app_theme_dark_mode.png') });
  console.log('Saved: 01_d_app_theme_dark_mode.png');

  // Chuyển lại theme sáng
  await appPage.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = 'light';
    localStorage.setItem('vba.theme', 'light');
    localStorage.setItem('theme', 'light');
  });

  // 1.4 Tin nhắn & Trò chuyện 1-on-1
  console.log('1.4 Chụp Màn hình Tin nhắn & Trò chuyện 1-on-1...');
  await appPage.goto(`${APP_URL}/association/messages?tab=messages`, { waitUntil: 'networkidle', timeout: 30000 });
  await clearAppModals(appPage);
  await appPage.waitForTimeout(1200);
  await appPage.screenshot({ path: path.join(OUT_DIR_APP, '10_b_app_messages_chat_1on1.png') });
  console.log('Saved: 10_b_app_messages_chat_1on1.png');

  // 1.5 Sự kiện & Chi tiết vé trên Mobile
  console.log('1.5 Chụp Sự kiện & Vé trên Mobile...');
  await appPage.goto(`${APP_URL}/association/events`, { waitUntil: 'networkidle', timeout: 30000 });
  await clearAppModals(appPage);
  await appPage.waitForTimeout(1200);
  await appPage.screenshot({ path: path.join(OUT_DIR_APP, '08_b_app_event_ticket_qr_modal.png') });
  console.log('Saved: 08_b_app_event_ticket_qr_modal.png');

  await appCtx.close();

  // ==========================================
  // PHẦN 2: WEB CRM EVENT HUB, SEATING & TICKETS
  // ==========================================
  console.log('\n--- BƯỚC 2: CHỤP LUỒNG SỰ KIỆN CHI TIẾT CRM ---');
  const crmCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const crmPage = await crmCtx.newPage();

  // Đăng nhập CRM
  console.log('Đăng nhập CRM với admin@connect.vn...');
  try {
    const authRes = await fetch(`${CRM_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
    });
    const authData = await authRes.json();
    if (authData.access_token) {
      console.log('CRM API login token thành công!');
      await crmCtx.addCookies([
        { name: 'access_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
        { name: 'vibe_token', value: authData.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
      ]);
      await crmPage.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await crmPage.evaluate((data) => {
        localStorage.setItem('vibe_token', data.access_token);
        localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
        localStorage.setItem('vibe_user', JSON.stringify(data.user));
      }, authData);
    }
  } catch (err) {
    console.log('Lỗi API login CRM, thử đăng nhập form:', err.message);
    await crmPage.goto(`${CRM_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const e = await crmPage.$('input[type="email"]');
    const p = await crmPage.$('input[type="password"]');
    if (e && p) {
      await e.fill('admin@connect.vn');
      await p.fill('123456');
      const b = await crmPage.$('button[type="submit"]');
      if (b) await b.click();
      await crmPage.waitForTimeout(2500);
    }
  }

  // 2.1 Chi tiết sự kiện EV-VIENDOANHTRI-2027
  console.log('2.1 Chụp Chi tiết Sự Kiện Hub...');
  await crmPage.goto(`${CRM_URL}/events/EV-VIENDOANHTRI-2027`, { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(1500);
  await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_b_crm_event_detail_hub.png') });
  console.log('Saved: 11_b_crm_event_detail_hub.png');

  // 2.2 Quản lý Đăng ký & Vé sự kiện /event-registrations
  console.log('2.2 Chụp Quản lý Đăng Ký & Vé Sự Kiện...');
  await crmPage.goto(`${CRM_URL}/event-registrations`, { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(1500);
  await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_c_crm_event_registrations_tickets.png') });
  console.log('Saved: 11_c_crm_event_registrations_tickets.png');

  // 2.3 Sơ Đồ Chỗ Ngồi (Mở modal Sơ đồ chỗ ngồi từ /event-registrations)
  console.log('2.3 Mở và Chụp Sơ Đồ Chỗ Ngồi (CinemaSeatingMap)...');
  const seatingBtn = await crmPage.$('button:has-text("Sơ Đồ Chỗ Ngồi"), button:has-text("Chỗ Ngồi")');
  if (seatingBtn) {
    await seatingBtn.click();
    await crmPage.waitForTimeout(1200);
    await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_d_crm_event_seating_setup.png') });
    console.log('Saved: 11_d_crm_event_seating_setup.png');
    // Đóng modal
    const closeBtn = await crmPage.$('button:has-text("Đóng"), button:has-text("Hủy")');
    if (closeBtn) await closeBtn.click();
    await crmPage.waitForTimeout(500);
  } else {
    console.log('Không tìm thấy nút Sơ Đồ Chỗ Ngồi, chụp fallback...');
    await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_d_crm_event_seating_setup.png') });
  }

  // 2.4 Modal Poster & QR Check-in Điểm Danh
  console.log('2.4 Chụp Modal Poster & QR Check-in...');
  await crmPage.goto(`${CRM_URL}/events/EV-VIENDOANHTRI-2027`, { waitUntil: 'networkidle', timeout: 30000 });
  await crmPage.waitForTimeout(1000);
  const posterBtn = await crmPage.$('button:has-text("Poster"), button:has-text("QR Điểm Danh"), button:has-text("Xem Poster & QR")');
  if (posterBtn) {
    await posterBtn.click();
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_e_crm_event_poster_and_qr_modal.png') });
    console.log('Saved: 11_e_crm_event_poster_and_qr_modal.png');
    // Đóng modal
    const closeBtn = await crmPage.$('[role="dialog"] button:has-text("Đóng"), [role="dialog"] .lucide-x');
    if (closeBtn) await closeBtn.click();
    await crmPage.waitForTimeout(500);
  } else {
    await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_e_crm_event_poster_and_qr_modal.png') });
  }

  // 2.5 Modal QR Đăng Ký Khách Mời / Gatekeeper
  console.log('2.5 Chụp Modal QR Khách Mời / Gatekeeper...');
  const guestQrBtn = await crmPage.$('button:has-text("Khách Mời"), button:has-text("QR Đăng Ký"), button:has-text("Gatekeeper")');
  if (guestQrBtn) {
    await guestQrBtn.click();
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_f_crm_event_guest_qr_presenter.png') });
    console.log('Saved: 11_f_crm_event_guest_qr_presenter.png');
  } else {
    await crmPage.screenshot({ path: path.join(OUT_DIR_CRM, '11_f_crm_event_guest_qr_presenter.png') });
  }

  await crmCtx.close();

  // ==========================================
  // PHẦN 3: WEB CRM RESPONSIVE (DESKTOP, TABLET, MOBILE)
  // ==========================================
  console.log('\n--- BƯỚC 3: CHỤP BỘ ẢNH RESPONSIVE CHO WEB CRM ---');

  // 3.1 Desktop 1440x900
  console.log('3.1 CRM Desktop 1440x900...');
  const deskCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const deskPage = await deskCtx.newPage();
  await deskPage.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await deskPage.waitForTimeout(2000);
  await deskPage.screenshot({ path: path.join(OUT_DIR_CRM, 'responsive_crm_desktop_1440.png') });
  console.log('Saved: responsive_crm_desktop_1440.png');
  await deskCtx.close();

  // 3.2 Tablet 1024x768
  console.log('3.2 CRM Tablet 1024x768...');
  const tabCtx = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    ignoreHTTPSErrors: true
  });
  const tabPage = await tabCtx.newPage();
  await tabPage.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await tabPage.waitForTimeout(2000);
  await tabPage.screenshot({ path: path.join(OUT_DIR_CRM, 'responsive_crm_tablet_1024.png') });
  console.log('Saved: responsive_crm_tablet_1024.png');
  await tabCtx.close();

  // 3.3 Mobile 390x844
  console.log('3.3 CRM Mobile 390x844...');
  const mobCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const mobPage = await mobCtx.newPage();
  await mobPage.goto(`${CRM_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await mobPage.waitForTimeout(2000);
  await mobPage.screenshot({ path: path.join(OUT_DIR_CRM, 'responsive_crm_mobile_390.png') });
  console.log('Saved: responsive_crm_mobile_390.png');
  await mobCtx.close();

  await browser.close();
  console.log('\n=== HOÀN TẤT CHỤP TOÀN BỘ ẢNH BỔ SUNG! ===');
}

run().catch(err => {
  console.error('LỖI CHỤP ẢNH:', err);
  process.exit(1);
});

