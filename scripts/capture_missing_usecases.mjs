import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function main() {
  const screenshotsDir = path.resolve('docs/training/screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('>>> BẮT ĐẦU CHỤP BỘ ẢNH CHI TIẾT CÁC USE CASE ĐẶC THÙ (CHỜ >= 4S)...');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });
  const crmPage = await crmContext.newPage();

  // Đăng nhập CRM
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await crmPage.fill('input[type="password"]', '123456');
  await crmPage.click('button[type="submit"]');
  await crmPage.waitForTimeout(4000);

  // --------------------------------------------------------------------
  // USE CASE 1: SƠ ĐỒ XẾP CHỖ RẠP PHIM (CINEMA SEATING MAP)
  // --------------------------------------------------------------------
  console.log('1. Chụp Sơ Đồ Xếp Chỗ Rạp Chiếu Phim (Cinema Seating Studio)...');
  await crmPage.goto('https://crm.ceo1983.viconnect.vn/event-registrations', { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  const seatingBtn = crmPage.locator('button:has-text("Sơ Đồ Xếp Chỗ")').first();
  if (await seatingBtn.isVisible()) {
    await seatingBtn.click();
    await crmPage.waitForTimeout(4000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_08_cinema_seating_studio.png') });
    console.log(' -> Đã chụp: crm_08_cinema_seating_studio.png');
    // Đóng modal
    const closeBtn = crmPage.locator('button:has-text("Đóng"), button:has-text("Hủy"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    await crmPage.waitForTimeout(1000);
  }

  // --------------------------------------------------------------------
  // USE CASE 2: MÃ QR SỰ KIỆN & STANDEE QUÉT ZALO CHO KHÁCH MỜI
  // --------------------------------------------------------------------
  console.log('2. Chụp Mã QR Sự Kiện, Standee Zalo & Soát Vé Gatekeeper...');
  const addParticipantBtn = crmPage.locator('button:has-text("+ Quét QR / Thêm người tham gia")').first();
  if (await addParticipantBtn.isVisible()) {
    await addParticipantBtn.click();
    await crmPage.waitForTimeout(4000);
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_08_event_qr_gatekeeper_modal.png') });
    console.log(' -> Đã chụp: crm_08_event_qr_gatekeeper_modal.png');
    const closeBtn = crmPage.locator('button:has-text("Đóng"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    await crmPage.waitForTimeout(1000);
  }

  // --------------------------------------------------------------------
  // USE CASE 3: FORM ĐĂNG KÝ SỰ KIỆN DÀNH CHO KHÁCH MỜI
  // --------------------------------------------------------------------
  console.log('3. Chụp Form Đăng Ký Sự Kiện Dành Cho Khách Mời Ngoài...');
  const eventId = 'EV-MV7E33J4';
  await crmPage.goto(`https://crm.ceo1983.viconnect.vn/events/${eventId}/register?source=zalo_guest`, { waitUntil: 'networkidle', timeout: 45000 });
  await crmPage.waitForTimeout(4000);
  await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_07_guest_event_register_form.png') });
  console.log(' -> Đã chụp: crm_07_guest_event_register_form.png');

  // --------------------------------------------------------------------
  // USE CASE 4: XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG, THẺ VÉ E-TICKET & EMAIL THÔNG BÁO
  // --------------------------------------------------------------------
  console.log('4. Điền form và Chụp Màn hình Xác nhận Đăng ký Thành công & Email thông báo...');
  // Điền form đăng ký khách mời
  const nameInput = crmPage.locator('input[placeholder*="họ và tên" i], input[name*="name" i]').first();
  const phoneInput = crmPage.locator('input[placeholder*="số điện thoại" i], input[type="tel"]').first();
  const emailInput = crmPage.locator('input[placeholder*="email" i], input[type="email"]').first();
  const companyInput = crmPage.locator('input[placeholder*="công ty" i], input[placeholder*="doanh nghiệp" i]').first();
  const positionInput = crmPage.locator('input[placeholder*="chức vụ" i]').first();

  if (await nameInput.isVisible().catch(() => false)) await nameInput.fill('Nguyễn Tuấn Anh');
  if (await phoneInput.isVisible().catch(() => false)) await phoneInput.fill('0988665544');
  if (await emailInput.isVisible().catch(() => false)) await emailInput.fill('tuananh.ceo@vietants.vn');
  if (await companyInput.isVisible().catch(() => false)) await companyInput.fill('Tập đoàn Công nghệ & Thương mại Ánh Dương');
  if (await positionInput.isVisible().catch(() => false)) await positionInput.fill('Chủ tịch HĐQT & Tổng Giám đốc');

  const submitBtn = crmPage.locator('button:has-text("Xác nhận đăng ký"), button:has-text("Đăng ký tham dự"), button[type="submit"]').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await crmPage.waitForTimeout(4500); // Chờ render kết quả E-Ticket
    await crmPage.screenshot({ path: path.join(screenshotsDir, 'crm_07_event_register_success_email.png') });
    console.log(' -> Đã chụp: crm_07_event_register_success_email.png');
  }

  await crmContext.close();

  // --------------------------------------------------------------------
  // USE CASE 5: MOBILE APP - TRUNG TÂM MÃ QR SỰ KIỆN & THẺ VÉ HỘI VIÊN
  // --------------------------------------------------------------------
  console.log('\n--- BƯỚC 2: CHỤP MOBILE APP CÁC USE CASE QR & ĐĂNG KÝ ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    localStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
    sessionStorage.setItem('ceo1983_ios_prompt_dismissed', 'true');
  });

  // Login mobile
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/login', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await mobilePage.fill('input[type="password"]', '123456');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(4000);

  // Chụp Trung tâm Mã QR Sự Kiện trên Mobile
  console.log('5. Chụp Mobile Trung Tâm Mã QR Sự Kiện (Thẻ Vé QR + Mã QR Zalo Khách Mời)...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/checkin', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  // Chuyển sang tab "Mã QR Sự Kiện"
  const qrEventTab = mobilePage.locator('button:has-text("Mã QR Sự Kiện"), [role="tab"]:has-text("QR")').first();
  if (await qrEventTab.isVisible().catch(() => false)) {
    await qrEventTab.click();
    await mobilePage.waitForTimeout(3000);
  }
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_10_event_qr_hub.png') });
  console.log(' -> Đã chụp: app_10_event_qr_hub.png');

  // Chụp Vé Mời Điện Tử & Số Lucky Draw trên Mobile
  console.log('6. Chụp Mobile Thẻ Vé Mời & Mã Check-in...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/association/events', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(4000);
  const ticketBtn = mobilePage.locator('button:has-text("Xem vé"), button:has-text("Vé của tôi"), button:has-text("Chi tiết vé")').first();
  if (await ticketBtn.isVisible().catch(() => false)) {
    await ticketBtn.click();
    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_10_event_ticket_detail.png') });
    console.log(' -> Đã chụp: app_10_event_ticket_detail.png');
  }

  // Chụp Màn hình Thông báo Nộp Đơn Gia Nhập Thành Công trên Landing Page
  console.log('7. Chụp Mobile Đơn Đăng Ký Gia Nhập & Xác Nhận Thành Công...');
  await mobilePage.goto('https://ceo1983.viconnect.vn/landing', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(3500);
  // Điền form đăng ký hội viên
  const mName = mobilePage.locator('input[placeholder*="họ và tên" i], input[name*="name" i]').first();
  const mPhone = mobilePage.locator('input[placeholder*="số điện thoại" i], input[type="tel"]').first();
  const mEmail = mobilePage.locator('input[placeholder*="email" i], input[type="email"]').first();
  const mCompany = mobilePage.locator('input[placeholder*="công ty" i], input[placeholder*="doanh nghiệp" i]').first();

  if (await mName.isVisible().catch(() => false)) await mName.fill('Trần Hoàng Long');
  if (await mPhone.isVisible().catch(() => false)) await mPhone.fill('0977889900');
  if (await mEmail.isVisible().catch(() => false)) await mEmail.fill('hoanglong.ceo@longphat.vn');
  if (await mCompany.isVisible().catch(() => false)) await mCompany.fill('Công ty Cổ phần Xây dựng & Nội thất Long Phát');

  const mSubmit = mobilePage.locator('button:has-text("Gửi đơn"), button:has-text("Đăng ký gia nhập")').first();
  if (await mSubmit.isVisible().catch(() => false)) {
    await mSubmit.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'app_01_landing_form_filled.png') });
    console.log(' -> Đã chụp: app_01_landing_form_filled.png');
  }

  await mobileContext.close();
  await browser.close();

  console.log('\n>>> HOÀN TẤT CHỤP BỔ SUNG CÁC USE CASE ĐẶC THÙ!');
}

main().catch(console.error);
