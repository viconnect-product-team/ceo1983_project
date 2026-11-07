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
  const vumikasaToken = await login("vumikasa6@gmail.com");
  const vupvToken = await login("vupv090120@gmail.com");

  console.log("--- 1. SENDING DIRECT MESSAGE (CHAT) ---");
  const dmRes = await fetch(`${API_BASE}/dm/member/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vumikasaToken}`
    },
    body: JSON.stringify({
      recipientUserId: "a59c1ee6-2ec1-4d8c-9ff0-3eb8bcc118fd", // vupv090120@gmail.com
      content: "Chào Anh Vũ, chúc mừng Anh đã tham gia mạng lưới kết nối giao thương CLB Doanh Nhân CEO 1983!"
    })
  });
  console.log("Send DM Status:", dmRes.status, await dmRes.json());

  console.log("\n--- 2. SENDING B2B CONNECTION REQUEST ---");
  const connRes = await fetch(`${API_BASE}/network/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vupvToken}`
    },
    body: JSON.stringify({
      targetUserId: "c65f9ffe-64aa-4145-a06e-89fda579024d", // vumikasa6@gmail.com
      note: "Rất vinh hạnh được kết nối đồng niên và mở rộng hợp tác kinh doanh cùng Anh!"
    })
  });
  console.log("Connection Request Status:", connRes.status, await connRes.json());

  console.log("\n--- 3. UPDATING USER PROFILE ---");
  const profileRes = await fetch(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vupvToken}`
    },
    body: JSON.stringify({
      displayName: "Vũ Phạm (Doanh Nhân)",
      companyName: "Công ty TNHH Giải Pháp Công Nghệ ViConnect",
      professionalTitle: "Tổng Giám Đốc Điều Hành",
      bio: "Đồng niên Quý Hợi 1983 - Tiên phong ứng dụng công nghệ số vào chuyển đổi mô hình kinh doanh và kết nối xúc tiến giao thương nội khối."
    })
  });
  console.log("Update Profile Status:", profileRes.status, await profileRes.json());

  console.log("\n--- 4. POSTING TO COMMUNITY FEED ---");
  const feedRes = await fetch(`${API_BASE}/feed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vumikasaToken}`
    },
    body: JSON.stringify({
      content: "Chúc mừng phiên kết nối giao thương B2B tháng 11 của CLB Doanh Nhân CEO 1983 đã diễn ra vô cùng thành công với hơn 20 lượt kết nối hợp tác mới! Chúc các doanh nghiệp đồng niên bứt phá doanh số cuối năm! 🚀🎉",
      images: ["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"],
      audience: "public"
    })
  });
  console.log("Create Feed Post Status:", feedRes.status, await feedRes.json());
}

run().catch(console.error);

