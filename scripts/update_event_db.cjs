const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@113.20.107.184:6432/ceo1983_project?pgbouncer=true',
  ssl: false
});

async function run() {
  await client.connect();
  const bannerUrl = '/upload/file/avatars/00000000-0000-4000-8000-000000000002-1794424072529-tx43wu.jpg';
  const desc = 'Chương trình Kỷ niệm 4 năm Thành lập Viện Doanh Trí & Tọa đàm Kinh tế: Doanh Nghiệp Việt 2027 kết hợp Tri ân Ngày Nhà giáo Việt Nam 20/11. Chủ đề: Củng cố nội lực - Tạo đà tăng trưởng | Thị trường - Dòng tiền - Năng suất trong kỷ nguyên AI. Thời gian: 15:00 - 22:00 | Thứ Bảy, 21/11/2026. Địa điểm: Nhà hàng Long Phụng - Tầng 2, Tòa nhà 29T2, Hoàng Đạo Thúy, Cầu Giấy, Hà Nội. Phí tham dự: 0 VNĐ (Miễn phí cho Hội viên CEO 1983 & Khách mời danh dự).';

  await client.query(`
    UPDATE public.events
    SET 
      image = $1,
      banner = $1,
      time = '15:00 - 22:00',
      description = $2,
      fee = 0,
      ticket_price = 0,
      title = 'Kỷ Niệm 4 Năm Thành Lập Viện Doanh Trí & Tọa Đàm Kinh Tế: Doanh Nghiệp Việt 2027',
      updated_at = NOW()
    WHERE id = 'EV-MWCHPEKG'
  `, [bannerUrl, desc]);

  const res = await client.query('SELECT id, name, title, date, location, time, capacity, status, image, banner FROM public.events WHERE id = \'EV-MWCHPEKG\'');
  console.log('Updated Event in DB:');
  console.log(JSON.stringify(res.rows[0], null, 2));
  await client.end();
}

run().catch(console.error);

