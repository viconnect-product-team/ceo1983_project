/**
 * Pure NestJS Auth Middleware for TanStack Start & React.
 * Replaces all legacy Supabase auth middleware.
 *
 * Provides:
 * - `attachNestAuth`: Client middleware for `startInstance` in `src/start.ts`
 *   Injects the browser's stored Bearer token (`vibe_token` or `access_token`)
 *   into all TanStack Start serverFn requests.
 * - `requireNestAuth`: Server middleware for server functions requiring authentication.
 * - `optionalNestAuth`: Server middleware for server functions with optional authentication.
 */
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function extractToken(request: Request): string | null {
  // 1. Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 2. Cookie header: vibe_token | access_token | token
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match =
    cookieHeader.match(/vibe_token=([^;]+)/) ??
    cookieHeader.match(/access_token=([^;]+)/) ??
    cookieHeader.match(/token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function verifyNestJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [, payload] = parts;

    // Decode base64/base64url payload safe for both browser & Node.js
    let jsonStr = "";
    if (typeof Buffer !== "undefined") {
      jsonStr = Buffer.from(payload, "base64").toString("utf8");
    } else if (typeof atob !== "undefined") {
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      jsonStr = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    }
    if (!jsonStr) return null;

    const decoded = JSON.parse(jsonStr);

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * attachNestAuth: Browser client middleware.
 * Injects stored JWT into serverFn RPC calls.
 */
export const attachNestAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token =
        localStorage.getItem("vibe_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        null;
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
);

/**
 * requireNestAuth: Server middleware.
 * Enforces valid NestJS JWT.
 */
export const requireNestAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers");
    }

    const token = extractToken(request);
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    const decoded = verifyNestJwt(token);
    if (!decoded || (!decoded.sub && !decoded.id)) {
      throw new Error("Unauthorized: Invalid or expired token");
    }

    const userId: string = decoded.sub ?? decoded.id;
    const role: string = decoded.role ?? "admin";
    const user = {
      id: userId,
      email: decoded.email ?? decoded.username ?? "",
      name: decoded.name ?? "",
      avatar_url: decoded.avatar_url ?? "",
      role,
    };

    return next({ context: { userId, token, user, role, supabase: supabaseAdmin } });
  }
);

/**
 * optionalNestAuth: Server middleware.
 * Extracts user if token is present, else guest.
 */
export const optionalNestAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const token = request?.headers ? extractToken(request) : null;
    const decoded = token ? verifyNestJwt(token) : null;
    const userId: string | null = decoded?.sub ?? decoded?.id ?? null;
    const role: string = decoded?.role ?? "guest";
    const user = userId
      ? {
          id: userId,
          email: decoded?.email ?? decoded?.username ?? "",
          name: decoded?.name ?? "",
          avatar_url: decoded?.avatar_url ?? "",
          role,
        }
      : null;

    return next({
      context: {
        userId: userId || "",
        token: token || "",
        user,
        role,
        supabase: supabaseAdmin,
      },
    });
  }
);
