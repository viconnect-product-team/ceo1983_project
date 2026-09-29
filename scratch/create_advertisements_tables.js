const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating public.advertisements and public.ad_requests tables...');
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.advertisements (
      id VARCHAR(64) PRIMARY KEY,
      request_id VARCHAR(64),
      title VARCHAR(255) NOT NULL,
      company_name VARCHAR(255) NOT NULL,
      badge_text VARCHAR(100) DEFAULT 'ĐỐI TÁC CHIẾN LƯỢC',
      banner_url TEXT NOT NULL,
      target_url TEXT,
      animation VARCHAR(50) DEFAULT 'gradient-wave',
      start_date VARCHAR(50),
      end_date VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      impressions INT DEFAULT 0,
      clicks INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.ad_requests (
      id VARCHAR(64) PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      goal TEXT,
      duration_months INT DEFAULT 3,
      budget_est VARCHAR(100),
      product_link TEXT,
      notes TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      payment_amount NUMERIC DEFAULT 15000000,
      payment_code VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default sample ads if empty
  const count = await prisma.$queryRaw`SELECT COUNT(*)::int as c FROM public.advertisements`;
  if (count[0]?.c === 0) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.advertisements (
        id, title, company_name, badge_text, banner_url, target_url, animation, start_date, end_date, status, impressions, clicks
      ) VALUES 
      (
        'ad_active_001',
        'Giải pháp ERP Toàn diện & Số hóa Doanh nghiệp CEO 1983',
        'Công ty Cổ phần Công nghệ ABC',
        'ĐỐI TÁC CHIẾN LƯỢC',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        'https://ceo1983.vn/marketplace',
        'gradient-wave',
        '2026-09-01',
        '2026-12-31',
        'active',
        4850,
        342
      ),
      (
        'ad_active_002',
        'Hệ sinh thái Nội thất Văn phòng & Biệt thự Cao cấp Hoàng Gia',
        'Tập đoàn Đầu tư & Xây dựng An Phát',
        'TÀI TRỢ KIM CƯƠNG',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        'https://ceo1983.vn/marketplace',
        'gold-shimmer',
        '2026-09-15',
        '2026-12-31',
        'active',
        3120,
        215
      );
    `);
    console.log('Seeded 2 active sample advertisements.');
  }

  const reqCount = await prisma.$queryRaw`SELECT COUNT(*)::int as c FROM public.ad_requests`;
  if (reqCount[0]?.c === 0) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.ad_requests (
        id, company_name, contact_person, phone, email, goal, duration_months, budget_est, product_link, status, payment_amount, payment_code
      ) VALUES 
      (
        'req_ad_001',
        'Công ty Cổ phần Công nghệ ABC',
        'Nguyễn Văn Hùng',
        '0983 678 888',
        'hung.nv@abctech.vn',
        'Chạy Banner đối tác chiến lược giải pháp ERP & Phần mềm chuyển đổi số',
        3,
        '15.000.000 đ',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        'paid',
        15000000,
        'QC-CEO1983-ABC'
      ),
      (
        'req_ad_002',
        'Tập đoàn Đầu tư & Xây dựng An Phát',
        'Trần Thị Mai',
        '0904 123 983',
        'mai.tt@anphatgroup.com',
        'Quảng cáo gói thầu thiết kế thi công nội thất văn phòng chuẩn doanh nhân',
        6,
        '30.000.000 đ',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        'payment_sent',
        30000000,
        'QC-CEO1983-ANPHAT'
      );
    `);
    console.log('Seeded 2 sample ad requests.');
  }

  console.log('Table creation & seeding completed successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
