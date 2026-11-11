import { useCallback, useEffect, useState } from "react";
import { fetchNestApi } from "@/lib/api-client";

export interface ZbsConfiguration {
  templateId: string;
  parameterMap: Record<string, string>;
}

export interface ZbsMappingRow {
  id: string;
  parameter: string;
  source: string;
}

export interface ZbsConfigurationDraft {
  templateId: string;
  rows: ZbsMappingRow[];
}

export interface ZbsConfigurationErrors {
  templateId?: string;
  rows: Record<string, { parameter?: string; source?: string }>;
}

const EMPTY_DRAFT: ZbsConfigurationDraft = { templateId: "", rows: [] };

function toDraft(config?: ZbsConfiguration): ZbsConfigurationDraft {
  return {
    templateId: config?.templateId || "",
    rows: Object.entries(config?.parameterMap || {}).map(
      ([parameter, source], index) => ({
        id: `stored-${index}`,
        parameter,
        source,
      }),
    ),
  };
}

function signature(draft: ZbsConfigurationDraft) {
  return JSON.stringify([
    draft.templateId.trim(),
    draft.rows.map((row) => [row.parameter.trim(), row.source]),
  ]);
}

export function useZbsTemplateConfigs() {
  const [configs, setConfigs] = useState<Record<string, ZbsConfiguration>>({});
  const [drafts, setDrafts] = useState<Record<string, ZbsConfigurationDraft>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, ZbsConfigurationErrors>>(
    {},
  );
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    fetchNestApi<{ ok: boolean; templates: Record<string, ZbsConfiguration> }>(
      "/zalo/template-configs",
    )
      .then((result) => {
        if (!result?.ok || !result.templates)
          throw new Error("Không tải được cấu hình ZBS");
        if (!active) return;
        setConfigs(result.templates);
        setDrafts(
          Object.fromEntries(
            Object.entries(result.templates).map(([code, config]) => [
              code,
              toDraft(config),
            ]),
          ),
        );
      })
      .catch((error: unknown) => {
        if (active)
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không tải được cấu hình ZBS",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const draftFor = (code: string) => drafts[code] || EMPTY_DRAFT;
  const isDirty = (code: string) =>
    signature(draftFor(code)) !== signature(toDraft(configs[code]));
  const updateDraft = useCallback(
    (
      code: string,
      update: (draft: ZbsConfigurationDraft) => ZbsConfigurationDraft,
    ) => {
      setDrafts((current) => ({
        ...current,
        [code]: update(current[code] || EMPTY_DRAFT),
      }));
      setSaveErrors((current) => ({ ...current, [code]: "" }));
    },
    [],
  );

  const save = async (
    code: string,
    availableVariables: string[],
    force = true,
  ) => {
    if (loading || loadError)
      throw new Error(loadError || "Đang tải cấu hình ZBS, vui lòng chờ");
    const draft = draftFor(code);
    const validation: ZbsConfigurationErrors = { rows: {} };
    const id = draft.templateId.trim();
    if (!id)
      validation.templateId =
        "Nhập Template ID đã được Zalo duyệt cho mẫu này.";
    else if (!/^[A-Za-z0-9_-]{1,128}$/.test(id))
      validation.templateId =
        "Template ID không được chứa khoảng trắng hoặc dấu ngoặc.";
    const counts = new Map<string, number>();
    draft.rows.forEach((row) =>
      counts.set(
        row.parameter.trim(),
        (counts.get(row.parameter.trim()) || 0) + 1,
      ),
    );
    draft.rows.forEach((row) => {
      const rowErrors: { parameter?: string; source?: string } = {};
      const parameter = row.parameter.trim();
      if (
        !parameter ||
        parameter.length > 100 ||
        /[\s<>\[\]{}]/.test(parameter)
      )
        rowErrors.parameter =
          "Nhập tên biến ZBS, không kèm dấu ngoặc hoặc khoảng trắng.";
      else if ((counts.get(parameter) || 0) > 1)
        rowErrors.parameter =
          "Tên biến ZBS bị trùng. Mỗi biến chỉ được ánh xạ một lần.";
      if (!availableVariables.includes(row.source))
        rowErrors.source = "Chọn một biến có trong mẫu CRM này.";
      if (rowErrors.parameter || rowErrors.source)
        validation.rows[row.id] = rowErrors;
    });
    setErrors((current) => ({ ...current, [code]: validation }));
    if (validation.templateId || Object.keys(validation.rows).length) {
      throw new Error("Kiểm tra lại các trường cấu hình ZBS được đánh dấu.");
    }
    if (!force && !isDirty(code) && configs[code]) return configs[code];
    const config: ZbsConfiguration = {
      templateId: id,
      parameterMap: Object.fromEntries(
        draft.rows.map((row) => [row.parameter.trim(), row.source]),
      ),
    };
    setSavingCode(code);
    setSaveErrors((current) => ({ ...current, [code]: "" }));
    try {
      const result = await fetchNestApi<{
        ok: boolean;
        config: ZbsConfiguration;
        message?: string;
      }>(`/zalo/template-configs/${encodeURIComponent(code)}`, {
        method: "PUT",
        body: JSON.stringify(config),
      });
      if (!result?.ok || !result.config)
        throw new Error(result?.message || "Không lưu được cấu hình ZBS");
      setConfigs((current) => ({ ...current, [code]: result.config }));
      setDrafts((current) => ({ ...current, [code]: toDraft(result.config) }));
      return result.config;
    } catch (error) {
      setSaveErrors((current) => ({
        ...current,
        [code]:
          error instanceof Error
            ? error.message
            : "Không lưu được cấu hình ZBS",
      }));
      throw error;
    } finally {
      setSavingCode(null);
    }
  };

  return {
    draftFor,
    isDirty,
    updateDraft,
    save,
    loading,
    loadError,
    savingCode,
    errors,
    saveErrors,
    configs,
    reload: () => setReloadKey((value) => value + 1),
  };
}
