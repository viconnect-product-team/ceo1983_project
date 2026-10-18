const { Client } = require('pg');
const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@14.225.217.232:5436/vione_app?schema=public';

async function check() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const bcCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='member_business_cards'");
  console.log('--- BC COLUMNS ---', bcCols.rows.map(r => r.column_name));

  const biCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='business_identities'");
  console.log('--- BI COLUMNS ---', biCols.rows.map(r => r.column_name));

  const allBc = await client.query("SELECT * FROM public.member_business_cards LIMIT 3");
  console.log('--- BC ROWS ---', allBc.rows);

  const allBi = await client.query("SELECT * FROM public.business_identities LIMIT 3");
  console.log('--- BI ROWS ---', allBi.rows);

  await client.end();
}

check().catch(console.error);
