const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('>>> Bắt đầu chụp sạch các màn hình Mobile App không popup...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // Đăng nhập qua /auth
  await page.goto('https://ceo1983.viconnect.vn/auth');
  await page.waitForTimeout(2000);
  
  // Điền thông tin đăng nhập
  const emailInput = await page.$('input[autocomplete="username"], input[type="text"]');
  if (emailInput) {
    await emailInput.fill('ceo.tongthuky@ceo1983.com');
  }
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.fill('123456');
  }
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
  }
  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(3000);

  // Set cờ tắt popup chào mừng cho tất cả các user ID khả dĩ
  await page.evaluate(() => {
    localStorage.setItem('ceo1983_welcome_shown', 'true');
    for (let i = 0; i < 500; i++) {
      localStorage.setItem('ceo1983_welcome_shown_' + i, 'true');
    }
  });

  async function captureRoute(url, filename) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Đóng modal chào mừng nếu hiện
    await page.evaluate(() => {
      // Ẩn trực tiếp modal nếu còn xuất hiện
      const modal = document.querySelector('[role="dialog"]');
      if (modal && modal.textContent && modal.textContent.includes('Chào mừng Doanh nhân')) {
        modal.remove();
      }
    });
    await page.waitForTimeout(500);
    const savePath = path.join(__dirname, '../document/images/live_captures_fresh', filename);
    await page.screenshot({ path: savePath });
    console.log(`✓ Đã lưu ${filename}`);
  }

  // 1. Trang chủ
  await captureRoute('https://ceo1983.viconnect.vn/association', 'app_01_trangchu_doanhnhan.png');
  // 2. Thẻ hội viên
  await captureRoute('https://ceo1983.viconnect.vn/association/card', 'app_02_the_hoivien_so_vip.png');
  // 3. Cơ hội & Sàn B2B
  await captureRoute('https://ceo1983.viconnect.vn/association/opportunities', 'app_04_san_giaothuong_b2b.png');
  // 4. Thống kê & Sự kiện
  await captureRoute('https://ceo1983.viconnect.vn/association/analytics', 'app_05_sukien_ve_dien_tu.png');
  // 5. Đào tạo
  await captureRoute('https://ceo1983.viconnect.vn/association/training', 'app_06_chuongtrinh_daotao.png');

  await browser.close();
  console.log('✓ Hoàn tất chụp sạch các màn hình Mobile App!');
})();
