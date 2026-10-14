import { MEMBERS, type Member } from "./members-data";

export type ConnectionStatus = "connected" | "pending_outgoing" | "pending_incoming" | "none";

export type ChatAttachment = {
  id?: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type ChatMessage = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  at: string; // ISO
  readAt?: string | null;
  attachments?: ChatAttachment[];
  pinned?: boolean;
};

export type GroupChat = {
  id: string;
  name: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  description?: string;
  avatar?: string;
};

// The current logged-in member id, resolved server-side and hydrated below.
export let CURRENT_USER_ID = "";

let _statuses = new Map<string, ConnectionStatus>();
let _timestamps = new Map<string, string>();
let _messages: ChatMessage[] = [];
let _groupChats: GroupChat[] = [];

export function loadGroupChats(): GroupChat[] {
  if (typeof window === "undefined") return _groupChats;
  try {
    const raw = localStorage.getItem("ceo_group_chats");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        _groupChats = parsed;
        return _groupChats;
      }
    }
  } catch {}

  if (_groupChats.length === 0 && MEMBERS.length > 0) {
    _groupChats = [
      {
        id: "group-bxt-btt-1983",
        name: "Nhóm Ban Xúc Tiến & Ban Truyền Thông",
        memberIds: MEMBERS.slice(0, 6).map((m) => m.id),
        createdBy: CURRENT_USER_ID || "system",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        description: "Phối hợp công tác xúc tiến giao thương, kết nối B2B và truyền thông sự kiện",
      },
      {
        id: "group-bdh-truongban-1983",
        name: "Ban Điều Hành & Các Trưởng Ban",
        memberIds: MEMBERS.slice(0, 8).map((m) => m.id),
        createdBy: CURRENT_USER_ID || "system",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        description: "Điều phối và triển khai các chương trình trọng điểm của Hiệp hội CEO 1983",
      },
    ];
    try {
      localStorage.setItem("ceo_group_chats", JSON.stringify(_groupChats));
    } catch {}
  }
  return _groupChats;
}

export function saveGroupChats() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ceo_group_chats", JSON.stringify(_groupChats));
  } catch {}
}

export function listGroupChats(): GroupChat[] {
  if (_groupChats.length === 0) loadGroupChats();
  return [..._groupChats];
}

export function getGroupChat(groupId: string): GroupChat | undefined {
  if (_groupChats.length === 0) loadGroupChats();
  return _groupChats.find((g) => g.id === groupId);
}

export function createGroupChat(name: string, memberIds: string[], description?: string): GroupChat {
  if (_groupChats.length === 0) loadGroupChats();
  const allMembers = Array.from(new Set([CURRENT_USER_ID, ...memberIds])).filter(Boolean);
  const newGroup: GroupChat = {
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    memberIds: allMembers,
    createdBy: CURRENT_USER_ID,
    createdAt: new Date().toISOString(),
    description: description?.trim() || undefined,
  };
  _groupChats.unshift(newGroup);
  saveGroupChats();

  // Create initial group system message
  const initMsg: ChatMessage = {
    id: `m-grp-init-${Date.now()}`,
    fromId: CURRENT_USER_ID,
    toId: newGroup.id,
    text: `🎉 Đã tạo nhóm trao đổi "${newGroup.name}" gồm ${newGroup.memberIds.length} thành viên. Hãy bắt đầu thảo luận công việc cùng nhau!`,
    at: new Date().toISOString(),
  };
  _messages.push(initMsg);
  saveLocalGroupMessages();

  emit();
  return newGroup;
}

function loadLocalGroupMessages() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("ceo_group_messages");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const m of parsed) {
          if (!_messages.some((x) => x.id === m.id)) {
            _messages.push(m);
          }
        }
      }
    }
  } catch {}
}

function saveLocalGroupMessages() {
  if (typeof window === "undefined") return;
  try {
    const groupMsgs = _messages.filter((m) => m.toId?.startsWith("group-"));
    localStorage.setItem("ceo_group_messages", JSON.stringify(groupMsgs));
  } catch {}
}

export type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((l: any) => l());
}
export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Hydrate the local store from server-loaded data.
export function hydrateNetwork(
  currentMemberId: string | null,
  statuses: Record<string, ConnectionStatus>,
  messages: ChatMessage[],
  timestamps: Record<string, string> = {},
) {
  let resolvedMemberId = currentMemberId;
  if (!resolvedMemberId && typeof window !== "undefined") {
    resolvedMemberId = localStorage.getItem("vibe_member_id");
    if (!resolvedMemberId) {
      try {
        const u = localStorage.getItem("vibe_user");
        if (u) {
          const parsed = JSON.parse(u);
          resolvedMemberId = parsed.memberId || parsed.id;
        }
      } catch {}
    }
  }
  CURRENT_USER_ID = resolvedMemberId ?? (MEMBERS[0]?.id || "00000000-0000-4000-8000-000000000001");
  _statuses = new Map(Object.entries(statuses));
  _timestamps = new Map(Object.entries(timestamps));
  _messages = [...messages];
  loadGroupChats();
  loadLocalGroupMessages();

  // If no connected peers in DB yet, provide default connected peers & initial welcome messages
  const hasConnected = Array.from(_statuses.values()).some((s) => s === "connected");
  if (!hasConnected && MEMBERS.length > 0) {
    const peers = MEMBERS.filter((m) => m.id !== CURRENT_USER_ID);
    if (peers[0]) {
      _statuses.set(peers[0].id, "connected");
      _timestamps.set(peers[0].id, new Date(Date.now() - 3600000).toISOString());
    }
    if (peers[1]) {
      _statuses.set(peers[1].id, "connected");
      _timestamps.set(peers[1].id, new Date(Date.now() - 7200000).toISOString());
    }
    if (peers[2]) {
      _statuses.set(peers[2].id, "pending_incoming");
      _timestamps.set(peers[2].id, new Date(Date.now() - 1800000).toISOString());
    }
  }

  if (_messages.length === 0 && MEMBERS.length > 0) {
    const peers = MEMBERS.filter((m) => m.id !== CURRENT_USER_ID);
    if (peers[0]) {
      _messages.push({
        id: "msg-welcome-1",
        fromId: peers[0].id,
        toId: CURRENT_USER_ID || "me",
        text: `Chào anh/chị! Rất vui được kết nối cùng anh/chị trong Hiệp hội CEO 1983. Doanh nghiệp bên em rất mong muốn được tìm hiểu và hợp tác giao thương!`,
        at: new Date(Date.now() - 1800000).toISOString(),
        readAt: null,
      });
    }
    if (peers[1]) {
      _messages.push({
        id: "msg-welcome-2",
        fromId: peers[1].id,
        toId: CURRENT_USER_ID || "me",
        text: `Chào anh/chị, em đã xem hồ sơ năng lực của bên mình. Tuần này bên anh/chị có tiện sắp xếp lịch gặp 1-on-1 để trao đổi cơ hội hợp tác không ạ?`,
        at: new Date(Date.now() - 3600000).toISOString(),
        readAt: new Date(Date.now() - 3500000).toISOString(),
      });
    }
  }

  emit();
}

export function getStatus(memberId: string): ConnectionStatus {
  if (memberId === CURRENT_USER_ID) return "none";
  return _statuses.get(memberId) ?? "none";
}

// Timestamp (ISO) of the last status change for a peer (sent/accepted), if any.
export function getStatusTime(memberId: string): string | null {
  return _timestamps.get(memberId) ?? null;
}

// Optimistically update local status, then persist via the matching server fn.
function localSet(memberId: string, status: ConnectionStatus) {
  if (status === "none") _statuses.delete(memberId);
  else _statuses.set(memberId, status);
  emit();
}

// Re-sync the local connection statuses from the database so the UI always
// reflects the authoritative DB state right after an action (or a failure).
export async function refreshFromDb() {
  try {
    const { getNetworkStateFn } = await import("./networking.functions");
    const net = await getNetworkStateFn();
    _statuses = new Map(Object.entries(net.statuses));
    _timestamps = new Map(Object.entries(net.timestamps ?? {}));
    CURRENT_USER_ID = net.currentMemberId ?? CURRENT_USER_ID;
    emit();
  } catch {
    /* keep optimistic state on transient failures */
  }
}

type PersistFn = "sendRequestFn" | "acceptRequestFn" | "declineRequestFn" | "removeConnectionFn";

function persist(fn: PersistFn, peerId: string): Promise<void> {
  return import("./networking.functions")
    .then((m) => m[fn]({ data: { peerId } }))
    .then(() => {})
    .finally(() => {
      // Reconcile with DB whether the RPC succeeded or failed.
      void refreshFromDb();
    });
}

export function sendRequest(memberId: string): Promise<void> {
  return persist("sendRequestFn", memberId).then(() => {
    localSet(memberId, "pending_outgoing");
  });
}

export function cancelRequest(memberId: string): Promise<void> {
  const prev = getStatus(memberId);
  localSet(memberId, "none");
  return persist("removeConnectionFn", memberId).catch((err) => {
    // Revert optimistic state so the UI stays in sync with the DB.
    localSet(memberId, prev);
    throw err;
  });
}
export function acceptRequest(memberId: string): Promise<void> {
  return persist("acceptRequestFn", memberId).then(() => {
    localSet(memberId, "connected");
  });
}

export function declineRequest(memberId: string): Promise<void> {
  localSet(memberId, "none");
  return persist("declineRequestFn", memberId);
}
export function disconnect(memberId: string) {
  localSet(memberId, "none");
  persist("removeConnectionFn", memberId);
}

export function listConnections(): Member[] {
  return MEMBERS.filter((m) => getStatus(m.id) === "connected");
}
export function listIncoming(): Member[] {
  return MEMBERS.filter((m) => getStatus(m.id) === "pending_incoming");
}
export function listOutgoing(): Member[] {
  return MEMBERS.filter((m) => getStatus(m.id) === "pending_outgoing");
}
export function listSuggestions(): Member[] {
  return MEMBERS.filter((m) => m.id !== CURRENT_USER_ID && getStatus(m.id) === "none");
}

export function getAllMessages(): ChatMessage[] {
  return [..._messages];
}

export function listChatPeers(): Member[] {
  const peerIds = new Set<string>();
  for (const m of _messages) {
    if (m.fromId && m.fromId !== CURRENT_USER_ID) peerIds.add(m.fromId);
    if (m.toId && m.toId !== CURRENT_USER_ID && m.toId !== "me") peerIds.add(m.toId);
  }
  for (const [id, s] of _statuses.entries()) {
    if (s === "connected") peerIds.add(id);
  }
  return MEMBERS.filter(
    (m) => m.id !== CURRENT_USER_ID && (peerIds.has(m.id) || getStatus(m.id) === "connected"),
  );
}

export function getThread(memberId: string): ChatMessage[] {
  if (memberId.startsWith("group-")) {
    return _messages
      .filter((m) => m.toId === memberId)
      .sort((a, b) => a.at.localeCompare(b.at));
  }
  return _messages
    .filter(
      (m) =>
        (m.fromId === CURRENT_USER_ID && m.toId === memberId) ||
        (m.fromId === memberId && (m.toId === CURRENT_USER_ID || m.toId === "me" || !m.toId)) ||
        (m.toId === memberId) ||
        (m.fromId === memberId),
    )
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function sendMessage(toId: string, text: string, attachments?: ChatAttachment[]) {
  const trimmed = text.trim();
  if (!trimmed && (!attachments || attachments.length === 0)) return;
  const isGroup = toId.startsWith("group-");
  const newMsg: ChatMessage = {
    id: `m${_messages.length + 1}-${Date.now()}`,
    fromId: CURRENT_USER_ID,
    toId,
    text: trimmed,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    at: new Date().toISOString(),
  };
  _messages.push(newMsg);

  if (isGroup) {
    saveLocalGroupMessages();
    emit();
    return;
  }

  // ensure connection exists when messaging individual
  if (_statuses.get(toId) !== "connected") _statuses.set(toId, "connected");
  emit();
  import("./networking.functions")
    .then((m) =>
      m.sendMessageFn({
        data: {
          toId,
          text: trimmed || (attachments?.[0]?.name ? `[Tệp: ${attachments[0].name}]` : "[Đính kèm]"),
        },
      })
    )
    .catch(() => {});
}

export function togglePinMessage(messageId: string) {
  _messages = _messages.map((m) => {
    if (m.id === messageId) {
      return { ...m, pinned: !m.pinned };
    }
    return m;
  });
  emit();
}

export function lastMessageWith(memberId: string): ChatMessage | undefined {
  const t = getThread(memberId);
  return t[t.length - 1];
}

// Number of unread messages received from a given peer or group.
export function unreadCountWith(memberId: string): number {
  if (memberId.startsWith("group-")) {
    return _messages.filter(
      (m) => m.toId === memberId && m.fromId !== CURRENT_USER_ID && !m.readAt,
    ).length;
  }
  return _messages.filter((m) => m.fromId === memberId && m.toId === CURRENT_USER_ID && !m.readAt)
    .length;
}

// Mark all messages from a peer or group as read (optimistic + persisted).
export function markThreadRead(memberId: string) {
  const now = new Date().toISOString();
  let changed = false;
  if (memberId.startsWith("group-")) {
    _messages = _messages.map((m) => {
      if (m.toId === memberId && m.fromId !== CURRENT_USER_ID && !m.readAt) {
        changed = true;
        return { ...m, readAt: now };
      }
      return m;
    });
    if (changed) {
      saveLocalGroupMessages();
      emit();
    }
    return;
  }

  _messages = _messages.map((m) => {
    if (m.fromId === memberId && m.toId === CURRENT_USER_ID && !m.readAt) {
      changed = true;
      return { ...m, readAt: now };
    }
    return m;
  });
  if (!changed) return;
  emit();
  import("./networking.functions")
    .then((m) => m.markThreadReadFn({ data: { peerId: memberId } }))
    .catch(() => {});
}

export function deleteMessage(id: string) {
  const msg = _messages.find((m) => m.id === id);
  if (!msg || msg.fromId !== CURRENT_USER_ID) return;
  _messages = _messages.filter((m) => m.id !== id);
  emit();
  import("./networking.functions").then((m) => m.deleteMessageFn({ data: { id } })).catch(() => {});
}
