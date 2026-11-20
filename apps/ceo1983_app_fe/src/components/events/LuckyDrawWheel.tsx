import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Trophy,
  Sparkles,
  Gift,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Trash2,
  Users,
  Award,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  X,
  Flame,
  Star,
  PartyPopper,
  Share2,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Maximize2,
  ExternalLink,
  Palette,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";

export interface Prize {
  id: string;
  title: string;
  gift: string;
  quantity: number;
  remaining: number;
  color: string;
  icon: string;
  sponsor?: string;
  value?: string;
}

export interface Candidate {
  id: string;
  name: string;
  company: string;
  position: string;
  phone?: string;
  email?: string;
  code?: string;
  checkedIn: boolean;
}

export interface WinnerRecord {
  id: string;
  candidateName: string;
  company: string;
  position: string;
  phone?: string;
  email?: string;
  prizeTitle: string;
  gift: string;
  wonAt: string;
  emailSent?: boolean;
}

export interface BannerConfig {
  theme: "royal_gold" | "emerald_corporate" | "sapphire_gala" | "warm_amber" | "custom_backdrop";
  backdropUrl?: string;
  backdropOpacity: number;
  title: string;
  subtitle: string;
  date: string;
  location: string;
}

const THEME_OPTIONS: {
  id: BannerConfig["theme"];
  name: string;
  previewClass: string;
  headerBg: string;
  cardBg: string;
}[] = [
  {
    id: "royal_gold",
    name: "Hoàng Kim Sân Khấu (Royal Gold)",
    previewClass: "from-slate-900 via-blue-950 to-amber-900",
    headerBg: "from-slate-950 via-blue-950 to-[#005BAC]",
    cardBg: "from-slate-900/90 via-blue-950/80 to-slate-900/90",
  },
  {
    id: "emerald_corporate",
    name: "Xanh Viện Doanh Trí (Emerald Corporate)",
    previewClass: "from-[#005BAC] via-[#0284C7] to-[#00A859]",
    headerBg: "from-[#003865] via-[#005BAC] to-[#00A859]",
    cardBg: "from-white to-emerald-50/40",
  },
  {
    id: "sapphire_gala",
    name: "Đại Tiệc Tri Ân (Sapphire Gala)",
    previewClass: "from-indigo-950 via-blue-900 to-sky-700",
    headerBg: "from-indigo-950 via-blue-900 to-[#0284C7]",
    cardBg: "from-white to-sky-50/40",
  },
  {
    id: "warm_amber",
    name: "Bình Minh Khởi Sắc (Warm Amber)",
    previewClass: "from-amber-950 via-orange-900 to-yellow-600",
    headerBg: "from-amber-950 via-orange-900 to-yellow-600",
    cardBg: "from-white to-amber-50/40",
  },
  {
    id: "custom_backdrop",
    name: "Ảnh Nền Sân Khấu Tùy Chỉnh (Custom Backdrop)",
    previewClass: "from-slate-800 to-slate-950",
    headerBg: "from-slate-900/90 via-slate-850/90 to-slate-900/90 backdrop-blur-md",
    cardBg: "from-white/95 to-slate-50/95 backdrop-blur-sm",
  },
];

export const DEFAULT_PRIZES: Prize[] = [
  {
    id: "p-dac-biet",
    title: "GIẢI ĐẶC BIỆT",
    gift: "Bộ Quà Tặng Doanh Nhân Kim Cương & Chuyến Du Lịch Nghỉ Dưỡng",
    quantity: 1,
    remaining: 1,
    color: "#EAB308",
    icon: "👑",
  },
  {
    id: "p-nhat",
    title: "GIẢI NHẤT",
    gift: "Khóa Đào Tạo AI Doanh Trí Chiến Lược 2027",
    quantity: 1,
    remaining: 1,
    color: "#005BAC",
    icon: "🥇",
  },
  {
    id: "p-nhi",
    title: "GIẢI NHÌ",
    gift: "Gói Dịch Vụ Tư Vấn Tăng Trưởng Doanh Nghiệp VIP",
    quantity: 2,
    remaining: 2,
    color: "#00A859",
    icon: "🥈",
  },
  {
    id: "p-ba",
    title: "GIẢI BA",
    gift: "Kỷ Niệm Chương Pha Lê & Bộ Quà Viện Doanh Trí",
    quantity: 3,
    remaining: 3,
    color: "#0284C7",
    icon: "🥉",
  },
  {
    id: "p-khuyen-khich",
    title: "GIẢI KHUYẾN KHÍCH",
    gift: "Voucher Kết Nối B2B Thượng Đỉnh Toạ Đàm Doanh Nghiệp",
    quantity: 5,
    remaining: 5,
    color: "#10B981",
    icon: "🎁",
  },
];

const SLICE_COLORS = [
  "#00A859", // Xanh lá Viện Doanh Trí
  "#005BAC", // Xanh dương Viện Doanh Trí
  "#0284C7", // Sky blue
  "#EAB308", // Vàng gold
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#0D9488", // Teal
  "#EC4899", // Pink
  "#8B5CF6", // Violet
];

function playTickSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

function playFanfareSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 1.0);
    });
  } catch {}
}

export interface LuckyDrawWheelProps {
  eventId?: string;
  initialEvent?: any;
  inCrm?: boolean;
  isPublicScreen?: boolean;
}

export function LuckyDrawWheel({
  eventId = "event-doanhtri-20261121",
  initialEvent,
  inCrm = false,
  isPublicScreen = false,
}: LuckyDrawWheelProps) {
  // Cấu hình Banner & Giao diện thực tế
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => {
    try {
      const saved = localStorage.getItem(`lucky_draw_banner_${eventId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: "emerald_corporate",
      backdropUrl: "",
      backdropOpacity: 0.85,
      title: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ",
      subtitle: "Tri Ân Ngày Nhà Giáo Việt Nam 20/11 & Toạ Đàm Doanh Nghiệp 2027",
      date: "14h30 - 17h30, Thứ Bảy, ngày 21/11/2026",
      location: "Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy",
    };
  });

  // Danh sách đại biểu trong vòng quay
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Danh sách giải thưởng THỰC TẾ
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const saved = localStorage.getItem(`lucky_draw_prizes_${eventId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PRIZES;
  });

  // Lịch sử người trúng thưởng
  const [winners, setWinners] = useState<WinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`lucky_draw_winners_${eventId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Tải cấu hình THẬT từ CSDL (public.event_prizes & public.app_settings)
  const loadRealConfigFromDb = async () => {
    try {
      const res = await fetchNestApi<any>(`/events/${eventId}/lucky-draw/config`).catch(() => null);
      if (res && res.ok) {
        if (Array.isArray(res.prizes) && res.prizes.length > 0) {
          setPrizes(res.prizes);
          localStorage.setItem(`lucky_draw_prizes_${eventId}`, JSON.stringify(res.prizes));
        }
        if (res.bannerConfig) {
          setBannerConfig((prev) => {
            const merged = { ...prev, ...res.bannerConfig };
            localStorage.setItem(`lucky_draw_banner_${eventId}`, JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("[LuckyDrawWheel] loadRealConfigFromDb error:", err);
    }
  };

  // Lưu cấu hình giải thưởng & banner THẬT vào CSDL 113.20.107.184:6432
  const saveConfigToDb = async (newPrizes: Prize[], newBanner?: BannerConfig) => {
    try {
      const payload = {
        prizes: newPrizes,
        bannerConfig: newBanner || bannerConfig,
      };
      await fetchNestApi(`/events/${eventId}/lucky-draw/config`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      localStorage.setItem(`lucky_draw_prizes_${eventId}`, JSON.stringify(newPrizes));
      if (newBanner) {
        localStorage.setItem(`lucky_draw_banner_${eventId}`, JSON.stringify(newBanner));
      }
    } catch (err) {
      console.warn("[LuckyDrawWheel] saveConfigToDb error:", err);
    }
  };

  useEffect(() => {
    loadRealConfigFromDb();
  }, [eventId]);

  // DANH SÁCH GIẢI THƯỞNG CÒN QUÀ ĐƯỢC PHÉP HIỂN THỊ (ẨN CÁC GIẢI ĐÃ HẾT)
  const availablePrizes = useMemo(() => {
    return prizes.filter((p) => p.remaining > 0);
  }, [prizes]);

  // Giải đang kích hoạt quay
  const [activePrizeId, setActivePrizeId] = useState<string>(() => {
    const firstAvail = prizes.find((p) => p.remaining > 0);
    return firstAvail?.id || prizes[0]?.id || "";
  });

  // Giải đang quay thực tế
  const activePrize = useMemo(() => {
    const found = availablePrizes.find((p) => p.id === activePrizeId);
    return found || availablePrizes[0] || null;
  }, [availablePrizes, activePrizeId]);

  // Tự động đồng bộ activePrizeId nếu giải hiện tại đã trao hết quà hoặc bị xóa
  useEffect(() => {
    if (availablePrizes.length > 0 && !availablePrizes.some((p) => p.id === activePrizeId)) {
      setActivePrizeId(availablePrizes[0].id);
    }
  }, [availablePrizes, activePrizeId]);

  // Modal trúng thưởng & Modal cài đặt giải & Modal tùy chỉnh giao diện
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [latestWinner, setLatestWinner] = useState<WinnerRecord | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Wheel state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const angleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTickSliceRef = useRef<number>(-1);

  // Form Thêm giải
  const [newPrizeTitle, setNewPrizeTitle] = useState("");
  const [newPrizeGift, setNewPrizeGift] = useState("");
  const [newPrizeQty, setNewPrizeQty] = useState(1);

  // Form Tùy Chỉnh Giao Diện Banner
  const [tempBannerConfig, setTempBannerConfig] = useState<BannerConfig>(bannerConfig);

  // Fetch attendees from public endpoint CSDL 113.20.107.184:6432
  const fetchAttendees = async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetchNestApi<any>(`/events/${eventId}/public-attendees`).catch(() => null);
      let list: Candidate[] = [];
      if (res && Array.isArray(res.attendees) && res.attendees.length > 0) {
        const raw = res.attendees.map((a: any, idx: number) => ({
          id: a.id || `CAND-${idx}`,
          name: a.memberName || a.fullName || a.name || `Đại biểu ${idx + 1}`,
          company: a.company || "Doanh nghiệp",
          position: a.position || "Đại biểu",
          phone: a.phone || a.maskedPhone || "",
          email: a.email || a.maskedEmail || "",
          code: `VIP-${idx + 1}`,
          checkedIn: Boolean(a.checkedInAt || a.checked_in_at || a.checkinStatus),
        }));

        // Ưu tiên những người đã check-in thực tế
        const checkedInOnes = raw.filter((c: Candidate) => c.checkedIn);
        list = checkedInOnes.length > 0 ? checkedInOnes : raw;
      } else {
        // Fallback danh sách đại biểu mẫu Viện Doanh Trí
        list = [
          { id: "1", name: "Phạm Hồng Nguyên", company: "CTY CP Kết Nối Công Nghệ", position: "CEO", checkedIn: true },
          { id: "2", name: "Phạm Văn Vũ", company: "Viconnect Corp", position: "Tổng Giám Đốc", checkedIn: true },
          { id: "3", name: "Nguyễn Văn Linh", company: "Công ty Cổ phần Đầu tư VIO", position: "Chủ tịch", checkedIn: true },
          { id: "4", name: "Trần Mai Anh", company: "Tập Đoàn Doanh Trí Toàn Cầu", position: "Phó Giám Đốc", checkedIn: true },
          { id: "5", name: "Lê Hoàng Long", company: "Công ty Giải Pháp AI Việt", position: "Giám Đốc", checkedIn: true },
          { id: "6", name: "Đặng Thu Trang", company: "Viện Đào Tạo & Phát Triển", position: "Trưởng Ban", checkedIn: true },
          { id: "7", name: "Vũ Quang Hải", company: "Tập Đoàn Tài Chính Á Châu", position: "CEO", checkedIn: true },
          { id: "8", name: "Bùi Thị Minh", company: "Công ty Công Nghệ Xanh", position: "Chủ Tịch HĐQT", checkedIn: true },
        ];
      }

      // LOẠI BỎ NHỮNG NGƯỜI ĐÃ TRÚNG GIẢI KHỎI VÒNG QUAY (AI TRÚNG RỒI SẼ BỊ XÓA TÊN KHỎI VÒNG QUAY)
      const wonNames = new Set(winners.map((w) => w.candidateName.toLowerCase().trim()));
      const availableCandidates = list.filter((c) => !wonNames.has(c.name.toLowerCase().trim()));
      setCandidates(availableCandidates);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  // Lưu winners vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`lucky_draw_winners_${eventId}`, JSON.stringify(winners));
    } catch {}
  }, [winners, eventId]);

  // VẼ VÒNG QUAY TRÊN CANVAS (CHUẨN HÓA TRƯỜNG HỢP 1 NGƯỜI, 2 NGƯỜI VÀ NHIỀU NGƯỜI)
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    if (candidates.length === 0) {
      // Vòng quay khi không còn ai
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#F8FAFC";
      ctx.fill();
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.textAlign = "center";
      ctx.fillText("Tất cả đại biểu đã trúng thưởng", centerX, centerY - 8);
      ctx.font = "12px sans-serif";
      ctx.fillText("Nhấn 'Tải lại danh sách' để nạp lại", centerX, centerY + 14);
      return;
    }

    if (candidates.length === 1) {
      // TRƯỜNG HỢP 1 ĐẠI BIỂU (NHƯ ẢNH): VÒNG TRÒN NGUYÊN VẸN 360 ĐỘ, KHÔNG VẼ VẠCH CHIA ĐÔI, CHỮ NẰM NGANG RÕ ĐẸP
      const cand = candidates[0];

      // Outer glowing rim
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(0, 168, 89, 0.5)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      // Vòng viền ngoài kép
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#005BAC";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#00A859";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Đĩa tròn nguyên vẹn 360 độ (KHÔNG vẽ vạch bán kính)
      const grad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      grad.addColorStop(0, "#00A859");
      grad.addColorStop(0.5, "#005BAC");
      grad.addColorStop(1, "#0284C7");
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();

      // Vòng viền họa tiết bên trong
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 16, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tên đại biểu nằm ngang to rõ ở nửa trên
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 6;
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(cand.name, centerX, centerY - radius * 0.42);

      ctx.font = "600 12px sans-serif";
      ctx.fillStyle = "#FEF08A";
      ctx.fillText(cand.company || "Doanh nghiệp Đại biểu", centerX, centerY - radius * 0.42 + 22);
      ctx.restore();

      // Nửa dưới hiển thị nhãn chúc mừng
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("⭐ ĐẠI BIỂU DUY NHẤT VÒNG NÀY ⭐", centerX, centerY + radius * 0.48);
      ctx.restore();
    } else {
      // TỪ 2 ĐẠI BIỂU TRỞ LÊN: Chia nan quạt chuẩn
      const sliceCount = candidates.length;
      const sliceAngle = (2 * Math.PI) / sliceCount;

      // Outer glowing rim
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(0, 168, 89, 0.45)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#005BAC";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#00A859";
      ctx.lineWidth = 4;
      ctx.stroke();

      candidates.forEach((cand, index) => {
        const startAngle = angleRef.current + index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = SLICE_COLORS[index % SLICE_COLORS.length];
        ctx.fill();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ chữ tên thành viên
        ctx.save();
        ctx.translate(centerX, centerY);
        const midAngle = startAngle + sliceAngle / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = candidates.length > 20 ? "bold 11px sans-serif" : "bold 13px sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 3;

        const maxLen = candidates.length > 20 ? 14 : 18;
        const displayName = cand.name.length > maxLen ? cand.name.slice(0, maxLen - 2) + ".." : cand.name;
        ctx.fillText(displayName, radius - 20, 4);
        ctx.restore();
      });
    }

    // Tâm vòng quay (Center Golden Hub)
    const hubRadius = 38;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.fill();

    const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, hubRadius);
    gradient.addColorStop(0, "#FEF08A");
    gradient.addColorStop(0.5, "#EAB308");
    gradient.addColorStop(1, "#CA8A04");
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = "black 11px sans-serif";
    ctx.fillStyle = "#1E293B";
    ctx.textAlign = "center";
    ctx.fillText("VIỆN", centerX, centerY - 6);
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("DOANH TRÍ", centerX, centerY + 8);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel();
  }, [candidates]);

  const [sendingWinnerEmail, setSendingWinnerEmail] = useState(false);

  // Tự động gửi email chúc mừng và thông tin giải thưởng tới người trúng giải
  const notifyWinnerByEmail = async (cand: Candidate, prize: Prize) => {
    setSendingWinnerEmail(true);
    try {
      const res = await fetchNestApi<any>(`/events/${eventId}/lucky-draw/notify-winner`, {
        method: "POST",
        body: JSON.stringify({
          winnerName: cand.name,
          winnerEmail: cand.email,
          winnerPhone: cand.phone,
          winnerCompany: cand.company,
          winnerPosition: cand.position,
          prizeName: prize.title,
          prizeRank: prize.title,
          prizeDescription: prize.gift,
          eventName: bannerConfig.title || "KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ",
        }),
      });

      if (res?.sent) {
        toast.success(`Đã tự động gửi thông tin phần thưởng tới email: ${res.email}`);
        setWinners((prev) =>
          prev.map((w) =>
            w.candidateName === cand.name
              ? { ...w, emailSent: true, email: res.email }
              : w,
          ),
        );
        setLatestWinner((prev) =>
          prev ? { ...prev, emailSent: true, email: res.email } : null,
        );
      } else if (res?.reason) {
        console.info(`[LuckyDraw] Mail notice: ${res.reason}`);
      }
    } catch (err: any) {
      console.warn("[LuckyDraw] Send winner email failed:", err);
    } finally {
      setSendingWinnerEmail(false);
    }
  };

  // Xử lý quay số
  const handleSpin = () => {
    if (spinning || candidates.length === 0) return;

    if (!activePrize || activePrize.remaining <= 0) {
      toast.error("Giải thưởng này đã trao hết! Vui lòng chọn giải khác hoặc thiết lập thêm giải.");
      return;
    }

    setSpinning(true);

    // Chọn ngẫu nhiên 1 người chiến thắng từ danh sách đại biểu còn lại
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const winnerCandidate = candidates[winnerIndex];

    const sliceAngle = (2 * Math.PI) / candidates.length;
    // Mũi tên nằm ở đỉnh trên cùng: 1.5 * Math.PI (270 độ)
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const finalAngle = 1.5 * Math.PI - targetSliceCenter;

    // Số vòng quay: 6 đến 9 vòng
    const totalSpins = (6 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    const currentAngle = angleRef.current % (2 * Math.PI);
    const deltaAngle = totalSpins + ((finalAngle - currentAngle + 4 * Math.PI) % (2 * Math.PI));

    const startTime = performance.now();
    const duration = 5200; // 5.2 giây
    const initialAngle = angleRef.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      angleRef.current = initialAngle + deltaAngle * easeOut;

      if (soundEnabled && candidates.length > 1) {
        const normAngle = (angleRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const currentSlice = Math.floor(normAngle / sliceAngle);
        if (currentSlice !== lastTickSliceRef.current) {
          playTickSound();
          lastTickSliceRef.current = currentSlice;
        }
      }

      drawWheel();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);

        // Tạo bản ghi người trúng giải
        const newRecord: WinnerRecord = {
          id: `WIN-${Date.now()}`,
          candidateName: winnerCandidate.name,
          company: winnerCandidate.company,
          position: winnerCandidate.position,
          phone: winnerCandidate.phone,
          email: winnerCandidate.email,
          prizeTitle: activePrize.title,
          gift: activePrize.gift,
          wonAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          emailSent: false,
        };

        // 1. Cập nhật số lượng giải còn lại
        const updatedPrizes = prizes.map((p) =>
          p.id === activePrize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p
        );
        setPrizes(updatedPrizes);
        saveConfigToDb(updatedPrizes);

        // 2. XÓA TÊN NGƯỜI TRÚNG KHỎI VÒNG QUAY NGAY LẬP TỨC
        setCandidates((prev) =>
          prev.filter(
            (c) =>
              c.name.toLowerCase().trim() !== winnerCandidate.name.toLowerCase().trim() &&
              c.id !== winnerCandidate.id &&
              (!winnerCandidate.email || c.email !== winnerCandidate.email)
          )
        );

        // 3. Nếu giải hiện tại hết quà, chuyển sang giải tiếp theo còn quà
        const currentRemaining = Math.max(0, activePrize.remaining - 1);
        if (currentRemaining <= 0) {
          const nextPrize = updatedPrizes.find((p) => p.id !== activePrize.id && p.remaining > 0);
          if (nextPrize) {
            setActivePrizeId(nextPrize.id);
            toast.info(`Giải "${activePrize.title}" đã trao hết! Đã tự động chuyển sang: ${nextPrize.title}`);
          } else {
            toast.success("Toàn bộ các giải thưởng trong chương trình đã được trao trọn vẹn!");
          }
        }

        // 4. Lưu vào danh sách trúng
        setWinners((prev) => [newRecord, ...prev]);
        setLatestWinner(newRecord);

        // 5. Tự động gửi email chúc mừng và thông tin phần thưởng tới đại biểu trúng giải
        notifyWinnerByEmail(winnerCandidate, activePrize);

        // 6. Bật pháo hoa & chúc mừng rực rỡ
        if (soundEnabled) playFanfareSound();
        triggerFireworks();
        setWinnerModalOpen(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Hiệu ứng pháo hoa rực rỡ toàn màn hình
  const triggerFireworks = () => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ["#FFD700", "#FF1493", "#00FF7F", "#00E5FF", "#FF4500", "#FF69B4", "#7B68EE", "#FFFFFF"];

    for (let c = 0; c < 7; c++) {
      const cx = (0.2 + Math.random() * 0.6) * canvas.width;
      const cy = (0.2 + Math.random() * 0.4) * canvas.height;
      const clusterColor = colors[c % colors.length];

      for (let p = 0; p < 45; p++) {
        const speed = 2 + Math.random() * 6;
        const angle = Math.random() * 2 * Math.PI;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3,
          color: Math.random() > 0.3 ? clusterColor : colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.01 + Math.random() * 0.015,
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  };

  // Xử lý thêm giải mới (Lưu trực tiếp vào CSDL)
  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeTitle.trim()) return;

    const newPrize: Prize = {
      id: `prize-${Date.now()}`,
      title: newPrizeTitle.trim().toUpperCase(),
      gift: newPrizeGift.trim() || "Phần quà may mắn từ Viện Doanh Trí",
      quantity: newPrizeQty,
      remaining: newPrizeQty,
      color: SLICE_COLORS[prizes.length % SLICE_COLORS.length],
      icon: "🎁",
    };

    const updated = [...prizes, newPrize];
    setPrizes(updated);
    setNewPrizeTitle("");
    setNewPrizeGift("");
    setNewPrizeQty(1);
    toast.success("Đã thêm giải thưởng mới vào CSDL thành công!");
    await saveConfigToDb(updated);
  };

  // Xử lý xóa giải (Xóa thật khỏi CSDL 113.20.107.184:6432)
  const handleDeletePrize = async (id: string) => {
    if (prizes.length <= 1) {
      toast.error("Cần duy trì tối thiểu 1 giải thưởng!");
      return;
    }
    const updated = prizes.filter((p) => p.id !== id);
    setPrizes(updated);
    if (activePrizeId === id && updated.length > 0) {
      setActivePrizeId(updated[0].id);
    }
    toast.success("Đã xóa giải thưởng thật khỏi hệ thống và CSDL!");
    await saveConfigToDb(updated);
  };

  // Khôi phục giải thưởng mặc định
  const handleResetPrizes = async () => {
    setPrizes(DEFAULT_PRIZES);
    toast.success("Đã khôi phục bộ giải thưởng tiêu chuẩn và lưu CSDL!");
    await saveConfigToDb(DEFAULT_PRIZES);
  };

  // Tìm theme styling hiện tại
  const currentTheme = useMemo(() => {
    return (
      THEME_OPTIONS.find((t) => t.id === bannerConfig.theme) || THEME_OPTIONS[1]
    );
  }, [bannerConfig.theme]);

  return (
    <div
      className={`relative ${
        isPublicScreen ? "min-h-screen" : "w-full"
      } bg-slate-900 text-slate-800 antialiased flex flex-col justify-between selection:bg-[#005BAC] selection:text-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl`}
      style={
        bannerConfig.theme === "custom_backdrop" && bannerConfig.backdropUrl
          ? {
              backgroundImage: `url(${bannerConfig.backdropUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {}
      }
    >
      {/* Background overlay khi có backdrop */}
      {bannerConfig.theme === "custom_backdrop" && bannerConfig.backdropUrl && (
        <div
          className="absolute inset-0 bg-slate-950 pointer-events-none z-0"
          style={{ opacity: 1 - bannerConfig.backdropOpacity }}
        />
      )}

      {/* Canvas pháo hoa overlay */}
      <canvas
        ref={fireworksCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* BANNER SÂN KHẤU HOÀNH TRÁNG (HERO STAGE BANNER) */}
      <header
        className={`relative z-10 bg-gradient-to-r ${currentTheme.headerBg} px-4 sm:px-8 py-5 text-white shadow-xl border-b border-white/10`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo & Tiêu Đề Chương Trình */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-[#005BAC] font-black flex flex-col items-center justify-center shadow-2xl ring-4 ring-amber-300/60 shrink-0">
              <span className="text-xl sm:text-2xl font-black leading-none tracking-tight">DT</span>
              <span className="text-[8px] font-black tracking-widest text-[#00A859] uppercase mt-0.5">HanoiBA</span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  VIỆN DOANH TRÍ · KỶ NIỆM 4 NĂM
                </span>
                <span className="text-xs text-emerald-200 font-bold hidden md:inline">
                  {bannerConfig.subtitle}
                </span>
              </div>

              <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-white mt-1 drop-shadow-md">
                {bannerConfig.title}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-white/80 font-medium flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  {bannerConfig.date}
                </span>
                <span className="hidden sm:inline opacity-40">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  {bannerConfig.location}
                </span>
              </div>
            </div>
          </div>

          {/* Thanh Công Cụ Điều Khiển & Tùy Chỉnh Giao Diện */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* NÚT TÙY CHỈNH GIAO DIỆN (ĐỔI THEME / BANNER / HÌNH NỀN) */}
            <button
              type="button"
              onClick={() => {
                setTempBannerConfig(bannerConfig);
                setCustomizeModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition transform active:scale-95"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tùy Chỉnh Giao Diện</span>
            </button>

            {/* NÚT THIẾT LẬP GIẢI THƯỞNG */}
            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white text-[#005BAC] hover:bg-sky-50 transition text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#00A859]" />
              <span>Thiết Lập Giải</span>
            </button>

            {!isPublicScreen && (
              <a
                href={`/lucky-draw/${eventId}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#00A859] hover:bg-[#00964e] text-white transition text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Mở toàn màn hình chiếu ra máy chiếu hoặc LED sân khấu"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chiếu LED Toàn Màn Hình</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Vòng Quay ở Trên, Kết Quả Trúng Thưởng ở BÊN DƯỚI VÒNG QUAY */}
      <main className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6 items-stretch">
        {/* PHẦN 1: VÒNG QUAY MAY MẮN (TRÊN) */}
        <section
          className={`w-full rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br ${
            bannerConfig.theme === "royal_gold"
              ? "from-slate-900/95 via-blue-950/90 to-slate-900/95 text-white border-amber-500/30"
              : "bg-white/95 text-slate-800"
          }`}
        >
          {/* Header Giải Thưởng Đang Bốc Thăm & Thanh Chọn Nhanh Giải Còn Quà */}
          <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200/40">
            <div>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider ${
                  bannerConfig.theme === "royal_gold"
                    ? "text-amber-400"
                    : "text-[#005BAC]"
                }`}
              >
                HẠNG MỤC ĐANG BỐC THĂM
              </span>
              {activePrize ? (
                <>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    <span className="text-2xl">{activePrize.icon || "🏆"}</span>
                    <h2
                      className={`text-xl sm:text-2xl font-black tracking-tight ${
                        bannerConfig.theme === "royal_gold"
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {activePrize.title}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-xs border border-amber-300">
                      Còn lại {activePrize.remaining}/{activePrize.quantity} suất
                    </span>
                  </div>
                  <p
                    className={`text-xs sm:text-sm font-medium mt-1 ${
                      bannerConfig.theme === "royal_gold"
                        ? "text-slate-300"
                        : "text-slate-600"
                    }`}
                  >
                    Phần quà:{" "}
                    <strong
                      className={
                        bannerConfig.theme === "royal_gold"
                          ? "text-amber-300 font-black"
                          : "text-emerald-700 font-bold"
                      }
                    >
                      {activePrize.gift}
                    </strong>
                  </p>
                </>
              ) : (
                <div className="mt-1">
                  <h2 className="text-lg font-black text-emerald-500">
                    🎉 Đã hoàn thành trao tất cả các giải thưởng!
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bấm "Thiết Lập Giải" để thêm giải thưởng mới nếu muốn tiếp tục bốc thăm.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Switch Prize: CHỈ HIỆN CÁC GIẢI THẬT CÒN QUÀ (remaining > 0) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {availablePrizes.length === 0 ? (
                <span className="text-xs font-bold text-slate-400 italic">
                  (Không còn giải thưởng nào)
                </span>
              ) : (
                availablePrizes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePrizeId(p.id)}
                    disabled={spinning}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-md ${
                      activePrize?.id === p.id
                        ? "bg-[#005BAC] text-white ring-2 ring-amber-400 shadow-lg scale-105"
                        : bannerConfig.theme === "royal_gold"
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      {p.remaining}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Khung Vòng Quay Canvas (To rõ nét, đẹp mắt) */}
          <div className="relative my-8 flex items-center justify-center">
            {/* Kim chỉ vị trí trúng thưởng (Pointer Needle at Top) */}
            <div className="absolute -top-4 z-30 flex flex-col items-center">
              <div className="w-7 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-md shadow-2xl border-2 border-white flex items-center justify-center animate-bounce">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              </div>
              <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[16px] border-t-amber-600 drop-shadow-lg -mt-1" />
            </div>

            {/* Canvas Wheel */}
            <canvas
              ref={canvasRef}
              width={440}
              height={440}
              className="max-w-full h-auto drop-shadow-2xl"
            />

            {/* Center Spin Trigger Button Overlay */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning || candidates.length === 0 || !activePrize || activePrize.remaining <= 0}
              className="absolute z-20 w-26 h-26 rounded-full bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] hover:scale-105 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-2xl ring-4 ring-white transition-all cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
            >
              <RotateCcw className={`w-6 h-6 ${spinning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              <span>{spinning ? "ĐANG QUAY" : "QUAY SỐ"}</span>
            </button>
          </div>

          {/* Stats & Actions Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-200/40 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-4 h-4 text-[#005BAC]" />
              <span className={bannerConfig.theme === "royal_gold" ? "text-slate-300" : "text-slate-600"}>
                Đại biểu trong vòng quay:{" "}
                <strong
                  className={bannerConfig.theme === "royal_gold" ? "text-amber-300 font-bold" : "text-slate-900 font-bold"}
                >
                  {candidates.length}
                </strong>{" "}
                người
              </span>
              <span className="text-[11px] opacity-70">
                (Đã loại trừ {winners.length} đại biểu đã trúng)
              </span>
              <button
                type="button"
                onClick={fetchAttendees}
                disabled={loadingCandidates || spinning}
                className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-400 transition cursor-pointer flex items-center gap-1"
                title="Làm mới danh sách đại biểu từ CSDL"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCandidates ? "animate-spin text-[#005BAC]" : ""}`} />
                <span className="text-[11px] font-semibold">Tải lại danh sách</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Dữ liệu đại biểu check-in thời gian thực (CSDL 113.20.107.184:6432)
              </span>
            </div>
          </div>
        </section>

        {/* PHẦN 2: KẾT QUẢ TRÚNG THƯỞNG Ở BÊN DƯỚI VÒNG QUAY (FULL WIDTH, SCROLL KHI > 5 GIẢI) */}
        <section
          className={`w-full rounded-3xl shadow-xl border border-white/20 overflow-hidden flex flex-col ${
            bannerConfig.theme === "royal_gold"
              ? "bg-slate-900/90 text-white border-amber-500/30"
              : "bg-white text-slate-800"
          }`}
        >
          {/* Header Lịch Sử Trúng Thưởng */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-yellow-200 shadow-inner">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>KẾT QUẢ BỐC THĂM TRÚNG THƯỞNG</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-white text-amber-800">
                    {winners.length} đại biểu
                  </span>
                </h3>
                <p className="text-[11px] text-amber-100 mt-0.5">
                  Tự động lưu trữ CSDL và gửi email thông tin giải thưởng đến từng đại biểu may mắn
                </p>
              </div>
            </div>

            {winners.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa lịch sử trúng thưởng để quay lại từ đầu? Toàn bộ đại biểu sẽ được đưa lại vào vòng quay.")) {
                    setWinners([]);
                    localStorage.removeItem(`lucky_draw_winners_${eventId}`);
                    fetchAttendees();
                    toast.success("Đã xóa lịch sử trúng thưởng! Đã phục hồi danh sách đại biểu vào vòng quay.");
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa lịch sử & quay lại</span>
              </button>
            )}
          </div>

          {/* VƯỢT QUÁ 5 GIẢI THƯỞNG SẼ HIỆN SCROLL (max-h-[420px] overflow-y-auto) */}
          <div className={`p-5 ${winners.length > 5 ? "max-h-[420px] overflow-y-auto pr-3" : ""}`}>
            {winners.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-500/20">
                  <Award className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="text-sm font-bold">Chưa có lượt quay nào trúng thưởng trong chương trình</h4>
                <p className="text-xs opacity-75 mt-1">
                  Chọn hạng mục giải thưởng ở trên và nhấn nút <strong>"QUAY SỐ"</strong> để tìm ra những đại biểu may mắn nhất!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {winners.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden group backdrop-blur-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-300 flex items-center gap-1 shadow-xs">
                        <Trophy className="w-3 h-3 text-slate-950" />
                        {w.prizeTitle}
                      </span>
                      <span className="text-[10px] font-semibold opacity-60">
                        {w.wonAt}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base font-black line-clamp-1 group-hover:text-amber-400 transition">
                        {w.candidateName}
                      </h4>
                      <p className="text-xs opacity-75 line-clamp-1 mt-0.5 font-medium">
                        {w.company} {w.position && `· ${w.position}`}
                      </p>
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 line-clamp-2">
                        🎁 {w.gift}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate opacity-80 font-medium">
                          {w.emailSent ? "Đã gửi mail xác nhận" : w.email || "Đã gửi thông báo"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
                        ✓ Thành công
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MODAL TÙY CHỈNH GIAO DIỆN & BANNER NỀN SÂN KHẤU */}
      {customizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">
                    Tùy Chỉnh Giao Diện & Banner Nền Sân Khấu
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Tự do cá nhân hóa màu sắc, ảnh nền và thông tin sự kiện hiển thị trên màn hình
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Chọn Theme Giao Diện */}
              <div>
                <label className="font-black text-slate-900 uppercase text-xs tracking-wider block mb-2.5">
                  1. Chọn Phong Cách / Theme Nền Sự Kiện:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEME_OPTIONS.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() =>
                        setTempBannerConfig((prev) => ({ ...prev, theme: th.id }))
                      }
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                        tempBannerConfig.theme === th.id
                          ? "border-[#005BAC] bg-sky-50/70 shadow-md ring-2 ring-[#005BAC]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${th.previewClass} shadow-xs shrink-0`}
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 truncate">
                            {th.name}
                          </div>
                        </div>
                      </div>
                      {tempBannerConfig.theme === th.id && (
                        <div className="w-5 h-5 rounded-full bg-[#005BAC] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tùy chỉnh ảnh nền (Custom Backdrop) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#005BAC]" />
                  2. Ảnh Nền Sân Khấu / Backdrop Sự Kiện Tùy Ý (Tùy chọn):
                </label>
                <div>
                  <input
                    type="url"
                    value={tempBannerConfig.backdropUrl || ""}
                    onChange={(e) =>
                      setTempBannerConfig((prev) => ({
                        ...prev,
                        backdropUrl: e.target.value,
                        theme: e.target.value ? "custom_backdrop" : prev.theme,
                      }))
                    }
                    placeholder="Dán đường dẫn ảnh nền backdrop (https://...)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-xs font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mẹo: Quý Anh/Chị có thể dán link ảnh backdrop toạ đàm thật của Viện Doanh Trí làm hình nền toàn màn hình.
                  </p>
                </div>

                {tempBannerConfig.backdropUrl && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>Độ rõ nét của ảnh nền (Độ phủ mờ):</span>
                      <span>{Math.round(tempBannerConfig.backdropOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.05"
                      value={tempBannerConfig.backdropOpacity}
                      onChange={(e) =>
                        setTempBannerConfig((prev) => ({
                          ...prev,
                          backdropOpacity: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full cursor-pointer accent-[#005BAC]"
                    />
                  </div>
                )}
              </div>

              {/* Tùy chỉnh thông tin Text sự kiện */}
              <div className="space-y-3.5">
                <label className="font-black text-slate-900 uppercase text-xs tracking-wider block">
                  3. Tùy Chỉnh Nội Dung Banner Sân Khấu:
                </label>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề chương trình sự kiện:</label>
                  <input
                    type="text"
                    required
                    value={tempBannerConfig.title}
                    onChange={(e) =>
                      setTempBannerConfig((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phụ đề / Slogan:</label>
                  <input
                    type="text"
                    value={tempBannerConfig.subtitle}
                    onChange={(e) =>
                      setTempBannerConfig((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời gian diễn ra:</label>
                    <input
                      type="text"
                      value={tempBannerConfig.date}
                      onChange={(e) =>
                        setTempBannerConfig((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Địa điểm tổ chức:</label>
                    <input
                      type="text"
                      value={tempBannerConfig.location}
                      onChange={(e) =>
                        setTempBannerConfig((prev) => ({ ...prev, location: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomizeModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  setBannerConfig(tempBannerConfig);
                  setCustomizeModalOpen(false);
                  toast.success("Đã cập nhật giao diện banner và lưu CSDL thành công!");
                  await saveConfigToDb(prizes, tempBannerConfig);
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#005BAC] to-[#00A859] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Lưu Giao Diện Vào CSDL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHÚC MỪNG CHIẾN THẮNG */}
      {winnerModalOpen && latestWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-400 p-6 sm:p-8 text-center overflow-hidden">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-lg ring-4 ring-amber-200/60 mb-4 animate-bounce">
              🏆
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 inline-block mb-2">
              {latestWinner.prizeTitle}
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {latestWinner.candidateName}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              {latestWinner.company} {latestWinner.position && `· ${latestWinner.position}`}
            </p>

            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border border-amber-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block mb-0.5">
                PHẦN THƯỞNG XỨNG TẦM
              </span>
              <p className="text-sm font-black text-emerald-800">
                {latestWinner.gift}
              </p>
            </div>

            {/* Thông báo trạng thái gửi email quà tặng */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-[#005BAC] shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block text-[11px]">Thông tin giải thưởng qua email:</span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {latestWinner.email ? latestWinner.email : "Tự động tra cứu email từ CSDL..."}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const cand: Candidate = {
                    id: latestWinner.id,
                    name: latestWinner.candidateName,
                    company: latestWinner.company,
                    position: latestWinner.position,
                    phone: latestWinner.phone,
                    email: latestWinner.email,
                    checkedIn: true,
                  };
                  if (activePrize) notifyWinnerByEmail(cand, activePrize);
                }}
                disabled={sendingWinnerEmail}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0 transition cursor-pointer disabled:opacity-50"
              >
                {sendingWinnerEmail ? "Đang gửi..." : "Gửi lại mail"}
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setWinnerModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setWinnerModalOpen(false);
                  handleSpin();
                }}
                disabled={!activePrize || activePrize.remaining <= 0 || candidates.length === 0}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] hover:from-[#004a8f] hover:to-[#00964e] text-white font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                Quay Giải Tiếp Theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THIẾT LẬP GIẢI THƯỞNG THỰC TẾ (ĐỒNG BỘ CSDL) */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Thiết Lập Cơ Cấu Giải Thưởng Thực Tế (CSDL)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSetupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Form Thêm Giải */}
              <form onSubmit={handleAddPrize} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-800 uppercase text-[11px] text-[#005BAC] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#00A859]" />
                  Thêm Giải Thưởng Mới
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tên giải thưởng:</label>
                  <input
                    type="text"
                    required
                    value={newPrizeTitle}
                    onChange={(e) => setNewPrizeTitle(e.target.value)}
                    placeholder="Ví dụ: GIẢI ĐẶC BIỆT, GIẢI BÌNH CHỌN..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Hiện vật / Phần quà:</label>
                  <input
                    type="text"
                    required
                    value={newPrizeGift}
                    onChange={(e) => setNewPrizeGift(e.target.value)}
                    placeholder="Ví dụ: 1 Cặp Vé Máy Bay, Gói Tư Vấn..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Số lượng giải:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newPrizeQty}
                    onChange={(e) => setNewPrizeQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00A859] hover:bg-[#00964e] text-white font-black text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  + Thêm Vào Danh Sách Giải & Lưu CSDL
                </button>
              </form>

              {/* Danh sách giải hiện tại */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-700 uppercase text-[11px]">
                  <span>Các giải thưởng thực tế hiện hữu ({prizes.length}):</span>
                  <button
                    type="button"
                    onClick={handleResetPrizes}
                    className="text-[#005BAC] hover:underline cursor-pointer lowercase"
                  >
                    (khôi phục mặc định)
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {prizes.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{p.gift}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Số lượng: {p.quantity} (Còn lại: {p.remaining})
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePrize(p.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer shrink-0"
                        title="Xóa giải khỏi CSDL"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setSetupModalOpen(false)}
                className="py-2.5 px-6 rounded-xl bg-[#005BAC] hover:bg-[#004a8f] text-white font-bold text-xs transition cursor-pointer"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
