const { chromium } = require('playwright');

async function testLandingReg() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });

  console.log('Navigating to landing...');
  await page.goto('https://14.225.217.232:5444/landing/ceo1983', { waitUntil: 'networkidle' });
  console.log('Landing title:', await page.title());

  // Check buttons
  const buttons = await page.locator('button, a').allInnerTexts();
  console.log('Buttons sample:', buttons.filter(b => b.trim().length > 0 && b.trim().length < 40).slice(0, 15));

  // Find register button or modal
  const regBtn = page.locator('button:has-text("Đăng ký"), a:has-text("Đăng ký"), button:has-text("Gia nhập"), a:has-text("Gia nhập")').first();
  console.log('Register button exists:', await regBtn.count());
  if (await regBtn.count() > 0) {
    console.log('Register button text:', await regBtn.innerText());
    await regBtn.click();
    await page.waitForTimeout(2000);
    console.log('URL after click:', page.url());
  }

  // Also check direct /register
  await page.goto('https://14.225.217.232:5444/register', { waitUntil: 'networkidle' });
  console.log('/register URL:', page.url(), '| Title:', await page.title());

  await browser.close();
}

testLandingReg().catch(console.error);
