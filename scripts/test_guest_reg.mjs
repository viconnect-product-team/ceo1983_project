import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import path from 'path';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  console.log('1. Đăng nhập CRM...');
  await page.goto('https://crm.ceo1983.viconnect.vn/auth');
  await page.waitForTimeout(3000);
  const emailInput = page.locator('input').nth(0);
  const passInput = page.locator('input').nth(1);
  await emailInput.fill('admin@connect.vn');
  await passInput.fill('123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log('Sau đăng nhập URL:', page.url());

  console.log('2. Điều hướng tới trang sự kiện...');
  await page.goto('https://crm.ceo1983.viconnect.vn/events/EV-MV7E33J4/register?source=zalo_guest');
  await page.waitForTimeout(4000);
  console.log('Trang đăng ký URL:', page.url());
  const body = await page.innerText('body');
  console.log('Text preview:\n', body.slice(0, 400));

  // Kiểm tra inputs trong trang này
  const inputs = await page.locator('input').all();
  console.log('Số lượng input:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const ph = await inputs[i].getAttribute('placeholder');
    const type = await inputs[i].getAttribute('type');
    console.log(`Input ${i}: type=${type}, ph=${ph}`);
  }

  if (inputs.length >= 3) {
    console.log('3. Điền form...');
    await inputs[0].fill('Nguyễn Tuấn Anh');
    await inputs[1].fill('tuananh.ceo@vietants.vn');
    await inputs[2].fill('0988665544');
    if (inputs.length >= 4) await inputs[3].fill('Tập đoàn Ánh Dương');
    if (inputs.length >= 5) await inputs[4].fill('Chủ tịch HĐQT');

    console.log('4. Submit form...');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Xác Nhận")').first();
    await submitBtn.click();
    await page.waitForTimeout(5000);

    const outPath = path.resolve('docs/training/screenshots/crm_07_event_register_success_email.png');
    await page.screenshot({ path: outPath });
    console.log('ĐÃ CHỤP THÀNH CÔNG VÀO:', outPath);
  }

  await browser.close();
}

main().catch(console.error);
