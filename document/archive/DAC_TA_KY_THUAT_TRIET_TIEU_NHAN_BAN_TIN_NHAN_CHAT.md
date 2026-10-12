# ĐẶC TẢ KỸ THUẬT: TRIỆT TIÊU LỖI NHÂN BẢN TIN NHẮN (CHAT DEDUPLICATION) & NÚT NHẮN TIN SIÊU ĐẬM NÉT

---

## 1. TỔNG QUAN VẤN ĐỀ (PROBLEM STATEMENT)

Trong phân hệ tin nhắn và danh bạ hội viên CLB Doanh Nhân CEO 1983, người dùng ghi nhận 2 vấn đề lớn:
1. **Lỗi Nhân Bản / Lặp Tin Nhắn (Duplicate Messages)**: Khi gửi tin nhắn qua giao diện hội thoại chat (`ChatThread.tsx`), tin nhắn xuất hiện 2 hoặc 3 lần trên màn hình, gây khó chịu và mất tính chuyên nghiệp.
2. **Nút Nhắn Tin Trong Thẻ Danh Bạ Bị Mờ**: Biểu tượng tin nhắn trong cụm 4 nút tròn hành động trên danh bạ CEO (`association.members.tsx`) có viền mờ nhạt, biểu tượng mảnh và không có màu đổ, khiến hiển thị nhợt nhạt so với 3 nút còn lại (Gọi điện, Thẻ 83, Hẹn gặp).

---

## 2. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

### 2.1. Lỗi Loopback Echo từ Socket Server
- Khi User A gửi tin nhắn:
  1. `handleSend` tạo ngay một tin nhắn tạm `optimisticMsg` (`id: local-17915...`) đưa vào `localMessages` để tạo trải nghiệm phản hồi tức thì (instant UI).
  2. Gửi request HTTP lên Backend NestJS (`/dm/member/messages`).
  3. Backend lưu vào CSDL và phát sự kiện WebSocket: `gateway.server.emit('member:message_received', { fromCode: mine, toCode: targetPeerCode, text })`.
  4. Trình duyệt của chính User A đang lắng nghe sự kiện này. Logic cũ kiểm tra `if (fromCode === currentPeer || toCode === currentPeer)` và tạo thêm một tin nhắn thứ hai `id: sock-17915...` rồi đẩy vào `localMessages`!
  5. Khiến máy của người gửi có 2 bản sao cùng lúc.

### 2.2. Lỗi Phân Mảnh Ranh Giới Slot Thời Gian (Time Boundary Splitting)
- Trong logic gom tin nhắn `mergedMessages`, hệ thống cũ dùng mã hash:
  `const timeSlot = isNaN(timeMs) ? "0" : Math.floor(timeMs / 15000);`
  `const sig = `${Boolean(m.mine)}|${cleanText}|${timeSlot}`;`
- Phép chia 15.000ms tạo ra các ranh giới cố định (:00, :15, :30, :45 giây).
- Nếu tin nhắn optimistic tạo lúc 13:50:**14**.800 (nằm ở slot `K`) và server lưu lúc 13:50:**15**.200 (nằm ở slot `K+1`):
  -> Hai tin nhắn có 2 mã `sig` khác nhau hoàn toàn!
  -> Thuật toán deduplication bỏ qua không nhận diện được sự trùng lặp, khiến cả 2 tin nhắn cùng hiển thị ra UI.

### 2.3. Tồn Đọng Rác Trong LocalStorage
- Mảng `localMessages` được lưu vào `localStorage.setItem('vba.chat.${peer.peerCode}', ...)`.
- Hệ thống cũ không có cơ chế thu hồi/dọn dẹp các tin nhắn optimistic khi server đã trả về tin nhắn chính thức.
- Kết quả là các bản sao `local-...` cũ tiếp tục tồn tại mãi mãi trong trình duyệt.

---

## 3. KIẾN TRÚC GIẢI PHÁP ĐÃ TRIỂN KHAI

### 3.1. Phía Backend (`messenger.service.ts`)
1. Sinh trước UUID và Timestamp chuẩn ISO tại thời điểm xử lý:
   ```typescript
   const msgId = crypto.randomUUID();
   const nowIso = new Date().toISOString();
   ```
2. Lưu bản ghi vào PostgreSQL và phát WebSocket kèm ID cùng Timestamp chuẩn:
   ```typescript
   await this.prisma.$executeRaw`
     INSERT INTO public.messages (id, from_id, to_id, text, created_at)
     VALUES (${msgId}::uuid, ${mine}, ${targetPeerCode}, ${text}, ${nowIso}::timestamptz)
   `;

   this.gateway.server.emit('member:message_received', {
     id: msgId,
     fromCode: mine,
     toCode: targetPeerCode,
     fromUserId: userId,
     toUserId: targetUserId,
     text,
     createdAt: nowIso,
   });
   ```
3. Trả về kết quả HTTP gồm ID chính thức: `{ ok: true, id: msgId, myCode }`.

### 3.2. Phía Frontend (`ChatThread.tsx`)
1. **Chặn Socket Echo Lặp Phía Người Gửi**:
   - Chỉ thêm tin nhắn vào `localMessages` nếu `fromCode === currentPeer` (tin nhắn gửi đến từ đối tác).
   - Bỏ qua các sự kiện socket phát lại tin nhắn của chính mình vì máy gửi đã có bản sao optimistic.
2. **Re-key Optimistic Message**:
   - Khi API `send()` trả về `{ ok: true, id }`, hàm `handleSend` thay thế ngay lập tức `tempId` của tin nhắn optimistic thành server UUID thực tế.
3. **Thuật Toán Deduplication Theo Khoảng Thời Gian Thực (Sliding Window)**:
   - Xóa bỏ hoàn toàn phép chia `timeSlot = Math.floor(timeMs / 15000)`.
   - Sử dụng độ lệch thời gian thực `diff < 45000` (45 giây) kết hợp kiểm tra `m.mine` và nội dung đã `.trim()`.
   - Khi phát hiện trùng lặp, ưu tiên tuyệt đối tin nhắn mang ID chính thức từ Server.
4. **Tự Động Dọn Dẹp Local Storage**:
   - Bổ sung `useEffect` giám sát `effectiveData.messages`.
   - Tự động xóa các bản sao `local-...` khi server đã có tin nhắn tương ứng, giữ cho `localStorage` luôn sạch sẽ.

### 3.3. Nâng Cấp Nút Nhắn Tin Danh Bạ (`association.members.tsx`)
- Viền: `border-2 border-blue-600 dark:border-blue-400` (dày 2px, màu xanh Royal rõ nét).
- Nền & Chữ: `bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300`.
- Biểu tượng: `<MessageSquare className="h-4.5 w-4.5 stroke-[2.6] fill-blue-600/25 group-hover:fill-white/30 group-hover:text-white text-blue-700 dark:text-blue-300 transition-colors" />` với nét vẽ dày 2.6px và màu đổ fill 25% giúp bong bóng chat đậm đà, không bị rỗng và sắc nét tuyệt đối.

---

## 4. MA TRẬN KIỂM TRA CHẤT LƯỢNG (VERIFICATION MATRIX)

| Thành phần | Công cụ kiểm tra | Kết quả | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Backend TypeScript** | `npx tsc --noEmit -p tsconfig.json` | 0 errors (Exit code 0) | ✅ Đạt |
| **Frontend TypeScript** | `npx tsc --noEmit` | 0 errors (Exit code 0) | ✅ Đạt |
| **ESLint Validation** | `npx eslint` trên toàn bộ các tệp liên quan | 0 errors (Exit code 0) | ✅ Đạt |
| **Bảo mật Git** | Strict Rule 1 (AGENTS.md) | Không commit / push tự động | ✅ Đạt |
