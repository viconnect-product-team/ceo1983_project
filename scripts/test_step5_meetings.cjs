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

  console.log("--- 1. CREATING ONLINE MEETING ---");
  const onlinePayload = {
    title: "Họp Giao Ban Ban Điều Hành CEO 1983 - Trực Tuyến Hàng Tuần",
    hostName: "Lê Thị Dung (Chủ tịch CLB)",
    partnerName: "Phạm Văn Vũ & Vũ Phạm",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: "09:00 - 10:30",
    venueType: "online",
    venue: "Google Meet: https://meet.google.com/ceo-1983-meet",
    notes: "Đánh giá tiến độ xúc tiến giao thương Q4/2026 và chuẩn bị Gala Doanh Nhân.",
    participantIds: [
      "c65f9ffe-64aa-4145-a06e-89fda579024d", // vumikasa6@gmail.com
      "a59c1ee6-2ec1-4d8c-9ff0-3eb8bcc118fd"  // vupv090120@gmail.com
    ]
  };

  const resOnline = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(onlinePayload)
  });
  console.log("Online Meeting Status:", resOnline.status, "Response:", await resOnline.json());

  console.log("\n--- 2. CREATING OFFLINE MEETING ---");
  const offlinePayload = {
    title: "Họp Xúc Tiến Giao Thương & Cafe Doanh Nhân CEO 1983 (Trực Tiếp)",
    hostName: "Ban Xúc Tiến Thương Mại CEO 1983",
    partnerName: "Đoàn Doanh Nghiệp ViConnect & Đối Tác",
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: "14:00 - 16:30",
    venueType: "offline",
    venue: "Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội",
    notes: "Ký kết thỏa thuận hợp tác thương mại và tham quan mô hình doanh nghiệp.",
    participantIds: [
      "c65f9ffe-64aa-4145-a06e-89fda579024d",
      "a59c1ee6-2ec1-4d8c-9ff0-3eb8bcc118fd"
    ]
  };

  const resOffline = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(offlinePayload)
  });
  console.log("Offline Meeting Status:", resOffline.status, "Response:", await resOffline.json());

  console.log("\n--- 3. CHECKING MEETINGS ON CRM ---");
  const listRes = await fetch(`${API_BASE}/meetings`, {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  const list = await listRes.json();
  console.log("Total meetings in system:", Array.isArray(list) ? list.length : list);
}

run().catch(console.error);

