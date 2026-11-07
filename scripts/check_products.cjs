const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position");
  console.log('Products columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
  const products = await client.query("SELECT id, custom_id, title, seller_id, status FROM public.products");
  console.log('Existing products:', products.rows);
  await client.end();
}
check().catch(console.error);

