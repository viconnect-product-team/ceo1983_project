import { type ReactNode, useEffect, useState, useMemo } from "react";
import { X, ImagePlus, Trash2, Loader2, Check } from "lucide-react";
import { uploadFile, resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type CrudFieldOption = {
  value: string;
  label: string;
  subtitle?: string;
  avatar?: string;
};

export type CrudField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "date";
      required?: boolean;
      placeholder?: string;
    }
  | { name: string; label: string; type: "textarea"; required?: boolean; placeholder?: string }
  | {
      name: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      required?: boolean;
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "multi-select";
      options: CrudFieldOption[];
      required?: boolean;
      placeholder?: string;
    }
  | { name: string; label: string; type: "custom"; render: (value: any, onChange: (val: any) => void) => ReactNode; required?: boolean }
  | { name: string; label: string; type: "image"; required?: boolean; placeholder?: string };

export type CrudValues = Record<string, any>;

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-[var(--shadow-card)] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20";

function MultiSelectField({
  options = [],
  selected = [],
  placeholder,
  onChange,
}: {
  options: CrudFieldOption[];
  selected: string[];
  placeholder?: string;
  onChange: (selected: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const safeSelected = Array.isArray(selected) ? selected : [];

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(q)) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggle = (val: string) => {
    if (safeSelected.includes(val)) {
      onChange(safeSelected.filter((x) => x !== val));
    } else {
      onChange([...safeSelected, val]);
    }
  };

  const remove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(safeSelected.filter((x) => x !== val));
  };

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] p-2 rounded-xl border border-border bg-muted/20">
        {safeSelected.length === 0 ? (
          <span className="text-xs text-muted-foreground italic px-1">
            {placeholder || "Chưa chọn mục nào (Chọn từ danh sách bên dưới)..."}
          </span>
        ) : (
          <>
            {safeSelected.map((val) => {
              const opt = options.find((o) => o.value === val);
              const label = opt ? opt.label : val;
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary shadow-xs"
                >
                  <span className="max-w-[200px] truncate">{label}</span>
                  <button
                    type="button"
                    onClick={(e) => remove(val, e)}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition cursor-pointer text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}

            {safeSelected.length > 1 && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 text-[11px] font-bold cursor-help shadow-xs hover:bg-primary/25 transition">
                      +{safeSelected.length - 1} mục (Rê chuột xem tất cả)
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="z-50 max-w-xs rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl"
                  >
                    <div className="text-[11px] font-bold text-foreground mb-1.5 pb-1 border-b border-border">
                      Danh sách đã chọn ({safeSelected.length} mục):
                    </div>
                    <ul className="text-xs space-y-1.5 max-h-48 overflow-y-auto">
                      {safeSelected.map((val, idx) => {
                        const opt = options.find((o) => o.value === val);
                        return (
                          <li key={val} className="flex items-start gap-1.5">
                            <span className="text-primary font-bold shrink-0">{idx + 1}.</span>
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground">{opt?.label || val}</span>
                              {opt?.subtitle && (
                                <div className="text-[10px] text-muted-foreground">{opt.subtitle}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
      </div>

      {/* Search & List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-2 border-b border-border bg-muted/30">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder ? `Tìm kiếm ${placeholder.toLowerCase()}...` : "Tìm kiếm để chọn..."}
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="max-h-48 overflow-y-auto divide-y divide-border/40 p-1">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Không tìm thấy mục phù hợp
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isChecked = safeSelected.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition ${
                    isChecked
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-primary border-border focus:ring-primary cursor-pointer shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{opt.label}</div>
                    {opt.subtitle && (
                      <div className="text-[11px] text-muted-foreground truncate">{opt.subtitle}</div>
                    )}
                  </div>
                  {isChecked && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex justify-between items-center px-1 text-[11px] text-muted-foreground">
        {safeSelected.length > 1 ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help font-semibold text-primary underline decoration-dotted">
                  Đã chọn: <strong className="text-foreground">{safeSelected.length}</strong> mục (Rê chuột xem danh sách)
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="z-50 max-w-xs rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl">
                <div className="text-[11px] font-bold text-foreground mb-1 pb-1 border-b border-border">
                  Tất cả {safeSelected.length} mục đã chọn:
                </div>
                <div className="text-xs space-y-1 max-h-44 overflow-y-auto">
                  {safeSelected.map((val, idx) => {
                    const opt = options.find((o) => o.value === val);
                    return (
                      <div key={val} className="truncate">
                        {idx + 1}. {opt?.label || val}
                      </div>
                    );
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span>Đã chọn: <strong className="text-foreground">{safeSelected.length}</strong></span>
        )}
        {safeSelected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-rose-500 hover:underline cursor-pointer"
          >
            Bỏ chọn tất cả
          </button>
        )}
      </div>
    </div>
  );
}

export function CrudModal({
  open,
  title,
  fields,
  initial,
  submitting,
  submitLabel,
  cancelLabel,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  fields: CrudField[];
  initial?: CrudValues;
  submitting?: boolean;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (values: CrudValues) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<CrudValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      const base: CrudValues = {};
      for (const f of fields) {
        if (f.type === "multi-select") {
          const raw = initial?.[f.name];
          if (Array.isArray(raw)) {
            base[f.name] = raw;
          } else if (typeof raw === "string" && raw.startsWith("[")) {
            try {
              base[f.name] = JSON.parse(raw);
            } catch {
              base[f.name] = [];
            }
          } else if (raw) {
            base[f.name] = [String(raw)];
          } else {
            base[f.name] = [];
          }
        } else if (f.type === "custom") {
          base[f.name] = initial?.[f.name] ?? [];
        } else {
          base[f.name] =
            initial?.[f.name] ??
            (f.type === "number" ? 0 : f.type === "select" ? (f.placeholder ? "" : (f.options[0]?.value ?? "")) : "");
        }
      }
      setValues(base);
    }
  }, [open, initial, fields]);

  if (!open) return null;

  const set = (name: string, v: any) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const submit = () => {
    // Validate all required fields
    const validationErrors: Record<string, string> = {};
    for (const f of fields) {
      if (f.required) {
        const raw = values[f.name];
        if (f.type === "number") {
          if (raw === "" || raw === null || raw === undefined || isNaN(Number(raw))) {
            validationErrors[f.name] = `Vui lòng nhập giá trị hợp lệ cho ${f.label}`;
          }
        } else if (f.type === "multi-select") {
          if (!Array.isArray(raw) || raw.length === 0) {
            validationErrors[f.name] = `Vui lòng chọn ít nhất một mục cho ${f.label}`;
          }
        } else if (f.type === "image") {
          if (!raw || String(raw).trim() === "") {
            validationErrors[f.name] = `Vui lòng tải lên ảnh cho ${f.label}`;
          }
        } else if (f.type === "custom") {
          if (
            raw === undefined ||
            raw === null ||
            (Array.isArray(raw) && raw.length === 0) ||
            (typeof raw === "string" && raw.trim() === "")
          ) {
            validationErrors[f.name] = `Vui lòng nhập/chọn thông tin cho ${f.label}`;
          }
        } else {
          // text, textarea, select, date
          if (raw === undefined || raw === null || String(raw).trim() === "") {
            validationErrors[f.name] = `Vui lòng nhập/chọn ${f.label}`;
          }
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErr = Object.values(validationErrors)[0];
      toast.error(firstErr || "Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)");
      return;
    }

    const out: CrudValues = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (f.type === "number") {
        out[f.name] = Number(raw) || 0;
      } else if (f.type === "multi-select") {
        out[f.name] = Array.isArray(raw) ? raw : [];
      } else if (f.type === "custom") {
        out[f.name] = raw !== undefined ? raw : [];
      } else {
        out[f.name] = String(raw ?? "");
      }
    }
    onSubmit(out);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg sm:max-w-2xl rounded-2xl border border-border bg-card shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-5 flex-1">
          {fields.map((f) => {
            const hasErr = !!errors[f.name];
            const stateInputCls = `${inputCls} ${
              hasErr ? "!border-destructive !ring-2 !ring-destructive/20 focus:!border-destructive" : ""
            }`;

            return (
              <Labeled key={f.name} label={f.label} required={f.required} error={errors[f.name]}>
                {f.type === "image" ? (
                  <div className="space-y-2">
                    {values[f.name] ? (
                      <div className="relative overflow-hidden rounded-xl border border-border">
                        <img
                          src={resolveMediaUrl(String(values[f.name])) || String(values[f.name])}
                          alt="Preview"
                          className="h-40 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => set(f.name, "")}
                          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/70 text-white hover:bg-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition ${
                          hasErr
                            ? "border-destructive bg-destructive/5 hover:border-destructive"
                            : "border-border hover:border-primary/50 hover:bg-muted/40"
                        }`}
                      >
                        {uploadingImage[f.name] ? (
                          <>
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                            <span className="text-xs font-semibold text-foreground">Đang tải ảnh lên MinIO...</span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs font-semibold text-foreground">Chọn ảnh tải lên</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG hoặc WEBP</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage[f.name]}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingImage((prev) => ({ ...prev, [f.name]: true }));
                            try {
                              const uploadedUrl = await uploadFile(file, file.name);
                              if (uploadedUrl) {
                                set(f.name, uploadedUrl);
                              }
                            } catch (err: any) {
                              console.error("CrudModal upload error:", err);
                              toast.error("Không thể tải ảnh lên hệ thống MinIO: " + (err?.message || "Lỗi kết nối"));
                            } finally {
                              setUploadingImage((prev) => ({ ...prev, [f.name]: false }));
                            }
                          }}
                        />
                      </label>
                    )}
                    <input
                      type="text"
                      value={String(values[f.name] ?? "")}
                      placeholder={f.placeholder || "Hoặc dán URL ảnh trực tiếp..."}
                      onChange={(e) => set(f.name, e.target.value)}
                      className={`${stateInputCls} text-xs`}
                    />
                  </div>
                ) : f.type === "textarea" ? (
                  <textarea
                    value={String(values[f.name] ?? "")}
                    placeholder={f.placeholder || `Nhập ${typeof f.label === "string" ? f.label.toLowerCase() : "nội dung"}...`}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={`${stateInputCls} h-24 py-2`}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={String(values[f.name] ?? "")}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={`${stateInputCls} font-medium`}
                  >
                    {f.placeholder && (
                      <option value="" disabled hidden={f.required}>
                        {f.placeholder}
                      </option>
                    )}
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "custom" ? (
                  <div className={hasErr ? "rounded-xl border border-destructive p-1" : ""}>
                    {f.render(values[f.name], (val) => set(f.name, val))}
                  </div>
                ) : f.type === "multi-select" ? (
                  <div className={hasErr ? "rounded-xl border border-destructive p-1" : ""}>
                    <MultiSelectField
                      options={f.options}
                      selected={values[f.name] || []}
                      placeholder={f.placeholder}
                      onChange={(sel) => set(f.name, sel)}
                    />
                  </div>
                ) : (
                  <input
                    type={f.type}
                    value={String(values[f.name] ?? "")}
                    placeholder={f.placeholder || `Nhập ${typeof f.label === "string" ? f.label.toLowerCase() : ""}...`}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={stateInputCls}
                  />
                )}
              </Labeled>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50 cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Labeled({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="block text-xs font-semibold text-foreground">
          {label} {required && <span className="text-destructive font-bold">*</span>}
        </span>
        {error && (
          <span className="text-[11px] font-medium text-destructive animate-in fade-in">
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
