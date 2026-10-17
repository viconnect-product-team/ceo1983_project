import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function test() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("Navigating to auth...");
  await page.goto("http://localhost:5173/auth", { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log("Logging in...");
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log("Navigating to /income...");
  await page.goto("http://localhost:5173/income", { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const btn = page.locator('button:has-text("Lập phiếu thu"), button:has-text("Tạo phiếu thu")').first();
  console.log("Button count:", await btn.count());
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForTimeout(1000);
    console.log("Clicked Lap phieu thu modal");
    
    // Find price input
    const input = page.locator('input[inputmode="decimal"]').first();
    console.log("Input found, initial value:", await input.inputValue());
    
    await input.click();
    await page.waitForTimeout(300);
    console.log("Value after click/focus:", await input.inputValue());
    
    await page.keyboard.type("15000000");
    await page.waitForTimeout(500);
    console.log("Value after keyboard typing 15000000:", await input.inputValue());

    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    console.log("Value after 2 backspaces:", await input.inputValue());

    await page.keyboard.type("99");
    console.log("Value after typing 99:", await input.inputValue());
  }

  // Also check /expenses
  console.log("Navigating to /expenses...");
  await page.goto("http://localhost:5173/expenses", { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const btnChi = page.locator('button:has-text("Lập phiếu chi"), button:has-text("Tạo phiếu chi")').first();
  if (await btnChi.count() > 0) {
    await btnChi.click();
    await page.waitForTimeout(1000);
    console.log("Expenses modal opened");
    const inputChi = page.locator('input[inputmode="decimal"]').first();
    console.log("Expenses input initial value:", await inputChi.inputValue());
    await inputChi.click();
    await page.waitForTimeout(300);
    await page.keyboard.type("25000000");
    console.log("Expenses input after typing 25000000:", await inputChi.inputValue());
  }

  await browser.close();
}

test().catch(console.error);
