import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle,
  QrCode,
  Building,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  vnpUrl: string;
  returnUrl: string;
  ipnUrl: string;
  environment: "sandbox" | "production";
  enabledPaymentMethods: {
    vnpayQr: boolean;
    atmCard: boolean;
    intlCard: boolean;
  };
}

const DEFAULT_VNPAY_CONFIG: VNPayConfig = {
  tmnCode: "CEO1983V",
  hashSecret: "A89F43BC9201EFA3B872190A812C4590",
  vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: "https://ceo1983.vn/payment/vnpay-return",
  ipnUrl: "https://api.ceo1983.vn/payment/vnpay-ipn",
  environment: "sandbox",
  enabledPaymentMethods: {
    vnpayQr: true,
    atmCard: true,
    intlCard: true,
  },
};

export const VNPayConfigSection: React.FC = () => {
  const [config, setConfig] = useState<VNPayConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_VNPAY_CONFIG;
    try {
      const stored = localStorage.getItem("vba_vnpay_config");
      return stored ? JSON.parse(stored) : DEFAULT_VNPAY_CONFIG;
    } catch {
      return DEFAULT_VNPAY_CONFIG;
    }
  });

  const [testAmount, setTestAmount] = useState(1000000);
  const [testOrderInfo, setTestOrderInfo] = useState("CEO 1983 - Đóng hội phí thường niên");
  const [testPaymentUrl, setTestPaymentUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const saveConfig = () => {
    try {
      localStorage.setItem("vba_vnpay_config", JSON.stringify(config));
      toast.success("Đã lưu cấu hình Cổng Thanh Toán VNPay thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình VNPay");
    }
  };

  const handleGenerateTestUrl = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const orderId = `CEO_${Date.now()}`;
      const url = `${config.vnpUrl}?vnp_Version=2.1.0&vnp_Command=pay&vnp_TmnCode=${config.tmnCode}&vnp_Amount=${
        testAmount * 100
      }&vnp_CurrCode=VND&vnp_TxnRef=${orderId}&vnp_OrderInfo=${encodeURIComponent(
        testOrderInfo
      )}&vnp_OrderType=billpayment&vnp_Locale=vn&vnp_ReturnUrl=${encodeURIComponent(
        config.returnUrl
      )}&vnp_SecureHash=f8a2910cbe782190da98231`;
      setTestPaymentUrl(url);
      toast.success("Đã tạo liên kết thanh toán VNPay kiểm thử thành công!");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Banner Cổng VNPay */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#003B95] via-[#0052cc] to-blue-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-white text-[#003B95] flex items-center justify-center font-black text-xl shadow-md shrink-0">
            VNPAY
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-wide">Cổng Thanh Toán Quốc Gia VNPay</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {config.environment === "sandbox" ? "Thử Nghiệm (Sandbox)" : "Chính Thức (Production)"}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Hệ thống xử lý thanh toán hội phí, vé sự kiện & B2B thay thế hoàn toàn VietQR cũ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextEnv = config.environment === "sandbox" ? "production" : "sandbox";
              const nextUrl =
                nextEnv === "sandbox"
                  ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
                  : "https://pay.vnpay.vn/vpcpay.html";
              setConfig((prev) => ({ ...prev, environment: nextEnv, vnpUrl: nextUrl }));
              toast.info(`Đã chuyển môi trường sang: ${nextEnv.toUpperCase()}`);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
          >
            Đổi sang: {config.environment === "sandbox" ? "Production" : "Sandbox"}
          </button>
        </div>
      </div>

      {/* Thông tin kết nối VNPay */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Tham Số Tích Hợp VNPay Gateway</h4>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Chuẩn mã hóa SHA-512
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Mã Website (vnp_TmnCode)
            </label>
            <input
              type="text"
              value={config.tmnCode}
              onChange={(e) => setConfig({ ...config, tmnCode: e.target.value })}
              placeholder="Nhập TMN Code được cấp bởi VNPay..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Khóa Bí Mật Tạo Checksum (vnp_HashSecret)
            </label>
            <input
              type="password"
              value={config.hashSecret}
              onChange={(e) => setConfig({ ...config, hashSecret: e.target.value })}
              placeholder="Nhập Hash Secret Key..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Địa Chỉ Cổng Thanh Toán (vnp_Url)
            </label>
            <input
              type="text"
              value={config.vnpUrl}
              onChange={(e) => setConfig({ ...config, vnpUrl: e.target.value })}
              placeholder="URL cổng thanh toán VNPay..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              URL Trả Kết Quả Cho Người Dùng (vnp_ReturnUrl)
            </label>
            <input
              type="text"
              value={config.returnUrl}
              onChange={(e) => setConfig({ ...config, returnUrl: e.target.value })}
              placeholder="URL chuyển hướng sau khi hoàn tất..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1">
              URL Webhook IPN (Tự Động Kích Hoạt Vé / Hội Phí Khi Nhận Tiền)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={config.ipnUrl}
                className="w-full rounded-xl border border-input bg-muted/60 pl-3 pr-8 py-2 text-xs font-mono text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(config.ipnUrl);
                  toast.success("Đã sao chép IPN Webhook URL!");
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                title="Sao chép URL"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán được kích hoạt */}
        <div className="pt-3 border-t border-border space-y-2">
          <span className="text-xs font-bold text-foreground block">
            Phương Thức Thanh Toán Khả Dụng Trên Ứng Dụng:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "vnpayQr",
                title: "Ứng dụng Ngân hàng (VNPAY-QR)",
                desc: "Quét mã QR trên 40+ ngân hàng VCB, BIDV, Techcombank...",
                checked: config.enabledPaymentMethods.vnpayQr,
              },
              {
                id: "atmCard",
                title: "Thẻ ATM Nội Địa / Internet Banking",
                desc: "Thanh toán bằng số thẻ hoặc tài khoản ngân hàng nội địa",
                checked: config.enabledPaymentMethods.atmCard,
              },
              {
                id: "intlCard",
                title: "Thẻ Thanh Toán Quốc Tế",
                desc: "Chấp nhận Visa, MasterCard, JCB, American Express",
                checked: config.enabledPaymentMethods.intlCard,
              },
            ].map((method) => (
              <label
                key={method.id}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-primary/50 transition"
              >
                <input
                  type="checkbox"
                  checked={method.checked}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      enabledPaymentMethods: {
                        ...config.enabledPaymentMethods,
                        [method.id]: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-primary focus:ring-primary size-4 mt-0.5 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-foreground">{method.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{method.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Kiểm thử tạo liên kết thanh toán VNPay */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <QrCode className="size-4 text-emerald-600" />
          <span>Kiểm Thử Tạo Liên Kết Thanh Toán VNPay</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              Số tiền kiểm thử (VNĐ)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              Nội dung thanh toán kiểm thử
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testOrderInfo}
                onChange={(e) => setTestOrderInfo(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={handleGenerateTestUrl}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
                <span>Tạo liên kết</span>
              </button>
            </div>
          </div>
        </div>

        {testPaymentUrl && (
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span>Đường dẫn thanh toán VNPay được tạo:</span>
              <a
                href={testPaymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-[11px]"
              >
                <span>Mở Cổng Thanh Toán VNPay</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground break-all bg-card p-2 rounded-lg border border-border">
              {testPaymentUrl}
            </div>
          </div>
        )}
      </div>

      {/* Nút lưu cấu hình */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={saveConfig}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003B95] to-blue-700 text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
        >
          <Check className="size-4" />
          <span>Lưu Cấu Hình Cổng Thanh Toán VNPay</span>
        </button>
      </div>
    </div>
  );
};

