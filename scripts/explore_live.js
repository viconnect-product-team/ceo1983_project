const { chromium } = require('playwright');
const fs = require('fs');

async function explore() {
  console.log('Exploring live dev server pages and DOM...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1. CRM Context
  const crmCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const crm = await crmCtx.newPage();

  console.log('Navigating CRM /auth...');
  await crm.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await crm.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await crm.locator('input[type="password"]').first().fill('123456');
  await crm.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await crm.waitForTimeout(4000);
  console.log('Logged into CRM. Current URL:', crm.url());

  // Check CRM menu links
  const links = await crm.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }));
  });
  console.log('CRM Links:', JSON.stringify(links.filter(l => l.href && !l.href.startsWith('#')).slice(0, 30), null, 2));

  // 2. App Context
  const appCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true
  });
  const app = await appCtx.newPage();

  console.log('Navigating App /association/login...');
  await app.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Check landing registration
  console.log('Navigating App /landing/ceo1983...');
  await app.goto('https://14.225.217.232:5444/landing/ceo1983', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Landing CEO1983 title:', await app.title(), 'URL:', app.url());
  const landingButtons = await app.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean);
  });
  console.log('Landing Buttons/Links:', landingButtons.slice(0, 20));

  await browser.close();
}

explore().catch(console.error);
