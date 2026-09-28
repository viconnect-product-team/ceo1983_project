const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/vione_app?sslmode=disable';

async function run() {
  const c = new Client({ connectionString: DB_URL });
  await c.connect();
  const cs = await c.query(`SELECT * FROM public.card_settings LIMIT 5`);
  console.log('card_settings rows:', cs.rows);
  const mbc = await c.query(`SELECT id, member_id, owner_user_id, display_name, company_name, company_logo_url, avatar_url, cover_url FROM public.member_business_cards WHERE company_logo_url IS NOT NULL OR cover_url IS NOT NULL LIMIT 5`);
  console.log('member_business_cards with logo/cover:', mbc.rows);
  await c.end();
}

run().catch(console.error);
