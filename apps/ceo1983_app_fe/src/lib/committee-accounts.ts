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
  dbMemberId?: string;
}

export const MANAGED_ACCOUNTS_STORAGE_KEY = "vba_managed_accounts_v2";

export const DEFAULT_ACCOUNTS: UserAccountItem[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Phạm Văn Vũ",
    code: "M1983-268",
    email: "admin@connect.vn",
    phone: "0988 888 888",
    companyName: "Công ty Cổ phần Công nghệ VIO CONNECT",
    department: "Ban Điều Hành",
    role: "quan_tri",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000000",
    name: "Nguyễn Xuân Thắng",
    code: "M1983-000",
    email: "ceo.chutich@ceo1983.com",
    phone: "0983 198 300",
    companyName: "CLB Doanh Nhân CEO 1983",
    department: "Ban Điều Hành",
    role: "chu_tich",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000001",
    name: "Lê Hoàng Long",
    code: "M1983-001",
    email: "ceo.tongthuky@ceo1983.com",
    phone: "0983 000 001",
    companyName: "Tập Đoàn Hoàng Long Holdings",
    department: "Ban Thư ký",
    role: "tong_thu_ky",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000002",
    name: "Nguyễn Văn Cường",
    code: "M1983-002",
    email: "ceo.thanhvien@ceo1983.com",
    phone: "0983 000 002",
    companyName: "Cường Thịnh Group JSC",
    department: "Ban Thành viên",
    role: "truong_ban_thanh_vien",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000003",
    name: "Trần Anh Tuấn",
    code: "M1983-003",
    email: "ceo.taichinh@ceo1983.com",
    phone: "0983 000 003",
    companyName: "Công ty Tài Chính & Kiểm Toán Hà Nội",
    department: "Ban Tài chính",
    role: "truong_ban_tai_chinh",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000004",
    name: "Phạm Quang Huy",
    code: "M1983-004",
    email: "ceo.truyenthong@ceo1983.com",
    phone: "0983 000 004",
    companyName: "Huy Hoàng Media & Entertainment",
    department: "Ban Truyền thông",
    role: "truong_ban_truyen_thong",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000005",
    name: "Hoàng Minh Tuấn",
    code: "M1983-005",
    email: "ceo.xuctien@ceo1983.com",
    phone: "0983 000 005",
    companyName: "Tuấn Minh Global Trading Corp",
    department: "Ban Xúc tiến",
    role: "truong_ban_xuc_tien",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000033",
    name: "Vũ Thu Trang",
    code: "M1983-033",
    email: "ceo.thiennguyen@ceo1983.com",
    phone: "0983 000 033",
    companyName: "Quỹ Thiện Nguyện CEO 1983",
    department: "Ban Thiện nguyện",
    role: "truong_ban_thien_nguyen",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000006",
    name: "Đặng Quốc Việt",
    code: "M1983-006",
    email: "ceo.sukien@ceo1983.com",
    phone: "0983 000 006",
    companyName: "Việt Event & Media Solutions",
    department: "Ban Sự kiện",
    role: "admin",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000011",
    name: "Đỗ Thị Mai",
    code: "M1983-051",
    email: "ceo.member1@ceo1983.com",
    phone: "0983 000 051",
    companyName: "Công ty May Mặc & Xuất Nhập Khẩu Mai Hương",
    department: "Ban Thành viên",
    role: "member",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000012",
    name: "Bùi Đức Thắng",
    code: "M1983-052",
    email: "ceo.member2@ceo1983.com",
    phone: "0983 000 052",
    companyName: "Thắng Lợi B2B Supply Chain JSC",
    department: "Ban Xúc tiến",
    role: "member",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000013",
    name: "Ngô Bảo Anh",
    code: "M1983-053",
    email: "ceo.member3@ceo1983.com",
    phone: "0983 000 053",
    companyName: "Bảo Anh Digital Marketing Studio",
    department: "Ban Truyền thông",
    role: "member",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000014",
    name: "Đinh Trọng Hiếu",
    code: "M1983-054",
    email: "ceo.member4@ceo1983.com",
    phone: "0983 000 054",
    companyName: "Trọng Hiếu Green Energy Solutions",
    department: "Ban Thiện nguyện",
    role: "member",
    status: "active",
  },
  {
    id: "c1983000-0000-4000-8000-000000000015",
    name: "Trịnh Kim Oanh",
    code: "M1983-055",
    email: "ceo.member5@ceo1983.com",
    phone: "0983 000 055",
    companyName: "Kim Oanh Luật & Dịch Vụ Doanh Nghiệp",
    department: "Ban Thư ký",
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
