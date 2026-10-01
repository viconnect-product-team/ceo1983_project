const { chromium } = require('playwright');

async function testAuthRegister() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  // Login on 5443
  await page.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
  await page.locator('input[type="password"]').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Now navigate to /events/EV-MUOGTPO1/register on 5443
  console.log('Navigating to /events/EV-MUOGTPO1/register on 5443...');
  await page.goto('https://14.225.217.232:5443/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Current URL on 5443:', page.url());

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, textarea, button')).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      text: el.innerText.trim(),
      name: el.getAttribute('name'),
      id: el.getAttribute('id')
    }));
  });
  console.log('Inputs found on 5443:', JSON.stringify(inputs.slice(0, 15), null, 2));

  // Also check on 5444 when logged in as admin
  const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const page4 = await ctx4.newPage();
  await page4.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page4.locator('#assoc-auth-id').fill('admin@connect.vn');
  await page4.locator('#assoc-auth-password').fill('123456');
  await page4.locator('button[type="submit"]').click();
  await page4.waitForTimeout(3000);

  console.log('Navigating to /events/EV-MUOGTPO1/register on 5444 after login...');
  await page4.goto('https://14.225.217.232:5444/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  await page4.waitForTimeout(2000);
  console.log('Current URL on 5444:', page4.url());

  const inputs4 = await page4.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, textarea, button')).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      text: el.innerText.trim(),
    }));
  });
  console.log('Inputs found on 5444:', JSON.stringify(inputs4.slice(0, 15), null, 2));

  await browser.close();
}

testAuthRegister().catch(console.error);
