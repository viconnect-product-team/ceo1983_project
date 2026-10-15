import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');

async function checkCrash() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('https://crm.ceo1983.viconnect.vn/auth');
  await page.fill('input[type="text"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://crm.ceo1983.viconnect.vn/tasks');
  await page.waitForTimeout(1500);

  console.log('Clicking button...');
  await page.click('button:has-text("Thêm công việc mới")');
  await page.waitForTimeout(2000);

  await browser.close();
}

checkCrash().catch(console.error);
