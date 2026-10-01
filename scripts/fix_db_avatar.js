const { Client } = require('pg');

async function fixAvatarInDb(url, name) {
  try {
    const c = new Client({ connectionString: url });
    await c.connect();
    
    // Update admin user avatar_url to the real photo
    const updateRes = await c.query(`
      UPDATE vione_users 
      SET avatar_url = '/upload/file/documents/1790761495822-wtss3o.jpg'
      WHERE email = 'admin@connect.vn' OR avatar_url LIKE '%..' OR (avatar_url LIKE 'data:%' AND length(avatar_url) < 150)
    `);
    console.log(`[${name}] Updated vione_users rows:`, updateRes.rowCount);

    const updateMemRes = await c.query(`
      UPDATE members
      SET avatar = '/upload/file/documents/1790761495822-wtss3o.jpg'
      WHERE (email = 'admin@connect.vn' AND (avatar IS NULL OR avatar LIKE '%..' OR (avatar LIKE 'data:%' AND length(avatar) < 150)))
         OR avatar LIKE '%..' OR (avatar LIKE 'data:%' AND length(avatar) < 150)
    `);
    console.log(`[${name}] Updated members rows:`, updateMemRes.rowCount);

    // Verify
    const checkUser = await c.query("SELECT email, name, avatar_url FROM vione_users WHERE email = 'admin@connect.vn'");
    console.log(`[${name}] Verified admin user:`, checkUser.rows[0]);

    await c.end();
  } catch (err) {
    console.error(`[${name}] Error:`, err.message);
  }
}

async function run() {
  await fixAvatarInDb('postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable', 'ceo1983_project');
  await fixAvatarInDb('postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable', 'vione_app');
}

run();
