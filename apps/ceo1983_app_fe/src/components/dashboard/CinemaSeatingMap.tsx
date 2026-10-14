import React, { useState, useMemo } from "react";
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
} from "lucide-react";

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
      {/* ── TOP HEADER & MODE SWITCHER ── */}
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
                ? "Sân khấu trung tâm · Hàng VIP & Ghế Tiêu Chuẩn"
                : "Bàn tiệc tròn & chữ nhật theo khu vực đại biểu"}
            </p>
          </div>
        </div>

        {/* Switcher & Search */}
        <div className="flex items-center gap-2">
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
          <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
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

            {/* SÂN KHẤU: BÀN CHỦ TỌA (6 GHẾ) */}
            <div className="w-full max-w-lg p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                ĐOÀN CHỦ TỊCH / KHÁCH MỜI DANH DỰ TRÊN SÂN KHẤU
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((num) => {
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
              {CINEMA_ROWS.map((row) => (
                <div key={row.id} className="flex items-center gap-2 sm:gap-3">
                  {/* Row Letter Header */}
                  <div
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 select-none shadow-xs ${
                      row.category === "vip"
                        ? "bg-amber-500 text-slate-950 border border-amber-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {row.rowLetter}
                  </div>

                  {/* Seat Blocks with Center Aisle */}
                  <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2">
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
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================
             CHẾ ĐỘ BÀN TIỆC GALA (BANQUET): CÁC BÀN TIỆC & GHẾ
             ======================================================== */
          <div className="w-full max-w-3xl flex flex-col items-center space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide border border-amber-500/20">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                KHÔNG GIAN TIỆC GALA DINNER · ĐỒNG HÀNH & KẾT NỐI
              </span>
            </div>

            {/* Bàn tiệc Gala dạng Grid 4 cột đều đặn, trang trọng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {BANQUET_TABLES.map((table) => {
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
                        <span className="text-[10px] font-bold text-slate-500">
                          {tableOccupiedCount}/{table.seatsCount} chỗ
                        </span>
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
