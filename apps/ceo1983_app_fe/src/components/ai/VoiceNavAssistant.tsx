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
  color: string;
  tourId?: string;
  route?: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Sự kiện đông người nhất?",
    query: "Sự kiện nào đang được nhiều người đăng ký nhất?",
    icon: Calendar,
    color: "from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40",
  },
  {
    label: "Sự kiện tôi đã đăng ký",
    query: "Tôi có đang đăng ký sự kiện nào không?",
    icon: QrCode,
    color: "from-blue-500/20 to-cyan-500/10 text-cyan-300 border-cyan-500/40",
  },
  {
    label: "Thông báo chưa đọc",
    query: "Tôi có thông báo nào chưa đọc không?",
    icon: Bell,
    color: "from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/40",
  },
  {
    label: "Kiểm tra hội phí",
    query: "Tôi có hội phí nào chưa đóng không?",
    icon: CreditCard,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/40",
  },
  {
    label: "Tư vấn mở rộng đối tác B2B",
    query: "Tư vấn giúp tôi cách kết nối và mở rộng đối tác trong hiệp hội CEO 1983",
    icon: Handshake,
    color: "from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/40",
    tourId: "association-products",
    route: "/association/products",
  },
  {
    label: "Địa điểm tiếp khách & Cà phê",
    query: "Gợi ý cho tôi địa điểm tiếp khách và uống cà phê kết nối doanh nhân ở Hà Nội",
    icon: Coffee,
    color: "from-yellow-500/20 to-amber-500/10 text-yellow-300 border-yellow-500/40",
    tourId: "association-members",
    route: "/association/members",
  },
  {
    label: "Chỉ dẫn: Đăng ký sự kiện",
    query: "Hướng dẫn tôi thao tác đăng ký sự kiện như nào",
    icon: Compass,
    color: "from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/40",
    tourId: "association-events",
    route: "/association/events",
  },
  {
    label: "Chỉ dẫn: Thẻ NFC & Danh thiếp",
    query: "Hướng dẫn tôi ghi thẻ danh thiếp số NFC",
    icon: CreditCard,
    color: "from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/40",
    tourId: "association-card",
    route: "/association/card",
  },
  {
    label: "Chỉ dẫn: Danh bạ & Hẹn 1-1",
    query: "Hướng dẫn tôi tìm kiếm hội viên và đặt lịch hẹn giao thương 1-on-1",
    icon: Users,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/40",
    tourId: "association-members",
    route: "/association/members",
  },
  {
    label: "Chỉ dẫn: Sàn Giao thương B2B",
    query: "Hướng dẫn tôi đăng bán sản phẩm và kết nối cơ hội kinh doanh B2B",
    icon: Handshake,
    color: "from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40",
    tourId: "association-products",
    route: "/association/products",
  },
];

/**
 * Bộ Render Văn Bản Markdown Thông Minh Chuẩn CEO 1983:
 * Hiển thị chữ trắng tinh khiết, điểm nhấn vàng kim Amber Gold, khử hoàn toàn raw markdown stars.
 */
function FormattedAiText({ text }: { text: string }) {
  const lines = text.split("\n");

  const renderInline = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-amber-300 font-bold drop-shadow-sm">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="text-amber-200/90 italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-400/30"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-white font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header style with icon or ###
        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4
              key={idx}
              className="text-sm font-extrabold text-amber-300 pt-1 flex items-center gap-1.5 border-b border-amber-500/25 pb-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{renderInline(headerText)}</span>
            </h4>
          );
        }

        // Bullet point: "- " or "• " or "* "
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          const bulletText = trimmed.replace(/^[-•*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_6px_#f59e0b]" />
              <div className="flex-1 text-white">{renderInline(bulletText)}</div>
            </div>
          );
        }

        // Numbered list: "1. ", "2. ", etc.
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 mt-0.5 shadow-sm">
                {numMatch[1]}
              </span>
              <div className="flex-1 text-white">{renderInline(numMatch[2])}</div>
            </div>
          );
        }

        // Action prompt lines: starts with "👉"
        if (trimmed.startsWith("👉")) {
          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-200 font-semibold text-xs my-1.5 flex items-start gap-2 shadow-sm"
            >
              <span className="text-amber-400 text-sm shrink-0">👉</span>
              <div className="flex-1 text-white leading-normal">{renderInline(trimmed.replace(/^👉\s*/, ""))}</div>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-white">
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
        q.includes("bạn ơi") ||
        q.includes("bạn là ai") ||
        q.includes("em là ai") ||
        q.includes("tên là gì") ||
        q.includes("giúp được gì")
      ) {
        return {
          answer: `👋 **Dạ em chào ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành Thông Minh** của **CLB Doanh Nhân CEO 1983**.\n\nRất hân hạnh được đồng hành và phục vụ Quý Anh/Chị hôm nay ạ! Em có thể giúp Quý Anh/Chị:\n- 📅 **Tra cứu sự kiện:** Xem sự kiện đông người nhất, sự kiện đã đăng ký vé.\n- 💳 **Hội phí & Thẻ VIP:** Kiểm tra niên liễm, hướng dẫn đóng VietQR, ghi thẻ NFC.\n- 🤝 **Kết nối Giao thương:** Tìm danh bạ 200+ CEO, hẹn gặp 1-on-1, đăng sàn sản phẩm.\n- 🧭 **Dẫn đường GPS:** Tự động lái màn hình và hướng dẫn từng bước thao tác.\n\n👉 *Hôm nay công việc của Anh/Chị thế nào rồi ạ? Quý Anh/Chị cần em hỗ trợ việc gì ngay bây giờ không ạ?*`,
          speechText: `Dạ em chào ${memberName}! Em là Trợ lý AI điều hành của CEO 1983. Hôm nay công việc của anh chị thế nào rồi ạ? Em có thể giúp tra cứu lịch sự kiện, kiểm tra hội phí và dẫn đường trên app ạ!`,
          intent: "chat",
        };
      }

      // 2. Tâm sự, cảm xúc & áp lực doanh nhân
      if (
        q.includes("mệt") ||
        q.includes("áp lực") ||
        q.includes("stress") ||
        q.includes("buồn") ||
        q.includes("chán") ||
        q.includes("khó khăn") ||
        q.includes("vất vả")
      ) {
        return {
          answer: `☕ **Dạ em rất thấu hiểu và sẻ chia cùng Quý Anh/Chị ${memberName}!**\n\nLàm người thuyền trưởng lèo lái một doanh nghiệp luôn phải đối mặt với vô vàn áp lực, trọng trách và thách thức. Anh/Chị hãy hít thở thật sâu, uống một tách trà ấm hoặc cà phê để nạp lại năng lượng nhé!\n\nTinh thần doanh nhân **CEO 1983** - tuổi Quý Hợi bản lĩnh, kiên cường - luôn gắn bó cùng nhau qua phương châm *"Gắn kết bền - Phát triển vững"*. Khi căng thẳng, Anh/Chị có thể mở mục **"Danh bạ"** để hẹn gặp một người bạn đồng hành 1-on-1 hoặc cùng anh em tham gia buổi Cà phê Doanh nhân nhé ạ!`,
          speechText: `Em rất hiểu làm lãnh đạo doanh nghiệp luôn đối mặt nhiều áp lực. Anh chị hãy nghỉ ngơi, uống một tách trà ấm nhé! Tinh thần anh em CEO 1983 luôn đồng hành và sẻ chia cùng anh chị ạ!`,
          intent: "chat",
        };
      }

      // 3. Lời cảm ơn, khen ngợi & chúc mừng
      if (
        q.includes("cảm ơn") ||
        q.includes("thank") ||
        q.includes("em giỏi") ||
        q.includes("tuyệt vời") ||
        q.includes("thông minh") ||
        q.includes("chúc mừng") ||
        q.includes("chúc đầu tuần") ||
        q.includes("chúc ngủ ngon")
      ) {
        return {
          answer: `💐 **Dạ em xin chân thành cảm ơn Quý Anh/Chị ${memberName} ạ!**\n\nSự đồng hành và tin yêu của Quý Anh/Chị là niềm tự hào lớn nhất của em. Em xin kính chúc Anh/Chị cùng doanh nghiệp luôn dồi dào sức khỏe, tràn đầy nhiệt huyết, vạn sự hanh thông và bứt phá doanh số rực rỡ!`,
          speechText: `Dạ em cảm ơn Quý anh chị ${memberName} rất nhiều ạ! Chúc anh chị luôn dồi dào sức khỏe, tràn đầy năng lượng và gặt hái thật nhiều thành công ạ!`,
          intent: "chat",
        };
      }

      // 4. Địa điểm tiếp khách & Cà phê kết nối
      if (
        q.includes("cafe") ||
        q.includes("cà phê") ||
        q.includes("ăn trưa") ||
        q.includes("ăn tối") ||
        q.includes("tiếp khách") ||
        q.includes("quán ăn") ||
        q.includes("nhà hàng")
      ) {
        return {
          answer: `🍽️ **Gợi ý không gian tiếp khách & giao lưu Doanh nhân tại Hà Nội:**\n\n- ☕ **Cà phê yên tĩnh kết nối nhanh:** Các quán cà phê lịch sự tại khu vực phố Duy Tân, Cầu Giấy hoặc Trung Hòa Nhân Chính (Highlands, The Coffee House, Trung Nguyên Legend).\n- 🍱 **Ăn trưa & Ăn tối tiếp đối tác VIP:** Nhà hàng tiệc sang trọng tại Trống Đồng Palace, Trung tâm Hội nghị Quốc gia, hoặc các nhà hàng ẩm thực hồ Tây.\n- 🤝 **Hẹn 1-on-1 trực tiếp:** Quý Anh/Chị có thể vào mục **"Danh bạ"** để chọn hội viên và gửi lời mời đặt lịch hẹn giao thương 1-on-1 chính thức!\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Danh bạ hội viên để hẹn gặp đối tác ngay không ạ?*`,
          speechText: `Em gợi ý anh chị các điểm hẹn yên tĩnh tại Cầu Giấy hoặc Tây Hồ để tiếp đối tác. Anh chị có thể mở mục Danh bạ để đặt lịch hẹn kết nối một một nhé ạ!`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-members",
          route: "/association/members",
          featureName: "Danh Bạ & Hẹn Gặp 1-on-1",
        };
      }

      // 5. Tư vấn kết nối đối tác, tìm kiếm cơ hội B2B
      if (
        q.includes("tìm đối tác") ||
        q.includes("mở rộng") ||
        q.includes("tìm khách hàng") ||
        q.includes("bán hàng") ||
        q.includes("giao thương") ||
        q.includes("hợp tác") ||
        q.includes("cơ hội kinh doanh")
      ) {
        return {
          answer: `🤝 **Chiến lược Kết nối & Khai thác Mạng lưới 200+ CEO 1983:**\n\nCộng đồng CEO 1983 quy tụ các doanh nhân xuất sắc trong nhiều lĩnh vực then chốt: Bất động sản, Xây dựng, Công nghệ, Y tế, Giáo dục, Dịch vụ... Em gợi ý Anh/Chị:\n1. 📇 **Xuất trình Danh thiếp số & Chạm thẻ NFC:** Giới thiệu nhanh hồ sơ năng lực doanh nghiệp khi tham gia các buổi sinh hoạt.\n2. 🛍️ **Đăng sản phẩm lên Chợ B2B:** Đưa sản phẩm chủ lực vào Sàn giao thương với chính sách ưu đãi dành riêng cho hội viên.\n3. 📅 **Chủ động đặt lịch hẹn 1-on-1:** Kết nối sâu với từng doanh nghiệp cùng hệ sinh thái để tìm tiếng nói chung và mở ra cơ hội hợp tác lâu dài.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở ngay Sàn Giao Thương B2B không ạ?*`,
          speechText: `Để mở rộng đối tác, anh chị nên tận dụng mạng lưới hai trăm CEO bằng cách đăng sản phẩm lên Chợ Bê hai Bê và đặt lịch hẹn một một. Em có thể mở Chợ giao thương cho anh chị ngay bây giờ nhé!`,
          intent: "feature_guide",
          suggestTour: true,
          tourId: "association-products",
          route: "/association/products",
          featureName: "Chợ Giao Thương B2B",
        };
      }

      // 6. Hỏi sự kiện nhiều người đăng ký nhất / Sự kiện đông nhất
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
            answer: `🔥 **Sự kiện đang có nhiều đại biểu đăng ký nhất trong Hiệp hội:**\n\n- 🏆 **${top.title || top.name}**\n- ⏰ Thời gian: ${top.eventDate || top.date || "Đang diễn ra"}\n- 📍 Địa điểm: ${top.location || "Trung tâm Hội nghị Hiệp hội"}\n- 👥 Số lượng đăng ký: **${top.attendeeCount || top.registeredCount} đại biểu**\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở sự kiện này để xem chi tiết và đăng ký vé không ạ?*`,
            speechText: `Dạ thưa Quý Anh/Chị, sự kiện đang có nhiều đại biểu đăng ký nhất trong Hiệp hội là ${top.title || top.name} với ${top.attendeeCount || top.registeredCount} đại biểu. Quý Anh/Chị có muốn em dẫn đường mở sự kiện này không ạ? Hãy chọn Có hoặc nói Có nhé!`,
            intent: "feature_guide",
            suggestTour: true,
            tourId: "association-events",
            route: "/association/events",
            featureName: "Lịch Sự Kiện & Đăng Ký Vé",
          };
        }
      }

      // 7. Hỏi sự kiện tôi đã đăng ký
      if (
        q.includes("sự kiện của tôi") ||
        q.includes("tôi đã đăng ký") ||
        q.includes("tôi có đang đăng ký") ||
        q.includes("vé của tôi")
      ) {
        const myEvs = liveContext?.myEvents || [];
        if (myEvs.length > 0) {
          const listStr = myEvs
            .map(
              (e: any, idx: number) =>
                `${idx + 1}. **${e.name || e.title}** (${e.date || "Sắp tới"} - ${e.ticketCount || 1} vé)`,
            )
            .join("\n");
          return {
            answer: `🎫 **Quý Anh/Chị đang có ${myEvs.length} sự kiện đã đăng ký tham gia:**\n\n${listStr}\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở mục Vé Check-in QR để xem mã vé và bàn tiệc VIP không ạ?*`,
            speechText: `Quý Anh/Chị hiện đang đăng ký ${myEvs.length} sự kiện. Quý Anh/Chị có muốn em dẫn đường mở mục Vé Check in QR không ạ?`,
            intent: "feature_guide",
            suggestTour: true,
            tourId: "association-checkin",
            route: "/association/checkin",
            featureName: "Vé Check-in QR",
          };
        }
      }

      // 8. Hỏi thông báo chưa đọc
      if (
        q.includes("thông báo") &&
        (q.includes("chưa đọc") || q.includes("mới") || q.includes("có thông báo"))
      ) {
        const unreadCount = liveContext?.notifications?.unreadCount || 0;
        if (unreadCount > 0) {
          return {
            answer: `🔔 **Quý Anh/Chị đang có ${unreadCount} thông báo mới chưa đọc** từ Ban Thư Ký và Ban Quản Trị.\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở Trung tâm Thông báo ngay bây giờ không ạ?*`,
            speechText: `Quý Anh/Chị đang có ${unreadCount} thông báo mới chưa đọc. Quý Anh/Chị có muốn em dẫn đường vào Trung tâm Thông báo không ạ?`,
            intent: "feature_guide",
            suggestTour: true,
            tourId: "association-notifications",
            route: "/association/notifications",
            featureName: "Trung Tâm Thông Báo",
          };
        }
      }

      // 9. Hỏi hội phí & hóa đơn
      if (
        q.includes("hội phí") ||
        q.includes("niên liễm") ||
        q.includes("nợ phí") ||
        q.includes("hóa đơn")
      ) {
        const dues = liveContext?.dues;
        if (dues && !dues.feePaid) {
          const money = new Intl.NumberFormat("vi-VN").format(dues.totalOutstanding || 0);
          return {
            answer: `💳 **Thông tin Hội phí Hiệp hội CEO 1983 của Quý Anh/Chị:**\n\n- Trạng thái: ⚠️ **Chưa hoàn tất**\n- Số tiền cần đóng: **${money} VNĐ**\n- Kỳ phí: Năm ${dues.feeYear || 2026}\n- Ngân hàng tiếp nhận: **MB Bank (Quân Đội)** - STK: \`1983000000\`\n- Chủ tài khoản: **CLB DOANH NHAN CEO 1983**\n\n👉 *Quý Anh/Chị có muốn em dẫn đường mở mục Hồ sơ để quét mã VietQR MB Bank thanh toán tự động không ạ?*`,
            speechText: `Quý Anh/Chị hiện còn khoản hội phí chưa đóng là ${money} đồng. Quý Anh/Chị có muốn em dẫn đường quét mã VietQR thanh toán tự động không ạ?`,
            intent: "feature_guide",
            suggestTour: true,
            tourId: "association-profile",
            route: "/association/profile",
            featureName: "Hồ Sơ & Đóng Hội Phí VietQR",
          };
        }
      }

      // 10. Hỏi Thẻ Hội viên & Danh thiếp số NFC
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

      return null;
    },
    [liveContext, user],
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

      // ── BƯỚC 2: GỬI LÊN BACKEND (GOOGLE GEMINI 2.0 / HUMAN-LIKE NLP ENGINE) ──
      setIsLoadingAi(true);
      setStatusMessage("Trợ lý AI đang suy nghĩ và tra cứu câu trả lời...");
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
        const memberName = user?.name || "Quý Anh/Chị";
        const fallbackText = `Dạ em đã lắng nghe chia sẻ của ${memberName} ạ! Em có thể giúp Quý Anh/Chị tra cứu nhanh Lịch sự kiện, kiểm tra Hội phí hoặc mở Danh bạ 200+ CEO bằng các nút tiện ích ngay bên dưới nhé ạ!`;
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackText, speechText: fallbackText },
        ]);
        speakText(fallbackText);
      } finally {
        setIsLoadingAi(false);
      }
    },
    [handleStartDirectTour, pendingTour, resolveInstantLocalResponse, speakText, user],
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
      const greeting = `👋 **Dạ em kính chào Quý Anh/Chị ${memberName}!**\n\nEm là **Trợ lý AI Điều Hành Thông Minh** của **CLB Doanh Nhân CEO 1983**.\n\nQuý Anh/Chị có thể bấm nút **Micro** hoặc hỏi em: *"Sự kiện nào đông người nhất?"*, *"Kiểm tra hội phí của tôi"*, *"Tư vấn kết nối đối tác B2B"* hoặc yêu cầu *"Hướng dẫn tôi đăng ký sự kiện"* ạ!`;
      setChatHistory([
        {
          role: "assistant",
          text: greeting,
          speechText: `Dạ em chào ${memberName}! Em là Trợ lý AI điều hành của CEO 1983. Em có thể tra cứu sự kiện, kiểm tra hội phí và dẫn đường giọng nói cho Quý Anh/Chị ạ!`,
        },
      ]);
      speakText(
        `Dạ em chào ${memberName}! Em là Trợ lý AI điều hành của CEO 1983. Em có thể tra cứu sự kiện, kiểm tra hội phí và dẫn đường giọng nói cho Quý Anh/Chị ạ!`,
      );
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

      {/* ── 3. MODAL HỎI ĐÁP & CHỈ DẪN GIỌNG NÓI EXECUTIVE AI CHUẨN CEO 1983 ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#091D3E] via-[#071731] to-[#040D1B] border-2 border-amber-400/60 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[90vh] text-white animate-in slide-in-from-bottom-6 duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Header: Identity & Status Badge & Mute Toggle */}
            <div className="relative flex items-center justify-between p-4 border-b border-amber-500/30 bg-gradient-to-r from-[#003B95]/70 via-[#0B2F64]/50 to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md shrink-0 border border-white/30">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-amber-300 truncate drop-shadow-sm">
                      Trợ lý AI CEO 1983
                    </h3>
                    <span className="bg-amber-400/25 text-amber-300 border border-amber-400/50 text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider">
                      VIP EXECUTIVE
                    </span>
                  </div>
                  {liveContext?.user ? (
                    <p className="text-[11px] text-white font-medium truncate">
                      Chào mừng Doanh nhân <strong className="text-amber-300">{liveContext.user.name}</strong> ({liveContext.user.code})
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-200 font-medium">
                      Hỏi đáp thông minh & Dẫn đường giọng nói GPS
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Toggle Loa & Đóng */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Bật âm thanh giọng nói AI" : "Tắt âm thanh giọng nói AI"}
                  className={`grid h-8 w-8 place-items-center rounded-full transition cursor-pointer ${
                    isMuted
                      ? "bg-white/10 text-slate-400 hover:text-white"
                      : "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50 font-bold"
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
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-rose-600 transition cursor-pointer border border-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Dải thông tin phiên đăng nhập động (Live Context Bar) */}
            {liveContext && (
              <div className="px-4 py-2 bg-slate-900/60 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-white gap-2 overflow-x-auto">
                <div className="flex items-center gap-1 shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-300">{liveContext.user.level || "Hội viên Chính thức"}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-medium text-slate-200">
                    Hội phí:{" "}
                    {liveContext.dues.feePaid ? (
                      <strong className="text-emerald-400 font-bold">Đã hoàn thành</strong>
                    ) : (
                      <strong className="text-amber-300 font-bold">
                        Nợ {new Intl.NumberFormat("vi-VN").format(liveContext.dues.totalOutstanding)} đ
                      </strong>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Bell className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-medium text-slate-200">
                    Thông báo:{" "}
                    <strong className="text-cyan-300 font-bold">{liveContext.notifications.unreadCount}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Khung Chat Hội Thoại Sắc Nét Chuẩn CEO 1983 */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[190px] max-h-[350px]">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 shadow-md ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold rounded-tr-none text-xs sm:text-sm border border-amber-300"
                        : "bg-[#0E2752] text-white rounded-tl-none border border-amber-400/40 shadow-lg text-xs sm:text-[13px]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-line text-slate-950 font-bold">{msg.text}</div>
                    ) : (
                      <FormattedAiText text={msg.text} />
                    )}

                    {/* Hộp thoại hỏi hướng dẫn thao tác trực tiếp nếu là chỉ dẫn tính năng */}
                    {msg.tourId && (
                      <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#003B95]/40 via-amber-500/20 to-transparent border-2 border-amber-400/60 text-white shadow-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs">
                          <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                          <span>Chỉ dẫn trực tiếp từng bước (Live GPS)</span>
                        </div>
                        <p className="text-[12px] text-white font-medium leading-normal">
                          Bạn có muốn em lái màn hình và chỉ dẫn thao tác trực tiếp từng bước không ạ?
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleStartDirectTour(msg.tourId!, msg.route, msg.featureName)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-amber-300/80"
                          >
                            <span>👉 Có, hướng dẫn trực tiếp</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingTour(null)}
                            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors cursor-pointer"
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
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold py-1 bg-amber-400/10 px-3 rounded-xl border border-amber-400/30 w-fit">
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Trợ lý AI đang tra cứu và suy nghĩ...</span>
                </div>
              )}
            </div>

            {/* Quick Action Chips Gợi Ý */}
            <div className="p-3 border-t border-amber-500/20 bg-[#071731]/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Gợi ý câu hỏi nhanh:</span>
                </span>
                <span className="text-white text-[10px] font-medium opacity-80">Chạm vào để hỏi</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_PROMPTS.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickPromptClick(qp)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all bg-gradient-to-r ${qp.color} hover:brightness-125 active:scale-95 cursor-pointer shadow-sm`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{qp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Audio Visualizer Bar khi đang lắng nghe */}
            {isListening && (
              <div className="px-4 py-2 bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-t border-rose-500/40 flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    Đang nghe ({recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)...
                  </span>
                </div>

                {/* Sóng âm thanh nhảy theo âm lượng */}
                <div className="flex items-center gap-1 h-6">
                  {audioWaveLevel.map((height, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-amber-400 to-rose-400 transition-all duration-75"
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={stopListening}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] shadow flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Dừng & Gửi</span>
                </button>
              </div>
            )}

            {/* Voice Input & Text Input Bar */}
            <div className="p-3 sm:p-4 border-t border-amber-500/30 bg-[#06142A] flex flex-col gap-2">
              {statusMessage && !isListening && (
                <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Nút Micro Thu Âm Giọng Nói To Rõ */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`grid h-12 w-12 place-items-center rounded-2xl transition-all shrink-0 cursor-pointer shadow-lg ${
                    isListening
                      ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-pulse ring-2 ring-rose-400"
                      : "bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 ring-2 ring-amber-300/80 hover:scale-105 active:scale-95"
                  }`}
                  title={isListening ? "Dừng ghi âm và gửi" : "Bấm để nói bằng giọng nói"}
                >
                  {isListening ? (
                    <Square className="h-5 w-5 fill-current" />
                  ) : (
                    <Mic className="h-5 w-5 fill-current" />
                  )}
                </button>

                {/* Ô gõ tin nhắn sắc nét trắng tinh khiết */}
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
                        ? "Đang lắng nghe... Hãy nói câu hỏi của bạn"
                        : "Hỏi sự kiện, hội phí, đối tác hoặc 'Hướng dẫn tôi...'"
                    }
                    className="w-full h-12 rounded-2xl bg-[#081B38] border border-amber-400/50 px-3.5 pr-11 text-xs sm:text-sm text-white font-medium placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors shadow-inner"
                  />

                  {/* Nút Gửi */}
                  <button
                    type="button"
                    onClick={() => void submitPrompt(inputText || transcript)}
                    disabled={!inputText.trim() && !transcript.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-bold transition-all cursor-pointer shadow-md"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chú thích thông minh hướng dẫn dùng mic bàn phím */}
              <div className="flex items-center justify-between text-[10px] text-slate-300 px-1 pt-0.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Mẹo: Bạn cũng có thể bấm vào ô nhập và dùng phím Mic trên bàn phím điện thoại để nói siêu nhạy!</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
