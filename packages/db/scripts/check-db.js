const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/vione_app?schema=public' });
c.connect().then(async () => {
  const res = await c.query("SELECT * FROM members WHERE company_logo_url LIKE '%1lfhzi%' OR avatar LIKE '%1lfhzi%'");
  console.log('Found in members:', res.rows);
  const res2 = await c.query("SELECT * FROM member_business_cards WHERE company_logo_url LIKE '%1lfhzi%' OR avatar_url LIKE '%1lfhzi%'");
  console.log('Found in cards:', res2.rows);
  c.end();
}).catch(e => { console.error(e); c.end(); });
