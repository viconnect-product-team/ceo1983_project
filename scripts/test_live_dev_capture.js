const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCapture() {
  console.log('Testing connection & capturing live dev server...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  // 1. Desktop context for CRM 5443
  const crmCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const crmPage = await crmCtx.newPage();
  
  console.log('1. Navigating to CRM 5443 /auth...');
  await crmPage.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('CRM title:', await crmPage.title());
  fs.writeFileSync('scratch_crm_login.png', await crmPage.screenshot());
  console.log('Saved scratch_crm_login.png');

  // Login
  await crmPage.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await crmPage.locator('input[type="password"]').first().fill('123456');
  await crmPage.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await crmPage.waitForTimeout(4000);
  console.log('CRM after login URL:', crmPage.url());

  fs.writeFileSync('scratch_crm_dash.png', await crmPage.screenshot());
  console.log('Saved scratch_crm_dash.png');

  // 2. Mobile context for App 5444
  const appCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true
  });
  const appPage = await appCtx.newPage();
  console.log('2. Navigating to App 5444 /association/login...');
  await appPage.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('App title:', await appPage.title());
  fs.writeFileSync('scratch_app_login.png', await appPage.screenshot());
  console.log('Saved scratch_app_login.png');

  // Check login on App 5444
  const idInput = appPage.locator('#assoc-auth-id');
  if (await idInput.count() > 0) {
    await idInput.fill('admin@connect.vn');
    await appPage.locator('#assoc-auth-password').fill('123456');
    await appPage.locator('button[type="submit"]').click();
    await appPage.waitForTimeout(4000);
    console.log('App after login URL:', appPage.url());
    fs.writeFileSync('scratch_app_home.png', await appPage.screenshot());
    console.log('Saved scratch_app_home.png');
  }

  await browser.close();
  console.log('Done test capture!');
}

testCapture().catch(console.error);
