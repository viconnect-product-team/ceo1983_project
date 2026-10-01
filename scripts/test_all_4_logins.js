const { chromium } = require('playwright');

async function testLogins() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  // 1. CRM CEO 1983 (5443)
  console.log('--- 1. Testing CRM CEO 1983 (5443) ---');
  try {
    const ctx1 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
    const p1 = await ctx1.newPage();
    await p1.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 15000 });
    await p1.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await p1.locator('input[type="password"]').first().fill('123456');
    await p1.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await p1.waitForTimeout(3000);
    console.log('CRM 5443 after login URL:', p1.url());
  } catch (e) {
    console.error('CRM 5443 error:', e.message);
  }

  // 2. App CEO 1983 (5444)
  console.log('--- 2. Testing App CEO 1983 (5444) ---');
  try {
    const ctx2 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
    const p2 = await ctx2.newPage();
    await p2.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 15000 });
    await p2.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await p2.locator('input[type="password"]').first().fill('123456');
    await p2.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await p2.waitForTimeout(3000);
    console.log('App 5444 after login URL:', p2.url());
  } catch (e) {
    console.error('App 5444 error:', e.message);
  }

  // 3. CRM ViOne (5445)
  console.log('--- 3. Testing CRM ViOne (5445) ---');
  try {
    const ctx3 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
    const p3 = await ctx3.newPage();
    await p3.goto('https://14.225.217.232:5445/auth', { waitUntil: 'networkidle', timeout: 15000 });
    await p3.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await p3.locator('input[type="password"]').first().fill('123456');
    await p3.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await p3.waitForTimeout(3000);
    console.log('CRM ViOne 5445 after login URL:', p3.url());
  } catch (e) {
    console.error('CRM ViOne 5445 error:', e.message);
  }

  // 4. App ViOne (5445)
  console.log('--- 4. Testing App ViOne (5445) ---');
  try {
    const ctx4 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
    const p4 = await ctx4.newPage();
    await p4.goto('https://14.225.217.232:5445/vione/login', { waitUntil: 'networkidle', timeout: 15000 });
    await p4.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await p4.locator('input[type="password"]').first().fill('123456');
    await p4.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await p4.waitForTimeout(3000);
    console.log('App ViOne 5445 after login URL:', p4.url());
  } catch (e) {
    console.error('App ViOne 5445 error:', e.message);
  }

  await browser.close();
}

testLogins().catch(console.error);
