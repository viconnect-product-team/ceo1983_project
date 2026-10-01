const { chromium } = require('playwright');

async function testCurrency() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  // Login
  await page.goto('http://127.0.0.1:5173/association/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Go to /opportunities
  console.log('Navigating to /opportunities...');
  await page.goto('http://127.0.0.1:5173/opportunities', { waitUntil: 'networkidle', timeout: 30000 });
  const postOppBtn = page.locator('button:has-text("Đăng cơ hội"), button:has-text("Tạo cơ hội")').first();
  if (await postOppBtn.isVisible()) {
    console.log('Clicking Đăng cơ hội...');
    await postOppBtn.click();
    await page.waitForTimeout(500);

    const budgetInputs = await page.locator('input[placeholder*="50.000.000"], input[placeholder*="200.000.000"]').all();
    console.log('Found budget inputs:', budgetInputs.length);
    if (budgetInputs.length > 0) {
      const inp = budgetInputs[0];
      console.log('Initial value of budgetMin:', await inp.inputValue());
      await inp.click();
      console.log('Typing: 1');
      await inp.type('1', { delay: 100 });
      console.log('After typing 1:', await inp.inputValue());
      await inp.type('0', { delay: 100 });
      console.log('After typing 0:', await inp.inputValue());
      await inp.type('0', { delay: 100 });
      console.log('After typing 0:', await inp.inputValue());
    }
  }

  // Go to /association/opportunities (Mobile version)
  console.log('\nNavigating to /association/opportunities...');
  await page.goto('http://127.0.0.1:5173/association/opportunities', { waitUntil: 'networkidle', timeout: 30000 });
  const mobilePostBtn = page.locator('button:has-text("Đăng cơ hội"), button:has-text("+ Đăng")').first();
  if (await mobilePostBtn.isVisible()) {
    console.log('Clicking mobile post btn...');
    await mobilePostBtn.click();
    await page.waitForTimeout(500);
    const mBudget = page.locator('input[placeholder*="50.000.000"]').first();
    if (await mBudget.isVisible()) {
      console.log('Initial mobile budget value:', await mBudget.inputValue());
      await mBudget.click();
      await mBudget.type('1', { delay: 100 });
      console.log('Mobile budget after typing 1:', await mBudget.inputValue());
      await mBudget.type('0', { delay: 100 });
      console.log('Mobile budget after typing 0:', await mBudget.inputValue());
    }
  }

  // Go to /association/products
  console.log('\nNavigating to /association/products...');
  await page.goto('http://127.0.0.1:5173/association/products', { waitUntil: 'networkidle', timeout: 30000 });
  const postProductBtn = page.locator('button:has-text("Đăng sản phẩm"), button:has-text("Thêm sản phẩm")').first();
  if (await postProductBtn.isVisible()) {
    console.log('Clicking Đăng sản phẩm...');
    await postProductBtn.click();
    await page.waitForTimeout(500);
    const priceInp = page.locator('input[placeholder*="15.000.000"], input[placeholder*="20.000.000"]').first();
    if (await priceInp.isVisible()) {
      console.log('Initial price input value:', await priceInp.inputValue());
      await priceInp.click();
      await priceInp.type('1', { delay: 100 });
      console.log('Product price after typing 1:', await priceInp.inputValue());
      await priceInp.type('5', { delay: 100 });
      console.log('Product price after typing 5:', await priceInp.inputValue());
      await priceInp.type('0', { delay: 100 });
      console.log('Product price after typing 0:', await priceInp.inputValue());
    }
  }

  await browser.close();
}

testCurrency().catch(console.error);
