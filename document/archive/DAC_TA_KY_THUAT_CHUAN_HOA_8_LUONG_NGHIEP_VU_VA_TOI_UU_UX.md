# ĐẶC TẢ KỸ THUẬT: CHUẨN HÓA 8 LUỒNG NGHIỆP VỤ & TỐI ƯU HIỆU NĂNG UX CHUẨN NATIVE MOMO (CEO 1983 APP)

## 1. Mục tiêu & Phạm vi
Tài liệu đặc tả chi tiết kiến trúc, dữ liệu và luồng tương tác cho 8 luồng nghiệp vụ trọng yếu cùng hệ thống tăng tốc phần cứng UX trên ứng dụng CEO 1983 (Web App / Mobile PWA).

---

## 2. Chi tiết 8 Luồng Nghiệp vụ & Giải pháp Kiến trúc

### 2.1. Luồng Kết Nối Qua Mã QR & Xử Lý Quyết Định 2 Cấp (Bug 1)
- **Luồng thao tác**:
  1. Tài khoản A quét mã QR của Tài khoản B và bấm "Gửi yêu cầu kết nối".
  2. Phía Tài khoản B lập tức nhận popup `IncomingConnectionModal` hiển thị thông tin hồ sơ của A cùng 2 nút:
     - **"Đồng ý" (Màu xanh Emerald)**: Chấp thuận kết nối ngay lập tức, lưu cả hai vào danh bạ bạn bè, đẩy thông báo phản hồi về cho A.
     - **"Để sau" (Slate)**: Đóng popup tạm thời, giữ nguyên yêu cầu ở trạng thái Chờ xử lý (`pending`) trong Trung tâm Thông báo (`/association/notifications`).
  3. Tại màn hình Thông báo của B, thẻ thông báo kết nối và modal chi tiết hiển thị trực tiếp 2 nút hành động:
     - **"Đồng ý"**: Chấp thuận, thêm vào danh sách kết nối song song trên cả 2 key lưu trữ (`vba_connected_members` và `vba.connected_members`), gửi thông báo phản hồi về cho A: *"X đã chấp nhận lời mời kết nối"*.
     - **"Từ chối"**: Cập nhật trạng thái `rejected`, gửi thông báo phản hồi về cho A: *"X đã từ chối lời mời kết nối"*.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/components/member/IncomingConnectionModal.tsx`
  - `apps/ceo1983_app_fe/src/routes/association.notifications.tsx`

### 2.2. Luồng Cuộc Gọi Video & Ổn Định Đồng Hồ Đếm Giờ (Bug 2)
- **Vấn đề đã khắc phục**: Video/Audio đối phương không hiển thị, đồng hồ gọi bị reset về 0s liên tục mỗi 1s.
- **Giải pháp kỹ thuật**:
  - Tách rời các trạng thái biến thiên (`callSeconds`, `callStatus`, `onClose`, `t`) khỏi dependency array của `useEffect` khởi tạo WebRTC. Sử dụng `useRef` lưu giữ các giá trị mới nhất.
  - Dependency của `setupWebRtc` chỉ phụ thuộc vào các định danh bất biến trong phiên gọi: `[open, callIdProp, isIncomingAcceptance, peerUserId, viewerUserId]`.
  - Khi người dùng đảo camera (trước/sau), sử dụng cơ chế `sender.replaceTrack()` trực tiếp trên `RTCRtpSender` hiện có, không teardown toàn bộ peer connection để tránh gây ngắt cuộc gọi.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/components/common/CeoWebRtcCallModal.tsx`

### 2.3. Danh Bạ Bạn Bè & Tìm Kiếm Không Dấu (Bug 3)
- **Vấn đề đã khắc phục**: Vào tab "Bạn bè" không thấy người đã kết nối; ô tìm kiếm không tìm thấy hội viên khi nhập tiếng Việt không dấu.
- **Giải pháp kỹ thuật**:
  - Hợp nhất dữ liệu bạn bè từ 3 nguồn: LocalStorage `vba.connected_members`, `vba_connected_members` và Backend REST API `/network/connections`.
  - Chuẩn hóa hàm tìm kiếm `normalizeSearchText` loại bỏ dấu tiếng Việt (`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d")`).
  - Tìm kiếm xuyên suốt: Tên hội viên, Chức vụ, Tên công ty, Số điện thoại, Email, Ngành nghề kinh doanh, Tỉnh thành.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/routes/association.members.tsx`

### 2.4. Lịch Hẹn Kết Nối 1-1 (Bug 4)
- **Luồng thao tác**:
  1. Tài khoản B đặt lịch hẹn 1-1 với Tài khoản A qua `BusinessConnectBottomSheet`.
  2. Hệ thống lưu lịch hẹn vào `vba_connection_appointments` và bắn thông báo tới A với `target: { tab: "meetings" }`.
  3. Khi A bấm "Xem chi tiết", ứng dụng điều hướng thẳng tới `/association/members?tab=meetings`.
  4. Tab "Lịch hẹn 1-1" tự động active nhờ việc khởi tạo state `tab` từ URL search param `tab=meetings` và đồng bộ qua sự kiện `popstate`.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/components/common/BusinessConnectBottomSheet.tsx`
  - `apps/ceo1983_app_fe/src/routes/association.members.tsx`

### 2.5. Phân Quyền Gian Hàng & Điều Hướng Banner Quảng Cáo (Bug 6)
- **Vấn đề đã khắc phục**: Tài khoản hội viên khác có thể nhìn thấy nút Sửa/Xóa sản phẩm của doanh nghiệp khác; nút "Khám phá" trên banner chạy ra Danh bạ thay vì Gian hàng B2B.
- **Giải pháp kỹ thuật**:
  - Chuẩn hóa điều kiện kiểm tra chủ sở hữu: Chỉ cho phép chỉnh sửa/xóa nếu `userId === product.ownerId` hoặc là Quản trị viên (`isAdmin || isPlatformAdmin`). Bỏ cơ chế so sánh lỏng lẻo theo `companyName` vì tên mặc định hội viên là *"CLB Doanh Nhân CEO 1983"*.
  - Với sản phẩm của doanh nghiệp khác: Chỉ hiển thị nút *"Nhận báo giá VIP"* và *"Nhắn tin trao đổi"*.
  - Banner quảng cáo liên kết (`MarketplaceAdSlider`): Bấm nút "Khám phá" hoặc click banner sẽ kích hoạt sự kiện `vba:view_company_storefront` và mở ngay gian hàng B2B của doanh nghiệp chạy quảng cáo bên trong Chợ Giao Thương.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/lib/marketplace-data.ts`
  - `apps/ceo1983_app_fe/src/routes/association.products.tsx`
  - `apps/ceo1983_app_fe/src/components/marketplace/MarketplaceAdSlider.tsx`

### 2.6. Phân Quyền Quét Mã Check-in Sự Kiện Trang Chủ (Bug 7)
- **Vấn đề đã khắc phục**: Hội viên thông thường thấy nút tắt "Quét Check-in" ở Trang chủ nhưng không có quyền soát vé.
- **Giải pháp kỹ thuật**:
  - Kiểm tra thẩm quyền nghiêm ngặt với `hasCheckinPermission`: Chỉ hiển thị cho Quản trị viên (`isAdmin`, `isPlatformAdmin`), Ban Tổ Chức (`isBTC`), Ban Quản Trị (`isBQT`), Ban Thư Ký (`isBTK`), Ban Truyền Thông (`isBTT`), người có quyền `canScanQR`, quyền `PERMISSIONS.EVENT_CHECKIN_MANAGE`, hoặc Ban truyền thông (`vba_is_media_department_member`).
  - Lọc danh sách `quickActionDefs` trước khi render, ẩn hoàn toàn nút tắt đối với hội viên thường.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/routes/association.index.tsx`

### 2.7. Luồng Chia Sẻ Cơ Hội & Đàm Phán Kết Nối 1-1 (Bug 8)
- **Luồng thao tác**:
  1. **Người đăng cơ hội kinh doanh**: Mở modal chi tiết, xem danh sách các hội viên bấm "Quan tâm". Cạnh tên mỗi hội viên có nút **"Đàm phán"** để mở ngay BottomSheet đặt lịch hẹn 1-1.
  2. **Hội viên quan tâm cơ hội**: Trên thẻ cơ hội và modal chi tiết hiển thị nút **"🤝 Đàm phán 1-1"**.
  3. Khi bấm, mở `BusinessConnectBottomSheet` với thông tin khởi tạo sẵn:
     - Mục đích: *"Đàm phán cơ hội kinh doanh: [Tên cơ hội]"*.
     - Ghi chú: Gắn kèm mã cơ hội và nội dung đề xuất hợp tác.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/components/common/BusinessConnectBottomSheet.tsx`
  - `apps/ceo1983_app_fe/src/routes/association.opportunities.tsx`

### 2.8. Tối Ưu Hiệu Năng UX Đạt 60-120fps Chuẩn Native MoMo (Bug 9)
- **Giải pháp kỹ thuật**:
  - Áp dụng Hardware Acceleration (GPU) cho `PullToRefresh` bằng `translate3d(0, ${pullDistance}px, 0)` thay cho `translateY()`.
  - Thiết lập `will-change: transform` khi đang kéo (`isPulling`) và giải phóng về `auto` khi thả tay để tối ưu bộ nhớ GPU.
  - Bổ sung quy tắc CSS toàn cục:
    - `-webkit-touch-callout: none;`
    - `touch-action: manipulation;` triệt tiêu 300ms delay của thao tác click trên di động.
    - `-webkit-tap-highlight-color: transparent;`
    - `overscroll-behavior-y: contain;`
    - `.hardware-accelerated`: Kích hoạt `transform: translate3d(0, 0, 0)` và `backface-visibility: hidden`.
- **Tệp triển khai**:
  - `apps/ceo1983_app_fe/src/components/member/PullToRefresh.tsx`
  - `apps/ceo1983_app_fe/src/styles.css`
