const { chromium } = require('playwright');

async function testPageContent() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  await page.goto('https://14.225.217.232:5443/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body text on /events/EV-MUOGTPO1/register:');
  console.log(text.slice(0, 1500));

  await browser.close();
}

testPageContent().catch(console.error);
