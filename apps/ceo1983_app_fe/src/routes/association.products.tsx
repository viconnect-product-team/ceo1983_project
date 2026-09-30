import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Eye,
  Plus,
  FileText,
  Heart,
  ImagePlus,
  Trash2,
  X,
  PackageCheck,
  Building2,
  Phone,
  Send,
  CheckCircle2,
  Calendar,
  Pencil,
  MoreVertical,
  Store,
  BadgeCheck,
  Globe,
  Users,
  LayoutGrid,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  Check,
  MessageSquare,
  ShoppingCart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  ArrowRight,
  Download,
  FileSpreadsheet,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Package,
  Megaphone,
  QrCode,
  Star,
  Menu,
  ArrowUpDown,
} from "lucide-react";
import { exportProductsToExcel, type ParsedProductItem } from "@/lib/marketplace-excel";
import { ProductExcelModal } from "@/components/dashboard/ProductExcelModal";
import { ShopeeProductDetailModal } from "@/components/marketplace/ShopeeProductDetailModal";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyProducts, requestQuote, getMyMember, type MyProduct, type MyMember } from "@/lib/member-app.functions";
import { fetchNestApi, resolveMediaUrl, uploadFileToNest } from "@/lib/api-client";
import { isUserProductOwner } from "@/lib/marketplace-data";
import { useT, useFmt, useLang } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { isVideoMedia } from "@/components/marketplace/MarketplaceAdsManager";
import { MarketplaceAdSlider } from "@/components/marketplace/MarketplaceAdSlider";

function normalizeCategory(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/&/g, "va")
    .replace(/[^a-z0-9]/g, "");
}

function matchCategory(productCat: string, filterCat: string): boolean {
  if (!productCat || !filterCat) return false;
  const pNorm = normalizeCategory(productCat);
  const fNorm = normalizeCategory(filterCat);
  if (pNorm.includes(fNorm) || fNorm.includes(pNorm)) return true;

  const CATEGORY_MAP: Record<string, string[]> = {
    tech: ["congnghe", "phanmem", "it", "tech", "technology", "software"],
    realestate: ["batdongsan", "xaydung", "realestate", "property", "construction"],
    manufacturing: ["sanxuat", "congnghiep", "manufacturing", "industry", "production"],
    finance: ["taichinh", "dautu", "finance", "investment", "banking"],
    services: ["dichvu", "dulich", "service", "services", "tourism", "hospitality"],
    retail: ["hangtieudung", "banle", "retail", "consumer", "fmcg", "commerce", "trade"],
  };

  for (const group of Object.values(CATEGORY_MAP)) {
    const matchesFilter = group.some((keyword) => fNorm.includes(keyword) || keyword.includes(fNorm));
    const matchesProduct = group.some((keyword) => pNorm.includes(keyword) || keyword.includes(pNorm));
    if (matchesFilter && matchesProduct) return true;
  }
  return false;
}

function formatCurrencyInput(val: string | number): string {
  if (val === undefined || val === null) return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  const clean = digits.replace(/^0+(?=\d)/, "");
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatSmartProductPrice(rawPrice: string | number | undefined | null): string {
  if (!rawPrice) return "Liên hệ";
  if (typeof rawPrice === "string") {
    if (rawPrice.includes("Tỷ") || rawPrice.includes("Tr") || rawPrice.toLowerCase().includes("thương lượng") || rawPrice.toLowerCase().includes("liên hệ")) {
      return rawPrice;
    }
  }
  const num = typeof rawPrice === "number" ? rawPrice : Number(String(rawPrice).replace(/\D/g, ""));
  if (isNaN(num) || num <= 0) return typeof rawPrice === "string" && rawPrice.trim() ? rawPrice : "Liên hệ";
  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000;
    return `${billions % 1 === 0 ? billions : billions.toFixed(1).replace(".0", "")} Tỷ đ`;
  }
  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1).replace(".0", "")} Tr đ`;
  }
  return `${num.toLocaleString("vi-VN")} đ`;
}

export const Route = createFileRoute("/association/products")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: (search.action as string) || undefined,
    };
  },
  component: ProductsScreen,
});

function ProductsScreen() {
  const t = useT();
  const fmt = useFmt();
  const { lang } = useLang();
  const isEn = lang === "en";
  const search = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = useServerFn(listMyProducts);
  const doQuote = useServerFn(requestQuote);
  const fetchMember = useServerFn(getMyMember);
  const { data: initialProducts, loading, reload } = useServerData<MyProduct[]>(() => fetchProducts(), []);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [marketplaceTab, setMarketplaceTab] = useState<"market" | "interested" | "my_store">(() => (search?.action === "manage" || search?.action === "create") ? "my_store" : "market");
  const [postModalOpen, setPostModalOpen] = useState(() => search?.action === "create");
  const [editingProduct, setEditingProduct] = useState<MyProduct | null>(null);
  const [activeProductMenuId, setActiveProductMenuId] = useState<string | null>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search?.action === "create") {
      setPostModalOpen(true);
    }
  }, [search?.action]);

  // Category & User-isolated Interested state (prevents new accounts from inheriting old favorites)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<MyProduct | null>(null);

  // Recent Categories (Shopee style - dưới tìm kiếm là danh mục gần đây đã chọn)
  const [recentCategories, setRecentCategories] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ceo1983_recent_categories");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return ["Công nghệ & Phần mềm", "Bất động sản & Xây dựng", "Dịch vụ & Du lịch", "Tài chính & Đầu tư"];
  });

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat && cat !== "all" && cat !== "my_products" && cat !== "interested") {
      setRecentCategories((prev) => {
        const filtered = prev.filter((c) => c !== cat);
        const updated = [cat, ...filtered].slice(0, 6);
        try {
          localStorage.setItem("ceo1983_recent_categories", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const resolvedUserId = user?.id || (member as any)?.userId || (member as any)?.user_id || (member as any)?.id || member?.code || null;
  const userStorageKey = resolvedUserId ? `vba_interested_products_${resolvedUserId}` : null;
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Clear legacy unisolated keys that may contain mock/seed data
    try {
      localStorage.removeItem("vba_interested_products_user");
    } catch {}

    if (!userStorageKey) {
      setInterestedIds([]);
      return;
    }
    try {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInterestedIds(Array.isArray(parsed) ? parsed : []);
      } else {
        setInterestedIds([]);
      }
    } catch {
      setInterestedIds([]);
    }
  }, [userStorageKey]);

  const toggleInterest = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!userStorageKey) {
      toast.error(isEn ? "Please log in to save products" : "Vui lòng đăng nhập để lưu sản phẩm quan tâm");
      return;
    }
    setInterestedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(next));
      } catch {}
      toast.success(next.includes(id) ? (isEn ? "Added to interested list" : "Đã thêm vào danh mục Đã quan tâm") : (isEn ? "Removed from interested list" : "Đã bỏ khỏi danh mục Đã quan tâm"));
      return next;
    });
  };

  // Marketplace Ads & Affiliate Registration Flow (CRM Sync)
  const [adRegistrationModalOpen, setAdRegistrationModalOpen] = useState(false);
  const [activeMarketplaceAds, setActiveMarketplaceAds] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const [adCompany, setAdCompany] = useState("");
  const [adContactPerson, setAdContactPerson] = useState("");
  const [adPhone, setAdPhone] = useState("");
  const [adEmail, setAdEmail] = useState("");
  const [adGoal, setAdGoal] = useState("Quảng bá sản phẩm / dịch vụ nổi bật tới toàn thể hội viên");
  const [adDurationMonths, setAdDurationMonths] = useState(3);
  const [adBudget, setAdBudget] = useState("10,000,000 đ");
  const [adProductLink, setAdProductLink] = useState("");
  const [adNotes, setAdNotes] = useState("");
  const [adSubmitting, setAdSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      const memberCompany = (member as any).companyName || (member as any).company || "";
      const memberName = (member as any).fullName || (member as any).name || "";
      if (memberCompany && !adCompany) setAdCompany(memberCompany);
      if (memberName && !adContactPerson) setAdContactPerson(memberName);
      if (member.phone && !adPhone) setAdPhone(member.phone);
      if (member.email && !adEmail) setAdEmail(member.email);
    }
  }, [member, adCompany, adContactPerson, adPhone, adEmail]);

  const loadMarketplaceAds = () => {
    try {
      const raw = localStorage.getItem("ceo1983_marketplace_ads");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const now = new Date().toISOString().split("T")[0];
          const activeOnly = parsed.filter(
            (c: any) => c.status === "active" && (!c.endDate || c.endDate >= now)
          );
          setActiveMarketplaceAds(activeOnly);
        }
      }
    } catch {
      setActiveMarketplaceAds([]);
    }
  };

  useEffect(() => {
    loadMarketplaceAds();
    const handleAdsChanged = () => loadMarketplaceAds();
    window.addEventListener("ceo1983-ads-changed", handleAdsChanged);
    window.addEventListener("storage", handleAdsChanged);
    return () => {
      window.removeEventListener("ceo1983-ads-changed", handleAdsChanged);
      window.removeEventListener("storage", handleAdsChanged);
    };
  }, []);

  useEffect(() => {
    if (activeMarketplaceAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeMarketplaceAds.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeMarketplaceAds.length]);

  const handleSubmitAdRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adCompany.trim() || !adContactPerson.trim() || !adPhone.trim()) {
      toast.error("Vui lòng điền đầy đủ tên công ty, người liên hệ và số điện thoại!");
      return;
    }
    setAdSubmitting(true);
    try {
      const newReq = {
        id: `adreq-${Date.now()}`,
        companyName: adCompany.trim(),
        contactPerson: adContactPerson.trim(),
        phone: adPhone.trim(),
        email: adEmail.trim() || (member?.email || ""),
        goal: adGoal,
        durationMonths: adDurationMonths,
        budgetEst: adBudget,
        productLink: adProductLink.trim() || undefined,
        notes: adNotes.trim() || undefined,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };
      const raw = localStorage.getItem("ceo1983_ad_requests");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newReq);
      localStorage.setItem("ceo1983_ad_requests", JSON.stringify(list));
      window.dispatchEvent(new Event("ceo1983-ad-requests-changed"));
      
      toast.success("Đã gửi yêu cầu đăng ký quảng cáo thành công tới Quản trị viên hệ thống!");
      setAdRegistrationModalOpen(false);
      setAdNotes("");
    } catch {
      toast.error("Không thể gửi yêu cầu. Vui lòng thử lại!");
    } finally {
      setAdSubmitting(false);
    }
  };

  // Quote Request Modal state
  const [quoteProduct, setQuoteProduct] = useState<MyProduct | null>(null);
  const [quoteQty, setQuoteQty] = useState("1");
  const [quotePhone, setQuotePhone] = useState("0988 123 456");
  const [quoteNote, setQuoteNote] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Author/Admin Quotes Inspection state
  const [viewingQuotesProduct, setViewingQuotesProduct] = useState<MyProduct | null>(null);
  const [productQuotes, setProductQuotes] = useState<any[]>([]);
  const [loadingProductQuotes, setLoadingProductQuotes] = useState(false);

  // Recently viewed products tracking
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ceo1983_recent_products");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const trackRecentlyViewed = (p: any) => {
    if (!p) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((x) => (x.id || x._id) !== (p.id || p._id));
      const updated = [p, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("ceo1983_recent_products", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isAdmin = Boolean(
    (user as any)?.role === "admin" ||
    (user as any)?.role === "platform_admin" ||
    (member as any)?.role === "admin" ||
    (member as any)?.role === "association_admin" ||
    (member as any)?.executiveRole
  );

  // Check if current user is the actual creator/author of this product
  const checkIsProductAuthor = (p: MyProduct) => {
    if (!p) return false;
    if (isUserProductOwner(p as any, user, member)) return true;
    if (!member && !user) return false;
    const currentUserId = String(user?.id || (member as any)?.userId || (member as any)?.user_id || (member as any)?.id || "").trim().toLowerCase();
    const prodSellerId = String(p.sellerId || (p as any).seller_id || (p as any).userId || (p as any).user_id || "").trim().toLowerCase();
    if (currentUserId && prodSellerId && currentUserId === prodSellerId) return true;
    if (member?.code && prodSellerId && String(member.code).toLowerCase() === prodSellerId) return true;
    return false;
  };

  const checkCanManageProduct = (p: MyProduct) => {
    return checkIsProductAuthor(p) || isAdmin;
  };

  const checkIsProductOwner = checkIsProductAuthor;

  const handleOpenQuoteModal = (p: MyProduct) => {
    if (checkIsProductOwner(p)) {
      toast.info(isEn ? "This is your product. Opening received quote requests." : "Đây là sản phẩm của bạn. Đang mở danh sách yêu cầu báo giá từ khách hàng.");
      handleOpenProductQuotes(p);
      return;
    }
    trackRecentlyViewed(p);
    setQuoteProduct(p);
    setQuoteQty("1");
    setQuoteNote("");
    if (member?.phone || (user as any)?.phone) {
      setQuotePhone(member?.phone || (user as any)?.phone);
    }
  };

  const handleOpenProductDetail = (p: MyProduct) => {
    trackRecentlyViewed(p);
    setSelectedDetailProduct(p);
  };

  const handleOpenProductQuotes = async (p: MyProduct) => {
    setViewingQuotesProduct(p);
    setLoadingProductQuotes(true);
    try {
      const res = await fetchNestApi<any>(`/marketplace/products/${p.id}`);
      if (res && res.quotes) {
        setProductQuotes(Array.isArray(res.quotes) ? res.quotes : []);
      } else {
        setProductQuotes([]);
      }
    } catch {
      setProductQuotes([]);
    } finally {
      setLoadingProductQuotes(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteProduct) return;
    setQuoteSubmitting(true);
    try {
      await fetchNestApi(`/marketplace/quotes`, {
        method: "POST",
        body: JSON.stringify({
          productId: quoteProduct.id,
          quantity: parseInt(quoteQty, 10) || 1,
          phone: quotePhone,
          message: quoteNote || "Hội viên yêu cầu báo giá VIP",
        }),
      });
      toast.success(isEn ? "Quote request sent successfully!" : "Đã gửi yêu cầu báo giá thành công!");
      setQuoteProduct(null);
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi yêu cầu báo giá, vui lòng thử lại sau!");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Company Storefront state (Full-screen B2B Storefront, not a popup modal)
  const [viewingCompany, setViewingCompany] = useState<{
    name: string;
    avatarUrl?: string | null;
    bio?: string;
    industry?: string;
    phone?: string;
    website?: string;
  } | null>(null);
  const [companyCatFilter, setCompanyCatFilter] = useState<string>("all");
  const [companySearch, setCompanySearch] = useState<string>("");
  const [wishlistCartOpen, setWishlistCartOpen] = useState(false);
  const [excelImportOpen, setExcelImportOpen] = useState(false);

  const handleImportExcelProducts = async (importedItems: ParsedProductItem[]) => {
    for (const item of importedItems) {
      const payload = {
        name: item.title,
        title: item.title,
        description: item.description || item.title,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        memberPrice: item.memberPrice || item.price,
        unit: item.unit || "Gói",
        currency: "VND",
        category: item.categoryName || "Dịch vụ",
        status: "active",
        imageUrl: item.imageUrl || null,
        imageUrls: item.imageUrl ? [item.imageUrl] : [],
        company: item.company || (viewingCompany ? viewingCompany.name : resolvedProfileCompany) || "CLB Doanh Nhân CEO 1983",
        sellerId: user?.id || (member as any)?.userId || (member as any)?.id || "ceo1983",
      };
      try {
        await fetchNestApi("/products", { method: "POST", body: JSON.stringify(payload) });
      } catch {
        await fetchNestApi("/marketplace/products", { method: "POST", body: JSON.stringify(payload) }).catch(() => {});
      }
    }
    reload();
  };

  // Lock body scroll when modal is open to ensure 100% stable centering on mobile
  useEffect(() => {
    if (quoteProduct || postModalOpen || editingProduct || viewingQuotesProduct || wishlistCartOpen || excelImportOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [quoteProduct, postModalOpen, editingProduct, viewingQuotesProduct, wishlistCartOpen, excelImportOpen]);

  // Form states for posting product with full CRM pricing fields & Company storefront
  const [customProfile, setCustomProfile] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("vba_custom_profile") || "null");
    } catch {
      return null;
    }
  });

  const resolvedProfileCompany = useMemo(() => {
    const fromCustom = customProfile?.company?.trim() || customProfile?.companyName?.trim();
    if (fromCustom) return fromCustom;
    const fromMember = (member as any)?.company?.trim() || (member as any)?.companyName?.trim();
    if (fromMember) return fromMember;
    if (typeof window !== "undefined") {
      try {
        const mem = JSON.parse(localStorage.getItem("vba_my_member") || "null");
        if (mem?.company?.trim()) return mem.company.trim();
        if (mem?.companyName?.trim()) return mem.companyName.trim();
      } catch {}
    }
    return "CLB Doanh Nhân CEO 1983";
  }, [customProfile, member]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        setCustomProfile(JSON.parse(localStorage.getItem("vba_custom_profile") || "null"));
      } catch {}
      reload();
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("vba_profile_updated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("vba_profile_updated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [reload]);

  const [formPhoto, setFormPhoto] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cp = JSON.parse(localStorage.getItem("vba_custom_profile") || "{}");
        if (cp?.company?.trim()) return cp.company.trim();
      } catch {}
    }
    return "";
  });
  const [formCompanyIntro, setFormCompanyIntro] = useState("");
  const [formCompanySize, setFormCompanySize] = useState("10 - 50 nhân sự");
  const [formCategory, setFormCategory] = useState("Công nghệ & Phần mềm");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formUnit, setFormUnit] = useState("Gói");
  const [formCurrency, setFormCurrency] = useState("VND");
  const [formDesc, setFormDesc] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);

  useEffect(() => {
    if (resolvedProfileCompany && resolvedProfileCompany !== "CLB Doanh Nhân CEO 1983" && (!formCompany || formCompany === "CLB Doanh Nhân CEO 1983")) {
      setFormCompany(resolvedProfileCompany);
    }
  }, [resolvedProfileCompany, formCompany]);

  useEffect(() => {
    if (postModalOpen && resolvedProfileCompany && resolvedProfileCompany !== "CLB Doanh Nhân CEO 1983") {
      setFormCompany(resolvedProfileCompany);
    }
  }, [postModalOpen, resolvedProfileCompany]);

  // Form states for editing product
  const [editPhoto, setEditPhoto] = useState("");
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editCategory, setEditCategory] = useState("Công nghệ & Phần mềm");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("Gói");
  const [editCurrency, setEditCurrency] = useState("VND");
  const [editDesc, setEditDesc] = useState("");
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const allProducts = useMemo(() => {
    const arr = (initialProducts || []).map((p) => {
      if (checkIsProductOwner(p) && resolvedProfileCompany && resolvedProfileCompany !== "CLB Doanh Nhân CEO 1983") {
        return { ...p, company: resolvedProfileCompany };
      }
      return p;
    });
    arr.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA;
    });
    return arr;
  }, [initialProducts, resolvedProfileCompany, user, member]);

  const totalProducts = allProducts.length;
  const totalInterested = interestedIds.length;
  const totalViews = useMemo(() => {
    return allProducts.reduce((sum, p) => sum + (p.views || 1), 0);
  }, [allProducts]);
  const totalMarketplaceValue = useMemo(() => {
    return allProducts.reduce((sum, p) => sum + (Number(p.memberPrice || p.price) || 0), 0);
  }, [allProducts]);

  const featuredCompanyProduct = useMemo(() => {
    return allProducts.find((p) => p.company && p.company.trim().length > 0) || null;
  }, [allProducts]);

  // B2B Company Storefront derived states
  const companyProducts = useMemo(() => {
    if (!viewingCompany) return [];
    const targetComp = viewingCompany.name.toLowerCase().trim();
    return allProducts.filter(
      (p) => (p.company || "").toLowerCase().trim() === targetComp
    );
  }, [allProducts, viewingCompany]);

  const isCompanyOwner = useMemo(() => {
    if (!viewingCompany) return false;
    if (isAdmin) return true;
    const targetComp = viewingCompany.name.toLowerCase().trim();
    if ((member as any)?.company && (member as any).company.toLowerCase().trim() === targetComp) return true;
    if ((member as any)?.companyName && (member as any).companyName.toLowerCase().trim() === targetComp) return true;
    if (member?.title && member.title.toLowerCase().trim() === targetComp) return true;
    return companyProducts.some((p) => checkCanManageProduct(p));
  }, [viewingCompany, isAdmin, member, companyProducts]);

  const companyCategories = useMemo(() => {
    const cats = Array.from(new Set(companyProducts.map((p) => p.category).filter(Boolean))) as string[];
    return cats;
  }, [companyProducts]);

  const filteredCompanyProducts = useMemo(() => {
    return companyProducts.filter((p) => {
      if (companyCatFilter !== "all" && p.category !== companyCatFilter) return false;
      if (companySearch.trim()) {
        const qLower = companySearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(qLower);
        const matchesDesc = (p.description || "").toLowerCase().includes(qLower);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [companyProducts, companyCatFilter, companySearch]);

  const list = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch = !q || (p.name + p.company + p.category).toLowerCase().includes(q.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategory === "all") return true;
      if (selectedCategory === "my_products") {
        return checkIsProductOwner(p);
      }
      if (selectedCategory === "interested") return interestedIds.includes(p.id);
      return matchCategory(p.category, selectedCategory);
    });
  }, [allProducts, q, selectedCategory, interestedIds, member]);

  const myProductsCount = useMemo(() => {
    return allProducts.filter((p) => checkIsProductOwner(p)).length;
  }, [allProducts, member]);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"newest" | "most_viewed" | "price_asc" | "price_desc">("newest");
  const [pageNew, setPageNew] = useState(1);
  const [pagePopular, setPagePopular] = useState(1);
  const [pageCompanies, setPageCompanies] = useState(1);
  const [pageFilter, setPageFilter] = useState(1);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const PAGE_SIZE = 4;
  const FILTER_PAGE_SIZE = 6;
  const COMPANY_PAGE_SIZE = 3;

  const categoriesList = useMemo(() => [
    { id: "all", label: isEn ? "All" : "Tất cả", count: allProducts.length },
    { id: "my_products", label: isEn ? "My Products" : "Của tôi", count: myProductsCount },
    { id: "interested", label: isEn ? "Interested" : "Đã quan tâm", count: interestedIds.length },
    { id: "Công nghệ & Phần mềm", label: isEn ? "Technology" : "Công nghệ & Phần mềm" },
    { id: "Bất động sản & Xây dựng", label: isEn ? "Real Estate" : "Bất động sản & Xây dựng" },
    { id: "Sản xuất & Công nghiệp", label: isEn ? "Manufacturing" : "Sản xuất & Công nghiệp" },
    { id: "Tài chính & Đầu tư", label: isEn ? "Finance" : "Tài chính & Đầu tư" },
    { id: "Dịch vụ & Du lịch", label: isEn ? "Services & Tourism" : "Dịch vụ & Du lịch" },
    { id: "Hàng tiêu dùng & Bán lẻ", label: isEn ? "Consumer Goods" : "Hàng tiêu dùng & Bán lẻ" },
  ], [isEn, allProducts.length, myProductsCount, interestedIds.length]);

  // Section 1: Sản phẩm mới đăng
  const newestProducts = useMemo(() => {
    return [...list].sort((a, b) => {
      const tA = a.time ? new Date(a.time).getTime() : 0;
      const tB = b.time ? new Date(b.time).getTime() : 0;
      return tB - tA;
    });
  }, [list]);

  // Section 2: Sản phẩm được xem nhiều nhất
  const popularProducts = useMemo(() => {
    return [...list].sort((a, b) => {
      const vA = a.views || 0;
      const vB = b.views || 0;
      return vB - vA;
    });
  }, [list]);

  // Section 3: Doanh nghiệp / Công ty nổi bật nhất (1 hội viên đại diện cho 1 công ty)
  const featuredCompanies = useMemo(() => {
    const map = new Map<string, { company: string; repName: string; category: string; count: number; totalViews: number; avatar: string; sampleProduct: MyProduct }>();
    for (const p of allProducts) {
      const key = (p.company || "CLB Doanh Nhân CEO 1983").trim();
      if (!map.has(key)) {
        map.set(key, {
          company: key,
          repName: (p as any).contactName || (p as any).sellerName || "Hội viên CLB CEO 1983",
          category: p.category || "Doanh nghiệp thành viên",
          count: 1,
          totalViews: p.views || 1,
          avatar: p.imageUrl || "",
          sampleProduct: p,
        });
      } else {
        const curr = map.get(key)!;
        curr.count += 1;
        curr.totalViews += (p.views || 1);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count || b.totalViews - a.totalViews);
  }, [allProducts]);

  // Nhắn tin trực tiếp cho người bán / công ty khi hỏi về sản phẩm (Requirement 13)
  const handleMessageSeller = (p: MyProduct) => {
    const sellerCode = (p as any).sellerCode || (p as any).sellerId || "";
    const sellerName = (p as any).contactName || (p as any).sellerName || p.company || "Hội viên CLB CEO 1983";
    navigate({
      to: "/association/messages",
      search: {
        peerCode: sellerCode,
        peerName: sellerName,
        topic: `Tư vấn sản phẩm: ${p.name}`,
      } as any,
    });
  };

  // Quảng cáo sản phẩm công ty lung linh sang trọng (Requirement 4)
  const [sponsoredAdIdx, setSponsoredAdIdx] = useState(0);
  const [sponsoredAdHovered, setSponsoredAdHovered] = useState(false);

  const sponsoredProducts = useMemo(() => {
    if (allProducts.length > 0) {
      return allProducts.slice(0, 5);
    }
    return [] as unknown as MyProduct[];
  }, [allProducts]);

  useEffect(() => {
    if (sponsoredAdHovered || sponsoredProducts.length <= 1) return;
    const timer = setInterval(() => {
      setSponsoredAdIdx((prev) => (prev + 1) % sponsoredProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sponsoredAdHovered, sponsoredProducts.length]);

  const startEditProduct = (p: MyProduct, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingProduct(p);
    setEditPhoto(p.imageUrl || "");
    setEditName(p.name || "");
    setEditCompany(p.company || member?.title || "");
    setEditCategory(p.category || "Công nghệ & Phần mềm");
    setEditPrice(p.memberPrice || p.price || "");
    setEditOriginalPrice(p.originalPrice || "");
    setEditUnit("Gói");
    setEditCurrency("VND");
    setEditDesc("");
  };

  const handleDeleteProduct = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi sàn giao thương không?")) return;
    try {
      await fetchNestApi(`/products/${id}`, { method: "DELETE" }).catch(() =>
        fetchNestApi(`/marketplace/products/${id}`, { method: "DELETE" })
      );
      toast.success("Đã xóa sản phẩm thành công!");
      if (editingProduct?.id === id) setEditingProduct(null);
      reload();
    } catch {
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại!");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }
    setUpdatingProduct(true);
    const cleanPrice = Number(editPrice.replace(/\D/g, "")) || 0;
    const cleanOriginalPrice = Number(editOriginalPrice.replace(/\D/g, "")) || cleanPrice;

    try {
      await fetchNestApi(`/products/${editingProduct.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName.trim(),
          title: editName.trim(),
          description: editDesc.trim(),
          price: cleanPrice,
          originalPrice: cleanOriginalPrice,
          memberPrice: cleanPrice,
          category: editCategory,
          imageUrl: editPhoto || null,
          company: editCompany.trim(),
        }),
      }).catch(() =>
        fetchNestApi(`/marketplace/products/${editingProduct.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: editName.trim(),
            name: editName.trim(),
            description: editDesc.trim(),
            price: cleanPrice,
            originalPrice: cleanOriginalPrice,
            category: editCategory,
            imageUrl: editPhoto || null,
            company: editCompany.trim(),
          }),
        })
      );
      toast.success("Đã cập nhật thông tin sản phẩm thành công!");
      setEditingProduct(null);
      reload();
    } catch {
      toast.error("Không thể cập nhật sản phẩm. Vui lòng thử lại!");
    } finally {
      setUpdatingProduct(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(isEn ? "Please enter product name!" : "Vui lòng nhập tên sản phẩm!");
      return;
    }
    setCreatingProduct(true);
    const cleanPrice = Number(formPrice.replace(/\D/g, "")) || 0;
    const cleanOriginalPrice = Number(formOriginalPrice.replace(/\D/g, "")) || cleanPrice;

    const payload = {
      name: formName.trim(),
      title: formName.trim(),
      description: formDesc.trim(),
      price: cleanPrice,
      originalPrice: cleanOriginalPrice,
      memberPrice: cleanPrice,
      unit: formUnit,
      currency: formCurrency,
      category: formCategory,
      status: "active",
      imageUrl: formPhoto || null,
      imageUrls: formPhoto ? [formPhoto] : [],
      company: formCompany.trim() || resolvedProfileCompany || "CLB Doanh Nhân CEO 1983",
      companyIntro: formCompanyIntro.trim(),
      companySize: formCompanySize,
      sellerId: user?.id || (member as any)?.userId || (member as any)?.id || "ceo1983",
    };

    try {
      try {
        await fetchNestApi("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (err1: any) {
        console.warn("POST /products error, trying /marketplace/products fallback:", err1?.message);
        await fetchNestApi("/marketplace/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      toast.success(isEn ? "Product posted successfully!" : "Đã đăng sản phẩm thành công lên sàn!");
      setPostModalOpen(false);
      setFormPhoto("");
      setFormName("");
      setFormCompany(resolvedProfileCompany || "");
      setFormCompanyIntro("");
      setFormCompanySize("10 - 50 nhân sự");
      setFormOriginalPrice("");
      setFormPrice("");
      setFormUnit("Gói");
      setFormCurrency("VND");
      setFormDesc("");
      reload();
    } catch (err: any) {
      console.error("handleCreateProduct error:", err);
      toast.error(err?.message || (isEn ? "Could not post product" : "Không thể đăng sản phẩm. Vui lòng thử lại!"));
    } finally {
      setCreatingProduct(false);
    }
  };

  const renderCard = (p: MyProduct, index: number = 0) => {
    const isAuthor = checkIsProductAuthor(p);
    const canManage = checkCanManageProduct(p);
    const isInterested = interestedIds.includes(p.id);
    const menuOpen = activeProductMenuId === p.id;
    const mediaImg = resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80";
    const isStaggered = index % 2 === 1;

    return (
      <div
        key={p.id}
        className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 break-inside-avoid mb-3"
      >
        <div>
          {/* Product Image Box - Click to open Shopee Detail Modal */}
          <div
            onClick={() => handleOpenProductDetail(p)}
            className={`relative ${isStaggered ? "aspect-[4/5]" : "aspect-square sm:aspect-[4/3]"} w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer`}
          >
            <img
              src={mediaImg}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Category Tag */}
            <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-950/60 backdrop-blur-md px-2.5 py-0.5 text-[9.5px] font-semibold text-white tracking-wide border border-white/10 shadow-xs">
              {p.category || "Dịch vụ"}
            </span>

            {/* Wishlist Heart Action */}
            <button
              type="button"
              onClick={(e) => toggleInterest(p.id, e)}
              className={`absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xs ${
                isInterested
                  ? "bg-rose-500 text-white shadow-rose-500/30"
                  : "bg-white/80 dark:bg-slate-900/80 text-slate-500 hover:text-rose-500 hover:bg-white"
              }`}
              title={isInterested ? "Đã lưu quan tâm" : "Lưu quan tâm"}
            >
              <Heart className={`h-3.5 w-3.5 ${isInterested ? "fill-white" : ""}`} />
            </button>

            {/* Owner/Admin Action Menu */}
            {canManage && (
              <div className="absolute left-2.5 bottom-2.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProductMenuId(menuOpen ? null : p.id);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full bg-slate-950/70 backdrop-blur-md text-white hover:bg-slate-900 transition-all cursor-pointer shadow-xs border border-white/15"
                    title="Tùy chọn quản trị"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute left-0 bottom-8 w-32 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-scale-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          setActiveProductMenuId(null);
                          startEditProduct(p, e);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5 text-blue-500" />
                        <span>Sửa thông tin</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          setActiveProductMenuId(null);
                          handleDeleteProduct(p.id, e);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa bài đăng</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIP Perk Badge */}
            <Link
              to="/association/perks"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2.5 bottom-2.5 z-10 flex items-center gap-1 rounded-full bg-[#003B95] text-white px-2.5 py-0.5 text-[9.5px] font-bold shadow-xs transition-transform hover:scale-105 border border-white/20"
              title="Ưu đãi độc quyền liên kết App Hiệp Hội"
            >
              <span>ƯU ĐÃI VIP</span>
            </Link>
          </div>

          {/* Product Details Info */}
          <div className="p-3.5">
            {/* Company & Seller Subtitle */}
            <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400 dark:text-slate-500 font-medium truncate mb-1">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingCompany({
                    name: p.company || "CLB CEO 1983",
                    avatarUrl: (p as any).companyAvatar || null,
                    industry: p.category,
                  });
                }}
                className="truncate uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 hover:text-[#003B95] dark:hover:text-blue-400 cursor-pointer transition-colors"
                title={`Xem gian hàng ${p.company || "CLB CEO 1983"}`}
              >
                {p.company || "CLB CEO 1983"}
              </span>
              <span className="shrink-0 text-[#003B95] dark:text-blue-400 font-medium">
                {p.sellerName || "Hội viên"}
              </span>
            </div>

            {/* Product Title - Click to open Shopee Detail Modal */}
            <h4
              onClick={() => handleOpenProductDetail(p)}
              className="text-[13px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors mb-2 min-h-[34px] cursor-pointer"
            >
              {p.name}
            </h4>

            {/* Price Section */}
            <div className="space-y-0.5 mb-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                  {formatSmartProductPrice(p.memberPrice || p.price)}
                </span>
                {p.originalPrice && p.originalPrice !== p.memberPrice && (
                  <span className="text-[11px] text-slate-400 line-through">
                    {formatSmartProductPrice(p.originalPrice)}
                  </span>
                )}
              </div>
              <span className="inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Đặc quyền Hội viên CEO 1983
              </span>
            </div>

            {/* Shopee-style Product Rating & Sales info */}
            <div className="flex items-center justify-between text-[11px] mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[#EE4D2D] font-bold">
                <Star className="size-3 fill-[#EE4D2D] text-[#EE4D2D]" />
                <span>4.9</span>
                <span className="text-[10px] text-slate-400 font-normal">({(p.views ? Math.floor(p.views / 2) + 8 : 28)})</span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                98% Hài lòng
              </div>
            </div>

            {/* Meta Strip */}
            <div className="flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <span>{p.views || 1} lượt xem</span>
              <span>{(p as any).unit ? `ĐVT: ${(p as any).unit}` : "Báo giá VIP"}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 pt-0">
          {isAuthor ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenProductQuotes(p)}
                className="flex-1 h-8.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#003B95] dark:text-blue-300 text-center flex items-center justify-center gap-1.5 hover:bg-blue-100 transition cursor-pointer"
                title="Xem danh sách người quan tâm & yêu cầu báo giá"
              >
                <Users className="h-3.5 w-3.5 text-[#003B95] dark:text-blue-400 shrink-0" />
                <span className="truncate">Người quan tâm</span>
              </button>
              <button
                type="button"
                onClick={(e) => startEditProduct(p, e)}
                className="h-8.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shrink-0"
                title="Chỉnh sửa sản phẩm"
              >
                <span>Sửa</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMessageSeller(p);
                }}
                className="h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-[#003B95] hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 grid place-items-center transition active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                title="Nhắn tin cho công ty / người bán sản phẩm này"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              {checkIsProductOwner(p) ? (
                <button
                  type="button"
                  onClick={() => handleOpenProductQuotes(p)}
                  className="flex-1 h-8.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="h-3.5 w-3.5 text-white shrink-0" />
                  <span>Yêu cầu báo giá ({p.quoteRequestsCount || 0})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenQuoteModal(p)}
                  className="flex-1 h-8.5 px-3 rounded-xl bg-[#003B95] hover:bg-[#002b6e] text-white text-xs font-bold shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Nhận báo giá VIP</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white shrink-0" />
                </button>
              )}
              {isAdmin && !checkIsProductOwner(p) && (
                <button
                  type="button"
                  onClick={() => handleOpenProductQuotes(p)}
                  className="h-8.5 px-2.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition cursor-pointer flex items-center justify-center shrink-0"
                  title="Xem yêu cầu báo giá (Quyền Admin)"
                >
                  <Users className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCompanyStorefront = () => {
    if (!viewingCompany) return null;
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20">

        {/* Sticky Nav with Back Button */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setViewingCompany(null);
              setCompanyCatFilter("all");
              setCompanySearch("");
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2E3192] dark:hover:text-amber-400 transition cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại Chợ giao thương</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="truncate max-w-[160px] sm:max-w-xs font-semibold text-slate-700 dark:text-slate-300">
              {viewingCompany.name}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Gian hàng B2B</span>
          </div>
        </div>

        {/* Hero Storefront Banner */}
        <div className="relative bg-gradient-to-br from-[#2E3192] via-[#1E2269] to-[#0F172A] text-white p-5 sm:p-8 shadow-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 shadow-xl shrink-0">
                <img
                  src={viewingCompany.avatarUrl || "/ceo1983-official-logo.png"}
                  alt={viewingCompany.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-black text-white truncate">
                    {viewingCompany.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-300/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-xs">
                    <BadgeCheck className="h-3.5 w-3.5 text-amber-400" />
                    Xác thực CEO 1983
                  </span>
                  {isCompanyOwner && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Chủ sở hữu gian hàng
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1 flex items-center gap-2 flex-wrap font-medium">
                  <span>{viewingCompany.industry || "Doanh nghiệp thành viên"}</span>
                  <span>•</span>
                  <span>Hội viên chính thức CLB CEO 1983</span>
                </p>
                <p className="mt-2.5 text-xs text-white/85 leading-relaxed max-w-2xl">
                  {viewingCompany.bio ||
                    "Doanh nghiệp thành viên chính thức CLB Doanh Nhân CEO 1983. Cam kết cung ứng giải pháp và sản phẩm chất lượng cao với chính sách ưu đãi đặc quyền cho các hội viên."}
                </p>
              </div>
            </div>

            {/* Action Toolbar Inside Company Storefront */}
            <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-white">{companyProducts.length}</span>
                  <span className="text-blue-200 text-[11px]">Sản phẩm & Dịch vụ</span>
                </div>
                <div className="h-3 w-px bg-white/20" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-blue-200 text-[11px]">Cam kết bảo trợ CLB</span>
                </div>
              </div>

              {/* Company Owner controls: Excel Import/Export and Add Product */}
              <div className="flex items-center gap-2 flex-wrap">
                {isCompanyOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExcelImportOpen(true)}
                      className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title="Nhập danh sách sản phẩm từ file Excel"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                      <span>Nhập Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportProductsToExcel(companyProducts)}
                      className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title="Xuất danh sách sản phẩm ra file Excel"
                    >
                      <Download className="h-4 w-4 text-emerald-400" />
                      <span>Xuất Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormCompany(viewingCompany.name);
                        setPostModalOpen(true);
                      }}
                      className="h-9 px-3.5 rounded-xl bg-[#003B95] hover:bg-[#002b6e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-white" />
                      <span>Thêm sản phẩm</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (companyProducts[0]) {
                        handleOpenQuoteModal(companyProducts[0]);
                      } else {
                        toast.info("Gian hàng hiện chưa có sản phẩm để báo giá.");
                      }
                    }}
                    className="h-9 px-4 rounded-xl bg-[#003B95] hover:bg-[#002b6e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Mail className="h-4 w-4 text-white" />
                    <span>Yêu cầu báo giá VIP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Products Catalog */}
        <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setCompanyCatFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  companyCatFilter === "all"
                    ? "bg-[#2E3192] text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Tất cả ({companyProducts.length})
              </button>
              {companyCategories.map((cat) => {
                const count = companyProducts.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCompanyCatFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      companyCatFilter === cat
                        ? "bg-[#2E3192] text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search input in Storefront */}
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Tìm kiếm trong gian hàng..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#2E3192]"
              />
              {companySearch && (
                <button
                  type="button"
                  onClick={() => setCompanySearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          {filteredCompanyProducts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {companySearch ? "Không tìm thấy sản phẩm phù hợp" : "Gian hàng chưa có sản phẩm thuộc danh mục này"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isCompanyOwner
                  ? "Hãy nhấn 'Thêm sản phẩm' hoặc 'Nhập Excel' để đưa sản phẩm của doanh nghiệp bạn lên sàn giao thương."
                  : "Vui lòng chọn danh mục khác hoặc quay lại sau."}
              </p>
              {isCompanyOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setFormCompany(viewingCompany.name);
                    setPostModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E3192] text-white text-xs font-bold shadow-xs hover:bg-[#232677] transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Đăng sản phẩm ngay</span>
                </button>
              )}
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 gap-3 [&>*]:break-inside-avoid [&>*]:mb-3">
              {filteredCompanyProducts.map((p, idx) => {
                const canManage = isCompanyOwner || checkCanManageProduct(p);
                const isInterested = interestedIds.includes(p.id);
                const isStaggered = idx % 2 === 1;
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#2E3192]/30 dark:hover:border-amber-400/30 transition-all duration-200 break-inside-avoid mb-3"
                  >
                    <div className={`relative ${isStaggered ? "aspect-[4/5]" : "aspect-square sm:aspect-4/3"} w-full bg-slate-100 dark:bg-slate-800 overflow-hidden`}>
                      <img
                        src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />
                      {canManage && (
                        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditProduct(p, e);
                            }}
                            className="h-7 w-7 rounded-lg bg-black/60 hover:bg-blue-600 text-white grid place-items-center transition cursor-pointer backdrop-blur-xs"
                            title="Sửa sản phẩm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(p.id, e);
                            }}
                            className="h-7 w-7 rounded-lg bg-black/60 hover:bg-rose-600 text-white grid place-items-center transition cursor-pointer backdrop-blur-xs"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <span className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-amber-400/95 text-slate-950 px-2 py-0.5 text-[9px] font-black shadow-xs">
                        ƯU ĐÃI VIP B2B
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {p.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {p.category}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mt-0.5 mb-1.5 group-hover:text-[#2E3192] dark:group-hover:text-amber-400 transition-colors">
                          {p.name}
                        </h4>
                        {p.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Giá Hội Viên</span>
                            <div className="text-base font-black text-rose-600 dark:text-amber-400">
                              {formatSmartProductPrice(p.memberPrice || p.price)}
                            </div>
                          </div>
                          {Boolean(p.originalPrice && (p.memberPrice || p.price) && Number(p.originalPrice) > Number(p.memberPrice || p.price)) && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatSmartProductPrice(p.originalPrice)}
                            </span>
                          )}
                        </div>

                        {canManage ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditProduct(p, e);
                              }}
                              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Sửa thông tin</span>
                            </button>
                            {p.quoteRequestsCount !== undefined && p.quoteRequestsCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setViewingQuotesProduct(p)}
                                className="px-2.5 py-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Xem các yêu cầu báo giá"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                <span>{p.quoteRequestsCount}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleInterest(p.id)}
                              className={`h-9 w-9 rounded-xl grid place-items-center transition cursor-pointer border shrink-0 ${
                                isInterested
                                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600"
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500"
                              }`}
                              title={isInterested ? "Bỏ quan tâm" : "Lưu vào giỏ quan tâm"}
                            >
                              <Heart className={`h-4 w-4 ${isInterested ? "fill-rose-600" : ""}`} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMessageSeller(p);
                              }}
                              className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-[#003B95] hover:text-white dark:bg-slate-800 dark:hover:bg-[#003B95] dark:hover:text-white text-slate-700 dark:text-slate-200 grid place-items-center transition active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                              title="Nhắn tin cho công ty / người bán"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenQuoteModal(p)}
                              className="flex-1 h-9 rounded-xl bg-[#2E3192] hover:bg-[#232677] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                            >
                              <Mail className="h-3.5 w-3.5 text-amber-300" />
                              <span>Nhận báo giá VIP</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="vba-animate pb-24 text-slate-900 dark:text-white">
      {viewingCompany ? (
        renderCompanyStorefront()
      ) : (
        <>
          {/* ── TOP HEADER (Chợ Marketplace) ── */}
          <div className="sticky top-0 z-30 self-stretch px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-xs">
            <div className="flex justify-start items-center gap-2.5">
              <button 
                type="button" 
                onClick={() => window.history.back()}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                aria-label="Quay lại"
              >
                <ChevronLeft className="size-5 text-sky-950 dark:text-white" />
              </button>
              <div className="justify-start text-sky-950 dark:text-white text-lg font-bold font-['Inter']">
                Chợ Marketplace
              </div>
            </div>
          </div>

          {/* ── SUB-HEADER TABS: Chợ Marketplace vs Đã quan tâm vs Mục của tôi ── */}
          <div id="tour-market-tabs" className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMarketplaceTab("market")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                marketplaceTab === "market"
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Store className="size-3.5" />
              <span>Chợ Marketplace</span>
            </button>
            <button
              type="button"
              onClick={() => setMarketplaceTab("interested")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                marketplaceTab === "interested"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Heart className={`size-3.5 ${marketplaceTab === "interested" ? "fill-white text-white" : "fill-rose-500 text-rose-500"}`} />
              <span>Đã quan tâm ({interestedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMarketplaceTab("my_store")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                marketplaceTab === "my_store"
                  ? "bg-[#003B95] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Package className="size-3.5" />
              <span>Mục của tôi ({myProductsCount})</span>
            </button>
          </div>

          {marketplaceTab === "interested" ? (
            <div className="self-stretch px-4 pt-4 pb-6 flex flex-col justify-start items-start gap-4">
              <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Heart className="size-4 fill-rose-500 text-rose-500" />
                    <span>Sản Phẩm Đã Quan Tâm ({interestedIds.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Danh mục các sản phẩm / dịch vụ bạn đã lưu để theo dõi và kết nối giao thương</p>
                </div>
              </div>

              {allProducts.filter((p) => interestedIds.includes(p.id)).length === 0 ? (
                <div className="w-full py-12 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="size-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                    <Heart className="size-6 text-rose-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có sản phẩm quan tâm nào</p>
                    <p className="text-xs text-slate-500 max-w-xs">Nhấn biểu tượng trái tim ở các sản phẩm trên Chợ Marketplace để lưu vào danh mục này.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMarketplaceTab("market")}
                    className="px-4 py-2 bg-[#003B95] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Khám phá Chợ Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {allProducts
                    .filter((p) => interestedIds.includes(p.id))
                    .map((p) => {
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            trackRecentlyViewed(p);
                            handleOpenQuoteModal(p);
                          }}
                          className="w-full bg-white dark:bg-slate-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex flex-col justify-start items-start overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer"
                        >
                          <img className="self-stretch h-28 object-cover" src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"} alt={p.name} />
                          <div className="self-stretch p-3 flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch inline-flex justify-between items-center">
                              <div className="justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate max-w-[100px]">
                                {p.category || "Hội viên"}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => toggleInterest(p.id, e)}
                                className="size-5 inline-flex flex-col justify-center items-center text-rose-500 hover:scale-110 transition cursor-pointer"
                                title="Bỏ quan tâm"
                              >
                                <Heart className="size-4 fill-rose-500 text-rose-500" />
                              </button>
                            </div>
                            <div className="self-stretch justify-start text-slate-900 dark:text-white text-xs font-semibold font-['Inter'] line-clamp-2 h-8 leading-4">
                              {p.name}
                            </div>
                            <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate">
                              {p.company || "CEO 1983"}
                            </div>
                            <div className="self-stretch inline-flex justify-between items-center pt-0.5 border-t border-slate-100 dark:border-slate-700/60 mt-1">
                              <div className="justify-start text-blue-900 dark:text-blue-400 text-xs font-bold font-['Inter']">
                                {formatSmartProductPrice(p.memberPrice || p.price)}
                              </div>
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Báo giá</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : marketplaceTab === "my_store" ? (
            <div className="self-stretch px-4 pt-4 pb-6 flex flex-col justify-start items-start gap-4">
              {/* Action Banner for Companies */}
              <div className="w-full bg-gradient-to-br from-slate-900 via-[#003B95] to-blue-950 text-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center">
                      <Building2 className="size-5 text-blue-200" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Gian Hàng & Tiếp Thị Doanh Nghiệp</h4>
                      <p className="text-[11px] text-blue-200">Quản lý sản phẩm và quảng bá thương hiệu B2B</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setPostModalOpen(true)}
                    className="py-2.5 px-3 bg-white text-[#003B95] hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="size-4" />
                    <span>Đăng sản phẩm mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdRegistrationModalOpen(true)}
                    className="py-2.5 px-3 bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/30 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    <Megaphone className="size-4 text-amber-300" />
                    <span>Liên hệ quảng cáo</span>
                  </button>
                </div>
              </div>

              {/* Excel and Quick tools */}
              <div className="w-full flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Sản phẩm đã đăng ({myProductsCount})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExcelImportOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="size-3" />
                    <span>Nhập Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mine = allProducts.filter((p) => checkIsProductOwner(p));
                      exportProductsToExcel(mine);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="size-3 text-emerald-600" />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>

              {/* List of user's products */}
              {allProducts.filter((p) => checkIsProductOwner(p)).length === 0 ? (
                <div className="w-full py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-3">
                  <div className="size-14 rounded-2xl bg-blue-50 dark:bg-slate-800 grid place-items-center">
                    <Package className="size-7 text-[#003B95] dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bạn chưa đăng sản phẩm nào</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Đăng ngay sản phẩm hoặc dịch vụ để tiếp cận 1983+ lãnh đạo doanh nghiệp và nhận chào giá trực tiếp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPostModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-[#003B95] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-900 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="size-4" />
                    <span>Đăng sản phẩm ngay</span>
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  {allProducts
                    .filter((p) => checkIsProductOwner(p))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs"
                      >
                        <img
                          src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="size-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                              {p.category || "Dịch vụ"}
                            </span>
                            {(p as any).isVip && (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                                VIP
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                            {p.name}
                          </h4>
                          <div className="text-xs font-bold text-[#003B95] dark:text-blue-400 mt-0.5">
                            {formatSmartProductPrice(p.memberPrice || p.price)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditProduct(p)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Pencil className="size-3" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenProductQuotes(p)}
                            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Xem các yêu cầu báo giá từ khách hàng"
                          >
                            <Users className="size-3" />
                            <span>Yêu cầu báo giá ({p.quoteRequestsCount || 0})</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProduct(p.id, e)}
                            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ── SCROLLABLE CONTENT (390px spec according to Figma) ── */}
              <div className="self-stretch px-4 pt-4 pb-6 flex flex-col justify-start items-start gap-5">
            
            {/* 1. SEARCH ROW (Bên trái thanh tìm kiếm là icon dạng menu có sắp xếp giá, dưới tìm kiếm là danh mục gần đây đã chọn) */}
            <div className="self-stretch flex flex-col gap-2.5">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                {/* Icon menu sắp xếp nằm BÊN TRÁI thanh tìm kiếm */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="size-10 p-2.5 bg-[#003B95] dark:bg-slate-800 border border-blue-900/30 dark:border-slate-700 rounded-xl flex justify-center items-center text-white cursor-pointer hover:bg-blue-900 transition active:scale-95 shadow-xs shrink-0"
                    title="Menu sắp xếp giá & tiêu chí lọc"
                  >
                    <SlidersHorizontal className="size-4 text-white" />
                  </button>

                  {/* Filter Menu Dropdown */}
                  {filterMenuOpen && (
                    <div className="absolute left-0 top-12 w-64 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl text-xs space-y-2 z-40 animate-scale-in">
                      <div className="font-bold text-[#003B95] dark:text-blue-400 flex items-center justify-between">
                        <span>Sắp xếp theo tiêu chí:</span>
                        <button
                          type="button"
                          onClick={() => setFilterMenuOpen(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        {[
                          { id: "newest", label: "Mới đăng nhất" },
                          { id: "price_asc", label: "Giá: Thấp đến cao (Tiết kiệm)" },
                          { id: "price_desc", label: "Giá: Cao đến thấp (Cao cấp)" },
                          { id: "rating_desc", label: "Đánh giá cao nhất (Số sao tốt nhất)" },
                          { id: "most_viewed", label: "Xem nhiều nhất (Phổ biến)" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSortMode(s.id as any);
                              setFilterMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                              sortMode === s.id
                                ? "bg-[#003B95] text-white"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                            }`}
                          >
                            <span>{s.label}</span>
                            {sortMode === s.id && <Check className="size-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Search nằm ở giữa */}
                <div className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex justify-start items-center gap-2 shadow-2xs">
                  <Search className="size-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm, đối tác, doanh nghiệp..."
                    className="flex-1 justify-start text-slate-700 dark:text-slate-200 placeholder:text-slate-500 text-xs font-normal font-['Inter'] bg-transparent outline-none border-none"
                  />
                  {q && (
                    <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dưới tìm kiếm là danh mục gần đây đã chọn (Shopee Style recent categories chips) */}
              <div className="self-stretch flex flex-col gap-1.5 pt-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" />
                    <span>Danh mục gần đây đã chọn:</span>
                  </span>
                  {recentCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setRecentCategories([]);
                        try {
                          localStorage.removeItem("ceo1983_recent_categories");
                        } catch {}
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {recentCategories.map((catName) => {
                    const isSelected = selectedCategory === catName;
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => handleSelectCategory(catName)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                          isSelected
                            ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. INDUSTRY CHIPS */}
            <div className="self-stretch inline-flex justify-start items-start gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "all", label: "Tất cả" },
                { id: "interested", label: `Đã quan tâm (${interestedIds.length})` },
                { id: "tech", label: "Công nghệ" },
                { id: "realestate", label: "Xây dựng" },
                { id: "services", label: "Dịch vụ doanh nghiệp" },
                { id: "logistics", label: "Logistics" },
              ].map((chip) => {
                const isActive = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`px-3.5 py-2 rounded-[100px] flex justify-start items-start cursor-pointer transition shrink-0 ${
                      isActive
                        ? "bg-sky-950 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`text-xs font-['Inter'] ${isActive ? "text-white font-bold" : "text-slate-500 font-semibold"}`}>
                      {chip.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. DYNAMIC SPONSORED ADS SLIDER (CRM Sync) */}
            <div className="self-stretch px-1">
              <MarketplaceAdSlider />
            </div>

            {/* 4. SẢN PHẨM MỚI ĐĂNG (HORIZONTAL CAROUSEL) */}
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch px-4 inline-flex justify-between items-center">
                  <div className="justify-start text-blue-900 dark:text-blue-400 text-base font-bold font-['Inter'] uppercase tracking-tight">
                    SẢN PHẨM MỚI ĐĂNG
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowAllProducts(!showAllProducts)}
                    className="justify-start text-blue-600 dark:text-blue-400 text-xs font-semibold font-['Inter'] hover:underline cursor-pointer"
                  >
                    {showAllProducts ? "Thu gọn" : "Xem tất cả"}
                  </button>
                </div>

                {/* Horizontal carousel */}
                <div id="tour-market-grid" className="self-stretch pl-4 inline-flex justify-start items-start gap-3 overflow-x-auto no-scrollbar pb-2">
                  {/* Dynamic Products from Database */}
                  {allProducts.length === 0 ? (
                    <div className="py-6 px-4 text-center w-full">
                      <p className="text-xs text-slate-400">Chưa có sản phẩm nào trên hệ thống</p>
                    </div>
                  ) : null}

                  {/* Dynamic Products from Database */}
                  {allProducts.slice(0, 8).map((p, pIdx) => {
                    const isLiked = interestedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        id={pIdx === 0 ? "tour-market-detail-quote" : undefined}
                        onClick={() => handleOpenProductDetail(p)}
                        className="w-44 bg-white dark:bg-slate-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 inline-flex flex-col justify-start items-start overflow-hidden shrink-0 shadow-xs hover:shadow-md transition cursor-pointer"
                      >
                        <img className="self-stretch h-24 object-cover" src={p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"} alt={p.name} />
                        <div className="self-stretch p-3 flex flex-col justify-start items-start gap-2">
                          <div className="self-stretch inline-flex justify-between items-center">
                            <div className="justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate max-w-[100px]">
                              {p.category || "Doanh nghiệp"}
                            </div>
                            <div className="px-1 py-0.5 bg-amber-100 rounded-[3px] flex justify-start items-start shrink-0">
                              <div className="justify-start text-amber-600 text-[9px] font-bold font-['Inter']">VIP</div>
                            </div>
                          </div>
                          <div className="self-stretch justify-start text-slate-900 dark:text-white text-xs font-semibold font-['Inter'] line-clamp-2 h-8 leading-4">
                            {p.name}
                          </div>
                          <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate">
                            {p.company || "Hội viên CEO 1983"}
                          </div>
                          <div className="self-stretch inline-flex justify-between items-center pt-0.5">
                            <div className="justify-start text-blue-900 dark:text-blue-400 text-xs font-bold font-['Inter']">
                              {formatSmartProductPrice(p.memberPrice || p.price)}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => toggleInterest(p.id, e)}
                              className="size-4 inline-flex flex-col justify-center items-center text-slate-500 hover:text-rose-500 transition cursor-pointer"
                            >
                              <Heart className={`size-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            
            {/* 5. SẢN PHẨM MỚI XEM (RECENTLY VIEWED PRODUCTS CAROUSEL) */}
            {recentlyViewed.length > 0 && (
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="self-stretch px-4 inline-flex justify-between items-center">
                  <div className="justify-start text-sky-950 dark:text-white text-base font-bold font-['Inter'] uppercase tracking-tight flex items-center gap-2">
                    <Eye className="size-4 text-[#003B95] dark:text-blue-400" />
                    <span>SẢN PHẨM MỚI XEM</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium font-mono">
                    {recentlyViewed.length} sản phẩm
                  </span>
                </div>

                {/* Horizontal scroll carousel */}
                <div className="self-stretch pl-4 inline-flex justify-start items-start gap-3 overflow-x-auto no-scrollbar pb-2">
                  {recentlyViewed.map((p) => {
                    const isLiked = interestedIds.includes(p.id);
                    return (
                      <div
                        key={p.id || p._id}
                        onClick={() => handleOpenProductDetail(p)}
                        className="w-44 bg-white dark:bg-slate-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 inline-flex flex-col justify-start items-start overflow-hidden shrink-0 shadow-xs hover:shadow-md transition cursor-pointer"
                      >
                        <img className="self-stretch h-24 object-cover" src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"} alt={p.name} />
                        <div className="self-stretch p-3 flex flex-col justify-start items-start gap-2">
                          <div className="self-stretch inline-flex justify-between items-center">
                            <div className="justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate max-w-[100px]">
                              {p.category || "Hội viên"}
                            </div>
                            {p.isVip && (
                              <div className="px-1 py-0.5 bg-amber-100 rounded-[3px] flex justify-start items-start shrink-0">
                                <div className="justify-start text-amber-600 text-[9px] font-bold font-['Inter']">VIP</div>
                              </div>
                            )}
                          </div>
                          <div className="self-stretch justify-start text-slate-900 dark:text-white text-xs font-semibold font-['Inter'] line-clamp-2 h-8 leading-4">
                            {p.name}
                          </div>
                          <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate">
                            {p.company || "CEO 1983"}
                          </div>
                          <div className="self-stretch inline-flex justify-between items-center pt-0.5">
                            <div className="justify-start text-blue-900 dark:text-blue-400 text-xs font-bold font-['Inter']">
                              {p.priceDisplay || formatSmartProductPrice(p.memberPrice || p.price)}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => toggleInterest(p.id, e)}
                              className="size-4 inline-flex flex-col justify-center items-center text-slate-500 hover:text-rose-500 transition cursor-pointer"
                            >
                              <Heart className={`size-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. DOANH NGHIỆP NỔI BẬT */}
            {featuredCompanyProduct && (
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="justify-start text-sky-950 dark:text-white text-sm font-bold font-['Inter']">
                  DOANH NGHIỆP NỔI BẬT
                </div>
                <div className="self-stretch p-4 bg-white dark:bg-slate-800 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex flex-col justify-start items-start gap-3 shadow-xs">
                  <div className="self-stretch inline-flex justify-start items-center gap-3">
                    <div className="size-11 bg-sky-950 rounded-full flex justify-center items-center text-amber-400 font-bold overflow-hidden shrink-0 shadow-inner">
                      <Building2 className="size-5 text-amber-400" />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                      <div className="self-stretch justify-start text-sky-950 dark:text-white text-sm font-bold font-['Inter'] line-clamp-1">
                        {featuredCompanyProduct.company}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter']">
                        {featuredCompanyProduct.category || "Hội viên CLB CEO 1983"}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-start">
                    <div className="justify-start text-slate-500 text-xs font-normal font-['Inter']">Xếp hạng:</div>
                    <div className="justify-start text-emerald-500 text-xs font-bold font-['Inter']">
                      ★★★★★ Elite Partner
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingCompany({
                      name: featuredCompanyProduct.company || "Hội viên CLB CEO 1983",
                      bio: featuredCompanyProduct.description || "Doanh nghiệp hội viên trực thuộc CLB CEO 1983.",
                      avatarUrl: resolveMediaUrl(featuredCompanyProduct.imageUrl) || featuredCompanyProduct.imageUrl || "",
                      industry: featuredCompanyProduct.category || "Doanh nghiệp",
                    })}
                    className="self-stretch px-4 py-2.5 bg-sky-950 rounded-[100px] inline-flex justify-center items-center cursor-pointer hover:bg-sky-900 transition active:scale-[0.98] shadow-xs"
                  >
                    <div className="justify-start text-white text-xs font-bold font-['Inter']">
                      Ghé thăm gian hàng
                    </div>
                  </button>
                </div>
              </div>
            )}

          </div>

      
      {/* TRƯỜNG HỢP CÓ TÌM KIẾM HOẶC LỌC DANH MỤC RIÊNG */}
      {(q || selectedCategory !== "all") && (
        <div className="mt-2 mb-4 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Search className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                <span>
                  {q ? `Kết quả tìm kiếm cho "${q}"` : `Danh mục: ${categoriesList.find((c) => c.id === selectedCategory)?.label || selectedCategory}`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Tìm thấy {list.length} sản phẩm phù hợp</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setSelectedCategory("all");
              }}
              className="text-xs font-semibold text-[#003B95] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Xóa lọc
            </button>
          </div>

          {list.length === 0 ? (
            <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <p className="text-xs text-slate-400">Không tìm thấy sản phẩm nào phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {list.map((p) => {
                const isLiked = interestedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProductDetail(p)}
                    className="w-full bg-white dark:bg-slate-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 dark:outline-slate-700 flex flex-col justify-start items-start overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer"
                  >
                    <img className="self-stretch h-24 object-cover" src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"} alt={p.name} />
                    <div className="self-stretch p-3 flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch inline-flex justify-between items-center">
                        <div className="justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate max-w-[100px]">
                          {p.category || "Hội viên"}
                        </div>
                      </div>
                      <div className="self-stretch justify-start text-slate-900 dark:text-white text-xs font-semibold font-['Inter'] line-clamp-2 h-8 leading-4">
                        {p.name}
                      </div>
                      <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] truncate">
                        {p.company || "CEO 1983"}
                      </div>
                      <div className="self-stretch inline-flex justify-between items-center pt-0.5">
                        <div className="justify-start text-blue-900 dark:text-blue-400 text-xs font-bold font-['Inter']">
                          {formatSmartProductPrice(p.memberPrice || p.price)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleInterest(p.id, e)}
                          className="size-4 inline-flex flex-col justify-center items-center text-slate-500 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Heart className={`size-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
            </>
          )}

      {/* ── FOOTER BANNER: COMPACT MODERN STRIP ── */}
      <div className="mt-6 mb-4 px-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#2E3192]/10 dark:bg-amber-400/10 grid place-items-center shrink-0">
              <Store className="h-4 w-4 text-[#2E3192] dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                <span>CEO 1983 Marketplace</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">5.0</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sàn giao thương B2B & liên kết giá trị doanh nghiệp hội viên
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/association/perks"
              className="h-8 px-3 rounded-xl bg-[#2E3192] hover:bg-[#232677] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Ưu đãi VIP</span>
            </Link>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ── MODAL ĐĂNG SẢN PHẨM: ĐÃ SỬA THEME SÁNG TRANG NHÃ & CHÍNH GIỮA MÀN MOBILE ── */}
      {mounted && postModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setPostModalOpen(false)}
        >
          <div
            className="my-auto w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
                {isEn ? "Post New Product / Service" : "Đăng Sản Phẩm / Dịch Vụ Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [scrollbar-width:thin]">
                {/* ── PHẦN 1: THÔNG TIN DOANH NGHIỆP & GIAN HÀNG ── */}
                <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2E3192] dark:text-amber-400">
                    <Store className="h-4 w-4 text-[#2E3192] dark:text-amber-400" />
                    <span>1. Thông tin Doanh Nghiệp & Gian Hàng</span>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Company / Brand Name *" : "Tên Doanh Nghiệp / Thương Hiệu *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder={isEn ? "Company name" : "Ví dụ: Công ty Cổ phần Công nghệ ABC"}
                      className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? "Employee Scale" : "Quy mô nhân sự"}
                      </label>
                      <select
                        value={formCompanySize}
                        onChange={(e) => setFormCompanySize(e.target.value)}
                        className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                      >
                        <option value="Dưới 10 nhân sự">Dưới 10 nhân sự</option>
                        <option value="10 - 50 nhân sự">10 - 50 nhân sự</option>
                        <option value="50 - 200 nhân sự">50 - 200 nhân sự</option>
                        <option value="200 - 500 nhân sự">200 - 500 nhân sự</option>
                        <option value="Trên 500 nhân sự">Trên 500 nhân sự</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? "Industry" : "Lĩnh vực chính"}
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                      >
                        <option value="Công nghệ & Phần mềm">Công nghệ & Phần mềm</option>
                        <option value="Bất động sản & Xây dựng">Bất động sản & Xây dựng</option>
                        <option value="Sản xuất & Công nghiệp">Sản xuất & Công nghiệp</option>
                        <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                        <option value="Dịch vụ & Du lịch">Dịch vụ & Du lịch</option>
                        <option value="Hàng tiêu dùng & Bán lẻ">Hàng tiêu dùng & Bán lẻ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Company Bio / Intro" : "Giới thiệu ngắn về doanh nghiệp"}
                    </label>
                    <textarea
                      rows={2}
                      value={formCompanyIntro}
                      onChange={(e) => setFormCompanyIntro(e.target.value)}
                      placeholder="Giới thiệu năng lực cung ứng, giấy phép hoặc kinh nghiệm thị trường..."
                      className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700 resize-none"
                    />
                  </div>
                </div>

                {/* ── PHẦN 2: THÔNG TIN SẢN PHẨM / DỊCH VỤ ── */}
                <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-3.5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <PackageCheck className="h-4 w-4" />
                    <span>2. Thông tin Sản Phẩm / Dịch Vụ</span>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Product Image (Clear & Required)" : "Ảnh sản phẩm (Bắt buộc & Rõ nét)"}
                    </label>
                    {formPhoto ? (
                      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <img
                          src={resolveMediaUrl(formPhoto) || formPhoto}
                          alt="Ảnh sản phẩm"
                          className="h-36 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormPhoto("")}
                          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/75 text-white hover:bg-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-4 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/70 transition">
                        <ImagePlus className="h-6 w-6 text-[#2E3192] dark:text-amber-400 mb-1" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {isEn ? "Click to upload product image" : "Chọn ảnh sản phẩm tải lên (Lưu MinIO)"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const tid = toast.loading("Đang tải ảnh sản phẩm lên MinIO...");
                            try {
                              const uploadedUrl = await uploadFileToNest(file, "products");
                              if (uploadedUrl) {
                                setFormPhoto(uploadedUrl);
                                toast.success("Đã tải ảnh sản phẩm lên MinIO thành công!", { id: tid });
                              }
                            } catch (err: any) {
                              toast.error(err?.message || "Tải ảnh sản phẩm thất bại!", { id: tid });
                            } finally {
                              if (e.target) e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Product / Service Name *" : "Tên sản phẩm / Dịch vụ *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={isEn ? "e.g. Enterprise Cloud Solution..." : "Ví dụ: Gói giải pháp chuyển đổi số doanh nghiệp..."}
                      className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? "Listed Price (Original)" : "Giá niêm yết (Gốc)"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(formatCurrencyInput(e.target.value))}
                        placeholder="Ví dụ: 20.000.000 đ"
                        className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? "VIP Member Price *" : "Giá ưu đãi Hội viên *"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(formatCurrencyInput(e.target.value))}
                        placeholder="Ví dụ: 15.000.000 đ"
                        className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? "Unit" : "Đơn vị tính"}
                      </label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="Gói / Chiếc / Tháng"
                        className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isEn ? "Currency" : "Tiền tệ"}
                      </label>
                      <select
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value)}
                        className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer"
                      >
                        <option value="VND">VNĐ</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Description & Quality Commitment" : "Mô tả sản phẩm & Cam kết chất lượng"}
                    </label>
                    <textarea
                      rows={2}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder={isEn ? "Describe specs, warranty, exclusive member discounts..." : "Mô tả thông số, chính sách bảo hành, ưu đãi riêng cho hội viên CEO 1983..."}
                      className="w-full rounded-xl border-0 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="submit"
                  style={{ color: "#ffffff" }}
                  className="w-full rounded-xl bg-[#2E3192] hover:bg-[#232677] py-2.5 text-xs font-bold text-white shadow-md shadow-[#2E3192]/20 active:scale-98 transition cursor-pointer"
                >
                  {isEn ? "Publish Product to Marketplace" : "Đăng Sản Phẩm Lên Gian Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── INTERACTIVE MODAL NHẬN BÁO GIÁ VIP (React Portal) ── */}
      {mounted && quoteProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setQuoteProduct(null)}
        >
          <div
            className="my-auto w-full max-w-[420px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
                {isEn ? "Request VIP Quotation" : "Yêu Cầu Báo Giá VIP"}
              </h3>
              <button
                type="button"
                onClick={() => setQuoteProduct(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 [scrollbar-width:thin]">
                {/* Product Summary Preview */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
                  <img
                    src={quoteProduct.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{quoteProduct.name}</p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 truncate">{quoteProduct.company}</p>
                    <p className="text-[11px] font-bold text-rose-500">{quoteProduct.price || (isEn ? "Contact for price" : "Giá ưu đãi hội viên")}</p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Desired Quantity / Scope" : "Số lượng dự kiến / Quy mô nhu cầu"}
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteQty}
                    onChange={(e) => setQuoteQty(e.target.value)}
                    placeholder="Ví dụ: 1 gói, 50 bộ, triển khai 1 năm..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Contact Phone / Zalo" : "Số điện thoại / Zalo liên hệ của bạn *"}
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={quotePhone}
                      onChange={(e) => setQuotePhone(e.target.value)}
                      placeholder="0988 123 456"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Specific Requirements / Note" : "Yêu cầu chi tiết / Ghi chú"}
                  </label>
                  <textarea
                    rows={2}
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    placeholder={isEn ? "Specific business requirements..." : "Ghi chú thêm về yêu cầu kỹ thuật, thời gian giao hàng..."}
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  style={{ color: "#ffffff" }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2E3192] hover:bg-[#232677] py-2.5 text-xs font-bold text-white shadow-md shadow-[#2E3192]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{quoteSubmitting ? (isEn ? "Sending request..." : "Đang gửi...") : (isEn ? "Send Quote Request Now" : "Gửi Yêu Cầu Báo Giá")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL XEM DANH SÁCH NGƯỜI QUAN TÂM & YÊU CẦU BÁO GIÁ SẢN PHẨM ── */}
      {mounted && viewingQuotesProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setViewingQuotesProduct(null)}
        >
          <div
            className="my-auto w-full max-w-[500px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="min-w-0 flex-1 pr-2">
                <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  <span>Hội viên quan tâm / Báo giá</span>
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{viewingQuotesProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingQuotesProduct(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingProductQuotes ? (
                <p className="text-xs text-slate-400 text-center py-6">Đang tải danh sách người quan tâm...</p>
              ) : productQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Chưa có yêu cầu báo giá nào</p>
                  <p className="text-[11px] text-slate-400 mt-1">Khi có hội viên gửi yêu cầu báo giá hoặc bấm quan tâm, thông tin liên hệ sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                productQuotes.map((q: any) => (
                  <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#2E3192] text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {q.buyerName ? q.buyerName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{q.buyerName || "Hội viên CLB"}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{q.buyerCompany || "Hội viên CEO 1983"}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 shrink-0">
                        {fmt.rel(q.createdAt)}
                      </span>
                    </div>

                    {q.quantity && (
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <strong>Số lượng / Quy mô:</strong> {q.quantity}
                      </p>
                    )}

                    {(q.note || q.message) && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 italic">
                        "{q.note || q.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                      <div className="text-xs text-slate-500">
                        {q.phone && <span>SĐT: <strong className="text-emerald-600 dark:text-emerald-400">{q.phone}</strong></span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {q.phone && (
                          <a
                            href={`tel:${q.phone}`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-600 transition"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Gọi</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setViewingQuotesProduct(null);
                            navigate({ to: "/association/messages", search: { peerCode: q.buyerId || q.phone } });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#2E3192] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#232677] transition cursor-pointer"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Nhắn tin</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL CHỈNH SỬA SẢN PHẨM: DÀNH CHO NGƯỜI TẠO ĐĂNG ── */}
      {mounted && editingProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="my-auto w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[14.5px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="h-5 w-5 text-[#2E3192] dark:text-amber-400" />
                {isEn ? "Edit Product / Service" : "Chỉnh Sửa Sản Phẩm / Dịch Vụ"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 [scrollbar-width:thin]">
                {/* Image upload / preview */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Product Image" : "Hình ảnh đại diện sản phẩm"}
                  </label>
                  <input
                    type="file"
                    ref={editImageInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const tid = toast.loading("Đang tải ảnh sản phẩm lên MinIO...");
                      try {
                        const uploadedUrl = await uploadFileToNest(file, "products");
                        if (uploadedUrl) {
                          setEditPhoto(uploadedUrl);
                          toast.success("Đã tải ảnh sản phẩm lên MinIO thành công!", { id: tid });
                        }
                      } catch (err: any) {
                        toast.error(err?.message || "Tải ảnh sản phẩm thất bại!", { id: tid });
                      } finally {
                        if (e.target) e.target.value = "";
                      }
                    }}
                  />
                  {editPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={resolveMediaUrl(editPhoto) || editPhoto}
                        alt="Preview"
                        className="w-full h-36 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditPhoto("")}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow cursor-pointer transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => editImageInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-4 text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <ImagePlus className="h-6 w-6 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {isEn ? "Click to upload new image" : "Chọn ảnh từ thiết bị (JPG, PNG, WebP)"}
                      </span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Product Name *" : "Tên sản phẩm / giải pháp *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="VD: Dịch vụ tư vấn giải pháp AI..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Company" : "Tên doanh nghiệp"}
                    </label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="VD: Công ty TNHH ABC"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Category" : "Ngành hàng"}
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    >
                      <option value="Công nghệ & Phần mềm">Công nghệ & Phần mềm</option>
                      <option value="Bất động sản & Xây dựng">Bất động sản & Xây dựng</option>
                      <option value="Sản xuất & Công nghiệp">Sản xuất & Công nghiệp</option>
                      <option value="Tài chính & Đầu tư">Tài chính & Đầu tư</option>
                      <option value="Dịch vụ & Du lịch">Dịch vụ & Du lịch</option>
                      <option value="Hàng tiêu dùng & Bán lẻ">Hàng tiêu dùng & Bán lẻ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Original Price" : "Giá niêm yết (VNĐ)"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={editOriginalPrice}
                      onChange={(e) => setEditOriginalPrice(formatCurrencyInput(e.target.value))}
                      placeholder="VD: 50.000.000"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? "Member Price *" : "Giá ưu đãi hội viên *"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={editPrice}
                      onChange={(e) => setEditPrice(formatCurrencyInput(e.target.value))}
                      placeholder="VD: 35.000.000"
                      className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? "Description / Specs" : "Mô tả / Thông số / Ưu đãi"}
                  </label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Giới thiệu điểm nổi bật, chính sách bảo hành, hỗ trợ hội viên..."
                    className="w-full rounded-xl border-0 bg-slate-100 dark:bg-white/[0.06] p-3 text-xs text-slate-900 dark:text-white outline-none ring-0 focus:ring-0 resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isEn ? "Cancel" : "Hủy"}
                </button>
                <button
                  type="submit"
                  disabled={updatingProduct}
                  style={{ color: "#ffffff" }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2E3192] hover:bg-[#232677] py-2.5 text-xs font-bold text-white shadow-md shadow-[#2E3192]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
                >
                  <span>{updatingProduct ? (isEn ? "Saving..." : "Đang lưu...") : (isEn ? "Save Changes" : "Lưu Thay Đổi")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL GIAN HÀNG DOANH NGHIỆP: ĐÃ CHUYỂN SANG GIAO DIỆN TOÀN MÀN HÌNH B2B STOREFRONT ── */}

      {/* ── MODAL GIỎ HÀNG QUAN TÂM (WISHLIST CART MODAL) ── */}
      {mounted && wishlistCartOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
          onClick={() => setWishlistCartOpen(false)}
        >
          <div
            className="my-auto w-full max-w-[480px] max-h-[88dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#002087] to-[#003B95] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold shadow-xs">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Giỏ Hàng Quan Tâm</h3>
                  <p className="text-[11px] text-blue-100/80">
                    {interestedIds.length} sản phẩm đã đánh dấu quan tâm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWishlistCartOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white hover:bg-black/60 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:thin]">
              {interestedIds.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-1" />
                  <p className="text-xs font-semibold">Bạn chưa lưu sản phẩm nào vào danh sách quan tâm.</p>
                  <p className="text-[11px] text-slate-500">Bấm biểu tượng trái tim trên các sản phẩm để lưu lại tại đây.</p>
                </div>
              ) : (
                allProducts
                  .filter((p) => interestedIds.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-[#2E3192]/40 transition"
                    >
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                        <img
                          src={resolveMediaUrl(p.imageUrl) || p.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#2E3192] dark:text-amber-400 block truncate">
                          {p.company || "CLB CEO 1983"}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xs font-black text-rose-600 dark:text-amber-400">
                            {formatSmartProductPrice(p.memberPrice || p.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setWishlistCartOpen(false);
                            handleOpenQuoteModal(p);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-[#2E3192] text-white text-[10.5px] font-bold hover:bg-[#232677] transition cursor-pointer"
                        >
                          Báo giá VIP
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleInterest(p.id)}
                          className="text-[10px] text-rose-500 hover:underline text-center cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <Link
                to="/association/perks"
                onClick={() => setWishlistCartOpen(false)}
                className="text-xs font-bold text-[#2E3192] dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Xem ưu đãi VIP</span>
              </Link>
              <button
                type="button"
                onClick={() => setWishlistCartOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ProductExcelModal
        open={excelImportOpen}
        onClose={() => setExcelImportOpen(false)}
        onImportProducts={handleImportExcelProducts}
      />

      {/* Modal Đăng Ký Chạy Quảng Cáo & Affiliate B2B */}
      {adRegistrationModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => !adSubmitting && setAdRegistrationModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Đăng Ký Quảng Cáo & Affiliate B2B
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gửi yêu cầu tới Admin Quản trị hệ thống CRM Hiệp hội
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdRegistrationModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdRequest} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên doanh nghiệp / Công ty <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adCompany}
                    onChange={(e) => setAdCompany(e.target.value)}
                    placeholder="VD: Tập Đoàn Công Nghệ ViConnect"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Người đại diện liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adContactPerson}
                      onChange={(e) => setAdContactPerson(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số điện thoại nhận QR <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={adPhone}
                      onChange={(e) => setAdPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email tiếp nhận
                    </label>
                    <input
                      type="email"
                      value={adEmail}
                      onChange={(e) => setAdEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Thời lượng chiến dịch
                    </label>
                    <select
                      value={adDurationMonths}
                      onChange={(e) => setAdDurationMonths(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    >
                      <option value={1}>1 Tháng (Thử nghiệm)</option>
                      <option value={3}>3 Tháng (Khuyên dùng)</option>
                      <option value={6}>6 Tháng (Ưu đãi 15%)</option>
                      <option value={12}>12 Tháng (Đối tác VIP)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mục tiêu quảng cáo
                  </label>
                  <select
                    value={adGoal}
                    onChange={(e) => setAdGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  >
                    <option value="Quảng bá sản phẩm / dịch vụ nổi bật tới toàn thể hội viên">
                      Quảng bá sản phẩm / dịch vụ nổi bật
                    </option>
                    <option value="Chiến dịch liên kết Affiliate chia sẻ doanh thu B2B">
                      Chiến dịch Affiliate chia sẻ doanh thu B2B
                    </option>
                    <option value="Banner Top vị trí số 1 Chợ Giao Thương">
                      Banner Top vị trí số 1 Chợ Giao Thương
                    </option>
                    <option value="Ra mắt dòng sản phẩm hoặc dịch vụ thương hiệu mới">
                      Ra mắt sản phẩm / dịch vụ mới
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ngân sách dự kiến
                    </label>
                    <input
                      type="text"
                      value={adBudget}
                      onChange={(e) => setAdBudget(e.target.value)}
                      placeholder="VD: 10,000,000 đ"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Link sản phẩm / Website
                    </label>
                    <input
                      type="text"
                      value={adProductLink}
                      onChange={(e) => setAdProductLink(e.target.value)}
                      placeholder="https://company.vn/san-pham"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú / Yêu cầu cụ thể
                  </label>
                  <textarea
                    rows={2}
                    value={adNotes}
                    onChange={(e) => setAdNotes(e.target.value)}
                    placeholder="Mô tả thông điệp quảng cáo, khuyến mãi hoặc thời gian muốn kích hoạt..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 p-3 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Quy trình thanh toán & duyệt tự động:</span>
                  </div>
                  Sau khi bạn gửi thông tin, Admin quản trị hệ thống CRM sẽ nhận được yêu cầu, liên hệ chốt hợp đồng và gửi mã QR thanh toán VietQR. Sau khi thanh toán thành công, Admin sẽ thiết lập banner có hiệu ứng animation hiển thị ngay tại Chợ B2B!
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAdRegistrationModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={adSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {adSubmitting ? "Đang gửi..." : "Gửi yêu cầu đến Admin CRM"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── MODAL CHI TIẾT SẢN PHẨM & ĐÁNH GIÁ SHOPEE STYLE ── */}
      {selectedDetailProduct && (
        <ShopeeProductDetailModal
          isOpen={!!selectedDetailProduct}
          onClose={() => setSelectedDetailProduct(null)}
          product={selectedDetailProduct}
          onOpenQuote={(p) => {
            setSelectedDetailProduct(null);
            handleOpenQuoteModal(p);
          }}
          onMessageSeller={(p) => {
            setSelectedDetailProduct(null);
            handleMessageSeller(p);
          }}
          onViewStore={(compName) => {
            setSelectedDetailProduct(null);
            setViewingCompany({
              name: compName,
              avatarUrl: (selectedDetailProduct as any).imageUrl || null,
              industry: selectedDetailProduct.category,
            });
          }}
          isInterested={interestedIds.includes(selectedDetailProduct.id)}
          onToggleInterest={() => toggleInterest(selectedDetailProduct.id)}
        />
      )}
    </div>
  );
}
