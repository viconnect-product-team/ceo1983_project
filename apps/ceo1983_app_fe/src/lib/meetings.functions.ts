import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireNestAuth } from "@/integrations/supabase/nest-auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fetchNestApiFromServer } from "./api-client";

const getDb = (ctx?: any) => ctx?.supabase || supabaseAdmin;

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
  const rawTarget = parseTargetMembers(m.target_members);
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
    let nestData: any[] = [];
    try {
      const res = await fetchNestApiFromServer("/meetings", context.token);
      if (Array.isArray(res)) nestData = res;
    } catch {
      // ignore
    }

    const { data } = await getDb(context)
      .from("meetings")
      .select("*")
      .order("date", { ascending: false });

    const rawList = Array.isArray(data) ? [...data] : [];
    const seen = new Set<string>(rawList.map((r: any) => String(r.id || r.code)));

    for (const item of nestData) {
      const idKey = String(item.id || item.code);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        rawList.push(item);
      }
    }

    return rawList.map((r: any) => mapMeeting(r as Row));
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

    // Validate địa điểm cuộc họp trực tiếp
    if (data.location && !data.zoomUrl) {
      const { data: conflicts } = await getDb(context)
        .from("meetings")
        .select("code, title, date, time, location")
        .eq("date", data.date)
        .neq("status", "cancelled");

      const cleanLoc = data.location.trim().toLowerCase();
      const matched = (conflicts || []).find(
        (c: any) =>
          c.location &&
          c.location.trim().toLowerCase() === cleanLoc &&
          c.time === data.time,
      );

      if (matched) {
        const [h, m] = (data.time || "09:30").split(":").map(Number);
        const endHour = String((h || 9) + 2).padStart(2, "0");
        const endMin = String(m || 0).padStart(2, "0");
        const [yyyy, mm, dd] = data.date.split("-");
        const nextTime = `${endHour}:${endMin} ngày ${dd}/${mm}/${yyyy}`;
        throw new Error(
          `Địa điểm này đang trùng với cuộc họp "${matched.title}", sau thời gian ${nextTime} có thể đăng ký được.`,
        );
      }
    }

    const genId = crypto.randomUUID();
    const dbPayload = {
      id: genId,
      code,
      title: data.title,
      type: data.type,
      date: data.date,
      time: data.time,
      location: data.location || (data.zoomUrl ? "Họp trực tuyến" : "Văn phòng Hiệp hội CEO 1983"),
      attendees: data.attendees || 2,
      status: data.status,
      department: data.department,
      target_members: enrichedTargetMembers,
      zoom_url: data.zoomUrl,
      cancel_reason: data.cancelReason,
      association_id: "c1983000-0000-4000-8000-000000001983",
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

    // 1. Gửi thông báo đến Member App CEO 1983 (public.member_notifications & public.business_notifications)
    const notifTitle = data.isUrgent
      ? `[🔥 CUỘC HỌP KHẨN CẤP] ${data.title}`
      : `[LỊCH HỌP BCH / BAN] ${data.title}`;
    const venueInfo = data.zoomUrl
      ? `Trực tuyến: ${data.zoomUrl}`
      : `Trực tiếp tại: ${data.location || "Văn phòng Hiệp hội CEO 1983, Hà Nội"}`;
    const notifBody = `Cuộc họp ${data.department || "Ban Điều Hành"} do ${data.creatorName || "Ban Thư Ký"} (${data.creatorRole || "Điều phối"}) triệu tập vào lúc ${data.time} ngày ${data.date}. Hình thức: ${venueInfo}.${data.isUrgent ? " Đề nghị đại biểu có mặt đầy đủ để xử lý việc khẩn cấp." : " Kính mời Quý đại biểu tham dự đúng giờ."}`;

    try {
      await getDb(context).from("member_notifications").insert({
        id: crypto.randomUUID(),
        recipient_id: "all",
        title: notifTitle,
        body: notifBody,
        read: false,
        dismissed: false,
        ref_type: "meeting",
        ref_id: genId,
      });
      await getDb(context).from("business_notifications").insert({
        id: crypto.randomUUID(),
        recipient_user_id: "00000000-0000-0000-0000-000000000000",
        source_domain: "meeting",
        source_record_id: genId,
        dedupe_key: `meet_${genId}`,
        event_kind: "meeting_scheduled",
        notification_kind: "meeting_invite",
        title_key: notifTitle,
        body_key: notifBody,
        safe_display_data: { meetingId: genId, title: data.title, time: data.time, date: data.date, venue: venueInfo },
        priority: data.isUrgent ? "urgent" : "normal",
        status: "delivered",
        app_scope: "all",
        target_app: "all",
      });
    } catch (e) {
      console.warn("Could not insert meeting notifications:", e);
    }

    // 2. Gửi tin nhắn chính thức vào kênh chuyên trách trong CEO 1983 App (public.messages)
    try {
      let targetChannel = "channel_secretariat";
      const deptLower = (data.department || "").toLowerCase();
      if (deptLower.includes("truyền thông") || deptLower.includes("media")) {
        targetChannel = "channel_media";
      } else if (deptLower.includes("thành viên") || deptLower.includes("hội viên")) {
        targetChannel = "channel_membership";
      } else if (deptLower.includes("xúc tiến") || deptLower.includes("thương mại")) {
        targetChannel = "channel_promotion";
      }

      const msgText = `🏛️ [THÔNG BÁO LỊCH HỌP - ${data.department || "BCH HIỆP HỘI"}]\n${data.title}\n- Thời gian: ${data.time} ngày ${data.date}\n- Hình thức: ${venueInfo}\n- Người triệu tập: ${data.creatorName || "Ban Thư Ký"} (${data.creatorRole || "Điều phối"})\n${data.isUrgent ? "⚠️ CUỘC HỌP ĐỘT XUẤT QUAN TRỌNG. Kính đề nghị Quý Đại biểu sắp xếp tham gia đầy đủ!" : "Kính mời Quý Đại biểu có mặt đúng giờ để cuộc họp diễn ra hiệu quả."}`;

      await getDb(context).from("messages").insert([
        {
          id: crypto.randomUUID(),
          from_id: "system",
          to_id: targetChannel,
          text: msgText,
        },
        {
          id: crypto.randomUUID(),
          from_id: "system",
          to_id: "group_ceo1983_broadcast",
          text: msgText,
        },
      ]);
    } catch (msgErr) {
      console.warn("Could not post meeting message:", msgErr);
    }

    // 3. Đẩy email thông báo lời mời họp tới các thành viên tham gia
    try {
      const emailList: string[] = [];
      if (data.creatorEmail && data.creatorEmail.includes("@")) {
        emailList.push(data.creatorEmail);
      }
      if (Array.isArray(data.targetMembers)) {
        for (const tm of data.targetMembers) {
          const em = typeof tm === "string" ? tm : tm?.email;
          if (em && em.includes("@") && !emailList.includes(em)) {
            emailList.push(em);
          }
        }
      }

      if (emailList.length > 0) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #003B95; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #003B95; margin: 0;">HIỆP HỘI DOANH NHÂN CEO 1983</h2>
              <p style="color: #d97706; font-weight: bold; margin: 4px 0 0;">THƯ MỜI THAM DỰ CUỘC HỌP CHÍNH THỨC</p>
            </div>
            <h3 style="color: #1e293b; margin-top: 0;">${data.title}</h3>
            <div style="background: #f8fafc; border-left: 4px solid #003B95; padding: 12px 16px; margin-bottom: 16px; border-radius: 4px;">
              <p style="margin: 4px 0;"><strong>Thời gian:</strong> ${data.time} ngày ${data.date}</p>
              <p style="margin: 4px 0;"><strong>Hình thức:</strong> ${venueInfo}</p>
              <p style="margin: 4px 0;"><strong>Phòng ban / Đơn vị:</strong> ${data.department || "Ban Điều Hành"}</p>
              <p style="margin: 4px 0;"><strong>Người chủ trì:</strong> ${data.creatorName} (${data.creatorRole})</p>
              ${data.isUrgent ? `<p style="margin: 4px 0; color: #dc2626;"><strong>Lưu ý:</strong> Cuộc họp đột xuất khẩn cấp: "${data.urgentReason || 'Yêu cầu có mặt đầy đủ'}"</p>` : ''}
            </div>
            ${data.zoomUrl ? `
              <div style="text-align: center; margin: 24px 0;">
                <a href="${data.zoomUrl}" style="background: #003B95; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
                  👉 Bấm vào phòng họp trực tuyến
                </a>
              </div>
            ` : ''}
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;">
              Kính đề nghị Quý Đại biểu chuẩn bị tài liệu và tham dự đúng giờ để đảm bảo tiến độ điều hành chung của Hiệp hội.
            </p>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
              Văn phòng Ban Thư Ký Hiệp hội Doanh nhân CEO 1983<br/>
              Tòa nhà V-Tower, 649 Kim Mã, Ba Đình, Hà Nội • Hotline: 0983 000 198
            </div>
          </div>
        `;

        for (const toEmail of emailList.slice(0, 10)) {
          void fetchNestApiFromServer("/mail/send-direct", context.token, {
            method: "POST",
            body: JSON.stringify({
              to: toEmail,
              subject: `[THƯ MỜI HỌP CEO 1983] ${data.title}`,
              html: emailHtml,
              text: notifBody,
            }),
          }).catch((err) => console.warn(`Mail dispatch to ${toEmail} error:`, err?.message));
        }
      }
    } catch (mailErr) {
      console.warn("Mail dispatch error:", mailErr);
    }

    return mapMeeting(row);
  });

export const updateMeetingFn = createServerFn({ method: "POST" })
  .middleware([requireNestAuth])
  .inputValidator((d: unknown) => meetingInput.extend({ id: z.string().min(1).max(128) }).parse(d))
  .handler(async ({ data, context }): Promise<Meeting> => {
    const { logActivity } = await import("./crud.server");
    const { id, targetMembers, zoomUrl, cancelReason, platform, creatorRole, creatorName, creatorPhone, creatorEmail, isUrgent, urgentReason, ...rest } = data;

    // Validate địa điểm cuộc họp trực tiếp khi cập nhật
    if (data.location && !zoomUrl) {
      const { data: conflicts } = await getDb(context)
        .from("meetings")
        .select("code, title, date, time, location")
        .eq("date", data.date)
        .neq("code", id)
        .neq("status", "cancelled");

      const cleanLoc = data.location.trim().toLowerCase();
      const matched = (conflicts || []).find(
        (c: any) =>
          c.location &&
          c.location.trim().toLowerCase() === cleanLoc &&
          c.time === data.time,
      );

      if (matched) {
        const [h, m] = (data.time || "09:30").split(":").map(Number);
        const endHour = String((h || 9) + 2).padStart(2, "0");
        const endMin = String(m || 0).padStart(2, "0");
        const [yyyy, mm, dd] = data.date.split("-");
        const nextTime = `${endHour}:${endMin} ngày ${dd}/${mm}/${yyyy}`;
        throw new Error(
          `Địa điểm này đang trùng với cuộc họp "${matched.title}", sau thời gian ${nextTime} có thể đăng ký được.`,
        );
      }
    }

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

    // If this was a 1-on-1 connection appointment, dual-cancel in business_meetings
    if (data.id.startsWith("MT-CONN-")) {
      const apptId = data.id.replace("MT-CONN-", "");
      await db
        .from("business_meetings")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", apptId)
        .catch(() => {});
    }

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
      const targetMembers = parseTargetMembers(meetingRow?.target_members);

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
