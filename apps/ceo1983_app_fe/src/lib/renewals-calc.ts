import type { Member } from "./members-data";
import type { RenewalRecord, RenewalStatus } from "./renewal-data";

export type Row = Record<string, unknown>;

export function mapMember(r: Row): Member {
  const rawName = (r.name as string) || (r.user_name as string) || (r.contact as string) || (r.person_name as string) || "Hội viên";
  const rawCode = (r.code as string) || (r.member_code as string) || "HV";
  const rawEmail = (r.email as string) || (r.user_email as string) || "";
  const rawPhone = (r.phone as string) || (r.user_phone as string) || "";
  const rawComp = (r.company as string) || (r.company_name as string) || "CLB Doanh Nhân CEO 1983";

  return {
    id: String(r.id || r.member_id || rawCode),
    code: rawCode,
    name: rawName,
    contact: (r.contact as string) ?? rawName,
    email: rawEmail,
    phone: rawPhone,
    type: (r.type as Member["type"]) ?? "individual",
    level: (r.level as Member["level"]) ?? "memberLevel.medium",
    industry: (r.industry as Member["industry"]) ?? "ind.trade",
    region: (r.region as Member["region"]) ?? "region.north",
    status: (r.status as Member["status"]) ?? "active",
    joinedAt: ((r.joined_at ?? r.joinedAt) as string) ?? "",
    feeYear: Number(r.fee_year ?? r.feeYear ?? new Date().getFullYear()),
    feePaid: Boolean(r.fee_paid ?? r.feePaid),
    address: (r.address as string) ?? "",
    website: (r.website as string) ?? undefined,
    taxCode: ((r.tax_code ?? r.taxCode) as string) ?? undefined,
    employees: ((r.employees as number) ?? undefined),
    about: (r.about as string) ?? "",
    termEnd: ((r.term_end ?? r.termEnd) as string) ?? undefined,
    reminderCount: Number(r.reminder_count ?? r.reminderCount ?? 0),
    lastReminder: ((r.last_reminder ?? r.lastReminder) as string) ?? undefined,
    renewedAt: ((r.renewed_at ?? r.renewedAt) as string) ?? undefined,
    newTermEnd: ((r.new_term_end ?? r.newTermEnd) as string) ?? undefined,
  };
}

export function daysBetween(from: Date, toIso: string) {
  const to = new Date(toIso);
  to.setHours(0, 0, 0, 0);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/**
 * Cộng đúng 1 năm vào ngày cho trước, xử lý an toàn năm nhuận.
 * Nếu setFullYear(+1) làm nhảy tháng (do ngày nguồn là 29/2 mà năm đích không
 * có 29/2 → JS rollover sang 01/3), lùi về ngày cuối tháng gốc bằng setDate(0).
 * Ví dụ: 2028-02-29 → 2029-02-28 (thay vì 2029-03-01).
 */
export function addOneYear(date: Date): Date {
  const originalMonth = date.getMonth();
  const result = new Date(date.getTime());
  result.setFullYear(result.getFullYear() + 1);
  if (result.getMonth() !== originalMonth) {
    // Rollover xảy ra (ví dụ 29/2 → 01/3) → lùi về ngày cuối tháng gốc.
    result.setDate(0);
  }
  return result;
}

export function isApprovedMember(r: Row): boolean {
  const status = String(r.status || "").toLowerCase().trim();
  // Loại trừ các bản ghi bị xóa, lưu trữ hoặc hủy vĩnh viễn
  if (status === "deleted" || status === "rejected" || status === "archived" || status === "inactive") {
    return false;
  }
  // Chấp nhận tất cả hội viên hợp lệ cần theo dõi và gia hạn (active, approved, pending, expired, waiting, v.v.)
  return true;
}

export function toRecord(r: Row): RenewalRecord {
  const m = mapMember(r);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawTermEnd = (r.new_term_end ?? r.newTermEnd ?? r.term_end ?? r.termEnd ?? m.termEnd) as any;

  let termEnd = "";
  if (rawTermEnd && typeof rawTermEnd === "string" && rawTermEnd.trim()) {
    termEnd = rawTermEnd.includes("T") ? rawTermEnd.slice(0, 10) : rawTermEnd;
  } else if (rawTermEnd && rawTermEnd instanceof Date) {
    termEnd = rawTermEnd.toISOString().slice(0, 10);
  } else if (m.joinedAt && typeof m.joinedAt === "string" && m.joinedAt.trim()) {
    const jDate = new Date(m.joinedAt);
    if (!isNaN(jDate.getTime())) {
      termEnd = addOneYear(jDate).toISOString().slice(0, 10);
    }
  } else if (r.created_at || (r as any).createdAt) {
    const cDate = new Date(((r.created_at ?? (r as any).createdAt) as string));
    if (!isNaN(cDate.getTime())) {
      termEnd = addOneYear(cDate).toISOString().slice(0, 10);
    }
  }

  // Fallback nếu vẫn chưa xác định được hạn niên độ: tính 1 năm kể từ hôm nay
  if (!termEnd) {
    termEnd = addOneYear(today).toISOString().slice(0, 10);
  }

  const daysLeft = daysBetween(today, termEnd);
  const isRenewed = Boolean(r.renewed_at ?? r.renewedAt ?? m.renewedAt);
  let status: RenewalStatus;
  if (isRenewed) status = "renewed";
  else if (daysLeft < 0) status = "overdue";
  else if (daysLeft <= 30) status = "due";
  else status = "upcoming";

  const paymentStatus = ((r.payment_status ?? r.paymentStatus ?? (m.feePaid ? "paid" : "unpaid")) as string as RenewalRecord["paymentStatus"]) ?? "unpaid";
  const lastReminder = ((r.last_reminder ?? r.lastReminder ?? m.lastReminder) as string) ?? undefined;
  const reminderCount = Number(r.reminder_count ?? r.reminderCount ?? m.reminderCount ?? 0);
  const newTermEnd = ((r.new_term_end ?? r.newTermEnd ?? m.newTermEnd) as string) ?? undefined;
  const renewedAt = ((r.renewed_at ?? r.renewedAt ?? m.renewedAt) as string) ?? undefined;

  return {
    id: String(r.id || `RNW-${m.code}`),
    member: m,
    currentTermEnd: termEnd,
    daysLeft,
    status,
    paymentStatus,
    lastReminder,
    reminderCount,
    newTermEnd,
    renewedAt,
  };
}
