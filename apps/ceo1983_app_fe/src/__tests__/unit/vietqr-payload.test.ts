import { describe, it, expect } from "vitest";

export interface VietQrConfig {
  bankId: string;
  accountNo: string;
  accountName?: string;
  amount?: number;
  addInfo?: string;
  template?: "compact" | "compact2" | "qr_only" | "print";
}

export function generateVietQrImageUrl(config: VietQrConfig): string {
  const sanitizedAccount = config.accountNo.replace(/\D/g, "");
  const template = config.template || "compact2";
  const bank = config.bankId.toUpperCase();
  let url = `https://img.vietqr.io/image/${bank}-${sanitizedAccount}-${template}.png`;

  const params = new URLSearchParams();
  if (config.amount && config.amount > 0) {
    params.set("amount", String(Math.round(config.amount)));
  }
  if (config.accountName) {
    params.set("accountName", config.accountName);
  }
  if (config.addInfo) {
    params.set("addInfo", config.addInfo);
  }

  const query = params.toString();
  return query ? `${url}?${query}` : url;
}

export function buildInvoiceQrDescription(
  prefix: string,
  invoiceNumber: string,
  memberCode: string
): string {
  return `${prefix} ${invoiceNumber} ${memberCode}`.trim().slice(0, 50);
}

describe("VietQR & Napas247 Gateway Generator", () => {
  const baseConfig: VietQrConfig = {
    bankId: "MB",
    accountNo: "0983 1983 8888",
    accountName: "CLB DOANH NHAN CEO 1983",
    amount: 5_000_000,
    addInfo: "HOIPHI 2026 M83-VUPV",
  };

  it("should generate valid VietQR URL with sanitized account and query params", () => {
    const url = generateVietQrImageUrl(baseConfig);
    expect(url).toContain("https://img.vietqr.io/image/MB-098319838888-compact2.png");
    expect(url).toContain("amount=5000000");
    expect(url).toContain("addInfo=HOIPHI+2026+M83-VUPV");
    expect(url).toContain("accountName=CLB+DOANH+NHAN+CEO+1983");
  });

  it("should omit amount when amount is 0 or negative", () => {
    const zeroConfig = { ...baseConfig, amount: 0 };
    const url = generateVietQrImageUrl(zeroConfig);
    expect(url).not.toContain("amount=");
  });

  it("should support custom template like qr_only", () => {
    const qrOnlyConfig: VietQrConfig = {
      bankId: "VCB",
      accountNo: "1234567890",
      template: "qr_only",
    };
    const url = generateVietQrImageUrl(qrOnlyConfig);
    expect(url).toBe("https://img.vietqr.io/image/VCB-1234567890-qr_only.png");
  });

  it("should format concise invoice payment description under 50 chars", () => {
    const desc = buildInvoiceQrDescription("CEO1983", "INV-2026-001", "M83-VUPV");
    expect(desc).toBe("CEO1983 INV-2026-001 M83-VUPV");
    expect(desc.length).toBeLessThanOrEqual(50);
  });
});

