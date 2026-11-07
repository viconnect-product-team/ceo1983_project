const accounts = [
  { email: "admin@connect.vn", password: "123456" },
  { email: "vumikasa6@gmail.com", password: "123456" },
  { email: "vupv090120@gmail.com", password: "123456" }
];

async function run() {
  for (const acc of accounts) {
    console.log(`\nTesting account: ${acc.email}`);
    const res = await fetch("https://crm.ceo1983.viconnect.vn/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: acc.email, username: acc.email, password: acc.password })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Access Token present?", !!data.access_token);
    if (data.access_token) {
      console.log("Logged in user:", data.user?.email || data.user?.username, "Role:", data.user?.role);
    } else {
      console.log("Error:", data);
    }
  }
}

run();
