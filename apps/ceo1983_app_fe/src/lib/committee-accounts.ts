/**
 * committee-accounts.ts
 * Nguồn dữ liệu DÙNG CHUNG cho danh sách tài khoản thuộc các Ban (CRM CEO 1983).
 *  - /accounts  : Quản lý Tài khoản & Phân quyền (đọc/ghi localStorage + /members)
 *  - /network   : Tin nhắn & Trao đổi — hiển thị TOÀN BỘ tài khoản thuộc các ban,
 *                 cho phép nhắn tin 1-1 tự do với bất kỳ tài khoản nào.
 */
import type { Member } from "./members-data";

export interface UserAccountItem {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  companyName?: string;
  department: string;
  role: string;
  avatar?: string;
  status: "active" | "inactive" | "locked";
  createdAt?: string;
  updatedAt?: string;
  dbMemberId?: string;
}

export const MANAGED_ACCOUNTS_STORAGE_KEY = "vba_managed_accounts_v2";

export const DEFAULT_ACCOUNTS: UserAccountItem[] = [];

/** Đọc danh sách tài khoản đang quản lý (localStorage, fallback mảng rỗng []). */
export function readManagedAccounts(): UserAccountItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(MANAGED_ACCOUNTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as UserAccountItem[];
    }
  } catch {
    /* ignore */
  }
  return [];
}

/** Chuyển tài khoản quản trị → Member để dùng trong danh bạ / chat. */
export function accountToMember(acc: UserAccountItem): Member {
  return {
    id: acc.id,
    code: acc.code || acc.id,
    name: acc.name,
    contact: acc.companyName || "",
    email: acc.email || "",
    phone: acc.phone || "",
    type: "company",
    level: "memberLevel.medium",
    industry: "",
    region: "",
    status: "active",
    joinedAt: acc.createdAt || "",
    feeYear: new Date().getFullYear(),
    feePaid: true,
    address: "",
    about: "",
    executiveRole: acc.role,
    department: acc.department,
  };
}

/**
 * Gộp danh sách hội viên từ DB với toàn bộ tài khoản thuộc các Ban.
 * Khử trùng lặp theo mã hội viên (code) hoặc email; ưu tiên bản ghi DB (id thật để gửi tin qua API),
 * nhưng bổ sung Ban/Vai trò từ tài khoản nếu DB còn trống.
 */
export function mergeMembersWithAccounts(
  dbMembers: Member[],
  accounts: UserAccountItem[],
): Member[] {
  const result: Member[] = [];
  const byKey = new Map<string, Member>();
  const keysOf = (code?: string, email?: string) =>
    [code ? `c:${code.trim().toUpperCase()}` : "", email ? `e:${email.trim().toLowerCase()}` : ""].filter(
      Boolean,
    );

  const add = (m: Member) => {
    const keys = keysOf(m.code, m.email);
    const existing = keys.map((k) => byKey.get(k)).find(Boolean);
    if (existing) {
      if (!existing.department && m.department) existing.department = m.department;
      if (!existing.executiveRole && m.executiveRole) existing.executiveRole = m.executiveRole;
      return;
    }
    if (result.some((r) => r.id === m.id)) return;
    result.push(m);
    keys.forEach((k) => byKey.set(k, m));
  };

  dbMembers.forEach((m) => m && m.id && add({ ...m }));
  accounts
    .filter((a) => a && a.status !== "locked")
    .forEach((a) => add(accountToMember(a)));
  return result;
}
