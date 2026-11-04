/**
 * ZALO MINI APP SDK BRIDGE HELPER
 * Hệ thống CLB Doanh Nhân CEO 1983 (HanoiBA)
 * 
 * Hỗ trợ giao tiếp 2 chiều giữa Ứng dụng Hội viên và Nền tảng Zalo Mini App:
 * 1. Đăng nhập 1 chạm qua Số Điện Thoại Zalo (scope.userPhonenumber)
 * 2. Mở Camera Native Zalo quét mã QR Check-in / Kết nối Danh bạ
 * 3. Mở khung chat Zalo 1-on-1 giữa 2 Doanh nhân
 * 4. Quan tâm Zalo Official Account (OA) CLB CEO 1983
 * 5. Chia sẻ Cơ hội kinh doanh & Danh thiếp số lên Zalo Feed / Zalo Chat
 */

import { fetchNestApi } from "./api-client";

declare global {
  interface Window {
    ZMP?: any;
    zmp?: any;
  }
}

/**
 * Kiểm tra xem ứng dụng có đang chạy bên trong môi trường Zalo Mini App hay không
 */
export function isZaloMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  const isZaloUa = /zalo|zaloapp|zalominiapp/i.test(userAgent);
  const hasZmpGlobal = Boolean(window.ZMP || window.zmp);
  return isZaloUa || hasZmpGlobal;
}

/**
 * Lấy đối tượng ZMP SDK từ global window hoặc dynamic import
 */
async function getZmpSdk() {
  if (typeof window !== "undefined" && (window.ZMP || window.zmp)) {
    return window.ZMP || window.zmp;
  }
  try {
    // Dynamic import zmp-sdk nếu đã được cài đặt qua npm
    // @ts-ignore
    const zmpModule = await import("zmp-sdk");
    return zmpModule.default || zmpModule;
  } catch {
    return null;
  }
}

/**
 * 1. ĐĂNG NHẬP 1 CHẠM QUA ZALO MINI APP (LẤY SỐ ĐIỆN THOẠI XÁC THỰC)
 */
export async function loginWithZaloPhone(): Promise<{
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}> {
  try {
    const zmp = await getZmpSdk();
    if (!zmp) {
      return {
        success: false,
        message: "Không tìm thấy Zalo Mini App SDK. Vui lòng mở ứng dụng trong Zalo.",
      };
    }

    // 1.1. Lấy Access Token của người dùng từ Zalo
    const accessToken = await new Promise<string>((resolve, reject) => {
      zmp.getAccessToken({
        success: (token: string) => resolve(token),
        fail: (err: any) => reject(new Error(err?.message || "Không thể lấy Zalo Access Token")),
      });
    });

    // 1.2. Xin quyền lấy Token Số Điện Thoại từ Zalo
    const phoneToken = await new Promise<string>((resolve, reject) => {
      zmp.getPhoneNumber({
        success: async (data: { token?: string; number?: string }) => {
          if (data?.token) {
            resolve(data.token);
          } else if (data?.number) {
            resolve(data.number);
          } else {
            reject(new Error("Không nhận được token số điện thoại từ Zalo"));
          }
        },
        fail: (err: any) => reject(new Error(err?.message || "Người dùng từ chối chia sẻ số điện thoại")),
      });
    });

    // 1.3. Lấy thông tin cơ bản người dùng (Tên & Avatar)
    let userInfo: any = null;
    try {
      userInfo = await new Promise((resolve) => {
        zmp.getUserInfo({
          success: (res: any) => resolve(res?.userInfo || res),
          fail: () => resolve(null),
        });
      });
    } catch {}

    // 1.4. Gửi token lên Backend NestJS để giải mã và đăng nhập
    const response = await fetchNestApi<any>("/auth/zalo-miniapp-login", {
      method: "POST",
      body: JSON.stringify({
        accessToken,
        phoneToken,
        zaloUserId: userInfo?.id,
        zaloName: userInfo?.name,
        zaloAvatar: userInfo?.avatar,
      }),
    });

    if (response?.access_token) {
      localStorage.setItem("vba_auth_token", response.access_token);
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("token", response.access_token);
      if (response.user) {
        localStorage.setItem("vba_auth_user", JSON.stringify(response.user));
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      return {
        success: true,
        token: response.access_token,
        user: response.user,
      };
    }

    return {
      success: false,
      message: response?.message || "Đăng nhập Zalo Mini App không thành công.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Lỗi khi gọi Zalo SDK",
    };
  }
}

/**
 * 2. MỞ CAMERA NATIVE ZALO QUÉT MÃ QR CHECK-IN SỰ KIỆN / KẾT NỐI DANH BẠ
 */
export async function scanQrCodeZalo(): Promise<string | null> {
  const zmp = await getZmpSdk();
  if (!zmp || !zmp.scanQRCode) {
    return null;
  }

  return new Promise((resolve) => {
    zmp.scanQRCode({
      success: (res: any) => {
        const qrContent = res?.content || res?.result || res?.text || "";
        resolve(qrContent);
      },
      fail: () => resolve(null),
    });
  });
}

/**
 * 3. MỞ KHUNG CHAT ZALO 1-ON-1 VỚI HỘI VIÊN ĐỐI TÁC
 */
export async function openZaloChatWithUser(zaloUserId: string): Promise<boolean> {
  if (!zaloUserId) return false;
  const zmp = await getZmpSdk();
  if (zmp && zmp.openChat) {
    return new Promise((resolve) => {
      zmp.openChat({
        type: "user",
        id: zaloUserId,
        success: () => resolve(true),
        fail: () => resolve(false),
      });
    });
  }
  // Fallback mở web chat Zalo
  window.open(`https://zalo.me/${zaloUserId}`, "_blank");
  return true;
}

/**
 * 4. MỞ POPUP THEO DÕI / QUAN TÂM ZALO OFFICIAL ACCOUNT (OA) CLB CEO 1983
 */
export async function followCeo1983OA(oaId = "382746401928472"): Promise<boolean> {
  const zmp = await getZmpSdk();
  if (zmp && zmp.followOA) {
    return new Promise((resolve) => {
      zmp.followOA({
        id: oaId,
        success: () => resolve(true),
        fail: () => resolve(false),
      });
    });
  }
  window.open(`https://zalo.me/${oaId}`, "_blank");
  return true;
}

/**
 * 5. CHIA SẺ TRANG HIỆN TẠI / CƠ HỘI GIAO THƯƠNG / DANH THIẾP LÊN ZALO
 */
export async function shareToZalo(options: {
  title: string;
  description: string;
  thumbnail?: string;
  path?: string;
}): Promise<boolean> {
  const zmp = await getZmpSdk();
  if (zmp && (zmp.shareCurrentPage || zmp.openShareSheet)) {
    return new Promise((resolve) => {
      const shareFn = zmp.openShareSheet || zmp.shareCurrentPage;
      shareFn({
        type: "zmp",
        data: {
          title: options.title,
          description: options.description,
          thumbnail: options.thumbnail || "https://res.cloudinary.com/vba/image/upload/v1/ceo1983_logo.png",
          path: options.path || "/association",
        },
        success: () => resolve(true),
        fail: () => resolve(false),
      });
    });
  }
  // Fallback Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.description,
        url: window.location.href,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

