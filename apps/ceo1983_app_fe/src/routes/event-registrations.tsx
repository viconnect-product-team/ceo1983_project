import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  Download,
  FileText,
  Layers,
  MapPin,
  QrCode,
  Search,
  Tag,
  Ticket,
  Trash2,
  Users,
  Utensils,
  ArrowLeftRight,
  X,
  XCircle,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, Pill, StatCard, TableShell } from "@/components/dashboard/PageKit";
import { useTableControls } from "@/hooks/use-table-controls";
import { fetchNestApi } from "@/lib/api-client";
import { getQrUrl } from "@/lib/qr";
import { exportToExcel } from "@/lib/excel-export";
import { Pagination } from "@/components/dashboard/DataTablePagination";
import {
  addEventAttendeeFn,
  listEventsWithRegistrationsFn,
  recordWalkInCashPaymentFn,
  sendPaymentReminderFn,
  updateRegistrationSeatingFn,
  type EventItem,
  type Registration,
} from "@/lib/events.functions";
import { useFmt, useT } from "@/lib/i18n";
import { CinemaSeatingMap } from "@/components/dashboard/CinemaSeatingMap";
import { useRole } from "@/hooks/use-role";
import { EventReminderPosterModal } from "@/components/dashboard/EventReminderPosterModal";
import { EventPosterStudioModal } from "@/components/dashboard/EventPosterStudioModal";
import { VnpayPaymentModal } from "@/components/common/VnpayPaymentModal";
import { EventGuestExcelImportModal } from "@/components/dashboard/EventGuestExcelImportModal";
import { EventCheckinQrModal } from "@/components/events/EventCheckinQrModal";
import { EventSendCheckinExcelModal } from "@/components/events/EventSendCheckinExcelModal";

export const Route = createFileRoute("/event-registrations")({
  ssr: false,
  loader: () => listEventsWithRegistrationsFn(),
  component: RegPage,
});

function formatCheckinTime(val: any): string {
  if (!val) return "Chưa check-in";
  if (typeof val === "string") {
    if (val.includes("/") && val.includes(":")) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    }
    return val;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }
  return String(val);
}

function RegPage() {
  const t = useT();
  const fmt = useFmt();
  const router = useRouter();
  const { isBTT, isBQT, isAdmin, isPlatformAdmin } = useRole();
  const canSwapSeats = isBTT || isBQT || isAdmin || isPlatformAdmin;

  const loaderData = Route.useLoaderData() as {
    events: EventItem[];
    registrations: Registration[];
  };

  const [eventsList, setEventsList] = useState<EventItem[]>(loaderData?.events || []);
  const [registrationsList, setRegistrationsList] = useState<Registration[]>(loaderData?.registrations || []);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Sync loaderData if router invalidates
  useEffect(() => {
    if (loaderData?.events?.length) setEventsList(loaderData.events);
    if (loaderData?.registrations?.length) setRegistrationsList(loaderData.registrations);
  }, [loaderData]);

  // Eager client-side fetch on initial visit to ensure registrations load immediately without manual reloads
  const fetchLiveRegistrations = async () => {
    try {
      setIsLoadingLive(true);
      const res = await fetchNestApi<any>("/events/with-registrations").catch(async () => {
        const [evs, rgs] = await Promise.all([
          fetchNestApi<any[]>("/events").catch(() => []),
          fetchNestApi<any[]>("/events/registrations").catch(() => []),
        ]);
        return { events: evs, registrations: rgs };
      });

      if (res) {
        if (Array.isArray(res.events) && res.events.length > 0) {
          setEventsList(res.events);
        }
        if (Array.isArray(res.registrations)) {
          setRegistrationsList(res.registrations);
        }
      }
    } catch (err) {
      console.warn("[event-registrations] Client-side eager load failed:", err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  const fetchLiveRegistrationsForEvent = async (selectedEvtId: string) => {
    if (!selectedEvtId || selectedEvtId === "all") {
      return fetchLiveRegistrations();
    }
    try {
      setIsLoadingLive(true);
      const res = await fetchNestApi<any[]>(`/events/${selectedEvtId}/registrations`).catch(async () => {
        return fetchNestApi<any[]>(`/events/registrations?eventId=${selectedEvtId}`).catch(() => []);
      });
      if (Array.isArray(res)) {
        setRegistrationsList(res);
      }
    } catch (err) {
      console.warn("[event-registrations] Load registrations for event failed:", err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  const EVENTS = eventsList;
  // Dữ liệu người hủy tham dự biến mất hoàn toàn khỏi CRM theo yêu cầu
  const REGISTRATIONS = useMemo(() => {
    return registrationsList.filter((r) => r.status !== "cancelled");
  }, [registrationsList]);

  const updateSeating = useServerFn(updateRegistrationSeatingFn);
  const recordCash = useServerFn(recordWalkInCashPaymentFn);
  const sendReminder = useServerFn(sendPaymentReminderFn);
  const addAttendee = useServerFn(addEventAttendeeFn);

  const [q, setQ] = useState("");
  const [eventId, setEventId] = useState("all");
  const [status, setStatus] = useState<Registration["status"] | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">("all");
  const [checkinFilter, setCheckinFilter] = useState<"all" | "on_time" | "late" | "not_checked_in">("all");

  useEffect(() => {
    fetchLiveRegistrations();
    // Tự động đồng bộ đại biểu mới check-in ngầm mỗi 10 giây
    const interval = setInterval(() => {
      if (eventId && eventId !== "all") {
        fetchLiveRegistrationsForEvent(eventId);
      } else {
        fetchLiveRegistrations();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  // QR Checkin and Excel Email modal states
  const [checkinQrModalOpen, setCheckinQrModalOpen] = useState(false);
  const [sendExcelModalOpen, setSendExcelModalOpen] = useState(false);
  const [selectedQrEvent, setSelectedQrEvent] = useState<any>(null);

  // Excel-like resizable columns state & handler
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    stt: 56,
    code: 96,
    member: 220,
    event: 240,
    seat: 180,
    ticket: 120,
    payment: 190,
    checkin: 130,
    status: 110,
    actions: 360,
  });

  const handleMouseDownResize = (colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colKey] || 150;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Add Attendee / QR Checkin Modal state
  const [addAttendeeModalOpen, setAddAttendeeModalOpen] = useState(false);
  const [guestExcelModalOpen, setGuestExcelModalOpen] = useState(false);
  const [eventReminderModalOpen, setEventReminderModalOpen] = useState(false);
  const [posterStudioOpen, setPosterStudioOpen] = useState(false);
  const [vnpayModalOpen, setVnpayModalOpen] = useState(false);
  const [selectedVnpayReg, setSelectedVnpayReg] = useState<Registration | null>(null);
  const [attendeeMode, setAttendeeMode] = useState<"qr" | "manual">("qr");
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [newAttendee, setNewAttendee] = useState({
    eventId: EVENTS[0]?.id || "",
    memberName: "",
    memberCode: "",
    email: "",
    phone: "",
    company: "",
    ticketType: "VIP",
    seatAssignment: "Bàn VIP 01",
    paymentStatus: "paid" as "paid" | "pending",
    checkedIn: true,
  });

  // Seating Modal state
  const [seatingModalOpen, setSeatingModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [seatInput, setSeatInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Map of occupied seats for Cinema seating visual chart
  const occupiedSeatsMap = useMemo(() => {
    const map: Record<
      string,
      {
        registrationId?: string;
        attendeeName: string;
        attendeeCode?: string;
        company?: string;
        ticketType?: string;
        status?: string;
        phone?: string;
        title?: string;
      }
    > = {};
    REGISTRATIONS.forEach((r) => {
      if (r.seatAssignment && r.status !== "cancelled" && r.id !== selectedReg?.id) {
        const info = {
          registrationId: r.id,
          attendeeName: r.memberName,
          attendeeCode: r.memberCode,
          company: r.company || "",
          ticketType: r.ticketType || "VIP",
          status: r.status || "confirmed",
          phone: r.phone || "",
          title: r.title || (r as any).position || "Hội viên VIP",
        };
        map[r.seatAssignment] = info;
        const match = r.seatAssignment.match(/[A-Z]+-\d{2}|T\d+-\d{2}|SK-\d{2}/i);
        if (match) {
          map[match[0].toUpperCase()] = info;
        }
      }
    });
    return map;
  }, [REGISTRATIONS, selectedReg]);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrReg, setQrReg] = useState<Registration | null>(null);

  // Google Form Survey Modal state
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [selectedSurveyReg, setSelectedSurveyReg] = useState<any | null>(null);

  const handleOpenFormSurvey = (r: any) => {
    setSelectedSurveyReg(r);
    setSurveyModalOpen(true);
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return REGISTRATIONS.filter((r) => (eventId === "all" ? true : r.eventId === eventId))
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => {
        if (paymentFilter === "all") return true;
        return (r.paymentStatus || "pending") === paymentFilter;
      })
      .filter((r) => {
        if (checkinFilter === "all") return true;
        if (checkinFilter === "on_time") {
          return (r as any).checkinStatus === "on_time" || (r.checkedInAt && !(r as any).checkinStatus);
        }
        if (checkinFilter === "late") {
          return (r as any).checkinStatus === "late";
        }
        if (checkinFilter === "not_checked_in") {
          return !r.checkedInAt;
        }
        return true;
      })
      .filter(
        (r) =>
          !ql ||
          r.memberName.toLowerCase().includes(ql) ||
          r.memberCode.toLowerCase().includes(ql) ||
          r.email.toLowerCase().includes(ql) ||
          ((r as any).company && (r as any).company.toLowerCase().includes(ql)) ||
          ((r as any).position && (r as any).position.toLowerCase().includes(ql)) ||
          (r.seatAssignment && r.seatAssignment.toLowerCase().includes(ql)),
      );
  }, [q, eventId, status, paymentFilter, checkinFilter, REGISTRATIONS]);

  const tc = useTableControls<Registration>(
    filtered,
    {
      code: (r) => r.id,
      member: (r) => r.memberName,
      ticket: (r) => r.ticketType,
      regDate: (r) => r.registeredAt,
      status: (r) => r.status,
    },
    { initialSortKey: "regDate", initialSortDir: "desc", initialPageSize: 20 },
  );

  const confirmed = REGISTRATIONS.filter((r) => r.status === "confirmed").length;
  const paidCount = REGISTRATIONS.filter((r) => r.paymentStatus === "paid").length;
  const pendingCount = REGISTRATIONS.filter((r) => r.paymentStatus !== "paid").length;
  const seatedCount = REGISTRATIONS.filter((r) => !!r.seatAssignment).length;

  const handleOpenSeating = (r: Registration) => {
    setSelectedReg(r);
    setSeatInput(r.seatAssignment || "Bàn VIP 01 - Ghế 01");
    setSeatingModalOpen(true);
  };

  const handleMoveSeat = async (fromSeat: string, toSeat: string, occupant: any) => {
    const targetReg = REGISTRATIONS.find(
      (r) =>
        (occupant?.registrationId && r.id === occupant.registrationId) ||
        (fromSeat && r.seatAssignment === fromSeat) ||
        (occupant?.attendeeName && r.memberName === occupant.attendeeName),
    );
    if (!targetReg) {
      toast.error("Không tìm thấy thông tin đại biểu cần chuyển ghế");
      return;
    }

    const destReg = REGISTRATIONS.find(
      (r) => r.id !== targetReg.id && r.seatAssignment === toSeat && r.status !== "cancelled"
    );

    try {
      // 1. Gửi trực tiếp API với token của phiên đăng nhập hiện tại
      await fetchNestApi(`/events/registrations/${encodeURIComponent(targetReg.id)}/seating`, {
        method: "PUT",
        body: JSON.stringify({ seatAssignment: toSeat }),
      }).catch(async () => {
        return updateSeating({
          data: {
            registrationId: targetReg.id,
            seatAssignment: toSeat,
          },
        });
      });

      if (destReg) {
        await fetchNestApi(`/events/registrations/${encodeURIComponent(destReg.id)}/seating`, {
          method: "PUT",
          body: JSON.stringify({ seatAssignment: fromSeat }),
        }).catch(async () => {
          return updateSeating({
            data: {
              registrationId: destReg.id,
              seatAssignment: fromSeat,
            },
          });
        });
      }

      setRegistrationsList((prev) =>
        prev.map((r) => {
          if (r.id === targetReg.id) return { ...r, seatAssignment: toSeat };
          if (destReg && r.id === destReg.id) return { ...r, seatAssignment: fromSeat };
          return r;
        }),
      );

      if (selectedReg) {
        if (selectedReg.id === targetReg.id) {
          setSelectedReg((prev) => (prev ? { ...prev, seatAssignment: toSeat } : null));
          setSeatInput(toSeat);
        } else if (destReg && selectedReg.id === destReg.id) {
          setSelectedReg((prev) => (prev ? { ...prev, seatAssignment: fromSeat } : null));
          setSeatInput(fromSeat);
        }
      }

      if (destReg) {
        toast.success(
          `Đã hoán đổi chỗ ngồi: ${targetReg.memberName} (${toSeat}) ⇆ ${destReg.memberName} (${fromSeat})`
        );
      } else {
        toast.success(`Đã chuyển đại biểu ${targetReg.memberName} sang ${toSeat}`);
      }
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi chuyển chỗ ngồi");
    }
  };

  const handleUnassignSeat = async () => {
    if (!selectedReg) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn gỡ vị trí chỗ ngồi "${selectedReg.seatAssignment}" của ${selectedReg.memberName} để xếp chỗ cho người khác?\nHệ thống sẽ tự động gửi thông báo điều chỉnh chỗ ngồi qua Email và Zalo OA cho đại biểu.`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await fetchNestApi(`/events/registrations/${encodeURIComponent(selectedReg.id)}/seating`, {
        method: "PUT",
        body: JSON.stringify({ seatAssignment: "" }),
      }).catch(async () => {
        return updateSeating({
          data: {
            registrationId: selectedReg.id,
            seatAssignment: "",
          },
        });
      });

      setRegistrationsList((prev) =>
        prev.map((r) => (r.id === selectedReg.id ? { ...r, seatAssignment: "" } : r)),
      );
      setSeatInput("");
      toast.success(`Đã gỡ chỗ ngồi của ${selectedReg.memberName} và gửi thông báo qua Email & Zalo OA thành công!`);
      setSeatingModalOpen(false);
      await router.invalidate();
    } catch {
      toast.error("Lỗi khi gỡ vị trí chỗ ngồi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSeating = async () => {
    if (!selectedReg || !seatInput.trim()) {
      setSeatingModalOpen(false);
      return;
    }
    setSubmitting(true);
    const assignedSeat = seatInput.trim();
    try {
      // 1. Direct fetch to Nest API with token
      await fetchNestApi(`/events/registrations/${encodeURIComponent(selectedReg.id)}/seating`, {
        method: "PUT",
        body: JSON.stringify({ seatAssignment: assignedSeat }),
      }).catch(async (clientErr) => {
        console.warn("Direct fetch failed, falling back to serverFn:", clientErr);
        return updateSeating({
          data: {
            registrationId: selectedReg.id,
            seatAssignment: assignedSeat,
          },
        });
      });

      // 2. Cập nhật state ngay lập tức để bảng và sơ đồ rạp hiển thị chỗ ngồi mới
      setRegistrationsList((prev) =>
        prev.map((r) => (r.id === selectedReg.id ? { ...r, seatAssignment: assignedSeat } : r)),
      );
      toast.success(`Đã xếp chỗ cho ${selectedReg.memberName}: ${assignedSeat}`);
      setSeatingModalOpen(false);
      await router.invalidate();
    } catch {
      toast.error("Lỗi khi lưu vị trí chỗ ngồi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalkInCashPayment = async (r: Registration) => {
    if (
      !window.confirm(
        `Xác nhận thu tiền mặt tại chỗ cho khách: ${r.memberName}?\nSố tiền: ${fmt.money(
          r.paymentAmount || 500000,
        )}\nHệ thống sẽ tự động hạch toán vào Quản lý thu - Tiền mặt.`,
      )
    ) {
      return;
    }

    try {
      await recordCash({
        data: {
          registrationId: r.id,
          amount: r.paymentAmount || 500000,
        },
      });
      toast.success(`Đã thu tiền mặt thành công! Đã cập nhật Quản lý thu.`);
      await router.invalidate();
    } catch {
      toast.error("Lỗi khi xử lý thu tiền mặt");
    }
  };

  const handleConfirmBankPayment = async (r: Registration) => {
    if (
      !window.confirm(
        `Xác nhận hội viên "${r.memberName}" ĐÃ THANH TOÁN phí tham dự sự kiện?\n` +
        `Số tiền: ${fmt.money(r.paymentAmount || 0)}\n\n` +
        `Sau khi xác nhận:\n` +
        `1. Hệ thống sẽ kích hoạt vé chính thức (Trạng thái: Đã thanh toán).\n` +
        `2. Tự động sinh mã QR Check-in và gửi email Vé Điện Tử (E-Ticket) tới "${r.email}".`
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await fetchNestApi(`/events/registrations/${r.id}/confirm-payment`, {
        method: "POST",
        body: JSON.stringify({ method: "bank_transfer" }),
      });
      setRegistrationsList((prev) =>
        prev.map((item) =>
          item.id === r.id ? { ...item, paymentStatus: "paid", status: "confirmed" } : item,
        ),
      );
      toast.success(
        res?.message || `Đã xác nhận thanh toán và gửi vé QR check-in về email ${r.email}!`,
      );
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xác nhận thanh toán");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReconcilePayment = async (r: Registration) => {
    setSubmitting(true);
    try {
      const res: any = await fetchNestApi(`/events/registrations/${r.id}/reconcile-payment`, {
        method: "POST",
      });
      if (res?.matched) {
        setRegistrationsList((prev) =>
          prev.map((item) =>
            item.id === r.id ? { ...item, paymentStatus: "paid", status: "confirmed" } : item,
          ),
        );
        toast.success(`Dòng tiền khớp! Đã tự động kích hoạt vé và gửi vé QR về email ${r.email}.`);
        await router.invalidate();
      } else {
        toast.info(res?.message || `Chưa phát hiện giao dịch khớp với hóa đơn EV${r.id}. Bạn có thể bấm xác nhận thủ công.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi kiểm tra đối soát dòng tiền");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReminder = async (r: Registration) => {
    try {
      const res: any = await sendReminder({
        data: { registrationId: r.id },
      });
      toast.success(res.message || "Đã gửi thông báo nhắc nhở");
      await router.invalidate();
    } catch {
      toast.error("Lỗi khi gửi thông báo nhắc nhở");
    }
  };

  const handleDeleteRegistration = async (r: Registration) => {
    if (
      !window.confirm(
        `Xác nhận xóa người đăng ký tham dự:\n"${r.memberName}" (Mã: ${r.memberCode || r.id})?\nThao tác này sẽ hủy chỗ ngồi và xóa hoàn toàn thông tin đại biểu khỏi sự kiện!`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await fetchNestApi(`/events/registrations/${r.id}`, { method: "DELETE" }).catch(async () => {
        // Fallback to cancel registration endpoint
        await fetchNestApi(`/events/${r.eventId}/cancel`, {
          method: "POST",
          body: JSON.stringify({ reason: "Ban Tổ Chức xóa đăng ký đại biểu" }),
        });
      });
      toast.success(`Đã xóa đăng ký tham dự của ${r.memberName}`);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa đăng ký sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessQrCode = async (codeToProcess?: string) => {
    const code = (codeToProcess || qrCodeInput).trim();
    if (!code) {
      toast.error("Vui lòng nhập hoặc quét mã QR");
      return;
    }

    setSubmitting(true);
    try {
      // Find if attendee already exists in registrations
      const matched = REGISTRATIONS.find(
        (r) =>
          r.id.toLowerCase() === code.toLowerCase() ||
          r.memberCode.toLowerCase() === code.toLowerCase() ||
          r.email.toLowerCase() === code.toLowerCase() ||
          r.memberName.toLowerCase().includes(code.toLowerCase()),
      );

      const targetEvtId = matched ? matched.eventId : newAttendee.eventId || EVENTS[0]?.id || "evt-1";
      const memberName = matched ? matched.memberName : `Đại biểu ${code}`;
      const memberCode = matched ? matched.memberCode : code;

      await addAttendee({
        data: {
          eventId: targetEvtId,
          memberName,
          memberCode,
          email: matched?.email || "",
          phone: matched?.phone || "",
          company: matched?.company || "",
          ticketType: matched?.ticketType || "VIP",
          seatAssignment: matched?.seatAssignment || "Bàn VIP 01",
          paymentStatus: "paid",
          checkedIn: true,
        },
      });

      toast.success(`Đã quét QR & Check-in thành công: ${memberName} (${memberCode})`);
      setQrCodeInput("");
      setAddAttendeeModalOpen(false);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xử lý mã QR điểm danh");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNewAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendee.memberName.trim()) {
      toast.error("Vui lòng nhập họ và tên đại biểu");
      return;
    }
    if (!newAttendee.eventId) {
      toast.error("Vui lòng chọn sự kiện");
      return;
    }

    setSubmitting(true);
    try {
      await addAttendee({
        data: {
          eventId: newAttendee.eventId,
          memberName: newAttendee.memberName.trim(),
          memberCode: newAttendee.memberCode.trim() || undefined,
          email: newAttendee.email.trim() || undefined,
          phone: newAttendee.phone.trim() || undefined,
          company: newAttendee.company.trim() || undefined,
          ticketType: newAttendee.ticketType,
          seatAssignment: newAttendee.seatAssignment,
          paymentStatus: newAttendee.paymentStatus,
          checkedIn: newAttendee.checkedIn,
        },
      });

      toast.success(
        `Đã thêm người tham gia: ${newAttendee.memberName}${newAttendee.checkedIn ? " (Đã Check-in có mặt)" : ""}`,
      );
      setNewAttendee({
        eventId: EVENTS[0]?.id || "",
        memberName: "",
        memberCode: "",
        email: "",
        phone: "",
        company: "",
        ticketType: "VIP",
        seatAssignment: "Bàn VIP 01",
        paymentStatus: "paid",
        checkedIn: true,
      });
      setAddAttendeeModalOpen(false);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi thêm người tham gia sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenQr = (r: Registration) => {
    setQrReg(r);
    setQrModalOpen(true);
  };

  const handleOpenCheckinQrModal = () => {
    const target =
      EVENTS.find((e: any) => e.id === eventId) ||
      EVENTS.find((e: any) => e.name && e.name.toLowerCase().includes("doanh trí")) ||
      EVENTS[0];
    setSelectedQrEvent(target);
    setCheckinQrModalOpen(true);
  };

  const handleOpenSendExcelModal = () => {
    const target =
      (eventId && eventId !== "all" && EVENTS.find((e: any) => e.id === eventId)) ||
      EVENTS.find((e: any) => e.id === "event-doanhtri-20261121") ||
      EVENTS.find((e: any) => e.name && e.name.toLowerCase().includes("doanh trí")) ||
      EVENTS[0] || {
        id: "event-doanhtri-20261121",
        name: "KỶ NIỆM 4 NĂM VIỆN DOANH TRÍ & TRI ÂN 20/11 - TOẠ ĐÀM DOANH NGHIỆP VIỆT 2027",
      };
    setSelectedQrEvent(target);
    setSendExcelModalOpen(true);
  };

  const handleExportCheckinExcel = () => {
    const targetEvent =
      EVENTS.find((e: any) => e.id === eventId) ||
      EVENTS.find((e: any) => e.name && e.name.toLowerCase().includes("doanh trí")) ||
      EVENTS[0];
    const dataToExport = filtered;
    if (dataToExport.length === 0) {
      toast.error("Không có dữ liệu đại biểu để xuất Excel!");
      return;
    }

    exportToExcel<Registration>({
      title: `DANH SÁCH ĐẠI BIỂU ĐIỂM DANH CHECK-IN SỰ KIỆN`,
      subtitle: `${targetEvent?.name || "KỶ NIỆM 4 NĂM VIỆN DOANH TRÍ & TOẠ ĐÀM DOANH NGHIỆP VIỆT 2027"}`,
      filename: `danh-sach-checkin-${eventId !== "all" ? eventId : "all"}-${Date.now()}`,
      sheetName: "Danh_Sach_CheckIn",
      data: dataToExport,
      columns: [
        { header: "STT", key: "stt", width: 8, value: (_, i) => String(i + 1) },
        { header: "Mã Đăng Ký", key: "id", width: 18, value: (r) => r.id },
        { header: "Họ và Tên Đại Biểu", key: "memberName", width: 26, value: (r) => r.memberName },
        { header: "Số Điện Thoại", key: "phone", width: 16, value: (r) => (r as any).phone || "—" },
        { header: "Email", key: "email", width: 28, value: (r) => r.email || "—" },
        { header: "Chức Danh", key: "position", width: 20, value: (r) => (r as any).position || "—" },
        { header: "Công Ty / Doanh Nghiệp", key: "company", width: 30, value: (r) => (r as any).company || "—" },
        {
          header: "Thời Gian Check-in",
          key: "checkedInAt",
          width: 24,
          value: (r) => formatCheckinTime(r.checkedInAt),
        },
        {
          header: "Phân Loại Check-in",
          key: "checkinStatus",
          width: 24,
          value: (r) =>
            (r as any).checkinStatus === "on_time"
              ? "Đúng giờ (trong 30p)"
              : (r as any).checkinStatus === "late"
              ? "Check-in muộn (>30p)"
              : r.checkedInAt
              ? "Đã điểm danh"
              : "Chưa điểm danh",
        },
        { header: "Hạng Vé", key: "ticketType", width: 16, value: (r) => r.ticketType || "Vé Mời" },
      ],
      summaryRows: [
        [
          "TỔNG CỘNG ĐẠI BIỂU:",
          "",
          `${dataToExport.length} người`,
          "",
          "",
          "",
          "",
          `Đã check-in: ${dataToExport.filter((r) => r.checkedInAt).length}`,
          `Đúng giờ: ${dataToExport.filter((r) => (r as any).checkinStatus === "on_time").length} | Muộn: ${dataToExport.filter((r) => (r as any).checkinStatus === "late").length}`,
          "",
        ],
      ],
      signerTitles: ["NGƯỜI LẬP BIỂU", "BAN TỔ CHỨC", "VIỆN DOANH TRÍ"],
    });
    toast.success(`Đã xuất thành công file Excel cho ${dataToExport.length} đại biểu!`);
  };

  const handleDownloadReport = async (fmt: "excel" | "word" | "pdf") => {
    const targetEventId = eventId !== "all" ? eventId : "event-doanhtri-20261121";
    try {
      const res = await fetch(`/api/events/${targetEventId}/export-checkin-file?format=${fmt}`);
      if (!res.ok) throw new Error("Tải file thất bại");
      const blob = await res.blob();
      const ext = fmt === "word" ? "docx" : fmt === "pdf" ? "pdf" : "xlsx";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Danh_Sach_CheckIn_Vien_Doanh_Tri_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Đã tải xuống file ${fmt.toUpperCase()} thành công!`);
    } catch (err: any) {
      toast.error(err?.message || `Lỗi khi tải file ${fmt.toUpperCase()}`);
    }
  };

  const onTimeCheckinCount = useMemo(() => {
    return REGISTRATIONS.filter(
      (r) =>
        (r as any).checkinStatus === "on_time" ||
        (r.checkedInAt && !(r as any).checkinStatus)
    ).length;
  }, [REGISTRATIONS]);

  const lateCheckinCount = useMemo(() => {
    return REGISTRATIONS.filter((r) => (r as any).checkinStatus === "late").length;
  }, [REGISTRATIONS]);

  const notCheckedInCount = useMemo(() => {
    return REGISTRATIONS.filter((r) => !r.checkedInAt).length;
  }, [REGISTRATIONS]);

  return (
    <AppShell>
      <PageHeader
        title="Quản Lý Đăng Ký & Xếp Chỗ Sự Kiện"
        subtitle="Quản lý danh sách tham dự, sơ đồ chỗ ngồi và theo dõi thanh toán sự kiện"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Nút bật mã QR Check-in Viện Doanh Trí (Zalo / Camera) */}
            <button
              onClick={handleOpenCheckinQrModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#A52A2A] to-[#991b1b] hover:from-[#750000] hover:to-[#8B0000] px-3.5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
              title="Mở mã QR Check-in điểm danh để khách mời quét bằng Zalo hoặc Camera điện thoại (không lỗi chứng chỉ bảo mật)"
            >
              <QrCode className="h-4 w-4 text-amber-300" />
              <span>Mã QR Check-in (Zalo / Camera)</span>
            </button>

            {/* Nút Tải Excel Danh sách Check-in */}
            <button
              onClick={() => handleDownloadReport("excel")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              title="Tải xuống trực tiếp file Excel (.xlsx) danh sách khách check-in kèm thời gian & phân loại"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Tải Excel</span>
            </button>

            {/* Nút Tải Word Danh sách Check-in */}
            <button
              onClick={() => handleDownloadReport("word")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              title="Tải xuống trực tiếp file Word (.docx) danh sách khách check-in chuẩn văn bản Viện Doanh Trí"
            >
              <FileText className="h-4 w-4" />
              <span>Tải Word</span>
            </button>

            {/* Nút Tải PDF Danh sách Check-in */}
            <button
              onClick={() => handleDownloadReport("pdf")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              title="Tải xuống trực tiếp file PDF (.pdf) danh sách khách check-in kèm cột thời gian"
            >
              <FileText className="h-4 w-4" />
              <span>Tải PDF</span>
            </button>

            {/* Nút Gửi Báo Cáo về Email (Word / PDF / Excel) */}
            <button
              onClick={handleOpenSendExcelModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              title="Gửi file danh sách check-in (Word, PDF, Excel) trực tiếp về email bất kỳ"
            >
              <Mail className="h-4 w-4" />
              <span>Gửi Mail Báo Cáo</span>
            </button>

            <button
              onClick={() => setPosterStudioOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xs transition cursor-pointer"
            >
              <span>Tạo Poster Thư Mời</span>
            </button>
            <button
              onClick={() => setEventReminderModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              <span>Gửi Thông Báo Sự Kiện</span>
            </button>
            <button
              onClick={() => {
                setSelectedReg(null);
                setSeatInput("");
                setSeatingModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <span>Sơ Đồ Chỗ Ngồi</span>
            </button>
            <button
              onClick={() => {
                setAttendeeMode("qr");
                setAddAttendeeModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <span>Thêm Người Tham Dự</span>
            </button>
            <button
              onClick={() => setGuestExcelModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              title="Nhập danh sách khách mời từ file Excel và tự động gửi email thư mời sự kiện"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Nhập Excel Khách Mời</span>
            </button>
          </div>
        }
      />

      {/* ── 4 THẺ CHỈ SỐ CHUẨN MÀU: XANH NAVY - ĐEN - VÀNG - XANH LÁ ── */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số người đăng ký (Xanh Navy) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#003B95] dark:text-blue-400 text-xs font-bold uppercase tracking-wider">TỔNG ĐĂNG KÝ</span>
            <span className="size-2 rounded-full bg-[#003B95]" />
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-black">
            {REGISTRATIONS.length}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">
            Hội viên &amp; khách mời tham dự
          </div>
        </div>

        {/* Card 2: Đã xếp chỗ ngồi (Đen / Slate) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">ĐÃ XẾP CHỖ NGỒI</span>
            <span className="size-2 rounded-full bg-slate-500" />
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-black">
            {seatedCount}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">
            Đã gắn số bàn &amp; vị trí ghế
          </div>
        </div>

        {/* Card 3: Chờ thanh toán (Vàng hổ phách) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">CHỜ THANH TOÁN</span>
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-black">
            {pendingCount}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">
            Chờ xác nhận phí tham dự
          </div>
        </div>

        {/* Card 4: Đã thanh toán phí (Xanh lá) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">ĐÃ THANH TOÁN PHÍ</span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-2xl font-black">
            {paidCount}
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">
            Vé hợp lệ và sẵn sàng check-in
          </div>
        </div>
      </div>

      {/* ── THANH FILTER TABS PHÂN LOẠI CHECK-IN (ĐÚNG GIỜ TRONG 30P / MUỘN) ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Phân Loại Check-in:
          </span>
          <button
            onClick={() => setCheckinFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              checkinFilter === "all"
                ? "bg-[#8B0000] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Tất cả ({REGISTRATIONS.length})
          </button>
          <button
            onClick={() => setCheckinFilter("on_time")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              checkinFilter === "on_time"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>✓ Đúng giờ (trong 30p): {onTimeCheckinCount}</span>
          </button>
          <button
            onClick={() => setCheckinFilter("late")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              checkinFilter === "late"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>⏱ Check-in muộn (&gt;30p): {lateCheckinCount}</span>
          </button>
          <button
            onClick={() => setCheckinFilter("not_checked_in")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              checkinFilter === "not_checked_in"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <span>Chưa đến: {notCheckedInCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={() => {
              if (eventId && eventId !== "all") {
                fetchLiveRegistrationsForEvent(eventId);
              } else {
                fetchLiveRegistrations();
              }
              toast.success("Đã đồng bộ danh sách đại biểu mới nhất!");
            }}
            disabled={isLoadingLive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition cursor-pointer shadow-2xs"
            title="Làm mới và lấy danh sách đại biểu vừa check-in tức thì"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleExportCheckinExcel}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer shadow-2xs"
            title="Xuất file Excel danh sách đang hiển thị"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tải Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên, mã hội viên, email, số bàn ghế..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select
          value={eventId}
          onChange={(e) => {
            const nextEvtId = e.target.value;
            setEventId(nextEvtId);
            fetchLiveRegistrationsForEvent(nextEvtId);
          }}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)]"
        >
          <option value="all">{t("reg.allEvents")}</option>
          {EVENTS.map((e: any) => (
            <option key={e.id} value={e.id}>
              {e.name || e.title}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as "all" | "paid" | "pending")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)]"
        >
          <option value="all">Tất cả thanh toán</option>
          <option value="paid">Đã thanh toán (Paid)</option>
          <option value="pending">Chờ thanh toán (Pending)</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Registration["status"] | "all")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium shadow-[var(--shadow-card)]"
        >
          <option value="all">{t("common.allStatuses")}</option>
          <option value="confirmed">{t("reg.status.confirmed")}</option>
          <option value="waitlist">{t("reg.status.waitlist")}</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[1550px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                <th
                  style={{ width: colWidths.stt, minWidth: colWidths.stt, maxWidth: colWidths.stt }}
                  className="sticky left-0 z-20 bg-secondary px-3 py-3 text-center text-xs font-bold border-b border-border whitespace-nowrap relative group/th"
                >
                  STT
                  <div
                    onMouseDown={(e) => handleMouseDownResize("stt", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.code, minWidth: colWidths.code, maxWidth: colWidths.code, left: colWidths.stt }}
                  className="sticky z-20 bg-secondary px-4 py-3 text-xs font-bold border-b border-border whitespace-nowrap relative group/th"
                >
                  Mã ĐK
                  <div
                    onMouseDown={(e) => handleMouseDownResize("code", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.member, minWidth: colWidths.member }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th"
                >
                  Người tham gia
                  <div
                    onMouseDown={(e) => handleMouseDownResize("member", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.event, minWidth: colWidths.event }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th text-primary"
                >
                  Sự kiện đăng ký
                  <div
                    onMouseDown={(e) => handleMouseDownResize("event", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.seat, minWidth: colWidths.seat }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th"
                >
                  Chỗ ngồi / Bàn VIP
                  <div
                    onMouseDown={(e) => handleMouseDownResize("seat", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.ticket, minWidth: colWidths.ticket }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th"
                >
                  Hạng vé
                  <div
                    onMouseDown={(e) => handleMouseDownResize("ticket", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.payment, minWidth: colWidths.payment }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th"
                >
                  Thanh toán & Phí
                  <div
                    onMouseDown={(e) => handleMouseDownResize("payment", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.checkin, minWidth: colWidths.checkin }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th"
                >
                  Check-in
                  <div
                    onMouseDown={(e) => handleMouseDownResize("checkin", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.status, minWidth: colWidths.status }}
                  className="px-4 py-3 border-b border-border whitespace-nowrap relative group/th"
                >
                  Trạng thái
                  <div
                    onMouseDown={(e) => handleMouseDownResize("status", e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
                <th
                  style={{ width: colWidths.actions, minWidth: colWidths.actions }}
                  className="sticky right-0 z-20 bg-secondary px-4 py-3 text-right text-xs font-bold border-b border-border shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.12)] whitespace-nowrap relative group/th"
                >
                  Thao tác quản trị
                  <div
                    onMouseDown={(e) => handleMouseDownResize("actions", e)}
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
                    title="Kéo sang trái/phải để co dãn cột"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tc.pageRows.map((r: any, idx: number) => {
                const isPaid = r.paymentStatus === "paid";
                const isCancelled = r.status === "cancelled";
                const reminderCount = Number(r.reminderCount || 0);

                const matchedEvt = EVENTS.find((e: any) => String(e.id) === String(r.eventId));
                const evName = r.eventName || matchedEvt?.name || `Sự kiện #${r.eventId}`;
                const evDate = r.eventDate || matchedEvt?.date;
                const evLocation = r.eventLocation || matchedEvt?.location;
                const isMember = Boolean(r.memberCode && r.memberCode.trim().length > 0);

                return (
                  <tr key={r.id} className="group border-b border-border/50 transition hover:bg-secondary/40">
                    <td
                      style={{ width: colWidths.stt, minWidth: colWidths.stt, maxWidth: colWidths.stt }}
                      className="sticky left-0 z-10 bg-card px-3 py-3 text-center font-mono text-xs font-semibold text-muted-foreground group-hover:bg-muted border-b border-border/50 whitespace-nowrap"
                    >
                      {(tc.page - 1) * tc.pageSize + idx + 1}
                    </td>
                    <td
                      style={{ width: colWidths.code, minWidth: colWidths.code, maxWidth: colWidths.code, left: colWidths.stt }}
                      className="sticky z-10 bg-card px-4 py-3 font-mono text-[12px] font-bold text-primary group-hover:bg-muted border-b border-border/50 whitespace-nowrap"
                    >
                      {r.id}
                    </td>
                    <td
                      style={{ width: colWidths.member, minWidth: colWidths.member }}
                      className="px-4 py-3 border-b border-border/50"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-xs">{r.memberName}</span>
                        {isMember ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            Hội viên
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Khách ngoài
                          </span>
                        )}
                      </div>
                      {((r as any).position || (r as any).company) && (
                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[220px]" title={`${(r as any).position || ""} ${(r as any).company || ""}`}>
                          {(r as any).position ? `${(r as any).position} · ` : ""}{(r as any).company || ""}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                        {(r as any).phone ? <span className="font-semibold text-slate-600 dark:text-slate-400">SĐT: {(r as any).phone} · </span> : null}
                        {r.email} {r.memberCode ? `· ${r.memberCode}` : ""}
                      </div>
                    </td>

                    {/* Cột Sự kiện đăng ký (Có Call API & Join) */}
                    <td
                      style={{ width: colWidths.event, minWidth: colWidths.event }}
                      className="px-4 py-3 border-b border-border/50"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-xs text-foreground line-clamp-2" title={evName}>
                          {evName}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          {evDate && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                              {evDate}
                            </span>
                          )}
                          {evLocation && (
                            <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              {evLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Chỗ ngồi / Bàn VIP */}
                    <td
                      style={{ width: colWidths.seat, minWidth: colWidths.seat }}
                      className="px-4 py-3 border-b border-border/50"
                    >
                      {r.seatAssignment ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <MapPin className="h-3.5 w-3.5" />
                          {r.seatAssignment}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Chưa xếp chỗ</span>
                      )}
                      {canSwapSeats ? (
                        <button
                          type="button"
                          onClick={() => handleOpenSeating(r)}
                          className="ml-2 text-[11px] text-primary underline hover:opacity-80 cursor-pointer font-semibold"
                          title="Ban Truyền thông / BQT / Admin: Nhấn để xếp hoặc đổi chỗ ngồi"
                        >
                          {r.seatAssignment ? "Đổi" : "Xếp"}
                        </button>
                      ) : (
                        <span
                          className="ml-2 text-[10px] text-muted-foreground italic"
                          title="Chỉ Ban Truyền Thông, Ban Quản Trị và Admin mới được xếp hoặc đổi chỗ"
                        >
                          (Cố định)
                        </span>
                      )}
                    </td>

                    <td
                      style={{ width: colWidths.ticket, minWidth: colWidths.ticket }}
                      className="px-4 py-3 border-b border-border/50 whitespace-nowrap"
                    >
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                        <Tag className="h-3 w-3" />
                        {r.ticketType || "VIP Pass"}
                      </span>
                    </td>

                    {/* Thanh toán & Phí */}
                    <td
                      style={{ width: colWidths.payment, minWidth: colWidths.payment }}
                      className="px-4 py-3 border-b border-border/50 whitespace-nowrap"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isPaid
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              }`}
                          >
                            {isPaid ? "Đã nộp" : "Chờ thanh toán"}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {fmt.money(r.paymentAmount || 500000)}
                          </span>
                        </div>
                        {!isPaid && !isCancelled && (
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            Nhắc: {reminderCount}/3 lần {reminderCount >= 2 && <span className="text-rose-600 font-bold">(Sắp hủy)</span>}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Checkin status */}
                    <td
                      style={{ width: colWidths.checkin, minWidth: colWidths.checkin }}
                      className="px-4 py-3 border-b border-border/50 whitespace-nowrap"
                    >
                      {r.checkinStatus === "on_time" || (r.checkedInAt && !r.checkinStatus) ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 w-fit">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Đúng giờ (30p)
                          </span>
                          {r.checkedInAt && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatCheckinTime(r.checkedInAt)}
                            </span>
                          )}
                        </div>
                      ) : r.checkinStatus === "late" ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 w-fit">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Muộn (&gt;30p)
                          </span>
                          {r.checkedInAt && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatCheckinTime(r.checkedInAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Chưa check-in
                        </span>
                      )}
                    </td>

                    <td
                      style={{ width: colWidths.status, minWidth: colWidths.status }}
                      className="px-4 py-3 border-b border-border/50 whitespace-nowrap"
                    >
                      <Pill color={isPaid ? "success" : isCancelled ? "danger" : "warning"}>
                        {isCancelled ? "Đã hủy" : isPaid ? "Hợp lệ" : "Chờ phí"}
                      </Pill>
                    </td>

                    {/* Action Buttons - Khay trượt ngang mượt mà */}
                    <td
                      style={{ width: colWidths.actions, minWidth: colWidths.actions }}
                      className="sticky right-0 z-10 bg-card px-3 py-2.5 group-hover:bg-card border-b border-border/50 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.12)] whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5">
                        {/* Xem QR checkin */}
                        <button
                          onClick={() => handleOpenQr(r)}
                          className="inline-flex items-center shrink-0 gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                          title="Xem mã QR Check-in"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          QR
                        </button>

                        {/* Xem khảo sát Google Form */}
                        <button
                          onClick={() => handleOpenFormSurvey(r)}
                          className="inline-flex items-center shrink-0 gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-500/20 dark:text-purple-300 cursor-pointer transition-colors"
                          title="Xem phiếu thông tin & khảo sát Google Form"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Form
                        </button>

                        {/* Xác nhận đã thanh toán chuyển khoản và đẩy vé QR */}
                        {!isPaid && !isCancelled && (
                          <button
                            onClick={() => handleConfirmBankPayment(r)}
                            className="inline-flex items-center shrink-0 gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer transition-colors"
                            title="Xác nhận đã thanh toán chuyển khoản và tự động gửi email vé kèm mã QR check-in"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã thanh toán
                          </button>
                        )}

                        {/* Thanh toán vé qua cổng VNPAY-QR */}
                        {!isPaid && !isCancelled && (
                          <button
                            onClick={() => {
                              setSelectedVnpayReg(r);
                              setVnpayModalOpen(true);
                            }}
                            className="inline-flex items-center shrink-0 gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 cursor-pointer transition-colors"
                            title="Thanh toán vé qua cổng VNPAY-QR"
                          >
                            <QrCode className="h-3.5 w-3.5 text-blue-600" />
                            VNPAY-QR
                          </button>
                        )}

                        {/* Thu tiền mặt tại chỗ nếu chưa nộp */}
                        {!isPaid && !isCancelled && (
                          <button
                            onClick={() => handleWalkInCashPayment(r)}
                            className="inline-flex items-center shrink-0 gap-1 rounded-lg bg-slate-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Thu tiền mặt tại bàn tiếp đón và tự động lưu Quản lý thu"
                          >
                            <Coins className="h-3.5 w-3.5" />
                            Tiền mặt
                          </button>
                        )}

                        {/* Nhắc nhở thanh toán 3 ngày */}
                        {!isPaid && !isCancelled && (
                          <button
                            onClick={() => handleSendReminder(r)}
                            className="inline-flex items-center shrink-0 gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 cursor-pointer transition-colors"
                            title="Gửi thông báo nhắc nhở thanh toán theo luồng đếm ngược"
                          >
                            <Bell className="h-3.5 w-3.5" />
                            Nhắc
                          </button>
                        )}

                        {/* Xóa người đăng ký sự kiện */}
                        <button
                          onClick={() => handleDeleteRegistration(r)}
                          className="inline-flex items-center shrink-0 gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 cursor-pointer transition-colors"
                          title="Xóa người đăng ký tham dự này khỏi sự kiện"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tc.total === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Không tìm thấy đăng ký nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={tc.page}
          pageCount={tc.pageCount}
          pageSize={tc.pageSize}
          total={tc.total}
          from={tc.from}
          to={tc.to}
          onPage={tc.setPage}
          onPageSize={tc.setPageSize}
        />
      </div>

      {/* Seating Assignment Modal with Cinema-Style Graphical Map */}
      {seatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl my-auto max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <span>Sơ Đồ Xếp Chỗ & Điều Phối Sự Kiện (Hội Trường / Bàn Tiệc Gala)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedReg ? (
                    <>
                      Đang xếp chỗ cho: <strong className="text-foreground font-semibold">{selectedReg.memberName}</strong> ({selectedReg.memberCode}) · Vé: {selectedReg.ticketType || "VIP"}
                    </>
                  ) : (
                    "Kéo thả hoặc click chọn đại biểu để chuyển/đổi vị trí ngồi nhanh chóng trên sơ đồ."
                  )}
                </p>
              </div>
              <button
                onClick={() => setSeatingModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Interactive Seating Studio Map */}
            <div className="mb-4">
              <CinemaSeatingMap
                eventId={selectedReg?.eventId || (eventId !== "all" ? eventId : "default")}
                currentSeat={seatInput}
                occupiedSeats={occupiedSeatsMap}
                onSelectSeat={(seatLabel) => setSeatInput(seatLabel)}
                onMoveSeat={handleMoveSeat}
              />
            </div>

            {/* Selected Seat Text & Quick Overrides */}
            {selectedReg && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-foreground">
                    Vị trí đã chọn cho {selectedReg.memberName} (Tự động hiển thị khi quét QR check-in):
                  </label>
                  <input
                    type="text"
                    value={seatInput}
                    onChange={(e) => setSeatInput(e.target.value)}
                    placeholder="Click vào ghế trên sơ đồ hoặc nhập trực tiếp..."
                    className="w-full sm:w-80 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Chọn nhanh:</span>
                  {[
                    "Hàng VIP A - Ghế A-01",
                    "Hàng VIP B - Ghế B-02",
                    "Bàn VIP 01 - Ban Chủ Tọa - Ghế 1",
                    "Bàn VIP 02 - Khách Mời Danh Dự - Ghế 1",
                    "Bàn 03 - Ban Xúc Tiến B2B - Ghế 1",
                    "Bàn 04 - Hội Viên CEO 1983 - Ghế 1",
                    "Khu Khách Mời Tự Do",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSeatInput(preset)}
                      className="rounded-lg border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-foreground hover:border-primary hover:bg-secondary cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                {selectedReg && selectedReg.seatAssignment && (
                  <button
                    type="button"
                    onClick={handleUnassignSeat}
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-2 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    Gỡ Chỗ Ngồi (Hủy Xếp Ghế Để Nhường)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSeatingModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  {selectedReg ? "Hủy" : "Đóng"}
                </button>
                {selectedReg && (
                  <button
                    onClick={handleSaveSeating}
                    disabled={submitting}
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Đang lưu..." : "Xác Nhận Xếp Chỗ"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {qrModalOpen && qrReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Mã QR Check-In</span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-primary/20 bg-white p-3 shadow-inner">
              <img
                src={getQrUrl(
                  qrReg.qrPayload || JSON.stringify({ id: qrReg.id, name: qrReg.memberName, seat: qrReg.seatAssignment }),
                  240
                )}
                alt="QR Checkin"
                className="h-full w-full object-contain"
              />
            </div>

            <h4 className="mt-4 text-base font-bold text-foreground">{qrReg.memberName}</h4>
            <p className="text-xs text-muted-foreground">{qrReg.id} · {qrReg.ticketType || "VIP Pass"}</p>

            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
              <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Vị trí chỗ ngồi đã xếp:</div>
              <div className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                {qrReg.seatAssignment || "Khu vực tự do"}
              </div>
            </div>

            <button
              onClick={() => setQrModalOpen(false)}
              className="mt-5 w-full rounded-xl border border-border bg-secondary py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Google Form Survey Response Details Modal */}
      {surveyModalOpen && selectedSurveyReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <FileText className="h-5 w-5" />
                <h3 className="text-base font-bold text-foreground">
                  Dữ Liệu Khảo Sát Google Form Của Đại Biểu
                </h3>
              </div>
              <button
                onClick={() => setSurveyModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3.5">
                <p className="text-sm font-bold text-foreground">{selectedSurveyReg.memberName}</p>
                <p className="text-muted-foreground mt-0.5">
                  Email: {selectedSurveyReg.email} · Mã: {selectedSurveyReg.id}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Doanh nghiệp: <strong>{selectedSurveyReg.company || "Công ty Hội Viên Hiệp Hội"}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground">Nhu cầu kết nối giao thương B2B (Matchmaking):</span>
                <p className="text-muted-foreground bg-secondary/40 p-2.5 rounded-lg border border-border/60 leading-relaxed">
                  Tìm kiếm đối tác sản xuất bao bì sinh học, giải pháp chuyển đổi xanh ESG và các quỹ tín dụng hỗ trợ vốn lưu động lãi suất ưu đãi.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground">Câu hỏi đặt trước cho Ban Tổ Chức / Diễn Giả:</span>
                <p className="text-muted-foreground bg-secondary/40 p-2.5 rounded-lg border border-border/60 leading-relaxed">
                  Kế hoạch hỗ trợ các doanh nghiệp hội viên tham gia hội chợ xúc tiến thương mại quốc tế trong năm 2026?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-border bg-background p-2.5">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Bàn tiệc Gala đăng ký:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedSurveyReg.seatAssignment || "Bàn Tiệc VIP Gala 02"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-2.5">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Chế độ ẩm thực:</span>
                  <p className="font-bold text-foreground">Tiệc mặn tiêu chuẩn</p>
                </div>
              </div>

              <div className="pt-1">
                <span className="font-bold text-foreground block mb-1">Hồ sơ năng lực đính kèm:</span>
                <a
                  href="https://ceo1983.vn/docs/company-profile.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" /> Xem hồ sơ năng lực (Profile PDF)
                </a>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  onClick={() => setSurveyModalOpen(false)}
                  className="rounded-xl bg-secondary px-5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Attendee & QR Check-in Modal */}
      {addAttendeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <QrCode className="h-5 w-5" />
                <h3 className="text-base font-bold text-foreground">
                  Thêm Người & Điểm Danh Sự Kiện (QR Code)
                </h3>
              </div>
              <button
                onClick={() => setAddAttendeeModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAttendeeMode("qr")}
                className={`py-2 rounded-lg transition ${attendeeMode === "qr"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Quét QR / Điểm danh nhanh
              </button>
              <button
                type="button"
                onClick={() => setAttendeeMode("manual")}
                className={`py-2 rounded-lg transition ${attendeeMode === "manual"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Thêm thông tin người mới
              </button>
            </div>

            {attendeeMode === "qr" ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 mb-2">
                    <QrCode className="h-8 w-8 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Quét mã QR từ Thẻ hội viên / Vé điện tử</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hướng camera máy quét vào mã QR hoặc nhập trực tiếp mã đại biểu/số điện thoại bên dưới.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Mã QR / Mã Hội Viên / Email / Tên đại biểu:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleProcessQrCode();
                        }
                      }}
                      placeholder="VD: CEO-1983-MB-001 hoặc nhập tên..."
                      className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleProcessQrCode()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
                    >
                      {submitting ? "Đang xử lý..." : "Điểm danh"}
                    </button>
                  </div>
                </div>

                {/* Quick suggestions from existing list */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                    Chọn nhanh người tham gia để điểm danh:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {REGISTRATIONS.slice(0, 8).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleProcessQrCode(r.memberCode || r.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2 py-1 text-[11px] text-foreground hover:bg-amber-500/10 hover:border-amber-500/30 transition"
                      >
                        <CheckCircle2 className="h-3 w-3 text-amber-500" />
                        <span>{r.memberName}</span>
                        <span className="text-muted-foreground font-mono">({r.memberCode})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitNewAttendee} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Thuộc Sự kiện:</label>
                  <select
                    value={newAttendee.eventId}
                    onChange={(e) => setNewAttendee({ ...newAttendee, eventId: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {EVENTS.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Họ và tên đại biểu <span className="text-destructive">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={newAttendee.memberName}
                      onChange={(e) => setNewAttendee({ ...newAttendee, memberName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Mã Hội Viên:</label>
                    <input
                      type="text"
                      value={newAttendee.memberCode}
                      onChange={(e) => setNewAttendee({ ...newAttendee, memberCode: e.target.value })}
                      placeholder="CEO-1983-MB-..."
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Số điện thoại:</label>
                    <input
                      type="tel"
                      value={newAttendee.phone}
                      onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Email:</label>
                    <input
                      type="email"
                      value={newAttendee.email}
                      onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                      placeholder="ceo@company.com"
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Doanh nghiệp / Công ty:</label>
                  <input
                    type="text"
                    value={newAttendee.company}
                    onChange={(e) => setNewAttendee({ ...newAttendee, company: e.target.value })}
                    placeholder="Tập đoàn Alpha / Công ty Cổ phần..."
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Hạng vé:</label>
                    <select
                      value={newAttendee.ticketType}
                      onChange={(e) => setNewAttendee({ ...newAttendee, ticketType: e.target.value })}
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="VIP">Hạng VIP Đặc Biệt</option>
                      <option value="Tiêu chuẩn">Hạng Tiêu Chuẩn</option>
                      <option value="Khách mời">Khách Mời Danh Dự</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Xếp chỗ ngồi / Bàn tiệc:</label>
                    <input
                      type="text"
                      value={newAttendee.seatAssignment}
                      onChange={(e) => setNewAttendee({ ...newAttendee, seatAssignment: e.target.value })}
                      placeholder="Bàn VIP 01 - Ghế 05"
                      className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={newAttendee.checkedIn}
                      onChange={(e) => setNewAttendee({ ...newAttendee, checkedIn: e.target.checked })}
                      className="rounded border-border text-amber-500 focus:ring-amber-500"
                    />
                    <span>Xác nhận đã có mặt tại sự kiện (Check-in ngay)</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                    {newAttendee.paymentStatus === "paid" ? "Đã thu phí" : "Chưa thu"}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setAddAttendeeModalOpen(false)}
                    className="rounded-xl border border-border bg-card px-4 py-2 font-semibold text-foreground hover:bg-muted"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-[#003B95] hover:bg-[#002B70] px-5 py-2 font-semibold text-white shadow-sm transition disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Xác nhận thêm & Điểm danh"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Event Reminder With Poster Modal */}
      <EventReminderPosterModal
        open={eventReminderModalOpen}
        initialEventId={eventId !== "all" ? eventId : undefined}
        onClose={() => setEventReminderModalOpen(false)}
        onSuccess={() => {
          fetchLiveRegistrations();
          router.invalidate();
        }}
      />

      {/* Event Poster Studio Modal */}
      <EventPosterStudioModal
        open={posterStudioOpen}
        onClose={() => setPosterStudioOpen(false)}
        event={EVENTS.find((e: any) => String(e.id) === String(eventId)) || EVENTS[0]}
        onSavePoster={() => router.invalidate()}
        onBroadcastReminder={() => {
          setPosterStudioOpen(false);
          setEventReminderModalOpen(true);
        }}
      />

      {/* VNPAY-QR Payment Gateway Modal */}
      <VnpayPaymentModal
        open={vnpayModalOpen}
        onClose={() => {
          setVnpayModalOpen(false);
          setSelectedVnpayReg(null);
        }}
        type="event"
        targetId={selectedVnpayReg?.id || ""}
        eventId={selectedVnpayReg?.eventId}
        amount={selectedVnpayReg?.paymentAmount || selectedVnpayReg?.eventTicketPrice || 500000}
        title={selectedVnpayReg?.eventName || "Vé Tham Dự Sự Kiện CEO 1983"}
        attendeeName={selectedVnpayReg?.memberName}
        memberCode={selectedVnpayReg?.memberCode}
        onSuccess={() => {
          fetchLiveRegistrations();
          router.invalidate();
        }}
      />

      {/* Modal Nhập Khách Mời từ Excel & Tự Động Gửi Email Thư Mời Sự Kiện */}
      <EventGuestExcelImportModal
        isOpen={guestExcelModalOpen}
        onClose={() => setGuestExcelModalOpen(false)}
        events={EVENTS}
        defaultEventId={EVENTS[0]?.id}
        onImportSuccess={() => {
          fetchLiveRegistrations();
          router.invalidate();
        }}
      />

      {/* Modal Quét QR Check-in Điểm Danh Zalo / Camera */}
      {checkinQrModalOpen && selectedQrEvent && (
        <EventCheckinQrModal
          open={checkinQrModalOpen}
          onClose={() => setCheckinQrModalOpen(false)}
          event={selectedQrEvent}
        />
      )}

      {/* Modal Gửi File Excel Danh Sách Check-in qua Email */}
      {sendExcelModalOpen && (
        <EventSendCheckinExcelModal
          open={sendExcelModalOpen}
          onClose={() => setSendExcelModalOpen(false)}
          eventId={selectedQrEvent?.id || "event-doanhtri-20261121"}
          eventName={selectedQrEvent?.name || selectedQrEvent?.title || "Kỷ niệm 4 năm Viện Doanh Trí"}
          events={EVENTS}
          totalAttendees={REGISTRATIONS.length}
        />
      )}
    </AppShell>
  );
}
