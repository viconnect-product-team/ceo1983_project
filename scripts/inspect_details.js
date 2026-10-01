const { chromium } = require('playwright');

async function inspectDetails() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1. Check Landing Registration Form on 5444
  const appCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const appPage = await appCtx.newPage();
  await appPage.goto('https://14.225.217.232:5444/landing/ceo1983', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Find registration button/modal
  const regBtn = appPage.locator('button:has-text("Gửi Đơn Đăng Ký Gia Nhập"), button:has-text("Đăng ký gia nhập")').first();
  console.log('Registration button count:', await regBtn.count());
  if (await regBtn.count() > 0) {
    await regBtn.click();
    await appPage.waitForTimeout(1500);
    const inputs = await appPage.evaluate(() => {
      return Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        id: el.getAttribute('id'),
        type: el.getAttribute('type')
      }));
    });
    console.log('Landing Form Inputs:', JSON.stringify(inputs, null, 2));
  }

  // 2. Check CRM Events & Members on 5443
  const crmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const crm = await crmCtx.newPage();
  await crm.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await crm.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await crm.locator('input[type="password"]').first().fill('123456');
  await crm.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await crm.waitForTimeout(4000);

  // Check /members
  console.log('Checking CRM /members...');
  await crm.goto('https://14.225.217.232:5443/members', { waitUntil: 'networkidle', timeout: 30000 });
  await crm.waitForTimeout(3000);
  const memberRows = await crm.evaluate(() => {
    return Array.from(document.querySelectorAll('table tbody tr')).map(tr => tr.innerText.replace(/\n+/g, ' | ')).slice(0, 5);
  });
  console.log('Members sample:', memberRows);

  // Check /events
  console.log('Checking CRM /events...');
  await crm.goto('https://14.225.217.232:5443/events', { waitUntil: 'networkidle', timeout: 30000 });
  await crm.waitForTimeout(3000);
  const eventCards = await crm.evaluate(() => {
    return Array.from(document.querySelectorAll('h3, h4, .font-semibold, table tr')).map(el => el.innerText.trim()).filter(t => t.length > 5).slice(0, 10);
  });
  console.log('Events sample:', eventCards);

  // Check /event-registrations
  console.log('Checking CRM /event-registrations...');
  await crm.goto('https://14.225.217.232:5443/event-registrations', { waitUntil: 'networkidle', timeout: 30000 });
  await crm.waitForTimeout(3000);
  const regRows = await crm.evaluate(() => {
    return Array.from(document.querySelectorAll('table tbody tr')).map(tr => tr.innerText.replace(/\n+/g, ' | ')).slice(0, 5);
  });
  console.log('Event registrations sample:', regRows);

  await browser.close();
}

inspectDetails().catch(console.error);
