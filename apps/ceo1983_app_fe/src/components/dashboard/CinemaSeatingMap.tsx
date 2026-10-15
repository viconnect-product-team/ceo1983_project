import React, { useState, useMemo, useEffect } from "react";
import {
  Check,
  Crown,
  Users,
  Search,
  Building2,
  Ticket,
  UserCheck,
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
  LayoutGrid,
  Square,
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
  shape: "round" | "rect" | "square";
  seatsCount: number;
  isVip?: boolean;
  x?: number;
  y?: number;
};

export type SeatingZone = {
  id: string;
  name: string;
  shape: "rect" | "square";
  rowsCount: number;
  colsCount: number;
  isVip?: boolean;
};

export type SeatOccupant = {
  registrationId?: string;
  attendeeName: string;
  attendeeCode?: string;
  company?: string;
  ticketType?: string;
  status?: string;
  seatLabel?: string;
};

type Props = {
  eventId?: string;
  currentSeat?: string;
  occupiedSeats?: Record<string, SeatOccupant>;
  onSelectSeat: (seatLabel: string) => void;
  onMoveSeat?: (fromSeat: string, toSeat: string, occupant: SeatOccupant) => void;
  initialMode?: "cinema" | "zones" | "banquet";
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

// Preset cấu hình các Khu Vực Hình Vuông & Hình Chữ Nhật cụ thể
const DEFAULT_SEATING_ZONES: SeatingZone[] = [
  {
    id: "ZA",
    name: "Khu VIP Trung Tâm (Chữ nhật 3x6)",
    shape: "rect",
    rowsCount: 3,
    colsCount: 6,
    isVip: true,
  },
  {
    id: "ZB",
    name: "Khu Ban Điều Hành & Khách Mời (Chữ nhật 3x6)",
    shape: "rect",
    rowsCount: 3,
    colsCount: 6,
    isVip: true,
  },
  {
    id: "ZC",
    name: "Khu Doanh Nghiệp CEO 1983 - Cánh Trái (Vuông 4x4)",
    shape: "square",
    rowsCount: 4,
    colsCount: 4,
    isVip: false,
  },
  {
    id: "ZD",
    name: "Khu Doanh Nghiệp CEO 1983 - Cánh Phải (Vuông 4x4)",
    shape: "square",
    rowsCount: 4,
    colsCount: 4,
    isVip: false,
  },
  {
    id: "ZE",
    name: "Khu Đối Tác & Nhà Tài Trợ (Chữ nhật 4x8)",
    shape: "rect",
    rowsCount: 4,
    colsCount: 8,
    isVip: false,
  },
];

// Preset cấu hình bàn tiệc Gala
const BANQUET_TABLES: BanquetTable[] = [
  { id: "T1", name: "Bàn VIP 01 - Ban Chủ Tọa", shape: "round", seatsCount: 8, isVip: true },
  { id: "T2", name: "Bàn VIP 02 - Khách Mời Danh Dự", shape: "round", seatsCount: 8, isVip: true },
  { id: "T3", name: "Bàn 03 - Ban Xúc Tiến B2B", shape: "round", seatsCount: 10, isVip: false },
  { id: "T4", name: "Bàn 04 - Hội Viên CEO 1983", shape: "round", seatsCount: 10, isVip: false },
  { id: "T5", name: "Bàn 05 - Đối Tác Chiến Lược (Chữ nhật)", shape: "rect", seatsCount: 10, isVip: false },
  { id: "T6", name: "Bàn 06 - Doanh Nghiệp Trẻ (Vuông)", shape: "square", seatsCount: 8, isVip: false },
  { id: "T7", name: "Bàn 07 - Báo Chí & Truyền Thông (Chữ nhật)", shape: "rect", seatsCount: 8, isVip: false },
  { id: "T8", name: "Bàn 08 - Nhà Tài Trợ Đồng Hành (Chữ nhật)", shape: "rect", seatsCount: 8, isVip: false },
];

export function CinemaSeatingMap({
  eventId = "default",
  currentSeat = "",
  occupiedSeats = {},
  onSelectSeat,
  onMoveSeat,
  initialMode = "cinema",
}: Props) {
  const [mode, setMode] = useState<"cinema" | "zones" | "banquet">(initialMode);
  const [selectedSeat, setSelectedSeat] = useState<string>(currentSeat);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTableId, setActiveTableId] = useState<string>("T1");

  // State di chuyển ghế tương tác (cho cả ghế trống lẫn ghế đã có người)
  const [movingFrom, setMovingFrom] = useState<{
    seatId: string;
    seatLabel: string;
    occupant?: SeatOccupant;
  } | null>(null);

  // Layout states per event
  const [cinemaRows, setCinemaRows] = useState<CinemaRowConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`ceo1983_cinema_rows_${eventId || "default"}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return CINEMA_ROWS;
  });

  const [seatingZones, setSeatingZones] = useState<SeatingZone[]>(() => {
    try {
      const saved = localStorage.getItem(`ceo1983_seating_zones_${eventId || "default"}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SEATING_ZONES;
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

  // Modal states for adding rows / zones / tables
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowCategory, setNewRowCategory] = useState<"vip" | "standard">("standard");
  const [newRowLetter, setNewRowLetter] = useState("");
  const [newRowSeatsCount, setNewRowSeatsCount] = useState(12);

  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneShape, setNewZoneShape] = useState<"rect" | "square">("rect");
  const [newZoneRows, setNewZoneRows] = useState(4);
  const [newZoneCols, setNewZoneCols] = useState(6);
  const [newZoneIsVip, setNewZoneIsVip] = useState(false);

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<"round" | "rect" | "square">("round");
  const [newTableIsVip, setNewTableIsVip] = useState(false);
  const [newTableSeatsCount, setNewTableSeatsCount] = useState(8);

  // Sync when eventId changes
  useEffect(() => {
    try {
      const savedRows = localStorage.getItem(`ceo1983_cinema_rows_${eventId || "default"}`);
      setCinemaRows(savedRows ? JSON.parse(savedRows) : CINEMA_ROWS);
      const savedZones = localStorage.getItem(`ceo1983_seating_zones_${eventId || "default"}`);
      setSeatingZones(savedZones ? JSON.parse(savedZones) : DEFAULT_SEATING_ZONES);
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

  const saveSeatingZones = (newZones: SeatingZone[]) => {
    setSeatingZones(newZones);
    try {
      localStorage.setItem(`ceo1983_seating_zones_${eventId || "default"}`, JSON.stringify(newZones));
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

  // Helper tìm kiếm thông tin người ngồi theo nhiều định dạng tên ghế
  const findOccupant = (seatId: string, seatLabel: string): SeatOccupant | undefined => {
    if (occupiedSeats[seatLabel]) return occupiedSeats[seatLabel];
    if (occupiedSeats[seatId]) return occupiedSeats[seatId];
    const entry = Object.entries(occupiedSeats).find(([key]) => {
      const normKey = key.toLowerCase().replace(/\s+/g, "");
      const normId = seatId.toLowerCase().replace(/\s+/g, "");
      const normLabel = seatLabel.toLowerCase().replace(/\s+/g, "");
      return normKey.includes(normId) || normId.includes(normKey) || normKey.includes(normLabel) || normLabel.includes(normKey);
    });
    return entry ? entry[1] : undefined;
  };

  // Thao tác hàng ghế Hội Trường
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
      if (r.id === rowId) return { ...r, seatsCount: r.seatsCount + 1 };
      return r;
    });
    saveCinemaRows(updated);
    toast.success("Đã thêm 1 ghế vào hàng!");
  };

  const handleRemoveSeatFromRow = (rowId: string) => {
    const updated = cinemaRows.map((r) => {
      if (r.id === rowId && r.seatsCount > 1) return { ...r, seatsCount: r.seatsCount - 1 };
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

  // Thao tác Khu Vực Hình Vuông & Chữ Nhật
  const handleAddZone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nextIdx = seatingZones.length + 1;
    const shapeLabel = newZoneShape === "rect" ? "Chữ nhật" : "Vuông";
    const name = newZoneName.trim() || `Khu ${String.fromCharCode(64 + nextIdx)} - ${shapeLabel} (${newZoneRows}x${newZoneCols})`;
    const newZone: SeatingZone = {
      id: `Z${String.fromCharCode(64 + nextIdx)}`,
      name,
      shape: newZoneShape,
      rowsCount: Math.max(1, Math.min(15, Number(newZoneRows) || 4)),
      colsCount: Math.max(1, Math.min(15, Number(newZoneCols) || 4)),
      isVip: newZoneIsVip,
    };
    saveSeatingZones([...seatingZones, newZone]);
    setShowAddZoneModal(false);
    setNewZoneName("");
    toast.success(`Đã thêm ${newZone.name}!`);
  };

  const handleUpdateZoneRows = (zoneId: string, delta: number) => {
    const updated = seatingZones.map((z) => {
      if (z.id === zoneId) {
        const newR = Math.max(1, Math.min(15, z.rowsCount + delta));
        return { ...z, rowsCount: newR };
      }
      return z;
    });
    saveSeatingZones(updated);
  };

  const handleUpdateZoneCols = (zoneId: string, delta: number) => {
    const updated = seatingZones.map((z) => {
      if (z.id === zoneId) {
        const newC = Math.max(1, Math.min(15, z.colsCount + delta));
        return { ...z, colsCount: newC };
      }
      return z;
    });
    saveSeatingZones(updated);
  };

  const handleDeleteZone = (zoneId: string) => {
    const target = seatingZones.find((z) => z.id === zoneId);
    if (!target) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ${target.name}?`)) return;
    saveSeatingZones(seatingZones.filter((z) => z.id !== zoneId));
    toast.success(`Đã xóa ${target.name}!`);
  };

  // Thao tác Bàn tiệc Gala
  const handleAddTable = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nextId = `T${banquetTables.length + 1}`;
    const shapeLabel = newTableShape === "rect" ? "Chữ nhật" : newTableShape === "square" ? "Vuông" : "Tròn";
    const name = newTableName.trim() || `Bàn ${String(banquetTables.length + 1).padStart(2, "0")} - ${shapeLabel}`;
    const newTable: BanquetTable = {
      id: nextId,
      name,
      shape: newTableShape,
      isVip: newTableIsVip,
      seatsCount: Math.max(2, Math.min(24, Number(newTableSeatsCount) || 8)),
    };
    saveBanquetTables([...banquetTables, newTable]);
    setShowAddTableModal(false);
    setNewTableName("");
    toast.success(`Đã thêm ${newTable.name}!`);
  };

  const handleAddSeatToTable = (tableId: string) => {
    const updated = banquetTables.map((t) => {
      if (t.id === tableId) return { ...t, seatsCount: t.seatsCount + 1 };
      return t;
    });
    saveBanquetTables(updated);
    toast.success("Đã thêm 1 ghế vào bàn!");
  };

  const handleRemoveSeatFromTable = (tableId: string) => {
    const updated = banquetTables.map((t) => {
      if (t.id === tableId && t.seatsCount > 1) return { ...t, seatsCount: t.seatsCount - 1 };
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

  const handleResetLayout = () => {
    if (!window.confirm("Khôi phục sơ đồ chỗ ngồi về mặc định ban đầu của sự kiện này?")) return;
    if (mode === "cinema") {
      saveCinemaRows(CINEMA_ROWS);
      saveStageSeatsCount(6);
    } else if (mode === "zones") {
      saveSeatingZones(DEFAULT_SEATING_ZONES);
    } else {
      saveBanquetTables(BANQUET_TABLES);
    }
    toast.success("Đã khôi phục sơ đồ ghế mặc định!");
  };

  // Click & Move Seat Handler
  const handleSeatClick = (seatId: string, seatLabel: string) => {
    if (movingFrom) {
      if (movingFrom.seatLabel === seatLabel || movingFrom.seatId === seatId) {
        setMovingFrom(null);
        toast.info("Đã hủy thao tác di chuyển ghế");
        return;
      }
      const targetOcc = findOccupant(seatId, seatLabel);
      if (onMoveSeat) {
        onMoveSeat(
          movingFrom.seatLabel,
          seatLabel,
          movingFrom.occupant || { attendeeName: "", seatLabel: movingFrom.seatLabel }
        );
      } else {
        onSelectSeat(seatLabel);
      }
      setSelectedSeat(seatLabel);
      toast.success(
        targetOcc
          ? `Đã hoán đổi chỗ ngồi giữa ${movingFrom.seatLabel} ⇆ ${seatLabel}`
          : `Đã di chuyển thành công sang ${seatLabel}`
      );
      setMovingFrom(null);
      return;
    }

    setSelectedSeat(seatLabel);
    onSelectSeat(seatLabel);
  };

  const handleDropOnSeat = (targetSeatLabel: string, targetSeatId: string) => {
    if (!movingFrom) return;
    if (movingFrom.seatLabel === targetSeatLabel || movingFrom.seatId === targetSeatId) {
      setMovingFrom(null);
      return;
    }
    const targetOcc = findOccupant(targetSeatId, targetSeatLabel);
    if (onMoveSeat) {
      onMoveSeat(
        movingFrom.seatLabel,
        targetSeatLabel,
        movingFrom.occupant || { attendeeName: "", seatLabel: movingFrom.seatLabel }
      );
    } else {
      onSelectSeat(targetSeatLabel);
    }
    setSelectedSeat(targetSeatLabel);
    toast.success(
      targetOcc
        ? `Đã hoán đổi chỗ ngồi: ${movingFrom.seatLabel} ⇆ ${targetSeatLabel}`
        : `Đã di chuyển đại biểu sang ${targetSeatLabel}`
    );
    setMovingFrom(null);
  };

  // Danh sách đại biểu đã được xếp chỗ để hiển thị trực quan ra bảng
  const occupiedList = useMemo(() => {
    const list: Array<{ seatKey: string; occupant: SeatOccupant }> = [];
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

  const selectedOccupant = selectedSeat ? findOccupant(selectedSeat, selectedSeat) : undefined;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* ── TOP HEADER & ACTIONS ── */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[#003B95]/10 dark:bg-amber-400/10 flex items-center justify-center text-[#003B95] dark:text-amber-400">
            {mode === "cinema" ? (
              <Layers className="h-5 w-5" />
            ) : mode === "zones" ? (
              <LayoutGrid className="h-5 w-5" />
            ) : (
              <UtensilsCrossed className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {mode === "cinema"
                ? "Sơ đồ Ghế Hội Trường (Hàng Ngang)"
                : mode === "zones"
                ? "Sơ đồ Chia Khu (Hình Vuông & Hình Chữ Nhật)"
                : "Sơ đồ Bàn Tiệc Gala (Banquet)"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {mode === "cinema"
                ? "Hàng VIP & Ghế Tiêu Chuẩn · Di chuyển ghế & Hoán đổi linh hoạt"
                : mode === "zones"
                ? "Phân khu ma trận hình chữ nhật & vuông cụ thể · Tùy chỉnh hàng x cột"
                : "Bàn tiệc tròn, vuông & chữ nhật · Kéo thả sắp xếp đại biểu"}
            </p>
          </div>
        </div>

        {/* Action buttons: Switcher 3 Tabs, + Thêm, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher 3 Tabs */}
          <div className="inline-flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("cinema")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "cinema"
                  ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Hội Trường
            </button>
            <button
              type="button"
              onClick={() => setMode("zones")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "zones"
                  ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Chia Khu (Vuông / Chữ Nhật)
            </button>
            <button
              type="button"
              onClick={() => setMode("banquet")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "banquet"
                  ? "bg-white dark:bg-slate-900 text-[#003B95] dark:text-amber-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Bàn Tiệc Gala
            </button>
          </div>

          {/* + Nút thêm tương ứng */}
          {mode === "cinema" && (
            <button
              type="button"
              onClick={() => setShowAddRowModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>+ Thêm hàng</span>
            </button>
          )}

          {mode === "zones" && (
            <button
              type="button"
              onClick={() => setShowAddZoneModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>+ Thêm khu vực</span>
            </button>
          )}

          {mode === "banquet" && (
            <button
              type="button"
              onClick={() => setShowAddTableModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002B70] transition cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>+ Thêm bàn tiệc</span>
            </button>
          )}

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetLayout}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            title="Khôi phục sơ đồ mặc định"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* ── BANNER TRẠNG THÁI DI CHUYỂN GHẾ ── */}
      {movingFrom && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-semibold">
            <span className="flex h-7 w-7 rounded-full bg-amber-500 text-slate-950 items-center justify-center font-bold text-xs shrink-0 shadow-xs animate-bounce">
              <ArrowLeftRight className="size-3.5" />
            </span>
            <div>
              <p className="font-bold">
                Đang di chuyển: <span className="text-[#003B95] dark:text-amber-400 font-black">{movingFrom.seatLabel}</span>
                {movingFrom.occupant?.attendeeName && (
                  <span className="text-emerald-700 dark:text-emerald-400"> ({movingFrom.occupant.attendeeName})</span>
                )}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                ➜ Nhấp vào bất kỳ ghế nào trên sơ đồ (hoặc kéo thả) để di chuyển hoặc hoán đổi vị trí đại biểu!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMovingFrom(null);
              toast.info("Đã hủy chế độ di chuyển ghế");
            }}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 text-xs shadow-xs"
          >
            Hủy thao tác
          </button>
        </div>
      )}

      {/* ── SEATING MAP CANVAS ── */}
      <div className="p-4 sm:p-6 overflow-x-auto min-h-[460px] flex flex-col items-center justify-start bg-slate-100/50 dark:bg-slate-950/40">
        {mode === "cinema" ? (
          /* ========================================================
             CHẾ ĐỘ 1: HỘI TRƯỜNG (CINEMA) - HÀNG GHẾ NGANG
             ======================================================== */
          <div className="w-full max-w-4xl flex flex-col items-center space-y-6">
            {/* SÂN KHẤU TRUNG TÂM */}
            <div className="w-full max-w-xl text-center py-2 px-6 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white shadow-md border-b-4 border-amber-400">
              <div className="text-xs uppercase tracking-widest font-black text-amber-400 flex items-center justify-center gap-2">
                <span>✦</span> SÂN KHẤU CHÍNH SỰ KIỆN <span>✦</span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium">Khu vực Trình diễn & Tọa đàm</div>
            </div>

            {/* SÂN KHẤU: BÀN CHỦ TỌA */}
            <div className="w-full max-w-xl p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center gap-2">
              <div className="w-full flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="size-3 text-amber-600" />
                  ĐOÀN CHỦ TỊCH / KHÁCH MỜI TRÊN SÂN KHẤU ({stageSeatsCount} ghế)
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
                  const isBeingMoved = movingFrom?.seatLabel === seatLabel || movingFrom?.seatId === seatId;

                  return (
                    <button
                      key={seatId}
                      type="button"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", seatLabel);
                        setMovingFrom({ seatId, seatLabel, occupant: occ });
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropOnSeat(seatLabel, seatId);
                      }}
                      onClick={() => handleSeatClick(seatId, seatLabel)}
                      className={`relative min-w-[72px] sm:min-w-[80px] h-12 rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                        isBeingMoved
                          ? "ring-4 ring-amber-500 bg-amber-500 text-slate-950 font-black animate-pulse scale-105 z-20"
                          : isSelected
                          ? "bg-[#003B95] text-white ring-2 ring-amber-400 shadow-md scale-105 z-10"
                          : isOccupied
                          ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400/40 hover:bg-amber-200"
                      }`}
                      title={occ ? `${seatLabel} - ${occ.attendeeName} (${occ.company || ""}) - Kéo hoặc click để di chuyển` : `${seatLabel} - Ghế trống`}
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

                    {/* Row Letter Header */}
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
                      const isBeingMoved = movingFrom?.seatLabel === seatLabel || movingFrom?.seatId === seatId;
                      const isCenterAisle = num === Math.ceil(row.seatsCount / 2);

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", seatLabel);
                              setMovingFrom({ seatId, seatLabel, occupant: occ });
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropOnSeat(seatLabel, seatId);
                            }}
                            onClick={() => handleSeatClick(seatId, seatLabel)}
                            className={`group relative flex-1 min-w-[36px] sm:min-w-[44px] max-w-[58px] h-12 rounded-xl p-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                              isBeingMoved
                                ? "ring-4 ring-amber-500 bg-amber-500 text-slate-950 font-black animate-pulse scale-105 z-20"
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
                                ? `${seatLabel}: ${occ.attendeeName} (${occ.company || "Hội viên"}) - Kéo hoặc click để di chuyển`
                                : `${seatLabel} - Ghế trống`
                            }
                          >
                            <span className="text-[10px] font-black leading-none block">{seatId}</span>
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

                          {/* Lối đi giữa */}
                          {isCenterAisle && (
                            <div className="w-2.5 sm:w-4 flex items-center justify-center shrink-0">
                              <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Right Controls: + / - / Xóa */}
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
                        title="+ Thêm 1 ghế vào hàng"
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

            {/* Quick Add Row Action Card */}
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
        ) : mode === "zones" ? (
          /* ========================================================
             CHẾ ĐỘ 2: CHIA KHU VỰC CỤ THỂ (HÌNH VUÔNG & HÌNH CHỮ NHẬT)
             ======================================================== */
          <div className="w-full max-w-5xl flex flex-col items-center space-y-6">
            {/* SÂN KHẤU TRUNG TÂM */}
            <div className="w-full max-w-xl text-center py-2 px-6 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white shadow-md border-b-4 border-amber-400">
              <div className="text-xs uppercase tracking-widest font-black text-amber-400 flex items-center justify-center gap-2">
                <span>✦</span> SÂN KHẤU CHÍNH HỘI TRƯỜNG <span>✦</span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium">Định hướng góc nhìn các phân khu sự kiện</div>
            </div>

            {/* LƯỚI CÁC PHÂN KHU HÌNH VUÔNG & HÌNH CHỮ NHẬT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
              {seatingZones.map((zone) => {
                const isRect = zone.shape === "rect";
                const isVip = zone.isVip;
                const totalSeats = zone.rowsCount * zone.colsCount;

                let zoneOccupiedCount = 0;
                for (let r = 1; r <= zone.rowsCount; r++) {
                  for (let c = 1; c <= zone.colsCount; c++) {
                    const sId = `${zone.id}-R${r}-${String(c).padStart(2, "0")}`;
                    const sLabel = `${zone.name} - Hàng ${r} Ghế ${c}`;
                    if (findOccupant(sId, sLabel)) zoneOccupiedCount++;
                  }
                }

                return (
                  <div
                    key={zone.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isVip
                        ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/40 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
                    }`}
                  >
                    {/* Zone Header */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            isVip
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {zone.id} · {isVip ? "Khu VIP" : "Tiêu Chuẩn"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          {isRect ? "📐 Khung Chữ Nhật" : "⏹ Khung Hình Vuông"} ({zone.rowsCount}H x {zone.colsCount}C = {totalSeats} ghế)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300">
                          {zoneOccupiedCount}/{totalSeats} chỗ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteZone(zone.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa khu vực này"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Zone Name */}
                    <div className="pt-2 pb-2">
                      <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {isVip && <Crown className="size-3.5 text-amber-500" />}
                        <span>{zone.name}</span>
                      </h5>
                    </div>

                    {/* Khung Hình Chữ Nhật / Hình Vuông cụ thể chứa Ma Trận Ghế */}
                    <div
                      className={`my-2 p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 overflow-x-auto ${
                        isRect
                          ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 min-h-[140px]"
                          : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 min-h-[160px] aspect-square max-w-[380px] mx-auto w-full"
                      }`}
                    >
                      {Array.from({ length: zone.rowsCount }, (_, rIdx) => {
                        const rowNum = rIdx + 1;
                        return (
                          <div key={rowNum} className="flex items-center gap-1.5 justify-center w-full">
                            <span className="w-5 text-[9.5px] font-black font-mono text-slate-400 text-right shrink-0">
                              H{rowNum}
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 justify-center">
                              {Array.from({ length: zone.colsCount }, (_, cIdx) => {
                                const colNum = cIdx + 1;
                                const seatId = `${zone.id}-R${rowNum}-${String(colNum).padStart(2, "0")}`;
                                const seatLabel = `${zone.name} - Hàng ${rowNum} Ghế ${colNum}`;
                                const occ = findOccupant(seatId, seatLabel);
                                const isSelected = selectedSeat === seatLabel || selectedSeat === seatId;
                                const isOccupied = !!occ;
                                const isBeingMoved = movingFrom?.seatLabel === seatLabel || movingFrom?.seatId === seatId;

                                return (
                                  <button
                                    key={seatId}
                                    type="button"
                                    draggable={true}
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", seatLabel);
                                      setMovingFrom({ seatId, seatLabel, occupant: occ });
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = "move";
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      handleDropOnSeat(seatLabel, seatId);
                                    }}
                                    onClick={() => handleSeatClick(seatId, seatLabel)}
                                    className={`h-9 min-w-[34px] sm:min-w-[40px] flex-1 max-w-[52px] rounded-lg p-0.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                                      isBeingMoved
                                        ? "ring-4 ring-amber-500 bg-amber-500 text-slate-950 font-black animate-pulse scale-105 z-20"
                                        : isSelected
                                        ? "bg-[#003B95] text-white ring-2 ring-amber-400 font-bold shadow-md scale-105 z-10"
                                        : isOccupied
                                        ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 hover:scale-105"
                                        : isVip
                                        ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300/60 hover:bg-amber-200"
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                    }`}
                                    title={occ ? `${seatLabel}: ${occ.attendeeName} - Kéo hoặc click để di chuyển` : `${seatLabel} - Ghế trống`}
                                  >
                                    <span className="text-[9.5px] font-black leading-none block">{colNum}</span>
                                    {occ ? (
                                      <span className="text-[8px] font-bold truncate max-w-[34px] block text-emerald-100 leading-tight mt-0.5">
                                        {occ.attendeeName.split(" ").slice(-1)[0]}
                                      </span>
                                    ) : (
                                      <span className="text-[7.5px] opacity-60 block mt-0.5">G{colNum}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Zone Controls: Thêm / Bớt Hàng & Cột */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px] font-medium">Hàng ({zone.rowsCount}):</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateZoneRows(zone.id, -1)}
                          disabled={zone.rowsCount <= 1}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-20 cursor-pointer"
                          title="Bớt 1 hàng ghế"
                        >
                          <Minus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateZoneRows(zone.id, 1)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
                          title="+ Thêm 1 hàng ghế"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px] font-medium">Cột ({zone.colsCount}):</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateZoneCols(zone.id, -1)}
                          disabled={zone.colsCount <= 1}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-20 cursor-pointer"
                          title="Bớt 1 cột ghế"
                        >
                          <Minus className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateZoneCols(zone.id, 1)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
                          title="+ Thêm 1 cột ghế"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Zone Button */}
            <div className="w-full pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowAddZoneModal(true)}
                className="w-full max-w-sm py-2 px-4 rounded-xl border-2 border-dashed border-[#003B95]/40 hover:border-[#003B95] bg-[#003B95]/5 hover:bg-[#003B95]/10 text-[#003B95] dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ Thêm phân khu mới (Hình vuông / Hình chữ nhật)</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             CHẾ ĐỘ 3: BÀN TIỆC GALA (BANQUET): TRÒN, CHỮ NHẬT & VUÔNG
             ======================================================== */
          <div className="w-full max-w-4xl flex flex-col items-center space-y-6">
            <div className="flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide border border-amber-500/20">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                KHÔNG GIAN TIỆC GALA DINNER · BÀN TRÒN, CHỮ NHẬT & VUÔNG
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
                          {table.id} · {table.shape === "rect" ? "Bàn Chữ Nhật" : table.shape === "square" ? "Bàn Vuông" : "Bàn Tròn"}
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

                    {/* Khung mô phỏng hình dạng bàn tiệc cụ thể */}
                    <div className="my-3 flex items-center justify-center">
                      {table.shape === "rect" ? (
                        <div
                          className={`h-16 w-36 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 text-center shadow-inner relative ${
                            table.isVip
                              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">
                            {table.id} · BÀN CHỮ NHẬT
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                            {table.seatsCount} Ghế
                          </span>
                        </div>
                      ) : table.shape === "square" ? (
                        <div
                          className={`h-22 w-22 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 text-center shadow-inner relative ${
                            table.isVip
                              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">
                            {table.id} · BÀN VUÔNG
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                            {table.seatsCount} Ghế
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`h-24 w-24 rounded-full border-2 flex flex-col items-center justify-center p-2 text-center shadow-inner relative ${
                            table.isVip
                              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <span className="text-[10.5px] font-black text-slate-800 dark:text-slate-100">
                            {table.id} · BÀN TRÒN
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                            {table.seatsCount} Ghế
                          </span>
                        </div>
                      )}
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
                        const isBeingMoved = movingFrom?.seatLabel === seatLabel || movingFrom?.seatId === seatId;

                        return (
                          <button
                            key={seatId}
                            type="button"
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", seatLabel);
                              setMovingFrom({ seatId, seatLabel, occupant: occ });
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropOnSeat(seatLabel, seatId);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeatClick(seatId, seatLabel);
                            }}
                            className={`h-8 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isBeingMoved
                                ? "ring-4 ring-amber-500 bg-amber-500 text-slate-950 font-black animate-pulse scale-105 z-20"
                                : isSelected
                                ? "bg-[#003B95] text-white ring-2 ring-amber-400 font-black shadow-sm"
                                : isOccupied
                                ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title={occ ? `${seatLabel}: ${occ.attendeeName} - Kéo hoặc click để di chuyển` : `${seatLabel} - Ghế trống`}
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

      {/* ── MODAL: + THÊM PHÂN KHU MỚI (HÌNH VUÔNG & HÌNH CHỮ NHẬT) ── */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <LayoutGrid className="size-4 text-[#003B95] dark:text-blue-400" />
                <span>Thêm phân khu sự kiện mới</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddZoneModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên phân khu:
                </label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder={`Ví dụ: Khu VIP Trung Tâm / Khu Doanh Nghiệp`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dạng chia khung hình học:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewZoneShape("rect")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newZoneShape === "rect"
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>📐 Hình Chữ Nhật</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewZoneShape("square");
                      setNewZoneCols(newZoneRows);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newZoneShape === "square"
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>⏹ Hình Vuông</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Số hàng ghế:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newZoneRows}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setNewZoneRows(v);
                      if (newZoneShape === "square") setNewZoneCols(v);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Số cột (ghế/hàng):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newZoneCols}
                    disabled={newZoneShape === "square"}
                    onChange={(e) => setNewZoneCols(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phân cấp khu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewZoneIsVip(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      !newZoneIsVip
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Tiêu Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewZoneIsVip(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newZoneIsVip
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Crown className="size-3 text-amber-950" />
                    <span>Khu VIP</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
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
                  Hình dạng bàn tiệc:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewTableShape("round")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
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
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newTableShape === "rect"
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Chữ Nhật
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTableShape("square")}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      newTableShape === "square"
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Bàn Vuông
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
                  max={24}
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
                Click vào bất kỳ ghế nào để chọn vị trí này cho đại biểu cần xếp chỗ, hoặc bấm Di chuyển ghế để hoán đổi chỗ ngồi.
              </p>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (!selectedSeat) {
                  toast.error("Vui lòng click chọn 1 ghế trên sơ đồ trước!");
                  return;
                }
                setMovingFrom({
                  seatId: selectedSeat,
                  seatLabel: selectedSeat,
                  occupant: selectedOccupant,
                });
                toast.info(`Đang di chuyển: ${selectedSeat}. Hãy click vào ghế đích trên sơ đồ để chuyển/hoán đổi!`);
              }}
              disabled={!selectedSeat}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>
                {selectedOccupant ? "Di chuyển / Hoán đổi đại biểu này" : "Di chuyển / Hoán đổi vị trí ghế này"}
              </span>
            </button>

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

        {/* CỘT 2 & 3: BẢNG DANH SÁCH ĐẠI BIỂU ĐÃ XẾP CHỖ */}
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
                                setMovingFrom({ seatId: item.seatKey, seatLabel: item.seatKey, occupant: item.occupant });
                                toast.info(`Đang di chuyển: ${item.seatKey}. Nhấp vào ghế đích cần chuyển đến!`);
                              }}
                              className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[10.5px] font-bold border border-amber-300/60 inline-flex items-center gap-1 cursor-pointer"
                              title="Chuyển đại biểu này sang ghế khác"
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                              <span>Di chuyển</span>
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
