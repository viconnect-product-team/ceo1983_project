/**
 * Centralized HTTP Client for CEO 1983 Application
 * Provides unified request execution, header management, JWT injection, and error handling.
 */

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("vibe_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

export function getBaseApiUrl(): string {
  if (typeof window !== "undefined") {
    // 1. Capacitor native shell check
    const isCapacitorLocal = Boolean(
      window.location.protocol === "capacitor:" ||
      ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
        (!window.location.port || window.location.port === "80" || window.location.port === "443"))
    );
    if (isCapacitorLocal) {
      return "https://crm.ceo1983.viconnect.vn";
    }

    // 2. Running in browser HTTPS / reverse proxy
    if (
      window.location.protocol === "https:" ||
      (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
    ) {
      return "";
    }
    return "";
  }

  // 3. Server-side rendering (SSR / Nitro container)
  return (
    (typeof process !== "undefined" && (process.env?.NEST_API_URL || process.env?.VITE_API_URL)) ||
    (typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_API_URL) ||
    "http://127.0.0.1:4000"
  );
}

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, params, headers: customHeaders, ...customOptions } = options;

  let urlPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!urlPath.startsWith("/api")) {
    urlPath = `/api${urlPath}`;
  }

  let fullUrl = `${getBaseApiUrl()}${urlPath}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `${fullUrl.includes("?") ? "&" : "?"}${queryString}`;
    }
  }

  const effectiveToken = token ?? getStoredToken();

  const headers = new Headers(customHeaders);
  if (!headers.has("Content-Type") && !(customOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (effectiveToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${effectiveToken}`);
  }

  const response = await fetch(fullUrl, {
    ...customOptions,
    headers,
  });

  if (response.status === 204) {
    return null as T;
  }

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `Yêu cầu thất bại với mã lỗi HTTP ${response.status} (${response.statusText})`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const httpClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
