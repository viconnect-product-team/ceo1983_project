const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 }, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  await p.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'domcontentloaded' });
  const dismiss = p.locator('button:has-text("Để sau"), button:has-text("Đã hiểu")').first();
  if (await dismiss.isVisible()) await dismiss.click();
  await p.locator('#assoc-auth-id').fill('info@viconnect.vn');
  await p.locator('#assoc-auth-password').fill('123456');
  await p.locator('button[type="submit"]').click();
  await p.waitForTimeout(3500);
  await p.goto('https://ceo1983.viconnect.vn/association/opportunities', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  console.log('Current URL:', p.url());
  const oppTitles = await p.locator('div.text-black.text-xs.font-bold').allInnerTexts();
  console.log('Opp titles on feed:', oppTitles);
  await browser.close();
})();
