import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function runMobileCapture() {
  const outputDir = path.resolve('document/images/guide_mobile');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  console.log('>>> [1/18] Chụp Popup Hướng Dẫn Cài Đặt App PWA...');
  await page.goto('https://ceo1983.viconnect.vn/landing?install=ios', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, '01_huong_dan_cai_dat_app.png') });

  console.log('>>> [2/18] Chụp Đơn Đăng Ký Gia Nhập CLB CEO 1983...');
  // Tắt popup cài app
  await page.evaluate(() => {
    localStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
    sessionStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
  });
  await page.goto('https://ceo1983.viconnect.vn/landing', { waitUntil: 'networkidle', timeout: 30000 });
  // Nếu có popup thì bấm đóng
  const closeBtn = page.locator('button:has-text("Để sau"), button:has-text("Đã hiểu")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, '02_don_dang_ky_hoi_vien.png') });

  console.log('>>> [3/18] Chụp Màn Hình Đăng Nhập Mobile...');
  await page.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle', timeout: 30000 });
  const closeBtn2 = page.locator('button:has-text("Để sau"), button:has-text("Đã hiểu")').first();
  if (await closeBtn2.isVisible().catch(() => false)) {
    await closeBtn2.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(outputDir, '03_dang_nhap_mobile.png') });

  console.log('>>> Đăng nhập tài khoản quản trị trên Mobile...');
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('>>> [4/18] Chụp Trang Chủ Hội Viên CEO 1983 Mobile...');
  await page.goto('https://ceo1983.viconnect.vn/association', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '04_trang_chu_mobile.png') });

  console.log('>>> [5/18] Chụp Thẻ Hội Viên VIP Mặt Trước...');
  await page.goto('https://ceo1983.viconnect.vn/association/card', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '05_the_hoi_vien_vip_mat_truoc.png') });

  console.log('>>> [6/18] Chụp Thẻ Hội Viên VIP Mặt Sau & QR Code...');
  // Click vào thẻ để lật hoặc tìm nút lật thẻ
  const cardElement = page.locator('.cursor-pointer, [data-card-flip], button:has-text("Lật thẻ"), button:has-text("Mã QR")').first();
  if (await cardElement.isVisible().catch(() => false)) {
    await cardElement.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(outputDir, '06_the_hoi_vien_vip_mat_sau_qr.png') });

  console.log('>>> [7/18] Chụp Danh Bạ Hội Viên...');
  await page.goto('https://ceo1983.viconnect.vn/association/members', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '07_danh_ba_hoi_vien.png') });

  console.log('>>> [8/18] Chụp Chi Tiết Hồ Sơ Doanh Nhân...');
  // Click vào thẻ hội viên đầu tiên
  const firstMemberCard = page.locator('div[class*="member"], div[class*="card"], a[href*="members/"]').first();
  if (await firstMemberCard.isVisible().catch(() => false)) {
    await firstMemberCard.click().catch(() => {});
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(outputDir, '08_chi_tiet_ho_so_hoi_vien.png') });

  console.log('>>> [9/18] Chụp Danh Sách Sự Kiện CLB...');
  await page.goto('https://ceo1983.viconnect.vn/association/events', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '09_danh_sach_su_kien.png') });

  console.log('>>> [10/18] Chụp Chi Tiết Sự Kiện & Form Đăng Ký...');
  const firstEventBtn = page.locator('button:has-text("Đăng ký"), button:has-text("Xem chi tiết"), a:has-text("Đăng ký")').first();
  if (await firstEventBtn.isVisible().catch(() => false)) {
    await firstEventBtn.click().catch(() => {});
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(outputDir, '10_chi_tiet_su_kien_va_dang_ky.png') });

  console.log('>>> [11/18] Chụp Vé Điện Tử E-Ticket & Soát Vé QR...');
  await page.goto('https://ceo1983.viconnect.vn/association/checkin', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '11_ve_dien_tu_qr_checkin.png') });

  console.log('>>> [12/18] Chụp Sàn Giao Thương B2B & Sản Phẩm Hội Viên...');
  await page.goto('https://ceo1983.viconnect.vn/association/products', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '12_san_giao_thuong_b2b.png') });

  console.log('>>> [13/18] Chụp Modal Đăng Sản Phẩm Mới...');
  const addProductBtn = page.locator('button:has-text("Đăng sản phẩm"), button:has-text("Thêm sản phẩm"), button:has-text("+")').first();
  if (await addProductBtn.isVisible().catch(() => false)) {
    await addProductBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.join(outputDir, '13_modal_dang_san_pham_moi.png') });

  console.log('>>> [14/18] Chụp Sàn Cơ Hội Kinh Doanh...');
  await page.goto('https://ceo1983.viconnect.vn/association/opportunities', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '14_co_hoi_kinh_doanh.png') });

  console.log('>>> [15/18] Chụp Bình Chọn & Biểu Quyết Trực Tiếp...');
  await page.goto('https://ceo1983.viconnect.vn/association/voting', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '15_binh_chon_bieu_quyet.png') });

  console.log('>>> [16/18] Chụp Tin Tức & Hoạt Động Hiệp Hội...');
  await page.goto('https://ceo1983.viconnect.vn/association/news', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '16_tin_tuc_hoat_dong.png') });

  console.log('>>> [17/18] Chụp Gia Hạn Hội Phí Niên Liễm & VietQR Napas 24/7...');
  await page.goto('https://ceo1983.viconnect.vn/association/renew', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '17_gia_han_hoi_phi_vietqr.png') });

  console.log('>>> [18/18] Chụp Hồ Sơ Cá Nhân & Cài Đặt Tài Khoản...');
  await page.goto('https://ceo1983.viconnect.vn/association/profile', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '18_ho_so_ca_nhan.png') });

  await browser.close();
  console.log('HOÀN TẤT CHỤP TOÀN BỘ ẢNH MOBILE!');
}

runMobileCapture().catch(console.error);
