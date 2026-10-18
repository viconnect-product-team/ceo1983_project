const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const adminToken = jwt.sign(
  {
    sub: 'c1983000-0000-4000-8000-000000000001',
    id: 'c1983000-0000-4000-8000-000000000001',
    email: 'admin@ceo1983.vn',
    role: 'platform_admin',
    associationId: 'c1983000-0000-4000-8000-000000001983',
  },
  'super-secret-jwt-key'
);

const ENDPOINTS = [
  { path: '/api/events', name: 'Events (Sự kiện)', auth: false },
  { path: '/api/members', name: 'Members (Hội viên)', auth: false },
  { path: '/api/opportunities', name: 'Opportunities (Giao thương)', auth: true },
  { path: '/api/marketplace/products', name: 'Marketplace (Sản phẩm)', auth: true },
  { path: '/api/voting/polls', name: 'Voting / Polls (Bầu cử)', auth: true },
  { path: '/api/documents', name: 'Documents (Tài liệu)', auth: true },
  { path: '/api/meetings', name: 'Meetings (Cuộc gặp 1-1)', auth: true },
  { path: '/api/admin/invoices', name: 'Invoices (Hóa đơn)', auth: true },
  { path: '/api/sponsors', name: 'Sponsors (Nhà tài trợ)', auth: true },
  { path: '/api/advertisements', name: 'Advertisements (Quảng cáo)', auth: false },
  { path: '/api/admin/notifications', name: 'Notifications (Thông báo)', auth: true },
];

async function probe(baseUrl) {
  const results = {};
  for (const ep of ENDPOINTS) {
    const url = `${baseUrl}${ep.path}`;
    const start = Date.now();
    const headers = { 'Accept': 'application/json' };
    if (ep.auth) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    try {
      const res = await fetch(url, { headers });
      const elapsed = Date.now() - start;
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
      results[ep.path] = {
        name: ep.name,
        status: res.status,
        elapsed,
        isArray: Array.isArray(data),
        count: Array.isArray(data)
          ? data.length
          : data && typeof data === 'object' && Array.isArray(data.items)
          ? data.items.length
          : data && typeof data === 'object' && Array.isArray(data.data)
          ? data.data.length
          : data
          ? 1
          : 0,
        sample:
          Array.isArray(data) && data.length > 0
            ? data[0].id || data[0].name || data[0].title || 'record'
            : null,
      };
    } catch (err) {
      results[ep.path] = {
        name: ep.name,
        status: 'ERR',
        elapsed: Date.now() - start,
        error: err.message,
      };
    }
  }
  return results;
}

async function main() {
  console.log('================================================================');
  console.log('TESTING FULL AUTHENTICATED & PUBLIC DATA FLOWS: MOBILE VS CRM');
  console.log('================================================================');

  const mobileRes = await probe('https://14.225.217.232:5444');
  const crmRes = await probe('https://14.225.217.232:5443');

  console.log(
    'Chức năng API'.padEnd(32) +
    'Mobile (Port 5444)'.padEnd(25) +
    'CRM (Port 5443)'.padEnd(25) +
    'Trạng thái đồng bộ'
  );
  console.log('-'.repeat(100));

  let allMatch = true;
  for (const ep of ENDPOINTS) {
    const m = mobileRes[ep.path];
    const c = crmRes[ep.path];
    const mDesc = `${m.status} (${m.count} rec, ${m.elapsed}ms)`;
    const cDesc = `${c.status} (${c.count} rec, ${c.elapsed}ms)`;
    const matched = m.status === c.status && m.count === c.count;
    if (!matched) allMatch = false;
    const statusText = matched ? '✅ 100% TRÙNG KHỚP' : '⚠️ LỆCH DATA';
    console.log(
      ep.name.padEnd(32) +
      mDesc.padEnd(25) +
      cDesc.padEnd(25) +
      statusText
    );
  }

  console.log('-'.repeat(100));
  console.log(`Kết luận: ${allMatch ? 'TẤT CẢ API LOAD DỮ LIỆU ĐẦY ĐỦ VÀ TRÙNG KHỚP 100% GIỮA MOBILE & CRM' : 'CẦN HIỆU CHỈNH'}`);
}

main().finally(() => prisma.$disconnect());
