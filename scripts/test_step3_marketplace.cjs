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

  const sampleProducts = [
    { title: "Sản phẩm 2: Dịch vụ Tư vấn Chuyển đổi số Doanh nghiệp Vừa & Nhỏ", price: 20000000, category: "mk.cat.consulting", company: "Công ty CP ViConnect" },
    { title: "Sản phẩm 3: Gói Thiết kế Nhận diện Thương hiệu Chuẩn HanoiBA", price: 15000000, category: "mk.cat.design", company: "Công ty CP ViConnect" },
    { title: "Sản phẩm 4: Khóa Huấn luyện Lãnh đạo Thực chiến CEO 1983", price: 8000000, category: "mk.cat.education", company: "Công ty CP ViConnect" },
    { title: "Sản phẩm 5: Dịch vụ Bảo trì Hạ tầng Cloud & DevOps Chuyên Sâu", price: 12000000, category: "mk.cat.tech", company: "Công ty CP ViConnect" },
    { title: "Sản phẩm 6: Dịch vụ Quảng cáo & Booking KOLs (Thử vượt giới hạn)", price: 25000000, category: "mk.cat.media", company: "Công ty CP ViConnect" }
  ];

  for (let i = 0; i < sampleProducts.length; i++) {
    const p = sampleProducts[i];
    console.log(`\nAttempting to create ${p.title}...`);
    const res = await fetch(`${API_BASE}/marketplace/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${vumikasaToken}`
      },
      body: JSON.stringify(p)
    });
    console.log(`Status:`, res.status);
    const data = await res.json();
    console.log(`Response:`, data);
  }
}

run().catch(console.error);
