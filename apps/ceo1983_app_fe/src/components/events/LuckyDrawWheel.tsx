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
  const [currentEvent, setCurrentEvent] = useState<any>(initialEvent || {
    id: eventId,
    name: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11",
    title: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11",
    date: "2026-11-21",
    time: "14h30 - 17h30, Thứ 7, ngày 21/11/2026",
    location: "Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy",
  });

  // Danh sách đại biểu trong vòng quay
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Danh sách giải thưởng
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const saved = localStorage.getItem(`lucky_draw_prizes_${eventId}`);
      if (saved) return JSON.parse(saved);
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

  // DANH SÁCH GIẢI THƯỞNG CÒN QUÀ ĐƯỢC PHÉP HIỂN THỊ (ẨN GIẢI ĐÃ TRAO HẾT)
  const availablePrizes = useMemo(() => {
    return prizes.filter((p) => p.remaining > 0);
  }, [prizes]);

  // Giải đang kích hoạt quay
  const [activePrizeId, setActivePrizeId] = useState<string>(() => {
    const firstAvail = prizes.find((p) => p.remaining > 0);
    return firstAvail?.id || prizes[0]?.id || "p-dac-biet";
  });

  // Giải đang quay thực tế
  const activePrize = useMemo(() => {
    const found = availablePrizes.find((p) => p.id === activePrizeId);
    return found || availablePrizes[0] || null;
  }, [availablePrizes, activePrizeId]);

  // Tự động đồng bộ activePrizeId nếu giải hiện tại đã trao hết quà
  useEffect(() => {
    if (availablePrizes.length > 0 && !availablePrizes.some((p) => p.id === activePrizeId)) {
      setActivePrizeId(availablePrizes[0].id);
    }
  }, [availablePrizes, activePrizeId]);

  // Modal trúng thưởng & Modal cài đặt giải
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [latestWinner, setLatestWinner] = useState<WinnerRecord | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
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

  // Fetch attendees from public endpoint
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

  // Lưu prizes vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`lucky_draw_prizes_${eventId}`, JSON.stringify(prizes));
    } catch {}
  }, [prizes, eventId]);

  // Lưu winners vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`lucky_draw_winners_${eventId}`, JSON.stringify(winners));
    } catch {}
  }, [winners, eventId]);

  // Vẽ vòng quay trên Canvas
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
      // Vòng quay khi không còn ai hoặc chưa có người
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
      ctx.fillText("Nhấn 'Làm mới' để nạp lại danh sách", centerX, centerY + 14);
      return;
    }

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

    // Vòng viền ngoài kép (Trắng & Xanh dương / Xanh lá)
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

    // Vẽ từng nan quạt (slices)
    candidates.forEach((cand, index) => {
      const startAngle = angleRef.current + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Màu xen kẽ
      ctx.fillStyle = SLICE_COLORS[index % SLICE_COLORS.length];
      ctx.fill();

      // Viền trắng phân cách nan
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vẽ chữ tên thành viên
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
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
          eventName: currentEvent?.name || "KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ",
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

      // Easing out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      angleRef.current = initialAngle + deltaAngle * easeOut;

      // Tính âm thanh click khi qua nan quạt
      if (soundEnabled) {
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

        // 1. Cập nhật số lượng giải còn lại (nếu về 0 giải sẽ bị ẩn khỏi giao diện)
        const updatedPrizes = prizes.map((p) =>
          p.id === activePrize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p
        );
        setPrizes(updatedPrizes);

        // 2. XÓA TÊN NGƯỜI TRÚNG KHỎI VÒNG QUAY NGAY LẬP TỨC
        setCandidates((prev) =>
          prev.filter(
            (c) =>
              c.name.toLowerCase().trim() !== winnerCandidate.name.toLowerCase().trim() &&
              c.id !== winnerCandidate.id &&
              (!winnerCandidate.email || c.email !== winnerCandidate.email)
          )
        );

        // 3. Nếu giải hiện tại hết quà, chuyển sang giải tiếp theo còn quà (giải hết quà sẽ biến mất khỏi giao diện)
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

    // Bắn 7 cụm pháo hoa ở các vị trí khác nhau
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
          p.vy += 0.08; // Trọng lực
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

  const handleAddPrize = (e: React.FormEvent) => {
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

    setPrizes([...prizes, newPrize]);
    setNewPrizeTitle("");
    setNewPrizeGift("");
    setNewPrizeQty(1);
    toast.success("Đã thêm giải thưởng mới thành công!");
  };

  const handleDeletePrize = (id: string) => {
    if (prizes.length <= 1) {
      toast.error("Cần duy trì tối thiểu 1 giải thưởng!");
      return;
    }
    setPrizes(prizes.filter((p) => p.id !== id));
    toast.success("Đã xóa giải thưởng!");
  };

  const handleResetPrizes = () => {
    setPrizes(DEFAULT_PRIZES);
    toast.success("Đã khôi phục bộ giải thưởng mặc định!");
  };

  return (
    <div className={`relative ${isPublicScreen ? "min-h-screen" : "w-full"} bg-gradient-to-br from-slate-50 via-sky-50/60 to-emerald-50/40 text-slate-800 antialiased flex flex-col justify-between selection:bg-[#005BAC] selection:text-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg`}>
      {/* Canvas pháo hoa overlay */}
      <canvas
        ref={fireworksCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Header Thanh Điều Khiển */}
      <header className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] px-4 sm:px-6 py-3.5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#005BAC] font-black flex items-center justify-center text-lg shadow-md ring-2 ring-emerald-300">
              DT
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                VIỆN DOANH TRÍ · KỶ NIỆM 4 NĂM
              </span>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1">
                Bốc Thăm May Mắn & Vòng Quay Trúng Thưởng
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-300" />}
            </button>
            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white text-[#005BAC] hover:bg-sky-50 transition text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#00A859]" />
              <span>Thiết Lập Giải</span>
            </button>
            {!isPublicScreen && (
              <a
                href={`/lucky-draw/${eventId}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 transition text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
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
      <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex-1 flex flex-col gap-6 items-stretch">
        {/* PHẦN 1: VÒNG QUAY MAY MẮN (TRÊN) */}
        <section className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Header Giải Thưởng Đang Bốc Thăm & Thanh Chọn Nhanh Giải Còn Quà */}
          <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#005BAC]">
                HẠNG MỤC ĐANG BỐC THĂM
              </span>
              {activePrize ? (
                <>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    <span className="text-2xl">{activePrize.icon || "🏆"}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {activePrize.title}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                      Còn lại {activePrize.remaining}/{activePrize.quantity} suất
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                    Phần quà: <strong className="text-emerald-700">{activePrize.gift}</strong>
                  </p>
                </>
              ) : (
                <div className="mt-1">
                  <h2 className="text-lg font-black text-emerald-700">
                    🎉 Đã hoàn thành trao tất cả các giải thưởng!
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vui lòng bấm "Thiết Lập Giải" nếu muốn bổ sung thêm hạng mục bốc thăm mới.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Switch Prize: CHỈ HIỆN CÁC GIẢI CÒN QUÀ (remaining > 0) */}
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      activePrize?.id === p.id
                        ? "bg-[#005BAC] text-white shadow-md ring-2 ring-[#00A859]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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

          {/* Khung Vòng Quay Canvas (Căn giữa to rõ, đẹp mắt) */}
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
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-4 h-4 text-[#005BAC]" />
              <span>
                Đại biểu trong vòng quay: <strong className="text-slate-900 font-bold">{candidates.length}</strong> người
              </span>
              <span className="text-[11px] text-slate-400">
                (Đã tự động loại trừ {winners.length} đại biểu đã trúng thưởng)
              </span>
              <button
                type="button"
                onClick={fetchAttendees}
                disabled={loadingCandidates || spinning}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer flex items-center gap-1"
                title="Làm mới danh sách đại biểu từ CSDL"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCandidates ? "animate-spin text-[#005BAC]" : ""}`} />
                <span className="text-[11px] font-semibold">Tải lại danh sách</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Dữ liệu đại biểu check-in thời gian thực (CSDL 113.20.107.184:6432)
              </span>
            </div>
          </div>
        </section>

        {/* PHẦN 2: KẾT QUẢ TRÚNG THƯỞNG Ở BÊN DƯỚI VÒNG QUAY (FULL WIDTH, SCROLL KHI > 5 GIẢI) */}
        <section className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
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

          {/* VƯỢT QUÁ 5 GIẢI THƯỞNG SẼ HIỆN SCROLL (max-h-[380px] overflow-y-auto) */}
          <div className={`p-5 ${winners.length > 5 ? "max-h-[420px] overflow-y-auto pr-3" : ""}`}>
            {winners.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3 border border-amber-200">
                  <Award className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Chưa có lượt quay nào trúng thưởng trong chương trình</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn hạng mục giải thưởng ở trên và nhấn nút <strong>"QUAY SỐ"</strong> để tìm ra những đại biểu may mắn nhất!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {winners.map((w, index) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/70 hover:shadow-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden group"
                  >
                    {/* Top strip badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-600" />
                        {w.prizeTitle}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {w.wonAt}
                      </span>
                    </div>

                    {/* Winner Info */}
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-slate-900 line-clamp-1 group-hover:text-[#005BAC] transition">
                        {w.candidateName}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-medium">
                        {w.company} {w.position && `· ${w.position}`}
                      </p>
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-semibold text-emerald-800 line-clamp-2">
                        🎁 {w.gift}
                      </div>
                    </div>

                    {/* Email status footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-[#005BAC] shrink-0" />
                        <span className="truncate text-slate-600 font-medium">
                          {w.emailSent ? "Đã gửi mail xác nhận" : w.email || "Đã gửi thông báo"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
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

      {/* MODAL CHÚC MỪNG CHIẾN THẮNG */}
      {winnerModalOpen && latestWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-400 p-6 sm:p-8 text-center overflow-hidden">
            {/* Background glowing rings */}
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

      {/* MODAL THIẾT LẬP GIẢI THƯỞNG TÙY Ý */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#005BAC] via-[#0284C7] to-[#00A859] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Thiết Lập Cơ Cấu Giải Thưởng
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
                  + Thêm Vào Danh Sách Giải
                </button>
              </form>

              {/* Danh sách giải hiện tại */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-700 uppercase text-[11px]">
                  <span>Các giải thưởng hiện hữu:</span>
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
                        title="Xóa giải"
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
                Hoàn Tất & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
