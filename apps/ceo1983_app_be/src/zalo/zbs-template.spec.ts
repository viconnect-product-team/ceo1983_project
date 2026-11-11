import axios from 'axios';
import { ZaloService } from './zalo.service';
import type { PrismaService } from '../prisma/prisma.service';

jest.mock('axios');

describe('ZBS template delivery by phone', () => {
  const originalEnv = process.env;
  const post = jest.mocked(axios.post);
  let service: ZaloService;
  const templates = {
    FEE_NOTICE_ANNUAL: {
      templateId: 'approved-fee-template',
      parameterMap: { ho_ten: 'full_name', so_tien: 'fee_amount' },
    },
  };
  const request = {
    templateCode: 'FEE_NOTICE_ANNUAL',
    phone: '0901234567',
    templateData: {
      full_name: 'Nguyễn Văn An',
      fee_amount: 15000000,
      unused: 'exclude',
    },
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    post.mockReset();
    process.env = { ...originalEnv };
    delete process.env.ZALO_ZBS_TEMPLATES;
    delete process.env.ZALO_OA_ACCESS_TOKEN;
    delete process.env.ZALO_ACCESS_TOKEN;
    delete process.env.ZALO_REFRESH_TOKEN;
    service = new ZaloService();
    jest.spyOn(service, 'getOaConfig').mockResolvedValue({
      accessToken: 'server-oa-token',
      zbsTemplates: templates,
    });
    post.mockResolvedValue({
      data: { error: 0, data: { msg_id: 'message-id' } },
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('sends the selected approved template to an entered phone without a member/UID lookup', async () => {
    const sendCs = jest.spyOn(service, 'sendMessage');
    const result = await service.sendZns(request);
    expect(result.success).toBe(true);
    expect(post).toHaveBeenCalledWith(
      'https://business.openapi.zalo.me/message/template',
      {
        phone: '84901234567',
        template_id: 'approved-fee-template',
        template_data: { ho_ten: 'Nguyễn Văn An', so_tien: 15000000 },
        tracking_id: expect.stringMatching(/^[a-zA-Z0-9]{1,48}$/),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: 'server-oa-token',
        },
        timeout: 10000,
      },
    );
    expect(sendCs).not.toHaveBeenCalled();
  });

  it('uses environment mappings when the selected code is not configured in the database', async () => {
    process.env.ZALO_ZBS_TEMPLATES = JSON.stringify(templates);
    jest
      .mocked(service.getOaConfig)
      .mockResolvedValue({ accessToken: 'server-oa-token', zbsTemplates: {} });
    await service.sendZns({ ...request, phone: '+84 901 234 567' });
    expect(post.mock.calls[0][1]).toMatchObject({
      phone: '84901234567',
      template_id: 'approved-fee-template',
    });
  });

  it('prefers the stored mapping for this code over the environment mapping', async () => {
    process.env.ZALO_ZBS_TEMPLATES = JSON.stringify({
      FEE_NOTICE_ANNUAL: { templateId: 'different-template', parameterMap: {} },
    });
    await service.sendZns(request);
    expect(post.mock.calls[0][1]).toMatchObject({
      template_id: 'approved-fee-template',
    });
  });

  it.each([
    ['missing template mapping', { ...request, templateCode: 'UNCONFIGURED' }],
    [
      'missing required variable',
      { ...request, templateData: { full_name: 'Nguyễn Văn An' } },
    ],
    [
      'empty variable',
      { ...request, templateData: { full_name: '', fee_amount: 15000000 } },
    ],
    ['invalid phone', { ...request, phone: 'not-a-phone' }],
  ])('rejects %s before contacting Zalo', async (_label, payload) => {
    await expect(service.sendZns(payload)).rejects.toThrow();
    expect(post).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON configuration', async () => {
    process.env.ZALO_ZBS_TEMPLATES = '{invalid';
    await expect(
      service.sendZns({ ...request, templateCode: 'OTHER' }),
    ).rejects.toThrow('JSON hợp lệ');
    expect(post).not.toHaveBeenCalled();
  });

  it('rejects the unfilled template ID in the example configuration', async () => {
    jest.mocked(service.getOaConfig).mockResolvedValue({
      accessToken: 'server-oa-token',
      zbsTemplates: {
        FEE_NOTICE_ANNUAL: { ...templates.FEE_NOTICE_ANNUAL, templateId: '' },
      },
    });
    await expect(service.sendZns(request)).rejects.toThrow(
      'Chưa cấu hình template_id',
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('uses server environment tokens when stored token fields are blank', async () => {
    service = new ZaloService({
      $queryRawUnsafe: jest.fn().mockResolvedValue([
        { value: { accessToken: '', refreshToken: '' } },
      ]),
    } as unknown as PrismaService);
    process.env.ZALO_OA_ACCESS_TOKEN = 'environment-token';
    process.env.ZALO_REFRESH_TOKEN = 'environment-refresh-token';
    process.env.ZALO_ZBS_TEMPLATES = JSON.stringify(templates);
    expect((await service.getOaConfig()).refreshToken).toBe('environment-refresh-token');
    await service.sendZns(request);
    expect(post.mock.calls[0][2]?.headers).toMatchObject({
      access_token: 'environment-token',
    });
  });

  it('refreshes a missing access token through the existing token manager', async () => {
    jest
      .mocked(service.getOaConfig)
      .mockResolvedValue({
        refreshToken: 'refresh-token',
        zbsTemplates: templates,
      });
    const refresh = jest
      .spyOn(service, 'performAutoRefreshToken')
      .mockResolvedValue({
        ok: true,
        message: 'refreshed',
        data: { accessToken: 'new-token' },
      });
    await service.sendZns(request);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][2]?.headers).toMatchObject({
      access_token: 'new-token',
    });
  });

  it('rejects missing server credentials', async () => {
    jest
      .mocked(service.getOaConfig)
      .mockResolvedValue({ zbsTemplates: templates });
    await expect(service.sendZns(request)).rejects.toThrow(
      'Thiếu OA Access Token',
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('preserves callers that pass an explicit approved template ID and token', async () => {
    await service.sendZns({
      templateId: 'direct-template',
      phone: request.phone,
      templateData: { name: 'An' },
      accessToken: 'caller-token',
    });
    expect(post.mock.calls[0][1]).toMatchObject({
      template_id: 'direct-template',
      template_data: { name: 'An' },
    });
    expect(post.mock.calls[0][2]?.headers).toMatchObject({
      access_token: 'caller-token',
    });
  });

  it('returns Zalo rejection without reporting success or falling back to CS', async () => {
    post.mockResolvedValue({
      data: { error: -131, message: 'Template not approved' },
    });
    const sendCs = jest.spyOn(service, 'sendMessage');
    expect(await service.sendZns(request)).toMatchObject({
      success: false,
      error: -131,
    });
    expect(post).toHaveBeenCalledTimes(1);
    expect(sendCs).not.toHaveBeenCalled();
  });
});
