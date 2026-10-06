import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  Mic,
  MicOff,
  X,
  Sparkles,
  Calendar,
  ShoppingBag,
  Handshake,
  Users,
  CreditCard,
  QrCode,
  User,
  MessageSquare,
  Home,
  CheckCircle2,
  Volume2,
  VolumeX,
  Compass,
  Send,
  RotateCcw,
  Bell,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import {
  useVoiceGpsTour,
  startTourGlobally,
  getTourById,
} from "@/lib/tours/voice-gps-controller";
import { VoiceGpsHudOverlay } from "./VoiceGpsHudOverlay";

export const VOICE_AI_STORAGE_KEY = "ceo1983_voice_ai_enabled";
export const VOICE_AI_EVENT_NAME = "ceo1983-voice-ai-toggle";

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

interface QuickPrompt {
  label: string;
  query: string;
  icon: typeof Calendar;
  color: string;
  tourId?: string;
  route?: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Sự kiện đông người nhất?",
    query: "Sự kiện nào đang được nhiều người đăng ký nhất?",
    icon: Calendar,
    color: "from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30",
  },
  {
    label: "Sự kiện tôi đã đăng ký",
    query: "Tôi có đang đăng ký sự kiện nào không?",
    icon: QrCode,
    color: "from-blue-500/20 to-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  {
    label: "Thông báo chưa đọc",
    query: "Tôi có thông báo nào chưa đọc không?",
    icon: Bell,
    color: "from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/30",
  },
  {
    label: "Kiểm tra hội phí",
    query: "Tôi có hội phí nào chưa đóng không?",
    icon: CreditCard,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30",
  },
  {
    label: "Chỉ dẫn: Đăng ký sự kiện",
    query: "Hướng dẫn tôi thao tác đăng ký sự kiện như nào",
    icon: Compass,
    color: "from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30",
    tourId: "association-events",
    route: "/association/events",
  },
  {
    label: "Chỉ dẫn: Thẻ NFC & Danh thiếp",
    query: "Hướng dẫn tôi ghi thẻ danh thiếp số NFC",
    icon: CreditCard,
    color: "from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30",
    tourId: "association-card",
    route: "/association/card",
  },
  {
    label: "Chỉ dẫn: Quét card visit AI",
    query: "Hướng dẫn tôi chụp và quét card visit giấy bằng AI",
    icon: Sparkles,
    color: "from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30",
    tourId: "association-card",
    route: "/association/card",
  },
  {
    label: "Chỉ dẫn: Vé Check-in QR",
    query: "Hướng dẫn tôi xuất trình vé check in sự kiện và xem bàn VIP",
    icon: QrCode,
    color: "from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30",
    tourId: "association-checkin",
    route: "/association/checkin",
  },
  {
    label: "Chỉ dẫn: Danh bạ & Hẹn 1-1",
    query: "Hướng dẫn tôi tìm kiếm hội viên và đặt lịch hẹn giao thương 1-on-1",
    icon: Users,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30",
    tourId: "association-members",
    route: "/association/members",
  },
  {
    label: "Chỉ dẫn: Sàn Giao thương B2B",
    query: "Hướng dẫn tôi đăng bán sản phẩm và kết nối cơ hội kinh doanh B2B",
    icon: Handshake,
    color: "from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30",
    tourId: "association-products",
    route: "/association/products",
  },
  {
    label: "Chỉ dẫn: Biểu quyết & Lucky Draw",
    query: "Hướng dẫn tôi biểu quyết đại hội và quay số may mắn Lucky Draw",
    icon: Award,
    color: "from-emerald-500/20 to-green-500/10 text-emerald-300 border-emerald-500/30",
    tourId: "association-voting",
    route: "/association/voting",
  },
  {
    label: "Chỉ dẫn: Đóng hội phí VietQR",
    query: "Hướng dẫn tôi đóng hội phí thường niên qua VietQR MB Bank",
    icon: CreditCard,
    color: "from-teal-500/20 to-emerald-500/10 text-teal-300 border-teal-500/30",
    tourId: "association-profile",
    route: "/association/profile",
  },
  {
    label: "Chỉ dẫn: Tạo sự kiện mới (CRM)",
    query: "Hướng dẫn tôi tạo sự kiện mới cho Ban Tổ Chức",
    icon: Calendar,
    color: "from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30",
    tourId: "events-admin",
    route: "/events",
  },
  {
    label: "Chỉ dẫn: Giao việc điều hành",
    query: "Hướng dẫn tôi giao việc và theo dõi nhiệm vụ điều hành ban thư ký",
    icon: CheckCircle2,
    color: "from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30",
    tourId: "tasks-admin",
    route: "/tasks",
  },
  {
    label: "Chỉ dẫn: Phân quyền RBAC",
    query: "Hướng dẫn tôi phân quyền tài khoản và cấp thẩm quyền soát vé",
    icon: Compass,
    color: "from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/30",
    tourId: "permissions-admin",
    route: "/permissions",
  },
];

export function VoiceNavAssistant() {
  const [enabled, setEnabled] = useState(() => isVoiceAiEnabled());
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Dynamic Live Member Context
  const [liveContext, setLiveContext] = useState<any | null>(null);
  const [pendingTour, setPendingTour] = useState<{
    tourId: string;
    route?: string;
    featureName?: string;
  } | null>(null);

  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: "user" | "assistant";
      text: string;
      speechText?: string;
      intent?: string;
      tourId?: string;
      route?: string;
      featureName?: string;
      suggestTour?: boolean;
    }>
  >([]);

  const { user, status } = useAuth();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const transcriptRef = useRef<string>("");
  const isListeningRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);

  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Lắng nghe sự kiện bật/tắt từ Tab Cá nhân
  useEffect(() => {
    const handleToggle = () => {
      setEnabled(isVoiceAiEnabled());
    };
    window.addEventListener(VOICE_AI_EVENT_NAME, handleToggle);
    return () => window.removeEventListener(VOICE_AI_EVENT_NAME, handleToggle);
  }, []);

  // Khởi tạo SpeechSynthesis & load voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        try {
          const list = window.speechSynthesis.getVoices();
          if (list && list.length > 0) {
            voicesRef.current = list;
          }
        } catch {}
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Đọc câu nói bằng giọng nói tiếng Việt chuẩn (Text-to-Speech)
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      if (synth.paused) {
        synth.resume();
      }

      // Xóa bỏ toàn bộ ký tự markdown, emoji, URL trước khi đọc
      const clean = text
        .replace(/[*_#`~]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/👉|🚀|📍|👋|✨|💬|🤖|💎|👑|🔥|✅|⭐|🎉|📌|🏆/g, "")
        .replace(/\n+/g, ". ")
        .trim();

      if (!clean) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "vi-VN";
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const viVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes("vi") ||
          v.name.toLowerCase().includes("vietnamese") ||
          v.name.toLowerCase().includes("tiếng việt") ||
          v.name.toLowerCase().includes("vietnam"),
      );

      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.warn("[TTS] Utterance error:", e);
        if (onEnd) onEnd();
      };

      synth.speak(utterance);
    } catch (e) {
      console.warn("[TTS] Exception:", e);
      if (onEnd) onEnd();
    }
  }, []);

  // Dẫn đường trực tiếp từng bước (Live GPS Tour)
  const handleStartDirectTour = useCallback(
    (tourId: string, route?: string, featureName?: string) => {
      setPendingTour(null);
      const confirmSpeech = `Dạ vâng! Em sẽ dẫn đường trực tiếp cho Quý Anh/Chị đối với chức năng ${featureName || "này"} ngay bây giờ ạ. Quý Anh/Chị hãy quan sát màn hình và thực hiện theo từng thao tác nhé!`;
      speakText(confirmSpeech, () => {
        setIsOpen(false);
        if (route) {
          void navigate({ to: route as any });
        }
        setTimeout(() => {
          startTourGlobally(tourId);
          toast.success(`Đang bật chỉ dẫn GPS trực tiếp: ${featureName || "Chức năng"}`);
        }, 400);
      });
    },
    [navigate, speakText],
  );

  // Tải dữ liệu ngữ cảnh động tại phiên đăng nhập
  const loadLiveContext = useCallback(async () => {
    try {
      const res = await fetchNestApi<any>("/ai/live-context");
      if (res) {
        setLiveContext(res);
      }
    } catch (e) {
      console.warn("[VoiceNavAssistant] Failed to load live context:", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !liveContext) {
      void loadLiveContext();
    }
  }, [isOpen, liveContext, loadLiveContext]);

  // Bộ Não Hội Thoại Tức Thì Chuẩn Con Người (Instant Human-like Conversational Engine)
  const resolveInstantLocalResponse = useCallback(
    (query: string): {
      answer: string;
      speechText: string;
      intent: "chat" | "query_data" | "start_tour" | "feature_guide";
      tourId?: string;
      route?: string;
      featureName?: string;
      suggestTour?: boolean;
    } | null => {
      const q = query.toLowerCase().trim();
      const memberName = user?.name || "Quý Anh/Chị";

      // 1. Chào hỏi, xưng hô thân tình như con người
      if (
        q === "chào" ||
        q === "xin chào" ||
        q === "chao" ||
        q === "hi" ||
        q === "hello" ||
        q.includes("chào em") ||
        q.includes("chào bạn") ||
        q.includes("alo") ||
        q.includes("em ơi") ||
        q.includes("bạn là ai") ||
        q.includes("tên là gì") ||
        q.includes("giúp được gì")
      ) {
        return {
          answer: `👋 **Dạ em chào ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành Thông Minh** của **CLB Doanh Nhân CEO 1983**.\n\nRất hân hạnh được đồng hành và hỗ trợ Quý Anh/Chị hôm nay ạ! Em có thể giúp Anh/Chị:\n- 📅 **Tra cứu sự kiện:** Xem sự kiện đông người nhất, sự kiện đã đăng ký.\n- 💳 **Hội phí & Thẻ:** Kiểm tra niên liễm, hướng dẫn đóng VietQR, chạm thẻ NFC.\n- 🤝 **Kết nối B2B:** Tìm kiếm danh bạ 200+ CEO, hẹn 1-on-1, đăng sàn sản phẩm.\n- 🧭 **Dẫn đường GPS:** Tự động lái màn hình và chỉ dẫn từng bước thao tác.\n\n👉 *Quý Anh/Chị cần em hỗ trợ việc gì ngay bây giờ ạ?*`,
          speechText: `Dạ em chào ${memberName}! Em là Trợ lý AI điều hành của CEO 1983. Em có thể giúp Quý Anh/Chị tra cứu nhanh lịch sự kiện, kiểm tra hội phí hoặc dẫn đường từng bước trên màn hình ạ! Anh/Chị cần em hỗ trợ gì ạ?`,
          intent: "chat",
        };
      }

      // 2. Hỏi sự kiện nhiều người đăng ký nhất / Sự kiện đông nhất
      if (
        q.includes("nhiều người đăng ký") ||
        q.includes("đông người") ||
        q.includes("sự kiện hot") ||
        q.includes("nhiều nhất") ||
        q.includes("top sự kiện")
      ) {
        const top = liveContext?.topEvents?.[0];
        if (top) {
          return {
            answer: `🔥 **Sự kiện đang có nhiều đại biểu đăng ký nhất trong Hiệp hội:**\n\n- 🏆 **${top.title}**\n- ⏰ Thời gian: ${top.eventDate || "Đang diễn ra"}\n- 📍 Địa điểm: ${top.location || "Trung tâm Hội nghị Hiệp hội"}\n- 👥 Số lượng đăng ký: **${top.attendeeCount} đại biểu**\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở sự kiện này để xem chi tiết và đăng ký vé không ạ?*`,
            speechText: `Dạ thưa Quý Anh/Chị, sự kiện đang có nhiều đại biểu đăng ký nhất trong Hiệp hội là ${top.title} với ${top.attendeeCount} đại biểu. Quý Anh/Chị có muốn em dẫn đường mở sự kiện này không ạ? Hãy chọn Có hoặc nói Có nhé!`,
            intent: "feature_guide",
            suggestTour: true,
            tourId: "association-events",
            route: "/association/events",
            featureName: "Lịch Sự Kiện & Đăng Ký Vé",
          };
        }
        return {
          answer: `📅 **Lịch Sự Kiện CLB CEO 1983:**\n\nHiệp hội liên tục tổ chức các chương trình Đại hội, Gala Doanh nhân và Tọa đàm Giao thương B2B.\n\n👉 *Quý Anh/Chị có muốn em mở mục Sự kiện ngay không ạ?*`,
          speechText: `Dạ em có thể mở ngay mục Sự kiện để Quý Anh/Chị xem danh sách các chương trình sắp diễn ra ạ. Anh/Chị có muốn em dẫn đường mở ngay không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-events",
          route: "/association/events",
          featureName: "Lịch Sự Kiện",
        };
      }

      // 3. Hỏi sự kiện của tôi / vé đã đăng ký
      if (
        q.includes("sự kiện của tôi") ||
        q.includes("tôi có đăng ký") ||
        q.includes("vé của tôi") ||
        q.includes("vé check-in") ||
        q.includes("checkin")
      ) {
        const count = liveContext?.myEvents?.length || 0;
        return {
          answer: `🎟️ **Sự kiện Quý Anh/Chị đã đăng ký tham gia:**\n\nHiện tại Quý Anh/Chị đang có **${count} sự kiện** trong danh sách vé đã đặt.\n\n👉 *Quý Anh/Chị có muốn em mở mục Vé Check-in QR Pass để xuất trình tại bàn đón tiếp sự kiện không ạ?*`,
          speechText: `Dạ thưa Quý Anh/Chị, Quý Anh/Chị hiện đang có ${count} sự kiện đã đăng ký vé. Em có thể mở ngay mục Vé Check-in QR để Quý Anh/Chị xuất trình tại cửa ạ! Anh/Chị có muốn em dẫn đường ngay không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-checkin",
          route: "/association/checkin",
          featureName: "Vé Check-in QR & Bàn VIP",
        };
      }

      // 4. Hỏi kiểm tra hội phí / niên liễm
      if (
        q.includes("hội phí") ||
        q.includes("niên liễm") ||
        q.includes("đóng tiền") ||
        q.includes("chưa đóng") ||
        q.includes("nợ phí") ||
        q.includes("vietqr")
      ) {
        const dues = liveContext?.dues;
        const isPaid = dues?.feePaid;
        const total = dues?.totalOutstanding || 0;
        const formatted = new Intl.NumberFormat("vi-VN").format(total);

        if (isPaid) {
          return {
            answer: `✅ **Trạng thái Hội phí của ${memberName}:**\n\nQuý Anh/Chị đã **HOÀN THÀNH ĐẦY ĐỦ** hội phí thường niên cho niên khóa hiện tại. Trân trọng cảm ơn sự đồng hành quý báu của Anh/Chị cùng CLB Doanh Nhân CEO 1983!`,
            speechText: `Dạ báo cáo Quý Anh/Chị, Quý Anh/Chị đã hoàn thành đầy đủ hội phí thường niên cho niên khóa hiện tại rồi ạ. Em cảm ơn Anh/Chị rất nhiều ạ!`,
            intent: "query_data",
          };
        }

        return {
          answer: `⚠️ **Thông tin Hội phí Thường niên của ${memberName}:**\n\n- Trạng thái: **CHƯA ĐÓNG HỘI PHÍ**\n- Số tiền cần thanh toán: **${formatted} VNĐ**\n- Phương thức: Quét mã **VietQR MB Bank** thụ hưởng tự động gạch nợ tức thì.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường tới mục Đóng hội phí VietQR ngay bây giờ không ạ?*`,
          speechText: `Dạ thưa Quý Anh/Chị, trạng thái hội phí của Anh/Chị hiện còn chưa đóng, số tiền cần thanh toán là ${formatted} đồng. Quý Anh/Chị có muốn em mở ngay mục Đóng hội phí VietQR để chuyển khoản thuận tiện không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-profile",
          route: "/association/profile",
          featureName: "Đóng Hội Phí VietQR",
        };
      }

      // 5. Hỏi thông báo chưa đọc
      if (q.includes("thông báo") || q.includes("tin tức mới") || q.includes("nhắc việc")) {
        const count = liveContext?.notifications?.unreadCount || 0;
        return {
          answer: `🔔 **Trung Tâm Thông Báo Hiệp Hội:**\n\nQuý Anh/Chị hiện đang có **${count} thông báo chưa đọc** từ Ban Điều Hành và Ban Thư Ký CLB CEO 1983.\n\n👉 *Quý Anh/Chị có muốn em mở mục Thông báo để xem chi tiết không ạ?*`,
          speechText: `Dạ thưa Quý Anh/Chị, Quý Anh/Chị đang có ${count} thông báo chưa đọc từ Ban Thư Ký ạ. Quý Anh/Chị có muốn em mở mục Thông báo để xem ngay không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-notifications",
          route: "/association/notifications",
          featureName: "Trung Tâm Thông Báo",
        };
      }

      // 6. Hỏi Danh bạ hội viên & Đặt lịch hẹn 1-on-1
      if (
        q.includes("danh bạ") ||
        q.includes("tìm hội viên") ||
        q.includes("doanh nhân") ||
        q.includes("hẹn 1-1") ||
        q.includes("gặp ai") ||
        q.includes("thành viên")
      ) {
        return {
          answer: `👥 **Danh Bạ 200+ Doanh Nhân Lãnh Đạo CLB CEO 1983:**\n\nQuý Anh/Chị có thể dễ dàng tìm kiếm đối tác theo ngành nghề (Bất động sản, Xây dựng, Tài chính, Công nghệ...), xem hồ sơ 360° và bấm **Đặt lịch hẹn 1-on-1** kết nối giao thương.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Danh bạ hội viên ngay bây giờ không ạ?*`,
          speechText: `Dạ mạng lưới CEO 1983 hiện có hơn 200 doanh nhân lãnh đạo thuộc nhiều ngành nghề. Em có thể dẫn đường mở ngay Danh bạ để Quý Anh/Chị kết nối và đặt lịch hẹn 1-on-1 ạ! Anh/Chị có muốn em mở ngay không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-members",
          route: "/association/members",
          featureName: "Danh Bạ Hội Viên 200+ CEO",
        };
      }

      // 7. Hỏi Thẻ Hội viên & Danh thiếp số NFC
      if (
        q.includes("thẻ hội viên") ||
        q.includes("danh thiếp số") ||
        q.includes("nfc") ||
        q.includes("card visit") ||
        q.includes("quét card")
      ) {
        return {
          answer: `💳 **Thẻ Hội Viên VIP 3D & Danh Thiếp Số NFC:**\n\n- **Mặt trước:** Logo chuẩn Brandbook và hiệu ứng vàng kim sang trọng.\n- **Mặt sau:** Slogan *"Gắn kết bền - Phát triển vững"*, mã QR đa năng và chip NFC.\n- **Quét Card Visit AI:** Dùng camera quét danh thiếp giấy trích xuất thông tin tự động bằng AI.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Thẻ hội viên và Danh thiếp số ngay không ạ?*`,
          speechText: `Dạ thẻ hội viên CEO 1983 tích hợp chip NFC một chạm và quét card visit thông minh bằng AI. Quý Anh/Chị có muốn em mở mục Danh thiếp số để xem và chia sẻ ngay không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-card",
          route: "/association/card",
          featureName: "Thẻ Hội Viên & Danh Thiếp Số NFC",
        };
      }

      // 8. Hỏi Chợ B2B Marketplace & Sàn Giao Thương
      if (
        q.includes("chợ") ||
        q.includes("sản phẩm") ||
        q.includes("marketplace") ||
        q.includes("bán hàng") ||
        q.includes("giao thương") ||
        q.includes("cơ hội b2b")
      ) {
        return {
          answer: `🤝 **Sàn Giao Thương & Chợ Sản Phẩm B2B:**\n\nNơi các CEO đăng tải sản phẩm, dịch vụ tiêu biểu và kết nối nhu cầu mua bán sỉ trực tiếp trong cộng đồng doanh nghiệp CEO 1983.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Sàn giao thương sản phẩm ngay không ạ?*`,
          speechText: `Dạ Sàn giao thương B2B của CEO 1983 là nơi các doanh nghiệp đăng bán sản phẩm và kết nối mua sỉ trực tiếp. Quý Anh/Chị có muốn em mở ngay Chợ sản phẩm B2B không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-products",
          route: "/association/products",
          featureName: "Sàn Giao Thương B2B",
        };
      }

      // 9. Hỏi Biểu quyết đại hội & Lucky Draw
      if (
        q.includes("biểu quyết") ||
        q.includes("bầu cử") ||
        q.includes("bỏ phiếu") ||
        q.includes("quay số") ||
        q.includes("lucky draw") ||
        q.includes("trúng thưởng")
      ) {
        return {
          answer: `🏆 **Biểu Quyết Đại Hội & Vòng Quay May Mắn (Lucky Draw):**\n\nChức năng bỏ phiếu điện tử bảo mật thời gian thực và quay số ngẫu nhiên trao quà tri ân hội viên tại các sự kiện Gala.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở mục Biểu quyết & Lucky Draw không ạ?*`,
          speechText: `Dạ em có thể mở ngay mục Biểu quyết đại hội và quay số may mắn Lucky Draw để Quý Anh/Chị tham gia ạ! Anh/Chị có muốn em mở ngay không ạ?`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-voting",
          route: "/association/voting",
          featureName: "Biểu Quyết & Lucky Draw",
        };
      }

      return null;
    },
    [liveContext, user],
  );

  // Gửi câu hỏi tới Trợ lý AI (Instant Local Engine + Google Gemini 2.0 Flash)
  const submitPrompt = useCallback(
    async (promptText: string) => {
      if (!promptText.trim()) return;

      const userMsg = promptText.trim();
      const lower = userMsg.toLowerCase();

      // Kiểm tra câu trả lời khẳng định ("Có", "Đồng ý", "OK", "Bắt đầu", "Hướng dẫn đi")
      const isAffirmative =
        lower === "có" ||
        lower === "co" ||
        lower === "có chứ" ||
        lower === "co chu" ||
        lower === "đồng ý" ||
        lower === "dong y" ||
        lower === "ok" ||
        lower === "yes" ||
        lower === "y" ||
        lower.includes("hướng dẫn đi") ||
        lower.includes("dẫn đường") ||
        lower.includes("chỉ đi") ||
        lower.includes("bắt đầu") ||
        lower.includes("thao tác trực tiếp");

      if (isAffirmative && pendingTour) {
        setInputText("");
        setTranscript("");
        transcriptRef.current = "";
        setChatHistory((prev) => [
          ...prev,
          { role: "user", text: userMsg },
          {
            role: "assistant",
            text: `🚀 **Dạ vâng! Em sẽ dẫn đường trực tiếp cho Quý Anh/Chị đối với "${pendingTour.featureName || "chức năng"}" ngay bây giờ ạ!**`,
          },
        ]);
        handleStartDirectTour(pendingTour.tourId, pendingTour.route, pendingTour.featureName);
        return;
      }

      setInputText("");
      setTranscript("");
      transcriptRef.current = "";

      // ── BƯỚC 1: XỬ LÝ PHẢN HỒI NGAY LẬP TỨC (< 50ms) BẰNG BỘ NÃO TỨC THÌ ──
      const instantRes = resolveInstantLocalResponse(userMsg);
      if (instantRes) {
        setChatHistory((prev) => [
          ...prev,
          { role: "user", text: userMsg },
          {
            role: "assistant",
            text: instantRes.answer,
            speechText: instantRes.speechText,
            intent: instantRes.intent,
            tourId: instantRes.tourId,
            route: instantRes.route,
            featureName: instantRes.featureName,
            suggestTour: instantRes.suggestTour,
          },
        ]);

        if (instantRes.suggestTour && instantRes.tourId) {
          setPendingTour({
            tourId: instantRes.tourId,
            route: instantRes.route,
            featureName: instantRes.featureName || "Chức năng",
          });
        } else {
          setPendingTour(null);
        }

        setStatusMessage(null);
        speakText(instantRes.speechText);
        return;
      }

      // ── BƯỚC 2: NẾU CÂU HỎI MỞ -> GỬI BACKEND (GOOGLE GEMINI 2.0 FLASH) ──
      setIsLoadingAi(true);
      setStatusMessage("Trợ lý AI đang tra cứu câu trả lời cho Quý Anh/Chị...");
      setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);

      try {
        const res = await fetchNestApi<{
          ok: boolean;
          data: {
            answer: string;
            speechText: string;
            intent: "chat" | "query_data" | "start_tour" | "feature_guide";
            tourId?: string;
            route?: string;
            featureName?: string;
            suggestTour?: boolean;
            dynamicData?: any;
          };
        }>("/ai/ask", {
          method: "POST",
          body: JSON.stringify({
            prompt: userMsg,
            clientContext: pendingTour
              ? {
                  pendingTourId: pendingTour.tourId,
                  pendingRoute: pendingTour.route,
                  featureName: pendingTour.featureName,
                }
              : undefined,
          }),
        });

        const aiData = res?.data;
        if (aiData) {
          setChatHistory((prev) => [
            ...prev,
            {
              role: "assistant",
              text: aiData.answer,
              speechText: aiData.speechText,
              intent: aiData.intent,
              tourId: aiData.tourId,
              route: aiData.route,
              featureName: aiData.featureName,
              suggestTour: aiData.suggestTour,
            },
          ]);

          setStatusMessage(null);

          if (aiData.intent === "start_tour" && aiData.tourId) {
            handleStartDirectTour(aiData.tourId, aiData.route, aiData.featureName);
          } else if (aiData.suggestTour && aiData.tourId) {
            setPendingTour({
              tourId: aiData.tourId,
              route: aiData.route,
              featureName: aiData.featureName || "Chức năng",
            });
            speakText(aiData.speechText);
          } else {
            setPendingTour(null);
            speakText(aiData.speechText);
          }
        }
      } catch (err: any) {
        console.warn("[VoiceNavAssistant] AI ask error:", err);
        const fallbackText =
          `Dạ em đã nhận được yêu cầu: "${userMsg}". Em có thể giúp Quý Anh/Chị tra cứu nhanh Lịch sự kiện, kiểm tra Hội phí hoặc mở Danh bạ hội viên bằng các nút tiện ích ngay bên dưới nhé ạ!`;
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackText, speechText: fallbackText },
        ]);
        speakText(fallbackText);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [handleStartDirectTour, pendingTour, resolveInstantLocalResponse, speakText],
  );

  // Khởi tạo SpeechRecognition ổn định, không bị hủy khi re-render
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setStatusMessage("Đang lắng nghe Quý Anh/Chị nói...");
        setTranscript("");
        transcriptRef.current = "";
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }

        if (currentText.trim()) {
          setTranscript(currentText);
          transcriptRef.current = currentText;

          // Bộ đếm im lặng 1.3s: Nếu người dùng ngừng nói thì tự động gửi cho AI
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim() && isListeningRef.current) {
              const textToSend = transcriptRef.current.trim();
              try {
                recognition.stop();
              } catch {}
              setIsListening(false);
              isListeningRef.current = false;
              transcriptRef.current = "";
              setTranscript("");
              void submitPrompt(textToSend);
            }
          }, 1300);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        if (event.error === "not-allowed") {
          setStatusMessage("Vui lòng cấp quyền Microphone để ra lệnh giọng nói.");
          toast.error("Trình duyệt chưa được cấp quyền micro.");
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === "no-speech") {
          setStatusMessage("Chưa nghe rõ câu hỏi. Quý Anh/Chị hãy bấm lại nút Micro nhé!");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (transcriptRef.current.trim()) {
          const textToSend = transcriptRef.current.trim();
          transcriptRef.current = "";
          setTranscript("");
          void submitPrompt(textToSend);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("[SpeechRecognition] Init failed:", err);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [submitPrompt]);

  const startListening = async () => {
    // Tự động dừng TTS nếu đang đọc để không bị micro thu lại giọng AI
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch {}
    }

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn("Yêu cầu quyền truy cập micro:", micErr);
      }
    }

    if (!recognitionRef.current) {
      toast.info("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Quý Anh/Chị có thể gõ vào ô nhập tin nhắn ạ!");
      return;
    }

    try {
      recognitionRef.current.abort();
    } catch {}

    try {
      transcriptRef.current = "";
      setTranscript("");
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    isListeningRef.current = false;

    if (transcriptRef.current.trim()) {
      const textToSend = transcriptRef.current.trim();
      transcriptRef.current = "";
      setTranscript("");
      void submitPrompt(textToSend);
    }
  };

  const handleOpenAssistant = () => {
    setIsOpen(true);
    if (chatHistory.length === 0) {
      const memberName = user?.name || "Quý Anh/Chị";
      const greeting = `Dạ em kính chào ${memberName}! Em là Trợ lý AI Điều Hành CEO 1983. Quý Anh/Chị có thể hỏi em: "Sự kiện nào đông người nhất?", "Kiểm tra hội phí của tôi" hoặc yêu cầu "Hướng dẫn tôi đăng ký sự kiện" ạ!`;
      setChatHistory([
        {
          role: "assistant",
          text: greeting,
          speechText: `Dạ em chào ${memberName}! Em là Trợ lý AI điều hành của CEO 1983. Em có thể tra cứu sự kiện, kiểm tra hội phí và dẫn đường giọng nói cho Quý Anh/Chị ạ!`,
        },
      ]);
      speakText(`Dạ em chào ${memberName}! Em là Trợ lý AI điều hành của CEO 1983. Em có thể tra cứu sự kiện, kiểm tra hội phí và dẫn đường giọng nói cho Quý Anh/Chị ạ!`);
    }
  };

  const handleQuickPromptClick = (qp: QuickPrompt) => {
    void submitPrompt(qp.query);
  };

  const handleDismissRobot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEnabled(false);
    setVoiceAiEnabled(false);
    toast.info("Đã ẩn Trợ lý AI. Bạn có thể bật lại bất kỳ lúc nào tại Tab Cá nhân.", {
      action: {
        label: "Bật lại",
        onClick: () => {
          setEnabled(true);
          setVoiceAiEnabled(true);
        },
      },
    });
  };

  // Chỉ hiển thị Trợ lý AI khi người dùng đã đăng nhập thành công vào app hiệp hội (/association/* hoặc /m/*)
  const pathname = (currentPath || "").toLowerCase();
  const isAssociationApp = pathname.startsWith("/association") || pathname.startsWith("/m");
  if (!isAssociationApp) return null;

  const isAuthOrPublicPage =
    pathname.includes("/login") ||
    pathname === "/auth" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/landing") ||
    pathname.startsWith("/card/") ||
    pathname.startsWith("/b/");

  if (!enabled || !user || status !== "in" || isAuthOrPublicPage) return null;

  return (
    <>
      {/* ── 1. GOOGLE MAPS-STYLE GPS HUD SPOTLIGHT OVERLAY (HOẠT ĐỘNG TOÀN CỤC) ── */}
      <VoiceGpsHudOverlay />

      {/* ── 2. NÚT TRỢ LÝ AI NỔI GOLD/NAVY VIP Ở GÓC MÀN HÌNH ── */}
      <div
        className="fixed bottom-24 right-3 sm:bottom-28 sm:right-5 z-50 flex flex-col items-end pointer-events-auto select-none"
        style={{ filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.45))" }}
      >
        <div className="relative group">
          {/* Nút đóng / ẩn Trợ lý */}
          <button
            type="button"
            onClick={handleDismissRobot}
            title="Đóng trợ lý AI (Có thể bật lại ở Tab Cá nhân)"
            aria-label="Đóng trợ lý AI"
            className="absolute -top-1.5 -left-1.5 z-20 grid h-5 w-5 place-items-center rounded-full bg-slate-900/90 text-slate-300 border border-amber-400/60 shadow-md hover:text-white hover:bg-rose-600 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Cụm Nút Trợ Lý AI Luxury Gold VIP */}
          <button
            type="button"
            onClick={handleOpenAssistant}
            title="Chạm để mở Trợ lý AI Giọng nói & Dẫn đường GPS"
            aria-label="Mở Trợ lý AI Giọng nói"
            className="animate-robot-wobble relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-[#0B2F64] via-[#003B95] to-[#040C20] border-2 border-amber-400 text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {/* Robot Face Graphic */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="flex flex-col items-center -mt-1 mb-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="h-1 w-0.5 bg-amber-400" />
              </div>
              <div className="relative flex flex-col items-center justify-center w-8 h-6 rounded-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-400/80 p-0.5 shadow-inner">
                <div className="flex items-center justify-between w-full px-1 pt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <span className="h-0.5 w-1 rounded-full bg-amber-400" />
                  <span className="h-1 w-1.5 rounded-full bg-amber-300" />
                  <span className="h-0.5 w-1 rounded-full bg-amber-400" />
                </div>
              </div>
            </div>

            {/* Mic Badge */}
            <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md border border-white/40">
              <Mic className="h-3 w-3 fill-current" />
            </div>

            <span className="absolute -inset-1 rounded-2xl bg-amber-400/25 blur-sm pointer-events-none -z-10" />
          </button>
        </div>
      </div>

      {/* ── 3. MODAL HỎI ĐÁP & CHỈ DẪN GIỌNG NÓI EXECUTIVE AI ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-950 border border-amber-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] text-white animate-in slide-in-from-bottom-6 duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Header: Identity & Status Badge */}
            <div className="relative flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-[#003B95]/40 via-amber-500/15 to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-md shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-white truncate">
                      Trợ lý AI CEO 1983
                    </h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      Gemini 2.0 Flash
                    </span>
                  </div>
                  {liveContext?.user ? (
                    <p className="text-[11px] text-slate-300 truncate">
                      Chào mừng <strong>{liveContext.user.name}</strong> ({liveContext.user.code})
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Hỏi đáp dữ liệu thời gian thực & Chỉ dẫn GPS
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsOpen(false);
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dải thông tin phiên đăng nhập động (Live Context Bar) */}
            {liveContext && (
              <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between text-[11px] text-slate-300 gap-2 overflow-x-auto">
                <div className="flex items-center gap-1 shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-amber-300">{liveContext.user.level}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Hội phí:{" "}
                    {liveContext.dues.feePaid ? (
                      <strong className="text-emerald-400">Đã hoàn thành</strong>
                    ) : (
                      <strong className="text-amber-400">
                        Nợ {new Intl.NumberFormat("vi-VN").format(liveContext.dues.totalOutstanding)} đ
                      </strong>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Thông báo:{" "}
                    <strong className="text-cyan-400">{liveContext.notifications.unreadCount}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Khung Chat Hội Thoại */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[180px] max-h-[340px]">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-medium rounded-tr-none shadow-md"
                        : "bg-white/10 text-slate-100 rounded-tl-none border border-white/10 shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Hộp thoại hỏi hướng dẫn thao tác trực tiếp nếu là chỉ dẫn tính năng */}
                    {msg.tourId && (
                      <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-white shadow-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                          <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                          <span>Chỉ dẫn trực tiếp từng bước (Live GPS)</span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-normal">
                          Bạn có muốn hướng dẫn thao tác trực tiếp không tôi sẽ hướng dẫn bạn?
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleStartDirectTour(msg.tourId!, msg.route, msg.featureName)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-300/60"
                          >
                            <span>👉 Có, hướng dẫn trực tiếp</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingTour(null)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                          >
                            Để sau
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoadingAi && (
                <div className="flex items-center gap-2 text-xs text-amber-400 py-1">
                  <div className="h-3 w-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Trợ lý AI đang tra cứu dữ liệu...</span>
                </div>
              )}
            </div>

            {/* Quick Action Chips */}
            <div className="p-3 border-t border-white/10 bg-slate-900/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Câu hỏi gợi ý nhanh:</span>
                <span className="text-amber-400 font-medium">Bấm vào để hỏi</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_PROMPTS.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickPromptClick(qp)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-all bg-gradient-to-r ${qp.color} hover:brightness-110 active:scale-95 cursor-pointer`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{qp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Input & Text Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950 flex flex-col gap-2">
              {statusMessage && (
                <div className="text-[11px] text-amber-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Nút Micro Thu Âm Giọng Nói */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`grid h-11 w-11 place-items-center rounded-2xl transition-all shrink-0 cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse"
                      : "bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-md hover:scale-105"
                  }`}
                  title={isListening ? "Dừng ghi âm" : "Nói bằng giọng nói"}
                >
                  {isListening ? (
                    <Mic className="h-5 w-5 animate-bounce" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </button>

                {/* Ô gõ tin nhắn */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText || transcript}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void submitPrompt(inputText || transcript);
                      }
                    }}
                    placeholder={
                      isListening
                        ? "Đang nghe bạn nói..."
                        : "Hỏi sự kiện, hội phí, hoặc 'Hướng dẫn tôi...'"
                    }
                    className="w-full h-11 rounded-2xl bg-white/10 border border-white/10 px-3.5 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />

                  {/* Nút Gửi */}
                  <button
                    type="button"
                    onClick={() => void submitPrompt(inputText || transcript)}
                    disabled={!inputText.trim() && !transcript.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:pointer-events-none text-slate-950 transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
