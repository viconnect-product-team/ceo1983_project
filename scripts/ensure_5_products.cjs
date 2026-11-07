const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();
  const sellerId = 'c65f9ffe-64aa-4145-a06e-89fda579024d';
  await client.query("DELETE FROM public.products WHERE title LIKE '%thứ 6%'");
  const res = await client.query("SELECT id, custom_id, title FROM public.products WHERE seller_id = $1 ORDER BY id ASC", [sellerId]);
  console.log(`Seller has ${res.rows.length} products:`);
  res.rows.forEach(r => console.log(`- [${r.id}] ${r.custom_id}: ${r.title}`));
  await client.end();
}

run().catch(console.error);

