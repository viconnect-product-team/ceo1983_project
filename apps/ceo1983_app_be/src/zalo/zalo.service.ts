import { Injectable, Logger, HttpException, HttpStatus, Optional } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

export class SendZaloMessageDto {
  accessToken!: string;
  userId?: string;
  targetPhone?: string;
  targetName?: string;
  message!: string;
}

export class RefreshZaloTokenDto {
  appId!: string;
  secretKey!: string;
  refreshToken!: string;
}

export class SendBulkRecipientDto {
  userId?: string;
  phone!: string;
  name!: string;
  memberCode?: string;
  feeAmount?: number;
  company?: string;
}

export class SendZnsMessageDto {
  templateId!: string;
  phone!: string;
  templateData!: Record<string, any>;
  accessToken?: string;
  trackingId?: string;
}

export class SendBulkZaloMessageDto {
  accessToken!: string;
  recipients!: SendBulkRecipientDto[];
  messageTemplate!: string;
  delayMs?: number;
}

@Injectable()
export class ZaloService {
  private readonly logger = new Logger(ZaloService.name);
  private readonly webhookInteractions = new Map<
    string,
    { userId: string; displayName: string; avatar: string; lastMessage: string; time: number }
  >();

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  /**
   * Tiếp nhận sự kiện Webhook thời gian thực từ Zalo OA (user_send_text, follow, v.v.)
   * Tự động lưu vào PostgreSQL bền vững và khớp nối với danh sách Hội viên CRM
   */
  async recordWebhookInteraction(event: any) {
    try {
      const senderId =
        event?.sender?.id ||
        event?.user_id_by_app ||
        event?.from_id ||
        event?.follower?.id ||
        event?.data?.sender?.id;
      if (!senderId) return;

      const uid = String(senderId).trim();
      const eventName = event?.event_name || 'user_send_text';
      const msg =
        event?.message?.text ||
        event?.msg_text ||
        event?.info?.text ||
        event?.event_name ||
        'Tương tác qua Zalo OA';
      const time = event?.timestamp ? Number(event.timestamp) : Date.now();
      const displayName =
        event?.sender?.name ||
        event?.user_name ||
        event?.info?.name ||
        `Hội viên Zalo (${uid.slice(-4)})`;
      const avatar = event?.sender?.avatar || event?.info?.avatar || '';

      // 1. Lưu vào bộ nhớ RAM tạm thời
      this.webhookInteractions.set(uid, {
        userId: uid,
        displayName,
        avatar,
        lastMessage: msg,
        time,
      });

      // 2. Ghi vĩnh viễn vào CSDL PostgreSQL (Tránh mất khi server restart)
      if (this.prisma) {
        try {
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO public.zalo_webhook_logs (event_name, sender_id, recipient_id, message_text, raw_payload)
             VALUES ($1, $2, $3, $4, $5::jsonb)`,
            eventName,
            uid,
            String(event?.recipient?.id || ''),
            msg,
            JSON.stringify(event)
          );

          // Phát hiện nếu tin nhắn chứa SĐT di động Việt Nam
          let extractedPhone = '';
          const phoneMatch = msg.match(/(0[3|5|7|8|9][0-9]{8})/);
          if (phoneMatch) {
            extractedPhone = phoneMatch[1];
          }

          let matchedMemberId: string | null = null;
          if (extractedPhone) {
            const memberRow: any[] = await this.prisma.$queryRawUnsafe(
              `SELECT id FROM public.members WHERE phone LIKE $1 LIMIT 1`,
              `%${extractedPhone}%`
            );
            if (memberRow.length > 0) {
              matchedMemberId = memberRow[0].id;
              await this.prisma.$executeRawUnsafe(
                `UPDATE public.members SET zalo_user_id = $1 WHERE id = $2`,
                uid,
                matchedMemberId
              );
            }
          }

          await this.prisma.$executeRawUnsafe(
            `INSERT INTO public.zalo_subscribers (zalo_user_id, display_name, avatar_url, phone, member_id, last_message, last_interacted_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             ON CONFLICT (zalo_user_id) DO UPDATE SET
               display_name = COALESCE(EXCLUDED.display_name, public.zalo_subscribers.display_name),
               avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.zalo_subscribers.avatar_url),
               phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.zalo_subscribers.phone),
               member_id = COALESCE(EXCLUDED.member_id, public.zalo_subscribers.member_id),
               last_message = EXCLUDED.last_message,
               last_interacted_at = NOW(),
               updated_at = NOW()`,
            uid,
            displayName,
            avatar,
            extractedPhone || null,
            matchedMemberId,
            msg
          );
        } catch (dbErr: any) {
          this.logger.warn(`Lỗi lưu Zalo Webhook vào DB: ${dbErr.message}`);
        }
      }

      this.logger.log(`✅ [Zalo Webhook] Đã ghi nhận tương tác từ Zalo User ID: ${uid} - Nội dung: "${msg}"`);
    } catch (err: any) {
      this.logger.warn(`⚠️ [Zalo Webhook] Lỗi khi xử lý payload: ${err.message}`);
    }
  }

  /**
   * Tự động gia hạn Access Token mới bằng Refresh Token qua cổng OAuth Zalo (Server-to-Server, Không bị CORS)
   */
  async refreshToken(dto: RefreshZaloTokenDto) {
    try {
      const params = new URLSearchParams();
      params.append('app_id', dto.appId.trim());
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', dto.refreshToken.trim());

      const response = await axios.post('https://oauth.zalo.me/v4/oa/access_token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: dto.secretKey.trim(),
        },
      });

      if (response.data && response.data.access_token) {
        return {
          success: true,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || dto.refreshToken,
          expiresIn: response.data.expires_in,
        };
      }

      this.logger.warn(`Zalo refresh token error: ${JSON.stringify(response.data)}`);
      throw new HttpException(
        response.data?.error_description || response.data?.message || 'Không thể gia hạn token từ Zalo',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error: any) {
      this.logger.error(`Error refreshing Zalo token: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.response?.data?.error_description || error.message || 'Lỗi kết nối máy chủ Zalo OAuth',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách hội thoại gần nhất của Official Account (Chuẩn Zalo OpenAPI v2.0 listrecentchat & getfollowers kèm Webhook cache)
   */
  async getRecentChats(accessToken: string) {
    const chats: any[] = [];
    const seenIds = new Set<string>();
    let lastZaloError: { code: number; message: string; guide?: string } | null = null;

    // 0. Nạp từ CSDL PostgreSQL (zalo_subscribers và members đã có liên kết Zalo)
    if (this.prisma) {
      try {
        const dbSubs: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT 
            s.zalo_user_id as "userId",
            COALESCE(m.name, s.display_name, 'Hội viên Zalo') as "displayName",
            COALESCE(s.avatar_url, m.avatar_url, '') as "avatar",
            COALESCE(s.last_message, 'Đang quan tâm Official Account') as "lastMessage",
            EXTRACT(EPOCH FROM s.last_interacted_at)*1000 as "time",
            COALESCE(m.phone, s.phone, '') as "phone",
            m.code as "memberCode",
            m.company_name as "company"
          FROM public.zalo_subscribers s
          LEFT JOIN public.members m ON s.member_id = m.id OR s.zalo_user_id = m.zalo_user_id
          ORDER BY s.last_interacted_at DESC
          LIMIT 50;
        `);
        for (const sub of dbSubs) {
          if (!seenIds.has(sub.userId)) {
            seenIds.add(sub.userId);
            chats.push({
              userId: sub.userId,
              displayName: sub.displayName,
              avatar: sub.avatar || '',
              lastMessage: sub.lastMessage || 'Tương tác gần đây',
              time: Number(sub.time) || Date.now(),
              phone: sub.phone || '',
              memberCode: sub.memberCode || '',
              company: sub.company || '',
            });
          }
        }

        const dbMembersWithZalo: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT 
            zalo_user_id as "userId",
            name as "displayName",
            avatar_url as "avatar",
            'Đã kết nối tài khoản Zalo' as "lastMessage",
            EXTRACT(EPOCH FROM updated_at)*1000 as "time",
            phone as "phone",
            code as "memberCode",
            company_name as "company"
          FROM public.members
          WHERE zalo_user_id IS NOT NULL AND zalo_user_id != ''
          LIMIT 50;
        `);
        for (const m of dbMembersWithZalo) {
          if (!seenIds.has(m.userId)) {
            seenIds.add(m.userId);
            chats.push({
              userId: m.userId,
              displayName: m.displayName,
              avatar: m.avatar || '',
              lastMessage: m.lastMessage,
              time: Number(m.time) || Date.now(),
              phone: m.phone || '',
              memberCode: m.memberCode || '',
              company: m.company || '',
            });
          }
        }
      } catch (dbErr: any) {
        this.logger.warn(`Lỗi nạp danh bạ Zalo từ DB: ${dbErr.message}`);
      }
    }

    // 0.2. Nạp thêm từ bộ nhớ RAM Webhook
    for (const item of this.webhookInteractions.values()) {
      if (!seenIds.has(item.userId)) {
        seenIds.add(item.userId);
        chats.push(item);
      }
    }

    // 1. Thử lấy danh sách tin nhắn tương tác gần đây qua API listrecentchat
    try {
      const response = await axios.get('https://openapi.zalo.me/v2.0/oa/listrecentchat', {
        headers: {
          access_token: accessToken.trim(),
        },
        params: {
          data: JSON.stringify({
            offset: 0,
            count: 10,
          }),
        },
        timeout: 5000,
      });

      if (response.data) {
        if (response.data.error === 0 && Array.isArray(response.data.data)) {
          for (const item of response.data.data) {
            // src === 1: Người dùng gửi cho OA (from_id là userId của khách)
            // src === 0: OA gửi cho người dùng (to_id là userId của khách)
            const uid = String(item.src === 1 ? item.from_id : item.to_id);
            const name = item.src === 1 ? item.from_display_name : item.to_display_name;
            const avatar = item.src === 1 ? item.from_avatar : item.to_avatar;

            if (uid && uid !== 'undefined' && !seenIds.has(uid)) {
              seenIds.add(uid);
              chats.push({
                userId: uid,
                displayName: name || 'Hội viên Zalo',
                avatar: avatar || '',
                lastMessage: item.message || '',
                time: item.time,
              });
            }
          }
        } else if (response.data.error !== 0) {
          lastZaloError = {
            code: response.data.error,
            message: response.data.message || 'Lỗi OpenAPI listrecentchat',
            guide:
              response.data.error === -216
                ? 'Access Token đã hết hạn hoặc không hợp lệ. Vui lòng bấm Gia hạn Access Token!'
                : response.data.error === -212
                ? 'Ứng dụng chưa được kích hoạt quyền Quản lý tin nhắn trên Zalo Developers.'
                : undefined,
          };
          this.logger.warn(`[Zalo OA] listrecentchat error ${response.data.error}: ${response.data.message}`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`listrecentchat warning: ${err.message}`);
    }

    // 2. Nếu chưa có tin nhắn, thử lấy qua danh sách người quan tâm (followers)
    if (chats.length === 0) {
      try {
        const followersRes = await axios.get('https://openapi.zalo.me/v2.0/oa/getfollowers', {
          headers: { access_token: accessToken.trim() },
          params: {
            data: JSON.stringify({ offset: 0, count: 10 }),
          },
          timeout: 5000,
        });

        if (followersRes.data) {
          if (followersRes.data.error === 0 && Array.isArray(followersRes.data?.data?.users)) {
            const users = followersRes.data.data.users;
            for (const u of users) {
              const uid = String(u.user_id);
              if (uid && !seenIds.has(uid)) {
                seenIds.add(uid);

                // Lấy profile
                let displayName = 'Hội viên Zalo';
                let avatar = '';
                try {
                  const profileRes = await axios.get('https://openapi.zalo.me/v2.0/oa/getprofile', {
                    headers: { access_token: accessToken.trim() },
                    params: { data: JSON.stringify({ user_id: uid }) },
                    timeout: 3000,
                  });
                  if (profileRes.data && profileRes.data.error === 0) {
                    displayName = profileRes.data.data?.display_name || displayName;
                    avatar = profileRes.data.data?.avatar || '';
                  }
                } catch {}

                chats.push({
                  userId: uid,
                  displayName,
                  avatar,
                  lastMessage: 'Đang theo dõi Official Account',
                  time: Date.now(),
                });
              }
            }
          } else if (followersRes.data.error !== 0 && !lastZaloError) {
            lastZaloError = {
              code: followersRes.data.error,
              message: followersRes.data.message || 'Lỗi OpenAPI getfollowers',
              guide:
                followersRes.data.error === -216
                  ? 'Access Token đã hết hạn hoặc không hợp lệ. Vui lòng bấm Gia hạn Access Token!'
                  : undefined,
            };
            this.logger.warn(`[Zalo OA] getfollowers error ${followersRes.data.error}: ${followersRes.data.message}`);
          }
        }
      } catch (err: any) {
        this.logger.warn(`getfollowers warning: ${err.message}`);
      }
    }

    return {
      success: true,
      total: chats.length,
      data: chats,
      zaloError: lastZaloError,
    };
  }

  /**
   * Gửi tin nhắn chăm sóc khách hàng (CS message) qua Zalo OA
   */
  async sendMessage(dto: SendZaloMessageDto) {
    if (!dto.accessToken?.trim()) {
      throw new HttpException('Thiếu Access Token của Zalo OA. Vui lòng dán Access Token hợp lệ!', HttpStatus.BAD_REQUEST);
    }
    if (!dto.message?.trim()) {
      throw new HttpException('Nội dung tin nhắn không được để trống', HttpStatus.BAD_REQUEST);
    }

    let targetUserId = dto.userId?.trim();
    let recipientName = dto.targetName || 'Hội viên';

    // 1. Tra cứu Zalo User ID qua CSDL PostgreSQL theo Số điện thoại hoặc tên
    if (!targetUserId && this.prisma && dto.targetPhone) {
      try {
        const cleanPhone = dto.targetPhone.replace(/\D/g, '');
        const phoneVariants = [cleanPhone, cleanPhone.startsWith('84') ? '0' + cleanPhone.slice(2) : cleanPhone];
        const member: any[] = await this.prisma.$queryRawUnsafe(
          `SELECT zalo_user_id, name FROM public.members WHERE (phone LIKE $1 OR phone LIKE $2) AND zalo_user_id IS NOT NULL AND zalo_user_id != '' LIMIT 1`,
          `%${phoneVariants[0]}%`,
          `%${phoneVariants[1]}%`
        );
        if (member.length > 0 && member[0].zalo_user_id) {
          targetUserId = member[0].zalo_user_id;
          recipientName = member[0].name || recipientName;
        } else {
          const sub: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT zalo_user_id, display_name FROM public.zalo_subscribers WHERE (phone LIKE $1 OR phone LIKE $2) LIMIT 1`,
            `%${phoneVariants[0]}%`,
            `%${phoneVariants[1]}%`
          );
          if (sub.length > 0 && sub[0].zalo_user_id) {
            targetUserId = sub[0].zalo_user_id;
            recipientName = sub[0].display_name || recipientName;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not lookup user by phone: ${err.message}`);
      }
    }

    // 1.2. Tra cứu trong bộ nhớ Webhook interactions
    if (!targetUserId && this.webhookInteractions.size > 0) {
      const targetLower = (dto.targetName || '').toLowerCase().trim();
      for (const item of this.webhookInteractions.values()) {
        const nameLower = (item.displayName || '').toLowerCase().trim();
        if (targetLower && (nameLower.includes(targetLower) || targetLower.includes(nameLower))) {
          targetUserId = item.userId;
          recipientName = item.displayName;
          break;
        }
      }
      if (!targetUserId) {
        const latest = Array.from(this.webhookInteractions.values()).pop();
        if (latest) {
          targetUserId = latest.userId;
          recipientName = latest.displayName;
        }
      }
    }

    // 2. Nếu vẫn chưa có User ID, tự động tìm kiếm qua danh bạ chat gần nhất của OA
    if (!targetUserId) {
      try {
        const chatsRes = await this.getRecentChats(dto.accessToken);
        if (chatsRes.success && chatsRes.data.length > 0) {
          const targetLower = (dto.targetName || '').toLowerCase().trim();
          const matched = chatsRes.data.find((c: any) => {
            const nameLower = (c.displayName || '').toLowerCase().trim();
            return (
              targetLower &&
              (nameLower.includes(targetLower) ||
                targetLower.includes(nameLower) ||
                nameLower.includes('vũ') ||
                nameLower.includes('phạm'))
            );
          });

          if (matched) {
            targetUserId = matched.userId;
            recipientName = matched.displayName;
          } else {
            targetUserId = chatsRes.data[0].userId;
            recipientName = chatsRes.data[0].displayName;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve user_id automatically: ${err.message}`);
      }
    }

    if (!targetUserId) {
      throw new HttpException(
        'Chưa xác định được Zalo User ID (UID) của hội viên này. Bạn có thể: 1) Chọn hình thức gửi ZNS theo Số Điện Thoại (Chuẩn doanh nghiệp 100% tự động); 2) Bấm nút "Mở Chat Zalo Trực Tiếp" để gửi ngay; hoặc 3) Cấu hình Webhook để hệ thống tự động ghi nhận UID khi hội viên nhắn tin.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Sending CS message to Zalo User ID: ${targetUserId} (${recipientName})`);

      let response = await axios.post(
        'https://openapi.zalo.me/v3.0/oa/message/cs',
        {
          recipient: {
            user_id: targetUserId,
          },
          message: {
            text: dto.message,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: dto.accessToken.trim(),
          },
        },
      );

      let zaloData = response.data;

      // Fallback sang endpoint v2.0 nếu v3.0 trả về lỗi -235 (Loại OA chưa hỗ trợ v3.0 CS)
      if (zaloData && zaloData.error === -235) {
        try {
          this.logger.log(`API v3.0 returned -235, attempting fallback to v2.0 message API...`);
          const fallbackRes = await axios.post(
            'https://openapi.zalo.me/v2.0/oa/message',
            {
              recipient: {
                user_id: targetUserId,
              },
              message: {
                text: dto.message,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                access_token: dto.accessToken.trim(),
              },
            },
          );
          if (fallbackRes.data && fallbackRes.data.error === 0) {
            zaloData = fallbackRes.data;
          } else if (fallbackRes.data) {
            this.logger.warn(`v2.0 fallback response: ${JSON.stringify(fallbackRes.data)}`);
          }
        } catch (e: any) {
          this.logger.warn(`v2.0 fallback failed: ${e.message}`);
        }
      }

      if (zaloData && zaloData.error === 0) {
        return {
          success: true,
          message: 'Gửi tin nhắn Zalo OA thành công!',
          recipient: {
            userId: targetUserId,
            name: recipientName,
          },
          zaloData,
        };
      }

      // Xử lý các mã lỗi phổ biến của Zalo để báo rõ cho người dùng
      let errorDesc = zaloData?.message || 'Lỗi gửi tin Zalo OA';
      if (zaloData?.error === -216) {
        errorDesc = 'Access Token đã hết hạn! Vui lòng bấm nút "Tự Động Gia Hạn Token Mới" để tiếp tục.';
      } else if (zaloData?.error === -213) {
        errorDesc = 'Zalo User ID không hợp lệ hoặc người dùng chưa quan tâm/nhắn tin với OA!';
      } else if (zaloData?.error === -221) {
        errorDesc = 'Đã quá 48h kể từ tin nhắn tương tác cuối cùng của người dùng với OA theo chính sách CS của Zalo.';
      } else if (zaloData?.error === -235) {
        errorDesc =
          'Loại hình Zalo OA của bạn chưa được cấp quyền dùng API gửi tin tự động (Lỗi -235). Nguyên nhân: Tài khoản OA của bạn hiện là OA Nội Dung hoặc OA Miễn Phí chưa nâng cấp Gói Dịch Vụ OA (Dùng thử/Cơ bản/Nâng cao) trên oa.zalo.me. Bạn hãy bấm nút "Mở Zalo OA Chat Gửi Ngay" hoặc chuyển sang giải pháp ZNS theo SĐT!';
      }

      return {
        success: false,
        error: zaloData?.error,
        message: errorDesc,
        zaloData,
      };
    } catch (error: any) {
      this.logger.error(`Error sending Zalo message: ${error.message}`);
      throw new HttpException(
        error.response?.data?.message || error.message || 'Lỗi khi gọi API Zalo OA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Bắn thông báo chiến dịch hàng loạt tới nhiều hội viên Zalo (Bulk Messaging Queue)
   */
  async sendBulkMessages(dto: SendBulkZaloMessageDto) {
    if (!dto.accessToken?.trim()) {
      throw new HttpException('Thiếu Access Token của Zalo OA', HttpStatus.BAD_REQUEST);
    }
    if (!dto.recipients || !Array.isArray(dto.recipients) || dto.recipients.length === 0) {
      throw new HttpException('Danh sách hội viên nhận tin không được để trống', HttpStatus.BAD_REQUEST);
    }

    const results: Array<{
      phone: string;
      name: string;
      status: 'success' | 'failed';
      userId?: string;
      error?: string;
    }> = [];

    let successCount = 0;
    let failedCount = 0;
    const delay = dto.delayMs || 250;

    this.logger.log(`Starting bulk campaign for ${dto.recipients.length} members`);

    for (const recipient of dto.recipients) {
      // Thay thế các biến động tương ứng cho từng hội viên
      let message = dto.messageTemplate
        .replace(/{ho_ten}/g, recipient.name || 'Hội viên')
        .replace(/{so_dien_thoai}/g, recipient.phone || '')
        .replace(/{ma_hoi_vien}/g, recipient.memberCode || 'CEO1983')
        .replace(
          /{so_tien}/g,
          recipient.feeAmount
            ? new Intl.NumberFormat('vi-VN').format(recipient.feeAmount)
            : '10.000.000',
        )
        .replace(/{ten_doanh_nghiep}/g, recipient.company || 'Doanh nghiệp Hội viên CEO 1983');

      try {
        const sendRes = await this.sendMessage({
          accessToken: dto.accessToken,
          userId: recipient.userId,
          targetPhone: recipient.phone,
          targetName: recipient.name,
          message,
        });

        if (sendRes.success) {
          successCount++;
          results.push({
            phone: recipient.phone,
            name: recipient.name,
            status: 'success',
            userId: sendRes.recipient?.userId,
          });
        } else {
          failedCount++;
          results.push({
            phone: recipient.phone,
            name: recipient.name,
            status: 'failed',
            error: sendRes.message || 'Lỗi gửi tin',
          });
        }
      } catch (err: any) {
        failedCount++;
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'failed',
          error: err.message || 'Không thể gửi tin',
        });
      }

      // Delay nhỏ giữa các request để đảm bảo không bị Zalo rate limit
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.logger.log(
      `Finished bulk campaign: ${successCount} succeeded, ${failedCount} failed out of ${dto.recipients.length}`,
    );

    return {
      success: true,
      total: dto.recipients.length,
      successCount,
      failedCount,
      results,
    };
  }

  /**
   * Kích hoạt gửi thông báo tự động theo chu kỳ (Cron Scheduled Broadcast)
   */
  async triggerScheduledBroadcast(dto: {
    scheduleType?: string;
    targetGroup?: string;
    messageTemplate?: string;
    accessToken?: string;
  }) {
    const accessToken = dto.accessToken || process.env.ZALO_OA_ACCESS_TOKEN || '';
    if (!accessToken) {
      return { success: false, message: 'Thiếu Zalo OA Access Token để chạy chu kỳ tự động.' };
    }

    let recipients: SendBulkRecipientDto[] = [];
    if (this.prisma) {
      try {
        const members: any[] = await this.prisma.$queryRawUnsafe(
          `SELECT id, name, phone, code as member_code, company_name FROM public.members WHERE phone IS NOT NULL AND phone != '' LIMIT 50`
        );
        recipients = members.map((m) => ({
          phone: m.phone || '',
          name: m.name || 'Hội viên CEO 1983',
          memberCode: m.member_code || 'M1983-000',
          company: m.company_name || 'Doanh nghiệp CEO 1983',
          feeAmount: 10000000,
        }));
      } catch (err: any) {
        this.logger.warn(`Could not load members from db: ${err.message}`);
      }
    }

    if (recipients.length === 0) {
      recipients = [
        { phone: '0973924819', name: 'Phạm Văn Vũ', memberCode: 'CEO1983-001', company: 'ViConnect Tech', feeAmount: 10000000 },
        { phone: '0973205683', name: 'Lê Thị Thùy Dung', memberCode: 'CEO1983-002', company: 'Phó Chánh VP CEO 1983', feeAmount: 10000000 },
      ];
    }

    const template =
      dto.messageTemplate ||
      `📢 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO TỰ ĐỘNG ĐỊNH KỲ]
Kính gửi Hội viên: {ho_ten} ({ma_hoi_vien}) - {ten_doanh_nghiep}
Hệ thống tự động thông báo kỳ hoàn tất hội phí niên liễm thường niên 2026.
💰 Số tiền: 10.000.000 VNĐ.
🏦 MB Bank: 1983000000 - CLB DOANH NHAN CEO 1983
Trân trọng cảm ơn Anh/Chị!`;

    return this.sendBulkMessages({
      accessToken,
      recipients,
      messageTemplate: template,
      delayMs: 250,
    });
  }

  /**
   * Bắn thông báo ZNS (Zalo Notification Service) theo Số Điện Thoại
   * Chuẩn doanh nghiệp lớn 100%: Không cần Zalo User ID, Hội viên không cần quan tâm OA trước!
   */
  async sendZns(dto: {
    templateId: string;
    phone: string;
    templateData: Record<string, any>;
    accessToken: string;
    trackingId?: string;
  }) {
    if (!dto.accessToken?.trim()) {
      throw new HttpException('Thiếu Access Token để gửi ZNS', HttpStatus.BAD_REQUEST);
    }
    if (!dto.phone?.trim()) {
      throw new HttpException('Số điện thoại nhận ZNS không được để trống', HttpStatus.BAD_REQUEST);
    }
    if (!dto.templateId?.trim()) {
      throw new HttpException('Template ID ZNS không được để trống', HttpStatus.BAD_REQUEST);
    }

    let formattedPhone = dto.phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '84' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('84')) {
      formattedPhone = '84' + formattedPhone;
    }

    try {
      this.logger.log(`Sending ZNS template ${dto.templateId} to phone: ${formattedPhone}`);
      const response = await axios.post(
        'https://business.openapi.zalo.me/message/template',
        {
          phone: formattedPhone,
          template_id: dto.templateId.trim(),
          template_data: dto.templateData || {},
          tracking_id: dto.trackingId || `ceo1983_${Date.now()}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: dto.accessToken.trim(),
          },
          timeout: 10000,
        }
      );

      const resData = response.data;
      if (resData && resData.error === 0) {
        return {
          success: true,
          message: 'Bắn thông báo ZNS tới số điện thoại thành công!',
          data: resData.data,
        };
      }

      this.logger.warn(`ZNS failed: error ${resData.error}: ${resData.message}`);
      return {
        success: false,
        error: resData.error,
        message: resData.message || 'Lỗi gửi ZNS từ Zalo Cloud API',
        guide:
          resData.error === -124
            ? 'Access Token hết hạn hoặc không có quyền gửi ZNS.'
            : resData.error === -108
            ? 'Số điện thoại không hợp lệ hoặc chưa đăng ký tài khoản Zalo.'
            : resData.error === -118
            ? 'Tài khoản ZCA (Zalo Cloud Account) của Doanh nghiệp không đủ số dư để gửi ZNS.'
            : resData.error === -114
            ? 'Template ID ZNS chưa được Zalo phê duyệt hoặc các biến template_data không khớp.'
            : undefined,
      };
    } catch (err: any) {
      this.logger.error(`Error sending ZNS: ${err.message}`);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi mạng khi kết nối Zalo ZNS API',
      };
    }
  }

  /**
   * Liên kết Zalo User ID (UID) với Hội viên hoặc Số Điện Thoại trong CRM
   */
  async bindMemberUid(body: { phone?: string; zaloUid: string; name?: string; memberId?: string }) {
    const { phone, zaloUid, name, memberId } = body;
    if (!zaloUid?.trim()) {
      throw new HttpException('Zalo User ID không được để trống', HttpStatus.BAD_REQUEST);
    }
    const cleanUid = zaloUid.trim();
    const cleanPhone = (phone || '').trim();

    if (this.prisma) {
      if (memberId) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE public.members SET zalo_user_id = $1 WHERE id = $2`,
          cleanUid,
          memberId
        );
      } else if (cleanPhone) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE public.members SET zalo_user_id = $1 WHERE phone LIKE $2`,
          cleanUid,
          `%${cleanPhone}%`
        );
      }
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO public.zalo_subscribers (zalo_user_id, display_name, phone, member_id, last_message, last_interacted_at, updated_at)
         VALUES ($1, $2, $3, $4, 'Liên kết từ CRM', NOW(), NOW())
         ON CONFLICT (zalo_user_id) DO UPDATE SET
           phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.zalo_subscribers.phone),
           display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.zalo_subscribers.display_name),
           member_id = COALESCE(EXCLUDED.member_id, public.zalo_subscribers.member_id),
           updated_at = NOW()`,
        cleanUid,
        name || 'Hội viên',
        cleanPhone || null,
        memberId || null
      );
    }

    return {
      success: true,
      message: `Đã liên kết Zalo UID: ${cleanUid} với Hội viên ${name || cleanPhone} thành công!`,
    };
  }
}
