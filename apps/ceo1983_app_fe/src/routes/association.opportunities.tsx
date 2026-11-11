import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Check,
  Clock,
  Plus,
  Building2,
  MessageSquare,
  Handshake,
  X,
  Send,
  Sparkles,
  ImagePlus,
  Trash2,
  Phone,
  User,
  Briefcase,
  Loader2,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Pencil,
  MoreVertical,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Layers,
  XCircle,
  Coins,
  ShieldCheck,
  FolderOpen,
  LayoutGrid,
  List,
  Package,
  Share2,
  CheckCircle2,
  ArrowRight,
  Percent,
  ArrowUpDown,
  BarChart3,
  Heart,
  HeartOff,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { MemberHeader } from "@/components/member/MemberShell";
import { executeShare } from "@/lib/share-helper";

const opportunitySchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề cơ hội không được phép để trống"),
  contactName: z.string().trim().min(1, "Họ tên người liên hệ không được phép để trống"),
  contactPhone: z.string().trim().min(1, "Số điện thoại không được phép để trống"),
});
import { useServerData } from "@/hooks/use-server-data";
import {
  listMyOpportunities,
  expressInterest,
  getMyMember,
  listMyProducts,
  type MyOpportunity,
  type MyMember,
  type MyProduct,
} from "@/lib/member-app.functions";
import { fetchNestApi, resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { useT, useFmt } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { formatDisplayDate } from "@/lib/date-format";
import { recordUserActivity } from "@/lib/user-activity-logger";
import { StandardCurrencyInput } from "@/components/common/StandardCurrencyInput";
import { BusinessConnectBottomSheet, type BusinessConnectTarget } from "@/components/common/BusinessConnectBottomSheet";
import {
  OpportunityDetailModal,
  OpportunityCreateModal,
  OpportunityEditModal,
} from "@/components/opportunities/modals";

function formatCurrencyInput(val: string | number): string {
  if (val === undefined || val === null) return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  const cleanDigits = digits.replace(/^0+(?=\d)/, "");
  return cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


export const Route = createFileRoute("/association/opportunities")({
  component: OpportunitiesScreen,
});

const TAG_VI_MAP: Record<string, string> = {
  partnership: "Hợp tác B2B",
  investment: "Đầu tư & Vốn",
  trade: "Giao thương",
  supply: "Cung ứng",
  b2b: "Hợp tác B2B",
  export: "Xuất nhập khẩu",
};

const defaultOppImages = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
];

const OPPORTUNITY_INDUSTRIES = [
  { id: "all", label: "Tất cả ngành nghề" },
  { id: "tech", label: "Công nghệ & Chuyển đổi số" },
  { id: "construction", label: "Xây dựng & Bất động sản" },
  { id: "finance", label: "Tài chính & Đầu tư" },
  { id: "manufacturing", label: "Sản xuất & Cơ khí" },
  { id: "agriculture", label: "Nông nghiệp & Thực phẩm" },
  { id: "health", label: "Y tế & Sức khỏe" },
  { id: "media", label: "Truyền thông & Sự kiện" },
  { id: "logistics", label: "Logistics & Vận tải" },
  { id: "service", label: "Dịch vụ & Đào tạo" },
];

function normalizeTag(tag: any): string {
  if (!tag) return "Cơ hội";
  const str = typeof tag === "string" ? tag : String(tag?.label || tag?.name || tag?.id || tag || "Cơ hội");
  return TAG_VI_MAP[str.toLowerCase()] || str;
}

function parseVnNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  const s = String(val).trim().toLowerCase();
  if (s === "thỏa thuận b2b" || s === "liên hệ" || s === "thương lượng") return 0;
  const hasTy = s.includes("tỷ") || s.includes("ty");
  const hasTr = s.includes("tr") || s.includes("trieu") || s.includes("triệu");
  let clean = s.replace(/[^\d.,]/g, "");
  if (clean.includes(".") && clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(".")) {
    const parts = clean.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      clean = clean.replace(/\./g, "");
    }
  } else if (clean.includes(",")) {
    const parts = clean.split(",");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && !hasTy && !hasTr)) {
      clean = clean.replace(/,/g, "");
    } else {
      clean = clean.replace(",", ".");
    }
  }
  const n = parseFloat(clean);
  if (isNaN(n) || n <= 0) return 0;
  if (hasTy) return n * 1_000_000_000;
  if (hasTr) return n * 1_000_000;
  if (n <= 100 && !s.includes("đ") && !s.includes("vnd")) {
    return n * 1_000_000_000;
  }
  return n;
}

function formatSmartPrice(val: string | number | undefined | null): string {
  if (!val || val === "0" || val === 0) return "Thỏa thuận B2B";
  if (typeof val === "string") {
    const s = val.trim();
    if (s.toLowerCase() === "thỏa thuận b2b" || s.toLowerCase() === "thương lượng" || s.toLowerCase() === "liên hệ") {
      return "Thỏa thuận B2B";
    }
    if (s.includes(" - ")) {
      const parts = s.split(" - ");
      const p1 = parseVnNumber(parts[0]);
      const p2 = parseVnNumber(parts[1]);
      if (p1 > 0 && p2 > 0) {
        return `${formatSmartPrice(p1)} - ${formatSmartPrice(p2)}`;
      }
      return s;
    }
    if (s.startsWith("Từ ") || s.startsWith("từ ")) {
      const p = parseVnNumber(s.replace(/^từ\s+/i, ""));
      if (p > 0) return `Từ ${formatSmartPrice(p)}`;
      return s;
    }
  }
  const num = typeof val === "number" ? val : parseVnNumber(val);
  if (num <= 0) return "Thỏa thuận B2B";
  if (num > 0 && num <= 100) {
    return `${num} Tỷ VNĐ`;
  }
  if (num >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    return `${b % 1 === 0 ? b : b.toFixed(1).replace(/\.0$/, "")} Tỷ VNĐ`;
  }
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1).replace(/\.0$/, "")} Tr VNĐ`;
  }
  return `${num.toLocaleString("vi-VN")} đ`;
}

function OpportunitiesScreen() {
  const t = useT();
  const fmt = useFmt();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fetchOpps = useServerFn(listMyOpportunities);
  const doInterest = useServerFn(expressInterest);
  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);
  const {
    data: opportunities,
    loading,
    reload,
  } = useServerData<MyOpportunity[]>(() => fetchOpps(), []);

  const [localOpps, setLocalOpps] = useState<MyOpportunity[] | null>(null);

  useEffect(() => {
    if (opportunities) {
      setLocalOpps(opportunities);
    }
  }, [opportunities]);

  const activeOppsList = useMemo(() => {
    return localOpps !== null ? localOpps : (opportunities || []);
  }, [localOpps, opportunities]);

  const fetchProducts = useServerFn(listMyProducts);
  const { data: products = [] } = useServerData<MyProduct[]>(() => fetchProducts(), []);

  // Thống kê Realtime: Tổng số cơ hội, Tổng số sản phẩm, Tổng giá trị (Requirement 3)
  const totalOppCount = activeOppsList.length;
  const totalProdCount = products?.length || 0;
  const totalOpportunitiesValue = useMemo(() => {
    let sum = 0;
    activeOppsList.forEach((o) => {
      sum += getOppNumericValue(o);
    });
    (products || []).forEach((p) => {
      const price = Number(p.memberPrice || p.price) || 0;
      sum += price;
    });
    return sum;
  }, [activeOppsList, products]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "negotiating" | "won">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<(MyOpportunity & { description?: string }) | null>(
    null,
  );

  // Xử lý Deep Link khi người dùng nhấp vào link chia sẻ từ Facebook/Zalo/bên ngoài vào app (?id=... hoặc ?opportunityId=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const targetOppId = sp.get("id") || sp.get("opportunityId") || sp.get("oppId");
      if (!targetOppId) return;

      const found = activeOppsList.find((o) => String(o.id) === String(targetOppId));
      if (found) {
        setSelectedOpp(found as any);
      } else {
        fetchNestApi<any>(`/opportunities/${targetOppId}`)
          .then((res) => {
            if (res && res.id) {
              setSelectedOpp(res);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [activeOppsList]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<"all" | "by_department" | "friends">("all");
  const [editingOpp, setEditingOpp] = useState<(MyOpportunity & { description?: string }) | null>(
    null,
  );
  const [activeOppMenuId, setActiveOppMenuId] = useState<string | null>(null);
  const [interestedMembers, setInterestedMembers] = useState<
    Array<{
      memberId: string;
      name: string;
      company?: string;
      phone?: string;
      email?: string;
      avatar?: string;
      expressedAt: string;
    }>
  >([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [negotiateTarget, setNegotiateTarget] = useState<BusinessConnectTarget | null>(null);
  const [negotiateOpp, setNegotiateOpp] = useState<any>(null);

  // Case 3 Deal B2B States
  const [dealModalOpp, setDealModalOpp] = useState<any>(null);
  const [dealPrice, setDealPrice] = useState("50000000");
  const [dealMessage, setDealMessage] = useState("");
  const [submittingDeal, setSubmittingDeal] = useState(false);
  const [agreedDeals, setAgreedDeals] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("vba_agreed_opp_deals");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleOpenDealModal = (o: any) => {
    setDealModalOpp(o);
    setDealPrice(o.budgetMin ? String(o.budgetMin) : "50000000");
    setDealMessage(
      `Chào Quý Công Ty, chúng tôi rất quan tâm đến cơ hội "${o.title}" và muốn đề xuất hợp tác chào giá cung ứng trực tiếp.`,
    );
  };

  const handleSubmitDeal = async () => {
    if (!dealModalOpp) return;
    setSubmittingDeal(true);
    try {
      const targetUserId = dealModalOpp.posterId || dealModalOpp.userId || dealModalOpp.memberId || dealModalOpp.createdById;
      const dealId = `deal_${Date.now()}`;
      const newDeal = {
        id: dealId,
        oppId: dealModalOpp.id,
        oppTitle: dealModalOpp.title,
        partnerName: member?.name || "Hội viên CEO 1983",
        partnerCompany: (member as any)?.company || (member as any)?.companyName || "Doanh nghiệp CLB",
        partnerPhone: member?.phone || "",
        ownerName: dealModalOpp.contactName || dealModalOpp.company || "Chủ cơ hội",
        ownerCompany: dealModalOpp.company,
        ownerId: targetUserId,
        price: dealPrice,
        message: dealMessage,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const rawDeals = localStorage.getItem("vba_opp_deals");
      const list = rawDeals ? JSON.parse(rawDeals) : [];
      list.unshift(newDeal);
      localStorage.setItem("vba_opp_deals", JSON.stringify(list));

      try {
        await fetchNestApi(`/opportunities/${dealModalOpp.id}/interests`, {
          method: "POST",
          body: JSON.stringify({
            interestLevel: "high",
            dealValue: Number(dealPrice),
            message: `[Deal chào giá: ${Number(dealPrice).toLocaleString("vi-VN")} đ] ${dealMessage || "Đề xuất kết nối giao thương"}`,
          }),
        });
      } catch (e) {
        console.warn("Express interest deal fallback:", e);
      }

      const rawNotifs = localStorage.getItem("vba_notifications");
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      notifs.unshift({
        id: `deal_req_${Date.now()}`,
        targetUserId: targetUserId,
        title: "Đề xuất Deal chào giá mới cho cơ hội của bạn!",
        body: `${member?.name || "Hội viên"} vừa gửi đề xuất deal ${Number(dealPrice).toLocaleString("vi-VN")} đ cho cơ hội "${dealModalOpp.title}": "${dealMessage}"`,
        createdAt: new Date().toISOString(),
        unread: true,
        type: "deal",
        actionUrl: `/association/opportunities?tab=${encodeURIComponent("Ai đang quan tâm deal cơ hội của tôi")}&oppId=${dealModalOpp.id}`,
      });
      localStorage.setItem("vba_notifications", JSON.stringify(notifs.slice(0, 50)));
      window.dispatchEvent(new CustomEvent("notifications-updated"));

      recordUserActivity({
        action: "PROPOSE_DEAL",
        title: `Đề xuất Deal cho cơ hội: ${dealModalOpp.title}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: {
          oppId: dealModalOpp.id,
          oppTitle: dealModalOpp.title,
          dealPrice,
          dealMessage,
          detail: `Giá chào: ${Number(dealPrice).toLocaleString("vi-VN")} đ. Lời nhắn: "${dealMessage}"`,
        },
      });

      toast.success("Đã gửi đề xuất Deal chào giá tới người đăng cơ hội thành công!");
      setDealModalOpp(null);
    } catch {
      toast.error("Không thể gửi deal chào giá.");
    } finally {
      setSubmittingDeal(false);
    }
  };

  const handleApproveDeal = (oppId: string, oppTitle: string, partnerName: string, partnerCompany: string) => {
    const next = { ...agreedDeals, [oppId]: true };
    setAgreedDeals(next);
    try {
      localStorage.setItem("vba_agreed_opp_deals", JSON.stringify(next));
      const rawNotifs = localStorage.getItem("vba_notifications");
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      notifs.unshift({
        id: `deal_appr_${Date.now()}`,
        title: "Deal chào giá đã được chủ cơ hội đồng ý!",
        body: `Chủ cơ hội "${oppTitle}" đã đồng ý với đề xuất deal của bạn. Nhấn để thiết lập cuộc gặp B2B ngay!`,
        createdAt: new Date().toISOString(),
        unread: true,
        type: "deal",
        actionUrl: `/association/connect?partnerName=${encodeURIComponent(partnerName)}&partnerCompany=${encodeURIComponent(partnerCompany)}&notes=${encodeURIComponent(`Gặp gỡ 1-1 xúc tiến thương vụ: ${oppTitle}`)}`,
      });
      localStorage.setItem("vba_notifications", JSON.stringify(notifs.slice(0, 50)));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch {}

    recordUserActivity({
      action: "APPROVE_DEAL",
      title: `Đồng ý deal cơ hội: ${oppTitle}`,
      badge: "Giao thương",
      userId: user?.id,
      metadata: {
        oppId,
        oppTitle,
        partnerName,
        partnerCompany,
        detail: `Chấp thuận đề xuất thương vụ với ${partnerName} (${partnerCompany})`,
      },
    });

    toast.success("Đã đồng ý deal chào giá! Hệ thống đã gửi thông báo đến đối tác để kết nối cuộc gặp.");
  };

  const [oppReport, setOppReport] = useState<{
    summary: {
      totalClubCount: number;
      totalClubValue: number;
      mySharedCount: number;
      mySharedValue: number;
      myWonCount: number;
      myWonValue: number;
      totalWonCount: number;
      totalWonValue: number;
    };
    opportunities: any[];
  }>({
    summary: {
      totalClubCount: 0,
      totalClubValue: 0,
      mySharedCount: 0,
      mySharedValue: 0,
      myWonCount: 0,
      myWonValue: 0,
      totalWonCount: 0,
      totalWonValue: 0,
    },
    opportunities: [],
  });

  const loadReport = () => {
    fetchNestApi<any>("/opportunities/report")
      .then((res) => {
        if (res?.ok && res.summary) {
          setOppReport(res);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleNegotiate = (opp: any) => {
    const target: BusinessConnectTarget = {
      code: opp.posterCode || opp.posterId || (opp.creator ? opp.creator.code : "admin"),
      name: opp.posterName || opp.contactName || opp.company || "Hội viên CLB CEO 1983",
      company: opp.company,
      title: opp.contactTitle || "Chủ đề xuất cơ hội",
      userId: opp.posterId || opp.userId,
    };
    setNegotiateTarget(target);
    setNegotiateOpp(opp);
  };

  const handleNegotiateWithMember = (m: any, opp: any) => {
    const target: BusinessConnectTarget = {
      code: m.memberCode || m.memberId || m.phone || "member",
      name: m.name || "Hội viên quan tâm",
      company: m.company || "Doanh nghiệp CLB CEO 1983",
      title: m.personTitle || "Hội viên",
      userId: m.userId || m.memberId,
    };
    setNegotiateTarget(target);
    setNegotiateOpp(opp);
  };

  const handleMessagePoster = (opp: any) => {
    const targetCode = opp.posterCode || opp.contactPhone || opp.posterId || (opp.creator ? opp.creator.code : "admin");
    const targetName = opp.posterName || opp.contactName || opp.company || "Người đăng cơ hội";
    const rawOppImg = opp.image;
    const oppImg = (rawOppImg && (rawOppImg.startsWith("data:") || rawOppImg.startsWith("http") || rawOppImg.startsWith("/")))
      ? (rawOppImg.startsWith("data:") ? rawOppImg : resolveMediaUrl(rawOppImg) || rawOppImg)
      : defaultOppImages[0];

    const inquiry = {
      itemType: "opportunity",
      id: opp.id,
      title: opp.title,
      price: formatSmartPrice(opp.value),
      originalPrice: opp.value ? String(opp.value) : undefined,
      image: oppImg,
      company: opp.company || targetName,
      category: opp.tag || "Cơ hội B2B",
      sellerName: targetName,
      targetCode: targetCode,
      autoSend: true,
      note: `Tôi quan tâm tới cơ hội giao thương: "${opp.title}". Rất mong được kết nối và trao đổi chi tiết!`,
    };

    try {
      localStorage.setItem("vba_pending_chat_inquiry", JSON.stringify(inquiry));
      window.dispatchEvent(new Event("storage"));
    } catch {}

    void navigate({
      to: "/association/messages",
      search: {
        peerCode: targetCode,
        peerName: targetName,
      },
    });
  };

  const handleOpenOppDetail = async (o: MyOpportunity & { description?: string }) => {
    setSelectedOpp(o);
    try {
      const detail = await fetchNestApi<any>(`/opportunities/${o.id}`);
      if (detail && detail.id) {
        setSelectedOpp(detail);
        const list = detail.interests || detail.interestedMembers || [];
        if (Array.isArray(list) && list.length > 0) {
          setInterestedMembers(list);
        }
      }
      await fetchNestApi(`/opportunities/${o.id}/view`, { method: "POST" });
      setSelectedOpp((prev) =>
        prev && prev.id === o.id ? { ...prev, views: (prev.views || 0) + 1 } : prev,
      );
    } catch {
      /* ignore */
    }
  };

  // Scroll lock for modals
  useEffect(() => {
    if (selectedOpp || createModalOpen || editingOpp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOpp, createModalOpen, editingOpp]);

  // Form for creating new opportunity with full CRM deal fields
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Hợp tác B2B");
  const [newCompany, setNewCompany] = useState("");
  const [newBudgetMin, setNewBudgetMin] = useState("");
  const [newBudgetMax, setNewBudgetMax] = useState("");
  const [newIndustry, setNewIndustry] = useState("Công nghệ & Số hóa");
  const [newRegion, setNewRegion] = useState("Toàn quốc");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactTitle, setNewContactTitle] = useState("");
  const [newReferrer, setNewReferrer] = useState("");
  const [newCommissionPercent, setNewCommissionPercent] = useState("");
  const [newExternalLink, setNewExternalLink] = useState("");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form for editing opportunity
  const [editTitle, setEditTitle] = useState("");
  const [editTag, setEditTag] = useState("Hợp tác B2B");
  const [editCompany, setEditCompany] = useState("");
  const [editBudgetMin, setEditBudgetMin] = useState("");
  const [editBudgetMax, setEditBudgetMax] = useState("");
  const [editIndustry, setEditIndustry] = useState("Công nghệ & Số hóa");
  const [editRegion, setEditRegion] = useState("Toàn quốc");
  const [editDeadline, setEditDeadline] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editContactName, setEditContactName] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editContactTitle, setEditContactTitle] = useState("");
  const [editReferrer, setEditReferrer] = useState("");
  const [editCommissionPercent, setEditCommissionPercent] = useState("");
  const [editRecipientType, setEditRecipientType] = useState<"all" | "by_department" | "friends">("all");
  const [editSelectedRecipientIds, setEditSelectedRecipientIds] = useState<string[]>([]);
  const [editExternalLink, setEditExternalLink] = useState("");
  const [evidenceModalType, setEvidenceModalType] = useState<"open_count" | "open_value" | "my_shared" | "my_dealing" | "my_won" | "my_failed" | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = Boolean(
    (user as any)?.role === "admin" ||
    (user as any)?.role === "platform_admin" ||
    (member as any)?.role === "admin" ||
    (member as any)?.role === "association_admin" ||
    (member as any)?.executiveRole,
  );

  useEffect(() => {
    if (member || user) {
      if (!newContactName)
        setNewContactName(
          member?.name || (user as any)?.name || (user as any)?.username || "Ban Quản Trị",
        );
      if (!newContactPhone)
        setNewContactPhone(member?.phone || (user as any)?.phone || "0900000000");
      if (!newContactTitle) setNewContactTitle(member?.title || "Ban Quản Trị");
      if (!newCompany)
        setNewCompany(
          (member as any)?.company ||
            (member as any)?.companyName ||
            member?.title ||
            "CLB Doanh Nhân CEO 1983",
        );
    }
  }, [member, user]);

  const [benefitSort, setBenefitSort] = useState<"highest_benefit" | "highest_value" | "newest">("highest_benefit");

  const allTab = "Tất cả cơ hội";
  const myOppsTab = "Cơ hội của tôi";
  const myInterestedTab = "Cơ hội tôi quan tâm";
  const myWonTab = "Cơ hội tôi đã chốt được";
  const myDealingTab = "Cơ hội đang deal";
  const myClosedTab = "Cơ hội đã đóng của tôi";
  const whoDealingMyOppTab = "Ai đang quan tâm deal cơ hội của tôi";
  const statsTab = "Thống kê";

  // Check if an opportunity was posted by current user
  const checkIsMine = (o: MyOpportunity) => {
    if (!member && !user) return false;
    const currentUserId = user?.id || (member as any)?.userId || (member as any)?.id;
    return Boolean(
      (currentUserId &&
        o.posterId &&
        String(o.posterId).toLowerCase() === String(currentUserId).toLowerCase()) ||
      (currentUserId &&
        o.posterCode &&
        String(o.posterCode).toLowerCase() === String(currentUserId).toLowerCase()) ||
      ((member as any)?.userId &&
        o.posterId &&
        String(o.posterId).toLowerCase() === String((member as any).userId).toLowerCase()) ||
      ((member as any)?.id &&
        o.posterId &&
        String(o.posterId).toLowerCase() === String((member as any).id).toLowerCase()) ||
      (member?.code &&
        o.posterCode &&
        String(o.posterCode).toLowerCase() === String(member.code).toLowerCase()) ||
      (member?.code &&
        o.posterId &&
        String(o.posterId).toLowerCase() === String(member.code).toLowerCase()) ||
      (member?.name &&
        o.posterName &&
        o.posterName.toLowerCase().trim() === member.name.toLowerCase().trim()) ||
      (member?.name &&
        o.contactName &&
        o.contactName.toLowerCase().trim() === member.name.toLowerCase().trim()) ||
      (member?.title &&
        o.company &&
        o.company.toLowerCase().trim() === member.title.toLowerCase().trim()),
    );
  };

  const checkCanManageOpp = (o: MyOpportunity) => {
    return checkIsMine(o) || isAdmin;
  };

  useEffect(() => {
    if (selectedOpp) {
      if ((selectedOpp as any).interests || (selectedOpp as any).interestedMembers) {
        const preloaded =
          (selectedOpp as any).interests || (selectedOpp as any).interestedMembers || [];
        if (Array.isArray(preloaded) && preloaded.length > 0) {
          setInterestedMembers(preloaded);
        }
      }
      setLoadingInterests(true);
      fetchNestApi<any>(`/opportunities/${selectedOpp.id}/interests`)
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.interests || [];
          if (Array.isArray(list)) {
            setInterestedMembers(list);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingInterests(false));
    } else {
      setInterestedMembers([]);
    }
  }, [selectedOpp]);


  // Helper lấy giá trị số của cơ hội
  function getOppNumericValue(o: any): number {
    if (!o) return 0;
    const bMax = o.budgetMax ?? o.budget_max;
    if (bMax !== undefined && bMax !== null && Number(bMax) > 0) {
      const v = Number(bMax);
      return v <= 100 ? v * 1_000_000_000 : v;
    }
    const bMin = o.budgetMin ?? o.budget_min;
    if (bMin !== undefined && bMin !== null && Number(bMin) > 0) {
      const v = Number(bMin);
      return v <= 100 ? v * 1_000_000_000 : v;
    }
    const est = o.estimatedValue ?? o.estimated_value;
    if (est !== undefined && est !== null && Number(est) > 0) {
      const v = Number(est);
      return v <= 100 ? v * 1_000_000_000 : v;
    }
    if (o.value) {
      return parseVnNumber(o.value);
    }
    return 0;
  }

  const allOpportunities = useMemo(() => {
    const arr = [...activeOppsList];
    arr.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    });
    return arr;
  }, [activeOppsList]);

  // 1. Danh sách cơ hội đang có (đang mở) & Tổng giá trị
  const openOpportunities = useMemo(() => {
    return allOpportunities.filter((o) => {
      const st = (o.status || "").toLowerCase();
      return st !== "closed" && st !== "expired" && st !== "cancelled" && st !== "lost";
    });
  }, [allOpportunities]);

  const totalOpenValue = useMemo(() => {
    let sum = 0;
    openOpportunities.forEach((o) => {
      sum += getOppNumericValue(o);
    });
    return sum;
  }, [openOpportunities]);

  // 2. Cơ hội do chính tôi chia sẻ
  const mySharedOpportunities = useMemo(() => {
    return allOpportunities.filter((o) => checkIsMine(o));
  }, [allOpportunities, checkIsMine]);

  // 3. Cơ hội tôi đang deal
  const myDealingOpportunities = useMemo(() => {
    const currentUserId = user?.id || (member as any)?.userId || (member as any)?.id;
    return allOpportunities.filter((o) => {
      const isMine = checkIsMine(o);
      if (isMine) {
        return (
          o.status === "negotiating" ||
          o.status === "claimed" ||
          (o as any).status === "dealing" ||
          Number((o as any).dealCount) > 0 ||
          Number((o as any).interestedCount) > 0 ||
          Boolean(agreedDeals[o.id]) ||
          (Array.isArray((o as any).interests) && (o as any).interests.length > 0)
        );
      }
      return (
        (o as any).myDealStatus === "dealing" ||
        (o as any).myDealStatus === "negotiating" ||
        Boolean(agreedDeals[o.id]) ||
        (currentUserId && String((o as any).claimedById) === String(currentUserId))
      );
    });
  }, [allOpportunities, checkIsMine, user, member, agreedDeals]);

  // 4. Cơ hội tôi đã nhận được / chốt thành công
  const myWonOpportunities = useMemo(() => {
    const currentUserId = user?.id || (member as any)?.userId || (member as any)?.id;
    return allOpportunities.filter((o) => {
      const isMine = checkIsMine(o);
      if (isMine) {
        return (
          o.status === "won" ||
          (o as any).isWon ||
          (o as any).dealStatus === "won" ||
          (o as any).dealWon
        );
      }
      return (
        (o as any).myDealStatus === "won" ||
        ((o.status === "won" || o.status === "claimed") &&
          currentUserId &&
          String((o as any).claimedById) === String(currentUserId))
      );
    });
  }, [allOpportunities, checkIsMine, user, member]);

  const myWonValue = useMemo(() => {
    let sum = 0;
    myWonOpportunities.forEach((o) => {
      sum += getOppNumericValue(o);
    });
    return sum;
  }, [myWonOpportunities]);

  // 5. Deal tôi đã fail / thất bại / bị từ chối / hủy
  const myFailedOpportunities = useMemo(() => {
    return allOpportunities.filter((o) => {
      const isMine = checkIsMine(o);
      if (isMine) {
        const st = (o.status || "").toLowerCase();
        const dst = ((o as any).dealStatus || "").toLowerCase();
        return (
          st === "lost" ||
          st === "cancelled" ||
          st === "expired" ||
          st === "failed" ||
          dst === "lost" ||
          dst === "failed" ||
          dst === "rejected"
        );
      }
      const mySt = ((o as any).myDealStatus || "").toLowerCase();
      return mySt === "lost" || mySt === "failed" || mySt === "rejected" || mySt === "cancelled";
    });
  }, [allOpportunities, checkIsMine]);

  // Dữ liệu cho Popup Minh chứng dẫn chứng thật
  const evidenceModalData = useMemo(() => {
    switch (evidenceModalType) {
      case "open_count":
        return {
          title: "Tổng số lượng chi tiết cơ hội đang có",
          summary: `${openOpportunities.length} cơ hội đang mở tiếp nhận giao thương trên hệ thống`,
          list: openOpportunities,
        };
      case "open_value":
        return {
          title: "Tổng giá trị cơ hội đang có",
          summary: `${formatSmartPrice(totalOpenValue)} tổng ngân sách dự kiến của các cơ hội đang mở`,
          list: openOpportunities,
        };
      case "my_shared":
        return {
          title: "Số lượng cơ hội tôi đã chia sẻ",
          summary: `${mySharedOpportunities.length} cơ hội do chính tôi đăng tải lên hệ thống`,
          list: mySharedOpportunities,
        };
      case "my_dealing":
        return {
          title: "Số lượng cơ hội tôi đang deal",
          summary: `${myDealingOpportunities.length} thương vụ đang trong tiến trình đàm phán / chào giá`,
          list: myDealingOpportunities,
        };
      case "my_won":
        return {
          title: "Giá trị cơ hội tôi đã nhận được",
          summary: `${formatSmartPrice(myWonValue)} tổng giá trị các cơ hội đã chốt thành công (${myWonOpportunities.length} thương vụ)`,
          list: myWonOpportunities,
        };
      case "my_failed":
        return {
          title: "Số lượng deal tôi đã fail",
          summary: `${myFailedOpportunities.length} deal đã dừng, hủy bỏ hoặc không đạt thỏa thuận`,
          list: myFailedOpportunities,
        };
      default:
        return { title: "", summary: "", list: [] };
    }
  }, [
    evidenceModalType,
    openOpportunities,
    totalOpenValue,
    mySharedOpportunities,
    myDealingOpportunities,
    myWonOpportunities,
    myWonValue,
    myFailedOpportunities,
  ]);

  // CƠ HỘI NỔI BẬT: Top 5 cơ hội xoay vòng spotlight 2 giây/lần (Requirement 4)
  const featuredList = useMemo(() => {
    if (allOpportunities.length > 0) {
      return allOpportunities.slice(0, 5);
    }
    return [
      {
        id: "feat-default-1",
        title: "Hợp tác chuyển đổi số & ứng dụng AI Doanh nghiệp toàn diện",
        company: "Tập Đoàn Công Nghệ Uranus",
        tag: "partnership",
        value: "2.5 Tỷ đ",
        time: new Date().toISOString(),
        image: defaultOppImages[0],
        views: 168,
        contactName: "Phạm Văn Vũ",
        interested: false,
      },
      {
        id: "feat-default-2",
        title: "Kêu gọi hợp tác đầu tư chuỗi sản xuất nông nghiệp công nghệ cao",
        company: "Green Farm Group",
        tag: "investment",
        value: "15 Tỷ đ",
        time: new Date().toISOString(),
        image: defaultOppImages[1],
        views: 284,
        contactName: "Ban Đầu Tư CEO 1983",
        interested: false,
      },
      {
        id: "feat-default-3",
        title: "Tìm nhà phân phối độc quyền thiết bị y tế & phòng xét nghiệm",
        company: "MedTech Vietnam",
        tag: "trade",
        value: "6 Tỷ đ",
        time: new Date().toISOString(),
        image: defaultOppImages[2],
        views: 195,
        contactName: "Nguyễn Minh Châu",
        interested: false,
      },
      {
        id: "feat-default-4",
        title: "Hợp tác mở rộng hệ sinh thái logistics vận chuyển đa quốc gia",
        company: "Viconnect Logistics",
        tag: "supply",
        value: "8.5 Tỷ đ",
        time: new Date().toISOString(),
        image: defaultOppImages[3],
        views: 310,
        contactName: "Trần Đức Nam",
        interested: false,
      },
    ] as (MyOpportunity & { description?: string })[];
  }, [allOpportunities]);

  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // AUTO-ROTATE ẢNH CƠ HỘI CỨ 2 GIÂY/LẦN (Exact 2000ms timer requested)
  useEffect(() => {
    if (isCarouselHovered || featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setSpotlightIdx((prev) => (prev + 1) % featuredList.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isCarouselHovered, featuredList.length]);

  const tabs = useMemo(() => {
    return [
      allTab,
      myOppsTab,
      myInterestedTab,
      myWonTab,
      myDealingTab,
      myClosedTab,
      whoDealingMyOppTab,
      statsTab,
    ];
  }, []);
  const [tab, setTab] = useState(allTab);
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  const list = useMemo(() => {
    const currentUserId = user?.id || (member as any)?.userId || (member as any)?.id;
    const currentMemberCode = member?.code;

    const filtered = allOpportunities.filter((o) => {
      const tagVi = normalizeTag(o.tag);
      const isMine = checkIsMine(o);

      let matchTab = true;
      if (tab === allTab) {
        matchTab = true;
      } else if (tab === myOppsTab) {
        matchTab = Boolean(isMine);
      } else if (tab === myInterestedTab) {
        // Cơ hội tôi quan tâm (không phải do tôi đăng, và tôi đã bấm quan tâm)
        const isInterested =
          !isMine &&
          (Boolean((o as any).interested) ||
            interestedIds.includes(o.id) ||
            (Array.isArray((o as any).interests) &&
              (o as any).interests.some(
                (int: any) =>
                  String(int.memberId) === String(currentUserId) ||
                  String(int.contact) === String(currentUserId) ||
                  (currentMemberCode && String(int.memberCode) === String(currentMemberCode)),
              )));
        matchTab = Boolean(isInterested);
      } else if (tab === myWonTab) {
        // Cơ hội tôi đã chốt được (Req 3)
        const isWon =
          isMine &&
          (o.status === "won" ||
            o.status === "claimed" ||
            (o as any).isWon ||
            (o as any).dealStatus === "won" ||
            (o as any).dealWon);
        matchTab = Boolean(isWon);
      } else if (tab === myDealingTab) {
        // Cơ hội đang deal (Req 3)
        const isDealing =
          (isMine &&
            (o.status === "negotiating" ||
              o.status === "claimed" ||
              (o as any).status === "dealing" ||
              Number((o as any).dealCount) > 0 ||
              Number((o as any).interestedCount) > 0)) ||
          (!isMine &&
            ((o as any).myDealStatus === "dealing" ||
              (o as any).myDealStatus === "negotiating" ||
              (currentUserId && String((o as any).claimedById) === String(currentUserId))));
        matchTab = Boolean(isDealing);
      } else if (tab === myClosedTab) {
        // Cơ hội đã đóng của tôi (Req 3)
        const isClosed =
          isMine &&
          (o.status === "closed" ||
            o.status === "expired" ||
            o.status === "cancelled" ||
            o.status === "lost" ||
            (o as any).status === "archived");
        matchTab = Boolean(isClosed);
      } else if (tab === whoDealingMyOppTab) {
        // Ai đang quan tâm deal cơ hội của tôi (Req 3)
        const hasDealer =
          isMine &&
          (Boolean((o as any).claimedById) ||
            Boolean((o as any).claimedByName) ||
            (o as any).status === "claimed" ||
            (o as any).status === "negotiating" ||
            Number((o as any).dealCount) > 0 ||
            Number((o as any).interestedCount) > 0 ||
            Boolean((o as any).interested) ||
            (Array.isArray((o as any).interests) && (o as any).interests.length > 0));
        matchTab = Boolean(hasDealer);
      } else if (tab === statsTab) {
        matchTab = true;
      } else {
        matchTab = tagVi === tab;
      }

      if (!matchTab) return false;

      // Bộ lọc Ngành nghề
      if (industryFilter !== "all") {
        const indTarget = OPPORTUNITY_INDUSTRIES.find((x) => x.id === industryFilter)?.label || industryFilter;
        const normIndTarget = indTarget.toLowerCase().replace(/[^a-z0-9]/g, "");
        const oppInd = (o.industry || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const fullText = (o.title + " " + (o.description || "") + " " + (o.company || "")).toLowerCase();
        const matchesInd =
          oppInd.includes(normIndTarget) ||
          normIndTarget.includes(oppInd) ||
          indTarget.split("&").some((part) => fullText.includes(part.trim().toLowerCase()));
        if (!matchesInd) return false;
      }

      const matchQ = !q || (o.title + o.company + tagVi + (o.industry || "")).toLowerCase().includes(q.toLowerCase());
      return matchQ;
    });

    // Nếu ở tab "Ai đang quan tâm deal cơ hội của tôi", áp dụng bộ lọc % có lợi nhất cho tôi (Req 3)
    if (tab === whoDealingMyOppTab) {
      return [...filtered].sort((a, b) => {
        if (benefitSort === "highest_benefit") {
          const benefitA = (a as any).commissionPercent || (a as any).commissionRate || (a as any).marginPercent || (a.budgetMax ? a.budgetMax / 1000000 : 0);
          const benefitB = (b as any).commissionPercent || (b as any).commissionRate || (b as any).marginPercent || (b.budgetMax ? b.budgetMax / 1000000 : 0);
          return Number(benefitB) - Number(benefitA);
        }
        if (benefitSort === "highest_value") {
          const valA = a.estimatedValue || a.budgetMax || 0;
          const valB = b.estimatedValue || b.budgetMax || 0;
          return Number(valB) - Number(valA);
        }
        const timeA = (a as any).createdAt || a.time ? new Date((a as any).createdAt || a.time).getTime() : 0;
        const timeB = (b as any).createdAt || b.time ? new Date((b as any).createdAt || b.time).getTime() : 0;
        return timeB - timeA;
      });
    }

    return filtered;
  }, [allOpportunities, tab, q, member, industryFilter, benefitSort, user?.id, interestedIds]);

  const [pageOpps, setPageOpps] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);
  const OPP_PAGE_SIZE = 12;

  const toggleSave = (id: string) => {
    setSavedOppIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((x) => x !== id) : [...prev, id];
      toast.success(isSaved ? "Đã bỏ lưu tin cơ hội" : "Đã lưu cơ hội vào danh mục quan tâm");
      return next;
    });
  };

  useEffect(() => {
    setPageOpps(1);
  }, [q, tab, industryFilter]);

  async function interest(id: string, targetOpp?: any) {
    const opp = targetOpp || (opportunities || []).find((x) => x.id === id);
    setBusy(id);
    try {
      await doInterest({ data: { opportunityId: id } });
      setInterestedIds((prev) => Array.from(new Set([...prev, id])));
      recordUserActivity({
        action: "INTEREST_OPPORTUNITY",
        title: `Quan tâm cơ hội: ${opp?.title || id}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: {
          oppId: id,
          oppTitle: opp?.title,
          detail: `Hội viên bấm quan tâm cơ hội: "${opp?.title || id}"`,
        },
      });
      toast.success("Đã ghi nhận sự quan tâm kết nối của Quý CEO!");
      reload();
    } catch (e) {
      setInterestedIds((prev) => Array.from(new Set([...prev, id])));
      recordUserActivity({
        action: "INTEREST_OPPORTUNITY",
        title: `Quan tâm cơ hội: ${opp?.title || id}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: {
          oppId: id,
          oppTitle: opp?.title,
          detail: `Hội viên bấm quan tâm cơ hội: "${opp?.title || id}"`,
        },
      });
      toast.success("Đã ghi nhận sự quan tâm kết nối của Quý CEO!");
    } finally {
      setBusy(null);
    }
  }

  async function uninterest(id: string, targetOpp?: any) {
    setBusy(id);
    try {
      await fetchNestApi(`/opportunities/${id}/interests`, {
        method: "DELETE",
      }).catch(() => {
        return fetchNestApi(`/opportunities/${id}/uninterest`, { method: "POST" });
      });
      setInterestedIds((prev) => prev.filter((x) => x !== id));
      recordUserActivity({
        action: "UNINTEREST_OPPORTUNITY",
        title: `Hủy quan tâm cơ hội: ${targetOpp?.title || id}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: { oppId: id, oppTitle: targetOpp?.title },
      });
      toast.success("Đã hủy quan tâm cơ hội!");
      reload();
    } catch (e) {
      setInterestedIds((prev) => prev.filter((x) => x !== id));
      recordUserActivity({
        action: "UNINTEREST_OPPORTUNITY",
        title: `Hủy quan tâm cơ hội: ${targetOpp?.title || id}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: { oppId: id, oppTitle: targetOpp?.title },
      });
      toast.success("Đã hủy quan tâm cơ hội!");
    } finally {
      setBusy(null);
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    const tid = toast.loading(`Đang tải ${files.length} ảnh lên máy chủ MinIO...`);
    try {
      const uploadPromises = Array.from(files).map((f) => uploadFileToNest(f, "opportunities"));
      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      if (uploadedUrls.length > 0) {
        if (isEdit) {
          const merged = [...editImages, ...uploadedUrls];
          setEditImages(merged);
          setEditImage(merged[0]);
        } else {
          const merged = [...newImages, ...uploadedUrls];
          setNewImages(merged);
          setNewImage(merged[0]);
        }
        toast.success(`Đã tải thành công ${uploadedUrls.length} ảnh lên MinIO!`, { id: tid });
      }
    } catch (err: any) {
      toast.error(err?.message || "Tải ảnh lên máy chủ thất bại!", { id: tid });
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const startEditOpp = (o: MyOpportunity & { description?: string }, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOpp(o);
    setEditTitle(o.title || "");
    setEditTag(normalizeTag(o.tag || "Hợp tác B2B"));
    setEditCompany(o.company || member?.title || "");
    setEditBudgetMin(o.budgetMin ? Number(o.budgetMin).toLocaleString("vi-VN") : "");
    setEditBudgetMax(o.budgetMax ? Number(o.budgetMax).toLocaleString("vi-VN") : "");
    setEditDesc(o.description || "");
    const oppImgs = (o as any).images && Array.isArray((o as any).images) && (o as any).images.length > 0
      ? (o as any).images
      : (o.image ? [o.image] : []);
    setEditImage(o.image || oppImgs[0] || null);
    setEditImages(oppImgs);
    setEditContactName(o.contactName || member?.name || "");
    setEditContactPhone(o.contactPhone || member?.phone || "");
    setEditContactTitle(o.contactTitle || member?.title || "");
    setEditIndustry("Công nghệ & Số hóa");
    setEditRegion("Toàn quốc");
    setEditDeadline("");
  };

  const handleDeleteOpp = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa cơ hội giao thương này khỏi hệ thống không?"))
      return;
    try {
      await fetchNestApi(`/opportunities/${id}`, { method: "DELETE" });
      recordUserActivity({
        action: "DELETE_OPPORTUNITY",
        title: `Đã đóng/xóa cơ hội: ${selectedOpp?.title || id}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: {
          oppId: id,
          title: selectedOpp?.title,
          detail: `Hội viên đã đóng/xóa cơ hội giao thương khỏi sàn B2B`,
        },
      });
      toast.success("Đã xóa cơ hội thành công!");
      setLocalOpps((prev) => (prev || []).filter((o) => o.id !== id));
      if (selectedOpp?.id === id) {
        setSelectedOpp(null);
      }
      reload();
    } catch {
      recordUserActivity({
        action: "DELETE_OPPORTUNITY",
        title: `Đã đóng/xóa cơ hội: ${selectedOpp?.title || id}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: {
          oppId: id,
          title: selectedOpp?.title,
          detail: `Hội viên đã đóng/xóa cơ hội giao thương khỏi sàn B2B`,
        },
      });
      toast.error("Không thể xóa cơ hội. Vui lòng thử lại!");
    }
  };

  const handleUpdateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;
    const result = opportunitySchema.safeParse({
      title: editTitle,
      contactName: editContactName,
      contactPhone: editContactPhone,
    });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errMap[key]) errMap[key] = issue.message;
      }
      setEditErrors(errMap);
      return;
    }
    setEditErrors({});
    setUpdating(true);
    const cleanBudgetMin = Number(editBudgetMin.replace(/\D/g, "")) || 0;
    const cleanBudgetMax = Number(editBudgetMax.replace(/\D/g, "")) || 0;

    const finalImgs = editImages.length > 0 ? editImages : (editImage ? [editImage] : []);

    try {
      const updateData = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        type: editTag,
        budgetMin: cleanBudgetMin,
        budgetMax: cleanBudgetMax,
        region: editRegion,
        industry: editIndustry,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : undefined,
        contactName: editContactName.trim(),
        contactPhone: editContactPhone.trim(),
        contactTitle: editContactTitle.trim(),
        company: editCompany.trim(),
        image: finalImgs[0] || null,
        images: finalImgs,
      };

      await fetchNestApi(`/opportunities/${editingOpp.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      const updatedVal =
        cleanBudgetMin && cleanBudgetMax && cleanBudgetMin !== cleanBudgetMax
          ? `${cleanBudgetMin.toLocaleString("vi-VN")} - ${cleanBudgetMax.toLocaleString("vi-VN")} đ`
          : cleanBudgetMax
          ? `${cleanBudgetMax.toLocaleString("vi-VN")} đ`
          : cleanBudgetMin
          ? `Từ ${cleanBudgetMin.toLocaleString("vi-VN")} đ`
          : "Thỏa thuận B2B";

      setLocalOpps((prev) =>
        (prev || []).map((o) =>
          o.id === editingOpp.id
            ? {
                ...o,
                title: editTitle.trim(),
                description: editDesc.trim(),
                tag: editTag,
                company: editCompany.trim(),
                contactName: editContactName.trim(),
                contactPhone: editContactPhone.trim(),
                contactTitle: editContactTitle.trim(),
                industry: editIndustry,
                region: editRegion,
                budgetMin: cleanBudgetMin || undefined,
                budgetMax: cleanBudgetMax || undefined,
                value: updatedVal,
                image: finalImgs[0] || o.image,
                images: finalImgs,
              }
            : o,
        ),
      );

      toast.success("Cập nhật cơ hội thành công!");
      setEditingOpp(null);
      if (selectedOpp?.id === editingOpp.id) {
        setSelectedOpp(null);
      }
      reload();
    } catch {
      toast.error("Không thể cập nhật cơ hội. Vui lòng thử lại!");
    } finally {
      setUpdating(false);
    }
  };

  async function handleCreateOpp(e: React.FormEvent) {
    e.preventDefault();
    const result = opportunitySchema.safeParse({
      title: newTitle,
      contactName: newContactName,
      contactPhone: newContactPhone,
    });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errMap[key]) errMap[key] = issue.message;
      }
      setNewErrors(errMap);
      return;
    }
    setNewErrors({});
    const finalContactName =
      newContactName.trim() || member?.name || (user as any)?.name || "Ban Quản Trị";
    const finalContactPhone =
      newContactPhone.trim() || member?.phone || (user as any)?.phone || "0900000000";
    const finalCompany =
      newCompany.trim() ||
      (member as any)?.company ||
      (member as any)?.companyName ||
      member?.title ||
      "CLB Doanh Nhân CEO 1983";

    setCreating(true);
    const cleanBudgetMin = Number(newBudgetMin.replace(/\D/g, "")) || 0;
    const cleanBudgetMax = Number(newBudgetMax.replace(/\D/g, "")) || 0;

    const finalImgs = newImages.length > 0 ? newImages : (newImage ? [newImage] : []);

    try {
      const createRes = await fetchNestApi<any>("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          description:
            newDesc.trim() ||
            `${finalCompany} - Cơ hội: ${newTitle.trim()}. Khu vực: ${newRegion}. Ngành nghề: ${newIndustry}`,
          type: newTag,
          budgetMin: cleanBudgetMin,
          budgetMax: cleanBudgetMax,
          region: newRegion,
          industry: newIndustry,
          deadline: newDeadline
            ? new Date(newDeadline).toISOString()
            : new Date(Date.now() + 30 * 86400000).toISOString(),
          contactName: finalContactName,
          contactPhone: finalContactPhone,
          contactTitle: newContactTitle.trim() || "Đại diện hợp tác",
          company: finalCompany,
          image: finalImgs[0] || null,
          images: finalImgs,
          referrer: newReferrer.trim() || undefined,
          commissionPercent: newCommissionPercent ? Number(newCommissionPercent.replace(/\D/g, "")) : undefined,
          targetRecipients: selectedRecipientIds.length > 0 ? selectedRecipientIds : undefined,
        }),
      });

      const newOppVal =
        cleanBudgetMin && cleanBudgetMax && cleanBudgetMin !== cleanBudgetMax
          ? `${cleanBudgetMin.toLocaleString("vi-VN")} - ${cleanBudgetMax.toLocaleString("vi-VN")} đ`
          : cleanBudgetMax
          ? `${cleanBudgetMax.toLocaleString("vi-VN")} đ`
          : cleanBudgetMin
          ? `Từ ${cleanBudgetMin.toLocaleString("vi-VN")} đ`
          : "Thỏa thuận B2B";

      const createdId = createRes?.id || `opp_${Date.now()}`;
      const newOppItem: any = {
        id: String(createdId),
        title: newTitle.trim(),
        description: newDesc.trim() || `${finalCompany} - Cơ hội: ${newTitle.trim()}`,
        tag: newTag,
        company: finalCompany,
        contactName: finalContactName,
        contactPhone: finalContactPhone,
        contactTitle: newContactTitle.trim() || "Đại diện hợp tác",
        industry: newIndustry,
        region: newRegion,
        budgetMin: cleanBudgetMin || undefined,
        budgetMax: cleanBudgetMax || undefined,
        value: newOppVal,
        time: new Date().toISOString(),
        image: finalImgs[0] || null,
        thumbnail: finalImgs[0] || null,
        images: finalImgs,
        status: "open",
        posterId: user?.id || "admin",
      };

      setLocalOpps((prev) => [newOppItem, ...(prev || [])]);

      recordUserActivity({
        action: "CREATE_OPPORTUNITY",
        title: `Tạo cơ hội giao thương: ${newTitle.trim()}`,
        badge: "Giao thương",
        userId: user?.id,
        metadata: {
          oppId: String(createdId),
          title: newTitle.trim(),
          budget: newOppVal,
          industry: newIndustry,
          detail: `Quy mô: ${newOppVal}. Ngành nghề: ${newIndustry}.`,
        },
      });

      toast.success("Đã đăng cơ hội thành công lên hệ thống!");
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewBudgetMin("");
      setNewBudgetMax("");
      setNewDeadline("");
      setNewReferrer("");
      setNewCommissionPercent("");
      setSelectedRecipientIds([]);
      setRecipientType("all");
      setNewImage(null);
      setNewImages([]);
      reload();
    } catch {
      toast.error("Không thể đăng cơ hội. Vui lòng thử lại!");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-stone-50 flex flex-col justify-start items-start font-sans pb-24">
      {/* ── TOP HEADER (CEO Cơ Hội + HN Badge) ── */}
      <div className="ceo-safe-sticky sticky top-0 z-30 self-stretch px-5 py-4 bg-white border-b border-slate-200 inline-flex justify-between items-center shadow-xs">
        <div className="flex justify-start items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-1 -ml-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="Quay lại"
          >
            <ChevronLeft className="size-5 text-sky-950" />
          </button>
          <div className="justify-start text-sky-950 text-lg font-bold font-['Inter']">
            CEO Cơ Hội
          </div>
        </div>
        <div className="flex justify-start items-center gap-3">
          <div className="size-9 bg-sky-950 rounded-2xl flex justify-center items-center shadow-xs">
            <div className="justify-start text-white text-xs font-bold font-['Inter']">HN</div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT (ẢNH 2 FIGMA SPEC) ── */}
      <div className="self-stretch px-4 pt-4 pb-28 flex flex-col justify-start items-start gap-5">
                {/* ── 6 CHỈ SỐ CHI TIẾT CƠ HỘI NỀN TRẮNG (CẤM NỀN XANH - REQ 3) ── */}
        <div className="self-stretch flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Chỉ Số Giao Thương &amp; Dẫn Chứng
              </span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Chạm ô để xem minh chứng
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* 1. Tổng số lượng chi tiết cơ hội đang có */}
            <button
              type="button"
              onClick={() => setEvidenceModalType("open_count")}
              className="p-3 bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Cơ hội đang có
                </span>
                <Layers className="size-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {openOpportunities.length}
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">tin</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Đang mở toàn sàn</span>
                <ChevronRight className="size-3 text-slate-600 dark:text-slate-400" />
              </div>
            </button>

            {/* 2. Tổng giá trị cơ hội đang có */}
            <button
              type="button"
              onClick={() => setEvidenceModalType("open_value")}
              className="p-3 bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Tổng giá trị
                </span>
                <TrendingUp className="size-3.5 text-amber-500" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {formatSmartPrice(totalOpenValue)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Ngân sách dự kiến</span>
                <ChevronRight className="size-3 text-slate-600 dark:text-slate-400" />
              </div>
            </button>

            {/* 3. Số lượng tôi đã chia sẻ */}
            <button
              type="button"
              onClick={() => setEvidenceModalType("my_shared")}
              className="p-3 bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Tôi đã chia sẻ
                </span>
                <Share2 className="size-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {mySharedOpportunities.length}
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">tin</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Do tôi đăng tải</span>
                <ChevronRight className="size-3 text-slate-600 dark:text-slate-400" />
              </div>
            </button>

            {/* 4. Số lượng tôi đang deal */}
            <button
              type="button"
              onClick={() => setEvidenceModalType("my_dealing")}
              className="p-3 bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Tôi đang deal
                </span>
                <Handshake className="size-3.5 text-amber-500" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {myDealingOpportunities.length}
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">thương vụ</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Đang thương thảo</span>
                <ChevronRight className="size-3 text-slate-600 dark:text-slate-400" />
              </div>
            </button>

            {/* 5. Giá trị cơ hội tôi đã nhận được */}
            <button
              type="button"
              onClick={() => setEvidenceModalType("my_won")}
              className="p-3 bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Giá trị đã nhận
                </span>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatSmartPrice(myWonValue)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Đã chốt thành công</span>
                <ChevronRight className="size-3 text-slate-600 dark:text-slate-400" />
              </div>
            </button>

            {/* 6. Số lượng deal tôi đã fail */}
            <button
              type="button"
              onClick={() => setEvidenceModalType("my_failed")}
              className="p-3 bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Deal đã fail
                </span>
                <XCircle className="size-3.5 text-rose-500" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {myFailedOpportunities.length}
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">deal</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Dừng / Hủy / Không đạt</span>
                <ChevronRight className="size-3 text-slate-600 dark:text-slate-400" />
              </div>
            </button>
          </div>
        </div>

        {/* 3. SEARCH & CHIPS & BỘ LỌC NGÀNH NGHỀ & % CÓ LỢI NHẤT */}
        <div className="self-stretch flex flex-col gap-2.5">
          <div className="self-stretch px-3 py-2 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-start items-center gap-2 shadow-2xs">
            <Search className="size-4 text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm cơ hội, đối tác, dự án..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 font-['Inter']"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="size-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition cursor-pointer"
                title="Xóa nội dung"
                aria-label="Xóa nội dung"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Bộ lọc % có lợi nhất cho tôi (Req 3 - Hiển thị trong tab Ai đang quan tâm deal cơ hội của tôi) */}
          {tab === whoDealingMyOppTab && (
            <div className="self-stretch p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col gap-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Percent className="size-4 text-amber-600 dark:text-amber-400" />
                  Sắp xếp ưu tiên quyền lợi cho Quý CEO:
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setBenefitSort("highest_benefit")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    benefitSort === "highest_benefit"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span>🏆 % Có lợi nhất cho tôi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBenefitSort("highest_value")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    benefitSort === "highest_value"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span>💎 Giá trị deal cao nhất</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBenefitSort("newest")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    benefitSort === "newest"
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span>🕒 Mới nhất</span>
                </button>
              </div>
            </div>
          )}

          {/* Bộ lọc Ngành nghề (Yêu cầu cuộc họp) */}
          <div className="self-stretch inline-flex justify-start items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-1">Ngành nghề:</span>
            {OPPORTUNITY_INDUSTRIES.map((ind) => {
              const isActive = industryFilter === ind.id;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setIndustryFilter(ind.id)}
                  className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {ind.label}
                </button>
              );
            })}
          </div>

          <div id="tour-opps-type-filter" className="self-stretch inline-flex justify-start items-start gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {tabs.map((tItem) => {
              const isActive = tab === tItem;
              return (
                <button
                  key={tItem}
                  type="button"
                  onClick={() => setTab(tItem)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-[100px] text-xs transition cursor-pointer font-['Inter'] ${
                    isActive
                      ? "bg-sky-950 text-white font-bold"
                      : "bg-white text-slate-500 font-semibold outline outline-1 outline-offset-[-1px] outline-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tItem}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. OPPORTUNITY LIST (ẢNH 2 FIGMA SPEC) */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <div className="self-stretch pt-2 flex flex-col justify-start items-start gap-3">
            <div className="self-stretch px-1 inline-flex justify-between items-center">
              <div className="justify-start text-blue-900 text-sm font-extrabold font-['Inter'] uppercase">
                DANH SÁCH CHIA SẺ CƠ HỘI ({list.length})
              </div>
              <div className="flex justify-start items-center gap-1">
                <span className="justify-start text-sky-950 text-xs font-semibold font-['Inter']">
                  Mới nhất
                </span>
              </div>
            </div>

            {loading && (
              <p className="py-6 text-center text-xs text-slate-400 w-full">
                Đang tải dữ liệu cơ hội...
              </p>
            )}

            {tab === statsTab ? (
              <div className="self-stretch p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col gap-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-[#003B95]" />
                    <span className="text-sm font-bold text-sky-950">Báo Cáo & Thống Kê Cơ Hội Giao Thương</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Thời gian thực</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 font-medium">Tổng cơ hội đã đăng</span>
                    <span className="text-lg font-black text-sky-950">{totalOppCount} tin</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Dữ liệu thực tế</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-1">
                    <span className="text-[11px] text-amber-700 font-medium">Tổng giá trị giao dịch</span>
                    <span className="text-lg font-black text-amber-600">{formatSmartPrice(totalOpportunitiesValue)}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Cam kết nội khối</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-col gap-1">
                    <span className="text-[11px] text-blue-700 font-medium">Lượt quan tâm đã gửi</span>
                    <span className="text-lg font-black text-[#003B95]">{interestedIds.length} lượt</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Ghi nhận realtime</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                    <span className="text-[11px] text-emerald-700 font-medium">Cơ hội đang mở</span>
                    <span className="text-lg font-black text-emerald-700">{list.length} tin</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Sẵn sàng hợp tác</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Phân bổ theo hình thức hợp tác</span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Hợp tác B2B & Chuyển giao</span>
                        <span>{list.filter(x => normalizeTag(x.tag).toLowerCase().includes("b2b")).length > 0 ? Math.round((list.filter(x => normalizeTag(x.tag).toLowerCase().includes("b2b")).length / (list.length || 1)) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-sky-950 rounded-full" style={{ width: `${list.filter(x => normalizeTag(x.tag).toLowerCase().includes("b2b")).length > 0 ? Math.round((list.filter(x => normalizeTag(x.tag).toLowerCase().includes("b2b")).length / (list.length || 1)) * 100) : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Logistics & Chuỗi cung ứng</span>
                        <span>{list.filter(x => normalizeTag(x.tag).toLowerCase().includes("logistics")).length > 0 ? Math.round((list.filter(x => normalizeTag(x.tag).toLowerCase().includes("logistics")).length / (list.length || 1)) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${list.filter(x => normalizeTag(x.tag).toLowerCase().includes("logistics")).length > 0 ? Math.round((list.filter(x => normalizeTag(x.tag).toLowerCase().includes("logistics")).length / (list.length || 1)) * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {(() => {
                const displayItems = list;
                if (displayItems.length === 0) {
                  return (
                    <div className="self-stretch py-10 px-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                      <div className="size-12 rounded-2xl bg-blue-50 grid place-items-center">
                        <Handshake className="size-6 text-[#003B95]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Chưa có cơ hội kinh doanh nào</h4>
                        <p className="text-xs text-slate-500 max-w-xs mt-1">
                          Các cơ hội kết nối và giao thương từ hội viên sẽ hiển thị tại đây khi được thêm vào hệ thống.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="mt-1 px-4 py-2 bg-sky-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-sky-900 transition cursor-pointer shadow-xs active:scale-95"
                      >
                        <Plus className="size-4" />
                        <span>Chia sẻ cơ hội mới</span>
                      </button>
                    </div>
                  );
                }

                return displayItems
                  .slice((pageOpps - 1) * OPP_PAGE_SIZE, pageOpps * OPP_PAGE_SIZE)
                  .map((o, idx) => {
                    const tagVi = normalizeTag(o.tag);
                    const isLogistics =
                      o.tag?.toLowerCase().includes("logistics") ||
                      tagVi.toLowerCase().includes("logistics");
                    const rawOppImg = o.image;
                    const oppImg =
                      (rawOppImg &&
                      (rawOppImg.startsWith("data:") ||
                        rawOppImg.startsWith("http") ||
                        rawOppImg.startsWith("/"))
                        ? rawOppImg.startsWith("data:")
                          ? rawOppImg
                          : resolveMediaUrl(rawOppImg) || rawOppImg
                        : null) || defaultOppImages[idx % defaultOppImages.length];

                    return (
                      <div
                        key={o.id}
                        id={idx === 0 ? "tour-opps-card-item" : undefined}
                        className="self-stretch bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden shadow-xs hover:border-[#001B54]/30 transition-all"
                      >
                        <div
                          onClick={() => handleOpenOppDetail(o)}
                          className="self-stretch p-3 inline-flex justify-start items-center gap-3 cursor-pointer"
                        >
                          <img
                            className="size-20 rounded-lg object-cover shrink-0"
                            src={oppImg}
                            alt={o.title}
                          />
                          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1.5">
                            <div className="self-stretch inline-flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <div
                                  className={`px-1.5 py-0.5 ${
                                    isLogistics ? "bg-indigo-100" : "bg-amber-100"
                                  } rounded-sm flex justify-start items-start`}
                                >
                                  <div
                                    className={`justify-start ${
                                      isLogistics ? "text-blue-900" : "text-amber-600"
                                    } text-[9px] font-extrabold font-['Inter']`}
                                  >
                                    {isLogistics ? "LOGISTICS" : (o.tag || "HỢP TÁC B2B").toUpperCase()}
                                  </div>
                                </div>
                                <span
                                  className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                                    o.tradeType === "buyer"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {o.tradeType === "buyer" ? "BÊN MUA" : "BÊN BÁN"}
                                </span>
                              </div>
                              <div className="justify-start text-zinc-600 text-[10px] font-normal font-['Inter']">
                                {o.time
                                  ? new Date(o.time).toLocaleDateString("vi-VN")
                                  : "Đang mở"}
                              </div>
                            </div>
                            <div className="self-stretch justify-start text-black text-xs font-bold font-['Inter'] leading-4 line-clamp-2">
                              {o.title}
                            </div>
                            <div className="justify-start text-zinc-600 text-xs font-normal font-['Inter'] truncate w-full">
                              Đăng bởi:{" "}
                              {o.posterName || o.contactName || o.company || "Hội viên CLB CEO 1983"}
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch px-3 py-2 bg-gray-50 border-t border-slate-200 inline-flex justify-between items-center">
                          <div className="justify-start text-blue-900 text-xs font-bold font-['Inter']">
                            {formatSmartPrice(
                              o.value ||
                              (o.budgetMax ?? (o as any).budget_max) ||
                              (o.budgetMin ?? (o as any).budget_min) ||
                              (o.estimatedValue ?? (o as any).estimated_value)
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                executeShare(
                                  {
                                    type: "opportunity",
                                    id: o.id,
                                    title: `[Cơ Hội Giao Thương B2B] ${o.title} — CLB CEO 1983`,
                                    desc: o.description || `Cơ hội hợp tác kinh doanh CEO 1983: ${o.title} (${formatSmartPrice(o.value)})`,
                                    image: (o as any).images?.[0] || (o as any).image || undefined,
                                    targetPath: `/association/opportunities?id=${o.id}`,
                                  },
                                  () => toast.success("Đã sao chép liên kết cơ hội hợp tác!")
                                );
                              }}
                              className="size-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 grid place-items-center transition active:scale-95 cursor-pointer shadow-2xs"
                              title="Chia sẻ cơ hội"
                            >
                              <Share2 className="size-3.5" />
                            </button>

                            {checkIsMine(o) ? (
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => startEditOpp(o as any, e)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Chỉnh sửa cơ hội"
                                >
                                  <Pencil className="size-3" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteOpp(o.id, e)}
                                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Xóa cơ hội"
                                >
                                  <Trash2 className="size-3" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 justify-end">
                                {agreedDeals[o.id] ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-md text-[10.5px] font-bold flex items-center gap-1">
                                      <Check className="size-3" /> Deal đã đồng ý
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate({
                                          to: "/association/connect" as any,
                                          search: {
                                            partnerName: o.contactName || o.company || "Chủ cơ hội",
                                            partnerCompany: o.company || "CLB CEO 1983",
                                            notes: `Gặp gỡ 1-1 xúc tiến thương vụ: ${o.title}`,
                                          } as any,
                                        });
                                      }}
                                      className="px-3 py-1.5 bg-[#003B95] hover:bg-[#002B70] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
                                    >
                                      <Calendar className="size-3.5" />
                                      <span>Kết nối cuộc gặp</span>
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {o.interested || interestedIds.includes(o.id) ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          uninterest(o.id, o);
                                        }}
                                        disabled={busy === o.id}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                        title="Bấm để hủy quan tâm cơ hội này"
                                      >
                                        <HeartOff className="size-3 text-rose-500" />
                                        <span>Bỏ quan tâm</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          interest(o.id, o);
                                        }}
                                        disabled={busy === o.id}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                                      >
                                        <Heart className="size-3" />
                                        <span>Quan tâm</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDealModal(o);
                                      }}
                                      className="px-3 py-1.5 bg-[#003B95] hover:bg-[#002b6e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
                                    >
                                      <Handshake className="size-3.5 text-amber-300" />
                                      <span>Deal chào giá</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
            )}
          </div>
        </div>

        {/* 5. BOTTOM CTA CARD (ẢNH 2 FIGMA SPEC) */}
        <div className="self-stretch p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start gap-3 shadow-xs">
          <div className="self-stretch justify-start text-sky-950 text-sm font-bold font-['Inter']">
            Bạn có cơ hội kinh doanh mới?
          </div>
          <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter']">
            Hãy chia sẻ với mạng lưới CEO1983 để tiếp cận trực tiếp nguồn nhà thầu, đối tác uy tín
            trong cộng đồng nội khối.
          </div>
          <button
            id="tour-opps-create-btn"
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="self-stretch px-4 py-3 bg-[#003B95] hover:bg-[#002B70] text-white font-bold rounded-[100px] inline-flex justify-center items-center transition cursor-pointer active:scale-95 shadow-md shadow-[#003B95]/20"
          >
            <div className="justify-start text-white text-xs font-bold font-['Inter']">
              Đăng cơ hội ngay →
            </div>
          </button>
        </div>
      </div>

            {/* Modals extracted to @/components/opportunities/modals */}
      <OpportunityDetailModal
        selectedOpp={selectedOpp}
        allOpportunities={allOpportunities}
        onClose={() => setSelectedOpp(null)}
        defaultOppImages={defaultOppImages}
        resolveMediaUrl={resolveMediaUrl}
        normalizeTag={normalizeTag}
        formatSmartPrice={formatSmartPrice}
        fmt={fmt}
        checkCanManageOpp={checkCanManageOpp}
        interestedMembers={interestedMembers}
        loadingInterests={loadingInterests}
        handleNegotiateWithMember={handleNegotiateWithMember}
        navigate={navigate}
        checkIsMine={checkIsMine}
        onEdit={startEditOpp}
        onDelete={handleDeleteOpp}
        onNegotiate={handleNegotiate}
        interestedIds={interestedIds}
        onInterest={interest}
        onUninterest={uninterest}
      />

      <OpportunityCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateOpp}
        newImage={newImage}
        setNewImage={setNewImage}
        newImages={newImages}
        setNewImages={setNewImages}
        imageInputRef={imageInputRef}
        handleImageFileChange={handleImageFileChange}
        uploadingImage={uploadingImage}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newErrors={newErrors}
        setNewErrors={setNewErrors}
        newTag={newTag}
        setNewTag={setNewTag}
        newCompany={newCompany}
        setNewCompany={setNewCompany}
        newBudgetMin={newBudgetMin}
        setNewBudgetMin={setNewBudgetMin}
        newBudgetMax={newBudgetMax}
        setNewBudgetMax={setNewBudgetMax}
        newIndustry={newIndustry}
        setNewIndustry={setNewIndustry}
        newRegion={newRegion}
        setNewRegion={setNewRegion}
        newDeadline={newDeadline}
        setNewDeadline={setNewDeadline}
        newContactName={newContactName}
        setNewContactName={setNewContactName}
        newContactPhone={newContactPhone}
        setNewContactPhone={setNewContactPhone}
        newContactTitle={newContactTitle}
        setNewContactTitle={setNewContactTitle}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
        creating={creating}
        resolveMediaUrl={resolveMediaUrl}
        newReferrer={newReferrer}
        setNewReferrer={setNewReferrer}
        newCommissionPercent={newCommissionPercent}
        setNewCommissionPercent={setNewCommissionPercent}
        selectedRecipientIds={selectedRecipientIds}
        setSelectedRecipientIds={setSelectedRecipientIds}
      />

      <OpportunityEditModal
        isOpen={Boolean(editingOpp)}
        onClose={() => setEditingOpp(null)}
        onSubmit={handleUpdateOpp}
        editImage={editImage}
        setEditImage={setEditImage}
        editImages={editImages}
        setEditImages={setEditImages}
        editImageInputRef={editImageInputRef}
        handleImageFileChange={handleImageFileChange}
        uploadingImage={uploadingImage}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editErrors={editErrors}
        setEditErrors={setEditErrors}
        editTag={editTag}
        setEditTag={setEditTag}
        editCompany={editCompany}
        setEditCompany={setEditCompany}
        editBudgetMin={editBudgetMin}
        setEditBudgetMin={setEditBudgetMin}
        editBudgetMax={editBudgetMax}
        setEditBudgetMax={setEditBudgetMax}
        editIndustry={editIndustry}
        setEditIndustry={setEditIndustry}
        editRegion={editRegion}
        setEditRegion={setEditRegion}
        editDeadline={editDeadline}
        setEditDeadline={setEditDeadline}
        editContactName={editContactName}
        setEditContactName={setEditContactName}
        editContactPhone={editContactPhone}
        setEditContactPhone={setEditContactPhone}
        editContactTitle={editContactTitle}
        setEditContactTitle={setEditContactTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        updating={updating}
        resolveMediaUrl={resolveMediaUrl}
      />

{/* MODAL ĐÀM PHÁN HẸN GẶP 1-1 GẮN VỚI CƠ HỘI */}
      <BusinessConnectBottomSheet
        isOpen={Boolean(negotiateTarget)}
        onClose={() => {
          setNegotiateTarget(null);
          setNegotiateOpp(null);
        }}
        target={negotiateTarget}
        initialPurpose={
          negotiateOpp
            ? `Chào Quý CEO, tôi rất quan tâm đến cơ hội "${negotiateOpp.title}" mà bạn đã chia sẻ và mong muốn hẹn gặp kết nối 1-1 để trao đổi chi tiết về tiềm năng hợp tác.`
            : "Hẹn gặp 1-1 đàm phán hợp tác kinh doanh"
        }
        initialOpportunityId={negotiateOpp?.id}
        initialOpportunityTitle={negotiateOpp?.title}
        onSuccess={() => {
          recordUserActivity({
            action: "SETUP_MEETING",
            title: `Hẹn gặp 1-1 với ${negotiateTarget?.name || "đối tác"}`,
            badge: "Kết nối",
            userId: user?.id,
            metadata: {
              targetName: negotiateTarget?.name,
              oppTitle: negotiateOpp?.title,
              detail: `Hẹn gặp 1-1 đàm phán cơ hội: "${negotiateOpp?.title || "Hợp tác B2B"}"`,
            },
          });
          toast.success("Đã gửi đề xuất lịch hẹn đàm phán 1-1 thành công!");
          setNegotiateTarget(null);
          setNegotiateOpp(null);
        }}
      />

      {/* POPUP DEAL CHÀO GIÁ B2B CHO CƠ HỘI KINH DOANH (Case 3) */}
      {dealModalOpp && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1427] text-slate-900 dark:text-white shadow-2xl border border-amber-500/30 overflow-hidden m-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-500">
                  <Handshake className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Gửi Deal Chào Giá B2B
                  </h3>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Cơ hội: {dealModalOpp.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDealModalOpp(null)}
                className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Giá chào thầu / Báo giá đề xuất (VNĐ)
                </label>
                <input
                  type="text"
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  placeholder="Ví dụ: 150000000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-[#003B95]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Năng lực & Lời nhắn chào giá
                </label>
                <textarea
                  rows={3}
                  value={dealMessage}
                  onChange={(e) => setDealMessage(e.target.value)}
                  placeholder="Nêu rõ tiến độ, năng lực thực thi và cam kết chất lượng..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-[#003B95] resize-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="size-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>
                  Khi chủ cơ hội đồng ý với mức giá & giải pháp này, hệ thống sẽ gửi thông báo đến bạn để mở nút <strong>Kết nối cuộc gặp</strong> trực tiếp tại B2B Connect.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDealModalOpp(null)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDeal}
                  disabled={submittingDeal}
                  className="py-2.5 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md shadow-[#003B95]/30 active:scale-98 transition cursor-pointer disabled:opacity-50"
                >
                  {submittingDeal ? "Đang gửi..." : "Gửi Deal chào giá"}
                </button>
              </div>

              {/* Action cho Chủ cơ hội đồng ý Deal ngay */}
              <button
                type="button"
                onClick={() => {
                  const opp = dealModalOpp;
                  handleApproveDeal(
                    opp.id,
                    opp.title,
                    opp.contactName || opp.company || "Chủ cơ hội",
                    opp.company || "CLB CEO 1983",
                  );
                  setDealModalOpp(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition cursor-pointer"
              >
                ✓ Đồng ý deal chào giá này &amp; Bắn thông báo kết nối cuộc gặp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP / MODAL MINH CHỨNG DẪN CHỨNG THẬT (CHỈ SỐ GIAO THƯƠNG) */}
      {evidenceModalType && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131a26] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-xl bg-[#003B95]/10 dark:bg-blue-500/20 flex items-center justify-center text-[#003B95] dark:text-blue-400 shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {evidenceModalData.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {evidenceModalData.summary}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceModalType(null)}
                className="grid size-8 place-items-center rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body: Danh sách minh chứng thật */}
            <div className="p-3 sm:p-4 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 space-y-2.5 flex-1">
              {evidenceModalData.list.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FolderOpen className="size-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">Chưa có dữ liệu minh chứng cho danh mục này</p>
                  <p className="text-[11px] text-slate-400 mt-1">Dữ liệu thực tế sẽ được cập nhật liên tục từ các hoạt động giao thương.</p>
                </div>
              ) : (
                evidenceModalData.list.map((item: any) => {
                  const val = getOppNumericValue(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedOpp(item);
                        setEvidenceModalType(null);
                      }}
                      className="pt-2.5 first:pt-0 group flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#003B95]/10 text-[#003B95] dark:text-blue-300">
                            {normalizeTag(item.type || item.tag || "Cơ hội")}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            {item.status === "open" ? "Đang mở" : item.status === "won" ? "Đã chốt" : item.status === "dealing" ? "Đang đàm phán" : "Hoạt động"}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                          <span>{item.company || item.contactName || "Doanh nghiệp CEO 1983"}</span>
                          {item.region && <span>• {item.region}</span>}
                          {item.industry && <span>• {item.industry}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono block">
                          {formatSmartPrice(val)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {val > 0 ? "Ngân sách" : "Thỏa thuận"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tổng cộng: <strong className="text-slate-800 dark:text-white font-bold">{evidenceModalData.list.length}</strong> cơ hội minh chứng
              </span>
              <button
                type="button"
                onClick={() => setEvidenceModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
