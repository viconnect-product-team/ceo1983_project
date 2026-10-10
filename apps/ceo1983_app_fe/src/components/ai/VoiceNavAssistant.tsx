import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  X,
  Sparkles,
  Calendar,
  Handshake,
  Users,
  CreditCard,
  Compass,
  ChevronRight,
  Volume2,
  VolumeX,
  Square,
  Radio,
  MessageSquare,
  ArrowUp,
  History,
  Plus,
  Trash2,
  Clock,
  PhoneCall,
  Search,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";
import { useTheme } from "@/lib/theme";
import { startTourGlobally } from "@/lib/tours/voice-gps-controller";
import { VoiceGpsHudOverlay } from "./VoiceGpsHudOverlay";

export const VOICE_AI_STORAGE_KEY = "ceo1983_voice_ai_enabled";
export const VOICE_AI_EVENT_NAME = "ceo1983-voice-ai-toggle";
const SESSIONS_STORAGE_KEY = "ceo1983_ai_chat_sessions_v3";
const ACTIVE_SESSION_STORAGE_KEY = "ceo1983_ai_active_session_id_v3";
export const AI_CHARACTER_IMAGE = "/ai-assistant-character.png";

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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  speechText?: string;
  createdAt: number;
  intent?: string;
  tourId?: string;
  route?: string;
  featureName?: string;
  actionType?: string;
  suggestTour?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
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
    label: "Danh bạ CEO",
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
    label: "Hội phí",
    query: "Tôi có hội phí nào chưa đóng không?",
    icon: CreditCard,
    route: "/association/profile",
  },
  {
    label: "Hotline Thư ký",
    query: "Gọi điện hotline ban thư ký",
    icon: PhoneCall,
  },
];

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

/**
 * Bộ Render Văn Bản Markdown Sang Trọng Chuẩn Nhận Diện CEO 1983 (Light & Dark)
 */
function FormattedAiText({ text }: { text: string }) {
  const lines = text.split("\n");

  const renderInline = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-[#003B95] dark:text-blue-300 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="text-[#526074] dark:text-slate-400 italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#003B95] dark:text-amber-300 font-mono text-[11px] font-medium border border-slate-200 dark:border-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-[#192638] dark:text-slate-200 font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header style with icon or ###
        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4
              key={idx}
              className="text-xs sm:text-[13px] font-bold text-[#003B95] dark:text-blue-300 pt-1 border-b border-[#E2E8F0] dark:border-slate-800 pb-1"
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
              <span className="h-1.5 w-1.5 rounded-full bg-[#265BFF] dark:bg-amber-400 mt-1.5 shrink-0" />
              <div className="flex-1 text-[#192638] dark:text-slate-200">
                {renderInline(bulletText)}
              </div>
            </div>
          );
        }

        // Numbered list: "1. ", "2. ", etc.
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#EDF3FF] dark:bg-slate-800 border border-[#D5E3FC] dark:border-slate-700 text-[#003B95] dark:text-slate-300 font-bold text-[10px] shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="flex-1 text-[#192638] dark:text-slate-200">
                {renderInline(numMatch[2])}
              </div>
            </div>
          );
        }

        // Action prompt lines: starts with "👉"
        if (trimmed.startsWith("👉")) {
          return (
            <div
              key={idx}
              className="p-2 rounded-xl bg-[#F7FAFF] dark:bg-slate-900 border border-[#DCE6F5] dark:border-slate-800 text-[#192638] dark:text-slate-300 text-xs my-1 flex items-start gap-2"
            >
              <span className="text-amber-500 text-xs shrink-0">👉</span>
              <div className="flex-1 text-[#192638] dark:text-slate-200 leading-normal">
                {renderInline(trimmed.replace(/^👉\s*/, ""))}
              </div>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-[#192638] dark:text-slate-200">
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

  // Dual View & Voice Highlights
  const [viewMode, setViewMode] = useState<"chat" | "voice">("chat");
  const [activeActionNotice, setActiveActionNotice] = useState<string | null>(null);
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const { toggle: toggleTheme } = useTheme();

  // ── Conversation Sessions Management (Khởi tạo lazy an toàn, triệt tiêu setState khi chưa mount) ──
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[VoiceNavAssistant] Failed to parse sessions:", e);
    }

    const defaultSessionId = `session_${Date.now()}`;
    const defaultSession: ChatSession = {
      id: defaultSessionId,
      title: "Cuộc trò chuyện mới",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg_greet_${Date.now()}`,
          role: "assistant",
          text: `👋 **Dạ em kính chào Quý Anh/Chị!**\n\nEm là **Trợ lý AI Điều Hành** của **CLB Doanh Nhân CEO 1983**.\nQuý Anh/Chị có thể ra lệnh giọng nói (*"Mở danh bạ"*, *"Vào sự kiện"*, *"Chợ B2B"*, *"Hội phí"*...) hoặc hỏi bất kỳ điều gì về kinh doanh, nhân sự, dòng tiền và hiệp hội ạ!`,
          speechText: `Dạ em kính chào Quý Anh/Chị! Em có thể điều khiển ứng dụng bằng giọng nói và giải đáp mọi câu hỏi cho Quý Anh/Chị ạ.`,
          createdAt: Date.now(),
        },
      ],
    };

    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([defaultSession]));
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, defaultSessionId);
    } catch {
      /* ignore */
    }

    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.find((s) => s.id === storedActiveId) || parsed[0];
          return active.id;
        }
      }
    } catch {
      /* ignore */
    }
    return "";
  });

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");

  // Dynamic Live Member Context & Tours
  const [liveContext, setLiveContext] = useState<any | null>(null);
  const [pendingTour, setPendingTour] = useState<{
    tourId: string;
    route?: string;
    featureName?: string;
  } | null>(null);

  const { user, status } = useAuth();
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const transcriptRef = useRef<string>("");
  const isListeningRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(false);

  // Strict submission lock: prevents parallel or double calls
  const isSubmittingRef = useRef<boolean>(false);

  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Dừng phát âm thanh ngay lập tức (Single Channel Guard)
  const stopSpeaking = useCallback(() => {
    if (isMountedRef.current) {
      setIsSpeaking(false);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Tạo tin nhắn chào mừng chuẩn CEO 1983
  const createGreetingMessage = useCallback((): ChatMessage => {
    const memberName = user?.name || "Quý Anh/Chị";
    return {
      id: `msg_greet_${Date.now()}`,
      role: "assistant",
      text: `👋 **Dạ em kính chào Quý Anh/Chị ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành** của **CLB Doanh Nhân CEO 1983**.\nQuý Anh/Chị có thể ra lệnh giọng nói (*"Mở danh bạ"*, *"Vào sự kiện"*, *"Chợ B2B"*, *"Hội phí"*...) hoặc hỏi bất kỳ điều gì về kinh doanh, nhân sự, dòng tiền và hiệp hội ạ!`,
      speechText: `Dạ em kính chào Quý Anh/Chị ${memberName}! Em có thể điều khiển ứng dụng bằng giọng nói và giải đáp mọi câu hỏi cho Quý Anh/Chị ạ.`,
      createdAt: Date.now(),
    };
  }, [user]);

  // Lấy danh sách tin nhắn của phiên đang hoạt động
  const currentSession =
    sessions.find((s) => s.id === (activeSessionId || sessions[0]?.id)) || sessions[0];
  const chatHistory = currentSession ? currentSession.messages : [];

  // Lưu sessions vào localStorage mỗi khi có cập nhật
  const saveSessionsToStorage = (updatedSessions: ChatSession[], newActiveId?: string) => {
    setSessions(updatedSessions);
    if (newActiveId) {
      setActiveSessionId(newActiveId);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
        if (newActiveId) {
          localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, newActiveId);
        }
      } catch (err) {
        console.warn("[VoiceNavAssistant] Error saving sessions:", err);
      }
    }
  };

  // Tạo cuộc hội thoại mới (New Chat)
  const handleNewChat = useCallback(() => {
    stopSpeaking();
    const newSessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Cuộc trò chuyện mới",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [createGreetingMessage()],
    };

    const updated = [newSession, ...sessions];
    saveSessionsToStorage(updated, newSessionId);
    setInputText("");
    setTranscript("");
    transcriptRef.current = "";
    setIsHistoryDrawerOpen(false);
    toast.success("Đã tạo cuộc trò chuyện mới");
  }, [createGreetingMessage, sessions, stopSpeaking]);

  // Chuyển sang phiên hội thoại khác
  const handleSelectSession = (sessionId: string) => {
    stopSpeaking();
    setActiveSessionId(sessionId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId);
      } catch {
        /* ignore */
      }
    }
    setIsHistoryDrawerOpen(false);
  };

  // Xóa một phiên hội thoại
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    if (filtered.length === 0) {
      const fallbackSessionId = `session_${Date.now()}`;
      const fallbackSession: ChatSession = {
        id: fallbackSessionId,
        title: "Cuộc trò chuyện mới",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [createGreetingMessage()],
      };
      saveSessionsToStorage([fallbackSession], fallbackSessionId);
    } else {
      const nextActiveId = activeSessionId === sessionId ? filtered[0].id : activeSessionId;
      saveSessionsToStorage(filtered, nextActiveId);
    }
    toast.success("Đã xóa cuộc hội thoại");
  };

  // Xóa toàn bộ lịch sử
  const handleClearAllHistory = () => {
    const freshSessionId = `session_${Date.now()}`;
    const freshSession: ChatSession = {
      id: freshSessionId,
      title: "Cuộc trò chuyện mới",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [createGreetingMessage()],
    };
    saveSessionsToStorage([freshSession], freshSessionId);
    setIsHistoryDrawerOpen(false);
    toast.success("Đã làm mới toàn bộ lịch sử hội thoại");
  };

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
        } catch {
          /* ignore */
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Đọc câu nói bằng giọng nói tiếng Việt tự nhiên chuẩn người thật (DUY NHẤT 1 LẦN, KHÔNG DÙNG GOOGLE TTS GÂY LẶP 2 LẦN)
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onEnd) onEnd();
        return;
      }

      // Luôn dọn dẹp và dừng bất kỳ âm thanh nào đang phát trước đó
      stopSpeaking();

      // Xóa bỏ toàn bộ ký tự markdown, emoji, URL, dấu ngoặc kỹ thuật
      const clean = text
        .replace(/[*_#`~]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(
          /👉|🚀|📍|👋|✨|💬|🤖|💎|👑|🔥|✅|⭐|🎉|📌|🏆|☕|🍽️|🍱|🤝|👤|🔔|💳|🎟️|🎫|📇|👥|💼|🗳️|🏛️/g,
          "",
        )
        .replace(/[()[\]{}]/g, " ")
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .trim();

      if (!clean) {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        return;
      }

      setLastAssistantSpeech(clean);
      setIsSpeaking(true);

      try {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = "vi-VN";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices =
          voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        const viVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes("vi") ||
            v.name.toLowerCase().includes("vietnamese") ||
            v.name.toLowerCase().includes("tiếng việt"),
        );
        if (viVoice) utterance.voice = viVoice;

        utterance.onend = () => {
          if (isMountedRef.current) setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          if (isMountedRef.current) setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        // Gọi duy nhất 1 lần trực tiếp qua native SpeechSynthesis
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[VoiceNavAssistant] SpeechSynthesis error:", err);
        if (isMountedRef.current) setIsSpeaking(false);
        if (onEnd) onEnd();
      }
    },
    [isMuted, stopSpeaking],
  );

  // Dẫn đường trực tiếp từng bước (Live GPS Tour)
  const handleStartDirectTour = useCallback(
    (tourId: string, route?: string, featureName?: string) => {
      setPendingTour(null);
      const confirmSpeech = `Dạ vâng! Em sẽ dẫn đường trực tiếp cho Quý Anh/Chị đối với chức năng ${featureName || "này"} ngay bây giờ ạ.`;
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

  // Bộ Não Phân Loại Lệnh Tức Thì
  const resolveInstantLocalResponse = useCallback(
    (
      query: string,
    ): {
      answer: string;
      speechText: string;
      intent: "chat" | "query_data" | "start_tour" | "feature_guide" | "navigate" | "action";
      actionType?: "navigate" | "search" | "theme" | "call";
      tourId?: string;
      route?: string;
      featureName?: string;
      suggestTour?: boolean;
    } | null => {
      const q = query.toLowerCase().trim();
      const memberName = user?.name || "Quý Anh/Chị";

      // 0. Lệnh Thay Đổi Giao Diện (Theme switch)
      if (
        q.includes("đổi giao diện") ||
        q.includes("chế độ tối") ||
        q.includes("chế độ sáng") ||
        q.includes("dark mode") ||
        q.includes("light mode") ||
        q.includes("giao diện tối") ||
        q.includes("giao diện sáng") ||
        q.includes("màu tối") ||
        q.includes("màu sáng")
      ) {
        return {
          answer: `🌓 **Đang thực hiện chuyển đổi giao diện Sáng / Tối...**\nHệ thống đã đổi chế độ màu màn hình theo yêu cầu của Quý Anh/Chị.`,
          speechText: `Em đã chuyển đổi giao diện hệ thống cho Quý Anh/Chị rồi ạ!`,
          intent: "action",
          actionType: "theme",
          featureName: "Chuyển Đổi Giao Diện",
        };
      }

      // 0.1 Hotline Ban Thư Ký
      if (
        q.includes("gọi điện") ||
        q.includes("gọi hotline") ||
        q.includes("hotline") ||
        q.includes("số ban thư ký") ||
        q.includes("liên hệ thư ký") ||
        q.includes("gọi thư ký")
      ) {
        return {
          answer: `📞 **Đang kết nối tới Hotline Ban Thư Ký CEO 1983...**\nSố điện thoại: **0983 198 307**\nĐang mở trình quay số điện thoại cho Quý Anh/Chị.`,
          speechText: `Em đang kết nối tới hotline Ban Thư Ký cho Quý Anh/Chị ngay đây ạ!`,
          intent: "action",
          actionType: "call",
          route: "tel:0983198307",
          featureName: "Hotline Ban Thư Ký (0983 198 307)",
        };
      }

      // 0.2 Tìm kiếm hội viên cụ thể bằng tên
      const memberSearchMatch = q.match(
        /(?:tìm|kiếm|cho xem|xem|gặp)\s+(?:thông tin\s+)?(?:anh|chị|em|bác|ông|bà|ceo|bạn)?\s*([a-zA-ZÀ-ỹ0-9\s]{2,25})/i,
      );
      if (
        memberSearchMatch &&
        memberSearchMatch[1] &&
        (q.includes("anh") ||
          q.includes("chị") ||
          q.includes("hội viên") ||
          q.includes("thành viên") ||
          q.includes("ceo") ||
          q.includes("tìm sđt") ||
          q.includes("sdt"))
      ) {
        const candidate = memberSearchMatch[1].trim();
        const skipWords = [
          "danh bạ",
          "danh ba",
          "hội viên",
          "thành viên",
          "hệ thống",
          "này",
          "đi",
          "với",
        ];
        if (!skipWords.includes(candidate) && candidate.length >= 2) {
          return {
            answer: `🔍 **Đang tìm kiếm hội viên "${candidate}" trong Danh bạ...**\n\n⚡ Hệ thống đang tự động chuyển màn hình tới Danh Bạ Hội Viên.`,
            speechText: `Dạ em tìm kiếm ${candidate} và chuyển sang Danh bạ ngay đây ạ!`,
            intent: "navigate",
            actionType: "search",
            route: `/association/members?search=${encodeURIComponent(candidate)}`,
            featureName: `Danh Bạ Hội Viên (Tìm: ${candidate})`,
            tourId: "association-members",
          };
        }
      }

      // 1. Nhận diện Lệnh Điều Hướng Giọng Nói Tự Động (Auto Voice Navigation)
      for (const target of VOICE_NAV_TARGETS) {
        const isMatch = target.keywords.some((kw) => {
          if (q === kw) return true;
          if (
            q.startsWith("mở " + kw) ||
            q.startsWith("vào " + kw) ||
            q.startsWith("chuyển sang " + kw) ||
            q.startsWith("đi tới " + kw) ||
            q.startsWith("bật " + kw) ||
            q.startsWith("xem " + kw) ||
            q.startsWith("cho xem " + kw) ||
            q.startsWith("dẫn tới " + kw) ||
            q.startsWith("dẫn tôi tới " + kw) ||
            q.startsWith("cho tôi xem " + kw)
          ) {
            return true;
          }
          if (q.endsWith(" đi") && q.includes(kw)) return true;
          if (
            q.includes(kw) &&
            (q.includes("mở") || q.includes("vào") || q.includes("xem") || q.includes("chuyển"))
          )
            return true;
          return false;
        });

        if (isMatch) {
          return {
            answer: `⚡ **Đang tự động thao tác: Chuyển sang ${target.featureName}...**`,
            speechText: target.speechText,
            intent: "navigate",
            actionType: "navigate",
            route: target.route,
            featureName: target.featureName,
            tourId: target.tourId,
          };
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
          answer: `👋 **Dạ em kính chào ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành** của **CLB Doanh Nhân CEO 1983**.\nQuý Anh/Chị có thể ra lệnh giọng nói để mở màn hình (*'Mở danh bạ'*, *'Vào sự kiện'*...) hoặc hỏi em bất kỳ điều gì về kinh doanh, điều hành, đời sống và hiệp hội ạ!`,
          speechText: `Dạ em kính chào Quý Anh/Chị ${memberName}! Em có thể điều hướng giọng nói và giải đáp mọi câu hỏi cho Quý Anh/Chị ạ.`,
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
          answer: `🤖 **Trợ lý AI Điều Hành CEO 1983:**\n- 🎙️ **Điều khiển giọng nói & thao tác tự động:** 'Mở danh bạ', 'Vào sự kiện', 'Chợ B2B', 'Hội phí', 'Vé check-in', 'Đổi giao diện'.\n- 🧠 **Bộ não Universal AI:** Giải đáp chuyên sâu mọi câu hỏi về Quản trị dòng tiền, Nhân sự, OKRs, Stress CEO, Ẩm thực tiếp khách, Golf, Phong thủy 1983.\n- 🧭 **Chỉ dẫn trực tiếp Live GPS:** Hướng dẫn thao tác từng bước trực tiếp trên màn hình.`,
          speechText: `Em là Trợ lý AI của CEO 1983. Em có thể điều khiển ứng dụng bằng giọng nói và giải đáp mọi câu hỏi cho Quý Anh/Chị ạ.`,
          intent: "chat",
        };
      }

      return null;
    },
    [user],
  );

  // ── DỌN DẸP AUDIO & MIC (TRIỆT TIÊU TOÀN DIỆN MỌI VÒNG LẶP SỰ KIỆN) ──
  const cleanupAudio = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      // Hủy onend và onresult trước khi ngắt để ngăn browser gọi hàm tiếp lần 2
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }

    if (mediaRecorderRef.current) {
      // Hủy onstop để ngăn MediaRecorder tự động gửi audio lên ask-voice lần 2
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.ondataavailable = null;
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        /* ignore */
      }
      audioContextRef.current = null;
    }

    audioChunksRef.current = [];
    if (isListeningRef.current) {
      isListeningRef.current = false;
      if (isMountedRef.current) {
        setIsListening(false);
        setRecordingSeconds(0);
      }
    }
  }, []);

  // Gửi câu hỏi tới Trợ lý AI (Có khóa nguyên tử chống gửi trùng lặp & nói 2 lần)
  const submitPrompt = useCallback(
    async (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed) return;

      // KHÓA NGUYÊN TỬ: Nếu đang xử lý một prompt thì không nhận prompt trùng
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      // Dọn dẹp micro ngay lập tức trước khi phân tích và phản hồi âm thanh
      cleanupAudio();
      stopSpeaking();

      const userMsg = trimmed;
      const lower = userMsg.toLowerCase();
      setInputText("");
      setTranscript("");
      transcriptRef.current = "";

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

      const userMsgObj: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        role: "user",
        text: userMsg,
        createdAt: Date.now(),
      };

      if (isAffirmative && pendingTour) {
        const assistantMsgObj: ChatMessage = {
          id: `msg_a_${Date.now() + 1}`,
          role: "assistant",
          text: `🚀 **Dạ vâng! Em sẽ dẫn đường trực tiếp cho Quý Anh/Chị đối với "${pendingTour.featureName || "chức năng"}" ngay bây giờ ạ!**`,
          createdAt: Date.now() + 1,
        };

        const targetTour = pendingTour;
        setPendingTour(null);

        // Cập nhật session
        setSessions((prev) => {
          const updated = prev.map((s) => {
            if (s.id === activeSessionId) {
              const newMsgs = [...s.messages, userMsgObj, assistantMsgObj];
              return {
                ...s,
                updatedAt: Date.now(),
                messages: newMsgs,
              };
            }
            return s;
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
            } catch {
              /* ignore */
            }
          }
          return updated;
        });

        isSubmittingRef.current = false;
        handleStartDirectTour(targetTour.tourId, targetTour.route, targetTour.featureName);
        return;
      }

      // ── BƯỚC 1: XỬ LÝ PHẢN HỒI TỨC THÌ (NAVIGATE HOẶC GIAO TIẾP NHANH) ──
      const instantRes = resolveInstantLocalResponse(userMsg);
      if (instantRes) {
        const assistantMsgObj: ChatMessage = {
          id: `msg_a_${Date.now() + 1}`,
          role: "assistant",
          text: instantRes.answer,
          speechText: instantRes.speechText,
          intent: instantRes.intent,
          tourId: instantRes.tourId,
          route: instantRes.route,
          featureName: instantRes.featureName,
          suggestTour: instantRes.suggestTour,
          createdAt: Date.now() + 1,
        };

        // Cập nhật session & title nếu đây là câu hỏi đầu tiên
        setSessions((prev) => {
          const updated = prev.map((s) => {
            if (s.id === activeSessionId) {
              const newMsgs = [...s.messages, userMsgObj, assistantMsgObj];
              const isFirstUserMsg = !s.messages.some((m) => m.role === "user");
              const newTitle = isFirstUserMsg
                ? userMsg.slice(0, 30) + (userMsg.length > 30 ? "..." : "")
                : s.title;
              return {
                ...s,
                title: newTitle,
                updatedAt: Date.now(),
                messages: newMsgs,
              };
            }
            return s;
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
            } catch {
              /* ignore */
            }
          }
          return updated;
        });

        setStatusMessage(null);
        speakText(instantRes.speechText);

        // Thao tác tự động
        if (instantRes.intent === "action") {
          if (instantRes.actionType === "theme") {
            setActiveActionNotice("🌓 Đang chuyển đổi giao diện hệ thống...");
            toggleTheme();
            toast.success("Đã chuyển đổi giao diện");
            setTimeout(() => setActiveActionNotice(null), 2500);
          } else if (instantRes.actionType === "call" && instantRes.route) {
            setActiveActionNotice(`📞 Đang gọi ${instantRes.featureName || "Hotline"}...`);
            window.location.href = instantRes.route;
            setTimeout(() => setActiveActionNotice(null), 2500);
          }
        } else if (instantRes.intent === "navigate" && instantRes.route) {
          const targetRoute = instantRes.route;
          const targetTour = instantRes.tourId;
          const targetName = instantRes.featureName || "Màn hình";
          setActiveActionNotice(`⚡ Đang chuyển tới ${targetName}...`);
          setTimeout(() => {
            void navigate({ to: targetRoute as any });
            toast.success(`⚡ Đã mở ${targetName}`);
            setTimeout(() => setActiveActionNotice(null), 2000);
            if (targetTour) {
              setTimeout(() => startTourGlobally(targetTour), 400);
            }
          }, 650);
        }

        isSubmittingRef.current = false;
        return;
      }

      // ── BƯỚC 2: GỬI LÊN BACKEND (UNIVERSAL RAG EXECUTIVE ENGINE) ──
      setIsLoadingAi(true);
      setStatusMessage("Trợ lý AI đang tra cứu dữ liệu liên quan...");

      // Cập nhật câu hỏi của user vào danh sách
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, userMsgObj],
            };
          }
          return s;
        });
        return updated;
      });

      try {
        const res = await fetchNestApi<{
          ok: boolean;
          data: {
            answer: string;
            speechText: string;
            intent: "chat" | "query_data" | "start_tour" | "feature_guide" | "navigate" | "action";
            actionType?: "navigate" | "search" | "theme" | "call";
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
          const assistantMsgObj: ChatMessage = {
            id: `msg_a_${Date.now() + 1}`,
            role: "assistant",
            text: aiData.answer,
            speechText: aiData.speechText,
            intent: aiData.intent,
            actionType: aiData.actionType,
            tourId: aiData.tourId,
            route: aiData.route,
            featureName: aiData.featureName,
            suggestTour: aiData.suggestTour,
            createdAt: Date.now() + 1,
          };

          setSessions((prev) => {
            const updated = prev.map((s) => {
              if (s.id === activeSessionId) {
                const isFirstUserMsg = !s.messages.slice(0, -1).some((m) => m.role === "user");
                const newTitle = isFirstUserMsg
                  ? userMsg.slice(0, 30) + (userMsg.length > 30 ? "..." : "")
                  : s.title;
                return {
                  ...s,
                  title: newTitle,
                  updatedAt: Date.now(),
                  messages: [...s.messages, assistantMsgObj],
                };
              }
              return s;
            });
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
              } catch {
                /* ignore */
              }
            }
            return updated;
          });

          setStatusMessage(null);
          speakText(aiData.speechText);

          // Xử lý hành động nếu có
          if (aiData.intent === "action") {
            if (aiData.actionType === "theme") {
              setActiveActionNotice("🌓 Đang chuyển đổi giao diện hệ thống...");
              toggleTheme();
              toast.success("Đã chuyển đổi giao diện");
              setTimeout(() => setActiveActionNotice(null), 2500);
            } else if (aiData.actionType === "call" && aiData.route) {
              setActiveActionNotice(`📞 Đang gọi ${aiData.featureName || "Hotline"}...`);
              window.location.href = aiData.route;
              setTimeout(() => setActiveActionNotice(null), 2500);
            }
          } else if (aiData.intent === "navigate" && aiData.route) {
            const targetRoute = aiData.route;
            const targetTour = aiData.tourId;
            const targetName = aiData.featureName || "Màn hình";
            setActiveActionNotice(`⚡ Đang chuyển tới ${targetName}...`);
            setTimeout(() => {
              void navigate({ to: targetRoute as any });
              toast.success(`⚡ Đã mở ${targetName}`);
              setTimeout(() => setActiveActionNotice(null), 2000);
              if (targetTour) {
                setTimeout(() => startTourGlobally(targetTour), 400);
              }
            }, 650);
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
        const fallbackText = `Dạ em đã ghi nhận câu hỏi của ${memberName}. Hiện tại kết nối dữ liệu đang bận, Quý Anh/Chị có thể dùng các phím tắt nhanh bên dưới để xem Danh bạ, Sự kiện hoặc Hội phí nhé ạ!`;

        const fallbackMsg: ChatMessage = {
          id: `msg_a_err_${Date.now()}`,
          role: "assistant",
          text: fallbackText,
          speechText: fallbackText,
          createdAt: Date.now(),
        };

        setSessions((prev) => {
          const updated = prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                updatedAt: Date.now(),
                messages: [...s.messages, fallbackMsg],
              };
            }
            return s;
          });
          return updated;
        });
        speakText(fallbackText);
      } finally {
        setIsLoadingAi(false);
        isSubmittingRef.current = false;
      }
    },
    [
      activeSessionId,
      cleanupAudio,
      handleStartDirectTour,
      navigate,
      pendingTour,
      resolveInstantLocalResponse,
      speakText,
      stopSpeaking,
      toggleTheme,
      user,
    ],
  );

  const submitPromptRef = useRef(submitPrompt);
  useEffect(() => {
    submitPromptRef.current = submitPrompt;
  });

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
        if (!isMountedRef.current) return;
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
          if (isMountedRef.current) {
            setTranscript(fullTranscript);
          }
          transcriptRef.current = fullTranscript;

          // Bộ đếm im lặng 1.5s: Nếu người dùng ngừng nói thì tự động gửi cho AI một lần duy nhất
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (
              transcriptRef.current.trim() &&
              isListeningRef.current &&
              !isSubmittingRef.current
            ) {
              const textToSend = transcriptRef.current.trim();
              cleanupAudio();
              void submitPromptRef.current?.(textToSend);
            }
          }, 1500);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        if (event.error === "not-allowed" && isMountedRef.current) {
          setStatusMessage("Vui lòng cấp quyền Microphone để ra lệnh giọng nói.");
          toast.error("Trình duyệt chưa được cấp quyền micro.");
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("[SpeechRecognition] Init failed:", err);
    }

    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // ── KHỞI CHẠY THU ÂM (ĐẢM BẢO TẮT ÂM THANH LOA TRƯỚC ĐỂ TRÁNH ECHO BỊ NÓI LẶP 2 LẦN) ──
  const startListening = async () => {
    stopSpeaking();

    setStatusMessage("Đang khởi động Microphone...");
    setIsListening(true);
    isListeningRef.current = true;
    setRecordingSeconds(0);
    audioChunksRef.current = [];
    transcriptRef.current = "";
    setTranscript("");

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

    // Visualizer sóng âm
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

    // MediaRecorder dự phòng nếu Web Speech API không khả dụng
    if (stream && typeof MediaRecorder !== "undefined" && !recognitionRef.current) {
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          if (
            !transcriptRef.current.trim() &&
            audioChunksRef.current.length > 0 &&
            !isSubmittingRef.current
          ) {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: recorder.mimeType || "audio/webm",
            });
            audioChunksRef.current = [];

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = (reader.result as string)?.split(",")?.[1];
              if (base64Data) {
                setIsLoadingAi(true);
                setStatusMessage("Đang phân tích giọng nói...");
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
                    const uMsg: ChatMessage = {
                      id: `msg_u_${Date.now()}`,
                      role: "user",
                      text: aiData.userSpeech || "Giọng nói hội viên",
                      createdAt: Date.now(),
                    };
                    const aMsg: ChatMessage = {
                      id: `msg_a_${Date.now() + 1}`,
                      role: "assistant",
                      text: aiData.answer,
                      speechText: aiData.speechText,
                      intent: aiData.intent,
                      tourId: aiData.tourId,
                      route: aiData.route,
                      featureName: aiData.featureName,
                      suggestTour: aiData.suggestTour,
                      createdAt: Date.now() + 1,
                    };

                    setSessions((prev) => {
                      const updated = prev.map((s) => {
                        if (s.id === activeSessionId) {
                          return {
                            ...s,
                            updatedAt: Date.now(),
                            messages: [...s.messages, uMsg, aMsg],
                          };
                        }
                        return s;
                      });
                      if (typeof window !== "undefined") {
                        try {
                          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
                        } catch {
                          /* ignore */
                        }
                      }
                      return updated;
                    });

                    setStatusMessage(null);
                    speakText(aiData.speechText);
                  }
                } catch (voiceErr) {
                  console.warn("[ask-voice] Failed:", voiceErr);
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

    // Khởi động Web Speech API
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      try {
        recognitionRef.current.start();
        setStatusMessage("Đang lắng nghe... Hãy nói câu hỏi!");
        return;
      } catch (e) {
        console.warn("[SpeechRecognition] Start failed:", e);
      }
    }

    setStatusMessage("Đang thu âm giọng nói... Bấm dừng khi xong!");
  };

  const stopListening = () => {
    const textToSend = transcriptRef.current.trim();
    cleanupAudio();

    if (textToSend && !isSubmittingRef.current) {
      void submitPrompt(textToSend);
    }
  };

  const handleOpenAssistant = () => {
    setIsOpen(true);
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

  const avgAudioLevel = audioWaveLevel.reduce((a, b) => a + b, 0) / (audioWaveLevel.length || 1);
  const orbScale = isListening
    ? Math.min(1.35, 1 + (avgAudioLevel - 10) / 70)
    : isSpeaking
      ? 1.08
      : 1;

  // Lọc lịch sử theo tìm kiếm
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(historySearchQuery.toLowerCase()),
  );

  return (
    <>
      {/* ── 1. GOOGLE MAPS-STYLE GPS HUD SPOTLIGHT OVERLAY ── */}
      <VoiceGpsHudOverlay />

      {/* ── 2. NÚT TRỢ LÝ AI NỔI HÌNH CON HOẠT HÌNH 3D CEO 1983 ── */}
      <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none">
        <div className="relative group">
          <button
            type="button"
            onClick={handleDismissRobot}
            title="Ẩn trợ lý AI"
            aria-label="Ẩn trợ lý AI"
            className="absolute -top-1 -right-1 z-10 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 transition shadow"
          >
            <X className="h-2.5 w-2.5" />
          </button>
          <button
            type="button"
            onClick={handleOpenAssistant}
            title="Trợ lý AI Doanh Nhân CEO 1983"
            aria-label="Mở Trợ lý AI"
            className="relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-[#003B95] via-[#265BFF] to-[#002B70] p-1 border-2 border-amber-300 shadow-[0_8px_25px_rgba(0,59,149,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-[bounce_4s_ease-in-out_infinite] group-hover:shadow-[0_12px_30px_rgba(38,91,255,0.5)]"
          >
            <div className="h-full w-full rounded-full overflow-hidden bg-white/95 flex items-center justify-center shadow-inner">
              <img
                src={AI_CHARACTER_IMAGE}
                alt="Trợ lý AI CEO 1983"
                className="h-full w-full object-cover object-top scale-110"
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
            </span>
          </button>
        </div>
      </div>

      {/* ── 3. MODAL HỎI ĐÁP & ĐIỀU KHIỂN GIỌNG NÓI CHUẨN DESIGN SVG & CEO 1983 BRAND ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-md md:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#F7FAFF] dark:bg-[#0D1522] border border-[#DCE6F5] dark:border-slate-800 shadow-2xl overflow-hidden overflow-x-hidden flex flex-col h-[88vh] sm:h-[640px] text-[#192638] dark:text-zinc-100 animate-in slide-in-from-bottom-4 duration-250 select-none relative"
            role="dialog"
            aria-modal="true"
          >
            {/* ── HEADER CHUẨN DESIGN SVG ── */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#E5EDF8] dark:border-slate-800/80 bg-white/90 dark:bg-[#131D2D]/90 backdrop-blur-md shrink-0 z-20">
              {/* Brand identity: Hình hoạt hình 3D AI Character */}
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl overflow-hidden bg-white border border-[#265BFF]/30 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={AI_CHARACTER_IMAGE}
                    alt="CEO 1983 AI"
                    className="h-full w-full object-cover object-top scale-110"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#003B95] dark:text-blue-300 tracking-wide">
                      CEO 1983 AI
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-[#788392] dark:text-slate-400 line-clamp-1">
                    Trợ lý Điều hành Toàn Năng
                  </p>
                </div>
              </div>

              {/* NÚT + HỘI THOẠI MỚI (ĐÚNG THEO SVG FIGMA CỦA USER: fill="white", stroke="#6155F5", rx="16") */}
              <button
                type="button"
                onClick={handleNewChat}
                title="Tạo cuộc hội thoại mới"
                className="px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-[#DCE6F5] dark:border-slate-700 text-[#265BFF] dark:text-blue-400 font-semibold text-xs shadow-xs hover:bg-[#F7FAFF] dark:hover:bg-slate-750 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="tracking-tight">Hội thoại mới</span>
              </button>

              {/* Action Controls: History Drawer, Audio Mute, Close */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
                  title="Lịch sử hội thoại"
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                    isHistoryDrawerOpen
                      ? "bg-[#EDF3FF] text-[#265BFF] font-semibold"
                      : "text-[#526074] dark:text-slate-400 hover:text-[#192638] hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (next) stopSpeaking();
                  }}
                  title={isMuted ? "Bật âm thanh giọng nói" : "Tắt âm thanh giọng nói"}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-[#526074] dark:text-slate-400 hover:text-[#192638] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-rose-500" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-[#265BFF]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cleanupAudio();
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  title="Đóng trợ lý"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-[#526074] dark:text-slate-400 hover:text-[#192638] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── SEGMENTED SWITCH: [ 💬 Hội thoại ] vs [ 🎙️ Giọng nói ] (CHUẨN SVG: rx="16" fill="#F4F6F9") ── */}
            <div className="px-4 pt-2.5 pb-2 bg-[#F7FAFF] dark:bg-[#0D1522] shrink-0">
              <div className="w-full bg-[#EBF0F8] dark:bg-slate-900 p-1 rounded-2xl flex items-center border border-[#E0E8F4] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("chat")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    viewMode === "chat"
                      ? "bg-white dark:bg-slate-800 text-[#265BFF] dark:text-blue-300 shadow-sm"
                      : "text-[#526074] dark:text-slate-400 hover:text-[#192638]"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Hội thoại ({chatHistory.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("voice")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    viewMode === "voice"
                      ? "bg-white dark:bg-slate-800 text-[#265BFF] dark:text-blue-300 shadow-sm"
                      : "text-[#526074] dark:text-slate-400 hover:text-[#192638]"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chế độ Giọng nói</span>
                </button>
              </div>
            </div>

            {/* ── SLIDE-OVER DRAWER: LỊCH SỬ HỘI THOẠI (CHATGPT HISTORY DRAWER) ── */}
            {isHistoryDrawerOpen && (
              <div className="absolute inset-x-0 bottom-0 top-[53px] z-30 bg-[#F7FAFF]/98 dark:bg-[#0D1522]/98 backdrop-blur-md flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 overflow-x-hidden">
                {/* History Header & Search */}
                <div className="p-3.5 border-b border-[#E5EDF8] dark:border-slate-800 bg-white dark:bg-[#131D2D] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#003B95] dark:text-blue-400" />
                      <h3 className="text-xs font-bold text-[#192638] dark:text-slate-100 uppercase tracking-wider">
                        Lịch sử các cuộc hội thoại
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryDrawerOpen(false)}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Tìm kiếm cuộc trò chuyện..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F7FAFF] dark:bg-slate-900 border border-[#DCE6F5] dark:border-slate-700 text-[#192638] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#265BFF]"
                    />
                  </div>
                </div>

                {/* History List */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-10 space-y-2 text-slate-400 text-xs">
                      <Clock className="w-8 h-8 mx-auto stroke-1 opacity-50" />
                      <p>Không tìm thấy cuộc trò chuyện nào phù hợp.</p>
                    </div>
                  ) : (
                    filteredSessions.map((ses) => {
                      const isActive = ses.id === activeSessionId;
                      const msgCount = ses.messages.length;
                      const dateStr = new Date(ses.updatedAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      });
                      const lastMsg = ses.messages[ses.messages.length - 1];

                      return (
                        <div
                          key={ses.id}
                          onClick={() => handleSelectSession(ses.id)}
                          className={`group p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                            isActive
                              ? "bg-[#EDF3FF] dark:bg-[#18263A] border-[#265BFF] shadow-xs"
                              : "bg-white dark:bg-[#131D2D] border-[#E5EDF8] dark:border-slate-800 hover:border-[#265BFF]/50 hover:shadow-xs"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {isActive && (
                                <span className="h-2 w-2 rounded-full bg-[#265BFF] shrink-0" />
                              )}
                              <h4
                                className={`text-xs font-semibold truncate ${
                                  isActive
                                    ? "text-[#003B95] dark:text-blue-300 font-bold"
                                    : "text-[#192638] dark:text-slate-200"
                                }`}
                              >
                                {ses.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-[#788392] dark:text-slate-400 truncate mt-0.5">
                              {lastMsg?.text.slice(0, 50) || "Bắt đầu cuộc trò chuyện..."}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>{dateStr}</span>
                              <span>•</span>
                              <span>{msgCount} tin nhắn</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(e, ses.id)}
                            title="Xóa cuộc trò chuyện này"
                            className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* History Drawer Footer */}
                <div className="p-3 border-t border-[#E5EDF8] dark:border-slate-800 bg-white dark:bg-[#131D2D] flex items-center justify-between gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium px-2 py-1"
                  >
                    Xóa tất cả lịch sử
                  </button>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="px-3.5 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Hội thoại mới</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── MODE 1: CHAT INTERFACE (CHATGPT-STYLE CONVERSATION STREAM) ── */}
            {viewMode === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden overflow-x-hidden bg-[#F7FAFF] dark:bg-[#0D1522]">
                {/* Active Action Notice */}
                {activeActionNotice && (
                  <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span>{activeActionNotice}</span>
                  </div>
                )}

                {/* Message Stream */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-[#265BFF]/30 shadow-md flex items-center justify-center">
                        <img
                          src={AI_CHARACTER_IMAGE}
                          alt="AI Character"
                          className="h-full w-full object-cover object-top scale-110"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#003B95] dark:text-slate-100">
                          Trợ lý Toàn Năng CEO 1983
                        </h4>
                        <p className="text-xs text-[#788392] dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                          Tự động thao tác, mở các màn hình trong ứng dụng và giải đáp mọi câu hỏi
                          điều hành, nhân sự, dòng tiền.
                        </p>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${
                          msg.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#EDF3FF] dark:bg-[#1A263A] text-[#192638] dark:text-slate-100 border border-[#D5E3FC] dark:border-slate-700 px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs font-medium whitespace-pre-line">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="flex items-start gap-2.5 max-w-[92%]">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-white border border-[#265BFF]/40 shadow-xs shrink-0 mt-0.5">
                              <img
                                src={AI_CHARACTER_IMAGE}
                                alt="AI Assistant"
                                className="h-full w-full object-cover object-top scale-110"
                              />
                            </div>
                            <div className="flex-1 bg-white dark:bg-[#131D2D] text-[#192638] dark:text-slate-200 border border-[#E5EDF8] dark:border-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs">
                              <FormattedAiText text={msg.text} />

                              {/* Gợi ý tour chỉ dẫn GPS nếu có */}
                              {msg.tourId && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-[#F7FAFF] dark:bg-slate-900 border border-[#DCE6F5] dark:border-slate-800 text-[#192638] dark:text-slate-200 space-y-2">
                                  <div className="flex items-center gap-1.5 text-[#003B95] dark:text-blue-300 font-semibold text-xs">
                                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Chỉ dẫn trực tiếp từng bước trên màn hình</span>
                                  </div>
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartDirectTour(
                                          msg.tourId!,
                                          msg.route,
                                          msg.featureName,
                                        )
                                      }
                                      className="px-3 py-1 rounded-lg bg-[#003B95] hover:bg-[#002B70] text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                                    >
                                      <span>Bắt đầu ngay</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPendingTour(null)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#788392] text-xs transition cursor-pointer"
                                    >
                                      Để sau
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isLoadingAi && (
                    <div className="flex items-center gap-2 text-xs text-[#003B95] dark:text-blue-300 py-1.5 px-3 bg-white dark:bg-slate-800 rounded-full border border-[#DCE6F5] dark:border-slate-700 w-fit shadow-xs ml-10">
                      <div className="h-2.5 w-2.5 rounded-full border-2 border-[#265BFF] border-t-transparent animate-spin" />
                      <span>Đang tra cứu dữ liệu điều hành...</span>
                    </div>
                  )}
                </div>

                {/* ── BỎ HOÀN TOÀN GIAO DIỆN SCROLL NGANG: DÙNG WRAP CHIPS GỌN GÀNG KHÔNG CUỘN NGANG ── */}
                <div className="px-3.5 py-2 border-t border-[#E5EDF8] dark:border-slate-800 bg-white/70 dark:bg-[#131D2D]/70 flex flex-wrap items-center justify-start gap-1.5 shrink-0">
                  {QUICK_PROMPTS.map((qp, idx) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickPromptClick(qp)}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F7FAFF] border border-[#DCE6F5] dark:border-slate-700 text-[11px] text-[#192638] dark:text-slate-200 font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-[#265BFF]/40 active:scale-95"
                      >
                        <Icon className="w-3 h-3 text-[#265BFF] dark:text-amber-400 shrink-0" />
                        <span>{qp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── MODE 2: VOICE ORB INTERFACE (HÌNH CON HOẠT HÌNH 3D AI CHARACTER) ── */}
            {viewMode === "voice" && (
              <div className="flex-1 flex flex-col items-center justify-between p-5 overflow-hidden overflow-x-hidden relative bg-[#F7FAFF] dark:bg-[#0D1522]">
                {/* Radial Glow */}
                <div className="absolute inset-0 bg-radial from-blue-500/[0.08] via-transparent to-transparent pointer-events-none" />

                {/* Floating Status / Action Notice */}
                <div className="h-8 flex items-center justify-center z-10 w-full px-2">
                  {activeActionNotice ? (
                    <div className="px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-150">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span>{activeActionNotice}</span>
                    </div>
                  ) : statusMessage ? (
                    <div className="text-xs text-[#003B95] dark:text-blue-300 font-medium tracking-wide text-center truncate">
                      {statusMessage}
                    </div>
                  ) : null}
                </div>

                {/* Central 3D Animated AI Character Stage */}
                <div className="relative flex flex-col items-center justify-center my-auto py-2">
                  {/* Concentric Audio Reactive Ripple Rings */}
                  <div
                    className={`absolute rounded-full border-2 border-[#265BFF]/20 transition-transform duration-100 ease-out pointer-events-none ${
                      isListening
                        ? "opacity-100"
                        : isSpeaking
                          ? "opacity-60 animate-ping"
                          : "opacity-0"
                    }`}
                    style={{
                      width: "230px",
                      height: "230px",
                      transform: `scale(${orbScale * 1.15})`,
                    }}
                  />
                  <div
                    className={`absolute rounded-full border border-[#265BFF]/30 transition-transform duration-100 ease-out pointer-events-none ${
                      isListening ? "opacity-100" : isSpeaking ? "opacity-80" : "opacity-0"
                    }`}
                    style={{
                      width: "190px",
                      height: "190px",
                      transform: `scale(${orbScale * 1.05})`,
                    }}
                  />

                  {/* Character Sphere Avatar */}
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? "Dừng lắng nghe" : "Chạm để ra lệnh giọng nói"}
                    className={`relative h-44 w-44 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none p-1.5 ${
                      isListening
                        ? "bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 shadow-[0_0_55px_rgba(239,68,68,0.45)] scale-105"
                        : isSpeaking
                          ? "bg-gradient-to-tr from-[#003B95] via-[#265BFF] to-[#6155F5] shadow-[0_0_55px_rgba(38,91,255,0.45)] animate-pulse"
                          : isLoadingAi
                            ? "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-[0_0_45px_rgba(99,102,241,0.4)] animate-spin"
                            : "bg-gradient-to-tr from-[#003B95] via-[#265BFF] to-[#002B70] border-4 border-white shadow-2xl hover:scale-105 active:scale-95"
                    }`}
                  >
                    <div className="h-full w-full rounded-full bg-white dark:bg-[#131D2D] overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                      <img
                        src={AI_CHARACTER_IMAGE}
                        alt="AI Assistant 3D Character"
                        className="h-[125%] w-[125%] object-cover object-top scale-110"
                      />

                      {/* Floating status badge on bottom */}
                      <div className="absolute bottom-2 px-3 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-md">
                        {isListening ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            <span>Đang nghe...</span>
                          </>
                        ) : isSpeaking ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Đang nói...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3 text-amber-400" />
                            <span>Chạm để nói</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Sóng âm 7 vạch khi đang nghe */}
                  {isListening && (
                    <div className="flex items-center gap-1 h-6 mt-3 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900 shadow-xs">
                      {audioWaveLevel.map((height, i) => (
                        <span
                          key={i}
                          className="w-1 rounded-full bg-rose-600 transition-all duration-75"
                          style={{ height: `${Math.max(6, height * 0.45)}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitle / Voice Status */}
                <div className="w-full flex flex-col items-center gap-3 z-10 px-2">
                  <div className="text-center">
                    <span className="text-xs font-semibold text-[#192638] dark:text-slate-300">
                      {isListening
                        ? `Đang lắng nghe (${recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)...`
                        : isLoadingAi
                          ? "Đang tra cứu dữ liệu & xử lý..."
                          : isSpeaking
                            ? "Trợ lý AI đang phản hồi..."
                            : "Chạm vào Trợ lý AI hoặc bấm Micro bên dưới để nói"}
                    </span>
                  </div>

                  {(transcript || lastAssistantSpeech) && (
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#131D2D] border border-[#DCE6F5] dark:border-slate-800 px-4 py-2.5 text-center text-xs text-[#192638] dark:text-slate-200 leading-relaxed shadow-xs min-h-[48px] flex items-center justify-center">
                      <p className="line-clamp-2">
                        {isListening ? (
                          <span className="text-[#003B95] dark:text-blue-300 font-bold">
                            "{transcript}"
                          </span>
                        ) : (
                          <span>{lastAssistantSpeech}</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Quick Chips (Không cuộn ngang) */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    {QUICK_PROMPTS.map((qp, idx) => {
                      const Icon = qp.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickPromptClick(qp)}
                          className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 border border-[#DCE6F5] dark:border-slate-700 text-[11px] text-[#192638] dark:text-slate-200 font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Icon className="w-3 h-3 text-[#265BFF] dark:text-amber-400 shrink-0" />
                          <span>{qp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── CHATGPT MINIMALIST BOTTOM CAPSULE INPUT BAR (CHUẨN SVG & CEO 1983) ── */}
            <div className="p-3 border-t border-[#E5EDF8] dark:border-slate-800 bg-white dark:bg-[#131D2D] shrink-0 flex flex-col gap-1.5 z-20 overflow-x-hidden">
              <div className="flex items-center gap-2 bg-[#F4F6F9] dark:bg-slate-900 border border-[#DCE6F5] dark:border-slate-700 rounded-full px-2 py-1.5 focus-within:border-[#265BFF] focus-within:ring-2 focus-within:ring-[#265BFF]/10 transition shadow-xs">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse shadow-md"
                      : "bg-white dark:bg-slate-800 text-[#526074] hover:text-[#265BFF] shadow-xs"
                  }`}
                  title={isListening ? "Dừng ghi âm" : "Nói bằng giọng nói"}
                >
                  {isListening ? (
                    <Square className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputText || transcript}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submitPrompt(inputText || transcript);
                  }}
                  placeholder={
                    isListening
                      ? "Đang lắng nghe câu hỏi..."
                      : "Nhập câu hỏi hoặc ra lệnh giọng nói..."
                  }
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[#192638] dark:text-slate-100 placeholder:text-[#788392] focus:outline-none px-1"
                />

                <button
                  type="button"
                  onClick={() => void submitPrompt(inputText || transcript)}
                  disabled={!inputText.trim() && !transcript.trim()}
                  className="h-8 w-8 rounded-full flex items-center justify-center bg-[#003B95] hover:bg-[#002B70] text-white disabled:opacity-20 disabled:pointer-events-none transition shrink-0 cursor-pointer shadow-xs"
                  title="Gửi câu hỏi"
                >
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="text-[10px] text-[#788392] dark:text-slate-500 text-center select-none tracking-wide">
                CEO 1983 AI • Điều khiển giọng nói & Bộ não điều hành toàn năng
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
