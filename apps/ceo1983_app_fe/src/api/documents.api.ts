import { httpClient, type RequestOptions } from "./http-client";

export interface DocumentDTO {
  id: string;
  name: string;
  category: string;
  type: string;
  size?: number;
  url?: string;
  sharedWith?: string[];
  starred?: boolean;
  createdAt: string;
  updatedAt?: string;
  uploaderName?: string;
}

export const documentsApi = {
  list: (options?: RequestOptions) =>
    httpClient.get<DocumentDTO[]>("/documents", options),

  create: (data: Partial<DocumentDTO>, options?: RequestOptions) =>
    httpClient.post<DocumentDTO>("/documents", data, options),

  update: (id: string, data: Partial<DocumentDTO>, options?: RequestOptions) =>
    httpClient.put<DocumentDTO>(`/documents/${encodeURIComponent(id)}`, data, options),

  toggleStar: (id: string, options?: RequestOptions) =>
    httpClient.patch<{ ok: boolean; starred: boolean }>(
      `/documents/${encodeURIComponent(id)}/star`,
      {},
      options
    ),

  delete: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/documents/${encodeURIComponent(id)}`, options),
};
