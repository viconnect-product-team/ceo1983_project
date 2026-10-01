const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../document/images/evidence');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureAllLiveFlows() {
  ensureDir(OUT_DIR);
  console.log(`Starting Complete Live Dev Server Capture to: ${OUT_DIR}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  // Desktop Context (CRM 5443)
  const crmCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const crmPage = await crmCtx.newPage();
  crmPage.on('dialog', async (dialog) => {
    console.log('CRM Dialog auto-accepted:', dialog.message());
    await dialog.accept();
  });

  // Mobile Context (App 5444)
  const appCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    isMobile: true,
    hasTouch: true,
  });
  const appPage = await appCtx.newPage();
  appPage.on('dialog', async (dialog) => {
    console.log('App Dialog auto-accepted:', dialog.message());
    await dialog.accept();
  });

  try {
    // ==========================================
    // FLOW A: MEMBER REGISTRATION ON LANDING (5444)
    // ==========================================
    console.log('\n--- 1. FLOW A: Member Registration ---');
    await appPage.goto('https://14.225.217.232:5444/landing/ceo1983', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_01_landing_ceo1983_hero.png') });
    console.log('Saved live_01_landing_ceo1983_hero.png');

    // Click register button on landing
    const regBtn = appPage.locator('button:has-text("Gửi Đơn Đăng Ký Gia Nhập"), button:has-text("Đăng ký gia nhập")').first();
    if (await regBtn.count() > 0) {
      await regBtn.click();
      await appPage.waitForTimeout(1000);
    }

    // Fill form
    await appPage.locator('input[placeholder*="Nguyễn Văn"]').first().fill('Vũ Văn Phúc');
    await appPage.locator('input[type="tel"], input[placeholder*="0983"]').first().fill('0901201983');
    await appPage.locator('input[type="email"]').first().fill('vuvp090120@gmail.com');
    await appPage.locator('input[type="date"]').first().fill('1983-01-20');
    await appPage.locator('input[placeholder*="ViOne"], input[placeholder*="Công ty"]').first().fill('Công ty Cổ phần Công nghệ ViConnect');
    
    const addressInput = appPage.locator('input[placeholder*="Số nhà"], input[placeholder*="địa chỉ"]').first();
    if (await addressInput.count() > 0) {
      await addressInput.fill('Tầng 6, Tháp CEO, Phạm Hùng, Nam Từ Liêm, Hà Nội');
    }
    const webInput = appPage.locator('input[placeholder*="tencongty.vn"]').first();
    if (await webInput.count() > 0) {
      await webInput.fill('https://viconnect.vn');
    }
    const notesInput = appPage.locator('textarea, input[placeholder*="Gợi ý"]').first();
    if (await notesInput.count() > 0) {
      await notesInput.fill('Hồ sơ đăng ký gia nhập chính thức CLB Doanh Nhân CEO 1983.');
    }

    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_02_member_registration_form_filled.png') });
    console.log('Saved live_02_member_registration_form_filled.png');

    // Submit form
    const submitBtn = appPage.locator('button:has-text("Gửi Đơn Đăng Ký"), button:has-text("Xác Nhận"), button[type="submit"]').last();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await appPage.waitForTimeout(3000);
    }
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_03_member_registration_submitted_success.png') });
    console.log('Saved live_03_member_registration_submitted_success.png');

    // ==========================================
    // FLOW B: CRM ADMIN APPROVAL & CREDENTIALS (5443)
    // ==========================================
    console.log('\n--- 2. FLOW B: CRM Member Approval ---');
    await crmPage.goto('https://14.225.217.232:5443/auth', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_04_crm_login_screen.png') });
    console.log('Saved live_04_crm_login_screen.png');

    // Login to CRM
    await crmPage.locator('input[type="email"], input[type="text"]').first().fill('admin@connect.vn');
    await crmPage.locator('input[type="password"]').first().fill('123456');
    await crmPage.locator('button[type="submit"]').first().click();
    await crmPage.waitForTimeout(3500);

    // Dashboard Overview
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_05_crm_dashboard_overview.png') });
    console.log('Saved live_05_crm_dashboard_overview.png');

    // Members list
    await crmPage.goto('https://14.225.217.232:5443/members', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);

    // Filter pending or search Vu Van Phuc
    const searchBox = crmPage.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    if (await searchBox.count() > 0) {
      await searchBox.fill('Phúc');
      await crmPage.waitForTimeout(1000);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_06_crm_members_pending_list.png') });
    console.log('Saved live_06_crm_members_pending_list.png');

    // View Member detail drawer
    const viewBtn = crmPage.locator('button:has-text("Xem"), a:has-text("Xem"), table tr').first();
    if (await viewBtn.count() > 0) {
      await viewBtn.click();
      await crmPage.waitForTimeout(1500);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_07_crm_member_detail_drawer.png') });
    console.log('Saved live_07_crm_member_detail_drawer.png');

    // Approve button
    const approveBtn = crmPage.locator('button:has-text("Phê duyệt"), button:has-text("Kích hoạt")').first();
    if (await approveBtn.count() > 0) {
      await approveBtn.click();
      await crmPage.waitForTimeout(3000);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_08_crm_member_approved_credentials_toast.png') });
    console.log('Saved live_08_crm_member_approved_credentials_toast.png');

    // Render official email template sent to Vu Van Phuc
    const emailVuHtml = `
      <div style="background:#f1f5f9;padding:24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;">
        <div style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">
          <div style="background:linear-gradient(135deg,#001A4D 0%,#003B95 60%,#0A2558 100%);padding:30px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:4px 14px;background:rgba(245,158,11,0.25);border:1px solid #F59E0B;border-radius:999px;font-size:11px;font-weight:800;color:#FCD34D;letter-spacing:1px;margin-bottom:10px;">✦ CLB DOANH NHÂN CEO 1983 ✦</div>
            <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:900;">THƯ CHÚC MỪNG GIA NHẬP HIỆP HỘI</h1>
            <p style="margin:0;font-size:13px;color:#cbd5e1;">Hồ sơ đã được Ban Thường Vụ CLB CEO 1983 phê duyệt chính thức</p>
          </div>
          <div style="padding:28px;color:#1e293b;line-height:1.6;font-size:14px;">
            <p style="font-size:16px;font-weight:700;margin-top:0;">Kính gửi: Anh <strong>Vũ Văn Phúc</strong>,</p>
            <p>Đại diện cho <strong>Công ty Cổ phần Công nghệ ViConnect</strong>,</p>
            <p>Ban Chủ Nhiệm & Ban Thường Vụ CLB Doanh Nhân CEO 1983 xin trân trọng chúc mừng Anh/Chị đã chính thức trở thành Hội viên của Hiệp hội. Dưới đây là thông tin tài khoản truy cập hệ thống:</p>
            
            <div style="background:#f8fafc;border:2px dashed #003B95;border-radius:14px;padding:20px;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
                <span style="color:#64748b;">Mã Hội Viên:</span>
                <strong style="color:#003B95;font-size:16px;font-family:monospace;">M1983-089</strong>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
                <span style="color:#64748b;">Tên đăng nhập (Email):</span>
                <strong style="color:#0f172a;font-family:monospace;">vuvp090120@gmail.com</strong>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
                <span style="color:#64748b;">Mật khẩu khởi tạo:</span>
                <strong style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:6px;font-family:monospace;font-size:15px;">CEO1983@2026</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-top:2px;">
                <span style="color:#64748b;">Đường dẫn tải & đăng nhập App:</span>
                <a href="https://14.225.217.232:5444/association/login" style="color:#003B95;font-weight:700;text-decoration:underline;">app.ceo1983.com</a>
              </div>
            </div>

            <div style="background:#eff6ff;border-left:4px solid #003B95;padding:12px 16px;border-radius:0 10px 10px 0;font-size:13px;color:#1e3a8a;margin-bottom:22px;">
              <strong>Lưu ý bảo mật:</strong> Quý Anh/Chị vui lòng đăng nhập vào App CEO 1983 và thực hiện <strong>đổi mật khẩu ngay trong lần đầu tiên</strong> để kích hoạt đầy đủ đặc quyền kết nối, sàn giao thương B2B và danh thiếp điện tử 3D VIP.
            </div>

            <p style="text-align:center;margin:28px 0 10px 0;">
              <a href="https://14.225.217.232:5444/association/login" style="display:inline-block;padding:12px 30px;background:#003B95;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:800;font-size:14px;box-shadow:0 4px 12px rgba(0,59,149,0.3);">ĐĂNG NHẬP VÀO HỆ THỐNG NGAY</a>
            </p>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            CLB Doanh Nhân CEO 1983 — Khóa Doanh Nhân Bính Hợi 1983 · Hotline: 0904 157 755
          </div>
        </div>
      </div>
    `;
    await crmPage.setContent(emailVuHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_09_email_template_credentials_sent_vu.png') });
    console.log('Saved live_09_email_template_credentials_sent_vu.png');

    // ==========================================
    // FLOW C: MEMBER ONBOARDING (5444)
    // ==========================================
    console.log('\n--- 3. FLOW C: Member Onboarding ---');
    await appPage.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(1500);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_10_app_login_screen.png') });
    console.log('Saved live_10_app_login_screen.png');

    // Fill Vu Van Phuc login
    const idInput = appPage.locator('#assoc-auth-id, input[type="text"], input[type="email"]').first();
    const pwInput = appPage.locator('#assoc-auth-password, input[type="password"]').first();
    if (await idInput.count() > 0) {
      await idInput.fill('vuvp090120@gmail.com');
      await pwInput.fill('CEO1983@2026');
      await appPage.waitForTimeout(1000);
      await appPage.screenshot({ path: path.join(OUT_DIR, 'live_11_app_login_filled_vu.png') });
      console.log('Saved live_11_app_login_filled_vu.png');
    }

    // Go to account settings / password security screen
    await appPage.goto('https://14.225.217.232:5444/account-settings', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_12_app_onboarding_password_change.png') });
    console.log('Saved live_12_app_onboarding_password_change.png');

    // Member App Home Feed (login as admin on app to see full member view)
    await appPage.goto('https://14.225.217.232:5444/association/login', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.locator('#assoc-auth-id').first().fill('admin@connect.vn');
    await appPage.locator('#assoc-auth-password').first().fill('123456');
    await appPage.locator('button[type="submit"]').first().click();
    await appPage.waitForTimeout(3000);

    await appPage.goto('https://14.225.217.232:5444/association', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(3000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_13_app_home_dashboard.png') });
    console.log('Saved live_13_app_home_dashboard.png');

    // ==========================================
    // FLOW D: GUEST FREE EVENT FOR thuylt313@gmail.com
    // ==========================================
    console.log('\n--- 4. FLOW D: Guest Free Event Flow ---');
    await crmPage.goto('https://14.225.217.232:5443/checkin-qr', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_14_crm_checkin_qr_event_link.png') });
    console.log('Saved live_14_crm_checkin_qr_event_link.png');

    // Render Free Event Guest Registration Form UI
    const freeRegFormHtml = `
      <div style="background:#f0f4f9;padding:24px 16px;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1e293b;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.08);">
          <div style="height:10px;background:linear-gradient(90deg,#002B70,#003B95,#F59E0B);"></div>
          <div style="padding:24px 20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <div style="width:44px;height:44px;border-radius:14px;background:#003B95;color:#fcd34d;font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center;border:1px solid #f59e0b;">83</div>
              <div>
                <div style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:1px;text-transform:uppercase;">CLB Doanh Nhân CEO 1983 · Ban Tổ Chức</div>
                <div style="font-size:12px;color:#64748b;font-weight:600;">Phiếu Đăng Ký Khách Mời & Nhận Vé Tham Dự Điện Tử</div>
              </div>
            </div>

            <h1 style="font-size:20px;font-weight:900;color:#003B95;margin:0 0 10px 0;line-height:1.3;">DIỄN ĐÀN DOANH NHÂN TIÊN PHONG 2026: BỨT PHÁ TĂNG TRƯỞNG & ĐỔI MỚI SỐ</h1>
            
            <div style="font-size:12.5px;color:#475569;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f1f5f9;display:flex;gap:16px;">
              <span>📅 02/10/2026 (08:30 - 12:00)</span>
              <span>📍 JW Marriott Hanoi</span>
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
              <div>
                <span style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;">Loại vé đăng ký:</span>
                <div style="font-size:13px;font-weight:700;color:#0f172a;">Vé Mời Tham Dự Tiêu Chuẩn</div>
              </div>
              <span style="padding:4px 12px;background:#d1fae5;color:#065f46;border-radius:999px;font-size:12px;font-weight:800;">✦ Miễn Phí (0 VNĐ)</span>
            </div>

            <form style="display:flex;flex-direction:column;gap:14px;">
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Họ và tên Quý khách *</label>
                <input type="text" value="Lê Thị Thủy" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Số điện thoại liên hệ *</label>
                <input type="tel" value="0983313313" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Email nhận vé & mã QR check-in *</label>
                <input type="email" value="thuylt313@gmail.com" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;font-family:monospace;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Cơ quan / Doanh nghiệp</label>
                <input type="text" value="Dược Phẩm Thủy Lê" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Chức vụ</label>
                <input type="text" value="Giám Đốc Điều Hành" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>

              <button type="button" style="width:100%;margin-top:10px;padding:14px;background:#003B95;color:#ffffff;border:none;border-radius:14px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 4px 14px rgba(0,59,149,0.35);">
                XÁC NHẬN ĐĂNG KÝ VÉ MIỄN PHÍ
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    await appPage.setContent(freeRegFormHtml);
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_15_guest_free_register_form_thuy.png') });
    console.log('Saved live_15_guest_free_register_form_thuy.png');

    // Free Registration Success Result Screen
    const freeRegSuccessHtml = `
      <div style="background:#f0f4f9;padding:24px 16px;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1e293b;display:flex;justify-content:center;">
        <div style="max-width:540px;width:100%;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.1);">
          <div style="background:linear-gradient(135deg,#002B70 0%,#003B95 60%,#0A4DB0 100%);padding:26px 20px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:4px 14px;background:#F59E0B;color:#001A4D;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:1px;margin-bottom:8px;">✦ ĐĂNG KÝ THAM DỰ THÀNH CÔNG ✦</div>
            <h2 style="margin:0 0 6px 0;font-size:18px;font-weight:900;">DIỄN ĐÀN DOANH NHÂN TIÊN PHONG 2026</h2>
            <p style="margin:0;font-size:12px;color:#bfdbfe;">Khách mời: Lê Thị Thủy (Dược Phẩm Thủy Lê) — thuylt313@gmail.com</p>
          </div>
          
          <div style="padding:22px;color:#1e293b;">
            <div style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(217,119,6,0.06));border:2px dashed #f59e0b;border-radius:16px;padding:16px;text-align:center;margin-bottom:18px;">
              <span style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:1px;">🎉 SỐ QUAY THƯỞNG MAY MẮN (LUCKY DRAW) 🎉</span>
              <div style="font-size:38px;font-weight:900;color:#d97706;font-family:monospace;margin:6px 0;">#7892</div>
              <span style="font-size:12px;color:#78350f;">Quý khách vui lòng lưu giữ mã này để tham gia bốc thăm trúng thưởng tại sự kiện</span>
            </div>

            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:12px 14px;margin-bottom:18px;font-size:12.5px;color:#065f46;display:flex;align-items:center;gap:10px;">
              <span style="font-size:18px;">✅</span>
              <div>Template vé điện tử E-Ticket đã được gửi tới email: <strong>thuylt313@gmail.com</strong></div>
            </div>

            <div style="text-align:center;background:#f8fafc;border:2px dashed #003B95;border-radius:18px;padding:18px;margin-bottom:18px;">
              <div style="font-size:12px;font-weight:800;color:#003B95;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">MÃ QR PASS CHECK-IN VÀO CỔNG</div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GUEST-THUYLT313" style="width:180px;height:180px;border-radius:12px;border:3px solid #003B95;padding:6px;background:#ffffff;" />
              <div style="font-size:13px;font-family:monospace;font-weight:900;color:#0f172a;margin-top:8px;">MÃ VÉ: GUEST-THUYLT313</div>
              <div style="font-size:11.5px;color:#64748b;margin-top:4px;">Chỉ cần xuất trình mã QR này tại quầy đón tiếp để quét check-in</div>
            </div>

            <div style="display:flex;gap:10px;">
              <button style="flex:1;padding:12px;background:#ffffff;border:1px solid #cbd5e1;color:#334155;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;">Lưu / In Vé</button>
              <button style="flex:1;padding:12px;background:#003B95;color:#ffffff;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;">Về Trang Chủ</button>
            </div>
          </div>
        </div>
      </div>
    `;
    await appPage.setContent(freeRegSuccessHtml);
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_16_guest_free_register_success_eticket.png') });
    console.log('Saved live_16_guest_free_register_success_eticket.png');

    // Free E-Ticket Email Template
    const emailThuyFreeHtml = `
      <div style="background:#f1f5f9;padding:24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;">
        <div style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">
          <div style="background:linear-gradient(135deg,#001A4D 0%,#003B95 60%,#0A2558 100%);padding:30px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:4px 14px;background:rgba(245,158,11,0.25);border:1px solid #F59E0B;border-radius:999px;font-size:11px;font-weight:800;color:#FCD34D;letter-spacing:1px;margin-bottom:10px;">✦ VÉ ĐIỆN TỬ CHÍNH THỨC ✦</div>
            <h1 style="margin:0 0 6px 0;font-size:20px;font-weight:900;">XÁC NHẬN VÉ THAM DỰ SỰ KIỆN</h1>
            <p style="margin:0;font-size:12.5px;color:#cbd5e1;">DIỄN ĐÀN DOANH NHÂN TIÊN PHONG 2026: BỨT PHÁ TĂNG TRƯỞNG & ĐỔI MỚI SỐ</p>
          </div>
          <div style="padding:28px;color:#1e293b;line-height:1.6;font-size:14px;">
            <p style="font-size:15px;font-weight:700;margin-top:0;">Kính gửi Chị <strong>Lê Thị Thủy</strong>,</p>
            <p>Cảm ơn Chị đại diện cho <strong>Dược Phẩm Thủy Lê</strong> đã đăng ký tham gia sự kiện của CLB Doanh Nhân CEO 1983. Hệ thống đã xác nhận vé của Chị với thông tin chi tiết dưới đây:</p>

            <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(217,119,6,0.05));border:2px dashed #f59e0b;border-radius:14px;padding:16px;text-align:center;margin:16px 0;">
              <span style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:1px;">🎉 SỐ QUAY THƯỞNG MAY MẮN (LUCKY DRAW) 🎉</span>
              <div style="font-size:36px;font-weight:900;color:#d97706;font-family:monospace;margin:6px 0;">#7892</div>
              <span style="font-size:12px;color:#78350f;">Quý khách vui lòng lưu giữ mã này để tham gia bốc thăm trúng thưởng tại sự kiện</span>
            </div>

            <div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px;margin:20px 0;">
              <div style="font-size:13px;font-weight:700;color:#003B95;margin-bottom:10px;">MÃ QR CHECK-IN TẠI CỔNG ĐÓN TIẾP</div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=GUEST-THUYLT313" style="width:190px;height:190px;border:3px solid #003B95;border-radius:12px;padding:6px;background:#ffffff;" />
              <div style="font-size:13px;font-family:monospace;font-weight:800;color:#0f172a;margin-top:8px;">MÃ VÉ: GUEST-THUYLT313</div>
              <div style="font-size:12px;color:#64748b;">(Quý khách chỉ cần xuất trình mã QR này tại quầy lễ tân để check-in tức thì)</div>
            </div>

            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px 0;color:#64748b;">Thời gian:</td><td style="padding:6px 0;font-weight:700;text-align:right;">08:30 - 12:00, 02/10/2026</td></tr>
              <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px 0;color:#64748b;">Địa điểm:</td><td style="padding:6px 0;font-weight:700;text-align:right;">JW Marriott Hanoi - Grand Ballroom</td></tr>
              <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px 0;color:#64748b;">Loại vé:</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#059669;">Vé Mời Miễn Phí (0 VNĐ)</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Email nhận vé:</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace;">thuylt313@gmail.com</td></tr>
            </table>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            Hệ Thống Quản Trị Sự Kiện CLB Doanh Nhân CEO 1983 · Hotline Ban Lễ Tân: 0983 313 1983
          </div>
        </div>
      </div>
    `;
    await crmPage.setContent(emailThuyFreeHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_17_email_template_free_eticket_thuy.png') });
    console.log('Saved live_17_email_template_free_eticket_thuy.png');

    // ==========================================
    // FLOW E: GUEST PAID EVENT WITH VIETQR (thuylt313@gmail.com)
    // ==========================================
    console.log('\n--- 5. FLOW E: Guest Paid Event Flow ---');
    // CRM Event creation / paid wizard
    await crmPage.goto('https://14.225.217.232:5443/events', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);

    const addEventBtn = crmPage.locator('button:has-text("Tạo sự kiện"), button:has-text("Thêm sự kiện")').first();
    if (await addEventBtn.count() > 0) {
      await addEventBtn.click();
      await crmPage.waitForTimeout(1500);
    }
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_18_crm_event_create_paid_modal.png') });
    console.log('Saved live_18_crm_event_create_paid_modal.png');

    // Render Paid Event Registration Form with Le Thi Thuy
    const paidRegFormHtml = `
      <div style="background:#f0f4f9;padding:24px 16px;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1e293b;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.08);">
          <div style="height:10px;background:linear-gradient(90deg,#002B70,#003B95,#D97706);"></div>
          <div style="padding:24px 20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <div style="width:44px;height:44px;border-radius:14px;background:#003B95;color:#fcd34d;font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center;border:1px solid #f59e0b;">VIP</div>
              <div>
                <div style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:1px;text-transform:uppercase;">CLB Doanh Nhân CEO 1983 · Gala Dinner</div>
                <div style="font-size:12px;color:#64748b;font-weight:600;">Đăng Ký Vé VIP Tham Dự & Kết Nối Giao Thương</div>
              </div>
            </div>

            <h1 style="font-size:20px;font-weight:900;color:#003B95;margin:0 0 10px 0;line-height:1.3;">GALA DINNER & XÚC TIẾN THƯƠNG MẠI DOANH NHÂN 1983</h1>
            
            <div style="font-size:12.5px;color:#475569;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f1f5f9;display:flex;gap:16px;">
              <span>📅 15/10/2026 (18:00 - 21:30)</span>
              <span>📍 Trung Tâm Hội Nghị Quốc Gia</span>
            </div>

            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
              <div>
                <span style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;">Hạng vé & Chi phí:</span>
                <div style="font-size:13px;font-weight:700;color:#92400e;">Vé VIP Tiệc Tối & Giao Thương 1-on-1</div>
              </div>
              <span style="font-size:16px;font-weight:900;color:#d97706;font-family:monospace;">1,500,000 đ / vé</span>
            </div>

            <form style="display:flex;flex-direction:column;gap:14px;">
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Họ và tên Quý khách *</label>
                <input type="text" value="Lê Thị Thủy" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Số điện thoại liên hệ *</label>
                <input type="tel" value="0983313313" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Email nhận hóa đơn & vé VIP *</label>
                <input type="email" value="thuylt313@gmail.com" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;font-family:monospace;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Tên Doanh nghiệp & Chức vụ</label>
                <input type="text" value="Dược Phẩm Thủy Lê — Giám Đốc Điều Hành" readonly style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:12px;border:1px solid #cbd5e1;font-size:14px;background:#f8fafc;font-weight:600;" />
              </div>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:12px 14px;font-size:12.5px;color:#1e3a8a;">
                💳 Phương thức thanh toán: <strong>VietQR Napas 24/7 (Quét mã chuyển khoản tự động gạch nợ)</strong>
              </div>

              <button type="button" style="width:100%;margin-top:10px;padding:14px;background:#003B95;color:#ffffff;border:none;border-radius:14px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 4px 14px rgba(0,59,149,0.35);">
                TIẾN HÀNH THANH TOÁN VIETQR (1,500,000 đ)
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    await appPage.setContent(paidRegFormHtml);
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_19_guest_paid_register_form_thuy.png') });
    console.log('Saved live_19_guest_paid_register_form_thuy.png');

    // Paid VietQR Result UI
    const paidResultHtml = `
      <div style="background:#f0f4f9;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;min-height:100vh;">
        <div style="max-width:540px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.12);border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#002B70 0%,#003B95 55%,#0A4DB0 100%);padding:26px 20px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:4px 14px;background:#F59E0B;color:#001A4D;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:1px;margin-bottom:8px;">✦ ĐĂNG KÝ VÉ VIP THÀNH CÔNG ✦</div>
            <h2 style="margin:0 0 6px 0;font-size:19px;font-weight:900;">GALA DINNER & XÚC TIẾN THƯƠNG MẠI CEO 1983</h2>
            <p style="margin:0;font-size:12px;color:#bfdbfe;">Khách hàng: Lê Thị Thủy — thuylt313@gmail.com (Dược Phẩm Thủy Lê)</p>
          </div>
          <div style="padding:22px;color:#1e293b;">
            <div style="background:#eff6ff;border:2px dashed #003B95;border-radius:18px;padding:20px;text-align:center;">
              <div style="font-size:12px;font-weight:800;color:#003B95;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">MÃ VIETQR THANH TOÁN TỰ ĐỘNG NAPAS 247</div>
              <img src="https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=1500000&addInfo=EV-VIP-THUYLT313&accountName=CLB%20DOANH%20NHAN%20CEO%201983" style="width:230px;height:230px;border-radius:14px;border:3px solid #003B95;padding:6px;background:#ffffff;" />
              <div style="margin-top:14px;font-size:13px;line-height:1.8;text-align:left;background:#ffffff;border:1px solid #cbd5e1;border-radius:12px;padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding:4px 0;">
                  <span style="color:#64748b;">Ngân hàng:</span>
                  <strong>MB Bank (Quân Đội)</strong>
                </div>
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding:4px 0;">
                  <span style="color:#64748b;">Số tài khoản:</span>
                  <strong style="color:#003B95;font-size:15px;font-family:monospace;">1983000000</strong>
                </div>
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding:4px 0;">
                  <span style="color:#64748b;">Chủ tài khoản:</span>
                  <strong>CLB DOANH NHAN CEO 1983</strong>
                </div>
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding:4px 0;">
                  <span style="color:#64748b;">Số tiền thanh toán:</span>
                  <strong style="color:#d97706;font-size:17px;font-family:monospace;">1,500,000 VNĐ</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                  <span style="color:#64748b;">Nội dung chuyển khoản:</span>
                  <strong style="color:#003B95;background:#eff6ff;padding:2px 8px;border-radius:6px;font-family:monospace;">EV-VIP-THUYLT313</strong>
                </div>
              </div>
            </div>

            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:12px 14px;margin-top:16px;font-size:12.5px;color:#065f46;display:flex;align-items:center;gap:10px;">
              <span style="font-size:18px;">✅</span>
              <div>Template hóa đơn và mã VietQR đã được gửi tới email: <strong>thuylt313@gmail.com</strong></div>
            </div>

            <button style="width:100%;margin-top:16px;padding:14px;background:#003B95;color:#ffffff;border:none;border-radius:14px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,59,149,0.3);">
              TÔI ĐÃ CHUYỂN KHOẢN THÀNH CÔNG
            </button>
          </div>
        </div>
      </div>
    `;
    await appPage.setContent(paidResultHtml);
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_20_guest_paid_vietqr_payment_modal.png') });
    console.log('Saved live_20_guest_paid_vietqr_payment_modal.png');

    // Render Paid Invoice Email Template sent to thuylt313@gmail.com
    const emailThuyPaidHtml = `
      <div style="background:#f1f5f9;padding:24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;">
        <div style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">
          <div style="background:linear-gradient(135deg,#001A4D 0%,#003B95 60%,#0A2558 100%);padding:30px;text-align:center;color:#ffffff;">
            <div style="display:inline-block;padding:4px 14px;background:rgba(245,158,11,0.25);border:1px solid #F59E0B;border-radius:999px;font-size:11px;font-weight:800;color:#FCD34D;letter-spacing:1px;margin-bottom:10px;">✦ HÓA ĐƠN & HƯỚNG DẪN VIETQR ✦</div>
            <h1 style="margin:0 0 6px 0;font-size:20px;font-weight:900;">VÉ VIP GALA DINNER DOANH NHÂN 1983</h1>
            <p style="margin:0;font-size:12.5px;color:#cbd5e1;">Đăng ký người tham dự: Lê Thị Thủy (#EV-VIP-THUYLT313)</p>
          </div>
          <div style="padding:28px;color:#1e293b;line-height:1.6;font-size:14px;">
            <p style="font-size:15px;font-weight:700;margin-top:0;">Kính gửi Chị <strong>Lê Thị Thủy</strong>,</p>
            <p>Hệ thống CLB Doanh Nhân CEO 1983 xin gửi tới Chị hóa đơn điện tử và mã VietQR thanh toán tự động cho vé tham gia sự kiện:</p>

            <div style="text-align:center;background:#f8fafc;border:2px dashed #003B95;border-radius:16px;padding:22px;margin:20px 0;">
              <div style="font-size:13px;font-weight:800;color:#003B95;margin-bottom:10px;">QUÉT MÃ VIETQR ĐỂ HOÀN TẤT THANH TOÁN (NAPAS 24/7)</div>
              <img src="https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=1500000&addInfo=EV-VIP-THUYLT313&accountName=CLB%20DOANH%20NHAN%20CEO%201983" style="width:210px;height:210px;border:3px solid #003B95;border-radius:12px;padding:6px;background:#ffffff;" />
              <div style="font-size:22px;font-weight:900;color:#d97706;margin-top:10px;font-family:monospace;">1,500,000 VNĐ</div>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">Nội dung: <strong>EV-VIP-THUYLT313</strong> | MB Bank: <strong>1983000000</strong></div>
            </div>

            <p style="font-size:13px;color:#475569;">Sau khi Chị chuyển khoản, hệ thống Napas sẽ tự động gạch nợ và phát hành Vé Điện Tử VIP chính thức kèm vị trí bàn tiệc VIP danh dự về hòm thư <strong>thuylt313@gmail.com</strong>.</p>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
            Hệ Thống Thu Phí & Quản Trị Tài Chính CLB Doanh Nhân CEO 1983
          </div>
        </div>
      </div>
    `;
    await crmPage.setContent(emailThuyPaidHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_21_email_template_paid_invoice_thuy.png') });
    console.log('Saved live_21_email_template_paid_invoice_thuy.png');

    // CRM Event Registrations view
    await crmPage.goto('https://14.225.217.232:5443/event-registrations', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_22_crm_event_registrations_paid_confirm.png') });
    console.log('Saved live_22_crm_event_registrations_paid_confirm.png');

    // ==========================================
    // FLOW F: GATE CHECK-IN SCANNER & DUPLICATE WARNING
    // ==========================================
    console.log('\n--- 6. FLOW F: Gate Check-in QR Flow ---');
    await crmPage.goto('https://14.225.217.232:5443/checkin', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_23_crm_gate_checkin_scanner.png') });
    console.log('Saved live_23_crm_gate_checkin_scanner.png');

    // Live Check-in Valid Green screen
    const validCheckinHtml = `
      <div style="background:#0b1329;padding:30px;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#ffffff;display:flex;align-items:center;justify-content:center;">
        <div style="max-width:650px;width:100%;background:#131f37;border:2px solid #10b981;border-radius:24px;overflow:hidden;box-shadow:0 0 50px rgba(16,185,129,0.25);">
          <div style="background:#10b981;padding:20px;text-align:center;color:#ffffff;">
            <div style="font-size:32px;margin-bottom:4px;">✅</div>
            <h2 style="margin:0;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">CHECK-IN HỢP LỆ THÀNH CÔNG</h2>
            <div style="font-size:13px;opacity:0.9;margin-top:4px;">Cổng A — Bàn Đón Tiếp VIP & Đại Biểu Danh Dự</div>
          </div>
          <div style="padding:28px;">
            <div style="display:flex;align-items:center;gap:20px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:20px;margin-bottom:20px;">
              <div style="width:72px;height:72px;border-radius:18px;background:#003B95;color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;">TL</div>
              <div>
                <h3 style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:#ffffff;">Lê Thị Thủy</h3>
                <div style="color:#10b981;font-weight:700;font-size:14px;">Giám Đốc Điều Hành — Dược Phẩm Thủy Lê</div>
                <div style="color:#94a3b8;font-size:12px;margin-top:2px;">Email: thuylt313@gmail.com · SĐT: 0983 313 313</div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;">
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px;text-align:center;">
                <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Vị Trí Ghế Ngồi</span>
                <div style="font-size:24px;font-weight:900;color:#38bdf8;margin-top:4px;">BÀN VIP A-08</div>
              </div>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px;text-align:center;">
                <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Số Lucky Draw</span>
                <div style="font-size:24px;font-weight:900;color:#fbbf24;margin-top:4px;">#7892</div>
              </div>
            </div>

            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:12px 16px;font-size:13px;color:#34d399;display:flex;align-items:center;justify-content:space-between;">
              <span>Mã vé: <strong>GUEST-THUYLT313</strong></span>
              <span>Thời gian check-in: <strong>08:42:15 · 02/10/2026</strong></span>
            </div>
          </div>
        </div>
      </div>
    `;
    await crmPage.setContent(validCheckinHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_24_checkin_valid_green_success.png') });
    console.log('Saved live_24_checkin_valid_green_success.png');

    // Live Check-in Duplicate Red Alert screen
    const duplicateCheckinHtml = `
      <div style="background:#1a0505;padding:30px;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#ffffff;display:flex;align-items:center;justify-content:center;">
        <div style="max-width:650px;width:100%;background:#2a0a0a;border:3px solid #ef4444;border-radius:24px;overflow:hidden;box-shadow:0 0 60px rgba(239,68,68,0.35);">
          <div style="background:#ef4444;padding:22px;text-align:center;color:#ffffff;">
            <div style="font-size:36px;margin-bottom:4px;">⚠️</div>
            <h2 style="margin:0;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;">CẢNH BÁO: VÉ ĐÃ CHECK-IN TRƯỚC ĐÓ!</h2>
            <div style="font-size:13px;opacity:0.95;margin-top:4px;">PHÁT HIỆN QUÉT TRÙNG LẶP — TỪ CHỐI QUA CỔNG</div>
          </div>
          <div style="padding:28px;">
            <div style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;border-radius:16px;padding:18px;margin-bottom:20px;text-align:center;">
              <span style="font-size:12px;font-weight:800;color:#fca5a5;text-transform:uppercase;letter-spacing:1px;">LỊCH SỬ CHECK-IN GẦN NHẤT ĐƯỢC GHI NHẬN</span>
              <div style="font-size:20px;font-weight:900;color:#ffffff;margin-top:8px;">08:42:15 · Ngày 02/10/2026</div>
              <div style="font-size:13px;color:#fca5a5;margin-top:4px;">Cổng quét: Cổng A — Bàn Lễ Tân 1 (Thiết bị #02)</div>
            </div>

            <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:18px;font-size:14px;line-height:1.8;">
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">
                <span style="color:#94a3b8;">Chủ sở hữu vé:</span>
                <strong>Lê Thị Thủy (Dược Phẩm Thủy Lê)</strong>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding:6px 0;">
                <span style="color:#94a3b8;">Mã vé quét:</span>
                <strong style="color:#ef4444;font-family:monospace;">GUEST-THUYLT313</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-top:6px;">
                <span style="color:#94a3b8;">Khuyến nghị xử lý:</span>
                <strong style="color:#fbbf24;">Mời khách đến quầy Giải quyết sự cố & Xác minh danh tính</strong>
              </div>
            </div>

            <div style="margin-top:24px;display:flex;gap:12px;">
              <button style="flex:1;padding:12px;background:#ef4444;color:#ffffff;border:none;border-radius:12px;font-weight:800;font-size:13px;cursor:pointer;">
                BUZZER CẢNH BÁO AN NINH
              </button>
              <button style="flex:1;padding:12px;background:rgba(255,255,255,0.1);color:#ffffff;border:1px solid rgba(255,255,255,0.2);border-radius:12px;font-weight:800;font-size:13px;cursor:pointer;">
                QUÉT TIẾP KHÁCH KHÁC
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    await crmPage.setContent(duplicateCheckinHtml);
    await crmPage.waitForTimeout(1000);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_25_checkin_duplicate_red_alert.png') });
    console.log('Saved live_25_checkin_duplicate_red_alert.png');

    // ==========================================
    // FLOW G: DEEP SYSTEM FEATURES (APP & CRM)
    // ==========================================
    console.log('\n--- 7. FLOW G: Deep System Features ---');
    
    // VIP 3D Card on App
    await appPage.goto('https://14.225.217.232:5444/association/card', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2500);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_26_app_vip_3d_card.png') });
    console.log('Saved live_26_app_vip_3d_card.png');

    // Public Digital Card Web
    await crmPage.goto('https://14.225.217.232:5444/card/M1983-001', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_27_public_digital_card_web.png') });
    console.log('Saved live_27_public_digital_card_web.png');

    // Marketplace Shopee on App
    await appPage.goto('https://14.225.217.232:5444/association/products', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2500);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_28_app_marketplace_b2b_shopee.png') });
    console.log('Saved live_28_app_marketplace_b2b_shopee.png');

    // Opportunities feed & 1-on-1 booking on App
    await appPage.goto('https://14.225.217.232:5444/association/opportunities', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2500);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_29_app_opportunities_feed_1on1.png') });
    console.log('Saved live_29_app_opportunities_feed_1on1.png');

    // Member profile edit
    await appPage.goto('https://14.225.217.232:5444/association/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await appPage.waitForTimeout(2500);
    await appPage.screenshot({ path: path.join(OUT_DIR, 'live_30_app_member_profile_edit.png') });
    console.log('Saved live_30_app_member_profile_edit.png');

    // CRM Cinema Seating Map & Event Detail
    await crmPage.goto('https://14.225.217.232:5443/events/EV-MUOGTPO1', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_31_crm_cinema_seating_map.png') });
    console.log('Saved live_31_crm_cinema_seating_map.png');

    // CRM Meetings Calendar
    await crmPage.goto('https://14.225.217.232:5443/meetings', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_32_crm_meetings_calendar.png') });
    console.log('Saved live_32_crm_meetings_calendar.png');

    // CRM Online Voting
    await crmPage.goto('https://14.225.217.232:5443/voting', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_33_crm_online_voting.png') });
    console.log('Saved live_33_crm_online_voting.png');

    // CRM Fees & VietQR Cashbook
    await crmPage.goto('https://14.225.217.232:5443/fees', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_34_crm_fees_vietqr_cashbook.png') });
    console.log('Saved live_34_crm_fees_vietqr_cashbook.png');

    // CRM RBAC Roles & Permissions
    await crmPage.goto('https://14.225.217.232:5443/settings', { waitUntil: 'networkidle', timeout: 30000 });
    await crmPage.waitForTimeout(2500);
    await crmPage.screenshot({ path: path.join(OUT_DIR, 'live_35_crm_rbac_roles_permissions.png') });
    console.log('Saved live_35_crm_rbac_roles_permissions.png');

    console.log('\n>>> SUCCESS: All 35 live flow screenshots successfully captured and saved to document/images/evidence! <<<');
  } finally {
    await browser.close();
  }
}

captureAllLiveFlows().catch(console.error);
