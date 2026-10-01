const { chromium } = require('playwright');

async function testButtons() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page.locator('#assoc-auth-id').fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  await page.goto('https://14.225.217.232:5444/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(b => ({
      tag: b.tagName,
      text: b.innerText.trim(),
      href: b.getAttribute('href'),
      class: b.className
    })).filter(b => b.text.length > 0);
  });

  console.log('Buttons on page:', JSON.stringify(btns, null, 2));
  await browser.close();
}

testButtons().catch(console.error);
