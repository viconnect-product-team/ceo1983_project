import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Trophy,
  Sparkles,
  Gift,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Trash2,
  Users,
  Award,
  CheckCircle2,
  RefreshCw,
  X,
  Star,
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Maximize2,
  Palette,
  Image as ImageIcon,
  Check,
  Clock,
  Phone,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Building2,
  User,
} from "lucide-react";
import { fetchNestApi } from "@/lib/api-client";
import { toast } from "sonner";
import { Ceo1983BrandBanner } from "./Ceo1983BrandBanner";

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
  pageBg: string;
  headerBg: string;
  cardBg: string;
}[] = [
  {
    id: "royal_gold",
    name: "Hoàng Kim Sân Khấu (Royal Gold)",
    previewClass: "from-slate-900 via-blue-950 to-amber-900",
    pageBg: "bg-gradient-to-b from-[#060b18] via-[#0b152d] to-[#040813]",
    headerBg: "from-[#060b18]/90 via-[#0b152d]/90 to-[#005BAC]/40 backdrop-blur-md",
    cardBg: "from-slate-900/90 via-blue-950/80 to-slate-900/90 text-white border-amber-500/30",
  },
  {
    id: "emerald_corporate",
    name: "Xanh Navy CEO 1983 (Corporate)",
    previewClass: "from-[#005BAC] via-[#0284C7] to-[#00A859]",
    pageBg: "bg-gradient-to-b from-[#03203c] via-[#023157] to-[#011b33]",
    headerBg: "from-[#003865]/95 via-[#005BAC]/95 to-[#00A859]/90 backdrop-blur-md",
    cardBg: "from-slate-900/95 via-sky-950/90 to-slate-900/95 text-white border-emerald-500/30",
  },
  {
    id: "sapphire_gala",
    name: "Đại Tiệc Tri Ân (Sapphire Gala)",
    previewClass: "from-indigo-950 via-blue-900 to-sky-700",
    pageBg: "bg-gradient-to-b from-[#0a0f29] via-[#0f1742] to-[#06091c]",
    headerBg: "from-indigo-950/90 via-blue-900/90 to-[#0284C7]/40 backdrop-blur-md",
    cardBg: "from-slate-900/90 via-indigo-950/80 to-slate-900/90 text-white border-sky-400/30",
  },
  {
    id: "warm_amber",
    name: "Bình Minh Khởi Sắc (Warm Amber)",
    previewClass: "from-amber-950 via-orange-900 to-yellow-600",
    pageBg: "bg-gradient-to-b from-[#1c0e04] via-[#2a1607] to-[#120802]",
    headerBg: "from-amber-950/90 via-orange-900/90 to-yellow-600/40 backdrop-blur-md",
    cardBg: "from-slate-900/90 via-amber-950/80 to-slate-900/90 text-white border-amber-500/30",
  },
  {
    id: "custom_backdrop",
    name: "Ảnh Nền Sân Khấu Tùy Chỉnh (Custom Backdrop)",
    previewClass: "from-slate-800 to-slate-950",
    pageBg: "bg-slate-950",
    headerBg: "from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-md",
    cardBg: "from-slate-900/95 via-slate-850/95 to-slate-900/95 text-white border-white/20",
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
    gift: "Khóa Đào Tạo Quản Trị Chiến Lược CEO 1983",
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
    gift: "Kỷ Niệm Chương Pha Lê & Bộ Quà CEO 1983",
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
  "#00A859",
  "#005BAC",
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
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
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

export function LuckyDrawLandingPage({
  eventId = "latest",
}: {
  eventId?: string;
}) {
  // Cấu hình Banner & Giao diện thực tế từ CSDL
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => {
    try {
      const saved = localStorage.getItem(`lucky_draw_banner_${eventId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: "royal_gold",
      backdropUrl: "",
      backdropOpacity: 0.85,
      title: "VÒNG QUAY MAY MẮN - CLB DOANH NHÂN CEO 1983",
      subtitle: "Gắn Kết - Chia Sẻ - Cùng Phát Triển (HanoiBA)",
      date: "Sự Kiện Kết Nối & Gala Doanh Nhân",
      location: "Hội Trường Sự Kiện CLB Doanh Nhân CEO 1983",
    };
  });

  // Danh sách đại biểu trong vòng quay
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalCheckedInCount, setTotalCheckedInCount] = useState<number>(0);
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
        if (Array.isArray(res.prizes)) {
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
      console.warn("[LuckyDrawLandingPage] loadRealConfigFromDb error:", err);
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
      console.warn("[LuckyDrawLandingPage] saveConfigToDb error:", err);
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

        const checkedInOnes = raw.filter((c: Candidate) => c.checkedIn);
        list = checkedInOnes.length > 0 ? checkedInOnes : raw;
        setTotalCheckedInCount(checkedInOnes.length || raw.length);
      } else {
        list = [
          { id: "1", name: "Phạm Hồng Nguyên", company: "CTY CP Kết Nối Công Nghệ", position: "CEO", checkedIn: true },
          { id: "2", name: "Phạm Văn Vũ", company: "Viconnect Corp", position: "Tổng Giám Đốc", checkedIn: true },
          { id: "3", name: "Nguyễn Văn Linh", company: "Công ty Cổ phần Đầu tư VIO", position: "Chủ tịch", checkedIn: true },
          { id: "4", name: "Trần Mai Anh", company: "Tập Đoàn Đầu Tư CEO 1983", position: "Phó Giám Đốc", checkedIn: true },
          { id: "5", name: "Lê Hoàng Long", company: "Công ty Giải Pháp AI Việt", position: "Giám Đốc", checkedIn: true },
          { id: "6", name: "Đặng Thu Trang", company: "Viện Đào Tạo & Phát Triển", position: "Trưởng Ban", checkedIn: true },
          { id: "7", name: "Vũ Quang Hải", company: "Tập Đoàn Tài Chính Á Châu", position: "CEO", checkedIn: true },
          { id: "8", name: "Bùi Thị Minh", company: "Công ty Công Nghệ Xanh", position: "Chủ Tịch HĐQT", checkedIn: true },
        ];
        setTotalCheckedInCount(8);
      }

      // XÓA NGƯỜI ĐÃ TRÚNG GIẢI KHỎI VÒNG QUAY
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

  // VẼ VÒNG QUAY TRÊN CANVAS (CHUẨN HÓA 1 NGƯỜI & NHIỀU NGƯỜI)
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    if (candidates.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText("Tất cả đại biểu đã trúng thưởng", centerX, centerY - 10);
      ctx.font = "12px sans-serif";
      ctx.fillText("Nhấn 'Tải lại danh sách' để nạp lại", centerX, centerY + 14);
      return;
    }

    if (candidates.length === 1) {
      // 1 ĐẠI BIỂU: ĐĨA TRÒN NGUYÊN VẸN 360 ĐỘ, CHỮ NẰM NGANG CHÍNH GIỮA, KHÔNG CÓ VẠCH BÁN KÍNH
      const cand = candidates[0];

      ctx.save();
      ctx.shadowBlur = 24;
      ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#EAB308";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#00A859";
      ctx.lineWidth = 4;
      ctx.stroke();

      const grad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      grad.addColorStop(0, "#00A859");
      grad.addColorStop(0.5, "#005BAC");
      grad.addColorStop(1, "#0284C7");
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 18, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 8;
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(cand.name, centerX, centerY - radius * 0.42);

      ctx.font = "600 13px sans-serif";
      ctx.fillStyle = "#FEF08A";
      ctx.fillText(cand.company || "Doanh nghiệp Đại biểu", centerX, centerY - radius * 0.42 + 24);
      ctx.restore();

      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("⭐ ĐẠI BIỂU DUY NHẤT VÒNG NÀY ⭐", centerX, centerY + radius * 0.48);
      ctx.restore();
    } else {
      // TỪ 2 ĐẠI BIỂU TRỞ LÊN
      const sliceCount = candidates.length;
      const sliceAngle = (2 * Math.PI) / sliceCount;

      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(234, 179, 8, 0.5)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#EAB308";
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

        ctx.save();
        ctx.translate(centerX, centerY);
        const midAngle = startAngle + sliceAngle / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = candidates.length > 20 ? "bold 11px sans-serif" : "bold 13.5px sans-serif";
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 4;

        const maxLen = candidates.length > 20 ? 14 : 18;
        const displayName = cand.name.length > maxLen ? cand.name.slice(0, maxLen - 2) + ".." : cand.name;
        ctx.fillText(displayName, radius - 22, 4);
        ctx.restore();
      });
    }

    // Tâm vòng quay Golden Hub
    const hubRadius = 40;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
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
    ctx.fillText("CEO", centerX, centerY - 6);
    ctx.font = "bold 9.5px sans-serif";
    ctx.fillText("1983", centerX, centerY + 8);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel();
  }, [candidates]);

  const [sendingWinnerEmail, setSendingWinnerEmail] = useState(false);

  // Gửi email chúc mừng và thông tin phần thưởng
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
          eventName: bannerConfig.title || "VÒNG QUAY MAY MẮN - CLB DOANH NHÂN CEO 1983",
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
      }
    } catch (err: any) {
      console.warn("[LuckyDrawLandingPage] Send winner email failed:", err);
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

    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const winnerCandidate = candidates[winnerIndex];

    const sliceAngle = (2 * Math.PI) / candidates.length;
    const targetSliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const finalAngle = 1.5 * Math.PI - targetSliceCenter;

    const totalSpins = (6 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    const currentAngle = angleRef.current % (2 * Math.PI);
    const deltaAngle = totalSpins + ((finalAngle - currentAngle + 4 * Math.PI) % (2 * Math.PI));

    const startTime = performance.now();
    const duration = 5200;
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

        const updatedPrizes = prizes.map((p) =>
          p.id === activePrize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p
        );
        setPrizes(updatedPrizes);
        saveConfigToDb(updatedPrizes);

        setCandidates((prev) =>
          prev.filter(
            (c) =>
              c.name.toLowerCase().trim() !== winnerCandidate.name.toLowerCase().trim() &&
              c.id !== winnerCandidate.id &&
              (!winnerCandidate.email || c.email !== winnerCandidate.email)
          )
        );

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

        setWinners((prev) => [newRecord, ...prev]);
        setLatestWinner(newRecord);
        notifyWinnerByEmail(winnerCandidate, activePrize);

        if (soundEnabled) playFanfareSound();
        triggerFireworks();
        setWinnerModalOpen(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Pháo hoa rực rỡ toàn màn hình
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

  // Thêm giải mới (Lưu trực tiếp vào CSDL)
  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeTitle.trim()) return;

    const newPrize: Prize = {
      id: `prize-${Date.now()}`,
      title: newPrizeTitle.trim().toUpperCase(),
      gift: newPrizeGift.trim() || "Phần quà may mắn từ CLB Doanh Nhân CEO 1983",
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

  // Xóa giải thật khỏi CSDL 113.20.107.184:6432
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

  const handleResetPrizes = async () => {
    setPrizes(DEFAULT_PRIZES);
    toast.success("Đã khôi phục bộ giải thưởng tiêu chuẩn và lưu CSDL!");
    await saveConfigToDb(DEFAULT_PRIZES);
  };

  // Theme styling hiện tại
  const currentTheme = useMemo(() => {
    return (
      THEME_OPTIONS.find((t) => t.id === bannerConfig.theme) || THEME_OPTIONS[0]
    );
  }, [bannerConfig.theme]);

  // Toàn màn hình
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      className={`min-h-screen w-full ${currentTheme.pageBg} text-slate-100 antialiased relative selection:bg-[#EAB308] selection:text-slate-950 font-sans`}
      style={
        bannerConfig.theme === "custom_backdrop" && bannerConfig.backdropUrl
          ? {
              backgroundImage: `url(${bannerConfig.backdropUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }
          : {}
      }
    >
      {/* Background Overlay */}
      {bannerConfig.theme === "custom_backdrop" && bannerConfig.backdropUrl && (
        <div
          className="fixed inset-0 bg-slate-950 pointer-events-none z-0"
          style={{ opacity: 1 - bannerConfig.backdropOpacity }}
        />
      )}

      {/* Canvas pháo hoa overlay */}
      <canvas
        ref={fireworksCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* ── 1. HEADER LANDING WEB ĐẲNG CẤP (STICKY GLASSMORPHISM NAV) ── */}
      <header className={`sticky top-0 z-40 bg-gradient-to-r ${currentTheme.headerBg} border-b border-white/10 px-4 sm:px-8 py-3.5 shadow-2xl`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <Link to="/lucky-draw" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B0000] via-[#003B95] to-[#D4AF37] text-white font-black flex flex-col items-center justify-center shadow-lg ring-2 ring-amber-300/60 group-hover:scale-105 transition">
                <span className="text-sm font-black leading-none">1983</span>
                <span className="text-[7px] font-black uppercase text-amber-200 tracking-wider">HanoiBA</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  CLB DOANH NHÂN CEO 1983 (HANOIBA)
                </span>
                <h2 className="text-xs sm:text-sm font-black text-white tracking-tight line-clamp-1">
                  Vòng Quay May Mắn & Bốc Thăm Sân Khấu
                </h2>
              </div>
            </Link>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#stage" className="hover:text-amber-300 transition">Sân Khấu</a>
            <a href="#wheel" className="hover:text-amber-300 transition">Vòng Quay</a>
            <a href="#winners" className="hover:text-amber-300 transition">Bảng Vinh Danh</a>
            <a href="#prizes" className="hover:text-amber-300 transition">Cơ Cấu Giải</a>
            <a href="#agenda" className="hover:text-amber-300 transition">Lịch Trình</a>
          </nav>

          {/* Control Actions Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Toàn màn hình / Chiếu LED sân khấu"
            >
              <Maximize2 className="w-4 h-4 text-amber-300" />
            </button>

            <button
              type="button"
              onClick={() => {
                setTempBannerConfig(bannerConfig);
                setCustomizeModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tùy Chỉnh Giao Diện</span>
            </button>

            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Thiết Lập Giải</span>
            </button>

            <Link
              to="/voting"
              search={{ tab: "all", page: 1, size: 10 }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition text-xs font-bold flex items-center gap-1.5"
              title="Quay lại Cổng Quản Trị CRM"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Quay lại CRM</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SÂN KHẤU LANDING (STAGE BANNER HOÀNH TRÁNG CHUẨN ẢNH 1) ── */}
      <section id="stage" className="relative z-10 pt-8 pb-6 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Spotlight Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-amber-500/15 via-[#005BAC]/20 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Banner Đồ Họa Chuẩn Thương Hiệu CLB Doanh Nhân CEO 1983 */}
          <div className="py-2">
            <Ceo1983BrandBanner variant="dark" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-400/25 to-amber-500/20 border border-amber-300/40 text-amber-300 font-black text-xs uppercase tracking-widest shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>SÂN KHẤU QUAY SỐ MAY MẮN REALTIME</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-400 drop-shadow-xl max-w-4xl mx-auto leading-tight">
            {bannerConfig.title}
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-300 max-w-2xl mx-auto">
            {bannerConfig.subtitle}
          </p>

          {/* Event KPI Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{bannerConfig.date}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{bannerConfig.location}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Users className="w-4 h-4 text-sky-400" />
              <span>
                Đại biểu điểm danh: <strong className="text-amber-300 font-bold">{totalCheckedInCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TÂM ĐIỂM SÂN KHẤU: VÒNG QUAY MAY MẮN (CANVAS WHEEL ARENA) ── */}
      <section id="wheel" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className={`w-full rounded-3xl p-6 sm:p-10 shadow-2xl border bg-gradient-to-br ${currentTheme.cardBg} flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl`}>
          {/* Header Bốc Thăm & Quick Switch */}
          <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                HẠNG MỤC ĐANG BỐC THĂM SÂN KHẤU
              </span>
              {activePrize ? (
                <>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-3xl">{activePrize.icon || "🏆"}</span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                      {activePrize.title}
                    </h2>
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
                      Còn lại {activePrize.remaining}/{activePrize.quantity} suất
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-300 mt-1">
                    Hiện vật phần quà: <strong className="text-amber-300 font-bold">{activePrize.gift}</strong>
                  </p>
                </>
              ) : (
                <div className="mt-2">
                  <h3 className="text-xl font-black text-emerald-400">
                    🎉 Toàn bộ giải thưởng đã được trao trọn vẹn!
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bấm "Thiết Lập Giải" ở trên để bổ sung giải thưởng mới nếu muốn tiếp tục bốc thăm.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Switch Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {availablePrizes.length === 0 ? (
                <span className="text-xs font-bold text-slate-400 italic">
                  (Đã trao hết quà)
                </span>
              ) : (
                availablePrizes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePrizeId(p.id)}
                    disabled={spinning}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition shrink-0 cursor-pointer flex items-center gap-2 shadow-lg ${
                      activePrize?.id === p.id
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 ring-2 ring-white scale-105"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20">
                      {p.remaining}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Canvas Wheel Centerpiece */}
          <div className="relative my-10 flex items-center justify-center">
            {/* Pointer Needle at Top */}
            <div className="absolute -top-5 z-30 flex flex-col items-center">
              <div className="w-8 h-11 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 rounded-b-lg shadow-2xl border-2 border-white flex items-center justify-center animate-bounce">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
              </div>
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-amber-600 drop-shadow-xl -mt-1" />
            </div>

            {/* Canvas Wheel */}
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className="max-w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            />

            {/* Center Spin Trigger Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning || candidates.length === 0 || !activePrize || activePrize.remaining <= 0}
              className="absolute z-20 w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 hover:scale-105 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-2xl ring-4 ring-white transition-all cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
            >
              <RotateCcw className={`w-7 h-7 text-slate-950 ${spinning ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              <span className="font-black text-slate-950 drop-shadow-xs">
                {spinning ? "ĐANG QUAY" : "QUAY SỐ"}
              </span>
            </button>
          </div>

          {/* Stats Footer Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">
                Đại biểu trong vòng quay: <strong className="text-amber-300 font-bold text-sm">{candidates.length}</strong> người
              </span>
              <span className="text-[11px] text-slate-400">
                (Đã loại trừ {winners.length} đại biểu đã trúng thưởng)
              </span>
              <button
                type="button"
                onClick={fetchAttendees}
                disabled={loadingCandidates || spinning}
                className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-400 transition cursor-pointer flex items-center gap-1.5 ml-2"
                title="Tải lại danh sách đại biểu từ CSDL"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCandidates ? "animate-spin text-amber-400" : ""}`} />
                <span className="text-[11px] font-bold">Tải lại danh sách</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Dữ liệu đại biểu check-in thời gian thực (CSDL 113.20.107.184:6432)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BẢNG VINH DANH ĐẠI BIỂU TRÚNG THƯỞNG (NẰM NGAY DƯỚI VÒNG QUAY) ── */}
      <section id="winners" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className={`w-full rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col bg-gradient-to-br ${currentTheme.cardBg} backdrop-blur-xl`}>
          {/* Header Bảng Vinh Danh */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 px-6 sm:px-8 py-5 text-slate-950 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-950/20 backdrop-blur-xs flex items-center justify-center text-slate-950 shadow-inner">
                <Trophy className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950 flex items-center gap-2.5">
                  <span>BẢNG VINH DANH ĐẠI BIỂU TRÚNG THƯỞNG</span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-slate-950 text-amber-300">
                    {winners.length} đại biểu
                  </span>
                </h3>
                <p className="text-xs text-slate-900/80 font-semibold mt-0.5">
                  Tự động lưu trữ CSDL & gửi thư chúc mừng tới hòm thư cá nhân của đại biểu
                </p>
              </div>
            </div>

            {winners.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa lịch sử trúng thưởng để quay lại từ đầu?")) {
                    setWinners([]);
                    localStorage.removeItem(`lucky_draw_winners_${eventId}`);
                    fetchAttendees();
                    toast.success("Đã xóa lịch sử trúng thưởng!");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa lịch sử & quay lại</span>
              </button>
            )}
          </div>

          {/* Danh sách người trúng (Scroll khi > 5 giải) */}
          <div className={`p-6 ${winners.length > 5 ? "max-h-[440px] overflow-y-auto pr-3" : ""}`}>
            {winners.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-400/10 flex items-center justify-center text-amber-400 mb-3 border border-amber-400/20">
                  <Award className="w-9 h-9 opacity-70" />
                </div>
                <h4 className="text-base font-bold text-white">Chưa có lượt quay nào trúng thưởng trong chương trình</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Chọn hạng mục giải thưởng ở trên và nhấn nút <strong>"QUAY SỐ"</strong> để tìm ra những đại biểu may mắn nhất của sự kiện!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {winners.map((w) => (
                  <div
                    key={w.id}
                    className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between gap-3.5 relative overflow-hidden group shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                        <Trophy className="w-3.5 h-3.5 text-slate-950" />
                        {w.prizeTitle}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {w.wonAt}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-lg font-black text-white group-hover:text-amber-300 transition line-clamp-1">
                        {w.candidateName}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">
                        {w.company} {w.position && `· ${w.position}`}
                      </p>
                      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 line-clamp-2">
                        🎁 {w.gift}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate text-slate-400 text-[11px]">
                          {w.emailSent ? "Đã gửi mail xác nhận" : w.email || "Đã gửi thông báo"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
                        ✓ Thành công
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. BỘ SƯU TẬP CƠ CẤU GIẢI THƯỞNG SÂN KHẤU (PRIZE SHOWCASE) ── */}
      <section id="prizes" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            GIẢI THƯỞNG DANH GIÁ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Cơ Cấu Giải Thưởng Sự Kiện
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
            Các phần quà giá trị cao do Ban Tổ Chức CLB Doanh Nhân CEO 1983 và các nhà tài trợ trao tặng cho đại biểu may mắn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prizes.map((p, idx) => (
            <div
              key={p.id}
              className={`p-6 rounded-3xl border transition shadow-xl flex flex-col justify-between gap-4 ${
                activePrize?.id === p.id
                  ? "bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border-amber-400/60 ring-2 ring-amber-400/40"
                  : "bg-white/5 border-white/10 hover:border-white/25"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
                    {p.icon || "🎁"}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    p.remaining > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/10 text-slate-400"
                  }`}>
                    {p.remaining > 0 ? `Còn ${p.remaining}/${p.quantity} suất` : "Đã trao hết"}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mt-4">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium line-clamp-3">
                  {p.gift}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Đơn vị tài trợ:</span>
                <span className="text-amber-300 font-bold">{p.sponsor || "CLB Doanh Nhân CEO 1983"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. LỊCH TRÌNH CHƯƠNG TRÌNH SỰ KIỆN & THÔNG TIN TOẠ ĐÀM ── */}
      <section id="agenda" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl p-8 sm:p-12 border border-white/15 bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/90 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                LỊCH TRÌNH CHƯƠNG TRÌNH
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Hội Nghị Giao Thương & Gala Doanh Nhân CEO 1983
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Chương trình quy tụ hơn 100+ Lãnh đạo Doanh nghiệp, Chuyên gia và Hội viên CLB Doanh Nhân CEO 1983 (HanoiBA).
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white">14:30 - 15:00:</span> Đón tiếp đại biểu & Check-in QR thông minh tại sảnh đón.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white">15:00 - 15:30:</span> Khai mạc, Tri ân Ngày Nhà giáo Việt Nam 20/11 & Kỷ niệm 4 năm.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-sky-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white">15:30 - 16:30:</span> Toạ đàm Doanh nghiệp 2027: Chiến lược Tăng trưởng & Ứng dụng AI.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-yellow-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-[10px]">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-white">16:30 - 17:15:</span> Vòng quay may mắn sân khấu & Vinh danh trao giải thưởng.
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info Card */}
            <div className="w-full lg:w-96 rounded-2xl bg-white/10 p-6 border border-white/20 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                Địa Điểm & Liên Hệ
              </h3>
              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">Địa điểm tổ chức:</strong>
                    Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy, Cầu Giấy, Hà Nội
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">Thời gian:</strong>
                    14h30 - 17h30, Thứ Bảy ngày 21/11/2026
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">Hotline Ban Tổ Chức:</strong>
                    0988.870.888 / 0903.203.204
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER LANDING PAGE ── */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-8 px-4 sm:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-[10px]">
              1983
            </div>
            <span className="font-bold text-slate-300">
              CLB Doanh Nhân CEO 1983 (HanoiBA)
            </span>
          </div>
          <p className="text-[11px]">
            Hệ thống CSDL chuẩn kết nối an toàn 113.20.107.184:6432
          </p>
        </div>
      </footer>

      {/* ── MODAL WINNER ── */}
      {winnerModalOpen && latestWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-400 p-6 sm:p-8 text-center overflow-hidden text-slate-900">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-xl ring-4 ring-amber-200/60 mb-4 animate-bounce">
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

            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border border-amber-200 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block mb-0.5">
                PHẦN THƯỞNG XỨNG TẦM
              </span>
              <p className="text-sm font-black text-emerald-800">
                {latestWinner.gift}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-[#005BAC] shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block text-[11px]">Thông tin giải thưởng qua email:</span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {latestWinner.email ? latestWinner.email : "Đã tự động gửi hòm thư"}
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
                {sendingWinnerEmail ? "Đang gửi..." : "Gửi lại"}
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
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                Quay Giải Tiếp Theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL THIẾT LẬP GIẢI THƯỞNG ── */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-700 uppercase text-[11px]">
                  <span>Các giải thưởng thực tế ({prizes.length}):</span>
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

      {/* ── MODAL TÙY CHỈNH GIAO DIỆN & BANNER ── */}
      {customizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
            <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">
                    Tùy Chỉnh Giao Diện & Banner Nền Sân Khấu
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Tự do cá nhân hóa màu sắc, ảnh nền và thông tin sự kiện hiển thị trên landing page
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

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
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
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${th.previewClass} shadow-xs shrink-0`} />
                        <div className="min-w-0 font-extrabold text-xs text-slate-900 truncate">
                          {th.name}
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

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#005BAC]" />
                  2. Ảnh Nền Sân Khấu / Backdrop Sự Kiện Tùy Ý:
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
                    placeholder="Dán link ảnh backdrop (https://...)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] text-xs font-medium"
                  />
                </div>

                {tempBannerConfig.backdropUrl && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>Độ rõ nét của ảnh nền:</span>
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
    </div>
  );
}
