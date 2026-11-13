const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  // 1. CRM test
  const ctx1 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
  const p1 = await ctx1.newPage();
  p1.on('console', msg => console.log('CRM Console:', msg.text()));
  p1.on('pageerror', err => console.log('CRM PageError:', err.message));
  
  console.log('--- Testing CRM (https://crm.ceo1983.viconnect.vn/auth) ---');
  await p1.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 20000 });
  await p1.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await p1.locator('input[type="password"]').first().fill('123456');
  await p1.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await p1.waitForTimeout(4000);
  console.log('CRM result URL:', p1.url());

  // If CRM fails on domain, try 5443
  if (p1.url().includes('/auth')) {
    console.log('--- Testing CRM on 5443 ---');
    await p1.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 20000 });
    await p1.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await p1.locator('input[type="password"]').first().fill('123456');
    await p1.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await p1.waitForTimeout(4000);
    console.log('CRM 5443 result URL:', p1.url());
  }

  // 2. App test
  const ctx2 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  p2.on('console', msg => console.log('App Console:', msg.text()));
  p2.on('pageerror', err => console.log('App PageError:', err.message));

  console.log('--- Testing App (https://ceo1983.viconnect.vn/association/login) ---');
  await p2.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle', timeout: 20000 });
  await p2.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await p2.locator('input[type="password"]').first().fill('123456');
  await p2.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await p2.waitForTimeout(4000);
  console.log('App result URL:', p2.url());

  if (p2.url().includes('login') || p2.url().includes('auth')) {
    console.log('--- Testing App on 5444 ---');
    await p2.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 20000 });
    await p2.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await p2.locator('input[type="password"]').first().fill('123456');
    await p2.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await p2.waitForTimeout(4000);
    console.log('App 5444 result URL:', p2.url());
  }

  await browser.close();
})();
