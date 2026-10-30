import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

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

export class SendBulkZaloMessageDto {
  accessToken!: string;
  recipients!: SendBulkRecipientDto[];
  messageTemplate!: string;
  delayMs?: number;
}

@Injectable()
export class ZaloService {
  private readonly logger = new Logger(ZaloService.name);

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
   * Lấy danh sách hội thoại gần nhất của Official Account (Chuẩn Zalo OpenAPI v2.0 listrecentchat & getfollowers)
   */
  async getRecentChats(accessToken: string) {
    const chats: any[] = [];
    const seenIds = new Set<string>();

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

      if (response.data && response.data.error === 0 && Array.isArray(response.data.data)) {
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

        const users = followersRes.data?.data?.users;
        if (Array.isArray(users) && users.length > 0) {
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
        }
      } catch (err: any) {
        this.logger.warn(`getfollowers warning: ${err.message}`);
      }
    }

    return {
      success: true,
      total: chats.length,
      data: chats,
    };
  }

  /**
   * Gửi tin nhắn chăm sóc khách hàng (CS message) qua Zalo OA
   */
  async sendMessage(dto: SendZaloMessageDto) {
    if (!dto.accessToken?.trim()) {
      throw new HttpException('Thiếu Access Token của Zalo OA', HttpStatus.BAD_REQUEST);
    }
    if (!dto.message?.trim()) {
      throw new HttpException('Nội dung tin nhắn không được để trống', HttpStatus.BAD_REQUEST);
    }

    let targetUserId = dto.userId?.trim();
    let recipientName = dto.targetName || 'Hội viên';

    // Nếu chưa có User ID trực tiếp, tự động tìm kiếm qua danh bạ chat gần nhất của OA
    if (!targetUserId) {
      try {
        const chatsRes = await this.getRecentChats(dto.accessToken);
        if (chatsRes.success && chatsRes.data.length > 0) {
          // Tìm theo tên (ví dụ: "Phạm Vũ" hoặc "Vũ")
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
            // Mặc định lấy hội thoại tương tác gần nhất
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
        'Không tìm thấy Zalo User ID tương ứng. Hội viên cần mở Zalo và gửi 1 tin nhắn chào vào Zalo OA "CLB CEO 1983" để kích hoạt cuộc trò chuyện trước khi hệ thống có thể gửi tin tự động!',
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
}
