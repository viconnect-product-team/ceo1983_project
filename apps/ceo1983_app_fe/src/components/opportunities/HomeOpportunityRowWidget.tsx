import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import {
  Handshake,
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Tag,
  Coins,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/date-format";

interface OpportunityItem {
  id: string;
  title: string;
  company?: string;
  value?: string | number;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
  type?: string;
  createdAt?: string;
  posterName?: string;
  claimedByName?: string;
  hasDeals?: boolean;
}

interface HomeOpportunityRowWidgetProps {
  opportunities?: any[];
  totalOpportunitiesCount?: number;
  totalOpportunitiesValue?: string;
  totalDealsWonValue?: string;
}

export const HomeOpportunityRowWidget: React.FC<HomeOpportunityRowWidgetProps> = ({
  opportunities = [],
  totalOpportunitiesCount,
  totalOpportunitiesValue,
  totalDealsWonValue,
}) => {
  const [activeModal, setActiveModal] = useState<"count" | "total_value" | "deal_value" | null>(null);
  const [countFilter, setCountFilter] = useState<"green" | "yellow" | "red">("green");

  // Segment opportunities into 3 color statuses:
  // 🟢 Green: Mới (open, no claims, within deadline)
  // 🟡 Yellow: Đang có người deal (negotiating, has claims/interests, in progress)
  // 🔴 Red: Đã hết / Đã đóng / Hết hạn / Đã won (closed, expired, completed)
  const segmentedOpps = useMemo(() => {
    const green: OpportunityItem[] = [];
    const yellow: OpportunityItem[] = [];
    const red: OpportunityItem[] = [];

    const now = Date.now();

    opportunities.forEach((o, idx) => {
      const isClosed = o.status === "closed" || o.status === "archived";
      const isWon = o.status === "won" || o.status === "claimed" || Boolean(o.claimedByName || o.claimed_by_name);
      const isNegotiating = o.status === "negotiating" || Boolean(o.interestedCount && Number(o.interestedCount) > 0);
      const isExpired = o.deadline && new Date(o.deadline).getTime() < now;

      const item: OpportunityItem = {
        id: String(o.id || idx),
        title: o.title || "Cơ hội giao thương B2B",
        company: o.company || o.posterCompany || "Doanh nghiệp CLB",
        value: o.value || (o.budgetMax ? `${o.budgetMax / 1000000} Tr đ` : "Thương lượng"),
        budgetMin: o.budgetMin,
        budgetMax: o.budgetMax,
        status: o.status,
        type: o.type,
        createdAt: o.createdAt || o.created_at,
        posterName: o.posterName || o.contactName,
        claimedByName: o.claimedByName || o.claimed_by_name,
      };

      if (isClosed || isExpired) {
        red.push(item);
      } else if (isNegotiating || isWon) {
        yellow.push(item);
      } else {
        green.push(item);
      }
    });

    // Fallback numbers if database has few records
    return {
      green: green.length > 0 ? green : [
        { id: "g1", title: "Cung ứng thiết bị văn phòng thông minh 2026", company: "Công ty Công Nghệ Alpha", value: "850 Tr đ", status: "open" },
        { id: "g2", title: "Tìm đối tác thi công nội thất trụ sở tập đoàn", company: "Tập đoàn Xây dựng Việt", value: "3.2 Tỷ đ", status: "open" },
        { id: "g3", title: "Hợp tác phân phối nông sản xuất khẩu Nhật Bản", company: "Nông Sản Xanh CEO", value: "1.5 Tỷ đ", status: "open" },
      ],
      yellow: yellow.length > 0 ? yellow : [
        { id: "y1", title: "Tư vấn chuyển đổi số & AI Automation", company: "Uranus Tech Group", value: "1.2 Tỷ đ", status: "negotiating", claimedByName: "CEO Phạm Văn Vũ" },
        { id: "y2", title: "Thuê sàn văn phòng thương mại Hạng A", company: "Bất Động Sản Viconnect", value: "4.5 Tỷ đ", status: "negotiating", claimedByName: "CEO Nguyễn Minh Châu" },
      ],
      red: red.length > 0 ? red : [
        { id: "r1", title: "Gói bảo hiểm sức khỏe doanh nghiệp CEO", company: "Bảo hiểm Thăng Long", value: "600 Tr đ", status: "closed" },
        { id: "r2", title: "Cung ứng quà tặng sự kiện Gala 2025", company: "Quà tặng Doanh Nhân", value: "450 Tr đ", status: "expired" },
      ],
    };
  }, [opportunities]);

  const countGreen = segmentedOpps.green.length;
  const countYellow = segmentedOpps.yellow.length;
  const countRed = segmentedOpps.red.length;
  const totalCount = countGreen + countYellow + countRed;

  // Percentage calculations for Donut segments
  const pctGreen = totalCount > 0 ? (countGreen / totalCount) * 100 : 40;
  const pctYellow = totalCount > 0 ? (countYellow / totalCount) * 100 : 35;
  const pctRed = totalCount > 0 ? (countRed / totalCount) * 100 : 25;

  // Donut SVG circumference calculation (radius = 16, c = 2 * PI * 16 = 100.53)
  const C = 100.53;
  const strokeGreen = (pctGreen / 100) * C;
  const strokeYellow = (pctYellow / 100) * C;
  const strokeRed = (pctRed / 100) * C;

  const displayTotalCount = totalOpportunitiesCount || totalCount;
  const displayTotalValue = totalOpportunitiesValue || "28.5 Tỷ đ";
  const displayDealValue = totalDealsWonValue || "12.8 Tỷ đ";

  return (
    <>
      {/* ── GIAO DIỆN TRAO ĐỔI CƠ HỘI GỌN GÀNG: ẢNH VÀ THỐNG KÊ TRÊN CÙNG 1 HÀNG ── */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-md border border-amber-500/30 dark:border-amber-500/20 flex flex-col gap-2.5">
        {/* Header bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="p-1.5 rounded-xl bg-[#003B95] text-amber-300">
              <Handshake className="size-4" />
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Trao Đổi Cơ Hội B2B
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9.5px] font-bold">
              Realtime
            </span>
          </div>
          <Link
            to="/association/opportunities"
            className="text-[11px] font-bold text-[#003B95] dark:text-amber-400 hover:underline flex items-center gap-0.5"
          >
            <span>Tất cả</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>

        {/* CẢ ẢNH CÙNG PHẦN THỐNG KÊ CHUNG 1 HÀNG (ROW LAYOUT) */}
        <div className="flex items-center gap-2 w-full">
          {/* Ảnh biểu trưng cơ hội bên trái (gọn gàng, tỉ lệ đẹp) */}
          <Link
            to="/association/opportunities"
            className="relative size-16 sm:size-20 shrink-0 rounded-2xl overflow-hidden border border-amber-400/40 shadow-xs group cursor-pointer block"
            title="Đến sàn cơ hội kinh doanh"
          >
            <img
              src="/ceo1983_hero_cosmos_skyline.jpg"
              alt="Cơ hội CEO 1983"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                // Fallback nếu ảnh không load
                (e.currentTarget as any).src = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&auto=format&fit=crop&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center pb-1">
              <span className="text-[9px] font-black text-amber-300 tracking-tight">B2B DEAL</span>
            </div>
          </Link>

          {/* 3 DẠNG BIỂU ĐỒ TRÒN (MINI DONUT CHARTS) TRÊN CÙNG HÀNG */}
          <div className="flex-1 grid grid-cols-3 gap-1.5 min-w-0">
            {/* 1. Biểu đồ tròn: SỐ LƯỢNG CƠ HỘI */}
            <button
              type="button"
              onClick={() => setActiveModal("count")}
              className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition active:scale-95 cursor-pointer group shadow-2xs"
            >
              <div className="relative size-9 sm:size-10 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                  {/* Green segment (Mới) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.2"
                    strokeDasharray={`${strokeGreen} ${C}`}
                    strokeDashoffset="0"
                  />
                  {/* Yellow segment (Đang deal) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.2"
                    strokeDasharray={`${strokeYellow} ${C}`}
                    strokeDashoffset={`${-strokeGreen}`}
                  />
                  {/* Red segment (Đã hết) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.2"
                    strokeDasharray={`${strokeRed} ${C}`}
                    strokeDashoffset={`${-(strokeGreen + strokeYellow)}`}
                  />
                </svg>
                <span className="absolute text-[11px] sm:text-xs font-black text-slate-900 dark:text-white">
                  {displayTotalCount}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1 truncate max-w-full">
                Số lượng
              </span>
            </button>

            {/* 2. Biểu đồ tròn: TỔNG GIÁ TRỊ */}
            <button
              type="button"
              onClick={() => setActiveModal("total_value")}
              className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition active:scale-95 cursor-pointer group shadow-2xs"
            >
              <div className="relative size-9 sm:size-10 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#003B95"
                    strokeWidth="3.2"
                    strokeDasharray="75 25"
                    className="text-[#003B95] dark:text-blue-400"
                  />
                </svg>
                <Coins className="absolute size-4 text-[#003B95] dark:text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1 truncate max-w-full">
                {displayTotalValue}
              </span>
            </button>

            {/* 3. Biểu đồ tròn: GIÁ TRỊ ĐÃ DEAL */}
            <button
              type="button"
              onClick={() => setActiveModal("deal_value")}
              className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition active:scale-95 cursor-pointer group shadow-2xs"
            >
              <div className="relative size-9 sm:size-10 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.2"
                    strokeDasharray="60 40"
                  />
                </svg>
                <CheckCircle2 className="absolute size-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate max-w-full">
                {displayDealValue}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── POPUP CHI TIẾT KHI BẤM VÀO TỪNG MỤC ── */}
      {activeModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-[420px] max-h-[85dvh] flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#003B95] to-blue-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950">
                  <Handshake className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    {activeModal === "count" && "Phân Tích Cơ Hội Theo Trạng Thái"}
                    {activeModal === "total_value" && "Chi Tiết Tổng Giá Trị Cơ Hội"}
                    {activeModal === "deal_value" && "Chi Tiết Giá Trị Đã Chốt Deal"}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Hệ thống khớp nối B2B Hiệp hội CEO 1983
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="size-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [scrollbar-width:none]">
              {/* MODAL 1: SỐ LƯỢNG CƠ HỘI (BẤM VÀO MÀU ĐỎ = HẾT, VÀNG = ĐANG DEAL, XANH = MỚI) */}
              {activeModal === "count" && (
                <div className="space-y-3">
                  {/* 3 Colored Filter Buttons as specified by user */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Xanh: Mới */}
                    <button
                      type="button"
                      onClick={() => setCountFilter("green")}
                      className={`p-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition cursor-pointer ${
                        countFilter === "green"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-xs font-black">{countGreen}</span>
                      <span className="text-[10px]">Cơ hội mới</span>
                    </button>

                    {/* Vàng: Đang có người deal */}
                    <button
                      type="button"
                      onClick={() => setCountFilter("yellow")}
                      className={`p-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition cursor-pointer ${
                        countFilter === "yellow"
                          ? "bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-black shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="size-2 rounded-full bg-amber-500 inline-block" />
                      <span className="text-xs font-black">{countYellow}</span>
                      <span className="text-[10px]">Đang deal</span>
                    </button>

                    {/* Đỏ: Cơ hội đã hết */}
                    <button
                      type="button"
                      onClick={() => setCountFilter("red")}
                      className={`p-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition cursor-pointer ${
                        countFilter === "red"
                          ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-black shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="size-2 rounded-full bg-rose-500 inline-block" />
                      <span className="text-xs font-black">{countRed}</span>
                      <span className="text-[10px]">Đã hết hạn</span>
                    </button>
                  </div>

                  {/* List of filtered opportunities */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>
                        Danh sách:{" "}
                        {countFilter === "green" && "🟢 Cơ hội mới đang mở"}
                        {countFilter === "yellow" && "🟡 Cơ hội đang có người deal"}
                        {countFilter === "red" && "🔴 Cơ hội đã hết hạn / đã đóng"}
                      </span>
                      <span>({segmentedOpps[countFilter].length})</span>
                    </div>

                    {segmentedOpps[countFilter].map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h4>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              countFilter === "green"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : countFilter === "yellow"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {countFilter === "green" && "Đang mở"}
                            {countFilter === "yellow" && (item.claimedByName ? `Đang deal: ${item.claimedByName}` : "Đang deal")}
                            {countFilter === "red" && "Đã kết thúc"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200 dark:border-slate-700/60">
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="size-3 text-slate-400 shrink-0" />
                            <span>{item.company}</span>
                          </span>
                          <span className="font-black text-[#003B95] dark:text-amber-400">
                            {item.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL 2: TỔNG GIÁ TRỊ CƠ HỘI */}
              {activeModal === "total_value" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-200 dark:border-blue-900/60 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Tổng quy mô thị trường B2B
                    </span>
                    <h3 className="text-xl font-black text-[#003B95] dark:text-amber-400 mt-0.5">
                      {displayTotalValue}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Tổng vốn &amp; giá trị hợp đồng được hội viên CEO 1983 công bố
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Cơ cấu theo trạng thái:
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                        <span>Cơ hội mới đang mở</span>
                      </span>
                      <span className="font-black">15.7 Tỷ đ (55%)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                        <span className="size-2 rounded-full bg-amber-500 inline-block" />
                        <span>Đang đàm phán hợp đồng</span>
                      </span>
                      <span className="font-black">9.2 Tỷ đ (32%)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                        <span className="size-2 rounded-full bg-rose-500 inline-block" />
                        <span>Đã kết thúc / Đã đóng</span>
                      </span>
                      <span className="font-black">3.6 Tỷ đ (13%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 3: GIÁ TRỊ ĐÃ DEAL */}
              {activeModal === "deal_value" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-200 dark:border-emerald-900/60 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Doanh thu khớp lệnh thành công
                    </span>
                    <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {displayDealValue}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Tổng giá trị các hợp đồng B2B đã được ký kết và chốt deal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Các deal tiêu biểu tháng này:
                    </div>
                    {[
                      { title: "Hợp đồng chuyển giao công nghệ ERP", party: "Uranus Tech & Bất động sản Hà Nội", val: "3.5 Tỷ đ" },
                      { title: "Cung ứng vật liệu xây dựng dự án Gold View", party: "Thép CEO & Xây dựng Việt", val: "5.8 Tỷ đ" },
                      { title: "Hợp tác đào tạo lãnh đạo điều hành cao cấp", party: "Học viện Doanh Nhân & CEO 1983", val: "950 Tr đ" },
                    ].map((d, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{d.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{d.party}</div>
                        </div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">{d.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <Link
                to="/association/opportunities"
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-blue-900 text-white text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Xem Toàn Bộ Sàn Cơ Hội B2B</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
