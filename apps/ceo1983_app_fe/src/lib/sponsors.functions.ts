import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "./api-client";

export type AssignedEvent = {
  id: string;
  name: string;
  date: string;
  status: string;
  packageId?: string | null;
  packageName?: string | null;
  tier?: string;
  packageType?: string;
  amount?: number;
};

export type Sponsor = {
  id: string;
  name: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  sponsorType: "regular" | "new";
  packageType: "cash" | "in_kind";
  inKindDescription?: string;
  contact: string;
  email: string;
  phone: string;
  amount: number;
  events: number;
  since: string;
  status: "active" | "expired";
  assignedEvent?: AssignedEvent | null;
  isAssigned?: boolean;
};

export type SponsorPackage = {
  id: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  price: number;
  packageType: "cash" | "in_kind";
  inKindDescription?: string;
  benefits: string[];
  available: number;
  sold: number;
};

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

export const listSponsorsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Sponsor[]> => {
    try {
      const res = await fetchNestApiFromServer<Sponsor[]>("/sponsors", context.token);
      return Array.isArray(res) ? res : [];
    } catch (err: any) {
      console.error("[listSponsorsFn] error:", err);
      return [];
    }
  });

export const listSponsorPackagesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<SponsorPackage[]> => {
    try {
      const res = await fetchNestApiFromServer<SponsorPackage[]>("/sponsors/packages", context.token);
      return Array.isArray(res)
        ? res.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
        : [];
    } catch (err: any) {
      console.error("[listSponsorPackagesFn] error:", err);
      return [];
    }
  });

const sponsorInput = z.object({
  name: z.string().min(1).max(200),
  tier: z.enum(["platinum", "gold", "silver", "bronze"]).default("bronze"),
  sponsorType: z.enum(["regular", "new"]).default("new"),
  packageType: z.enum(["cash", "in_kind"]).default("cash"),
  inKindDescription: z.string().max(1000).optional().default(""),
  contact: z.string().max(120).default(""),
  email: z.string().max(160).default(""),
  phone: z.string().max(40).default(""),
  amount: z.number().min(0).max(1e12).default(0),
  events: z.number().int().min(0).max(100000).default(0),
  since: z.string().max(40).optional().transform((v) => (v && v.trim() ? v.trim() : new Date().toISOString().slice(0, 10))),
  status: z.enum(["active", "expired"]).default("active"),
});

export const createSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => sponsorInput.parse(d))
  .handler(async ({ data, context }): Promise<Sponsor> => {
    return fetchNestApiFromServer<Sponsor>("/sponsors", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const updateSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => sponsorInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Sponsor> => {
    const { id, ...rest } = data;
    return fetchNestApiFromServer<Sponsor>(`/sponsors/${id}`, context.token, {
      method: "PUT",
      body: JSON.stringify(rest),
    });
  });

export const deleteSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    return fetchNestApiFromServer<{ ok: boolean }>(`/sponsors/${data.id}`, context.token, {
      method: "DELETE",
    });
  });

// ---------------- Sponsor packages CRUD ----------------

const packageInput = z.object({
  tier: z.enum(["platinum", "gold", "silver", "bronze"]),
  price: z.number().min(0).max(1e12).default(0),
  packageType: z.enum(["cash", "in_kind"]).default("cash"),
  inKindDescription: z.string().max(1000).optional().default(""),
  benefits: z.array(z.string().min(1).max(200)).max(30).default([]),
  available: z.number().int().min(0).max(100000).default(0),
  sold: z.number().int().min(0).max(100000).default(0),
});

export const createSponsorPackageFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => packageInput.parse(d))
  .handler(async ({ data, context }): Promise<SponsorPackage> => {
    return fetchNestApiFromServer<SponsorPackage>("/sponsors/packages", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const updateSponsorPackageFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => packageInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<SponsorPackage> => {
    const { id, ...rest } = data;
    return fetchNestApiFromServer<SponsorPackage>(`/sponsors/packages/${id}`, context.token, {
      method: "PUT",
      body: JSON.stringify(rest),
    });
  });

export const deleteSponsorPackageFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    return fetchNestApiFromServer<{ ok: boolean }>(`/sponsors/packages/${data.id}`, context.token, {
      method: "DELETE",
    });
  });

// ---------------- Sponsor onboarding ----------------

const onboardInput = z.object({
  packageId: z.string().min(1).max(128),
  name: z.string().min(1).max(200),
  contact: z.string().max(120).default(""),
  email: z.string().max(160).default(""),
  phone: z.string().max(40).default(""),
});

export const onboardSponsorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => onboardInput.parse(d))
  .handler(async ({ data, context }): Promise<Sponsor> => {
    return fetchNestApiFromServer<Sponsor>("/sponsors/onboard", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

// ---------------- Event Prizes (Lucky Draw & Awards) ----------------

export type PrizeTargetType = "PRODUCT" | "SPONSOR_PACKAGE" | "CUSTOM" | "VOUCHER" | "CASH";

export type EventPrize = {
  id: string;
  eventId: string;
  rankName: string;
  title: string;
  value: string;
  amount: number;
  quantity: number;
  targetType: PrizeTargetType;
  targetId?: string | null;
  sponsorName?: string | null;
  sponsorPackageId?: string | null;
  description: string;
  iconName?: string;
  imageUrl?: string | null;
  highlightColor?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export const listEventPrizesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ eventId: z.string().optional() }).optional().parse(d))
  .handler(async ({ data, context }): Promise<EventPrize[]> => {
    try {
      const q = data?.eventId ? `?eventId=${encodeURIComponent(data.eventId)}` : "";
      const res = await fetchNestApiFromServer<EventPrize[]>(`/sponsors/prizes${q}`, context.token);
      return Array.isArray(res) ? res : [];
    } catch (err: any) {
      console.error("[listEventPrizesFn] error:", err);
      return [];
    }
  });

const prizeInput = z.object({
  eventId: z.string().min(1),
  rankName: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  value: z.string().optional(),
  amount: z.number().min(0).optional(),
  quantity: z.number().int().min(1).default(1),
  targetType: z.enum(["PRODUCT", "SPONSOR_PACKAGE", "CUSTOM", "VOUCHER", "CASH"]).default("PRODUCT"),
  targetId: z.string().optional().nullable(),
  sponsorName: z.string().optional().nullable(),
  sponsorPackageId: z.string().optional().nullable(),
  description: z.string().max(2000).optional().default(""),
  iconName: z.string().max(100).optional().default("Gift"),
  imageUrl: z.string().optional().nullable(),
  highlightColor: z.string().optional().default("from-amber-500 to-yellow-600"),
});

export const createEventPrizeFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => prizeInput.parse(d))
  .handler(async ({ data, context }): Promise<EventPrize> => {
    return fetchNestApiFromServer<EventPrize>("/sponsors/prizes", context.token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const updateEventPrizeFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => prizeInput.partial().extend({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<EventPrize> => {
    const { id, ...rest } = data;
    return fetchNestApiFromServer<EventPrize>(`/sponsors/prizes/${id}`, context.token, {
      method: "PUT",
      body: JSON.stringify(rest),
    });
  });

export const deleteEventPrizeFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    return fetchNestApiFromServer<{ ok: boolean }>(`/sponsors/prizes/${data.id}`, context.token, {
      method: "DELETE",
    });
  });
