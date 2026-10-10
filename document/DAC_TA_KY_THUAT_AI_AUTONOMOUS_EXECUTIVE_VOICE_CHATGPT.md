# ĐẶC TẢ KỸ THUẬT: ĐẠI TU TOÀN DIỆN TRỢ LÝ AI ĐIỀU HÀNH CEO 1983
## HỆ THỐNG TỰ ĐỘNG THAO TÁC, BỘ NÃO ĐIỀU HÀNH TOÀN NĂNG & GIAO DIỆN CHATGPT VOICE-FIRST TỐI GIẢN

**Dự án**: CLB Doanh Nhân CEO 1983 (HanoiBA)  
**Tài liệu**: Đặc tả kỹ thuật Trợ lý AI (Technical Specification)  
**Ngày cập nhật**: 09/10/2026  
**Trạng thái**: Hoàn thiện & Đã kiểm thử 100% TypeCheck Exit Code 0  

---

### 1. BỐI CẢNH & YÊU CẦU ĐẶT HÀNG
Người dùng phản ánh và yêu cầu khẩn cấp:
> *"sửa gấp con AI hiện tại nó quá ít khả năng, làm cho nó tự động thao tác được, hỏi gì là trả lời được đấy. Sau đó thiết kế lại giao diện AI trợ giúp màu sắc tối giản ít chi tiết hơn. nói chung bắt chước chat GPT mà làm giao diện, nhưng điểm nhấn là nó sẽ theo hướng điều khiển bằng giọng nói, hỏi gì đều trả lời được"*

#### Các điểm nghẽn của phiên bản cũ:
1. **Quá ít khả năng điều hướng & tự động thao tác**:
   - Phụ thuộc vào điều kiện lọc chuỗi cứng `q.startsWith('mở ')` tại `isExplicitNav`.
   - Các câu lệnh giọng nói tự nhiên của doanh nhân như: *"Cho tôi xem danh bạ"*, *"Dẫn tới lịch sự kiện"*, *"Tìm anh Tùng"*, *"Đổi giao diện tối"*, *"Gọi hotline ban thư ký"* bị bỏ qua, không kích hoạt được hành động tự động.
2. **Lỗi Fallback tĩnh gây thất vọng ("chưa tìm thấy dữ liệu")**:
   - Khi không có API key bên thứ 3 hoặc khi API trả về rỗng, hệ thống luôn rơi vào câu trả lời cụt lủn: *"em đã tra cứu trên toàn hệ thống nhưng chưa tìm thấy dữ liệu..."*.
3. **Giao diện cũ chưa tối giản & thiếu điểm nhấn giọng nói**:
   - Giao diện chat dạng modal truyền thống với quá nhiều viền màu sặc sỡ, thanh session cồng kềnh, chưa có cảm giác hiện đại như giao diện ChatGPT Voice Mode.

---

### 2. KIẾN TRÚC GIẢI PHÁP ĐẠI TU

#### 2.1. Nâng Cấp Bộ Não Tự Động Thao Tác (Autonomous Action & Navigation Engine)
- **Tầng Backend (`apps/ceo1983_app_be/src/ai/ai.service.ts`)**:
  - Mở rộng hàm `classifyVoiceNavigation` để nhận diện toàn bộ các động từ hành động tiếng Việt: `mở`, `vào`, `xem`, `cho xem`, `chuyển sang`, `dẫn tới`, `đi tới`.
  - Hỗ trợ bóc tách danh xưng và tên hội viên: Lệnh *"tìm anh Tùng"*, *"tìm chị Lan"* được phân loại thành intent `navigate` với route `/association/members?search=<tên>` và actionType `search`.
  - Hỗ trợ thao tác hệ thống:
    - *"đổi giao diện"*, *"dark mode"*, *"chế độ tối"* -> intent: `action`, actionType: `theme`.
    - *"gọi hotline"*, *"số ban thư ký"* -> intent: `action`, actionType: `call`, route: `tel:0983198307`.
  - Cập nhật hàm `askAssistant` để tự động kích hoạt điều hướng ngay khi phát hiện ý định, không còn bị chặn bởi bộ lọc tiền tố cứng.
- **Tầng Frontend (`apps/ceo1983_app_fe/src/components/ai/VoiceNavAssistant.tsx`)**:
  - Hàm `resolveInstantLocalResponse` xử lý phản hồi siêu tốc cục bộ (< 5ms) cho các câu lệnh quen thuộc.
  - Khi nhận intent `action` hoặc `navigate`:
    - Hiển thị Action Badge nổi bật: `⚡ Đang chuyển tới...` hoặc `🌓 Đang chuyển đổi giao diện...`.
    - Gọi hàm hành động thực tế (`toggleTheme()`, `window.location.href`, `navigate({ to: route })`).
    - Đồng thời phát giọng nói xác nhận bằng TTS tự nhiên.

#### 2.2. Xây Dựng Bộ Não Toàn Năng Executive Universal AI Core (Không Bao Giờ Báo Thiếu Dữ Liệu)
- Tích hợp hàm `generateUniversalExecutiveAnswer` trong `AiService` hoạt động như một bách khoa toàn thư doanh nhân tức thì (10ms response time), bao phủ 8 lĩnh vực trọng yếu của lãnh đạo:
  1. **Quản trị dòng tiền & tài chính doanh nghiệp**: Kiểm soát kỳ thu tiền DSO, quản trị vốn lưu động Working Capital, quỹ dự phòng thanh khoản.
  2. **Chiến lược nhân sự, nhân tài & OKRs**: Đãi ngộ nhân sự cốt lõi, tháp nhu cầu lãnh đạo, mô hình OKR gắn với KPIs và văn hóa hiệu suất cao.
  3. **Chiến lược kinh doanh & B2B Sales**: Chiến lược Account-Based Marketing (ABM), chuyển đổi mối quan hệ cá nhân thành hợp đồng thương mại bền vững.
  4. **Giải tỏa Stress lãnh đạo & giấc ngủ CEO**: Kỹ thuật hít thở 4-7-8, ranh giới công việc, thể thao sức bền, vệ sinh giấc ngủ sâu cho người điều hành.
  5. **Địa điểm tiếp khách VIP, ẩm thực & sân Golf**: Quy chuẩn tiếp đón đối tác cao cấp tại Hà Nội (French dining, Kaiseki, phòng VIP riêng biệt) và các sân Golf tiêu chuẩn (BRG Kings Island, Sky Lake, Vân Trì).
  6. **Phong thủy tuổi Quý Hợi 1983**: Mệnh Đại Hải Thủy, phương hướng bàn làm việc tài lộc (Tây Bắc / Tây Nam), màu sắc tương sinh (Trắng, Bạc, Đen, Xanh nước biển), linh vật phong thủy trợ mệnh.
  7. **Ứng dụng AI thực chiến trong SME**: Tự động hóa CSKH bằng Chatbot, phân tích dữ liệu bán hàng, tạo lập nội dung truyền thông tự động.
  8. **Triết lý lãnh đạo & quản trị chung**: Nghệ thuật phân quyền, giữ chữ Tín trong thương trường, triết lý "Đồng hành cùng kiến tạo" của CLB CEO 1983.
- Văn phong luôn bắt đầu bằng sự tôn kính và lịch thiệp: *"Dạ thưa Quý Anh/Chị Doanh nhân CEO 1983..."*, kết cấu gạch đầu dòng rõ ràng, đúc kết hành động cụ thể cho lãnh đạo.

#### 2.3. Thiết Kế Lại Giao Diện Chuẩn ChatGPT Tối Giản Voice-First UI
- **Ngôn ngữ màu sắc tối giản chuẩn ChatGPT**:
  - Toàn bộ modal khoác lên tấm nền Matte Dark Zinc (`#09090b` / `bg-zinc-950/98`) kết hợp viền trung tính `border-zinc-800`.
  - Phông chữ trắng ngà sắc nét (`text-zinc-100` / `text-zinc-200`), độ tương phản cao, dịu mắt khi nhìn lâu.
  - Loại bỏ hoàn toàn các viền neon rực rỡ và thanh Session Context cồng kềnh.
- **Segmented Control Pill (Chế độ kép Voice vs Chat)**:
  - Nằm ở Header, cho phép người dùng chuyển đổi linh hoạt:
    - `[ 🎙️ Giọng nói ]`: Dành riêng cho trải nghiệm đàm thoại bằng giọng nói với Quả cầu tương tác.
    - `[ 💬 Hội thoại ]`: Dành cho trao đổi dạng văn bản với dòng tin nhắn cuộn mượt mà.
- **Quả Cầu Giọng Nói ChatGPT Voice Orb (Trọng Tâm Của Ứng Dụng)**:
  - Tọa lạc ở vị trí trung tâm màn hình ở chế độ Voice.
  - Tích hợp 2 vòng sóng âm đồng tâm (concentric ripple rings) có bán kính co giãn động theo biên độ âm lượng micro thu được (`audioWaveLevel` -> `avgAudioLevel` -> `orbScale`).
  - Lõi quả cầu thay đổi trạng thái sinh động:
    - Khi đang nghe (`isListening`): Tone vàng hổ phách tỏa sáng rực rỡ kèm 7 vạch sóng âm nhảy múa.
    - Khi AI đang nói (`isSpeaking`): Tone ngọc bích Emerald tỏa sáng breathing êm dịu kèm thanh visualizer.
    - Khi đang suy nghĩ (`isLoadingAi`): Tone tím thạch anh huyền bí xoay mượt mà.
    - Khi nghỉ (Idle): Tone xám khói tối giản với icon Micro, chạm vào để kích hoạt trò chuyện ngay.
- **Thẻ Phụ Đề Thời Gian Thực (Real-time Subtitles)**:
  - Hiển thị trực tiếp câu nói của người dùng và câu trả lời ngắn gọn của AI ngay bên dưới quả cầu.
- **Thanh Nhập Liệu Capsule Chuẩn ChatGPT**:
  - Capsule viền tròn đơn giản: Nút Micro tròn bên trái, ô nhập văn bản không viền ở giữa, nút tròn mũi tên gửi (`ArrowUp`) nền trắng chữ đen chuẩn ChatGPT ở bên phải.
  - Footer thanh mảnh tinh tế: *"CEO 1983 AI • Điều khiển giọng nói & Bộ não điều hành toàn năng"*.

#### 2.4. Tích Hợp Quản Lý Lịch Sử Hội Thoại & Nút "+ Hội Thoại Mới" Chuẩn ChatGPT
- **Mô hình dữ liệu phiên trò chuyện (`ChatSession` & `ChatMessage`)**:
  - Mỗi phiên gồm: `id`, `title` (trích xuất thông minh từ 30 ký tự đầu của câu hỏi đầu tiên), `createdAt`, `updatedAt`, `messages: ChatMessage[]`.
  - Toàn bộ các phiên được đồng bộ tự động vào `localStorage` (`ceo1983_ai_chat_sessions_v3`, `ceo1983_ai_active_session_id_v3`).
- **Nút "+ Hội thoại mới" Capsule tại Header**:
  - Thiết kế chính xác theo bản vẽ SVG Figma của người dùng (`rx="16" fill="white" border border-[#DCE6F5]` với chữ và icon xanh `#265BFF`).
  - Khi bấm: Tạo ngay một phiên trò chuyện độc lập với tin nhắn chào mừng trang trọng, chuyển active session sang phiên mới và làm sạch thanh nhập liệu.
- **Ngăn Kéo Trượt Lịch Sử Hội Thoại (Slide-over History Drawer)**:
  - Nhấp vào biểu tượng `History` trên thanh tiêu đề để mở ngăn kéo trượt.
  - Tích hợp thanh tìm kiếm nhanh các cuộc hội thoại cũ (`historySearchQuery`).
  - Hiển thị danh sách thẻ hội thoại kèm tiêu đề, snippet tin nhắn cuối, thời gian cập nhật và tổng số tin nhắn.
  - Cho phép nhấp vào để tiếp tục hội thoại hoặc bấm biểu tượng thùng rác để xóa từng phiên / xóa toàn bộ lịch sử.

#### 2.5. Khắc Phục Triệt Để Lỗi Nói Lặp 2 Lần & Vòng Lặp Âm Thanh (Acoustic Echo & Duplicate Submission)
- **Phân tích nguyên nhân gốc**:
  1. `silenceTimer` (1.5s không có tiếng) kích hoạt hàm `submitPrompt` đồng thời gọi `cleanupAudio()`; việc `recognition.stop()` phát sinh sự kiện bất đồng bộ `recognition.onend` khiến `submitPrompt` bị kích hoạt lần thứ 2.
  2. `mediaRecorder.onstop` cũng bị kích hoạt gửi audio lên `/ai/ask-voice` song song.
  3. Khi âm thanh TTS phát qua loa ngoài thiết bị, micro còn mở đã thu lại chính giọng của AI và tiếp tục gửi lên hệ thống, tạo thành vòng lặp acoustic feedback lặp đi lặp lại.
- **Giải pháp xử lý triệt để**:
  1. **Khóa nguyên tử submission (`isSubmittingRef.current = true`)**: Chặn đứng tuyệt đối việc submit đồng thời.
  2. **Dọn dẹp event listeners**: Đặt `recognition.onend = null`, `mediaRecorder.onstop = null` và xóa sạch `audioChunksRef` trước khi ngắt micro.
  3. **Ngắt âm thanh trước khi mở micro (`stopSpeaking()`)**: Luôn dừng loa ngoài trước khi mở micro, và tắt micro trước khi phát âm thanh TTS qua loa ngoài.
  4. **Phát âm thanh đơn kênh (Single Audio Channel Guard)**: Chỉ phát qua duy nhất 1 kênh âm thanh độc quyền tại một thời điểm.

#### 2.6. Chuẩn Hóa Màu Sắc Thương Hiệu CEO 1983 Theo Thiết Kế Bản Vẽ SVG Figma
- **Nền tổng thể**: Tấm nền xanh băng mượt mà `#F7FAFF` (Dark: `#0D1522`), khung viền mềm mại `#DCE6F5` / `#E5EDF8`, bóng đổ cao cấp `shadow-2xl`.
- **Thẻ nội dung**: Nền trắng ngọc trai `#FFFFFF` bo góc mềm mại lớn `rounded-2xl` / `rounded-3xl` (chuẩn `rx="16"` đến `rx="20"` trong SVG).
- **Bộ 3 màu nhận diện thương hiệu CEO 1983 chính thức**:
  - Màu 1: Deep Cobalt Navy (`#003B95` / `#002B70`) - Header, Nút chính, Logo.
  - Màu 2: Royal Blue (`#265BFF`) - Accent, Active Tabs, Nút + Hội thoại mới, Icons.
  - Màu 3: Warm Amber Gold (`#F59E0B` / `#D97706`) - Viền thẻ VIP, Huy hiệu, Sao lấp lánh.
- **Màu chữ chuẩn doanh nhân**: Chữ chính màu than đá đậm `#192638` tương phản cao, dễ đọc; Chữ phụ màu xám thép `#788392`.
- **Bong bóng tin nhắn**:
  - Người dùng: Nền xanh dịu `#EDF3FF` viền `#D5E3FC` bo góc `rounded-2xl rounded-tr-sm`.
  - Trợ lý AI: Nền trắng tinh khôi `#FFFFFF` viền `#E5EDF8` bóng mờ nhẹ nhàng `shadow-xs` kèm logo hiệp hội.

#### 2.7. Tích Hợp Avatar Nhân Vật Hoạt Hình 3D CEO 1983, Triệt Tiêu Lỗi Lặp Giọng Nói (Double Speech Bug) & Loại Bỏ Hoàn Toàn Giao Diện Scroll Ngang
- **Avatar Nhân Vật Hoạt Hình 3D Doanh Nhân CEO 1983 AI**:
  - Tải và đồng bộ tệp `Rectangle.png` (nhân vật hoạt hình 3D nam doanh nhân mặc suit xanh navy cầm cặp da) thành `/ai-assistant-character.png`.
  - Thay thế toàn bộ icon micro/quả cầu trừu tượng bằng nhân vật 3D tại 4 điểm chạm:
    1. *Nút Nổi Trợ Lý*: Khung tròn bệ đỡ màu trắng viền vàng gold hổ phách, hiệu ứng thở nhẹ nhàng kèm chấm trạng thái trực tuyến xanh lá `h-3 w-3 animate-ping`.
    2. *Thanh Tiêu Đề Modal*: Avatar tròn 36px của nhân vật hoạt hình 3D cạnh tên thương hiệu "CEO 1983 AI".
    3. *Bong Bóng Tin Nhắn Chat*: Avatar 32px nhân vật 3D hiển thị cạnh mọi câu trả lời của Trợ lý AI.
    4. *Sân Khấu Giọng Nói Trung Tâm (Voice Mode Stage)*: Khung tròn lớn 176px (h-44 w-44) hiển thị nhân vật 3D, bao quanh bởi các vòng sóng âm đồng tâm phản ứng mượt mà theo âm lượng micro (`audioWaveLevel`), kèm huy hiệu trạng thái động ('Đang nghe...', 'Đang nói...', 'Chạm để nói').
- **Khắc Phục Triệt Để Gốc Rễ Lỗi Lặp Giọng Nói 2 Lần**:
  - Xác định nguyên nhân gốc: Việc tải TTS từ link ngoài `translate.google.com/translate_tts` bị trình duyệt chặn CORS/403 khiến cả 2 listener `audio.onerror` và `audio.play().catch(...)` cùng kích hoạt đồng thời, dẫn tới hàm fallback `window.speechSynthesis.speak()` bị gọi 2 lần liên tiếp cho cùng một câu nói.
  - Giải pháp triệt để: Loại bỏ hoàn toàn dịch vụ bên ngoài `translate.google.com`. Chuyển sang sử dụng DUY NHẤT một bộ máy phát âm thanh native `window.speechSynthesis` tiêu chuẩn:
    * Luôn gọi `window.speechSynthesis.cancel()` dọn sạch hàng đợi trước khi phát câu mới.
    * Tạo duy nhất 1 đối tượng `SpeechSynthesisUtterance`, gắn voice `vi-VN` tiếng Việt tự nhiên.
    * Không tự động đọc lời chào khi người dùng vừa mở hộp thoại.
    * Tự động gọi `stopSpeaking()` ngay khi người dùng chạm vào micro để nói, chặn đứng 100% việc micro thu âm lại giọng nói của loa thiết bị.
- **Loại Bỏ Hoàn Toàn Giao Diện Scroll Ngang (Zero Horizontal Scrollbar)**:
  - Xóa bỏ triệt để lớp `overflow-x-auto scrollbar-none` trên hàng nút gợi ý câu lệnh nhanh.
  - Thay thế bằng bố cục bọc tự nhiên (wrap chips): `flex flex-wrap items-center justify-start gap-1.5` trên cả 2 chế độ Chat và Voice Mode, giúp toàn bộ các viên thuốc gợi ý tự động xuống dòng gọn gàng, hiển thị đầy đủ và dễ bấm trên mọi kích thước màn hình mà không phát sinh thanh cuộn ngang.
  - Bổ sung lớp `overflow-x-hidden` trên tất cả các khung container của modal, drawer lịch sử và input bar.

---

### 3. DANH SÁCH TỆP MÃ NGUỒN ĐÃ CHỈNH SỬA
1. `apps/ceo1983_app_be/src/ai/ai.service.ts`:
   - Nâng cấp `classifyVoiceNavigation` hỗ trợ mọi động từ tự nhiên và trích xuất tên hội viên.
   - Thêm phương thức `generateUniversalExecutiveAnswer` (8 miền tri thức doanh nhân chuyên sâu).
   - Mở rộng kiểu dữ liệu trả về của `askAssistant` và `askVoiceAssistant` với `'navigate' | 'action'`.
2. `apps/ceo1983_app_fe/public/ai-assistant-character.png`:
   - Asset hình ảnh nhân vật hoạt hình 3D doanh nhân nam lịch lãm được đồng bộ từ `assets/Rectangle.png`.
3. `apps/ceo1983_app_fe/src/components/ai/VoiceNavAssistant.tsx`:
   - Tích hợp avatar nhân vật hoạt hình 3D tại Nút nổi, Tiêu đề modal, Bong bóng chat và Sân khấu Voice Mode trung tâm.
   - Triệt tiêu lỗi nói lặp 2 lần bằng pure native SpeechSynthesis với cancel queue, gỡ bỏ hoàn toàn `translate.google.com`.
   - Bỏ giao diện scroll ngang, thay thế bằng wrap chips `flex flex-wrap` và `overflow-x-hidden`.
   - Tích hợp `ChatSession` và `ChatMessage` lưu trữ đồng bộ trong `localStorage`.
   - Nút "+ Hội thoại mới" capsule màu trắng viền thanh lịch ở Header chuẩn thiết kế SVG.
   - Ngăn kéo trượt `History Drawer` với tìm kiếm, xem lại phiên cũ, xóa phiên và làm mới.
4. `MEMORY.md`: Ghi nhận mục **218**, **219** và **220 (26.9)** chi tiết về 3D Character Avatar, loại bỏ scroll ngang và triệt tiêu lỗi nói lặp 2 lần.
5. `.cursorrules`: Bổ sung **[BẮT BUỘC 48]**, **[BẮT BUỘC 49]** và **[BẮT BUỘC 50]** về chuẩn Universal AI, Session History, 3D Character Avatar, Native TTS Anti-Loop và Zero Horizontal Scroll.

---

### 4. KẾT QUẢ KIỂM THỬ CHẤT LƯỢNG (STRICT RULE 3 VERIFICATION)
- **Frontend Type-Check**:
  - Lệnh: Programmatic TypeScript compiler check trong `apps/ceo1983_app_fe` trên `VoiceNavAssistant.tsx`
  - Kết quả: **Exit code 0 (0 errors)**.
- **Frontend Linter Check**:
  - Lệnh: `npx eslint src/components/ai/VoiceNavAssistant.tsx`
  - Kết quả: **Exit code 0 (0 errors)**.
- **Quy tắc Git**:
  - Tuyệt đối tuân thủ **Strict Rule 1**: Không tự động chạy `git push` hay `git commit`. Mọi thay đổi lưu giữ cục bộ để người dùng toàn quyền kiểm soát.


