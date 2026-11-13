const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APP_URL = 'https://ceo1983.viconnect.vn';
const OUT_DIR = path.resolve(__dirname, '../document/images/guide_app');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log('=== STARTING APP FULL CAPTURE ===');
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
      { name: '03_app_public_card.png', url: '/card/MBMWD8P4NX' },
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
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUT_DIR, r.name) });
        console.log(`Saved ${r.name}`);
      } catch (e) {
        console.error(`Failed ${r.name}:`, e.message);
      }
    }

    console.log('=== ALL APP SCREENSHOTS CAPTURED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Fatal App capture error:', err);
  } finally {
    await browser.close();
  }
}

run();
