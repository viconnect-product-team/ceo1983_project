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

export const DEFAULT_ACCOUNTS: UserAccountItem[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    dbMemberId: "00000000-0000-4000-8000-000000000002",
    name: "Jame Nguyễn",
    code: "CEO1983-000001",
    email: "admin@connect.vn",
    phone: "0988 888 888",
    companyName: "Công ty Cổ phần Công nghệ VIO CONNECT",
    department: "Ban Điều Hành",
    role: "quan_tri",
    status: "active",
  },
  {
    id: "67e1bca9-94e6-4859-b13c-bf93e2b9c4c5",
    dbMemberId: "MBMWD8P4NX",
    name: "Phạm Văn Vũ",
    code: "CEO1983-000003",
    email: "vumikasa6@gmail.com",
    phone: "0988 888 888",
    companyName: "VIO CONNECT JSC",
    department: "Ban truyền thông",
    role: "thanh_vien_ban_truyen_thong",
    status: "active",
  },
  {
    id: "eda9cbcc-6c51-47db-968b-6dee219a59ae",
    dbMemberId: "MBMWBR2VWN",
    name: "Phạm hồng Nguyên",
    code: "CEO1983-000002",
    email: "info@viconnect.vn",
    phone: "0903 205 683",
    companyName: "Công ty TNHH Tư Vấn Doanh Nghiệp ViConnect",
    department: "Hội viên ceo1983",
    role: "member",
    status: "active",
  },
  {
    id: "703909a9-f21e-4ebe-b537-10da57b0cb4c",
    dbMemberId: "MBMWD8NCJH",
    name: "Phạm An Nam",
    code: "CEO1983-000004",
    email: "vupv090120@gmail.com",
    phone: "0973 205 683",
    companyName: "Doanh Nghiệp Hội Viên CEO 1983",
    department: "Hội viên ceo1983",
    role: "member",
    status: "active",
  },
];

/** Đọc danh sách tài khoản đang quản lý (localStorage, fallback DEFAULT_ACCOUNTS). */
export function readManagedAccounts(): UserAccountItem[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const saved = localStorage.getItem(MANAGED_ACCOUNTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as UserAccountItem[];
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_ACCOUNTS;
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
