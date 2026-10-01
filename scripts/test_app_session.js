const { chromium } = require('playwright');

async function testAppLogin() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();

  console.log('Navigating to login...');
  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  console.log('Login page URL:', page.url());

  // Fill credentials
  await page.locator('#assoc-auth-id').first().fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());

  // Check routes after login
  const routes = [
    'https://14.225.217.232:5444/association',
    'https://14.225.217.232:5444/association/card',
    'https://14.225.217.232:5444/association/products',
    'https://14.225.217.232:5444/association/opportunities',
    'https://14.225.217.232:5444/association/members',
    'https://14.225.217.232:5444/association/profile',
    'https://14.225.217.232:5444/events/EV-MUOGTPO1/register'
  ];

  for (const r of routes) {
    await page.goto(r, { waitUntil: 'networkidle', timeout: 15000 });
    console.log(`Route [${r}] => Current URL: ${page.url()} | Title: ${await page.title()}`);
  }

  await browser.close();
}

testAppLogin().catch(console.error);
