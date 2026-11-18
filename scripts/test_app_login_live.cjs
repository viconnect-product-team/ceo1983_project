const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 414, height: 896 },
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();

  console.log('Testing App Login with info@viconnect.vn...');
  await page.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#assoc-auth-id').fill('info@viconnect.vn');
  await page.locator('#assoc-auth-password').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(4000);
  console.log('URL after login:', page.url());

  console.log('Testing Opportunities page...');
  await page.goto('https://ceo1983.viconnect.vn/association/opportunities', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('Opportunities URL:', page.url());

  const buttons = await page.locator('button').allInnerTexts();
  console.log('Opportunities buttons sample:', buttons.slice(0, 10));

  await browser.close();
})();
