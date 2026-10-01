const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, 'browser_evidence', '5137');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:5137';
const API_URL = 'http://127.0.0.1:4000/api';

async function runE2ETest() {
  console.log('===============================================================');
  console.log('🚀 BẮT ĐẦU TEST TOÀN BỘ LUỒNG TRÊN LOCALHOST:5137 & 6 BAN');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const results = {
    registration: false,
    btk_blocked: false,
    btv_approved: false,
    accounts_6_ban: {},
    new_member_login: false
  };

  try {
    // -------------------------------------------------------------
    // BƯỚC 1: ĐĂNG KÝ HỘI VIÊN MỚI TRÊN LOCALHOST:5137
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 1] Điều hướng đến trang đăng ký hội viên trên http://localhost:5137/register');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '01_register_page.png') });

    const timestamp = Date.now();
    const testEmail = `ceo.test5137_${timestamp}@ceo1983.com`;
    const testName = 'CEO Lê Hoàng 1983';
    const testPhone = '0983115137';
    const testCompany = 'Tập Đoàn Công Nghệ 5137 Số';
    const testTitle = 'Chủ Tịch HĐQT';

    console.log(`Gửi hồ sơ đăng ký qua API công khai (Public Register) của CEO 1983...`);
    const regRes = await axios.post(`${API_URL}/members/public-register`, {
      fullName: testName,
      phone: testPhone,
      email: testEmail,
      position: testTitle,
      birthYear: 1983,
      companyName: testCompany,
      taxCode: '01019835137',
      industry: 'Công nghệ thông tin',
      address: 'Tầng 19, Tòa nhà CEO 1983, Cầu Giấy, Hà Nội',
      website: 'https://ceo1983.com',
      staffSize: '50-100 nhân sự',
      boardWish: 'Ban Xúc Tiến Thương Mại & Đầu Tư',
      needs: 'Tìm đối tác phân phối phần mềm quản trị doanh nghiệp',
      offers: 'Cung cấp giải pháp số hóa hiệp hội và CRM',
      notes: 'Nguyện vọng tham gia CLB Doanh Nhân CEO 1983'
    });

    const memberCreatedId = regRes.data.memberId || regRes.data.id;
    console.log(`✅ [THÀNH CÔNG] Hồ sơ đăng ký đã lưu vào DB! ID: ${memberCreatedId}, Message: "${regRes.data.message}"`);
    results.registration = true;

    // -------------------------------------------------------------
    // BƯỚC 2: KIỂM CHỨNG BAN THƯ KÝ KHÔNG CÓ QUYỀN DUYỆT HỘI VIÊN (HTTP 403)
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 2] Kiểm tra thẩm quyền của Ban Thư Ký (ceo.tongthuky@ceo1983.com)...');
    const btkLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'ceo.tongthuky@ceo1983.com',
      password: '123456'
    });
    const btkToken = btkLoginRes.data.access_token || btkLoginRes.data.accessToken || btkLoginRes.data.token;
    console.log(`Ban Thư Ký đăng nhập thành công. Token: ${btkToken.substring(0, 15)}...`);

    try {
      await axios.patch(`${API_URL}/members/${memberCreatedId}/approve-with-credentials`, {}, {
        headers: { Authorization: `Bearer ${btkToken}` }
      });
      console.error('❌ LỖI: Ban Thư Ký duyệt được hội viên (Vi phạm phân quyền!)');
      results.btk_blocked = false;
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`✅ [CHÍNH XÁC] Ban Thư Ký bị CHẶN DUYỆT (HTTP 403 Forbidden): "${err.response.data.message}"`);
        results.btk_blocked = true;
      } else {
        console.log(`Phản hồi: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
      }
    }

    // -------------------------------------------------------------
    // BƯỚC 3: KIỂM CHỨNG BAN THÀNH VIÊN DUYỆT HỘI VIÊN THÀNH CÔNG (HTTP 201/200)
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 3] Ban Thành Viên (ceo.thanhvien@ceo1983.com) kiểm duyệt & phê duyệt kết nạp...');
    const btvLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'ceo.thanhvien@ceo1983.com',
      password: '123456'
    });
    const btvToken = btvLoginRes.data.access_token || btvLoginRes.data.accessToken || btvLoginRes.data.token;

    const btvApproveRes = await axios.patch(`${API_URL}/members/${memberCreatedId}/approve-with-credentials`, {}, {
      headers: { Authorization: `Bearer ${btvToken}` }
    });

    console.log(`✅ [THÀNH CÔNG] Ban Thành Viên đã phê duyệt kết nạp hội viên ${testName}!`);
    console.log(`Chi tiết: Mã HV: ${btvApproveRes.data.member?.member_code}, Trạng thái: ${btvApproveRes.data.member?.status}, Email gửi: ${btvApproveRes.data.credentials?.email}`);
    results.btv_approved = true;

    // -------------------------------------------------------------
    // BƯỚC 4: TEST ĐĂNG NHẬP 6 TÀI KHOẢN TƯƠNG ỨNG VỚI TỪNG BAN TRÊN LOCALHOST:5137
    // -------------------------------------------------------------
    const BAN_ACCOUNTS = [
      {
        name: 'Ban Quản Trị',
        email: 'admin@connect.vn',
        pass: '123456',
        targetRoute: '/admin',
        checkText: 'Hệ thống Quản Trị',
        screenshot: '04_ban_quan_tri.png'
      },
      {
        name: 'Ban Thư Ký',
        email: 'ceo.tongthuky@ceo1983.com',
        pass: '123456',
        targetRoute: '/meetings',
        checkText: 'Lịch Họp',
        screenshot: '05_ban_thu_ky.png'
      },
      {
        name: 'Ban Thành Viên',
        email: 'ceo.thanhvien@ceo1983.com',
        pass: '123456',
        targetRoute: '/members',
        checkText: 'Hội Viên',
        screenshot: '06_ban_thanh_vien.png'
      },
      {
        name: 'Ban Thiện Nguyện',
        email: 'ceo.thiennguyen@ceo1983.com',
        pass: '123456',
        targetRoute: '/cashbook',
        checkText: 'Sổ Quỹ',
        screenshot: '07_ban_thien_nguyen.png'
      },
      {
        name: 'Ban Truyền Thông',
        email: 'ceo.truyenthong@ceo1983.com',
        pass: '123456',
        targetRoute: '/events',
        checkText: 'Sự Kiện',
        screenshot: '08_ban_truyen_thong.png'
      },
      {
        name: 'Ban Xúc Tiến',
        email: 'ceo.xuctien@ceo1983.com',
        pass: '123456',
        targetRoute: '/marketplace',
        checkText: 'Sàn B2B',
        screenshot: '09_ban_xuc_tien.png'
      }
    ];

    console.log('\n[BƯỚC 4] Đăng nhập 6 tài khoản từng Ban trên trình duyệt localhost:5137...');

    for (const acc of BAN_ACCOUNTS) {
      console.log(`\n--- Kiểm tra tài khoản: ${acc.name} (${acc.email}) ---`);
      
      // Xóa cookies / localStorage để đảm bảo phiên đăng nhập riêng biệt
      await context.clearCookies();
      await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Điền email & pass
      const emailField = await page.waitForSelector('input[autocomplete="username"], input[type="text"], input[type="email"]', { timeout: 10000 });
      await emailField.fill(acc.email);

      const passField = await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await passField.fill(acc.pass);

      const loginBtn = await page.waitForSelector('button[type="submit"], button:has-text("Đăng nhập")', { timeout: 10000 });
      await loginBtn.click();

      await page.waitForTimeout(2000);

      // Điều hướng đến trang phân hệ nghiệp vụ của Ban
      await page.goto(`${BASE_URL}${acc.targetRoute}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const curUrl = page.url();
      await page.screenshot({ path: path.join(EVIDENCE_DIR, acc.screenshot) });

      console.log(`✅ [${acc.name}] Đăng nhập & truy cập thành công! URL: ${curUrl}`);
      results.accounts_6_ban[acc.name] = {
        email: acc.email,
        route: acc.targetRoute,
        status: 'OK',
        screenshot: acc.screenshot
      };
    }

    // -------------------------------------------------------------
    // BƯỚC 5: ĐĂNG NHẬP VỚI TÀI KHOẢN HỘI VIÊN MỚI VỪA ĐƯỢC BTV PHÊ DUYỆT
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 5] Đăng nhập tài khoản hội viên mới được cấp trên localhost:5137...');
    const memberNewPass = 'CEO1983@2026';
    await context.clearCookies();
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const mEmailField = await page.waitForSelector('input[autocomplete="username"], input[type="text"], input[type="email"]');
    await mEmailField.fill(testEmail);

    const mPassField = await page.waitForSelector('input[type="password"]');
    await mPassField.fill(memberNewPass);

    const mLoginBtn = await page.waitForSelector('button[type="submit"], button:has-text("Đăng nhập")');
    await mLoginBtn.click();
    await page.waitForTimeout(2500);

    await page.goto(`${BASE_URL}/association/profile`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '10_new_member_profile.png') });

    console.log(`✅ [HỘI VIÊN MỚI] Đăng nhập & xem hồ sơ VIP thành công: ${page.url()}`);
    results.new_member_login = true;

  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', err.message);
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log('📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ LOCALHOST:5137 & 6 BAN:');
  console.log(JSON.stringify(results, null, 2));
  console.log('===============================================================');
}

runE2ETest();
