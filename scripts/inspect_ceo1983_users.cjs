const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();
  const id = `prod-${Date.now()}`;
  const sellerId = 'c65f9ffe-64aa-4145-a06e-89fda579024d';
  const title = 'Giải pháp ERP Quản trị Doanh nghiệp ViConnect 2026';
  const company = 'Công ty CP ViConnect';
  const imageUrls = [];

  try {
    const res = await client.query(`
      INSERT INTO public.products (
        custom_id, seller_id, title, name, description, price, original_price, member_price,
        category, status, views, emoji, pdf_url, image_urls, company,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'Mô tả chi tiết', 50000000, 50000000, 50000000,
        'mk.cat.other', 'active', 0, '🛍️', '', $5::jsonb, $6,
        NOW(), NOW()
      )
      RETURNING *
    `, [id, sellerId, title, title, JSON.stringify(imageUrls), company]);
    console.log('Direct Insert Succeeded! ID:', res.rows[0].id);
  } catch (err) {
    console.error('Direct Insert Failed:', err.message);
  }
  await client.end();
}

run().catch(console.error);
