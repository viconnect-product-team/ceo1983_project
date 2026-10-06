import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
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
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMembers, getMyMember, type DirectoryMember, type MyMember } from "@/lib/member-app.functions";
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
import { BusinessConnectBottomSheet, type BusinessConnectTarget } from "@/components/common/BusinessConnectBottomSheet";

export const Route = createFileRoute("/association/members")({
  component: MembersScreen,
});

export type FilterTab = "all" | "connected" | "sent" | "meetings";

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
  status: "scheduled" | "completed" | "cancelled" | "pending" | string;
  createdAt?: string;
}

const DEFAULT_SAMPLE_MEETINGS: MemberMeetingItem[] = [
  {
    id: "sample-meet-1",
    title: "Gặp gỡ kết nối 1-on-1 & Hợp tác thương mại",
    partnerName: "Đỗ Kim Phượng",
    partnerCompany: "Công ty Cổ phần Công nghệ & Dược phẩm Quốc tế",
    partnerCode: "CEO-1983-002",
    partnerAvatar: "/avatars/avatar-2.jpg",
    date: "2026-10-18",
    time: "09:30 - 10:45",
    venueType: "offline",
    venue: "Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội",
    notes: "Trao đổi phân phối độc quyền và ký kết biên bản ghi nhớ hợp tác chiến lược Q4/2026.",
    status: "completed",
  },
  {
    id: "sample-meet-2",
    title: "Cà phê Doanh nhân & Giao lưu kết nối B2B",
    partnerName: "Nguyễn Văn Dũng",
    partnerCompany: "Tập đoàn Đầu tư & Xây dựng Thăng Long 83",
    partnerCode: "CEO-1983-005",
    partnerAvatar: "/avatars/avatar-1.jpg",
    date: "2026-10-24",
    time: "14:00 - 15:30",
    venueType: "offline",
    venue: "Starbucks Coffee - Tòa Capital Place, 29 Liễu Giai, Hà Nội",
    notes: "Thảo luận về gói thầu nội thất văn phòng và cung ứng vật tư xây dựng cao cấp.",
    status: "scheduled",
  },
  {
    id: "sample-meet-3",
    title: "Họp trực tuyến: Demo giải pháp chuyển đổi số AI",
    partnerName: "Trần Mai Lan",
    partnerCompany: "Công ty CP Giải pháp Công nghệ Thông tin ViConnect",
    partnerCode: "CEO-1983-012",
    date: "2026-10-28",
    time: "10:00 - 11:00",
    venueType: "online",
    venue: "Zoom Meeting ID: 839 1983 2026 (Pass: 1983)",
    onlineUrl: "https://zoom.us/j/83919832026",
    notes: "Demo hệ thống tích hợp Thẻ thông minh NFC và phần mềm quản trị doanh nghiệp CEO 1983.",
    status: "scheduled",
  },
];

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

function MembersScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fetchMembers = useServerFn(listMembers);
  const fetchMyMember = useServerFn(getMyMember);
  const { data: members, loading, reload: reloadMembers } = useServerData<DirectoryMember[]>(() => fetchMembers(), []);
  const { data: myMember } = useServerData<MyMember | null>(() => fetchMyMember(), null);

  const [q, setQ] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("q") || params.get("company") || "";
    }
    return "";
  });
  const [tab, setTab] = useState<FilterTab>(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "meetings" || t === "connected" || t === "sent" || t === "all") {
        return t as FilterTab;
      }
    }
    return "all";
  });

  const handleSelectTab = (newTab: FilterTab) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newTab === "all") {
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
      if (t === "meetings" || t === "connected" || t === "sent" || t === "all") {
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

  // Lịch sử cuộc gặp 1-on-1 state
  const [meetingsList, setMeetingsList] = useState<MemberMeetingItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SAMPLE_MEETINGS;
    try {
      const stored = localStorage.getItem("vba_connection_appointments");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SAMPLE_MEETINGS;
    } catch {
      return DEFAULT_SAMPLE_MEETINGS;
    }
  });
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchMeetings = async () => {
      try {
        setLoadingMeetings(true);
        const res = await fetchNestApi<MemberMeetingItem[]>("/meetings/connection-appointments").catch(() => null);
        if (active && Array.isArray(res) && res.length > 0) {
          setMeetingsList(res);
          try {
            localStorage.setItem("vba_connection_appointments", JSON.stringify(res));
          } catch {}
        }
      } catch (err) {
        console.warn("fetchMeetings error:", err);
      } finally {
        if (active) setLoadingMeetings(false);
      }
    };
    fetchMeetings();
    return () => {
      active = false;
    };
  }, []);

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
          (m.code && m.code.toLowerCase() === targetLower)
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
      return stored ? new Set(JSON.parse(stored).map((s: string) => String(s).toLowerCase())) : new Set();
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
        const res = await fetchNestApi<Array<{ id: string; counterpartUserId: string }>>("/network/connections");
        if (active && Array.isArray(res)) {
          const uids = new Set<string>();
          for (const item of res) {
            if (item?.counterpartUserId) {
              uids.add(String(item.counterpartUserId).toLowerCase());
            }
          }
          setBackendConnectedUserIds(uids);
        }
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  const [localSentRequests, setLocalSentRequests] = useState<Array<{
    id: string;
    targetUserId?: string | null;
    targetCode: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
  }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("vba_sent_connection_requests");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveLocalSentRequests = (list: typeof localSentRequests) => {
    setLocalSentRequests(list);
    try {
      localStorage.setItem("vba_sent_connection_requests", JSON.stringify(list));
    } catch {}
  };

  useEffect(() => {
    const handleConnChange = () => {
      try {
        const storedD = localStorage.getItem("vba.disconnected_members");
        setDisconnectedSet(storedD ? new Set(JSON.parse(storedD).map((s: string) => String(s).toLowerCase())) : new Set());
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
      } catch {}
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
    const isExplicitlyDisconnected = disconnectedSet.has(mCode) || (mUserId && disconnectedSet.has(mUserId));
    if (isExplicitlyDisconnected) return false;
    const isExplicitlyConnected = connectedSet.has(mCode) || (mUserId && connectedSet.has(mUserId));
    if (isExplicitlyConnected) return true;
    if (mUserId && backendConnectedUserIds.has(mUserId)) return true;
    return Boolean(m.userId && connectedMap.has(mUserId));
  };

  const filtered = useMemo(() => {
    const normTerm = normalizeSearchText(q);
    return members.filter((m) => {
      // Exclude self
      if (myMember?.code && m.code.toLowerCase() === myMember.code.toLowerCase()) {
        return false;
      }

      const searchable = normalizeSearchText([
        m.name,
        m.contact,
        (m as any).personName,
        (m as any).companyName,
        (m as any).company,
        m.industry,
        m.region,
        m.code,
        (m as any).title,
        (m as any).personTitle,
        (m as any).phone,
        (m as any).email,
      ].filter(Boolean).join(" "));

      const matchesSearch = !normTerm || searchable.includes(normTerm);
      if (!matchesSearch) return false;

      // Tab filter
      if (tab === "connected") {
        return checkIsFriend(m);
      }
      return true;
    });
  }, [members, q, tab, myMember, connectedMap, outgoingMap, incomingMap, localPending, disconnectedSet, connectedSet, backendConnectedUserIds]);

  const connectedMembersCount = useMemo(() => {
    return members.filter((m) => {
      if (myMember?.code && m.code.toLowerCase() === myMember.code.toLowerCase()) return false;
      return checkIsFriend(m);
    }).length;
  }, [members, myMember, disconnectedSet, connectedSet, connectedMap, backendConnectedUserIds]);

  const filteredMeetings = useMemo(() => {
    const normTerm = normalizeSearchText(q);
    if (!normTerm) return meetingsList;
    return meetingsList.filter((m) => {
      const searchable = normalizeSearchText([
        m.title,
        m.partnerName,
        m.partnerCompany,
        m.partnerCode,
        m.partnerPhone,
        m.hostName,
        m.hostCompany,
        m.venue,
        m.notes,
      ].filter(Boolean).join(" "));
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
      const tid = (req as any).recipientUserId || (req as any).targetPersonNodeId || req.recipient?.userId || req.recipient?.personNodeId;
      const tidClean = String(tid || "").replace(/^u:/, "").toLowerCase();
      const m = members.find((x) => 
        (x.userId && x.userId.toLowerCase() === tidClean) ||
        (x.code && x.code.toLowerCase() === tidClean)
      );

      const isConn = m ? checkIsFriend(m) : false;
      const reqStatus: "pending" | "accepted" | "rejected" = isConn
        ? "accepted"
        : req.status === "accepted"
        ? "accepted"
        : (req.status === "declined" || (req.status as any) === "rejected")
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
      const m = members.find((x) => 
        (x.code && x.code.toLowerCase() === key) ||
        (x.userId && x.userId.toLowerCase() === key)
      );
      const isConn = m ? checkIsFriend(m) : false;
      const finalStatus: "pending" | "accepted" | "rejected" = isConn ? "accepted" : l.status;

      if (!map.has(key)) {
        map.set(key, {
          id: l.id,
          member: m || null,
          code: m?.code || l.targetCode,
          name: m?.contact || m?.personName || m?.name || (l as any).targetName || "Hội viên CEO 1983",
          company: (m?.type === "company" ? m?.name : m?.company) || (l as any).targetCompany || "CLB Doanh Nhân CEO 1983",
          title: m?.personTitle || m?.industry || (l as any).targetTitle || "Doanh nhân",
          avatar: m?.avatar ? resolveMediaUrl(m.avatar) : ((l as any).targetAvatar ? resolveMediaUrl((l as any).targetAvatar) : null),
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
        if ((l as any).opportunityTitle && !existing.opportunityTitle) existing.opportunityTitle = (l as any).opportunityTitle;
      }
    }

    // 3. Process localPending
    for (const p of localPending) {
      const key = p.toLowerCase();
      if (!map.has(key)) {
        const m = members.find((x) => 
          (x.code && x.code.toLowerCase() === key) ||
          (x.userId && x.userId.toLowerCase() === key)
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
    const allItems = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!term) return allItems;
    return allItems.filter((i) => i.name.toLowerCase().includes(term) || i.company.toLowerCase().includes(term) || i.code.toLowerCase().includes(term));
  }, [outgoing, localSentRequests, localPending, members, connectedSet, disconnectedSet, connectedMap, q]);

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

      const nextLocal = localSentRequests.filter((r) => 
        r.id !== item.id && 
        r.targetCode?.toLowerCase() !== item.code.toLowerCase() &&
        (!item.userId || r.targetUserId?.toLowerCase() !== item.userId.toLowerCase())
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

    // Clear disconnected status and register connection in localStorage
    try {
      const storedD = localStorage.getItem("vba.disconnected_members");
      const dList: string[] = storedD ? JSON.parse(storedD) : [];
      const nextD = dList.filter((c) => String(c).toLowerCase() !== mCode && String(c).toLowerCase() !== mUserId);
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
    } catch {}

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
      const newSent = [
        {
          id: `sent-${Date.now()}`,
          targetUserId: m.userId,
          targetCode: m.code,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
        },
        ...localSentRequests.filter((r) => r.targetCode.toLowerCase() !== m.code.toLowerCase()),
      ];
      saveLocalSentRequests(newSent);
    };

    try {
      await fetchNestApi<any>("/network/requests", {
        method: "POST",
        body: JSON.stringify({
          targetUserId: target,
          memberCode: m.code,
          message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối cùng bạn!`,
        }),
      });
      setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
      registerSent();
      toast.success(`Đã gửi lời mời kết nối tới ${displayName}`);
    } catch {
      try {
        if (m.userId) {
          await sendRequest.mutateAsync({
            targetPersonNodeId: m.userId,
            message: `Xin chào, tôi là ${myMember?.name || "Hội viên"} thuộc Hiệp hội Doanh nhân CEO 1983. Rất mong được kết nối cùng bạn!`,
          });
          setLocalPending((prev) => new Set(prev).add(target.toLowerCase()));
          registerSent();
          toast.success(`Đã gửi lời mời kết nối tới ${displayName}`);
          return;
        }
      } catch {}
      toast.error("Không thể gửi lời mời kết nối");
    }
  };

  const handleCancelInvite = async (requestId: string, memberName: string) => {
    try {
      await cancelRequest.mutateAsync({ requestId });
      toast.success(`Đã hủy lời mời gửi tới ${memberName}`);
    } catch {
      toast.error("Không thể hủy lời mời");
    }
  };

  const handleAcceptInvite = async (requestId: string, memberName: string) => {
    try {
      await acceptRequest.mutateAsync({ requestId });
      toast.success(`Đã đồng ý kết nối với ${memberName}`);
    } catch {
      toast.error("Không thể đồng ý kết nối");
    }
  };

  const handleDisconnect = async (m: DirectoryMember) => {
    const personDisplayName = m.contact || m.personName || m.name;
    if (!window.confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${personDisplayName}?`)) return;

    const mCode = m.code.toLowerCase();
    const mUserId = (m.userId || "").toLowerCase();

    // 1. Cập nhật localStorage ngay lập tức
    try {
      const storedD = localStorage.getItem("vba.disconnected_members");
      const dList: string[] = storedD ? JSON.parse(storedD) : [];
      if (!dList.includes(mCode)) dList.push(mCode);
      if (mUserId && !dList.includes(mUserId)) dList.push(mUserId);
      localStorage.setItem("vba.disconnected_members", JSON.stringify(dList));

      const storedC = localStorage.getItem("vba.connected_members");
      const cList: string[] = storedC ? JSON.parse(storedC) : [];
      const nextC = cList.filter((x) => String(x).toLowerCase() !== mCode && String(x).toLowerCase() !== mUserId);
      localStorage.setItem("vba.connected_members", JSON.stringify(nextC));

      window.dispatchEvent(
        new CustomEvent("vba.connection.changed", {
          detail: { memberCode: m.code, userId: m.userId, connected: false },
        }),
      );
    } catch {}

    // 2. Cập nhật state nội bộ
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

    toast.success(`Đã hủy kết bạn với ${personDisplayName}`);

    // 3. Gọi backend nếu có userId
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

  return (
    <div className="vba-animate pb-24">
      <MemberHeader title={t("m.members.title")} back />

      {/* Search Input & Invite Button */}
      <div className="px-3 sm:px-4 pt-3 flex items-center gap-2 w-full max-w-full overflow-hidden">
        <div id="tour-members-search" className="flex-1 min-w-0 flex items-center gap-2 rounded-2xl border-0 bg-slate-100 dark:bg-white/[0.06] px-3 sm:px-4 py-2 sm:py-2.5 shadow-none">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm hội viên, ngành nghề..."
            className="borderless-search-input w-full min-w-0 bg-transparent text-[13px] text-slate-900 dark:text-white border-0 outline-none ring-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 truncate"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nút Mời vào CLB CEO 1983 */}
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="shrink-0 flex items-center gap-1 sm:gap-1.5 rounded-2xl bg-[#003B95] hover:bg-[#002B70] px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-bold text-white shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
          title="Mời vào CLB CEO 1983"
        >
          <UserPlus className="h-4 w-4 text-white shrink-0" />
          <span className="hidden md:inline">Mời vào CLB CEO 1983</span>
          <span className="hidden sm:inline md:hidden">Mời vào CLB</span>
          <span className="sm:hidden">Mời vào</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div id="tour-members-filter" className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSelectTab("all")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer ${
            tab === "all"
              ? "bg-[#003B95] text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          Tất cả ({members.length})
        </button>
        <button
          onClick={() => handleSelectTab("connected")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "connected"
              ? "bg-[#003B95] text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Bạn bè ({connectedMembersCount})
        </button>
        <button
          onClick={() => handleSelectTab("sent")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "sent"
              ? "bg-[#003B95] text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Đã gửi kết nối ({sentList.length})
        </button>
        <button
          onClick={() => handleSelectTab("meetings")}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            tab === "meetings"
              ? "bg-[#003B95] text-white shadow-xs"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Handshake className="h-3.5 w-3.5 text-amber-500" />
          Hẹn gặp kết nối ({meetingsList.length})
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite" data-testid="members-announcement">
        {loading
          ? t("m.members.announce.loading")
          : t("m.members.announce.count", {
              count: tab === "sent" ? sentList.length : tab === "meetings" ? filteredMeetings.length : filtered.length,
            })}
      </p>

      {/* Members List */}
      <div
        className="mt-3 space-y-2.5 px-4"
        role="list"
        aria-live="polite"
        aria-busy={loading}
        aria-label={t("m.members.title")}
      >
        {loading && (
          <p className="py-10 text-center text-[13px] text-slate-400">
            {t("m.members.loading")}
          </p>
        )}

        {tab === "meetings" ? (
          loadingMeetings ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="h-8 w-8 text-blue-500 animate-spin mx-auto opacity-75" />
              <p className="text-[13px] text-slate-500 dark:text-slate-400">Đang tải lịch sử cuộc gặp...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Handshake className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Bạn chưa có cuộc gặp 1-on-1 nào. Hãy gửi lời mời kết nối và hẹn gặp gỡ các hội viên CEO 1983!
              </p>
            </div>
          ) : (
            filteredMeetings.map((meet) => {
              const matchedMember = members.find(
                (m) =>
                  (meet.partnerCode && m.code.toLowerCase() === meet.partnerCode.toLowerCase()) ||
                  (meet.partnerName &&
                    (m.name.toLowerCase().includes(meet.partnerName.toLowerCase()) ||
                      (m.contact && m.contact.toLowerCase().includes(meet.partnerName.toLowerCase())))),
              );
              const partnerAvatar = meet.partnerAvatar
                ? resolveMediaUrl(meet.partnerAvatar)
                : matchedMember?.avatar
                ? resolveMediaUrl(matchedMember.avatar)
                : null;
              const isOnline =
                meet.venueType === "online" || Boolean(meet.venue && meet.venue.toLowerCase().includes("zoom"));
              const isCompleted = meet.status === "completed" || meet.status === "done";
              const isScheduled = meet.status === "scheduled" || meet.status === "confirmed";
              const isCancelled = meet.status === "cancelled";

              return (
                <div
                  key={meet.id}
                  role="listitem"
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 transition hover:border-[#001B54]/40 bg-white dark:bg-[#131a26] shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        <Calendar className="h-3 w-3 text-[#003B95] dark:text-blue-400" />
                        <span>{meet.date}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{meet.time}</span>
                      </span>
                    </div>

                    <div>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-2xs">
                          <Check className="h-3 w-3" />
                          <span>Đã diễn ra</span>
                        </span>
                      )}
                      {isScheduled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 shadow-2xs">
                          <Clock className="h-3 w-3 animate-pulse" />
                          <span>Sắp diễn ra</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 shadow-2xs">
                          <X className="h-3 w-3" />
                          <span>Đã hủy</span>
                        </span>
                      )}
                      {!isCompleted && !isScheduled && !isCancelled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-2xs">
                          <Clock className="h-3 w-3" />
                          <span>Chờ xác nhận</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Partner & Meeting Details */}
                  <div className="flex items-start gap-3 mt-3">
                    <div className="relative shrink-0">
                      {partnerAvatar ? (
                        <img
                          src={partnerAvatar}
                          alt={meet.partnerName}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-[#001B54]/20"
                          onError={(e) => {
                            e.currentTarget.src = "/ceo1983-logo.png";
                          }}
                        />
                      ) : (
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-300 ring-2 ring-[#001B54]/20 font-bold text-sm">
                          <User className="h-5 w-5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate text-[13.5px] font-bold text-slate-900 dark:text-white">
                          {meet.partnerName}
                        </span>
                        {meet.partnerCode && (
                          <span className="rounded-md bg-[#001B54] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white shadow-xs shrink-0 tracking-wide">
                            {meet.partnerCode}
                          </span>
                        )}
                      </div>

                      {meet.partnerCompany && (
                        <p className="truncate text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-[#001B54] dark:text-blue-300 shrink-0" />
                          <span>{meet.partnerCompany}</span>
                        </p>
                      )}

                      <h4 className="text-[12px] font-bold text-[#003B95] dark:text-blue-300 mt-1.5">
                        {meet.title}
                      </h4>

                      {/* Location / Zoom */}
                      <div className="mt-1 flex items-start gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                        {isOnline ? (
                          <Video className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <span className="line-clamp-2">{meet.venue || "Văn phòng Hiệp hội CEO 1983"}</span>
                      </div>

                      {meet.notes && (
                        <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="font-bold text-[#001B54] dark:text-blue-300 mr-1">Mục đích:</span>
                          <span>{meet.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      Gặp gỡ 1-on-1 CEO 1983
                    </span>

                    <div className="flex items-center gap-2">
                      {matchedMember && (
                        <button
                          type="button"
                          onClick={() => setSelectedMember(matchedMember)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          <span>Hồ sơ</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenChat(
                            meet.partnerCode || matchedMember?.code || meet.partnerName,
                            meet.partnerName,
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Nhắn tin</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : tab === "sent" ? (
          sentList.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Bạn chưa gửi lời mời kết nối nào. Hãy tìm kiếm và kết nối với các hội viên CEO 1983!
              </p>
            </div>
          ) : (
            sentList.map((item) => (
              <div
                key={item.id || item.code}
                role="listitem"
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 transition hover:border-[#001B54]/40 bg-white dark:bg-[#131a26] shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-[#001B54]/20"
                        onError={(e) => {
                          e.currentTarget.src = "/ceo1983-logo.png";
                        }}
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-300 ring-2 ring-[#001B54]/20 font-bold text-sm">
                        <User className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate text-[14px] font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="rounded-md bg-[#001B54] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs shrink-0 tracking-wide">
                        {item.code}
                      </span>
                    </div>
                    {item.company && (
                      <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-[#001B54] dark:text-blue-300 shrink-0" />
                        <span>{item.company}</span>
                      </p>
                    )}
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.title}
                    </p>

                    {item.opportunityTitle && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                        <Briefcase className="h-3 w-3 text-[#001B54] dark:text-blue-400" />
                        <span>Cơ hội: {item.opportunityTitle}</span>
                      </div>
                    )}

                    {item.purpose && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-[#001B54] dark:text-blue-300 mr-1">Lời nhắn:</span>
                        <span>"{item.purpose}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <div>
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-2xs">
                        <Clock className="h-3 w-3 animate-pulse" />
                        <span>Đang chờ</span>
                      </span>
                    )}
                    {item.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-2xs">
                        <Check className="h-3 w-3" />
                        <span>Đã chấp nhận</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 shadow-2xs">
                        <X className="h-3 w-3" />
                        <span>Đã từ chối</span>
                      </span>
                    )}
                  </div>

                  <div>
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleCancelSentRequest(item)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5 text-[11.5px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                        title="Hủy yêu cầu kết nối"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Hủy</span>
                      </button>
                    )}
                    {item.status === "accepted" && (
                      <button
                        type="button"
                        onClick={() => handleOpenChat(item.code, item.name)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white px-3 py-1.5 text-[11.5px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Nhắn tin</span>
                      </button>
                    )}
                    {item.status === "rejected" && item.member && (
                      <button
                        type="button"
                        onClick={() => handleConnect(item.member!)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-500 px-3 py-1.5 text-[11.5px] font-bold transition active:scale-95 cursor-pointer"
                      >
                        <Handshake className="h-3.5 w-3.5 text-amber-500" />
                        <span>Gửi lại</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <>
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto opacity-50" />
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {tab === "connected"
                    ? "Bạn chưa có kết nối nào. Hãy gửi lời mời kết nối với các hội viên bên dưới!"
                    : "Không tìm thấy hội viên phù hợp."}
                </p>
              </div>
            )}

            {filtered.map((m, mIndex) => {
          const targetId = (m.userId || m.code).toLowerCase();
          const isFriend = checkIsFriend(m);
          const isOutgoing = Boolean(
            (m.userId && outgoingMap.has(m.userId.toLowerCase())) || localPending.has(targetId),
          );
          const isIncoming = Boolean(m.userId && incomingMap.has(m.userId.toLowerCase()));
          const outgoingReqId = m.userId ? outgoingMap.get(m.userId.toLowerCase()) : null;
          const incomingReqId = m.userId ? incomingMap.get(m.userId.toLowerCase()) : null;

          const avatarResolved = m.avatar ? resolveMediaUrl(m.avatar) : null;
          const personDisplayName =
            m.contact || m.personName || (m.type === "individual" ? m.name : "Đại diện Doanh nghiệp");
          const companyDisplayName = m.type === "company" ? m.name : "";

          return (
            <div
              key={m.code}
              role="listitem"
              id={mIndex === 0 ? "tour-members-card-item" : undefined}
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 p-3.5 transition hover:border-[#001B54]/40 bg-white dark:bg-[#131a26] shadow-xs"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with click to open profile */}
                <button
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className="relative shrink-0 block group cursor-pointer text-left"
                  title="Xem hồ sơ hội viên"
                >
                  {avatarResolved ? (
                    <img
                      src={avatarResolved}
                      alt={personDisplayName}
                      className="h-13 w-13 rounded-full object-cover ring-2 ring-[#001B54]/20 group-hover:ring-[#001B54]/50 transition-all"
                      onError={(e) => {
                        e.currentTarget.src = "/ceo1983-logo.png";
                      }}
                    />
                  ) : (
                    <span className="grid h-13 w-13 place-items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#001B54] dark:text-blue-300 ring-2 ring-[#001B54]/20 font-bold text-sm">
                      {m.type === "individual" ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </span>
                  )}
                  {m.verified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-[#001B54] fill-white dark:fill-slate-900" />
                  )}
                </button>

                {/* Member Info: Person Name + Company Name */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(m)}
                      className="truncate text-[14px] font-bold text-slate-900 dark:text-white hover:text-[#001B54] dark:hover:text-blue-300 transition-colors text-left cursor-pointer"
                    >
                      {personDisplayName}
                    </button>
                    <span className="rounded-md bg-[#001B54] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs shrink-0 tracking-wide">
                      {m.code}
                    </span>
                  </div>

                  {companyDisplayName && companyDisplayName !== personDisplayName ? (
                    <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 text-[#001B54] dark:text-blue-300 shrink-0" />
                      <span>{companyDisplayName}</span>
                    </p>
                  ) : null}

                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {[m.personTitle || m.industry, m.region].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              {/* Action Icons & Connection Row (Req 11 & Req 12) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                {/* Secondary Actions as sleek icons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenChat(m.code, personDisplayName)}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-[#001B54] dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                    title="Nhắn tin giao thương"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>

                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer"
                      title={`Gọi điện: ${m.phone}`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedMember(m)}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-[#001B54] dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                    title="Xem chi tiết hồ sơ hội viên"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </div>

                {/* Connection Lifecycle: Primary Action */}
                <div id={mIndex === 0 ? "tour-members-connect-btn" : undefined} className="flex items-center gap-1.5">
                  {isFriend ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(m)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition cursor-pointer group"
                      title="Chạm để hủy kết nối"
                    >
                      <Handshake className="h-3.5 w-3.5 group-hover:hidden text-emerald-500" />
                      <UserMinus className="h-3.5 w-3.5 hidden group-hover:block" />
                      <span className="group-hover:hidden">Đã kết nối</span>
                      <span className="hidden group-hover:inline">Hủy</span>
                    </button>
                  ) : isOutgoing ? (
                    <button
                      type="button"
                      onClick={() => outgoingReqId && handleCancelInvite(outgoingReqId, personDisplayName)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[11.5px] font-semibold text-[#001B54] dark:text-blue-300 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition cursor-pointer"
                      title="Chạm để thu hồi lời mời"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Đã gửi lời mời</span>
                    </button>
                  ) : isIncoming ? (
                    <button
                      type="button"
                      onClick={() => incomingReqId && handleAcceptInvite(incomingReqId, personDisplayName)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3.5 py-1.5 text-[11.5px] font-bold shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Đồng ý</span>
                    </button>
                  ) : (
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold px-3.5 py-1.5 text-[11.5px] shadow-sm active:scale-95 transition cursor-pointer"
                    >
                      <Handshake className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                      <span>Hẹn gặp kết nối</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
          </>
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
        memberCode={
          myMember?.code ||
          (typeof window !== "undefined"
            ? (() => {
                try {
                  const m = JSON.parse(localStorage.getItem("vba_my_member") || "null");
                  return m?.code || null;
                } catch {
                  return null;
                }
              })()
            : null) ||
          "M1983-292"
        }
        memberName={myMember?.name || "Lãnh đạo Doanh nghiệp"}
      />

      {/* Business Meeting Connection Bottom Sheet (Req 11) */}
      <BusinessConnectBottomSheet
        isOpen={Boolean(connectTarget)}
        target={connectTarget}
        onClose={() => setConnectTarget(null)}
        onSuccess={() => void reloadMembers()}
      />
    </div>
  );
}
