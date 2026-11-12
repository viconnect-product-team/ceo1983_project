import { fetchNestApi } from "@/lib/api-client";

/**
 * Helper sinh link chia sẻ mạng xã hội (Facebook, Zalo, LinkedIn, Telegram)
 * Có hỗ trợ endpoint preview OpenGraph động của CEO 1983 Backend (/api/share/preview)
 * Triệt tiêu hoàn toàn lỗi hiển thị screenshot dashboard hoặc sai thông tin thẻ meta.
 */

export interface ShareOptions {
  type: 'opportunity' | 'event' | 'post' | 'feed' | 'training' | 'member' | 'document' | 'general';
  id?: string;
  title: string;
  desc?: string;
  image?: string;
  targetPath?: string;
}

export function buildDynamicShareUrl(options: ShareOptions): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ceo1983.viconnect.vn';

  // Khi chạy trong môi trường Mobile Capacitor hoặc Localhost, các crawler bên ngoài (Facebook, Zalo)
  // không thể truy cập localhost hay capacitor://, do đó bắt buộc fallback về domain chính thức có SSL:
  const isLocalOrCapacitor = !origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('capacitor:') || origin.startsWith('file:');
  const baseDomain = isLocalOrCapacitor ? 'https://ceo1983.viconnect.vn' : origin;

  const params = new URLSearchParams();
  if (options.type) params.set('type', options.type);
  if (options.id) params.set('id', options.id);
  if (options.title) params.set('title', options.title);
  if (options.desc) params.set('desc', options.desc.slice(0, 200));
  if (options.image) params.set('image', options.image);
  if (options.targetPath) {
    const fullTarget = options.targetPath.startsWith('http')
      ? options.targetPath
      : `${baseDomain}${options.targetPath.startsWith('/') ? '' : '/'}${options.targetPath}`;
    params.set('target', fullTarget);
  }

  return `${baseDomain}/share/preview?${params.toString()}`;
}

/**
 * Thực hiện gọi native share hoặc copy link vào clipboard
 */
export async function executeShare(
  options: ShareOptions,
  onCopySuccess?: () => void
): Promise<void> {
  const shareUrl = buildDynamicShareUrl(options);

  // Tự động ghi nhận lượt chia sẻ bài viết / sự kiện vào CSDL Analytics
  fetchNestApi("/analytics/share-click", {
    method: "POST",
    body: {
      type: options.type || "post",
      id: options.id || "general",
      platform: "mobile_app",
      action: "share_post",
    },
  }).catch(() => {});

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.desc ? `${options.title} - ${options.desc}` : options.title,
        url: shareUrl,
      });
      return;
    } catch (e: any) {
      // User cancelled hoặc trình duyệt không hỗ trợ chia sẻ ngoài
      if (e?.name === 'AbortError') return;
    }
  }

  // Fallback copy clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${options.title}\n${shareUrl}`);
    if (onCopySuccess) onCopySuccess();
  }
}

