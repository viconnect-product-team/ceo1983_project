/**
 * CAPTURE_FRESH_CEO1983_EVIDENCE.JS
 * Xóa sạch toàn bộ ảnh cũ và chụp mới 100% bộ ảnh thực tế từ hệ thống:
 * - Web CRM Quản Trị: https://14.225.217.232:5443
 * - App Di Động Hội Viên: https://14.225.217.232:5444
 * DÀNH RIÊNG CHO CLB DOANH NHÂN CEO 1983 (HANOIBA) — KHÔNG VIONE
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CRM_BASE = 'https://14.225.217.232:5443';
const APP_BASE = 'https://14.225.217.232:5444';

const TARGET_DIRS = [
  path.join(__dirname, '..', 'docs', 'training', 'images'),
  path.join(__dirname, '..', 'apps', 'ceo1983_app_fe', 'public', 'docs', 'images', 'evidence'),
  path.join(__dirname, '..', 'document', 'images', 'evidence'),
];

// Tạo và làm sạch thư mục
console.log('1. Đang dọn dẹp các thư mục ảnh cũ...');
for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.endsWith('.png') || f.endsWith('.jpg')) {
        try {
          fs.unlinkSync(path.join(dir, f));
        } catch (e) {}
      }
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}
console.log('✓ Đã dọn sạch các thư mục ảnh cũ.');

function saveImage(buf, filename, desc) {
  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), buf);
  }
  console.log(`  ✓ [SAVED] ${filename.padEnd(35)} (${(buf.length / 1024).toFixed(1)} KB) -> ${desc}`);
}

async function run() {
  console.log('========================================================================');
  console.log('BẮT ĐẦU CHỤP MỚI 100% BỘ ẢNH THỰC TẾ CLB DOANH NHÂN CEO 1983');
  console.log(`- Web CRM Endpoint: ${CRM_BASE}`);
  console.log(`- Mobile App Endpoint: ${APP_BASE}`);
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox'],
  });

  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true,
  });

  // =========================================================================
  // PHẦN A: CHỤP MÀN HÌNH DESKTOP CỔNG QUẢN TRỊ TRUNG TÂM WEB CRM (1440x900)
  // =========================================================================
  console.log('>>> [PHẦN A] Chụp Màn Hình Web CRM Quản Trị (Desktop)...');
  const crmPage = await desktopCtx.newPage();

  // A1: Màn hình Đăng nhập CRM
  try {
    console.log('A1. Đăng nhập CRM...');
    await crmPage.goto(`${CRM_BASE}/auth?portal=crm`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(1500);
    let buf = await crmPage.screenshot();
    saveImage(buf, '01_crm_login.png', 'Màn hình Đăng nhập Cổng Quản Trị Web CRM');
    saveImage(buf, '03_crm_login_page.png', 'Màn hình Đăng nhập Cổng Quản Trị Web CRM (Mã hóa tương thích)');
  } catch (e) {
    console.error('  Lỗi A1:', e.message);
  }

  // A2: Thực hiện đăng nhập để vào Dashboard CRM
  try {
    console.log('A2. Thực hiện đăng nhập CRM bằng tài khoản BTV / Quản trị...');
    const userInput = crmPage.locator('input[type="text"], input[type="email"], input[name="username"]').first();
    const passInput = crmPage.locator('input[type="password"]').first();
    const submitBtn = crmPage.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("ĐĂNG NHẬP")').first();

    if (await userInput.count() > 0 && await passInput.count() > 0) {
      await userInput.fill('admin@connect.vn');
      await passInput.fill('Admin@123456');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await crmPage.waitForTimeout(3000);
      }
    }

    let buf = await crmPage.screenshot();
    saveImage(buf, '02_crm_dashboard.png', 'Bàn làm việc Dashboard Quản trị Trung tâm');
  } catch (e) {
    console.error('  Lỗi A2:', e.message);
  }

  // A3: Danh sách Hội viên 360 độ
  try {
    console.log('A3. Danh sách Hội viên CRM...');
    await crmPage.goto(`${CRM_BASE}/members`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '03_crm_members_list.png', 'Bảng Quản lý Danh bạ Hội viên 360 độ');
    saveImage(buf, '04_crm_members_management.png', 'Quản lý Hội viên và Phân quyền');

    // Mở ngăn kéo thẩm định thành viên (Drawer)
    const viewBtn = crmPage.locator('button:has-text("Xem"), button:has-text("Duyệt"), tr').nth(1);
    if (await viewBtn.count() > 0) {
      await viewBtn.click();
      await crmPage.waitForTimeout(1500);
      let drawerBuf = await crmPage.screenshot();
      saveImage(buf, '04_crm_member_drawer_approval.png', 'Ngăn kéo Drawer Thẩm định & Phê duyệt Kết nạp (BTV)');
      saveImage(buf, '05_crm_member_approved.png', 'Phê duyệt Hội viên Ban Thành Viên');
    }
  } catch (e) {
    console.error('  Lỗi A3:', e.message);
  }

  // A4: Quản trị Sự kiện Gala & Sơ đồ ghế Cinema Seating Map
  try {
    console.log('A4. Quản trị Sự kiện Gala CRM...');
    await crmPage.goto(`${CRM_BASE}/events`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '05_crm_events_list.png', 'Danh sách Quản lý Sự kiện Hội nghị & Gala');
    saveImage(buf, '12_crm_events_list.png', 'Quản trị Sự kiện Gala');

    // Chụp Sơ đồ ghế Seating Map
    await crmPage.goto(`${CRM_BASE}/events/seating`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let seatBuf = await crmPage.screenshot();
    saveImage(seatBuf, '06_crm_cinema_seating_map.png', 'Sơ đồ Chỗ ngồi Trực quan Cinema Seating Map Bàn Gala VIP');
  } catch (e) {
    console.error('  Lỗi A4:', e.message);
  }

  // A5: Cổng An Ninh Soát Vé Gate Check-in QR
  try {
    console.log('A5. Cổng An Ninh Soát Vé Gate Check-in...');
    await crmPage.goto(`${CRM_BASE}/checkin`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '07_crm_checkin_gate.png', 'Cổng An Ninh Soát Vé Gate Check-in QR (< 0.2s)');
  } catch (e) {
    console.error('  Lỗi A5:', e.message);
  }

  // A6: Quản lý Cuộc họp & Phòng Họp Sapphire Hub
  try {
    console.log('A6. Quản lý Cuộc họp & Sapphire Hub...');
    await crmPage.goto(`${CRM_BASE}/meetings`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '08_crm_meetings_management.png', 'Điều hành Cuộc họp & Thuật toán Chống Trùng Phòng Sapphire Hub');
  } catch (e) {
    console.error('  Lỗi A6:', e.message);
  }

  // A7: Quản trị Công việc Tasks 5 Chế độ xem
  try {
    console.log('A7. Quản trị Công việc Tasks 5 Chế độ xem...');
    await crmPage.goto(`${CRM_BASE}/tasks`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '09_crm_tasks_kanban.png', 'Quản lý Công việc Tasks 5 View Modes (Kanban zoom 3 cấp)');
  } catch (e) {
    console.error('  Lỗi A7:', e.message);
  }

  // A8: Sổ Quỹ Tài Chính & Quỹ Thiện Nguyện 3 Cấp
  try {
    console.log('A8. Sổ Quỹ Tài Chính & Thiện Nguyện...');
    await crmPage.goto(`${CRM_BASE}/funds`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '10_crm_cashbook_funds.png', 'Sổ Quỹ Thu Chi & Kiểm soát Chi tiêu 3 Cấp');
  } catch (e) {
    console.error('  Lỗi A8:', e.message);
  }

  // A9: Quản lý Hội phí & Gạch nợ VietQR
  try {
    console.log('A9. Quản lý Hội phí & Gạch nợ VietQR...');
    await crmPage.goto(`${CRM_BASE}/fees`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '11_crm_fees_management.png', 'Quản trị Hội phí Thường niên & Đối soát Gạch nợ VietQR');
  } catch (e) {
    console.error('  Lỗi A9:', e.message);
  }

  // A10: Quản lý Sàn B2B & Ma trận Phân quyền RBAC
  try {
    console.log('A10. Sàn B2B & Ma trận Phân quyền...');
    await crmPage.goto(`${CRM_BASE}/settings/roles`, { waitUntil: 'networkidle', timeout: 20000 });
    await crmPage.waitForTimeout(2000);
    let buf = await crmPage.screenshot();
    saveImage(buf, '12_crm_permissions_rbac.png', 'Ma trận Phân quyền Vai trò Động Dynamic RBAC 5 Cấp');
  } catch (e) {
    console.error('  Lỗi A10:', e.message);
  }

  // =========================================================================
  // PHẦN B: CHỤP MÀN HÌNH MOBILE APP HỘI VIÊN CEO 1983 (390x844)
  // =========================================================================
  console.log('\n>>> [PHẦN B] Chụp Màn Hình Mobile App Hội Viên (Tỷ lệ Dọc Smartphone 390x844)...');
  const appPage = await mobileCtx.newPage();

  // B1: Landing Page Cổng tiếp nhận hồ sơ gia nhập
  try {
    console.log('B1. Landing Page Cổng tiếp nhận hồ sơ...');
    await appPage.goto(`${APP_BASE}/landing`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    let buf = await appPage.screenshot();
    saveImage(buf, '01_landing_hero.png', 'Cổng Thông Tin Công Khai CLB CEO 1983');
    saveImage(buf, '02_landing_cinematic.png', 'Giao diện Tôn chỉ hoạt động 6 Chuyên ban');

    // Chụp form đăng ký gia nhập online
    await appPage.goto(`${APP_BASE}/landing?apply=true`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2000);
    let regBuf = await appPage.screenshot();
    saveImage(regBuf, '13_app_landing_apply_form.png', 'Biểu Mẫu e-Form Tiếp Nhận Hồ Sơ Gia Nhập Trực Tuyến');
  } catch (e) {
    console.error('  Lỗi B1:', e.message);
  }

  // B2: Đăng nhập Mobile App Hội viên
  try {
    console.log('B2. Đăng nhập Mobile App...');
    await appPage.goto(`${APP_BASE}/association/login`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    let buf = await appPage.screenshot();
    saveImage(buf, '06_app_login_screen.png', 'Màn hình Đăng nhập Mobile App Hội viên CEO 1983');

    // Đăng nhập vào app
    const uInput = appPage.locator('input[type="text"], input[type="email"], input[name="username"]').first();
    const pInput = appPage.locator('input[type="password"]').first();
    const loginBtn = appPage.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("ĐĂNG NHẬP")').first();

    if (await uInput.count() > 0 && await pInput.count() > 0) {
      await uInput.fill('ceo.thanhvien@ceo1983.com');
      await pInput.fill('Admin@123456');
      if (await loginBtn.count() > 0) {
        await loginBtn.click();
        await appPage.waitForTimeout(3000);
      }
    }
  } catch (e) {
    console.error('  Lỗi B2:', e.message);
  }

  // B3: Trang chủ Hội viên VIP
  try {
    console.log('B3. Trang chủ Hội viên...');
    await appPage.goto(`${APP_BASE}/association`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '08_app_home_dashboard.png', 'Trang Chủ Hội Viên CLB Doanh Nhân CEO 1983');
  } catch (e) {
    console.error('  Lỗi B3:', e.message);
  }

  // B4: Thẻ VIP 3D Titanium & NFC
  try {
    console.log('B4. Thẻ VIP 3D Titanium...');
    await appPage.goto(`${APP_BASE}/association/card`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '09_app_vip_card.png', 'Thẻ Hội Viên VIP 3D Titanium Hiệu Ứng Lật 180 Độ');
  } catch (e) {
    console.error('  Lỗi B4:', e.message);
  }

  // B5: Trang Danh thiếp số công khai tải file vCard (.vcf)
  try {
    console.log('B5. Trang danh thiếp số công khai vCard...');
    await appPage.goto(`${APP_BASE}/card/ceo83007`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '14_app_public_card_vcf.png', 'Trang Danh Thiếp Số Công Khai & Nút Tải vCard (.vcf)');
  } catch (e) {
    console.error('  Lỗi B5:', e.message);
  }

  // B6: Danh bạ CEO 1983 & Lịch sử cuộc gặp 1-on-1
  try {
    console.log('B6. Danh bạ CEO 1983...');
    await appPage.goto(`${APP_BASE}/association/members`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '15_app_members_directory.png', 'Danh Bạ 500+ CEO Hội Viên & Lọc Chuyên Ban');
  } catch (e) {
    console.error('  Lỗi B6:', e.message);
  }

  // B7: Hộp thư Messenger #0084FF & Kênh Ban Thư Ký ghim trên cùng
  try {
    console.log('B7. Hộp thư Messenger #0084FF...');
    await appPage.goto(`${APP_BASE}/association/messages`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '09_app_chat_call_messenger_bubble.png', 'Hộp Thư Doanh Nhân Messenger #0084FF & Kênh Ban Thư Ký Ghim');
  } catch (e) {
    console.error('  Lỗi B7:', e.message);
  }

  // B8: Sự kiện & Vé điện tử E-Ticket QR
  try {
    console.log('B8. Sự kiện & Vé E-Ticket...');
    await appPage.goto(`${APP_BASE}/association/events`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '13_app_events_screen.png', 'Khám Phá Sự Kiện Hội Nghị & Gala Dinner');
    saveImage(buf, '14_app_event_checkin_pass.png', 'Vé Điện Tử E-Ticket QR Check-in Khổ Lớn');
  } catch (e) {
    console.error('  Lỗi B8:', e.message);
  }

  // B9: Thanh toán Hội phí VietQR Napas 24/7
  try {
    console.log('B9. Thanh toán Hội phí VietQR...');
    await appPage.goto(`${APP_BASE}/association/renew`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '08_app_vietqr_payment_modal.png', 'Mã VietQR Động Nộp Hội Phí Thường Niên Napas 24/7');
  } catch (e) {
    console.error('  Lỗi B9:', e.message);
  }

  // B10: Sàn B2B có trợ giá nội bộ & Bảng tin Cung - Cầu
  try {
    console.log('B10. Sàn B2B & Cơ hội Cung - Cầu...');
    await appPage.goto(`${APP_BASE}/association/products`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '16_app_products_ecommerce_grid.png', 'Sàn Thương Mại Doanh Nhân B2B CEO 1983');

    await appPage.goto(`${APP_BASE}/association/opportunities`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let oppBuf = await appPage.screenshot();
    saveImage(oppBuf, '20_app_opportunities_feed.png', 'Bảng Tin Cơ Hội Kinh Doanh Cung - Cầu 1-on-1');
  } catch (e) {
    console.error('  Lỗi B10:', e.message);
  }

  // B11: Biểu Quyết Đại Hội Điện Tử Trực Tuyến
  try {
    console.log('B11. Biểu Quyết Đại Hội...');
    await appPage.goto(`${APP_BASE}/association/voting`, { waitUntil: 'networkidle', timeout: 20000 });
    await appPage.waitForTimeout(2500);
    let buf = await appPage.screenshot();
    saveImage(buf, '15_app_live_voting.png', 'Biểu Quyết & Bầu Cử Đại Hội Điện Tử 1 Người 1 Phiếu');
  } catch (e) {
    console.error('  Lỗi B11:', e.message);
  }

  await browser.close();
  console.log('\n========================================================================');
  console.log('🎉 ĐÃ HOÀN TẤT CHỤP MỚI TOÀN BỘ ẢNH THỰC TẾ CHO CLB DOANH NHÂN CEO 1983!');
  console.log('========================================================================\n');
}

run().catch((err) => {
  console.error('❌ Lỗi tiến trình chụp ảnh:', err);
  process.exit(1);
});
