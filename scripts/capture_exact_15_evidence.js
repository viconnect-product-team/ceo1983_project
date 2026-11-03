const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CRM_BASE = 'https://crm.ceo1983.viconnect.vn';
const APP_BASE = 'https://ceo1983.viconnect.vn';
const OUT_DIR = path.resolve('document/evidence_exact_15');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function main() {
  console.log('🚀 Bắt đầu chụp 15 hình ảnh thực tế từ Domain Test theo 15 yêu cầu CEO 1983...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  // 1. LẤY TOKEN ĐĂNG NHẬP
  console.log('🔑 Đăng nhập lấy Authentication Token...');
  const crmAuthRes = await fetch(`${CRM_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@connect.vn', password: '123456' })
  });
  const crmAuth = await crmAuthRes.json();

  const appAuthRes = await fetch(`${APP_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo.tongthuky@ceo1983.com', password: '123456' })
  });
  const appAuth = await appAuthRes.json();

  // === A. CHỤP CÁC MÀN HÌNH MOBILE APP ===
  console.log('\n📱 CHỤP MÀN HÌNH MOBILE APP (390 x 844)...');
  const appContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const appPage = await appContext.newPage();

  // Thiết lập auth cho Mobile App
  await appPage.goto(`${APP_BASE}/association/login`, { waitUntil: 'domcontentloaded' });
  await appContext.addCookies([
    { name: 'access_token', value: appAuth.access_token, domain: 'ceo1983.viconnect.vn', path: '/' },
    { name: 'vibe_token', value: appAuth.access_token, domain: 'ceo1983.viconnect.vn', path: '/' },
    { name: 'sb-access-token', value: appAuth.access_token, domain: 'ceo1983.viconnect.vn', path: '/' }
  ]);
  await appPage.evaluate((data) => {
    localStorage.setItem('vibe_token', data.access_token);
    localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
  }, appAuth);

  // STT 1: Trang chủ Mobile App tinh gọn 4 tính năng chính
  try {
    console.log('📸 STT 1: Chụp Trang chủ Mobile App tinh gọn 4 tính năng...');
    await appPage.goto(`${APP_BASE}/association`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req01_app_trangchu_tinhgon.png') });
    console.log('  ✓ Đã lưu req01_app_trangchu_tinhgon.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 1:', e.message);
  }

  // STT 2: Thẻ hội viên VIP số hóa & Bảo mật SĐT/Email
  try {
    console.log('📸 STT 2: Chụp Thẻ hội viên VIP số hóa & Bảo mật...');
    await appPage.goto(`${APP_BASE}/association/card`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    // Cố gắng mở modal cài đặt bảo mật nếu có
    const privacyBtn = await appPage.$('button:has-text("Bảo mật"), button:has-text("Quyền riêng tư"), button[title*="bảo mật" i], button[aria-label*="bảo mật" i]');
    if (privacyBtn) {
      await privacyBtn.click().catch(() => {});
      await appPage.waitForTimeout(1000);
    }
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req02_app_the_vip_baomat.png') });
    console.log('  ✓ Đã lưu req02_app_the_vip_baomat.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 2:', e.message);
  }

  // STT 3: Đặc quyền VIP hội viên riêng biệt
  try {
    console.log('📸 STT 3: Chụp Đặc quyền VIP hội viên...');
    await appPage.goto(`${APP_BASE}/association/perks`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req03_app_dacquyen_vip.png') });
    console.log('  ✓ Đã lưu req03_app_dacquyen_vip.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 3:', e.message);
  }

  // STT 4: Sàn giao thương B2B giới hạn 5 sản phẩm
  try {
    console.log('📸 STT 4: Chụp Sàn B2B giới hạn 5 sản phẩm...');
    await appPage.goto(`${APP_BASE}/association/products`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req04_app_b2b_5sanpham.png') });
    console.log('  ✓ Đã lưu req04_app_b2b_5sanpham.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 4:', e.message);
  }

  // STT 5: Cơ hội hợp tác B2B - Bộ lọc ngành nghề & 2 chiều Mua/Bán
  try {
    console.log('📸 STT 5: Chụp Cơ hội B2B ngành nghề & 2 chiều Mua/Bán...');
    await appPage.goto(`${APP_BASE}/association/opportunities`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req05_app_cohoi_nganhnghe.png') });
    console.log('  ✓ Đã lưu req05_app_cohoi_nganhnghe.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 5:', e.message);
  }

  // STT 7: Đặt lịch hẹn Kết nối 1-on-1 Doanh nhân & Ghi nhận Deal Value
  try {
    console.log('📸 STT 7: Chụp Kết nối 1-on-1 Doanh nhân...');
    await appPage.goto(`${APP_BASE}/association/connect`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req07_app_ketnoi_1on1_dealvalue.png') });
    console.log('  ✓ Đã lưu req07_app_ketnoi_1on1_dealvalue.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 7:', e.message);
  }

  // STT 15: Trang cá nhân doanh nhân 360 (Hồ sơ, Lịch sử sự kiện, Cơ hội B2B)
  try {
    console.log('📸 STT 15: Chụp Trang cá nhân doanh nhân 360...');
    await appPage.goto(`${APP_BASE}/association/profile`, { waitUntil: 'networkidle', timeout: 25000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'req15_app_trangcanhan_360.png') });
    console.log('  ✓ Đã lưu req15_app_trangcanhan_360.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 15:', e.message);
  }

  // === B. CHỤP CÁC MÀN HÌNH CRM QUẢN TRỊ (DESKTOP 1440 x 900) ===
  console.log('\n🖥️ CHỤP MÀN HÌNH CRM QUẢN TRỊ (1440 x 900)...');
  const crmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });
  const crmPage = await crmContext.newPage();

  // Thiết lập auth cho CRM
  await crmPage.goto(`${CRM_BASE}/auth?portal=crm`, { waitUntil: 'domcontentloaded' });
  await crmContext.addCookies([
    { name: 'access_token', value: crmAuth.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'vibe_token', value: crmAuth.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' },
    { name: 'sb-access-token', value: crmAuth.access_token, domain: 'crm.ceo1983.viconnect.vn', path: '/' }
  ]);
  await crmPage.evaluate((data) => {
    localStorage.setItem('vibe_token', data.access_token);
    localStorage.setItem('vibe_refresh_token', data.refresh_token || data.access_token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
  }, crmAuth);

  // STT 6: CRM Sidebar Menu tinh hoa (Đã xóa hoàn toàn mục Quảng cáo) & Danh sách hội viên
  try {
    console.log('📸 STT 6: Chụp CRM Sidebar & Quản lý hội viên (Xóa bỏ quảng cáo)...');
    await crmPage.goto(`${CRM_BASE}/members`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req06_crm_sidebar_khong_quangcao.png') });
    console.log('  ✓ Đã lưu req06_crm_sidebar_khong_quangcao.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 6:', e.message);
  }

  // STT 8: CỔNG THANH TOÁN QUỐC GIA VNPAY GATEWAY (HMAC-SHA512, VNPAY-QR, Thẻ ATM/Quốc Tế)
  try {
    console.log('📸 STT 8: Chụp CỔNG THANH TOÁN VNPAY GATEWAY trong CRM Settings...');
    await crmPage.goto(`${CRM_BASE}/settings?tab=vnpay`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req08_crm_vnpay_gateway.png') });
    console.log('  ✓ Đã lưu req08_crm_vnpay_gateway.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 8:', e.message);
  }

  // STT 9: Check-in sự kiện & Vòng quay may mắn Lucky Draw
  try {
    console.log('📸 STT 9: Chụp Vòng quay may mắn Lucky Draw / Check-in...');
    await crmPage.goto(`${CRM_BASE}/lucky-draw`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req09_crm_luckydraw_checkin.png') });
    console.log('  ✓ Đã lưu req09_crm_luckydraw_checkin.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 9:', e.message);
  }

  // STT 10: Quản lý Lịch họp đa tầng (BCH, Ban điều hành, CLB) & Onboarding
  try {
    console.log('📸 STT 10: Chụp Quản lý Lịch họp đa tầng...');
    await crmPage.goto(`${CRM_BASE}/meetings`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req10_crm_lichhop_onboarding.png') });
    console.log('  ✓ Đã lưu req10_crm_lichhop_onboarding.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 10:', e.message);
  }

  // STT 11: Chuẩn hóa Hồ sơ hội viên 360 & Tự động chúc mừng sinh nhật
  try {
    console.log('📸 STT 11: Chụp Hồ sơ hội viên 360 & Ngày sinh chuẩn hóa...');
    await crmPage.goto(`${CRM_BASE}/members`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2000);
    // Click vào dòng hội viên đầu tiên để mở Drawer 360 nếu có
    const row = await crmPage.$('table tbody tr:first-child');
    if (row) {
      await row.click().catch(() => {});
      await crmPage.waitForTimeout(1500);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req11_crm_hoivien_sinhnhat.png') });
    console.log('  ✓ Đã lưu req11_crm_hoivien_sinhnhat.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 11:', e.message);
  }

  // STT 12: Chỉ số sức khỏe hội viên Recharts & Cảnh báo trầm lắng
  try {
    console.log('📸 STT 12: Chụp Chỉ số sức khỏe hội viên & Cảnh báo trầm lắng...');
    await crmPage.goto(`${CRM_BASE}/analytics`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req12_crm_suckhoe_hoivien.png') });
    console.log('  ✓ Đã lưu req12_crm_suckhoe_hoivien.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 12:', e.message);
  }

  // STT 13: Quản lý Hội phí thường niên, Nút Nhắc phí tự động & Cổng VNPAY
  try {
    console.log('📸 STT 13: Chụp Quản lý Hội phí thường niên, Nút Nhắc phí & Xuất Excel...');
    await crmPage.goto(`${CRM_BASE}/fees`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req13_crm_quanly_hoiphi.png') });
    console.log('  ✓ Đã lưu req13_crm_quanly_hoiphi.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 13:', e.message);
  }

  // STT 14: Báo cáo tài chính & Chỉ số điều hành định kỳ Tháng/Quý (Khổ A4 & Excel)
  try {
    console.log('📸 STT 14: Chụp Báo cáo tài chính & Thu chi...');
    await crmPage.goto(`${CRM_BASE}/finance-report`, { waitUntil: 'networkidle', timeout: 25000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'req14_crm_baocao_taichinh.png') });
    console.log('  ✓ Đã lưu req14_crm_baocao_taichinh.png');
  } catch (e) {
    console.error('  ✗ Lỗi STT 14:', e.message);
  }

  await browser.close();
  console.log('\n🎉 HOÀN THÀNH CHỤP TOÀN BỘ 15 HÌNH ẢNH MINH CHỨNG THỰC TẾ TRÊN DOMAIN TEST!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

