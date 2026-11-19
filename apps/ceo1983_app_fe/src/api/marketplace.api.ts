import { httpClient, type RequestOptions } from "./http-client";

export interface ProductDTO {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  memberPrice?: number;
  unit?: string;
  company?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerAvatar?: string;
  category: string;
  status: "active" | "sold" | "draft";
  createdAt: string;
  views: number;
  emoji?: string;
  pdfUrl?: string;
  imageUrls?: string[];
  websiteUrl?: string;
  facebookUrl?: string;
}

export interface QuoteDTO {
  id: string;
  productId: string;
  buyerId: string;
  quantity: number;
  message: string;
  contact: string;
  status: "sent" | "viewing" | "confirmed" | "rejected" | "cancelled";
  createdAt: string;
}

export const marketplaceApi = {
  listProducts: (params?: { category?: string; search?: string }, options?: RequestOptions) =>
    httpClient.get<ProductDTO[]>("/marketplace/products", { ...options, params: params as any }),

  getProduct: (id: string, options?: RequestOptions) =>
    httpClient.get<ProductDTO>(`/marketplace/products/${encodeURIComponent(id)}`, options),

  createProduct: (data: Partial<ProductDTO>, options?: RequestOptions) =>
    httpClient.post<ProductDTO>("/marketplace/products", data, options),

  updateProduct: (id: string, data: Partial<ProductDTO>, options?: RequestOptions) =>
    httpClient.put<ProductDTO>(`/marketplace/products/${encodeURIComponent(id)}`, data, options),

  deleteProduct: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/marketplace/products/${encodeURIComponent(id)}`, options),

  listQuotes: (options?: RequestOptions) =>
    httpClient.get<QuoteDTO[]>("/marketplace/quotes", options),

  requestQuote: (
    data: { productId: string; quantity: number; message: string; contact: string },
    options?: RequestOptions
  ) =>
    httpClient.post<QuoteDTO>("/marketplace/quotes", data, options),

  updateQuoteStatus: (id: string, status: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(
      `/marketplace/quotes/${encodeURIComponent(id)}/status`,
      { status },
      options
    ),
};
