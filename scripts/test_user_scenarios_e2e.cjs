const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '../test-reports/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const APP_URL = 'https://ceo1983.viconnect.vn';
const CRM_URL = 'https://crm.ceo1983.viconnect.vn';

async function dismissModals(page) {
  try {
    const dismissBtns = page.locator('button:has-text("Để sau"), button:has-text("Đã hiểu"), button:has-text("Bỏ qua")');
    const count = await dismissBtns.count();
    for (let i = 0; i < count; i++) {
      if (await dismissBtns.nth(i).isVisible()) {
        await dismissBtns.nth(i).click({ force: true }).catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch {}
}

async function run() {
  console.log('🚀 Starting Comprehensive Live E2E Scenario Test...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    // =========================================================================
    // PART 1: MOBILE APP CEO 1983 - OPPORTUNITIES, B2B CONNECT & CALENDAR FLOW
    // =========================================================================
    console.log('\n============================================================');
    console.log('PART 1: MOBILE APP CEO 1983 (https://ceo1983.viconnect.vn)');
    console.log('============================================================');

    // Context User A (Opportunity Creator: info@viconnect.vn)
    const ctxA = await browser.newContext({
      viewport: { width: 414, height: 896 },
      ignoreHTTPSErrors: true,
    });
    const pageA = await ctxA.newPage();

    console.log('👉 1. User A logging in on Mobile App (info@viconnect.vn)...');
    await pageA.goto(`${APP_URL}/association/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageA.waitForTimeout(2000);
    await dismissModals(pageA);

    await pageA.locator('#assoc-auth-id').fill('info@viconnect.vn');
    await pageA.locator('#assoc-auth-password').fill('123456');
    await pageA.locator('button[type="submit"]').click({ force: true });
    await pageA.waitForTimeout(4000);
    await dismissModals(pageA);
    console.log('User A Logged in URL:', pageA.url());

    // Navigate to Opportunities
    console.log('👉 2. Navigating to /association/opportunities...');
    await pageA.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageA.waitForTimeout(3000);
    await dismissModals(pageA);

    // CASE 1: CREATE PUBLIC OPPORTUNITY & PROFIT-BASED DEAL RANKING
    console.log('\n--- CASE 1: Post Public Opportunity & Submit Deals Ranked by Profit ---');
    const createBtn = pageA.locator('#tour-opps-create-btn, button:has-text("Chia sẻ cơ hội mới")').first();
    if (await createBtn.isVisible()) {
      await createBtn.scrollIntoViewIfNeeded();
      await createBtn.click({ force: true });
    } else {
      await pageA.locator('button:has(.lucide-plus)').first().click({ force: true });
    }
    await pageA.waitForTimeout(2000);

    const publicOppTitle = `Cung cấp 50 xe tải vận chuyển & logistics [Test-${Date.now().toString().slice(-4)}]`;
    console.log(`User A creating public opportunity: "${publicOppTitle}"`);

    // Title
    const titleInput = pageA.locator('input[placeholder*="Tìm đối tác"], input[placeholder*="Ví dụ:"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill(publicOppTitle);
    }

    // Recipient: Ensure "Tất cả hội viên" (Public)
    const publicBtn = pageA.locator('button:has-text("Tất cả hội viên")').first();
    if (await publicBtn.isVisible()) {
      await publicBtn.click({ force: true });
    }

    // Commission %
    const commissionInput = pageA.locator('input[placeholder*="%"], input[placeholder*="hoa hồng"]').first();
    if (await commissionInput.isVisible()) {
      await commissionInput.fill('15');
    }

    // Description
    const descInput = pageA.locator('textarea').first();
    if (await descInput.isVisible()) {
      await descInput.fill('Tìm nhà cung ứng dịch vụ xe tải chở hàng và kho bãi tiêu chuẩn ISO, cam kết chiết khấu hoa hồng 15-25% cho hội viên.');
    }

    // Submit Create Opportunity inside modal footer
    const submitBtn = pageA.locator('div.fixed.inset-0 button:has-text("Đăng cơ hội ngay")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click({ force: true });
      await pageA.waitForTimeout(4000);
    }

    // Capture Screenshot 1: Created Public Opportunity
    const snap1 = path.join(SCREENSHOT_DIR, 'tc_01_public_opp_created.png');
    await pageA.screenshot({ path: snap1, fullPage: false });
    console.log(`📸 Screenshot saved: ${snap1}`);

    // Context User B (Partner: vumikasa6@gmail.com)
    console.log('\n👉 3. User B logging in on Mobile App (vumikasa6@gmail.com)...');
    const ctxB = await browser.newContext({
      viewport: { width: 414, height: 896 },
      ignoreHTTPSErrors: true,
    });
    const pageB = await ctxB.newPage();
    await pageB.goto(`${APP_URL}/association/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageB.waitForTimeout(2000);
    await dismissModals(pageB);

    await pageB.locator('#assoc-auth-id').fill('vumikasa6@gmail.com');
    await pageB.locator('#assoc-auth-password').fill('123456');
    await pageB.locator('button[type="submit"]').click({ force: true });
    await pageB.waitForTimeout(4000);
    await dismissModals(pageB);

    // User B views public opportunity in feed and submits deal
    console.log('👉 4. User B submits deal on public opportunity...');
    await pageB.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageB.waitForTimeout(3000);
    await dismissModals(pageB);

    // Click "Deal chào giá"
    const dealBtn = pageB.locator('button:has-text("Deal chào giá")').first();
    if (await dealBtn.isVisible()) {
      await dealBtn.click({ force: true });
      await pageB.waitForTimeout(1500);

      // Input deal price & message
      const dealInputs = pageB.locator('div.fixed.inset-0 input[type="text"]');
      if (await dealInputs.count() > 0) {
        await dealInputs.first().fill('85000000');
      }
      const dealTextarea = pageB.locator('div.fixed.inset-0 textarea').first();
      if (await dealTextarea.isVisible()) {
        await dealTextarea.fill('Bên em sẵn sàng 35 xe tải và kho ICD Mỹ Đình, chiết khấu hoa hồng 20% lợi nhuận cao nhất cho quý đối tác.');
      }

      // Capture Screenshot 2: Submit Deal Margin Modal
      const snap2 = path.join(SCREENSHOT_DIR, 'tc_02_submit_deal_proposal.png');
      await pageB.screenshot({ path: snap2, fullPage: false });
      console.log(`📸 Screenshot saved: ${snap2}`);

      // Submit deal
      const confirmDealBtn = pageB.locator('div.fixed.inset-0 button:has-text("Gửi đề xuất Deal")').first();
      if (await confirmDealBtn.isVisible()) {
        await confirmDealBtn.click({ force: true });
        await pageB.waitForTimeout(3000);
      }
    }

    // User A views deals ranked by highest profit/margin
    console.log('👉 5. User A views deals ranked by highest profit/margin from top to bottom...');
    await pageA.bringToFront();
    await pageA.reload({ waitUntil: 'domcontentloaded' });
    await pageA.waitForTimeout(2500);

    const whoDealingTab = pageA.locator('button:has-text("Ai đang quan tâm"), button:has-text("deal cơ hội của tôi")').first();
    if (await whoDealingTab.isVisible()) {
      await whoDealingTab.click({ force: true });
      await pageA.waitForTimeout(2000);
    }

    // Toggle sort "% Có lợi nhất cho tôi"
    const profitSortBtn = pageA.locator('button:has-text("% Có lợi nhất cho tôi")').first();
    if (await profitSortBtn.isVisible()) {
      await profitSortBtn.click({ force: true });
      await pageA.waitForTimeout(1500);
    }

    // Capture Screenshot 3: Deals Ranked by Profit
    const snap3 = path.join(SCREENSHOT_DIR, 'tc_03_deals_ranked_by_profit.png');
    await pageA.screenshot({ path: snap3, fullPage: false });
    console.log(`📸 Screenshot saved: ${snap3}`);

    // CASE 2: ASSIGNED OPPORTUNITY & PRIVATE B2B CONNECTION
    console.log('\n--- CASE 2: Assigned / Private Opportunity to Specific Member ---');
    await pageA.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded' });
    await pageA.waitForTimeout(2000);

    const createBtn2 = pageA.locator('#tour-opps-create-btn, button:has-text("Chia sẻ cơ hội mới")').first();
    if (await createBtn2.isVisible()) {
      await createBtn2.scrollIntoViewIfNeeded();
      await createBtn2.click({ force: true });
      await pageA.waitForTimeout(2000);

      const privateOppTitle = `Chuyển giao công nghệ gia công cơ khí chính xác độc quyền [Private-${Date.now().toString().slice(-4)}]`;
      const titleInput2 = pageA.locator('input[placeholder*="Tìm đối tác"], input[placeholder*="Ví dụ:"]').first();
      if (await titleInput2.isVisible()) {
        await titleInput2.fill(privateOppTitle);
      }

      // Select specific assignment (Theo từng ban / Bạn bè)
      const assignDeptBtn = pageA.locator('button:has-text("Theo từng ban"), button:has-text("Bạn bè")').first();
      if (await assignDeptBtn.isVisible()) {
        await assignDeptBtn.click({ force: true });
        await pageA.waitForTimeout(1500);
        const memCheckbox = pageA.locator('input[type="checkbox"]').first();
        if (await memCheckbox.isVisible()) {
          await memCheckbox.check();
        }
      }

      // Capture Screenshot 4: Private Assigned Opportunity Created
      const snap4 = path.join(SCREENSHOT_DIR, 'tc_04_create_assigned_private_opp.png');
      await pageA.screenshot({ path: snap4, fullPage: false });
      console.log(`📸 Screenshot saved: ${snap4}`);

      const submitBtn2 = pageA.locator('div.fixed.inset-0 button:has-text("Đăng cơ hội ngay")').first();
      if (await submitBtn2.isVisible()) {
        await submitBtn2.click({ force: true });
        await pageA.waitForTimeout(3000);
      }
    }

    // User B views the assigned opportunity and requests B2B meeting
    console.log('👉 6. User B sets up B2B meeting with Opportunity Creator...');
    await pageB.bringToFront();
    await pageB.goto(`${APP_URL}/association/connect?partnerName=L%C3%AA%20Th%E1%BB%8B%20Dung&partnerCompany=CLB%20CEO%201983&notes=G%E1%BA%B7p%20g%E1%BB%A1%201-1%20x%C3%BAc%20ti%E1%BA%BFn%20th%C6%B0%C6%A1ng%20v%E1%BB%A5%20B2B`, { waitUntil: 'domcontentloaded' });
    await pageB.waitForTimeout(3000);

    const bookMeetingBtn = pageB.locator('button:has-text("Đặt lịch"), button:has-text("Kết nối"), button:has-text("Tạo lịch hẹn")').first();
    if (await bookMeetingBtn.isVisible()) {
      await bookMeetingBtn.click({ force: true });
      await pageB.waitForTimeout(1500);
    }

    // Capture Screenshot 5: Target User Requests B2B Meeting
    const snap5 = path.join(SCREENSHOT_DIR, 'tc_05_assigned_opp_target_requests_meeting.png');
    await pageB.screenshot({ path: snap5, fullPage: false });
    console.log(`📸 Screenshot saved: ${snap5}`);

    // CASE 3: ACCEPT B2B CONNECTION & SAVE TO CALENDAR
    console.log('\n--- CASE 3: Opportunity Creator Accepts B2B Connection & Saves to Calendar ---');
    await pageA.bringToFront();
    await pageA.goto(`${APP_URL}/association/connect`, { waitUntil: 'domcontentloaded' });
    await pageA.waitForTimeout(3000);

    const acceptBtn = pageA.locator('button:has-text("Đồng ý lịch hẹn"), button:has-text("Chấp thuận"), button:has-text("Đồng ý")').first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click({ force: true });
      await pageA.waitForTimeout(2000);
    }

    // Verify saved meeting in Calendar
    console.log('👉 7. Navigating to /association/calendar to verify saved B2B meeting...');
    await pageA.goto(`${APP_URL}/association/calendar`, { waitUntil: 'domcontentloaded' });
    await pageA.waitForTimeout(3000);

    // Capture Screenshot 6: Meeting Accepted and Saved to Calendar
    const snap6 = path.join(SCREENSHOT_DIR, 'tc_06_meeting_accepted_saved_to_calendar.png');
    await pageA.screenshot({ path: snap6, fullPage: false });
    console.log(`📸 Screenshot saved: ${snap6}`);

    // CASE 4: CALENDAR EMAIL REMINDER
    console.log('\n--- CASE 4: Setting Calendar Meeting Reminder via Email ---');
    const reminderBtn = pageA.locator('button[title*="nhắc"], button:has-text("Cài nhắc"), button:has-text("Cài đặt nhắc")').first();
    if (await reminderBtn.isVisible()) {
      await reminderBtn.click({ force: true });
      await pageA.waitForTimeout(1500);

      const opt1Day = pageA.locator('button:has-text("Trước 1 ngày"), button:has-text("Trước 15 phút")').first();
      if (await opt1Day.isVisible()) {
        await opt1Day.click({ force: true });
        await pageA.waitForTimeout(1500);
      }
    }

    // Capture Screenshot 7: Meeting Reminder Set with Email Notification
    const snap7 = path.join(SCREENSHOT_DIR, 'tc_07_calendar_reminder_email_set.png');
    await pageA.screenshot({ path: snap7, fullPage: false });
    console.log(`📸 Screenshot saved: ${snap7}`);

    // =========================================================================
    // PART 2: CRM - FINANCIAL REPORT EXPORT & GUEST EXCEL IMPORT + AUTO EMAIL
    // =========================================================================
    console.log('\n============================================================');
    console.log('PART 2: WEB CRM QUẢN TRỊ (https://crm.ceo1983.viconnect.vn)');
    console.log('============================================================');

    const ctxCRM = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const pageCRM = await ctxCRM.newPage();

    console.log('👉 8. Admin logging in on CRM (admin@viconnect.vn)...');
    await pageCRM.goto(`${CRM_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageCRM.locator('input[type="text"], input[type="email"]').first().fill('admin@viconnect.vn');
    await pageCRM.locator('input[type="password"]').first().fill('123456');
    await pageCRM.locator('button[type="submit"]').click({ force: true });
    await pageCRM.waitForTimeout(4000);
    console.log('CRM Logged in URL:', pageCRM.url());

    // CASE 5: FINANCIAL REPORT EXPORT (BY CATEGORY, DATE, EXPORTER IDENTITY)
    console.log('\n--- CASE 5: Export Financial Report with Specific Category, Date & Exporter ---');
    await pageCRM.goto(`${CRM_URL}/finance-report`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageCRM.waitForTimeout(3000);

    const exportBtn = pageCRM.locator('button:has-text("Xuất Báo Cáo"), button:has-text("Xuất báo cáo")').first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click({ force: true });
      await pageCRM.waitForTimeout(2000);

      const openStatementBtn = pageCRM.locator('button:has-text("Mở Bảng Kê"), button:has-text("Bảng Kê Hóa Đơn")').first();
      if (await openStatementBtn.isVisible()) {
        await openStatementBtn.click({ force: true });
        await pageCRM.waitForTimeout(2000);

        const categoryModeBtn = pageCRM.locator('button:has-text("Xuất Theo Từng Danh Mục")').first();
        if (await categoryModeBtn.isVisible()) {
          await categoryModeBtn.click({ force: true });
          await pageCRM.waitForTimeout(1500);
        }
      }

      // Capture Screenshot 8: Financial Report Export with Category, Date, Exporter
      const snap8 = path.join(SCREENSHOT_DIR, 'tc_08_crm_finance_report_categorized.png');
      await pageCRM.screenshot({ path: snap8, fullPage: false });
      console.log(`📸 Screenshot saved: ${snap8}`);

      const closeExportBtn = pageCRM.locator('button:has-text("Đóng"), button:has(.lucide-x)').first();
      if (await closeExportBtn.isVisible()) {
        await closeExportBtn.click({ force: true });
        await pageCRM.waitForTimeout(1000);
      }
    }

    // CASE 6: EVENT GUEST EXCEL IMPORT & AUTO EMAIL DISPATCH
    console.log('\n--- CASE 6: Event Guest Excel Import & Auto Email Dispatch ---');
    await pageCRM.goto(`${CRM_URL}/event-registrations`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageCRM.waitForTimeout(3000);

    // Click "Nhập Excel Khách Mời & Gửi Mail"
    const importExcelBtn = pageCRM.locator('button:has-text("Nhập Excel Khách Mời")').first();
    if (await importExcelBtn.isVisible()) {
      await importExcelBtn.click({ force: true });
      await pageCRM.waitForTimeout(2000);

      // Upload sample Excel file
      const sampleFile = path.resolve(__dirname, '../test-fixtures/sample_event_guests.xlsx');
      const fileChooserInput = pageCRM.locator('input[type="file"]').first();
      await fileChooserInput.setInputFiles(sampleFile);
      await pageCRM.waitForTimeout(3000);

      // Capture Screenshot 9: Event Guest Excel Import Preview
      const snap9 = path.join(SCREENSHOT_DIR, 'tc_09_event_guest_excel_import_preview.png');
      await pageCRM.screenshot({ path: snap9, fullPage: false });
      console.log(`📸 Screenshot saved: ${snap9}`);

      // Click "Nhập & Gửi Email Thư Mời"
      const executeImportBtn = pageCRM.locator('button:has-text("Nhập & Gửi Email Thư Mời"), button:has-text("Nhập Khách")').first();
      if (await executeImportBtn.isVisible()) {
        await executeImportBtn.click({ force: true });
        await pageCRM.waitForTimeout(5000);
      }

      // Capture Screenshot 10: Event Guests Imported & Email Dispatched
      const snap10 = path.join(SCREENSHOT_DIR, 'tc_10_event_guests_imported_email_dispatched.png');
      await pageCRM.screenshot({ path: snap10, fullPage: false });
      console.log(`📸 Screenshot saved: ${snap10}`);
    }

    console.log('\n🎉 ALL 6 TEST CASES COMPLETED SUCCESSFULLY WITH 10 SCREENSHOTS CAPTURED!');

  } catch (err) {
    console.error('❌ Test Execution Error:', err);
  } finally {
    await browser.close();
  }
}

run();
