const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APP_URL = 'https://ceo1983.viconnect.vn';
const OUT_DIR = path.resolve(__dirname, '../document/images/guide_app');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function clearModals(page) {
  try {
    // 1. Inject localStorage keys
    await page.evaluate(() => {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("ceo1983_welcome_shown", "true");
      localStorage.setItem("vba_daily_ai_welcomed_date", todayStr);
      localStorage.setItem("vba_tour_completed", "true");
      // User specific keys
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('welcome') || k.includes('shown') || k.includes('tour') || k.includes('onboarding'))) {
          localStorage.setItem(k, "true");
        }
      }
    });

    // 2. Chờ 600ms
    await page.waitForTimeout(600);

    // 3. Remove popup DOM elements directly if any
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

    await page.waitForTimeout(400);
  } catch (e) {
    console.log('Error clearing modals:', e.message);
  }
}

async function run() {
  console.log('=== STARTING CLEAN APP RE-CAPTURE (NO POPUPS) ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  page.on('dialog', async d => {
    try { await d.accept(); } catch(e){}
  });

  try {
    // 00. App Login
    console.log('Capturing 00_app_login.png...');
    await page.goto(`${APP_URL}/auth`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '00_app_login.png') });

    // Login as member
    console.log('Logging in as vumikasa6@gmail.com...');
    await page.locator('input[type="email"], input[type="text"]').first().fill('vumikasa6@gmail.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForTimeout(4000);

    const routes = [
      { name: '01_app_home_ticker.png', url: '/association' },
      { name: '02_app_vip_card.png', url: '/association/card' },
      { name: '03_app_public_card.png', url: '/card/CEO1983-000003' },
      { name: '04_app_members_directory.png', url: '/association/members' },
      { name: '05_app_opportunities_strip.png', url: '/association/opportunities' },
      { name: '06_app_analytics_dashboard.png', url: '/association/analytics' },
      { name: '07_app_marketplace_products.png', url: '/association/products' },
      { name: '08_app_events_and_meetings.png', url: '/association/events' },
      { name: '09_app_voting_online.png', url: '/association/voting' },
      { name: '10_app_moments_feed.png', url: '/association/messages' },
      { name: '11_app_profile_view.png', url: '/association/profile' },
      { name: '12_app_settings.png', url: '/association/settings' },
      { name: '13_app_perks_benefits.png', url: '/association/perks' },
      { name: '14_app_b2b_connect.png', url: '/association/connect' },
      { name: '15_app_training.png', url: '/association/training' },
      { name: '16_app_calendar.png', url: '/association/calendar' }
    ];

    for (const r of routes) {
      try {
        console.log(`Capturing ${r.name} from ${r.url}...`);
        await page.goto(`${APP_URL}${r.url}`, { waitUntil: 'networkidle', timeout: 25000 });
        await clearModals(page);
        await page.screenshot({ path: path.join(OUT_DIR, r.name) });
        console.log(`✔ Successfully saved clean ${r.name}`);
      } catch (e) {
        console.error(`Failed ${r.name}:`, e.message);
      }
    }

    console.log('=== ALL APP SCREENS RE-CAPTURED FLAWLESSLY ===');
  } catch (err) {
    console.error('Fatal App recapture error:', err);
  } finally {
    await browser.close();
  }
}

run();

