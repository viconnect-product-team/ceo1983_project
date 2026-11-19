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

export const DEFAULT_MEMBERS: Member[] = [];

export const MEMBERS: Member[] = [];

// Replace the in-memory members store with real data loaded from the DB.
export function hydrateMembers(members: Member[]) {
  if (Array.isArray(members)) {
    MEMBERS.splice(0, MEMBERS.length, ...members);
  }
}

export function getMember(id: string) {
  const clean = String(id || "").toLowerCase().trim();
  return MEMBERS.find(
    (m) =>
      m.id.toLowerCase() === clean ||
      m.code.toLowerCase() === clean ||
      m.email.toLowerCase() === clean
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
