import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { fetchNestApiFromServer } from "./api-client";

export type MeetingPlatform = "ZOOM" | "GOOGLE_MEET" | "UNIWORK" | "OFFLINE_UNIWORK" | "OFFLINE_CUSTOM";
export type MeetingCreatorRole = "QUẢN_TRỊ" | "ADMIN" | "TỔNG_THƯ_KÝ" | "TRƯỞNG_BAN" | "CHỦ_TỊCH";

export type Meeting = {
  id: string;
  title: string;
  type: "board" | "committee" | "general";
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: "pending_approval" | "upcoming" | "completed" | "cancelled";
  department?: string;
  targetMembers?: any[];
  zoomUrl?: string;
  cancelReason?: string | null;
  // Enhanced Fields
  platform?: MeetingPlatform;
  creatorRole?: MeetingCreatorRole;
  creatorName?: string;
  creatorPhone?: string;
  creatorEmail?: string;
  isUrgent?: boolean;
  urgentReason?: string;
};

type Row = Record<string, unknown>;

function parseTargetMembers(target: unknown): any[] {
  if (!target) return [];
  if (Array.isArray(target)) return target;
  if (typeof target === "string") {
    try {
      const parsed = JSON.parse(target);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch {
      return [target];
    }
  }
  if (typeof target === "object") return [target];
  return [];
}

function mapMeeting(m: Row): Meeting {
  const rawTarget = parseTargetMembers(m.target_members || m.targetMembers);
  const metaObj = rawTarget.find((item: any) => item && typeof item === "object" && item._creatorMeta)?._creatorMeta;
  const zoomUrl = (m.zoom_url as string) || (m.zoomUrl as string) || "";

  let platform: MeetingPlatform = metaObj?.platform || "ZOOM";
  if (!metaObj?.platform) {
    if (zoomUrl.includes("meet.google.com")) platform = "GOOGLE_MEET";
    else if (zoomUrl.includes("uniwork")) platform = "UNIWORK";
    else platform = "ZOOM";
  }

  // Fallback defaults
  const dept = (m.department as string) ?? "";
  let defRole: MeetingCreatorRole = "TỔNG_THƯ_KÝ";
  let defName = "Lê Hoàng Long (Tổng thư ký)";
  let defPhone = "0983 000 001";
  let defEmail = "ceo.tongthuky@ceo1983.com";

  if (m.type === "board") {
    defRole = "CHỦ_TỊCH";
    defName = "Chủ tịch CLB CEO 1983";
    defPhone = "0983 198 383";
    defEmail = "chutich@ceo1983.com";
  } else if (dept.includes("Thành viên")) {
    defRole = "TRƯỞNG_BAN";
    defName = "Nguyễn Văn Cường (Trưởng ban thành viên)";
    defPhone = "0983 000 002";
    defEmail = "ceo.thanhvien@ceo1983.com";
  } else if (dept.includes("Tài chính")) {
    defRole = "TRƯỞNG_BAN";
    defName = "Vũ Thu Trang (Trưởng ban tài chính)";
    defPhone = "0983 000 003";
    defEmail = "ceo.taichinh@ceo1983.com";
  } else if (dept.includes("Truyền thông")) {
    defRole = "TRƯỞNG_BAN";
    defName = "Phạm Quang Huy (Trưởng ban truyền thông)";
    defPhone = "0983 000 004";
    defEmail = "ceo.truyenthong@ceo1983.com";
  } else if (dept.includes("Xúc tiến")) {
    defRole = "TRƯỞNG_BAN";
    defName = "Hoàng Minh Tuấn (Trưởng ban xúc tiến)";
    defPhone = "0983 000 005";
    defEmail = "ceo.xuctien@ceo1983.com";
  } else if (dept.includes("Thiện nguyện")) {
    defRole = "TRƯỞNG_BAN";
    defName = "Trần Bích Thủy (Trưởng ban thiện nguyện)";
    defPhone = "0983 000 011";
    defEmail = "ceo.thiennguyen@ceo1983.com";
  }

  return {
    id: (m.code || m.id) as string,
    title: (m.title as string) || "Cuộc họp Ban",
    type: ((m.type as Meeting["type"]) || "general"),
    date: m.date ? (m.date instanceof Date ? m.date.toISOString().slice(0, 10) : String(m.date).slice(0, 10)) : "",
    time: ((m.time as string) || (m.timeRange as string) || ""),
    location: ((m.location as string) || (m.venue as string) || ""),
    attendees: Number(m.attendees ?? 2),
    status: ((m.status as Meeting["status"]) || "upcoming"),
    department: ((m.department as string) || ""),
    targetMembers: rawTarget.filter((item: any) => !(item && typeof item === "object" && item._creatorMeta)),
    zoomUrl: zoomUrl,
    cancelReason: ((m.cancel_reason as string) || (m.cancelReason as string) || null),
    platform,
    creatorRole: metaObj?.creatorRole || defRole,
    creatorName: metaObj?.creatorName || defName,
    creatorPhone: metaObj?.creatorPhone || defPhone,
    creatorEmail: metaObj?.creatorEmail || defEmail,
    isUrgent: metaObj?.isUrgent ?? false,
    urgentReason: metaObj?.urgentReason ?? "",
  };
}

export const listMeetingsFn = createServerFn({ method: "GET" })
  .middleware([requireNestAuth])
  .handler(async ({ context }): Promise<Meeting[]> => {
    try {
      const res = await fetchNestApiFromServer<any[]>("/meetings", context.token);
      if (Array.isArray(res)) {
        return res.map((r: any) => mapMeeting(r as Row));
      }
    } catch (err: any) {
      console.warn("NestJS /meetings fetch failed:", err?.message);
    }
    return [];
  });

const meetingInput = z.object({
  title: z.string().min(1).max(300),
  type: z.enum(["board", "committee", "general"]),
  date: z.string().min(1).max(40),
  time: z.string().max(40).default(""),
  location: z.string().max(200).default(""),
  attendees: z.number().int().min(0).max(100000).default(0),
  status: z.enum(["pending_approval", "upcoming", "completed", "cancelled"]).default("upcoming"),
  department: z.string().default(""),
  targetMembers: z.array(z.any()).default([]),
  zoomUrl: z.string().default(""),
  cancelReason: z.string().nullable().optional(),
  // Extended fields
  platform: z.enum(["ZOOM", "GOOGLE_MEET", "UNIWORK", "OFFLINE_UNIWORK", "OFFLINE_CUSTOM"]).default("ZOOM"),
  creatorRole: z.enum(["QUẢN_TRỊ", "ADMIN", "TỔNG_THƯ_KÝ", "TRƯỞNG_BAN", "CHỦ_TỊCH"]).default("TỔNG_THƯ_KÝ"),
  creatorName: z.string().default(""),
  creatorPhone: z.string().default(""),
  creatorEmail: z.string().default(""),
  isUrgent: z.boolean().default(false),
  urgentReason: z.string().default(""),
});

export const createMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => meetingInput.parse(d))
  .handler(async ({ data, context }): Promise<Meeting> => {
    const { genCode } = await import("./crud.server");
    const code = genCode("MT");

    // Package creator meta into target_members safely
    const enrichedTargetMembers = [
      ...data.targetMembers.filter((item: any) => !(item && typeof item === "object" && item._creatorMeta)),
      {
        _creatorMeta: {
          platform: data.platform,
          creatorRole: data.creatorRole,
          creatorName: data.creatorName,
          creatorPhone: data.creatorPhone,
          creatorEmail: data.creatorEmail,
          isUrgent: data.isUrgent,
          urgentReason: data.urgentReason,
        },
      },
    ];

    const payload = {
      ...data,
      code,
      location: data.location || (data.zoomUrl ? "Họp trực tuyến" : "Văn phòng Hiệp hội CEO 1983"),
      venue: data.location || (data.zoomUrl ? "Họp trực tuyến" : "Văn phòng Hiệp hội CEO 1983"),
      targetMembers: enrichedTargetMembers,
      zoomUrl: data.zoomUrl,
    };

    const res = await fetchNestApiFromServer<any>("/meetings", context.token, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const row = res?.row || res || payload;
    return mapMeeting(row);
  });

export const updateMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => meetingInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Meeting> => {
    const { id, targetMembers, zoomUrl, cancelReason, platform, creatorRole, creatorName, creatorPhone, creatorEmail, isUrgent, urgentReason, ...rest } = data;

    const enrichedTargetMembers = [
      ...targetMembers.filter((item: any) => !(item && typeof item === "object" && item._creatorMeta)),
      {
        _creatorMeta: {
          platform,
          creatorRole,
          creatorName,
          creatorPhone,
          creatorEmail,
          isUrgent,
          urgentReason,
        },
      },
    ];

    const payload = {
      ...rest,
      id,
      targetMembers: enrichedTargetMembers,
      zoomUrl,
      cancelReason,
      location: data.location,
      venue: data.location,
    };

    const res = await fetchNestApiFromServer<any>(`/meetings/${encodeURIComponent(id)}`, context.token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    const row = res?.row || res || payload;
    return mapMeeting(row);
  });

export const cancelMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator(
    (d: unknown) =>
      z
        .object({
          id: z.string().min(1).max(128),
          reason: z.string().min(1).max(500),
        })
        .parse(d),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await fetchNestApiFromServer(`/meetings/${encodeURIComponent(data.id)}/cancel`, context.token, {
      method: "POST",
      body: JSON.stringify({ reason: data.reason }),
    });
    return { ok: true };
  });

export const deleteMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    await fetchNestApiFromServer(`/meetings/${encodeURIComponent(data.id)}`, context.token, {
      method: "DELETE",
    });
    return { ok: true };
  });
