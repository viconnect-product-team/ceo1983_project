# FRONTEND TECHNICAL SPECIFICATION (TECHSPEC) - CEO 1983 PROJECT
## Phân Hệ: Frontend Web & PWA (`apps/ceo1983_app_fe`)

---

### 1. Kiến Trúc & Công Nghệ Cốt Lõi
- **Framework**: React 19 + TanStack Router (Nitro / TanStack Start File-based Routing).
- **Build Tool**: Vite 7.x kết hợp TailwindCSS 4.
- **Thư Viện Giao Diện**: Radix UI Primitives (Dialog, Popover, Dropdown, Tabs, Accordion), Lucide React Icons.
- **Quản Lý Trạng Thái & Fetching**: TanStack React Query v5 (`@tanstack/react-query`), React Context (`AuthContext`).
- **Thông Báo (Toast)**: Sonner Toast (`import { toast } from "sonner"`).
- **Thư Viện Tiện Ích**: `clsx`, `tailwind-merge`, `xlsx` (SheetJS xem Excel in-app), `qrcode`, `html2canvas-pro`.

---

### 2. Cấu Trúc Định Tuyến & Thư Mục
```
apps/ceo1983_app_fe/src/
├── routes/                  # File-based Routes
│   ├── association.tsx              # Shell cha quản lý Navigation & Header
│   ├── association.index.tsx        # Trang chủ Hội viên, Tin tức, Bảng tin
│   ├── association.card.tsx         # Danh thiếp số, Quét QR, Xuất ảnh
│   ├── association.members.tsx      # Danh bạ hội viên, Lọc ban ngành
│   ├── association.events.tsx       # Sự kiện, Đặt vé, Thẻ vé QR Pass
│   ├── association.opportunities.tsx# Sàn cơ hội kinh doanh B2B, Deal CRM
│   ├── association.products.tsx     # Chợ sản phẩm, Gian hàng, Báo giá VIP
│   ├── association.voting.tsx       # Biểu quyết trực tuyến & Bốc thăm
│   ├── association.messages.tsx     # Nhắn tin 1-1, Trao đổi cơ hội
│   ├── association.permissions.tsx # Phân quyền CRM 2 dạng Dashboard & Matrix
│   ├── association.profile.tsx      # Hồ sơ hội viên, Cài đặt tài khoản
│   ├── association.tasks.tsx        # Giao việc, Tiến độ, Xem Excel in-app
│   ├── card.$code.tsx               # Trang danh thiếp công khai khi quét QR
│   ├── lucky-draw.tsx               # Landing page bốc thăm trúng thưởng
│   └── m.*.tsx                      # 21 routes 301 Redirect sang /association/*
├── components/              # Feature & UI Components
│   ├── marketplace/modals/          # 5 Modals chợ sản phẩm (Post, Quote, Edit, Ad...)
│   ├── events/modals/               # 5 Modals sự kiện (Tickets, Detail, Register, Pass...)
│   ├── opportunities/modals/        # 3 Modals cơ hội (Detail, Create, Edit)
│   ├── messages/                    # 7 Modules chat (ChatThread, ConversationList...)
│   ├── common/                      # BusinessConnectBottomSheet, StandardCurrencyInput, ExcelViewerModal
│   ├── member/                      # MemberShell, MemberHeader, Ceo1983BusinessCardVisit
│   └── ui/                          # Radix UI Design Primitives
├── lib/                     # API Client & Formatters
│   ├── api-client.ts                # fetchNestApi, uploadFileToNest, resolveMediaUrl
│   ├── date-format.ts               # formatDisplayDate, formatVNTime
│   └── member-app.functions.ts      # TanStack Server Functions
└── context/                 # Context Providers (AuthContext, ThemeProvider)
```

---

### 3. Giao Tiếp API Backend
- **Endpoint Cơ Sở**: `/api/v1` (trỏ trực tiếp tới Backend NestJS port 5003 / 5001).
- **Gửi Kèm Token**: `fetchNestApi` tự động trích xuất token từ `AuthContext` hoặc `localStorage.getItem("vba_auth_token")` và gắn vào header `Authorization: Bearer <token>`.
- **Tải Lên File**: Hàm `uploadFileToNest(file, bucket)` gửi dữ liệu dạng `multipart/form-data` tới endpoint `/api/v1/upload` của NestJS và nhận về URL tệp trên MinIO S3.
