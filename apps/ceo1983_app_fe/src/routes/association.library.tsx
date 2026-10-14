import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Download,
  Share2,
  X,
  BookOpen,
  Check,
  ExternalLink,
  Calendar,
  HardDrive,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Layers,
  Sparkles,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listDocuments, type LibraryDoc } from "@/lib/member-app.functions";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/association/library")({
  component: LibraryScreen,
});

const COMMITTEES = [
  { id: "all", label: "Tất cả các ban", icon: Layers },
  { id: "Ban Điều Hành", label: "Ban Điều Hành", icon: Building2 },
  { id: "Ban Thành Viên", label: "Ban Thành Viên", icon: Building2 },
  { id: "Ban Truyền Thông", label: "Ban Truyền Thông", icon: Building2 },
  { id: "Ban Xúc Tiến", label: "Ban Xúc Tiến", icon: Building2 },
  { id: "Ban Tài Chính", label: "Ban Tài Chính", icon: Building2 },
  { id: "Ban Thiện Nguyện", label: "Ban Thiện Nguyện", icon: Building2 },
  { id: "Ban Thư Ký", label: "Ban Thư Ký", icon: Building2 },
  { id: "Biểu mẫu chung", label: "Biểu mẫu chung", icon: Building2 },
];

const FILE_FORMATS = [
  { id: "all", label: "Mọi định dạng" },
  { id: "PDF", label: "PDF" },
  { id: "DOCX", label: "DOCX" },
  { id: "XLSX", label: "XLSX" },
  { id: "PPTX", label: "PPTX" },
];

function LibraryScreen() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === "en";
  const fetchDocs = useServerFn(listDocuments);
  const { data: docs, loading } = useServerData<LibraryDoc[]>(() => fetchDocs(), []);
  const [selectedDoc, setSelectedDoc] = useState<LibraryDoc | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommittee, setSelectedCommittee] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = (doc: LibraryDoc) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success(isEn ? `Downloading "${doc.name}"` : `Đang tải xuống tài liệu "${doc.name}"`);
      if (doc.url) {
        window.open(doc.url, "_blank");
      }
    }, 600);
  };

  const handleShare = (doc: LibraryDoc) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isEn ? "Document link copied to clipboard!" : "Đã sao chép liên kết tài liệu vào bộ nhớ tạm!");
    }
  };

  // Filter and sort documents
  const filteredDocs = useMemo(() => {
    if (!docs) return [];
    let list = [...docs];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.committee?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      );
    }

    // 2. Committee filter
    if (selectedCommittee !== "all") {
      list = list.filter((d) => (d.committee || "Biểu mẫu chung") === selectedCommittee);
    }

    // 3. Format filter
    if (selectedFormat !== "all") {
      list = list.filter((d) => (d.type || "PDF").toUpperCase().includes(selectedFormat));
    }

    // 4. Sort Newest / Oldest
    list.sort((a, b) => {
      const parseDate = (dStr?: string) => {
        if (!dStr) return 0;
        const parts = dStr.split("/");
        if (parts.length === 3) {
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
        }
        return new Date(dStr).getTime() || 0;
      };
      const timeA = parseDate(a.time);
      const timeB = parseDate(b.time);
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [docs, searchQuery, selectedCommittee, selectedFormat, sortOrder]);

  return (
    <div className="vba-animate pb-24">
      <MemberHeader title={isEn ? "Resource Library" : t("m.library.title")} back />

      {/* Search Bar & Sort Row */}
      <div className="px-4 mt-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search by document title, keywords..." : "Tìm kiếm theo tên tài liệu, từ khóa..."}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--vba-bg-2)] pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-500 shadow-xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Format Filter & Sort Toggle */}
        <div className="flex items-center justify-between gap-2">
          {/* Format pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {FILE_FORMATS.map((f) => {
              const isSelected = selectedFormat === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFormat(f.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Sort button */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--vba-bg-2)] text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs shrink-0 cursor-pointer hover:border-amber-500 transition"
          >
            <ArrowUpDown className="h-3 w-3 text-amber-500" />
            <span>{sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
          </button>
        </div>

        {/* Committee Categories Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {COMMITTEES.map((c) => {
            const isSelected = selectedCommittee === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCommittee(c.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border ${
                  isSelected
                    ? "bg-[#003B95] text-white border-[#003B95] shadow-xs"
                    : "bg-white dark:bg-[var(--vba-bg-2)] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-amber-400"
                }`}
              >
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document List */}
      <div className="mt-3 space-y-2.5 px-4">
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.library.loading")}
          </p>
        )}
        {!loading && filteredDocs.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <BookOpen className="mx-auto h-9 w-9 text-slate-400/50" />
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCommittee("all");
                setSelectedFormat("all");
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 underline cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
        {filteredDocs.map((d, idx) => {
          const ext = (d.type || "PDF").toUpperCase();
          const isPdf = ext.includes("PDF");
          const isXls = ext.includes("XLS") || ext.includes("SHEET");
          const isDoc = ext.includes("DOC");
          const isPpt = ext.includes("PPT");

          return (
            <div
              key={`${d.id || "doc"}-${idx}`}
              onClick={() => setSelectedDoc(d)}
              className="vba-card flex items-center justify-between gap-3 p-3.5 rounded-2xl cursor-pointer transition hover:border-amber-500/50 hover:shadow-md active:scale-[0.99] border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-black text-[11px] shadow-xs ${
                    isPdf
                      ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60"
                      : isXls
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60"
                      : isPpt
                      ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60"
                      : "bg-blue-50 dark:bg-blue-950/50 text-[#003B95] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60"
                  }`}
                >
                  {ext}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[9.5px]">
                      {d.committee || "Ban Điều Hành"}
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-400 truncate">{d.category}</span>
                  </div>
                  <h3 className="truncate text-[13px] font-bold text-[var(--vba-text)] leading-snug">
                    {d.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{d.size}</span>
                    <span>•</span>
                    <span>{d.time}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(d);
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 hover:bg-[#003B95] hover:text-white dark:bg-slate-800 dark:hover:bg-[#003B95] dark:hover:text-white text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title={isEn ? "Download" : "Tải xuống"}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── DOCUMENT VIEWER MODAL ── */}
      {selectedDoc && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="relative w-full max-w-[380px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-5 text-slate-900 dark:text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Document Header */}
            <div className="pr-6 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-block rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {selectedDoc.type?.toUpperCase() || "PDF"} • {selectedDoc.committee || "Ban Điều Hành"}
                </span>
                <span className="text-[10px] text-muted-foreground">{selectedDoc.category}</span>
              </div>
              <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedDoc.name}
              </h2>
              {selectedDoc.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  {selectedDoc.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Dung lượng: {selectedDoc.size}</span>
                <span>•</span>
                <span>Ngày ban hành: {selectedDoc.time}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleDownload(selectedDoc)}
                disabled={downloading}
                style={{ color: "#ffffff" }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white py-2.5 text-xs font-bold shadow-md shadow-[#003B95]/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                <span>{downloading ? (isEn ? "Downloading..." : "Đang tải...") : (isEn ? "Download file" : "Tải xuống văn bản")}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(selectedDoc)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>{isEn ? "Share" : "Chia sẻ"}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
