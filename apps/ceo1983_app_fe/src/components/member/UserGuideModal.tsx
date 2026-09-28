import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Download,
  Upload,
  Sparkles,
  Home,
  CreditCard,
  ShoppingBag,
  Handshake,
  Vote,
  Compass,
  ArrowRight,
  ArrowLeft,
  Camera,
  Nfc,
  Calendar,
  QrCode,
  Users,
  Search,
  BookOpen,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Layers,
  HelpCircle,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/api-client";
import { useRole } from "@/hooks/use-role";
import { APP_SCREEN_TOURS, type ScreenGuideItem, type TourStepItem } from "@/lib/tours/appTourRegistry";

export interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
  defaultScreenId?: string;
}

const DEFAULT_PDF_URL = "/docs/HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf";

// Icon mapping helper
const SCREEN_ICONS: Record<string, any> = {
  Home,
  CreditCard,
  QrCode,
  Users,
  Calendar,
  Sparkles,
  ShoppingBag,
  Vote,
  MessageSquare,
  User,
};

export function UserGuideModal({ open, onClose, defaultScreenId }: UserGuideModalProps) {
  const { isAdmin, isPlatformAdmin } = useRole();
  const hasAdminPrivilege = Boolean(isAdmin || isPlatformAdmin);

  const [activeTab, setActiveTab] = useState<"screens" | "pdf">("screens");
  const [selectedScreenId, setSelectedScreenId] = useState<string>(
    defaultScreenId || APP_SCREEN_TOURS[0].id
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>(DEFAULT_PDF_URL);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (defaultScreenId) {
      setSelectedScreenId(defaultScreenId);
      setActiveStepIndex(0);
    }
  }, [defaultScreenId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vba_active_guide_pdf");
      if (saved) {
        setPdfUrl(saved);
      }
    }
  }, []);

  const currentScreen = useMemo(() => {
    return APP_SCREEN_TOURS.find((s) => s.id === selectedScreenId) || APP_SCREEN_TOURS[0];
  }, [selectedScreenId]);

  const filteredScreens = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return APP_SCREEN_TOURS;
    return APP_SCREEN_TOURS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.screenSummary.toLowerCase().includes(q) ||
        s.steps.some(
          (step) =>
            step.title.toLowerCase().includes(q) ||
            step.description.toLowerCase().includes(q) ||
            step.instruction.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  const activeStep = currentScreen.steps[activeStepIndex] || currentScreen.steps[0];

  if (!open || typeof document === "undefined") return null;

  const handleLaunchLiveTour = (screen: ScreenGuideItem) => {
    try {
      localStorage.setItem("ceo1983_active_screen_tour", screen.id);
      localStorage.setItem("ceo1983_trigger_tour_on_mount", "1");
    } catch {}
    toast.success(`Đang chuyển tới ${screen.title} & khởi động chỉ dẫn tương tác!`);
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = screen.route;
    }
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Vui lòng chọn tệp tin có định dạng PDF (.pdf)");
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadFile(file, `HDSD_${Date.now()}.pdf`);
      if (uploadedUrl) {
        setPdfUrl(uploadedUrl);
        localStorage.setItem("vba_active_guide_pdf", uploadedUrl);
        toast.success("Ban Quản Trị đã cập nhật file PDF hướng dẫn sử dụng mới!");
      }
    } catch {
      toast.error("Tải file lên thất bại. Vui lòng thử lại!");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleResetDefault = () => {
    setPdfUrl(DEFAULT_PDF_URL);
    localStorage.removeItem("vba_active_guide_pdf");
    toast.info("Đã khôi phục file PDF hướng dẫn sử dụng mặc định của CLB.");
  };

  const ScreenIcon = SCREEN_ICONS[currentScreen.iconName] || Smartphone;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-white dark:bg-[#071228] text-slate-900 dark:text-white shadow-2xl animate-scale-in">
        {/* Header Bar: Executive Navy & Champagne Gold Accents */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A1A3A] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>HƯỚNG DẪN THAO TÁC TỪNG MÀN HÌNH</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 uppercase font-black">
                    Chuẩn Mobile Banking
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-sky-200">
                Chỉ dẫn cụ thể từng điểm chạm, cử chỉ vuốt chạm và đặc quyền phân quyền các Ban
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLaunchLiveTour(currentScreen)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] hover:brightness-105 px-3.5 py-1.5 rounded-xl transition shadow-md cursor-pointer border border-amber-300/60 active:scale-95"
              title="Khởi động chỉ dẫn trực tiếp trên màn hình này"
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-950" />
              <span>Chạy Tour Trực Tiếp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl bg-black/35 hover:bg-black/60 text-white transition cursor-pointer"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: 10 Screens vs PDF & Hotline */}
        <div className="flex border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("screens")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "screens"
                ? "border-[#003B95] text-[#003B95] dark:border-amber-400 dark:text-amber-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Chỉ Dẫn 10 Màn Hình Chi Tiết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pdf"
                ? "border-[#003B95] text-[#003B95] dark:border-amber-400 dark:text-amber-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Cẩm Nang PDF & Hotline 5 Ban</span>
          </button>
        </div>

        {/* TAB 1: 10-SCREEN INTERACTIVE VISUALIZER */}
        {activeTab === "screens" && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-slate-50/70 dark:bg-[#070e1e]/60">
            {/* Left Column: Screen Selector List */}
            <div className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col bg-white dark:bg-[#0a152d]/90 overflow-hidden">
              {/* Search Screens */}
              <div className="p-3 border-b border-slate-100 dark:border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm màn hình hoặc thao tác..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#003B95] dark:focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Screens List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 [scrollbar-width:thin]">
                {filteredScreens.map((screen) => {
                  const Icon = SCREEN_ICONS[screen.iconName] || Smartphone;
                  const isSelected = screen.id === selectedScreenId;
                  return (
                    <button
                      key={screen.id}
                      type="button"
                      onClick={() => {
                        setSelectedScreenId(screen.id);
                        setActiveStepIndex(0);
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl transition cursor-pointer flex items-center justify-between gap-2.5 border ${
                        isSelected
                          ? "bg-amber-500/10 dark:bg-amber-400/15 border-amber-400/60 shadow-sm"
                          : "border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 border transition ${
                            isSelected
                              ? "bg-gradient-to-br from-[#003B95] to-[#0A1A3A] text-amber-300 border-amber-400/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9.5px] font-black uppercase tracking-wider ${
                                isSelected ? "text-[#003B95] dark:text-amber-300" : "text-slate-400"
                              }`}
                            >
                              {screen.badge}
                            </span>
                          </div>
                          <h4
                            className={`text-xs font-bold truncate leading-tight ${
                              isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {screen.title}
                          </h4>
                          <p className="text-[10.5px] text-slate-500 truncate max-w-[190px]">
                            {screen.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition ${
                          isSelected ? "text-amber-500 translate-x-0.5" : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Launch */}
              <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => handleLaunchLiveTour(currentScreen)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer border border-amber-300/60"
                >
                  <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                  <span>Trải Nghiệm Màn Này Ngay →</span>
                </button>
              </div>
            </div>

            {/* Right Column: Screen Details & Interactive Stepper (Banking Walkthrough) */}
            <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 [scrollbar-width:thin]">
              {/* Screen Banner Card */}
              <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1836] p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#001D4A] to-[#003B95] text-amber-300 border border-amber-400/40 shadow-sm shrink-0">
                    <ScreenIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase">
                        {currentScreen.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {currentScreen.route}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {currentScreen.title}: {currentScreen.subtitle}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {currentScreen.screenSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchLiveTour(currentScreen)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Mở giao diện thực tế</span>
                </button>
              </div>

              {/* Step Navigation Pills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Quy trình 4 thao tác cốt lõi trên màn hình này:
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Bước {activeStepIndex + 1} / {currentScreen.steps.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentScreen.steps.map((step, idx) => {
                    const isStepActive = idx === activeStepIndex;
                    return (
                      <button
                        key={step.targetId}
                        type="button"
                        onClick={() => setActiveStepIndex(idx)}
                        className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 shadow-xs ${
                          isStepActive
                            ? "bg-amber-500/10 dark:bg-amber-400/15 border-amber-400 text-slate-900 dark:text-white"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-black ${
                              isStepActive
                                ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs">{step.icon || "📌"}</span>
                        </div>
                        <span className="text-xs font-bold truncate leading-snug">
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Active Step Card (Bank-Style Coach Mark Detail) */}
              <div className="rounded-3xl border-2 border-amber-400/40 bg-white dark:bg-[#0A1428] p-5 shadow-lg space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#001D4A] to-[#003B95] text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                      BƯỚC {activeStepIndex + 1}: {activeStep.title}
                    </span>
                    <span className="text-lg">{activeStep.icon}</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-1.5">
                    <span>{activeStep.actionGesture}</span>
                  </div>
                </div>

                {/* What it is */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {activeStep.description}
                </p>

                {/* Specific Action Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3 space-y-1">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-[#003B95] dark:text-sky-300 block">
                      📍 Điểm chạm & Vị trí trên màn hình:
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {activeStep.touchPoint}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300/40 dark:border-amber-400/20 p-3 space-y-1">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                      👉 Thao tác cụ thể:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-amber-100">
                      {activeStep.instruction}
                    </p>
                  </div>
                </div>

                {/* System Feedback & Result */}
                <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/50 dark:border-emerald-500/20 p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      ⚡ Phản hồi từ hệ thống & Kết quả thực tế:
                    </span>
                    <p className="text-xs text-emerald-950 dark:text-emerald-100/90 font-medium mt-0.5">
                      {activeStep.systemResponse}
                    </p>
                  </div>
                </div>

                {/* Role Permission & Pro Tip */}
                <div className="space-y-2 pt-1">
                  {activeStep.roleNote && (
                    <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
                      <ShieldCheck className="h-4 w-4 text-[#003B95] dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Phân quyền nghiệp vụ:</strong> {activeStep.roleNote}
                      </div>
                    </div>
                  )}

                  {activeStep.proTip && (
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-400/40 p-3 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mẹo Doanh Nhân (VIP Pro Tip):</strong> {activeStep.proTip}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepper Navigation Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    disabled={activeStepIndex === 0}
                    onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Bước trước</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {activeStepIndex < currentScreen.steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex((prev) => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-slate-950 font-black text-xs shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer border border-amber-300/60 flex items-center gap-1.5"
                      >
                        <span>Bước tiếp theo</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-950" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLaunchLiveTour(currentScreen)}
                        className="px-5 py-2 rounded-xl bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-slate-950 font-black text-xs shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer border border-amber-300/60 flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                        <span>Chạy thử ngay trên màn này</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PDF DOCUMENT VIEWER & 5 BAN HOTLINE CONTACT */}
        {activeTab === "pdf" && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-slate-50/70 dark:bg-[#070e1e]/60">
            {/* Left Column: 5 Ban Hotline Contacts */}
            <div className="w-full md:w-80 lg:w-96 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col bg-white dark:bg-[#0a152d]/90 p-4 space-y-3 overflow-y-auto [scrollbar-width:thin]">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  HỖ TRỢ TRỰC TIẾP TỪ CÁC BAN
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Danh Bạ Trưởng Ban Chuyên Môn
                </h3>
                <p className="text-[11px] text-slate-500">
                  Liên hệ khi cần trợ giúp thủ tục hội viên, soát vé sự kiện hoặc kết nối xúc tiến
                </p>
              </div>

              {/* Committee Contacts List */}
              <div className="space-y-2 pt-1">
                {/* 1. Ban Truyền Thông */}
                <div className="rounded-2xl border border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                      Ban Truyền Thông & Sự Kiện
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                      Soát vé & Gala
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Phạm Quang Huy (Trưởng Ban)
                  </h4>
                  <p className="text-[11px] text-slate-500">Huy Hoàng Media Group</p>
                  <div className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#003B95] dark:text-amber-400">
                      0983 000 004
                    </span>
                    <a
                      href="tel:0983000004"
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>

                {/* 2. Ban Thư Ký */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-300">
                      Ban Thư Ký & Pháp Lý
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold">
                      Hồ sơ & Điều lệ
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Lê Hoàng Long (Tổng Thư Ký)
                  </h4>
                  <p className="text-[11px] text-slate-500">Tập Đoàn Hoàng Long</p>
                  <div className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#003B95] dark:text-amber-400">
                      0983 000 001
                    </span>
                    <a
                      href="tel:0983000001"
                      className="px-2.5 py-1 rounded-lg bg-[#003B95] text-white font-bold text-[11px] hover:bg-blue-800 transition"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>

                {/* 3. Ban Thành Viên */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                      Ban Thành Viên
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      Xét duyệt gia nhập
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Nguyễn Văn Cường (Trưởng Ban)
                  </h4>
                  <p className="text-[11px] text-slate-500">Cường Thịnh Corp</p>
                  <div className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#003B95] dark:text-amber-400">
                      0983 000 002
                    </span>
                    <a
                      href="tel:0983000002"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>

                {/* 4. Ban Tài Chính */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                      Ban Tài Chính & Ngân Quỹ
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                      Hội phí niên liễm
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Vũ Thu Trang (Trưởng Ban)
                  </h4>
                  <p className="text-[11px] text-slate-500">Kiến Vàng Capital</p>
                  <div className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#003B95] dark:text-amber-400">
                      0983 000 003
                    </span>
                    <a
                      href="tel:0983000003"
                      className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>

                {/* 5. Ban Xúc Tiến Thương Mại */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                      Ban Xúc Tiến Thương Mại
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                      Khớp nối B2B
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Hoàng Minh Tuấn (Trưởng Ban)
                  </h4>
                  <p className="text-[11px] text-slate-500">Tuấn Minh Global Trade</p>
                  <div className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#003B95] dark:text-amber-400">
                      0983 000 005
                    </span>
                    <a
                      href="tel:0983000005"
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: PDF Viewer */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Tài Liệu Hướng Dẫn Sử Dụng Chính Thức (.PDF)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={pdfUrl}
                    download="HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải Về PDF</span>
                  </a>

                  {hasAdminPrivilege && (
                    <label className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploading ? "Đang tải..." : "Cập Nhật PDF"}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleUploadPdf}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* PDF Embed Frame */}
              <div className="flex-1 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-900 shadow-inner">
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title="Tài liệu Hướng dẫn sử dụng App Hiệp Hội CEO 1983"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

