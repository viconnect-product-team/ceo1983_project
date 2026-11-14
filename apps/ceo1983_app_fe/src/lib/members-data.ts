export type MemberType = "company" | "individual";
export type MemberStatus = "active" | "pending" | "expired";
export type IndustryKey =
  | "ind.trade"
  | "ind.it"
  | "ind.manufacturing"
  | "ind.realestate"
  | "ind.finance";
export type RegionKey = "region.north" | "region.central" | "region.south";
export type MemberLevelKey =
  | "memberLevel.large"
  | "memberLevel.medium"
  | "memberLevel.small"
  | "memberLevel.individual";

export type Member = {
  id: string;
  code: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  type: MemberType;
  level: MemberLevelKey | "vip" | "standard" | string;
  industry: IndustryKey | string;
  region: RegionKey | string;
  status: MemberStatus;
  joinedAt: string; // ISO
  createdAt?: string; // ISO
  feeYear: number;
  feePaid: boolean;
  address: string;
  website?: string;
  taxCode?: string;
  employees?: number;
  about: string;
  company?: string;
  companyName?: string;
  company_name?: string;
  // Renewal fields (populated when loaded from the database)
  termEnd?: string;
  reminderCount?: number;
  lastReminder?: string;
  renewedAt?: string;
  newTermEnd?: string;
  executiveRole?: string;
  department?: string;
};

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: "M1983-001",
    code: "M1983-001",
    name: "Lê Thị Dung (Admin Viconnect)",
    contact: "Lê Thị Dung",
    email: "admin@viconnect.vn",
    phone: "0988870888",
    type: "company",
    level: "vip",
    industry: "Tư vấn, đào tạo doanh nghiệp & Công nghệ",
    region: "region.north",
    status: "active",
    joinedAt: "2022-08-18T00:00:00Z",
    feeYear: 2026,
    feePaid: true,
    address: "Tầng 15, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội",
    website: "https://ceo1983.viconnect.vn",
    about: "Chủ tịch CLB Doanh Nhân CEO 1983 · Quản trị viên cấp cao Hệ thống Viconnect",
    company: "Viconnect Solution",
    companyName: "Công ty CP Giải Pháp Viconnect",
    department: "Ban Điều Hành",
    executiveRole: "Chủ tịch CLB",
  },
  {
    id: "M1983-002",
    code: "M1983-002",
    name: "Phạm Hồng Nguyên",
    contact: "Trưởng Ban Truyền Thông",
    email: "info@viconnect.vn",
    phone: "0983988999",
    type: "company",
    level: "vip",
    industry: "Truyền thông số, Sự kiện & Báo chí",
    region: "region.north",
    status: "active",
    joinedAt: "2022-10-20T00:00:00Z",
    feeYear: 2026,
    feePaid: true,
    address: "Hà Nội",
    website: "https://ceo1983.viconnect.vn",
    about: "Trưởng Ban Truyền Thông & Sự Kiện CLB Doanh Nhân CEO 1983 - Phạm Hồng Nguyên",
    company: "CLB Doanh Nhân CEO 1983",
    companyName: "CLB Doanh Nhân CEO 1983",
    department: "Ban Truyền Thông",
    executiveRole: "Trưởng Ban Truyền Thông",
  },
];

export const MEMBERS: Member[] = [...DEFAULT_MEMBERS];

// Replace the in-memory members store with real data loaded from the DB.
export function hydrateMembers(members: Member[]) {
  if (Array.isArray(members) && members.length > 0) {
    MEMBERS.splice(0, MEMBERS.length, ...members);
  } else if (MEMBERS.length === 0) {
    MEMBERS.splice(0, MEMBERS.length, ...DEFAULT_MEMBERS);
  }
}

export function getMember(id: string) {
  const clean = String(id || "").toLowerCase().trim();
  return (
    MEMBERS.find(
      (m) =>
        m.id.toLowerCase() === clean ||
        m.code.toLowerCase() === clean ||
        m.email.toLowerCase() === clean
    ) ||
    DEFAULT_MEMBERS.find(
      (m) =>
        m.id.toLowerCase() === clean ||
        m.code.toLowerCase() === clean ||
        m.email.toLowerCase() === clean
    )
  );
}

export type MemberContactPatch = Partial<Pick<Member, "email" | "phone" | "address">>;

export function updateMemberContact(id: string, patch: MemberContactPatch) {
  const m = MEMBERS.find((x) => x.id === id);
  if (!m) return undefined;
  if (patch.email !== undefined) m.email = patch.email;
  if (patch.phone !== undefined) m.phone = patch.phone;
  if (patch.address !== undefined) m.address = patch.address;
  return m;
}
