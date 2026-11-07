const API_BASE = "https://crm.ceo1983.viconnect.vn/api";

async function login(email) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password: "123456" })
  });
  return (await res.json()).access_token;
}

async function run() {
  const adminToken = await login("admin@connect.vn");

  console.log("--- 1. Testing Training Creation ---");
  const trRes = await fetch(`${API_BASE}/trainings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "Chương Trình Đào Tạo Quản Trị 1983",
      instructor: "Chuyên gia ViConnect",
      format: "online",
      description: "Thử nghiệm kiểm thử toàn diện",
      startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
      roomUrl: "https://zoom.us/j/999888777",
      maxAttendees: 50
    })
  });
  console.log("Training Status:", trRes.status);
  const trData = await trRes.json();
  console.log("Training Data:", trData);

  const trId = trData.id || trData.training?.id || trData.data?.id;
  if (trId) {
    const editTr = await fetch(`${API_BASE}/trainings/${trId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Chương Trình Đào Tạo Quản Trị 1983 [ĐÃ CẬP NHẬT]",
        maxAttendees: 80
      })
    });
    console.log("Edit Training Status:", editTr.status, await editTr.text());

    const delTr = await fetch(`${API_BASE}/trainings/${trId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Delete Training Status:", delTr.status, await delTr.text());
  }

  console.log("\n--- 2. Testing Document Creation ---");
  // Let's check how documents are created in documents.controller.ts
  const docRes = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "Tài Liệu Hướng Dẫn Hội Viên CEO 1983.docx",
      title: "Tài Liệu Hướng Dẫn Hội Viên CEO 1983.docx",
      type: "docx",
      category: "Văn bản & Quy chế",
      file_path: "https://crm.ceo1983.viconnect.vn/uploads/sample_doc.docx",
      size: "2.4 MB"
    })
  });
  console.log("Document Status:", docRes.status);
  const docData = await docRes.json();
  console.log("Document Data:", docData);

  const docId = docData.id || docData.document?.id || docData.data?.id;
  if (docId) {
    const editDoc = await fetch(`${API_BASE}/documents/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: "Tài Liệu Hướng Dẫn Hội Viên CEO 1983 [ĐÃ CẬP NHẬT].docx"
      })
    });
    console.log("Edit Doc Status:", editDoc.status, await editDoc.text());

    const delDoc = await fetch(`${API_BASE}/documents/${docId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Delete Doc Status:", delDoc.status, await delDoc.text());
  }
}

run().catch(console.error);

