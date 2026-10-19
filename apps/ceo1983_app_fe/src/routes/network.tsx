import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Handshake,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Newspaper,
  Package,
  Paperclip,
  Pin,
  PinOff,
  Plus,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Video,
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
import { listOpportunitiesFn } from "@/lib/opportunities.functions";
import type { Opportunity } from "@/lib/opportunities-data";
import { listNewsFn } from "@/lib/news.functions";
import type { NewsArticle } from "@/lib/extra-data";
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
  listGroupChats,
  getGroupChat,
  createGroupChat,
  type GroupChat,
  type ChatAttachment,
  type ChatMessage,
  type ConnectionStatus,
} from "@/lib/networking-data";
import { getNetworkStateFn } from "@/lib/networking.functions";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { mergeMembersWithAccounts, readManagedAccounts } from "@/lib/committee-accounts";

/** Map bản ghi /members (DB) → Member cho danh bạ chat. */
function mapApiMemberRow(r: Record<string, any>): Member | null {
  const id = String(r?.id ?? r?.userId ?? r?.user_id ?? r?.code ?? "").trim();
  if (!id) return null;
  const status = String(r?.status ?? r?.membershipStatus ?? "active").toLowerCase();
  if (["rejected", "deleted", "locked", "banned"].includes(status)) return null;
  return {
    id,
    code: String(r?.code ?? id),
    name: String(r?.name ?? r?.personName ?? "Hội viên CEO 1983"),
    contact: String(r?.contact ?? r?.companyName ?? r?.company ?? ""),
    email: String(r?.email ?? ""),
    phone: String(r?.phone ?? ""),
    type: r?.type === "individual" ? "individual" : "company",
    level: String(r?.level ?? "memberLevel.medium"),
    industry: String(r?.industry ?? ""),
    region: String(r?.region ?? ""),
    status: "active",
    joinedAt: String(r?.joinedAt ?? r?.joined_at ?? r?.createdAt ?? r?.created_at ?? ""),
    feeYear: new Date().getFullYear(),
    feePaid: true,
    address: String(r?.address ?? ""),
    about: String(r?.about ?? ""),
    executiveRole: String(r?.executiveRole ?? r?.executive_role ?? r?.role ?? ""),
    department: String(r?.department ?? r?.board ?? r?.boardWish ?? ""),
  };
}

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
      const [productsRes, networkRes, membersRes, oppsRes, newsRes] = await Promise.allSettled([
        listProductsFn().catch(() => []),
        getNetworkStateFn().catch(() => ({ currentMemberId: null, statuses: {}, timestamps: {}, messages: [] })),
        listPeersFn().catch(() => []),
        listOpportunitiesFn().catch(() => []),
        listNewsFn().catch(() => []),
      ]);
      const products = productsRes.status === "fulfilled" && Array.isArray(productsRes.value) ? productsRes.value : [];
      const network = networkRes.status === "fulfilled" && networkRes.value ? networkRes.value : { currentMemberId: null, statuses: {}, timestamps: {}, messages: [] };
      const members = membersRes.status === "fulfilled" && Array.isArray(membersRes.value) ? membersRes.value : [];
      const opportunities = oppsRes.status === "fulfilled" && Array.isArray(oppsRes.value) ? (oppsRes.value as Opportunity[]) : [];
      const news = newsRes.status === "fulfilled" && Array.isArray(newsRes.value) ? (newsRes.value as NewsArticle[]) : [];

      // Hiển thị TOÀN BỘ tài khoản thuộc các Ban: gộp danh bạ + toàn bộ /members + tài khoản quản trị (/accounts)
      let allDbMembers: Member[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = await fetchNestApi<any[]>("/members");
          if (Array.isArray(raw)) {
            allDbMembers = raw.map(mapApiMemberRow).filter((m): m is Member => !!m);
          }
        } catch {
          /* ignore — vẫn còn danh bạ + tài khoản Ban */
        }
      }
      const merged = mergeMembersWithAccounts(
        [...(members as Member[]), ...allDbMembers],
        readManagedAccounts(),
      );
      hydrateMembers(merged.length > 0 ? merged : (members ?? []));
      return { products, network, opportunities, news };
    } catch (e) {
      console.warn("Error in network loader:", e);
      return {
        products: [],
        network: { currentMemberId: null, statuses: {}, timestamps: {}, messages: [] },
        opportunities: [],
        news: [],
      };
    }
  },
  component: NetworkPage,
});

type Tab = "feed" | "messages" | "members";

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
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 font-bold px-2 py-0.5 text-[11px] border border-blue-200 dark:border-blue-800">
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

  const isGroup = Boolean(peerId?.startsWith("group-"));
  const group = isGroup && peerId ? getGroupChat(peerId) : undefined;
  const peer = !isGroup && peerId ? MEMBERS.find((m) => m.id === peerId) : undefined;
  const thread = peerId ? getThread(peerId) : [];
  const pinnedMessages = thread.filter((m) => m.pinned);
  const [showMembersList, setShowMembersList] = useState(false);

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

  if (!peer && !group) {
    return (
      <Card className="flex h-[560px] items-center justify-center p-6 text-sm text-muted-foreground">
        {t("net.empty.thread")}
      </Card>
    );
  }

  const submit = () => {
    if (!text.trim() && attachments.length === 0) return;
    const targetId = isGroup && group ? group.id : peer?.id;
    if (!targetId) return;
    sendMessage(targetId, text, attachments.length > 0 ? attachments : undefined);
    setText("");
    setAttachments([]);
    toast.success("Đã gửi tin nhắn trao đổi");
  };

  return (
    <Card className="flex h-[580px] flex-col overflow-hidden">
      {/* Header */}
      {isGroup && group ? (
        <div className="flex flex-col border-b border-border bg-card">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-foreground">{group.name}</span>
                <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold px-1.5 py-0.5 text-[10px] border border-amber-500/30">
                  Nhóm ({group.memberIds.length} thành viên)
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {group.description || "Nhóm trao đổi công việc nội bộ CEO 1983"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMembersList(!showMembersList)}
              className="rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary transition shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{showMembersList ? "Đóng DS" : `Thành viên (${group.memberIds.length})`}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Members list expandable drawer */}
          {showMembersList && (
            <div className="border-t border-border bg-secondary/40 p-3 max-h-40 overflow-y-auto space-y-1.5">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Thành viên nhóm ({group.memberIds.length}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {group.memberIds.map((mid) => {
                  const m = MEMBERS.find((x) => x.id === mid);
                  if (!m) return null;
                  return (
                    <div
                      key={mid}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 shadow-xs"
                    >
                      <Avatar member={m} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-foreground">
                          {m.name} {mid === CURRENT_USER_ID ? "(Bạn)" : ""}
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {getMemberCommittee(m)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : peer ? (
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
      ) : null}

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
          const sender = isGroup && !mine ? MEMBERS.find((x) => x.id === m.fromId) : null;
          return (
            <div
              key={m.id}
              id={`msg-${m.id}`}
              className={`group flex items-start gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {isGroup && !mine && (
                <div className="shrink-0 pt-0.5">
                  {sender ? (
                    <Avatar member={sender} size={28} />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[11px] font-bold">
                      {m.fromId.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

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
                {/* Group message sender identification */}
                {isGroup && !mine && (
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border/40 pb-0.5">
                    <span className="font-bold text-foreground">{sender?.name || "Hội viên"}</span>
                    {sender && (
                      <span className="rounded bg-primary/10 px-1 py-0.2 text-[9px] font-medium text-primary">
                        {getMemberCommittee(sender)}
                      </span>
                    )}
                  </div>
                )}
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

function NewGroupChatDialog({
  open,
  onOpenChange,
  onCreateGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (group: GroupChat) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhóm trao đổi");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên tham gia nhóm");
      return;
    }
    const newGroup = createGroupChat(name, selectedIds, description);
    toast.success(`Đã tạo nhóm "${newGroup.name}" thành công!`);
    onCreateGroup(newGroup);
    onOpenChange(false);
    setName("");
    setDescription("");
    setSelectedIds([]);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl max-h-[90vh] flex flex-col p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            <span>Tạo Nhóm Nhắn Tin Trao Đổi Mới</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tạo nhóm thảo luận công việc giữa nhiều thành viên thuộc Ban Điều Hành và các Ban Chuyên Môn CEO 1983.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-2 space-y-3">
          {/* Group Info Inputs */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-foreground">
                Tên nhóm trao đổi <span className="text-destructive">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nhóm Dự án Xúc tiến Thương mại & B2B..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">
                Mô tả / Mục tiêu công tác (tùy chọn)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mục đích thảo luận, phân công nhiệm vụ..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Selected members pills summary */}
          {selectedIds.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                <span>Đã chọn ({selectedIds.length} thành viên):</span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] text-destructive hover:underline cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {selectedIds.map((id) => {
                  const m = MEMBERS.find((x) => x.id === id);
                  if (!m) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-card border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-xs"
                    >
                      <span>{m.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleMember(id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Member Search & Committee filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm nhân sự theo tên, mã..."
                className="flex-1 bg-transparent text-xs outline-none"
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
        </div>

        {/* Member Checkbox list */}
        <div className="flex-1 overflow-y-auto max-h-[240px] space-y-1.5 divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Không tìm thấy nhân sự hoặc hội viên nào
            </div>
          ) : (
            filtered.map((m) => {
              const isChecked = selectedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`flex cursor-pointer items-center justify-between p-2 rounded-lg transition ${
                    isChecked ? "bg-amber-500/15 border border-amber-500/30" : "hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                    />
                    <Avatar member={m} size={32} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {getMemberCommittee(m)} · {m.code}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isChecked ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-muted-foreground"
                    }`}
                  >
                    {isChecked ? "Đã chọn" : "Chọn"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <AlertDialogFooter className="mt-3 flex items-center justify-between sm:justify-between w-full">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Hủy</AlertDialogCancel>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            <span>Tạo Nhóm Trao Đổi ({selectedIds.length})</span>
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type FeedItem = {
  id: string;
  type: "product" | "opportunity" | "news";
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorSubtitle: string;
  authorCommittee: string;
  authorAvatar?: string;
  createdAt: string;
  badge: {
    label: string;
    colorCls: string;
  };
  priceOrBudget?: string;
  images: string[];
  videoUrl?: string;
  linkTo?: string;
  raw: any;
};

export function findMemberForFeed(authorId?: string, authorName?: string): Member {
  if (authorId) {
    const found = MEMBERS.find((m) => m.id === authorId || m.code === authorId);
    if (found) return found;
  }
  if (authorName) {
    const clean = authorName.toLowerCase().trim();
    const found = MEMBERS.find(
      (m) =>
        m.name.toLowerCase().includes(clean) ||
        clean.includes(m.name.toLowerCase()) ||
        (m.contact && (m.contact.toLowerCase().includes(clean) || clean.includes(m.contact.toLowerCase()))),
    );
    if (found) return found;
  }
  return (
    MEMBERS[0] || {
      id: "admin-c1983",
      code: "CEO1983-001",
      name: authorName || "Ban Điều Hành CEO 1983",
      contact: "CEO 1983 HanoiBA",
      email: "contact@ceo1983.vn",
      phone: "",
      type: "individual",
      level: "memberLevel.high",
      industry: "Hiệp Hội Doanh Nhân",
      region: "Hà Nội",
      status: "active",
      joinedAt: new Date().toISOString(),
      feeYear: 2026,
      feePaid: true,
      department: "Ban Điều Hành",
    }
  );
}

function ScheduleMeetingModal({
  target,
  onClose,
  onScheduled,
}: {
  target: {
    memberId: string;
    name: string;
    subtitle?: string;
    avatar?: string;
    contextTitle?: string;
  } | null;
  onClose: () => void;
  onScheduled: (memberId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState<"offline" | "online">("offline");
  const [location, setLocation] = useState("Văn phòng CEO 1983 hoặc Cafe Doanh nhân");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (target) {
      setTitle(
        target.contextTitle
          ? `Gặp gỡ trao đổi về: ${target.contextTitle}`
          : `Gặp gỡ kết nối 1-on-1 cùng ${target.name}`,
      );
      if (type === "offline") {
        setLocation("Văn phòng CEO 1983 hoặc Cafe Doanh nhân");
      }
    }
  }, [target, type]);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập chủ đề cuộc gặp!");
      return;
    }
    if (!date) {
      toast.error("Vui lòng chọn ngày gặp!");
      return;
    }
    setSubmitting(true);
    try {
      const typeLabel = type === "offline" ? "Trực tiếp (Offline)" : "Trực tuyến (Google Meet/Zoom)";
      const meetingMessage =
        `🤝 [LỜI MỜI LÊN LỊCH CUỘC GẶP 1-ON-1]\n` +
        `📌 Chủ đề: ${title.trim()}\n` +
        `📅 Thời gian: ${time} ngày ${date}\n` +
        `📍 Hình thức: ${typeLabel}\n` +
        `🏢 Địa điểm / Link họp: ${location.trim() || (type === "offline" ? "Tại văn phòng / Hẹn trước" : "Google Meet")}\n` +
        (notes.trim() ? `📝 Ghi chú: ${notes.trim()}\n` : "") +
        `\n(Lời mời được gửi tự động từ Mạng Xã Hội Doanh Nhân CEO 1983)`;

      await sendMessage(target.memberId, meetingMessage);
      toast.success(`Đã gửi lời mời lên lịch cuộc gặp 1-on-1 tới ${target.name} qua hộp thư nội bộ!`);
      onClose();
      onScheduled(target.memberId);
    } catch (err: any) {
      toast.error("Không thể gửi lời mời: " + (err?.message || "Lỗi kết nối"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Lên lịch cuộc gặp 1-on-1</h3>
              <p className="text-xs text-muted-foreground">Đặt hẹn gặp trực tiếp hoặc trực tuyến cùng đối tác</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target Info */}
        <div className="px-5 py-3 bg-primary/5 border-b border-border/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/15 text-primary font-bold grid place-items-center text-sm shrink-0 border border-primary/20">
            {target.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">Đối tác kết nối:</div>
            <div className="text-sm font-bold text-foreground truncate">{target.name}</div>
            {target.subtitle && <div className="text-xs text-muted-foreground truncate">{target.subtitle}</div>}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Chủ đề cuộc gặp <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trao đổi hợp tác phân phối sản phẩm, chia sẻ kinh nghiệm..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Ngày gặp <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Thời gian <span className="text-destructive">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Hình thức gặp gỡ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("offline");
                  setLocation("Văn phòng CEO 1983 hoặc Cafe Doanh nhân");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  type === "offline"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Trực tiếp (Offline)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("online");
                  setLocation("Google Meet (sẽ gửi link họp)");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  type === "online"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                Trực tuyến (Online)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {type === "offline" ? "Địa điểm cuộc gặp" : "Link phòng họp trực tuyến"}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={type === "offline" ? "VD: Cafe Highlands, Văn phòng Công ty..." : "VD: https://meet.google.com/xyz"}
              className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Nội dung / Ghi chú bổ sung</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thông tin thêm cần chuẩn bị, tài liệu liên quan..."
              className="w-full rounded-lg border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ background: "#003B95" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang gửi lời mời...
                </>
              ) : (
                <>
                  <Handshake className="h-3.5 w-3.5" />
                  Xác nhận lên lịch & Gửi tin nhắn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeedCard({
  item,
  onOpenChat,
  onScheduleMeeting,
}: {
  item: FeedItem;
  onOpenChat: (authorId: string) => void;
  onScheduleMeeting: (target: { memberId: string; name: string; subtitle?: string; contextTitle?: string }) => void;
}) {
  const fmt = useFmt();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5 border border-border bg-card rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Post Author Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-full font-bold text-white grid place-items-center shrink-0 shadow-xs"
              style={{ background: "var(--gradient-primary)" }}
            >
              {item.authorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-foreground truncate">{item.authorName}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  {item.authorCommittee}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">{item.authorSubtitle}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.badge.colorCls}`}>
              {item.badge.label}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.createdAt ? fmt.rel(item.createdAt) : "Gần đây"}
            </span>
          </div>
        </div>

        {/* Post Title */}
        <h4 className="text-base font-bold text-foreground mb-2 line-clamp-2 leading-snug">
          {item.title}
        </h4>

        {/* Price / Budget Pill if available */}
        {item.priceOrBudget && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
              💰 {item.type === "product" ? `Giá niêm yết: ${item.priceOrBudget}` : `Ngân sách: ${item.priceOrBudget}`}
            </span>
          </div>
        )}

        {/* Post Content */}
        <p className={`text-xs text-muted-foreground leading-relaxed mb-3 ${expanded ? "" : "line-clamp-3"}`}>
          {item.content}
        </p>
        {item.content && item.content.length > 180 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold text-primary hover:underline mb-3 cursor-pointer block"
          >
            {expanded ? "Thu gọn" : "Xem thêm..."}
          </button>
        )}

        {/* Media Preview (Images) */}
        {item.images && item.images.length > 0 && (
          <div className="mb-3">
            {item.images.length === 1 ? (
              <div className="relative aspect-video max-h-60 w-full rounded-xl overflow-hidden border border-border bg-muted/30">
                <img
                  src={resolveMediaUrl(item.images[0]) || item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.images.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img
                      src={resolveMediaUrl(url) || url}
                      alt={`${item.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 2 && item.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center font-bold text-white text-xs">
                        +{item.images.length - 3} ảnh
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video Link if available */}
        {item.videoUrl && (
          <div className="mb-3">
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Xem Video giới thiệu</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            onScheduleMeeting({
              memberId: item.authorId,
              name: item.authorName,
              subtitle: item.authorSubtitle,
              contextTitle: item.title,
            })
          }
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-95 active:scale-95 cursor-pointer"
          style={{ background: "#003B95" }}
        >
          <Handshake className="h-4 w-4" />
          <span>🤝 Lên lịch cuộc gặp 1-on-1</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenChat(item.authorId)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Nhắn tin</span>
          </button>

          {item.linkTo && (
            <Link
              to={item.linkTo}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <span>Chi tiết</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

function NetworkPage() {
  useNetworkTick();
  const t = useT();
  const fmt = useFmt();
  const navigate = useNavigate();

  const search = Route.useSearch();
  const { products, network, opportunities, news } = Route.useLoaderData() as {
    products: Product[];
    network: {
      currentMemberId: string | null;
      statuses: Record<string, ConnectionStatus>;
      timestamps: Record<string, string>;
      messages: ChatMessage[];
    };
    opportunities: Opportunity[];
    news: NewsArticle[];
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

  const [tab, setTab] = useState<Tab>("feed");
  const [feedTypeFilter, setFeedTypeFilter] = useState<"all" | "product" | "opportunity" | "news">("all");
  const [meetingTarget, setMeetingTarget] = useState<{
    memberId: string;
    name: string;
    subtitle?: string;
    avatar?: string;
    contextTitle?: string;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCommittee, setSelectedCommittee] = useState<string>("Tất cả các ban");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroupChat, setShowNewGroupChat] = useState(false);
  const [chatSubFilter, setChatSubFilter] = useState<"all" | "group" | "direct">("all");
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
    m.code.toLowerCase().includes(query) ||
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
    if (activePeer && !map.has(activePeer) && !activePeer.startsWith("group-")) {
      const mem = MEMBERS.find((m) => m.id === activePeer);
      if (mem) map.set(mem.id, { member: mem, last: lastMessageWith(mem.id) });
    }
    return Array.from(map.values()).sort((a, b) =>
      (b.last?.at ?? "").localeCompare(a.last?.at ?? ""),
    );
  }, [chatPeers, activePeer]);

  const groupList = listGroupChats();
  const groupItems = useMemo(() => {
    return groupList
      .map((g) => ({
        group: g,
        last: lastMessageWith(g.id),
        unread: activePeer === g.id ? 0 : unreadCountWith(g.id),
      }))
      .sort((a, b) => (b.last?.at ?? b.group.createdAt).localeCompare(a.last?.at ?? a.group.createdAt));
  }, [groupList, activePeer]);

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

  // Feed Items Synthesis
  const feedItems = useMemo(() => {
    const list: FeedItem[] = [];

    // 1. Products
    products.forEach((p) => {
      const mem = findMemberForFeed(p.sellerId, p.sellerName);
      const committee = getMemberCommittee(mem);
      const rawP = p as any;
      const images = (p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : rawP.imageUrl ? [rawP.imageUrl] : []) || [];
      list.push({
        id: `prod-${p.id}`,
        type: "product",
        title: p.title,
        content: p.description || rawP.fullDescription || "Sản phẩm - Dịch vụ tiêu biểu từ Hội viên Doanh nhân CEO 1983",
        authorId: mem.id,
        authorName: p.sellerName || mem.name,
        authorSubtitle: rawP.sellerCompany || rawP.company || getCleanMemberSubtitle(mem),
        authorCommittee: committee,
        authorAvatar: p.sellerAvatar || "",
        createdAt: p.createdAt || "",
        badge: {
          label: "Sản phẩm mới",
          colorCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        },
        priceOrBudget: p.price ? fmt.money(p.price) : undefined,
        images,
        videoUrl: rawP.videoUrl,
        linkTo: `/marketplace?id=${p.id}`,
        raw: p,
      });
    });

    // 2. Opportunities
    opportunities.forEach((opp) => {
      const mem = findMemberForFeed(opp.posterId, opp.posterName || opp.contactName);
      const committee = getMemberCommittee(mem);
      const rawOpp = opp as any;
      const images = (rawOpp.images && rawOpp.images.length > 0 ? rawOpp.images : opp.image ? [opp.image] : []) || [];
      const budgetStr =
        opp.budgetMin || opp.budgetMax
          ? `${fmt.money(opp.budgetMin || 0)}${opp.budgetMax ? ` - ${fmt.money(opp.budgetMax)}` : ""}`
          : undefined;
      list.push({
        id: `opp-${opp.id}`,
        type: "opportunity",
        title: opp.title,
        content: opp.description || "Cơ hội hợp tác B2B, giao thương mở rộng mạng lưới kinh doanh.",
        authorId: mem.id,
        authorName: opp.posterName || opp.contactName || mem.name,
        authorSubtitle: opp.company || opp.contactTitle || getCleanMemberSubtitle(mem),
        authorCommittee: committee,
        authorAvatar: opp.posterAvatar || "",
        createdAt: opp.createdAt || "",
        badge: {
          label: "Cơ hội B2B",
          colorCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        },
        priceOrBudget: budgetStr,
        images,
        linkTo: `/opportunities?id=${opp.id}`,
        raw: opp,
      });
    });

    // 3. News
    news.forEach((n) => {
      const mem = findMemberForFeed(undefined, n.author);
      const images = n.images && n.images.length > 0 ? n.images : n.image ? [n.image] : [];
      list.push({
        id: `news-${n.id}`,
        type: "news",
        title: n.title,
        content: n.excerpt || "Tin tức & sự kiện mới nhất từ Hiệp hội Doanh nhân CEO 1983.",
        authorId: mem.id,
        authorName: n.author || "Ban Truyền Thông",
        authorSubtitle: n.category || "Hiệp Hội CEO 1983",
        authorCommittee: "Ban Truyền Thông",
        createdAt: n.publishedAt || "",
        badge: {
          label: "Tin tức",
          colorCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        },
        images,
        linkTo: `/news`,
        raw: n,
      });
    });

    return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [products, opportunities, news, fmt]);

  const filteredFeed = useMemo(() => {
    let result = feedItems;
    if (feedTypeFilter !== "all") {
      result = result.filter((item) => item.type === feedTypeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.authorName.toLowerCase().includes(q) ||
          item.authorSubtitle.toLowerCase().includes(q) ||
          item.authorCommittee.toLowerCase().includes(q),
      );
    }
    return result;
  }, [feedItems, feedTypeFilter, query]);

  const [feedPage, setFeedPage] = useState(1);
  const FEED_PER_PAGE = 8;
  const feedPages = Math.max(1, Math.ceil(filteredFeed.length / FEED_PER_PAGE));
  const pagedFeed = useMemo(() => {
    const start = (feedPage - 1) * FEED_PER_PAGE;
    return filteredFeed.slice(start, start + FEED_PER_PAGE);
  }, [filteredFeed, feedPage]);

  useEffect(() => {
    setFeedPage(1);
  }, [feedTypeFilter, query]);

  const TABS: { key: Tab; label: string; count?: number; icon: React.ReactNode }[] = [
    {
      key: "feed",
      label: "Bảng tin Doanh Nhân",
      count: filteredFeed.length,
      icon: <Newspaper className="h-4 w-4" />,
    },
    {
      key: "messages",
      label: "Nhắn tin & Nhóm",
      count: messageList.length + groupList.length,
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      key: "members",
      label: "Kết nối theo Ban",
      count: MEMBERS.length,
      icon: <Users className="h-4 w-4" />,
    },
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
        title="Mạng Xã Hội Doanh Nhân CEO 1983"
        subtitle="Không gian kết nối giao thương B2B, chia sẻ sản phẩm dịch vụ, cập nhật tin tức và thiết lập cuộc hẹn 1-on-1 trực tiếp"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Bài đăng giao thương"
          value={fmt.num(feedItems.length)}
          tone="primary"
          icon={<Newspaper className="h-4 w-4" />}
        />
        <StatCard
          label="Tổng nhân sự & Hội viên"
          value={fmt.num(MEMBERS.filter((m) => m.id !== CURRENT_USER_ID).length)}
          tone="success"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Ban Chuyên Môn"
          value="7 ban"
          tone="info"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatCard
          label="Cuộc trao đổi"
          value={fmt.num(messageList.length + groupList.length)}
          tone="warning"
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      {/* Main Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => {
                setTab(tb.key);
                setQuery("");
              }}
              className={`relative -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb.icon}
              <span>{tb.label}</span>
              {tb.count != null && tb.count > 0 && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: BẢNG TIN DOANH NHÂN (FEED) ── */}
      {tab === "feed" && (
        <div className="space-y-4">
          {/* Feed Filter Chips & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: "all", label: "Tất cả bài viết", count: feedItems.length },
                {
                  key: "product",
                  label: "🛒 Sản phẩm mới",
                  count: feedItems.filter((i) => i.type === "product").length,
                },
                {
                  key: "opportunity",
                  label: "💡 Cơ hội B2B",
                  count: feedItems.filter((i) => i.type === "opportunity").length,
                },
                {
                  key: "news",
                  label: "📰 Tin tức sự kiện",
                  count: feedItems.filter((i) => i.type === "news").length,
                },
              ].map((item) => {
                const isSelected = feedTypeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFeedTypeFilter(item.key as typeof feedTypeFilter)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected
                          ? "bg-primary-foreground/25 text-primary-foreground font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition text-foreground"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Đăng sản phẩm</span>
              </Link>
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition text-foreground"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" />
                <span>Đăng cơ hội B2B</span>
              </Link>
            </div>
          </div>

          {/* Search Box for Feed */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung, người đăng, ban chuyên môn..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Feed Content Grid */}
          {filteredFeed.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
              <Newspaper className="h-10 w-10 text-muted-foreground/50" />
              <div>Không tìm thấy bài viết hoặc nội dung nào phù hợp với bộ lọc hiện tại.</div>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Xóa từ khóa tìm kiếm
                </button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pagedFeed.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    onOpenChat={openChat}
                    onScheduleMeeting={(target) => setMeetingTarget(target)}
                  />
                ))}
              </div>

              {/* Pagination for Feed */}
              {feedPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => setFeedPage((p) => Math.max(1, p - 1))}
                    disabled={feedPage <= 1}
                    className="rounded-lg border border-input px-3.5 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    {t("net.page.prev")}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Trang {feedPage} / {feedPages} ({filteredFeed.length} bài đăng)
                  </span>
                  <button
                    onClick={() => setFeedPage((p) => Math.min(feedPages, p + 1))}
                    disabled={feedPage >= feedPages}
                    className="rounded-lg border border-input px-3.5 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    {t("net.page.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: KẾT NỐI THEO BAN CHUYÊN MÔN (MEMBERS) ── */}
      {tab === "members" && (
        <div className="space-y-3">
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
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
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 pt-1">
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
                    rightSlot={
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() =>
                            setMeetingTarget({
                              memberId: m.id,
                              name: m.name,
                              subtitle: getCleanMemberSubtitle(m),
                            })
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800 transition cursor-pointer"
                        >
                          <Handshake className="h-3.5 w-3.5" />
                          <span>Đặt lịch 1-on-1</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openChat(m.id)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 cursor-pointer"
                          style={{ background: "#003B95" }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Nhắn tin</span>
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>

              {discoverPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    {t("net.page.prev")}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {t("net.page.info", { page: safePage, total: discoverPages })}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(discoverPages, p + 1))}
                    disabled={safePage >= discoverPages}
                    className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    {t("net.page.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "messages" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="flex h-[580px] flex-col overflow-hidden">
            <div className="flex flex-col border-b border-border bg-card p-3 gap-2">
              <div className="flex items-center justify-between gap-1">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("net.tab.messages")} ({messageList.length + groupList.length})
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowNewGroupChat(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                    title="Tạo nhóm trao đổi công việc"
                  >
                    <Users className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span>Tạo nhóm</span>
                  </button>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Hội thoại mới</span>
                  </button>
                </div>
              </div>

              {/* Sub-filter chips: Tất cả / Nhóm / Cá nhân */}
              <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setChatSubFilter("all")}
                  className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
                    chatSubFilter === "all"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả ({messageList.length + groupList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChatSubFilter("group")}
                  className={`flex-1 py-1 rounded-md text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                    chatSubFilter === "group"
                      ? "bg-card text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-3 w-3" />
                  <span>Nhóm ({groupList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatSubFilter("direct")}
                  className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
                    chatSubFilter === "direct"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cá nhân ({messageList.length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {messageList.length === 0 && groupList.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Chưa có hội thoại nào. Nhấn "Hội thoại mới" hoặc "Tạo nhóm" để trao đổi công việc.
                </div>
              )}

              {/* Groups Section */}
              {(chatSubFilter === "all" || chatSubFilter === "group") &&
                groupItems.map(({ group, last, unread }) => {
                  const active = activePeer === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => selectPeer(group.id)}
                      className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition ${
                        active ? "bg-amber-500/15 border-l-4 border-l-amber-500" : "hover:bg-secondary/60"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-xs">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-bold text-foreground">
                            {group.name}
                          </div>
                          {last && (
                            <div className="shrink-0 text-[10px] text-muted-foreground">
                              {new Date(last.at).toLocaleDateString(fmt.locale)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold px-1.5 py-0.2 text-[9px] border border-amber-500/30">
                            Nhóm · {group.memberIds.length} TV
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <div
                            className={`truncate text-xs ${unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                          >
                            {last
                              ? (last.fromId === CURRENT_USER_ID ? "→ " : "") + last.text
                              : "Bắt đầu trao đổi nhóm..."}
                          </div>
                          {unread > 0 && (
                            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-slate-950">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

              {/* Direct Peer Conversations */}
              {(chatSubFilter === "all" || chatSubFilter === "direct") &&
                messageList.map(({ member, last }) => {
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

      {/* New group chat modal */}
      <NewGroupChatDialog
        open={showNewGroupChat}
        onOpenChange={setShowNewGroupChat}
        onCreateGroup={(g) => {
          setTab("messages");
          setActivePeer(g.id);
        }}
      />

      {/* Schedule 1-on-1 Meeting Modal */}
      <ScheduleMeetingModal
        target={meetingTarget}
        onClose={() => setMeetingTarget(null)}
        onScheduled={(id) => openChat(id)}
      />
    </AppShell>
  );
}
