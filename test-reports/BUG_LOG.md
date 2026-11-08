# BÁO CÁO LỖI PHÁT HIỆN TRONG QUÁ TRÌNH KIỂM THỬ (BUG LOG)
*Thời gian kiểm thử: 2026-11-08T02:38:32.522Z*

### Tổng số lỗi phát hiện: 14 lỗi

#### 1. [CASE-2.9] Tạo Ưu Đãi / Quyền Lợi Hội Viên Mới (Perks & Discounts)
- **Phân hệ**: 2. Nhà Tài Trợ & Gói Tài Trợ
- **Tài khoản**: `admin@connect.vn`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/admin/perks`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: Đã tạo thành công ưu đãi hội viên trong hệ thống và đồng bộ tức thì.
- **Ảnh minh chứng**: `case_2_9_crm_create_prize_perk.png`

#### 2. [CASE-2.10] Xem Chi Tiết, Chỉnh Sửa & Xóa Ưu Đãi Hội Viên
- **Phân hệ**: 2. Nhà Tài Trợ & Gói Tài Trợ
- **Tài khoản**: `admin@connect.vn`
- **API Input**: `GET, PATCH & DELETE https://crm.ceo1983.viconnect.vn/api/admin/perks/undefined`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_2_10_crm_edit_del_prize.png`

#### 3. [CASE-3.1] Tạo Lịch Hẹn Gặp Mặt 1-on-1 B2B Giữa 2 Doanh Nhân
- **Phân hệ**: 3. Cuộc Gặp 1-1 & Cuộc Họp B2B
- **Tài khoản**: `vupv090120@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/meetings/connection-appointments`
- **HTTP Status**: `201`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_3_1_app_create_1on1_meeting.png`

#### 4. [CASE-3.3] Đối Tác Xác Nhận Đồng Ý Lịch Hẹn Gặp Mặt 1-on-1
- **Phân hệ**: 3. Cuộc Gặp 1-1 & Cuộc Họp B2B
- **Tài khoản**: `vumikasa6@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/meetings/connection-appointments/e6853e0e-6453-4239-9e3f-7f5a980bbe32/respond`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_3_3_app_respond_1on1_meeting.png`

#### 5. [CASE-3.4] Hủy Lịch Hẹn Gặp Mặt 1-on-1 Với Lý Do Rõ Ràng
- **Phân hệ**: 3. Cuộc Gặp 1-1 & Cuộc Họp B2B
- **Tài khoản**: `vupv090120@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/meetings/connection-appointments/e6853e0e-6453-4239-9e3f-7f5a980bbe32/cancel`
- **HTTP Status**: `201`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_3_4_app_cancel_1on1_meeting.png`

#### 6. [CASE-3.5] Tạo Cuộc Họp Trực Tuyến (Online Google Meet) Kèm Thêm Thành Viên
- **Phân hệ**: 3. Cuộc Gặp 1-1 & Cuộc Họp B2B
- **Tài khoản**: `admin@connect.vn`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/meetings`
- **HTTP Status**: `201`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_3_5_crm_create_online_meeting.png`

#### 7. [CASE-3.6] Tạo Cuộc Họp Trực Tiếp (Offline Meeting) Tại Địa Điểm Cung Tri Thức
- **Phân hệ**: 3. Cuộc Gặp 1-1 & Cuộc Họp B2B
- **Tài khoản**: `admin@connect.vn`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/meetings`
- **HTTP Status**: `201`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_3_6_crm_create_offline_meeting.png`

#### 8. [CASE-3.7] Chỉnh Sửa Thông Tin & Nghị Trình Cuộc Họp Trên Web CRM
- **Phân hệ**: 3. Cuộc Gặp 1-1 & Cuộc Họp B2B
- **Tài khoản**: `admin@connect.vn`
- **API Input**: `PATCH https://crm.ceo1983.viconnect.vn/api/meetings/5fb24efe-08c5-4f32-87a7-c245b51040f7`
- **HTTP Status**: `200`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_3_7_crm_edit_meeting.png`

#### 9. [CASE-4.4] Hệ Thống Chặn Đăng Sản Phẩm Thứ 6 (Hạn Mức Quota 5 Sản Phẩm)
- **Phân hệ**: 4. Sàn Thương Mại B2B
- **Tài khoản**: `vumikasa6@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/marketplace/products`
- **HTTP Status**: `201`
- **Ghi chú lỗi**: Chặn thành công với thông báo: "undefined"
- **Ảnh minh chứng**: `case_4_4_app_block_6th_product.png`

#### 10. [CASE-4.5] Chỉnh Sửa Thông Tin & Giá Sản Phẩm Trên Sàn Thương Mại
- **Phân hệ**: 4. Sàn Thương Mại B2B
- **Tài khoản**: `vumikasa6@gmail.com`
- **API Input**: `PATCH https://crm.ceo1983.viconnect.vn/api/marketplace/products/prod-1794104345968`
- **HTTP Status**: `500`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_4_5_app_edit_product.png`

#### 11. [CASE-5.5] Chủ Cơ Hội Nhận Deal & Cập Nhật Tiến Độ Giao Dịch B2B
- **Phân hệ**: 5. Cơ Hội Giao Thương B2B
- **Tài khoản**: `vumikasa6@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/opportunities/OPP-MW77ERDJ/deal-status`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_5_5_crm_deal_status.png`

#### 12. [CASE-6.2] Kết Nối B2B Gặp Mặt Xuất Phát Từ Xem Sản Phẩm Sàn Thương Mại
- **Phân hệ**: 6. Kết Nối B2B Gặp Mặt
- **Tài khoản**: `vupv090120@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/marketplace/inquiries`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: Người mua gửi yêu cầu báo giá kèm tùy chọn đặt lịch gặp gỡ đối tác cung ứng.
- **Ảnh minh chứng**: `case_6_2_app_b2b_meet_from_product.png`

#### 13. [CASE-7.3] Hội Viên Đăng Ký Tham Gia Chương Trình Đào Tạo / Diễn Đàn
- **Phân hệ**: 7. Đào Tạo & Diễn Đàn Gặp Mặt
- **Tài khoản**: `vupv090120@gmail.com`
- **API Input**: `POST https://crm.ceo1983.viconnect.vn/api/trainings/3cacc21a-f3bc-4c83-bd8a-5807e0d1449b/register`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: 
- **Ảnh minh chứng**: `case_7_3_app_register_training.png`

#### 14. [CASE-8.4] Xem Chi Tiết Tài Liệu PDF, Word & Excel Trên Hệ Thống
- **Phân hệ**: 8. Tài Liệu & Thư Viện Số
- **Tài khoản**: `admin@connect.vn`
- **API Input**: `GET https://crm.ceo1983.viconnect.vn/api/documents/DOC-5MZYJZ5G`
- **HTTP Status**: `404`
- **Ghi chú lỗi**: Hệ thống hỗ trợ preview trực quan định dạng PDF, đọc Word (.docx) và lưới bảng tính Excel (.xlsx).
- **Ảnh minh chứng**: `case_8_4_crm_view_document.png`

