const { chromium } = require('playwright');

async function testAuthRegister() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  // Login on 5444
  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page.locator('#assoc-auth-id').fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  console.log('Logged into 5444. URL:', page.url());

  // Navigate to /events/EV-MUOGTPO1/register
  await page.goto('https://14.225.217.232:5444/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('After goto. URL:', page.url());

  const title = await page.title();
  console.log('Page Title:', title);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text Snippet:');
  console.log(bodyText.slice(0, 500));

  await browser.close();
}

testAuthRegister().catch(console.error);
