const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const bc = await client.query("SELECT * FROM public.member_business_cards WHERE display_name ILIKE '%Jame%' OR member_id = '00000000-0000-4000-8000-000000000002'");
  console.log('--- MEMBER BUSINESS CARDS FOR JAME / ADMIN ---', bc.rows);

  const allBc = await client.query("SELECT id, member_id, display_name, photo_url, company, phone, email FROM public.member_business_cards");
  console.log('--- ALL MEMBER BUSINESS CARDS ---', allBc.rows);

  const bi = await client.query("SELECT * FROM public.business_identities WHERE full_name ILIKE '%Jame%' OR owner_user_id = '00000000-0000-4000-8000-000000000002'");
  console.log('--- BUSINESS IDENTITIES ---', bi.rows);

  await client.end();
}

check().catch(console.error);
