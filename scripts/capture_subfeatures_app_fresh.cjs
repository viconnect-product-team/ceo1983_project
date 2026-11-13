const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APP_URL = 'https://ceo1983.viconnect.vn';
const OUT_DIR = path.resolve(__dirname, '../document/images/guide_app');

async function clearModals(page) {
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
    await page.waitForTimeout(400);
  } catch (e) {
    console.log('Error clearing modals:', e.message);
  }
}

async function run() {
  console.log('=== CAPTURING APP SUBFEATURES (NOTIFICATIONS, THEME SWITCHER, MESSAGES CHAT) ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  try {
    // Login
    await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('input[type="email"], input[type="text"]').first().fill('vumikasa6@gmail.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForTimeout(3500);

    // 1. Notifications Center
    console.log('Capturing 01_b_app_notifications_center.png...');
    await page.goto(`${APP_URL}/association/notifications`, { waitUntil: 'networkidle', timeout: 20000 });
    await clearModals(page);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '01_b_app_notifications_center.png') });
    console.log('✔ Captured 01_b_app_notifications_center.png');

    // 2. Theme Switcher / Brandbook System Config
    console.log('Capturing 01_c_app_theme_switcher_modal.png...');
    await page.goto(`${APP_URL}/association/system-config`, { waitUntil: 'networkidle', timeout: 20000 });
    await clearModals(page);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '01_c_app_theme_switcher_modal.png') });
    console.log('✔ Captured 01_c_app_theme_switcher_modal.png');

    // 3. Messages Chat 1-on-1
    console.log('Capturing 10_b_app_messages_chat_1on1.png...');
    await page.goto(`${APP_URL}/association/messages`, { waitUntil: 'networkidle', timeout: 20000 });
    await clearModals(page);
    await page.waitForTimeout(1500);
    // Click on first message conversation or send a test preview
    const convRow = page.locator('button:has-text("Nhắn tin"), [role="button"], div[class*="cursor-pointer"]').first();
    if (await convRow.count() > 0) {
      await convRow.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(OUT_DIR, '10_b_app_messages_chat_1on1.png') });
    console.log('✔ Captured 10_b_app_messages_chat_1on1.png');

    // 4. Event ticket QR modal
    console.log('Capturing 08_b_app_event_ticket_qr_modal.png...');
    await page.goto(`${APP_URL}/association/events`, { waitUntil: 'networkidle', timeout: 20000 });
    await clearModals(page);
    await page.waitForTimeout(1000);
    const ticketBtn = page.locator('button:has-text("Vé"), button:has-text("QR"), button:has-text("Check-in")').first();
    if (await ticketBtn.count() > 0) {
      await ticketBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(OUT_DIR, '08_b_app_event_ticket_qr_modal.png') });
    console.log('✔ Captured 08_b_app_event_ticket_qr_modal.png');

    console.log('=== ALL APP SUBFEATURES CAPTURED ===');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

run();

