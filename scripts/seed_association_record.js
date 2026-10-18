const { Client } = require('pg');

async function seedAssociation() {
  const dbs = ['vione_app', 'ceo1983_project'];
  for (const db of dbs) {
    const c = new Client({
      connectionString: `postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/${db}?sslmode=disable`
    });
    try {
      await c.connect();
      console.log(`Connecting to ${db}...`);

      const query = `
        INSERT INTO public.associations (
          id,
          name,
          slug,
          logo_url,
          brand_primary,
          tagline,
          about,
          contact_email,
          landing_published,
          ssl_status,
          public_card_enabled,
          public_card_requires_active_member,
          created_at,
          updated_at
        ) VALUES (
          'c1983000-0000-4000-8000-000000001983',
          'CLB Doanh Nhân CEO 1983',
          'ceo1983',
          'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
          '#003B95',
          'Đoàn kết - Tiên phong - Kiến tạo tương lai',
          'CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA). Nơi quy tụ các lãnh đạo doanh nghiệp sinh năm 1983 bản lĩnh, sẻ chia và cùng phát triển thịnh vượng.',
          'contact@ceo1983.vn',
          true,
          'active',
          true,
          false,
          NOW(),
          NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          landing_published = true,
          updated_at = NOW();
      `;

      await c.query(query);
      console.log(`✅ Seeded association c1983000-0000-4000-8000-000000001983 in ${db}`);

      // Verify
      const res = await c.query('SELECT id, name, slug, landing_published FROM public.associations');
      console.log(`Associations in ${db}:`, res.rows);

      // Verify events in db
      const evts = await c.query('SELECT id, title, association_id FROM public.events');
      console.log(`Events in ${db}:`, evts.rows);

      await c.end();
    } catch (err) {
      console.error(`Error in ${db}:`, err.message);
      try { await c.end(); } catch (_) {}
    }
  }
}

seedAssociation();
