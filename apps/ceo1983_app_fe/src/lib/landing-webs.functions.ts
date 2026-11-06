import { createServerFn } from "@tanstack/react-start";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "./api-client";
import type { LandingWebConfig, LandingApiConfig } from "@/components/landing/TimedCardsOpeningLanding";

export const listLandingWebsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }: { context: any }): Promise<LandingWebConfig[]> => {
    try {
      const res = await fetchNestApiFromServer<LandingWebConfig[]>("/admin/landing-webs", context.token);
      if (Array.isArray(res)) return res;
    } catch (err: any) {
      console.warn("[listLandingWebsFn] Nest API error:", err?.message);
    }
    return [];
  });

export const getLandingWebByIdFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => d as { id: string })
  .handler(async ({ data, context }: { data: { id: string }; context: any }): Promise<LandingWebConfig | null> => {
    try {
      const res = await fetchNestApiFromServer<LandingWebConfig>(`/admin/landing-webs/${data.id}`, context.token);
      return res || null;
    } catch (err: any) {
      console.warn("[getLandingWebByIdFn] Nest API error:", err?.message);
      return null;
    }
  });

export const createLandingWebFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator(
    (d: unknown) =>
      d as {
        name: string;
        slug: string;
        subdomain?: string;
        template?: "timed_cards_opening" | "ceo1983_executive" | "startup_mobile_showcase";
      }
  )
  .handler(
    async ({
      data,
      context,
    }: {
      data: {
        name: string;
        slug: string;
        subdomain?: string;
        template?: "timed_cards_opening" | "ceo1983_executive" | "startup_mobile_showcase";
      };
      context: any;
    }): Promise<LandingWebConfig> => {
      return fetchNestApiFromServer<LandingWebConfig>("/admin/landing-webs", context.token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
  );

export const updateLandingWebFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => d as { id: string; config: Partial<LandingWebConfig> })
  .handler(
    async ({
      data,
      context,
    }: {
      data: { id: string; config: Partial<LandingWebConfig> };
      context: any;
    }): Promise<LandingWebConfig> => {
      return fetchNestApiFromServer<LandingWebConfig>(`/admin/landing-webs/${data.id}`, context.token, {
        method: "PUT",
        body: JSON.stringify(data.config),
      });
    }
  );

export const deleteLandingWebFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => d as { id: string })
  .handler(
    async ({
      data,
      context,
    }: {
      data: { id: string };
      context: any;
    }): Promise<{ success: boolean; message: string }> => {
      return fetchNestApiFromServer<{ success: boolean; message: string }>(
        `/admin/landing-webs/${data.id}`,
        context.token,
        { method: "DELETE" }
      );
    }
  );

export const applySubdomainFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => d as { id: string; subdomain: string })
  .handler(
    async ({
      data,
      context,
    }: {
      data: { id: string; subdomain: string };
      context: any;
    }): Promise<LandingWebConfig> => {
      return fetchNestApiFromServer<LandingWebConfig>(
        `/admin/landing-webs/${data.id}/apply-subdomain`,
        context.token,
        {
          method: "POST",
          body: JSON.stringify({ subdomain: data.subdomain }),
        }
      );
    }
  );

export const testApiConnectorFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => d as { apiConfig: LandingApiConfig })
  .handler(
    async ({
      data,
      context,
    }: {
      data: { apiConfig: LandingApiConfig };
      context: any;
    }): Promise<any> => {
      return fetchNestApiFromServer<any>("/admin/landing-webs/test-api", context.token, {
        method: "POST",
        body: JSON.stringify(data.apiConfig),
      });
    }
  );

export const getPublicLandingWebFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => d as { slugOrSubdomain: string })
  .handler(async ({ data }: { data: { slugOrSubdomain: string } }): Promise<LandingWebConfig | null> => {
    try {
      const res = await fetchNestApiFromServer<LandingWebConfig>(
        `/public/landing-webs/${encodeURIComponent(data.slugOrSubdomain)}`
      );
      return res || null;
    } catch (err: any) {
      console.warn("[getPublicLandingWebFn] API error:", err?.message);
      return null;
    }
  });
