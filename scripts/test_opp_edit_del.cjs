const API_BASE = "https://crm.ceo1983.viconnect.vn/api";

async function login(email) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password: "123456" })
  });
  return (await res.json()).access_token;
}

async function testOpp() {
  const token = await login("vumikasa6@gmail.com");

  console.log("--- 1. Testing Opportunity Creation ---");
  const crRes = await fetch(`${API_BASE}/opportunities`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      title: "Tìm đối tác cung cấp thiết bị CNTT văn phòng đợt 4",
      content: "Doanh nghiệp ViConnect có nhu cầu mua sắm thiết bị CNTT quy mô lớn cho chi nhánh mới.",
      category: "Công nghệ thông tin",
      expected_value: 120000000,
      target_industry: "Thiết bị văn phòng"
    })
  });
  console.log("Create Opp Status:", crRes.status);
  const oppData = await crRes.json();
  console.log("Opp Data:", oppData);

  const oppId = oppData.id || oppData.data?.id;
  if (oppId) {
    const editRes = await fetch(`${API_BASE}/opportunities/${oppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        title: "Tìm đối tác cung cấp thiết bị CNTT văn phòng đợt 4 [ĐÃ CHỈNH SỬA]",
        expected_value: 150000000
      })
    });
    console.log("Edit Opp Status:", editRes.status, await editRes.text());

    const delRes = await fetch(`${API_BASE}/opportunities/${oppId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Delete Opp Status:", delRes.status, await delRes.text());
  }
}

testOpp().catch(console.error);
