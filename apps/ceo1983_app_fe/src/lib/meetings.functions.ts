import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

export type MeetingPlatform = "ZOOM" | "GOOGLE_MEET" | "UNIWORK";
export type MeetingCreatorRole = "CHỦ_TỊCH" | "TỔNG_THƯ_KÝ" | "ADMIN" | "TRƯỞNG_BAN";

export type Meeting = {
  id: string;
  title: string;
  type: "board" | "committee" | "general";
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: "upcoming" | "completed" | "cancelled";
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

function mapMeeting(m: Row): Meeting {
  const rawTarget = (m.target_members as any[]) ?? [];
  const metaObj = rawTarget.find((item: any) => item && typeof item === "object" && item._creatorMeta)?._creatorMeta;
  const zoomUrl = (m.zoom_url as string) ?? "";

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
    id: m.code as string,
    title: m.title as string,
    type: m.type as Meeting["type"],
    date: m.date ? (m.date instanceof Date ? m.date.toISOString().slice(0, 10) : String(m.date).slice(0, 10)) : "",
    time: (m.time as string) ?? "",
    location: (m.location as string) ?? "",
    attendees: Number(m.attendees ?? 0),
    status: m.status as Meeting["status"],
    department: (m.department as string) ?? "",
    targetMembers: rawTarget.filter((item: any) => !(item && typeof item === "object" && item._creatorMeta)),
    zoomUrl: zoomUrl,
    cancelReason: (m.cancel_reason as string) ?? null,
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
    const { data, error } = await getDb(context)
      .from("meetings")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: any) => mapMeeting(r as Row));
  });

const meetingInput = z.object({
  title: z.string().min(1).max(300),
  type: z.enum(["board", "committee", "general"]),
  date: z.string().min(1).max(40),
  time: z.string().max(40).default(""),
  location: z.string().max(200).default(""),
  attendees: z.number().int().min(0).max(100000).default(0),
  status: z.enum(["upcoming", "completed", "cancelled"]),
  department: z.string().default(""),
  targetMembers: z.array(z.any()).default([]),
  zoomUrl: z.string().default(""),
  cancelReason: z.string().nullable().optional(),
  // Extended fields
  platform: z.enum(["ZOOM", "GOOGLE_MEET", "UNIWORK"]).default("ZOOM"),
  creatorRole: z.enum(["CHỦ_TỊCH", "TỔNG_THƯ_KÝ", "ADMIN", "TRƯỞNG_BAN"]).default("TỔNG_THƯ_KÝ"),
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
    const { genCode, logActivity } = await import("./crud.server");
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

    const dbPayload = {
      code,
      title: data.title,
      type: data.type,
      date: data.date,
      time: data.time,
      location: data.location,
      attendees: data.attendees,
      status: data.status,
      department: data.department,
      target_members: enrichedTargetMembers,
      zoom_url: data.zoomUrl,
      cancel_reason: data.cancelReason,
    };
    const { data: row, error } = await getDb(context)
      .from("meetings")
      .insert(dbPayload)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(getDb(context), {
      action: data.isUrgent ? "Tạo cuộc họp khẩn cấp đột xuất" : "Tạo cuộc họp ban",
      target: code,
      category: "meeting",
    });
    return mapMeeting(row);
  });

export const updateMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => meetingInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Meeting> => {
    const { logActivity } = await import("./crud.server");
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

    const dbUpdate = {
      ...rest,
      target_members: enrichedTargetMembers,
      zoom_url: zoomUrl,
      cancel_reason: cancelReason,
    };
    const { data: row, error } = await getDb(context)
      .from("meetings")
      .update(dbUpdate)
      .eq("code", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(getDb(context), {
      action: "Cập nhật / Sắp xếp lại lịch cuộc họp",
      target: id,
      category: "meeting",
    });
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
    const { logActivity } = await import("./crud.server");
    const db = getDb(context);

    // Fetch meeting details before updating
    const { data: meetingRow } = await db
      .from("meetings")
      .select("*")
      .eq("code", data.id)
      .single();

    const { error } = await db
      .from("meetings")
      .update({
        status: "cancelled",
        cancel_reason: data.reason,
      })
      .eq("code", data.id);
    if (error) throw new Error(error.message);

    await logActivity(db, {
      action: "Hủy cuộc họp và phát thông báo",
      target: data.id,
      category: "meeting",
    });

    // Dispatch notifications and inbox messages to target members
    try {
      const title = meetingRow?.title || "Cuộc họp Ban";
      const dateStr = meetingRow?.date || "";
      const timeStr = meetingRow?.time || "";
      const locationStr = meetingRow?.location || "";
      const targetMembers = (meetingRow?.target_members as any[]) || [];

      const notifTitle = `[HỦY CUỘC HỌP] ${title}`;
      const notifBody = `Cuộc họp "${title}" dự kiến diễn ra vào ${timeStr ? timeStr + ' ' : ''}${dateStr} tại ${locationStr || 'Trụ sở CLB'} ĐÃ BỊ HỦY.\n- Lý do: "${data.reason}".\nBan Thư Ký CLB CEO 1983 trân trọng thông báo đến Quý Anh/Chị.`;

      // 1. Log into CRM notifications
      const crmNotifCode = `CANCEL-MT-${Date.now().toString().slice(-6)}`;
      await db.from("notifications").insert({
        code: crmNotifCode,
        title: notifTitle,
        body: notifBody,
        audience: "all",
        channel: "inapp",
        status: "sent",
        reach: Math.max(targetMembers.length, 1),
      }).catch(() => {});

      // 2. Direct message and in-app alert to each target member
      for (const m of targetMembers) {
        const targetCode = typeof m === "string" ? m : m?.code || m?.id || m?.memberCode;
        if (targetCode) {
          const directMsg = `[THÔNG BÁO HỦY CUỘC HỌP BAN]\nKính gửi Anh/Chị,\n${notifBody}`;
          await db.from("messages").insert({
            from_id: "ADMIN",
            to_id: String(targetCode).toLowerCase(),
            text: directMsg,
          }).catch(() => {});

          await db.from("member_notifications").insert({
            recipient_id: String(targetCode),
            title: notifTitle,
            body: notifBody,
            read: false,
            dismissed: false,
            ref_type: "meeting",
            ref_id: data.id,
          }).catch(() => {});
        }
      }
    } catch (e: any) {
      console.warn("Failed to dispatch meeting cancellation alerts:", e?.message);
    }

    return { ok: true };
  });

export const deleteMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { logActivity } = await import("./crud.server");
    const db = getDb(context);
    try {
      const { fetchNestApiFromServer } = await import("./api-client");
      await fetchNestApiFromServer(`/meetings/${encodeURIComponent(data.id)}`, context.token, {
        method: "DELETE",
      });
    } catch {}

    await db.from("meetings").delete().eq("code", data.id);
    await db.from("meetings").delete().eq("id", data.id);

    await logActivity(db, {
      action: "Xóa cuộc họp",
      target: data.id,
      category: "meeting",
    });
    return { ok: true };
  });
