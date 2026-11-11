import { BadRequestException } from '@nestjs/common';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Map a CRM template code and its variables to an approved ZBS template. */
export function resolveZbsTemplate(
  templateCode: string,
  variables: JsonObject,
  storedTemplates?: unknown,
) {
  const code = templateCode.trim();
  let templates: unknown = storedTemplates;
  if (!isObject(templates) || !Object.hasOwn(templates, code)) {
    try {
      templates = JSON.parse(process.env.ZALO_ZBS_TEMPLATES || '{}');
    } catch {
      throw new BadRequestException('ZALO_ZBS_TEMPLATES phải là JSON hợp lệ');
    }
  }

  const config =
    isObject(templates) && Object.hasOwn(templates, code)
      ? templates[code]
      : undefined;
  if (
    !isObject(config) ||
    typeof config.templateId !== 'string' ||
    !config.templateId.trim()
  ) {
    throw new BadRequestException(
      `Chưa cấu hình template_id ZBS đã duyệt cho mẫu ${code}`,
    );
  }
  if (!isObject(config.parameterMap)) {
    throw new BadRequestException(
      `Chưa cấu hình parameterMap ZBS cho mẫu ${code}`,
    );
  }

  const templateData = Object.fromEntries(
    Object.entries(config.parameterMap).map(([parameter, source]) => {
      if (
        !parameter.trim() ||
        typeof source !== 'string' ||
        !Object.hasOwn(variables, source)
      ) {
        throw new BadRequestException(
          `Thiếu biến CRM cho tham số ZBS ${parameter}`,
        );
      }
      const value = variables[source];
      if (
        (typeof value !== 'string' && typeof value !== 'number') ||
        (typeof value === 'string' && !value.trim()) ||
        (typeof value === 'number' && !Number.isFinite(value))
      ) {
        throw new BadRequestException(
          `Giá trị tham số ZBS ${parameter} không hợp lệ`,
        );
      }
      return [parameter, value];
    }),
  );

  return { templateId: config.templateId.trim(), templateData };
}
