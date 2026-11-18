const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 }, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  await p.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'domcontentloaded' });
  const dismiss = p.locator('button:has-text("Để sau"), button:has-text("Đã hiểu")').first();
  if (await dismiss.isVisible()) await dismiss.click();
  await p.locator('#assoc-auth-id').fill('info@viconnect.vn');
  await p.locator('#assoc-auth-password').fill('123456');
  await p.locator('button[type="submit"]').click();
  await p.waitForTimeout(3500);

  await p.goto('https://ceo1983.viconnect.vn/association/opportunities', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  console.log('Finding create button...');
  const createBtn = p.locator('#tour-opps-create-btn, button:has-text("Chia sẻ cơ hội mới")').first();
  console.log('Create button count:', await createBtn.count());
  await createBtn.scrollIntoViewIfNeeded();
  await createBtn.click();
  await p.waitForTimeout(2000);

  console.log('Checking modal visibility...');
  const modal = p.locator('div[role="dialog"], div.fixed.inset-0').first();
  console.log('Modal visible:', await modal.isVisible());

  // Check inputs in modal
  const inputs = await p.locator('input[type="text"]').all();
  console.log('Text inputs in modal:', inputs.length);
  for (let i = 0; i < Math.min(inputs.length, 6); i++) {
    const ph = await inputs[i].getAttribute('placeholder');
    console.log('Input ' + i + ' placeholder: ' + ph);
  }

  await browser.close();
})();
