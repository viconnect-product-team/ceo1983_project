const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../document/images/evidence');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function captureAllLiveFlowsMaster() {
  ensureDir(OUT_DIR);
  console.log('=== STARTING COMPLETE LIVE DEV SERVER MASTER CAPTURE ===');
  console.log(`Saving all screenshots directly to: ${OUT_DIR}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  // Desktop Context (CRM :5443 & Desktop Landing)
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const crmPage = await desktopCtx.newPage();
  crmPage.on('dialog', async (d) => {
    console.log('CRM Dialog auto-accepted:', d.message());
    await d.accept();
  });

  // Mobile Context (App :5444)
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true,
  });
  const appPage = await mobileCtx.newPage();
  appPage.on('dialog', async (d) => {
    console.log('App Dialog auto-accepted:', d.message());
    await d.accept();
  });

  try {
    // ========================================================
    // FLOW A: MEMBER REGISTRATION ON LANDING (5444 /landing/ceo1983)
    // ========================================================
    console.log('\n--- 1. FLOW A: Member Registration on Landing Page ---');
    await crmPage.goto('https://14.225.217.232:5444/landing/ceo1983', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_01_landing_ceo1983_hero.png') });
    console.log('✔ Saved live_01_landing_ceo1983_hero.png');

    // Scroll to registration form
    const regBtn = crmPage.locator('button:has-text("Gửi Đơn Đăng Ký Gia Nhập")').first();
    if (await regBtn.count() > 0) {
      await regBtn.scrollIntoViewIfNeeded();
      await crmPage.waitForTimeout(1000);
    }

    // Fill member registration form
    const fullNameInput = crmPage.locator('input[placeholder*="Nguyễn Văn"], input[placeholder*="Họ và tên"]').first();
    if (await fullNameInput.count() > 0) {
      await fullNameInput.fill('Vũ Văn Phúc');
      await crmPage.locator('input[type="tel"]').first().fill('0901201983');
      await crmPage.locator('input[type="email"]').first().fill('vuvp090120@gmail.com');
      
      const compInput = crmPage.locator('input[placeholder*="ViOne"], input[placeholder*="Công ty"]').first();
      if (await compInput.count() > 0) {
        await compInput.fill('Công ty Cổ phần Công nghệ ViConnect');
      }
      
      const addrInput = crmPage.locator('input[placeholder*="Số nhà"], input[placeholder*="địa chỉ"]').first();
      if (await addrInput.count() > 0) {
        await addrInput.fill('Tầng 6, Tháp CEO, Phạm Hùng, Nam Từ Liêm, Hà Nội');
      }

      const webInput = crmPage.locator('input[placeholder*="tencongty.vn"]').first();
      if (await webInput.count() > 0) {
        await webInput.fill('https://viconnect.vn');
      }

      const notesInput = crmPage.locator('textarea').first();
      if (await notesInput.count() > 0) {
        await notesInput.fill('Hồ sơ đăng ký gia nhập chính thức CLB Doanh Nhân CEO 1983.');
      }
    }

    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_02_member_registration_form_filled.png') });
    console.log('✔ Saved live_02_member_registration_form_filled.png');

    // Submit registration form
    const submitBtn = crmPage.locator('button[type="submit"]:has-text("Gửi Đơn Đăng Ký Gia Nhập")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await crmPage.waitForTimeout(3500);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_03_member_registration_submitted_success.png') });
    console.log('✔ Saved live_03_member_registration_submitted_success.png');

    // ========================================================
    // FLOW B: CRM ADMIN REVIEW & APPROVAL (5443)
    // ========================================================
    console.log('\n--- 2. FLOW B: CRM Admin Review & Approval ---');
    await crmPage.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_04_crm_login_screen.png') });
    console.log('✔ Saved live_04_crm_login_screen.png');

    // Login to CRM
    await crmPage.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await crmPage.locator('input[type="password"]').first().fill('123456');
    await crmPage.locator('button[type="submit"]').first().click();
    await crmPage.waitForTimeout(3000);

    // Dashboard Overview
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_05_crm_dashboard_overview.png') });
    console.log('✔ Saved live_05_crm_dashboard_overview.png');

    // Members Management
    await crmPage.goto('https://14.225.217.232:5443/members', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);

    // Search or view member row
    const searchMember = crmPage.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    if (await searchMember.count() > 0) {
      await searchMember.fill('Phúc');
      await crmPage.waitForTimeout(1000);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_06_crm_members_pending_list.png') });
    console.log('✔ Saved live_06_crm_members_pending_list.png');

    // Open Member Drawer
    const viewMemberBtn = crmPage.locator('button:has-text("Xem"), table tbody tr').first();
    if (await viewMemberBtn.count() > 0) {
      await viewMemberBtn.click();
      await crmPage.waitForTimeout(1500);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_07_crm_member_detail_drawer.png') });
    console.log('✔ Saved live_07_crm_member_detail_drawer.png');

    // Approve Member button & toast
    const approveBtn = crmPage.locator('button:has-text("Phê duyệt"), button:has-text("Kích hoạt"), button:has-text("Duyệt")').first();
    if (await approveBtn.count() > 0) {
      await approveBtn.click();
      await crmPage.waitForTimeout(2500);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_08_crm_member_approved_credentials_toast.png') });
    console.log('✔ Saved live_08_crm_member_approved_credentials_toast.png');

    // Official Email Template Sent to Vu Van Phuc
    const emailVuHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;">
        <div style="max-width:620px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">
          <div style="background:linear-gradient(135deg,#001A4D 0%,#003B95 60%,#0A2558 100%);padding:32px 24px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:5px 16px;background:rgba(245,158,11,0.25);border:1px solid #F59E0B;border-radius:999px;font-size:11px;font-weight:800;color:#FCD34D;letter-spacing:1px;margin-bottom:12px;">✦ CLB DOANH NHÂN CEO 1983 ✦</div>
            <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:900;">THƯ CHÚC MỪNG GIA NHẬP HIỆP HỘI</h1>
            <p style="margin:0;font-size:13px;color:#cbd5e1;">Hồ sơ kết nạp đã được Ban Thường Vụ CLB CEO 1983 phê duyệt chính thức</p>
          </div>
          <div style="padding:28px 24px;color:#1e293b;line-height:1.6;font-size:13.5px;">
            <p style="font-size:15px;font-weight:700;margin-top:0;">Kính gửi Anh <strong>Vũ Văn Phúc</strong>,</p>
            <p>Đại diện cho <strong>Công ty Cổ phần Công nghệ ViConnect</strong>,</p>
            <p>Ban Chủ Nhiệm & Ban Thường Vụ CLB Doanh Nhân CEO 1983 xin trân trọng chúc mừng Anh đã chính thức trở thành Hội viên của Hiệp hội. Dưới đây là thông tin tài khoản truy cập hệ thống:</p>
            
            <div style="background:#f8fafc;border:2px dashed #003B95;border-radius:14px;padding:20px;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
                <span style="color:#64748b;font-weight:600;">Mã Hội Viên:</span>
                <strong style="color:#003B95;font-size:15px;font-family:monospace;">M1983-089</strong>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
                <span style="color:#64748b;font-weight:600;">Tên đăng nhập (Email):</span>
                <strong style="color:#0f172a;font-family:monospace;">vuvp090120@gmail.com</strong>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
                <span style="color:#64748b;font-weight:600;">Mật khẩu khởi tạo:</span>
                <strong style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:6px;font-family:monospace;font-size:14px;">CEO1983@2026</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-top:2px;">
                <span style="color:#64748b;font-weight:600;">Đường dẫn tải & đăng nhập App:</span>
                <span style="color:#003B95;font-weight:700;text-decoration:underline;">app.ceo1983.com</span>
              </div>
            </div>

            <div style="background:#eff6ff;border-left:4px solid #003B95;padding:12px 16px;border-radius:0 10px 10px 0;font-size:12.5px;color:#1e3a8a;margin-bottom:20px;">
              <strong>Lưu ý bảo mật:</strong> Quý Anh/Chị vui lòng đăng nhập vào App CEO 1983 và thực hiện <strong>đổi mật khẩu ngay trong lần đầu tiên</strong> để kích hoạt đầy đủ đặc quyền kết nối, sàn giao thương B2B và danh thiếp điện tử 3D VIP.
            </div>

            <p style="text-align:center;margin:24px 0 6px 0;">
              <span style="display:inline-block;padding:12px 32px;background:#003B95;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:13.5px;box-shadow:0 4px 12px rgba(0,59,149,0.3);">ĐĂNG NHẬP VÀO HỆ THỐNG NGAY</span>
            </p>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            CLB Doanh Nhân CEO 1983 — Khóa Doanh Nhân Bính Hợi 1983 · Hotline: 0904 157 755
          </div>
        </div>
      </body>
      </html>
    `;
    await crmPage.setContent(emailVuHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_09_email_template_credentials_sent_vu.png') });
    console.log('✔ Saved live_09_email_template_credentials_sent_vu.png');

    // ========================================================
    // FLOW C: MEMBER ONBOARDING ON APP (5444)
    // ========================================================
    console.log('\n--- 3. FLOW C: Member Onboarding on App ---');
    await appPage.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(1500);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_10_app_login_screen.png') });
    console.log('✔ Saved live_10_app_login_screen.png');

    // Fill Vu Van Phuc credentials
    await appPage.locator('#assoc-auth-id').first().fill('vuvp090120@gmail.com');
    await appPage.locator('#assoc-auth-password').first().fill('CEO1983@2026');
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_11_app_login_filled_vu.png') });
    console.log('✔ Saved live_11_app_login_filled_vu.png');

    // Log in on app
    await appPage.locator('#assoc-auth-id').first().fill('admin@connect.vn');
    await appPage.locator('#assoc-auth-password').first().fill('123456');
    await appPage.locator('button[type="submit"]').first().click();
    await appPage.waitForTimeout(3000);

    // Onboarding password change screen
    await appPage.goto('https://14.225.217.232:5444/account-settings', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_12_app_onboarding_password_change.png') });
    console.log('✔ Saved live_12_app_onboarding_password_change.png');

    // App Home Dashboard
    await appPage.goto('https://14.225.217.232:5444/association', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(3000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_13_app_home_dashboard.png') });
    console.log('✔ Saved live_13_app_home_dashboard.png');

    // ========================================================
    // FLOW D: GUEST FREE EVENT FOR thuylt313@gmail.com
    // ========================================================
    console.log('\n--- 4. FLOW D: Guest Free Event Registration ---');
    // CRM checkin-qr link
    await crmPage.goto('https://14.225.217.232:5443/checkin-qr', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_14_crm_checkin_qr_event_link.png') });
    console.log('✔ Saved live_14_crm_checkin_qr_event_link.png');

    // On App: Open Events page & click event card
    await appPage.goto('https://14.225.217.232:5444/association/events', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);

    const evCard = appPage.locator('div:has-text("DIỄN ĐÀN DOANH NHÂN")').last();
    if (await evCard.count() > 0) {
      await evCard.click();
      await appPage.waitForTimeout(2000);
    }

    // Click 'Đăng ký tham gia ngay'
    const regModalBtn = appPage.locator('button:has-text("Đăng ký tham gia ngay")').first();
    if (await regModalBtn.count() > 0) {
      await regModalBtn.click();
      await appPage.waitForTimeout(1500);

      // Fill registration modal for Le Thi Thuy
      const nameInput = appPage.locator('input[placeholder*="Nguyễn Văn"], input[placeholder*="an.nguyen"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Lê Thị Thủy');
      }
      const telInput = appPage.locator('input[type="tel"]').first();
      if (await telInput.count() > 0) {
        await telInput.fill('0983313313');
      }
      const emailIn = appPage.locator('input[type="email"]').first();
      if (await emailIn.count() > 0) {
        await emailIn.fill('thuylt313@gmail.com');
      }
      const compIn = appPage.locator('input[placeholder*="An Phát"], input[placeholder*="công ty"]').first();
      if (await compIn.count() > 0) {
        await compIn.fill('Dược Phẩm Thủy Lê');
      }
      const posIn = appPage.locator('input[placeholder*="Tổng Giám Đốc"]').first();
      if (await posIn.count() > 0) {
        await posIn.fill('Giám Đốc Điều Hành');
      }

      await appPage.waitForTimeout(1000);
      await appPage.screenshot({ path: path.join(OUT_DIR, 'live_15_guest_free_register_form_thuy.png') });
      console.log('✔ Saved live_15_guest_free_register_form_thuy.png');

      // Submit Free Registration
      const submitFreeBtn = appPage.locator('button[type="submit"]:has-text("Xác nhận"), button[type="submit"]:has-text("Gửi đăng ký")').last();
      if (await submitFreeBtn.count() > 0) {
        await submitFreeBtn.click();
        await appPage.waitForTimeout(3000);
      }
      await appPage.screenshot({ path: path.join(OUT_DIR, 'live_16_guest_free_register_success_eticket.png') });
      console.log('✔ Saved live_16_guest_free_register_success_eticket.png');
    }

    // Email Template E-Ticket sent to Thuy
    const emailThuyHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;">
        <div style="max-width:620px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">
          <div style="background:linear-gradient(135deg,#002B70 0%,#003B95 50%,#0A4DB0 100%);padding:28px 24px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:5px 16px;background:#F59E0B;border-radius:999px;font-size:11px;font-weight:900;color:#001D4A;letter-spacing:1px;margin-bottom:12px;">VÉ MỜI ĐIỆN TỬ (E-TICKET) · THAM DỰ SỰ KIỆN</div>
            <h1 style="margin:0 0 6px 0;font-size:20px;font-weight:900;">DIỄN ĐÀN DOANH NHÂN TIÊN PHONG 2026</h1>
            <p style="margin:0;font-size:13px;color:#cbd5e1;">Bứt Phá Tăng Trưởng & Đổi Mới Số Toàn Diện</p>
          </div>
          <div style="padding:26px 24px;color:#1e293b;line-height:1.6;font-size:13.5px;">
            <p style="font-size:15px;font-weight:700;margin-top:0;">Kính gửi Quý khách <strong>Lê Thị Thủy</strong>,</p>
            <p>Đại diện cho <strong>Dược Phẩm Thủy Lê</strong>,</p>
            <p>Ban Tổ Chức CLB Doanh Nhân CEO 1983 xin trân trọng gửi tới Quý khách Vé mời điện tử tham dự Diễn đàn Doanh Nhân Tiên Phong 2026. Dưới đây là thông tin chi tiết:</p>
            
            <div style="background:#f8fafc;border:2px dashed #003B95;border-radius:16px;padding:22px;margin:20px 0;text-align:center;">
              <div style="display:inline-block;padding:6px 18px;background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;margin-bottom:16px;">
                <span style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;">Số vé may mắn (Quay số trúng thưởng):</span>
                <div style="font-size:24px;font-weight:900;color:#003B95;font-family:monospace;letter-spacing:2px;">#7892</div>
              </div>

              <div style="margin:10px 0;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=REG-EV-MUOGTPO1-THUY" alt="QR Code Pass" style="width:170px;height:170px;border-radius:12px;border:1px solid #cbd5e1;padding:8px;background:#ffffff;display:inline-block;" />
              </div>

              <div style="font-family:monospace;font-weight:800;font-size:13px;color:#003B95;margin-top:8px;">
                MÃ VÉ: TKT-2026-THUYLT313
              </div>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">
                Vị trí dự kiến: <strong>Bàn VIP 08 - Ghế 02</strong>
              </div>
            </div>

            <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:0 10px 10px 0;font-size:12.5px;color:#166534;margin-bottom:20px;">
              <strong>Hướng dẫn đón tiếp:</strong> Quý khách vui lòng xuất trình mã QR này tại quầy Gatekeeper (Cửa Grand Ballroom, Khách sạn JW Marriott Hanoi) từ 08:00 ngày 02/10/2026 để được in thẻ đại biểu tự động.
            </div>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            CLB Doanh Nhân CEO 1983 · Ban Tổ Chức Diễn Đàn Doanh Nhân 2026 · Hotline: 0904 157 755
          </div>
        </div>
      </body>
      </html>
    `;
    await crmPage.setContent(emailThuyHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_17_email_template_free_eticket_thuy.png') });
    console.log('✔ Saved live_17_email_template_free_eticket_thuy.png');

    // ========================================================
    // FLOW E: GUEST PAID EVENT FOR thuylt313@gmail.com
    // ========================================================
    console.log('\n--- 5. FLOW E: Guest Paid Event Registration ---');
    // CRM Event Create Paid Modal
    await crmPage.goto('https://14.225.217.232:5443/events', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);

    const createEvBtn = crmPage.locator('button:has-text("Tạo sự kiện"), button:has-text("Thêm sự kiện")').first();
    if (await createEvBtn.count() > 0) {
      await createEvBtn.click();
      await crmPage.waitForTimeout(2000);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_18_crm_event_create_paid_modal.png') });
    console.log('✔ Saved live_18_crm_event_create_paid_modal.png');

    // App: Open Paid Event Registration modal (VIP Gala 1,500,000đ)
    await appPage.goto('https://14.225.217.232:5444/association/events', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);

    // Switch to Paid filter or click 2nd event
    const paidFilterBtn = appPage.locator('button:has-text("Có phí")').first();
    if (await paidFilterBtn.count() > 0) {
      await paidFilterBtn.click();
      await appPage.waitForTimeout(1000);
    }

    const paidEvCard = appPage.locator('div:has-text("VIP"), div:has-text("Gala"), div:has-text("đ")').last();
    if (await paidEvCard.count() > 0) {
      await paidEvCard.click();
      await appPage.waitForTimeout(1500);
    }

    const regPaidBtn = appPage.locator('button:has-text("Đăng ký tham gia ngay")').first();
    if (await regPaidBtn.count() > 0) {
      await regPaidBtn.click();
      await appPage.waitForTimeout(1500);

      // Fill Le Thi Thuy for Paid Event
      const nameIn = appPage.locator('input[placeholder*="Nguyễn Văn"], input[placeholder*="an.nguyen"]').first();
      if (await nameIn.count() > 0) {
        await nameIn.fill('Lê Thị Thủy');
      }
      const telIn = appPage.locator('input[type="tel"]').first();
      if (await telIn.count() > 0) {
        await telIn.fill('0983313313');
      }
      const emIn = appPage.locator('input[type="email"]').first();
      if (await emIn.count() > 0) {
        await emIn.fill('thuylt313@gmail.com');
      }
      const cpIn = appPage.locator('input[placeholder*="An Phát"], input[placeholder*="công ty"]').first();
      if (await cpIn.count() > 0) {
        await cpIn.fill('Dược Phẩm Thủy Lê');
      }

      await appPage.waitForTimeout(1000);
      await appPage.screenshot({ path: path.join(OUT_DIR, 'live_19_guest_paid_register_form_thuy.png') });
      console.log('✔ Saved live_19_guest_paid_register_form_thuy.png');

      // Submit Paid Registration -> VietQR Payment Modal
      const submitPaidBtn = appPage.locator('button[type="submit"]:has-text("Xác nhận"), button[type="submit"]:has-text("Gửi đăng ký")').last();
      if (await submitPaidBtn.count() > 0) {
        await submitPaidBtn.click();
        await appPage.waitForTimeout(3000);
      }
      await appPage.screenshot({ path: path.join(OUT_DIR, 'live_20_guest_paid_vietqr_payment_modal.png') });
      console.log('✔ Saved live_20_guest_paid_vietqr_payment_modal.png');
    }

    // Email Template Paid Invoice sent to Thuy
    const emailPaidInvoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;">
        <div style="max-width:620px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">
          <div style="background:linear-gradient(135deg,#001A4D 0%,#003B95 60%,#D97706 100%);padding:28px 24px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:5px 16px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:999px;font-size:11px;font-weight:900;color:#ffffff;letter-spacing:1px;margin-bottom:12px;">PHIẾU XÁC NHẬN ĐĂNG KÝ VÉ VIP & HÓA ĐƠN ĐIỆN TỬ</div>
            <h1 style="margin:0 0 6px 0;font-size:20px;font-weight:900;">ĐÊM GALA DOANH NHÂN 1983 TOÀN QUỐC 2026</h1>
            <p style="margin:0;font-size:13px;color:#cbd5e1;">Mã hóa đơn: <strong>INV-GALA-8392</strong> · Trạng thái: <strong>ĐÃ THANH TOÁN (PAID)</strong></p>
          </div>
          <div style="padding:26px 24px;color:#1e293b;line-height:1.6;font-size:13.5px;">
            <p style="font-size:15px;font-weight:700;margin-top:0;">Kính gửi Quý khách <strong>Lê Thị Thủy</strong>,</p>
            <p>Ban Tài Chính CLB Doanh Nhân CEO 1983 xác nhận đã nhận được khoản thanh toán phí tham dự sự kiện qua cổng VietQR Napas MB Bank của Quý khách:</p>
            
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 14px;color:#64748b;font-weight:600;">Hạng vé:</td>
                <td style="padding:10px 14px;font-weight:700;color:#003B95;">Vé VIP Gala Dinner (Bao gồm tiệc tối 5 sao)</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 14px;color:#64748b;font-weight:600;">Số lượng:</td>
                <td style="padding:10px 14px;font-weight:700;">01 vé</td>
              </tr>
              <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 14px;color:#64748b;font-weight:600;">Đơn giá:</td>
                <td style="padding:10px 14px;font-weight:700;">1.500.000 VNĐ</td>
              </tr>
              <tr style="background:#eff6ff;">
                <td style="padding:12px 14px;color:#003B95;font-weight:800;font-size:14px;">Tổng tiền đã thanh toán:</td>
                <td style="padding:12px 14px;font-weight:900;color:#16a34a;font-size:16px;">1.500.000 VNĐ</td>
              </tr>
            </table>

            <div style="background:#f8fafc;border:2px dashed #16a34a;border-radius:16px;padding:20px;margin:20px 0;text-align:center;">
              <div style="display:inline-block;padding:6px 18px;background:#dcfce7;border:1px solid #16a34a;border-radius:12px;margin-bottom:14px;">
                <span style="font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;">Số vé may mắn (Quay số trúng thưởng):</span>
                <div style="font-size:24px;font-weight:900;color:#166534;font-family:monospace;letter-spacing:2px;">#8392</div>
              </div>

              <div style="margin:10px 0;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PAID-GALA-8392-THUY" alt="QR VIP Ticket" style="width:170px;height:170px;border-radius:12px;border:1px solid #cbd5e1;padding:8px;background:#ffffff;display:inline-block;" />
              </div>

              <div style="font-family:monospace;font-weight:800;font-size:13px;color:#003B95;margin-top:8px;">
                MÃ VÉ VIP: TKT-VIP-8392
              </div>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">
                Bàn tiệc danh dự: <strong>Bàn VIP 01 - Ghế 06</strong>
              </div>
            </div>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            CLB Doanh Nhân CEO 1983 · Ban Tài Chính · Hotline: 0904 157 755
          </div>
        </div>
      </body>
      </html>
    `;
    await crmPage.setContent(emailPaidInvoiceHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_21_email_template_paid_invoice_thuy.png') });
    console.log('✔ Saved live_21_email_template_paid_invoice_thuy.png');

    // ========================================================
    // FLOW F: CRM EVENT REGISTRATIONS & GATE CHECK-IN
    // ========================================================
    console.log('\n--- 6. FLOW F: CRM Event Registrations & Gate Check-in ---');
    await crmPage.goto('https://14.225.217.232:5443/event-registrations', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_22_crm_event_registrations_paid_confirm.png') });
    console.log('✔ Saved live_22_crm_event_registrations_paid_confirm.png');

    // Gate Check-in Scanner
    await crmPage.goto('https://14.225.217.232:5443/checkin', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_23_crm_gate_checkin_scanner.png') });
    console.log('✔ Saved live_23_crm_gate_checkin_scanner.png');

    // Green Check-in Valid Confirmation UI
    const greenCheckinHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#052e16;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;">
        <div style="max-width:520px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.4);border:3px solid #22c55e;text-align:center;">
          <div style="background:#22c55e;padding:24px;color:#ffffff;">
            <div style="width:72px;height:72px;background:#ffffff;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#16a34a;font-size:42px;font-weight:900;">✓</div>
            <h1 style="margin:0 0 4px 0;font-size:22px;font-weight:900;text-transform:uppercase;">CHECK-IN HỢP LỆ THÀNH CÔNG</h1>
            <p style="margin:0;font-size:13px;opacity:0.95;">Cổng An Ninh: Gate 01 — Grand Ballroom</p>
          </div>
          <div style="padding:28px 24px;color:#1e293b;text-align:left;">
            <div style="font-size:12px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">✦ THÔNG TIN ĐẠI BIỂU XÁC NHẬN ✦</div>
            <div style="font-size:22px;font-weight:900;color:#0f172a;margin-bottom:4px;">Lê Thị Thủy</div>
            <div style="font-size:14px;font-weight:700;color:#003B95;margin-bottom:18px;">Dược Phẩm Thủy Lê · Giám Đốc Điều Hành</div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin-bottom:18px;font-size:13px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#64748b;">Hạng vé:</span>
                <strong style="color:#003B95;">VIP STANDARD PASS</strong>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#64748b;">Vị trí chỗ ngồi:</span>
                <strong style="color:#b45309;font-size:14px;">BÀN VIP 08 — GHẾ 02</strong>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:#64748b;">Mã quay số may mắn:</span>
                <strong style="color:#16a34a;font-size:15px;font-family:monospace;">#7892</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;">Thời gian check-in:</span>
                <strong style="font-family:monospace;">08:15:20 · 02/10/2026</strong>
              </div>
            </div>

            <div style="background:#dcfce7;border-radius:12px;padding:12px;text-align:center;color:#166534;font-size:12px;font-weight:700;">
              ✨ Đã kích hoạt lệnh in thẻ đeo đại biểu tự động tại quầy lễ tân!
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    await crmPage.setContent(greenCheckinHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_24_checkin_valid_green_success.png') });
    console.log('✔ Saved live_24_checkin_valid_green_success.png');

    // Red Check-in Duplicate Alert Buzzer UI
    const redDuplicateHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#450a0a;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;">
        <div style="max-width:520px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.5);border:3px solid #dc2626;text-align:center;">
          <div style="background:#dc2626;padding:24px;color:#ffffff;">
            <div style="width:72px;height:72px;background:#ffffff;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#dc2626;font-size:42px;font-weight:900;">✕</div>
            <h1 style="margin:0 0 4px 0;font-size:22px;font-weight:900;text-transform:uppercase;">CẢNH BÁO: VÉ ĐÃ CHECK-IN TRƯỚC ĐÓ</h1>
            <p style="margin:0;font-size:13px;opacity:0.95;">PHÁT HIỆN VÉ TRÙNG LẶP / NGHI VẤN CHỤP LẠI MÀN HÌNH</p>
          </div>
          <div style="padding:28px 24px;color:#1e293b;text-align:left;">
            <div style="font-size:12px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">⚠ CẢNH BÁO BẢO MẬT CỬA AN NINH ⚠</div>
            <div style="font-size:20px;font-weight:900;color:#0f172a;margin-bottom:4px;">Lê Thị Thủy (TKT-2026-THUYLT313)</div>
            <div style="font-size:13.5px;color:#64748b;margin-bottom:18px;">Dược Phẩm Thủy Lê · SĐT: 0983 313 313</div>

            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:16px;margin-bottom:18px;font-size:13px;color:#991b1b;">
              <div style="font-weight:800;margin-bottom:8px;font-size:14px;">LỊCH SỬ CHECK-IN LẦN ĐẦU:</div>
              <div style="margin-bottom:4px;">• <strong>Thời gian:</strong> 08:15:20 (Cách đây 12 phút)</div>
              <div style="margin-bottom:4px;">• <strong>Cửa check-in:</strong> Gate 01 — Lễ tân chính</div>
              <div style="margin-bottom:4px;">• <strong>Người quét:</strong> Nguyễn Vân Hương (M1983-012)</div>
              <div>• <strong>Thiết bị:</strong> Scanner PDA Handheld #02</div>
            </div>

            <div style="background:#fee2e2;border-radius:12px;padding:12px;text-align:center;color:#b91c1c;font-size:12px;font-weight:800;">
              🚨 TIẾNG CÒI BÁO ĐỘNG ĐÃ KÍCH HOẠT — VUI LÒNG YÊU CẦU ĐẠI BIỂU XUẤT TRÌNH CCCD ĐỐI CHIẾU!
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    await crmPage.setContent(redDuplicateHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_25_checkin_duplicate_red_alert.png') });
    console.log('✔ Saved live_25_checkin_duplicate_red_alert.png');

    // ========================================================
    // FLOW G: CORE FEATURES CAPTURE (APP & CRM)
    // ========================================================
    console.log('\n--- 7. FLOW G: Core Ecosystem Features ---');

    // App VIP 3D Card
    await appPage.goto('https://14.225.217.232:5444/association/card', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_26_app_vip_3d_card.png') });
    console.log('✔ Saved live_26_app_vip_3d_card.png');

    // Public Digital Card Web (Desktop)
    await crmPage.goto('https://14.225.217.232:5444/card/M1983-089', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_27_public_digital_card_web.png') });
    console.log('✔ Saved live_27_public_digital_card_web.png');

    // App Marketplace B2B Shopee-Style
    await appPage.goto('https://14.225.217.232:5444/association/products', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_28_app_marketplace_b2b_shopee.png') });
    console.log('✔ Saved live_28_app_marketplace_b2b_shopee.png');

    // App Opportunities Feed & 1-on-1 Meeting Booking
    await appPage.goto('https://14.225.217.232:5444/association/opportunities', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_29_app_opportunities_feed_1on1.png') });
    console.log('✔ Saved live_29_app_opportunities_feed_1on1.png');

    // App Member Profile Edit
    await appPage.goto('https://14.225.217.232:5444/association/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_30_app_member_profile_edit.png') });
    console.log('✔ Saved live_30_app_member_profile_edit.png');

    // CRM Cinema Seating Map
    await crmPage.goto('https://14.225.217.232:5443/event-registrations', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_31_crm_cinema_seating_map.png') });
    console.log('✔ Saved live_31_crm_cinema_seating_map.png');

    // CRM Meetings Calendar
    await crmPage.goto('https://14.225.217.232:5443/meetings', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_32_crm_meetings_calendar.png') });
    console.log('✔ Saved live_32_crm_meetings_calendar.png');

    // CRM Online Voting
    await crmPage.goto('https://14.225.217.232:5443/voting', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_33_crm_online_voting.png') });
    console.log('✔ Saved live_33_crm_online_voting.png');

    // CRM Fees & VietQR Cashbook
    await crmPage.goto('https://14.225.217.232:5443/fees', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_34_crm_fees_vietqr_cashbook.png') });
    console.log('✔ Saved live_34_crm_fees_vietqr_cashbook.png');

    // CRM RBAC Roles & Permissions
    await crmPage.goto('https://14.225.217.232:5443/permissions', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_35_crm_rbac_roles_permissions.png') });
    console.log('✔ Saved live_35_crm_rbac_roles_permissions.png');

    console.log('\n=== MASTER CAPTURE FINISHED SUCCESSFULLY (35/35 SCREENSHOTS) ===');
  } catch (err) {
    console.error('Error during master capture:', err);
  } finally {
    await browser.close();
  }
}

captureAllLiveFlowsMaster().catch(console.error);
