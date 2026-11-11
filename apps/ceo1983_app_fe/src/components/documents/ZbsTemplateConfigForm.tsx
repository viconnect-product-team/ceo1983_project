import { useEffect, useId, useRef } from "react";
import { Plus, Save, Send, Trash2 } from "lucide-react";
import type {
  ZbsConfigurationDraft,
  ZbsConfigurationErrors,
} from "@/hooks/useZbsTemplateConfigs";

interface Props {
  templateCode: string;
  draft: ZbsConfigurationDraft;
  variables: Array<{ key: string; label: string; example: string }>;
  sampleValues: Record<string, string>;
  dirty: boolean;
  configured: boolean;
  busy: boolean;
  loading: boolean;
  loadError: string;
  saveError?: string;
  errors?: ZbsConfigurationErrors;
  phone: string;
  onChange: (
    update: (draft: ZbsConfigurationDraft) => ZbsConfigurationDraft,
  ) => void;
  onSave: () => void;
  onSendTest: () => void;
  onRetry: () => void;
}

export function ZbsTemplateConfigForm(props: Props) {
  const {
    templateCode,
    draft,
    variables,
    sampleValues,
    dirty,
    configured,
    busy,
    loading,
    loadError,
    saveError,
    errors,
    phone,
    onChange,
    onSave,
    onSendTest,
    onRetry,
  } = props;
  const prefix = useId();
  const errorSummary = useRef<HTMLDivElement>(null);
  const invalid = Boolean(
    errors?.templateId || Object.keys(errors?.rows || {}).length,
  );
  useEffect(() => {
    if (invalid) errorSummary.current?.focus();
  }, [errors, invalid]);
  const availableVariables = variables.filter(
    (variable) => variable.key !== "vietqr_url",
  );
  const fieldClass =
    "min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60";

  return (
    <section
      aria-labelledby={`${prefix}-heading`}
      className="space-y-4 border-t border-border pt-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <h3
            id={`${prefix}-heading`}
            className="text-sm font-semibold text-foreground"
          >
            Cấu hình ZBS cho mẫu này
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Mỗi trường hợp gửi dùng một Template ID riêng. Mã mẫu:{" "}
            <code className="break-all text-foreground">{templateCode}</code>.
          </p>
        </div>
        <span role="status" className="text-xs font-medium text-foreground">
          {loading
            ? "Đang tải cấu hình…"
            : dirty
              ? "Có thay đổi chưa lưu"
              : configured
                ? "Đã cấu hình"
                : "Chưa cấu hình"}
        </span>
      </div>

      {loadError ? (
        <div role="alert" className="space-y-2 text-sm text-foreground">
          <p>Không tải được cấu hình ZBS: {loadError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 rounded-lg border border-border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring"
          >
            Tải lại cấu hình
          </button>
        </div>
      ) : null}
      {invalid ? (
        <div
          ref={errorSummary}
          role="alert"
          tabIndex={-1}
          className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <p className="font-semibold">Kiểm tra lại cấu hình trước khi lưu</p>
          <p className="mt-1">Các trường cần sửa có hướng dẫn ngay bên dưới.</p>
        </div>
      ) : null}
      {saveError ? (
        <p role="alert" className="text-sm text-foreground">
          Chưa lưu được: {saveError}. Dữ liệu bạn nhập vẫn được giữ lại.
        </p>
      ) : null}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <fieldset
          disabled={busy || loading || Boolean(loadError)}
          className="min-w-0 space-y-4"
        >
          <legend className="sr-only">
            Template và ánh xạ biến của {templateCode}
          </legend>
          <div className="space-y-1.5">
            <label
              htmlFor={`${prefix}-template-id`}
              className="block text-sm font-medium text-foreground"
            >
              Template ID đã được Zalo duyệt
            </label>
            <input
              id={`${prefix}-template-id`}
              value={draft.templateId}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors?.templateId)}
              aria-describedby={`${prefix}-id-help${errors?.templateId ? ` ${prefix}-id-error` : ""}`}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  templateId: event.target.value,
                }))
              }
              placeholder="Nhập Template ID của mẫu này"
              className={fieldClass}
            />
            <p
              id={`${prefix}-id-help`}
              className="text-xs leading-relaxed text-muted-foreground"
            >
              Lấy ID trong Quản lý Template của tài khoản ZBS, đúng OA đang kết
              nối.
            </p>
            {errors?.templateId ? (
              <p
                id={`${prefix}-id-error`}
                className="text-xs font-medium text-amber-900"
              >
                {errors.templateId}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Ánh xạ biến
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nhập tên biến của mẫu Zalo rồi chọn dữ liệu CRM tương ứng.
                </p>
              </div>
              <button
                type="button"
                disabled={draft.rows.length >= 100}
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    rows: [
                      ...current.rows,
                      { id: crypto.randomUUID(), parameter: "", source: "" },
                    ],
                  }))
                }
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-background focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
              >
                <Plus aria-hidden="true" className="size-4" /> Thêm ánh xạ
              </button>
            </div>
            {!draft.rows.length ? (
              <p className="py-2 text-sm text-muted-foreground">
                Chưa có ánh xạ. Nếu mẫu Zalo có tham số, hãy thêm đầy đủ các
                biến cần gửi.
              </p>
            ) : null}
            {draft.rows.map((row, index) => {
              const rowError = errors?.rows[row.id];
              const selected = availableVariables.find(
                (variable) => variable.key === row.source,
              );
              return (
                <div
                  key={row.id}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-border pb-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor={`${prefix}-${row.id}-parameter`}
                      className="block text-xs font-medium text-foreground"
                    >
                      Tên biến ZBS {index + 1}
                    </label>
                    <input
                      id={`${prefix}-${row.id}-parameter`}
                      value={row.parameter}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Ví dụ: ho_ten"
                      className={fieldClass}
                      aria-invalid={Boolean(rowError?.parameter)}
                      aria-describedby={
                        rowError?.parameter
                          ? `${prefix}-${row.id}-parameter-error`
                          : undefined
                      }
                      onChange={(event) =>
                        onChange((current) => ({
                          ...current,
                          rows: current.rows.map((item) =>
                            item.id === row.id
                              ? { ...item, parameter: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                    {rowError?.parameter ? (
                      <p
                        id={`${prefix}-${row.id}-parameter-error`}
                        className="text-xs font-medium text-amber-900"
                      >
                        {rowError.parameter}
                      </p>
                    ) : null}
                  </div>
                  <div className="col-start-1 min-w-0 space-y-1.5 sm:col-start-auto">
                    <label
                      htmlFor={`${prefix}-${row.id}-source`}
                      className="block text-xs font-medium text-foreground"
                    >
                      Lấy giá trị từ biến CRM {index + 1}
                    </label>
                    <select
                      id={`${prefix}-${row.id}-source`}
                      value={row.source}
                      className={fieldClass}
                      aria-invalid={Boolean(rowError?.source)}
                      aria-describedby={`${prefix}-${row.id}-example${rowError?.source ? ` ${prefix}-${row.id}-source-error` : ""}`}
                      onChange={(event) =>
                        onChange((current) => ({
                          ...current,
                          rows: current.rows.map((item) =>
                            item.id === row.id
                              ? { ...item, source: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    >
                      <option value="">Chọn biến CRM</option>
                      {row.source && !selected ? (
                        <option value={row.source}>
                          {row.source} — không có trong mẫu này
                        </option>
                      ) : null}
                      {availableVariables.map((variable) => (
                        <option key={variable.key} value={variable.key}>
                          {variable.label} — {variable.key}
                        </option>
                      ))}
                    </select>
                    <p
                      id={`${prefix}-${row.id}-example`}
                      className="break-words text-xs text-muted-foreground"
                    >
                      {selected
                        ? `Giá trị gửi thử: ${sampleValues[selected.key] ?? selected.example}`
                        : "Chọn biến để xem giá trị gửi thử."}
                    </p>
                    {rowError?.source ? (
                      <p
                        id={`${prefix}-${row.id}-source-error`}
                        className="text-xs font-medium text-amber-900"
                      >
                        {rowError.source}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Xóa ánh xạ ${index + 1}`}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        rows: current.rows.filter((item) => item.id !== row.id),
                      }))
                    }
                    className="col-start-2 row-start-1 min-h-11 min-w-11 self-end rounded-lg text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring sm:col-start-3"
                  >
                    <Trash2 aria-hidden="true" className="mx-auto size-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Số nhận thử:{" "}
              <span className="font-medium text-foreground">
                {phone.trim() || "Chưa nhập số điện thoại"}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
              >
                <Save aria-hidden="true" className="size-4" />{" "}
                {busy ? "Đang xử lý…" : "Lưu cấu hình ZBS"}
              </button>
              <button
                type="button"
                onClick={onSendTest}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
              >
                <Send aria-hidden="true" className="size-4" /> Lưu và gửi thử
                ZBS
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
