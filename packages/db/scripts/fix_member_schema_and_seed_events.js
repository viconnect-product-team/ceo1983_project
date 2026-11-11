const { Client } = require('pg');

const DB_URL = 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project';
const ADMIN_ID = '00000000-0000-4000-8000-000000000002';
const ASSOC_ID = 'c1983000-0000-4000-8000-000000001983';

async function run() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to DB');

  // 1. Add title column to members if not exists
  await client.query("ALTER TABLE public.members ADD COLUMN IF NOT EXISTS title text;");
  console.log('1. Added title column to members');

  // 2. Add title and place columns to events if not exists for maximum compatibility
  await client.query("ALTER TABLE public.events ADD COLUMN IF NOT EXISTS title text;");
  await client.query("ALTER TABLE public.events ADD COLUMN IF NOT EXISTS place text;");
  console.log('2. Added title & place columns to events for 100% compatibility');

  // 3. Set admin title & professional_title
  await client.query(`
    UPDATE public.members 
    SET title = 'Chủ Tịch CLB Doanh Nhân CEO 1983', executive_role = 'admin', updated_at = NOW() 
    WHERE id = $1 OR user_id = $2::uuid;
  `, [ADMIN_ID, ADMIN_ID]);
  await client.query(`
    UPDATE public.user_profiles
    SET professional_title = 'Chủ Tịch CLB Doanh Nhân CEO 1983', updated_at = NOW()
    WHERE user_id = $1::uuid;
  `, [ADMIN_ID]);
  console.log('3. Updated admin title');

  // 4. Seed official CEO 1983 events
  const seedEvents = [
    {
      id: 'e1983000-0000-4000-8000-000000000001',
      name: 'Đại Hội Thường Niên & Gala Vinh Danh CEO 1983 Xuất Sắc',
      title: 'Đại Hội Thường Niên & Gala Vinh Danh CEO 1983 Xuất Sắc',
      description: 'Đại hội toàn thể hội viên CLB Doanh Nhân CEO 1983 trực thuộc HanoiBA. Tổng kết hoạt động giao thương, vinh danh các doanh nghiệp tiêu biểu và bầu Ban Chấp Hành nhiệm kỳ mới.',
      date: '2026-11-28',
      location: 'Trung Tâm Hội Nghị Quốc Gia (NCC), Số 1 Đại Lộ Thăng Long, Hà Nội',
      place: 'Trung Tâm Hội Nghị Quốc Gia (NCC), Số 1 Đại Lộ Thăng Long, Hà Nội',
      fee: 500000,
      ticket_price: 500000,
      capacity: 500,
      registered: 142,
      type: 'Gala & Đại Hội',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000002',
      name: 'Diễn Đàn Kết Nối Giao Thương B2B & Chuỗi Cung Ứng 2026',
      title: 'Diễn Đàn Kết Nối Giao Thương B2B & Chuỗi Cung Ứng 2026',
      description: 'Phiên kết nối giao thương trực tiếp giữa 100+ doanh nghiệp sản xuất, phân phối, xuất nhập khẩu và công nghệ. Ký kết biên bản ghi nhớ hợp tác thương mại liên ngành.',
      date: '2026-11-18',
      location: 'Khách sạn JW Marriott Hanoi, Số 8 Đỗ Đức Dục, Nam Từ Liêm, Hà Nội',
      place: 'Khách sạn JW Marriott Hanoi, Số 8 Đỗ Đức Dục, Nam Từ Liêm, Hà Nội',
      fee: 0,
      ticket_price: 0,
      capacity: 250,
      registered: 98,
      type: 'Giao thương B2B',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000003',
      name: 'Tọa Đàm: Quản Trị Tối Ưu Dòng Tiền & Tái Cấu Trúc Vốn Doanh Nghiệp',
      title: 'Tọa Đàm: Quản Trị Tối Ưu Dòng Tiền & Tái Cấu Trúc Vốn Doanh Nghiệp',
      description: 'Chuyên đề đào tạo cấp cao do Ban Đào Tạo CLB CEO 1983 tổ chức với sự tham gia của các chuyên gia tài chính hàng đầu và các CEO quy mô doanh thu trên 100 tỷ.',
      date: '2026-11-22',
      location: 'Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội',
      place: 'Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội',
      fee: 0,
      ticket_price: 0,
      capacity: 180,
      registered: 65,
      type: 'Đào tạo & Tọa đàm',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000004',
      name: 'Caravan Doanh Nhân CEO 1983: Hành Trình Kết Nối & Thiện Nguyện Tây Bắc',
      title: 'Caravan Doanh Nhân CEO 1983: Hành Trình Kết Nối & Thiện Nguyện Tây Bắc',
      description: 'Chuyến caravan 3 ngày 2 đêm giao lưu xúc tiến thương mại với Hiệp Hội Doanh Nghiệp tỉnh Lào Cai, kết hợp chương trình thiện nguyện xây điểm trường cho trẻ em vùng cao.',
      date: '2026-12-05',
      location: 'Xuất phát từ Hà Nội - Yên Bái - Sapa (Lào Cai)',
      place: 'Xuất phát từ Hà Nội - Yên Bái - Sapa (Lào Cai)',
      fee: 3500000,
      ticket_price: 3500000,
      capacity: 80,
      registered: 42,
      type: 'Caravan & Xúc tiến',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000005',
      name: 'Cafe Doanh Nhân Sáng Thứ 6: Chia Sẻ Cơ Hội Hợp Tác Đầu Tư B2B',
      title: 'Cafe Doanh Nhân Sáng Thứ 6: Chia Sẻ Cơ Hội Hợp Tác Đầu Tư B2B',
      description: 'Gặp gỡ định kỳ sáng thứ 6 hàng tuần giữa các chủ doanh nghiệp CEO 1983. Không gian mở để trao đổi deal, giới thiệu đối tác tin cậy và tìm kiếm nhà cung cấp uy tín.',
      date: '2026-11-20',
      location: 'Trung Nguyên Legend Cafe, Tòa nhà Keangnam Landmark 72, Cầu Giấy, Hà Nội',
      place: 'Trung Nguyên Legend Cafe, Tòa nhà Keangnam Landmark 72, Cầu Giấy, Hà Nội',
      fee: 0,
      ticket_price: 0,
      capacity: 60,
      registered: 28,
      type: 'Cafe Doanh Nhân',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000006',
      name: 'Workshop: Ứng Dụng AI & Tự Động Hóa Vận Hành Doanh Nghiệp SME',
      title: 'Workshop: Ứng Dụng AI & Tự Động Hóa Vận Hành Doanh Nghiệp SME',
      description: 'Thực chiến ứng dụng trí tuệ nhân tạo (Generative AI) vào marketing, bán hàng B2B, quản lý nhân sự và tự động hóa quy trình nội bộ cho doanh nghiệp vừa và nhỏ.',
      date: '2026-11-25',
      location: 'Phòng Hội Thảo Tầng 12, Tòa nhà CEO 1983 Tower, Hà Nội & Online Zoom',
      place: 'Phòng Hội Thảo Tầng 12, Tòa nhà CEO 1983 Tower, Hà Nội & Online Zoom',
      fee: 0,
      ticket_price: 0,
      capacity: 200,
      registered: 85,
      type: 'Đào tạo & Tọa đàm',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000007',
      name: 'Giải Golf Hữu Nghị CEO 1983 Championship 2026',
      title: 'Giải Golf Hữu Nghị CEO 1983 Championship 2026',
      description: 'Giải đấu thể thao thường niên mở rộng dành riêng cho các Golfer doanh nhân thế hệ 1983 và khách mời danh dự từ Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA).',
      date: '2026-12-12',
      location: 'Sân Golf Long Biên, Phúc Đồng, Long Biên, Hà Nội',
      place: 'Sân Golf Long Biên, Phúc Đồng, Long Biên, Hà Nội',
      fee: 2800000,
      ticket_price: 2800000,
      capacity: 144,
      registered: 60,
      type: 'Thể thao & Giao lưu',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'e1983000-0000-4000-8000-000000000008',
      name: 'Lễ Kỷ Niệm 4 Năm Thành Lập CLB Doanh Nhân CEO 1983 (2022 - 2026)',
      title: 'Lễ Kỷ Niệm 4 Năm Thành Lập CLB Doanh Nhân CEO 1983 (2022 - 2026)',
      description: 'Dấu mốc 4 năm gắn kết thương trường, tôn vinh tinh thần doanh nhân 1983. Tri ân các nhà tài trợ, ra mắt Quỹ Hỗ Trợ Khởi Nghiệp và công bố chiến lược phát triển 2027.',
      date: '2026-10-15',
      location: 'Khách sạn Pan Pacific Hanoi, Số 1 Thanh Niên, Ba Đình, Hà Nội',
      place: 'Khách sạn Pan Pacific Hanoi, Số 1 Thanh Niên, Ba Đình, Hà Nội',
      fee: 0,
      ticket_price: 0,
      capacity: 400,
      registered: 380,
      type: 'Gala & Đại Hội',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  for (const ev of seedEvents) {
    await client.query(`
      INSERT INTO public.events (
        id, name, title, description, date, location, place, fee, ticket_price, capacity, registered, type, status,
        image, association_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15::uuid, NOW(), NOW()
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        date = EXCLUDED.date,
        location = EXCLUDED.location,
        place = EXCLUDED.place,
        fee = EXCLUDED.fee,
        ticket_price = EXCLUDED.ticket_price,
        capacity = EXCLUDED.capacity,
        registered = EXCLUDED.registered,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        image = EXCLUDED.image,
        updated_at = NOW();
    `, [
      ev.id, ev.name, ev.title, ev.description, ev.date, ev.location, ev.place,
      ev.fee, ev.ticket_price, ev.capacity, ev.registered, ev.type, ev.status,
      ev.image, ASSOC_ID
    ]);
  }
  console.log(`4. Seeded/Updated ${seedEvents.length} official CEO 1983 events successfully!`);

  await client.end();
  console.log('Done!');
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
