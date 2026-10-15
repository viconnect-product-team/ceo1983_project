import React, { useState, useMemo, useEffect } from "react";
import {
  Check,
  Crown,
  Users,
  Search,
  Building2,
  Ticket,
  UserCheck,
  UserX,
  Sparkles,
  Info,
  Calendar,
  Layers,
  UtensilsCrossed,
  ArrowLeftRight,
  Move,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export type SeatInfo = {
  id: string;
  label: string;
  category: "vip" | "standard" | "table";
  row?: string;
  number?: number;
};

export type CinemaRowConfig = {
  id: string;
  rowLetter: string;
  name: string;
  category: "vip" | "standard";
  seatsCount: number;
};

export type BanquetTable = {
  id: string;
  name: string;
  shape: "round" | "rect";
  seatsCount: number;
  isVip?: boolean;
  x?: number;
  y?: number;
};

export type FloorSeat = {
  id: string;
  label: string;
  category: "vip" | "standard";
  row: string;
  number: number;
  x?: number;
  y?: number;
  title?: string;
};

export type SeatOccupant = {
  registrationId?: string;
  attendeeName: string;
  attendeeCode?: string;
  company?: string;
  ticketType?: string;
  status?: string;
};

type Props = {
  eventId?: string;
  currentSeat?: string;
  occupiedSeats?: Record<string, SeatOccupant>;
  onSelectSeat: (seatLabel: string) => void;
  onMoveSeat?: (fromSeat: string, toSeat: string, occupant: SeatOccupant) => void;
  initialMode?: "cinema" | "banquet";
};

// Preset cấu hình hàng ghế Hội Trường
const CINEMA_ROWS: CinemaRowConfig[] = [
  { id: "row-A", rowLetter: "A", name: "Hàng VIP A", category: "vip", seatsCount: 10 },
  { id: "row-B", rowLetter: "B", name: "Hàng VIP B", category: "vip", seatsCount: 10 },
  { id: "row-C", rowLetter: "C", name: "Hàng Tiêu Chuẩn C", category: "standard", seatsCount: 12 },
  { id: "row-D", rowLetter: "D", name: "Hàng Tiêu Chuẩn D", category: "standard", seatsCount: 12 },
  { id: "row-E", rowLetter: "E", name: "Hàng Doanh Nhân E", category: "standard", seatsCount: 12 },
  { id: "row-F", rowLetter: "F", name: "Hàng Doanh Nhân F", category: "standard", seatsCount: 12 },
];

// Preset cấu hình bàn tiệc Gala
const BANQUET_TABLES: BanquetTable[] = [
  { id: "T1", name: "Bàn VIP 01 - Ban Chủ Tọa", shape: "round", seatsCount: 8, isVip: true },
  { id: "T2", name: "Bàn VIP 02 - Khách Mời Danh Dự", shape: "round", seatsCount: 8, isVip: true },
  { id: "T3", name: "Bàn 03 - Ban Xúc Tiến B2B", shape: "round", seatsCount: 10, isVip: false },
  { id: "T4", name: "Bàn 04 - Hội Viên CEO 1983", shape: "round", seatsCount: 10, isVip: false },
  { id: "T5", name: "Bàn 05 - Đối Tác Chiến Lược", shape: "rect", seatsCount: 10, isVip: false },
  { id: "T6", name: "Bàn 06 - Doanh Nghiệp Trẻ", shape: "rect", seatsCount: 8, isVip: false },
  { id: "T7", name: "Bàn 07 - Báo Chí & Truyền Thông", shape: "rect", seatsCount: 8, isVip: false },
  { id: "T8", name: "Bàn 08 - Nhà Tài Trợ Đồng Hành", shape: "rect", seatsCount: 8, isVip: false },
];

export function CinemaSeatingMap({
  eventId = "default",
  currentSeat = "",
  occupiedSeats = {},
  onSelectSeat,
  onMoveSeat,
  initialMode = "cinema",
}: Props) {
  const [mode, setMode] = useState<"cinema" | "banquet">(initialMode);
  const [selectedSeat, setSelectedSeat] = useState<string>(currentSeat);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTableId, setActiveTableId] = useState<string>("T1");
  const [movingFrom, setMovingFrom] = useState<{ seatLabel: string; occupant: SeatOccupant } | null>(null);

  // Layout states per event
  const [cinemaRows, setCinemaRows] = useState<CinemaRowConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`ceo1983_cinema_rows_${eventId || "default"}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return CINEMA_ROWS;
  });

  const [banquetTables, setBanquetTables] = useState<BanquetTable[]>(() => {
    try {
      const saved = localStorage.getItem(`ceo1983_banquet_tables_${eventId || "default"}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return BANQUET_TABLES;
  });

  const [stageSeatsCount, setStageSeatsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`ceo1983_stage_seats_${eventId || "default"}`);
      if (saved) return Number(saved) || 6;
    } catch {}
    return 6;
  });

  // Modal states for adding rows / tables
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowCategory, setNewRowCategory] = useState<"vip" | "standard">("standard");
  const [newRowLetter, setNewRowLetter] = useState("");
  const [newRowSeatsCount, setNewRowSeatsCount] = useState(12);

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<"round" | "rect">("round");
  const [newTableIsVip, setNewTableIsVip] = useState(false);
  const [newTableSeatsCount, setNewTableSeatsCount] = useState(8);

  // Sync when eventId changes
  useEffect(() => {
    try {
      const savedRows = localStorage.getItem(`ceo1983_cinema_rows_${eventId || "default"}`);
      setCinemaRows(savedRows ? JSON.parse(savedRows) : CINEMA_ROWS);
      const savedTables = localStorage.getItem(`ceo1983_banquet_tables_${eventId || "default"}`);
      setBanquetTables(savedTables ? JSON.parse(savedTables) : BANQUET_TABLES);
      const savedStage = localStorage.getItem(`ceo1983_stage_seats_${eventId || "default"}`);
      setStageSeatsCount(savedStage ? Number(savedStage) || 6 : 6);
    } catch {}
  }, [eventId]);

  const saveCinemaRows = (newRows: CinemaRowConfig[]) => {
    setCinemaRows(newRows);
    try {
      localStorage.setItem(`ceo1983_cinema_rows_${eventId || "default"}`, JSON.stringify(newRows));
    } catch {}
  };

  const saveBanquetTables = (newTables: BanquetTable[]) => {
    setBanquetTables(newTables);
    try {
      localStorage.setItem(`ceo1983_banquet_tables_${eventId || "default"}`, JSON.stringify(newTables));
    } catch {}
  };

  const saveStageSeatsCount = (cnt: number) => {
    setStageSeatsCount(cnt);
    try {
      localStorage.setItem(`ceo1983_stage_seats_${eventId || "default"}`, String(cnt));
    } catch {}
  };

  const handleAddRow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nextCode = 65 + cinemaRows.length;
    const letter = (newRowLetter.trim() || (nextCode <= 90 ? String.fromCharCode(nextCode) : `R${cinemaRows.length + 1}`)).toUpperCase();
    const newRow: CinemaRowConfig = {
      id: `row-${letter}-${Date.now()}`,
      rowLetter: letter,
      name: newRowCategory === "vip" ? `Hàng VIP ${letter}` : `Hàng Tiêu Chuẩn ${letter}`,
      category: newRowCategory,
      seatsCount: Math.max(1, Math.min(30, Number(newRowSeatsCount) || 12)),
    };
    saveCinemaRows([...cinemaRows, newRow]);
    setShowAddRowModal(false);
    setNewRowLetter("");
    toast.success(`Đã thêm ${newRow.name} (${newRow.seatsCount} ghế)!`);
  };

  const handleAddSeatToRow = (rowId: string) => {
    const updated = cinemaRows.map((r) => {
      if (r.id === rowId) {
        return { ...r, seatsCount: r.seatsCount + 1 };
      }
      return r;
    });
    saveCinemaRows(updated);
    toast.success("Đã thêm 1 ghế vào hàng!");
  };

  const handleRemoveSeatFromRow = (rowId: string) => {
    const updated = cinemaRows.map((r) => {
      if (r.id === rowId && r.seatsCount > 1) {
        return { ...r, seatsCount: r.seatsCount - 1 };
      }
      return r;
    });
    saveCinemaRows(updated);
  };

  const handleMoveRow = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= cinemaRows.length) return;
    const copy = [...cinemaRows];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    saveCinemaRows(copy);
    toast.success("Đã thay đổi thứ tự hàng ghế!");
  };

  const handleDeleteRow = (rowId: string) => {
    const target = cinemaRows.find((r) => r.id === rowId);
    if (!target) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hàng ghế ${target.name}?`)) return;
    saveCinemaRows(cinemaRows.filter((r) => r.id !== rowId));
    toast.success(`Đã xóa ${target.name}!`);
  };

  const handleToggleRowCategory = (rowId: string) => {
    const updated = cinemaRows.map((r) => {
      if (r.id === rowId) {
        const nextCat: "vip" | "standard" = r.category === "vip" ? "standard" : "vip";
        return {
          ...r,
          category: nextCat,
          name: nextCat === "vip" ? `Hàng VIP ${r.rowLetter}` : `Hàng Tiêu Chuẩn ${r.rowLetter}`,
        };
      }
      return r;
    });
    saveCinemaRows(updated);
  };

  const handleResetLayout = () => {
    if (!window.confirm("Khôi phục sơ đồ chỗ ngồi về mặc định ban đầu của sự kiện này?")) return;
    if (mode === "cinema") {
      saveCinemaRows(CINEMA_ROWS);
      saveStageSeatsCount(6);
    } else {
      saveBanquetTables(BANQUET_TABLES);
    }
    toast.success("Đã khôi phục sơ đồ ghế mặc định!");
  };

  const handleAddTable = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nextId = `T${banquetTables.length + 1}`;
    const name = newTableName.trim() || `Bàn ${String(banquetTables.length + 1).padStart(2, "0")} - Hội Viên`;
    const newTable: BanquetTable = {
      id: nextId,
      name,
      shape: newTableShape,
      isVip: newTableIsVip,
      seatsCount: Math.max(2, Math.min(20, Number(newTableSeatsCount) || 8)),
    };
    saveBanquetTables([...banquetTables, newTable]);
    setShowAddTableModal(false);
    setNewTableName("");
    toast.success(`Đã thêm ${newTable.name}!`);
  };

  const handleAddSeatToTable = (tableId: string) => {
    const updated = banquetTables.map((t) => {
      if (t.id === tableId) {
        return { ...t, seatsCount: t.seatsCount + 1 };
      }
      return t;
    });
    saveBanquetTables(updated);
    toast.success("Đã thêm 1 ghế vào bàn!");
  };

  const handleRemoveSeatFromTable = (tableId: string) => {
    const updated = banquetTables.map((t) => {
      if (t.id === tableId && t.seatsCount > 1) {
        return { ...t, seatsCount: t.seatsCount - 1 };
      }
      return t;
    });
    saveBanquetTables(updated);
  };

  const handleDeleteTable = (tableId: string) => {
    const target = banquetTables.find((t) => t.id === tableId);
    if (!target) return;
    if (!window.confirm(`Bạn có chắc muốn xóa bàn ${target.name}?`)) return;
    saveBanquetTables(banquetTables.filter((t) => t.id !== tableId));
    toast.success(`Đã xóa ${target.name}!`);
  };

  // Helper tìm kiếm thông tin người ngồi theo nhiều định dạng tên ghế
  const findOccupant = (seatId: string, seatLabel: string): SeatOccupant | undefined => {
    if (occupiedSeats[seatLabel]) return occupiedSeats[seatLabel];
    if (occupiedSeats[seatId]) return occupiedSeats[seatId];
    // Tìm kiếm mờ nếu có
    const entry = Object.entries(occupiedSeats).find(([key]) => {
      const normKey = key.toLowerCase().replace(/\s+/g, "");
      const normId = seatId.toLowerCase().replace(/\s+/g, "");
      return normKey.includes(normId) || normId.includes(normKey);
    });
    return entry ? entry[1] : undefined;
  };

  // Danh sách đại biểu đã được xếp chỗ để hiển thị trực quan ra bảng
  const occupiedList = useMemo(() => {
    const list: Array<{
      seatKey: string;
      occupant: SeatOccupant;
    }> = [];
    const seen = new Set<string>();

    Object.entries(occupiedSeats).forEach(([key, occ]) => {
      const dedupeKey = `${key}-${occ.attendeeName}`;
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        list.push({ seatKey: key, occupant: occ });
      }
    });

    return list;
  }, [occupiedSeats]);

  // Lọc theo từ khóa tìm kiếm
  const filteredOccupiedList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return occupiedList;
    return occupiedList.filter((item) => {
      return (
        item.seatKey.toLowerCase().includes(q) ||
        item.occupant.attendeeName.toLowerCase().includes(q) ||
        (item.occupant.company && item.occupant.company.toLowerCase().includes(q)) ||
        (item.occupant.attendeeCode && item.occupant.attendeeCode.toLowerCase().includes(q))
      );
    });
  }, [occupiedList, searchQuery]);

  const handleSeatClick = (seatId: string, seatLabel: string) => {
    if (movingFrom) {
      if (movingFrom.seatLabel === seatLabel) {
        setMovingFrom(null);
        return;
      }
      if (onMoveSeat) {
        onMoveSeat(movingFrom.seatLabel, seatLabel, movingFrom.occupant);
      } else {
        onSelectSeat(seatLabel);
      }
      setSelectedSeat(seatLabel);
      setMovingFrom(null);
      return;
    }

    setSelectedSeat(seatLabel);
    onSelectSeat(seatLabel);
  };

  const handleDropOnSeat = (targetSeatLabel: string) => {
    if (!movingFrom) return;
    if (movingFrom.seatLabel === targetSeatLabel) {
      setMovingFrom(null);
      return;
    }
    if (onMoveSeat) {
      onMoveSeat(movingFrom.seatLabel, targetSeatLabel, movingFrom.occupant);
    } else {
      onSelectSeat(targetSeatLabel);
    }
    setSelectedSeat(targetSeatLabel);
    setMovingFrom(null);
  };

  const selectedOccupant = selectedSeat ? findOccupant(selectedSeat, selectedSeat) : undefined;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* ── TOP HEADER & ACTIONS ── */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[#003B95]/10 dark:bg-amber-400/10 flex items-center justify-center text-[#003B95] dark:text-amber-400">
            {mode === "cinema" ? <Layers className="h-5 w-5" /> : <UtensilsCrossed className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {mode === "cinema" ? "Sơ đồ Ghế Hội Trường (Cinema)" : "Sơ đồ Bàn Tiệc Gala (Banquet)"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {mode === "cinema"
                ? "Sân khấu trung tâm · Hàng VIP & Ghế Tiêu Chuẩn · Tùy biến hàng & ghế theo sự kiện"
                : "Bàn tiệc tròn & chữ nhật theo khu vực đại biểu"}
            </p>
          </div>
        </div>

        {/* Action buttons: Switcher, + Thêm hàng, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("cinema")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "cinema"
                  ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Hội Trường
            </button>
            <button
              type="button"
              onClick={() => setMode("banquet")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "banquet"
                  ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Bàn Tiệc Gala
            </button>
          </div>

          {/* + Thêm hàng / + Thêm bàn button */}
          {mode === "cinema" ? (
            <button
              type="button"
              onClick={() => setShowAddRowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Thêm hàng</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddTableModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Thêm bàn</span>
            </button>
          )}

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetLayout}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            title="Khôi phục sơ đồ ghế mặc định"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── BANNER CHUYỂN GHẾ NẾU ĐANG CHỌN DI CHUYỂN ĐẠI BIỂU ── */}
      {movingFrom && (
        <div className="mx-4 my-2.5 p-3 rounded-xl bg-amber-500/15 border-2 border-amber-500 flex items-center justify-between gap-3 text-amber-950 dark:text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <ArrowLeftRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-bold">Đang di chuyển: </span>
              <strong className="text-amber-800 dark:text-amber-200 font-extrabold">{movingFrom.occupant.attendeeName}</strong>
              {" "}(từ <code className="bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono font-bold">{movingFrom.seatLabel}</code>).
              <span className="ml-1 text-[11px] opacity-90 block sm:inline">
                Click vào ghế đích bất kỳ trên sơ đồ để chuyển hoặc kéo thả đại biểu trực tiếp.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMovingFrom(null)}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer shrink-0"
          >
            Hủy
          </button>
        </div>
      )}

      {/* ── SEAT STATUS LEGEND BAR ── */}
      <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] gap-2">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-amber-500 border border-amber-600" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Ghế VIP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Ghế Tiêu Chuẩn (Trống)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-emerald-600 border border-emerald-500 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-300 font-bold text-emerald-700 dark:text-emerald-400">
              Đã có người ngồi (Có thể kéo/chuyển)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-[#003B95] ring-2 ring-amber-400" />
            <span className="text-[#003B95] dark:text-amber-400 font-bold">Đang chọn</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Đã xếp: <strong className="text-emerald-600">{occupiedList.length}</strong> đại biểu
        </div>
      </div>

      {/* ── MAIN STUDIO AREA ── */}
      <div className="p-4 sm:p-6 overflow-x-auto min-h-[360px] flex flex-col items-center">
        {mode === "cinema" ? (
          /* ========================================================
             CHẾ ĐỘ HỘI TRƯỜNG / CINEMA: SÂN KHẤU TRUNG TÂM & GHẾ
             ======================================================== */
          <div className="w-full max-w-3xl flex flex-col items-center space-y-6">
            {/* SÂN KHẤU / MÀN HÌNH LED */}
            <div className="w-full relative">
              <div className="w-3/4 mx-auto h-9 sm:h-11 rounded-b-3xl bg-gradient-to-b from-[#001D4A] via-[#003B95] to-[#0A4DB0] border-t-0 border-x-2 border-b-2 border-amber-400/60 shadow-lg flex items-center justify-center text-white text-xs font-black tracking-widest uppercase">
                <span className="drop-shadow-md flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  SÂN KHẤU TRUNG TÂM · MÀN HÌNH CHÍNH (STAGE)
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                </span>
              </div>
              <div className="text-center text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                Khu vực Trình diễn & Tọa đàm
              </div>
            </div>

            {/* SÂN KHẤU: BÀN CHỦ TỌA */}
            <div className="w-full max-w-xl p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center gap-2">
              <div className="w-full flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="size-3 text-amber-600" />
                  ĐOÀN CHỦ TỊCH / KHÁCH MỜI DANH DỰ TRÊN SÂN KHẤU ({stageSeatsCount} ghế)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (stageSeatsCount > 2) saveStageSeatsCount(stageSeatsCount - 1);
                    }}
                    className="p-1 rounded bg-amber-200/60 hover:bg-amber-300 text-amber-900 text-[10px] font-bold cursor-pointer"
                    title="Bớt 1 ghế trên sân khấu"
                  >
                    <Minus className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => saveStageSeatsCount(stageSeatsCount + 1)}
                    className="p-1 rounded bg-amber-200/60 hover:bg-amber-300 text-amber-900 text-[10px] font-bold cursor-pointer"
                    title="+ Thêm 1 ghế lên sân khấu"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {Array.from({ length: stageSeatsCount }, (_, idx) => {
                  const num = idx + 1;
                  const seatId = `SK-${String(num).padStart(2, "0")}`;
                  const seatLabel = `Sân Khấu - Ghế SK-${String(num).padStart(2, "0")}`;
                  const occ = findOccupant(seatId, seatLabel);
                  const isSelected = selectedSeat === seatLabel || selectedSeat === seatId;
                  const isOccupied = !!occ;
                  const isBeingMoved = movingFrom?.seatLabel === seatLabel;

                  return (
                    <button
                      key={seatId}
                      type="button"
                      draggable={isOccupied}
                      onDragStart={(e) => {
                        if (occ) {
                          e.dataTransfer.setData("text/plain", seatLabel);
                          setMovingFrom({ seatLabel, occupant: occ });
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropOnSeat(seatLabel);
                      }}
                      onClick={() => handleSeatClick(seatId, seatLabel)}
                      className={`relative min-w-[72px] sm:min-w-[80px] h-12 rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                        isBeingMoved
                          ? "ring-4 ring-amber-500 bg-amber-600 text-white animate-pulse"
                          : isSelected
                          ? "bg-[#003B95] text-white ring-2 ring-amber-400 shadow-md scale-105"
                          : isOccupied
                          ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400/40 hover:bg-amber-200"
                      }`}
                      title={occ ? `${seatLabel} - ${occ.attendeeName} (${occ.company || ""}) - Kéo hoặc click để chuyển` : seatLabel}
                    >
                      <span className="text-[10px] font-black leading-none">{seatId}</span>
                      {occ ? (
                        <span className="text-[9.5px] font-bold truncate max-w-[68px] block mt-0.5">
                          {occ.attendeeName.split(" ").slice(-1)[0]}
                        </span>
                      ) : (
                        <span className="text-[9px] opacity-75">Trống</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CÁC HÀNG GHẾ HỘI TRƯỜNG */}
            <div className="w-full space-y-3.5">
              {cinemaRows.map((row, rowIdx) => (
                <div key={row.id} className="flex items-center gap-2 sm:gap-3 p-1 rounded-2xl hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group">
                  {/* Left Controls: Reorder & Row Letter Badge */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveRow(rowIdx, "up")}
                        disabled={rowIdx === 0}
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer text-slate-500"
                        title="Di chuyển hàng ghế lên trên"
                      >
                        <ChevronUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRow(rowIdx, "down")}
                        disabled={rowIdx === cinemaRows.length - 1}
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer text-slate-500"
                        title="Di chuyển hàng ghế xuống dưới"
                      >
                        <ChevronDown className="size-3" />
                      </button>
                    </div>

                    {/* Row Letter Header (Click to toggle VIP) */}
                    <button
                      type="button"
                      onClick={() => handleToggleRowCategory(row.id)}
                      className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 select-none shadow-xs cursor-pointer transition ${
                        row.category === "vip"
                          ? "bg-amber-500 text-slate-950 border border-amber-400 hover:bg-amber-400"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      }`}
                      title={`${row.name} (Click để đổi loại VIP / Tiêu chuẩn)`}
                    >
                      {row.rowLetter}
                    </button>
                  </div>

                  {/* Seat Blocks with Center Aisle */}
                  <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
                    {Array.from({ length: row.seatsCount }, (_, idx) => {
                      const num = idx + 1;
                      const seatId = `${row.rowLetter}-${String(num).padStart(2, "0")}`;
                      const seatLabel = `${row.name} - Ghế ${seatId}`;
                      const occ = findOccupant(seatId, seatLabel);
                      const isSelected = selectedSeat === seatLabel || selectedSeat === seatId;
                      const isOccupied = !!occ;
                      const isBeingMoved = movingFrom?.seatLabel === seatLabel;
                      const isCenterAisle = num === Math.ceil(row.seatsCount / 2);

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            draggable={isOccupied}
                            onDragStart={(e) => {
                              if (occ) {
                                e.dataTransfer.setData("text/plain", seatLabel);
                                setMovingFrom({ seatLabel, occupant: occ });
                              }
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropOnSeat(seatLabel);
                            }}
                            onClick={() => handleSeatClick(seatId, seatLabel)}
                            className={`group relative flex-1 min-w-[36px] sm:min-w-[44px] max-w-[58px] h-12 rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                              isBeingMoved
                                ? "ring-4 ring-amber-500 bg-amber-600 text-white animate-pulse"
                                : isSelected
                                ? "bg-[#003B95] text-white ring-2 ring-amber-400 shadow-md scale-105 z-10"
                                : isOccupied
                                ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 hover:scale-105"
                                : row.category === "vip"
                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300/60 hover:bg-amber-200"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                            title={
                              occ
                                ? `${seatLabel}: ${occ.attendeeName} (${occ.company || "Hội viên"}) - Kéo hoặc click để chuyển`
                                : seatLabel
                            }
                          >
                            <span className="text-[10px] font-black leading-none block">
                              {seatId}
                            </span>
                            {occ ? (
                              <span className="text-[9.5px] font-bold truncate max-w-[42px] sm:max-w-[48px] block leading-tight text-emerald-100 mt-0.5">
                                {occ.attendeeName.split(" ").slice(-1)[0]}
                              </span>
                            ) : (
                              <span className="text-[8.5px] opacity-60 block mt-0.5">
                                {row.category === "vip" ? "VIP" : "Trống"}
                              </span>
                            )}
                          </button>

                          {/* Lối đi giữa hội trường */}
                          {isCenterAisle && (
                            <div className="w-2.5 sm:w-4 flex items-center justify-center shrink-0">
                              <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Right Controls: + Thêm ghế / - Bớt ghế / Xóa hàng */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveSeatFromRow(row.id)}
                        disabled={row.seatsCount <= 1}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-20 cursor-pointer"
                        title="Bớt 1 ghế"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-1.5 text-[10.5px] font-mono font-bold text-slate-700 dark:text-slate-200">
                        {row.seatsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddSeatToRow(row.id)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 cursor-pointer font-bold"
                        title="+ Thêm 1 ghế vào hàng này"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Xóa hàng ghế này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Row Action Card at Bottom of Cinema */}
            <div className="w-full pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowAddRowModal(true)}
                className="w-full max-w-sm py-2 px-4 rounded-xl border-2 border-dashed border-[#003B95]/40 hover:border-[#003B95] bg-[#003B95]/5 hover:bg-[#003B95]/10 text-[#003B95] dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ Thêm hàng ghế mới</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             CHẾ ĐỘ BÀN TIỆC GALA (BANQUET): CÁC BÀN TIỆC & GHẾ
             ======================================================== */
          <div className="w-full max-w-3xl flex flex-col items-center space-y-6">
            <div className="flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide border border-amber-500/20">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                KHÔNG GIAN TIỆC GALA DINNER · ĐỒNG HÀNH & KẾT NỐI
              </span>
              <button
                type="button"
                onClick={() => setShowAddTableModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>+ Thêm bàn tiệc</span>
              </button>
            </div>

            {/* Bàn tiệc Gala dạng Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {banquetTables.map((table) => {
                const isActive = activeTableId === table.id;

                // Đếm số ghế đã có người trong bàn này
                let tableOccupiedCount = 0;
                for (let i = 1; i <= table.seatsCount; i++) {
                  const sId = `${table.id}-${String(i).padStart(2, "0")}`;
                  const sLabel = `${table.name} - Ghế ${i}`;
                  if (findOccupant(sId, sLabel)) tableOccupiedCount++;
                }

                return (
                  <div
                    key={table.id}
                    onClick={() => setActiveTableId(table.id)}
                    className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? "border-[#003B95] dark:border-amber-400 bg-blue-50/40 dark:bg-slate-800/90 shadow-md ring-2 ring-[#003B95]/30"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            table.isVip
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {table.id} · {table.isVip ? "Bàn VIP" : "Bàn Tiêu Chuẩn"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            {tableOccupiedCount}/{table.seatsCount} chỗ
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTable(table.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Xóa bàn"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {table.name}
                      </h5>
                    </div>

                    {/* Vòng tròn mô phỏng bàn tiệc */}
                    <div className="my-3 flex items-center justify-center">
                      <div
                        className={`h-24 w-24 rounded-full border-2 flex flex-col items-center justify-center p-2 text-center shadow-inner relative ${
                          table.isVip
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <span className="text-[10.5px] font-black text-slate-800 dark:text-slate-100">
                          {table.id}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                          {table.seatsCount} Ghế
                        </span>
                      </div>
                    </div>

                    {/* Ghế quanh bàn */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {Array.from({ length: table.seatsCount }, (_, idx) => {
                        const seatNum = idx + 1;
                        const seatId = `${table.id}-${String(seatNum).padStart(2, "0")}`;
                        const seatLabel = `${table.name} - Ghế ${seatNum}`;
                        const occ = findOccupant(seatId, seatLabel);
                        const isSelected = selectedSeat === seatLabel || selectedSeat === seatId;
                        const isOccupied = !!occ;
                        const isBeingMoved = movingFrom?.seatLabel === seatLabel;

                        return (
                          <button
                            key={seatId}
                            type="button"
                            draggable={isOccupied}
                            onDragStart={(e) => {
                              if (occ) {
                                e.dataTransfer.setData("text/plain", seatLabel);
                                setMovingFrom({ seatLabel, occupant: occ });
                              }
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropOnSeat(seatLabel);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeatClick(seatId, seatLabel);
                            }}
                            className={`h-8 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isBeingMoved
                                ? "ring-4 ring-amber-500 bg-amber-600 text-white animate-pulse"
                                : isSelected
                                ? "bg-[#003B95] text-white ring-2 ring-amber-400 font-black shadow-sm"
                                : isOccupied
                                ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title={occ ? `${seatLabel}: ${occ.attendeeName} - Kéo hoặc click để chuyển` : seatLabel}
                          >
                            <span>G{seatNum}</span>
                            {occ && (
                              <span className="text-[8px] font-normal truncate max-w-[28px]">
                                {occ.attendeeName.split(" ").slice(-1)[0]}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Table Quick Seat Count Buttons */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="text-slate-400 font-medium">Chỉnh số ghế:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSeatFromTable(table.id);
                          }}
                          disabled={table.seatsCount <= 2}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-20 cursor-pointer"
                          title="Bớt 1 ghế"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold">{table.seatsCount}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSeatToTable(table.id);
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
                          title="+ Thêm 1 ghế"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: + THÊM HÀNG GHẾ (CINEMA) ── */}
      {showAddRowModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="size-4 text-[#003B95] dark:text-blue-400" />
                <span>Thêm hàng ghế mới</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddRowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddRow} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chữ cái hàng (Ký hiệu):
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={newRowLetter}
                  onChange={(e) => setNewRowLetter(e.target.value.toUpperCase())}
                  placeholder={`Ví dụ: ${String.fromCharCode(65 + cinemaRows.length)}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Loại hàng ghế:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRowCategory("standard")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newRowCategory === "standard"
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Tiêu Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRowCategory("vip")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newRowCategory === "vip"
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Crown className="size-3 text-amber-950" />
                    <span>Hàng VIP</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Số lượng ghế trong hàng:
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newRowSeatsCount}
                  onChange={(e) => setNewRowSeatsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRowModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition shadow-xs cursor-pointer"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: + THÊM BÀN TIỆC (BANQUET) ── */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="size-4 text-[#003B95] dark:text-blue-400" />
                <span>Thêm bàn tiệc mới</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddTableModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên bàn tiệc:
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder={`Ví dụ: Bàn ${String(banquetTables.length + 1).padStart(2, "0")} - Hội Viên`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hình dạng bàn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTableShape("round")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newTableShape === "round"
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Bàn Tròn
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTableShape("rect")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newTableShape === "rect"
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Bàn Chữ Nhật
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Loại bàn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTableIsVip(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      !newTableIsVip
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Tiêu Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTableIsVip(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newTableIsVip
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Crown className="size-3 text-amber-950" />
                    <span>Bàn VIP</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Số lượng ghế:
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newTableSeatsCount}
                  onChange={(e) => setNewTableSeatsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition shadow-xs cursor-pointer"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SEAT INSPECTOR & ROSTER FOOTER ── */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CỘT 1: THÔNG TIN VỊ TRÍ ĐANG CHỌN */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vị trí đang chọn</span>
              {selectedOccupant ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300">
                  <UserCheck className="h-3 w-3" /> Đã có đại biểu
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Ghế sẵn sàng
                </span>
              )}
            </div>

            <div className="text-sm font-extrabold text-[#003B95] dark:text-amber-400 leading-snug">
              {selectedSeat || "Chưa chọn ghế trên sơ đồ"}
            </div>

            {selectedOccupant ? (
              <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {selectedOccupant.attendeeName}
                  {selectedOccupant.attendeeCode && (
                    <span className="text-[10px] text-slate-500 font-mono">({selectedOccupant.attendeeCode})</span>
                  )}
                </div>
                {selectedOccupant.company && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedOccupant.company}</span>
                  </div>
                )}
                {selectedOccupant.ticketType && (
                  <div className="text-[10.5px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Ticket className="h-3 w-3 shrink-0" />
                    <span>Hạng vé: {selectedOccupant.ticketType}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Click vào bất kỳ ghế nào để chọn vị trí này cho đại biểu cần xếp chỗ.
              </p>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {selectedOccupant && (
              <button
                type="button"
                onClick={() => setMovingFrom({ seatLabel: selectedSeat, occupant: selectedOccupant })}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Di chuyển đại biểu sang ghế khác</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => selectedSeat && onSelectSeat(selectedSeat)}
              disabled={!selectedSeat}
              className="w-full py-2 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Xác nhận chọn vị trí này</span>
            </button>
          </div>
        </div>

        {/* CỘT 2 & 3: BẢNG DANH SÁCH ĐẠI BIỂU ĐÃ XẾP CHỖ (HIỆN RÕ AI ĐANG NGỒI ĐÂU) */}
        <div className="lg:col-span-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Danh sách đại biểu đã xếp chỗ ({occupiedList.length})
                </h5>
              </div>

              {/* Thanh tìm kiếm đại biểu / chỗ ngồi */}
              <div className="relative w-full sm:w-60">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm họ tên, doanh nghiệp, số ghế..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Bảng danh sách đại biểu */}
            <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              {filteredOccupiedList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {searchQuery ? "Không tìm thấy đại biểu phù hợp từ khóa" : "Chưa có đại biểu nào được xếp chỗ"}
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-[10.5px] uppercase font-bold text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Chỗ ngồi</th>
                      <th className="py-2 px-3">Họ và tên đại biểu</th>
                      <th className="py-2 px-3 hidden sm:table-cell">Doanh nghiệp</th>
                      <th className="py-2 px-3">Hạng vé</th>
                      <th className="py-2 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOccupiedList.map((item, idx) => {
                      const isCurrent = selectedSeat === item.seatKey;

                      return (
                        <tr
                          key={idx}
                          onClick={() => handleSeatClick(item.seatKey, item.seatKey)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition ${
                            isCurrent ? "bg-amber-50 dark:bg-amber-950/40 font-bold" : ""
                          }`}
                        >
                          <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {item.seatKey}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {item.occupant.attendeeName}
                          </td>
                          <td className="py-2 px-3 text-slate-500 hidden sm:table-cell truncate max-w-[160px]">
                            {item.occupant.company || "Hội viên CEO 1983"}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (item.occupant.ticketType || "").toLowerCase().includes("vip")
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {item.occupant.ticketType || "VIP"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMovingFrom({ seatLabel: item.seatKey, occupant: item.occupant });
                              }}
                              className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[10.5px] font-bold border border-amber-300/60 inline-flex items-center gap-1 cursor-pointer"
                              title="Chuyển đại biểu này sang ghế khác"
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                              <span>Chuyển</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
