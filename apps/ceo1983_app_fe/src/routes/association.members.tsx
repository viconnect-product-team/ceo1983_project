import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Search,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  Handshake,
  Calendar,
  Video,
  CreditCard,
  Sparkles,
  ChevronRight,
  Compass,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import {
  listMembers,
  getMyMember,
  type DirectoryMember,
  type MyMember,
} from "@/lib/member-app.functions";
import { useT } from "@/lib/i18n";
import {
  useConnectedPeople,
  useOutgoingRequests,
  useIncomingRequests,
  useSendConnectionRequest,
  useCancelRequest,
  useAcceptRequest,
  useDisconnect,
} from "@/hooks/use-connection";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import { MemberProfileModal } from "@/components/member/MemberProfileModal";
import { InviteMemberModal } from "@/components/member/InviteMemberModal";
import {
  BusinessConnectBottomSheet,
  type BusinessConnectTarget,
} from "@/components/common/BusinessConnectBottomSheet";

export const Route = createFileRoute("/association/members")({
  component: MembersScreen,
});

export type FilterTab = "connected" | "sent" | "meetings" | "discover";

export interface MemberMeetingItem {
  id: string;
  title: string;
  hostName?: string;
  hostCompany?: string;
  hostPhone?: string;
  hostCode?: string;
  hostAvatar?: string;
  partnerName: string;
  partnerCompany?: string;
  partnerPhone?: string;
  partnerCode?: string;
  partnerAvatar?: string;
  date: string;
  time: string;
  venueType?: "online" | "offline";
  venue?: string;
  onlineUrl?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed" | "declined" | string;
  createdAt?: string;
  isUserHost?: boolean;
  isUserInvitee?: boolean;
}

function normalizeSearchText(str: any): string {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
}

/**
 * Trích xuất chữ cái đầu của Tên (hoặc từ cuối cùng của Họ Tên)
 * để sắp xếp danh bạ điện thoại chuẩn A-Z theo phong cách người Việt.
 */
function getVietnameseSortKey(fullName: string): string {
  if (!fullName) return "#";
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[parts.length - 1] || fullName;
  const firstChar = firstName.charAt(0).toUpperCase();
  const normalized = firstChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (firstChar === "Đ" || firstChar === "đ") return "Đ";
  if (/^[A-Z]$/.test(normalized)) return normalized;
  return "#";
}

function compareVietnameseNames(a: string, b: string): number {
  const partsA = a.trim().split(/\s+/);
  const partsB = b.trim().split(/\s+/);
  const nameA = partsA[partsA.length - 1] || a;
  const nameB = partsB[partsB.length - 1] || b;
  const cmp = nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
  if (cmp !== 0) return cmp;
  return a.localeCompare(b, "vi", { sensitivity: "base" });
}

const ALPHABET_INDEX = [
  "A",
  "B",
  "C",
  "D",
  "Đ",
  "E",
  "G",
  "H",
  "I",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "X",
  "Y",
  "#",
];

function MembersScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchMembers = useServerFn(listMembers);
  const fetchMyMember = useServerFn(getMyMember);
  const {
    data: members,
    loading,
    reload: reloadMembers,
  } = useServerData<DirectoryMember[]>(() => fetchMembers(), []);
  const { data: myMember } = useServerData<MyMember | null>(() => fetchMyMember(), null);

  const [q, setQ] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("q") || params.get("company") || "";
    }
    return "";
  });

  // Mặc định tab "connected" (Danh bạ CEO đã kết nối chuẩn điện thoại)
  const [tab, setTab] = useState<FilterTab>(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "meetings" || t === "connected" || t === "sent" || t === "discover") {
        return t as FilterTab;
      }
    }
    return "connected";
  });

  const handleSelectTab = (newTab: FilterTab) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newTab === "connected") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", newTab);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncTabFromUrl = () => {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "meetings" || t === "connected" || t === "sent" || t === "discover") {
        setTab(t as FilterTab);
      }
    };
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const [selectedMember, setSelectedMember] = useState<DirectoryMember | null>(null);
  const [connectTarget, setConnectTarget] = useState<BusinessConnectTarget | null>(null);
  const [localPending, setLocalPending] = useState<Set<string>>(new Set());
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [backendConnectedUserIds, setBackendConnectedUserIds] = useState<Set<string>>(new Set());
  const [activeAlphabet, setActiveAlphabet] = useState<string | null>(null);

  // Lịch sử cuộc gặp 1-on-1 state
  const [meetingsList, setMeetingsList] = useState<MemberMeetingItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_connection_appointments");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const fetchMeetings = async () => {
    try {
      setLoadingMeetings(true);
      const res = await fetchNestApi<any>("/meetings/connection-appointments").catch(() => null);
      const items = Array.isArray(res) ? res : res?.items || [];
      setMeetingsList(items);
      try {
        localStorage.setItem("vba_connection_appointments", JSON.stringify(items));
      } catch {
        /* ignore */
      }
    } catch (err) {
      console.warn("fetchMeetings error:", err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    const handleMeetingChanged = () => {
      fetchMeetings();
    };
    window.addEventListener("vba.meeting.changed", handleMeetingChanged);
    return () => {
      window.removeEventListener("vba.meeting.changed", handleMeetingChanged);
    };
  }, []);

  const handleRespondMeeting = async (
    meetingId: string,
    action: "accept" | "decline",
    partnerName: string,
  ) => {
    try {
      await fetchNestApi(`/meetings/connection-appointments/${meetingId}/respond`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      const newStatus = action === "accept" ? "confirmed" : "declined";
      setMeetingsList((prev) =>
        prev.map((item) => (item.id === meetingId ? { ...item, status: newStatus } : item)),
      );
      if (action === "accept") {
        toast.success(`Đã đồng ý lịch hẹn gặp kết nối với ${partnerName || "đối tác"}!`);
      } else {
        toast.info("Đã từ chối lịch hẹn gặp kết nối.");
      }
      try {
        window.dispatchEvent(new Event("vba.meeting.changed"));
      } catch {
        /* ignore */
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể phản hồi lịch hẹn kết nối");
    }
  };

  // Tự động mở hồ sơ công ty khi được điều hướng từ banner quảng cáo Marketplace
  useEffect(() => {
    if (typeof window === "undefined" || !members || members.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const searchTarget = params.get("q") || params.get("company");
    if (searchTarget) {
      const targetLower = searchTarget.toLowerCase().trim();
      const matched = members.find(
        (m) =>
          (m.name && m.name.toLowerCase().includes(targetLower)) ||
          ((m as any).companyName && (m as any).companyName.toLowerCase().includes(targetLower)) ||
          ((m as any).company && (m as any).company.toLowerCase().includes(targetLower)) ||
          (m.code && m.code.toLowerCase() === targetLower),
      );
      if (matched) {
        setSelectedMember(matched);
      }
    }
  }, [members]);

  // Local storage connection synchronization
  const [disconnectedSet, setDisconnectedSet] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("vba.disconnected_members");
      return stored
        ? new Set(JSON.parse(stored).map((s: string) => String(s).toLowerCase()))
        : new Set();
    } catch {
      return new Set();
    }
  });

  const [connectedSet, setConnectedSet] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const s1 = localStorage.getItem("vba.connected_members");
      const s2 = localStorage.getItem("vba_connected_members");
      const a1: string[] = s1 ? JSON.parse(s1) : [];
      const a2: string[] = s2 ? JSON.parse(s2) : [];
      const combined = [...a1, ...a2].map((s) => String(s).toLowerCase());
      return new Set(combined);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res =
          await fetchNestApi<Array<{ id: string; counterpartUserId: string }>>(
            "/network/connections",
          );
        if (active && Array.isArray(res)) {
          const uids = new Set<string>();
          for (const item of res) {
            if (item?.counterpartUserId) {
              uids.add(String(item.counterpartUserId).toLowerCase());
            }
          }
          setBackendConnectedUserIds(uids);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const [localSentRequests, setLocalSentRequests] = useState<
    Array<{
      id: string;
      targetUserId?: string | null;
      targetCode: string;
      status: "pending" | "accepted" | "rejected";
      createdAt: string;
    }>
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_sent_connection_requests");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return new Set();
    }
  });

  const saveLocalSentRequests = (list: typeof localSentRequests) => {
    setLocalSentRequests(list);
    try {
      localStorage.setItem("vba_sent_connection_requests", JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const handleConnChange = () => {
      try {
        const storedD = localStorage.getItem("vba.disconnected_members");
        setDisconnectedSet(
          storedD
            ? new Set(JSON.parse(storedD).map((s: string) => String(s).toLowerCase()))
            : new Set(),
        );
        const s1 = localStorage.getItem("vba.connected_members");
        const s2 = localStorage.getItem("vba_connected_members");
        const a1: string[] = s1 ? JSON.parse(s1) : [];
        const a2: string[] = s2 ? JSON.parse(s2) : [];
        const combined = [...a1, ...a2].map((s) => String(s).toLowerCase());
        setConnectedSet(new Set(combined));
        const storedSent = localStorage.getItem("vba_sent_connection_requests");
        if (storedSent) {
          setLocalSentRequests(JSON.parse(storedSent));
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("vba.connection.changed", handleConnChange);
    window.addEventListener("storage", handleConnChange);
    return () => {
      window.removeEventListener("vba.connection.changed", handleConnChange);
      window.removeEventListener("storage", handleConnChange);
    };
  }, []);

  // Connection data hooks from canonical CEO 1983 connection system
  const { data: connected = [] } = useConnectedPeople(100);
  const { data: outgoing = [] } = useOutgoingRequests(100);
  const { data: incoming = [] } = useIncomingRequests(100);

  const sendRequest = useSendConnectionRequest();
  const cancelRequest = useCancelRequest();
  const acceptRequest = useAcceptRequest();
  const disconnect = useDisconnect();

  // Maps for fast connection lookup by target userId
  const connectedMap = useMemo(() => {
    const map = new Map<string, string>(); // userId -> connectionId
    for (const c of connected) {
      const pid = (c as any).counterpartUserId || c.person?.personNodeId;
      if (pid) map.set(String(pid).replace(/^u:/, "").toLowerCase(), c.connectionId);
    }
    return map;
  }, [connected]);

  const outgoingMap = useMemo(() => {
    const map = new Map<string, string>(); // userId -> requestId
    for (const req of outgoing) {
      const tid = (req as any).recipientUserId || (req as any).targetPersonNodeId;
      if (tid) map.set(String(tid).replace(/^u:/, "").toLowerCase(), req.id);
    }
    return map;
  }, [outgoing]);

  const incomingMap = useMemo(() => {
    const map = new Map<string, string>(); // userId -> requestId
    for (const req of incoming) {
      const sid = (req as any).requesterUserId;
      if (sid) map.set(String(sid).toLowerCase(), req.id);
    }
    return map;
  }, [incoming]);

  const checkIsFriend = (m: DirectoryMember) => {
    const mCode = m.code.toLowerCase();
    const mUserId = (m.userId || "").toLowerCase();
    const isExplicitlyDisconnected =
      disconnectedSet.has(mCode) || (mUserId && disconnectedSet.has(mUserId));
    if (isExplicitlyDisconnected) return false;
    const isExplicitlyConnected = connectedSet.has(mCode) || (mUserId && connectedSet.has(mUserId));
    if (isExplicitlyConnected) return true;
    if (mUserId && backendConnectedUserIds.has(mUserId)) return true;
    return Boolean(m.userId && connectedMap.has(mUserId));
  };

  // 1. Danh sách những người ĐÃ KẾT NỐI (Chỉ xuất hiện trong Danh bạ chính thức)
  const connectedMembers = useMemo(() => {
    return members.filter((m) => {
      if (myMember?.code && m.code.toLowerCase() === myMember.code.toLowerCase()) return false;
      return checkIsFriend(m);
    });
  }, [members, myMember, disconnectedSet, connectedSet, backendConnectedUserIds, connectedMap]);

  // 2. Danh sách hội viên CHƯA KẾT NỐI (Hiển thị ở Tab Khám phá / Tìm kiếm để gửi kết nối)
  const discoverMembers = useMemo(() => {
    return members.filter((m) => {
      if (myMember?.code && m.code.toLowerCase() === myMember.code.toLowerCase()) return false;
      return !checkIsFriend(m);
    });
  }, [members, myMember, disconnectedSet, connectedSet, backendConnectedUserIds, connectedMap]);

  // Lọc và sắp xếp A-Z cho Danh bạ chính
  const filteredConnected = useMemo(() => {
    const normTerm = normalizeSearchText(q);
    const list = connectedMembers.filter((m) => {
      if (!normTerm) return true;
      const searchable = normalizeSearchText(
        [
          m.name,
          m.contact,
          (m as any).personName,
          (m as any).companyName,
          (m as any).company,
          m.industry,
          m.region,
          m.code,
          (m as any).personTitle,
          (m as any).phone,
          (m as any).email,
        ]
          .filter(Boolean)
          .join(" "),
      );
      return searchable.includes(normTerm);
    });

    // Sắp xếp A-Z theo phong cách danh bạ Việt Nam (theo tên gọi)
    return list.sort((a, b) =>
      compareVietnameseNames(
        a.contact || a.personName || a.name || "",
        b.contact || b.personName || b.name || "",
      ),
    );
  }, [connectedMembers, q]);

  // Nhóm liên hệ đã kết nối theo chữ cái A-Z
  const groupedConnected = useMemo(() => {
    const groups: Record<string, DirectoryMember[]> = {};
    for (const m of filteredConnected) {
      const key = getVietnameseSortKey(m.contact || m.personName || m.name || "");
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  }, [filteredConnected]);

  // Các chữ cái thực tế có hội viên trong danh bạ
  const existingLetters = useMemo(() => {
    return Object.keys(groupedConnected).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b, "vi");
    });
  }, [groupedConnected]);

  // Lọc cho tab Khám phá
  const filteredDiscover = useMemo(() => {
    const normTerm = normalizeSearchText(q);
    const list = discoverMembers.filter((m) => {
      if (!normTerm) return true;
      const searchable = normalizeSearchText(
        [
          m.name,
          m.contact,
          (m as any).personName,
          (m as any).companyName,
          (m as any).company,
          m.industry,
          m.region,
          m.code,
          (m as any).personTitle,
          (m as any).phone,
          (m as any).email,
        ]
          .filter(Boolean)
          .join(" "),
      );
      return searchable.includes(normTerm);
    });
    return list.sort((a, b) =>
      compareVietnameseNames(
        a.contact || a.personName || a.name || "",
        b.contact || b.personName || b.name || "",
      ),
    );
  }, [discoverMembers, q]);

  const filteredMeetings = useMemo(() => {
    const normTerm = normalizeSearchText(q);
    if (!normTerm) return meetingsList;
    return meetingsList.filter((m) => {
      const searchable = normalizeSearchText(
        [
          m.title,
          m.partnerName,
          m.partnerCompany,
          m.partnerCode,
          m.partnerPhone,
          m.hostName,
          m.hostCompany,
          m.venue,
          m.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );
      return searchable.includes(normTerm);
    });
  }, [meetingsList, q]);

  type SentRequestItem = {
    id: string;
    member: DirectoryMember | null;
    code: string;
    name: string;
    company: string;
    title: string;
    avatar: string | null;
    purpose?: string;
    opportunityTitle?: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
    userId?: string | null;
  };

  const sentList: SentRequestItem[] = useMemo(() => {
    const map = new Map<string, SentRequestItem>();

    // 1. Process server outgoing requests
    for (const req of outgoing) {
      const tid =
        (req as any).recipientUserId ||
        (req as any).targetPersonNodeId ||
        req.recipient?.userId ||
        req.recipient?.personNodeId;
      const tidClean = String(tid || "")
        .replace(/^u:/, "")
        .toLowerCase();
      const m = members.find(
        (x) =>
          (x.userId && x.userId.toLowerCase() === tidClean) ||
          (x.code && x.code.toLowerCase() === tidClean),
      );

      const isConn = m ? checkIsFriend(m) : false;
      const reqStatus: "pending" | "accepted" | "rejected" = isConn
        ? "accepted"
        : req.status === "accepted"
          ? "accepted"
          : req.status === "declined" || (req.status as any) === "rejected"
            ? "rejected"
            : "pending";

      const itemKey = m?.code || tidClean || req.id;
      map.set(itemKey.toLowerCase(), {
        id: req.id,
        member: m || null,
        code: m?.code || tidClean,
        name: m?.contact || m?.personName || m?.name || "Hội viên CEO 1983",
        company: (m?.type === "company" ? m?.name : m?.company) || "CLB Doanh Nhân CEO 1983",
        title: m?.personTitle || m?.industry || "Doanh nhân",
        avatar: m?.avatar ? resolveMediaUrl(m.avatar) : null,
        purpose: (req as any).message || (req as any).notes,
        status: reqStatus,
        createdAt: req.createdAt || new Date().toISOString(),
        userId: m?.userId || tidClean,
      });
    }

    // 2. Process localSentRequests
    for (const l of localSentRequests) {
      const key = (l.targetCode || l.targetUserId || l.id).toLowerCase();
      const m = members.find(
        (x) =>
          (x.code && x.code.toLowerCase() === key) || (x.userId && x.userId.toLowerCase() === key),
      );
      const isConn = m ? checkIsFriend(m) : false;
      const finalStatus: "pending" | "accepted" | "rejected" = isConn ? "accepted" : l.status;

      if (!map.has(key)) {
        map.set(key, {
          id: l.id,
          member: m || null,
          code: m?.code || l.targetCode,
          name:
            m?.contact || m?.personName || m?.name || (l as any).targetName || "Hội viên CEO 1983",
          company:
            (m?.type === "company" ? m?.name : m?.company) ||
            (l as any).targetCompany ||
            "CLB Doanh Nhân CEO 1983",
          title: m?.personTitle || m?.industry || (l as any).targetTitle || "Doanh nhân",
          avatar: m?.avatar
            ? resolveMediaUrl(m.avatar)
            : (l as any).targetAvatar
              ? resolveMediaUrl((l as any).targetAvatar)
              : null,
          purpose: (l as any).purpose || (l as any).message,
          opportunityTitle: (l as any).opportunityTitle,
          status: finalStatus,
          createdAt: l.createdAt,
          userId: m?.userId || l.targetUserId,
        });
      } else {
        const existing = map.get(key)!;
        if (isConn) existing.status = "accepted";
        if ((l as any).purpose && !existing.purpose) existing.purpose = (l as any).purpose;
        if ((l as any).opportunityTitle && !existing.opportunityTitle)
          existing.opportunityTitle = (l as any).opportunityTitle;
      }
    }

    // 3. Process localPending
    for (const p of localPending) {
      const key = p.toLowerCase();
      if (!map.has(key)) {
        const m = members.find(
          (x) =>
            (x.code && x.code.toLowerCase() === key) ||
            (x.userId && x.userId.toLowerCase() === key),
        );
        if (m) {
          map.set(key, {
            id: `pending-${m.code}`,
            member: m,
            code: m.code,
            name: m.contact || m.personName || m.name,
            company: (m.type === "company" ? m.name : m.company) || "CLB Doanh Nhân CEO 1983",
            title: m.personTitle || m.industry || "Doanh nhân",
            avatar: m.avatar ? resolveMediaUrl(m.avatar) : null,
            status: "pending",
            createdAt: new Date().toISOString(),
            userId: m.userId,
          });
        }
      }
    }

    const term = q.trim().toLowerCase();
    const allItems = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (!term) return allItems;
    return allItems.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.company.toLowerCase().includes(term) ||
        i.code.toLowerCase().includes(term),
    );
  }, [
    outgoing,
    localSentRequests,
    localPending,
    members,
    connectedSet,
    disconnectedSet,
    connectedMap,
    q,
  ]);

  const handleCancelSentRequest = async (item: SentRequestItem) => {
    try {
      if (item.id && !item.id.startsWith("pending-") && !item.id.startsWith("sent-")) {
        await cancelRequest.mutateAsync({ requestId: item.id });
      }
      setLocalPending((prev) => {
        const next = new Set(prev);
        next.delete(item.code.toLowerCase());
        if (item.userId) next.delete(item.userId.toLowerCase());
        return next;
      });

      const nextLocal = localSentRequests.filter(
        (r) =>
          r.id !== item.id &&
          r.targetCode?.toLowerCase() !== item.code.toLowerCase() &&
          (!item.userId || r.targetUserId?.toLowerCase() !== item.userId.toLowerCase()),
      );
      saveLocalSentRequests(nextLocal);

      toast.success(`Đã hủy lời mời kết nối gửi tới ${item.name}`);
    } catch {
      setLocalPending((prev) => {
        const next = new Set(prev);
        next.delete(item.code.toLowerCase());
        if (item.userId) next.delete(item.userId.toLowerCase());
        return next;
      });
      const nextLocal = localSentRequests.filter((r) => r.id !== item.id);
      saveLocalSentRequests(nextLocal);
      toast.success(`Đã hủy lời mời kết nối gửi tới ${item.name}`);
    }
  };

  const handleConnect = async (m: DirectoryMember) => {
    const target = m.userId || m.code;
    const displayName = m.contact || m.personName || m.name;
    const mCode = m.code.toLowerCase();
    const mUserId = (m.userId || "").toLowerCase();

    try {
      const storedD = localStorage.getItem("vba.disconnected_members");
      const dList: string[] = storedD ? JSON.parse(storedD) : [];
      const nextD = dList.filter(
        (c) => String(c).toLowerCase() !== mCode && String(c).toLowerCase() !== mUserId,
      );
      localStorage.setItem("vba.disconnected_members", JSON.stringify(nextD));

      const storedC = localStorage.getItem("vba.connected_members");
      const cList: string[] = storedC ? JSON.parse(storedC) : [];
      if (!cList.includes(mCode)) cList.push(mCode);
      if (mUserId && !cList.includes(mUserId)) cList.push(mUserId);
      localStorage.setItem("vba.connected_members", JSON.stringify(cList));

      window.dispatchEvent(
        new CustomEvent("vba.connection.changed", {
          detail: { memberCode: m.code, userId: m.userId, connected: true },
        }),
      );
    } catch {
      /* ignore */
    }

    setDisconnectedSet((prev) => {
      const next = new Set(prev);
      next.delete(mCode);
      if (mUserId) next.delete(mUserId);
      return next;
    });
    setConnectedSet((prev) => {
      const next = new Set(prev);
      next.add(mCode);
      if (mUserId) next.add(mUserId);
      return next;
    });

    const registerSent = () => {
      const newSent = {
        id: `sent-${Date.now()}-${m.code}`,
        targetCode: m.code,
        targetUserId: m.userId,
        targetName: displayName,
        targetCompany: m.company || m.name,
        targetTitle: m.personTitle || m.industry,
        targetAvatar: m.avatar,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };
      saveLocalSentRequests([newSent, ...localSentRequests.filter((r) => r.targetCode !== m.code)]);
    };

    if (m.userId) {
      try {
        await sendRequest.mutateAsync({
          targetPersonNodeId: m.userId,
          message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối cùng bạn!`,
        });
        setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
        registerSent();
        toast.success(`Đã gửi lời mời kết nối tới ${displayName}`);
        return;
      } catch (err: any) {
        console.warn("Direct connection hook error, trying API fallback:", err);
      }
    }

    try {
      const res = await fetchNestApi<any>("/network/requests", {
        method: "POST",
        body: JSON.stringify({
          targetUserId: m.userId || null,
          targetMemberCode: m.code,
          message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối cùng bạn!`,
        }),
      }).catch(() => null);

      if (res) {
        setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
        registerSent();
        toast.success(`Đã gửi lời mời kết nối tới ${displayName}`);
        return;
      }
    } catch {
      /* ignore */
    }

    setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
    registerSent();
    toast.success(`Đã lưu yêu cầu kết nối với ${displayName}`);
  };

  const handleDisconnect = async (m: DirectoryMember) => {
    const personDisplayName = m.contact || m.personName || m.name;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${personDisplayName} khỏi danh bạ liên hệ?`))
      return;

    const mCode = m.code.toLowerCase();
    const mUserId = (m.userId || "").toLowerCase();

    try {
      const storedD = localStorage.getItem("vba.disconnected_members");
      const dList: string[] = storedD ? JSON.parse(storedD) : [];
      if (!dList.includes(mCode)) dList.push(mCode);
      if (mUserId && !dList.includes(mUserId)) dList.push(mUserId);
      localStorage.setItem("vba.disconnected_members", JSON.stringify(dList));

      const storedC = localStorage.getItem("vba.connected_members");
      const cList: string[] = storedC ? JSON.parse(storedC) : [];
      const nextC = cList.filter(
        (x) => String(x).toLowerCase() !== mCode && String(x).toLowerCase() !== mUserId,
      );
      localStorage.setItem("vba.connected_members", JSON.stringify(nextC));

      window.dispatchEvent(
        new CustomEvent("vba.connection.changed", {
          detail: { memberCode: m.code, userId: m.userId, connected: false },
        }),
      );
    } catch {
      /* ignore */
    }

    setDisconnectedSet((prev) => {
      const next = new Set(prev);
      next.add(mCode);
      if (mUserId) next.add(mUserId);
      return next;
    });
    setConnectedSet((prev) => {
      const next = new Set(prev);
      next.delete(mCode);
      if (mUserId) next.delete(mUserId);
      return next;
    });

    toast.success(`Đã xóa ${personDisplayName} khỏi danh bạ`);

    if (m.userId) {
      try {
        await disconnect.mutateAsync({ targetPersonNodeId: m.userId });
      } catch (err) {
        console.warn("Backend disconnect notice:", err);
      }
    }
  };

  const handleOpenChat = (peerCode: string, peerName: string) => {
    void navigate({
      to: "/association/messages",
      search: { peerCode, peerName },
    });
  };

  const handleCallPhone = (phone?: string | null, name?: string) => {
    if (!phone) {
      toast.info(`Hội viên ${name || ""} chưa công khai số điện thoại`);
      return;
    }
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  };

  const scrollToLetter = (letter: string) => {
    setActiveAlphabet(letter);
    const targetElement = document.getElementById(`section-letter-${letter}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => setActiveAlphabet(null), 1000);
  };

  return (
    <div className="vba-animate pb-24 relative min-h-screen">
      <MemberHeader title="Danh bạ CEO 1983" back />

      {/* Thanh tìm kiếm phong cách Danh bạ điện thoại */}
      <div className="px-3 sm:px-4 pt-3 flex items-center gap-2 w-full max-w-full overflow-hidden">
        <div
          id="tour-members-search"
          className="flex-1 min-w-0 flex items-center gap-2.5 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 px-3.5 py-2.5 shadow-xs focus-within:border-[#003B95] dark:focus-within:border-amber-400/80 transition-all"
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              tab === "connected"
                ? "Tìm theo tên CEO, công ty, SĐT trong danh bạ..."
                : "Tìm kiếm hội viên, ngành nghề..."
            }
            className="w-full min-w-0 bg-transparent text-[13px] text-slate-900 dark:text-white border-0 outline-none ring-0 placeholder:text-slate-400 truncate"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 p-0.5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nút Mời hội viên / Thêm kết nối */}
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="shrink-0 flex items-center gap-1.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] px-3.5 py-2.5 text-[12px] font-bold text-white shadow-md active:scale-95 transition cursor-pointer whitespace-nowrap"
          title="Mời hội viên tham gia danh bạ CEO"
        >
          <UserPlus className="h-4 w-4 text-amber-300 shrink-0" />
          <span className="hidden sm:inline">Thêm CEO</span>
        </button>
      </div>

      {/* 4 Tabs Điều Hướng Danh Bạ */}
      <div
        id="tour-members-filter"
        className="flex gap-2 px-3 sm:px-4 pt-3 overflow-x-auto no-scrollbar select-none"
      >
        <button
          onClick={() => handleSelectTab("connected")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "connected"
              ? "bg-[#003B95] text-white shadow-sm ring-1 ring-[#003B95]"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 text-amber-300" />
          <span>Danh bạ ({connectedMembers.length})</span>
        </button>

        <button
          onClick={() => handleSelectTab("discover")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "discover"
              ? "bg-[#003B95] text-white shadow-sm ring-1 ring-[#003B95]"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Khám phá ({discoverMembers.length})</span>
        </button>

        <button
          onClick={() => handleSelectTab("sent")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "sent"
              ? "bg-[#003B95] text-white shadow-sm ring-1 ring-[#003B95]"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Lời mời ({sentList.length})</span>
        </button>

        <button
          onClick={() => handleSelectTab("meetings")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "meetings"
              ? "bg-[#003B95] text-white shadow-sm ring-1 ring-[#003B95]"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Handshake className="h-3.5 w-3.5 text-amber-500" />
          <span>Lịch hẹn ({meetingsList.length})</span>
        </button>
      </div>

      {/* Nội dung danh bạ chính */}
      <div className="mt-3 px-3 sm:px-4">
        {loading && (
          <div className="py-12 text-center text-[13px] text-slate-400 space-y-2">
            <div className="h-6 w-6 border-2 border-[#003B95] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Đang tải danh bạ CEO 1983...</p>
          </div>
        )}

        {/* ── TAB 1: DANH BẠ ĐIỆN THOẠI CEO (CHỈ HIỆN NGƯỜI ĐÃ KẾT NỐI, NHÓM A-Z) ── */}
        {tab === "connected" && !loading && (
          <div className="relative">
            {connectedMembers.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="h-16 w-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-amber-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shadow-xs">
                  <Phone className="h-8 w-8" />
                </div>
                <div className="max-w-xs mx-auto space-y-1.5">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                    Danh bạ CEO chưa có liên hệ nào
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Chỉ những CEO đã được kết nối với tài khoản mới xuất hiện trong danh bạ cá nhân
                    của bạn để bảo mật và tối ưu giao thương.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTab("discover")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white px-4 py-2.5 text-[12px] font-bold shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Compass className="h-4 w-4 text-amber-300" />
                    <span>Tìm CEO để kết nối ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-[12px] font-bold transition active:scale-95 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                    <span>Mời & Quét mã</span>
                  </button>
                </div>
              </div>
            ) : filteredConnected.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-[13px] font-medium text-slate-500">
                  Không tìm thấy liên hệ nào khớp với từ khóa "{q}" trong danh bạ.
                </p>
              </div>
            ) : (
              <div className="pr-6 sm:pr-8 space-y-5">
                {existingLetters.map((letter) => {
                  const letterMembers = groupedConnected[letter] || [];
                  return (
                    <div
                      key={letter}
                      id={`section-letter-${letter}`}
                      className="scroll-mt-14 space-y-2"
                    >
                      {/* Tiêu đề nhóm chữ cái A-Z kiểu Danh bạ điện thoại */}
                      <div className="sticky top-12 z-10 flex items-center gap-2 py-1 bg-white/95 dark:bg-[#0A1A3A]/95 backdrop-blur-md">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-[#003B95] text-white text-[12px] font-black shadow-xs">
                          {letter}
                        </span>
                        <div className="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
                        <span className="text-[11px] font-semibold text-slate-400">
                          {letterMembers.length} liên hệ
                        </span>
                      </div>

                      {/* Danh sách thẻ liên hệ trong chữ cái này */}
                      <div className="space-y-2">
                        {letterMembers.map((m) => {
                          const avatarResolved = m.avatar ? resolveMediaUrl(m.avatar) : null;
                          const personDisplayName =
                            m.contact ||
                            m.personName ||
                            (m.type === "individual" ? m.name : "Đại diện Doanh nghiệp");
                          const companyDisplayName =
                            m.type === "company" ? m.name : m.company || "";

                          return (
                            <div
                              key={m.code}
                              className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3 bg-white dark:bg-[#131a26] shadow-xs hover:border-[#003B95]/40 dark:hover:border-amber-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              {/* Thông tin CEO bên trái */}
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMember(m)}
                                  className="relative shrink-0 block cursor-pointer"
                                  title="Xem hồ sơ CEO"
                                >
                                  {avatarResolved ? (
                                    <img
                                      src={avatarResolved}
                                      alt={personDisplayName}
                                      className="h-12 w-12 rounded-full object-cover ring-2 ring-[#003B95]/20 dark:ring-amber-400/30"
                                      onError={(e) => {
                                        e.currentTarget.src = "/ceo1983-logo.png";
                                      }}
                                    />
                                  ) : (
                                    <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 ring-2 ring-[#003B95]/20 font-bold text-sm">
                                      {personDisplayName.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                  <span
                                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131a26]"
                                    title="Đã kết nối"
                                  />
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMember(m)}
                                      className="truncate text-[14px] font-bold text-slate-900 dark:text-white hover:text-[#003B95] dark:hover:text-amber-400 transition-colors text-left cursor-pointer"
                                    >
                                      {personDisplayName}
                                    </button>
                                    <span className="rounded-md bg-[#003B95] px-1.5 py-0.2 text-[9px] font-black text-white shadow-2xs">
                                      {m.code}
                                    </span>
                                  </div>

                                  {companyDisplayName ? (
                                    <p className="truncate text-[11.5px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                      <Building2 className="h-3 w-3 text-[#003B95] dark:text-amber-400 shrink-0" />
                                      <span>{companyDisplayName}</span>
                                    </p>
                                  ) : null}

                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                    <span className="truncate">
                                      {m.personTitle || m.industry || "Hội viên CEO 1983"}
                                    </span>
                                    {m.phone && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                          {m.phone}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 4 Nút Thao Tác Nhanh Kiểu Danh Bạ Điện Thoại */}
                              <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 shrink-0">
                                {/* Nút Gọi điện thoại nhanh */}
                                <button
                                  type="button"
                                  onClick={() => handleCallPhone(m.phone, personDisplayName)}
                                  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-600 hover:text-white transition active:scale-95 cursor-pointer shadow-2xs"
                                  title={`Gọi điện thoại: ${m.phone || "Chưa có số"}`}
                                >
                                  <PhoneCall className="h-4 w-4 stroke-[2.2]" />
                                </button>

                                {/* Nút Nhắn tin trao đổi */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenChat(m.code, personDisplayName)}
                                  className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition active:scale-95 cursor-pointer shadow-xs group"
                                  title="Nhắn tin giao thương"
                                >
                                  <MessageSquare className="h-4.5 w-4.5 stroke-[2.6] fill-blue-600/25 group-hover:fill-white/30 group-hover:text-white text-blue-700 dark:text-blue-300 transition-colors" />
                                </button>

                                {/* Nút Xem Thẻ 83 / Hồ sơ */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedMember(m)}
                                  className="grid h-9 w-9 place-items-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/80 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 cursor-pointer shadow-2xs"
                                  title="Xem danh thiếp số / Thẻ 83"
                                >
                                  <CreditCard className="h-4 w-4 stroke-[2.2]" />
                                </button>

                                {/* Nút Hẹn gặp 1-1 */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConnectTarget({
                                      code: m.code,
                                      name: personDisplayName,
                                      company: (companyDisplayName || m.company) ?? undefined,
                                      title: (m.personTitle || m.industry) ?? undefined,
                                      avatar: m.avatar ?? undefined,
                                      industry: m.industry ?? undefined,
                                      userId: m.userId ?? undefined,
                                    })
                                  }
                                  className="grid h-9 w-9 place-items-center rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/80 hover:bg-purple-600 hover:text-white transition active:scale-95 cursor-pointer shadow-2xs"
                                  title="Hẹn gặp kết nối 1-on-1"
                                >
                                  <Handshake className="h-4 w-4 stroke-[2.2]" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Chân danh bạ: Tổng kết số lượng liên hệ */}
                <div className="pt-6 pb-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shadow-2xs">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Tổng cộng {filteredConnected.length} CEO đã lưu trong danh bạ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Thanh Chỉ Mục A-Z Cuộn Nhanh Bên Cạnh Phải Màn Hình */}
            {connectedMembers.length > 0 && (
              <div className="fixed right-1 sm:right-2 top-36 z-30 flex flex-col items-center justify-center select-none py-1.5 px-0.5 rounded-full bg-white/80 dark:bg-[#001B54]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 shadow-md text-[9px] font-black">
                {ALPHABET_INDEX.map((char) => {
                  const hasEntries = existingLetters.includes(char);
                  return (
                    <button
                      key={char}
                      type="button"
                      disabled={!hasEntries}
                      onClick={() => scrollToLetter(char)}
                      className={`h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeAlphabet === char
                          ? "bg-amber-400 text-slate-950 font-bold scale-125"
                          : hasEntries
                            ? "text-[#003B95] dark:text-amber-300 hover:scale-115 font-bold"
                            : "text-slate-300 dark:text-slate-600 opacity-40 cursor-default"
                      }`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: KHÁM PHÁ HỘI VIÊN CHƯA KẾT NỐI (ĐỂ GỬI LỜI MỜI) ── */}
        {tab === "discover" && !loading && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5">
              <Compass className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Khám phá các CEO trong CLB Doanh Nhân CEO 1983. Khi bạn gửi lời mời và đối tác đồng
                ý, liên hệ sẽ tự động lưu vào <strong>Danh bạ CEO</strong> chính thức của bạn.
              </p>
            </div>

            {filteredDiscover.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-[13px] font-medium text-slate-500">
                  {q
                    ? "Không tìm thấy hội viên phù hợp với từ khóa."
                    : "Bạn đã kết nối với tất cả các hội viên trong câu lạc bộ!"}
                </p>
              </div>
            ) : (
              filteredDiscover.map((m) => {
                const avatarResolved = m.avatar ? resolveMediaUrl(m.avatar) : null;
                const personDisplayName =
                  m.contact ||
                  m.personName ||
                  (m.type === "individual" ? m.name : "Đại diện Doanh nghiệp");
                const companyDisplayName = m.type === "company" ? m.name : "";
                const targetId = (m.userId || m.code).toLowerCase();
                const isOutgoing = Boolean(
                  (m.userId && outgoingMap.has(m.userId.toLowerCase())) ||
                  localPending.has(targetId),
                );

                return (
                  <div
                    key={m.code}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-white dark:bg-[#131a26] shadow-xs flex items-center justify-between gap-3 hover:border-[#003B95]/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="relative shrink-0 block cursor-pointer"
                      >
                        {avatarResolved ? (
                          <img
                            src={avatarResolved}
                            alt={personDisplayName}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-[#003B95]/20"
                            onError={(e) => {
                              e.currentTarget.src = "/ceo1983-logo.png";
                            }}
                          />
                        ) : (
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 ring-2 ring-[#003B95]/20 font-bold text-sm">
                            {personDisplayName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedMember(m)}
                            className="truncate text-[14px] font-bold text-slate-900 dark:text-white hover:text-[#003B95] dark:hover:text-amber-400 transition-colors text-left cursor-pointer"
                          >
                            {personDisplayName}
                          </button>
                          <span className="rounded-md bg-[#003B95] px-1.5 py-0.2 text-[9px] font-black text-white shadow-2xs">
                            {m.code}
                          </span>
                        </div>
                        {companyDisplayName && (
                          <p className="truncate text-[11.5px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                            {companyDisplayName}
                          </p>
                        )}
                        <p className="truncate text-[11px] text-slate-400 mt-0.5">
                          {m.personTitle || m.industry || "Hội viên CEO 1983"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isOutgoing ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-[#003B95] dark:text-blue-300 text-[11px] font-bold">
                          <Clock className="h-3 w-3" />
                          <span>Đã gửi</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnect(m)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white px-3 py-1.5 text-[11px] font-bold shadow-xs active:scale-95 transition cursor-pointer"
                        >
                          <UserPlus className="h-3.5 w-3.5 text-amber-300" />
                          <span>Kết nối</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB 3: LỜI MỜI KẾT NỐI ĐÃ GỬI ── */}
        {tab === "sent" && !loading && (
          <div className="space-y-3">
            {sentList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  Bạn chưa có lời mời kết nối nào đang chờ.
                </p>
              </div>
            ) : (
              sentList.map((item) => (
                <div
                  key={item.id || item.code}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-white dark:bg-[#131a26] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/40 grid place-items-center text-[#003B95] font-bold text-sm">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 truncate">{item.company}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Gửi lúc: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancelSentRequest(item)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                      >
                        Thu hồi
                      </button>
                    )}
                    {item.status === "accepted" && (
                      <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-600">
                        Đã đồng ý
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: LỊCH HẸN GẶP GỠ 1-ON-1 ── */}
        {tab === "meetings" && !loading && (
          <div className="space-y-3">
            {loadingMeetings ? (
              <div className="py-12 text-center text-[13px] text-slate-400">
                Đang tải lịch hẹn...
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Handshake className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
                <p className="text-[13px] font-medium text-slate-500">
                  Bạn chưa có lịch hẹn gặp 1-on-1 nào.
                </p>
              </div>
            ) : (
              filteredMeetings.map((meet) => {
                return (
                  <div
                    key={meet.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 bg-white dark:bg-[#131a26] shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                      <span className="text-[12px] font-bold text-[#003B95] dark:text-amber-400 truncate">
                        {meet.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {meet.date} {meet.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Đối tác: {meet.partnerName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {meet.venue || "Văn phòng Hiệp hội"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenChat(meet.partnerCode || meet.partnerName, meet.partnerName)
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-[#003B95] text-white text-[11px] font-bold shadow-xs active:scale-95"
                        >
                          Nhắn tin
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={selectedMember}
        initialConnected={selectedMember ? checkIsFriend(selectedMember) : false}
        onClose={() => setSelectedMember(null)}
        onMessage={(m) => {
          const pName = m.contact || m.personName || m.name;
          setSelectedMember(null);
          handleOpenChat(m.code, pName);
        }}
        onConnect={(m) => handleConnect(m)}
        onDisconnect={(m) => handleDisconnect(m)}
      />

      {/* Invite New Member Modal */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        memberCode={myMember?.code || "M1983-292"}
        memberName={myMember?.name || "Lãnh đạo Doanh nghiệp"}
      />

      {/* Business Meeting Connection Bottom Sheet */}
      <BusinessConnectBottomSheet
        isOpen={Boolean(connectTarget)}
        target={connectTarget}
        onClose={() => setConnectTarget(null)}
        onSuccess={() => void reloadMembers()}
      />
    </div>
  );
}
