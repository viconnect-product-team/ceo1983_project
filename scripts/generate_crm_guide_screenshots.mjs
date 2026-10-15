import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import fs from 'fs';
import path from 'path';

async function runCrmCapture() {
  const outputDir = path.resolve('document/images/guide_crm');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5
  });

  const page = await context.newPage();

  console.log('>>> [1/25] Chụp Màn Hình Đăng Nhập CRM...');
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: path.join(outputDir, '01_dang_nhap_crm.png') });

  console.log('>>> Đăng nhập tài khoản quản trị trên CRM...');
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('>>> [2/25] Chụp Dashboard Tổng Quan CRM...');
  await page.goto('https://crm.ceo1983.viconnect.vn/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '02_dashboard_tong_quan.png') });

  console.log('>>> [3/25] Chụp Quản Lý Ban Chuyên Môn...');
  await page.goto('https://crm.ceo1983.viconnect.vn/departments', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '03_quan_ly_ban_chuyen_mon.png') });

  console.log('>>> [4/25] Chụp Modal Thêm Ban Chuyên Môn Mới...');
  const addDeptBtn = page.locator('button:has-text("Thêm Ban"), button:has-text("+ Thêm Ban Mới")').first();
  if (await addDeptBtn.isVisible().catch(() => false)) {
    await addDeptBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '04_modal_them_ban_moi.png') });
    // Đóng modal
    const closeDept = page.locator('button:has-text("Hủy"), button[aria-label="Close"], button:has-text("Đóng")').first();
    if (await closeDept.isVisible().catch(() => false)) await closeDept.click().catch(() => {});
  }

  console.log('>>> [5/25] Chụp Quản Lý Tài Khoản Vận Hành...');
  await page.goto('https://crm.ceo1983.viconnect.vn/accounts', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '05_quan_ly_tai_khoan.png') });

  console.log('>>> [6/25] Chụp Modal Thêm Tài Khoản Mới...');
  const addAccBtn = page.locator('button:has-text("Thêm Tài Khoản"), button:has-text("+ Thêm")').first();
  if (await addAccBtn.isVisible().catch(() => false)) {
    await addAccBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '06_modal_them_tai_khoan.png') });
    const closeAcc = page.locator('button:has-text("Hủy"), button[aria-label="Close"]').first();
    if (await closeAcc.isVisible().catch(() => false)) await closeAcc.click().catch(() => {});
  }

  console.log('>>> [7/25] Chụp Ma Trận Phân Quyền Vai Trò RBAC...');
  await page.goto('https://crm.ceo1983.viconnect.vn/permissions', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '07_ma_tran_phan_quyen_rbac.png') });

  console.log('>>> [8/25] Chụp Quản Lý Hội Viên...');
  await page.goto('https://crm.ceo1983.viconnect.vn/members', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '08_quan_ly_hoi_vien.png') });

  console.log('>>> [9/25] Chụp Chi Tiết Hồ Sơ & Phê Duyệt Hội Viên...');
  const firstMemberAction = page.locator('table tr a, table tr button[title*="Xem"], table tr button:has-text("Xem")').first();
  if (await firstMemberAction.isVisible().catch(() => false)) {
    await firstMemberAction.click().catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outputDir, '09_phe_duyet_chi_tiet_hoi_vien.png') });
  } else {
    await page.screenshot({ path: path.join(outputDir, '09_phe_duyet_chi_tiet_hoi_vien.png') });
  }

  console.log('>>> [10/25] Chụp Quản Trị Sự Kiện...');
  await page.goto('https://crm.ceo1983.viconnect.vn/events', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '10_quan_tri_su_kien.png') });

  console.log('>>> [11/25] Chụp Modal Tạo Sự Kiện Mới 3 Bước...');
  const createEventBtn = page.locator('button:has-text("+ Tạo sự kiện"), button:has-text("Tạo sự kiện mới"), button:has-text("+ Tạo")').first();
  if (await createEventBtn.isVisible().catch(() => false)) {
    await createEventBtn.click().catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(outputDir, '11_modal_tao_su_kien_3_buoc.png') });
    const closeEvt = page.locator('button:has-text("Hủy"), button[aria-label="Close"], button:has-text("Đóng")').first();
    if (await closeEvt.isVisible().catch(() => false)) await closeEvt.click().catch(() => {});
  }

  console.log('>>> [12/25] Chụp Sơ Đồ Khán Phòng & Bàn Tiệc...');
  const viewDetailEvt = page.locator('table tr a[href*="events/"], a:has-text("Chi tiết"), button:has-text("Chi tiết")').first();
  if (await viewDetailEvt.isVisible().catch(() => false)) {
    await viewDetailEvt.click().catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outputDir, '12_so_do_khan_phong_ban_tiec.png') });
  } else {
    await page.screenshot({ path: path.join(outputDir, '12_so_do_khan_phong_ban_tiec.png') });
  }

  console.log('>>> [13/25] Chụp Quản Lý Người Đăng Ký & Xếp Chỗ Sự Kiện...');
  await page.goto('https://crm.ceo1983.viconnect.vn/event-registrations', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '13_quan_ly_dang_ky_su_kien.png') });

  console.log('>>> [14/25] Chụp Cấu Hình Giải Thưởng Vòng Quay May Mắn...');
  await page.goto('https://crm.ceo1983.viconnect.vn/lucky-draw', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '14_cau_hinh_vong_quay_may_man.png') });

  console.log('>>> [15/25] Chụp Quản Lý Lịch Họp & Hẹn Gặp B2B...');
  await page.goto('https://crm.ceo1983.viconnect.vn/meetings', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '15_quan_ly_lich_hop.png') });

  console.log('>>> [16/25] Chụp Modal Đặt Phòng Họp & Lên Lịch...');
  const addMeetingBtn = page.locator('button:has-text("Lên lịch"), button:has-text("+ Đặt phòng"), button:has-text("+ Tạo"), button:has-text("+ Lên lịch họp")').first();
  if (await addMeetingBtn.isVisible().catch(() => false)) {
    await addMeetingBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '16_modal_dat_phong_hop.png') });
    const closeMtg = page.locator('button:has-text("Hủy"), button[aria-label="Close"]').first();
    if (await closeMtg.isVisible().catch(() => false)) await closeMtg.click().catch(() => {});
  }

  console.log('>>> [17/25] Chụp Giao Việc & Quản Trị Tiến Độ Kanban...');
  await page.goto('https://crm.ceo1983.viconnect.vn/tasks', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '17_giao_viec_nhiem_vu_kanban.png') });

  console.log('>>> [18/25] Chụp Modal Giao Việc Mới...');
  const addTaskBtn = page.locator('button:has-text("+ Giao việc mới"), button:has-text("+ Tạo nhiệm vụ"), button:has-text("+ Giao việc")').first();
  if (await addTaskBtn.isVisible().catch(() => false)) {
    await addTaskBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '18_modal_giao_viec_moi.png') });
    const closeTask = page.locator('button:has-text("Hủy"), button[aria-label="Close"]').first();
    if (await closeTask.isVisible().catch(() => false)) await closeTask.click().catch(() => {});
  }

  console.log('>>> [19/25] Chụp Quản Lý Tài Chính & Sổ Quỹ Thu Chi...');
  await page.goto('https://crm.ceo1983.viconnect.vn/income', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '19_quan_ly_so_quy_thu_chi.png') });

  console.log('>>> [20/25] Chụp Quản Lý Hội Phí Niên Liễm...');
  await page.goto('https://crm.ceo1983.viconnect.vn/fees', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '20_quan_ly_hoi_phi_hoa_don.png') });

  console.log('>>> [21/25] Chụp Kho Văn Kiện Số & Quy Chế CLB...');
  await page.goto('https://crm.ceo1983.viconnect.vn/documents', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '21_kho_van_kien_so.png') });

  console.log('>>> [22/25] Chụp Quản Lý Mẫu Email Tự Động...');
  const emailTab = page.locator('button:has-text("Mẫu thư"), button:has-text("Mẫu Email"), button:has-text("Email Template")').first();
  if (await emailTab.isVisible().catch(() => false)) {
    await emailTab.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.join(outputDir, '22_mau_email_tu_dong.png') });

  console.log('>>> [23/25] Chụp Mạng Lưới Doanh Nhân & Nhắn Tin Trao Đổi 1-ON-1...');
  await page.goto('https://crm.ceo1983.viconnect.vn/network', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '23_tin_nhan_trao_doi_network.png') });

  console.log('>>> [24/25] Chụp Quản Trị Nhà Tài Trợ & Gói Tài Trợ...');
  await page.goto('https://crm.ceo1983.viconnect.vn/sponsors', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '24_quan_tri_tai_tro.png') });

  console.log('>>> [25/25] Chụp Cài Đặt Hệ Thống & Cấu Hình VietQR Ngân Hàng...');
  await page.goto('https://crm.ceo1983.viconnect.vn/settings', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, '25_cai_dat_he_thong.png') });

  await browser.close();
  console.log('HOÀN TẤT CHỤP TOÀN BỘ ẢNH CRM!');
}

runCrmCapture().catch(console.error);
