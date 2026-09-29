# QUY CHUẨN GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX GUIDELINES)
## HỆ THỐNG WEB CRM & APP HIỆP HỘI CEO 1983

---

## PHẦN 1: QUY CHUẨN FRONTEND WEB (CRM QUẢN TRỊ)
*Áp dụng cho thư mục `apps/ceo1983_app_fe` (các route quản trị desktop: `/`, `/events`, `/members`, `/sponsors`, `/business-connect`, `/settings`, v.v.)*

### 1. Cấu trúc thư mục React & TanStack
```
apps/ceo1983_app_fe/src/
├── components/          # Reusable UI components
│   ├── dashboard/       # AppShell, Sidebar, Header, PageKit, CrudModal, Pagination
│   ├── member/          # Member modals, profile cards, sync tools
│   ├── events/          # Event cards, QR Gatekeeper, attendee lists
│   ├── business-connect/# Meeting panels, 1on1 booking, calendar
│   └── ui/              # Primitive components (Button, Dialog, Dropdown, Input)
├── routes/              # TanStack File-based Routes
├── hooks/               # Custom React hooks (useTableControls, useServerData, useRole)
├── lib/                 # API client, helper functions, formatters, i18n
└── styles/              # Global CSS & Tailwind design tokens
```

### 2. Quy tắc Tailwind CSS & Bảng Màu Nhận Diện
- Tuân thủ bảng màu chuẩn đã thống nhất trong `QUY_CHUAN_GIAO_DIEN_WEB_CRM_CEO1983.md`:
  - **Màu nền**: `bg-slate-50` (Light) hoặc `bg-[#0b1120]` (Dark).
  - **Màu thẻ (Card)**: `bg-white border-border/80 shadow-xs`.
  - **Màu nút hành động chính (Primary)**:
    `bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition`
  - **Màu nút phụ (Secondary)**:
    `border border-border bg-background text-foreground hover:bg-muted`
  - **Cảnh báo / Xóa**: `border-destructive/20 text-destructive hover:bg-destructive/10`.
- Tuyệt đối không phối màu tự phát (như nút xanh neon, gradient lòe loẹt trên bảng quản trị). Mọi nút bấm quản trị phải đồng nhất Navy/Blue/Slate.

### 3. Quy tắc khai báo Props & Interface
- 100% Props của Component phải có Interface hoặc Type rõ ràng:
```typescript
export interface EventTableProps {
  events: EventItem[];
  isLoading: boolean;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => Promise<void>;
  onQrGatekeeper?: (event: EventItem) => void;
}
```
- Không sử dụng `any` cho Props. Nếu dữ liệu có tính mở rộng, dùng Generics `<T>` hoặc `Record<string, unknown>`.

---

## PHẦN 2: QUY CHUẨN MOBILE APP (APP HIỆP HỘI CEO 1983)
*Áp dụng cho giao diện Mobile First `/association/...` và container `apps/mobile_ceo1983`*

### 1. Cấu trúc Component & Tái sử dụng Layout
```
apps/ceo1983_app_fe/src/
├── components/member/   # Shell di động, Header có nút Back, Bottom Navigation
└── routes/
    ├── association.tsx              # Layout chính cho toàn bộ App Hiệp Hội
    ├── association.index.tsx        # Trang chủ Mobile App (Tin tức, banner, sự kiện nóng)
    ├── association.events.tsx       # Màn hình Sự kiện di động
    ├── association.products.tsx     # Sàn giao thương Marketplace & Slider Quảng cáo
    ├── association.notifications.tsx# Màn hình Thông báo rút gọn
    ├── association.messages.tsx     # Màn hình Chi tiết Tin nhắn & Kênh Ban Điều Hành
    └── association.checkin.tsx      # Quét mã QR & NFC soát vé hội viên
```

### 2. Thiết kế Slider Vuốt Ngang (Horizontal Carousel) cho Cụm Quảng Cáo & Sự Kiện
- **Tương tác cảm ứng**: Cho phép vuốt chạm mượt mà trên màn hình cảm ứng di động bằng CSS `snap-x snap-mandatory flex overflow-x-auto no-scrollbar`.
- **Thẻ quảng cáo (Ad Card)**:
  - Tỉ lệ chuẩn 16:9 hoặc bo tròn 2xl (`rounded-2xl`).
  - Hỗ trợ cả **Video phát tự động** (muted, loop, playsinline) và **Hình ảnh độ phân giải cao**.
  - Badge nổi bật góc trái: "ĐỐI TÁC CHIẾN LƯỢC" hoặc "TÀI TRỢ VÀNG".
  - Nút Call to Action (CTA) trực tiếp để mở chi tiết hoặc liên hệ đối tác.
- **Thanh chỉ báo (Pagination Dots / Counter)**:
  - Hiển thị chấm tròn động (`dot active`) hoặc badge số trang (`1/5`) giúp người dùng nhận biết vị trí slide.

### 3. Quản lý State & Luồng Gọi API trên Thiết bị Di Động
- **Cache & Fallback tức thì**:
  - Dùng `useServerData` kết hợp `localStorage` để hiển thị ngay giao diện đã lưu (Offline-first / Instant load) trong khi fetch ngầm API mới nhất từ backend.
- **Xử lý trạng thái mạng**:
  - Khi thiết bị mất mạng, hiển thị badge offline tinh tế, không làm vỡ layout ứng dụng.
- **Tối ưu hóa hiệu năng**:
  - Tránh re-render không cần thiết bằng `useMemo` và `useCallback`.
  - Lazy load video/ảnh khi cuộn tới khung nhìn để tiết kiệm băng thông 4G/5G của người dùng.
