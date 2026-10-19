import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { NewsArticle } from "@/lib/extra-data";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "@/lib/api-client";

type Row = Record<string, unknown>;

function mapNews(n: Row): NewsArticle {
  return {
    id: (n.code || n.id) as string,
    title: n.title as string,
    category: (n.category as string) || "",
    author: (n.author as string) || "",
    publishedAt: (n.published_at as string) || (n.publishedAt as string) || "—",
    views: (n.views as number) ?? 0,
    status: (n.status as NewsArticle["status"]) || "published",
    excerpt: (n.excerpt as string) ?? "",
    image: (n.cover_image as string) || (n.coverImage as string) || (n.image as string) || "",
  };
}

export const listNewsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<NewsArticle[]> => {
    const token = (context as any)?.token;
    try {
      const nestNews = await fetchNestApiFromServer<any[]>("/content/admin/news", token);
      if (Array.isArray(nestNews)) {
        return nestNews.map((n: any) => mapNews(n as Row));
      }
    } catch (e: any) {
      console.warn("NestJS /content/admin/news error:", e?.message);
    }
    return [];
  });

const newsInput = z.object({
  title: z.string().min(1).max(300),
  category: z.string().min(1).max(100),
  author: z.string().min(1).max(120),
  publishedAt: z.string().max(40).default("—"),
  status: z.enum(["published", "draft", "scheduled"]),
  excerpt: z.string().max(2000).default(""),
  image: z.string().optional().default(""),
});

export const createNewsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => newsInput.parse(d))
  .handler(async ({ data, context }): Promise<NewsArticle> => {
    const token = (context as any)?.token;
    const created = await fetchNestApiFromServer<any>("/content/admin/news", token, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        cover_image: data.image || null,
        coverImage: data.image || null,
        associationId: "c1983000-0000-4000-8000-000000001983",
      }),
    });

    if (created && (created.id || created.code)) {
      return mapNews(created as Row);
    }

    return {
      id: `NEWS-${Date.now().toString(36).toUpperCase()}`,
      title: data.title,
      category: data.category,
      author: data.author,
      publishedAt: data.publishedAt,
      views: 0,
      status: data.status,
      excerpt: data.excerpt,
      image: data.image || "",
    };
  });

export const updateNewsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => newsInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<NewsArticle> => {
    const token = (context as any)?.token;
    const updated = await fetchNestApiFromServer<any>(`/content/admin/news/${encodeURIComponent(data.id)}`, token, {
      method: "PUT",
      body: JSON.stringify({
        ...data,
        cover_image: data.image || null,
        coverImage: data.image || null,
      }),
    });

    if (updated && (updated.id || updated.code)) {
      return mapNews(updated as Row);
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      author: data.author,
      publishedAt: data.publishedAt,
      views: 0,
      status: data.status,
      excerpt: data.excerpt,
      image: data.image || "",
    };
  });

export const deleteNewsFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const token = (context as any)?.token;
    await fetchNestApiFromServer<any>(`/content/admin/news/${encodeURIComponent(data.id)}`, token, {
      method: "DELETE",
    });
    return { ok: true };
  });
