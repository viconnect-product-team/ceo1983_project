import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Send,
  Search,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Check,
  User,
  Building2,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import type { Document } from "@/lib/documents.functions";

export interface SendDocumentToMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: Document | null;
}

export function SendDocumentToMessageModal({
  isOpen,
  onClose,
  documentItem,
}: SendDocumentToMessageModalProps) {
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch member list for recipient selection
  useEffect(() => {
    if (!isOpen) return;
    setLoadingMembers(true);
    fetchNestApi<any[]>("/members")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.members || [];
        setMembers(list);
        if (list.length > 0 && !selectedMember) {
          // Default to first member
          setSelectedMember(list[0]);
        }
      })
      .catch((err) => {
        console.warn("Fetch members for send doc error:", err);
      })
      .finally(() => {
        setLoadingMembers(false);
      });
  }, [isOpen]);

  // Pre-fill default note when documentItem changes
  useEffect(() => {
    if (documentItem) {
      setCustomNote(
        `Kính gửi Anh/Chị tài liệu "${documentItem.name}" từ Kho lưu trữ CLB Doanh Nhân CEO 1983.`
      );
    }
  }, [documentItem]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members.slice(0, 30);
    const q = searchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        String(m.name || m.contact || "").toLowerCase().includes(q) ||
        String(m.code || "").toLowerCase().includes(q) ||
        String(m.company || m.companyName || "").toLowerCase().includes(q) ||
        String(m.department || "").toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  if (!isOpen || !documentItem || !mounted || typeof document === "undefined") {
    return null;
  }

  const docType = String(documentItem.type || "").toLowerCase();
  const rawFileUrl = documentItem.filePath || documentItem.url || (documentItem as any).fileUrl || "";
  const fileUrl = resolveMediaUrl(rawFileUrl) || rawFileUrl || "/documents/mau_bieu_ceo1983.pdf";

  const renderDocIcon = () => {
    if (docType.includes("xls") || docType.includes("sheet")) {
      return <FileSpreadsheet className="size-6 text-emerald-600" />;
    }
    if (docType.includes("png") || docType.includes("jpg") || docType.includes("image")) {
      return <ImageIcon className="size-6 text-sky-600" />;
    }
    if (docType.includes("json") || docType.includes("code")) {
      return <FileCode className="size-6 text-amber-600" />;
    }
    return <FileText className="size-6 text-[#003B95]" />;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error("Vui lòng chọn người nhận tài liệu!");
      return;
    }

    const peerCode = String(selectedMember.code || selectedMember.id || selectedMember.userId || "");
    if (!peerCode) {
      toast.error("Không xác định được mã định danh của người nhận!");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading(`Đang gửi tài liệu tới ${selectedMember.name || "hội viên"}...`);

    try {
      const fileName = documentItem.name.toLowerCase().endsWith(`.${docType}`)
        ? documentItem.name
        : `${documentItem.name}.${docType || "pdf"}`;

      // Payload định dạng chuẩn [file:url|name|size] mà ChatThread hỗ trợ native
      const payloadText = customNote.trim()
        ? `${customNote.trim()}\n[file:${fileUrl}|${fileName}|${documentItem.size || "1.2 MB"}]`
        : `[file:${fileUrl}|${fileName}|${documentItem.size || "1.2 MB"}]`;

      // Gửi qua API tin nhắn NestJS
      await fetchNestApi("/dm/member/messages", {
        method: "POST",
        body: JSON.stringify({
          peerCode: peerCode,
          text: payloadText,
        }),
      }).catch(async () => {
        // Fallback sang endpoint connect-app/dm
        return fetchNestApi("/connect-app/dm/member/messages", {
          method: "POST",
          body: JSON.stringify({
            peerCode: peerCode,
            text: payloadText,
          }),
        });
      });

      // Lưu optimistic vào localStorage để chat app nhận tức thì
      try {
        const localKey = `vba.chat.${peerCode}`;
        const existingLocal = JSON.parse(localStorage.getItem(localKey) || "[]");
        const optimistic = {
          id: `local-doc-${Date.now()}`,
          text: payloadText,
          mine: true,
          time: "Vừa xong",
          createdAt: new Date().toISOString(),
          seen: false,
        };
        localStorage.setItem(localKey, JSON.stringify([...existingLocal, optimistic].slice(-50)));
      } catch {}

      // Bắn sự kiện cập nhật hội thoại toàn cục
      window.dispatchEvent(new CustomEvent("vba:conversation_updated"));
      window.dispatchEvent(new CustomEvent("vba_message_received", { detail: { peerCode, text: payloadText } }));

      toast.success(
        `Đã gửi tài liệu "${documentItem.name}" vào tin nhắn của ${selectedMember.name || selectedMember.code}!`,
        { id: toastId }
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi tin nhắn lúc này. Vui lòng thử lại!", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 text-slate-900 dark:text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#003B95] text-white flex items-center justify-center shadow-sm">
              <Send className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Gửi Tài Liệu Vào Tin Nhắn CRM
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Chuyển phát văn bản trực tiếp đến Hội viên qua hệ thống Chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Document Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="size-11 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
            {renderDocIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-[#003B95] dark:text-blue-300">
                {documentItem.type || "FILE"}
              </span>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-500">
                {documentItem.size || "1.2 MB"} • {documentItem.category || "Văn bản"}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {documentItem.name}
            </h4>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-3.5">
          {/* Recipient Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chọn Người Nhận (Hội viên / Ban điều hành):
            </label>

            {/* Search Box */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, mã hội viên, công ty..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-[#003B95] transition"
              />
            </div>

            {/* Recipient List Box */}
            <div className="max-h-36 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800">
              {loadingMembers ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="size-4 animate-spin text-[#003B95]" />
                  <span>Đang tải danh sách hội viên...</span>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Không tìm thấy hội viên phù hợp
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedMember?.id === m.id || selectedMember?.code === m.code;
                  return (
                    <div
                      key={m.id || m.code}
                      onClick={() => setSelectedMember(m)}
                      className={`flex items-center justify-between p-2 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        isSelected ? "bg-blue-50/70 dark:bg-blue-950/40 font-bold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {m.name ? m.name.charAt(0).toUpperCase() : <User className="size-3" />}
                        </div>
                        <div className="truncate">
                          <span className="text-slate-900 dark:text-white">{m.name || m.contact}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            ({m.code || "Hội viên"})
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="size-3.5 text-[#003B95] shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nội dung lời nhắn kèm tài liệu:
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Nhập ghi chú gửi kèm..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#003B95] transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSending || !selectedMember}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white flex items-center gap-1.5 shadow-md shadow-[#003B95]/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5 text-amber-300" />
                  <span>Gửi tin nhắn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

