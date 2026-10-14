import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Package,
  Paperclip,
  Pin,
  PinOff,
  Plus,
  Search,
  Send,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader, StatCard, Card, Pill } from "@/components/dashboard/PageKit";
import { useFmt, useT } from "@/lib/i18n";
import { MEMBERS, hydrateMembers, type Member } from "@/lib/members-data";
import { type Product } from "@/lib/marketplace-data";
import { listProductsFn } from "@/lib/marketplace.functions";
import { listPeersFn } from "@/lib/members.functions";
import {
  CURRENT_USER_ID,
  acceptRequest,
  cancelRequest,
  declineRequest,
  deleteMessage,
  disconnect,
  getStatus,
  getStatusTime,
  getThread,
  hydrateNetwork,
  refreshFromDb,
  lastMessageWith,
  markThreadRead,
  unreadCountWith,
  listConnections,
  listIncoming,
  listOutgoing,
  listSuggestions,
  listChatPeers,
  sendMessage,
  sendRequest,
  subscribe,
  togglePinMessage,
  type ChatAttachment,
  type ChatMessage,
  type ConnectionStatus,
} from "@/lib/networking-data";
import { getNetworkStateFn } from "@/lib/networking.functions";

export const CRM_COMMITTEES = [
  "Tất cả các ban",
  "Ban Điều Hành",
  "Ban Thành Viên",
  "Ban Truyền Thông",
  "Ban Xúc Tiến",
  "Ban Tài Chính",
  "Ban Thiện Nguyện",
  "Ban Thư Ký",
] as const;

export type CrmCommittee = (typeof CRM_COMMITTEES)[number];

export function getMemberCommittee(m: Member): string {
  const d = m?.department || (m as any)?.boardWish || (m as any)?.board || "";
  const s = String(d).toLowerCase().trim();
  if (s.includes("quản trị") || s.includes("điều hành") || s.includes("công nghệ")) return "Ban Điều Hành";
  if (s.includes("thư ký") || s.includes("điều phối") || s.includes("chánh văn phòng")) return "Ban Thư Ký";
  if (s.includes("truyền thông") || s.includes("sự kiện") || s.includes("btt")) return "Ban Truyền Thông";
  if (s.includes("xúc tiến") || s.includes("thương mại") || s.includes("b2b") || s.includes("bxt")) return "Ban Xúc Tiến";
  if (s.includes("tài chính") || s.includes("kế toán") || s.includes("ngân quỹ") || s.includes("btc")) return "Ban Tài Chính";
  if (s.includes("thiện nguyện") || s.includes("an sinh") || s.includes("btn") || s.includes("xã hội")) return "Ban Thiện Nguyện";
  if (s.includes("thành viên") && !s.includes("hội viên") && !s.includes("ceo")) return "Ban Thành Viên";
  if (d && d !== "—" && d !== "undefined" && d !== "null" && d.length > 2 && !s.includes("hội viên ceo")) return String(d);

  // Check executiveRole
  const ex = String(m?.executiveRole || (m as any)?.role || "").toLowerCase();
  if (ex.includes("dieu_hanh") || ex.includes("quản trị") || ex.includes("president") || ex.includes("admin")) return "Ban Điều Hành";
  if (ex.includes("thu_ky") || ex.includes("chánh văn phòng")) return "Ban Thư Ký";
  if (ex.includes("truyen_thong")) return "Ban Truyền Thông";
  if (ex.includes("xuc_tien") || ex.includes("b2b")) return "Ban Xúc Tiến";
  if (ex.includes("tai_chinh") || ex.includes("ke_toan")) return "Ban Tài Chính";
  if (ex.includes("thien_nguyen")) return "Ban Thiện Nguyện";
  if (ex.includes("thanh_vien") && !ex.includes("hoivien")) return "Ban Thành Viên";

  // Check industry mapping fallback
  const ind = String(m?.industry || "").toLowerCase();
  if (ind.includes("công nghệ") || ind.includes("it") || ind.includes("phần mềm") || ind.includes("viễn thông") || ind === "ind.it") return "Ban Điều Hành";
  if (ind.includes("tài chính") || ind.includes("kế toán") || ind.includes("ngân hàng") || ind.includes("đầu tư") || ind.includes("bảo hiểm") || ind === "ind.finance") return "Ban Tài Chính";
  if (ind.includes("thương mại") || ind.includes("xuất nhập khẩu") || ind.includes("bán lẻ") || ind.includes("phân phối") || ind.includes("xây dựng") || ind.includes("bất động sản") || ind.includes("nội thất") || ind.includes("sản xuất") || ind === "ind.trade" || ind === "ind.manufacturing" || ind === "ind.realestate") return "Ban Xúc Tiến";
  if (ind.includes("truyền thông") || ind.includes("quảng cáo") || ind.includes("marketing") || ind.includes("sự kiện") || ind.includes("du lịch")) return "Ban Truyền Thông";
  if (ind.includes("luật") || ind.includes("pháp chế") || ind.includes("hành chính") || ind.includes("nhân sự") || ind.includes("tư vấn, đào tạo")) return "Ban Thư Ký";
  if (ind.includes("y tế") || ind.includes("sức khỏe") || ind.includes("môi trường") || ind.includes("giáo dục")) return "Ban Thiện Nguyện";

  // Deterministic committee distribution based on ID/code to ensure balanced grouping
  const hashStr = String(m?.id || m?.code || m?.name || "");
  let codeSum = 0;
  for (let i = 0; i < hashStr.length; i++) {
    codeSum = (codeSum * 31 + hashStr.charCodeAt(i)) & 0xffffffff;
  }
  const buckets = [
    "Ban Điều Hành",
    "Ban Thành Viên",
    "Ban Truyền Thông",
    "Ban Xúc Tiến",
    "Ban Tài Chính",
    "Ban Thiện Nguyện",
    "Ban Thư Ký",
  ];
  return buckets[Math.abs(codeSum) % buckets.length];
}

type NetworkSearch = { peer?: string; product?: string };

export const Route = createFileRoute("/network")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): NetworkSearch => {
    const out: NetworkSearch = {};
    if (typeof search.peer === "string") out.peer = search.peer;
    if (typeof search.product === "string") out.product = search.product;
    return out;
  },
  loader: async () => {
    try {
      const [productsRes, networkRes, membersRes] = await Promise.allSettled([
        listProductsFn().catch(() => []),
        getNetworkStateFn().catch(() => ({ currentMemberId: null, statuses: {}, timestamps: {}, messages: [] })),
        listPeersFn().catch(() => []),
      ]);
      const products = productsRes.status === "fulfilled" && Array.isArray(productsRes.value) ? productsRes.value : [];
      const network = networkRes.status === "fulfilled" && networkRes.value ? networkRes.value : { currentMemberId: null, statuses: {}, timestamps: {}, messages: [] };
      const members = membersRes.status === "fulfilled" && Array.isArray(membersRes.value) ? membersRes.value : [];
      hydrateMembers(members ?? []);
      return { products, network };
    } catch (e) {
      console.warn("Error in network loader:", e);
      return {
        products: [],
        network: { currentMemberId: null, statuses: {}, timestamps: {}, messages: [] },
      };
    }
  },
  component: NetworkPage,
});

type Tab = "discover" | "messages";

function useNetworkTick() {
  const [, setN] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => setN((x) => x + 1));
    return () => {
      unsub();
    };
  }, []);
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Avatar({ member, size = 40 }: { member: Member; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-primary-foreground"
      style={{
        width: size,
        height: size,
        background: "var(--gradient-primary)",
        fontSize: size * 0.36,
      }}
    >
      {initials(member.name)}
    </div>
  );
}

function MemberMeta({ member }: { member: Member }) {
  const t = useT();
  const committee = getMemberCommittee(member);
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
        <Shield className="h-3 w-3" />
        {committee}
      </span>
      <span className="opacity-50">•</span>
      <span className="inline-flex items-center gap-1">
        {member.type === "company" ? (
          <Building2 className="h-3 w-3" />
        ) : (
          <User className="h-3 w-3" />
        )}
        {t(member.industry)}
      </span>
      <span className="opacity-50">•</span>
      <span>{t(member.region)}</span>
    </div>
  );
}

// Shows when a connection invite was sent/received/accepted, read from DB.
function StatusTime({ member }: { member: Member }) {
  const t = useT();
  const fmt = useFmt();
  const iso = getStatusTime(member.id);
  if (!iso) return null;
  const status = getStatus(member.id);
  const when = `${fmt.date(iso)} · ${fmt.rel(iso)}`;
  const key =
    status === "connected"
      ? "net.ts.connected"
      : status === "pending_incoming"
        ? "net.ts.received"
        : "net.ts.sent";
  return (
    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{t(key, { d: when })}</span>
    </div>
  );
}

function StatusChip({ member }: { member: Member }) {
  const t = useT();
  const status = getStatus(member.id);
  if (status === "none") return null;
  const color =
    status === "connected" ? "success" : status === "pending_incoming" ? "warning" : "info";
  const Icon = status === "connected" ? UserCheck : Clock;
  return (
    <Pill color={color as never}>
      <Icon className="mr-1 inline h-3 w-3" />
      {t(`net.chip.${status}` as never)}
    </Pill>
  );
}

export function getCleanMemberSubtitle(member: Member): string {
  const name = (member?.name || "").trim().toLowerCase();
  const rawContact = (member?.contact || "").trim();
  const company = ((member as any)?.company || (member as any)?.companyName || "").trim();
  const industry = (member?.industry || "").trim();

  // If rawContact has value and is not duplicating name
  if (rawContact && rawContact.toLowerCase() !== name && !rawContact.toLowerCase().startsWith(name + " -")) {
    return rawContact;
  }
  if (company && company.toLowerCase() !== name) {
    return company;
  }
  if (industry) {
    return industry.startsWith("ind.") ? industry.replace("ind.", "") : industry;
  }
  return "Hội viên Doanh nhân";
}

function MemberCard({
  member,
  rightSlot,
  bottomLabel,
}: {
  member: Member;
  rightSlot?: React.ReactNode;
  bottomLabel?: React.ReactNode;
}) {
  const t = useT();
  const committee = getMemberCommittee(member);

  return (
    <Card className="p-4 border border-border shadow-xs hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <Avatar member={member} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-sm font-bold text-foreground">{member.name}</span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{member.code}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#003B95]/10 text-[#003B95] dark:text-blue-300 font-extrabold px-2 py-0.5 text-[11px] border border-[#003B95]/20">
              <Shield className="h-3 w-3" />
              {committee}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {getCleanMemberSubtitle(member)}
            </span>
          </div>
          {bottomLabel && <div className="mt-2">{bottomLabel}</div>}
        </div>
      </div>
      {rightSlot && <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/50">{rightSlot}</div>}
    </Card>
  );
}

function PrimaryBtn({
  onClick,
  icon: Icon,
  children,
  disabled,
  loading,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:cursor-not-allowed disabled:opacity-60"
      style={{ background: "var(--gradient-primary)" }}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {children}
    </button>
  );
}

function GhostBtn({
  onClick,
  icon: Icon,
  children,
  tone = "neutral",
  disabled,
  loading,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: "neutral" | "danger";
  disabled?: boolean;
  loading?: boolean;
}) {
  const cls =
    tone === "danger"
      ? "border-destructive/30 text-destructive hover:bg-destructive/10"
      : "border-border text-foreground hover:bg-secondary";
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${cls} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {children}
    </button>
  );
}

function CancelRequestDialog({ member, trigger }: { member: Member; trigger: React.ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const name = member.name;
  const handleConfirm = () => {
    setBusy(true);
    void cancelRequest(member.id)
      .then(() => {
        toast.success(t("net.toast.cancelled", { name }));
        setOpen(false);
      })
      .catch((err) => {
        const detail = err instanceof Error ? err.message : String(err);
        toast.error(t("net.toast.cancelFailed"), { description: detail });
      })
      .finally(() => setBusy(false));
  };
  return (
    <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <AlertDialogTrigger asChild disabled={busy}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("net.confirm.cancel.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("net.confirm.cancel.desc", { name })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{t("net.confirm.cancel.keep")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("net.action.canceling")}
              </>
            ) : (
              t("net.confirm.cancel.confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConnectActions({
  member,
  onMessage,
}: {
  member: Member;
  onMessage: (id: string) => void;
}) {
  const t = useT();
  const [isSending, setIsSending] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const status = getStatus(member.id);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendRequest(member.id);
    } catch {
      toast.error(t("net.toast.actionFailed"));
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptRequest(member.id);
      toast.success(t("net.toast.accepted", { name: member.name }));
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      toast.error(t("net.toast.acceptFailed"), { description: detail });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await declineRequest(member.id);
      toast.success(t("net.toast.declined", { name: member.name }));
    } catch {
      toast.error(t("net.toast.actionFailed"));
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-1.5">
      {/* Primary: Instant 1-on-1 Work Chat across Committees */}
      <PrimaryBtn icon={MessageSquare} onClick={() => onMessage(member.id)}>
        Nhắn tin trao đổi
      </PrimaryBtn>

      {/* Secondary: Connection status and actions */}
      {status === "connected" ? (
        <GhostBtn icon={UserX} tone="danger" onClick={() => disconnect(member.id)}>
          {t("net.action.disconnect")}
        </GhostBtn>
      ) : status === "pending_outgoing" ? (
        <CancelRequestDialog
          member={member}
          trigger={
            <GhostBtn icon={X} onClick={() => {}}>
              {t("net.action.cancel")}
            </GhostBtn>
          }
        />
      ) : status === "pending_incoming" ? (
        <>
          <GhostBtn
            icon={Check}
            onClick={handleAccept}
            loading={isAccepting}
            disabled={isAccepting}
          >
            {isAccepting ? t("net.action.accepting") : t("net.action.accept")}
          </GhostBtn>
          <GhostBtn icon={X} tone="danger" onClick={handleDecline} disabled={isAccepting}>
            {t("net.action.decline")}
          </GhostBtn>
        </>
      ) : (
        <GhostBtn icon={UserPlus} onClick={handleSend} loading={isSending} disabled={isSending}>
          {t("net.action.connect")}
        </GhostBtn>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ type }: { type: string }) {
  if (type === "image") return <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />;
  if (type === "pdf") return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
  if (type === "doc") return <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />;
  return <File className="h-4 w-4 text-slate-500 shrink-0" />;
}

function ChatPanel({
  peerId,
  product,
  initialDraft,
  onClose,
  onClearProduct,
}: {
  peerId: string | null;
  product?: Product;
  initialDraft?: string;
  onClose: () => void;
  onClearProduct?: () => void;
}) {
  const t = useT();
  const fmt = useFmt();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const lastDraftRef = useRef<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Apply prefilled draft when peer/product context arrives
  useEffect(() => {
    if (initialDraft && initialDraft !== lastDraftRef.current) {
      lastDraftRef.current = initialDraft;
      setText(initialDraft);
    }
  }, [initialDraft]);

  const peer = peerId ? MEMBERS.find((m) => m.id === peerId) : undefined;
  const thread = peerId ? getThread(peerId) : [];
  const pinnedMessages = thread.filter((m) => m.pinned);

  // Mark incoming messages as read whenever the open thread changes.
  useEffect(() => {
    if (peerId) markThreadRead(peerId);
  }, [peerId, thread.length]);

  // Last message I sent that the peer has already read (for the receipt).
  const lastReadMineId = [...thread]
    .reverse()
    .find((m) => m.fromId === CURRENT_USER_ID && m.readAt)?.id;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        let type: "image" | "pdf" | "doc" | "other" = "other";
        const nameLower = file.name.toLowerCase();
        if (file.type.startsWith("image/")) type = "image";
        else if (file.type === "application/pdf" || nameLower.endsWith(".pdf")) type = "pdf";
        else if (
          nameLower.endsWith(".doc") ||
          nameLower.endsWith(".docx") ||
          nameLower.endsWith(".xls") ||
          nameLower.endsWith(".xlsx") ||
          nameLower.endsWith(".ppt") ||
          nameLower.endsWith(".pptx")
        ) {
          type = "doc";
        }

        const newAtt: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: file.size,
          type,
          url,
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (idOrName: string) => {
    setAttachments((prev) => prev.filter((a) => (a.id || a.name) !== idOrName));
  };

  if (!peer) {
    return (
      <Card className="flex h-[560px] items-center justify-center p-6 text-sm text-muted-foreground">
        {t("net.empty.thread")}
      </Card>
    );
  }

  const submit = () => {
    if (!text.trim() && attachments.length === 0) return;
    sendMessage(peer.id, text, attachments.length > 0 ? attachments : undefined);
    setText("");
    setAttachments([]);
    toast.success("Đã gửi tin nhắn trao đổi");
  };

  return (
    <Card className="flex h-[580px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4 bg-card">
        <Avatar member={peer} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{peer.name}</span>
            <span className="rounded-md bg-[#003B95]/10 text-[#003B95] dark:text-blue-300 font-extrabold px-1.5 py-0.5 text-[10px]">
              {getMemberCommittee(peer)}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {getCleanMemberSubtitle(peer)}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="flex items-center justify-between gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Pin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 rotate-45 fill-amber-500" />
            <span className="font-bold text-amber-900 dark:text-amber-200 shrink-0">
              Đã ghim ({pinnedMessages.length}):
            </span>
            <span className="truncate text-amber-800 dark:text-amber-300">
              {pinnedMessages[pinnedMessages.length - 1].text ||
                `[${pinnedMessages[pinnedMessages.length - 1].attachments?.length ?? 1} tệp đính kèm]`}
            </span>
          </div>
          <button
            onClick={() => {
              const lastPinned = pinnedMessages[pinnedMessages.length - 1];
              const el = document.getElementById(`msg-${lastPinned.id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            Xem tin nhắn
          </button>
        </div>
      )}

      {/* Chat info badge */}
      <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/5 px-4 py-1.5 text-[11px] text-muted-foreground">
        <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span>Kênh nhắn tin trực tiếp nội bộ CEO 1983 (Không giới hạn kết nối, hỗ trợ gửi và tải file tài liệu, hình ảnh, ghim tin nhắn).</span>
      </div>

      {product && (
        <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-lg">
            {product.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Package className="mr-1 inline h-3 w-3" />
              {t("net.context.product")}
            </div>
            <div className="truncate text-xs font-semibold text-foreground">
              {product.title} · {fmt.money(product.price)}
            </div>
          </div>
          <Link
            to="/marketplace/$productId"
            params={{ productId: product.id }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary"
          >
            <ExternalLink className="h-3 w-3" />
            {t("net.context.view")}
          </Link>
          {onClearProduct && (
            <button
              onClick={onClearProduct}
              className="rounded-lg p-1 text-muted-foreground hover:bg-card hover:text-foreground"
              title={t("net.context.dismiss")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Message Thread List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {thread.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t("net.empty.messages")}
          </div>
        )}
        {thread.map((m) => {
          const mine = m.fromId === CURRENT_USER_ID;
          return (
            <div
              key={m.id}
              id={`msg-${m.id}`}
              className={`group flex items-start gap-1.5 ${mine ? "justify-end" : "justify-start"}`}
            >
              {mine && (
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 pt-1">
                  <button
                    onClick={() => togglePinMessage(m.id)}
                    title={m.pinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Pin className={`h-3.5 w-3.5 ${m.pinned ? "fill-amber-500 text-amber-500 rotate-45" : ""}`} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("net.msg.delete") + "?")) deleteMessage(m.id);
                    }}
                    title={t("net.msg.delete")}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  mine
                    ? "rounded-br-sm text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-foreground"
                } ${m.pinned ? "ring-2 ring-amber-400/80" : ""}`}
                style={mine ? { background: "var(--gradient-primary)" } : undefined}
              >
                {/* Pinned pill */}
                {m.pinned && (
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                    <Pin className="h-3 w-3 fill-current rotate-45" />
                    <span>Tin nhắn đã ghim</span>
                  </div>
                )}

                {/* Text */}
                {m.text && <div className="whitespace-pre-wrap break-words">{m.text}</div>}

                {/* Attachments */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.attachments.map((att) => (
                      <div key={att.id}>
                        {att.type === "image" ? (
                          <div className="space-y-1">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="max-h-60 max-w-full rounded-lg object-contain bg-black/10 cursor-pointer hover:opacity-95"
                              onClick={() => window.open(att.url, "_blank")}
                            />
                            <div className="flex items-center justify-between text-[11px] opacity-80 px-1">
                              <span className="truncate max-w-[180px]">{att.name}</span>
                              <a
                                href={att.url}
                                download={att.name}
                                className="inline-flex items-center gap-1 font-semibold underline hover:opacity-100 ml-2"
                              >
                                <Download className="h-3 w-3" />
                                <span>Tải ({formatFileSize(att.size)})</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-xs ${
                              mine
                                ? "bg-white/10 border-white/20 text-primary-foreground"
                                : "bg-card border-border text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <AttachmentIcon type={att.type} />
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{att.name}</div>
                                <div className="text-[10px] opacity-75">{formatFileSize(att.size)}</div>
                              </div>
                            </div>
                            <a
                              href={att.url}
                              download={att.name}
                              className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-1 font-semibold text-xs transition hover:bg-primary/30"
                              title="Tải tệp"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Tải về</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Time & Read Status */}
                <div
                  className={`mt-1 flex items-center gap-1 text-[10px] ${
                    mine ? "justify-end text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  <span>
                    {fmt.date(m.at)} ·{" "}
                    {new Date(m.at).toLocaleTimeString(fmt.locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {mine && m.id === lastReadMineId && (
                    <span className="font-semibold">· {t("net.msg.seen")}</span>
                  )}
                </div>
              </div>

              {!mine && (
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 pt-1">
                  <button
                    onClick={() => togglePinMessage(m.id)}
                    title={m.pinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Pin className={`h-3.5 w-3.5 ${m.pinned ? "fill-amber-500 text-amber-500 rotate-45" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attachments preview staging area */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border bg-secondary/30 p-2 max-h-24 overflow-y-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs shadow-xs"
            >
              <AttachmentIcon type={att.type} />
              <span className="truncate max-w-[120px] font-medium">{att.name}</span>
              <span className="text-[10px] text-muted-foreground">({formatFileSize(att.size)})</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id || att.name)}
                className="text-muted-foreground hover:text-destructive ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          handleFileSelect(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          handleFileSelect(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-border p-3 bg-card">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          title="Gửi hình ảnh"
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Đính kèm tài liệu, file"
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Nhập nội dung trao đổi công việc, gửi file, tài liệu..."
          className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={submit}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Send className="h-4 w-4" />
          <span>Gửi</span>
        </button>
      </div>
    </Card>
  );
}

function NewChatDialog({
  open,
  onOpenChange,
  onSelectMember,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [comm, setComm] = useState<string>("Tất cả các ban");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MEMBERS.filter((m) => {
      if (m.id === CURRENT_USER_ID) return false;
      const matchesComm = comm === "Tất cả các ban" || getMemberCommittee(m) === comm;
      if (!matchesComm) return false;
      if (!query) return true;
      return (
        m.name.toLowerCase().includes(query) ||
        (m.contact ?? "").toLowerCase().includes(query) ||
        m.code.toLowerCase().includes(query)
      );
    });
  }, [q, comm]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg max-h-[85vh] flex flex-col p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Bắt đầu cuộc trao đổi công việc mới</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Chọn bất kỳ nhân sự hoặc hội viên nào trong các Ban để nhắn tin trao đổi công việc ngay lập tức.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-2 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, mã hội viên..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {CRM_COMMITTEES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setComm(c)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                  comm === c
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[320px] space-y-1.5 divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Không tìm thấy nhân sự hoặc hội viên nào
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMember(m.id);
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center justify-between p-2 rounded-lg hover:bg-secondary/60 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar member={m} size={36} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-foreground">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {getMemberCommittee(m)} · {m.code}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 shrink-0"
                >
                  Nhắn tin
                </button>
              </div>
            ))
          )}
        </div>

        <AlertDialogFooter className="mt-3">
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function NetworkPage() {
  useNetworkTick();
  const t = useT();
  const fmt = useFmt();
  const navigate = useNavigate();

  const search = Route.useSearch();
  const { products, network } = Route.useLoaderData() as {
    products: Product[];
    network: {
      currentMemberId: string | null;
      statuses: Record<string, ConnectionStatus>;
      timestamps: Record<string, string>;
      messages: ChatMessage[];
    };
  };
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Hydrate the local network store from server data
  useEffect(() => {
    hydrateNetwork(
      network?.currentMemberId ?? null,
      network?.statuses ?? {},
      network?.messages ?? [],
      network?.timestamps ?? {},
    );
  }, [network]);

  // Polling: refresh messages and connections every 20 s
  useEffect(() => {
    const id = setInterval(() => void refreshFromDb(), 20_000);
    return () => clearInterval(id);
  }, []);

  const [tab, setTab] = useState<Tab>("discover");
  const [query, setQuery] = useState("");
  const [selectedCommittee, setSelectedCommittee] = useState<string>("Tất cả các ban");
  const [showNewChat, setShowNewChat] = useState(false);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<string | undefined>(undefined);

  // React to ?peer=&product= deep links from Marketplace
  useEffect(() => {
    if (!search.peer) return;
    setTab("messages");
    setActivePeer(search.peer);
    if (search.product) {
      const p = productsById.get(search.product);
      setActiveProduct(search.product);
      if (p) {
        setDraft(t("mk.chat.prefill", { title: p.title, price: fmt.money(p.price) }));
      }
    } else {
      setActiveProduct(undefined);
      setDraft(undefined);
    }
    navigate({
      to: "/network",
      search: {},
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.peer, search.product]);

  const connections = listConnections();
  const incoming = listIncoming();
  const outgoing = listOutgoing();

  const matches = (m: Member, q: string) =>
    !q ||
    m.name.toLowerCase().includes(q) ||
    (m.contact ?? "").toLowerCase().includes(q) ||
    m.code.toLowerCase().includes(q) ||
    t(m.industry).toLowerCase().includes(q) ||
    t(m.region).toLowerCase().includes(q);

  const committeeMatches = (m: Member) =>
    selectedCommittee === "Tất cả các ban" || getMemberCommittee(m) === selectedCommittee;

  const filter = (list: Member[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) => matches(m, q));
  };

  const filteredConnections = useMemo(() => {
    return filter(connections).filter(committeeMatches);
  }, [connections, query, selectedCommittee]);

  const filteredIncoming = useMemo(() => {
    return filter(incoming).filter(committeeMatches);
  }, [incoming, query, selectedCommittee]);

  const filteredOutgoing = useMemo(() => {
    return filter(outgoing).filter(committeeMatches);
  }, [outgoing, query, selectedCommittee]);

  // Discover / All committee members
  const PER_PAGE = 12;
  const [sort, setSort] = useState<"name-asc" | "name-desc" | "code-asc">("name-asc");
  const [page, setPage] = useState(1);

  const discoverFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = MEMBERS.filter(
      (m) => matches(m, q) && committeeMatches(m),
    );
    const sorted = [...list].sort((a, b) => {
      if (sort === "code-asc") return a.code.localeCompare(b.code);
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sort === "name-desc" ? -cmp : cmp;
    });
    return sorted;
  }, [query, sort, selectedCommittee]);

  const discoverPages = Math.max(1, Math.ceil(discoverFiltered.length / PER_PAGE));
  const safePage = Math.min(page, discoverPages);
  const discoverPaged = discoverFiltered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [query, sort, tab, selectedCommittee]);

  // All active chat threads
  const chatPeers = listChatPeers();
  const messageList = useMemo(() => {
    const map = new Map<string, { member: Member; last: ChatMessage | undefined }>();
    for (const m of chatPeers) {
      map.set(m.id, { member: m, last: lastMessageWith(m.id) });
    }
    if (activePeer && !map.has(activePeer)) {
      const mem = MEMBERS.find((m) => m.id === activePeer);
      if (mem) map.set(mem.id, { member: mem, last: lastMessageWith(mem.id) });
    }
    return Array.from(map.values()).sort((a, b) =>
      (b.last?.at ?? "").localeCompare(a.last?.at ?? ""),
    );
  }, [chatPeers, activePeer]);

  const openChat = (id: string) => {
    setTab("messages");
    setActivePeer(id);
    setActiveProduct(undefined);
    setDraft(undefined);
  };
  const selectPeer = (id: string) => {
    setActivePeer(id);
    setActiveProduct(undefined);
    setDraft(undefined);
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    {
      key: "discover",
      label: "Nhân sự & Các Ban",
      count: MEMBERS.length,
    },
    { key: "messages", label: "Hộp thư trao đổi", count: messageList.length },
  ];

  return (
    <AppShell>
      <div className="mb-3 flex items-center justify-between">
        <Link
          to="/association"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về App Hiệp Hội</span>
        </Link>
      </div>

      <PageHeader
        title={t("net.title")}
        subtitle="Hệ thống trao đổi công việc 1-on-1 nội bộ giữa Ban Điều Hành và các Ban Chuyên Môn CEO 1983"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Tổng nhân sự & Hội viên"
          value={fmt.num(MEMBERS.filter((m) => m.id !== CURRENT_USER_ID).length)}
          tone="primary"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Ban Chuyên Môn"
          value="7 ban"
          tone="success"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          label="Cuộc trao đổi"
          value={fmt.num(messageList.length)}
          tone="info"
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          label="Trao đổi trực tiếp"
          value="Không rào cản"
          tone="warning"
          icon={<Send className="h-4 w-4" />}
        />
      </div>

      {/* Main Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`relative -mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb.label}
              {tb.count != null && tb.count > 0 && (
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab !== "messages" && (
        <div className="mb-4 space-y-3">
          {/* Committee Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Ban công tác:
            </span>
            {CRM_COMMITTEES.map((comm) => {
              const isSelected = selectedCommittee === comm;
              const count =
                comm === "Tất cả các ban"
                  ? MEMBERS.filter((m) => m.id !== CURRENT_USER_ID).length
                  : MEMBERS.filter(
                      (m) => m.id !== CURRENT_USER_ID && getMemberCommittee(m) === comm,
                    ).length;
              return (
                <button
                  key={comm}
                  onClick={() => setSelectedCommittee(comm)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span>{comm}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected
                        ? "bg-primary-foreground/25 text-primary-foreground font-bold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm nhân sự theo tên, doanh nghiệp, mã hội viên, ngành nghề..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "discover" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              {selectedCommittee !== "Tất cả các ban" ? `${selectedCommittee} · ` : ""}
              Hiển thị {fmt.num(discoverFiltered.length)} nhân sự / hội viên
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("net.sort.label")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-lg border border-input bg-card px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="name-asc">{t("net.sort.nameAsc")}</option>
                <option value="name-desc">{t("net.sort.nameDesc")}</option>
                <option value="code-asc">{t("net.sort.codeAsc")}</option>
              </select>
            </label>
          </div>

          {discoverFiltered.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              Không tìm thấy nhân sự hoặc hội viên nào trong danh mục đã chọn.
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {discoverPaged.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    bottomLabel={<Pill color="primary">{getMemberCommittee(m)}</Pill>}
                    rightSlot={
                      <button
                        onClick={() => openChat(m.id)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
                        style={{ background: "#003B95" }}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Nhắn tin trao đổi</span>
                      </button>
                    }
                  />
                ))}
              </div>

              {discoverPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40"
                  >
                    {t("net.page.prev")}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {t("net.page.info", { page: safePage, total: discoverPages })}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(discoverPages, p + 1))}
                    disabled={safePage >= discoverPages}
                    className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40"
                  >
                    {t("net.page.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "messages" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="flex h-[580px] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("net.tab.messages")} ({messageList.length})
              </div>
              <button
                onClick={() => setShowNewChat(true)}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Hội thoại mới</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {messageList.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Chưa có hội thoại nào. Nhấn "Hội thoại mới" hoặc chọn nhân sự trong các Ban để trao đổi công việc.
                </div>
              )}
              {messageList.map(({ member, last }) => {
                const active = activePeer === member.id;
                const unread = active ? 0 : unreadCountWith(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => selectPeer(member.id)}
                    className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition ${
                      active ? "bg-secondary" : "hover:bg-secondary/60"
                    }`}
                  >
                    <Avatar member={member} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {member.name}
                        </div>
                        {last && (
                          <div className="shrink-0 text-[10px] text-muted-foreground">
                            {new Date(last.at).toLocaleDateString(fmt.locale)}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-medium text-primary/80 truncate">
                        {getMemberCommittee(member)}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div
                          className={`truncate text-xs ${unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                        >
                          {last
                            ? (last.fromId === CURRENT_USER_ID ? "→ " : "") + last.text
                            : "Bắt đầu trao đổi công việc..."}
                        </div>
                        {unread > 0 && (
                          <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
          <ChatPanel
            peerId={activePeer}
            product={activeProduct ? productsById.get(activeProduct) : undefined}
            initialDraft={draft}
            onClose={() => {
              setActivePeer(null);
              setActiveProduct(undefined);
              setDraft(undefined);
            }}
            onClearProduct={() => {
              setActiveProduct(undefined);
              setDraft(undefined);
            }}
          />
        </div>
      )}

      {/* New chat modal */}
      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onSelectMember={openChat}
      />
    </AppShell>
  );
}
