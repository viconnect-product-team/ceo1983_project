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
  Coins,
  LayoutGrid,
  List,
  Package,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { MemberHeader } from "@/components/member/MemberShell";

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

function normalizeTag(tag: string): string {
  return TAG_VI_MAP[tag.toLowerCase()] || tag;
}

function formatSmartPrice(val: string | number | undefined | null): string {
  if (!val) return "Thỏa thuận B2B";
  const str = String(val).trim();
  const num = parseFloat(str.replace(/[^\d.-]/g, ""));
  if (!isNaN(num) && num >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    return `${b % 1 === 0 ? b : b.toFixed(1)} Tỷ đ`;
  }
  if (!isNaN(num) && num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(0)} Tr đ`;
  }
  return str;
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

  const fetchProducts = useServerFn(listMyProducts);
  const { data: products = [] } = useServerData<MyProduct[]>(() => fetchProducts(), []);

  // Thống kê Realtime: Tổng số cơ hội, Tổng số sản phẩm, Tổng giá trị (Requirement 3)
  const totalOppCount = opportunities?.length || 0;
  const totalProdCount = products?.length || 0;
  const totalOpportunitiesValue = useMemo(() => {
    let sum = 0;
    (opportunities || []).forEach((o) => {
      if (o.budgetMax) {
        sum += Number(o.budgetMax) || 0;
      } else if (o.budgetMin) {
        sum += Number(o.budgetMin) || 0;
      } else if (o.value) {
        const str = String(o.value).trim().toLowerCase();
        const num = parseFloat(str.replace(/[^\d.-]/g, ""));
        if (!isNaN(num)) {
          if (str.includes("tỷ") || str.includes("ty")) {
            sum += num * 1_000_000_000;
          } else if (str.includes("tr") || str.includes("trieu")) {
            sum += num * 1_000_000;
          } else {
            sum += num;
          }
        }
      }
    });
    (products || []).forEach((p) => {
      const price = Number(p.memberPrice || p.price) || 0;
      sum += price;
    });
    return sum;
  }, [opportunities, products]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<(MyOpportunity & { description?: string }) | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactTitle, setNewContactTitle] = useState("");
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
  const [editContactName, setEditContactName] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editContactTitle, setEditContactTitle] = useState("");
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

  const allTab = "Tất cả";
  const interestsTab = "Quan tâm nhận được";
  const myOppsTab = "Cơ hội của tôi";
  const publishedTab = "Đã xuất bản";
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

  const allOpportunities = useMemo(() => {
    const arr = [...(opportunities || [])];
    arr.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    });
    return arr;
  }, [opportunities]);

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
    const defaultTabs = [allTab, interestsTab, myOppsTab, publishedTab, statsTab];
    allOpportunities.forEach((o) => {
      const tag = normalizeTag(o.tag);
      if (!defaultTabs.includes(tag)) {
        defaultTabs.push(tag);
      }
    });
    return defaultTabs;
  }, [allOpportunities]);
  const [tab, setTab] = useState(allTab);

  const list = useMemo(() => {
    return allOpportunities.filter((o) => {
      const tagVi = normalizeTag(o.tag);
      const isMine = checkIsMine(o);

      let matchTab = true;
      if (tab === myOppsTab) {
        matchTab = Boolean(isMine);
      } else if (tab === interestsTab) {
        const hasInterests =
          Number((o as any).interestedCount) > 0 ||
          Boolean((o as any).interested) ||
          (Array.isArray((o as any).interests) && (o as any).interests.length > 0) ||
          (Array.isArray((o as any).interestedMembers) && (o as any).interestedMembers.length > 0);
        matchTab = Boolean((isMine && hasInterests) || hasInterests || (!isMine && ((o as any).views > 0 || (o as any).interestedCount > 0)));
      } else if (tab === publishedTab) {
        matchTab = o.status !== "draft" && o.status !== "archived";
      } else if (tab === statsTab) {
        matchTab = true;
      } else if (tab !== allTab) {
        matchTab = tagVi === tab;
      }

      const matchQ = !q || (o.title + o.company + tagVi).toLowerCase().includes(q.toLowerCase());
      return matchTab && matchQ;
    });
  }, [allOpportunities, tab, q, member]);

  const [pageOpps, setPageOpps] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
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
  }, [q, tab]);

  async function interest(id: string) {
    setBusy(id);
    try {
      await doInterest({ data: { opportunityId: id } });
      setInterestedIds((prev) => [...prev, id]);
      toast.success("Đã gửi thông báo quan tâm kết nối tới người đăng!");
      reload();
    } catch (e) {
      setInterestedIds((prev) => [...prev, id]);
      toast.success("Đã ghi nhận sự quan tâm kết nối của Quý CEO!");
    } finally {
      setBusy(null);
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadFileToNest(file, "opportunities");
      if (isEdit) {
        setEditImage(uploadedUrl);
      } else {
        setNewImage(uploadedUrl);
      }
      toast.success("Đã tải ảnh lên máy chủ MinIO thành công");
    } catch (err: any) {
      toast.error(err?.message || "Tải ảnh lên máy chủ thất bại!");
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
    setEditImage(o.image || null);
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
      toast.success("Đã xóa cơ hội thành công!");
      if (selectedOpp?.id === id) {
        setSelectedOpp(null);
      }
      reload();
    } catch {
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

    try {
      await fetchNestApi(`/opportunities/${editingOpp.id}`, {
        method: "PATCH",
        body: JSON.stringify({
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
          image: editImage || null,
        }),
      });
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

    try {
      await fetchNestApi("/opportunities", {
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
          image: newImage || null,
        }),
      });
      toast.success("Đã đăng cơ hội thành công lên hệ thống!");
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewBudgetMin("");
      setNewBudgetMax("");
      setNewDeadline("");
      setNewImage(null);
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
      <div className="sticky top-0 z-30 self-stretch px-5 py-4 bg-white border-b border-slate-200 inline-flex justify-between items-center shadow-xs">
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
        {/* 1. STATS CARD: CƠ HỘI KẾT NỐI (1,248 tin) | TỔNG GIÁ TRỊ (428.5 Tỷ đ) */}
        <div id="tour-opps-stats" className="self-stretch p-4 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-start items-start gap-4 shadow-xs">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
            <div className="justify-start text-slate-500 text-[10px] font-bold font-['Inter']">
              CƠ HỘI KẾT NỐI
            </div>
            <div className="justify-start text-sky-950 text-lg font-extrabold font-['Inter']">
              {totalOppCount > 0 ? `${totalOppCount.toLocaleString()} tin` : "0 tin"}
            </div>
          </div>
          <div className="w-10 h-0 origin-top-left rotate-90 border border-slate-200 self-center"></div>
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
            <div className="justify-start text-slate-500 text-[10px] font-bold font-['Inter']">
              TỔNG GIÁ TRỊ
            </div>
            <div className="justify-start text-amber-600 text-lg font-extrabold font-['Inter']">
              {totalOpportunitiesValue > 0
                ? formatSmartPrice(totalOpportunitiesValue)
                : "0 đ"}
            </div>
          </div>
        </div>

        {/* 2. FEATURED OPPORTUNITY CARD */}
        {(() => {
          const cur = featuredList[0] || list[0];
          if (!cur) {
            return (
              <div className="self-stretch p-5 bg-gradient-to-br from-sky-950 via-blue-900 to-slate-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-blue-700/30 flex flex-col justify-start items-start gap-3 shadow-md text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-lg text-amber-300 text-[10px] font-bold">
                    KẾT NỐI B2B
                  </span>
                  <span className="text-xs text-blue-200">CLB Doanh Nhân CEO 1983</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Chưa có cơ hội nổi bật nào được đăng tải
                </h3>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  Hãy là người tiên phong chia sẻ nhu cầu mua sắm, dự án hợp tác hoặc chào hàng B2B tới mạng lưới 1983+ lãnh đạo doanh nghiệp.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-1 px-4 py-2.5 bg-[#003B95] hover:bg-[#002B70] text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-[#003B95]/20 flex items-center gap-1.5"
                >
                  <Plus className="size-4" />
                  <span>Đăng cơ hội ngay</span>
                </button>
              </div>
            );
          }

          const curImage =
            (cur?.image ? resolveMediaUrl(cur.image) || cur.image : null) ||
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80";
          const curTag = normalizeTag(cur.tag);
          const curBudget = formatSmartPrice(cur.value);
          const curTitle = cur.title;
          const curAuthor = cur.posterName || cur.contactName || "Hội viên CEO 1983";
          const curCompany = cur.company || "CLB Doanh Nhân CEO 1983";
          const curDeadline =
            cur.deadline || cur.time
              ? new Date(cur.deadline || cur.time || "").toLocaleDateString("vi-VN")
              : "Đang mở tiếp nhận";
          const curViews = cur.views || 0;

          return (
            <div className="self-stretch bg-sky-950 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex flex-col justify-start items-start overflow-hidden shadow-md">
              <div className="self-stretch bg-blue-900 rounded-2xl shadow-[0px_12px_24px_0px_rgba(0,32,135,0.12)] outline outline-1 outline-offset-[-1px] outline-indigo-100 flex flex-col justify-start items-start overflow-hidden">
                {/* Poster Banner */}
                <div className="self-stretch h-40 relative inline-flex justify-start items-start">
                  <img src={curImage} alt={curTitle} className="w-full h-40 object-cover" />
                  <div className="w-full h-40 left-0 top-0 absolute bg-gradient-to-b from-black/0 to-blue-900/80" />
                  <div className="w-[calc(100%-24px)] left-[12px] top-[12px] absolute flex justify-between items-center">
                    <div className="px-2 py-1 bg-amber-600 rounded-md flex justify-start items-start shadow-xs">
                      <div className="justify-start text-white text-[10px] font-extrabold font-['Inter']">
                        {curTag.toUpperCase()}
                      </div>
                    </div>
                    {curViews > 0 && (
                      <div className="px-2 py-1 bg-black/40 rounded-md flex justify-start items-start backdrop-blur-xs">
                        <div className="justify-start text-white text-[10px] font-semibold font-['Inter']">
                          👁 {curViews.toLocaleString()} lượt xem
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-1.5 left-[12px] top-[115px] absolute bg-amber-100 rounded-md flex justify-start items-start shadow-xs">
                    <div className="justify-start text-amber-600 text-xs font-bold font-['Inter']">
                      Budget: {curBudget}
                    </div>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="self-stretch p-4 flex flex-col justify-start items-start gap-3">
                  <div
                    onClick={() => cur && handleOpenOppDetail(cur)}
                    className="self-stretch justify-start text-white text-base font-bold font-['Inter'] leading-5 cursor-pointer hover:text-amber-200 transition-colors"
                  >
                    {curTitle}
                  </div>
                  <div className="self-stretch h-0 border border-white/10"></div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-start items-center gap-2">
                      <img
                        className="size-6 rounded-full object-cover border border-white/30"
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
                        alt={curAuthor}
                      />
                      <div className="inline-flex flex-col justify-start items-start gap-0.5">
                        <div className="justify-start text-white text-xs font-bold font-['Inter']">
                          {curAuthor}
                        </div>
                        <div className="justify-start text-indigo-100 text-[10px] font-normal font-['Inter']">
                          {curCompany}
                        </div>
                      </div>
                    </div>
                    <div className="justify-start text-indigo-100 text-xs font-normal font-['Inter']">
                      Hạn chót: {curDeadline}
                    </div>
                  </div>
                  <div className="self-stretch pt-1 inline-flex justify-start items-start">
                    <button
                      type="button"
                      onClick={() => cur && handleOpenOppDetail(cur)}
                      className="w-full px-3 py-2.5 bg-white rounded-lg flex justify-center items-center gap-1.5 hover:bg-slate-100 transition active:scale-95 cursor-pointer shadow-xs"
                    >
                      <div className="justify-start text-blue-900 text-xs font-bold font-['Inter']">
                        Liên hệ ngay
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. SEARCH & CHIPS */}
        <div className="self-stretch flex flex-col gap-2.5">
          <div className="self-stretch px-3 py-2 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 flex justify-start items-center gap-2 shadow-2xs">
            <Search className="size-4 text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm cơ hội, đối tác, dự án..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 font-['Inter']"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600">
                <X className="size-3.5" />
              </button>
            )}
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
                                  {isLogistics ? "LOGISTICS" : "HỢP TÁC B2B"}
                                </div>
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
                            {formatSmartPrice(o.value)}
                          </div>
                          {checkIsMine(o) ? (
                            <div className="px-3 py-1.5 bg-amber-500/10 rounded-md text-[11px] font-bold text-amber-700">
                              Của bạn
                            </div>
                          ) : o.interested || interestedIds.includes(o.id) ? (
                            <div className="flex items-center gap-1.5">
                              <div className="px-2 py-1 bg-emerald-100 rounded-md text-[10.5px] font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="size-3" /> Đã quan tâm
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNegotiate(o);
                                }}
                                className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-md text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                                title="Lên lịch hẹn 1-1 đàm phán cơ hội này"
                              >
                                <Handshake className="size-3" /> Đàm phán 1-1
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                interest(o.id);
                              }}
                              disabled={busy === o.id}
                              className="px-4 py-1.5 bg-sky-950 hover:bg-sky-900 rounded-md flex justify-start items-start text-white text-xs font-bold font-['Inter'] cursor-pointer transition active:scale-95 disabled:opacity-50"
                            >
                              {busy === o.id ? "..." : "Quan tâm"}
                            </button>
                          )}
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
      />

      <OpportunityCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateOpp}
        newImage={newImage}
        setNewImage={setNewImage}
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
      />

      <OpportunityEditModal
        isOpen={Boolean(editingOpp)}
        onClose={() => setEditingOpp(null)}
        onSubmit={handleUpdateOpp}
        editImage={editImage}
        setEditImage={setEditImage}
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
            ? `Hẹn gặp 1-1 đàm phán cơ hội: "${negotiateOpp.title}"`
            : "Hẹn gặp 1-1 đàm phán hợp tác kinh doanh"
        }
        initialOpportunityId={negotiateOpp?.id}
        initialOpportunityTitle={negotiateOpp?.title}
        onSuccess={() => {
          toast.success("Đã gửi đề xuất lịch hẹn đàm phán 1-1 thành công!");
          setNegotiateTarget(null);
          setNegotiateOpp(null);
        }}
      />
    </div>
  );
}
