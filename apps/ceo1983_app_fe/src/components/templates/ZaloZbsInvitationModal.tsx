import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Sparkles,
  Smartphone,
  Plus,
  Trash2,
  Settings2,
  RefreshCw,
  ExternalLink,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { fetchNestApi } from "@/lib/api-client";

export interface GuestRecipient {
  id: string;
  fullName: string;
  phone: string;
  company?: string;
  status: "ready" | "sending" | "success" | "error";
  errorMsg?: string;
  msgId?: string;
}

export interface ZaloZbsInvitationModalProps {
  open: boolean;
  onClose: () => void;
  eventData?: {
    eventName?: string;
    eventDate?: string;
    eventLocation?: string;
  };
}

export function ZaloZbsInvitationModal({
  open,
  onClose,
  eventData,
}: ZaloZbsInvitationModalProps) {
  if (!open) return null;

  // Cấu hình sự kiện & Zalo ZBS
  const [eventName, setEventName] = useState(
    eventData?.eventName || "Kỷ niệm 4 năm thành lập Viện Doanh Trí & Ngày Nhà giáo VN 20/11",
  );
  const [eventDate, setEventDate] = useState(eventData?.eventDate || "21/11/2026");
  const [eventLocation, setEventLocation] = useState(
    eventData?.eventLocation || "Tầng 2, Nhà hàng Long Phụng, 29T2 Trung Hòa - Nhân Chính, Hà Nội",
  );
  const [templateId, setTemplateId] = useState("324561");
  const [templateCode, setTemplateCode] = useState("EVENT_INVITATION");
  const [oaId, setOaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConfigLoading, setIsConfigLoading] = useState(false);

  // Danh sách khách mời từ file Excel
  const [recipients, setRecipients] = useState<GuestRecipient[]>([
    {
      id: "sample-1",
      fullName: "Nguyễn Văn Hùng",
      phone: "0912345678",
      company: "Công ty Cổ phần Cơ khí Hà Nội",
      status: "ready",
    },
    {
      id: "sample-2",
      fullName: "Lê Thị Bích Ngọc",
      phone: "0983234567",
      company: "Thời trang Bích Ngọc",
      status: "ready",
    },
    {
      id: "sample-3",
      fullName: "Hoàng Minh Trí",
      phone: "0904889911",
      company: "Vận tải & Logistics Trí Phát",
      status: "ready",
    },
  ]);

  // Bộ chọn file
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<"recipients" | "config">("recipients");

  // Load cấu hình Zalo OA từ backend
  useEffect(() => {
    let isMounted = true;
    setIsConfigLoading(true);
    fetchNestApi<any>("/zalo/oa-config")
      .then((res) => {
        if (isMounted && res && res.config) {
          if (res.config.oaId) setOaId(res.config.oaId);
          if (res.config.accessToken) setAccessToken(res.config.accessToken);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsConfigLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Chuẩn hóa số điện thoại Việt Nam
  const normalizePhoneNumber = (raw: string): string => {
    if (!raw) return "";
    const digits = String(raw).replace(/[\s()+.-]/g, "");
    if (digits.startsWith("0")) {
      return "84" + digits.slice(1);
    }
    if (digits.length === 9 && !digits.startsWith("84")) {
      return "84" + digits;
    }
    return digits;
  };

  // 1. Xử lý đọc file Excel (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (!jsonData || jsonData.length === 0) {
          toast.error("File Excel trống hoặc không có dòng dữ liệu hợp lệ!");
          return;
        }

        const parsedGuests: GuestRecipient[] = [];

        jsonData.forEach((row, idx) => {
          // Tìm trường Họ và Tên
          let name = "";
          for (const key of Object.keys(row)) {
            const k = key.trim().toLowerCase();
            if (
              k.includes("họ và tên") ||
              k.includes("họ tên") ||
              k.includes("tên") ||
              k.includes("fullname") ||
              k.includes("name") ||
              k.includes("khách") ||
              k.includes("người")
            ) {
              name = String(row[key] || "").trim();
              break;
            }
          }
          if (!name) name = `Khách mời #${idx + 1}`;

          // Tìm trường Số Điện Thoại
          let phone = "";
          for (const key of Object.keys(row)) {
            const k = key.trim().toLowerCase();
            if (
              k.includes("điện thoại") ||
              k.includes("sđt") ||
              k.includes("sdt") ||
              k.includes("phone") ||
              k.includes("mobile") ||
              k.includes("tel")
            ) {
              phone = String(row[key] || "").trim();
              break;
            }
          }

          // Tìm trường Công ty (nếu có)
          let company = "";
          for (const key of Object.keys(row)) {
            const k = key.trim().toLowerCase();
            if (k.includes("công ty") || k.includes("doanh nghiệp") || k.includes("company")) {
              company = String(row[key] || "").trim();
              break;
            }
          }

          if (phone) {
            parsedGuests.push({
              id: `guest-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
              fullName: name,
              phone: normalizePhoneNumber(phone),
              company,
              status: "ready",
            });
          }
        });

        if (parsedGuests.length === 0) {
          toast.error("Không tìm thấy cột Số điện thoại trong file Excel. Vui lòng kiểm tra lại tiêu đề cột!");
          return;
        }

        setRecipients(parsedGuests);
        toast.success(`Đã import thành công ${parsedGuests.length} khách mời từ file Excel!`);
      } catch (err: any) {
        console.error("Lỗi đọc file Excel:", err);
        toast.error("Không thể đọc file Excel. Vui lòng kiểm tra định dạng .xlsx hoặc .xls!");
      }
    };
    reader.readAsArrayBuffer(file);
    if (e.target) e.target.value = "";
  };

  // 2. Tải File Excel Mẫu
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        "Họ và tên": "Nguyễn Văn Hùng",
        "Số điện thoại": "0912345678",
        "Doanh nghiệp": "Công ty Cổ phần Cơ khí Hà Nội",
      },
      {
        "Họ và tên": "Lê Thị Bích Ngọc",
        "Số điện thoại": "0983234567",
        "Doanh nghiệp": "Thời trang Bích Ngọc",
      },
      {
        "Họ và tên": "Hoàng Minh Trí",
        "Số điện thoại": "0904889911",
        "Doanh nghiệp": "Vận tải & Logistics Trí Phát",
      },
      {
        "Họ và tên": "Phạm Văn Vũ",
        "Số điện thoại": "0983198383",
        "Doanh nghiệp": "Tập đoàn VICONNECT",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KhachMoi");
    XLSX.writeFile(workbook, "MAU_DANH_SACH_KHACH_MOI_ZALO_ZBS.xlsx");
    toast.success("Đã tải file Excel mẫu thành công!");
  };

  // 3. Thêm dòng khách mời thủ công
  const handleAddManualGuest = () => {
    setRecipients((prev) => [
      ...prev,
      {
        id: `guest-${Date.now()}`,
        fullName: "Khách mời mới",
        phone: "84900000000",
        company: "Doanh nghiệp CEO 1983",
        status: "ready",
      },
    ]);
  };

  // 4. Xóa khách mời
  const handleRemoveGuest = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // 5. Cập nhật dòng khách mời
  const handleUpdateGuest = (id: string, field: "fullName" | "phone" | "company", value: string) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            [field]: field === "phone" ? normalizePhoneNumber(value) : value,
            status: "ready",
          };
        }
        return r;
      }),
    );
  };

  // 6. Gửi hàng loạt qua Zalo ZBS
  const handleSendBulkZbs = async () => {
    if (recipients.length === 0) {
      toast.error("Danh sách khách mời trống! Vui lòng import file Excel trước.");
      return;
    }

    if (!templateId) {
      toast.error("Vui lòng nhập Template ID ZBS!");
      setActiveTab("config");
      return;
    }

    setIsSending(true);
    setProgress({ current: 0, total: recipients.length });

    try {
      const payload = {
        templateId,
        templateCode,
        eventName,
        eventDate,
        eventLocation,
        accessToken: accessToken || undefined,
        recipients: recipients.map((r) => ({
          fullName: r.fullName,
          phone: r.phone,
          company: r.company,
        })),
        templateData: {
          event_name: eventName,
          event_date: eventDate,
          event_location: eventLocation,
        },
      };

      const res = await fetchNestApi<any>("/zalo/send-bulk-zns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        const resultMap = new Map<string, { success: boolean; message: string; msgId?: string }>();
        if (Array.isArray(res.results)) {
          res.results.forEach((item: any) => {
            resultMap.set(item.phone, item);
          });
        }

        setRecipients((prev) =>
          prev.map((r) => {
            const found = resultMap.get(r.phone);
            if (found) {
              return {
                ...r,
                status: found.success ? "success" : "error",
                errorMsg: found.message,
                msgId: found.msgId,
              };
            }
            return { ...r, status: "success" };
          }),
        );

        toast.success(
          `Bắn thư mời Zalo ZBS hoàn tất: ${res.successCount || 0} thành công, ${res.failCount || 0} lỗi.`,
        );
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi gọi Zalo ZBS API");
      }
    } catch (err: any) {
      console.error("Lỗi gửi bulk ZBS:", err);
      toast.error(err?.message || "Lỗi kết nối tới hệ thống Zalo ZBS");
    } finally {
      setIsSending(false);
      setProgress({ current: recipients.length, total: recipients.length });
    }
  };

  const successCount = recipients.filter((r) => r.status === "success").length;
  const errorCount = recipients.filter((r) => r.status === "error").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-2xl bg-[#0068FF] text-white shadow-md shadow-blue-500/25">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Cấu Hình Zalo ZBS &amp; Gửi Thư Mời Sự Kiện</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0068FF] dark:text-blue-400 font-bold border border-blue-500/20">
                  OpenAPI ZBS
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Endpoint chuẩn: <code className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">https://business.openapi.zalo.me/message/template</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("recipients")}
            className={`flex items-center gap-2 pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "recipients"
                ? "border-[#003B95] text-[#003B95] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Users className="size-4" />
            <span>1. Danh Sách Khách Mời Excel ({recipients.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "config"
                ? "border-[#003B95] text-[#003B95] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Settings2 className="size-4" />
            <span>2. Cấu Hình Template ZBS &amp; Sự Kiện</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "recipients" ? (
            <div className="space-y-4">
              {/* Toolbar Hành Động Excel */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Upload className="size-4" />
                    <span>Import File Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSampleExcel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="size-4 text-emerald-600" />
                    <span>Tải File Excel Mẫu (2 Cột)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddManualGuest}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="size-4 text-blue-600" />
                    <span>Thêm Dòng</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Tổng: <strong className="text-slate-800 dark:text-slate-200 font-bold">{recipients.length}</strong> khách
                  </span>
                  {successCount > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> {successCount} thành công
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <XCircle className="size-3.5" /> {errorCount} lỗi
                    </span>
                  )}
                </div>
              </div>

              {/* Bảng Danh Sách Khách Mời */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">STT</th>
                        <th className="py-2.5 px-3">Họ và Tên Khách Mời</th>
                        <th className="py-2.5 px-3">Số Điện Thoại (Zalo)</th>
                        <th className="py-2.5 px-3">Doanh Nghiệp / Đơn Vị</th>
                        <th className="py-2.5 px-3 w-32 text-center">Trạng Thái</th>
                        <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {recipients.map((guest, idx) => (
                        <tr key={guest.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={guest.fullName}
                              onChange={(e) => handleUpdateGuest(guest.id, "fullName", e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 font-semibold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={guest.phone}
                              onChange={(e) => handleUpdateGuest(guest.id, "phone", e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 outline-none text-blue-600 dark:text-blue-400 font-mono font-medium"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={guest.company || ""}
                              placeholder="CEO 1983"
                              onChange={(e) => handleUpdateGuest(guest.id, "company", e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 outline-none text-slate-500 dark:text-slate-400"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            {guest.status === "ready" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Sẵn sàng
                              </span>
                            )}
                            {guest.status === "sending" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 flex items-center justify-center gap-1">
                                <Loader2 className="size-3 animate-spin" /> Đang gửi...
                              </span>
                            )}
                            {guest.status === "success" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center gap-1">
                                <CheckCircle2 className="size-3" /> Đã gửi
                              </span>
                            )}
                            {guest.status === "error" && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 flex items-center justify-center gap-1"
                                title={guest.errorMsg}
                              >
                                <XCircle className="size-3" /> Lỗi
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveGuest(guest.id)}
                              className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hướng dẫn trích xuất Excel */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div className="space-y-0.5">
                  <p className="font-bold">Cơ chế trích xuất 2 trường thông tin thông minh từ file Excel:</p>
                  <p className="text-[11px] text-blue-600/90 dark:text-blue-300/80">
                    Hệ thống tự động phát hiện cột <strong>Họ và tên</strong> (Họ tên, Tên, FullName) và cột <strong>Số điện thoại</strong> (SĐT, Phone, Mobile), tự động chuẩn hóa đầu số <code className="font-mono">84...</code> để tương thích 100% với cổng Zalo ZBS OpenAPI.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Form Cấu Hình Sự Kiện & Zalo ZBS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tên Sự Kiện (Hiển thị trên thư mời ZBS)
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ngày Diễn Ra Sự Kiện
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Địa Điểm Tổ Chức Sự Kiện
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Zalo ZBS Template ID (Từ Zalo Business Cloud)
                  </label>
                  <input
                    type="text"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    placeholder="Ví dụ: 324561"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mã Template Code Nội Bộ
                  </label>
                  <input
                    type="text"
                    value={templateCode}
                    onChange={(e) => setTemplateCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Zalo OA ID
                  </label>
                  <input
                    type="text"
                    value={oaId}
                    onChange={(e) => setOaId(e.target.value)}
                    placeholder="Zalo Official Account ID"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    OA Access Token (Để trống để tự động dùng Token lưu trữ)
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Tự động gia hạn bởi Backend"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Thông tin giải thích */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>Quy trình gửi thư mời qua Zalo ZBS chuẩn:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11.5px]">
                  <li>Quản trị viên đăng ký mẫu tin nhắn ZBS trên cổng <code className="font-mono text-blue-600">business.openapi.zalo.me</code>.</li>
                  <li>Nhập Template ID đã được Zalo phê duyệt vào ô cấu hình trên.</li>
                  <li>Import file Excel chứa danh sách khách mời (Tên + Số điện thoại).</li>
                  <li>Hệ thống gửi tự động từng tin nhắn ZBS và trả về mã MsgID đối soát.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isSending ? (
              <span className="flex items-center gap-1.5 font-bold text-blue-600">
                <Loader2 className="size-4 animate-spin" /> Đang gửi thư mời Zalo ZBS ({progress.current}/{progress.total})...
              </span>
            ) : (
              <span>Sẵn sàng gửi tới <strong>{recipients.length}</strong> khách mời</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleSendBulkZbs}
              disabled={isSending || recipients.length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0068FF] hover:bg-[#0052CC] text-white text-xs font-bold transition shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang Gửi...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Bắn Thư Mời Zalo ZBS ({recipients.length} Khách)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

