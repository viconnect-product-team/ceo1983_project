const { chromium } = require('playwright');
const fs = require('fs');

async function dumpEventPage() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();

  // Login
  await page.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle' });
  await page.locator('#assoc-auth-id').first().fill('admin@connect.vn');
  await page.locator('#assoc-auth-password').first().fill('123456');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to event register
  await page.goto('https://14.225.217.232:5444/events/EV-MUOGTPO1/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const html = await page.content();
  fs.writeFileSync('scripts/dump_event_reg.html', html, 'utf8');
  console.log('Saved dump_event_reg.html, length:', html.length);

  // Check inputs
  const inputs = await page.locator('input').all();
  console.log('Inputs count:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const p = await inputs[i].getAttribute('placeholder');
    const t = await inputs[i].getAttribute('type');
    const n = await inputs[i].getAttribute('name');
    const id = await inputs[i].getAttribute('id');
    console.log(`Input ${i}: id=${id}, name=${n}, type=${t}, placeholder=${p}`);
  }

  await browser.close();
}

dumpEventPage().catch(console.error);
