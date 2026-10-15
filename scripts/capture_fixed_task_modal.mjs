import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import path from 'path';

async function captureFixedTaskModal() {
  const outputDir = path.resolve('document/images/guide_crm');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });

  const page = await context.newPage();

  console.log('>>> Mở dev auth...');
  await page.goto('http://localhost:5099/auth', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  console.log('>>> Đi tới /tasks...');
  await page.goto('http://localhost:5099/tasks', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('>>> Click Thêm công việc mới...');
  const addBtn = page.locator('button:has-text("Thêm công việc mới")').first();
  await addBtn.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(outputDir, '18_modal_giao_viec_moi.png') });
  console.log('Chụp thành công 18_modal_giao_viec_moi.png!');

  await browser.close();
}

captureFixedTaskModal().catch(console.error);
