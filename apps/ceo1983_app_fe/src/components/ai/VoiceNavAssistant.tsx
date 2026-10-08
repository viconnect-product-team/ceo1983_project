import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  Mic,
  MicOff,
  X,
  Sparkles,
  Calendar,
  Handshake,
  Users,
  CreditCard,
  QrCode,
  Compass,
  Send,
  Bell,
  Award,
  ChevronRight,
  Volume2,
  VolumeX,
  Coffee,
  CheckCircle2,
  HelpCircle,
  Activity,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import {
  startTourGlobally,
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
  route?: string;
  tourId?: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Mở danh bạ",
    query: "Mở danh bạ hội viên",
    icon: Users,
    route: "/association/members",
    tourId: "association-members",
  },
  {
    label: "Lịch sự kiện",
    query: "Sự kiện nào đang diễn ra và sắp tới?",
    icon: Calendar,
    route: "/association/events",
    tourId: "association-events",
  },
  {
    label: "Chợ B2B",
    query: "Mở sàn giao thương sản phẩm B2B",
    icon: Handshake,
    route: "/association/products",
    tourId: "association-products",
  },
  {
    label: "Cơ hội giao thương",
    query: "Có cơ hội hợp tác kinh doanh nào mới không?",
    icon: Compass,
    route: "/association/opportunities",
  },
  {
    label: "Kiểm tra hội phí",
    query: "Tôi có hội phí nào chưa đóng không?",
    icon: CreditCard,
    route: "/association/profile",
  },
  {
    label: "Vé Check-in QR",
    query: "Mở vé check-in sự kiện của tôi",
    icon: QrCode,
    route: "/association/checkin",
    tourId: "association-checkin",
  },
  {
    label: "Danh thiếp số NFC",
    query: "Mở danh thiếp số NFC",
    icon: CreditCard,
    route: "/association/card",
    tourId: "association-card",
  },
  {
    label: "Thông báo",
    query: "Tôi có thông báo nào mới chưa đọc không?",
    icon: Bell,
    route: "/association/notifications",
    tourId: "association-notifications",
  },
];

/**
 * Bộ Render Văn Bản Markdown Tối Giản, Sang Trọng Chuẩn Doanh Nhân CEO 1983
 */
function FormattedAiText({ text }: { text: string }) {
  const lines = text.split("\n");

  const renderInline = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-amber-300 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="text-slate-300 italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-medium border border-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-200 font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header style with icon or ###
        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4
              key={idx}
              className="text-xs sm:text-[13px] font-semibold text-slate-100 pt-1 border-b border-slate-800 pb-1"
            >
              {renderInline(headerText)}
            </h4>
          );
        }

        // Bullet point: "- " or "• " or "* "
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          const bulletText = trimmed.replace(/^[-•*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 mt-1.5 shrink-0" />
              <div className="flex-1 text-slate-200">{renderInline(bulletText)}</div>
            </div>
          );
        }

        // Numbered list: "1. ", "2. ", etc.
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[10px] shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="flex-1 text-slate-200">{renderInline(numMatch[2])}</div>
            </div>
          );
        }

        // Action prompt lines: starts with "👉"
        if (trimmed.startsWith("👉")) {
          return (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs my-1 flex items-start gap-2"
            >
              <span className="text-amber-400 text-xs shrink-0">👉</span>
              <div className="flex-1 text-slate-200 leading-normal">{renderInline(trimmed.replace(/^👉\s*/, ""))}</div>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-slate-200">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export function VoiceNavAssistant() {
  const [enabled, setEnabled] = useState(() => isVoiceAiEnabled());
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [audioWaveLevel, setAudioWaveLevel] = useState<number[]>([12, 20, 35, 18, 28, 14, 22]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const transcriptRef = useRef<string>("");
  const isListeningRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);

  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Dừng phát âm thanh ngay lập tức
  const stopSpeaking = useCallback(() => {
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.currentTime = 0;
      } catch {}
      ttsAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

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

  // Đọc câu nói bằng giọng nói tiếng Việt tự nhiên chuẩn người thật (Natural Human Voice TTS)
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (isMuted || typeof window === "undefined") {
        if (onEnd) onEnd();
        return;
      }

      stopSpeaking();

      // Xóa bỏ toàn bộ ký tự markdown, emoji, URL, dấu ngoặc kỹ thuật
      const clean = text
        .replace(/[*_#`~]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/👉|🚀|📍|👋|✨|💬|🤖|💎|👑|🔥|✅|⭐|🎉|📌|🏆|☕|🍽️|🍱|🤝|👤|🔔|💳|🎟️|🎫|📇|👥|💼|🗳️|🏛️/g, "")
        .replace(/[()[\]{}]/g, " ")
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .trim();

      if (!clean) {
        if (onEnd) onEnd();
        return;
      }

      // Chia câu thành các đoạn ngắn <= 160 ký tự để giọng đọc tự nhiên, mượt mà và không bị ngắt quãng
      const chunks: string[] = [];
      const rawSentences = clean.split(/(?<=[.!?;\n])\s+/);
      let currentChunk = "";
      for (const s of rawSentences) {
        if ((currentChunk + " " + s).trim().length <= 160) {
          currentChunk = (currentChunk + " " + s).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          if (s.length <= 160) {
            currentChunk = s;
          } else {
            const words = s.split(" ");
            let sub = "";
            for (const w of words) {
              if ((sub + " " + w).length <= 160) {
                sub = (sub + " " + w).trim();
              } else {
                if (sub) chunks.push(sub);
                sub = w;
              }
            }
            if (sub) currentChunk = sub;
          }
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      let chunkIdx = 0;
      const playNextChunk = () => {
        if (chunkIdx >= chunks.length) {
          if (onEnd) onEnd();
          return;
        }
        const textToPlay = chunks[chunkIdx++];

        // Ưu tiên dòng âm thanh Tiếng Việt tự nhiên chuẩn Google Assistant
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToPlay)}&tl=vi&client=tw-ob`;
        const audio = new Audio(googleUrl);
        ttsAudioRef.current = audio;

        audio.onended = () => {
          playNextChunk();
        };

        const fallbackToSpeechSynthesis = () => {
          if ("speechSynthesis" in window) {
            try {
              const utterance = new SpeechSynthesisUtterance(textToPlay);
              utterance.lang = "vi-VN";
              utterance.rate = 1.0;
              const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
              const viVoice = voices.find(
                (v) =>
                  v.lang.toLowerCase().includes("vi") ||
                  v.name.toLowerCase().includes("vietnamese") ||
                  v.name.toLowerCase().includes("tiếng việt"),
              );
              if (viVoice) utterance.voice = viVoice;
              utterance.onend = () => playNextChunk();
              utterance.onerror = () => playNextChunk();
              window.speechSynthesis.speak(utterance);
            } catch {
              playNextChunk();
            }
          } else {
            playNextChunk();
          }
        };

        audio.onerror = fallbackToSpeechSynthesis;
        audio.play().catch(fallbackToSpeechSynthesis);
      };

      playNextChunk();
    },
    [isMuted, stopSpeaking],
  );

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

  // Mục tiêu Điều hướng Giọng nói Trực tiếp (Direct Voice Auto-Navigation Targets)
  const VOICE_NAV_TARGETS: Array<{
    keywords: string[];
    route: string;
    featureName: string;
    speechText: string;
    tourId?: string;
  }> = [
    {
      keywords: ["danh bạ", "hội viên", "tìm hội viên", "thành viên", "mở danh bạ", "vào danh bạ"],
      route: "/association/members",
      featureName: "Danh Bạ Hội Viên",
      speechText: "Dạ em chuyển sang Danh bạ hội viên ngay đây ạ!",
      tourId: "association-members",
    },
    {
      keywords: ["sự kiện", "lịch sự kiện", "mở sự kiện", "vào sự kiện", "đăng ký sự kiện", "event"],
      route: "/association/events",
      featureName: "Lịch Sự Kiện",
      speechText: "Dạ em chuyển sang Lịch sự kiện ngay đây ạ!",
      tourId: "association-events",
    },
    {
      keywords: ["chợ", "sản phẩm", "sàn sản phẩm", "gian hàng", "mở chợ", "vào chợ", "chợ b2b"],
      route: "/association/products",
      featureName: "Sàn Giao Thương B2B",
      speechText: "Dạ em mở Sàn giao thương B2B ngay đây ạ!",
      tourId: "association-products",
    },
    {
      keywords: ["cơ hội", "giao thương", "kết nối b2b", "tìm đối tác", "mở cơ hội", "vào cơ hội"],
      route: "/association/opportunities",
      featureName: "Cơ Hội Giao Thương B2B",
      speechText: "Dạ em chuyển sang Cơ hội giao thương ngay đây ạ!",
    },
    {
      keywords: ["hội phí", "niên liễm", "đóng phí", "nợ phí", "hóa đơn", "đóng hội phí"],
      route: "/association/profile",
      featureName: "Hồ Sơ & Hội Phí",
      speechText: "Dạ em mở mục Hội phí cho Quý Anh/Chị ngay đây ạ!",
    },
    {
      keywords: ["vé", "checkin", "check-in", "mã vé", "quét qr", "mở vé", "vé của tôi"],
      route: "/association/checkin",
      featureName: "Vé Check-in QR",
      speechText: "Dạ em mở Vé Check-in QR ngay đây ạ!",
      tourId: "association-checkin",
    },
    {
      keywords: ["thẻ", "nfc", "danh thiếp", "card visit", "mở thẻ", "thẻ hội viên"],
      route: "/association/card",
      featureName: "Thẻ Hội Viên & NFC",
      speechText: "Dạ em mở Thẻ hội viên và Danh thiếp số NFC ngay đây ạ!",
      tourId: "association-card",
    },
    {
      keywords: ["thông báo", "mở thông báo", "xem thông báo"],
      route: "/association/notifications",
      featureName: "Trung Tâm Thông Báo",
      speechText: "Dạ em mở Trung tâm thông báo ngay đây ạ!",
      tourId: "association-notifications",
    },
    {
      keywords: ["tin nhắn", "hộp thư", "chat", "nhắn tin", "mở tin nhắn"],
      route: "/association/messages",
      featureName: "Tin Nhắn Kết Nối",
      speechText: "Dạ em chuyển sang Tin nhắn kết nối ngay đây ạ!",
    },
    {
      keywords: ["trang chủ", "về trang chủ", "quay về", "home"],
      route: "/association",
      featureName: "Trang Chủ",
      speechText: "Dạ em quay về Trang chủ ngay đây ạ!",
    },
    {
      keywords: ["bầu cử", "biểu quyết", "bình chọn", "bỏ phiếu"],
      route: "/association/voting",
      featureName: "Bầu Cử & Biểu Quyết",
      speechText: "Dạ em chuyển sang mục Bầu cử ngay đây ạ!",
    },
  ];

  // Bộ Não Phân Loại Lệnh Tức Thì: Chỉ xử lý Lệnh Điều Hướng hoặc Chào Hỏi.
  // Mọi câu hỏi tra cứu dữ liệu, thành viên, sản phẩm, sự kiện, điều lệ ĐƯỢC CHUYỂN TOÀN BỘ VỀ BACKEND DYNAMIC RAG.
  const resolveInstantLocalResponse = useCallback(
    (query: string): {
      answer: string;
      speechText: string;
      intent: "chat" | "query_data" | "start_tour" | "feature_guide" | "navigate";
      tourId?: string;
      route?: string;
      featureName?: string;
      suggestTour?: boolean;
    } | null => {
      const q = query.toLowerCase().trim();
      const memberName = user?.name || "Quý Anh/Chị";

      // Kiểm tra nếu là câu hỏi tra cứu (có từ để hỏi) -> Để backend xử lý dữ liệu động
      const isQuestion = /nào|ai\b|gì\b|bao nhiêu|ở đâu|khi nào|thế nào|sao\b|chưa|\?/.test(q);

      // 1. Nhận diện Lệnh Điều Hướng Giọng Nói Tự Động (Auto Voice Navigation)
      if (!isQuestion) {
        for (const target of VOICE_NAV_TARGETS) {
          const isMatch = target.keywords.some((kw) => {
            if (q === kw) return true;
            if (
              q.startsWith("mở " + kw) ||
              q.startsWith("vào " + kw) ||
              q.startsWith("chuyển sang " + kw) ||
              q.startsWith("đi tới " + kw) ||
              q.startsWith("bật " + kw)
            ) {
              return true;
            }
            if (q.endsWith(" đi") && q.includes(kw)) return true;
            return false;
          });

          if (isMatch) {
            return {
              answer: `🚀 **Đang tự động chuyển sang ${target.featureName}...**`,
              speechText: target.speechText,
              intent: "navigate",
              route: target.route,
              featureName: target.featureName,
              tourId: target.tourId,
            };
          }
        }
      }

      // 2. Chào hỏi thân tình, xưng hô tôn trọng
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
        q.includes("bạn ơi")
      ) {
        return {
          answer: `👋 **Dạ em kính chào ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành** của **CLB Doanh Nhân CEO 1983**.\nQuý Anh/Chị có thể ra lệnh giọng nói để mở màn hình (*'Mở danh bạ'*, *'Vào sự kiện'*...) hoặc hỏi em bất kỳ thông tin nào về hội viên, sự kiện, chợ B2B, hội phí và tài liệu ạ!`,
          speechText: `Dạ em kính chào Quý Anh/Chị ${memberName}! Em có thể điều hướng giọng nói và tra cứu mọi dữ liệu hiệp hội cho Quý Anh/Chị ạ.`,
          intent: "chat",
        };
      }

      // 3. Lời cảm ơn, khích lệ
      if (
        q.includes("cảm ơn") ||
        q.includes("thank") ||
        q.includes("em giỏi") ||
        q.includes("tuyệt vời") ||
        q.includes("thông minh")
      ) {
        return {
          answer: `💐 **Dạ em xin cảm ơn ${memberName} rất nhiều ạ!**\nEm luôn sẵn sàng hỗ trợ Quý Anh/Chị bất kỳ lúc nào để cùng gắn kết và phát triển doanh nghiệp!`,
          speechText: `Dạ em cảm ơn Quý Anh/Chị rất nhiều ạ! Chúc Quý Anh/Chị luôn tràn đầy năng lượng và thành công!`,
          intent: "chat",
        };
      }

      // 4. Giới thiệu vai trò & năng lực
      if (
        q.includes("bạn là ai") ||
        q.includes("em là ai") ||
        q.includes("tên là gì") ||
        q.includes("giúp được gì")
      ) {
        return {
          answer: `🤖 **Trợ lý AI Điều Hành CEO 1983:**\n- 🎙️ **Điều khiển giọng nói tự động:** 'Mở danh bạ', 'Vào sự kiện', 'Chợ B2B', 'Hội phí', 'Vé check-in'.\n- 🔍 **Tra cứu động thông minh:** Tìm kiếm hội viên theo ngành nghề, sự kiện sắp tới, đối tác B2B, tài liệu.\n- 🧭 **Chỉ dẫn trực tiếp Live GPS:** Hướng dẫn thao tác từng bước trực tiếp trên màn hình.`,
          speechText: `Em là Trợ lý AI của CEO 1983. Em có thể điều khiển ứng dụng bằng giọng nói và tra cứu dữ liệu hiệp hội cho Quý Anh/Chị ạ.`,
          intent: "chat",
        };
      }

      // Còn lại tất cả các câu hỏi dữ liệu -> Chuyển về backend tra cứu cơ sở dữ liệu động
      return null;
    },
    [user],
  );

  // Gửi câu hỏi tới Trợ lý AI (Instant Local Engine + Backend Smart Conversational Engine)
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

      // ── BƯỚC 1: XỬ LÝ PHẢN HỒI TỨC THÌ (NAVIGATE HOẶC GIAO TIẾP NHANH) ──
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

        setStatusMessage(null);
        speakText(instantRes.speechText);

        // TỰ ĐỘNG CHUYỂN TRANG NẾU LÀ LỆNH ĐIỀU HƯỚNG GIỌNG NÓI (AUTO VOICE NAVIGATION)
        if (instantRes.intent === "navigate" && instantRes.route) {
          const targetRoute = instantRes.route;
          const targetTour = instantRes.tourId;
          setTimeout(() => {
            setIsOpen(false);
            void navigate({ to: targetRoute as any });
            if (targetTour) {
              setTimeout(() => startTourGlobally(targetTour), 400);
            }
          }, 1000);
        }
        return;
      }

      // ── BƯỚC 2: GỬI LÊN BACKEND (DYNAMIC RAG SEARCH TRÊN TOÀN BỘ CƠ SỞ DỮ LIỆU HIỆP HỘI) ──
      setIsLoadingAi(true);
      setStatusMessage("Trợ lý AI đang tra cứu dữ liệu liên quan...");
      setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);

      try {
        const res = await fetchNestApi<{
          ok: boolean;
          data: {
            answer: string;
            speechText: string;
            intent: "chat" | "query_data" | "start_tour" | "feature_guide" | "navigate";
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
          speakText(aiData.speechText);

          // NẾU BACKEND TRẢ VỀ LỆNH ĐIỀU HƯỚNG TỰ ĐỘNG
          if (aiData.intent === "navigate" && aiData.route) {
            const targetRoute = aiData.route;
            const targetTour = aiData.tourId;
            setTimeout(() => {
              setIsOpen(false);
              void navigate({ to: targetRoute as any });
              if (targetTour) {
                setTimeout(() => startTourGlobally(targetTour), 400);
              }
            }, 1200);
          } else if (aiData.intent === "start_tour" && aiData.tourId) {
            handleStartDirectTour(aiData.tourId, aiData.route, aiData.featureName);
          } else if (aiData.suggestTour && aiData.tourId) {
            setPendingTour({
              tourId: aiData.tourId,
              route: aiData.route,
              featureName: aiData.featureName || "Chức năng",
            });
          } else {
            setPendingTour(null);
          }
        }
      } catch (err: any) {
        console.warn("[VoiceNavAssistant] AI ask error:", err);
        const memberName = user?.name || "Quý Anh/Chị";
        const fallbacks = [
          `Dạ em đã ghi nhận câu hỏi của ${memberName}. Hiện tại kết nối dữ liệu đang bận, Quý Anh/Chị có thể dùng các phím tắt nhanh bên dưới để xem Danh bạ, Sự kiện hoặc Hội phí nhé ạ!`,
          `Dạ hệ thống máy chủ dữ liệu phản hồi hơi chậm, em chưa tải kịp đầy đủ chi tiết cho ${memberName}. Anh/Chị có thể nói lệnh 'Mở danh bạ' hoặc 'Vào sự kiện' để em dẫn đường ngay ạ!`,
          `Dạ em chưa thể tra cứu ngay lúc này thưa ${memberName}. Quý Anh/Chị vui lòng thử lại sau vài giây hoặc chạm vào các gợi ý bên dưới ạ!`,
        ];
        const fallbackText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackText, speechText: fallbackText },
        ]);
        speakText(fallbackText);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [handleStartDirectTour, navigate, pendingTour, resolveInstantLocalResponse, speakText, user],
  );

  // ── DỌN DẸP AUDIO & MIC KHI DỪNG THU ÂM ──
  const cleanupAudio = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    setIsListening(false);
    isListeningRef.current = false;
    setRecordingSeconds(0);
  }, []);

  // Khởi tạo SpeechRecognition native nếu trình duyệt hỗ trợ
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
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }

        if (fullTranscript.trim()) {
          setTranscript(fullTranscript);
          transcriptRef.current = fullTranscript;

          // Bộ đếm im lặng 1.5s: Nếu người dùng ngừng nói thì tự động gửi cho AI
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim() && isListeningRef.current) {
              const textToSend = transcriptRef.current.trim();
              cleanupAudio();
              transcriptRef.current = "";
              setTranscript("");
              void submitPrompt(textToSend);
            }
          }, 1500);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        if (event.error === "not-allowed") {
          setStatusMessage("Vui lòng cấp quyền Microphone để ra lệnh giọng nói.");
          toast.error("Trình duyệt chưa được cấp quyền micro.");
        }
      };

      recognition.onend = () => {
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
      cleanupAudio();
    };
  }, [cleanupAudio, submitPrompt]);

  // ── KHỞI CHẠY THU ÂM (ĐA TẦNG: WEB SPEECH API + MEDIA RECORDER VISUALIZER) ──
  const startListening = async () => {
    // Tự động dừng TTS nếu đang đọc để không bị micro thu lại giọng AI
    // Tự động dừng phát âm thanh nếu đang đọc để không bị micro thu lại giọng AI
    stopSpeaking();

    setStatusMessage("Đang khởi động Microphone...");
    setIsListening(true);
    isListeningRef.current = true;
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // Bộ đếm giây thu âm
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    let stream: MediaStream | null = null;
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }
    } catch (micErr) {
      console.warn("Lỗi yêu cầu quyền micro:", micErr);
      setStatusMessage("Không thể truy cập Microphone. Vui lòng cấp quyền.");
      toast.error("Không thể truy cập Microphone trên thiết bị.");
      cleanupAudio();
      return;
    }

    // Thiết lập AudioContext để vẽ sóng âm (Waveform Visualizer)
    if (stream && typeof window !== "undefined") {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const updateWaveform = () => {
            if (!isListeningRef.current) return;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            // Lấy 7 điểm tần số để tạo sóng âm 7 vạch
            const levels = [
              Math.max(10, Math.min(45, (dataArray[2] || 0) / 3)),
              Math.max(12, Math.min(55, (dataArray[5] || 0) / 2.5)),
              Math.max(15, Math.min(65, (dataArray[8] || 0) / 2)),
              Math.max(10, Math.min(50, (dataArray[12] || 0) / 2.8)),
              Math.max(14, Math.min(60, (dataArray[16] || 0) / 2.2)),
              Math.max(10, Math.min(45, (dataArray[20] || 0) / 3)),
              Math.max(12, Math.min(40, (dataArray[24] || 0) / 3.5)),
            ];
            setAudioWaveLevel(levels);
            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          animFrameRef.current = requestAnimationFrame(updateWaveform);
        }
      } catch (e) {
        console.warn("[AudioContext] Visualizer init skipped:", e);
      }
    }

    // Khởi động MediaRecorder song song để thu âm dự phòng và cấp dữ liệu visualizer
    if (stream && typeof MediaRecorder !== "undefined") {
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          if (!transcriptRef.current.trim() && audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: recorder.mimeType || "audio/webm",
            });
            audioChunksRef.current = [];

            // Chuyển audio thành base64 để gửi lên backend
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = (reader.result as string)?.split(",")?.[1];
              if (base64Data) {
                setIsLoadingAi(true);
                setStatusMessage("Đang phân tích giọng nói của Quý Anh/Chị...");
                try {
                  const res = await fetchNestApi<{
                    ok: boolean;
                    data: {
                      userSpeech: string;
                      answer: string;
                      speechText: string;
                      intent?: string;
                      tourId?: string;
                      route?: string;
                      featureName?: string;
                      suggestTour?: boolean;
                    };
                  }>("/ai/ask-voice", {
                    method: "POST",
                    body: JSON.stringify({
                      audioBase64: base64Data,
                      mimeType: audioBlob.type,
                    }),
                  });

                  if (res?.data) {
                    const aiData = res.data;
                    setChatHistory((prev) => [
                      ...prev,
                      { role: "user", text: aiData.userSpeech || "Giọng nói hội viên" },
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
                    speakText(aiData.speechText);

                    if (aiData.suggestTour && aiData.tourId) {
                      setPendingTour({
                        tourId: aiData.tourId,
                        route: aiData.route,
                        featureName: aiData.featureName || "Chức năng",
                      });
                    }
                  }
                } catch (voiceErr) {
                  console.warn("[ask-voice] Failed:", voiceErr);
                  toast.info("Đã ghi âm giọng nói. Bạn có thể gõ câu hỏi để được hỗ trợ tốt nhất!");
                } finally {
                  setIsLoadingAi(false);
                }
              }
            };
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn("[MediaRecorder] Start error:", recErr);
      }
    }

    // Tầng 1: Sử dụng Web Speech API nếu có sẵn
    if (recognitionRef.current) {
      try {
        transcriptRef.current = "";
        setTranscript("");
        recognitionRef.current.abort();
      } catch {}

      try {
        recognitionRef.current.start();
        setStatusMessage("Đang lắng nghe Quý Anh/Chị nói... Hãy nói câu hỏi!");
        return;
      } catch (e) {
        console.warn("[SpeechRecognition] Start failed, fallback to MediaRecorder:", e);
      }
    }

    setStatusMessage("Đang thu âm giọng nói... Bấm mic khi nói xong!");
  };

  const stopListening = () => {
    const textToSend = transcriptRef.current.trim();
    cleanupAudio();

    if (textToSend) {
      transcriptRef.current = "";
      setTranscript("");
      void submitPrompt(textToSend);
    }
  };

  const handleOpenAssistant = () => {
    setIsOpen(true);
    if (chatHistory.length === 0) {
      const memberName = user?.name || "Quý Anh/Chị";
      const greeting = `👋 **Dạ em kính chào Quý Anh/Chị ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành** của **CLB Doanh Nhân CEO 1983**.\nQuý Anh/Chị có thể ra lệnh giọng nói (*"Mở danh bạ"*, *"Vào sự kiện"*, *"Chợ B2B"*, *"Hội phí"*...) hoặc hỏi bất kỳ thông tin nào về hiệp hội ạ!`;
      const speech = `Dạ em kính chào Quý Anh/Chị ${memberName}! Em có thể điều khiển ứng dụng bằng giọng nói và tra cứu dữ liệu cho Quý Anh/Chị ạ.`;
      setChatHistory([
        {
          role: "assistant",
          text: greeting,
          speechText: speech,
        },
      ]);
      speakText(speech);
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

      {/* ── 2. NÚT TRỢ LÝ AI NỔI GỌN GÀNG EXECUTIVE Ở GÓC MÀN HÌNH ── */}
      <div
        className="fixed bottom-24 right-3 sm:bottom-28 sm:right-5 z-50 flex flex-col items-end pointer-events-auto select-none"
        style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))" }}
      >
        <div className="relative group">
          {/* Nút đóng / ẩn Trợ lý */}
          <button
            type="button"
            onClick={handleDismissRobot}
            title="Đóng trợ lý AI (Có thể bật lại ở Tab Cá nhân)"
            aria-label="Đóng trợ lý AI"
            className="absolute -top-1 -left-1 z-20 grid h-4 w-4 place-items-center rounded-full bg-slate-900 text-slate-400 border border-slate-700 shadow hover:text-white hover:bg-rose-600 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
          >
            <X className="h-2.5 w-2.5" />
          </button>

          {/* Cụm Nút Trợ Lý AI Minimalist Executive */}
          <button
            type="button"
            onClick={handleOpenAssistant}
            title="Chạm để mở Trợ lý AI Giọng nói & Điều hướng"
            aria-label="Mở Trợ lý AI Giọng nói"
            className="relative flex items-center justify-center h-12 w-12 sm:h-13 sm:w-13 rounded-full bg-slate-900 border border-slate-700/80 hover:border-amber-400/80 text-slate-100 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="h-5 w-5 text-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          </button>
        </div>
      </div>

      {/* ── 3. MODAL HỎI ĐÁP & CHỈ DẪN GIỌNG NÓI EXECUTIVE AI CHUẨN CEO 1983 ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 animate-in slide-in-from-bottom-4 duration-250"
            role="dialog"
            aria-modal="true"
          >
            {/* Header: Title, Live Status, Mute & Close */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 border border-slate-700 text-amber-400 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      Trợ lý Điều hành AI
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Sẵn sàng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    CLB CEO 1983 • Điều khiển giọng nói & tra cứu
                  </p>
                </div>
              </div>

              {/* Action Buttons: Toggle Loa & Đóng */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Bật âm thanh giọng nói" : "Tắt âm thanh giọng nói"}
                  className={`grid h-8 w-8 place-items-center rounded-lg transition cursor-pointer ${
                    isMuted
                      ? "bg-slate-800/60 text-slate-400 hover:text-white"
                      : "bg-slate-800 text-amber-400 border border-slate-700"
                  }`}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    cleanupAudio();
                    setIsOpen(false);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Dải thông tin phiên đăng nhập động (Live Context Bar) */}
            {liveContext && (
              <div className="px-3.5 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-300 font-medium">{liveContext.user?.name || "Hội viên"}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400/90">{liveContext.user?.level || "Chính thức"}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span>Hội phí:</span>
                  {liveContext.dues?.feePaid ? (
                    <span className="text-emerald-400 font-medium">Đã hoàn thành</span>
                  ) : (
                    <span className="text-amber-400/90 font-medium">
                      Nợ {new Intl.NumberFormat("vi-VN").format(liveContext.dues?.totalOutstanding || 0)}đ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span>Thông báo:</span>
                  <span className="text-slate-200 font-medium">{liveContext.notifications?.unreadCount || 0}</span>
                </div>
              </div>
            )}

            {/* Khung Chat Hội Thoại */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 min-h-[190px] max-h-[350px]">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 shadow-sm ${
                      msg.role === "user"
                        ? "bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tr-none text-xs sm:text-[13px]"
                        : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none text-xs sm:text-[13px]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-line text-slate-100 font-medium">{msg.text}</div>
                    ) : (
                      <FormattedAiText text={msg.text} />
                    )}

                    {/* Hộp thoại gợi ý chỉ dẫn thao tác trực tiếp nếu có */}
                    {msg.tourId && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-medium text-xs">
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chỉ dẫn trực tiếp trên màn hình</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          Bạn có muốn em lái màn hình và chỉ dẫn thao tác trực tiếp từng bước không ạ?
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleStartDirectTour(msg.tourId!, msg.route, msg.featureName)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>👉 Có, chỉ dẫn ngay</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingTour(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
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
                <div className="flex items-center gap-2 text-xs text-slate-400 py-1 bg-slate-900 px-3 rounded-lg border border-slate-800 w-fit">
                  <div className="h-3 w-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Trợ lý AI đang tra cứu dữ liệu...</span>
                </div>
              )}
            </div>

            {/* Quick Action Chips Gợi Ý */}
            <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/30">
              <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400/80" />
                  <span>Lệnh giọng nói & tra cứu nhanh:</span>
                </span>
                <span className="text-slate-500 text-[10px]">Chạm để thử</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {QUICK_PROMPTS.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickPromptClick(qp)}
                      className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{qp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Audio Visualizer Bar khi đang lắng nghe */}
            {isListening && (
              <div className="px-3.5 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    Đang nghe ({recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)...
                  </span>
                </div>

                {/* Sóng âm thanh 7 vạch thanh lịch */}
                <div className="flex items-center gap-1 h-5">
                  {audioWaveLevel.map((height, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-amber-400/80 transition-all duration-75"
                      style={{ height: `${Math.max(4, height * 0.45)}px` }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={stopListening}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <Square className="w-3 h-3 fill-current text-rose-400" />
                  <span>Dừng & Gửi</span>
                </button>
              </div>
            )}

            {/* Voice Input & Text Input Bar */}
            <div className="p-3 sm:p-3.5 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
              {statusMessage && !isListening && (
                <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Nút Micro Thu Âm Giọng Nói */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`grid h-11 w-11 place-items-center rounded-xl transition-all shrink-0 cursor-pointer ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                  }`}
                  title={isListening ? "Dừng ghi âm và gửi" : "Bấm để nói bằng giọng nói"}
                >
                  {isListening ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <Mic className="h-5 w-5 fill-current" />
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
                        ? "Đang lắng nghe... Hãy nói câu hỏi hoặc lệnh"
                        : "Nói hoặc gõ: 'Mở danh bạ', 'Sự kiện sắp tới'..."
                    }
                    className="w-full h-11 rounded-xl bg-slate-900 border border-slate-800 px-3.5 pr-10 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
                  />

                  {/* Nút Gửi */}
                  <button
                    type="button"
                    onClick={() => void submitPrompt(inputText || transcript)}
                    disabled={!inputText.trim() && !transcript.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-bold transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Chú thích thông minh */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Ra lệnh bằng giọng nói: "Mở danh bạ", "Vào sự kiện", "Chợ B2B", "Hội phí"...</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
