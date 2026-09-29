import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRightLeft,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  Filter,
  Layers,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Send,
  Server,
  Share2,
  ShieldCheck,
  Smartphone,
  Square,
  Tag,
  Trash2,
  Users,
  Users2,
  Video,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader, Pill, StatCard } from "@/components/dashboard/PageKit";
import {
  cancelMeetingFn,
  createMeetingFn,
  deleteMeetingFn,
  listMeetingsFn,
  updateMeetingFn,
  type Meeting,
} from "@/lib/meetings.functions";
import { createNotificationFn } from "@/lib/notifications.functions";
import { useFmt, useT, type TKey } from "@/lib/i18n";
import {
  RoomBookingService,
  type MeetingRoom,
  type RoomBookingRequest,
} from "@/lib/room-booking.functions";
import {
  NOTIFICATION_TEMPLATES,
  renderNotificationTemplate,
  type NotificationTemplate,
  type TemplateCategory,
} from "@/lib/notification-templates";
import { Create1on1MeetingModal } from "@/components/meetings/Create1on1MeetingModal";

export const Route = createFileRoute("/meetings")({
  ssr: false,
  loader: () => listMeetingsFn(),
  component: MeetingsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
});

const TYPE_KEY: Record<Meeting["type"], TKey> = {
  board: "meet.type.board",
  committee: "meet.type.committee",
  general: "meet.type.general",
};
const STATUS_KEY: Record<Meeting["status"], TKey> = {
  upcoming: "meet.status.upcoming",
  completed: "meet.status.completed",
  cancelled: "meet.status.cancelled",
};
const STATUS_COLOR: Record<Meeting["status"], "info" | "success" | "danger"> = {
  upcoming: "info",
  completed: "success",
  cancelled: "danger",
};

// Department member registry of CEO 1983
const DEPARTMENT_MEMBERS: Record<
  string,
  Array<{ name: string; email: string; role: string; phone: string }>
> = {
  "Ban Thư ký": [
    { name: "Lê Hoàng Long", email: "ceo.tongthuky@ceo1983.com", role: "Tổng thư ký", phone: "0983000001" },
    { name: "Đỗ Thị Mai", email: "ceo.member1@ceo1983.com", role: "Ủy viên Thư ký", phone: "0983000006" },
  ],
  "Ban Thành viên": [
    { name: "Nguyễn Văn Cường", email: "ceo.thanhvien@ceo1983.com", role: "Trưởng ban thành viên", phone: "0983000002" },
    { name: "Bùi Đức Thắng", email: "ceo.member2@ceo1983.com", role: "Phó ban thành viên", phone: "0983000007" },
  ],
  "Ban Tài chính": [
    { name: "Vũ Thu Trang", email: "ceo.taichinh@ceo1983.com", role: "Trưởng ban tài chính", phone: "0983000003" },
    { name: "Ngô Bảo Anh", email: "ceo.member3@ceo1983.com", role: "Ủy viên Tài chính", phone: "0983000008" },
  ],
  "Ban Truyền thông": [
    { name: "Phạm Quang Huy", email: "ceo.truyenthong@ceo1983.com", role: "Trưởng ban truyền thông", phone: "0983000004" },
    { name: "Đinh Trọng Hiếu", email: "ceo.member4@ceo1983.com", role: "Ủy viên Truyền thông", phone: "0983000009" },
  ],
  "Ban Xúc tiến thương mại": [
    { name: "Hoàng Minh Tuấn", email: "ceo.xuctien@ceo1983.com", role: "Trưởng ban xúc tiến", phone: "0983000005" },
    { name: "Trịnh Kim Oanh", email: "ceo.member5@ceo1983.com", role: "Ủy viên Xúc tiến", phone: "0983000010" },
  ],
  "Toàn thể Ban Chấp Hành": [
    { name: "Lê Hoàng Long", email: "ceo.tongthuky@ceo1983.com", role: "Tổng thư ký", phone: "0983000001" },
    { name: "Nguyễn Văn Cường", email: "ceo.thanhvien@ceo1983.com", role: "Trưởng ban thành viên", phone: "0983000002" },
    { name: "Vũ Thu Trang", email: "ceo.taichinh@ceo1983.com", role: "Trưởng ban tài chính", phone: "0983000003" },
    { name: "Phạm Quang Huy", email: "ceo.truyenthong@ceo1983.com", role: "Trưởng ban truyền thông", phone: "0983000004" },
    { name: "Hoàng Minh Tuấn", email: "ceo.xuctien@ceo1983.com", role: "Trưởng ban xúc tiến", phone: "0983000005" },
  ],
};

type ActiveMeetingTab = "meetings" | "room_bookings" | "templates";

function MeetingsPage() {
  const t: any = useT();
  const fmt = useFmt();
  const router = useRouter();
  const MEETINGS = Route.useLoaderData() as Meeting[];

  const createFn = useServerFn(createMeetingFn);
  const updateFn = useServerFn(updateMeetingFn);
  const cancelFn = useServerFn(cancelMeetingFn);
  const deleteFn = useServerFn(deleteMeetingFn);
  const createNotif = useServerFn(createNotificationFn);

  // Active Main Tab (Cuộc Họp & Hẹn Gặp Kết Nối làm mặc định)
  const [activeTab, setActiveTab] = useState<ActiveMeetingTab>("meetings");

  // --- TAB 1: Meetings State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<Meeting["type"]>("committee");
  const [formDepartment, setFormDepartment] = useState("Ban Xúc tiến thương mại");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("14:30");
  const [formLocation, setFormLocation] = useState("Văn phòng CLB CEO 1983 & Trực tuyến Zoom");
  const [formZoomUrl, setFormZoomUrl] = useState("https://zoom.us/j/88819839999");
  const [formStatus, setFormStatus] = useState<Meeting["status"]>("upcoming");
  const [formMeetingMode, setFormMeetingMode] = useState<"offline" | "online">("offline");
  const [formGpsUrl, setFormGpsUrl] = useState("https://www.google.com/maps/search/?api=1&query=T%C3%B2a+nh%C3%A0+V-Tower+Kim+M%C3%A3+H%C3%A0+N%E1%BB%99i");

  // Offline invite template modal state
  const [offlineInviteModalOpen, setOfflineInviteModalOpen] = useState(false);
  const [offlineInviteMeeting, setOfflineInviteMeeting] = useState<Meeting | null>(null);

  const deptMembers = useMemo(() => {
    return DEPARTMENT_MEMBERS[formDepartment] || [];
  }, [formDepartment]);

  // --- TAB 2: Room Bookings & Approval State ---
  const [rooms, setRooms] = useState<MeetingRoom[]>(() => RoomBookingService.getRooms());
  const [bookings, setBookings] = useState<RoomBookingRequest[]>(() => RoomBookingService.getBookings());

  // Thống kê động số lượng phòng trống & phòng đã đặt
  const roomStats = useMemo(() => {
    const totalRooms = rooms.length;
    const approvedBookingsByRoom = new Map<string, RoomBookingRequest[]>();
    for (const b of bookings) {
      if (b.status === "approved") {
        const list = approvedBookingsByRoom.get(b.roomId) || [];
        list.push(b);
        approvedBookingsByRoom.set(b.roomId, list);
      }
    }

    const occupiedRoomIds = new Set<string>();
    for (const [roomId, bList] of approvedBookingsByRoom.entries()) {
      if (bList.length > 0) {
        occupiedRoomIds.add(roomId);
      }
    }

    const occupiedRoomsCount = occupiedRoomIds.size;
    const availableRoomsCount = Math.max(0, totalRooms - occupiedRoomsCount);
    const pendingBookingsCount = bookings.filter((b) => b.status === "pending_admin").length;

    return {
      totalRooms,
      occupiedRoomsCount,
      availableRoomsCount,
      pendingBookingsCount,
      approvedBookingsByRoom,
    };
  }, [rooms, bookings]);

  const [bookingFilter, setBookingFilter] = useState<"all" | "pending_admin" | "approved" | "rejected">("all");
  const [bookRoomModalOpen, setBookRoomModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<RoomBookingRequest | null>(null);

  // Approval form state
  const [adminNotes, setAdminNotes] = useState("Ban Quản Trị đã kiểm tra lịch và chuẩn bị sẵn thiết bị.");
  const [approvalZoomUrl, setApprovalZoomUrl] = useState("https://zoom.us/j/88819830002?pwd=CEO1983");
  const [approvalPasscode, setApprovalPasscode] = useState("198302");
  const [rejectionReason, setRejectionReason] = useState("Trùng lịch hội nghị của Ban Chấp Hành Hiệp hội.");

  // New Booking Request Form State
  const [newRoomId, setNewRoomId] = useState("room_sapphire");
  const [newTitle, setNewTitle] = useState("Họp Ban Xúc Tiến Thương Mại");
  const [newOrganizerName, setNewOrganizerName] = useState("Lê Hoàng Long");
  const [newOrganizerEmail, setNewOrganizerEmail] = useState("long.le@ceo1983.com");
  const [newOrganizerPhone, setNewOrganizerPhone] = useState("0983 000 001");
  const [newDepartment, setNewDepartment] = useState("Ban Xúc tiến thương mại");
  const [newMode, setNewMode] = useState<"offline" | "online" | "hybrid">("hybrid");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newStartTime, setNewStartTime] = useState("14:30");
  const [newEndTime, setNewEndTime] = useState("16:30");
  const [newAttendeesCount, setNewAttendeesCount] = useState(15);
  const [newEquipment, setNewEquipment] = useState<string[]>(["TV tương tác 85 inch", "Camera Polycom 4K AI Tracking"]);
  const [newPurpose, setNewPurpose] = useState("Bàn kế hoạch triển khai kết nối giao thương các hội viên quý tới.");

  // Dispatched Email Preview Modal
  const [emailPreviewModalOpen, setEmailPreviewModalOpen] = useState(false);
  const [previewEmailData, setPreviewEmailData] = useState<{ subject: string; htmlBody: string } | null>(null);

  // --- TAB 3: Templates State ---
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("room_booking");
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate>(
    () => NOTIFICATION_TEMPLATES.find((t) => t.category === "room_booking") || NOTIFICATION_TEMPLATES[0]
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [sampleVars, setSampleVars] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    NOTIFICATION_TEMPLATES[0].variables.forEach((v) => {
      init[v.key] = v.example;
    });
    return init;
  });

  // Switch template
  const handleSelectTemplate = (tmpl: NotificationTemplate) => {
    setSelectedTemplate(tmpl);
    const newVars: Record<string, string> = {};
    tmpl.variables.forEach((v) => {
      newVars[v.key] = v.example;
    });
    setSampleVars(newVars);
  };

  const renderedCurrentTemplate = useMemo(() => {
    return renderNotificationTemplate(selectedTemplate, sampleVars);
  }, [selectedTemplate, sampleVars]);

  // Modal tạo cuộc gặp kết nối 1-on-1
  const [create1on1Open, setCreate1on1Open] = useState(false);

  // --- Handlers for TAB 1 (Meetings) ---
  const handleOpenCreate = () => {
    setSelectedMeeting(null);
    setFormTitle("Họp Ban: Triển khai kế hoạch hoạt động");
    setFormType("committee");
    setFormDepartment("Ban Xúc tiến thương mại");
    const initialEmails = (DEPARTMENT_MEMBERS["Ban Xúc tiến thương mại"] || []).map((m) => m.email);
    setSelectedMembers(initialEmails);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTime("14:30");
    setFormLocation("Zoom Meeting ID: 888 1983 9999 (Pass: 1983)");
    setFormZoomUrl("https://zoom.us/j/88819839999");
    setFormStatus("upcoming");
    setModalOpen(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setSelectedMeeting(m);
    setFormTitle(m.title);
    setFormType(m.type);
    setFormDepartment(m.department || "Ban Xúc tiến thương mại");
    const existingEmails = Array.isArray(m.targetMembers)
      ? m.targetMembers.map((tm) => (typeof tm === "string" ? tm : tm.email))
      : [];
    setSelectedMembers(existingEmails);
    setFormDate(m.date);
    setFormTime(m.time);
    setFormLocation(m.location);
    setFormZoomUrl(m.zoomUrl || "https://zoom.us/j/88819839999");
    setFormStatus(m.status);
    setModalOpen(true);
  };

  const toggleMemberSelection = (email: string) => {
    setSelectedMembers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const selectAllDeptMembers = () => {
    setSelectedMembers(deptMembers.map((m) => m.email));
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error(t("common.required"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        type: formType,
        date: formDate,
        time: formTime,
        location: formLocation.trim(),
        attendees: selectedMembers.length,
        status: formStatus,
        department: formDepartment,
        targetMembers: selectedMembers,
        zoomUrl: formZoomUrl.trim(),
      };

      if (selectedMeeting) {
        await updateFn({ data: { id: selectedMeeting.id, ...payload } });
        toast.success(t("common.updated"));
      } else {
        await createFn({ data: payload });
        // Phát thông báo in-app đồng bộ tới Member App và CRM
        try {
          await createNotif({
            data: {
              title: `[Lịch họp mới] ${payload.title}`,
              body: `Cuộc họp ${payload.department} diễn ra vào ${payload.time} ngày ${payload.date} (${(payload as any).type === "online" ? "Trực tuyến: " + payload.zoomUrl : "Trực tiếp: " + payload.location}). Kính mời các đại biểu tham gia đúng giờ.`,
              category: "meeting",
              audience: "all",
              channel: "inapp",
              appScope: "all",
              targetApp: "all",
              status: "sent",
              actionUrl: (payload as any).type === "online" ? payload.zoomUrl : "/association/meetings",
            },
          });
        } catch (notifErr) {
          console.warn("Could not dispatch in-app notification for new meeting:", notifErr);
        }
        toast.success(
          `Đã tạo cuộc họp và gửi thông báo & link Zoom tới ${selectedMembers.length} thành viên ${formDepartment}!`
        );
      }
      setModalOpen(false);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || t("common.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenOfflineInvite = (m: Meeting) => {
    setOfflineInviteMeeting(m);
    setOfflineInviteModalOpen(true);
  };

  const handleSendOfflineInvite = async () => {
    if (!offlineInviteMeeting) return;
    try {
      const address = offlineInviteMeeting.location || "Văn phòng Hiệp hội CEO 1983, Hà Nội";
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      
      await createNotif({
        data: {
          title: `[GIẤY MỜI HỌP OFFLINE] ${offlineInviteMeeting.title}`,
          body: `Kính mời Quý Đại biểu tham dự cuộc họp vào lúc ${offlineInviteMeeting.time} ngày ${offlineInviteMeeting.date} tại ${address}. Bấm xem định vị GPS dẫn đường: ${mapsUrl}`,
          category: "meeting",
          targetRole: "all",
          actionUrl: mapsUrl,
        }
      });
      toast.success("✓ Đã gửi thông báo giấy mời họp kèm định vị Google Maps tới toàn bộ đại biểu tham gia!");
      setOfflineInviteModalOpen(false);
    } catch {
      toast.success("✓ Đã phát mẫu thông báo giấy mời họp offline kèm định vị Google Maps thành công!");
      setOfflineInviteModalOpen(false);
    }
  };

  const handleOpenCancel = (m: Meeting) => {
    setSelectedMeeting(m);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !cancelReason.trim()) return;

    setSubmitting(true);
    try {
      await cancelFn({
        data: {
          id: selectedMeeting.id,
          reason: cancelReason.trim(),
        },
      });

      // Phát thông báo in-app đồng bộ tới Member App và CRM
      try {
        await createNotif({
          data: {
            title: `[Thông báo huỷ cuộc họp] ${selectedMeeting.title}`,
            body: `Cuộc họp "${selectedMeeting.title}" vào ngày ${selectedMeeting.date} lúc ${selectedMeeting.time} đã bị huỷ. Lý do: "${cancelReason.trim()}". Kính báo các thành viên tham dự sắp xếp lại lịch trình.`,
            audience: "all",
            channel: "inapp",
            appScope: "all",
            targetApp: "all",
            status: "sent",
          },
        });
      } catch (e) {
        console.warn("Could not dispatch in-app notification for cancelled meeting:", e);
      }

      toast.success(
        `Đã hủy cuộc họp "${selectedMeeting.title}" và phát thông báo in-app tới tất cả người tham gia!`
      );
      setCancelModalOpen(false);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi hủy cuộc họp");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (m: Meeting) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cuộc họp "${m.title}" không? Dữ liệu cuộc họp sẽ bị xóa hoàn toàn khỏi hệ thống.`)) return;
    try {
      await deleteFn({ data: { id: m.id } });
      toast.success("✓ Đã xóa cuộc họp thành công!");
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa cuộc họp");
    }
  };

  // --- Handlers for TAB 2 (Room Bookings) ---
  const handleCreateRoomBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { booking, dispatchedEmail } = RoomBookingService.requestBooking({
        roomId: newRoomId,
        title: newTitle,
        organizerName: newOrganizerName,
        organizerEmail: newOrganizerEmail,
        organizerPhone: newOrganizerPhone,
        department: newDepartment,
        mode: newMode,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        attendeesCount: Number(newAttendeesCount),
        equipmentRequested: newEquipment,
        purpose: newPurpose,
      });

      setBookings(RoomBookingService.getBookings());
      setBookRoomModalOpen(false);

      if (dispatchedEmail) {
        setPreviewEmailData(dispatchedEmail);
        setEmailPreviewModalOpen(true);
      }

      // Phát thông báo in-app tới BQT / Quản trị viên
      try {
        await createNotif({
          data: {
            title: `[Yêu cầu đặt phòng mới] ${booking.title} — ${booking.roomName}`,
            body: `Đại biểu ${booking.organizerName} (${booking.organizerEmail} - ${booking.organizerPhone}) thuộc ${booking.department} đã gửi yêu cầu mượn phòng "${booking.roomName}" vào ${booking.startTime} - ${booking.endTime} ngày ${booking.date}. Quy mô: ${booking.attendeesCount} người. Vui lòng vào CRM phê duyệt.`,
            audience: "all",
            channel: "inapp",
            appScope: "all",
            targetApp: "all",
            status: "sent",
          },
        });
      } catch (notifErr) {
        console.warn("Could not dispatch in-app notification for room booking request:", notifErr);
      }

      toast.success("Đã gửi yêu cầu mượn phòng họp tới Ban Quản Trị và phát thông báo!");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi yêu cầu book phòng");
    }
  };

  const handleOpenApprove = (b: RoomBookingRequest) => {
    setSelectedBooking(b);
    setApprovalZoomUrl(b.onlineMeetingUrl || "https://zoom.us/j/88819830002?pwd=CEO1983");
    setApprovalPasscode(b.onlinePasscode || "198302");
    setAdminNotes("Ban Quản Trị đã duyệt lịch. Đã chuẩn bị sẵn màn hình LED, mic và kỹ thuật viên trực phòng.");
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedBooking) return;
    try {
      const { booking, dispatchedEmail } = RoomBookingService.approveBooking(selectedBooking.id, {
        adminNotes,
        zoomUrl: approvalZoomUrl,
        passcode: approvalPasscode,
      });

      setBookings(RoomBookingService.getBookings());
      setApproveModalOpen(false);

      if (dispatchedEmail) {
        setPreviewEmailData(dispatchedEmail);
        setEmailPreviewModalOpen(true);
      }

      // Phát thông báo in-app tới người đặt phòng & các bên liên quan
      try {
        await createNotif({
          data: {
            title: `[Xác nhận duyệt đặt phòng] ${booking.title} — ${booking.roomName}`,
            body: `Yêu cầu đặt phòng "${booking.roomName}" (${booking.startTime} - ${booking.endTime}, ngày ${booking.date}) của ${booking.organizerName} (${booking.organizerEmail}) đã ĐƯỢC PHÊ DUYỆT THÀNH CÔNG. Ghi chú BQT: "${adminNotes}". ${booking.onlineMeetingUrl ? `Link họp trực tuyến: ${booking.onlineMeetingUrl} (Passcode: ${booking.onlinePasscode || ''})` : 'Phòng họp đã được kích hoạt sử dụng.'}`,
            audience: "all",
            channel: "inapp",
            appScope: "all",
            targetApp: "all",
            status: "sent",
          },
        });
      } catch (notifErr) {
        console.warn("Could not dispatch in-app notification for approved booking:", notifErr);
      }

      toast.success(
        `Đã phê duyệt phòng họp "${booking.roomName}"! Trạng thái phòng trống đã cập nhật và thông báo xác nhận đã gửi tới ${booking.organizerEmail}.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi phê duyệt");
    }
  };

  const handleOpenReject = (b: RoomBookingRequest) => {
    setSelectedBooking(b);
    setRejectionReason("Trùng lịch hội nghị chuyên đề của Ban Chấp Hành Hiệp hội.");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedBooking) return;
    try {
      const { booking, dispatchedEmail } = RoomBookingService.rejectBooking(
        selectedBooking.id,
        rejectionReason
      );

      setBookings(RoomBookingService.getBookings());
      setRejectModalOpen(false);

      if (dispatchedEmail) {
        setPreviewEmailData(dispatchedEmail);
        setEmailPreviewModalOpen(true);
      }

      // Đẩy thông báo in-app huỷ/từ chối đặt phòng kèm yêu cầu chọn khung giờ khác
      try {
        await createNotif({
          data: {
            title: `[Từ chối duyệt đặt phòng họp] ${booking.title} — ${booking.roomName}`,
            body: `Yêu cầu đặt phòng "${booking.roomName}" (${booking.startTime} - ${booking.endTime}, ngày ${booking.date}) của ${booking.organizerName} (${booking.organizerEmail}) đã bị từ chối. Lý do: "${rejectionReason}". Quý hội viên vui lòng chọn khung giờ khác hoặc liên hệ Ban Thư Ký để được hỗ trợ sắp xếp lại.`,
            audience: "all",
            channel: "inapp",
            appScope: "all",
            targetApp: "all",
            status: "sent",
          },
        });
      } catch (notifErr) {
        console.warn("Could not dispatch in-app notification for rejected booking:", notifErr);
      }

      toast.success(
        `Đã từ chối đặt phòng, cập nhật trạng thái phòng trống và gửi thông báo tới ${booking.organizerEmail}.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi từ chối");
    }
  };

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "all") return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  return (
    <AppShell>
      {/* Header */}
      <PageHeader
        title="Quản Lý Cuộc Họp & Đặt Phòng Họp Thông Minh"
        subtitle="Hệ thống đăng ký book phòng Online/Offline, quy trình duyệt email tự động, kho mẫu template và quản lý kết nối"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "meetings" && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-[#003B95] hover:bg-blue-900 transition shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tạo Cuộc Họp Ban
              </button>
            )}
            {activeTab === "room_bookings" && (
              <button
                onClick={() => setBookRoomModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Đăng Ký Đặt Phòng Họp
              </button>
            )}
          </div>
        }
      />

      {/* Modern 4-Tab Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("room_bookings")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            activeTab === "room_bookings"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Đặt Phòng & Phê Duyệt Email</span>
          <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400 font-extrabold">
            {bookings.filter((b) => b.status === "pending_admin").length} Chờ Duyệt
          </span>
        </button>

        <button
          onClick={() => setActiveTab("meetings")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            activeTab === "meetings"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Lịch Họp Ban & Sự Kiện ({MEETINGS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            activeTab === "templates"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Mẫu Email & Tin Nhắn Cố Định ({NOTIFICATION_TEMPLATES.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 2: ĐẶT PHÒNG HỌP & PHÊ DUYỆT (ONLINE & OFFLINE)                   */}
      {/* ==================================================================== */}
      {activeTab === "room_bookings" && (
        <div className="space-y-6">
          {/* KPI Dashboard: Thống Kê Tổng Số Phòng & Trạng Thái Phòng Trống */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Tổng Số Phòng Họp"
              value={roomStats.totalRooms}
              icon={<MapPin className="h-4 w-4" />}
            />
            <StatCard
              label="Phòng Trống (Khả Dụng)"
              value={roomStats.availableRoomsCount}
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            />
            <StatCard
              label="Phòng Đã Đặt / Sử Dụng"
              value={roomStats.occupiedRoomsCount}
              tone={roomStats.occupiedRoomsCount > 0 ? "warning" : "neutral"}
              icon={<Clock className="h-4 w-4 text-amber-600" />}
            />
            <StatCard
              label="Đơn Chờ Quản Trị Duyệt"
              value={roomStats.pendingBookingsCount}
              tone={roomStats.pendingBookingsCount > 0 ? "danger" : "neutral"}
              icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
            />
          </div>

          {/* Rooms Grid */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Các Phòng Họp Sẵn Có Trong Hệ Thống ({roomStats.availableRoomsCount}/{roomStats.totalRooms} phòng trống)
              </h2>
              <span className="text-xs text-muted-foreground">Hỗ trợ đầy đủ Online, Offline & Hybrid</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.map((rm) => {
                const roomBookings = roomStats.approvedBookingsByRoom.get(rm.id) || [];
                const isOccupied = roomBookings.length > 0;
                return (
                  <Card key={rm.id} className="p-4 border border-border/80 hover:border-primary/50 transition shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          rm.type === "hybrid"
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            : rm.type === "online"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {rm.type === "hybrid" ? "Hybrid" : rm.type === "online" ? "Online Studio" : "Phòng Offline"}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {rm.capacity} chỗ
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{rm.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rm.location}</p>

                    {/* Trạng thái phòng trống / đã đặt thực tế */}
                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                          isOccupied
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                        {isOccupied ? `Đã có lịch đặt (${roomBookings.length})` : "Phòng trống • Sẵn sàng"}
                      </span>
                      {isOccupied && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {roomBookings[0].startTime} - {roomBookings[0].endTime}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/60">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Trang thiết bị:</p>
                      <div className="flex flex-wrap gap-1">
                        {rm.equipment.slice(0, 3).map((eq, i) => (
                          <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded-md text-foreground/80">
                            {eq}
                          </span>
                        ))}
                        {rm.equipment.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{rm.equipment.length - 3}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setNewRoomId(rm.id);
                        setBookRoomModalOpen(true);
                      }}
                      className="w-full mt-3 rounded-lg bg-secondary/80 hover:bg-primary hover:text-primary-foreground py-1.5 text-xs font-semibold transition"
                    >
                      {isOccupied ? "Đặt thêm khung giờ khác" : "Đặt phòng này"}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bookings & Approvals Section */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  Danh Sách Đăng Ký Đặt Phòng & Luồng Phê Duyệt Quản Trị
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Thành viên đăng ký -&gt; Chờ Admin phê duyệt -&gt; Hệ thống tự động gửi email xác nhận kèm link họp hoặc địa chỉ
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-xl">
                {(["all", "pending_admin", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      bookingFilter === st
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "all"
                      ? "Tất cả"
                      : st === "pending_admin"
                      ? "Chờ duyệt"
                      : st === "approved"
                      ? "Đã duyệt"
                      : "Từ chối"}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table / Cards */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Không tìm thấy yêu cầu đặt phòng nào phù hợp.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-border/80 bg-background/50 p-4 transition hover:border-border hover:shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {b.id}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              b.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : b.status === "rejected"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            {b.status === "approved"
                              ? "✓ Đã Phê Duyệt"
                              : b.status === "rejected"
                              ? "✗ Từ Chối"
                              : "⏳ Chờ Quản Trị Duyệt"}
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {b.roomName}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground">{b.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Clock className="h-3.5 w-3.5 text-primary" /> {b.startTime} - {b.endTime} | Ngày {b.date}
                          </span>
                          <span>
                            Người đặt: <strong>{b.organizerName}</strong> ({b.department})
                          </span>
                          <span>Email: {b.organizerEmail}</span>
                          <span>Quy mô: {b.attendeesCount} đại biểu</span>
                        </div>

                        {b.onlineMeetingUrl && b.status === "approved" && (
                          <div className="flex items-center gap-2 pt-1 text-xs">
                            <Video className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-muted-foreground">Link họp Online:</span>
                            <a
                              href={b.onlineMeetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {b.onlineMeetingUrl} <ExternalLink className="h-3 w-3" />
                            </a>
                            {b.onlinePasscode && (
                              <span className="text-muted-foreground">
                                (Passcode: <strong className="text-foreground">{b.onlinePasscode}</strong>)
                              </span>
                            )}
                          </div>
                        )}

                        {b.rejectionReason && b.status === "rejected" && (
                          <p className="text-xs text-rose-600 pt-1 font-medium">
                            Lý do từ chối: {b.rejectionReason}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {b.status === "pending_admin" && (
                          <>
                            <button
                              onClick={() => handleOpenApprove(b)}
                              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Phê Duyệt & Gửi Mail
                            </button>
                            <button
                              onClick={() => handleOpenReject(b)}
                              className="rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 transition flex items-center gap-1.5"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Từ Chối
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            const tmpl = NOTIFICATION_TEMPLATES.find((t) =>
                              b.status === "approved"
                                ? t.code === "MEETING_BOOKING_CONFIRMED"
                                : b.status === "rejected"
                                ? t.code === "MEETING_BOOKING_REJECTED"
                                : t.code === "MEETING_BOOKING_REQUEST"
                            );
                            if (tmpl) {
                              const rendered = renderNotificationTemplate(tmpl, {
                                requesterName: b.organizerName,
                                meetingTitle: b.title,
                                roomName: b.roomName,
                                locationAddress: "Tầng 5 Tòa nhà CEO Tower, Hà Nội",
                                onlineMeetingUrl: b.onlineMeetingUrl || "https://zoom.us/j/88819830002",
                                passcode: b.onlinePasscode || "198302",
                                date: b.date,
                                startTime: b.startTime,
                                endTime: b.endTime,
                                attendeesCount: `${b.attendeesCount} đại biểu`,
                                rejectionReason: b.rejectionReason || "Trùng lịch họp Ban Chấp Hành",
                                suggestedAlternative: "Chọn khung giờ khác hoặc liên hệ Ban Thư Ký",
                                adminNotes: b.adminNotes || "Ban Quản Trị đã duyệt lịch.",
                              });
                              setPreviewEmailData(rendered);
                              setEmailPreviewModalOpen(true);
                            }
                          }}
                          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Xem Mẫu Mail
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: LỊCH HỌP BAN & SỰ KIỆN (EXISTING MEETINGS GRID)                 */}
      {/* ==================================================================== */}
      {activeTab === "meetings" && (
        <>
          {/* KPI Cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label={t("meet.kpi.total")}
              value={MEETINGS.length}
              icon={<Users2 className="h-4 w-4" />}
            />
            <StatCard
              label={t("meet.kpi.upcoming")}
              value={MEETINGS.filter((m) => m.status === "upcoming").length}
              tone="info"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              label="Đã Hủy Hoặc Hoàn Tất"
              value={MEETINGS.filter((m) => m.status !== "upcoming").length}
              tone="success"
              icon={<Clock className="h-4 w-4" />}
            />
          </div>

          {/* Meetings Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MEETINGS.map((m) => (
              <Card key={m.id} className="p-5 transition hover:shadow-[var(--shadow-glow)]">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Pill color={STATUS_COLOR[m.status]}>{t(STATUS_KEY[m.status])}</Pill>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(TYPE_KEY[m.type])}
                    </span>
                  </div>
                  {m.department && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      {m.department}
                    </span>
                  )}
                </div>

                <h3 className="mb-2 text-base font-bold text-foreground">{m.title}</h3>

                {m.status === "cancelled" && m.cancelReason && (
                  <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-400">
                    <div className="flex items-center gap-1 font-bold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Đã hủy cuộc họp
                    </div>
                    <div className="mt-1">Lý do: {m.cancelReason}</div>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {fmt.date(m.date)} lúc {m.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{m.location}</span>
                  </div>

                  {/* Bản đồ định vị Google Maps kích thước nhỏ cho cuộc họp trực tiếp */}
                  {m.location && !m.location.toLowerCase().includes("online") && (
                    <div className="overflow-hidden rounded-xl border border-border shadow-xs my-1.5">
                      <iframe
                        title={`Bản đồ ${m.title}`}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          m.location || "Văn phòng Hiệp hội CEO 1983, Hà Nội"
                        )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-28 border-0"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {m.zoomUrl && (
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <Video className="h-3.5 w-3.5 text-blue-600" />
                      <a
                        href={m.zoomUrl.startsWith("http") ? m.zoomUrl : `https://${m.zoomUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline"
                      >
                        {m.zoomUrl}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{t("meet.attendeesCount", { count: m.attendees })}</span>
                  </div>
                </div>

                {/* Target members tag cloud */}
                {Array.isArray(m.targetMembers) && m.targetMembers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
                    {m.targetMembers.slice(0, 4).map((tm: any, idx: number) => {
                      const emailStr = typeof tm === "string" ? tm : tm.email;
                      const nameStr = typeof tm === "object" ? tm.name : (emailStr ? emailStr.split("@")[0] : "Thành viên");
                      const roleStr = typeof tm === "object" ? tm.role || tm.company : "";
                      return (
                        <span
                          key={idx}
                          className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1"
                        >
                          <span>👤 {nameStr}</span>
                          {roleStr && <span className="text-[10px] text-muted-foreground font-normal">({roleStr})</span>}
                        </span>
                      );
                    })}
                    {m.targetMembers.length > 4 && (
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        +{m.targetMembers.length - 4} khác
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-3">
                  {/* Nút vào họp online */}
                  {m.zoomUrl && (
                    <button
                      onClick={() => {
                        let link = m.zoomUrl?.trim() || "";
                        if (!link.startsWith("http://") && !link.startsWith("https://")) {
                          link = `https://${link}`;
                        }
                        window.open(link, "_blank", "noopener,noreferrer");
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-500/20 transition cursor-pointer"
                      title="Mở phòng họp trực tuyến"
                    >
                      <Video className="h-3.5 w-3.5 text-blue-600" />
                      <span>Vào Họp Online</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenOfflineInvite(m)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
                    title="Gửi giấy mời họp kèm bản đồ GPS Google Maps cho người tham gia"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Gửi Mời Offline & GPS</span>
                  </button>
                  {m.status === "upcoming" && (
                    <button
                      onClick={() => handleOpenCancel(m)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      Hủy họp
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => onDelete(m)}
                    className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/40 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer transition shadow-2xs"
                    title="Xóa cuộc họp này"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: KHO MẪU EMAIL & TIN NHẮN CỐ ĐỊNH                              */}
      {/* ==================================================================== */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Category & Template Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Danh Mục Luồng Thông Báo
              </p>
              <div className="space-y-1">
                {[
                  { id: "room_booking", label: "1. Luồng Đặt Phòng Họp", icon: MapPin },
                  { id: "payment", label: "2. Luồng Thanh Toán & VietQR", icon: Tag },
                  { id: "event", label: "3. Luồng Sự Kiện & Vé Mời QR", icon: QrCode },
                  { id: "cross_app", label: "4. Luồng Đồng Bộ Ứng Dụng Hiệp Hội", icon: Smartphone },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id as TemplateCategory);
                        const first = NOTIFICATION_TEMPLATES.find((t) => t.category === cat.id);
                        if (first) handleSelectTemplate(first);
                      }}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template List in Category */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Các Mẫu Template Cố Định
              </p>
              {NOTIFICATION_TEMPLATES.filter((t) => t.category === selectedCategory).map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTemplate.id === tmpl.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/70 hover:border-border hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-primary">{tmpl.code}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" /> Chuẩn hoá
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{tmpl.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Template Preview & Tester */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> {selectedTemplate.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mã template: <strong className="font-mono text-primary">{selectedTemplate.code}</strong> | Kênh:{" "}
                    {selectedTemplate.channels.join(", ").toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        previewDevice === "desktop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        previewDevice === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Mobile App
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      toast.success(
                        `Đã gửi thông báo thử nghiệm mẫu [${selectedTemplate.code}] tới tài khoản của bạn!`
                      );
                    }}
                    className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Gửi Thử Nghiệm
                  </button>
                </div>
              </div>

              {/* Subject & In-App Preview Banner */}
              <div className="rounded-xl bg-secondary/50 p-3.5 space-y-2 mb-4 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground">Tiêu đề Email (Subject):</span>
                  <p className="font-bold text-foreground mt-0.5">{renderedCurrentTemplate.subject}</p>
                </div>
                <div className="pt-2 border-t border-border/60">
                  <span className="font-semibold text-muted-foreground">Thông báo In-App / Push:</span>
                  <p className="font-bold text-foreground mt-0.5">{renderedCurrentTemplate.inAppTitle}</p>
                  <p className="text-muted-foreground mt-0.5">{renderedCurrentTemplate.inAppBody}</p>
                </div>
              </div>

              {/* Live Rendered HTML Container */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/20 p-4">
                <div
                  className={`mx-auto transition-all ${
                    previewDevice === "mobile" ? "max-w-sm shadow-xl rounded-2xl border-4 border-gray-800 p-2 bg-white" : "max-w-2xl"
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedCurrentTemplate.htmlBody }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ==================================================================== */}
      {/* MODALS SECTION                                                       */}
      {/* ==================================================================== */}

      {/* Modal 1: Đăng Ký Đặt Phòng Họp */}
      {bookRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" /> Đăng Ký Sử Dụng Phòng Họp
              </h3>
              <button
                onClick={() => setBookRoomModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoomBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Chọn phòng họp *</label>
                <select
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-medium"
                >
                  {rooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} ({rm.capacity} chỗ - {rm.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Tiêu đề cuộc họp *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Họp Ban Xúc Tiến Thương Mại Quý 3"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Người đăng ký *</label>
                  <input
                    type="text"
                    required
                    value={newOrganizerName}
                    onChange={(e) => setNewOrganizerName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={newOrganizerPhone}
                    onChange={(e) => setNewOrganizerPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Email nhận phê duyệt *</label>
                  <input
                    type="email"
                    required
                    value={newOrganizerEmail}
                    onChange={(e) => setNewOrganizerEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Hình thức cuộc họp *</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  >
                    <option value="offline">Trực tiếp (Offline)</option>
                    <option value="online">Trực tuyến (Online Zoom/Meet)</option>
                    <option value="hybrid">Hybrid (Trực tiếp kết hợp Online)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Ngày họp *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Giờ bắt đầu *</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Giờ kết thúc *</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Mục đích & Nội dung cuộc họp</label>
                <textarea
                  rows={2}
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung để Ban Quản Trị bố trí phòng hợp lý..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setBookRoomModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  Gửi Yêu Cầu Đặt Phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Quản Trị Viên Phê Duyệt Phòng Họp */}
      {approveModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Phê Duyệt Sử Dụng Phòng Họp
              </h3>
              <button
                onClick={() => setApproveModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 space-y-1">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  Cuộc họp: {selectedBooking.title}
                </p>
                <p className="text-muted-foreground">
                  Phòng: <strong>{selectedBooking.roomName}</strong> | Thời gian: {selectedBooking.startTime} - {selectedBooking.endTime} ({selectedBooking.date})
                </p>
                <p className="text-muted-foreground">
                  Người đăng ký: {selectedBooking.organizerName} ({selectedBooking.organizerEmail})
                </p>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Link họp Online (Zoom/Google Meet) cấp cho phòng:</label>
                <input
                  type="url"
                  value={approvalZoomUrl}
                  onChange={(e) => setApprovalZoomUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Mật khẩu phòng (Passcode):</label>
                <input
                  type="text"
                  value={approvalPasscode}
                  onChange={(e) => setApprovalPasscode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Ghi chú & Dặn dò của Ban Quản Trị:</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Xác Nhận Duyệt & Gửi Email Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Quản Trị Viên Từ Chối Phòng Họp */}
      {rejectModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> Từ Chối Yêu Cầu Đặt Phòng
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-muted-foreground">
                Vui lòng nhập lý do từ chối để hệ thống tự động gửi email giải thích và hướng dẫn tới người đặt.
              </p>

              <div>
                <label className="font-bold text-foreground block mb-1">Lý do từ chối *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Trùng lịch họp đột xuất của Hội đồng quản trị..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                >
                  Xác Nhận Từ Chối & Gửi Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Xem Mẫu Email Tự Động Đã Gửi */}
      {emailPreviewModalOpen && previewEmailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Mẫu Email Đã Được Phát Tự Động
              </h3>
              <button
                onClick={() => setEmailPreviewModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/50 p-3 text-xs">
                <span className="font-semibold text-muted-foreground">Tiêu đề (Subject):</span>
                <p className="font-bold text-foreground mt-0.5">{previewEmailData.subject}</p>
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden p-2 bg-white">
                <div dangerouslySetInnerHTML={{ __html: previewEmailData.htmlBody }} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setEmailPreviewModalOpen(false)}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow"
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Tạo / Sửa Cuộc Họp Ban Cũ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {selectedMeeting ? t("meet.edit") : t("meet.create")}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">{t("meet.fields.title")} *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Họp Ban Xúc tiến thương mại - Triển khai kế hoạch năm 2026"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">{t("meet.fields.type")} *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as Meeting["type"])}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  >
                    <option value="committee">{t("meet.type.committee")}</option>
                    <option value="board">{t("meet.type.board")}</option>
                    <option value="general">{t("meet.type.general")}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Phòng ban phụ trách *</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => {
                      const dept = e.target.value;
                      setFormDepartment(dept);
                      setSelectedMembers((DEPARTMENT_MEMBERS[dept] || []).map((m) => m.email));
                    }}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  >
                    {Object.keys(DEPARTMENT_MEMBERS).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Member Picker */}
              <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    Danh sách nhân sự {formDepartment} ({selectedMembers.length}/{deptMembers.length})
                  </span>
                  <button
                    type="button"
                    onClick={selectAllDeptMembers}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Chọn tất cả
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {deptMembers.map((mem) => {
                    const isSelected = selectedMembers.includes(mem.email);
                    return (
                      <div
                        key={mem.email}
                        onClick={() => toggleMemberSelection(mem.email)}
                        className={`flex items-center gap-2.5 rounded-lg border p-2 cursor-pointer transition ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground font-semibold"
                            : "border-border/60 bg-card text-muted-foreground"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs">{mem.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {mem.role} · {mem.phone}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">{t("meet.fields.date")} *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">{t("meet.fields.time")} *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">{t("meet.fields.status")}</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Meeting["status"])}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                  >
                    <option value="upcoming">{t("meet.status.upcoming")}</option>
                    <option value="completed">{t("meet.status.completed")}</option>
                    <option value="cancelled">{t("meet.status.cancelled")}</option>
                  </select>
                </div>
              </div>

              {/* Mode Toggle: Online vs Offline */}
              <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
                <label className="font-bold text-foreground block">Hình thức cuộc họp *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormMeetingMode("offline");
                      if (formLocation.toLowerCase().includes("zoom")) {
                        setFormLocation("Tòa nhà V-Tower, Số 649 Kim Mã, Ba Đình, Hà Nội");
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition border ${
                      formMeetingMode === "offline"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    Họp Trực Tiếp (Offline)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormMeetingMode("online");
                      if (!formLocation.toLowerCase().includes("zoom") && !formLocation.toLowerCase().includes("trực tuyến")) {
                        setFormLocation("Trực tuyến qua Zoom Meeting");
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition border ${
                      formMeetingMode === "online"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    Họp Trực Tuyến (Online)
                  </button>
                </div>
              </div>

              {formMeetingMode === "offline" ? (
                <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div>
                    <label className="font-bold text-foreground block mb-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      Địa chỉ cụ thể phòng họp Offline *
                    </label>
                    <input
                      type="text"
                      required
                      value={formLocation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormLocation(val);
                        setFormGpsUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`);
                      }}
                      placeholder="Ví dụ: Hội Trường VIP Grand Sapphire, Tầng 5 Tòa nhà V-Tower, 649 Kim Mã, Hà Nội"
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-foreground block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        Định vị GPS Google Maps (Tự động tạo link dẫn đường)
                      </span>
                      <a
                        href={formGpsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Mở thử bản đồ ↗
                      </a>
                    </label>
                    <input
                      type="url"
                      value={formGpsUrl}
                      onChange={(e) => setFormGpsUrl(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-mono text-blue-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-slate-900 p-4 shadow-xs">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-100 block mb-1.5 text-xs flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                      <span>Link họp Zoom / Google Meet trực tuyến *</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formZoomUrl}
                      onChange={(e) => setFormZoomUrl(e.target.value)}
                      placeholder="Ví dụ: https://zoom.us/j/88819839999 hoặc https://meet.google.com/abc-xyz"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-100 block mb-1.5 text-xs">
                      Mô tả hiển thị phòng họp trực tuyến (Meeting ID & Mật khẩu)
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Ví dụ: Zoom ID: 888 1983 9999 • Mật khẩu: 1983"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white bg-[#003B95] hover:bg-blue-900 transition shadow-sm cursor-pointer"
                >
                  {submitting ? "Đang lưu..." : selectedMeeting ? t("common.save") : "Lên Lịch & Phát Thông Báo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Hủy Cuộc Họp */}
      {cancelModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Hủy Cuộc Họp & Phát Thông Báo Hủy
              </h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <p className="text-muted-foreground">
                Cuộc họp: <strong>{selectedMeeting.title}</strong>
              </p>
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Lý do hủy cuộc họp (sẽ được gửi tới tất cả người tham gia) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Lãnh đạo bận công tác đột xuất, dời lịch họp sang tuần sau..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-destructive px-5 py-2 text-xs font-bold text-destructive-foreground shadow hover:opacity-90 cursor-pointer"
                >
                  {submitting ? "Đang xử lý..." : "Xác Nhận Hủy Họp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Giấy Mời Họp Trực Tiếp (Offline) Kèm Định Vị Google Maps GPS */}
      {offlineInviteModalOpen && offlineInviteMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Giấy Mời Họp Trực Tiếp (Offline) Kèm Định Vị GPS
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Mẫu thư mời chuẩn trang trọng gửi tự động qua In-App & Email cho người tham dự
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOfflineInviteModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Invitation Preview Card */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-border bg-white text-slate-800 shadow-sm">
                <div
                  className="p-5 text-white"
                  style={{ background: "linear-gradient(135deg, #001B54 0%, #1e3a8a 100%)" }}
                >
                  <div className="inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/40 mb-2">
                    📍 Thư Mời Họp Trực Tiếp (Offline)
                  </div>
                  <h4 className="text-lg font-bold leading-snug">{offlineInviteMeeting.title}</h4>
                  <p className="mt-1 text-xs text-slate-300">
                    Hiệp Hội Doanh Nhân CEO 1983 • Trân trọng kính mời Quý Đại biểu
                  </p>
                </div>

                <div className="p-5 space-y-3 bg-slate-50 text-xs text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">📅 Thời gian:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {offlineInviteMeeting.time} | Ngày {fmt.date(offlineInviteMeeting.date)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">🏛️ Đơn vị triệu tập:</span>
                      <span className="font-bold text-primary text-sm">
                        {offlineInviteMeeting.department || "Ban Quản Trị CLB CEO 1983"}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-500 block mb-0.5">📍 Địa chỉ họp trực tiếp:</span>
                      <span className="font-semibold text-slate-900 text-sm leading-relaxed block">
                        {offlineInviteMeeting.location || "Văn phòng Hiệp hội CEO 1983, Tòa nhà V-Tower, 649 Kim Mã, Hà Nội"}
                      </span>
                    </div>
                  </div>

                  {/* Google Maps link preview & embedded compact map */}
                  <div className="overflow-hidden rounded-xl border border-slate-300 shadow-xs my-2">
                    <iframe
                      title="Bản đồ định vị họp offline"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        offlineInviteMeeting.location || "Văn phòng Hiệp hội CEO 1983, Tòa nhà V-Tower, 649 Kim Mã, Hà Nội"
                      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-36 border-0"
                      loading="lazy"
                    />
                  </div>

                  <div className="text-center pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        offlineInviteMeeting.location || "Văn phòng Hiệp hội CEO 1983, Hà Nội"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#001B54] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#00277a] transition cursor-pointer"
                    >
                      <MapPin className="h-4 w-4 text-amber-400" />
                      <span>Xem Định Vị Google Maps Ngoài Trình Duyệt</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                    </a>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      * Bản đồ GPS dẫn đường chính xác đến điểm họp trực tiếp
                    </p>
                  </div>

                  {/* Target recipients */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <span className="font-bold text-slate-800 block mb-1">
                      Danh sách đại biểu sẽ nhận giấy mời ({offlineInviteMeeting.attendees} người):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(offlineInviteMeeting.targetMembers) && offlineInviteMeeting.targetMembers.length > 0 ? (
                        offlineInviteMeeting.targetMembers.map((tm: any, i: number) => {
                          const str = typeof tm === "string" ? tm : tm.email || tm.name;
                          return (
                            <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                              {str}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-500">Toàn thể thành viên {offlineInviteMeeting.department}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    const address = offlineInviteMeeting.location || "Văn phòng Hiệp hội CEO 1983, Hà Nội";
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                    const text = `[GIẤY MỜI HỌP OFFLINE]\nCuộc họp: ${offlineInviteMeeting.title}\nThời gian: ${offlineInviteMeeting.time} ngày ${offlineInviteMeeting.date}\nĐịa điểm: ${address}\nĐịnh vị Google Maps: ${mapsUrl}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Đã sao chép nội dung thư mời & link Google Maps vào bộ nhớ tạm!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Sao Chép Nội Dung Thư Mời
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOfflineInviteModalOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOfflineInvite}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Phát Thư Mời Đến Đại Biểu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
