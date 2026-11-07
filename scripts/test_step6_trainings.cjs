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

  console.log("--- 1. CREATING ONLINE TRAINING ---");
  const onlineTraining = {
    title: "Chương Trình Đào Tạo Quản Trị Tài Chính Doanh Nghiệp Tinh Gọn (Online Zoom)",
    tagline: "Chiến lược quản trị dòng tiền và tối ưu bảng cân đối kế toán",
    instructorName: "TS. Nguyễn Hoàng Long",
    instructorTitle: "Viện Trưởng Viện Doanh Trí",
    instructorCompany: "Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)",
    description: "Khóa học trực tuyến 4 buổi hướng dẫn chủ doanh nghiệp cách phân tích báo cáo tài chính, quản trị rủi ro nợ và tối ưu vốn lưu động.",
    category: "Tài chính & Quản trị",
    format: "online",
    roomUrl: "https://zoom.us/j/198320261983",
    videoProvider: "zoom",
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
    maxAttendees: 100,
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"
  };

  const resOnline = await fetch(`${API_BASE}/trainings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(onlineTraining)
  });
  const createdOnline = await resOnline.json();
  console.log("Online Training Status:", resOnline.status, "ID:", createdOnline.id);

  console.log("\n--- 2. CREATING OFFLINE TRAINING ---");
  const offlineTraining = {
    title: "Chương Trình Đào Tạo Kỹ Năng Đàm Phán & Chốt Hợp Đồng Triệu Đô B2B (Offline Workshop)",
    tagline: "Nghệ thuật thương thuyết thực chiến giữa các chủ tịch tập đoàn",
    instructorName: "ThS. Đỗ Minh Đức",
    instructorTitle: "Trưởng Ban Đào Tạo & Phát Triển Doanh Trí",
    instructorCompany: "CLB Doanh Nhân CEO 1983",
    description: "Workshop thực chiến 1 ngày trọn vẹn tại Hà Nội, thực hành tình huống đàm phán hợp đồng lớn, xử lý từ chối và bảo vệ biên lợi nhuận.",
    category: "Kỹ năng Lãnh đạo",
    format: "offline",
    location: "Khách sạn Daewoo Hà Nội, 360 Kim Mã, Ba Đình, Hà Nội",
    startTime: new Date(Date.now() + 86400000 * 6).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 6 + 28800000).toISOString(),
    maxAttendees: 50,
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800"
  };

  const resOffline = await fetch(`${API_BASE}/trainings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(offlineTraining)
  });
  const createdOffline = await resOffline.json();
  console.log("Offline Training Status:", resOffline.status, "ID:", createdOffline.id);

  const onlineId = createdOnline.id;
  const offlineId = createdOffline.id;

  console.log("\n--- 3. MEMBER vupv090120@gmail.com JOINING TRAINING ---");
  const vupvToken = await login("vupv090120@gmail.com");
  const joinOnlineRes = await fetch(`${API_BASE}/trainings/${onlineId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vupvToken}`
    },
    body: JSON.stringify({})
  });
  console.log("Join Online Training Status:", joinOnlineRes.status, await joinOnlineRes.json());

  const joinOfflineRes = await fetch(`${API_BASE}/trainings/${offlineId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vupvToken}`
    },
    body: JSON.stringify({})
  });
  console.log("Join Offline Training Status:", joinOfflineRes.status, await joinOfflineRes.json());
}

run().catch(console.error);

