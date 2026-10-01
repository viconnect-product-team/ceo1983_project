const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const page = await desktop.newPage();

  console.log('1. Logging into CRM ViOne (Port 5445)...');
  await page.goto('https://14.225.217.232:5445/auth', { waitUntil: 'networkidle', timeout: 20000 });
  await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await page.locator('input[type="password"]').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);
  console.log('CRM URL after login:', page.url());

  const routes = [
    '/',
    '/companies',
    '/opportunities',
    '/marketplace',
    '/income',
    '/expenses',
    '/finance-report',
    '/documents',
    '/meetings',
    '/business-cards',
    '/account-settings',
    '/permissions'
  ];

  for (const r of routes) {
    try {
      const res = await page.goto('https://14.225.217.232:5445' + r, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`  Route [${r}] => status: ${res?.status()}, final URL: ${page.url()}`);
    } catch (e) {
      console.log(`  Route [${r}] => Error: ${e.message}`);
    }
  }

  // Mobile App Connect
  console.log('\n2. Testing Mobile Connect App...');
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true
  });
  const mPage = await mobile.newPage();
  await mPage.goto('https://14.225.217.232:5445/vione/login', { waitUntil: 'networkidle', timeout: 20000 });
  await mPage.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await mPage.locator('input[type="password"]').first().fill('123456');
  await mPage.locator('button[type="submit"]').first().click();
  await mPage.waitForTimeout(4000);
  console.log('Mobile URL after login:', mPage.url());

  const mRoutes = [
    '/connect-app',
    '/connect-app/network',
    '/connect-app/moment',
    '/connect-app/inbox',
    '/connect-app/community',
    '/connect-app/me',
    '/connect-app/me/edit',
    '/connect-app/activate',
    '/connect-app/me/security'
  ];

  for (const r of mRoutes) {
    try {
      const res = await mPage.goto('https://14.225.217.232:5445' + r, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`  App Route [${r}] => status: ${res?.status()}, final URL: ${mPage.url()}`);
    } catch (e) {
      console.log(`  App Route [${r}] => Error: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n=== CHECK HOÀN TẤT ===');
}

test().catch(console.error);
