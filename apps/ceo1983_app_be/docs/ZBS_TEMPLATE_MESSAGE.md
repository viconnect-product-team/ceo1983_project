# Cấu hình ZBS Template Message cho CRM

Phạm vi: nút **Bắn Thông Báo Ngay** trong màn hình Mẫu Email CRM
(`[NODE-CRM-014]`, `[NODE-CRM-024]`). Kênh Zalo gửi qua số điện thoại bằng
`POST /api/zalo/send-zns`, sử dụng API ZBS
`https://business.openapi.zalo.me/message/template`. Tên endpoint `send-zns`
được giữ để tương thích các bên đang gọi API.

## 1. Lấy template_id thật

Doanh nghiệp được tự soạn nội dung mẫu, sau đó gửi Zalo duyệt. HTML email trong
CRM không phải template ZBS và không thể gửi nguyên dạng bằng API này.

1. Đăng nhập [ZBS Account](https://account.zalo.solutions/).
2. Chọn **Thiết kế nội dung → Quản lý Template → Tạo Template**.
3. Chọn đúng AppID và OA đang cấu hình trong CRM, nhập nội dung cùng các tham số,
   sau đó gửi duyệt.
4. Khi mẫu đã được duyệt, lấy Template ID và tên/kiểu/giới hạn của từng tham số.
   Không dùng ID ví dụ trong code hoặc ID của OA/App khác.

Tham khảo [hướng dẫn tạo mẫu của Zalo](https://zalo.solutions/business-message/guidelines/huong-dan-tao-zbs-template-message)
và [API gửi tin](https://docs.zaloplatforms.com/docs/ZBS/gui-tin-template-qua-sdt/api-gui-tin-qua-sdt/api-gui-tin).

## 2. Cấu hình OA và ánh xạ mẫu

OA/App cần được cấp quyền gửi tin qua số điện thoại, liên kết tài khoản ZBS và có
số dư/hạn mức phù hợp. Số nhận phải có tài khoản Zalo và đáp ứng điều kiện nhận
tin của loại mẫu. Việc nhập một số điện thoại không bảo đảm số đó được phép nhận
mọi loại tin. Tham khảo [bảng mã lỗi của Zalo](https://docs.zaloplatforms.com/docs/ZBS/bang-ma-loi).

Lưu OA Access Token và Refresh Token trong **Cấu hình Zalo OA** hiện có, hoặc đặt
`ZALO_OA_ACCESS_TOKEN`, `ZALO_REFRESH_TOKEN`, `ZALO_APP_ID`, `ZALO_APP_SECRET`
trong môi trường backend. `ZALO_ACCESS_TOKEN` được hỗ trợ cho cấu hình cũ.
Không đưa token/secret thật vào Git hay frontend. Backend sử dụng cơ chế gia hạn
token hiện có; nếu chưa có access token sẽ thử gia hạn từ refresh token đã lưu.

Sao chép nội dung `zbs-templates.example.json`, điền `templateId` đã duyệt và chỉnh
`parameterMap` khớp chính xác với mẫu Zalo. Giá trị mặc định của ID để trống có chủ
đích: hệ thống từ chối gửi trước khi có cấu hình thật.

- Khóa ngoài cùng: **mã mẫu CRM** đang chọn, ví dụ `FEE_NOTICE_ANNUAL`.
- `templateId`: ID được cấp cho mẫu ZBS đã duyệt, lưu dưới dạng chuỗi.
- Khóa trong `parameterMap`: tên tham số của **mẫu Zalo**, không kèm dấu ngoặc.
- Giá trị trong `parameterMap`: tên biến **CRM**, ví dụ `full_name`, `fee_amount`.
- Chỉ các tham số được ánh xạ mới được gửi. Biến thiếu/rỗng hoặc cấu hình chưa
  hoàn chỉnh sẽ bị từ chối trước khi gọi Zalo. Kiểu dữ liệu, độ dài và nội dung
  vẫn phải tuân theo mẫu đã duyệt.

Có thể lưu JSON một dòng trong `.env` của backend, ví dụ cấu hình chưa kích hoạt:

```dotenv
ZALO_ZBS_TEMPLATES='{"FEE_NOTICE_ANNUAL":{"templateId":"","parameterMap":{"ho_ten":"full_name","so_tien":"fee_amount","han_thanh_toan":"due_date"}}}'
```

Thêm các mã mẫu CRM khác làm khóa mới khi có template ZBS tương ứng. Khởi động
lại backend sau khi đổi biến môi trường.

Cũng có thể lưu cùng object vào trường `zbsTemplates` bằng API cấu hình hiện có
`POST /api/zalo/oa-config` (cần đăng nhập). Cấu hình trong CSDL được ưu tiên theo
từng mã mẫu, sau đó mới tìm trong `ZALO_ZBS_TEMPLATES`. Không cần đổi schema CSDL.

## 3. Gửi từ màn hình hiện có

Chọn mẫu CRM đã ánh xạ, nhập số điện thoại, chọn **Zalo OA** hoặc **Cả 2 Kênh**,
rồi nhấn **Bắn Thông Báo Ngay**. Backend chuẩn hóa số Việt Nam từ `0...` sang
`84...`; không cần tra UID hoặc người nhận đã quan tâm OA trước đó. Các điều kiện
nhận tin của Zalo vẫn áp dụng. Luồng này không bật `mode: development`, vì chế độ
đó chỉ cho gửi tới quản trị viên OA/App.

Frontend gửi mã mẫu và dữ liệu biến; backend tự chọn ID và token. HTML/tiêu đề tự
do của email không thay thế nội dung cố định của template Zalo. Biến `vietqr_url`
tiếp tục được loại khỏi dữ liệu gửi Zalo theo quy ước CRM hiện có.

Chỉ báo tiếp nhận thành công khi Zalo trả `error: 0`. Đây là xác nhận API tiếp
nhận yêu cầu; trạng thái thiết bị đã nhận cần kiểm tra báo cáo/webhook của Zalo.
Lỗi gửi không được chuyển sang thông báo thành công hoặc tự gửi tin CS thay thế.

Đã kiểm tra bằng mock API; chưa gửi tin thật khi chưa có template được duyệt.

## 4. Kiểm tra cục bộ

Sau khi cài dependency và sinh Prisma Client (không cần kết nối database):

```powershell
# Trong apps/ceo1983_app_be
npx tsc --noEmit
npx jest --runInBand zbs-template.spec.ts system-zalo-oa.spec.ts

# Trong apps/ceo1983_app_fe
npx tsc --noEmit
npx vitest run --config vitest.zbs.config.ts
```
