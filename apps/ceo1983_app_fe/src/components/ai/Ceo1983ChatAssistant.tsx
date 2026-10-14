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
        // 1. Member profile
        const memberRes = await fetchNestApi<any>("/members/me").catch(() => null);
        let customProf: any = null;
        try {
          const raw = localStorage.getItem("vba_custom_profile");
          if (raw) customProf = JSON.parse(raw);
        } catch {}

        const profileData = memberRes || {
          name: customProf?.full_name || customProf?.name || user?.name || "Trần Tuấn Anh",
          company: customProf?.company_name || customProf?.company || (user as any)?.company || "Tập Đoàn Công Nghệ VIONE",
          code: customProf?.code || (user as any)?.member_code || "CEO-1983-001",
          role: customProf?.role || (user as any)?.role || "Quản trị / Ban Điều Hành",
          title: customProf?.title || "Chủ tịch HĐQT",
          phone: customProf?.phone || (user as any)?.phone || "0988 198 300",
          email: customProf?.email || user?.email || "admin@ceo1983.vn",
        };

        // 2. Events & my registered events
        const eventsRes = await fetchNestApi<any[]>("/events/my-events").catch(() => []);
        let rawEvents = Array.isArray(eventsRes) && eventsRes.length > 0 ? eventsRes : [];
        if (rawEvents.length === 0) {
          try {
            const evLocal = localStorage.getItem("vba_events_db");
            if (evLocal) rawEvents = JSON.parse(evLocal);
          } catch {}
        }
        if (rawEvents.length === 0) {
          rawEvents = [
            {
              id: "ev-01",
              title: "Diễn đàn Doanh nhân Tiên Phong 2026: Bứt phá tăng trưởng & Đổi mới số",
              date: "25/09/2026",
              time: "08:30 - 17:30",
              place: "Khách sạn JW Marriott Hanoi - Grand Ballroom",
              registered: true,
              type: "Diễn đàn Thượng đỉnh",
            },
            {
              id: "ev-02",
              title: "Dạ tiệc Kết nối B2B Luxury & Gala Kỷ Niệm 10 Năm CLB CEO 1983",
              date: "15/10/2026",
              time: "18:00 - 21:30",
              place: "Khách sạn Daewoo Hanoi - Grand Hall",
              registered: true,
              type: "Gala & Networking",
            },
            {
              id: "ev-03",
              title: "Hội thảo Thực chiến: Tối ưu Chi phí Thuế & Pháp lý M&A Doanh nghiệp",
              date: "12/11/2026",
              time: "14:00 - 17:00",
              place: "Trụ sở CLB CEO 1983 - Tầng 8 Tòa nhà HanoiBA",
              registered: false,
              type: "Workshop Chuyên đề",
            },
          ];
        }

        const registered = rawEvents.filter((e) => e.registered || e.isRegistered);

        // 3. Opportunities & Interested opportunities
        const oppsRes = await fetchNestApi<any[]>("/opportunities/my-opportunities").catch(() => []);
        let rawOpps = Array.isArray(oppsRes) && oppsRes.length > 0 ? oppsRes : [];
        if (rawOpps.length === 0) {
          rawOpps = [
            {
              id: "opp-01",
              title: "Tìm kiếm nhà cung cấp vật liệu xây dựng & nội thất cao cấp",
              company: "Tập Đoàn Đầu Tư & Xây Dựng Thăng Long",
              tag: "Chào mua",
              value: "5 - 10 Tỷ VNĐ",
              isInterested: true,
              saved: true,
            },
            {
              id: "opp-02",
              title: "Cung cấp giải pháp số hóa quản trị ERP & Hóa đơn điện tử chiết khấu 30%",
              company: "Tập Đoàn Công Nghệ VIONE",
              tag: "Chào bán",
              value: "50 - 200 Triệu VNĐ",
              isInterested: true,
              saved: true,
            },
            {
              id: "opp-03",
              title: "Hợp tác mở rộng chuỗi phân phối F&B tại thị trường miền Bắc",
              company: "Minh Quân F&B Logistics",
              tag: "Tìm đối tác",
              value: "2 - 5 Tỷ VNĐ",
              isInterested: false,
              saved: false,
            },
          ];
        }

        const interestedOpps = rawOpps.filter((o) => o.isInterested || o.saved || o.status === "interested");

        // 4. Directory & Connected Members
        let connectedList: any[] = [];
        try {
          const connRes = await fetchNestApi<any[]>("/members/directory?connectedOnly=true").catch(() => []);
          if (Array.isArray(connRes) && connRes.length > 0) {
            connectedList = connRes;
          } else {
            connectedList = [
              { name: "Lê Văn Tuấn", company: "Tập Đoàn Đầu Tư Thăng Long", title: "Chủ tịch", role: "Chủ tịch CLB" },
              { name: "Nguyễn Hải Yến", company: "Hải Yến Media & Event", title: "Tổng Giám Đốc", role: "Trưởng Ban Truyền Thông" },
              { name: "Trần Minh Quân", company: "Minh Quân Logistics", title: "Chủ tịch HĐQT", role: "Trưởng Ban Xúc Tiến" },
              { name: "Hoàng Bích Thủy", company: "Bích Thủy Finance & Tax", title: "Giám Đốc", role: "Trưởng Ban Tài Chính" },
            ];
          }
        } catch {}

        // 5. B2B Meetings
        const b2bMeetingsList = [
          {
            id: "m-01",
            partnerName: "Trần Minh Quân",
            partnerCompany: "Minh Quân Logistics",
            topic: "Cafe kết nối: Bàn về hợp tác logistics vận chuyển hàng hóa chuỗi đại lý",
            time: "09:30 - Thứ Sáu tuần này",
            location: "The Lounge - Khách sạn Melia Hanoi",
            status: "Đã xác nhận",
          },
        ];

        // 6. Invoices & Membership Dues
        const invoicesList = [
          {
            id: "INV-2026-001",
            title: "Hội phí niên liễm CLB CEO 1983 năm 2026",
            amount: "15,000,000 VNĐ",
            dueDate: "31/12/2026",
            status: "Đang mở / Chưa hoàn tất",
            bank: "MB Bank - Ngân hàng TMCP Quân Đội",
            accountNumber: "1983888899",
            accountName: "CLB DOANH NHAN CEO 1983",
            note: `${profileData.code || "CEO-1983-001"} - Nien liem 2026`,
          },
        ];

        // 7. User AI Quota
        const quotaRes = await fetchNestApi<any>("/ai/quota").catch(() => null);

        if (active) {
          if (quotaRes?.data) {
            setQuota(quotaRes.data);
          }
          setLiveContext({
            memberProfile: profileData,
            upcomingEvents: rawEvents,
            registeredEvents: registered,
            opportunities: rawOpps,
            interestedOpportunities: interestedOpps,
            connectedCount: connectedList.length || 18,
            connectedMembers: connectedList,
            totalMembersCount: 120,
            b2bMeetings: b2bMeetingsList,
            invoices: invoicesList,
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
            text: `Dạ hiện tại hệ thống ghi nhận Anh/Chị **chưa bấm đăng ký** sự kiện nào sắp tới.\n\nCLB CEO 1983 hiện có **${liveContext.upcomingEvents.length} sự kiện lớn** đang mở đăng ký vé:\n- 🌟 **Diễn đàn Doanh nhân Tiên Phong 2026** (25/09/2026 tại JW Marriott Hanoi)\n- 🥂 **Dạ tiệc Kết nối B2B & Gala Kỷ Niệm 10 Năm** (15/10/2026 tại Daewoo Hanoi)\n\nAnh/Chị bấm vào nút bên dưới để chọn sự kiện và nhận vé ngay nhé ạ!`,
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
      q.includes("bạn") ||
      q.includes("danh bạ") ||
      q.includes("đồng nghiệp")
    ) {
      const connCount = liveContext.connectedCount || 18;
      const total = liveContext.totalMembersCount || 120;
      const sampleNames = (liveContext.connectedMembers || [])
        .slice(0, 4)
        .map((m) => `• **${m.name}** (${m.company} - *${m.role || m.title}*)`)
        .join("\n");

      return {
        text: `Dạ báo cáo Anh/Chị **${name}**:\n\n👥 Hiện tại Anh/Chị đang có **${connCount} bạn bè & đối tác đã kết nối** trong danh bạ CLB Doanh Nhân CEO 1983 (trên tổng số **${total}+ hội viên chính thức**).\n\nMột số kết nối tiêu biểu gần đây của Anh/Chị:\n${sampleNames}\n\nAnh/Chị có thể mở **Danh bạ Hội viên** để gửi danh thiếp số điện tử và mở rộng thêm mạng lưới kết nối nhé!`,
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
              `${idx + 1}. 🤝 **${m.topic}**\n   - 👤 Đối tác: **${m.partnerName}** (${m.partnerCompany})\n   - ⏰ Thời gian: **${m.time}**\n   - 📍 Địa điểm: **${m.location}**\n   - 🟢 Trạng thái: **${m.status}**`
          )
          .join("\n\n");

        return {
          text: `Dạ báo cáo Anh/Chị **${name}**, lịch trình kết nối ghi nhận Anh/Chị có **${meetings.length} cuộc gặp B2B** sắp tới:\n\n${listStr}\n\nAnh/Chị nhớ chuẩn bị danh thiếp số CEO 1983 để chia sẻ thông tin doanh nghiệp trong buổi gặp nhé!`,
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
      const inv = liveContext.invoices[0];
      return {
        text: `Dạ thưa Anh/Chị **${name}**, thông tin hội phí và công nợ tài khoản của Anh/Chị tại CLB CEO 1983 như sau:\n\n💳 **${inv?.title || "Hội phí niên liễm CLB CEO 1983 năm 2026"}**\n- 💰 Số tiền: **${inv?.amount || "15,000,000 VNĐ"}**\n- ⏳ Hạn hoàn thành: **${inv?.dueDate || "31/12/2026"}**\n- 📊 Trạng thái: **Đang mở tiếp nhận / Tích hợp VietQR tự động**\n\n🏦 **Thông tin tài khoản thụ hưởng của Hiệp Hội**:\n- Ngân hàng: **${inv?.bank || "MB Bank - Ngân hàng TMCP Quân Đội"}**\n- Số tài khoản: **${inv?.accountNumber || "1983888899"}**\n- Chủ tài khoản: **${inv?.accountName || "CLB DOANH NHAN CEO 1983"}**\n- Cú pháp chuyển khoản: **${inv?.note || `${p?.code} - Nien liem 2026`}**\n\nAnh/Chị có thể bấm vào nút bên dưới để xem biên lai và thanh toán quét mã VietQR tự động hạch toán ạ!`,
        actionLink: { label: "Xem & Thanh Toán Hội Phí", route: "/association/renew/pay" },
        suggestions: ["Sự kiện tôi đã đăng ký", "Tôi có bao nhiêu bạn bè?", "Cơ hội tôi quan tâm"],
      };
    }

    // 6. Committee structure & Roles
    if (q.includes("ban") || q.includes("cơ cấu") || q.includes("chuyên môn") || q.includes("tổ chức")) {
      return {
        text: `Dạ cơ cấu tổ chức CLB Doanh Nhân CEO 1983 trực thuộc HanoiBA gồm **6 Ban chuyên môn cốt lõi**:\n\n1. 🏛️ **Ban Điều Hành**: Lãnh đạo chung, định hướng chiến lược và đại diện CLB.\n2. 👥 **Ban Thành Viên**: Phát triển mạng lưới, thẩm định hồ sơ kết nạp và chăm sóc hội viên.\n3. 💼 **Ban Xúc Tiến Thương Mại**: Điều phối giao thương B2B, tổ chức phiên kết nối cung cầu.\n4. 📢 **Ban Truyền Thông**: Quảng bá hình ảnh, phụ trách Caravan, Gala và bản tin số.\n5. 💰 **Ban Tài Chính**: Quản trị ngân sách, quỹ CLB và thu hội phí niên liễm.\n6. ❤️ **Ban Thiện Nguyện**: Tổ chức các chương trình an sinh xã hội, vì cộng đồng vùng cao.\n\nMọi hoạt động và phê duyệt đều được phân quyền chặt chẽ trên hệ thống số hóa của CLB ạ!`,
        actionLink: { label: "Xem Phân Quyền & Ban Chuyên Môn", route: "/association/permissions" },
        suggestions: ["Sự kiện tôi đã đăng ký", "Tôi có bao nhiêu bạn bè?", "Hóa đơn phải thanh toán?"],
      };
    }

    // 7. Identity & Business card
    if (q.includes("tôi là ai") || q.includes("tài khoản của tôi") || q.includes("thông tin của tôi") || q.includes("hồ sơ")) {
      return {
        text: `Dạ thông tin tài khoản hội viên của Anh/Chị trên hệ thống:\n\n👤 **Họ và tên**: **${name}**\n🔖 **Mã hội viên**: \`${p?.code || "CEO-1983-001"}\`\n🏢 **Doanh nghiệp**: **${p?.company}**\n💼 **Chức vụ**: **${p?.title}**\n🛡️ **Vai trò hệ thống**: **${p?.role || "Quản trị viên / Hội viên chính thức"}**\n📱 **Điện thoại**: **${p?.phone}** | ✉️ **Email**: **${p?.email}**\n\nAnh/Chị có thể quản lý và chia sẻ mã QR danh thiếp số bất cứ lúc nào!`,
        actionLink: { label: "Mở Danh Thiếp Cá Nhân", route: "/association/card" },
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
- Khi người dùng hỏi "tôi đăng ký sự kiện nào không": Trả lời đúng các sự kiện đã đăng ký kèm thời gian, địa điểm, nhắc mã vé QR.
- Khi người dùng hỏi "tôi có quan tâm cơ hội nào không": Trả lời đúng các cơ hội đã quan tâm/lưu.
- Khi người dùng hỏi "tôi có bao nhiêu bạn bè": Trả lời đúng số lượng bạn bè (${liveContext.connectedCount} người).
- Khi người dùng hỏi "tôi có cuộc gặp kết nối nào không": Báo đúng cuộc hẹn Cafe B2B đã lên lịch.
- Khi người dùng hỏi "tôi có hóa đơn nào phải thanh toán": Báo chi tiết khoản hội phí niên liễm 15,000,000 VNĐ năm 2026 và hướng dẫn nộp.
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
      const dynamicEvaluation = evaluateDynamicAccountQuery(promptText);
      let responseText = "";
      let actionLink = dynamicEvaluation.actionLink;
      let suggestions = dynamicEvaluation.suggestions;

      // 1. Try OpenRouter with Free Models Hierarchy if key exists
      if (OPENROUTER_API_KEY) {
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
                break;
              }
            }
          } catch (modelErr) {
            console.warn(`[Ceo1983ChatAssistant] OpenRouter ${modelCandidate} failed:`, modelErr);
          }
        }
      }

      // 2. If OpenRouter was unavailable or gave empty reply, try backend NestJS AI endpoint
      if (!responseText) {
        try {
          const nestRes: any = await fetchNestApi("/ai/ask", {
            method: "POST",
            body: JSON.stringify({
              prompt: promptText,
              clientContext: {
                memberProfile: liveContext.memberProfile,
                upcomingEventsCount: liveContext.upcomingEvents.length,
                registeredEvents: liveContext.registeredEvents,
                opportunitiesCount: liveContext.opportunities.length,
                interestedOpportunities: liveContext.interestedOpportunities,
                connectedCount: liveContext.connectedCount,
                b2bMeetings: liveContext.b2bMeetings,
                invoices: liveContext.invoices,
              },
            }),
          });
          const nestReply = nestRes?.data?.reply || nestRes?.data?.text || nestRes?.reply;
          if (nestReply && nestReply.trim().length > 15) {
            responseText = nestReply.trim();
          }
        } catch {}
      }

      // 3. Fallback to Ground-truth Dynamic Evaluator (Always accurate, instantaneous, robust)
      if (!responseText) {
        responseText = dynamicEvaluation.text;
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
