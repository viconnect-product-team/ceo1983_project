const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const API_BASE = "https://crm.ceo1983.viconnect.vn/api";

async function getAuthSession(email, password = "123456") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Login failed: " + JSON.stringify(data));
  return { token: data.access_token, user: data.user || { email, role: 'admin' } };
}

async function setAuthOnPage(page, session) {
  await page.evaluateOnNewDocument((token, user) => {
    localStorage.setItem("vibe_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("access_token", token);
    localStorage.setItem("vibe_user", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("crm_user", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("sb-wutbrzvqyyegkthtzgcd-auth-token", JSON.stringify({
      access_token: token,
      user: { id: user.id || "00000000-0000-4000-8000-000000000002", email: user.email }
    }));
  }, session.token, session.user);
}

async function test() {
  const session = await getAuthSession("admin@connect.vn");
  console.log("Logged in admin token acquired.");

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await setAuthOnPage(page, session);

    console.log("Navigating to CRM Events page: https://crm.ceo1983.viconnect.vn/events");
    await page.goto("https://crm.ceo1983.viconnect.vn/events", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const shotPath = path.join(__dirname, "..", "test-reports", "screenshots", "test_crm_events.png");
    await page.screenshot({ path: shotPath });
    console.log("Screenshot saved:", shotPath);

    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await setAuthOnPage(mobilePage, session);

    console.log("Navigating to Mobile App Events page: https://ceo1983.viconnect.vn/association/events");
    await mobilePage.goto("https://ceo1983.viconnect.vn/association/events", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const mobileShot = path.join(__dirname, "..", "test-reports", "screenshots", "test_app_events.png");
    await mobilePage.screenshot({ path: mobileShot });
    console.log("Mobile Screenshot saved:", mobileShot);

  } finally {
    await browser.close();
  }
}

test().catch(console.error);

