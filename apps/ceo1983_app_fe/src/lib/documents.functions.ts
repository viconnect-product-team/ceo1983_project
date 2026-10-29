import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "./api-client";

export type Document = {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  type: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "csv" | "zip" | "rar" | "png" | "jpg" | "jpeg" | "folder" | "other";
  docScope?: "association" | "enterprise";
  enterpriseName?: string;
  enterpriseId?: string;
  filePath?: string;
  url?: string;
  fileUrl?: string;
  folderId?: string | null;
  driveUrl?: string | null;
  isFolder?: boolean;
  shareScope?: "public" | "internal" | "specific" | "private";
  shareRole?: "viewer" | "downloader" | "editor";
  sharedWith?: any[];
  isStarred?: boolean;
  colorTag?: string | null;
  description?: string | null;
};

export const listDocumentsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Document[]> => {
    const { token } = context as any;
    const data = await fetchNestApiFromServer("/documents", token);
    return data ?? [];
  });

const docInput = z.object({
  name: z.string().min(1).max(300),
  category: z.string().min(1).max(100),
  size: z.string().max(40).default(""),
  uploadedBy: z.string().max(120).default(""),
  type: z.enum([
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "csv",
    "zip",
    "rar",
    "png",
    "jpg",
    "jpeg",
    "folder",
    "other",
  ]),
  filePath: z.string().max(500).default(""),
  docScope: z.enum(["association", "enterprise"]).default("association").optional(),
  enterpriseName: z.string().max(255).optional(),
  enterpriseId: z.string().max(128).optional(),
  folderId: z.string().max(128).optional().nullable(),
  driveUrl: z.string().max(1000).optional().nullable(),
  isFolder: z.boolean().optional(),
  shareScope: z.enum(["public", "internal", "specific", "private"]).optional(),
  shareRole: z.enum(["viewer", "downloader", "editor"]).optional(),
  sharedWith: z.any().optional(),
  isStarred: z.boolean().optional(),
  colorTag: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => docInput.parse(d))
  .handler(async ({ data, context }): Promise<Document> => {
    const { token } = context as any;
    return fetchNestApiFromServer("/documents", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const updateDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => docInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Document> => {
    const { token } = context as any;
    const { id, ...body } = data;
    return fetchNestApiFromServer(`/documents/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  });

export const toggleStarDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ id: string; isStarred: boolean }> => {
    const { token } = context as any;
    return fetchNestApiFromServer(`/documents/${data.id}/star`, token, {
      method: "PATCH",
    });
  });

export const updateShareDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().min(1).max(128),
    shareScope: z.string(),
    shareRole: z.string(),
    sharedWith: z.any().optional(),
  }).parse(d))
  .handler(async ({ data, context }): Promise<any> => {
    const { token } = context as any;
    const { id, ...body } = data;
    return fetchNestApiFromServer(`/documents/${id}/share`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  });

export const moveDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().min(1).max(128),
    targetFolderId: z.string().nullable(),
  }).parse(d))
  .handler(async ({ data, context }): Promise<any> => {
    const { token } = context as any;
    return fetchNestApiFromServer("/documents/move", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

/** Issues a short-lived URL for the document's attached file. */
export const getDocumentUrlFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ url: string; name?: string } | null> => {
    const { token } = context as any;
    const res = await fetchNestApiFromServer(`/documents/${data.id}/url`, token);
    if (!res || !res.url) return null;
    
    let resolvedUrl = res.url;
    if (!resolvedUrl.startsWith("http")) {
      const cleanUrl = resolvedUrl.startsWith("/api") ? resolvedUrl : `/api${resolvedUrl.startsWith("/") ? resolvedUrl : `/${resolvedUrl}`}`;
      const apiHost = process.env.VITE_PUBLIC_API_URL || process.env.VITE_API_URL || "";
      resolvedUrl = apiHost ? `${apiHost}${cleanUrl}` : cleanUrl;
    }
    return { url: resolvedUrl, name: res.name };
  });

export const deleteDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { token } = context as any;
    return fetchNestApiFromServer(`/documents/${data.id}`, token, {
      method: "DELETE",
    });
  });
