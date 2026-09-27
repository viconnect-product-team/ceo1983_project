import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  Upload,
  Trash2,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Home,
  CreditCard,
  ShoppingBag,
  Handshake,
  Vote,
  Compass,
  ArrowRight,
  Camera,
  Nfc,
  Calendar,
  QrCode,
  Users,
  Search,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/api-client";
import { useRole } from "@/hooks/use-role";

export interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_PDF_URL = "/docs/HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf";

export interface GuideStep {
  id: number;
  category: "card-ai" | "trade-shop" | "meetings-events" | "network-profile";
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  color: string;
  screenName: string;
  description: string;
  highlights: string[];
  actionHint: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 1,
    category: "network-profile",
    title: "Trang Chủ & Cập Nhật Hồ Sơ Nhanh",
    subtitle: "Chỉnh sửa nhanh tinh gọn ngay tại footer thẻ hội viên",
    badge: "Tính năng 1/10",
    icon: Home,
    color: "#003B95",
    screenName: "Trang chủ (/association)",
    description:
      "Màn hình điều hành trung tâm của hiệp hội. Hiển thị thẻ hội viên VIP sang trọng với đầy đủ nhận diện doanh nghiệp, số điện thoại và các phím tắt tác vụ nhanh.",
    highlights: [
      "Icon cây bút chì tinh tế tại footer thẻ: Mở popup Chỉnh sửa nhanh thông tin chỉ trong 1 chạm.",
      "Nút đổi ảnh bìa background và tải logo công ty trực tiếp ngay trên mặt thẻ.",
      "Cập nhật tức thì họ tên, chức vụ, số điện thoại liên hệ mà không cần reload trang.",
      "Thanh truy cập nhanh: Vé check-in đại hội, Biểu quyết, Lịch sử và Danh bạ đối tác.",
    ],
    actionHint: "Bấm icon bút chì ở footer thẻ hoặc nút 'Đổi ảnh bìa' trên đầu thẻ để cá nhân hóa.",
  },
  {
    id: 2,
    category: "card-ai",
    title: "Thẻ Hội Viên VIP & Danh Thiếp Số 5.0",
    subtitle: "Nhận diện thương hiệu doanh nhân và kết nối không chạm",
    badge: "Tính năng 2/10",
    icon: CreditCard,
    color: "#19194D",
    screenName: "Thẻ hội viên (/association/card)",
    description:
      "Tấm danh thiếp điện tử chuẩn mực của CEO 1983. Tích hợp mã QR thông minh để đối tác bên ngoài quét nhận diện thông tin ngay trên điện thoại mà không cần cài đặt thêm ứng dụng.",
    highlights: [
      "Logo công ty chính hãng xuất hiện trang trọng chìm tinh tế tại góc trên bên phải.",
      "Mã QR cá nhân hóa phóng to toàn màn hình chỉ với 1 chạm.",
      "Cài đặt quyền riêng tư (Privacy Toggle): Chủ động chọn ẩn hoặc hiện Số điện thoại, Email, Zalo.",
      "Sao chép link danh thiếp trực tuyến hoặc chia sẻ trực tiếp qua Zalo, Messenger, Email.",
    ],
    actionHint: "Bấm nút 'Chỉnh sửa' dưới thẻ để quản lý quyền riêng tư thông tin muốn hiển thị.",
  },
  {
    id: 3,
    category: "card-ai",
    title: "Quét Danh Thiếp Thông Minh AI",
    subtitle: "Chụp ảnh card visit giấy, bóc tách dữ liệu tức thì bằng AI",
    badge: "Tính năng 3/10",
    icon: Camera,
    color: "#0284C7",
    screenName: "Quét card AI (/association/card)",
    description:
      "Công nghệ AI Vision thông minh giúp số hóa toàn bộ danh thiếp giấy nhận được tại các hội thảo, diễn đàn kinh tế chỉ trong 3 giây.",
    highlights: [
      "Chụp trực tiếp bằng camera điện thoại hoặc tải ảnh chụp danh thiếp từ thư viện ảnh.",
      "Tự động nhận diện và trích xuất: Họ tên, Chức vụ, Tên công ty, SĐT, Email và Địa chỉ.",
      "Tự động lưu vào 'Danh thiếp đã lưu' và danh bạ kết nối để dễ dàng tra cứu lại.",
      "Tùy chọn áp dụng ảnh danh thiếp vừa chụp làm nền thẻ cá nhân.",
    ],
    actionHint: "Vào tab Thẻ hội viên, bấm nút 'Chụp danh thiếp' để quét card visit của đối tác.",
  },
  {
    id: 4,
    category: "card-ai",
    title: "Chạm Kết Nối Không Dây NFC",
    subtitle: "Chạm thẻ thông minh vào lưng điện thoại để trao đổi danh thiếp",
    badge: "Tính năng 4/10",
    icon: Nfc,
    color: "#059669",
    screenName: "Ghi thẻ NFC (/association/card)",
    description:
      "Tích hợp công nghệ truyền dữ liệu trường gần (Web NFC). Doanh nhân chỉ cần chạm tấm thẻ kim loại CEO 1983 vào điện thoại đối tác là toàn bộ thông tin sẽ tự động mở ra.",
    highlights: [
      "Đối tác không cần cài đặt bất kỳ ứng dụng nào, hoạt động trên cả iOS và Android.",
      "Tính năng 'Ghi thẻ NFC': Tự đồng bộ link hồ sơ số mới nhất vào thẻ cứng chỉ với 1 chạm.",
      "Bảo mật cao, chống sao chép trái phép và có thể cập nhật thông tin không giới hạn lần.",
    ],
    actionHint: "Mở Thẻ hội viên, chọn 'Ghi thẻ NFC' và áp thẻ vào giữa mặt lưng điện thoại để ghi dữ liệu.",
  },
  {
    id: 5,
    category: "trade-shop",
    title: "Sàn Cơ Hội Giao Thương B2B Realtime",
    subtitle: "Chia sẻ nhu cầu Cung - Cầu và khớp nối đối tác tức thì",
    badge: "Tính năng 5/10",
    icon: Sparkles,
    color: "#7C3AED",
    screenName: "Cơ hội giao thương (/association/opportunities)",
    description:
      "Nơi 200+ chủ doanh nghiệp trao đổi nguồn hàng, tìm kiếm nhà thầu phụ, đơn vị phân phối và cơ hội đầu tư kinh doanh minh bạch.",
    highlights: [
      "Bảng thống kê Realtime: Tổng số cơ hội đang mở và giá trị giao dịch ước tính (VNĐ).",
      "Đăng tin nhanh theo 3 phân loại: Cung cấp (Supply), Tìm mua (Demand), Hợp tác liên kết.",
      "Gắn tag giá trị dự án, tệp đính kèm và thông tin liên hệ của người phụ trách.",
      "Bấm nút 'Đăng cơ hội ngay →' ở cuối danh sách để gửi nhu cầu kinh doanh mới.",
    ],
    actionHint: "Chọn mục Cơ hội trên thanh điều hướng, duyệt tin đăng hoặc đăng cơ hội mới của bạn.",
  },
  {
    id: 6,
    category: "trade-shop",
    title: "Chợ B2B Marketplace & Quản Lý Mục Của Tôi",
    subtitle: "Gian hàng số, đăng bán sản phẩm và banner tài trợ doanh nghiệp",
    badge: "Tính năng 6/10",
    icon: ShoppingBag,
    color: "#D97706",
    screenName: "Marketplace (/association/products)",
    description:
      "Sàn thương mại điện tử nội bộ của CLB CEO 1983. Cho phép hội viên giới thiệu giải pháp công nghiệp, vật tư, dịch vụ doanh nghiệp với chính sách ưu đãi thành viên.",
    highlights: [
      "Header tối giản 'Chợ Marketplace' sạch đẹp, tập trung toàn bộ trải nghiệm mua bán.",
      "Tab 'Mục của tôi': Nơi quản trị tập trung tất cả tin đăng sản phẩm, đơn chào giá của bạn.",
      "Nút 'Đăng tin sản phẩm' và 'Quảng cáo tài trợ' được quy hoạch tiện lợi trong Mục của tôi.",
      "Nút nhắn tin trực tiếp trên từng sản phẩm để trao đổi chiết khấu với chủ doanh nghiệp.",
    ],
    actionHint: "Vào Marketplace, bấm chuyển sang tab 'Mục của tôi' để đăng sản phẩm hoặc quảng cáo.",
  },
  {
    id: 7,
    category: "meetings-events",
    title: "Lịch Họp Ban & Đặt Lịch Họp Doanh Nghiệp",
    subtitle: "Lịch họp Ban Chấp Hành, phòng họp trực tiếp & họp online Meet/Zoom",
    badge: "Tính năng 7/10",
    icon: Calendar,
    color: "#003B95",
    screenName: "Lịch họp & Sự kiện (/association/events)",
    description:
      "Hệ thống điều phối lịch sinh hoạt nội bộ của các Ban Chuyên Môn (Ban Xúc Tiến, Ban Truyền Thông, Ban Tài Chính...) và đặt phòng họp doanh nghiệp.",
    highlights: [
      "Lịch họp định kỳ theo tuần và tháng của Ban Chấp Hành cùng các Phân ban chuyên môn.",
      "Hỗ trợ đặt phòng họp trực tiếp tại trụ sở CLB hoặc phòng họp trực tuyến Google Meet / Zoom.",
      "Nhận in-app notification đồng bộ nhắc giờ họp trước 15-30 phút kèm tài liệu họp.",
      "Theo dõi danh sách đại biểu xác nhận tham dự và ghi chép biên bản cuộc họp.",
    ],
    actionHint: "Xem lịch các cuộc họp sắp tới trong mục Sự kiện & Lịch hoạt động.",
  },
  {
    id: 8,
    category: "meetings-events",
    title: "Vé QR Check-in Tự Động Sự Kiện & Đại Hội",
    subtitle: "Mã vé QR nền trắng viền xanh, check-in 1 giây tại bàn lễ tân",
    badge: "Tính năng 8/10",
    icon: QrCode,
    color: "#003B95",
    screenName: "Vé sự kiện (/association/checkin)",
    description:
      "Giải pháp đón tiếp đại biểu chuyên nghiệp: Mỗi hội viên đăng ký thành công sẽ nhận được một thẻ vé QR thông minh với đầy đủ thông tin nhận diện.",
    highlights: [
      "Giao diện chuẩn Executive: Nền trắng tinh tế, khung viền xanh Navy #003B95 sắc nét.",
      "Hiển thị chính xác mã vé cá nhân hóa (VD: EVT-1983-MEMBER-VIP) và tên sự kiện đã đăng ký.",
      "Lễ tân quét mã check-in tức thì bằng máy quét chuyên dụng trong 1 giây.",
      "Tự động tra cứu số bàn tiệc và vị trí ghế ngồi phân bổ trước giờ khai mạc.",
    ],
    actionHint: "Bấm icon 'Vé Check-in' tại trang chủ hoặc mục Sự kiện để xuất trình vé khi đến tham dự.",
  },
  {
    id: 9,
    category: "trade-shop",
    title: "Hẹn Gặp Kết Nối 1-on-1 Doanh Nhân",
    subtitle: "Kết nối có mục đích rõ ràng, đính kèm cơ hội kinh doanh cụ thể",
    badge: "Tính năng 9/10",
    icon: Handshake,
    color: "#EA580C",
    screenName: "Gặp gỡ 1-on-1 (/association/members)",
    description:
      "Công cụ xúc tiến thương mại thực chất: Không đơn thuần là kết bạn mạng xã hội, hội viên gửi thư mời hẹn gặp trao đổi chiến lược kinh doanh hoặc đàm phán hợp đồng hợp tác.",
    highlights: [
      "Form gửi lời mời nhanh: Họ tên, Số điện thoại, Tên công ty và Mục đích gặp mặt cụ thể.",
      "Tùy chọn đính kèm tin đăng cơ hội giao thương để đôi bên cùng chuẩn bị trước nội dung.",
      "Đối tác nhận được Thư Mời Gặp Mặt trang trọng trong hộp thư với nút Đồng ý hoặc Từ chối.",
      "Lưu lại lịch sử các cuộc gặp kết nối thành công và đánh giá giá trị giao thương.",
    ],
    actionHint: "Tìm hội viên trong Danh bạ, bấm icon Bắt tay 'Hẹn gặp kết nối' để gửi thư mời.",
  },
  {
    id: 10,
    category: "network-profile",
    title: "Danh Bạ 200+ Doanh Nhân & Chủ Đề Lễ Hội",
    subtitle: "Tìm kiếm đối tác theo ngành, cá nhân hóa theme Sáng / Tối",
    badge: "Tính năng 10/10",
    icon: Users,
    color: "#0F172A",
    screenName: "Danh bạ & Tôi (/association/profile)",
    description:
      "Trung tâm kết nối và cá nhân hóa: Tra cứu danh bạ hội viên toàn diện, tùy chỉnh chế độ hiển thị Sáng/Tối và trải nghiệm Chủ đề Lễ Hội theo mùa.",
    highlights: [
      "Bộ lọc danh bạ đa chiều: Lọc theo ngành nghề (Bất động sản, Công nghệ, F&B, Xây dựng...).",
      "Lựa chọn 3 chủ đề giao diện: Sáng (Light) thanh lịch, Tối (Dark) sang trọng, Tương phản cao.",
      "Kích hoạt Chủ đề Lễ Hội (Trung Thu, Quốc Khánh 2/9, Noel, Tết) khi CRM trung tâm phát động.",
      "Trung tâm hướng dẫn sử dụng và Hotline/Zalo OA hỗ trợ trực tiếp từ Ban Thư Ký CLB.",
    ],
    actionHint: "Vào tab Tôi để chuyển đổi Theme sáng/tối hoặc bật/tắt chủ đề lễ hội theo ý muốn.",
  },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "Tất cả (10)" },
  { id: "card-ai", label: "Danh thiếp & AI (3)" },
  { id: "trade-shop", label: "Giao thương & Chợ (3)" },
  { id: "meetings-events", label: "Họp & Sự kiện (2)" },
  { id: "network-profile", label: "Hồ sơ & Mạng lưới (2)" },
];

export function UserGuideModal({ open, onClose }: UserGuideModalProps) {
  const { isAdmin, isPlatformAdmin } = useRole();
  const hasAdminPrivilege = Boolean(isAdmin || isPlatformAdmin);

  const [activeTab, setActiveTab] = useState<"interactive" | "pdf">("interactive");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string>(DEFAULT_PDF_URL);
  const [uploading, setUploading] = useState(false);
  const [adminBarOpen, setAdminBarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vba_active_guide_pdf");
      if (saved) {
        setPdfUrl(saved);
      }
    }
  }, []);

  const filteredSteps = useMemo(() => {
    return GUIDE_STEPS.filter((step) => {
      const matchCat = selectedCategory === "all" || step.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        step.title.toLowerCase().includes(q) ||
        step.subtitle.toLowerCase().includes(q) ||
        step.description.toLowerCase().includes(q) ||
        step.screenName.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Ensure currentStepIndex stays within bounds of filtered steps
  const safeStepIndex = Math.min(currentStepIndex, Math.max(0, filteredSteps.length - 1));
  const currentStep = filteredSteps[safeStepIndex] || GUIDE_STEPS[0];

  if (!open || typeof document === "undefined") return null;

  const handleNextStep = () => {
    if (safeStepIndex < filteredSteps.length - 1) {
      setCurrentStepIndex(safeStepIndex + 1);
    } else {
      toast.success("Quý CEO đã xem xong toàn bộ chỉ dẫn tính năng của App Hiệp Hội!");
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (safeStepIndex > 0) {
      setCurrentStepIndex(safeStepIndex - 1);
    }
  };

  const handleLaunchLiveTour = () => {
    try {
      localStorage.setItem("ceo1983_trigger_tour_on_mount", "1");
    } catch {}
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/association";
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

  const StepIcon = currentStep.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071228] shadow-2xl">
        {/* Header bar: Executive Blue Gradient */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A1A3A] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-xs border border-white/20 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                  TRUNG TÂM HƯỚNG DẪN SỬ DỤNG
                </h3>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9.5px] font-black text-white border border-white/20 uppercase">
                  ViOne • CEO 1983
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90">
                10 chức năng cốt lõi • Chỉ dẫn tương tác & Cẩm nang chính thức
              </p>
            </div>
          </div>

          {/* Quick Close & Live Tour Trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchLiveTour}
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-1.5 rounded-xl transition cursor-pointer"
              title="Mở chỉ dẫn tương tác trực tiếp trên màn hình chính"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Chỉ dẫn trực tiếp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl bg-black/25 hover:bg-black/45 text-white transition cursor-pointer"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("interactive")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "interactive"
                ? "border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Chỉ dẫn 10 tính năng cốt lõi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pdf"
                ? "border-[#003B95] text-[#003B95] dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Sổ tay tài liệu PDF CLB</span>
          </button>
        </div>

        {/* Tab 1: Interactive 10-Feature Guide Center */}
        {activeTab === "interactive" && (
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto p-4 sm:p-6 bg-slate-50/60 dark:bg-[#0B132B]/50">
            {/* Filter Pills & Search */}
            <div className="space-y-3 mb-4 shrink-0">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentStepIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search bar & Step pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentStepIndex(0);
                    }}
                    placeholder="Tìm nhanh tính năng (NFC, QR, B2B...)..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#003B95]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs sm:justify-end gap-3 text-slate-500 dark:text-slate-400 font-semibold">
                  <span>
                    Chức năng {safeStepIndex + 1} / {filteredSteps.length}
                  </span>
                  <span className="text-[#003B95] dark:text-blue-400 font-bold">
                    {Math.round(((safeStepIndex + 1) / filteredSteps.length) * 100)}% hoàn thành
                  </span>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#003B95] to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((safeStepIndex + 1) / filteredSteps.length) * 100}%` }}
                />
              </div>

              {/* Step indicator chips */}
              <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
                {filteredSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition shrink-0 cursor-pointer ${
                      safeStepIndex === idx
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {idx + 1}. {step.title.split("&")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Step Card */}
            <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl shrink-0 text-white shadow-md"
                    style={{ backgroundColor: currentStep.color }}
                  >
                    <StepIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block text-[10.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                        {currentStep.badge}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {currentStep.screenName}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {currentStep.title}
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#003B95] dark:text-blue-300 font-semibold mt-0.5">
                      {currentStep.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {currentStep.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/10 p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Điểm nổi bật của tính năng:
                  </p>
                  <ul className="space-y-1.5">
                    {currentStep.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action hint banner & Live Tour Launcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-[#003B95] dark:text-blue-200 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#003B95] dark:text-blue-400" />
                    <span>Mẹo: {currentStep.actionHint}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLaunchLiveTour}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-[11px] shadow-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                    title="Chuyển về Trang chủ và bật Tour chỉ dẫn từng bước tương tác kiểu ngân hàng"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Chỉ dẫn trực tiếp trên màn hình</span>
                  </button>
                </div>
              </div>

              {/* Bottom Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 gap-3">
                <button
                  type="button"
                  disabled={safeStepIndex === 0}
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Bước trước</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                  >
                    Đóng
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#003B95]/20 active:scale-95 transition cursor-pointer"
                  >
                    <span>{safeStepIndex === filteredSteps.length - 1 ? "Hoàn thành" : "Bước tiếp theo"}</span>
                    {safeStepIndex === filteredSteps.length - 1 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PDF Document Viewer */}
        {activeTab === "pdf" && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold truncate">
                <FileText className="h-4 w-4 text-[#003B95] dark:text-blue-400 shrink-0" />
                <span className="truncate">Tài liệu Hướng dẫn sử dụng chính thức CLB CEO 1983 (.PDF)</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pdfUrl}
                  download="HUONG_DAN_SU_DUNG_APP_HIEP_HOI_CEO1983.pdf"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Tải PDF về máy</span>
                </a>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B95] text-white font-bold hover:bg-[#002B70] transition cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Mở tab mới</span>
                </a>
              </div>
            </div>

            {/* Admin Bar */}
            {hasAdminPrivilege && (
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  <span>Quyền Quản Trị: Cập nhật file PDF cẩm nang hướng dẫn sử dụng mới</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition cursor-pointer">
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    <span>{uploading ? "Đang tải..." : "Tải PDF mới"}</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleUploadPdf} />
                  </label>
                  {pdfUrl !== DEFAULT_PDF_URL && (
                    <button
                      type="button"
                      onClick={handleResetDefault}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Khôi phục mặc định
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PDF Embedded iframe */}
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border-0"
                title="Tài liệu Hướng dẫn sử dụng App Hiệp Hội CEO 1983"
              />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
