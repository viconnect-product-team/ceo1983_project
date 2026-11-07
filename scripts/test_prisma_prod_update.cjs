const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
    }
  }
});

async function run() {
  const prod = await prisma.$queryRaw`SELECT * FROM public.products LIMIT 1`;
  const p = prod[0];
  console.log('Testing product:', p.id, p.custom_id);

  const productId = p.custom_id || String(p.id);
  const name = 'Test Product Update Verified';
  const cleanPrice = 6000000;
  const cleanOriginalPrice = 6000000;
  const cleanMemberPrice = 5500000;
  const imgArr = ['https://example.com/test.jpg'];
  const imageUrl = imgArr[0];
  const videoUrl = null;
  const data = { description: 'Updated test description', company: 'ViConnect', category: 'IT', unit: 'Bộ', currency: 'VND' };

  try {
    await prisma.$executeRaw`
      UPDATE public.products
      SET
        title = COALESCE(${name}, title),
        name = COALESCE(${name}, name),
        description = COALESCE(${data.description}, description),
        company = COALESCE(${data.company}, company),
        category = COALESCE(${data.category}, category),
        price = COALESCE(${cleanPrice != null ? BigInt(cleanPrice) : null}, price),
        original_price = COALESCE(${cleanOriginalPrice != null ? BigInt(cleanOriginalPrice) : null}, original_price),
        member_price = COALESCE(${cleanMemberPrice != null ? BigInt(cleanMemberPrice) : null}, member_price),
        unit = COALESCE(${data.unit}, unit),
        currency = COALESCE(${data.currency}, currency),
        image_url = COALESCE(${imageUrl}, image_url),
        image_urls = CASE WHEN ${imgArr ? true : false} THEN ${JSON.stringify(imgArr || [])}::jsonb ELSE image_urls END,
        video_url = COALESCE(${videoUrl}, video_url),
        updated_at = now()
      WHERE (custom_id = ${productId} OR id::text = ${productId})
    `;
    console.log('Marketplace updateProduct SUCCESS!');
  } catch (err) {
    console.error('Marketplace updateProduct FAILED:', err);
  }

  await prisma.$disconnect();
}

run();

