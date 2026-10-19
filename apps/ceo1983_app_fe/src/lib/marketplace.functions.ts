import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth, optionalNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer, NEST_API_URL } from "./api-client";
import type { Product, ProductCategoryKey, QuoteRequest } from "./marketplace-data";

type Row = Record<string, unknown>;

/** Normalizes a stored value (bucket path or legacy signed URL) to a bucket path. */
function toStoragePath(v: string | null | undefined): string | null {
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return v; // already a path
  const m = v.match(/\/object\/(?:sign|public)\/product-media\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Get signed URL for one media path via NestJS (server-to-server). */
async function getSignedUrl(token: string | null | undefined, path: string): Promise<string | null> {
  if (!path) return null;
  // Non-Supabase URLs (NestJS upload, external) pass through as-is
  if (path.startsWith("/upload/") || path.startsWith("/uploads/") || (path.startsWith("http") && !path.includes("supabase.co/storage"))) {
    return path.startsWith("/upload/") || path.startsWith("/uploads/")
      ? `${NEST_API_URL}/api${path}`
      : path;
  }
  const storagePath = toStoragePath(path);
  if (!storagePath) return path;
  try {
    const res = await fetchNestApiFromServer<{ signedUrl: string | null }>(
      "/connect-app/me/media/signed-url",
      token,
      { method: "POST", body: JSON.stringify({ path: storagePath }) },
    );
    return res?.signedUrl ?? path;
  } catch {
    return path;
  }
}

async function signMediaValues(token: string | null | undefined, values: string[]): Promise<string[]> {
  const results = await Promise.all(values.map((v) => getSignedUrl(token, v)));
  return results.filter((u): u is string => !!u);
}

/** Applies short-lived signed URLs to a product's image/pdf paths for display. */
async function signProduct(token: string | null | undefined, p: Product): Promise<Product> {
  const [imageUrls, pdfSigned] = await Promise.all([
    signMediaValues(token, p.imageUrls ?? []),
    p.pdfUrl ? signMediaValues(token, [p.pdfUrl]) : Promise.resolve([]),
  ]);
  return { ...p, imageUrls, pdfUrl: pdfSigned[0] ?? "" };
}

async function signProducts(token: string | null | undefined, ps: Product[]): Promise<Product[]> {
  return Promise.all(ps.map((p: any) => signProduct(token, p)));
}

function mapProduct(r: Row): Product {
  return {
    id: r.id as string,
    sellerId: (r.seller_id || r.sellerId) as string,
    title: (r.title || r.name) as string,
    description: ((r.description as string) ?? ""),
    price: Number(r.price || 0),
    originalPrice: r.original_price != null ? Number(r.original_price) : r.originalPrice != null ? Number(r.originalPrice) : undefined,
    memberPrice: r.member_price != null ? Number(r.member_price) : r.memberPrice != null ? Number(r.memberPrice) : undefined,
    unit: ((r.unit as string) ?? "Gói"),
    company: ((r.company as string) ?? "CLB Doanh Nhân CEO 1983"),
    sellerName: ((r.seller_name || r.sellerName) as string) ?? undefined,
    sellerPhone: ((r.seller_phone || r.sellerPhone) as string) ?? undefined,
    sellerAvatar: ((r.seller_avatar || r.sellerAvatar) as string) ?? undefined,
    category: (r.category as ProductCategoryKey) || "mk.cat.product",
    status: (r.status as Product["status"]) || "active",
    createdAt: (r.created_at || r.createdAt || new Date().toISOString()) as string,
    views: ((r.views as number) ?? 0),
    emoji: (r.emoji as string) ?? "🛍️",
    pdfUrl: ((r.pdf_url || r.pdfUrl) as string) ?? "",
    imageUrls: (() => {
      const list = (r.image_urls || r.imageUrls || (r.images ? (Array.isArray(r.images) ? r.images : [r.images]) : [])) as string[] ?? [];
      const single = (r.image_url || r.imageUrl || r.image || r.avatar) as string | undefined;
      return Array.isArray(list) && list.length > 0 ? list : (single ? [single] : []);
    })(),
    websiteUrl: ((r.website_url || r.websiteUrl) as string) ?? "",
    facebookUrl: ((r.facebook_url || r.facebookUrl) as string) ?? "",
  };
}

function mapQuote(r: Row): QuoteRequest {
  return {
    id: r.id as string,
    productId: (r.product_id || r.productId) as string,
    buyerId: (r.buyer_id || r.buyerId) as string,
    quantity: Number(r.quantity ?? 1),
    message: ((r.message as string) ?? ""),
    contact: ((r.contact as string) ?? ""),
    status: (((r.status as string) ?? "sent") as QuoteRequest["status"]),
    reminderCount: Number(r.reminder_count ?? r.reminderCount ?? 0),
    cancelReason: ((r.cancel_reason || r.cancelReason) as string) ?? "",
    createdAt: (r.created_at || r.createdAt || new Date().toISOString()) as string,
    updatedAt: (r.updated_at || r.updatedAt || r.created_at || r.createdAt || new Date().toISOString()) as string,
  };
}

export const listProductsFn = createServerFn({ method: "GET" })
  .middleware([optionalNestAuth])
  .handler(async ({ context }): Promise<Product[]> => {
    const token = (context as any)?.token;
    try {
      const nestProducts = await fetchNestApiFromServer<any[]>("/marketplace/products", token);
      if (Array.isArray(nestProducts) && nestProducts.length > 0) {
        const mapped = nestProducts.map((p: any) => mapProduct(p as Row));
        return signProducts(token, mapped);
      }
    } catch (e: any) {
      console.warn("NestJS /marketplace/products call warning:", e?.message);
    }
    return [];
  });

export const getProductFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(
    async ({ data, context }): Promise<{ product: Product; quotes: QuoteRequest[] } | null> => {
      const token = (context as any)?.token;
      try {
        const res = await fetchNestApiFromServer<{ product: any; quotes: any[] }>(`/marketplace/products/${encodeURIComponent(data.id)}`, token);
        if (res && res.product) {
          const mappedProd = mapProduct(res.product as Row);
          const mappedQuotes: QuoteRequest[] = (res.quotes ?? []).map((q: any) => mapQuote(q as Row));
          return {
            product: await signProduct(token, mappedProd),
            quotes: mappedQuotes,
          };
        }
      } catch (e: any) {
        console.warn("NestJS /marketplace/products/:id warning:", e?.message);
      }
      return null;
    },
  );

export const createProductFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        sellerId: z.string().min(1).max(128).optional(),
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        price: z.number().min(0).max(1e15),
        originalPrice: z.number().min(0).max(1e15).optional(),
        memberPrice: z.number().min(0).max(1e15).optional(),
        unit: z.string().max(50).optional(),
        company: z.string().max(255).optional(),
        sellerName: z.string().max(255).optional(),
        sellerPhone: z.string().max(50).optional(),
        category: z.string().min(1).max(100),
        emoji: z.string().min(1).max(16).optional(),
        pdfUrl: z.string().max(2000).optional(),
        imageUrls: z.array(z.string().max(2000)).max(10).optional(),
        websiteUrl: z.string().max(500).optional(),
        facebookUrl: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Product> => {
    const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const token = (context as any)?.token;
    const res = await fetchNestApiFromServer<any>("/marketplace/products", token, {
      method: "POST",
      body: JSON.stringify({
        id,
        title: data.title.trim(),
        name: data.title.trim(),
        description: data.description.trim(),
        price: Math.round(data.price),
        originalPrice: data.originalPrice != null ? Math.round(data.originalPrice) : Math.round(data.price),
        memberPrice: data.memberPrice != null ? Math.round(data.memberPrice) : Math.round(data.price),
        unit: data.unit?.trim() || "Gói",
        company: data.company?.trim() || "CLB Doanh Nhân CEO 1983",
        sellerName: data.sellerName?.trim() || "Hội viên CLB",
        sellerPhone: data.sellerPhone?.trim() || "",
        category: data.category,
        status: "active",
        emoji: data.emoji ?? "🛍️",
        pdfUrl: data.pdfUrl || "",
        imageUrl: data.imageUrls?.[0] || "",
        imageUrls: (data.imageUrls ?? []).filter(Boolean),
        websiteUrl: data.websiteUrl || "",
        facebookUrl: data.facebookUrl || "",
      }),
    }).catch((err) => {
      console.warn("createProductFn NestJS call warning:", err?.message);
      return { ok: true, id };
    });

    return {
      id: res?.id || id,
      sellerId: data.sellerId || "ceo1983",
      sellerName: data.sellerName?.trim() || "Hội viên CLB",
      sellerPhone: data.sellerPhone?.trim() || "",
      title: data.title.trim(),
      description: data.description.trim(),
      price: Math.round(data.price),
      originalPrice: data.originalPrice != null ? Math.round(data.originalPrice) : Math.round(data.price),
      memberPrice: data.memberPrice != null ? Math.round(data.memberPrice) : Math.round(data.price),
      unit: data.unit?.trim() || "Gói",
      company: data.company?.trim() || "CLB Doanh Nhân CEO 1983",
      category: data.category as any,
      status: "active",
      views: 0,
      emoji: data.emoji ?? "🛍️",
      pdfUrl: data.pdfUrl || undefined,
      imageUrls: data.imageUrls ?? [],
      websiteUrl: data.websiteUrl || undefined,
      facebookUrl: data.facebookUrl || undefined,
      createdAt: new Date().toISOString(),
    };
  });

export const updateProductFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        sellerId: z.string().min(1).max(128).optional(),
        title: z.string().min(1).max(300),
        description: z.string().min(1).max(4000),
        price: z.number().min(0).max(1e15),
        originalPrice: z.number().min(0).max(1e15).optional(),
        memberPrice: z.number().min(0).max(1e15).optional(),
        unit: z.string().max(50).optional(),
        company: z.string().max(255).optional(),
        sellerName: z.string().max(255).optional(),
        sellerPhone: z.string().max(50).optional(),
        category: z.string().min(1).max(100),
        emoji: z.string().min(1).max(16).optional(),
        pdfUrl: z.string().max(2000).optional(),
        imageUrls: z.array(z.string().max(2000)).max(10).optional(),
        websiteUrl: z.string().max(500).optional(),
        facebookUrl: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<Product | null> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer<any>(`/marketplace/products/${encodeURIComponent(data.id)}`, token, {
      method: "PUT",
      body: JSON.stringify({
        title: data.title.trim(),
        name: data.title.trim(),
        description: data.description.trim(),
        price: Math.round(data.price),
        originalPrice: data.originalPrice != null ? Math.round(data.originalPrice) : undefined,
        memberPrice: data.memberPrice != null ? Math.round(data.memberPrice) : undefined,
        unit: data.unit?.trim(),
        company: data.company?.trim(),
        category: data.category,
        imageUrls: (data.imageUrls ?? []).filter(Boolean),
      }),
    }).catch(() => null);

    return {
      id: data.id,
      sellerId: data.sellerId || "ceo1983",
      sellerName: data.sellerName?.trim() || "Hội viên CLB",
      sellerPhone: data.sellerPhone?.trim() || "",
      title: data.title.trim(),
      description: data.description.trim(),
      price: Math.round(data.price),
      originalPrice: data.originalPrice != null ? Math.round(data.originalPrice) : Math.round(data.price),
      memberPrice: data.memberPrice != null ? Math.round(data.memberPrice) : Math.round(data.price),
      unit: data.unit?.trim() || "Gói",
      company: data.company?.trim() || "CLB Doanh Nhân CEO 1983",
      category: data.category as ProductCategoryKey,
      status: "active",
      views: 0,
      emoji: data.emoji ?? "🛍️",
      pdfUrl: data.pdfUrl || undefined,
      imageUrls: data.imageUrls ?? [],
      websiteUrl: data.websiteUrl || undefined,
      facebookUrl: data.facebookUrl || undefined,
      createdAt: new Date().toISOString(),
    };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(128), sellerId: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer<any>(`/marketplace/products/${encodeURIComponent(data.id)}`, token, {
      method: "DELETE",
    }).catch(() => null);
    return { ok: true };
  });

export const deleteProductsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        ids: z.array(z.string().min(1).max(128)).min(1).max(200),
        sellerId: z.string().min(1).max(128).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean; count: number }> => {
    const token = (context as any)?.token;
    let count = 0;
    for (const pid of data.ids) {
      await fetchNestApiFromServer<any>(`/marketplace/products/${encodeURIComponent(pid)}`, token, {
        method: "DELETE",
      }).catch(() => null);
      count++;
    }
    return { ok: true, count };
  });

export const toggleSoldFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(128), sellerId: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Product | null> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer<any>(`/marketplace/products/${encodeURIComponent(data.id)}/toggle-sold`, token, {
      method: "PATCH",
    }).catch(() => null);
    return null;
  });

export const createQuoteRequestFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        productId: z.string().min(1).max(128),
        buyerId: z.string().min(1).max(128).optional(),
        quantity: z.number().int().min(1).max(100000),
        message: z.string().min(1).max(4000),
        contact: z.string().min(1).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<QuoteRequest> => {
    const token = (context as any)?.token;
    const res = await fetchNestApiFromServer<any>("/marketplace/quotes", token, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      id: res?.id || `q-${Date.now()}`,
      productId: res?.productId || data.productId,
      buyerId: res?.buyerId || data.buyerId || "",
      quantity: Number(res?.quantity ?? data.quantity),
      message: res?.message ?? data.message,
      contact: res?.contact ?? data.contact,
      status: (res?.status as QuoteRequest["status"]) ?? "sent",
      reminderCount: 0,
      cancelReason: "",
      createdAt: res?.createdAt || new Date().toISOString(),
      updatedAt: res?.createdAt || new Date().toISOString(),
    };
  });

const STATUS_VALUES = ["sent", "viewing", "confirmed", "rejected", "cancelled"] as const;

// Buyer cancels their own pending quote request.
export const cancelQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        buyerId: z.string().min(1).max(128).optional(),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<QuoteRequest | null> => {
    const token = (context as any)?.token;
    const res = await fetchNestApiFromServer<any>(`/marketplace/quotes/${encodeURIComponent(data.id)}/cancel`, token, {
      method: "POST",
      body: JSON.stringify({ reason: data.reason }),
    });

    return {
      id: res?.id || data.id,
      productId: "",
      buyerId: "",
      quantity: 1,
      message: "",
      contact: "",
      status: "cancelled",
      reminderCount: 0,
      cancelReason: data.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

// Seller sends a reminder / follow-up while the request is still pending.
export const remindQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<QuoteRequest | null> => {
    const token = (context as any)?.token;
    const res = await fetchNestApiFromServer<any>(`/marketplace/quotes/${encodeURIComponent(data.id)}/reminder`, token, {
      method: "POST",
    });

    return {
      id: res?.id || data.id,
      productId: "",
      buyerId: "",
      quantity: 1,
      message: "",
      contact: "",
      status: "sent",
      reminderCount: Number(res?.reminderCount ?? 1),
      cancelReason: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

export const updateQuoteStatusFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().min(1).max(128),
        status: z.enum(STATUS_VALUES),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<QuoteRequest | null> => {
    const token = (context as any)?.token;
    const res = await fetchNestApiFromServer<any>(`/marketplace/quotes/${encodeURIComponent(data.id)}/status`, token, {
      method: "PATCH",
      body: JSON.stringify({ status: data.status }),
    });

    return {
      id: res?.id || data.id,
      productId: "",
      buyerId: "",
      quantity: 1,
      message: "",
      contact: "",
      status: data.status,
      reminderCount: 0,
      cancelReason: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

export const deleteQuoteFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer(`/marketplace/quotes/${encodeURIComponent(data.id)}`, token, {
      method: "DELETE",
    });
    return { ok: true };
  });

export const listMyQuotesFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(
    async ({
      context,
    }): Promise<Array<QuoteRequest & { productTitle: string; productEmoji: string }>> => {
      const token = (context as any)?.token;
      try {
        const res = await fetchNestApiFromServer<any[]>("/marketplace/quotes", token);
        if (Array.isArray(res)) {
          return res.map((q: any) => ({
            id: q.id,
            productId: q.productId || q.product_id,
            buyerId: q.buyerId || q.buyer_id,
            quantity: Number(q.quantity ?? 1),
            message: q.message ?? "",
            contact: q.contact ?? "",
            status: q.status ?? "sent",
            reminderCount: Number(q.reminderCount ?? q.reminder_count ?? 0),
            cancelReason: q.cancelReason ?? q.cancel_reason ?? "",
            createdAt: q.createdAt || q.created_at || new Date().toISOString(),
            updatedAt: q.updatedAt || q.updated_at || q.createdAt || new Date().toISOString(),
            productTitle: q.productTitle || q.product_title || "—",
            productEmoji: q.productEmoji || q.product_emoji || "🛍️",
          }));
        }
      } catch (e: any) {
        console.warn("NestJS /marketplace/quotes warning:", e?.message);
      }
      return [];
    },
  );
