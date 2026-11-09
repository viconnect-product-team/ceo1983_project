import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Brain,
  Layers,
  ChevronDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Database,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  Handshake,
  Calendar,
  Users,
  AlertCircle,
  ArrowUp,
  SlidersHorizontal,
  Bell,
  FileText,
  Briefcase,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { ViOneAiTutorGuide } from "../common/ViOneAiTutorGuide";

export type AiPersonaType = "general" | "opportunity" | "events" | "meetings" | "finance" | "documents";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  model?: string;
  latencyMs?: number;
  persona?: AiPersonaType;
  evidence?: Array<{ title: string; countOrVal: string; source: string }>;
  proactiveAlert?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  persona?: AiPersonaType;
}

const STORAGE_KEY = "ceo1983_crm_chatgpt_sessions_v2";

export const AI_PERSONAS = [
  {
    id: "general" as AiPersonaType,
    name: "Trợ Lý Tổng Thể",
    roleDesc: "Điều hành & Báo cáo toàn diện CRM",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    activeColor: "bg-amber-500 text-slate-950 font-bold",
    badge: "Bao quát toàn CLB",
    greeting: "Kính chào Quý Lãnh đạo! Tôi là Trợ Lý Điều Hành Cấp Cao CEO 1983. Tôi sẵn sàng hỗ trợ phân tích và cố vấn hoạt động hiệp hội.",
  },
  {
    id: "opportunity" as AiPersonaType,
    name: "AI Cơ Hội B2B",
    roleDesc: "Giám sát & Thông báo cơ hội mới",
    icon: Handshake,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/30",
    activeColor: "bg-orange-500 text-white font-bold",
    badge: "🔔 Tự động báo cơ hội mới",
    greeting: "Chào Anh/Chị! Tôi là Trợ Lý Phân Tích Cơ Hội Giao Thương B2B. Tôi luôn theo dõi các cơ hội mới đăng và chủ động thông báo cho Anh/Chị.",
  },
  {
    id: "events" as AiPersonaType,
    name: "AI Sự Kiện",
    roleDesc: "Nhắc lịch & Điều phối đại biểu",
    icon: Calendar,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    activeColor: "bg-rose-500 text-white font-bold",
    badge: "📅 Nhắc lịch trình & Check-in",
    greeting: "Chào Anh/Chị! Tôi là Trợ Lý Sự Kiện & Hội Thảo CEO 1983. Tôi chủ động theo dõi lịch trình các sự kiện sắp diễn ra.",
  },
  {
    id: "meetings" as AiPersonaType,
    name: "AI Cuộc Họp B2B",
    roleDesc: "Lịch hẹn 1-on-1 & Phòng họp",
    icon: Users,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
    activeColor: "bg-indigo-500 text-white font-bold",
    badge: "🤝 Nhắc cuộc gặp đối tác",
    greeting: "Chào Anh/Chị! Tôi là Trợ Lý Cuộc Họp & Lịch Hẹn CEO 1983. Tôi hỗ trợ điều phối các buổi kết nối giao thương giữa các CEO.",
  },
  {
    id: "finance" as AiPersonaType,
    name: "AI Tài Chính & Quỹ",
    roleDesc: "Đối soát thu chi & Sổ quỹ thật",
    icon: TrendingUp,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    activeColor: "bg-emerald-500 text-white font-bold",
    badge: "💰 Minh bạch số dư thật",
    greeting: "Chào Anh/Chị! Tôi là Trợ Lý Tài Chính & Quỹ Ngân Sách. Tôi đối soát dữ liệu thật từ sổ kế toán (105 triệu VNĐ khả dụng).",
  },
  {
    id: "documents" as AiPersonaType,
    name: "AI Tài Liệu",
    roleDesc: "Văn bản, Điều lệ & Quy chế",
    icon: FileText,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    activeColor: "bg-blue-500 text-white font-bold",
    badge: "📚 Tra cứu văn bản hiệp hội",
    greeting: "Chào Anh/Chị! Tôi là Trợ Lý Văn Bản & Tri Thức Hiệp Hội CEO 1983. Tôi quản lý hệ thống văn bản và tài liệu đã ban hành.",
  },
];

const FREE_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash (Free Tier)",
    provider: "Google AI Studio",
    icon: Zap,
    color: "text-amber-500",
    badge: "⚡ Siêu tốc • 1M context • Khuyên dùng",
    desc: "Mô hình miễn phí thế hệ mới nhất của Google, phân tích dữ liệu CRM cực nhanh và chính xác.",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek V3 / R1 (Free)",
    provider: "DeepSeek Open Source",
    icon: Brain,
    color: "text-blue-500",
    badge: "🧠 Tư duy sâu • Phân tích chiến lược",
    desc: "Mô hình mã nguồn mở hàng đầu, phân tích logic tài chính và bài toán quản trị xuất sắc.",
  },
  {
    id: "llama-3.3-70b",
    name: "Meta Llama 3.3 70B (Groq Free)",
    provider: "Meta AI & Groq",
    icon: Layers,
    color: "text-emerald-500",
    badge: "🦙 300 token/s • Xử lý văn bản tự nhiên",
    desc: "Mô hình siêu nhanh qua hạ tầng Groq LPU, tối ưu cho việc soạn thảo văn bản và thông báo.",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini (Free)",
    provider: "OpenAI Compatible",
    icon: Sparkles,
    color: "text-purple-500",
    badge: "💎 Trả lời súc tích • Chuẩn mực",
    desc: "Mô hình gọn nhẹ, trả lời chuẩn xác và tối ưu chi phí hạ tầng.",
  },
];

const QUICK_PROMPTS = [
  {
    icon: Sparkles,
    color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
    title: "Cố vấn Vốn & Thẩm Định Deal",
    desc: "Tôi có 50 triệu thì deal cơ hội nào phù hợp & phân tích lời lỗ",
    prompt: "Tôi có 50000000 đồng thì có cơ hội kinh doanh nào phù hợp và phân tích lời lỗ nếu deal cơ hội đó dựa vào hồ sơ năng lực của người đăng?",
    persona: "opportunity" as AiPersonaType,
  },
  {
    icon: Handshake,
    color: "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40",
    title: "Cơ hội B2B mới nhất",
    desc: "Kiểm tra cơ hội vừa đăng và ngân sách thực tế trong database",
    prompt: "Tôi muốn cập nhật các cơ hội giao thương B2B mới nhất vừa được đăng tải trên hệ thống, phân tích quy mô ngân sách và ngành nghề phù hợp.",
    persona: "opportunity" as AiPersonaType,
  },
  {
    icon: Calendar,
    color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
    title: "Sự kiện & Hội thảo",
    desc: "Nhắc nhở lịch trình các sự kiện sắp diễn ra và tình hình đăng ký",
    prompt: "Nhắc nhở cho tôi lịch trình các sự kiện sắp tới của CLB CEO 1983, địa điểm tổ chức và tiến độ chuẩn bị thẻ đại biểu QR Code.",
    persona: "events" as AiPersonaType,
  },
  {
    icon: TrendingUp,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
    title: "Đối soát Quỹ Ngân Sách",
    desc: "Trích xuất số dư tài chính thực tế 100% từ sổ kế toán",
    prompt: "Báo cáo chi tiết số dư quỹ hiệp hội và các giao dịch thực tế từ sổ kế toán, không lấy số liệu giả định.",
    persona: "finance" as AiPersonaType,
  },
  {
    icon: Users,
    color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40",
    title: "Cuộc họp & Kết nối B2B",
    desc: "Quản lý lịch hẹn 1-on-1 và gửi thông báo cho các bên",
    prompt: "Kiểm tra tình hình các cuộc hẹn kết nối B2B 1-on-1 giữa các CEO và hướng dẫn tôi lên lịch gặp gỡ đối tác mới.",
    persona: "meetings" as AiPersonaType,
  },
];

/**
 * Trình phân tích & hiển thị Markdown thuần an toàn (XSS-free)
 */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = (keyPrefix: number) => {
    if (inTable && tableHeader.length > 0) {
      renderedElements.push(
        <div key={`table-${keyPrefix}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold">
              <tr>
                {tableHeader.map((th, i) => (
                  <th key={i} className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-700">
                    {renderInlineFormatted(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-700 dark:text-slate-300">
                      {renderInlineFormatted(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  function renderInlineFormatted(text: string): React.ReactNode {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-slate-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return (
          <em key={idx} className="italic text-slate-600 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-primary font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // Table row detection
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

      const isDivider = cells.every((c) => /^:?-+:?$/.test(c));
      if (isDivider) return;

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // Header 3
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h3 key={idx} className="text-sm font-bold text-slate-950 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="size-4 text-amber-500 shrink-0" />
          <span>{renderInlineFormatted(line.replace("### ", ""))}</span>
        </h3>
      );
      return;
    }

    // Header 4
    if (line.startsWith("#### ")) {
      renderedElements.push(
        <h4 key={idx} className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1">
          {renderInlineFormatted(line.replace("#### ", ""))}
        </h4>
      );
      return;
    }

    // Bullet point
    if (line.startsWith("- ") || line.startsWith("* ")) {
      renderedElements.push(
        <div key={idx} className="flex items-start gap-2 my-1 pl-1">
          <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {renderInlineFormatted(line.slice(2))}
          </span>
        </div>
      );
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const numMatch = line.match(/^(\d+\.)\s(.*)$/);
      if (numMatch) {
        renderedElements.push(
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-xs font-bold text-primary shrink-0 min-w-[18px]">
              {numMatch[1]}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {renderInlineFormatted(numMatch[2])}
            </span>
          </div>
        );
        return;
      }
    }

    // Empty line
    if (!line) {
      renderedElements.push(<div key={idx} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    renderedElements.push(
      <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-0.5">
        {renderInlineFormatted(line)}
      </p>
    );
  });

  if (inTable) {
    flushTable(lines.length);
  }

  return <div className="space-y-0.5">{renderedElements}</div>;
}

export function CrmChatGPTView() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.0-flash");
  const [selectedPersona, setSelectedPersona] = useState<AiPersonaType>("general");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Khởi tạo sessions từ localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          if (parsed[0].persona) setSelectedPersona(parsed[0].persona);
          return;
        }
      }
    } catch {}

    const initialSession: ChatSession = {
      id: `sess_${Date.now()}`,
      title: "Cuộc trò chuyện mới",
      createdAt: new Date().toISOString(),
      messages: [],
      persona: "general",
    };
    setSessions([initialSession]);
    setCurrentSessionId(initialSession.id);
  }, []);

  // 2. Lưu sessions vào localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)));
      } catch {}
    }
  }, [sessions]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, currentSessionId, isGenerating]);

  // Lấy session hiện tại
  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Tạo session mới
  const handleNewChat = (personaType?: AiPersonaType) => {
    const targetPersona = personaType || selectedPersona;
    const personaObj = AI_PERSONAS.find((p) => p.id === targetPersona);
    const newSession: ChatSession = {
      id: `sess_${Date.now()}`,
      title: `Hội thoại ${personaObj?.name || 'Mới'}`,
      createdAt: new Date().toISOString(),
      messages: [],
      persona: targetPersona,
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSelectedPersona(targetPersona);
    setInputMessage("");
    setLiveAlert(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  // Chọn Persona
  const handleSelectPersona = async (persona: AiPersonaType) => {
    setSelectedPersona(persona);
    const personaObj = AI_PERSONAS.find((p) => p.id === persona);
    toast.info(`Đã chuyển sang vai trò: ${personaObj?.name}`);

    // Tự động kích hoạt câu chào chủ động & thông báo mới nhất từ database
    try {
      const res = await fetchNestApi<any>("/api/ai/crm/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Xin chào, hãy giới thiệu vai trò của bạn và báo cáo những cập nhật dữ liệu quan trọng nhất gần đây!",
          model: selectedModel,
          persona,
        }),
      });

      if (res?.ok && res?.reply) {
        if (res.proactiveAlert) {
          setLiveAlert(res.proactiveAlert);
        }

        const autoMsg: ChatMessage = {
          id: `msg_a_${Date.now()}`,
          role: "assistant",
          content: res.reply,
          createdAt: new Date().toISOString(),
          model: res.modelUsed || "CEO 1983 AI (Real Data)",
          persona,
          evidence: res.evidence || [],
          proactiveAlert: res.proactiveAlert,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  title: `${personaObj?.name || 'Trợ Lý'}: ${new Date().toLocaleDateString('vi-VN')}`,
                  persona,
                  messages: [...s.messages, autoMsg],
                }
              : s
          )
        );
      }
    } catch {}
  };

  // Xóa một session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallback: ChatSession = {
          id: `sess_${Date.now()}`,
          title: "Cuộc trò chuyện mới",
          createdAt: new Date().toISOString(),
          messages: [],
          persona: "general",
        };
        setCurrentSessionId(fallback.id);
        return [fallback];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
    toast.success("Đã xóa cuộc trò chuyện!");
  };

  // Xóa toàn bộ lịch sử
  const handleClearAllHistory = () => {
    if (window.confirm("Anh/Chị có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện AI không?")) {
      const fresh: ChatSession = {
        id: `sess_${Date.now()}`,
        title: "Cuộc trò chuyện mới",
        createdAt: new Date().toISOString(),
        messages: [],
        persona: "general",
      };
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Đã làm sạch toàn bộ lịch sử trò chuyện!");
    }
  };

  // Tự co giãn textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (textToSend?: string, overridePersona?: AiPersonaType) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText || isGenerating || !currentSessionId) return;

    const usePersona = overridePersona || selectedPersona;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
      persona: usePersona,
    };

    const shouldUpdateTitle = messages.length === 0;
    const newTitle = shouldUpdateTitle ? messageText.slice(0, 32) + (messageText.length > 32 ? "..." : "") : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: newTitle,
              persona: usePersona,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );

    setInputMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsGenerating(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetchNestApi<any>("/api/ai/crm/chat", {
        method: "POST",
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
          model: selectedModel,
          persona: usePersona,
        }),
      });

      if (res?.ok && res?.reply) {
        if (res.proactiveAlert) {
          setLiveAlert(res.proactiveAlert);
        }

        const assistantMsg: ChatMessage = {
          id: `msg_a_${Date.now()}`,
          role: "assistant",
          content: res.reply,
          createdAt: new Date().toISOString(),
          model: res.modelUsed || "Gemini 2.0 Flash (Free)",
          latencyMs: res.latencyMs || 250,
          persona: usePersona,
          evidence: res.evidence || [],
          proactiveAlert: res.proactiveAlert,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: [...s.messages, assistantMsg],
                }
              : s
          )
        );
      } else {
        toast.error("Không nhận được phản hồi từ AI");
      }
    } catch (e: any) {
      toast.error(`Lỗi kết nối Trợ lý AI: ${e?.message || "Vui lòng thử lại"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(content);
      toast.success("Đã sao chép nội dung vào bộ nhớ tạm!");
    }
  };

  const activeModelObj = FREE_MODELS.find((m) => m.id === selectedModel) || FREE_MODELS[0];
  const ActiveModelIcon = activeModelObj.icon;
  const activePersonaObj = AI_PERSONAS.find((p) => p.id === selectedPersona) || AI_PERSONAS[0];
  const ActivePersonaIcon = activePersonaObj.icon;

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[620px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
      {/* 1. SIDEBAR PHIÊN HỘI THOẠI (CHATGPT HISTORY) */}
      <div className="w-64 sm:w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col justify-between hidden md:flex">
        {/* Nút Tạo Cuộc Trò Chuyện Mới */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 space-y-2">
          <button
            type="button"
            onClick={() => handleNewChat()}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-primary group-hover:rotate-90 transition-transform" />
              <span>Cuộc trò chuyện mới</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              ⌘N
            </span>
          </button>
        </div>

        {/* Danh sách Sessions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Lịch sử theo vai trò
          </div>
          {sessions.map((s) => {
            const isActive = s.id === currentSessionId;
            const pObj = AI_PERSONAS.find((p) => p.id === s.persona) || AI_PERSONAS[0];
            const PIcon = pObj.icon;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSessionId(s.id);
                  if (s.persona) setSelectedPersona(s.persona);
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-primary font-bold shadow-2xs border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                  <PIcon className={`size-3.5 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                  <span className="truncate">{s.title || "Cuộc trò chuyện mới"}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title="Xóa phiên này"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 rounded transition shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Chân Sidebar: Quota & Nút dọn dẹp */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dữ liệu điều hành cập nhật</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">Thời gian thực</span>
          </div>
          <button
            type="button"
            onClick={handleClearAllHistory}
            className="w-full text-center text-[10px] text-slate-500 hover:text-rose-500 py-1 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 className="size-3" />
            <span>Xóa toàn bộ lịch sử</span>
          </button>
        </div>
      </div>

      {/* 2. KHUNG CHAT TRUNG TÂM (CHAT STREAM & INPUT) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0">
        {/* Header Bar: Model Selector + Persona Selector */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs z-10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ActiveModelIcon className={`size-4 ${activeModelObj.color}`} />
                <span>{activeModelObj.name}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>

              {modelDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Mô hình miễn phí (Free Tier)
                  </div>
                  {FREE_MODELS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = m.id === selectedModel;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          setModelDropdownOpen(false);
                          toast.success(`Đã chuyển sang mô hình: ${m.name}`);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 text-primary font-bold border border-primary/20"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Icon className={`size-4 ${m.color} shrink-0 mt-0.5`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{m.name}</span>
                            {isSelected && <Check className="size-3.5 text-primary" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTutorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
                title="Mở hướng dẫn thao tác CRM tương tác từng bước"
              >
                <Bot className="size-3.5" />
                <span>AI Hướng Dẫn Thao Tác</span>
              </button>
              <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <Database className="size-3" />
                <span>Dữ Liệu Chuẩn Xác</span>
              </span>
              <button
                type="button"
                onClick={() => handleNewChat()}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer md:hidden"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Persona Tabs (Thanh chọn vai trò chuyên biệt) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {AI_PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? `${p.activeColor} border-transparent shadow-xs scale-102`
                      : `bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800`
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Proactive Alert Banner (Nếu có) */}
        {liveAlert && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 animate-fade-in">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Bell className="size-4 text-amber-500 shrink-0 animate-bounce" />
              <div className="truncate">{liveAlert}</div>
            </div>
            <button
              type="button"
              onClick={() => setLiveAlert(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            // Welcome & Quick Prompts
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center py-6 sm:py-8 text-center">
              <div className="size-14 sm:size-16 rounded-3xl bg-gradient-to-tr from-primary to-amber-500 mx-auto grid place-items-center text-white shadow-lg shadow-primary/20 mb-3 animate-bounce-subtle">
                <ActivePersonaIcon className="size-7 sm:size-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {activePersonaObj.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
                {activePersonaObj.roleDesc}. Phân tích và cố vấn số liệu thực tế của Hiệp hội Doanh nhân CEO 1983.
              </p>

              {/* 4 Thẻ gợi ý bắt đầu nhanh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 text-left">
                {QUICK_PROMPTS.map((qp, i) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(qp.prompt, qp.persona)}
                      className={`p-3.5 rounded-2xl border bg-gradient-to-br transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-left ${qp.color}`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Icon className="size-4 shrink-0" />
                        <span>{qp.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {qp.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Message List
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const pObj = AI_PERSONAS.find((p) => p.id === msg.persona) || activePersonaObj;
                const PIcon = pObj.icon;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-amber-500 grid place-items-center text-white shrink-0 shadow-sm mt-0.5">
                        <PIcon className="size-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                        isUser
                          ? "bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-2xs space-y-3"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] text-primary font-bold">
                            <PIcon className="size-3" />
                            <span>{pObj.name}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-muted-foreground font-normal">Real Database Analysis</span>
                          </div>

                          <MarkdownRenderer content={msg.content} />

                          {/* Evidence & Action footer */}
                          {msg.evidence && msg.evidence.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                              {msg.evidence.map((ev, evIdx) => (
                                <span
                                  key={evIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                                >
                                  <Database className="size-2.5 text-primary" />
                                  <span>{ev.title}: <strong>{ev.countOrVal}</strong></span>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-mono">{msg.model || "Gemini 2.0 Flash"} • {msg.latencyMs || 250}ms</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.content)}
                                title="Sao chép nội dung"
                                className="hover:text-foreground flex items-center gap-1 transition"
                              >
                                <Copy className="size-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Generating loading bubble */}
              {isGenerating && (
                <div className="flex items-start gap-3 justify-start animate-fade-in">
                  <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-amber-500 grid place-items-center text-white shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="size-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl p-4 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs flex items-center gap-2 text-slate-500">
                    <div className="flex gap-1">
                      <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                      <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>{activePersonaObj.name} đang tổng hợp và phân tích dữ liệu điều hành...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 3. FLOATING INPUT BAR PHONG CÁCH CHATGPT */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xs">
          <div className="max-w-3xl mx-auto relative rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={`Hỏi ${activePersonaObj.name}... (Shift + Enter để xuống dòng, Enter để gửi)`}
              className="w-full px-4 py-3 text-xs bg-transparent border-none outline-none resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 max-h-44 min-h-[44px]"
            />
            <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-primary">{activePersonaObj.name}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeModelObj.name}</span>
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isGenerating}
                className="size-7 rounded-xl bg-primary text-primary-foreground grid place-items-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              >
                <ArrowUp className="size-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            CEO 1983 AI — Nền tảng Trợ lý Điều hành & Cố vấn Chuyên sâu Hiệp hội Doanh nhân CEO 1983.
          </p>
        </div>
      </div>

      {/* MODAL HƯỚNG DẪN THAO TÁC CRM TƯƠNG TÁC TỪNG BƯỚC */}
      <ViOneAiTutorGuide
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        systemType="crm"
      />
    </div>
  );
}
