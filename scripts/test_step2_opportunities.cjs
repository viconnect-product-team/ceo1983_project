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
  console.log("--- 1. CREATING OPPORTUNITY BY vumikasa6@gmail.com ---");
  const vumikasaToken = await login("vumikasa6@gmail.com");

  const oppPayload = {
    title: "Tìm Đối Tác Cung Ứng Thiết Bị Công Nghệ Cho Dự Án ViConnect 2026",
    description: "Cần tìm nhà cung ứng thiết bị mạng, máy chủ và giải pháp bảo mật hạ tầng cho hệ thống 5 chi nhánh tại Hà Nội và TP.HCM.",
    industry: "Công nghệ thông tin & Viễn thông",
    value: 200000000,
    expectedRevenue: 200000000,
    type: "need", // Cần mua / Hợp tác
    target: "Đối tác công nghệ",
    referrerName: "Lê Thị Dung (Chủ tịch CLB CEO 1983)",
    status: "open"
  };

  const createRes = await fetch(`${API_BASE}/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vumikasaToken}`
    },
    body: JSON.stringify(oppPayload)
  });
  console.log("Create Opp Status:", createRes.status);
  const createdOpp = await createRes.json();
  console.log("Created Opp:", createdOpp);

  const oppId = createdOpp.id || createdOpp.data?.id;

  console.log("\n--- 2. vupv090120@gmail.com EXPRESSING INTEREST IN THE OPPORTUNITY ---");
  const vupvToken = await login("vupv090120@gmail.com");
  const interestRes = await fetch(`${API_BASE}/opportunities/${oppId}/interests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vupvToken}`
    },
    body: JSON.stringify({
      message: "Chào Anh Vũ, bên em là ViConnect Tech chuyên cung cấp giải pháp máy chủ và hạ tầng mạng, rất mong được kết nối gặp mặt B2B để trao đổi cụ thể!"
    })
  });
  console.log("Interest Status:", interestRes.status);
  console.log("Interest Response:", await interestRes.json());

  console.log("\n--- 3. vumikasa6@gmail.com VIEWING WHO IS INTERESTED ---");
  const viewInterestsRes = await fetch(`${API_BASE}/opportunities/${oppId}/interests`, {
    headers: { "Authorization": `Bearer ${vumikasaToken}` }
  });
  console.log("View Interests Status:", viewInterestsRes.status);
  const interestsList = await viewInterestsRes.json();
  console.log("Interests List:", JSON.stringify(interestsList, null, 2));

  console.log("\n--- 4. EDITING OPPORTUNITY ---");
  const editRes = await fetch(`${API_BASE}/opportunities/${oppId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vumikasaToken}`
    },
    body: JSON.stringify({
      title: "Tìm Đối Tác Cung Ứng Thiết Bị Công Nghệ Cho Dự Án ViConnect 2026 [ĐÃ CẬP NHẬT GIAO THƯƠNG]",
      value: 250000000
    })
  });
  console.log("Edit Status:", editRes.status);
  console.log("Edit Response:", await editRes.json());

  console.log("\n--- 5. CREATING SECOND OPPORTUNITY BY ADMIN ON CRM ---");
  const adminToken = await login("admin@connect.vn");
  const adminOppRes = await fetch(`${API_BASE}/opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: "Cơ Hội Xuất Khẩu Nông Sản Sạch Sang Thị Trường Châu Âu",
      description: "Ban Xúc tiến Giao thương CEO 1983 kết nối đầu mối thu mua nông sản tiêu chuẩn GlobalGAP xuất khẩu.",
      industry: "Nông nghiệp & Xuất nhập khẩu",
      value: 500000000,
      type: "offer",
      status: "open"
    })
  });
  console.log("Admin Opp Status:", adminOppRes.status);
  console.log("Admin Opp Response:", await adminOppRes.json());
}

run().catch(console.error);

