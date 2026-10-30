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
   * Lấy danh sách hội thoại gần nhất của Official Account
   */
  async getRecentChats(accessToken: string) {
    try {
      const response = await axios.get('https://openapi.zalo.me/v2.0/oa/getrecentchat', {
        headers: {
          access_token: accessToken.trim(),
        },
        params: {
          offset: 0,
          count: 20,
        },
      });

      if (response.data && response.data.error === 0 && Array.isArray(response.data.data)) {
        const chats: any[] = [];
        for (const item of response.data.data) {
          // Lấy thông tin profile người dùng nếu có thể
          let profile: any = null;
          try {
            const profileRes = await axios.get('https://openapi.zalo.me/v2.0/oa/getprofile', {
              headers: { access_token: accessToken.trim() },
              params: { data: JSON.stringify({ user_id: item.user_id }) },
              timeout: 3000,
            });
            if (profileRes.data && profileRes.data.error === 0) {
              profile = profileRes.data.data;
            }
          } catch {
            // bỏ qua lỗi get profile phụ
          }

          chats.push({
            userId: item.user_id,
            displayName: profile?.display_name || 'Hội viên Zalo',
            avatar: profile?.avatar || '',
            lastMessage: item.content || '',
            time: item.time,
          });
        }

        return {
          success: true,
          total: chats.length,
          data: chats,
        };
      }

      return {
        success: false,
        error: response.data?.error,
        message: response.data?.message || 'Không lấy được danh sách hội thoại từ Zalo OA',
        data: [],
      };
    } catch (error: any) {
      this.logger.error(`Error fetching recent chats: ${error.message}`);
      throw new HttpException(
        error.response?.data?.message || error.message || 'Lỗi kết nối Zalo OA Open API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
          // Tìm theo tên (ví dụ: "Phạm Vũ")
          const matched = chatsRes.data.find(
            (c: any) =>
              dto.targetName &&
              (c.displayName.toLowerCase().includes(dto.targetName.toLowerCase()) ||
                dto.targetName.toLowerCase().includes(c.displayName.toLowerCase())),
          );

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
      const response = await axios.post(
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

      const zaloData = response.data;
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
}
