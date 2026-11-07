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

  const docs = [
    {
      name: "Quy_Che_Hoat_Dong_Va_Giao_Thuong_CEO1983_HanoiBA.pdf",
      category: "Quy chế & Điều lệ",
      type: "pdf",
      size: "1.8 MB",
      filePath: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      shareScope: "public",
      shareRole: "viewer"
    },
    {
      name: "Ke_Hoach_Xuc_Tien_Thuong_Mai_Va_Giao_Thuong_2026.docx",
      category: "Kế hoạch & B2B",
      type: "docx",
      size: "850 KB",
      filePath: "https://file-examples.com/storage/fe50e9603d659422df57482/2017/02/file-sample_100kB.docx",
      shareScope: "public",
      shareRole: "viewer"
    },
    {
      name: "Bang_Du_Toan_Ngan_Sach_Va_Doanh_So_Giao_Thuong_Q4.xlsx",
      category: "Tài chính & Ngân sách",
      type: "xlsx",
      size: "1.2 MB",
      filePath: "https://file-examples.com/storage/fe50e9603d659422df57482/2017/02/file_example_XLSX_50.xlsx",
      shareScope: "public",
      shareRole: "viewer"
    }
  ];

  for (const d of docs) {
    const res = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify(d)
    });
    console.log(`Created document "${d.name}". Status:`, res.status, "Response:", await res.json());
  }

  const listRes = await fetch(`${API_BASE}/documents`, {
    headers: { "Authorization": `Bearer ${adminToken}` }
  });
  const list = await listRes.json();
  console.log("\nTotal documents in system:", Array.isArray(list) ? list.length : list);
}

run().catch(console.error);

