const API_BASE = "https://crm.ceo1983.viconnect.vn/api";

async function login(email) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password: "123456" })
  });
  return (await res.json()).access_token;
}

async function test() {
  const token = await login("admin@connect.vn");

  const crRes = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Test Sửa Event Quick',
      date: new Date(Date.now() + 86400000 * 27).toISOString(),
      location: 'Phòng Hội Thảo 101 ' + Date.now(),
      capacity: 50,
      fee: 0
    })
  });
  const crData = await crRes.json();
  const id = crData.event?.id || crData.id;
  console.log('Created event ID:', id);

  const upRes = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Test Sửa Event Quick [UPDATED]',
      capacity: 75
    })
  });
  console.log('Update status:', upRes.status);
  const upData = await upRes.text();
  console.log('Update response:', upData);

  const delRes = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Delete status:', delRes.status);
}

test().catch(console.error);
