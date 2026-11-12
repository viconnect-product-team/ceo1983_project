const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
  ssl: false
});

async function run() {
  await client.connect();

  await client.query(`
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tagline text DEFAULT '';
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_gallery_url text DEFAULT '';
  `);

  const eventId = 'EV-VIENDOANHTRI-2027';
  const assocId = 'c1983000-0000-4000-8000-000000001983';
  const bannerUrl = '/images/event/ky_niem_4_nam_vien_doanh_tri.jpg';

  const description = `Kính gửi Anh/Chị
- BTC trân trọng kính mời Anh/Chị tham dự sự kiện:
- Tên sự kiện: CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11 - TỌA ĐÀM KINH TẾ DOANH NGHIỆP VIỆT 2027: CỦNG CỐ NỘI LỰC - TẠO ĐÀ TĂNG TRƯỞNG
- Thông tin sự kiện gồm các trường:
  • Diễn giả: Ban Cố vấn Viện Doanh Trí, Các Chuyên Gia Kinh Tế Hàng Đầu & Thường Trực BĐH CLB Doanh Nhân CEO 1983 (HanoiBA)
  • Nội dung chính: Tọa đàm Kinh tế Doanh Nghiệp Việt 2027 (Củng cố nội lực - Tạo đà tăng trưởng | Thị trường - Dòng tiền - Năng suất trong kỷ nguyên AI); Lễ Kỷ niệm 4 năm thành lập Viện Doanh Trí (2022 - 2026) & Tri ân Ngày Nhà giáo Việt Nam 20/11; Tiệc Gala Dinner & Kết nối giao thương B2B
  • Thời gian: 15:00 - 22:00 | Thứ Bảy, 21/11/2026
  • Địa điểm: Nhà hàng Long Phụng - Tầng 2, Tòa nhà 29T2, Hoàng Đạo Thúy, Cầu Giấy, Hà Nội
  • Chi phí: 0 VNĐ (Miễn phí dành cho Hội viên CEO 1983 & Khách mời danh dự)
  • Google Maps: https://maps.google.com/?q=Nhà+hàng+Long+Phụng+29T2+Hoàng+Đạo+Thúy+Hà+Nội
  • Trang phục: Formal / Lịch sự trang trọng (Vest, Áo dài, Sơ mi trang trọng)
  • Gửi xe: Hầm B1 & B2 Tòa nhà 29T2 Hoàng Đạo Thúy (Có nhân viên hướng dẫn của BTC)
  • Lưu ý quan trọng từ BTC: Quý Anh/Chị vui lòng mang theo Thẻ danh thiếp số trên App CEO 1983 để quét mã QR check-in tại bàn lễ tân từ 14h30, ổn định vị trí bàn tiệc và nhận tài liệu tọa đàm
- Xác nhận tham dự: https://ceo1983.viconnect.vn/guest-event-register/EV-VIENDOANHTRI-2027
- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204
- Trân trọng!`;

  // 1. Upsert Event
  await client.query(`
    INSERT INTO public.events (
      id,
      association_id,
      name,
      title,
      tagline,
      date,
      time,
      location,
      place,
      capacity,
      status,
      fee,
      ticket_price,
      image,
      banner,
      photo_gallery_url,
      description,
      qr_fields,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      title = EXCLUDED.title,
      tagline = EXCLUDED.tagline,
      date = EXCLUDED.date,
      time = EXCLUDED.time,
      location = EXCLUDED.location,
      place = EXCLUDED.place,
      capacity = EXCLUDED.capacity,
      status = EXCLUDED.status,
      fee = EXCLUDED.fee,
      ticket_price = EXCLUDED.ticket_price,
      image = EXCLUDED.image,
      banner = EXCLUDED.banner,
      photo_gallery_url = EXCLUDED.photo_gallery_url,
      description = EXCLUDED.description,
      qr_fields = EXCLUDED.qr_fields,
      updated_at = NOW()
  `, [
    eventId,
    assocId,
    'KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TỌA ĐÀM KINH TẾ: DOANH NGHIỆP VIỆT 2027',
    'Kỷ Niệm 4 Năm Thành Lập Viện Doanh Trí & Tọa Đàm Kinh Tế: Doanh Nghiệp Việt 2027',
    'Thị trường - Dòng tiền - Năng suất trong kỷ nguyên AI',
    '2026-11-21',
    '15:00 - 22:00',
    'Nhà hàng Long Phụng - Tầng 2, Tòa nhà 29T2, Hoàng Đạo Thúy, Cầu Giấy, Hà Nội',
    'Nhà hàng Long Phụng - Tầng 2, Tòa nhà 29T2, Hoàng Đạo Thúy, Hà Nội',
    300,
    'upcoming',
    0,
    0,
    bannerUrl,
    bannerUrl,
    '',
    description,
    ['registration_code', 'member_code', 'phone']
  ]);

  // 2. Upsert Ticket Type
  await client.query(`
    INSERT INTO public.event_ticket_types (
      id,
      event_id,
      association_id,
      name,
      price,
      quantity,
      description,
      sort_order,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      quantity = EXCLUDED.quantity,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW()
  `, [
    'TKT-VDT-2027-VIP',
    eventId,
    assocId,
    'Vé Mời Danh Dự (Hội Viên CEO 1983 & Khách Mời)',
    0,
    300,
    'Bao gồm trọn gói tham dự Tọa đàm kinh tế, Tài liệu hội thảo chuyên sâu, Tiệc Gala Dinner và Kết nối giao thương B2B.',
    1
  ]);

  // Verify created event
  const res = await client.query('SELECT id, name, title, date, time, location, capacity, status, image, banner FROM public.events WHERE id = $1', [eventId]);
  console.log('✅ EVENT CREATED IN DATABASE SUCCESSFULLY:');
  console.log(JSON.stringify(res.rows[0], null, 2));

  const tkt = await client.query('SELECT * FROM public.event_ticket_types WHERE event_id = $1', [eventId]);
  console.log('\n✅ TICKET CREATED:');
  console.log(JSON.stringify(tkt.rows, null, 2));

  await client.end();
}

run().catch(console.error);
