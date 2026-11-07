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
  const mikaToken = await login("vumikasa6@gmail.com");

  console.log("=== 1. TEST SỰ KIỆN: TẠO -> SỬA -> XÓA ===");
  const createEv = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "Sự kiện Thử Nghiệm Chu Trình Sửa Xóa 1983",
      tagline: "Kiểm thử luồng biên tập và hủy sự kiện",
      date: new Date(Date.now() + 86400000 * 20).toISOString(),
      location: "Phòng Họp Ban Điều Hành HanoiBA, Tầng 3",
      capacity: 50,
      type: "networking",
      fee: 0
    })
  });
  const evData = await createEv.json();
  const evId = evData.id || evData.event?.id;
  console.log("Tạo sự kiện status:", createEv.status, "ID:", evId);

  if (evId) {
    const editEv = await fetch(`${API_BASE}/events/${evId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: "Sự kiện Thử Nghiệm Chu Trình Sửa Xóa 1983 [ĐÃ CHỈNH SỬA TÊN & SỨC CHỨA]",
        capacity: 80
      })
    });
    console.log("Sửa sự kiện status:", editEv.status);

    const delEv = await fetch(`${API_BASE}/events/${evId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Xóa sự kiện status:", delEv.status);
  }

  console.log("\n=== 2. TEST CUỘC HỌP: TẠO -> SỬA -> XÓA ===");
  const createMt = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "Cuộc Họp Thử Nghiệm Chu Trình Sửa Xóa B2B",
      type: "online",
      link: "https://meet.google.com/test-edit-del",
      date: new Date(Date.now() + 86400000 * 10).toISOString(),
      participants: ["vupv090120@gmail.com"]
    })
  });
  const mtData = await createMt.json();
  const mtId = mtData.id || mtData.meeting?.id;
  console.log("Tạo cuộc họp status:", createMt.status, "ID:", mtId);

  if (mtId) {
    const editMt = await fetch(`${API_BASE}/meetings/${mtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Cuộc Họp Thử Nghiệm Chu Trình Sửa Xóa B2B [ĐÃ CHỈNH SỬA]"
      })
    });
    console.log("Sửa cuộc họp status:", editMt.status);

    const delMt = await fetch(`${API_BASE}/meetings/${mtId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Xóa cuộc họp status:", delMt.status);
  }

  console.log("\n=== 3. TEST KHÓA ĐÀO TẠO: TẠO -> SỬA -> XÓA ===");
  const createTr = await fetch(`${API_BASE}/trainings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "Khóa Học Thử Nghiệm Chu Trình Sửa Xóa",
      instructor: "Chuyên gia ViConnect",
      format: "online",
      description: "Thử nghiệm kiểm thử toàn diện",
      duration: "2 giờ"
    })
  });
  const trData = await createTr.json();
  const trId = trData.id || trData.training?.id;
  console.log("Tạo đào tạo status:", createTr.status, "ID:", trId);

  if (trId) {
    const editTr = await fetch(`${API_BASE}/trainings/${trId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Khóa Học Thử Nghiệm Chu Trình Sửa Xóa [ĐÃ CHỈNH SỬA]"
      })
    });
    console.log("Sửa đào tạo status:", editTr.status);

    const delTr = await fetch(`${API_BASE}/trainings/${trId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Xóa đào tạo status:", delTr.status);
  }

  console.log("\n=== 4. TEST TÀI LIỆU: TẠO -> SỬA -> XÓA ===");
  const createDoc = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "Tài Liệu Hướng Dẫn Thử Nghiệm Sửa Xóa.docx",
      type: "docx",
      category: "Quy chế & Hướng dẫn",
      url: "https://example.com/demo.docx",
      size: "1.2 MB"
    })
  });
  const docData = await createDoc.json();
  const docId = docData.id || docData.document?.id;
  console.log("Tạo tài liệu status:", createDoc.status, "ID:", docId);

  if (docId) {
    const editDoc = await fetch(`${API_BASE}/documents/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Tài Liệu Hướng Dẫn Thử Nghiệm Sửa Xóa [ĐÃ CẬP NHẬT].docx"
      })
    });
    console.log("Sửa tài liệu status:", editDoc.status);

    const delDoc = await fetch(`${API_BASE}/documents/${docId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Xóa tài liệu status:", delDoc.status);
  }

  console.log("\n=== 5. TEST SẢN PHẨM SÀN: TẠO -> SỬA -> XÓA ===");
  // Create a 6th product temporarily, update it, and delete it to keep 5 products!
  const createProd = await fetch(`${API_BASE}/marketplace/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "Sản phẩm Thử Nghiệm Chu Trình Sửa Xóa",
      price: 5000000
    })
  });
  const prodData = await createProd.json();
  const prodId = prodData.id;
  console.log("Tạo sản phẩm status:", createProd.status, "ID:", prodId);

  if (prodId) {
    const editProd = await fetch(`${API_BASE}/marketplace/products/${prodId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Sản phẩm Thử Nghiệm Chu Trình Sửa Xóa [ĐÃ CHỈNH SỬA]",
        price: 6500000
      })
    });
    console.log("Sửa sản phẩm status:", editProd.status);

    const delProd = await fetch(`${API_BASE}/marketplace/products/${prodId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Xóa sản phẩm status:", delProd.status);
  }

  console.log("\n=== 6. TEST CÔNG VIỆC (TASKS): TẠO -> SỬA -> TIẾN ĐỘ -> XÓA ===");
  const createTk = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "Nhiệm vụ Thử Nghiệm Chu Trình Sửa Xóa",
      department: "Ban Thư Ký",
      assignedTo: "vupv090120@gmail.com",
      priority: "medium"
    })
  });
  const tkData = await createTk.json();
  const tkId = tkData.id;
  console.log("Tạo task status:", createTk.status, "ID:", tkId);

  if (tkId) {
    const editTk = await fetch(`${API_BASE}/tasks/${tkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: "Nhiệm vụ Thử Nghiệm Chu Trình Sửa Xóa [ĐÃ SỬA NỘI DUNG]",
        priority: "high"
      })
    });
    console.log("Sửa task status:", editTk.status);

    const delTk = await fetch(`${API_BASE}/tasks/${tkId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Xóa task status:", delTk.status);
  }
}

run().catch(console.error);

