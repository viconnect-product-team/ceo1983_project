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
} from "lucide-react";
import { QrCanvas } from "@/components/member/QrCanvas";
import { toast } from "sonner";
import type { EventItem, Registration } from "@/lib/events.functions";

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

  // Gatekeepers
  const [gatekeepers, setGatekeepers] = useState<string[]>([]);
  const [newGatekeeperName, setNewGatekeeperName] = useState("");
  const [newGatekeeperPhone, setNewGatekeeperPhone] = useState("");

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

  useEffect(() => {
    if (!event) return;
    try {
      // Load gatekeepers for this event
      const gkRaw = localStorage.getItem(`ceo1983_event_gatekeepers_${event.id}`);
      if (gkRaw) {
        setGatekeepers(JSON.parse(gkRaw));
      } else {
        const initial = (event as any).qrStaff
          ? [(event as any).qrStaff]
          : ["Ban Thư Ký Sự Kiện — 0983 198 383", "Trưởng Ban Lễ Tân — 0901 000 002"];
        setGatekeepers(initial);
      }

      // Load attendees
      const attRaw = localStorage.getItem(`ceo1983_event_attendees_${event.id}`);
      if (attRaw) {
        setAttendees(JSON.parse(attRaw));
      } else {
        const demoAttendees = [
          {
            id: `att-1`,
            memberCode: "M1983-001",
            memberName: "Platform Administrator",
            phone: "0901 000 001",
            table: "Bàn VIP 01",
            seat: "Ghế 01",
            ticketType: "VIP",
            luckyNumber: "#7821",
            checkedIn: true,
            checkedInAt: new Date(Date.now() - 3600000).toLocaleTimeString("vi-VN"),
          },
          {
            id: `att-2`,
            memberCode: "M1983-002",
            memberName: "Quản trị viên Hệ thống",
            phone: "0901 000 002",
            table: "Bàn VIP 01",
            seat: "Ghế 02",
            ticketType: "VIP",
            luckyNumber: "#5519",
            checkedIn: true,
            checkedInAt: new Date(Date.now() - 1800000).toLocaleTimeString("vi-VN"),
          },
          {
            id: `att-3`,
            memberCode: "M1983-003",
            memberName: "James Nguyễn",
            phone: "0901 000 003",
            table: "Bàn VIP 01",
            seat: "Ghế 03",
            ticketType: "VIP",
            luckyNumber: "#8892",
            checkedIn: false,
          },
          {
            id: `att-4`,
            memberCode: "M1983-004",
            memberName: "Demo User",
            phone: "0901 000 004",
            table: "Bàn Giao Thương 02",
            seat: "Ghế 01",
            ticketType: "Tiêu chuẩn",
            luckyNumber: "#3412",
            checkedIn: false,
          },
          {
            id: `att-5`,
            memberCode: "M1983-007",
            memberName: "Lê Hoàng Long",
            phone: "0983 000 001",
            table: "Bàn Giao Thương 02",
            seat: "Ghế 02",
            ticketType: "Tiêu chuẩn",
            luckyNumber: "#6731",
            checkedIn: true,
            checkedInAt: new Date(Date.now() - 600000).toLocaleTimeString("vi-VN"),
          },
        ];
        setAttendees(demoAttendees);
        localStorage.setItem(`ceo1983_event_attendees_${event.id}`, JSON.stringify(demoAttendees));
      }
    } catch {}
  }, [event]);

  if (!open || !event) return null;

  const qrPayload = `event_checkin:${event.id}`;

  const handleAddGatekeeper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGatekeeperName.trim()) return;
    const item = newGatekeeperPhone.trim()
      ? `${newGatekeeperName.trim()} — ${newGatekeeperPhone.trim()}`
      : newGatekeeperName.trim();
    const updated = [...gatekeepers, item];
    setGatekeepers(updated);
    localStorage.setItem(`ceo1983_event_gatekeepers_${event.id}`, JSON.stringify(updated));
    setNewGatekeeperName("");
    setNewGatekeeperPhone("");
    toast.success(`Đã phân quyền soát vé cho: ${item}`);
  };

  const handleRemoveGatekeeper = (idx: number) => {
    const updated = gatekeepers.filter((_, i) => i !== idx);
    setGatekeepers(updated);
    localStorage.setItem(`ceo1983_event_gatekeepers_${event.id}`, JSON.stringify(updated));
    toast.success("Đã xóa người soát vé khỏi sự kiện!");
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
    localStorage.setItem(`ceo1983_event_attendees_${event.id}`, JSON.stringify(updated));
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
    localStorage.setItem(`ceo1983_event_attendees_${event.id}`, JSON.stringify(updated));
    toast.success("Đã cập nhật trạng thái điểm danh!");
  };

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
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-md">
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
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-secondary transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("qr_standee")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "qr_standee"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Mã QR Standee Sự Kiện</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gatekeepers")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "gatekeepers"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Ban Soát Vé Tại Cửa ({gatekeepers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attendees")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "attendees"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-secondary shadow-xs transition"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-xs transition"
                  style={{
                    background:
                      "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Tải / Sao chép Mã</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GATEKEEPER ASSIGNMENT */}
          {activeTab === "gatekeepers" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Phân quyền người quét mã QR tại cửa sự kiện:</span>
                </div>
                Những người có tên trong danh sách này khi đăng nhập App Hiệp hội sẽ có quyền dùng Camera quét mã vé tham dự của người tham gia để soát vé và cho vào hội trường.
              </div>

              {/* Add Gatekeeper Form */}
              <form onSubmit={handleAddGatekeeper} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tên người soát vé (VD: Nguyễn Thu Trang)"
                  value={newGatekeeperName}
                  onChange={(e) => setNewGatekeeperName(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={newGatekeeperPhone}
                  onChange={(e) => setNewGatekeeperPhone(e.target.value)}
                  className="sm:w-36 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
                  }}
                >
                  Thêm Người Soát Vé
                </button>
              </form>

              {/* Gatekeeper List */}
              <div className="space-y-2">
                {gatekeepers.map((gk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-xs text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{gk}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>Quyền Quét Vé & Điểm Danh Hoạt Động</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGatekeeper(idx)}
                      className="p-1 text-muted-foreground hover:text-destructive transition"
                      title="Xóa quyền"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{showAddAttendeeForm ? "Đóng Form" : "Thêm Người Tham Gia"}</span>
                </button>
              </div>

              {/* Add Attendee Form */}
              {showAddAttendeeForm && (
                <form
                  onSubmit={handleAddAttendee}
                  className="p-4 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3"
                >
                  <div className="font-bold text-xs text-amber-900 dark:text-amber-300">
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
                      className="px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900"
                      style={{
                        background:
                          "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
                      }}
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
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          {a.ticketType}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
                        <span>SĐT: {a.phone}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">{a.table} - {a.seat}</span>
                        <span>•</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Mã: {a.luckyNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCheckin(a.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
