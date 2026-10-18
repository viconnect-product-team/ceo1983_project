const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const bc = await client.query("SELECT * FROM public.member_business_cards WHERE owner_user_id = '00000000-0000-4000-8000-000000000002'");
  console.log('--- ADMIN BUSINESS CARD ---');
  console.log(bc.rows);

  await client.end();
}

check().catch(console.error);
