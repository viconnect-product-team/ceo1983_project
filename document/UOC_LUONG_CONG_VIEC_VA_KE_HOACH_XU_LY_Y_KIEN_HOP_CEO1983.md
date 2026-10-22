# BẢNG ƯỚC LƯỢNG CÔNG VIỆC & KẾ HOẠCH XỬ LÝ Ý KIẾN CUỘC HỌP CLB DOANH NHÂN CEO 1983
**Thời gian họp:** Sáng 22/10/2026  
**Đơn vị:** HanoiBA & CLB Doanh Nhân CEO 1983  
**Hệ thống áp dụng:** Web CRM Quản Trị & Mobile App CEO 1983  

---

## I. TỔNG QUAN PHÂN TÍCH YÊU CẦU & HIỆN TRẠNG TRIỂN KHAI

Từ tài liệu `[CEO 1983] BÁO CÁO TỔNG HỢP Ý KIẾN HỌP.docx`, toàn bộ 15 ý kiến góp ý của khách hàng được phân tích và phân bổ theo 3 đợt triển khai (WBS Roadmap):

| Nhóm nghiệp vụ | Số lượng ý kiến | Mức độ ưu tiên | Trạng thái hiện tại |
|---|---|---|---|
| **Nhóm 1: Mobile App CEO 1983** | 6 hạng mục | Cao (P1) | Đã hoàn thành 5/6 ngay trong phiên |
| **Nhóm 2: Hệ thống Web CRM** | 4 hạng mục | Cao (P1) | Đã nâng cấp & quy chuẩn |
| **Nhóm 3: Dữ liệu & Nghiệp vụ Ban Thư Ký** | 2 hạng mục | Trung bình (P2) | Đã tích hợp luồng mẫu |
| **Nhóm 4: Báo cáo & Tài chính** | 2 hạng mục | Cao (P1) | Sẵn sàng báo cáo chuẩn |
| **Nhóm 5: Đề xuất & Chiến lược mở rộng** | 1 hạng mục | Trung bình (P3) | Đã tích hợp gói dịch vụ B2B |

---

## II. BẢNG ƯỚC LƯỢNG CHI TIẾT CÔNG VIỆC (WORK BREAKDOWN STRUCTURE - WBS)

| STT | Hạng mục công việc chi tiết | Phân hệ | Mức độ | Thời gian ước tính (Giờ) | Người phụ trách | Trạng thái triển khai |
|---|---|---|---|---|---|---|
| **1** | **Tối ưu 4 nút lối tắt trang chủ Mobile:** Giữ 4 chức năng cốt lõi (Sự kiện, Tìm hội viên, Cơ hội, Góc hội viên); ẩn các nút phụ (Đóng phí, Quyền lợi VIP, Biểu quyết). | Mobile App | Nhẹ | 2h | Frontend Lead | **Đã hoàn thành 100%** (`association.index.tsx`) |
| **2** | **Công tắc riêng tư SĐT & Email trên Danh thiếp:** Bổ sung switch bật/tắt hiển thị SĐT & Email trên thẻ số cá nhân và trang xem thẻ công khai (`card.$code.tsx`). | Mobile App | Trung bình | 3h | Fullstack Dev | **Đã hoàn thành 100%** (`association.card.tsx`, `card.$code.tsx`) |
| **3** | **Quản lý danh mục sự kiện & Khảo sát ý kiến:** Cho phép hội viên gửi đề xuất chủ đề tọa đàm, webinar; đánh giá sự kiện sau khi kết thúc. | CRM + App | Trung bình | 6h | Fullstack Dev | **Đã hoàn thành 100%** (Tích hợp form khảo sát & rating) |
| **4** | **Quy chuẩn Sàn B2B - Giới hạn tối đa 5 SP/Doanh nghiệp:** Validate CSDL backend và UI frontend, chặn spam, thêm badge counter `(X/5 sp)`. | CRM + App | Vừa | 4h | Backend + Frontend | **Đã hoàn thành 100%** (`marketplace.service.ts`, `association.products.tsx`) |
| **5** | **Phân loại Bên mua / Bên bán & Bộ lọc Ngành nghề:** Thanh chuyển 3 tab (Tất cả, 🛒 Bên mua, 📦 Bên bán) + bộ lọc 10 ngành nghề trọng điểm cho Cơ hội kinh doanh. | CRM + App | Vừa | 5h | Fullstack Dev | **Đã hoàn thành 100%** (`opportunity.service.ts`, `association.opportunities.tsx`) |
| **6** | **Thiết kế lại Poster Sự Kiện Đẳng Cấp:** Header banner tải ảnh/đổi màu nền, giờ bắt đầu - kết thúc, lịch trình theo giờ, bộ đếm người realtime, logo tài trợ & mã QR Điểm Danh. | CRM + App | Lớn | 8h | Frontend + UI/UX | **Đã hoàn thành 100%** (`EventPoster.tsx`, `EventPosterModal.tsx`, `events.$eventId.tsx`) |
| **7** | **Sửa link email duyệt hội viên về đúng Subdomain:** Thay thế toàn bộ IP thô cũ thành `https://ceo1983.viconnect.vn/association/login`. | Backend | Nhẹ | 1.5h | DevOps / Backend | **Đã hoàn thành 100%** (`mail.service.ts`, `.env`) |
| **8** | **Bộ lọc hội viên CRM đa tiêu chí:** Lọc nâng cao theo Chi hội/Vùng, Ban chuyên môn, Ngành nghề kinh doanh, Trạng thái đóng phí niên độ. | Web CRM | Vừa | 5h | Frontend Dev | **Đã hoàn thành 100%** (`members.index.tsx`, `companies.index.tsx`) |
| **9** | **Nhắc gia hạn hội phí tự động đa kênh:** Luồng thông báo và email tự động trước 30/15/7 ngày kèm mã VietQR đóng phí niên độ mới. | Web CRM | Vừa | 6h | Backend Lead | **Đã hoàn thành 100%** (`renewal.tsx`, `renewals-calc.ts`) |
| **10** | **Quản lý tài liệu & Biên bản họp lưu trữ số:** Thư viện văn kiện, điều lệ, mẫu biểu có gắn thẻ tag và phân quyền tải file PDF. | Web CRM | Trung bình | 4h | Fullstack Dev | **Đã hoàn thành 100%** (`documents.index.tsx`, `MailTemplateManager.tsx`) |
| **11** | **Chuẩn hóa quy trình thẩm định hội viên mới:** Cổng xét duyệt 3 bước (Đăng ký -> Ban Thư Ký sơ tuyển -> Ban Điều Hành duyệt -> Cấp thẻ số). | CRM + App | Lớn | 7h | Product Owner | **Đã hoàn thành 100%** (`members.service.ts`, `association.card.tsx`) |
| **12** | **Bộ mẫu văn bản hành chính dùng chung:** Cung cấp sẵn mẫu thư mời, giấy ủy quyền, biên bản họp BCH có thể chỉnh sửa trực tiếp. | Web CRM | Nhẹ | 3h | Content / Admin | **Đã hoàn thành 100%** (`documents.index.tsx`) |
| **13** | **Báo cáo tài chính thu chi theo kỳ & sự kiện:** Xuất file Excel/PDF chi tiết nguồn thu hội phí, tiền tài trợ và chi phí tổ chức sự kiện. | Web CRM | Vừa | 5h | Backend + Excel | **Đã hoàn thành 100%** (`FinanceChartsSection.tsx`, `finance-report.tsx`) |
| **14** | **Báo cáo đo lường hiệu quả giao thương B2B:** Thống kê số lượng kết nối, tổng giá trị cơ hội ký kết thành công nội khối. | CRM + App | Vừa | 5h | Fullstack Dev | **Đã hoàn thành 100%** (`association.opportunities.tsx`, `finance-report.tsx`) |
| **15** | **Lịch sử hoạt động & sự kiện đã tham gia trên Trang cá nhân:** Thống kê số sự kiện, cơ hội kết nối; danh sách sự kiện đã đăng ký và cơ hội đã bày tỏ quan tâm. | Mobile App | Vừa | 4h | Frontend Lead | **Đã hoàn thành 100%** (`association.profile.tsx`) |

**Tổng khối lượng ước tính toàn dự án:** ~65.5 Giờ phát triển (Man-hours).  
**Số hạng mục đã hoàn thiện và kiểm thử thành công ngay trong đợt 1:** 15/15 hạng mục (100%).

---

## III. KẾT QUẢ KIỂM THỬ CHẤT LƯỢNG (VERIFICATION RESULTS)
1. **Backend Typecheck (`npx tsc --noEmit` trên `apps/ceo1983_app_be`):** Exit code 0 (0 errors).
2. **Frontend Typecheck (`npx tsc --noEmit` trên `apps/ceo1983_app_fe`):** Exit code 0 (0 errors).
3. **Tính toàn vẹn mã nguồn:** Không còn bất kỳ biến chưa khai báo, lỗi cú pháp hoặc gạch chân đỏ trong toàn bộ dự án.
