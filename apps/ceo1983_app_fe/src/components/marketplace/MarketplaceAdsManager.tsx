import { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  QrCode,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Sparkles,
  Calendar,
  Building2,
  Phone,
  Mail,
  X,
  Copy,
  DollarSign,
  Palette,
  Eye,
  Trash2,
  Play,
  Pause,
  Upload,
  Video,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFileToNest } from "@/lib/api-client";

export function isVideoMedia(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith("data:video/") ||
    clean.includes("video/") ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(clean)
  );
}

export interface AdRequestItem {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  goal: string;
  durationMonths: number;
  budgetEst: string;
  productLink?: string;
  notes?: string;
  status: "pending" | "payment_sent" | "paid" | "active" | "rejected";
  paymentAmount?: number;
  paymentCode?: string;
  createdAt: string;
}

export interface ActiveAdCampaign {
  id: string;
  requestId?: string;
  title: string;
  companyName: string;
  badgeText: string;
  bannerUrl: string;
  targetUrl: string;
  animation: "gradient-wave" | "pulse-glow" | "floating-shine";
  startDate: string;
  endDate: string;
  status: "active" | "paused";
  impressions: number;
  clicks: number;
  createdAt: string;
}

const DEFAULT_AD_REQUESTS: AdRequestItem[] = [
  {
    id: "req_ad_001",
    companyName: "Công ty Cổ phần Công nghệ ABC",
    contactPerson: "Nguyễn Văn Hùng",
    phone: "0983 678 888",
    email: "hung.nv@abctech.vn",
    goal: "Chạy Banner đối tác chiến lược giải pháp ERP & Phần mềm chuyển đổi số",
    durationMonths: 3,
    budgetEst: "15.000.000 đ",
    productLink: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    notes: "Muốn đặt banner ở vị trí đầu sàn Marketplace App Hiệp hội.",
    status: "paid",
    paymentAmount: 15000000,
    paymentCode: "QC-CEO1983-ABC",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "req_ad_002",
    companyName: "Tập đoàn Đầu tư & Xây dựng An Phát",
    contactPerson: "Trần Thị Mai",
    phone: "0904 123 983",
    email: "mai.tt@anphatgroup.com",
    goal: "Quảng cáo gói thầu thiết kế thi công nội thất văn phòng chuẩn doanh nhân",
    durationMonths: 6,
    budgetEst: "30.000.000 đ",
    productLink: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    notes: "Cần hiệu ứng hào quang vàng sâm banh và xuất hiện cả trên mobile app.",
    status: "payment_sent",
    paymentAmount: 30000000,
    paymentCode: "QC-CEO1983-ANPHAT",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const DEFAULT_ACTIVE_ADS: ActiveAdCampaign[] = [
  {
    id: "ad_active_001",
    requestId: "req_ad_001",
    title: "Giải pháp ERP Toàn diện & Số hóa Doanh nghiệp CEO 1983",
    companyName: "Công ty Cổ phần Công nghệ ABC",
    badgeText: "ĐỐI TÁC CHIẾN LƯỢC",
    bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    targetUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    animation: "gradient-wave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 90).toISOString().split("T")[0],
    status: "active",
    impressions: 4850,
    clicks: 342,
    createdAt: new Date().toISOString(),
  },
];

export function MarketplaceAdsManager() {
  const [requests, setRequests] = useState<AdRequestItem[]>([]);
  const [activeAds, setActiveAds] = useState<ActiveAdCampaign[]>([]);

  // Modals state
  const [selectedReq, setSelectedReq] = useState<AdRequestItem | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Setup Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formBadge, setFormBadge] = useState("ĐỐI TÁC CHIẾN LƯỢC");
  const [formBanner, setFormBanner] = useState("");
  const [formTargetUrl, setFormTargetUrl] = useState("");
  const [formAnimation, setFormAnimation] = useState<"gradient-wave" | "pulse-glow" | "floating-shine">("gradient-wave");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadFileToNest(file, file.name);
      if (uploadedUrl) {
        setFormBanner(uploadedUrl);
        toast.success(`Đã tải lên ${isVideo ? "video" : "ảnh"} quảng cáo thành công!`);
        setIsUploading(false);
        if (e.target) e.target.value = "";
        return;
      }
    } catch (err: any) {
      console.warn("Upload to backend failed, using local preview/data URL:", err);
    }

    // Fallback nếu server upload báo lỗi hoặc offline
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setFormBanner(result);
        toast.success(`Đã thêm ${isVideo ? "video" : "ảnh"} quảng cáo từ thiết bị!`);
      }
      setIsUploading(false);
      if (e.target) e.target.value = "";
    };
    reader.onerror = () => {
      toast.error("Không thể đọc tệp từ thiết bị");
      setIsUploading(false);
      if (e.target) e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const loadData = () => {
    try {
      const storedReq = localStorage.getItem("ceo1983_ad_requests");
      if (storedReq) {
        setRequests(JSON.parse(storedReq));
      } else {
        localStorage.setItem("ceo1983_ad_requests", JSON.stringify(DEFAULT_AD_REQUESTS));
        setRequests(DEFAULT_AD_REQUESTS);
      }

      const storedAds = localStorage.getItem("ceo1983_marketplace_ads");
      if (storedAds) {
        setActiveAds(JSON.parse(storedAds));
      } else {
        localStorage.setItem("ceo1983_marketplace_ads", JSON.stringify(DEFAULT_ACTIVE_ADS));
        setActiveAds(DEFAULT_ACTIVE_ADS);
      }
    } catch {
      setRequests(DEFAULT_AD_REQUESTS);
      setActiveAds(DEFAULT_ACTIVE_ADS);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("ceo1983:ads-updated", handleUpdate);
    window.addEventListener("ceo1983:ad-requests-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ceo1983:ads-updated", handleUpdate);
      window.removeEventListener("ceo1983:ad-requests-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleOpenPaymentQR = (req: AdRequestItem) => {
    setSelectedReq(req);
    setQrModalOpen(true);
  };

  const handleConfirmPaid = () => {
    if (!selectedReq) return;
    const updated = requests.map((r) =>
      r.id === selectedReq.id ? { ...r, status: "paid" as const } : r
    );
    setRequests(updated);
    localStorage.setItem("ceo1983_ad_requests", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ceo1983:ad-requests-updated"));
    toast.success(`✓ Đã xác nhận thanh toán thành công cho ${selectedReq.companyName}!`);
    setQrModalOpen(false);

    // Auto open setup modal
    handleOpenSetup({ ...selectedReq, status: "paid" });
  };

  const handleOpenSetup = (req: AdRequestItem) => {
    setSelectedReq(req);
    setFormTitle(req.goal);
    setFormCompany(req.companyName);
    setFormBanner(
      req.productLink ||
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
    );
    setFormTargetUrl(req.productLink || "https://ceo1983.com/marketplace");
    setSetupModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCompany.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và tên công ty!");
      return;
    }

    const newAd: ActiveAdCampaign = {
      id: `ad_${Date.now()}`,
      requestId: selectedReq?.id,
      title: formTitle.trim(),
      companyName: formCompany.trim(),
      badgeText: formBadge.trim(),
      bannerUrl:
        formBanner.trim() ||
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      targetUrl: formTargetUrl.trim() || "https://ceo1983.com",
      animation: formAnimation,
      startDate: formStartDate,
      endDate: formEndDate,
      status: "active",
      impressions: 1,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    const nextAds = [newAd, ...activeAds];
    setActiveAds(nextAds);
    localStorage.setItem("ceo1983_marketplace_ads", JSON.stringify(nextAds));

    // Update request status to active
    if (selectedReq) {
      const updatedReqs = requests.map((r) =>
        r.id === selectedReq.id ? { ...r, status: "active" as const } : r
      );
      setRequests(updatedReqs);
      localStorage.setItem("ceo1983_ad_requests", JSON.stringify(updatedReqs));
    }

    window.dispatchEvent(new CustomEvent("ceo1983:ads-updated"));
    toast.success("✓ Đã set up và đẩy quảng cáo trực tiếp xuống Marketplace App Hiệp hội!");
    setSetupModalOpen(false);
  };

  const handleToggleAdStatus = (adId: string) => {
    const updated = activeAds.map((a) =>
      a.id === adId
        ? { ...a, status: (a.status === "active" ? "paused" : "active") as "active" | "paused" }
        : a
    );
    setActiveAds(updated);
    localStorage.setItem("ceo1983_marketplace_ads", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ceo1983:ads-updated"));
    toast.success("Đã thay đổi trạng thái chiến dịch quảng cáo!");
  };

  const handleDeleteAd = (adId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ chiến dịch quảng cáo này?")) return;
    const updated = activeAds.filter((a) => a.id !== adId);
    setActiveAds(updated);
    localStorage.setItem("ceo1983_marketplace_ads", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ceo1983:ads-updated"));
    toast.success("Đã gỡ quảng cáo khỏi hệ thống!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── BẢNG CHIẾN DỊCH QUẢNG CÁO ĐANG CHẠY TRÊN APP ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Quảng Cáo & Banner Đang Hoạt Động Trên App Hiệp Hội ({activeAds.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Tự động hiển thị nổi bật tại đầu sàn giao thương Marketplace trên ứng dụng di động
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedReq(null);
              setFormTitle("Ưu đãi đặc quyền Doanh nghiệp CEO 1983");
              setFormCompany("Công ty Hội viên");
              setFormBanner("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80");
              setSetupModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md cursor-pointer transition hover:bg-blue-700 bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Quảng Cáo Mới</span>
          </button>
        </div>

        {activeAds.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            Chưa có chiến dịch quảng cáo nào đang chạy. Vui lòng duyệt yêu cầu hoặc bấm "Thêm Quảng Cáo Mới".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAds.map((ad) => (
              <div
                key={ad.id}
                className="overflow-hidden rounded-2xl border border-border bg-secondary/20 shadow-xs hover:border-primary/40 transition space-y-3"
              >
                <div className="relative h-32 w-full overflow-hidden bg-slate-900 group">
                  {isVideoMedia(ad.bannerUrl) ? (
                    <video
                      src={ad.bannerUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={ad.bannerUrl}
                      alt={ad.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                      {ad.badgeText}
                    </span>
                    {isVideoMedia(ad.bannerUrl) && (
                      <span className="flex items-center gap-1 rounded bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                        <Video className="h-3 w-3" />
                        <span>VIDEO</span>
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      ad.status === "active"
                        ? "bg-emerald-500/80 text-white"
                        : "bg-amber-500/80 text-white"
                    }`}
                  >
                    {ad.status === "active" ? "Đang chạy" : "Tạm dừng"}
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 text-white pointer-events-none">
                    <h4 className="font-bold text-sm leading-snug line-clamp-1">{ad.title}</h4>
                    <p className="text-[11px] text-slate-200 line-clamp-1">{ad.companyName}</p>
                  </div>
                </div>

                <div className="px-4 pb-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {ad.startDate} &rarr; {ad.endDate}
                    </span>
                    <span className="font-medium text-primary capitalize">
                      Hiệu ứng: {ad.animation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div className="text-[11px] text-muted-foreground">
                      Lượt xem: <strong>{ad.impressions.toLocaleString()}</strong> | Lượt bấm:{" "}
                      <strong>{ad.clicks.toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleAdStatus(ad.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer"
                        title={ad.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                      >
                        {ad.status === "active" ? (
                          <Pause className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Play className="h-4 w-4 text-emerald-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAd(ad.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Xóa quảng cáo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BẢNG YÊU CẦU ĐĂNG KÝ QUẢNG CÁO TỪ DOANH NGHIỆP APP HIỆP HỘI ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Yêu Cầu Đăng Ký Chạy Quảng Cáo & Affiliate Từ Doanh Nghiệp
              </h3>
              <p className="text-xs text-muted-foreground">
                Tiếp nhận yêu cầu từ hội viên đăng nhập ở Marketplace, gửi mã QR thanh toán và kích hoạt quảng cáo
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3">Doanh Nghiệp / Người Liên Hệ</th>
                <th className="py-2.5 px-3">Mục Tiêu & Nội Dung</th>
                <th className="py-2.5 px-3">Thời Gian & Dự Toán</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/20 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-foreground text-xs">{r.companyName}</div>
                    <div className="text-muted-foreground text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{r.contactPerson}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-2.5 w-2.5" /> {r.phone}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-[260px]">
                    <div className="text-foreground line-clamp-2">{r.goal}</div>
                    {r.notes && (
                      <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-1">
                        "{r.notes}"
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-emerald-600">{r.budgetEst}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Gói {r.durationMonths} tháng
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {r.status === "paid" || r.status === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Đã thanh toán
                      </span>
                    ) : r.status === "payment_sent" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/30">
                        <Clock className="h-3 w-3" /> Đã gửi mã VietQR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                        Chờ phản hồi
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentQR(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                        title="Gửi mã VietQR thanh toán"
                      >
                        <QrCode className="h-3.5 w-3.5 text-blue-600" />
                        <span>Mã QR Thu Phí</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenSetup(r)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer bg-blue-600 hover:bg-blue-700 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Set Up Quảng Cáo</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: MÃ QR THANH TOÁN VIETQR ── */}
      {qrModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-foreground">
                  Mã QR Thanh Toán Chạy Quảng Cáo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Gửi mã VietQR này tới <strong>{selectedReq.companyName}</strong> ({selectedReq.contactPerson} - {selectedReq.phone})
              </p>

              {/* VietQR Dynamic Code Preview */}
              <div className="mx-auto w-52 overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-white p-3 shadow-md">
                <img
                  src={`https://api.vietqr.io/image/970422-0983001983-compact2.jpg?amount=${
                    selectedReq.paymentAmount || 15000000
                  }&addInfo=${encodeURIComponent(
                    selectedReq.paymentCode || `QC-CEO1983-${selectedReq.id}`
                  )}&accountName=HIEP%20HOI%20DOANH%20NHAN%20CEO%201983`}
                  alt="VietQR"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="rounded-xl bg-secondary/50 p-3 text-xs space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngân hàng:</span>
                  <span className="font-bold">MBBank (Quân Đội)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tài khoản:</span>
                  <span className="font-mono font-bold">0983001983</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chủ tài khoản:</span>
                  <span className="font-bold">HIỆP HỘI DOANH NHÂN CEO 1983</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền:</span>
                  <span className="font-bold text-emerald-600">
                    {(selectedReq.paymentAmount || 15000000).toLocaleString()} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nội dung CK:</span>
                  <span className="font-mono font-bold text-primary">
                    {selectedReq.paymentCode || `QC-CEO1983-${selectedReq.id}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Kính gửi ${selectedReq.companyName}, Ban Quản Trị Hiệp hội CEO 1983 xin gửi thông tin thanh toán dịch vụ chạy quảng cáo Marketplace:\nSTK: 0983001983 - MBBank\nChủ TK: HIEP HOI DOANH NHAN CEO 1983\nSố tiền: ${(
                      selectedReq.paymentAmount || 15000000
                    ).toLocaleString()} VNĐ\nNội dung: ${selectedReq.paymentCode || `QC-CEO1983-${selectedReq.id}`}`
                  );
                  toast.success("Đã sao chép thông tin thanh toán VietQR!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Sao chép tin nhắn</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPaid}
                className="rounded-xl px-4 py-2 text-xs font-bold shadow-md cursor-pointer transition hover:bg-blue-700 bg-blue-600 text-white"
              >
                Xác Nhận Đã Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SET UP CHIẾN DỊCH QUẢNG CÁO & ĐẨY XUỐNG APP ── */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="text-base font-bold text-foreground">
                  Set Up & Kích Hoạt Quảng Cáo Trên App Hiệp Hội
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSetupModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Tiêu đề chiến dịch quảng cáo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Giải pháp ERP Toàn diện & Quản trị Doanh nghiệp"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Tên công ty / Doanh nghiệp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Huy hiệu đối tác / Danh xưng
                  </label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  >
                    <option value="ĐỐI TÁC CHIẾN LƯỢC">ĐỐI TÁC CHIẾN LƯỢC</option>
                    <option value="TÀI TRỢ KIM CƯƠNG">TÀI TRỢ KIM CƯƠNG</option>
                    <option value="GIAO THƯƠNG VIP">GIAO THƯƠNG VIP</option>
                    <option value="THÀNH VIÊN ĐỒNG SÁNG LẬP">THÀNH VIÊN ĐỒNG SÁNG LẬP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Ngày bắt đầu chạy
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Hiệu ứng animation hiển thị trên App Hiệp hội
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "gradient-wave", label: "Lượn sóng hoàng kim" },
                    { id: "pulse-glow", label: "Hào quang tỏa sáng" },
                    { id: "floating-shine", label: "Ánh kim chuyển động" },
                  ].map((an) => (
                    <button
                      key={an.id}
                      type="button"
                      onClick={() => setFormAnimation(an.id as any)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer font-medium ${
                        formAnimation === an.id
                          ? "border-blue-600 bg-blue-500/10 text-blue-600 font-bold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {an.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-foreground">
                    Tệp Ảnh hoặc Video Banner Quảng Cáo <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{isUploading ? "Đang tải lên..." : "Tải Ảnh / Video Từ Thiết Bị"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </div>

                <input
                  type="text"
                  value={formBanner}
                  onChange={(e) => setFormBanner(e.target.value)}
                  placeholder="Dán link ảnh/video hoặc bấm 'Tải Ảnh / Video Từ Thiết Bị' phía trên..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                />

                {/* Media Preview Box */}
                {formBanner && (
                  <div className="mt-2.5 relative rounded-xl border border-border overflow-hidden bg-slate-950 p-1 group">
                    {isVideoMedia(formBanner) ? (
                      <div className="relative">
                        <video
                          src={formBanner}
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="h-44 w-full rounded-lg object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          <Video className="h-3 w-3" />
                          <span>Video Quảng Cáo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={formBanner}
                          alt="Banner Preview"
                          className="h-44 w-full rounded-lg object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          <ImageIcon className="h-3 w-3" />
                          <span>Ảnh Banner</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormBanner("")}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/75 hover:bg-rose-600 text-white transition cursor-pointer"
                      title="Gỡ ảnh/video này"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Đường dẫn liên kết đích (Affiliate / Landing link)
                </label>
                <input
                  type="url"
                  value={formTargetUrl}
                  onChange={(e) => setFormTargetUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2 text-xs font-bold shadow-md cursor-pointer transition hover:bg-blue-700 bg-blue-600 text-white"
                >
                  Kích Hoạt & Đẩy Lên App Hiệp Hội
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
