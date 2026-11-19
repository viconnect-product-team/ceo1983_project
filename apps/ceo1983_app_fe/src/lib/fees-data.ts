import type { Member } from "@/lib/members-data";

export type FeeStatus = "paid" | "unpaid" | "overdue";

export type FeeRecord = {
  id: string;
  member: Member;
  memberId?: string;
  year: number;
  amount: number;
  paidAt?: string;
  dueDate: string;
  status: FeeStatus;
  invoiceNo: string;
  method?: "bank" | "card" | "cash" | "ewallet";
};

export function feeKpis(records: FeeRecord[]) {
  const total = records.reduce((s, r) => s + r.amount, 0);
  const collected = records.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const outstanding = total - collected;
  const overdueCount = records.filter((r) => r.status === "overdue").length;
  const collectionRate = total > 0 ? Math.round((collected / total) * 100) : 0;
  return { total, collected, outstanding, overdueCount, collectionRate };
}

export function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export type ReminderChannel = "email" | "sms" | "call" | "zalo";

export type ReminderEntry = {
  id: string;
  invoiceId: string;
  channel: ReminderChannel;
  sentAt: string; // ISO
  by: string;
  note?: string;
};

export const DEFAULT_FEE_INVOICES: FeeRecord[] = [];
