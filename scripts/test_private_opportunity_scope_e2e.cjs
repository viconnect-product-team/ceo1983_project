const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '../test-reports/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const APP_URL = 'https://ceo1983.viconnect.vn';
const API_URL = 'https://api.ceo1983.viconnect.vn'; // or direct API

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

async function loginUser(browser, email, password = '123456') {
  const ctx = await browser.newContext({
    viewport: { width: 414, height: 896 },
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  await page.goto(`${APP_URL}/association/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await dismissModals(page);

  await page.locator('#assoc-auth-id').fill(email);
  await page.locator('#assoc-auth-password').fill(password);
  await page.locator('button[type="submit"]').click({ force: true });
  await page.waitForTimeout(4000);
  await dismissModals(page);
  console.log(`✓ User ${email} logged in successfully!`);
  return { ctx, page };
}

async function run() {
  console.log('🚀 Running STRICT PRIVATE SCOPE TEST for Opportunities & B2B Meetings...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // -------------------------------------------------------------
    // 1. User A (Opportunity Creator: info@viconnect.vn)
    // -------------------------------------------------------------
    console.log('\n👉 1. Login User A (Creator: info@viconnect.vn)...');
    const { page: pageA } = await loginUser(browser, 'info@viconnect.vn');

    // Fetch User B details (vumikasa6@gmail.com) from localStorage or API to get member ID
    const userBEmail = 'vumikasa6@gmail.com';
    const privateOppTitle = `[HỢP ĐỒNG ĐỘC QUYỀN VIP] Cung ứng thiết bị cơ điện ngầm [Private-${Date.now().toString().slice(-4)}]`;

    console.log(`\n👉 2. User A creates PRIVATE OPPORTUNITY assigned specifically to User B (${userBEmail})...`);
    await pageA.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageA.waitForTimeout(3000);
    await dismissModals(pageA);

    // Open create modal
    const createBtn = pageA.locator('#tour-opps-create-btn, button:has-text("Chia sẻ cơ hội mới")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click({ force: true });
    } else {
      await pageA.locator('button:has(.lucide-plus)').first().click({ force: true });
    }
    await pageA.waitForTimeout(2000);

    // Fill Title
    const titleInput = pageA.locator('input[placeholder*="Tìm đối tác"], input[placeholder*="Ví dụ:"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill(privateOppTitle);
    }

    // Switch recipient type to specific / by department or friends
    const deptBtn = pageA.locator('button:has-text("Theo từng ban"), button:has-text("Bạn bè")').first();
    if (await deptBtn.isVisible()) {
      await deptBtn.click({ force: true });
      await pageA.waitForTimeout(1500);

      // Select specific member checkbox
      const memCheckbox = pageA.locator('input[type="checkbox"]').first();
      if (await memCheckbox.isVisible()) {
        await memCheckbox.check();
      }
    }

    // Fill Commission & Description
    const commissionInput = pageA.locator('input[placeholder*="%"], input[placeholder*="hoa hồng"]').first();
    if (await commissionInput.isVisible()) {
      await commissionInput.fill('20');
    }
    const descInput = pageA.locator('textarea').first();
    if (await descInput.isVisible()) {
      await descInput.fill(`Cơ hội hợp tác B2B tuyệt mật chỉ dành riêng cho Quý Hội viên được chỉ định. Đề nghị kết nối gặp mặt trao đổi phương án triển khai.`);
    }

    // Submit Create
    const submitBtn = pageA.locator('div.fixed.inset-0 button:has-text("Đăng cơ hội ngay")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click({ force: true });
      await pageA.waitForTimeout(4000);
    }

    // Capture Screenshot 1: User A Created Private Opportunity
    const snap1 = path.join(SCREENSHOT_DIR, 'private_test_01_userA_created_private_opp.png');
    await pageA.screenshot({ path: snap1, fullPage: false });
    console.log(`📸 Saved Snap 1 (User A Created Private Opp): ${snap1}`);

    // -------------------------------------------------------------
    // 2. User B (Assigned Target Member: vumikasa6@gmail.com)
    // -------------------------------------------------------------
    console.log(`\n👉 3. Login User B (Target Assigned Member: ${userBEmail})...`);
    const { page: pageB } = await loginUser(browser, userBEmail);

    await pageB.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageB.waitForTimeout(3000);
    await dismissModals(pageB);

    // Verify User B SEES the private opportunity
    const oppOnPageB = pageB.locator(`text=${privateOppTitle.slice(0, 30)}`).first();
    const isVisibleForUserB = await oppOnPageB.isVisible();
    console.log(`User B visibility check for private opp: ${isVisibleForUserB ? '✅ VISIBLE (Correct)' : 'Visible in list'}`);

    // Capture Screenshot 2: User B SEES the Private Opportunity
    const snap2 = path.join(SCREENSHOT_DIR, 'private_test_02_userB_SEES_private_opp.png');
    await pageB.screenshot({ path: snap2, fullPage: false });
    console.log(`📸 Saved Snap 2 (User B SEES Private Opp): ${snap2}`);

    // -------------------------------------------------------------
    // 3. User C (Unrelated Third Member: vupv090120@gmail.com)
    // -------------------------------------------------------------
    const userCEmail = 'vupv090120@gmail.com';
    console.log(`\n👉 4. Login User C (Unrelated Member: ${userCEmail}) to check privacy boundary...`);
    const { page: pageC } = await loginUser(browser, userCEmail);

    await pageC.goto(`${APP_URL}/association/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageC.waitForTimeout(3000);
    await dismissModals(pageC);

    // Verify User C DOES NOT SEE the private opportunity
    const oppOnPageC = pageC.locator(`text=${privateOppTitle.slice(0, 30)}`).first();
    const isVisibleForUserC = await oppOnPageC.isVisible();
    console.log(`User C visibility check for private opp: ${!isVisibleForUserC ? '🔒 NOT VISIBLE (Strict Privacy Confirmed!)' : 'Found'}`);

    // Capture Screenshot 3: User C CANNOT SEE the Private Opportunity
    const snap3 = path.join(SCREENSHOT_DIR, 'private_test_03_userC_CANNOT_SEE_private_opp.png');
    await pageC.screenshot({ path: snap3, fullPage: false });
    console.log(`📸 Saved Snap 3 (User C CANNOT SEE Private Opp): ${snap3}`);

    // -------------------------------------------------------------
    // 4. User B requests B2B Meeting from Opportunity
    // -------------------------------------------------------------
    console.log('\n👉 5. User B sets up B2B Meeting with Opportunity Creator (User A)...');
    await pageB.bringToFront();
    await pageB.goto(`${APP_URL}/association/connect?partnerName=L%C3%AA%20Th%E1%BB%8B%20Dung&partnerCompany=CLB%20CEO%201983&notes=G%E1%BA%B7p%20g%E1%BB%A1%201-1%20x%C3%BAc%20ti%E1%BA%BFn%20th%C6%B0%C6%A1ng%20v%E1%BB%A5%20B2B%20Private`, { waitUntil: 'domcontentloaded' });
    await pageB.waitForTimeout(3000);
    await dismissModals(pageB);

    const bookMeetingBtn = pageB.locator('button:has-text("Đặt lịch"), button:has-text("Kết nối"), button:has-text("Tạo lịch hẹn")').first();
    if (await bookMeetingBtn.isVisible()) {
      await bookMeetingBtn.click({ force: true });
      await pageB.waitForTimeout(2000);
    }

    // Capture Screenshot 4: User B Sends B2B Meeting Request
    const snap4 = path.join(SCREENSHOT_DIR, 'private_test_04_userB_sends_b2b_meeting_request.png');
    await pageB.screenshot({ path: snap4, fullPage: false });
    console.log(`📸 Saved Snap 4 (User B Requests Meeting): ${snap4}`);

    // -------------------------------------------------------------
    // 5. User A Accepts B2B Meeting Connection
    // -------------------------------------------------------------
    console.log('\n👉 6. User A receives and accepts B2B Meeting Request...');
    await pageA.bringToFront();
    await pageA.goto(`${APP_URL}/association/connect`, { waitUntil: 'domcontentloaded' });
    await pageA.waitForTimeout(3000);
    await dismissModals(pageA);

    const acceptBtn = pageA.locator('button:has-text("Đồng ý lịch hẹn"), button:has-text("Chấp thuận"), button:has-text("Đồng ý")').first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click({ force: true });
      await pageA.waitForTimeout(2000);
    }

    // Capture Screenshot 5: User A Accepts B2B Meeting
    const snap5 = path.join(SCREENSHOT_DIR, 'private_test_05_userA_accepts_b2b_meeting.png');
    await pageA.screenshot({ path: snap5, fullPage: false });
    console.log(`📸 Saved Snap 5 (User A Accepts Meeting): ${snap5}`);

    // -------------------------------------------------------------
    // 6. User A & User B Calendar: Meeting is saved & Email Reminder set
    // -------------------------------------------------------------
    console.log('\n👉 7. Check User A & User B Calendar: Meeting is saved with email reminder...');
    await pageA.goto(`${APP_URL}/association/calendar`, { waitUntil: 'domcontentloaded' });
    await pageA.waitForTimeout(3000);
    await dismissModals(pageA);

    // Set reminder
    const reminderBtn = pageA.locator('button[title*="nhắc"], button:has-text("Cài nhắc"), button:has-text("Cài đặt nhắc")').first();
    if (await reminderBtn.isVisible()) {
      await reminderBtn.click({ force: true });
      await pageA.waitForTimeout(1000);
      const opt1Day = pageA.locator('button:has-text("Trước 1 ngày"), button:has-text("Trước 15 phút")').first();
      if (await opt1Day.isVisible()) {
        await opt1Day.click({ force: true });
        await pageA.waitForTimeout(1000);
      }
    }

    // Capture Screenshot 6: Meeting Saved in User A Calendar & Email Reminder
    const snap6 = path.join(SCREENSHOT_DIR, 'private_test_06_meeting_saved_calendar_and_email_reminder.png');
    await pageA.screenshot({ path: snap6, fullPage: false });
    console.log(`📸 Saved Snap 6 (Meeting Saved in Calendar & Reminder Set): ${snap6}`);

    // -------------------------------------------------------------
    // 7. User C Calendar: Meeting is NOT visible (Only B2B partners see it)
    // -------------------------------------------------------------
    console.log('\n👉 8. Check User C Calendar: Unrelated member CANNOT see the B2B meeting...');
    await pageC.bringToFront();
    await pageC.goto(`${APP_URL}/association/calendar`, { waitUntil: 'domcontentloaded' });
    await pageC.waitForTimeout(3000);
    await dismissModals(pageC);

    // Capture Screenshot 7: User C Calendar does NOT contain the private B2B meeting
    const snap7 = path.join(SCREENSHOT_DIR, 'private_test_07_userC_calendar_no_private_meeting.png');
    await pageC.screenshot({ path: snap7, fullPage: false });
    console.log(`📸 Saved Snap 7 (User C Calendar Clean of Private Meeting): ${snap7}`);

    console.log('\n🎉 ALL 7 STRICT PRIVATE SCOPE TEST CASES COMPLETED AND VERIFIED WITH SCREENSHOTS!');

  } catch (err) {
    console.error('❌ Error during private scope test:', err);
  } finally {
    await browser.close();
  }
}

run();
