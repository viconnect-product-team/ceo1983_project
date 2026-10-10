import type {
  ActionTicketData,
  ActionMeetingData,
  ActionB2bInviteData,
  ReplyQuoteData,
  ParsedContent,
  MyConversation,
} from "./types";

export function isSelfUser(
  candidate:
    | {
        peerCode?: string | null;
        userId?: string | null;
        name?: string | null;
        code?: string | null;
      }
    | null
    | undefined,
  user:
    | { id?: string | null; username?: string | null; email?: string | null; name?: string | null }
    | null
    | undefined,
  member:
    | { code?: string | null; id?: string | null; name?: string | null; email?: string | null }
    | null
    | undefined,
): boolean {
  if (!candidate || (!user && !member)) return false;
  const candidateCode = (candidate.peerCode || candidate.code || "").trim().toLowerCase();
  const candidateUserId = (candidate.userId || "").trim().toLowerCase();
  const candidateName = (candidate.name || "").trim().toLowerCase();

  // If group, channel or system, never self
  if (
    candidateCode.startsWith("group_") ||
    candidateCode.startsWith("channel_") ||
    candidateCode === "admin" ||
    candidateCode === "system"
  ) {
    return false;
  }

  const myCode = (member?.code || "").trim().toLowerCase();
  const myMemberId = (member?.id || "").trim().toLowerCase();
  const myUserId = (user?.id || "").trim().toLowerCase();
  const myEmail = (user?.email || member?.email || "").trim().toLowerCase();
  const myUsername = (user?.username || "").trim().toLowerCase();
  const myName = (member?.name || user?.name || "").trim().toLowerCase();

  if (myCode && candidateCode && candidateCode === myCode) return true;
  if (myUserId && candidateUserId && candidateUserId === myUserId) return true;
  if (myUserId && candidateCode && candidateCode === myUserId) return true;
  if (myMemberId && candidateCode && candidateCode === myMemberId) return true;
  if (myEmail && candidateCode && candidateCode === myEmail) return true;
  if (myUsername && candidateCode && candidateCode === myUsername) return true;
  if (myName && candidateName && candidateName === myName) return true;

  // Check stored custom profile name
  try {
    const rawCustom = localStorage.getItem("vba_custom_profile");
    if (rawCustom) {
      const custom = JSON.parse(rawCustom);
      if (custom?.name && candidateName && custom.name.trim().toLowerCase() === candidateName)
        return true;
    }
  } catch {}

  return false;
}

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function formatMessageTime(isoOrText?: string) {
  if (!isoOrText) return "";
  if (isoOrText === "Vừa xong" || isoOrText === "justNow") return "Vừa xong";
  const d = new Date(isoOrText);
  if (isNaN(d.getTime())) return isoOrText;
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateSeparator(isoStr?: string) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function initialsOf(name?: string | null): string {
  if (!name || typeof name !== "string") return "HV";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "HV";
  const initials = parts
    .slice(-2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
  return initials || "HV";
}

export function cleanPersonName(fullName?: string | null): string {
  if (!fullName || typeof fullName !== "string") return "";
  const clean = fullName.split(/\s*[-–—|]\s*/)[0]?.trim();
  return clean || fullName.trim();
}

export function getShortName(fullName?: string | null): string {
  if (!fullName || typeof fullName !== "string") return "";
  const person = cleanPersonName(fullName);
  const parts = person.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }
  return parts[0] || person || "";
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileBadgeInfo(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) {
    return { label: "PDF", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  }
  if (["doc", "docx"].includes(ext)) {
    return { label: "DOC", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return { label: "XLS", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  }
  if (["ppt", "pptx"].includes(ext)) {
    return { label: "PPT", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { label: "ZIP", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
  }
  return {
    label: ext.toUpperCase().slice(0, 4) || "FILE",
    color: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
}


export function safeDecode(val?: string): string {
  if (!val) return "";
  try {
    return decodeURIComponent(val.replace(/\+/g, " "));
  } catch {
    return val;
  }
}

export function parseMessageContent(rawBody: string): ParsedContent {
  let body = rawBody;
  let replyQuote: ReplyQuoteData | undefined;

  // B2B Meeting Connection Invite (Requirement 11)
  if (body.startsWith("[B2B_CONNECT_INVITE]")) {
    try {
      const jsonStr = body.replace("[B2B_CONNECT_INVITE]", "").trim();
      const inviteData = JSON.parse(jsonStr);
      return {
        replyQuote,
        type: "b2b_connect_invite",
        data: inviteData,
      };
    } catch {}
  }

  // Phát hiện tiền tố trích dẫn trả lời [reply:id|name:Sender|text:Quoted]
  const replyMatch = body.match(/^\[reply:([^|]+)\|name:([^|]+)\|text:([^\]]+)\]([\s\S]*)$/i);
  if (replyMatch) {
    replyQuote = {
      id: replyMatch[1],
      senderName: safeDecode(replyMatch[2]),
      text: safeDecode(replyMatch[3]),
    };
    body = replyMatch[4].trim();
  }

  // Action: Call log [call:audio|duration:145|status:completed] or [call:video|duration:0|status:missed]
  const callMatch = body.match(
    /\[call:(audio|video)(?:\|duration:(\d+))?(?:\|status:(completed|missed))?\]/i,
  );
  if (callMatch) {
    const callType = (callMatch[1].toLowerCase() === "video" ? "video" : "audio") as
      | "audio"
      | "video";
    const duration = callMatch[2] ? parseInt(callMatch[2], 10) : 0;
    const status = (callMatch[3] || (duration > 0 ? "completed" : "missed")) as
      | "completed"
      | "missed";
    return {
      replyQuote,
      type: "call",
      callType,
      duration,
      status,
    };
  }

  // Action: Payment with VietQR
  const payMatch = body.match(
    /\[action:payment\|amount:(\d+)\|invoice:([^|]+)\|qr:([^|]+)(?:\|due:([^|]+))?(?:\|desc:([^\]]*))?\]/i,
  );
  if (payMatch) {
    return {
      replyQuote,
      type: "action_payment",
      data: {
        amount: parseInt(payMatch[1], 10),
        invoiceNo: payMatch[2],
        qrUrl: payMatch[3],
        dueDate: payMatch[4],
        desc: safeDecode(payMatch[5]),
      },
    };
  }

  // Action: Meeting invitation with full safe URL decoding
  const meetMatch = body.match(
    /\[action:meeting\|title:([^|]+)\|time:([^|]+)\|location:([^|]+)(?:\|link:([^|]+))?(?:\|desc:([^\]]*))?\]/i,
  );
  if (meetMatch) {
    return {
      replyQuote,
      type: "action_meeting",
      data: {
        title: safeDecode(meetMatch[1]),
        time: safeDecode(meetMatch[2]),
        location: safeDecode(meetMatch[3]),
        link: meetMatch[4] || undefined,
        desc: safeDecode(meetMatch[5]),
      },
    };
  }

  // Action: Event Ticket with QR Code
  // [action:ticket|eventId:...|eventTitle:...|ticketCode:...|lucky:...|time:...|location:...|attendee:...|qr:...|type:...|count:...]
  const ticketMatch = body.match(
    /\[action:ticket\|eventId:([^|]+)\|eventTitle:([^|]+)\|ticketCode:([^|]+)(?:\|lucky:([^|]+))?(?:\|time:([^|]+))?(?:\|location:([^|]+))?(?:\|attendee:([^|]+))?(?:\|qr:([^|]+))?(?:\|type:([^|]+))?(?:\|count:(\d+))?\]/i,
  );
  if (ticketMatch) {
    return {
      replyQuote,
      type: "action_ticket",
      data: {
        eventId: ticketMatch[1],
        eventTitle: safeDecode(ticketMatch[2]),
        ticketCode: ticketMatch[3],
        luckyNumber: ticketMatch[4] || undefined,
        time: safeDecode(ticketMatch[5]),
        location: safeDecode(ticketMatch[6]),
        attendee: safeDecode(ticketMatch[7]),
        qrUrl: safeDecode(ticketMatch[8]),
        ticketType: safeDecode(ticketMatch[9]) || "Vé sự kiện",
        count: ticketMatch[10] ? parseInt(ticketMatch[10], 10) : 1,
      },
    };
  }

  const imageRegex = /\[image:(https?:\/\/[^|\]]+)(?:\|([^\]]*))?\]/i;
  const imageMatch = body.match(imageRegex);
  if (imageMatch) {
    const url = imageMatch[1];
    const name = imageMatch[2] || "";
    const caption = body.replace(imageRegex, "").trim();
    return { replyQuote, type: "image", url, name, caption: caption || undefined };
  }

  const fileRegex = /\[file:(https?:\/\/[^|\]]+)(?:\|([^|\]]*))?(?:\|(\d+))?\]/i;
  const fileMatch = body.match(fileRegex);
  if (fileMatch) {
    const url = fileMatch[1];
    const name = fileMatch[2] || "Tài liệu đính kèm";
    const size = fileMatch[3] ? parseInt(fileMatch[3], 10) : undefined;
    const caption = body.replace(fileRegex, "").trim();
    return { replyQuote, type: "file", url, name, size, caption: caption || undefined };
  }

  const locationRegex = /\[location:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:\|name:([^\]]*))?\]/i;
  const locationMatch = body.match(locationRegex);
  if (locationMatch) {
    const lat = locationMatch[1];
    const lng = locationMatch[2];
    const name = locationMatch[3] || "Vị trí đã chia sẻ";
    const caption = body.replace(locationRegex, "").trim();
    return { replyQuote, type: "location", lat, lng, name, caption: caption || undefined };
  }

  const isRawImageUrl = /^(https?:\/\/[^\s]+?\.(png|jpe?g|gif|webp|svg))(?:\?.*)?$/i.test(
    body.trim(),
  );
  if (isRawImageUrl) {
    return { replyQuote, type: "image", url: body.trim() };
  }

  return { replyQuote, type: "text", text: body };
}

export function formatMessagePreview(raw?: any): string {
  if (!raw) return "";
  try {
    const rawStr = typeof raw === "string" ? raw : raw?.text || raw?.body || String(raw || "");
    let text = rawStr.trim();
    const replyMatch = text.match(/^\[reply:([^|]+)\|name:([^|]+)\|text:([^\]]+)\]([\s\S]*)$/i);
    if (replyMatch) {
      text = replyMatch[4].trim();
    }
    if (
      text === "[retracted]" ||
      /\[retracted\]/i.test(text) ||
      text === "Tin nhắn đã được thu hồi" ||
      text.includes("đã thu hồi một tin nhắn")
    ) {
      return text.includes("Bạn") ? "Bạn đã thu hồi một tin nhắn" : "Tin nhắn đã được thu hồi";
    }
    if (/\[call:video/i.test(text)) {
      return text.includes("missed") ? "📹 Cuộc gọi video nhỡ" : "📹 Cuộc gọi video";
    }
    if (/\[call:audio/i.test(text) || /\[call:/i.test(text)) {
      return text.includes("missed") ? "📞 Cuộc gọi thoại nhỡ" : "📞 Cuộc gọi thoại";
    }
    if (/\[action:payment/i.test(text)) {
      return "💳 [Hóa đơn] Nhắc nhở thanh toán hội phí VietQR";
    }
    if (/\[action:meeting/i.test(text)) {
      return "📅 [Cuộc họp] Thư mời tham dự cuộc họp";
    }
    if (/\[action:ticket/i.test(text)) {
      return "🎟️ [Vé điện tử] Xác nhận vé sự kiện & mã QR Check-in";
    }
    if (
      /\[image:(https?:\/\/[^|\]]+)(?:\|([^\]]*))?\]/i.test(text) ||
      /^(https?:\/\/[^\s]+?\.(png|jpe?g|gif|webp|svg))(?:\?.*)?$/i.test(text)
    ) {
      return "📷 [Hình ảnh]";
    }
    const fileMatch = text.match(/\[file:(https?:\/\/[^|\]]+)(?:\|([^|\]]*))?(?:\|(\d+))?\]/i);
    if (fileMatch) {
      return `📎 [Tệp] ${fileMatch[2] || "Tài liệu"}`;
    }
    if (/\[location:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i.test(text)) {
      return "📍 [Vị trí] Đã chia sẻ vị trí hiện tại";
    }
    if (/\[voice:(https?:\/\/[^|\]]+|data:audio\/[^|\]]+)(?:\|(\d+))?\]/i.test(text)) {
      return "🎙️ [Tin nhắn thoại]";
    }
    return text;
  } catch {
    return typeof raw === "string" ? raw : "";
  }
}


export const ALPHABET_LETTERS = [
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
];

export function getNormalizedFirstChar(str: string): string {
  if (!str) return "#";
  const trimmed = str.trim();
  if (!trimmed) return "#";
  const first = trimmed[0].toUpperCase();
  if (first === "Đ") return "Đ";
  const normalized = first.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/[A-Z]/.test(normalized)) return normalized;
  return "#";
}

export function saveRecentConversation(peer: MyConversation, lastText: string, currentUserId?: string) {
  if (typeof window === "undefined" || !peer) return;
  const peerCode = String(peer.peerCode || "");
  if (!peerCode) return;
  try {
    const userRecentsKey = currentUserId
      ? `vba.recent_conversations_${currentUserId}`
      : "vba.recent_conversations";
    const raw =
      localStorage.getItem(userRecentsKey) || localStorage.getItem("vba.recent_conversations");
    const list: MyConversation[] = raw ? JSON.parse(raw) : [];
    const existing = Array.isArray(list)
      ? list.find((c) => c?.peerCode && String(c.peerCode).toLowerCase() === peerCode.toLowerCase())
      : undefined;
    const nowIso = new Date().toISOString();
    const isGroup = Boolean(peer.isGroup || existing?.isGroup || peerCode.startsWith("group_"));
    const item: MyConversation = {
      peerCode,
      name:
        peer.name && String(peer.name).trim().toLowerCase() !== peerCode.toLowerCase()
          ? peer.name
          : existing?.name || peer.name,
      last: lastText,
      time: nowIso,
      rawTime: nowIso,
      unread: 0,
      avatarUrl: peer.avatarUrl || existing?.avatarUrl || null,
      isSystem: peer.isSystem,
      isGroup,
      memberCount: peer.memberCount || existing?.memberCount,
      members: peer.members || existing?.members,
      groupAvatar: peer.groupAvatar || existing?.groupAvatar,
    };
    const next = [
      item,
      ...(Array.isArray(list)
        ? list.filter(
            (c) => c?.peerCode && String(c.peerCode).toLowerCase() !== peerCode.toLowerCase(),
          )
        : []),
    ];
    const serialized = JSON.stringify(next.slice(0, 50));
    localStorage.setItem(userRecentsKey, serialized);
    localStorage.setItem("vba.recent_conversations", serialized);

    if (isGroup) {
      const rawGroups = localStorage.getItem("vba.group_conversations");
      const groupList: MyConversation[] = rawGroups ? JSON.parse(rawGroups) : [];
      const nextGroups = [
        item,
        ...(Array.isArray(groupList)
          ? groupList.filter(
              (g) => g?.peerCode && String(g.peerCode).toLowerCase() !== peerCode.toLowerCase(),
            )
          : []),
      ];
      localStorage.setItem("vba.group_conversations", JSON.stringify(nextGroups.slice(0, 50)));
    }

    try {
      const storedDeleted = JSON.parse(localStorage.getItem("vba_deleted_convs") || "[]");
      if (Array.isArray(storedDeleted) && storedDeleted.length > 0) {
        const nextDeleted = storedDeleted.filter(
          (k: string) => String(k).toLowerCase() !== peerCode.toLowerCase(),
        );
        localStorage.setItem("vba_deleted_convs", JSON.stringify(nextDeleted));
      }
    } catch {}

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("vba:conversation_updated"));
  } catch {}
}

