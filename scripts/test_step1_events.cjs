const API_BASE = "https://crm.ceo1983.viconnect.vn/api";

async function login(email, password = "123456") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function run() {
  console.log("--- 1. LOGGING IN AS ADMIN ---");
  const adminToken = await login("admin@connect.vn");
  console.log("Admin token acquired.");

  console.log("\n--- 2. CREATING FREE EVENT ---");
  const freeEventPayload = {
    name: "Hội Thảo Giao Thương & Chuyển Đổi Số CEO 1983 (Miễn Phí)",
    tagline: "Gắn kết đồng niên - Nâng tầm doanh nghiệp thực chiến",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: "Hội trường Cung Tri Thức Thành Phố, Cầu Giấy, Hà Nội",
    capacity: 200,
    type: "networking",
    status: "upcoming",
    ticketPrice: 0,
    fee: 0,
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
  };

  const freeEventRes = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(freeEventPayload)
  });
  const freeEvent = await freeEventRes.json();
  console.log("Free Event Created. Status:", freeEventRes.status, "ID:", freeEvent.id || freeEvent.event?.id);

  console.log("\n--- 3. CREATING PAID EVENT ---");
  const paidEventPayload = {
    name: "Gala Dinner Kết Nối Doanh Nhân CEO 1983 - HanoiBA (Có Phí)",
    tagline: "Đêm tiệc kết nối giao thương tinh hoa & vinh danh hội viên tiêu biểu",
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: "Trung tâm Hội nghị Quốc gia, Mễ Trì, Nam Từ Liêm, Hà Nội",
    capacity: 150,
    type: "forum",
    status: "upcoming",
    ticketPrice: 500000,
    fee: 500000,
    banner: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
  };

  const paidEventRes = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify(paidEventPayload)
  });
  const paidEvent = await paidEventRes.json();
  console.log("Paid Event Created. Status:", paidEventRes.status, "ID:", paidEvent.id || paidEvent.event?.id);

  const freeId = freeEvent.id || freeEvent.event?.id;
  const paidId = paidEvent.id || paidEvent.event?.id;

  console.log("\n--- 4. MEMBER vumikasa6@gmail.com REGISTERING FOR FREE EVENT ---");
  const vumikasaToken = await login("vumikasa6@gmail.com");
  const regFreeRes = await fetch(`${API_BASE}/events/${freeId}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vumikasaToken}`
    },
    body: JSON.stringify({ fullName: "Phạm Văn Vũ", phone: "0973924819" })
  });
  const regFree = await regFreeRes.json();
  console.log("Register Free Event Status:", regFreeRes.status, "Response:", regFree);

  console.log("\n--- 5. MEMBER vupv090120@gmail.com REGISTERING FOR PAID EVENT ---");
  const vupvToken = await login("vupv090120@gmail.com");
  const regPaidRes = await fetch(`${API_BASE}/events/${paidId}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${vupvToken}`
    },
    body: JSON.stringify({ fullName: "Vũ Phạm (Doanh Nhân)", phone: "0983198383" })
  });
  const regPaid = await regPaidRes.json();
  console.log("Register Paid Event Status:", regPaidRes.status, "Response:", regPaid);

  console.log("\n--- 6. VERIFYING REGISTRATIONS AS ADMIN ---");
  const regsRes = await fetch(`${API_BASE}/events/registrations`, {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  const regs = await regsRes.json();
  console.log("Total registrations found:", Array.isArray(regs) ? regs.length : regs);
}

run().catch(console.error);

