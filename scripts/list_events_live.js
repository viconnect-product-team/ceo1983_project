const { chromium } = require('playwright');

async function listEventsAndMembers() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  await page.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await page.locator('input[type="password"]').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Get events list via API from browser context
  const data = await page.evaluate(async () => {
    try {
      const evRes = await fetch('/api/events');
      const events = await evRes.json();
      return { events };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('API events data:', JSON.stringify(data, null, 2));

  // Navigate to /events
  await page.goto('https://14.225.217.232:5443/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h3, h4, .font-bold')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('DOM Event titles on /events:', titles);

  await browser.close();
}

listEventsAndMembers().catch(console.error);
