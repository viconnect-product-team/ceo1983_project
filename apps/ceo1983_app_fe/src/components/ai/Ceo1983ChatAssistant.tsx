import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Sparkles,
  Send,
  Calendar,
  Handshake,
  Users,
  CreditCard,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Building2,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import { useNavigate } from "@tanstack/react-router";

export const VOICE_AI_STORAGE_KEY = "ceo1983_voice_ai_enabled";
export const VOICE_AI_EVENT_NAME = "ceo1983-voice-ai-toggle";
const CHAT_HISTORY_STORAGE_KEY = "ceo1983_ai_chat_messages_v4";
export const AI_CHARACTER_IMAGE = "/ai-assistant-character.png";

// OpenRouter API Configuration
const OPENROUTER_API_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENROUTER_API_KEY) || "";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.0-flash-001";
const OPENROUTER_FALLBACK_MODEL = "openai/gpt-4o-mini";

export function isVoiceAiEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const val = localStorage.getItem(VOICE_AI_STORAGE_KEY);
  return val !== "false";
}

export function setVoiceAiEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOICE_AI_STORAGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new Event(VOICE_AI_EVENT_NAME));
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  suggestions?: string[];
  actionLink?: {
    label: string;
    route: string;
  };
}

interface QuickPrompt {
  label: string;
  query: string;
  icon: typeof Calendar;
  route?: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Sự kiện mới",
    query: "Có sự kiện nào mới và sắp diễn ra trong CLB CEO 1983 không?",
    icon: Calendar,
    route: "/association/events",
  },
  {
    label: "Sự kiện tôi đã đăng ký",
    query: "Tôi đang đăng ký hoặc quan tâm những sự kiện nào?",
    icon: Calendar,
    route: "/association/events",
  },
  {
    label: "Cơ hội giao thương mới",
    query: "Hiện tại có cơ hội kết nối kinh doanh hoặc chào bán sản phẩm nào mới không?",
    icon: Handshake,
    route: "/association/opportunities",
  },
  {
    label: "Bạn bè & Kết nối của tôi",
    query: "Tôi có bao nhiêu bạn bè và kết nối trong danh bạ CEO 1983?",
    icon: Users,
    route: "/association/members",
  },
  {
    label: "Cơ cấu các Ban chuyên môn",
    query: "Hiệp hội CEO 1983 gồm những Ban chuyên môn nào và chức năng của từng ban?",
    icon: Building2,
  },
];

export interface UserAiQuota {
  userId: string;
  userName: string;
  userEmail: string;
  usedCount: number;
  maxLimit: number;
  extraGranted: number;
  totalLimit: number;
  remaining: number;
  isExceeded: boolean;
  isBlocked: boolean;
  lastRequestedAt: string;
  lastQuestion: string;
}

export function Ceo1983ChatAssistant() {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const streamingIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Quota: Limit 50 questions per account
  const [quota, setQuota] = useState<UserAiQuota>({
    userId: "",
    userName: "",
    userEmail: "",
    usedCount: 0,
    maxLimit: 50,
    extraGranted: 0,
    totalLimit: 50,
    remaining: 50,
    isExceeded: false,
    isBlocked: false,
    lastRequestedAt: "",
    lastQuestion: "",
  });

  // Dynamic context for the assistant
  const [liveContext, setLiveContext] = useState<{
    memberProfile: any;
    upcomingEvents: any[];
    registeredEvents: any[];
    opportunities: any[];
    connectedCount: number;
    totalMembersCount: number;
  }>({
    memberProfile: null,
    upcomingEvents: [],
    registeredEvents: [],
    opportunities: [],
    connectedCount: 0,
    totalMembersCount: 0,
  });

  // Load dynamic context whenever chat opens or user changes
  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadContext() {
      try {
        // 1. Member profile
        const memberRes = await fetchNestApi<any>("/members/me").catch(() => null);

        // 2. Events & my registered events
        const eventsRes = await fetchNestApi<any[]>("/events/my-events").catch(() => []);
        const rawEvents = Array.isArray(eventsRes) ? eventsRes : [];
        const registered = rawEvents.filter((e) => e.registered || e.isRegistered);

        // 3. Opportunities
        const oppsRes = await fetchNestApi<any[]>("/opportunities/my-opportunities").catch(() => []);
        const rawOpps = Array.isArray(oppsRes) ? oppsRes : [];

        // 4. Directory & Connected Members
        const connectedRes = await fetchNestApi<any[]>("/members/directory?connectedOnly=true").catch(() => []);
        const allMembersRes = await fetchNestApi<any[]>("/members/directory").catch(() => []);

        // 5. User AI Quota (50 questions limit per account)
        const quotaRes = await fetchNestApi<any>("/ai/quota").catch(() => null);

        if (active) {
          if (quotaRes?.data) {
            setQuota(quotaRes.data);
          }
          setLiveContext({
            memberProfile: memberRes || {
              name: user?.name || "Hội viên CEO 1983",
              company: (user as any)?.company || "Doanh nghiệp thành viên",
              code: (user as any)?.member_code || "M1983",
              role: (user as any)?.role || "member",
            },
            upcomingEvents: rawEvents,
            registeredEvents: registered,
            opportunities: rawOpps,
            connectedCount: Array.isArray(connectedRes) ? connectedRes.length : 0,
            totalMembersCount: Array.isArray(allMembersRes) ? allMembersRes.length : 120,
          });
        }
      } catch (err) {
        console.warn("[Ceo1983ChatAssistant] Could not load live context:", err);
      }
    }

    void loadContext();

    return () => {
      active = false;
    };
  }, [user, isOpen]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // Auto scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading, scrollToBottom]);

  // Welcome message if thread is empty
  useEffect(() => {
    if (messages.length === 0) {
      const memberName = liveContext.memberProfile?.full_name || liveContext.memberProfile?.name || user?.name || "Anh/Chị";
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          content: `Xin chào **${memberName}**! 👋\n\nEm là **Trợ lý Thông minh CEO 1983**. Em có thể hỗ trợ Anh/Chị giải đáp mọi thông tin trong Hiệp hội:\n\n- 📅 **Lịch sự kiện mới** & các sự kiện Anh/Chị đang đăng ký/quan tâm.\n- 💼 **Cơ hội kinh doanh B2B** & chào mua - chào bán sản phẩm mới.\n- 👥 **Số lượng bạn bè, kết nối** & danh bạ hội viên trực thuộc các Ban.\n- 🏛️ **Cơ cấu tổ chức các Ban chuyên môn** (Ban Điều Hành, Ban Thành Viên, Ban Xúc Tiến Thương Mại, Ban Truyền Thông, Ban Tài Chính...).\n\nAnh/Chị cần em hỗ trợ nội dung gì hôm nay ạ?`,
          timestamp: Date.now(),
          suggestions: [
            "Sự kiện sắp tới",
            "Sự kiện tôi đã đăng ký",
            "Cơ hội kinh doanh mới",
            "Tôi có bao nhiêu bạn bè?",
          ],
        },
      ]);
    }
  }, [user?.name, liveContext.memberProfile, messages.length]);

  // Build dynamic system prompt grounded in app data
  const buildSystemPrompt = () => {
    const p = liveContext.memberProfile;
    const name = p?.full_name || p?.name || user?.name || "Hội viên";
    const company = p?.company_name || p?.company || "Doanh nghiệp CEO 1983";
    const code = p?.code || (user as any)?.member_code || "M1983";
    const title = p?.title || p?.position || "Hội viên chính thức";

    // Format events
    const eventsText = liveContext.upcomingEvents.length > 0
      ? liveContext.upcomingEvents.slice(0, 8).map((e) => {
          return `- ID: ${e.id} | Tên: "${e.title}" | Ngày: ${e.time || e.date || `${e.day}/${e.month}`} | Địa điểm: ${e.place || "Hà Nội"} | Đã đăng ký: ${e.registered ? "CÓ (ĐÃ ĐĂNG KÝ)" : "Chưa"}`;
        }).join("\n")
      : "Hiện tại chưa có sự kiện mới trong lịch trình.";

    // Format registered events
    const regEventsText = liveContext.registeredEvents.length > 0
      ? liveContext.registeredEvents.map((e) => `- "${e.title}" (Thời gian: ${e.time || e.date || `${e.day}/${e.month}`}, Địa điểm: ${e.place || "NCC"})`).join("\n")
      : "Người dùng hiện chưa bấm đăng ký sự kiện nào.";

    // Format opportunities
    const oppsText = liveContext.opportunities.length > 0
      ? liveContext.opportunities.slice(0, 8).map((o) => {
          return `- "${o.title}" | Công ty: ${o.company} | Thể loại: ${o.tag || "Cơ hội giao thương"} | Giá trị: ${o.value || "Thỏa thuận"}`;
        }).join("\n")
      : "Chưa có bài đăng cơ hội mới.";

    return `Bạn là Trợ lý AI Thông minh chính thức của CLB Doanh Nhân CEO 1983 (Hiệp Hội Doanh Nghiệp Trẻ Hà Nội - HanoiBA).
Bạn giao tiếp bằng tiếng Việt lịch thiệp, thông minh, chuẩn mực doanh nhân cao cấp, xưng "em" và gọi người dùng là "Anh/Chị" hoặc "Anh/Chị ${name}".
Bạn nắm toàn bộ kiến thức nghiệp vụ, chức năng và các API endpoints của hệ thống CEO 1983:

THÔNG TIN TÀI KHOẢN NGƯỜI DÙNG HIỆN TẠI:
- Họ và tên: ${name}
- Mã hội viên: ${code}
- Đơn vị / Doanh nghiệp: ${company}
- Chức danh: ${title}
- Số lượng kết nối / bạn bè đã kết nối trong danh bạ: ${liveContext.connectedCount} người
- Tổng số hội viên trong danh bạ CLB: ${liveContext.totalMembersCount} doanh nhân

DỮ LIỆU SỰ KIỆN SẮP TỚI TẠI CLB CEO 1983:
${eventsText}

CÁC SỰ KIỆN ANH/CHỊ ĐANG ĐĂNG KÝ / QUAN TÂM:
${regEventsText}

DỮ LIỆU CƠ HỘI GIAO THƯƠNG B2B MỚI NHẤT:
${oppsText}

HỆ THỐNG API VÀ PHÂN HỆ NGHIỆP VỤ CEO 1983:
1. Danh bạ & Hội viên:
   - Tra cứu danh bạ hội viên, kết nối bạn bè, gửi danh thiếp: GET /members, GET /association/members
   - Hồ sơ cá nhân: GET /association/profile
   - Danh thiếp số: Hỗ trợ hệ thống Danh thiếp kép: "Danh thiếp chính" (CLB CEO 1983) và "Danh thiếp phụ" (Doanh nghiệp cá nhân). Xem & chia sẻ tại GET /association/business-cards
2. Sự kiện & Điểm danh vé:
   - Danh sách sự kiện: GET /events, GET /association/events
   - Đăng ký tham dự: POST /events/register
   - Điểm danh check-in bằng mã QR vé điện tử tại quầy lễ tân: GET /events/checkin, GET /association/qr-checkin
3. Cơ hội giao thương B2B & Gian hàng:
   - Sàn giao thương B2B (chào mua, chào bán, tìm đối tác): GET /opportunities, GET /association/opportunities
   - Gian hàng sản phẩm hội viên: GET /products, GET /association/marketplace
4. Tài chính & Hội phí Niên liễm:
   - Tra cứu hội phí, biên lai thanh toán: GET /dues, GET /association/fees
   - Mức hội phí niên liễm: 15,000,000 VNĐ / năm. Hệ thống tích hợp mã VietQR tự động hạch toán.
5. Biểu quyết & Bầu cử:
   - Bầu cử ban chấp hành và biểu quyết nghị quyết: GET /votes, GET /association/voting
6. Tin tức & Bản tin CLB:
   - Bản tin tuần, hoạt động thiện nguyện, văn nghệ: GET /news, GET /association/news
7. Các Ban chuyên môn và người phụ trách:
   - Ban Điều Hành: Điều phối tổng thể hoạt động CLB
   - Ban Thành Viên: Phát triển và chăm sóc hội viên
   - Ban Xúc Tiến Thương Mại: Kết nối cung cầu B2B
   - Ban Truyền Thông: Quảng bá, sự kiện Caravan, Gala
   - Ban Tài Chính: Quản trị tài chính và thu phí niên liễm
   - Ban Thiện Nguyện: Công tác xã hội, vì cộng đồng
   - Ban Thư Ký: Hỗ trợ hotline và điều phối hành chính

HƯỚNG DẪN TRẢ LỜI:
- Trả lời nhanh, thông minh, chính xác, lịch sự và hỗ trợ tận tình.
- Bất kỳ câu hỏi nào về API, hệ thống, cách dùng tính năng, hay dữ liệu sự kiện, hội viên, ban chuyên môn, hãy giải đáp cặn kẽ và hướng dẫn đường dẫn route tương ứng.
- Khi người dùng hỏi về bạn bè: Trả lời chính xác số lượng (${liveContext.connectedCount} kết nối trên tổng số ${liveContext.totalMembersCount} hội viên).
- Trình bày câu trả lời rõ ràng, dùng bullet point, in đậm các từ khóa quan trọng.`;
  };

  // Send message to OpenRouter API
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    // Check quota limit
    if (quota.isExceeded) {
      toast.error("Anh/Chị đã tạm thời sử dụng hết lượt hỏi trợ lý AI cho tài khoản này.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-quota-${Date.now()}`,
          role: "assistant",
          content: "⚠️ **Thông Báo Trợ Lý AI**: Tài khoản của Anh/Chị đã tạm thời đạt giới hạn lượt hội thoại với trợ lý AI.\n\nVui lòng liên hệ Quản Trị Viên Hệ Thống để được hỗ trợ mở rộng thêm nhé!",
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: promptText,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Ghi nhận câu hỏi vào hệ thống Quota
    fetchNestApi<any>("/ai/quota/record", {
      method: "POST",
      body: JSON.stringify({ question: promptText }),
    })
      .then((r) => {
        if (r?.data) setQuota(r.data);
      })
      .catch(() => {
        setQuota((prev) => ({
          ...prev,
          usedCount: prev.usedCount + 1,
          remaining: Math.max(0, prev.totalLimit - (prev.usedCount + 1)),
          isExceeded: prev.usedCount + 1 >= prev.totalLimit,
        }));
      });

    try {
      const systemPrompt = buildSystemPrompt();

      // Format conversation for OpenRouter completions
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...newMessages.slice(-8).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      let responseText = "";

      try {
        const res = await fetch(OPENROUTER_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://ceo1983.vn",
            "X-Title": "CEO 1983 Mobile App Assistant",
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: apiMessages,
            temperature: 0.4,
            max_tokens: 800,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data?.choices?.[0]?.message?.content || "";
        } else {
          // Try fallback model on OpenRouter
          console.warn("[Ceo1983ChatAssistant] OpenRouter primary model failed, trying fallback:", res.status);
          const fallbackRes = await fetch(OPENROUTER_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://ceo1983.vn",
              "X-Title": "CEO 1983 Mobile App Assistant",
            },
            body: JSON.stringify({
              model: OPENROUTER_FALLBACK_MODEL,
              messages: apiMessages,
              temperature: 0.4,
              max_tokens: 800,
            }),
          });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            responseText = data?.choices?.[0]?.message?.content || "";
          }
        }
      } catch (callErr) {
        console.warn("[Ceo1983ChatAssistant] OpenRouter direct call exception:", callErr);
      }

      // If OpenRouter direct call was unavailable, use intelligent backend AI fallback
      if (!responseText) {
        try {
          const nestRes: any = await fetchNestApi("/ai/ask", {
            method: "POST",
            body: JSON.stringify({
              prompt: promptText,
              clientContext: {
                memberProfile: liveContext.memberProfile,
                upcomingEventsCount: liveContext.upcomingEvents.length,
                registeredEventsCount: liveContext.registeredEvents.length,
                opportunitiesCount: liveContext.opportunities.length,
                connectedCount: liveContext.connectedCount,
              },
            }),
          });
          responseText = nestRes?.data?.reply || nestRes?.data?.text || nestRes?.reply || "";
        } catch {}
      }

      // Fallback local rule answers if network failed completely
      if (!responseText) {
        const lower = promptText.toLowerCase();
        if (lower.includes("sự kiện") && (lower.includes("đăng ký") || lower.includes("quan tâm"))) {
          if (liveContext.registeredEvents.length > 0) {
            responseText = `Dạ Anh/Chị đang đăng ký tham gia **${liveContext.registeredEvents.length} sự kiện** sau:\n\n` +
              liveContext.registeredEvents.map((e) => `- 🎟️ **${e.title}** (Thời gian: ${e.time || e.date || "Sắp diễn ra"}, Địa điểm: ${e.place || "Hà Nội"})`).join("\n") +
              `\n\nAnh/Chị có thể mở mục **Lịch Sự Kiện** để kiểm tra mã vé QR điểm danh nhé!`;
          } else {
            responseText = `Dạ hiện tại hệ thống ghi nhận Anh/Chị chưa bấm đăng ký sự kiện nào sắp tới.\n\nCLB đang có **${liveContext.upcomingEvents.length} sự kiện mới**. Anh/Chị hãy vào mục **Lịch Sự Kiện** (/association/events) để chọn và đăng ký vé ngay nhé ạ!`;
          }
        } else if (lower.includes("bạn bè") || lower.includes("kết nối")) {
          responseText = `Dạ hiện tại Anh/Chị đã kết nối với **${liveContext.connectedCount} doanh nhân** trong CLB CEO 1983 (trên tổng số hơn **${liveContext.totalMembersCount} hội viên** chính thức).\n\nAnh/Chị có thể mở **Danh bạ CEO** để quét thêm mã QR hoặc gửi lời chào kết nối đến các đồng nghiệp nhé!`;
        } else if (lower.includes("cơ hội") || lower.includes("kinh doanh") || lower.includes("b2b")) {
          responseText = `Dạ trên Sàn giao thương B2B hiện đang có **${liveContext.opportunities.length} cơ hội hợp tác** mới được các doanh nghiệp chia sẻ.\n\nAnh/Chị có thể mở mục **Cơ Hội Giao Thương** (/association/opportunities) để xem chi tiết hoặc đăng tin chào bán sản phẩm của mình ạ!`;
        } else {
          responseText = `Dạ em đã ghi nhận câu hỏi của Anh/Chị! Ban Thư ký và hệ sinh thái CEO 1983 luôn sẵn sàng hỗ trợ Anh/Chị kết nối giao thương và phát triển doanh nghiệp bền vững.`;
        }
      }

      // Stream response with typewriter effect
      const botId = `bot-${Date.now()}`;
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: botId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
      ]);

      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }

      let charIndex = 0;
      const fullText = responseText;
      const totalChars = fullText.length;
      const chunkSize = totalChars > 400 ? 4 : 2;

      streamingIntervalRef.current = setInterval(() => {
        charIndex += chunkSize;
        if (charIndex >= totalChars) {
          if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: fullText } : m))
          );
        } else {
          const currentSlice = fullText.slice(0, charIndex);
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: currentSlice } : m))
          );
        }
      }, 15);
    } catch (err: any) {
      toast.error("Không thể kết nối tới Trợ lý AI. Vui lòng thử lại sau.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: "Dạ kết nối mạng đang bị gián đoạn. Anh/Chị vui lòng thử lại sau vài giây nhé!",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (!window.confirm("Anh/Chị có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?")) return;
    setMessages([]);
    try {
      localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    } catch {}
    toast.success("Đã xóa lịch sử trò chuyện!");
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Đã sao chép câu trả lời!");
    }
  };

  // Do not render if user is not logged in or disabled, or outside mobile/association app
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  if (!user || !isVoiceAiEnabled() || (!pathname.startsWith("/association") && !pathname.startsWith("/m"))) return null;

  return (
    <>
      {/* ── 1. FLOATING ASSISTANT BUTTON (LUXURY GOLD & NAVY) ── */}
      {!isOpen && (
        <aside
          aria-label="Khung nổi trợ lý thông minh"
          className="fixed bottom-20 right-3.5 z-40 flex flex-col items-end pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#001D4A] via-[#003B95] to-[#0A266E] border-2 border-amber-400 shadow-[0_8px_25px_rgba(245,158,11,0.45)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.65)] hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden p-1.5"
            title="Trợ lý AI CEO 1983"
            aria-label="Mở Trợ lý AI CEO 1983"
          >
            {/* Glowing Amber Pulse */}
            <span className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-ping pointer-events-none" />

            {/* Character Image */}
            <img
              src={AI_CHARACTER_IMAGE}
              alt="AI Assistant"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
              }}
              className="h-full w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />

            {/* Online Sparkle Badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[9px] ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </button>
        </aside>
      )}

      {/* ── 2. CHAT DRAWER / POPUP MODAL (MOBILE SLIDE-UP) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto flex flex-col h-[85vh] max-h-[720px] rounded-t-3xl bg-white dark:bg-[#0B132B] border-t-2 border-x border-amber-500/40 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-amber-500/20 bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A266E] text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 shrink-0 rounded-xl bg-amber-400/10 border border-amber-400/50 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={AI_CHARACTER_IMAGE}
                    alt="AI Character"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/app-icon.png";
                    }}
                    className="h-full w-full object-contain"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[14px] font-black tracking-tight text-amber-300">
                      Trợ Lý AI CEO 1983
                    </h2>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[9px] font-bold">
                      OpenRouter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Giải đáp sự kiện, cơ hội B2B, bạn bè &amp; danh bạ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Xóa lịch sử trò chuyện"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Đóng chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Chips Palette */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {QUICK_PROMPTS.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.query)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-amber-400/40 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition shrink-0 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Icon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[13px] leading-relaxed">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isUser && (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#001D4A] to-[#003B95] border border-amber-400/50 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
                        <img
                          src={AI_CHARACTER_IMAGE}
                          alt="AI"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}

                    <div
                      className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                        isUser
                          ? "bg-gradient-to-r from-[#002B70] to-[#003B95] text-white rounded-tr-xs border border-amber-400/30"
                          : "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700/80"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>

                      {/* Assistant footer controls */}
                      {!isUser && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{new Date(m.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m.id, m.content)}
                            className="inline-flex items-center gap-1 hover:text-amber-500 transition cursor-pointer"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#001D4A] to-[#003B95] border border-amber-400/50 p-0.5 shrink-0 flex items-center justify-center">
                    <img src={AI_CHARACTER_IMAGE} alt="AI" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-[11px] font-medium ml-1">Đang suy nghĩ câu trả lời...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Limit Reached Warning Banner */}
            {quota.isExceeded && (
              <div className="mx-3 my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="flex-1 leading-snug text-[11px]">
                  Tài khoản của bạn đã tạm thời đạt giới hạn lượt hội thoại với trợ lý AI. Vui lòng liên hệ Quản trị viên để được mở rộng thêm.
                </span>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D1A] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  quota.isExceeded
                    ? "Đã đạt giới hạn lượt hỏi cho tài khoản này..."
                    : "Hỏi về sự kiện, cơ hội, bạn bè, ban bệ..."
                }
                disabled={isLoading || quota.isExceeded}
                className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || quota.isExceeded}
                className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-md transition disabled:opacity-40 cursor-pointer active:scale-95"
                title="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
