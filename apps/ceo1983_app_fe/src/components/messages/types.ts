import type {
  MyConversation,
  ChatMessage,
  DirectoryMember,
  MyMember,
} from "@/lib/member-app.functions";
import type { ZaloTransactionData } from "@/components/business-connect/mobile/ZaloTransactionCard";

export type { MyConversation, ChatMessage, DirectoryMember, MyMember };

export type ActionPaymentData = ZaloTransactionData;

export type ActionMeetingData = {
  title: string;
  time: string;
  location: string;
  link?: string;
  desc?: string;
};

export type ActionTicketData = {
  eventId: string;
  eventTitle: string;
  ticketCode: string;
  luckyNumber?: string;
  time?: string;
  location?: string;
  attendee?: string;
  qrUrl: string;
  ticketType?: string;
  count?: number;
};

export type ActionB2bInviteData = {
  type: string;
  inviteId: string;
  senderName: string;
  senderPhone: string;
  senderCompany: string;
  senderCode?: string;
  purpose: string;
  opportunityId?: string;
  opportunityTitle?: string;
  recipientCode?: string;
  recipientName?: string;
  status: "pending" | "accepted" | "declined";
  declineReason?: string;
  createdAt: string;
};

export type ReplyQuoteData = {
  id?: string;
  senderName: string;
  text: string;
};

export type ParsedContent = {
  replyQuote?: ReplyQuoteData;
} & (
  | { type: "image"; url: string; name?: string; caption?: string }
  | { type: "file"; url: string; name: string; size?: number; caption?: string }
  | { type: "location"; lat: string; lng: string; name: string; caption?: string }
  | { type: "call"; callType: "audio" | "video"; duration: number; status: "completed" | "missed" }
  | { type: "action_payment"; data: ActionPaymentData }
  | { type: "action_meeting"; data: ActionMeetingData }
  | { type: "action_ticket"; data: ActionTicketData }
  | { type: "b2b_connect_invite"; data: ActionB2bInviteData }
  | { type: "text"; text: string }
);

export type ConvFilter = "all" | "channels" | "groups" | "friends" | "unread" | "system" | "pending";

export type ConvSortMode = "newest" | "oldest" | "alpha_asc" | "alpha_desc" | "unread_first";

