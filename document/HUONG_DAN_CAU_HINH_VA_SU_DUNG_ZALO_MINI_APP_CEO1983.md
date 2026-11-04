# CẨM NANG HƯỚNG DẪN CẤU HÌNH & VẬN HÀNH ZALO MINI APP CLB DOANH NHÂN CEO 1983 (HANOIBA)

---

## I. TỔNG QUAN & LỢI THẾ CHIẾN LƯỢC CỦA ZALO MINI APP

### 1. Zalo Mini App là gì?
**Zalo Mini App (ZMA)** là ứng dụng chạy trực tiếp bên trong nền tảng Zalo trên cả hai hệ điều hành iOS và Android. Hội viên của CLB Doanh Nhân CEO 1983 không cần phải vào Apple App Store hay Google Play Store để tải về, không tốn dung lượng bộ nhớ điện thoại, và có thể truy cập ngay lập tức chỉ với 1 cú chạm hoặc 1 lần quét mã QR.

### 2. Vì sao Zalo Mini App là kênh then chốt cho Hội viên Doanh nhân?
1. **Thói quen 100% Doanh nhân Việt Nam**: Toàn bộ hội viên CEO 1983 đều sử dụng Zalo hàng ngày để giao tiếp, kết nối đối tác và làm việc.
2. **Đăng nhập 1 chạm không cần mật khẩu**: Hội viên bấm "Cho phép", hệ thống tự động nhận diện số điện thoại đăng ký Zalo và khớp nối ngay với hồ sơ hội viên trên CSDL PostgreSQL của CLB CEO 1983.
3. **Check-in Sự kiện & Caravan tức thì**: Sử dụng trực tiếp Camera Native của Zalo để quét QR Code vé sự kiện với tốc độ phản hồi tính bằng mili-giây.
4. **Kết nối Giao thương B2B trực tiếp**: Khi tìm thấy đối tác tiềm năng trên Danh bạ CEO 1983, hội viên có thể bấm nút "Mở Chat Zalo" để nhắn tin 1-1 ngay trên Zalo.
5. **Lan tỏa mạng lưới**: Dễ dàng chia sẻ Thẻ doanh nhân số, Tin tuyển dụng, hoặc Cơ hội kinh doanh lên Nhật ký Zalo hoặc gửi vào các nhóm Zalo ngành nghề của CLB.

---

## II. KIẾN TRÚC & CÁC THÀNH PHẦN ĐÃ ĐƯỢC THIẾT LẬP TRONG MÃ NGUỒN

Hệ thống đã được thiết lập sẵn sàng từ Frontend, Native Bridge đến Backend API:

```
ceo1983_project/
├── apps/
│   ├── ceo1983_zma/                     <-- THƯ MỤC CẤU HÌNH ZALO MINI APP
│   │   ├── app-config.json              <-- Cấu hình hiển thị, màu sắc Navy #003B95, Routing
│   │   └── project.config.json          <-- Cấu hình Project Zalo Mini App & AppID
│   │
│   ├── ceo1983_app_fe/
│   │   └── src/lib/zalo-mini-app.ts     <-- NATIVE BRIDGE SDK (Đăng nhập, Quét QR, Mở Chat, Share)
│   │
│   └── ceo1983_app_be/
│       └── src/auth/
│           ├── auth.controller.ts       <-- Endpoint: POST /auth/zalo-miniapp-login
│           └── auth.service.ts          <-- Giải mã Phone Token qua Zalo Graph API & Sinh JWT
```

### 1. File Cấu Hình Hiển Thị: `apps/ceo1983_zma/app-config.json`
Quy định nhận diện thương hiệu chuẩn của CLB:
- **Tiêu đề thanh tiêu đề (Header Title)**: `CEO 1983 - HanoiBA`
- **Màu nền thanh điều hướng**: Xanh Royal Cobalt Navy `#003B95`
- **Màu chữ**: Trắng tinh khôi `#FFFFFF`
- **Quyền hạn xin phép người dùng**:
  - `scope.userInfo`: Lấy tên hiển thị và avatar Zalo.
  - `scope.userPhonenumber`: Lấy số điện thoại đã xác thực Zalo (để đăng nhập tự động).
  - `scope.userLocation`: Hỗ trợ định vị GPS khi điểm danh cuộc họp B2B hoặc Caravan.

### 2. Thư Viện Native Bridge: `apps/ceo1983_app_fe/src/lib/zalo-mini-app.ts`
Cung cấp các hàm tích hợp sẵn:
- `isZaloMiniApp()`: Tự động phát hiện ứng dụng đang chạy trong Zalo để kích hoạt tính năng ZMA.
- `loginWithZaloPhone()`: Xin quyền lấy số điện thoại và tự động đăng nhập vào hệ thống CEO 1983.
- `scanQrCodeZalo()`: Kích hoạt camera quét mã QR của Zalo.
- `openZaloChatWithUser(zaloUserId)`: Mở cửa sổ chat riêng với hội viên đối tác.
- `followCeo1983OA(oaId)`: Bật popup bấm Quan tâm Zalo Official Account của CLB.
- `shareToZalo(options)`: Chia sẻ Thẻ hội viên và Cơ hội kinh doanh vào Zalo Chat / Zalo Feed.

### 3. Backend API Xác Thực: `apps/ceo1983_app_be/src/auth/`
- **Endpoint**: `POST /auth/zalo-miniapp-login`
- **Quy trình hoạt động**:
  1. Nhận `accessToken` và `phoneToken` từ Zalo Mini App gửi lên.
  2. Backend gọi Zalo Graph API `https://graph.zalo.me/v2.0/me/info` kết hợp cùng `ZALO_APP_SECRET` của CLB để giải mã ra số điện thoại thật (Ví dụ: `0912345678`).
  3. Tra cứu số điện thoại trong bảng `public.vione_users` và `public.members`.
  4. Nếu tìm thấy hội viên: Trả về Access Token và Refresh Token JWT để đăng nhập ngay.
  5. Nếu là hội viên mới: Tự động khởi tạo tài khoản liên kết để hội viên hoàn thiện hồ sơ.

---

## III. HƯỚNG DẪN 7 BƯỚC THIẾT LẬP TRÊN CỔNG ZALO DEVELOPERS

### Bước 1: Tạo Tài Khoản & Tổ Chức Nhà Phát Triển
1. Truy cập cổng **Zalo for Developers**: [https://developers.zalo.me/](https://developers.zalo.me/)
2. Đăng nhập bằng tài khoản Zalo cá nhân của quản trị viên / chủ sở hữu.
3. Bấm vào ảnh đại diện góc phải -> Chọn **Đăng ký tài khoản Nhà phát triển (Developer Account)**.
4. Xác thực số điện thoại và hoàn tất đăng ký.

### Bước 2: Tạo Ứng Dụng Mini App Trên Zalo Mini App Center
1. Truy cập trực tiếp trang quản trị Mini App: [https://mini.zalo.me/](https://mini.zalo.me/)
2. Bấm nút **"Tạo Mini App Mới"**.
3. Điền thông tin ứng dụng:
   - **Tên Mini App**: `CLB Doanh Nhân CEO 1983` (hoặc `CEO 1983 - HanoiBA`).
   - **Mô tả ngắn**: *Ứng dụng kết nối giao thương, danh bạ hội viên và quản trị hoạt động CLB Doanh Nhân CEO 1983 (HanoiBA).*
   - **Danh mục**: *Kinh doanh & Doanh nghiệp* (hoặc *Cộng đồng*).
   - **Logo ứng dụng**: Tải lên logo chuẩn hình tròn của CLB CEO 1983 (512x512 px).
4. Sau khi tạo xong, hệ thống sẽ cấp cho bạn một mã **App ID** (Dãy 18 số, ví dụ: `198300293847561829`).

### Bước 3: Lấy Secret Key & Cấu Hình Quyền Hạn
1. Tại trang quản trị Mini App, vào mục **Cài đặt (Settings)** -> **Khóa ứng dụng**.
2. Sao chép 2 thông số bảo mật:
   - **App ID**: `YOUR_ZALO_APP_ID`
   - **Secret Key**: `YOUR_ZALO_APP_SECRET`
3. Chuyển sang mục **Xét duyệt quyền (Permissions)**:
   - Bật tích chọn quyền: `scope.userInfo` (Thông tin người dùng).
   - Bật tích chọn quyền: `scope.userPhonenumber` (Số điện thoại người dùng - **Bắt buộc** để phục vụ tính năng đăng nhập 1 chạm).
   - Bật tích chọn quyền: `scope.userLocation` (Vị trí - để hỗ trợ điểm danh sự kiện theo tọa độ).

### Bước 4: Liên Kết Với Zalo Official Account (OA) CLB CEO 1983
1. Trong menu bên trái, chọn **Liên kết OA (Official Account)**.
2. Chọn đúng trang Zalo OA của **CLB Doanh Nhân CEO 1983** (đã xác thực tick vàng doanh nghiệp).
3. Bấm **Xác nhận liên kết**.
*(Lợi ích: Giúp hội viên có thể bấm "Quan tâm OA" trực tiếp trong Mini App và cho phép gửi thông báo ZNS mời họp tự động).*

### Bước 5: Cấu Hình Biến Môi Trường Backend Server
Mở file `.env` trên máy chủ Backend (`apps/ceo1983_app_be/.env`) và bổ sung:
```env
# Cấu hình Zalo Mini App & Zalo OA
ZALO_APP_ID="YOUR_ZALO_APP_ID_VỪA_LẤY"
ZALO_APP_SECRET="YOUR_ZALO_APP_SECRET_VỪA_LẤY"
ZALO_OA_ID="ID_TRANG_ZALO_OA_CEO1983"
```
Đồng thời cập nhật App ID vào file: `apps/ceo1983_zma/project.config.json`:
```json
{
  "miniprogramRoot": "./",
  "projectname": "ceo1983-zalo-mini-app",
  "appid": "YOUR_ZALO_APP_ID_VỪA_LẤY"
}
```

---

## IV. HƯỚNG DẪN CÀI ĐẶT CÔNG CỤ & CHẠY THỬ NGHIỆM

Zalo cung cấp bộ công cụ dòng lệnh **ZMP CLI** chính thức để lập trình và chạy thử.

### 1. Cài đặt ZMP CLI
Mở terminal (PowerShell hoặc Command Prompt) và chạy lệnh cài đặt toàn cục:
```bash
npm install -g zmp-cli
```
Kiểm tra cài đặt thành công:
```bash
zmp --version
```

### 2. Đăng nhập tài khoản Zalo Developer trên máy tính
Chạy lệnh:
```bash
zmp login
```
Terminal sẽ hiển thị một **Mã QR Code**. Bạn chỉ cần dùng ứng dụng Zalo trên điện thoại quét mã QR này và bấm **"Xác nhận đăng nhập"**.

### 3. Chạy môi trường Giả lập & Thử nghiệm (Simulator & Live QR)
Di chuyển vào thư mục ứng dụng:
```bash
cd apps/ceo1983_zma
zmp start
```
- Trình duyệt sẽ tự động mở trang **Zalo Mini App Studio / Simulator** với giao diện điện thoại di động để bạn thao tác thử.
- Đồng thời, màn hình terminal sẽ hiển thị một **Mã QR chạy trực tiếp (Live Testing QR)**. Bất kỳ ai trong Ban Điều Hành hoặc Đội ngũ Kỹ thuật dùng Zalo quét mã QR này đều có thể trải nghiệm trực tiếp Zalo Mini App ngay trên chiếc điện thoại của mình.

---

## V. HƯỚNG DẪN ĐÓNG GÓI, DEPLOY & XÉT DUYỆT PHÁT HÀNH

Khi đã kiểm tra các tính năng hoạt động ổn định, bạn tiến hành đóng gói đẩy lên đám mây của Zalo:

### Bước 1: Đóng gói và Deploy bản Build lên Zalo Cloud
Chạy lệnh:
```bash
zmp deploy --version 1.0.0 --desc "Phat hanh phien ban Zalo Mini App CLB CEO 1983"
```
Quá trình build và upload bundle diễn ra trong khoảng 30 - 60 giây. Sau khi hoàn thành, terminal sẽ báo `Deploy successfully!`.

### Bước 2: Thiết lập Phiên bản trên Console Zalo
1. Truy cập [https://mini.zalo.me/](https://mini.zalo.me/) -> Chọn Mini App **CLB Doanh Nhân CEO 1983**.
2. Vào mục **Quản lý phiên bản (Versions)**:
   - Bạn sẽ nhìn thấy phiên bản `1.0.0` vừa được tải lên.
   - Có thể chọn:
     - **Phiên bản Thử nghiệm (Development/Staging)**: Cung cấp mã QR để tối đa 50 người trong Ban Thư Ký / Ban Điều Hành test thử.
     - **Gửi xét duyệt (Submit for Review)**: Gửi đội ngũ Zalo kiểm duyệt để phát hành công khai.
3. Điền thông tin phục vụ xét duyệt:
   - Tài khoản test mẫu (nếu có).
   - Video hoặc ảnh chụp minh chứng các tính năng (Check-in, Xem thẻ, Kết nối).
4. Bấm **"Gửi duyệt"**. Thời gian Zalo xét duyệt thường diễn ra từ **12 - 24 giờ làm việc**.

---

## VI. CÁCH GẮN ZALO MINI APP VÀO HOẠT ĐỘNG THỰC TẾ CỦA CLB

Sau khi Mini App được Zalo phê duyệt, bạn có thể triển khai vào các kênh sau:

### 1. Gắn vào Menu Thanh Điều Hướng của Zalo Official Account (OA)
1. Vào trang quản trị Zalo OA: [https://oa.zalo.me/manage/oa](https://oa.zalo.me/manage/oa)
2. Vào mục **Quản lý** -> **Thiết lập Menu**.
3. Tạo 3 nút Menu cố định ở đáy khung chat:
   - Nút 1: **"Hội Viên CEO 1983"** -> Chọn loại hành động: **Mở Zalo Mini App** -> Chọn Mini App CEO 1983.
   - Nút 2: **"Thẻ Danh Thiếp QR"** -> Mở thẳng trang Thẻ cá nhân (`/association/card`).
   - Nút 3: **"Cơ Hội Giao Thương"** -> Mở thẳng sàn cơ hội B2B (`/association/opportunities`).
*(Mỗi khi hội viên nhắn tin cho trang Zalo OA của CLB, họ chỉ cần bấm nút menu dưới màn hình là mở ngay Mini App).*

### 2. Tạo Mã QR Để Tại Bàn Sự Kiện & Backdrop Đại Hội
- Tải mã QR chính thức của Mini App từ mục **Cài đặt** trên `mini.zalo.me`.
- In mã QR này lên:
  - Thẻ đeo Ban Tổ Chức & Thẻ Hội viên.
  - Backdrop và Standee tại cửa check-in các sự kiện Caravan, Gala, Họp Ban Điều Hành.
  - Hội viên đến sự kiện chỉ cần rút Zalo quét mã là hoàn tất điểm danh và nhận ngay thông tin chương trình.

### 3. Chia sẻ Đường link Trực tiếp
Đường link định dạng chuẩn của Zalo Mini App:
```
https://zalo.me/s/YOUR_ZALO_APP_ID/
```
Gửi đường link này vào các nhóm Zalo Chat của CLB CEO 1983, hội viên chỉ cần bấm vào là ứng dụng bật lên ngay lập tức bên trong Zalo.

