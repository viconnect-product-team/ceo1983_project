import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  Eye,
  Building2,
  Users,
  Handshake,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Briefcase,
  User,
  Pencil,
  Trash2,
  Check,
  Flame,
} from "lucide-react";
import type { MyOpportunity } from "@/lib/member-app.functions";

export interface OpportunityDetailModalProps {
  selectedOpp: (MyOpportunity & { description?: string; interests?: any[]; interestedMembers?: any[] }) | null;
  onClose: () => void;
  defaultOppImages: string[];
  resolveMediaUrl: (url?: string | null) => string | null;
  normalizeTag: (tag: string) => string;
  formatSmartPrice: (val: any) => string;
  fmt: { rel: (d?: any) => string };
  checkCanManageOpp: (opp: MyOpportunity) => boolean;
  interestedMembers: Array<{
    memberId: string;
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    expressedAt: string;
  }>;
  loadingInterests: boolean;
  handleNegotiateWithMember: (m: any, opp: any) => void;
  navigate: (opts: any) => void;
  checkIsMine: (opp: MyOpportunity) => boolean;
  onEdit: (opp: MyOpportunity & { description?: string }, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onNegotiate: (opp: any) => void;
  interestedIds: string[];
  onInterest: (id: string) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  selectedOpp,
  onClose,
  defaultOppImages,
  resolveMediaUrl,
  normalizeTag,
  formatSmartPrice,
  fmt,
  checkCanManageOpp,
  interestedMembers,
  loadingInterests,
  handleNegotiateWithMember,
  navigate,
  checkIsMine,
  onEdit,
  onDelete,
  onNegotiate,
  interestedIds,
  onInterest,
}) => {
  if (typeof document === "undefined" || !selectedOpp) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-3 sm:p-4 bg-black/80 backdrop-blur-md w-full h-[100dvh] overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] my-auto flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white overflow-hidden animate-scale-in border border-slate-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster Header (Image 4) */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={
              (selectedOpp.image
                ? resolveMediaUrl(selectedOpp.image) || selectedOpp.image
                : null) || defaultOppImages[0]
            }
            alt={selectedOpp.title}
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer z-20"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2E3192]/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm border border-amber-400/30">
                <Sparkles className="h-3 w-3" />
                {normalizeTag(selectedOpp.tag)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/20">
                <Eye className="h-3 w-3 text-amber-300" />
                <span>{selectedOpp.views || 0} lượt xem</span>
              </span>
            </div>
            <h3 className="text-[16px] font-extrabold text-white line-clamp-2 leading-tight">
              {selectedOpp.title}
            </h3>
            <p className="text-[11px] text-amber-300/90 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
              <Building2 className="h-3 w-3 shrink-0" />
              <span>{selectedOpp.company}</span>
            </p>
          </div>
        </div>

        {/* 3-Column Metadata Strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-2.5 text-center border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="px-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
              Hạn tiếp nhận
            </span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
              {fmt.rel(selectedOpp.time)}
            </span>
          </div>
          <div className="px-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
              Địa bàn
            </span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
              Toàn quốc & B2B
            </span>
          </div>
          <div className="px-1">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
              Đối tượng
            </span>
            <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
              Hội viên CEO 1983
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-3.5 text-[13px] overflow-y-auto max-h-[55vh] [scrollbar-width:thin]">
          {/* Context Paragraphs */}
          <div className="space-y-2">
            <h4 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
              Chi tiết cơ hội hợp tác & giao thương
            </h4>
            <div className="text-slate-600 dark:text-slate-300 text-[12.5px] leading-relaxed whitespace-pre-line">
              {selectedOpp.description ||
                "Cơ hội hợp tác kinh doanh, chuyển giao công nghệ và mở rộng mạng lưới đối tác chiến lược dành riêng cho cộng đồng doanh nhân và hội viên CLB CEO 1983."}
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-slate-300 dark:border-white/10 my-2" />

          {/* CRM Deal Value Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent border border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-500">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  Giá trị hợp đồng / Deal CRM
                </span>
                <p className="text-[15px] font-black text-amber-600 dark:text-amber-400 whitespace-normal break-words">
                  {formatSmartPrice(selectedOpp.value)}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Xác thực CRM
            </span>
          </div>

          {/* Danh sách người quan tâm dành riêng cho người đăng cơ hội hoặc ban quản trị */}
          {Boolean(checkCanManageOpp(selectedOpp) || interestedMembers.length > 0) && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[13px] text-slate-900 dark:text-amber-300">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span>Hội viên đã quan tâm ({interestedMembers.length})</span>
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  CRM Realtime
                </span>
              </div>

              {loadingInterests ? (
                <p className="text-xs text-slate-400 text-center py-3">
                  Đang tải danh sách người quan tâm...
                </p>
              ) : interestedMembers.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-2 italic text-center">
                  Chưa có hội viên nào bấm quan tâm cơ hội này. Khi có người quan tâm, thông
                  tin liên hệ sẽ hiển thị tại đây.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {interestedMembers.map((m) => (
                    <div
                      key={m.memberId || m.phone}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#2E3192] text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {m.company || "Hội viên CLB CEO 1983"}
                          </div>
                          {m.expressedAt && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400">
                              {fmt.rel(m.expressedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => handleNegotiateWithMember(m, selectedOpp)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                          title="Lên lịch hẹn 1-1 đàm phán cơ hội này"
                        >
                          <Handshake className="h-3.5 w-3.5" />
                          <span>Đàm phán</span>
                        </button>
                        {m.phone && (
                          <a
                            href={`tel:${m.phone}`}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition"
                            title="Gọi điện"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 transition"
                            title="Gửi email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate({
                              to: "/association/messages",
                              search: { peerCode: m.memberId || m.phone },
                            });
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer"
                          title="Nhắn tin"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Highlighted Key Points (Image 4 Style) */}
          <div className="space-y-2 text-[12.5px] bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-500/20">
            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <Clock className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Thời hạn tiếp nhận:</strong> {fmt.rel(selectedOpp.time)} (Đang mở tiếp
                nhận hồ sơ)
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <MapPin className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Khu vực hợp tác:</strong> Toàn quốc & Liên kết mạng lưới vùng miền
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
              <Briefcase className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hình thức:</strong> {normalizeTag(selectedOpp.tag)} · Ưu đãi độc quyền
                hội viên CEO 1983
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200 pt-1 border-t border-amber-500/10">
              <User className="h-4 w-4 text-[#2E3192] dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span>
                  <strong>Người đăng / Đầu mối:</strong>{" "}
                  {selectedOpp.posterName ||
                    selectedOpp.contactName ||
                    "Hội viên CLB CEO 1983"}{" "}
                  {selectedOpp.contactTitle ? `(${selectedOpp.contactTitle})` : ""}
                </span>
                {selectedOpp.company && (
                  <span className="block text-slate-500 dark:text-slate-400 text-[11.5px]">
                    {selectedOpp.company}
                  </span>
                )}
                {(selectedOpp.posterPhone || selectedOpp.contactPhone) && (
                  <span className="block mt-0.5">
                    Hotline / Zalo:{" "}
                    <a
                      href={`tel:${selectedOpp.posterPhone || selectedOpp.contactPhone}`}
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline"
                    >
                      {selectedOpp.posterPhone || selectedOpp.contactPhone}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Buttons */}
        <div className="flex gap-2.5 px-4 py-3 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          {checkIsMine(selectedOpp) ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  const opp = selectedOpp;
                  onClose();
                  onEdit(opp, e);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/10 py-2.5 text-[12.5px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Chỉnh sửa cơ hội
              </button>
              <button
                type="button"
                onClick={(e) => onDelete(selectedOpp.id, e)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2.5 text-[12.5px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const opp = selectedOpp;
                  onClose();
                  onNegotiate(opp);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 text-[12.5px] font-bold text-white transition cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Handshake className="h-4 w-4" />
                Đàm phán 1-1
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetCode =
                    selectedOpp.posterCode || selectedOpp.posterId || "admin";
                  const targetName = selectedOpp.posterName || selectedOpp.company;
                  onClose();
                  navigate({
                    to: "/association/messages" as any,
                    search: { peerCode: targetCode, peerName: targetName } as any,
                  });
                }}
                style={{ color: "#ffffff" }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#2E3192] hover:bg-[#232677] py-2.5 text-[12.5px] font-bold text-white transition cursor-pointer shadow-md shadow-[#2E3192]/20"
              >
                <MessageSquare className="h-4 w-4" />
                Nhắn tin
              </button>

              {selectedOpp.interested || interestedIds.includes(selectedOpp.id) ? (
                <div className="flex items-center justify-center gap-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-2.5 text-[12px] font-bold">
                  <Check className="h-3.5 w-3.5" />
                  Đã quan tâm
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onInterest(selectedOpp.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 py-2.5 text-[12.5px] font-bold text-[#2E3192] dark:text-amber-400 hover:bg-amber-100 transition cursor-pointer"
                >
                  <Flame className="h-4 w-4 text-amber-500" />
                  Quan tâm
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
