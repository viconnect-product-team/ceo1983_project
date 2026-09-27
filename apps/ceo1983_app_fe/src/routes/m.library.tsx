import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listDocuments, type LibraryDoc } from "@/lib/member-app.functions";
import { resolveMediaUrl } from "@/lib/api-client";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/m/library")({
  component: LibraryScreen,
});

function LibraryScreen() {
  const t = useT();
  const fetchDocs = useServerFn(listDocuments);
  const { data: docs, loading } = useServerData<LibraryDoc[]>(() => fetchDocs(), []);

  const handleOpenDoc = (d: LibraryDoc) => {
    if (!d.url) {
      toast.info("Tài liệu chưa có đường dẫn đính kèm");
      return;
    }
    const fullUrl = resolveMediaUrl(d.url) || d.url;
    toast.success(`Đang mở "${d.name}"`);
    window.open(fullUrl, "_blank");
  };

  return (
    <div className="vba-animate pb-20">
      <MemberHeader title={t("m.library.title")} back />

      <div className="mt-3 space-y-2.5 px-4">
        {loading && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.library.loading")}
          </p>
        )}
        {!loading && docs.length === 0 && (
          <p className="py-10 text-center text-[13px] text-[var(--vba-text-dim)]">
            {t("m.library.empty")}
          </p>
        )}
        {docs.map((d) => (
          <div
            key={d.id}
            onClick={() => handleOpenDoc(d)}
            className="vba-card flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer hover:border-amber-500/40 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--vba-surface-2)] text-[var(--vba-gold)]">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                  {d.name}
                </div>
                <div className="truncate text-[11px] text-[var(--vba-text-muted)]">
                  {[d.category, d.type?.toUpperCase(), d.size, d.time].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDoc(d);
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 hover:bg-[#003B95] hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Tải xuống tài liệu"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
