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

// OpenRouter API Configuration & Free Model Fallback Hierarchy
const OPENROUTER_API_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENROUTER_API_KEY) || "";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-r1:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
  "google/gemini-2.0-flash-001",
  "openai/gpt-4o-mini",
];

export function isVoiceAiEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const val1 = localStorage.getItem(VOICE_AI_STORAGE_KEY);
  const val2 = localStorage.getItem("ceo1983_ai_assistant_enabled");
  if (val1 === "false" || val2 === "false") return false;
  return true;
}

export function setVoiceAiEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  const str = enabled ? "true" : "false";
  localStorage.setItem(VOICE_AI_STORAGE_KEY, str);
  localStorage.setItem("ceo1983_ai_assistant_enabled", str);
  window.dispatchEvent(new Event(VOICE_AI_EVENT_NAME));
  window.dispatchEvent(new Event("ceo1983_ai_toggle"));
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
    label: "Sự kiện tôi đã đăng ký",
    query: "Tôi có đăng ký sự kiện nào không?",
    icon: Calendar,
    route: "/association/events",
  },
  {
    label: "Cơ hội tôi quan tâm",
    query: "Tôi có quan tâm cơ hội giao thương nào không?",
    icon: Handshake,
    route: "/association/opportunities",
  },
  {
    label: "Bạn bè & kết nối của tôi",
    query: "Tôi có bao nhiêu bạn bè và kết nối trong CLB CEO 1983?",
    icon: Users,
    route: "/association/members",
  },
  {
    label: "Lịch hẹn kết nối B2B",
    query: "Tôi có cuộc gặp kết nối nào sắp tới không?",
    icon: MessageSquare,
    route: "/association/business-cards",
  },
  {
    label: "Hóa đơn / Hội phí cần đóng",
    query: "Tôi có hóa đơn hay khoản hội phí nào phải thanh toán không?",
    icon: CreditCard,
    route: "/association/renew/pay",
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

  // Floating button position, dragging & quick close
  const [btnPos, setBtnPos] = useState<{ x?: number; y?: number }>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("ceo1983_ai_btn_pos");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("ceo1983_ai_dismissed") === "true";
    } catch {}
    return false;
  });
  const [aiActive, setAiActive] = useState<boolean>(() => isVoiceAiEnabled());

  useEffect(() => {
    const handleSync = () => {
      setAiActive(isVoiceAiEnabled());
    };
    window.addEventListener(VOICE_AI_EVENT_NAME, handleSync);
    window.addEventListener("ceo1983_ai_toggle", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(VOICE_AI_EVENT_NAME, handleSync);
      window.removeEventListener("ceo1983_ai_toggle", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: btnPos.x ?? rect.left,
      posY: btnPos.y ?? rect.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }
    const maxX = window.innerWidth - 68;
    const maxY = window.innerHeight - 84;
    const newX = Math.max(8, Math.min(maxX, dragStartRef.current.posX + dx));
    const newY = Math.max(8, Math.min(maxY, dragStartRef.current.posY + dy));
    setBtnPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (hasDraggedRef.current && btnPos.x !== undefined && btnPos.y !== undefined) {
      localStorage.setItem("ceo1983_ai_btn_pos", JSON.stringify(btnPos));
    }
  };

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
    interestedOpportunities: any[];
    connectedCount: number;
    connectedMembers: any[];
    totalMembersCount: number;
    b2bMeetings: any[];
    invoices: any[];
  }>({
    memberProfile: null,
    upcomingEvents: [],
    registeredEvents: [],
    opportunities: [],
    interestedOpportunities: [],
    connectedCount: 0,
    connectedMembers: [],
    totalMembersCount: 120,
    b2bMeetings: [],
    invoices: [],
  });

  // Load dynamic context whenever chat opens or user changes
  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadContext() {
      try {
        // Ngữ cảnh THẬT của tài khoản từ backend (không dùng dữ liệu mẫu)
        const [ctxRes, quotaRes] = await Promise.all([
          fetchNestApi<any>("/ai/live-context").catch(() => null),
          fetchNestApi<any>("/ai/quota").catch(() => null),
        ]);
        const ctx: any = ctxRes?.data && ctxRes?.data?.user ? ctxRes.data : ctxRes;
        const fmtVnd = (n: number) => `${new Intl.NumberFormat("vi-VN").format(Number(n) || 0)} đ`;

        const profileData = ctx?.user
          ? {
              name: ctx.user.name,
              company: ctx.user.company,
              code: ctx.user.code,
              role: ctx.roleLabel || "Hội viên",
              title: ctx.user.title,
              email: ctx.user.email,
            }
          : {
              name: user?.name || "Anh/Chị",
              company: (user as any)?.company || "",
              code: (user as any)?.member_code || "",
              role: (user as any)?.role || "Hội viên",
              title: "",
              email: user?.email || "",
            };

        const registered = Array.isArray(ctx?.myEvents)
          ? ctx.myEvents.map((e: any) => ({
              id: e.eventId,
              title: e.name,
              date: e.date,
              time: e.time,
              place: e.location,
              registered: true,
            }))
          : [];
        const upcoming = Array.isArray(ctx?.topEvents)
          ? ctx.topEvents.map((e: any) => ({
              id: e.id,
              title: e.name,
              date: e.date,
              place: e.location,
              registered: registered.some((r: any) => r.id === e.id),
            }))
          : [];
        const mapOpp = (o: any) => ({
          id: o.id,
          title: o.title,
          company: "",
          tag: o.status || "Cơ hội B2B",
          value: o.deadline ? `Hạn ${o.deadline}` : "Thỏa thuận",
        });
        const meetings = Array.isArray(ctx?.myMeetings)
          ? ctx.myMeetings.map((m: any) => ({
              id: m.id,
              topic: m.title || "Cuộc hẹn B2B",
              partnerName: "",
              partnerCompany: "",
              time: m.startAt ? new Date(m.startAt).toLocaleString("vi-VN") : "Chưa chốt giờ",
              location: "",
              status: m.status,
              upcoming: !!m.upcoming,
            }))
          : [];
        const invoices = Array.isArray(ctx?.dues?.unpaidInvoices)
          ? ctx.dues.unpaidInvoices.map((i: any) => ({
              id: i.invoiceNo,
              title: `Hội phí${i.year ? ` năm ${i.year}` : ""}${i.invoiceNo ? ` (${i.invoiceNo})` : ""}`,
              amount: fmtVnd(i.amount),
              dueDate: i.dueDate || "",
              status: i.status,
              note: `${profileData.code || ""} HP${i.year || ""}`.trim(),
            }))
          : [];

        if (active) {
          if (quotaRes?.data) {
            setQuota(quotaRes.data);
          }
          setLiveContext({
            memberProfile: profileData,
            upcomingEvents: upcoming,
            registeredEvents: registered,
            opportunities: Array.isArray(ctx?.myOpportunities) ? ctx.myOpportunities.map(mapOpp) : [],
            interestedOpportunities: Array.isArray(ctx?.interestedOpportunities)
              ? ctx.interestedOpportunities.map(mapOpp)
              : [],
            connectedCount: Number(ctx?.connections?.friendsCount || 0),
            connectedMembers: [],
            totalMembersCount: 0,
            b2bMeetings: meetings,
            invoices,
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
          content: `Xin chào **${memberName}**! 👋\n\nEm là **Trợ lý AI Doanh Nhân CEO 1983**. Em có thể giải đáp chi tiết theo đúng tài khoản của Anh/Chị:\n\n- 🎟️ **Sự kiện đã đăng ký & vé tham dự**\n- 💼 **Cơ hội kinh doanh B2B đang quan tâm**\n- 👥 **Số lượng bạn bè & kết nối trong danh bạ**\n- 🤝 **Lịch hẹn gặp kết nối Cafe B2B sắp tới**\n- 💳 **Hóa đơn & hội phí niên liễm cần thanh toán**\n- 🏛️ **Cơ cấu tổ chức & nhiệm vụ các Ban chuyên môn**\n\nAnh/Chị cần em tra cứu nội dung gì ạ?`,
          timestamp: Date.now(),
          suggestions: [
            "Tôi đăng ký sự kiện nào không?",
            "Tôi có quan tâm cơ hội nào không?",
            "Tôi có bao nhiêu bạn bè?",
            "Tôi có cuộc gặp kết nối nào không?",
            "Tôi có hóa đơn nào phải thanh toán?",
          ],
        },
      ]);
    }
  }, [user?.name, liveContext.memberProfile, messages.length]);

  // Comprehensive Smart Local Evaluator (Dynamic ground-truth account engine)
  const evaluateDynamicAccountQuery = (
    promptText: string
  ): { text: string; actionLink?: { label: string; route: string }; suggestions?: string[] } => {
    const q = promptText.toLowerCase().trim();
    const p = liveContext.memberProfile;
    const name = p?.name || user?.name || "Anh/Chị";
    const norm = q
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[?!.,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 0. Câu hỏi về chính trợ lý ("bạn làm được gì", "bạn là ai") / chào hỏi
    if (
      /\b(ban|em|tro ly|ai|bot)\b.*\b(lam (duoc )?gi|giup (duoc )?gi|ho tro (duoc )?gi|co the lam gi|biet lam gi|chuc nang gi|tinh nang gi)\b/.test(norm) ||
      /\b(ban|em) (la ai|la gi)\b/.test(norm) ||
      /^(xin chao|chao|chao ban|chao em|hello|hi|alo)( ban| em)?$/.test(norm)
    ) {
      const unpaid = liveContext.invoices.length;
      return {
        text:
          `Dạ em là **Trợ lý AI CLB Doanh Nhân CEO 1983**, nắm dữ liệu tài khoản của Anh/Chị **${name}**. Em có thể:\n\n` +
          `1. 📊 Tra cứu tài khoản: sự kiện đã đăng ký, hội phí/hóa đơn, bạn bè kết nối, lịch hẹn B2B, cơ hội quan tâm, sản phẩm.\n` +
          `2. 🔎 Tìm hội viên, sản phẩm, cơ hội, sự kiện, văn bản, thông tin các Ban.\n` +
          `3. 🧭 Hướng dẫn & mở nhanh mọi tính năng trong app.\n\n` +
          `**Tình hình hiện tại:** ${liveContext.registeredEvents.length} sự kiện đã đăng ký • ${liveContext.connectedCount} bạn bè • ${liveContext.b2bMeetings.filter((m: any) => m.upcoming).length} lịch hẹn sắp tới • ${unpaid} hóa đơn chưa thanh toán.\n\nAnh/Chị cần em hỗ trợ gì ạ?`,
        suggestions: ["Sự kiện tôi đã đăng ký?", "Tôi có bao nhiêu bạn bè?", "Tôi có hóa đơn nào chưa thanh toán?"],
      };
    }

    // 1. Events registered / interested
    if (
      q.includes("sự kiện") ||
      q.includes("event") ||
      q.includes("đăng ký") ||
      q.includes("tham gia") ||
      q.includes("vé")
    ) {
      if (q.includes("tôi") || q.includes("đăng ký") || q.includes("quan tâm") || q.includes("đã")) {
        const reg = liveContext.registeredEvents;
        if (reg.length > 0) {
          const listStr = reg
            .map(
              (e, idx) =>
                `${idx + 1}. 🎟️ **${e.title}**\n   - ⏰ Thời gian: **${e.time || e.date || "Sắp diễn ra"}**\n   - 📍 Địa điểm: **${e.place || "Hà Nội"}**\n   - 🛡️ Trạng thái vé: **Đã xác nhận (Có mã QR Check-in)**`
            )
            .join("\n\n");

          return {
            text: `Dạ báo cáo Anh/Chị **${name}**, hiện tại tài khoản của Anh/Chị đang đăng ký tham dự **${reg.length} sự kiện** sau:\n\n${listStr}\n\n💡 *Lưu ý*: Anh/Chị chỉ cần xuất trình mã QR vé điện tử trong ứng dụng tại bàn lễ tân để điểm danh check-in tự động nhé!`,
            actionLink: { label: "Mở Lịch Sự Kiện & QR Vé", route: "/association/events" },
            suggestions: ["Lịch hẹn kết nối B2B", "Tôi có bao nhiêu bạn bè?", "Hóa đơn phải thanh toán?"],
          };
        } else {
          return {
            text: `Dạ hiện tại hệ thống ghi nhận Anh/Chị **chưa đăng ký** sự kiện nào.${liveContext.upcomingEvents.length ? `\n\nSự kiện nổi bật của CLB:\n${liveContext.upcomingEvents.slice(0, 3).map((e: any) => `- **${e.title}** (${e.date || "sắp diễn ra"}${e.place ? ` tại ${e.place}` : ""})`).join("\n")}` : ""}\n\nAnh/Chị bấm nút bên dưới để xem và đăng ký nhé ạ!`,
            actionLink: { label: "Xem & Đăng Ký Sự Kiện", route: "/association/events" },
          };
        }
      } else {
        const up = liveContext.upcomingEvents;
        const listStr = up
          .map(
            (e, idx) =>
              `${idx + 1}. 📅 **${e.title}**\n   - Ngày: **${e.date || e.time}** | Địa điểm: **${e.place || "Hà Nội"}**`
          )
          .join("\n\n");
        return {
          text: `Dạ lịch sự kiện sắp diễn ra của CLB Doanh Nhân CEO 1983 gồm có:\n\n${listStr}\n\nAnh/Chị có thể đăng ký vé tham dự trực tiếp trên ứng dụng ạ!`,
          actionLink: { label: "Mở Danh Sách Sự Kiện", route: "/association/events" },
        };
      }
    }

    // 2. Opportunities interested / saved / trading
    if (
      q.includes("cơ hội") ||
      q.includes("giao thương") ||
      q.includes("b2b") ||
      q.includes("kinh doanh") ||
      q.includes("chào mua") ||
      q.includes("chào bán")
    ) {
      const interested = liveContext.interestedOpportunities;
      if (interested.length > 0) {
        const listStr = interested
          .map(
            (o, idx) =>
              `${idx + 1}. 💼 **${o.title}**\n   - 🏢 Doanh nghiệp: **${o.company}**\n   - 🏷️ Phân loại: **${o.tag || "Cơ hội B2B"}** | Giá trị: **${o.value || "Thỏa thuận"}**\n   - ⭐ Trạng thái: **Đang quan tâm / Đã lưu theo dõi**`
          )
          .join("\n\n");

        return {
          text: `Dạ thưa Anh/Chị **${name}**, hệ thống ghi nhận Anh/Chị đang theo dõi và quan tâm **${interested.length} cơ hội giao thương B2B** sau:\n\n${listStr}\n\nAnh/Chị có thể liên hệ trực tiếp với doanh nghiệp đối tác hoặc kết nối qua Ban Xúc Tiến Thương Mại nhé!`,
          actionLink: { label: "Vào Sàn Giao Thương B2B", route: "/association/opportunities" },
          suggestions: ["Tôi có cuộc gặp kết nối nào không?", "Tôi có bao nhiêu bạn bè?", "Sự kiện tôi đã đăng ký"],
        };
      } else {
        return {
          text: `Dạ hiện tại Anh/Chị chưa đánh dấu quan tâm bài đăng cụ thể nào trên Sàn Giao Thương B2B.\n\nHiện tại sàn đang có **${liveContext.opportunities.length} tin chào mua & chào bán mới** từ các thành viên CLB CEO 1983. Anh/Chị bấm vào sàn để kết nối hợp tác nhé!`,
          actionLink: { label: "Khám Phá Sàn B2B", route: "/association/opportunities" },
        };
      }
    }

    // 3. Friends & Connections
    if (
      q.includes("bạn bè") ||
      q.includes("kết nối") ||
      q.includes("kết bạn") ||
      q.includes("danh bạ") ||
      q.includes("đồng nghiệp")
    ) {
      const connCount = liveContext.connectedCount;
      return {
        text: `Dạ báo cáo Anh/Chị **${name}**: hiện Anh/Chị có **${connCount} bạn bè / đối tác đã kết nối** trong CLB Doanh Nhân CEO 1983.${connCount === 0 ? "\n\nAnh/Chị có thể mở Danh bạ Hội viên để gửi lời mời kết nối nhé!" : ""}`,
        actionLink: { label: "Xem Danh Bạ Hội Viên", route: "/association/members" },
        suggestions: ["Tôi có cuộc gặp kết nối nào không?", "Tôi có hóa đơn nào phải thanh toán?", "Cơ cấu các Ban chuyên môn"],
      };
    }

    // 4. B2B Meetings / Appointments
    if (
      q.includes("cuộc gặp") ||
      q.includes("cuộc hẹn") ||
      q.includes("hẹn gặp") ||
      q.includes("meeting") ||
      q.includes("cafe") ||
      q.includes("lịch hẹn")
    ) {
      const meetings = liveContext.b2bMeetings;
      if (meetings.length > 0) {
        const listStr = meetings
          .map(
            (m, idx) =>
              `${idx + 1}. 🤝 **${m.topic}**\n   - ⏰ Thời gian: **${m.time}**\n   - 🟢 Trạng thái: **${m.status || "đã lên lịch"}**${m.upcoming ? " (sắp tới)" : ""}`
          )
          .join("\n\n");

        return {
          text: `Dạ báo cáo Anh/Chị **${name}**, Anh/Chị có **${meetings.length} cuộc hẹn B2B** (sắp tới: ${meetings.filter((m: any) => m.upcoming).length}):\n\n${listStr}`,
          actionLink: { label: "Mở Danh Thiếp & Lịch Hẹn", route: "/association/business-cards" },
          suggestions: ["Sự kiện tôi đã đăng ký", "Tôi có bao nhiêu bạn bè?", "Hóa đơn phải thanh toán?"],
        };
      } else {
        return {
          text: `Dạ hiện tại Anh/Chị chưa có lịch hẹn gặp B2B mới nào được lên lịch.\n\nAnh/Chị có thể chủ động tìm đối tác trong **Danh bạ Hội viên** và bấm nút gửi lời mời hẹn Cafe giao thương 1-on-1 nhé!`,
          actionLink: { label: "Đặt Lịch Hẹn B2B", route: "/association/members" },
        };
      }
    }

    // 5. Invoices / Fees / Dues
    if (
      q.includes("hóa đơn") ||
      q.includes("thanh toán") ||
      q.includes("hội phí") ||
      q.includes("niên liễm") ||
      q.includes("công nợ") ||
      q.includes("tiền") ||
      q.includes("fee") ||
      q.includes("đóng tiền")
    ) {
      const invs = liveContext.invoices;
      if (invs.length === 0) {
        return {
          text: `Dạ thưa Anh/Chị **${name}**, tài khoản hiện **không có hóa đơn / hội phí nào chưa thanh toán** ✅.`,
          actionLink: { label: "Xem Hội Phí", route: "/association/profile" },
          suggestions: ["Sự kiện tôi đã đăng ký", "Tôi có bao nhiêu bạn bè?"],
        };
      }
      const listStr = invs
        .map((i: any, idx: number) => `${idx + 1}. 💳 **${i.title}** — **${i.amount}**${i.dueDate ? ` (hạn ${i.dueDate})` : ""}`)
        .join("\n");
      return {
        text: `Dạ thưa Anh/Chị **${name}**, tài khoản có **${invs.length} hóa đơn chưa thanh toán**:\n\n${listStr}\n\nAnh/Chị bấm nút bên dưới để thanh toán qua VietQR ạ!`,
        actionLink: { label: "Xem & Thanh Toán Hội Phí", route: "/association/renew/pay" },
        suggestions: ["Sự kiện tôi đã đăng ký", "Tôi có bao nhiêu bạn bè?", "Cơ hội tôi quan tâm"],
      };
    }

    // 6. Committee structure & Roles
    if (/(^|\s)ban(\s|$)/.test(norm.replace(/ban be/g, "")) && /(co cau|chuyen mon|to chuc|cac ban|ban nao)/.test(norm)) {
      return {
        text: `Dạ cơ cấu tổ chức CLB Doanh Nhân CEO 1983 trực thuộc HanoiBA gồm **6 Ban chuyên môn cốt lõi**:\n\n1. 🏛️ **Ban Điều Hành**: Lãnh đạo chung, định hướng chiến lược và đại diện CLB.\n2. 👥 **Ban Thành Viên**: Phát triển mạng lưới, thẩm định hồ sơ kết nạp và chăm sóc hội viên.\n3. 💼 **Ban Xúc Tiến Thương Mại**: Điều phối giao thương B2B, tổ chức phiên kết nối cung cầu.\n4. 📢 **Ban Truyền Thông**: Quảng bá hình ảnh, phụ trách Caravan, Gala và bản tin số.\n5. 💰 **Ban Tài Chính**: Quản trị ngân sách, quỹ CLB và thu hội phí niên liễm.\n6. ❤️ **Ban Thiện Nguyện**: Tổ chức các chương trình an sinh xã hội, vì cộng đồng vùng cao.\n\nMọi hoạt động và phê duyệt đều được phân quyền chặt chẽ trên hệ thống số hóa của CLB ạ!`,
        actionLink: { label: "Xem Danh Bạ & Ban Chuyên Môn", route: "/association/members" },
        suggestions: ["Ban chấp hành gồm ai?", "Ban truyền thông làm gì?", "Hội phí bao nhiêu?"],
      };
    }

    // 7. Identity & Business card
    if (q.includes("tôi là ai") || q.includes("tài khoản của tôi") || q.includes("thông tin của tôi") || q.includes("hồ sơ")) {
      return {
        text: `Dạ thông tin tài khoản hội viên của Anh/Chị trên hệ thống:\n\n👤 **Họ và tên**: **${name}**\n🔖 **Mã hội viên**: \`${p?.code || "CEO-1983-001"}\`\n🏢 **Doanh nghiệp**: **${p?.company}**\n💼 **Chức vụ**: **${p?.title}**\n🛡️ **Vai trò hệ thống**: **${p?.role || "Quản trị viên / Hội viên chính thức"}**\n📱 **Điện thoại**: **${p?.phone}** | ✉️ **Email**: **${p?.email}**\n\nAnh/Chị có thể quản lý và chia sẻ mã QR danh thiếp số bất cứ lúc nào!`,
        actionLink: { label: "Mở Danh Thiếp Cá Nhân", route: "/association/card" },
      };
    }

    // 8. Board of Directors / Leadership
    if (
      norm.includes("chu tich") ||
      norm.includes("pho chu tich") ||
      norm.includes("tong thu ky") ||
      norm.includes("ban chap hanh") ||
      norm.includes("lanh dao") ||
      norm.includes("bch")
    ) {
      return {
        text: `Dạ Ban Chấp Hành CLB Doanh Nhân CEO 1983 nhiệm kỳ hiện tại gồm các lãnh đạo tâm huyết:\n\n` +
          `👑 **Chủ tịch**: **Chị Lê Thị Dung** (Tổng Giám Đốc DGroup)\n` +
          `⭐ **Các Phó Chủ tịch**:\n` +
          `  - **Anh Hoàng Thanh Tuấn** (Phó Chủ tịch Thường trực)\n` +
          `  - **Anh Nguyễn Thanh Tuấn** (Phó Chủ tịch)\n` +
          `  - **Anh Nguyễn Trung Kiên** (Phó Chủ tịch)\n` +
          `  - **Anh Đỗ Minh Thành** (Phó Chủ tịch)\n` +
          `  - **Anh Nguyễn Thế Duẩn** (Phó Chủ tịch)\n` +
          `📜 **Tổng thư ký**: **Anh Nguyễn Đình Toản** (Trưởng ban Thư ký)\n\n` +
          `Ban Chấp Hành luôn sát cánh cùng hơn 200 doanh nhân tuổi Quý Hợi 1983 phát triển bền vững và gắn kết!`,
        actionLink: { label: "Xem Danh Bạ & Ban Chuyên Môn", route: "/association/members" },
        suggestions: ["Ban truyền thông làm gì?", "Hội phí bao nhiêu?", "Lịch sự kiện sắp tới"],
      };
    }

    // 9. 4 Specialized Departments Details
    if (
      norm.includes("ban truyen thong") ||
      norm.includes("ban thanh vien") ||
      norm.includes("ban xuc tien") ||
      norm.includes("ban thu ky")
    ) {
      if (norm.includes("truyen thong")) {
        return {
          text: `📢 **Ban Truyền Thông CLB CEO 1983**:\n\n` +
            `- Phụ trách truyền thông thương hiệu, sự kiện, bản tin số và thông báo đẩy tới hội viên.\n` +
            `- Quản trị và cập nhật **Kho ảnh sự kiện Google Drive** chất lượng cao sau mỗi chương trình Caravan, Gala, Forum.\n` +
            `- Điều phối nội dung tin tức và ấn phẩm truyền thông toàn diện.`,
          actionLink: { label: "Xem Tin Tức & Sự Kiện", route: "/association/events" },
        };
      }
      if (norm.includes("thanh vien")) {
        return {
          text: `👥 **Ban Thành Viên CLB CEO 1983**:\n\n` +
            `- Tiếp nhận và thẩm định hồ sơ kết nạp doanh nhân mới.\n` +
            `- Quản trị danh bạ hội viên, chăm sóc ngày sinh nhật và lễ kỷ niệm.\n` +
            `- Theo dõi gia hạn hội viên và cung cấp **Template Hồ sơ Doanh Nghiệp 3D** cao cấp cho các thành viên.`,
          actionLink: { label: "Xem Danh Bạ Thành Viên", route: "/association/members" },
        };
      }
      if (norm.includes("xuc tien")) {
        return {
          text: `💼 **Ban Xúc Tiến Thương Mại CLB CEO 1983**:\n\n` +
            `- Điều phối các cơ hội giao thương B2B, phiên chợ Marketplace nội bộ.\n` +
            `- Kết nối các cặp doanh nghiệp đối tác, hỗ trợ báo giá VIP và xúc tiến hợp đồng liên kết.\n` +
            `- Thúc đẩy tiêu dùng chéo và gia tăng doanh số trong cộng đồng 1983.`,
          actionLink: { label: "Khám Phá Sàn B2B", route: "/association/opportunities" },
        };
      }
      if (norm.includes("thu ky")) {
        return {
          text: `🏛️ **Ban Thư Ký & Ban Điều Hành CLB CEO 1983**:\n\n` +
            `- Lên lịch và tổ chức các cuộc họp Ban Chấp Hành (cả hình thức Offline tại trụ sở và Online).\n` +
            `- Soạn thảo, ban hành và lưu trữ các văn bản, nghị quyết, điều lệ Hiệp hội.\n` +
            `- Quản trị phân quyền tài liệu Hiệp Hội và bảo mật thông tin nội bộ.`,
          actionLink: { label: "Xem Lịch Họp & Văn Bản", route: "/association/library" },
        };
      }
    }

    // 10. Dues policy & Bank details
    if (
      norm.includes("hoi phi bao nhieu") ||
      norm.includes("dong tien") ||
      norm.includes("so tai khoan") ||
      norm.includes("ngan hang") ||
      norm.includes("chuyen khoan") ||
      norm.includes("quy dinh hoi phi")
    ) {
      return {
        text: `💳 **Quy Chế Hội Phí Thường Niên CLB Doanh Nhân CEO 1983**:\n\n` +
          `- **Mức hội phí**: **10.000.000 VNĐ / năm**.\n` +
          `- **Ngân hàng thụ hưởng**: **Ngân hàng Quân Đội (MB Bank)**.\n` +
          `- **Chủ tài khoản**: **Hiệp Hội Doanh Nhân CEO 1983 (HanoiBA)**.\n` +
          `- **Cú pháp chuyển khoản**: \`${p?.code || "MÃ_HỘI_VIÊN"} ${name} HP2026\`\n\n` +
          `💡 Anh/Chị có thể quét mã VietQR tự động điền sẵn số tiền và nội dung bằng cách nhấn nút bên dưới ạ!`,
        actionLink: { label: "Thanh Toán VietQR Tự Động", route: "/association/renew/pay" },
        suggestions: ["Hóa đơn của tôi", "Tôi có bao nhiêu bạn bè?"],
      };
    }

    // 11. Documents and policy
    if (norm.includes("tai lieu") || norm.includes("van ban") || norm.includes("nghi quyet") || norm.includes("dieu le")) {
      return {
        text: `📚 **Phân Hệ Quản Lý Tài Liệu CLB CEO 1983**:\n\n` +
          `1. 🏛️ **Tài liệu Hiệp Hội**: Gồm điều lệ, quy chế hoạt động, nghị quyết BCH, báo cáo tài chính. Phân quyền bảo mật cao: Chỉ Quản trị viên, Chủ tịch và Trưởng các ban mới có quyền thêm/sửa/xóa; hội viên thường có quyền xem và tải về.\n` +
          `2. 🏢 **Tài liệu Doanh Nghiệp**: Doanh nghiệp hội viên tự do đăng tải hồ sơ năng lực, brochure, catalogue sản phẩm để giới thiệu tới các thành viên khác.`,
        actionLink: { label: "Mở Thư Viện Tài Liệu", route: "/association/library" },
      };
    }

    // 12. Profile 3D and Card visit
    if (norm.includes("danh thiep") || norm.includes("profile") || norm.includes("quet ma") || norm.includes("the hoi vien") || norm.includes("ho so")) {
      return {
        text: `🪪 **Thẻ Doanh Nhân & Profile 3D CEO 1983**:\n\n` +
          `- Mỗi hội viên được cấp 1 thẻ danh thiếp số điện tử tích hợp công nghệ chạm NFC và mã QR độc bản.\n` +
          `- Khi đối tác quét mã QR, hệ thống sẽ hiển thị thông tin danh thiếp và **Template Profile Doanh Nghiệp 3D** với hình ảnh chìm cao cấp, dấu mộc chứng nhận CEO 1983.\n` +
          `- Nếu danh thiếp chưa thuộc hội viên CLB, hệ thống sẽ hỗ trợ kết nối và mời tải ứng dụng ViOne Connect.`,
        actionLink: { label: "Xem Danh Thiếp & Profile", route: "/association/card" },
      };
    }

    // Default polite response
    return {
      text: `Dạ em đã ghi nhận câu hỏi của Anh/Chị **${name}**! CLB Doanh Nhân CEO 1983 luôn đồng hành hỗ trợ Anh/Chị kết nối kinh doanh, mở rộng đối tác và tham gia các hoạt động cộng đồng ý nghĩa.\n\nAnh/Chị có thể hỏi em thêm về: Sự kiện đăng ký, cơ hội B2B quan tâm, số lượng bạn bè, lịch hẹn Cafe, hóa đơn hội phí hoặc cơ cấu các Ban chuyên môn nhé ạ!`,
      suggestions: [
        "Sự kiện tôi đã đăng ký?",
        "Tôi có quan tâm cơ hội nào không?",
        "Tôi có bao nhiêu bạn bè?",
        "Tôi có cuộc gặp kết nối nào không?",
        "Tôi có hóa đơn nào phải thanh toán?",
      ],
    };
  };

  // Build dynamic system prompt grounded in app data
  const buildSystemPrompt = () => {
    const p = liveContext.memberProfile;
    const name = p?.full_name || p?.name || user?.name || "Hội viên";
    const company = p?.company_name || p?.company || "Doanh nghiệp CEO 1983";
    const code = p?.code || (user as any)?.member_code || "CEO-1983-001";
    const title = p?.title || p?.position || "Hội viên chính thức";

    const eventsText =
      liveContext.upcomingEvents.length > 0
        ? liveContext.upcomingEvents
            .map(
              (e) =>
                `- ID: ${e.id} | Tên: "${e.title}" | Ngày: ${e.time || e.date} | Địa điểm: ${e.place} | Đã đăng ký: ${e.registered ? "CÓ" : "Chưa"}`
            )
            .join("\n")
        : "Không có sự kiện.";

    const regEventsText =
      liveContext.registeredEvents.length > 0
        ? liveContext.registeredEvents
            .map((e) => `- "${e.title}" (Thời gian: ${e.time || e.date}, Địa điểm: ${e.place})`)
            .join("\n")
        : "Chưa đăng ký sự kiện nào.";

    const oppsText =
      liveContext.opportunities.length > 0
        ? liveContext.opportunities
            .map((o) => `- "${o.title}" | Công ty: ${o.company} | Thể loại: ${o.tag} | Giá trị: ${o.value}`)
            .join("\n")
        : "Không có cơ hội mới.";

    const interestedOppsText =
      liveContext.interestedOpportunities.length > 0
        ? liveContext.interestedOpportunities
            .map((o) => `- "${o.title}" (${o.company} - Giá trị: ${o.value})`)
            .join("\n")
        : "Chưa lưu cơ hội nào.";

    const meetingsText =
      liveContext.b2bMeetings.length > 0
        ? liveContext.b2bMeetings
            .map((m) => `- "${m.topic}" với ${m.partnerName} (${m.partnerCompany}) vào lúc ${m.time} tại ${m.location}`)
            .join("\n")
        : "Chưa có lịch hẹn gặp.";

    const invoicesText =
      liveContext.invoices.length > 0
        ? liveContext.invoices
            .map((i) => `- "${i.title}": ${i.amount} (Hạn nộp: ${i.dueDate} - Trạng thái: ${i.status})`)
            .join("\n")
        : "Không có hóa đơn nợ.";

    return `Bạn là Trợ lý AI Thông minh chính thức của CLB Doanh Nhân CEO 1983 (Hiệp Hội Doanh Nghiệp Trẻ Hà Nội - HanoiBA).
Bạn giao tiếp bằng tiếng Việt lịch thiệp, thông minh, chuẩn mực doanh nhân cao cấp, xưng "em" và gọi người dùng là "Anh/Chị" hoặc "Anh/Chị ${name}".

THÔNG TIN TÀI KHOẢN NGƯỜI DÙNG HIỆN TẠI (DỮ LIỆU ĐỘNG THẬT):
- Họ và tên: ${name}
- Mã hội viên: ${code}
- Đơn vị / Doanh nghiệp: ${company}
- Chức danh: ${title}
- Số lượng kết nối / bạn bè đã kết nối: ${liveContext.connectedCount} người
- Tổng số hội viên trong danh bạ CLB: ${liveContext.totalMembersCount} doanh nhân

CÁC SỰ KIỆN ANH/CHỊ ĐÃ ĐĂNG KÝ:
${regEventsText}

CÁC SỰ KIỆN SẮP TỚI TẠI CLB:
${eventsText}

CÁC CƠ HỘI GIAO THƯƠNG B2B ANH/CHỊ QUAN TÂM:
${interestedOppsText}

TẤT CẢ CƠ HỘI GIAO THƯƠNG B2B MỚI:
${oppsText}

LỊCH HẸN GẶP KẾT NỐI B2B CỦA ANH/CHỊ:
${meetingsText}

HÓA ĐƠN & HỘI PHÍ NIÊN LIỄM CỦA ANH/CHỊ:
${invoicesText}

HƯỚNG DẪN TRẢ LỜI:
- "bạn"/"em" trong câu hỏi là gọi TRỢ LÝ, KHÔNG phải "bạn bè". "Bạn làm được gì" = giới thiệu năng lực trợ lý. Chỉ trả lời đúng điều được hỏi, không liệt kê dữ liệu không liên quan, không bịa số liệu.
- Khi người dùng hỏi "tôi đăng ký sự kiện nào không": Trả lời đúng các sự kiện đã đăng ký kèm thời gian, địa điểm, nhắc mã vé QR.
- Khi người dùng hỏi "tôi có quan tâm cơ hội nào không": Trả lời đúng các cơ hội đã quan tâm/lưu.
- Khi người dùng hỏi "tôi có bao nhiêu bạn bè": Trả lời đúng số lượng bạn bè (${liveContext.connectedCount} người).
- Khi người dùng hỏi "tôi có cuộc gặp kết nối nào không": Báo đúng cuộc hẹn Cafe B2B đã lên lịch.
- Khi người dùng hỏi "tôi có hóa đơn nào phải thanh toán": Báo đúng các hóa đơn chưa thanh toán ở trên (nếu không có thì nói không có).
- Trả lời bằng định dạng markdown có icon doanh nhân, bullet point rõ ràng.`;
  };

  // Send message to AI with Multi-model Free fallback and Smart Local Evaluator
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
          content:
            "⚠️ **Thông Báo Trợ Lý AI**: Tài khoản của Anh/Chị đã tạm thời đạt giới hạn lượt hội thoại với trợ lý AI.\n\nVui lòng liên hệ Quản Trị Viên Hệ Thống để được hỗ trợ mở rộng thêm nhé!",
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

    try {
      const dynamicEvaluation = evaluateDynamicAccountQuery(promptText);
      let responseText = "";
      let actionLink = dynamicEvaluation.actionLink;
      let suggestions = dynamicEvaluation.suggestions;
      const history = newMessages.slice(-7, -1).map((m) => ({ role: m.role, content: m.content }));

      // 1. Backend AI (nắm TOÀN BỘ dữ liệu thật của tài khoản + phân quyền; tự đếm quota)
      try {
        const nestRes: any = await fetchNestApi("/ai/ask", {
          method: "POST",
          body: JSON.stringify({ prompt: promptText, clientContext: { history } }),
        });
        const d = nestRes?.data ?? nestRes;
        const nestReply: string = d?.answer || d?.reply || d?.text || "";
        if (nestReply && nestReply.trim().length > 0) {
          responseText = nestReply.trim();
          if (d?.route) {
            actionLink = { label: d?.featureName ? `Mở ${d.featureName}` : "Mở tính năng", route: d.route };
          } else {
            actionLink = undefined;
          }
          if (d?.provider !== "ceo1983-smart-engine") suggestions = undefined;
        }
        fetchNestApi<any>("/ai/quota")
          .then((r) => {
            if (r?.data) setQuota(r.data);
          })
          .catch(() => {});
      } catch {
        /* backend không phản hồi -> thử OpenRouter phía client */
      }

      // 2. OpenRouter phía client (chỉ khi backend lỗi) — dùng ngữ cảnh thật đã tải
      if (!responseText && OPENROUTER_API_KEY) {
        const systemPrompt = buildSystemPrompt();
        const apiMessages = [
          { role: "system", content: systemPrompt },
          ...newMessages.slice(-6).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ];

        for (const modelCandidate of OPENROUTER_FREE_MODELS) {
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
                model: modelCandidate,
                messages: apiMessages,
                temperature: 0.3,
                max_tokens: 800,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const reply = data?.choices?.[0]?.message?.content;
              if (reply && reply.trim().length > 15) {
                responseText = reply.trim();
                actionLink = undefined;
                break;
              }
            }
          } catch (modelErr) {
            console.warn(`[Ceo1983ChatAssistant] OpenRouter ${modelCandidate} failed:`, modelErr);
          }
        }
      }

      // 3. Fallback: bộ đánh giá dữ liệu thật tại client
      if (!responseText) {
        responseText = dynamicEvaluation.text;
        actionLink = dynamicEvaluation.actionLink;
        suggestions = dynamicEvaluation.suggestions;
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
          actionLink: actionLink,
          suggestions: suggestions,
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
  if (!user || !aiActive || !isVoiceAiEnabled() || (!pathname.startsWith("/association") && !pathname.startsWith("/m"))) return null;

  return (
    <>
      {/* ── 1. FLOATING ASSISTANT BUTTON (DRAGGABLE & QUICK CLOSE) ── */}
      {!isOpen && !isDismissed && (
        <aside
          aria-label="Khung nổi trợ lý thông minh"
          className="fixed bottom-20 right-3.5 z-40 flex flex-col items-end pointer-events-auto touch-none"
          style={
            btnPos.x !== undefined && btnPos.y !== undefined
              ? { left: `${btnPos.x}px`, top: `${btnPos.y}px`, bottom: "auto", right: "auto", position: "fixed" }
              : undefined
          }
        >
          <div className="relative group">
            {/* Quick close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
                sessionStorage.setItem("ceo1983_ai_dismissed", "true");
                toast.info("Đã thu gọn trợ lý AI. Chạm vào mép màn hình để mở lại.");
              }}
              aria-label="Thu gọn trợ lý AI"
              title="Thu gọn trợ lý AI"
              className="absolute -top-1.5 -left-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/90 text-white hover:bg-rose-600 hover:text-white border border-amber-400/80 shadow-md cursor-pointer transition active:scale-90"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={() => {
                if (hasDraggedRef.current) return;
                setIsOpen(true);
              }}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#001D4A] via-[#003B95] to-[#0A266E] border-2 border-amber-400 shadow-[0_8px_25px_rgba(245,158,11,0.45)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden p-1.5"
              title="Kéo để di chuyển • Chạm để mở Trợ lý AI CEO 1983"
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
                className="h-full w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300 pointer-events-none select-none"
              />

              {/* Online Sparkle Badge */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-[9px] ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse pointer-events-none">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* ── 1.1 MINI DOCK BUTTON (WHEN DISMISSED) ── */}
      {!isOpen && isDismissed && (
        <button
          type="button"
          onClick={() => {
            setIsDismissed(false);
            sessionStorage.removeItem("ceo1983_ai_dismissed");
          }}
          className="fixed bottom-24 right-0 z-40 flex items-center gap-1.5 rounded-l-2xl bg-gradient-to-l from-amber-500 to-[#003B95] px-2.5 py-1.5 text-xs font-bold text-white shadow-lg border-y border-l border-amber-400 cursor-pointer active:scale-95 transition animate-in slide-in-from-right duration-200"
          title="Mở lại Trợ lý AI CEO 1983"
        >
          <Bot className="h-4 w-4 text-amber-200" />
          <span>AI</span>
        </button>
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

                      {/* Action Link button if present */}
                      {!isUser && m.actionLink && (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              navigate({ to: m.actionLink!.route as any });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#003B95] to-[#0A266E] text-white text-xs font-semibold hover:from-[#002B70] hover:to-[#003B95] transition shadow-xs active:scale-95 cursor-pointer"
                          >
                            <span>{m.actionLink.label}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Suggestions chips if present */}
                      {!isUser && m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {m.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendMessage(sug)}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition cursor-pointer active:scale-95"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}

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
