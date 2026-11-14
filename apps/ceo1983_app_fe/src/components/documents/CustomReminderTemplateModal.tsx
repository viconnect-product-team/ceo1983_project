import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  QrCode,
  FileText,
  AlignLeft,
  Smartphone,
  Mail,
  MessageSquare,
  Sparkles,
  Check,
  Calendar,
  Layers,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getQrUrl } from "@/lib/qr";
import type { MailTemplateItem, MailVariable } from "./MailTemplateManager";

export interface DynamicReminderField {
  id: string;
  key: string;
  label: string;
  type: "textarea" | "datetime" | "price" | "qr" | "text";
  value: string;
  placeholder?: string;
}

interface CustomReminderTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: MailTemplateItem) => void;
  initialTemplate?: MailTemplateItem | null;
}

const DEFAULT_REMINDER_FIELDS: DynamicReminderField[] = [
  {
    id: "f_desc",
    key: "activity_description",
    label: "Mô tả hoạt động nổi bật hôm nay",
    type: "textarea",
    value:
      "Phiên kết nối giao thương nội bộ B2B 1-on-1 ngành F&B & Công nghệ, chia sẻ chuyên đề tối ưu dòng tiền và giao lưu kết nối cùng 15+ thành viên mới gia nhập CLB.",
    placeholder: "Nhập mô tả hoạt động nhiều dòng...",
  },
  {
    id: "f_datetime",
    key: "activity_datetime",
    label: "Ngày giờ diễn ra",
    type: "datetime",
    value: "2026-11-14T14:30",
    placeholder: "Chọn ngày và giờ",
  },
  {
    id: "f_fee",
    key: "activity_fee",
    label: "Chi phí / Hội phí tham dự",
    type: "price",
    value: "0",
    placeholder: "0 VNĐ (Miễn phí dành cho Hội viên)",
  },
  {
    id: "f_location",
    key: "activity_location",
    label: "Địa điểm / Phòng họp",
    type: "text",
    value: "Hội Trường VIONE, 83 Vũ Trọng Phụng, Thanh Xuân, Hà Nội & Online App CEO 1983",
    placeholder: "Nhập địa điểm...",
  },
  {
    id: "f_qr",
    key: "qr_code_url",
    label: "Mã QR Check-in / Đăng ký tham gia",
    type: "qr",
    value: "https://ceo1983.viconnect.vn/events/today",
    placeholder: "Nhập đường link hoặc mã vé QR...",
  },
];

export function CustomReminderTemplateModal({
  isOpen,
  onClose,
  onSaveTemplate,
  initialTemplate,
}: CustomReminderTemplateModalProps) {
  const [templateName, setTemplateName] = useState(
    initialTemplate?.name || "Thư Nhắc: Hôm Nay Trong App CEO 1983 Có Gì (Trường Tùy Biến)"
  );
  const [templateCode, setTemplateCode] = useState(
    initialTemplate?.code || "TODAY_IN_APP_CEO1983"
  );
  const [subject, setSubject] = useState(
    initialTemplate?.subject ||
      "[CEO 1983 NHẮC HẸN] Hôm nay trong App CEO 1983 có gì? — Kính gửi {{full_name}}"
  );
  const [inAppTitle, setInAppTitle] = useState(
    initialTemplate?.inAppTitle || "Hôm nay trong App CEO 1983 có gì?"
  );

  const [channels, setChannels] = useState<("email" | "in_app" | "zalo_oa")[]>(
    initialTemplate?.channels || ["email", "in_app", "zalo_oa"]
  );

  const [fields, setFields] = useState<DynamicReminderField[]>(() => {
    if (initialTemplate?.reminderFields && initialTemplate.reminderFields.length > 0) {
      return initialTemplate.reminderFields;
    }
    return DEFAULT_REMINDER_FIELDS;
  });

  const [previewTab, setPreviewTab] = useState<"app" | "email" | "zalo">("app");

  if (!isOpen) return null;

  const toggleChannel = (ch: "email" | "in_app" | "zalo_oa") => {
    if (channels.includes(ch)) {
      if (channels.length === 1) {
        toast.warning("Cần chọn ít nhất 1 kênh phát thanh!");
        return;
      }
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleAddField = (type: DynamicReminderField["type"]) => {
    const timestamp = Date.now().toString().slice(-4);
    let newField: DynamicReminderField;

    switch (type) {
      case "textarea":
        newField = {
          id: `field_desc_${timestamp}`,
          key: `description_${timestamp}`,
          label: `Mô tả nội dung ${fields.filter((f) => f.type === "textarea").length + 1}`,
          type: "textarea",
          value: "Nội dung chi tiết hoạt động...",
          placeholder: "Nhập văn bản nhiều dòng...",
        };
        break;
      case "datetime":
        newField = {
          id: `field_time_${timestamp}`,
          key: `event_time_${timestamp}`,
          label: "Thời gian diễn ra",
          type: "datetime",
          value: new Date().toISOString().slice(0, 16),
          placeholder: "Chọn ngày giờ...",
        };
        break;
      case "price":
        newField = {
          id: `field_price_${timestamp}`,
          key: `participation_fee_${timestamp}`,
          label: "Chi phí tham dự",
          type: "price",
          value: "0",
          placeholder: "Nhập số tiền...",
        };
        break;
      case "qr":
        newField = {
          id: `field_qr_${timestamp}`,
          key: `qr_code_${timestamp}`,
          label: "Mã QR Check-in",
          type: "qr",
          value: "https://ceo1983.viconnect.vn/events/checkin",
          placeholder: "Nhập liên kết QR hoặc mã vé...",
        };
        break;
      case "text":
      default:
        newField = {
          id: `field_text_${timestamp}`,
          key: `custom_field_${timestamp}`,
          label: `Thông tin ${fields.length + 1}`,
          type: "text",
          value: "Thông tin ghi chú",
          placeholder: "Nhập nội dung ngắn...",
        };
        break;
    }

    setFields([...fields, newField]);
    toast.success(`Đã thêm trường kiểu ${type.toUpperCase()}`);
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) {
      toast.warning("Mẫu thư nhắc cần giữ ít nhất 1 trường thông tin!");
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
    toast.info("Đã xóa trường thông tin");
  };

  const handleUpdateField = (id: string, patch: Partial<DynamicReminderField>) => {
    setFields(
      fields.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...patch };
        if (patch.label && !patch.key) {
          // Normalize key from label
          const autoKey = patch.label
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "_")
            .replace(/_+/g, "_")
            .slice(0, 30);
          if (autoKey) updated.key = autoKey;
        }
        return updated;
      })
    );
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Vui lòng nhập tên mẫu thông báo!");
      return;
    }

    // Build inAppBody
    let inAppBody = `Kính gửi Anh/Chị {{full_name}}!\n\n${inAppTitle}\n`;
    for (const f of fields) {
      if (f.type === "textarea") {
        inAppBody += `\n📌 ${f.label}:\n{{${f.key}}}\n`;
      } else if (f.type === "datetime") {
        inAppBody += `⏰ ${f.label}: {{${f.key}}}\n`;
      } else if (f.type === "price") {
        inAppBody += `💰 ${f.label}: {{${f.key}}}\n`;
      } else if (f.type === "qr") {
        inAppBody += `📱 ${f.label}: Quét mã QR đính kèm để điểm danh\n`;
      } else {
        inAppBody += `📍 ${f.label}: {{${f.key}}}\n`;
      }
    }
    inAppBody += `\nTrân trọng,\nBan Thư Ký CLB Doanh Nhân CEO 1983`;

    // Build HTML Email Body
    let htmlBody = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #001D4A 0%, #003B95 50%, #0A2540 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(234, 179, 8, 0.25); border: 1px solid rgba(234, 179, 8, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #fde047; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
      THƯ NHẮC HẸN &amp; HOẠT ĐỘNG CLB CEO 1983
    </div>
    <h1 style="font-size: 22px; font-weight: 800; margin: 0; line-height: 1.35; color: #ffffff;">
      ${inAppTitle}
    </h1>
    <p style="font-size: 13px; color: #93c5fd; margin: 8px 0 0 0;">
      Kính gửi Quý Doanh nhân: <strong>{{full_name}}</strong>
    </p>
  </div>

  <div style="padding: 28px 24px;">
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Kính gửi Quý Anh/Chị <strong>{{full_name}}</strong>,<br>
      Ban Thư Ký CLB Doanh Nhân CEO 1983 trân trọng gửi tới Quý Anh/Chị thông tin hoạt động trong ngày hôm nay:
    </p>
`;

    for (const f of fields) {
      if (f.type === "textarea") {
        htmlBody += `
    <div style="background: #f8fafc; border-left: 4px solid #003B95; padding: 14px 16px; border-radius: 0 12px 12px 0; margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: 700; color: #003B95; text-transform: uppercase; margin-bottom: 6px;">
        📌 ${f.label}
      </div>
      <div style="font-size: 13.5px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
        {{${f.key}}}
      </div>
    </div>
`;
      } else if (f.type === "datetime") {
        htmlBody += `
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #eff6ff; border-radius: 12px; margin-bottom: 12px; border: 1px solid #dbeafe;">
      <span style="font-size: 18px;">⏰</span>
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">${f.label}</div>
        <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">{{${f.key}}}</div>
      </div>
    </div>
`;
      } else if (f.type === "price") {
        htmlBody += `
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f0fdf4; border-radius: 12px; margin-bottom: 12px; border: 1px solid #bbf7d0;">
      <span style="font-size: 18px;">💰</span>
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase;">${f.label}</div>
        <div style="font-size: 14px; font-weight: 700; color: #166534;">{{${f.key}}}</div>
      </div>
    </div>
`;
      } else if (f.type === "qr") {
        htmlBody += `
    <div style="text-align: center; padding: 20px; background: #fffbeb; border: 1.5px dashed #f59e0b; border-radius: 16px; margin: 20px 0;">
      <div style="font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 10px;">
        📱 ${f.label}
      </div>
      <img src="{{${f.key}}}" alt="QR Code" style="width: 160px; height: 160px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 auto; display: block;" />
      <p style="font-size: 11.5px; color: #78350f; margin: 8px 0 0 0;">
        Mở camera điện thoại hoặc Zalo quét mã QR để tham gia
      </p>
    </div>
`;
      } else {
        htmlBody += `
    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
      <span style="font-size: 16px;">📍</span>
      <div>
        <div style="font-size: 11px; font-weight: 600; color: #64748b;">${f.label}</div>
        <div style="font-size: 13.5px; font-weight: 600; color: #0f172a;">{{${f.key}}}</div>
      </div>
    </div>
`;
      }
    }

    htmlBody += `
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://ceo1983.viconnect.vn" style="display: inline-block; padding: 12px 28px; background: #003B95; color: #ffffff; border-radius: 12px; font-size: 13.5px; font-weight: 700; text-decoration: none;">
        📲 Mở App CEO 1983 Tra Cứu Hoạt Động
      </a>
    </div>
  </div>

  <div style="background: #0f172a; color: #94a3b8; padding: 20px 24px; text-align: center; font-size: 12px; line-height: 1.6;">
    <strong style="color: #ffffff;">CLB DOANH NHÂN CEO 1983 (HANOIBA)</strong><br>
    Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 / 0973 205 683<br>
    Cổng thông tin &amp; Ứng dụng: ceo1983.viconnect.vn
  </div>
</div>
`;

    const variables: MailVariable[] = [
      { key: "full_name", label: "Tên hội viên", example: "Nguyễn Văn An" },
      ...fields.map((f) => ({
        key: f.key,
        label: f.label,
        example:
          f.type === "price"
            ? Number(f.value || 0) === 0
              ? "Miễn phí"
              : `${Number(f.value).toLocaleString("vi-VN")} đ`
            : f.value || f.placeholder || f.label,
      })),
    ];

    const savedTemplate: MailTemplateItem = {
      id: initialTemplate?.id || `tmpl-reminder-${Date.now()}`,
      code: templateCode.trim().toUpperCase() || "TODAY_IN_APP_CEO1983",
      name: templateName.trim(),
      category: "event",
      description:
        "Mẫu thư nhắc nhở động: 'Hôm nay trong App CEO 1983 có gì' với các trường tùy biến textarea, datetime, price, QR.",
      subject: subject.trim(),
      inAppTitle: inAppTitle.trim(),
      inAppBody,
      htmlBody,
      channels,
      variables,
      updatedAt: new Date().toISOString().slice(0, 10),
      isCustom: true,
      reminderFields: fields,
    };

    onSaveTemplate(savedTemplate);
    toast.success("Đã thiết lập và lưu mẫu thư nhắc nhở động thành công!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A2540] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <span>Thiết Lập Mẫu Thư Nhắc Nhở Động (Dynamic Fields)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase">
                  Mẫu Hôm Nay Có Gì
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Thêm/xóa các trường thông tin tùy thích: textarea mô tả, datetime ngày giờ, price chi phí, mã QR
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Builder, Right Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Left Column (7 cols): Builder Form */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* 1. Basic Info */}
            <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-primary" />
                Thông Tin Cơ Bản Mẫu Thư
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Tên Mẫu Thư Nhắc:</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold focus:border-primary outline-none"
                    placeholder="VD: Thư Nhắc: Hôm Nay Trong App CEO 1983 Có Gì"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Mã Template (Code):</label>
                  <input
                    type="text"
                    value={templateCode}
                    onChange={(e) => setTemplateCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono font-semibold focus:border-primary outline-none"
                    placeholder="VD: TODAY_IN_APP_CEO1983"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tiêu đề thông báo In-App:</label>
                <input
                  type="text"
                  value={inAppTitle}
                  onChange={(e) => setInAppTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary outline-none"
                  placeholder="VD: Hôm nay trong App CEO 1983 có gì?"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Chủ đề Email (Subject):</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary outline-none"
                  placeholder="VD: [CEO 1983 NHẮC HẸN] Hôm nay trong App CEO 1983 có gì? — Kính gửi {{full_name}}"
                />
              </div>

              {/* Channels Selector */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-muted-foreground">Kênh phát thanh hỗ trợ:</label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChannel("in_app")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      channels.includes("in_app")
                        ? "bg-[#003B95] text-white border-[#003B95]"
                        : "border-border text-muted-foreground bg-background"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>App CEO 1983</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel("email")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      channels.includes("email")
                        ? "bg-amber-500 text-white border-amber-500"
                        : "border-border text-muted-foreground bg-background"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email HTML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel("zalo_oa")}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      channels.includes("zalo_oa")
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-border text-muted-foreground bg-background"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Zalo OA</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Dynamic Fields Toolbar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    Danh Sách Trường Thông Tin Tùy Biến ({fields.length} trường)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bấm các nút bên dưới để thêm trường thông tin mới tùy ý
                  </p>
                </div>
              </div>

              {/* Add Field Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddField("textarea")}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>+ Mô Tả (Textarea)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("datetime")}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>+ Ngày Giờ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("price")}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>+ Chi Phí</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("qr")}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>+ Mã QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("text")}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer col-span-2 sm:col-span-1"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>+ Văn Bản</span>
                </button>
              </div>

              {/* Dynamic Field Items List */}
              <div className="space-y-3 pt-2">
                {fields.map((field, idx) => {
                  const typeLabel =
                    field.type === "textarea"
                      ? "Mô Tả (Nhiều Dòng)"
                      : field.type === "datetime"
                      ? "Ngày & Giờ"
                      : field.type === "price"
                      ? "Chi Phí (Tiền Tệ)"
                      : field.type === "qr"
                      ? "Mã QR Check-in"
                      : "Văn Bản Ngắn";

                  const badgeColor =
                    field.type === "textarea"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : field.type === "datetime"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : field.type === "price"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : field.type === "qr"
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : "bg-slate-100 text-slate-800 border-slate-200";

                  return (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-2xs hover:border-primary/50 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {typeLabel}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {`{{${field.key}}}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(field.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Xóa trường này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Tên nhãn hiển thị:
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium focus:border-primary outline-none"
                            placeholder="Nhãn trường..."
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Mã biến (Variable key):
                          </label>
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => handleUpdateField(field.id, { key: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium focus:border-primary outline-none"
                            placeholder="vd: event_time"
                          />
                        </div>
                      </div>

                      {/* Value Input Based on Type */}
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Nội dung / Giá trị thực tế của trường:
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            rows={3}
                            value={field.value}
                            onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-normal focus:border-primary outline-none leading-relaxed"
                            placeholder={field.placeholder || "Nhập mô tả chi tiết..."}
                          />
                        ) : field.type === "datetime" ? (
                          <input
                            type="datetime-local"
                            value={field.value}
                            onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary outline-none"
                          />
                        ) : field.type === "price" ? (
                          <div className="space-y-1.5">
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-500" />
                              <input
                                type="number"
                                min={0}
                                step={10000}
                                value={field.value}
                                onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
                                className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs font-bold text-amber-600 focus:border-primary outline-none"
                                placeholder="0 VNĐ"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-muted-foreground">Chọn nhanh:</span>
                              {[0, 200000, 500000, 1000000].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => handleUpdateField(field.id, { value: String(amt) })}
                                  className="px-2 py-0.5 rounded-lg border border-border bg-muted/60 text-foreground hover:bg-muted font-mono transition text-[10px]"
                                >
                                  {amt === 0 ? "Miễn phí (0đ)" : `${amt.toLocaleString("vi-VN")}đ`}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : field.type === "qr" ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono focus:border-primary outline-none"
                              placeholder="Nhập đường dẫn URL hoặc mã vé..."
                            />
                            {field.value && (
                              <div className="inline-flex items-center gap-3 p-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                                <img
                                  src={getQrUrl(field.value, 80)}
                                  alt="Preview QR"
                                  className="w-14 h-14 rounded-lg bg-white p-1 border border-slate-200"
                                />
                                <div className="text-[11px] text-amber-900 dark:text-amber-300">
                                  <span className="font-bold block">✓ Ảnh QR Code sinh động:</span>
                                  <span className="text-muted-foreground truncate max-w-[200px] block">
                                    {field.value}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary outline-none"
                            placeholder="Nhập văn bản..."
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Preview & Test */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-muted/20 flex flex-col space-y-4 overflow-y-auto max-h-[75vh]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Xem Trước Thời Gian Thực
              </div>

              {/* Preview Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewTab("app")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    previewTab === "app" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  📱 App
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("email")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    previewTab === "email" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  📧 Email
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("zalo")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    previewTab === "zalo" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  💬 Zalo
                </button>
              </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 rounded-2xl border border-border bg-background p-4 overflow-y-auto shadow-inner text-xs">
              {previewTab === "app" ? (
                /* In-App Mobile Notification Card Preview */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="w-8 h-8 rounded-full bg-[#003B95] text-white flex items-center justify-center font-bold text-xs">
                      CEO
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground">CLB DOANH NHÂN CEO 1983</div>
                      <div className="text-[10px] text-muted-foreground">Thông báo hôm nay · Vừa xong</div>
                    </div>
                  </div>

                  <div className="font-extrabold text-sm text-[#003B95] dark:text-blue-400">
                    {inAppTitle}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Kính gửi Anh/Chị <strong>Dương Thị Huệ</strong>!
                  </p>

                  <div className="space-y-2 pt-1">
                    {fields.map((f) => {
                      if (f.type === "textarea") {
                        return (
                          <div key={f.id} className="p-3 bg-muted/60 rounded-xl border border-border">
                            <div className="font-bold text-[11px] text-[#003B95] dark:text-blue-400 mb-1 flex items-center gap-1">
                              <span>📌</span> {f.label}:
                            </div>
                            <div className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {f.value || f.placeholder}
                            </div>
                          </div>
                        );
                      }
                      if (f.type === "datetime") {
                        return (
                          <div key={f.id} className="flex items-center gap-2 p-2 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                            <span className="text-base">⏰</span>
                            <div>
                              <div className="text-[10px] font-bold uppercase">{f.label}</div>
                              <div className="font-bold text-xs">{f.value || "Chưa chọn thời gian"}</div>
                            </div>
                          </div>
                        );
                      }
                      if (f.type === "price") {
                        const num = Number(f.value || 0);
                        return (
                          <div key={f.id} className="flex items-center gap-2 p-2 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                            <span className="text-base">💰</span>
                            <div>
                              <div className="text-[10px] font-bold uppercase">{f.label}</div>
                              <div className="font-bold text-xs">
                                {num === 0 ? "Miễn phí dành cho Hội viên" : `${num.toLocaleString("vi-VN")} VNĐ`}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      if (f.type === "qr") {
                        return (
                          <div key={f.id} className="text-center p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300 rounded-xl space-y-1">
                            <div className="text-[10px] font-extrabold uppercase text-amber-900 dark:text-amber-300">
                              📱 {f.label}
                            </div>
                            <img
                              src={getQrUrl(f.value || "CEO1983", 140)}
                              alt="QR"
                              className="w-28 h-28 mx-auto rounded-lg bg-white p-1 border border-slate-200"
                            />
                            <p className="text-[10px] text-amber-800">
                              Quét mã trên App CEO 1983 để xác nhận tham dự
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div key={f.id} className="p-2 bg-muted/40 rounded-lg flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span>📍</span>
                          <span className="font-semibold text-[11px]">{f.label}:</span>
                          <span className="truncate">{f.value || f.placeholder}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : previewTab === "email" ? (
                /* Email HTML Preview */
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white text-slate-800">
                  <div className="bg-[#003B95] p-4 text-center text-white">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase">
                      THƯ NHẮC HẸN CEO 1983
                    </span>
                    <h2 className="text-sm font-bold mt-1 text-white">{inAppTitle}</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600">
                      Kính gửi Quý Anh/Chị <strong>Dương Thị Huệ</strong>,
                    </p>
                    <div className="space-y-2">
                      {fields.map((f) => (
                        <div key={f.id} className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <strong className="text-[#003B95] block text-[11px]">{f.label}:</strong>
                          <span className="text-slate-700">{f.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Zalo OA Preview */
                <div className="bg-sky-50 dark:bg-sky-950/20 p-4 rounded-xl border border-sky-200 space-y-2 text-sky-950 dark:text-sky-100">
                  <div className="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    CLB CEO 1983 Official Account
                  </div>
                  <div className="text-xs font-semibold">{inAppTitle}</div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Kính gửi Quý Anh/Chị Dương Thị Huệ, Ban Thư Ký xin gửi thông báo lịch trình hôm nay:
                  </p>
                  <div className="text-xs space-y-1 pl-2 border-l-2 border-blue-400">
                    {fields.slice(0, 3).map((f) => (
                      <div key={f.id}>
                        • <strong>{f.label}:</strong> {f.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-muted transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu &amp; Áp Dụng Mẫu Thư Nhắc</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
