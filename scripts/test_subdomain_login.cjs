const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1. CRM test
  const ctx1 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const p1 = await ctx1.newPage();
  p1.on('response', res => {
    if (res.url().includes('login') || res.url().includes('auth')) {
      console.log('CRM API RESP:', res.status(), res.url());
    }
  });

  console.log('--- Testing CRM (https://crm.ceo1983.viconnect.vn/auth) ---');
  await p1.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 20000 });
  await p1.locator('input[type="text"]').first().fill('admin@viconnect.vn');
  await p1.locator('input[type="password"]').first().fill('123456');
  await p1.locator('button[type="submit"]').click();
  await p1.waitForTimeout(4000);
  console.log('CRM result URL:', p1.url());

  // 2. App test
  const ctx2 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  p2.on('response', res => {
    if (res.url().includes('login') || res.url().includes('auth')) {
      console.log('App API RESP:', res.status(), res.url());
    }
  });

  console.log('--- Testing App (https://ceo1983.viconnect.vn/association/login) ---');
  await p2.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle', timeout: 20000 });
  await p2.locator('#assoc-auth-identifier').fill('info@viconnect.vn');
  await p2.locator('#assoc-auth-password').fill('123456');
  await p2.locator('button[type="submit"]').click();
  await p2.waitForTimeout(4000);
  console.log('App result URL:', p2.url());

  await browser.close();
})();
