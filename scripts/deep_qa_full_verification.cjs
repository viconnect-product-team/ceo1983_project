/**
 * CEO1983 - COMPREHENSIVE MULTI-ROLE DEEP QA VERIFICATION SUITE
 * Exhaustive coverage of all CRM and Mobile App flows:
 * - Admin: admin@connect.vn
 * - Member 1: vumikasa6@gmail.com
 * - Member 2: vupv090120@gmail.com
 */

const http = require('http');

const API_BASE = 'http://127.0.0.1:4000/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: headers,
        timeout: 20000,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${method} ${path}`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const results = [];
function record(suite, testName, passed, details = '') {
  results.push({ suite, testName, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} [${suite}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function run() {
  console.log('\n================================================================');
  console.log('🚀 CEO1983 - DEEP QA FULL SYSTEM VERIFICATION (MULTI-ROLE)');
  console.log('Target: Live Backend http://127.0.0.1:4000/api');
  console.log('Date: ' + new Date().toISOString());
  console.log('================================================================\n');

  let adminToken = '';
  let member1Token = '';
  let member2Token = '';

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: AUTHENTICATION & MULTI-ROLE RBAC ACCESS CONTROL
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('👉 SUITE 1: Authentication & RBAC Access Control');

  // 1.1 Admin Login
  try {
    const res = await request('POST', '/auth/login', {
      email: 'admin@connect.vn',
      password: '123456',
    });
    const ok = res.status === 200 && !!(res.data?.access_token || res.data?.token);
    adminToken = res.data?.access_token || res.data?.token || '';
    record('SUITE-1', 'Admin login (admin@connect.vn)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'Admin login (admin@connect.vn)', false, err.message);
  }

  // 1.2 Member 1 Login (vumikasa6@gmail.com)
  try {
    const res = await request('POST', '/auth/login', {
      email: 'vumikasa6@gmail.com',
      password: '123456',
    });
    const ok = res.status === 200 && !!(res.data?.access_token || res.data?.token);
    member1Token = res.data?.access_token || res.data?.token || '';
    record('SUITE-1', 'Member 1 login (vumikasa6@gmail.com)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'Member 1 login (vumikasa6@gmail.com)', false, err.message);
  }

  // 1.3 Member 2 Login (vupv090120@gmail.com)
  try {
    const res = await request('POST', '/auth/login', {
      email: 'vupv090120@gmail.com',
      password: '123456',
    });
    const ok = res.status === 200 && !!(res.data?.access_token || res.data?.token);
    member2Token = res.data?.access_token || res.data?.token || '';
    record('SUITE-1', 'Member 2 login (vupv090120@gmail.com)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'Member 2 login (vupv090120@gmail.com)', false, err.message);
  }

  // 1.4 Invalid Password Rejection
  try {
    const res = await request('POST', '/auth/login', {
      email: 'admin@connect.vn',
      password: 'wrong_password_999',
    });
    const ok = res.status === 401;
    record('SUITE-1', 'Invalid password rejection', ok, `Expected 401, got ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'Invalid password rejection', false, err.message);
  }

  // 1.5 RBAC Guard: Member calling Admin endpoint (Must be 403 Forbidden)
  try {
    const res = await request('GET', '/admin/transactions', null, member1Token);
    const ok = res.status === 403;
    record('SUITE-1', 'RBAC: Member calling /admin/transactions blocked with 403', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'RBAC: Member calling /admin/transactions blocked with 403', false, err.message);
  }

  // 1.6 RBAC Guard: Unauthenticated calling /users/me (Must be 401 Unauthorized)
  try {
    const res = await request('GET', '/users/me', null, null);
    const ok = res.status === 401;
    record('SUITE-1', 'RBAC: Unauthenticated calling /users/me blocked with 401', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'RBAC: Unauthenticated calling /users/me blocked with 401', false, err.message);
  }

  // 1.7 Admin calling /admin/permission-matrix (Must be 200 OK)
  try {
    const res = await request('GET', '/admin/permission-matrix', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-1', 'Admin authorized to query /admin/permission-matrix', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-1', 'Admin authorized to query /admin/permission-matrix', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: PROFILE & DIGITAL BUSINESS CARD
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 2: Profile & Digital Business Card');

  // 2.1 Fetch own profile for Member 1
  try {
    const res = await request('GET', '/users/me', null, member1Token);
    const ok = res.status === 200 && res.data?.email === 'vumikasa6@gmail.com';
    record('SUITE-2', 'Member 1 queries own profile (/users/me)', ok, `Name: ${res.data?.name}`);
  } catch (err) {
    record('SUITE-2', 'Member 1 queries own profile (/users/me)', false, err.message);
  }

  // 2.2 Fetch own profile for Member 2
  try {
    const res = await request('GET', '/users/me', null, member2Token);
    const ok = res.status === 200 && res.data?.email === 'vupv090120@gmail.com';
    record('SUITE-2', 'Member 2 queries own profile (/users/me)', ok, `Name: ${res.data?.name}`);
  } catch (err) {
    record('SUITE-2', 'Member 2 queries own profile (/users/me)', false, err.message);
  }

  // 2.3 Fetch own member details (/members/me)
  try {
    const res = await request('GET', '/members/me', null, member1Token);
    const ok = res.status === 200 && (res.data?.code === 'M1983-001' || res.data?.member?.code === 'M1983-001' || !!res.data?.id);
    record('SUITE-2', 'Member 1 queries own member record (/members/me)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-2', 'Member 1 queries own member record (/members/me)', false, err.message);
  }

  // 2.4 Digital Business Card settings (/business-cards/settings/me)
  try {
    const res = await request('GET', '/business-cards/settings/me', null, member1Token);
    const ok = res.status === 200 || res.status === 404; // 200 if created, 404 if not yet configured
    record('SUITE-2', 'Member 1 queries digital card settings (/business-cards/settings/me)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-2', 'Member 1 queries digital card settings (/business-cards/settings/me)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: MEMBER DIRECTORY & COMMITTEE ASSIGNMENT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 3: Member Directory & Committee Filtering');

  // 3.1 Fetch full member directory
  try {
    const res = await request('GET', '/members', null, member1Token);
    const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    const ok = res.status === 200 && items.length >= 3;
    record('SUITE-3', 'Member directory returns all 3 members (/members)', ok, `Count: ${items.length}`);
  } catch (err) {
    record('SUITE-3', 'Member directory returns all 3 members (/members)', false, err.message);
  }

  // 3.2 Fetch directory format (/members/directory)
  try {
    const res = await request('GET', '/members/directory', null, member2Token);
    const ok = res.status === 200;
    record('SUITE-3', 'Member directory endpoint (/members/directory)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-3', 'Member directory endpoint (/members/directory)', false, err.message);
  }

  // 3.3 Query Brand identity
  try {
    const res = await request('GET', '/members/brand', null, member1Token);
    const ok = res.status === 200;
    record('SUITE-3', 'Association Brand identity endpoint (/members/brand)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-3', 'Association Brand identity endpoint (/members/brand)', false, err.message);
  }

  // 3.4 Query Member Benefits
  try {
    const res = await request('GET', '/members/benefits', null, member2Token);
    const ok = res.status === 200;
    record('SUITE-3', 'Member Benefits endpoint (/members/benefits)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-3', 'Member Benefits endpoint (/members/benefits)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: FINANCIAL TRANSACTIONS & S07-DN CASH FLOW
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 4: Financial Transactions & Cash Flow');

  // 4.1 Admin creates Income transaction
  let txIncomeId = '';
  try {
    const res = await request('POST', '/admin/transactions', {
      type: 'income',
      category: 'Hội phí',
      amount: 2000000,
      description: 'Thu phí gia nhập hội viên 2026 - Vũ Minh Kas',
      method: 'bank',
      recipient: 'CLB Doanh Nhân CEO 1983',
    }, adminToken);
    const ok = (res.status === 200 || res.status === 201) && res.data?.success !== false;
    txIncomeId = res.data?.id || res.data?.code || 'TX-INC';
    record('SUITE-4', 'Admin creates Income transaction (2,000,000 VNĐ)', ok, `ID: ${txIncomeId}`);
  } catch (err) {
    record('SUITE-4', 'Admin creates Income transaction (2,000,000 VNĐ)', false, err.message);
  }

  // 4.2 Admin creates Expense transaction
  try {
    const res = await request('POST', '/admin/transactions', {
      type: 'expense',
      category: 'Hội nghị',
      amount: 500000,
      description: 'Chi phí teabreak & hoa quả phiên họp Ban Chấp Hành',
      method: 'cash',
      recipient: 'Gem Center',
    }, adminToken);
    const ok = (res.status === 200 || res.status === 201) && res.data?.success !== false;
    record('SUITE-4', 'Admin creates Expense transaction (500,000 VNĐ)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-4', 'Admin creates Expense transaction (500,000 VNĐ)', false, err.message);
  }

  // 4.3 List transactions
  try {
    const res = await request('GET', '/admin/transactions', null, adminToken);
    const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    const ok = res.status === 200 && items.length >= 2;
    record('SUITE-4', 'List transactions returns both income & expense', ok, `Count: ${items.length}`);
  } catch (err) {
    record('SUITE-4', 'List transactions returns both income & expense', false, err.message);
  }

  // 4.4 Member renewal quote
  try {
    const res = await request('GET', '/members/me/renewal-quote', null, member1Token);
    const ok = res.status === 200;
    record('SUITE-4', 'Member 1 queries renewal quote (/members/me/renewal-quote)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-4', 'Member 1 queries renewal quote (/members/me/renewal-quote)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: EVENT MANAGEMENT, TICKETING & QR REGISTRATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 5: Event Management & Ticketing Flow');

  let eventId = '';
  const evToken = Date.now().toString().slice(-4);
  const evDate = new Date(Date.now() + 86400000 * (15 + Math.floor(Math.random() * 50))).toISOString();
  // 5.1 Admin creates Event
  try {
    const res = await request('POST', '/events', {
      name: `Đại Hội Doanh Nhân CEO 1983 Gala #${evToken}`,
      tagline: 'Gắn kết Doanh nhân - Kiến tạo Tương lai',
      date: evDate,
      location: `Trung tâm Hội nghị Quốc Gia - Khán phòng Sapphire #${evToken}`,
      ticketPrice: 500000,
      capacity: 300,
      status: 'upcoming',
      type: 'forum',
    }, adminToken);
    const ok = (res.status === 200 || res.status === 201) && !!(res.data?.id || res.data?.event?.id);
    eventId = res.data?.id || res.data?.event?.id || '';
    if (!ok) console.log('DEBUG POST /events failed:', res.status, res.data);
    record('SUITE-5', 'Admin creates Event with ticket fee (500,000 VNĐ)', ok, `Event ID: ${eventId}`);
  } catch (err) {
    record('SUITE-5', 'Admin creates Event with ticket fee (500,000 VNĐ)', false, err.message);
  }

  // 5.2 Member 1 fetches event list
  try {
    const res = await request('GET', '/events', null, member1Token);
    const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    const ok = res.status === 200 && list.length >= 1;
    record('SUITE-5', 'Member 1 browses published events (/events)', ok, `Count: ${list.length}`);
  } catch (err) {
    record('SUITE-5', 'Member 1 browses published events (/events)', false, err.message);
  }

  // 5.3 Member 1 registers for Event
  let reg1Id = '';
  if (eventId) {
    try {
      const res = await request('POST', `/events/${eventId}/register`, {
        ticketCount: 1,
        notes: 'Đăng ký vé tham dự Gala',
      }, member1Token);
      const ok = (res.status === 200 || res.status === 201);
      reg1Id = res.data?.id || res.data?.registration?.id || 'REG-1';
      record('SUITE-5', 'Member 1 registers for event ticket', ok, `Reg: ${reg1Id}`);
    } catch (err) {
      record('SUITE-5', 'Member 1 registers for event ticket', false, err.message);
    }
  }

  // 5.4 Member 2 registers for Event
  if (eventId) {
    try {
      const res = await request('POST', `/events/${eventId}/register`, {
        ticketCount: 1,
        notes: 'Đăng ký vé tham dự Gala Member 2',
      }, member2Token);
      const ok = (res.status === 200 || res.status === 201);
      record('SUITE-5', 'Member 2 registers for event ticket', ok, `HTTP ${res.status}`);
    } catch (err) {
      record('SUITE-5', 'Member 2 registers for event ticket', false, err.message);
    }
  }

  // 5.5 Admin checks event registrations
  try {
    const res = await request('GET', '/events/registrations', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-5', 'Admin checks event registrations list (/events/registrations)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-5', 'Admin checks event registrations list (/events/registrations)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 6: QR SCANNER & EVENT CHECK-IN ENGINE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 6: QR Scanner & Check-in Verification');

  // 6.1 Check-in state
  try {
    const res = await request('GET', '/checkin/state', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-6', 'Admin checks check-in engine state (/checkin/state)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-6', 'Admin checks check-in engine state (/checkin/state)', false, err.message);
  }

  // 6.2 Check-in events list
  try {
    const res = await request('GET', '/checkin/qr-events', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-6', 'Check QR-supported check-in events (/checkin/qr-events)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-6', 'Check QR-supported check-in events (/checkin/qr-events)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 7: B2B OPPORTUNITIES & TRADE COLLABORATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 7: B2B Opportunities & Trade Collaboration');

  let oppId = '';
  // 7.1 Member 1 posts Opportunity
  try {
    const res = await request('POST', '/opportunities', {
      title: 'Tìm kiếm đối tác cung ứng giải pháp ERP khối sản xuất ' + Date.now().toString().slice(-4),
      dealValue: 500000000,
      stage: 'open',
      notes: 'Chúng tôi cần kết nối với doanh nghiệp hội viên có năng lực triển khai hệ thống ERP và IoT nhà máy.',
    }, member1Token);
    const ok = (res.status === 200 || res.status === 201) && !!res.data?.id;
    oppId = res.data?.id || '';
    record('SUITE-7', 'Member 1 posts B2B Opportunity', ok, `Opp ID: ${oppId}`);
  } catch (err) {
    record('SUITE-7', 'Member 1 posts B2B Opportunity', false, err.message);
  }

  // 7.2 Member 2 views opportunities feed
  try {
    const res = await request('GET', '/opportunities', null, member2Token);
    const items = Array.isArray(res.data) ? res.data : (res.data?.opportunities || res.data?.items || []);
    const ok = res.status === 200 && items.length >= 1;
    record('SUITE-7', 'Member 2 views B2B Opportunities feed', ok, `Count: ${items.length}`);
  } catch (err) {
    record('SUITE-7', 'Member 2 views B2B Opportunities feed', false, err.message);
  }

  // 7.3 Member 2 expresses interest in Member 1's opportunity
  if (oppId) {
    try {
      const res = await request('POST', `/opportunities/${oppId}/interests`, {
        message: 'Công ty chúng tôi rất quan tâm và muốn kết nối hợp tác trực tiếp!',
      }, member2Token);
      const ok = (res.status === 200 || res.status === 201);
      record('SUITE-7', 'Member 2 expresses interest in B2B Opportunity', ok, `HTTP ${res.status}`);
    } catch (err) {
      record('SUITE-7', 'Member 2 expresses interest in B2B Opportunity', false, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 8: MARKETPLACE & PRODUCT CATALOG
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 8: Marketplace & Product Catalog');

  let prodId = '';
  // 8.1 Member 1 posts product
  try {
    const res = await request('POST', '/marketplace/products', {
      title: 'Nền tảng Quản trị Doanh nghiệp ViConnect SaaS Enterprise',
      price: 25000000,
      category: 'Công nghệ & Chuyển đổi số',
      description: 'Hệ thống quản trị bán hàng, khách hàng CRM, nhân sự và kế toán tích hợp AI',
      status: 'active',
    }, member1Token);
    const ok = (res.status === 200 || res.status === 201) && !!(res.data?.id || res.data?.product?.id);
    prodId = res.data?.id || res.data?.product?.id || '';
    record('SUITE-8', 'Member 1 posts product to Marketplace', ok, `Product ID: ${prodId}`);
  } catch (err) {
    record('SUITE-8', 'Member 1 posts product to Marketplace', false, err.message);
  }

  // 8.2 Member 2 browses Marketplace
  try {
    const res = await request('GET', '/marketplace/products', null, member2Token);
    const items = Array.isArray(res.data) ? res.data : (res.data?.products || res.data?.items || []);
    const ok = res.status === 200 && items.length >= 1;
    record('SUITE-8', 'Member 2 browses Marketplace products', ok, `Count: ${items.length}`);
  } catch (err) {
    record('SUITE-8', 'Member 2 browses Marketplace products', false, err.message);
  }

  // 8.3 Member 2 creates Quote request
  try {
    const res = await request('POST', '/marketplace/quotes', {
      productId: prodId || 'prod-sample',
      quantity: 1,
      notes: 'Xin báo giá gói triển khai 50 người dùng cho công ty',
    }, member2Token);
    const ok = (res.status === 200 || res.status === 201);
    record('SUITE-8', 'Member 2 requests Quote on Marketplace', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-8', 'Member 2 requests Quote on Marketplace', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 9: 1-ON-1 BUSINESS MEETINGS (SAPPHIRE HUB)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 9: 1-on-1 Business Meetings & Networking');

  // 9.1 Member 1 schedules meeting with Member 2
  let meetingId = '';
  try {
    const res = await request('POST', '/meetings', {
      title: 'Gặp gỡ trao đổi hợp tác cung ứng giải pháp chuyển đổi số',
      hostName: 'Vũ Minh Kas',
      partnerName: 'Vũ Phương',
      partnerCompany: 'Công ty Đầu tư & XTTM',
      location: 'Phòng VIP Sapphire Hub - Trụ sở CLB CEO 1983',
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      time: '14:30',
      venueType: 'offline',
    }, member1Token);
    const ok = (res.status === 200 || res.status === 201) && !!res.data?.id;
    meetingId = res.data?.id || '';
    record('SUITE-9', 'Member 1 schedules 1-on-1 meeting with Member 2', ok, `Meeting ID: ${meetingId}`);
  } catch (err) {
    record('SUITE-9', 'Member 1 schedules 1-on-1 meeting with Member 2', false, err.message);
  }

  // 9.2 Member 2 retrieves meetings
  try {
    const res = await request('GET', '/meetings', null, member2Token);
    const ok = res.status === 200;
    record('SUITE-9', 'Member 2 retrieves 1-on-1 meetings list (/meetings)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-9', 'Member 2 retrieves 1-on-1 meetings list (/meetings)', false, err.message);
  }

  // 9.3 Member 2 retrieves connection appointments
  try {
    const res = await request('GET', '/meetings/connection-appointments', null, member2Token);
    const ok = res.status === 200;
    record('SUITE-9', 'Member 2 retrieves Connection Appointments', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-9', 'Member 2 retrieves Connection Appointments', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 10: OMNICHANNEL FEEDS & NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 10: Omnichannel Feeds & Notifications');

  let postId = '';
  // 10.1 Admin creates official post/news
  try {
    const res = await request('POST', '/feed', {
      title: 'Thông báo chính thức từ Ban Chấp Hành CLB Doanh Nhân CEO 1983',
      content: 'Chào mừng Quý Doanh nhân CEO 1983 tham gia phiên kết nối giao thương trực tuyến!',
      category: 'announcement',
    }, adminToken);
    const ok = (res.status === 200 || res.status === 201) && !!(res.data?.id || res.data?.post?.id);
    postId = res.data?.post?.id || res.data?.id || '';
    record('SUITE-10', 'Admin creates official Feed announcement', ok, `Post ID: ${postId}`);
  } catch (err) {
    record('SUITE-10', 'Admin creates official Feed announcement', false, err.message);
  }

  // 10.2 Member 1 fetches Feed
  try {
    const res = await request('GET', '/feed', null, member1Token);
    const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    const ok = res.status === 200 && items.length >= 1;
    record('SUITE-10', 'Member 1 reads Feed posts (/feed)', ok, `Count: ${items.length}`);
  } catch (err) {
    record('SUITE-10', 'Member 1 reads Feed posts (/feed)', false, err.message);
  }

  // 10.3 Member 1 likes post
  if (postId) {
    try {
      const res = await request('POST', `/feed/${postId}/like`, {}, member1Token);
      const ok = res.status === 200 || res.status === 201;
      record('SUITE-10', 'Member 1 likes post (/feed/:id/like)', ok, `HTTP ${res.status}`);
    } catch (err) {
      record('SUITE-10', 'Member 1 likes post (/feed/:id/like)', false, err.message);
    }
  }

  // 10.4 Member 2 comments on post
  if (postId) {
    try {
      const res = await request('POST', `/feed/${postId}/comments`, {
        content: 'CLB Doanh Nhân CEO 1983 - Gắn kết và phát triển!',
      }, member2Token);
      const ok = res.status === 200 || res.status === 201;
      record('SUITE-10', 'Member 2 comments on post (/feed/:id/comments)', ok, `HTTP ${res.status}`);
    } catch (err) {
      record('SUITE-10', 'Member 2 comments on post (/feed/:id/comments)', false, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 11: VOTING, POLLS & LUCKY DRAW
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 11: Voting, Polls & Lucky Draw');

  let pollId = '';
  // 11.1 Admin creates Poll
  try {
    const res = await request('POST', '/voting/polls', {
      title: 'Khảo sát địa điểm tổ chức Caravan Doanh Nhân Mùa Thu 2026',
      description: 'Lấy ý kiến biểu quyết toàn thể Hội viên',
      options: ['Hạ Long - Quảng Ninh', 'Sapa - Lào Cai', 'Đà Lạt - Lâm Đồng'],
    }, adminToken);
    const ok = (res.status === 200 || res.status === 201) && !!res.data?.id;
    pollId = res.data?.id || '';
    record('SUITE-11', 'Admin creates Poll (/voting/polls)', ok, `Poll ID: ${pollId}`);
  } catch (err) {
    record('SUITE-11', 'Admin creates Poll (/voting/polls)', false, err.message);
  }

  // 11.2 Member 1 lists Polls
  try {
    const res = await request('GET', '/voting/polls', null, member1Token);
    const ok = res.status === 200;
    record('SUITE-11', 'Member 1 lists active Polls', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-11', 'Member 1 lists active Polls', false, err.message);
  }

  // 11.3 Lucky Draw Notification Trigger
  try {
    const res = await request('POST', '/voting/lucky-draw/notify', {
      winnerName: 'Vũ Minh Kas',
      prizeName: 'Kỷ niệm chương Doanh nhân Xuất sắc 1983',
    }, adminToken);
    const ok = (res.status === 200 || res.status === 201);
    record('SUITE-11', 'Admin triggers Lucky Draw winner notification', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-11', 'Admin triggers Lucky Draw winner notification', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 12: ZALO OA & EMAIL GATEWAYS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 12: Zalo OA & Email Gateways');

  // 12.1 Zalo OA Webhook verification
  try {
    const res = await request('GET', '/zalo/webhook');
    const ok = res.status === 200 && res.data?.status === 'active';
    record('SUITE-12', 'Zalo OA Webhook verification endpoint (/zalo/webhook)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-12', 'Zalo OA Webhook verification endpoint (/zalo/webhook)', false, err.message);
  }

  // 12.2 Zalo OA Configuration check
  try {
    const res = await request('GET', '/zalo/oa-config', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-12', 'Zalo OA Config inspection (/zalo/oa-config)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-12', 'Zalo OA Config inspection (/zalo/oa-config)', false, err.message);
  }

  // 12.3 Zalo Templates
  try {
    const res = await request('GET', '/zalo/templates');
    const ok = res.status === 200;
    record('SUITE-12', 'Zalo Saved Templates (/zalo/templates)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-12', 'Zalo Saved Templates (/zalo/templates)', false, err.message);
  }

  // 12.4 Email Templates
  try {
    const res = await request('GET', '/mail/templates', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-12', 'Email Templates inspection (/mail/templates)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-12', 'Email Templates inspection (/mail/templates)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 13: WEB CRM LANDING WEBS & SYSTEM INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 13: Web CRM Landing Webs & System Integrity');

  // 13.1 Admin Landing Webs
  try {
    const res = await request('GET', '/admin/landing-webs', null, adminToken);
    const ok = res.status === 200;
    record('SUITE-13', 'Admin Landing Webs list (/admin/landing-webs)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-13', 'Admin Landing Webs list (/admin/landing-webs)', false, err.message);
  }

  // 13.2 Member Active Association ID
  try {
    const res = await request('GET', '/members/active-association-id', null, member1Token);
    const ok = res.status === 200;
    record('SUITE-13', 'Active Association ID query (/members/active-association-id)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-13', 'Active Association ID query (/members/active-association-id)', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 14: USER LOGOUT & TOKEN REVOCATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n👉 SUITE 14: Logout & Token Revocation');

  // 14.1 Member 1 logs out
  try {
    const res = await request('POST', '/auth/logout', {}, member1Token);
    const ok = res.status === 200;
    record('SUITE-14', 'Member 1 logs out (/auth/logout)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-14', 'Member 1 logs out (/auth/logout)', false, err.message);
  }

  // 14.2 Member 2 logs out
  try {
    const res = await request('POST', '/auth/logout', {}, member2Token);
    const ok = res.status === 200;
    record('SUITE-14', 'Member 2 logs out (/auth/logout)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-14', 'Member 2 logs out (/auth/logout)', false, err.message);
  }

  // 14.3 Admin logs out
  try {
    const res = await request('POST', '/auth/logout', {}, adminToken);
    const ok = res.status === 200;
    record('SUITE-14', 'Admin logs out (/auth/logout)', ok, `HTTP ${res.status}`);
  } catch (err) {
    record('SUITE-14', 'Admin logs out (/auth/logout)', false, err.message);
  }

  // SUMMARY
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n================================================================');
  console.log(`📊 FINAL TEST REPORT: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  if (failed > 0) {
    console.log(`❌ Failed tests: ${failed}`);
    results.filter(r => !r.passed).forEach(r => console.log(`   - [${r.suite}] ${r.testName}: ${r.details}`));
  } else {
    console.log('🎉 100% OF ALL MAIN & SUB FLOWS PASSED FLAWLESSLY!');
  }
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
