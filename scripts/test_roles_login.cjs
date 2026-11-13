const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const accounts = [
    'ceo.chutich@ceo1983.com',
    'ceo.tongthuky@ceo1983.com',
    'ceo.member1@ceo1983.com',
    'admin@connect.vn'
  ];

  console.log('--- Testing CRM Login ---');
  for (const email of accounts) {
    try {
      await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 15000 });
      await page.locator('input[type="email"], input[type="text"]').first().fill(email);
      await page.locator('input[type="password"]').first().fill('123456');
      await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
      await page.waitForTimeout(3000);
      console.log(`CRM [${email}] -> URL: ${page.url()}`);
      if (!page.url().includes('/auth')) {
        console.log(`SUCCESS CRM LOGIN WITH: ${email}`);
        break;
      }
    } catch (e) {
      console.error(`CRM [${email}] error:`, e.message);
    }
  }

  console.log('\n--- Testing App Login ---');
  const appPage = await ctx.newPage();
  for (const email of accounts) {
    try {
      await appPage.goto('https://ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 15000 });
      await appPage.locator('input[type="email"], input[type="text"]').first().fill(email);
      await appPage.locator('input[type="password"]').first().fill('123456');
      await appPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
      await appPage.waitForTimeout(3000);
      console.log(`App [${email}] -> URL: ${appPage.url()}`);
      if (!appPage.url().includes('/auth') && !appPage.url().includes('/login')) {
        console.log(`SUCCESS APP LOGIN WITH: ${email}`);
        break;
      }
    } catch (e) {
      console.error(`App [${email}] error:`, e.message);
    }
  }

  await browser.close();
})();

