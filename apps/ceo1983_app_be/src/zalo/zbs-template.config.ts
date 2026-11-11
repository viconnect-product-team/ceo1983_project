import { BadRequestException } from '@nestjs/common';

type JsonObject = Record<string, unknown>;

export interface ZbsTemplateConfiguration {
  templateId: string;
  parameterMap: Record<string, string>;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateZbsTemplateCode(code: string) {
  if (
    typeof code !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(code)
  ) {
    throw new BadRequestException('Mã mẫu CRM không hợp lệ');
  }
  return code;
}

export function normalizeZbsTemplateConfiguration(
  config: unknown,
  allowEmptyId = false,
): ZbsTemplateConfiguration {
  if (!isObject(config) || typeof config.templateId !== 'string') {
    throw new BadRequestException('Nhập Template ID của mẫu ZBS đã được duyệt');
  }
  const templateId = config.templateId.trim();
  if (
    (!templateId && !allowEmptyId) ||
    (templateId && !/^[A-Za-z0-9_-]{1,128}$/.test(templateId))
  ) {
    throw new BadRequestException('Template ID ZBS không hợp lệ');
  }
  if (!isObject(config.parameterMap)) {
    throw new BadRequestException('Ánh xạ biến ZBS phải là một object');
  }
  const entries = Object.entries(config.parameterMap);
  if (entries.length > 100) {
    throw new BadRequestException(
      'Mỗi mẫu chỉ được cấu hình tối đa 100 ánh xạ biến',
    );
  }
  const parameterMap = Object.fromEntries(
    entries.map(([parameter, source]) => {
      if (
        !parameter.trim() ||
        parameter.length > 100 ||
        /[\s<>\[\]{}]/.test(parameter) ||
        typeof source !== 'string' ||
        !source.trim() ||
        source.length > 100
      ) {
        throw new BadRequestException(
          'Mỗi biến ZBS cần tên không có dấu ngoặc và một biến CRM tương ứng',
        );
      }
      return [parameter, source.trim()];
    }),
  );
  return { templateId, parameterMap };
}

export function getZbsTemplateConfigurations(storedTemplates?: unknown) {
  let environmentTemplates: unknown;
  try {
    environmentTemplates = JSON.parse(process.env.ZALO_ZBS_TEMPLATES || '{}');
  } catch {
    throw new BadRequestException('ZALO_ZBS_TEMPLATES phải là JSON hợp lệ');
  }
  if (!isObject(environmentTemplates)) {
    throw new BadRequestException('ZALO_ZBS_TEMPLATES phải là một object');
  }
  const merged = {
    ...environmentTemplates,
    ...(isObject(storedTemplates) ? storedTemplates : {}),
  };
  return Object.fromEntries(
    Object.entries(merged).map(([code, config]) => [
      validateZbsTemplateCode(code),
      normalizeZbsTemplateConfiguration(config, true),
    ]),
  );
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
