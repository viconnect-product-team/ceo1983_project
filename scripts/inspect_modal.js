const { chromium } = require('playwright');

async function inspectModal() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();

  // Login
  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page.locator('#assoc-auth-id').first().fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to /association/events
  await page.goto('https://14.225.217.232:5444/association/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click event card
  const eventCard = page.locator('div:has-text("DIỄN ĐÀN DOANH NHÂN")').last();
  await eventCard.click();
  await page.waitForTimeout(2000);

  // Check buttons
  const buttons = await page.locator('button, a').allInnerTexts();
  console.log('Buttons inside modal:', buttons.filter(b => b.trim().length > 0 && b.trim().length < 50));

  await browser.close();
}

inspectModal().catch(console.error);
