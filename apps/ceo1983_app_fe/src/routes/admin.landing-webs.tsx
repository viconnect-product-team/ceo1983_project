import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Eye,
  Sliders,
  Link2,
  Trash2,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  FolderTree,
  Code,
  Image as ImageIcon,
  Palette,
  X,
  Play,
  RotateCcw,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useServerData } from "@/hooks/use-server-data";
import {
  listLandingWebsFn,
  createLandingWebFn,
  updateLandingWebFn,
  deleteLandingWebFn,
  applySubdomainFn,
  testApiConnectorFn,
} from "@/lib/landing-webs.functions";
import {
  TimedCardsOpeningLanding,
  type LandingWebConfig,
  type LandingMenuItem,
  type LandingSlide,
  type LandingSubScreen,
  type LandingApiConfig,
} from "@/components/landing/TimedCardsOpeningLanding";
import { StartupMobileShowcaseLanding } from "@/components/landing/StartupMobileShowcaseLanding";

const DEFAULT_TIMED_CARDS_TEMPLATE: LandingWebConfig = {
  id: "lw_timed_cards_opening_default",
  name: "Khám Phá Toàn Cầu — Timed Cards Opening",
  slug: "kham-pha-toan-cau",
  subdomain: "khampha",
  isPublished: true,
  template: "timed_cards_opening",
  theme: {
    primaryColor: "#ecad29",
    secondaryColor: "#1a1a1a",
    textColor: "#FFFFFF",
    backgroundColor: "#111317",
    fontFamily: "Inter, Oswald, sans-serif",
  },
  brand: {
    logoText: "Globe Express",
    logoIcon: "globe",
    contactPhone: "0983.1983.83",
    contactEmail: "contact@ceo1983.viconnect.vn",
  },
  navMenu: [
    { id: "m1", label: "Địa Điểm", active: true, type: "link", url: "#" },
    { id: "m2", label: "Thành Viên", type: "link", url: "#" },
    { id: "m3", label: "Sự Kiện", type: "link", url: "#" },
    { id: "m4", label: "Hệ Thống", type: "link", url: "#" },
  ],
  slides: [
    {
      id: "slide-1",
      place: "Switzerland Alps",
      title1: "SAINT",
      title2: "ANTONIEN",
      description: "Tận hưởng không gian thiên nhiên hùng vĩ của rặng núi Alps tại Thụy Sĩ. Nơi những doanh nhân tìm thấy sự tĩnh tại và cảm hứng sáng tạo vô tận.",
      image: "https://assets.codepen.io/3685267/timed-cards-1.jpg",
      ctaText: "Khám Phá Địa Điểm",
      ctaLink: "#",
    },
    {
      id: "slide-2",
      place: "Japan Danxia",
      title1: "NAGANO",
      title2: "PREFECTURE",
      description: "Vẻ đẹp thanh bình của xứ sở hoa anh đào qua góc nhìn của kiến trúc truyền thống và công nghệ hiện đại bậc nhất thế giới.",
      image: "https://assets.codepen.io/3685267/timed-cards-2.jpg",
      ctaText: "Tìm Hiểu Thêm",
      ctaLink: "#",
    },
    {
      id: "slide-3",
      place: "Sahara Desert",
      title1: "MARRAKECH",
      title2: "MERZOUGA",
      description: "Hành trình xuyên qua sa mạc Sahara huyền bí với những đụn cát vàng bất tận dưới bầu trời đêm ngập tràn ánh sao.",
      image: "https://assets.codepen.io/3685267/timed-cards-3.jpg",
      ctaText: "Xem Chi Tiết",
      ctaLink: "#",
    },
  ],
  subScreens: [],
  apiConfig: {
    enabled: false,
    endpointUrl: "",
    rootPath: "",
  },
};

const DEFAULT_STARTUP_MOBILE_TEMPLATE: LandingWebConfig = {
  id: "lw_startup_mobile_showcase_default",
  name: "Ứng Dụng Di Động CEO 1983 — Startup Mobile Showcase",
  slug: "app-ceo1983",
  subdomain: "app",
  isPublished: true,
  template: "startup_mobile_showcase",
  theme: {
    primaryColor: "#003B95",
    secondaryColor: "#ecad29",
    textColor: "#0F172A",
    backgroundColor: "#F8FAFC",
    fontFamily: "Inter, Oswald, sans-serif",
  },
  brand: {
    logoText: "CLB Doanh Nhân CEO 1983",
    logoIcon: "smartphone",
    contactPhone: "0983.1983.83",
    contactEmail: "contact@ceo1983.viconnect.vn",
  },
  navMenu: [
    { id: "m1", label: "Trang chủ", url: "#hero" },
    { id: "m2", label: "Tính năng App", url: "#features" },
    { id: "m3", label: "Giao thương B2B", url: "#b2b" },
    { id: "m4", label: "Hội viên tiêu biểu", url: "#members" },
    { id: "m5", label: "Tải ứng dụng", url: "#download" },
  ],
  slides: [
    {
      id: "slide-app-1",
      place: "Hệ Sinh Thái CEO 1983",
      title1: "KẾT NỐI",
      title2: "DOANH NHÂN",
      description: "Ứng dụng chuyên biệt kết nối giao thương nội khối, đặt lịch hẹn 1-on-1, thanh toán hội phí MoMo/VNPay tự động và bảng xếp hạng số minh bạch.",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Khám Phá Tính Năng",
      ctaLink: "#features",
    },
    {
      id: "slide-app-2",
      place: "Thương Mại & Đầu Tư",
      title1: "CƠ HỘI",
      title2: "GIAO THƯƠNG",
      description: "Hơn 500+ doanh nghiệp thành viên, cơ hội tiếp cận gói thầu giá trị cao và hỗ trợ pháp lý toàn diện từ Ban Điều Hành.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Xem Cơ Hội B2B",
      ctaLink: "#b2b",
    },
    {
      id: "slide-app-3",
      place: "Mạng Lưới Thẻ Doanh Nhân",
      title1: "DANH THIẾP",
      title2: "ĐIỆN TỬ QR",
      description: "Chia sẻ danh thiếp chỉ trong 1 giây qua NFC và QR Code, đồng bộ trực tiếp vào danh bạ và lưu vết kết nối trọn đời.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Trải Nghiệm Thẻ QR",
      ctaLink: "#card",
    },
  ],
  subScreens: [],
  apiConfig: {
    enabled: false,
    endpointUrl: "",
    rootPath: "",
  },
};

export const Route = createFileRoute("/admin/landing-webs")({
  ssr: false,
  component: AdminLandingWebsPage,
});

function AdminLandingWebsPage() {
  const listFn = useServerFn(listLandingWebsFn);
  const createFn = useServerFn(createLandingWebFn);
  const updateFn = useServerFn(updateLandingWebFn);
  const deleteFn = useServerFn(deleteLandingWebFn);
  const applySubFn = useServerFn(applySubdomainFn);
  const testApiFn = useServerFn(testApiConnectorFn);

  const { data: landingWebs = [], loading, reload } = useServerData<LandingWebConfig[]>(() => listFn(), []);

  // Đảm bảo luôn hiển thị đầy đủ cả 2 mẫu thiết kế chuẩn Pinterest trong danh sách
  const displayLandingWebs = useMemo(() => {
    const list = [...landingWebs];
    if (!list.some((w) => w.template === "timed_cards_opening")) {
      list.unshift(DEFAULT_TIMED_CARDS_TEMPLATE);
    }
    if (!list.some((w) => w.template === "startup_mobile_showcase")) {
      list.push(DEFAULT_STARTUP_MOBILE_TEMPLATE);
    }
    return list;
  }, [landingWebs]);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<LandingWebConfig | null>(null);
  const [editItem, setEditItem] = useState<LandingWebConfig | null>(null);
  const [subdomainModalItem, setSubdomainModalItem] = useState<LandingWebConfig | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<LandingWebConfig | null>(null);

  // Form states for Create Modal
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    subdomain: "",
    template: "timed_cards_opening" as "timed_cards_opening" | "ceo1983_executive" | "startup_mobile_showcase",
  });
  const [creating, setCreating] = useState(false);

  // Form states for Subdomain Modal
  const [subdomainInput, setSubdomainInput] = useState("");
  const [applyingSubdomain, setApplyingSubdomain] = useState(false);

  // Tabs for Dynamic Builder Modal
  const [activeBuilderTab, setActiveBuilderTab] = useState<"general" | "tree_menu" | "slides" | "api" | "sub_screens">("general");
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  // Selected sub-screen for editing in Dynamic Builder
  const [editingSubScreen, setEditingSubScreen] = useState<LandingSubScreen | null>(null);

  // Summary Metrics - tính toán trên danh sách đầy đủ
  const totalCount = displayLandingWebs.length;
  const publishedCount = displayLandingWebs.filter((w) => w.isPublished).length;
  const subdomainCount = displayLandingWebs.filter((w) => !!w.subdomain).length;
  const apiIntegratedCount = displayLandingWebs.filter((w) => w.apiConfig?.enabled).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Vui lòng nhập tên Landing Web");
      return;
    }
    setCreating(true);
    try {
      await createFn({ data: createForm });
      toast.success("Tạo mới Landing Web thành công!");
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        subdomain: "",
        template: "timed_cards_opening",
      });
      await reload();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tạo mới Landing Web");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveDynamicConfig = async () => {
    if (!editItem) return;
    try {
      await updateFn({ data: { id: editItem.id!, config: editItem } });
      toast.success("Lưu cấu hình Landing Web thành công!");
      await reload();
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật cấu hình");
    }
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;
    try {
      await deleteFn({ data: { id: deleteModalItem.id! } });
      toast.success("Đã xóa Landing Web thành công!");
      setDeleteModalItem(null);
      await reload();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa Landing Web");
    }
  };

  const handleApplySubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomainModalItem) return;
    const cleanSub = subdomainInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (!cleanSub) {
      toast.error("Vui lòng nhập subdomain hợp lệ (ví dụ: khampha, b2b, hanoi)");
      return;
    }
    setApplyingSubdomain(true);
    try {
      await applySubFn({ data: { id: subdomainModalItem.id!, subdomain: cleanSub } });
      toast.success(`Đã gán thành công subdomain: ${cleanSub}.ceo1983.viconnect.vn`);
      setSubdomainModalItem(null);
      await reload();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gán subdomain");
    } finally {
      setApplyingSubdomain(false);
    }
  };

  const handleTestApiConnector = async () => {
    if (!editItem?.apiConfig) return;
    setTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await testApiFn({ data: { apiConfig: editItem.apiConfig } });
      setApiTestResult(res);
      toast.success(`Kết nối API thành công! Tìm thấy ${res?.count ?? 0} bản ghi.`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể kết nối API. Vui lòng kiểm tra lại URL!");
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <AppShell>
      {/* Top Banner & Heading */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                [NODE-CRM-021] • Dynamic Landing Platform
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003B95] text-white">
                Giulio Cuscito Timed Cards
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Globe className="size-6 text-amber-400" />
              <span>Quản Lý Landing Web &amp; Tên Miền Phụ Subdomain</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tạo mới và quản lý các trang Landing Web siêu chuyển đổi, mô phỏng chuẩn xác 100% hiệu ứng chuyển thẻ Timed Cards Opening từ Pinterest, hỗ trợ tùy biến đa tầng cây menu phân cấp, tích hợp API dữ liệu động và gán Subdomain độc lập.
            </p>
          </div>

          <div className="z-10 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCreateForm({
                  name: `Landing Web Mới #${totalCount + 1}`,
                  slug: `landing-${Date.now().toString().slice(-4)}`,
                  subdomain: "",
                  template: "timed_cards_opening",
                });
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Tạo Mới Landing Web</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Landing Web</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center">
              <Globe className="size-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đang Xuất Bản</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{publishedCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center">
              <CheckCircle2 className="size-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Có Subdomain</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{subdomainCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center">
              <Link2 className="size-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">API Động Kích Hoạt</p>
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{apiIntegratedCount}</h3>
            </div>
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center">
              <Code className="size-5" />
            </div>
          </div>
        </div>

        {/* Landing Web Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="size-4 text-amber-500" />
              <span>Danh Sách Bản Mẫu &amp; Landing Web Đang Hoạt Động</span>
            </h2>
            <button
              type="button"
              onClick={() => reload()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="size-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang tải danh sách Landing Web...</p>
            </div>
          ) : displayLandingWebs.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <Globe className="size-12 text-slate-400 mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có Landing Web nào được tạo</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bấm nút "Tạo Mới Landing Web" để khởi tạo bản mẫu chuẩn Timed Cards Opening từ Pinterest Giulio Cuscito.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayLandingWebs.map((web) => {
                const firstImg = web.slides?.[0]?.image || "https://assets.codepen.io/3685267/timed-cards-1.jpg";
                const isTimedCards = web.template === "timed_cards_opening";
                const isStartupMobile = web.template === "startup_mobile_showcase";

                return (
                  <div
                    key={web.id}
                    className="group rounded-3xl overflow-hidden bg-white dark:bg-[#131a26] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail & Badge Header */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                        <img
                          src={firstImg}
                          alt={web.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700 filter brightness-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                            style={{
                              backgroundColor:
                                web.theme?.primaryColor || (isStartupMobile ? "#003B95" : "#ecad29"),
                            }}
                          >
                            {isStartupMobile
                              ? "Startup Mobile Showcase"
                              : isTimedCards
                              ? "Timed Cards Opening"
                              : "CEO 1983 Executive"}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                              web.isPublished
                                ? "bg-emerald-500/90 text-white"
                                : "bg-slate-700/90 text-slate-200"
                            }`}
                          >
                            {web.isPublished ? "Đang xuất bản" : "Bản nháp"}
                          </span>
                        </div>

                        {/* Bottom Overlay Info on Thumbnail */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <div className="flex items-center gap-1.5 font-bold truncate">
                            <Layers className="size-3.5 text-amber-400" />
                            <span>{web.slides?.length || 0} thẻ trình diễn</span>
                          </div>
                          {web.apiConfig?.enabled && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/80 text-[10px] font-bold">
                              API Connected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Info */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition">
                            {web.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Slug: <code className="font-mono text-amber-600 dark:text-amber-400 font-bold">{web.slug}</code></span>
                          </div>
                        </div>

                        {/* Subdomain Link Banner */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Link2 className="size-3 text-slate-400" />
                              <span>Subdomain:</span>
                            </span>
                            {web.subdomain ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const url = `https://${web.subdomain}.ceo1983.viconnect.vn`;
                                  navigator.clipboard.writeText(url);
                                  toast.success("Đã sao chép link subdomain!");
                                }}
                                className="font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>{web.subdomain}.ceo1983.viconnect.vn</span>
                                <Copy className="size-3" />
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">Chưa gán</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-4 gap-1.5 mt-2">
                      {/* Xem Trực Tiếp */}
                      <button
                        type="button"
                        onClick={() => setPreviewItem(web)}
                        className="col-span-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Xem bản xem trước trực quan"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">Xem</span>
                      </button>

                      {/* Tùy Biến Dynamic */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditItem(JSON.parse(JSON.stringify(web)));
                          setActiveBuilderTab("general");
                          setEditingSubScreen(null);
                        }}
                        className="col-span-1 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        title="Tùy biến cấu hình Dynamic & Cây Menu"
                      >
                        <Sliders className="size-3.5" />
                        <span className="hidden sm:inline">Sửa</span>
                      </button>

                      {/* Gán Subdomain */}
                      <button
                        type="button"
                        onClick={() => {
                          setSubdomainModalItem(web);
                          setSubdomainInput(web.subdomain || "");
                        }}
                        className="col-span-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Cấu hình & gán tên miền phụ"
                      >
                        <Link2 className="size-3.5" />
                        <span className="hidden sm:inline">Domain</span>
                      </button>

                      {/* Xóa */}
                      <button
                        type="button"
                        onClick={() => setDeleteModalItem(web)}
                        className="col-span-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Xóa Landing Web"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL TẠO MỚI LANDING WEB ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-80 grid place-items-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Tạo Mới Landing Web</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="size-7 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Landing Web *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ví dụ: Khám Phá Toàn Cầu 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-[#003B95]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn Slug (Dùng cho URL: /landing/:slug) *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="kham-pha-toan-cau"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:border-[#003B95]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên miền phụ Subdomain (Tùy chọn)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={createForm.subdomain}
                    onChange={(e) => setCreateForm({ ...createForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    placeholder="khampha"
                    className="flex-1 px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:border-[#003B95]"
                  />
                  <span className="px-3 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    .ceo1983.viconnect.vn
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Chọn Bản Mẫu Thiết Kế (Template) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Template 1: Pinterest 160088961741878822 */}
                  <div
                    onClick={() => setCreateForm({ ...createForm, template: "timed_cards_opening" })}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer ${
                      createForm.template === "timed_cards_opening"
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Thẻ Lật Mở (Timed Cards)</span>
                      <span className="size-2 rounded-full bg-amber-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Mẫu Pinterest 160088961741878822 (Alps, Japan, Sahara), tone vàng Amber #ecad29, auto scroll chuyển section.
                    </p>
                  </div>

                  {/* Template 2: Pinterest 234398355598861981 */}
                  <div
                    onClick={() => setCreateForm({ ...createForm, template: "startup_mobile_showcase" })}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer ${
                      createForm.template === "startup_mobile_showcase"
                        ? "border-[#003B95] bg-[#003B95]/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Startup Mobile Showcase</span>
                      <span className="size-2 rounded-full bg-[#003B95]" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Mẫu Pinterest 234398355598861981, Mockup iPhone 16, 4 chỉ số vàng, 3D feature cards, thương hiệu ceo1983.com.
                    </p>
                  </div>

                  {/* Template 3: CEO 1983 Executive */}
                  <div
                    onClick={() => setCreateForm({ ...createForm, template: "ceo1983_executive" })}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer ${
                      createForm.template === "ceo1983_executive"
                        ? "border-blue-700 bg-blue-700/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">CEO 1983 Executive</span>
                      <span className="size-2 rounded-full bg-blue-700" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Mẫu Doanh Nhân Điều Hành Cao Cấp, tone Xanh Navy #003B95, B2B Matching &amp; Sàn Thương Mại.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Đang tạo..." : "Xác Nhận Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM TRỰC TIẾP (LIVE PREVIEW) ================= */}
      {previewItem && (
        <div className="fixed inset-0 z-90 bg-white">
          {previewItem.template === "startup_mobile_showcase" ? (
            <div className="relative w-full h-full overflow-y-auto">
              <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setEditItem(JSON.parse(JSON.stringify(previewItem)));
                    setPreviewItem(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sliders className="size-3.5" />
                  <span>Sửa Cấu Hình</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="size-8 rounded-xl bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer transition"
                >
                  <X className="size-4" />
                </button>
              </div>
              <StartupMobileShowcaseLanding config={previewItem} />
            </div>
          ) : (
            <TimedCardsOpeningLanding
              config={previewItem}
              previewMode={true}
              onClosePreview={() => setPreviewItem(null)}
              onEditConfig={() => {
                setEditItem(JSON.parse(JSON.stringify(previewItem)));
                setPreviewItem(null);
              }}
            />
          )}
        </div>
      )}

      {/* ================= MODAL TÙY BIẾN DYNAMIC TOÀN DIỆN ================= */}
      {editItem && (
        <div className="fixed inset-0 z-85 grid place-items-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-[#003B95]/10 text-[#003B95] dark:text-blue-400 grid place-items-center">
                  <Sliders className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Tùy Biến Toàn Diện Dynamic:</span>
                    <span className="text-amber-600 dark:text-amber-400">{editItem.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tùy biến cây menu phân cấp, các thẻ slide, màu sắc thương hiệu và tích hợp API
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(editItem)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  <span>Xem Thử</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveDynamicConfig}
                  className="px-4 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="size-3.5" />
                  <span>Lưu Thay Đổi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="size-8 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Builder Navigation Tabs */}
            <div className="px-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 overflow-x-auto bg-slate-50/20 dark:bg-slate-950/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveBuilderTab("general")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeBuilderTab === "general"
                    ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Palette className="size-4" />
                <span>1. Tổng Quan &amp; Màu Sắc</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBuilderTab("tree_menu")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeBuilderTab === "tree_menu"
                    ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FolderTree className="size-4" />
                <span>2. Cây Menu Phân Cấp (Tree Header)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBuilderTab("slides")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeBuilderTab === "slides"
                    ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ImageIcon className="size-4" />
                <span>3. Thẻ Trình Diễn ({editItem.slides?.length || 0} Cards)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBuilderTab("api")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeBuilderTab === "api"
                    ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Code className="size-4" />
                <span>4. Tích Hợp API Động</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBuilderTab("sub_screens")}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeBuilderTab === "sub_screens"
                    ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="size-4" />
                <span>5. Màn Con Chi Tiết ({editItem.subScreens?.length || 0})</span>
              </button>
            </div>

            {/* Builder Tab Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: TỔNG QUAN */}
              {activeBuilderTab === "general" && (
                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Landing Web</label>
                      <input
                        type="text"
                        value={editItem.name || ""}
                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Slug URL</label>
                      <input
                        type="text"
                        value={editItem.slug || ""}
                        onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Logo Thương Hiệu Text</label>
                      <input
                        type="text"
                        value={editItem.brand?.logoText || ""}
                        onChange={(e) => setEditItem({ ...editItem, brand: { ...editItem.brand, logoText: e.target.value } })}
                        placeholder="Globe Express hoặc CEO 1983"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Màu Chủ Đạo (Accent Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editItem.theme?.primaryColor || "#ecad29"}
                          onChange={(e) => setEditItem({ ...editItem, theme: { ...editItem.theme!, primaryColor: e.target.value } })}
                          className="size-8 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <input
                          type="text"
                          value={editItem.theme?.primaryColor || "#ecad29"}
                          onChange={(e) => setEditItem({ ...editItem, theme: { ...editItem.theme!, primaryColor: e.target.value } })}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditItem({ ...editItem, theme: { ...editItem.theme!, primaryColor: "#ecad29" } })}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-500 text-[10px] font-bold"
                        >
                          Gold
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItem({ ...editItem, theme: { ...editItem.theme!, primaryColor: "#003B95" } })}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-600 text-[10px] font-bold"
                        >
                          Navy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="pub-toggle"
                      checked={editItem.isPublished}
                      onChange={(e) => setEditItem({ ...editItem, isPublished: e.target.checked })}
                      className="size-4 rounded text-[#003B95]"
                    />
                    <label htmlFor="pub-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Kích hoạt xuất bản công khai trang này
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: CÂY MENU PHÂN CẤP */}
              {activeBuilderTab === "tree_menu" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Cấu Trúc Menu Đa Tầng</h4>
                      <p className="text-xs text-slate-400">
                        Bấm vào menu trên Header sẽ mở danh mục con dạng cây (Tree). Người dùng bấm vào từng mục con có thể mở Màn Con (Modal) hoặc link ngoài.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `m-${Date.now().toString().slice(-4)}`;
                        const newMenu: LandingMenuItem = {
                          id: newId,
                          label: "Menu Mới",
                          type: "tree_dropdown",
                          children: [
                            { id: `${newId}-1`, label: "Mục con 1", type: "link", url: "#" },
                          ],
                        };
                        setEditItem({ ...editItem, navMenu: [...(editItem.navMenu || []), newMenu] });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Thêm Menu Cha</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(editItem.navMenu || []).map((item, pIdx) => (
                      <div key={item.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="size-6 rounded-lg bg-amber-500/20 text-amber-500 text-xs font-black grid place-items-center">
                              {pIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const copy = [...editItem.navMenu];
                                copy[pIdx].label = e.target.value;
                                setEditItem({ ...editItem, navMenu: copy });
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white flex-1"
                              placeholder="Tiêu đề menu cha"
                            />
                            <select
                              value={item.type || "link"}
                              onChange={(e) => {
                                const copy = [...editItem.navMenu];
                                copy[pIdx].type = e.target.value as any;
                                setEditItem({ ...editItem, navMenu: copy });
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                            >
                              <option value="tree_dropdown">Dạng Cây (Tree Dropdown)</option>
                              <option value="link">Liên kết ngoài (Link)</option>
                              <option value="modal_screen">Mở Màn Con (Modal)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const childId = `${item.id}-${Date.now().toString().slice(-3)}`;
                                const copy = [...editItem.navMenu];
                                if (!copy[pIdx].children) copy[pIdx].children = [];
                                copy[pIdx].children!.push({
                                  id: childId,
                                  label: "Nhánh Con Mới",
                                  type: "modal_screen",
                                  subScreenId: editItem.subScreens?.[0]?.id,
                                });
                                setEditItem({ ...editItem, navMenu: copy });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="size-3" />
                              <span>Thêm Nhánh Con</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = editItem.navMenu.filter((_, idx) => idx !== pIdx);
                                setEditItem({ ...editItem, navMenu: copy });
                              }}
                              className="size-7 grid place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Danh sách nhánh con (Children Nodes) */}
                        {item.children && item.children.length > 0 && (
                          <div className="ml-8 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
                            {item.children.map((child, cIdx) => (
                              <div key={child.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="size-1.5 rounded-full bg-amber-400" />
                                  <input
                                    type="text"
                                    value={child.label}
                                    onChange={(e) => {
                                      const copy = [...editItem.navMenu];
                                      copy[pIdx].children![cIdx].label = e.target.value;
                                      setEditItem({ ...editItem, navMenu: copy });
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-800 dark:text-white flex-1"
                                    placeholder="Tên nhánh con"
                                  />
                                  <input
                                    type="text"
                                    value={child.badge || ""}
                                    onChange={(e) => {
                                      const copy = [...editItem.navMenu];
                                      copy[pIdx].children![cIdx].badge = e.target.value;
                                      setEditItem({ ...editItem, navMenu: copy });
                                    }}
                                    placeholder="Badge (ví dụ: Hot)"
                                    className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-[11px] text-amber-500 font-bold"
                                  />
                                  <select
                                    value={child.subScreenId || ""}
                                    onChange={(e) => {
                                      const copy = [...editItem.navMenu];
                                      copy[pIdx].children![cIdx].subScreenId = e.target.value;
                                      copy[pIdx].children![cIdx].type = "modal_screen";
                                      setEditItem({ ...editItem, navMenu: copy });
                                    }}
                                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-600 dark:text-slate-300"
                                  >
                                    <option value="">-- Mở Màn Con (Modal) --</option>
                                    {(editItem.subScreens || []).map((scr) => (
                                      <option key={scr.id} value={scr.id}>
                                        Màn con: {scr.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...editItem.navMenu];
                                    copy[pIdx].children = copy[pIdx].children!.filter((_, idx) => idx !== cIdx);
                                    setEditItem({ ...editItem, navMenu: copy });
                                  }}
                                  className="size-6 grid place-items-center text-rose-400 hover:text-rose-600 cursor-pointer"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: THẺ TRÌNH DIỄN (SLIDES) */}
              {activeBuilderTab === "slides" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Danh Sách Thẻ Trình Diễn</h4>
                      <p className="text-xs text-slate-400">
                        Mỗi thẻ sẽ bung ra làm hình nền toàn màn hình kèm hiệu ứng chữ kép (Title 1, Title 2) khi timer chạy hoặc người dùng bấm chọn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newSlide: LandingSlide = {
                          id: `slide-${Date.now().toString().slice(-4)}`,
                          place: "VIỆT NAM",
                          title1: "TIÊU ĐỀ",
                          title2: "NỔI BẬT",
                          description: "Mô tả nội dung thẻ trình diễn mới.",
                          image: "https://assets.codepen.io/3685267/timed-cards-1.jpg",
                          ctaText: "Khám Phá Ngay",
                        };
                        setEditItem({ ...editItem, slides: [...(editItem.slides || []), newSlide] });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Thêm Thẻ Mới</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(editItem.slides || []).map((slide, sIdx) => (
                      <div key={slide.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="size-7 rounded-xl bg-amber-500/20 text-amber-500 text-xs font-black grid place-items-center shrink-0">
                            #{sIdx + 1}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Địa điểm (Place)</label>
                              <input
                                type="text"
                                value={slide.place}
                                onChange={(e) => {
                                  const copy = [...editItem.slides];
                                  copy[sIdx].place = e.target.value;
                                  setEditItem({ ...editItem, slides: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Dòng chữ 1 (Title 1)</label>
                              <input
                                type="text"
                                value={slide.title1}
                                onChange={(e) => {
                                  const copy = [...editItem.slides];
                                  copy[sIdx].title1 = e.target.value;
                                  setEditItem({ ...editItem, slides: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black uppercase"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Dòng chữ 2 (Title 2)</label>
                              <input
                                type="text"
                                value={slide.title2}
                                onChange={(e) => {
                                  const copy = [...editItem.slides];
                                  copy[sIdx].title2 = e.target.value;
                                  setEditItem({ ...editItem, slides: copy });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black uppercase"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = editItem.slides.filter((_, idx) => idx !== sIdx);
                              setEditItem({ ...editItem, slides: copy });
                            }}
                            className="size-7 grid place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Ảnh Nền (URL)</label>
                            <input
                              type="text"
                              value={slide.image}
                              onChange={(e) => {
                                const copy = [...editItem.slides];
                                copy[sIdx].image = e.target.value;
                                setEditItem({ ...editItem, slides: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nút Thao Tác (CTA Text)</label>
                            <input
                              type="text"
                              value={slide.ctaText}
                              onChange={(e) => {
                                const copy = [...editItem.slides];
                                copy[sIdx].ctaText = e.target.value;
                                setEditItem({ ...editItem, slides: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Đoạn Mô Tả (Description)</label>
                          <textarea
                            rows={2}
                            value={slide.description}
                            onChange={(e) => {
                              const copy = [...editItem.slides];
                              copy[sIdx].description = e.target.value;
                              setEditItem({ ...editItem, slides: copy });
                            }}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TÍCH HỢP API ĐỘNG */}
              {activeBuilderTab === "api" && (
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-purple-900 dark:text-purple-300">Tự Động Nạp Dữ Liệu Từ API</h4>
                      <p className="text-[11px] text-purple-700 dark:text-purple-400">
                        Khi bật, các slide sẽ tự động được sinh ra từ dữ liệu API thực tế (Cơ hội, Sản phẩm, Sự kiện, v.v.).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editItem.apiConfig?.enabled ?? false}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          apiConfig: {
                            ...(editItem.apiConfig || {
                              endpointUrl: "/api/opportunities",
                              fieldMapping: {},
                            }),
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="size-5 rounded text-purple-600 cursor-pointer"
                    />
                  </div>

                  {editItem.apiConfig?.enabled && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          API Endpoint URL *
                        </label>
                        <input
                          type="text"
                          value={editItem.apiConfig?.endpointUrl || ""}
                          onChange={(e) =>
                            setEditItem({
                              ...editItem,
                              apiConfig: { ...editItem.apiConfig!, endpointUrl: e.target.value },
                            })
                          }
                          placeholder="/api/opportunities hoặc https://api.domain.com/feed"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                        />
                        <p className="text-[10.5px] text-slate-400 mt-1">
                          Hỗ trợ cả endpoint nội bộ hệ thống (ví dụ: <code className="text-amber-500 font-bold">/api/opportunities</code>, <code className="text-amber-500 font-bold">/api/events</code>, <code className="text-amber-500 font-bold">/api/products</code>) hoặc API REST bên ngoài.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phương thức</label>
                          <select
                            value={editItem.apiConfig?.method || "GET"}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                apiConfig: { ...editItem.apiConfig!, method: e.target.value as any },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mảng Dữ Liệu (Root Path)</label>
                          <input
                            type="text"
                            value={editItem.apiConfig?.rootPath || ""}
                            onChange={(e) =>
                              setEditItem({
                                ...editItem,
                                apiConfig: { ...editItem.apiConfig!, rootPath: e.target.value },
                              })
                            }
                            placeholder="Để trống nếu là mảng gốc hoặc nhập 'data'"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Ánh xạ trường Field Mapping */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                        <h5 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                          Ánh Xạ Trường Dữ Liệu (Field Mapping)
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Trường Địa Điểm / Tổ Chức</label>
                            <input
                              type="text"
                              value={editItem.apiConfig?.fieldMapping?.place || ""}
                              onChange={(e) =>
                                setEditItem({
                                  ...editItem,
                                  apiConfig: {
                                    ...editItem.apiConfig!,
                                    fieldMapping: { ...editItem.apiConfig!.fieldMapping, place: e.target.value },
                                  },
                                })
                              }
                              placeholder="company, location..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Trường Tiêu Đề</label>
                            <input
                              type="text"
                              value={editItem.apiConfig?.fieldMapping?.title1 || ""}
                              onChange={(e) =>
                                setEditItem({
                                  ...editItem,
                                  apiConfig: {
                                    ...editItem.apiConfig!,
                                    fieldMapping: { ...editItem.apiConfig!.fieldMapping, title1: e.target.value },
                                  },
                                })
                              }
                              placeholder="title, name..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Trường Mô Tả</label>
                            <input
                              type="text"
                              value={editItem.apiConfig?.fieldMapping?.description || ""}
                              onChange={(e) =>
                                setEditItem({
                                  ...editItem,
                                  apiConfig: {
                                    ...editItem.apiConfig!,
                                    fieldMapping: { ...editItem.apiConfig!.fieldMapping, description: e.target.value },
                                  },
                                })
                              }
                              placeholder="description, summary..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Trường Link Ảnh</label>
                            <input
                              type="text"
                              value={editItem.apiConfig?.fieldMapping?.image || ""}
                              onChange={(e) =>
                                setEditItem({
                                  ...editItem,
                                  apiConfig: {
                                    ...editItem.apiConfig!,
                                    fieldMapping: { ...editItem.apiConfig!.fieldMapping, image: e.target.value },
                                  },
                                })
                              }
                              placeholder="image, image_url, cover_image..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleTestApiConnector}
                          disabled={testingApi}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <Play className="size-3.5" />
                          <span>{testingApi ? "Đang gọi thử..." : "Kiểm Tra Kết Nối API Trực Tiếp"}</span>
                        </button>
                      </div>

                      {apiTestResult && (
                        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-2">
                          <div className="flex items-center gap-2 text-emerald-600 font-bold">
                            <CheckCircle2 className="size-4" />
                            <span>Kết nối thành công! Đã chuyển đổi {apiTestResult.count} slides.</span>
                          </div>
                          <pre className="p-2 rounded-lg bg-black/40 text-[10.5px] font-mono overflow-x-auto text-amber-300">
                            {JSON.stringify(apiTestResult.sampleSlides?.[0] || {}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: MÀN CON CHI TIẾT */}
              {activeBuilderTab === "sub_screens" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Danh Sách Màn Con (Sub-screens)</h4>
                      <p className="text-xs text-slate-400">
                        Các cửa sổ nội dung hiển thị khi người dùng click vào các mục trên cây menu hoặc nút Khám phá.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newScr: LandingSubScreen = {
                          id: `scr-${Date.now().toString().slice(-4)}`,
                          title: "Màn Con Chi Tiết Mới",
                          subtitle: "Phụ đề mô tả ngắn",
                          layout: "article",
                          contentHtml: "<p>Nội dung chi tiết của trang con...</p>",
                        };
                        setEditItem({ ...editItem, subScreens: [...(editItem.subScreens || []), newScr] });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Thêm Màn Con</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(editItem.subScreens || []).map((scr, idx) => (
                      <div key={scr.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                            {scr.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = editItem.subScreens!.filter((_, i) => i !== idx);
                              setEditItem({ ...editItem, subScreens: copy });
                            }}
                            className="size-6 grid place-items-center text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={scr.title}
                            onChange={(e) => {
                              const copy = [...editItem.subScreens!];
                              copy[idx].title = e.target.value;
                              setEditItem({ ...editItem, subScreens: copy });
                            }}
                            placeholder="Tiêu đề màn con"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            value={scr.subtitle || ""}
                            onChange={(e) => {
                              const copy = [...editItem.subScreens!];
                              copy[idx].subtitle = e.target.value;
                              setEditItem({ ...editItem, subScreens: copy });
                            }}
                            placeholder="Phụ đề ngắn"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={3}
                            value={scr.contentHtml || ""}
                            onChange={(e) => {
                              const copy = [...editItem.subScreens!];
                              copy[idx].contentHtml = e.target.value;
                              setEditItem({ ...editItem, subScreens: copy });
                            }}
                            placeholder="Nội dung HTML hoặc văn bản..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
              <span className="text-slate-400">ID: {editItem.id}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveDynamicConfig}
                  className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold transition cursor-pointer shadow-md"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL GÁN SUBDOMAIN ================= */}
      {subdomainModalItem && (
        <div className="fixed inset-0 z-80 grid place-items-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                  <Link2 className="size-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Gán Subdomain Độc Lập</h3>
              </div>
              <button
                type="button"
                onClick={() => setSubdomainModalItem(null)}
                className="size-7 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubdomain} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gán tên miền phụ độc lập cho <strong className="text-slate-800 dark:text-white">{subdomainModalItem.name}</strong>. Khi người dùng truy cập link này sẽ tự động nạp toàn bộ cấu hình giao diện.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nhập Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={subdomainInput}
                    onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="khampha"
                    className="flex-1 px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:border-[#003B95]"
                  />
                  <span className="px-3 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    .ceo1983.viconnect.vn
                  </span>
                </div>
              </div>

              {subdomainInput && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                  <span>URL hoàn chỉnh: </span>
                  <strong className="font-mono">https://{subdomainInput}.ceo1983.viconnect.vn</strong>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubdomainModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={applyingSubdomain}
                  className="px-5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {applyingSubdomain ? "Đang gán..." : "Áp Dụng & Xuất Bản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA ================= */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-80 grid place-items-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="size-12 rounded-full bg-rose-500/10 text-rose-500 grid place-items-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Xác Nhận Xóa Landing Web?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa Landing Web <strong className="text-slate-800 dark:text-white">"{deleteModalItem.name}"</strong>? Thao tác này sẽ xóa vĩnh viễn cấu hình và gỡ subdomain.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

