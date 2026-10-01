const { chromium } = require('playwright');

async function testPages() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  console.log('Testing CRM Auth...');
  await page.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle' });
  console.log('CRM Auth title:', await page.title());

  // Login
  await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await page.locator('input[type="password"]').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
  console.log('CRM after login URL:', page.url());

  // Check routes
  const routes = [
    'https://14.225.217.232:5443/',
    'https://14.225.217.232:5443/members',
    'https://14.225.217.232:5443/events',
    'https://14.225.217.232:5443/event-registrations',
    'https://14.225.217.232:5443/checkin-qr',
    'https://14.225.217.232:5443/meetings',
    'https://14.225.217.232:5443/voting',
    'https://14.225.217.232:5443/fees',
    'https://14.225.217.232:5443/companies',
    'https://14.225.217.232:5443/marketplace',
    'https://14.225.217.232:5443/permissions'
  ];

  for (const r of routes) {
    try {
      await page.goto(r, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`Route [${r}] => Title: ${await page.title()}, URL: ${page.url()}`);
    } catch (e) {
      console.log(`Route [${r}] => Error: ${e.message}`);
    }
  }

  // App Context
  console.log('\nTesting App Routes...');
  const appCtx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const appPage = await appCtx.newPage();

  const appRoutes = [
    'https://14.225.217.232:5444/landing/ceo1983',
    'https://14.225.217.232:5444/events/EV-MUOGTPO1/register',
    'https://14.225.217.232:5444/association/login',
    'https://14.225.217.232:5444/association',
    'https://14.225.217.232:5444/association/card',
    'https://14.225.217.232:5444/association/products',
    'https://14.225.217.232:5444/association/opportunities',
    'https://14.225.217.232:5444/association/members',
    'https://14.225.217.232:5444/association/messages',
    'https://14.225.217.232:5444/association/voting',
    'https://14.225.217.232:5444/association/profile',
    'https://14.225.217.232:5444/account-settings'
  ];

  for (const r of appRoutes) {
    try {
      await appPage.goto(r, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`App Route [${r}] => Title: ${await appPage.title()}, URL: ${appPage.url()}`);
    } catch (e) {
      console.log(`App Route [${r}] => Error: ${e.message}`);
    }
  }

  await browser.close();
}

testPages().catch(console.error);
