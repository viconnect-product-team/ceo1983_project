import { useState, useEffect, useMemo } from "react";
import {
  X,
  QrCode,
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  Sparkles,
  Ticket,
  MapPin,
  Calendar,
  Trash2,
  UserCheck,
  Check,
  Phone,
  Save,
  Loader2,
} from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";
import { toast } from "sonner";
import type { EventItem, Registration } from "@/lib/events.functions";
import { fetchNestApi } from "@/lib/api-client";

interface EventCheckinGatekeeperModalProps {
  open: boolean;
  event: EventItem | null;
  onClose: () => void;
  onUpdateEvent?: () => void;
}

export function EventCheckinGatekeeperModal({
  open,
  event,
  onClose,
  onUpdateEvent,
}: EventCheckinGatekeeperModalProps) {
  const [activeTab, setActiveTab] = useState<"qr_standee" | "gatekeepers" | "attendees">("qr_standee");

  // Gatekeepers & Ban Truyền Thông members from real DB
  const [bttMembers, setBttMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [savingScanners, setSavingScanners] = useState(false);
  const [selectedScanners, setSelectedScanners] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Quick Attendee
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [showAddAttendeeForm, setShowAddAttendeeForm] = useState(false);
  const [attName, setAttName] = useState("");
  const [attCode, setAttCode] = useState("");
  const [attPhone, setAttPhone] = useState("");
  const [attTable, setAttTable] = useState("Bàn VIP 01");
  const [attSeat, setAttSeat] = useState("Ghế 01");
  const [attTicketType, setAttTicketType] = useState("VIP");
  const [attLuckyNumber, setAttLuckyNumber] = useState(() => `#${Math.floor(1000 + Math.random() * 9000)}`);

  // Load real members of Ban Truyền Thông from backend
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingMembers(true);
    fetchNestApi<any[]>("/members")
      .then((mems) => {
        if (!isMounted) return;
        const list = Array.isArray(mems) ? mems : [];
        // Filter members belonging to Ban Truyền Thông & Sự Kiện
        const commMembers = list.filter((m) => {
          const dept = (m.department || "").toLowerCase();
          const role = (m.role || "").toLowerCase();
          const execRole = (m.executiveRole || m.executive_role || "").toLowerCase();
          return (
            dept.includes("truyền thông") ||
            role.includes("truyền thông") ||
            role.includes("media") ||
            execRole.includes("truyền thông") ||
            execRole === "btt" ||
            execRole === "truong_ban_truyen_thong"
          );
        });
        setBttMembers(commMembers.length > 0 ? commMembers : list);
      })
      .catch(() => {
        if (isMounted) setBttMembers([]);
      })
      .finally(() => {
        if (isMounted) setLoadingMembers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Sync initial scanners from event
  useEffect(() => {
    if (!event) return;
    const rawScanners = (event as any).qrScanners || (event as any).qrStaff || [];
    if (Array.isArray(rawScanners)) {
      setSelectedScanners(rawScanners);
    } else if (rawScanners) {
      setSelectedScanners([rawScanners]);
    } else {
      setSelectedScanners([]);
    }

    // Load attendees from registrations or cache
    fetchNestApi<any[]>(`/events/registrations?eventId=${event.id}`)
      .then((regs) => {
        if (Array.isArray(regs) && regs.length > 0) {
          setAttendees(
            regs.map((r: any) => ({
              id: r.id,
              memberCode: r.memberCode || "M1983",
              memberName: r.memberName || r.name || "Hội viên",
              phone: r.phone || "—",
              table: r.table || "Bàn VIP 01",
              seat: r.seat || "Ghế 01",
              ticketType: r.ticketType || "VIP",
              luckyNumber: r.luckyNumber || "#1983",
              checkedIn: Boolean(r.checkedInAt),
              checkedInAt: r.checkedInAt,
            }))
          );
        }
      })
      .catch(() => {});
  }, [event]);

  if (!open || !event) return null;

  const qrPayload = `event_checkin:${event.id}`;

  const isMemberSelected = (m: any) => {
    return selectedScanners.some((s: any) => {
      if (typeof s === "string") {
        return s.includes(m.code) || s.includes(m.name) || s.includes(m.id);
      }
      return s.id === m.id || s.code === m.code;
    });
  };

  const handleToggleScanner = (m: any) => {
    if (isMemberSelected(m)) {
      setSelectedScanners(
        selectedScanners.filter((s: any) => {
          if (typeof s === "string") {
            return !s.includes(m.code) && !s.includes(m.id);
          }
          return s.id !== m.id && s.code !== m.code;
        })
      );
    } else {
      const newScanner = {
        id: m.id,
        code: m.code,
        name: m.name,
        phone: m.phone || "",
        department: m.department || "Ban Truyền Thông & Sự Kiện",
        executiveRole: m.executiveRole || m.role || "Thành viên",
      };
      setSelectedScanners([...selectedScanners, newScanner]);
    }
  };

  const handleSaveScanners = async () => {
    if (!event) return;
    setSavingScanners(true);
    try {
      await fetchNestApi(`/events/${event.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          qrScanners: selectedScanners,
        }),
      });
      toast.success("Đã lưu danh sách người quét vé sự kiện thành công!");
      onUpdateEvent?.();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật danh sách người quét vé");
    } finally {
      setSavingScanners(false);
    }
  };

  const handleAddAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attName.trim()) {
      toast.error("Vui lòng nhập tên người tham gia!");
      return;
    }
    const newAtt = {
      id: `att-${Date.now()}`,
      memberCode: attCode.trim() || `M1983-${Math.floor(100 + Math.random() * 900)}`,
      memberName: attName.trim(),
      phone: attPhone.trim() || "0983 xxx xxx",
      table: attTable.trim() || "Bàn Hội Nghị",
      seat: attSeat.trim() || "Ghế Tự Do",
      ticketType: attTicketType,
      luckyNumber: attLuckyNumber || `#${Math.floor(1000 + Math.random() * 9000)}`,
      checkedIn: false,
    };
    const updated = [newAtt, ...attendees];
    setAttendees(updated);
    setShowAddAttendeeForm(false);
    setAttName("");
    setAttPhone("");
    setAttLuckyNumber(`#${Math.floor(1000 + Math.random() * 9000)}`);
    toast.success(`Đã thêm ${newAtt.memberName} vào danh sách tham gia sự kiện!`);
  };

  const handleToggleCheckin = (id: string) => {
    const updated = attendees.map((a) => {
      if (a.id === id) {
        const nextState = !a.checkedIn;
        return {
          ...a,
          checkedIn: nextState,
          checkedInAt: nextState ? new Date().toLocaleTimeString("vi-VN") : null,
        };
      }
      return a;
    });
    setAttendees(updated);
    toast.success("Đã cập nhật trạng thái điểm danh!");
  };

  const filteredBttMembers = bttMembers.filter(
    (m) =>
      (m.name || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.code || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.phone || "").toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredAttendees = attendees.filter(
    (a) =>
      a.memberName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.memberCode.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.phone.toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-border p-6 text-foreground shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#003B95] text-white flex items-center justify-center shadow-md">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Quản Lý Soát Vé & QR Check-in Sự Kiện
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  EV-{event.id.slice(0, 6).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium line-clamp-1">
                {event.name} • {event.date} • {event.location || "Địa điểm sự kiện"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-secondary transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("qr_standee")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "qr_standee"
                ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Mã QR Standee Sự Kiện</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gatekeepers")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "gatekeepers"
                ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Ban Soát Vé (Ban Truyền Thông: {selectedScanners.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attendees")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "attendees"
                ? "border-[#003B95] text-[#003B95] dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Người Tham Gia ({checkedInCount}/{attendees.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-4 overflow-y-auto pr-1 flex-1 space-y-4">
          {/* TAB 1: QR STANDEE */}
          {activeTab === "qr_standee" && (
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-secondary/30 border border-border">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <QrCanvas
                  value={qrPayload}
                  size={200}
                />
              </div>

              <div className="mt-3 font-mono text-xs text-muted-foreground font-semibold">
                PAYLOAD: {qrPayload}
              </div>

              <div className="mt-2 text-xs font-bold text-foreground">
                Mã QR Standee Đặt Tại Cửa Hội Trường
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground max-w-md leading-relaxed">
                Hội viên tham dự sự kiện mở App Hiệp hội lên, quét mã QR này để tự động điểm danh, xác nhận chỗ ngồi (Bàn/Ghế) và nhận mã số quay thưởng may mắn.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-secondary shadow-xs transition cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-primary" />
                  <span>In Standee A4 / Roll-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(qrPayload);
                    toast.success("Đã sao chép mã QR sự kiện!");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#003B95] hover:bg-[#002B70] shadow-xs transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Tải / Sao chép Mã</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GATEKEEPER ASSIGNMENT (MULTI-SELECT FROM BAN TRUYỀN THÔNG) */}
          {activeTab === "gatekeepers" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#003B95] dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-0.5">
                    Phân quyền người quét mã QR sự kiện (Ban Truyền Thông):
                  </div>
                  <div>
                    Chọn các thành viên Ban Truyền Thông được quyền dùng App Hiệp hội để quét vé cho sự kiện này. Nếu một người được chọn ở nhiều sự kiện, App Hiệp hội sẽ cho phép chuyển đổi giữa các sự kiện đó.
                  </div>
                </div>
              </div>

              {/* Search & Actions Bar */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm thành viên Ban Truyền Thông theo tên, mã, SĐT..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedScanners(bttMembers.map((m) => ({
                      id: m.id,
                      code: m.code,
                      name: m.name,
                      phone: m.phone || "",
                      department: m.department || "Ban Truyền Thông & Sự Kiện",
                      executiveRole: m.executiveRole || m.role || "Thành viên",
                    })))}
                    className="px-2.5 py-1.5 rounded-xl border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedScanners([])}
                    className="px-2.5 py-1.5 rounded-xl border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Multi-Select Members List */}
              {loadingMembers ? (
                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-[#003B95]" />
                  <span>Đang tải danh sách thành viên Ban Truyền Thông...</span>
                </div>
              ) : filteredBttMembers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  Không tìm thấy thành viên phù hợp trong Ban Truyền Thông
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {filteredBttMembers.map((m) => {
                    const selected = isMemberSelected(m);
                    return (
                      <div
                        key={m.id || m.code}
                        onClick={() => handleToggleScanner(m)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none ${
                          selected
                            ? "border-[#003B95] bg-blue-50/60 dark:bg-blue-950/30 text-foreground"
                            : "border-border bg-card hover:bg-secondary/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-lg border flex items-center justify-center transition ${
                              selected
                                ? "bg-[#003B95] border-[#003B95] text-white"
                                : "border-slate-300 dark:border-slate-600 bg-background"
                            }`}
                          >
                            {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs">{m.name}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground font-semibold">
                                {m.code}
                              </span>
                              {(m.executiveRole || m.executive_role) && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                                  {m.executiveRole || m.executive_role}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              {m.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{m.phone}</span>
                                </span>
                              )}
                              <span>•</span>
                              <span>{m.department || "Ban Truyền Thông & Sự Kiện"}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {selected ? (
                            <span className="text-[11px] font-bold text-[#003B95] dark:text-blue-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Được quét</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-medium">
                              Chưa cấp quyền
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Save Scanners Button */}
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <span className="text-xs text-muted-foreground font-medium">
                  Đã chọn: <b className="text-foreground">{selectedScanners.length}</b> người soát vé
                </span>
                <button
                  type="button"
                  onClick={handleSaveScanners}
                  disabled={savingScanners}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#003B95] hover:bg-[#002B70] shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {savingScanners ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Lưu Phân Công Soát Vé</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDEES & CHECK-IN */}
          {activeTab === "attendees" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, mã hội viên, số điện thoại..."
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAttendeeForm(!showAddAttendeeForm)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#003B95] hover:bg-[#002B70] shrink-0 transition cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{showAddAttendeeForm ? "Đóng Form" : "Thêm Người Tham Gia"}</span>
                </button>
              </div>

              {/* Add Attendee Form */}
              {showAddAttendeeForm && (
                <form
                  onSubmit={handleAddAttendee}
                  className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3"
                >
                  <div className="font-bold text-xs text-[#003B95] dark:text-blue-300">
                    Thêm Nhanh Hội Viên Tham Gia Sự Kiện:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        Tên Hội Viên <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={attName}
                        onChange={(e) => setAttName(e.target.value)}
                        placeholder="VD: Trần Văn Bình"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={attPhone}
                        onChange={(e) => setAttPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        Vị trí Bàn ngồi
                      </label>
                      <input
                        type="text"
                        value={attTable}
                        onChange={(e) => setAttTable(e.target.value)}
                        placeholder="Bàn VIP 01"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        Vị trí Ghế ngồi
                      </label>
                      <input
                        type="text"
                        value={attSeat}
                        onChange={(e) => setAttSeat(e.target.value)}
                        placeholder="Ghế 01"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        Loại vé
                      </label>
                      <select
                        value={attTicketType}
                        onChange={(e) => setAttTicketType(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      >
                        <option value="VIP">Vé VIP</option>
                        <option value="Tiêu chuẩn">Vé Tiêu Chuẩn</option>
                        <option value="Khách mời">Vé Khách Mời Đặc Biệt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                        Mã Random May Mắn
                      </label>
                      <input
                        type="text"
                        value={attLuckyNumber}
                        onChange={(e) => setAttLuckyNumber(e.target.value)}
                        className="w-full font-mono rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddAttendeeForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-secondary cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#003B95] hover:bg-[#002B70] cursor-pointer"
                    >
                      Lưu Người Tham Gia
                    </button>
                  </div>
                </form>
              )}

              {/* Attendees List */}
              <div className="space-y-2">
                {filteredAttendees.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl border border-border bg-card shadow-xs text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{a.memberName}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                          {a.memberCode}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          {a.ticketType}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
                        <span>SĐT: {a.phone}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">{a.table} - {a.seat}</span>
                        <span>•</span>
                        <span className="font-mono text-[#003B95] dark:text-blue-400 font-bold">Mã: {a.luckyNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCheckin(a.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          a.checkedIn
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                        }`}
                      >
                        {a.checkedIn ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Đã Check-in ({a.checkedInAt || "Vừa xong"})</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Soát Vé / Check-in</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#003B95] hover:bg-[#002B70] shadow-sm transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}


