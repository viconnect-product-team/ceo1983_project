const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  // App 5444
  console.log('Testing App 5444 login...');
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.on('console', msg => console.log('[5444 console]', msg.type(), msg.text()));
  p.on('response', res => {
    if (res.url().includes('/auth/login') || res.url().includes('/api')) {
      console.log('[5444 response]', res.url(), res.status());
    }
  });
  await p.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await p.fill('#assoc-auth-id', 'admin@connect.vn');
  await p.fill('#assoc-auth-password', '123456');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);
  console.log('App 5444 final url:', p.url());

  // App ViOne 5445
  console.log('\nTesting App ViOne 5445 login...');
  const ctx2 = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  p2.on('console', msg => console.log('[5445 console]', msg.type(), msg.text()));
  p2.on('response', res => {
    if (res.url().includes('/auth/login') || res.url().includes('/login') || res.url().includes('/api')) {
      console.log('[5445 response]', res.url(), res.status());
    }
  });
  await p2.goto('https://14.225.217.232:5445/vione/login', { waitUntil: 'networkidle' });
  console.log('5445 login inputs count:', await p2.locator('input').count());
  await p2.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await p2.locator('input[type="password"]').first().fill('123456');
  await p2.locator('button[type="submit"]').first().click();
  await p2.waitForTimeout(4000);
  console.log('App ViOne 5445 final url:', p2.url());

  await browser.close();
}

test().catch(console.error);
