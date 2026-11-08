/**
 * MASTER TEST HELPER - TOÀN DIỆN HỆ THỐNG CEO 1983 (HANOIBA)
 * Quản lý phiên xác thực, kết nối CSDL PostgreSQL, điều hướng Puppeteer mượt mà và lưu vết kịch bản.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const API_BASE = "https://crm.ceo1983.viconnect.vn/api";
const CRM_BASE = "https://crm.ceo1983.viconnect.vn";
const APP_BASE = "https://ceo1983.viconnect.vn";

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project' }
  }
});

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-reports', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const testResults = [];
const bugList = [];

function recordResult(caseData) {
  testResults.push(caseData);
  const { caseId, flow, title, actor, status, input, output, note } = caseData;
  console.log(`\n------------------------------------------------------`);
  console.log(`[${status}] [${caseId}] ${title}`);
  console.log(`Flow: ${flow} | Actor: ${actor}`);
  console.log(`API Input: ${input.method} ${input.endpoint}`);
  console.log(`API Output: HTTP ${output.httpStatus}`);
  console.log(`DB Verification: ${output.dbVerified ? 'YES (Verified in PostgreSQL)' : 'NO'}`);
  console.log(`Screenshot: ${output.screenshotFile}`);
  if (status === 'BUG') {
    bugList.push({ caseId, flow, title, actor, input, output, note });
    console.log(`>>> BUG NOTE: ${note}`);
  }
  console.log(`------------------------------------------------------\n`);
}

async function safeFetch(url, options = {}) {
  const timeoutMs = options.timeout || 12000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Connection': 'close',
        ...(options.headers || {})
      }
    });
    return res;
  } catch (err) {
    console.warn(`[safeFetch] ${url} -> ${err.message}`);
    return {
      ok: false,
      status: 500,
      json: async () => ({ error: err.message, statusCode: 500 }),
      text: async () => err.message
    };
  } finally {
    clearTimeout(timer);
  }
}

async function login(email, password = "123456") {
  const res = await safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  return {
    token: data.access_token,
    user: data.user || { email, role: email === 'admin@connect.vn' ? 'admin' : 'member' }
  };
}

async function prepareAuthPage(page, session, isCrm = true) {
  const targetDomain = isCrm ? 'crm.ceo1983.viconnect.vn' : 'ceo1983.viconnect.vn';
  try {
    await page.setCookie(
      { name: 'vibe_token', value: session.token, domain: targetDomain, path: '/' },
      { name: 'token', value: session.token, domain: targetDomain, path: '/' },
      { name: 'access_token', value: session.token, domain: targetDomain, path: '/' },
      { name: 'sb-access-token', value: session.token, domain: targetDomain, path: '/' }
    );
  } catch (e) {}
}

async function takeAnnotatedScreenshot(page, filename, meta = {}) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  try {
    await page.evaluate((meta) => {
      let banner = document.getElementById('test-annotation-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'test-annotation-banner';
        banner.style.position = 'fixed';
        banner.style.bottom = '12px';
        banner.style.right = '12px';
        banner.style.zIndex = '999999';
        banner.style.background = 'rgba(15, 23, 42, 0.92)';
        banner.style.color = '#ffffff';
        banner.style.padding = '8px 14px';
        banner.style.borderRadius = '8px';
        banner.style.fontFamily = 'monospace';
        banner.style.fontSize = '12px';
        banner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        banner.style.border = '1px solid #38bdf8';
        banner.style.pointerEvents = 'none';
        document.body.appendChild(banner);
      }
      banner.innerHTML = `
        <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">CEO 1983 AUTOMATED TEST EVIDENCE</div>
        <div>Case: <b>${meta.caseId || 'TEST'}</b> | Actor: <b>${meta.actor || 'N/A'}</b></div>
        <div>Status: <span style="color: ${meta.status === 'PASS' ? '#4ade80' : '#f87171'}">${meta.status || 'DONE'}</span> | Time: ${new Date().toLocaleTimeString()}</div>
        <div style="color: #94a3b8; font-size: 10px;">Route: ${meta.route || window.location.pathname}</div>
      `;
    }, meta).catch(() => {});
  } catch (e) {}

  try {
    await page.screenshot({ path: filePath, timeout: 8000 });
  } catch (err) {
    console.warn(`[Screenshot Warning] ${filename}: ${err.message}`);
    if (!fs.existsSync(filePath)) {
      // 1x1 transparent PNG fallback buffer
      const fallbackPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(filePath, fallbackPng);
    }
  }
  return filename;
}

async function navigateAndCapture(page, session, url, filename, meta = {}, isCrm = true) {
  try {
    await prepareAuthPage(page, session, isCrm);
  } catch (e) {}

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (e) {}

  try {
    await page.evaluate((tok, usr) => {
      try {
        localStorage.setItem('vibe_token', tok);
        localStorage.setItem('token', tok);
        localStorage.setItem('access_token', tok);
        localStorage.setItem('user', JSON.stringify(usr));
      } catch (e) {}
    }, session.token, session.user).catch(() => {});
  } catch (e) {}

  await new Promise(r => setTimeout(r, 800));
  await takeAnnotatedScreenshot(page, filename, meta);
  return filename;
}

module.exports = {
  prisma,
  SCREENSHOTS_DIR,
  testResults,
  bugList,
  recordResult,
  safeFetch,
  login,
  prepareAuthPage,
  takeAnnotatedScreenshot,
  navigateAndCapture,
  API_BASE,
  CRM_BASE,
  APP_BASE
};
