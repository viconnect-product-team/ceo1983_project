import { ZaloService } from './zalo.service';
import { ZaloController } from './zalo.controller';
import type { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from '../auth/roles.decorator';

describe('CRM ZBS template configuration', () => {
  const originalEnv = process.env;
  let service: ZaloService;
  let database: { $queryRawUnsafe: jest.Mock; $executeRawUnsafe: jest.Mock };
  const fee = { templateId: 'fee-id', parameterMap: { ho_ten: 'full_name' } };
  const welcome = {
    templateId: 'welcome-id',
    parameterMap: { ma_hv: 'member_code' },
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ZALO_ZBS_TEMPLATES;
    database = {
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
      $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    };
    service = new ZaloService(database as unknown as PrismaService);
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  it('loads the effective mappings without returning OA tokens or credentials', async () => {
    process.env.ZALO_ZBS_TEMPLATES = JSON.stringify({
      FEE_NOTICE_ANNUAL: fee,
      NEW_MEMBER_THANKS: welcome,
    });
    database.$queryRawUnsafe.mockResolvedValue([
      {
        templates: {
          FEE_NOTICE_ANNUAL: {
            ...fee,
            templateId: 'stored-fee-id',
            accessToken: 'must-not-return',
          },
        },
      },
    ]);
    const result = await service.getTemplateConfigurations();
    expect(result).toEqual({
      ok: true,
      templates: {
        FEE_NOTICE_ANNUAL: { ...fee, templateId: 'stored-fee-id' },
        NEW_MEMBER_THANKS: welcome,
      },
    });
    expect(JSON.stringify(result)).not.toContain('must-not-return');
    expect(database.$queryRawUnsafe.mock.calls[0][0]).toContain(
      "value->'zbsTemplates'",
    );
  });

  it('saves only the selected template in a parameterized atomic JSONB update', async () => {
    const result = await service.saveTemplateConfiguration(
      'FEE_NOTICE_ANNUAL',
      { ...fee, templateId: ' fee-id ' },
    );
    expect(result).toEqual({
      ok: true,
      templateCode: 'FEE_NOTICE_ANNUAL',
      config: fee,
    });
    const [sql, code, json, userId] = database.$executeRawUnsafe.mock.calls[0];
    expect(sql).toContain('jsonb_set(settings.value');
    expect(sql).toContain("settings.value->'zbsTemplates'");
    expect(code).toBe('FEE_NOTICE_ANNUAL');
    expect(JSON.parse(json)).toEqual(fee);
    expect(userId).toBeNull();
    expect(database.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it.each([
    ['bad CRM code', 'BAD/CODE', fee],
    ['empty ID', 'FEE_NOTICE_ANNUAL', { ...fee, templateId: '' }],
    ['invalid ID', 'FEE_NOTICE_ANNUAL', { ...fee, templateId: '<id>' }],
    ['array mapping', 'FEE_NOTICE_ANNUAL', { ...fee, parameterMap: [] }],
    [
      'empty CRM variable',
      'FEE_NOTICE_ANNUAL',
      { ...fee, parameterMap: { ho_ten: '' } },
    ],
    [
      'bracketed ZBS variable',
      'FEE_NOTICE_ANNUAL',
      { ...fee, parameterMap: { '<ho_ten>': 'full_name' } },
    ],
  ])('rejects %s before writing', async (_label, code, config) => {
    await expect(
      service.saveTemplateConfiguration(code as string, config),
    ).rejects.toThrow();
    expect(database.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('does not report success when persistence fails or is unavailable', async () => {
    database.$executeRawUnsafe.mockRejectedValue(
      new Error('database unavailable'),
    );
    await expect(
      service.saveTemplateConfiguration('FEE_NOTICE_ANNUAL', fee),
    ).rejects.toThrow('database unavailable');
    await expect(
      new ZaloService().saveTemplateConfiguration('FEE_NOTICE_ANNUAL', fee),
    ).rejects.toThrow('Chưa kết nối');
  });

  it('keeps the current ZBS mappings out of ordinary OA/token update payloads', async () => {
    jest
      .spyOn(service, 'getOaConfig')
      .mockResolvedValue({
        accessToken: 'old',
        zbsTemplates: { FEE_NOTICE_ANNUAL: fee },
      });
    await service.saveOaConfig({ accessToken: 'new' });
    const [sql, json] = database.$executeRawUnsafe.mock.calls[0];
    expect(sql).toContain('settings.value || EXCLUDED.value');
    expect(JSON.parse(json)).toMatchObject({ accessToken: 'new' });
    expect(JSON.parse(json)).not.toHaveProperty('zbsTemplates');
  });

  it('does not write stale ZBS mappings during automatic token refresh', async () => {
    jest
      .spyOn(service, 'getOaConfig')
      .mockResolvedValue({
        appId: 'app',
        secretKey: 'secret',
        accessToken: 'old',
        refreshToken: 'refresh',
        zbsTemplates: { FEE_NOTICE_ANNUAL: fee },
      });
    jest
      .spyOn(service, 'refreshToken')
      .mockResolvedValue({
        accessToken: 'new',
        refreshToken: 'new-refresh',
        expiresIn: 90000,
      } as any);
    await service.performAutoRefreshToken();
    expect(database.$executeRawUnsafe).toHaveBeenCalled();
    const json = JSON.parse(database.$executeRawUnsafe.mock.calls[0][1]);
    expect(json.accessToken).toBe('new');
    expect(json).not.toHaveProperty('zbsTemplates');
  });

  it('requires CRM roles for reading, saving and sending templates', () => {
    for (const method of [
      'getTemplateConfigurations',
      'saveTemplateConfiguration',
      'sendZns',
    ] as const) {
      expect(
        Reflect.getMetadata(ROLES_KEY, ZaloController.prototype[method]),
      ).toEqual(['admin', 'platform_admin', 'adm', 'bqt', 'btc', 'btk']);
    }
  });
});
