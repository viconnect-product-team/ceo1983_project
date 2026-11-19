import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/lib/auth-middleware";
import { fetchNestApiFromServer } from "./api-client";

export type AdminBenefit = {
  id: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  sortOrder: number;
};

type Row = Record<string, unknown>;

function mapBenefit(r: Row): AdminBenefit {
  return {
    id: (r.id as string) || "",
    titleVi: (r.title_vi as string) || (r.titleVi as string) || "",
    titleEn: (r.title_en as string) || (r.titleEn as string) || "",
    descVi: (r.desc_vi as string) || (r.descVi as string) || "",
    descEn: (r.desc_en as string) || (r.descEn as string) || "",
    sortOrder: Number(r.sort_order ?? r.sortOrder ?? 0),
  };
}

export const listBenefitsAdminFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<AdminBenefit[]> => {
    try {
      const data = await fetchNestApiFromServer<Row[]>("/members/benefits/admin", context.token);
      return (data ?? []).map(mapBenefit);
    } catch {
      return [];
    }
  });

const benefitInput = z.object({
  titleVi: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().max(200).default(""),
  descVi: z.string().trim().max(400).default(""),
  descEn: z.string().trim().max(400).default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createBenefitFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => benefitInput.parse(d))
  .handler(async ({ data, context }): Promise<AdminBenefit> => {
    const res = await fetchNestApiFromServer<Row>("/members/benefits/admin", context.token, {
      method: "POST",
      body: JSON.stringify({
        title_vi: data.titleVi,
        title_en: data.titleEn,
        desc_vi: data.descVi,
        desc_en: data.descEn,
        sort_order: data.sortOrder,
      }),
    });
    return mapBenefit(res);
  });

export const updateBenefitFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator(
    (d: unknown) =>
      z.object({
        id: z.string().uuid(),
        patch: benefitInput.partial(),
      }).parse(d),
  )
  .handler(async ({ data, context }): Promise<AdminBenefit> => {
    const body: Record<string, unknown> = {};
    if (data.patch.titleVi !== undefined) body.title_vi = data.patch.titleVi;
    if (data.patch.titleEn !== undefined) body.title_en = data.patch.titleEn;
    if (data.patch.descVi !== undefined) body.desc_vi = data.patch.descVi;
    if (data.patch.descEn !== undefined) body.desc_en = data.patch.descEn;
    if (data.patch.sortOrder !== undefined) body.sort_order = data.patch.sortOrder;

    const res = await fetchNestApiFromServer<Row>(`/members/benefits/admin/${data.id}`, context.token, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return mapBenefit(res);
  });

export const deleteBenefitFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await fetchNestApiFromServer(`/members/benefits/admin/${data.id}`, context.token, {
      method: "DELETE",
    });
    return { ok: true };
  });

export const reorderBenefitsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator(
    (d: unknown) =>
      z.object({
        items: z.array(
          z.object({
            id: z.string().uuid(),
            sortOrder: z.coerce.number().int().min(0).max(9999),
          }),
        ),
      }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    for (const item of data.items) {
      await fetchNestApiFromServer(`/members/benefits/admin/${item.id}`, context.token, {
        method: "PUT",
        body: JSON.stringify({ sort_order: item.sortOrder }),
      });
    }
    return { ok: true };
  });
