import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  Send,
  Bot,
  Lightbulb,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export interface TourStep {
  title: string;
  ucCode: string;
  ucName: string;
  instruction: string;
  aiAdvice: string;
  targetElementHint?: string;
  actionText?: string;
}

export interface ViOneAiTutorGuideProps {
  isOpen: boolean;
  onClose: () => void;
  systemType?: "crm" | "app";
  initialUcIndex?: number;
}

// 5 USE CASES CHUẨN MỰC CHO WEB CRM QUẢN TRỊ
const CRM_USE_CASES: { ucCode: string; ucName: string; steps: TourStep[] }[] = [
  {
    ucCode: "UC-CRM-01",
    ucName: "Quản trị Hội viên & Phân quyền Ban Điều Hành",
    steps: [
      {
        title: "Bước 1: Tiếp nhận và xem xét hồ sơ hội viên mới",
        ucCode: "UC-CRM-01",
        ucName: "Quản trị Hội viên & Phân quyền",
        instruction: "Tại menu bên trái, bấm vào 'Hội viên' để mở danh sách toàn bộ doanh nhân đăng ký hoặc gia nhập CLB CEO 1983.",
        aiAdvice: "Thưa Anh/Chị quản trị, hệ thống tự động lọc ra các hồ sơ đăng ký mới nhất từ Zalo Mini App và Web công khai để Anh/Chị duyệt trước khi cấp mã hội viên.",
        actionText: "Tôi đã hiểu, sang bước tiếp theo",
      },
      {
        title: "Bước 2: Phê duyệt kết nạp và tự động cấp tài khoản",
        ucCode: "UC-CRM-01",
        ucName: "Quản trị Hội viên & Phân quyền",
        instruction: "Bấm nút 'Duyệt & Cấp Tài Khoản' tại dòng của hội viên. Hệ thống tự động sinh mật khẩu ngẫu nhiên và gửi email thông báo kết nạp.",
        aiAdvice: "Việc này giúp tiết kiệm 100% thời gian tạo thủ công và bảo mật tuyệt đối thông tin đăng nhập cho doanh nhân.",
        actionText: "Tiếp tục",
      },
      {
        title: "Bước 3: Phân vai trò BCH & Ban Chuyên Môn",
        ucCode: "UC-CRM-01",
        ucName: "Quản trị Hội viên & Phân quyền",
        instruction: "Chọn thẻ 'Phân quyền & Ban' để gán chức danh (Chủ tịch, Phó Chủ tịch, Trưởng Ban Xúc tiến) theo mô hình RBAC chuẩn mực.",
        aiAdvice: "Quyền hạn của từng vai trò được mã hóa theo tiêu chuẩn an ninh đa tầng của CLB CEO 1983.",
        actionText: "Hoàn tất hướng dẫn UC-01",
      },
    ],
  },
  {
    ucCode: "UC-CRM-02",
    ucName: "Tạo Sự Kiện CLB & Phát hành Vé QR Check-in",
    steps: [
      {
        title: "Bước 1: Tạo mới phiên Sự kiện / Hội thảo Doanh nhân",
        ucCode: "UC-CRM-02",
        ucName: "Tạo Sự Kiện & QR Check-in",
        instruction: "Vào mục 'Sự kiện', bấm nút '+ Tạo Sự Kiện Mới'. Nhập tên sự kiện, thời gian bắt đầu, địa điểm tổ chức và số lượng vé.",
        aiAdvice: "Anh/Chị nên tải lên ảnh banner kích thước chuẩn 16:9 để khi đồng bộ lên Facebook và Zalo hiển thị đẹp mắt nhất.",
        actionText: "Tiếp tục",
      },
      {
        title: "Bước 2: Kích hoạt Check-in QR bảo mật chống trùng lặp",
        ucCode: "UC-CRM-02",
        ucName: "Tạo Sự Kiện & QR Check-in",
        instruction: "Bật tùy chọn 'Mã QR Động Check-in'. Mỗi hội viên khi đăng ký sẽ nhận 1 mã QR mã hóa SHA-256 duy nhất trên Mobile App.",
        aiAdvice: "Lễ tân tại bàn đón tiếp chỉ cần dùng camera quét là ghi nhận điểm danh tức thì trong 0.2 giây.",
        actionText: "Tiếp tục",
      },
      {
        title: "Bước 3: Bấm 1 lần phát hành Sự kiện lên Facebook & Zalo",
        ucCode: "UC-CRM-02",
        ucName: "Tạo Sự Kiện & QR Check-in",
        instruction: "Bấm 'Đăng Đa Kênh', chọn Hội nhóm Facebook và Nhóm Zalo CLB để tự động đăng tải thông báo mà không cần copy thủ công.",
        aiAdvice: "Tin bài sẽ hiển thị ngay lập tức trên nhóm Zalo với đầy đủ link đăng ký tham gia.",
        actionText: "Hoàn tất hướng dẫn UC-02",
      },
    ],
  },
  {
    ucCode: "UC-CRM-03",
    ucName: "Thống Kê Chuyên Sâu & Xuất / Nhập Excel Thông Minh",
    steps: [
      {
        title: "Bước 1: Khám phá Trung tâm Báo cáo Chỉ số Giao thương",
        ucCode: "UC-CRM-03",
        ucName: "Thống Kê & Excel",
        instruction: "Mở menu 'Báo cáo & Thống kê'. Xem 5 nhóm chỉ số: Gắn kết hội viên, Kết nối 1-on-1, Cơ hội B2B, Sự kiện & Phát triển mạng lưới.",
        aiAdvice: "Biểu đồ Recharts kết hợp Bar-Line cho phép Anh/Chị đối soát mục tiêu kế hoạch so với thực tế đạt được của từng ban chuyên môn.",
        actionText: "Tiếp tục",
      },
      {
        title: "Bước 2: Xuất file Excel chuẩn hóa theo 3 chế độ",
        ucCode: "UC-CRM-03",
        ucName: "Thống Kê & Excel",
        instruction: "Bấm nút 'Xuất Báo Cáo Excel'. Chọn 1 trong 3 chế độ: Theo Tháng/Quý/Năm, Theo từng Cá nhân Hội viên, hoặc Phân tích Biến động (Delta).",
        aiAdvice: "Tệp Excel được định dạng sẵn màu sắc thương hiệu và có sẵn dòng tổng cộng doanh thu để Anh/Chị in nộp Ban Thường vụ.",
        actionText: "Tiếp tục",
      },
      {
        title: "Bước 3: Nhập dữ liệu danh sách hội viên bằng Excel thông minh",
        ucCode: "UC-CRM-03",
        ucName: "Thống Kê & Excel",
        instruction: "Bấm 'Nhập File Excel', kéo thả tệp danh sách. Hệ thống tự động nhận diện và bóc tách các cột Họ tên, SĐT, Email, Doanh nghiệp.",
        aiAdvice: "Anh/Chị có thể bấm 'Tải mẫu chuẩn (.xlsx)' để tham khảo quy cách điền dữ liệu trước khi tải lên.",
        actionText: "Hoàn tất hướng dẫn UC-03",
      },
    ],
  },
  {
    ucCode: "UC-CRM-04",
    ucName: "Cấu hình Tích hợp Đa nền tảng & 1-Click Auto Post",
    steps: [
      {
        title: "Bước 1: Cấu hình link Hội nhóm Facebook & Nhóm Zalo CLB",
        ucCode: "UC-CRM-04",
        ucName: "Tích Hợp Đa Nền Tảng",
        instruction: "Vào 'Cài đặt' -> 'Tích hợp Đa kênh'. Dán đường link Hội nhóm Facebook, link Nhóm Zalo và Website chính thức của CLB.",
        aiAdvice: "Các đường link này sẽ là đích đến cho toàn bộ các chiến dịch truyền thông tự động của CLB.",
        actionText: "Tiếp tục",
      },
      {
        title: "Bước 2: Kiểm tra kết nối và lưu bền vững vào CSDL",
        ucCode: "UC-CRM-04",
        ucName: "Tích Hợp Đa Nền Tảng",
        instruction: "Bấm nút 'Kiểm tra kết nối' ở từng kênh, sau đó bấm 'Lưu cấu hình' để ghi nhận vào hệ thống.",
        aiAdvice: "Dữ liệu được lưu vĩnh viễn trên CSDL PostgreSQL nên sẽ không bị mất khi tắt trình duyệt.",
        actionText: "Hoàn tất hướng dẫn UC-04",
      },
    ],
  },
];

// 5 USE CASES CHO MOBILE APP HỘI VIÊN
const APP_USE_CASES: { ucCode: string; ucName: string; steps: TourStep[] }[] = [
  {
    ucCode: "UC-APP-01",
    ucName: "Thẻ Hội Viên Điện Tử & Check-in QR",
    steps: [
      {
        title: "Khám phá Thẻ Hội Viên Điện Tử",
        ucCode: "UC-APP-01",
        ucName: "Thẻ Doanh Nhân & QR",
        instruction: "Tại màn hình Trang Chủ, chạm vào Thẻ Doanh Nhân để mở mã QR định danh cá nhân độc quyền của Anh/Chị.",
        aiAdvice: "Mã QR này dùng để quét danh thiếp điện tử và check-in nhanh tại tất cả các sự kiện của HanoiBA.",
        actionText: "Tôi đã hiểu",
      },
    ],
  },
  {
    ucCode: "UC-APP-02",
    ucName: "Chia Sẻ & Tiếp Nhận Cơ Hội Kinh Doanh B2B",
    steps: [
      {
        title: "Đăng tải cơ hội thương mại B2B",
        ucCode: "UC-APP-02",
        ucName: "Giao Thương B2B",
        instruction: "Vào mục 'Giao thương', bấm nút '+ Đăng cơ hội'. Điền giá trị dự kiến (VNĐ), ngành nghề và mô tả nhu cầu hợp tác.",
        aiAdvice: "Hệ thống AI sẽ tự động phân tích và gợi ý các doanh nghiệp hội viên có ngành nghề tương thích để kết nối.",
        actionText: "Tôi đã hiểu",
      },
    ],
  },
  {
    ucCode: "UC-APP-03",
    ucName: "Sàn Thương Mại & Đặt Lịch Gặp B2B Tự Động",
    steps: [
      {
        title: "Đặt lịch hẹn kết nối 1-on-1",
        ucCode: "UC-APP-03",
        ucName: "Đặt Lịch B2B",
        instruction: "Khi xem sản phẩm hoặc cơ hội, bấm nút 'Lên lịch gặp'. Chọn ngày giờ và hình thức gặp mặt (Trực tiếp / Trực tuyến).",
        aiAdvice: "Sau khi bấm gửi, hệ thống tự động bắn tin nhắn trực tiếp vào hộp thư của cả 2 bên để xác nhận cuộc hẹn.",
        actionText: "Tôi đã hiểu",
      },
    ],
  },
];

export function ViOneAiTutorGuide({
  isOpen,
  onClose,
  systemType = "crm",
  initialUcIndex = 0,
}: ViOneAiTutorGuideProps) {
  const useCases = systemType === "crm" ? CRM_USE_CASES : APP_USE_CASES;
  const [selectedUcIdx, setSelectedUcIdx] = useState(initialUcIndex);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [userQuery, setUserQuery] = useState("");
  const [aiAnswers, setAiAnswers] = useState<string[]>([]);
  const [isAskingAi, setIsAskingAi] = useState(false);

  useEffect(() => {
    setSelectedUcIdx(initialUcIndex);
    setCurrentStepIdx(0);
    setAiAnswers([]);
  }, [initialUcIndex, isOpen]);

  if (!isOpen) return null;

  const currentUc = useCases[selectedUcIdx] || useCases[0];
  const currentStep = currentUc.steps[currentStepIdx] || currentUc.steps[0];
  const isLastStep = currentStepIdx === currentUc.steps.length - 1;

  const handleNextStep = () => {
    if (isLastStep) {
      if (selectedUcIdx < useCases.length - 1) {
        setSelectedUcIdx((prev) => prev + 1);
        setCurrentStepIdx(0);
        toast.success(`Đã hoàn thành ${currentUc.ucCode}! Chuyển sang quy trình tiếp theo.`);
      } else {
        toast.success("Chúc mừng Anh/Chị đã hoàn thành toàn bộ khóa hướng dẫn thao tác!");
        onClose();
      }
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    } else if (selectedUcIdx > 0) {
      setSelectedUcIdx((prev) => prev - 1);
      setCurrentStepIdx(useCases[selectedUcIdx - 1].steps.length - 1);
    }
  };

  const handleAskAi = () => {
    if (!userQuery.trim()) return;
    setIsAskingAi(true);
    const q = userQuery.trim();
    setUserQuery("");

    setTimeout(() => {
      let ans = `Về bước "${currentStep.title}": Hệ thống khuyến nghị Anh/Chị kiểm tra kỹ thông tin trước khi nhấn xác nhận. Nếu cần hỗ trợ thêm về "${q}", Ban Thư ký CLB CEO 1983 luôn sẵn sàng hỗ trợ trực tuyến qua hotline.`;
      if (q.toLowerCase().includes("lỗi") || q.toLowerCase().includes("không được")) {
        ans = `Anh/Chị đừng lo lắng! Nếu gặp trở ngại ở bước này, vui lòng kiểm tra kết nối mạng hoặc liên hệ Ban Công Nghệ CLB CEO 1983. Hệ thống đã tự động lưu lại trạng thái thao tác gần nhất của Anh/Chị.`;
      }
      setAiAnswers((prev) => [...prev, `Hội viên hỏi: "${q}"\n→ AI Trợ Lý: ${ans}`]);
      setIsAskingAi(false);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center shadow-md">
              <Bot className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {systemType === "crm" ? "HƯỚNG DẪN THAO TÁC CRM CHUẨN NGÂN HÀNG" : "TRỢ LÝ HƯỚNG DẪN DÙNG APP CEO 1983"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-mono text-[10px] font-bold border border-blue-700/50">
                  {currentUc.ucCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Quy trình {selectedUcIdx + 1}/{useCases.length}: <strong>{currentUc.ucName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* THÂN MODAL: THIẾT KẾ ĐỘC BẢN "GIÁO VIÊN ĐỨNG BÊN CẠNH BẢNG" */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto flex-1">
          {/* CỘT TRÁI (4 CỘT): ICON / AVATAR AI GIÁO VIÊN CỐ VẤN */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900/90 border border-blue-900/50 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 size-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            
            {/* Avatar AI Giáo viên */}
            <div className="relative mb-3">
              <div className="size-28 sm:size-32 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-amber-200 to-blue-500 shadow-xl shadow-amber-500/10">
                <div className="size-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                    alt="AI Teacher"
                    className="size-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <span className="size-1.5 rounded-full bg-white animate-ping" />
                <span>AI Đang Giảng</span>
              </div>
            </div>

            <h4 className="font-bold text-sm text-amber-300 mt-2">Cố Vấn Số CLB CEO 1983</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Trợ lý tương tác trực tiếp theo từng thao tác</p>

            {/* Menu Chọn Quy Trình Nhanh */}
            <div className="w-full mt-4 pt-4 border-t border-slate-800 space-y-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Danh sách quy trình (UC):
              </span>
              {useCases.map((uc, idx) => (
                <button
                  key={uc.ucCode}
                  type="button"
                  onClick={() => {
                    setSelectedUcIdx(idx);
                    setCurrentStepIdx(0);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    selectedUcIdx === idx
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span className="line-clamp-1">{uc.ucCode}: {uc.ucName}</span>
                  {selectedUcIdx === idx && <CheckCircle2 className="size-3 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI (8 CỘT): KHUNG BẢNG LỚP HỌC / BẢNG TƯƠNG TÁC CẠNH GIÁO VIÊN */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
            <div className="space-y-4">
              {/* Tiêu đề bước trên bảng */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold font-mono text-xs border border-amber-500/30">
                    Bước {currentStepIdx + 1} / {currentUc.steps.length}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {currentStep.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  {currentUc.steps.map((_, i) => (
                    <span
                      key={i}
                      className={`size-2.5 rounded-full transition-all ${
                        i === currentStepIdx
                          ? "bg-amber-400 scale-125"
                          : i < currentStepIdx
                          ? "bg-emerald-500"
                          : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* BẢNG ĐEN GIẢNG GIẢI THAO TÁC CỦA BƯỚC NÀY */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs shadow-inner">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Play className="size-3.5 fill-current" />
                  <span>Chỉ dẫn thao tác trên giao diện:</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
                  {currentStep.instruction}
                </p>

                {/* Khung Lời dặn dò của AI Tutor */}
                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/50 flex items-start gap-2.5 text-xs text-blue-200 font-sans">
                  <Lightbulb className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Lời khuyên từ Cố Vấn Số: </span>
                    <span>{currentStep.aiAdvice}</span>
                  </div>
                </div>
              </div>

              {/* KHUNG TƯƠNG TÁC HỎI THÊM CON AI */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskAi()}
                    placeholder="Chưa rõ thao tác này? Nhập câu hỏi gửi AI hướng dẫn thêm..."
                    className="flex-1 h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAskAi}
                    disabled={isAskingAi || !userQuery.trim()}
                    className="h-9 px-3.5 rounded-xl bg-[#ffffff] hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <Send className="size-3.5" />
                    <span>Hỏi AI</span>
                  </button>
                </div>

                {/* Lịch sử câu trả lời của AI */}
                {aiAnswers.length > 0 && (
                  <div className="max-h-24 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                    {aiAnswers.map((ans, idx) => (
                      <div key={idx} className="whitespace-pre-line text-blue-300 border-b border-slate-850 pb-1">
                        {ans}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CÁC NÚT ĐIỀU HƯỚNG BƯỚC ("TIẾP TỤC" / "TÔI ĐÃ HIỂU") */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0 && selectedUcIdx === 0}
                className="px-3.5 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 cursor-pointer transition"
              >
                <ChevronLeft className="size-4" />
                <span>Quay lại</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Bỏ qua hướng dẫn
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  <span>{currentStep.actionText || (isLastStep ? "Hoàn tất quy trình" : "Tiếp tục / Tôi đã hiểu")}</span>
                  <ChevronRight className="size-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
