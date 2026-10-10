# QUY CHUẨN THIẾT KẾ UI/UX TỐI THƯỢNG (DESIGN SYSTEM) - CLB DOANH NHÂN CEO 1983
## Áp Dụng Bắt Buộc Cho Toàn Bộ Frontend & Mobile App

---

## 1. NGUYÊN TẮC CỐT LÕI: ĐÚNG 3 TÔNG MÀU CHUẨN CEO 1983 DUY NHẤT

Toàn bộ hệ thống giao diện Web, PWA và Mobile của **CLB Doanh Nhân CEO 1983** TUYỆT ĐỐI CHỈ ĐƯỢC PHÉP SỬ DỤNG **3 TÔNG MÀU CHUẨN**, thể hiện trọn vẹn tinh thần Bản Lĩnh - Thịnh Vượng - Sang Trọng:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BẢNG 3 TÔNG MÀU CHUẨN CEO 1983                                  │
├─────────────────────┬──────────────────────────┬───────────────────────────────────────┤
│ TÔNG MÀU            │ MÃ MÀU HEX / RGB         │ PHẠM VI ÁP DỤNG TRONG GIAO DIỆN       │
├─────────────────────┼──────────────────────────┼───────────────────────────────────────┤
│ 1. Deep Cobalt Navy │ #003B95 (Chủ đạo)        │ - Nút bấm chính (Primary CTA Button)  │
│    (Xanh Navy       │ #002B70 (Hover / Active) │ - Thanh Header & Top Bar thương hiệu  │
│     Hoàng Gia)      │ #0A1A3A (Navy Đêm)       │ - Tab điều hướng đang được chọn       │
│                     │ rgb(0, 59, 149)          │ - Huy hiệu chính thức CLB CEO 1983    │
├─────────────────────┼──────────────────────────┼───────────────────────────────────────┤
│ 2. Warm Amber Gold  │ #F59E0B (Vàng Hổ Phách)  │ - Viền thẻ hội viên VIP & Doanh nhân  │
│    (Vàng Kim Ánh Kim│ #D97706 (Gold Đậm)       │ - Icon ngôi sao, vương miện, cúp vàng │
│     Thịnh Vượng)    │ #B45309 (Gold Đồng)      │ - Nút "Quan tâm", giá trị Deal CRM    │
│                     │ #FEF3C7 (Nền Gold Nhạt)  │ - Badge sự kiện nổi bật, Spotlight    │
├─────────────────────┼──────────────────────────┼───────────────────────────────────────┤
│ 3. Neutral Contrast │ #FFFFFF (Trắng Tinh Khôi)│ - Nền giao diện sáng (Light Theme)    │
│    (Nền Trắng & Đen │ #0F172A (Obsidian Đen)   │ - Thẻ Card nền tối sang trọng         │
│     Xám Sang Trọng) │ #1E293B (Slate 800)      │ - Văn bản tương phản cao, dễ đọc      │
│                     │ #F8FAFC (Nền phụ Slate)  │ - Đường kẻ viền mờ tinh tế            │
└─────────────────────┴──────────────────────────┴───────────────────────────────────────┘
```

---

## 2. DANH MỤC CẤM KỴ MÀU SẮC (COLOR ANTI-PATTERNS - CẤM AI TỰ Ý TẠO MÀU)

> ⛔ **NGHIÊM CẤM AI VÀ LẬP TRÌNH VIÊN TỰ Ý SỬ DỤNG CÁC MÀU SAU ĐÂY:**
> 1. **CẤM màu Tím (`purple`, `violet`, `#8B5CF6`, `#A855F7`)**: Tuyệt đối không dùng màu tím phong cách gaming, Web3 hay crypto.
> 2. **CẤM màu Hồng (`pink`, `rose`, `magenta`, `#EC4899`, `#F43F5E`)**: Không đưa các khối màu hồng rực vào giao diện doanh nhân.
> 3. **CẤM màu Xanh Lá Cây sặc sỡ / Xanh chuối (`lime`, `#84CC16`, `#22C55E` chói)**: Ngoại trừ icon trạng thái nhỏ màu ngọc bích nhã nhặn (`#059669` / `#10B981`) cho thông báo thành công.
> 4. **CẤM màu Cầu Vồng / Multi-gradient lòe loẹt**: Không sử dụng các dải gradient đa sắc cầu vồng làm mất đi vẻ chuyên nghiệp, đẳng cấp của các CEO.

---

## 3. QUY TẮC ICON HỌA TIẾT TỐI GIẢN (CLICKUP VECTOR SYSTEM)

1. **Ưu tiên Icon Đơn Sắc (Single-color Vector)**:
   - Sử dụng thư viện icon chuẩn **Lucide React**.
   - Kích thước chuẩn: `size-4` (16px) hoặc `size-5` (20px).
   - Màu sắc icon: Đi theo đúng 3 tông màu chuẩn (Trắng `#FFFFFF`, Xanh Navy `#003B95`, hoặc Vàng Hổ Phách `#F59E0B`).
2. **Triệt Tiêu Nút Bấm Cồng Kềnh (Button-to-Icon Minimization)**:
   - Các thao tác phụ (Nhắn tin, Gọi điện, Chia sẻ, Lưu tin, Lịch hẹn) bắt buộc thiết kế dạng **nút icon tròn hoặc vuông bo góc nhỏ gọn** (`w-8 h-8` hoặc `w-9 h-9`), có tooltip và hiệu ứng hover nhẹ.
   - Nút bấm có chữ (Text Buttons) CHỈ dành cho các quyết định then chốt: "Đăng cơ hội ngay", "Đăng ký tham dự", "Gửi báo giá VIP", "Lưu vào Database".

---

## 4. TYPOGRAPHY & CHỮ VIẾT DOANH NHÂN

- **Phông chữ chủ đạo**: Phông không chân hiện đại **Inter**, `Roboto` hoặc `system-ui`.
- **Cấp bậc văn bản (Hierarchy)**:
  - Tiêu đề màn hình (Page Title): `text-[18px]` đến `text-[20px]`, `font-extrabold`, màu Cobalt Navy hoặc Trắng.
  - Tiêu đề mục (Section Heading): `text-[14px]` đến `text-[15px]`, `font-bold`, chữ hoa có tracking nhẹ (`uppercase tracking-wider`).
  - Nội dung chính (Body Text): `text-[12.5px]` đến `text-[13px]`, `text-slate-700` (Light) hoặc `text-slate-200` (Dark), `leading-relaxed`.
  - Chú thích phụ (Meta / Subtitle): `text-[10px]` đến `text-[11px]`, `font-medium`, `text-slate-400`.

---

## 5. THIẾT KẾ ĐA NỀN TẢNG (RESPONSIVE & MOBILE-FIRST)

- **Giao diện App Hội Viên (`/association/*`)**:
  - Tối ưu hóa tuyệt đối cho trải nghiệm di động (Mobile-First Card Container).
  - Chiều rộng khung vỏ tối đa: `max-w-[480px]` căn giữa màn hình trên Desktop.
  - Vùng chạm (Touch Target): Mọi nút bấm và tương tác chạm phải có kích thước tối thiểu **44px x 44px**.
  - Safe Area: Hỗ trợ thanh điều hướng đáy và notch tai thỏ iPhone / Android (`pb-24`, `pt-safe`).
- **Giao diện Web CRM Quản Trị (`/dashboard`, `/permissions`, `/members`)**:
  - Tối ưu cho Desktop màn hình rộng, lưới đa cột (Data Grid), thanh điều khiển cố định (Sticky Action Bar).

---

## 6. HIỆU ỨNG CHUYỂN ĐỘNG & HIỆU NĂNG 60-120 FPS

- **Hiệu ứng chạm phản hồi (Haptic Micro-interaction)**: `:active { transform: scale(0.97); transition: transform 60ms ease-out; }`.
- **Tuyệt đối KHÔNG dùng hiệu ứng Blur nặng nề**: CẤM các lớp phủ `filter: blur(100px)` hoặc `blur(120px)` diện tích lớn chạy animation liên tục vì sẽ làm tràn băng thông GPU di động và tụt FPS.
- Sử dụng hiệu ứng `radial-gradient` tĩnh và viền mờ `border-amber-500/20` để tạo chiều sâu thị giác sang trọng mà không tốn tài nguyên phần cứng.
