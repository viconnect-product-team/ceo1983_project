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
  Phone,
  AlertTriangle,
  CalendarClock,
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
  type MeetingPlatform,
  type MeetingCreatorRole,
} from "@/lib/meetings.functions";
import { createNotificationFn } from "@/lib/notifications.functions";
import { useRole } from "@/hooks/use-role";
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
const STATUS_KEY: Record<Meeting["status"], any> = {
  pending_approval: "meet.status.pending_approval",
  upcoming: "meet.status.upcoming",
  completed: "meet.status.completed",
  cancelled: "meet.status.cancelled",
};
const STATUS_COLOR: Record<Meeting["status"], "info" | "success" | "danger" | "warning"> = {
  pending_approval: "warning",
  upcoming: "info",
  completed: "success",
  cancelled: "danger",
};

const DEPARTMENT_MEMBERS: Record<
  string,
  Array<{ name: string; email: string; role: string; phone: string }>
> = {
  "Ban quản trị": [
    { name: "Lê Văn Hùng", email: "ceo.bantrith@ceo1983.com", role: "Trưởng ban quản trị", phone: "0983000001" },
    { name: "Trần Anh Đức", email: "ceo.quantri2@ceo1983.com", role: "Ủy viên Ban quản trị", phone: "0983000006" },
  ],
  "Ban thư ký": [
    { name: "Lê Hoàng Long", email: "ceo.tongthuky@ceo1983.com", role: "Tổng thư ký", phone: "0983000002" },
    { name: "Đỗ Thị Mai", email: "ceo.thuky1@ceo1983.com", role: "Ủy viên Ban thư ký", phone: "0983000007" },
  ],
  "Ban thành viên": [
    { name: "Nguyễn Văn Cường", email: "ceo.thanhvien@ceo1983.com", role: "Trưởng ban thành viên", phone: "0983000003" },
    { name: "Bùi Đức Thắng", email: "ceo.thanhvien2@ceo1983.com", role: "Phó ban thành viên", phone: "0983000008" },
  ],
  "Ban xúc tiến thương mại": [
    { name: "Hoàng Minh Tuấn", email: "ceo.xuctien@ceo1983.com", role: "Trưởng ban xúc tiến thương mại", phone: "0983000004" },
    { name: "Trịnh Kim Oanh", email: "ceo.xuctien2@ceo1983.com", role: "Ủy viên Xúc tiến", phone: "0983000009" },
  ],
  "Ban truyền thông": [
    { name: "Phạm Quang Huy", email: "ceo.truyenthong@ceo1983.com", role: "Trưởng ban truyền thông", phone: "0983000005" },
    { name: "Đinh Trọng Hiếu", email: "ceo.truyenthong2@ceo1983.com", role: "Ủy viên Truyền thông", phone: "0983000010" },
  ],
  "Ban thiện nguyện": [
    { name: "Vũ Thu Trang", email: "ceo.thiennguyen@ceo1983.com", role: "Trưởng ban thiện nguyện", phone: "0983000011" },
    { name: "Ngô Bảo Anh", email: "ceo.thiennguyen2@ceo1983.com", role: "Ủy viên Thiện nguyện", phone: "0983000012" },
  ],
};

type ActiveMeetingTab = "meetings" | "templates";

function MeetingsPage() {
  const t: any = useT();
  const fmt = useFmt();
  const router = useRouter();
  const MEETINGS = (Route.useLoaderData() || []) as Meeting[];
  const roleState = useRole();
  const { isPlatformAdmin, isAdmin, isBQT, srsRole } = roleState;
  const isSuperAdmin = isPlatformAdmin || isBQT;
  const role = (roleState.roles && roleState.roles[0]) || (srsRole as string);

  // Role permissions
  const canCreateMeeting = isSuperAdmin || isAdmin || srsRole === "BQT" || srsRole === "BTV" || srsRole === "BTC" || role === "tong_thu_ky" || role === "truong_ban";
  const canApproveMeeting = isSuperAdmin || isAdmin;

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
  const [formLocation, setFormLocation] = useState("Trực tuyến qua Zoom Meeting");
  const [formZoomUrl, setFormZoomUrl] = useState("https://zoom.us/j/88819839999");
  const [formStatus, setFormStatus] = useState<Meeting["status"]>("upcoming");
  const [formMeetingMode, setFormMeetingMode] = useState<"offline" | "online">("online");
  const [formGpsUrl, setFormGpsUrl] = useState("https://www.google.com/maps/search/?api=1&query=T%C3%B2a+nh%C3%A0+V-Tower+Kim+M%C3%A3+H%C3%A0+N%E1%BB%99i");

  // Enhanced fields: Platforms dropdown, 4 creator roles (Quản trị, Admin, Tổng thư ký, Trưởng ban)
  const [formPlatform, setFormPlatform] = useState<MeetingPlatform>("ZOOM");
  const [formCreatorRole, setFormCreatorRole] = useState<MeetingCreatorRole>("TỔNG_THƯ_KÝ");
  const [formCreatorName, setFormCreatorName] = useState("Lê Hoàng Long (Tổng thư ký)");
  const [formCreatorPhone, setFormCreatorPhone] = useState("0983 000 001");
  const [formCreatorEmail, setFormCreatorEmail] = useState("ceo.tongthuky@ceo1983.com");
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formUrgentReason, setFormUrgentReason] = useState("");

  // Modals for Urgent Case & Delete
  const [contactHostModalOpen, setContactHostModalOpen] = useState(false);
  const [contactHostMeeting, setContactHostMeeting] = useState<Meeting | null>(null);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<Meeting | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null);

  // Offline invite template modal state
  const [offlineInviteModalOpen, setOfflineInviteModalOpen] = useState(false);
  const [offlineInviteMeeting, setOfflineInviteMeeting] = useState<Meeting | null>(null);

  const deptMembers = useMemo(() => {
    return DEPARTMENT_MEMBERS[formDepartment] || [];
  }, [formDepartment]);

  // --- TAB 2: Templates State ---
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

  // Dispatched Email Preview Modal
  const [emailPreviewModalOpen, setEmailPreviewModalOpen] = useState(false);
  const [previewEmailData, setPreviewEmailData] = useState<{ subject: string; htmlBody: string } | null>(null);

  const applyCreatorRolePreset = (r: MeetingCreatorRole, dept: string = formDepartment) => {
    setFormCreatorRole(r);
    if (r === "QUẢN_TRỊ") {
      setFormCreatorName("Ban Quản Trị Hệ Thống (Super Admin)");
      setFormCreatorPhone("0983 888 888");
      setFormCreatorEmail("superadmin@ceo1983.com");
      setFormStatus("upcoming");
    } else if (r === "ADMIN") {
      setFormCreatorName("Admin Ban Thư Ký CEO 1983");
      setFormCreatorPhone("0983 999 999");
      setFormCreatorEmail("admin@ceo1983.com");
      setFormStatus("upcoming");
    } else if (r === "TỔNG_THƯ_KÝ") {
      setFormCreatorName("Lê Hoàng Long (Tổng thư ký)");
      setFormCreatorPhone("0983 000 001");
      setFormCreatorEmail("ceo.tongthuky@ceo1983.com");
      setFormStatus("pending_approval");
    } else if (r === "TRƯỞNG_BAN") {
      const firstMem = (DEPARTMENT_MEMBERS[dept] || [])[0];
      setFormCreatorName(firstMem ? `${firstMem.name} (${firstMem.role})` : `Trưởng ban ${dept}`);
      setFormCreatorPhone(firstMem?.phone || "0983 000 002");
      setFormCreatorEmail(firstMem?.email || "ceo.truongban@ceo1983.com");
      setFormStatus("pending_approval");
    }
  };

  // --- Handlers for Meetings ---
  const handleOpenCreate = () => {
    if (!canCreateMeeting) {
      toast.error("Chỉ Quản trị, Admin, Tổng thư ký và Trưởng ban mới có quyền tạo cuộc họp.");
      return;
    }
    setSelectedMeeting(null);
    setFormTitle("Họp Ban: Triển khai kế hoạch hoạt động");
    setFormType("committee");
    setFormDepartment("Ban Xúc tiến thương mại");
    const initialEmails = (DEPARTMENT_MEMBERS["Ban Xúc tiến thương mại"] || []).map((m) => m.email);
    setSelectedMembers(initialEmails);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTime("14:30");
    setFormLocation("Trực tuyến qua Zoom Meeting");
    setFormZoomUrl("https://zoom.us/j/88819839999");
    setFormPlatform("ZOOM");

    // Gán role khởi tạo tương ứng
    if (isSuperAdmin) {
      setFormCreatorRole("QUẢN_TRỊ");
      setFormCreatorName("Ban Quản Trị Hệ Thống (Super Admin)");
      setFormCreatorPhone("0983 888 888");
      setFormCreatorEmail("superadmin@ceo1983.com");
      setFormStatus("upcoming");
    } else if (isAdmin) {
      setFormCreatorRole("ADMIN");
      setFormCreatorName("Admin Ban Thư Ký CEO 1983");
      setFormCreatorPhone("0983 999 999");
      setFormCreatorEmail("admin@ceo1983.com");
      setFormStatus("upcoming");
    } else if (role === "tong_thu_ky") {
      setFormCreatorRole("TỔNG_THƯ_KÝ");
      setFormCreatorName("Lê Hoàng Long (Tổng thư ký)");
      setFormCreatorPhone("0983 000 001");
      setFormCreatorEmail("ceo.tongthuky@ceo1983.com");
      setFormStatus("pending_approval");
    } else {
      setFormCreatorRole("TRƯỞNG_BAN");
      setFormCreatorName("Trưởng ban Xúc tiến thương mại");
      setFormCreatorPhone("0983 000 005");
      setFormCreatorEmail("ceo.xuctien@ceo1983.com");
      setFormStatus("pending_approval");
    }

    setFormIsUrgent(false);
    setFormUrgentReason("");
    setFormMeetingMode("online");
    setModalOpen(true);
  };

  // Duyệt cuộc họp (chỉ dành cho Quản trị/Admin)
  const handleApproveMeeting = async (m: Meeting) => {
    if (!canApproveMeeting) {
      toast.error("Chỉ Ban Quản Trị mới có thẩm quyền phê duyệt cuộc họp.");
      return;
    }
    setSubmitting(true);
    try {
      await updateFn({
        data: {
          id: m.id,
          title: m.title,
          type: m.type,
          date: m.date,
          time: m.time,
          location: m.location,
          attendees: m.attendees,
          status: "upcoming",
          department: m.department || "",
          targetMembers: m.targetMembers || [],
          zoomUrl: m.zoomUrl || "",
          platform: m.platform || "ZOOM",
          creatorRole: m.creatorRole || "TRƯỞNG_BAN",
          creatorName: m.creatorName || "",
          creatorPhone: m.creatorPhone || "",
          creatorEmail: m.creatorEmail || "",
          isUrgent: m.isUrgent ?? false,
          urgentReason: m.urgentReason || "",
        },
      });

      // Gửi thông báo phê duyệt
      try {
        await createNotif({
          data: {
            title: `[ĐÃ DUYỆT CUỘC HỌP] ${m.title}`,
            body: `Ban Quản Trị đã phê duyệt cuộc họp "${m.title}" do ${m.creatorName} (${m.creatorRole}) khởi tạo. Lịch họp chính thức: ${m.time} ngày ${m.date}. Địa điểm/Link: ${m.location || m.zoomUrl}`,
            category: "meeting",
            audience: "all",
            channel: "inapp",
            appScope: "all",
            targetApp: "all",
            status: "sent",
          },
        });
      } catch {}

      toast.success(`✓ Đã phê duyệt cuộc họp "${m.title}" thành công!`);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi phê duyệt cuộc họp");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectMeeting = (m: Meeting) => {
    if (!canApproveMeeting) {
      toast.error("Chỉ Ban Quản Trị mới có thẩm quyền từ chối cuộc họp.");
      return;
    }
    handleOpenCancel(m);
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
    setFormPlatform(m.platform || "ZOOM");
    setFormCreatorRole(m.creatorRole || "TỔNG_THƯ_KÝ");
    setFormCreatorName(m.creatorName || "Lê Hoàng Long (Tổng thư ký)");
    setFormCreatorPhone(m.creatorPhone || "0983 000 001");
    setFormCreatorEmail(m.creatorEmail || "ceo.tongthuky@ceo1983.com");
    setFormIsUrgent(m.isUrgent ?? false);
    setFormUrgentReason(m.urgentReason || "");
    setFormStatus(m.status);
    setFormMeetingMode(m.zoomUrl ? "online" : "offline");
    setModalOpen(true);
  };

  const handleOpenContactHost = (m: Meeting) => {
    setContactHostMeeting(m);
    setContactHostModalOpen(true);
  };

  const handleOpenReschedule = (m: Meeting) => {
    setRescheduleMeeting(m);
    setRescheduleDate(m.date);
    setRescheduleTime(m.time);
    setRescheduleReason("Sắp xếp lại lịch để ưu tiên cuộc họp đột xuất quan trọng");
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleMeeting || !rescheduleDate || !rescheduleTime) {
      toast.error("Vui lòng chọn ngày và giờ mới cho cuộc họp");
      return;
    }

    setSubmitting(true);
    try {
      await updateFn({
        data: {
          id: rescheduleMeeting.id,
          title: rescheduleMeeting.title,
          type: rescheduleMeeting.type,
          date: rescheduleDate,
          time: rescheduleTime,
          location: rescheduleMeeting.location,
          attendees: rescheduleMeeting.attendees,
          status: "upcoming",
          department: rescheduleMeeting.department || "",
          targetMembers: rescheduleMeeting.targetMembers || [],
          zoomUrl: rescheduleMeeting.zoomUrl || "",
          platform: rescheduleMeeting.platform || "ZOOM",
          creatorRole: rescheduleMeeting.creatorRole || "TỔNG_THƯ_KÝ",
          creatorName: rescheduleMeeting.creatorName || "",
          creatorPhone: rescheduleMeeting.creatorPhone || "",
          creatorEmail: rescheduleMeeting.creatorEmail || "",
          isUrgent: rescheduleMeeting.isUrgent ?? false,
          urgentReason: rescheduleReason.trim() || rescheduleMeeting.urgentReason || "Điều chỉnh lịch do cuộc họp quan trọng đột xuất",
        },
      });

      // Phát thông báo dời lịch
      try {
        await createNotif({
          data: {
            title: `[ĐIỀU CHỈNH LỊCH HỌP] ${rescheduleMeeting.title}`,
            body: `Cuộc họp "${rescheduleMeeting.title}" đã được dời sang thời gian mới: ${rescheduleTime} ngày ${rescheduleDate}.\nLý do: "${rescheduleReason.trim()}".\nKính đề nghị các thành viên cập nhật lại lịch công tác!`,
            category: "meeting",
            audience: "all",
            channel: "inapp",
            appScope: "all",
            targetApp: "all",
            status: "sent",
          },
        });
      } catch (err) {}

      toast.success(`✓ Đã sắp xếp lại lịch cuộc họp sang ${rescheduleTime} ngày ${rescheduleDate} và phát thông báo!`);
      setRescheduleModalOpen(false);
      setContactHostModalOpen(false);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi sắp xếp lại lịch họp");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (m: Meeting) => {
    setDeletingMeeting(m);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMeeting) return;
    setSubmitting(true);
    try {
      await deleteFn({ data: { id: deletingMeeting.id } });
      toast.success(`✓ Đã xóa hoàn toàn cuộc họp "${deletingMeeting.title}" khỏi hệ thống!`);
      setDeleteModalOpen(false);
      setDeletingMeeting(null);
      await router.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xóa cuộc họp");
    } finally {
      setSubmitting(false);
    }
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
        platform: formPlatform,
        creatorRole: formCreatorRole,
        creatorName: formCreatorName.trim(),
        creatorPhone: formCreatorPhone.trim(),
        creatorEmail: formCreatorEmail.trim(),
        isUrgent: formIsUrgent,
        urgentReason: formUrgentReason.trim(),
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
              title: payload.isUrgent
                ? `[🔥 CUỘC HỌP KHẨN CẤP ĐỘT XUẤT] ${payload.title}`
                : `[Lịch họp mới] ${payload.title}`,
              body: `Cuộc họp ${payload.department} do ${payload.creatorName} (${payload.creatorRole}) chủ trì diễn ra vào ${payload.time} ngày ${payload.date} (${formMeetingMode === "online" ? `Trực tuyến ${payload.platform}: ` + payload.zoomUrl : "Trực tiếp: " + payload.location}). ${payload.isUrgent ? "Đề nghị các đồng chí có mặt đầy đủ để xử lý việc khẩn cấp." : "Kính mời các đại biểu tham gia đúng giờ."}`,
              category: "meeting",
              audience: "all",
              channel: "inapp",
              appScope: "all",
              targetApp: "all",
              status: "sent",
              actionUrl: formMeetingMode === "online" ? payload.zoomUrl : "/association/meetings",
            },
          });
        } catch (notifErr) {
          console.warn("Could not dispatch in-app notification for new meeting:", notifErr);
        }
        toast.success(
          `Đã tạo cuộc họp và gửi thông báo tới ${selectedMembers.length} thành viên ${formDepartment}!`
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

  const onDelete = (m: Meeting) => {
    handleOpenDelete(m);
  };

  return (
    <AppShell>
      {/* Header */}
      <PageHeader
        title="Quản Lý Cuộc Họp & Lịch Công Tác"
        subtitle="Khởi tạo cuộc họp, quản trị phê duyệt, chọn phòng họp Zoom/Google Meet/UniWork và phát thông báo đồng bộ"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canCreateMeeting && (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-[#003B95] hover:bg-blue-900 transition shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tạo Cuộc Họp
              </button>
            )}
          </div>
        }
      />

      {/* Modern 2-Tab Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("meetings")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === "meetings"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Lịch Họp & Giao Ban ({MEETINGS.length})</span>
          {MEETINGS.filter((m) => m.status === "pending_approval").length > 0 && (
            <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400 font-extrabold">
              {MEETINGS.filter((m) => m.status === "pending_approval").length} Chờ Duyệt
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            activeTab === "templates"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Mẫu Thông Báo & Email Chuẩn Hoá ({NOTIFICATION_TEMPLATES.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: LỊCH HỌP BAN & SỰ KIỆN (EXISTING MEETINGS GRID)                 */}
      {/* ==================================================================== */}
      {activeTab === "meetings" && (
        <>
          {/* KPI Cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard
              label={t("meet.kpi.total")}
              value={MEETINGS.length}
              icon={<Users2 className="h-4 w-4" />}
            />
            <StatCard
              label="Chờ Quản Trị Duyệt"
              value={MEETINGS.filter((m) => m.status === "pending_approval").length}
              tone={MEETINGS.filter((m) => m.status === "pending_approval").length > 0 ? "warning" : "info"}
              icon={<Clock className="h-4 w-4 text-amber-600" />}
            />
            <StatCard
              label={t("meet.kpi.upcoming")}
              value={MEETINGS.filter((m) => m.status === "upcoming").length}
              tone="info"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              label="Đã Hoàn Tất / Đã Hủy"
              value={MEETINGS.filter((m) => m.status === "completed" || m.status === "cancelled").length}
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
          </div>

          {/* Meetings Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MEETINGS.map((m) => (
              <Card key={m.id} className="p-5 transition hover:shadow-[var(--shadow-glow)] relative">
                {/* Urgent Meeting Banner if marked */}
                {m.isUrgent && (
                  <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-400">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse" />
                      <span>🔥 CUỘC HỌP ĐỘT XUẤT KHẨN CẤP</span>
                    </div>
                    {m.urgentReason && (
                      <span className="text-[11px] font-medium text-rose-600/90 italic truncate max-w-xs">
                        {m.urgentReason}
                      </span>
                    )}
                  </div>
                )}

                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill color={STATUS_COLOR[m.status]}>
                      {m.status === "pending_approval" ? "Chờ Quản Trị Duyệt" : t(STATUS_KEY[m.status])}
                    </Pill>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t(TYPE_KEY[m.type])}
                    </span>
                    {m.zoomUrl && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                          m.platform === "GOOGLE_MEET"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : m.platform === "UNIWORK"
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}
                      >
                        {m.platform || "ZOOM"}
                      </span>
                    )}
                  </div>
                  {m.department && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      {m.department}
                    </span>
                  )}
                </div>

                <h3 className="mb-1 text-base font-bold text-foreground">{m.title}</h3>

                {/* Creator Information Badge */}
                <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Người chủ trì / tạo:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {m.creatorName || "Lê Hoàng Long"}
                  </span>
                  <span className="rounded bg-secondary/80 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    ({m.creatorRole || "Tổng thư ký"})
                  </span>
                </div>

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
                  {/* Quản trị viên duyệt hoặc từ chối cuộc họp chờ duyệt */}
                  {m.status === "pending_approval" && canApproveMeeting && (
                    <>
                      <button
                        onClick={() => handleApproveMeeting(m)}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                        title="Phê duyệt kích hoạt cuộc họp này"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        <span>Duyệt Cuộc Họp</span>
                      </button>
                      <button
                        onClick={() => handleRejectMeeting(m)}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Từ chối cuộc họp này"
                      >
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                        <span>Từ Chối</span>
                      </button>
                    </>
                  )}

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
                      <span>Vào Họp ({m.platform || "Online"})</span>
                    </button>
                  )}

                  {/* Nút liên hệ người tạo khi có họp đột ngột quan trọng */}
                  <button
                    onClick={() => handleOpenContactHost(m)}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                    title="Liên hệ người tạo cuộc họp để trao đổi hoặc sắp xếp lại lịch khi có việc đột xuất"
                  >
                    <Phone className="h-3.5 w-3.5 text-amber-600" />
                    <span>Liên Hệ Điều Phối</span>
                  </button>

                  {/* Nút sắp xếp lại lịch */}
                  <button
                    onClick={() => handleOpenReschedule(m)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
                    title="Sắp xếp lại ngày, giờ hoặc hình thức cuộc họp"
                  >
                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                    <span>Đổi Lịch</span>
                  </button>

                  <button
                    onClick={() => handleOpenOfflineInvite(m)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
                    title="Gửi giấy mời họp kèm bản đồ GPS Google Maps cho người tham gia"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Mời Offline</span>
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
                    Sửa
                  </button>
                  <button
                    onClick={() => handleOpenDelete(m)}
                    className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/40 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer transition shadow-2xs"
                    title="Xóa cuộc họp này hoàn toàn"
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

              {/* Thẩm quyền người tạo cuộc họp (Chỉ 4 Cấp Bậc Được Phép Tạo Cuộc Họp) */}
              <div className="rounded-xl border border-border bg-secondary/20 p-3.5 space-y-2.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                    Thẩm Quyền Người Tạo Cuộc Họp (Chỉ 4 role được phép tạo) *
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">Quản trị • Admin • Tổng thư ký • Trưởng ban</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { role: "QUẢN_TRỊ", label: "Quản trị", color: "border-blue-600 bg-blue-600/10 text-blue-900 dark:text-blue-300" },
                    { role: "ADMIN", label: "Admin", color: "border-purple-500 bg-purple-500/10 text-purple-900 dark:text-purple-300" },
                    { role: "TỔNG_THƯ_KÝ", label: "Tổng thư ký", color: "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300" },
                    { role: "TRƯỞNG_BAN", label: "Trưởng ban", color: "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300" },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => applyCreatorRolePreset(item.role as MeetingCreatorRole)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition border cursor-pointer ${
                        formCreatorRole === item.role
                          ? `${item.color} shadow-xs ring-2 ring-primary/40 font-extrabold`
                          : "border-border bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Ghi chú luồng duyệt */}
                <div className="rounded-lg bg-background/80 border border-border/80 px-3 py-1.5 text-[11px] flex items-center justify-between">
                  <span className="text-muted-foreground">Người duyệt cuộc họp: <strong className="text-foreground">Quản trị (Super Admin / Admin)</strong></span>
                  {formCreatorRole === "QUẢN_TRỊ" || formCreatorRole === "ADMIN" ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      ✓ Tự động duyệt ngay
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      ⏳ Sẽ gửi Ban Quản Trị phê duyệt
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Người tạo cuộc họp *</label>
                    <input
                      type="text"
                      required
                      value={formCreatorName}
                      onChange={(e) => setFormCreatorName(e.target.value)}
                      placeholder="Lê Hoàng Long"
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={formCreatorPhone}
                      onChange={(e) => setFormCreatorPhone(e.target.value)}
                      placeholder="0983 000 001"
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email liên hệ điều phối</label>
                    <input
                      type="email"
                      value={formCreatorEmail}
                      onChange={(e) => setFormCreatorEmail(e.target.value)}
                      placeholder="ceo.tongthuky@ceo1983.com"
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Cờ Cuộc Họp Đột Xuất / Khẩn Cấp */}
              <div className={`rounded-xl border p-3 transition ${
                formIsUrgent ? "border-red-400 bg-red-500/10" : "border-border bg-secondary/20"
              }`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsUrgent}
                    onChange={(e) => setFormIsUrgent(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-red-600 focus:ring-red-500"
                  />
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <AlertTriangle className={`h-4 w-4 ${formIsUrgent ? "text-red-600 animate-pulse" : "text-muted-foreground"}`} />
                    Cuộc họp đột xuất quan trọng / Khẩn cấp (Cần ưu tiên & điều phối sắp xếp lại lịch)
                  </span>
                </label>
                {formIsUrgent && (
                  <div className="mt-2.5 space-y-1 animate-in fade-in">
                    <label className="text-[11px] font-semibold text-red-600 block">
                      Lý do triệu tập đột xuất & yêu cầu điều phối:
                    </label>
                    <input
                      type="text"
                      value={formUrgentReason}
                      onChange={(e) => setFormUrgentReason(e.target.value)}
                      placeholder="Ví dụ: Họp giải quyết xung đột lịch / Biểu quyết nhân sự khẩn cấp..."
                      className="w-full rounded-lg border border-red-300 dark:border-red-800 bg-background p-2 text-xs text-foreground"
                    />
                  </div>
                )}
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

              {/* Đăng Ký Phòng Họp & Nền Tảng Cuộc Họp (Dropdown gộp chung) */}
              <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3.5 shadow-xs">
                <div>
                  <label className="font-bold text-foreground block mb-1.5 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-[#003B95] dark:text-blue-400" />
                      Đăng Ký Phòng Họp & Nền Tảng Cuộc Họp *
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Gộp đặt phòng & nền tảng trực tuyến</span>
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => {
                      const val = e.target.value as MeetingPlatform;
                      setFormPlatform(val);
                      if (val === "ZOOM") {
                        setFormMeetingMode("online");
                        setFormLocation("Trực tuyến qua Zoom Meeting");
                        setFormZoomUrl("https://zoom.us/j/88819839999");
                      } else if (val === "GOOGLE_MEET") {
                        setFormMeetingMode("online");
                        setFormLocation("Trực tuyến qua Google Meet");
                        setFormZoomUrl("https://meet.google.com/ceo-1983-vip");
                      } else if (val === "UNIWORK") {
                        setFormMeetingMode("online");
                        setFormLocation("Phòng họp số UniWork Online");
                        setFormZoomUrl("https://uni-hrm.ubos.vn/meet/ceo1983");
                      } else if (val === "OFFLINE_UNIWORK") {
                        setFormMeetingMode("offline");
                        setFormLocation("Phòng Họp Sapphire - Tầng 2 UniWork Hub, Hà Nội (TV 85 inch, Polycom 4K AI Tracking)");
                        setFormZoomUrl("");
                        setFormGpsUrl("https://www.google.com/maps/search/?api=1&query=T%C3%B2a+nh%C3%A0+V-Tower+Kim+M%C3%A3+H%C3%A0+N%E1%BB%99i");
                      } else if (val === "OFFLINE_CUSTOM") {
                        setFormMeetingMode("offline");
                        setFormLocation("Văn phòng Hiệp hội CEO 1983, Hà Nội");
                        setFormZoomUrl("");
                        setFormGpsUrl("https://www.google.com/maps/search/?api=1&query=V%C4%83n+ph%C3%B2ng+Hi%E1%BB%87p+h%E1%BB%99i+CEO+1983");
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
                  >
                    <option value="ZOOM">📹 Zoom Meeting (Trực tuyến - Bảo mật cao)</option>
                    <option value="GOOGLE_MEET">📹 Google Meet (Trực tuyến - Họp nhanh qua trình duyệt)</option>
                    <option value="UNIWORK">🏢 UniWork Meet (Hệ sinh thái UniWork - Tích hợp CRM)</option>
                    <option value="OFFLINE_UNIWORK">🏛️ Đăng ký Phòng Họp Sapphire - Trụ sở UniWork Hub (25 chỗ, TV 85&quot; Polycom 4K)</option>
                    <option value="OFFLINE_CUSTOM">📍 Địa điểm Offline khác (Nhập địa chỉ & định vị Google Maps)</option>
                  </select>
                </div>

                {/* Chi tiết theo nền tảng / phòng họp đã chọn */}
                {(formPlatform === "ZOOM" || formPlatform === "GOOGLE_MEET" || formPlatform === "UNIWORK") ? (
                  <div className="space-y-2.5 pt-1 border-t border-border/60">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground flex items-center justify-between mb-1">
                        <span>Đường dẫn phòng họp {formPlatform === "ZOOM" ? "Zoom" : formPlatform === "GOOGLE_MEET" ? "Google Meet" : "UniWork"} *</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Tự động phát link tới đại biểu</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={formZoomUrl}
                        onChange={(e) => setFormZoomUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono text-blue-600 focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Mã cuộc họp / Passcode / Mô tả bổ sung
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder={
                          formPlatform === "ZOOM"
                            ? "Zoom ID: 888 1983 9999 • Mật khẩu: 1983"
                            : formPlatform === "GOOGLE_MEET"
                            ? "Google Meet ID: ceo-1983-vip"
                            : "UniWork ID: UNI-1983 • PIN: 8888"
                        }
                        className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                ) : formPlatform === "OFFLINE_UNIWORK" ? (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2 text-xs border-t border-border/60">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Phòng Họp Sapphire - Trụ Sở UniWork Hub (Sẵn sàng)
                      </span>
                      <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase">
                        25 Chỗ Ngồi
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground/80">
                      Địa chỉ: <strong>Tầng 2, Tòa nhà V-Tower, Số 649 Kim Mã, Ba Đình, Hà Nội</strong>
                    </p>
                    <div className="pt-1 border-t border-emerald-500/20 text-[11px] text-muted-foreground">
                      Trang thiết bị chuẩn bị sẵn: <strong>TV tương tác 85 inch, Hệ thống Polycom 4K AI Tracking, Micro đa hướng, Wifi 6 tốc độ cao.</strong>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1 border-t border-border/60">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Địa chỉ cụ thể phòng họp Offline *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => {
                          setFormLocation(e.target.value);
                          setFormGpsUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.target.value)}`);
                        }}
                        placeholder="Ví dụ: Tòa nhà CEO Tower, Phạm Hùng, Cầu Giấy, Hà Nội"
                        className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between mb-1">
                        <span>Định vị Google Maps dẫn đường</span>
                        <a
                          href={formGpsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Mở thử vị trí ↗
                        </a>
                      </label>
                      <input
                        type="url"
                        value={formGpsUrl}
                        onChange={(e) => setFormGpsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono text-blue-600 focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

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
      {/* Modal 7: Liên Hệ Người Tạo Cuộc Họp (Điều phối khi có họp đột xuất quan trọng) */}
      {contactHostModalOpen && contactHostMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#003B95] dark:text-blue-400" />
                Liên Hệ Người Triệu Tập Cuộc Họp
              </h3>
              <button
                onClick={() => setContactHostModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-slate-900 p-3.5 space-y-1">
                <p className="text-[11px] text-muted-foreground">Cuộc họp đang xét:</p>
                <p className="font-bold text-sm text-foreground">{contactHostMeeting.title}</p>
                <p className="text-slate-600 dark:text-slate-300">
                  {contactHostMeeting.time} • Ngày {contactHostMeeting.date} • {contactHostMeeting.department}
                </p>
              </div>

              {contactHostMeeting.isUrgent && (
                <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-500/10 p-3 text-red-700 dark:text-red-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                    CUỘC HỌP ĐỘT XUẤT QUAN TRỌNG
                  </div>
                  {contactHostMeeting.urgentReason && (
                    <p className="text-[11px] text-red-800 dark:text-red-200">
                      <strong>Lý do:</strong> {contactHostMeeting.urgentReason}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-border bg-secondary/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Thông tin Người Triệu Tập / Phụ trách:</span>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                    {contactHostMeeting.creatorRole || "TỔNG_THƯ_KÝ"}
                  </span>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <p>
                    <strong>Họ tên:</strong> {contactHostMeeting.creatorName || "Ban Thường Trực CEO 1983"}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Số điện thoại:</strong>
                    <a
                      href={`tel:${contactHostMeeting.creatorPhone || "0983000001"}`}
                      className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {contactHostMeeting.creatorPhone || "0983 000 001"}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Email:</strong>
                    <a
                      href={`mailto:${contactHostMeeting.creatorEmail || "ceo.tongthuky@ceo1983.com"}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {contactHostMeeting.creatorEmail || "ceo.tongthuky@ceo1983.com"}
                    </a>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                💡 <strong>Quy trình xử lý lịch họp đột xuất:</strong> Khi có cuộc họp đột ngột quan trọng, các bên chủ động liên hệ trực tiếp với người đã tạo cuộc họp này qua điện thoại/email để trao đổi giải pháp ưu tiên. Người tạo cuộc họp có thể vào bấm nút <strong>"Sắp Xếp Lại Lịch"</strong> bên dưới để đổi ngày/giờ mà không làm gián đoạn kế hoạch chung.
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setContactHostModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Đóng
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contactHostMeeting.creatorPhone || "0983000001"}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Gọi Điện Ngay
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setContactHostModalOpen(false);
                      handleOpenReschedule(contactHostMeeting);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition cursor-pointer"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Sắp Xếp Lại Lịch Họp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 8: Sắp Xếp Lại Lịch Họp (Reschedule do họp đột xuất hoặc xung đột) */}
      {rescheduleModalOpen && rescheduleMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-amber-500" />
                Sắp Xếp Lại Lịch Cuộc Họp (Reschedule)
              </h3>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
                <p className="text-[11px] text-muted-foreground">Cuộc họp:</p>
                <p className="font-bold text-foreground">{rescheduleMeeting.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  Lịch hiện tại: <strong>{rescheduleMeeting.time}</strong> ngày <strong>{rescheduleMeeting.date}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Ngày họp mới *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Giờ họp mới *</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Lý do điều chỉnh lịch (sẽ phát thông báo đến tất cả thành viên) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Ví dụ: Ưu tiên cuộc họp đột xuất của Ban Thường trực / Thay đổi theo thỏa thuận với chủ tọa..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition cursor-pointer"
                >
                  {submitting ? "Đang cập nhật..." : "Lưu & Phát Thông Báo Đổi Lịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 9: Xác Nhận Xóa Cuộc Họp Vĩnh Viễn */}
      {deleteModalOpen && deletingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-card p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Xác Nhận Xóa Cuộc Họp Vĩnh Viễn
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 p-3.5 space-y-1 text-red-900 dark:text-red-200">
                <p className="font-bold text-sm">{deletingMeeting.title}</p>
                <p className="text-[11px]">
                  Thời gian: {deletingMeeting.time} • Ngày {deletingMeeting.date}
                </p>
                <p className="text-[11px]">
                  Phòng ban: {deletingMeeting.department} ({deletingMeeting.attendees} người tham gia)
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                ⚠️ <strong>Cảnh báo:</strong> Thao tác này sẽ xóa hoàn toàn cuộc họp khỏi hệ thống CEO 1983. Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  {submitting ? "Đang xóa..." : "Xác Nhận Xóa Vĩnh Viễn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
