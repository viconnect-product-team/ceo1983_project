/**
 * Helper sinh đường dẫn ảnh QR Code cục bộ từ backend CEO 1983.
 * Tránh hoàn toàn việc gọi dịch vụ ngoài (api.qrserver.com) bị timeout hoặc chặn mạng.
 */
export function getQrUrl(data: string, size = 300): string {
  if (!data) return "";
  return `/api/events/qr?data=${encodeURIComponent(data)}&size=${size}`;
}

export function getAbsoluteQrUrl(data: string, size = 300): string {
  const rel = getQrUrl(data, size);
  if (!rel) return "";
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${rel}`;
  }
  return `https://ceo1983.viconnect.vn${rel}`;
}

