import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Opportunity, OpportunityInterest, OpportunityTypeKey } from "./opportunities-data";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "./api-client";

type Row = Record<string, unknown>;

const TYPE_VALUES = [
  "opp.type.partnership",
  "opp.type.investment",
  "opp.type.supply",
  "opp.type.demand",
  "opp.type.distribution",
  "opp.type.other",
] as const;

function mapOpportunity(r: Row): Opportunity {
  return {
    id: r.id as string,
    posterId: (r.poster_id || r.posterId) as string,
    posterName: ((r.poster_name || r.posterName) as string) ?? undefined,
    posterAvatar: ((r.poster_avatar || r.posterAvatar) as string) ?? undefined,
    title: r.title as string,
    description: ((r.description as string) ?? ""),
    type: (r.type as OpportunityTypeKey) ?? "opp.type.partnership",
    budgetMin: r.budget_min != null ? Number(r.budget_min) : r.budgetMin != null ? Number(r.budgetMin) : undefined,
    budgetMax: r.budget_max != null ? Number(r.budget_max) : r.budgetMax != null ? Number(r.budgetMax) : undefined,
    region: ((r.region as string) ?? ""),
    industry: ((r.industry as string) ?? ""),
    deadline: (r.deadline as string) ?? new Date().toISOString(),
    status: (r.status as Opportunity["status"]) ?? "open",
    createdAt: (r.created_at || r.createdAt) as string,
    views: ((r.views as number) ?? 0),
    emoji: (r.emoji as string) ?? "💡",
    contactName: ((r.contact_name || r.contactName) as string) ?? undefined,
    contactPhone: ((r.contact_phone || r.contactPhone) as string) ?? undefined,
    contactTitle: ((r.contact_title || r.contactTitle) as string) ?? undefined,
    company: (r.company as string) ?? undefined,
    image: ((r.image || r.image_url || r.imageUrl) as string) ?? undefined,
    claimedById: ((r.claimed_by_id || r.claimedById) as string) ?? undefined,
    claimedByName: ((r.claimed_by_name || r.claimedByName) as string) ?? undefined,
    claimedAt: ((r.claimed_at || r.claimedAt) as string) ?? undefined,
    claimedPhone: ((r.claimed_phone || r.claimedPhone) as string) ?? undefined,
    claimedCompany: ((r.claimed_company || r.claimedCompany) as string) ?? undefined,
  };
}

function mapInterest(r: Row): OpportunityInterest {
  return {
    id: r.id as string,
    opportunityId: (r.opportunity_id || r.opportunityId) as string,
    memberId: (r.member_id || r.memberId) as string,
    message: ((r.message as string) ?? ""),
    contact: ((r.contact as string) ?? ""),
    createdAt: (r.created_at || r.createdAt) as string,
  };
}

export const listOpportunitiesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      opportunities: Opportunity[];
      interests: OpportunityInterest[];
      interestCounts: Record<string, number>;
    }> => {
      const token = (context as any)?.token;
      try {
        const res = await fetchNestApiFromServer<{
          opportunities: Opportunity[];
          interests: OpportunityInterest[];
          interestCounts: Record<string, number>;
        }>("/opportunities", token);
        if (res && res.opportunities) {
          return {
            opportunities: res.opportunities.map((r: any) => mapOpportunity(r as Row)),
            interests: (res.interests || []).map((r: any) => mapInterest(r as Row)),
            interestCounts: res.interestCounts || {},
          };
        }
      } catch (err: any) {
        console.warn("NestJS /opportunities fetch failed:", err?.message);
      }

      return {
        opportunities: [],
        interests: [],
        interestCounts: {},
      };
    },
  );

export const getOpportunityFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ opportunity: Opportunity; interests: OpportunityInterest[] } | null> => {
      const token = (context as any)?.token;
      try {
        const res = await fetchNestApiFromServer<{
          opportunity: Opportunity;
          interests: OpportunityInterest[];
        }>(`/opportunities/${encodeURIComponent(data.id)}`, token);
        if (res && res.opportunity) {
          return {
            opportunity: mapOpportunity(res.opportunity as any),
            interests: (res.interests || []).map((i: any) => mapInterest(i as any)),
          };
        }
      } catch (err: any) {
        console.warn("NestJS /opportunities/:id fetch failed:", err?.message);
      }
      return null;
    },
  );

const safeImageSchema = z.preprocess((val) => {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if ("url" in (val as any) && typeof (val as any).url === "string") {
      return (val as any).url;
    }
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first?.url) return first.url;
    }
  }
  return String(val);
}, z.string().optional());

export const createOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        type: z.enum(TYPE_VALUES),
        budgetMin: z.number().min(0).max(1e15).optional(),
        budgetMax: z.number().min(0).max(1e15).optional(),
        region: z.string().min(1).max(200),
        industry: z.string().min(1).max(200),
        deadline: z.string().min(1).max(64),
        emoji: z.string().min(1).max(16).optional(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactTitle: z.string().optional(),
        company: z.string().optional(),
        image: safeImageSchema,
        imageUrl: safeImageSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Opportunity> => {
    const token = (context as any)?.token;
    const res = await fetchNestApiFromServer<{ ok: boolean; id: string }>("/opportunities", token, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const newId = res?.id || `OPP-${Date.now().toString(36).toUpperCase()}`;
    return mapOpportunity({
      id: newId,
      ...data,
      created_at: new Date().toISOString(),
      views: 0,
      status: "open",
    } as any);
  });

export const updateOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        type: z.enum(TYPE_VALUES),
        budgetMin: z.number().min(0).max(1e15).optional(),
        budgetMax: z.number().min(0).max(1e15).optional(),
        region: z.string().min(1).max(200),
        industry: z.string().min(1).max(200),
        deadline: z.string().min(1).max(64),
        emoji: z.string().min(1).max(16).optional(),
        status: z.enum(["open", "closed"]).optional(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        contactTitle: z.string().optional(),
        company: z.string().optional(),
        image: safeImageSchema,
        imageUrl: safeImageSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Opportunity | null> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer(`/opportunities/${encodeURIComponent(data.id)}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    try {
      const updated = await fetchNestApiFromServer<{ opportunity: Opportunity }>(
        `/opportunities/${encodeURIComponent(data.id)}`,
        token,
      );
      if (updated?.opportunity) {
        return mapOpportunity(updated.opportunity as any);
      }
    } catch {
      // fallback to input
    }
    return mapOpportunity({ ...data } as any);
  });

export const deleteOpportunityFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer(`/opportunities/${encodeURIComponent(data.id)}`, token, {
      method: "DELETE",
    });
    return { ok: true };
  });

export const toggleOpportunityStatusFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Opportunity | null> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer(`/opportunities/${encodeURIComponent(data.id)}/toggle-status`, token, {
      method: "PATCH",
    });
    const updated = await fetchNestApiFromServer<{ opportunity: Opportunity }>(
      `/opportunities/${encodeURIComponent(data.id)}`,
      token,
    );
    if (updated?.opportunity) {
      return mapOpportunity(updated.opportunity as any);
    }
    return null;
  });

export const expressInterestFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        opportunityId: z.string().min(1).max(128),
        message: z.string().min(1).max(4000),
        contact: z.string().min(1).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<OpportunityInterest> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer(`/opportunities/${encodeURIComponent(data.opportunityId)}/interests`, token, {
      method: "POST",
      body: JSON.stringify({ message: data.message, contact: data.contact, interestLevel: "high" }),
    });
    return {
      id: `int-${Date.now()}`,
      opportunityId: data.opportunityId,
      memberId: (context as any)?.userId || "",
      message: data.message,
      contact: data.contact,
      createdAt: new Date().toISOString(),
    };
  });
