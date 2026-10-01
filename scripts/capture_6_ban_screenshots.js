const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.join(__dirname, '../document/images/evidence');

const ACCOUNTS = [
  {
    role: 'bqt',
    email: 'admin@connect.vn',
    pass: '123456',
    route: '/admin',
    fileName: 'bqt_screen.png'
  },
  {
    role: 'btk',
    email: 'ceo.tongthuky@ceo1983.com',
    pass: '123456',
    route: '/meetings',
    fileName: 'btk_screen.png'
  },
  {
    role: 'btv',
    email: 'ceo.thanhvien@ceo1983.com',
    pass: '123456',
    route: '/members',
    fileName: 'btv_screen.png'
  },
  {
    role: 'btn',
    email: 'ceo.thiennguyen@ceo1983.com',
    pass: '123456',
    route: '/cashbook',
    fileName: 'btn_screen.png'
  },
  {
    role: 'btt',
    email: 'ceo.truyenthong@ceo1983.com',
    pass: '123456',
    route: '/events',
    fileName: 'btt_screen.png'
  },
  {
    role: 'bxt',
    email: 'ceo.xuctien@ceo1983.com',
    pass: '123456',
    route: '/marketplace',
    fileName: 'bxt_screen.png'
  }
];

async function captureBanScreenshots() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const acc of ACCOUNTS) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5173/auth', { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.locator('input[autocomplete="username"], input[type="text"]').first().fill(acc.email);
      await page.locator('input[autocomplete="current-password"], input[type="password"]').first().fill(acc.pass);
      await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
      await page.waitForTimeout(2500);

      await page.goto('http://127.0.0.1:5173' + acc.route, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1500);

      const filePath = path.join(EVIDENCE_DIR, acc.fileName);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`[PASS] Captured ${acc.fileName} at ${acc.route}`);
    } catch (e) {
      console.error(`[FAIL] ${acc.fileName}:`, e.message);
    } finally {
      await context.close();
    }
  }
  await browser.close();
}

captureBanScreenshots();
