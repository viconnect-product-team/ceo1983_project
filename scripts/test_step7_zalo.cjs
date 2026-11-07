const API_BASE = "https://crm.ceo1983.viconnect.vn/api";

async function login(email, password = "123456") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password })
  });
  const data = await res.json();
  return data.access_token;
}

async function run() {
  const adminToken = await login("admin@connect.vn");

  console.log("--- TESTING ZNS SENDING TO 0973924819 ---");
  const znsPayload = {
    templateId: "328919",
    phone: "0973924819",
    templateData: {
      event_name: "Hội Thảo Giao Thương & Chuyển Đổi Số CEO 1983 (Miễn Phí)",
      customer_name: "Phạm Văn Vũ",
      event_date: "12/11/2026",
      event_location: "Cung Tri Thức Thành Phố, Cầu Giấy, Hà Nội"
    },
    accessToken: "zalo_oa_official_token"
  };

  const res = await fetch(`${API_BASE}/zalo/send-zns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(znsPayload)
  });

  const resData = await res.json();
  console.log("ZNS Response Status:", res.status);
  console.log("ZNS Response Body:", JSON.stringify(resData, null, 2));

  console.log("\n--- TESTING BINDING ZALO UID FOR 0973924819 & RETRYING ---");
  const bindRes = await fetch(`${API_BASE}/zalo/bind-uid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      phone: "0973924819",
      zaloUid: "zalo_uid_0973924819",
      name: "Phạm Văn Vũ"
    })
  });
  console.log("Bind UID status:", bindRes.status, await bindRes.json());

  const retrySend = await fetch(`${API_BASE}/zalo/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      accessToken: "zalo_oa_official_token",
      targetPhone: "0973924819",
      targetName: "Phạm Văn Vũ",
      message: "[CEO 1983 - THÔNG BÁO SỰ KIỆN MỚI]\nKính gửi Anh Phạm Văn Vũ,\nSự kiện 'Hội Thảo Giao Thương & Chuyển Đổi Số CEO 1983 (Miễn Phí)' đã được tạo thành công!"
    })
  });
  console.log("Retry Send Message status:", retrySend.status, await retrySend.json());
}

run().catch(console.error);
