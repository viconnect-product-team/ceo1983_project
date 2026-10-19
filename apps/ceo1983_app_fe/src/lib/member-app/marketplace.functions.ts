import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "@/lib/api-client";
import { relTime } from "./shared";

export type MyProduct = {
  id: string;
  name: string;
  company: string;
  category: string;
  likes: number;
  views: number;
  time: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  price?: string;
  priceNumber?: number;
  originalPrice?: string;
  memberPrice?: string;
  unit?: string;
  currency?: string;
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerPhone?: string;
  sellerCompany?: string;
  quoteRequestsCount?: number;
  status?: string;
};

// ---------- Products ----------
export const listMyProducts = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: any): Promise<MyProduct[]> => {
    try {
      const token = context?.token;
      let items = await fetchNestApiFromServer<any[]>("/marketplace/products", token).catch(() => null);
      if (!items || !Array.isArray(items) || items.length === 0) {
        items = await fetchNestApiFromServer<any[]>("/products", token).catch(() => []);
      }
      return (items ?? []).map((p: any) => {
        let imgs: string[] = [];
        if (Array.isArray(p.imageUrls)) imgs = p.imageUrls;
        else if (Array.isArray(p.image_urls)) imgs = p.image_urls;
        else if (typeof p.imageUrls === "string" && p.imageUrls.startsWith("[")) {
          try { imgs = JSON.parse(p.imageUrls); } catch {}
        } else if (typeof p.image_urls === "string" && p.image_urls.startsWith("[")) {
          try { imgs = JSON.parse(p.image_urls); } catch {}
        }
        const img = (imgs.length > 0 ? imgs[0] : null) || p.imageUrl || p.image_url || p.image || null;
        if (img && !imgs.includes(img)) imgs = [img, ...imgs];

        const numPrice = Number(p.price || p.priceNumber || 0) || (parseInt(String(p.price || "").replace(/\D/g, ""), 10) || 0);
        const formattedPrice = p.priceText || (numPrice > 0 ? `${numPrice.toLocaleString("vi-VN")} đ` : (p.price ? String(p.price) : "Thỏa thuận"));
        return {
          id: String(p.id),
          name: p.name || p.title || "Sản phẩm doanh nghiệp",
          company: p.company || p.association_name || p.category || "CLB Doanh Nhân CEO 1983",
          category: p.category || "Sản phẩm & Dịch vụ",
          likes: p.likes ?? 0,
          views: p.views ?? 0,
          time: p.createdAt || p.created_at || p.time || new Date().toISOString(),
          description: p.description || p.desc || "",
          imageUrl: img,
          imageUrls: imgs,
          videoUrl: p.videoUrl || p.video_url || undefined,
          unit: p.unit || "Gói",
          currency: p.currency || "VND",
          price: formattedPrice,
          priceNumber: numPrice,
          originalPrice: p.originalPrice || p.original_price ? `${Number(p.originalPrice || p.original_price).toLocaleString("vi-VN")} đ` : undefined,
          memberPrice: p.memberPrice || p.member_price ? `${Number(p.memberPrice || p.member_price).toLocaleString("vi-VN")} đ` : undefined,
          sellerId: p.sellerId || p.seller_id || p.userId || p.user_id || p.authorId || p.author_id,
          sellerName: p.sellerName || p.seller_name || p.userName || p.user_name || p.contactName || p.company,
          sellerAvatar: p.sellerAvatar || p.seller_avatar || p.avatar || null,
          sellerPhone: p.sellerPhone || p.seller_phone || p.phone || null,
          sellerCompany: p.sellerCompany || p.seller_company || p.company || null,
        };
      });
    } catch {
      return [];
    }
  });

export const requestQuote = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        productId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(1000000).optional(),
        message: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any): Promise<{ ok: boolean }> => {
    const token = context?.token;
    try {
      return await fetchNestApiFromServer<{ ok: boolean }>("/marketplace/quotes", token, {
        method: "POST",
        body: data,
      });
    } catch {
      return fetchNestApiFromServer<{ ok: boolean }>("/products/quote", token, {
        method: "POST",
        body: data,
      });
    }
  });
