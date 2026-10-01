const { Client } = require('pg');

async function fix() {
  const url = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?sslmode=disable';
  const c = new Client({ connectionString: url });
  await c.connect();
  const u = await c.query("SELECT id, email, name, avatar_url FROM vione_users WHERE email = 'admin@connect.vn'");
  console.log('Admin user:', u.rows[0]);
  const m = await c.query("SELECT id, email, name, avatar, cover_url FROM members WHERE email = 'admin@connect.vn' OR user_id = $1", [u.rows[0]?.id]);
  console.log('Admin member:', m.rows[0]);

  // Also check all users where avatar_url has invalid length or ends with '..'
  const badUsers = await c.query("SELECT id, email, name, avatar_url FROM vione_users WHERE avatar_url LIKE '%..' OR (avatar_url LIKE 'data:%' AND length(avatar_url) < 100)");
  console.log('Bad users in ceo1983_project:', badUsers.rows);

  const badMembers = await c.query("SELECT id, email, name, avatar, cover_url FROM members WHERE avatar LIKE '%..' OR (avatar LIKE 'data:%' AND length(avatar) < 100) OR cover_url LIKE '%..' OR (cover_url LIKE 'data:%' AND length(cover_url) < 100)");
  console.log('Bad members in ceo1983_project:', badMembers.rows);
  await c.end();

  // Also check vione_app
  const c2 = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable' });
  await c2.connect();
  const badUsers2 = await c2.query("SELECT id, email, name, avatar_url FROM vione_users WHERE avatar_url LIKE '%..' OR (avatar_url LIKE 'data:%' AND length(avatar_url) < 100)");
  console.log('Bad users in vione_app:', badUsers2.rows);
  const badMembers2 = await c2.query("SELECT id, email, name, avatar, cover_url FROM members WHERE avatar LIKE '%..' OR (avatar LIKE 'data:%' AND length(avatar) < 100) OR cover_url LIKE '%..' OR (cover_url LIKE 'data:%' AND length(cover_url) < 100)");
  console.log('Bad members in vione_app:', badMembers2.rows);
  await c2.end();
}

fix().catch(console.error);
