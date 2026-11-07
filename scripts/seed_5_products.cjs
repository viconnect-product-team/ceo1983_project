const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
});

async function run() {
  await client.connect();
  const sellerId = 'c65f9ffe-64aa-4145-a06e-89fda579024d'; // vumikasa6@gmail.com
  const company = 'Công ty CP ViConnect';

  // Clean existing products for this seller to ensure exactly 5 products
  await client.query("DELETE FROM public.products WHERE seller_id = $1 OR company = $2", [sellerId, company]);

  const products = [
    {
      customId: "PROD-ERP-01",
      title: "Giải pháp ERP Quản trị Doanh nghiệp ViConnect 2026",
      desc: "Hệ thống quản trị tài chính, nhân sự, dự án tinh gọn dành riêng cho chủ doanh nghiệp CEO 1983.",
      price: 50000000,
      origPrice: 65000000,
      memberPrice: 45000000,
      category: "mk.cat.tech",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600"
    },
    {
      customId: "PROD-CONSULT-02",
      title: "Dịch vụ Tư vấn Chuyển đổi số Doanh nghiệp Vừa & Nhỏ",
      desc: "Lộ trình chuyển đổi số thực chiến, tối ưu chi phí vận hành và tự động hóa quy trình nghiệp vụ.",
      price: 20000000,
      origPrice: 25000000,
      memberPrice: 18000000,
      category: "mk.cat.consulting",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600"
    },
    {
      customId: "PROD-BRAND-03",
      title: "Gói Thiết kế Nhận diện Thương hiệu Chuẩn HanoiBA",
      desc: "Thiết kế bộ nhận diện logo, profile, ấn phẩm truyền thông chuyên nghiệp tạo uy tín bảo chứng.",
      price: 15000000,
      origPrice: 18000000,
      memberPrice: 12000000,
      category: "mk.cat.design",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600"
    },
    {
      customId: "PROD-TRAIN-04",
      title: "Khóa Huấn luyện Lãnh đạo Thực chiến CEO 1983",
      desc: "Chương trình đào tạo kỹ năng điều hành, xây dựng văn hóa doanh nghiệp và giữ chân nhân tài.",
      price: 8000000,
      origPrice: 10000000,
      memberPrice: 6500000,
      category: "mk.cat.education",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600"
    },
    {
      customId: "PROD-CLOUD-05",
      title: "Dịch vụ Bảo trì Hạ tầng Cloud & DevOps Chuyên Sâu",
      desc: "Đảm bảo uptime 99.9%, bảo mật dữ liệu an toàn đa tầng và hỗ trợ kỹ thuật 24/7.",
      price: 12000000,
      origPrice: 15000000,
      memberPrice: 10000000,
      category: "mk.cat.tech",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600"
    }
  ];

  for (const p of products) {
    const res = await client.query(`
      INSERT INTO public.products (
        custom_id, seller_id, title, name, description, price, original_price, member_price,
        category, status, views, emoji, pdf_url, image_urls, image_url, company,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, 'active', 28, '🛍️', '', $10::jsonb, $11, $12,
        NOW(), NOW()
      )
      RETURNING id, custom_id, title
    `, [
      p.customId,
      sellerId,
      p.title,
      p.title,
      p.desc,
      p.price,
      p.origPrice,
      p.memberPrice,
      p.category,
      JSON.stringify([p.image]),
      p.image,
      company
    ]);
    console.log(`Inserted product: ${res.rows[0].custom_id} - ${res.rows[0].title}`);
  }

  const count = await client.query("SELECT count(*) FROM public.products WHERE seller_id = $1", [sellerId]);
  console.log(`\nTotal products for seller ${sellerId}: ${count.rows[0].count}/5`);

  await client.end();
}

run().catch(console.error);
