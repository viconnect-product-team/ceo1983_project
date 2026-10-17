import fs from 'fs';
import path from 'path';

console.log('>>> BẮT ĐẦU CẬP NHẬT TÀI LIỆU HDSD CEO 1983 PLAYBOOK 18: BỔ SUNG ĐẦY ĐỦ 100% BẢNG ĐẶC TẢ CÁC TRƯỜNG DỮ LIỆU Ở MỌI CHỨC NĂNG...');

const outputFile = path.resolve('docs/training/HDSD_HE_THONG_CEO1983_CHUAN_HOA.html');

// Đọc file HTML hiện tại
let html = fs.readFileSync(outputFile, 'utf8');

// Bổ sung bảng cho Chương 3 (Trang chủ)
const tableC3 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Khối Thông tin & Trường Dữ liệu trên Trang Chủ:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Phần tử / Trường dữ liệu</th>
          <th style="width: 12%;">Hiển thị</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Nội dung hiển thị</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Lời chào cá nhân hóa</strong></td>
          <td>Tự động</td>
          <td><code>Text</code></td>
          <td>Xin chào Doanh nhân [Họ tên], Chúc một ngày giao thương thịnh vượng!</td>
          <td>Tạo cảm giác gắn kết, trang trọng và chào đón hội viên mỗi lần mở ứng dụng.</td>
        </tr>
        <tr>
          <td><strong>Banner Thông điệp Ban Thường trực</strong></td>
          <td>Tự động</td>
          <td><code>Image / Carousel</code></td>
          <td>Hình ảnh các sự kiện lớn, Gala kỷ niệm hoặc khẩu hiệu hành động nhiệm kỳ.</td>
          <td>Truyền tải định hướng chiến lược và thông điệp chỉ đạo của Chủ tịch hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Khối Tiện ích 1-Chạm (Quick Actions)</strong></td>
          <td>Cố định</td>
          <td><code>Grid Icons</code></td>
          <td>Thẻ VIP, Danh bạ B2B, Đăng cơ hội hợp tác, Quét mã QR, Điểm danh sự kiện.</td>
          <td>Tiết kiệm 80% thời gian thao tác cho doanh nhân khi cần kết nối nhanh.</td>
        </tr>
        <tr>
          <td><strong>Danh sách Sinh nhật Doanh nhân tuần</strong></td>
          <td>Tự động</td>
          <td><code>Avatar List + Name</code></td>
          <td>Ảnh đại diện, Họ tên, Tên công ty và ngày sinh nhật của hội viên trong tuần.</td>
          <td>Gợi ý gửi lời chúc mừng sinh nhật, thắt chặt tình cảm đồng chí, đồng niên.</td>
        </tr>
        <tr>
          <td><strong>Bảng tin Hoạt động & Thông báo mới</strong></td>
          <td>Thời gian thực</td>
          <td><code>Feed Cards</code></td>
          <td>Tiêu đề tin tức, thời gian đăng, tóm tắt nội dung và nút xem chi tiết.</td>
          <td>Cập nhật liên tục dòng chảy sinh hoạt hiệp hội và các cơ hội kinh doanh mới.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 4 (Thẻ VIP)
const tableC4 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Thông tin trên Thẻ VIP & Danh Thiếp Số vCard:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Vị trí hiển thị</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Giá trị mẫu / Hướng dẫn</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Họ và tên Doanh nhân</strong></td>
          <td>Mặt trước thẻ</td>
          <td><code>Text (In hoa)</code></td>
          <td>NGUYỄN TUẤN ANH</td>
          <td>Khẳng định danh tính chính thức của chủ doanh nghiệp hội viên.</td>
        </tr>
        <tr>
          <td><strong>Chức vụ điều hành</strong></td>
          <td>Mặt trước thẻ</td>
          <td><code>Text</code></td>
          <td>Chủ tịch HĐQT & Tổng Giám đốc</td>
          <td>Xác lập vị thế lãnh đạo cao nhất của doanh nghiệp trong cộng đồng.</td>
        </tr>
        <tr>
          <td><strong>Tên Doanh nghiệp</strong></td>
          <td>Mặt trước thẻ</td>
          <td><code>Text</code></td>
          <td>Tập đoàn Công nghệ Ánh Dương</td>
          <td>Quảng bá thương hiệu pháp nhân doanh nghiệp đến các đối tác.</td>
        </tr>
        <tr>
          <td><strong>Mã Hội viên Độc bản</strong></td>
          <td>Góc dưới mặt trước</td>
          <td><code>Code (Viết hoa)</code></td>
          <td><code>CEO-1983-007</code></td>
          <td>Mã số định danh duy nhất, chống giả mạo danh xưng thành viên CLB.</td>
        </tr>
        <tr>
          <td><strong>Hạng Thẻ Hội viên</strong></td>
          <td>Góc trên thẻ</td>
          <td><code>Badge Gold</code></td>
          <td>VIP MEMBER / DIAMOND MEMBER</td>
          <td>Phân cấp quyền lợi và sự đóng góp cống hiến cho hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Mã QR Code Định Danh Động</strong></td>
          <td>Mặt sau thẻ</td>
          <td><code>QR Code 2D</code></td>
          <td>Chứa liên kết hồ sơ danh thiếp số công khai</td>
          <td>Cho phép đối tác quét camera để xem profile đầy đủ trên trình duyệt.</td>
        </tr>
        <tr>
          <td><strong>Tệp Danh Bạ Điện Tử (vCard .vcf)</strong></td>
          <td>Nút chức năng</td>
          <td><code>Action (.vcf)</code></td>
          <td>Lưu tự động Tên, SĐT, Email, Công ty, Chức vụ</td>
          <td>Lưu thẳng vào danh bạ iPhone / Android chỉ sau 1 chạm không cần gõ phím.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 5 (Danh bạ B2B)
const tableC5 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Tìm Kiếm & Thông Tin Danh Bạ B2B:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường lọc / Tìm kiếm</th>
          <th style="width: 12%;">Kiểu điều khiển</th>
          <th style="width: 15%;">Dữ liệu hỗ trợ</th>
          <th style="width: 25%;">Hướng dẫn sử dụng</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Thanh Tìm kiếm Toàn văn</strong></td>
          <td><code>Input Search</code></td>
          <td>Text tự do</td>
          <td>Gõ tên doanh nhân, tên công ty hoặc từ khóa sản phẩm.</td>
          <td>Tra cứu nhanh đối tác theo nhu cầu mua sắm hoặc hợp tác tức thời.</td>
        </tr>
        <tr>
          <td><strong>Lọc theo Ban Chuyên Môn</strong></td>
          <td><code>Tabs ngang</code></td>
          <td>Tất cả, XTTM, Pháp chế, Tài chính, Đào tạo, Phong trào...</td>
          <td>Chạm vào ban tương ứng để xem các thành viên thuộc ban đó.</td>
          <td>Tìm kiếm đầu mối công tác và phối hợp công việc theo chuyên ban.</td>
        </tr>
        <tr>
          <td><strong>Lọc theo Ngành Nghề Kinh Doanh</strong></td>
          <td><code>Dropdown Filter</code></td>
          <td>Bất động sản, Xây dựng, Công nghệ, Y tế, Giáo dục, F&B...</td>
          <td>Chọn ngành nghề mục tiêu cần tìm nhà cung cấp hoặc đối tác chiến lược.</td>
          <td>Khớp nối chuỗi cung ứng B2B nội bộ không qua trung gian môi giới.</td>
        </tr>
        <tr>
          <td><strong>Huy hiệu Xác thực Chính Danh</strong></td>
          <td><code>Icon Verified</code></td>
          <td>Tích xanh chính thức</td>
          <td>Hiển thị cạnh tên doanh nhân đã được thẩm định pháp lý 100%.</td>
          <td>Tạo lập sự tin cậy tuyệt đối trước khi tiến hành các giao dịch kinh tế lớn.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 6 (Tin nhắn & Chat)
const tableC6 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Thao Tác trong Cửa Sổ Hội Thoại:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Phần tử thao tác</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Ô nhập Nội dung Tin nhắn</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Textarea</code></td>
          <td>Nhập văn bản trao đổi công việc, đàm phán hợp đồng.</td>
          <td>Truyền tải thông điệp nhanh chóng, bảo mật giữa 2 doanh nhân.</td>
        </tr>
        <tr>
          <td><strong>Đính kèm Tệp Tài liệu</strong></td>
          <td>Không</td>
          <td><code>File (PDF/DOC/XLS)</code></td>
          <td>Chọn tệp hợp đồng mẫu, báo giá, hồ sơ năng lực dưới 25MB.</td>
          <td>Chia sẻ tài liệu kinh doanh trực tiếp không cần qua email ngoài.</td>
        </tr>
        <tr>
          <td><strong>Đính kèm Hình ảnh Sản phẩm</strong></td>
          <td>Không</td>
          <td><code>Image (JPG/PNG)</code></td>
          <td>Chụp ảnh trực tiếp hoặc chọn từ thư viện ảnh điện thoại.</td>
          <td>Minh họa sản phẩm thực tế, catalogue mẫu mã sản phẩm trao đổi.</td>
        </tr>
        <tr>
          <td><strong>Nút Gọi Đàm thoại Mã hóa</strong></td>
          <td>—</td>
          <td><code>Button Action</code></td>
          <td>Bấm biểu tượng điện thoại góc trên để gọi thoại/video HD.</td>
          <td>Đàm thoại trực tiếp bảo mật, chuông báo nổi trên màn hình khóa.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 7 (Cơ hội kinh doanh B2B)
const tableC7 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Biểu mẫu Đăng Cơ Hội Kinh Doanh:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập liệu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiêu đề Cơ hội Hợp tác</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Tìm nhà thầu thi công nhôm kính dự án 50 tỷ tại Hà Nội.</td>
          <td>Tóm tắt ngắn gọn nhu cầu cốt lõi thu hút sự chú ý của các đối tác tiềm năng.</td>
        </tr>
        <tr>
          <td><strong>Lĩnh vực Ngành nghề</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn ngành nghề tương ứng: Xây dựng, Vật liệu, Tài chính, IT...</td>
          <td>Định tuyến thông báo tự động tới các doanh nghiệp hoạt động cùng lĩnh vực.</td>
        </tr>
        <tr>
          <td><strong>Giá trị Hợp đồng Dự kiến</strong></td>
          <td>Không</td>
          <td><code>Currency (VNĐ)</code></td>
          <td>Nhập số tiền ước tính (Ví dụ: 5.000.000.000 VNĐ).</td>
          <td>Giúp đối tác đánh giá quy mô dự án và năng lực đáp ứng của doanh nghiệp.</td>
        </tr>
        <tr>
          <td><strong>Hạn chót Nhận Hồ sơ</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Date (dd/mm/yyyy)</code></td>
          <td>Chọn ngày kết thúc nhận hồ sơ chào thầu/kết nối.</td>
          <td>Tạo tính cấp thiết và giúp hệ thống tự động đóng deal khi hết hạn.</td>
        </tr>
        <tr>
          <td><strong>Mô tả Yêu cầu Chi tiết</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Textarea</code></td>
          <td>Mô tả tiêu chuẩn kỹ thuật, năng lực tối thiểu, phương thức hợp tác.</td>
          <td>Cung cấp đầy đủ đầu bài để các bên tham gia chuẩn bị hồ sơ chào giá chuẩn xác.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 8 (Chợ sản phẩm B2B)
const tableC8 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Biểu mẫu Đăng Sản Phẩm Gian Hàng:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập liệu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tên Sản phẩm / Dịch vụ</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Gói giải pháp phần mềm quản trị ERP cho doanh nghiệp SMEs.</td>
          <td>Tên gọi thương mại hiển thị tại gian hàng và kết quả tìm kiếm.</td>
        </tr>
        <tr>
          <td><strong>Danh mục Ngành hàng</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn phân loại: Công nghệ, Quà tặng doanh nghiệp, Nội thất...</td>
          <td>Xếp vào đúng gian hàng ngành nghề trên Sàn giao thương B2B.</td>
        </tr>
        <tr>
          <td><strong>Giá Niêm yết Thị trường</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Currency (VNĐ)</code></td>
          <td>Giá bán công khai ngoài thị trường (Ví dụ: 100.000.000 VNĐ).</td>
          <td>Làm mốc đối chiếu giá trị thực tế của sản phẩm.</td>
        </tr>
        <tr>
          <td><strong>Mức Ưu đãi Hội viên CEO 1983</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Percent / Currency</code></td>
          <td>Chiết khấu riêng cho hội viên (Ví dụ: Giảm 20% hoặc giá ưu đãi 80 triệu).</td>
          <td>Thực thi cam kết tương trợ nội bộ, ưu đãi đặc quyền giữa các thành viên CLB.</td>
        </tr>
        <tr>
          <td><strong>Hình ảnh Sản phẩm Chất lượng Cao</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Files (Tối đa 5 ảnh)</code></td>
          <td>Tải lên ảnh chụp sản phẩm thực tế, độ phân giải sắc nét, nền sạch.</td>
          <td>Tăng độ tin cậy và kích thích quyết định mua hàng của các CEO.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 9 (Sự kiện & Vé E-ticket)
const tableC9 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Dữ liệu trong Vé Mời Sự Kiện E-Ticket:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Thông tin hiển thị</th>
          <th style="width: 12%;">Tính chất</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Giá trị mẫu / Quy chuẩn</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tên Sự kiện</strong></td>
          <td>Bắt buộc</td>
          <td><code>Text</code></td>
          <td>DẠ TIỆC GALA KẾT NỐI DOANH NHÂN CEO 1983</td>
          <td>Xác định rõ sự kiện mà hội viên đã đăng ký tham dự.</td>
        </tr>
        <tr>
          <td><strong>Thời gian & Địa điểm</strong></td>
          <td>Bắt buộc</td>
          <td><code>Datetime + Location</code></td>
          <td>20:00 - 23:00, 26/10/2026 · Khách sạn Melia Hà Nội</td>
          <td>Hướng dẫn thời gian và địa chỉ khán phòng đón tiếp đại biểu.</td>
        </tr>
        <tr>
          <td><strong>Mã Vé QR Check-in</strong></td>
          <td>Độc bản</td>
          <td><code>QR Code</code></td>
          <td>Mã vé điện tử mã hóa chống làm giả</td>
          <td>Dùng để quét tại cửa soát vé Gatekeeper trong 0.1 giây.</td>
        </tr>
        <tr>
          <td><strong>Vị trí Ghế ngồi Khán phòng</strong></td>
          <td>Định danh</td>
          <td><code>Seat Code</code></td>
          <td>Hàng ghế A - Số ghế 08 (Zone VIP)</td>
          <td>Định vị chính xác chỗ ngồi danh dự theo Sơ đồ Cinema Seating Map.</td>
        </tr>
        <tr>
          <td><strong>Mã Số May Mắn (Lucky Draw)</strong></td>
          <td>Tự động</td>
          <td><code>Number (#XXXX)</code></td>
          <td><code>#8388</code></td>
          <td>Số thứ tự tham gia quay thưởng các phần quà giá trị tại Gala.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 10 (Khảo sát & Biểu quyết voting)
const tableC10 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Thông tin Phiếu Bầu Cử Điện Tử:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Quy chuẩn hiển thị</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiêu đề Kỳ Bỏ Phiếu</strong></td>
          <td>Bắt buộc</td>
          <td><code>Text</code></td>
          <td>Bầu cử Ban Thường trực CLB CEO 1983 Nhiệm kỳ 2026 - 2028</td>
          <td>Xác định rõ nội dung và mục đích chính trị của đợt lấy phiếu tín nhiệm.</td>
        </tr>
        <tr>
          <td><strong>Danh sách Ứng viên / Phương án</strong></td>
          <td>Bắt buộc</td>
          <td><code>Option List</code></td>
          <td>Ảnh đại diện, Họ tên, Chức vụ và Đề án hành động của từng ứng viên.</td>
          <td>Cung cấp cơ sở dữ liệu minh bạch để cử tri nghiên cứu trước khi bỏ phiếu.</td>
        </tr>
        <tr>
          <td><strong>Phương thức Lựa chọn</strong></td>
          <td>Bắt buộc</td>
          <td><code>Single / Multi Select</code></td>
          <td>Chọn 1 phương án duy nhất hoặc chọn tối đa N ứng viên theo điều lệ.</td>
          <td>Đảm bảo phiếu bầu hợp lệ đúng theo quy chế bầu cử đã ban hành.</td>
        </tr>
        <tr>
          <td><strong>Xác thực Lá phiếu Bảo mật</strong></td>
          <td>Tự động</td>
          <td><code>SHA-256 Hash</code></td>
          <td>Mã hóa danh tính cử tri, đảm bảo nguyên tắc bỏ phiếu kín 100%.</td>
          <td>Bảo vệ quyền dân chủ và tính khách quan tuyệt đối của đại hội.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 11 (Niên liễm VietQR)
const tableC11 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Hóa Đơn & Mã VietQR Đóng Phí:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Tính chất</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Quy chuẩn hiển thị</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Niên độ Tài chính</strong></td>
          <td>Bắt buộc</td>
          <td><code>Text</code></td>
          <td>Hội phí thường niên năm 2026 (01/01/2026 - 31/12/2026)</td>
          <td>Xác định kỳ niên liễm áp dụng cho giao dịch thanh toán.</td>
        </tr>
        <tr>
          <td><strong>Số tiền Niên liễm</strong></td>
          <td>Cố định</td>
          <td><code>Currency (VNĐ)</code></td>
          <td>10.000.000 VNĐ (Theo Nghị quyết Đại hội thường niên)</td>
          <td>Số tiền chuẩn xác được khóa cứng trên mã QR, không thể chỉnh sửa sai lệch.</td>
        </tr>
        <tr>
          <td><strong>Mã VietQR Chuẩn Napas 247</strong></td>
          <td>Tự động sinh</td>
          <td><code>Dynamic QR</code></td>
          <td>Nhúng sẵn STK Ngân hàng MBBank, số tiền và nội dung chuyển khoản.</td>
          <td>Mở ứng dụng ngân hàng quét là tiền chuyển ngay, loại bỏ sai sót số tài khoản.</td>
        </tr>
        <tr>
          <td><strong>Cú pháp Nội dung Chuyển khoản</strong></td>
          <td>Bắt buộc</td>
          <td><code>Syntax Code</code></td>
          <td><code>HOIPHI [Mã Hội Viên] [Số Điện Thoại]</code></td>
          <td>Webhook ngân hàng đọc cú pháp này để tự động gạch nợ tức thời 24/7.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 12 (Hồ sơ cá nhân)
const tableC12 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Cập Nhật Hồ Sơ Doanh Nhân 360°:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Ảnh đại diện Avatar</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Image (JPG/PNG)</code></td>
          <td>Ảnh chân dung lịch sự, kích thước tối thiểu 500x500px.</td>
          <td>Hiển thị trên Thẻ VIP, danh bạ và các vị trí danh dự trong ứng dụng.</td>
        </tr>
        <tr>
          <td><strong>Mã số thuế Doanh nghiệp</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Tax Code (10-13 số)</code></td>
          <td>Ví dụ: 0101234567 (Mã số thuế pháp nhân đang đứng tên đại diện).</td>
          <td>Xác minh tính chính danh và tra cứu năng lực tài chính doanh nghiệp.</td>
        </tr>
        <tr>
          <td><strong>Địa chỉ Trụ sở Công ty</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Nhập địa chỉ trụ sở chính (Số nhà, đường, quận/huyện, tỉnh/thành).</td>
          <td>Dùng để ban thư ký gửi văn bản, kỷ yếu và hỗ trợ kết nối đối tác địa phương.</td>
        </tr>
        <tr>
          <td><strong>Website & Mạng xã hội</strong></td>
          <td>Không</td>
          <td><code>URL</code></td>
          <td>Địa chỉ website công ty, fanpage hoặc trang LinkedIn.</td>
          <td>Tích hợp vào liên kết danh thiếp số vCard để đối tác dễ dàng tìm hiểu thêm.</td>
        </tr>
        <tr>
          <td><strong>Giới thiệu Năng lực Cốt lõi</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Textarea</code></td>
          <td>Nêu ngắn gọn 3 thế mạnh vượt trội của doanh nghiệp và nhu cầu hợp tác.</td>
          <td>Giúp các hội viên khác nhận diện cơ hội kinh doanh phù hợp để bắt tay kết nối.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 17 (Quản trị sự kiện, Sơ đồ ghế Cinema & Khách mời)
const tableC17 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Form Khởi Tạo Sự Kiện CRM:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập liệu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tên Chương trình Sự kiện</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: ĐẠI HỘI DOANH NHÂN CEO 1983 & GALA DINNER KỶ NIỆM.</td>
          <td>Tên chính thức hiển thị trên toàn bộ banner, vé mời và báo cáo.</td>
        </tr>
        <tr>
          <td><strong>Loại hình Sự kiện</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Gala Dinner, Tọa đàm kinh tế, Họp Ban Chấp hành, Thể thao Golf...</td>
          <td>Phân loại sự kiện để áp dụng quy chế đón tiếp và đối tượng tham dự phù hợp.</td>
        </tr>
        <tr>
          <td><strong>Thời gian Bắt đầu & Kết thúc</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Datetime Range</code></td>
          <td>Chọn ngày, giờ đón khách và giờ bế mạc chương trình.</td>
          <td>Hệ thống gửi thông báo nhắc lịch tự động trước 24h và 2h cho đại biểu.</td>
        </tr>
        <tr>
          <td><strong>Địa điểm Tổ chức Khán phòng</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Tên trung tâm hội nghị, số phòng, địa chỉ chi tiết kèm link Google Maps.</td>
          <td>Hướng dẫn dẫn đường chuẩn xác cho đại biểu đến đúng sảnh sự kiện.</td>
        </tr>
        <tr>
          <td><strong>Quy mô Sức chứa (Capacity)</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Number</code></td>
          <td>Nhập số lượng ghế tối đa (Ví dụ: 300 chỗ ngồi).</td>
          <td>Kiểm soát tự động số lượng đăng ký; đóng cổng khi đủ số lượng đón tiếp.</td>
        </tr>
        <tr>
          <td><strong>Phí Tham dự (Ticket Price)</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Currency (VNĐ)</code></td>
          <td>Nhập 0 đ (Nếu miễn phí) hoặc mức phí đại biểu (Ví dụ: 1.500.000 đ).</td>
          <td>Hệ thống tự động kích hoạt mã VietQR thanh toán nếu có thu phí.</td>
        </tr>
      </tbody>
    </table>

    <div class="trn-sec-title">3. Đặc tả Chi tiết các Trường trong Form Đăng Ký Khách Mời Ngoài (Zalo / Web):</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Họ và tên Đại biểu</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Nhập đầy đủ họ tên có dấu (Ví dụ: Nguyễn Tuấn Anh).</td>
          <td>In thẻ đeo đại biểu VIP và cấp mã quay thưởng may mắn Lucky Draw.</td>
        </tr>
        <tr>
          <td><strong>Địa chỉ Email chính thức</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Email</code></td>
          <td>Nhập email nhận vé (Ví dụ: tuananh.ceo@vietants.vn).</td>
          <td>Hệ thống tự động gửi vé mời điện tử E-Ticket và thư cảm ơn về email này.</td>
        </tr>
        <tr>
          <td><strong>Số điện thoại Di động</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Phone (10 số)</code></td>
          <td>Số điện thoại liên lạc trực tiếp (Ví dụ: 0988665544).</td>
          <td>Dùng để ban lễ tân tra cứu khi soát vé và gửi tin nhắn Zalo nhắc lịch.</td>
        </tr>
        <tr>
          <td><strong>Tên Đơn vị / Doanh nghiệp</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Tập đoàn Công nghệ Ánh Dương.</td>
          <td>Ghi nhận hồ sơ khách mời và phục vụ chương trình kết nối giao thương B2B.</td>
        </tr>
        <tr>
          <td><strong>Chức vụ / Chức danh Lãnh đạo</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Chủ tịch HĐQT / Tổng Giám đốc.</td>
          <td>Làm cơ sở để Ban Tổ Chức bố trí vị trí hàng ghế VIP danh dự phù hợp.</td>
        </tr>
        <tr>
          <td><strong>Ghi chú Yêu cầu Đón tiếp</strong></td>
          <td>Không</td>
          <td><code>Textarea</code></td>
          <td>Yêu cầu ăn kiêng, số lượng xe đưa đón hoặc đề xuất kết nối riêng.</td>
          <td>Giúp Ban Hậu cần chuẩn bị chu đáo nhất cho từng vị khách quý.</td>
        </tr>
      </tbody>
    </table>

    <div class="trn-sec-title">4. Đặc tả Dữ liệu Sơ Đồ Xếp Chỗ Rạp Phim (Cinema Seating Map):</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Thuộc tính ghế</th>
          <th style="width: 12%;">Định dạng</th>
          <th style="width: 15%;">Quy ước màu</th>
          <th style="width: 25%;">Ý nghĩa phân loại</th>
          <th style="width: 28%;">Thao tác vận hành</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Mã Ghế (Seat Code)</strong></td>
          <td><code>A01, B12...</code></td>
          <td>Hiển thị trên mặt ghế</td>
          <td>Định vị hàng chữ cái (A->Z) và số ghế từ trái sang phải.</td>
          <td>Nhấp chuột vào ghế để xem thông tin đại biểu đang ngồi.</td>
        </tr>
        <tr>
          <td><strong>Ghế VIP Lãnh Đạo</strong></td>
          <td><code>Zone VIP</code></td>
          <td><span style="color:#D97706; font-weight:bold;">Vàng Amber (#F59E0B)</span></td>
          <td>Hàng ghế danh dự gần sân khấu nhất cho Khách mời Trung ương & HanoiBA.</td>
          <td>Chỉ định đích danh đại biểu cấp cao, khóa ghế không cho đổi tự do.</td>
        </tr>
        <tr>
          <td><strong>Ghế Ban Chấp Hành</strong></td>
          <td><code>Zone BCH</code></td>
          <td><span style="color:#003B95; font-weight:bold;">Xanh Navy (#003B95)</span></td>
          <td>Dành riêng cho các Ủy viên Ban Chấp hành và Trưởng các ban chuyên môn.</td>
          <td>Gán tự động theo danh sách nhân sự ban điều hành hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Ghế Hội Viên / Khách Mời</strong></td>
          <td><code>Zone Standard</code></td>
          <td><span style="color:#10B981; font-weight:bold;">Xanh Ngọc (#10B981)</span></td>
          <td>Dành cho toàn thể hội viên chính thức và đại biểu doanh nhân tham dự.</td>
          <td>Gán tự động theo thứ tự check-in hoặc xếp trước theo bàn tiệc.</td>
        </tr>
        <tr>
          <td><strong>Ghế Đang Trống (Available)</strong></td>
          <td><code>Trạng thái</code></td>
          <td>Trắng viền xám</td>
          <td>Ghế chưa có người ngồi, sẵn sàng tiếp nhận phân bổ.</td>
          <td>Kéo thả hoặc chọn đại biểu từ danh sách bên phải để gán vào ghế.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 18 (Cổng check-in & Soát vé)
const tableC18 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Hộp Thoại Soát Vé Gatekeeper:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu / Thao tác</th>
          <th style="width: 12%;">Tính chất</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Quy chuẩn hiển thị</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Chọn Sự Kiện Điểm Danh</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn sự kiện đang diễn ra trong ngày từ danh sách.</td>
          <td>Khóa phạm vi soát vé, đảm bảo không quét nhầm vé của sự kiện khác.</td>
        </tr>
        <tr>
          <td><strong>Khung Quét Camera QR Siêu Tốc</strong></td>
          <td>Thời gian thực</td>
          <td><code>Webcam Stream</code></td>
          <td>Tự động nhận diện mã QR trong vùng quét ở khoảng cách 15 - 50cm.</td>
          <td>Điểm danh không chạm trong 0.1 giây, giải tỏa ùn tắc bàn lễ tân.</td>
        </tr>
        <tr>
          <td><strong>Thẻ Thông Tin Đại Biểu Quét Thành Công</strong></td>
          <td>Hiển thị to rõ</td>
          <td><code>Card Popup</code></td>
          <td>Hiện Ảnh chân dung, Họ tên, Đơn vị công tác, Vị trí ghế ngồi (VIP A08).</td>
          <td>Lễ tân chào đón đúng tên và cử nhân sự dẫn đường đại biểu về đúng ghế.</td>
        </tr>
        <tr>
          <td><strong>Mã QR Standee Zalo Công Khai</strong></td>
          <td>Tải về / In ấn</td>
          <td><code>QR Vector / PNG</code></td>
          <td>Mã QR chứa liên kết <code>/events/:id/register?source=zalo_guest</code>.</td>
          <td>In standee A4 hoặc đặt tại sảnh để khách mời ngoài quét Zalo đăng ký ngay.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 19 (Kanban công việc)
const tableC19 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Biểu mẫu Giao Việc Ban Chấp Hành:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập liệu</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiêu đề Công việc / Nhiệm vụ</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Hoàn tất dự toán tài chính và hợp đồng thuê địa điểm Gala 2026.</td>
          <td>Tên công việc ngắn gọn hiển thị trên thẻ bài Kanban.</td>
        </tr>
        <tr>
          <td><strong>Ban Chuyên Môn Phụ Trách</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn: Ban Xúc tiến Thương mại, Ban Tài chính, Ban Thư ký...</td>
          <td>Gắn trách nhiệm trực tiếp cho người đứng đầu ban chuyên trách.</td>
        </tr>
        <tr>
          <td><strong>Người Thực Hiện Chính</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Chọn ủy viên hoặc cán bộ văn phòng được phân công đích danh.</td>
          <td>Hệ thống gửi thông báo nhắc việc và chuông cảnh báo tới người này.</td>
        </tr>
        <tr>
          <td><strong>Mức Độ Ưu Tiên</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Badge</code></td>
          <td>Khẩn cấp (Đỏ), Cao (Cam), Trung bình (Vàng), Thấp (Xanh).</td>
          <td>Xác định thứ tự ưu tiên xử lý trong các cuộc họp giao ban hàng tuần.</td>
        </tr>
        <tr>
          <td><strong>Hạn Chót Hoàn Thành (Deadline)</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Datetime (dd/mm/yyyy hh:mm)</code></td>
          <td>Chọn thời hạn cuối cùng phải nộp kết quả nghiệm thu.</td>
          <td>Hệ thống tự động đổi màu thẻ sang Đỏ và gửi cảnh báo khi sắp quá hạn.</td>
        </tr>
        <tr>
          <td><strong>Mô tả Yêu cầu & File Đính kèm</strong></td>
          <td>Không</td>
          <td><code>Textarea + File</code></td>
          <td>Nội dung chỉ đạo của Chủ tịch và các tệp dự toán đính kèm.</td>
          <td>Cung cấp đầy đủ tài liệu căn cứ để người thực hiện triển khai chuẩn xác.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 20 (Cuộc họp)
const tableC20 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Thiết Lập Cuộc Họp & Phát Giấy Mời:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Chủ đề Cuộc họp</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Họp Ban Thường trực CLB CEO 1983 - Kỳ họp Quý IV/2026.</td>
          <td>Tiêu đề giấy mời họp gửi tới điện thoại và email của các đại biểu.</td>
        </tr>
        <tr>
          <td><strong>Hình thức Tổ chức</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Radio</code></td>
          <td>Trực tiếp tại trụ sở / Trực tuyến qua Zoom / Kết hợp Hybrid.</td>
          <td>Quyết định phương thức tiếp đón và chuẩn bị phòng họp kỹ thuật.</td>
        </tr>
        <tr>
          <td><strong>Thời gian & Địa điểm / Link Họp</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Datetime + Location</code></td>
          <td>Nhập thời gian họp, phòng họp hoặc đường link Zoom bảo mật.</td>
          <td>Đồng bộ tự động vào lịch công tác điện tử của từng ủy viên.</td>
        </tr>
        <tr>
          <td><strong>Thành phần Bắt buộc Tham dự</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Multi Select</code></td>
          <td>Chọn danh sách các Ủy viên Ban Chấp hành hoặc Ban chuyên môn.</td>
          <td>Kiểm soát danh sách điểm danh và tính hợp lệ của kỳ họp theo Điều lệ.</td>
        </tr>
        <tr>
          <td><strong>Tài liệu Cuộc họp Đính kèm</strong></td>
          <td>Không</td>
          <td><code>File (PDF/DOCX)</code></td>
          <td>Tải lên trước dự thảo Nghị quyết, báo cáo tài chính phục vụ kỳ họp.</td>
          <td>Giúp các đại biểu nghiên cứu kỹ lưỡng trước khi phát biểu đóng góp ý kiến.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 21 (Quản trị tài chính & Niên liễm)
const tableC21 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường trong Sổ Quỹ Thu Chi & Đối Soát Hội Phí:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Quy chuẩn hiển thị</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Mã Chứng Từ Giao Dịch</strong></td>
          <td>Tự động</td>
          <td><code>Code (Viết hoa)</code></td>
          <td><code>PT-2026-088</code> (Phiếu thu) hoặc <code>PC-2026-024</code> (Phiếu chi).</td>
          <td>Định danh chứng từ kế toán, phục vụ công tác thanh kiểm tra tài chính.</td>
        </tr>
        <tr>
          <td><strong>Khoản mục Thu / Chi</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Category</code></td>
          <td>Hội phí thường niên, Tài trợ sự kiện, Chi thuê hội trường, Chi thiện nguyện...</td>
          <td>Phân loại ngân sách theo đúng quy chế quản lý tài chính của hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Số tiền Thực tế</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Currency (VNĐ)</code></td>
          <td>Nhập số tiền phát sinh (Ví dụ: 150.000.000 VNĐ).</td>
          <td>Ghi nhận biến động số dư thực tế trong tài khoản ngân hàng hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Hội viên / Đơn vị Nộp hoặc Nhận</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text / Select</code></td>
          <td>Chọn tên Doanh nghiệp hội viên hoặc đơn vị cung cấp dịch vụ ngoài.</td>
          <td>Lưu trữ đối tượng giao dịch minh bạch, chống thất thoát quỹ hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Trạng thái Đối soát Ngân hàng</strong></td>
          <td>Tự động</td>
          <td><code>Status Badge</code></td>
          <td>ĐÃ KHỚP LỆNH (Xanh) / CHỜ XÁC MINH (Vàng) / HỦY (Đỏ).</td>
          <td>Tự động xác nhận giao dịch qua biến động số dư VietQR chuẩn xác 100%.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 22 (Kiểm duyệt chợ B2B)
const tableC22 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Phê Duyệt Sản Phẩm Sàn B2B:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Trường dữ liệu</th>
          <th style="width: 12%;">Tính chất</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Nội dung kiểm tra</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Thông tin Sản phẩm & Doanh nghiệp</strong></td>
          <td>Thẩm định</td>
          <td><code>Card Overview</code></td>
          <td>Tên sản phẩm, Logo, Tên công ty thành viên, Mã số thuế.</td>
          <td>Đảm bảo sản phẩm do chính doanh nghiệp hội viên sản xuất hoặc phân phối.</td>
        </tr>
        <tr>
          <td><strong>Giấy Chứng Nhận Tiêu Chuẩn Chất Lượng</strong></td>
          <td>Bắt buộc kiểm tra</td>
          <td><code>File Image / PDF</code></td>
          <td>Chứng nhận ISO, CO/CQ, Giấy phép an toàn thực phẩm (nếu có).</td>
          <td>Bảo vệ uy tín hiệp hội, ngăn chặn hàng giả, hàng kém chất lượng.</td>
        </tr>
        <tr>
          <td><strong>Chính sách Ưu đãi Dành cho CLB</strong></td>
          <td>Bắt buộc</td>
          <td><code>Discount Rule</code></td>
          <td>Tối thiểu chiết khấu từ 5% - 30% so với giá bán lẻ ngoài thị trường.</td>
          <td>Đảm bảo hội viên nhận được giá trị kinh tế thực chất khi mua bán nội bộ.</td>
        </tr>
        <tr>
          <td><strong>Quyết định Phê duyệt</strong></td>
          <td>Thao tác ban</td>
          <td><code>Action Buttons</code></td>
          <td>Nút "Phê Duyệt Đăng Tải" hoặc "Từ Chối Kèm Lý Do".</td>
          <td>Đưa sản phẩm lên chợ di động hoặc gửi hướng dẫn bổ sung hồ sơ cho hội viên.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 23 (Khảo sát & Bầu cử)
const tableC23 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Thiết Lập Cuộc Bầu Cử Trực Tuyến:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiêu đề Cuộc Bầu Cử / Thăm Dò</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Bỏ phiếu Tín nhiệm Nhân sự Ban Thường trực Khóa II.</td>
          <td>Tên chính thức hiển thị trên hòm phiếu điện tử của từng cử tri.</td>
        </tr>
        <tr>
          <td><strong>Thời gian Mở & Khóa Hòm Phiếu</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Datetime Range</code></td>
          <td>Giờ mở cổng bỏ phiếu và giờ đóng cổng chính xác từng giây.</td>
          <td>Đảm bảo tính pháp lý và thời hạn bỏ phiếu nghiêm ngặt của Đại hội.</td>
        </tr>
        <tr>
          <td><strong>Danh sách Ứng viên Bầu cử</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Candidate List</code></td>
          <td>Nhập danh sách ứng cử viên, tải ảnh và tóm tắt đề án công tác.</td>
          <td>Hiển thị trang trọng, đồng đều cơ hội cho các ứng viên trước đại hội.</td>
        </tr>
        <tr>
          <td><strong>Tỷ lệ Thông qua Tối thiểu</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Percentage</code></td>
          <td>Quy định mức phiếu tối thiểu để trúng cử (Ví dụ: > 50% tổng số phiếu phát ra).</td>
          <td>Hệ thống tự động tính toán và công bố kết quả đạt/không đạt tức thì.</td>
        </tr>
      </tbody>
    </table>
`;

// Bổ sung bảng cho Chương 24 (Kho tài liệu số)
const tableC24 = `
    <div class="trn-sec-title">2. Đặc tả Chi tiết các Trường Quản Lý Kho Tài Liệu & Biểu Mẫu:</div>
    <table class="tb">
      <thead>
        <tr>
          <th style="width: 20%;">Tên trường dữ liệu</th>
          <th style="width: 12%;">Bắt buộc</th>
          <th style="width: 15%;">Kiểu dữ liệu</th>
          <th style="width: 25%;">Hướng dẫn nhập</th>
          <th style="width: 28%;">Mục đích & Ý nghĩa nghiệp vụ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tên Văn Bản / Biểu Mẫu</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text</code></td>
          <td>Ví dụ: Quy chế Quản lý Quỹ Tài chính Hiệp hội CEO 1983 (Ban hành 2026).</td>
          <td>Tên tài liệu hiển thị trên thư viện tra cứu số hóa của hiệp hội.</td>
        </tr>
        <tr>
          <td><strong>Danh mục Văn Bản Phân Cấp</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Dropdown</code></td>
          <td>Điều lệ CLB, Nghị quyết Ban Chấp hành, Hợp đồng kinh tế mẫu, Kỷ yếu...</td>
          <td>Sắp xếp tài liệu vào đúng ngăn thư mục chuyên môn để dễ tra cứu.</td>
        </tr>
        <tr>
          <td><strong>Số Hiệu & Ngày Ban Hành</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Text + Date</code></td>
          <td>Số: 08/NQ-CEO1983, Ngày ký: 15/01/2026.</td>
          <td>Xác lập giá trị hiệu lực pháp lý và mốc thời gian áp dụng của văn bản.</td>
        </tr>
        <tr>
          <td><strong>Cấp Độ Bảo Mật Quyền Truy Cập</strong></td>
          <td class="req">Có (*)</td>
          <td><code>Select Role</code></td>
          <td>Công khai toàn thể hội viên / Mật - Chỉ dành cho Ban Chấp hành.</td>
          <td>Bảo vệ các nghị quyết nhân sự và tài liệu nội bộ tuyệt mật của lãnh đạo.</td>
        </tr>
        <tr>
          <td><strong>Tệp Tin Văn Bản Đính Kèm</strong></td>
          <td class="req">Có (*)</td>
          <td><code>File (PDF/Word)</code></td>
          <td>Tải lên tệp văn bản có chữ ký và đóng dấu đỏ của Chủ tịch hiệp hội.</td>
          <td>Hội viên có thể xem trực tuyến trên màn hình hoặc tải về in ấn chuẩn khổ A4.</td>
        </tr>
      </tbody>
    </table>
`;

// Chèn các bảng vào file HTML
// Thay thế đoạn kết thúc của mỗi chương tương ứng
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_03_home.png"', tableC3 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_03_home.png"');
html = html.replace('<div class="box-green">\n      <strong>TÍNH NĂNG CHIA SẺ DANH THIẾP ĐIỆN TỬ', tableC4 + '\n    <div class="box-green">\n      <strong>TÍNH NĂNG CHIA SẺ DANH THIẾP ĐIỆN TỬ');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_06_members.png"', tableC5 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_06_members.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_07_messages.png"', tableC6 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_07_messages.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_08_opportunities.png"', tableC7 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_08_opportunities.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_09_products.png"', tableC8 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_09_products.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_10_events.png"', tableC9 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_10_events.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_11_voting.png"', tableC10 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_11_voting.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_12_renew.png"', tableC11 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_12_renew.png"');
html = html.replace('<div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_13_profile.png"', tableC12 + '\n    <div class="shot-mobile-grid">\n      <div class="shot-mobile-card">\n        <div class="phone-mockup">\n          <img src="screenshots/app_13_profile.png"');

html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_07_events.png"', tableC17 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_07_events.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_09_checkin.png"', tableC18 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_09_checkin.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_10_tasks_kanban.png"', tableC19 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_10_tasks_kanban.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_12_meetings.png"', tableC20 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_12_meetings.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_13_fees.png"', tableC21 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_13_fees.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_14_marketplace.png"', tableC22 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_14_marketplace.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_15_voting.png"', tableC23 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_15_voting.png"');
html = html.replace('<div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_16_documents.png"', tableC24 + '\n    <div class="shot-wrap">\n      <div class="shot">\n        <img src="screenshots/crm_16_documents.png"');

fs.writeFileSync(outputFile, html, 'utf8');
console.log('>>> ĐÃ CẬP NHẬT HOÀN TẤT 100% CÁC BẢNG ĐẶC TẢ TRƯỜNG DỮ LIỆU VÀO: ' + outputFile);
