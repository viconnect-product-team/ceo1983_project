import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('D:/download/node_modules/playwright');
import path from 'path';

async function captureMissingCrm() {
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

  console.log('>>> Đăng nhập CRM...');
  await page.goto('https://crm.ceo1983.viconnect.vn/auth', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[type="email"]', 'admin@connect.vn');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('>>> [1/5] Chụp Modal Tạo Sự Kiện 3 Bước...');
  await page.goto('https://crm.ceo1983.viconnect.vn/events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const createEvtBtn = page.locator('button:has-text("Tạo sự kiện")').first();
  if (await createEvtBtn.isVisible()) {
    await createEvtBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outputDir, '11_modal_tao_su_kien_3_buoc.png') });
    console.log('Saved 11_modal_tao_su_kien_3_buoc.png');
  }

  console.log('>>> [2/5] Chụp Modal Tạo Cuộc Họp Ban...');
  await page.goto('https://crm.ceo1983.viconnect.vn/meetings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const createMeetingBtn = page.locator('button:has-text("Tạo Cuộc Họp Ban")').first();
  if (await createMeetingBtn.isVisible()) {
    await createMeetingBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outputDir, '16_modal_dat_phong_hop.png') });
    console.log('Saved 16_modal_dat_phong_hop.png');
  }

  console.log('>>> [3/5] Chụp Modal Thêm Công Việc Mới...');
  await page.goto('https://crm.ceo1983.viconnect.vn/tasks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const createTaskBtn = page.locator('button:has-text("Thêm công việc mới")').first();
  if (await createTaskBtn.isVisible()) {
    await createTaskBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outputDir, '18_modal_giao_viec_moi.png') });
    console.log('Saved 18_modal_giao_viec_moi.png');
  }

  console.log('>>> [4/5] Chụp Tab Quản Lý Template Mail CRM...');
  await page.goto('https://crm.ceo1983.viconnect.vn/documents', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const mailTab = page.locator('button:has-text("Quản Lý Template Mail CRM")').first();
  if (await mailTab.isVisible()) {
    await mailTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outputDir, '22_mau_email_tu_dong.png') });
    console.log('Saved 22_mau_email_tu_dong.png');
  }

  console.log('>>> [5/5] Chụp Chi Tiết Hồ Sơ & Phê Duyệt Hội Viên...');
  await page.goto('https://crm.ceo1983.viconnect.vn/members', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Tìm link chi tiết hội viên hoặc click dòng đầu tiên
  const firstMemberRow = page.locator('table tbody tr').first();
  if (await firstMemberRow.isVisible()) {
    const viewBtn = firstMemberRow.locator('a, button').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outputDir, '09_phe_duyet_chi_tiet_hoi_vien.png') });
      console.log('Saved 09_phe_duyet_chi_tiet_hoi_vien.png');
    }
  }

  await browser.close();
  console.log('Cập nhật bổ sung hoàn tất!');
}

captureMissingCrm().catch(console.error);
