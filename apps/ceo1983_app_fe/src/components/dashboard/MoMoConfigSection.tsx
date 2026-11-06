import React, { useState, useEffect } from "react";
import {
  Wallet,
  Check,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Smartphone,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getNestApiUrl } from "@/lib/api-client";

export interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  returnUrl: string;
  ipnUrl: string;
  environment: "sandbox" | "production";
  enabledPaymentMethods: {
    momoWallet: boolean;
    napasCard: boolean;
    intlCard: boolean;
    payLater: boolean;
  };
}

const DEFAULT_MOMO_CONFIG: MoMoConfig = {
  partnerCode: "MOMO5CEO1983",
  accessKey: "momo_access_key_ceo1983",
  secretKey: "momo_secret_key_ceo1983_secure",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  returnUrl: "https://ceo1983.vn/payment/momo-return",
  ipnUrl: "https://api.ceo1983.vn/payment/momo-ipn",
  environment: "sandbox",
  enabledPaymentMethods: {
    momoWallet: true,
    napasCard: true,
    intlCard: true,
    payLater: true,
  },
};

export const MoMoConfigSection: React.FC = () => {
  const [config, setConfig] = useState<MoMoConfig>(DEFAULT_MOMO_CONFIG);
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("vba_momo_config");
      if (stored) {
        setConfig(JSON.parse(stored));
      } else {
        const origin = window.location.origin;
        setConfig((prev) => ({
          ...prev,
          returnUrl: `${origin}/payment/momo-return`,
          ipnUrl: `${getNestApiUrl("/payment/momo-ipn")}`,
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const [testAmount, setTestAmount] = useState(50000);
  const [testOrderInfo, setTestOrderInfo] = useState("CLB CEO 1983 - Thanh toán hội phí thử nghiệm");
  const [testPaymentData, setTestPaymentData] = useState<{
    orderId?: string;
    payUrl?: string;
    deeplink?: string;
    qrCodeUrl?: string;
    amount?: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  const saveConfig = () => {
    try {
      localStorage.setItem("vba_momo_config", JSON.stringify(config));
      toast.success("✅ Đã lưu cấu hình Cổng Thanh Toán MoMo thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình MoMo");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const handleGenerateTestUrl = async () => {
    setIsGenerating(true);
    setSimulationSuccess(false);
    try {
      const orderId = `MOMO_${Date.now()}`;
      const res = await fetch(getNestApiUrl("/payment/momo-create-url"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: testAmount,
          orderInfo: testOrderInfo,
          orderId,
          partnerCode: config.partnerCode,
          accessKey: config.accessKey,
          secretKey: config.secretKey,
          endpoint: config.endpoint,
          returnUrl: config.returnUrl,
          ipnUrl: config.ipnUrl,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setTestPaymentData({
          orderId: data.orderId || orderId,
          payUrl: data.payUrl,
          deeplink: data.deeplink,
          qrCodeUrl: data.qrCodeUrl,
          amount: testAmount,
        });
        toast.success("✅ Đã tạo giao dịch MoMo mã hóa HMAC-SHA256 thành công!");
      } else {
        toast.error(data?.message || "Không thể tạo liên kết thanh toán MoMo");
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối máy chủ tạo URL MoMo: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!testPaymentData?.orderId) {
      toast.error("Vui lòng tạo giao dịch thử nghiệm trước!");
      return;
    }
    setIsSimulating(true);
    try {
      const res = await fetch(getNestApiUrl("/payment/simulate-momo-success"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: testPaymentData.orderId,
          amount: testPaymentData.amount || testAmount,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setSimulationSuccess(true);
        toast.success(`🎉 ${data.message || "Xác nhận thanh toán MoMo thành công!"}`);
      } else {
        toast.error(data?.message || "Không thể giả lập thanh toán MoMo");
      }
    } catch (err: any) {
      toast.error(`Lỗi giả lập thanh toán MoMo: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const autoDetectHostUrls = () => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const detectedReturn = `${origin}/payment/momo-return`;
    const detectedIpn = getNestApiUrl("/payment/momo-ipn");
    setConfig((prev) => ({
      ...prev,
      returnUrl: detectedReturn,
      ipnUrl: detectedIpn,
    }));
    toast.success("Đã tự động cập nhật URL Return & IPN theo domain hiện tại!");
  };

  return (
    <div className="space-y-6">
      {/* Banner Cổng MoMo */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#A50064] via-[#D82D8B] to-purple-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-white text-[#A50064] flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <Wallet className="size-7 text-[#A50064]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-wide">Cổng Thanh Toán MoMo (MoMo Gateway v2)</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {config.environment === "sandbox" ? "Thử Nghiệm (Sandbox)" : "Chính Thức (Production)"}
              </span>
            </div>
            <p className="text-xs text-pink-100 mt-0.5">
              Hỗ trợ thanh toán hội phí, vé sự kiện, B2B qua Ví MoMo, Mã QR, Thẻ ATM Nội Địa & Visa/Mastercard
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
                  ? "https://test-payment.momo.vn/v2/gateway/api/create"
                  : "https://payment.momo.vn/v2/gateway/api/create";
              setConfig((prev) => ({ ...prev, environment: nextEnv, endpoint: nextUrl }));
              toast.info(`Đã chuyển môi trường MoMo sang: ${nextEnv.toUpperCase()}`);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
          >
            Đổi sang: {config.environment === "sandbox" ? "Production" : "Sandbox"}
          </button>
        </div>
      </div>

      {/* Thông tin kết nối MoMo Gateway */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-[#A50064]" />
            <h4 className="text-sm font-bold text-foreground">Tham Số Tích Hợp MoMo API v2</h4>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Chuẩn ký số HMAC-SHA256
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Mã Đối Tác (Partner Code)
            </label>
            <input
              type="text"
              value={config.partnerCode}
              onChange={(e) => setConfig({ ...config, partnerCode: e.target.value })}
              placeholder="VD: MOMO5CEO1983"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Mã định danh Merchant do MoMo cấp trong cổng đối tác business.momo.vn
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Khóa Truy Cập (Access Key)
            </label>
            <input
              type="text"
              value={config.accessKey}
              onChange={(e) => setConfig({ ...config, accessKey: e.target.value })}
              placeholder="VD: momo_access_key..."
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Access Key dùng để xác thực phiên gọi API tạo đơn MoMo
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1">
              Khóa Bí Mật Ký Số (Secret Key)
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={config.secretKey}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                placeholder="Chuỗi Secret Key bí mật"
                className="w-full h-10 px-3 pr-20 rounded-xl border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showSecretKey ? "Ẩn khóa" : "Hiện khóa"}
                >
                  {showSecretKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.secretKey, "Secret Key MoMo")}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Sao chép"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="size-3" /> Tuyệt đối giữ bí mật khóa này để phòng chống giả mạo giao dịch
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Cổng API Khởi Tạo (Endpoint)
            </label>
            <input
              type="text"
              value={config.endpoint}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-foreground">
                URL Điều Hướng Sau Thanh Toán (Return URL)
              </label>
              <button
                type="button"
                onClick={autoDetectHostUrls}
                className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Globe className="size-3" /> Tự nhận domain
              </button>
            </div>
            <input
              type="text"
              value={config.returnUrl}
              onChange={(e) => setConfig({ ...config, returnUrl: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono focus:border-primary focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1">
              Webhook Đồng Bộ Giao Dịch Tức Thì (MoMo IPN URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.ipnUrl}
                onChange={(e) => setConfig({ ...config, ipnUrl: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(config.ipnUrl, "IPN URL")}
                className="px-3 py-2 h-10 rounded-xl border border-border hover:bg-muted text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="size-3.5" /> Sao chép
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Cung cấp URL này vào Cổng Đối tác MoMo để hệ thống tự động gạch nợ hội phí và cấp vé ngay khi hội viên quét MoMo
            </p>
          </div>
        </div>

        {/* Phương thức thanh toán chấp nhận */}
        <div className="pt-3 border-t border-border">
          <label className="block text-xs font-bold text-foreground mb-2">
            Phương Thức Chấp Nhận Qua MoMo Gateway
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                key: "momoWallet",
                label: "Ví Điện Tử MoMo",
                desc: "Quét QR & Mở App",
                enabled: config.enabledPaymentMethods.momoWallet,
              },
              {
                key: "napasCard",
                label: "Thẻ ATM Nội Địa",
                desc: "39+ Ngân hàng Napas",
                enabled: config.enabledPaymentMethods.napasCard,
              },
              {
                key: "intlCard",
                label: "Thẻ Quốc Tế",
                desc: "Visa, Master, JCB",
                enabled: config.enabledPaymentMethods.intlCard,
              },
              {
                key: "payLater",
                label: "Ví Trả Sau MoMo",
                desc: "Thanh toán kỳ sau 0%",
                enabled: config.enabledPaymentMethods.payLater,
              },
            ].map((pm) => (
              <label
                key={pm.key}
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
                  pm.enabled
                    ? "border-[#A50064] bg-pink-50/50 dark:bg-pink-950/20"
                    : "border-border bg-background opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-foreground">{pm.label}</span>
                  <input
                    type="checkbox"
                    checked={pm.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        enabledPaymentMethods: {
                          ...config.enabledPaymentMethods,
                          [pm.key]: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#A50064] size-4 rounded"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{pm.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={saveConfig}
            className="px-5 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002f77] transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="size-4" /> Lưu Cấu Hình MoMo
          </button>
        </div>
      </div>

      {/* Sandbox Test & Giả Lập Giao Dịch Trực Quan */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#A50064]" />
            <h4 className="text-sm font-bold text-foreground">
              Công Cụ Thử Nghiệm Thanh Toán MoMo (Interactive Sandbox)
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground">Môi trường: {config.environment.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-foreground mb-1">
              Số Tiền Thử Nghiệm (VNĐ)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-bold focus:border-primary focus:outline-none"
            />
            <div className="flex gap-1.5 mt-1.5">
              {[50000, 200000, 1000000, 10000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTestAmount(amt)}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  {amt.toLocaleString("vi-VN")}đ
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-foreground mb-1">
              Nội Dung Thanh Toán
            </label>
            <input
              type="text"
              value={testOrderInfo}
              onChange={(e) => setTestOrderInfo(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div className="md:col-span-1">
            <button
              type="button"
              onClick={handleGenerateTestUrl}
              disabled={isGenerating}
              className="w-full h-10 rounded-xl bg-[#A50064] hover:bg-[#850050] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Đang tạo đơn MoMo...
                </>
              ) : (
                <>
                  <QrCode className="size-4" /> Tạo Mã QR & Liên Kết MoMo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kết quả tạo giao dịch MoMo */}
        {testPaymentData && (
          <div className="mt-4 p-4 rounded-xl border border-pink-200 dark:border-pink-900/50 bg-pink-50/40 dark:bg-pink-950/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-200/60 dark:border-pink-900/40 pb-2">
              <div>
                <span className="text-xs font-bold text-foreground">
                  Mã Giao Dịch (Order ID): <code className="text-[#A50064] font-mono">{testPaymentData.orderId}</code>
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Số tiền: <b>{testPaymentData.amount?.toLocaleString("vi-VN")} VNĐ</b>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {simulationSuccess ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Giao dịch Đã Thanh Toán Thành Công
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="size-3.5" /> Đang Chờ Người Dùng Quét QR / Thanh Toán
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* QR Code preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 text-slate-900 shadow-xs">
                {testPaymentData.qrCodeUrl ? (
                  <img
                    src={testPaymentData.qrCodeUrl}
                    alt="Mã QR MoMo"
                    className="size-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="size-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <QrCode className="size-16" />
                  </div>
                )}
                <span className="text-[11px] font-bold text-[#A50064] mt-2 flex items-center gap-1">
                  <Smartphone className="size-3" /> Quét mã bằng ứng dụng MoMo
                </span>
              </div>

              {/* Thông tin liên kết & Deep link */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    Trang Thanh Toán Trực Tiếp (MoMo PayUrl):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={testPaymentData.payUrl || ""}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-mono"
                    />
                    <a
                      href={testPaymentData.payUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 h-9 rounded-lg bg-[#A50064] text-white text-xs font-bold hover:bg-[#850050] transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="size-3.5" /> Mở Web
                    </a>
                  </div>
                </div>

                {testPaymentData.deeplink && (
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      Deep Link Mở App MoMo Trên Điện Thoại:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={testPaymentData.deeplink || ""}
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(testPaymentData.deeplink || "", "Deep link")}
                        className="px-3 py-2 h-9 rounded-lg border border-border hover:bg-muted text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="size-3.5" /> Copy
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSimulatePaymentSuccess}
                    disabled={isSimulating || simulationSuccess}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    Giả Lập Thanh Toán MoMo Thành Công (Simulate IPN)
                  </button>

                  <span className="text-[11px] text-muted-foreground">
                    Kiểm tra luồng gạch nợ hội phí tự động khi MoMo bắn IPN về CRM
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

