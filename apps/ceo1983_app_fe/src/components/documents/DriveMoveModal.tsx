import React, { useState } from "react";
import { X, Folder, FolderPlus, ArrowRight, CornerDownRight, Check } from "lucide-react";
import { toast } from "sonner";
import { type Document } from "@/lib/documents.functions";

interface DriveMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  allDocuments: Document[];
  onMove: (id: string, targetFolderId: string | null) => Promise<void>;
}

export const DriveMoveModal: React.FC<DriveMoveModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  allDocuments,
  onMove,
}) => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  if (!isOpen || !doc) return null;

  // Lọc ra các thư mục khác chính nó và không phải là con cháu của nó (tránh circular dependency)
  const folders = allDocuments.filter(
    (d) => (d.isFolder || d.type === "folder") && d.id !== doc.id && d.folderId !== doc.id
  );

  const handleExecuteMove = async () => {
    setMoving(true);
    try {
      await onMove(doc.id, targetId);
      toast.success(`Đã di chuyển "${doc.name}" thành công!`);
      onClose();
    } catch (err: any) {
      toast.error("Không thể di chuyển: " + (err.message || ""));
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Di chuyển vào thư mục</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                Chọn thư mục đích cho "{doc.name}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
          {/* Option: Thư mục gốc */}
          <div
            onClick={() => setTargetId(null)}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              targetId === null
                ? "border-amber-500 bg-amber-500/10 font-bold text-amber-700 dark:text-amber-400"
                : "border-border hover:bg-muted text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-amber-500" />
              <span className="text-sm">📁 Thư mục gốc (Root)</span>
            </div>
            {targetId === null && <Check className="h-4 w-4 text-amber-600" />}
          </div>

          {/* Danh sách các thư mục con */}
          {folders.map((f) => (
            <div
              key={f.id}
              onClick={() => setTargetId(f.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                targetId === f.id
                  ? "border-amber-500 bg-amber-500/10 font-bold text-amber-700 dark:text-amber-400"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="truncate text-sm">{f.name}</div>
              </div>
              {targetId === f.id && <Check className="h-4 w-4 text-amber-600 shrink-0" />}
            </div>
          ))}

          {folders.length === 0 && (
            <p className="text-center py-4 text-xs text-muted-foreground">
              Không có thư mục nào khác. Bạn có thể di chuyển ra Thư mục gốc.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/80 px-6 py-4 bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={moving}
            onClick={handleExecuteMove}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {moving ? "Đang di chuyển..." : "Di chuyển vào đây"}
          </button>
        </div>
      </div>
    </div>
  );
};

