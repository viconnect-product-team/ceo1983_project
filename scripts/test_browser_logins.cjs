const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TEST_DIR = path.resolve(__dirname, '../document/images/test_captures');
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  // 1. Desktop Context for CRM
  console.log('1. Testing CRM Login and Dashboard...');
  const desktopCtx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const crmPage = await desktopCtx.newPage();
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 20000 });
  await crmPage.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await crmPage.locator('input[type="password"]').first().fill('123456');
  await crmPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await crmPage.waitForTimeout(4000);
  console.log('CRM after login URL:', crmPage.url());
  await crmPage.screenshot({ path: path.join(TEST_DIR, 'crm_dashboard_test.png') });

  // 2. Mobile Context for App
  console.log('2. Testing App Login and Home...');
  const mobileCtx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const appPage = await mobileCtx.newPage();
  await appPage.goto('https://ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 20000 });
  await appPage.locator('input[type="email"], input[type="text"]').first().fill('vumikasa6@gmail.com');
  await appPage.locator('input[type="password"]').first().fill('123456');
  await appPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await appPage.waitForTimeout(4000);
  console.log('App after login URL:', appPage.url());
  await appPage.screenshot({ path: path.join(TEST_DIR, 'app_home_test.png') });

  await browser.close();
  console.log('Test completed successfully!');
})();

