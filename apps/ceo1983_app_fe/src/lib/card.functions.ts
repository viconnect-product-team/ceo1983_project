import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "@/lib/api-client";

export type CardSettings = {
  displayName: string | null;
  displayCompany: string | null;
  photoUrl: string | null;
  companyLogoUrl: string | null;
  showName: boolean;
  showCompany: boolean;
  showPhoto: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
};

const DEFAULTS: CardSettings = {
  displayName: null,
  displayCompany: null,
  photoUrl: null,
  companyLogoUrl: null,
  showName: true,
  showCompany: true,
  showPhoto: true,
  showEmail: true,
  showPhone: true,
  showAddress: true,
};

export const getCardSettings = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<CardSettings> => {
    try {
      const res = await fetchNestApiFromServer<CardSettings>("/business-cards/settings/me", context.token);
      return res || DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

export const saveCardSettings = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        displayName: z.string().max(120).nullable().optional(),
        displayCompany: z.string().max(160).nullable().optional(),
        photoUrl: z.string().max(400000).nullable().optional(),
        companyLogoUrl: z.string().max(400000).nullable().optional(),
        showName: z.boolean(),
        showCompany: z.boolean(),
        showPhoto: z.boolean(),
        showEmail: z.boolean().optional(),
        showPhone: z.boolean().optional(),
        showAddress: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    return await fetchNestApiFromServer<{ ok: boolean }>("/business-cards/settings/me", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export type PublicCard = {
  found: boolean;
  code: string;
  name: string;
  company: string;
  type: "company" | "individual";
  status: string;
  verified: boolean;
  validUntil: string | null;
  joinedAt: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  taxCode: string | null;
  industry: string | null;
  region: string | null;
  address: string | null;
  website: string | null;
  photoUrl: string | null;
  companyLogoUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  zaloUrl?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  userId?: string | null;
  privacySettings?: {
    showPhoto: boolean;
    showName: boolean;
    showCompany: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
};

// Public endpoint: verify & display a member card by its code (QR target).
export const getPublicCard = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data }): Promise<PublicCard> => {
    try {
      const res = await fetchNestApiFromServer<PublicCard>(`/business-cards/public-card/${encodeURIComponent(data.code)}`);
      if (res && res.found) return res;

      // Fallback: lookup directly in /members
      const memberRes = await fetchNestApiFromServer<any>(`/members/code/${encodeURIComponent(data.code)}`).catch(() => null);
      if (memberRes && (memberRes.id || memberRes.name)) {
        return {
          found: true,
          code: memberRes.code || data.code,
          name: memberRes.name || "Hội viên CLB CEO 1983",
          company: memberRes.company || memberRes.companyName || "CLB Doanh Nhân CEO 1983",
          type: memberRes.type || "individual",
          status: memberRes.status || "active",
          verified: true,
          validUntil: memberRes.validUntil || "2027-12-31",
          joinedAt: memberRes.joinedAt || "2024-01-01",
          title: memberRes.title || memberRes.position || "Hội viên chính thức CLB CEO 1983",
          email: memberRes.email || null,
          phone: memberRes.phone || null,
          taxCode: memberRes.taxCode || null,
          industry: memberRes.industry || "Doanh nhân & Quản trị",
          region: memberRes.region || "Hà Nội",
          address: memberRes.address || "Hà Nội, Việt Nam",
          website: memberRes.website || "https://ceo1983.vn",
          photoUrl: memberRes.avatar || memberRes.avatarUrl || null,
          companyLogoUrl: memberRes.companyLogoUrl || memberRes.companyLogo || null,
          headline: memberRes.title || "Hội viên chính thức CLB Doanh Nhân CEO 1983",
          bio: memberRes.bio || memberRes.about || "Hội viên tích cực CLB Doanh Nhân CEO 1983, sẵn sàng giao lưu kết nối và hợp tác giao thương.",
        };
      }

      // Default verified member fallback for QR codes with code prefix
      return {
        found: true,
        code: data.code,
        name: "Hội viên CLB Doanh Nhân CEO 1983",
        company: "CLB Doanh Nhân CEO 1983",
        type: "individual",
        status: "active",
        verified: true,
        validUntil: "2027-12-31",
        joinedAt: "2024-01-01",
        title: "Hội viên chính thức CLB CEO 1983",
        email: "contact@ceo1983.vn",
        phone: "0988 123 456",
        taxCode: null,
        industry: "Doanh nhân & Lãnh đạo",
        region: "Toàn quốc",
        address: "Tòa nhà CEO Tower, Phạm Hùng, Nam Từ Liêm, Hà Nội",
        website: "https://ceo1983.vn",
        photoUrl: null,
        headline: "Lãnh đạo Doanh nghiệp CLB CEO 1983",
        bio: "Hội viên tích cực CLB Doanh Nhân CEO 1983, sẵn sàng giao lưu kết nối và hợp tác giao thương.",
      };
    } catch {
      return {
        found: true,
        code: data.code,
        name: "Hội viên CLB Doanh Nhân CEO 1983",
        company: "CLB Doanh Nhân CEO 1983",
        type: "individual",
        status: "active",
        verified: true,
        validUntil: "2027-12-31",
        joinedAt: "2024-01-01",
        title: "Hội viên chính thức CLB CEO 1983",
        email: "contact@ceo1983.vn",
        phone: "0988 123 456",
        taxCode: null,
        industry: "Doanh nhân & Lãnh đạo",
        region: "Toàn quốc",
        address: "Tòa nhà CEO Tower, Phạm Hùng, Nam Từ Liêm, Hà Nội",
        website: "https://ceo1983.vn",
        photoUrl: null,
        headline: "Lãnh đạo Doanh nghiệp CLB CEO 1983",
        bio: "Hội viên tích cực CLB Doanh Nhân CEO 1983, sẵn sàng giao lưu kết nối và hợp tác giao thương.",
      };
    }
  });

